import { validateUrlForSSRF } from '../security/ssrf';

export interface CrawlPageResult {
  url: string;
  html: string;
  statusCode: number;
}

export interface CrawlResult {
  homepage: CrawlPageResult;
  subpages: CrawlPageResult[];
  errors: string[];
}

const MAX_PAGES = 5;
const MAX_BYTES = 1024 * 1024; // 1 MB
const TIMEOUT_MS = 8000;

/**
 * Safely fetches a single URL with SSRF protection, size caps, and timeouts.
 */
export async function safeFetchHtml(url: string): Promise<{ html: string; statusCode: number }> {
  const ssrf = await validateUrlForSSRF(url);
  if (!ssrf.allowed) {
    throw new Error(`SSRF Guard Blocked URL: ${ssrf.reason}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ProtoTech-Intelli-Bot/1.0 (Public Business Intelligence Verification; +https://prototech.example)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    });

    clearTimeout(timer);

    if (!res.ok) {
      return { html: '', statusCode: res.status };
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml')) {
      return { html: '', statusCode: res.status };
    }

    // Read response with size limit
    const reader = res.body?.getReader();
    if (!reader) {
      const text = await res.text();
      return { html: text.slice(0, MAX_BYTES), statusCode: res.status };
    }

    let receivedBytes = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        receivedBytes += value.length;
        chunks.push(value);
        if (receivedBytes >= MAX_BYTES) {
          reader.cancel();
          break;
        }
      }
    }

    const totalBuffer = Buffer.concat(chunks);
    const html = totalBuffer.toString('utf-8');
    return { html, statusCode: res.status };
  } catch (err: any) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Conservatively crawls a business website:
 * 1. Homepage
 * 2. Follows up to 4 high-value subpages (About, Contact, Services)
 */
export async function crawlBusinessWebsite(startUrl: string): Promise<CrawlResult> {
  const errors: string[] = [];
  let homepage: CrawlPageResult = { url: startUrl, html: '', statusCode: 0 };
  const subpages: CrawlPageResult[] = [];

  try {
    const homeRes = await safeFetchHtml(startUrl);
    homepage = {
      url: startUrl,
      html: homeRes.html,
      statusCode: homeRes.statusCode,
    };
  } catch (err: any) {
    errors.push(`Homepage fetch error: ${err.message}`);
    return { homepage, subpages, errors };
  }

  // Extract candidate subpage links
  try {
    const { extractDataFromHtml } = await import('../extraction/html');
    const data = extractDataFromHtml(homepage.html, startUrl);

    // Prioritize contact and services pages
    const candidateUrls: string[] = [];
    const lowerSubpages = data.subpageLinks;

    // 1. Contact
    const contactUrl = lowerSubpages.find((u) => u.toLowerCase().includes('contact'));
    if (contactUrl) candidateUrls.push(contactUrl);

    // 2. About
    const aboutUrl = lowerSubpages.find((u) => u.toLowerCase().includes('about') || u.toLowerCase().includes('company'));
    if (aboutUrl && !candidateUrls.includes(aboutUrl)) candidateUrls.push(aboutUrl);

    // 3. Services / Menu / Products
    const serviceUrl = lowerSubpages.find(
      (u) =>
        (u.toLowerCase().includes('service') || u.toLowerCase().includes('product') || u.toLowerCase().includes('menu')) &&
        !candidateUrls.includes(u)
    );
    if (serviceUrl) candidateUrls.push(serviceUrl);

    // Fill remaining up to MAX_PAGES - 1
    for (const link of lowerSubpages) {
      if (candidateUrls.length >= MAX_PAGES - 1) break;
      if (!candidateUrls.includes(link)) candidateUrls.push(link);
    }

    // Safely crawl subpages with a modest delay between requests
    for (const subUrl of candidateUrls) {
      try {
        await new Promise((r) => setTimeout(r, 400)); // Respectful delay
        const subRes = await safeFetchHtml(subUrl);
        if (subRes.html) {
          subpages.push({
            url: subUrl,
            html: subRes.html,
            statusCode: subRes.statusCode,
          });
        }
      } catch (subErr: any) {
        errors.push(`Subpage ${subUrl} error: ${subErr.message}`);
      }
    }
  } catch (err: any) {
    errors.push(`Subpage parsing error: ${err.message}`);
  }

  return { homepage, subpages, errors };
}
