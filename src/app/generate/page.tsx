'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Info,
  Building2,
  MapPin,
  Hash,
  Layers,
  CheckSquare,
  Search,
} from 'lucide-react';

const COMMON_LEAD_TYPES = [
  'Restaurants',
  'Real estate agencies',
  'Software houses',
  'Schools',
  'Gyms',
  'Dental clinics',
  'Interior designers',
  'Construction companies',
  'Wedding vendors',
  'E-commerce businesses',
  'Clinics',
  'Bakeries',
];

const COMMON_LOCATIONS = [
  'Islamabad',
  'Rawalpindi',
  'Lahore',
  'Karachi',
  'Peshawar',
  'Abbottabad',
  'Haripur',
  'Faisalabad',
  'Multan',
  'Pakistan',
  'Dubai',
  'London',
];

export default function GenerateLeadsPage() {
  const router = useRouter();

  const [leadType, setLeadType] = useState('Restaurants');
  const [customLeadType, setCustomLeadType] = useState('');
  const [location, setLocation] = useState('Islamabad');
  const [quantity, setQuantity] = useState(25);
  const [offerProfiles, setOfferProfiles] = useState<any[]>([]);
  const [selectedOfferProfile, setSelectedOfferProfile] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Requirements checkboxes
  const [hasWebsite, setHasWebsite] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);
  const [hasPhone, setHasPhone] = useState(true);
  const [hasWhatsapp, setHasWhatsapp] = useState(false);
  const [hasSocial, setHasSocial] = useState(false);

  // Analysis checkboxes
  const [websiteAnalysis, setWebsiteAnalysis] = useState(true);
  const [opportunityDetection, setOpportunityDetection] = useState(true);
  const [technologyDetection, setTechnologyDetection] = useState(true);

  useEffect(() => {
    fetch('/api/offer-profiles')
      .then((res) => res.json())
      .then((data) => {
        if (data.profiles && data.profiles.length > 0) {
          setOfferProfiles(data.profiles);
          setSelectedOfferProfile(data.profiles[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const targetType = customLeadType.trim() || leadType;
    if (!targetType) {
      setError('Please specify the type of leads.');
      setSubmitting(false);
      return;
    }

    if (!location.trim()) {
      setError('Please enter a target location.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadType: targetType,
          location: location.trim(),
          quantityRequested: Number(quantity) || 20,
          offerProfileId: selectedOfferProfile || undefined,
          requirements: {
            hasWebsite,
            hasEmail,
            hasPhone,
            hasWhatsapp,
            hasSocial,
          },
          analysis: {
            websiteAnalysis,
            opportunityDetection,
            technologyDetection,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create campaign');
      }

      // Navigate directly to campaign live progress
      router.push(`/campaigns/${data.campaign.id}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-primary" />
          <span>Generate Leads</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Define discovery criteria, audit parameters, and target offer profiles. Real public business data only.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error/15 border border-error/40 text-error text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 rounded-2xl bg-surface border border-border space-y-6">
        {/* Core Inputs Grid */}
        <div className="space-y-4">
          {/* Lead Type */}
          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
              What type of leads do you need? <span className="text-primary">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={leadType}
                onChange={(e) => {
                  setLeadType(e.target.value);
                  if (e.target.value !== 'Other') setCustomLeadType('');
                }}
                className="w-full bg-surface-raised border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none transition-all min-h-[44px]"
              >
                {COMMON_LEAD_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-surface text-text-primary">
                    {t}
                  </option>
                ))}
                <option value="Other" className="bg-surface text-text-primary">
                  Custom Industry / Niche...
                </option>
              </select>

              {leadType === 'Other' && (
                <input
                  type="text"
                  placeholder="e.g. Solar panel installers"
                  value={customLeadType}
                  onChange={(e) => setCustomLeadType(e.target.value)}
                  className="w-full bg-surface-raised border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none transition-all min-h-[44px]"
                  required
                />
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
              Where? (City, Region, or Country) <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Islamabad, Rawalpindi, Lahore, Karachi, Pakistan"
                className="w-full bg-surface-raised border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none transition-all min-h-[44px]"
                required
              />
            </div>
            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {COMMON_LOCATIONS.slice(0, 8).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`text-[11px] px-3 py-1.5 rounded-full border transition-all min-h-[32px] ${
                    location.toLowerCase() === loc.toLowerCase()
                      ? 'bg-primary/15 text-primary border-primary/40'
                      : 'bg-surface-raised text-text-secondary border-border hover:border-text-secondary'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Offer Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                How many leads? <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 10))}
                  className="w-full bg-surface-raised border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none transition-all min-h-[44px]"
                />
              </div>
              <p className="text-[11px] text-text-secondary/70 mt-1">
                Zero fabrication rule: System returns true qualified count without fake records.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                Offer Profile (Scoring Model)
              </label>
              <select
                value={selectedOfferProfile}
                onChange={(e) => setSelectedOfferProfile(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none transition-all min-h-[44px]"
              >
                {offerProfiles.map((p) => (
                  <option key={p.id} value={p.id} className="bg-surface text-text-primary">
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-text-secondary/70 mt-1">
                Weights opportunity score against what your company sells.
              </p>
            </div>
          </div>
        </div>

        {/* Checkboxes: Required Information & Analysis (Matching Section 8) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
          {/* Required Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Required Information
            </h3>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-text-secondary hover:text-text-primary min-h-[38px] p-1.5 rounded-lg hover:bg-surface-raised transition-colors">
                <input
                  type="checkbox"
                  checked={hasWebsite}
                  onChange={(e) => setHasWebsite(e.target.checked)}
                  className="rounded border-border bg-surface-raised text-primary focus:ring-0 w-4 h-4 shrink-0"
                />
                <span>Has website</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-text-secondary hover:text-text-primary min-h-[38px] p-1.5 rounded-lg hover:bg-surface-raised transition-colors">
                <input
                  type="checkbox"
                  checked={hasEmail}
                  onChange={(e) => setHasEmail(e.target.checked)}
                  className="rounded border-border bg-surface-raised text-primary focus:ring-0 w-4 h-4 shrink-0"
                />
                <span>Has public email</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-text-secondary hover:text-text-primary min-h-[38px] p-1.5 rounded-lg hover:bg-surface-raised transition-colors">
                <input
                  type="checkbox"
                  checked={hasPhone}
                  onChange={(e) => setHasPhone(e.target.checked)}
                  className="rounded border-border bg-surface-raised text-primary focus:ring-0 w-4 h-4 shrink-0"
                />
                <span>Has phone number</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-text-secondary hover:text-text-primary min-h-[38px] p-1.5 rounded-lg hover:bg-surface-raised transition-colors">
                <input
                  type="checkbox"
                  checked={hasWhatsapp}
                  onChange={(e) => setHasWhatsapp(e.target.checked)}
                  className="rounded border-border bg-surface-raised text-primary focus:ring-0 w-4 h-4 shrink-0"
                />
                <span>Has WhatsApp</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-text-secondary hover:text-text-primary min-h-[38px] p-1.5 rounded-lg hover:bg-surface-raised transition-colors">
                <input
                  type="checkbox"
                  checked={hasSocial}
                  onChange={(e) => setHasSocial(e.target.checked)}
                  className="rounded border-border bg-surface-raised text-primary focus:ring-0 w-4 h-4 shrink-0"
                />
                <span>Has social media</span>
              </label>
            </div>
          </div>

          {/* Analysis Options */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Deep Analysis
            </h3>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-text-secondary hover:text-text-primary min-h-[38px] p-1.5 rounded-lg hover:bg-surface-raised transition-colors">
                <input
                  type="checkbox"
                  checked={websiteAnalysis}
                  onChange={(e) => setWebsiteAnalysis(e.target.checked)}
                  className="rounded border-border bg-surface-raised text-primary focus:ring-0 w-4 h-4 shrink-0"
                />
                <span>Website analysis (Audit HTTPS, viewport, CTA, SEO)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-text-secondary hover:text-text-primary min-h-[38px] p-1.5 rounded-lg hover:bg-surface-raised transition-colors">
                <input
                  type="checkbox"
                  checked={opportunityDetection}
                  onChange={(e) => setOpportunityDetection(e.target.checked)}
                  className="rounded border-border bg-surface-raised text-primary focus:ring-0 w-4 h-4 shrink-0"
                />
                <span>Opportunity detection (Evidence-based gaps)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-text-secondary hover:text-text-primary min-h-[38px] p-1.5 rounded-lg hover:bg-surface-raised transition-colors">
                <input
                  type="checkbox"
                  checked={technologyDetection}
                  onChange={(e) => setTechnologyDetection(e.target.checked)}
                  className="rounded border-border bg-surface-raised text-primary focus:ring-0 w-4 h-4 shrink-0"
                />
                <span>Technology detection (WordPress, Shopify, Next.js, etc.)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Estimated Results Card */}
        <div className="p-4 rounded-xl bg-surface-raised border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-text-primary">Estimated results</div>
              <div className="text-[11px] text-text-secondary truncate">
                Up to {quantity} qualified leads with evidence-based scoring
              </div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-primary shrink-0 self-start sm:self-auto">
            Buffer: ~{Math.ceil(quantity * 1.5)} candidates
          </span>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[48px] py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-light text-background font-bold text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              <span>Initializing Discovery Engine...</span>
            </>
          ) : (
            <>
              <span>Generate Leads</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
