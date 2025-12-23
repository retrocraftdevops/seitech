import { Suspense } from 'react';
import { Metadata } from 'next';
import { CourseGrid } from '@/components/features/courses/CourseGrid';
import { CourseFilters } from '@/components/features/courses/CourseFilters';
import { Skeleton } from '@/components/ui/Skeleton';
import type { CourseFilters as CourseFiltersType, DifficultyLevel, DeliveryMethod, Accreditation } from '@/types';

export const metadata: Metadata = {
  title: 'Training Courses',
  description:
    'Browse our comprehensive range of accredited health, safety, and environmental training courses. E-learning, virtual, and face-to-face options available.',
};

interface CoursesPageProps {
  searchParams: {
    category?: string;
    level?: string;
    delivery?: string;
    accreditation?: string;
    page?: string;
    q?: string;
  };
}

const validLevels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];
const validDeliveryMethods: DeliveryMethod[] = ['e-learning', 'face-to-face', 'virtual', 'in-house'];
const validAccreditations: Accreditation[] = ['IOSH', 'Qualsafe', 'NEBOSH', 'ProQual', 'CPD'];

function parseFilters(searchParams: CoursesPageProps['searchParams']): CourseFiltersType {
  const level = validLevels.includes(searchParams.level as DifficultyLevel)
    ? (searchParams.level as DifficultyLevel)
    : undefined;

  const delivery = validDeliveryMethods.includes(searchParams.delivery as DeliveryMethod)
    ? (searchParams.delivery as DeliveryMethod)
    : undefined;

  const accreditation = validAccreditations.includes(searchParams.accreditation as Accreditation)
    ? (searchParams.accreditation as Accreditation)
    : undefined;

  return {
    category: searchParams.category,
    level,
    delivery,
    accreditation,
  };
}

export default function CoursesPage({ searchParams }: CoursesPageProps) {
  const filters = parseFilters(searchParams);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 max-w-7xl py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Training Courses
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Browse our comprehensive range of accredited health, safety, and
            environmental training courses. Multiple delivery methods available.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
                <CourseFilters currentFilters={filters} />
              </Suspense>
            </div>
          </aside>

          {/* Course Grid */}
          <main className="flex-1">
            <Suspense fallback={<CourseGridSkeleton />}>
              <CourseGrid filters={filters} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-80 rounded-2xl" />
      ))}
    </div>
  );
}
