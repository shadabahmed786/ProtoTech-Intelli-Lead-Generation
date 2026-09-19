import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profiles = await prisma.offerProfile.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ profiles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, targetIndustries, targetLocations, signalWeights } = body;

    if (!name) {
      return NextResponse.json({ error: 'Profile name is required' }, { status: 400 });
    }

    const profile = await prisma.offerProfile.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        targetIndustries: JSON.stringify(targetIndustries || []),
        targetLocations: JSON.stringify(targetLocations || []),
        signalWeights: JSON.stringify(signalWeights || {}),
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
