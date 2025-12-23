'use client';

import { useState, useEffect } from 'react';
import { StatsOverview, CourseProgressCard } from '@/components/features/dashboard';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Enrollment, UserStats } from '@/types/user';
import { Calendar, Clock, BookOpen, TrendingUp, Loader2, Award } from 'lucide-react';
import Link from 'next/link';

// Placeholder data
const mockStats: UserStats = {
  totalCourses: 12,
  completedCourses: 7,
  inProgressCourses: 5,
  totalCertificates: 7,
  totalPoints: 3450,
  totalBadges: 14,
  totalTimeSpent: 2340,
  currentStreak: 7,
  longestStreak: 21,
};

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
    courseName: 'IOSH Working Safely',
    courseSlug: 'iosh-working-safely',
    courseImage: '/images/courses/iosh-working-safely.jpg',
    userId: 1,
    state: 'active',
    progress: 20,
    enrollmentDate: '2024-12-15',
    lastAccessDate: '2024-12-23',
    totalTimeSpent: 120,
  },
];

interface ActivityItem {
  id: number;
  type: string;
  title: string;
  course: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mockRecentActivity: ActivityItem[] = [
  {
    id: 1,
    type: 'lesson_completed',
    title: 'Completed: Module 3 - Risk Assessment',
    course: 'IOSH Managing Safely',
    timestamp: '2 hours ago',
    icon: BookOpen,
  },
  {
    id: 2,
    type: 'achievement',
    title: 'Earned: Safety Champion Badge',
    course: '',
    timestamp: '1 day ago',
    icon: Award,
  },
  {
    id: 3,
    type: 'lesson_completed',
    title: 'Completed: Fire Prevention Basics',
    course: 'Fire Safety Awareness',
    timestamp: '2 days ago',
    icon: BookOpen,
  },
];

export default function MyLearningPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<UserStats>(mockStats);
  const [recentActivity] = useState<ActivityItem[]>(mockRecentActivity);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const enrollmentResponse = await fetch('/api/enrollments');
        const enrollmentData = await enrollmentResponse.json();

        if (enrollmentData.success && enrollmentData.data) {
          const enrollmentsList: Enrollment[] = enrollmentData.data;
          setEnrollments(enrollmentsList);

          // Calculate stats from enrollments
          const activeEnrollments = enrollmentsList.filter(e => e.state === 'active');
          const completedEnrollments = enrollmentsList.filter(e => e.state === 'completed');
          const totalTime = enrollmentsList.reduce((acc, e) => acc + (e.totalTimeSpent || 0), 0);

          setStats({
            ...mockStats,
            totalCourses: enrollmentsList.length,
            completedCourses: completedEnrollments.length,
            inProgressCourses: activeEnrollments.length,
            totalTimeSpent: totalTime,
            totalCertificates: enrollmentsList.filter(e => e.certificateId).length,
          });
        } else {
          setEnrollments(mockEnrollments);
        }
      } catch (error) {
        console.error('Error fetching learning data:', error);
        setEnrollments(mockEnrollments);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeEnrollments = enrollments.filter(e => e.state === 'active');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
          <p className="text-gray-600">
            Track your progress and continue where you left off
          </p>
        </div>
        <Link href="/courses">
          <Button variant="primary" size="lg">
            Browse Courses
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Continue Learning Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
            <Link href="/my-courses" className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>

          {activeEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeEnrollments.slice(0, 2).map((enrollment) => (
                <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          ) : (
            <Card variant="bordered" className="text-center py-12">
              <CardContent>
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No active courses</h3>
                <p className="text-gray-600 mb-4">Start learning today by enrolling in a course</p>
                <Link href="/courses">
                  <Button variant="primary">Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {activeEnrollments.length > 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeEnrollments.slice(2, 5).map((enrollment) => (
                <Card key={enrollment.id} variant="bordered" className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                      {enrollment.courseName}
                    </h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs font-medium text-primary-600">{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                    <Link
                      href={`/learn/${enrollment.courseSlug}`}
                      className="mt-3 block text-center text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Continue →
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Sidebar */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>

          <Card variant="bordered">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm mb-1">
                            {activity.title}
                          </p>
                          {activity.course && (
                            <p className="text-xs text-gray-600 mb-1">
                              {activity.course}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {activity.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Learning Streak */}
          <Card variant="bordered" className="bg-gradient-to-br from-orange-50 to-amber-50">
            <CardContent>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <span className="text-3xl">🔥</span>
                </div>
                <h3 className="font-bold text-2xl text-gray-900 mb-1">
                  {stats.currentStreak} Day Streak!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Keep learning daily to maintain your streak
                </p>
                <div className="flex items-center justify-center gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                        i < stats.currentStreak
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card variant="bordered">
            <CardContent>
              <h3 className="font-semibold text-lg text-gray-900 mb-4">
                Upcoming Deadlines
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 mb-1">
                      Module 4 Quiz Due
                    </p>
                    <p className="text-xs text-gray-600">
                      IOSH Managing Safely
                    </p>
                    <Badge variant="danger" size="sm" className="mt-2">
                      Due in 2 days
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 mb-1">
                      Final Assessment
                    </p>
                    <p className="text-xs text-gray-600">
                      Fire Safety Awareness
                    </p>
                    <Badge variant="warning" size="sm" className="mt-2">
                      Due in 5 days
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
