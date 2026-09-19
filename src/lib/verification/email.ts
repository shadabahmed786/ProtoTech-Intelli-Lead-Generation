import dns from 'dns';
import { promisify } from 'util';

const resolveMxAsync = promisify(dns.resolveMx);

// Comprehensive list of common temporary / disposable email providers
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'yopmail.com',
  'throwawaymail.com',
  'dispostable.com',
  'trashmail.com',
  'fakeinbox.com',
  'getnada.com',
  'temp-mail.org',
  'mohmal.com',
  'inboxkitten.com',
]);

export type EmailValidationStatus =
  | 'valid_format'
  | 'domain_valid'
  | 'mx_valid'
  | 'disposable'
  | 'invalid_syntax'
  | 'no_mx_records'
  | 'unknown';

export interface EmailVerificationResult {
  email: string;
  status: EmailValidationStatus;
  domain: string;
  isDisposable: boolean;
  hasMx: boolean;
  details?: string;
}

const RFC5322_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates an email without sending messages.
 * Checks format, disposable domains, and DNS MX records.
 */
export async function verifyEmail(rawEmail?: string | null): Promise<EmailVerificationResult> {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return {
      email: '',
      status: 'invalid_syntax',
      domain: '',
      isDisposable: false,
      hasMx: false,
      details: 'Empty email provided',
    };
  }

  const email = rawEmail.trim().toLowerCase();

  // Level 1: Syntax Check
  if (!RFC5322_EMAIL_REGEX.test(email)) {
    return {
      email,
      status: 'invalid_syntax',
      domain: email.split('@')[1] || '',
      isDisposable: false,
      hasMx: false,
      details: 'Failed standard RFC syntax validation',
    };
  }

  const domain = email.split('@')[1];

  // Level 2: Disposable Check
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      email,
      status: 'disposable',
      domain,
      isDisposable: true,
      hasMx: false,
      details: 'Domain is a known disposable temporary email provider',
    };
  }

  // Level 3: DNS MX Record check
  try {
    const mxRecords = await resolveMxAsync(domain);
    if (mxRecords && mxRecords.length > 0) {
      return {
        email,
        status: 'mx_valid',
        domain,
        isDisposable: false,
        hasMx: true,
        details: `Active mail exchange found (${mxRecords[0].exchange})`,
      };
    } else {
      return {
        email,
        status: 'no_mx_records',
        domain,
        isDisposable: false,
        hasMx: false,
        details: 'Domain does not have configured MX mail records',
      };
    }
  } catch (dnsErr: any) {
    // If DNS query times out or fails (e.g. during offline test), return valid_format
    return {
      email,
      status: 'valid_format',
      domain,
      isDisposable: false,
      hasMx: false,
      details: `Syntax valid. DNS check note: ${dnsErr.message || 'DNS lookup not reachable'}`,
    };
  }
}
