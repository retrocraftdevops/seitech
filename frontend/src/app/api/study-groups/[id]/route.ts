import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient } from '@/lib/odoo';
import type { StudyGroup, UpdateStudyGroupRequest } from '@/types/social';

/**
 * GET /api/study-groups/[id]
 * Get a single study group with members
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);

    const odoo = await getOdooClient();

    const fields = [
      'name', 'description', 'owner_id', 'group_type', 'privacy',
      'join_policy', 'state', 'course_id', 'learning_path_id',
      'skill_ids', 'max_members', 'member_count', 'member_ids',
      'discussion_count', 'schedule_ids', 'next_session_id',
      'progress_percentage', 'goal', 'is_featured', 'image_128',
      'last_activity_date', 'create_date', 'write_date'
    ];

    const groupsResult = await odoo.read('seitech.study.group', [groupId], fields);

    if (!groupsResult.success || !groupsResult.data || groupsResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Study group not found' },
        { status: 404 }
      );
    }

    const group = groupsResult.data[0] as any;

    // Get members if they exist
    if (group.member_count > 0 && group.member_ids && Array.isArray(group.member_ids) && group.member_ids.length > 0) {
      const memberIds = Array.isArray(group.member_ids[0]) 
        ? group.member_ids.map((id: any) => id[0])
        : group.member_ids;
      
      const memberFields = [
        'user_id', 'user_name', 'user_avatar', 'role', 'state',
        'contribution_score', 'discussion_count', 'reply_count',
        'helpful_count', 'progress_percentage', 'join_date'
      ];

      const membersResult = await odoo.read('seitech.study.group.member', memberIds, memberFields);
      if (membersResult.success && membersResult.data) {
        (group as any).members = membersResult.data;
      }
    }

    // Check if current user is a member
    const currentUserId = await getCurrentUserId(odoo);
    const memberDomain = [
      ['group_id', '=', groupId],
      ['user_id', '=', currentUserId],
      ['state', '=', 'active']
    ];
    const memberIdsResult = await odoo.search('seitech.study.group.member', memberDomain, {
      fields: ['id'],
    });
    
    if (memberIdsResult.success && memberIdsResult.data && memberIdsResult.data.length > 0) {
      const memberIds = memberIdsResult.data.map((m: any) => m.id);
      const memberResult = await odoo.read('seitech.study.group.member', memberIds, ['role', 'state']);
      if (memberResult.success && memberResult.data && memberResult.data.length > 0) {
        group.is_member = true;
        group.member_role = memberResult.data[0].role;
        group.member_state = memberResult.data[0].state;
      } else {
        group.is_member = false;
      }
    } else {
      group.is_member = false;
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error fetching study group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study group' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/study-groups/[id]
 * Update a study group
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);
    const body: UpdateStudyGroupRequest = await request.json();

    const odoo = await getOdooClient();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.privacy !== undefined) updateData.privacy = body.privacy;
    if (body.join_policy !== undefined) updateData.join_policy = body.join_policy;
    if (body.max_members !== undefined) updateData.max_members = body.max_members;
    if (body.goal !== undefined) updateData.goal = body.goal;

    await odoo.write('seitech.study.group', [groupId], updateData);

    // Handle state changes via actions
    if (body.state === 'archived') {
      await odoo.call('seitech.study.group', 'action_archive', [groupId]);
    } else if (body.state === 'active') {
      await odoo.call('seitech.study.group', 'action_activate', [groupId]);
    }

    // Read updated group
    const fields = [
      'name', 'description', 'privacy', 'join_policy',
      'max_members', 'goal', 'state', 'write_date'
    ];

    const groupResult = await odoo.read('seitech.study.group', [groupId], fields);

    if (!groupResult.success || !groupResult.data || groupResult.data.length === 0) {
      return NextResponse.json({ error: 'Failed to read updated group' }, { status: 500 });
    }

    return NextResponse.json(groupResult.data[0]);
  } catch (error) {
    console.error('Error updating study group:', error);
    return NextResponse.json(
      { error: 'Failed to update study group' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/study-groups/[id]
 * Archive a study group
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);

    const odoo = await getOdooClient();

    // Archive instead of hard delete
    await odoo.call('seitech.study.group', 'action_archive', [groupId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting study group:', error);
    return NextResponse.json(
      { error: 'Failed to delete study group' },
      { status: 500 }
    );
  }
}

async function getCurrentUserId(odoo: any): Promise<number> {
  try {
    const session = await odoo.getSession();
    return session?.uid || 0;
  } catch {
    return 0;
  }
}
