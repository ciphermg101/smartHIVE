import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ProtectedRoute } from '@components/ProtectedRoute'
import { useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { useUserStore } from '@/store/user'
import { Toaster } from '@components/ui/sonner'

const queryClient = new QueryClient()

const Home = lazy(() => import('@pages/index'))
const SignIn = lazy(() => import('@pages/SignIn'))
const SignUp = lazy(() => import('@pages/SignUp'))
const UserProfile = lazy(() => import('@pages/UserProfile'))
const Unauthorized = lazy(() => import('@pages/Unauthorized'))
const Onboarding = lazy(() => import('@pages/Onboarding'))
const DashboardPage = lazy(() => import('@pages/DashboardPage'))

function App() {
  const { user, isLoaded } = useUser()
  const setUser = useUserStore((s: any) => s.setUser)
  useEffect(() => {
    if (isLoaded) {
      setUser(user)
    }
  }, [user, isLoaded, setUser])
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          <Routes>
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
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
            <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
            <Route path="/user" element={<UserProfile />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            {/* TODO: Add more protected routes for features, e.g. landlord/tenant dashboards */}
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
