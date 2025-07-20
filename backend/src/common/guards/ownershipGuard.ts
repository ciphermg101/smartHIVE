import { Request, Response, NextFunction } from 'express';
import { Apartment } from '@modules/apartments/apartment.model';
import { Unit } from '@modules/units/unit.model';
import { Types } from 'mongoose';

interface AuthInfo {
  userId?: string;
  id?: string;
}

export function requireOwnership(type: 'apartment' | 'unit') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use type assertion to access custom auth/user properties
      const auth = (req as unknown as { auth?: AuthInfo; user?: AuthInfo }).auth || (req as unknown as { auth?: AuthInfo; user?: AuthInfo }).user || {};
      const userId = auth.userId || auth.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized', error: 'No userId in session' });
      }
      if (type === 'apartment') {
        const apartmentId = req.params.id || req.body.apartmentId;
        if (!apartmentId || !Types.ObjectId.isValid(apartmentId)) {
          return res.status(400).json({ success: false, message: 'Invalid apartment id' });
        }
        const apartment = await Apartment.findById(apartmentId).lean();
        if (!apartment) {
          return res.status(404).json({ success: false, message: 'Apartment not found' });
        }
        if (String(apartment.ownerId) !== String(userId)) {
          return res.status(403).json({ success: false, message: 'Forbidden: Not the owner of this apartment' });
        }
        return next();
      }
      if (type === 'unit') {
        const unitId = req.params.id || req.body.unitId;
        if (!unitId || !Types.ObjectId.isValid(unitId)) {
          return res.status(400).json({ success: false, message: 'Invalid unit id' });
        }
        const unit = await Unit.findById(unitId).lean();
        if (!unit) {
          return res.status(404).json({ success: false, message: 'Unit not found' });
        }
        // Check if user is owner of the apartment or tenant of the unit
        const apartment = await Apartment.findById(unit.apartmentId).lean();
        if (
          (apartment && String(apartment.ownerId) === String(userId)) ||
          (unit.tenantId && String(unit.tenantId) === String(userId))
        ) {
          return next();
        }
        return res.status(403).json({ success: false, message: 'Forbidden: Not authorized for this unit' });
      }
      return res.status(400).json({ success: false, message: 'Invalid ownership type' });
    } catch (err) {
      return next(err);
    }
  };
} 