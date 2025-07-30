import { SignUp } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import type { ComponentProps } from 'react'
import { useEffect, useState } from 'react'

export default function SignUpPage(props: ComponentProps<typeof SignUp>) {
  const [isDark, setIsDark] = useState(() => typeof window !== 'undefined' && document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 dark:bg-background text-foreground">
      <SignUp
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