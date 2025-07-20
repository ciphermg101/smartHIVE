import { Apartment, IApartment } from '@modules/apartments/apartment.model';
import { Types } from 'mongoose';

export class ApartmentService {
  static async create(data: { name: string; description?: string; location: string; imageUrl?: string; ownerId: string }): Promise<IApartment> {
    const apartment = await Apartment.create({
      name: data.name,
      description: data.description,
      location: data.location,
      imageUrl: data.imageUrl,
      ownerId: new Types.ObjectId(data.ownerId),
      caretakers: [],
      tenants: [],
      units: [],
    });
    return apartment.toObject();
  }

  static async listByOwner(ownerId: string): Promise<IApartment[]> {
    return Apartment.find({ ownerId: new Types.ObjectId(ownerId) }).lean();
  }

  static async listByCaretaker(userId: string): Promise<IApartment[]> {
    return Apartment.find({ caretakers: new Types.ObjectId(userId) }).lean();
  }

  static async listByTenant(userId: string): Promise<IApartment[]> {
    return Apartment.find({ tenants: new Types.ObjectId(userId) }).lean();
  }

  static async getById(id: string): Promise<IApartment | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Apartment.findById(id).lean();
  }

  static async update(id: string, data: Partial<Pick<IApartment, 'name' | 'description' | 'location' | 'imageUrl'>>): Promise<IApartment | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Apartment.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  static async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await Apartment.findByIdAndDelete(id);
    return !!res;
  }

  static async listByUserRole(userId: string, role: string): Promise<IApartment[]> {
    if (role === 'owner') return this.listByOwner(userId);
    if (role === 'caretaker') return this.listByCaretaker(userId);
    if (role === 'tenant') return this.listByTenant(userId);
    return [];
  }
} 