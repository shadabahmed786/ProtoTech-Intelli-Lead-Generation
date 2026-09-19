import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScores, DEFAULT_OFFER_PROFILE } from '../src/lib/scoring/engine';

test('Scoring Engine - Business without website gets high opportunity points', () => {
  const res = calculateScores(
    {
      businessName: 'Al-Haram Restaurant',
      category: 'Restaurants',
      city: 'Islamabad',
      website: undefined, // No website
      phone: '+92 300 1234567',
    },
    DEFAULT_OFFER_PROFILE
  );

  // +25 (no website) + 5 (industry) + 5 (location) = 35 minimum
  assert.ok(res.opportunityScore >= 35);
  assert.ok(res.breakdown.some((b) => b.signal.includes('No website')));
  assert.ok(res.qualityScore >= 60); // has name, phone, city
});

test('Scoring Engine - Audited website with missing viewport and WhatsApp', () => {
  const res = calculateScores(
    {
      businessName: 'Grand View Restaurant',
      category: 'Restaurants',
      city: 'Islamabad',
      website: 'https://grandview.pk',
      phone: '+92 51 2345678',
      hasMobileViewport: false,
      outdatedSignals: true,
      hasCta: false,
      hasHttps: false,
    },
    DEFAULT_OFFER_PROFILE
  );

  assert.ok(res.opportunityScore >= 50);
  assert.ok(res.breakdown.some((b) => b.signal.includes('Missing mobile viewport')));
  assert.ok(res.breakdown.some((b) => b.signal.includes('Insecure HTTP')));
  assert.ok(res.breakdown.length >= 4);
});
