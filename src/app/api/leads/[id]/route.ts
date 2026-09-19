import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        campaign: { select: { id: true, name: true } },
        sources: true,
        audit: true,
        technologies: true,
        opportunities: true,
        scoreBreakdown: true,
        socials: true,
        contacts: true,
        notes: { orderBy: { createdAt: 'desc' } },
        activity: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, assignedTo } = body;

    const updateData: any = {};
    const activities: any[] = [];

    if (status) {
      updateData.status = status;
      activities.push({
        action: 'Status Changed',
        details: `Status updated to ${status}`,
        actorName: 'Admin',
      });
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo;
      activities.push({
        action: 'Assigned',
        details: assignedTo ? `Lead assigned to ${assignedTo}` : 'Lead unassigned',
        actorName: 'Admin',
      });
    }

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        ...updateData,
        activity: {
          create: activities,
        },
      },
    });

    return NextResponse.json({ lead });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
