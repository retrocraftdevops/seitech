import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient } from '@/lib/odoo';
import type { LeaderboardEntry, LeaderboardFilters, PaginatedResponse } from '@/types/social';

/**
 * GET /api/leaderboard
 * Get leaderboard rankings with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '50');
    const offset = (page - 1) * per_page;

    // Build domain filters
    const domain: any[] = [];
    
    const category = searchParams.get('category') || 'overall';
    domain.push(['category', '=', category]);
    
    const period = searchParams.get('period') || 'all_time';
    domain.push(['period', '=', period]);
    
    const userId = searchParams.get('user_id');
    if (userId) {
      domain.push(['user_id', '=', parseInt(userId)]);
    }
    
    const topN = searchParams.get('top_n');
    const limit = topN ? parseInt(topN) : per_page;

    const odoo = await getOdooClient();
    
    // Get paginated records with all fields
    const fields = [
      'user_id', 'category', 'period', 'rank', 'previous_rank',
      'rank_change', 'score', 'previous_score', 'score_change',
      'percentile', 'points_earned', 'courses_completed',
      'skills_mastered', 'streak_days', 'discussions_contributed',
      'certifications_earned', 'last_updated'
    ];

    const entriesResult = await odoo.search('seitech.leaderboard', domain, {
      fields,
      offset,
      limit,
      order: 'rank asc',
    });

    if (!entriesResult.success || !entriesResult.data) {
      return NextResponse.json({
        items: [],
        total: 0,
        page,
        per_page,
        total_pages: 0,
      });
    }

    const entries = entriesResult.data as LeaderboardEntry[];
    const total = entries.length; // Approximate total

    // Get user avatars
    for (const entry of entries) {
      if (entry.user_id) {
        const userId = Array.isArray(entry.user_id) ? entry.user_id[0] : entry.user_id;
        const userName = Array.isArray(entry.user_id) ? entry.user_id[1] : '';
        
        const usersResult = await odoo.read('res.users', [userId], ['image_128']);
        if (usersResult.success && usersResult.data && usersResult.data.length > 0) {
          entry.user_avatar = (usersResult.data[0] as any).image_128 || '';
        }
        entry.user_name = userName;
        entry.user_id = userId;
      }
    }

    const response: PaginatedResponse<LeaderboardEntry> = {
      items: entries,
      total,
      page,
      per_page: limit,
      total_pages: Math.ceil(total / limit),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leaderboard/update
 * Manually trigger leaderboard update (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const odoo = await getOdooClient();

    // Call the update_leaderboards method
    await odoo.call('seitech.leaderboard', 'update_leaderboards', []);

    return NextResponse.json({ 
      success: true,
      message: 'Leaderboard updated successfully'
    });
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to update leaderboard' },
      { status: 500 }
    );
  }
}
