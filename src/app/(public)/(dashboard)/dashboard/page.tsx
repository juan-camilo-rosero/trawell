"use client";

import Banner from "@/components/dashboard/home/Banner";
import { useUser } from "@/contexts/UserContext";
import { useItineraries } from "@/hooks/use-itineraries";
import { ItineraryCard } from "@/components/dashboard/ItineraryCard";
import { ItineraryCardSkeleton } from "@/components/dashboard/ItineraryCardSkeleton";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  const { userData, isLoading: userLoading } = useUser();
  const {
    itineraries,
    isLoading: itinerariesLoading,
    error,
    fetchItineraries,
  } = useItineraries(userData?.firebaseUid, 4);

  const isLoading = userLoading || itinerariesLoading;

  const handleDelete = () => {
    fetchItineraries(0);
  };

  return (
    <>
      <Banner />
      
      <div className="container mx-auto py-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Tus últimos viajes
          </h2>
          {!isLoading && !error && itineraries.length > 0 && (
            <Link href="/dashboard/my-trips">
              <Button variant="ghost" className="gap-2 text-muted">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <ItineraryCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                Error al cargar itinerarios
              </h3>
              <p className="text-red-700">{error}</p>
              <Button
                onClick={() => fetchItineraries(0)}
                className="mt-4"
                variant="outline"
              >
                Intentar nuevamente
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && itineraries.length === 0 && (
          <div className="bg-secondary-200 border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600 mb-6">
              Aún no tienes itinerarios. Comienza a planificar tu próxima aventura.
            </p>
            <Button className="primary-btn">Crear itinerario</Button>
          </div>
        )}

        {!isLoading && !error && itineraries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {itineraries.map((itinerary) => (
              <ItineraryCard
                key={itinerary._id.toString()}
                itinerary={itinerary}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}