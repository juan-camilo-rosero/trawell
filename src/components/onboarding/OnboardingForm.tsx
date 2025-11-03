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
}

interface OnboardingFormProps {
  name: string
  city: string
  onNameChange: (value: string) => void
  onCityChange: (value: string, cityData?: CityData) => void
  onSubmit: () => void
  errors: {
    name: string
    city: string
  }
  isValid: boolean
  showTitle?: boolean
}

export function OnboardingForm({
  name,
  city,
  onNameChange,
  onCityChange,
  onSubmit,
  errors,
  isValid,
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

      <h3 className="text-xl font-semibold text-gray-900">Ingresa tus datos</h3>

      <div className="w-full flex flex-col space-y-5">
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
        disabled={!isValid}
      >
        Continuar
      </Button>
    </div>
  )
}