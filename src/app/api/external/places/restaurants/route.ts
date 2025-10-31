// src/app/api/external/places/restaurants/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { restaurantsService } from '@/lib/services/restaurants.service';
import { GetRestaurantsResponse, RestaurantCategory, GetRestaurantsRequest } from '@/models/types';
import { PLACES_CONFIG } from '@/lib/config/places.config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Lista completa de categorías válidas
const VALID_CATEGORIES: RestaurantCategory[] = [
  'all',
  'fine_dining',
  'casual',
  'fast_food',
  'cafe',
  'bar',
  // Cocinas regionales/internacionales
  'american',
  'asian',
  'chinese',
  'french',
  'greek',
  'indian',
  'indonesian',
  'italian',
  'japanese',
  'korean',
  'lebanese',
  'mediterranean',
  'mexican',
  'middle_eastern',
  'spanish',
  'thai',
  'turkish',
  // Tipos específicos
  'pizza',
  'seafood',
  'steak_house',
  'sushi',
  'ramen',
  'hamburger',
  'bakery',
  'ice_cream',
  'sandwich',
];

/**
 * Valida si un string es una categoría válida
 */
function isValidCategory(category: string): category is RestaurantCategory {
  return VALID_CATEGORIES.includes(category as RestaurantCategory);
}

/**
 * POST /api/external/places/restaurants
 * 
 * Body parameters:
 * - cityName (required): Nombre de la ciudad
 * - coordinates (required): { lat: number, lng: number }
 * - placeId (optional): Place ID de la ciudad
 * - categories (optional): Array de categorías
 * - limit (optional): Límite de resultados por categoría (default: 10, max: 20)
 * - minRating (optional): Rating mínimo (default: 3.5)
 * - radiusKm (optional): Radio de búsqueda en km (default: 15)
 * - priceLevel (optional): Array de niveles de precio permitidos [0,1,2,3,4]
 */
export async function POST(request: NextRequest) {
  try {
    const body: Partial<GetRestaurantsRequest> = await request.json();

    // Validar parámetros requeridos
    const { cityName, coordinates, placeId, categories, limit, minRating, radiusKm, priceLevel } = body;

    if (!cityName || !coordinates) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
          message: 'cityName and coordinates are required',
        } as GetRestaurantsResponse,
        { status: 400 }
      );
    }

    // Validar coordenadas
    const { lat, lng } = coordinates;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid coordinates',
          message: 'coordinates.lat and coordinates.lng must be valid numbers',
        } as GetRestaurantsResponse,
        { status: 400 }
      );
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid coordinates',
          message: 'Coordinates out of valid range',
        } as GetRestaurantsResponse,
        { status: 400 }
      );
    }

    // Validar y filtrar categorías
    let validatedCategories: RestaurantCategory[] = ['all'];

    if (categories) {
      if (!Array.isArray(categories)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid categories',
            message: 'categories must be an array',
          } as GetRestaurantsResponse,
          { status: 400 }
        );
      }

      // Filtrar solo las categorías válidas
      const filtered = categories.filter(isValidCategory);

      if (filtered.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid categories',
            message: `No valid categories provided. Valid categories are: ${VALID_CATEGORIES.join(', ')}`,
          } as GetRestaurantsResponse,
          { status: 400 }
        );
      }

      // Si hay categorías inválidas, informar al usuario
      if (filtered.length !== categories.length) {
        const invalidCategories = categories.filter(cat => !isValidCategory(cat as string));
        console.warn(`[API] Invalid categories ignored: ${invalidCategories.join(', ')}`);
      }

      validatedCategories = filtered;
    }

    // Validar limit
    const finalLimit = limit 
      ? Math.min(limit, PLACES_CONFIG.MAX_RESULTS)
      : PLACES_CONFIG.DEFAULT_LIMIT_PER_CATEGORY;

    if (limit && (typeof limit !== 'number' || limit < 1)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid limit',
          message: 'limit must be a positive number',
        } as GetRestaurantsResponse,
        { status: 400 }
      );
    }

    // Validar minRating
    const finalMinRating = minRating ?? PLACES_CONFIG.DEFAULT_MIN_RATING;

    if (minRating !== undefined && (typeof minRating !== 'number' || minRating < 0 || minRating > 5)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid minRating',
          message: 'minRating must be between 0 and 5',
        } as GetRestaurantsResponse,
        { status: 400 }
      );
    }

    // Validar radiusKm
    const finalRadiusKm = radiusKm ?? PLACES_CONFIG.DEFAULT_RADIUS_KM;

    if (radiusKm !== undefined && (typeof radiusKm !== 'number' || radiusKm < 1 || radiusKm > 50)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid radiusKm',
          message: 'radiusKm must be between 1 and 50',
        } as GetRestaurantsResponse,
        { status: 400 }
      );
    }

    // Validar priceLevel
    if (priceLevel) {
      if (!Array.isArray(priceLevel)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid priceLevel',
            message: 'priceLevel must be an array',
          } as GetRestaurantsResponse,
          { status: 400 }
        );
      }

      if (!priceLevel.every(level => typeof level === 'number' && level >= 0 && level <= 4)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid priceLevel',
            message: 'priceLevel values must be between 0 and 4',
          } as GetRestaurantsResponse,
          { status: 400 }
        );
      }
    }

    // Realizar búsqueda
    const restaurants = await restaurantsService.searchRestaurants({
      cityName,
      coordinates,
      placeId,
      categories: validatedCategories,
      limit: finalLimit,
      minRating: finalMinRating,
      radiusKm: finalRadiusKm,
      priceLevel,
    });

    // Respuesta exitosa
    const response: GetRestaurantsResponse = {
      success: true,
      data: {
        city: cityName,
        coordinates,
        totalResults: restaurants.length,
        restaurants,
      },
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });

  } catch (error) {
    console.error('Error in restaurants API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: errorMessage,
      } as GetRestaurantsResponse,
      { status: 500 }
    );
  }
}