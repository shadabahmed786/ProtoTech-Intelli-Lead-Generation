import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        offerProfile: {
          select: { name: true },
        },
      },
    });
    return NextResponse.json({ campaigns });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      leadType,
      location,
      quantityRequested,
      offerProfileId,
      name,
    } = body;

    if (!leadType || !location || !quantityRequested) {
      return NextResponse.json(
        { error: 'leadType, location, and quantityRequested are required fields.' },
        { status: 400 }
      );
    }

    const campaignName =
      name || `${location} ${leadType} — Lead Discovery`;

    const campaign = await prisma.campaign.create({
      data: {
        name: campaignName,
        leadType: leadType.trim(),
        location: location.trim(),
        quantityRequested: Number(quantityRequested) || 20,
        offerProfileId: offerProfileId || null,
        status: 'Queued',
        currentStage: 'Queued',
        progressPercent: 0,
        jobs: {
          create: {
            jobType: 'discovery_extraction_analysis',
            status: 'pending',
          },
        },
        events: {
          create: {
            stage: 'Queued',
            message: `Campaign initialized for ${quantityRequested} leads in ${location}.`,
            level: 'info',
          },
        },
      },
    });

    // Lazy load background worker asynchronously
    const { campaignRunner } = await import('@/lib/jobs/campaign-runner');
    campaignRunner.runCampaign(campaign.id).catch((err) => {
      console.error(`Background campaign ${campaign.id} failed:`, err);
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
