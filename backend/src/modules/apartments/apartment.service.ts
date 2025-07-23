import { Apartment, IApartment } from '@modules/apartments/apartment.model';
import { ApartmentProfile } from '@modules/apartments/apartmentProfile.model';
import { AppException } from '@common/error-handler/errorHandler';

export class ApartmentService {
  static async create(data: { 
    name: string; 
    description?: string; 
    location: string; 
    imageUrl?: string; 
    ownerId: string 
  }): Promise<IApartment> {
    try {
      const apartment = await Apartment.create({
        name: data.name,
        description: data.description,
        location: data.location,
        imageUrl: data.imageUrl,
        ownerId: data.ownerId,
        caretakers: [],
        tenants: [],
        units: [],
      });

      await ApartmentProfile.create({
        userId: data.ownerId,
        apartmentId: apartment._id,
        role: 'owner',
        status: 'active',
      });

      return apartment.toObject();
    } catch (error: any) {
      throw new AppException(error, error.message, error.status);
    }
  }

  static async listByOwner(ownerId: string): Promise<IApartment[]> {
    try {
      return Apartment.find({ ownerId }).lean();
    } catch (error: any) {
      throw new AppException(error, error.message, error.status);
    }
  }

  static async listByCaretaker(userId: string): Promise<IApartment[]> {
    try {
      return Apartment.find({ caretakers: userId }).lean();
    } catch (error: any) {
      throw new AppException(error, error.message, error.status);
    }
  }

  static async getById(id: string): Promise<IApartment | null> {
    try {
      const apartment = await Apartment.findById(id).lean();
      
      if (!apartment) {
        throw new AppException('Apartment not found', 404);
      }
      
      return apartment;
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async update(
    id: string, 
    data: Partial<Pick<IApartment, 'name' | 'description' | 'location' | 'imageUrl'>>
  ): Promise<IApartment | null> {
    try {
      const apartment = await Apartment.findByIdAndUpdate(id, data, { new: true }).lean();
      
      if (!apartment) {
        throw new AppException('Apartment not found', 404);
      }
      
      return apartment;
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const result = await Apartment.findByIdAndDelete(id);
      
      if (!result) {
        throw new AppException('Apartment not found', 404);
      }

      // Clean up related profiles
      await ApartmentProfile.deleteMany({ apartmentId: id });
      
      return true;
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async getUserApartmentsWithProfile(userId: string) {
    try {
      const profiles = await ApartmentProfile.find({ userId }).lean();
      const apartmentIds = profiles.map(p => p.apartmentId);
      const apartments = await Apartment.find({ _id: { $in: apartmentIds } }).lean();

      return apartments.map(apartment => {
        const profile = profiles.find(p => p.apartmentId.toString() === apartment._id.toString());
        return {
          ...apartment,
          profile: profile ? {
            ...profile,
            apartmentId: apartment._id.toString(),
            apartmentName: apartment.name,
          } : null,
        };
      });
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async getUserApartmentProfile(userId: string, apartmentId: string) {
    try {
      const profile = await ApartmentProfile.findOne({ userId, apartmentId }).lean();
      
      if (!profile) {
        throw new AppException('Profile not found', 404);
      }

      return profile;
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }
}