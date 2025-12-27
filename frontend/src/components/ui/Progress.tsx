import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, size = 'md', variant = 'default', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    const variantClasses = {
      default: 'bg-blue-600',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      danger: 'bg-red-600',
    };

    return (
      <div ref={ref} className={cn('relative w-full', className)} {...props}>
        <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
          <div
            className={cn('h-full transition-all duration-300 ease-in-out', variantClasses[variant])}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className="text-xs text-gray-600 mt-1 block">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
