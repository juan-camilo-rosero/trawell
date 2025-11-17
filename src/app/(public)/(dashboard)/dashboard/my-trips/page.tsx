"use client";

import { useUser } from "@/contexts/UserContext";
import { useItineraries } from "@/hooks/use-itineraries";
import { ItineraryCard } from "@/components/dashboard/ItineraryCard";
import { ItineraryCardSkeleton } from "@/components/dashboard/ItineraryCardSkeleton";
import { AlertCircle, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";

function Page() {
  const { userData, isLoading: userLoading } = useUser();
  const {
    itineraries,
    isLoading: itinerariesLoading,
    error,
    pagination,
    fetchItineraries,
  } = useItineraries(userData?.firebaseUid);

  const isLoading = userLoading || itinerariesLoading;

  // Calcular página actual
  const currentPage = pagination
    ? Math.floor(pagination.skip / pagination.limit)
    : 0;
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 0;

  const handlePageChange = (newPage: number) => {
    fetchItineraries(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Mis viajes
        </h1>
        <p className="text-gray-600">
          Explora y gestiona todos tus itinerarios de viaje
        </p>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <ItineraryCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Estado de error */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-1">
              Error al cargar itinerarios
            </h3>
            <p className="text-red-700">{error}</p>
            <Button
              onClick={() => fetchItineraries(currentPage)}
              className="mt-4"
              variant="outline"
            >
              Intentar nuevamente
            </Button>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!isLoading && !error && itineraries.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tienes itinerarios aún
          </h3>
          <p className="text-gray-600 mb-6">
            Comienza a planificar tu próxima aventura creando tu primer
            itinerario
          </p>
          <Button className="primary-btn">Crear itinerario</Button>
        </div>
      )}

      {/* Grid de itinerarios */}
      {!isLoading && !error && itineraries.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {itineraries.map((itinerary) => (
              <ItineraryCard
                key={itinerary._id.toString()} // ← FIX
                itinerary={itinerary}
              />
            ))}
          </div>

          {/* Paginación */}
          {pagination && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                variant="outline"
              >
                Anterior
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Página {currentPage + 1} de {totalPages}
                </span>
                <span className="text-xs text-gray-400">
                  ({pagination.total}{" "}
                  {pagination.total === 1 ? "itinerario" : "itinerarios"})
                </span>
              </div>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasMore}
                variant="outline"
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Page;
