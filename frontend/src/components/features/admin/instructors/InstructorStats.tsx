'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { InstructorStats as InstructorStatsType } from '@/types/admin';
import { BookOpen, Users, DollarSign, Star, TrendingUp } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconBgColor?: string;
  iconColor?: string;
}

function StatCard({
  icon,
  label,
  value,
  trend,
  iconBgColor = 'bg-primary-100',
  iconColor = 'text-primary-600',
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div
                className={`flex items-center gap-1 mt-2 text-sm ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <TrendingUp
                  className={`h-4 w-4 ${!trend.isPositive && 'rotate-180'}`}
                />
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
            )}
          </div>
          <div className={`${iconBgColor} ${iconColor} p-3 rounded-xl`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface InstructorStatsProps {
  stats: InstructorStatsType;
  showEarningsChart?: boolean;
}

export function InstructorStats({ stats, showEarningsChart = false }: InstructorStatsProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="h-6 w-6" />}
          label="Total Courses"
          value={stats.totalCourses}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={<Users className="h-6 w-6" />}
          label="Total Students"
          value={stats.totalStudents.toLocaleString()}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6" />}
          label="Total Earnings"
          value={`$${stats.totalEarnings.toLocaleString()}`}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          icon={<Star className="h-6 w-6" />}
          label="Average Rating"
          value={stats.averageRating.toFixed(1)}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* Earnings Chart */}
      {showEarningsChart && stats.monthlyEarnings.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Monthly Earnings</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.monthlyEarnings.map((earning) => {
                const maxEarning = Math.max(...stats.monthlyEarnings.map((e) => e.amount));
                const percentage = (earning.amount / maxEarning) * 100;

                return (
                  <div key={earning.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{earning.month}</span>
                      <span className="font-semibold text-gray-900">
                        ${earning.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Courses */}
      {stats.topCourses.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Top Courses</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.students} students
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {course.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ${course.earnings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">earnings</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
