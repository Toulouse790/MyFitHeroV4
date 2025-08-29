import React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outline';
}

const inputVariants = {
  default: 'border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
  filled:
    'bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
  outline: 'border-2 border-gray-300 focus:border-blue-500 bg-transparent',
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      variant = 'default',
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || React.useId();
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const togglePassword = () => setShowPassword(!showPassword);

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            type={inputType}
            className={cn(
              'px-3 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400',
              inputVariants[variant],
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              fullWidth && 'w-full',
              className
            )}
            ref={ref}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={togglePassword}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}

          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <span className="text-sm text-red-600">{error}</span>}

        {helperText && !error && <span className="text-sm text-gray-500">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
