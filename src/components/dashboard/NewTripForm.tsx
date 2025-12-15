"use client";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import { DateInput } from "@/components/ui/DateInput";
import PassengerCounter from "@/components/dashboard/PassengerCounter";
import TripTypeSelector, {
  TripType,
} from "@/components/dashboard/TripTypeSelector";
import FoodPreferencesSelector, {
  FoodType,
} from "@/components/dashboard/FoodPreferencesSelector";
import ItineraryView from "@/components/dashboard/ItineraryView";
import { FiCalendar, FiArrowLeft } from "react-icons/fi";
import { useItinerary } from "@/contexts/ItineraryContext";
import MapView from "@/components/dashboard/MapView";

interface CityData {
  name: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
}

interface ValidationErrors {
  origin?: string;
  destination?: string;
  dates?: string;
  passengers?: string;
  tripType?: string;
  foodPreferences?: string;
}

interface NewTripFormProps {
  itineraryId?: string;
}

function NewTripForm({ itineraryId }: NewTripFormProps) {
  const { userData } = useUser();
  const {
    generateItinerary,
    mapMarkers,
    loadItinerary,
    itinerary: contextItinerary,
    isLoading: contextLoading,
  } = useItinerary();

  const [origin, setOrigin] = useState<string>("");
  const [originData, setOriginData] = useState<CityData | undefined>();
  const [destination, setDestination] = useState<string>("");
  const [destinationData, setDestinationData] = useState<
    CityData | undefined
  >();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [adults, setAdults] = useState<number>(0);
  const [children, setChildren] = useState<number>(0);
  const [babies, setBabies] = useState<number>(0);
  const [tripType, setTripType] = useState<TripType>("relaxation");
  const [foodPreferences, setFoodPreferences] = useState<FoodType[]>(["all"]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showItinerary, setShowItinerary] = useState<boolean>(false);
  const [itineraryGenerated, setItineraryGenerated] = useState<boolean>(false);
  const [showItineraryView, setShowItineraryView] = useState<boolean>(false);
  const [isLoadingItinerary, setIsLoadingItinerary] = useState<boolean>(false);

  const [savedDestination, setSavedDestination] = useState<string>("");
  const [savedDestinationData, setSavedDestinationData] = useState<
    CityData | undefined
  >();
  const [savedStartDate, setSavedStartDate] = useState<Date | undefined>();
  const [savedEndDate, setSavedEndDate] = useState<Date | undefined>();
  const [savedTotalPassengers, setSavedTotalPassengers] = useState<number>(0);

  const formRef = useRef<HTMLFormElement>(null);
  const hasLoadedItinerary = useRef<boolean>(false);

  const isUpdateMode = !!itineraryId;
  const totalPassengers = adults + children + babies;

  useEffect(() => {
    const loadExistingItinerary = async () => {
      if (!itineraryId || hasLoadedItinerary.current) return;

      hasLoadedItinerary.current = true;
      setIsLoadingItinerary(true);
      try {
        await loadItinerary(itineraryId);
      } catch (error) {
        console.error("Error loading itinerary:", error);
        setErrors({
          destination:
            "Error loading itinerary. Please try again.",
        });
      } finally {
        setIsLoadingItinerary(false);
      }
    };

    loadExistingItinerary();
  }, [itineraryId, loadItinerary]);

  useEffect(() => {
    if (!contextItinerary || !isUpdateMode || !hasLoadedItinerary.current)
      return;

    setOrigin(contextItinerary.searchParams.originCity.name);
    setOriginData({
      name: contextItinerary.searchParams.originCity.name,
      country: "",
      coordinates: contextItinerary.searchParams.originCity.coordinates,
      placeId: contextItinerary.searchParams.originCity.placeId,
    });

    setDestination(contextItinerary.searchParams.destinationCity.name);
    setDestinationData({
      name: contextItinerary.searchParams.destinationCity.name,
      country: "",
      coordinates: contextItinerary.searchParams.destinationCity.coordinates,
      placeId: contextItinerary.searchParams.destinationCity.placeId,
    });

    const departureDate = new Date(contextItinerary.searchParams.departureDate);
    const returnDate = new Date(contextItinerary.searchParams.returnDate);

    setStartDate(departureDate);
    setEndDate(returnDate);

    setAdults(contextItinerary.searchParams.travelers.adults);
    setChildren(contextItinerary.searchParams.travelers.children || 0);
    setBabies(contextItinerary.searchParams.travelers.babies || 0);

    setTripType(contextItinerary.searchParams.travelType as TripType);

    setShowItinerary(true);
    setItineraryGenerated(true);

    setSavedDestination(contextItinerary.searchParams.destinationCity.name);
    setSavedDestinationData({
      name: contextItinerary.searchParams.destinationCity.name,
      country: "",
      coordinates: contextItinerary.searchParams.destinationCity.coordinates,
      placeId: contextItinerary.searchParams.destinationCity.placeId,
    });
    setSavedStartDate(departureDate);
    setSavedEndDate(returnDate);
    setSavedTotalPassengers(
      contextItinerary.searchParams.travelers.adults +
        (contextItinerary.searchParams.travelers.children || 0) +
        (contextItinerary.searchParams.travelers.babies || 0)
    );

    console.log("✅ Form pre-filled successfully");
  }, [contextItinerary, isUpdateMode]);

  useEffect(() => {
    if (userData?.originCity && !origin && !isUpdateMode) {
      const cityDisplay = userData.originCity.name;
      setOrigin(cityDisplay);
      setOriginData({
        name: userData.originCity.name,
        country: "",
        coordinates: userData.originCity.coordinates,
      });
    }
  }, [userData, origin, isUpdateMode]);

  useEffect(() => {
    if (Object.keys(errors).length > 0 && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [errors]);

  const handleOriginChange = (value: string, cityData?: CityData) => {
    if (isUpdateMode) return;
    setOrigin(value);
    setOriginData(cityData);
    if (errors.origin) {
      setErrors((prev) => ({ ...prev, origin: undefined }));
    }
  };

  const handleDestinationChange = (value: string, cityData?: CityData) => {
    if (isUpdateMode) return;
    setDestination(value);
    setDestinationData(cityData);
    if (errors.destination) {
      setErrors((prev) => ({ ...prev, destination: undefined }));
    }
  };

  const increment = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    current: number
  ) => {
    if (current < 30) {
      setter(current + 1);
      if (errors.passengers) {
        setErrors((prev) => ({ ...prev, passengers: undefined }));
      }
    }
  };

  const decrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    current: number
  ) => {
    if (current > 0) {
      setter(current - 1);
    }
  };

  const validateForm = (): ValidationErrors => {
    const validationErrors: ValidationErrors = {};

    if (adults === 0) {
      validationErrors.passengers = "There must be at least one adult";
    }

    if (!origin || !originData) {
      validationErrors.origin = "Select an origin city";
    }

    if (!destination || !destinationData) {
      validationErrors.destination = "Select a destination city";
    }

    if (origin && destination && originData && destinationData) {
      if (origin.toLowerCase() === destination.toLowerCase()) {
        validationErrors.destination = "Must be different from origin";
      }
    }

    if (!startDate || !endDate) {
      validationErrors.dates = "Select both dates";
    } else if (startDate >= endDate) {
      validationErrors.dates =
        "Start date must be before end date";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        validationErrors.dates = "Start date cannot be in the past";
      }

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 14) {
        validationErrors.dates =
          "Trip cannot exceed 2 weeks duration";
      }
    }

    if (!tripType) {
      validationErrors.tripType = "Select a trip type";
    }

    if (!foodPreferences || foodPreferences.length === 0) {
      validationErrors.foodPreferences = "Select at least one preference";
    }

    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await generateItinerary({
        originCityName: originData!.name,
        originCoordinates: originData!.coordinates,
        originPlaceId: originData?.placeId,
        destinationCityName: destinationData!.name,
        destinationCoordinates: destinationData!.coordinates,
        destinationPlaceId: destinationData?.placeId,
        departureDate: startDate!,
        returnDate: endDate!,
        adults,
        children: children > 0 ? children : undefined,
        babies: babies > 0 ? babies : undefined,
        travelType: tripType as
          | "relaxation"
          | "luxury"
          | "cultural"
          | "adventure"
          | "gastronomic"
          | "spiritual",
        foodPreferences,
        currency: "COP",
      });


      if (!isUpdateMode) {
        setSavedDestination(destinationData!.name);
        setSavedDestinationData(destinationData);
        setSavedStartDate(startDate);
        setSavedEndDate(endDate);
        setSavedTotalPassengers(totalPassengers);

        setShowItinerary(true);
        setItineraryGenerated(true);
      }
    } catch (error) {
      console.error(
        `❌ Error ${isUpdateMode ? "updating" : "generating"} itinerary:`,
        error
      );
      setErrors({
        destination: `Error ${
          isUpdateMode ? "updating" : "generating"
        } the itinerary. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setShowItineraryView(false);
  };

  const handleViewItinerary = () => {
    setShowItineraryView(true);
  };

  const handleNewItinerary = () => {
    setOrigin("");
    setOriginData(undefined);
    setDestination("");
    setDestinationData(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setAdults(0);
    setChildren(0);
    setBabies(0);
    setTripType("cultural");
    setFoodPreferences(["all"]);
    setErrors({});
    setShowItinerary(false);
    setItineraryGenerated(false);
    setShowItineraryView(false);
    setSavedDestination("");
    setSavedDestinationData(undefined);
    setSavedStartDate(undefined);
    setSavedEndDate(undefined);
    setSavedTotalPassengers(0);
  };

  if (isLoadingItinerary) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-muted-500 text-lg">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-6 gap-6">
      <div
        className={`lg:col-span-2 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2 ${
          showItineraryView ? "hidden lg:block" : ""
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg flex flex-col space-y-8 pt-4 pb-0 lg:px-6"
          ref={formRef}
        >
          <div className="mb-0">
            <div
              className={isUpdateMode ? "pointer-events-none opacity-60" : ""}
            >
              <CityAutocomplete
                value={origin}
                onChange={handleOriginChange}
                placeholder="Where are you traveling from?"
                label="Origin"
                showMapIcon={true}
                showClearIcon={!isUpdateMode}
              />
            </div>
            {errors.origin && (
              <p className="text-red-500 text-xs mt-1">{errors.origin}</p>
            )}
          </div>

          <div className="mb-4">
            <div
              className={isUpdateMode ? "pointer-events-none opacity-60" : ""}
            >
              <CityAutocomplete
                value={destination}
                onChange={handleDestinationChange}
                placeholder="Where are you going?"
                label="Destination"
                showMapIcon={true}
                showClearIcon={!isUpdateMode}
              />
            </div>
            {errors.destination && (
              <p className="text-red-500 text-xs mt-1">{errors.destination}</p>
            )}
          </div>

          <div className="mb-4">
            <div className="grid grid-cols-2 gap-3">
              <DateInput
                value={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  if (errors.dates) {
                    setErrors((prev) => ({ ...prev, dates: undefined }));
                  }
                }}
                label="Start Date"
                icon={<FiCalendar size={20} />}
                placeholder="start"
                showClearButton={true}
                maxDate={endDate}
              />
              <DateInput
                value={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  if (errors.dates) {
                    setErrors((prev) => ({ ...prev, dates: undefined }));
                  }
                }}
                label="End Date"
                icon={<FiCalendar size={20} />}
                placeholder="end"
                showClearButton={true}
                minDate={startDate}
              />
            </div>
            {errors.dates && (
              <p className="text-red-500 text-xs mt-1">{errors.dates}</p>
            )}
          </div>

          <div className="w-full h-px bg-muted-300 my-6"></div>

          <div className="space-y-6">
            <PassengerCounter
              label="Adults"
              description="Age: 13+"
              value={adults}
              onIncrement={() => increment(setAdults, adults)}
              onDecrement={() => decrement(setAdults, adults)}
            />

            <PassengerCounter
              label="Children"
              description="Age: 2 - 12"
              value={children}
              onIncrement={() => increment(setChildren, children)}
              onDecrement={() => decrement(setChildren, children)}
            />

            <PassengerCounter
              label="Babies"
              description="Under 2"
              value={babies}
              onIncrement={() => increment(setBabies, babies)}
              onDecrement={() => decrement(setBabies, babies)}
            />

            {errors.passengers && (
              <p className="text-red-500 text-xs mt-1">{errors.passengers}</p>
            )}
          </div>

          <div className="w-full h-px bg-muted-300 my-6"></div>

          <div>
            <TripTypeSelector
              value={tripType}
              onChange={(type) => {
                setTripType(type);
                if (errors.tripType) {
                  setErrors((prev) => ({ ...prev, tripType: undefined }));
                }
              }}
            />
            {errors.tripType && (
              <p className="text-red-500 text-xs mt-1">{errors.tripType}</p>
            )}
          </div>

          <div className="w-full h-px bg-muted-300 my-6"></div>

          <div>
            <FoodPreferencesSelector
              value={foodPreferences}
              onChange={(prefs) => {
                setFoodPreferences(prefs);
                if (errors.foodPreferences) {
                  setErrors((prev) => ({
                    ...prev,
                    foodPreferences: undefined,
                  }));
                }
              }}
            />
            {errors.foodPreferences && (
              <p className="text-red-500 text-xs mt-1">
                {errors.foodPreferences}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || contextLoading}
            className="w-full py-3 primary-btn mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || contextLoading
              ? isUpdateMode
                ? "Updating..."
                : "Generating itinerary..."
              : isUpdateMode
              ? "Update itinerary"
              : itineraryGenerated
              ? "Regenerate itinerary"
              : "Create itinerary"}
          </button>
        </form>
      </div>

      <div
        className={`lg:hidden ${
          showItineraryView ? "block" : "hidden"
        } h-[calc(100vh-6rem)] overflow-y-auto`}
      >
        <div className="flex flex-col h-full">
          <button
            onClick={handleBackToForm}
            className="flex items-center gap-2 text-muted-500 mb-4"
          >
            <FiArrowLeft size={20} />
            <span>Back</span>
          </button>

          <ItineraryView
            destination={savedDestination}
            startDate={savedStartDate}
            endDate={savedEndDate}
            totalPassengers={savedTotalPassengers}
            coordinates={savedDestinationData?.coordinates}
          />
        </div>
      </div>

      <div className="hidden lg:flex lg:col-span-4 gap-4">
        {!showItinerary ? (
          <div className="flex-1 bg-secondary-100 rounded-lg items-center justify-center flex">
            <div className="flex flex-col items-center gap-4">
              <img
                src="https://trawell-yuxn.vercel.app/static/trawell_ilustracion3.png"
                alt="Trawell illustration"
                className="h-64"
              />
              <p className="text-muted-500 text-2xl mt-6">
                {isLoading || contextLoading
                  ? "Looking for the best services for your trip..."
                  : isUpdateMode
                  ? "Modify parameters and update your itinerary"
                  : "Enter your upcoming trip details"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <ItineraryView
                destination={savedDestination}
                startDate={savedStartDate}
                endDate={savedEndDate}
                totalPassengers={savedTotalPassengers}
                coordinates={savedDestinationData?.coordinates}
              />
            </div>
            <div className="flex-1 rounded-lg overflow-hidden">
              <MapView
                markers={mapMarkers}
                center={savedDestinationData?.coordinates}
                showSaveButton={!isUpdateMode}
              />
            </div>
          </>
        )}
      </div>

      {itineraryGenerated && !showItineraryView && !isUpdateMode && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg custom-ph py-4 flex flex-col gap-3">
          <button
            onClick={handleViewItinerary}
            className="w-full py-3 primary-btn"
          >
            Ver itinerary
          </button>
          <button
            onClick={handleNewItinerary}
            className="w-full py-3 secondary-btn"
          >
            Create new itinerary
          </button>
        </div>
      )}
    </div>
  );
}

export default NewTripForm;
