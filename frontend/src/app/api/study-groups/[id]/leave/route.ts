import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient } from '@/lib/odoo';

/**
 * POST /api/study-groups/[id]/leave
 * Leave a study group
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);

    const odoo = await getOdooClient();

    // Call the action_leave method
    await odoo.call('seitech.study.group', 'action_leave', [groupId]);

    // Get updated group info
    const fields = ['member_count'];
    const groupResult = await odoo.read('seitech.study.group', [groupId], fields);

    if (!groupResult.success || !groupResult.data || groupResult.data.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const group = groupResult.data[0] as any;

    return NextResponse.json({
      member_count: group.member_count,
      is_member: false,
    });
  } catch (error) {
    console.error('Error leaving study group:', error);
    return NextResponse.json(
      { error: 'Failed to leave study group' },
      { status: 500 }
    );
  }
}
