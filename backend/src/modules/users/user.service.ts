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

  static async clerkSync(payload: any): Promise<{ success: boolean }> {
    try {
      const { type, data } = payload;
      const clerkUserId = data.id as string;
      const email = data.email as string;

      if (!clerkUserId) {
        throw new AppException('Missing Clerk user ID', 400);
      }

      if (!email) {
        throw new AppException('Missing user email', 400);
      }

      switch (type) {
        case 'user.created':
          await User.create({ clerkUserId, email });
          break;

        case 'user.updated':
          const updatedUser = await User.findOneAndUpdate(
            { clerkUserId },
            { email },
            { new: true, runValidators: true }
          );

          if (!updatedUser) {
            throw new AppException('User not found for update', 404);
          }
          break;

        case 'user.deleted':
          const deletedUser = await User.findOneAndDelete({ clerkUserId });
          if (!deletedUser) {
            throw new AppException('User not found for deletion', 404);
          }
          break;

        default:
          throw new AppException('Unsupported Clerk webhook event type', 400);
      }

      return { success: true };
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }
}