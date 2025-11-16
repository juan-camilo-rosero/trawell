'use client'

interface ItineraryViewProps {
  destination: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  totalPassengers: number;
  coordinates: {
    lat: number;
    lng: number;
  } | undefined;
}

function ItineraryView({ destination, startDate, endDate, totalPassengers, coordinates }: ItineraryViewProps) {
  const formatDateRange = (start: Date | undefined, end: Date | undefined): string => {
    if (!start || !end) return '';
    
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    const startDay = start.getDate();
    const startMonth = months[start.getMonth()];
    const endDay = end.getDate();
    const endMonth = months[end.getMonth()];
    
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  };

  const getMapUrl = () => {
    if (!coordinates) return '';
    const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${coordinates.lat},${coordinates.lng}&zoom=12`;
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="bg-secondary-200 rounded-lg p-6 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Viaje a {destination}</h2>
        
        <div className="bg-secondary-100 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-600">{formatDateRange(startDate, endDate)}</span>
          <div className="w-px h-6 bg-muted-500 rounded-full"></div>
          <span className="text-sm text-muted-600">{totalPassengers} {totalPassengers === 1 ? 'persona' : 'personas'}</span>
        </div>
      </div>

      <div className="lg:hidden w-full h-[35vh] rounded-lg overflow-hidden">
        {coordinates && (
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={getMapUrl()}
          />
        )}
      </div>
    </div>
  );
}

export default ItineraryView;