import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '../db/prisma';

export const SESSION_COOKIE_NAME = 'prototech_session';
const SECRET_KEY = process.env.AUTH_SECRET || 'prototech-intelli-secure-secret-2026';

export interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  exp: number;
}

/**
 * Hashes a plaintext password with salt using scrypt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored salt:hash string
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const computed = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Signs payload into an HMAC-SHA256 authenticated token
 */
export function createSessionToken(user: { id: string; email: string; name: string; role: string; avatarUrl?: string | null }): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    exp,
  };

  const dataStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(dataStr).digest('base64url');
  return `${dataStr}.${signature}`;
}

/**
 * Verifies and decodes a session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [dataStr, signature] = token.split('.');
    if (!dataStr || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(dataStr).digest('base64url');
    if (signature !== expectedSig) return null;

    const payload: SessionPayload = JSON.parse(Buffer.from(dataStr, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current session user from cookies
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}
