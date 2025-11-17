import Link from 'next/link';
import { ItineraryLean } from '@/models/itinerary/Itinerary';
import { Calendar, Users, DollarSign } from 'lucide-react';

interface ItineraryCardProps {
  itinerary: ItineraryLean;
}

export function ItineraryCard({ itinerary }: ItineraryCardProps) {
  const startDate = new Date(itinerary.searchParams.departureDate);
  const endDate = new Date(itinerary.searchParams.returnDate);
  const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const totalTravelers = 
    itinerary.searchParams.travelers.adults +
    itinerary.searchParams.travelers.children +
    itinerary.searchParams.travelers.babies;

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: itinerary.currency || 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(itinerary.totalPrice);

  const formattedStartDate = startDate.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedEndDate = endDate.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-secondary-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
          {itinerary.title}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {durationInDays} {durationInDays === 1 ? 'día' : 'días'}
            </span>
            <span className="text-xs text-gray-400">
              ({formattedStartDate} - {formattedEndDate})
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {totalTravelers} {totalTravelers === 1 ? 'persona' : 'personas'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-900">
            <DollarSign className="w-4 h-4" />
            <span className="text-lg font-bold">{formattedPrice}</span>
          </div>
        </div>

        <Link
          href={`/dashboard/itinerary/${itinerary._id}`}
          className="primary-btn block w-full text-center"
        >
          Ver itinerario
        </Link>
      </div>
    </div>
  );
}