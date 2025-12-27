import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient, getCurrentUserId } from '@/lib/odoo';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notificationId = parseInt(params.id);
    const odoo = await getOdooClient();

    // Verify notification belongs to current user
    const domain = [
      ['id', '=', notificationId],
      ['user_id', '=', currentUserId],
    ];

    const notificationIdsResult = await odoo.search('seitech.notification', domain, {
      fields: ['id'],
    });
    
    if (!notificationIdsResult.success || !notificationIdsResult.data || notificationIdsResult.data.length === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Mark as read
    const writeResult = await odoo.write('seitech.notification', [notificationId], {
      read: true,
      read_date: new Date().toISOString(),
    });
    
    if (!writeResult.success) {
      return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
