'use client';

import { useState } from 'react';
import { EnrollmentFilters as Filters, EnrollmentStatus } from '@/types/admin';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/Button';
import { Search, Filter, X } from 'lucide-react';

interface EnrollmentFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  courses?: { id: number; name: string }[];
  onReset?: () => void;
}

export function EnrollmentFilters({
  filters,
  onFiltersChange,
  courses = [],
  onReset,
}: EnrollmentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as EnrollmentStatus),
    });
  };

  const handleCourseChange = (value: string) => {
    onFiltersChange({
      ...filters,
      courseId: value ? parseInt(value) : undefined,
    });
  };

  const handleDateFromChange = (value: string) => {
    onFiltersChange({ ...filters, dateFrom: value || undefined });
  };

  const handleDateToChange = (value: string) => {
    onFiltersChange({ ...filters, dateTo: value || undefined });
  };

  const handleReset = () => {
    onFiltersChange({});
    onReset?.();
  };

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.courseId ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by student name or email..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-48">
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleStatusChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Toggle Advanced Filters */}
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          leftIcon={<Filter className="h-4 w-4" />}
        >
          {isExpanded ? 'Hide' : 'More'} Filters
        </Button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleReset}
            leftIcon={<X className="h-4 w-4" />}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          {/* Course Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Course
            </label>
            <Select
              value={filters.courseId?.toString() || ''}
              onValueChange={(value) => handleCourseChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <Input
            type="date"
            label="Enrolled From"
            value={filters.dateFrom || ''}
            onChange={(e) => handleDateFromChange(e.target.value)}
          />

          {/* Date To */}
          <Input
            type="date"
            label="Enrolled To"
            value={filters.dateTo || ''}
            onChange={(e) => handleDateToChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
