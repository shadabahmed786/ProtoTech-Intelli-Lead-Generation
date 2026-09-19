import { LeadSource, DiscoveryParams } from '../types';
import { DiscoveredCandidate } from '@/types';
import { normalizeLocation } from '../../normalization/location';

export class OpenMapSource implements LeadSource {
  name = 'OpenStreetMap Overpass API';
  sourceType = 'osm' as const;

  getSourceUrl(): string {
    return 'https://overpass-api.de/api/interpreter';
  }

  isAllowed(url: string): boolean {
    return url.startsWith('https://overpass-api.de') || url.startsWith('https://nominatim.openstreetmap.org');
  }

  private mapLeadTypeToOsmTag(leadType: string): string[] {
    const lower = leadType.toLowerCase();
    if (lower.includes('restaurant') || lower.includes('food') || lower.includes('cafe')) {
      return ['["amenity"="restaurant"]', '["amenity"="cafe"]', '["amenity"="fast_food"]'];
    }
    if (lower.includes('dentist') || lower.includes('dental')) {
      return ['["amenity"="dentist"]', '["healthcare"="dentist"]'];
    }
    if (lower.includes('clinic') || lower.includes('hospital') || lower.includes('doctor')) {
      return ['["amenity"="clinic"]', '["amenity"="hospital"]', '["healthcare"="centre"]'];
    }
    if (lower.includes('gym') || lower.includes('fitness')) {
      return ['["leisure"="fitness_centre"]'];
    }
    if (lower.includes('real estate') || lower.includes('property')) {
      return ['["office"="estate_agent"]', '["office"="company"]'];
    }
    if (lower.includes('software') || lower.includes('tech') || lower.includes('it')) {
      return ['["office"="it"]', '["office"="company"]'];
    }
    if (lower.includes('school') || lower.includes('education') || lower.includes('college')) {
      return ['["amenity"="school"]', '["amenity"="college"]'];
    }
    if (lower.includes('hotel')) {
      return ['["tourism"="hotel"]'];
    }
    // Fallback: general shops or offices
    return ['["shop"]', '["office"]'];
  }

  async discoverBusinesses(params: DiscoveryParams): Promise<DiscoveredCandidate[]> {
    const normLoc = normalizeLocation(params.location);
    const cityName = normLoc.city;
    const targetCount = Math.ceil(params.quantityRequested * (params.bufferMultiplier || 1.5));
    const tagFilters = this.mapLeadTypeToOsmTag(params.leadType);

    const candidates: DiscoveredCandidate[] = [];

    for (const tag of tagFilters) {
      if (candidates.length >= targetCount) break;

      const query = `
        [out:json][timeout:15];
        area["name:en"="${cityName}"]["admin_level"]->.searchArea;
        (
          node${tag}(area.searchArea);
          way${tag}(area.searchArea);
        );
        out body ${targetCount};
      `;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'ProtoTech-Intelli-LeadGen/1.0',
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) continue;

        const data = await res.json();
        if (data && Array.isArray(data.elements)) {
          for (const el of data.elements) {
            const tags = el.tags || {};
            const businessName = tags.name || tags['name:en'] || tags['name:ur'];
            if (!businessName) continue;

            const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'];
            const website = tags.website || tags['contact:website'] || tags['url'];
            const email = tags.email || tags['contact:email'];
            const street = tags['addr:street'] || tags['addr:full'] || tags['addr:housenumber'];

            candidates.push({
              businessName: businessName.trim(),
              category: params.leadType,
              description: tags.description || `Registered ${params.leadType} in ${cityName}`,
              address: street ? `${street}, ${cityName}` : `${cityName}, Pakistan`,
              city: cityName,
              region: normLoc.region,
              country: normLoc.country,
              latitude: el.lat || el.center?.lat,
              longitude: el.lon || el.center?.lon,
              website: website || undefined,
              phone: phone || undefined,
              email: email || undefined,
              sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
              sourceName: 'OpenStreetMap',
              sourceType: 'osm',
              confidence: 'High',
            });

            if (candidates.length >= targetCount) break;
          }
        }
      } catch {
        // Continue if Overpass query times out or fails
      }
    }

    return candidates;
  }
}
