import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const list = await prisma.leadList.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            lead: {
              include: {
                opportunities: true,
                technologies: true,
              },
            },
          },
        },
      },
    });

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    return NextResponse.json({ list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Add lead to list
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    // Check if item already exists in this list
    const existing = await prisma.leadListItem.findFirst({
      where: {
        listId: params.id,
        leadId,
      },
    });

    if (existing) {
      return NextResponse.json({ item: existing, message: 'Lead already in list' });
    }

    const item = await prisma.leadListItem.create({
      data: {
        listId: params.id,
        leadId,
      },
      include: {
        lead: {
          select: { id: true, businessName: true },
        },
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Delete list or remove lead from list
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    if (leadId) {
      // Remove specific lead from list
      await prisma.leadListItem.deleteMany({
        where: {
          listId: params.id,
          leadId,
        },
      });
      return NextResponse.json({ success: true, message: 'Lead removed from list' });
    }

    // Delete entire list and its items
    await prisma.leadListItem.deleteMany({ where: { listId: params.id } });
    await prisma.leadList.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'List deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
