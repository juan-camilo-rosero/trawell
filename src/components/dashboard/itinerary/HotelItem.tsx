'use client'
import React from 'react';
import { RiHotelBedFill } from 'react-icons/ri';
import { AiFillStar } from 'react-icons/ai';

interface AccommodationDetails {
  hotelName: string;
  roomType: string;
}

interface Location {
  address: string;
}

interface HotelItemProps {
  title: string;
  accommodationDetails: AccommodationDetails;
  location: Location;
  price: number;
  stars?: number;
  isLast: boolean;
}

const HotelItem: React.FC<HotelItemProps> = ({ 
  title, 
  location, 
  price, 
  stars = 4,
  isLast 
}) => {
  const formatPrice = (price: number): string => {
    return `COP $${price.toLocaleString('es-CO')}`;
  };

  const renderStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <AiFillStar key={i} className="text-primary" />
    ));
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="itinerary-icon-circle">
          <RiHotelBedFill className="text-secondary-100 text-2xl" />
        </div>
        {!isLast && <div className="itinerary-connector-line flex-1" />}
      </div>
      
      <div className="flex-1 pb-10">
        <h3 className="itinerary-item-title">{title}</h3>
        <div className="flex items-center gap-1 mt-1">
          {renderStars(stars)}
        </div>
        <p className="itinerary-item-subtitle mt-1">{location.address}</p>
        <p className="itinerary-item-price mt-1">{formatPrice(price)}</p>
      </div>
    </div>
  );
};

export default HotelItem;