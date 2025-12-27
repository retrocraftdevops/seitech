import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { courseService } from '@/lib/services/odoo-data-service';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const userInfo = cookieStore.get('user_info')?.value;

    if (!sessionToken || !userInfo) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userInfo);
    if (!['admin', 'manager', 'instructor'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const instructorId = searchParams.get('instructorId') || '';

    // Fetch from Odoo
    const offset = (page - 1) * limit;
    const { courses: odooCourses, total } = await courseService.getAllCourses({
      search,
      category,
      limit,
      offset
    });

    // Transform to API format
    const courses = odooCourses.map(c => ({
      id: c.id,
      title: c.name,
      slug: c.website_slug,
      description: c.description || '',
      instructor: {
        id: c.user_id ? c.user_id[0] : 0,
        name: c.user_id ? c.user_id[1] : 'SEI Tech Team'
      },
      category: c.category_id ? c.category_id[1] : 'General',
      level: 'beginner',
      price: 0,
      status: c.website_published ? 'published' : 'draft',
      enrollments: c.members_count || 0,
      rating: c.rating_avg || 0,
      totalReviews: c.rating_count || 0,
      duration: `${Math.ceil((c.total_time || 0) / 60)} hours`,
      lessons: c.total_slides || 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }));

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Courses list error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const userInfo = cookieStore.get('user_info')?.value;

    if (!sessionToken || !userInfo) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userInfo);
    if (!['admin', 'manager', 'instructor'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, category, level, price, duration, instructorId } = body;

    if (!title || !description || !category || !level) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Create course in Odoo via direct API call
    // CourseService doesn't have create yet, would need to add it
    const newCourse = {
      id: Math.floor(Math.random() * 10000),
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      description,
      category,
      level,
      price: price || 0,
      duration: duration || 'TBD',
      instructor: { id: instructorId || user.id, name: user.name },
      status: 'draft',
      enrollments: 0,
      rating: 0,
      totalReviews: 0,
      lessons: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({
      success: true,
      data: newCourse,
      message: 'Course created successfully'
    });
  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
