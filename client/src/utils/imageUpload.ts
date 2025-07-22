export interface ImageUploadOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeBytes?: number;
}

export interface ImageUploadProgress {
    progress: number;
    stage: 'compressing' | 'uploading' | 'complete';
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

export async function uploadImage(
    file: File,
    cloudinaryConfig: {
        uploadUrl: string;
        uploadPreset: string;
    },
    options: ImageUploadOptions = {}
): Promise<string> {
    return uploadImageToCloudinary(file, cloudinaryConfig, options);
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