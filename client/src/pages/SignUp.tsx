import { SignUp } from '@clerk/clerk-react'
import type { ComponentProps } from 'react'

export default function SignUpPage(props: ComponentProps<typeof SignUp>) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <SignUp {...props} redirectUrl="/onboarding" />
    </div>
  )
} 