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
  cityData?: CityData
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
  cityData,
  onNameChange,
  onCityChange,
  onSubmit,
  errors,
  isValid,
  showTitle = false,
}: OnboardingFormProps) {
  const handleSubmit = () => {
    console.log({
      nombre: name,
      ciudad: {
        nombre: cityData?.name,
        pais: cityData?.country,
        coordenadas: cityData?.coordinates
      }
    })
    onSubmit()
  }

  return (
    <div className="w-full flex flex-col space-y-6">
      {showTitle && (
        <div className="w-full">
          <h2 className="text-center text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            ¡Empecemos!
          </h2>
          <p className="text-base lg:text-lg text-muted-500 text-center">
            Cuéntanos un poco sobre ti para personalizar tu experiencia
          </p>
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
        onClick={handleSubmit}
        className="primary-btn w-full"
        disabled={!isValid}
      >
        Continuar
      </Button>
    </div>
  )
}