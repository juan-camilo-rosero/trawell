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
