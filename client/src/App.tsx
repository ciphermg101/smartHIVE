import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { ClerkProvider, useUser } from '@clerk/clerk-react'
import { useUserStore } from '@/store/user'
import { Toaster } from '@components/ui/sonner'
import AppInitializer from '@components/AppInitiliazer'
import { useSyncThemeWithLocalStorage } from '@/hooks/useSyncThemeWithLocalStorage'
import { ProtectedRoute } from '@components/ProtectedRoute'

const queryClient = new QueryClient()

const SignIn = lazy(() => import('@pages/SignIn'))
const SignUp = lazy(() => import('@pages/SignUp'))
const UserProfile = lazy(() => import('@pages/UserProfile'))
const Unauthorized = lazy(() => import('@pages/Unauthorized'))
const Onboarding = lazy(() => import('@pages/Onboarding'))
const DashboardPage = lazy(() => import('@pages/DashboardPage'))
const Landing = lazy(() => import('@pages/Landing'))

function InnerApp() {
  const { user, isLoaded } = useUser()
  const setUser = useUserStore((s: any) => s.setUser)

  useSyncThemeWithLocalStorage()

  useEffect(() => {
    if (isLoaded) {
      setUser(user)
    }
  }, [user, isLoaded, setUser])

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
        <Route path="/user" element={<UserProfile />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Suspense>
  )
}

function AppWrapper() {
  const navigate = useNavigate()
  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/onboarding"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <AppInitializer />
      <InnerApp />
    </ClerkProvider>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  )
}
