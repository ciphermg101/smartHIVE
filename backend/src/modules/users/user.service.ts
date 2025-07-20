import { User, IUser } from '@modules/users/user.model';

export interface ClerkWebhookPayload {
  object: string;
  type: string;
  data: Record<string, unknown>;
}

export class UserService {
  static async getMe(clerkUserId: string): Promise<IUser | null> {
    try {
    return User.findOne({ clerkUserId }).lean();
    } catch (err) {
      throw err;
    }
  }

  static async listUsers(): Promise<IUser[]> {
    try {
    return User.find({}).lean();
    } catch (err) {
      throw err;
  }
  }

  static async clerkSync(payload: any): Promise<{ success: boolean }> {
    try {
    const { type, data } = payload;
    const clerkUserId = data.id as string;
      const email = data.email as string;
      if (!clerkUserId) throw Object.assign(new Error('Missing Clerk user id'), { status: 400 });
      if (!email) throw Object.assign(new Error('Missing Clerk user email'), { status: 400 });
      if (type === 'user.created') {
        await User.create({ clerkUserId, email });
      } else if (type === 'user.updated') {
        await User.findOneAndUpdate(
          { clerkUserId },
          { email },
          { new: true }
        );
      } else if (type === 'user.deleted') {
        await User.findOneAndDelete({ clerkUserId });
      } else {
        throw Object.assign(new Error('Unsupported Clerk webhook event type'), { status: 400 });
      }
      return { success: true };
    } catch (err) {
      throw err;
    }
  }
} 