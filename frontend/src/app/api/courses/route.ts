import { NextRequest, NextResponse } from 'next/server';
import coursesData from '@/data/courses.json';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Course = any;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get('category');
  const level = searchParams.get('level');
  const search = searchParams.get('search')?.toLowerCase();
  const featured = searchParams.get('featured');
  const popular = searchParams.get('popular');
  const limit = parseInt(searchParams.get('limit') || '0');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo first if configured
    if (odooUrl) {
      try {
        const queryString = searchParams.toString();
        const url = `${odooUrl}/api/courses${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          // Odoo returns { success: true, data: { courses, total, ... } }
          if (data.success && data.data) {
            return NextResponse.json({
              success: true,
              data: data.data,
            });
          }
        }
      } catch {
        // Fall through to local data
      }
    }

    // Use local JSON data - map to Course type format
    let courses = (coursesData.courses as Course[]).map(c => ({
      id: c.id,
      name: c.title,
      slug: c.slug,
      title: c.title,
      description: c.shortDescription,
      shortDescription: c.shortDescription,
      imageUrl: c.thumbnail,
      thumbnailUrl: c.thumbnail,
      listPrice: c.price,
      discountPrice: c.discountedPrice || null,
      currency: c.currency || 'GBP',
      categoryId: c.category?.id || null,
      categoryName: c.category?.name || 'Training',
      deliveryMethod: 'e-learning',
      difficultyLevel: c.level || 'beginner',
      accreditation: null,
      duration: 60,
      totalSlides: c.lessons || 12,
      totalQuizzes: 1,
      ratingAvg: c.rating || 4.8,
      ratingCount: c.reviewCount || 0,
      enrollmentCount: c.enrolledCount || 0,
      instructorName: 'SEI Tech Training Team',
      curriculum: [],
      outcomes: c.outcomes || [],
      requirements: ['No prior knowledge required'],
      faqs: [],
      metaTitle: c.title,
      metaDescription: c.shortDescription,
      keywords: [],
      isPublished: true,
      isFeatured: c.isFeatured || false,
      isPopular: c.isPopular || false,
      // Keep original fields for search
      category: c.category,
      subCategory: c.subCategory,
      level: c.level,
      price: c.price,
      thumbnail: c.thumbnail,
    }));

    // Apply filters
    if (categoryId) {
      const catId = parseInt(categoryId);
      courses = courses.filter(c => c.category?.id === catId || c.subCategory?.id === catId);
    }

    if (level) {
      courses = courses.filter(c => c.level === level);
    }

    if (search) {
      courses = courses.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.shortDescription.toLowerCase().includes(search) ||
        c.categoryName.toLowerCase().includes(search)
      );
    }

    if (featured === 'true') {
      courses = courses.filter(c => c.isFeatured);
    }

    if (popular === 'true') {
      courses = courses.filter(c => c.isPopular);
    }

    const total = courses.length;

    // Apply pagination
    if (limit > 0) {
      courses = courses.slice(offset, offset + limit);
    }

    return NextResponse.json({
      success: true,
      data: {
        courses,
        total,
        limit: limit || total,
        offset,
        categories: coursesData.categories,
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch courses',
        data: null,
      },
      { status: 500 }
    );
  }
}
