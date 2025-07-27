import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getAuth } from '@common/middleware/clerkAuth';
import { authGuard } from '@common/guards/authGuard';
import { rolesGuard } from '@common/guards/rolesGuard';
import { zodValidate } from '@utils/zodValidate';
import { ApartmentService } from '@modules/apartments/apartment.service';
import { ApartmentInviteService } from '@modules/apartments/apartmentInvite.service';
import { config } from '@config/configs';

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
  email: z.string().email(),
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
      const apartment = await ApartmentService.createApartment({
        ...req.body,
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
      const apartment = await ApartmentService.getApartmentById(req.params.apartmentId || '');
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
      const apartment = await ApartmentService.updateApartment(req.params.apartmentId || '', req.body);
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
      await ApartmentService.deleteApartment(req.params.apartmentId || '');
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
        clientOrigin: config.clientOrigin,
      });
      res.status(201).json({ success: true, message: 'Invite sent and profile created', data: result });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:apartmentId/tenants',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker'], resourceType: 'apartment' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenants = await ApartmentService.getApartmentTenants(req.params.apartmentId);
      res.json({ success: true, data: tenants });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:apartmentId/tenants/:tenantId',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker'], resourceType: 'apartment' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ApartmentService.removeApartmentTenant(req.params.apartmentId, req.params.tenantId);
      res.json({ success: true, message: 'Tenant removed' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;