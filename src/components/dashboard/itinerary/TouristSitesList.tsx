"use client";
import React, { useState } from "react";
import { useItinerary } from "@/contexts/ItineraryContext";
import ItemCard from "./ItemCard";
import { createTouristSiteItemFromResponse } from "@/lib/helpers/item-creator.helper";
import { addMinutesToTime } from "@/lib/helpers/itinerary.helpers";

interface TouristSitesListProps {
  dayNumber: number;
  onSuccess?: () => void;
  insertPosition?: "before" | "after" | "end" | "replace";
  relativeToItemId?: string;
}

function TouristSitesList({
  dayNumber,
  onSuccess,
  insertPosition = "end",
  relativeToItemId,
}: TouristSitesListProps) {
  const { availableTouristSites, itinerary, addItemToDay, addItemToPosition, replaceItemInDay } =
    useItinerary();
  const [isAdding, setIsAdding] = useState(false);

  const handleSelectSite = async (siteIndex: number) => {
    if (!itinerary || isAdding) return;
    setIsAdding(true);

    try {
      const site = availableTouristSites[siteIndex];
      const day = itinerary.days.find((d) => d.dayNumber === dayNumber);
      if (!day) {
        console.error("Día no encontrado");
        return;
      }

      let newTime = "09:00";

      if (insertPosition === "end") {
        const lastItem = day.items[day.items.length - 1];
        newTime = lastItem ? addMinutesToTime(lastItem.time, 30) : "09:00";
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

      const newItem = createTouristSiteItemFromResponse(
        site,
        0,
        newTime,
        totalTravelers
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
        console.log("✅ Sitio turístico añadido exitosamente");
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 300);
        }
      }
    } catch (error) {
      console.error("Error añadiendo sitio turístico:", error);
    } finally {
      setIsAdding(false);
    }
  };

  if (availableTouristSites.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-500">
          No hay sitios turísticos disponibles. Genera un itinerario primero.
        </p>
      </div>
    );
  }

  const getCategoryText = (category: string) => {
    const categories: Record<string, string> = {
      museum: "Museo",
      park: "Parque",
      monument: "Monumento",
      historical: "Histórico",
    };
    return categories[category] || category;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-muted-900 mb-4">
        Sitios turísticos disponibles ({availableTouristSites.length})
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {availableTouristSites.map((site, index) => {
          const entryFee = site.priceLevel ? site.priceLevel * 20000 : 0;
          const details = [
            `Categoría: ${getCategoryText(site.category)}`,
            entryFee > 0
              ? `Entrada: COP ${entryFee.toLocaleString()}`
              : "Entrada gratuita",
          ];
          if (site.openingHours?.openNow !== undefined) {
            details.push(
              site.openingHours.openNow ? "🟢 Abierto ahora" : "🔴 Cerrado"
            );
          }

          return (
            <ItemCard
              key={site.placeId}
              title={site.name}
              subtitle={site.address}
              rating={site.rating}
              details={details}
              onClick={() => handleSelectSite(index)}
            />
          );
        })}
      </div>
      {isAdding && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <p className="text-muted-700">Añadiendo sitio turístico...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TouristSitesList;