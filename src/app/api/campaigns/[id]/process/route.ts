import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    message: 'Campaign processor endpoint. Send POST to trigger pipeline progression.',
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Only process if active or queued
    if (['Completed', 'Completed Partial', 'Cancelled', 'Failed'].includes(campaign.status)) {
      return NextResponse.json({
        message: `Campaign is already in final state: ${campaign.status}`,
        status: campaign.status,
      });
    }

    const { campaignRunner } = await import('@/lib/jobs/campaign-runner');
    // Run campaign asynchronously
    campaignRunner.runCampaign(campaign.id).catch((err) => {
      console.error(`Error processing campaign ${campaign.id}:`, err);
    });

    return NextResponse.json({
      success: true,
      message: 'Campaign processing active',
      campaignId: campaign.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
