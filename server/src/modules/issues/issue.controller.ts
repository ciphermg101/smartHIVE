import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth, getAuth } from '@common/middleware/clerkAuth';
import { requireRole } from '@common/guards/roleGuard';
import { zodValidate } from '@utils/zodValidate';
import { upload } from '@common/middleware/upload';
import { IssueService } from '@modules/issues/issue.service';
import { IssueStatus } from '@modules/issues/issue.enum';
import { requireOwnership } from '@common/guards/ownershipGuard';

const router = Router();

const reportIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  unitId: z.string().min(1),
});

const updateStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'ignored']),
});

router.post(
  '/',
  requireAuth,
  requireRole('tenant'),
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    const auth = getAuth(req);
    try {
      reportIssueSchema.parse(req.body);
      const fileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
      const issue = await IssueService.reportIssue({
        title: req.body.title,
        description: req.body.description,
        unitId: req.body.unitId,
        reporterId: auth.userId || '',
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
  requireAuth,
  requireRole(['landlord', 'tenant']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      // Type guard for role extraction
      let role = '';
      if (auth.sessionClaims && typeof auth.sessionClaims === 'object' && 'publicMetadata' in auth.sessionClaims) {
        const pm = (auth.sessionClaims as { publicMetadata?: { role?: string } }).publicMetadata;
        role = pm?.role || '';
      }
      const issues = await IssueService.listIssues({ userId: auth.userId || '', role });
      res.json({ success: true, data: issues });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('landlord'),
  requireOwnership('unit'),
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