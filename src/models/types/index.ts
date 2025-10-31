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

// --- Nuevos tipos añadidos ---

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
  | 'sandwich'
  | 'breakfast'
  | 'brunch'
  // Dietas especiales
  | 'vegan'
  | 'vegetarian';

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