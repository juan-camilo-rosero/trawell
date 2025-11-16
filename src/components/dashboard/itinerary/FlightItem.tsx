'use client'
import React from 'react';
import { MdFlight } from 'react-icons/md';

interface FlightDetails {
  carrierName: string;
  departureAirport: string;
  arrivalAirport: string;
  duration: string;
}

interface FlightItemProps {
  title: string;
  flightDetails: FlightDetails;
  price: number;
  isLast: boolean;
}

const FlightItem: React.FC<FlightItemProps> = ({ title, flightDetails, price, isLast }) => {
  const parseDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+)H(\d+)M/);
    if (match) {
      return `${match[1]}h ${match[2]}m`;
    }
    return duration;
  };

  const formatPrice = (price: number): string => {
    return `COP $${price.toLocaleString('es-CO')}`;
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="itinerary-icon-circle">
          <MdFlight className="text-secondary-100 text-2xl" />
        </div>
        {!isLast && <div className="itinerary-connector-line flex-1" />}
      </div>
      
      <div className="flex-1 pb-10">
        <h3 className="itinerary-item-title">{title}</h3>
        <p className="itinerary-item-subtitle mt-1">
          {parseDuration(flightDetails.duration)} • {flightDetails.departureAirport} - {flightDetails.arrivalAirport}
        </p>
        <p className="itinerary-item-price mt-1">{formatPrice(price)} en total</p>
      </div>
    </div>
  );
};

export default FlightItem;