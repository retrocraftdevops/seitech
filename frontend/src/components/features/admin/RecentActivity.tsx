import { formatRelativeDate } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { AdminActivity } from '@/types/admin';
import {
  UserPlus,
  BookOpen,
  GraduationCap,
  Award,
  Settings,
  FileEdit,
  Trash2,
  CheckCircle,
} from 'lucide-react';

interface RecentActivityProps {
  activities: AdminActivity[];
  isLoading?: boolean;
}

const activityIcons: Record<string, any> = {
  create: UserPlus,
  edit: FileEdit,
  delete: Trash2,
  publish: CheckCircle,
  enroll: GraduationCap,
  complete: Award,
  update: Settings,
  default: BookOpen,
};

const activityColors: Record<string, string> = {
  create: 'bg-green-100 text-green-600',
  edit: 'bg-blue-100 text-blue-600',
  delete: 'bg-red-100 text-red-600',
  publish: 'bg-purple-100 text-purple-600',
  enroll: 'bg-indigo-100 text-indigo-600',
  complete: 'bg-yellow-100 text-yellow-600',
  update: 'bg-gray-100 text-gray-600',
  default: 'bg-gray-100 text-gray-600',
};

export function RecentActivity({ activities, isLoading = false }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.action] || activityIcons.default;
            const colorClass = activityColors[activity.action] || activityColors.default;

            return (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.userName}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {activity.description}
                      </p>
                    </div>
                    {activity.userAvatar && (
                      <img
                        src={activity.userAvatar}
                        alt={activity.userName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeDate(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
