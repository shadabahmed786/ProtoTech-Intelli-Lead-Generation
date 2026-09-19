import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLocation } from '../src/lib/normalization/location';
import { normalizePhone } from '../src/lib/normalization/phone';
import { normalizeDomain } from '../src/lib/normalization/domain';

test('Normalization - Location', () => {
  const isb = normalizeLocation('ISB');
  assert.equal(isb.city, 'Islamabad');
  assert.equal(isb.country, 'Pakistan');

  const rwp = normalizeLocation('Rawalpindi, Punjab');
  assert.equal(rwp.city, 'Rawalpindi');
  assert.equal(rwp.region, 'Punjab');
  assert.equal(rwp.country, 'Pakistan');

  const lhr = normalizeLocation('LHR');
  assert.equal(lhr.city, 'Lahore');

  const intl = normalizeLocation('Dubai, UAE');
  assert.equal(intl.city, 'Dubai');
  assert.equal(intl.country, 'United Arab Emirates');
});

test('Normalization - Phone', () => {
  const pkMobile = normalizePhone('0300 1234567');
  assert.equal(pkMobile.e164, '+923001234567');
  assert.equal(pkMobile.country, 'PK');
  assert.equal(pkMobile.isPossible, true);

  const pkLandline = normalizePhone('051 2345678');
  assert.equal(pkLandline.e164, '+92512345678');
  assert.equal(pkLandline.country, 'PK');

  const intlPhone = normalizePhone('+1 415 555 2671', 'US');
  assert.equal(intlPhone.e164, '+14155552671');
  assert.equal(intlPhone.country, 'US');
});

test('Normalization - Domain', () => {
  assert.equal(normalizeDomain('https://www.example.com/about?ref=1'), 'example.com');
  assert.equal(normalizeDomain('http://sub.domain.pk:8080/'), 'sub.domain.pk');
  assert.equal(normalizeDomain('example.org/'), 'example.org');
  assert.equal(normalizeDomain(null), null);
});
