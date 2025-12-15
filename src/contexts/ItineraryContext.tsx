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
import { useNotifications } from "@/contexts/NotificationContext";

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
  generateItineraries: (
    params: GenerateItineraryParams,
    variants?: number
  ) => Promise<void>;
  saveItinerary: (userId: string) => Promise<boolean>;
  updateItinerary: (
    id: string,
    updates: Partial<ItineraryData>
  ) => Promise<boolean>;
  itineraryVariants: ItineraryData[];
  selectItineraryVariant: (index: number) => boolean;
  deleteItinerary: (id: string) => Promise<boolean>;
  loadItinerary: (id: string) => Promise<void>;
  loadUserItineraries: () => Promise<void>;
  loadPublicItineraries: (limit?: number, skip?: number) => Promise<void>;
  clearItinerary: () => void;
  addItemToDay: (dayNumber: number, item: IItineraryItem) => Promise<boolean>;
  deleteItemFromDay: (dayNumber: number, itemId: string) => Promise<boolean>;
  moveItemInDay: (
    dayNumber: number,
    itemId: string,
    direction: "up" | "down"
  ) => Promise<boolean>;
  addItemToPosition: (
    dayNumber: number,
    newItem: IItineraryItem,
    position: "before" | "after",
    relativeToItemId: string
  ) => Promise<boolean>;
  replaceItemInDay: (
    dayNumber: number,
    itemIdToReplace: string,
    newItem: IItineraryItem
  ) => Promise<boolean>;
  refreshAvailableOptions: () => Promise<void>;
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

function generateObjectId(): string {
  const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
  const objectId =
    timestamp +
    "xxxxxxxxxxxxxxxx"
      .replace(/[x]/g, () => {
        return ((Math.random() * 16) | 0).toString(16);
      })
      .toLowerCase();

  return objectId;
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

  const [itineraryVariants, setItineraryVariants] = useState<ItineraryData[]>([]);

  const router = useRouter();
  const { showItinerarySaved, showNotification } = useNotifications();

  const getFirebaseToken = async (): Promise<string | null> => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No authenticated user");
        return null;
      }

      const token = await user.getIdToken();
      return token;
    } catch (err) {
      console.error("Error getting Firebase token:", err);
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

      setAvailableHotels([]);
      setAvailableRestaurants([]);
      setAvailableTouristSites([]);
      setAvailableFlights([]);

      if (itinerary?._id) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...updates } = itineraryData;
        await updateItinerary(itinerary._id, updates);
      }
    } catch (err) {
      console.error("❌ Error generando itinerario:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error generating itinerary"
      );
      setItinerary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generateItineraries = async (
    params: GenerateItineraryParams,
    variants: number = 3
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: GenerateItineraryRequest = {
        ...params,
      } as GenerateItineraryRequest;

      const results = await itineraryGeneratorService.generateItineraries(
        request,
        variants
      );

      const mappedVariants: ItineraryData[] = results.map((res) => ({
        userId: "temp-user-id",
        _id: itinerary?._id,
        searchParams: res.searchParams,
        title: res.title,
        totalPrice: res.totalPrice,
        currency: res.currency,
        isPublic: false,
        days: res.days,
        createdAt: itinerary?.createdAt || new Date(),
        updatedAt: new Date(),
      }));

      setItineraryVariants(mappedVariants);

      const first = mappedVariants[0] || null;
      setItinerary(first);

      setAvailableHotels([]);
      setAvailableRestaurants([]);
      setAvailableTouristSites([]);
      setAvailableFlights([]);
    } catch (err) {
      console.error("❌ Error generando variantes:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
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
      setError("No active itinerary");
      return false;
    }

    try {
      const updatedDays = itinerary.days.map((day) => {
        if (day.dayNumber === dayNumber) {
          const maxOrder = Math.max(...day.items.map((item) => item.order), 0);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, ...itemWithoutId } = newItem;
          const itemWithOrder: IItineraryItem = {
            ...itemWithoutId,
            order: maxOrder + 1,
            _id: generateObjectId(),
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id: itineraryId, ...updates } = updatedItinerary;
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
      console.error("❌ Error adding item:", err);
      setError(
        err instanceof Error ? err.message : "Unknown error adding item"
      );
      return false;
    }
  };

  const replaceItemInDay = async (
    dayNumber: number,
    itemIdToReplace: string,
    newItem: IItineraryItem
  ): Promise<boolean> => {
    if (!itinerary) {
      setError("No active itinerary");
      return false;
    }

    try {
      const updatedDays = itinerary.days.map((day) => {
        if (day.dayNumber === dayNumber) {
          const items = [...day.items];
          const replaceIndex = items.findIndex(
            (item) => item.itemId === itemIdToReplace
          );

          if (replaceIndex === -1) {
            throw new Error("Item to replace not found");
          }

          const oldItem = items[replaceIndex];

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, ...itemWithoutId } = newItem;
          const itemWithOrderAndTime: IItineraryItem = {
            ...itemWithoutId,
            order: oldItem.order,
            time: oldItem.time,
            _id: generateObjectId(),
          };

          items[replaceIndex] = itemWithOrderAndTime;

          return {
            ...day,
            items,
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id: itineraryId, ...updates } = updatedItinerary;
        const success = await updateItinerary(itinerary._id, updates);

        if (!success) {
          console.error("❌ Error al actualizar en BD");
          setItinerary(itinerary);
          return false;
        }
      }

      console.log(`✅ Item reemplazado exitosamente`);
      return true;
    } catch (err) {
      console.error("❌ Error replacing item:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error replacing item"
      );
      return false;
    }
  };

  const saveItinerary = async (userId: string): Promise<boolean> => {
    if (!itinerary) {
      setError("No itinerary to save");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("💾 Guardando itinerario en la base de datos...");

      const token = await getFirebaseToken();
      if (!token) {
        setError("Could not get authentication token");
        showNotification('error', 'Authentication Error', 'Could not verify your session');
        return false;
      }

      const payload = {
        ...itinerary,
        userId,
        _id: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log("📤 Payload enviado a POST /api/itineraries:", payload);

      const response = await fetch(`${API_BASE_URL}/itineraries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Response is not JSON:", text);
        throw new Error(
          `Server response is not valid JSON. Status: ${response.status}`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        const serverMsg = data.error || `Error HTTP: ${response.status}`;
        const details = data.details ? ` - ${data.details}` : "";
        throw new Error(serverMsg + details);
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

      const destinationCity = itinerary.searchParams?.destinationCity?.name || 'tu destino';
      showItinerarySaved(destinationCity);

      router.push("/dashboard/my-trips");

      return true;
    } catch (err) {
      console.error("❌ Error saving itinerary:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error saving itinerary";
      setError(errorMessage);
      
      showNotification(
        'error',
        'Error saving itinerary',
        errorMessage
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
        setError("Could not get authentication token");
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
      console.error("❌ Error updating itinerary:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error updating itinerary"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItemFromDay = async (
    dayNumber: number,
    itemId: string
  ): Promise<boolean> => {
    if (!itinerary) {
      setError("No active itinerary");
      return false;
    }

    try {
      const updatedDays = itinerary.days.map((day) => {
        if (day.dayNumber === dayNumber) {
          const filteredItems = day.items.filter(
            (item) => item.itemId !== itemId
          );

          const reorderedItems = filteredItems.map((item, index) => ({
            ...item,
            order: index + 1,
          }));

          return {
            ...day,
            items: reorderedItems,
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id: itineraryId, ...updates } = updatedItinerary;
        const success = await updateItinerary(itinerary._id, updates);

        if (!success) {
          console.error("❌ Error al actualizar en BD");
          setItinerary(itinerary);
          return false;
        }
      }

      console.log(`✅ Item eliminado del día ${dayNumber} exitosamente`);
      return true;
    } catch (err) {
      console.error("❌ Error deleting item:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error deleting item"
      );
      return false;
    }
  };

  const moveItemInDay = async (
    dayNumber: number,
    itemId: string,
    direction: "up" | "down"
  ): Promise<boolean> => {
    if (!itinerary) {
      setError("No active itinerary");
      return false;
    }

    try {
      const updatedDays = itinerary.days.map((day) => {
        if (day.dayNumber === dayNumber) {
          const items = [...day.items];
          const currentIndex = items.findIndex(
            (item) => item.itemId === itemId
          );

          if (currentIndex === -1) {
            throw new Error("Item not found");
          }

          const targetIndex =
            direction === "up" ? currentIndex - 1 : currentIndex + 1;

          if (targetIndex < 0 || targetIndex >= items.length) {
            throw new Error("Invalid move");
          }

          [items[currentIndex], items[targetIndex]] = [
            items[targetIndex],
            items[currentIndex],
          ];

          const tempOrder = items[currentIndex].order;
          items[currentIndex].order = items[targetIndex].order;
          items[targetIndex].order = tempOrder;

          const tempTime = items[currentIndex].time;
          items[currentIndex].time = items[targetIndex].time;
          items[targetIndex].time = tempTime;

          return {
            ...day,
            items,
          };
        }
        return day;
      });

      const updatedItinerary: ItineraryData = {
        ...itinerary,
        days: updatedDays,
        updatedAt: new Date(),
      };

      setItinerary(updatedItinerary);

      if (itinerary._id) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id: itineraryId, ...updates } = updatedItinerary;
        const success = await updateItinerary(itinerary._id, updates);

        if (!success) {
          console.error("❌ Error al actualizar en BD");
          setItinerary(itinerary);
          return false;
        }
      }

      console.log(
        `✅ Item movido ${direction === "up" ? "arriba" : "abajo"} exitosamente`
      );
      return true;
    } catch (err) {
      console.error("❌ Error moving item:", err);
      setError(
        err instanceof Error ? err.message : "Unknown error moving item"
      );
      return false;
    }
  };

  const addItemToPosition = async (
    dayNumber: number,
    newItem: IItineraryItem,
    position: "before" | "after",
    relativeToItemId: string
  ): Promise<boolean> => {
    if (!itinerary) {
      setError("No active itinerary");
      return false;
    }

    try {
      const updatedDays = itinerary.days.map((day) => {
        if (day.dayNumber === dayNumber) {
          const items = [...day.items];
          const relativeIndex = items.findIndex(
            (item) => item.itemId === relativeToItemId
          );

          if (relativeIndex === -1) {
            throw new Error("Reference item not found");
          }

          const insertIndex =
            position === "before" ? relativeIndex : relativeIndex + 1;

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { _id, ...itemWithoutId } = newItem;
          const itemWithOrder: IItineraryItem = {
            ...itemWithoutId,
            order: insertIndex + 1,
            _id: generateObjectId(),
          };

          items.splice(insertIndex, 0, itemWithOrder);

          const reorderedItems = items.map((item, index) => ({
            ...item,
            order: index + 1,
          }));

          return {
            ...day,
            items: reorderedItems,
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id: itineraryId, ...updates } = updatedItinerary;
        const success = await updateItinerary(itinerary._id, updates);

        if (!success) {
          console.error("❌ Error al actualizar en BD");
          setItinerary(itinerary);
          return false;
        }
      }

      console.log(
        `✅ Item añadido ${
          position === "before" ? "antes" : "después"
        } exitosamente`
      );
      return true;
    } catch (err) {
      console.error("❌ Error adding item at position:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error adding item at position"
      );
      return false;
    }
  };

  const deleteItinerary = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🗑️ Eliminando itinerario ${id}...`);

      const token = await getFirebaseToken();
      if (!token) {
        setError("Could not get authentication token");
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
      console.error("❌ Error deleting itinerary:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error deleting itinerary"
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
      console.error("❌ Error loading itinerary:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error loading itinerary"
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
        setError("Could not get authentication token");
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
      console.error("❌ Error loading itineraries:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error loading itineraries"
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
      console.error("❌ Error loading public itineraries:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unknown error loading public itineraries"
      );
      setItineraries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAvailableOptions = async (): Promise<void> => {
    if (!itinerary) return;

    setIsLoading(true);
    try {
      console.log("🔄 Actualizando opciones disponibles...");
      
      const request: GenerateItineraryRequest = {
        originCityName: itinerary.searchParams.originCity.name,
        originCoordinates: itinerary.searchParams.originCity.coordinates,
        originPlaceId: itinerary.searchParams.originCity.placeId,
        destinationCityName: itinerary.searchParams.destinationCity.name,
        destinationCoordinates: itinerary.searchParams.destinationCity.coordinates,
        destinationPlaceId: itinerary.searchParams.destinationCity.placeId,
        departureDate: new Date(itinerary.searchParams.departureDate),
        returnDate: new Date(itinerary.searchParams.returnDate),
        adults: itinerary.searchParams.travelers.adults,
        children: itinerary.searchParams.travelers.children,
        babies: itinerary.searchParams.travelers.babies,
        travelType: itinerary.searchParams.travelType,
        foodPreferences: ["local", "casual"], // Default if not saved
        currency: itinerary.currency,
      } as GenerateItineraryRequest;

      const result = await itineraryGeneratorService.fetchAvailableResources(request);
      
      setAvailableHotels(result.availableHotels);
      setAvailableRestaurants(result.availableRestaurants);
      setAvailableTouristSites(result.availableTouristSites);
      setAvailableFlights(result.availableFlights);
      
      console.log("✅ Opciones actualizadas exitosamente");
    } catch (err) {
      console.error("❌ Error actualizando opciones:", err);
      // No seteamos error global para no interrumpir la experiencia si falla esto
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

  const selectItineraryVariant = (index: number): boolean => {
    if (index < 0 || index >= itineraryVariants.length) {
      setError("Variante no encontrada");
      return false;
    }

    const variant = itineraryVariants[index];
    setItinerary(variant);

    setAvailableHotels([]);
    setAvailableRestaurants([]);
    setAvailableTouristSites([]);
    setAvailableFlights([]);

    setError(null);
    return true;
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
    generateItineraries,
    itineraryVariants,
    selectItineraryVariant,
    saveItinerary,
    updateItinerary,
    deleteItinerary,
    loadItinerary,
    loadUserItineraries,
    loadPublicItineraries,
    refreshAvailableOptions,
    clearItinerary,
    addItemToDay,
    deleteItemFromDay,
    moveItemInDay,
    addItemToPosition,
    replaceItemInDay,
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