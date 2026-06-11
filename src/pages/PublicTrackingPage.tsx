import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Clock, CheckCircle2, AlertCircle, Activity, ArrowLeft,
  ChevronDown, Send, AlertTriangle, XCircle, Eye,
} from 'lucide-react';
import { useFindings } from '../contexts/FindingsContext';
import { SECTORS, FINDING_STATUSES } from '../constants';
import type { Finding } from '../types';

const STATUS_STEP_MAP: Record<string, number> = {
  pending: 1,
  immediate_action: 1,
  root_cause_analysis: 2,
  corrective_plan: 2,
  verification: 2,
  effectiveness: 3,
  closed: 3,
  discarded: 0,
};

const getSectorLabel = (v: string) => SECTORS.find(s => s.value === v)?.label || v;
const getStatusLabel = (v: string) => FINDING_STATUSES.find(s => s.value === v)?.label || v;

export function PublicTrackingPage() {
  const { getFindingByTrackingId } = useFindings();
  const PREFIX = 'BA-2026-';
  const [suffix, setSuffix] = useState('');
  const [useFullInput, setUseFullInput] = useState(false);
  const [fullCode, setFullCode] = useState('');
  const [report, setReport] = useState<Finding | null>(null);
  const [error, setError] = useState('');
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);

  const computedId = useFullInput ? fullCode.trim() : `${PREFIX}${suffix}`;
  const canSearch = useFullInput ? fullCode.trim().length > 0 : suffix.length === 4;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSearch) return;
    setError('');
    setReport(null);
    setExpandedEntry(null);

    const found = getFindingByTrackingId(computedId);
    if (found) {
      setReport(found);
    } else {
      setError('No encontramos un reporte con ese código. Verificá e intentá nuevamente.');
    }
  };

  const step = report ? (STATUS_STEP_MAP[report.status] || 1) : 1;

  // Parse notes into timeline events
  const parseEvents = (finding: Finding) => {
    const events: { date: string; message: string; type: string }[] = [{
      date: new Date(finding.created_at).toLocaleString('es-AR'),
      message: 'Ticket Creado',
      type: 'start',
    }];

    if (finding.notes) {
      finding.notes.split('\n\n').filter(n => n.trim()).forEach(note => {
        const match = note.match(/^\[([^\]]+)\]\s?(.*)/);
        if (match) {
          let type = 'info';
          const msg = match[2];
          if (msg.includes('DERIVADO') || msg.includes('Derivado')) type = 'derivation';
          else if (msg.includes('RECHAZADO') || msg.includes('DEVUELTO')) type = 'quality_return';
          else if (msg.includes('RECHAZO DE ASIGNACIÓN')) type = 'rejection';
          else if (msg.includes('APELADO') || msg.includes('REABIERTO')) type = 'reopen';
          else if (msg.includes('APROBADO') || msg.includes('RESOLUCIÓN RECIBIDA')) type = 'approved';
          else if (msg.includes('Estado actualizado')) type = 'status';
          events.push({ date: match[1], message: msg, type });
        }
      });
    }

    if (finding.status === 'closed') {
      events.push({ date: new Date(finding.updated_at).toLocaleString('es-AR'), message: 'Caso Cerrado ✅', type: 'resolved' });
    }

    return events;
  };

  const getEventColor = (type: string) => {
    const map: Record<string, string> = {
      start: 'bg-slate-200 text-slate-500',
      derivation: 'bg-blue-100 text-blue-600',
      rejection: 'bg-red-100 text-red-600',
      quality_return: 'bg-orange-100 text-orange-600',
      reopen: 'bg-amber-100 text-amber-600',
      approved: 'bg-green-100 text-green-600',
      resolved: 'bg-green-100 text-green-600',
      status: 'bg-purple-100 text-purple-600',
      info: 'bg-blue-50 text-bio-primary',
    };
    return map[type] || 'bg-slate-100 text-slate-500';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'derivation': return <Send className="w-3.5 h-3.5" />;
      case 'rejection': return <XCircle className="w-3.5 h-3.5" />;
      case 'quality_return': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'approved': case 'resolved': return <CheckCircle2 className="w-4 h-4" />;
      case 'status': return <Eye className="w-3.5 h-3.5" />;
      default: return <div className="w-2 h-2 rounded-full bg-current" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bio-primary/5 via-white to-bio-secondary/5">
      {/* Header */}
      <div className="bg-bio-primary text-white py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link to="/calidad" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Seguimiento de Reportes</h1>
            <p className="text-white/70 text-sm font-medium">Consulta el estado de tu gestión en tiempo real.</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-slate-100 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {!useFullInput ? (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Ingresá los últimos 4 caracteres de tu código
                </label>
                <div className="flex items-stretch">
                  <div className="flex items-center bg-slate-100 border-2 border-r-0 border-slate-200 rounded-l-xl px-4">
                    <span className="text-lg font-mono font-bold text-slate-400 tracking-wider">{PREFIX}</span>
                  </div>
                  <input type="text" maxLength={4} placeholder="X9Y2" className="flex-1 p-4 border-2 border-slate-200 rounded-r-xl text-2xl uppercase font-mono tracking-[0.3em] text-center focus:border-bio-primary focus:ring-4 focus:ring-bio-primary/10 outline-none transition-all" value={suffix} onChange={e => setSuffix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))} autoFocus />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[11px] text-slate-400">{suffix.length < 4 ? `Faltan ${4 - suffix.length} caracteres` : '✅ Listo para buscar'}</p>
                  <button type="button" onClick={() => { setUseFullInput(true); setFullCode(suffix ? `${PREFIX}${suffix}` : ''); }} className="text-[11px] text-bio-primary hover:underline font-medium">Ingresar código completo</button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Código completo de seguimiento</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input type="text" placeholder="BA-2026-X9Y2" className="w-full p-4 pl-12 border-2 border-slate-200 rounded-xl text-lg uppercase font-mono tracking-wider focus:border-bio-primary focus:ring-4 focus:ring-bio-primary/10 outline-none transition-all" value={fullCode} onChange={e => setFullCode(e.target.value.toUpperCase())} autoFocus />
                </div>
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={() => { setUseFullInput(false); setSuffix(''); }} className="text-[11px] text-bio-primary hover:underline font-medium">← Solo últimos 4 dígitos</button>
                </div>
              </div>
            )}
            <button type="submit" disabled={!canSearch} className="w-full py-3 bg-bio-primary text-white rounded-xl font-bold hover:bg-bio-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
              <Search className="w-4 h-4" /> Consultar Estado
            </button>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" /> {error}
            </div>
          )}
        </div>

        {/* Result Card */}
        {report && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border border-slate-100">
            {/* Header */}
            <div className="bg-bio-primary/5 p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">REPORTE</p>
                <p className="text-xl font-mono font-black text-bio-primary">{report.tracking_id}</p>
                <p className="text-xs text-slate-500 mt-1">{getSectorLabel(report.sector)} • {getStatusLabel(report.status)}</p>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Activity className="text-bio-secondary w-6 h-6" />
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="p-6 md:p-8">
              <div className="relative flex justify-between mb-8">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full" />
                <div className="absolute top-1/2 left-0 h-1 bg-bio-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-1000" style={{ width: `${(step - 1) * 50}%` }} />
                {['Recibido', 'En Análisis', 'Resuelto'].map((label, idx) => {
                  const active = step > idx;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 bg-white px-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${active ? 'bg-bio-primary border-bio-primary text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                        {active ? <CheckCircle2 className="w-5 h-5" /> : (idx + 1)}
                      </div>
                      <span className={`text-xs font-bold ${active ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Tu Reporte</h3>
                <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                  "{report.description}"
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-bio-primary flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4" /> Historial de Actividad
                </h3>
                <p className="text-[10px] text-slate-400 mb-4">Tocá cada evento para ver el detalle</p>

                <div className="relative space-y-0 pl-2">
                  <div className="absolute top-2 bottom-2 left-[19px] w-0.5 bg-slate-100 -z-10" />
                  {parseEvents(report).map((event, idx) => (
                    <div key={idx} className="flex gap-4 pb-5 last:pb-0 group" onClick={() => setExpandedEntry(expandedEntry === idx ? null : idx)}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10 ${getEventColor(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="pt-1.5 w-full min-w-0 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            {event.date && <span className="text-xs text-slate-400 font-mono block mb-0.5">{event.date}</span>}
                            <div className="text-sm text-slate-700">{event.message}</div>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${expandedEntry === idx ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned responsibles */}
              {report.assigned_to.length > 0 && (
                <div className="border-t border-slate-100 pt-6 mt-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Responsables Asignados</h3>
                  <div className="space-y-2">
                    {report.assigned_to.map(a => (
                      <div key={a.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${a.responded ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {a.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{a.name}</span>
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${a.responded ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                          {a.responded ? '✅ Respondió' : '⏳ Pendiente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
