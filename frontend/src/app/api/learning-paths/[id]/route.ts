import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { odooClient } from '@/lib/odoo';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/learning-paths/[id]
 * Get a specific learning path with full details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pathId = parseInt(params.id);
    if (isNaN(pathId)) {
      return NextResponse.json({ error: 'Invalid path ID' }, { status: 400 });
    }

    // Fetch learning path with all details
    const pathsResult = await odooClient.read('seitech.learning.path', [pathId], [
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
      'node_ids',
      'is_template',
      'template_id',
    ]);

    if (!pathsResult.success || !pathsResult.data || pathsResult.data.length === 0) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }

    const path = pathsResult.data[0] as any;

    // Verify user owns this path (unless it's a template)
    if (!path.is_template && path.user_id[0] !== parseInt((session?.user as any)?.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch nodes with details
    if (path.node_ids && Array.isArray(path.node_ids) && path.node_ids.length > 0) {
      const nodeIds = Array.isArray(path.node_ids[0]) ? path.node_ids.map((n: any) => n[0]) : path.node_ids;
      const nodesResult = await odooClient.read('seitech.learning.path.node', nodeIds, [
        'sequence',
        'channel_id',
        'is_required',
        'state',
        'progress_percentage',
        'deadline',
        'completion_date',
        'enrollment_id',
        'prerequisite_ids',
      ]);
      if (nodesResult.success && nodesResult.data) {
        path.nodes = nodesResult.data.sort((a: any, b: any) => a.sequence - b.sequence);
      }
    }

    // Fetch skills if present
    if (path.skill_ids && Array.isArray(path.skill_ids) && path.skill_ids.length > 0) {
      const skillIds = Array.isArray(path.skill_ids[0]) ? path.skill_ids.map((s: any) => s[0]) : path.skill_ids;
      const skillsResult = await odooClient.read('seitech.skill', skillIds, [
        'name',
        'category',
        'description',
      ]);
      if (skillsResult.success && skillsResult.data) {
        path.skills = skillsResult.data;
      }
    }

    return NextResponse.json({
      success: true,
      data: path,
    });
  } catch (error) {
    console.error('Error fetching learning path:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning path', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/learning-paths/[id]
 * Update a learning path
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pathId = parseInt(params.id);
    if (isNaN(pathId)) {
      return NextResponse.json({ error: 'Invalid path ID' }, { status: 400 });
    }

    // Verify ownership
    const existingResult = await odooClient.read('seitech.learning.path', [pathId], ['user_id']);
    if (!existingResult.success || !existingResult.data || existingResult.data.length === 0) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }
    const existing = existingResult.data[0] as any;
    if (existing.user_id && Array.isArray(existing.user_id) && existing.user_id[0] !== parseInt((session?.user as any)?.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updateData: any = {};

    // Allow updating specific fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.goal !== undefined) updateData.goal = body.goal;
    if (body.deadline !== undefined) updateData.deadline = body.deadline;
    if (body.skillIds !== undefined) {
      updateData.skill_ids = [[6, 0, body.skillIds]];
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Update the path
    await odooClient.write('seitech.learning.path', [pathId], updateData);

    // Fetch updated path
    const updatedResult = await odooClient.read('seitech.learning.path', [pathId], [
      'name',
      'goal',
      'deadline',
      'progress_percentage',
      'skill_ids',
    ]);

    if (!updatedResult.success || !updatedResult.data || updatedResult.data.length === 0) {
      return NextResponse.json({ error: 'Failed to fetch updated path' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedResult.data[0],
      message: 'Learning path updated successfully',
    });
  } catch (error) {
    console.error('Error updating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to update learning path', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/learning-paths/[id]
 * Delete a learning path
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pathId = parseInt(params.id);
    if (isNaN(pathId)) {
      return NextResponse.json({ error: 'Invalid path ID' }, { status: 400 });
    }

    // Verify ownership
    const existingResult = await odooClient.read('seitech.learning.path', [pathId], ['user_id', 'state']);
    if (!existingResult.success || !existingResult.data || existingResult.data.length === 0) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }
    const existing = existingResult.data[0] as any;
    if (existing.user_id && Array.isArray(existing.user_id) && existing.user_id[0] !== parseInt((session?.user as any)?.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Can only delete draft or cancelled paths
    if (!['draft', 'cancelled'].includes(existing.state)) {
      return NextResponse.json(
        { error: 'Can only delete draft or cancelled learning paths' },
        { status: 400 }
      );
    }

    // Delete the path
    await odooClient.unlink('seitech.learning.path', [pathId]);

    return NextResponse.json({
      success: true,
      message: 'Learning path deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting learning path:', error);
    return NextResponse.json(
      { error: 'Failed to delete learning path', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
