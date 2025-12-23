'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Video, Users, User, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatDate } from '@/lib/utils';
import type { ScheduleListItem, MeetingType } from '@/types';

interface ScheduleCardProps {
  schedule: ScheduleListItem;
  variant?: 'default' | 'compact' | 'horizontal';
  showCourse?: boolean;
}

const meetingTypeBadgeColors: Record<MeetingType, string> = {
  zoom: 'bg-blue-50 text-blue-700 border-blue-200',
  teams: 'bg-purple-50 text-purple-700 border-purple-200',
  meet: 'bg-green-50 text-green-700 border-green-200',
  jitsi: 'bg-orange-50 text-orange-700 border-orange-200',
  custom: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  in_person: 'bg-amber-50 text-amber-700 border-amber-200',
};

const meetingTypeLabels: Record<MeetingType, string> = {
  zoom: 'Zoom',
  teams: 'MS Teams',
  meet: 'Google Meet',
  jitsi: 'Jitsi',
  custom: 'Online',
  in_person: 'In Person',
};

function formatScheduleDate(datetime: string): { date: string; time: string; dayName: string } {
  const d = new Date(datetime);
  const date = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' });
  return { date, time, dayName };
}

function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) {
    return `${h}h`;
  }
  return `${h}h ${m}m`;
}

export function ScheduleCard({ schedule, variant = 'default', showCourse = true }: ScheduleCardProps) {
  const { date, time, dayName } = formatScheduleDate(schedule.startDatetime);
  const isVirtual = schedule.meetingType !== 'in_person';
  const spotsText =
    schedule.availableSpots === -1
      ? 'Unlimited spots'
      : schedule.availableSpots === 0
        ? 'Fully booked'
        : `${schedule.availableSpots} spots left`;
  const isFull = schedule.availableSpots === 0;

  if (variant === 'compact') {
    return (
      <Link href={`/schedule/${schedule.id}`}>
        <Card hover className="p-4">
          <div className="flex items-center gap-4">
            {/* Date block */}
            <div className="flex-shrink-0 w-16 h-16 bg-primary-50 rounded-xl flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-primary-600 uppercase">{dayName}</span>
              <span className="text-xl font-bold text-primary-700">
                {new Date(schedule.startDatetime).getDate()}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{schedule.name}</h4>
              <p className="text-sm text-gray-500">{time} - {formatDuration(schedule.duration)}</p>
            </div>

            {/* Badge */}
            <Badge className={cn('flex-shrink-0', meetingTypeBadgeColors[schedule.meetingType])}>
              {isVirtual ? <Video className="w-3 h-3 mr-1" /> : <MapPin className="w-3 h-3 mr-1" />}
              {meetingTypeLabels[schedule.meetingType]}
            </Badge>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link href={`/schedule/${schedule.id}`}>
        <Card hover className="overflow-hidden">
          <div className="flex">
            {/* Date column */}
            <div className="flex-shrink-0 w-24 bg-primary-600 text-white p-4 flex flex-col items-center justify-center">
              <span className="text-sm font-medium uppercase">{dayName}</span>
              <span className="text-3xl font-bold">
                {new Date(schedule.startDatetime).getDate()}
              </span>
              <span className="text-sm">
                {new Date(schedule.startDatetime).toLocaleDateString('en-GB', { month: 'short' })}
              </span>
            </div>

            {/* Content */}
            <CardContent className="flex-1 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {showCourse && (
                    <p className="text-sm text-primary-600 font-medium mb-1">{schedule.courseName}</p>
                  )}
                  <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {schedule.name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {time} ({formatDuration(schedule.duration)})
                    </span>
                    <span className="flex items-center gap-1">
                      {isVirtual ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      {isVirtual ? meetingTypeLabels[schedule.meetingType] : schedule.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {schedule.instructorName}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge className={cn(meetingTypeBadgeColors[schedule.meetingType])}>
                    {meetingTypeLabels[schedule.meetingType]}
                  </Badge>
                  <span className={cn('text-sm', isFull ? 'text-red-600' : 'text-gray-500')}>
                    {spotsText}
                  </span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  // Default variant (card layout)
  return (
    <Link href={`/schedule/${schedule.id}`}>
      <Card hover className="h-full group overflow-hidden">
        {/* Date header */}
        <div className="bg-primary-600 text-white p-4 text-center">
          <p className="text-sm font-medium uppercase tracking-wide opacity-90">{dayName}</p>
          <p className="text-3xl font-bold">{new Date(schedule.startDatetime).getDate()}</p>
          <p className="text-sm">
            {new Date(schedule.startDatetime).toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <CardContent className="p-5">
          {/* Course link */}
          {showCourse && (
            <p className="text-sm text-primary-600 font-medium mb-2 line-clamp-1">
              {schedule.courseName}
            </p>
          )}

          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {schedule.name}
          </h3>

          {/* Time and duration */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{time}</span>
            <span className="text-gray-400">|</span>
            <span>{formatDuration(schedule.duration)}</span>
          </div>

          {/* Location/Platform */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            {isVirtual ? (
              <Video className="w-4 h-4 text-gray-400" />
            ) : (
              <MapPin className="w-4 h-4 text-gray-400" />
            )}
            <span>{isVirtual ? meetingTypeLabels[schedule.meetingType] : schedule.location || 'TBA'}</span>
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-3 mb-4">
            {schedule.instructorImageUrl ? (
              <Image
                src={schedule.instructorImageUrl}
                alt={schedule.instructorName}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                {schedule.instructorName.charAt(0)}
              </div>
            )}
            <span className="text-sm text-gray-600">{schedule.instructorName}</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className={cn('text-sm', isFull ? 'text-red-600 font-medium' : 'text-gray-500')}>
                {spotsText}
              </span>
            </div>

            <Badge className={cn(meetingTypeBadgeColors[schedule.meetingType])}>
              {meetingTypeLabels[schedule.meetingType]}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
