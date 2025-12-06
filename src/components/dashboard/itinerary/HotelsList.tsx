"use client";
import React, { useState } from "react";
import { useItinerary } from "@/contexts/ItineraryContext";
import ItemCard from "./ItemCard";
import { createHotelItemFromResponse } from "@/lib/helpers/item-creator.helper";
import { addMinutesToTime } from "@/lib/helpers/itinerary.helpers";

interface HotelsListProps {
  dayNumber: number;
  onSuccess?: () => void;
  insertPosition?: "before" | "after" | "end" | "replace";
  relativeToItemId?: string;
}

function HotelsList({
  dayNumber,
  onSuccess,
  insertPosition = "end",
  relativeToItemId,
}: HotelsListProps) {
  const { availableHotels, itinerary, addItemToDay, addItemToPosition, replaceItemInDay } =
    useItinerary();
  const [isAdding, setIsAdding] = useState(false);

  const handleSelectHotel = async (hotelIndex: number) => {
    if (!itinerary || isAdding) return;
    setIsAdding(true);

    try {
      const hotel = availableHotels[hotelIndex];
      const day = itinerary.days.find((d) => d.dayNumber === dayNumber);
      if (!day) {
        console.error("Día no encontrado");
        return;
      }

      let newTime = "22:00";

      if (insertPosition === "end") {
        const lastItem = day.items[day.items.length - 1];
        newTime = lastItem ? addMinutesToTime(lastItem.time, 30) : "22:00";
      } else if (relativeToItemId) {
        const relativeItem = day.items.find(
          (item) => item.itemId === relativeToItemId
        );
        if (relativeItem) {
          if (insertPosition === "before") {
            newTime = addMinutesToTime(relativeItem.time, -30);
          } else if (insertPosition === "after") {
            newTime = addMinutesToTime(relativeItem.time, 30);
          } else if (insertPosition === "replace") {
            newTime = relativeItem.time;
          }
        }
      }

      const totalTravelers =
        itinerary.searchParams.travelers.adults +
        (itinerary.searchParams.travelers.children || 0) +
        (itinerary.searchParams.travelers.babies || 0);

      const newItem = createHotelItemFromResponse(
        hotel,
        0,
        newTime,
        itinerary.searchParams.departureDate,
        itinerary.searchParams.returnDate,
        totalTravelers,
        dayNumber
      );

      let success = false;

      if (insertPosition === "end") {
        success = await addItemToDay(dayNumber, newItem);
      } else if (insertPosition === "replace" && relativeToItemId) {
        success = await replaceItemInDay(dayNumber, relativeToItemId, newItem);
      } else if (relativeToItemId && (insertPosition === "before" || insertPosition === "after")) {
        success = await addItemToPosition(
          dayNumber,
          newItem,
          insertPosition,
          relativeToItemId
        );
      }

      if (success) {
        console.log("✅ Hotel añadido exitosamente");
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 300);
        }
      }
    } catch (error) {
      console.error("Error añadiendo hotel:", error);
    } finally {
      setIsAdding(false);
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
      {isAdding && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <p className="text-muted-700">Añadiendo hotel...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelsList;