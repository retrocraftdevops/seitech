'use client';

import { useState, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CreateInstructorData, UpdateInstructorData, AdminInstructor } from '@/types/admin';
import { Upload, X, User } from 'lucide-react';
import Image from 'next/image';

interface InstructorFormProps {
  instructor?: AdminInstructor;
  onSubmit: (data: CreateInstructorData | UpdateInstructorData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function InstructorForm({
  instructor,
  onSubmit,
  onCancel,
  isLoading = false,
}: InstructorFormProps) {
  const [formData, setFormData] = useState({
    email: instructor?.email || '',
    firstName: instructor?.firstName || '',
    lastName: instructor?.lastName || '',
    password: '',
    title: instructor?.title || '',
    bio: instructor?.bio || '',
    linkExistingUser: false,
  });

  const [specializations, setSpecializations] = useState<string[]>(
    instructor?.specializations || []
  );
  const [specializationInput, setSpecializationInput] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    instructor?.avatar || null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddSpecialization = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && specializationInput.trim()) {
      e.preventDefault();
      const newSpec = specializationInput.trim();
      if (!specializations.includes(newSpec)) {
        setSpecializations([...specializations, newSpec]);
      }
      setSpecializationInput('');
    }
  };

  const handleRemoveSpecialization = (spec: string) => {
    setSpecializations(specializations.filter((s) => s !== spec));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, avatar: 'Please select an image file' }));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, avatar: 'Image must be less than 5MB' }));
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.avatar) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.avatar;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!instructor && !formData.linkExistingUser && !formData.password) {
      newErrors.password = 'Password is required for new users';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data: CreateInstructorData | UpdateInstructorData = {
      ...formData,
      specializations,
      avatar: avatarFile || undefined,
    };

    // Remove password if empty for updates
    if (instructor && !formData.password) {
      delete (data as any).password;
    }

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Create Mode Toggle */}
      {!instructor && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.linkExistingUser}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, linkExistingUser: e.target.checked }))
              }
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-400"
            />
            <span className="text-sm font-medium text-gray-700">
              Link to existing user account
            </span>
          </label>
          <p className="text-xs text-gray-600 mt-1 ml-6">
            Check this if the user already has an account in the system
          </p>
        </div>
      )}

      {/* Avatar Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Photo
        </label>
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-200">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                <User className="h-12 w-12" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
            {errors.avatar && (
              <p className="mt-1.5 text-sm text-red-600">{errors.avatar}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          disabled={!!instructor}
        />

        {!instructor && !formData.linkExistingUser && (
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            hint="Minimum 8 characters"
            required
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          required
        />

        <Input
          label="Last Name"
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          required
        />
      </div>

      <Input
        label="Title"
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        hint="e.g., Senior Software Engineer, Data Science Expert"
      />

      <Textarea
        label="Bio"
        name="bio"
        value={formData.bio}
        onChange={handleChange}
        rows={4}
        hint="A brief description of the instructor's background and expertise"
      />

      {/* Specializations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specializations
        </label>
        <Input
          type="text"
          value={specializationInput}
          onChange={(e) => setSpecializationInput(e.target.value)}
          onKeyDown={handleAddSpecialization}
          placeholder="Type a specialization and press Enter"
          hint="e.g., React, Node.js, Machine Learning"
        />
        {specializations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {specializations.map((spec) => (
              <Badge key={spec} variant="primary" className="pl-3 pr-1">
                {spec}
                <button
                  type="button"
                  onClick={() => handleRemoveSpecialization(spec)}
                  className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {instructor ? 'Update Instructor' : 'Create Instructor'}
        </Button>
      </div>
    </form>
  );
}
