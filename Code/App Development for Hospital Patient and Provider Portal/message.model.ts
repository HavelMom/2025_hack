import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IMessage extends Document {
  senderId: Schema.Types.ObjectId | IUser;
  receiverId: Schema.Types.ObjectId | IUser;
  content: string;
  read: boolean;
  sentAt: Date;
  readAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient querying
messageSchema.index({ senderId: 1, receiverId: 1, sentAt: -1 });
messageSchema.index({ receiverId: 1, read: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
