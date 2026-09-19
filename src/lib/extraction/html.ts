import * as cheerio from 'cheerio';

export interface ExtractedPageData {
  title?: string;
  metaDescription?: string;
  headings: string[];
  emails: string[];
  phones: string[];
  whatsappNumbers: string[];
  socials: { platform: string; profileUrl: string }[];
  hasCta: boolean;
  hasContactPageLink: boolean;
  hasServicesPageLink: boolean;
  subpageLinks: string[];
  schemaOrgData: any[];
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function extractDataFromHtml(html: string, baseUrl: string): ExtractedPageData {
  const $ = cheerio.load(html);
  const currentUrl = new URL(baseUrl);

  // Title & Description
  const title = $('title').first().text().trim() || $('meta[property="og:title"]').attr('content')?.trim();
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim();

  // Headings
  const headings: string[] = [];
  $('h1, h2').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 150) headings.push(text);
  });

  // Emails
  const emailSet = new Set<string>();
  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const email = href.replace(/^mailto:/i, '').split('?')[0].trim();
    if (email && email.includes('@')) emailSet.add(email.toLowerCase());
  });

  // Check text for public emails (avoiding common image extensions or script matches)
  const bodyText = $('body').text();
  const textMatches = bodyText.match(EMAIL_REGEX) || [];
  for (const m of textMatches) {
    const lower = m.toLowerCase();
    if (!lower.endsWith('.png') && !lower.endsWith('.jpg') && !lower.endsWith('.svg')) {
      emailSet.add(lower);
    }
  }

  // Phones & WhatsApp
  const phoneSet = new Set<string>();
  const whatsappSet = new Set<string>();

  $('a[href^="tel:"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const phone = href.replace(/^tel:/i, '').trim();
    if (phone.length >= 7) phoneSet.add(phone);
  });

  // WhatsApp detection rule: Only classify WhatsApp when the business publicly provides a WhatsApp link/number
  $('a[href*="wa.me"], a[href*="whatsapp.com"], a[href^="whatsapp:"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const waMatch = href.match(/(?:wa\.me\/|phone=|whatsapp:\/\/send\?phone=)(\+?\d+)/i);
    if (waMatch && waMatch[1]) {
      whatsappSet.add(waMatch[1]);
      phoneSet.add(waMatch[1]);
    } else {
      whatsappSet.add('detected');
    }
  });

  // Social Links
  const socialList: { platform: string; profileUrl: string }[] = [];
  const seenSocials = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    if (!href) return;

    try {
      const fullUrl = new URL(href, baseUrl).toString();
      const lower = fullUrl.toLowerCase();

      if (lower.includes('facebook.com/') && !lower.includes('/sharer') && !seenSocials.has(fullUrl)) {
        seenSocials.add(fullUrl);
        socialList.push({ platform: 'Facebook', profileUrl: fullUrl });
      } else if (lower.includes('instagram.com/') && !seenSocials.has(fullUrl)) {
        seenSocials.add(fullUrl);
        socialList.push({ platform: 'Instagram', profileUrl: fullUrl });
      } else if (lower.includes('linkedin.com/company/') && !seenSocials.has(fullUrl)) {
        seenSocials.add(fullUrl);
        socialList.push({ platform: 'LinkedIn', profileUrl: fullUrl });
      } else if (lower.includes('youtube.com/') && !seenSocials.has(fullUrl)) {
        seenSocials.add(fullUrl);
        socialList.push({ platform: 'YouTube', profileUrl: fullUrl });
      } else if (lower.includes('tiktok.com/@') && !seenSocials.has(fullUrl)) {
        seenSocials.add(fullUrl);
        socialList.push({ platform: 'TikTok', profileUrl: fullUrl });
      } else if ((lower.includes('twitter.com/') || lower.includes('x.com/')) && !seenSocials.has(fullUrl)) {
        seenSocials.add(fullUrl);
        socialList.push({ platform: 'Twitter', profileUrl: fullUrl });
      }
    } catch {
      // ignore invalid URLs
    }
  });

  // Call-To-Action (CTA) detection
  let hasCta = false;
  $('a, button').each((_, el) => {
    const text = $(el).text().toLowerCase().trim();
    if (
      text.includes('contact') ||
      text.includes('book') ||
      text.includes('order') ||
      text.includes('get a quote') ||
      text.includes('call now') ||
      text.includes('whatsapp') ||
      text.includes('inquire') ||
      text.includes('schedule')
    ) {
      hasCta = true;
    }
  });

  // Navigation Links for conservative crawl
  let hasContactPageLink = false;
  let hasServicesPageLink = false;
  const subpageLinks: string[] = [];

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    if (!href) return;

    try {
      const resolved = new URL(href, baseUrl);
      // Only same domain
      if (resolved.hostname === currentUrl.hostname) {
        const path = resolved.pathname.toLowerCase();
        if (path.includes('contact')) hasContactPageLink = true;
        if (path.includes('service') || path.includes('about') || path.includes('menu') || path.includes('product')) {
          hasServicesPageLink = true;
        }

        if (
          path !== '/' &&
          path !== '' &&
          !path.endsWith('.pdf') &&
          !path.endsWith('.jpg') &&
          !path.endsWith('.png') &&
          !path.endsWith('.zip')
        ) {
          subpageLinks.push(resolved.toString());
        }
      }
    } catch {
      // ignore
    }
  });

  // Schema.org JSON-LD extraction
  const schemaOrgData: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html();
      if (content) {
        const parsed = JSON.parse(content);
        schemaOrgData.push(parsed);
      }
    } catch {
      // ignore malformed JSON-LD
    }
  });

  return {
    title,
    metaDescription,
    headings: headings.slice(0, 10),
    emails: Array.from(emailSet),
    phones: Array.from(phoneSet),
    whatsappNumbers: Array.from(whatsappSet),
    socials: socialList,
    hasCta,
    hasContactPageLink,
    hasServicesPageLink,
    subpageLinks: Array.from(new Set(subpageLinks)).slice(0, 20),
    schemaOrgData,
  };
}
