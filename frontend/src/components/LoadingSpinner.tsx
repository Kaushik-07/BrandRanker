import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const variantClasses = {
    default: 'border-indigo-600 border-t-transparent',
    primary: 'border-blue-600 border-t-transparent',
    success: 'border-green-600 border-t-transparent',
    warning: 'border-yellow-600 border-t-transparent',
    error: 'border-red-600 border-t-transparent'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div
          className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${variantClasses[variant]}`}
        />
        {text && (
          <p className="text-gray-600 font-medium text-center">{text}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner; 