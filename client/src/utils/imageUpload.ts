export interface ImageUploadOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeBytes?: number;
    folder?: string;
    apartmentName?: string;
    unitNumber?: string;
}

export interface ImageUploadProgress {
    progress: number;
    stage: 'compressing' | 'uploading' | 'complete';
}

export interface CloudinaryDeleteConfig {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
}

export function compressImage(
    file: File,
    options: ImageUploadOptions = {}
): Promise<File> {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.8
    } = options;

    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const img = new Image();

        img.onload = () => {
            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
                const widthRatio = maxWidth / width;
                const heightRatio = maxHeight / height;
                const ratio = Math.min(widthRatio, heightRatio);

                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        resolve(file);
                    }
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = () => resolve(file);
        img.src = URL.createObjectURL(file);
    });
}

export function validateImageFile(
    file: File,
    options: ImageUploadOptions = {}
): { isValid: boolean; error?: string } {
    const { maxSizeBytes = 3 * 1024 * 1024 } = options; // Default 3MB

    if (!file.type.startsWith('image/')) {
        return { isValid: false, error: 'Please select a valid image file' };
    }

    if (file.size > maxSizeBytes) {
        const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
        return {
            isValid: false,
            error: `Image size should not exceed ${maxSizeMB}MB`
        };
    }

    return { isValid: true };
}

/**
 * Generate a clean folder path for Cloudinary
 */
export function generateCloudinaryFolderPath(options: {
    apartmentName?: string;
    unitNumber?: string;
    customFolder?: string;
}): string {
    const { apartmentName, unitNumber, customFolder } = options;

    // If custom folder is provided, use it as-is
    if (customFolder) {
        return customFolder;
    }

    const cleanName = (name: string) =>
        name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '');

    let folderPath = 'apartments-images';

    if (apartmentName) {
        const cleanedApartmentName = cleanName(apartmentName);
        folderPath += `/${cleanedApartmentName}`;

        if (unitNumber) {
            const cleanedUnitNumber = cleanName(unitNumber.toString());
            folderPath += `/unit-${cleanedUnitNumber}`;
        }
    }

    return folderPath;
}

export async function uploadImageToCloudinary(
    file: File,
    cloudinaryConfig: {
        uploadUrl: string;
        uploadPreset: string;
    },
    options: ImageUploadOptions = {},
    onProgress?: (progress: ImageUploadProgress) => void
): Promise<string> {
    const validation = validateImageFile(file, options);
    if (!validation.isValid) {
        throw new Error(validation.error);
    }

    onProgress?.({ progress: 10, stage: 'compressing' });
    const compressedFile = await compressImage(file, options);

    onProgress?.({ progress: 30, stage: 'uploading' });

    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);
    formData.append("quality", "auto:good");
    formData.append("fetch_format", "auto");

    const folderPath = generateCloudinaryFolderPath({
        apartmentName: options.apartmentName,
        unitNumber: options.unitNumber,
        customFolder: options.folder
    });

    if (folderPath) {
        formData.append("folder", folderPath);
        formData.append("asset_folder", folderPath);

        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const publicId = `${folderPath}/${timestamp}_${randomSuffix}`;
        formData.append("public_id", publicId);
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const uploadProgress = 30 + (event.loaded / event.total) * 70; // 30-100%
                onProgress({ progress: uploadProgress, stage: 'uploading' });
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    onProgress?.({ progress: 100, stage: 'complete' });
                    resolve(data.secure_url);
                } catch (error) {
                    reject(new Error('Failed to parse upload response'));
                }
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        };

        xhr.onerror = () => reject(new Error('Upload failed due to network error'));
        xhr.ontimeout = () => reject(new Error('Upload timed out'));

        // Set timeout (30 seconds)
        xhr.timeout = 30000;

        xhr.open('POST', cloudinaryConfig.uploadUrl);
        xhr.send(formData);
    });
}

// Convenience function for apartment images
export async function uploadApartmentImage(
    file: File,
    cloudinaryConfig: { uploadUrl: string; uploadPreset: string },
    apartmentName: string,
    options: Omit<ImageUploadOptions, 'apartmentName'> = {},
    onProgress?: (progress: ImageUploadProgress) => void
): Promise<string> {
    return uploadImageToCloudinary(
        file,
        cloudinaryConfig,
        { ...options, apartmentName },
        onProgress
    );
}

// Convenience function for unit images
export async function uploadUnitImage(
    file: File,
    cloudinaryConfig: { uploadUrl: string; uploadPreset: string },
    apartmentName: string,
    unitNumber: string,
    options: Omit<ImageUploadOptions, 'apartmentName' | 'unitNumber'> = {},
    onProgress?: (progress: ImageUploadProgress) => void
): Promise<string> {
    return uploadImageToCloudinary(
        file,
        cloudinaryConfig,
        { ...options, apartmentName, unitNumber },
        onProgress
    );
}

export function getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
}

export function cleanupPreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
}

export function extractPublicIdFromUrl(imageUrl: string): string | null {
    try {
        const urlParts = imageUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex === -1) return null;

        let pathStart = uploadIndex + 1;
        if (urlParts[pathStart]?.startsWith('v')) {
            pathStart += 1;
        }

        const pathParts = urlParts.slice(pathStart);
        const fullPath = pathParts.join('/');

        return fullPath.replace(/\.[^/.]+$/, '');
    } catch (error) {
        console.error('Failed to extract public ID from URL:', error);
        return null;
    }
}

export async function deleteImageFromCloudinary(
    imageUrl: string,
    cloudinaryConfig: CloudinaryDeleteConfig
): Promise<boolean> {
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
        console.error('Could not extract public ID from URL:', imageUrl);
        return false;
    }

    try {
        const timestamp = Math.round(Date.now() / 1000);
        const signature = await generateCloudinarySignature(
            { public_id: publicId, timestamp },
            cloudinaryConfig.apiSecret
        );

        const formData = new FormData();
        formData.append('public_id', publicId);
        formData.append('timestamp', timestamp.toString());
        formData.append('api_key', cloudinaryConfig.apiKey);
        formData.append('signature', signature);

        const deleteUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/destroy`;

        const response = await fetch(deleteUrl, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        return result.result === 'ok';
    } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
        return false;
    }
}

async function generateCloudinarySignature(
    params: Record<string, any>,
    apiSecret: string
): Promise<string> {
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');

    const stringToSign = `${sortedParams}${apiSecret}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function deleteMultipleImagesFromCloudinary(
    imageUrls: string[],
    cloudinaryConfig: CloudinaryDeleteConfig
): Promise<{ success: string[]; failed: string[] }> {
    const results = await Promise.allSettled(
        imageUrls.map(url => deleteImageFromCloudinary(url, cloudinaryConfig))
    );

    const success: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
            success.push(imageUrls[index]);
        } else {
            failed.push(imageUrls[index]);
        }
    });

    return { success, failed };
}