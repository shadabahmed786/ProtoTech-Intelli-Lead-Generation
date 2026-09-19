import { TechnologyItem } from '@/types';

interface TechSignature {
  name: string;
  check: (html: string, headers?: Headers) => { found: boolean; evidence?: string };
}

const SIGNATURES: TechSignature[] = [
  {
    name: 'WordPress',
    check: (html) => {
      if (html.includes('/wp-content/') || html.includes('/wp-includes/')) {
        return { found: true, evidence: 'wp-content/ or wp-includes/ asset paths detected in HTML' };
      }
      if (/content=["']WordPress/i.test(html)) {
        return { found: true, evidence: 'WordPress generator meta tag detected' };
      }
      return { found: false };
    },
  },
  {
    name: 'WooCommerce',
    check: (html) => {
      if (html.includes('woocommerce') || html.includes('wc-block')) {
        return { found: true, evidence: 'WooCommerce classes or script identifiers detected' };
      }
      return { found: false };
    },
  },
  {
    name: 'Shopify',
    check: (html) => {
      if (html.includes('cdn.shopify.com') || html.includes('Shopify.theme')) {
        return { found: true, evidence: 'Shopify CDN scripts and Shopify.theme detected' };
      }
      return { found: false };
    },
  },
  {
    name: 'Next.js',
    check: (html) => {
      if (html.includes('/_next/') || html.includes('__NEXT_DATA__')) {
        return { found: true, evidence: '/_next/ asset path or __NEXT_DATA__ hydration JSON detected' };
      }
      return { found: false };
    },
  },
  {
    name: 'React',
    check: (html) => {
      if (html.includes('react-root') || html.includes('data-reactroot') || html.includes('/_next/')) {
        return { found: true, evidence: 'React hydration roots or Next.js React bundling detected' };
      }
      return { found: false };
    },
  },
  {
    name: 'Tailwind CSS',
    check: (html) => {
      // Look for multiple classic Tailwind utility class combos
      if (
        (html.includes('flex') && html.includes('justify-between') && html.includes('items-center')) ||
        html.includes('tailwind')
      ) {
        return { found: true, evidence: 'Tailwind CSS utility classes pattern detected' };
      }
      return { found: false };
    },
  },
  {
    name: 'Bootstrap',
    check: (html) => {
      if (html.includes('bootstrap.min.css') || html.includes('bootstrap.bundle') || (html.includes('container-fluid') && html.includes('row') && html.includes('col-md-'))) {
        return { found: true, evidence: 'Bootstrap stylesheet links or grid class patterns detected' };
      }
      return { found: false };
    },
  },
  {
    name: 'Webflow',
    check: (html) => {
      if (html.includes('webflow.com') || html.includes('w-layout-grid') || html.includes('wf-page-')) {
        return { found: true, evidence: 'Webflow CSS framework markers and meta detected' };
      }
      return { found: false };
    },
  },
  {
    name: 'Wix',
    check: (html) => {
      if (html.includes('wix.com') || html.includes('wix-warmup-data') || html.includes('_wix_')) {
        return { found: true, evidence: 'Wix scripts and platform runtime markers detected' };
      }
      return { found: false };
    },
  },
  {
    name: 'Squarespace',
    check: (html) => {
      if (html.includes('squarespace.com') || html.includes('static.squarespace') || html.includes('sqs-block')) {
        return { found: true, evidence: 'Squarespace static assets and blocks detected' };
      }
      return { found: false };
    },
  },
];

/**
 * Deterministically inspects page HTML and returns detected technologies with concrete evidence.
 */
export function detectTechnologies(html: string, headers?: Headers): TechnologyItem[] {
  const detected: TechnologyItem[] = [];

  for (const sig of SIGNATURES) {
    const res = sig.check(html, headers);
    if (res.found && res.evidence) {
      detected.push({
        name: sig.name,
        evidence: res.evidence,
        confidence: 'High',
      });
    }
  }

  return detected;
}
