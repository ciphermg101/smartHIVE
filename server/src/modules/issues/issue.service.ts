import { Issue, IIssue } from '@modules/issues/issue.model';
import { Unit } from '@modules/units/unit.model';
import { Types } from 'mongoose';
import { NotFoundError, ValidationError, ForbiddenError } from '@common/error-handler/CustomErrors';
import { IssueStatus } from '@modules/issues/issue.enum';

export class IssueService {
  static async reportIssue(data: { title: string; description: string; unitId: string; reporterId: string; fileUrl?: string }): Promise<IIssue> {
    if (!Types.ObjectId.isValid(data.unitId)) throw new ValidationError('Invalid unitId');
    const unit = await Unit.findById(data.unitId);
    if (!unit) throw new NotFoundError('Unit not found');
    const issue = await Issue.create({
      title: data.title,
      description: data.description,
      fileUrl: data.fileUrl,
      status: IssueStatus.OPEN,
      reporterId: new Types.ObjectId(data.reporterId),
      unitId: unit._id,
    });
    return issue.toObject();
  }

  static async listIssues(filter: { userId: string; role: string }): Promise<IIssue[]> {
    if (filter.role === 'landlord') {
      // Landlord: see all issues
      return Issue.find({}).sort({ createdAt: -1 }).lean();
    } else {
      // Tenant: see only their reported issues
      return Issue.find({ reporterId: new Types.ObjectId(filter.userId) }).sort({ createdAt: -1 }).lean();
    }
  }

  static async updateStatus(id: string, status: IssueStatus): Promise<IIssue | null> {
    if (!Types.ObjectId.isValid(id)) throw new ValidationError('Invalid issue id');
    return Issue.findByIdAndUpdate(id, { status }, { new: true }).lean();
  }
} 