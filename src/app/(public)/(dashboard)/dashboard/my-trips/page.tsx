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

  const handleDelete = () => {
    fetchItineraries(currentPage);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-2">
          Itinerary History
        </h1>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <ItineraryCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-1">
              Error loading itineraries
            </h3>
            <p className="text-red-700">{error}</p>
            <Button
              onClick={() => fetchItineraries(currentPage)}
              className="mt-4"
              variant="outline"
            >
              Try again
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !error && itineraries.length === 0 && (
        <div className="bg-secondary-200 border border-gray-200 rounded-lg p-12 text-center">
          <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {"You don't have any itineraries yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            Start planning your next adventure by creating your first itinerary
          </p>
          <Button className="primary-btn">Create itinerary</Button>
        </div>
      )}

      {!isLoading && !error && itineraries.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {itineraries.map((itinerary) => (
              <ItineraryCard
                key={itinerary._id.toString()}
                itinerary={itinerary}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {pagination && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                variant="outline"
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <span className="text-xs text-gray-400">
                  ({pagination.total}{" "}
                  {pagination.total === 1 ? "itinerary" : "itineraries"})
                </span>
              </div>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasMore}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Page;