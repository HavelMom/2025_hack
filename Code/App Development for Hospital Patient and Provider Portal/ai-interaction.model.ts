import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IAIInteraction extends Document {
  userId: Schema.Types.ObjectId | IUser;
  inputText: string;
  responseText: string;
  detectedIntent: string;
  confidenceScore: number;
  resultedInAppointment: boolean;
  resultedInProviderTransfer: boolean;
  interactionTimestamp: Date;
}

const aiInteractionSchema = new Schema<IAIInteraction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    inputText: {
      type: String,
      required: true
    },
    responseText: {
      type: String,
      required: true
    },
    detectedIntent: {
      type: String,
      required: true
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    resultedInAppointment: {
      type: Boolean,
      default: false
    },
    resultedInProviderTransfer: {
      type: Boolean,
      default: false
    },
    interactionTimestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create index for efficient querying
aiInteractionSchema.index({ userId: 1, interactionTimestamp: -1 });

export const AIInteraction = mongoose.model<IAIInteraction>('AIInteraction', aiInteractionSchema);
