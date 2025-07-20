import { ReactNode } from 'react'
import { useProtectedRoute } from '@hooks/useProtectedRoute'

interface ProtectedRouteProps {
  allowedRoles?: string[]
  children: ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  useProtectedRoute(allowedRoles)
  return <>{children}</>
} 