"use client";

import { useState } from "react";
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
    image: "https://upload.wikimedia.org/wikipedia/en/5/53/Snoopy_Peanuts.png",
    title: "Planea tu próximo viaje en segundos",
    subtitle:
      "Creamos al instante un itinerario completo para que solo debas preocuparte por disfrutar",
  },
  {
    image:
      "https://logoeps.com/wp-content/uploads/2013/05/snoopy-character-vector.png",
    title: "Pensamos cada detalle de tu experiencia",
    subtitle:
      "Buscamos entre cientos de miles de alojamientos, restaurantes, sitios de interés y vuelos para darte lo mejor",
  },
  {
    image:
      "https://images.fineartamerica.com/images/artworkimages/medium/3/snoopy-love-jennifer-s-payne-transparent.png",
    title: "Nos adaptamos a tu propio estilo",
    subtitle:
      "Desde tu forma de viajar hasta tus preferencias al comer, nos adaptamos a lo que estás buscando",
  },
];

const TOTAL_STEPS = 4;

function Page() {
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
    setCity(value);
    setCityData(data);
    if (errors.city && data) {
      setErrors((prev) => ({ ...prev, city: "" }));
    }
  };

  const handleNameChange = (value: string) => {
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

  return (
    <div className="w-full h-full overflow-hidden">
      {/* Mobile View */}
      <div className="md:hidden h-full flex flex-col justify-between">
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        {/* Slides 1-3 */}
        {currentStep < 3 && (
          <>
            <div className="flex items-center justify-center">
              <img
                src={ONBOARDING_SLIDES[currentStep].image}
                alt={ONBOARDING_SLIDES[currentStep].title}
                className="w-auto max-h-[30vh] max-w-full"
              />
            </div>

            <div className="min-h-[33vh] rounded-t-lg custom-ph flex flex-col justify-between py-6">
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-3xl font-semibold text-gray-900 mb-5 text-center">
                  {ONBOARDING_SLIDES[currentStep].title}
                </h2>
                <p className="text-lg text-gray-600 text-center mb-8">
                  {ONBOARDING_SLIDES[currentStep].subtitle}
                </p>
              </div>

              <Button
                onClick={handleContinue}
                className="primary-btn text-xl w-full mt-6 !py-6"
              >
                Continuar
              </Button>
            </div>
          </>
        )}

        {/* Slide 4: Form */}
        {currentStep === 3 && (
          <>
            <div className="flex-[2] flex items-center justify-center">
              <img
                src={ONBOARDING_SLIDES[1].image}
                alt="Formulario"
                className="w-auto max-h-[30vh]"
              />
            </div>

            <div className="min-h-[40vh] custom-ph flex flex-col justify-between py-6">
              <OnboardingForm
                name={name}
                city={city}
                cityData={cityData}
                onNameChange={handleNameChange}
                onCityChange={handleCityChange}
                onSubmit={handleContinue}
                errors={errors}
                isValid={isFormValid}
                showTitle={true}
              />
            </div>
          </>
        )}
      </div>

      {/* Desktop View - FIX ALTURA Y COLOR */}
      <div className="hidden md:grid md:grid-cols-2 w-full h-full">
        {/* Left Side - Carousel (50% del ancho disponible) */}
        <div className=" overflow-hidden h-full">
          <DesktopCarousel slides={ONBOARDING_SLIDES} />
        </div>

        {/* Right Side - Form (50% del ancho disponible) */}
        <div className=" flex items-center justify-center overflow-hidden h-full">
          <div className="w-full max-w-lg px-8 lg:px-12">
            <OnboardingForm
              name={name}
              city={city}
              cityData={cityData}
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
    </div>
  );
}

export default Page;
