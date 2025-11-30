"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import {
  itineraryGeneratorService,
  GenerateItineraryRequest,
  GenerateItineraryResponse,
} from "@/lib/services/itinerary-generator.service";
import {
  HotelResponse,
  RestaurantResponse,
  TouristSiteResponse,
  FlightResponse,
} from "@/models/types";
import {
  IDay,
  ISearchParams,
  IItineraryItem,
} from "@/models/itinerary/interfaces";
import { RestaurantCategory } from "@/models/types";
import { MapMarker } from "@/models/types/map.types";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";

export interface ItineraryData {
  _id?: string;
  userId: string;
  searchParams: ISearchParams;
  title: string;
  totalPrice: number;
  currency: string;
  isPublic: boolean;
  days: IDay[];
  lastViewedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ItineraryContextType {
  itinerary: ItineraryData | null;
  itineraries: ItineraryData[];
  isLoading: boolean;
  error: string | null;
  mapMarkers: MapMarker[];
  availableHotels: HotelResponse[];
  availableRestaurants: RestaurantResponse[];
  availableTouristSites: TouristSiteResponse[];
  availableFlights: FlightResponse[];
  generateItinerary: (params: GenerateItineraryParams) => Promise<void>;
  saveItinerary: (userId: string) => Promise<boolean>;
  updateItinerary: (
    id: string,
    updates: Partial<ItineraryData>
  ) => Promise<boolean>;
  deleteItinerary: (id: string) => Promise<boolean>;
  loadItinerary: (id: string) => Promise<void>;
  loadUserItineraries: () => Promise<void>;
  loadPublicItineraries: (limit?: number, skip?: number) => Promise<void>;
  clearItinerary: () => void;
  addItemToDay: (dayNumber: number, item: IItineraryItem) => Promise<boolean>;
}

export interface GenerateItineraryParams {
  originCityName: string;
  originCoordinates: { lat: number; lng: number };
  originPlaceId?: string;
  destinationCityName: string;
  destinationCoordinates: { lat: number; lng: number };
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

  cabinClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  maxStops?: number;
  budget?: number;
  hotelBudgetPerNight?: number;
  preferredHotelChains?: string[];
  currency?: string;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(
  undefined
);

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://trawell-yuxn.vercel.app/api";

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [itineraries, setItineraries] = useState<ItineraryData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);

  const [availableHotels, setAvailableHotels] = useState<HotelResponse[]>([]);
  const [availableRestaurants, setAvailableRestaurants] = useState<
    RestaurantResponse[]
  >([]);
  const [availableTouristSites, setAvailableTouristSites] = useState<
    TouristSiteResponse[]
  >([]);
  const [availableFlights, setAvailableFlights] = useState<FlightResponse[]>(
    []
  );

  const router = useRouter();

  const getFirebaseToken = async (): Promise<string | null> => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No hay usuario autenticado");
        return null;
      }

      const token = await user.getIdToken();
      return token;
    } catch (err) {
      console.error("Error obteniendo token de Firebase:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!itinerary) {
      setMapMarkers([]);
      return;
    }

    const markers: MapMarker[] = [];

    itinerary.days.forEach((day) => {
      day.items.forEach((item) => {
        if (
          !item.location?.coordinates?.lat ||
          !item.location?.coordinates?.lng
        ) {
          return;
        }

        const baseMarker = {
          id: `${item.itemId}-${day.dayNumber}`,
          itemId: item.itemId,
          type: item.type,
          coordinates: item.location.coordinates,
          title: item.title,
          address: item.location.address,
          dayNumber: day.dayNumber,
        };

        if (item.type === "tourist_site" && item.touristSiteDetails?.category) {
          markers.push({
            ...baseMarker,
            category: item.touristSiteDetails.category,
          });
        } else {
          markers.push(baseMarker);
        }
      });
    });

    console.log(`📍 Generados ${markers.length} marcadores para el mapa`);
    setMapMarkers(markers);
  }, [itinerary]);

  const generateItinerary = async (params: GenerateItineraryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🚀 Generando itinerario desde contexto...");

      const request: GenerateItineraryRequest = {
        ...params,
      } as GenerateItineraryRequest;

      const result: GenerateItineraryResponse =
        await itineraryGeneratorService.generateItinerary(request);

      const itineraryData: ItineraryData = {
        userId: "temp-user-id",
        _id: itinerary?._id,
        searchParams: result.searchParams,
        title: result.title,
        totalPrice: result.totalPrice,
        currency: result.currency,
        isPublic: false,
        days: result.days,
        createdAt: itinerary?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        itineraryData.userId = user.uid;
      }

      setItinerary(itineraryData);

      setAvailableHotels(result.availableHotels || []);
      setAvailableRestaurants(result.availableRestaurants || []);
      setAvailableTouristSites(result.availableTouristSites || []);
      setAvailableFlights(result.availableFlights || []);

      console.log("📦 Opciones disponibles guardadas:");
      console.log("  - Hoteles:", result.availableHotels?.length || 0);
      console.log(
        "  - Restaurantes:",
        result.availableRestaurants?.length || 0
      );
      console.log(
        "  - Sitios turísticos:",
        result.availableTouristSites?.length || 0
      );

      if (itinerary?._id) {
        console.log("🔄 Actualizando itinerario existente en BD...");
        const { _id, ...updates } = itineraryData;
        await updateItinerary(itinerary._id, updates);
      }

      console.log("✅ Itinerario generado y guardado en contexto");
    } catch (err) {
      console.error("❌ Error generando itinerario:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al generar itinerario"
      );
      setItinerary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const addItemToDay = async (
  dayNumber: number,
  newItem: IItineraryItem
): Promise<boolean> => {
  if (!itinerary) {
    setError("No hay itinerario activo");
    return false;
  }

  try {
    const updatedDays = itinerary.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        const maxOrder = Math.max(...day.items.map((item) => item.order), 0);
        
        const { _id, ...itemWithoutId } = newItem;
        const itemWithOrder: IItineraryItem = {
          ...itemWithoutId,
          order: maxOrder + 1,
          _id: generateObjectId().toString(),
        };

        return {
          ...day,
          items: [...day.items, itemWithOrder],
        };
      }
      return day;
    });

    const newTotalPrice = updatedDays.reduce((total, day) => {
      return (
        total + day.items.reduce((dayTotal, item) => dayTotal + item.price, 0)
      );
    }, 0);

    const updatedItinerary: ItineraryData = {
      ...itinerary,
      days: updatedDays,
      totalPrice: Math.round(newTotalPrice),
      updatedAt: new Date(),
    };

    setItinerary(updatedItinerary);

    if (itinerary._id) {
      const { _id, ...updates } = updatedItinerary;
      const success = await updateItinerary(itinerary._id, updates);
      
      if (!success) {
        console.error("❌ Error al actualizar en BD");
        setItinerary(itinerary);
        return false;
      }
    }

    console.log(`✅ Item añadido al día ${dayNumber} exitosamente`);
    return true;
  } catch (err) {
    console.error("❌ Error añadiendo item:", err);
    setError(
      err instanceof Error
        ? err.message
        : "Error desconocido al añadir item"
    );
    return false;
  }
};

  const saveItinerary = async (userId: string): Promise<boolean> => {
    if (!itinerary) {
      setError("No hay itinerario para guardar");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("💾 Guardando itinerario en la base de datos...");

      const token = await getFirebaseToken();
      if (!token) {
        setError("No se pudo obtener el token de autenticación");
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/itineraries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...itinerary,
          userId,
          _id: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Response no es JSON:", text);
        throw new Error(
          `La respuesta del servidor no es JSON válida. Status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error HTTP: ${response.status}`);
      }

      setItinerary({
        ...itinerary,
        _id: data.data.itinerary._id,
        userId,
      });

      console.log(
        "✅ Itinerario guardado exitosamente con ID:",
        data.data.itinerary._id
      );

      router.push("/dashboard/my-trips");

      return true;
    } catch (err) {
      console.error("❌ Error guardando itinerario:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al guardar itinerario"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItinerary = async (
    id: string,
    updates: Partial<ItineraryData>
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`📝 Actualizando itinerario ${id}...`);

      const token = await getFirebaseToken();
      if (!token) {
        setError("No se pudo obtener el token de autenticación");
        return false;
      }

      const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date(),
      };

      const response = await fetch(`${API_BASE_URL}/itineraries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatesWithTimestamp),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error HTTP: ${response.status}`);
      }

      if (itinerary?._id === id) {
        setItinerary(data.data.itinerary);
      }

      setItineraries((prev) =>
        prev.map((item) => (item._id === id ? data.data.itinerary : item))
      );

      console.log("✅ Itinerario actualizado exitosamente");
      return true;
    } catch (err) {
      console.error("❌ Error actualizando itinerario:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al actualizar itinerario"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItinerary = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🗑️ Eliminando itinerario ${id}...`);

      const token = await getFirebaseToken();
      if (!token) {
        setError("No se pudo obtener el token de autenticación");
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/itineraries/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.error || `Error HTTP: ${response.status}`);
        }
        throw new Error(`Error HTTP: ${response.status}`);
      }

      if (itinerary?._id === id) {
        setItinerary(null);
      }

      setItineraries((prev) => prev.filter((item) => item._id !== id));

      console.log("✅ Itinerario eliminado exitosamente");
      return true;
    } catch (err) {
      console.error("❌ Error eliminando itinerario:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al eliminar itinerario"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadItinerary = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`📖 Cargando itinerario ${id}...`);

      const token = await getFirebaseToken();

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/itineraries/${id}`, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error HTTP: ${response.status}`);
      }

      setItinerary(data.data.itinerary);
      console.log("✅ Itinerario cargado exitosamente");
    } catch (err) {
      console.error("❌ Error cargando itinerario:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar itinerario"
      );
      setItinerary(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserItineraries = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("📚 Cargando itinerarios del usuario...");

      const token = await getFirebaseToken();
      if (!token) {
        setError("No se pudo obtener el token de autenticación");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/itineraries`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error HTTP: ${response.status}`);
      }

      setItineraries(data.data.itineraries);
      console.log(
        `✅ ${data.data.itineraries.length} itinerarios cargados exitosamente`
      );
    } catch (err) {
      console.error("❌ Error cargando itinerarios:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar itinerarios"
      );
      setItineraries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPublicItineraries = async (
    limit: number = 10,
    skip: number = 0
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🌍 Cargando itinerarios públicos...");

      const response = await fetch(
        `${API_BASE_URL}/itineraries?public=true&limit=${limit}&skip=${skip}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error HTTP: ${response.status}`);
      }

      setItineraries(data.data.itineraries);
      console.log(
        `✅ ${data.data.itineraries.length} itinerarios públicos cargados exitosamente`
      );
    } catch (err) {
      console.error("❌ Error cargando itinerarios públicos:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar itinerarios públicos"
      );
      setItineraries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearItinerary = () => {
    setItinerary(null);
    setError(null);
    setMapMarkers([]);
    setAvailableHotels([]);
    setAvailableRestaurants([]);
    setAvailableTouristSites([]);
    setAvailableFlights([]);
  };

  const value: ItineraryContextType = {
    itinerary,
    itineraries,
    isLoading,
    error,
    mapMarkers,
    availableHotels,
    availableRestaurants,
    availableTouristSites,
    availableFlights,
    generateItinerary,
    saveItinerary,
    updateItinerary,
    deleteItinerary,
    loadItinerary,
    loadUserItineraries,
    loadPublicItineraries,
    clearItinerary,
    addItemToDay,
  };

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const context = useContext(ItineraryContext);

  if (context === undefined) {
    throw new Error(
      "useItinerary debe ser usado dentro de un ItineraryProvider"
    );
  }

  return context;
}
