import { Apartment, IApartment } from '@modules/apartments/apartment.model';
import { ApartmentProfile } from '@modules/apartments/apartmentProfile.model';
import { Types } from 'mongoose';

export class ApartmentService {
  static async create(data: { name: string; description?: string; location: string; imageUrl?: string; ownerId: string }): Promise<IApartment> {
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
    } catch (err) {
      throw err;
    }
  }

  static async listByOwner(ownerId: string): Promise<IApartment[]> {
    try {
      return Apartment.find({ ownerId }).lean();
    } catch (err) {
      throw err;
    }
  }

  static async listByCaretaker(userId: string): Promise<IApartment[]> {
    try {
      return Apartment.find({ caretakers: userId }).lean();
    } catch (err) {
      throw err;
    }
  }

  static async getById(id: string): Promise<IApartment | null> {
    try {
    if (!Types.ObjectId.isValid(id)) return null;
    return Apartment.findById(id).lean();
    } catch (err) {
      throw err;
    }
  }

  static async update(id: string, data: Partial<Pick<IApartment, 'name' | 'description' | 'location' | 'imageUrl'>>): Promise<IApartment | null> {
    try {
      if (!Types.ObjectId.isValid(id)) throw Object.assign(new Error('Invalid apartment id'), { status: 400 });
    return Apartment.findByIdAndUpdate(id, data, { new: true }).lean();
    } catch (err) {
      throw err;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(id)) throw Object.assign(new Error('Invalid apartment id'), { status: 400 });
    const res = await Apartment.findByIdAndDelete(id);
    return !!res;
    } catch (err) {
      throw err;
    }
  }

  static async getUserApartmentsWithProfile(userId: string) {
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
  }

  static async getUserApartmentProfile(userId: string, apartmentId: string) {
    return ApartmentProfile.findOne({ userId, apartmentId }).lean();
  }
} 