import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { ApiResponse, Certificate } from '@/types';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const userInfo = cookieStore.get('user_info')?.value;

    // Check if user is authenticated
    if (!sessionToken || !userInfo) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Please log in.',
          data: null,
        },
        { status: 401 }
      );
    }

    const user = JSON.parse(userInfo);
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Try Odoo first if configured
    if (odooUrl) {
      try {
        const response = await fetch(`${odooUrl}/api/certificates`, {
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

    // Demo mode - return empty certificates (no certificates in demo)
    const certificates: Certificate[] = [];

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
