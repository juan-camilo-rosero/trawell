// src/__tests__/unit/helpers/itinerary.helpers.test.ts
import {
  calculateDistance,
  estimateTravelTime,
  parseDurationToMinutes,
  minutesToTimeString,
  addMinutesToTime,
  timeToMinutes,
  getTouristCategoriesForTripType,
  getActivitiesPerDayForTripType,
  getRestaurantCategoriesForMeal,
  calculateAPILimits,
  estimateMealPrice,
  estimateVisitDuration,
  groupByProximity,
  formatDateToYYYYMMDD,
  getCurrencyForCountry,
} from '@/lib/helpers/itinerary.helpers';
import { ICoordinates, TouristSiteCategory, RestaurantCategory } from '@/models/types';

describe('Itinerary Helpers', () => {
  describe('calculateDistance', () => {
    test('calcula distancia entre Bogotá y Cartagena correctamente', () => {
      const bogota: ICoordinates = { lat: 4.7110, lng: -74.0721 };
      const cartagena: ICoordinates = { lat: 10.3910, lng: -75.4794 };
      
      const distance = calculateDistance(bogota, cartagena);
      
      // La distancia real es aproximadamente 657 km
      expect(distance).toBeGreaterThan(650);
      expect(distance).toBeLessThan(670);
    });

    test('calcula distancia de 0 para el mismo punto', () => {
      const point: ICoordinates = { lat: 4.7110, lng: -74.0721 };
      
      const distance = calculateDistance(point, point);
      
      expect(distance).toBe(0);
    });

    test('calcula distancias pequeñas correctamente', () => {
      const point1: ICoordinates = { lat: 4.7110, lng: -74.0721 };
      const point2: ICoordinates = { lat: 4.7111, lng: -74.0722 };
      
      const distance = calculateDistance(point1, point2);
      
      // Distancia muy pequeña, menos de 1 km
      expect(distance).toBeLessThan(1);
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('estimateTravelTime', () => {
    test('estima tiempo de viaje basado en distancia', () => {
      const point1: ICoordinates = { lat: 4.7110, lng: -74.0721 };
      const point2: ICoordinates = { lat: 4.7510, lng: -74.1021 };
      
      const time = estimateTravelTime(point1, point2);
      
      expect(time).toBeGreaterThanOrEqual(10);
      expect(time).toBeLessThanOrEqual(90);
    });

    test('retorna mínimo 10 minutos para distancias muy cortas', () => {
      const point1: ICoordinates = { lat: 4.7110, lng: -74.0721 };
      const point2: ICoordinates = { lat: 4.7111, lng: -74.0722 };
      
      const time = estimateTravelTime(point1, point2);
      
      expect(time).toBe(10);
    });

    test('retorna máximo 90 minutos para distancias largas', () => {
      const bogota: ICoordinates = { lat: 4.7110, lng: -74.0721 };
      const cartagena: ICoordinates = { lat: 10.3910, lng: -75.4794 };
      
      const time = estimateTravelTime(bogota, cartagena);
      
      expect(time).toBe(90);
    });
  });

  describe('parseDurationToMinutes', () => {
    test('convierte PT2H30M a 150 minutos', () => {
      expect(parseDurationToMinutes('PT2H30M')).toBe(150);
    });

    test('convierte PT45M a 45 minutos', () => {
      expect(parseDurationToMinutes('PT45M')).toBe(45);
    });

    test('convierte PT3H a 180 minutos', () => {
      expect(parseDurationToMinutes('PT3H')).toBe(180);
    });

    test('convierte PT1H15M a 75 minutos', () => {
      expect(parseDurationToMinutes('PT1H15M')).toBe(75);
    });

    test('maneja duraciones sin horas', () => {
      expect(parseDurationToMinutes('PT90M')).toBe(90);
    });

    test('maneja duraciones sin minutos', () => {
      expect(parseDurationToMinutes('PT5H')).toBe(300);
    });
  });

  describe('minutesToTimeString', () => {
    test('convierte 0 minutos a 00:00', () => {
      expect(minutesToTimeString(0)).toBe('00:00');
    });

    test('convierte 150 minutos a 02:30', () => {
      expect(minutesToTimeString(150)).toBe('02:30');
    });

    test('convierte 1440 minutos (24h) a 00:00', () => {
      expect(minutesToTimeString(1440)).toBe('00:00');
    });

    test('convierte 1500 minutos a 01:00 (wrap around)', () => {
      expect(minutesToTimeString(1500)).toBe('01:00');
    });

    test('formatea correctamente minutos de un dígito', () => {
      expect(minutesToTimeString(65)).toBe('01:05');
    });
  });

  describe('addMinutesToTime', () => {
    test('suma 30 minutos a 10:00', () => {
      expect(addMinutesToTime('10:00', 30)).toBe('10:30');
    });

    test('suma 90 minutos a 10:00', () => {
      expect(addMinutesToTime('10:00', 90)).toBe('11:30');
    });

    test('maneja overflow a siguiente día', () => {
      expect(addMinutesToTime('23:30', 60)).toBe('00:30');
    });

    test('suma 0 minutos mantiene la hora', () => {
      expect(addMinutesToTime('14:45', 0)).toBe('14:45');
    });

    test('suma minutos negativos funciona correctamente', () => {
      expect(addMinutesToTime('10:00', -30)).toBe('09:30');
    });
  });

  describe('timeToMinutes', () => {
    test('convierte 00:00 a 0 minutos', () => {
      expect(timeToMinutes('00:00')).toBe(0);
    });

    test('convierte 02:30 a 150 minutos', () => {
      expect(timeToMinutes('02:30')).toBe(150);
    });

    test('convierte 23:59 a 1439 minutos', () => {
      expect(timeToMinutes('23:59')).toBe(1439);
    });

    test('convierte 12:00 a 720 minutos', () => {
      expect(timeToMinutes('12:00')).toBe(720);
    });
  });

  describe('getTouristCategoriesForTripType', () => {
    test('retorna categorías correctas para viaje cultural', () => {
      const categories = getTouristCategoriesForTripType('cultural');
      expect(categories).toEqual(['museum', 'monument', 'historical']);
    });

    test('retorna categorías correctas para viaje de aventura', () => {
      const categories = getTouristCategoriesForTripType('adventure');
      expect(categories).toEqual(['park']);
    });

    test('retorna categorías correctas para viaje de relajación', () => {
      const categories = getTouristCategoriesForTripType('relaxation');
      expect(categories).toEqual(['park']);
    });

    test('retorna categorías por defecto para tipo desconocido', () => {
      const categories = getTouristCategoriesForTripType('unknown');
      expect(categories).toEqual(['museum', 'park', 'monument', 'historical']);
    });
  });

  describe('getActivitiesPerDayForTripType', () => {
    test('retorna 4 actividades para viaje cultural', () => {
      expect(getActivitiesPerDayForTripType('cultural')).toBe(4);
    });

    test('retorna 3 actividades para viaje de aventura', () => {
      expect(getActivitiesPerDayForTripType('adventure')).toBe(3);
    });

    test('retorna 2 actividades para viaje de relajación', () => {
      expect(getActivitiesPerDayForTripType('relaxation')).toBe(2);
    });

    test('retorna 3 actividades por defecto para tipo desconocido', () => {
      expect(getActivitiesPerDayForTripType('unknown')).toBe(3);
    });
  });

  describe('getRestaurantCategoriesForMeal', () => {
    test('retorna categorías de desayuno cuando no hay preferencias', () => {
      const categories = getRestaurantCategoriesForMeal('desayuno', []);
      expect(categories).toContain('cafe');
      expect(categories).toContain('bakery');
    });

    test('retorna categorías de almuerzo cuando no hay preferencias', () => {
      const categories = getRestaurantCategoriesForMeal('almuerzo', []);
      expect(categories).toContain('casual');
      expect(categories).toContain('italian');
    });

    test('retorna categorías de cena cuando no hay preferencias', () => {
      const categories = getRestaurantCategoriesForMeal('cena', []);
      expect(categories).toContain('fine_dining');
      expect(categories).toContain('casual');
    });

    test('respeta preferencias del usuario para almuerzo', () => {
      const preferences: RestaurantCategory[] = ['italian', 'japanese'];
      const categories = getRestaurantCategoriesForMeal('almuerzo', preferences);
      expect(categories).toEqual(['italian', 'japanese']);
    });

    test('filtra fine_dining para almuerzo', () => {
      const preferences: RestaurantCategory[] = ['italian', 'fine_dining'];
      const categories = getRestaurantCategoriesForMeal('almuerzo', preferences);
      expect(categories).not.toContain('fine_dining');
    });

    test('maneja preferencia "all" correctamente', () => {
      const preferences: RestaurantCategory[] = ['all'];
      const categories = getRestaurantCategoriesForMeal('desayuno', preferences);
      expect(categories.length).toBeGreaterThan(0);
    });
  });

  describe('calculateAPILimits', () => {
    test('retorna límites correctos para viaje de 2 días', () => {
      const limits = calculateAPILimits(2);
      expect(limits).toEqual({
        restaurants: 10,
        touristSites: 8,
        hotels: 5,
      });
    });

    test('retorna límites correctos para viaje de 5 días', () => {
      const limits = calculateAPILimits(5);
      expect(limits).toEqual({
        restaurants: 15,
        touristSites: 12,
        hotels: 8,
      });
    });

    test('retorna límites correctos para viaje de 10 días', () => {
      const limits = calculateAPILimits(10);
      expect(limits).toEqual({
        restaurants: 20,
        touristSites: 15,
        hotels: 10,
      });
    });

    test('retorna límites máximos para viajes largos', () => {
      const limits = calculateAPILimits(15);
      expect(limits).toEqual({
        restaurants: 20,
        touristSites: 20,
        hotels: 15,
      });
    });
  });

  describe('estimateMealPrice', () => {
    test('calcula precio correcto para 2 personas nivel 2', () => {
      const price = estimateMealPrice(2, 2);
      expect(price).toBe(90000); // 45000 * 2
    });

    test('calcula precio correcto para 1 persona nivel 0', () => {
      const price = estimateMealPrice(0, 1);
      expect(price).toBe(15000);
    });

    test('calcula precio correcto para 4 personas nivel 4', () => {
      const price = estimateMealPrice(4, 4);
      expect(price).toBe(600000); // 150000 * 4
    });

    test('usa precio por defecto para nivel desconocido', () => {
      const price = estimateMealPrice(5, 2);
      expect(price).toBe(100000); // 50000 * 2
    });
  });

  describe('estimateVisitDuration', () => {
    test('retorna 120 minutos para museo', () => {
      expect(estimateVisitDuration('museum')).toBe(120);
    });

    test('retorna 90 minutos para parque', () => {
      expect(estimateVisitDuration('park')).toBe(90);
    });

    test('retorna 60 minutos para monumento', () => {
      expect(estimateVisitDuration('monument')).toBe(60);
    });

    test('retorna 90 minutos para sitio histórico', () => {
      expect(estimateVisitDuration('historical')).toBe(90);
    });
  });

  describe('groupByProximity', () => {
    test('agrupa items por cercanía correctamente', () => {
      const startPoint: ICoordinates = { lat: 0, lng: 0 };
      const items = [
        { id: '1', coordinates: { lat: 1, lng: 1 } },
        { id: '2', coordinates: { lat: 0.1, lng: 0.1 } },
        { id: '3', coordinates: { lat: 2, lng: 2 } },
      ];

      const grouped = groupByProximity(items, startPoint);

      // El item más cercano (id: 2) debe ser primero
      expect(grouped[0].id).toBe('2');
    });

    test('retorna array vacío cuando no hay items', () => {
      const startPoint: ICoordinates = { lat: 0, lng: 0 };
      const grouped = groupByProximity([], startPoint);
      expect(grouped).toEqual([]);
    });

    test('mantiene todos los items en el resultado', () => {
      const startPoint: ICoordinates = { lat: 0, lng: 0 };
      const items = [
        { id: '1', coordinates: { lat: 1, lng: 1 } },
        { id: '2', coordinates: { lat: 2, lng: 2 } },
        { id: '3', coordinates: { lat: 3, lng: 3 } },
      ];

      const grouped = groupByProximity(items, startPoint);

      expect(grouped).toHaveLength(3);
      expect(grouped.map(i => i.id).sort()).toEqual(['1', '2', '3']);
    });
  });

  describe('formatDateToYYYYMMDD', () => {
    test('formatea fecha correctamente', () => {
      const date = new Date('2024-12-25T10:00:00');
      expect(formatDateToYYYYMMDD(date)).toBe('2024-12-25');
    });

    test('formatea fecha con mes de un dígito correctamente', () => {
      const date = new Date('2024-03-05T10:00:00');
      expect(formatDateToYYYYMMDD(date)).toBe('2024-03-05');
    });

    test('formatea fecha con día de un dígito correctamente', () => {
      const date = new Date('2024-12-01T10:00:00');
      expect(formatDateToYYYYMMDD(date)).toBe('2024-12-01');
    });

    test('maneja año bisiesto correctamente', () => {
      const date = new Date('2024-02-29T10:00:00');
      expect(formatDateToYYYYMMDD(date)).toBe('2024-02-29');
    });
  });

  describe('getCurrencyForCountry', () => {
    test('retorna COP para Colombia', () => {
      expect(getCurrencyForCountry('CO')).toBe('COP');
    });

    test('retorna USD para Estados Unidos', () => {
      expect(getCurrencyForCountry('US')).toBe('USD');
    });

    test('retorna EUR para Francia', () => {
      expect(getCurrencyForCountry('FR')).toBe('EUR');
    });

    test('retorna USD por defecto para código desconocido', () => {
      expect(getCurrencyForCountry('ZZ')).toBe('USD');
    });

    test('retorna USD cuando no se proporciona código', () => {
      expect(getCurrencyForCountry()).toBe('USD');
    });
  });
});