import { v2 as cloudinary } from 'cloudinary';
import { AppException } from '@common/error-handler/errorHandler';
import { config } from '@config/configs';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const extractPublicIdFromUrl = (imageUrl: string): string | null => {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/').filter(part => part); // Remove empty parts
    const uploadIndex = pathParts.indexOf('upload');
    
    if (uploadIndex === -1 || uploadIndex === pathParts.length - 1) {
      console.warn('Invalid Cloudinary URL format - missing upload segment or path parts', { imageUrl });
      return null;
    }
    
    // Get the public ID parts after version (upload + version = 2 segments)
    const publicIdParts = pathParts.slice(uploadIndex + 2);
    
    if (publicIdParts.length === 0) {
      console.warn('No public ID found in URL', { imageUrl });
      return null;
    }
    
    // Join the parts to form the public ID and remove file extension
    let publicId = publicIdParts.join('/');
    const lastDotIndex = publicId.lastIndexOf('.');
    if (lastDotIndex > -1) {
      publicId = publicId.substring(0, lastDotIndex);
    }
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error, { imageUrl });
    return null;
  }
};

export class CloudinaryService {
  static async deleteImage(imageUrl: string) {
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) throw new AppException('Invalid image URL - could not extract public ID', 400);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok' || result.result === 'not found') return result;

    throw new AppException('Failed to delete image', 400, result);
  }

  static async deleteMultipleImages(imageUrls: string[]) {
    const success: string[] = [];
    const failed: string[] = [];
    const errors: { url: string; error: any }[] = [];

    const results = await Promise.allSettled(
      imageUrls.map(async url => {
        try {
          const publicId = extractPublicIdFromUrl(url);
          if (!publicId) {
            throw new AppException(`Could not extract public ID from URL: ${url}`);
          }

          const result = await cloudinary.uploader.destroy(publicId);
          return { url, result, publicId, status: result.result };
        } catch (error) {
          throw error;
        }
      })
    );

    results.forEach((result, index) => {
      const url = imageUrls[index];
      if (result.status === 'fulfilled') {
        const { status } = result.value;
        if (status === 'ok' || status === 'not found') {
          success.push(url);
        } else {
          failed.push(url);
          errors.push({ url, error: `Unexpected status: ${status}` });
        }
      } else {
        failed.push(url);
        errors.push({ url, error: result.reason?.message || 'Unknown error' });
      }
    });

    if (failed.length > 0) {
      console.error('Failed to delete some images:', errors);
      throw new AppException(
        `Failed to delete ${failed.length} image(s). First error: ${errors[0]?.error || 'Unknown error'}`,
        400,
        { success, failed, errors }
      );
    }

    return { success, failed };
  }
}
