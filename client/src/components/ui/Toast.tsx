import { Toaster, toast } from 'sonner';

export function Toast() {
  return <Toaster richColors position="top-right" />;
}

export function showToast({ message, type = 'info' }: { message: string; type?: 'info' | 'success' | 'error' | 'warning' }) {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warning':
      toast.warning(message);
      break;
    default:
      toast(message);
  }
} 