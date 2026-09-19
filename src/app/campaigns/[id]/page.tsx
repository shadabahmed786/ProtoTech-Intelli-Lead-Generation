'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  ArrowLeft,
  RefreshCw,
  XCircle,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Users,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import ScorePill from '@/components/ScorePill';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign);
        if (
          data.campaign &&
          !['Completed', 'Completed Partial', 'Cancelled', 'Failed'].includes(data.campaign.status)
        ) {
          fetch(`/api/campaigns/${campaignId}/process`, { method: 'POST' }).catch(() => {});
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
    // Poll every 2.5 seconds while active
    const interval = setInterval(() => {
      if (
        campaign &&
        !['Completed', 'Completed Partial', 'Cancelled', 'Failed'].includes(campaign.status)
      ) {
        fetchCampaign();
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [campaignId, campaign?.status]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this campaign?')) return;
    setCancelling(true);
    try {
      await fetch(`/api/campaigns/${campaignId}`, { method: 'DELETE' });
      await fetchCampaign();
    } finally {
      setCancelling(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await fetch(`/api/campaigns/${campaignId}/retry`, { method: 'POST' });
      await fetchCampaign();
    } finally {
      setRetrying(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
      const data = await res.json();
      if (data.csvContent) {
        const blob = new Blob([data.csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', data.filename || `campaign-${campaignId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      alert('Export failed: ' + err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-text-secondary">Loading campaign details...</div>;
  }

  if (!campaign) {
    return <div className="p-12 text-center text-error">Campaign not found.</div>;
  }

  const isRunning = [
    'Queued',
    'Discovering',
    'Extracting',
    'Verifying',
    'Analyzing',
    'Scoring',
  ].includes(campaign.status);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Campaigns</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-text-primary">
                {campaign.name}
              </h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                  campaign.status === 'Completed'
                    ? 'bg-[#00C896]/15 text-[#00C896] border-[#00C896]/30'
                    : campaign.status === 'Completed Partial'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : campaign.status === 'Cancelled'
                    ? 'bg-[#FF4D6D]/15 text-[#FF4D6D] border-[#FF4D6D]/30'
                    : 'bg-primary/15 text-primary border-primary/30 animate-pulse'
                }`}
              >
                {campaign.status}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Target: <strong className="text-text-primary">{campaign.leadType}</strong> in{' '}
              <strong className="text-text-primary">{campaign.location}</strong> • Profile:{' '}
              <span className="text-primary font-medium">{campaign.offerProfile?.name || 'Default Web Dev'}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isRunning && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-3.5 py-2 rounded-xl bg-error/15 text-error border border-error/30 hover:bg-error/25 font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{cancelling ? 'Stopping...' : 'Cancel Campaign'}</span>
              </button>
            )}

            {!isRunning && (
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-text-primary hover:border-primary font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                <span>Retry Campaign</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              disabled={exporting || campaign.finalLeadsCount === 0}
              className="px-3.5 py-2 rounded-xl bg-primary text-background font-semibold text-xs hover:bg-primary-light transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.2)] disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Stage & Bar */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {isRunning ? (
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
            )}
            <span className="font-bold text-text-primary text-sm">
              Stage: {campaign.currentStage}
            </span>
          </div>
          <span className="font-mono font-bold text-primary text-sm">
            {campaign.progressPercent}%
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-surface-raised overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-accent to-primary-dark transition-all duration-500"
            style={{ width: `${campaign.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Metric Counters (Requested vs Discovered vs Valid vs Duplicates vs Rejected vs Final Leads) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="text-[10px] uppercase font-semibold text-text-secondary">Requested</div>
          <div className="text-2xl font-bold text-text-primary mt-1">{campaign.quantityRequested}</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="text-[10px] uppercase font-semibold text-text-secondary">Discovered</div>
          <div className="text-2xl font-bold text-primary mt-1">{campaign.discoveredCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="text-[10px] uppercase font-semibold text-text-secondary">Valid / Qual</div>
          <div className="text-2xl font-bold text-[#00C896] mt-1">{campaign.validCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="text-[10px] uppercase font-semibold text-text-secondary">Duplicates</div>
          <div className="text-2xl font-bold text-text-secondary mt-1">{campaign.duplicatesCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="text-[10px] uppercase font-semibold text-text-secondary">Rejected</div>
          <div className="text-2xl font-bold text-text-secondary mt-1">{campaign.rejectedCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-primary/40 bg-primary/5">
          <div className="text-[10px] uppercase font-semibold text-primary">Final Leads</div>
          <div className="text-2xl font-bold text-text-primary mt-1">{campaign.finalLeadsCount}</div>
        </div>
      </div>

      {/* 2 Cols: Discovered Leads Table + Live Event Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discovered Leads List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">
              Discovered Leads ({campaign.leads?.length || 0})
            </h2>
            <Link
              href={`/leads?campaignId=${campaign.id}`}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Filter in Leads table
            </Link>
          </div>

          <div className="rounded-2xl bg-surface border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-raised text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Business</th>
                    <th className="px-4 py-3">Contact Signals</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campaign.leads?.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-4 py-3 font-medium text-text-primary">
                        <Link href={`/leads/${lead.id}`} className="hover:text-primary">
                          <div className="font-bold">{lead.businessName}</div>
                          <div className="text-[11px] text-text-secondary">
                            {lead.city || 'Pakistan'} • {lead.category}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              lead.website ? 'bg-primary/10 text-primary' : 'bg-surface-raised text-text-secondary/50'
                            }`}
                          >
                            {lead.website ? 'Web' : 'No Web'}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              lead.phone ? 'bg-[#00C896]/10 text-[#00C896]' : 'bg-surface-raised text-text-secondary/50'
                            }`}
                          >
                            {lead.phone ? 'Phone' : 'No Phone'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ScorePill score={lead.opportunityScore} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="text-primary hover:text-primary-light font-semibold text-xs flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!campaign.leads || campaign.leads.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-text-secondary">
                        Discovery in progress... candidate businesses will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Event Log Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">Real Activity Stream</h2>
            <span className="text-[10px] uppercase tracking-wider text-text-secondary font-mono">
              Live Audit Log
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border space-y-3 max-h-[480px] overflow-y-auto font-mono text-xs">
            {campaign.events?.map((ev: any) => (
              <div
                key={ev.id}
                className="p-2.5 rounded-lg bg-surface-raised border border-border/70 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span
                    className={`font-bold uppercase ${
                      ev.level === 'error'
                        ? 'text-error'
                        : ev.level === 'warning'
                        ? 'text-amber-400'
                        : ev.level === 'success'
                        ? 'text-[#00C896]'
                        : 'text-primary'
                    }`}
                  >
                    [{ev.stage}]
                  </span>
                  <span className="text-text-secondary">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-text-primary text-[11px] font-sans leading-tight">
                  {ev.message}
                </p>
              </div>
            ))}
            {(!campaign.events || campaign.events.length === 0) && (
              <div className="text-center py-6 text-text-secondary text-xs">
                No events recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
