import { UserProfile } from '@clerk/clerk-react'
import { ThemeToggle } from '@components/ui/ThemeToggle'

export default function UserProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 dark:bg-background text-foreground">
      <div className="flex justify-end w-full max-w-md mx-auto mb-4">
        <ThemeToggle />
      </div>
      <UserProfile routing="path" path="/user" />
    </div>
  )
} 