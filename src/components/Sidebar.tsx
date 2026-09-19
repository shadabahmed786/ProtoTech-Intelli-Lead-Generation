'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  Users,
  ListTodo,
  FileSpreadsheet,
  Target,
  Settings,
  ShieldCheck,
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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col justify-between h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-6 pb-4 border-b border-border/60">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Hexagonal Cyan Icon */}
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/40 flex items-center justify-center text-primary group-hover:bg-primary/20 group-hover:border-primary transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-primary stroke-[2.5]"
              >
                <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" />
                <path d="M12 7V17M12 7L8 11M12 7L16 11" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-text-primary text-lg tracking-tight">ProtoTech</span>
                <span className="font-bold text-primary text-lg tracking-tight">Intelli</span>
              </div>
              <div className="text-[11px] font-medium tracking-wider text-text-secondary uppercase">
                Lead Generation
              </div>
            </div>
          </Link>
          <p className="text-[11px] text-text-secondary/70 italic mt-2">
            Find. Understand. Convert.
          </p>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1">
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_12px_rgba(0,229,255,0.12)]'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text-secondary'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User / Workspace Footer */}
      <div className="p-4 border-t border-border/60">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-raised border border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-dark to-primary flex items-center justify-center font-bold text-xs text-background">
              JD
            </div>
            <div className="leading-tight">
              <div className="text-xs font-semibold text-text-primary">John Doe</div>
              <div className="text-[10px] text-text-secondary">Admin</div>
            </div>
          </div>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-secondary/15 text-secondary border border-secondary/30 rounded">
            PRO
          </span>
        </div>
      </div>
    </aside>
  );
}
