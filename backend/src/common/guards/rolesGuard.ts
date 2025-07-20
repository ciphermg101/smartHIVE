import { Request, Response, NextFunction } from 'express';
import { ApartmentProfile } from '@modules/apartments/apartmentProfile.model';
import { Apartment } from '@modules/apartments/apartment.model';
import { Unit } from '@modules/units/unit.model';
import { Types } from 'mongoose';
import { errorHandler } from '@common/error-handler/errorHandler';

interface RolesGuardOptions {
  roles: string | string[];
  resourceType?: 'apartment' | 'unit';
}

export function rolesGuard(options: RolesGuardOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roles, resourceType } = options;
      const profileId = req.body.apartmentProfileId || req.query.apartmentProfileId || req.params.apartmentProfileId;
      if (!profileId) {
        return errorHandler({
          status: 400,
          message: 'Missing apartmentProfileId',
        }, req, res, next);
      }
      const profile = await ApartmentProfile.findById(profileId).lean();
      if (!profile) {
        return errorHandler({
          status: 404,
          message: 'ApartmentProfile not found',
        }, req, res, next);
      }
      (req as any).apartmentProfile = profile;
      const allowed = Array.isArray(roles) ? roles.includes(profile.role) : profile.role === roles;
      if (!allowed) {
        return errorHandler({
          status: 403,
          message: 'Forbidden: Insufficient apartment role',
        }, req, res, next);
      }
      // Ownership/resource check if resourceType is provided
      if (resourceType) {
        const userId = profile.userId;
        if (resourceType === 'apartment') {
          const apartmentId = req.params.id || req.body.apartmentId;
          if (!apartmentId || !Types.ObjectId.isValid(apartmentId)) {
            return errorHandler({
              status: 400,
              message: 'Invalid apartment id',
            }, req, res, next);
          }
          const apartment = await Apartment.findById(apartmentId).lean();
          if (!apartment) {
            return errorHandler({
              status: 404,
              message: 'Apartment not found',
            }, req, res, next);
          }
          if (String(apartment.ownerId) !== String(userId)) {
            return errorHandler({
              status: 403,
              message: 'Forbidden: Not the owner of this apartment',
            }, req, res, next);
          }
        } else if (resourceType === 'unit') {
          const unitId = req.params.id || req.body.unitId;
          if (!unitId || !Types.ObjectId.isValid(unitId)) {
            return errorHandler({
              status: 400,
              message: 'Invalid unit id',
            }, req, res, next);
          }
          const unit = await Unit.findById(unitId).lean();
          if (!unit) {
            return errorHandler({
              status: 404,
              message: 'Unit not found',
            }, req, res, next);
          }
          const apartment = await Apartment.findById(unit.apartmentId).lean();
          if (
            (apartment && String(apartment.ownerId) === String(userId)) ||
            (unit.tenantId && String(unit.tenantId) === String(userId))
          ) {
            // Authorized
          } else {
            return errorHandler({
              status: 403,
              message: 'Forbidden: Not authorized for this unit',
            }, req, res, next);
          }
        }
      }
      return next();
    } catch (err) {
      return errorHandler(err, req, res, next);
    }
  };
} 