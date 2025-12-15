'use client';

import { Button } from '@/components/ui/button';
import { Settings, Bell, Trash2, Info } from 'lucide-react';
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
  
  const [tripUpdatesLocal, setTripUpdatesLocal] = useState(settings.tripUpdates);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync with context
  useEffect(() => {
    setTripUpdatesLocal(settings.tripUpdates);
    setHasChanges(false);
  }, [settings]);

  const handleTripUpdatesChange = () => {
    const newValue = !tripUpdatesLocal;
    setTripUpdatesLocal(newValue);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings({ ...settings, tripUpdates: tripUpdatesLocal });
    setHasChanges(false);
    showNotification(
      'success',
      'Settings saved',
      'Your notification preferences have been updated.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <SettingsSection
        title="Notifications"
        description="Control how and when you want to receive notifications"
        icon={<Bell className="w-6 h-6" />}
      >
        <div className="space-y-4">
          {/* Warning banner when notifications are disabled */}
          {!settings.tripUpdates && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              <Info className="w-4 h-4" />
              <span>You have disabled push notifications. You will not receive alerts in the app.</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label htmlFor="trip-updates" className="text-sm text-gray-700">
              <div>Trip Updates</div>
              <div className="text-xs text-gray-500 mt-1">Control in-app pop-up notifications</div>
            </label>
            <input
              type="checkbox"
              id="trip-updates"
              checked={tripUpdatesLocal}
              onChange={handleTripUpdatesChange}
              className="w-4 h-4 orange-checkbox"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            {hasChanges ? 'Save changes' : 'Saved'}
          </Button>
        </div>
      </SettingsSection>

      {/* Account */}
      <SettingsSection
        title="Account"
        description="Advanced account options"
        icon={<Settings className="w-6 h-6" />}
      >
        <div className="space-y-4">
          <div className="p-4 bg-secondary-100 rounded-lg">
            <p className="text-sm text-primary">
              To change your password, enter your current password and the new password you wish to use.
            </p>
          </div>
          <ChangePassword email={userData?.email} />
        </div>
      </SettingsSection>

      {/* Delete Account */}
      <SettingsSection
        title="Delete Account"
        description="This action is permanent and cannot be undone"
        icon={<Trash2 className="w-6 h-6 text-primary" />}
      >
        <div className="space-y-4">
          <div className="p-4 bg-secondary-100 rounded-lg">
            <p className="text-sm text-primary">
              Deleting your account will permanently erase all your data, trips, and preferences.
            </p>
          </div>
          <DeleteAccount email={userData?.email} />
        </div>
      </SettingsSection>
    </div>
  );
}