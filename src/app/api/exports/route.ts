import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateCsv, LeadExportRow } from '@/lib/exports/csv';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const exports = await prisma.export.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ exports });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, leadIds, filters } = body;

    const where: any = {};
    if (campaignId) where.campaignId = campaignId;
    if (leadIds && Array.isArray(leadIds) && leadIds.length > 0) {
      where.id = { in: leadIds };
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { opportunityScore: 'desc' },
      include: {
        sources: { take: 1 },
        socials: true,
      },
    });

    const exportRows: LeadExportRow[] = leads.map((l) => {
      const fb = l.socials.find((s) => s.platform === 'Facebook')?.profileUrl;
      const ig = l.socials.find((s) => s.platform === 'Instagram')?.profileUrl;
      const li = l.socials.find((s) => s.platform === 'LinkedIn')?.profileUrl;

      return {
        businessName: l.businessName,
        category: l.category,
        address: l.address,
        city: l.city,
        region: l.region,
        country: l.country,
        website: l.website,
        email: l.email,
        phone: l.phone,
        whatsapp: l.whatsapp,
        facebook: fb,
        instagram: ig,
        linkedin: li,
        opportunityScore: l.opportunityScore,
        qualityScore: l.qualityScore,
        status: l.status,
        sourceUrl: l.sources[0]?.sourceUrl || null,
      };
    });

    const csvContent = generateCsv(exportRows);
    const filename = `prototech-leads-${Date.now()}.csv`;

    const exportRecord = await prisma.export.create({
      data: {
        filename,
        format: 'CSV',
        rowCount: exportRows.length,
        filters: JSON.stringify(filters || {}),
      },
    });

    return NextResponse.json({
      exportRecord,
      filename,
      csvContent,
      rowCount: exportRows.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
