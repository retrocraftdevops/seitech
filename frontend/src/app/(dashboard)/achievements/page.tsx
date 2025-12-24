'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, Star, TrendingUp, Loader2, RefreshCw, Flame } from 'lucide-react';

interface Achievement {
  id: number;
  badgeId: number;
  badgeName: string;
  badgeDescription: string;
  badgeIcon?: string;
  badgeColor: string;
  badgeType: string;
  earnedDate: string;
  courseName?: string;
  badgeImage?: string;
}

interface UserStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  badgesEarned: number;
  coursesCompleted: number;
  rank?: number;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gamification/user-achievements');
      const data = await response.json();

      if (data.success && data.data) {
        setAchievements(data.data.achievements || []);
        setStats(data.data.stats || null);
      } else {
        setAchievements([]);
        if (data.message) {
          setError(data.message);
        }
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setAchievements([]);
      setError('Unable to load achievements. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const totalPoints = stats?.totalPoints || 0;
  const totalBadges = achievements.length;

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="bordered" className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Badges</p>
                <p className="text-4xl font-bold text-gray-900">{totalBadges}</p>
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

        <Card variant="bordered" className="bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-4xl font-bold text-gray-900">{stats?.currentStreak || 0}</p>
              </div>
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Flame className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Courses Completed</p>
                <p className="text-4xl font-bold text-gray-900">{stats?.coursesCompleted || 0}</p>
              </div>
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Grid */}
      {achievements.length > 0 ? (
        <>
          <h2 className="text-xl font-bold text-gray-900">Your Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} variant="bordered" hover>
                <CardContent className="text-center">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${achievement.badgeColor}20` }}
                  >
                    {achievement.badgeImage ? (
                      <img src={achievement.badgeImage} alt={achievement.badgeName} className="w-12 h-12" />
                    ) : (
                      <span className="text-3xl">{achievement.badgeIcon || '🏆'}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{achievement.badgeName}</h3>
                  <p className="text-sm text-gray-600 mb-2">{achievement.badgeDescription}</p>
                  {achievement.courseName && (
                    <p className="text-xs text-gray-500 mb-2">From: {achievement.courseName}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Earned: {new Date(achievement.earnedDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements yet</h3>
          <p className="text-gray-600 mb-4">Start learning to earn your first badge</p>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      )}

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
