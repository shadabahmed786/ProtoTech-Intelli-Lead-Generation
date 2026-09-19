export type LeadStatus =
  | 'New'
  | 'Qualified'
  | 'Contacted'
  | 'Interested'
  | 'Not Interested'
  | 'Converted'
  | 'Disqualified'
  | 'Suppressed';

export type CampaignStatus =
  | 'Draft'
  | 'Queued'
  | 'Discovering'
  | 'Extracting'
  | 'Verifying'
  | 'Analyzing'
  | 'Scoring'
  | 'Completed'
  | 'Completed Partial'
  | 'Failed'
  | 'Cancelled';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low' | 'Unknown';

export interface DiscoveredCandidate {
  businessName: string;
  category?: string;
  description?: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  sourceUrl: string;
  sourceName: string;
  sourceType: 'osm' | 'directory' | 'web' | 'dataset';
  confidence: ConfidenceLevel;
}

export interface ScoreBreakdownItem {
  signal: string;
  points: number;
}

export interface OpportunityItem {
  type: string;
  description: string;
  evidence: string;
  confidence: ConfidenceLevel;
}

export interface TechnologyItem {
  name: string;
  evidence: string;
  confidence: ConfidenceLevel;
}

export interface WebsiteAuditResult {
  hasHttps: boolean;
  hasMobileViewport: boolean;
  pageTitle?: string;
  metaDescription?: string;
  hasHeadingH1: boolean;
  hasCta: boolean;
  hasServicesPage: boolean;
  hasContactPage: boolean;
  hasWhatsapp: boolean;
  hasSocialLinks: boolean;
  loadIndicator?: string;
  technologies: TechnologyItem[];
  opportunities: OpportunityItem[];
  socials: { platform: string; profileUrl: string }[];
  emails: string[];
  phones: string[];
  whatsappNumbers: string[];
}
