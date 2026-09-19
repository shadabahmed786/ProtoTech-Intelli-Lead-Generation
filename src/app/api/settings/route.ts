import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [suppressions, auditLogs, totalLeads, totalCampaigns] = await Promise.all([
      prisma.suppression.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.lead.count(),
      prisma.campaign.count(),
    ]);

    const systemConfig = {
      defaultCrawlLimit: 5,
      maxCandidatesBuffer: '1.5x',
      allowedSources: ['OpenStreetMap Overpass', 'Public Business Datasets', 'Public Web Search Directory'],
      rateLimitRequestsPerSec: 2,
      ssrfProtectionActive: true,
      paidApisCost: '$0.00',
    };

    return NextResponse.json({
      systemConfig,
      suppressions,
      auditLogs,
      stats: { totalLeads, totalCampaigns },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, value, reason } = await req.json();

    if (!type || !value) {
      return NextResponse.json({ error: 'type and value are required' }, { status: 400 });
    }

    const suppression = await prisma.suppression.upsert({
      where: { value },
      update: { reason, type },
      create: { type, value, reason },
    });

    await prisma.auditLog.create({
      data: {
        action: 'Suppression Added',
        entityType: 'Suppression',
        entityId: suppression.id,
        details: `Suppressed ${type}: ${value}`,
      },
    });

    return NextResponse.json({ suppression }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
