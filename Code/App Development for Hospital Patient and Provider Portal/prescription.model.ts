import mongoose, { Document, Schema } from 'mongoose';
import { IPatientProfile } from './patient-profile.model';
import { IProviderProfile } from './provider-profile.model';
import { IMedicalRecord } from './medical-record.model';

export enum PrescriptionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface IPrescription extends Document {
  patientId: Schema.Types.ObjectId | IPatientProfile;
  providerId: Schema.Types.ObjectId | IProviderProfile;
  medicalRecordId?: Schema.Types.ObjectId | IMedicalRecord;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: Date;
  endDate: Date;
  refills: number;
  status: PrescriptionStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'PatientProfile',
      required: true
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true
    },
    medicalRecordId: {
      type: Schema.Types.ObjectId,
      ref: 'MedicalRecord'
    },
    medicationName: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    refills: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: Object.values(PrescriptionStatus),
      default: PrescriptionStatus.ACTIVE
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Create index for efficient querying
prescriptionSchema.index({ patientId: 1, status: 1 });

export const Prescription = mongoose.model<IPrescription>('Prescription', prescriptionSchema);
