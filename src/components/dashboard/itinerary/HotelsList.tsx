"use client";
import React from "react";
import { useItinerary } from "@/contexts/ItineraryContext";
import ItemCard from "./ItemCard";
import { createHotelItemFromResponse } from "@/lib/helpers/item-creator.helper";
import { addMinutesToTime } from "@/lib/helpers/itinerary.helpers";

interface HotelsListProps {
  dayNumber: number;
  onSuccess?: () => void;
}

function HotelsList({ dayNumber, onSuccess }: HotelsListProps) {
  const { availableHotels, itinerary, addItemToDay } = useItinerary();

  const handleSelectHotel = async (hotelIndex: number) => {
    if (!itinerary) return;

    const hotel = availableHotels[hotelIndex];
    const day = itinerary.days.find((d) => d.dayNumber === dayNumber);

    if (!day) return;

    // Calcular tiempo del último item
    const lastItem = day.items[day.items.length - 1];
    const newTime = lastItem
      ? addMinutesToTime(lastItem.time, 30)
      : "22:00";

    const totalTravelers =
      itinerary.searchParams.travelers.adults +
      (itinerary.searchParams.travelers.children || 0) +
      (itinerary.searchParams.travelers.babies || 0);

    const newItem = createHotelItemFromResponse(
      hotel,
      0, // El order se calculará en addItemToDay
      newTime,
      itinerary.searchParams.departureDate,
      itinerary.searchParams.returnDate,
      totalTravelers,
      dayNumber
    );

    const success = await addItemToDay(dayNumber, newItem);

    if (success && onSuccess) {
      onSuccess();
    }
  };

  if (availableHotels.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-500">
          No hay hoteles disponibles. Genera un itinerario primero.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-muted-900 mb-4">
        Hoteles disponibles ({availableHotels.length})
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {availableHotels.map((hotel, index) => (
          <ItemCard
            key={hotel.hotelId}
            title={hotel.name}
            subtitle={hotel.address || "Hotel"}
            price={`${hotel.price.currency} ${hotel.price.pricePerNight.toLocaleString()} / noche`}
            rating={undefined}
            details={[
              hotel.roomDetails?.type || "Habitación Estándar",
              `Check-in: ${new Date(hotel.checkInDate).toLocaleDateString()}`,
              `Check-out: ${new Date(hotel.checkOutDate).toLocaleDateString()}`,
            ]}
            onClick={() => handleSelectHotel(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default HotelsList;