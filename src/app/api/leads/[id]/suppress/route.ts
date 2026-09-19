import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reason = 'User requested suppression' } = await req.json();

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Update lead status to Suppressed
    await prisma.lead.update({
      where: { id: params.id },
      data: {
        status: 'Suppressed',
        activity: {
          create: {
            action: 'Suppressed',
            details: `Lead suppressed from future campaigns. Reason: ${reason}`,
            actorName: 'Admin',
          },
        },
      },
    });

    // Add to suppression list based on domain, phone, or name
    if (lead.normalizedDomain) {
      await prisma.suppression.upsert({
        where: { value: lead.normalizedDomain },
        update: { reason },
        create: {
          type: 'domain',
          value: lead.normalizedDomain,
          reason,
        },
      });
    }

    if (lead.normalizedPhone) {
      await prisma.suppression.upsert({
        where: { value: lead.normalizedPhone },
        update: { reason },
        create: {
          type: 'phone',
          value: lead.normalizedPhone,
          reason,
        },
      });
    }

    await prisma.suppression.upsert({
      where: { value: lead.businessName },
      update: { reason },
      create: {
        type: 'name',
        value: lead.businessName,
        reason,
      },
    });

    return NextResponse.json({ success: true, message: 'Lead successfully suppressed' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
