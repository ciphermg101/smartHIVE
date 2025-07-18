import { Apartment, IApartment } from '@modules/apartments/apartment.model';
import { Types } from 'mongoose';

export class ApartmentService {
  static async create(data: { name: string; description?: string; landlordId: string }): Promise<IApartment> {
    const apartment = await Apartment.create({
      name: data.name,
      description: data.description,
      landlordId: new Types.ObjectId(data.landlordId),
      units: [],
    });
    return apartment.toObject();
  }

  static async listByLandlord(landlordId: string): Promise<IApartment[]> {
    return Apartment.find({ landlordId: new Types.ObjectId(landlordId) }).lean();
  }

  static async getById(id: string): Promise<IApartment | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Apartment.findById(id).lean();
  }

  static async update(id: string, data: Partial<Pick<IApartment, 'name' | 'description'>>): Promise<IApartment | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Apartment.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  static async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await Apartment.findByIdAndDelete(id);
    return !!res;
  }
} 