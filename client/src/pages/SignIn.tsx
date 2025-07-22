import { SignIn, useUser } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import type { ComponentProps } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function SignInPage(props: ComponentProps<typeof SignIn>) {
  const { isSignedIn } = useUser()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(() => typeof window !== 'undefined' && document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isSignedIn) {
      const timer = setTimeout(() => {
        navigate('/onboarding', { replace: true })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSignedIn, navigate])

  if (isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <p className="text-lg">Sign-in successful!</p>
        <p className="text-muted-foreground">Redirecting you in a moment...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 dark:bg-background text-foreground">
      <SignIn
        {...props}
        appearance={{
          baseTheme: isDark ? dark : undefined,
          elements: {
            formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
          },
          variables: {
            colorPrimary: "hsl(222.2 47.4% 11.2%)",
          },
        }}
      />
    </div>
  )
} 