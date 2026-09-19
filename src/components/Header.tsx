'use client';

import React, { useState } from 'react';
import { Search, Bell, Shield, Cpu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onOpenMobileNav?: () => void;
}

export default function Header({ onOpenMobileNav }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left Area: Mobile Menu Hamburger & Mobile Brand */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-xl bg-surface-raised border border-border text-text-secondary hover:text-text-primary hover:border-primary transition-all min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0"
          >
            <span className="text-lg leading-none font-bold">☰</span>
          </button>
        )}

        {/* Mobile Brand Logo Mark (visible only when sidebar is hidden) */}
        <Link href="/" className="flex items-center gap-2 lg:hidden shrink-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-primary/40 bg-black/40 p-0.5 shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
            <img src="/logo.png" alt="ProtoTech" className="w-full h-full object-cover" />
          </div>
          <span className="hidden min-[400px]:inline font-bold text-text-primary text-sm tracking-tight truncate">
            Proto<span className="text-primary">Tech</span>
          </span>
        </Link>
      </div>

      {/* Center/Search Input - Fluid responsive width */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-[200px] sm:max-w-xs md:max-w-sm lg:w-80 min-w-0">
        <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search leads, cities..."
          className="w-full bg-surface-raised border border-border rounded-xl pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[38px]"
        />
      </form>

      {/* Right Area: Badges & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Compliance / Free-First badge (tablet/desktop only) */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/10 border border-secondary/25 text-[11px] text-secondary font-medium">
          <Shield className="w-3.5 h-3.5" />
          <span>Public Verified</span>
        </div>

        {/* Engine status indicator (large screens only) */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-raised border border-border text-[11px] text-text-secondary">
          <Cpu className="w-3.5 h-3.5 text-primary" />
          <span>Production Engine</span>
        </div>

        {/* Notification Bell */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-xl bg-surface-raised border border-border text-text-secondary hover:text-text-primary hover:border-border-focus transition-all min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </button>

        {/* Quick New Lead Button */}
        <Link
          href="/generate"
          className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-light transition-all flex items-center gap-1 sm:gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.25)] min-h-[38px] shrink-0"
        >
          <span className="text-sm font-extrabold leading-none">+</span>
          <span className="hidden sm:inline">Generate</span>
        </Link>
      </div>
    </header>
  );
}
