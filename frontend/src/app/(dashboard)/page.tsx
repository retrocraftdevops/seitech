'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Calendar,
  Play,
  ChevronRight,
  Target,
  Flame,
  Trophy,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// Types
interface DashboardStats {
  coursesInProgress: number;
  coursesCompleted: number;
  certificatesEarned: number;
  totalHoursLearned: number;
  currentStreak: number;
  totalPoints: number;
}

interface EnrolledCourse {
  id: number;
  name: string;
  slug: string;
  progress: number;
  thumbnail: string;
  nextLesson: string;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
}

interface UpcomingSession {
  id: number;
  name: string;
  courseName: string;
  startTime: string;
  duration: number;
  meetingType: string;
}

interface RecentActivity {
  id: number;
  type: 'lesson_complete' | 'quiz_pass' | 'badge_earned' | 'course_complete' | 'certificate';
  title: string;
  description: string;
  timestamp: string;
  points?: number;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
  read: boolean;
}

// Mock data
const mockStats: DashboardStats = {
  coursesInProgress: 3,
  coursesCompleted: 12,
  certificatesEarned: 8,
  totalHoursLearned: 156,
  currentStreak: 7,
  totalPoints: 2450,
};

const mockEnrolledCourses: EnrolledCourse[] = [
  {
    id: 1,
    name: 'NEBOSH National General Certificate',
    slug: 'nebosh-general-certificate',
    progress: 68,
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
    nextLesson: 'Module 5: Health and Safety Management Systems',
    totalLessons: 24,
    completedLessons: 16,
    lastAccessed: '2024-12-22T14:30:00Z',
  },
  {
    id: 2,
    name: 'IOSH Managing Safely',
    slug: 'iosh-managing-safely',
    progress: 45,
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    nextLesson: 'Module 4: Understanding Your Responsibilities',
    totalLessons: 8,
    completedLessons: 4,
    lastAccessed: '2024-12-21T10:15:00Z',
  },
  {
    id: 3,
    name: 'Fire Safety Awareness',
    slug: 'fire-safety-awareness',
    progress: 20,
    thumbnail: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=400&h=300&fit=crop',
    nextLesson: 'Module 2: Fire Prevention Measures',
    totalLessons: 6,
    completedLessons: 1,
    lastAccessed: '2024-12-20T16:45:00Z',
  },
];

const mockUpcomingSessions: UpcomingSession[] = [
  {
    id: 1,
    name: 'NEBOSH Live Q&A Session',
    courseName: 'NEBOSH National General Certificate',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 2,
    meetingType: 'zoom',
  },
  {
    id: 2,
    name: 'Risk Assessment Workshop',
    courseName: 'IOSH Managing Safely',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 3,
    meetingType: 'teams',
  },
];

const mockRecentActivity: RecentActivity[] = [
  {
    id: 1,
    type: 'lesson_complete',
    title: 'Lesson Completed',
    description: 'Module 4: Risk Assessment Methods - NEBOSH',
    timestamp: '2024-12-22T14:30:00Z',
    points: 50,
  },
  {
    id: 2,
    type: 'quiz_pass',
    title: 'Quiz Passed',
    description: 'Module 3 Assessment - 85% Score',
    timestamp: '2024-12-22T12:15:00Z',
    points: 100,
  },
  {
    id: 3,
    type: 'badge_earned',
    title: 'Badge Earned',
    description: 'Quick Learner - Complete 5 lessons in one day',
    timestamp: '2024-12-21T18:00:00Z',
    points: 200,
  },
  {
    id: 4,
    type: 'course_complete',
    title: 'Course Completed',
    description: 'First Aid at Work - Congratulations!',
    timestamp: '2024-12-20T16:45:00Z',
    points: 500,
  },
];

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'Certificate Ready',
    message: 'Your First Aid at Work certificate is ready to download.',
    type: 'success',
    timestamp: '2024-12-22T10:00:00Z',
    read: false,
  },
  {
    id: 2,
    title: 'Upcoming Session',
    message: 'NEBOSH Live Q&A starts in 2 days. Add to your calendar!',
    type: 'info',
    timestamp: '2024-12-21T15:00:00Z',
    read: false,
  },
  {
    id: 3,
    title: 'Achievement Unlocked',
    message: 'You have earned the 7-Day Streak badge!',
    type: 'success',
    timestamp: '2024-12-21T09:00:00Z',
    read: true,
  },
];

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatSessionTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `In ${diffDays} days`;
}

const activityIcons: Record<RecentActivity['type'], typeof CheckCircle> = {
  lesson_complete: CheckCircle,
  quiz_pass: Target,
  badge_earned: Award,
  course_complete: Trophy,
  certificate: Award,
};

const activityColors: Record<RecentActivity['type'], string> = {
  lesson_complete: 'bg-green-100 text-green-600',
  quiz_pass: 'bg-blue-100 text-blue-600',
  badge_earned: 'bg-purple-100 text-purple-600',
  course_complete: 'bg-amber-100 text-amber-600',
  certificate: 'bg-primary-100 text-primary-600',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [courses, setCourses] = useState<EnrolledCourse[]>(mockEnrolledCourses);
  const [sessions, setSessions] = useState<UpcomingSession[]>(mockUpcomingSessions);
  const [activities, setActivities] = useState<RecentActivity[]>(mockRecentActivity);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{greeting}!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your learning journey.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Streak Badge */}
          <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-orange-700">{stats.currentStreak} day streak</span>
          </div>
          {/* Notifications */}
          <Link href="/notifications" className="relative">
            <Button variant="outline" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.coursesInProgress}</p>
            <p className="text-sm text-gray-500">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.coursesCompleted}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.certificatesEarned}</p>
            <p className="text-sm text-gray-500">Certificates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalHoursLearned}</p>
            <p className="text-sm text-gray-500">Hours Learned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
            <p className="text-sm text-gray-500">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPoints.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Points</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Learning */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
              <Link href="/my-courses" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {courses.map((course) => (
                <Card key={course.id} hover className="overflow-hidden">
                  <div className="flex">
                    <div className="relative w-40 h-32 flex-shrink-0">
                      <Image
                        src={course.thumbnail}
                        alt={course.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <CardContent className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                            {course.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            Next: {course.nextLesson}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                            <span>Last accessed {formatRelativeTime(course.lastAccessed)}</span>
                          </div>
                        </div>
                        <Badge variant={course.progress >= 75 ? 'success' : 'secondary'}>
                          {course.progress}%
                        </Badge>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full transition-all',
                              course.progress >= 75 ? 'bg-green-500' : 'bg-primary-500'
                            )}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming Sessions */}
          {sessions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Live Sessions</h2>
                <Link href="/schedule" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View schedule
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {sessions.map((session) => (
                  <Card key={session.id} hover>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary-600">
                            {formatSessionTime(session.startTime)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(session.startTime).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} • {session.duration}h
                          </p>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{session.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{session.courseName}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Add to Calendar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const Icon = activityIcons[activity.type];
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', activityColors[activity.type])}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">{formatRelativeTime(activity.timestamp)}</span>
                            {activity.points && (
                              <span className="text-xs text-green-600 font-medium">+{activity.points} pts</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link
                  href="/my-learning"
                  className="mt-4 block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all activity
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notifications</h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-3 rounded-lg',
                        notification.read ? 'bg-gray-50' : 'bg-primary-50 border border-primary-100'
                      )}
                    >
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/courses"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm text-gray-700">Browse Courses</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/certificates"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm text-gray-700">My Certificates</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/achievements"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm text-gray-700">Achievements</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm text-gray-700">Edit Profile</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
