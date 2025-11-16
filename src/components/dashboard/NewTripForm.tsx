"use client";
import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import { DateInput } from '@/components/ui/DateInput';
import PassengerCounter from '@/components/dashboard/PassengerCounter';
import TripTypeSelector, { TripType } from '@/components/dashboard/TripTypeSelector';
import FoodPreferencesSelector, { FoodType } from '@/components/dashboard/FoodPreferencesSelector';
import ItineraryView from '@/components/dashboard/ItineraryView';
import { FiCalendar, FiArrowLeft } from 'react-icons/fi';

interface CityData {
  name: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface ValidationErrors {
  origin?: string;
  destination?: string;
  dates?: string;
  passengers?: string;
  tripType?: string;
  foodPreferences?: string;
}

function NewTripForm() {
  const { userData } = useUser();
  
  const [origin, setOrigin] = useState<string>('');
  const [originData, setOriginData] = useState<CityData | undefined>();
  const [destination, setDestination] = useState<string>('');
  const [destinationData, setDestinationData] = useState<CityData | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [adults, setAdults] = useState<number>(0);
  const [children, setChildren] = useState<number>(0);
  const [babies, setBabies] = useState<number>(0);
  const [tripType, setTripType] = useState<TripType>('relaxation');
  const [foodPreferences, setFoodPreferences] = useState<FoodType[]>(['all']);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showItinerary, setShowItinerary] = useState<boolean>(false);
  const [itineraryGenerated, setItineraryGenerated] = useState<boolean>(false);
  const [showItineraryView, setShowItineraryView] = useState<boolean>(false);

  const [savedDestination, setSavedDestination] = useState<string>('');
  const [savedDestinationData, setSavedDestinationData] = useState<CityData | undefined>();
  const [savedStartDate, setSavedStartDate] = useState<Date | undefined>();
  const [savedEndDate, setSavedEndDate] = useState<Date | undefined>();
  const [savedTotalPassengers, setSavedTotalPassengers] = useState<number>(0);

  const formRef = useRef<HTMLFormElement>(null);

  const totalPassengers = adults + children + babies;

  useEffect(() => {
    if (userData?.originCity && !origin) {
      const cityDisplay = userData.originCity.name;
      setOrigin(cityDisplay);
      setOriginData({
        name: userData.originCity.name,
        country: '',
        coordinates: userData.originCity.coordinates
      });
    }
  }, [userData, origin]);

  useEffect(() => {
    if (Object.keys(errors).length > 0 && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [errors]);

  const handleOriginChange = (value: string, cityData?: CityData) => {
    setOrigin(value);
    setOriginData(cityData);
    if (errors.origin) {
      setErrors(prev => ({ ...prev, origin: undefined }));
    }
  };

  const handleDestinationChange = (value: string, cityData?: CityData) => {
    setDestination(value);
    setDestinationData(cityData);
    if (errors.destination) {
      setErrors(prev => ({ ...prev, destination: undefined }));
    }
  };

  const increment = (setter: React.Dispatch<React.SetStateAction<number>>, current: number) => {
    if (current < 30) {
      setter(current + 1);
      if (errors.passengers) {
        setErrors(prev => ({ ...prev, passengers: undefined }));
      }
    }
  };

  const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, current: number) => {
    if (current > 0) {
      setter(current - 1);
    }
  };

  const validateForm = (): ValidationErrors => {
    const validationErrors: ValidationErrors = {};

    if (adults === 0) {
      validationErrors.passengers = 'Debe haber al menos un adulto';
    }

    if (!origin || !originData) {
      validationErrors.origin = 'Selecciona una ciudad de origen';
    }

    if (!destination || !destinationData) {
      validationErrors.destination = 'Selecciona una ciudad de destino';
    }

    if (origin && destination && originData && destinationData) {
      if (origin.toLowerCase() === destination.toLowerCase()) {
        validationErrors.destination = 'Debe ser diferente al origen';
      }
    }

    if (!startDate || !endDate) {
      validationErrors.dates = 'Selecciona ambas fechas';
    } else if (startDate >= endDate) {
      validationErrors.dates = 'La fecha de inicio debe ser anterior a la final';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        validationErrors.dates = 'La fecha de inicio no puede ser en el pasado';
      }

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 14) {
        validationErrors.dates = 'El viaje no puede superar 2 semanas de duración';
      }
    }

    if (!tripType) {
      validationErrors.tripType = 'Selecciona un tipo de viaje';
    }

    if (!foodPreferences || foodPreferences.length === 0) {
      validationErrors.foodPreferences = 'Selecciona al menos una preferencia';
    }

    return validationErrors;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const searchFlights = async () => {
    const response = await fetch('https://trawell-yuxn.vercel.app/api/external/flights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originCityName: originData!.name,
        destinationCityName: destinationData!.name,
        originCoordinates: originData!.coordinates,
        destinationCoordinates: destinationData!.coordinates,
        departureDate: formatDate(startDate!),
        returnDate: formatDate(endDate!),
        adults,
        children: children > 0 ? children : undefined,
        infants: babies > 0 ? babies : undefined,
        cabinClass: 'ECONOMY',
        limit: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en búsqueda de vuelos: ${response.statusText}`);
    }

    return response.json();
  };

  const searchHotels = async () => {
    const response = await fetch('https://trawell-yuxn.vercel.app/api/external/places/hotels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cityName: destinationData!.name,
        coordinates: destinationData!.coordinates,
        checkInDate: formatDate(startDate!),
        checkOutDate: formatDate(endDate!),
        adults,
        children: children > 0 ? children : undefined,
        rooms: 1,
        limit: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en búsqueda de hoteles: ${response.statusText}`);
    }

    return response.json();
  };

  const searchRestaurants = async () => {
    const response = await fetch('https://trawell-yuxn.vercel.app/api/external/places/restaurants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cityName: destinationData!.name,
        coordinates: destinationData!.coordinates,
        categories: foodPreferences,
        limit: 10,
        minRating: 3.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en búsqueda de restaurantes: ${response.statusText}`);
    }

    return response.json();
  };

  const searchTouristSites = async () => {
    const response = await fetch('https://trawell-yuxn.vercel.app/api/external/places/tourist-sites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cityName: destinationData!.name,
        coordinates: destinationData!.coordinates,
        limit: 10,
        minRating: 3.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en búsqueda de sitios turísticos: ${response.statusText}`);
    }

    return response.json();
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
      console.log('🚀 Iniciando búsqueda de servicios...\n');

      const [flightsResult, hotelsResult, restaurantsResult, touristSitesResult] = await Promise.all([
        searchFlights(),
        searchHotels(),
        searchRestaurants(),
        searchTouristSites(),
      ]);

      console.log('✈️ VUELOS:');
      console.log('═══════════════════════════════════════');
      if (flightsResult.success) {
        console.log(`Total de vuelos encontrados: ${flightsResult.data.totalResults}`);
        console.log('Vuelos:', flightsResult.data.flights);
      } else {
        console.log('Error:', flightsResult.error, flightsResult.message);
      }
      console.log('\n');

      console.log('🏨 HOTELES:');
      console.log('═══════════════════════════════════════');
      if (hotelsResult.success) {
        console.log(`Total de hoteles encontrados: ${hotelsResult.data.totalResults}`);
        console.log('Hoteles:', hotelsResult.data.hotels);
      } else {
        console.log('Error:', hotelsResult.error, hotelsResult.message);
      }
      console.log('\n');

      console.log('🍽️ RESTAURANTES:');
      console.log('═══════════════════════════════════════');
      if (restaurantsResult.success) {
        console.log(`Total de restaurantes encontrados: ${restaurantsResult.data.totalResults}`);
        console.log('Restaurantes:', restaurantsResult.data.restaurants);
      } else {
        console.log('Error:', restaurantsResult.error, restaurantsResult.message);
      }
      console.log('\n');

      console.log('🏛️ SITIOS TURÍSTICOS:');
      console.log('═══════════════════════════════════════');
      if (touristSitesResult.success) {
        console.log(`Total de sitios encontrados: ${touristSitesResult.data.totalResults}`);
        console.log('Sitios:', touristSitesResult.data.sites);
      } else {
        console.log('Error:', touristSitesResult.error, touristSitesResult.message);
      }
      console.log('\n');

      console.log('✅ Búsqueda completada exitosamente');
      
      setSavedDestination(destinationData!.name);
      setSavedDestinationData(destinationData);
      setSavedStartDate(startDate);
      setSavedEndDate(endDate);
      setSavedTotalPassengers(totalPassengers);
      
      setShowItinerary(true);
      setItineraryGenerated(true);

    } catch (error) {
      console.error('❌ Error al buscar servicios:', error);
      setErrors({ destination: 'Error al buscar servicios. Por favor intenta nuevamente.' });
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
    setOrigin('');
    setOriginData(undefined);
    setDestination('');
    setDestinationData(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setAdults(0);
    setChildren(0);
    setBabies(0);
    setTripType('cultural');
    setFoodPreferences(['all']);
    setErrors({});
    setShowItinerary(false);
    setItineraryGenerated(false);
    setShowItineraryView(false);
    setSavedDestination('');
    setSavedDestinationData(undefined);
    setSavedStartDate(undefined);
    setSavedEndDate(undefined);
    setSavedTotalPassengers(0);
  };

  const getMapUrl = () => {
    if (!savedDestinationData?.coordinates) return '';
    const { lat, lng } = savedDestinationData.coordinates;
    return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-6 gap-6">
      <div className={`lg:col-span-2 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2 ${showItineraryView ? 'hidden lg:block' : ''}`}>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg flex flex-col space-y-8 pt-4 pb-0 lg:px-6" ref={formRef}>
          
          <div className="mb-0">
            <CityAutocomplete
              value={origin}
              onChange={handleOriginChange}
              placeholder="¿Desde dónde viajas?"
              label="Origen"
              showMapIcon={true}
              showClearIcon={true}
            />
            {errors.origin && (
              <p className="text-red-500 text-xs mt-1">{errors.origin}</p>
            )}
          </div>

          <div className="mb-4">
            <CityAutocomplete
              value={destination}
              onChange={handleDestinationChange}
              placeholder="¿A dónde vas?"
              label="Destino"
              showMapIcon={true}
              showClearIcon={true}
            />
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
                    setErrors(prev => ({ ...prev, dates: undefined }));
                  }
                }}
                label="Fecha de inicio"
                icon={<FiCalendar size={20} />}
                placeholder="inicio"
                showClearButton={true}
                maxDate={endDate}
              />
              <DateInput
                value={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  if (errors.dates) {
                    setErrors(prev => ({ ...prev, dates: undefined }));
                  }
                }}
                label="Fecha de final"
                icon={<FiCalendar size={20} />}
                placeholder="final"
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
              label="Adultos"
              description="Edad: 13 años o más"
              value={adults}
              onIncrement={() => increment(setAdults, adults)}
              onDecrement={() => decrement(setAdults, adults)}
            />

            <PassengerCounter
              label="Niños"
              description="Edad: 2 - 12 años"
              value={children}
              onIncrement={() => increment(setChildren, children)}
              onDecrement={() => decrement(setChildren, children)}
            />

            <PassengerCounter
              label="Bebés"
              description="Menos de 2 años"
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
                  setErrors(prev => ({ ...prev, tripType: undefined }));
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
                  setErrors(prev => ({ ...prev, foodPreferences: undefined }));
                }
              }} 
            />
            {errors.foodPreferences && (
              <p className="text-red-500 text-xs mt-1">{errors.foodPreferences}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 primary-btn mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generando itinerario...' : itineraryGenerated ? 'Actualizar itinerario' : 'Crear itinerario'}
          </button>
        </form>
      </div>

      <div className={`lg:hidden ${showItineraryView ? 'block' : 'hidden'} h-[calc(100vh-6rem)] overflow-y-auto`}>
        <div className="flex flex-col h-full">
          <button
            onClick={handleBackToForm}
            className="flex items-center gap-2 text-muted-500 mb-4"
          >
            <FiArrowLeft size={20} />
            <span>Volver</span>
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
                src="https://images.fineartamerica.com/images/artworkimages/medium/3/snoopy-pilot-airplane-elizabeth-j-campbell-transparent.png" 
                alt="Snoopy Pilot"
                className="w-64 h-64 object-contain"
              />
              <p className="text-muted-500 text-2xl mt-6">
                {isLoading ? 'Buscando los mejores servicios para tu viaje...' : 'Ingresa los datos de tu próximo viaje'}
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
              {savedDestinationData?.coordinates && (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={getMapUrl()}
                />
              )}
            </div>
          </>
        )}
      </div>

      {itineraryGenerated && !showItineraryView && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg custom-ph py-4 flex flex-col gap-3">
          <button
            onClick={handleViewItinerary}
            className="w-full py-3 primary-btn"
          >
            Ver itinerario
          </button>
          <button
            onClick={handleNewItinerary}
            className="w-full py-3 secondary-btn"
          >
            Crear nuevo itinerario
          </button>
        </div>
      )}
    </div>
  );
}

export default NewTripForm;