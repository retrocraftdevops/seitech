'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserForm } from '@/components/features/admin/users/UserForm';

export default function NewUserPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/admin/users', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // if (!response.ok) throw new Error('Failed to create user');

      console.log('Creating user:', data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message
      alert('User created successfully!');

      // Redirect to users list
      router.push('/users');
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
          <p className="text-gray-500 mt-1">Add a new user to the system</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <UserForm mode="create" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
