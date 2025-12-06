"use client";
import React, { useState } from "react";
import { useItinerary } from "@/contexts/ItineraryContext";
import ItemCard from "./ItemCard";
import { createRestaurantItemFromResponse } from "@/lib/helpers/item-creator.helper";
import { addMinutesToTime } from "@/lib/helpers/itinerary.helpers";

interface RestaurantsListProps {
  dayNumber: number;
  onSuccess?: () => void;
  insertPosition?: "before" | "after" | "end";
  relativeToItemId?: string;
}

function RestaurantsList({
  dayNumber,
  onSuccess,
  insertPosition = "end",
  relativeToItemId,
}: RestaurantsListProps) {
  const { availableRestaurants, itinerary, addItemToDay, addItemToPosition } =
    useItinerary();
  const [isAdding, setIsAdding] = useState(false);

  const handleSelectRestaurant = async (restaurantIndex: number) => {
    if (!itinerary || isAdding) return;
    setIsAdding(true);

    try {
      const restaurant = availableRestaurants[restaurantIndex];
      const day = itinerary.days.find((d) => d.dayNumber === dayNumber);
      if (!day) {
        console.error("Día no encontrado");
        return;
      }

      let newTime = "12:00";

      if (insertPosition === "end") {
        const lastItem = day.items[day.items.length - 1];
        newTime = lastItem ? addMinutesToTime(lastItem.time, 30) : "12:00";
      } else if (relativeToItemId) {
        const relativeItem = day.items.find(
          (item) => item.itemId === relativeToItemId
        );
        if (relativeItem) {
          if (insertPosition === "before") {
            newTime = addMinutesToTime(relativeItem.time, -30);
          } else {
            newTime = addMinutesToTime(relativeItem.time, 30);
          }
        }
      }

      const totalTravelers =
        itinerary.searchParams.travelers.adults +
        (itinerary.searchParams.travelers.children || 0) +
        (itinerary.searchParams.travelers.babies || 0);

      const hour = parseInt(newTime.split(":")[0]);
      let mealType: "desayuno" | "almuerzo" | "cena" = "almuerzo";
      if (hour < 11) mealType = "desayuno";
      else if (hour >= 18) mealType = "cena";

      const newItem = createRestaurantItemFromResponse(
        restaurant,
        mealType,
        0,
        newTime,
        totalTravelers
      );

      let success = false;

      if (insertPosition === "end") {
        success = await addItemToDay(dayNumber, newItem);
      } else if (relativeToItemId) {
        success = await addItemToPosition(
          dayNumber,
          newItem,
          insertPosition,
          relativeToItemId
        );
      }

      if (success) {
        console.log("✅ Restaurante añadido exitosamente");
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 300);
        }
      }
    } catch (error) {
      console.error("Error añadiendo restaurante:", error);
    } finally {
      setIsAdding(false);
    }
  };

  if (availableRestaurants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-500">
          No hay restaurantes disponibles. Genera un itinerario primero.
        </p>
      </div>
    );
  }

  const getPriceLevelText = (level?: number) => {
    if (!level) return "Precio moderado";
    const levels = [
      "Gratis",
      "Económico",
      "Moderado",
      "Costoso",
      "Muy costoso",
    ];
    return levels[level] || "Precio moderado";
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-muted-900 mb-4">
        Restaurantes disponibles ({availableRestaurants.length})
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {availableRestaurants.map((restaurant, index) => {
          const details = [
            restaurant.cuisine?.join(", ") || restaurant.category,
            getPriceLevelText(restaurant.priceLevel),
          ];
          if (restaurant.openingHours?.openNow !== undefined) {
            details.push(
              restaurant.openingHours.openNow
                ? "🟢 Abierto ahora"
                : "🔴 Cerrado"
            );
          }

          return (
            <ItemCard
              key={restaurant.placeId}
              title={restaurant.name}
              subtitle={restaurant.address}
              rating={restaurant.rating}
              details={details}
              onClick={() => handleSelectRestaurant(index)}
            />
          );
        })}
      </div>
      {isAdding && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <p className="text-muted-700">Añadiendo restaurante...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantsList;