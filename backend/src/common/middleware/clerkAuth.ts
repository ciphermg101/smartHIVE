
import { clerkMiddleware as clerk, requireAuth, getAuth } from '@clerk/express';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { User } from '@modules/users/user.model';

export const clerkMiddleware = clerk();
export { requireAuth, getAuth };

export const clerkAuthSocket = async (socket: Socket, next: (err?: ExtendedError) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Use Clerk to verify the session token
    try {
      const { createClerkClient } = await import('@clerk/backend');
      const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      // Verify the session token
      const session = await clerk.sessions.verifySession(token, token);
      
      if (!session || !session.userId) {
        return next(new Error('Invalid session'));
      }

      // Find user profile in our database
      const user = await User.findOne({ clerkUserId: session.userId });
      if (!user) {
        return next(new Error('User not found'));
      }

      (socket as any).userId = user._id;
      (socket as any).senderId = user._id.toString();
      (socket as any).clerkUserId = session.userId;
      next();
    } catch (err) {
      console.error('Session verification failed:', err);
      return next(new Error('Invalid session'));
    }
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Authentication failed'));
  }
};
