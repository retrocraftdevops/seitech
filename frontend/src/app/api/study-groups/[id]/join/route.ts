import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient } from '@/lib/odoo';

/**
 * POST /api/study-groups/[id]/join
 * Join a study group
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);

    const odoo = await getOdooClient();

    // Call the action_join method
    await odoo.call('seitech.study.group', 'action_join', [groupId]);

    // Get updated group info
    const fields = ['member_count', 'member_ids'];
    const groupResult = await odoo.read('seitech.study.group', [groupId], fields);

    if (!groupResult.success || !groupResult.data || groupResult.data.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const group = groupResult.data[0] as any;

    // Get current user's membership status
    const currentUserId = await getCurrentUserId(odoo);
    const memberDomain = [
      ['group_id', '=', groupId],
      ['user_id', '=', currentUserId]
    ];
    const memberIdsResult = await odoo.search('seitech.study.group.member', memberDomain, {
      fields: ['id'],
    });
    
    let memberStatus = null;
    if (memberIdsResult.success && memberIdsResult.data && memberIdsResult.data.length > 0) {
      const memberIds = memberIdsResult.data.map((m: any) => m.id);
      const memberResult = await odoo.read('seitech.study.group.member', memberIds, ['role', 'state']);
      if (memberResult.success && memberResult.data && memberResult.data.length > 0) {
        memberStatus = memberResult.data[0];
      }
    }

    return NextResponse.json({
      member_count: group.member_count,
      member_status: memberStatus,
    });
  } catch (error) {
    console.error('Error joining study group:', error);
    return NextResponse.json(
      { error: 'Failed to join study group' },
      { status: 500 }
    );
  }
}

async function getCurrentUserId(odoo: any): Promise<number> {
  try {
    const userInfo = await odoo.call('res.users', 'read', [[odoo.uid], ['id']]);
    return userInfo[0].id;
  } catch {
    return 0;
  }
}
