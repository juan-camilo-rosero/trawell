// @/lib/services/amadeus.service.ts

import { AMADEUS_CONFIG } from '../config/amadeus.config';

interface AmadeusToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  timestamp: number;
}

class AmadeusService {
  private token: AmadeusToken | null = null;

  /**
   * Obtiene un access token válido (reutiliza si no ha expirado)
   */
  private async getAccessToken(): Promise<string> {
    // Verificar si el token existe y no ha expirado
    if (this.token) {
      const now = Date.now();
      const tokenAge = (now - this.token.timestamp) / 1000;

      if (tokenAge < (this.token.expires_in - AMADEUS_CONFIG.TOKEN_EXPIRY_BUFFER)) {
        return this.token.access_token;
      }
    }

    // Obtener nuevo token
    const url = `${AMADEUS_CONFIG.BASE_URL}${AMADEUS_CONFIG.TOKEN_ENDPOINT}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_CONFIG.API_KEY,
        client_secret: AMADEUS_CONFIG.API_SECRET,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Amadeus authentication failed: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    // Se asume que 'data' cumple con la estructura necesaria para un token
    const data: unknown = await response.json();

    // Comprobación de tipos básicos para evitar 'any' en la asignación
    if (typeof data !== 'object' || data === null || !('access_token' in data) || !('expires_in' in data) || !('token_type' in data)) {
        throw new Error('Invalid token response structure from Amadeus');
    }
    
    // Se asume que los tipos son correctos si la respuesta es exitosa
    const tokenData = data as AmadeusToken & { access_token: string, expires_in: number, token_type: string };


    this.token = {
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      timestamp: Date.now(),
    };

    return this.token.access_token;
  }

  /**
   * Realiza una petición GET autenticada a Amadeus
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const token = await this.getAccessToken();

    const url = new URL(`${AMADEUS_CONFIG.BASE_URL}${endpoint}`);

    if (params) {
      // Se utiliza Record<string, string | number | boolean | undefined> para 'params'
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Amadeus API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data: unknown = await response.json();
    return data as T;
  }

  /**
   * Busca hoteles por coordenadas geográficas
   */
  async searchHotelsByGeocode(
    latitude: number,
    longitude: number,
    radiusKm: number = AMADEUS_CONFIG.DEFAULT_RADIUS_KM
  ): Promise<AmadeusHotelListResponse> {
    return this.get<AmadeusHotelListResponse>(
      AMADEUS_CONFIG.HOTEL_LIST_ENDPOINT,
      {
        latitude,
        longitude,
        radius: radiusKm,
        radiusUnit: 'KM',
      }
    );
  }

  /**
   * Busca ofertas de hoteles específicos
   */
  async searchHotelOffers(params: {
    hotelIds: string[];
    adults: number;
    checkInDate: string;
    checkOutDate?: string;
    roomQuantity?: number;
    currency?: string;
    boardType?: string;
  }): Promise<AmadeusHotelSearchResponse> {
    const { hotelIds, adults, checkInDate, checkOutDate, roomQuantity, currency, boardType } = params;

    // Amadeus acepta hasta 30 hotelIds separados por coma
    const hotelIdsString = hotelIds.slice(0, AMADEUS_CONFIG.MAX_HOTEL_IDS_PER_REQUEST).join(',');

    return this.get<AmadeusHotelSearchResponse>(
      AMADEUS_CONFIG.HOTEL_SEARCH_ENDPOINT,
      {
        hotelIds: hotelIdsString,
        adults,
        checkInDate,
        checkOutDate,
        roomQuantity: roomQuantity || 1,
        currency: currency || AMADEUS_CONFIG.DEFAULT_CURRENCY,
        boardType,
        bestRateOnly: true, // Solo la mejor tarifa por hotel
      }
    );
  }

  /**
   * Invalida el token actual (útil para testing o reset)
   */
  invalidateToken(): void {
    this.token = null;
  }
}

// Tipos de respuesta de Amadeus

export interface AmadeusHotelListResponse {
  data: Array<{
    hotelId: string;
    name: string;
    chainCode?: string;
    geoCode: {
      latitude: number;
      longitude: number;
    };
    address?: {
      countryCode: string;
    };
    distance?: {
      value: number;
      unit: string;
    };
  }>;
  meta?: {
    count: number;
  };
}

export interface AmadeusHotelSearchResponse {
  data: Array<{
    type: string;
    hotel: {
      hotelId: string;
      chainCode?: string;
      name: string;
      cityCode?: string;
      latitude?: number;
      longitude?: number;
    };
    available: boolean;
    offers: Array<{
      id: string;
      checkInDate: string;
      checkOutDate: string;
      roomQuantity?: number;
      rateCode?: string;
      room?: {
        type?: string;
        typeEstimated?: {
          category?: string;
          beds?: number;
          bedType?: string;
        };
        description?: {
          text?: string;
          lang?: string;
        };
      };
      guests?: {
        adults: number;
      };
      price: {
        currency: string;
        base?: string;
        total: string;
        taxes?: Array<{
          amount?: string;
          currency?: string;
          code?: string;
        }>;
        variations?: {
          average?: {
            base?: string;
            total?: string;
          };
        };
      };
      policies?: {
        cancellations?: Array<{
          deadline?: string;
          amount?: string;
          type?: string;
          description?: {
            text?: string;
          };
        }>;
        guarantee?: {
          acceptedPayments?: {
            methods?: string[];
          };
        };
        deposit?: {
          amount?: string;
          deadline?: string;
        };
      };
      boardType?: string;
    }>;
  }>;
  meta?: {
    count: number;
  };
}

export const amadeusService = new AmadeusService();