import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  imageUrl: string;
  emailVerified: boolean;
  role: string;
  apartmentId?: string;
  unitId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  clerkUserId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  username: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  emailVerified: { type: Boolean, default: false },
  role: { type: String, default: 'tenant', enum: ['tenant', 'caretaker', 'owner'] },
  apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment' },
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
}, { 
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: Record<string, any>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const User = model<IUser>('User', userSchema);