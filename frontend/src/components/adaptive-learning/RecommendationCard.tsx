'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Clock, TrendingUp, Bookmark, Eye, X } from 'lucide-react';
import type { Recommendation } from '@/types/adaptive-learning';
import Link from 'next/link';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAction?: (recId: number, action: 'viewed' | 'enroll' | 'save' | 'dismiss') => void;
  compact?: boolean;
}

const algorithmConfig: Record<string, { label: string; icon: string; color: string }> = {
  hybrid: { label: 'AI Hybrid', icon: '🤖', color: 'bg-purple-500' },
  collaborative: { label: 'Popular', icon: '👥', color: 'bg-blue-500' },
  content: { label: 'Similar', icon: '📚', color: 'bg-green-500' },
  skill_gap: { label: 'Skill Gap', icon: '🎯', color: 'bg-orange-500' },
  trending: { label: 'Trending', icon: '🔥', color: 'bg-red-500' },
  instructor: { label: 'Instructor', icon: '👨‍🏫', color: 'bg-indigo-500' },
};

export function RecommendationCard({ recommendation, onAction, compact = false }: RecommendationCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionCompleted, setActionCompleted] = useState<string | null>(null);

  const { algorithm, score: confidence_score, course, course_name, reason_text } = recommendation;
  const config = algorithmConfig[algorithm] || algorithmConfig.hybrid;
  const courseName = course?.name || course_name;
  const courseImage = course?.image_1024;
  const courseSlides = course?.total_slides;
  const courseTime = course?.total_time;
  const courseRating = course?.rating_avg;

  const handleAction = async (action: 'viewed' | 'enroll' | 'save' | 'dismiss') => {
    if (!onAction || isLoading) return;
    setIsLoading(true);
    try {
      await onAction(recommendation.id, action);
      setActionCompleted(action);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (!course) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
        {course.image_1024 && (
          <img
            src={course.image_1024}
            alt={course.name}
            className="w-16 h-16 object-cover rounded"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs">{config.icon}</span>
            <Badge variant="outline" className="text-xs">
              {Math.round(confidence_score * 100)}% match
            </Badge>
          </div>
          <Link
            href={`/courses/${course?.id || recommendation.course_id[0]}`}
            className="font-medium hover:text-primary truncate block"
          >
            {courseName}
          </Link>
          {courseTime && courseSlides && (
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{courseTime}</span>
              <span>·</span>
              <span>{courseSlides} lessons</span>
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleAction('save')}
          disabled={isLoading || actionCompleted === 'save'}
        >
          <Bookmark className={`w-4 h-4 ${actionCompleted === 'save' ? 'fill-current' : ''}`} />
        </Button>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start gap-3">
        {courseImage && (
          <img
            src={courseImage}
            alt={courseName}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
          />
        )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${config.color} text-white text-xs`}>
                {config.icon} {config.label}
              </Badge>
              <Badge
                variant="outline"
                className={`${getScoreColor(confidence_score)} border-current`}
              >
                {Math.round(confidence_score * 100)}% match
              </Badge>
            </div>
            <CardTitle className="text-lg mb-1">
              <Link href={`/courses/${course?.id || recommendation.course_id[0]}`} className="hover:text-primary">
                {courseName}
              </Link>
            </CardTitle>
            {course?.description && (
              <CardDescription className="line-clamp-2">{course.description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Course Stats */}
        {courseSlides && courseTime && (
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span>{courseSlides} lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{courseTime}</span>
            </div>
            {courseRating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span>{courseRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}

        {/* Reason */}
        {reason_text && (
          <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{reason_text}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          size="sm"
          onClick={() => handleAction('enroll')}
          disabled={isLoading || actionCompleted === 'enroll'}
          className="flex-1"
        >
          {actionCompleted === 'enroll' ? 'Enrolled!' : 'Enroll Now'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction('save')}
          disabled={isLoading || actionCompleted === 'save'}
        >
          <Bookmark className={`w-4 h-4 ${actionCompleted === 'save' ? 'fill-current' : ''}`} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleAction('dismiss')}
          disabled={isLoading || actionCompleted === 'dismiss'}
        >
          <X className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
