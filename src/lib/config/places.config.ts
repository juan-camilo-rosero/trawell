// src/lib/config/places.config.ts
import { TouristSiteCategory, RestaurantCategory } from "@/models/types";

export const PLACES_CONFIG = {
  // Google Places API endpoints
  PLACES_API_BASE_URL: "https://places.googleapis.com/v1",

  // Default search parameters
  DEFAULT_RADIUS_KM: 15, // 15km del centro de la ciudad
  DEFAULT_LIMIT_PER_CATEGORY: 10,
  DEFAULT_MIN_RATING: 3.5,
  MAX_RESULTS: 20, // Máximo por categoría

  // Mapeo de categorías a tipos de Google Places (New)
  CATEGORY_TYPES: {
    museum: ["museum", "art_gallery"],
    park: ["park", "national_park", "amusement_park", "zoo"],
    monument: [
      "tourist_attraction",
      "cultural_center",
      "performing_arts_theater",
    ],
    historical: [
      "church",
      "hindu_temple",
      "mosque",
      "synagogue",
      "tourist_attraction",
    ],
  } as Record<TouristSiteCategory, string[]>,

  // Mapeo de categorías de restaurantes
  RESTAURANT_CATEGORY_TYPES: {
    // Tipos generales
    all: ["restaurant"],
    fine_dining: ["restaurant"], // GCP no tiene un tipo 'fine_dining'
    casual: ["restaurant", "cafe"],
    fast_food: ["fast_food_restaurant"],
    cafe: ["cafe", "coffee_shop"],
    bar: ["bar", "night_club"],

    // Cocinas regionales/internacionales
    american: ["american_restaurant"],
    asian: ["asian_restaurant"],
    chinese: ["chinese_restaurant"],
    french: ["french_restaurant"],
    greek: ["greek_restaurant"],
    indian: ["indian_restaurant"],
    indonesian: ["indonesian_restaurant"],
    italian: ["italian_restaurant"],
    japanese: ["japanese_restaurant"],
    korean: ["korean_restaurant"],
    lebanese: ["lebanese_restaurant"],
    mediterranean: ["mediterranean_restaurant"],
    mexican: ["mexican_restaurant"],
    middle_eastern: ["middle_eastern_restaurant"],
    spanish: ["spanish_restaurant"],
    thai: ["thai_restaurant"],
    turkish: ["turkish_restaurant"],

    // Tipos específicos
    pizza: ["pizza_restaurant"],
    seafood: ["seafood_restaurant"],
    steak_house: ["steak_house"],
    sushi: ["sushi_restaurant"],
    ramen: ["ramen_restaurant"],
    hamburger: ["hamburger_restaurant"],
    bakery: ["bakery"],
    ice_cream: ["ice_cream_shop"], // El tipo en GCP es 'ice_cream_shop'
    sandwich: ["sandwich_shop"], // El tipo en GCP es 'sandwich_shop'

    // Ocasión / Comida
    breakfast: ["restaurant", "cafe"], // No hay tipo específico, usamos genéricos
    brunch: ["restaurant", "cafe"], // No hay tipo específico, usamos genéricos

    // Dietas especiales
    vegan: ["restaurant"], // No hay tipo 'vegan', se usa 'restaurant'
    vegetarian: ["restaurant"], // No hay tipo 'vegetarian', se usa 'restaurant'
  } as Record<RestaurantCategory, string[]>,

  // Campos que queremos de la API de Places
  PLACE_FIELDS: [
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.rating",
    "places.userRatingCount",
    "places.priceLevel",
    "places.types",
    "places.businessStatus",
    "places.currentOpeningHours",
    "places.photos",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.editorialSummary",
  ],

  // Duraciones estimadas por defecto (en minutos)
  ESTIMATED_DURATIONS: {
    museum: "120",
    park: "90",
    monument: "45",
    historical: "60",
  } as Record<TouristSiteCategory, string>,

  // Precios de entrada por defecto (0 = gratis, null = no disponible)
  DEFAULT_ENTRY_FEE: null,
} as const;

// Helper para convertir km a metros (Google usa metros)
export const kmToMeters = (km: number): number => km * 1000;

// Helper para determinar la categoría basado en los types de Google
export const determineCategory = (
  types: string[]
): TouristSiteCategory | null => {
  console.log("[determineCategory] Input types:", types);

  if (!types || types.length === 0) {
    console.log("[determineCategory] No types provided, returning null");
    return null;
  }

  const typesLower = types.map((t) => t.toLowerCase());
  console.log("[determineCategory] Types lowercased:", typesLower);

  // Orden de prioridad para evitar ambigüedades
  if (typesLower.some((t) => t === "museum" || t === "art_gallery")) {
    console.log("[determineCategory] Matched: museum");
    return "museum";
  }

  if (
    typesLower.some(
      (t) =>
        t === "park" ||
        t === "national_park" ||
        t === "amusement_park" ||
        t === "zoo"
    )
  ) {
    console.log("[determineCategory] Matched: park");
    return "park";
  }

  if (
    typesLower.some(
      (t) =>
        t === "church" ||
        t === "hindu_temple" ||
        t === "mosque" ||
        t === "synagogue"
    )
  ) {
    console.log("[determineCategory] Matched: historical");
    return "historical";
  }

  if (
    typesLower.some(
      (t) =>
        t === "cultural_center" ||
        t === "performing_arts_theater" ||
        t === "tourist_attraction"
    )
  ) {
    console.log("[determineCategory] Matched: monument");
    return "monument";
  }

  console.log("[determineCategory] No match found, returning null");
  return null;
};
