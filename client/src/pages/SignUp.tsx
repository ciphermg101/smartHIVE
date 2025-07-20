import { SignUp } from '@clerk/clerk-react'

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <SignUp routing="path" path="/sign-up" />
    </div>
  )
} 