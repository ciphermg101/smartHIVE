import { SignIn } from '@clerk/clerk-react'

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <SignIn routing="path" path="/sign-in" />
    </div>
  )
} 