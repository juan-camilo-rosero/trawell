// src/app/api/external/places/tourist-sites/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { placesService } from '@/lib/services/places.service';
import { GetTouristSitesResponse, TouristSiteCategory, GetTouristSitesRequest } from '@/models/types';
import { PLACES_CONFIG } from '@/lib/config/places.config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/external/places/tourist-sites
 * 
 * Body parameters:
 * - cityName (required): Nombre de la ciudad
 * - coordinates (required): { lat: number, lng: number }
 * - placeId (optional): Place ID de la ciudad
 * - categories (optional): Array de categorías ['museum', 'park', 'monument', 'historical']
 * - limit (optional): Límite de resultados por categoría (default: 10, max: 20)
 * - minRating (optional): Rating mínimo (default: 3.5)
 * - radiusKm (optional): Radio de búsqueda en km (default: 15)
 */
export async function POST(request: NextRequest) {
  try {
    const body: Partial<GetTouristSitesRequest> = await request.json();

    // Validar parámetros requeridos
    const { cityName, coordinates, placeId, categories, limit, minRating, radiusKm } = body;

    if (!cityName || !coordinates) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
          message: 'cityName and coordinates are required',
        } as GetTouristSitesResponse,
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
        } as GetTouristSitesResponse,
        { status: 400 }
      );
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid coordinates',
          message: 'Coordinates out of valid range',
        } as GetTouristSitesResponse,
        { status: 400 }
      );
    }

    // Validar categorías si se proporcionan
    const validCategories: TouristSiteCategory[] = ['museum', 'park', 'monument', 'historical'];
    if (categories && !Array.isArray(categories)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid categories',
          message: 'categories must be an array',
        } as GetTouristSitesResponse,
        { status: 400 }
      );
    }

    if (categories && !categories.every(cat => validCategories.includes(cat))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid categories',
          message: `Categories must be one of: ${validCategories.join(', ')}`,
        } as GetTouristSitesResponse,
        { status: 400 }
      );
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
        } as GetTouristSitesResponse,
        { status: 400 }
      );
    }

    // Validar minRating
    const finalMinRating = minRating ?? PLACES_CONFIG.DEFAULT_MIN_RATING;

    if (minRating && (typeof minRating !== 'number' || minRating < 0 || minRating > 5)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid minRating',
          message: 'minRating must be between 0 and 5',
        } as GetTouristSitesResponse,
        { status: 400 }
      );
    }

    // Validar radiusKm
    const finalRadiusKm = radiusKm ?? PLACES_CONFIG.DEFAULT_RADIUS_KM;

    if (radiusKm && (typeof radiusKm !== 'number' || radiusKm < 1 || radiusKm > 50)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid radiusKm',
          message: 'radiusKm must be between 1 and 50',
        } as GetTouristSitesResponse,
        { status: 400 }
      );
    }

    // Realizar búsqueda
    const sites = await placesService.searchTouristSites({
      cityName,
      coordinates,
      placeId,
      categories,
      limit: finalLimit,
      minRating: finalMinRating,
      radiusKm: finalRadiusKm,
    });

    // Respuesta exitosa
    const response: GetTouristSitesResponse = {
      success: true,
      data: {
        city: cityName,
        coordinates,
        totalResults: sites.length,
        sites,
      },
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });

  } catch (error) {
    console.error('Error in tourist-sites API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: errorMessage,
      } as GetTouristSitesResponse,
      { status: 500 }
    );
  }
}