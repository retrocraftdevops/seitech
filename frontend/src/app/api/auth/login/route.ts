import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Role permissions mapping
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    // Authenticate with Odoo
    if (odooUrl) {
      try {
        const odooResponse = await fetch(`${odooUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include',
        });

        if (odooResponse.ok) {
          const data = await odooResponse.json();

          if (data.success && data.data?.sessionToken) {
            // Add role and permissions if not present from Odoo
            const userData = {
              ...data.data.user,
              role: data.data.user.role || 'student',
              permissions: data.data.user.permissions || ROLE_PERMISSIONS[data.data.user.role || 'student'],
            };

            cookieStore.set('session_token', data.data.sessionToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7,
              path: '/',
            });

            cookieStore.set('user_info', JSON.stringify(userData), {
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7,
              path: '/',
            });

            return NextResponse.json({
              ...data,
              data: {
                ...data.data,
                user: userData,
              },
            });
          }
        }
      } catch {
        // Fall through to demo mode
      }
    }

    // Demo mode - check against stored demo users
    const demoUsersStr = cookieStore.get('demo_users')?.value;
    const demoUsers = demoUsersStr ? JSON.parse(demoUsersStr) : {};

    const user = demoUsers[body.email];

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.password !== body.password) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create demo session
    const sessionToken = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const role = user.role || 'student';

    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' '),
      role,
      permissions: ROLE_PERMISSIONS[role] || [],
    };

    cookieStore.set('user_info', JSON.stringify(userInfo), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userInfo,
        sessionToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
        data: null,
      },
      { status: 500 }
    );
  }
}
