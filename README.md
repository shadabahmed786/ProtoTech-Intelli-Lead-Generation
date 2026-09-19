# ProtoTech Intelli — Lead Generation (Version 1.0)

> **Find. Understand. Convert.**  
> Internal AI-assisted lead-generation & public business intelligence platform built with **100% Free / Zero-Paid-API** architecture.

---

## 1. Product Overview

**ProtoTech Intelli** is an internal enterprise platform that discovers, extracts, verifies, enriches, analyzes, scores, deduplicates, organizes, and exports high-quality business leads from publicly accessible data sources.

### Fundamental Philosophy
```
Accuracy > Evidence > Relevance > Quantity
```
- **Zero Fabrication Guarantee**: The system never creates fictitious phone numbers, emails, addresses, or placeholders to fulfill a requested lead count.
- **Accurate Yield Reporting**: If 50 leads are requested and only 27 valid leads exist, the campaign reports:
  - `Requested: 50 | Discovered: 45 | Valid: 27 | Duplicates: 5 | Rejected: 13 | Final Leads: 27`
  - `Status: Completed — Partial`
- **100% Free / No-Paid-API MVP**: Avoids Google Places API, SerpAPI, Outscraper, Apollo, Hunter, and scraping behind paywalls or CAPTCHAs.
- **Explainable Scoring**: Every lead receives a deterministic 0–100 Opportunity Score with transparent point breakdowns based on customizable **Offer Profiles**.

---

## 2. Key Features

- **Multi-Source Discovery Engine**:
  - OpenStreetMap Overpass API (live real-world commercial amenities, shops, healthcare, and offices).
  - Public Business Directories & Search Query Generation (DuckDuckGo HTML query patterns).
  - Open Public Registries (curated authentic datasets for immediate offline testing).
  - Discovery buffering (1.5x–2x candidate targets) and intelligent stopping rules.
- **Conservative & SSRF-Protected Web Crawler**:
  - DNS resolution IP verification: blocks loopback (`127.0.0.0/8`), private IPv4 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), cloud metadata (`169.254.169.254`), and IPv6 private blocks.
  - Crawls maximum 5 high-value pages per business (Homepage, About, Contact, Services).
  - Enforces 1 MB payload limits, 8s request timeouts, and respectful rate delays.
- **Deterministic Website Audit**:
  - Checks for HTTPS, Mobile Viewport meta tag, Page Title, Meta Description, Heading H1 structure, Call-To-Action (CTA) buttons, Services pages, and Social links.
- **Deterministic Technology Detection**:
  - Identifies WordPress, WooCommerce, Shopify, Next.js, React, Tailwind CSS, Bootstrap, Webflow, Wix, and Squarespace with verified source code evidence.
- **Evidence-Based Opportunity Detection**:
  - Flags missing WhatsApp links, missing CTA, weak SEO, insecure HTTP, outdated HTML tags, and businesses without a website.
- **Offer Profiles & Scoring Engine**:
  - Custom profiles (e.g. *Website Development*, *SEO Services*, *AI Automation*).
  - 0–100 Opportunity Score with exact signal breakdowns + independent 0–100 Data Quality Score.
- **Deduplication & Multi-Factor Suppression**:
  - Deduplicates by normalized domain, international E.164 phone, and normalized name + city.
  - Identifies distinct branches in different cities.
  - Global suppression blocklist across domain, phone, email, and business name.
- **Background Worker & Real Progress**:
  - Live progress stages: `Queued` → `Discovering` → `Extracting` → `Verifying` → `Analyzing` → `Scoring` → `Completed`.
  - Campaign cancellation and retry support.
- **Secure CSV Export**:
  - Sanitizes spreadsheet formula injection triggers (`=`, `+`, `-`, `@`) according to OWASP guidelines.
- **Custom Dark Theme UI**:
  - Styled with `#0B1220` dark background, `#121A2B` cards, `#00E5FF` cyan highlights, `#00C896` teal badges, and `#FF4D6D` alerts.

---

## 3. Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root Layout (Inter font, dark theme)
│   ├── page.tsx                # Dashboard with KPIs, spotlight & table
│   ├── generate/page.tsx       # Lead generation input form
│   ├── campaigns/page.tsx      # Campaigns overview
│   ├── campaigns/[id]/page.tsx # Real-time campaign tracking & logs
│   ├── leads/page.tsx          # Multi-filter leads data table
│   ├── leads/[id]/page.tsx     # Full lead audit, evidence & notes
│   ├── lists/page.tsx          # Custom lead list segments
│   ├── exports/page.tsx        # CSV exports manager
│   ├── offer-profiles/page.tsx # Offer Profiles & scoring rules
│   ├── settings/page.tsx       # Governance, suppression & audit log
│   └── api/                    # Next.js App Router REST API endpoints
│
├── components/
│   ├── Sidebar.tsx             # Brand sidebar with navigation
│   ├── Header.tsx              # Search bar, status badges & notifications
│   ├── StatusBadge.tsx         # Color-coded status badge
│   └── ScorePill.tsx           # 0-100 Score pill with glow
│
├── lib/
│   ├── db/prisma.ts            # Prisma client singleton
│   ├── security/ssrf.ts        # SSRF protection and DNS resolution
│   ├── normalization/          # Location, phone (E.164), and domain
│   ├── verification/           # Email syntax, DNS MX, and disposable check
│   ├── extraction/             # Cheerio HTML & metadata extractor
│   ├── crawler/                # Conservative safe crawler (max 5 pages)
│   ├── analysis/               # Tech detection & deterministic audit
│   ├── scoring/                # Offer Profile scoring engine
│   ├── discovery/              # Overpass OSM, directories, and registries
│   ├── deduplication/          # Domain, phone, and suppression checks
│   ├── jobs/campaign-runner.ts # Background campaign runner
│   └── exports/csv.ts          # RFC 4180 CSV with injection escaping
│
└── tests/                      # Automated Node.js unit tests
```

---

## 4. Setup & Installation

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v24.11)
- npm or pnpm

### Quick Start
1. **Clone or Navigate to the Project**:
   ```bash
   cd "d:/prototech lead sys"
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Default config runs on SQLite with zero setup:*
   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. **Initialize Database & Seed Data**:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Automated Tests

Run the complete test suite:
```bash
npm test
# or
npx tsx --test tests/*.test.ts
```

Tests verify:
- **SSRF Protection**: Private IPv4/IPv6 blocks, cloud metadata addresses (`169.254.169.254`), and protocol enforcement.
- **Normalization**: Pakistani phone formats (`0300...` → `+92300...`), international numbers, and Pakistani cities.
- **Scoring Engine**: Point allocations, offer profile weights, and breakdown accuracy.
- **CSV Formula Injection**: Sanitization of dangerous prefix triggers (`=`, `+`, `-`, `@`).
- **Deduplication**: Domain, phone, and suppression blocklist checking.

---

## 6. Data Compliance & Limitations

- **Public Business Data Only**: Collects only public business name, category, address, official phone, official email, and website.
- **No Personal / Private Surveillance**: Does not harvest residential addresses, private social accounts, passwords, or personal mobile lines.
- **Robots.txt & Rate Compliance**: Enforces politeness delays and small batch requests.
- **Future Providers**: Modular `LeadSource` abstraction allows plugging in Google Places, SerpAPI, or Hunter adapters in future versions without rewriting the core application.
