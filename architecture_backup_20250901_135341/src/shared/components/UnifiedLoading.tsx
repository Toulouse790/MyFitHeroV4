// shared/components/UnifiedLoading.tsx - COMPOSANT UNIFIÉ
// 🎯 Remplace AppLoadingSpinner + Loading (2 doublons)

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface UnifiedLoadingProps {
  // Tailles disponibles
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Variantes de loading
  variant?: 'spinner' | 'dots' | 'pulse' | 'progress';
  
  // Texte d'accompagnement
  message?: string;
  
  // Modes d'affichage
  fullScreen?: boolean;
  overlay?: boolean;
  
  // Style personnalisé
  className?: string;
  
  // Props de progression (compatible AppLoadingSpinner)
  showProgress?: boolean;
  progressPercent?: number;
}

const loadingSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const UnifiedLoading: React.FC<UnifiedLoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  message = 'Chargement...',
  fullScreen = false,
  overlay = false,
  className,
  showProgress = false,
  progressPercent = 60,
}) => {
  const renderLoadingElement = () => {
    switch (variant) {
      case 'spinner':
        return <Loader2 className={cn('animate-spin text-blue-600', loadingSizes[size])} />;

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={cn(
                  'bg-blue-600 rounded-full animate-pulse',
                  size === 'sm' && 'h-2 w-2',
                  size === 'md' && 'h-3 w-3',
                  size === 'lg' && 'h-4 w-4',
                  size === 'xl' && 'h-5 w-5'
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1.4s',
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return <div className={cn('bg-blue-600 rounded-full animate-pulse', loadingSizes[size])} />;

      case 'progress':
        return (
          <div className="w-48">
            <div className={cn('animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-2', loadingSizes[size])} />
            {showProgress && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full animate-pulse transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>
        );

      default:
        return <Loader2 className={cn('animate-spin text-blue-600', loadingSizes[size])} />;
    }
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      {renderLoadingElement()}
      {message && (
        <p className={cn(
          'text-gray-600 animate-pulse font-medium',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
          size === 'xl' && 'text-lg'
        )}>
          {message}
        </p>
      )}
    </div>
  );

  // Mode fullScreen (compatible AppLoadingSpinner)
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  // Mode overlay 
  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-10">
        {content}
      </div>
    );
  }

  // Mode inline (par défaut)
  return (
    <div className="flex items-center justify-center p-4">
      {content}
    </div>
  );
};

export default UnifiedLoading;

// Helpers pour migration facile depuis AppLoadingSpinner
export const AppLoadingSpinner: React.FC<{
  message?: string;
  showProgress?: boolean;
}> = ({ message = 'Chargement...', showProgress = false }) => (
  <UnifiedLoading 
    variant="progress"
    message={message}
    showProgress={showProgress}
    fullScreen
    size="lg"
  />
);

// Helpers pour migration facile depuis Loading
export const Loading: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}> = ({ text = 'Chargement...', ...props }) => (
  <UnifiedLoading 
    {...props}
    message={text}
  />
);
