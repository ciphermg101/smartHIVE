import { Router, Request, Response, NextFunction } from 'express';
import { getAuth } from '@common/middleware/clerkAuth';
import { authGuard } from '@common/guards/authGuard';
import { UserService } from '@modules/users/user.service';

const router = Router();

router.get(
  '/me',
  authGuard,
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
  authGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await UserService.listUsers();
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/clerk-sync',
  authGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await UserService.clerkSync(req.body);
      res.json({ success: true, message: 'Clerk sync processed', data: result });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:id',
  authGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

export default router; 