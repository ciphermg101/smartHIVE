import { useUser, useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  requiredRole?: string | string[];
  children?: ReactNode;
}

export function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return null; // Optionally add a spinner here
  if (!isSignedIn) return <Navigate to="/auth/sign-in" replace />;

  if (requiredRole) {
    const userRole = user?.publicMetadata?.role;
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(userRole as string)) {
        return <Navigate to="/unauthorized" replace />;
      }
    } else {
      if (userRole !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  return children ? <>{children}</> : <Outlet />;
} 