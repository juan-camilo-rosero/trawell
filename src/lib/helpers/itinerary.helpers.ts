// @/lib/helpers/itinerary.helpers.ts

import {
  ICoordinates,
  TouristSiteCategory,
  RestaurantCategory,
} from "@/models/types";

/**
 * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
 * @returns distancia en kilómetros
 */
export function calculateDistance(
  coord1: ICoordinates,
  coord2: ICoordinates
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estima el tiempo de viaje en minutos entre dos ubicaciones
 * Asume velocidad promedio de 30 km/h en ciudad
 */
export function estimateTravelTime(
  coord1: ICoordinates,
  coord2: ICoordinates
): number {
  const distance = calculateDistance(coord1, coord2);
  const averageSpeedKmh = 30; // velocidad promedio en ciudad
  const timeInHours = distance / averageSpeedKmh;
  const timeInMinutes = Math.round(timeInHours * 60);

  // Mínimo 10 minutos, máximo 90 minutos
  return Math.max(10, Math.min(timeInMinutes, 90));
}

/**
 * Convierte una duración ISO 8601 a minutos
 * Ejemplos: "PT2H30M" -> 150, "PT45M" -> 45, "PT3H" -> 180
 */
export function parseDurationToMinutes(duration: string): number {
  const hoursMatch = duration.match(/(\d+)H/);
  const minutesMatch = duration.match(/(\d+)M/);

  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

  return hours * 60 + minutes;
}

/**
 * Convierte minutos a formato de hora HH:MM
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/**
 * Suma minutos a una hora en formato HH:MM
 */
export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  return minutesToTimeString(totalMinutes);
}

/**
 * Convierte un string de hora HH:MM a minutos desde medianoche
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Mapea el tipo de viaje a categorías de sitios turísticos
 */
export function getTouristCategoriesForTripType(
  tripType: string
): TouristSiteCategory[] {
  const mapping: Record<string, TouristSiteCategory[]> = {
    cultural: ["museum", "monument", "historical"],
    adventure: ["park"],
    relaxation: ["park"],
    luxury: ["museum", "monument", "historical"],
    gastronomic: ["historical", "monument"],
    spiritual: ["historical", "monument"],
  };

  return mapping[tripType] || ["museum", "park", "monument", "historical"];
}

/**
 * Mapea el tipo de viaje a número de actividades por día
 */
export function getActivitiesPerDayForTripType(tripType: string): number {
  const mapping: Record<string, number> = {
    cultural: 4,
    adventure: 3,
    relaxation: 2,
    luxury: 3,
    gastronomic: 2,
    spiritual: 3,
  };

  return mapping[tripType] || 3;
}

/**
 * Obtiene las categorías de restaurantes para comidas según preferencias
 */
export function getRestaurantCategoriesForMeal(
  mealType: "desayuno" | "almuerzo" | "cena",
  foodPreferences: RestaurantCategory[]
): RestaurantCategory[] {
  // Si el usuario seleccionó 'all' o no hay preferencias, usar categorías amplias
  if (
    !foodPreferences ||
    foodPreferences.length === 0 ||
    foodPreferences.includes("all")
  ) {
    switch (mealType) {
      case "desayuno":
        return ["cafe", "bakery", "casual", "american"];
      case "almuerzo":
        return [
          "casual",
          "italian",
          "mediterranean",
          "asian",
          "mexican",
          "american",
          "chinese",
          "japanese",
        ];
      case "cena":
        return [
          "fine_dining",
          "casual",
          "italian",
          "french",
          "japanese",
          "steak_house",
          "mediterranean",
          "asian",
        ];
    }
  }

  // Si el usuario tiene preferencias específicas, usarlas para todas las comidas
  // pero ajustar según el tipo de comida
  const breakfastSuitable: RestaurantCategory[] = [
    "cafe",
    "bakery",
    "american",
  ];
  const anytimeSuitable: RestaurantCategory[] = [
    "casual",
    "italian",
    "french",
    "japanese",
    "chinese",
    "mexican",
    "mediterranean",
    "asian",
    "thai",
    "greek",
    "indian",
    "spanish",
    "korean",
    "lebanese",
    "turkish",
    "indonesian",
    "middle_eastern",
  ];

  switch (mealType) {
    case "desayuno":
      // Para desayuno, priorizar cafés y panaderías, o usar las preferencias del usuario
      const breakfastPrefs = foodPreferences.filter(
        (p) => breakfastSuitable.includes(p) || anytimeSuitable.includes(p)
      );
      return breakfastPrefs.length > 0
        ? breakfastPrefs
        : ["cafe", "bakery", "casual"];

    case "almuerzo":
      // Para almuerzo, usar todas las preferencias excepto fine dining
      const lunchPrefs = foodPreferences.filter(
        (p) => p !== "fine_dining" && p !== "all"
      );
      return lunchPrefs.length > 0
        ? lunchPrefs
        : ["casual", "italian", "mexican", "asian"];

    case "cena":
      // Para cena, usar todas las preferencias
      const dinnerPrefs = foodPreferences.filter((p) => p !== "all");
      return dinnerPrefs.length > 0
        ? dinnerPrefs
        : ["fine_dining", "casual", "italian", "japanese"];
  }
}

/**
 * Calcula el número de resultados a pedir a las APIs según duración del viaje
 */
export function calculateAPILimits(tripDays: number): {
  restaurants: number;
  touristSites: number;
  hotels: number;
} {
  if (tripDays <= 2) {
    return {
      restaurants: 10,
      touristSites: 8,
      hotels: 5,
    };
  } else if (tripDays <= 5) {
    return {
      restaurants: 15,
      touristSites: 12,
      hotels: 8,
    };
  } else if (tripDays <= 10) {
    return {
      restaurants: 20,
      touristSites: 15,
      hotels: 10,
    };
  } else {
    return {
      restaurants: 20,
      touristSites: 20,
      hotels: 15,
    };
  }
}

/**
 * Estima el precio de una comida según el priceLevel
 * @returns precio estimado en COP por persona
 */
export function estimateMealPrice(
  priceLevel: number,
  numberOfPeople: number
): number {
  const basePrices: Record<number, number> = {
    0: 15000,
    1: 25000,
    2: 45000,
    3: 80000,
    4: 150000,
  };

  const basePrice = basePrices[priceLevel] || 50000;
  return basePrice * numberOfPeople;
}

/**
 * Estima la duración de una visita turística basada en el tipo
 */
export function estimateVisitDuration(category: TouristSiteCategory): number {
  const durations: Record<TouristSiteCategory, number> = {
    museum: 120, // 2 horas
    park: 90, // 1.5 horas
    monument: 60, // 1 hora
    historical: 90, // 1.5 horas
  };

  return durations[category];
}

/**
 * Agrupa elementos por cercanía usando un algoritmo simple de nearest neighbor
 */
export function groupByProximity<T extends { coordinates: ICoordinates }>(
  items: T[],
  startPoint: ICoordinates
): T[] {
  if (items.length === 0) return [];

  const result: T[] = [];
  const remaining = [...items];
  let currentPoint = startPoint;

  while (remaining.length > 0) {
    // Encontrar el elemento más cercano al punto actual
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(
      currentPoint,
      remaining[0].coordinates
    );

    for (let i = 1; i < remaining.length; i++) {
      const distance = calculateDistance(
        currentPoint,
        remaining[i].coordinates
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    const nearest = remaining.splice(nearestIndex, 1)[0];
    result.push(nearest);
    currentPoint = nearest.coordinates;
  }

  return result;
}

/**
 * Formatea una fecha a YYYY-MM-DD
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Extrae el código de moneda de un país (simplificado)
 */
export function getCurrencyForCountry(countryCode?: string): string {
  const currencies: Record<string, string> = {
    CO: "COP",
    US: "USD",
    MX: "MXN",
    FR: "EUR",
    ES: "EUR",
    IT: "EUR",
    GB: "GBP",
    JP: "JPY",
    BR: "BRL",
    AR: "ARS",
  };

  return currencies[countryCode || ""] || "USD";
}
