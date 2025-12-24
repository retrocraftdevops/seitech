import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedOdooClient } from '@/lib/api/odoo-client';

export const dynamic = 'force-dynamic';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon?: string;
  color: string;
  type: string;
  pointsAwarded: number;
  earnedCount: number;
}

export async function GET(request: NextRequest) {
  try {
    const odoo = await getAuthenticatedOdooClient();

    // Fetch all active badges
    const fields = [
      'id',
      'name',
      'description',
      'icon',
      'color',
      'badge_type',
      'points_awarded',
      'earned_count',
      'image',
    ];

    const records = await odoo.searchRead<any>(
      'seitech.badge',
      [['is_active', '=', true]],
      fields,
      { order: 'sequence asc, name asc' }
    );

    const badges: Badge[] = records.map((record: any) => ({
      id: record.id,
      name: record.name,
      description: record.description || '',
      icon: record.icon || 'Award',
      color: record.color || '#0284c7',
      type: record.badge_type || 'achievement',
      pointsAwarded: record.points_awarded || 0,
      earnedCount: record.earned_count || 0,
      image: record.image ? `data:image/png;base64,${record.image}` : undefined,
    }));

    return NextResponse.json({
      success: true,
      data: { badges },
    });
  } catch (error) {
    console.error('Error fetching badges:', error);

    return NextResponse.json({
      success: true,
      data: {
        badges: [],
        message: 'Badge data is currently unavailable',
      },
    });
  }
}
