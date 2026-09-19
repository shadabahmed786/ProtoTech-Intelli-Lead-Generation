import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalLeads,
      qualifiedLeads,
      activeCampaigns,
      highOpportunityLeads,
      leadsLast7Days,
      qualifiedLast7Days,
      highOppLast7Days,
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
      prisma.lead.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.lead.count({ where: { status: 'Qualified', createdAt: { gte: sevenDaysAgo } } }),
      prisma.lead.count({ where: { opportunityScore: { gte: 80 }, createdAt: { gte: sevenDaysAgo } } }),
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
      trends: {
        leadsLast7Days,
        qualifiedLast7Days,
        highOppLast7Days,
      },
      recentCampaigns,
      recentLeads,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
