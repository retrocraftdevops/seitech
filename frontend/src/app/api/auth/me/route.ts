import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userInfoCookie = cookieStore.get('user_info');
    const sessionToken = cookieStore.get('session_token');

    if (!sessionToken || !userInfoCookie) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated',
          data: null,
        },
        { status: 401 }
      );
    }

    // Parse user info from cookie
    const user = JSON.parse(userInfoCookie.value);

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user',
        data: null,
      },
      { status: 500 }
    );
  }
}
