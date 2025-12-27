import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import type { ApiResponse, Enrollment } from '@/types';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const EnrollmentCreateSchema = z.object({
  courseId: z.number().int().positive(),
  userId: z.number().int().positive().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const userInfo = cookieStore.get('user_info')?.value;

    // Check if user is authenticated
    if (!sessionToken || !userInfo) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Please log in.',
          data: null,
        },
        { status: 401 }
      );
    }

    const user = JSON.parse(userInfo);
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo first if configured
    if (odooUrl) {
      try {
        const response = await fetch(`${odooUrl}/api/enrollments`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `session_id=${sessionToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return NextResponse.json(data);
          }
        }
      } catch {
        // Fall through to demo mode
      }
    }

    // Demo mode - return enrollments from local storage (cookie-based)
    const demoEnrollmentsStr = cookieStore.get('demo_enrollments')?.value;
    const demoEnrollments = demoEnrollmentsStr ? JSON.parse(demoEnrollmentsStr) : {};
    const userEnrollments = demoEnrollments[user.email] || [];

    const enrollments: Enrollment[] = userEnrollments.map((e: any) => ({
      id: e.id,
      courseId: e.courseId,
      courseName: e.courseName,
      courseSlug: e.courseSlug,
      courseImage: e.courseImage || '',
      userId: user.id,
      state: e.state || 'active',
      progress: e.progress || 0,
      enrollmentDate: e.enrollmentDate,
      expirationDate: e.expirationDate,
      completionDate: e.completionDate,
      lastAccessDate: e.lastAccessDate,
      totalTimeSpent: e.totalTimeSpent || 0,
      certificateId: e.certificateId,
      certificateUrl: e.certificateUrl,
    }));

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

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const userInfo = cookieStore.get('user_info')?.value;

    // Check if user is authenticated
    if (!sessionToken || !userInfo) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Please log in.',
          data: null,
        },
        { status: 401 }
      );
    }

    const user = JSON.parse(userInfo);
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo first if configured
    if (odooUrl) {
      try {
        const response = await fetch(`${odooUrl}/api/enrollments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `session_id=${sessionToken}`,
          },
          body: JSON.stringify({ courseId: data.courseId }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            return NextResponse.json(result, { status: 201 });
          }
        }
      } catch {
        // Fall through to demo mode
      }
    }

    // Demo mode - store enrollment in cookies
    const demoEnrollmentsStr = cookieStore.get('demo_enrollments')?.value;
    const demoEnrollments = demoEnrollmentsStr ? JSON.parse(demoEnrollmentsStr) : {};
    const userEnrollments = demoEnrollments[user.email] || [];

    // Check if already enrolled
    if (userEnrollments.some((e: any) => e.courseId === data.courseId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'You are already enrolled in this course',
          data: null,
        },
        { status: 400 }
      );
    }

    // Get course info from body if provided
    const courseName = body.courseName || `Course ${data.courseId}`;
    const courseSlug = body.courseSlug || `course-${data.courseId}`;
    const courseImage = body.courseImage || '';

    const enrollment: Enrollment = {
      id: Date.now(),
      courseId: data.courseId,
      courseName,
      courseSlug,
      courseImage,
      userId: user.id,
      state: 'active',
      progress: 0,
      enrollmentDate: new Date().toISOString(),
      expirationDate: undefined,
      completionDate: undefined,
      lastAccessDate: undefined,
      totalTimeSpent: 0,
      certificateId: undefined,
      certificateUrl: undefined,
    };

    // Save to cookie storage
    userEnrollments.push(enrollment);
    demoEnrollments[user.email] = userEnrollments;

    cookieStore.set('demo_enrollments', JSON.stringify(demoEnrollments), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

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
