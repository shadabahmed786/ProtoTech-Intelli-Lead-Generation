import { DiscoveredCandidate } from '@/types';

export interface DiscoveryParams {
  leadType: string;
  location: string;
  quantityRequested: number;
  bufferMultiplier?: number; // default 1.5
  requirements?: {
    hasWebsite?: boolean;
    hasEmail?: boolean;
    hasPhone?: boolean;
    hasWhatsapp?: boolean;
    hasSocial?: boolean;
  };
}

export interface LeadSource {
  name: string;
  sourceType: 'osm' | 'directory' | 'web' | 'dataset';
  discoverBusinesses(params: DiscoveryParams): Promise<DiscoveredCandidate[]>;
  getSourceUrl(): string;
  isAllowed(url: string): boolean;
}
