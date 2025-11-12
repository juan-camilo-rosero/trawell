"use client";
import { useState } from 'react';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import { DateInput } from '@/components/ui/DateInput';
import { FiCalendar } from 'react-icons/fi';
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from 'react-icons/ai';

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
      }
    };
    console.log('Datos del formulario:', formData);
  };

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Formulario */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg flex flex-col space-y-8 pt-4">
          
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
            {/* Adultos */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-muted-900">Adultos</h3>
                <p className="text-base text-muted-500">Edad: 13 años o más</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => decrement(setAdults, adults)}
                  disabled={adults === 0}
                  className={`transition-colors ${adults === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-70'}`}
                  aria-label="Disminuir adultos"
                >
                  <AiOutlineMinusCircle size={36} className="text-muted-500" style={{ strokeWidth: 0.5 }} />
                </button>
                <span className="text-xl font-medium text-muted-900 w-10 text-center">{adults}</span>
                <button
                  type="button"
                  onClick={() => increment(setAdults, adults)}
                  disabled={adults === 30}
                  className={`transition-colors ${adults === 30 ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-70'}`}
                  aria-label="Aumentar adultos"
                >
                  <AiOutlinePlusCircle size={36} className="text-muted-500" style={{ strokeWidth: 0.5 }} />
                </button>
              </div>
            </div>

            {/* Niños */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-muted-900">Niños</h3>
                <p className="text-base text-muted-500">Edad: 2 - 12 años</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => decrement(setChildren, children)}
                  disabled={children === 0}
                  className={`transition-colors ${children === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-70'}`}
                  aria-label="Disminuir niños"
                >
                  <AiOutlineMinusCircle size={36} className="text-muted-500" style={{ strokeWidth: 0.5 }} />
                </button>
                <span className="text-xl font-medium text-muted-900 w-10 text-center">{children}</span>
                <button
                  type="button"
                  onClick={() => increment(setChildren, children)}
                  disabled={children === 30}
                  className={`transition-colors ${children === 30 ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-70'}`}
                  aria-label="Aumentar niños"
                >
                  <AiOutlinePlusCircle size={36} className="text-muted-500" style={{ strokeWidth: 0.5 }} />
                </button>
              </div>
            </div>

            {/* Bebés */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-muted-900">Bebés</h3>
                <p className="text-base text-muted-500">Menos de 2 años</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => decrement(setBabies, babies)}
                  disabled={babies === 0}
                  className={`transition-colors ${babies === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-70'}`}
                  aria-label="Disminuir bebés"
                >
                  <AiOutlineMinusCircle size={36} className="text-muted-500" style={{ strokeWidth: 0.5 }} />
                </button>
                <span className="text-xl font-medium text-muted-900 w-10 text-center">{babies}</span>
                <button
                  type="button"
                  onClick={() => increment(setBabies, babies)}
                  disabled={babies === 30}
                  className={`transition-colors ${babies === 30 ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-70'}`}
                  aria-label="Aumentar bebés"
                >
                  <AiOutlinePlusCircle size={36} className="text-muted-500" style={{ strokeWidth: 0.5 }} />
                </button>
              </div>
            </div>
          </div>

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