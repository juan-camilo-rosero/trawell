// src/__test__/integration/02-notification-context.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '@/contexts/NotificationContext';
import toast from 'react-hot-toast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  success: jest.fn(),
  error: jest.fn(),
}));

describe('NotificationContext Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('inicializa con configuración por defecto', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: NotificationProvider,
    });

    expect(result.current.settings.emailNotifications).toBe(true);
    expect(result.current.settings.tripUpdates).toBe(true);
    expect(result.current.settings.recommendations).toBe(true);
  });

  test('carga configuración desde localStorage', () => {
    const savedSettings = {
      emailNotifications: false,
      tripUpdates: true,
      recommendations: false,
    };

    localStorage.setItem('trawell_notification_settings', JSON.stringify(savedSettings));

    const { result } = renderHook(() => useNotifications(), {
      wrapper: NotificationProvider,
    });

    waitFor(() => {
      expect(result.current.settings).toEqual(savedSettings);
    });
  });

  test('actualiza configuración y guarda en localStorage', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: NotificationProvider,
    });

    act(() => {
      result.current.updateSettings({ emailNotifications: false });
    });

    expect(result.current.settings.emailNotifications).toBe(false);
    
    const saved = localStorage.getItem('trawell_notification_settings');
    expect(saved).toBeTruthy();
    const parsed = JSON.parse(saved!);
    expect(parsed.emailNotifications).toBe(false);
  });

  test('showNotification muestra toast cuando tripUpdates está activo', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: NotificationProvider,
    });

    act(() => {
      result.current.showNotification('success', 'Test message', 'Test description');
    });

    expect(toast.success).toHaveBeenCalled();
  });

  test('showNotification NO muestra toast cuando tripUpdates está desactivado', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: NotificationProvider,
    });

    act(() => {
      result.current.updateSettings({ tripUpdates: false });
    });

    act(() => {
      result.current.showNotification('success', 'Test message');
    });

    expect(toast.success).not.toHaveBeenCalled();
  });

  test('showItinerarySaved muestra notificación con ciudad correcta', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: NotificationProvider,
    });

    act(() => {
      result.current.showItinerarySaved('Cartagena');
    });

    expect(toast.success).toHaveBeenCalled();
  });

  test('showItinerarySaved NO muestra cuando tripUpdates está desactivado', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: NotificationProvider,
    });

    act(() => {
      result.current.updateSettings({ tripUpdates: false });
    });

    act(() => {
      result.current.showItinerarySaved('Cartagena');
    });

    expect(toast.success).not.toHaveBeenCalled();
  });

  test('showNotification con diferentes tipos llama toast correcto', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: NotificationProvider,
    });

    // Success
    act(() => {
      result.current.showNotification('success', 'Success msg');
    });
    expect(toast.success).toHaveBeenCalledTimes(1);

    // Error
    act(() => {
      result.current.showNotification('error', 'Error msg');
    });
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  test('configuración persiste entre re-renders', () => {
    const { result, rerender } = renderHook(() => useNotifications(), {
      wrapper: NotificationProvider,
    });

    act(() => {
      result.current.updateSettings({ 
        emailNotifications: false,
        recommendations: false 
      });
    });

    rerender();

    expect(result.current.settings.emailNotifications).toBe(false);
    expect(result.current.settings.recommendations).toBe(false);
    expect(result.current.settings.tripUpdates).toBe(true);
  });
});