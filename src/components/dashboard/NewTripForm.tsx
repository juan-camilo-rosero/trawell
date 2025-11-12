"use client";

import { useState } from 'react';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import { DateInput } from '@/components/ui/DateInput';
import { FiMapPin, FiCalendar } from 'react-icons/fi';

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

  const handleOriginChange = (value: string, cityData?: CityData) => {
    setOrigin(value);
    setOriginData(cityData);
  };

  const handleDestinationChange = (value: string, cityData?: CityData) => {
    setDestination(value);
    setDestinationData(cityData);
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
      }
    };

    console.log('Datos del formulario:', formData);
  };

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Formulario */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg flex flex-col space-y-8">
          <h2 className="text-2xl font-semibold text-muted-900 mb-6">Nuevo viaje</h2>
          
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
              placeholder="¿Cuándo viajas?"
              showClearButton={true}
              maxDate={endDate}
            />
            <DateInput
              value={endDate}
              onChange={setEndDate}
              label="Fecha de fin"
              icon={<FiCalendar size={20} />}
              placeholder="¿Cuándo vuelves?"
              showClearButton={true}
              minDate={startDate}
            />
          </div>

          {/* Línea separadora */}
          <div className="w-full h-px bg-muted-300 my-6"></div>

          {/* Sección para inputs adicionales */}
          <div className="mb-4">
            <p className="text-sm text-muted-500">Inputs que luego voy a poner...</p>
          </div>

          {/* Botón de submit temporal para testing */}
          <button
            type="submit"
            className="w-full py-3 primary-btn"
          >
            Guardar (consola)
          </button>
        </form>
      </div>

      {/* Espacio para contenido adicional en desktop (3/5) */}
      <div className="hidden lg:block lg:col-span-3 bg-muted-50 rounded-lg">
        {/* Aquí puedes agregar contenido adicional en el futuro */}
      </div>
    </div>
  );
}

export default NewTripForm;