import { Schema, model, Document, Types } from 'mongoose';
import { InviteTokenStatus } from '@modules/tenants/inviteToken.enum';

export interface IInviteToken extends Document {
  token: string;
  unitId?: Types.ObjectId;
  apartmentId?: Types.ObjectId;
  role: string;
  expiration: Date;
  status: InviteTokenStatus;
  createdAt: Date;
  updatedAt: Date;
}

const inviteTokenSchema = new Schema<IInviteToken>({
  token: { type: String, required: true, unique: true },
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
  apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment' },
  role: { type: String, enum: ['tenant', 'caretaker'], required: true },
  expiration: { type: Date, required: true },
  status: { type: String, enum: Object.values(InviteTokenStatus), default: InviteTokenStatus.PENDING },
}, { timestamps: true });

export const InviteToken = model<IInviteToken>('InviteToken', inviteTokenSchema); 