import { NextRequest, NextResponse } from 'next/server';
import { odooClient } from '@/lib/odoo';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/skills/[id]
 * Get a specific skill with full details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const skillId = parseInt(params.id);
    if (isNaN(skillId)) {
      return NextResponse.json({ error: 'Invalid skill ID' }, { status: 400 });
    }

    // Fetch skill with all details
    const skillsResult = await odooClient.read('seitech.skill', [skillId], [
      'name',
      'category',
      'description',
      'parent_id',
      'child_ids',
      'total_courses',
      'total_learners',
      'average_proficiency',
      'is_trending',
      'trending_score',
      'industry',
      'course_skill_ids',
    ]);

    if (!skillsResult.success || !skillsResult.data || skillsResult.data.length === 0) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    const skill = skillsResult.data[0] as any;

    // Fetch related courses
    if (skill.course_skill_ids && Array.isArray(skill.course_skill_ids) && skill.course_skill_ids.length > 0) {
      const courseSkillIds = Array.isArray(skill.course_skill_ids[0]) 
        ? skill.course_skill_ids.map((id: any) => id[0])
        : skill.course_skill_ids;
      
      const courseMappingsResult = await odooClient.read(
        'seitech.course.skill',
        courseSkillIds,
        ['channel_id', 'proficiency_level', 'is_primary', 'skill_points']
      );

      if (courseMappingsResult.success && courseMappingsResult.data) {
        const courseMappings = courseMappingsResult.data;
        // Fetch course details
        const courseIds = courseMappings
          .filter((m: any) => m.channel_id && Array.isArray(m.channel_id) && m.channel_id.length > 0)
          .map((m: any) => m.channel_id[0]);
        
        if (courseIds.length > 0) {
          const coursesResult = await odooClient.read(
            'slide.channel',
            courseIds,
            ['name', 'description', 'total_slides', 'total_time', 'rating_avg']
          );

          if (coursesResult.success && coursesResult.data) {
            const courses = coursesResult.data;
            // Combine course and mapping data
            skill.courses = courses.map((course: any) => {
              const mapping = courseMappings.find((m: any) => 
                m.channel_id && Array.isArray(m.channel_id) && m.channel_id[0] === course.id
              );
              return {
                ...course,
                proficiency_level: mapping?.proficiency_level,
                is_primary: mapping?.is_primary,
                skill_points: mapping?.skill_points,
              };
            });
          }
        }
      }
    }

    // Fetch child skills if present
    if (skill.child_ids && Array.isArray(skill.child_ids) && skill.child_ids.length > 0) {
      const childIds = Array.isArray(skill.child_ids[0]) 
        ? skill.child_ids.map((id: any) => id[0])
        : skill.child_ids;
      
      const childrenResult = await odooClient.read('seitech.skill', childIds, [
        'name',
        'category',
        'total_courses',
        'is_trending',
      ]);
      
      if (childrenResult.success && childrenResult.data) {
        skill.children = childrenResult.data;
      }
    }

    return NextResponse.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
