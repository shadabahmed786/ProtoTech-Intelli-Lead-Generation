'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  Users,
  ListTodo,
  FileSpreadsheet,
  Target,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Generate Leads', href: '/generate', icon: Sparkles },
  { label: 'Campaigns', href: '/campaigns', icon: Compass },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Lists', href: '/lists', icon: ListTodo },
  { label: 'Exports', href: '/exports', icon: FileSpreadsheet },
  { label: 'Offer Profiles', href: '/offer-profiles', icon: Target },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/login');
    router.refresh();
  };

  const getInitials = (name?: string) => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="w-full lg:w-64 bg-surface border-r border-border flex flex-col justify-between h-full lg:h-screen lg:sticky lg:top-0 select-none overflow-y-auto shadow-2xl lg:shadow-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 sm:p-6 pb-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() => onClose?.()}
              className="flex items-center gap-3 group min-w-0"
            >
              {/* ProtoTech Brand Logo */}
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-primary/40 flex items-center justify-center bg-black/40 group-hover:border-primary transition-all shadow-[0_0_15px_rgba(0,229,255,0.25)] shrink-0">
                <img
                  src="/logo.png"
                  alt="ProtoTech Solution"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-text-primary text-base sm:text-lg tracking-tight">ProtoTech</span>
                  <span className="font-bold text-primary text-base sm:text-lg tracking-tight">Intelli</span>
                </div>
                <div className="text-[10px] sm:text-[11px] font-medium tracking-wider text-text-secondary uppercase truncate">
                  Lead Generation
                </div>
              </div>
            </Link>

            {/* Close button for mobile drawer */}
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close navigation"
                className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors shrink-0 ml-1 min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-text-secondary/70 italic mt-2">
            Find. Understand. Convert.
          </p>
        </div>

        {/* Navigation links */}
        <nav className="p-3 sm:p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose?.()}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_12px_rgba(0,229,255,0.12)]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-text-secondary'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User / Workspace Footer with Live Data & Logout */}
      <div className="p-4 border-t border-border/60">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-raised border border-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-dark to-primary flex items-center justify-center font-bold text-xs text-background shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="leading-tight truncate">
              <div className="text-xs font-semibold text-text-primary truncate">
                {user?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-text-secondary">
                {user?.role || 'Admin'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="p-1.5 rounded-lg text-text-secondary hover:text-[#FF4D6D] hover:bg-surface transition-all shrink-0 ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
