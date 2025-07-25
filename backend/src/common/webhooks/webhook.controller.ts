import { Request, Response, NextFunction, Router } from 'express';
import { Webhook } from 'svix';
import { UserService } from '@modules/users/user.service';
import { AppException } from '@common/error-handler/errorHandler';
import { config } from '@config/configs';

const router = Router();

const verifyWebhook = (req: Request, res: Response, next: NextFunction) => {
  try {
    const WEBHOOK_SECRET = config.clerk.webhookSecret;
    if (!WEBHOOK_SECRET) {
      throw new AppException('Webhook secret not configured', 500);
    }

    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      throw new AppException('Missing required headers', 400);
    }

    const payload = JSON.stringify(req.body);
    const wh = new Webhook(WEBHOOK_SECRET);
    
    try {
      wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as any;
      next();
    } catch (err) {
      console.error('Webhook verification failed:', err);
      throw new AppException('Invalid webhook signature', 401);
    }
  } catch (error: any) {
    next(error);
  }
};

router.post('/clerk', verifyWebhook, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, data } = req.body;
    
    if (!type || !data) {
      throw new AppException('Invalid webhook payload', 400);
    }

    const result = await UserService.clerkSync(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
