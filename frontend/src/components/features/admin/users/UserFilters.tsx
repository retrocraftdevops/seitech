'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/select';
import { Button } from '@/components/ui/Button';

interface UserFiltersProps {
  onFiltersChange?: (filters: UserFilterValues) => void;
}

export interface UserFilterValues {
  search?: string;
  role?: string;
  status?: string;
}

const roleOptions: SelectOption[] = [
  { value: '', label: 'All Roles' },
  { value: 'student', label: 'Student' },
  { value: 'student_admin', label: 'Student Admin' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function UserFilters({ onFiltersChange }: UserFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  const updateFilters = (updates: Partial<UserFilterValues>) => {
    const newSearch = updates.search !== undefined ? updates.search : search;
    const newRole = updates.role !== undefined ? updates.role : role;
    const newStatus = updates.status !== undefined ? updates.status : status;

    setSearch(newSearch);
    setRole(newRole);
    setStatus(newStatus);

    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newRole) params.set('role', newRole);
    if (newStatus) params.set('status', newStatus);

    router.push(`?${params.toString()}`);

    if (onFiltersChange) {
      onFiltersChange({
        search: newSearch,
        role: newRole,
        status: newStatus,
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    // Debounce search updates
    const timeoutId = setTimeout(() => {
      updateFilters({ search: value });
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const handleRoleChange = (value: string) => {
    updateFilters({ role: value });
  };

  const handleStatusChange = (value: string) => {
    updateFilters({ status: value });
  };

  const resetFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
    router.push(window.location.pathname);

    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  const hasActiveFilters = search || role || status;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <span className="font-semibold text-gray-900">Filters</span>
        {hasActiveFilters && (
          <span className="bg-primary-100 text-primary-600 text-xs font-medium px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={handleSearchChange}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors duration-200"
          />
        </div>

        <Select
          placeholder="All Roles"
          options={roleOptions}
          value={role}
          onValueChange={handleRoleChange}
        />

        <Select
          placeholder="All Statuses"
          options={statusOptions}
          value={status}
          onValueChange={handleStatusChange}
        />
      </div>

      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {[search && 'search', role && 'role', status && 'status']
              .filter(Boolean)
              .length}{' '}
            filter(s) applied
          </span>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
