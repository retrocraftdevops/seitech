'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Calendar, Clock, Target, TrendingUp, BookOpen, CheckCircle2 } from 'lucide-react';
import type { LearningPath } from '@/types/adaptive-learning';
import Link from 'next/link';

interface LearningPathCardProps {
  path: LearningPath;
  onAction?: (pathId: number, action: string) => void;
  showActions?: boolean;
}

const pathTypeConfig = {
  custom: { label: 'Custom', color: 'bg-blue-500', icon: Target },
  adaptive: { label: 'AI Adaptive', color: 'bg-purple-500', icon: TrendingUp },
  structured: { label: 'Structured', color: 'bg-green-500', icon: BookOpen },
};

const stateConfig = {
  draft: { label: 'Draft', color: 'secondary' },
  active: { label: 'Active', color: 'default' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'destructive' },
};

export function LearningPathCard({ path, onAction, showActions = true }: LearningPathCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const pathConfig = pathTypeConfig[path.path_type];
  const PathIcon = pathConfig.icon;
  const stateStyle = stateConfig[path.state];

  const handleAction = async (action: string) => {
    if (!onAction) return;
    setIsLoading(true);
    try {
      await onAction(path.id, action);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatHours = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${Math.round(hours)}h`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded ${pathConfig.color} text-white`}>
                <PathIcon className="w-4 h-4" />
              </div>
              <Badge variant={stateStyle.color as any}>{stateStyle.label}</Badge>
              {path.is_template && <Badge variant="outline">Template</Badge>}
            </div>
            <CardTitle className="text-xl mb-1">
              <Link href={`/dashboard/learning-paths/${path.id}`} className="hover:text-primary">
                {path.name}
              </Link>
            </CardTitle>
            <CardDescription className="line-clamp-2">{path.goal || 'No description'}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{Math.round(path.progress_percentage)}%</span>
          </div>
          <Progress value={path.progress_percentage} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span>
              <span className="font-semibold">{path.completed_count}</span>
              <span className="text-muted-foreground">/{path.node_count}</span> courses
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{formatHours(path.estimated_hours)}</span>
          </div>
          {path.deadline && (
            <div className="flex items-center gap-2 col-span-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground">Due: </span>
                <span className="font-medium">{formatDate(path.deadline)}</span>
              </span>
            </div>
          )}
        </div>

        {/* Skills Tags */}
        {path.skills && path.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {path.skills.slice(0, 3).map((skill) => (
              <Badge key={skill.id} variant="outline" className="text-xs">
                {skill.name}
              </Badge>
            ))}
            {path.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{path.skills.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2">
          {path.state === 'draft' && (
            <>
              <Button
                size="sm"
                onClick={() => handleAction('activate')}
                disabled={isLoading}
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Start Path
              </Button>
              {path.path_type === 'adaptive' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction('generate_ai')}
                  disabled={isLoading}
                >
                  🤖 Generate AI
                </Button>
              )}
            </>
          )}
          {path.state === 'active' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Link href={`/dashboard/learning-paths/${path.id}`}>
                Continue Learning
              </Link>
            </Button>
          )}
          {path.state === 'completed' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Link href={`/dashboard/learning-paths/${path.id}`}>
                <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                View Completed
              </Link>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
