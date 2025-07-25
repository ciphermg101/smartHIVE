import { type ClerkUser } from "@/types/clerk";

export type User = ClerkUser & {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
};

export interface UserProfile extends User {
  _id: string; // mongodb id
  userId: string; // Clerk user ID
  apartmentId: string;
  role: string;
  unitId?: string;
  dateJoined: string;
  status: string;
}
