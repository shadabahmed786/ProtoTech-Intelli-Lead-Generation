import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  let badgeStyle = 'bg-surface-hover text-text-secondary border-border';
  let dotColor = 'bg-text-secondary';

  switch (status.toLowerCase()) {
    case 'qualified':
      badgeStyle = 'bg-[#00C896]/15 text-[#00C896] border-[#00C896]/40 shadow-[0_0_10px_rgba(0,200,150,0.15)]';
      dotColor = 'bg-[#00C896]';
      break;
    case 'contacted':
      badgeStyle = 'bg-[#00A3FF]/15 text-[#00A3FF] border-[#00A3FF]/40 shadow-[0_0_10px_rgba(0,163,255,0.15)]';
      dotColor = 'bg-[#00A3FF]';
      break;
    case 'interested':
      badgeStyle = 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/40 shadow-[0_0_10px_rgba(0,229,255,0.15)]';
      dotColor = 'bg-[#00E5FF]';
      break;
    case 'converted':
      badgeStyle = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
      dotColor = 'bg-emerald-400';
      break;
    case 'disqualified':
      badgeStyle = 'bg-[#FF4D6D]/15 text-[#FF4D6D] border-[#FF4D6D]/40';
      dotColor = 'bg-[#FF4D6D]';
      break;
    case 'suppressed':
      badgeStyle = 'bg-rose-950/40 text-rose-300 border-rose-800/50';
      dotColor = 'bg-rose-400';
      break;
    case 'new':
    default:
      badgeStyle = 'bg-surface-raised text-text-secondary border-border';
      dotColor = 'bg-slate-400';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status}</span>
    </span>
  );
}
