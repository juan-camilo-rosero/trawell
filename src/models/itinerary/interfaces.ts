import { Document, Types } from 'mongoose';
import {
  ILocation,
  ILocationWithAddress,
  ITravelers,
  IOpeningHours,
  IPhoto,
  ItemType,
  FlightResponse,
  HotelResponse,
  RestaurantResponse,
  TouristSiteResponse,
} from '../types';

export interface ISearchParams {
  originCity: ILocation;
  destinationCity: ILocation;
  departureDate: Date;
  returnDate: Date;
  travelers: ITravelers;
  travelType: string;
}

export interface IFlightDetails {
  carrierCode: string;
  carrierName: string;
  flightNumber?: string;
  departureAirport: string;
  departureAirportName: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalAirportName: string;
  arrivalTime: string;
  duration: string;
  numberOfStops: number;
  pricePerPerson: number;
  totalPrice: number;
}

export interface IAccommodationDetails {
  hotelId: string;
  hotelName: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  roomType: string;
}

export interface IFoodDetails {
  restaurantName: string;
  cuisine: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  priceLevel: number;
  rating: number;
  userRatingsTotal: number;
  openingHours?: IOpeningHours;
}

export interface ITouristSiteDetails {
  siteName: string;
  category: 'museum' | 'park' | 'monument' | 'historical';
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
  entryFee: number;
  hasFee: boolean;
  estimatedDuration: string;
  openingHours?: IOpeningHours;
  photos?: IPhoto[];
}

export interface IItineraryItem {
  _id?: Types.ObjectId | string;
  itemId: string;
  type: ItemType;
  order: number;
  time: string;
  title: string;
  description: string;
  price: number;
  location: ILocationWithAddress;
  flightDetails?: IFlightDetails;
  accommodationDetails?: IAccommodationDetails;
  foodDetails?: IFoodDetails;
  touristSiteDetails?: ITouristSiteDetails;
}

export interface IDay {
  _id?: Types.ObjectId | string;
  dayNumber: number;
  date: Date;
  items: IItineraryItem[];
}

export interface IAvailableResources {
  flights: FlightResponse[];
  hotels: HotelResponse[];
  restaurants: RestaurantResponse[];
  touristSites: TouristSiteResponse[];
}

export interface IItinerary extends Document {
  userId: string;
  searchParams: ISearchParams;
  title: string;
  totalPrice: number;
  currency: string;
  isPublic: boolean;
  days: IDay[];
  availableResources?: IAvailableResources;
  lastViewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}