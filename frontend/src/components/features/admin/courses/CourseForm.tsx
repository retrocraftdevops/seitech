'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';

const courseSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  shortDescription: z.string().min(20, 'Short description must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  price: z.number().min(0, 'Price must be positive'),
  instructor: z.string().min(1, 'Instructor is required'),
  thumbnail: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  initialData?: Partial<CourseFormData>;
  onSubmit: (data: CourseFormData) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CourseForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = 'Save Course',
}: CourseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData || {
      level: 'beginner',
      duration: 1,
      price: 0,
    },
  });

  // Auto-generate slug from name
  const name = watch('name');
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!initialData?.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

        <Input
          label="Course Name"
          {...register('name')}
          onChange={(e) => {
            register('name').onChange(e);
            handleNameChange(e);
          }}
          error={errors.name?.message}
          placeholder="e.g., Advanced Cloud Computing"
        />

        <Input
          label="Slug"
          {...register('slug')}
          error={errors.slug?.message}
          placeholder="advanced-cloud-computing"
          hint="URL-friendly version of the name"
        />

        <Textarea
          label="Short Description"
          {...register('shortDescription')}
          error={errors.shortDescription?.message}
          placeholder="Brief overview of the course (20-100 characters)"
          rows={3}
        />

        <Textarea
          label="Full Description"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Detailed description of what students will learn"
          rows={6}
        />
      </div>

      {/* Course Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Course Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={watch('category')} onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cloud-computing">Cloud Computing</SelectItem>
                <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                <SelectItem value="data-science">Data Science</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="web-development">Web Development</SelectItem>
                <SelectItem value="mobile-development">Mobile Development</SelectItem>
                <SelectItem value="ai-ml">AI & Machine Learning</SelectItem>
              </SelectContent>
            </Select>
            {errors.category?.message && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="level">Level</Label>
            <Select value={watch('level')} onValueChange={(value) => setValue('level', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            {errors.level?.message && (
              <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Duration (hours)"
            {...register('duration', { valueAsNumber: true })}
            error={errors.duration?.message}
            placeholder="e.g., 40"
          />

          <Input
            type="number"
            label="Price (USD)"
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
            placeholder="e.g., 299.99"
            step="0.01"
          />
        </div>

        <Input
          label="Instructor"
          {...register('instructor')}
          error={errors.instructor?.message}
          placeholder="Instructor name"
        />
      </div>

      {/* Media */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Media</h3>

        <Input
          label="Thumbnail URL"
          {...register('thumbnail')}
          error={errors.thumbnail?.message}
          placeholder="https://example.com/image.jpg"
          hint="Optional: URL to course thumbnail image"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
