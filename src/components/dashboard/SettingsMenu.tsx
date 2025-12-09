'use client';

import { Button } from '@/components/ui/button';
import { Settings, Bell, Lock, Trash2 } from 'lucide-react';
import { ChangePassword } from '@/components/dashboard/ChangePassword';
import { DeleteAccount } from '@/components/dashboard/DeleteAccount';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useState, useEffect } from 'react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

function SettingsSection({ title, description, children, icon }: SettingsSectionProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 text-primary">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="ml-10">{children}</div>
    </div>
  );
}

export function SettingsMenu() {
  const { userData } = useUser();
  const { settings, updateSettings, showNotification } = useNotifications();
  
  // Estados locales para los checkboxes
  const [localSettings, setLocalSettings] = useState(settings);

  // Sincronizar con el contexto cuando cambie
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleCheckboxChange = (key: keyof typeof settings) => {
    const newValue = !localSettings[key];
    setLocalSettings((prev) => ({ ...prev, [key]: newValue }));
  };

  const handleSaveNotifications = () => {
    updateSettings(localSettings);
    showNotification(
      'success',
      'Configuración guardada',
      'Tus preferencias de notificaciones han sido actualizadas.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Notificaciones */}
      <SettingsSection
        title="Notificaciones"
        description="Controla cómo y cuándo deseas recibir notificaciones"
        icon={<Bell className="w-6 h-6" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="email-notifications" className="text-sm text-gray-700">
              Notificaciones por correo electrónico
            </label>
            <input
              type="checkbox"
              id="email-notifications"
              checked={localSettings.emailNotifications}
              onChange={() => handleCheckboxChange('emailNotifications')}
              className="w-4 h-4 orange-checkbox"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="trip-updates" className="text-sm text-gray-700">
              Actualizaciones de viajes
            </label>
            <input
              type="checkbox"
              id="trip-updates"
              checked={localSettings.tripUpdates}
              onChange={() => handleCheckboxChange('tripUpdates')}
              className="w-4 h-4 orange-checkbox"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="recommendations" className="text-sm text-gray-700">
              Recomendaciones personalizadas
            </label>
            <input
              type="checkbox"
              id="recommendations"
              checked={localSettings.recommendations}
              onChange={() => handleCheckboxChange('recommendations')}
              className="w-4 h-4 orange-checkbox"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={handleSaveNotifications}
          >
            Guardar cambios
          </Button>
        </div>
      </SettingsSection>

      {/* Cuenta */}
      <SettingsSection
        title="Cuenta"
        description="Opciones avanzadas de la cuenta"
        icon={<Settings className="w-6 h-6" />}
      >
        <div className="space-y-4">
          <div className="p-4 bg-secondary-100 rounded-lg">
            <p className="text-sm text-primary">
              Para cambiar tu contraseña, ingresa tu contraseña actual y la nueva contraseña que deseas utilizar.
            </p>
          </div>
          <ChangePassword email={userData?.email} />

        </div>
      </SettingsSection>

      {/* Eliminar cuenta */}
      <SettingsSection
        title="Eliminar cuenta"
        description="Esta acción es permanente y no puede revertirse"
        icon={<Trash2 className="w-6 h-6 text-primary" />}
      >
        <div className="space-y-4">
          <div className="p-4 bg-secondary-100 rounded-lg">
            <p className="text-sm text-primary">
              Al eliminar tu cuenta, se borrarán permanentemente todos tus datos, viajes y preferencias.
            </p>
          </div>
          <DeleteAccount email={userData?.email} />
        </div>
      </SettingsSection>
    </div>
  );
}