'use client';

import { forwardRef } from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  label?: string;
  description?: string;
  error?: string;
}

const Switch = forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, label, description, error, id, ...props }, ref) => {
  const switchId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const switchElement = (
    <SwitchPrimitives.Root
      id={switchId}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary-600 data-[state=unchecked]:bg-gray-200',
        error && 'data-[state=unchecked]:bg-red-100',
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitives.Root>
  );

  if (!label && !description) {
    return switchElement;
  }

  return (
    <div className="flex items-start gap-3">
      {switchElement}
      <div className="flex-1">
        {label && (
          <label
            htmlFor={switchId}
            className="text-sm font-medium text-gray-700 cursor-pointer select-none"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
        {error && <p className="text-sm text-red-600 mt-0.5">{error}</p>}
      </div>
    </div>
  );
});

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
