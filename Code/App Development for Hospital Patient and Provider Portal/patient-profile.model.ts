import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IPatientProfile extends Document {
  userId: Schema.Types.ObjectId | IUser;
  insuranceNumber: string;
  ssn: string; // Will be encrypted
  dateOfBirth: Date;
  address?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientProfileSchema = new Schema<IPatientProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    insuranceNumber: {
      type: String,
      required: true
    },
    ssn: {
      type: String,
      required: true
      // In production, this would be encrypted
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    address: {
      type: String
    },
    emergencyContact: {
      type: String
    },
    emergencyContactPhone: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const PatientProfile = mongoose.model<IPatientProfile>('PatientProfile', patientProfileSchema);
