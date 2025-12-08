'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/firebase.config';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

interface DeleteAccountProps {
  email?: string;
}

export function DeleteAccount({ email }: DeleteAccountProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { clearUserData } = useUser();

  const handleDeleteAccount = async () => {
    setError(null);

    if (!confirmText || confirmText !== 'ELIMINAR MI CUENTA') {
      setError('Debes escribir exactamente "ELIMINAR MI CUENTA" para confirmar');
      return;
    }

    if (!password.trim()) {
      setError('Debes ingresar tu contraseña para confirmar');
      return;
    }

    setIsLoading(true);

    try {
      const user = auth.currentUser;

      if (!user || !email) {
        setError('Usuario no encontrado');
        return;
      }

      // Reautenticar antes de eliminar
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);

      // Llamar a API para eliminar datos en MongoDB
      const response = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la cuenta en la base de datos');
      }

      // Eliminar usuario de Firebase
      await deleteUser(user);

      // Limpiar contexto
      clearUserData();

      // Redirigir a inicio
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la cuenta';

      if (errorMessage.includes('wrong-password')) {
        setError('La contraseña es incorrecta');
      } else if (errorMessage.includes('requires-recent-login')) {
        setError('Por favor, inicia sesión nuevamente antes de eliminar tu cuenta');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="bg-red-600 hover:bg-red-700"
      >
        Eliminar mi cuenta
      </Button>
    );
  }

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          {!confirmStep ? (
            <>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                ⚠️ Eliminar cuenta
              </h2>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium mb-3">
                    Esta acción es <strong>PERMANENTE</strong> e <strong>IRREVERSIBLE</strong>
                  </p>
                  <ul className="text-xs text-red-700 space-y-2 list-disc list-inside">
                    <li>Se borrarán todos tus datos personales</li>
                    <li>Se eliminarán todos tus viajes e itinerarios</li>
                    <li>Se perderán tus preferencias y configuraciones</li>
                    <li>No podrás recuperar esta información</li>
                  </ul>
                </div>

                <p className="text-sm text-gray-700">
                  ¿Realmente deseas eliminar tu cuenta y todos tus datos?
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setConfirmStep(false);
                    setPassword('');
                    setConfirmText('');
                    setError(null);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmStep(true)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Continuar
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Confirmar eliminación
              </h2>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escribe &quot;ELIMINAR MI CUENTA&quot; para confirmar
                  </label>
                  <Input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder="ELIMINAR MI CUENTA"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Debe ser exacto (mayúsculas)
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setConfirmStep(false);
                    setPassword('');
                    setConfirmText('');
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Atrás
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={
                    isLoading ||
                    !password ||
                    confirmText !== 'ELIMINAR MI CUENTA'
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Eliminando...' : 'Eliminar cuenta'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
