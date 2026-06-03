import type { FindingStatus, Priority, LogisticsStatus } from '../../types';
import { FINDING_STATUSES, LOGISTICS_STATUSES } from '../../constants';

interface StatusBadgeProps {
  status: FindingStatus | LogisticsStatus;
  variant?: 'default' | 'pill' | 'dot';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  immediate_action: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  root_cause_analysis: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  corrective_plan: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  verification: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  effectiveness: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  closed: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  discarded: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
  // Logistics
  solicitado: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  en_ruta: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  retirado: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  en_planta: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  procesado: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  listo_entrega: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  entregado: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

function getLabel(status: string): string {
  const found = [...FINDING_STATUSES, ...LOGISTICS_STATUSES].find(s => s.value === status);
  return found?.label || status;
}

export function StatusBadge({ status, variant = 'default', size = 'sm', pulse = false }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;

  if (variant === 'dot') {
    return (
      <span className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')} ${pulse ? 'animate-pulse' : ''}`} />
        <span className={`text-xs font-semibold ${colors.text}`}>{getLabel(status)}</span>
      </span>
    );
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses} font-bold uppercase tracking-wider rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${pulse ? 'pulse-danger' : ''}`}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
      {getLabel(status)}
    </span>
  );
}

// ─── Priority Badge ───
interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

const PRIORITY_MAP: Record<Priority, { bg: string; text: string; label: string }> = {
  green: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Baja' },
  yellow: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Media' },
  red: { bg: 'bg-red-100', text: 'text-red-700', label: 'Alta' },
};

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const p = PRIORITY_MAP[priority];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses} font-bold uppercase tracking-wider rounded-full ${p.bg} ${p.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${p.text.replace('text-', 'bg-')}`} />
      {p.label}
    </span>
  );
}
