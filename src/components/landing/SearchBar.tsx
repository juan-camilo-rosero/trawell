'use client'
import { useState, useEffect } from "react";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import { DateInput } from "@/components/ui/DateInput";
import { FiCalendar } from "react-icons/fi";
import { Button } from "@/components/ui/button";

function SearchBar() {
  const [city, setCity] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();

  // Validar que la fecha de vuelta sea posterior a la fecha de ida
  useEffect(() => {
    if (departureDate && returnDate && returnDate <= departureDate) {
      setReturnDate(undefined);
    }
  }, [departureDate, returnDate]);

  const handleDepartureDateChange = (date: Date | undefined) => {
    setDepartureDate(date);
    
    // Si hay fecha de vuelta y la nueva fecha de ida es mayor o igual, limpiar fecha de vuelta
    if (date && returnDate && returnDate <= date) {
      setReturnDate(undefined);
    }
  };

  return (
    <div className="w-full custom-px border-[1px] border-muted-300 rounded-md px-4 py-8 flex flex-col items-center justify-center gap-8">
      <CityAutocomplete
        value={city}
        onChange={(value) => setCity(value)}
        placeholder="Buscar ciudad"
        label="¿A dónde vas?"
        showMapIcon={true}
        showClearIcon={true}
      />
      <DateInput
        value={departureDate}
        onChange={handleDepartureDateChange}
        label="Fecha de ida"
        icon={<FiCalendar size={20} />}
        showClearButton
        maxDate={new Date("2030-01-01")}
        minDate={new Date()}
      />
      <DateInput
        value={returnDate}
        onChange={setReturnDate}
        label="Fecha de vuelta"
        icon={<FiCalendar size={20} />}
        showClearButton
        maxDate={new Date("2030-01-01")}
        minDate={departureDate ? new Date(departureDate.getTime() + 86400000) : new Date()} // Mínimo un día después de la fecha de ida
      />
      <Button className="primary-btn w-full">Empezar</Button>
    </div>
  );
}

export default SearchBar