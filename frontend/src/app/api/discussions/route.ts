import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient } from '@/lib/odoo';
import type { Discussion, CreateDiscussionRequest, DiscussionFilters, PaginatedResponse } from '@/types/social';

/**
 * GET /api/discussions
 * List discussions with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const offset = (page - 1) * per_page;

    // Build domain filters
    const domain: any[] = [];
    
    const category = searchParams.get('category');
    if (category) domain.push(['category', '=', category]);
    
    const state = searchParams.get('state');
    if (state) domain.push(['state', '=', state]);
    else domain.push(['state', 'in', ['published', 'resolved', 'closed']]);
    
    const courseId = searchParams.get('course_id');
    if (courseId) domain.push(['course_id', '=', parseInt(courseId)]);
    
    const studyGroupId = searchParams.get('study_group_id');
    if (studyGroupId) domain.push(['study_group_id', '=', parseInt(studyGroupId)]);
    
    const authorId = searchParams.get('author_id');
    if (authorId) domain.push(['author_id', '=', parseInt(authorId)]);
    
    const isPinned = searchParams.get('is_pinned');
    if (isPinned === 'true') domain.push(['is_pinned', '=', true]);
    
    const isFeatured = searchParams.get('is_featured');
    if (isFeatured === 'true') domain.push(['is_featured', '=', true]);
    
    const hasBestAnswer = searchParams.get('has_best_answer');
    if (hasBestAnswer === 'true') domain.push(['has_best_answer', '=', true]);
    
    const search = searchParams.get('search');
    if (search) {
      domain.push('|', ['name', 'ilike', search], ['content', 'ilike', search]);
    }

    const odoo = await getOdooClient();
    
    // Get paginated records with all fields
    const fields = [
      'name', 'content', 'author_id', 'author_name', 'author_avatar',
      'category', 'state', 'course_id', 'slide_id', 'study_group_id',
      'tag_ids', 'skill_ids', 'reply_count', 'upvote_count', 'view_count',
      'has_best_answer', 'best_answer_id', 'is_pinned', 'is_locked',
      'is_featured', 'upvote_ids', 'published_date', 'last_activity_date',
      'resolved_date', 'create_date', 'write_date'
    ];

    const discussionsResult = await odoo.search('seitech.discussion', domain, {
      fields,
      offset,
      limit: per_page,
      order: 'is_pinned desc, last_activity_date desc',
    });

    if (!discussionsResult.success || !discussionsResult.data) {
      return NextResponse.json({
        items: [],
        total: 0,
        page,
        per_page,
        total_pages: 0,
      });
    }

    const discussions = discussionsResult.data as Discussion[];
    const total = discussions.length; // Approximate total (we'd need a separate count call for exact)

    // Add has_upvoted flag for current user
    const currentUserId = await getCurrentUserId(odoo);
    discussions.forEach(discussion => {
      discussion.has_upvoted = discussion.upvote_ids?.includes(currentUserId) || false;
    });

    const response: PaginatedResponse<Discussion> = {
      items: discussions,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discussions
 * Create a new discussion
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateDiscussionRequest = await request.json();

    if (!body.name || !body.content || !body.category) {
      return NextResponse.json(
        { error: 'Name, content, and category are required' },
        { status: 400 }
      );
    }

    const odoo = await getOdooClient();

    const discussionData: any = {
      name: body.name,
      content: body.content,
      category: body.category,
      state: 'draft',
    };

    if (body.course_id) discussionData.course_id = body.course_id;
    if (body.slide_id) discussionData.slide_id = body.slide_id;
    if (body.study_group_id) discussionData.study_group_id = body.study_group_id;
    if (body.tag_ids) discussionData.tag_ids = [[6, 0, body.tag_ids]];
    if (body.skill_ids) discussionData.skill_ids = [[6, 0, body.skill_ids]];

    const createResult = await odoo.create('seitech.discussion', discussionData);
    if (!createResult.success || !createResult.data) {
      return NextResponse.json(
        { error: 'Failed to create discussion' },
        { status: 500 }
      );
    }

    const discussionId = createResult.data;

    // Publish immediately
    await odoo.call('seitech.discussion', 'action_publish', [discussionId]);

    // Read the created discussion
    const fields = [
      'name', 'content', 'author_id', 'author_name', 'author_avatar',
      'category', 'state', 'course_id', 'slide_id', 'study_group_id',
      'tag_ids', 'skill_ids', 'reply_count', 'upvote_count', 'view_count',
      'has_best_answer', 'is_pinned', 'is_locked', 'is_featured',
      'published_date', 'last_activity_date', 'create_date', 'write_date'
    ];

    const readResult = await odoo.read('seitech.discussion', [discussionId], fields);
    if (!readResult.success || !readResult.data || readResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to read created discussion' },
        { status: 500 }
      );
    }

    return NextResponse.json(readResult.data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating discussion:', error);
    return NextResponse.json(
      { error: 'Failed to create discussion' },
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
