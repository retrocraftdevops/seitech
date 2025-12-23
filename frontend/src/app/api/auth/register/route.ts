import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:8069';
    const body = await request.json();

    // Transform frontend format to Odoo format
    const odooBody = {
      name: `${body.firstName || ''} ${body.lastName || ''}`.trim(),
      email: body.email,
      password: body.password,
    };

    // Forward registration request to Odoo
    const odooResponse = await fetch(`${odooUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(odooBody),
    });

    const data = await odooResponse.json();
    return NextResponse.json(data, { status: odooResponse.status });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
        data: null,
      },
      { status: 500 }
    );
  }
}
