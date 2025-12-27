'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (file: File | null, previewUrl: string | null) => void;
  onRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  hint?: string;
  error?: string;
  aspectRatio?: string;
  disabled?: boolean;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  onRemove,
  accept = 'image/png,image/jpeg,image/jpg,image/webp',
  maxSize = 5,
  hint,
  error,
  aspectRatio,
  disabled = false,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload an image file.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setPreview(previewUrl);
      onChange(file, previewUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
    onChange(null, null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <Label className="mb-3">{label}</Label>

      <div className="space-y-4">
        {/* Preview */}
        {preview ? (
          <div className="relative inline-block">
            <div
              className={cn(
                'relative rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50',
                aspectRatio && `aspect-${aspectRatio}`
              )}
              style={{ maxWidth: '300px' }}
            >
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
            <Button
              type="button"
              variant="danger"
              size="icon-sm"
              onClick={handleRemove}
              disabled={disabled}
              className="absolute -top-2 -right-2 shadow-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div
            onClick={disabled ? undefined : handleClick}
            className={cn(
              'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              disabled
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50/50 cursor-pointer'
            )}
            style={{ maxWidth: '300px' }}
          >
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {accept.split(',').map((t) => t.split('/')[1].toUpperCase()).join(', ')} up to{' '}
              {maxSize}MB
            </p>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={disabled}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            {preview ? 'Change Image' : 'Upload Image'}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
            >
              Remove
            </Button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {/* Error or Hint */}
        {(uploadError || error) && (
          <p className="text-sm text-red-600">{uploadError || error}</p>
        )}
        {hint && !uploadError && !error && (
          <p className="text-sm text-gray-500">{hint}</p>
        )}
      </div>
    </div>
  );
}
