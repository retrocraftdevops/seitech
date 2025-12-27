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
 * POST /api/learning-paths/[id]/actions
 * Execute actions on learning paths (activate, complete, cancel, generate_ai, recalculate)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pathId = parseInt(params.id);
    if (isNaN(pathId)) {
      return NextResponse.json({ error: 'Invalid path ID' }, { status: 400 });
    }

    const body = await request.json();
    const { action, params: actionParams } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
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

    let result: any;

    switch (action) {
      case 'activate':
        // Change state to active
        const activateResult = await odooClient.call('seitech.learning.path', 'action_activate', [pathId]);
        result = activateResult.success ? activateResult.data : null;
        break;

      case 'complete':
        // Mark as completed
        const completeResult = await odooClient.call('seitech.learning.path', 'action_complete', [pathId]);
        result = completeResult.success ? completeResult.data : null;
        break;

      case 'cancel':
        // Cancel the path
        const cancelResult = await odooClient.call('seitech.learning.path', 'action_cancel', [pathId]);
        result = cancelResult.success ? cancelResult.data : null;
        break;

      case 'reset':
        // Reset to draft
        const resetResult = await odooClient.call('seitech.learning.path', 'action_reset_to_draft', [pathId]);
        result = resetResult.success ? resetResult.data : null;
        break;

      case 'generate_ai':
        // Generate AI-powered learning path
        const algorithm = actionParams?.algorithm || 'hybrid';
        const maxCourses = actionParams?.maxCourses || 10;
        
        const aiResult = await odooClient.call('seitech.learning.path', 'generate_ai_path', [pathId], {
          algorithm,
          max_courses: maxCourses,
        });
        result = aiResult.success ? aiResult.data : null;
        break;

      case 'recalculate':
        // Recalculate progress
        const recalcResult = await odooClient.call('seitech.learning.path', 'recalculate_path', [pathId]);
        result = recalcResult.success ? recalcResult.data : null;
        break;

      case 'next_action':
        // Get next recommended action
        const nextResult = await odooClient.call('seitech.learning.path', 'get_next_action', [pathId]);
        result = nextResult.success ? nextResult.data : null;
        break;

      case 'add_course':
        // Add a course to the path
        const { courseId, isRequired, sequence } = actionParams || {};
        if (!courseId) {
          return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
        }

        const nodeData: any = {
          path_id: pathId,
          channel_id: parseInt(courseId),
          is_required: isRequired !== false, // default true
          sequence: sequence || 0,
        };

        const createResult = await odooClient.create('seitech.learning.path.node', nodeData);
        if (createResult.success && createResult.data) {
          result = { nodeId: createResult.data };
        } else {
          return NextResponse.json({ error: 'Failed to add course' }, { status: 500 });
        }
        break;

      case 'remove_course':
        // Remove a course from the path
        const { nodeId: removeNodeId } = actionParams || {};
        if (!removeNodeId) {
          return NextResponse.json({ error: 'nodeId is required' }, { status: 400 });
        }

        const unlinkResult = await odooClient.unlink('seitech.learning.path.node', [parseInt(removeNodeId)]);
        if (unlinkResult.success) {
          result = { success: true };
        } else {
          return NextResponse.json({ error: 'Failed to remove course' }, { status: 500 });
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Fetch updated path
    const updatedResult = await odooClient.read('seitech.learning.path', [pathId], [
      'name',
      'state',
      'progress_percentage',
      'node_count',
      'completed_count',
    ]);

    if (!updatedResult.success || !updatedResult.data || updatedResult.data.length === 0) {
      return NextResponse.json({ error: 'Failed to fetch updated path' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedResult.data[0],
      result,
      message: `Action '${action}' executed successfully`,
    });
  } catch (error) {
    console.error('Error executing learning path action:', error);
    return NextResponse.json(
      { error: 'Failed to execute action', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
