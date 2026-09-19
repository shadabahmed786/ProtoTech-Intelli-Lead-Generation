import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        offerProfile: true,
        events: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
        leads: {
          take: 50,
          orderBy: { opportunityScore: 'desc' },
          include: {
            opportunities: true,
            technologies: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        status: 'Cancelled',
        currentStage: 'Cancelled',
      },
    });

    await prisma.campaignEvent.create({
      data: {
        campaignId: params.id,
        stage: 'Cancelled',
        message: 'Campaign execution stopped by user.',
        level: 'warning',
      },
    });

    return NextResponse.json({ campaign });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
