import {
  IItineraryItem,
  IAccommodationDetails,
  IFoodDetails,
  ITouristSiteDetails,
} from "@/models/itinerary/interfaces";
import {
  HotelResponse,
  RestaurantResponse,
  TouristSiteResponse,
} from "@/models/types";
import { convertToCOP } from "./currency.helpers";
import { estimateMealPrice, estimateVisitDuration } from "./itinerary.helpers";

function generateObjectId(): any {
  const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
  const objectId =
    timestamp +
    "xxxxxxxxxxxxxxxx"
      .replace(/[x]/g, () => {
        return ((Math.random() * 16) | 0).toString(16);
      })
      .toLowerCase();

  return { toString: () => objectId, _bsontype: "ObjectId" };
}

export function createHotelItemFromResponse(
  hotel: HotelResponse,
  order: number,
  time: string,
  checkIn: Date,
  checkOut: Date,
  totalTravelers: number,
  dayNumber?: number
): IItineraryItem {
  const calculateNights = (checkIn: Date, checkOut: Date): number => {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights(checkIn, checkOut);
  const totalPriceInCOP = convertToCOP(hotel.price.total, hotel.price.currency);
  const pricePerNight = totalPriceInCOP / nights;

  const accommodationDetails: IAccommodationDetails = {
    hotelId: hotel.hotelId,
    hotelName: hotel.name,
    checkIn,
    checkOut,
    nights,
    roomType: hotel.roomDetails?.type || "Habitación Estándar",
  };

  const title = `Noche ${dayNumber || ""} en ${hotel.name}`.trim();
  const description =
    hotel.roomDetails?.description?.text ||
    "Hotel con excelentes comodidades";

  return {
    _id: generateObjectId(),
    itemId: `accommodation-custom-${Date.now()}`,
    type: "accommodation",
    order,
    time,
    title,
    description,
    price: Math.round(pricePerNight),
    location: {
      name: hotel.name,
      address: hotel.address || hotel.name,
      coordinates: hotel.coordinates,
      placeId: undefined,
    },
    accommodationDetails,
  };
}

export function createRestaurantItemFromResponse(
  restaurant: RestaurantResponse,
  mealType: "desayuno" | "almuerzo" | "cena",
  order: number,
  time: string,
  totalTravelers: number
): IItineraryItem {
  const estimatedPrice = estimateMealPrice(
    restaurant.priceLevel || 2,
    totalTravelers
  );

  const foodDetails: IFoodDetails = {
    restaurantName: restaurant.name,
    cuisine: restaurant.cuisine?.join(", ") || restaurant.category,
    mealType,
    priceLevel: restaurant.priceLevel || 2,
    rating: restaurant.rating || 4.0,
    userRatingsTotal: restaurant.userRatingsTotal || 0,
    openingHours: restaurant.openingHours,
  };

  const mealTitles = {
    desayuno: "Desayuno",
    almuerzo: "Almuerzo",
    cena: "Cena",
  };

  return {
    _id: generateObjectId(),
    itemId: `food-custom-${Date.now()}`,
    type: "food",
    order,
    time,
    title: `${mealTitles[mealType]} en ${restaurant.name}`,
    description:
      restaurant.editorialSummary ||
      `${foodDetails.cuisine} - ${restaurant.category}`,
    price: estimatedPrice,
    location: {
      name: restaurant.name,
      address: restaurant.address,
      coordinates: restaurant.coordinates,
      placeId: restaurant.placeId,
    },
    foodDetails,
  };
}

export function createTouristSiteItemFromResponse(
  site: TouristSiteResponse,
  order: number,
  time: string,
  totalTravelers: number
): IItineraryItem {
  const entryFee = site.priceLevel
    ? site.priceLevel * 20000 * totalTravelers
    : 0;

  const touristSiteDetails: ITouristSiteDetails = {
    siteName: site.name,
    category: site.category,
    types: site.types,
    rating: site.rating,
    userRatingsTotal: site.userRatingsTotal,
    entryFee,
    hasFee: entryFee > 0,
    estimatedDuration: `${Math.floor(
      estimateVisitDuration(site.category) / 60
    )} horas`,
    openingHours: site.openingHours,
    photos: site.photos,
  };

  return {
    _id: generateObjectId(),
    itemId: `tourist-custom-${Date.now()}`,
    type: "tourist_site",
    order,
    time,
    title: site.name,
    description:
      site.editorialSummary || `${site.category} - ${site.types.join(", ")}`,
    price: entryFee,
    location: {
      name: site.name,
      address: site.address,
      coordinates: site.coordinates,
      placeId: site.placeId,
    },
    touristSiteDetails,
  };
}