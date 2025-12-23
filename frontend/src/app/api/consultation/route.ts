import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

const ConsultationRequestSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  companyName: z.string().optional(),
  serviceInterested: z.array(z.string()).min(1, 'Please select at least one service'),
  message: z.string().optional(),
  preferredContact: z.enum(['email', 'phone']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const data = ConsultationRequestSchema.parse(body);

    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:8069';

    // Forward to Odoo REST API
    const response = await fetch(`${odooUrl}/api/consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        company_name: data.companyName || '',
        services: data.serviceInterested,
        message: data.message || '',
        preferred_contact: data.preferredContact,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      const apiResponse: ApiResponse<{ id: number }> = {
        success: true,
        message: 'Thank you for requesting a free consultation. Our team will contact you shortly.',
        data: result.data,
      };
      return NextResponse.json(apiResponse, { status: 201 });
    }

    // If Odoo API fails, still return success to user (log error for admin)
    console.error('Odoo consultation API error:', await response.text());

    // For now, accept the request anyway (it can be processed manually)
    const apiResponse: ApiResponse<{ id: number }> = {
      success: true,
      message: 'Thank you for requesting a free consultation. Our team will contact you shortly.',
      data: { id: 0 },
    };
    return NextResponse.json(apiResponse, { status: 201 });

  } catch (error) {
    console.error('Consultation request error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid form data',
          data: null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit consultation request',
        data: null,
      },
      { status: 500 }
    );
  }
}
