import { NextRequest, NextResponse } from 'next/server';
import { odooClient } from '@/lib/odoo';

export const dynamic = 'force-dynamic';

/**
 * GET /api/skills
 * List all skills (public endpoint - no auth required)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const trending = searchParams.get('trending') === 'true';
    const parentId = searchParams.get('parentId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build domain filter
    const domain: any[] = [['active', '=', true]];
    
    if (category) {
      domain.push(['category', '=', category]);
    }
    if (trending) {
      domain.push(['is_trending', '=', true]);
    }
    if (parentId) {
      domain.push(['parent_id', '=', parseInt(parentId)]);
    }
    if (search) {
      domain.push('|', ['name', 'ilike', search], ['description', 'ilike', search]);
    }

    // Fetch skills from Odoo
    const skillsResult = await odooClient.search(
      'seitech.skill',
      domain,
      {
        fields: [
          'name',
          'category',
          'description',
          'parent_id',
          'child_ids',
          'total_courses',
          'total_learners',
          'average_proficiency',
          'is_trending',
          'trending_score',
          'industry',
        ],
        limit,
        offset,
        order: trending ? 'trending_score desc' : 'name asc',
      }
    );

    // Get total count for pagination
    const total = await odooClient.searchCount('seitech.skill', domain);

    return NextResponse.json({
      success: true,
      data: skillsResult.success && skillsResult.data ? skillsResult.data : [],
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
