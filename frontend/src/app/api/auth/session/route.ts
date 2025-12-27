import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Check for session cookie
    const cookies = request.headers.get('cookie') || '';
    const hasSession = cookies.includes('session_id');

    if (!hasSession) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
        },
        { status: 401 }
      );
    }

    // TODO: Verify session with Odoo
    // For now, just check if cookie exists
    return NextResponse.json({
      success: true,
      authenticated: true,
      message: 'Session active',
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
      },
      { status: 401 }
    );
  }
}
