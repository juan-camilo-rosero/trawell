import { Types } from 'mongoose';
import {
  ISearchParams,
  IItineraryItem,
  IDay,
  IFlightDetails,
  IAccommodationDetails,
} from '@/models/itinerary/interfaces';

// ==================== FACTORIES DE MOCKS ====================
export function createMockLocation(overrides = {}) {
  return {
    name: 'Test City',
    coordinates: { lat: 4.711, lng: -74.0721 },
    placeId: 'ChIJ123',
    ...overrides,
  };
}

export function createMockFlightDetails(overrides = {}): IFlightDetails {
  return {
    carrierCode: 'AV',
    carrierName: 'Avianca',
    flightNumber: '123',
    departureAirport: 'BOG',
    departureAirportName: 'Bogotá',
    departureTime: '08:00',
    arrivalAirport: 'MDE',
    arrivalAirportName: 'Medellín',
    arrivalTime: '09:30',
    duration: 'PT1H30M',
    numberOfStops: 0,
    pricePerPerson: 150000,
    totalPrice: 300000,
    ...overrides,
  };
}

export function createMockAccommodationDetails(overrides = {}): IAccommodationDetails {
  return {
    hotelId: 'hotel-123',
    hotelName: 'Hotel Test',
    checkIn: new Date('2024-01-01'),
    checkOut: new Date('2024-01-03'),
    nights: 2,
    roomType: 'Doble',
    ...overrides,
  };
}

export function createMockItineraryItem(overrides = {}): IItineraryItem {
  return {
    _id: new Types.ObjectId(),
    itemId: 'item-123',
    type: 'flight',
    order: 1,
    time: '08:00',
    title: 'Vuelo Test',
    description: 'Descripción del vuelo',
    price: 300000,
    location: {
      name: 'Aeropuerto',
      address: 'Calle 123',
      coordinates: { lat: 4.711, lng: -74.0721 },
      placeId: 'place-123',
    },
    ...overrides,
  };
}

export function createMockDay(overrides = {}): IDay {
  return {
    _id: new Types.ObjectId(),
    dayNumber: 1,
    date: new Date('2024-01-01'),
    items: [createMockItineraryItem()],
    ...overrides,
  };
}

export function createMockSearchParams(overrides = {}): ISearchParams {
  return {
    originCity: createMockLocation({ name: 'Bogotá' }),
    destinationCity: createMockLocation({ name: 'Medellín' }),
    departureDate: new Date('2024-01-01'),
    returnDate: new Date('2024-01-03'),
    travelers: { adults: 2, children: 0, babies: 0 },
    travelType: 'cultural',
    ...overrides,
  };
}

// ==================== TESTS ====================
describe('Interfaces - Factories', () => {
  it('debe crear una ubicación mock válida', () => {
    const location = createMockLocation();
    expect(location).toHaveProperty('name');
    expect(location).toHaveProperty('coordinates.lat');
    expect(location).toHaveProperty('coordinates.lng');
  });

  it('debe crear un item de itinerario mock válido', () => {
    const item = createMockItineraryItem();
    expect(item.type).toBe('flight');
    expect(item.price).toBeGreaterThanOrEqual(0);
    expect(item._id).toBeDefined();
  });

  it('debe crear un día mock válido', () => {
    const day = createMockDay();
    expect(day.dayNumber).toBe(1);
    expect(day.items).toHaveLength(1);
    expect(day._id).toBeDefined();
  });

  it('debe permitir sobrescribir props en los mocks', () => {
    const item = createMockItineraryItem({ price: 500000, type: 'food' });
    expect(item.price).toBe(500000);
    expect(item.type).toBe('food');
  });
});

describe('Interfaces - Type Guards', () => {
  it('debe validar que un item tiene location', () => {
    const item = createMockItineraryItem();
    expect(item.location).toBeDefined();
    expect(item.location.coordinates).toBeDefined();
  });

  it('debe validar que flightDetails es opcional', () => {
    const item = createMockItineraryItem({ flightDetails: undefined });
    expect(item.flightDetails).toBeUndefined();
  });
});