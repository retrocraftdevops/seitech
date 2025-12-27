import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Role permissions mapping (must match login route)
const ROLE_PERMISSIONS: Record<string, string[]> = {
  student: [],
  student_admin: ['users.view', 'enrollments.view'],
  instructor: [
    'courses.view', 'courses.create', 'courses.edit',
    'enrollments.view', 'certificates.view', 'analytics.view',
  ],
  manager: [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'instructors.view', 'instructors.create', 'instructors.edit', 'instructors.delete',
    'courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'courses.publish',
    'enrollments.view', 'enrollments.create', 'enrollments.edit', 'enrollments.delete',
    'certificates.view', 'certificates.issue',
    'analytics.view',
  ],
  admin: [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'instructors.view', 'instructors.create', 'instructors.edit', 'instructors.delete',
    'courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'courses.publish',
    'enrollments.view', 'enrollments.create', 'enrollments.edit', 'enrollments.delete',
    'certificates.view', 'certificates.issue', 'certificates.revoke',
    'analytics.view', 'settings.view', 'settings.edit',
  ],
};

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userInfoCookie = cookieStore.get('user_info');
    const sessionToken = cookieStore.get('session_token');

    if (!sessionToken || !userInfoCookie) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated',
          data: null,
        },
        { status: 401 }
      );
    }

    // Parse user info from cookie
    const user = JSON.parse(userInfoCookie.value);

    // Ensure role and permissions are present (backwards compatibility)
    const role = user.role || 'student';
    const normalizedUser = {
      ...user,
      role,
      permissions: user.permissions || ROLE_PERMISSIONS[role] || [],
    };

    return NextResponse.json({
      success: true,
      data: normalizedUser,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user',
        data: null,
      },
      { status: 500 }
    );
  }
}
