import React, { useState, useEffect } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import { Loader2, X } from 'lucide-react';
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
import { useCreateUnit, useUnits, useUploadUnitImage } from '@hooks/useUnits';

const unitFormSchema = z.object({
  unitNo: z.string().min(1, 'Unit number is required'),
  rent: z.coerce.number().min(0, 'Rent must be a positive number'),
  image: z.any().optional(),
});

type UnitFormValues = z.infer<typeof unitFormSchema>;

const UnitsSection: React.FC = () => {
  const { selectedApartment } = useApartmentStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const { data: units = [], isLoading } = useUnits(selectedApartment || '');
  const createUnitMutation = useCreateUnit(selectedApartment || '');
  const uploadImageMutation = useUploadUnitImage();

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema) as any,
    defaultValues: {
      unitNo: '',
      rent: 0,
    },
  });

  const onSubmit = async (data: UnitFormValues) => {
    try {
      let imageUrl = '';

      if (data.image?.[0]) {
        const file = data.image[0];
        const { imageUrl: uploadedUrl } = await uploadImageMutation.mutateAsync(file);
        imageUrl = uploadedUrl;
      }

      await createUnitMutation.mutateAsync({
        unitNo: data.unitNo,
        rent: data.rent,
        ...(imageUrl && { imageUrl }),
      });

      toast.success('Unit created successfully');
      setIsModalOpen(false);
      form.reset();
      setPreviewUrl('');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to create unit. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setPreviewUrl('');
    form.setValue('image', undefined);
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
                  <Input
                    id="unit-image"
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
                    onChange={(e) => {
                      handleFileChange(e);
                      form.setValue('image', e.target.files);
                    }}
                  />
                  {previewUrl && (
                    <div className="relative mt-2">
                      <img
                        src={previewUrl}
                        alt="Unit preview"
                        className="h-32 w-32 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={uploadImageMutation.isPending || createUnitMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createUnitMutation.isPending || uploadImageMutation.isPending}
                  >
                    {createUnitMutation.isPending || uploadImageMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploadImageMutation.isPending ? 'Uploading...' : 'Creating...'}
                      </>
                    ) : 'Create Unit'}
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