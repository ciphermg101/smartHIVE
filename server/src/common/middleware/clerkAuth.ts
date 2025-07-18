import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';

export const clerkAuthMiddleware = clerkMiddleware();
export const requireAuthMiddleware = requireAuth();
export { requireAuth, getAuth };
