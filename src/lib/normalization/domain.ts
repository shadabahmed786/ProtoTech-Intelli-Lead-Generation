/**
 * Normalizes website URLs into a clean domain name for deduplication.
 * e.g., "https://www.example.com/about?ref=1" -> "example.com"
 * e.g., "http://sub.company.pk/" -> "sub.company.pk"
 */
export function normalizeDomain(urlOrDomain?: string | null): string | null {
  if (!urlOrDomain) return null;

  try {
    let clean = urlOrDomain.trim().toLowerCase();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    let host = parsed.hostname;
    if (host.startsWith('www.')) {
      host = host.slice(4);
    }
    return host || null;
  } catch {
    // Fallback regex if URL parsing fails
    const match = urlOrDomain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split(/[\/?#]/)[0]
      .trim();
    return match || null;
  }
}

/**
 * Normalizes a full URL to a clean standardized HTTP/HTTPS URL
 */
export function normalizeUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;
  let clean = rawUrl.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  try {
    const parsed = new URL(clean);
    // Remove default ports and unnecessary trailing slashes
    if ((parsed.port === '80' && parsed.protocol === 'http:') || (parsed.port === '443' && parsed.protocol === 'https:')) {
      parsed.port = '';
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return clean;
  }
}
