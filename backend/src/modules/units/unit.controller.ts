import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authGuard } from '@common/guards/authGuard';
import { rolesGuard } from '@common/guards/rolesGuard';
import { zodValidate } from '@utils/zodValidate';
import { UnitService } from '@modules/units/unit.service';

const router = Router();

const createUnitSchema = z.object({
  unitNo: z.string().min(1),
  rent: z.number().min(0),
  apartmentId: z.string().min(1),
});

const updateUnitSchema = z.object({
  unitNo: z.string().min(1).optional(),
  rent: z.number().min(0).optional(),
  tenantId: z.string().optional().nullable(),
});

router.post(
  '/',
  authGuard,
  rolesGuard({ roles: 'owner' }),
  zodValidate({ body: createUnitSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const unit = await UnitService.create({
        unitNo: req.body.unitNo,
        rent: req.body.rent,
        apartmentId: req.body.apartmentId,
      });
      res.status(201).json({ success: true, message: 'Unit created', data: unit });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/',
  authGuard,
  rolesGuard({ roles: ['owner', 'tenant'], resourceType: 'apartment' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apartmentId = req.query.apartmentId as string || req.body.apartmentId || req.params.apartmentId;
      const units = await UnitService.listByApartment(apartmentId || '');
      res.json({ success: true, data: units });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:id',
  authGuard,
  rolesGuard({ roles: ['owner', 'tenant'], resourceType: 'unit' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const unit = await UnitService.getById(req.params.id || '');
      if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
      res.json({ success: true, data: unit });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id',
  authGuard,
  rolesGuard({ roles: 'owner', resourceType: 'unit' }),
  zodValidate({ body: updateUnitSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const unit = await UnitService.update(req.params.id || '', req.body);
      if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
      res.json({ success: true, message: 'Unit updated', data: unit });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  authGuard,
  rolesGuard({ roles: 'owner', resourceType: 'unit' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await UnitService.delete(req.params.id || '');
      res.status(204).json({ success: true, message: 'Unit deleted' });
    } catch (err) {
      next(err);
    }
  }
);

export default router; 