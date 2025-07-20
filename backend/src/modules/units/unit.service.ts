import { Unit, IUnit } from "@modules/units/unit.model";
import { Apartment } from "@modules/apartments/apartment.model";
import { Types } from "mongoose";
import { errorHandler } from "@common/error-handler/errorHandler";

export class UnitService {
  static async create(data: {
    unitNo: string;
    rent: number;
    apartmentId: string;
  }): Promise<IUnit> {
    try {
      if (!Types.ObjectId.isValid(data.apartmentId))
        throw Object.assign(new Error("Invalid apartmentId"), { status: 400 });
      const apartment = await Apartment.findById(data.apartmentId);
      if (!apartment)
        throw Object.assign(new Error("Apartment not found"), { status: 404 });
      const unit = await Unit.create({
        unitNo: data.unitNo,
        rent: data.rent,
        apartmentId: new Types.ObjectId(data.apartmentId),
      });

      apartment.units.push(unit._id as any);
      await apartment.save();
      return unit.toObject();
    } catch (err) {
      throw err;
    }
  }

  static async listByApartment(apartmentId: string): Promise<IUnit[]> {
    try {
      if (!Types.ObjectId.isValid(apartmentId))
        throw Object.assign(new Error("Invalid apartmentId"), { status: 400 });
      return Unit.find({ apartmentId: new Types.ObjectId(apartmentId) }).lean();
    } catch (err) {
      throw err;
    }
  }

  static async getById(id: string): Promise<IUnit | null> {
    try {
      if (!Types.ObjectId.isValid(id)) return null;
      return Unit.findById(id).lean();
    } catch (err) {
      throw err;
    }
  }

  static async update(
    id: string,
    data: Partial<Pick<IUnit, "unitNo" | "rent" | "tenantId">>
  ): Promise<IUnit | null> {
    try {
      if (!Types.ObjectId.isValid(id))
        throw Object.assign(new Error("Invalid unit id"), { status: 400 });
      return Unit.findByIdAndUpdate(id, data, { new: true }).lean();
    } catch (err) {
      throw err;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(id))
        throw Object.assign(new Error("Invalid unit id"), { status: 400 });
      const unit = await Unit.findByIdAndDelete(id);
      if (!unit)
        throw Object.assign(new Error("Unit not found"), { status: 404 });
      await Apartment.updateOne(
        { _id: unit.apartmentId },
        { $pull: { units: unit._id } }
      );
      return true;
    } catch (err) {
      throw err;
    }
  }
}
