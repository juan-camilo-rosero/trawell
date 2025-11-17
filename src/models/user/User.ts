import mongoose, { Schema, Document, Model } from 'mongoose';
import { ILocation } from '../types';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  name: string;
  originCity?: ILocation;
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CoordinatesSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const LocationSchema = new Schema(
  {
    name: { type: String, required: true },
    coordinates: { type: CoordinatesSchema, required: true },
    placeId: { type: String },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originCity: {
      type: LocationSchema,
      required: false,
    },
    hasCompletedOnboarding: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;