'use client';

import { useState, useEffect } from 'react';
import { CourseProgressCard } from '@/components/features/dashboard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Enrollment } from '@/types/user';
import { Filter, Search, Loader2, RefreshCw } from 'lucide-react';

// Placeholder data for when API is unavailable
const mockEnrollments: Enrollment[] = [
  {
    id: 1,
    courseId: 101,
    courseName: 'IOSH Managing Safely',
    courseSlug: 'iosh-managing-safely',
    courseImage: '/images/courses/iosh-managing-safely.jpg',
    userId: 1,
    state: 'active',
    progress: 65,
    enrollmentDate: '2024-11-01',
    lastAccessDate: '2024-12-20',
    totalTimeSpent: 420,
  },
  {
    id: 2,
    courseId: 102,
    courseName: 'Fire Safety Awareness',
    courseSlug: 'fire-safety-awareness',
    courseImage: '/images/courses/fire-safety.jpg',
    userId: 1,
    state: 'active',
    progress: 40,
    enrollmentDate: '2024-11-15',
    lastAccessDate: '2024-12-22',
    totalTimeSpent: 280,
  },
  {
    id: 3,
    courseId: 103,
    courseName: 'Manual Handling Training',
    courseSlug: 'manual-handling-training',
    courseImage: '/images/courses/manual-handling.jpg',
    userId: 1,
    state: 'active',
    progress: 80,
    enrollmentDate: '2024-10-20',
    lastAccessDate: '2024-12-21',
    totalTimeSpent: 560,
  },
  {
    id: 4,
    courseId: 104,
    courseName: 'First Aid at Work (3 Day)',
    courseSlug: 'first-aid-at-work-3-day',
    courseImage: '/images/courses/first-aid.jpg',
    userId: 1,
    state: 'completed',
    progress: 100,
    enrollmentDate: '2024-09-01',
    completionDate: '2024-11-10',
    lastAccessDate: '2024-11-10',
    totalTimeSpent: 720,
    certificateId: 1,
  },
  {
    id: 5,
    courseId: 105,
    courseName: 'IOSH Working Safely',
    courseSlug: 'iosh-working-safely',
    courseImage: '/images/courses/iosh-working-safely.jpg',
    userId: 1,
    state: 'completed',
    progress: 100,
    enrollmentDate: '2024-08-15',
    completionDate: '2024-10-30',
    lastAccessDate: '2024-10-30',
    totalTimeSpent: 680,
    certificateId: 2,
  },
  {
    id: 6,
    courseId: 106,
    courseName: 'Fire Warden Training',
    courseSlug: 'fire-warden-training',
    courseImage: '/images/courses/fire-warden.jpg',
    userId: 1,
    state: 'active',
    progress: 25,
    enrollmentDate: '2024-12-01',
    lastAccessDate: '2024-12-18',
    totalTimeSpent: 180,
  },
];

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEnrollments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enrollments');
      const data = await response.json();

      if (data.success && data.data) {
        setEnrollments(data.data);
      } else {
        // Use mock data if API fails or returns no data
        console.warn('Using mock enrollment data:', data.message);
        setEnrollments(mockEnrollments);
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      setEnrollments(mockEnrollments);
      setError('Unable to connect to server. Showing demo data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && enrollment.state === 'active') ||
      (filter === 'completed' && enrollment.state === 'completed');

    const matchesSearch =
      searchQuery === '' ||
      enrollment.courseName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const activeCourses = enrollments.filter((e) => e.state === 'active').length;
  const completedCourses = enrollments.filter((e) => e.state === 'completed').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">
            Manage and track all your enrolled courses in one place
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchEnrollments}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-500 rounded-full" />
          <p className="text-amber-800 text-sm">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="lg">
            {enrollments.length}
          </Badge>
          <span className="text-gray-700">Total Courses</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" size="lg">
            {activeCourses}
          </Badge>
          <span className="text-gray-700">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="lg">
            {completedCourses}
          </Badge>
          <span className="text-gray-700">Completed</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'completed' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {filteredEnrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment) => (
            <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Change your filter to see more courses'}
          </p>
        </div>
      )}
    </div>
  );
}
