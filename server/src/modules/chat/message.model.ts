import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  senderId: Types.ObjectId | string;
  apartmentId?: Types.ObjectId | string;
  unitId?: Types.ObjectId | string;
  content: string;
  room: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment' },
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
  content: { type: String, required: true },
  room: { type: String, required: true },
}, { timestamps: true });

export const Message = model<IMessage>('Message', messageSchema); 