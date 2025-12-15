"use client";
import React from "react";
import { FaLandmark, FaMonument, FaTree, FaUniversity } from "react-icons/fa";
import { MdPlace } from "react-icons/md";
import ItemMenu from "./ItemMenu";
import { useItinerary } from "@/contexts/ItineraryContext";

interface TouristSiteDetails {
  siteName: string;
  category?: "museum" | "park" | "monument" | "historical";
}

interface Location {
  address: string;
}

interface TouristSiteItemProps {
  itemId: string;
  dayNumber: number;
  title: string;
  description: string;
  touristSiteDetails: TouristSiteDetails;
  location: Location;
  price: number;
  isLast: boolean;
  isFirst: boolean;
}

const TouristSiteItem: React.FC<TouristSiteItemProps> = ({
  itemId,
  dayNumber,
  title,
  description,
  touristSiteDetails,
  location,
  price,
  isLast,
  isFirst,
}) => {
  const { deleteItemFromDay, moveItemInDay } = useItinerary();

  const formatPrice = (price: number): string => {
    if (price === 0) return "Free entry";
    return `COP $${price.toLocaleString("es-CO")}`;
  };

  const getCategoryIcon = () => {
    const iconProps = {
      className: "text-secondary-100 text-2xl",
    };
    switch (touristSiteDetails.category) {
      case "museum":
        return <FaUniversity {...iconProps} />;
      case "park":
        return <FaTree {...iconProps} />;
      case "monument":
        return <FaMonument {...iconProps} />;
      case "historical":
        return <FaLandmark {...iconProps} />;
      default:
        return <MdPlace {...iconProps} />;
    }
  };

  const handleDelete = async () => {
    await deleteItemFromDay(dayNumber, itemId);
  };

  const handleMoveUp = async () => {
    await moveItemInDay(dayNumber, itemId, "up");
  };

  const handleMoveDown = async () => {
    await moveItemInDay(dayNumber, itemId, "down");
  };

  return (
    <div className="flex gap-4 relative">
      <ItemMenu
        itemId={itemId}
        dayNumber={dayNumber}
        isFirst={isFirst}
        isLast={isLast}
        onDelete={handleDelete}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onAddBefore={() => {}}
        onAddAfter={() => {}}
        onReplace={() => {}}
        itemType="tourist_site"
      />
      <div className="flex flex-col items-center">
        <div className="itinerary-icon-circle">{getCategoryIcon()}</div>
        <div className="itinerary-connector-line flex-1" />
      </div>
      <div className="flex-1 pb-10 pr-8">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="itinerary-item-title">{title}</h3>
        </div>
        <p className="itinerary-item-subtitle mt-1">{description}</p>
        <p className="itinerary-item-subtitle mt-1">{location.address}</p>
        <p className="itinerary-item-price mt-1">{formatPrice(price)}</p>
      </div>
    </div>
  );
};

export default TouristSiteItem;