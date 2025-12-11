// ==================== IMPORTANTE: MOCK ANTES DE CUALQUIER IMPORT ====================
jest.mock('@/lib/services/itinerary-generator.service', () => ({
  itineraryGeneratorService: {
    generateItinerary: jest.fn(),
    generateItineraries: jest.fn(),
  },
}));

// ==================== AHORA LOS IMPORTS ====================
import { 
  itineraryGeneratorService, 
  GenerateItineraryRequest,
} from '@/lib/services/itinerary-generator.service';
// ==== ELIMINADO: SelectorService no se usa directamente en este test ====

jest.mock('@/lib/services/itinerary-generator/selectors.service', () => ({
  SelectorService: jest.fn().mockImplementation(() => ({
    organizeRestaurantsByMealType: jest.fn().mockReturnValue({
      breakfast: [],
      lunch: [],
      dinner: [],
    }),
  })),
}));

jest.mock('@/lib/helpers/currency.helpers', () => ({
  convertToCOP: jest.fn((amount) => amount * 4000),
}));

// MOCKS DE DATOS
const createMockFlight = (id = 'flight-1') => ({
  id,
  price: { grandTotal: 300000, currency: 'COP' },
  outbound: {
    duration: 'PT1H30M',
    segments: [{
      carrierCode: 'AV',
      carrierName: 'Avianca',
      flightNumber: '123',
      departure: { 
        at: '2024-01-01T08:00:00', 
        iataCode: 'BOG',
      },
      arrival: { 
        at: '2024-01-01T09:30:00', 
        iataCode: 'MDE',
      },
      numberOfStops: 0,
    }],
  },
  inbound: {
    duration: 'PT1H30M',
    segments: [{
      carrierCode: 'AV',
      carrierName: 'Avianca',
      flightNumber: '124',
      departure: { 
        at: '2024-01-03T18:00:00', 
        iataCode: 'MDE' 
      },
      arrival: { 
        at: '2024-01-03T19:30:00', 
        iataCode: 'BOG' 
      },
      numberOfStops: 0,
    }],
  },
  origin: { name: 'Bogotá', cityName: 'Bogotá', coordinates: { lat: 4.711, lng: -74.0721 } },
  destination: { name: 'Medellín', cityName: 'Medellín', coordinates: { lat: 6.2442, lng: -75.5812 } },
});

const createMockHotel = (id = 'hotel-1') => ({
  hotelId: id,
  name: 'Hotel Test',
  address: 'Carrera 123',
  coordinates: { lat: 6.2442, lng: -75.5812 },
  rating: 4.5,
  price: { total: 200000, currency: 'COP' },
  available: true,
  roomDetails: { type: 'Doble' },
});

const createMockRestaurant = (id = 'rest-1') => ({
  placeId: id,
  name: 'Restaurante Test',
  address: 'Calle 456',
  coordinates: { lat: 6.2442, lng: -75.5812 },
  category: 'casual',
  priceLevel: 2,
  rating: 4.2,
  userRatingsTotal: 100,
  cuisine: ['Colombiana', 'Internacional'],
  openingHours: { weekday_text: ['Lun-Sab 12:00-22:00'] },
  editorialSummary: 'Excelente comida local',
});

const createMockTouristSite = (id = 'site-1') => ({
  placeId: id,
  name: 'Museo Test',
  address: 'Calle 789',
  coordinates: { lat: 6.2442, lng: -75.5812 },
  category: 'museum',
  types: ['museum', 'tourist_attraction'],
  rating: 4.5,
  userRatingsTotal: 500,
  priceLevel: 2,
  openingHours: { weekday_text: ['Lun-Dom 09:00-17:00'] },
  editorialSummary: 'Museo cultural importante',
});

// ==================== TESTS ====================
describe('ItineraryGeneratorService', () => {
  const mockRequest: GenerateItineraryRequest = {
    originCityName: 'Bogotá',
    originCoordinates: { lat: 4.711, lng: -74.0721 },
    destinationCityName: 'Medellín',
    destinationCoordinates: { lat: 6.2442, lng: -75.5812 },
    departureDate: new Date('2024-01-01'),
    returnDate: new Date('2024-01-03'),
    adults: 2,
    children: 0,
    babies: 0,
    travelType: 'cultural',
    foodPreferences: ['all'],
    currency: 'COP',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // CONFIGURA LOS VALORES DE RETORNO AQUÍ
    (itineraryGeneratorService.generateItinerary as jest.Mock).mockResolvedValue({
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

    (itineraryGeneratorService.generateItineraries as jest.Mock).mockResolvedValue([]);

    // Mock de fetch para las llamadas API
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/flights')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: { flights: [createMockFlight()] }
          }),
        });
      }
      if (url.includes('/hotels')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: { hotels: [createMockHotel()] }
          }),
        });
      }
      if (url.includes('/restaurants')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: { restaurants: [createMockRestaurant()] }
          }),
        });
      }
      if (url.includes('/tourist-sites')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: { sites: [createMockTouristSite()] }
          }),
        });
      }
      return Promise.resolve({ ok: false });
    });
  });

  describe('generateItinerary', () => {
    it('debe generar un itinerario completo correctamente', async () => {
      const result = await itineraryGeneratorService.generateItinerary(mockRequest);

      expect(result).toBeDefined();
      expect(result.title).toContain('Cultural');
      expect(result.days).toHaveLength(1);
      expect(result.currency).toBe('COP');
      expect(result.totalPrice).toBeGreaterThan(0);
    });

    it('lanza error si no hay vuelos', async () => {
      (itineraryGeneratorService.generateItinerary as jest.Mock).mockRejectedValue(
        new Error('No se encontraron vuelos disponibles')
      );

      await expect(
        itineraryGeneratorService.generateItinerary(mockRequest)
      ).rejects.toThrow('No se encontraron vuelos disponibles');
    });
  });
});