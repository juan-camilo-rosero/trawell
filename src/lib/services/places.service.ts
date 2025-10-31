// src/lib/services/places.service.ts

import {
  GetTouristSitesRequest,
  TouristSiteResponse,
  TouristSiteCategory,
  ICoordinates,
  IPhoto,
  IOpeningHours,
} from "@/models/types";
import {
  PLACES_CONFIG,
  kmToMeters,
  determineCategory,
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

export class PlacesService {
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
      "[PlacesService] Initialized with API key:",
      this.apiKey.substring(0, 10) + "..."
    );
  }

  /**
   * Busca sitios turísticos en una ciudad
   */
  async searchTouristSites(
    request: GetTouristSitesRequest
  ): Promise<TouristSiteResponse[]> {
    const {
      cityName,
      coordinates,
      categories = ["museum", "park", "monument", "historical"],
      limit = PLACES_CONFIG.DEFAULT_LIMIT_PER_CATEGORY,
      minRating = PLACES_CONFIG.DEFAULT_MIN_RATING,
      radiusKm = PLACES_CONFIG.DEFAULT_RADIUS_KM,
    } = request;

    console.log("[searchTouristSites] Starting search with params:", {
      cityName,
      coordinates,
      categories,
      limit,
      minRating,
      radiusKm,
    });

    const allSites: TouristSiteResponse[] = [];
    const seenPlaceIds = new Set<string>();

    // Buscar por cada categoría
    for (const category of categories) {
      console.log(`[searchTouristSites] Searching category: ${category}`);

      const sitesForCategory = await this.searchByCategory(
        category,
        coordinates,
        radiusKm,
        limit,
        minRating
      );

      console.log(
        `[searchTouristSites] Found ${sitesForCategory.length} sites for category ${category}`
      );

      // Filtrar duplicados
      for (const site of sitesForCategory) {
        if (!seenPlaceIds.has(site.placeId)) {
          seenPlaceIds.add(site.placeId);
          allSites.push(site);
        }
      }
    }

    console.log(
      `[searchTouristSites] Total unique sites found: ${allSites.length}`
    );

    // Ordenar por rating descendente
    return allSites.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  /**
   * Busca sitios de una categoría específica
   */
  private async searchByCategory(
    category: TouristSiteCategory,
    coordinates: ICoordinates,
    radiusKm: number,
    limit: number,
    minRating: number
  ): Promise<TouristSiteResponse[]> {
    const types = PLACES_CONFIG.CATEGORY_TYPES[category];
    const sites: TouristSiteResponse[] = [];

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
          category // PASS CATEGORY HERE
        );

        console.log(
          `[searchByCategory] Type ${type} returned ${results.length} results`
        );

        const filteredResults = results.filter((site) => {
          const passesRating = !site.rating || site.rating >= minRating;
          if (!passesRating) {
            console.log(
              `[searchByCategory] Filtered out ${site.name} - rating ${site.rating} < ${minRating}`
            );
          }
          return passesRating;
        });

        console.log(
          `[searchByCategory] After rating filter: ${filteredResults.length} results`
        );

        sites.push(...filteredResults);

        // Si ya tenemos suficientes resultados, no buscar más
        if (sites.length >= limit) {
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

    return sites.slice(0, limit);
  }

  /**
   * Realiza una búsqueda cercana usando Places API (New)
   */
  private async nearbySearch(
    coordinates: ICoordinates,
    radiusKm: number,
    includedType: string,
    maxResults: number,
    forcedCategory: TouristSiteCategory // ADD THIS PARAMETER
  ): Promise<TouristSiteResponse[]> {
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
    };

    console.log(`[nearbySearch] Request URL: ${url}`);
    console.log(
      `[nearbySearch] Request body:`,
      JSON.stringify(requestBody, null, 2)
    );
    console.log(
      `[nearbySearch] FieldMask:`,
      PLACES_CONFIG.PLACE_FIELDS.join(",")
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
    console.log(`[nearbySearch] Response data:`, JSON.stringify(data, null, 2));

    if (!data.places || data.places.length === 0) {
      console.log(`[nearbySearch] No places found in response`);
      return [];
    }

    console.log(`[nearbySearch] Found ${data.places.length} places`);

    const transformedSites = data.places
      .map((place) => this.transformGooglePlace(place, forcedCategory)) // PASS CATEGORY HERE
      .filter((site): site is TouristSiteResponse => site !== null);

    console.log(
      `[nearbySearch] After transformation: ${transformedSites.length} valid sites`
    );

    return transformedSites;
  }

  /**
   * Transforma un lugar de Google al formato de nuestra app
   */
  private transformGooglePlace(
    place: GooglePlace,
    forcedCategory: TouristSiteCategory // ADD THIS PARAMETER
  ): TouristSiteResponse | null {
    console.log(
      `[transformGooglePlace] Transforming place:`,
      place.displayName?.text
    );

    if (!place.location || !place.displayName?.text || !place.name) {
      console.log(`[transformGooglePlace] Missing required fields, skipping`);
      return null;
    }

    // Use forced category instead of trying to determine it
    console.log(
      `[transformGooglePlace] Using forced category: ${forcedCategory}`
    );

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

    return {
      placeId: place.name,
      name: place.displayName.text,
      address: place.formattedAddress || "Dirección no disponible",
      coordinates,
      category: forcedCategory, // USE FORCED CATEGORY
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
    };
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
export const placesService = new PlacesService();
