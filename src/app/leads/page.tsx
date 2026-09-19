'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  FileSpreadsheet,
  ListPlus,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Globe,
  Mail,
  Phone,
  CheckSquare,
  Square,
  Sparkles,
  Folder,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import ScorePill from '@/components/ScorePill';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All');
  const [status, setStatus] = useState('All');
  const [minScore, setMinScore] = useState('');
  const [hasWebsite, setHasWebsite] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Selected for batch export & list adding
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  // Lists state
  const [lists, setLists] = useState<any[]>([]);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState('');
  const [addingToList, setAddingToList] = useState(false);
  const [listMessage, setListMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const q = sp.get('search') || sp.get('q');
      if (q) {
        setSearch(q);
      }
    }
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (city !== 'All') params.set('city', city);
      if (status !== 'All') params.set('status', status);
      if (minScore) params.set('minScore', minScore);
      if (hasWebsite === 'true') params.set('hasWebsite', 'true');
      if (hasWebsite === 'false') params.set('hasWebsite', 'false');
      params.set('page', page.toString());
      params.set('limit', '15');

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setTotal(data.pagination.total || 0);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, city, status, minScore, hasWebsite]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchExport = async () => {
    setExporting(true);
    try {
      const ids = Array.from(selectedIds);
      const res = await fetch('/api/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: ids.length > 0 ? ids : undefined }),
      });
      const data = await res.json();
      if (data.csvContent) {
        const blob = new Blob([data.csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', data.filename || 'leads-export.csv');
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

  const fetchLists = async () => {
    try {
      const res = await fetch('/api/lists');
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists || []);
        if (data.lists?.length > 0) setSelectedListId(data.lists[0].id);
      }
    } catch {}
  };

  const handleAddBatchToList = async () => {
    if (!selectedListId) return;
    setAddingToList(true);
    setListMessage('');
    try {
      for (const leadId of Array.from(selectedIds)) {
        await fetch(`/api/lists/${selectedListId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId }),
        });
      }
      setListMessage(`Added ${selectedIds.size} leads to list!`);
      setTimeout(() => {
        setShowListModal(false);
        setListMessage('');
        setSelectedIds(new Set());
      }, 1200);
    } catch (e: any) {
      setListMessage('Error: ' + e.message);
    } finally {
      setAddingToList(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary flex items-center gap-3">
            <Users className="w-7 h-7 text-primary" />
            <span>Leads</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Search, filter, and inspect verified business leads with deterministic opportunity scores.
          </p>
        </div>

        {/* Batch Action Buttons */}
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={() => {
                fetchLists();
                setShowListModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-surface-raised border border-border hover:border-primary/40 text-text-primary font-semibold text-xs transition-all flex items-center gap-2"
            >
              <ListPlus className="w-4 h-4 text-primary" />
              <span>Add to List ({selectedIds.size})</span>
            </button>
          )}
          <button
            onClick={handleBatchExport}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-primary text-background font-semibold text-xs hover:bg-primary-light transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.25)] disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>
              {selectedIds.size > 0
                ? `Export Selected (${selectedIds.size})`
                : 'Export All Matching CSV'}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by business name, domain, email, phone, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none min-h-[44px]"
              />
            </div>
            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden px-3.5 py-2.5 rounded-xl bg-surface-raised border border-border hover:border-primary text-text-primary text-xs font-semibold flex items-center gap-1.5 min-h-[44px] shrink-0"
            >
              <Filter className="w-4 h-4 text-primary" />
              <span>Filters</span>
              {(city !== 'All' || status !== 'All' || minScore || hasWebsite !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-2 ${
              showMobileFilters ? 'block' : 'hidden md:flex'
            }`}
          >
            {/* City Filter */}
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-auto bg-surface-raised border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none min-h-[44px]"
            >
              <option value="All">All Cities</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Abbottabad">Abbottabad</option>
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-auto bg-surface-raised border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none min-h-[44px]"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Qualified">Qualified</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Converted">Converted</option>
              <option value="Disqualified">Disqualified</option>
              <option value="Suppressed">Suppressed</option>
            </select>

            {/* Min Score Filter */}
            <select
              value={minScore}
              onChange={(e) => {
                setMinScore(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-auto bg-surface-raised border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none min-h-[44px]"
            >
              <option value="">Any Score</option>
              <option value="80">Score ≥ 80 (High Opp)</option>
              <option value="60">Score ≥ 60</option>
              <option value="40">Score ≥ 40</option>
            </select>

            {/* Has Website Filter */}
            <select
              value={hasWebsite}
              onChange={(e) => {
                setHasWebsite(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-auto bg-surface-raised border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none min-h-[44px]"
            >
              <option value="all">Website: Any</option>
              <option value="false">No Website (Redesign)</option>
              <option value="true">Has Website</option>
            </select>

            <button
              type="submit"
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-surface-raised border border-border text-text-primary hover:border-primary text-xs font-semibold min-h-[44px]"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Main Leads Display: Mobile Cards (< md) & Table Container (>= md) */}
      <div className="rounded-2xl bg-surface border border-border overflow-hidden">
        {/* Mobile Lead Cards (< md) */}
        <div className="md:hidden divide-y divide-border">
          {loading ? (
            <div className="p-8 text-center text-text-secondary text-xs">Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-xs">
              No leads found matching your criteria.
            </div>
          ) : (
            leads.map((lead) => {
              const isSelected = selectedIds.has(lead.id);

              return (
                <div
                  key={lead.id}
                  className={`p-4 space-y-3 hover:bg-surface-hover transition-colors ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelect(lead.id)}
                      aria-label={`Select lead ${lead.businessName}`}
                      className="mt-0.5 text-text-secondary hover:text-primary p-1 min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-bold text-sm text-text-primary hover:text-primary block truncate"
                      >
                        {lead.businessName}
                      </Link>
                      <div className="text-xs text-text-secondary truncate mt-0.5">
                        {lead.category || 'Business'} • {lead.city || 'Pakistan'}, {lead.country}
                      </div>
                    </div>
                  </div>

                  {/* Signals */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline truncate flex items-center gap-1"
                      >
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    ) : (
                      <span className="text-text-secondary/50 italic text-[11px]">No website</span>
                    )}
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-text-primary hover:text-primary truncate flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                        <span className="truncate">{lead.phone}</span>
                      </a>
                    ) : (
                      <span className="text-text-secondary/50 italic text-[11px]">No phone</span>
                    )}
                  </div>

                  {/* Badges and action */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <ScorePill score={lead.opportunityScore} />
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-raised border border-border text-text-secondary">
                        Qual: {lead.qualityScore}%
                      </span>
                      <StatusBadge status={lead.status} />
                    </div>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="px-3 py-1.5 rounded-lg bg-surface-raised border border-border hover:border-primary text-text-primary text-xs font-semibold shrink-0 min-h-[36px] flex items-center justify-center"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop / Tablet Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-raised text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="px-4 py-3 w-10">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    aria-label="Select all leads"
                    className="text-text-secondary hover:text-primary"
                  >
                    {leads.length > 0 && selectedIds.size === leads.length ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-center">Score</th>
                <th className="px-4 py-3 text-center">Quality</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-secondary">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-secondary">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isSelected = selectedIds.has(lead.id);

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-surface-hover transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSelect(lead.id)}
                          aria-label={`Select lead ${lead.businessName}`}
                          className="text-text-secondary hover:text-primary"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-text-primary">
                        <Link href={`/leads/${lead.id}`} className="hover:text-primary flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {lead.businessName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-text-primary hover:text-primary">
                              {lead.businessName}
                            </div>
                            <div className="text-[11px] text-text-secondary">
                              {lead.category || 'Business'}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        <div>{lead.city || 'Pakistan'}</div>
                        <div className="text-[10px] text-text-secondary/70">{lead.country}</div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        <div className="flex flex-col gap-0.5">
                          {lead.website ? (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 truncate max-w-[160px]"
                            >
                              <Globe className="w-3 h-3 shrink-0" />
                              <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
                            </a>
                          ) : (
                            <span className="text-text-secondary/50 italic text-[11px]">No website</span>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-[11px]">
                              <Phone className="w-3 h-3 text-text-secondary shrink-0" />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ScorePill score={lead.opportunityScore} />
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-semibold text-text-secondary">
                        {lead.qualityScore}%
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="px-2.5 py-1 rounded-lg bg-surface-raised border border-border text-text-primary hover:border-primary font-semibold text-xs inline-block transition-all"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
          <div className="text-center sm:text-left">
            Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total} leads
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-surface-raised border border-border text-text-primary hover:border-primary disabled:opacity-40 min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-bold text-text-primary">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-surface-raised border border-border text-text-primary hover:border-primary disabled:opacity-40 min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Batch to List Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-border p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Folder className="w-4 h-4 text-primary" />
                <span>Add {selectedIds.size} Leads to List</span>
              </h3>
              <button
                onClick={() => setShowListModal(false)}
                className="text-text-secondary hover:text-text-primary text-xs"
              >
                ✕
              </button>
            </div>

            {listMessage && (
              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs">
                {listMessage}
              </div>
            )}

            {lists.length === 0 ? (
              <div className="text-center py-4 text-xs text-text-secondary">
                No lists created yet.{' '}
                <Link href="/lists" className="text-primary hover:underline">
                  Create a list first
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-text-secondary">Select Target List:</label>
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="w-full bg-surface-raised border border-border rounded-xl p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
                >
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.items?.length || 0} leads)
                    </option>
                  ))}
                </select>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowListModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-surface-raised text-text-secondary hover:text-text-primary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBatchToList}
                    disabled={addingToList}
                    className="px-4 py-1.5 rounded-lg bg-primary text-background font-semibold text-xs hover:bg-primary-light transition-all disabled:opacity-50"
                  >
                    {addingToList ? 'Adding...' : `Add (${selectedIds.size})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
