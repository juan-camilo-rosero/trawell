export function ItineraryCardSkeleton() {
  return (
    <div className="bg-secondary-100 rounded-lg p-6 shadow-sm animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        </div>

        <div className="h-10 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}