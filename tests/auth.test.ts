import test from 'node:test';
import assert from 'node:assert';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from '../src/lib/auth/session';

test('Auth - Hash and Verify Password', () => {
  const password = 'SecretPassword123!';
  const hash = hashPassword(password);
  assert.ok(hash.includes(':'), 'Hash must contain salt separator');

  const isValid = verifyPassword(password, hash);
  assert.strictEqual(isValid, true, 'Correct password must verify');

  const isInvalid = verifyPassword('WrongPassword', hash);
  assert.strictEqual(isInvalid, false, 'Wrong password must fail');
});

test('Auth - Session Token Creation and Verification', () => {
  const user = {
    id: 'test-user-123',
    email: 'admin@prototech.com',
    name: 'ProtoTech Admin',
    role: 'Admin',
  };

  const token = createSessionToken(user);
  assert.ok(token.includes('.'), 'Token must contain signature component');

  const verified = verifySessionToken(token);
  assert.ok(verified, 'Verified payload must exist');
  assert.strictEqual(verified?.id, user.id);
  assert.strictEqual(verified?.email, user.email);
  assert.strictEqual(verified?.role, 'Admin');

  // Tampered token must fail
  const tampered = token + 'tamper';
  const failed = verifySessionToken(tampered);
  assert.strictEqual(failed, null, 'Tampered token must be rejected');
});
