import { useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/auth'

export function useProtectedRoute(allowedRoles?: string[]) {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const setRole = useAuthStore((s) => s.setRole)

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
      }
    }
  }, [isLoaded, isSignedIn, user, allowedRoles, navigate, setUser, setRole])
} 