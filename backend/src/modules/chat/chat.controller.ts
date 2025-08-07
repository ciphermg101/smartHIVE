import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authGuard } from '@common/guards/authGuard';
import { rolesGuard } from '@common/guards/rolesGuard';
import { zodValidate } from '@utils/zodValidate';
import { MessageService } from '@modules/chat/chat.service';

const router = Router();

const createMessageSchema = z.object({
  apartmentId: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['text', 'image', 'file', 'system']).optional(),
  replyTo: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const reactSchema = z.object({
  emoji: z.string().min(1),
});

const paginationSchema = z.object({
  before: z.string().datetime().optional(),
  limit: z.string().optional(),
  apartmentId: z.string().optional(),
});

router.post(
  '/',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker', 'tenant'], resourceType: 'apartment' }),
  zodValidate({ body: createMessageSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apartmentProfileId = (req as any).apartmentProfileId;
      const message = await MessageService.createMessage({
        ...req.body,
        senderId: apartmentProfileId,
      });

      res.status(201).json({ success: true, data: message });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:apartmentId',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker', 'tenant'], resourceType: 'apartment' }),
  zodValidate({ query: paginationSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apartmentProfileId = (req as any).apartmentProfileId;
      const { apartmentId } = req.params;

      const { before, limit } = (req as any).validatedQuery || {};

      const limitNumber = limit ? Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100) : 50;

      let beforeDate: Date | undefined;
      if (before) {
        const parsedDate = new Date(before);
        if (!isNaN(parsedDate.getTime())) {
          beforeDate = parsedDate;
        }
      }

      const result = await MessageService.getRecentMessages(
        apartmentId,
        apartmentProfileId,
        limitNumber, 
        beforeDate
      );

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:apartmentId/unread-count',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker', 'tenant'], resourceType: 'apartment' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apartmentProfileId = (req as any).apartmentProfileId;
      const { apartmentId } = req.params;

      const count = await MessageService.getUnreadCount(apartmentId, apartmentProfileId);

      res.json({ success: true, data: { unreadCount: count } });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/message/:messageId',
  authGuard,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apartmentProfileId = (req as any).apartmentProfileId;
      const { messageId } = req.params;

      if (!messageId) {
        return res.status(400).json({ success: false, message: 'Message ID is required' });
      }

      const fullMessage = await MessageService.getMessageById(messageId, apartmentProfileId);
      res.json({ success: true, data: fullMessage });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/message/:messageId/read',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker', 'tenant'], resourceType: 'apartment' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apartmentProfileId = (req as any).apartmentProfileId;
      const { messageId } = req.params;

      if (!messageId) {
        return res.status(400).json({ success: false, message: 'Message ID is required' });
      }

      await MessageService.markMessageAsRead(messageId, apartmentProfileId);
      res.json({ success: true, message: 'Message marked as read' });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:apartmentId/mark-all-read',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker', 'tenant'], resourceType: 'apartment' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apartmentProfileId = (req as any).apartmentProfileId;
      const { apartmentId } = req.params;

      if (!apartmentId) {
        return res.status(400).json({ success: false, message: 'Apartment ID is required' });
      }

      await MessageService.bulkMarkAsRead(apartmentId, apartmentProfileId);
      res.json({ success: true, message: 'All messages marked as read' });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/message/:messageId/react',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker', 'tenant'], resourceType: 'apartment' }),
  zodValidate({ body: reactSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apartmentProfileId = (req as any).apartmentProfileId;
      const { messageId } = req.params;

      if (!messageId) {
        return res.status(400).json({ success: false, message: 'Message ID is required' });
      }

      const updatedMessage = await MessageService.addReaction(
        messageId, 
        apartmentProfileId, 
        req.body.emoji
      );

      res.json({ success: true, data: updatedMessage });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:messageId/reactions',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker', 'tenant'], resourceType: 'apartment' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apartmentProfileId = (req as any).apartmentProfileId;
      const { messageId } = req.params;

      if (!messageId) {
        return res.status(400).json({ success: false, message: 'Message ID is required' });
      }

      const reactions = await MessageService.listReactions(messageId, apartmentProfileId);

      res.json({ success: true, data: reactions });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:messageId',
  authGuard,
  rolesGuard({ roles: ['owner', 'caretaker'], resourceType: 'apartment' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apartmentProfileId = (req as any).apartmentProfileId;
      const { messageId } = req.params;

      if (!messageId) {
        return res.status(400).json({ success: false, message: 'Message ID is required' });
      }

      await MessageService.deleteMessage(messageId, apartmentProfileId);
      res.status(204).json({ success: true, message: 'Message deleted' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;