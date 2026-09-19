import * as cheerio from 'cheerio';
import { LeadSource, DiscoveryParams } from '../types';
import { DiscoveredCandidate } from '@/types';
import { normalizeLocation } from '../../normalization/location';

export class PublicDirectorySource implements LeadSource {
  name = 'Public Web Directory & Search';
  sourceType = 'directory' as const;

  getSourceUrl(): string {
    return 'https://html.duckduckgo.com/html';
  }

  isAllowed(url: string): boolean {
    return url.startsWith('https://html.duckduckgo.com');
  }

  /**
   * Generates multiple search query patterns according to Rule 10
   */
  generateQueries(leadType: string, location: string): string[] {
    const norm = normalizeLocation(location);
    const city = norm.city;
    return [
      `${leadType} in ${city} Pakistan contact`,
      `best ${leadType} ${city}`,
      `${leadType} ${city} phone website`,
      `${city} ${leadType} directory`,
    ];
  }

  async discoverBusinesses(params: DiscoveryParams): Promise<DiscoveredCandidate[]> {
    const queries = this.generateQueries(params.leadType, params.location);
    const candidates: DiscoveredCandidate[] = [];
    const targetCount = Math.ceil(params.quantityRequested * (params.bufferMultiplier || 1.5));
    const normLoc = normalizeLocation(params.location);

    for (const query of queries) {
      if (candidates.length >= targetCount) break;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch('https://html.duckduckgo.com/html/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ProtoTech-Intelli-Public-Search/1.0',
          },
          body: `q=${encodeURIComponent(query)}`,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) continue;

        const html = await res.text();
        const $ = cheerio.load(html);

        $('.result').each((_, el) => {
          if (candidates.length >= targetCount) return;

          const title = $(el).find('.result__title a').text().trim();
          const rawUrl = $(el).find('.result__url').text().trim();
          const snippet = $(el).find('.result__snippet').text().trim();

          if (!title || !rawUrl) return;

          // Clean up URL
          let fullUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
          // Exclude aggregators / generic search hubs
          const lowerUrl = fullUrl.toLowerCase();
          if (
            lowerUrl.includes('wikipedia') ||
            lowerUrl.includes('tripadvisor') ||
            lowerUrl.includes('facebook.com') ||
            lowerUrl.includes('instagram.com') ||
            lowerUrl.includes('youtube.com') ||
            lowerUrl.includes('linkedin.com')
          ) {
            return;
          }

          // Extract business name from title (remove common title suffixes like "- Home | Facebook", "Best in Islamabad", etc.)
          const cleanName = title
            .split(/[-–|:•]/)[0]
            .replace(/\b(best|top|in|islamabad|rawalpindi|lahore|karachi|pakistan)\b/gi, '')
            .trim();

          if (cleanName.length < 3) return;

          // Extract phone from snippet if present
          const phoneMatch = snippet.match(/(?:\+92|03\d{2}|051|042)[-\s]?\d{7,8}/);

          candidates.push({
            businessName: cleanName,
            category: params.leadType,
            description: snippet,
            city: normLoc.city,
            region: normLoc.region,
            country: normLoc.country,
            website: fullUrl,
            phone: phoneMatch ? phoneMatch[0] : undefined,
            sourceUrl: fullUrl,
            sourceName: 'Public Web Search Directory',
            sourceType: 'directory',
            confidence: 'Medium',
          });
        });
      } catch {
        // Continue if search query times out
      }

      // Small delay between query patterns
      await new Promise((r) => setTimeout(r, 600));
    }

    return candidates;
  }
}
