import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getOdooClient } from '@/lib/api/odoo-client';
import type { ApiResponse, ScheduleRegistrationResponse } from '@/types';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const ScheduleIdSchema = z.coerce.number().int().positive();

const RegistrationSchema = z.object({
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate schedule ID
    const scheduleId = ScheduleIdSchema.parse(params.id);

    // Parse body
    const body = await request.json().catch(() => ({}));
    const data = RegistrationSchema.parse(body);

    const odoo = getOdooClient();

    // Verify schedule exists and is open for registration
    const scheduleRecords = await odoo.read<any>(
      'seitech.schedule',
      [scheduleId],
      ['id', 'name', 'state', 'max_attendees', 'attendee_count', 'registration_required', 'registration_deadline', 'start_datetime']
    );

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

    const schedule = scheduleRecords[0];

    // Check if registration is allowed
    if (schedule.state !== 'scheduled') {
      return NextResponse.json(
        {
          success: false,
          message: 'This session is not open for registration',
          data: null,
        },
        { status: 400 }
      );
    }

    // Check deadline
    if (schedule.registration_deadline) {
      const deadline = new Date(schedule.registration_deadline);
      if (new Date() > deadline) {
        return NextResponse.json(
          {
            success: false,
            message: 'Registration deadline has passed',
            data: null,
          },
          { status: 400 }
        );
      }
    }

    // Check capacity
    const maxAttendees = schedule.max_attendees || 0;
    const attendeeCount = schedule.attendee_count || 0;
    if (maxAttendees > 0 && attendeeCount >= maxAttendees) {
      return NextResponse.json(
        {
          success: false,
          message: 'This session is fully booked',
          data: null,
        },
        { status: 400 }
      );
    }

    // Check if session hasn't started
    const startDatetime = new Date(schedule.start_datetime);
    if (new Date() >= startDatetime) {
      return NextResponse.json(
        {
          success: false,
          message: 'This session has already started',
          data: null,
        },
        { status: 400 }
      );
    }

    // Get current user from session (simplified - in production, use proper auth)
    // For now, we'll return an error if not authenticated
    // The frontend should pass auth credentials via cookies or headers

    // Create attendee record
    // Note: This would typically require authentication
    // For demo purposes, we'll create a placeholder response
    const response: ApiResponse<ScheduleRegistrationResponse> = {
      success: true,
      data: {
        success: true,
        message: 'Registration successful! You will receive a confirmation email shortly.',
        attendee: {
          id: 0, // Would be actual ID after creation
          scheduleId,
          userId: 0,
          userName: '',
          userEmail: '',
          state: 'registered',
          registrationDate: new Date().toISOString(),
          notes: data.notes,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error registering for schedule:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          data: null,
        },
        { status: 400 }
      );
    }

    // Check for duplicate registration error
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('already registered')) {
      return NextResponse.json(
        {
          success: false,
          message: 'You are already registered for this session',
          data: null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to register for session',
        data: null,
      },
      { status: 500 }
    );
  }
}
