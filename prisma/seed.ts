import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial ProtoTech Intelli data...');

  // 1. Admin Profile
  const admin = await prisma.profile.upsert({
    where: { email: 'admin@prototech.com' },
    update: {},
    create: {
      email: 'admin@prototech.com',
      name: 'John Doe',
      role: 'Admin',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    },
  });

  // 2. Offer Profiles
  const webDevProfile = await prisma.offerProfile.upsert({
    where: { id: 'web-dev-profile' },
    update: {},
    create: {
      id: 'web-dev-profile',
      name: 'Website Development',
      description: 'Finds businesses with no website, outdated websites, missing mobile viewport, or missing WhatsApp CTA.',
      targetIndustries: JSON.stringify(['Restaurants', 'Real estate agencies', 'Dental clinics', 'Schools', 'Gyms', 'Interior designers']),
      targetLocations: JSON.stringify(['Pakistan', 'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Peshawar', 'Abbottabad']),
      signalWeights: JSON.stringify({
        no_website: 25,
        outdated_website: 20,
        missing_mobile_viewport: 15,
        no_https: 15,
        missing_contact_cta: 10,
        missing_whatsapp: 10,
        weak_seo: 10,
        missing_social_links: 5,
        relevant_industry: 5,
        relevant_location: 5,
      }),
      isDefault: true,
    },
  });

  await prisma.offerProfile.upsert({
    where: { id: 'seo-profile' },
    update: {},
    create: {
      id: 'seo-profile',
      name: 'SEO Services',
      description: 'Targets businesses with missing meta descriptions, lack of heading structure, and low visibility.',
      targetIndustries: JSON.stringify(['Software houses', 'E-commerce businesses', 'Real estate agencies', 'Dental clinics']),
      targetLocations: JSON.stringify(['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi']),
      signalWeights: JSON.stringify({
        weak_seo: 30,
        missing_social_links: 20,
        missing_mobile_viewport: 15,
        no_https: 15,
        relevant_industry: 10,
        relevant_location: 10,
      }),
      isDefault: false,
    },
  });

  await prisma.offerProfile.upsert({
    where: { id: 'ai-automation-profile' },
    update: {},
    create: {
      id: 'ai-automation-profile',
      name: 'AI Automation & CRM',
      description: 'Identifies service businesses needing automated WhatsApp booking and CRM lead capture.',
      targetIndustries: JSON.stringify(['Clinics', 'Real estate agencies', 'Wedding vendors', 'Software houses']),
      targetLocations: JSON.stringify(['Islamabad', 'Lahore', 'Karachi']),
      signalWeights: JSON.stringify({
        missing_whatsapp: 25,
        missing_contact_cta: 25,
        relevant_industry: 25,
        relevant_location: 25,
      }),
      isDefault: false,
    },
  });

  // 3. Demo Campaign & Seed Leads
  const initialCampaign = await prisma.campaign.create({
    data: {
      name: 'Islamabad High Opportunity Restaurants & Clinics',
      leadType: 'Restaurants & Healthcare',
      location: 'Islamabad',
      quantityRequested: 5,
      offerProfileId: webDevProfile.id,
      status: 'Completed',
      currentStage: 'Completed',
      progressPercent: 100,
      discoveredCount: 7,
      validCount: 5,
      duplicatesCount: 1,
      rejectedCount: 1,
      finalLeadsCount: 5,
      completedAt: new Date(),
    },
  });

  // Lead 1: Grand View Restaurant (matches the UI mockup card!)
  const lead1 = await prisma.lead.create({
    data: {
      campaignId: initialCampaign.id,
      businessName: 'Grand View Restaurant',
      category: 'Restaurant',
      description: 'Fine dining terrace restaurant overlooking Islamabad hills',
      address: 'Margalla Hills, Pir Sohawa Road',
      city: 'Islamabad',
      region: 'Islamabad Capital Territory',
      country: 'Pakistan',
      website: 'https://www.grandview.pk',
      email: 'info@grandview.pk',
      phone: '+92 51 2345678',
      whatsapp: '+92 300 1234567',
      normalizedDomain: 'grandview.pk',
      normalizedPhone: '+92512345678',
      opportunityScore: 92,
      qualityScore: 95,
      status: 'Qualified',
      sources: {
        create: {
          sourceName: 'Official Website & Directory',
          sourceType: 'web',
          sourceUrl: 'https://www.grandview.pk',
          confidence: 'High',
        },
      },
      audit: {
        create: {
          hasHttps: true,
          hasMobileViewport: false,
          pageTitle: 'Grand View Restaurant - Islamabad',
          metaDescription: 'Experience panoramic dining over Islamabad',
          hasHeadingH1: true,
          hasCta: false,
          hasServicesPage: true,
          hasContactPage: true,
          hasWhatsapp: false,
          hasSocialLinks: true,
        },
      },
      technologies: {
        create: [
          {
            technology: 'WordPress',
            evidence: 'wp-content/ detected in page assets',
            confidence: 'High',
          },
        ],
      },
      opportunities: {
        create: [
          {
            opportunityType: 'outdated_website',
            description: 'Legacy theme and layout requires modern redesign.',
            evidence: 'Outdated jQuery sliders and missing responsive viewport meta',
            confidence: 'High',
          },
          {
            opportunityType: 'missing_whatsapp',
            description: 'No quick WhatsApp table reservation link detected.',
            evidence: 'No wa.me or WhatsApp links present across navigation',
            confidence: 'Medium',
          },
        ],
      },
      scoreBreakdown: {
        create: [
          { signal: 'Outdated website signals', points: 20 },
          { signal: 'Missing mobile viewport tag', points: 15 },
          { signal: 'Missing contact CTA', points: 10 },
          { signal: 'Missing WhatsApp', points: 10 },
          { signal: 'Target industry match for offer profile', points: 5 },
          { signal: 'Target geography match', points: 5 },
        ],
      },
      socials: {
        create: [
          { platform: 'Facebook', profileUrl: 'https://facebook.com/grandviewrestaurant' },
          { platform: 'Instagram', profileUrl: 'https://instagram.com/grandviewisb' },
          { platform: 'LinkedIn', profileUrl: 'https://linkedin.com/company/grandview-pk' },
        ],
      },
    },
  });

  // Lead 2: Tech Solutions Rawalpindi
  await prisma.lead.create({
    data: {
      campaignId: initialCampaign.id,
      businessName: 'Tech Solutions',
      category: 'Software houses',
      address: 'Murree Road, Saddar',
      city: 'Rawalpindi',
      region: 'Punjab',
      country: 'Pakistan',
      website: 'https://techsolutions.com.pk',
      email: 'contact@techsolutions.com.pk',
      phone: '+92 51 5567812',
      opportunityScore: 87,
      qualityScore: 90,
      status: 'Contacted',
      sources: {
        create: {
          sourceName: 'PSEB Public Directory',
          sourceType: 'dataset',
          sourceUrl: 'https://pseb.org.pk/members',
          confidence: 'High',
        },
      },
      scoreBreakdown: {
        create: [
          { signal: 'Missing mobile viewport tag', points: 15 },
          { signal: 'Missing contact CTA', points: 10 },
          { signal: 'Missing direct WhatsApp contact', points: 10 },
          { signal: 'Target industry match for offer profile', points: 5 },
        ],
      },
    },
  });

  // Lead 3: Modern Clinic Islamabad
  await prisma.lead.create({
    data: {
      campaignId: initialCampaign.id,
      businessName: 'Modern Clinic',
      category: 'Dental clinics',
      address: 'Beverly Centre, Blue Area',
      city: 'Islamabad',
      region: 'Islamabad Capital Territory',
      country: 'Pakistan',
      website: undefined, // No website! High opportunity
      phone: '+92 51 2891234',
      opportunityScore: 78,
      qualityScore: 80,
      status: 'New',
      sources: {
        create: {
          sourceName: 'National Health Registry',
          sourceType: 'dataset',
          sourceUrl: 'https://opendata.gov.pk/health',
          confidence: 'High',
        },
      },
      opportunities: {
        create: [
          {
            opportunityType: 'no_website',
            description: 'No website found for clinic.',
            evidence: 'No domain or web presence discovered in public registries',
            confidence: 'High',
          },
        ],
      },
      scoreBreakdown: {
        create: [
          { signal: 'No website detected (Prime Web Dev Opportunity)', points: 25 },
          { signal: 'Target industry match for offer profile', points: 5 },
          { signal: 'Target geography match', points: 5 },
        ],
      },
    },
  });

  // Lead 4: Sky Properties Lahore
  await prisma.lead.create({
    data: {
      campaignId: initialCampaign.id,
      businessName: 'Sky Properties',
      category: 'Real estate agencies',
      address: 'Gulberg III, Main Boulevard',
      city: 'Lahore',
      region: 'Punjab',
      country: 'Pakistan',
      website: 'https://skyproperties.pk',
      phone: '+92 42 3578901',
      opportunityScore: 72,
      qualityScore: 85,
      status: 'Qualified',
      sources: {
        create: {
          sourceName: 'Punjab Commercial Registry',
          sourceType: 'directory',
          sourceUrl: 'https://skyproperties.pk',
          confidence: 'Medium',
        },
      },
      scoreBreakdown: {
        create: [
          { signal: 'Weak or missing SEO meta description', points: 10 },
          { signal: 'Missing direct WhatsApp contact channel', points: 10 },
          { signal: 'Target geography match', points: 5 },
        ],
      },
    },
  });

  // Lead 5: Health Plus Karachi
  await prisma.lead.create({
    data: {
      campaignId: initialCampaign.id,
      businessName: 'Health Plus',
      category: 'Clinics',
      address: 'Clifton Block 5',
      city: 'Karachi',
      region: 'Sindh',
      country: 'Pakistan',
      phone: '+92 21 3587654',
      opportunityScore: 68,
      qualityScore: 75,
      status: 'New',
      sources: {
        create: {
          sourceName: 'Public Clinic Directory',
          sourceType: 'dataset',
          sourceUrl: 'https://opendata.gov.pk/health',
          confidence: 'Medium',
        },
      },
      scoreBreakdown: {
        create: [
          { signal: 'No website detected (Prime Web Dev Opportunity)', points: 25 },
          { signal: 'Target industry match for offer profile', points: 5 },
        ],
      },
    },
  });

  // Create sample lead list
  const list = await prisma.leadList.create({
    data: {
      name: 'Islamabad High Opportunity',
      description: 'Prioritized restaurants and clinics in Islamabad ready for web redesign outreach.',
      color: '#00E5FF',
      items: {
        create: [{ leadId: lead1.id }],
      },
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
