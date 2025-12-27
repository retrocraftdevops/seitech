'use client';

import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, LeaderboardCategory, LeaderboardPeriod } from '@/types/social';
import { Trophy, TrendingUp, TrendingDown, Minus, RefreshCw, Award, Target, Medal } from 'lucide-react';

interface LeaderboardTableProps {
  initialCategory?: LeaderboardCategory;
  initialPeriod?: LeaderboardPeriod;
  topN?: number;
  showFilters?: boolean;
}

export default function LeaderboardTable({
  initialCategory = 'overall',
  initialPeriod = 'all_time',
  topN = 50,
  showFilters = true,
}: LeaderboardTableProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<LeaderboardCategory>(initialCategory);
  const [period, setPeriod] = useState<LeaderboardPeriod>(initialPeriod);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [category, period, topN]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category,
        period,
        top_n: topN.toString(),
      });

      const response = await fetch(`/api/leaderboard?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
      });
      if (response.ok) {
        await fetchLeaderboard();
      }
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getCategoryLabel = (cat: LeaderboardCategory) => {
    const labels: Record<LeaderboardCategory, string> = {
      overall: 'Overall',
      courses: 'Courses Completed',
      discussions: 'Discussion Points',
      study_groups: 'Study Groups',
      streak: 'Learning Streaks',
      quiz_scores: 'Quiz Scores',
      certificates: 'Certificates',
    };
    return labels[cat];
  };

  const getPeriodLabel = (per: LeaderboardPeriod) => {
    const labels: Record<LeaderboardPeriod, string> = {
      all_time: 'All Time',
      yearly: 'This Year',
      monthly: 'This Month',
      weekly: 'This Week',
      daily: 'Today',
    };
    return labels[per];
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-600" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return null;
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getPercentileBadge = (rank: number, total: number) => {
    const percentile = (rank / total) * 100;
    if (percentile <= 1) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <Trophy className="h-3 w-3 mr-1" />
          Top 1%
        </span>
      );
    }
    if (percentile <= 5) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Award className="h-3 w-3 mr-1" />
          Top 5%
        </span>
      );
    }
    if (percentile <= 10) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <Target className="h-3 w-3 mr-1" />
          Top 10%
        </span>
      );
    }
    return null;
  };

  const getUserAvatar = (entry: LeaderboardEntry) => {
    if (entry.user_avatar) {
      return (
        <img
          src={`data:image/png;base64,${entry.user_avatar}`}
          alt={entry.user_name}
          className="h-10 w-10 rounded-full object-cover"
        />
      );
    }

    const initial = entry.user_name.charAt(0).toUpperCase();
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
    ];
    const colorIndex = entry.user_id % colors.length;

    return (
      <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold`}>
        {initial}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 mb-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8" />
            <div>
              <h3 className="text-2xl font-bold">Leaderboard</h3>
              <p className="text-sm opacity-90">{getCategoryLabel(category)} · {getPeriodLabel(period)}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LeaderboardCategory)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="overall">Overall</option>
                <option value="courses">Courses Completed</option>
                <option value="discussions">Discussion Points</option>
                <option value="study_groups">Study Groups</option>
                <option value="streak">Learning Streaks</option>
                <option value="quiz_scores">Quiz Scores</option>
                <option value="certificates">Certificates</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as LeaderboardPeriod)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all_time">All Time</option>
                <option value="yearly">This Year</option>
                <option value="monthly">This Month</option>
                <option value="weekly">This Week</option>
                <option value="daily">Today</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Change
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry, index) => (
              <tr
                key={entry.id}
                className={`hover:bg-gray-50 transition-colors ${
                  entry.user_id === currentUserId ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(entry.rank) || (
                      <span className={`text-lg font-bold ${getRankColor(entry.rank)}`}>
                        #{entry.rank}
                      </span>
                    )}
                    {getPercentileBadge(entry.rank, entries.length)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    {getUserAvatar(entry)}
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center">
                        {entry.user_name}
                        {entry.user_id === currentUserId && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      {entry.achievements && entry.achievements.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          {entry.achievements.slice(0, 3).map((achievement, i) => (
                            <span key={i} className="text-xs">
                              {achievement}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-2xl font-bold text-gray-900">{entry.score.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{entry.level && `Level ${entry.level}`}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {entry.courses_completed > 0 && (
                      <div className="text-sm text-gray-600">
                        📚 {entry.courses_completed} courses
                      </div>
                    )}
                    {entry.discussions_count > 0 && (
                      <div className="text-sm text-gray-600">
                        💬 {entry.discussions_count} discussions
                      </div>
                    )}
                    {entry.streak_days > 0 && (
                      <div className="text-sm text-gray-600">
                        🔥 {entry.streak_days} day streak
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getRankChangeIcon(entry.rank_change)}
                    <span
                      className={`text-sm font-semibold ${
                        entry.rank_change > 0
                          ? 'text-green-600'
                          : entry.rank_change < 0
                          ? 'text-red-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {entry.rank_change > 0 && '+'}
                      {entry.rank_change}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rankings Yet</h3>
          <p className="text-gray-600">Be the first to climb the leaderboard!</p>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing top {entries.length} {entries.length === 1 ? 'user' : 'users'}
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
