'use client'
import React, { createContext, useContext, useState } from 'react'

interface Coordinates {
  lat: number
  lng: number
}

interface Location {
  name: string
  coordinates: Coordinates
  placeId?: string
}

interface LocationWithAddress extends Location {
  address: string
}

interface Travelers {
  adults: number
  children: number
  babies: number
}

interface SearchParams {
  originCity: Location
  destinationCity: Location
  departureDate: Date
  returnDate: Date
  travelers: Travelers
  travelType: string
}

interface OpeningHours {
  openNow: boolean
  weekdayText?: string[]
}

interface Photo {
  photoReference: string
  height: number
  width: number
}

interface FlightDetails {
  carrierCode: string
  carrierName: string
  flightNumber?: string
  departureAirport: string
  departureAirportName: string
  departureTime: string
  arrivalAirport: string
  arrivalAirportName: string
  arrivalTime: string
  duration: string
  numberOfStops: number
  pricePerPerson: number
  totalPrice: number
}

interface AccommodationDetails {
  hotelId: string
  hotelName: string
  checkIn: Date
  checkOut: Date
  nights: number
  roomType: string
}

interface FoodDetails {
  restaurantName: string
  cuisine: string
  mealType: 'desayuno' | 'almuerzo' | 'cena' | 'snack'
  priceLevel: number
  rating: number
  userRatingsTotal: number
  openingHours?: OpeningHours
}

interface TouristSiteDetails {
  siteName: string
  category: 'museum' | 'park' | 'monument' | 'historical'
  types: string[]
  rating?: number
  userRatingsTotal?: number
  entryFee: number
  hasFee: boolean
  estimatedDuration: string
  openingHours?: OpeningHours
  photos?: Photo[]
}

type ItemType = 'flight' | 'accommodation' | 'food' | 'tourist_site'

interface ItineraryItem {
  _id?: string
  itemId: string
  type: ItemType
  order: number
  time: string
  title: string
  description: string
  price: number
  location: LocationWithAddress
  flightDetails?: FlightDetails
  accommodationDetails?: AccommodationDetails
  foodDetails?: FoodDetails
  touristSiteDetails?: TouristSiteDetails
}

interface Day {
  _id?: string
  dayNumber: number
  date: Date
  items: ItineraryItem[]
}

export interface ItineraryData {
  _id?: string
  userId: string
  searchParams: SearchParams
  title: string
  totalPrice: number
  currency: string
  isPublic: boolean
  days: Day[]
  lastViewedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

interface ItineraryContextType {
  itinerary: ItineraryData | null
  isLoading: boolean
  error: string | null
  setItinerary: (itinerary: ItineraryData | null) => void
  updateItinerary: (updates: Partial<ItineraryData>) => void
  updateDay: (dayNumber: number, updates: Partial<Day>) => void
  addItem: (dayNumber: number, item: ItineraryItem) => void
  updateItem: (dayNumber: number, itemId: string, updates: Partial<ItineraryItem>) => void
  removeItem: (dayNumber: number, itemId: string) => void
  reorderItems: (dayNumber: number, items: ItineraryItem[]) => void
  clearItinerary: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined)

export function ItineraryProvider({ children }: { children: React.ReactNode }) {
  const [itinerary, setItineraryState] = useState<ItineraryData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setItinerary = (newItinerary: ItineraryData | null) => {
    setItineraryState(newItinerary)
    setError(null)
  }

  const updateItinerary = (updates: Partial<ItineraryData>) => {
    if (itinerary) {
      setItineraryState({ ...itinerary, ...updates })
    }
  }

  const updateDay = (dayNumber: number, updates: Partial<Day>) => {
    if (!itinerary) return

    const updatedDays = itinerary.days.map(day =>
      day.dayNumber === dayNumber ? { ...day, ...updates } : day
    )

    setItineraryState({ ...itinerary, days: updatedDays })
  }

  const addItem = (dayNumber: number, item: ItineraryItem) => {
    if (!itinerary) return

    const updatedDays = itinerary.days.map(day => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          items: [...day.items, item]
        }
      }
      return day
    })

    setItineraryState({ ...itinerary, days: updatedDays })
  }

  const updateItem = (dayNumber: number, itemId: string, updates: Partial<ItineraryItem>) => {
    if (!itinerary) return

    const updatedDays = itinerary.days.map(day => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          items: day.items.map(item =>
            item.itemId === itemId ? { ...item, ...updates } : item
          )
        }
      }
      return day
    })

    setItineraryState({ ...itinerary, days: updatedDays })
  }

  const removeItem = (dayNumber: number, itemId: string) => {
    if (!itinerary) return

    const updatedDays = itinerary.days.map(day => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          items: day.items.filter(item => item.itemId !== itemId)
        }
      }
      return day
    })

    setItineraryState({ ...itinerary, days: updatedDays })
  }

  const reorderItems = (dayNumber: number, items: ItineraryItem[]) => {
    if (!itinerary) return

    const updatedDays = itinerary.days.map(day => {
      if (day.dayNumber === dayNumber) {
        return { ...day, items }
      }
      return day
    })

    setItineraryState({ ...itinerary, days: updatedDays })
  }

  const clearItinerary = () => {
    setItineraryState(null)
    setError(null)
  }

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const setErrorState = (err: string | null) => {
    setError(err)
  }

  const value: ItineraryContextType = {
    itinerary,
    isLoading,
    error,
    setItinerary,
    updateItinerary,
    updateDay,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    clearItinerary,
    setLoading,
    setError: setErrorState,
  }

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  )
}

export function useItinerary() {
  const context = useContext(ItineraryContext)
  
  if (context === undefined) {
    throw new Error('useItinerary debe ser usado dentro de un ItineraryProvider')
  }
  
  return context
}