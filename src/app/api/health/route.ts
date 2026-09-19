import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Quick database connectivity probe
    await prisma.profile.count();

    return NextResponse.json({
      status: 'healthy',
      service: 'ProtoTech Intelli',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: err.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
