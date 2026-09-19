/**
 * Prevents CSV Formula Injection / CSV Injection attacks.
 * If a cell begins with =, +, -, @, or tab/carriage return, prefix it with a single quote (').
 */
export function sanitizeCsvCell(val: any): string {
  if (val === null || val === undefined) return '';

  let str = String(val).trim();

  // If starts with dangerous spreadsheet formula triggers: =, +, -, @, or \t
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes by doubling them, wrap in quotes if contains comma, quote, or newline
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export interface LeadExportRow {
  businessName: string;
  category?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  opportunityScore: number;
  qualityScore: number;
  status: string;
  sourceUrl?: string | null;
}

export function generateCsv(leads: LeadExportRow[]): string {
  const headers = [
    'Business Name',
    'Category',
    'Address',
    'City',
    'Region',
    'Country',
    'Website',
    'Email',
    'Phone',
    'WhatsApp',
    'Facebook',
    'Instagram',
    'LinkedIn',
    'Opportunity Score',
    'Quality Score',
    'Lead Status',
    'Source URL',
  ];

  const rows = [headers.map(sanitizeCsvCell).join(',')];

  for (const lead of leads) {
    const row = [
      sanitizeCsvCell(lead.businessName),
      sanitizeCsvCell(lead.category),
      sanitizeCsvCell(lead.address),
      sanitizeCsvCell(lead.city),
      sanitizeCsvCell(lead.region),
      sanitizeCsvCell(lead.country),
      sanitizeCsvCell(lead.website),
      sanitizeCsvCell(lead.email),
      sanitizeCsvCell(lead.phone),
      sanitizeCsvCell(lead.whatsapp),
      sanitizeCsvCell(lead.facebook),
      sanitizeCsvCell(lead.instagram),
      sanitizeCsvCell(lead.linkedin),
      sanitizeCsvCell(lead.opportunityScore),
      sanitizeCsvCell(lead.qualityScore),
      sanitizeCsvCell(lead.status),
      sanitizeCsvCell(lead.sourceUrl),
    ];
    rows.push(row.join(','));
  }

  return rows.join('\r\n');
}
