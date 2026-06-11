import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Send, ShieldAlert, User, Lock, Info, AlertTriangle, Lightbulb,
  Paperclip, X, Phone, Mic, Square, Loader2, CheckCircle2, Copy, ArrowLeft,
} from 'lucide-react';
import { useFindings } from '../contexts/FindingsContext';
import { SECTORS, FINDING_TYPES } from '../constants';
import type { Finding, Assignee } from '../types';

export function PublicReportForm() {
  const { addFinding } = useFindings();
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    reporterSector: '',
    sector: '',
    type: 'no_conformidad',
    content: '',
    contactName: '',
    contactNumber: '',
  });

  const generateTrackingId = () => {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BA-${year}-${random}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(f => f.size <= 5 * 1024 * 1024);
      if (newFiles.length > 0) {
        setFiles((prev: File[]) => [...prev, ...newFiles]);
        setPreviewUrls(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
      }
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFiles((prev: File[]) => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        // Simulate transcription
        setFormData(prev => ({
          ...prev,
          content: prev.content
            ? prev.content.trimEnd() + '\n\n[🎤 Nota de voz transcrita]: Se registró una observación verbal sobre el hallazgo detectado en el sector.'
            : '[🎤 Nota de voz transcrita]: Se registró una observación verbal sobre el hallazgo detectado en el sector.',
        }));
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      alert('No se pudo acceder al micrófono.');
    }
  }, [isRecording]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sector || !formData.content.trim()) return;

    if (!isAnonymous) {
      if (!formData.contactName.trim()) { alert('Ingresá tu nombre completo.'); return; }
      if (formData.contactNumber.replace(/\D/g, '').length !== 10) {
        alert('El número debe tener 10 dígitos (cód. área + número). Ej: 2645438114');
        return;
      }
    }

    setLoading(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1200));

    const trackingId = generateTrackingId();
    const now = new Date().toISOString();
    const ts = new Date().toLocaleString('es-AR');

    const finding: Finding = {
      id: `f_pub_${Date.now()}`,
      tracking_id: trackingId,
      type: formData.type as Finding['type'],
      origin: 'deteccion_espontanea',
      sede: 'planta',
      sector: formData.sector,
      reporter_sector: formData.reporterSector,
      priority: 'yellow',
      status: 'pending',
      description: formData.content,
      reporter_name: isAnonymous ? 'Anónimo' : formData.contactName,
      assigned_to: [] as Assignee[],
      created_at: now,
      updated_at: now,
      deadline_immediate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      deadline_analysis: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      is_propagable: false,
      propagated_sectors: [],
      evidence_urls: files.map(f => URL.createObjectURL(f)),
      resolution_evidence_urls: [] as string[],
      risk_matrix_impact: false,
      notes: `[${ts}] 📥 REPORTE RECIBIDO: Hallazgo creado desde formulario público${!isAnonymous ? ` por ${formData.contactName}` : ' (anónimo)'}`,
    };

    addFinding(finding);
    setSuccessId(trackingId);
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!successId) return;
    try { await navigator.clipboard.writeText(successId); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ═══════════════ SUCCESS SCREEN ═══════════════
  if (successId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bio-primary/5 via-white to-bio-secondary/5 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-bio-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-bio-primary" />
          </div>
          <h2 className="text-3xl font-black text-bio-primary mb-3">¡Reporte Enviado!</h2>
          <p className="text-slate-500 mb-8 font-medium">Gracias por ayudarnos a mejorar. Tu código de seguimiento es:</p>
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-8">
            <p className="text-3xl font-mono font-black text-bio-primary tracking-wider">{successId}</p>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Guarda este código para consultas futuras</p>
            <button onClick={handleCopy} className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-white text-bio-primary border border-bio-primary/20 hover:bg-bio-primary hover:text-white shadow-sm'}`}>
              {copied ? <><CheckCircle2 className="w-4 h-4" /> ¡Copiado!</> : <><Copy className="w-4 h-4" /> Copiar código</>}
            </button>
          </div>

          {!isAnonymous && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-100 mb-6 text-left">
              <p className="text-xs font-bold text-green-700 mb-1">📱 WhatsApp de confirmación enviado</p>
              <p className="text-[10px] text-green-600">Se envió un mensaje a {formData.contactNumber} con el código de seguimiento.</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={() => { setSuccessId(null); setFormData({ reporterSector: '', sector: '', type: 'no_conformidad', content: '', contactName: '', contactNumber: '' }); setFiles([] as File[]); setPreviewUrls([]); setIsAnonymous(false); }} className="w-full py-3 bg-bio-primary text-white rounded-xl font-bold hover:bg-bio-primary/90 transition-all">
              Enviar Nuevo Reporte
            </button>
            <Link to="/seguimiento" className="text-sm text-bio-primary font-bold hover:underline">Consultar estado de mi reporte →</Link>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════ FORM ═══════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-bio-primary/5 via-white to-bio-secondary/5">
      {/* Header */}
      <div className="bg-bio-primary text-white py-6 px-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link to="/calidad" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Reportar Hallazgo</h1>
            <p className="text-white/70 text-sm font-medium">Tu voz es el motor de nuestra mejora continua.</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-6 pb-20">
        {/* Quick Guide */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-bio-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-xs font-bold text-bio-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Info className="w-4 h-4" /> Guía Rápida de Reporte
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-orange-600" /></div>
              <p className="font-bold text-slate-800 text-sm">Sé Específico</p>
              <p className="text-xs text-slate-500 leading-relaxed">Detalla el Qué, Dónde y Cuándo con precisión.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center"><Lightbulb className="w-5 h-5 text-yellow-600" /></div>
              <p className="font-bold text-slate-800 text-sm">Aporta Ideas</p>
              <p className="text-xs text-slate-500 leading-relaxed">Tus sugerencias de solución son muy valiosas.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-bio-primary/10 rounded-xl flex items-center justify-center"><ShieldAlert className="w-5 h-5 text-bio-primary" /></div>
              <p className="font-bold text-slate-800 text-sm">Identificación</p>
              <p className="text-xs text-slate-500 leading-relaxed">Identificarte permite darte feedback directo.</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Anonymous Toggle */}
            <div className={`rounded-2xl border-2 transition-all duration-500 p-5 ${!isAnonymous ? 'border-green-200 bg-green-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${!isAnonymous ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-amber-400 text-white shadow-lg shadow-amber-400/20'}`}>
                    {!isAnonymous ? <User className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className={`font-bold text-base ${!isAnonymous ? 'text-green-700' : 'text-amber-700'}`}>{!isAnonymous ? 'Modo Identificado' : 'Modo Anónimo'}</p>
                    <p className="text-xs text-slate-500">{!isAnonymous ? 'Podremos contactarte para feedback.' : 'Tu identidad estará protegida.'}</p>
                  </div>
                </div>
                <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${isAnonymous ? 'bg-amber-400' : 'bg-green-500'}`} onClick={() => setIsAnonymous(!isAnonymous)}>
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${isAnonymous ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </div>
              {isAnonymous && (
                <div className="mt-4 p-3 bg-white rounded-xl border border-amber-100 animate-in slide-in-from-top-2">
                  <p className="text-xs font-bold text-amber-800 mb-1">¿Sabías que identificarte tiene ventajas?</p>
                  <ul className="text-[11px] text-amber-700 space-y-0.5">
                    <li>✅ Recibís notificaciones del avance por WhatsApp</li>
                    <li>✅ Podemos resolver tu inquietud más rápido</li>
                    <li>✅ Tu información es <strong>estrictamente confidencial</strong></li>
                  </ul>
                  <button type="button" onClick={() => setIsAnonymous(false)} className="mt-2 text-xs font-bold text-bio-primary hover:underline flex items-center gap-1">
                    <User className="w-3 h-3" /> Quiero identificarme
                  </button>
                </div>
              )}
            </div>

            {/* Sector Reporter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sector al que perteneces <span className="text-red-500">*</span>
              </label>
              <select required value={formData.reporterSector} onChange={e => setFormData({ ...formData, reporterSector: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-bio-primary focus:ring-2 focus:ring-bio-primary/10 outline-none transition-all text-sm bg-white">
                <option value="">Seleccioná tu sector...</option>
                {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Sector Destino */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sector al cual va dirigida tu observación <span className="text-red-500">*</span>
              </label>
              <select required value={formData.sector} onChange={e => setFormData({ ...formData, sector: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-bio-primary focus:ring-2 focus:ring-bio-primary/10 outline-none transition-all text-sm bg-white">
                <option value="">Seleccioná el área relacionada...</option>
                {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de hallazgo</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-bio-primary focus:ring-2 focus:ring-bio-primary/10 outline-none transition-all text-sm bg-white">
                {FINDING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Detalle del Hallazgo <span className="text-red-500">*</span></label>
              <textarea required rows={5} placeholder="Describe brevemente lo sucedido..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-bio-primary focus:ring-2 focus:ring-bio-primary/10 outline-none transition-all text-sm resize-none leading-relaxed" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
            </div>

            {/* Voice Recorder */}
            <div className="flex items-center gap-3">
              <button type="button" onClick={toggleRecording} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {isRecording ? <><Square className="w-4 h-4" /> Detener grabación</> : <><Mic className="w-4 h-4" /> Grabar nota de voz</>}
              </button>
              {isRecording && <span className="text-xs text-red-500 font-bold animate-pulse">● Grabando...</span>}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Evidencia Visual (Opcional)</label>
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-100 group">
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removeFile(idx)} className="bg-white p-2 rounded-full text-red-600 shadow-md hover:scale-110 transition-all"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-20 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-bio-primary/40 hover:text-bio-primary transition-all gap-1 group">
                <Paperclip className="w-5 h-5" />
                <span className="text-xs font-bold">Adjuntar fotos o evidencia</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />
            </div>

            {/* Contact Fields */}
            {!isAnonymous ? (
              <div className="space-y-4 p-5 bg-green-50/50 rounded-2xl border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Datos de Contacto (Obligatorio)</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="text" required placeholder="Ej: Juan Pérez" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-bio-primary focus:ring-2 focus:ring-bio-primary/10 outline-none text-sm" value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">WhatsApp de Contacto <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="tel" required placeholder="2645438114" maxLength={10} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-bio-primary focus:ring-2 focus:ring-bio-primary/10 outline-none text-sm" value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 ml-1">10 dígitos sin 0 ni 15. Ej: 2645438114</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-slate-400" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Datos de Contacto (Opcional)</span></div>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Modo Anónimo</span>
                </div>
                <div>
                  <input type="text" placeholder="Tu nombre (opcional)" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-bio-primary outline-none text-sm" value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} />
                </div>
                <div>
                  <input type="tel" placeholder="WhatsApp (opcional)" maxLength={10} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-bio-primary outline-none text-sm" value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
                </div>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="w-full py-4 bg-bio-primary text-white rounded-xl font-bold text-base hover:bg-bio-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-bio-primary/20">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Enviar Reporte Seguro</>}
            </button>
            <p className="text-center text-[10px] text-slate-400 uppercase tracking-tight font-bold">
              Tus datos son tratados con estricta confidencialidad.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
