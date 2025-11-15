import { NextRequest, NextResponse } from 'next/server';
import { hotelsService } from '@/lib/services/hotels.service';
import { GetHotelsRequest, GetHotelsResponse } from '@/models/types';
import { AMADEUS_CONFIG } from '@/lib/config/amadeus.config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Función helper para manejar CORS
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// Handler para OPTIONS (preflight request)
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { 
    status: 200,
    headers: corsHeaders(),
  });
}

/**
 * POST /api/external/places/hotels
 * 
 * Body parameters:
 * - cityName (required): Nombre de la ciudad
 * - coordinates (required): { lat: number, lng: number }
 * - checkInDate (required): Fecha de check-in (YYYY-MM-DD)
 * - checkOutDate (required): Fecha de check-out (YYYY-MM-DD)
 * - adults (required): Número de adultos
 * - children (optional): Número de niños
 * - rooms (optional): Número de habitaciones (default: 1)
 * - limit (optional): Límite de resultados (default: 10, max: 50)
 * - radiusKm (optional): Radio de búsqueda en km (default: 15)
 * - priceRange (optional): { min?: number, max?: number }
 * - currency (optional): Código de moneda (default: 'COP')
 * - boardType (optional): Tipo de pensión ('ROOM_ONLY', 'BREAKFAST', etc.)
 * - chainCodes (optional): Array de códigos de cadenas hoteleras
 */
export async function POST(request: NextRequest) {
  try {
    const body: Partial<GetHotelsRequest> = await request.json();

    // Validar parámetros requeridos
    const {
      cityName,
      coordinates,
      checkInDate,
      checkOutDate,
      adults,
      children,
      rooms,
      limit,
      radiusKm,
      priceRange,
      currency,
      boardType,
      chainCodes,
    } = body;

    if (!cityName || !coordinates || !checkInDate || !checkOutDate || !adults) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
          message: 'cityName, coordinates, checkInDate, checkOutDate, and adults are required',
        } as GetHotelsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
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
        } as GetHotelsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid coordinates',
          message: 'Coordinates out of valid range',
        } as GetHotelsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar formato de fechas (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(checkInDate) || !dateRegex.test(checkOutDate)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format',
          message: 'Dates must be in YYYY-MM-DD format',
        } as GetHotelsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar que checkOut sea después de checkIn
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid dates',
          message: 'checkOutDate must be after checkInDate',
        } as GetHotelsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar que checkIn no sea en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date',
          message: 'checkInDate cannot be in the past',
        } as GetHotelsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar adults
    if (typeof adults !== 'number' || adults < 1 || adults > 9) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid adults',
          message: 'adults must be a number between 1 and 9',
        } as GetHotelsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar children si se proporciona
    if (children !== undefined && (typeof children !== 'number' || children < 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid children',
          message: 'children must be a non-negative number',
        } as GetHotelsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar rooms si se proporciona
    if (rooms !== undefined && (typeof rooms !== 'number' || rooms < 1 || rooms > 9)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid rooms',
          message: 'rooms must be a number between 1 and 9',
        } as GetHotelsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar limit
    const finalLimit = limit 
      ? Math.min(limit, AMADEUS_CONFIG.MAX_LIMIT)
      : AMADEUS_CONFIG.DEFAULT_LIMIT;

    if (limit && (typeof limit !== 'number' || limit < 1)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid limit',
          message: 'limit must be a positive number',
        } as GetHotelsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar radiusKm
    const finalRadiusKm = radiusKm ?? AMADEUS_CONFIG.DEFAULT_RADIUS_KM;

    if (radiusKm && (typeof radiusKm !== 'number' || radiusKm < 1 || radiusKm > 50)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid radiusKm',
          message: 'radiusKm must be between 1 and 50',
        } as GetHotelsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar priceRange si se proporciona
    if (priceRange) {
      if (priceRange.min !== undefined && (typeof priceRange.min !== 'number' || priceRange.min < 0)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid priceRange',
            message: 'priceRange.min must be a non-negative number',
          } as GetHotelsResponse,
          { 
            status: 400,
            headers: corsHeaders(),
          }
        );
      }

      if (priceRange.max !== undefined && (typeof priceRange.max !== 'number' || priceRange.max < 0)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid priceRange',
            message: 'priceRange.max must be a non-negative number',
          } as GetHotelsResponse,
          { 
            status: 400,
            headers: corsHeaders(),
          }
        );
      }

      if (priceRange.min !== undefined && priceRange.max !== undefined && priceRange.min > priceRange.max) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid priceRange',
            message: 'priceRange.min must be less than or equal to priceRange.max',
          } as GetHotelsResponse,
          { 
            status: 400,
            headers: corsHeaders(),
          }
        );
      }
    }

    // Validar chainCodes si se proporciona
    if (chainCodes && !Array.isArray(chainCodes)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid chainCodes',
          message: 'chainCodes must be an array',
        } as GetHotelsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Realizar búsqueda
    const hotels = await hotelsService.searchHotels({
      cityName,
      coordinates,
      checkInDate,
      checkOutDate,
      adults,
      children,
      rooms,
      limit: finalLimit,
      radiusKm: finalRadiusKm,
      priceRange,
      currency,
      boardType,
      chainCodes,
    });

    // Respuesta exitosa
    const response: GetHotelsResponse = {
      success: true,
      data: {
        city: cityName,
        coordinates,
        checkInDate,
        checkOutDate,
        totalResults: hotels.length,
        hotels,
      },
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        ...corsHeaders(),
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });

  } catch (error) {
    console.error('Error in hotels API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: errorMessage,
      } as GetHotelsResponse,
      { 
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}