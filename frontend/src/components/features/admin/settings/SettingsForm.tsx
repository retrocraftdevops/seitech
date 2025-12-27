'use client';

import { ReactNode, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Save, X } from 'lucide-react';

interface SettingsFormProps {
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: (e: FormEvent) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  isDirty?: boolean;
  submitLabel?: string;
  showCancel?: boolean;
}

export function SettingsForm({
  title,
  description,
  children,
  onSubmit,
  onCancel,
  isLoading = false,
  isDirty = false,
  submitLabel = 'Save Changes',
  showCancel = true,
}: SettingsFormProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>

      {/* Form Content */}
      <form onSubmit={onSubmit}>
        <div className="px-6 py-6 space-y-6">{children}</div>

        {/* Footer with Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {isDirty && <span className="text-amber-600">You have unsaved changes</span>}
          </div>
          <div className="flex items-center gap-3">
            {showCancel && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                leftIcon={<X className="w-4 h-4" />}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={!isDirty && !isLoading}
              leftIcon={!isLoading ? <Save className="w-4 h-4" /> : undefined}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
