"use client";
import React from "react";
import ItemTypeSelector, { ItemType } from "./ItemTypeSelector";
import HotelsList from "./HotelsList";
import RestaurantsList from "./RestaurantsList";
import TouristSitesList from "@/components/dashboard/itinerary/TouristSitesList";

interface CustomizeItineraryProps {
  dayNumber: number;
  onClose?: () => void;
}

function CustomizeItinerary({ dayNumber, onClose }: CustomizeItineraryProps) {
  const [itemType, setItemType] = React.useState<ItemType | null>(null);

  const handleSuccess = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleBack = () => {
    setItemType(null);
  };

  if (itemType !== null) {
    return (
      <div className="p-2">
        {itemType === "hotel" && (
          <HotelsList dayNumber={dayNumber} onSuccess={handleSuccess} />
        )}
        {itemType === "restaurant" && (
          <RestaurantsList dayNumber={dayNumber} onSuccess={handleSuccess} />
        )}
        {itemType === "tourism" && (
          <TouristSitesList dayNumber={dayNumber} onSuccess={handleSuccess} />
        )}

        <button
          className="third-btn w-full !py-3 mt-4"
          type="button"
          onClick={handleBack}
        >
          Volver
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