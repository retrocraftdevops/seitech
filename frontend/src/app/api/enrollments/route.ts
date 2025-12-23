import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getOdooClient } from '@/lib/api/odoo-client';
import type { ApiResponse, Enrollment } from '@/types';
// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


const EnrollmentCreateSchema = z.object({
  courseId: z.number().int().positive(),
  userId: z.number().int().positive().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const odoo = getOdooClient();

    // Get current user session
    const session = await odoo.getSession();

    if (!session || !session.uid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Please log in.',
          data: null,
        },
        { status: 401 }
      );
    }

    // Fetch user's enrollments
    const domain: [string, string, any][] = [['partner_id', '=', session.partnerId]];

    const enrollmentRecords = await odoo.searchRead<any>(
      'slide.channel.partner',
      domain,
      [
        'id',
        'channel_id',
        'partner_id',
        'completion',
        'create_date',
        'expiration_date',
        'completed_date',
        'last_access_date',
        'total_time',
        'certificate_id',
      ],
      { order: 'create_date desc' }
    );

    // Fetch course details for each enrollment
    const courseIds = enrollmentRecords.map((e: any) => e.channel_id?.[0]).filter(Boolean);
    const courses = courseIds.length > 0
      ? await odoo.read<any>(
          'slide.channel',
          courseIds,
          ['id', 'name', 'website_slug', 'image_512']
        )
      : [];

    const courseMap = new Map(courses.map((c: any) => [c.id, c]));

    const enrollments: Enrollment[] = enrollmentRecords.map((record: any) => {
      const course = courseMap.get(record.channel_id?.[0]);

      // Determine state based on completion and dates
      let state: Enrollment['state'] = 'active';
      if (record.completed_date) {
        state = 'completed';
      } else if (record.expiration_date && new Date(record.expiration_date) < new Date()) {
        state = 'expired';
      } else if (!record.last_access_date) {
        state = 'pending';
      }

      return {
        id: record.id,
        courseId: record.channel_id?.[0] || 0,
        courseName: course?.name || record.channel_id?.[1] || '',
        courseSlug: course?.website_slug || '',
        courseImage: course?.image_512 ? `data:image/png;base64,${course.image_512}` : '',
        userId: session.uid,
        state,
        progress: record.completion || 0,
        enrollmentDate: record.create_date,
        expirationDate: record.expiration_date || undefined,
        completionDate: record.completed_date || undefined,
        lastAccessDate: record.last_access_date || undefined,
        totalTimeSpent: record.total_time || 0,
        certificateId: record.certificate_id?.[0] || undefined,
        certificateUrl: record.certificate_id?.[0]
          ? `/api/certificates/${record.certificate_id[0]}`
          : undefined,
      };
    });

    const response: ApiResponse<Enrollment[]> = {
      success: true,
      data: enrollments,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching enrollments:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch enrollments',
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const data = EnrollmentCreateSchema.parse(body);

    const odoo = getOdooClient();

    // Get current user session
    const session = await odoo.getSession();

    if (!session || !session.uid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Please log in.',
          data: null,
        },
        { status: 401 }
      );
    }

    const userId = data.userId || session.uid;
    const partnerId = session.partnerId;

    // Check if enrollment already exists
    const existingEnrollments = await odoo.searchRead<any>(
      'slide.channel.partner',
      [
        ['channel_id', '=', data.courseId],
        ['partner_id', '=', partnerId],
      ],
      ['id']
    );

    if (existingEnrollments.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'You are already enrolled in this course',
          data: null,
        },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollmentId = await odoo.create('slide.channel.partner', {
      channel_id: data.courseId,
      partner_id: partnerId,
    });

    // Fetch the created enrollment
    const enrollmentRecords = await odoo.read<any>(
      'slide.channel.partner',
      [enrollmentId],
      [
        'id',
        'channel_id',
        'partner_id',
        'completion',
        'create_date',
        'expiration_date',
        'completed_date',
        'last_access_date',
        'total_time',
        'certificate_id',
      ]
    );

    if (enrollmentRecords.length === 0) {
      throw new Error('Failed to create enrollment');
    }

    const record = enrollmentRecords[0];

    // Fetch course details
    const courseRecords = await odoo.read<any>(
      'slide.channel',
      [record.channel_id[0]],
      ['id', 'name', 'website_slug', 'image_512']
    );

    const course = courseRecords[0];

    const enrollment: Enrollment = {
      id: record.id,
      courseId: record.channel_id[0],
      courseName: course.name,
      courseSlug: course.website_slug,
      courseImage: course.image_512 ? `data:image/png;base64,${course.image_512}` : '',
      userId,
      state: 'pending',
      progress: 0,
      enrollmentDate: record.create_date,
      expirationDate: record.expiration_date || undefined,
      completionDate: undefined,
      lastAccessDate: undefined,
      totalTimeSpent: 0,
      certificateId: undefined,
      certificateUrl: undefined,
    };

    const response: ApiResponse<Enrollment> = {
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating enrollment:', error);

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

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create enrollment',
        data: null,
      },
      { status: 500 }
    );
  }
}
