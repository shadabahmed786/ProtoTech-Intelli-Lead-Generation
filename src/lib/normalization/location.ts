export interface NormalizedLocation {
  city: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

const PAKISTAN_CITIES: Record<string, { city: string; region: string }> = {
  islamabad: { city: 'Islamabad', region: 'Islamabad Capital Territory' },
  isb: { city: 'Islamabad', region: 'Islamabad Capital Territory' },
  rawalpindi: { city: 'Rawalpindi', region: 'Punjab' },
  rwp: { city: 'Rawalpindi', region: 'Punjab' },
  lahore: { city: 'Lahore', region: 'Punjab' },
  lhr: { city: 'Lahore', region: 'Punjab' },
  karachi: { city: 'Karachi', region: 'Sindh' },
  khi: { city: 'Karachi', region: 'Sindh' },
  peshawar: { city: 'Peshawar', region: 'Khyber Pakhtunkhwa' },
  abbottabad: { city: 'Abbottabad', region: 'Khyber Pakhtunkhwa' },
  haripur: { city: 'Haripur', region: 'Khyber Pakhtunkhwa' },
  faisalabad: { city: 'Faisalabad', region: 'Punjab' },
  multan: { city: 'Multan', region: 'Punjab' },
  gujranwala: { city: 'Gujranwala', region: 'Punjab' },
  sialkot: { city: 'Sialkot', region: 'Punjab' },
  quetta: { city: 'Quetta', region: 'Balochistan' },
  hyderabad: { city: 'Hyderabad', region: 'Sindh' },
  sukkur: { city: 'Sukkur', region: 'Sindh' },
  bahawalpur: { city: 'Bahawalpur', region: 'Punjab' },
  sargodha: { city: 'Sargodha', region: 'Punjab' },
};

/**
 * Normalizes input location string into clean city, region, and country.
 * e.g., "ISB" -> { city: "Islamabad", region: "Islamabad Capital Territory", country: "Pakistan" }
 * e.g., "Rawalpindi, Punjab" -> { city: "Rawalpindi", region: "Punjab", country: "Pakistan" }
 * e.g., "London, UK" -> { city: "London", region: undefined, country: "United Kingdom" }
 */
export function normalizeLocation(raw: string): NormalizedLocation {
  if (!raw || typeof raw !== 'string') {
    return { city: 'Unknown', country: 'Pakistan' };
  }

  const clean = raw.trim().toLowerCase();
  // Remove trailing commas and extra spaces
  const parts = clean.split(/[,–-]/).map((p) => p.trim());
  const firstPart = parts[0];

  // Match Pakistan dictionary
  if (PAKISTAN_CITIES[firstPart]) {
    const match = PAKISTAN_CITIES[firstPart];
    return {
      city: match.city,
      region: match.region,
      country: 'Pakistan',
    };
  }

  // Check if any word in raw matches
  for (const [key, val] of Object.entries(PAKISTAN_CITIES)) {
    if (clean.includes(key)) {
      return {
        city: val.city,
        region: val.region,
        country: 'Pakistan',
      };
    }
  }

  // Capitalize nicely for other cities
  const capitalized = raw
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // International detection check
  if (clean.includes('dubai') || clean.includes('uae')) {
    return { city: 'Dubai', region: 'Dubai', country: 'United Arab Emirates' };
  }
  if (clean.includes('london') || clean.includes('uk')) {
    return { city: 'London', country: 'United Kingdom' };
  }
  if (clean.includes('new york') || clean.includes('usa')) {
    return { city: 'New York', region: 'NY', country: 'United States' };
  }
  if (clean.includes('toronto') || clean.includes('canada')) {
    return { city: 'Toronto', region: 'ON', country: 'Canada' };
  }

  return {
    city: capitalized,
    country: clean.includes('pakistan') || clean.includes('pk') ? 'Pakistan' : 'International',
  };
}
