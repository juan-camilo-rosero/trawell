'use client'

import { useRef, useEffect } from 'react'
import { FiMapPin } from 'react-icons/fi'
import { RiCloseCircleFill } from 'react-icons/ri'

// Declaración de tipos para Google Maps
declare global {
  interface Window {
    google: typeof google
  }
}

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
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    if (!inputRef.current || typeof window === 'undefined' || !window.google) {
      return
    }

    // Inicializar el autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['(cities)'],
      fields: ['address_components', 'geometry', 'name']
    })

    // Listener para cuando se selecciona un lugar
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace()
      
      if (!place || !place.address_components || !place.geometry) {
        return
      }

      // Extraer ciudad y país
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

      // Imprimir en consola
      console.log('Ciudad seleccionada:', {
        nombre: city,
        país: country,
        coordenadas: coordinates
      })

      // Actualizar el valor
      onChange(displayValue, cityData)
    })

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener)
      }
    }
  }, [onChange])

  // Cargar el script de Google Maps
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY

    if (!apiKey) {
      console.error('NEXT_PUBLIC_MAPS_API_KEY no está definida')
      return
    }

    // Verificar si el script ya existe en el DOM
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    )

    if (typeof window !== 'undefined' && !window.google && !existingScript) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleClear = () => {
    onChange('')
  }

  const paddingLeft = showMapIcon ? 'pl-10' : 'pl-4'
  const paddingRight = showClearIcon ? 'pr-10' : 'pr-4'

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label 
          className={`absolute -top-2.5 left-2 bg-white px-1 text-sm text-gray-600 pointer-events-none`}
        >
          {label}
        </label>
      )}
      
      {showMapIcon && (
        <FiMapPin 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none" 
          size={20}
        />
      )}

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full ${paddingLeft} ${paddingRight} py-3 border border-muted-300 rounded focus:outline-none focus:border-muted-500`}
        autoComplete="off"
      />

      {showClearIcon && value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Limpiar"
        >
          <RiCloseCircleFill size={20} />
        </button>
      )}
    </div>
  )
}

export default CityAutocomplete