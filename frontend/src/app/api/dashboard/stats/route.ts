import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthenticatedOdooClient, getOdooClient } from '@/lib/api/odoo-client';
import type { UserStats, Enrollment, Certificate } from '@/types/user';

export const dynamic = 'force-dynamic';

interface DashboardData {
  stats: UserStats;
  recentEnrollments: Enrollment[];
  recentCertificates: Certificate[];
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const userInfoCookie = cookieStore.get('user_info')?.value;

    if (!sessionToken || !userInfoCookie) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized. Please log in.',
        data: null,
      }, { status: 401 });
    }

    // Parse user info
    const userInfo = JSON.parse(userInfoCookie);

    // Check if this is a demo/admin session (not connected to Odoo)
    if (sessionToken.startsWith('demo_') || sessionToken.startsWith('admin_')) {
      // Return demo dashboard data
      const demoData: DashboardData = {
        stats: {
          totalCourses: 5,
          completedCourses: 2,
          inProgressCourses: 3,
          totalCertificates: 2,
          totalPoints: 1250,
          totalBadges: 8,
          totalTimeSpent: 3600,
          currentStreak: 5,
          longestStreak: 12,
        },
        recentEnrollments: [],
        recentCertificates: [],
      };

      return NextResponse.json({
        success: true,
        data: demoData,
      });
    }

    const odoo = getOdooClient();
    const session = await odoo.getSession();

    if (!session || !session.uid) {
      return NextResponse.json({
        success: false,
        message: 'Session expired. Please log in again.',
        data: null,
      }, { status: 401 });
    }

    const partnerId = session.partnerId;
    const userId = session.uid;

    // Fetch enrollments
    const enrollmentRecords = await odoo.searchRead<any>(
      'slide.channel.partner',
      [['partner_id', '=', partnerId]],
      [
        'id',
        'channel_id',
        'completion',
        'create_date',
        'expiration_date',
        'completed_date',
        'last_access_date',
        'total_time',
        'certificate_id',
      ],
      { order: 'create_date desc', limit: 10 }
    );

    // Fetch course details for enrollments
    const courseIds = enrollmentRecords.map((e: any) => e.channel_id?.[0]).filter(Boolean);
    const courses = courseIds.length > 0
      ? await odoo.read<any>(
          'slide.channel',
          courseIds,
          ['id', 'name', 'website_slug', 'image_512']
        )
      : [];

    const courseMap = new Map(courses.map((c: any) => [c.id, c]));

    // Process enrollments
    const enrollments: Enrollment[] = enrollmentRecords.map((record: any) => {
      const course = courseMap.get(record.channel_id?.[0]);

      let state: Enrollment['state'] = 'active';
      if (record.completed_date) {
        state = 'completed';
      } else if (record.expiration_date && new Date(record.expiration_date) < new Date()) {
        state = 'expired';
      } else if (!record.last_access_date) {
        state = 'pending';
      }

      return {
        id: record.id,
        courseId: record.channel_id?.[0] || 0,
        courseName: course?.name || record.channel_id?.[1] || '',
        courseSlug: course?.website_slug || '',
        courseImage: course?.image_512 ? `data:image/png;base64,${course.image_512}` : '',
        userId,
        state,
        progress: record.completion || 0,
        enrollmentDate: record.create_date,
        expirationDate: record.expiration_date || undefined,
        completionDate: record.completed_date || undefined,
        lastAccessDate: record.last_access_date || undefined,
        totalTimeSpent: record.total_time || 0,
        certificateId: record.certificate_id?.[0] || undefined,
        certificateUrl: record.certificate_id?.[0]
          ? `/api/certificates/${record.certificate_id[0]}`
          : undefined,
      };
    });

    // Count enrollment stats
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.state === 'completed').length;
    const inProgressCourses = enrollments.filter(e => e.state === 'active' || e.state === 'pending').length;
    const totalTimeSpent = enrollments.reduce((sum, e) => sum + (e.totalTimeSpent || 0), 0);

    // Fetch certificates
    const certificateRecords = await odoo.searchRead<any>(
      'slide.channel.certificate',
      [['partner_id', '=', partnerId], ['state', '=', 'done']],
      [
        'id',
        'reference',
        'channel_id',
        'issue_date',
        'expiry_date',
        'template_id',
        'qr_code',
      ],
      { order: 'issue_date desc', limit: 5 }
    );

    const certCourseIds = certificateRecords.map((c: any) => c.channel_id?.[0]).filter(Boolean);
    const certCourses = certCourseIds.length > 0
      ? await odoo.read<any>('slide.channel', certCourseIds, ['id', 'name', 'website_slug'])
      : [];

    const certCourseMap = new Map(certCourses.map((c: any) => [c.id, c]));
    const baseUrl = process.env.NEXT_PUBLIC_ODOO_URL || '';

    const certificates: Certificate[] = certificateRecords.map((record: any) => {
      const course = certCourseMap.get(record.channel_id?.[0]);
      return {
        id: record.id,
        reference: record.reference || `CERT-${record.id}`,
        courseName: course?.name || record.channel_id?.[1] || '',
        courseSlug: course?.website_slug || '',
        issuedDate: record.issue_date,
        expiryDate: record.expiry_date || undefined,
        downloadUrl: `${baseUrl}/slides/certificate/${record.id}/download`,
        verificationUrl: `/certificates/verify?ref=${record.reference}`,
        qrCode: record.qr_code ? `data:image/png;base64,${record.qr_code}` : '',
        templateName: record.template_id?.[1] || 'Default Template',
      };
    });

    // Fetch gamification stats
    let totalPoints = 0;
    let totalBadges = 0;
    let currentStreak = 0;
    let longestStreak = 0;

    try {
      // Try to fetch user's gamification stats
      const userRecords = await odoo.searchRead<any>(
        'res.users',
        [['id', '=', userId]],
        ['total_points', 'current_streak', 'longest_streak', 'student_badge_count'],
        { limit: 1 }
      );

      if (userRecords.length > 0) {
        const user = userRecords[0];
        totalPoints = user.total_points || 0;
        currentStreak = user.current_streak || 0;
        longestStreak = user.longest_streak || 0;
        totalBadges = user.student_badge_count || 0;
      }
    } catch (err) {
      // Gamification fields might not exist, use defaults
      console.log('Gamification fields not available:', err);
    }

    // If badge count not available, try counting manually
    if (totalBadges === 0) {
      try {
        totalBadges = await odoo.searchCount(
          'seitech.student.badge',
          [['user_id', '=', userId]]
        );
      } catch (err) {
        // Model might not exist
      }
    }

    const stats: UserStats = {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalCertificates: certificates.length,
      totalPoints,
      totalBadges,
      totalTimeSpent,
      currentStreak,
      longestStreak,
    };

    const dashboardData: DashboardData = {
      stats,
      recentEnrollments: enrollments.filter(e => e.state !== 'completed').slice(0, 3),
      recentCertificates: certificates.slice(0, 2),
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);

    // Return empty data for graceful degradation
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          totalCertificates: 0,
          totalPoints: 0,
          totalBadges: 0,
          totalTimeSpent: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
        recentEnrollments: [],
        recentCertificates: [],
        message: 'Dashboard data is currently unavailable',
      },
    });
  }
}
