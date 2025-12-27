import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient } from '@/lib/odoo';
import type { DiscussionReply, CreateReplyRequest, UpdateReplyRequest } from '@/types/social';

/**
 * GET /api/discussions/[id]/replies
 * Get all replies for a discussion with nested structure
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discussionId = parseInt(params.id);

    const odoo = await getOdooClient();

    // Get all replies for this discussion
    const domain = [['discussion_id', '=', discussionId], ['state', 'in', ['published', 'edited']]];
    const replyIdsResult = await odoo.search('seitech.discussion.reply', domain, {
      fields: ['id'],
      order: 'create_date asc',
    });

    if (!replyIdsResult.success || !replyIdsResult.data) {
      return NextResponse.json([]);
    }

    const replyIds = replyIdsResult.data.map((r: any) => r.id);
    
    if (replyIds.length === 0) {
      return NextResponse.json([]);
    }

    const fields = [
      'discussion_id', 'parent_id', 'child_ids', 'content',
      'author_id', 'author_name', 'author_avatar', 'state',
      'thread_level', 'upvote_count', 'upvote_ids',
      'is_best_answer', 'is_by_instructor', 'is_by_author',
      'edited_date', 'create_date', 'write_date'
    ];

    const repliesResult = await odoo.read('seitech.discussion.reply', replyIds, fields);
    if (!repliesResult.success || !repliesResult.data) {
      return NextResponse.json([]);
    }
    const replies = repliesResult.data as DiscussionReply[];

    // Add has_upvoted flag
    const currentUserId = await getCurrentUserId(odoo);
    replies.forEach(reply => {
      reply.has_upvoted = reply.upvote_ids?.includes(currentUserId) || false;
    });

    // Build nested structure
    const nestedReplies = buildReplyTree(replies);

    return NextResponse.json(nestedReplies);
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch replies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discussions/[id]/replies
 * Create a new reply to a discussion
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discussionId = parseInt(params.id);
    const body: CreateReplyRequest = await request.json();

    if (!body.content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const odoo = await getOdooClient();

    const replyData: any = {
      discussion_id: discussionId,
      content: body.content,
      state: 'published',
    };

    if (body.parent_id) {
      replyData.parent_id = body.parent_id;
    }

    const createResult = await odoo.create('seitech.discussion.reply', replyData);
    if (!createResult.success || !createResult.data) {
      return NextResponse.json(
        { error: 'Failed to create reply' },
        { status: 500 }
      );
    }

    const replyId = createResult.data;

    // Read the created reply
    const fields = [
      'discussion_id', 'parent_id', 'content', 'author_id',
      'author_name', 'author_avatar', 'state', 'thread_level',
      'upvote_count', 'is_best_answer', 'is_by_instructor',
      'is_by_author', 'create_date', 'write_date'
    ];

    const readResult = await odoo.read('seitech.discussion.reply', [replyId], fields);
    if (!readResult.success || !readResult.data || readResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to read created reply' },
        { status: 500 }
      );
    }

    return NextResponse.json(readResult.data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}

function buildReplyTree(replies: DiscussionReply[]): DiscussionReply[] {
  const replyMap = new Map<number, DiscussionReply>();
  const rootReplies: DiscussionReply[] = [];

  // First pass: create map
  replies.forEach(reply => {
    replyMap.set(reply.id, { ...reply, replies: [] });
  });

  // Second pass: build tree
  replies.forEach(reply => {
    const replyNode = replyMap.get(reply.id)!;
    if (reply.parent_id) {
      const parent = replyMap.get(reply.parent_id);
      if (parent) {
        if (!parent.replies) parent.replies = [];
        parent.replies.push(replyNode);
      } else {
        // Parent not found, treat as root
        rootReplies.push(replyNode);
      }
    } else {
      rootReplies.push(replyNode);
    }
  });

  return rootReplies;
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
