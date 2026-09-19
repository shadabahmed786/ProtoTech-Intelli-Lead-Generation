'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Globe,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Cpu,
  Layers,
  FileText,
  UserCheck,
  Clock,
  ExternalLink,
  Ban,
  Send,
  MessageSquare,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import ScorePill from '@/components/ScorePill';

const STATUS_OPTIONS = [
  'New',
  'Qualified',
  'Contacted',
  'Interested',
  'Not Interested',
  'Converted',
  'Disqualified',
  'Suppressed',
];

const TEAM_MEMBERS = ['Unassigned', 'John Doe', 'Shadab', 'Ali Khan', 'Fatima'];

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.id as string;

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [suppressing, setSuppressing] = useState(false);

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data.lead);
        setStatus(data.lead.status);
        setAssignedTo(data.lead.assignedTo || 'Unassigned');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchLead();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleAssignmentChange = async (member: string) => {
    setAssignedTo(member);
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: member === 'Unassigned' ? null : member }),
      });
      fetchLead();
    } catch (err) {
      console.error('Failed to update assignment', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent, authorName: 'John Doe' }),
      });
      if (res.ok) {
        setNoteContent('');
        fetchLead();
      }
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleSuppress = async () => {
    const reason = prompt('Enter reason for suppressing this business from future campaigns:');
    if (!reason) return;

    setSuppressing(true);
    try {
      await fetch(`/api/leads/${leadId}/suppress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      fetchLead();
    } finally {
      setSuppressing(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-text-secondary">Loading lead intelligence...</div>;
  }

  if (!lead) {
    return <div className="p-12 text-center text-error">Lead not found.</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Breadcrumb & Status Actions */}
      <div>
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leads</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-dark/20 to-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xl">
              {lead.businessName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold text-text-primary">
                  {lead.businessName}
                </h1>
                <StatusBadge status={lead.status} />
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {lead.category || 'Business'} • {lead.city}, {lead.country}
              </p>
            </div>
          </div>

          {/* Status Changer & Assignment dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Selector */}
            <div className="flex items-center gap-2 bg-surface p-1.5 rounded-xl border border-border">
              <span className="text-[11px] font-semibold text-text-secondary pl-2">Status:</span>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-surface-raised border border-border rounded-lg px-2.5 py-1 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignment Selector */}
            <div className="flex items-center gap-2 bg-surface p-1.5 rounded-xl border border-border">
              <span className="text-[11px] font-semibold text-text-secondary pl-2">Assigned:</span>
              <select
                value={assignedTo}
                onChange={(e) => handleAssignmentChange(e.target.value)}
                className="bg-surface-raised border border-border rounded-lg px-2.5 py-1 text-xs text-text-primary focus:border-primary focus:outline-none"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Suppress Button */}
            <button
              onClick={handleSuppress}
              disabled={suppressing || lead.status === 'Suppressed'}
              className="px-3 py-1.5 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/50 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{lead.status === 'Suppressed' ? 'Suppressed' : 'Suppress'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, Audit, Opportunities, Score Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Contact & Public Signals */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Contact & Public Signals
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold">Website</span>
                </div>
                {lead.website ? (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline font-medium break-all flex items-center gap-1"
                  >
                    <span>{lead.website}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-text-secondary/50 italic">No website discovered</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Phone className="w-3.5 h-3.5 text-secondary" />
                  <span className="font-semibold">Phone</span>
                </div>
                <div className="text-text-primary font-medium">
                  {lead.phone || <span className="text-text-secondary/50 italic">Not found</span>}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Mail className="w-3.5 h-3.5 text-accent" />
                  <span className="font-semibold">Public Business Email</span>
                </div>
                <div className="text-text-primary font-medium break-all">
                  {lead.email || <span className="text-text-secondary/50 italic">Not found</span>}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-raised border border-border space-y-1">
                <div className="flex items-center gap-2 text-text-secondary">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold">Address</span>
                </div>
                <div className="text-text-primary font-medium">
                  {lead.address || `${lead.city}, ${lead.country}`}
                </div>
              </div>
            </div>

            {/* Social Links */}
            {lead.socials && lead.socials.length > 0 && (
              <div className="pt-2">
                <span className="text-xs text-text-secondary font-semibold">Public Social Profiles:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {lead.socials.map((s: any) => (
                    <a
                      key={s.id}
                      href={s.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-surface-raised border border-border text-xs text-primary hover:border-primary transition-all flex items-center gap-1.5"
                    >
                      <span>{s.platform}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Explainable Scoring Breakdown (Rule 25 & 26) */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Explainable Score Breakdown
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Deterministic point assignment based on active Offer Profile signals.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-text-secondary">Quality Score</div>
                  <div className="font-mono font-bold text-sm text-[#00C896]">{lead.qualityScore}/100</div>
                </div>
                <ScorePill score={lead.opportunityScore} label="Opp Score" />
              </div>
            </div>

            <div className="rounded-xl bg-surface-raised border border-border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface text-text-secondary border-b border-border">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Detected Signal</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Score Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lead.scoreBreakdown?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-4 py-2 text-text-primary font-medium">
                        {item.signal}
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-primary">
                        +{item.points}
                      </td>
                    </tr>
                  ))}
                  {(!lead.scoreBreakdown || lead.scoreBreakdown.length === 0) && (
                    <tr>
                      <td colSpan={2} className="px-4 py-4 text-center text-text-secondary">
                        Standard baseline qualification.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Detected Opportunities with Concrete Evidence (Rule 22) */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Detected Opportunities & Concrete Evidence
            </h2>

            <div className="space-y-3">
              {lead.opportunities?.map((opp: any) => (
                <div
                  key={opp.id}
                  className="p-4 rounded-xl bg-surface-raised border border-border space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{(opp.opportunityType || opp.type || 'Opportunity').replace(/_/g, ' ').toUpperCase()}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface border border-border text-text-secondary">
                      Confidence: {opp.confidence}
                    </span>
                  </div>
                  <p className="text-xs text-text-primary font-medium">{opp.description}</p>
                  <div className="p-2 rounded-lg bg-surface border border-border/60 text-[11px] text-text-secondary font-mono">
                    <strong className="text-primary font-sans">Evidence:</strong> {opp.evidence}
                  </div>
                </div>
              ))}
              {(!lead.opportunities || lead.opportunities.length === 0) && (
                <div className="p-4 text-center text-xs text-text-secondary">
                  No critical opportunities identified for this lead.
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Website Audit Checklist (Rule 21) */}
          {lead.audit && (
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Deterministic Website Audit
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between">
                  <span>HTTPS Secure</span>
                  {lead.audit.hasHttps ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-error" />
                  )}
                </div>

                <div className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between">
                  <span>Mobile Viewport</span>
                  {lead.audit.hasMobileViewport ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-error" />
                  )}
                </div>

                <div className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between">
                  <span>Call-To-Action (CTA)</span>
                  {lead.audit.hasCta ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-error" />
                  )}
                </div>

                <div className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between">
                  <span>Direct WhatsApp</span>
                  {lead.audit.hasWhatsapp ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-error" />
                  )}
                </div>

                <div className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between">
                  <span>Services Page</span>
                  {lead.audit.hasServicesPage ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-text-secondary/50" />
                  )}
                </div>

                <div className="p-3 rounded-xl bg-surface-raised border border-border flex items-center justify-between">
                  <span>H1 Heading Tag</span>
                  {lead.audit.hasHeadingH1 ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00C896]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-text-secondary/50" />
                  )}
                </div>
              </div>

              {/* Technologies */}
              {lead.technologies && lead.technologies.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-text-secondary">Detected Technologies:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {lead.technologies.map((t: any) => (
                      <span
                        key={t.id}
                        className="px-2.5 py-1 rounded-lg bg-surface-raised border border-primary/30 text-xs text-text-primary"
                      >
                        <strong className="text-primary">{t.technology}</strong> ({t.evidence})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Provenance / Sources, Internal Notes & Activity Log */}
        <div className="space-y-6">
          {/* Provenance Card (Rule 13) */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00C896]" />
              <span>Source Provenance</span>
            </h2>
            <p className="text-[11px] text-text-secondary">
              Strict audit trail. Never fabricated.
            </p>

            <div className="space-y-2 pt-1">
              {lead.sources?.map((s: any) => (
                <div key={s.id} className="p-3 rounded-xl bg-surface-raised border border-border text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-text-primary">{s.sourceName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {s.confidence} Confidence
                    </span>
                  </div>
                  <a
                    href={s.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline break-all block truncate"
                  >
                    {s.sourceUrl}
                  </a>
                  <div className="text-[10px] text-text-secondary">
                    Discovered: {new Date(s.discoveredAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Notes (Rule 57) */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Internal Team Notes</span>
            </h2>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                placeholder="Add sales note or follow-up details..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full h-20 bg-surface-raised border border-border rounded-xl p-3 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none resize-none"
              />
              <button
                type="submit"
                disabled={submittingNote || !noteContent.trim()}
                className="w-full py-2 rounded-xl bg-primary hover:bg-primary-light text-background font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </form>

            <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
              {lead.notes?.map((n: any) => (
                <div key={n.id} className="p-3 rounded-xl bg-surface-raised border border-border text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-text-secondary">
                    <span className="font-bold text-text-primary">{n.authorName}</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-text-primary">{n.content}</p>
                </div>
              ))}
              {(!lead.notes || lead.notes.length === 0) && (
                <div className="text-center text-xs text-text-secondary py-2">
                  No internal notes yet.
                </div>
              )}
            </div>
          </div>

          {/* Activity Log (Rule 61) */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-secondary" />
              <span>Lead History Log</span>
            </h2>

            <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
              {lead.activity?.map((a: any) => (
                <div key={a.id} className="p-2.5 rounded-xl bg-surface-raised border border-border/70 space-y-0.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-primary">{a.action}</span>
                    <span className="text-text-secondary">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary">{a.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
