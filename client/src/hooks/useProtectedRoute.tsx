import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/user'
import { useApartmentStore } from '@/store/apartment'

export function useProtectedRoute(allowedRoles?: string[]) {
  const navigate = useNavigate()
  const user = useUserStore((s: any) => s.user)
  const selectedProfile = useApartmentStore(s => s.selectedProfile)

  useEffect(() => {
    if (!user) {
        navigate('/sign-in')
        return
      }
    if (allowedRoles && (!selectedProfile || !allowedRoles.includes(selectedProfile.profile.role))) {
        navigate('/unauthorized')
      return
    }
  }, [user, selectedProfile, allowedRoles, navigate])
} 