import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Filter, Search, AlertTriangle, Clock, CheckCircle2,
  ChevronRight, Shield, MapPin, Users, Calendar, ArrowUpRight,
  Eye, XCircle, Building2
} from 'lucide-react';
import { MOCK_FINDINGS } from '../../data/mockData';
import { SECTORS } from '../../constants';
import { KpiCard } from '../ui/KpiCard';
import { StatusBadge, PriorityBadge } from '../ui/StatusBadge';
import { ProgressBar, UserProgressBar } from '../ui/ProgressBar';
import { TimelineActivity } from '../ui/TimelineActivity';
import { Modal } from '../ui/Modal';
import type { Finding, FindingStatus } from '../../types';

type TabFilter = 'all' | FindingStatus;

export function QualityDashboard() {
  const navigate = useNavigate();
  const [findings] = useState<Finding[]>(MOCK_FINDINGS);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── KPIs ───
  const kpis = useMemo(() => {
    const active = findings.filter(f => f.status !== 'discarded');
    const pending = active.filter(f => f.status === 'pending');
    const inProgress = active.filter(f => !['pending', 'closed', 'discarded'].includes(f.status));
    const closed = active.filter(f => f.status === 'closed');
    const overdue = active.filter(f => {
      if (f.status === 'closed' || f.status === 'discarded') return false;
      const deadline = f.status === 'immediate_action' ? f.deadline_immediate
        : f.status === 'root_cause_analysis' ? f.deadline_analysis
        : f.deadline_verification;
      return deadline && new Date(deadline) < new Date();
    });
    return { total: active.length, pending: pending.length, inProgress: inProgress.length, closed: closed.length, overdue: overdue.length };
  }, [findings]);

  // ─── Filtered findings ───
  const filteredFindings = useMemo(() => {
    let result = findings.filter(f => f.status !== 'discarded');
    if (activeTab !== 'all') {
      result = result.filter(f => f.status === activeTab);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f =>
        f.tracking_id.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.sector.toLowerCase().includes(q) ||
        f.reporter_name.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [findings, activeTab, searchQuery]);

  // ─── Check overdue ───
  const isOverdue = (finding: Finding): boolean => {
    if (finding.status === 'closed' || finding.status === 'discarded') return false;
    const now = new Date();
    if (finding.status === 'immediate_action' && new Date(finding.deadline_immediate) < now) return true;
    if (finding.status === 'root_cause_analysis' && new Date(finding.deadline_analysis) < now) return true;
    return false;
  };

  const getSectorLabel = (value: string) => SECTORS.find(s => s.value === value)?.label || value;

  // ─── Tabs ───
  const TABS: { value: TabFilter; label: string; count: number }[] = [
    { value: 'all', label: 'Todos', count: findings.filter(f => f.status !== 'discarded').length },
    { value: 'pending', label: 'Pendientes', count: findings.filter(f => f.status === 'pending').length },
    { value: 'immediate_action', label: 'Acción Inmediata', count: findings.filter(f => f.status === 'immediate_action').length },
    { value: 'root_cause_analysis', label: 'Análisis', count: findings.filter(f => f.status === 'root_cause_analysis').length },
    { value: 'corrective_plan', label: 'Plan Correctivo', count: findings.filter(f => f.status === 'corrective_plan').length },
    { value: 'verification', label: 'Verificación', count: findings.filter(f => f.status === 'verification').length },
    { value: 'effectiveness', label: 'Efectividad', count: findings.filter(f => f.status === 'effectiveness').length },
    { value: 'closed', label: 'Cerrados', count: findings.filter(f => f.status === 'closed').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-bio-primary">
            Gestión de Calidad
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Sistema de Acciones Correctivas y Oportunidades de Mejora — ISO 9001
          </p>
        </div>
        <button
          onClick={() => navigate('/calidad/nuevo')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nuevo Hallazgo
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Total Activos" value={kpis.total} icon={<Shield className="w-5 h-5" />} color="primary" delay={0} />
        <KpiCard label="Pendientes" value={kpis.pending} icon={<Clock className="w-5 h-5" />} color="warning" delay={75} />
        <KpiCard label="En Proceso" value={kpis.inProgress} icon={<ArrowUpRight className="w-5 h-5" />} color="secondary" delay={150} />
        <KpiCard label="Vencidos" value={kpis.overdue} icon={<AlertTriangle className="w-5 h-5" />} color="danger" delay={225} />
        <KpiCard label="Cerrados" value={kpis.closed} icon={<CheckCircle2 className="w-5 h-5" />} color="success" delay={300} />
      </div>

      {/* Filters bar */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID, descripción, sector..."
              className="input-field pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.value
                    ? 'bg-bio-primary text-white shadow-md shadow-bio-primary/20'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
                <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-bold px-1 ${
                  activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="card p-12 text-center">
            <Filter className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No se encontraron hallazgos con estos filtros</p>
          </div>
        ) : (
          filteredFindings.map((finding, idx) => {
            const overdue = isOverdue(finding);
            return (
              <div
                key={finding.id}
                onClick={() => setSelectedFinding(finding)}
                className={`card p-4 md:p-5 cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-300 ${overdue ? 'border-red-200 bg-red-50/30' : ''}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  {/* Priority indicator */}
                  <div className={`w-1.5 h-12 rounded-full hidden md:block flex-shrink-0 ${
                    finding.priority === 'red' ? 'bg-red-500' : finding.priority === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-bio-primary">{finding.tracking_id}</span>
                      <StatusBadge status={finding.status} pulse={overdue} />
                      <PriorityBadge priority={finding.priority} />
                      {overdue && (
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-red-100 text-red-700 border border-red-200 pulse-danger flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Vencido
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-snug line-clamp-2 group-hover:text-bio-primary transition-colors">
                      {finding.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {finding.sede === 'hospital' ? 'Hospital' : 'Planta'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {getSectorLabel(finding.sector)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {finding.assigned_to.length > 0
                          ? `${finding.assigned_to.length} asignado${finding.assigned_to.length > 1 ? 's' : ''}`
                          : 'Sin asignar'
                        }
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(finding.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>

                  {/* Right side: Progress + arrow */}
                  <div className="flex items-center gap-4">
                    <div className="w-32 hidden lg:block">
                      <ProgressBar currentStatus={finding.status} compact />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-bio-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Detail Modal ─── */}
      <Modal
        isOpen={!!selectedFinding}
        onClose={() => setSelectedFinding(null)}
        title={selectedFinding ? `Hallazgo ${selectedFinding.tracking_id}` : ''}
        size="xl"
      >
        {selectedFinding && (
          <FindingDetail finding={selectedFinding} />
        )}
      </Modal>
    </div>
  );
}

// ─── Finding Detail (inside modal) ───
function FindingDetail({ finding }: { finding: Finding }) {
  const getSectorLabel = (value: string) => SECTORS.find(s => s.value === value)?.label || value;

  const responded = finding.assigned_to.filter(a => a.responded).length;
  const total = finding.assigned_to.length;

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={finding.status} size="md" />
        <PriorityBadge priority={finding.priority} size="md" />
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
          {finding.sede === 'hospital' ? '🏥 Hospital' : '🏭 Planta'}
        </span>
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
          📍 {getSectorLabel(finding.sector)}
        </span>
      </div>

      {/* Description */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descripción del Hallazgo</p>
        <p className="text-sm text-slate-700 leading-relaxed">{finding.description}</p>
        <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
          <span>Reportado por: <strong className="text-slate-600">{finding.reporter_name}</strong></span>
          <span>{new Date(finding.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Progress */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Progreso del Ciclo</p>
        <ProgressBar currentStatus={finding.status} />
      </div>

      {/* Assigned users */}
      {finding.assigned_to.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Responsables Asignados</p>
          <div className="space-y-2 mb-3">
            {finding.assigned_to.map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    a.responded ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {a.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{a.name}</p>
                    <p className="text-[10px] text-slate-400">{getSectorLabel(a.sector)}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                  a.responded ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {a.responded ? '✅ Respondió' : '⏳ Pendiente'}
                </span>
              </div>
            ))}
          </div>
          <UserProgressBar total={total} responded={responded} />
        </div>
      )}

      {/* Cycle stages cards */}
      <div className="space-y-3">
        {finding.immediate_action && (
          <StageCard
            title="Acción Inmediata"
            icon="⚡"
            color="blue"
            content={finding.immediate_action}
            by={finding.immediate_action_by}
            date={finding.immediate_action_date}
          />
        )}
        {finding.root_cause && (
          <StageCard
            title="Análisis de Causa Raíz"
            icon="🔬"
            color="amber"
            content={finding.root_cause}
            by={finding.root_cause_by}
            date={finding.root_cause_date}
            extra={finding.root_cause_method ? `Método: ${finding.root_cause_method === '5_porques' ? '5 Porqués' : finding.root_cause_method === 'ishikawa' ? 'Ishikawa' : finding.root_cause_method}` : undefined}
          />
        )}
        {finding.corrective_plan && (
          <StageCard
            title="Plan Correctivo"
            icon="📝"
            color="purple"
            content={finding.corrective_plan}
            by={finding.corrective_plan_by}
            date={finding.corrective_plan_date}
          />
        )}
        {finding.verification_result && (
          <StageCard
            title="Verificación"
            icon="✅"
            color="teal"
            content={finding.verification_result}
            by={finding.verification_by}
            date={finding.verification_date}
          />
        )}
        {finding.effectiveness_result && (
          <StageCard
            title="Efectividad"
            icon="🎯"
            color="green"
            content={finding.effectiveness_result}
            by={finding.effectiveness_by}
            date={finding.effectiveness_date}
          />
        )}
      </div>

      {/* Propagation & Risk */}
      {(finding.is_propagable || finding.risk_matrix_impact) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {finding.is_propagable && (
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> Propagable
              </p>
              <p className="text-sm text-indigo-700">
                Sectores: {finding.propagated_sectors.map(getSectorLabel).join(', ')}
              </p>
            </div>
          )}
          {finding.risk_matrix_impact && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Impacto en Matriz de Riesgos
              </p>
              <p className="text-sm text-red-700">Este hallazgo debe evaluarse en la próxima revisión de la matriz.</p>
            </div>
          )}
        </div>
      )}

      {/* Activity timeline */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Historial de Actividad</p>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <TimelineActivity notes={finding.notes} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
        {finding.status === 'pending' && (
          <button className="btn-primary">
            <Users className="w-4 h-4" /> Derivar Hallazgo
          </button>
        )}
        {['immediate_action', 'root_cause_analysis', 'corrective_plan'].includes(finding.status) && (
          <button className="btn-accent">
            <Eye className="w-4 h-4" /> Validar Etapa
          </button>
        )}
        {finding.status !== 'closed' && finding.status !== 'discarded' && (
          <button className="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50">
            <XCircle className="w-4 h-4" /> Descartar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Stage Card ───
function StageCard({ title, icon, color, content, by, date, extra }: {
  title: string;
  icon: string;
  color: string;
  content: string;
  by?: string;
  date?: string;
  extra?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'border-l-blue-500 bg-blue-50/50',
    amber: 'border-l-amber-500 bg-amber-50/50',
    purple: 'border-l-purple-500 bg-purple-50/50',
    teal: 'border-l-teal-500 bg-teal-50/50',
    green: 'border-l-green-500 bg-green-50/50',
  };

  return (
    <div className={`rounded-xl p-4 border border-slate-100 border-l-4 ${colorMap[color] || ''}`}>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <span>{icon}</span> {title}
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">{content}</p>
      {extra && <p className="text-[11px] text-slate-500 mt-2 font-medium italic">{extra}</p>}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
        {by && <span>Por: <strong className="text-slate-500">{by}</strong></span>}
        {date && <span>{new Date(date).toLocaleDateString('es-AR')}</span>}
      </div>
    </div>
  );
}
