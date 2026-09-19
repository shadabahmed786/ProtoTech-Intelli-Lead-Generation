import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { campaignRunner } from '@/lib/jobs/campaign-runner';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        status: 'Queued',
        currentStage: 'Queued',
        errorMessage: null,
      },
    });

    await prisma.campaignEvent.create({
      data: {
        campaignId: params.id,
        stage: 'Queued',
        message: 'Campaign retried by user.',
        level: 'info',
      },
    });

    campaignRunner.runCampaign(campaign.id).catch((err) => {
      console.error(`Retry error for campaign ${campaign.id}:`, err);
    });

    return NextResponse.json({ campaign });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
