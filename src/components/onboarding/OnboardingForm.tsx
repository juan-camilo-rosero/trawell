'use client'
import { Button } from '@/components/ui/button'
import { TextInput } from '@/components/ui/TextInput'
import CityAutocomplete from '@/components/ui/CityAutocomplete'

interface CityData {
  name: string
  country: string
  coordinates: {
    lat: number
    lng: number
  }
  placeId?: string
}

interface OnboardingFormProps {
  name: string
  city: string
  cityData?: CityData
  onNameChange: (value: string) => void
  onCityChange: (value: string, cityData?: CityData) => void
  onSubmit: () => void
  errors: {
    name: string
    city: string
  }
  isValid: boolean
  isLoading?: boolean
  apiError?: string
  showTitle?: boolean
}

export function OnboardingForm({
  name,
  city,
  cityData,
  onNameChange,
  onCityChange,
  onSubmit,
  errors,
  isValid,
  isLoading = false,
  apiError = "",
  showTitle = false,
}: OnboardingFormProps) {
  return (
    <div className="w-full flex flex-col space-y-6">
      {showTitle && (
        <div className="w-full">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido!
          </h2>
          <p className="text-base lg:text-lg text-gray-600">
            Cuéntanos un poco sobre ti para personalizar tu experiencia
          </p>
        </div>
      )}
      <h3 className="text-xl font-semibold text-muted-900 w-full text-center">Ingresa tus datos</h3>
      
      {apiError && (
        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{apiError}</p>
        </div>
      )}

      <div className="w-full flex flex-col space-y-8 pb-4">
        <div className="w-full">
          <TextInput
            value={name}
            onChange={onNameChange}
            placeholder="Ingresa tu nombre"
            showClearButton={true}
            error={errors.name}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-2">{errors.name}</p>
          )}
        </div>
        <div className="w-full">
          <CityAutocomplete
            value={city}
            onChange={onCityChange}
            label="¿De qué ciudad eres?"
            placeholder="Buscar ciudad"
            showMapIcon={true}
            showClearIcon={true}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-2">{errors.city}</p>
          )}
        </div>
      </div>
      <Button
        onClick={onSubmit}
        className="primary-btn w-full"
        disabled={!isValid || isLoading}
      >
        {isLoading ? "Completando..." : "Continuar"}
      </Button>
    </div>
  )
}