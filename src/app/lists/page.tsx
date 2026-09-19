'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ListTodo, Plus, Folder, ArrowRight, Trash2 } from 'lucide-react';
import ScorePill from '@/components/ScorePill';
import StatusBadge from '@/components/StatusBadge';

export default function LeadListsPage() {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchLists = async () => {
    try {
      const res = await fetch('/api/lists');
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      if (res.ok) {
        setName('');
        setDescription('');
        fetchLists();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (id: string) => {
    if (!confirm('Are you sure you want to delete this list?')) return;
    try {
      const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary flex items-center gap-3">
          <ListTodo className="w-7 h-7 text-primary" />
          <span>Lead Lists</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Organize qualified leads into targeted segments for sales follow-up and outreach batches.
        </p>
      </div>

      {/* Create New List */}
      <form onSubmit={handleCreateList} className="p-4 sm:p-5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <input
          type="text"
          placeholder="New list name (e.g. Islamabad Dental Web Design)..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-surface-raised border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none min-h-[44px]"
          required
        />
        <input
          type="text"
          placeholder="Optional description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 bg-surface-raised border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary focus:border-primary focus:outline-none min-h-[44px]"
        />
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-background font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.2)] disabled:opacity-50 min-h-[44px] w-full sm:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create List</span>
        </button>
      </form>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-text-secondary text-xs">Loading lists...</div>
        ) : lists.length === 0 ? (
          <div className="col-span-full p-8 rounded-2xl bg-surface border border-border text-center text-text-secondary text-xs sm:text-sm">
            No custom lead lists created yet.
          </div>
        ) : (
          lists.map((l) => (
            <div key={l.id} className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2 truncate">
                    <Folder className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{l.name}</span>
                  </h3>
                  {l.description && (
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">{l.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/30">
                    {l.items?.length || 0} Leads
                  </span>
                  <button
                    onClick={() => handleDeleteList(l.id)}
                    title="Delete list"
                    aria-label="Delete list"
                    className="p-1.5 rounded-lg text-text-secondary hover:text-[#FF4D6D] hover:bg-surface-raised transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sample leads in list */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                {l.items?.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="p-2 rounded-lg bg-surface-raised flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-xs">
                    <Link href={`/leads/${item.lead.id}`} className="hover:text-primary font-medium truncate flex-1 min-w-[120px]">
                      {item.lead.businessName}
                    </Link>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <ScorePill score={item.lead.opportunityScore} />
                      <StatusBadge status={item.lead.status} />
                    </div>
                  </div>
                ))}
                {(!l.items || l.items.length === 0) && (
                  <div className="text-xs text-text-secondary italic py-1">List is currently empty.</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
