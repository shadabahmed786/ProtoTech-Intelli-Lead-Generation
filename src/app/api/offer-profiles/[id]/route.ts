import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await prisma.offerProfile.findUnique({
      where: { id: params.id },
    });
    if (!profile) {
      return NextResponse.json({ error: 'Offer Profile not found' }, { status: 404 });
    }
    return NextResponse.json({ profile });
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
    const { name, description, targetIndustries, targetLocations, signalWeights } = body;

    const data: any = {};
    if (name) data.name = name.trim();
    if (description !== undefined) data.description = description ? description.trim() : null;
    if (targetIndustries) data.targetIndustries = JSON.stringify(targetIndustries);
    if (targetLocations) data.targetLocations = JSON.stringify(targetLocations);
    if (signalWeights) data.signalWeights = JSON.stringify(signalWeights);

    const profile = await prisma.offerProfile.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.offerProfile.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: 'Offer Profile deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
