import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authGuard } from '@common/guards/authGuard';
import { zodValidate } from '@utils/zodValidate';
import { CloudinaryService } from '@common/cloudinary/cloudinary.service';

const router = Router();

const deleteImageSchema = z.object({
  imageUrl: z.string().url(),
});

const deleteMultipleImagesSchema = z.object({
  imageUrls: z.array(z.string().url()).min(1),
});

router.post(
  '/delete',
  authGuard,
  zodValidate({ body: deleteImageSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await CloudinaryService.deleteImage(req.body.imageUrl);
      res.json({ success: true, result });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/delete-multiple',
  authGuard,
  zodValidate({ body: deleteMultipleImagesSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await CloudinaryService.deleteMultipleImages(req.body.imageUrls);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
