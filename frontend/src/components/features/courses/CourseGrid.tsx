import { CourseCard } from './CourseCard';
import type { CourseFilters, Course } from '@/types';

interface CourseGridProps {
  filters: CourseFilters;
}

async function fetchCourses(filters: CourseFilters): Promise<{ courses: Course[]; total: number }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
  const params = new URLSearchParams();

  if (filters.category) params.set('category', filters.category);
  if (filters.level) params.set('level', filters.level);
  if (filters.delivery) params.set('delivery', filters.delivery);
  if (filters.accreditation) params.set('accreditation', filters.accreditation);
  if (filters.search) params.set('search', filters.search);

  const url = `${baseUrl}/api/courses${params.toString() ? `?${params.toString()}` : ''}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();

    if (data.success && data.data?.courses) {
      return {
        courses: data.data.courses,
        total: data.data.pagination?.total || data.data.courses.length,
      };
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
  }

  return { courses: [], total: 0 };
}

export async function CourseGrid({ filters }: CourseGridProps) {
  const { courses, total } = await fetchCourses(filters);

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No courses found
        </h3>
        <p className="text-gray-600">
          Try adjusting your filters to find more courses.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{courses.length}</span> of{' '}
          <span className="font-semibold">{total}</span> courses
        </p>
        <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white">
          <option>Most Popular</option>
          <option>Newest First</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Highest Rated</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Pagination would go here */}
    </div>
  );
}
