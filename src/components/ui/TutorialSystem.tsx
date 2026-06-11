import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, Lightbulb, SkipForward } from 'lucide-react';

// ═══════════════════════════════════════
//  Tutorial Step Definitions per Module
// ═══════════════════════════════════════
interface TutorialStep {
  title: string;
  description: string;
  selector?: string;     // CSS selector to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon?: string;
}

const TUTORIAL_STEPS: Record<string, TutorialStep[]> = {
  '/calidad': [
    { title: 'Dashboard de Calidad', description: 'Bienvenido al módulo de Gestión de Calidad ISO 9001. Desde aquí gestionás todo el ciclo de vida de los hallazgos: desde su detección hasta su cierre.', icon: '🛡️', position: 'center' },
    { title: 'KPIs en Tiempo Real', description: 'Los indicadores muestran el estado global: total activos, pendientes, en proceso, vencidos y cerrados. Se actualizan automáticamente con cada cambio.', icon: '📊', position: 'top' },
    { title: 'Filtros Avanzados', description: 'Filtrá hallazgos por estado, sector, prioridad o buscá por ID/descripción. Las pestañas de estado te permiten ver cada etapa del ciclo.', icon: '🔍', position: 'top' },
    { title: 'Crear Nuevo Hallazgo', description: 'Hacé clic en "Nuevo Hallazgo" para registrar una no conformidad, oportunidad de mejora, reclamo o cualquier observación.', icon: '➕', position: 'top' },
    { title: 'Derivar a Responsables', description: 'Al abrir un hallazgo pendiente, podés "Derivar" a uno o varios responsables. Se les envía un WhatsApp con el link de resolución.', icon: '📱', position: 'center' },
    { title: 'Exportación de Documentos', description: 'Exportá reportes en PDF o Excel, y generá los formularios R GC 05 (AC), R GC 06 (OM), R GC 07 (Seguimiento) y R GC 08 (Reclamos).', icon: '📄', position: 'top' },
    { title: 'Ciclo Completo', description: 'Cada hallazgo sigue: Pendiente → Acción Inmediata → Análisis → Plan Correctivo → Verificación → Efectividad → Cerrado. Podés validar o devolver en cada etapa.', icon: '🔄', position: 'center' },
  ],
  '/calidad/mis-casos': [
    { title: 'Mis Casos', description: 'Este panel muestra los casos asignados al usuario actual. Cada responsable ve solo sus hallazgos derivados.', icon: '👤', position: 'center' },
    { title: 'Estado de Respuesta', description: 'Cada caso muestra si ya respondiste o si está pendiente. Los badges de colores indican la urgencia.', icon: '⏱️', position: 'center' },
    { title: 'Responder desde Aquí', description: 'Podés acceder al formulario de resolución directamente desde este panel, sin necesidad del link de WhatsApp.', icon: '✍️', position: 'center' },
  ],
  '/logistica': [
    { title: 'Portal de Logística', description: 'Gestión integral de pedidos, recepciones y distribución de insumos médicos e industriales.', icon: '📦', position: 'center' },
    { title: 'Estado de Pedidos', description: 'Visualizá cada pedido con su estado actual, fecha estimada de entrega y responsable asignado.', icon: '🚚', position: 'center' },
    { title: 'Trazabilidad Completa', description: 'Cada movimiento de material queda registrado con timestamp, usuario y observaciones para auditoría.', icon: '📋', position: 'center' },
  ],
  '/flota': [
    { title: 'Gestión de Flota', description: 'Monitoreo en tiempo real de la flota vehicular con GPS, telemetría y análisis de consumo.', icon: '🚛', position: 'center' },
    { title: 'Mapa en Vivo', description: 'Las unidades se mueven en tiempo real sobre el mapa de San Juan. Hacé clic en una para ver detalles.', icon: '🗺️', position: 'center' },
    { title: 'Telemetría Vehicular', description: 'Velocidad promedio, nivel de combustible, última posición y alertas de mantenimiento para cada unidad.', icon: '⛽', position: 'center' },
  ],
  '/facturacion': [
    { title: 'Módulo de Facturación', description: 'Gestión de liquidaciones, facturación y conciliación con obras sociales y prestadores.', icon: '💰', position: 'center' },
    { title: 'Estados de Cuenta', description: 'Visualizá el estado de cada factura: pendiente, en proceso, aprobada o rechazada por la obra social.', icon: '📑', position: 'center' },
    { title: 'Reportes Financieros', description: 'Exportá informes detallados con desglose por obra social, período, prestación y concepto.', icon: '📈', position: 'center' },
  ],
  '/metricas': [
    { title: 'Métricas de Calidad', description: 'Panel analítico con indicadores clave del sistema de gestión de calidad.', icon: '📊', position: 'center' },
    { title: 'Tendencias', description: 'Gráficos de evolución mensual de hallazgos, tiempos de resolución y efectividad de acciones correctivas.', icon: '📈', position: 'center' },
    { title: 'Sector Analysis', description: 'Distribución de hallazgos por sector, tipo y prioridad. Identificá las áreas que necesitan más atención.', icon: '🎯', position: 'center' },
  ],
};

// ═══════════════════════════════════════
//  Tutorial Context
// ═══════════════════════════════════════
interface TutorialContextType {
  isActive: boolean;
  startTutorial: () => void;
  stopTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType>({
  isActive: false,
  startTutorial: () => {},
  stopTutorial: () => {},
});

export const useTutorial = () => useContext(TutorialContext);

// ═══════════════════════════════════════
//  Tutorial Provider
// ═══════════════════════════════════════
export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);

  return (
    <TutorialContext.Provider value={{
      isActive,
      startTutorial: () => setIsActive(true),
      stopTutorial: () => setIsActive(false),
    }}>
      {children}
      {isActive && <TutorialOverlay onClose={() => setIsActive(false)} />}
    </TutorialContext.Provider>
  );
}

// ═══════════════════════════════════════
//  Tutorial Overlay Component
// ═══════════════════════════════════════
function TutorialOverlay({ onClose }: { onClose: () => void }) {
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);

  // Find steps for current route
  const routeKey = Object.keys(TUTORIAL_STEPS).find(key =>
    location.pathname === key || location.pathname.startsWith(key + '/')
  ) || '/calidad';

  const steps = TUTORIAL_STEPS[routeKey] || TUTORIAL_STEPS['/calidad'];
  const step = steps[currentStep];
  const total = steps.length;

  // Reset on route change
  useEffect(() => { setCurrentStep(0); }, [location.pathname]);

  const next = useCallback(() => {
    if (currentStep < total - 1) setCurrentStep(c => c + 1);
    else onClose();
  }, [currentStep, total, onClose]);

  const prev = useCallback(() => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  }, [currentStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev, onClose]);

  if (!step) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Content Card */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full pointer-events-auto animate-in zoom-in-95 fade-in duration-300 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div className="h-full bg-gradient-to-r from-bio-primary to-bio-secondary transition-all duration-500" style={{ width: `${((currentStep + 1) / total) * 100}%` }} />
          </div>

          {/* Header */}
          <div className="p-6 pb-0 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-bio-primary/10 flex items-center justify-center text-2xl">
                {step.icon || '💡'}
              </div>
              <div>
                <p className="text-[10px] font-bold text-bio-primary uppercase tracking-wider">
                  Paso {currentStep + 1} de {total}
                </p>
                <h3 className="text-lg font-bold text-slate-800">{step.title}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 flex items-center justify-between">
            <button
              onClick={prev}
              disabled={currentStep === 0}
              className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentStep ? 'bg-bio-primary w-6' : 'bg-slate-200 hover:bg-slate-300'}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStep < total - 1 && (
                <button onClick={onClose} className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all">
                  <SkipForward className="w-3.5 h-3.5" /> Saltar
                </button>
              )}
              <button
                onClick={next}
                className="flex items-center gap-1 px-5 py-2.5 bg-bio-primary text-white rounded-xl text-sm font-bold hover:bg-bio-primary/90 transition-all shadow-lg shadow-bio-primary/20"
              >
                {currentStep < total - 1 ? <><ChevronRight className="w-4 h-4" /> Siguiente</> : '✅ ¡Listo!'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
//  Tutorial Trigger Button (for TopBar)
// ═══════════════════════════════════════
export function TutorialButton() {
  const { startTutorial } = useTutorial();

  return (
    <button
      onClick={startTutorial}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold hover:bg-amber-100 transition-all group"
      title="Iniciar tutorial de este módulo"
    >
      <Lightbulb className="w-3.5 h-3.5 group-hover:animate-pulse" />
      Tutorial
    </button>
  );
}
