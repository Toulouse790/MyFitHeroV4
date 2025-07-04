import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export const useToast = () => {
  const toast = ({ title, description, variant = 'default', duration = 4000 }: ToastOptions) => {
    const message = description ? `${title}: ${description}` : title;
    
    switch (variant) {
      case 'destructive':
        sonnerToast.error(message, { duration });
        break;
      case 'success':
        sonnerToast.success(message, { duration });
        break;
      default:
        sonnerToast(title, { 
          description,
          duration 
        });
        break;
    }
  };

  return { toast };
};

// Export du type pour compatibilité
export type Toast = ToastOptions;
