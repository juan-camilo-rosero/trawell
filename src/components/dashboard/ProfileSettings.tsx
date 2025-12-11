'use client';

import { useState, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import {
  updateUserProfile,
  imageToBase64,
  isValidImageFile,
} from '@/lib/services/user.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface ProfileSettingsProps {
  onSaved?: () => void;
}

export default function ProfileSettings({ onSaved }: ProfileSettingsProps) {
  const { userData, setUserData, isLoading: contextLoading } = useUser();
  const [name, setName] = useState(userData?.name || '');
  const [originCity, setOriginCity] = useState(userData?.originCity || null);
  const [originCityInput, setOriginCityInput] = useState(
    userData?.originCity?.name || ""
  );
  const [profileImage, setProfileImage] = useState<string>(
    userData?.profileImage || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      isValidImageFile(file);
      const base64 = await imageToBase64(file);
      setProfileImage(base64);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la imagen';
      setError(errorMessage);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!userData?.firebaseUid) {
      setError('No se encontró el usuario');
      return;
    }

    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
     const updatedUser = await updateUserProfile(userData.firebaseUid, {
       name: name.trim(),
       profileImage: profileImage || undefined,
       originCity,
     });

      // Actualizar el contexto con los nuevos datos
      if (setUserData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setUserData(updatedUser as any);
      }

      setSuccess(true);
      if (onSaved) {
        onSaved();
      }

      // Limpiar el mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar el perfil';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isChanged =
    name !== userData?.name || profileImage !== userData?.profileImage;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Configuración de Perfil
        </h2>

        {/* Avatar Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Foto de Perfil
          </label>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profileImage} alt={name} />
              <AvatarFallback className="bg-primary text-white text-lg font-semibold">
                {initials || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Subir Imagen
              </Button>
              <p className="text-xs text-gray-500">
                JPG, PNG o WebP. Máximo 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Name Section */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full"
            disabled={isLoading || contextLoading}
          />
        </div>

        {/* Email (Read-only) */}
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email (No se puede cambiar)
          </label>
          <Input
            id="email"
            type="email"
            value={userData?.email || ''}
            disabled
            className="w-full bg-gray-50 cursor-not-allowed"
          />
        </div>
        {/* Origin city*/}
       <div className="mb-6">
         <label className="block text-sm font-medium text-gray-700 mb-2">
           Ciudad de Origen
         </label>
         <CityAutocomplete
           value={originCityInput}
             onChange={(value, cityData) => {
               setOriginCityInput(value);
             if (cityData) {
               setOriginCity(cityData);
             } else {
               setOriginCity(null);
             }
           }}
           showMapIcon
           showClearIcon
         />
       </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">Perfil actualizado correctamente</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setName(userData?.name || '');
              setProfileImage(userData?.profileImage || '');
              setOriginCity(userData?.originCity || null);
              setError(null);
            }}
            disabled={!isChanged || isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveProfile}
            disabled={!isChanged || isLoading || contextLoading}
            className="gap-2"
            variant="outline"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}
