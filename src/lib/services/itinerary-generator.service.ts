import { convertToUSD } from "@/lib/helpers/currency.helpers";

import {
  ICoordinates,
  RestaurantCategory,
  FlightResponse,
  HotelResponse,
  RestaurantResponse,
  TouristSiteResponse,
  CabinClass,
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
  parseDurationToMinutes,
  addMinutesToTime,
  timeToMinutes,
  getTouristCategoriesForTripType,
  getActivitiesPerDayForTripType,
  getRestaurantCategoriesForMeal,
  calculateAPILimits,
  estimateMealPrice,
  estimateVisitDuration,
  groupByProximity,
  formatDateToYYYYMMDD,
} from "@/lib/helpers/itinerary.helpers";

import { SelectorService } from "./itinerary-generator/selectors.service";

import { Types } from "mongoose";

export interface GenerateItineraryRequest {
  originCityName: string;
  originCoordinates: ICoordinates;
  originPlaceId?: string;
  destinationCityName: string;
  destinationCoordinates: ICoordinates;
  destinationPlaceId?: string;
  departureDate: Date;
  returnDate: Date;
  adults: number;
  children?: number;
  babies?: number;
  travelType:
    | "relaxation"
    | "luxury"
    | "cultural"
    | "adventure"
    | "gastronomic"
    | "spiritual";
  foodPreferences: RestaurantCategory[];

  // Parámetros opcionales
  cabinClass?: CabinClass;
  maxStops?: number;
  budget?: number; // Presupuesto total en COP
  hotelBudgetPerNight?: number;
  preferredHotelChains?: string[];
  currency?: string;
}

export interface GenerateItineraryResponse {
  searchParams: ISearchParams;
  title: string;
  totalPrice: number;
  currency: string;
  days: IDay[];
  availableResources: {
    flights: FlightResponse[];
    hotels: HotelResponse[];
    restaurants: RestaurantResponse[];
    touristSites: TouristSiteResponse[];
  };
}

class ItineraryGeneratorService {
  private apiBaseUrl = "https://trawell-yuxn.vercel.app/api/external";

  /**
   * Genera un itinerario completo basado en los parámetros del usuario
   */
  async generateItinerary(
    request: GenerateItineraryRequest
  ): Promise<GenerateItineraryResponse> {
    console.log("🚀 Iniciando generación de itinerario...");
    console.log("Tipo de viaje:", request.travelType);
    console.log("Destino:", request.destinationCityName);

    // Para evitar error de TypeScript con budget
    if (request.budget) {
      console.log("Presupuesto definido:", request.budget);
    }

    const totalTravelers =
      request.adults + (request.children || 0) + (request.babies || 0);
    const tripDays = this.calculateTripDays(
      request.departureDate,
      request.returnDate
    );
    const apiLimits = calculateAPILimits(tripDays);

    // 1. Parallel Search for all resources
    console.log("\n🚀 Starting parallel resource search...");
    const [flights, hotels, restaurants, touristSites] = await Promise.all([
      this.searchFlights(request, apiLimits).then(res => {
        console.log(`✅ Found ${res.length} flights`);
        return res;
      }),
      this.searchHotels(request, apiLimits).then(res => {
        console.log(`✅ Found ${res.length} hotels`);
        return res;
      }),
      this.searchRestaurants(request, apiLimits).then(res => {
        console.log(`✅ Found ${res.length} restaurants`);
        return res;
      }),
      this.searchTouristSites(request, apiLimits).then(res => {
        console.log(`✅ Found ${res.length} tourist sites`);
        return res;
      }),
    ]);

    // 5. Seleccionar el mejor vuelo y hotel
    const selectedFlight = this.selectBestFlight(flights, request);
    const selectedHotel = this.selectBestHotel(hotels);

    if (!selectedFlight) {
      throw new Error("No available flights found");
    }

    if (!selectedHotel) {
      throw new Error("No available hotels found");
    }

    console.log("\n✅ Vuelo seleccionado:", selectedFlight.id);
    console.log("✅ Hotel seleccionado:", selectedHotel.name);

    // 6. Organizar restaurantes por tipo de comida
    const organizedRestaurants = this.organizeRestaurantsByMealType(
      restaurants,
      request.foodPreferences
    );

    // 7. Agrupar sitios turísticos por cercanía
    const groupedSites = groupByProximity(
      touristSites,
      request.destinationCoordinates
    );

    // 8. Generar días del itinerario
    console.log("\n📅 Generando itinerario día por día...");
    const days = this.generateDays(
      request,
      selectedFlight,
      selectedHotel,
      organizedRestaurants,
      groupedSites,
      totalTravelers
    );

    // 9. Calcular precio total
    const totalPrice = this.calculateTotalPrice(days);

    // Si hay presupuesto, validarlo
    if (request.budget !== undefined) {
      if (totalPrice > request.budget) {
        throw new Error(
          `Estimated trip cost (${totalPrice.toLocaleString()} ${request.currency || "COP"}) ` +
          `exceeds your budget (${request.budget.toLocaleString()} ${request.currency || "COP"}).`
        );
      }
    }

    // 10. Crear searchParams
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

    console.log("\n🎉 Itinerario generado exitosamente!");
    console.log(
      `Precio total: ${
        request.currency || "COP"
      } ${totalPrice.toLocaleString()}`
    );

    return {
      searchParams,
      title,
      totalPrice,
      currency: request.currency || "COP",
      days,
      availableResources: {
        flights,
        hotels,
        restaurants,
        touristSites,
      },
    };
  }

  async fetchAvailableResources(
    request: GenerateItineraryRequest
  ): Promise<{
    availableFlights: FlightResponse[];
    availableHotels: HotelResponse[];
    availableRestaurants: RestaurantResponse[];
    availableTouristSites: TouristSiteResponse[];
  }> {
    console.log("🔄 Recargando recursos disponibles...");
    
    const tripDays = this.calculateTripDays(
      request.departureDate,
      request.returnDate
    );
    const apiLimits = calculateAPILimits(tripDays);

    const [flights, hotels, restaurants, touristSites] = await Promise.all([
      this.searchFlights(request, apiLimits),
      this.searchHotels(request, apiLimits),
      this.searchRestaurants(request, apiLimits),
      this.searchTouristSites(request, apiLimits),
    ]);

    return {
      availableFlights: flights,
      availableHotels: hotels,
      availableRestaurants: restaurants,
      availableTouristSites: touristSites,
    };
  }

  /**
   * Busca vuelos usando la API
   */
  private async searchFlights(
    request: GenerateItineraryRequest,
    limits: { restaurants: number; touristSites: number; hotels: number }
  ): Promise<FlightResponse[]> {
    try {
      console.log(limits)
      const response = await fetch(`${this.apiBaseUrl}/flights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originCityName: request.originCityName,
          destinationCityName: request.destinationCityName,
          originCoordinates: request.originCoordinates,
          destinationCoordinates: request.destinationCoordinates,
          departureDate: formatDateToYYYYMMDD(request.departureDate),
          returnDate: formatDateToYYYYMMDD(request.returnDate),
          adults: request.adults,
          children: request.children,
          infants: request.babies,
          cabinClass: request.cabinClass || "ECONOMY",
          maxStops: request.maxStops,
          limit: 10,
          currency: request.currency || "COP",
        }),
      });

      const data = await response.json();
      return data.success ? data.data.flights : [];
    } catch (error) {
      console.error("Error buscando vuelos:", error);
      return [];
    }
  }

  /**
   * Busca hoteles usando la API
   */
  private async searchHotels(
    request: GenerateItineraryRequest,
    limits: { restaurants: number; touristSites: number; hotels: number }
  ): Promise<HotelResponse[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/places/hotels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityName: request.destinationCityName,
          coordinates: request.destinationCoordinates,
          checkInDate: formatDateToYYYYMMDD(request.departureDate),
          checkOutDate: formatDateToYYYYMMDD(request.returnDate),
          adults: request.adults,
          children: request.children,
          rooms: 1,
          limit: limits.hotels,
          currency: request.currency || "COP",
          chainCodes: request.preferredHotelChains,
          priceRange: request.hotelBudgetPerNight
            ? { max: request.hotelBudgetPerNight }
            : undefined,
        }),
      });

      const data = await response.json();
      return data.success ? data.data.hotels : [];
    } catch (error) {
      console.error("Error buscando hoteles:", error);
      return [];
    }
  }

  /**
   * Busca restaurantes usando la API
   */
  private async searchRestaurants(
    request: GenerateItineraryRequest,
    _limits: { restaurants: number; touristSites: number; hotels: number } // Prefijo con _ para indicar que no se usa
  ): Promise<RestaurantResponse[]> {
    try {
      // Aumentar el límite para asegurar suficientes restaurantes
      const increasedLimit = Math.max(_limits.restaurants, 15);

      console.log(
        "[searchRestaurants] Buscando con preferencias:",
        request.foodPreferences
      );

      // Si las preferencias son muy específicas, agregar 'all' como fallback
      const categoriesToSearch = request.foodPreferences.includes("all")
        ? ["all" as RestaurantCategory]
        : [
            ...request.foodPreferences,
            "casual" as RestaurantCategory,
            "italian" as RestaurantCategory,
          ];

      const response = await fetch(`${this.apiBaseUrl}/places/restaurants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityName: request.destinationCityName,
          coordinates: request.destinationCoordinates,
          placeId: request.destinationPlaceId,
          categories: categoriesToSearch,
          limit: increasedLimit,
          minRating: 3.0, // Reducir rating mínimo para obtener más resultados
        }),
      });

      const data = await response.json();
      let restaurants = data.success ? data.data.restaurants : [];

      console.log(
        `[searchRestaurants] Total restaurantes encontrados: ${restaurants.length}`
      );
       if (request.budget) {
             restaurants = restaurants.filter(
               (r: RestaurantResponse) => (r.priceLevel ?? 2) <= 2
             );
             console.log(
               `[searchRestaurants] Filtrados por presupuesto: ${restaurants.length}`
             );
           }
      return restaurants;
    } catch (error) {
      console.error("Error buscando restaurantes:", error);
      return [];
    }
  }

  /**
   * Busca sitios turísticos usando la API
   */
  private async searchTouristSites(
    request: GenerateItineraryRequest,
    limits: { restaurants: number; touristSites: number; hotels: number }
  ): Promise<TouristSiteResponse[]> {
    try {
      const categories = getTouristCategoriesForTripType(request.travelType);

      const response = await fetch(`${this.apiBaseUrl}/places/tourist-sites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityName: request.destinationCityName,
          coordinates: request.destinationCoordinates,
          placeId: request.destinationPlaceId,
          categories,
          limit: limits.touristSites,
          minRating: 3.5,
        }),
      });

      const data = await response.json();
      return data.success ? data.data.sites : [];
    } catch (error) {
      console.error("Error buscando sitios turísticos:", error);
      return [];
    }
  }

  /**
   * Selecciona el mejor vuelo basado en precio, duración y escalas
   */
  private selectBestFlight(
    flights: FlightResponse[],
    request: GenerateItineraryRequest
  ): FlightResponse | null {
    if (flights.length === 0) return null;

    if (request.budget) {
      const sorted = flights.sort((a, b) => a.price.grandTotal - b.price.grandTotal);
      return sorted[0]; // vuelo más barato
    }

    // Ordenar por: menos escalas > menor precio > menor duración
    const sorted = [...flights].sort((a, b) => {
      const stopsA = a.outbound.segments.reduce((sum, s) => sum + s.numberOfStops, 0);
      const stopsB = b.outbound.segments.reduce((sum, s) => sum + s.numberOfStops, 0);

      if (stopsA !== stopsB) return stopsA - stopsB;
      if (a.price.grandTotal !== b.price.grandTotal)
        return a.price.grandTotal - b.price.grandTotal;

      const durationA = parseDurationToMinutes(a.outbound.duration);
      const durationB = parseDurationToMinutes(b.outbound.duration);
      return durationA - durationB;
    });

    return sorted[0];
  }

  /**
   * Selecciona el mejor hotel basado en rating y precio
   */
  private selectBestHotel(hotels: HotelResponse[]): HotelResponse | null {
    if (hotels.length === 0) return null;

    // Ordenar por disponibilidad, luego por mejor relación calidad-precio
    const sorted = [...hotels]
      .filter((h) => h.available)
      .sort((a, b) => {
        // Priorizar hoteles con mejor precio
        return a.price.total - b.price.total;
      });

    return sorted[0];
  }

  /**
   * Organiza restaurantes por tipo de comida
   */
  private organizeRestaurantsByMealType(
    restaurants: RestaurantResponse[],
    foodPreferences: RestaurantCategory[]
  ): {
    breakfast: RestaurantResponse[];
    lunch: RestaurantResponse[];
    dinner: RestaurantResponse[];
  } {
    console.log("[organizeRestaurantsByMealType] Organizando restaurantes...");
    console.log(
      "[organizeRestaurantsByMealType] Total disponibles:",
      restaurants.length
    );

    const breakfastCategories = getRestaurantCategoriesForMeal(
      "breakfast",
      foodPreferences
    );
    const lunchCategories = getRestaurantCategoriesForMeal(
      "lunch",
      foodPreferences
    );
    const dinnerCategories = getRestaurantCategoriesForMeal(
      "dinner",
      foodPreferences
    );

    console.log(
      "[organizeRestaurantsByMealType] Categorías de desayuno:",
      breakfastCategories
    );
    console.log(
      "[organizeRestaurantsByMealType] Categorías de almuerzo:",
      lunchCategories
    );
    console.log(
      "[organizeRestaurantsByMealType] Categorías de cena:",
      dinnerCategories
    );

    // Filtrar restaurantes por categorías
    let breakfast = restaurants.filter((r) =>
      breakfastCategories.includes(r.category)
    );
    let lunch = restaurants.filter((r) => lunchCategories.includes(r.category));
    let dinner = restaurants.filter((r) =>
      dinnerCategories.includes(r.category)
    );

    console.log(
      "[organizeRestaurantsByMealType] Desayunos encontrados:",
      breakfast.length
    );
    console.log(
      "[organizeRestaurantsByMealType] Almuerzos encontrados:",
      lunch.length
    );
    console.log(
      "[organizeRestaurantsByMealType] Cenas encontradas:",
      dinner.length
    );

    // Si alguna categoría está vacía, usar restaurantes de las otras categorías como fallback
    if (breakfast.length === 0) {
      console.log(
        "[organizeRestaurantsByMealType] No hay desayunos, usando fallback"
      );
      breakfast = restaurants
        .filter(
          (r) =>
            r.category === "cafe" ||
            r.category === "bakery" ||
            r.category === "casual"
        )
        .slice(0, 10);

      // Si aún no hay, usar cualquier restaurante
      if (breakfast.length === 0) {
        breakfast = restaurants.slice(0, 5);
      }
    }

    if (lunch.length === 0) {
      console.log(
        "[organizeRestaurantsByMealType] No hay almuerzos, usando fallback"
      );
      lunch = restaurants.filter((r) => r.category === "casual").slice(0, 10);

      if (lunch.length === 0) {
        lunch = restaurants.slice(0, 10);
      }
    }

    if (dinner.length === 0) {
      console.log(
        "[organizeRestaurantsByMealType] No hay cenas, usando fallback"
      );
      dinner = restaurants.slice(0, 10);
    }

    console.log(
      "[organizeRestaurantsByMealType] Final - Desayunos:",
      breakfast.length
    );
    console.log(
      "[organizeRestaurantsByMealType] Final - Almuerzos:",
      lunch.length
    );
    console.log(
      "[organizeRestaurantsByMealType] Final - Cenas:",
      dinner.length
    );

    return { breakfast, lunch, dinner };
  }

  /**
   * Genera los días del itinerario
   */
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
    let activitiesPerDay = getActivitiesPerDayForTripType(request.travelType);
    
    // Adjust activities based on budget (USD)
    // 400 USD approx 1.5M COP, 800 USD approx 3M COP
    if (request.budget && request.budget < 400) {
      activitiesPerDay = 1; 
    } else if (request.budget && request.budget < 800) {
      activitiesPerDay = Math.max(activitiesPerDay - 1, 1);
    }

    const restaurantIndexes = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
    };
    let siteIndex = 0;

    console.log("\n[generateDays] Available restaurants:");
    console.log("  - Breakfast:", restaurants.breakfast.length);
    console.log("  - Lunch:", restaurants.lunch.length);
    console.log("  - Dinner:", restaurants.dinner.length);

    for (let dayNum = 1; dayNum <= tripDays; dayNum++) {
      const currentDate = new Date(request.departureDate);
      currentDate.setDate(currentDate.getDate() + dayNum - 1);

      const items: IItineraryItem[] = [];
      let currentTime = "08:00";
      let orderCounter = 1;

      console.log(
        `\n📅 Generating Day ${dayNum} - ${currentDate.toLocaleDateString()}`
      );

      // Day 1: Outbound Flight
      if (dayNum === 1) {
        const outboundSegment = flight.outbound.segments[0];
        const arrivalTime = new Date(outboundSegment.arrival.at);
        const arrivalHour = arrivalTime.getHours();
        const arrivalMinute = arrivalTime.getMinutes();
        const arrivalTimeStr = `${String(arrivalHour).padStart(2, "0")}:${String(arrivalMinute).padStart(2, "0")}`;

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
        currentTime = addMinutesToTime(currentTime, 30); // 30 mins transport

        items.push(
          this.createHotelArrivalItem(
            hotel,
            orderCounter++,
            currentTime
          )
        );

        currentTime = addMinutesToTime(currentTime, 60); // Check-in time

        // If early arrival (before 18:00)
        if (timeToMinutes(currentTime) < 18 * 60) {
          // Lunch if before 15:00
          if (timeToMinutes(currentTime) < 15 * 60 && restaurants.lunch.length > 0) {
            currentTime = addMinutesToTime(currentTime, 30);
            const restaurant = restaurants.lunch[restaurantIndexes.lunch++ % restaurants.lunch.length];
            items.push(
              this.createFoodItem(
                restaurant,
                "lunch",
                orderCounter++,
                currentTime,
                totalTravelers
              )
            );
            currentTime = addMinutesToTime(currentTime, 90);
          }

          // Activity if appropriate travel type
          if (["adventure", "cultural"].includes(request.travelType) && siteIndex < touristSites.length) {
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
            currentTime = addMinutesToTime(currentTime, estimateVisitDuration(site.category));
          }
        }

        // Dinner
        if (restaurants.dinner.length > 0) {
          currentTime = this.ensureTimeIsAtLeast(currentTime, "19:00");
          const dinnerRestaurant = restaurants.dinner[restaurantIndexes.dinner++ % restaurants.dinner.length];
          items.push(
            this.createFoodItem(
              dinnerRestaurant,
              "dinner",
              orderCounter++,
              currentTime,
              totalTravelers
            )
          );
          currentTime = addMinutesToTime(currentTime, 120);
        }

        // Night
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
      }
      // Last Day: Inbound Flight
      else if (dayNum === tripDays) {
        const inboundSegment = flight.inbound.segments[0];
        const departureTime = new Date(inboundSegment.departure.at);
        const departureTimeStr = `${String(departureTime.getHours()).padStart(2, "0")}:${String(departureTime.getMinutes()).padStart(2, "0")}`;

        // Breakfast
        if (restaurants.breakfast.length > 0) {
          const restaurant = restaurants.breakfast[restaurantIndexes.breakfast++ % restaurants.breakfast.length];
          items.push(this.createFoodItem(restaurant, "breakfast", orderCounter++, currentTime, totalTravelers));
          currentTime = addMinutesToTime(currentTime, 60);
        }

        // If flight is late (after 14:00)
        if (timeToMinutes(departureTimeStr) > 14 * 60) {
            if (siteIndex < touristSites.length) {
                const site = touristSites[siteIndex++];
                currentTime = addMinutesToTime(currentTime, 30);
                items.push(this.createTouristSiteItem(site, orderCounter++, currentTime, totalTravelers));
                currentTime = addMinutesToTime(currentTime, estimateVisitDuration(site.category));
            }

            if (restaurants.lunch.length > 0) {
                const restaurant = restaurants.lunch[restaurantIndexes.lunch++ % restaurants.lunch.length];
                currentTime = this.ensureTimeIsAtLeast(currentTime, "12:00");
                items.push(this.createFoodItem(restaurant, "lunch", orderCounter++, currentTime, totalTravelers));
                currentTime = addMinutesToTime(currentTime, 90);
            }
        }

        // Flight
        // Checkout/Pickup item
        currentTime = this.ensureTimeIsAtLeast(currentTime, "15:00"); // loose default
        
        items.push({
            _id: new Types.ObjectId(),
            itemId: `hotel-pickup-${orderCounter}`,
            type: "accommodation",
            order: orderCounter++,
            time: currentTime,
            title: `Luggage Pickup at ${hotel.name}`,
            description: `Return to hotel to pick up your belongings before the flight`,
            price: 0,
            location: {
              name: hotel.name,
              address: hotel.address || hotel.name,
              coordinates: hotel.coordinates,
              placeId: undefined,
            },
        });

        items.push(
          this.createFlightItem(
            flight,
            "inbound",
            orderCounter++,
            inboundSegment.departure.at,
            totalTravelers
          )
        );
      }
      // Intermediate Days
      else {
         // Breakfast
         if (restaurants.breakfast.length > 0) {
            const restaurant = restaurants.breakfast[restaurantIndexes.breakfast++ % restaurants.breakfast.length];
            items.push(this.createFoodItem(restaurant, "breakfast", orderCounter++, currentTime, totalTravelers));
            currentTime = addMinutesToTime(currentTime, 60);
         }

         // Morning Activities
         const morningActivities = Math.floor(activitiesPerDay / 2);
         for (let i = 0; i < morningActivities && siteIndex < touristSites.length; i++) {
            const site = touristSites[siteIndex++];
            currentTime = addMinutesToTime(currentTime, 30);
            items.push(this.createTouristSiteItem(site, orderCounter++, currentTime, totalTravelers));
            currentTime = addMinutesToTime(currentTime, estimateVisitDuration(site.category));
         }

         // Lunch
         if (restaurants.lunch.length > 0) {
            currentTime = this.ensureTimeIsAtLeast(currentTime, "12:30");
            const restaurant = restaurants.lunch[restaurantIndexes.lunch++ % restaurants.lunch.length];
            items.push(this.createFoodItem(restaurant, "lunch", orderCounter++, currentTime, totalTravelers));
            currentTime = addMinutesToTime(currentTime, 90);
         }

         // Afternoon Activities
         const afternoonActivities = activitiesPerDay - morningActivities;
         for (let i = 0; i < afternoonActivities && siteIndex < touristSites.length; i++) {
            const site = touristSites[siteIndex++];
            currentTime = addMinutesToTime(currentTime, 30);
            items.push(this.createTouristSiteItem(site, orderCounter++, currentTime, totalTravelers));
            currentTime = addMinutesToTime(currentTime, estimateVisitDuration(site.category));
         }

         // Dinner
         if (restaurants.dinner.length > 0) {
            currentTime = this.ensureTimeIsAtLeast(currentTime, "19:00");
            const restaurant = restaurants.dinner[restaurantIndexes.dinner++ % restaurants.dinner.length];
            items.push(this.createFoodItem(restaurant, "dinner", orderCounter++, currentTime, totalTravelers));
            currentTime = addMinutesToTime(currentTime, 120);
         }

         // Night
         currentTime = this.ensureTimeIsAtLeast(currentTime, "22:00");
         items.push(this.createAccommodationItem(hotel, "night", orderCounter++, currentTime, request.departureDate, request.returnDate, totalTravelers, dayNum));
      }

      days.push({
        _id: new Types.ObjectId(),
        dayNumber: dayNum,
        date: currentDate,
        items,
      });
    }

    return days;
  }

  /**
   * Crea un item que representa la llegada/check-in al hotel (sin costo)
   */
  private createHotelArrivalItem(
    hotel: HotelResponse,
    order: number,
    time: string
  ): IItineraryItem {
    // Arrival/check-in marker: do NOT include accommodationDetails because
    // the DB schema requires `nights >= 1` when accommodationDetails is present.
    // This item represents an arrival event (no cost) and should not trigger
    // schema validation for accommodation details.
    return {
      _id: new Types.ObjectId(),
      itemId: `accommodation-arrival-${order}`,
      type: "accommodation",
      order,
      time,
      title: `Hotel Check-in: ${hotel.name}`,
      description: `Check-in and arrival at ${hotel.name}`,
      price: 0,
      location: {
        name: hotel.name,
        address: hotel.address || hotel.name,
        coordinates: hotel.coordinates,
        placeId: undefined,
      },
    };
  }

  

  /**
   * Crea un item de comida
   */
  private createFoodItem(
    restaurant: RestaurantResponse,
    mealType: "breakfast" | "lunch" | "dinner",
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
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
    };

    return {
      _id: new Types.ObjectId(), // Usar Types.ObjectId()
      itemId: `food-${mealType}-${order}`,
      type: "food",
      order,
      time,
      title: `${mealTitles[mealType]} at ${restaurant.name}`,
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

  /**
   * Crea un item de sitio turístico
   */
  private createTouristSiteItem(
    site: TouristSiteResponse,
    order: number,
    time: string,
    totalTravelers: number
  ): IItineraryItem {
    const entryFee = site.priceLevel
      ? site.priceLevel * 5 * totalTravelers
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
      )} hours`,
      openingHours: site.openingHours,
      photos: site.photos,
    };

    return {
      _id: new Types.ObjectId(), // Usar Types.ObjectId()
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

  /**
   * Calcula el número de días del viaje
   */
  private calculateTripDays(departureDate: Date, returnDate: Date): number {
    const diffTime = Math.abs(returnDate.getTime() - departureDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Incluir ambos días
  }

  /**
   * Crea un item de vuelo
   */
  private createFlightItem(
    flight: FlightResponse,
    direction: "outbound" | "inbound",
    order: number,
    time: string,
    totalTravelers: number
  ): IItineraryItem {
    const flightSegment =
      direction === "outbound"
        ? flight.outbound.segments[0]
        : flight.inbound!.segments[0];

    const flightDetails: IFlightDetails = {
      carrierCode: flightSegment.carrierCode,
      carrierName: flightSegment.carrierName || flightSegment.carrierCode, 
      flightNumber: flightSegment.flightNumber,
      departureAirport: flightSegment.departure.iataCode,
      departureAirportName: "Departure Airport", // Placeholder, API doesn't provide name directly here
      arrivalAirport: flightSegment.arrival.iataCode,
      arrivalAirportName: "Arrival Airport", // Placeholder
      departureTime: flightSegment.departure.at,
      arrivalTime: flightSegment.arrival.at,
      duration: flightSegment.duration,
      numberOfStops: flightSegment.numberOfStops,
      pricePerPerson: flight.price.total / totalTravelers,
      totalPrice: flight.price.grandTotal,
    };

    // Calculate price for this direction roughly (50% if round trip)
    const price = flight.price.grandTotal / (flight.inbound ? 2 : 1);

    return {
      _id: new Types.ObjectId(),
      itemId: `flight-${direction}-${order}`,
      type: "flight",
      order,
      time,
      title: `${direction === "outbound" ? "Outbound" : "Return"} Flight`,
      description: `Flight ${flightSegment.carrierCode} ${flightSegment.flightNumber} from ${flightSegment.departure.iataCode} to ${flightSegment.arrival.iataCode}`,
      price: Math.round(price),
      location: {
        name: `${flightSegment.departure.iataCode} Airport`,
        address: direction === "outbound" ? "Departure Airport" : "Return Airport",
        coordinates: { lat: 0, lng: 0 }, // Placeholder
        placeId: undefined,
      },
      flightDetails,
    };
  }

  /**
   * Crea un item de alojamiento
   */
  private createAccommodationItem(
    hotel: HotelResponse,
    type: "night" | "check-in" | "check-out",
    order: number,
    time: string,
    checkIn: Date,
    checkOut: Date,
    totalTravelers: number,
    dayNumber: number
  ): IItineraryItem {
    const nights = this.calculateTripDays(checkIn, checkOut) - 1;
    const totalPriceInUSD = convertToUSD(hotel.price.total, hotel.price.currency);
    const pricePerNight = totalPriceInUSD / Math.max(nights, 1);

    const accommodationDetails: IAccommodationDetails = {
      hotelId: hotel.hotelId,
      hotelName: hotel.name,
      checkIn: checkIn,
      checkOut: checkOut,
      nights: Math.max(nights, 1),
      roomType: hotel.roomDetails?.type || "Standard Room",
    };

    const title = `Night ${dayNumber} at ${hotel.name}`;
    const description =
      hotel.roomDetails?.description?.text || "Hotel with excellent amenities";

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

  /**
   * Asegura que una hora sea al menos la hora mínima especificada
   */
  private ensureTimeIsAtLeast(currentTime: string, minTime: string): string {
    if (timeToMinutes(currentTime) < timeToMinutes(minTime)) {
      return minTime;
    }
    return currentTime;
  }

  /**
   * Calcula el precio total del itinerario
   */
  private calculateTotalPrice(days: IDay[]): number {
    let total = 0;

    days.forEach((day) => {
      day.items.forEach((item) => {
        total += item.price;
      });
    });

    return Math.round(total);
  }

  /**
   * Genera un título para el itinerario
   */
  private generateTitle(destinationCity: string, travelType: string): string {
    const titles: Record<string, string> = {
      cultural: "Cultural Experience",
      adventure: "Adventure",
      relaxation: "Relaxation Getaway",
      luxury: "Luxury Experience",
      gastronomic: "Gastronomic Tour",
      spiritual: "Spiritual Journey",
    };

    const typeTitle = titles[travelType] || "Trip";
    return `${typeTitle} in ${destinationCity}`;
  }

  /**
   * Ordena vuelos aplicando la misma lógica del selector
   */
  private sortFlights(flights: FlightResponse[]): FlightResponse[] {
    return [...flights].sort((a, b) => {
      const stopsA =
        a.outbound.segments.reduce((sum, s) => sum + s.numberOfStops, 0) +
        (a.inbound
          ? a.inbound.segments.reduce((sum, s) => sum + s.numberOfStops, 0)
          : 0);
      const stopsB =
        b.outbound.segments.reduce((sum, s) => sum + s.numberOfStops, 0) +
        (b.inbound
          ? b.inbound.segments.reduce((sum, s) => sum + s.numberOfStops, 0)
          : 0);

      if (stopsA !== stopsB) return stopsA - stopsB;
      if (a.price.grandTotal !== b.price.grandTotal) {
        return a.price.grandTotal - b.price.grandTotal;
      }

      const durationA = parseDurationToMinutes(a.outbound.duration);
      const durationB = parseDurationToMinutes(b.outbound.duration);
      return durationA - durationB;
    });
  }

  /**
   * Ordena hoteles aplicando la misma lógica del selector
   */
  private sortHotels(hotels: HotelResponse[]): HotelResponse[] {
    return [...hotels]
      .filter((h) => h.available)
      .sort((a, b) => a.price.total - b.price.total);
  }

  /**
   * Genera N variantes de itinerario (por defecto 3). Realiza las búsquedas una sola vez
   * y luego construye variantes usando las mejores opciones por índice.
   */
  async generateItineraries(
    request: GenerateItineraryRequest,
    variants = 3
  ): Promise<GenerateItineraryResponse[]> {
    const totalTravelers =
      request.adults + (request.children || 0) + (request.babies || 0);
    const tripDays = this.calculateTripDays(
      request.departureDate,
      request.returnDate
    );
    const apiLimits = calculateAPILimits(tripDays);

    // Realizar búsquedas una sola vez en paralelo
    const [flights, hotels, restaurants, touristSites] = await Promise.all([
      this.searchFlights(request, apiLimits),
      this.searchHotels(request, apiLimits),
      this.searchRestaurants(request, apiLimits),
      this.searchTouristSites(request, apiLimits),
    ]);

    const sortedFlights = this.sortFlights(flights);
    const sortedHotels = this.sortHotels(hotels);

    const organized = new SelectorService().organizeRestaurantsByMealType(
      restaurants,
      request.foodPreferences
    );

    const results: GenerateItineraryResponse[] = [];

    for (let i = 0; i < variants; i++) {
      const selectedFlight = sortedFlights[i] || sortedFlights[0];
      const selectedHotel = sortedHotels[i] || sortedHotels[0];

      const rotate = (arr: unknown[]) =>
        arr.length === 0 ? arr : arr.slice(i).concat(arr.slice(0, i));

      const restaurantsVariant = {
        breakfast: rotate(organized.breakfast) as RestaurantResponse[],
        lunch: rotate(organized.lunch) as RestaurantResponse[],
        dinner: rotate(organized.dinner) as RestaurantResponse[],
      };

      const touristSitesVariant = rotate(touristSites) as TouristSiteResponse[];

      const days = this.generateDays(
        request,
        selectedFlight,
        selectedHotel,
        restaurantsVariant,
        touristSitesVariant,
        totalTravelers
      );

      const totalPrice = this.calculateTotalPrice(days);
      const title = this.generateTitle(
        request.destinationCityName,
        request.travelType
      );

      results.push({
        searchParams: {
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
        },
        title,
        totalPrice,
        currency: request.currency || "USD",
        days,
        availableResources: {
            flights,
            hotels,
            restaurants,
            touristSites
        }
      });
    }

    return results;
  }

  
}

export const itineraryGeneratorService = new ItineraryGeneratorService();
