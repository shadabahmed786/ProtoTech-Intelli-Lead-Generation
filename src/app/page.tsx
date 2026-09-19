'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Target,
  Rocket,
  Star,
  ArrowRight,
  Sparkles,
  Globe,
  Mail,
  Phone,
  Compass,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import ScorePill from '@/components/ScorePill';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Live refresh for active campaigns
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Overview of your lead generation activity and evidence-based opportunities.
          </p>
        </div>
        <Link
          href="/generate"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-background font-bold text-xs sm:text-sm hover:bg-primary-light transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] min-h-[44px] w-full sm:w-auto shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate New Leads</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>

      {/* 4 Metric Cards (Matching Section 5 of design image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Leads */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between hover:border-primary/40 transition-all min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Total Leads
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-text-primary truncate">
              {loading ? '...' : (stats?.totalLeads ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#00C896] font-medium">
              <span>+{stats?.trends?.leadsLast7Days ?? 0}</span>
              <span className="text-text-secondary text-[11px]">in last 7 days</span>
            </div>
          </div>
        </div>

        {/* Qualified Leads */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between hover:border-[#00C896]/40 transition-all min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Qualified Leads
            </span>
            <div className="p-2 rounded-lg bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-text-primary truncate">
              {loading ? '...' : (stats?.qualifiedLeads ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#00C896] font-medium">
              <span>+{stats?.trends?.qualifiedLast7Days ?? 0}</span>
              <span className="text-text-secondary text-[11px]">in last 7 days</span>
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between hover:border-primary-dark/40 transition-all min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Active Campaigns
            </span>
            <div className="p-2 rounded-lg bg-primary-dark/10 text-primary-dark border border-primary-dark/20">
              <Rocket className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-text-primary truncate">
              {loading ? '...' : (stats?.activeCampaigns ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-primary font-medium">
              <span>{stats?.activeCampaigns ?? 0} running</span>
              <span className="text-text-secondary text-[11px]">in background</span>
            </div>
          </div>
        </div>

        {/* High Opportunity Leads */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between hover:border-amber-400/40 transition-all min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-secondary">
              High Opportunity Leads
            </span>
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <div className="text-2xl sm:text-3xl font-bold text-text-primary truncate">
              {loading ? '...' : (stats?.highOpportunityLeads ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-400 font-medium">
              <span>+{stats?.trends?.highOppLast7Days ?? 0}</span>
              <span className="text-text-secondary text-[11px]">in last 7 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Featured Lead Card (Section 6 mockup) + Recent Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Opportunity Spotlight & Table preview */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-text-primary flex items-center gap-2 min-w-0">
              <span className="truncate">High Opportunity Spotlight</span>
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 shrink-0">
                Top Matches
              </span>
            </h2>
            <Link href="/leads" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium shrink-0">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Business Card Preview matching Section 6 */}
          {stats?.recentLeads?.[0] ? (
            <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-all shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-primary-dark/20 to-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-base sm:text-lg shrink-0">
                    {stats.recentLeads[0].businessName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-text-primary truncate">
                      {stats.recentLeads[0].businessName}
                    </h3>
                    <div className="text-xs text-text-secondary truncate">
                      {stats.recentLeads[0].category || 'Business'} • {stats.recentLeads[0].city},{' '}
                      {stats.recentLeads[0].country}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30">
                    High Opportunity
                  </span>
                  <ScorePill score={stats.recentLeads[0].opportunityScore} />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs text-text-secondary pt-2">
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{stats.recentLeads[0].website || 'No website found'}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <Mail className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span className="truncate">{stats.recentLeads[0].email || 'No public email'}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <Phone className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="truncate">{stats.recentLeads[0].phone || 'No phone number'}</span>
                </div>
              </div>

              {/* Badges: Tech & Opportunities */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                {stats.recentLeads[0].technologies?.map((t: any) => (
                  <span key={t.id} className="px-2 py-0.5 rounded bg-surface-raised border border-border text-[11px] text-text-primary">
                    {t.technology}
                  </span>
                ))}
                {stats.recentLeads[0].opportunities?.map((o: any) => (
                  <span key={o.id} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 font-medium capitalize">
                    {(o.opportunityType || o.type || 'Opportunity').replace(/_/g, ' ')}
                  </span>
                ))}
                <Link
                  href={`/leads/${stats.recentLeads[0].id}`}
                  className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-end gap-1 text-xs text-primary hover:text-primary-light font-semibold pt-1 sm:pt-0"
                >
                  <span>Inspect Audit & Evidence</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border text-center text-text-secondary text-xs sm:text-sm">
              No leads available yet. Launch a campaign to start discovering!
            </div>
          )}

          {/* Table / Mobile Cards Preview */}
          <div className="rounded-2xl bg-surface border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary">Recent Discoveries</h3>
              <span className="text-xs text-text-secondary">
                Showing {stats?.recentLeads?.length || 0} leads
              </span>
            </div>

            {/* Mobile Lead Cards (< sm: 640px) */}
            <div className="sm:hidden divide-y divide-border">
              {stats?.recentLeads && stats.recentLeads.length > 0 ? (
                stats.recentLeads.map((lead: any) => (
                  <div key={lead.id} className="p-4 space-y-2.5 hover:bg-surface-hover transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/leads/${lead.id}`} className="font-bold text-text-primary hover:text-primary text-xs truncate flex-1">
                        {lead.businessName}
                      </Link>
                      <StatusBadge status={lead.status} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-text-secondary">
                      <span>{lead.city || 'Pakistan'} • {lead.category || 'Business'}</span>
                      <ScorePill score={lead.opportunityScore} />
                    </div>
                    <div className="pt-1 flex justify-end">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-text-secondary text-xs">
                  No leads discovered yet. Launch a campaign to start discovering live leads.
                </div>
              )}
            </div>

            {/* Desktop / Tablet Table (>= sm: 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-raised text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Business</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats?.recentLeads && stats.recentLeads.length > 0 ? (
                    stats.recentLeads.map((lead: any) => (
                      <tr key={lead.id} className="hover:bg-surface-hover transition-colors">
                        <td className="px-4 py-3 font-medium text-text-primary">
                          <Link href={`/leads/${lead.id}`} className="hover:text-primary flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] text-primary">
                              {lead.businessName.charAt(0)}
                            </div>
                            <span className="truncate max-w-[180px]">{lead.businessName}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{lead.city || 'Pakistan'}</td>
                        <td className="px-4 py-3">
                          <ScorePill score={lead.opportunityScore} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={lead.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-text-secondary text-xs">
                        No leads discovered yet. Launch a campaign to start discovering live leads.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Active & Recent Campaigns */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Recent Campaigns</h2>
            <Link href="/campaigns" className="text-xs text-primary hover:underline font-medium">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentCampaigns && stats.recentCampaigns.length > 0 ? (
              stats.recentCampaigns.map((camp: any) => (
                <div
                  key={camp.id}
                  className="p-4 rounded-xl bg-surface border border-border hover:border-primary/40 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/campaigns/${camp.id}`}
                        className="font-bold text-sm text-text-primary hover:text-primary transition-colors line-clamp-1"
                      >
                        {camp.name}
                      </Link>
                      <div className="text-[11px] text-text-secondary mt-0.5">
                        {camp.leadType} • {camp.location}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        camp.status === 'Completed'
                          ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/30'
                          : camp.status === 'Completed Partial'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : camp.status === 'Cancelled'
                          ? 'bg-[#FF4D6D]/10 text-[#FF4D6D] border-[#FF4D6D]/30'
                          : 'bg-primary/10 text-primary border-primary/30 animate-pulse'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-text-secondary">
                      <span>{camp.currentStage}</span>
                      <span>{camp.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-raised overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500"
                        style={{ width: `${camp.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Counts */}
                  <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1 border-t border-border/50">
                    <span>Req: {camp.quantityRequested}</span>
                    <span className="text-primary font-semibold">Valid: {camp.finalLeadsCount}</span>
                    <span>Dupes: {camp.duplicatesCount}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-xl bg-surface border border-border text-center text-xs text-text-secondary">
                No campaigns yet. Launch your first campaign to begin discovery.
              </div>
            )}
          </div>

          {/* Pipeline Guarantee Callout */}
          <div className="p-4 rounded-xl bg-surface-raised border border-border/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#00C896]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero-Fabrication Guarantee</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              ProtoTech Intelli prioritizes Accuracy &gt; Evidence &gt; Relevance &gt; Quantity. The system never creates artificial placeholder businesses to reach numbers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
