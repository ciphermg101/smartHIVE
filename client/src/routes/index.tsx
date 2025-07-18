import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ProtectedRoute } from '@context/auth/ProtectedRoute';
import { ErrorBoundary } from '@routes/shared/ErrorBoundary';
import { SignInPage, SignUpPage, UserProfilePage, OrganizationSwitcherPage } from '@routes/auth';

const LandlordLayout = lazy(() => import('@routes/landlord/LandlordLayout'));
const TenantLayout = lazy(() => import('@routes/tenant/TenantLayout'));

export default function AppRoutes() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return null; // Optionally add a spinner

  const role = user?.publicMetadata?.role;

  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth/sign-in" element={<SignInPage />} />
          <Route path="/auth/sign-up" element={<SignUpPage />} />
          <Route path="/auth/user-profile" element={<UserProfilePage />} />
          <Route path="/auth/organization-switcher" element={<OrganizationSwitcherPage />} />

          {/* Role-based dashboards */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {role === 'landlord' ? <Navigate to="/landlord/dashboard" replace /> : role === 'tenant' ? <Navigate to="/tenant/dashboard" replace /> : <Navigate to="/auth/sign-in" replace />}
              </ProtectedRoute>
            }
          />

          {/* Landlord layout and routes */}
          <Route
            path="/landlord/*"
            element={
              <ProtectedRoute requiredRole="landlord">
                <LandlordLayout />
              </ProtectedRoute>
            }
          />

          {/* Tenant layout and routes */}
          <Route
            path="/tenant/*"
            element={
              <ProtectedRoute requiredRole="tenant">
                <TenantLayout />
              </ProtectedRoute>
            }
          />

          {/* Unauthorized */}
          <Route path="/unauthorized" element={<div className="p-8 text-center">Unauthorized</div>} />
          {/* 404 */}
          <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
} 