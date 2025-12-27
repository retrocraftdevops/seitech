import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient } from '@/lib/odoo';

/**
 * POST /api/discussions/[id]/upvote
 * Toggle upvote on a discussion
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discussionId = parseInt(params.id);

    const odoo = await getOdooClient();

    // Call the action_upvote method which handles the toggle
    await odoo.call('seitech.discussion', 'action_upvote', [discussionId]);

    // Read updated discussion
    const fields = ['upvote_count', 'upvote_ids'];
    const discussionResult = await odoo.read('seitech.discussion', [discussionId], fields);
    
    if (!discussionResult.success || !discussionResult.data || discussionResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }
    
    const discussion = discussionResult.data[0];
    const currentUserId = await getCurrentUserId(odoo);
    const hasUpvoted = (discussion as any).upvote_ids?.includes(currentUserId) || false;

    return NextResponse.json({
      upvote_count: (discussion as any).upvote_count,
      has_upvoted: hasUpvoted,
    });
  } catch (error) {
    console.error('Error toggling upvote:', error);
    return NextResponse.json(
      { error: 'Failed to toggle upvote' },
      { status: 500 }
    );
  }
}

async function getCurrentUserId(odoo: any): Promise<number> {
  try {
    const userInfoResult = await odoo.getUserInfo();
    if (userInfoResult.success && userInfoResult.data?.uid) {
      return userInfoResult.data.uid;
    }
    return 0;
  } catch {
    return 0;
  }
}
