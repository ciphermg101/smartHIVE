import { clerkMiddleware as clerk, requireAuth, getAuth } from '@clerk/express';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';

// Dummy verifyToken and User for example purposes. Replace with your actual implementations.
const verifyToken = (token: string, options: any) => {
  // In a real scenario, you would verify the JWT token using Clerk's public key.
  // For demonstration, we'll assume a valid token structure and return dummy claims.
  if (token === "valid-token") {
    return { sub: "user123", exp: Math.floor(Date.now() / 1000) + (60 * 60) }; // Example claims
  }
  return null;
};

class User {
  static findOne(query: any) {
    // Mock user lookup
    if (query.userId === "user123") {
      return { _id: "60d5ec49a9c2d41b14a9f1b1", userId: "user123", name: "John Doe" };
    }
    return null;
  }
}

export const clerkMiddleware = clerk();
export { requireAuth, getAuth };

export const clerkAuthSocket = async (socket: Socket, next: (err?: ExtendedError) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token with Clerk
    const sessionClaims = verifyToken(token, {
      jwtKey: process.env.CLERK_JWT_KEY!,
      authorizedParties: [process.env.CLERK_AUTHORIZED_PARTY!]
    });

    if (!sessionClaims || !sessionClaims.sub) {
      return next(new Error('Invalid token'));
    }

    // Find user profile
    const user = await User.findOne({ userId: sessionClaims.sub });
    if (!user) {
      return next(new Error('User not found'));
    }

    (socket as any).userId = user._id;
    (socket as any).senderId = user._id;
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Authentication failed'));
  }
};