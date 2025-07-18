import { Tenant, ITenant } from '@modules/tenants/tenant.model';
import { InviteToken, IInviteToken } from '@modules/tenants/inviteToken.model';
import { Unit } from '@modules/units/unit.model';
import { Types } from 'mongoose';
import { NotFoundError, ValidationError, ForbiddenError } from '@common/error-handler/CustomErrors';
import { InviteTokenStatus } from '@modules/tenants/inviteToken.enum';
import { TenantStatus } from '@modules/tenants/tenant.enum';

export class TenantService {
  static async inviteTenant(data: { unitId: string; expiration?: Date }): Promise<IInviteToken> {
    if (!Types.ObjectId.isValid(data.unitId)) throw new ValidationError('Invalid unitId');
    const unit = await Unit.findById(data.unitId);
    if (!unit) throw new NotFoundError('Unit not found');
    if (unit.tenantId) throw new ForbiddenError('Unit already has a tenant');
    const token = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const invite = await InviteToken.create({
      token,
      unitId: unit._id,
      expiration: data.expiration || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // default 7 days
      status: InviteTokenStatus.PENDING,
    });
    return invite.toObject();
  }

  static async acceptInvite(token: string, userId: string): Promise<ITenant> {
    const invite = await InviteToken.findOne({ token });
    if (!invite) throw new NotFoundError('Invite token not found');
    if (invite.status !== InviteTokenStatus.PENDING) throw new ForbiddenError('Invite token is not valid');
    if (invite.expiration < new Date()) throw new ForbiddenError('Invite token expired');
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
    // Mark invite as used
    invite.status = InviteTokenStatus.USED;
    await invite.save();
    return tenant.toObject();
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