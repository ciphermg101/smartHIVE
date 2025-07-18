import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth, getAuth } from '@common/middleware/clerkAuth';
import { requireRole } from '@common/guards/roleGuard';
import { zodValidate } from '@utils/zodValidate';
import { requireOwnership } from '@common/guards/ownershipGuard';
import { ApartmentService } from '@modules/apartments/apartment.service';

const router = Router();

const createApartmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const updateApartmentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

router.post(
  '/',
  requireAuth,
  requireRole('landlord'),
  zodValidate({ body: createApartmentSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const apartment = await ApartmentService.create({
        name: req.body.name,
        description: req.body.description,
        landlordId: auth.userId || '',
      });
      res.status(201).json({ success: true, message: 'Apartment created', data: apartment });
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
      const auth = getAuth(req);
      const apartments = await ApartmentService.listByLandlord(auth.userId || '');
      res.json({ success: true, data: apartments });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:id',
  requireAuth,
  requireRole(['landlord', 'tenant']),
  requireOwnership('apartment'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apartment = await ApartmentService.getById(req.params.id || '');
      if (!apartment) return res.status(404).json({ success: false, message: 'Apartment not found' });
      res.json({ success: true, data: apartment });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id',
  requireAuth,
  requireRole('landlord'),
  requireOwnership('apartment'),
  zodValidate({ body: updateApartmentSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apartment = await ApartmentService.update(req.params.id || '', req.body);
      if (!apartment) return res.status(404).json({ success: false, message: 'Apartment not found' });
      res.json({ success: true, message: 'Apartment updated', data: apartment });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('landlord'),
  requireOwnership('apartment'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await ApartmentService.delete(req.params.id || '');
      if (!deleted) return res.status(404).json({ success: false, message: 'Apartment not found' });
      res.status(204).json({ success: true, message: 'Apartment deleted' });
    } catch (err) {
      next(err);
    }
  }
);

export default router; 