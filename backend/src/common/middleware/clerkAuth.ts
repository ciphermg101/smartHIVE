import { clerkMiddleware as clerk, requireAuth, getAuth } from '@clerk/express';

export const clerkMiddleware = clerk();
export { requireAuth, getAuth };