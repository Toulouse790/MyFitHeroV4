import React from 'react';

interface AppLoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  small: 'w-4 h-4',
  medium: 'w-8 h-8',
  large: 'w-12 h-12'
};

export const AppLoadingSpinner: React.FC<AppLoadingSpinnerProps> = ({
  size = 'medium',
  message,
  className = '',
  fullScreen = false
}) => {
  const spinnerClasses = `${sizeClasses[size]} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin ${className}`;

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={spinnerClasses} />
      {message && (
        <p className="text-sm text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {content}
    </div>
  );
};

export default AppLoadingSpinner;
