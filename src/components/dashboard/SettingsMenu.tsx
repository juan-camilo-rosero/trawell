'use client';

import { Button } from '@/components/ui/button';
import { Settings, Bell, Lock, Trash2 } from 'lucide-react';
import { ChangePassword } from '@/components/dashboard/ChangePassword';
import { DeleteAccount } from '@/components/dashboard/DeleteAccount';
import { useUser } from '@/contexts/UserContext';

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
              defaultChecked
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
              defaultChecked
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
              defaultChecked
              className="w-4 h-4 orange-checkbox"
            />
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            Guardar cambios
          </Button>
        </div>
      </SettingsSection>

      {/* Privacidad */}
      <SettingsSection
        title="Privacidad"
        description="Gestiona tu privacidad y datos personales"
        icon={<Lock className="w-6 h-6" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="profile-public" className="text-sm text-gray-700">
              Perfil público
            </label>
            <input
              type="checkbox"
              id="profile-public"
              className="w-4 h-4 orange-checkbox"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="show-trips" className="text-sm text-gray-700">
              Mostrar mis viajes a otros usuarios
            </label>
            <input
              type="checkbox"
              id="show-trips"
              className="w-4 h-4 orange-checkbox"
            />
          </div>
          <div className="pt-4">
            <Button variant="outline" size="sm">
              Descargar mis datos
            </Button>
          </div>
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
          <Button variant="outline" size="sm">
            Ver historial de inicio de sesión
          </Button>
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
