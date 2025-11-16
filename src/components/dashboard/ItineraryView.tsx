'use client'
import React from 'react';
import { useMockItinerary } from '@/contexts/MockItineraryContext';
import FlightItem from './itinerary/FlightItem';
import HotelItem from './itinerary/HotelItem';
import RestaurantItem from './itinerary/RestaurantItem';
import TouristSiteItem from './itinerary/TouristSiteItem';
import type { ItineraryItem } from '@/contexts/MockItineraryContext';

interface ItineraryViewProps {
  destination: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  totalPassengers: number;
  coordinates: {
    lat: number;
    lng: number;
  } | undefined;
}

function ItineraryView({ destination, startDate, endDate, totalPassengers, coordinates }: ItineraryViewProps) {
  const { mockItinerary, isLoading } = useMockItinerary();

  const tite = "tite"
  console.log(tite)

  const formatDateRange = (start: Date | undefined, end: Date | undefined): string => {
    if (!start || !end) return '';
    
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    const startDay = start.getDate();
    const startMonth = months[start.getMonth()];
    const endDay = end.getDate();
    const endMonth = months[end.getMonth()];
    
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  };

  const formatDayDate = (date: Date): string => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${dayName}, ${day} de ${month}`;
  };

  const getMapUrl = () => {
    if (!coordinates) return '';
    return `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  const renderItem = (item: ItineraryItem, isLast: boolean) => {
    switch (item.type) {
      case 'flight':
        if (!item.flightDetails) return null;
        return (
          <FlightItem
            key={item.itemId}
            title={item.title}
            flightDetails={item.flightDetails}
            price={item.price}
            isLast={isLast}
          />
        );
      case 'accommodation':
        if (!item.accommodationDetails) return null;
        return (
          <HotelItem
            key={item.itemId}
            title={item.title}
            accommodationDetails={item.accommodationDetails}
            location={item.location}
            price={item.price}
            stars={4}
            isLast={isLast}
          />
        );
      case 'food':
        if (!item.foodDetails) return null;
        return (
          <RestaurantItem
            key={item.itemId}
            title={item.title}
            foodDetails={item.foodDetails}
            location={item.location}
            isLast={isLast}
          />
        );
      case 'tourist_site':
        if (!item.touristSiteDetails) return null;
        return (
          <TouristSiteItem
            key={item.itemId}
            title={item.title}
            description={item.description}
            touristSiteDetails={item.touristSiteDetails}
            location={item.location}
            price={item.price}
            isLast={isLast}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-500">Cargando itinerario...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full lg:h-[calc(100vh-6rem)] lg:overflow-y-auto flex flex-col gap-4">
      <div className="bg-white rounded-lg p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Viaje a {destination}</h2>
        
        <div className="bg-secondary-100 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-600">{formatDateRange(startDate, endDate)}</span>
          <div className="w-px h-6 bg-muted-500 rounded-full"></div>
          <span className="text-sm text-muted-600">{totalPassengers} {totalPassengers === 1 ? 'persona' : 'personas'}</span>
        </div>
      </div>

      <div className="lg:hidden w-full h-[50vh] rounded-lg overflow-hidden">
        {coordinates && (
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={getMapUrl()}
          />
        )}
      </div>

      {mockItinerary && (
        <div className="bg-white rounded-lg p-6 flex flex-col gap-4">
          {mockItinerary.days.map((day, dayIndex) => (
            <div key={day._id || dayIndex}>
              {dayIndex > 0 && <div className="mb-2" />}
              
              <div className="itinerary-day-separator mb-4">
                {formatDayDate(day.date)}
              </div>

              <div className="flex flex-col">
                {day.items.map((item, itemIndex) => 
                  renderItem(item, itemIndex === day.items.length - 1)
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ItineraryView;