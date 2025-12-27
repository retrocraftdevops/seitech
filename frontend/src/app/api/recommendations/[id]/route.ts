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
 * PATCH /api/recommendations/[id]
 * Update recommendation status (viewed, enrolled, dismissed, saved)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recId = parseInt(params.id);
    if (isNaN(recId)) {
      return NextResponse.json({ error: 'Invalid recommendation ID' }, { status: 400 });
    }

    // Verify ownership
    const existingResult = await odooClient.read('seitech.recommendation', [recId], ['user_id']);
    if (!existingResult.success || !existingResult.data || existingResult.data.length === 0) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }
    const existing = existingResult.data[0] as any;
    if (existing.user_id && Array.isArray(existing.user_id) && existing.user_id[0] !== parseInt((session?.user as any)?.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    let result: any;

    switch (action) {
      case 'viewed':
        result = await odooClient.call(
          'seitech.recommendation',
          'action_viewed',
          [[recId]]
        );
        break;

      case 'enroll':
        result = await odooClient.call(
          'seitech.recommendation',
          'action_enroll',
          [[recId]]
        );
        break;

      case 'save':
        result = await odooClient.call(
          'seitech.recommendation',
          'action_save',
          [[recId]]
        );
        break;

      case 'dismiss':
        result = await odooClient.call(
          'seitech.recommendation',
          'action_dismiss',
          [[recId]]
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Fetch updated recommendation
    const updatedResult = await odooClient.read('seitech.recommendation', [recId], [
      'status',
      'viewed_date',
      'action_date',
    ]);

    return NextResponse.json({
      success: true,
      data: updatedResult.success && updatedResult.data && updatedResult.data.length > 0 ? updatedResult.data[0] : null,
      result,
      message: `Recommendation ${action} successfully`,
    });
  } catch (error) {
    console.error('Error updating recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to update recommendation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
