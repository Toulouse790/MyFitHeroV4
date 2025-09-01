import React from 'react';

interface AppLoadingSpinnerProps {
  message?: string;
  showProgress?: boolean;
}

const AppLoadingSpinner: React.FC<AppLoadingSpinnerProps> = ({
  message = 'Chargement...',
  showProgress = false,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">{message}</p>
        {showProgress && (
          <div className="mt-4 w-48 bg-gray-200 rounded-full h-2 mx-auto">
            <div
              className="bg-blue-600 h-2 rounded-full animate-pulse"
              style={{ width: '60%' }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLoadingSpinner;
