import { Schema, model, Document, Types } from 'mongoose';

export interface IApartment extends Document {
  name: string;
  description?: string;
  landlordId: Types.ObjectId;
  units: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const apartmentSchema = new Schema<IApartment>({
  name: { type: String, required: true },
  description: { type: String },
  landlordId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  units: [{ type: Schema.Types.ObjectId, ref: 'Unit' }],
}, { timestamps: true });

export const Apartment = model<IApartment>('Apartment', apartmentSchema); 