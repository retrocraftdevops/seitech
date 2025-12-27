import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const userInfo = cookieStore.get('user_info')?.value;

    if (!sessionToken || !userInfo) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userInfo);
    // Check role permissions - only admin and manager can view analytics
    if (!['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo
    if (odooUrl) {
      const response = await fetch(`${odooUrl}/api/admin/analytics/overview`, {
        headers: { 'Cookie': `session_id=${sessionToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Demo mode fallback with mock data
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalStudents: 1247,
          totalCourses: 45,
          totalInstructors: 23,
          activeEnrollments: 892,
          totalRevenue: 124500,
          certificatesIssued: 634
        },
        recentActivity: [
          { id: 1, type: 'enrollment', user: 'John Doe', course: 'Python Basics', timestamp: new Date().toISOString() },
          { id: 2, type: 'certificate', user: 'Jane Smith', course: 'Web Development', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { id: 3, type: 'course_created', instructor: 'Dr. Mike Johnson', course: 'Advanced AI', timestamp: new Date(Date.now() - 7200000).toISOString() }
        ],
        monthlyStats: [
          { month: 'Jan', enrollments: 45, revenue: 8500, certificates: 32 },
          { month: 'Feb', enrollments: 52, revenue: 9800, certificates: 38 },
          { month: 'Mar', enrollments: 61, revenue: 11200, certificates: 45 },
          { month: 'Apr', enrollments: 58, revenue: 10500, certificates: 41 },
          { month: 'May', enrollments: 67, revenue: 12300, certificates: 48 },
          { month: 'Jun', enrollments: 74, revenue: 13600, certificates: 55 }
        ],
        topCourses: [
          { id: 1, title: 'Python for Data Science', enrollments: 234, revenue: 23400, rating: 4.8 },
          { id: 2, title: 'Web Development Bootcamp', enrollments: 189, revenue: 18900, rating: 4.7 },
          { id: 3, title: 'Machine Learning A-Z', enrollments: 156, revenue: 15600, rating: 4.9 },
          { id: 4, title: 'React & Next.js Masterclass', enrollments: 143, revenue: 14300, rating: 4.6 },
          { id: 5, title: 'Cloud Computing Fundamentals', enrollments: 127, revenue: 12700, rating: 4.5 }
        ],
        topInstructors: [
          { id: 1, name: 'Dr. Sarah Williams', courses: 8, students: 456, rating: 4.9 },
          { id: 2, name: 'Prof. Michael Chen', courses: 6, students: 389, rating: 4.8 },
          { id: 3, name: 'Dr. Emily Rodriguez', courses: 5, students: 312, rating: 4.7 },
          { id: 4, name: 'James Anderson', courses: 7, students: 298, rating: 4.6 },
          { id: 5, name: 'Lisa Thompson', courses: 4, students: 267, rating: 4.8 }
        ]
      }
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
