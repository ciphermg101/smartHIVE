import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getAuth } from '@common/middleware/clerkAuth';
import { authGuard } from '@common/guards/authGuard';
import { rolesGuard } from '@common/guards/rolesGuard';
import { zodValidate } from '@utils/zodValidate';
import { PaymentService } from '@modules/rent/payment.service';

const router = Router();

const simulatePaymentSchema = z.object({
  unitId: z.string().min(1),
  amount: z.number().min(0),
});

router.post(
  '/simulate',
  authGuard,
  rolesGuard({ roles: 'tenant', resourceType: 'unit' }),
  zodValidate({ body: simulatePaymentSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const payment = await PaymentService.simulatePayment({
        unitId: req.body.unitId,
        amount: req.body.amount,
        tenantId: auth.userId || '',
      });
      res.status(201).json({ success: true, message: 'Payment simulated', data: payment });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker', 'tenant'] }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = (req as any).apartmentProfile;
      const apartmentId = profile.apartmentId;
      const payments = await PaymentService.getPayments({ apartmentId, userId: profile.userId, role: profile.role });
      res.json({ success: true, data: payments });
    } catch (err) {
      next(err);
    }
  }
);

export default router; 