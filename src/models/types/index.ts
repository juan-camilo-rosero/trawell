export interface ICoordinates {
  lat: number;
  lng: number;
}

export interface ILocation {
  name: string;
  coordinates: ICoordinates;
  placeId?: string;
}

export interface ILocationWithAddress extends ILocation {
  address: string;
}

export interface ITravelers {
  adults: number;
  children: number;
  babies: number;
}

export interface IOpeningHours {
  openNow: boolean;
  weekdayText?: string[];
}

export interface IPhoto {
  photoReference: string;
  height: number;
  width: number;
}

// Item type discriminator
export type ItemType = 'flight' | 'accommodation' | 'food' | 'tourist_site';

export type TouristSiteCategory = 'museum' | 'park' | 'monument' | 'historical';

export interface GetTouristSitesRequest {
  cityName: string;
  coordinates: ICoordinates;
  placeId?: string;
  categories?: TouristSiteCategory[];
  limit?: number;
  minRating?: number;
  radiusKm?: number;
}

export interface TouristSiteResponse {
  placeId: string;
  name: string;
  address: string;
  coordinates: ICoordinates;
  category: TouristSiteCategory;
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  openingHours?: IOpeningHours;
  photos?: IPhoto[];
  businessStatus?: string;
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  website?: string;
  editorialSummary?: string;
}

export interface GetTouristSitesResponse {
  success: boolean;
  data?: {
    city: string;
    coordinates: ICoordinates;
    totalResults: number;
    sites: TouristSiteResponse[];
  };
  error?: string;
  message?: string;
}

export type RestaurantCategory = 
  | 'all'
  | 'fine_dining'
  | 'casual'
  | 'fast_food'
  | 'cafe'
  | 'bar'
  // Cocinas regionales/internacionales
  | 'american'
  | 'asian'
  | 'chinese'
  | 'french'
  | 'greek'
  | 'indian'
  | 'indonesian'
  | 'italian'
  | 'japanese'
  | 'korean'
  | 'lebanese'
  | 'mediterranean'
  | 'mexican'
  | 'middle_eastern'
  | 'spanish'
  | 'thai'
  | 'turkish'
  // Tipos específicos
  | 'pizza'
  | 'seafood'
  | 'steak_house'
  | 'sushi'
  | 'ramen'
  | 'hamburger'
  | 'bakery'
  | 'ice_cream'
  | 'sandwich';

export interface GetRestaurantsRequest {
  cityName: string;
  coordinates: ICoordinates;
  placeId?: string;
  categories?: RestaurantCategory[];
  limit?: number;
  minRating?: number;
  radiusKm?: number;
  priceLevel?: number[]; // Array de niveles de precio permitidos [0,1,2,3,4]
}

export interface RestaurantResponse {
  placeId: string;
  name: string;
  address: string;
  coordinates: ICoordinates;
  category: RestaurantCategory;
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number; // 0-4 (0 = gratis, 1 = económico, 4 = muy caro)
  openingHours?: IOpeningHours;
  photos?: IPhoto[];
  businessStatus?: string;
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  website?: string;
  editorialSummary?: string;
  cuisine?: string[]; // Tipos de cocina extraídos de types
}

export interface GetRestaurantsResponse {
  success: boolean;
  data?: {
    city: string;
    coordinates: ICoordinates;
    totalResults: number;
    restaurants: RestaurantResponse[];
  };
  error?: string;
  message?: string;
}

export type HotelCategory = 
  | 'all'
  | 'luxury'
  | 'boutique'
  | 'resort'
  | 'business'
  | 'budget'
  | 'hostel'
  | 'apartment';

export type BoardType = 
  | 'ROOM_ONLY'
  | 'BREAKFAST'
  | 'HALF_BOARD'
  | 'FULL_BOARD'
  | 'ALL_INCLUSIVE';

export interface GetHotelsRequest {
  cityName: string;
  coordinates: ICoordinates;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  adults: number;
  children?: number;
  rooms?: number;
  limit?: number;
  minRating?: number;
  radiusKm?: number;
  priceRange?: {
    min?: number;
    max?: number;
  };
  currency?: string;
  boardType?: BoardType;
  chainCodes?: string[]; // Códigos de cadenas hoteleras (ej: ['MC', 'HI'])
}

export interface RoomDetails {
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
}

export interface PriceDetails {
  currency: string;
  total: number;
  base?: number;
  pricePerNight: number;
  taxes?: number;
  fees?: number;
}

export interface CancellationPolicy {
  deadline?: string;
  amount?: string;
  type?: string; // 'FULL_STAY' | 'GUARANTEE' | 'DEPOSIT'
  description?: string;
}

export interface HotelAmenities {
  wifi?: boolean;
  parking?: boolean;
  pool?: boolean;
  restaurant?: boolean;
  gym?: boolean;
  spa?: boolean;
  airConditioning?: boolean;
  roomService?: boolean;
}

export interface HotelResponse {
  hotelId: string;
  name: string;
  chainCode?: string;
  address?: string;
  coordinates: ICoordinates;
  price: PriceDetails;
  roomDetails?: RoomDetails;
  amenities?: HotelAmenities;
  photos?: IPhoto[];
  cancellationPolicy?: CancellationPolicy;
  checkInDate: string;
  checkOutDate: string;
  boardType?: BoardType;
  available: boolean;
  offerId?: string; // Para booking posterior
}

export interface GetHotelsResponse {
  success: boolean;
  data?: {
    city: string;
    coordinates: ICoordinates;
    checkInDate: string;
    checkOutDate: string;
    totalResults: number;
    hotels: HotelResponse[];
  };
  error?: string;
  message?: string;
}



export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export interface IAirport {
  iataCode: string;
  name: string;
  cityName: string;
  countryCode: string;
  coordinates: ICoordinates;
}

export interface GetFlightsRequest {
  originCoordinates: ICoordinates;
  destinationCoordinates: ICoordinates;
  departureDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  adults: number;
  children?: number;
  infants?: number;
  cabinClass?: CabinClass;
  maxStops?: number; // 0 = directo, 1 = 1 escala, etc.
  limit?: number;
  priceRange?: {
    min?: number;
    max?: number;
  };
  currency?: string;
  radiusKm?: number; // Radio para buscar aeropuertos cercanos
}

export interface FlightSegment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string; // ISO 8601 datetime
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string; // ISO 8601 datetime
  };
  carrierCode: string; // Código IATA de aerolínea (ej: "AA", "DL")
  carrierName?: string;
  flightNumber: string;
  aircraft?: string;
  duration: string; // ISO 8601 duration (ej: "PT2H30M")
  numberOfStops: number;
  operatingCarrier?: string;
}

export interface FlightItinerary {
  duration: string; // Duración total del vuelo (ida o vuelta)
  segments: FlightSegment[];
}

export interface FlightPriceDetails {
  currency: string;
  total: number;
  base?: number;
  fees?: number;
  taxes?: number;
  grandTotal: number;
}

export interface FlightResponse {
  id: string; // ID único de la oferta
  origin: IAirport;
  destination: IAirport;
  outbound: FlightItinerary; // Vuelo de ida
  inbound: FlightItinerary; // Vuelo de vuelta
  price: FlightPriceDetails;
  cabinClass: CabinClass;
  numberOfBookableSeats?: number;
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
  }>;
}

export interface GetFlightsResponse {
  success: boolean;
  data?: {
    originAirport: IAirport;
    destinationAirport: IAirport;
    departureDate: string;
    returnDate: string;
    totalResults: number;
    flights: FlightResponse[];
  };
  error?: string;
  message?: string;
}