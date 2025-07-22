import { Request, Response, NextFunction } from 'express';
import { Apartment } from '@modules/apartments/apartment.model';
import { Unit } from '@modules/units/unit.model';
import { Types } from 'mongoose';
import { errorHandler } from '@common/error-handler/errorHandler';
import { ApartmentService } from '@modules/apartments/apartment.service';

interface RolesGuardOptions {
  roles: string | string[];
  resourceType?: 'apartment' | 'unit';
}

export function rolesGuard(options: RolesGuardOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roles, resourceType } = options;

      const userId = (req as any).auth?.userId || (req as any).user?.id;
      const apartmentId = req.params.apartmentId ||req.body.apartmentId || req.query.apartmentId;

      if (!userId || !apartmentId || !Types.ObjectId.isValid(apartmentId)) {
        return errorHandler(
          {
            status: 400,
            message: 'Missing or invalid user/apartment ID.',
          }, req, res, next
        );
      }

      const profile = await ApartmentService.getUserApartmentProfile(userId, apartmentId);
      if (!profile) {
        return errorHandler(
          {
            status: 403,
            message: 'Forbidden: No apartment profile found.',
          }, req, res, next
        );
      }

      (req as any).apartmentProfile = profile;

      const isRoleAllowed = Array.isArray(roles)
        ? roles.includes(profile.role)
        : profile.role === roles;

      if (!isRoleAllowed) {
        return errorHandler(
          {
            status: 403,
            message: 'Forbidden: Insufficient apartment role.',
          }, req, res, next
        );
      }

      // Resource ownership check
      if (resourceType === 'apartment') {
        const apartment = await Apartment.findById(apartmentId).lean();
        if (String(apartment?.ownerId) !== String(userId)) {
          return errorHandler(
            {
              status: 403,
              message: 'Forbidden: Not the owner of this apartment.',
            }, req, res, next
          );
        }
      }

      if (resourceType === 'unit') {
        const unitId = req.params.id || req.body.unitId;
        if (!unitId || !Types.ObjectId.isValid(unitId)) {
          return errorHandler(
            {
              status: 400,
              message: 'Invalid unit ID.',
            }, req, res, next
          );
        }

        const unit = await Unit.findById(unitId).lean();
        if (!unit) {
          return errorHandler(
            {
              status: 404,
              message: 'Unit not found.',
            }, req, res, next
          );
        }

        const apartment = await Apartment.findById(unit.apartmentId).lean();

        const isAuthorized =
          (apartment && String(apartment.ownerId) === String(userId)) ||
          (unit.tenantId && String(unit.tenantId) === String(userId));

        if (!isAuthorized) {
          return errorHandler(
            {
              status: 403,
              message: 'Forbidden: Not authorized for this unit.',
            }, req, res, next
          );
        }
      }

      return next();
    } catch (err) {
      return errorHandler(err, req, res, next);
    }
  };
}
