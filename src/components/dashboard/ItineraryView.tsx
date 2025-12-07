"use client";
import React, { useState } from "react";
import { useItinerary } from "@/contexts/ItineraryContext";
import FlightItem from "./itinerary/FlightItem";
import HotelItem from "./itinerary/HotelItem";
import RestaurantItem from "./itinerary/RestaurantItem";
import TouristSiteItem from "./itinerary/TouristSiteItem";
import AddItem from "./itinerary/AddItem";
import type { IItineraryItem } from "@/models/itinerary/interfaces";
import MapView from "@/components/dashboard/MapView";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

interface ItineraryViewProps {
  destination: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  totalPassengers: number;
  coordinates:
    | {
        lat: number;
        lng: number;
      }
    | undefined;
}

function VariantDropdown({
  itinerary,
  variants,
  onGenerate,
  onSelect,
}: {
  itinerary: any;
  variants: any[];
  onGenerate: () => void;
  onSelect: (idx: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative text-right">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="py-1 px-3 border rounded bg-white text-sm"
      >
        Alternativas ▾
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow z-20 p-3">
          {variants && variants.length > 0 ? (
            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div
                  key={v._id || idx}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div className="text-sm">
                    <div className="font-medium">{v.title}</div>
                    <div className="text-muted-500 text-xs">
                      {v.days?.length || 0} días • {v.currency} {v.totalPrice}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        onSelect(idx);
                        setOpen(false);
                      }}
                      className="py-1 px-2 primary-btn"
                    >
                      Seleccionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onGenerate();
                  setOpen(false);
                }}
                className="py-2 px-3 primary-btn"
              >
                Generar 3 alternativas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ItineraryView({ coordinates }: ItineraryViewProps) {
  const {
    itinerary,
    isLoading,
    error,
    mapMarkers,
    generateItineraries,
    itineraryVariants,
    selectItineraryVariant,
  } = useItinerary();

  const router = useRouter();
  const { userData } = useUser();
  const { saveItinerary, isLoading: isSavingItinerary } = useItinerary();
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveItinerary = async () => {
    if (!userData?.firebaseUid) {
      setSaveError("Debes iniciar sesión para guardar el itinerario");
      return;
    }

    setSaveError(null);
    const success = await saveItinerary(userData.firebaseUid);

    if (success) {
      router.push("/dashboard/my-trips");
    } else {
      setSaveError("Error al guardar el itinerario. Intenta nuevamente.");
    }
  };

  const formatDateRange = (
    start: Date | string | undefined,
    end: Date | string | undefined
  ): string => {
    if (!start || !end) return "";

    const months = [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ];

    const startDate = new Date(start);
    const endDate = new Date(end);

    const startDay = startDate.getDate();
    const startMonth = months[startDate.getMonth()];
    const endDay = endDate.getDate();
    const endMonth = months[endDate.getMonth()];

    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  };

  const formatDayDate = (date: Date | string): string => {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const dayDate = new Date(date);
    const dayName = days[dayDate.getDay()];
    const day = dayDate.getDate();
    const month = months[dayDate.getMonth()];

    return `${dayName}, ${day} de ${month}`;
  };

  const renderItem = (
    item: IItineraryItem,
    dayNumber: number,
    itemIndex: number,
    totalItems: number
  ) => {
    const isFirst = itemIndex === 0;
    const isLast = itemIndex === totalItems - 1;

    switch (item.type) {
      case "flight":
        if (!item.flightDetails) return null;
        return (
          <FlightItem
            key={item.itemId}
            itemId={item.itemId}
            dayNumber={dayNumber}
            title={item.title}
            flightDetails={item.flightDetails}
            price={item.price}
            isLast={isLast}
            isFirst={isFirst}
          />
        );
      case "accommodation":
        return (
          <HotelItem
            key={item.itemId}
            itemId={item.itemId}
            dayNumber={dayNumber}
            title={item.title}
            accommodationDetails={item.accommodationDetails || {
              hotelId: "",
              hotelName: item.title || "Hotel",
              checkIn: new Date(),
              checkOut: new Date(),
              nights: 0,
              roomType: "Estándar",
            }}
            location={item.location}
            price={item.price}
            stars={4}
            isLast={isLast}
            isFirst={isFirst}
          />
        );
      case "food":
        if (!item.foodDetails) return null;
        return (
          <RestaurantItem
            key={item.itemId}
            itemId={item.itemId}
            dayNumber={dayNumber}
            title={item.title}
            foodDetails={item.foodDetails}
            location={item.location}
            isLast={isLast}
            isFirst={isFirst}
          />
        );
      case "tourist_site":
        if (!item.touristSiteDetails) return null;
        return (
          <TouristSiteItem
            key={item.itemId}
            itemId={item.itemId}
            dayNumber={dayNumber}
            title={item.title}
            description={item.description}
            touristSiteDetails={item.touristSiteDetails}
            location={item.location}
            price={item.price}
            isLast={isLast}
            isFirst={isFirst}
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
          <p className="text-muted-500 text-lg">Cargando</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="text-4xl">❌</div>
          <p className="text-red-500 font-semibold">
            Error al generar el itinerario
          </p>
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
            src="static/trawell_ilustracion3.png"
            alt="Trawell illustration"
            className="w-48 h-48 object-contain opacity-50"
          />
          <p className="text-muted-500 text-lg">No hay itinerario disponible</p>
          <p className="text-muted-400 text-sm">
            Completa el formulario para generar tu itinerario
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full lg:h-[calc(100vh-6rem)] lg:overflow-y-auto flex flex-col gap-4">
      <div className="bg-white rounded-lg p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{itinerary.title}</h2>
          <div className="relative">
            <VariantDropdown
              itinerary={itinerary}
              variants={itineraryVariants}
              onGenerate={() => {
                const params = {
                  originCityName: itinerary.searchParams.originCity.name,
                  originCoordinates: itinerary.searchParams.originCity.coordinates,
                  originPlaceId: itinerary.searchParams.originCity.placeId,
                  destinationCityName: itinerary.searchParams.destinationCity.name,
                  destinationCoordinates: itinerary.searchParams.destinationCity.coordinates,
                  destinationPlaceId: itinerary.searchParams.destinationCity.placeId,
                  departureDate: new Date(itinerary.searchParams.departureDate),
                  returnDate: new Date(itinerary.searchParams.returnDate),
                  adults: itinerary.searchParams.travelers.adults,
                  children: itinerary.searchParams.travelers.children || 0,
                  babies: itinerary.searchParams.travelers.babies || 0,
                  travelType: itinerary.searchParams.travelType,
                  foodPreferences: ["all" as any],
                  currency: itinerary.currency,
                };

                generateItineraries(params as any, 3);
              }}
              onSelect={(idx: number) => selectItineraryVariant(idx)}
            />
          </div>
        </div>

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
              (itinerary.searchParams.travelers.children || 0) +
              (itinerary.searchParams.travelers.babies || 0)}{" "}
            personas
          </span>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-700">
              Precio Total
            </span>
            <span className="text-lg font-bold text-primary-700">
              {itinerary.currency} {itinerary.totalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="lg:hidden w-full h-[50vh] rounded-lg overflow-hidden">
        <MapView markers={mapMarkers} center={coordinates} />
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
                  renderItem(item, day.dayNumber, itemIndex, day.items.length)
                )}
                <AddItem dayNumber={day.dayNumber} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary-100 shadow-md custom-ph py-4 z-10">
        {saveError && (
          <p className="text-red-500 text-sm mb-2 text-center">{saveError}</p>
        )}
        <button
          onClick={handleSaveItinerary}
          disabled={isSavingItinerary}
          className="w-full primary-btn py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSavingItinerary ? "Guardando..." : "Guardar itinerario"}
        </button>
      </div>
    </div>
  );
}

export default ItineraryView;
