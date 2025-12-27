/**
 * Agent 7: Security - Rate Limiting
 */

import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(ip: string): Promise<{ success: boolean }> {
  const now = Date.now();
  const limit = 100; // requests
  const interval = 60 * 1000; // 1 minute

  const tokenData = rateLimitMap.get(ip);

  if (!tokenData || now > tokenData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + interval });
    return { success: true };
  }

  if (tokenData.count >= limit) {
    return { success: false };
  }

  tokenData.count++;
  return { success: true };
}
