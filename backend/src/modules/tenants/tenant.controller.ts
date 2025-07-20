import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth, getAuth } from '@common/middleware/clerkAuth';
import { requireRole } from '@common/guards/roleGuard';
import { zodValidate } from '@utils/zodValidate';
import { TenantService } from '@modules/tenants/tenant.service';
import { requireOwnership } from '@common/guards/ownershipGuard';

const router = Router();

const inviteTenantSchema = z.object({
  unitId: z.string().min(1),
  expiration: z.date().optional(),
});

const acceptInviteSchema = z.object({
  token: z.string().min(1),
});

router.post(
  '/invite',
  requireAuth,
  requireRole('landlord'),
  requireOwnership('unit'),
  zodValidate({ body: inviteTenantSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invite = await TenantService.inviteTenant({
        unitId: req.body.unitId,
        expiration: req.body.expiration,
      });
      res.status(201).json({ success: true, message: 'Tenant invite created', data: invite });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/accept-invite',
  requireAuth,
  requireRole('tenant'),
  zodValidate({ body: acceptInviteSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const tenant = await TenantService.acceptInvite(req.body.token, auth.userId || '');
      res.json({ success: true, message: 'Invite accepted', data: tenant });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/me',
  requireAuth,
  requireRole('tenant'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const tenant = await TenantService.getMyDetails(auth.userId || '');
      if (!tenant) return res.status(404).json({ success: false, message: 'Tenant details not found' });
      res.json({ success: true, data: tenant });
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
      const tenants = await TenantService.listTenants();
      res.json({ success: true, data: tenants });
    } catch (err) {
      next(err);
    }
  }
);

export default router; 