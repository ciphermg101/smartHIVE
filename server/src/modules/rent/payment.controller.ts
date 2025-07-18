import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth, getAuth } from '@common/middleware/clerkAuth';
import { requireRole } from '@common/guards/roleGuard';
import { zodValidate } from '@utils/zodValidate';
import { PaymentService } from '@modules/rent/payment.service';
import { requireOwnership } from '@common/guards/ownershipGuard';

const router = Router();

const simulatePaymentSchema = z.object({
  unitId: z.string().min(1),
  amount: z.number().min(0),
});

router.post(
  '/simulate',
  requireAuth,
  requireRole('tenant'),
  requireOwnership('unit'),
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
  '/history',
  requireAuth,
  requireRole('tenant'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const payments = await PaymentService.getTenantHistory(auth.userId || '');
      res.json({ success: true, data: payments });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/',
  requireAuth,
  requireRole('landlord'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payments = await PaymentService.listAllPayments();
      res.json({ success: true, data: payments });
    } catch (err) {
      next(err);
    }
  }
);

export default router; 