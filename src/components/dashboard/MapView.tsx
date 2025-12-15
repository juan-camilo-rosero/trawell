'use client'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api'
import { MdFlight, MdRestaurant } from 'react-icons/md'
import { RiHotelBedFill } from 'react-icons/ri'
import { FaLandmark, FaMonument, FaTree, FaUniversity } from 'react-icons/fa'
import { MapMarker, TouristSiteCategory } from '@/models/types/map.types'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useItinerary } from '@/contexts/ItineraryContext'

interface MapViewProps {
  markers: MapMarker[]
  center?: { lat: number; lng: number }
  zoom?: number
  showSaveButton?: boolean
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const defaultCenter = {
  lat: 48.8566,
  lng: 2.3522,
}

const getMarkerIcon = (marker: MapMarker) => {
  const iconProps = {
    size: 20,
    className: 'text-secondary-100',
  }

  switch (marker.type) {
    case 'flight':
      return <MdFlight {...iconProps} />
    case 'accommodation':
      return <RiHotelBedFill {...iconProps} />
    case 'food':
      return <MdRestaurant {...iconProps} />
    case 'tourist_site':
      return getTouristSiteIcon(marker.category, iconProps)
    default:
      return <MdFlight {...iconProps} />
  }
}

const getTouristSiteIcon = (
  category: TouristSiteCategory | undefined,
  iconProps: { size: number; className: string }
) => {
  switch (category) {
    case 'museum':
      return <FaUniversity {...iconProps} />
    case 'park':
      return <FaTree {...iconProps} />
    case 'monument':
      return <FaMonument {...iconProps} />
    case 'historical':
      return <FaLandmark {...iconProps} />
    default:
      return <FaLandmark {...iconProps} />
  }
}

interface CustomMarkerProps {
  marker: MapMarker
  onClick: () => void
  isSelected: boolean
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ marker, onClick, isSelected }) => {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center justify-center
        bg-primary rounded-full
        cursor-pointer
        transition-all duration-200
        hover:scale-110
        shadow-lg
        ${isSelected ? 'w-14 h-14 ring-4 ring-primary-300' : 'w-10 h-10'}
      `}
      style={{
        transform: 'translate(-50%, -50%)',
      }}
    >
      {getMarkerIcon(marker)}
    </div>
  )
}

interface CustomInfoWindowProps {
  marker: MapMarker
  onClose: () => void
}

const CustomInfoWindow: React.FC<CustomInfoWindowProps> = ({ marker, onClose }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-xl p-4 min-w-[200px] max-w-[300px]"
      style={{
        transform: 'translate(-50%, -120%)',
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-sm text-gray-800">{marker.title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 ml-2"
        >
          ×
        </button>
      </div>
      {marker.address && (
        <p className="text-xs text-gray-600 mb-2">{marker.address}</p>
      )}
      {marker.dayNumber && (
        <span className="inline-block bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded">
          Día {marker.dayNumber}
        </span>
      )}
    </div>
  )
}

function MapView({ markers, center, zoom = 13, showSaveButton = false }: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY || '',
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const boundsSet = useRef(false)

  const router = useRouter()
  const { userData } = useUser()
  const { saveItinerary, isLoading: isSavingItinerary } = useItinerary()
  const [saveError, setSaveError] = useState<string | null>(null)

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  useEffect(() => {
    if (!map || markers.length === 0 || boundsSet.current) return

    const bounds = new google.maps.LatLngBounds()
    markers.forEach((marker) => {
      bounds.extend(
        new google.maps.LatLng(marker.coordinates.lat, marker.coordinates.lng)
      )
    })

    map.fitBounds(bounds)
    
    const listener = google.maps.event.addListener(map, 'idle', () => {
      const currentZoom = map.getZoom()
      if (currentZoom && currentZoom > 15) {
        map.setZoom(15)
      }
      google.maps.event.removeListener(listener)
      boundsSet.current = true
    })
  }, [map, markers])

  useEffect(() => {
    boundsSet.current = false
  }, [markers])

  const handleMarkerClick = useCallback((markerId: string, marker: MapMarker) => {
    setSelectedMarker(markerId === selectedMarker ? null : markerId)
    
    if (map && markerId !== selectedMarker) {
      map.panTo(marker.coordinates)
      const currentZoom = map.getZoom()
      if (!currentZoom || currentZoom < 14) {
        map.setZoom(14)
      }
    }
  }, [map, selectedMarker])

  const handleSaveItinerary = async () => {
    if (!userData?.firebaseUid) {
      setSaveError('You must log in to save the itinerary')
      return
    }

    setSaveError(null)
    const success = await saveItinerary(userData.firebaseUid)
    
    if (success) {
      router.push('/dashboard/my-trips')
    } else {
      setSaveError('Error saving itinerary. Please try again.')
    }
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center || defaultCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
          },
        }}
      >
        {markers.map((marker) => (
          <React.Fragment key={marker.id}>
            <OverlayView
              position={marker.coordinates}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <CustomMarker
                marker={marker}
                onClick={() => handleMarkerClick(marker.id, marker)}
                isSelected={selectedMarker === marker.id}
              />
            </OverlayView>

            {selectedMarker === marker.id && (
              <OverlayView
                position={marker.coordinates}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <CustomInfoWindow
                  marker={marker}
                  onClose={() => setSelectedMarker(null)}
                />
              </OverlayView>
            )}
          </React.Fragment>
        ))}
      </GoogleMap>

      {showSaveButton && (
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 z-10">
          {saveError && (
            <p className="text-red-500 text-sm mb-2 text-center bg-white rounded px-2 py-1">
              {saveError}
            </p>
          )}
          <button
            onClick={handleSaveItinerary}
            disabled={isSavingItinerary}
            className="w-full primary-btn py-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingItinerary ? 'Saving...' : 'Save itinerary'}
          </button>
        </div>
      )}
    </div>
  )
}

export default MapView