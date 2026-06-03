import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, ArrowLeft, Info, AlertTriangle, Building2,
  Camera, Loader2, CheckCircle2, Mic
} from 'lucide-react';
import { SECTORS, FINDING_ORIGINS, FINDING_TYPES, SEDES } from '../../constants';

export function FindingForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    origin: '',
    type: '',
    sede: '',
    sector: '',
    description: '',
    reporter_name: '',
    reporter_sector: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    const trackingId = `BA-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setSuccess(trackingId);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-10 p-10 card text-center animate-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center animate-pulse">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-display font-black text-bio-primary mb-3">
          ¡Hallazgo Registrado!
        </h2>
        <p className="text-slate-500 text-sm font-medium mb-6">
          El equipo de Calidad revisará tu hallazgo a la brevedad.
        </p>
        <div className="bg-bio-primary/5 border border-bio-primary/10 p-4 rounded-xl mb-6">
          <p className="text-2xl font-mono font-black text-bio-primary tracking-wider">{success}</p>
          <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-widest">Código de seguimiento</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setSuccess(null); setFormData({ origin: '', type: '', sede: '', sector: '', description: '', reporter_name: '', reporter_sector: '' }); }} className="btn-secondary flex-1">
            Nuevo Hallazgo
          </button>
          <button onClick={() => navigate('/calidad')} className="btn-primary flex-1">
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/calidad')}
        className="btn-ghost mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Dashboard
      </button>

      {/* Header */}
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-display font-black text-bio-primary">Nuevo Hallazgo</h1>
        <p className="text-slate-400 text-sm font-medium">
          Registra una no conformidad, oportunidad de mejora o evento detectado
        </p>
      </div>

      {/* Quick guide */}
      <div className="card p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-bio-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <h3 className="text-[10px] font-bold text-bio-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Info className="w-4 h-4" /> Guía Rápida
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </div>
            <p className="font-bold text-slate-800 text-xs">Sé Específico</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">Detalla Qué, Dónde y Cuándo con precisión.</p>
          </div>
          <div className="space-y-2">
            <div className="w-9 h-9 bg-bio-secondary/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-4 h-4 text-bio-secondary" />
            </div>
            <p className="font-bold text-slate-800 text-xs">Indica la Sede</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">Especifica si ocurrió en Hospital o Planta.</p>
          </div>
          <div className="space-y-2">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Camera className="w-4 h-4 text-blue-600" />
            </div>
            <p className="font-bold text-slate-800 text-xs">Adjunta Evidencia</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">Las fotos fortalecen el análisis del hallazgo.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Origin + Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Origen del Hallazgo <span className="text-red-500">*</span></label>
              <select
                required
                className="input-field"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              >
                <option value="">Seleccionar origen...</option>
                {FINDING_ORIGINS.map((o) => (
                  <option key={o.value} value={o.value}>{o.icon} {o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Tipo de Hallazgo <span className="text-red-500">*</span></label>
              <select
                required
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="">Seleccionar tipo...</option>
                {FINDING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sede + Sector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Sede <span className="text-red-500">*</span></label>
              <select
                required
                className="input-field"
                value={formData.sede}
                onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
              >
                <option value="">Seleccionar sede...</option>
                {SEDES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Sector Afectado <span className="text-red-500">*</span></label>
              <select
                required
                className="input-field"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              >
                <option value="">Seleccionar sector...</option>
                {SECTORS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reporter info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Tu Nombre <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="Nombre del reportante"
                className="input-field"
                value={formData.reporter_name}
                onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">Tu Sector <span className="text-red-500">*</span></label>
              <select
                required
                className="input-field"
                value={formData.reporter_sector}
                onChange={(e) => setFormData({ ...formData, reporter_sector: e.target.value })}
              >
                <option value="">Seleccionar tu sector...</option>
                {SECTORS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label-text">Descripción del Hallazgo <span className="text-red-500">*</span></label>
            <textarea
              required
              rows={5}
              placeholder="Describe en detalle lo observado: qué ocurrió, dónde, cuándo, y qué impacto tuvo o podría tener..."
              className="input-field resize-none leading-relaxed"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Voice recorder hint */}
          <div className="flex items-center gap-3 p-3 bg-bio-primary/5 rounded-xl border border-bio-primary/10">
            <div className="w-8 h-8 rounded-lg bg-bio-primary/10 flex items-center justify-center">
              <Mic className="w-4 h-4 text-bio-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-bio-primary">Dictado por Voz</p>
              <p className="text-[10px] text-slate-500">Próximamente: describe el hallazgo con tu voz y la IA lo transcribe automáticamente.</p>
            </div>
          </div>

          {/* Evidence upload */}
          <div>
            <label className="label-text">Evidencia Visual (Opcional)</label>
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
              <button
                type="button"
                className="w-full h-20 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-bio-primary/40 hover:text-bio-primary hover:bg-white transition-all duration-300 gap-1.5 group cursor-pointer"
              >
                <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold tracking-tight">Adjuntar fotos o evidencia</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Registrar Hallazgo
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
