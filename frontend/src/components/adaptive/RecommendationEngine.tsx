'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Target, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Recommendation {
  id: number;
  type: 'course' | 'resource' | 'activity';
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecommendationEngineProps {
  userId: number;
}

export default function RecommendationEngine({ userId }: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      // TODO: Fetch actual recommendations from API
      // Mock data for now
      setRecommendations([
        {
          id: 1,
          type: 'course',
          title: 'Advanced React Patterns',
          description: 'Learn advanced patterns and best practices',
          reason: 'Based on your learning style and progress',
          priority: 'high',
        },
        {
          id: 2,
          type: 'resource',
          title: 'TypeScript Deep Dive',
          description: 'Comprehensive guide to TypeScript',
          reason: 'Complements your current learning path',
          priority: 'medium',
        },
        {
          id: 3,
          type: 'activity',
          title: 'Practice Quiz: JavaScript Fundamentals',
          description: 'Test your knowledge with this quiz',
          reason: 'Helps reinforce your learning',
          priority: 'low',
        },
      ]);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
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

  const getIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-5 h-5" />;
      case 'resource':
        return <Target className="w-5 h-5" />;
      case 'activity':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardContent>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Personalized Recommendations
        </h3>
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No recommendations available at this time.
            </p>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getIcon(rec.type)}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <p className="text-xs text-gray-500 mb-3">{rec.reason}</p>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

