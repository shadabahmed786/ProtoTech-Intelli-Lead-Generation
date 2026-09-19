'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Shield, Ban, Clock, Server, CheckCircle2, Plus } from 'lucide-react';

export default function SettingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New suppression form
  const [suppType, setSuppType] = useState('domain');
  const [suppValue, setSuppValue] = useState('');
  const [suppReason, setSuppReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleAddSuppression = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppValue.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: suppType,
          value: suppValue.trim(),
          reason: suppReason.trim() || 'Manual admin suppression',
        }),
      });

      if (res.ok) {
        setSuppValue('');
        setSuppReason('');
        fetchSettings();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary flex items-center gap-3">
          <Settings className="w-7 h-7 text-primary" />
          <span>System Settings & Governance</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Review crawl safety limits, manage the suppression blocklist, and monitor audit events.
        </p>
      </div>

      {/* System Governance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>SSRF Protection</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-[#00C896] flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Active & Enforced</span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Blocks private IP ranges (127.0.0.0/8, 10.0.0.0/8, 192.168.0.0/16, cloud metadata 169.254.169.254, and internal hostnames).
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Server className="w-4 h-4" />
            <span>Crawler Limits</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-text-primary">
            Max 5 Pages / Business
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Conservative polite crawl: Homepage, About, Contact, Services. Max 1 MB payload, 8s timeout, respects robots.txt.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Cost Transparency</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-[#00C896]">
            $0.00 (100% Free V1)
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Zero paid APIs utilized. Uses OpenStreetMap Overpass, public registries, and direct website verification.
          </p>
        </div>
      </div>

      {/* Suppression List Management (Rule 29) */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>Suppression Blocklist</span>
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Businesses or domains listed here are automatically disqualified and excluded from all future campaigns.
            </p>
          </div>
        </div>

        {/* Add suppression item */}
        <form onSubmit={handleAddSuppression} className="p-3.5 sm:p-4 rounded-xl bg-surface-raised border border-border flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <select
            value={suppType}
            onChange={(e) => setSuppType(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2.5 min-h-[44px] text-xs text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="domain">Domain</option>
            <option value="phone">Phone Number</option>
            <option value="email">Email</option>
            <option value="name">Business Name</option>
          </select>
          <input
            type="text"
            placeholder="Value to suppress (e.g. competitor.com or +92300...)"
            value={suppValue}
            onChange={(e) => setSuppValue(e.target.value)}
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 min-h-[44px] text-xs text-text-primary focus:border-primary focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Reason (e.g. Do Not Contact / Existing Client)"
            value={suppReason}
            onChange={(e) => setSuppReason(e.target.value)}
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 min-h-[44px] text-xs text-text-primary focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2.5 min-h-[44px] w-full sm:w-auto rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-100 border border-rose-700/50 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Blocklist</span>
          </button>
        </form>

        {/* Current suppressions table */}
        <div className="rounded-xl bg-surface-raised border border-border overflow-x-auto">
          <table className="w-full min-w-[550px] text-left text-xs">
            <thead className="bg-surface text-text-secondary border-b border-border text-[10px] uppercase">
              <tr>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Suppressed Value</th>
                <th className="px-4 py-2.5">Reason</th>
                <th className="px-4 py-2.5">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.suppressions?.map((s: any) => (
                <tr key={s.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-2 font-semibold uppercase text-[10px] text-text-secondary">
                    {s.type}
                  </td>
                  <td className="px-4 py-2 font-mono font-bold text-rose-300">
                    {s.value}
                  </td>
                  <td className="px-4 py-2 text-text-secondary">
                    {s.reason || 'No reason specified'}
                  </td>
                  <td className="px-4 py-2 text-text-secondary">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!data?.suppressions || data.suppressions.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-text-secondary">
                    No suppressed entries in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log (Rule 95) */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-border space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary flex-shrink-0" />
          <span>System Audit Log</span>
        </h2>

        <div className="rounded-xl bg-surface-raised border border-border overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="bg-surface text-text-secondary border-b border-border text-[10px] uppercase">
              <tr>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Entity</th>
                <th className="px-4 py-2.5">Details</th>
                <th className="px-4 py-2.5">Actor</th>
                <th className="px-4 py-2.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.auditLogs?.map((log: any) => (
                <tr key={log.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-2 font-bold text-primary">{log.action}</td>
                  <td className="px-4 py-2 text-text-secondary">{log.entityType}</td>
                  <td className="px-4 py-2 text-text-primary">{log.details}</td>
                  <td className="px-4 py-2 font-semibold text-text-secondary">{log.actor}</td>
                  <td className="px-4 py-2 text-text-secondary font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!data?.auditLogs || data.auditLogs.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-text-secondary">
                    No audit log events recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
