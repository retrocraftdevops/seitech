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
      const response = await fetch(`${odooUrl}/api/admin/instructors/${id}`, {
        headers: { 'Cookie': `session_id=${sessionToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Demo mode fallback
    const mockInstructor = {
      id: parseInt(id),
      name: 'Dr. Sarah Williams',
      email: 'sarah.williams@seitech.com',
      phone: '+1 555 123 4567',
      status: 'active',
      expertise: ['Data Science', 'Machine Learning', 'Python', 'Statistics'],
      bio: 'PhD in Computer Science with 15 years of industry experience in data science and machine learning. Published author and conference speaker.',
      education: [
        { degree: 'PhD in Computer Science', institution: 'MIT', year: 2010 },
        { degree: 'MSc in Data Science', institution: 'Stanford University', year: 2006 },
        { degree: 'BSc in Mathematics', institution: 'UC Berkeley', year: 2004 }
      ],
      courses: [
        { id: 101, title: 'Python for Data Science', students: 234, rating: 4.9, status: 'published' },
        { id: 102, title: 'Machine Learning A-Z', students: 156, rating: 4.8, status: 'published' },
        { id: 103, title: 'Advanced Statistics', students: 89, rating: 4.7, status: 'published' },
        { id: 104, title: 'Deep Learning Specialization', students: 67, rating: 4.9, status: 'draft' }
      ],
      stats: {
        totalStudents: 456,
        totalCourses: 8,
        averageRating: 4.9,
        totalReviews: 234,
        totalRevenue: 45600,
        completionRate: 87
      },
      joinDate: '2024-01-10',
      lastActive: '2025-12-23T16:45:00Z',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahwilliams',
        twitter: 'https://twitter.com/drsarahw',
        website: 'https://sarahwilliams.com'
      }
    };

    return NextResponse.json({
      success: true,
      data: mockInstructor
    });
  } catch (error) {
    console.error('Instructor detail error:', error);
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
      const response = await fetch(`${odooUrl}/api/admin/instructors/${id}`, {
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
      message: 'Instructor updated successfully'
    });
  } catch (error) {
    console.error('Instructor update error:', error);
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
    // Only admin can delete instructors
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo
    if (odooUrl) {
      const response = await fetch(`${odooUrl}/api/admin/instructors/${id}`, {
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
      message: 'Instructor deleted successfully'
    });
  } catch (error) {
    console.error('Instructor deletion error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
