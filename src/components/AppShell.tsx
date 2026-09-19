'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close mobile navigation drawer whenever route changes
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Handle ESC key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileNavOpen) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileNavOpen]);

  return (
    <>
      <AnimatedBackground />
      {isLoginPage ? (
        <div className="min-h-screen w-full flex flex-col justify-center items-center">{children}</div>
      ) : (
        <div className="min-h-screen flex antialiased relative">
          {/* Desktop Sidebar (visible on lg: 1024px+) */}
          <div className="hidden lg:block shrink-0">
            <Sidebar />
          </div>

          {/* Mobile / Tablet Navigation Drawer Overlay & Drawer */}
          {mobileNavOpen && (
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden transition-opacity"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation overlay"
            />
          )}
          <div
            className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out lg:hidden ${
              mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
          </div>

          {/* Main Content Workspace */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
            <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      )}
    </>
  );
}
