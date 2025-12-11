// src/__test__/integration/itinerary-context.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { ItineraryProvider, useItinerary, ItineraryData } from '@/contexts/ItineraryContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import React from 'react';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: {
      uid: 'test-user-123',
      email: 'test@test.com',
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    },
  }),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

global.fetch = jest.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>
    <ItineraryProvider>{children}</ItineraryProvider>
  </NotificationProvider>
);

describe('ItineraryContext Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    mockPush.mockClear();
  });

  test('inicializa con estado vacío', () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    expect(result.current.itinerary).toBeNull();
    expect(result.current.itineraries).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.mapMarkers).toEqual([]);
  });

  test('clearItinerary limpia todo el estado', () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    act(() => {
      result.current.clearItinerary();
    });

    expect(result.current.itinerary).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.mapMarkers).toEqual([]);
  });

  test('selectItineraryVariant retorna false para índice inválido', async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    act(() => {
      result.current.selectItineraryVariant(999);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Variante no encontrada');
    });
  });

  test('loadItinerary carga un itinerario por ID', async () => {
    const mockItinerary: ItineraryData = {
      _id: 'itinerary-123',
      userId: 'test-user',
      title: 'Viaje a Cartagena',
      totalPrice: 2000000,
      currency: 'COP',
      isPublic: false,
      days: [],
      searchParams: {
        originCity: {
          name: 'Bogotá',
          coordinates: { lat: 4.7110, lng: -74.0721 },
        },
        destinationCity: {
          name: 'Cartagena',
          coordinates: { lat: 10.3910, lng: -75.4794 },
        },
        departureDate: new Date('2024-12-20'),
        returnDate: new Date('2024-12-25'),
        travelers: { adults: 2, children: 0, babies: 0 },
        travelType: 'cultural',
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          itinerary: mockItinerary,
        },
      }),
    });

    const { result } = renderHook(() => useItinerary(), { wrapper });

    await act(async () => {
      await result.current.loadItinerary('itinerary-123');
    });

    await waitFor(() => {
      expect(result.current.itinerary).toEqual(mockItinerary);
      expect(result.current.isLoading).toBe(false);
    });
  });

  test('loadItinerary maneja errores correctamente', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useItinerary(), { wrapper });

    await act(async () => {
      await result.current.loadItinerary('itinerary-123');
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.itinerary).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  test('deleteItinerary elimina correctamente', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({
        success: true,
        data: {
          message: 'Itinerario eliminado',
        },
      }),
    });

    const { result } = renderHook(() => useItinerary(), { wrapper });

    let success: boolean = false;
    await act(async () => {
      success = await result.current.deleteItinerary('itinerary-123');
    });

    expect(success).toBe(true);
  });

  test('deleteItinerary maneja errores correctamente', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useItinerary(), { wrapper });

    let success: boolean = true;
    await act(async () => {
      success = await result.current.deleteItinerary('itinerary-123');
    });

    expect(success).toBe(false);
    expect(result.current.error).toBeTruthy();
  });
});