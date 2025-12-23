import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedOdooClient } from '@/lib/api/odoo-client';
import type { ApiResponse, Certificate } from '@/types';
// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


const VerifySchema = z.object({
  reference: z.string().min(1, 'Certificate reference is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const data = VerifySchema.parse(body);

    const odoo = await getAuthenticatedOdooClient();

    // Search for certificate by reference
    const certificateRecords = await odoo.searchRead<any>(
      'slide.channel.certificate',
      [
        ['reference', '=', data.reference],
        ['state', '=', 'done'],
      ],
      [
        'id',
        'reference',
        'channel_id',
        'partner_id',
        'issue_date',
        'expiry_date',
        'template_id',
        'qr_code',
      ]
    );

    if (!certificateRecords || certificateRecords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Certificate not found or invalid',
          data: null,
        },
        { status: 404 }
      );
    }

    const record = certificateRecords[0];

    // Check if certificate is expired
    if (record.expiry_date && new Date(record.expiry_date) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Certificate has expired',
          data: null,
        },
        { status: 400 }
      );
    }

    // Fetch course details
    const courseRecords = await odoo.read<any>(
      'slide.channel',
      [record.channel_id[0]],
      ['id', 'name', 'website_slug']
    );

    const course = courseRecords[0];

    // Fetch partner (user) details
    const partnerRecords = await odoo.read<any>(
      'res.partner',
      [record.partner_id[0]],
      ['name', 'email']
    );

    const partner = partnerRecords[0];

    const baseUrl = process.env.NEXT_PUBLIC_ODOO_URL || '';

    const certificate: Certificate & { holderName: string; holderEmail: string } = {
      id: record.id,
      reference: record.reference,
      courseName: course.name,
      courseSlug: course.website_slug,
      issuedDate: record.issue_date,
      expiryDate: record.expiry_date || undefined,
      downloadUrl: `${baseUrl}/slides/certificate/${record.id}/download`,
      verificationUrl: `/certificates/verify?ref=${record.reference}`,
      qrCode: record.qr_code ? `data:image/png;base64,${record.qr_code}` : '',
      templateName: record.template_id?.[1] || 'Default Template',
      holderName: partner.name,
      holderEmail: partner.email,
    };

    const response: ApiResponse<typeof certificate> = {
      success: true,
      message: 'Certificate is valid',
      data: certificate,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error verifying certificate:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          data: null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify certificate',
        data: null,
      },
      { status: 500 }
    );
  }
}
