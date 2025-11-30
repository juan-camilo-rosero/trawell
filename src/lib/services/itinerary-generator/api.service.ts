import {
  FlightResponse,
  HotelResponse,
  RestaurantResponse,
  TouristSiteResponse,
  RestaurantCategory,
} from "@/models/types";
import { GenerateItineraryRequest, APILimits } from "./interfaces";
import { formatDateToYYYYMMDD, getTouristCategoriesForTripType } from "@/lib/helpers/itinerary.helpers";

const API_BASE_URL = "https://trawell-yuxn.vercel.app/api/external";

export class APISearchService {
  async searchFlights(
    request: GenerateItineraryRequest,
    limits: APILimits
  ): Promise<FlightResponse[]> {
    try {
      console.log(limits)
      const response = await fetch(`${API_BASE_URL}/flights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originCityName: request.originCityName,
          destinationCityName: request.destinationCityName,
          originCoordinates: request.originCoordinates,
          destinationCoordinates: request.destinationCoordinates,
          departureDate: formatDateToYYYYMMDD(request.departureDate),
          returnDate: formatDateToYYYYMMDD(request.returnDate),
          adults: request.adults,
          children: request.children,
          infants: request.babies,
          cabinClass: request.cabinClass || "ECONOMY",
          maxStops: request.maxStops,
          limit: 10,
          currency: request.currency || "COP",
        }),
      });

      const data = await response.json();
      return data.success ? data.data.flights : [];
    } catch (error) {
      console.error("Error buscando vuelos:", error);
      return [];
    }
  }

  async searchHotels(
    request: GenerateItineraryRequest,
    limits: APILimits
  ): Promise<HotelResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/places/hotels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityName: request.destinationCityName,
          coordinates: request.destinationCoordinates,
          checkInDate: formatDateToYYYYMMDD(request.departureDate),
          checkOutDate: formatDateToYYYYMMDD(request.returnDate),
          adults: request.adults,
          children: request.children,
          rooms: 1,
          limit: limits.hotels,
          currency: request.currency || "COP",
          chainCodes: request.preferredHotelChains,
          priceRange: request.hotelBudgetPerNight
            ? { max: request.hotelBudgetPerNight }
            : undefined,
        }),
      });

      const data = await response.json();
      return data.success ? data.data.hotels : [];
    } catch (error) {
      console.error("Error buscando hoteles:", error);
      return [];
    }
  }

  async searchRestaurants(
    request: GenerateItineraryRequest,
    limits: APILimits
  ): Promise<RestaurantResponse[]> {
    try {
      const increasedLimit = Math.max(limits.restaurants, 15);

      const categoriesToSearch = request.foodPreferences.includes("all")
        ? ["all" as RestaurantCategory]
        : [
            ...request.foodPreferences,
            "casual" as RestaurantCategory,
            "italian" as RestaurantCategory,
          ];

      const response = await fetch(`${API_BASE_URL}/places/restaurants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityName: request.destinationCityName,
          coordinates: request.destinationCoordinates,
          placeId: request.destinationPlaceId,
          categories: categoriesToSearch,
          limit: increasedLimit,
          minRating: 3.0,
        }),
      });

      const data = await response.json();
      const restaurants = data.success ? data.data.restaurants : [];

      console.log(
        `[searchRestaurants] Total restaurantes encontrados: ${restaurants.length}`
      );

      return restaurants;
    } catch (error) {
      console.error("Error buscando restaurantes:", error);
      return [];
    }
  }

  async searchTouristSites(
    request: GenerateItineraryRequest,
    limits: APILimits
  ): Promise<TouristSiteResponse[]> {
    try {
      const categories = getTouristCategoriesForTripType(request.travelType);

      const response = await fetch(`${API_BASE_URL}/places/tourist-sites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityName: request.destinationCityName,
          coordinates: request.destinationCoordinates,
          placeId: request.destinationPlaceId,
          categories,
          limit: limits.touristSites,
          minRating: 3.5,
        }),
      });

      const data = await response.json();
      return data.success ? data.data.sites : [];
    } catch (error) {
      console.error("Error buscando sitios turísticos:", error);
      return [];
    }
  }
}