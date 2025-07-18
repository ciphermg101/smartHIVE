import { forwardRef, TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ error, className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={`block w-full rounded border px-3 py-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary ${error ? 'border-red-500' : ''} ${className}`}
    {...props}
  />
));
Textarea.displayName = 'Textarea'; 