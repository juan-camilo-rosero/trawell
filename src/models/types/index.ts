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