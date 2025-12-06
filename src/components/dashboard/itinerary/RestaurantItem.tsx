"use client";
import React from "react";
import { MdRestaurant } from "react-icons/md";
import { AiFillStar } from "react-icons/ai";
import ItemMenu from "./ItemMenu";
import { useItinerary } from "@/contexts/ItineraryContext";

interface FoodDetails {
  restaurantName: string;
  cuisine: string;
  priceLevel: number;
  rating: number;
}

interface Location {
  address: string;
}

interface RestaurantItemProps {
  itemId: string;
  dayNumber: number;
  title: string;
  foodDetails: FoodDetails;
  location: Location;
  isLast: boolean;
  isFirst: boolean;
}

const RestaurantItem: React.FC<RestaurantItemProps> = ({
  itemId,
  dayNumber,
  title,
  foodDetails,
  location,
  isLast,
  isFirst,
}) => {
  const { deleteItemFromDay, moveItemInDay } = useItinerary();

  const getPriceLabel = (priceLevel: number): string => {
    if (priceLevel <= 1) return "Precio bajo";
    if (priceLevel <= 2) return "Precio medio";
    if (priceLevel <= 3) return "Precio medio-alto";
    if (priceLevel <= 4) return "Precio alto";
    return "Precio muy alto";
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return Array.from({ length: fullStars }, (_, i) => (
      <AiFillStar key={i} className="text-primary" />
    ));
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
        itemType="food"
      />

      <div className="flex flex-col items-center">
        <div className="itinerary-icon-circle">
          <MdRestaurant className="text-secondary-100 text-2xl" />
        </div>
        <div className="itinerary-connector-line flex-1" />
      </div>

      <div className="flex-1 pb-10 pr-8">
        <h3 className="itinerary-item-title">{title}</h3>
        <p className="itinerary-item-subtitle mt-1">{location.address}</p>
        <div className="flex items-center gap-1 mt-1">
          {renderStars(foodDetails.rating)}
        </div>
        <p className="itinerary-item-price mt-1">
          {getPriceLabel(foodDetails.priceLevel)}
        </p>
      </div>
    </div>
  );
};

export default RestaurantItem;
