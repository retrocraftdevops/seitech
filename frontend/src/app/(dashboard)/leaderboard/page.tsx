'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Crown, Flame, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  previousRank: number;
  userId: number;
  name: string;
  avatar?: string;
  totalPoints: number;
  coursesCompleted: number;
  badgesEarned: number;
  currentStreak: number;
  isCurrentUser?: boolean;
}

interface TimeFilter {
  value: 'week' | 'month' | 'all';
  label: string;
}

const timeFilters: TimeFilter[] = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    previousRank: 1,
    userId: 1,
    name: 'Sarah Johnson',
    totalPoints: 15420,
    coursesCompleted: 28,
    badgesEarned: 42,
    currentStreak: 45,
  },
  {
    rank: 2,
    previousRank: 3,
    userId: 2,
    name: 'Michael Chen',
    totalPoints: 14850,
    coursesCompleted: 25,
    badgesEarned: 38,
    currentStreak: 32,
  },
  {
    rank: 3,
    previousRank: 2,
    userId: 3,
    name: 'Emma Williams',
    totalPoints: 13920,
    coursesCompleted: 24,
    badgesEarned: 35,
    currentStreak: 28,
  },
  {
    rank: 4,
    previousRank: 5,
    userId: 4,
    name: 'James Wilson',
    totalPoints: 12450,
    coursesCompleted: 22,
    badgesEarned: 30,
    currentStreak: 21,
  },
  {
    rank: 5,
    previousRank: 4,
    userId: 5,
    name: 'Lisa Anderson',
    totalPoints: 11830,
    coursesCompleted: 20,
    badgesEarned: 28,
    currentStreak: 15,
  },
  {
    rank: 6,
    previousRank: 7,
    userId: 6,
    name: 'David Brown',
    totalPoints: 10920,
    coursesCompleted: 19,
    badgesEarned: 25,
    currentStreak: 12,
  },
  {
    rank: 7,
    previousRank: 6,
    userId: 7,
    name: 'Jennifer Taylor',
    totalPoints: 10150,
    coursesCompleted: 18,
    badgesEarned: 24,
    currentStreak: 18,
  },
  {
    rank: 8,
    previousRank: 9,
    userId: 8,
    name: 'Robert Martinez',
    totalPoints: 9480,
    coursesCompleted: 16,
    badgesEarned: 22,
    currentStreak: 9,
  },
  {
    rank: 9,
    previousRank: 8,
    userId: 9,
    name: 'Amanda Garcia',
    totalPoints: 8920,
    coursesCompleted: 15,
    badgesEarned: 20,
    currentStreak: 14,
  },
  {
    rank: 10,
    previousRank: 11,
    userId: 10,
    name: 'Christopher Lee',
    totalPoints: 8340,
    coursesCompleted: 14,
    badgesEarned: 18,
    currentStreak: 7,
  },
  {
    rank: 15,
    previousRank: 18,
    userId: 100,
    name: 'You',
    totalPoints: 2450,
    coursesCompleted: 12,
    badgesEarned: 8,
    currentStreak: 7,
    isCurrentUser: true,
  },
];

function RankChange({ current, previous }: { current: number; previous: number }) {
  const diff = previous - current;

  if (diff > 0) {
    return (
      <span className="flex items-center gap-1 text-green-600 text-sm">
        <TrendingUp className="w-4 h-4" />
        <span>+{diff}</span>
      </span>
    );
  } else if (diff < 0) {
    return (
      <span className="flex items-center gap-1 text-red-600 text-sm">
        <TrendingDown className="w-4 h-4" />
        <span>{diff}</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-gray-400 text-sm">
      <Minus className="w-4 h-4" />
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
        <Crown className="w-5 h-5 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
        <Medal className="w-5 h-5 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-lg">
        <Medal className="w-5 h-5 text-white" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
      <span className="font-bold text-gray-600">{rank}</span>
    </div>
  );
}

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter['value']>('month');
  const [leaderboard] = useState<LeaderboardEntry[]>(mockLeaderboard);

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3, 10);
  const currentUser = leaderboard.find((entry) => entry.isCurrentUser);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600 mt-1">See how you rank among other learners</p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
          {timeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTimeFilter(filter.value)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                timeFilter === filter.value
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Second Place */}
        <Card className="md:mt-8 order-2 md:order-1">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto">
                {topThree[1]?.name.charAt(0) || '?'}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold border-4 border-white">
                2
              </div>
            </div>
            <h3 className="font-bold text-gray-900">{topThree[1]?.name}</h3>
            <p className="text-2xl font-bold text-gray-700 mt-2">
              {topThree[1]?.totalPoints.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">points</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-gray-400" />
                {topThree[1]?.coursesCompleted}
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-gray-400" />
                {topThree[1]?.badgesEarned}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* First Place */}
        <Card className="border-2 border-yellow-400 bg-gradient-to-b from-yellow-50 to-white order-1 md:order-2">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-4xl font-bold text-white mx-auto shadow-lg">
                {topThree[0]?.name.charAt(0) || '?'}
              </div>
              <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-500" />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold border-4 border-white shadow-lg">
                1
              </div>
            </div>
            <h3 className="font-bold text-lg text-gray-900">{topThree[0]?.name}</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {topThree[0]?.totalPoints.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">points</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                {topThree[0]?.coursesCompleted}
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-yellow-500" />
                {topThree[0]?.badgesEarned}
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                {topThree[0]?.currentStreak}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Third Place */}
        <Card className="md:mt-12 order-3">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto">
                {topThree[2]?.name.charAt(0) || '?'}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-white font-bold border-4 border-white">
                3
              </div>
            </div>
            <h3 className="font-bold text-gray-900">{topThree[2]?.name}</h3>
            <p className="text-2xl font-bold text-gray-700 mt-2">
              {topThree[2]?.totalPoints.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">points</p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-gray-400" />
                {topThree[2]?.coursesCompleted}
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4 text-gray-400" />
                {topThree[2]?.badgesEarned}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rest of Leaderboard */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Rank</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Learner</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-600">Points</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-600">Courses</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-600">Badges</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-600">Streak</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-600">Change</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((entry) => (
                  <tr
                    key={entry.userId}
                    className={cn(
                      'border-b border-gray-50 hover:bg-gray-50 transition-colors',
                      entry.isCurrentUser && 'bg-primary-50 hover:bg-primary-50'
                    )}
                  >
                    <td className="py-4 px-6">
                      <RankBadge rank={entry.rank} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-medium">
                          {entry.name.charAt(0)}
                        </div>
                        <span className={cn('font-medium', entry.isCurrentUser && 'text-primary-600')}>
                          {entry.name}
                          {entry.isCurrentUser && (
                            <Badge size="sm" variant="primary" className="ml-2">
                              You
                            </Badge>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900">
                      {entry.totalPoints.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600">{entry.coursesCompleted}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{entry.badgesEarned}</td>
                    <td className="py-4 px-6 text-center">
                      {entry.currentStreak > 0 ? (
                        <span className="flex items-center justify-center gap-1 text-orange-600">
                          <Flame className="w-4 h-4" />
                          {entry.currentStreak}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <RankChange current={entry.rank} previous={entry.previousRank} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Your Position (if not in top 10) */}
      {currentUser && currentUser.rank > 10 && (
        <Card className="border-2 border-primary-200 bg-primary-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <RankBadge rank={currentUser.rank} />
                <div>
                  <h3 className="font-bold text-gray-900">Your Position</h3>
                  <p className="text-sm text-gray-600">
                    You&apos;re ranked #{currentUser.rank} with {currentUser.totalPoints.toLocaleString()} points
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-bold text-gray-900">{currentUser.coursesCompleted}</p>
                  <p className="text-gray-500">Courses</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">{currentUser.badgesEarned}</p>
                  <p className="text-gray-500">Badges</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-600">
                    <Flame className="w-4 h-4" />
                    <span className="font-bold">{currentUser.currentStreak}</span>
                  </div>
                  <p className="text-gray-500">Streak</p>
                </div>
                <RankChange current={currentUser.rank} previous={currentUser.previousRank} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Climb the Leaderboard!</h3>
              <p className="text-white/90 text-sm mb-4">
                Earn more points by completing courses, passing quizzes, and maintaining your learning streak.
                The more you learn, the higher you&apos;ll rank!
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">Complete lessons: +50 pts</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">Pass quiz: +100 pts</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">Complete course: +500 pts</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">Earn badge: +200 pts</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
