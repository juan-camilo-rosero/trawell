'use client'

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { DesktopCarousel } from "@/components/onboarding/DesktopCarousel";

// Tipos
interface CityData {
  name: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface OnboardingSlideData {
  image: string;
  title: string;
  subtitle: string;
}

// Constantes
const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    image:
      "https://i.pinimg.com/736x/7d/36/e9/7d36e9bb721995c60bfd2b40e2e99aad.jpg",
    title: "Planea tu próximo viaje en segundos",
    subtitle:
      "Creamos al instante un itinerario completo para que solo debas preocuparte por disfrutar",
  },
  {
    image:
      "https://i.pinimg.com/736x/7d/36/e9/7d36e9bb721995c60bfd2b40e2e99aad.jpg",
    title: "Pensamos cada detalle de tu experiencia",
    subtitle:
      "Buscamos entre cientos de miles de alojamientos, restaurantes, sitios de interés y vuelos para darte lo mejor",
  },
  {
    image:
      "https://i.pinimg.com/736x/7d/36/e9/7d36e9bb721995c60bfd2b40e2e99aad.jpg",
    title: "Nos adaptamos a tu propio estilo",
    subtitle:
      "Desde tu forma de viajar hasta tus preferencias al comer, nos adaptamos a lo que estás buscando",
  },
];

const TOTAL_STEPS = 4;

function page() {
  // Estado
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [cityData, setCityData] = useState<CityData | undefined>(undefined);
  const [errors, setErrors] = useState({ name: "", city: "" });

  // Validaciones
  const validateName = (): boolean => {
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Por favor ingresa tu nombre" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, name: "" }));
    return true;
  };

  const validateCity = (): boolean => {
    if (!city.trim() || !cityData) {
      setErrors((prev) => ({
        ...prev,
        city: "Por favor selecciona tu ciudad de origen del listado",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, city: "" }));
    return true;
  };

  const validateForm = (): boolean => {
    const isNameValid = validateName();
    const isCityValid = validateCity();
    return isNameValid && isCityValid;
  };

  // Handlers
  const handleCityChange = (value: string, data?: CityData) => {
    console.log("handleCityChange llamado:", { value, data });
    setCity(value);
    setCityData(data);
    if (errors.city && data) {
      setErrors((prev) => ({ ...prev, city: "" }));
    }
  };

  const handleNameChange = (value: string) => {
    console.log("handleNameChange llamado:", value);
    setName(value);
    if (errors.name && value.trim()) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    if (validateForm()) {
      console.log("Datos del usuario:", {
        nombre: name,
        ciudad: cityData?.name,
        país: cityData?.country,
        coordenadas: cityData?.coordinates,
      });
    }
  };

  // Calcular si el form es válido
  const isFormValid =
    name.trim().length > 0 &&
    city.trim().length > 0 &&
    cityData !== undefined &&
    cityData !== null &&
    cityData.name !== undefined &&
    cityData.coordinates !== undefined;

  // Debug exhaustivo

  useEffect(() => {
    console.log("=== DEBUG ESTADO ===");
    console.log("name:", name);
    console.log("name.trim().length:", name.trim().length);
    console.log("city:", city);
    console.log("city.trim().length:", city.trim().length);
    console.log("cityData:", cityData);
    console.log("cityData !== undefined:", cityData !== undefined);
    console.log("cityData !== null:", cityData !== null);
    if (cityData) {
      console.log("cityData.name:", cityData.name);
      console.log("cityData.coordinates:", cityData.coordinates);
    }
    console.log("isFormValid:", isFormValid);
    console.log("==================");
  }, [name, city, cityData, isFormValid]);

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen flex flex-col">
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        {/* Slides 1-3 */}
        {currentStep < 3 && (
          <>
            <div className="flex-[2] bg-secondary-200 flex items-center justify-center">
              <img
                src={ONBOARDING_SLIDES[currentStep].image}
                alt={ONBOARDING_SLIDES[currentStep].title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-h-[33vh] bg-secondary-100 custom-ph flex flex-col justify-between py-6">
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {ONBOARDING_SLIDES[currentStep].title}
                </h2>
                <p className="text-base text-gray-600">
                  {ONBOARDING_SLIDES[currentStep].subtitle}
                </p>
              </div>

              <Button
                onClick={handleContinue}
                className="primary-btn w-full mt-6"
              >
                Continuar
              </Button>
            </div>
          </>
        )}

        {/* Slide 4: Form */}
        {currentStep === 3 && (
          <>
            <div className="flex-[2] bg-secondary-200 flex items-center justify-center">
              <img
                src={ONBOARDING_SLIDES[0].image}
                alt="Formulario"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-h-[40vh] bg-secondary-100 custom-ph flex flex-col justify-between py-6">
              <OnboardingForm
                name={name}
                city={city}
                onNameChange={handleNameChange}
                onCityChange={handleCityChange}
                onSubmit={handleContinue}
                errors={errors}
                isValid={isFormValid}
              />
            </div>
          </>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex min-h-screen w-full">
        {/* Left Side - Carousel */}
        <div className="w-1/2 bg-secondary-200 flex-shrink-0">
          <DesktopCarousel slides={ONBOARDING_SLIDES} />
        </div>

        {/* Right Side - Form */}
        <div className="w-1/2 bg-secondary-100 flex items-center justify-center flex-shrink-0">
          <div className="w-full max-w-lg px-8 lg:px-12">
            <OnboardingForm
              name={name}
              city={city}
              onNameChange={handleNameChange}
              onCityChange={handleCityChange}
              onSubmit={handleContinue}
              errors={errors}
              isValid={isFormValid}
              showTitle={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default page;
