import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient, getCurrentUserId } from '@/lib/odoo';

export async function GET(
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

    const notificationResult = await odoo.read('seitech.notification', [notificationId], [
      'id',
      'notification_type',
      'title',
      'message',
      'link',
      'read',
      'create_date',
      'data',
      'related_discussion_id',
      'related_study_group_id',
      'related_user_id',
    ]);

    if (!notificationResult.success || !notificationResult.data || notificationResult.data.length === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const notification = notificationResult.data[0] as any;

    return NextResponse.json({
      id: notification.id,
      type: notification.notification_type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      read: notification.read,
      created_at: notification.create_date,
      data: notification.data ? JSON.parse(notification.data) : null,
      related_discussion_id: notification.related_discussion_id?.[0],
      related_study_group_id: notification.related_study_group_id?.[0],
      related_user_id: notification.related_user_id?.[0],
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const unlinkResult = await odoo.unlink('seitech.notification', [notificationId]);
    if (!unlinkResult.success) {
      return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
