import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// In-memory store for demo users (in production, this would be a database)
// This is shared across requests in the same server instance
const demoUsers = new Map<string, { id: number; name: string; email: string; password: string }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL;

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const name = `${body.firstName || ''} ${body.lastName || ''}`.trim() || 'User';

    // Try Odoo first if configured
    if (odooUrl) {
      try {
        const odooBody = {
          name,
          email: body.email,
          password: body.password,
        };

        const odooResponse = await fetch(`${odooUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(odooBody),
        });

        if (odooResponse.ok) {
          const data = await odooResponse.json();
          if (data.success) {
            return NextResponse.json(data);
          }
        }
      } catch {
        // Fall through to demo mode
      }
    }

    // Demo mode - store user locally
    if (demoUsers.has(body.email)) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    const userId = Date.now();
    const user = {
      id: userId,
      name,
      email: body.email,
      password: body.password, // In production, this would be hashed
    };

    demoUsers.set(body.email, user);

    // Store demo users in a cookie for persistence across requests
    const cookieStore = await cookies();
    const existingUsers = cookieStore.get('demo_users')?.value;
    const users = existingUsers ? JSON.parse(existingUsers) : {};
    users[body.email] = user;

    cookieStore.set('demo_users', JSON.stringify(users), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful! You can now log in.',
      data: {
        user: {
          id: userId,
          name,
          email: body.email,
        },
      },
    });
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
