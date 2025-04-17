import mongoose, { Document, Schema } from 'mongoose';
import { IPatientProfile } from './patient-profile.model';
import { IProviderProfile } from './provider-profile.model';
import { IAppointment } from './appointment.model';

export interface IMedicalRecord extends Document {
  patientId: Schema.Types.ObjectId | IPatientProfile;
  providerId: Schema.Types.ObjectId | IProviderProfile;
  appointmentId?: Schema.Types.ObjectId | IAppointment;
  recordDate: Date;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const medicalRecordSchema = new Schema<IMedicalRecord>(
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
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    recordDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    diagnosis: {
      type: String,
      required: true
    },
    symptoms: {
      type: String,
      required: true
    },
    treatment: {
      type: String,
      required: true
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
medicalRecordSchema.index({ patientId: 1, recordDate: -1 });

export const MedicalRecord = mongoose.model<IMedicalRecord>('MedicalRecord', medicalRecordSchema);
