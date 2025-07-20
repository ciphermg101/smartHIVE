import { useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@store/auth'
import { useApartmentStore } from '@store/apartment'

export function useProtectedRoute(allowedRoles?: string[]) {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const setUser = useAuthStore((s) => s.setUser)
  const setRole = useAuthStore((s) => s.setRole)
  const selectedApartment = useApartmentStore((s) => s.selectedApartment)

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        navigate('/sign-in')
        return
      }
      setUser(user)
      // Get role from Clerk publicMetadata
      const role = user?.publicMetadata?.role as string | undefined
      setRole(role || null)
      if (allowedRoles && (!role || !allowedRoles.includes(role))) {
        navigate('/unauthorized')
        return
      }
      // Redirect to onboarding if no apartment selected and not already on onboarding or sign-in
      if (!selectedApartment && location.pathname !== '/onboarding' && location.pathname !== '/sign-in') {
        navigate('/onboarding')
      }
    }
  }, [isLoaded, isSignedIn, user, allowedRoles, navigate, setUser, setRole, selectedApartment, location.pathname])
} 