"use client";
import React from "react";
import { useItinerary } from "@/contexts/ItineraryContext";
import ItemCard from "./ItemCard";
import { createRestaurantItemFromResponse } from "@/lib/helpers/item-creator.helper";
import { addMinutesToTime } from "@/lib/helpers/itinerary.helpers";

interface RestaurantsListProps {
  dayNumber: number;
  onSuccess?: () => void;
}

function RestaurantsList({ dayNumber, onSuccess }: RestaurantsListProps) {
  const { availableRestaurants, itinerary, addItemToDay } = useItinerary();

  const handleSelectRestaurant = async (restaurantIndex: number) => {
    if (!itinerary) return;

    const restaurant = availableRestaurants[restaurantIndex];
    const day = itinerary.days.find((d) => d.dayNumber === dayNumber);

    if (!day) return;

    const lastItem = day.items[day.items.length - 1];
    const newTime = lastItem ? addMinutesToTime(lastItem.time, 30) : "12:00";

    const totalTravelers =
      itinerary.searchParams.travelers.adults +
      (itinerary.searchParams.travelers.children || 0) +
      (itinerary.searchParams.travelers.babies || 0);

    // Determinar tipo de comida basado en la hora
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

    const success = await addItemToDay(dayNumber, newItem);

    if (success && onSuccess) {
      onSuccess();
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
    const levels = ["Gratis", "Económico", "Moderado", "Costoso", "Muy costoso"];
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
              restaurant.openingHours.openNow ? "🟢 Abierto ahora" : "🔴 Cerrado"
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
    </div>
  );
}

export default RestaurantsList;