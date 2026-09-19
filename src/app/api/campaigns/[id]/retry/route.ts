import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    message: 'Campaign retry endpoint. Send POST request to retry.',
  });
}

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

    // Lazy load worker to prevent top-level module evaluation issues during build
    const { campaignRunner } = await import('@/lib/jobs/campaign-runner');
    campaignRunner.runCampaign(campaign.id).catch((err) => {
      console.error(`Retry error for campaign ${campaign.id}:`, err);
    });

    return NextResponse.json({ campaign });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
