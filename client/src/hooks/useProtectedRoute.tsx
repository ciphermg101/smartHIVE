import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useApartmentStore } from '@store/apartment'

export function useProtectedRoute(allowedRoles?: string[]) {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useUser()
  const selectedProfile = useApartmentStore(s => s.selectedProfile)

  useEffect(() => {
    if (!isLoaded) return
    
    if (!isSignedIn) {
      navigate('/sign-in')
      return
    }

    if (allowedRoles && (!selectedProfile || !allowedRoles.includes(selectedProfile.profile.role))) {
      navigate('/unauthorized')
      return
    }
  }, [isLoaded, isSignedIn, selectedProfile, allowedRoles, navigate])
}