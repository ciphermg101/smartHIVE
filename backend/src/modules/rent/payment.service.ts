import { Payment, IPayment } from '@modules/rent/payment.model';
import { Unit } from '@modules/units/unit.model';
import { Types } from 'mongoose';
import { NotFoundError, ValidationError, ForbiddenError } from '@common/error-handler/CustomErrors';
import { PaymentStatus } from '@modules/rent/payment.enum';

export class PaymentService {
  static async simulatePayment(data: { unitId: string; amount: number; tenantId: string }): Promise<IPayment> {
    if (!Types.ObjectId.isValid(data.unitId)) throw new ValidationError('Invalid unitId');
    const unit = await Unit.findById(data.unitId);
    if (!unit) throw new NotFoundError('Unit not found');
    if (!unit.tenantId || String(unit.tenantId) !== String(data.tenantId)) throw new ForbiddenError('You are not the tenant of this unit');
    const payment = await Payment.create({
      amount: data.amount,
      date: new Date(),
      status: PaymentStatus.PAID,
      tenantId: new Types.ObjectId(data.tenantId),
      unitId: unit._id,
    });
    return payment.toObject();
  }

  static async getTenantHistory(tenantId: string): Promise<IPayment[]> {
    if (!Types.ObjectId.isValid(tenantId)) throw new ValidationError('Invalid tenantId');
    return Payment.find({ tenantId: new Types.ObjectId(tenantId) }).sort({ date: -1 }).lean();
  }

  static async listAllPayments(): Promise<IPayment[]> {
    return Payment.find({}).sort({ date: -1 }).lean();
  }
} 