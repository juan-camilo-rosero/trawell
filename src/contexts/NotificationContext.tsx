// src/contexts/NotificationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  tripUpdates: boolean;
  recommendations: boolean;
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  showNotification: (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    description?: string
  ) => void;
  showItinerarySaved: (destinationCity: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const STORAGE_KEY = 'trawell_notification_settings';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    tripUpdates: true,
    recommendations: true,
  });

  // Cargar configuración del localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading notification settings:', e);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const showNotification = (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    description?: string
  ) => {
    // Solo mostrar si las notificaciones de actualizaciones de viajes están activadas
    if (!settings.tripUpdates) return;

    const content = (
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="font-semibold text-sm">{message}</p>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
    );

    const options = {
      duration: 4000,
      style: {
        background: '#fff',
        color: '#374151',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
      },
    };

    switch (type) {
      case 'success':
        toast.success(content, {
          ...options,
          icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
          style: {
            ...options.style,
            background: '#fef3e2',
            border: '1px solid #f59e0b',
          },
        });
        break;
      case 'error':
        toast.error(content, {
          ...options,
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          style: {
            ...options.style,
            background: '#fef2f2',
            border: '1px solid #fecaca',
          },
        });
        break;
      case 'info':
        toast(content, {
          ...options,
          icon: <Info className="w-5 h-5 text-blue-600" />,
          style: {
            ...options.style,
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
          },
        });
        break;
      case 'warning':
        toast(content, {
          ...options,
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          style: {
            ...options.style,
            background: '#fefce8',
            border: '1px solid #fde047',
          },
        });
        break;
    }
  };

  const showItinerarySaved = (destinationCity: string) => {
    if (!settings.tripUpdates) return;

    toast.success(
      (t) => (
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-semibold text-sm">¡Itinerario guardado exitosamente!</p>
            <p className="text-xs text-gray-600 mt-1">
              Tu viaje a {destinationCity} ha sido guardado y está listo para explorar.
            </p>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                window.location.href = '/dashboard/itineraries';
              }}
              className="mt-2 text-xs font-medium text-primary hover:text-primary/80 underline"
            >
              Ver itinerarios →
            </button>
          </div>
        </div>
      ),
      {
        duration: 6000,
        icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        style: {
          background: '#fef3e2',
          color: '#374151',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f59e0b',
        },
      }
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        settings,
        updateSettings,
        showNotification,
        showItinerarySaved,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}