import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient } from '@/lib/odoo';
import type { Discussion, UpdateDiscussionRequest } from '@/types/social';

/**
 * GET /api/discussions/[id]
 * Get a single discussion with replies
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discussionId = parseInt(params.id);

    const odoo = await getOdooClient();

    // Increment view count
    await odoo.call('seitech.discussion', 'action_increment_view', [discussionId]);

    const fields = [
      'name', 'content', 'author_id', 'author_name', 'author_avatar',
      'category', 'state', 'course_id', 'slide_id', 'study_group_id',
      'tag_ids', 'skill_ids', 'reply_count', 'upvote_count', 'view_count',
      'has_best_answer', 'best_answer_id', 'is_pinned', 'is_locked',
      'is_featured', 'upvote_ids', 'reply_ids', 'published_date',
      'last_activity_date', 'resolved_date', 'create_date', 'write_date'
    ];

    const discussionsResult = await odoo.read('seitech.discussion', [discussionId], fields);

    if (!discussionsResult.success || !discussionsResult.data || discussionsResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    const discussion = discussionsResult.data[0] as Discussion;

    // Get replies if they exist
    if (discussion.reply_count > 0) {
      const replyFields = [
        'discussion_id', 'parent_id', 'child_ids', 'content',
        'author_id', 'author_name', 'author_avatar', 'state',
        'thread_level', 'upvote_count', 'upvote_ids',
        'is_best_answer', 'is_by_instructor', 'is_by_author',
        'edited_date', 'create_date', 'write_date'
      ];

      const replyIds = Array.isArray((discussion as any).reply_ids)
        ? (discussion as any).reply_ids
        : [];

      if (replyIds.length > 0) {
        const repliesResult = await odoo.read('seitech.discussion.reply', replyIds, replyFields);
        if (repliesResult.success && repliesResult.data) {
          (discussion as any).replies = repliesResult.data;
        }
      }
    }

    // Add has_upvoted flag
    const currentUserId = await getCurrentUserId(odoo);
    discussion.has_upvoted = discussion.upvote_ids?.includes(currentUserId) || false;

    return NextResponse.json(discussion);
  } catch (error) {
    console.error('Error fetching discussion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussion' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/discussions/[id]
 * Update a discussion
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discussionId = parseInt(params.id);
    const body: UpdateDiscussionRequest = await request.json();

    const odoo = await getOdooClient();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.is_pinned !== undefined) updateData.is_pinned = body.is_pinned;
    if (body.is_locked !== undefined) updateData.is_locked = body.is_locked;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.tag_ids !== undefined) updateData.tag_ids = [[6, 0, body.tag_ids]];
    if (body.skill_ids !== undefined) updateData.skill_ids = [[6, 0, body.skill_ids]];

    await odoo.write('seitech.discussion', [discussionId], updateData);

    // Handle state changes via actions
    if (body.state) {
      switch (body.state) {
        case 'published':
          await odoo.call('seitech.discussion', 'action_publish', [discussionId]);
          break;
        case 'resolved':
          await odoo.call('seitech.discussion', 'action_resolve', [discussionId]);
          break;
        case 'closed':
          await odoo.call('seitech.discussion', 'action_close', [discussionId]);
          break;
        case 'flagged':
          await odoo.call('seitech.discussion', 'action_flag', [discussionId]);
          break;
      }
    }

    // Read updated discussion
    const fields = [
      'name', 'content', 'author_id', 'author_name', 'author_avatar',
      'category', 'state', 'tag_ids', 'skill_ids', 'is_pinned',
      'is_locked', 'is_featured', 'write_date'
    ];

    const discussionResult = await odoo.read('seitech.discussion', [discussionId], fields);

    if (!discussionResult.success || !discussionResult.data || discussionResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Discussion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(discussionResult.data[0]);
  } catch (error) {
    console.error('Error updating discussion:', error);
    return NextResponse.json(
      { error: 'Failed to update discussion' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/discussions/[id]
 * Delete a discussion (soft delete by setting state to deleted)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discussionId = parseInt(params.id);

    const odoo = await getOdooClient();

    // Close the discussion instead of hard delete
    await odoo.call('seitech.discussion', 'action_close', [discussionId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    return NextResponse.json(
      { error: 'Failed to delete discussion' },
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
