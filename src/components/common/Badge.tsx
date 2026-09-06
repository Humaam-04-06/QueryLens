import React from 'react';
import { IssueSeverity } from '../../types';

interface BadgeProps {
  severity?: IssueSeverity;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ severity = 'info', children, className = '' }) => {
  const colorStyles: Record<IssueSeverity, string> = {
    critical: 'bg-rose-950/70 border-rose-500/40 text-rose-300 shadow-glow-rose',
    warning: 'bg-amber-950/70 border-amber-500/40 text-amber-300 shadow-glow-amber',
    info: 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300 shadow-glow-cyan',
    success: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 shadow-glow-emerald',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorStyles[severity]} ${className}`}
    >
      {children}
    </span>
  );
};
