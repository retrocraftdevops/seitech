'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AchievementBadge } from '@/components/features/dashboard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Achievement } from '@/types/user';
import { Trophy, Target, Star, TrendingUp, Loader2, RefreshCw } from 'lucide-react';

// Placeholder data for when API is unavailable
const mockAchievements: Achievement[] = [
  {
    id: 1,
    badgeId: 101,
    badgeName: 'Safety Champion',
    badgeIcon: '🛡️',
    badgeColor: '#10B981',
    description: 'Complete your first health and safety course',
    earnedDate: '2024-12-20',
    points: 100,
    isNew: true,
  },
  {
    id: 2,
    badgeId: 102,
    badgeName: 'Perfect Assessment',
    badgeIcon: '💯',
    badgeColor: '#34D399',
    description: 'Score 100% on a final assessment',
    earnedDate: '2024-12-15',
    points: 150,
    isNew: true,
  },
  {
    id: 3,
    badgeId: 103,
    badgeName: 'Week Warrior',
    badgeIcon: '🔥',
    badgeColor: '#F97316',
    description: 'Maintain a 7-day learning streak',
    earnedDate: '2024-12-10',
    points: 75,
    isNew: false,
  },
  {
    id: 4,
    badgeId: 104,
    badgeName: 'First Certificate',
    badgeIcon: '🎓',
    badgeColor: '#8B5CF6',
    description: 'Earn your first professional certificate',
    earnedDate: '2024-11-10',
    points: 200,
    isNew: false,
  },
  {
    id: 5,
    badgeId: 105,
    badgeName: 'Knowledge Seeker',
    badgeIcon: '📚',
    badgeColor: '#3B82F6',
    description: 'Enroll in 5 different courses',
    earnedDate: '2024-11-05',
    points: 50,
    isNew: false,
  },
  {
    id: 6,
    badgeId: 106,
    badgeName: 'Early Bird',
    badgeIcon: '🌅',
    badgeColor: '#EC4899',
    description: 'Complete a lesson before 8 AM',
    earnedDate: '2024-10-28',
    points: 25,
    isNew: false,
  },
  {
    id: 7,
    badgeId: 107,
    badgeName: 'IOSH Certified',
    badgeIcon: '✅',
    badgeColor: '#059669',
    description: 'Complete an IOSH accredited course',
    earnedDate: '2024-10-15',
    points: 300,
    isNew: false,
  },
  {
    id: 8,
    badgeId: 108,
    badgeName: 'Fire Safety Expert',
    badgeIcon: '🔥',
    badgeColor: '#DC2626',
    description: 'Complete all fire safety modules',
    earnedDate: '2024-09-20',
    points: 150,
    isNew: false,
  },
];

const upcomingBadges = [
  {
    id: 201,
    name: 'Marathon Learner',
    icon: '🏃',
    description: 'Maintain a 30-day learning streak',
    requirement: '23/30 days',
    progress: 76,
  },
  {
    id: 202,
    name: 'Course Master',
    icon: '👑',
    description: 'Complete 10 courses',
    requirement: '7/10 courses',
    progress: 70,
  },
  {
    id: 203,
    name: 'Points Champion',
    icon: '⭐',
    description: 'Earn 5000 total points',
    requirement: '3450/5000 points',
    progress: 69,
  },
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'new'>('all');

  const fetchAchievements = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For now, simulate API call with mock data
      // When backend is ready, this will call /api/achievements
      await new Promise(resolve => setTimeout(resolve, 500));
      setAchievements(mockAchievements);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setAchievements(mockAchievements);
      setError('Unable to connect to server. Showing demo data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const filteredAchievements =
    filter === 'all'
      ? achievements
      : achievements.filter((a) => a.isNew);

  const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
  const newBadges = achievements.filter((a) => a.isNew).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
          <p className="text-gray-600">
            Track your progress and celebrate your learning milestones
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAchievements}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-500 rounded-full" />
          <p className="text-amber-800 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="bordered" className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Badges</p>
                <p className="text-4xl font-bold text-gray-900">{achievements.length}</p>
              </div>
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Points</p>
                <p className="text-4xl font-bold text-gray-900">{totalPoints.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">New Badges</p>
                <p className="text-4xl font-bold text-gray-900">{newBadges}</p>
              </div>
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Badges ({achievements.length})
        </Button>
        <Button
          variant={filter === 'new' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('new')}
        >
          New ({newBadges})
        </Button>
      </div>

      {/* Badges Grid */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAchievements.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'new' ? 'No new achievements' : 'No achievements yet'}
          </h3>
          <p className="text-gray-600">
            {filter === 'new'
              ? 'Complete courses and activities to earn new badges'
              : 'Start learning to earn your first badge'}
          </p>
        </div>
      )}

      {/* In Progress Section */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">In Progress</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingBadges.map((badge) => (
            <Card key={badge.id} variant="bordered">
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl opacity-50">
                    {badge.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {badge.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{badge.description}</p>

                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">{badge.requirement}</span>
                      <span className="font-medium text-gray-900">{badge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Leaderboard Teaser */}
      <Card variant="bordered" className="bg-gradient-to-br from-primary-50 to-secondary-50">
        <CardContent className="text-center">
          <Trophy className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h3 className="font-bold text-xl text-gray-900 mb-2">
            Compete on the Leaderboard
          </h3>
          <p className="text-gray-600 mb-4">
            See how you rank against other learners and earn exclusive rewards
          </p>
          <Link href="/leaderboard">
            <Button variant="primary" size="lg">
              View Leaderboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
