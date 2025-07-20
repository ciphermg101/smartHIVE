import { Schema, model, Document, Types } from 'mongoose';
import { TenantStatus } from '@modules/tenants/tenant.enum';

export interface ITenant extends Document {
  userId: Types.ObjectId;
  apartmentId: Types.ObjectId;
  unitId: Types.ObjectId;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true },
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  status: { type: String, enum: Object.values(TenantStatus), default: TenantStatus.ACTIVE },
}, { timestamps: true });

export const Tenant = model<ITenant>('Tenant', tenantSchema); 