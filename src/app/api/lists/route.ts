import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lists = await prisma.leadList.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            lead: {
              select: {
                id: true,
                businessName: true,
                city: true,
                opportunityScore: true,
                status: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ lists });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, color = '#00E5FF', leadIds = [] } = body;

    if (!name) {
      return NextResponse.json({ error: 'List name is required' }, { status: 400 });
    }

    const list = await prisma.leadList.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color,
        items: {
          create: leadIds.map((id: string) => ({
            leadId: id,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ list }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
