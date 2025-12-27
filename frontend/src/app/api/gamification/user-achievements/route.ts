import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
    const sessionToken = cookieStore.get('session_token')?.value;
    const userInfo = cookieStore.get('user_info')?.value;

    if (!sessionToken || !userInfo) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated',
      }, { status: 401 });
    }

    const user = JSON.parse(userInfo);
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo first if configured
    if (odooUrl) {
      try {
        const response = await fetch(`${odooUrl}/api/gamification/user-achievements`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `session_id=${sessionToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return NextResponse.json(data);
          }
        }
      } catch {
        // Fall through to demo mode
      }
    }

    // Demo mode - return empty achievements with initial stats
    const achievements: UserAchievement[] = [];

    const stats: UserStats = {
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      badgesEarned: 0,
      coursesCompleted: 0,
      rank: undefined,
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
