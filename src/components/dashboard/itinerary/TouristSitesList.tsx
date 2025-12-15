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
        console.error("Day not found");
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
        console.log("✅ Tourist site added successfully");
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 300);
        }
      }
    } catch (error) {
      console.error("Error adding tourist site:", error);
    } finally {
      setIsAdding(false);
    }
  };

  if (availableTouristSites.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-500">
          No tourist sites available. Generate an itinerary first.
        </p>
      </div>
    );
  }

  const getCategoryText = (category: string) => {
    const categories: Record<string, string> = {
      museum: "Museum",
      park: "Park",
      monument: "Monument",
      historical: "Historical",
    };
    return categories[category] || category;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-muted-900 mb-4">
        Available Tourist Sites ({availableTouristSites.length})
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {availableTouristSites.map((site, index) => {
          const entryFee = site.priceLevel ? site.priceLevel * 20000 : 0;
          const details = [
            `Categoría: ${getCategoryText(site.category)}`,
            entryFee > 0
              ? `Entry fee: COP ${entryFee.toLocaleString()}`
              : "Free entry",
          ];
          if (site.openingHours?.openNow !== undefined) {
            details.push(
              site.openingHours.openNow ? "🟢 Open now" : "🔴 Closed"
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
            <p className="text-muted-700">Adding tourist site...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TouristSitesList;