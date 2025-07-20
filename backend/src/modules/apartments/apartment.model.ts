import { Schema, model, Document, Types } from 'mongoose';

export interface IApartment extends Document {
  name: string;
  description?: string;
  location: string;
  imageUrl?: string;
  ownerId: string;
  caretakers: string[];
  tenants: string[];
  units: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const apartmentSchema = new Schema<IApartment>({
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String, required: true },
  imageUrl: { type: String },
  ownerId: { type: String, required: true },
  caretakers: [{ type: String }],
  tenants: [{ type: String }],
  units: [{ type: Schema.Types.ObjectId, ref: 'Unit' }],
}, { timestamps: true });

export const Apartment = model<IApartment>('Apartment', apartmentSchema); 