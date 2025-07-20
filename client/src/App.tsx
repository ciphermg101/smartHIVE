import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ProtectedRoute } from '@components/ProtectedRoute'

const queryClient = new QueryClient()

const Home = lazy(() => import('@pages/index'))
const SignIn = lazy(() => import('@pages/SignIn'))
const SignUp = lazy(() => import('@pages/SignUp'))
const UserProfile = lazy(() => import('@pages/UserProfile'))
const Unauthorized = lazy(() => import('@pages/Unauthorized'))

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/sign-in/*" element={<SignIn />} />
            <Route path="/sign-up/*" element={<SignUp />} />
            <Route path="/user" element={<UserProfile />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            {/* TODO: Add more protected routes for features, e.g. landlord/tenant dashboards */}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
