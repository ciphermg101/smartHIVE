import { Schema, model, Document, Types } from 'mongoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     ApartmentProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *           description: Clerk user ID
 *         apartmentId:
 *           type: string
 *           description: Apartment ID
 *         role:
 *           type: string
 *           enum: [owner, caretaker, tenant]
 *         unitId:
 *           type: string
 *           description: Unit ID (optional)
 *         dateJoined:
 *           type: string
 *           format: date-time
 *         invitedBy:
 *           type: string
 *           description: User ID of inviter
 *         status:
 *           type: string
 *           enum: [active, invited, inactive]
 *           default: active
 */
/**
 * ApartmentProfile is the source of truth for all RBAC and role checks.
 * Clerk publicMetadata.role is NOT used for RBAC.
 * Each user can have multiple ApartmentProfiles (one per apartment/role).
 */
export type ApartmentProfileRole = 'owner' | 'caretaker' | 'tenant';
export type ApartmentProfileStatus = 'active' | 'invited' | 'inactive';

export interface IApartmentProfile extends Document {
  userId: string;
  apartmentId: Types.ObjectId;
  role: ApartmentProfileRole;
  unitId?: Types.ObjectId;
  dateJoined: Date;
  invitedBy?: string;
  status: ApartmentProfileStatus;
}

const apartmentProfileSchema = new Schema<IApartmentProfile>({
  userId: { type: String, required: true },
  apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true },
  role: { type: String, enum: ['owner', 'caretaker', 'tenant'], required: true },
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
  dateJoined: { type: Date, default: Date.now },
  invitedBy: { type: String },
  status: { type: String, enum: ['active', 'invited', 'inactive'], default: 'active' },
}, { timestamps: true });

apartmentProfileSchema.index({ userId: 1, apartmentId: 1 }, { unique: true });

export const ApartmentProfile = model<IApartmentProfile>('ApartmentProfile', apartmentProfileSchema); 