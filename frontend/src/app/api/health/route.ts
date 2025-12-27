import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const odooUrl = process.env.NEXT_PUBLIC_ODOO_URL || 'http://localhost:8069';
    
    let odooHealthy = false;
    try {
      const response = await fetch(`${odooUrl}/web/database/selector`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      odooHealthy = response.ok;
    } catch {
      odooHealthy = false;
    }

    const health = {
      status: odooHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      services: {
        frontend: {
          status: 'healthy',
          port: 4000,
        },
        odoo: {
          status: odooHealthy ? 'healthy' : 'unhealthy',
          url: odooUrl,
        },
      },
    };

    return NextResponse.json(health, {
      status: odooHealthy ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 500 }
    );
  }
}
