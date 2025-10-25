"use client";

import { useState } from "react";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import { Input } from "@/components/ui/input";
import { FiUser } from "react-icons/fi";
import { DateInput } from "@/components/ui/DateInput";
import { FiCalendar } from "react-icons/fi";

function HeroSection() {
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date>();

  return (
    <div className="w-full min-h-screen flex items-center justify-center pt-16">
      <div className="flex flex-col items-center gap-6 w-full max-w-md px-4">
        <h1 className="text-4xl font-bold text-center">Hola mundo :3</h1>

        <CityAutocomplete
          value={city}
          onChange={(value) => setCity(value)}
          placeholder="Buscar ciudad"
          label="¿A dónde vas?"
          showMapIcon={true}
          showClearIcon={true}
        />
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          label="Nombre completo"
          icon={<FiUser size={20} />}
          showClearButton
          onClear={() => setName("")}
          placeholder="Escribe tu nombre"
        />
        <DateInput
          value={birthDate}
          onChange={setBirthDate}
          label="Fecha de nacimiento"
          icon={<FiCalendar size={20} />}
          showClearButton
          maxDate={new Date()} // No permitir fechas futuras
          minDate={new Date("1900-01-01")} // No permitir fechas muy antiguas
        />
      </div>
    </div>
  );
}

export default HeroSection;
