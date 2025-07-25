export interface Apartment {
  _id: string;
  name: string;
  description?: string;
  location: string;
  imageUrl?: string;
}

export interface ApartmentForm {
  name: string
  description?: string
  location: string
  imageUrl?: string
}

export interface ApartmentProfile {
  _id: string
  userId: string
  apartmentId: string
  role: string
  unitId?: string
  dateJoined: string
  status: string
}

export interface ApartmentWithProfile extends Apartment {
  profile: ApartmentProfile
}
