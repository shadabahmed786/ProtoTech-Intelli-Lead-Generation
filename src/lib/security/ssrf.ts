import dns from 'dns';
import { promisify } from 'util';

const lookupAsync = promisify(dns.lookup);

/**
 * Checks if an IPv4 address is in a private, loopback, or link-local range.
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return true;

  const [p0, p1] = parts;

  // 0.0.0.0/8 (Current network)
  if (p0 === 0) return true;
  // 10.0.0.0/8 (Private network)
  if (p0 === 10) return true;
  // 127.0.0.0/8 (Loopback)
  if (p0 === 127) return true;
  // 169.254.0.0/16 (Link-local / Cloud metadata like 169.254.169.254)
  if (p0 === 169 && p1 === 254) return true;
  // 172.16.0.0/12 (Private network: 172.16.0.0 - 172.31.255.255)
  if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;
  // 192.168.0.0/16 (Private network)
  if (p0 === 192 && p1 === 168) return true;
  // Broadcast
  if (ip === '255.255.255.255') return true;

  return false;
}

/**
 * Checks if an IPv6 address is loopback, unique local, or link-local.
 */
export function isPrivateIPv6(ip: string): boolean {
  const clean = ip.toLowerCase();
  if (clean === '::1' || clean === '::' || clean === '0:0:0:0:0:0:0:1') return true;
  // Unique local addresses (fc00::/7 -> fc.. or fd..)
  if (clean.startsWith('fc') || clean.startsWith('fd')) return true;
  // Link-local addresses (fe80::/10)
  if (clean.startsWith('fe8') || clean.startsWith('fe9') || clean.startsWith('fea') || clean.startsWith('feb')) return true;
  // IPv4 mapped loopback/private e.g. ::ffff:127.0.0.1
  if (clean.startsWith('::ffff:')) {
    const ipv4 = clean.replace('::ffff:', '');
    return isPrivateIPv4(ipv4);
  }
  return false;
}

export interface SSRFValidationResult {
  allowed: boolean;
  reason?: string;
  normalizedUrl?: string;
  ip?: string;
}

/**
 * Validates a target URL against SSRF vulnerabilities:
 * 1. Must be http:// or https://
 * 2. Hostname cannot be localhost or internal naming
 * 3. Resolves DNS and checks against private IP ranges
 */
export async function validateUrlForSSRF(rawUrl: string): Promise<SSRFValidationResult> {
  try {
    const parsed = new URL(rawUrl);

    // Protocol check
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { allowed: false, reason: `Disallowed protocol: ${parsed.protocol}. Only HTTP and HTTPS are permitted.` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check hostnames
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1'
    ) {
      return { allowed: false, reason: `Localhost and internal hostnames are blocked: ${hostname}` };
    }

    // Direct IP format check
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      if (isPrivateIPv4(hostname)) {
        return { allowed: false, reason: `Private IPv4 addresses are blocked: ${hostname}` };
      }
    }

    // DNS lookup
    try {
      const lookup = await lookupAsync(hostname);
      const ip = lookup.address;

      if (lookup.family === 4 && isPrivateIPv4(ip)) {
        return { allowed: false, reason: `Resolved IP ${ip} belongs to a private network.`, ip };
      }
      if (lookup.family === 6 && isPrivateIPv6(ip)) {
        return { allowed: false, reason: `Resolved IPv6 ${ip} belongs to a private network.`, ip };
      }

      return {
        allowed: true,
        normalizedUrl: parsed.toString(),
        ip,
      };
    } catch (dnsErr: any) {
      return { allowed: false, reason: `DNS resolution failed for ${hostname}: ${dnsErr.message}` };
    }
  } catch (err: any) {
    return { allowed: false, reason: `Invalid URL: ${err.message}` };
  }
}
