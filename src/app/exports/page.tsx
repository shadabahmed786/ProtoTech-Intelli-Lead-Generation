'use client';

import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Download, RefreshCw, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ExportsPage() {
  const [exports, setExports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchExports = async () => {
    try {
      const res = await fetch('/api/exports');
      if (res.ok) {
        const data = await res.json();
        setExports(data.exports || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExports();
  }, []);

  const handleCreateExport = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.csvContent) {
        const blob = new Blob([data.csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', data.filename || 'prototech-all-leads.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        fetchExports();
      }
    } catch (err) {
      alert('Export failed: ' + err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary flex items-center gap-3">
            <FileSpreadsheet className="w-7 h-7 text-primary" />
            <span>Exports</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Download standard RFC 4180 CSV exports protected against spreadsheet formula injection.
          </p>
        </div>

        <button
          onClick={handleCreateExport}
          disabled={generating}
          className="px-4 py-2.5 rounded-xl bg-primary text-background font-semibold text-xs hover:bg-primary-light transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.25)] disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{generating ? 'Compiling CSV...' : 'Export All Leads (CSV)'}</span>
        </button>
      </div>

      {/* Security callout */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-[#00C896] shrink-0" />
        <div className="text-xs text-text-secondary">
          <strong className="text-text-primary">Formula Injection Protected:</strong> All fields beginning with <code className="text-primary font-mono">=, +, -, @</code> are automatically sanitized with leading apostrophes according to OWASP spreadsheet security standards.
        </div>
      </div>

      {/* Exports Table */}
      <div className="rounded-2xl bg-surface border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary">Export History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-raised text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="px-4 py-3">File Name</th>
                <th className="px-4 py-3">Format</th>
                <th className="px-4 py-3">Row Count</th>
                <th className="px-4 py-3">Generated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-secondary">
                    Loading exports...
                  </td>
                </tr>
              ) : exports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-secondary">
                    No export files generated yet. Click &quot;Export All Leads&quot; to create one.
                  </td>
                </tr>
              ) : (
                exports.map((exp) => (
                  <tr key={exp.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-text-primary flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-primary" />
                      <span>{exp.filename}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                        {exp.format}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-text-primary font-bold">
                      {exp.rowCount} records
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {new Date(exp.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
