import { User, IUser } from '@modules/users/user.model';
import { Types } from 'mongoose';
import { ValidationError } from '@common/error-handler/CustomErrors';
import { UserRole } from '@modules/users/user.enum';

export interface ClerkWebhookPayload {
  object: string;
  type: string;
  data: Record<string, unknown>;
}

function getRoleFromMetadata(data: Record<string, unknown>): UserRole {
  const role = (data.publicMetadata as { role?: string } | undefined)?.role;
  if (role === UserRole.LANDLORD || role === UserRole.TENANT) return role;
  return UserRole.TENANT;
}

export class UserService {
  static async getMe(clerkUserId: string): Promise<IUser | null> {
    return User.findOne({ clerkUserId }).lean();
  }

  static async listUsers(): Promise<IUser[]> {
    return User.find({}).lean();
  }

  static async updateRole(id: string, role: UserRole): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) throw new ValidationError('Invalid user id');
    return User.findByIdAndUpdate(id, { role }, { new: true }).lean();
  }

  static async clerkSync(payload: ClerkWebhookPayload): Promise<{ success: boolean }> {
    const { type, data } = payload;
    const clerkUserId = data.id as string;
    if (!clerkUserId) throw new ValidationError('Missing Clerk user id');
    switch (type) {
      case 'user.created': {
        const role = getRoleFromMetadata(data);
        await User.create({
          clerkUserId,
          role,
          apartmentId: data.apartmentId ? new Types.ObjectId(data.apartmentId as string) : undefined,
          unitId: data.unitId ? new Types.ObjectId(data.unitId as string) : undefined,
        });
        break;
      }
      case 'user.updated': {
        const role = getRoleFromMetadata(data);
        await User.findOneAndUpdate(
          { clerkUserId },
          {
            role,
            apartmentId: data.apartmentId ? new Types.ObjectId(data.apartmentId as string) : undefined,
            unitId: data.unitId ? new Types.ObjectId(data.unitId as string) : undefined,
          },
          { new: true }
        );
        break;
      }
      case 'user.deleted': {
        await User.findOneAndDelete({ clerkUserId });
        break;
      }
      default:
        throw new ValidationError('Unsupported Clerk webhook event type');
    }
    return { success: true };
  }
} 