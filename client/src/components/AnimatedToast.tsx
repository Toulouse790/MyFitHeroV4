import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useAnimatedToast } from '@/hooks/useAnimations';

interface AnimatedToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  isExiting: boolean;
  onRemove: (id: string) => void;
}

const AnimatedToast: React.FC<AnimatedToastProps> = ({ 
  id, 
  message, 
  type, 
  isExiting, 
  onRemove 
}) => {
  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-500',
          textColor: 'text-white'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-500',
          textColor: 'text-white'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-500',
          textColor: 'text-white'
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        ${config.bgColor} ${config.textColor}
        rounded-lg shadow-lg p-4
        transform transition-all duration-300 ease-out
        ${isExiting 
          ? 'translate-x-full opacity-0' 
          : 'translate-x-0 opacity-100'
        }
        animate-slideInRight
      `}
      style={{
        animation: !isExiting ? 'slideInRight 0.3s ease-out' : undefined
      }}
    >
      <div className="flex items-center space-x-3">
        <Icon size={20} />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={() => onRemove(id)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Barre de progression */}
      <div className="mt-2 w-full bg-white/20 rounded-full h-1">
        <div 
          className="bg-white rounded-full h-1 animate-progress"
          style={{
            animation: 'progress 3s linear forwards'
          }}
        />
      </div>
    </div>
  );
};

export const AnimatedToastContainer: React.FC = () => {
  const { toasts, addToast } = useAnimatedToast();

  // Expose addToast globally for use in other components
  React.useEffect(() => {
    (window as any).addAnimatedToast = addToast;
  }, [addToast]);

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast) => (
        <AnimatedToast
          key={toast.id}
          {...toast}
          onRemove={() => {
            // La suppression est gérée par le hook useAnimatedToast
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedToast;
