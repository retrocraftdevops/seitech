import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthenticatedOdooClient } from '@/lib/api/odoo-client';

export const dynamic = 'force-dynamic';

interface UserAchievement {
  id: number;
  badgeId: number;
  badgeName: string;
  badgeDescription: string;
  badgeIcon?: string;
  badgeColor: string;
  badgeType: string;
  earnedDate: string;
  courseName?: string;
}

interface UserStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  badgesEarned: number;
  coursesCompleted: number;
  rank?: number;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated',
      }, { status: 401 });
    }

    const odoo = await getAuthenticatedOdooClient();

    // Get current user
    const userRecords = await odoo.searchRead<any>(
      'res.users',
      [['id', '!=', 1]], // Exclude admin for demo
      ['id', 'partner_id', 'total_points', 'current_streak', 'longest_streak', 'student_badge_count'],
      { limit: 1 }
    );

    if (!userRecords || userRecords.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      }, { status: 404 });
    }

    const user = userRecords[0];
    const userId = user.id;

    // Fetch user's earned badges
    const earnedBadges = await odoo.searchRead<any>(
      'seitech.student.badge',
      [['user_id', '=', userId]],
      ['id', 'badge_id', 'earn_date', 'channel_id'],
      { order: 'earn_date desc' }
    );

    // Get badge details
    const badgeIds = earnedBadges.map((b: any) => b.badge_id?.[0]).filter(Boolean);
    let badgeDetails: Record<number, any> = {};

    if (badgeIds.length > 0) {
      const badges = await odoo.read<any>(
        'seitech.badge',
        badgeIds,
        ['id', 'name', 'description', 'icon', 'color', 'badge_type', 'image']
      );
      badgeDetails = Object.fromEntries(
        badges.map((b: any) => [b.id, b])
      );
    }

    const achievements: UserAchievement[] = earnedBadges.map((earned: any) => {
      const badge = badgeDetails[earned.badge_id?.[0]] || {};
      return {
        id: earned.id,
        badgeId: earned.badge_id?.[0] || 0,
        badgeName: badge.name || 'Unknown Badge',
        badgeDescription: badge.description || '',
        badgeIcon: badge.icon || 'Award',
        badgeColor: badge.color || '#0284c7',
        badgeType: badge.badge_type || 'achievement',
        earnedDate: earned.earn_date,
        courseName: earned.channel_id?.[1],
        badgeImage: badge.image ? `data:image/png;base64,${badge.image}` : undefined,
      };
    });

    // Get user's rank
    const leaderboardEntry = await odoo.searchRead<any>(
      'seitech.student.leaderboard',
      [['user_id', '=', userId]],
      ['rank'],
      { limit: 1 }
    );

    // Get completed courses count
    const coursesCompleted = await odoo.searchCount(
      'seitech.enrollment',
      [['user_id', '=', userId], ['state', '=', 'completed']]
    );

    const stats: UserStats = {
      totalPoints: user.total_points || 0,
      currentStreak: user.current_streak || 0,
      longestStreak: user.longest_streak || 0,
      badgesEarned: user.student_badge_count || achievements.length,
      coursesCompleted,
      rank: leaderboardEntry?.[0]?.rank,
    };

    return NextResponse.json({
      success: true,
      data: {
        achievements,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);

    // Return empty data with stats for graceful degradation
    return NextResponse.json({
      success: true,
      data: {
        achievements: [],
        stats: {
          totalPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          badgesEarned: 0,
          coursesCompleted: 0,
        },
        message: 'Achievement data is currently unavailable',
      },
    });
  }
}
