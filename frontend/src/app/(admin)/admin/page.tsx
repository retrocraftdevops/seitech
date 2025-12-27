'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { StatsCard } from '@/components/features/admin/StatsCard';
import { RecentActivity } from '@/components/features/admin/RecentActivity';
import { QuickActions } from '@/components/features/admin/QuickActions';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { DashboardStats } from '@/types/admin';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatCurrency, formatNumber } from '@/lib/utils';

// Charts using recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function AdminDashboardPage() {
  const { user, isAdmin, isManager } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/analytics/overview');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show revenue only to admin and manager roles
  const canViewRevenue = isAdmin() || isManager();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.firstName || 'Admin'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={isLoading ? '...' : formatNumber(stats?.stats.totalUsers || 0)}
          icon={Users}
          trend={
            stats
              ? {
                  value: stats.trends.usersGrowth,
                  isPositive: stats.trends.usersGrowth >= 0,
                }
              : undefined
          }
          description="from last month"
          isLoading={isLoading}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />

        <StatsCard
          title="Total Courses"
          value={isLoading ? '...' : formatNumber(stats?.stats.totalCourses || 0)}
          icon={BookOpen}
          trend={
            stats
              ? {
                  value: stats.trends.coursesGrowth,
                  isPositive: stats.trends.coursesGrowth >= 0,
                }
              : undefined
          }
          description="from last month"
          isLoading={isLoading}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />

        <StatsCard
          title="Total Enrollments"
          value={isLoading ? '...' : formatNumber(stats?.stats.totalEnrollments || 0)}
          icon={GraduationCap}
          trend={
            stats
              ? {
                  value: stats.trends.enrollmentsGrowth,
                  isPositive: stats.trends.enrollmentsGrowth >= 0,
                }
              : undefined
          }
          description="from last month"
          isLoading={isLoading}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />

        {canViewRevenue && (
          <StatsCard
            title="Total Revenue"
            value={isLoading ? '...' : formatCurrency(stats?.stats.totalRevenue || 0)}
            icon={DollarSign}
            trend={
              stats
                ? {
                    value: stats.trends.revenueGrowth,
                    isPositive: stats.trends.revenueGrowth >= 0,
                  }
                : undefined
            }
            description="from last month"
            isLoading={isLoading}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trends Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Enrollment Trends</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Daily enrollments over the last 30 days
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading chart...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.analytics.enrollments || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString();
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        {canViewRevenue && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Daily revenue over the last 30 days
                  </p>
                </div>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-pulse text-gray-400">Loading chart...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.analytics.revenue || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `£${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px 12px',
                      }}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString();
                      }}
                      formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                    />
                    <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* Completions Chart for non-revenue viewers */}
        {!canViewRevenue && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Course Completions
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Daily completions over the last 30 days
                  </p>
                </div>
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-pulse text-gray-400">Loading chart...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.analytics.completions || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px 12px',
                      }}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString();
                      }}
                    />
                    <Bar dataKey="count" fill="#a855f7" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Row: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity
          activities={stats?.recentActivities || []}
          isLoading={isLoading}
        />
        <QuickActions isLoading={isLoading} />
      </div>
    </div>
  );
}
