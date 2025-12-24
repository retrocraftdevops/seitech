import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedOdooClient } from '@/lib/api/odoo-client';

export const dynamic = 'force-dynamic';

const LeaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

interface LeaderboardEntry {
  id: number;
  rank: number;
  userId: number;
  name: string;
  avatar?: string;
  totalPoints: number;
  coursesCompleted: number;
  badgesEarned: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const { limit, offset } = LeaderboardQuerySchema.parse(params);

    const odoo = await getAuthenticatedOdooClient();

    // Fetch from the leaderboard view
    const fields = [
      'id',
      'rank',
      'user_id',
      'partner_id',
      'total_points',
      'courses_completed',
      'badges_earned',
    ];

    const records = await odoo.searchRead<any>(
      'seitech.student.leaderboard',
      [],
      fields,
      {
        offset,
        limit,
        order: 'rank asc',
      }
    );

    // Get partner details for avatars and names
    const partnerIds = records.map((r: any) => r.partner_id?.[0]).filter(Boolean);
    let partnerDetails: Record<number, { name: string; image?: string }> = {};

    if (partnerIds.length > 0) {
      const partners = await odoo.read<any>(
        'res.partner',
        partnerIds,
        ['id', 'name', 'image_128']
      );
      partnerDetails = Object.fromEntries(
        partners.map((p: any) => [
          p.id,
          {
            name: p.name,
            image: p.image_128 ? `data:image/png;base64,${p.image_128}` : undefined,
          },
        ])
      );
    }

    // Transform to frontend format
    const leaderboard: LeaderboardEntry[] = records.map((record: any) => {
      const partnerId = record.partner_id?.[0];
      const partnerInfo = partnerDetails[partnerId] || { name: 'Anonymous' };

      return {
        id: record.id,
        rank: record.rank,
        userId: record.user_id?.[0] || 0,
        name: partnerInfo.name,
        avatar: partnerInfo.image,
        totalPoints: record.total_points || 0,
        coursesCompleted: record.courses_completed || 0,
        badgesEarned: record.badges_earned || 0,
      };
    });

    // Get total count
    const total = await odoo.searchCount('seitech.student.leaderboard', []);

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          offset,
          limit,
          total,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);

    // If Odoo is unavailable, return empty leaderboard
    return NextResponse.json({
      success: true,
      data: {
        leaderboard: [],
        pagination: {
          offset: 0,
          limit: 20,
          total: 0,
          hasMore: false,
        },
        message: 'Leaderboard data is currently unavailable',
      },
    });
  }
}
