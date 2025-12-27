'use client';

import React, { useState, useEffect } from 'react';
import { LearningStreak } from '@/types/social';
import { Flame, Snowflake, Award, Target, TrendingUp, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakWidgetProps {
  userId?: number;
  compact?: boolean;
}

export default function StreakWidget({ userId, compact = false }: StreakWidgetProps) {
  const [streak, setStreak] = useState<LearningStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetchStreak();
  }, [userId]);

  const fetchStreak = async () => {
    try {
      const response = await fetch('/api/streaks/me');
      if (response.ok) {
        const data = await response.json();
        setStreak(data);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseFreeze = async () => {
    if (!streak || streak.freeze_days_available === 0) return;

    try {
      const response = await fetch('/api/streaks/me/freeze', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setStreak({ ...streak, ...data });
        alert('Freeze day activated! Your streak is protected for today.');
      }
    } catch (error) {
      console.error('Error using freeze day:', error);
    }
  };

  const getStreakColor = (days: number) => {
    if (days >= 100) return 'from-purple-500 to-pink-500';
    if (days >= 30) return 'from-orange-500 to-red-500';
    if (days >= 7) return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-cyan-500';
  };

  const getStreakEmoji = (days: number) => {
    if (days >= 100) return '🔥🔥🔥';
    if (days >= 30) return '🔥🔥';
    if (days >= 7) return '🔥';
    return '⚡';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg ${compact ? 'p-4' : 'p-6'}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (!streak) {
    return null;
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <Flame className={`h-8 w-8 text-orange-600`} />
            </motion.div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {streak.current_streak} {getStreakEmoji(streak.current_streak)}
              </div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
          </div>
          {streak.freeze_days_available > 0 && (
            <div className="flex items-center space-x-1 text-sm text-blue-600">
              <Snowflake className="h-4 w-4" />
              <span>{streak.freeze_days_available}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getStreakColor(streak.current_streak)} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                <Flame className="h-12 w-12" />
              </motion.div>
              <div>
                <div className="text-5xl font-bold">{streak.current_streak}</div>
                <div className="text-sm opacity-90">Day Streak {getStreakEmoji(streak.current_streak)}</div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{streak.longest_streak}</div>
            <div className="text-sm opacity-90">Best Streak</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-2">
            <Award className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{streak.perfect_weeks}</div>
          <div className="text-xs text-gray-600">Perfect Weeks</div>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-2">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{streak.perfect_months}</div>
          <div className="text-xs text-gray-600">Perfect Months</div>
        </div>
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-2">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{streak.total_activities}</div>
          <div className="text-xs text-gray-600">Total Activities</div>
        </div>
      </div>

      {/* Next Milestone */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Next Milestone</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">{streak.next_milestone} days</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className={`bg-gradient-to-r ${getStreakColor(streak.current_streak)} h-3 rounded-full transition-all duration-500`}
            style={{
              width: `${(streak.current_streak / streak.next_milestone) * 100}%`,
            }}
          />
        </div>
        <div className="text-sm text-gray-600 text-center">
          {streak.next_milestone - streak.current_streak} days to go!
        </div>
      </div>

      {/* Freeze Days */}
      {streak.freeze_days_available > 0 && (
        <div className="p-6 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Snowflake className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Freeze Protection</span>
              </div>
              <p className="text-sm text-gray-600">
                You have <span className="font-bold text-blue-600">{streak.freeze_days_available}</span> freeze {streak.freeze_days_available === 1 ? 'day' : 'days'} available
              </p>
            </div>
            <button
              onClick={handleUseFreeze}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Snowflake className="h-4 w-4" />
              <span>Use Freeze</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Protect your streak from breaking if you miss a day
          </p>
        </div>
      )}

      {/* Milestones */}
      {streak.milestones && streak.milestones.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Milestones Achieved
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {streak.milestones
              .filter(m => m.achieved)
              .slice(-6)
              .map((milestone) => (
                <div
                  key={milestone.id}
                  className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                >
                  <div className="text-lg font-bold text-orange-600">{milestone.days}</div>
                  <div className="text-xs text-gray-600">Days</div>
                  {milestone.freeze_days_earned > 0 && (
                    <div className="mt-1 text-xs text-blue-600 flex items-center justify-center">
                      <Snowflake className="h-3 w-3 mr-1" />
                      +{milestone.freeze_days_earned}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Daily Goal */}
      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-gray-900">Today's Goal</span>
          </div>
          {streak.daily_goal_met ? (
            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold flex items-center">
              <Award className="h-4 w-4 mr-1" />
              Completed!
            </span>
          ) : (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
              In Progress
            </span>
          )}
        </div>
      </div>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10"
          >
            <div className="bg-white rounded-xl p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              >
                <Flame className="h-16 w-16 text-orange-600 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Streak Active!</h3>
              <p className="text-gray-600">Keep it going! 🔥</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
