import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { odooClient } from '@/lib/odoo';

/**
 * GET /api/skills/user
 * Get current user's skill profile
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const verified = searchParams.get('verified');
    const level = searchParams.get('level');

    // Build domain filter
    const domain: any[] = [['user_id', '=', parseInt((session?.user as any)?.id)]];
    
    if (category) {
      domain.push(['skill_category', '=', category]);
    }
    if (verified !== null) {
      domain.push(['verified', '=', verified === 'true']);
    }
    if (level) {
      domain.push(['current_level', '=', level]);
    }

    // Fetch user skills
    const userSkillsResult = await odooClient.search(
      'seitech.user.skill',
      domain,
      {
        fields: [
          'skill_id',
          'skill_name',
          'skill_category',
          'current_level',
          'target_level',
          'points',
          'progress_percentage',
          'verified',
          'verified_date',
          'verification_score',
          'acquired_count',
          'first_acquired',
          'last_updated',
          'last_practiced',
          'badge_id',
        ],
        order: 'points desc',
      }
    );

    // Get skill profile summary
    const profileResult = await odooClient.call(
      'seitech.user.skill',
      'get_user_skill_profile',
      [parseInt((session?.user as any)?.id)]
    );

    return NextResponse.json({
      success: true,
      data: {
        skills: userSkillsResult.success && userSkillsResult.data ? userSkillsResult.data : [],
        profile: profileResult.success ? profileResult.data : null,
      },
    });
  } catch (error) {
    console.error('Error fetching user skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user skills', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/skills/user
 * Update user skill (set target level, mark as practiced)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, skillId, targetLevel } = body;

    if (!action || !skillId) {
      return NextResponse.json({ error: 'action and skillId are required' }, { status: 400 });
    }

    // Find user skill record
    const userSkillsResult = await odooClient.search(
      'seitech.user.skill',
      [
        ['user_id', '=', parseInt((session?.user as any)?.id)],
        ['skill_id', '=', parseInt(skillId)],
      ],
      {
        fields: ['id'],
      }
    );

    if (!userSkillsResult.success || !userSkillsResult.data || userSkillsResult.data.length === 0) {
      return NextResponse.json({ error: 'User skill not found' }, { status: 404 });
    }

    const userSkillId = userSkillsResult.data[0].id;

    let result: any;

    switch (action) {
      case 'set_target':
        if (!targetLevel) {
          return NextResponse.json({ error: 'targetLevel is required' }, { status: 400 });
        }
        const writeResult = await odooClient.write('seitech.user.skill', [userSkillId], {
          target_level: targetLevel,
        });
        if (!writeResult.success) {
          return NextResponse.json({ error: 'Failed to update target level' }, { status: 500 });
        }
        result = { targetLevel };
        break;

      case 'practiced':
        const practicedResult = await odooClient.call(
          'seitech.user.skill',
          'update_last_practiced',
          [userSkillId]
        );
        result = practicedResult.success ? { practiced: true } : null;
        break;

      case 'level_up':
        const levelUpResult = await odooClient.call(
          'seitech.user.skill',
          'action_level_up',
          [userSkillId]
        );
        result = levelUpResult.success ? levelUpResult.data : null;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Fetch updated skill
    const updatedResult = await odooClient.read('seitech.user.skill', [userSkillId], [
      'current_level',
      'target_level',
      'points',
      'progress_percentage',
      'last_practiced',
    ]);

    if (!updatedResult.success || !updatedResult.data || updatedResult.data.length === 0) {
      return NextResponse.json({ error: 'Failed to fetch updated skill' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedResult.data[0],
      result,
      message: `Action '${action}' executed successfully`,
    });
  } catch (error) {
    console.error('Error updating user skill:', error);
    return NextResponse.json(
      { error: 'Failed to update user skill', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
