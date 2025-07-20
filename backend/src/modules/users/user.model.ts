import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  clerkUserId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  clerkUserId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
}, { timestamps: true });

export const User = model<IUser>('User', userSchema); 