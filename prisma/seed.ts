import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Seeding initial ProtoTech Intelli production configuration...');

  // 1. Primary Admin Profile
  const admin = await prisma.profile.upsert({
    where: { email: 'admin@prototech.com' },
    update: {
      name: 'ProtoTech Administrator',
      role: 'Admin',
      passwordHash: hashPassword('admin123'),
    },
    create: {
      email: 'admin@prototech.com',
      name: 'ProtoTech Administrator',
      role: 'Admin',
      passwordHash: hashPassword('admin123'),
    },
  });
  console.log(`Created primary admin account: ${admin.email}`);

  // 2. Production Offer Profiles (Deterministic Scoring Rules)
  await prisma.offerProfile.upsert({
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
      description: 'Targets businesses with missing meta descriptions, lack of heading structure, and low search visibility.',
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

  // 3. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      action: 'System Initialized',
      entityType: 'System',
      entityId: 'v1.0.0',
      details: 'ProtoTech Intelli v1.0 production environment initialized with zero-fake configuration.',
      actor: 'System',
    },
  });

  console.log('Production configuration seeded successfully. Database ready with 0 mock leads.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
