/**
 * Schedule Types
 * Types for training schedule/live class sessions
 */

// Meeting platform types
export type MeetingType =
  | 'zoom'
  | 'teams'
  | 'meet'
  | 'jitsi'
  | 'custom'
  | 'in_person';

// Schedule status
export type ScheduleState =
  | 'draft'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// Attendee status
export type AttendeeState =
  | 'registered'
  | 'attended'
  | 'absent'
  | 'cancelled';

// Schedule instructor (simplified from full instructor)
export interface ScheduleInstructor {
  id: number;
  name: string;
  title?: string;
  shortBio?: string;
  imageUrl?: string;
}

// Course reference for schedule
export interface ScheduleCourse {
  id: number;
  name: string;
  slug?: string;
  thumbnailUrl?: string;
}

// Main schedule interface
export interface Schedule {
  id: number;
  name: string;
  course: ScheduleCourse;
  instructor: ScheduleInstructor;

  // Timing
  startDatetime: string; // ISO datetime string
  endDatetime: string;
  duration: number; // hours
  timezone: string;

  // Meeting details
  meetingType: MeetingType;
  meetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
  location?: string;
  description?: string;

  // Capacity
  maxAttendees: number; // 0 = unlimited
  attendeeCount: number;
  availableSpots: number; // computed: maxAttendees - attendeeCount (or -1 if unlimited)
  registrationRequired: boolean;
  registrationDeadline?: string;

  // Status
  state: ScheduleState;

  // Recording (for completed sessions)
  hasRecording: boolean;
  recordingUrl?: string;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

// Schedule list item (lighter version for lists)
export interface ScheduleListItem {
  id: number;
  name: string;
  courseName: string;
  courseId: number;
  courseSlug?: string;
  instructorName: string;
  instructorId: number;
  instructorImageUrl?: string;
  startDatetime: string;
  endDatetime: string;
  duration: number;
  meetingType: MeetingType;
  location?: string;
  maxAttendees: number;
  attendeeCount: number;
  availableSpots: number;
  registrationRequired: boolean;
  registrationDeadline?: string;
  state: ScheduleState;
}

// Schedule attendee
export interface ScheduleAttendee {
  id: number;
  scheduleId: number;
  userId: number;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  enrollmentId?: number;
  state: AttendeeState;
  registrationDate: string;
  attendanceTime?: string;
  notes?: string;
}

// Filter parameters for schedule listing
export interface ScheduleFilters {
  courseId?: number;
  instructorId?: number;
  meetingType?: MeetingType;
  startDate?: string; // ISO date
  endDate?: string;
  state?: ScheduleState;
  search?: string;
}

// Pagination for schedule list
export interface SchedulePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Schedule list response
export interface ScheduleListResponse {
  schedules: ScheduleListItem[];
  pagination: SchedulePagination;
}

// Registration request
export interface ScheduleRegistrationRequest {
  scheduleId: number;
  notes?: string;
}

// Registration response
export interface ScheduleRegistrationResponse {
  success: boolean;
  message: string;
  attendee?: ScheduleAttendee;
}

// Helper type for meeting type display
export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  zoom: 'Zoom',
  teams: 'Microsoft Teams',
  meet: 'Google Meet',
  jitsi: 'Jitsi',
  custom: 'Online',
  in_person: 'In Person',
};

// Meeting type icons (for use with lucide-react)
export const MEETING_TYPE_ICONS: Record<MeetingType, string> = {
  zoom: 'Video',
  teams: 'Video',
  meet: 'Video',
  jitsi: 'Video',
  custom: 'Globe',
  in_person: 'MapPin',
};
