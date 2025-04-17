import mongoose, { Document, Schema } from 'mongoose';
import { IPatientProfile } from './patient-profile.model';
import { IProviderProfile } from './provider-profile.model';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no-show'
}

export enum AppointmentType {
  REGULAR = 'regular',
  FOLLOW_UP = 'follow-up',
  EMERGENCY = 'emergency'
}

export interface IAppointment extends Document {
  patientId: Schema.Types.ObjectId | IPatientProfile;
  providerId: Schema.Types.ObjectId | IProviderProfile;
  dateTime: Date;
  durationMinutes: number;
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
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
    dateTime: {
      type: Date,
      required: true
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 30
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.SCHEDULED
    },
    type: {
      type: String,
      enum: Object.values(AppointmentType),
      default: AppointmentType.REGULAR
    },
    reason: {
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

// Create indexes for efficient querying
appointmentSchema.index({ patientId: 1, dateTime: 1 });
appointmentSchema.index({ providerId: 1, dateTime: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
