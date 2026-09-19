'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Compass, Sparkles, ArrowRight, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary flex items-center gap-3">
            <Compass className="w-7 h-7 text-primary" />
            <span>Campaigns</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Track business discovery pipelines, verification stages, and qualification yields.
          </p>
        </div>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-background font-semibold text-xs hover:bg-primary-light transition-all shadow-[0_0_15px_rgba(0,229,255,0.25)]"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Campaign</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-text-secondary text-sm">
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-border text-center space-y-4">
          <Compass className="w-12 h-12 text-text-secondary/50 mx-auto" />
          <h3 className="text-base font-bold text-text-primary">No campaigns yet</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Create your first campaign to start discovering public business leads with zero fake records.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-background font-semibold text-xs hover:bg-primary-light"
          >
            <span>Launch First Campaign</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/campaigns/${c.id}`}
                    className="text-base font-bold text-text-primary hover:text-primary transition-colors line-clamp-1"
                  >
                    {c.name}
                  </Link>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                      c.status === 'Completed'
                        ? 'bg-[#00C896]/15 text-[#00C896] border-[#00C896]/30'
                        : c.status === 'Completed Partial'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : c.status === 'Cancelled'
                        ? 'bg-[#FF4D6D]/15 text-[#FF4D6D] border-[#FF4D6D]/30'
                        : 'bg-primary/15 text-primary border-primary/30 animate-pulse'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="text-xs text-text-secondary">
                  Target: {c.leadType} • {c.location}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span className="font-medium text-text-primary">{c.currentStage}</span>
                  <span>{c.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-300"
                    style={{ width: `${c.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Stats & Link */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <div className="flex gap-3 text-text-secondary">
                  <span>Req: <strong className="text-text-primary">{c.quantityRequested}</strong></span>
                  <span>Valid: <strong className="text-[#00C896]">{c.finalLeadsCount}</strong></span>
                  <span>Dupes: <strong className="text-text-primary">{c.duplicatesCount}</strong></span>
                </div>
                <Link
                  href={`/campaigns/${c.id}`}
                  className="text-primary hover:underline flex items-center gap-1 font-semibold text-xs"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
