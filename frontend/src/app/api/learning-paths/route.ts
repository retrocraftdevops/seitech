import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { odooClient } from '@/lib/odoo';

/**
 * GET /api/learning-paths
 * List user's learning paths with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get('state'); // draft, active, completed, cancelled
    const pathType = searchParams.get('type'); // custom, adaptive, structured
    const includeTemplates = searchParams.get('templates') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build domain filter
    const domain: any[] = [['user_id', '=', parseInt((session?.user as any)?.id)]];
    
    if (state) {
      domain.push(['state', '=', state]);
    }
    if (pathType) {
      domain.push(['path_type', '=', pathType]);
    }
    if (includeTemplates) {
      domain.push(['is_template', '=', true]);
    }

    // Fetch learning paths from Odoo
    const pathsResult = await odooClient.search(
      'seitech.learning.path',
      domain,
      {
        fields: [
          'name',
          'user_id',
          'path_type',
          'state',
          'goal',
          'progress_percentage',
          'node_count',
          'completed_count',
          'estimated_hours',
          'deadline',
          'start_date',
          'completion_date',
          'last_activity',
          'skill_ids',
        ],
        limit,
        offset,
        order: 'last_activity desc',
      }
    );

    if (!pathsResult.success || !pathsResult.data) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          limit,
          offset,
          hasMore: false,
        },
      });
    }

    // Get total count for pagination
    const total = await odooClient.searchCount('seitech.learning.path', domain);

    return NextResponse.json({
      success: true,
      data: pathsResult.data,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning paths', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/learning-paths
 * Create a new learning path
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, goal, pathType, skillIds, templateId, deadline } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Create learning path
    const pathData: any = {
      name,
      user_id: parseInt((session?.user as any)?.id),
      path_type: pathType || 'custom',
      goal: goal || '',
      state: 'draft',
    };

    if (skillIds && Array.isArray(skillIds)) {
      pathData.skill_ids = [[6, 0, skillIds]]; // [(6, 0, [ids])] = replace with
    }

    if (templateId) {
      pathData.template_id = parseInt(templateId);
    }

    if (deadline) {
      pathData.deadline = deadline;
    }

    const createResult = await odooClient.create('seitech.learning.path', pathData);
    if (!createResult.success || !createResult.data) {
      return NextResponse.json(
        { error: 'Failed to create learning path' },
        { status: 500 }
      );
    }

    const pathId = createResult.data;

    // Fetch created path with full details
    const pathResult = await odooClient.read('seitech.learning.path', [pathId], [
      'name',
      'user_id',
      'path_type',
      'state',
      'goal',
      'progress_percentage',
      'node_count',
      'completed_count',
      'estimated_hours',
      'deadline',
      'skill_ids',
    ]);

    if (!pathResult.success || !pathResult.data || pathResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to read created learning path' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: pathResult.data[0],
      message: 'Learning path created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to create learning path', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
