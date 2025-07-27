import { Schema, model, Document, Types } from 'mongoose';
export type ApartmentProfileRole = 'owner' | 'caretaker' | 'tenant';
export type ApartmentProfileStatus = 'active' | 'invited' | 'inactive';

export interface IApartmentProfile extends Document {
  userId: Types.ObjectId;
  apartmentId: Types.ObjectId;
  role: ApartmentProfileRole;
  unitId?: Types.ObjectId;
  dateJoined: Date;
  invitedBy?: string;
  status: ApartmentProfileStatus;
}

const apartmentProfileSchema = new Schema<IApartmentProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true },
  role: { type: String, enum: ['owner', 'caretaker', 'tenant'], required: true },
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
  dateJoined: { type: Date, default: Date.now },
  invitedBy: { type: String },
  status: { type: String, enum: ['active', 'invited', 'inactive'], default: 'active' },
}, { timestamps: true });

apartmentProfileSchema.index({ userId: 1, apartmentId: 1 }, { unique: true });

export const ApartmentProfile = model<IApartmentProfile>('ApartmentProfile', apartmentProfileSchema); 