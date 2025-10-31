// src/app/api/external/places/tourist-sites/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { placesService } from '@/lib/services/places.service';
import { GetTouristSitesResponse, TouristSiteCategory } from '@/models/types';
import { PLACES_CONFIG } from '@/lib/config/places.config';

/**
 * GET /api/external/places/tourist-sites
 * 
 * Query parameters:
 * - cityName (required): Nombre de la ciudad
 * - lat (required): Latitud de la ciudad
 * - lng (required): Longitud de la ciudad
 * - placeId (optional): Place ID de la ciudad
 * - categories (optional): Categorías separadas por coma (museum,park,monument,historical)
 * - limit (optional): Límite de resultados por categoría (default: 10, max: 20)
 * - minRating (optional): Rating mínimo (default: 3.5)
 * - radiusKm (optional): Radio de búsqueda en km (default: 15)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Validar parámetros requeridos
    const cityName = searchParams.get('cityName');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!cityName || !lat || !lng) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
          message: 'cityName, lat, and lng are required',
        } as GetTouristSitesResponse,
        { status: 400 }
      );
    }

    // Parsear coordenadas
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid coordinates',
          message: 'lat and lng must be valid numbers',
        } as GetTouristSitesResponse,
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid coordinates',
          message: 'Coordinates out of valid range',
        } as GetTouristSitesResponse,
        { status: 400 }
      );
    }

    // Parsear parámetros opcionales
    const placeId = searchParams.get('placeId') || undefined;
    
    const categoriesParam = searchParams.get('categories');
    const categories = categoriesParam
      ? (categoriesParam.split(',') as TouristSiteCategory[])
      : undefined;

    // Validar categorías
    const validCategories: TouristSiteCategory[] = ['museum', 'park', 'monument', 'historical'];
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

    const limitParam = searchParams.get('limit');
    const limit = limitParam 
      ? Math.min(parseInt(limitParam), PLACES_CONFIG.MAX_RESULTS)
      : PLACES_CONFIG.DEFAULT_LIMIT_PER_CATEGORY;

    if (limitParam && (isNaN(limit) || limit < 1)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid limit',
          message: 'limit must be a positive number',
        } as GetTouristSitesResponse,
        { status: 400 }
      );
    }

    const minRatingParam = searchParams.get('minRating');
    const minRating = minRatingParam 
      ? parseFloat(minRatingParam)
      : PLACES_CONFIG.DEFAULT_MIN_RATING;

    if (minRatingParam && (isNaN(minRating) || minRating < 0 || minRating > 5)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid minRating',
          message: 'minRating must be between 0 and 5',
        } as GetTouristSitesResponse,
        { status: 400 }
      );
    }

    const radiusKmParam = searchParams.get('radiusKm');
    const radiusKm = radiusKmParam 
      ? parseFloat(radiusKmParam)
      : PLACES_CONFIG.DEFAULT_RADIUS_KM;

    if (radiusKmParam && (isNaN(radiusKm) || radiusKm < 1 || radiusKm > 50)) {
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
      coordinates: { lat: latitude, lng: longitude },
      placeId,
      categories,
      limit,
      minRating,
      radiusKm,
    });

    // Respuesta exitosa
    const response: GetTouristSitesResponse = {
      success: true,
      data: {
        city: cityName,
        coordinates: { lat: latitude, lng: longitude },
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