/**
 * React Query Configuration
 * Optimized data fetching with caching
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: data is fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Cache time: keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      
      // Retry failed requests 3 times
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch configuration
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Error handling
      throwOnError: false,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Query keys factory for type safety
export const queryKeys = {
  courses: {
    all: ['courses'] as const,
    lists: () => [...queryKeys.courses.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.courses.lists(), filters] as const,
    details: () => [...queryKeys.courses.all, 'detail'] as const,
    detail: (id: number | string) => [...queryKeys.courses.details(), id] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
  },
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    enrollments: () => [...queryKeys.user.all, 'enrollments'] as const,
  },
};

// Prefetch helpers
export async function prefetchCourse(queryClient: QueryClient, courseId: number) {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.courses.detail(courseId),
    queryFn: () => fetch(`/api/courses/${courseId}`).then(res => res.json()),
  });
}
