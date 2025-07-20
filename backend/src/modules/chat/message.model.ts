import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  senderId: string;
  apartmentId?: string;
  unitId?: string;
  content: string;
  room: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  senderId: { type: String, required: true },
  apartmentId: { type: String },
  unitId: { type: String },
  content: { type: String, required: true },
  room: { type: String, required: true },
}, { timestamps: true });

export const Message = model<IMessage>('Message', messageSchema); 