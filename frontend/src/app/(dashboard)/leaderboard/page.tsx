'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Crown, Flame, Star, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  id: number;
  rank: number;
  userId: number;
  name: string;
  avatar?: string;
  totalPoints: number;
  coursesCompleted: number;
  badgesEarned: number;
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

function EmptyLeaderboard() {
  return (
    <Card className="p-12 text-center">
      <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Leaderboard Coming Soon
      </h3>
      <p className="text-gray-600 max-w-md mx-auto">
        Start completing courses and earning points to appear on the leaderboard.
        Be one of the first to claim the top spots!
      </p>
    </Card>
  );
}

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter['value']>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/gamification/leaderboard?limit=20');
        const data = await response.json();

        if (data.success && data.data?.leaderboard) {
          setLeaderboard(data.data.leaderboard);
        } else {
          setLeaderboard([]);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Unable to load leaderboard data');
        setLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [timeFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3, 10);

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

      {leaderboard.length === 0 ? (
        <EmptyLeaderboard />
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length >= 3 && (
            <div className="grid md:grid-cols-3 gap-4">
              {/* Second Place */}
              <Card className="md:mt-8 order-2 md:order-1">
                <CardContent className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    {topThree[1]?.avatar ? (
                      <img
                        src={topThree[1].avatar}
                        alt={topThree[1].name}
                        className="w-20 h-20 rounded-full object-cover mx-auto"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto">
                        {topThree[1]?.name.charAt(0) || '?'}
                      </div>
                    )}
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
                    {topThree[0]?.avatar ? (
                      <img
                        src={topThree[0].avatar}
                        alt={topThree[0].name}
                        className="w-24 h-24 rounded-full object-cover mx-auto shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-4xl font-bold text-white mx-auto shadow-lg">
                        {topThree[0]?.name.charAt(0) || '?'}
                      </div>
                    )}
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
                  </div>
                </CardContent>
              </Card>

              {/* Third Place */}
              <Card className="md:mt-12 order-3">
                <CardContent className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    {topThree[2]?.avatar ? (
                      <img
                        src={topThree[2].avatar}
                        alt={topThree[2].name}
                        className="w-20 h-20 rounded-full object-cover mx-auto"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto">
                        {topThree[2]?.name.charAt(0) || '?'}
                      </div>
                    )}
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
          )}

          {/* Rest of Leaderboard */}
          {rest.length > 0 && (
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
                      </tr>
                    </thead>
                    <tbody>
                      {rest.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <RankBadge rank={entry.rank} />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {entry.avatar ? (
                                <img
                                  src={entry.avatar}
                                  alt={entry.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-medium">
                                  {entry.name.charAt(0)}
                                </div>
                              )}
                              <span className="font-medium">{entry.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-semibold text-gray-900">
                            {entry.totalPoints.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-center text-gray-600">{entry.coursesCompleted}</td>
                          <td className="py-4 px-6 text-center text-gray-600">{entry.badgesEarned}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
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
