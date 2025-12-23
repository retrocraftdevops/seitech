import { Card, CardContent } from '@/components/ui/Card';
import { UserStats } from '@/types/user';
import { BookOpen, Award, Trophy, Clock, TrendingUp, Flame } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatsOverviewProps {
  stats: UserStats;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}

function StatCard({ icon: Icon, label, value, subtext, color }: StatCardProps) {
  return (
    <Card variant="bordered">
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours >= 1) {
      return `${hours}h`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        icon={BookOpen}
        label="Total Courses"
        value={stats.totalCourses}
        subtext={`${stats.inProgressCourses} in progress`}
        color="bg-blue-100 text-blue-600"
      />

      <StatCard
        icon={Award}
        label="Certificates"
        value={stats.totalCertificates}
        subtext={`${stats.completedCourses} courses completed`}
        color="bg-amber-100 text-amber-600"
      />

      <StatCard
        icon={Trophy}
        label="Total Points"
        value={stats.totalPoints.toLocaleString()}
        subtext={`${stats.totalBadges} badges earned`}
        color="bg-purple-100 text-purple-600"
      />

      <StatCard
        icon={Clock}
        label="Learning Time"
        value={formatTime(stats.totalTimeSpent)}
        subtext="Total time spent"
        color="bg-green-100 text-green-600"
      />

      <StatCard
        icon={Flame}
        label="Current Streak"
        value={`${stats.currentStreak} days`}
        subtext={`Longest: ${stats.longestStreak} days`}
        color="bg-orange-100 text-orange-600"
      />

      <StatCard
        icon={TrendingUp}
        label="Completion Rate"
        value={`${Math.round((stats.completedCourses / stats.totalCourses) * 100)}%`}
        subtext={`${stats.completedCourses} of ${stats.totalCourses} completed`}
        color="bg-primary-100 text-primary-600"
      />
    </div>
  );
}
