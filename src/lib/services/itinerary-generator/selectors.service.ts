import {
  FlightResponse,
  HotelResponse,
  RestaurantResponse,
  RestaurantCategory,
} from "@/models/types";
import { parseDurationToMinutes, getRestaurantCategoriesForMeal } from "@/lib/helpers/itinerary.helpers";

export class SelectorService {
  selectBestFlight(flights: FlightResponse[]): FlightResponse | null {
    if (flights.length === 0) return null;

    const sorted = [...flights].sort((a, b) => {
      const stopsA =
        a.outbound.segments.reduce((sum, s) => sum + s.numberOfStops, 0) +
        (a.inbound ? a.inbound.segments.reduce((sum, s) => sum + s.numberOfStops, 0) : 0);
      const stopsB =
        b.outbound.segments.reduce((sum, s) => sum + s.numberOfStops, 0) +
        (b.inbound ? b.inbound.segments.reduce((sum, s) => sum + s.numberOfStops, 0) : 0);

      if (stopsA !== stopsB) return stopsA - stopsB;

      if (a.price.grandTotal !== b.price.grandTotal) {
        return a.price.grandTotal - b.price.grandTotal;
      }

      const durationA = parseDurationToMinutes(a.outbound.duration);
      const durationB = parseDurationToMinutes(b.outbound.duration);
      return durationA - durationB;
    });

    return sorted[0];
  }

  selectBestHotel(hotels: HotelResponse[]): HotelResponse | null {
    if (hotels.length === 0) return null;

    const sorted = [...hotels]
      .filter((h) => h.available)
      .sort((a, b) => {
        return a.price.total - b.price.total;
      });

    return sorted[0] || null;
  }

  organizeRestaurantsByMealType(
    restaurants: RestaurantResponse[],
    foodPreferences: RestaurantCategory[]
  ): {
    breakfast: RestaurantResponse[];
    lunch: RestaurantResponse[];
    dinner: RestaurantResponse[];
  } {
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

    let breakfast = restaurants.filter((r) =>
      breakfastCategories.includes(r.category)
    );
    let lunch = restaurants.filter((r) => lunchCategories.includes(r.category));
    let dinner = restaurants.filter((r) =>
      dinnerCategories.includes(r.category)
    );

    if (breakfast.length === 0) {
      breakfast = restaurants
        .filter(
          (r) =>
            r.category === "cafe" ||
            r.category === "bakery" ||
            r.category === "casual"
        )
        .slice(0, 10);

      if (breakfast.length === 0) {
        breakfast = restaurants.slice(0, 5);
      }
    }

    if (lunch.length === 0) {
      lunch = restaurants.filter((r) => r.category === "casual").slice(0, 10);

      if (lunch.length === 0) {
        lunch = restaurants.slice(0, 10);
      }
    }

    if (dinner.length === 0) {
      dinner = restaurants.slice(0, 10);
    }

    return { breakfast, lunch, dinner };
  }
}