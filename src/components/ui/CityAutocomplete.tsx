'use client'

import { FiMapPin } from 'react-icons/fi'
import { RiCloseCircleFill } from 'react-icons/ri'
import Autocomplete from 'react-google-autocomplete'

interface CityData {
  name: string
  country: string
  coordinates: {
    lat: number
    lng: number
  }
}

interface CityAutocompleteProps {
  value: string
  onChange: (value: string, cityData?: CityData) => void
  className?: string
  placeholder?: string
  label?: string
  showMapIcon?: boolean
  showClearIcon?: boolean
}

function CityAutocomplete({ 
  value, 
  onChange, 
  className = '', 
  placeholder = 'Buscar ciudad',
  label,
  showMapIcon = false,
  showClearIcon = false
}: CityAutocompleteProps) {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY

  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    if (!place || !place.address_components || !place.geometry) {
      return
    }

    let city = place.name || ''
    let country = ''

    place.address_components.forEach(component => {
      if (component.types.includes('country')) {
        country = component.long_name
      }
      if (component.types.includes('locality') && !city) {
        city = component.long_name
      }
    })

    const displayValue = country ? `${city}, ${country}` : city
    const coordinates = {
      lat: place.geometry.location?.lat() || 0,
      lng: place.geometry.location?.lng() || 0
    }

    const cityData: CityData = {
      name: city,
      country,
      coordinates
    }

    console.log('Ciudad seleccionada:', cityData)
    onChange(displayValue, cityData)
  }

  const handleClear = () => {
    onChange('', undefined)
  }

  const paddingLeft = showMapIcon ? 'pl-10' : 'pl-4'
  const paddingRight = showClearIcon ? 'pr-10' : 'pr-4'

  if (!apiKey) {
    console.error('NEXT_PUBLIC_MAPS_API_KEY no está definida')
    return null
  }

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label 
          className="absolute -top-2.5 left-2 bg-white px-1 text-sm text-gray-600 pointer-events-none z-10"
        >
          {label}
        </label>
      )}
      
      {showMapIcon && (
        <FiMapPin 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none z-10" 
          size={20}
        />
      )}

      <Autocomplete
        apiKey={apiKey}
        onPlaceSelected={handlePlaceSelected}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value, undefined)}
        value={value}
        options={{
          types: ['(cities)'],
          fields: ['address_components', 'geometry', 'name']
        }}
        placeholder={placeholder}
        className={`w-full ${paddingLeft} ${paddingRight} py-3 border border-muted-300 rounded focus:outline-none focus:border-muted-500 bg-white`}
      />

      {showClearIcon && value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors z-10"
          aria-label="Limpiar"
        >
          <RiCloseCircleFill size={20} />
        </button>
      )}
    </div>
  )
}

export default CityAutocomplete