// src/__test__/integration/04-use-itineraries-hook.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useItineraries } from '@/hooks/use-itineraries';

global.fetch = jest.fn();

describe('useItineraries Hook Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  test('retorna estado inicial correcto', () => {
    const { result } = renderHook(() => useItineraries('user-123'));

    expect(result.current.itineraries).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination).toBeNull();
  });

  test('carga itinerarios del usuario correctamente', async () => {
    const mockItineraries = [
      {
        _id: 'itin-1',
        userId: 'user-123',
        title: 'Viaje a Cartagena',
        totalPrice: 2000000,
        currency: 'COP',
      },
      {
        _id: 'itin-2',
        userId: 'user-123',
        title: 'Viaje a Medellín',
        totalPrice: 1500000,
        currency: 'COP',
      },
    ];

    const mockPagination = {
      total: 2,
      limit: 16,
      skip: 0,
      hasMore: false,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          itineraries: mockItineraries,
          pagination: mockPagination,
        },
      }),
    });

    const { result } = renderHook(() => useItineraries('user-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.itineraries).toEqual(mockItineraries);
      expect(result.current.pagination).toEqual(mockPagination);
      expect(result.current.error).toBeNull();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/itineraries/user/user-123')
    );
  });

  test('maneja error de red correctamente', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useItineraries('user-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(result.current.itineraries).toEqual([]);
    });
  });

  test('maneja respuesta de error del servidor', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: 'Server error',
      }),
    });

    const { result } = renderHook(() => useItineraries('user-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Error al cargar los itinerarios');
    });
  });

  test('no hace fetch si userId es undefined', () => {
    const { result } = renderHook(() => useItineraries(undefined));

    expect(result.current.isLoading).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('fetchItineraries con paginación funciona correctamente', async () => {
    const mockItineraries = [
      {
        _id: 'itin-3',
        userId: 'user-123',
        title: 'Viaje a Cali',
        totalPrice: 1800000,
        currency: 'COP',
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            itineraries: [],
            pagination: { total: 0, limit: 16, skip: 0, hasMore: false },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            itineraries: mockItineraries,
            pagination: { total: 17, limit: 16, skip: 16, hasMore: false },
          },
        }),
      });

    const { result } = renderHook(() => useItineraries('user-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Cargar página 1
    await result.current.fetchItineraries(1);

    await waitFor(() => {
      expect(result.current.itineraries).toEqual(mockItineraries);
      expect(result.current.pagination?.skip).toBe(16);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('respeta el límite inicial personalizado', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          itineraries: [],
          pagination: { total: 0, limit: 10, skip: 0, hasMore: false },
        },
      }),
    });

    renderHook(() => useItineraries('user-123', 10));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10')
      );
    });
  });

  test('actualiza estado correctamente en múltiples fetches', async () => {
    const mockItineraries1 = [{ _id: '1', title: 'Trip 1' }];
    const mockItineraries2 = [{ _id: '2', title: 'Trip 2' }];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            itineraries: mockItineraries1,
            pagination: { total: 1, limit: 16, skip: 0, hasMore: false },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            itineraries: mockItineraries2,
            pagination: { total: 1, limit: 16, skip: 0, hasMore: false },
          },
        }),
      });

    const { result } = renderHook(() => useItineraries('user-123'));

    await waitFor(() => {
      expect(result.current.itineraries).toEqual(mockItineraries1);
    });

    await result.current.fetchItineraries(0);

    await waitFor(() => {
      expect(result.current.itineraries).toEqual(mockItineraries2);
    });
  });

  test('limpia error en fetch exitoso después de error', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            itineraries: [],
            pagination: { total: 0, limit: 16, skip: 0, hasMore: false },
          },
        }),
      });

    const { result } = renderHook(() => useItineraries('user-123'));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    await result.current.fetchItineraries(0);

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });
});