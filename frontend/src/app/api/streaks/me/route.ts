import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient } from '@/lib/odoo';
import type { LearningStreak } from '@/types/social';

/**
 * GET /api/streaks/me
 * Get current user's learning streak
 */
export async function GET(request: NextRequest) {
  try {
    const odoo = await getOdooClient();
    const currentUserId = await getCurrentUserId(odoo);

    // Find user's streak record
    const domain = [['user_id', '=', currentUserId]];
    const streakIdsResult = await odoo.search('seitech.learning.streak', domain, {
      fields: ['id'],
    });

    let streak: LearningStreak;

    if (!streakIdsResult.success || !streakIdsResult.data || streakIdsResult.data.length === 0) {
      // Create streak record if it doesn't exist
      const createResult = await odoo.create('seitech.learning.streak', {
        user_id: currentUserId,
      });

      if (!createResult.success || !createResult.data) {
        return NextResponse.json({ error: 'Failed to create streak' }, { status: 500 });
      }

      const streakId = createResult.data;
      const fields = [
        'user_id', 'current_streak', 'longest_streak',
        'longest_streak_start', 'longest_streak_end', 'start_date',
        'last_activity_date', 'freeze_days_available', 'freeze_days_used',
        'freeze_days_total', 'perfect_weeks', 'perfect_months',
        'total_activities', 'next_milestone', 'daily_goal_met',
        'milestone_ids'
      ];

      const newStreakResult = await odoo.read('seitech.learning.streak', [streakId], fields);
      if (!newStreakResult.success || !newStreakResult.data || newStreakResult.data.length === 0) {
        return NextResponse.json({ error: 'Failed to read created streak' }, { status: 500 });
      }
      streak = newStreakResult.data[0] as LearningStreak;
    } else {
      const streakIds = streakIdsResult.data.map((s: any) => s.id);
      const fields = [
        'user_id', 'current_streak', 'longest_streak',
        'longest_streak_start', 'longest_streak_end', 'start_date',
        'last_activity_date', 'freeze_days_available', 'freeze_days_used',
        'freeze_days_total', 'perfect_weeks', 'perfect_months',
        'total_activities', 'next_milestone', 'daily_goal_met',
        'milestone_ids'
      ];

      const streaksResult = await odoo.read('seitech.learning.streak', streakIds, fields);
      if (!streaksResult.success || !streaksResult.data || streaksResult.data.length === 0) {
        return NextResponse.json({ error: 'Failed to read streak' }, { status: 500 });
      }
      streak = streaksResult.data[0] as LearningStreak;
    }

    // Get milestones if they exist
    if (streak.milestone_ids && Array.isArray(streak.milestone_ids) && streak.milestone_ids.length > 0) {
      const milestoneIds = Array.isArray(streak.milestone_ids[0]) 
        ? streak.milestone_ids.map((id: any) => id[0])
        : streak.milestone_ids;
      const milestoneFields = [
        'days', 'achieved', 'achieved_date', 'badge_id', 'freeze_days_earned'
      ];
      const milestonesResult = await odoo.read('seitech.streak.milestone', milestoneIds, milestoneFields);
      if (milestonesResult.success && milestonesResult.data) {
        streak.milestones = milestonesResult.data;
      }
    }

    return NextResponse.json(streak);
  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/streaks/me/freeze
 * Use a freeze day to protect streak
 */
export async function POST(request: NextRequest) {
  try {
    const odoo = await getOdooClient();
    const currentUserId = await getCurrentUserId(odoo);

    // Find user's streak record
    const domain = [['user_id', '=', currentUserId]];
    const streakIdsResult = await odoo.search('seitech.learning.streak', domain, {
      fields: ['id'],
    });

    if (!streakIdsResult.success || !streakIdsResult.data || streakIdsResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Streak record not found' },
        { status: 404 }
      );
    }

    const streakIds = streakIdsResult.data.map((s: any) => s.id);

    // Call the action_freeze_streak method
    const callResult = await odoo.call('seitech.learning.streak', 'action_freeze_streak', [streakIds[0]]);
    if (!callResult.success) {
      return NextResponse.json({ error: 'Failed to freeze streak' }, { status: 500 });
    }

    // Read updated streak
    const fields = [
      'current_streak', 'freeze_days_available', 'freeze_days_used',
      'last_activity_date'
    ];

    const streakResult = await odoo.read('seitech.learning.streak', streakIds, fields);

    if (!streakResult.success || !streakResult.data || streakResult.data.length === 0) {
      return NextResponse.json({ error: 'Failed to read updated streak' }, { status: 500 });
    }

    return NextResponse.json(streakResult.data[0]);
  } catch (error) {
    console.error('Error using freeze day:', error);
    return NextResponse.json(
      { error: 'Failed to use freeze day' },
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
