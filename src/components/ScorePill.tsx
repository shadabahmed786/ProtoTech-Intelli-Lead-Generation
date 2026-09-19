import React from 'react';

interface ScorePillProps {
  score: number;
  label?: string;
  className?: string;
}

export default function ScorePill({ score, label, className = '' }: ScorePillProps) {
  let style = 'bg-surface-raised border-border text-text-secondary';

  if (score >= 80) {
    style = 'bg-primary/10 border-primary/40 text-primary shadow-[0_0_12px_rgba(0,229,255,0.18)]';
  } else if (score >= 60) {
    style = 'bg-primary-dark/10 border-primary-dark/40 text-primary-dark shadow-[0_0_10px_rgba(0,163,255,0.15)]';
  } else if (score >= 40) {
    style = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${style} ${className}`}>
      {label && <span className="text-[10px] font-medium text-text-secondary uppercase">{label}</span>}
      <span>{score}</span>
    </div>
  );
}
