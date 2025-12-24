import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:8069';
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email address is required',
        },
        { status: 400 }
      );
    }

    // Forward password reset request to Odoo
    const odooResponse = await fetch(`${odooUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: body.email }),
    });

    // Even if Odoo returns an error (e.g., email not found),
    // we return success to prevent email enumeration attacks
    if (odooResponse.ok) {
      const data = await odooResponse.json();
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.',
      });
    }

    // Log the actual error but don't expose it
    console.error('Password reset request failed:', await odooResponse.text());

    // Still return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
    });
  } catch (error) {
    console.error('Password reset error:', error);

    // Return success even on error to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
    });
  }
}
