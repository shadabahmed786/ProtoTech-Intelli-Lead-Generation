import { ScoreBreakdownItem } from '@/types';

export interface OfferProfileConfig {
  id?: string;
  name: string;
  targetIndustries: string[];
  targetLocations: string[];
  signalWeights: Record<string, number>;
  exclusions?: string[];
}

export interface LeadScoringInput {
  businessName: string;
  category?: string | null;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  hasMobileViewport?: boolean;
  hasHttps?: boolean;
  hasCta?: boolean;
  hasSocialLinks?: boolean;
  metaDescription?: string | null;
  outdatedSignals?: boolean;
  opportunities?: { type: string }[];
}

export interface ScoringResult {
  opportunityScore: number;
  qualityScore: number;
  breakdown: ScoreBreakdownItem[];
}

export const DEFAULT_OFFER_PROFILE: OfferProfileConfig = {
  name: 'Website Development',
  targetIndustries: ['Restaurants', 'Real Estate', 'Clinics', 'Dental', 'Gyms', 'Schools', 'Construction', 'Vendors'],
  targetLocations: ['Pakistan', 'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Peshawar', 'Abbottabad'],
  signalWeights: {
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
  },
};

/**
 * Calculates Opportunity Score (0-100) and Quality Score (0-100) deterministically.
 */
export function calculateScores(input: LeadScoringInput, profile: OfferProfileConfig = DEFAULT_OFFER_PROFILE): ScoringResult {
  const breakdown: ScoreBreakdownItem[] = [];
  let oppScore = 0;
  const weights = profile.signalWeights || DEFAULT_OFFER_PROFILE.signalWeights;

  // Signal 1: No website
  if (!input.website) {
    const pts = weights.no_website ?? 25;
    oppScore += pts;
    breakdown.push({ signal: 'No website detected (Prime Web Dev Opportunity)', points: pts });
  } else {
    // If website exists, check audit opportunities
    if (input.outdatedSignals) {
      const pts = weights.outdated_website ?? 20;
      oppScore += pts;
      breakdown.push({ signal: 'Outdated website code structure', points: pts });
    }

    if (input.hasMobileViewport === false) {
      const pts = weights.missing_mobile_viewport ?? 15;
      oppScore += pts;
      breakdown.push({ signal: 'Missing mobile viewport tag', points: pts });
    }

    if (input.hasHttps === false) {
      const pts = weights.no_https ?? 15;
      oppScore += pts;
      breakdown.push({ signal: 'Insecure HTTP protocol (No SSL)', points: pts });
    }

    if (input.hasCta === false) {
      const pts = weights.missing_contact_cta ?? 10;
      oppScore += pts;
      breakdown.push({ signal: 'Missing conversion call-to-action (CTA)', points: pts });
    }

    if (!input.whatsapp) {
      const pts = weights.missing_whatsapp ?? 10;
      oppScore += pts;
      breakdown.push({ signal: 'Missing direct WhatsApp contact channel', points: pts });
    }

    if (!input.metaDescription || input.metaDescription.length < 20) {
      const pts = weights.weak_seo ?? 10;
      oppScore += pts;
      breakdown.push({ signal: 'Weak or missing SEO meta description', points: pts });
    }

    if (input.hasSocialLinks === false) {
      const pts = weights.missing_social_links ?? 5;
      oppScore += pts;
      breakdown.push({ signal: 'No public social media profiles linked', points: pts });
    }
  }

  // Check Opportunity Items list for any matching signals
  if (input.opportunities && input.opportunities.length > 0) {
    for (const opp of input.opportunities) {
      if (opp.type === 'missing_whatsapp' && !breakdown.some((b) => b.signal.includes('WhatsApp'))) {
        const pts = weights.missing_whatsapp ?? 10;
        oppScore += pts;
        breakdown.push({ signal: 'Missing direct WhatsApp link', points: pts });
      }
    }
  }

  // Industry Relevance
  const categoryStr = (input.category || '').toLowerCase();
  const isTargetIndustry = profile.targetIndustries.some((ind) => categoryStr.includes(ind.toLowerCase()));
  if (isTargetIndustry) {
    const pts = weights.relevant_industry ?? 5;
    oppScore += pts;
    breakdown.push({ signal: 'Target industry match for offer profile', points: pts });
  }

  // Location Relevance
  const locationStr = `${input.city || ''} ${input.location || ''} ${input.country || ''}`.toLowerCase();
  const isTargetLocation = profile.targetLocations.some((loc) => locationStr.includes(loc.toLowerCase()));
  if (isTargetLocation) {
    const pts = weights.relevant_location ?? 5;
    oppScore += pts;
    breakdown.push({ signal: 'Target geography match', points: pts });
  }

  // Clamp Opportunity Score to 100
  const finalOpportunityScore = Math.min(100, Math.max(0, oppScore));

  // Calculate Data Quality Score (0-100) based on record completeness
  let quality = 0;
  if (input.businessName && input.businessName.trim().length > 1) quality += 20; // Valid name
  if (input.phone) quality += 20; // Valid phone
  if (input.city || input.location) quality += 20; // Clear location
  if (input.website || input.email) quality += 25; // Contact domain/email
  if (input.category) quality += 15; // Category identified

  const finalQualityScore = Math.min(100, Math.max(0, quality));

  return {
    opportunityScore: finalOpportunityScore,
    qualityScore: finalQualityScore,
    breakdown,
  };
}
