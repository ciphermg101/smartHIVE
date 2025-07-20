import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth, getAuth } from '@common/middleware/clerkAuth';
import { requireRole } from '@common/guards/roleGuard';
import { zodValidate } from '@utils/zodValidate';
import { TenantService } from '@modules/tenants/tenant.service';
import { requireOwnership } from '@common/guards/ownershipGuard';
import { ApartmentService } from '@modules/apartments/apartment.service';

const router = Router();

const inviteSchema = z.object({
  unitId: z.string().optional(),
  apartmentId: z.string().optional(),
  role: z.enum(['tenant', 'caretaker']),
  expiration: z.date().optional(),
});

const acceptInviteSchema = z.object({
  token: z.string().min(1),
});

router.post(
  '/invite',
  requireAuth,
  requireRole('owner'),
  zodValidate({ body: inviteSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invite = await TenantService.invite(req.body);
      res.status(201).json({ success: true, message: 'Invite created', data: invite });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/accept-invite',
  requireAuth,
  zodValidate({ body: acceptInviteSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const result = await TenantService.acceptInvite(req.body.token, auth.userId || '');
      res.json({ success: true, message: 'Invite accepted', data: result });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/my-apartments',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const role = (auth.sessionClaims as any)?.publicMetadata?.role;
      const apartments = await ApartmentService.listByUserRole(auth.userId || '', role);
      res.json({ success: true, data: apartments });
    } catch (err) {
      next(err);
    }
  }
);

export default router; 