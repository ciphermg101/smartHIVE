import { verifyToken } from '@clerk/backend';

export interface ClerkUserToken {
  userId: string;
  session: unknown;
}

export async function verifyClerkToken(token: string): Promise<ClerkUserToken> {
  if (!token) throw new Error('No token provided');

  const cleanToken = token.replace(/^Bearer\s+/i, '');

  try {
    const { session, userId } = await verifyToken(cleanToken, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    if (!userId || typeof userId !== 'string') {
      throw new Error('Unauthorized');
    }

    return { userId, session };
  } catch (err) {
    console.error('Token verification failed:', err);
    throw new Error('Unauthorized');
  }
}
