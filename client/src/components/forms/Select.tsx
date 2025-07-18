import { forwardRef, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ error, className = '', ...props }, ref) => (
  <select
    ref={ref}
    className={`block w-full rounded border px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary ${error ? 'border-red-500' : ''} ${className}`}
    {...props}
  />
));
Select.displayName = 'Select'; 