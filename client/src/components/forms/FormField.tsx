import { ReactNode } from 'react';
import { FieldError } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  name: string;
  error?: FieldError;
  children: ReactNode;
}

export function FormField({ label, name, error, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block font-medium mb-1">
        {label}
      </label>
      {children}
      {error && <div className="text-red-500 text-sm mt-1">{error.message}</div>}
    </div>
  );
} 