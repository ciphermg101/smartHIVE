import { Issue, IIssue } from '@modules/issues/issue.model';
import { Unit } from '@modules/units/unit.model';
import { Types } from 'mongoose';
import { IssueStatus } from '@modules/issues/issue.enum';

export class IssueService {
  static async reportIssue(data: { title: string; description: string; unitId: string; reporterId: string; fileUrl?: string }): Promise<IIssue> {
    try {
      if (!Types.ObjectId.isValid(data.unitId)) throw Object.assign(new Error('Invalid unitId'), { status: 400 });
      const unit = await Unit.findById(data.unitId);
      if (!unit) throw Object.assign(new Error('Unit not found'), { status: 404 });
      const issue = await Issue.create({
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        status: IssueStatus.OPEN,
        reporterId: new Types.ObjectId(data.reporterId),
        unitId: unit._id,
      });
      return issue.toObject();
    } catch (err) {
      throw err;
    }
  }

  static async listIssues(filter: { apartmentId: string; userId: string; role: string }): Promise<IIssue[]> {
    try {
      if (!Types.ObjectId.isValid(filter.apartmentId)) throw Object.assign(new Error('Invalid apartmentId'), { status: 400 });
      if (filter.role === 'owner' || filter.role === 'caretaker') {
  
        const units = await Unit.find({ apartmentId: filter.apartmentId }).select('_id').lean();
        const unitIds = units.map(u => u._id);
        return Issue.find({ unitId: { $in: unitIds } }).sort({ createdAt: -1 }).lean();
      } else if (filter.role === 'tenant') {

        // Tenant: see only their reported issues
        return Issue.find({ reporterId: new Types.ObjectId(filter.userId) }).sort({ createdAt: -1 }).lean();
      } else {
        return [];
      }
    } catch (err) {
      throw err;
    }
  }

  static async updateStatus(id: string, status: IssueStatus): Promise<IIssue | null> {
    try {
      if (!Types.ObjectId.isValid(id)) throw Object.assign(new Error('Invalid issue id'), { status: 400 });
      return Issue.findByIdAndUpdate(id, { status }, { new: true }).lean();
    } catch (err) {
      throw err;
    }
  }
} 