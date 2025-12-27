'use client';

import { forwardRef, TextareaHTMLAttributes, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  hint?: string;
  showCharCount?: boolean;
  autoResize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      label,
      hint,
      id,
      showCharCount = false,
      autoResize = false,
      maxLength,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const [charCount, setCharCount] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
      if (value) {
        setCharCount(String(value).length);
      }
    }, [value]);

    useEffect(() => {
      if (autoResize && textareaRef.current) {
        // Reset height to auto to get the correct scrollHeight
        textareaRef.current.style.height = 'auto';
        // Set height to scrollHeight
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [value, autoResize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCharCount) {
        setCharCount(e.target.value.length);
      }
      onChange?.(e);
    };

    const setRefs = (element: HTMLTextAreaElement | null) => {
      textareaRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
            'transition-colors duration-200',
            autoResize ? 'resize-none overflow-hidden' : 'resize-y',
            error && 'border-red-500 focus:ring-red-400',
            className
          )}
          ref={setRefs}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          {...props}
        />
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex-1">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
          </div>
          {showCharCount && maxLength && (
            <p
              className={cn(
                'text-xs text-gray-500',
                charCount > maxLength * 0.9 && 'text-amber-600',
                charCount >= maxLength && 'text-red-600'
              )}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
