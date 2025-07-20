import { UserProfile } from '@clerk/clerk-react'

export default function UserProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <UserProfile routing="path" path="/user" />
    </div>
  )
} 