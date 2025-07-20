import { Tenant, ITenant } from '@modules/tenants/tenant.model';
import { InviteToken, IInviteToken } from '@modules/tenants/inviteToken.model';
import { Apartment } from '@modules/apartments/apartment.model';
import { Unit } from '@modules/units/unit.model';
import { Types } from 'mongoose';
import { NotFoundError, ValidationError, ForbiddenError } from '@common/error-handler/CustomErrors';
import { InviteTokenStatus } from '@modules/tenants/inviteToken.enum';
import { TenantStatus } from '@modules/tenants/tenant.enum';

export class TenantService {
  static async invite({ unitId, apartmentId, role, expiration }: { unitId?: string; apartmentId?: string; role: string; expiration?: Date }): Promise<IInviteToken> {
    if (role === 'tenant') {
      if (!unitId || !Types.ObjectId.isValid(unitId)) throw new ValidationError('Invalid unitId');
      const unit = await Unit.findById(unitId);
      if (!unit) throw new NotFoundError('Unit not found');
      if (unit.tenantId) throw new ForbiddenError('Unit already has a tenant');
    }
    if (role === 'caretaker') {
      if (!apartmentId || !Types.ObjectId.isValid(apartmentId)) throw new ValidationError('Invalid apartmentId');
      const apartment = await Apartment.findById(apartmentId);
      if (!apartment) throw new NotFoundError('Apartment not found');
    }
    const token = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const invite = await InviteToken.create({
      token,
      unitId: unitId ? new Types.ObjectId(unitId) : undefined,
      apartmentId: apartmentId ? new Types.ObjectId(apartmentId) : undefined,
      role,
      expiration: expiration || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: InviteTokenStatus.PENDING,
    });
    return invite.toObject();
  }

  static async acceptInvite(token: string, userId: string): Promise<any> {
    const invite = await InviteToken.findOne({ token });
    if (!invite) throw new NotFoundError('Invite token not found');
    if (invite.status !== InviteTokenStatus.PENDING) throw new ForbiddenError('Invite token is not valid');
    if (invite.expiration < new Date()) throw new ForbiddenError('Invite token expired');
    if (invite.role === 'tenant') {
      if (!invite.unitId) throw new ValidationError('Invite missing unitId');
      const unit = await Unit.findById(invite.unitId);
      if (!unit) throw new NotFoundError('Unit not found');
      if (unit.tenantId) throw new ForbiddenError('Unit already has a tenant');
      // Create tenant profile
      const tenant = await Tenant.create({
        userId: new Types.ObjectId(userId),
        apartmentId: unit.apartmentId,
        unitId: unit._id,
        status: TenantStatus.ACTIVE,
      });
      // Assign tenant to unit
      unit.tenantId = new Types.ObjectId(userId);
      await unit.save();
      // Add tenant to apartment
      await Apartment.findByIdAndUpdate(unit.apartmentId, { $addToSet: { tenants: new Types.ObjectId(userId) } });
      // Mark invite as used
      invite.status = InviteTokenStatus.USED;
      await invite.save();
      return tenant.toObject();
    } else if (invite.role === 'caretaker') {
      if (!invite.apartmentId) throw new ValidationError('Invite missing apartmentId');
      // Add caretaker to apartment
      await Apartment.findByIdAndUpdate(invite.apartmentId, { $addToSet: { caretakers: new Types.ObjectId(userId) } });
      // Mark invite as used
      invite.status = InviteTokenStatus.USED;
      await invite.save();
      return { success: true, message: 'Caretaker added to apartment' };
    }
    throw new ValidationError('Invalid invite role');
  }

  static async getMyDetails(userId: string): Promise<ITenant | null> {
    return Tenant.findOne({ userId: new Types.ObjectId(userId) }).lean();
  }

  static async listTenants(apartmentId?: string): Promise<ITenant[]> {
    const query = apartmentId && Types.ObjectId.isValid(apartmentId)
      ? { apartmentId: new Types.ObjectId(apartmentId) }
      : {};
    return Tenant.find(query).lean();
  }
} 