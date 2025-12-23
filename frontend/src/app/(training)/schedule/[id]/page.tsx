import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  User,
  ArrowLeft,
  ExternalLink,
  Download,
  Share2,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Schedule, MeetingType } from '@/types';

interface ScheduleDetailPageProps {
  params: { id: string };
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
  zoom: 'Zoom Meeting',
  teams: 'Microsoft Teams',
  meet: 'Google Meet',
  jitsi: 'Jitsi Meeting',
  custom: 'Online Session',
  in_person: 'In-Person Training',
};

async function getSchedule(id: string): Promise<Schedule | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/schedules/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch schedule');
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ScheduleDetailPageProps): Promise<Metadata> {
  const schedule = await getSchedule(params.id);

  if (!schedule) {
    return {
      title: 'Session Not Found | SEI Tech International',
    };
  }

  const startDate = new Date(schedule.startDatetime);
  const dateStr = startDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    title: `${schedule.name} | SEI Tech International`,
    description: `Join this live training session on ${dateStr}. ${schedule.description || schedule.course.name}`,
    openGraph: {
      title: schedule.name,
      description: `Live training session on ${dateStr}`,
    },
  };
}

function formatScheduleDateTime(datetime: string) {
  const d = new Date(datetime);
  return {
    date: d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    time: d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    day: d.getDate(),
    month: d.toLocaleDateString('en-GB', { month: 'short' }),
    dayName: d.toLocaleDateString('en-GB', { weekday: 'short' }),
  };
}

function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return h === 1 ? '1 hour' : `${h} hours`;
  return `${h}h ${m}m`;
}

function generateCalendarLinks(schedule: Schedule) {
  const start = new Date(schedule.startDatetime);
  const end = new Date(schedule.endDatetime);

  const formatDateForGoogle = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  };

  const formatDateForOutlook = (date: Date) => {
    return date.toISOString();
  };

  const title = encodeURIComponent(schedule.name);
  const details = encodeURIComponent(
    schedule.description || `Live training session for ${schedule.course.name}`
  );
  const location = encodeURIComponent(
    schedule.meetingType === 'in_person'
      ? schedule.location || 'TBA'
      : schedule.meetingUrl || 'Online'
  );

  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDateForGoogle(start)}/${formatDateForGoogle(end)}&details=${details}&location=${location}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${formatDateForOutlook(start)}&enddt=${formatDateForOutlook(end)}&body=${details}&location=${location}`,
  };
}

export default async function ScheduleDetailPage({ params }: ScheduleDetailPageProps) {
  const schedule = await getSchedule(params.id);

  if (!schedule) {
    notFound();
  }

  const startInfo = formatScheduleDateTime(schedule.startDatetime);
  const endInfo = formatScheduleDateTime(schedule.endDatetime);
  const isVirtual = schedule.meetingType !== 'in_person';
  const calendarLinks = generateCalendarLinks(schedule);

  const spotsText =
    schedule.availableSpots === -1
      ? 'Unlimited spots available'
      : schedule.availableSpots === 0
        ? 'This session is fully booked'
        : `${schedule.availableSpots} spots remaining`;

  const isFull = schedule.availableSpots === 0;
  const isPast = new Date(schedule.startDatetime) < new Date();
  const canRegister = !isFull && !isPast && schedule.state === 'scheduled';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Back Link */}
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Schedule
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              {/* Course badge */}
              {schedule.course.name && (
                <Link
                  href={`/courses/${schedule.course.slug || schedule.course.id}`}
                  className="inline-block"
                >
                  <Badge className="mb-4 bg-primary-500/20 text-primary-300 border-primary-500/30 hover:bg-primary-500/30">
                    {schedule.course.name}
                  </Badge>
                </Link>
              )}

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{schedule.name}</h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{startInfo.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>
                    {startInfo.time} - {endInfo.time} ({formatDuration(schedule.duration)})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isVirtual ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  <span>{isVirtual ? meetingTypeLabels[schedule.meetingType] : schedule.location}</span>
                </div>
              </div>
            </div>

            {/* Date Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white text-gray-900 rounded-2xl p-6 text-center shadow-xl w-40">
                <p className="text-sm font-medium text-gray-500 uppercase">{startInfo.dayName}</p>
                <p className="text-5xl font-bold text-primary-600">{startInfo.day}</p>
                <p className="text-lg font-medium">{startInfo.month}</p>
                <p className="text-sm text-gray-500 mt-2">{startInfo.time}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {schedule.description && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">About This Session</h2>
                    <div
                      className="prose prose-gray max-w-none"
                      dangerouslySetInnerHTML={{ __html: schedule.description }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* What You'll Learn */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Session Highlights</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        Live, interactive session with real-time Q&A
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        Expert instruction from certified trainers
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">
                        Practical examples and case studies
                      </span>
                    </li>
                    {schedule.hasRecording && (
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">Recording available after session</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Instructor */}
              {schedule.instructor && schedule.instructor.name && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Your Instructor</h2>
                    <div className="flex items-start gap-4">
                      {schedule.instructor.imageUrl ? (
                        <Image
                          src={schedule.instructor.imageUrl}
                          alt={schedule.instructor.name}
                          width={80}
                          height={80}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-10 h-10 text-primary-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {schedule.instructor.name}
                        </h3>
                        {schedule.instructor.title && (
                          <p className="text-primary-600 font-medium mb-2">
                            {schedule.instructor.title}
                          </p>
                        )}
                        {schedule.instructor.shortBio && (
                          <p className="text-gray-600">{schedule.instructor.shortBio}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Registration */}
            <div className="space-y-6">
              {/* Registration Card */}
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <Badge className={cn(meetingTypeBadgeColors[schedule.meetingType])}>
                      {meetingTypeLabels[schedule.meetingType]}
                    </Badge>
                    <Badge
                      variant={isFull ? 'danger' : isPast ? 'secondary' : 'success'}
                    >
                      {isPast ? 'Past Event' : isFull ? 'Fully Booked' : 'Open'}
                    </Badge>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                    <Users className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900">{schedule.attendeeCount} registered</p>
                      <p className={cn('text-sm', isFull ? 'text-red-600' : 'text-gray-500')}>
                        {spotsText}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar for capacity */}
                  {schedule.maxAttendees > 0 && (
                    <div className="mb-6">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            isFull ? 'bg-red-500' : 'bg-primary-500'
                          )}
                          style={{
                            width: `${Math.min(100, (schedule.attendeeCount / schedule.maxAttendees) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {schedule.attendeeCount}/{schedule.maxAttendees} spots filled
                      </p>
                    </div>
                  )}

                  {/* Register Button */}
                  {canRegister ? (
                    <Button size="lg" className="w-full mb-4">
                      Register Now
                    </Button>
                  ) : (
                    <Button size="lg" className="w-full mb-4" disabled>
                      {isPast ? 'Session Ended' : isFull ? 'Fully Booked' : 'Registration Closed'}
                    </Button>
                  )}

                  {/* Add to Calendar */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Add to Calendar:</p>
                    <div className="flex gap-2">
                      <a
                        href={calendarLinks.google}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          Google
                        </Button>
                      </a>
                      <a
                        href={calendarLinks.outlook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          Outlook
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* Share */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <Button variant="ghost" size="sm" className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share This Session
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Related Course Card */}
              {schedule.course && (
                <Card hover>
                  <Link href={`/courses/${schedule.course.slug || schedule.course.id}`}>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500 mb-2">Related Course</p>
                      <div className="flex items-center gap-4">
                        {schedule.course.thumbnailUrl ? (
                          <Image
                            src={schedule.course.thumbnailUrl}
                            alt={schedule.course.name}
                            width={64}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-gray-100 rounded-lg" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-primary-600">
                            {schedule.course.name}
                          </h4>
                          <span className="text-sm text-primary-600">View Course →</span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
