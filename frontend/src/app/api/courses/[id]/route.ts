import { NextRequest, NextResponse } from 'next/server';
import coursesData from '@/data/courses.json';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Course = any;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const courseId = parseInt(id);

  try {
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo first if configured
    if (odooUrl) {
      try {
        const response = await fetch(`${odooUrl}/api/courses/${courseId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return NextResponse.json(data);
          }
        }
      } catch {
        // Fall through to local data
      }
    }

    // Use local JSON data - map to Course type format
    const rawCourse = (coursesData.courses as Course[]).find(c => c.id === courseId);

    if (rawCourse) {
      const course = {
        id: rawCourse.id,
        name: rawCourse.title,
        slug: rawCourse.slug,
        description: rawCourse.shortDescription,
        shortDescription: rawCourse.shortDescription,
        imageUrl: rawCourse.thumbnail,
        thumbnailUrl: rawCourse.thumbnail,
        listPrice: rawCourse.price,
        discountPrice: rawCourse.discountedPrice || null,
        currency: rawCourse.currency || 'GBP',
        categoryId: rawCourse.category?.id || null,
        categoryName: rawCourse.category?.name || 'Training',
        deliveryMethod: 'e-learning',
        difficultyLevel: rawCourse.level || 'beginner',
        accreditation: null,
        duration: 60,
        totalSlides: rawCourse.lessons || 12,
        totalQuizzes: 1,
        ratingAvg: rawCourse.rating || 4.8,
        ratingCount: rawCourse.reviewCount || 0,
        enrollmentCount: rawCourse.enrolledCount || 0,
        instructorName: 'SEI Tech Training Team',
        curriculum: [],
        outcomes: rawCourse.outcomes || [],
        requirements: ['No prior knowledge required'],
        faqs: [],
        metaTitle: rawCourse.title,
        metaDescription: rawCourse.shortDescription,
        keywords: [],
        isPublished: true,
        isFeatured: rawCourse.isFeatured || false,
      };

      return NextResponse.json({
        success: true,
        data: course,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Course not found',
        data: null,
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching course:', error);
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
