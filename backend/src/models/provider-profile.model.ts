import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IProviderProfile extends Document {
  userId: Schema.Types.ObjectId | IUser;
  credentials: string;
  specialization: string;
  licenseNumber: string;
  department?: string;
  officeLocation?: string;
  workingHours?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const providerProfileSchema = new Schema<IProviderProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    credentials: {
      type: String,
      required: true
    },
    specialization: {
      type: String,
      required: true
    },
    licenseNumber: {
      type: String,
      required: true
    },
    department: {
      type: String
    },
    officeLocation: {
      type: String
    },
    workingHours: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

export const ProviderProfile = mongoose.model<IProviderProfile>('ProviderProfile', providerProfileSchema);
