import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const city = searchParams.get('city')?.trim();
    const category = searchParams.get('category')?.trim();
    const status = searchParams.get('status')?.trim();
    const campaignId = searchParams.get('campaignId')?.trim();
    const hasWebsite = searchParams.get('hasWebsite');
    const hasEmail = searchParams.get('hasEmail');
    const hasPhone = searchParams.get('hasPhone');
    const hasWhatsapp = searchParams.get('hasWhatsapp');
    const minScore = searchParams.get('minScore');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { website: { contains: search } },
        { normalizedDomain: { contains: search } },
        { city: { contains: search } },
        { address: { contains: search } },
        { category: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (city && city !== 'All') {
      where.city = { contains: city };
    }

    if (category && category !== 'All') {
      where.category = { contains: category };
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    if (campaignId) {
      where.campaignId = campaignId;
    }

    if (hasWebsite === 'true') {
      where.website = { not: null };
    } else if (hasWebsite === 'false') {
      where.website = null;
    }

    if (hasEmail === 'true') {
      where.email = { not: null };
    }

    if (hasPhone === 'true') {
      where.phone = { not: null };
    }

    if (hasWhatsapp === 'true') {
      where.whatsapp = { not: null };
    }

    if (minScore) {
      where.opportunityScore = { gte: parseInt(minScore, 10) };
    }

    const [total, leads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { opportunityScore: 'desc' },
        include: {
          opportunities: true,
          technologies: true,
          sources: { take: 1 },
        },
      }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
