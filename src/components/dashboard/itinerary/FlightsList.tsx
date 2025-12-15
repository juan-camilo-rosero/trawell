"use client";
import React, { useState } from "react";
import { useItinerary } from "@/contexts/ItineraryContext";
import ItemCard from "./ItemCard";
import { createFlightItemFromResponse } from "@/lib/helpers/item-creator.helper";

interface FlightsListProps {
  dayNumber: number;
  onSuccess?: () => void;
  relativeToItemId?: string;
}

function FlightsList({
  dayNumber,
  onSuccess,
  relativeToItemId,
}: FlightsListProps) {
  const { availableFlights, itinerary, replaceItemInDay } = useItinerary();
  const [isAdding, setIsAdding] = useState(false);

  const handleSelectFlight = async (flightIndex: number) => {
    if (!itinerary || isAdding || !relativeToItemId) return;
    setIsAdding(true);

    try {
      const flight = availableFlights[flightIndex];
      const day = itinerary.days.find((d) => d.dayNumber === dayNumber);
      if (!day) {
        console.error("Day not found");
        return;
      }

      const relativeItem = day.items.find(
        (item) => item.itemId === relativeToItemId
      );
      if (!relativeItem) {
        console.error("Item to replace not found");
        return;
      }

      const newTime = relativeItem.time;

      const totalTravelers =
        itinerary.searchParams.travelers.adults +
        (itinerary.searchParams.travelers.children || 0) +
        (itinerary.searchParams.travelers.babies || 0);

      const newItem = createFlightItemFromResponse(
        flight,
        0,
        newTime,
        totalTravelers
      );

      const success = await replaceItemInDay(dayNumber, relativeToItemId, newItem);

      if (success) {
        console.log("✅ Flight replaced successfully");
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 300);
        }
      }
    } catch (error) {
      console.error("Error replacing flight:", error);
    } finally {
      setIsAdding(false);
    }
  };

  if (availableFlights.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-500">
          No flights available. Generate an itinerary first.
        </p>
      </div>
    );
  }

  const parseDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+)H(\d+)M/);
    if (match) {
      return `${match[1]}h ${match[2]}m`;
    }
    return duration;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-muted-900 mb-4">
        Available Flights ({availableFlights.length})
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {availableFlights.map((flight, index) => {
          const outboundSegment = flight.outbound.segments[0];
          const totalStops = flight.outbound.segments.reduce(
            (sum, segment) => sum + segment.numberOfStops,
            0
          );

          const carrierName = outboundSegment.carrierName || outboundSegment.carrierCode;

          const details = [
            `${carrierName} - ${flight.origin.iataCode} → ${flight.destination.iataCode}`,
            `Duration: ${parseDuration(flight.outbound.duration)}`,
            `Stops: ${totalStops}`,
            `Departure: ${new Date(outboundSegment.departure.at).toLocaleString()}`,
          ];

          return (
            <ItemCard
              key={`${flight.id}-${index}`}
              title={`Flight ${carrierName}`}
              subtitle={`${flight.origin.name} - ${flight.destination.name}`}
              price={`${flight.price.currency} ${flight.price.total.toLocaleString()}`}
              details={details}
              onClick={() => handleSelectFlight(index)}
            />
          );
        })}
      </div>
      {isAdding && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <p className="text-muted-700">Replacing flight...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightsList;