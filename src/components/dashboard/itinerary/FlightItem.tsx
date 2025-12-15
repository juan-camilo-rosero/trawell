"use client";
import React from "react";
import { MdFlight } from "react-icons/md";
import ItemMenu from "./ItemMenu";
import { useItinerary } from "@/contexts/ItineraryContext";

interface FlightDetails {
  carrierName: string;
  departureAirport: string;
  arrivalAirport: string;
  duration: string;
}

interface FlightItemProps {
  itemId: string;
  dayNumber: number;
  title: string;
  flightDetails: FlightDetails;
  price: number;
  isLast: boolean;
  isFirst: boolean;
}

const FlightItem: React.FC<FlightItemProps> = ({
  itemId,
  dayNumber,
  title,
  flightDetails,
  price,
  isLast,
  isFirst,
}) => {
  const { deleteItemFromDay, moveItemInDay } = useItinerary();

  const parseDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+)H(\d+)M/);
    if (match) {
      return `${match[1]}h ${match[2]}m`;
    }
    return duration;
  };

  const formatPrice = (price: number): string => {
    return `COP $${price.toLocaleString("es-CO")}`;
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
        itemType="flight"
      />
      <div className="flex flex-col items-center">
        <div className="itinerary-icon-circle">
          <MdFlight className="text-secondary-100 text-2xl" />
        </div>
        <div className="itinerary-connector-line flex-1" />
      </div>
      <div className="flex-1 pb-10 pr-8">
        <h3 className="itinerary-item-title">{title}</h3>
        <p className="itinerary-item-subtitle mt-1">
          {parseDuration(flightDetails.duration)} •{" "}
          {flightDetails.departureAirport} - {flightDetails.arrivalAirport}
        </p>
        <p className="itinerary-item-price mt-1">
          {formatPrice(price)} total
        </p>
      </div>
    </div>
  );
};

export default FlightItem;