import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient, getCurrentUserId } from '@/lib/odoo';

export async function GET(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const unread_only = searchParams.get('unread_only') === 'true';

    const odoo = await getOdooClient();

    // Build domain
    const domain: any[] = [['user_id', '=', currentUserId]];
    
    if (unread_only) {
      domain.push(['read', '=', false]);
    }

    // Get total count
    const total = await odoo.searchCount('seitech.notification', domain);

    // Get notifications with pagination
    const offset = (page - 1) * per_page;
    const notificationIdsResult = await odoo.search('seitech.notification', domain, {
      fields: ['id'],
      offset,
      limit: per_page,
      order: 'create_date desc',
    });

    let notifications: any[] = [];
    if (notificationIdsResult.success && notificationIdsResult.data && notificationIdsResult.data.length > 0) {
      const notificationIds = notificationIdsResult.data.map((n: any) => n.id);
      const readResult = await odoo.read('seitech.notification', notificationIds, [
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
      if (readResult.success && readResult.data) {
        notifications = readResult.data;
      }
    }

    return NextResponse.json({
      items: notifications.map((n: any) => ({
        id: n.id,
        type: n.notification_type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        created_at: n.create_date,
        data: n.data ? JSON.parse(n.data) : null,
        related_discussion_id: n.related_discussion_id?.[0],
        related_study_group_id: n.related_study_group_id?.[0],
        related_user_id: n.related_user_id?.[0],
      })),
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      notification_type, 
      title, 
      message, 
      link, 
      data,
      related_discussion_id,
      related_study_group_id,
      related_user_id,
    } = body;

    if (!notification_type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: notification_type, title, message' },
        { status: 400 }
      );
    }

    const odoo = await getOdooClient();

    const notificationData: any = {
      user_id: currentUserId,
      notification_type,
      title,
      message,
      read: false,
    };

    if (link) notificationData.link = link;
    if (data) notificationData.data = JSON.stringify(data);
    if (related_discussion_id) notificationData.related_discussion_id = related_discussion_id;
    if (related_study_group_id) notificationData.related_study_group_id = related_study_group_id;
    if (related_user_id) notificationData.related_user_id = related_user_id;

    const createResult = await odoo.create('seitech.notification', notificationData);
    if (!createResult.success || !createResult.data) {
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }

    const notificationId = createResult.data;

    const readResult = await odoo.read('seitech.notification', [notificationId], [
      'id',
      'notification_type',
      'title',
      'message',
      'link',
      'read',
      'create_date',
      'data',
    ]);

    if (!readResult.success || !readResult.data || readResult.data.length === 0) {
      return NextResponse.json({ error: 'Failed to read created notification' }, { status: 500 });
    }

    return NextResponse.json(readResult.data[0]);
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
