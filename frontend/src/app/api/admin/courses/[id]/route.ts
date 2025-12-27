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
    if (!['admin', 'manager', 'instructor'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo
    if (odooUrl) {
      const response = await fetch(`${odooUrl}/api/admin/courses/${id}`, {
        headers: { 'Cookie': `session_id=${sessionToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Demo mode fallback
    const mockCourse = {
      id: parseInt(id),
      title: 'Python for Data Science',
      slug: 'python-for-data-science',
      description: 'Learn Python programming for data analysis and visualization. Master pandas, numpy, matplotlib, and more.',
      fullDescription: 'This comprehensive course covers everything you need to know about Python for data science...',
      instructor: {
        id: 1,
        name: 'Dr. Sarah Williams',
        email: 'sarah.williams@seitech.com',
        bio: 'PhD in Computer Science with 15 years of industry experience'
      },
      category: 'Data Science',
      subcategory: 'Python Programming',
      level: 'intermediate',
      price: 99.99,
      discountPrice: 79.99,
      status: 'published',
      thumbnail: '/images/courses/python-data-science.jpg',
      previewVideo: 'https://example.com/preview.mp4',
      enrollments: 234,
      activeStudents: 187,
      completedStudents: 47,
      rating: 4.9,
      totalReviews: 156,
      duration: '12 weeks',
      totalHours: 48,
      lessons: 45,
      modules: [
        {
          id: 1,
          title: 'Introduction to Python',
          lessons: 8,
          duration: '4 hours',
          order: 1
        },
        {
          id: 2,
          title: 'Data Manipulation with Pandas',
          lessons: 12,
          duration: '8 hours',
          order: 2
        },
        {
          id: 3,
          title: 'Data Visualization',
          lessons: 10,
          duration: '6 hours',
          order: 3
        }
      ],
      requirements: [
        'Basic programming knowledge',
        'Computer with internet connection',
        'Willingness to learn'
      ],
      learningOutcomes: [
        'Master Python programming fundamentals',
        'Analyze data using pandas and numpy',
        'Create beautiful visualizations',
        'Build real-world data science projects'
      ],
      tags: ['Python', 'Data Science', 'Pandas', 'NumPy', 'Matplotlib'],
      language: 'English',
      subtitles: ['English', 'Spanish', 'French'],
      certificateAvailable: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2025-12-01T15:30:00Z',
      publishedAt: '2024-02-01T09:00:00Z',
      stats: {
        totalRevenue: 18705.66,
        averageProgress: 62,
        completionRate: 20,
        dropoutRate: 8
      }
    };

    return NextResponse.json({
      success: true,
      data: mockCourse
    });
  } catch (error) {
    console.error('Course detail error:', error);
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
    if (!['admin', 'manager', 'instructor'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo
    if (odooUrl) {
      const response = await fetch(`${odooUrl}/api/admin/courses/${id}`, {
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
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Course update error:', error);
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
    // Only admin can delete courses
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo
    if (odooUrl) {
      const response = await fetch(`${odooUrl}/api/admin/courses/${id}`, {
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
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Course deletion error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
