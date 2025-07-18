import { UserProfile } from '@clerk/clerk-react';

export default function UserProfilePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <UserProfile routing="path" path="/auth/user-profile" />
    </div>
  );
} 