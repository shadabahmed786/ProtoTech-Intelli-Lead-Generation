import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      totalLeads,
      qualifiedLeads,
      activeCampaigns,
      highOpportunityLeads,
      recentCampaigns,
      recentLeads,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'Qualified' } }),
      prisma.campaign.count({
        where: {
          status: { in: ['Queued', 'Discovering', 'Extracting', 'Verifying', 'Analyzing', 'Scoring'] },
        },
      }),
      prisma.lead.count({ where: { opportunityScore: { gte: 80 } } }),
      prisma.campaign.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          opportunities: true,
          technologies: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalLeads,
      qualifiedLeads,
      activeCampaigns,
      highOpportunityLeads,
      recentCampaigns,
      recentLeads,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
