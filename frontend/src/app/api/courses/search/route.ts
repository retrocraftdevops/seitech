import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { odooClient } from '@/lib/odoo';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    // Build search domain
    const domain: any[] = [
      ['website_published', '=', true],
      ['is_published', '=', true],
    ];

    if (query) {
      domain.push('|', ['name', 'ilike', query], ['description', 'ilike', query]);
    }

    if (category) {
      domain.push(['category_id', '=', parseInt(category)]);
    }

    // Search courses from Odoo
    const result = await odooClient.search(
      'slide.channel',
      domain,
      {
        fields: [
          'id',
          'name',
          'description',
          'website_id',
          'slide_ids',
          'total_slides',
          'total_time',
          'rating',
          'enroll_count',
          'image_1920',
          'category_id',
        ],
        limit,
        order: 'enroll_count desc, name asc',
      }
    );

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to search courses');
    }

    const courses = result.data;

    // Transform courses
    const transformedCourses = courses.map((course: any) => ({
      id: course.id,
      name: course.name,
      description: course.description || null,
      slug: course.website_id?.[1]?.toLowerCase().replace(/\s+/g, '-') || null,
      total_slides: course.total_slides || 0,
      total_time: course.total_time || '0h',
      rating: course.rating || 0,
      enroll_count: course.enroll_count || 0,
      image_url: course.image_1920
        ? `data:image/png;base64,${course.image_1920}`
        : null,
      category: course.category_id?.[1] || null,
    }));

    return NextResponse.json({
      courses: transformedCourses,
      total: transformedCourses.length,
    });
  } catch (error) {
    console.error('Course search error:', error);
    return NextResponse.json(
      { error: 'Failed to search courses' },
      { status: 500 }
    );
  }
}
