import { Schema, model, Document } from 'mongoose';
import { UserRole } from '@modules/users/user.enum';

export interface IUser extends Document {
  clerkUserId: string;
  role: UserRole;
  apartmentId?: string;
  unitId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  clerkUserId: { type: String, required: true, unique: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
  apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment' },
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
}, { timestamps: true });

export const User = model<IUser>('User', userSchema); 