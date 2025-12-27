'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AdminUser, UserRole } from '@/types/admin';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { Save, X, Loader2 } from 'lucide-react';

const userFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  role: z.enum(['student', 'student_admin', 'instructor', 'manager', 'admin']),
  isActive: z.boolean().default(true),
  sendWelcomeEmail: z.boolean().default(true),
  phone: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: AdminUser;
  mode: 'create' | 'edit';
  onSubmit?: (data: UserFormData) => Promise<void>;
  onCancel?: () => void;
}

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'student_admin', label: 'Student Admin' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];

export function UserForm({ user, mode, onSubmit, onCancel }: UserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user
      ? {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          phone: user.phone || '',
          sendWelcomeEmail: false,
          password: '',
        }
      : {
          email: '',
          firstName: '',
          lastName: '',
          role: 'student',
          isActive: true,
          sendWelcomeEmail: true,
          phone: '',
          password: '',
        },
  });

  const handleFormSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default implementation
        const endpoint = mode === 'create' ? '/api/admin/users' : `/api/admin/users/${user?.id}`;
        const method = mode === 'create' ? 'POST' : 'PUT';

        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Failed to save user');

        router.push('/users');
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {mode === 'create' ? 'Create New User' : 'Edit User'}
            </h3>
            <p className="text-sm text-gray-500">
              {mode === 'create'
                ? 'Fill in the details to create a new user account.'
                : 'Update user information and settings.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="First Name"
              placeholder="John"
              error={errors.firstName?.message}
              {...register('firstName')}
            />

            <Input
              label="Last Name"
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register('lastName')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="john.doe@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone (Optional)"
              type="tel"
              placeholder="+44 123 456 7890"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label={mode === 'create' ? 'Password' : 'New Password (Optional)'}
              type="password"
              placeholder={mode === 'create' ? 'Enter password' : 'Leave blank to keep current'}
              hint={
                mode === 'create'
                  ? 'Must be at least 8 characters'
                  : 'Only fill this if you want to change the password'
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <Select
              label="Role"
              options={roleOptions}
              value={watch('role')}
              onValueChange={(value) => setValue('role', value as UserRole)}
              error={errors.role?.message}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <Checkbox
              label="Active Account"
              {...register('isActive')}
            />

            {mode === 'create' && (
              <Checkbox
                label="Send welcome email with login credentials"
                {...register('sendWelcomeEmail')}
              />
            )}
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
          {!isSubmitting && <Save className="h-4 w-4" />}
          {mode === 'create' ? 'Create User' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
