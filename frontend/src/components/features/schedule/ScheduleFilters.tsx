'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, ChevronDown, X, Video, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { MeetingType } from '@/types';

interface ScheduleFiltersProps {
  courses?: { id: number; name: string }[];
  instructors?: { id: number; name: string }[];
}

const meetingTypes: { value: MeetingType; label: string; icon: typeof Video }[] = [
  { value: 'zoom', label: 'Zoom', icon: Video },
  { value: 'teams', label: 'MS Teams', icon: Video },
  { value: 'meet', label: 'Google Meet', icon: Video },
  { value: 'jitsi', label: 'Jitsi', icon: Video },
  { value: 'custom', label: 'Online', icon: Video },
  { value: 'in_person', label: 'In Person', icon: MapPin },
];

export function ScheduleFilters({ courses = [], instructors = [] }: ScheduleFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentSearch = searchParams?.get('search') || '';
  const currentCourse = searchParams?.get('courseId') || '';
  const currentInstructor = searchParams?.get('instructorId') || '';
  const currentMeetingType = searchParams?.get('meetingType') || '';
  const currentStartDate = searchParams?.get('startDate') || '';
  const currentEndDate = searchParams?.get('endDate') || '';

  const hasActiveFilters =
    currentCourse || currentInstructor || currentMeetingType || currentStartDate || currentEndDate;

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.set('page', '1');

    router.push(`?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('?');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      {/* Search bar and toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search schedules..."
            defaultValue={currentSearch}
            onChange={(e) => {
              const value = e.target.value;
              // Debounce search
              const timeoutId = setTimeout(() => {
                updateFilters({ search: value });
              }, 300);
              return () => clearTimeout(timeoutId);
            }}
            className="pl-10"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(hasActiveFilters && 'border-primary-500 text-primary-600')}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 w-5 h-5 bg-primary-600 text-white rounded-full text-xs flex items-center justify-center">
              {[currentCourse, currentInstructor, currentMeetingType, currentStartDate].filter(Boolean).length}
            </span>
          )}
          <ChevronDown className={cn('w-4 h-4 ml-2 transition-transform', isExpanded && 'rotate-180')} />
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Course filter */}
          {courses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                value={currentCourse}
                onChange={(e) => updateFilters({ courseId: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Instructor filter */}
          {instructors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
              <select
                value={currentInstructor}
                onChange={(e) => updateFilters({ instructorId: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Instructors</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Meeting type filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select
              value={currentMeetingType}
              onChange={(e) => updateFilters({ meetingType: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Formats</option>
              {meetingTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={currentStartDate}
                onChange={(e) => updateFilters({ startDate: e.target.value })}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={currentEndDate}
                onChange={(e) => updateFilters({ endDate: e.target.value })}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
