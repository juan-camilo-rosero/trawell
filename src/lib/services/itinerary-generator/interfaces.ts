import {
  ICoordinates,
  RestaurantCategory,
  CabinClass,
} from "@/models/types";
import {
  ISearchParams,
  IDay,
} from "@/models/itinerary/interfaces";

export interface GenerateItineraryRequest {
  originCityName: string;
  originCoordinates: ICoordinates;
  originPlaceId?: string;
  destinationCityName: string;
  destinationCoordinates: ICoordinates;
  destinationPlaceId?: string;
  departureDate: Date;
  returnDate: Date;
  adults: number;
  children?: number;
  babies?: number;
  travelType:
    | "relaxation"
    | "luxury"
    | "cultural"
    | "adventure"
    | "gastronomic"
    | "spiritual";
  foodPreferences: RestaurantCategory[];

  cabinClass?: CabinClass;
  maxStops?: number;
  budget?: number;
  hotelBudgetPerNight?: number;
  preferredHotelChains?: string[];
  currency?: string;
}

export interface GenerateItineraryResponse {
  searchParams: ISearchParams;
  title: string;
  totalPrice: number;
  currency: string;
  days: IDay[];
}

export interface APILimits {
  restaurants: number;
  touristSites: number;
  hotels: number;
}