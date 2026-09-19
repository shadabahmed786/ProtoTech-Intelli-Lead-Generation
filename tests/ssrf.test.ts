import test from 'node:test';
import assert from 'node:assert/strict';
import { isPrivateIPv4, isPrivateIPv6, validateUrlForSSRF } from '../src/lib/security/ssrf';

test('SSRF Protection - isPrivateIPv4', () => {
  // Loopback
  assert.equal(isPrivateIPv4('127.0.0.1'), true);
  assert.equal(isPrivateIPv4('127.1.2.3'), true);
  // 10.0.0.0/8
  assert.equal(isPrivateIPv4('10.0.0.1'), true);
  assert.equal(isPrivateIPv4('10.254.254.254'), true);
  // 172.16.0.0/12
  assert.equal(isPrivateIPv4('172.16.0.1'), true);
  assert.equal(isPrivateIPv4('172.31.255.255'), true);
  assert.equal(isPrivateIPv4('172.32.0.1'), false); // public
  // 192.168.0.0/16
  assert.equal(isPrivateIPv4('192.168.1.1'), true);
  // Cloud metadata 169.254.169.254
  assert.equal(isPrivateIPv4('169.254.169.254'), true);
  // Public IPs
  assert.equal(isPrivateIPv4('8.8.8.8'), false);
  assert.equal(isPrivateIPv4('1.1.1.1'), false);
});

test('SSRF Protection - isPrivateIPv6', () => {
  assert.equal(isPrivateIPv6('::1'), true);
  assert.equal(isPrivateIPv6('fc00::1'), true);
  assert.equal(isPrivateIPv6('fe80::1'), true);
});

test('SSRF Protection - validateUrlForSSRF protocol & host validation', async () => {
  // Disallowed protocol
  const ftpRes = await validateUrlForSSRF('ftp://example.com');
  assert.equal(ftpRes.allowed, false);

  const fileRes = await validateUrlForSSRF('file:///etc/passwd');
  assert.equal(fileRes.allowed, false);

  // Localhost
  const localRes = await validateUrlForSSRF('http://localhost:3000');
  assert.equal(localRes.allowed, false);

  const ipLocal = await validateUrlForSSRF('http://127.0.0.1/admin');
  assert.equal(ipLocal.allowed, false);

  // Valid public URL
  const validRes = await validateUrlForSSRF('https://example.com');
  assert.equal(validRes.allowed, true);
});
