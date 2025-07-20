import { Schema, model, Document, Types } from 'mongoose';
import { PaymentStatus } from '@modules/rent/payment.enum';

export interface IPayment extends Document {
  amount: number;
  date: Date;
  status: PaymentStatus;
  tenantId: Types.ObjectId | string;
  unitId: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: Object.values(PaymentStatus), required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
}, { timestamps: true });

export const Payment = model<IPayment>('Payment', paymentSchema); 