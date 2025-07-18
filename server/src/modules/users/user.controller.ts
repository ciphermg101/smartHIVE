import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth, getAuth } from '@common/middleware/clerkAuth';
import { requireRole } from '@common/guards/roleGuard';
import { zodValidate } from '@utils/zodValidate';
import { UserService } from '@modules/users/user.service';
import { UserRole } from '@modules/users/user.enum';

const router = Router();

const updateRoleSchema = z.object({
  role: z.enum(['landlord', 'tenant']),
});

router.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const user = await UserService.getMe(auth.userId || '');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, data: user });
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
      const users = await UserService.listUsers();
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id/role',
  requireAuth,
  requireRole('landlord'),
  zodValidate({ body: updateRoleSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserService.updateRole(req.params.id || '', req.body.role as UserRole);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({ success: true, message: 'User role updated', data: user });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/clerk-sync',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await UserService.clerkSync(req.body);
      res.json({ success: true, message: 'Clerk sync processed', data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router; 