import mongoose, { Model } from 'mongoose';
import { IItinerary } from './itinerary/interfaces';
import { ItinerarySchema } from './itinerary/schemas';

// Prevent model recompilation in Next.js hot reload
const Itinerary: Model<IItinerary> =
  mongoose.models.Itinerary || mongoose.model<IItinerary>('Itinerary', ItinerarySchema);

export default Itinerary;

// Export all types
export * from './itinerary/interfaces';
export * from './types';