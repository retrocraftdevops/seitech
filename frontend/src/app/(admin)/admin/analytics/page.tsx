'use client';

import { useState } from 'react';
import { Users, BookOpen, DollarSign, TrendingUp, Award, Clock } from 'lucide-react';
import { StatsCard } from '@/components/features/admin/StatsCard';
import { DateRangePicker, DateRange } from '@/components/features/admin/analytics/DateRangePicker';
import { EnrollmentChart } from '@/components/features/admin/analytics/EnrollmentChart';
import { RevenueChart } from '@/components/features/admin/analytics/RevenueChart';
import { OverviewCharts } from '@/components/features/admin/analytics/OverviewCharts';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Mock data - replace with actual API calls
const generateMockEnrollmentData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      enrollments: Math.floor(Math.random() * 50) + 20,
    });
  }
  return data;
};

const generateMockRevenueData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.slice(0, 6).map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 50000) + 30000,
    target: 60000,
  }));
};

const mockTopCourses = [
  { id: '1', title: 'Advanced Machine Learning', enrollments: 1250, revenue: 62500, rating: 4.8 },
  { id: '2', title: 'Web Development Bootcamp', enrollments: 980, revenue: 49000, rating: 4.9 },
  { id: '3', title: 'Data Science Fundamentals', enrollments: 875, revenue: 43750, rating: 4.7 },
  { id: '4', title: 'Mobile App Development', enrollments: 720, revenue: 36000, rating: 4.6 },
  { id: '5', title: 'Cloud Architecture', enrollments: 650, revenue: 32500, rating: 4.8 },
];

const mockTopInstructors = [
  { id: '1', name: 'Dr. Sarah Johnson', students: 3250, courses: 8, rating: 4.9 },
  { id: '2', name: 'Prof. Michael Chen', students: 2890, courses: 6, rating: 4.8 },
  { id: '3', name: 'Dr. Emily Williams', students: 2450, courses: 5, rating: 4.7 },
  { id: '4', name: 'James Martinez', students: 2100, courses: 7, rating: 4.8 },
  { id: '5', name: 'Dr. Robert Taylor', students: 1950, courses: 4, rating: 4.9 },
];

const mockCategoryData = [
  { name: 'Technology', value: 450 },
  { name: 'Business', value: 320 },
  { name: 'Design', value: 280 },
  { name: 'Marketing', value: 190 },
  { name: 'Health', value: 160 },
];

const mockRevenueByCategoryData = [
  { name: 'Technology', value: 125000 },
  { name: 'Business', value: 89000 },
  { name: 'Design', value: 67000 },
  { name: 'Marketing', value: 45000 },
  { name: 'Health', value: 38000 },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
    label: 'Last 30 days',
  });
  const [isLoading, setIsLoading] = useState(false);

  const enrollmentData = generateMockEnrollmentData();
  const revenueData = generateMockRevenueData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track your platform's performance and growth
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value="12,845"
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
          description="vs last period"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Courses"
          value="156"
          icon={BookOpen}
          trend={{ value: 8.2, isPositive: true }}
          description="vs last period"
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(364000)}
          icon={DollarSign}
          trend={{ value: 15.3, isPositive: true }}
          description="vs last period"
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          isLoading={isLoading}
        />
        <StatsCard
          title="Completion Rate"
          value="68.4%"
          icon={Award}
          trend={{ value: 3.1, isPositive: true }}
          description="vs last period"
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnrollmentChart data={enrollmentData} isLoading={isLoading} />
        <RevenueChart data={revenueData} showTarget={true} isLoading={isLoading} />
      </div>

      {/* Category Overview */}
      <OverviewCharts
        enrollmentsByCategory={mockCategoryData}
        revenueByCategory={mockRevenueByCategoryData}
        isLoading={isLoading}
      />

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Top Courses</h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{course.title}</p>
                      <p className="text-sm text-gray-500">
                        {course.enrollments.toLocaleString()} students
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(course.revenue)}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Award className="h-3 w-3 text-yellow-500" />
                      {course.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Instructors */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Top Instructors</h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopInstructors.map((instructor, index) => (
                <div
                  key={instructor.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{instructor.name}</p>
                      <p className="text-sm text-gray-500">
                        {instructor.courses} courses
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {instructor.students.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Award className="h-3 w-3 text-yellow-500" />
                      {instructor.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">User Growth</p>
                <p className="text-2xl font-bold text-gray-900">+24.5%</p>
                <p className="text-xs text-gray-500">New users this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Completion Time</p>
                <p className="text-2xl font-bold text-gray-900">4.2 weeks</p>
                <p className="text-xs text-gray-500">Per course</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Certificates Issued</p>
                <p className="text-2xl font-bold text-gray-900">8,742</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
