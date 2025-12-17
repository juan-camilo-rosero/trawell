import { Schema } from 'mongoose';

// Reusable coordinate schema
const CoordinatesSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

// Location schema (without address)
const LocationSchema = new Schema(
  {
    name: { type: String, required: true },
    coordinates: { type: CoordinatesSchema, required: true },
    placeId: { type: String },
  },
  { _id: false }
);

// Location schema with address
const LocationWithAddressSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: { type: CoordinatesSchema, required: true },
    placeId: { type: String },
  },
  { _id: false }
);

// Travelers schema
const TravelersSchema = new Schema(
  {
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    babies: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

// Search params schema
const SearchParamsSchema = new Schema(
  {
    originCity: { type: LocationSchema, required: true },
    destinationCity: { type: LocationSchema, required: true },
    departureDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    travelers: { type: TravelersSchema, required: true },
    travelType: { type: String, required: true },
  },
  { _id: false }
);

// Flight details schema
const FlightDetailsSchema = new Schema(
  {
    carrierCode: { type: String, required: true },
    carrierName: { type: String, required: true },
    flightNumber: { type: String },
    departureAirport: { type: String, required: true },
    departureAirportName: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalAirport: { type: String, required: true },
    arrivalAirportName: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: String, required: true },
    numberOfStops: { type: Number, required: true, min: 0 },
    pricePerPerson: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// Accommodation details schema
const AccommodationDetailsSchema = new Schema(
  {
    hotelId: { type: String, required: true },
    hotelName: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },
    roomType: { type: String, required: true },
  },
  { _id: false }
);

// Opening hours schema
const OpeningHoursSchema = new Schema(
  {
    openNow: { type: Boolean, required: true },
    weekdayText: [{ type: String }],
  },
  { _id: false }
);

// Food details schema
const FoodDetailsSchema = new Schema(
  {
    restaurantName: { type: String, required: true },
    cuisine: { type: String, required: true },
    mealType: {
      type: String,
      required: true,
      enum: ['desayuno', 'almuerzo', 'cena', 'snack'],
    },
    priceLevel: { type: Number, required: true, min: 0, max: 4 },
    rating: { type: Number, required: true, min: 0, max: 5 },
    userRatingsTotal: { type: Number, required: true, min: 0 },
    openingHours: { type: OpeningHoursSchema },
  },
  { _id: false }
);

// Photo schema
const PhotoSchema = new Schema(
  {
    photoReference: { type: String, required: true },
    height: { type: Number, required: true },
    width: { type: Number, required: true },
  },
  { _id: false }
);

// Tourist site details schema
const TouristSiteDetailsSchema = new Schema(
  {
    siteName: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['museum', 'park', 'monument', 'historical'],
    },
    types: [{ type: String, required: true }],
    rating: { type: Number, min: 0, max: 5 },
    userRatingsTotal: { type: Number, min: 0 },
    entryFee: { type: Number, required: true, min: 0 },
    hasFee: { type: Boolean, required: true },
    estimatedDuration: { type: String, required: true },
    openingHours: { type: OpeningHoursSchema },
    photos: [PhotoSchema],
  },
  { _id: false }
);

// Itinerary item schema
const ItineraryItemSchema = new Schema({
  itemId: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['flight', 'accommodation', 'food', 'tourist_site'],
  },
  order: { type: Number, required: true, min: 1 },
  time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  location: { type: LocationWithAddressSchema, required: true },
  flightDetails: { type: FlightDetailsSchema },
  accommodationDetails: { type: AccommodationDetailsSchema },
  foodDetails: { type: FoodDetailsSchema },
  touristSiteDetails: { type: TouristSiteDetailsSchema },
});

// Day schema
const DaySchema = new Schema({
  dayNumber: { type: Number, required: true, min: 1 },
  date: { type: Date, required: true },
  items: [ItineraryItemSchema],
});

// Main itinerary schema
export const ItinerarySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    searchParams: {
      type: SearchParamsSchema,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'COP',
    },
    isPublic: {
      type: Boolean,
      required: true,
      default: false,
    },
    days: [DaySchema],
    availableResources: {
      flights: [{ type: Schema.Types.Mixed }],
      hotels: [{ type: Schema.Types.Mixed }],
      restaurants: [{ type: Schema.Types.Mixed }],
      touristSites: [{ type: Schema.Types.Mixed }],
    },
    lastViewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
ItinerarySchema.index({ userId: 1, createdAt: -1 });
ItinerarySchema.index({ userId: 1, isPublic: 1 });
ItinerarySchema.index({ _id: 1, userId: 1 });
ItinerarySchema.index({ isPublic: 1, createdAt: -1 });