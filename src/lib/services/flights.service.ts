// @/lib/services/flights.service.ts

import {
  amadeusService,
  AmadeusFlightOffersResponse,
  AmadeusAirportResponse,
} from './amadeus.service';
import { AMADEUS_CONFIG, AIRLINE_NAMES } from '../config/amadeus.config';
import {
  GetFlightsRequest,
  FlightResponse,
  FlightItinerary,
  FlightSegment,
  FlightPriceDetails,
  IAirport,
  CabinClass,
} from '@/models/types';

class FlightsService {
  /**
   * Busca vuelos con disponibilidad y precios en tiempo real
   */
  async searchFlights(params: GetFlightsRequest): Promise<FlightResponse[]> {
    const {
      originCoordinates,
      destinationCoordinates,
      departureDate,
      returnDate,
      adults,
      children = 0,
      infants = 0,
      cabinClass = AMADEUS_CONFIG.DEFAULT_CABIN_CLASS,
      maxStops,
      limit = AMADEUS_CONFIG.DEFAULT_LIMIT,
      priceRange,
      currency = AMADEUS_CONFIG.DEFAULT_CURRENCY,
      radiusKm = AMADEUS_CONFIG.DEFAULT_AIRPORT_RADIUS_KM,
    } = params;

    // Paso 1: Encontrar aeropuertos más cercanos
    const [originAirportResponse, destinationAirportResponse] = await Promise.all([
      amadeusService.searchNearestAirport(
        originCoordinates.lat,
        originCoordinates.lng,
        radiusKm
      ),
      amadeusService.searchNearestAirport(
        destinationCoordinates.lat,
        destinationCoordinates.lng,
        radiusKm
      ),
    ]);

    // Validar que se encontraron aeropuertos
    if (!originAirportResponse.data || originAirportResponse.data.length === 0) {
      throw new Error(
        `No se encontraron aeropuertos cerca de las coordenadas de origen (${originCoordinates.lat}, ${originCoordinates.lng}) en un radio de ${radiusKm}km.`
      );
    }

    if (!destinationAirportResponse.data || destinationAirportResponse.data.length === 0) {
      throw new Error(
        `No se encontraron aeropuertos cerca de las coordenadas de destino (${destinationCoordinates.lat}, ${destinationCoordinates.lng}) en un radio de ${radiusKm}km.`
      );
    }

    const originAirport = this.transformAirportResponse(originAirportResponse.data[0]);
    const destinationAirport = this.transformAirportResponse(destinationAirportResponse.data[0]);

    // Paso 2: Buscar ofertas de vuelos
    const flightOffersResponse = await amadeusService.searchFlightOffers({
      originLocationCode: originAirport.iataCode,
      destinationLocationCode: destinationAirport.iataCode,
      departureDate,
      returnDate,
      adults,
      children: children > 0 ? children : undefined,
      infants: infants > 0 ? infants : undefined,
      travelClass: cabinClass,
      nonStop: maxStops === 0 ? true : undefined,
      currencyCode: currency,
      max: Math.min(limit * 2, AMADEUS_CONFIG.MAX_FLIGHT_RESULTS),
    });

    if (!flightOffersResponse.data || flightOffersResponse.data.length === 0) {
      return [];
    }

    // Paso 3: Transformar respuesta
    let flights = this.transformFlightOffersResponse(
      flightOffersResponse,
      originAirport,
      destinationAirport
    );

    // Paso 4: Aplicar filtros

    // Filtrar por número de escalas
    if (maxStops !== undefined) {
      flights = flights.filter(flight => {
        const outboundStops = flight.outbound.segments.length - 1;
        const inboundStops = flight.inbound.segments.length - 1;
        return outboundStops <= maxStops && inboundStops <= maxStops;
      });
    }

    // Filtrar por rango de precio
    if (priceRange) {
      flights = flights.filter(flight => {
        const total = flight.price.grandTotal;
        const meetsMin = priceRange.min ? total >= priceRange.min : true;
        const meetsMax = priceRange.max ? total <= priceRange.max : true;
        return meetsMin && meetsMax;
      });
    }

    // Paso 5: Ordenar por precio (más barato primero)
    flights.sort((a, b) => a.price.grandTotal - b.price.grandTotal);

    // Paso 6: Limitar resultados
    return flights.slice(0, limit);
  }

  /**
   * Transforma un aeropuerto de Amadeus a nuestro formato
   */
  private transformAirportResponse(airportData: AmadeusAirportResponse['data'][0]): IAirport {
    return {
      iataCode: airportData.iataCode,
      name: airportData.name,
      cityName: airportData.address.cityName,
      countryCode: airportData.address.countryCode,
      coordinates: {
        lat: airportData.geoCode.latitude,
        lng: airportData.geoCode.longitude,
      },
    };
  }

  /**
   * Transforma ofertas de vuelos de Amadeus a nuestro formato
   */
  private transformFlightOffersResponse(
    response: AmadeusFlightOffersResponse,
    originAirport: IAirport,
    destinationAirport: IAirport
  ): FlightResponse[] {
    return response.data.map(offer => {
      // Extraer itinerarios (outbound = ida, inbound = vuelta)
      const outboundItinerary = offer.itineraries[0];
      const inboundItinerary = offer.itineraries[1];

      // Transformar segmentos
      const outbound: FlightItinerary = {
        duration: outboundItinerary.duration,
        segments: outboundItinerary.segments.map(seg => this.transformSegment(seg, response)),
      };

      const inbound: FlightItinerary = {
        duration: inboundItinerary.duration,
        segments: inboundItinerary.segments.map(seg => this.transformSegment(seg, response)),
      };

      // Construir precio
      const price: FlightPriceDetails = {
        currency: offer.price.currency,
        total: parseFloat(offer.price.total),
        base: offer.price.base ? parseFloat(offer.price.base) : undefined,
        fees: offer.price.fees
          ? offer.price.fees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0)
          : undefined,
        grandTotal: parseFloat(offer.price.grandTotal),
      };

      // Calcular taxes
      if (price.base && price.grandTotal) {
        price.taxes = price.grandTotal - price.base - (price.fees || 0);
      }

      // Extraer clase de cabina del primer traveler pricing
      let finalCabinClass: CabinClass = AMADEUS_CONFIG.DEFAULT_CABIN_CLASS;
      if (offer.travelerPricings && offer.travelerPricings[0]?.fareDetailsBySegment?.[0]) {
        const cabin = offer.travelerPricings[0].fareDetailsBySegment[0].cabin;
        finalCabinClass = this.mapCabinClass(cabin);
      }

      return {
        id: offer.id,
        origin: originAirport,
        destination: destinationAirport,
        outbound,
        inbound,
        price,
        cabinClass: finalCabinClass,
        numberOfBookableSeats: offer.numberOfBookableSeats,
        validatingAirlineCodes: offer.validatingAirlineCodes,
        travelerPricings: offer.travelerPricings,
      };
    });
  }

  /**
   * Transforma un segmento de vuelo
   */
  private transformSegment(
    segment: AmadeusFlightOffersResponse['data'][0]['itineraries'][0]['segments'][0],
    response: AmadeusFlightOffersResponse
  ): FlightSegment {
    const carrierName = this.getCarrierName(segment.carrierCode, response);

    return {
      departure: {
        iataCode: segment.departure.iataCode,
        terminal: segment.departure.terminal,
        at: segment.departure.at,
      },
      arrival: {
        iataCode: segment.arrival.iataCode,
        terminal: segment.arrival.terminal,
        at: segment.arrival.at,
      },
      carrierCode: segment.carrierCode,
      carrierName,
      flightNumber: segment.number,
      aircraft: segment.aircraft?.code,
      duration: segment.duration,
      numberOfStops: segment.numberOfStops,
      operatingCarrier: segment.operating?.carrierCode,
    };
  }

  /**
   * Obtiene el nombre de la aerolínea
   */
  private getCarrierName(
    carrierCode: string,
    response: AmadeusFlightOffersResponse
  ): string | undefined {
    if (response.dictionaries?.carriers?.[carrierCode]) {
      return response.dictionaries.carriers[carrierCode];
    }
    return AIRLINE_NAMES[carrierCode];
  }

  /**
   * Mapea la clase de cabina de Amadeus a nuestro tipo
   */
  private mapCabinClass(cabin: string): CabinClass {
    const cabinUpper = cabin.toUpperCase();
    
    if (cabinUpper.includes('FIRST')) return 'FIRST';
    if (cabinUpper.includes('BUSINESS')) return 'BUSINESS';
    if (cabinUpper.includes('PREMIUM')) return 'PREMIUM_ECONOMY';
    
    return 'ECONOMY';
  }
}

export const flightsService = new FlightsService();