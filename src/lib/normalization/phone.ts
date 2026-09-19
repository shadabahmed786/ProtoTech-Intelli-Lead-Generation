import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

export interface NormalizedPhoneResult {
  raw: string;
  e164?: string;
  international?: string;
  national?: string;
  country?: string;
  isValid: boolean;
  isPossible: boolean;
}

/**
 * Normalizes phone numbers into E.164 and international format.
 * Defaults to 'PK' (Pakistan) country context if no international prefix is present.
 */
export function normalizePhone(rawPhone?: string | null, defaultCountry: CountryCode = 'PK'): NormalizedPhoneResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { raw: '', isValid: false, isPossible: false };
  }

  const trimmed = rawPhone.trim();
  // Quick cleanup of common prefixes or separators
  let cleaned = trimmed.replace(/[^\d+]/g, '');

  // Handle local Pakistani prefix 03xx -> +923xx
  if (defaultCountry === 'PK' && cleaned.startsWith('0') && cleaned.length >= 10 && cleaned.length <= 11) {
    cleaned = '+92' + cleaned.slice(1);
  }

  try {
    const phoneNumber = parsePhoneNumberFromString(cleaned, defaultCountry);

    if (phoneNumber && phoneNumber.isPossible()) {
      return {
        raw: trimmed,
        e164: phoneNumber.format('E.164'),
        international: phoneNumber.formatInternational(),
        national: phoneNumber.formatNational(),
        country: phoneNumber.country,
        isValid: phoneNumber.isValid(),
        isPossible: true,
      };
    }
  } catch {
    // If libphonenumber throws, return safe fallback
  }

  // Fallback heuristic for +92
  if (cleaned.startsWith('+92') && cleaned.length >= 12) {
    return {
      raw: trimmed,
      e164: cleaned,
      international: cleaned,
      isValid: true,
      isPossible: true,
      country: 'PK',
    };
  }

  return {
    raw: trimmed,
    e164: cleaned.startsWith('+') ? cleaned : undefined,
    isValid: false,
    isPossible: false,
  };
}
