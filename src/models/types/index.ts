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