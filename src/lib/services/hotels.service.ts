// @/lib/services/hotels.service.ts

import { amadeusService, AmadeusHotelSearchResponse } from './amadeus.service';
import { AMADEUS_CONFIG } from '../config/amadeus.config';
import {
  GetHotelsRequest,
  HotelResponse,
  PriceDetails,
  RoomDetails,
  CancellationPolicy,
  ICoordinates,
} from '@/models/types';

class HotelsService {
  /**
   * Busca hoteles con disponibilidad y precios en tiempo real
   */
  async searchHotels(params: GetHotelsRequest): Promise<HotelResponse[]> {
    const {
      coordinates,
      checkInDate,
      checkOutDate,
      adults,
      children = 0,
      rooms = 1,
      limit = AMADEUS_CONFIG.DEFAULT_LIMIT,
      radiusKm = AMADEUS_CONFIG.DEFAULT_RADIUS_KM,
      priceRange,
      currency = AMADEUS_CONFIG.DEFAULT_CURRENCY,
      boardType,
      chainCodes,
    } = params;

    // Paso 1: Obtener lista de hoteles por geolocalización
    const hotelListResponse = await amadeusService.searchHotelsByGeocode(
      coordinates.lat,
      coordinates.lng,
      radiusKm
    );

    if (!hotelListResponse.data || hotelListResponse.data.length === 0) {
      return [];
    }

    // Filtrar por chainCodes si se especifica
    let hotelList = hotelListResponse.data;
    if (chainCodes && chainCodes.length > 0) {
      hotelList = hotelList.filter(hotel => 
        hotel.chainCode && chainCodes.includes(hotel.chainCode)
      );
    }

    // Limitar cantidad de hoteles a buscar
    const hotelIds = hotelList
      .slice(0, Math.min(limit * 2, AMADEUS_CONFIG.MAX_LIMIT)) // Buscar más para compensar filtros
      .map(hotel => hotel.hotelId);

    if (hotelIds.length === 0) {
      return [];
    }

    // Paso 2: Obtener ofertas con precios y disponibilidad
    // Dividir en batches si hay más de 30 hoteles
    const batches = this.chunkArray(hotelIds, AMADEUS_CONFIG.MAX_HOTEL_IDS_PER_REQUEST);
    const allOffers: HotelResponse[] = [];

    for (const batch of batches) {
      try {
        // Añadir delay para evitar rate limiting
        if (batches.indexOf(batch) > 0) {
          await this.delay(AMADEUS_CONFIG.RATE_LIMIT_DELAY);
        }

        const searchResponse = await amadeusService.searchHotelOffers({
          hotelIds: batch,
          adults: adults + children, // Amadeus cuenta niños como adultos
          checkInDate,
          checkOutDate,
          roomQuantity: rooms,
          currency,
          boardType,
        });

        const transformedHotels = this.transformSearchResponse(
          searchResponse,
          hotelListResponse,
          checkInDate,
          checkOutDate
        );

        allOffers.push(...transformedHotels);
      } catch (error) {
        console.error(`Error fetching batch of hotels:`, error);
        // Continuar con el siguiente batch en caso de error
      }
    }

    // Filtrar por rango de precio si se especifica
    let filteredHotels = allOffers;
    if (priceRange) {
      filteredHotels = filteredHotels.filter(hotel => {
        const total = hotel.price.total;
        const meetsMin = priceRange.min ? total >= priceRange.min : true;
        const meetsMax = priceRange.max ? total <= priceRange.max : true;
        return meetsMin && meetsMax;
      });
    }

    // Ordenar por precio (de menor a mayor)
    filteredHotels.sort((a, b) => a.price.total - b.price.total);

    // Limitar resultados finales
    return filteredHotels.slice(0, limit);
  }

  /**
   * Transforma la respuesta de Amadeus a nuestro formato
   */
  private transformSearchResponse(
    searchResponse: AmadeusHotelSearchResponse,
    hotelListResponse: { data: any[] },
    checkInDate: string,
    checkOutDate: string
  ): HotelResponse[] {
    if (!searchResponse.data || searchResponse.data.length === 0) {
      return [];
    }

    return searchResponse.data
      .filter(item => item.available && item.offers && item.offers.length > 0)
      .map(item => {
        const hotel = item.hotel;
        const offer = item.offers[0]; // Tomar la mejor oferta

        // Buscar info adicional del hotel en la lista original
        const hotelInfo = hotelListResponse.data.find(h => h.hotelId === hotel.hotelId);

        // Calcular precio por noche
        const totalPrice = parseFloat(offer.price.total);
        const checkIn = new Date(offer.checkInDate);
        const checkOut = new Date(offer.checkOutDate);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const pricePerNight = nights > 0 ? totalPrice / nights : totalPrice;

        // Construir precio
        const price: PriceDetails = {
          currency: offer.price.currency,
          total: totalPrice,
          base: offer.price.base ? parseFloat(offer.price.base) : undefined,
          pricePerNight: parseFloat(pricePerNight.toFixed(2)),
          taxes: offer.price.taxes?.[0]?.amount 
            ? parseFloat(offer.price.taxes[0].amount) 
            : undefined,
        };

        // Construir detalles de habitación
        const roomDetails: RoomDetails | undefined = offer.room ? {
          type: offer.room.type,
          typeEstimated: offer.room.typeEstimated,
          description: offer.room.description,
        } : undefined;

        // Construir política de cancelación
        const cancellationPolicy: CancellationPolicy | undefined = 
          offer.policies?.cancellations?.[0] ? {
            deadline: offer.policies.cancellations[0].deadline,
            amount: offer.policies.cancellations[0].amount,
            type: offer.policies.cancellations[0].type,
            description: offer.policies.cancellations[0].description?.text,
          } : undefined;

        // Construir coordenadas
        const coordinates: ICoordinates = {
          lat: hotel.latitude ?? hotelInfo?.geoCode?.latitude ?? 0,
          lng: hotel.longitude ?? hotelInfo?.geoCode?.longitude ?? 0,
        };

        return {
          hotelId: hotel.hotelId,
          name: hotel.name,
          chainCode: hotel.chainCode,
          address: undefined, // Amadeus v3 no proporciona dirección detallada
          coordinates,
          price,
          roomDetails,
          amenities: undefined, // No disponible en v3
          photos: undefined, // No disponible en Amadeus
          cancellationPolicy,
          checkInDate: offer.checkInDate,
          checkOutDate: offer.checkOutDate,
          boardType: offer.boardType as any,
          available: item.available,
          offerId: offer.id,
        };
      });
  }

  /**
   * Divide un array en chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Delay helper para rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const hotelsService = new HotelsService();