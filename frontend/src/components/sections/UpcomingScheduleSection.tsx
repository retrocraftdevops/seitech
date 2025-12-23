'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Clock, Video, MapPin, Users, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { ScheduleListItem, MeetingType } from '@/types';

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

// Placeholder data for initial render / fallback
const placeholderSchedules: ScheduleListItem[] = [
  {
    id: 1,
    name: 'NEBOSH General Certificate - Live Session',
    courseName: 'NEBOSH National General Certificate',
    courseId: 1,
    courseSlug: 'nebosh-general-certificate',
    instructorName: 'John Smith',
    instructorId: 1,
    startDatetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDatetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    duration: 3,
    meetingType: 'zoom',
    maxAttendees: 30,
    attendeeCount: 18,
    availableSpots: 12,
    registrationRequired: true,
    state: 'scheduled',
  },
  {
    id: 2,
    name: 'Fire Risk Assessment Workshop',
    courseName: 'Fire Safety Awareness',
    courseId: 2,
    courseSlug: 'fire-safety-awareness',
    instructorName: 'Sarah Johnson',
    instructorId: 2,
    startDatetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDatetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    duration: 4,
    meetingType: 'in_person',
    location: 'London Training Centre',
    maxAttendees: 20,
    attendeeCount: 15,
    availableSpots: 5,
    registrationRequired: true,
    state: 'scheduled',
  },
  {
    id: 3,
    name: 'IOSH Managing Safely - Q&A Session',
    courseName: 'IOSH Managing Safely',
    courseId: 3,
    courseSlug: 'iosh-managing-safely',
    instructorName: 'Michael Brown',
    instructorId: 3,
    startDatetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDatetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    duration: 2,
    meetingType: 'teams',
    maxAttendees: 50,
    attendeeCount: 32,
    availableSpots: 18,
    registrationRequired: true,
    state: 'scheduled',
  },
  {
    id: 4,
    name: 'First Aid Practical Assessment',
    courseName: 'First Aid at Work',
    courseId: 4,
    courseSlug: 'first-aid-at-work',
    instructorName: 'Emma Wilson',
    instructorId: 4,
    startDatetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDatetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
    duration: 6,
    meetingType: 'in_person',
    location: 'Birmingham Training Centre',
    maxAttendees: 15,
    attendeeCount: 12,
    availableSpots: 3,
    registrationRequired: true,
    state: 'scheduled',
  },
];

function formatScheduleDate(datetime: string, isMounted: boolean) {
  const d = new Date(datetime);
  return {
    day: d.getDate(),
    month: d.toLocaleDateString('en-GB', { month: 'short' }),
    dayName: d.toLocaleDateString('en-GB', { weekday: 'short' }),
    // Use placeholder on server to prevent hydration mismatch
    time: isMounted ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--',
  };
}

function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function UpcomingScheduleSection() {
  const [schedules, setSchedules] = useState<ScheduleListItem[]>(placeholderSchedules);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchSchedules() {
      try {
        const res = await fetch('/api/schedules?limit=4&upcoming=true');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data.schedules.length > 0) {
            setSchedules(data.data.schedules);
          }
        }
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 uppercase tracking-wider mb-4">
              <Calendar className="w-4 h-4" />
              Training Schedule
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Upcoming{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                Live Sessions
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our interactive live training sessions led by industry experts.
              Book your spot today for hands-on learning experiences.
            </p>
          </motion.div>
        </div>

        {/* Schedule Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {schedules.map((schedule, index) => {
            const { day, month, dayName, time } = formatScheduleDate(schedule.startDatetime, isMounted);
            const isVirtual = schedule.meetingType !== 'in_person';
            const spotsText =
              schedule.availableSpots === -1
                ? 'Unlimited'
                : schedule.availableSpots === 0
                  ? 'Fully booked'
                  : `${schedule.availableSpots} spots`;
            const isFull = schedule.availableSpots === 0;

            return (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/schedule/${schedule.id}`}>
                  <Card hover className="h-full group overflow-hidden">
                    {/* Date header */}
                    <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-4 text-center">
                      <p className="text-sm font-medium uppercase tracking-wide opacity-90">{dayName}</p>
                      <p className="text-4xl font-bold">{day}</p>
                      <p className="text-sm opacity-90">{month}</p>
                    </div>

                    <CardContent className="p-4">
                      {/* Course name */}
                      <p className="text-xs text-primary-600 font-medium mb-1 truncate">
                        {schedule.courseName}
                      </p>

                      {/* Session title */}
                      <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors text-sm">
                        {schedule.name}
                      </h3>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{time}</span>
                        <span className="text-gray-400">|</span>
                        <span>{formatDuration(schedule.duration)}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        {isVirtual ? (
                          <Video className="w-4 h-4 text-gray-400" />
                        ) : (
                          <MapPin className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="truncate">
                          {isVirtual ? meetingTypeLabels[schedule.meetingType] : schedule.location || 'TBA'}
                        </span>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className={cn('text-xs', isFull ? 'text-red-600 font-medium' : 'text-gray-500')}>
                            {spotsText}
                          </span>
                        </div>
                        <Badge size="sm" className={cn(meetingTypeBadgeColors[schedule.meetingType])}>
                          {isVirtual ? 'Virtual' : 'In Person'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View All CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />} asChild>
            <Link href="/schedule">View Full Schedule</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
