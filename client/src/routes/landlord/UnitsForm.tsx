import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from '@components/forms/FormField';
import { Input } from '@components/forms/Input';

const UnitSchema = z.object({
  unitNo: z.string().min(1, 'Unit number is required'),
  rent: z.number().min(0, 'Rent must be non-negative'),
});

type UnitForm = z.infer<typeof UnitSchema>;

interface UnitsFormProps {
  initialValues?: Partial<UnitForm>;
  onSubmit: (values: UnitForm) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function UnitsForm({ initialValues, onSubmit, onCancel, submitLabel = 'Save' }: UnitsFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UnitForm>({
    resolver: zodResolver(UnitSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 md:flex-row md:items-end">
      <FormField label="Unit No" name="unitNo" error={errors.unitNo}>
        <Input {...register('unitNo')} placeholder="Unit number" />
      </FormField>
      <FormField label="Rent" name="rent" error={errors.rent}>
        <Input type="number" step="0.01" {...register('rent', { valueAsNumber: true })} placeholder="Rent" />
      </FormField>
      <button type="submit" className="bg-primary text-white px-4 py-2 rounded focus:ring-2 focus:ring-primary hover:bg-primary/80 transition">{submitLabel}</button>
      {onCancel && (
        <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded focus:ring-2 focus:ring-gray-400 hover:bg-gray-400 transition">Cancel</button>
      )}
    </form>
  );
} 