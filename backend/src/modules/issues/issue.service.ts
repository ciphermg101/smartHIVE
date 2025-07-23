import { Issue, IIssue } from '@modules/issues/issue.model';
import { Unit } from '@modules/units/unit.model';
import { IssueStatus } from '@modules/issues/issue.enum';
import { AppException } from '@common/error-handler/errorHandler';

export class IssueService {
  static async reportIssue(data: {
    title: string;
    description: string;
    unitId: string;
    reporterId: string;
    fileUrl?: string
  }): Promise<IIssue> {
    try {
      if (!data.title || !data.description) {
        throw new AppException('Title and description are required', 400);
      }

      const unit = await Unit.findById(data.unitId);

      if (!unit) {
        throw new AppException('Unit not found', 404);
      }

      const issue = await Issue.create({
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        status: IssueStatus.OPEN,
        reporterId: data.reporterId,
        unitId: unit._id,
      });

      return issue.toObject();
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async listIssues(filter: {
    apartmentId: string;
    userId: string;
    role: string
  }): Promise<IIssue[]> {
    try {
      if (filter.role === 'owner' || filter.role === 'caretaker') {
        const units = await Unit.find({ apartmentId: filter.apartmentId })
          .select('_id')
          .lean();

        if (!units.length) {
          throw new AppException('No units found for this apartment', 404);
        }

        const unitIds = units.map(u => u._id);
        return await Issue.find({ unitId: { $in: unitIds } })
          .sort({ createdAt: -1 })
          .lean();

      } else if (filter.role === 'tenant') {
        // Tenant: see only their reported issues
        return await Issue.find({
          reporterId: filter.userId
        })
          .sort({ createdAt: -1 })
          .lean();

      } else {
        throw new AppException('Unauthorized access', 403);
      }
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }

  static async updateStatus(id: string, status: IssueStatus): Promise<IIssue | null> {
    try {
      if (!Object.values(IssueStatus).includes(status)) {
        throw new AppException('Invalid status value', 400);
      }

      const issue = await Issue.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      ).lean();

      if (!issue) {
        throw new AppException('Issue not found', 404);
      }

      return issue;
    } catch (error: any) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(error, error.message, error.status);
    }
  }
}