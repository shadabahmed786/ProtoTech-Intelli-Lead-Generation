import test from 'node:test';
import assert from 'node:assert/strict';
import { checkDeduplication } from '../src/lib/deduplication';

test('Deduplication - Domain and Phone match', () => {
  const existing = [
    {
      id: '1',
      businessName: 'Existing Restaurant',
      normalizedDomain: 'existing.pk',
      normalizedPhone: '+923001234567',
      city: 'Islamabad',
    },
  ];

  // Match domain
  const resDomain = checkDeduplication(
    {
      businessName: 'Another Name',
      website: 'https://www.existing.pk/contact',
      city: 'Islamabad',
    },
    existing,
    []
  );
  assert.equal(resDomain.isDuplicate, true);
  assert.equal(resDomain.duplicateOfId, '1');

  // Match phone
  const resPhone = checkDeduplication(
    {
      businessName: 'Brand New Place',
      phone: '0300 1234567',
      city: 'Islamabad',
    },
    existing,
    []
  );
  assert.equal(resPhone.isDuplicate, true);

  // Branch in different city
  const resBranch = checkDeduplication(
    {
      businessName: 'Existing Restaurant',
      website: 'https://existing.pk',
      city: 'Rawalpindi', // Different city
    },
    existing,
    []
  );
  assert.equal(resBranch.isDuplicate, false);
  assert.equal(resBranch.isBranch, true);
});

test('Deduplication - Suppression Check', () => {
  const suppressions = [
    { type: 'domain', value: 'blocked.pk' },
    { type: 'phone', value: '+923339999999' },
  ];

  const res = checkDeduplication(
    {
      businessName: 'Blocked Org',
      website: 'https://blocked.pk',
    },
    [],
    suppressions
  );

  assert.equal(res.isSuppressed, true);
});
