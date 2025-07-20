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