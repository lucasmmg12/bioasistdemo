import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Filter, Search, AlertTriangle, Clock, CheckCircle2,
  ChevronRight, Shield, MapPin, Users, Calendar, ArrowUpRight,
  Eye, XCircle, Building2, Download, FileText, FileSpreadsheet, ChevronDown,
  Send, UserPlus
} from 'lucide-react';
import { SECTORS } from '../../constants';
import { KpiCard } from '../ui/KpiCard';
import { StatusBadge, PriorityBadge } from '../ui/StatusBadge';
import { ProgressBar, UserProgressBar } from '../ui/ProgressBar';
import { TimelineActivity } from '../ui/TimelineActivity';
import { Modal } from '../ui/Modal';
import type { Finding, FindingStatus, Assignee } from '../../types';
import { exportToPDF, exportToExcel, exportFindingToPDF, exportSeguimiento } from '../../services/exportService';
import { useFindings } from '../../contexts/FindingsContext';
import { MOCK_USERS } from '../../data/mockData';

type TabFilter = 'all' | FindingStatus;

export function QualityDashboard() {
  const navigate = useNavigate();
  const { findings, assignTo, updateStatus, discardFinding, returnFinding } = useFindings();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sectorFilter, setSectorFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [whatsappToast, setWhatsappToast] = useState<{ name: string; link: string } | null>(null);

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
    if (sectorFilter !== 'all') {
      result = result.filter(f => f.sector === sectorFilter);
    }
    if (priorityFilter !== 'all') {
      result = result.filter(f => f.priority === priorityFilter);
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
  }, [findings, activeTab, searchQuery, sectorFilter, priorityFilter]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-bio-primary">
            Gestión de Calidad
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1 hidden sm:block">
            Sistema de Acciones Correctivas y Oportunidades de Mejora — ISO 9001
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn-secondary gap-1.5"
            >
              <Download className="w-4 h-4" />
              Exportar
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-2xl border border-slate-200/60 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        exportToPDF(filteredFindings);
                        setShowExportMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xs">Exportar PDF</p>
                        <p className="text-[10px] text-slate-400">Reporte con KPIs y tabla</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        exportToExcel(filteredFindings);
                        setShowExportMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-green-50 hover:text-green-700 transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xs">Exportar Excel</p>
                        <p className="text-[10px] text-slate-400">Datos completos + resumen</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        exportSeguimiento(filteredFindings);
                        setShowExportMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xs">Seguimiento AC/OM</p>
                        <p className="text-[10px] text-slate-400">R GC 07 — Planilla completa</p>
                      </div>
                    </button>
                  </div>
                  <div className="border-t border-slate-100 px-3 py-2">
                    <p className="text-[9px] text-slate-400 font-medium">
                      {filteredFindings.length} hallazgo{filteredFindings.length !== 1 ? 's' : ''} {activeTab !== 'all' ? '(filtrados)' : ''}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => navigate('/calidad/nuevo')}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nuevo Hallazgo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
        <KpiCard label="Total Activos" value={kpis.total} icon={<Shield className="w-5 h-5" />} color="primary" delay={0} />
        <KpiCard label="Pendientes" value={kpis.pending} icon={<Clock className="w-5 h-5" />} color="warning" delay={75} />
        <KpiCard label="En Proceso" value={kpis.inProgress} icon={<ArrowUpRight className="w-5 h-5" />} color="secondary" delay={150} />
        <KpiCard label="Vencidos" value={kpis.overdue} icon={<AlertTriangle className="w-5 h-5" />} color="danger" delay={225} />
        <KpiCard label="Cerrados" value={kpis.closed} icon={<CheckCircle2 className="w-5 h-5" />} color="success" delay={300} />
      </div>

      {/* Filters bar */}
      <div className="card p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID, descripción, sector..."
              className="input-field pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sector + Priority Filters */}
          <div className="flex gap-2 sm:gap-3">
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="input-field text-xs font-bold flex-1 sm:flex-none sm:w-auto sm:min-w-[140px]"
            >
              <option value="all">Todos los Sectores</option>
              {SECTORS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-field text-xs font-bold flex-1 sm:flex-none sm:w-auto sm:min-w-[120px]"
            >
              <option value="all">Prioridad</option>
              <option value="red">🔴 Alta</option>
              <option value="yellow">🟡 Media</option>
              <option value="green">🟢 Baja</option>
            </select>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1 tabs-scroll-container">
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
                className={`card p-3 sm:p-4 md:p-5 cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-300 ${overdue ? 'border-red-200 bg-red-50/30' : ''}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  {/* Priority indicator — mobile: top bar, desktop: side bar */}
                  <div className={`h-1 sm:h-12 w-full sm:w-1.5 rounded-full flex-shrink-0 ${
                    finding.priority === 'red' ? 'bg-red-500' : finding.priority === 'yellow' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-bio-primary">{finding.tracking_id}</span>
                      <StatusBadge status={finding.status} pulse={overdue} />
                      <PriorityBadge priority={finding.priority} />
                      {overdue && (
                        <span className="px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider rounded-full bg-red-100 text-red-700 border border-red-200 pulse-danger flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          Vencido
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-snug line-clamp-2 group-hover:text-bio-primary transition-colors">
                      {finding.description}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-4 mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-slate-400 font-medium flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {finding.sede === 'hospital' ? 'Hospital' : 'Planta'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {getSectorLabel(finding.sector)}
                      </span>
                      <span className="flex items-center gap-1 hidden sm:flex">
                        <Users className="w-3 h-3" />
                        {finding.assigned_to.length > 0
                          ? `${finding.assigned_to.length} asig.`
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
                  <div className="hidden sm:flex items-center gap-4">
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
          <FindingDetail
            finding={selectedFinding}
            onDerived={(id, assignees) => {
              assignTo(id, assignees);
              // Refresh the selected finding from context
              const updated = findings.find(f => f.id === id);
              if (updated) setSelectedFinding({ ...updated, assigned_to: assignees, status: updated.status === 'pending' ? 'immediate_action' : updated.status });
              // Show WhatsApp toast with resolution link
              const newAssignee = assignees[assignees.length - 1];
              if (newAssignee) {
                const trackingId = updated?.tracking_id || '';
                setWhatsappToast({ name: newAssignee.name, link: `${window.location.origin}/resolver/${trackingId}` });
                setTimeout(() => setWhatsappToast(null), 8000);
              }
            }}
            onReturned={(id, reason) => {
              returnFinding(id, reason);
              setSelectedFinding(null);
            }}
            onValidated={(id) => {
              const statusMap: Record<string, FindingStatus> = {
                immediate_action: 'root_cause_analysis',
                root_cause_analysis: 'corrective_plan',
                corrective_plan: 'verification',
                verification: 'effectiveness',
                effectiveness: 'closed',
              };
              const current = findings.find(f => f.id === id);
              if (current && statusMap[current.status]) {
                updateStatus(id, statusMap[current.status]);
                setSelectedFinding(null);
              }
            }}
            onDiscarded={(id) => {
              discardFinding(id);
              setSelectedFinding(null);
            }}
          />
        )}
      </Modal>

      {/* WhatsApp Toast */}
      {whatsappToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl border border-green-200 p-5 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-green-700">📱 WhatsApp enviado</p>
                <p className="text-xs text-slate-500 mt-0.5">Se envió un link de resolución a <strong>{whatsappToast.name}</strong></p>
                <button
                  onClick={async () => {
                    try { await navigator.clipboard.writeText(whatsappToast.link); } catch {}
                    alert('Link copiado: ' + whatsappToast.link);
                  }}
                  className="mt-2 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg hover:bg-green-100 transition-colors truncate block max-w-full"
                >
                  📋 Copiar link: {whatsappToast.link}
                </button>
              </div>
              <button onClick={() => setWhatsappToast(null)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Finding Detail (inside modal) ───
interface FindingDetailProps {
  finding: Finding;
  onDerived: (id: string, assignees: Assignee[]) => void;
  onValidated: (id: string) => void;
  onDiscarded: (id: string) => void;
  onReturned: (id: string, reason: string) => void;
}

function FindingDetail({ finding, onDerived, onValidated, onDiscarded, onReturned }: FindingDetailProps) {
  const getSectorLabel = (value: string) => SECTORS.find(s => s.value === value)?.label || value;
  const [showDeriveModal, setShowDeriveModal] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const responded = finding.assigned_to.filter(a => a.responded).length;
  const total = finding.assigned_to.length;

  // Available users to assign (not already assigned)
  const assignedIds = new Set(finding.assigned_to.map(a => a.id));
  const availableUsers = MOCK_USERS.filter(u => !assignedIds.has(u.id) && u.role !== 'admin');

  const handleDerive = () => {
    const newAssignees: Assignee[] = selectedUsers.map(uid => {
      const user = MOCK_USERS.find(u => u.id === uid)!;
      return {
        id: user.id,
        name: user.name,
        sector: user.sector,
        phone: '',
        responded: false,
      };
    });
    onDerived(finding.id, [...finding.assigned_to, ...newAssignees]);
    setShowDeriveModal(false);
    setSelectedUsers([]);
  };

  const NEXT_STATUS_LABELS: Record<string, string> = {
    immediate_action: 'Análisis de Causa',
    root_cause_analysis: 'Plan Correctivo',
    corrective_plan: 'Verificación',
    verification: 'Efectividad',
    effectiveness: 'Cerrado',
  };

  return (
    <div className="space-y-5">
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

      {/* R GC 05/06/08 — Extended Fields */}
      {(finding.institution || finding.ot_number || finding.material || finding.claim_number) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {finding.institution && (
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Institución</p>
              <p className="text-xs font-bold text-slate-700">{finding.institution}</p>
            </div>
          )}
          {finding.ot_number && (
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Orden de Trabajo</p>
              <p className="text-xs font-bold text-bio-primary">{finding.ot_number}</p>
            </div>
          )}
          {finding.material && (
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Material</p>
              <p className="text-xs text-slate-700">{finding.material}</p>
            </div>
          )}
          {finding.remito_number && (
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Remito</p>
              <p className="text-xs font-bold text-slate-700">{finding.remito_number}</p>
            </div>
          )}
          {finding.system_element && (
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Elemento del Sistema</p>
              <p className="text-xs text-slate-700">{finding.system_element}</p>
            </div>
          )}
          {finding.requirement_violated && (
            <div className="bg-white rounded-xl p-3 border border-slate-100 col-span-2 md:col-span-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Requisito No Cumplido</p>
              <p className="text-xs text-red-600 font-medium">{finding.requirement_violated}</p>
            </div>
          )}
        </div>
      )}

      {/* R GC 08 — Claim-specific fields */}
      {finding.type === 'reclamo_cliente' && (
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            📋 Datos del Reclamo — R GC 08
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {finding.claim_number && (
              <div>
                <p className="text-[10px] font-bold text-orange-500 uppercase">N° Reclamo</p>
                <p className="text-xs font-bold text-slate-700">{finding.claim_number}</p>
              </div>
            )}
            {finding.client_contact_name && (
              <div>
                <p className="text-[10px] font-bold text-orange-500 uppercase">Contacto</p>
                <p className="text-xs text-slate-700">{finding.client_contact_name}</p>
              </div>
            )}
            {finding.product_service && (
              <div>
                <p className="text-[10px] font-bold text-orange-500 uppercase">Producto/Servicio</p>
                <p className="text-xs text-slate-700">{finding.product_service}</p>
              </div>
            )}
            {finding.quantity_delivered !== undefined && (
              <div>
                <p className="text-[10px] font-bold text-orange-500 uppercase">Cant. Entregada</p>
                <p className="text-xs font-bold text-slate-700">{finding.quantity_delivered}</p>
              </div>
            )}
            {finding.quantity_objected !== undefined && (
              <div>
                <p className="text-[10px] font-bold text-orange-500 uppercase">Cant. Objetada</p>
                <p className="text-xs font-bold text-red-600">{finding.quantity_objected}</p>
              </div>
            )}
            {finding.claim_detection_method && (
              <div>
                <p className="text-[10px] font-bold text-orange-500 uppercase">Detección</p>
                <p className="text-xs text-slate-700 capitalize">{finding.claim_detection_method}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold text-orange-500 uppercase">¿Pertinente?</p>
              <p className={`text-xs font-bold ${finding.claim_is_pertinent ? 'text-green-600' : 'text-red-600'}`}>
                {finding.claim_is_pertinent ? 'SÍ' : 'NO'}
              </p>
            </div>
            {finding.claim_value_pesos !== undefined && finding.claim_value_pesos > 0 && (
              <div>
                <p className="text-[10px] font-bold text-orange-500 uppercase">Valor ($)</p>
                <p className="text-xs font-bold text-slate-700">$ {finding.claim_value_pesos.toLocaleString('es-AR')}</p>
              </div>
            )}
            {finding.linked_ac_number && (
              <div>
                <p className="text-[10px] font-bold text-orange-500 uppercase">AC Vinculada</p>
                <p className="text-xs font-bold text-bio-primary">{finding.linked_ac_number}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* R GC 06 — OM-specific fields */}
      {finding.type === 'oportunidad_mejora' && finding.om_benefits && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            💡 Datos de la OM — R GC 06
          </p>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Beneficios</p>
              <p className="text-xs text-slate-700 leading-relaxed">{finding.om_benefits}</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[10px] font-bold text-blue-500 uppercase">Decisión</p>
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                  finding.om_decision === 'aceptada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {finding.om_decision === 'aceptada' ? '✅ Aceptada' : '❌ Rechazada'}
                </span>
              </div>
              {finding.om_analyst && (
                <div>
                  <p className="text-[10px] font-bold text-blue-500 uppercase">Analista</p>
                  <p className="text-xs text-slate-700">{finding.om_analyst}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bio Asist sectors involved */}
      {finding.bio_asist_sectors_involved && finding.bio_asist_sectors_involved.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sectores Bio Asist involucrados</p>
          <div className="flex flex-wrap gap-1.5">
            {finding.bio_asist_sectors_involved.map(s => (
              <span key={s} className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-bio-primary/10 text-bio-primary">{s}</span>
            ))}
          </div>
        </div>
      )}

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
      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => exportFindingToPDF(finding)}
          className="btn-secondary gap-1.5"
        >
          <Download className="w-4 h-4" />
          {finding.type === 'reclamo_cliente' ? 'Formulario R GC 08' : finding.type === 'oportunidad_mejora' ? 'Formulario R GC 06' : 'Formulario R GC 05'}
        </button>
        {finding.status === 'pending' && (
          <button className="btn-primary" onClick={() => setShowDeriveModal(true)}>
            <Users className="w-4 h-4" /> Derivar Hallazgo
          </button>
        )}
        {finding.status === 'verification' && (
          <>
            <button className="btn-accent" onClick={() => onValidated(finding.id)}>
              <CheckCircle2 className="w-4 h-4" /> Aprobar Resolución
            </button>
            <button className="btn-secondary text-orange-600 hover:bg-orange-50 border-orange-200" onClick={() => setShowReturnModal(true)}>
              ↩️ Devolver con Observación
            </button>
          </>
        )}
        {Object.keys(NEXT_STATUS_LABELS).includes(finding.status) && finding.status !== 'verification' && (
          <button className="btn-accent" onClick={() => onValidated(finding.id)}>
            <Eye className="w-4 h-4" /> Validar → {NEXT_STATUS_LABELS[finding.status]}
          </button>
        )}
        {/* Link to resolution page */}
        {finding.assigned_to.length > 0 && !['closed', 'discarded', 'pending'].includes(finding.status) && (
          <button
            onClick={async () => {
              const link = `${window.location.origin}/resolver/${finding.tracking_id}`;
              try { await navigator.clipboard.writeText(link); } catch {}
              alert('Link copiado: ' + link);
            }}
            className="btn-ghost text-green-600 hover:bg-green-50"
          >
            📱 Copiar Link Resolución
          </button>
        )}
        <div className="flex-1" />
        {finding.status !== 'closed' && finding.status !== 'discarded' && (
          <button className="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setShowDiscardConfirm(true)}>
            <XCircle className="w-4 h-4" /> Descartar
          </button>
        )}
      </div>

      {/* ── Derive Modal ── */}
      {showDeriveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowDeriveModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-display font-bold text-bio-primary mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5" /> Derivar Hallazgo
            </h3>
            <p className="text-xs text-slate-400 mb-4">Selecciona los responsables a quienes derivar este hallazgo.</p>

            {availableUsers.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">Todos los usuarios ya están asignados.</p>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar mb-4">
                {availableUsers.map(user => (
                  <label key={user.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedUsers.includes(user.id) ? 'border-bio-primary bg-bio-primary/5' : 'border-slate-100 hover:border-slate-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedUsers([...selectedUsers, user.id]);
                        else setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                      }}
                      className="rounded border-slate-300 text-bio-primary focus:ring-bio-primary/20"
                    />
                    <div className="w-8 h-8 rounded-full bg-bio-primary/10 flex items-center justify-center text-xs font-bold text-bio-primary">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{user.name}</p>
                      <p className="text-[10px] text-slate-400">{SECTORS.find(s => s.value === user.sector)?.label || user.sector}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button className="btn-ghost flex-1" onClick={() => setShowDeriveModal(false)}>
                Cancelar
              </button>
              <button
                className="btn-primary flex-1"
                disabled={selectedUsers.length === 0}
                onClick={handleDerive}
              >
                <Send className="w-4 h-4" /> Derivar ({selectedUsers.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Discard Confirmation ── */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowDiscardConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 fade-in duration-200 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-display font-bold text-slate-800 mb-2">¿Descartar Hallazgo?</h3>
            <p className="text-sm text-slate-500 mb-6">Esta acción moverá el hallazgo <strong>{finding.tracking_id}</strong> al estado descartado. Se puede revertir desde el panel de administración.</p>
            <div className="flex gap-2">
              <button className="btn-ghost flex-1" onClick={() => setShowDiscardConfirm(false)}>
                Cancelar
              </button>
              <button className="btn-danger flex-1" onClick={() => onDiscarded(finding.id)}>
                <XCircle className="w-4 h-4" /> Sí, Descartar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Return Modal ── */}
      {showReturnModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowReturnModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-slate-800">Devolver con Observación</h3>
                <p className="text-xs text-slate-400">La resolución será devuelta al responsable</p>
              </div>
            </div>
            <textarea
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              placeholder="Motivo de la devolución... Ej: Falta evidencia fotográfica de la acción tomada."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-400 outline-none text-sm resize-none mb-4"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <button className="btn-ghost flex-1" onClick={() => setShowReturnModal(false)}>Cancelar</button>
              <button
                className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={!returnReason.trim()}
                onClick={() => {
                  onReturned(finding.id, returnReason.trim());
                  setShowReturnModal(false);
                }}
              >
                <Send className="w-4 h-4" /> Devolver
              </button>
            </div>
          </div>
        </div>
      )}
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
