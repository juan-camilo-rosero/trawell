export type MarkerType = 'flight' | 'accommodation' | 'food' | 'tourist_site'
export type TouristSiteCategory = 'museum' | 'park' | 'monument' | 'historical'

export interface MapMarker {
  id: string
  itemId: string
  type: MarkerType
  coordinates: { lat: number; lng: number }
  title: string
  address?: string
  category?: TouristSiteCategory
  dayNumber?: number
}