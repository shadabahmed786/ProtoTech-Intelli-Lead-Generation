import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeCsvCell, generateCsv } from '../src/lib/exports/csv';

test('CSV Sanitization - Prevents Formula Injection', () => {
  // Test formula triggers prefixed with leading single quote
  assert.equal(sanitizeCsvCell('=1+1'), "'=1+1");
  assert.equal(sanitizeCsvCell('+cmd|/c calc'), "'+cmd|/c calc");
  assert.equal(sanitizeCsvCell('-5*5'), "'-5*5");
  assert.equal(sanitizeCsvCell('@SUM(A1:A10)'), "'@SUM(A1:A10)");

  // Normal cells
  assert.equal(sanitizeCsvCell('ProtoTech Intelli'), 'ProtoTech Intelli');
  assert.equal(sanitizeCsvCell('Islamabad, Pakistan'), '"Islamabad, Pakistan"');
});

test('CSV Generation - Full Row Generation', () => {
  const csv = generateCsv([
    {
      businessName: '=Malicious Title',
      category: 'Restaurants',
      address: 'F-7 Markaz, Islamabad',
      city: 'Islamabad',
      country: 'Pakistan',
      opportunityScore: 90,
      qualityScore: 85,
      status: 'Qualified',
    },
  ]);

  assert.ok(csv.includes("'=Malicious Title"));
  assert.ok(csv.includes('Restaurants'));
  assert.ok(csv.includes('"F-7 Markaz, Islamabad"'));
});
