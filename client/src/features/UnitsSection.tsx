import React, { useState } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { toast } from 'sonner';
import { Skeleton } from '@components/ui/skeleton';
import { Loader2, X, Upload, Image as ImageIcon, Edit, User, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@components/ui/dialog';
import { useApartmentStore } from '@store/apartment';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form';
import { useCreateUnit, useUnits, useUpdateUnit, useDeleteUnit } from '@hooks/useUnits';
import {
  uploadUnitImage,
  validateImageFile,
  createPreviewUrl,
  cleanupPreviewUrl,
  deleteImageFromCloudinary,
  type ImageUploadProgress
} from '@utils/imageUpload';

const imageUploadConfig = {
  uploadUrl: import.meta.env.VITE_CLOUDINARY_UPLOAD_URL,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
};

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

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
  const apartmentName = selectedProfile?.name || '';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<ImageUploadProgress | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [flippedUnits, setFlippedUnits] = useState<Record<string, boolean>>({});
  const [editingUnit, setEditingUnit] = useState<{ id: string, unitNo: string, rent: number } | null>(null);

  const { data: units = [], isLoading } = useUnits(apartmentId);
  const createUnitMutation = useCreateUnit(apartmentId);
  const updateUnitMutation = useUpdateUnit(apartmentId);
  const { mutate: deleteUnit, isPending: isDeleting } = useDeleteUnit(apartmentId);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema) as any,
    defaultValues: {
      unitNo: '',
      rent: 0,
    },
  });

  const handleFlip = (unitId: string) => {
    setFlippedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  const handleEditClick = (e: React.MouseEvent, unit: any) => {
    e.stopPropagation();
    setEditingUnit({
      id: unit._id,
      unitNo: unit.unitNo,
      rent: unit.rent
    });
    form.reset({
      unitNo: unit.unitNo,
      rent: unit.rent,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, unitId: string) => {
    e.stopPropagation();
    setUnitToDelete(unitId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!unitToDelete) return;

    const unitToDeleteData = units.find(u => u._id === unitToDelete);

    deleteUnit(unitToDelete, {
      onSuccess: async () => {

        if (unitToDeleteData?.imageUrl) {
          try {
            await deleteImageFromCloudinary(unitToDeleteData.imageUrl);
            console.log('Deleted unit image from Cloudinary');
          } catch (deleteError) {
            console.error('Failed to delete unit image from Cloudinary:', deleteError);
          }
        }

        toast.success('Unit deleted successfully');
        setIsDeleteDialogOpen(false);
        setUnitToDelete(null);
      },
      onError: () => {
        toast.error('Failed to delete unit');
      }
    });
  };

  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState("");

  const onSubmit = async (data: UnitFormValues) => {
    try {
      setFormError(null);
      setUploading(true);
      setUploadProgress({ progress: 0, stage: 'compressing' });

      setUploadedImageUrl("");
      const originalUrl = editingUnit?.id ? units.find(u => u._id === editingUnit.id)?.imageUrl || '' : '';
      setOriginalImageUrl(originalUrl);
      let imageUrl = originalUrl;
      
      if (selectedFile) {
        try {
          imageUrl = await uploadUnitImage(
            selectedFile,
            imageUploadConfig,
            apartmentName,
            data.unitNo,
            {
              maxWidth: 1200,
              maxHeight: 1200,
              quality: 0.8,
              maxSizeBytes: MAX_IMAGE_SIZE,
            },
            (progress: ImageUploadProgress) => setUploadProgress(progress)
          );
          setUploadedImageUrl(imageUrl);
        } catch (error) {
          setFormError(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setUploading(false);
          setUploadProgress(null);
          return;
        }
      }

      const payload = {
        unitNo: data.unitNo,
        rent: data.rent,
        ...(imageUrl && { imageUrl })
      };

      if (editingUnit?.id) {
        await updateUnitMutation.mutateAsync({
          id: editingUnit.id,
          ...payload
        });

        if (uploadedImageUrl && originalImageUrl && originalImageUrl !== uploadedImageUrl) {
          try {
            await deleteImageFromCloudinary(originalImageUrl);
            console.log('Deleted old unit image');
          } catch (deleteError) {
            console.error('Failed to delete old unit image:', deleteError);
          }
        }

        toast.success('Unit updated successfully');
      } else {
        await createUnitMutation.mutateAsync({
          ...payload,
          apartmentId,
        });
        toast.success('Unit created successfully');
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {

      if (uploadedImageUrl && uploadedImageUrl !== originalImageUrl) {
        try {
          await deleteImageFromCloudinary(uploadedImageUrl);
          console.log('Cleaned up uploaded image after unit operation failure');
        } catch (deleteError) {
          console.error('Failed to clean up uploaded image:', deleteError);
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const resetForm = () => {
    form.reset();
    setSelectedFile(null);
    if (previewUrl) {
      cleanupPreviewUrl(previewUrl);
    }
    setPreviewUrl('');
    setUploadProgress(null);
    setEditingUnit(null);
    setFormError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, { maxSizeBytes: MAX_IMAGE_SIZE });
    if (!validation.isValid) {
      toast.error(validation.error!);
      return;
    }

    if (previewUrl) {
      cleanupPreviewUrl(previewUrl);
    }

    setSelectedFile(file);
    const url = createPreviewUrl(file);
    setPreviewUrl(url);
    setFormError(null);
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        cleanupPreviewUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Units</h2>
          <p className="text-sm text-muted-foreground">
            Managing units for <span className="font-medium">{apartmentName}</span>
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Add New Unit</Button>
      </div>

      {units.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No units added yet.</p>
          <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
            Add Your First Unit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {units.map((unit) => (
            <div
              key={unit._id}
              className={`relative h-64 transition-all duration-500 [transform-style:preserve-3d] cursor-pointer ${flippedUnits[unit._id] ? '[transform:rotateY(180deg)]' : ''}`}
              onClick={() => handleFlip(unit._id)}
            >
              {/* Front of the card */}
              <div className="absolute inset-0 backface-hidden rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
                <div className="h-full flex flex-col">
                  <div className="h-32 bg-muted relative overflow-hidden rounded-t-lg">
                    {unit.imageUrl ? (
                      <img
                        src={unit.imageUrl}
                        alt={`Unit ${unit.unitNo}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-medium">
                      {unit.status || 'Available'}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">Unit {unit.unitNo}</h3>
                      <span className="text-lg font-bold text-primary">KSh {unit.rent.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {unit.tenantId ? 'Occupied' : 'Available'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Back of the card */}
              <div className="absolute inset-0 [transform:rotateY(180deg)] backface-hidden rounded-lg border bg-card p-4 shadow-sm">
                <div className="h-full flex flex-col">
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    {unit.tenantId ? (
                      <>
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <User className="h-8 w-8 text-primary" />
                        </div>
                        <h4 className="font-medium">Tenant ID</h4>
                        <p className="text-sm text-muted-foreground break-all">{unit.tenantId}</p>
                      </>
                    ) : (
                      <div className="text-muted-foreground">
                        <User className="h-10 w-10 mx-auto mb-2" />
                        <p>No tenant assigned</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleEditClick(e, unit)}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Unit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => handleDeleteClick(e, unit._id)}
                      className="w-full"
                      disabled={isDeleting && unitToDelete === unit._id}
                    >
                      {isDeleting && unitToDelete === unit._id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete Unit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Unit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this unit? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Unit'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Unit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open) {
          resetForm();
        }
        setIsModalOpen(open);
      }}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUnit ? 'Edit Unit' : 'Add New Unit'}</DialogTitle>
            <DialogDescription>
              {editingUnit ? 'Update unit information' : 'Add a new unit to your apartment'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="unitNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A1, 101, B-12" {...field} />
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
                    <FormLabel>Monthly Rent (KSh)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 25000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label>Unit Image (Optional)</Label>
                <div className="text-xs text-muted-foreground mb-2">
                  Will be saved to: apartments-images/{apartmentName}/unit-{form.watch('unitNo') || 'XXX'}/
                </div>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="unit-image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    {previewUrl || (editingUnit?.id && units.find(u => u._id === editingUnit.id)?.imageUrl) ? (
                      <div className="relative w-full h-full">
                        <img
                          src={previewUrl || units.find(u => u._id === editingUnit?.id)?.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 p-1 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background/90 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (previewUrl) {
                              cleanupPreviewUrl(previewUrl);
                            }
                            setPreviewUrl('');
                            setSelectedFile(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WEBP (max. 3MB)
                        </p>
                      </div>
                    )}
                    <input
                      id="unit-image"
                      type="file"
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                </div>
                {uploadProgress && (
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {uploadProgress.stage === 'compressing' && 'Compressing image...'}
                      {uploadProgress.stage === 'uploading' && `Uploading to Cloudinary... ${Math.round(uploadProgress.progress)}%`}
                      {uploadProgress.stage === 'complete' && 'Upload complete!'}
                    </p>
                  </div>
                )}
                {formError && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                    {formError}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading || !form.formState.isValid}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingUnit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : editingUnit ? (
                    'Update Unit'
                  ) : (
                    'Add Unit'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnitsSection;