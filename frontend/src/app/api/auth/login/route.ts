import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:8069';
    const body = await request.json();

    // Forward login request to Odoo
    const odooResponse = await fetch(`${odooUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await odooResponse.json();

    // If login successful, set session cookie
    if (data.success && data.data?.sessionToken) {
      const cookieStore = cookies();
      cookieStore.set('session_token', data.data.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      // Also store user info in a separate cookie for client access
      cookieStore.set('user_info', JSON.stringify(data.data.user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return NextResponse.json(data, { status: odooResponse.status });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
        data: null,
      },
      { status: 500 }
    );
  }
}
