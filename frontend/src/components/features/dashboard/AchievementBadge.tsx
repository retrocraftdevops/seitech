import { Card, CardContent } from '@/components/ui/Card';
import { Badge as UIBadge } from '@/components/ui/Badge';
import { Achievement } from '@/types/user';
import { Sparkles } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card
      variant="default"
      hover
      className="relative overflow-visible"
    >
      {achievement.isNew && (
        <div className="absolute -top-2 -right-2 z-10">
          <UIBadge variant="success" className="shadow-lg">
            <Sparkles className="w-3 h-3 mr-1" />
            New
          </UIBadge>
        </div>
      )}

      <CardContent className="text-center">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-md"
          style={{ backgroundColor: achievement.badgeColor }}
        >
          {achievement.badgeIcon}
        </div>

        <h3 className="font-semibold text-lg text-gray-900 mb-2">
          {achievement.badgeName}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {achievement.description}
        </p>

        <div className="flex items-center justify-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-primary-600">
              +{achievement.points}
            </span>
            <span className="text-gray-600">points</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600">{formatDate(achievement.earnedDate)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
