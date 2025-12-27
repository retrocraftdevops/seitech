import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-gray-50 text-gray-900 border-gray-200',
      success: 'bg-green-50 text-green-900 border-green-200',
      warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
      error: 'bg-red-50 text-red-900 border-red-200',
      info: 'bg-blue-50 text-blue-900 border-blue-200',
    };

    const icons = {
      default: null,
      success: <CheckCircle className="h-4 w-4" />,
      warning: <AlertCircle className="h-4 w-4" />,
      error: <XCircle className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />,
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative w-full rounded-lg border p-4',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {icons[variant] && (
          <div className="absolute left-4 top-4">
            {icons[variant]}
          </div>
        )}
        <div className={cn(icons[variant] && 'pl-7')}>
          {children}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
