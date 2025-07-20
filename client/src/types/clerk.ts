import { useUser } from '@clerk/clerk-react'
export type ClerkUser = ReturnType<typeof useUser>['user']
