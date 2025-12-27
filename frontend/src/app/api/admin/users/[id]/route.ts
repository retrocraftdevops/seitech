import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const userInfo = cookieStore.get('user_info')?.value;

    if (!sessionToken || !userInfo) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userInfo);
    // Check role permissions
    if (!['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo
    if (odooUrl) {
      const response = await fetch(`${odooUrl}/api/admin/users/${id}`, {
        headers: { 'Cookie': `session_id=${sessionToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Demo mode fallback
    const mockUser = {
      id: parseInt(id),
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'student',
      status: 'active',
      phone: '+1 234 567 8900',
      address: '123 Main St, City, Country',
      bio: 'Passionate learner interested in technology and innovation.',
      enrollments: [
        { id: 1, courseId: 101, courseTitle: 'Python for Data Science', progress: 75, status: 'in_progress', enrolledDate: '2024-06-01' },
        { id: 2, courseId: 102, courseTitle: 'Web Development Bootcamp', progress: 100, status: 'completed', enrolledDate: '2024-03-15', completedDate: '2024-05-20' },
        { id: 3, courseId: 103, courseTitle: 'Machine Learning A-Z', progress: 45, status: 'in_progress', enrolledDate: '2024-07-10' }
      ],
      certificates: [
        { id: 1, courseId: 102, courseTitle: 'Web Development Bootcamp', issuedDate: '2024-05-22', certificateNumber: 'CERT-2024-001234' }
      ],
      joinDate: '2024-01-15',
      lastLogin: '2025-12-23T14:30:00Z',
      totalCoursesCompleted: 1,
      totalHoursLearned: 156
    };

    return NextResponse.json({
      success: true,
      data: mockUser
    });
  } catch (error) {
    console.error('User detail error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const userInfo = cookieStore.get('user_info')?.value;

    if (!sessionToken || !userInfo) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userInfo);
    // Check role permissions
    if (!['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo
    if (odooUrl) {
      const response = await fetch(`${odooUrl}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Cookie': `session_id=${sessionToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Demo mode fallback
    return NextResponse.json({
      success: true,
      data: {
        id: parseInt(id),
        ...body,
        updatedAt: new Date().toISOString()
      },
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const userInfo = cookieStore.get('user_info')?.value;

    if (!sessionToken || !userInfo) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userInfo);
    // Only admin can delete users
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo
    if (odooUrl) {
      const response = await fetch(`${odooUrl}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Cookie': `session_id=${sessionToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Demo mode fallback
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
