"use client";
import React from "react";
import { RiHotelBedFill } from "react-icons/ri";
import { AiFillStar } from "react-icons/ai";
import ItemMenu from "./ItemMenu";
import { useItinerary } from "@/contexts/ItineraryContext";

interface AccommodationDetails {
  hotelName: string;
  roomType: string;
}

interface Location {
  address: string;
}

interface HotelItemProps {
  itemId: string;
  dayNumber: number;
  title: string;
  accommodationDetails: AccommodationDetails;
  location: Location;
  price: number;
  stars?: number;
  isLast: boolean;
  isFirst: boolean;
}

const HotelItem: React.FC<HotelItemProps> = ({
  itemId,
  dayNumber,
  title,
  location,
  price,
  stars = 4,
  isLast,
  isFirst,
}) => {
  const { deleteItemFromDay, moveItemInDay } = useItinerary();

  const formatPrice = (price: number): string => {
    return `COP $${price.toLocaleString("es-CO")}`;
  };

  const renderStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
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
        itemType="accommodation"
      />

      <div className="flex flex-col items-center">
        <div className="itinerary-icon-circle">
          <RiHotelBedFill className="text-secondary-100 text-2xl" />
        </div>
        <div className="itinerary-connector-line flex-1" />
      </div>

      <div className="flex-1 pb-10 pr-8">
        <h3 className="itinerary-item-title">{title}</h3>
        <div className="flex items-center gap-1 mt-1">{renderStars(stars)}</div>
        <p className="itinerary-item-subtitle mt-1">{location.address}</p>
        <p className="itinerary-item-price mt-1">{formatPrice(price)}</p>
      </div>
    </div>
  );
};

export default HotelItem;
