"use client";

import SearchBar from "@/components/landing/SearchBar";

function HeroSection() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center pt-16 custom-px">
      <div className="flex flex-col items-center gap-6 w-full max-w-md px-4">
        <h1 className="text-4xl font-semibold text-center">Planea tu próximo viaje en segundos</h1>
        <SearchBar />
      </div>
    </div>
  );
}

export default HeroSection;
