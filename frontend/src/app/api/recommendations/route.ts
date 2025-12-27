import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { odooClient } from '@/lib/odoo';

/**
 * GET /api/recommendations
 * Get user's course recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending';
    const algorithm = searchParams.get('algorithm');
    const minScore = searchParams.get('minScore');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build domain filter
    const domain: any[] = [
      ['user_id', '=', parseInt((session?.user as any)?.id)],
      ['is_expired', '=', false],
    ];
    
    if (status) {
      domain.push(['status', '=', status]);
    }
    if (algorithm) {
      domain.push(['algorithm', '=', algorithm]);
    }
    if (minScore) {
      domain.push(['score', '>=', parseFloat(minScore)]);
    }

    // Fetch recommendations
    const recommendationsResult = await odooClient.search(
      'seitech.recommendation',
      domain,
      {
        fields: [
          'course_id',
          'course_name',
          'course_category_id',
          'score',
          'algorithm',
          'reason_type',
          'reason_text',
          'status',
          'created_date',
          'expires_date',
          'viewed_date',
        ],
        limit,
        order: 'score desc, created_date desc',
      }
    );

    if (!recommendationsResult.success || !recommendationsResult.data) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const recommendations = recommendationsResult.data as any[];

    // Get course details for each recommendation
    const courseIds = recommendations
      .filter((r: any) => r.course_id && Array.isArray(r.course_id) && r.course_id.length > 0)
      .map((r: any) => r.course_id[0]);
    
    if (courseIds.length > 0) {
      const coursesResult = await odooClient.read(
        'slide.channel',
        courseIds,
        ['name', 'description', 'image_1024', 'total_slides', 'total_time', 'rating_avg']
      );

      if (coursesResult.success && coursesResult.data) {
        const courses = coursesResult.data;
        // Merge course data into recommendations
        recommendations.forEach((rec: any) => {
          if (rec.course_id && Array.isArray(rec.course_id) && rec.course_id.length > 0) {
            const course = courses.find((c: any) => c.id === rec.course_id[0]);
            if (course) {
              rec.course = course;
            }
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations
 * Generate new recommendations for the user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { algorithm, limit = 10 } = body;

    // Generate recommendations
    const result = await odooClient.call(
      'seitech.recommendation',
      'generate_recommendations',
      [parseInt((session?.user as any)?.id)],
      {
        limit,
        algorithm: algorithm || null, // null = hybrid
      }
    );

    // Fetch newly generated recommendations
    const newRecommendationsResult = await odooClient.search(
      'seitech.recommendation',
      [
        ['user_id', '=', parseInt((session?.user as any)?.id)],
        ['status', '=', 'pending'],
        ['is_expired', '=', false],
      ],
      {
        fields: [
          'course_id',
          'course_name',
          'score',
          'algorithm',
          'reason_type',
          'reason_text',
        ],
        limit,
        order: 'created_date desc',
      }
    );

    if (!newRecommendationsResult.success || !newRecommendationsResult.data) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const newRecommendations = newRecommendationsResult.data;

    return NextResponse.json({
      success: true,
      data: newRecommendations,
      message: `Generated ${newRecommendations.length} new recommendations`,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
