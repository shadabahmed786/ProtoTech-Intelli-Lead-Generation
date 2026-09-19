'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('admin@prototech.com');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: isRegister ? name : undefined,
          role: isRegister ? role : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Successfully authenticated
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl overflow-hidden border border-primary/40 shadow-[0_0_25px_rgba(0,229,255,0.35)] mb-2 bg-black/40">
            <img
              src="/logo.png"
              alt="ProtoTech Solution"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
            ProtoTech <span className="text-primary">Intelli</span>
          </h1>
          <p className="text-xs text-text-secondary">
            AI-Assisted Lead Generation & Business Intelligence (v1.0)
          </p>
        </div>

        {/* Login Box */}
        <div className="p-7 rounded-2xl bg-surface border border-border shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <h2 className="text-sm font-bold text-text-primary">
              {isRegister ? 'Create Production Account' : 'Sign In to Workspace'}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-secondary font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Production Live</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#FF4D6D]/15 border border-[#FF4D6D]/30 text-xs text-[#FF4D6D]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isRegister && (
              <>
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lead Researcher"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-raised border border-border rounded-xl pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-text-secondary">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-surface-raised border border-border rounded-xl px-3.5 py-2.5 text-text-primary focus:border-primary focus:outline-none"
                  >
                    <option value="Admin">Admin (Full Control)</option>
                    <option value="Member">Member (Generate & Manage)</option>
                    <option value="Viewer">Viewer (Read-Only)</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="admin@prototech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-raised border border-border rounded-xl pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-raised border border-border rounded-xl pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-light text-background font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-border/60 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-primary hover:underline font-medium"
            >
              {isRegister
                ? 'Already have an account? Sign In'
                : 'Need a new account or initial admin setup? Register here'}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-text-secondary/60">
          ProtoTech Intelli • Zero Fake Data • Verified Public Intelligence
        </p>
      </div>
    </div>
  );
}
