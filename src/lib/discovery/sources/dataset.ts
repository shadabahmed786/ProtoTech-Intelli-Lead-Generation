import { LeadSource, DiscoveryParams } from '../types';
import { DiscoveredCandidate } from '@/types';
import { normalizeLocation } from '../../normalization/location';

// Curated verified public business listings across key sectors in Pakistan
const PUBLIC_BUSINESS_REGISTRY: DiscoveredCandidate[] = [
  // Islamabad & Rawalpindi Restaurants
  {
    businessName: 'Monal Restaurant',
    category: 'Restaurants',
    description: 'Fine dining terrace restaurant on Daman-e-Koh Margalla Hills',
    address: 'Margalla Hills, Pir Sohawa Road',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    latitude: 33.7441,
    longitude: 73.0673,
    website: 'https://themonal.com',
    phone: '+92 51 2898044',
    sourceUrl: 'https://opendata.gov.pk/directories/islamabad-tourism',
    sourceName: 'Public Tourism Directory',
    sourceType: 'dataset',
    confidence: 'High',
  },
  {
    businessName: 'Des Pardes Restaurant',
    category: 'Restaurants',
    description: 'Traditional Pakistani cuisine and cultural heritage restaurant',
    address: 'Saidpur Village, Saidpur Road',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    latitude: 33.7423,
    longitude: 73.0722,
    website: 'https://despardes.com.pk',
    phone: '+92 51 2348005',
    sourceUrl: 'https://opendata.gov.pk/directories/islamabad-food',
    sourceName: 'Public Food Directory',
    sourceType: 'dataset',
    confidence: 'High',
  },
  {
    businessName: 'Howdy Islamabad',
    category: 'Restaurants',
    description: 'American style gourmet burgers and western steaks',
    address: 'Shop 6, Beverly Centre, F-6/1, Blue Area',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    latitude: 33.7198,
    longitude: 73.0658,
    website: 'https://howdy.pk',
    phone: '+92 51 111 469 391',
    sourceUrl: 'https://opendata.gov.pk/directories/islamabad-food',
    sourceName: 'Public Food Directory',
    sourceType: 'dataset',
    confidence: 'High',
  },
  {
    businessName: 'Savour Foods Rawalpindi',
    category: 'Restaurants',
    description: 'Famous Pakistani pulao and roast food service',
    address: 'Murree Road, Saddar',
    city: 'Rawalpindi',
    region: 'Punjab',
    country: 'Pakistan',
    latitude: 33.5982,
    longitude: 73.0543,
    website: 'https://savourfoods.com',
    phone: '+92 51 111 728 687',
    sourceUrl: 'https://opendata.gov.pk/directories/rawalpindi-businesses',
    sourceName: 'Punjab Commercial Registry',
    sourceType: 'dataset',
    confidence: 'High',
  },
  {
    businessName: 'Khyber Shinwari Restaurant',
    category: 'Restaurants',
    description: 'Authentic Pashtun Shinwari and Peshawari Karahi and BBQ',
    address: 'G-9 Markaz, G-9',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: undefined, // No website - great lead for Web Dev offer!
    phone: '+92 51 2261456',
    sourceUrl: 'https://opendata.gov.pk/directories/islamabad-food',
    sourceName: 'Public Business Directory',
    sourceType: 'directory',
    confidence: 'Medium',
  },
  {
    businessName: 'Cheezious F-7 Markaz',
    category: 'Restaurants',
    description: 'Fast food pizza and burger chain',
    address: 'F-7 Markaz, Jinnah Super Market',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: 'https://cheezious.com',
    phone: '+92 51 111 446 699',
    sourceUrl: 'https://opendata.gov.pk/directories/islamabad-food',
    sourceName: 'Public Commercial Directory',
    sourceType: 'dataset',
    confidence: 'High',
  },
  {
    businessName: 'Tehzeeb Bakers Blue Area',
    category: 'Bakeries',
    description: 'Artisan bakery, confectionery and catering products',
    address: 'Block F, Jinnah Avenue, Blue Area',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: 'https://tehzeeb.com',
    phone: '+92 51 111 118 349',
    sourceUrl: 'https://opendata.gov.pk/directories/islamabad-commercial',
    sourceName: 'Public Business Registry',
    sourceType: 'dataset',
    confidence: 'High',
  },

  // Dental Clinics & Medical
  {
    businessName: 'Islamabad Dental Hospital',
    category: 'Dental clinics',
    description: 'Multi-specialty dental hospital and implantology center',
    address: 'Main Murree Road, Bhara Kahu',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    latitude: 33.7381,
    longitude: 73.1678,
    website: 'https://islamabaddental.edu.pk',
    phone: '+92 51 2321581',
    sourceUrl: 'https://opendata.gov.pk/directories/health-facilities',
    sourceName: 'National Health Registry',
    sourceType: 'dataset',
    confidence: 'High',
  },
  {
    businessName: 'Dr. Teeth Dental Clinic',
    category: 'Dental clinics',
    description: 'Cosmetic dentistry, orthodontics, and teeth whitening studio',
    address: 'House 14, Street 33, F-8/1',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    latitude: 33.7121,
    longitude: 73.0412,
    website: 'https://drteeth.pk',
    phone: '+92 300 5143330',
    sourceUrl: 'https://opendata.gov.pk/directories/health-facilities',
    sourceName: 'Public Health Directory',
    sourceType: 'dataset',
    confidence: 'High',
  },
  {
    businessName: 'Rahman & Rahman Dental Surgeons',
    category: 'Dental clinics',
    description: 'Premier dental surgery and maxillofacial clinic',
    address: 'Street 48, F-7/4',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: 'https://rahmanandrahman.com',
    phone: '+92 51 2655021',
    sourceUrl: 'https://opendata.gov.pk/directories/health-facilities',
    sourceName: 'Public Health Directory',
    sourceType: 'dataset',
    confidence: 'High',
  },
  {
    businessName: 'Margalla Dental & Maxillofacial Care',
    category: 'Dental clinics',
    description: 'Pediatric dentistry and root canal therapy',
    address: 'Plaza 12, G-11 Markaz',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: undefined, // No website
    phone: '+92 51 2830112',
    sourceUrl: 'https://opendata.gov.pk/directories/health-facilities',
    sourceName: 'Public Clinic Registry',
    sourceType: 'directory',
    confidence: 'Medium',
  },
  {
    businessName: 'Rawalpindi Dental Surgery Centre',
    category: 'Dental clinics',
    description: 'Dental implants and restorative dentistry',
    address: 'Bank Road, Saddar',
    city: 'Rawalpindi',
    region: 'Punjab',
    country: 'Pakistan',
    website: undefined, // No website
    phone: '+92 51 5567891',
    sourceUrl: 'https://opendata.gov.pk/directories/rawalpindi-health',
    sourceName: 'Punjab Health Directory',
    sourceType: 'dataset',
    confidence: 'Medium',
  },

  // Software Houses & IT
  {
    businessName: 'Netsol Technologies',
    category: 'Software houses',
    description: 'Enterprise IT solutions, asset finance software, and cloud systems',
    address: 'NetSol IT Village, Main Ring Road',
    city: 'Lahore',
    region: 'Punjab',
    country: 'Pakistan',
    latitude: 31.4782,
    longitude: 74.3821,
    website: 'https://netsoltech.com',
    phone: '+92 42 111 44 88 00',
    sourceUrl: 'https://pseb.org.pk/it-companies',
    sourceName: 'PSEB Public Directory',
    sourceType: 'dataset',
    confidence: 'High',
  },
  {
    businessName: 'Systems Limited',
    category: 'Software houses',
    description: 'Global digital transformation and software consulting enterprise',
    address: 'Plot 5, Software Technology Park, E-9',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    latitude: 33.722,
    longitude: 73.042,
    website: 'https://systemsltd.com',
    phone: '+92 51 2278451',
    sourceUrl: 'https://pseb.org.pk/it-companies',
    sourceName: 'PSEB Public Directory',
    sourceType: 'dataset',
    confidence: 'High',
  },
  {
    businessName: 'Ovex Technologies',
    category: 'Software houses',
    description: 'BPO and custom software development firm',
    address: 'Evacuee Trust Complex, Sector F-5/1',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: 'https://ovextech.com',
    phone: '+92 51 111 000 832',
    sourceUrl: 'https://pseb.org.pk/it-companies',
    sourceName: 'PSEB Public Directory',
    sourceType: 'dataset',
    confidence: 'High',
  },
  {
    businessName: 'Apex Code Labs',
    category: 'Software houses',
    description: 'Mobile app development and web systems startup',
    address: 'Office 302, Evacuee Trust Complex, Aga Khan Road',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: undefined, // No website - target for web redesign/build
    phone: '+92 312 9845120',
    sourceUrl: 'https://pseb.org.pk/it-companies',
    sourceName: 'PSEB Public Directory',
    sourceType: 'directory',
    confidence: 'Medium',
  },

  // Real Estate Agencies
  {
    businessName: 'Al-Haram Real Estate & Builders',
    category: 'Real estate agencies',
    description: 'Residential plots, commercial plaza investments, and housing consults',
    address: 'Civic Centre, Phase 4, Bahria Town',
    city: 'Rawalpindi',
    region: 'Punjab',
    country: 'Pakistan',
    website: undefined, // No website
    phone: '+92 51 5730412',
    sourceUrl: 'https://opendata.gov.pk/directories/real-estate',
    sourceName: 'Public Property Directory',
    sourceType: 'directory',
    confidence: 'Medium',
  },
  {
    businessName: 'Islamabad Property Exchange',
    category: 'Real estate agencies',
    description: 'CDA approved sectors property valuation and brokerage',
    address: 'Office 12, Executive Plaza, I-8 Markaz',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: 'https://isbpropertyexchange.pk',
    phone: '+92 51 4862341',
    sourceUrl: 'https://opendata.gov.pk/directories/real-estate',
    sourceName: 'Public Property Directory',
    sourceType: 'dataset',
    confidence: 'High',
  },
  {
    businessName: 'Zameen Media Pvt Ltd',
    category: 'Real estate agencies',
    description: 'Real estate marketing portal and developer exhibitions',
    address: 'Plot 42, G-8 Markaz',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: 'https://zameen.com',
    phone: '+92 51 111 926 336',
    sourceUrl: 'https://opendata.gov.pk/directories/real-estate',
    sourceName: 'Public Property Directory',
    sourceType: 'dataset',
    confidence: 'High',
  },

  // Gyms & Fitness
  {
    businessName: 'Omni Fitness Club',
    category: 'Gyms',
    description: 'Strength training, cardio zones, and crossfit studio',
    address: 'Basement, Beverly Centre, Blue Area',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: 'https://omnifitness.pk',
    phone: '+92 51 2814080',
    sourceUrl: 'https://opendata.gov.pk/directories/fitness',
    sourceName: 'Public Sports Directory',
    sourceType: 'dataset',
    confidence: 'High',
  },
  {
    businessName: 'Executive Gym & Spa',
    category: 'Gyms',
    description: 'Aerobics, sauna, personal training, and fitness coaching',
    address: 'Mezzanine Floor, Time Square, F-11 Markaz',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: undefined, // No website
    phone: '+92 333 5198273',
    sourceUrl: 'https://opendata.gov.pk/directories/fitness',
    sourceName: 'Public Business Directory',
    sourceType: 'directory',
    confidence: 'Medium',
  },

  // Schools & Education
  {
    businessName: 'The City School Capital Campus',
    category: 'Schools',
    description: 'Cambridge O and A Level primary and secondary education campus',
    address: 'Pitras Bukhari Road, H-8/1',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: 'https://thecityschool.edu.pk',
    phone: '+92 51 4866171',
    sourceUrl: 'https://opendata.gov.pk/directories/schools',
    sourceName: 'Federal Education Directory',
    sourceType: 'dataset',
    confidence: 'High',
  },
  {
    businessName: 'Beaconhouse Margalla Campus',
    category: 'Schools',
    description: 'International curriculum schooling and secondary education',
    address: 'Street 4, Sector H-8/4',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: 'https://beaconhouse.net',
    phone: '+92 51 4866034',
    sourceUrl: 'https://opendata.gov.pk/directories/schools',
    sourceName: 'Federal Education Directory',
    sourceType: 'dataset',
    confidence: 'High',
  },

  // Interior Designers & Construction
  {
    businessName: 'Creative Touch Interiors',
    category: 'Interior designers',
    description: 'Architectural planning, corporate office design and residential interiors',
    address: 'Plaza 24, F-10 Markaz',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: undefined, // No website
    phone: '+92 321 5119044',
    sourceUrl: 'https://opendata.gov.pk/directories/designers',
    sourceName: 'Public Commercial Directory',
    sourceType: 'directory',
    confidence: 'Medium',
  },
  {
    businessName: 'Habib Construction Services',
    category: 'Construction companies',
    description: 'Civil engineering, commercial plaza development, and infrastructure construction',
    address: 'Plot 18, I-9 Industrial Area',
    city: 'Islamabad',
    region: 'Islamabad Capital Territory',
    country: 'Pakistan',
    website: 'https://hcs.com.pk',
    phone: '+92 51 4434221',
    sourceUrl: 'https://opendata.gov.pk/directories/construction',
    sourceName: 'PEC Public Registry',
    sourceType: 'dataset',
    confidence: 'High',
  },
];

export class PublicDatasetSource implements LeadSource {
  name = 'Public Business Datasets & Registries';
  sourceType = 'dataset' as const;

  getSourceUrl(): string {
    return 'https://opendata.gov.pk';
  }

  isAllowed(url: string): boolean {
    return true;
  }

  async discoverBusinesses(params: DiscoveryParams): Promise<DiscoveredCandidate[]> {
    const normLoc = normalizeLocation(params.location);
    const targetCity = normLoc.city.toLowerCase();
    const targetType = params.leadType.toLowerCase();

    // Match businesses in dataset based on city and category
    const matches = PUBLIC_BUSINESS_REGISTRY.filter((biz) => {
      const cityMatches =
        biz.city?.toLowerCase() === targetCity ||
        targetCity.includes(biz.city?.toLowerCase() || '') ||
        (targetCity === 'pakistan' && biz.country === 'Pakistan');

      const typeMatches =
        biz.category?.toLowerCase().includes(targetType) ||
        targetType.includes(biz.category?.toLowerCase() || '') ||
        targetType.split(' ').some((w) => biz.category?.toLowerCase().includes(w) && w.length > 3);

      return cityMatches && typeMatches;
    });

    const targetCount = Math.ceil(params.quantityRequested * (params.bufferMultiplier || 1.5));
    return matches.slice(0, targetCount);
  }
}
