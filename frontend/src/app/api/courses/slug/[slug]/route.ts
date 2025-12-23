import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:8069';

    // Check if slug is numeric (course ID) or a text slug
    const isNumeric = /^\d+$/.test(slug);

    let response;
    let data;

    if (isNumeric) {
      // Use the existing course by ID endpoint
      response = await fetch(`${odooUrl}/api/courses/${slug}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      data = await response.json();
    } else {
      // Try slug endpoint first, fallback to searching all courses
      response = await fetch(`${odooUrl}/api/courses/slug/${slug}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      // Check if response is JSON (API) or HTML (404 page)
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Slug endpoint not available, search for course by seo_name
        const searchResponse = await fetch(`${odooUrl}/api/courses?search=${encodeURIComponent(slug)}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });
        const searchData = await searchResponse.json();

        // Find course with matching slug
        if (searchData.success && searchData.data?.courses) {
          const course = searchData.data.courses.find(
            (c: { slug?: string; id: number }) => c.slug === slug || c.slug === slug.replace(/-/g, ' ')
          );
          if (course) {
            // Fetch full course details by ID
            const detailResponse = await fetch(`${odooUrl}/api/courses/${course.id}`, {
              headers: {
                'Content-Type': 'application/json',
              },
              cache: 'no-store',
            });
            data = await detailResponse.json();
          } else {
            data = { success: false, message: 'Course not found', data: null };
          }
        } else {
          data = { success: false, message: 'Course not found', data: null };
        }
      }
    }

    return NextResponse.json(data, { status: data.success ? 200 : 404 });
  } catch (error) {
    console.error('Error fetching course by slug:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch course',
        data: null,
      },
      { status: 500 }
    );
  }
}
