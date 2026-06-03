import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  trend?: { value: number; label: string };
  color?: 'primary' | 'secondary' | 'accent' | 'danger' | 'warning' | 'success';
  delay?: number;
}

const COLOR_MAP = {
  primary: {
    bg: 'bg-bio-primary/5',
    icon: 'bg-bio-primary/10 text-bio-primary',
    trend: 'text-bio-primary',
  },
  secondary: {
    bg: 'bg-bio-secondary/5',
    icon: 'bg-bio-secondary/10 text-bio-secondary',
    trend: 'text-bio-secondary',
  },
  accent: {
    bg: 'bg-bio-accent/5',
    icon: 'bg-orange-100 text-bio-accent',
    trend: 'text-bio-accent',
  },
  danger: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    trend: 'text-red-600',
  },
  warning: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    trend: 'text-amber-600',
  },
  success: {
    bg: 'bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
    trend: 'text-emerald-600',
  },
};

export function KpiCard({ label, value, icon, trend, color = 'primary', delay = 0 }: KpiCardProps) {
  const c = COLOR_MAP[color];

  return (
    <div
      className={`card p-5 ${c.bg} animate-in fade-in slide-in-from-bottom-4 duration-500`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend.value > 0 ? <TrendingUp className="w-3 h-3" /> : trend.value < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      <p className="text-2xl font-display font-black text-bio-text tracking-tight">{value}</p>
      <p className="text-xs text-slate-400 font-medium mt-1">{label}</p>
    </div>
  );
}
