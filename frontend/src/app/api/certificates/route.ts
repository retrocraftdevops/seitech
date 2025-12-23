import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedOdooClient } from '@/lib/api/odoo-client';
import type { ApiResponse, Certificate } from '@/types';
// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    const odoo = await getAuthenticatedOdooClient();

    // Get current user session
    const session = await odoo.getSession();

    if (!session || !session.uid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Please log in.',
          data: null,
        },
        { status: 401 }
      );
    }

    // Fetch user's certificates
    const domain: [string, string, any][] = [
      ['partner_id', '=', session.partnerId],
      ['state', '=', 'done'],
    ];

    const certificateRecords = await odoo.searchRead<any>(
      'slide.channel.certificate',
      domain,
      [
        'id',
        'reference',
        'channel_id',
        'partner_id',
        'issue_date',
        'expiry_date',
        'template_id',
        'qr_code',
      ],
      { order: 'issue_date desc' }
    );

    // Fetch course details for each certificate
    const courseIds = certificateRecords
      .map((cert: any) => cert.channel_id?.[0])
      .filter(Boolean);

    const courses =
      courseIds.length > 0
        ? await odoo.read<any>('slide.channel', courseIds, ['id', 'name', 'website_slug'])
        : [];

    const courseMap = new Map(courses.map((c: any) => [c.id, c]));

    const certificates: Certificate[] = certificateRecords.map((record: any) => {
      const course = courseMap.get(record.channel_id?.[0]);
      const baseUrl = process.env.NEXT_PUBLIC_ODOO_URL || '';

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

    const response: ApiResponse<Certificate[]> = {
      success: true,
      data: certificates,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching certificates:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch certificates',
        data: null,
      },
      { status: 500 }
    );
  }
}
