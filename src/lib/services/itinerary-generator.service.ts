import { convertToCOP } from "@/lib/helpers/currency.helpers";

import {
  FlightResponse,
  HotelResponse,
  RestaurantResponse,
  TouristSiteResponse,
} from "@/models/types";
import {
  IItineraryItem,
  IDay,
  ISearchParams,
  IFlightDetails,
  IAccommodationDetails,
  IFoodDetails,
  ITouristSiteDetails,
} from "@/models/itinerary/interfaces";
import {
  addMinutesToTime,
  timeToMinutes,
  getActivitiesPerDayForTripType,
  calculateAPILimits,
  estimateMealPrice,
  estimateVisitDuration,
  groupByProximity,
} from "@/lib/helpers/itinerary.helpers";
import { Types } from "mongoose";

import {
  GenerateItineraryRequest,
  APILimits,
} from "./itinerary-generator/interfaces";
import { APISearchService } from "./itinerary-generator/api.service";
import { SelectorService } from "./itinerary-generator/selectors.service";

export * from "./itinerary-generator/interfaces";

export interface GenerateItineraryResponse {
  searchParams: ISearchParams;
  title: string;
  totalPrice: number;
  currency: string;
  days: IDay[];
  availableFlights?: FlightResponse[];
  availableHotels?: HotelResponse[];
  availableRestaurants?: RestaurantResponse[];
  availableTouristSites?: TouristSiteResponse[];
}

export class ItineraryGeneratorService {
  private apiSearchService = new APISearchService();
  private selectorService = new SelectorService();

  async generateItinerary(
    request: GenerateItineraryRequest
  ): Promise<GenerateItineraryResponse> {
    console.log("🚀 Iniciando generación de itinerario...");
    console.log("Tipo de viaje:", request.travelType);
    console.log("Destino:", request.destinationCityName);

    if (request.budget) {
      console.log("Presupuesto definido:", request.budget);
    }

    const totalTravelers =
      request.adults + (request.children || 0) + (request.babies || 0);
    const tripDays = this.calculateTripDays(
      request.departureDate,
      request.returnDate
    );
    const apiLimits: APILimits = calculateAPILimits(tripDays);

    const flights = await this.apiSearchService.searchFlights(
      request,
      apiLimits
    );

    const hotels = await this.apiSearchService.searchHotels(request, apiLimits);

    const restaurants = await this.apiSearchService.searchRestaurants(
      request,
      apiLimits
    );

    const touristSites = await this.apiSearchService.searchTouristSites(
      request,
      apiLimits
    );

    const selectedFlight = this.selectorService.selectBestFlight(flights);
    const selectedHotel = this.selectorService.selectBestHotel(hotels);

    if (!selectedFlight) {
      throw new Error("No se encontraron vuelos disponibles");
    }

    if (!selectedHotel) {
      throw new Error("No se encontraron hoteles disponibles");
    }

    const organizedRestaurants =
      this.selectorService.organizeRestaurantsByMealType(
        restaurants,
        request.foodPreferences
      );

    const groupedSites = groupByProximity(
      touristSites,
      request.destinationCoordinates
    );

    const days = this.generateDays(
      request,
      selectedFlight,
      selectedHotel,
      organizedRestaurants,
      groupedSites,
      totalTravelers
    );

    const totalPrice = this.calculateTotalPrice(days);

    const searchParams: ISearchParams = {
      originCity: {
        name: request.originCityName,
        coordinates: request.originCoordinates,
        placeId: request.originPlaceId,
      },
      destinationCity: {
        name: request.destinationCityName,
        coordinates: request.destinationCoordinates,
        placeId: request.destinationPlaceId,
      },
      departureDate: request.departureDate,
      returnDate: request.returnDate,
      travelers: {
        adults: request.adults,
        children: request.children || 0,
        babies: request.babies || 0,
      },
      travelType: request.travelType,
    };

    const title = this.generateTitle(
      request.destinationCityName,
      request.travelType
    );

    return {
      searchParams,
      title,
      totalPrice,
      currency: request.currency || "COP",
      days,
      availableFlights: flights,
      availableHotels: hotels,
      availableRestaurants: restaurants,
      availableTouristSites: touristSites,
    };
  }

  private calculateTripDays(departureDate: Date, returnDate: Date): number {
    const diffTime = Math.abs(returnDate.getTime() - departureDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  }

  private generateDays(
    request: GenerateItineraryRequest,
    flight: FlightResponse,
    hotel: HotelResponse,
    restaurants: {
      breakfast: RestaurantResponse[];
      lunch: RestaurantResponse[];
      dinner: RestaurantResponse[];
    },
    touristSites: TouristSiteResponse[],
    totalTravelers: number
  ): IDay[] {
    const days: IDay[] = [];
    const tripDays = this.calculateTripDays(
      request.departureDate,
      request.returnDate
    );
    const activitiesPerDay = getActivitiesPerDayForTripType(request.travelType);

    const restaurantIndexes = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
    };
    let siteIndex = 0;

    console.log("\n[generateDays] Restaurantes disponibles:");
    console.log("  - Desayunos:", restaurants.breakfast.length);
    console.log("  - Almuerzos:", restaurants.lunch.length);
    console.log("  - Cenas:", restaurants.dinner.length);

    for (let dayNum = 1; dayNum <= tripDays; dayNum++) {
      const currentDate = new Date(request.departureDate);
      currentDate.setDate(currentDate.getDate() + dayNum - 1);

      const items: IItineraryItem[] = [];
      let currentTime = "08:00";
      let orderCounter = 1;

      console.log(
        `\n📅 Generando día ${dayNum} - ${currentDate.toLocaleDateString()}`
      );

      if (dayNum === 1) {
        const outboundSegment = flight.outbound.segments[0];
        const arrivalTime = new Date(outboundSegment.arrival.at);
        const arrivalHour = arrivalTime.getHours();
        const arrivalMinute = arrivalTime.getMinutes();
        const arrivalTimeStr = `${String(arrivalHour).padStart(
          2,
          "0"
        )}:${String(arrivalMinute).padStart(2, "0")}`;

        items.push(
          this.createFlightItem(
            flight,
            "outbound",
            orderCounter++,
            outboundSegment.departure.at,
            totalTravelers
          )
        );

        currentTime = arrivalTimeStr;
        currentTime = addMinutesToTime(currentTime, 60);

        if (timeToMinutes(currentTime) < 18 * 60) {
          if (
            timeToMinutes(currentTime) < 15 * 60 &&
            restaurants.lunch.length > 0
          ) {
            currentTime = addMinutesToTime(currentTime, 30);
            const restaurant =
              restaurants.lunch[
                restaurantIndexes.lunch++ % restaurants.lunch.length
              ];
            console.log(`  🍽️ Agregando almuerzo: ${restaurant.name}`);
            items.push(
              this.createFoodItem(
                restaurant,
                "almuerzo",
                orderCounter++,
                currentTime,
                totalTravelers
              )
            );
            currentTime = addMinutesToTime(currentTime, 90);
          }

          if (
            ["adventure", "cultural"].includes(request.travelType) &&
            siteIndex < touristSites.length
          ) {
            const site = touristSites[siteIndex++];
            currentTime = addMinutesToTime(currentTime, 30);
            items.push(
              this.createTouristSiteItem(
                site,
                orderCounter++,
                currentTime,
                totalTravelers
              )
            );
            currentTime = addMinutesToTime(
              currentTime,
              estimateVisitDuration(site.category)
            );
          }
        }

        if (restaurants.dinner.length > 0) {
          currentTime = this.ensureTimeIsAtLeast(currentTime, "19:00");
          const dinnerRestaurant =
            restaurants.dinner[
              restaurantIndexes.dinner++ % restaurants.dinner.length
            ];
          console.log(`  🍽️ Agregando cena: ${dinnerRestaurant.name}`);
          items.push(
            this.createFoodItem(
              dinnerRestaurant,
              "cena",
              orderCounter++,
              currentTime,
              totalTravelers
            )
          );
          currentTime = addMinutesToTime(currentTime, 120);
        }

        currentTime = this.ensureTimeIsAtLeast(currentTime, "22:00");
        items.push(
          this.createAccommodationItem(
            hotel,
            "night",
            orderCounter++,
            currentTime,
            request.departureDate,
            request.returnDate,
            totalTravelers,
            1
          )
        );
      } else if (dayNum === tripDays) {
        const inboundSegment = flight.inbound.segments[0];
        const departureTime = new Date(inboundSegment.departure.at);
        const departureHour = departureTime.getHours();
        const departureMinute = departureTime.getMinutes();
        const departureTimeStr = `${String(departureHour).padStart(
          2,
          "0"
        )}:${String(departureMinute).padStart(2, "0")}`;

        if (restaurants.breakfast.length > 0) {
          const breakfastRestaurant =
            restaurants.breakfast[
              restaurantIndexes.breakfast++ % restaurants.breakfast.length
            ];
          console.log(`  🍽️ Agregando desayuno: ${breakfastRestaurant.name}`);
          items.push(
            this.createFoodItem(
              breakfastRestaurant,
              "desayuno",
              orderCounter++,
              currentTime,
              totalTravelers
            )
          );
          currentTime = addMinutesToTime(currentTime, 60);
        }

        if (timeToMinutes(departureTimeStr) > 14 * 60) {
          if (siteIndex < touristSites.length) {
            const site = touristSites[siteIndex++];
            currentTime = addMinutesToTime(currentTime, 30);
            items.push(
              this.createTouristSiteItem(
                site,
                orderCounter++,
                currentTime,
                totalTravelers
              )
            );
            currentTime = addMinutesToTime(
              currentTime,
              estimateVisitDuration(site.category)
            );
          }

          if (restaurants.lunch.length > 0) {
            const lunchRestaurant =
              restaurants.lunch[
                restaurantIndexes.lunch++ % restaurants.lunch.length
              ];
            currentTime = this.ensureTimeIsAtLeast(currentTime, "12:00");
            console.log(`  🍽️ Agregando almuerzo: ${lunchRestaurant.name}`);
            items.push(
              this.createFoodItem(
                lunchRestaurant,
                "almuerzo",
                orderCounter++,
                currentTime,
                totalTravelers
              )
            );
            currentTime = addMinutesToTime(currentTime, 90);
          }
        }

        items.push(
          this.createFlightItem(
            flight,
            "inbound",
            orderCounter++,
            inboundSegment.departure.at,
            totalTravelers
          )
        );
      } else {
        if (restaurants.breakfast.length > 0) {
          const breakfastRestaurant =
            restaurants.breakfast[
              restaurantIndexes.breakfast++ % restaurants.breakfast.length
            ];
          console.log(`  🍽️ Agregando desayuno: ${breakfastRestaurant.name}`);
          items.push(
            this.createFoodItem(
              breakfastRestaurant,
              "desayuno",
              orderCounter++,
              currentTime,
              totalTravelers
            )
          );
          currentTime = addMinutesToTime(currentTime, 60);
        }

        const morningActivities = Math.floor(activitiesPerDay / 2);
        for (
          let i = 0;
          i < morningActivities && siteIndex < touristSites.length;
          i++
        ) {
          const site = touristSites[siteIndex++];
          currentTime = addMinutesToTime(currentTime, 30);
          items.push(
            this.createTouristSiteItem(
              site,
              orderCounter++,
              currentTime,
              totalTravelers
            )
          );

          const visitDuration = estimateVisitDuration(site.category);
          currentTime = addMinutesToTime(currentTime, visitDuration);
        }

        if (restaurants.lunch.length > 0) {
          currentTime = this.ensureTimeIsAtLeast(currentTime, "12:30");
          const lunchRestaurant =
            restaurants.lunch[
              restaurantIndexes.lunch++ % restaurants.lunch.length
            ];
          console.log(`  🍽️ Agregando almuerzo: ${lunchRestaurant.name}`);
          items.push(
            this.createFoodItem(
              lunchRestaurant,
              "almuerzo",
              orderCounter++,
              currentTime,
              totalTravelers
            )
          );
          currentTime = addMinutesToTime(currentTime, 90);
        }

        const afternoonActivities = activitiesPerDay - morningActivities;
        for (
          let i = 0;
          i < afternoonActivities && siteIndex < touristSites.length;
          i++
        ) {
          const site = touristSites[siteIndex++];
          currentTime = addMinutesToTime(currentTime, 30);
          items.push(
            this.createTouristSiteItem(
              site,
              orderCounter++,
              currentTime,
              totalTravelers
            )
          );

          const visitDuration = estimateVisitDuration(site.category);
          currentTime = addMinutesToTime(currentTime, visitDuration);
        }

        if (restaurants.dinner.length > 0) {
          currentTime = this.ensureTimeIsAtLeast(currentTime, "19:00");
          const dinnerRestaurant =
            restaurants.dinner[
              restaurantIndexes.dinner++ % restaurants.dinner.length
            ];
          console.log(`  🍽️ Agregando cena: ${dinnerRestaurant.name}`);
          items.push(
            this.createFoodItem(
              dinnerRestaurant,
              "cena",
              orderCounter++,
              currentTime,
              totalTravelers
            )
          );
          currentTime = addMinutesToTime(currentTime, 120);
        }

        currentTime = this.ensureTimeIsAtLeast(currentTime, "22:00");
        items.push(
          this.createAccommodationItem(
            hotel,
            "night",
            orderCounter++,
            currentTime,
            request.departureDate,
            request.returnDate,
            totalTravelers,
            dayNum
          )
        );
      }

      days.push({
        _id: new Types.ObjectId(),
        dayNumber: dayNum,
        date: currentDate,
        items,
      });

      console.log(
        `✅ Día ${dayNum} completado con ${items.length} actividades`
      );
    }

    return days;
  }

  private createFlightItem(
    flight: FlightResponse,
    direction: "outbound" | "inbound",
    order: number,
    departureDateTime: string,
    totalTravelers: number
  ): IItineraryItem {
    const itinerary =
      direction === "outbound" ? flight.outbound : flight.inbound;
    const segment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];

    const departureTime = new Date(segment.departure.at);
    const arrivalTime = new Date(lastSegment.arrival.at);

    const halfPrice = flight.price.grandTotal / 2;

    const flightDetails: IFlightDetails = {
      carrierCode: segment.carrierCode,
      carrierName: segment.carrierName || segment.carrierCode,
      flightNumber: segment.flightNumber,
      departureAirport: segment.departure.iataCode,
      departureAirportName:
        direction === "outbound" ? flight.origin.name : flight.destination.name,
      departureTime: `${String(departureTime.getHours()).padStart(
        2,
        "0"
      )}:${String(departureTime.getMinutes()).padStart(2, "0")}`,
      arrivalAirport: lastSegment.arrival.iataCode,
      arrivalAirportName:
        direction === "outbound" ? flight.destination.name : flight.origin.name,
      arrivalTime: `${String(arrivalTime.getHours()).padStart(2, "0")}:${String(
        arrivalTime.getMinutes()
      ).padStart(2, "0")}`,
      duration: itinerary.duration,
      numberOfStops: itinerary.segments.reduce(
        (sum, s) => sum + s.numberOfStops,
        0
      ),
      pricePerPerson: halfPrice / totalTravelers,
      totalPrice: halfPrice,
    };

    const title =
      direction === "outbound"
        ? `Vuelo ${flight.origin.cityName} - ${flight.destination.cityName}`
        : `Vuelo ${flight.destination.cityName} - ${flight.origin.cityName}`;

    const description =
      direction === "outbound"
        ? `Vuelo de ida operado por ${
            segment.carrierName || segment.carrierCode
          }`
        : `Vuelo de regreso operado por ${
            segment.carrierName || segment.carrierCode
          }`;

    return {
      _id: new Types.ObjectId(),
      itemId: `flight-${direction}-${order}`,
      type: "flight",
      order,
      time: flightDetails.departureTime,
      title,
      description,
      price: halfPrice,
      location: {
        name:
          direction === "outbound"
            ? flight.origin.name
            : flight.destination.name,
        address:
          direction === "outbound"
            ? flight.origin.name
            : flight.destination.name,
        coordinates:
          direction === "outbound"
            ? flight.origin.coordinates
            : flight.destination.coordinates,
        placeId: undefined,
      },
      flightDetails,
    };
  }

  private createAccommodationItem(
    hotel: HotelResponse,
    action: "night",
    order: number,
    time: string,
    checkIn: Date,
    checkOut: Date,
    totalTravelers: number,
    dayNumber?: number
  ): IItineraryItem {
    const nights = this.calculateTripDays(checkIn, checkOut) - 1;

    const totalPriceInCOP = convertToCOP(
      hotel.price.total,
      hotel.price.currency
    );
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

    console.log(`[createAccommodationItem] Hotel: ${hotel.name}`);
    console.log(
      `  Precio original: ${hotel.price.currency} ${hotel.price.total}`
    );
    console.log(
      `  Precio en COP (total): COP ${totalPriceInCOP.toLocaleString()}`
    );
    console.log(`  Precio por noche: COP ${pricePerNight.toLocaleString()}`);

    return {
      _id: new Types.ObjectId(),
      itemId: `accommodation-night-${order}`,
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

  private createFoodItem(
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
      _id: new Types.ObjectId(),
      itemId: `food-${mealType}-${order}`,
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

  private createTouristSiteItem(
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
      _id: new Types.ObjectId(),
      itemId: `tourist-${site.placeId}-${order}`,
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

  private ensureTimeIsAtLeast(currentTime: string, minTime: string): string {
    if (timeToMinutes(currentTime) < timeToMinutes(minTime)) {
      return minTime;
    }
    return currentTime;
  }

  private calculateTotalPrice(days: IDay[]): number {
    let total = 0;

    days.forEach((day) => {
      day.items.forEach((item) => {
        total += item.price;
      });
    });

    return Math.round(total);
  }

  private generateTitle(destinationCity: string, travelType: string): string {
    const titles: Record<string, string> = {
      cultural: "Experiencia Cultural",
      adventure: "Aventura",
      relaxation: "Escapada de Relajación",
      luxury: "Experiencia de Lujo",
      gastronomic: "Tour Gastronómico",
      spiritual: "Viaje Espiritual",
    };

    const typeTitle = titles[travelType] || "Viaje";
    return `${typeTitle} en ${destinationCity}`;
  }
}

export const itineraryGeneratorService = new ItineraryGeneratorService();
