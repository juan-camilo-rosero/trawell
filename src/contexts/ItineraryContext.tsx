// @/contexts/ItineraryContext.tsx

"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback
} from "react";
import {
  itineraryGeneratorService,
  GenerateItineraryRequest,
} from "@/lib/services/itinerary-generator.service";
import { IDay, ISearchParams } from "@/models/itinerary/interfaces";
import { RestaurantCategory } from "@/models/types";
import { MapMarker } from "@/models/types/map.types";
import { getAuth } from "firebase/auth";

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://trawell-yuxn.vercel.app/api";

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [itineraries, setItineraries] = useState<ItineraryData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);

  // Función auxiliar para obtener el token de Firebase
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

  // Efecto para generar marcadores cuando cambia el itinerario
  useEffect(() => {
    if (!itinerary) {
      setMapMarkers([]);
      return;
    }

    const markers: MapMarker[] = [];

    itinerary.days.forEach((day) => {
      day.items.forEach((item) => {
        // Verificar si el item tiene coordenadas válidas
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
    };

    const result = await itineraryGeneratorService.generateItinerary(request);

    const itineraryData: ItineraryData = {
      userId: itinerary?._id ? itinerary.userId : "temp-user-id",
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

    setItinerary(itineraryData);

    if (itinerary?._id && itinerary.userId !== "temp-user-id") {
      console.log("🔄 Actualizando itinerario existente en BD...");
      await updateItinerary(itinerary._id, itineraryData);
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

      const response = await fetch(`${API_BASE_URL}/itineraries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error HTTP: ${response.status}`);
      }

      // Actualizar el itinerario en el estado si es el actual
      if (itinerary?._id === id) {
        setItinerary(data.data.itinerary);
      }

      // Actualizar en la lista de itinerarios
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

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Error HTTP: ${response.status}`);
      }

      // Si el itinerario eliminado es el actual, limpiarlo
      if (itinerary?._id === id) {
        setItinerary(null);
      }

      // Remover de la lista de itinerarios
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

  const loadItinerary = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`📖 Cargando itinerario ${id}...`);

      const token = await getFirebaseToken();
      // Para itinerarios públicos, el token es opcional

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
  };

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
  };

  const value: ItineraryContextType = {
    itinerary,
    itineraries,
    isLoading,
    error,
    mapMarkers,
    generateItinerary,
    saveItinerary,
    updateItinerary,
    deleteItinerary,
    loadItinerary,
    loadUserItineraries,
    loadPublicItineraries,
    clearItinerary,
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
