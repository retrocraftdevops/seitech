'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Users as UsersIcon } from 'lucide-react';
import { AdminUser } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import { UserTable } from '@/components/features/admin/users/UserTable';
import { UserFilters } from '@/components/features/admin/users/UserFilters';

// Mock data for development
const mockUsers: AdminUser[] = [
  {
    id: 1,
    email: 'john.doe@example.com',
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin',
    isActive: true,
    lastLogin: '2024-01-15T10:30:00Z',
    createdAt: '2023-06-01T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'instructor',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isActive: true,
    lastLogin: '2024-01-14T15:45:00Z',
    createdAt: '2023-07-15T09:00:00Z',
    updatedAt: '2024-01-14T15:45:00Z',
  },
  {
    id: 3,
    email: 'mike.johnson@example.com',
    name: 'Mike Johnson',
    firstName: 'Mike',
    lastName: 'Johnson',
    role: 'student',
    isActive: true,
    phone: '+44 123 456 7890',
    lastLogin: '2024-01-13T12:00:00Z',
    createdAt: '2023-08-20T10:00:00Z',
    updatedAt: '2024-01-13T12:00:00Z',
  },
  {
    id: 4,
    email: 'sarah.williams@example.com',
    name: 'Sarah Williams',
    firstName: 'Sarah',
    lastName: 'Williams',
    role: 'manager',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isActive: true,
    lastLogin: '2024-01-12T09:30:00Z',
    createdAt: '2023-09-01T11:00:00Z',
    updatedAt: '2024-01-12T09:30:00Z',
  },
  {
    id: 5,
    email: 'robert.brown@example.com',
    name: 'Robert Brown',
    firstName: 'Robert',
    lastName: 'Brown',
    role: 'student_admin',
    isActive: false,
    createdAt: '2023-10-10T12:00:00Z',
    updatedAt: '2023-12-01T14:00:00Z',
  },
];

function UsersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>(mockUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Fetch users from API
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/admin/users');
        // const data = await response.json();
        // setUsers(data.users);
        setUsers(mockUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Apply filters
    const search = searchParams?.get('search') || '';
    const role = searchParams?.get('role') || '';
    const status = searchParams?.get('status') || '';

    let filtered = [...users];

    if (search) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (role) {
      filtered = filtered.filter((user) => user.role === role);
    }

    if (status === 'active') {
      filtered = filtered.filter((user) => user.isActive);
    } else if (status === 'inactive') {
      filtered = filtered.filter((user) => !user.isActive);
    }

    setFilteredUsers(filtered);
  }, [searchParams, users]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => router.push('/users/new')}>
          <Plus className="h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
            <div className="bg-primary-100 rounded-full p-3">
              <UsersIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter((u) => u.isActive).length}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <UsersIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Instructors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter((u) => u.role === 'instructor').length}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {users.filter((u) => u.role === 'student').length}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <UserFilters />

      {/* Users Table */}
      <UserTable users={currentUsers} isLoading={isLoading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of{' '}
            {filteredUsers.length} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsersPageContent />
    </Suspense>
  );
}
