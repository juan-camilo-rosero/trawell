'use client'
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { itineraryGeneratorService, GenerateItineraryRequest } from '@/lib/services/itinerary-generator.service'
import { IDay, ISearchParams } from '@/models/itinerary/interfaces'
import { RestaurantCategory } from '@/models/types'
import { MapMarker } from '@/models/types/map.types'

export interface ItineraryData {
  _id?: string
  userId: string
  searchParams: ISearchParams
  title: string
  totalPrice: number
  currency: string
  isPublic: boolean
  days: IDay[]
  lastViewedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

interface ItineraryContextType {
  itinerary: ItineraryData | null
  isLoading: boolean
  error: string | null
  mapMarkers: MapMarker[]
  generateItinerary: (params: GenerateItineraryParams) => Promise<void>
  clearItinerary: () => void
}

export interface GenerateItineraryParams {
  originCityName: string
  originCoordinates: { lat: number; lng: number }
  originPlaceId?: string
  destinationCityName: string
  destinationCoordinates: { lat: number; lng: number }
  destinationPlaceId?: string
  departureDate: Date
  returnDate: Date
  adults: number
  children?: number
  babies?: number
  travelType: 'relaxation' | 'luxury' | 'cultural' | 'adventure' | 'gastronomic' | 'spiritual'
  foodPreferences: RestaurantCategory[]
  
  cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'
  maxStops?: number
  budget?: number
  hotelBudgetPerNight?: number
  preferredHotelChains?: string[]
  currency?: string
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined)

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([])

  // Efecto para generar marcadores cuando cambia el itinerario
  useEffect(() => {
    if (!itinerary) {
      setMapMarkers([])
      return
    }

    const markers: MapMarker[] = []

    itinerary.days.forEach((day) => {
      day.items.forEach((item) => {
        // Verificar si el item tiene coordenadas válidas
        if (!item.location?.coordinates?.lat || !item.location?.coordinates?.lng) {
          return
        }

        const baseMarker = {
          id: `${item.itemId}-${day.dayNumber}`,
          itemId: item.itemId,
          type: item.type,
          coordinates: item.location.coordinates,
          title: item.title,
          address: item.location.address,
          dayNumber: day.dayNumber,
        }

        if (item.type === 'tourist_site' && item.touristSiteDetails?.category) {
          markers.push({
            ...baseMarker,
            category: item.touristSiteDetails.category,
          })
        } else {
          markers.push(baseMarker)
        }
      })
    })

    console.log(`📍 Generados ${markers.length} marcadores para el mapa`)
    setMapMarkers(markers)
  }, [itinerary])

  const generateItinerary = async (params: GenerateItineraryParams) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🚀 Generando itinerario desde contexto...')
      
      const request: GenerateItineraryRequest = {
        ...params,
      }
      const result = await itineraryGeneratorService.generateItinerary(request)
      const itineraryData: ItineraryData = {
        userId: 'current-user-id',
        searchParams: result.searchParams,
        title: result.title,
        totalPrice: result.totalPrice,
        currency: result.currency,
        isPublic: false,
        days: result.days,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setItinerary(itineraryData)
      console.log('✅ Itinerario generado y guardado en contexto')
    } catch (err) {
      console.error('❌ Error generando itinerario:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido al generar itinerario')
      setItinerary(null)
    } finally {
      setIsLoading(false)
    }
  }

  const clearItinerary = () => {
    setItinerary(null)
    setError(null)
    setMapMarkers([])
  }

  const value: ItineraryContextType = {
    itinerary,
    isLoading,
    error,
    mapMarkers,
    generateItinerary,
    clearItinerary,
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