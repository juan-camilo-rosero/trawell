// @/components/dashboard/ItineraryView.tsx

'use client'
import React from 'react';
import { useItinerary } from '@/contexts/ItineraryContext';
import FlightItem from './itinerary/FlightItem';
import HotelItem from './itinerary/HotelItem';
import RestaurantItem from './itinerary/RestaurantItem';
import TouristSiteItem from './itinerary/TouristSiteItem';
import type { IItineraryItem } from '@/models/itinerary/interfaces';

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

function ItineraryView({ coordinates }: ItineraryViewProps) {
  const { itinerary, isLoading, error } = useItinerary();

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
    
    const dayDate = new Date(date);
    const dayName = days[dayDate.getDay()];
    const day = dayDate.getDate();
    const month = months[dayDate.getMonth()];
    
    return `${dayName}, ${day} de ${month}`;
  };

  const getMapUrl = () => {
    if (!coordinates) return '';
    return `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  const renderItem = (item: IItineraryItem, isLast: boolean) => {
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
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-muted-500 text-lg">Generando tu itinerario perfecto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="text-4xl">❌</div>
          <p className="text-red-500 font-semibold">Error al generar el itinerario</p>
          <p className="text-muted-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="https://images.fineartamerica.com/images/artworkimages/medium/3/snoopy-pilot-airplane-elizabeth-j-campbell-transparent.png"
            alt="Snoopy Pilot"
            className="w-48 h-48 object-contain opacity-50"
          />
          <p className="text-muted-500 text-lg">No hay itinerario disponible</p>
          <p className="text-muted-400 text-sm">Completa el formulario para generar tu itinerario</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full lg:h-[calc(100vh-6rem)] lg:overflow-y-auto flex flex-col gap-4">
      <div className="bg-white rounded-lg p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">{itinerary.title}</h2>
        
        <div className="bg-secondary-100 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-600">
            {formatDateRange(
              itinerary.searchParams.departureDate, 
              itinerary.searchParams.returnDate
            )}
          </span>
          <div className="w-px h-6 bg-muted-500 rounded-full"></div>
          <span className="text-sm text-muted-600">
            {itinerary.searchParams.travelers.adults + 
             itinerary.searchParams.travelers.children + 
             itinerary.searchParams.travelers.babies} personas
          </span>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-700">Precio Total</span>
            <span className="text-lg font-bold text-primary-700">
              {itinerary.currency} {itinerary.totalPrice.toLocaleString()}
            </span>
          </div>
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

      {itinerary.days && itinerary.days.length > 0 && (
        <div className="bg-white rounded-lg p-6 flex flex-col gap-4">
          {itinerary.days.map((day, dayIndex) => (
            <div key={day._id?.toString() || `day-${dayIndex}`}>
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