import { User, IUser } from '@modules/users/user.model';
import { AppException } from '@common/error-handler/errorHandler';

export interface ClerkWebhookPayload {
  object: string;
  type: string;
  data: Record<string, unknown>;
}

export class UserService {
  static async getMe(clerkUserId: string): Promise<IUser | null> {
    try {
      if (!clerkUserId) {
        throw new AppException('User ID is required', 400);
      }

      const user = await User.findOne({ clerkUserId }).lean();

      if (!user) {
        throw new AppException('User not found', 404);
      }

      return user;
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async listUsers(): Promise<IUser[]> {
    try {
      return await User.find({}).lean();
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async getUserById(userId: string): Promise<IUser | null> {
    try {
      const user = await User.findById(userId).lean();
      if (!user) {
        throw new AppException('User not found', 404);
      }

      return user;
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async deleteUser(clerkUserId: string): Promise<{ success: boolean }> {
    try {
      const deletedUser = await User.findOneAndDelete({ clerkUserId });
      if (!deletedUser) {
        throw new AppException('User not found', 404);
      }
      return { success: true };
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async clerkSync(payload: any): Promise<{ success: boolean }> {
    try {
      const { type, data } = payload;
      
      if (!data || !data.id) {
        throw new AppException('Invalid webhook payload', 400);
      }

      const clerkUserId = data.id as string;
      const emailData = data.email_addresses?.find((e: any) => e.id === data.primary_email_address_id);
      const email = emailData?.email_address;
      const firstName = data.first_name as string || '';
      const lastName = data.last_name as string || '';
      const imageUrl = data.image_url as string || '';
      const username = data.username as string || '';
      const role = data.role as string || 'tenant';

      console.log(`Processing webhook: ${type} for user: ${email || clerkUserId}`);

      switch (type) {
        case 'user.created':
        case 'user.updated': {
          if (!email) {
            throw new AppException('Email is required', 400);
          }

          const userData = {
            email,
            clerkUserId,
            firstName,
            lastName,
            username,
            imageUrl,
            emailVerified: emailData?.verification?.status === 'verified',
            role,
            updatedAt: new Date(),
          };

          await User.findOneAndUpdate(
            { clerkUserId },
            {
              $set: userData,
              $setOnInsert: {
                createdAt: new Date(),
              },
            },
            { 
              upsert: true, 
              new: true,
              runValidators: true
            }
          );
          break;
        }

        case 'user.deleted': {
          const result = await User.findOneAndDelete({ clerkUserId });
          if (!result) {
            throw new AppException('User not found for deletion', 404);
          }
          break;
        }

        default:
          throw new AppException('Unhandled webhook event type', 400);
      }

      return { success: true };
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException('Internal server error', 500, error.message);
    }
  }
}