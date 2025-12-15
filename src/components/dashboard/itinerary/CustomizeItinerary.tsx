"use client";
import React from "react";
import { useItinerary } from "@/contexts/ItineraryContext";
import ItemTypeSelector, { ItemType } from "./ItemTypeSelector";
import HotelsList from "./HotelsList";
import RestaurantsList from "./RestaurantsList";
import TouristSitesList from "@/components/dashboard/itinerary/TouristSitesList";
import FlightsList from "./FlightsList";

interface CustomizeItineraryProps {
  dayNumber: number;
  onClose?: () => void;
  insertPosition?: "before" | "after" | "end" | "replace";
  relativeToItemId?: string;
  itemTypeToReplace?: "flight" | "accommodation" | "food" | "tourist_site";
}

function CustomizeItinerary({
  dayNumber,
  onClose,
  insertPosition = "end",
  relativeToItemId,
  itemTypeToReplace,
}: CustomizeItineraryProps) {
  const [itemType, setItemType] = React.useState<ItemType | null>(null);

  const handleSuccess = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleBack = () => {
    setItemType(null);
  };

  const {
    availableHotels,
    availableRestaurants,
    availableTouristSites,
    availableFlights,
    refreshAvailableOptions,
    isLoading,
  } = useItinerary();

  React.useEffect(() => {
    if (insertPosition === "replace" && itemTypeToReplace && !itemType) {
      if (itemTypeToReplace === "accommodation") {
        setItemType("hotel");
      } else if (itemTypeToReplace === "food") {
        setItemType("restaurant");
      } else if (itemTypeToReplace === "tourist_site") {
        setItemType("tourism");
      } else if (itemTypeToReplace === "flight") {
        setItemType("flight");
      }
    }
  }, [insertPosition, itemTypeToReplace, itemType]);

  React.useEffect(() => {
    if (isLoading) return;

    const shouldRefresh =
      (itemType === "hotel" && availableHotels.length === 0) ||
      (itemType === "restaurant" && availableRestaurants.length === 0) ||
      (itemType === "tourism" && availableTouristSites.length === 0) ||
      (itemType === "flight" && availableFlights.length === 0);

    if (shouldRefresh) {
      refreshAvailableOptions();
    }
  }, [
    itemType,
    availableHotels.length,
    availableRestaurants.length,
    availableTouristSites.length,
    availableFlights.length,
    isLoading,
    refreshAvailableOptions,
    insertPosition, 
    itemTypeToReplace
  ]);

  if (itemType !== null) {
    return (
      <div className="p-2">
        {itemType === "hotel" && (
          <HotelsList
            dayNumber={dayNumber}
            onSuccess={handleSuccess}
            insertPosition={insertPosition}
            relativeToItemId={relativeToItemId}
          />
        )}
        {itemType === "restaurant" && (
          <RestaurantsList
            dayNumber={dayNumber}
            onSuccess={handleSuccess}
            insertPosition={insertPosition}
            relativeToItemId={relativeToItemId}
          />
        )}
        {itemType === "tourism" && (
          <TouristSitesList
            dayNumber={dayNumber}
            onSuccess={handleSuccess}
            insertPosition={insertPosition}
            relativeToItemId={relativeToItemId}
          />
        )}
        {itemType === "flight" && (
          <FlightsList
            dayNumber={dayNumber}
            onSuccess={handleSuccess}
            relativeToItemId={relativeToItemId}
          />
        )}
        <button
          className="third-btn w-full !py-3 mt-4"
          type="button"
          onClick={handleBack}
        >
          Back
        </button>
      </div>
    );
  }

  if (insertPosition === "replace" && itemTypeToReplace === "flight") {
    return (
      <div className="p-2">
        <FlightsList
          dayNumber={dayNumber}
          onSuccess={handleSuccess}
          relativeToItemId={relativeToItemId}
        />
        <button
          className="third-btn w-full !py-3 mt-4"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div>
      <ItemTypeSelector value={itemType} onChange={setItemType} />
    </div>
  );
}

export default CustomizeItinerary;