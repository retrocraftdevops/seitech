import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedOdooClient } from '@/lib/api/odoo-client';
import type { ApiResponse, ScheduleListItem, ScheduleListResponse, MeetingType, ScheduleState } from '@/types';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const ScheduleFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  courseId: z.coerce.number().int().positive().optional(),
  instructorId: z.coerce.number().int().positive().optional(),
  meetingType: z.enum(['zoom', 'teams', 'meet', 'jitsi', 'custom', 'in_person']).optional(),
  startDate: z.string().optional(), // ISO date
  endDate: z.string().optional(),
  state: z.enum(['draft', 'scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  search: z.string().optional(),
  upcoming: z.coerce.boolean().default(true), // Only show upcoming by default
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const filters = ScheduleFiltersSchema.parse(params);

    const odoo = await getAuthenticatedOdooClient();

    // Build domain (Odoo filter)
    const domain: [string, string, any][] = [];

    // By default, only show scheduled sessions
    if (filters.state) {
      domain.push(['state', '=', filters.state]);
    } else if (filters.upcoming) {
      domain.push(['state', '=', 'scheduled']);
    }

    // Only show future sessions by default
    if (filters.upcoming) {
      // Format datetime for Odoo (YYYY-MM-DD HH:MM:SS, no timezone)
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      domain.push(['start_datetime', '>', now]);
    }

    if (filters.courseId) {
      domain.push(['channel_id', '=', filters.courseId]);
    }

    if (filters.instructorId) {
      domain.push(['instructor_id', '=', filters.instructorId]);
    }

    if (filters.meetingType) {
      domain.push(['meeting_type', '=', filters.meetingType]);
    }

    if (filters.startDate) {
      domain.push(['start_datetime', '>=', filters.startDate]);
    }

    if (filters.endDate) {
      domain.push(['start_datetime', '<=', filters.endDate]);
    }

    if (filters.search) {
      domain.push(['name', 'ilike', filters.search]);
    }

    // Get total count
    const total = await odoo.searchCount('seitech.schedule', domain);

    // Calculate pagination
    const offset = (filters.page - 1) * filters.limit;
    const totalPages = Math.ceil(total / filters.limit);

    // Fetch schedules
    const fields = [
      'id',
      'name',
      'channel_id',
      'instructor_id',
      'start_datetime',
      'end_datetime',
      'duration',
      'timezone',
      'meeting_type',
      'meeting_url',
      'location',
      'description',
      'max_attendees',
      'attendee_count',
      'registration_required',
      'registration_deadline',
      'state',
      'has_recording',
      'recording_url',
    ];

    const odooRecords = await odoo.searchRead<any>(
      'seitech.schedule',
      domain,
      fields,
      {
        offset,
        limit: filters.limit,
        order: 'start_datetime asc',
      }
    );

    // Collect instructor IDs to fetch images
    const instructorIds = [...new Set(odooRecords.map((r: any) => r.instructor_id?.[0]).filter(Boolean))];

    // Fetch instructor images
    let instructorImages: Record<number, string> = {};
    if (instructorIds.length > 0) {
      const instructors = await odoo.read<any>('seitech.instructor', instructorIds, ['id', 'image']);
      instructorImages = Object.fromEntries(
        instructors.map((i: any) => [i.id, i.image ? `data:image/png;base64,${i.image}` : ''])
      );
    }

    // Collect course IDs to fetch slugs
    const courseIds = [...new Set(odooRecords.map((r: any) => r.channel_id?.[0]).filter(Boolean))];

    // Fetch course data (generate slugs from names since website_slug doesn't exist)
    let courseSlugs: Record<number, string> = {};
    if (courseIds.length > 0) {
      const courses = await odoo.read<any>('slide.channel', courseIds, ['id', 'name']);
      courseSlugs = Object.fromEntries(
        courses.map((c: any) => [
          c.id, 
          c.name ? c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : ''
        ])
      );
    }

    // Transform Odoo records to ScheduleListItem objects
    const schedules: ScheduleListItem[] = odooRecords.map((record: any) => {
      const maxAttendees = record.max_attendees || 0;
      const attendeeCount = record.attendee_count || 0;
      const availableSpots = maxAttendees === 0 ? -1 : Math.max(0, maxAttendees - attendeeCount);

      return {
        id: record.id,
        name: record.name,
        courseId: record.channel_id?.[0] || 0,
        courseName: record.channel_id?.[1] || '',
        courseSlug: courseSlugs[record.channel_id?.[0]] || undefined,
        instructorId: record.instructor_id?.[0] || 0,
        instructorName: record.instructor_id?.[1] || '',
        instructorImageUrl: instructorImages[record.instructor_id?.[0]] || undefined,
        startDatetime: record.start_datetime,
        endDatetime: record.end_datetime,
        duration: record.duration || 0,
        meetingType: record.meeting_type as MeetingType,
        location: record.location || undefined,
        maxAttendees,
        attendeeCount,
        availableSpots,
        registrationRequired: record.registration_required || false,
        registrationDeadline: record.registration_deadline || undefined,
        state: record.state as ScheduleState,
      };
    });

    const response: ApiResponse<ScheduleListResponse> = {
      success: true,
      data: {
        schedules,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching schedules:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid query parameters',
          data: null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch schedules',
        data: null,
      },
      { status: 500 }
    );
  }
}
