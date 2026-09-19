'use client';

import React, { useEffect, useState } from 'react';
import { Target, Plus, CheckCircle2, Sliders, Shield, Trash2 } from 'lucide-react';

export default function OfferProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetIndustries, setTargetIndustries] = useState('');
  const [targetLocations, setTargetLocations] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/offer-profiles');
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer profile?')) return;
    try {
      const res = await fetch(`/api/offer-profiles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProfiles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      const industries = targetIndustries
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);
      const locations = targetLocations
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      const res = await fetch('/api/offer-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          targetIndustries: industries,
          targetLocations: locations,
          signalWeights: {
            no_website: 25,
            outdated_website: 20,
            missing_mobile_viewport: 15,
            no_https: 15,
            missing_contact_cta: 10,
            missing_whatsapp: 10,
            weak_seo: 10,
            relevant_industry: 5,
            relevant_location: 5,
          },
        }),
      });

      if (res.ok) {
        setName('');
        setDescription('');
        setTargetIndustries('');
        setTargetLocations('');
        fetchProfiles();
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary flex items-center gap-3">
          <Target className="w-7 h-7 text-primary" />
          <span>Offer Profiles</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Configure deterministic scoring models based on what services ProtoTech offers to clients.
        </p>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-8 text-text-secondary">Loading profiles...</div>
        ) : (
          profiles.map((p) => {
            const industries = JSON.parse(p.targetIndustries || '[]');
            const locations = JSON.parse(p.targetLocations || '[]');
            const weights = JSON.parse(p.signalWeights || '{}');

            return (
              <div
                key={p.id}
                className="p-6 rounded-2xl bg-surface border border-border space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-text-primary">{p.name}</h3>
                    <div className="flex items-center gap-2">
                      {p.isDefault ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/30">
                          Default Profile
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeleteProfile(p.id)}
                          title="Delete profile"
                          className="p-1 rounded text-text-secondary hover:text-[#FF4D6D] transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {p.description && (
                    <p className="text-xs text-text-secondary">{p.description}</p>
                  )}
                </div>

                {/* Target Industries & Locations */}
                <div className="space-y-2 text-xs pt-2 border-t border-border">
                  <div>
                    <span className="text-[11px] font-semibold text-text-secondary uppercase">
                      Target Industries:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {industries.map((ind: string) => (
                        <span key={ind} className="px-2 py-0.5 rounded bg-surface-raised border border-border text-[11px] text-text-primary">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-text-secondary uppercase">
                      Target Locations:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {locations.map((loc: string) => (
                        <span key={loc} className="px-2 py-0.5 rounded bg-surface-raised border border-border text-[11px] text-text-secondary">
                          {loc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scoring Weights */}
                <div className="pt-2 border-t border-border">
                  <span className="text-[11px] font-semibold text-text-secondary uppercase block mb-1.5">
                    Signal Weights (Max 100):
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                    {Object.entries(weights).map(([k, v]) => (
                      <div key={k} className="flex justify-between bg-surface-raised px-2 py-1 rounded">
                        <span className="text-text-secondary capitalize truncate">{k.replace(/_/g, ' ')}</span>
                        <span className="text-primary font-bold">+{v as any}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create New Offer Profile Form */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          <span>Add New Custom Offer Profile</span>
        </h2>

        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-text-primary uppercase mb-1">
                Profile Name
              </label>
              <input
                type="text"
                placeholder="e.g. E-Commerce Redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-xl px-4 py-2 text-text-primary focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-text-primary uppercase mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="What this profile sells..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-xl px-4 py-2 text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-text-primary uppercase mb-1">
                Target Industries (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Fashion, Retail, Supermarkets"
                value={targetIndustries}
                onChange={(e) => setTargetIndustries(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-xl px-4 py-2 text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-text-primary uppercase mb-1">
                Target Locations (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Islamabad, Lahore, Karachi"
                value={targetLocations}
                onChange={(e) => setTargetLocations(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded-xl px-4 py-2 text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-light transition-all flex items-center gap-2 shadow-[0_0_12px_rgba(0,229,255,0.2)] disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Create Offer Profile</span>
          </button>
        </form>
      </div>
    </div>
  );
}
