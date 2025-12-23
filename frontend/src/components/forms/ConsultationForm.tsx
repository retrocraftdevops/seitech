'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const consultationSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  companyName: z.string().optional(),
  serviceInterested: z.array(z.string()).min(1, 'Please select at least one service'),
  message: z.string().optional(),
  preferredContact: z.enum(['email', 'phone']),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

const serviceOptions = [
  { id: 'training', label: 'Training Courses' },
  { id: 'fire-risk', label: 'Fire Risk Assessment' },
  { id: 'hs-audit', label: 'Health & Safety Audit' },
  { id: 'iso', label: 'ISO Management' },
  { id: 'consultancy', label: 'General Consultancy' },
  { id: 'other', label: 'Other' },
];

export function ConsultationForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      serviceInterested: [],
      preferredContact: 'email',
    },
  });

  const selectedServices = watch('serviceInterested');

  const onSubmit = async (data: ConsultationFormData) => {
    try {
      // Submit to API
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Thank You!
        </h3>
        <p className="text-gray-600">
          We've received your request and will be in touch within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="John"
          {...register('firstName')}
          error={errors.firstName?.message}
        />
        <Input
          label="Last Name"
          placeholder="Smith"
          {...register('lastName')}
          error={errors.lastName?.message}
        />
      </div>

      {/* Contact Fields */}
      <Input
        label="Email Address"
        type="email"
        placeholder="john@company.com"
        {...register('email')}
        error={errors.email?.message}
      />

      <Input
        label="Phone Number"
        type="tel"
        placeholder="01234 567890"
        {...register('phone')}
        error={errors.phone?.message}
      />

      <Input
        label="Company Name (Optional)"
        placeholder="Your Company Ltd"
        {...register('companyName')}
      />

      {/* Services Interested */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services Interested In
        </label>
        <div className="grid grid-cols-2 gap-2">
          {serviceOptions.map((service) => (
            <label
              key={service.id}
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                selectedServices?.includes(service.id)
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <input
                type="checkbox"
                value={service.id}
                {...register('serviceInterested')}
                className="sr-only"
              />
              <div
                className={cn(
                  'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                  selectedServices?.includes(service.id)
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                )}
              >
                {selectedServices?.includes(service.id) && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="text-sm">{service.label}</span>
            </label>
          ))}
        </div>
        {errors.serviceInterested && (
          <p className="mt-1.5 text-sm text-red-600">
            {errors.serviceInterested.message}
          </p>
        )}
      </div>

      {/* Preferred Contact Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Contact Method
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="email"
              {...register('preferredContact')}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Email</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="phone"
              {...register('preferredContact')}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Phone</span>
          </label>
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Additional Message (Optional)
        </label>
        <textarea
          rows={3}
          placeholder="Tell us more about your requirements..."
          {...register('message')}
          className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Request Consultation'}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By submitting this form, you agree to our{' '}
        <a href="/privacy" className="text-primary-600 hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
