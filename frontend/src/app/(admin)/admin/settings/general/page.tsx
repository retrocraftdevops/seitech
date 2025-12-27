'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SettingsNav } from '@/components/features/admin/settings';
import { SettingsForm } from '@/components/features/admin/settings';
import { ImageUploadField } from '@/components/features/admin/settings';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/Label';
import { useAuthStore } from '@/lib/stores/auth-store';
import { hasPermission } from '@/lib/utils/permissions';
import { toast } from '@/lib/utils/toast';

// Validation schema
const generalSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required').max(100),
  siteDescription: z.string().max(500).optional(),
  defaultCurrency: z.string().min(1, 'Currency is required'),
  timezone: z.string().min(1, 'Timezone is required'),
});

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

// Mock data - replace with actual API calls
const mockSettings = {
  siteName: 'SEI Tech International',
  siteDescription: 'Professional training and consultancy services',
  defaultCurrency: 'USD',
  timezone: 'America/New_York',
  logo: '',
  favicon: '',
};

const currencies = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'ZAR', label: 'South African Rand (ZAR)' },
  { value: 'KES', label: 'Kenyan Shilling (KES)' },
];

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg' },
  { value: 'Africa/Nairobi', label: 'Nairobi' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'UTC', label: 'UTC' },
];

export default function GeneralSettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(mockSettings.logo || null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(
    mockSettings.favicon || null
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: mockSettings,
  });

  useEffect(() => {
    // Check permissions
    if (user && !hasPermission(user.role, 'settings.edit')) {
      toast.error('Access Denied', 'You do not have permission to edit settings');
      router.push('/admin/settings');
    }
  }, [user, router]);

  const onSubmit = async (data: GeneralSettingsFormData) => {
    setIsLoading(true);

    try {
      // TODO: Implement actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Here you would typically upload files and save settings
      console.log('Form data:', data);
      console.log('Logo file:', logoFile);
      console.log('Favicon file:', faviconFile);

      toast.success('Settings Saved', 'General settings have been updated successfully');
      reset(data);
    } catch (error) {
      toast.error('Error', 'Failed to save settings. Please try again.');
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setLogoFile(null);
    setFaviconFile(null);
    setLogoPreview(mockSettings.logo || null);
    setFaviconPreview(mockSettings.favicon || null);
  };

  const handleLogoChange = (file: File | null, previewUrl: string | null) => {
    setLogoFile(file);
    setLogoPreview(previewUrl);
  };

  const handleFaviconChange = (file: File | null, previewUrl: string | null) => {
    setFaviconFile(file);
    setFaviconPreview(previewUrl);
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">General Settings</h1>
        <p className="text-gray-600">Manage your site's basic information and branding</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <SettingsNav />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Site Information */}
          <SettingsForm
            title="Site Information"
            description="Basic information about your site"
            onSubmit={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            isLoading={isLoading}
            isDirty={isDirty || !!logoFile || !!faviconFile}
          >
            <div className="space-y-6">
              <Input
                label="Site Name"
                {...register('siteName')}
                error={errors.siteName?.message}
                placeholder="Enter your site name"
                hint="This will be displayed in the browser tab and header"
              />

              <div>
                <Label htmlFor="site-description">Site Description</Label>
                <textarea
                  id="site-description"
                  {...register('siteDescription')}
                  rows={4}
                  className="mt-1.5 flex w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 transition-colors duration-200"
                  placeholder="Enter a brief description of your site"
                />
                {errors.siteDescription && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.siteDescription.message}
                  </p>
                )}
                <p className="mt-1.5 text-sm text-gray-500">
                  This will be used for SEO and social media sharing
                </p>
              </div>
            </div>
          </SettingsForm>

          {/* Branding */}
          <SettingsForm
            title="Branding"
            description="Upload your logo and favicon"
            onSubmit={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            isLoading={isLoading}
            isDirty={isDirty || !!logoFile || !!faviconFile}
          >
            <div className="space-y-6">
              <ImageUploadField
                label="Site Logo"
                value={logoPreview || undefined}
                onChange={handleLogoChange}
                hint="Recommended size: 200x60px. PNG or SVG format preferred."
                accept="image/png,image/jpeg,image/svg+xml"
                maxSize={2}
              />

              <ImageUploadField
                label="Favicon"
                value={faviconPreview || undefined}
                onChange={handleFaviconChange}
                hint="Recommended size: 32x32px or 64x64px. ICO or PNG format."
                accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                maxSize={1}
              />
            </div>
          </SettingsForm>

          {/* Localization */}
          <SettingsForm
            title="Localization"
            description="Configure currency and timezone settings"
            onSubmit={handleSubmit(onSubmit)}
            onCancel={handleCancel}
            isLoading={isLoading}
            isDirty={isDirty || !!logoFile || !!faviconFile}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="defaultCurrency" className="mb-2">
                  Default Currency
                </Label>
                <Controller
                  name="defaultCurrency"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.defaultCurrency && (
                  <p className="text-sm text-red-600 mt-1">{errors.defaultCurrency.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">This will be used for all pricing</p>
              </div>

              <div>
                <Label htmlFor="timezone" className="mb-2">
                  Timezone
                </Label>
                <Controller
                  name="timezone"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.timezone && (
                  <p className="text-sm text-red-600 mt-1">{errors.timezone.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">Used for scheduling and notifications</p>
              </div>
            </div>
          </SettingsForm>
        </div>
      </div>
    </div>
  );
}
