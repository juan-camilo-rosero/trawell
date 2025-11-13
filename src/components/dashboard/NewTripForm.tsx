"use client";
import { useState, useRef, useEffect } from 'react';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import { DateInput } from '@/components/ui/DateInput';
import PassengerCounter from '@/components/dashboard/PassengerCounter';
import TripTypeSelector, { TripType } from '@/components/dashboard/TripTypeSelector';
import FoodPreferencesSelector, { FoodType } from '@/components/dashboard/FoodPreferencesSelector';
import { FiCalendar } from 'react-icons/fi';

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
  const [origin, setOrigin] = useState<string>('');
  const [originData, setOriginData] = useState<CityData | undefined>();
  const [destination, setDestination] = useState<string>('');
  const [destinationData, setDestinationData] = useState<CityData | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [adults, setAdults] = useState<number>(0);
  const [children, setChildren] = useState<number>(0);
  const [babies, setBabies] = useState<number>(0);
  const [tripType, setTripType] = useState<TripType>('cultural');
  const [foodPreferences, setFoodPreferences] = useState<FoodType[]>(['all']);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const formRef = useRef<HTMLFormElement>(null);

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
    }

    if (!tripType) {
      validationErrors.tripType = 'Selecciona un tipo de viaje';
    }

    if (!foodPreferences || foodPreferences.length === 0) {
      validationErrors.foodPreferences = 'Selecciona al menos una preferencia';
    }

    return validationErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    
    const formData = {
      origin: {
        value: origin,
        data: originData
      },
      destination: {
        value: destination,
        data: destinationData
      },
      dates: {
        start: startDate,
        end: endDate
      },
      passengers: {
        adults,
        children,
        babies
      },
      tripType,
      foodPreferences
    };
    console.log('Datos del formulario:', formData);
  };

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2">
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
            className="w-full py-3 primary-btn mt-8"
          >
            Imprimir en consola
          </button>
        </form>
      </div>

      <div className="hidden lg:flex lg:col-span-3 bg-secondary-100 rounded-lg items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="https://images.fineartamerica.com/images/artworkimages/medium/3/snoopy-pilot-airplane-elizabeth-j-campbell-transparent.png" 
            alt="Snoopy Pilot"
            className="w-64 h-64 object-contain"
          />
          <p className="text-muted-500 text-2xl mt-6">
            Ingresa los datos de tu próximo viaje
          </p>
        </div>
      </div>
    </div>
  );
}

export default NewTripForm;