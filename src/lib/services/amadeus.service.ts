// @/lib/services/amadeus.service.ts

import { AMADEUS_CONFIG } from "../config/amadeus.config";

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

      if (
        tokenAge <
        this.token.expires_in - AMADEUS_CONFIG.TOKEN_EXPIRY_BUFFER
      ) {
        return this.token.access_token;
      }
    }

    // Obtener nuevo token
    const url = `${AMADEUS_CONFIG.BASE_URL}${AMADEUS_CONFIG.TOKEN_ENDPOINT}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: AMADEUS_CONFIG.API_KEY,
        client_secret: AMADEUS_CONFIG.API_SECRET,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Amadeus authentication failed: ${response.status} - ${JSON.stringify(
          errorData
        )}`
      );
    }

    const data: unknown = await response.json();

    if (
      typeof data !== "object" ||
      data === null ||
      !("access_token" in data) ||
      !("expires_in" in data) ||
      !("token_type" in data)
    ) {
      throw new Error("Invalid token response structure from Amadeus");
    }

    const tokenData = data as AmadeusToken & {
      access_token: string;
      expires_in: number;
      token_type: string;
    };

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
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const token = await this.getAccessToken();

    const url = new URL(`${AMADEUS_CONFIG.BASE_URL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
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
        radiusUnit: "KM",
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
    const {
      hotelIds,
      adults,
      checkInDate,
      checkOutDate,
      roomQuantity,
      currency,
      boardType,
    } = params;

    const hotelIdsString = hotelIds
      .slice(0, AMADEUS_CONFIG.MAX_HOTEL_IDS_PER_REQUEST)
      .join(",");

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
        bestRateOnly: true,
      }
    );
  }

  /**
   * Busca el aeropuerto más cercano a unas coordenadas
   */
  async searchNearestAirport(
    latitude: number,
    longitude: number,
    radiusKm: number = AMADEUS_CONFIG.DEFAULT_AIRPORT_RADIUS_KM
  ): Promise<AmadeusAirportResponse> {
    console.log(`🔎 Llamando a Amadeus Airport API con:`, {
      latitude,
      longitude,
      radius: radiusKm,
      endpoint: AMADEUS_CONFIG.AIRPORT_NEAREST_ENDPOINT,
    });

    try {
      const response = await this.get<AmadeusAirportResponse>(
        AMADEUS_CONFIG.AIRPORT_NEAREST_ENDPOINT,
        {
          latitude,
          longitude,
          radius: radiusKm,
        }
      );

      console.log(
        "📥 Respuesta de Amadeus:",
        JSON.stringify(response, null, 2)
      );
      return response;
    } catch (error) {
      console.error("❌ Error en searchNearestAirport:", error);
      throw error;
    }
  }

  /**
   * Busca ofertas de vuelos
   */
  async searchFlightOffers(params: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate: string;
    adults: number;
    children?: number;
    infants?: number;
    travelClass?: string;
    nonStop?: boolean;
    currencyCode?: string;
    max?: number;
  }): Promise<AmadeusFlightOffersResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      originLocationCode: params.originLocationCode,
      destinationLocationCode: params.destinationLocationCode,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.adults,
      children: params.children,
      infants: params.infants,
      travelClass: params.travelClass,
      nonStop: params.nonStop,
      currencyCode: params.currencyCode || AMADEUS_CONFIG.DEFAULT_CURRENCY,
      max: params.max || AMADEUS_CONFIG.DEFAULT_LIMIT,
    };

    return this.get<AmadeusFlightOffersResponse>(
      AMADEUS_CONFIG.FLIGHT_OFFERS_ENDPOINT,
      queryParams
    );
  }

  /**
   * Invalida el token actual (útil para testing o reset)
   */
  invalidateToken(): void {
    this.token = null;
  }
}

// ============================================
// TIPOS DE RESPUESTA DE AMADEUS - HOTELES
// ============================================

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

// ============================================
// TIPOS DE RESPUESTA DE AMADEUS - AEROPUERTOS
// ============================================

export interface AmadeusAirportResponse {
  data: Array<{
    type: string;
    subType: string;
    name: string;
    detailedName?: string;
    iataCode: string;
    address: {
      cityName: string;
      countryCode: string;
      regionCode?: string;
    };
    geoCode: {
      latitude: number;
      longitude: number;
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

// ============================================
// TIPOS DE RESPUESTA DE AMADEUS - VUELOS
// ============================================

export interface AmadeusFlightOffersResponse {
  data: Array<{
    type: string;
    id: string;
    source: string;
    instantTicketingRequired: boolean;
    nonHomogeneous: boolean;
    oneWay: boolean;
    lastTicketingDate?: string;
    numberOfBookableSeats?: number;
    itineraries: Array<{
      duration: string;
      segments: Array<{
        departure: {
          iataCode: string;
          terminal?: string;
          at: string;
        };
        arrival: {
          iataCode: string;
          terminal?: string;
          at: string;
        };
        carrierCode: string;
        number: string;
        aircraft?: {
          code: string;
        };
        operating?: {
          carrierCode: string;
        };
        duration: string;
        id: string;
        numberOfStops: number;
        blacklistedInEU?: boolean;
      }>;
    }>;
    price: {
      currency: string;
      total: string;
      base?: string;
      fees?: Array<{
        amount: string;
        type: string;
      }>;
      grandTotal: string;
    };
    pricingOptions?: {
      fareType: string[];
      includedCheckedBagsOnly: boolean;
    };
    validatingAirlineCodes: string[];
    travelerPricings?: Array<{
      travelerId: string;
      fareOption: string;
      travelerType: string;
      price: {
        currency: string;
        total: string;
        base?: string;
      };
      fareDetailsBySegment?: Array<{
        segmentId: string;
        cabin: string;
        fareBasis: string;
        class: string;
        includedCheckedBags?: {
          quantity: number;
        };
      }>;
    }>;
  }>;
  dictionaries?: {
    locations?: Record<
      string,
      {
        cityCode: string;
        countryCode: string;
      }
    >;
    aircraft?: Record<string, string>;
    currencies?: Record<string, string>;
    carriers?: Record<string, string>;
  };
  meta?: {
    count: number;
  };
}

export const amadeusService = new AmadeusService();
