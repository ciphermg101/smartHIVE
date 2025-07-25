import { Schema, model, Document, Types } from 'mongoose';
import { UnitStatus } from '@modules/units/unit.enum';

export interface IUnit extends Document {
  unitNo: string;
  rent: number;
  tenantId?: string | null;
  apartmentId: Types.ObjectId;
  status: UnitStatus;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const unitSchema = new Schema<IUnit>({
  unitNo: { type: String, required: true },
  rent: { type: Number, required: true },
  tenantId: { type: String, default: null },
  apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true },
  imageUrl: { type: String },
  status: {
    type: String,
    enum: Object.values(UnitStatus),
    default: UnitStatus.VACANT,
    required: true,
  },
}, { timestamps: true });

export const Unit = model<IUnit>('Unit', unitSchema); 