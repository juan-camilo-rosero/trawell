"use client";
import React from "react";
import { useItinerary } from "@/contexts/ItineraryContext";
import ItemCard from "./ItemCard";
import { createTouristSiteItemFromResponse } from "@/lib/helpers/item-creator.helper";
import { addMinutesToTime } from "@/lib/helpers/itinerary.helpers";

interface TouristSitesListProps {
  dayNumber: number;
  onSuccess?: () => void;
}

function TouristSitesList({ dayNumber, onSuccess }: TouristSitesListProps) {
  const { availableTouristSites, itinerary, addItemToDay } = useItinerary();

  const handleSelectSite = async (siteIndex: number) => {
    if (!itinerary) return;

    const site = availableTouristSites[siteIndex];
    const day = itinerary.days.find((d) => d.dayNumber === dayNumber);

    if (!day) return;

    const lastItem = day.items[day.items.length - 1];
    const newTime = lastItem ? addMinutesToTime(lastItem.time, 30) : "09:00";

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

    const success = await addItemToDay(dayNumber, newItem);

    if (success && onSuccess) {
      onSuccess();
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
    </div>
  );
}

export default TouristSitesList;