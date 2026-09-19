'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <>
      <AnimatedBackground />
      {isLoginPage ? (
        <div className="min-h-screen w-full">{children}</div>
      ) : (
        <div className="min-h-screen flex antialiased">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <Header />
            <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      )}
    </>
  );
}
