"use client";
import { useState } from 'react';
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

function NewTripForm() {
  const [origin, setOrigin] = useState<string>('');
  const [originData, setOriginData] = useState<CityData | undefined>();
  const [destination, setDestination] = useState<string>('');
  const [destinationData, setDestinationData] = useState<CityData | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  
  // Estados para pasajeros
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [babies, setBabies] = useState<number>(0);

  // Estado para tipo de viaje (por defecto: cultural)
  const [tripType, setTripType] = useState<TripType>('cultural');

  // Estado para preferencias de comida (por defecto: todos)
  const [foodPreferences, setFoodPreferences] = useState<FoodType[]>(['all']);

  const handleOriginChange = (value: string, cityData?: CityData) => {
    setOrigin(value);
    setOriginData(cityData);
  };

  const handleDestinationChange = (value: string, cityData?: CityData) => {
    setDestination(value);
    setDestinationData(cityData);
  };

  // Funciones para manejar incremento/decremento
  const increment = (setter: React.Dispatch<React.SetStateAction<number>>, current: number) => {
    if (current < 30) {
      setter(current + 1);
    }
  };

  const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, current: number) => {
    if (current > 0) {
      setter(current - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      {/* Formulario */}
      <div className="lg:col-span-2 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg flex flex-col space-y-8 pt-4 pb-6">
          
          {/* Input de origen */}
          <div className="mb-4">
            <CityAutocomplete
              value={origin}
              onChange={handleOriginChange}
              placeholder="¿Desde dónde viajas?"
              label="Origen"
              showMapIcon={true}
              showClearIcon={true}
            />
          </div>

          {/* Input de destino */}
          <div className="mb-4">
            <CityAutocomplete
              value={destination}
              onChange={handleDestinationChange}
              placeholder="¿A dónde vas?"
              label="Destino"
              showMapIcon={true}
              showClearIcon={true}
            />
          </div>

          {/* Inputs de fecha lado a lado */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <DateInput
              value={startDate}
              onChange={setStartDate}
              label="Fecha de inicio"
              icon={<FiCalendar size={20} />}
              placeholder="inicio"
              showClearButton={true}
              maxDate={endDate}
            />
            <DateInput
              value={endDate}
              onChange={setEndDate}
              label="Fecha de final"
              icon={<FiCalendar size={20} />}
              placeholder="final"
              showClearButton={true}
              minDate={startDate}
            />
          </div>

          {/* Línea separadora */}
          <div className="w-full h-px bg-muted-300 my-6"></div>

          {/* Selector de pasajeros */}
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
          </div>

          {/* Línea separadora */}
          <div className="w-full h-px bg-muted-300 my-6"></div>

          {/* Selector de tipo de viaje */}
          <TripTypeSelector value={tripType} onChange={setTripType} />

          {/* Línea separadora */}
          <div className="w-full h-px bg-muted-300 my-6"></div>

          {/* Selector de preferencias de comida */}
          <FoodPreferencesSelector value={foodPreferences} onChange={setFoodPreferences} />

          {/* Botón de submit temporal para testing */}
          <button
            type="submit"
            className="w-full py-3 primary-btn mt-8"
          >
            Imprimir en consola
          </button>
        </form>
      </div>

      {/* Espacio para contenido adicional en desktop (3/5) */}
      <div className="hidden lg:block lg:col-span-3 bg-secondary-100 rounded-lg">
        {/* Aquí puedes agregar contenido adicional en el futuro */}
      </div>
    </div>
  );
}

export default NewTripForm;