import { Payment, IPayment } from '@modules/rent/payment.model';
import { Unit } from '@modules/units/unit.model';
import { PaymentStatus } from '@modules/rent/payment.enum';
import { AppException } from '@common/error-handler/errorHandler';

export class PaymentService {
  static async simulatePayment(data: {
    unitId: string;
    amount: number;
    tenantId: string
  }): Promise<IPayment> {
    try {
      const unit = await Unit.findById(data.unitId);

      if (!unit) {
        throw new AppException('Unit not found', 404);
      }

      if (!unit.tenantId || String(unit.tenantId) !== String(data.tenantId)) {
        throw new AppException('You are not the tenant of this unit', 403);
      }

      const payment = await Payment.create({
        amount: data.amount,
        date: new Date(),
        status: PaymentStatus.PAID,
        tenantId: data.tenantId,
        unitId: unit._id,
      });

      return payment.toObject();
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async getPayments(filter: {
    apartmentId: string;
    userId: string;
    role: string
  }): Promise<IPayment[]> {
    try {
      if (filter.role === 'owner' || filter.role === 'caretaker') {

        // Owner/caretaker: see all payments for the apartment
        const units = await Unit.find({ apartmentId: filter.apartmentId })
          .select('_id')
          .lean();

        if (!units.length) {
          throw new AppException('No units found for this apartment', 404);
        }

        const unitIds = units.map(u => u._id);
        return await Payment.find({ unitId: { $in: unitIds } })
          .sort({ date: -1 })
          .lean();

      } else if (filter.role === 'tenant') {
        // Tenant: see only their payments
        return await Payment.find({
          tenantId: filter.userId
        })
          .sort({ date: -1 })
          .lean();

      } else {
        throw new AppException('Unauthorized access', 403);
      }
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }
}