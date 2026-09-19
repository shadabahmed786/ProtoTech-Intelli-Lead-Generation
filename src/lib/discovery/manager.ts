import { LeadSource, DiscoveryParams } from './types';
import { DiscoveredCandidate } from '@/types';
import { OpenMapSource } from './sources/osm';
import { PublicDatasetSource } from './sources/dataset';
import { PublicDirectorySource } from './sources/directory';
import { normalizeDomain } from '../normalization/domain';

export class DiscoveryEngine {
  private sources: LeadSource[] = [];

  constructor() {
    // Register sources in priority order (Rule 71)
    this.sources = [
      new OpenMapSource(),
      new PublicDatasetSource(),
      new PublicDirectorySource(),
    ];
  }

  /**
   * Register a custom source (e.g. for future adapters)
   */
  registerSource(source: LeadSource): void {
    this.sources.push(source);
  }

  /**
   * Executes discovery across all configured permitted sources.
   * Enforces the Discovery Buffer and Discovery Stopping Rule (Rule 83 & 84).
   */
  async discover(
    params: DiscoveryParams,
    onProgress?: (discoveredCount: number, sourceName: string) => void
  ): Promise<DiscoveredCandidate[]> {
    const bufferMultiplier = params.bufferMultiplier || 1.5;
    const targetBufferCount = Math.ceil(params.quantityRequested * bufferMultiplier);

    const candidates: DiscoveredCandidate[] = [];
    const seenNames = new Set<string>();
    const seenDomains = new Set<string>();

    for (const source of this.sources) {
      if (candidates.length >= targetBufferCount) break;

      try {
        const found = await source.discoverBusinesses({
          ...params,
          quantityRequested: targetBufferCount - candidates.length,
        });

        for (const item of found) {
          if (candidates.length >= targetBufferCount) break;

          const normName = item.businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
          const normDom = normalizeDomain(item.website);

          // In-memory candidate dedup
          if (seenNames.has(normName) && normName.length > 3) continue;
          if (normDom && seenDomains.has(normDom)) continue;

          seenNames.add(normName);
          if (normDom) seenDomains.add(normDom);

          candidates.push(item);

          if (onProgress) {
            onProgress(candidates.length, source.name);
          }
        }
      } catch (err) {
        // Individual source failures do not break the whole pipeline
      }
    }

    return candidates;
  }
}

export const discoveryEngine = new DiscoveryEngine();
