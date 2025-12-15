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
    // Manejo robusto de duración ISO 8601 (e.g., PT2H, PT2H30M, PT45M)
    const hoursMatch = duration.match(/(\d+)H/);
    const minutesMatch = duration.match(/(\d+)M/);

    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

    if (hours === 0 && minutes === 0) return duration;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(" ");
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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