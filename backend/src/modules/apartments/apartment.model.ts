import { Schema, model, Document, Types } from 'mongoose';

export interface IApartment extends Document {
  name: string;
  description?: string;
  location: string;
  imageUrl?: string;
  ownerId: Types.ObjectId;
  caretakers: Types.ObjectId[];
  tenants: Types.ObjectId[];
  units: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const apartmentSchema = new Schema<IApartment>({
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String, required: true },
  imageUrl: { type: String },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  caretakers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  tenants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  units: [{ type: Schema.Types.ObjectId, ref: 'Unit' }],
}, { timestamps: true });

export const Apartment = model<IApartment>('Apartment', apartmentSchema); 