import { Unit, IUnit } from '@modules/units/unit.model';
import { Apartment } from '@modules/apartments/apartment.model';
import { Types } from 'mongoose';
import { NotFoundError, ValidationError } from '@common/error-handler/CustomErrors';

export class UnitService {
  static async create(data: { unitNo: string; rent: number; apartmentId: string }): Promise<IUnit> {
    if (!Types.ObjectId.isValid(data.apartmentId)) throw new ValidationError('Invalid apartmentId');
    const apartment = await Apartment.findById(data.apartmentId);
    if (!apartment) throw new NotFoundError('Apartment not found');
    const unit = await Unit.create({
      unitNo: data.unitNo,
      rent: data.rent,
      apartmentId: new Types.ObjectId(data.apartmentId),
    });
    // Add unit to apartment's units array
    apartment.units.push(unit._id as Types.ObjectId);
    await apartment.save();
    return unit.toObject();
  }

  static async listByApartment(apartmentId: string): Promise<IUnit[]> {
    if (!Types.ObjectId.isValid(apartmentId)) throw new ValidationError('Invalid apartmentId');
    return Unit.find({ apartmentId: new Types.ObjectId(apartmentId) }).lean();
  }

  static async getById(id: string): Promise<IUnit | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Unit.findById(id).lean();
  }

  static async update(id: string, data: Partial<Pick<IUnit, 'unitNo' | 'rent' | 'tenantId'>>): Promise<IUnit | null> {
    if (!Types.ObjectId.isValid(id)) throw new ValidationError('Invalid unit id');
    return Unit.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  static async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) throw new ValidationError('Invalid unit id');
    const unit = await Unit.findByIdAndDelete(id);
    if (!unit) throw new NotFoundError('Unit not found');
    // Remove from apartment's units array
    await Apartment.updateOne({ _id: unit.apartmentId }, { $pull: { units: unit._id } });
    return true;
  }
} 