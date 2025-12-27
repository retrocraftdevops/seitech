import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  isLoading?: boolean;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  isLoading = false,
  iconBgColor = 'bg-primary-100',
  iconColor = 'text-primary-600',
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card hover>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className={cn('p-2.5 rounded-lg', iconBgColor)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-3xl font-bold text-gray-900">{value}</p>

          {trend && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-sm font-medium flex items-center gap-1',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                <svg
                  className={cn(
                    'h-4 w-4',
                    !trend.isPositive && 'rotate-180'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                {Math.abs(trend.value)}%
              </span>
              {description && (
                <span className="text-sm text-gray-500">{description}</span>
              )}
            </div>
          )}

          {!trend && description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
