import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient, getCurrentUserId } from '@/lib/odoo';

export async function POST(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const odoo = await getOdooClient();

    // Find all unread notifications for current user
    const domain = [
      ['user_id', '=', currentUserId],
      ['read', '=', false],
    ];

    const notificationIdsResult = await odoo.search('seitech.notification', domain, {
      fields: ['id'],
    });

    if (notificationIdsResult.success && notificationIdsResult.data && notificationIdsResult.data.length > 0) {
      const notificationIds = notificationIdsResult.data.map((n: any) => n.id);
      // Mark all as read
      const writeResult = await odoo.write('seitech.notification', notificationIds, {
        read: true,
        read_date: new Date().toISOString(),
      });
      
      if (!writeResult.success) {
        return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true,
        count: notificationIds.length,
      });
    }

    return NextResponse.json({ 
      success: true,
      count: 0,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
