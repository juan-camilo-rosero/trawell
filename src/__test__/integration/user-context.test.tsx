// src/__test__/integration/user-context.test.tsx
import { renderHook, waitFor, act } from '@testing-library/react';
import { useUser, UserProvider } from '@/contexts/UserContext';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

// Mock Firebase
jest.mock('@/lib/firebase.config', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((_, callback: (user: FirebaseUser | null) => void) => {
    callback(null);
    return jest.fn();
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('UserContext Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  test('inicializa con valores por defecto', async () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.firebaseUser).toBeNull();
    expect(result.current.userData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('carga datos del usuario cuando Firebase auth cambia', async () => {
    const mockUserData = {
      _id: 'user123',
      firebaseUid: 'firebase123',
      email: 'test@test.com',
      name: 'Test User',
      hasCompletedOnboarding: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          users: [mockUserData],
        },
      }),
    });

    const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;
    mockOnAuthStateChanged.mockImplementation((_, callback: (user: FirebaseUser | null) => void) => {
      callback({ uid: 'firebase123', email: 'test@test.com' } as FirebaseUser);
      return jest.fn();
    });

    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    await waitFor(() => {
      expect(result.current.userData).toEqual(mockUserData);
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users?firebaseUid=firebase123')
    );
  });

  test('maneja errores al cargar datos del usuario', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;
    mockOnAuthStateChanged.mockImplementation((_, callback: (user: FirebaseUser | null) => void) => {
      callback({ uid: 'firebase123' } as FirebaseUser);
      return jest.fn();
    });

    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.userData).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  test('updateUserData actualiza los datos correctamente', async () => {
    const mockUserData = {
      _id: 'user123',
      firebaseUid: 'firebase123',
      email: 'test@test.com',
      name: 'Test User',
      hasCompletedOnboarding: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { users: [mockUserData] },
      }),
    });

    const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;
    mockOnAuthStateChanged.mockImplementation((_, callback: (user: FirebaseUser | null) => void) => {
      callback({ uid: 'firebase123' } as FirebaseUser);
      return jest.fn();
    });

    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    await waitFor(() => {
      expect(result.current.userData).toEqual(mockUserData);
    });

    act(() => {
      result.current.updateUserData({ hasCompletedOnboarding: true });
    });

    expect(result.current.userData?.hasCompletedOnboarding).toBe(true);
  });

  test('clearUserData limpia los datos correctamente', async () => {
    const mockUserData = {
      _id: 'user123',
      firebaseUid: 'firebase123',
      email: 'test@test.com',
      name: 'Test User',
      hasCompletedOnboarding: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { users: [mockUserData] },
      }),
    });

    const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;
    mockOnAuthStateChanged.mockImplementation((_, callback: (user: FirebaseUser | null) => void) => {
      callback({ uid: 'firebase123' } as FirebaseUser);
      return jest.fn();
    });

    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    await waitFor(() => {
      expect(result.current.userData).toEqual(mockUserData);
    });

    act(() => {
      result.current.clearUserData();
    });

    await waitFor(() => {
      expect(result.current.userData).toBeNull();
    });
    expect(result.current.error).toBeNull();
  });

  test('refreshUserData recarga los datos del usuario', async () => {
    const mockUserData1 = {
      _id: 'user123',
      firebaseUid: 'firebase123',
      email: 'test@test.com',
      name: 'Test User',
      hasCompletedOnboarding: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const mockUserData2 = {
      ...mockUserData1,
      hasCompletedOnboarding: true,
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { users: [mockUserData1] },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { users: [mockUserData2] },
        }),
      });

    const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;
    mockOnAuthStateChanged.mockImplementation((_, callback: (user: FirebaseUser | null) => void) => {
      callback({ uid: 'firebase123' } as FirebaseUser);
      return jest.fn();
    });

    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider,
    });

    await waitFor(() => {
      expect(result.current.userData?.hasCompletedOnboarding).toBe(false);
    });

    await result.current.refreshUserData();

    await waitFor(() => {
      expect(result.current.userData?.hasCompletedOnboarding).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});