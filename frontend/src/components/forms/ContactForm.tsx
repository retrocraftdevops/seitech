'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').optional().or(z.literal('')),
  company: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        reset();
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
        <p className="text-gray-600">
          Thank you for contacting us. We'll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          placeholder="John Smith"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+44 1234 567890"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Company (Optional)"
          placeholder="Your Company Ltd"
          error={errors.company?.message}
          {...register('company')}
        />
      </div>

      <Input
        label="Subject"
        placeholder="How can we help you?"
        error={errors.subject?.message}
        {...register('subject')}
      />

      <div className="w-full">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
          Message
        </label>
        <textarea
          id="message"
          rows={6}
          placeholder="Tell us about your requirements..."
          className={`flex w-full rounded-xl border ${
            errors.message ? 'border-red-500' : 'border-gray-200'
          } bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
            errors.message ? 'focus:ring-red-400' : 'focus:ring-primary-400'
          } focus:border-transparent transition-colors duration-200`}
          {...register('message')}
        />
        {errors.message && <p className="mt-1.5 text-sm text-red-600">{errors.message.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full md:w-auto" isLoading={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
