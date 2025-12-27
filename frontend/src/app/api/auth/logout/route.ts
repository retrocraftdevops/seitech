import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Clear session cookies
    const cookieStore = await cookies();
    cookieStore.delete('session_token');
    cookieStore.delete('user_info');

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
      data: null,
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Logout failed',
        data: null,
      },
      { status: 500 }
    );
  }
}
