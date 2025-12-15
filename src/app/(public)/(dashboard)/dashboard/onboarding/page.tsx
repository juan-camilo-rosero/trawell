"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase.config";
import { useUser } from "@/contexts/UserContext";
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
  placeId?: string;
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
    title: "Plan your next trip in seconds",
    subtitle:
      "We instantly create a complete itinerary so you only have to worry about enjoying yourself",
  },
  {
    image:
      "https://logoeps.com/wp-content/uploads/2013/05/snoopy-character-vector.png",
    title: "We think of every detail of your experience",
    subtitle:
      "We search hundreds of thousands of accommodations, restaurants, sights, and flights to give you the best",
  },
  {
    image:
      "https://images.fineartamerica.com/images/artworkimages/medium/3/snoopy-love-jennifer-s-payne-transparent.png",
    title: "We adapt to your own style",
    subtitle:
      "From how you travel to your dining preferences, we adapt to what you're looking for",
  },
  {
    image:
      "https://img2.clipart-library.com/27/snoopy-woodstock-clip-art/snoopy-woodstock-clip-art-19.gif",
    title: "Let's start!",
    subtitle:
      "Tell us a little about yourself to personalize your experience from the very first moment",
  },
];

const TOTAL_STEPS = 4;

function Page() {
  const router = useRouter();
  const { refreshUserData } = useUser();
  
  // Estado
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [cityData, setCityData] = useState<CityData | undefined>(undefined);
  const [errors, setErrors] = useState({ name: "", city: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Validaciones
  const validateName = (): boolean => {
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Please enter your name" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, name: "" }));
    return true;
  };

  const validateCity = (): boolean => {
    if (!city.trim() || !cityData) {
      setErrors((prev) => ({
        ...prev,
        city: "Please select your city of origin from the list",
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
    if (apiError) setApiError("");
  };

  const handleNameChange = (value: string) => {
    console.log("handleNameChange llamado:", value);
    setName(value);
    if (errors.name && value.trim()) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
    if (apiError) setApiError("");
  };

  // Función para enviar el onboarding a la API
  const submitOnboarding = async () => {
    // Validar formulario
    if (!validateForm()) {
      return;
    }

    // Obtener Firebase UID
    const user = auth.currentUser;
    if (!user) {
      setApiError("Could not retrieve user information. Please log in again.");
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      
      const response = await fetch(`${baseUrl}/api/users/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firebaseUid: user.uid,
          name: name.trim(),
          originCity: {
            name: cityData!.name,
            coordinates: {
              lat: cityData!.coordinates.lat,
              lng: cityData!.coordinates.lng,
            },
            ...(cityData!.placeId && { placeId: cityData!.placeId }),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error completing onboarding");
      }

      console.log("Onboarding completado exitosamente:", data);
      
      // CRÍTICO: Refrescar los datos del usuario para que AuthGuard vea hasCompletedOnboarding: true
      await refreshUserData();
      
      // Redirigir al dashboard
      router.push("/dashboard");
      
    } catch (error) {
      console.error("Error en onboarding:", error);
      setApiError(
        error instanceof Error
          ? error.message
          : "An error occurred while completing onboarding. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para mobile (con navegación de slides)
  const handleContinue = async () => {
    // Para mobile - navegación entre slides
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // En el último slide, enviar el onboarding
    await submitOnboarding();
  };

  // Handler para desktop (sin navegación de slides)
  const handleDesktopSubmit = async () => {
    await submitOnboarding();
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
                Continue
              </Button>
            </div>
          </>
        )}

        {/* Slide 4: Form */}
        {currentStep === 3 && (
          <>
            <div className="flex-[2] flex items-center justify-center">
              <img
                src={ONBOARDING_SLIDES[3].image}
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
                isLoading={isLoading}
                apiError={apiError}
              />
            </div>
          </>
        )}
      </div>

      {/* Desktop View - FORM A LA IZQUIERDA, CARRUSEL A LA DERECHA */}
      <div className="hidden md:grid md:grid-cols-2 w-full h-full">
        {/* Left Side - Form (50% del ancho disponible) */}
        <div className="bg-secondary-100 flex items-center justify-center overflow-hidden h-full">
          <div className="w-full max-w-lg px-8 lg:px-12">
            <OnboardingForm
              name={name}
              city={city}
              cityData={cityData}
              onNameChange={handleNameChange}
              onCityChange={handleCityChange}
              onSubmit={handleDesktopSubmit}
              errors={errors}
              isValid={isFormValid}
              isLoading={isLoading}
              apiError={apiError}
              showTitle={true}
            />
          </div>
        </div>

        {/* Right Side - Carousel (50% del ancho disponible) */}
        <div className="bg-secondary-100 overflow-hidden h-full">
          <DesktopCarousel slides={ONBOARDING_SLIDES} />
        </div>
      </div>
    </div>
  );
}

export default Page;