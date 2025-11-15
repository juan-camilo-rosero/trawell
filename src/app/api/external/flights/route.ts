// @/app/api/external/places/flights/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { flightsService } from '@/lib/services/flights.service';
import { GetFlightsRequest, GetFlightsResponse, CabinClass } from '@/models/types';
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
export async function OPTIONS() {
  return NextResponse.json({}, { 
    status: 200,
    headers: corsHeaders(),
  });
}

/**
 * POST /api/external/places/flights
 * 
 * Body parameters:
 * - originCityName (required): Nombre de la ciudad de origen
 * - destinationCityName (required): Nombre de la ciudad de destino
 * - originCoordinates (required): { lat: number, lng: number }
 * - destinationCoordinates (required): { lat: number, lng: number }
 * - departureDate (required): Fecha de ida (YYYY-MM-DD)
 * - returnDate (required): Fecha de vuelta (YYYY-MM-DD)
 * - adults (required): Número de adultos
 * - children (optional): Número de niños (2-11 años)
 * - infants (optional): Número de bebés (< 2 años)
 * - cabinClass (optional): Clase de cabina ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST')
 * - maxStops (optional): Número máximo de escalas (0 = directo, 1 = 1 escala, etc.)
 * - limit (optional): Límite de resultados (default: 10, max: 50)
 * - radiusKm (optional): Radio de búsqueda de aeropuertos en km (default: 50)
 * - priceRange (optional): { min?: number, max?: number }
 * - currency (optional): Código de moneda (default: 'COP')
 */
export async function POST(request: NextRequest) {
  try {
    const body: Partial<GetFlightsRequest & { 
      originCityName: string; 
      destinationCityName: string 
    }> = await request.json();

    // Validar parámetros requeridos
    const {
      originCityName,
      destinationCityName,
      originCoordinates,
      destinationCoordinates,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      cabinClass,
      maxStops,
      limit,
      radiusKm,
      priceRange,
      currency,
    } = body;

    if (!originCityName || !destinationCityName || !originCoordinates || !destinationCoordinates || 
        !departureDate || !returnDate || !adults) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
          message: 'originCityName, destinationCityName, originCoordinates, destinationCoordinates, departureDate, returnDate, and adults are required',
        } as GetFlightsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar coordenadas de origen
    const { lat: originLat, lng: originLng } = originCoordinates;

    if (typeof originLat !== 'number' || typeof originLng !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid originCoordinates',
          message: 'originCoordinates.lat and originCoordinates.lng must be valid numbers',
        } as GetFlightsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    if (originLat < -90 || originLat > 90 || originLng < -180 || originLng > 180) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid originCoordinates',
          message: 'Origin coordinates out of valid range',
        } as GetFlightsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar coordenadas de destino
    const { lat: destLat, lng: destLng } = destinationCoordinates;

    if (typeof destLat !== 'number' || typeof destLng !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid destinationCoordinates',
          message: 'destinationCoordinates.lat and destinationCoordinates.lng must be valid numbers',
        } as GetFlightsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    if (destLat < -90 || destLat > 90 || destLng < -180 || destLng > 180) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid destinationCoordinates',
          message: 'Destination coordinates out of valid range',
        } as GetFlightsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar formato de fechas (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(departureDate) || !dateRegex.test(returnDate)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format',
          message: 'Dates must be in YYYY-MM-DD format',
        } as GetFlightsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar que returnDate sea después de departureDate
    const departure = new Date(departureDate);
    const returnD = new Date(returnDate);

    if (returnD <= departure) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid dates',
          message: 'returnDate must be after departureDate',
        } as GetFlightsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar que departureDate no sea en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (departure < today) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date',
          message: 'departureDate cannot be in the past',
        } as GetFlightsResponse,
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
        } as GetFlightsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar children si se proporciona
    if (children !== undefined && (typeof children !== 'number' || children < 0 || children > 9)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid children',
          message: 'children must be a number between 0 and 9',
        } as GetFlightsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar infants si se proporciona
    if (infants !== undefined && (typeof infants !== 'number' || infants < 0 || infants > 9)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid infants',
          message: 'infants must be a number between 0 and 9',
        } as GetFlightsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar que el número de infants no exceda el número de adultos
    if (infants && infants > adults) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid infants',
          message: 'Number of infants cannot exceed number of adults',
        } as GetFlightsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar cabinClass si se proporciona
    const validCabinClasses: CabinClass[] = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];
    if (cabinClass && !validCabinClasses.includes(cabinClass)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid cabinClass',
          message: `cabinClass must be one of: ${validCabinClasses.join(', ')}`,
        } as GetFlightsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar maxStops si se proporciona
    if (maxStops !== undefined && (typeof maxStops !== 'number' || maxStops < 0 || maxStops > 3)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid maxStops',
          message: 'maxStops must be a number between 0 and 3',
        } as GetFlightsResponse,
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
        } as GetFlightsResponse,
        { 
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Validar radiusKm
    const finalRadiusKm = radiusKm ?? AMADEUS_CONFIG.DEFAULT_AIRPORT_RADIUS_KM;

    if (radiusKm && (typeof radiusKm !== 'number' || radiusKm < 1 || radiusKm > 200)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid radiusKm',
          message: 'radiusKm must be between 1 and 200',
        } as GetFlightsResponse,
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
          } as GetFlightsResponse,
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
          } as GetFlightsResponse,
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
          } as GetFlightsResponse,
          { 
            status: 400,
            headers: corsHeaders(),
          }
        );
      }
    }

    // Realizar búsqueda
    const flights = await flightsService.searchFlights({
      originCoordinates,
      destinationCoordinates,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      cabinClass,
      maxStops,
      limit: finalLimit,
      radiusKm: finalRadiusKm,
      priceRange,
      currency,
    });

    // Respuesta exitosa
    const response: GetFlightsResponse = {
      success: true,
      data: {
        originAirport: flights[0]?.origin || {
          iataCode: '',
          name: '',
          cityName: originCityName,
          countryCode: '',
          coordinates: originCoordinates,
        },
        destinationAirport: flights[0]?.destination || {
          iataCode: '',
          name: '',
          cityName: destinationCityName,
          countryCode: '',
          coordinates: destinationCoordinates,
        },
        departureDate,
        returnDate,
        totalResults: flights.length,
        flights,
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
    console.error('Error in flights API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: errorMessage,
      } as GetFlightsResponse,
      { 
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}