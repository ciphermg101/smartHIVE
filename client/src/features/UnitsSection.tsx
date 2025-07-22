import React, { useState, useEffect } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import { Loader2, X, Upload, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog';
import { useApartmentStore } from '@store/apartment';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form';
import { useCreateUnit, useUnits } from '@hooks/useUnits';
import { 
  uploadImageToCloudinary, 
  validateImageFile, 
  createPreviewUrl,
  cleanupPreviewUrl,
  type ImageUploadProgress 
} from '@utils/imageUpload';

const imageUploadConfig = {
  uploadUrl: import.meta.env.VITE_CLOUDINARY_UPLOAD_URL,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB

const unitFormSchema = z.object({
  unitNo: z.string()
    .min(1, 'Unit number is required')
    .regex(/^[A-Za-z0-9-]+$/, 'Only letters, numbers, and hyphens are allowed'),
  rent: z.coerce.number()
    .min(0, 'Rent must be a positive number')
    .max(1000000, 'Rent seems too high'),
  image: z.any()
    .refine(file => !file || file.size <= MAX_IMAGE_SIZE, 'Image must be less than 3MB')
    .refine(
      file => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Only .jpg, .png, and .webp formats are supported'
    )
    .optional(),
});

type UnitFormValues = z.infer<typeof unitFormSchema>;

const UnitsSection: React.FC = () => {
  const selectedProfile = useApartmentStore((s) => s.selectedProfile);
  const apartmentId = selectedProfile?.profile.apartmentId || '';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<ImageUploadProgress | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: units = [], isLoading } = useUnits(apartmentId);
  const createUnitMutation = useCreateUnit(apartmentId);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema) as any,
    defaultValues: {
      unitNo: '',
      rent: 0,
    },
  });

  const onSubmit = async (data: UnitFormValues) => {
    try {
      setFormError(null);
      setUploading(true);
      setUploadProgress({ progress: 0, stage: 'compressing' });

      let imageUrl = '';

      if (selectedFile) {
        try {
          const folderName = selectedProfile?.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          
          imageUrl = await uploadImageToCloudinary(
            selectedFile,
            imageUploadConfig,
            {
              maxWidth: 1200,
              maxHeight: 1200,
              quality: 0.8,
              maxSizeBytes: MAX_IMAGE_SIZE,
              folder: `apartments/${folderName}/units`
            },
            (progress) => setUploadProgress(progress)
          );
        } catch (error) {
          setFormError(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setUploading(false);
          setUploadProgress(null);
          return;
        }
      }

      await createUnitMutation.mutateAsync({
        apartmentId,
        unitNo: data.unitNo,
        rent: data.rent,
        ...(imageUrl && { imageUrl }),
      });

      toast.success('Unit created successfully', {
        duration: 2000,
        position: 'top-center',
      });
      
      setTimeout(() => {
        setIsModalOpen(false);
        form.reset();
        setPreviewUrl('');
        setSelectedFile(null);
        setUploading(false);
        setUploadProgress(null);
      }, 500);
    } catch (error) {
      setFormError('Failed to create unit. Please try again.');
      toast.error('Failed to create unit. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, { maxSizeBytes: MAX_IMAGE_SIZE });
    if (!validation.isValid) {
      setFormError(validation.error!);
      return;
    }

    if (previewUrl) {
      cleanupPreviewUrl(previewUrl);
    }

    setSelectedFile(file);
    setFormError(null);
    
    const newPreviewUrl = createPreviewUrl(file);
    setPreviewUrl(newPreviewUrl);
    form.setValue('image', file as any);
    
    setUploadProgress(null);
  };

  const removeImage = () => {
    if (previewUrl) {
      cleanupPreviewUrl(previewUrl);
    }
    setPreviewUrl('');
    setSelectedFile(null);
    form.setValue('image', undefined);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        cleanupPreviewUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleModalClose = (open: boolean) => {
    if (!open) {
      if (previewUrl) {
        cleanupPreviewUrl(previewUrl);
        setPreviewUrl('');
      }
      setFormError(null);
      setUploadProgress(null);
      setUploading(false);
      form.reset();
    }
    setIsModalOpen(open);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Units</h2>
          <Button
            variant="default"
            size="lg"
            className="font-semibold px-6 py-3 rounded-lg shadow-md"
          >
            + Add Unit
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Units</h2>
        <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              size="lg"
              className="font-semibold px-6 py-3 rounded-lg shadow-md"
            >
              + Add Unit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Unit</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(onSubmit)();
              }} className="space-y-4">
                <FormField
                  control={form.control}
                  name="unitNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Rent (Ksh)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 15000"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label htmlFor="unit-image">Unit Image (Optional)</Label>
                  <label 
                    htmlFor="unit-image"
                    className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1 text-center">
                      {previewUrl ? (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Unit preview"
                            className="h-48 w-full object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto flex items-center justify-center h-12 w-12 text-gray-400">
                            <ImageIcon className="h-12 w-12" />
                          </div>
                          <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <span className="relative rounded-md bg-transparent font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                              Upload a file
                            </span>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, WEBP up to 3MB
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      id="unit-image"
                      name="unit-image"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  {formError && (
                    <p className="mt-1 text-sm text-destructive">{formError}</p>
                  )}
                  {uploadProgress && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>
                          {uploadProgress.stage === 'compressing' 
                            ? 'Compressing...' 
                            : 'Uploading...'}
                        </span>
                        <span>{Math.round(uploadProgress.progress)}%</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300 ease-in-out"
                          style={{ width: `${uploadProgress.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={createUnitMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createUnitMutation.isPending || uploading}
                    className="w-full sm:w-auto"
                  >
                    {uploading || createUnitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploadProgress?.stage === 'uploading' ? 'Uploading...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Create Unit
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {units.length === 0 ? (
        <div className="bg-card dark:bg-zinc-900 rounded-xl shadow-sm border border-border p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">No units found for this apartment.</p>
          <Button
              variant="default"
              size="lg"
              className="font-semibold px-6 py-3 rounded-lg shadow-md"
              onClick={() => setIsModalOpen(true)}
            >
              + Add Your First Unit
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {units.map((unit) => (
            <Card key={unit._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 relative">
                {unit.imageUrl && (
                  <div className="absolute inset-0 overflow-hidden rounded-t-lg">
                    <img
                      src={unit.imageUrl}
                      alt={`Unit ${unit.unitNo}`}
                      className="w-full h-32 object-cover opacity-20"
                    />
                  </div>
                )}
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-2xl font-bold">Unit {unit.unitNo}</CardTitle>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${unit.status === 'OCCUPIED'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : unit.status === 'MAINTENANCE'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                      {unit.status.charAt(0) + unit.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rent:</span>
                    <span className="font-medium">Ksh {unit.rent.toLocaleString()}/month</span>
                  </div>
                  {unit.tenantId && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      <span>Occupied</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnitsSection;