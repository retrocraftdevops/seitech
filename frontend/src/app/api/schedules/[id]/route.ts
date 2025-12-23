import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedOdooClient } from '@/lib/api/odoo-client';
import type { ApiResponse, Schedule, MeetingType, ScheduleState } from '@/types';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const ScheduleIdSchema = z.coerce.number().int().positive();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate schedule ID
    const scheduleId = ScheduleIdSchema.parse(params.id);

    const odoo = await getAuthenticatedOdooClient();

    // Fetch schedule details
    const fields = [
      'id',
      'name',
      'channel_id',
      'slide_id',
      'instructor_id',
      'start_datetime',
      'end_datetime',
      'duration',
      'timezone',
      'meeting_type',
      'meeting_url',
      'meeting_id',
      'meeting_password',
      'location',
      'description',
      'max_attendees',
      'attendee_count',
      'registration_required',
      'registration_deadline',
      'state',
      'has_recording',
      'recording_url',
      'create_date',
      'write_date',
    ];

    const scheduleRecords = await odoo.read<any>('seitech.schedule', [scheduleId], fields);

    if (!scheduleRecords || scheduleRecords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Schedule not found',
          data: null,
        },
        { status: 404 }
      );
    }

    const record = scheduleRecords[0];

    // Fetch instructor details
    let instructor = {
      id: 0,
      name: '',
      title: undefined as string | undefined,
      shortBio: undefined as string | undefined,
      imageUrl: undefined as string | undefined,
    };

    if (record.instructor_id && record.instructor_id[0]) {
      const instructorRecords = await odoo.read<any>(
        'seitech.instructor',
        [record.instructor_id[0]],
        ['id', 'name', 'title', 'short_bio', 'image']
      );

      if (instructorRecords.length > 0) {
        const inst = instructorRecords[0];
        instructor = {
          id: inst.id,
          name: inst.name,
          title: inst.title || undefined,
          shortBio: inst.short_bio || undefined,
          imageUrl: inst.image ? `data:image/png;base64,${inst.image}` : undefined,
        };
      }
    }

    // Fetch course details
    let course = {
      id: 0,
      name: '',
      slug: undefined as string | undefined,
      thumbnailUrl: undefined as string | undefined,
    };

    if (record.channel_id && record.channel_id[0]) {
      const courseRecords = await odoo.read<any>(
        'slide.channel',
        [record.channel_id[0]],
        ['id', 'name', 'website_slug', 'image_512']
      );

      if (courseRecords.length > 0) {
        const c = courseRecords[0];
        course = {
          id: c.id,
          name: c.name,
          slug: c.website_slug || undefined,
          thumbnailUrl: c.image_512 ? `data:image/png;base64,${c.image_512}` : undefined,
        };
      }
    }

    // Calculate available spots
    const maxAttendees = record.max_attendees || 0;
    const attendeeCount = record.attendee_count || 0;
    const availableSpots = maxAttendees === 0 ? -1 : Math.max(0, maxAttendees - attendeeCount);

    const schedule: Schedule = {
      id: record.id,
      name: record.name,
      course,
      instructor,
      startDatetime: record.start_datetime,
      endDatetime: record.end_datetime,
      duration: record.duration || 0,
      timezone: record.timezone || 'UTC',
      meetingType: record.meeting_type as MeetingType,
      meetingUrl: record.meeting_url || undefined,
      meetingId: record.meeting_id || undefined,
      meetingPassword: record.meeting_password || undefined,
      location: record.location || undefined,
      description: record.description || undefined,
      maxAttendees,
      attendeeCount,
      availableSpots,
      registrationRequired: record.registration_required || false,
      registrationDeadline: record.registration_deadline || undefined,
      state: record.state as ScheduleState,
      hasRecording: record.has_recording || false,
      recordingUrl: record.recording_url || undefined,
      createdAt: record.create_date,
      updatedAt: record.write_date,
    };

    const response: ApiResponse<Schedule> = {
      success: true,
      data: schedule,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching schedule:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid schedule ID',
          data: null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch schedule',
        data: null,
      },
      { status: 500 }
    );
  }
}
