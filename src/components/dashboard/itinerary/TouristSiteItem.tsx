'use client'
import React from 'react';
import { MdPlace } from 'react-icons/md';

interface TouristSiteDetails {
  siteName: string;
}

interface Location {
  address: string;
}

interface TouristSiteItemProps {
  title: string;
  description: string;
  touristSiteDetails: TouristSiteDetails;
  location: Location;
  price: number;
  isLast: boolean;
}

const TouristSiteItem: React.FC<TouristSiteItemProps> = ({ 
  title, 
  description,
  location, 
  price, 
  isLast 
}) => {
  const formatPrice = (price: number): string => {
    if (price === 0) return 'Entrada gratuita';
    return `COP $${price.toLocaleString('es-CO')}`;
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="itinerary-icon-circle">
          <MdPlace className="text-secondary-100 text-2xl" />
        </div>
        {!isLast && <div className="itinerary-connector-line flex-1" />}
      </div>
      
      <div className="flex-1 pb-10">
        <h3 className="itinerary-item-title">{title}</h3>
        <p className="itinerary-item-subtitle mt-1">{description}</p>
        <p className="itinerary-item-subtitle mt-1">{location.address}</p>
        <p className="itinerary-item-price mt-1">{formatPrice(price)}</p>
      </div>
    </div>
  );
};

export default TouristSiteItem;