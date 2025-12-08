'use client'

import { useEffect, useRef, useState } from 'react'
import { FiMapPin } from 'react-icons/fi'
import { RiCloseCircleFill } from 'react-icons/ri'

interface CityData {
  name: string
  country: string
  coordinates: {
    lat: number
    lng: number
  }
  placeId?: string
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

interface Suggestion {
  description: string
  placeId: string
}

export default function CityAutocomplete({ 
  value, 
  onChange, 
  className = '', 
  placeholder = 'Buscar ciudad',
  label,
  showMapIcon = false,
  showClearIcon = false
}: CityAutocompleteProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  // Inicializar y validar Google Maps
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined') {
        if (window.google?.maps?.places?.AutocompleteService) {
          setIsReady(true)
          console.log('✓ Google Maps Autocomplete Service ready')
          return
        }
      }
      setTimeout(checkGoogleMaps, 500)
    }

    checkGoogleMaps()
  }, [])

  // Manejar clics fuera (input + sugerencias)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSuggestions])

  const fetchSuggestions = (input: string) => {
    if (!input.trim() || !isReady) {
      setSuggestions([])
      return
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        if (!window.google?.maps?.places?.AutocompleteService) {
          console.error('Google Maps Autocomplete Service not available')
          return
        }

        const service = new window.google.maps.places.AutocompleteService()
        
        service.getPlacePredictions(
          {
            input,
            types: ['(cities)'],
          },
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              const formattedSuggestions = predictions.map(p => ({
                description: p.description,
                placeId: p.place_id,
              }))
              setSuggestions(formattedSuggestions)
              setShowSuggestions(true)
            } else {
              setSuggestions([])
            }
          }
        )
      } catch (err) {
        console.error('Error in fetchSuggestions:', err)
        setSuggestions([])
      }
    }, 400)
  }

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    try {
      if (!window.google?.maps?.places?.PlacesService) {
        onChange(suggestion.description, undefined)
        setShowSuggestions(false)
        return
      }

      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      )

      service.getDetails(
        {
          placeId: suggestion.placeId,
          fields: ['address_components', 'geometry', 'name'],
        },
        (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place
          ) {
            let city = place.name || ''
            let country = ''

            place.address_components?.forEach(component => {
              if (component.types.includes('country')) {
                country = component.long_name
              }
              if (
                component.types.includes('locality') &&
                !city
              ) {
                city = component.long_name
              }
            })

            const displayValue = country ? `${city}, ${country}` : city
            const coordinates = {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0,
            }

            const cityData: CityData = {
              name: city,
              country,
              coordinates,
              placeId: suggestion.placeId, // opcional, puedes incluirlo
            }

            onChange(displayValue, cityData)
            console.log('✓ City selected:', displayValue)
          } else {
            onChange(suggestion.description, undefined)
          }

          setShowSuggestions(false)
          setSuggestions([])
        }
      )
    } catch (err) {
      console.error('Error in handleSelectSuggestion:', err)
      onChange(suggestion.description, undefined)
      setShowSuggestions(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onChange(inputValue, undefined)
    
    if (inputValue.trim()) {
      fetchSuggestions(inputValue)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleClear = () => {
    onChange('', undefined)
    setSuggestions([])
    setShowSuggestions(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault()
      handleSelectSuggestion(suggestions[0])
    }
  }

  const paddingLeft = showMapIcon ? 'pl-10' : 'pl-4'
  const paddingRight = showClearIcon && value ? 'pr-10' : 'pr-4'

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {showMapIcon && (
          <FiMapPin
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={18}
          />
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`w-full ${paddingLeft} ${paddingRight} py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-sm`}
          autoComplete="off"
        />

        {showClearIcon && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Limpiar"
            tabIndex={-1}
          >
            <RiCloseCircleFill size={18} />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md max-h-60 overflow-y-auto z-50 shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.placeId}-${index}`}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3 text-sm"
            >
              <FiMapPin size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">{suggestion.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
