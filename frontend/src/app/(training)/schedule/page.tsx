import { Suspense } from 'react';
import { Metadata } from 'next';
import { Calendar, List, Grid3X3 } from 'lucide-react';
import { ScheduleFilters, ScheduleList } from '@/components/features/schedule';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ScheduleListItem, ScheduleListResponse } from '@/types';

export const metadata: Metadata = {
  title: 'Training Schedule | SEI Tech International',
  description:
    'View our upcoming live training sessions and workshops. Book your spot for interactive health, safety and environmental training.',
  openGraph: {
    title: 'Training Schedule | SEI Tech International',
    description:
      'View our upcoming live training sessions and workshops. Book your spot for interactive training.',
  },
};

interface SchedulePageProps {
  searchParams: {
    page?: string;
    limit?: string;
    courseId?: string;
    instructorId?: string;
    meetingType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    view?: 'grid' | 'list' | 'grouped';
  };
}

async function getSchedules(searchParams: SchedulePageProps['searchParams']): Promise<ScheduleListResponse> {
  const params = new URLSearchParams();

  if (searchParams.page) params.set('page', searchParams.page);
  if (searchParams.limit) params.set('limit', searchParams.limit);
  if (searchParams.courseId) params.set('courseId', searchParams.courseId);
  if (searchParams.instructorId) params.set('instructorId', searchParams.instructorId);
  if (searchParams.meetingType) params.set('meetingType', searchParams.meetingType);
  if (searchParams.startDate) params.set('startDate', searchParams.startDate);
  if (searchParams.endDate) params.set('endDate', searchParams.endDate);
  if (searchParams.search) params.set('search', searchParams.search);

  // Default to upcoming schedules
  params.set('upcoming', 'true');
  if (!searchParams.limit) params.set('limit', '12');

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/schedules?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch schedules');
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return {
      schedules: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    };
  }
}

function ScheduleGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <Skeleton className="h-24 w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between pt-3 border-t">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function ScheduleContent({ searchParams }: SchedulePageProps) {
  const { schedules, pagination } = await getSchedules(searchParams);
  const view = searchParams.view || 'grid';

  return (
    <>
      <ScheduleList
        schedules={schedules}
        variant={view === 'grouped' ? 'grouped' : view === 'list' ? 'list' : 'grid'}
        showCourse={true}
        emptyMessage="No upcoming sessions found. Check back soon for new training dates!"
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-2">
            {Array.from({ length: pagination.totalPages }).map((_, i) => {
              const page = i + 1;
              const isActive = page === pagination.page;
              const params = new URLSearchParams();
              Object.entries(searchParams).forEach(([key, value]) => {
                if (value) params.set(key, value);
              });
              params.set('page', page.toString());

              return (
                <a
                  key={page}
                  href={`?${params.toString()}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {page}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}

export default function SchedulePage({ searchParams }: SchedulePageProps) {
  const view = searchParams.view || 'grid';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-primary-400 font-semibold text-sm uppercase tracking-wider mb-4">
              <Calendar className="w-4 h-4" />
              Training Calendar
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Upcoming Training Schedule
            </h1>
            <p className="text-xl text-gray-300">
              Browse and book your spot in our upcoming live training sessions.
              Interactive workshops led by industry experts.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Filters */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Filter Sessions
              </h2>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
                <a
                  href={`?${new URLSearchParams({ ...searchParams, view: 'grid' }).toString()}`}
                  className={`p-2 rounded ${view === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </a>
                <a
                  href={`?${new URLSearchParams({ ...searchParams, view: 'list' }).toString()}`}
                  className={`p-2 rounded ${view === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </a>
                <a
                  href={`?${new URLSearchParams({ ...searchParams, view: 'grouped' }).toString()}`}
                  className={`p-2 rounded ${view === 'grouped' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Grouped by date"
                >
                  <Calendar className="w-4 h-4" />
                </a>
              </div>
            </div>

            <Suspense fallback={<Skeleton className="h-14 w-full rounded-xl" />}>
              <ScheduleFilters />
            </Suspense>
          </div>

          {/* Schedule List */}
          <Suspense fallback={<ScheduleGridSkeleton />}>
            <ScheduleContent searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
