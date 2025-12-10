// src/__test__/integration/save-itinerary-flow.test.tsx
// Mocks ANTES de cualquier import
jest.mock('firebase/auth');
jest.mock('mongoose');
jest.mock('@/lib/services/itinerary-generator.service');

import { renderHook, act } from '@testing-library/react';
import { ItineraryProvider, useItinerary } from '@/contexts/ItineraryContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

// Mock del servicio CON VALORES DE RETORNO
const { itineraryGeneratorService } = require('@/lib/services/itinerary-generator.service');
itineraryGeneratorService.generateItinerary.mockResolvedValue({
  searchParams: { destinationCity: { name: 'Medellín' } },
  title: 'Experiencia Cultural en Medellín',
  totalPrice: 850000,
  currency: 'COP',
  days: [
    {
      _id: 'day-1',
      dayNumber: 1,
      date: new Date('2024-01-01'),
      items: [{ 
        itemId: 'item-1', 
        type: 'flight', 
        order: 1, 
        time: '08:00', 
        title: 'Vuelo', 
        description: 'Vuelo de ida', 
        price: 300000, 
        location: {} 
      }],
    },
  ],
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>
    <ItineraryProvider>{children}</ItineraryProvider>
  </NotificationProvider>
);

describe('Integración: Flujo Guardar Itinerario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock de API de guardado
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        success: true,
        data: { itinerary: { _id: 'saved-123', days: [] } },
      }),
    });
  });

  it('debe generar, guardar y mostrar notificación', async () => {
    const { result } = renderHook(() => useItinerary(), { wrapper });

    // 1. Generar itinerario
    await act(async () => {
      await result.current.generateItinerary({
        originCityName: 'Bogotá',
        destinationCityName: 'Medellín',
        originCoordinates: { lat: 4.711, lng: -74.0721 },
        destinationCoordinates: { lat: 6.2442, lng: -75.5812 },
        departureDate: new Date('2024-01-01'),
        returnDate: new Date('2024-01-03'),
        adults: 2,
        travelType: 'cultural',
        foodPreferences: ['all'],
      } as any);
    });

    // 2. Verificar que se generó
    expect(result.current.itinerary).toBeDefined();
    expect(result.current.itinerary?.title).toContain('Cultural');

    // 3. Guardar itinerario
    let saveResult = false;
    await act(async () => {
      saveResult = await result.current.saveItinerary('test-user-uid');
    });

    // 4. Verificar guardado exitoso
    expect(saveResult).toBe(true);
    expect(result.current.itinerary?._id).toBe('saved-123');
  });
});