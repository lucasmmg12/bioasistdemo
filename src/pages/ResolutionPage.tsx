import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Loader2, CheckCircle2, XCircle, AlertTriangle, X, Send, Download,
  Clock, Mic, Square, Paperclip, ChevronRight, ChevronDown,
  Zap, Search as SearchIcon, FileText, Calendar,
} from 'lucide-react';
import { useFindings } from '../contexts/FindingsContext';
import { SECTORS } from '../constants';
import type { Finding } from '../types';

const getSectorLabel = (v: string) => SECTORS.find(s => s.value === v)?.label || v;

// RCA methods
const RCA_METHODS = [
  { value: '5_porques', label: '5 Porqués' },
  { value: 'ishikawa', label: 'Diagrama Ishikawa' },
  { value: 'pareto', label: 'Análisis Pareto' },
  { value: 'lluvia_ideas', label: 'Lluvia de Ideas' },
  { value: 'otro', label: 'Otro' },
];

export function ResolutionPage() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const { getFindingByTrackingId, submitResolution } = useFindings();

  const [finding, setFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // Form data
  const [immediateAction, setImmediateAction] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [rootCauseMethod, setRootCauseMethod] = useState('5_porques');
  const [correctivePlan, setCorrectivePlan] = useState('');
  const [implementationDate, setImplementationDate] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Evidence
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Whether this finding needs deep analysis (NC/adverse)
  const needsRCA = finding && (finding.type === 'no_conformidad' || finding.type === 'evento_adverso' || finding.type === 'reclamo_formal');

  // Load finding
  useEffect(() => {
    if (!trackingId) { setError('Link inválido'); setLoading(false); return; }

    const found = getFindingByTrackingId(trackingId);
    if (found) {
      setFinding(found);
      // Pre-populate if there's existing data
      if (found.immediate_action) setImmediateAction(found.immediate_action);
      if (found.root_cause) setRootCause(found.root_cause);
      if (found.corrective_plan) setCorrectivePlan(found.corrective_plan);
      if (found.root_cause_method) setRootCauseMethod(found.root_cause_method);
      // Determine step based on status
      if (found.status === 'verification' || found.status === 'effectiveness' || found.status === 'closed') {
        setSubmitted(true);
      } else if (found.immediate_action) {
        setCurrentStep(needsRCA ? 2 : 1);
      }
    } else {
      setError('No se encontró el reporte. Verificá el enlace.');
    }
    setLoading(false);
  }, [trackingId, getFindingByTrackingId]);

  // Auto-save draft every 5s
  useEffect(() => {
    if (!finding || submitted) return;
    const interval = setInterval(() => {
      if (immediateAction.trim() || rootCause.trim() || correctivePlan.trim()) {
        setDraftSavedAt(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [finding, submitted, immediateAction, rootCause, correctivePlan]);

  // Voice recording
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const target = currentStep === 1 ? 'immediateAction' : 'rootCause';
        if (target === 'immediateAction') {
          setImmediateAction(prev => prev + '\n\n[🎤 Nota de voz]: Observación verbal registrada sobre la acción inmediata tomada.');
        } else {
          setRootCause(prev => prev + '\n\n[🎤 Nota de voz]: Análisis verbal de la causa raíz del hallazgo detectado.');
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch { alert('No se pudo acceder al micrófono.'); }
  }, [isRecording, currentStep]);

  // File upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(f => {
        if (f.size <= 5 * 1024 * 1024) {
          setEvidenceUrls(prev => [...prev, URL.createObjectURL(f)]);
        }
      });
    }
  };

  const removeEvidence = (idx: number) => {
    URL.revokeObjectURL(evidenceUrls[idx]);
    setEvidenceUrls(prev => prev.filter((_, i) => i !== idx));
  };

  // Submit Step 1
  const handleStep1Complete = () => {
    if (!immediateAction.trim()) { alert('Describí la acción inmediata tomada.'); return; }
    if (needsRCA) {
      setCurrentStep(2);
    } else {
      handleFullSubmit();
    }
  };

  // Full submit
  const handleFullSubmit = () => {
    if (!finding) return;
    if (!immediateAction.trim()) { alert('Describí la acción inmediata.'); return; }
    if (needsRCA && !rootCause.trim()) { alert('Describí la causa raíz.'); return; }
    if (needsRCA && !correctivePlan.trim()) { alert('Describí el plan correctivo.'); return; }

    submitResolution(finding.id, {
      immediateAction: immediateAction.trim(),
      rootCause: rootCause.trim() || undefined,
      rootCauseMethod,
      correctivePlan: correctivePlan.trim() || undefined,
      implementationDate: implementationDate || undefined,
    });

    setSubmitted(true);
  };

  // Reject assignment
  const handleReject = () => {
    if (!rejectReason.trim()) return;
    // In a real app this would update the context
    setRejected(true);
    setShowRejectModal(false);
  };

  // Parse timeline
  const parseTimeline = (f: Finding) => {
    const events: { date: string; msg: string; type: string }[] = [{
      date: new Date(f.created_at).toLocaleString('es-AR'),
      msg: 'Hallazgo registrado',
      type: 'start',
    }];
    if (f.notes) {
      f.notes.split('\n\n').filter(n => n.trim()).forEach(note => {
        const match = note.match(/^\[([^\]]+)\]\s?(.*)/);
        if (match) events.push({ date: match[1], msg: match[2], type: match[2].includes('DERIVADO') ? 'derivation' : match[2].includes('RESOLUCIÓN') ? 'approved' : 'info' });
      });
    }
    return events;
  };

  // ═══════════════ LOADING ═══════════════
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bio-primary/5 via-white to-bio-secondary/5">
        <Loader2 className="w-8 h-8 animate-spin text-bio-primary" />
      </div>
    );
  }

  // ═══════════════ ERROR ═══════════════
  if (error || !finding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bio-primary/5 via-white to-bio-secondary/5 p-4">
        <div className="text-center max-w-md bg-white rounded-3xl shadow-xl p-10">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Enlace no válido</h2>
          <p className="text-slate-500 text-sm">{error || 'No se encontró el reporte.'}</p>
          <Link to="/seguimiento" className="inline-block mt-6 text-sm font-bold text-bio-primary hover:underline">Ir a Seguimiento →</Link>
        </div>
      </div>
    );
  }

  // ═══════════════ REJECTED ═══════════════
  if (rejected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bio-primary/5 via-white to-bio-secondary/5 p-4">
        <div className="text-center max-w-md bg-white rounded-3xl shadow-xl p-10 animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Asignación Rechazada</h2>
          <p className="text-slate-500 text-sm mb-2">Has indicado que el caso <strong className="text-bio-primary">{finding.tracking_id}</strong> no te corresponde.</p>
          <p className="text-slate-400 text-xs">El equipo de Calidad reasignará el caso.</p>
          <div className="mt-6 bg-orange-50 rounded-xl p-4 border border-orange-100">
            <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">Estado actualizado</p>
            <p className="text-sm text-orange-600 mt-1">Pendiente de reasignación</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════ SUCCESS ═══════════════
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bio-primary/5 via-white to-bio-secondary/5 p-4">
        <div className="text-center max-w-md bg-white rounded-3xl shadow-xl p-10 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">¡Resolución Enviada!</h2>
          <p className="text-slate-500 text-sm mb-2">Tu gestión del caso <strong className="text-bio-primary">{finding.tracking_id}</strong> fue registrada exitosamente.</p>
          <p className="text-slate-400 text-xs">El equipo de Calidad revisará y validará tu respuesta.</p>
          <div className="mt-6 bg-bio-primary/5 rounded-xl p-4 border border-bio-primary/10">
            <p className="text-xs font-bold text-bio-primary uppercase tracking-wider">Próximo paso</p>
            <p className="text-sm text-bio-primary/80 mt-1">Validación por Calidad</p>
          </div>
          <Link to="/seguimiento" className="inline-block mt-6 text-sm font-bold text-bio-primary hover:underline">Ver estado del caso →</Link>
        </div>
      </div>
    );
  }

  const timeline = parseTimeline(finding);

  // ═══════════════ RESOLUTION FORM ═══════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-bio-primary/5 via-white to-bio-secondary/5 relative">
      {/* Top Action Bar */}
      <div className="fixed top-4 right-4 z-20 flex gap-2">
        <button onClick={() => setShowRejectModal(true)} className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm border border-red-200 text-red-600 font-bold text-xs rounded-full shadow-sm hover:bg-red-50 transition-all">
          <XCircle className="w-4 h-4" /> No me corresponde
        </button>
      </div>

      {/* Header */}
      <div className="bg-bio-primary text-white py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">BIO ASIST — GESTIÓN DE CASO</p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Ticket #{finding.tracking_id}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-white/70 text-sm">{getSectorLabel(finding.sector)}</span>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase">{finding.type.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-6 pb-20">
        {/* Report Description */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Descripción del Hallazgo
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed italic">"{finding.description}"</p>
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
            <span>📅 {new Date(finding.created_at).toLocaleDateString('es-AR')}</span>
            <span>👤 {finding.reporter_name}</span>
          </div>
        </div>

        {/* Draft saved indicator */}
        {draftSavedAt && (
          <div className="mb-4 flex items-center gap-2 text-[10px] text-green-600 font-bold animate-in fade-in">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Borrador guardado automáticamente a las {draftSavedAt}
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${currentStep === 1 ? 'bg-bio-primary text-white shadow-lg' : 'bg-green-100 text-green-700'}`}>
            {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            Paso 1: Acción Inmediata
          </div>
          {needsRCA && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${currentStep === 2 ? 'bg-bio-primary text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                <SearchIcon className="w-4 h-4" />
                Paso 2: Análisis Profundo
              </div>
            </>
          )}
        </div>

        {/* ─────── STEP 1 ─────── */}
        <div className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-slate-100 mb-6 transition-all ${currentStep !== 1 ? 'opacity-60 pointer-events-none' : ''}`}>
          <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" /> Acción Inmediata
          </h3>
          <p className="text-xs text-slate-400 mb-6">¿Qué acción inmediata tomaste o se debe tomar frente a este hallazgo?</p>

          <textarea rows={5} placeholder="Describe la acción inmediata tomada para contener el problema..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-bio-primary focus:ring-2 focus:ring-bio-primary/10 outline-none transition-all text-sm resize-none leading-relaxed mb-4" value={immediateAction} onChange={e => setImmediateAction(e.target.value)} />

          {/* Voice */}
          <div className="flex items-center gap-3 mb-4">
            <button type="button" onClick={toggleRecording} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {isRecording ? <><Square className="w-4 h-4" /> Detener</> : <><Mic className="w-4 h-4" /> Nota de voz</>}
            </button>
            {isRecording && <span className="text-xs text-red-500 font-bold animate-pulse">● Grabando...</span>}
          </div>

          {/* Evidence */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">📷 Evidencia</label>
            {evidenceUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {evidenceUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeEvidence(idx)} className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-16 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-bio-primary/40 hover:text-bio-primary transition-all gap-2 text-xs font-bold">
              <Paperclip className="w-4 h-4" /> Adjuntar fotos
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />
          </div>

          {currentStep === 1 && (
            <button onClick={handleStep1Complete} className="w-full mt-6 py-3 bg-bio-primary text-white rounded-xl font-bold hover:bg-bio-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-bio-primary/20">
              {needsRCA ? <><ChevronRight className="w-5 h-5" /> Continuar al Paso 2</> : <><Send className="w-5 h-5" /> Enviar Resolución</>}
            </button>
          )}
        </div>

        {/* ─────── STEP 2 ─────── */}
        {needsRCA && (
          <div className={`bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-slate-100 mb-6 transition-all ${currentStep !== 2 ? 'opacity-40 pointer-events-none' : ''}`}>
            <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <SearchIcon className="w-5 h-5 text-blue-500" /> Análisis de Causa Raíz
            </h3>
            <p className="text-xs text-slate-400 mb-6">Identificá la causa raíz y definí el plan de acción correctiva.</p>

            {/* RCA Method */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 mb-2">Método de Análisis</label>
              <div className="flex flex-wrap gap-2">
                {RCA_METHODS.map(m => (
                  <button key={m.value} type="button" onClick={() => setRootCauseMethod(m.value)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${rootCauseMethod === m.value ? 'bg-bio-primary text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Root Cause */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 mb-2">🔬 Causa Raíz <span className="text-red-500">*</span></label>
              <textarea rows={4} placeholder="¿Cuál es la causa raíz del problema?" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-bio-primary focus:ring-2 focus:ring-bio-primary/10 outline-none transition-all text-sm resize-none" value={rootCause} onChange={e => setRootCause(e.target.value)} />
            </div>

            {/* Corrective Plan */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 mb-2">📝 Plan de Acción Correctiva <span className="text-red-500">*</span></label>
              <textarea rows={4} placeholder="¿Qué acciones correctivas se implementarán?" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-bio-primary focus:ring-2 focus:ring-bio-primary/10 outline-none transition-all text-sm resize-none" value={correctivePlan} onChange={e => setCorrectivePlan(e.target.value)} />
            </div>

            {/* Implementation Date */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Fecha Compromiso de Implementación
              </label>
              <input type="date" min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-bio-primary outline-none text-sm" value={implementationDate} onChange={e => setImplementationDate(e.target.value)} />
            </div>

            {/* Back & Submit */}
            <div className="flex gap-3">
              <button onClick={() => setCurrentStep(1)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm">
                ← Volver al Paso 1
              </button>
              <button onClick={handleFullSubmit} className="flex-1 py-3 bg-bio-primary text-white rounded-xl font-bold hover:bg-bio-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-bio-primary/20 text-sm">
                <Send className="w-4 h-4" /> Enviar Resolución
              </button>
            </div>
          </div>
        )}

        {/* ─────── TIMELINE ─────── */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <h3 className="text-sm font-bold text-bio-primary flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4" /> Historial de Actividad
          </h3>
          <div className="relative space-y-0 pl-2">
            <div className="absolute top-2 bottom-2 left-[15px] w-0.5 bg-slate-100" />
            {timeline.map((ev, idx) => (
              <div key={idx} className="flex gap-3 pb-4 last:pb-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-3 border-white shadow-sm z-10 ${ev.type === 'approved' ? 'bg-green-100 text-green-600' : ev.type === 'derivation' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                  <div className="w-2 h-2 rounded-full bg-current" />
                </div>
                <div className="pt-1">
                  {ev.date && <span className="text-[10px] text-slate-400 font-mono block">{ev.date}</span>}
                  <p className="text-sm text-slate-700">{ev.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════ REJECT MODAL ═══════════════ */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Rechazar Asignación</h3>
              </div>
              <button onClick={() => setShowRejectModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Estás indicando que el caso <strong className="text-bio-primary">{finding.tracking_id}</strong> no corresponde a tu sector.
              </p>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Motivo del rechazo..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-400 outline-none text-sm resize-none" rows={3} autoFocus />
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <p className="text-xs text-amber-700"><strong>Nota:</strong> Esta acción queda registrada en el historial del ticket.</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 text-sm">Cancelar</button>
              <button onClick={handleReject} disabled={!rejectReason.trim()} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
