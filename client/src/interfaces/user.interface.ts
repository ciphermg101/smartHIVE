export interface IUserProfile {
  _id: string;                   
  userId: string;                
  user?: {                        
    _id: string;                 
    email: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
  apartmentId: string;
  role: string;
  unitId?: {                     
    _id: string;                 
    unitNo: string;              
  };
  dateJoined: string;
  status: string;
  createdAt?: string;            
  updatedAt?: string;
}