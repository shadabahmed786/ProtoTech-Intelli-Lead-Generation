'use client';

import React from 'react';
import { Search, Bell, Shield, Database } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search leads, domains, cities..."
          className="w-full bg-surface-raised border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      {/* Action Badges & Notifications */}
      <div className="flex items-center gap-4">
        {/* Compliance / Zero-Paid-API badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/10 border border-secondary/25 text-[11px] text-secondary font-medium">
          <Shield className="w-3.5 h-3.5" />
          <span>Free Public Sources Active</span>
        </div>

        {/* Database Mode indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-raised border border-border text-[11px] text-text-secondary">
          <Database className="w-3.5 h-3.5 text-primary" />
          <span>Local Engine (Zero Cost)</span>
        </div>

        {/* Notification Bell */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-lg bg-surface-raised border border-border text-text-secondary hover:text-text-primary hover:border-border-focus transition-all"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </button>

        {/* Quick New Lead Button */}
        <Link
          href="/generate"
          className="px-3.5 py-1.5 rounded-lg bg-primary text-background font-semibold text-xs hover:bg-primary-light transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.25)]"
        >
          <span>+ Generate</span>
        </Link>
      </div>
    </header>
  );
}
