// src/lib/services/restaurants.service.ts

import {
  GetRestaurantsRequest,
  RestaurantResponse,
  RestaurantCategory,
  ICoordinates,
  IPhoto,
  IOpeningHours,
} from "@/models/types";
import {
  PLACES_CONFIG,
  kmToMeters
} from "../config/places.config";

interface GooglePlacePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
}

interface GooglePlaceOpeningHours {
  openNow?: boolean;
  weekdayDescriptions?: string[];
}

interface GooglePlace {
  name: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  types?: string[];
  businessStatus?: string;
  currentOpeningHours?: GooglePlaceOpeningHours;
  photos?: GooglePlacePhoto[];
  internationalPhoneNumber?: string;
  websiteUri?: string;
  editorialSummary?: { text: string };
}

interface GooglePlacesSearchResponse {
  places?: GooglePlace[];
  nextPageToken?: string;
}

export class RestaurantsService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey =
      process.env.MAPS_API_KEY || process.env.NEXT_PUBLIC_MAPS_API_KEY || "";
    this.baseUrl = PLACES_CONFIG.PLACES_API_BASE_URL;

    if (!this.apiKey) {
      throw new Error("Google Maps API key is not configured");
    }

    console.log(
      "[RestaurantsService] Initialized with API key:",
      this.apiKey.substring(0, 10) + "..."
    );
  }

  /**
   * Busca restaurantes en una ciudad
   */
  async searchRestaurants(
    request: GetRestaurantsRequest
  ): Promise<RestaurantResponse[]> {
    const {
      cityName,
      coordinates,
      categories,
      limit = PLACES_CONFIG.DEFAULT_LIMIT_PER_CATEGORY,
      minRating = PLACES_CONFIG.DEFAULT_MIN_RATING,
      radiusKm = PLACES_CONFIG.DEFAULT_RADIUS_KM,
      priceLevel,
    } = request;

    // FIX: Asegurar que categories siempre sea un array de RestaurantCategory
    const finalCategories: RestaurantCategory[] = categories && Array.isArray(categories) && categories.length > 0 
      ? categories 
      : ["all" as RestaurantCategory];

    console.log("[searchRestaurants] Starting search with params:", {
      cityName,
      coordinates,
      categories: finalCategories,
      limit,
      minRating,
      radiusKm,
      priceLevel,
    });

    const allRestaurants: RestaurantResponse[] = [];
    const seenPlaceIds = new Set<string>();

    // Buscar por cada categoría
    for (const category of finalCategories) {
      console.log(`[searchRestaurants] Searching category: ${category}`);

      const restaurantsForCategory = await this.searchByCategory(
        category,
        coordinates,
        radiusKm,
        limit,
        minRating,
        priceLevel
      );

      console.log(
        `[searchRestaurants] Found ${restaurantsForCategory.length} restaurants for category ${category}`
      );

      // Filtrar duplicados
      for (const restaurant of restaurantsForCategory) {
        if (!seenPlaceIds.has(restaurant.placeId)) {
          seenPlaceIds.add(restaurant.placeId);
          allRestaurants.push(restaurant);
        }
      }
    }

    console.log(
      `[searchRestaurants] Total unique restaurants found: ${allRestaurants.length}`
    );

    // Ordenar por rating descendente
    return allRestaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  /**
   * Busca restaurantes de una categoría específica
   */
  private async searchByCategory(
    category: RestaurantCategory,
    coordinates: ICoordinates,
    radiusKm: number,
    limit: number,
    minRating: number,
    priceLevel?: number[]
  ): Promise<RestaurantResponse[]> {
    const types = PLACES_CONFIG.RESTAURANT_CATEGORY_TYPES[category];
    
    // FIX: Validar que types existe y es un array
    if (!types || !Array.isArray(types) || types.length === 0) {
      console.error(`[searchByCategory] Invalid category: ${category}`);
      return [];
    }

    const restaurants: RestaurantResponse[] = [];

    console.log(
      `[searchByCategory] Category ${category}, types to search:`,
      types
    );

    // Buscar por cada tipo asociado a la categoría
    for (const type of types) {
      try {
        console.log(`[searchByCategory] Searching for type: ${type}`);

        const results = await this.nearbySearch(
          coordinates,
          radiusKm,
          type,
          Math.min(limit, PLACES_CONFIG.MAX_RESULTS),
          category
        );

        console.log(
          `[searchByCategory] Type ${type} returned ${results.length} results`
        );

        const filteredResults = results.filter((restaurant) => {
          const passesRating = !restaurant.rating || restaurant.rating >= minRating;
          const passesPriceLevel = 
            !priceLevel || 
            !restaurant.priceLevel || 
            priceLevel.includes(restaurant.priceLevel);
          
          if (!passesRating) {
            console.log(
              `[searchByCategory] Filtered out ${restaurant.name} - rating ${restaurant.rating} < ${minRating}`
            );
          }
          
          if (!passesPriceLevel) {
            console.log(
              `[searchByCategory] Filtered out ${restaurant.name} - priceLevel ${restaurant.priceLevel} not in ${priceLevel}`
            );
          }
          
          return passesRating && passesPriceLevel;
        });

        console.log(
          `[searchByCategory] After filters: ${filteredResults.length} results`
        );

        restaurants.push(...filteredResults);

        // Si ya tenemos suficientes resultados, no buscar más
        if (restaurants.length >= limit) {
          console.log(
            `[searchByCategory] Reached limit of ${limit}, stopping search`
          );
          break;
        }
      } catch (error) {
        console.error(
          `[searchByCategory] Error searching for type ${type}:`,
          error
        );
      }
    }

    return restaurants.slice(0, limit);
  }

  /**
   * Realiza una búsqueda cercana usando Places API (New)
   */
  private async nearbySearch(
    coordinates: ICoordinates,
    radiusKm: number,
    includedType: string,
    maxResults: number,
    forcedCategory: RestaurantCategory
  ): Promise<RestaurantResponse[]> {
    const url = `${this.baseUrl}/places:searchNearby`;

    const requestBody = {
      includedTypes: [includedType],
      maxResultCount: maxResults,
      locationRestriction: {
        circle: {
          center: {
            latitude: coordinates.lat,
            longitude: coordinates.lng,
          },
          radius: kmToMeters(radiusKm),
        },
      },
      rankPreference: "POPULARITY",
      languageCode: "es",
    };

    console.log(`[nearbySearch] Request URL: ${url}`);
    console.log(
      `[nearbySearch] Request body:`,
      JSON.stringify(requestBody, null, 2)
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
        "X-Goog-FieldMask": PLACES_CONFIG.PLACE_FIELDS.join(","),
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`[nearbySearch] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[nearbySearch] Error response:`, errorText);
      throw new Error(`Places API error: ${response.status} - ${errorText}`);
    }

    const data: GooglePlacesSearchResponse = await response.json();

    if (!data.places || data.places.length === 0) {
      console.log(`[nearbySearch] No places found in response`);
      return [];
    }

    console.log(`[nearbySearch] Found ${data.places.length} places`);

    const transformedRestaurants = data.places
      .map((place) => this.transformGooglePlace(place, forcedCategory))
      .filter((restaurant): restaurant is RestaurantResponse => restaurant !== null);

    console.log(
      `[nearbySearch] After transformation: ${transformedRestaurants.length} valid restaurants`
    );

    return transformedRestaurants;
  }

  /**
   * Transforma un lugar de Google al formato de nuestra app
   */
  private transformGooglePlace(
    place: GooglePlace,
    forcedCategory: RestaurantCategory
  ): RestaurantResponse | null {
    console.log(
      `[transformGooglePlace] Transforming place:`,
      place.displayName?.text
    );

    if (!place.location || !place.displayName?.text) {
      console.log(`[transformGooglePlace] Missing required fields, skipping`);
      return null;
    }

    const placeId =
      place.name ||
      `place_${place.location.latitude}_${place.location.longitude}`;

    const coordinates: ICoordinates = {
      lat: place.location.latitude,
      lng: place.location.longitude,
    };

    const openingHours: IOpeningHours | undefined = place.currentOpeningHours
      ? {
          openNow: place.currentOpeningHours.openNow || false,
          weekdayText: place.currentOpeningHours.weekdayDescriptions,
        }
      : undefined;

    const photos: IPhoto[] | undefined = place.photos
      ?.slice(0, 5)
      .map((photo) => ({
        photoReference: photo.name,
        height: photo.heightPx,
        width: photo.widthPx,
      }));

    // Extraer tipos de cocina de los types
    const cuisine = this.extractCuisineTypes(place.types || []);

    return {
      placeId: placeId,
      name: place.displayName.text,
      address: place.formattedAddress || "Dirección no disponible",
      coordinates,
      category: forcedCategory,
      types: place.types || [],
      rating: place.rating,
      userRatingsTotal: place.userRatingCount,
      priceLevel: this.mapPriceLevel(place.priceLevel),
      openingHours,
      photos,
      businessStatus: place.businessStatus,
      formattedAddress: place.formattedAddress,
      internationalPhoneNumber: place.internationalPhoneNumber,
      website: place.websiteUri,
      editorialSummary: place.editorialSummary?.text,
      cuisine,
    };
  }

  /**
   * Extrae tipos de cocina de los types de Google
   */
  private extractCuisineTypes(types: string[]): string[] {
    const cuisineTypes = [
      'american_restaurant',
      'chinese_restaurant',
      'french_restaurant',
      'greek_restaurant',
      'indian_restaurant',
      'indonesian_restaurant',
      'italian_restaurant',
      'japanese_restaurant',
      'korean_restaurant',
      'lebanese_restaurant',
      'mediterranean_restaurant',
      'mexican_restaurant',
      'middle_eastern_restaurant',
      'pizza_restaurant',
      'ramen_restaurant',
      'seafood_restaurant',
      'spanish_restaurant',
      'steak_house',
      'sushi_restaurant',
      'thai_restaurant',
      'turkish_restaurant',
      'vegan_restaurant',
      'vegetarian_restaurant',
    ];

    return types.filter(type => cuisineTypes.includes(type));
  }

  /**
   * Mapea el priceLevel de Google (string) a número
   */
  private mapPriceLevel(priceLevel?: string): number | undefined {
    if (!priceLevel) return undefined;

    const mapping: Record<string, number> = {
      PRICE_LEVEL_FREE: 0,
      PRICE_LEVEL_INEXPENSIVE: 1,
      PRICE_LEVEL_MODERATE: 2,
      PRICE_LEVEL_EXPENSIVE: 3,
      PRICE_LEVEL_VERY_EXPENSIVE: 4,
    };

    return mapping[priceLevel];
  }

  /**
   * Obtiene la URL de una foto de Google Places
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 800): string {
    return `https://places.googleapis.com/v1/${photoReference}/media?maxWidthPx=${maxWidth}&key=${this.apiKey}`;
  }
}

// Export singleton
export const restaurantsService = new RestaurantsService();