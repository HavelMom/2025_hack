import mongoose, { Document, Schema } from 'mongoose';
import { IPatientProfile } from './patient-profile.model';
import { IProviderProfile } from './provider-profile.model';

export enum ProviderPatientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface IProviderPatient extends Document {
  providerId: Schema.Types.ObjectId | IProviderProfile;
  patientId: Schema.Types.ObjectId | IPatientProfile;
  relationshipStartDate: Date;
  status: ProviderPatientStatus;
  createdAt: Date;
  updatedAt: Date;
}

const providerPatientSchema = new Schema<IProviderPatient>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'PatientProfile',
      required: true
    },
    relationshipStartDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: Object.values(ProviderPatientStatus),
      default: ProviderPatientStatus.ACTIVE
    }
  },
  {
    timestamps: true
  }
);

// Create a compound index to ensure uniqueness of provider-patient relationship
providerPatientSchema.index({ providerId: 1, patientId: 1 }, { unique: true });

export const ProviderPatient = mongoose.model<IProviderPatient>('ProviderPatient', providerPatientSchema);
