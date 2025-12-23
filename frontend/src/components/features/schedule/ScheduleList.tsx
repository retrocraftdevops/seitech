'use client';

import { ScheduleCard } from './ScheduleCard';
import { cn } from '@/lib/utils';
import type { ScheduleListItem } from '@/types';

interface ScheduleListProps {
  schedules: ScheduleListItem[];
  variant?: 'grid' | 'list' | 'grouped';
  cardVariant?: 'default' | 'compact' | 'horizontal';
  showCourse?: boolean;
  emptyMessage?: string;
}

function groupSchedulesByDate(schedules: ScheduleListItem[]): Map<string, ScheduleListItem[]> {
  const groups = new Map<string, ScheduleListItem[]>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  for (const schedule of schedules) {
    const scheduleDate = new Date(schedule.startDatetime);
    scheduleDate.setHours(0, 0, 0, 0);

    let groupKey: string;

    if (scheduleDate.getTime() === today.getTime()) {
      groupKey = 'Today';
    } else if (scheduleDate.getTime() === tomorrow.getTime()) {
      groupKey = 'Tomorrow';
    } else if (scheduleDate < nextWeek) {
      groupKey = 'This Week';
    } else if (scheduleDate < nextMonth) {
      groupKey = 'This Month';
    } else {
      groupKey = scheduleDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(schedule);
  }

  return groups;
}

export function ScheduleList({
  schedules,
  variant = 'grid',
  cardVariant = 'default',
  showCourse = true,
  emptyMessage = 'No upcoming sessions found',
}: ScheduleListProps) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  if (variant === 'grouped') {
    const groups = groupSchedulesByDate(schedules);

    return (
      <div className="space-y-8">
        {Array.from(groups.entries()).map(([groupKey, groupSchedules]) => (
          <div key={groupKey}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <span>{groupKey}</span>
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {groupSchedules.length} session{groupSchedules.length !== 1 ? 's' : ''}
              </span>
            </h3>
            <div className="space-y-3">
              {groupSchedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  variant="horizontal"
                  showCourse={showCourse}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            variant={cardVariant === 'default' ? 'horizontal' : cardVariant}
            showCourse={showCourse}
          />
        ))}
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div
      className={cn(
        'grid gap-6',
        cardVariant === 'compact'
          ? 'grid-cols-1 md:grid-cols-2'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      )}
    >
      {schedules.map((schedule) => (
        <ScheduleCard
          key={schedule.id}
          schedule={schedule}
          variant={cardVariant}
          showCourse={showCourse}
        />
      ))}
    </div>
  );
}
