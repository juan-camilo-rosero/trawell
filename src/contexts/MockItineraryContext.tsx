'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

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

export interface ItineraryItem {
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

export interface MockItineraryData {
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

interface MockItineraryContextType {
  mockItinerary: MockItineraryData | null
  isLoading: boolean
}

const MockItineraryContext = createContext<MockItineraryContextType | undefined>(undefined)

const createMockItinerary = (): MockItineraryData => {
  const today = new Date()
  const departureDate = new Date(today)
  departureDate.setDate(today.getDate() + 30)
  
  const returnDate = new Date(departureDate)
  returnDate.setDate(departureDate.getDate() + 4)

  const day1Date = new Date(departureDate)
  const day2Date = new Date(departureDate)
  day2Date.setDate(day2Date.getDate() + 1)
  const day3Date = new Date(departureDate)
  day3Date.setDate(day3Date.getDate() + 2)
  const day4Date = new Date(departureDate)
  day4Date.setDate(day4Date.getDate() + 3)

  return {
    _id: 'mock-itinerary-001',
    userId: 'mock-user-001',
    searchParams: {
      originCity: {
        name: 'Bogotá',
        coordinates: {
          lat: 4.7110,
          lng: -74.0721
        },
        placeId: 'ChIJKcumLf2bP44RFDmjIFVjnSM'
      },
      destinationCity: {
        name: 'París',
        coordinates: {
          lat: 48.8566,
          lng: 2.3522
        },
        placeId: 'ChIJD7fiBh9u5kcRYJSMaMOCCwQ'
      },
      departureDate: departureDate,
      returnDate: returnDate,
      travelers: {
        adults: 2,
        children: 0,
        babies: 0
      },
      travelType: 'cultural'
    },
    title: 'Aventura en París',
    totalPrice: 8450000,
    currency: 'COP',
    isPublic: false,
    days: [
      {
        _id: 'day-1',
        dayNumber: 1,
        date: day1Date,
        items: [
          {
            itemId: 'flight-out-1',
            type: 'flight',
            order: 1,
            time: '08:00',
            title: 'Vuelo Bogotá - París',
            description: 'Vuelo directo operado por Air France',
            price: 3200000,
            location: {
              name: 'Aeropuerto Internacional El Dorado',
              address: 'Calle 26 #103-09, Bogotá, Colombia',
              coordinates: { lat: 4.7016, lng: -74.1469 },
              placeId: 'ChIJb12hOCGbP44RxdbWcHbcWK4'
            },
            flightDetails: {
              carrierCode: 'AF',
              carrierName: 'Air France',
              flightNumber: 'AF482',
              departureAirport: 'BOG',
              departureAirportName: 'Aeropuerto Internacional El Dorado',
              departureTime: '08:00',
              arrivalAirport: 'CDG',
              arrivalAirportName: 'Aéroport Charles de Gaulle',
              arrivalTime: '23:45',
              duration: 'PT10H45M',
              numberOfStops: 0,
              pricePerPerson: 1600000,
              totalPrice: 3200000
            }
          },
          {
            itemId: 'accommodation-1',
            type: 'accommodation',
            order: 2,
            time: '01:00',
            title: 'Check-in Hotel Le Marais',
            description: 'Hotel boutique en el corazón del distrito Le Marais',
            price: 1200000,
            location: {
              name: 'Hotel Le Marais',
              address: '15 Rue des Archives, 75004 Paris, Francia',
              coordinates: { lat: 48.8584, lng: 2.3558 },
              placeId: 'ChIJW-cRXsNx5kcRKKvLZv3qk3k'
            },
            accommodationDetails: {
              hotelId: 'hotel-paris-001',
              hotelName: 'Hotel Le Marais',
              checkIn: day1Date,
              checkOut: day4Date,
              nights: 3,
              roomType: 'Habitación Doble Superior'
            }
          }
        ]
      },
      {
        _id: 'day-2',
        dayNumber: 2,
        date: day2Date,
        items: [
          {
            itemId: 'food-breakfast-2',
            type: 'food',
            order: 1,
            time: '09:00',
            title: 'Desayuno en Café de Flore',
            description: 'Clásico café parisino con croissants y café au lait',
            price: 80000,
            location: {
              name: 'Café de Flore',
              address: '172 Boulevard Saint-Germain, 75006 Paris, Francia',
              coordinates: { lat: 48.8543, lng: 2.3324 },
              placeId: 'ChIJkxMU0MJx5kcR8TtzLmZnGRw'
            },
            foodDetails: {
              restaurantName: 'Café de Flore',
              cuisine: 'Francesa',
              mealType: 'desayuno',
              priceLevel: 3,
              rating: 4.3,
              userRatingsTotal: 8542,
              openingHours: {
                openNow: true,
                weekdayText: ['Lunes a Domingo: 7:00 AM - 1:30 AM']
              }
            }
          },
          {
            itemId: 'tourist-louvre',
            type: 'tourist_site',
            order: 2,
            time: '10:30',
            title: 'Museo del Louvre',
            description: 'El museo de arte más grande del mundo',
            price: 68000,
            location: {
              name: 'Museo del Louvre',
              address: 'Rue de Rivoli, 75001 Paris, Francia',
              coordinates: { lat: 48.8606, lng: 2.3376 },
              placeId: 'ChIJD3uTd9hx5kcR1IQvGfr8dbk'
            },
            touristSiteDetails: {
              siteName: 'Museo del Louvre',
              category: 'museum',
              types: ['museum', 'art_gallery', 'tourist_attraction'],
              rating: 4.7,
              userRatingsTotal: 154231,
              entryFee: 68000,
              hasFee: true,
              estimatedDuration: '3 horas',
              openingHours: {
                openNow: true,
                weekdayText: [
                  'Lunes: Cerrado',
                  'Martes: 9:00 AM - 6:00 PM',
                  'Miércoles: 9:00 AM - 9:45 PM',
                  'Jueves: 9:00 AM - 6:00 PM',
                  'Viernes: 9:00 AM - 9:45 PM',
                  'Sábado: 9:00 AM - 6:00 PM',
                  'Domingo: 9:00 AM - 6:00 PM'
                ]
              },
              photos: [
                {
                  photoReference: 'louvre-photo-1',
                  height: 1080,
                  width: 1920
                }
              ]
            }
          },
          {
            itemId: 'food-lunch-2',
            type: 'food',
            order: 3,
            time: '14:00',
            title: 'Almuerzo en Le Comptoir du Relais',
            description: 'Bistró tradicional francés cerca de Saint-Germain',
            price: 180000,
            location: {
              name: 'Le Comptoir du Relais',
              address: '9 Carrefour de l\'Odéon, 75006 Paris, Francia',
              coordinates: { lat: 48.8513, lng: 2.3388 },
              placeId: 'ChIJ_X8VWcJx5kcRaH9fXEaGcRc'
            },
            foodDetails: {
              restaurantName: 'Le Comptoir du Relais',
              cuisine: 'Francesa',
              mealType: 'almuerzo',
              priceLevel: 3,
              rating: 4.2,
              userRatingsTotal: 3421,
              openingHours: {
                openNow: true,
                weekdayText: ['Lunes a Domingo: 12:00 PM - 11:00 PM']
              }
            }
          },
          {
            itemId: 'tourist-eiffel',
            type: 'tourist_site',
            order: 4,
            time: '16:30',
            title: 'Torre Eiffel',
            description: 'El monumento más icónico de París',
            price: 108000,
            location: {
              name: 'Torre Eiffel',
              address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, Francia',
              coordinates: { lat: 48.8584, lng: 2.2945 },
              placeId: 'ChIJLU7jZClu5kcR4PcOOO6p3I0'
            },
            touristSiteDetails: {
              siteName: 'Torre Eiffel',
              category: 'monument',
              types: ['monument', 'landmark', 'tourist_attraction'],
              rating: 4.6,
              userRatingsTotal: 289543,
              entryFee: 108000,
              hasFee: true,
              estimatedDuration: '2 horas',
              openingHours: {
                openNow: true,
                weekdayText: ['Lunes a Domingo: 9:00 AM - 12:45 AM']
              },
              photos: [
                {
                  photoReference: 'eiffel-photo-1',
                  height: 1080,
                  width: 1920
                }
              ]
            }
          },
          {
            itemId: 'food-dinner-2',
            type: 'food',
            order: 5,
            time: '20:00',
            title: 'Cena en Le Jules Verne',
            description: 'Restaurante gourmet en el segundo piso de la Torre Eiffel',
            price: 420000,
            location: {
              name: 'Le Jules Verne',
              address: 'Avenue Gustave Eiffel, 75007 Paris, Francia',
              coordinates: { lat: 48.8583, lng: 2.2945 },
              placeId: 'ChIJN5X_gChv5kcRQJmxJ03ndBI'
            },
            foodDetails: {
              restaurantName: 'Le Jules Verne',
              cuisine: 'Francesa Gourmet',
              mealType: 'cena',
              priceLevel: 4,
              rating: 4.4,
              userRatingsTotal: 2156,
              openingHours: {
                openNow: true,
                weekdayText: ['Lunes a Domingo: 12:00 PM - 1:30 PM, 7:00 PM - 9:30 PM']
              }
            }
          }
        ]
      },
      {
        _id: 'day-3',
        dayNumber: 3,
        date: day3Date,
        items: [
          {
            itemId: 'food-breakfast-3',
            type: 'food',
            order: 1,
            time: '08:30',
            title: 'Desayuno en Ladurée',
            description: 'Famosa pastelería parisina conocida por sus macarons',
            price: 95000,
            location: {
              name: 'Ladurée Champs-Élysées',
              address: '75 Avenue des Champs-Élysées, 75008 Paris, Francia',
              coordinates: { lat: 48.8698, lng: 2.3053 },
              placeId: 'ChIJ_V8VWcJx5kcRaH9fXEaGcRd'
            },
            foodDetails: {
              restaurantName: 'Ladurée',
              cuisine: 'Pastelería Francesa',
              mealType: 'desayuno',
              priceLevel: 3,
              rating: 4.5,
              userRatingsTotal: 12384,
              openingHours: {
                openNow: true,
                weekdayText: ['Lunes a Domingo: 8:00 AM - 8:00 PM']
              }
            }
          },
          {
            itemId: 'tourist-sacre-coeur',
            type: 'tourist_site',
            order: 2,
            time: '10:00',
            title: 'Basílica del Sagrado Corazón',
            description: 'Icónica basílica en lo alto de Montmartre',
            price: 0,
            location: {
              name: 'Basílica del Sagrado Corazón',
              address: '35 Rue du Chevalier de la Barre, 75018 Paris, Francia',
              coordinates: { lat: 48.8867, lng: 2.3431 },
              placeId: 'ChIJa9c6lTRu5kcRmhdB-LWzBRY'
            },
            touristSiteDetails: {
              siteName: 'Basílica del Sagrado Corazón',
              category: 'historical',
              types: ['church', 'tourist_attraction', 'place_of_worship'],
              rating: 4.7,
              userRatingsTotal: 87654,
              entryFee: 0,
              hasFee: false,
              estimatedDuration: '1.5 horas',
              openingHours: {
                openNow: true,
                weekdayText: ['Lunes a Domingo: 6:00 AM - 10:30 PM']
              },
              photos: [
                {
                  photoReference: 'sacre-coeur-photo-1',
                  height: 1080,
                  width: 1920
                }
              ]
            }
          },
          {
            itemId: 'food-lunch-3',
            type: 'food',
            order: 3,
            time: '13:00',
            title: 'Almuerzo en Le Relais de l\'Entrecôte',
            description: 'Especialidad en steak-frites con salsa secreta',
            price: 160000,
            location: {
              name: 'Le Relais de l\'Entrecôte',
              address: '15 Rue Marbeuf, 75008 Paris, Francia',
              coordinates: { lat: 48.8688, lng: 2.3036 },
              placeId: 'ChIJb12hOCGbP44RxdbWcHbcWK5'
            },
            foodDetails: {
              restaurantName: 'Le Relais de l\'Entrecôte',
              cuisine: 'Francesa',
              mealType: 'almuerzo',
              priceLevel: 2,
              rating: 4.3,
              userRatingsTotal: 5678,
              openingHours: {
                openNow: true,
                weekdayText: ['Lunes a Domingo: 12:00 PM - 2:30 PM, 7:00 PM - 11:30 PM']
              }
            }
          },
          {
            itemId: 'tourist-versailles',
            type: 'tourist_site',
            order: 4,
            time: '15:00',
            title: 'Palacio de Versalles',
            description: 'Majestuoso palacio real con jardines espectaculares',
            price: 88000,
            location: {
              name: 'Palacio de Versalles',
              address: 'Place d\'Armes, 78000 Versailles, Francia',
              coordinates: { lat: 48.8049, lng: 2.1204 },
              placeId: 'ChIJ2aTR1gRl5UcRPYBi6Z9zXgI'
            },
            touristSiteDetails: {
              siteName: 'Palacio de Versalles',
              category: 'historical',
              types: ['museum', 'park', 'tourist_attraction', 'palace'],
              rating: 4.6,
              userRatingsTotal: 123456,
              entryFee: 88000,
              hasFee: true,
              estimatedDuration: '4 horas',
              openingHours: {
                openNow: true,
                weekdayText: [
                  'Lunes: Cerrado',
                  'Martes: 9:00 AM - 6:30 PM',
                  'Miércoles: 9:00 AM - 6:30 PM',
                  'Jueves: 9:00 AM - 6:30 PM',
                  'Viernes: 9:00 AM - 6:30 PM',
                  'Sábado: 9:00 AM - 6:30 PM',
                  'Domingo: 9:00 AM - 6:30 PM'
                ]
              },
              photos: [
                {
                  photoReference: 'versailles-photo-1',
                  height: 1080,
                  width: 1920
                }
              ]
            }
          },
          {
            itemId: 'food-dinner-3',
            type: 'food',
            order: 5,
            time: '20:30',
            title: 'Cena en Septime',
            description: 'Restaurante contemporáneo con estrella Michelin',
            price: 380000,
            location: {
              name: 'Septime',
              address: '80 Rue de Charonne, 75011 Paris, Francia',
              coordinates: { lat: 48.8531, lng: 2.3809 },
              placeId: 'ChIJZQxMU0Rv5kcRdH9fXEaGcRd'
            },
            foodDetails: {
              restaurantName: 'Septime',
              cuisine: 'Francesa Contemporánea',
              mealType: 'cena',
              priceLevel: 4,
              rating: 4.6,
              userRatingsTotal: 1876,
              openingHours: {
                openNow: true,
                weekdayText: ['Lunes a Viernes: 12:00 PM - 2:00 PM, 7:00 PM - 10:30 PM']
              }
            }
          }
        ]
      },
      {
        _id: 'day-4',
        dayNumber: 4,
        date: day4Date,
        items: [
          {
            itemId: 'food-breakfast-4',
            type: 'food',
            order: 1,
            time: '08:00',
            title: 'Desayuno en Du Pain et des Idées',
            description: 'Panadería artesanal con los mejores pain au chocolat',
            price: 45000,
            location: {
              name: 'Du Pain et des Idées',
              address: '34 Rue Yves Toudic, 75010 Paris, Francia',
              coordinates: { lat: 48.8712, lng: 2.3632 },
              placeId: 'ChIJX8VWcJx5kcRaH9fXEaGcRe'
            },
            foodDetails: {
              restaurantName: 'Du Pain et des Idées',
              cuisine: 'Panadería Francesa',
              mealType: 'desayuno',
              priceLevel: 1,
              rating: 4.7,
              userRatingsTotal: 4532,
              openingHours: {
                openNow: true,
                weekdayText: ['Lunes a Viernes: 6:30 AM - 8:00 PM']
              }
            }
          },
          {
            itemId: 'tourist-notre-dame',
            type: 'tourist_site',
            order: 2,
            time: '10:00',
            title: 'Catedral de Notre-Dame',
            description: 'Obra maestra de la arquitectura gótica francesa',
            price: 0,
            location: {
              name: 'Catedral de Notre-Dame',
              address: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris, Francia',
              coordinates: { lat: 48.8530, lng: 2.3499 },
              placeId: 'ChIJATr1n-Fx5kcRjQb6q6cdQDY'
            },
            touristSiteDetails: {
              siteName: 'Catedral de Notre-Dame',
              category: 'historical',
              types: ['church', 'tourist_attraction', 'place_of_worship'],
              rating: 4.7,
              userRatingsTotal: 98765,
              entryFee: 0,
              hasFee: false,
              estimatedDuration: '1 hora',
              openingHours: {
                openNow: false,
                weekdayText: ['Actualmente cerrada por restauración']
              },
              photos: [
                {
                  photoReference: 'notre-dame-photo-1',
                  height: 1080,
                  width: 1920
                }
              ]
            }
          },
          {
            itemId: 'food-lunch-4',
            type: 'food',
            order: 3,
            time: '12:30',
            title: 'Almuerzo en L\'As du Fallafel',
            description: 'El mejor falafel del Marais',
            price: 65000,
            location: {
              name: 'L\'As du Fallafel',
              address: '34 Rue des Rosiers, 75004 Paris, Francia',
              coordinates: { lat: 48.8575, lng: 2.3596 },
              placeId: 'ChIJW-cRXsNx5kcRKKvLZv3qk3l'
            },
            foodDetails: {
              restaurantName: 'L\'As du Fallafel',
              cuisine: 'Mediterránea',
              mealType: 'almuerzo',
              priceLevel: 1,
              rating: 4.4,
              userRatingsTotal: 8934,
              openingHours: {
                openNow: true,
                weekdayText: ['Domingo a Jueves: 11:00 AM - 11:00 PM']
              }
            }
          },
          {
            itemId: 'tourist-arc-triomphe',
            type: 'tourist_site',
            order: 4,
            time: '14:30',
            title: 'Arco de Triunfo',
            description: 'Monumento histórico en honor a los soldados franceses',
            price: 52000,
            location: {
              name: 'Arco de Triunfo',
              address: 'Place Charles de Gaulle, 75008 Paris, Francia',
              coordinates: { lat: 48.8738, lng: 2.2950 },
              placeId: 'ChIJjx37cOxv5kcR7r2ijRvxkjk'
            },
            touristSiteDetails: {
              siteName: 'Arco de Triunfo',
              category: 'monument',
              types: ['monument', 'landmark', 'tourist_attraction'],
              rating: 4.6,
              userRatingsTotal: 76543,
              entryFee: 52000,
              hasFee: true,
              estimatedDuration: '1.5 horas',
              openingHours: {
                openNow: true,
                weekdayText: ['Lunes a Domingo: 10:00 AM - 11:00 PM']
              },
              photos: [
                {
                  photoReference: 'arc-photo-1',
                  height: 1080,
                  width: 1920
                }
              ]
            }
          },
          {
            itemId: 'flight-return-1',
            type: 'flight',
            order: 5,
            time: '18:00',
            title: 'Vuelo París - Bogotá',
            description: 'Vuelo de regreso operado por Air France',
            price: 3200000,
            location: {
              name: 'Aéroport Charles de Gaulle',
              address: '95700 Roissy-en-France, Francia',
              coordinates: { lat: 49.0097, lng: 2.5479 },
              placeId: 'ChIJUbJSsHY95kcRsez98fgUNBg'
            },
            flightDetails: {
              carrierCode: 'AF',
              carrierName: 'Air France',
              flightNumber: 'AF483',
              departureAirport: 'CDG',
              departureAirportName: 'Aéroport Charles de Gaulle',
              departureTime: '18:00',
              arrivalAirport: 'BOG',
              arrivalAirportName: 'Aeropuerto Internacional El Dorado',
              arrivalTime: '22:30',
              duration: 'PT11H30M',
              numberOfStops: 0,
              pricePerPerson: 1600000,
              totalPrice: 3200000
            }
          }
        ]
      }
    ],
    lastViewedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export function MockItineraryProvider({ children }: { children: React.ReactNode }) {
  const [mockItinerary, setMockItinerary] = useState<MockItineraryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const itinerary = createMockItinerary()
    setMockItinerary(itinerary)
    setIsLoading(false)
  }, [])

  const value: MockItineraryContextType = {
    mockItinerary,
    isLoading,
  }

  return (
    <MockItineraryContext.Provider value={value}>
      {children}
    </MockItineraryContext.Provider>
  )
}

export function useMockItinerary() {
  const context = useContext(MockItineraryContext)
  
  if (context === undefined) {
    throw new Error('useMockItinerary debe ser usado dentro de un MockItineraryProvider')
  }
  
  return context
}