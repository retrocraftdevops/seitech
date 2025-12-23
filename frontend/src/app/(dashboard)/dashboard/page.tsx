'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { StatsOverview } from '@/components/features/dashboard/StatsOverview';
import { CourseProgressCard } from '@/components/features/dashboard/CourseProgressCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { UserStats, Enrollment, Certificate } from '@/types/user';
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  ArrowRight,
  GraduationCap,
  Calendar,
  Download,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, refreshUser } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        // For now, use placeholder data until APIs are ready
        // TODO: Replace with actual API calls
        setStats({
          totalCourses: user.enrollmentsCount || 0,
          completedCourses: 0,
          inProgressCourses: user.enrollmentsCount || 0,
          totalCertificates: user.certificatesCount || 0,
          totalPoints: 0,
          totalBadges: 0,
          totalTimeSpent: 0,
          currentStreak: 0,
          longestStreak: 0,
        });

        // Placeholder enrollments
        setEnrollments([]);
        setCertificates([]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card>
          <CardContent className="text-center py-12 px-8">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Please sign in to access your dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              View your courses, track your progress, and manage your certificates.
            </p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName || user.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Track your learning progress and manage your certifications.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/courses">
            <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Browse Courses
            </Button>
          </Link>
          <Link href="/my-courses">
            <Button rightIcon={<BookOpen className="w-4 h-4" />}>My Courses</Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats && stats.totalCourses > 0 ? (
        <StatsOverview stats={stats} />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start Your Learning Journey
            </h3>
            <p className="text-gray-600 mb-4">
              You haven&apos;t enrolled in any courses yet. Explore our training programs to get started.
            </p>
            <Link href="/courses">
              <Button>Explore Courses</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Enrolled Courses</h3>
              <p className="text-sm text-gray-600">
                {user.enrollmentsCount || 0} courses
              </p>
            </div>
            <Link href="/my-courses">
              <ArrowRight className="w-5 h-5 text-gray-400 hover:text-primary-600 transition-colors" />
            </Link>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Certificates</h3>
              <p className="text-sm text-gray-600">
                {user.certificatesCount || 0} earned
              </p>
            </div>
            <Link href="/certificates">
              <ArrowRight className="w-5 h-5 text-gray-400 hover:text-primary-600 transition-colors" />
            </Link>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Upcoming Sessions</h3>
              <p className="text-sm text-gray-600">View schedule</p>
            </div>
            <Link href="/schedule">
              <ArrowRight className="w-5 h-5 text-gray-400 hover:text-primary-600 transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress Section */}
      {enrollments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
            <Link
              href="/my-courses"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.slice(0, 3).map((enrollment) => (
              <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Certificates */}
      {certificates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Certificates</h2>
            <Link
              href="/certificates"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.slice(0, 2).map((cert) => (
              <Card key={cert.id}>
                <CardContent className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{cert.courseName}</h3>
                    <p className="text-sm text-gray-600">
                      Issued: {new Date(cert.issuedDate).toLocaleDateString()}
                    </p>
                    <Badge variant="success" size="sm" className="mt-1">
                      Valid
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Courses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recommended For You</h2>
          <Link
            href="/courses"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
          >
            Browse All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Personalized Recommendations Coming Soon
            </h3>
            <p className="text-gray-600 mb-4">
              We&apos;re working on personalized course recommendations based on your learning history.
            </p>
            <Link href="/courses">
              <Button variant="outline">Explore All Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
