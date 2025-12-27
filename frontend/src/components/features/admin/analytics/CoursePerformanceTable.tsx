'use client';

import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

interface CoursePerformance {
  id: string;
  title: string;
  enrollments: number;
  completionRate: number;
  rating: number;
  revenue: number;
  trend?: {
    enrollments: number;
    revenue: number;
  };
}

interface CoursePerformanceTableProps {
  data: CoursePerformance[];
  isLoading?: boolean;
  title?: string;
}

type SortKey = 'title' | 'enrollments' | 'completionRate' | 'rating' | 'revenue';
type SortDirection = 'asc' | 'desc';

export function CoursePerformanceTable({
  data,
  isLoading = false,
  title = 'Course Performance',
}: CoursePerformanceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('enrollments');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    const aNum = typeof aValue === 'number' ? aValue : 0;
    const bNum = typeof bValue === 'number' ? bValue : 0;

    return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-gray-500">
            <p className="text-sm">No course performance data available</p>
            <p className="text-xs mt-1">Data will appear here once courses are published</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Course Title
                    <SortIcon columnKey="title" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('enrollments')}
                    className="flex items-center justify-end gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 ml-auto"
                  >
                    Enrollments
                    <SortIcon columnKey="enrollments" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('completionRate')}
                    className="flex items-center justify-end gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 ml-auto"
                  >
                    Completion
                    <SortIcon columnKey="completionRate" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('rating')}
                    className="flex items-center justify-end gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 ml-auto"
                  >
                    Rating
                    <SortIcon columnKey="rating" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('revenue')}
                    className="flex items-center justify-end gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 ml-auto"
                  >
                    Revenue
                    <SortIcon columnKey="revenue" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{course.title}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium text-gray-900">
                        {course.enrollments.toLocaleString()}
                      </span>
                      {course.trend && course.trend.enrollments !== 0 && (
                        <span
                          className={cn(
                            'flex items-center text-xs font-medium',
                            course.trend.enrollments > 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {course.trend.enrollments > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(course.trend.enrollments)}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="flex-1 max-w-[100px] bg-gray-200 rounded-full h-2">
                        <div
                          className={cn(
                            'h-2 rounded-full',
                            course.completionRate >= 70
                              ? 'bg-green-500'
                              : course.completionRate >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          )}
                          style={{ width: `${course.completionRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12">
                        {course.completionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-gray-900">
                        {course.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(course.revenue)}
                      </span>
                      {course.trend && course.trend.revenue !== 0 && (
                        <span
                          className={cn(
                            'flex items-center text-xs font-medium',
                            course.trend.revenue > 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {course.trend.revenue > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(course.trend.revenue)}%
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
