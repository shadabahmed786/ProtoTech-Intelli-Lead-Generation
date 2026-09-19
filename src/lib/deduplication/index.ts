import { normalizeDomain } from '../normalization/domain';
import { normalizePhone } from '../normalization/phone';

export interface DeduplicationCandidate {
  businessName: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  address?: string | null;
}

export interface ExistingLeadRecord {
  id: string;
  businessName: string;
  normalizedDomain?: string | null;
  normalizedPhone?: string | null;
  city?: string | null;
  address?: string | null;
}

export interface SuppressionRecord {
  type: string; // domain, phone, email, name
  value: string;
}

export interface DeduplicationResult {
  isDuplicate: boolean;
  duplicateOfId?: string;
  reason?: string;
  isSuppressed: boolean;
  suppressionReason?: string;
  isBranch?: boolean;
}

/**
 * Normalizes text for loose comparison
 */
function cleanText(text?: string | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Checks candidate against existing leads and suppression rules
 */
export function checkDeduplication(
  candidate: DeduplicationCandidate,
  existingLeads: ExistingLeadRecord[],
  suppressionList: SuppressionRecord[]
): DeduplicationResult {
  const normDomain = normalizeDomain(candidate.website);
  const normPhone = normalizePhone(candidate.phone).e164;
  const cleanName = cleanText(candidate.businessName);
  const cleanCity = cleanText(candidate.city);
  const cleanEmail = candidate.email?.toLowerCase().trim();

  // 1. Suppression Check
  for (const s of suppressionList) {
    const sVal = s.value.toLowerCase().trim();
    if (s.type === 'domain' && normDomain && normDomain === sVal) {
      return { isDuplicate: false, isSuppressed: true, suppressionReason: `Domain suppressed: ${normDomain}` };
    }
    if (s.type === 'phone' && normPhone && normPhone === sVal) {
      return { isDuplicate: false, isSuppressed: true, suppressionReason: `Phone suppressed: ${normPhone}` };
    }
    if (s.type === 'email' && cleanEmail && cleanEmail === sVal) {
      return { isDuplicate: false, isSuppressed: true, suppressionReason: `Email suppressed: ${cleanEmail}` };
    }
    if (s.type === 'name' && cleanName && cleanText(sVal) === cleanName) {
      return { isDuplicate: false, isSuppressed: true, suppressionReason: `Business identity suppressed: ${s.value}` };
    }
  }

  // 2. Existing Leads Deduplication
  for (const existing of existingLeads) {
    // Primary: Normalized domain match
    if (normDomain && existing.normalizedDomain && normDomain === existing.normalizedDomain) {
      // Check if different city indicates a branch
      if (cleanCity && cleanText(existing.city) && cleanCity !== cleanText(existing.city)) {
        return {
          isDuplicate: false,
          isBranch: true,
          reason: `Branch detected: same domain (${normDomain}) in different city (${candidate.city} vs ${existing.city})`,
          isSuppressed: false,
        };
      }
      return {
        isDuplicate: true,
        duplicateOfId: existing.id,
        reason: `Duplicate domain: ${normDomain}`,
        isSuppressed: false,
      };
    }

    // Secondary: Normalized phone match
    if (normPhone && existing.normalizedPhone && normPhone === existing.normalizedPhone) {
      return {
        isDuplicate: true,
        duplicateOfId: existing.id,
        reason: `Duplicate phone: ${normPhone}`,
        isSuppressed: false,
      };
    }

    // Additional: Normalized business name + city match
    const existingCleanName = cleanText(existing.businessName);
    const existingCleanCity = cleanText(existing.city);

    if (cleanName && existingCleanName && cleanName === existingCleanName) {
      if (cleanCity && existingCleanCity && cleanCity === existingCleanCity) {
        return {
          isDuplicate: true,
          duplicateOfId: existing.id,
          reason: `Duplicate business name and city: ${candidate.businessName} in ${candidate.city}`,
          isSuppressed: false,
        };
      }
    }
  }

  return { isDuplicate: false, isSuppressed: false };
}
