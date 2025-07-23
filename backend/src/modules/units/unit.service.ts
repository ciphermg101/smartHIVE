import { Unit, IUnit } from "@modules/units/unit.model";
import { Apartment } from "@modules/apartments/apartment.model";
import { AppException } from '@common/error-handler/errorHandler';

export class UnitService {
  static async create(data: {
    apartmentId: string;
    unitNo: string;
    rent: number;
    imageUrl?: string;
  }): Promise<IUnit> {
    try {
      const apartment = await Apartment.findById(data.apartmentId);
      if (!apartment) {
        throw new AppException('Apartment not found', 404);
      }

      const unitData: any = {
        unitNo: data.unitNo,
        rent: data.rent,
        apartmentId: data.apartmentId,
      };

      if (data.imageUrl) {
        unitData.imageUrl = data.imageUrl;
      }

      const unit = await Unit.create(unitData);

      apartment.units.push(unit._id as any);
      await apartment.save();
      return unit.toObject();
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async listByApartment(apartmentId: string): Promise<IUnit[]> {
    try {
      const units = await Unit.find({ apartmentId }).lean();
      return units;
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async getById(id: string): Promise<IUnit | null> {
    try {
      const unit = await Unit.findById(id).lean();

      if (!unit) {
        throw new AppException('Unit not found', 404);
      }

      return unit;
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async update(
    id: string,
    data: Partial<Pick<IUnit, "unitNo" | "rent" | "tenantId" | "imageUrl">>
  ): Promise<IUnit | null> {
    try {
      const unit = await Unit.findByIdAndUpdate(id, data, { new: true }).lean();

      if (!unit) {
        throw new AppException('Unit not found', 404);
      }

      return unit;
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const unit = await Unit.findByIdAndDelete(id);

      if (!unit) {
        throw new AppException('Unit not found', 404);
      }

      await Apartment.updateOne(
        { _id: unit.apartmentId },
        { $pull: { units: unit._id } }
      );

      return true;
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }
}
