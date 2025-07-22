import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getAuth } from '@common/middleware/clerkAuth';
import { authGuard } from '@common/guards/authGuard';
import { rolesGuard } from '@common/guards/rolesGuard';
import { zodValidate } from '@utils/zodValidate';
import { ApartmentService } from '@modules/apartments/apartment.service';
import { ApartmentInviteService } from '@modules/apartments/apartmentInvite.service';
import { ApartmentProfile } from '@modules/apartments/apartmentProfile.model';

const router = Router();

const createApartmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  location: z.string().min(1),
  imageUrl: z.string().optional(),
});

const updateApartmentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  location: z.string().min(1).optional(),
  imageUrl: z.string().optional(),
});

const inviteSchema = z.object({
  email: z.email(),
  role: z.enum(['owner', 'caretaker', 'tenant']),
  apartmentId: z.string(),
  unitId: z.string().optional(),
});

router.post(
  '/',
  authGuard,
  zodValidate({ body: createApartmentSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const apartment = await ApartmentService.create({
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
        imageUrl: req.body.imageUrl,
        ownerId: auth.userId || '',
      });
      res.status(201).json({ success: true, message: 'Apartment created', data: apartment });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/',
  authGuard,
  rolesGuard({ roles: 'owner' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const apartments = await ApartmentService.listByOwner(auth.userId || '');
      res.json({ success: true, data: apartments });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/my-apartments',
  authGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const result = await ApartmentService.getUserApartmentsWithProfile(auth.userId || '');
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:apartmentId',
  authGuard,
  rolesGuard({ roles: ['owner', 'tenant'], resourceType: 'apartment' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apartment = await ApartmentService.getById(req.params.apartmentId || '');
      if (!apartment) return res.status(404).json({ success: false, message: 'Apartment not found' });
      res.json({ success: true, data: apartment });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:apartmentId',
  authGuard,
  rolesGuard({ roles: 'owner', resourceType: 'apartment' }),
  zodValidate({ body: updateApartmentSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apartment = await ApartmentService.update(req.params.apartmentId || '', req.body);
      if (!apartment) return res.status(404).json({ success: false, message: 'Apartment not found' });
      res.json({ success: true, message: 'Apartment updated', data: apartment });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:apartmentId',
  authGuard,
  rolesGuard({ roles: 'owner', resourceType: 'apartment' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await ApartmentService.delete(req.params.apartmentId || '');
      if (!deleted) return res.status(404).json({ success: false, message: 'Apartment not found' });
      res.status(204).json({ success: true, message: 'Apartment deleted' });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:apartmentId/apartment-invite',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker'] }),
  zodValidate({ body: inviteSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const result = await ApartmentInviteService.inviteUser({
        ...req.body,
        invitedBy: auth.userId,
        clientOrigin: process.env.CLIENT_ORIGIN,
      });
      res.status(201).json({ success: true, message: 'Invite sent and profile created', data: result });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:apartmentId/users',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker'], resourceType: 'apartment' }),
  async (req, res, next) => {
    try {
      const profiles = await ApartmentProfile.find({ apartmentId: req.params.apartmentId }).lean();
      res.json({ success: true, data: profiles });
    } catch (err) {
      next(err);
    }
  }
);
3
router.delete(
  '/:apartmentId/users/:userId',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker'], resourceType: 'apartment' }),
  async (req, res, next) => {
    try {
      await ApartmentProfile.deleteOne({ apartmentId: req.params.apartmentId, userId: req.params.userId });
      res.json({ success: true, message: 'User removed' });
    } catch (err) {
      next(err);
    }
  }
);

export default router; 