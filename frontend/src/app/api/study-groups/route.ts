import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient } from '@/lib/odoo';
import type { StudyGroup, CreateStudyGroupRequest, UpdateStudyGroupRequest, PaginatedResponse } from '@/types/social';

/**
 * GET /api/study-groups
 * List study groups with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const offset = (page - 1) * per_page;

    // Build domain filters
    const domain: any[] = [['state', '=', 'active']];
    
    const groupType = searchParams.get('group_type');
    if (groupType) domain.push(['group_type', '=', groupType]);
    
    const privacy = searchParams.get('privacy');
    if (privacy) domain.push(['privacy', '=', privacy]);
    else domain.push(['privacy', 'in', ['public', 'private']]); // Exclude secret by default
    
    const courseId = searchParams.get('course_id');
    if (courseId) domain.push(['course_id', '=', parseInt(courseId)]);
    
    const isFeatured = searchParams.get('is_featured');
    if (isFeatured === 'true') domain.push(['is_featured', '=', true]);
    
    const search = searchParams.get('search');
    if (search) {
      domain.push('|', ['name', 'ilike', search], ['description', 'ilike', search]);
    }

    const odoo = await getOdooClient();
    
    // Get total count
    const total = await odoo.searchCount('seitech.study.group', domain);
    
    // Get paginated records
    const groupIdsResult = await odoo.search('seitech.study.group', domain, {
      fields: ['id'],
      offset,
      limit: per_page,
      order: 'is_featured desc, last_activity_date desc',
    });

    const groupIds = groupIdsResult.success && groupIdsResult.data 
      ? groupIdsResult.data.map((g: any) => g.id)
      : [];

    const fields = [
      'name', 'description', 'owner_id', 'group_type', 'privacy',
      'join_policy', 'state', 'course_id', 'learning_path_id',
      'skill_ids', 'max_members', 'member_count', 'member_ids',
      'discussion_count', 'schedule_ids', 'next_session_id',
      'progress_percentage', 'goal', 'is_featured', 'image_128',
      'last_activity_date', 'create_date', 'write_date'
    ];

    let groups: StudyGroup[] = [];
    if (groupIds.length > 0) {
      const groupsResult = await odoo.read('seitech.study.group', groupIds, fields);
      if (groupsResult.success && groupsResult.data) {
        groups = groupsResult.data as StudyGroup[];
      }
    }

    // Add membership info for current user
    const currentUserId = await getCurrentUserId(odoo);
    for (const group of groups) {
      const memberDomain = [
        ['group_id', '=', group.id],
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
    }

    const response: PaginatedResponse<StudyGroup> = {
      items: groups,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching study groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study groups' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/study-groups
 * Create a new study group
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateStudyGroupRequest = await request.json();

    if (!body.name || !body.group_type || !body.privacy || !body.join_policy) {
      return NextResponse.json(
        { error: 'Name, group_type, privacy, and join_policy are required' },
        { status: 400 }
      );
    }

    const odoo = await getOdooClient();

    const groupData: any = {
      name: body.name,
      group_type: body.group_type,
      privacy: body.privacy,
      join_policy: body.join_policy,
      state: 'draft',
    };

    if (body.description) groupData.description = body.description;
    if (body.course_id) groupData.course_id = body.course_id;
    if (body.learning_path_id) groupData.learning_path_id = body.learning_path_id;
    if (body.skill_ids) groupData.skill_ids = [[6, 0, body.skill_ids]];
    if (body.max_members) groupData.max_members = body.max_members;
    if (body.goal) groupData.goal = body.goal;

    const createResult = await odoo.create('seitech.study.group', groupData);
    if (!createResult.success || !createResult.data) {
      return NextResponse.json({ error: 'Failed to create study group' }, { status: 500 });
    }

    const groupId = createResult.data;

    // Activate the group
    const activateResult = await odoo.call('seitech.study.group', 'action_activate', [groupId]);
    if (!activateResult.success) {
      return NextResponse.json({ error: 'Failed to activate study group' }, { status: 500 });
    }

    // Read the created group
    const fields = [
      'name', 'description', 'owner_id', 'group_type', 'privacy',
      'join_policy', 'state', 'course_id', 'learning_path_id',
      'skill_ids', 'max_members', 'member_count', 'goal',
      'create_date', 'write_date'
    ];

    const groupResult = await odoo.read('seitech.study.group', [groupId], fields);

    if (!groupResult.success || !groupResult.data || groupResult.data.length === 0) {
      return NextResponse.json({ error: 'Failed to read created group' }, { status: 500 });
    }

    return NextResponse.json(groupResult.data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating study group:', error);
    return NextResponse.json(
      { error: 'Failed to create study group' },
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
