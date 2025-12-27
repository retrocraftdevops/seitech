'use client';

import { useState, useEffect } from 'react';
import { Brain, Target, TrendingUp, Book, Award, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface LearningPreference {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading_writing: number;
}

interface PerformanceMetric {
  metric_name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface AdaptiveProfileProps {
  userId: number;
}

export default function AdaptiveProfile({ userId }: AdaptiveProfileProps) {
  const [preferences, setPreferences] = useState<LearningPreference>({
    visual: 50,
    auditory: 50,
    kinesthetic: 50,
    reading_writing: 50,
  });

  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch actual data from API
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      // Mock data for now
      setMetrics([
        {
          metric_name: 'Completion Rate',
          value: 75,
          trend: 'up',
          description: 'Courses completed',
        },
        {
          metric_name: 'Average Score',
          value: 85,
          trend: 'up',
          description: 'Quiz performance',
        },
        {
          metric_name: 'Learning Speed',
          value: 60,
          trend: 'stable',
          description: 'Time to complete courses',
        },
      ]);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Learning Preferences */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Learning Preferences
          </h3>
          <div className="space-y-4">
            {Object.entries(preferences).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{key}</span>
                  <span className="text-sm text-gray-600">{value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {metric.metric_name}
                  </span>
                  {metric.trend === 'up' && (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  )}
                  {metric.trend === 'down' && (
                    <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                  )}
                  {metric.trend === 'stable' && (
                    <div className="w-4 h-4 border-2 border-gray-400 rounded" />
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900">{metric.value}%</div>
                <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Recommendations
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                Based on your learning style, we recommend focusing on visual content
                and interactive exercises.
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-900">
                Your completion rate is improving! Keep up the great work.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

