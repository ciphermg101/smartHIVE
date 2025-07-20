import { SignIn, useUser } from '@clerk/clerk-react'
import type { ComponentProps } from 'react'
import { Navigate } from 'react-router-dom'

export default function SignInPage(props: ComponentProps<typeof SignIn>) {
  const { isSignedIn } = useUser()
  if (isSignedIn) {
    return <Navigate to="/onboarding" replace />
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <SignIn {...props} />
    </div>
  )
} 