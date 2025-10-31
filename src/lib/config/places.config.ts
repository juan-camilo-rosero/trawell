// src/lib/config/places.config.ts

import { TouristSiteCategory } from '@/models/types';

export const PLACES_CONFIG = {
  // Google Places API endpoints
  PLACES_API_BASE_URL: 'https://places.googleapis.com/v1',
  
  // Default search parameters
  DEFAULT_RADIUS_KM: 15, // 15km del centro de la ciudad
  DEFAULT_LIMIT_PER_CATEGORY: 10,
  DEFAULT_MIN_RATING: 3.5,
  MAX_RESULTS: 20, // Máximo por categoría
  
  // Mapeo de categorías a tipos de Google Places (New)
  // Lista oficial: https://developers.google.com/maps/documentation/places/web-service/place-types
  CATEGORY_TYPES: {
    museum: [
      'museum',
      'art_gallery',
    ],
    park: [
      'park',
      'national_park',
      'amusement_park',
      'zoo',
    ],
    monument: [
      'tourist_attraction',
      'cultural_center',
      'performing_arts_theater',
    ],
    historical: [
      'church',
      'hindu_temple',
      'mosque',
      'synagogue',
      'tourist_attraction',
    ],
  } as Record<TouristSiteCategory, string[]>,
  
  // Campos que queremos de la API de Places
  // IMPORTANTE: 'name' NO va en el FieldMask, se devuelve automáticamente
  PLACE_FIELDS: [
    'places.displayName',
    'places.formattedAddress',
    'places.location',
    'places.rating',
    'places.userRatingCount',
    'places.priceLevel',
    'places.types',
    'places.businessStatus',
    'places.currentOpeningHours',
    'places.photos',
    'places.internationalPhoneNumber',
    'places.websiteUri',
    'places.editorialSummary',
  ],
  
  // Duraciones estimadas por defecto (en minutos)
  ESTIMATED_DURATIONS: {
    museum: '120',
    park: '90',
    monument: '45',
    historical: '60',
  } as Record<TouristSiteCategory, string>,
  
  // Precios de entrada por defecto (0 = gratis, null = no disponible)
  DEFAULT_ENTRY_FEE: null,
} as const;

// Helper para convertir km a metros (Google usa metros)
export const kmToMeters = (km: number): number => km * 1000;

// Helper para determinar la categoría basado en los types de Google
export const determineCategory = (types: string[]): TouristSiteCategory | null => {
  const typesLower = types.map(t => t.toLowerCase());
  
  // Orden de prioridad para evitar ambigüedades
  if (typesLower.some(t => t.includes('museum') || t.includes('art_gallery'))) {
    return 'museum';
  }
  if (typesLower.some(t => 
    t.includes('park') || 
    t.includes('zoo') || 
    t.includes('amusement_park')
  )) {
    return 'park';
  }
  if (typesLower.some(t => 
    t.includes('church') || 
    t.includes('temple') || 
    t.includes('mosque') || 
    t.includes('synagogue')
  )) {
    return 'historical';
  }
  if (typesLower.some(t => 
    t.includes('cultural_center') || 
    t.includes('performing_arts') || 
    t.includes('tourist_attraction')
  )) {
    return 'monument';
  }
  
  return null;
};