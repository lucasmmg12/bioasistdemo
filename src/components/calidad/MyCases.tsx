import { useMemo, useState } from 'react';
import {
  Briefcase, Shield, Clock, CheckCircle2, ChevronRight,
  AlertTriangle, MapPin, Calendar, Users, Building2, Filter,
} from 'lucide-react';
import { useFindings } from '../../contexts/FindingsContext';
import { SECTORS } from '../../constants';
import { StatusBadge, PriorityBadge } from '../ui/StatusBadge';
import { ProgressBar } from '../ui/ProgressBar';
import { KpiCard } from '../ui/KpiCard';
import { Modal } from '../ui/Modal';
import type { Finding } from '../../types';

// Simulate current user = María García (admin, sector: control_calidad)
const CURRENT_USER = { id: 'u1', name: 'María García', sectors: ['control_calidad'] };

type CaseFilter = 'all' | 'pending' | 'resolved';

export function MyCases() {
  const { findings } = useFindings();
  const [filter, setFilter] = useState<CaseFilter>('all');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // My cases = cases where I'm assigned OR cases in my sector
  const myCases = useMemo(() => {
    return findings.filter(f => {
      if (f.status === 'discarded') return false;
      // Assigned to me
      if (f.assigned_to.some(a => a.id === CURRENT_USER.id)) return true;
      // In my sector
      if (CURRENT_USER.sectors.includes(f.sector)) return true;
      // I'm the reporter
      if (f.reporter_name === CURRENT_USER.name) return true;
      return false;
    });
  }, [findings]);

  // Filter
  const filteredCases = useMemo(() => {
    if (filter === 'pending') return myCases.filter(f => !['closed'].includes(f.status));
    if (filter === 'resolved') return myCases.filter(f => f.status === 'closed');
    return myCases;
  }, [myCases, filter]);

  // KPIs
  const kpis = useMemo(() => ({
    total: myCases.length,
    pending: myCases.filter(f => !['closed'].includes(f.status)).length,
    resolved: myCases.filter(f => f.status === 'closed').length,
    urgent: myCases.filter(f => f.priority === 'red' && f.status !== 'closed').length,
  }), [myCases]);

  // Group by sector
  const groupedBySector = useMemo(() => {
    const groups: Record<string, Finding[]> = {};
    filteredCases.forEach(f => {
      const label = SECTORS.find(s => s.value === f.sector)?.label || f.sector;
      if (!groups[label]) groups[label] = [];
      groups[label].push(f);
    });
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [filteredCases]);

  const isOverdue = (finding: Finding): boolean => {
    if (finding.status === 'closed' || finding.status === 'discarded') return false;
    const now = new Date();
    if (finding.status === 'immediate_action' && new Date(finding.deadline_immediate) < now) return true;
    if (finding.status === 'root_cause_analysis' && new Date(finding.deadline_analysis) < now) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-bio-primary flex items-center gap-3">
            <Briefcase className="w-8 h-8" />
            Mis Casos
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Casos asignados a <strong className="text-bio-primary">{CURRENT_USER.name}</strong> — Vista personalizada
          </p>
        </div>
        <div className="flex items-center gap-2 bg-bio-primary/5 border border-bio-primary/10 px-4 py-2 rounded-xl">
          <Shield className="w-4 h-4 text-bio-primary" />
          <span className="text-xs font-bold text-bio-primary uppercase tracking-wider">
            {SECTORS.find(s => s.value === CURRENT_USER.sectors[0])?.label}
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Mis Casos" value={kpis.total} icon={<Briefcase className="w-5 h-5" />} color="primary" delay={0} />
        <KpiCard label="Pendientes" value={kpis.pending} icon={<Clock className="w-5 h-5" />} color="warning" delay={75} />
        <KpiCard label="Resueltos" value={kpis.resolved} icon={<CheckCircle2 className="w-5 h-5" />} color="success" delay={150} />
        <KpiCard label="Urgentes" value={kpis.urgent} icon={<AlertTriangle className="w-5 h-5" />} color="danger" delay={225} />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {([
          { value: 'all', label: 'Todos', count: myCases.length },
          { value: 'pending', label: 'Pendientes', count: kpis.pending },
          { value: 'resolved', label: 'Resueltos', count: kpis.resolved },
        ] as const).map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === tab.value
                ? 'bg-bio-primary text-white shadow-md shadow-bio-primary/20'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab.label}
            <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-bold px-1 ${
              filter === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cases grouped by sector */}
      {groupedBySector.length === 0 ? (
        <div className="card p-12 text-center">
          <Filter className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No tenés casos asignados con este filtro</p>
        </div>
      ) : (
        groupedBySector.map(([sectorLabel, sectorFindings]) => (
          <div key={sectorLabel}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-bio-secondary" />
              <h3 className="text-sm font-bold text-slate-600">{sectorLabel}</h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {sectorFindings.length}
              </span>
            </div>
            <div className="space-y-2">
              {sectorFindings.map((finding, idx) => {
                const overdue = isOverdue(finding);
                return (
                  <div
                    key={finding.id}
                    onClick={() => setSelectedFinding(finding)}
                    className={`card p-4 cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-300 ${overdue ? 'border-red-200 bg-red-50/30' : ''}`}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${
                        finding.priority === 'red' ? 'bg-red-500' : finding.priority === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono font-bold text-bio-primary">{finding.tracking_id}</span>
                          <StatusBadge status={finding.status} />
                          <PriorityBadge priority={finding.priority} />
                          {overdue && (
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-red-100 text-red-700 border border-red-200 pulse-danger flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Vencido
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 font-medium leading-snug line-clamp-1 group-hover:text-bio-primary transition-colors">
                          {finding.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {finding.sede === 'hospital' ? 'Hospital' : 'Planta'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {finding.assigned_to.length > 0
                              ? `${finding.assigned_to.filter(a => a.responded).length}/${finding.assigned_to.length} respondieron`
                              : 'Sin asignar'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(finding.created_at).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 hidden lg:block">
                          <ProgressBar currentStatus={finding.status} compact />
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-bio-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedFinding}
        onClose={() => setSelectedFinding(null)}
        title={selectedFinding ? `Detalle — ${selectedFinding.tracking_id}` : ''}
        size="xl"
      >
        {selectedFinding && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={selectedFinding.status} size="md" />
              <PriorityBadge priority={selectedFinding.priority} size="md" />
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descripción</p>
              <p className="text-sm text-slate-700 leading-relaxed">{selectedFinding.description}</p>
            </div>
            <ProgressBar currentStatus={selectedFinding.status} />
            {selectedFinding.assigned_to.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Responsables</p>
                <div className="space-y-1.5">
                  {selectedFinding.assigned_to.map(a => (
                    <div key={a.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          a.responded ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {a.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{a.name}</span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        a.responded ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {a.responded ? '✅ Respondió' : '⏳ Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
