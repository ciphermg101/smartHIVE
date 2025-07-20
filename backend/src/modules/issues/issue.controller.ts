import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authGuard } from '@common/guards/authGuard';
import { zodValidate } from '@utils/zodValidate';
import { IssueService } from '@modules/issues/issue.service';
import { IssueStatus } from '@modules/issues/issue.enum';
import { rolesGuard } from '@common/guards/rolesGuard';

const router = Router();

const reportIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  unitId: z.string().min(1),
  apartmentProfileId: z.string().min(1),
  imageUrl: z.string().url().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'ignored']),
  apartmentProfileId: z.string().min(1),
});

router.post(
  '/',
  authGuard,
  rolesGuard({ roles: 'tenant' }),
  zodValidate({ body: reportIssueSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = (req as any).apartmentProfile;
      const fileUrl = req.body.imageUrl;
      const issue = await IssueService.reportIssue({
        title: req.body.title,
        description: req.body.description,
        unitId: req.body.unitId,
        reporterId: profile.userId,
        fileUrl,
      });
      res.status(201).json({ success: true, message: 'Issue reported', data: issue });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker', 'tenant'] }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = (req as any).apartmentProfile;
      const apartmentId = profile.apartmentId;
      const issues = await IssueService.listIssues({ apartmentId, userId: profile.userId, role: profile.role });
      res.json({ success: true, data: issues });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id/status',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker'] }),
  zodValidate({ body: updateStatusSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await IssueService.updateStatus(req.params.id || '', req.body.status as IssueStatus);
      if (!updated) return res.status(404).json({ success: false, message: 'Issue not found' });
      res.json({ success: true, message: 'Issue status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }
);

export default router; 