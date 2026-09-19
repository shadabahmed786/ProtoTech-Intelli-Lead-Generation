import * as cheerio from 'cheerio';
import { detectTechnologies } from './technology';
import { extractDataFromHtml } from '../extraction/html';
import { WebsiteAuditResult, OpportunityItem } from '@/types';

export function auditWebsite(
  url: string,
  homepageHtml: string,
  subpagesHtml: { url: string; html: string }[] = []
): WebsiteAuditResult {
  const parsedUrl = new URL(url);
  const isHttps = parsedUrl.protocol === 'https:';

  const $ = cheerio.load(homepageHtml);

  // Viewport
  const viewport = $('meta[name="viewport"]').attr('content');
  const hasMobileViewport = Boolean(viewport && viewport.includes('width=device-width'));

  // Title & SEO
  const pageTitle = $('title').first().text().trim();
  const metaDescription = $('meta[name="description"]').attr('content')?.trim();
  const hasHeadingH1 = $('h1').length > 0;

  // Extract homepage data
  const mainData = extractDataFromHtml(homepageHtml, url);

  // Aggregate with subpages data
  const allEmails = new Set<string>(mainData.emails);
  const allPhones = new Set<string>(mainData.phones);
  const allWhatsapp = new Set<string>(mainData.whatsappNumbers);
  const allSocials = [...mainData.socials];
  let hasCta = mainData.hasCta;
  let hasContactPage = mainData.hasContactPageLink;
  let hasServicesPage = mainData.hasServicesPageLink;

  for (const sub of subpagesHtml) {
    const subData = extractDataFromHtml(sub.html, sub.url);
    subData.emails.forEach((e) => allEmails.add(e));
    subData.phones.forEach((p) => allPhones.add(p));
    subData.whatsappNumbers.forEach((w) => allWhatsapp.add(w));
    if (subData.hasCta) hasCta = true;
    if (sub.url.toLowerCase().includes('contact')) hasContactPage = true;
    if (sub.url.toLowerCase().includes('service') || sub.url.toLowerCase().includes('about')) {
      hasServicesPage = true;
    }
  }

  // Technologies
  const technologies = detectTechnologies(homepageHtml);

  // Opportunities detection
  const opportunities: OpportunityItem[] = [];

  // 1. Insecure HTTP
  if (!isHttps) {
    opportunities.push({
      type: 'no_https',
      description: 'Website runs on insecure HTTP without SSL encryption.',
      evidence: `Protocol used is ${parsedUrl.protocol} instead of https:`,
      confidence: 'High',
    });
  }

  // 2. Missing Mobile Viewport
  if (!hasMobileViewport) {
    opportunities.push({
      type: 'missing_mobile_viewport',
      description: 'No responsive mobile viewport meta tag detected.',
      evidence: 'Missing <meta name="viewport" content="width=device-width..."> tag in HTML <head>',
      confidence: 'High',
    });
  }

  // 3. Missing CTA
  if (!hasCta) {
    opportunities.push({
      type: 'missing_contact_cta',
      description: 'No clear conversion call-to-action button detected.',
      evidence: 'No conversion buttons (Book, Order, Get Quote, WhatsApp) found on main page',
      confidence: 'Medium',
    });
  }

  // 4. Missing WhatsApp
  if (allWhatsapp.size === 0) {
    opportunities.push({
      type: 'missing_whatsapp',
      description: 'No direct WhatsApp business chat contact mechanism found.',
      evidence: 'No wa.me or WhatsApp links detected across audited pages',
      confidence: 'Medium',
    });
  }

  // 5. Weak SEO Metadata
  if (!metaDescription || metaDescription.length < 20) {
    opportunities.push({
      type: 'weak_seo_metadata',
      description: 'Missing or weak search engine meta description.',
      evidence: metaDescription
        ? `Meta description is very short (${metaDescription.length} chars)`
        : 'Meta description tag is absent from page HTML',
      confidence: 'High',
    });
  }

  // 6. Outdated HTML / Design indicators
  if (homepageHtml.includes('<font') || homepageHtml.includes('<center>') || homepageHtml.includes('frameset')) {
    opportunities.push({
      type: 'outdated_website_signals',
      description: 'Legacy HTML tags detected indicating outdated website structure.',
      evidence: 'Deprecated tags (<font>, <center>, or <frameset>) found in page source',
      confidence: 'High',
    });
  }

  // 7. Missing Social Links
  if (allSocials.length === 0) {
    opportunities.push({
      type: 'missing_social_links',
      description: 'No public business social media profiles linked on website.',
      evidence: 'No outbound links to Facebook, Instagram, LinkedIn, or Twitter detected',
      confidence: 'Medium',
    });
  }

  return {
    hasHttps: isHttps,
    hasMobileViewport,
    pageTitle,
    metaDescription,
    hasHeadingH1,
    hasCta,
    hasServicesPage,
    hasContactPage,
    hasWhatsapp: allWhatsapp.size > 0,
    hasSocialLinks: allSocials.length > 0,
    loadIndicator: 'Checked via standard HTTP crawl',
    technologies,
    opportunities,
    socials: allSocials,
    emails: Array.from(allEmails),
    phones: Array.from(allPhones),
    whatsappNumbers: Array.from(allWhatsapp),
  };
}
