import { Payment, IPayment } from '@modules/rent/payment.model';
import { Unit } from '@modules/units/unit.model';
import { Types } from 'mongoose';
import { PaymentStatus } from '@modules/rent/payment.enum';

export class PaymentService {
  static async simulatePayment(data: { unitId: string; amount: number; tenantId: string }): Promise<IPayment> {
    try {
      if (!Types.ObjectId.isValid(data.unitId)) throw Object.assign(new Error('Invalid unitId'), { status: 400 });
    const unit = await Unit.findById(data.unitId);
      if (!unit) throw Object.assign(new Error('Unit not found'), { status: 404 });
      if (!unit.tenantId || String(unit.tenantId) !== String(data.tenantId)) throw Object.assign(new Error('You are not the tenant of this unit'), { status: 403 });
    const payment = await Payment.create({
      amount: data.amount,
      date: new Date(),
      status: PaymentStatus.PAID,
      tenantId: new Types.ObjectId(data.tenantId),
      unitId: unit._id,
    });
    return payment.toObject();
    } catch (err) {
      throw err;
    }
  }

  static async getPayments(filter: { apartmentId: string; userId: string; role: string }): Promise<IPayment[]> {
    try {
      if (!Types.ObjectId.isValid(filter.apartmentId)) throw Object.assign(new Error('Invalid apartmentId'), { status: 400 });
      if (filter.role === 'owner' || filter.role === 'caretaker') {
        // Owner/caretaker: see all payments for the apartment
        const units = await Unit.find({ apartmentId: filter.apartmentId }).select('_id').lean();
        const unitIds = units.map(u => u._id);
        return Payment.find({ unitId: { $in: unitIds } }).sort({ date: -1 }).lean();
      } else if (filter.role === 'tenant') {
        // Tenant: see only their payments
        return Payment.find({ tenantId: new Types.ObjectId(filter.userId) }).sort({ date: -1 }).lean();
      } else {
        // Default: no access
        return [];
      }
    } catch (err) {
      throw err;
    }
  }
} 