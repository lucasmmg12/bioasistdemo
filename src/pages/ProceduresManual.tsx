import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, ChevronRight, ChevronDown, Shield, FileText, Send, Users,
  CheckCircle2, AlertTriangle, Eye, Download, Search, Clock, Mic,
  Lightbulb, Truck, Car, Receipt, BarChart3, ArrowLeft, Printer,
  ExternalLink, Zap, XCircle, Phone,
} from 'lucide-react';

// ═══════════════════════════════════════════
// Section data structure
// ═══════════════════════════════════════════
interface ManualSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  subsections: { id: string; title: string }[];
}

const SECTIONS: ManualSection[] = [
  {
    id: 'arquitectura',
    title: 'Arquitectura General',
    icon: <BookOpen className="w-5 h-5" />,
    subsections: [
      { id: 'diagrama-flujo', title: 'Diagrama de Flujo' },
      { id: 'ciclo-vida', title: 'Ciclo de Vida del Hallazgo' },
      { id: 'mapa-rutas', title: 'Mapa de Rutas' },
    ],
  },
  {
    id: 'proc-01',
    title: 'Proc. 01 — Reporte Público',
    icon: <FileText className="w-5 h-5" />,
    subsections: [
      { id: 'proc01-objetivo', title: 'Objetivo' },
      { id: 'proc01-flujo', title: 'Flujo del Proceso' },
      { id: 'proc01-campos', title: 'Campos del Formulario' },
    ],
  },
  {
    id: 'proc-02',
    title: 'Proc. 02 — Dashboard de Calidad',
    icon: <Shield className="w-5 h-5" />,
    subsections: [
      { id: 'proc02-kpis', title: 'KPIs en Tiempo Real' },
      { id: 'proc02-filtros', title: 'Filtros Disponibles' },
      { id: 'proc02-nuevo', title: 'Registro Administrativo' },
      { id: 'proc02-detalle', title: 'Modal de Detalle' },
    ],
  },
  {
    id: 'proc-03',
    title: 'Proc. 03 — Derivación y WhatsApp',
    icon: <Send className="w-5 h-5" />,
    subsections: [
      { id: 'proc03-flujo', title: 'Secuencia de Derivación' },
      { id: 'proc03-whatsapp', title: 'Notificación WhatsApp' },
      { id: 'proc03-link', title: 'Link de Resolución' },
    ],
  },
  {
    id: 'proc-04',
    title: 'Proc. 04 — Resolución del Responsable',
    icon: <Users className="w-5 h-5" />,
    subsections: [
      { id: 'proc04-paso1', title: 'Paso 1: Acción Inmediata' },
      { id: 'proc04-paso2', title: 'Paso 2: Análisis Profundo' },
      { id: 'proc04-features', title: 'Funcionalidades Adicionales' },
    ],
  },
  {
    id: 'proc-05',
    title: 'Proc. 05 — Validación Administrativa',
    icon: <CheckCircle2 className="w-5 h-5" />,
    subsections: [
      { id: 'proc05-flujo', title: 'Flujo de Validación' },
      { id: 'proc05-acciones', title: 'Acciones Disponibles' },
      { id: 'proc05-devolver', title: 'Modal de Devolución' },
    ],
  },
  {
    id: 'proc-06',
    title: 'Proc. 06 — Seguimiento Público',
    icon: <Search className="w-5 h-5" />,
    subsections: [
      { id: 'proc06-busqueda', title: 'Búsqueda por Código' },
      { id: 'proc06-resultado', title: 'Información del Resultado' },
    ],
  },
  {
    id: 'proc-07',
    title: 'Proc. 07 — Exportación',
    icon: <Download className="w-5 h-5" />,
    subsections: [
      { id: 'proc07-tipos', title: 'Tipos de Exportación' },
      { id: 'proc07-formularios', title: 'Formularios R GC' },
    ],
  },
  {
    id: 'proc-08',
    title: 'Proc. 08 — Tutorial Interactivo',
    icon: <Lightbulb className="w-5 h-5" />,
    subsections: [
      { id: 'proc08-uso', title: 'Cómo Iniciar' },
      { id: 'proc08-modulos', title: 'Pasos por Módulo' },
    ],
  },
  {
    id: 'modulos',
    title: 'Módulos Complementarios',
    icon: <BarChart3 className="w-5 h-5" />,
    subsections: [
      { id: 'mod-miscasos', title: 'Mis Casos' },
      { id: 'mod-metricas', title: 'Métricas' },
      { id: 'mod-logistica', title: 'Logística' },
      { id: 'mod-flota', title: 'Flota' },
      { id: 'mod-facturacion', title: 'Facturación' },
    ],
  },
  {
    id: 'glosario',
    title: 'Glosario y Roles',
    icon: <BookOpen className="w-5 h-5" />,
    subsections: [
      { id: 'glos-terminos', title: 'Glosario de Términos' },
      { id: 'glos-roles', title: 'Matriz de Roles' },
      { id: 'glos-normas', title: 'Referencias Normativas' },
    ],
  },
];

// ═══════════════════════════════════════════
// Flow Step Component
// ═══════════════════════════════════════════
function FlowStep({ number, icon, title, description, color = 'bio-primary', arrow = true }: {
  number: number; icon: React.ReactNode; title: string; description: string; color?: string; arrow?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 relative">
      <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center shrink-0 text-${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paso {number}</p>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{description}</p>
      </div>
      {arrow && <ChevronRight className="w-4 h-4 text-slate-300 absolute -right-1 top-4 hidden lg:block" />}
    </div>
  );
}

// ═══════════════════════════════════════════
// Info Card Component
// ═══════════════════════════════════════════
function InfoCard({ icon, title, children, color = 'blue' }: {
  icon: React.ReactNode; title: string; children: React.ReactNode; color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50/50',
    green: 'border-green-200 bg-green-50/50',
    amber: 'border-amber-200 bg-amber-50/50',
    red: 'border-red-200 bg-red-50/50',
    purple: 'border-purple-200 bg-purple-50/50',
    orange: 'border-orange-200 bg-orange-50/50',
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color] || colorMap.blue}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="text-sm font-bold text-slate-700">{title}</h4>
      </div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════
// Status Flow Visualizer
// ═══════════════════════════════════════════
function StatusFlow() {
  const statuses = [
    { label: 'Pendiente', color: 'bg-slate-200 text-slate-600', icon: '⏳' },
    { label: 'Acción Inmediata', color: 'bg-amber-100 text-amber-700', icon: '⚡' },
    { label: 'Análisis RCA', color: 'bg-orange-100 text-orange-700', icon: '🔬' },
    { label: 'Plan Correctivo', color: 'bg-purple-100 text-purple-700', icon: '📝' },
    { label: 'Verificación', color: 'bg-blue-100 text-blue-700', icon: '✅' },
    { label: 'Efectividad', color: 'bg-teal-100 text-teal-700', icon: '🎯' },
    { label: 'Cerrado', color: 'bg-green-100 text-green-700', icon: '🏁' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {statuses.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${s.color} flex items-center gap-1.5`}>
            <span>{s.icon}</span> {s.label}
          </div>
          {i < statuses.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300" />}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// Table Component
// ═══════════════════════════════════════════
function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-2 px-3 font-bold text-slate-500 uppercase tracking-wider text-[10px]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 px-3 text-slate-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════
export function ProceduresManual() {
  const [activeSection, setActiveSection] = useState('arquitectura');
  const [expandedSections, setExpandedSections] = useState<string[]>(['arquitectura']);
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Track visible section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0.1 }
    );

    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
      s.subsections.forEach(sub => {
        const subEl = document.getElementById(sub.id);
        if (subEl) observer.observe(subEl);
      });
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="bg-gradient-to-br from-bio-primary to-bio-primary/80 text-white rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
              ISO 9001:2015
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Manual de Procedimientos</h1>
          <p className="text-white/70 font-medium max-w-xl">
            Guía completa de procesos, flujos de trabajo y protocolos del sistema Bio Asist.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-xs font-bold text-white/50">Versión 1.0</span>
            <span className="text-xs text-white/50">•</span>
            <span className="text-xs text-white/50">Junio 2026</span>
            <span className="text-xs text-white/50">•</span>
            <span className="text-xs text-white/50">Grow Labs</span>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-xs font-bold hover:bg-white/20 transition-all">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <Link to="/reportar" className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-xs font-bold hover:bg-white/20 transition-all">
              <ExternalLink className="w-4 h-4" /> Ir al Formulario Público
            </Link>
          </div>
        </div>
      </div>

      {/* Layout: TOC + Content */}
      <div className="flex gap-6">
        {/* TOC Sidebar */}
        <div className={`hidden lg:block sticky top-4 self-start transition-all duration-300 ${tocCollapsed ? 'w-12' : 'w-64'} shrink-0`}>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            {!tocCollapsed ? (
              <>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contenido</h3>
                  <button onClick={() => setTocCollapsed(true)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90" />
                  </button>
                </div>
                <div className="p-3 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                  {SECTIONS.map(section => (
                    <div key={section.id} className="mb-1">
                      <button
                        onClick={() => { toggleSection(section.id); scrollToSection(section.id); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-bold transition-all ${
                          activeSection === section.id
                            ? 'bg-bio-primary/10 text-bio-primary'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-5 h-5 flex items-center justify-center shrink-0 text-inherit opacity-60">{section.icon}</span>
                        <span className="flex-1 truncate">{section.title}</span>
                        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${expandedSections.includes(section.id) ? 'rotate-0' : '-rotate-90'}`} />
                      </button>
                      {expandedSections.includes(section.id) && (
                        <div className="ml-7 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2">
                          {section.subsections.map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => scrollToSection(sub.id)}
                              className={`block w-full text-left px-2 py-1 rounded text-[11px] transition-colors ${
                                activeSection === sub.id ? 'text-bio-primary font-bold' : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              {sub.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-2">
                <button onClick={() => setTocCollapsed(false)} className="w-full p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Expandir índice">
                  <BookOpen className="w-4 h-4 text-slate-400 mx-auto" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-8" ref={contentRef}>

          {/* ═══════════════════════════════════════ */}
          {/* SECTION 1: ARCHITECTURE */}
          {/* ═══════════════════════════════════════ */}
          <section id="arquitectura" className="card p-6 md:p-8">
            <h2 className="text-xl font-black text-bio-primary mb-6 flex items-center gap-3">
              <BookOpen className="w-6 h-6" /> 1. Arquitectura General del Sistema
            </h2>

            <div id="diagrama-flujo" className="mb-8">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-bio-primary/10 rounded-lg flex items-center justify-center text-bio-primary text-xs font-bold">1.1</span>
                Diagrama de Flujo Completo
              </h3>

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Column 1: Public */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">🌐 Acceso Público</h4>
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-700">📝 Formulario de Reporte</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">/reportar</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-700">🔍 Seguimiento</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">/seguimiento</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-700">✍️ Resolución</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">/resolver/:id</p>
                    </div>
                  </div>
                  {/* Column 2: Admin */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">🛡️ Panel Administrativo</h4>
                    <div className="bg-bio-primary/5 rounded-xl p-3 border border-bio-primary/20 shadow-sm">
                      <p className="text-xs font-bold text-bio-primary">📊 Dashboard Calidad</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">/calidad</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-700">➕ Nuevo Hallazgo</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">/calidad/nuevo</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-700">👤 Mis Casos</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">/calidad/mis-casos</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-700">📈 Métricas</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">/metricas</p>
                    </div>
                  </div>
                  {/* Column 3: Modules */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">📦 Módulos Operativos</h4>
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-700">📦 Logística</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">/logistica</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-700">🚛 Flota</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">/flota</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-700">💰 Facturación</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">/facturacion</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="ciclo-vida" className="mb-8">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-bio-primary/10 rounded-lg flex items-center justify-center text-bio-primary text-xs font-bold">1.2</span>
                Ciclo de Vida del Hallazgo
              </h3>
              <StatusFlow />
              <div className="mt-4 bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs text-amber-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span><strong>Nota:</strong> En el estado "Verificación", el admin puede <strong>Aprobar</strong> (avanza a Efectividad) o <strong>Devolver</strong> (retrocede a Plan Correctivo).</span>
                </p>
              </div>
            </div>

            <div id="mapa-rutas">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-bio-primary/10 rounded-lg flex items-center justify-center text-bio-primary text-xs font-bold">1.3</span>
                Mapa de Rutas
              </h3>
              <DataTable
                headers={['Ruta', 'Tipo', 'Acceso', 'Descripción']}
                rows={[
                  ['/reportar', 'Pública', 'Todos', 'Formulario de reporte anónimo/identificado'],
                  ['/seguimiento', 'Pública', 'Todos', 'Consulta de estado por código'],
                  ['/resolver/:id', 'Pública', 'Link único', 'Resolución del responsable'],
                  ['/calidad', 'Privada', 'Admin', 'Dashboard principal de calidad'],
                  ['/calidad/nuevo', 'Privada', 'Admin', 'Crear nuevo hallazgo'],
                  ['/calidad/mis-casos', 'Privada', 'Responsable', 'Panel personal de casos'],
                  ['/metricas', 'Privada', 'Admin', 'Indicadores y reportes'],
                  ['/logistica', 'Privada', 'Admin', 'Gestión de pedidos'],
                  ['/flota', 'Privada', 'Admin', 'Monitoreo GPS vehicular'],
                  ['/facturacion', 'Privada', 'Admin', 'Liquidaciones y facturación'],
                  ['/manual', 'Privada', 'Admin', 'Este manual de procedimientos'],
                ]}
              />
            </div>
          </section>

          {/* ═══════════════════════════════════════ */}
          {/* SECTION 2: PROC 01 - REPORTE PÚBLICO */}
          {/* ═══════════════════════════════════════ */}
          <section id="proc-01" className="card p-6 md:p-8">
            <h2 className="text-xl font-black text-bio-primary mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6" /> 2. Reporte Público de Hallazgos
            </h2>

            <div id="proc01-objetivo" className="mb-6">
              <InfoCard icon={<Zap className="w-4 h-4 text-blue-500" />} title="Objetivo" color="blue">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Permitir que <strong>cualquier persona</strong> (identificada o anónima) reporte hallazgos de calidad al sistema de gestión, 
                  accediendo a <code className="bg-blue-100 px-1 rounded text-blue-700">/reportar</code> sin necesidad de autenticación.
                </p>
              </InfoCard>
            </div>

            <div id="proc01-flujo" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Flujo del Proceso</h3>
              <div className="space-y-4 bg-slate-50 rounded-xl p-5 border border-slate-100">
                <FlowStep number={1} icon={<ExternalLink className="w-4 h-4" />} title="Accede al formulario" description="El usuario navega a /reportar desde cualquier dispositivo." />
                <FlowStep number={2} icon={<Users className="w-4 h-4" />} title="Elige modo" description="Toggle entre Modo Identificado (nombre + WhatsApp obligatorio) o Modo Anónimo (datos opcionales)." />
                <FlowStep number={3} icon={<FileText className="w-4 h-4" />} title="Completa el formulario" description="Sector propio, sector destino, tipo de hallazgo, descripción detallada." />
                <FlowStep number={4} icon={<Mic className="w-4 h-4" />} title="Evidencia opcional" description="Puede subir fotos (múltiples) o grabar una nota de voz que se transcribe al textarea." />
                <FlowStep number={5} icon={<Send className="w-4 h-4" />} title="Envía el reporte" description="Se genera un código único BA-2026-XXXX y se muestra la pantalla de éxito." />
                <FlowStep number={6} icon={<Phone className="w-4 h-4" />} title="Confirmación WhatsApp" description="Si se identificó, recibe un WhatsApp con el código de seguimiento." arrow={false} />
              </div>
            </div>

            <div id="proc01-campos">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Campos del Formulario</h3>
              <DataTable
                headers={['Campo', 'Obligatorio', 'Descripción']}
                rows={[
                  ['Modo', 'Sí', 'Toggle Identificado / Anónimo'],
                  ['Sector Propio', 'Sí', 'Sector al que pertenece el reportante'],
                  ['Sector Destino', 'Sí', 'Sector al cual se dirige la observación'],
                  ['Tipo de Hallazgo', 'Sí', 'NC, OM, Reclamo, Evento Adverso, Observación'],
                  ['Descripción', 'Sí', 'Detalle completo del hallazgo'],
                  ['Nombre Completo', 'Solo identificado', 'Nombre del reportante'],
                  ['WhatsApp', 'Solo identificado', '10 dígitos (cód. área + número)'],
                  ['Fotos', 'No', 'Evidencia visual (múltiples, max 5MB c/u)'],
                  ['Nota de voz', 'No', 'Grabación transcrita al textarea'],
                ]}
              />
            </div>
          </section>

          {/* ═══════════════════════════════════════ */}
          {/* SECTION 3: PROC 02 - DASHBOARD */}
          {/* ═══════════════════════════════════════ */}
          <section id="proc-02" className="card p-6 md:p-8">
            <h2 className="text-xl font-black text-bio-primary mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6" /> 3. Dashboard de Calidad
            </h2>

            <div id="proc02-kpis" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">KPIs en Tiempo Real</h3>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: 'Total Activos', icon: '🛡️', color: 'bg-bio-primary/10 text-bio-primary' },
                  { label: 'Pendientes', icon: '⏳', color: 'bg-amber-100 text-amber-700' },
                  { label: 'En Proceso', icon: '🔄', color: 'bg-green-100 text-green-700' },
                  { label: 'Vencidos', icon: '⚠️', color: 'bg-red-100 text-red-700' },
                  { label: 'Cerrados', icon: '✅', color: 'bg-emerald-100 text-emerald-700' },
                ].map((kpi, i) => (
                  <div key={i} className={`rounded-xl p-3 text-center ${kpi.color}`}>
                    <p className="text-lg">{kpi.icon}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-1">{kpi.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2 italic">Estos indicadores se actualizan automáticamente con cada cambio de estado.</p>
            </div>

            <div id="proc02-filtros" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Filtros Disponibles</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InfoCard icon={<Search className="w-4 h-4 text-blue-500" />} title="Búsqueda de Texto" color="blue">
                  <p className="text-xs text-slate-500">Busca por ID, descripción, sector o nombre del reportante.</p>
                </InfoCard>
                <InfoCard icon={<Shield className="w-4 h-4 text-purple-500" />} title="Pestañas de Estado" color="purple">
                  <p className="text-xs text-slate-500">Todos, Pendientes, Acción Inmediata, Análisis, Plan Correctivo, Verificación, Efectividad, Cerrados.</p>
                </InfoCard>
                <InfoCard icon={<AlertTriangle className="w-4 h-4 text-amber-500" />} title="Filtro de Prioridad" color="amber">
                  <p className="text-xs text-slate-500">Alta (roja), Media (amarilla), Baja (verde).</p>
                </InfoCard>
                <InfoCard icon={<Truck className="w-4 h-4 text-green-500" />} title="Filtro de Sector" color="green">
                  <p className="text-xs text-slate-500">Filtra por cualquier sector del sistema Bio Asist.</p>
                </InfoCard>
              </div>
            </div>

            <div id="proc02-nuevo" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Registro Administrativo de Hallazgos</h3>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Desde <code className="bg-slate-100 px-1 rounded">/calidad/nuevo</code>, el administrador puede registrar hallazgos con datos extendidos 
                incluyendo origen, sede, sector y evidencia visual.
              </p>
              <DataTable
                headers={['Campo', 'Descripción']}
                rows={[
                  ['Origen', 'Auditoría interna, externa, detección espontánea, reclamo'],
                  ['Tipo', 'NC, OM, Reclamo Cliente, Evento Adverso'],
                  ['Sede', 'Hospital / Planta'],
                  ['Sector', 'Lavado, Esterilización, Distribución, etc.'],
                  ['Reportante', 'Nombre y sector del detector'],
                  ['Descripción', 'Detalle técnico completo'],
                  ['Evidencia', 'Fotos adjuntas (drag & drop)'],
                ]}
              />
            </div>

            <div id="proc02-detalle">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Modal de Detalle</h3>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Al hacer clic en un hallazgo se abre un modal con información completa:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'Badges de estado, prioridad, sede y sector',
                  'Descripción completa del hallazgo',
                  'Campos extendidos R GC 05/06/07/08',
                  'Barra de progreso del ciclo (7 etapas)',
                  'Responsables con estado de respuesta',
                  'Cards de etapas completadas',
                  'Historial de actividad (timeline)',
                  'Botones: Derivar, Validar, Exportar, Descartar',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════ */}
          {/* SECTION 4: PROC 03 - DERIVACIÓN */}
          {/* ═══════════════════════════════════════ */}
          <section id="proc-03" className="card p-6 md:p-8">
            <h2 className="text-xl font-black text-bio-primary mb-6 flex items-center gap-3">
              <Send className="w-6 h-6" /> 4. Derivación y Notificación WhatsApp
            </h2>

            <div id="proc03-flujo" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Secuencia de Derivación</h3>
              <div className="bg-green-50 rounded-xl p-5 border border-green-100 space-y-4">
                <FlowStep number={1} icon={<Eye className="w-4 h-4" />} title="Admin abre el hallazgo" description="Click en la fila del hallazgo en estado 'Pendiente'." />
                <FlowStep number={2} icon={<Users className="w-4 h-4" />} title="Click 'Derivar Hallazgo'" description="Se abre modal con lista de usuarios disponibles (no asignados)." />
                <FlowStep number={3} icon={<CheckCircle2 className="w-4 h-4" />} title="Selecciona responsable(s)" description="Checkboxes múltiples. Cada usuario muestra nombre y sector." />
                <FlowStep number={4} icon={<Send className="w-4 h-4" />} title="Confirma derivación" description="Estado cambia a 'Acción Inmediata'. Se registra en el historial." />
                <FlowStep number={5} icon={<Phone className="w-4 h-4" />} title="WhatsApp enviado" description="Toast verde con link de resolución copiable. Auto-cierre a los 8 segundos." arrow={false} />
              </div>
            </div>

            <div id="proc03-whatsapp" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Notificación WhatsApp</h3>
              <div className="bg-white rounded-xl border-2 border-green-200 p-4 max-w-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0 text-white text-lg">📱</div>
                  <div>
                    <p className="text-sm font-bold text-green-700">WhatsApp enviado</p>
                    <p className="text-xs text-slate-500 mt-0.5">Se envió un link de resolución a <strong>Juan Pérez</strong></p>
                    <div className="mt-2 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                      📋 Copiar link: /resolver/BA-2026-XXXX
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="proc03-link">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Link de Resolución</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Además del toast automático, desde el modal de detalle existe el botón <strong>"📱 Copiar Link Resolución"</strong> 
                que copia el URL al portapapeles en cualquier momento.
              </p>
              <div className="mt-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-mono text-bio-primary font-bold">https://bioasist.app/resolver/BA-2026-X9Y2</p>
                <p className="text-[10px] text-slate-400 mt-1">Formato: {'{dominio}'}/resolver/{'{tracking_id}'}</p>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════ */}
          {/* SECTION 5: PROC 04 - RESOLUCIÓN */}
          {/* ═══════════════════════════════════════ */}
          <section id="proc-04" className="card p-6 md:p-8">
            <h2 className="text-xl font-black text-bio-primary mb-6 flex items-center gap-3">
              <Users className="w-6 h-6" /> 5. Resolución del Responsable
            </h2>

            <div id="proc04-paso1" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Paso 1: Acción Inmediata</h3>
              <DataTable
                headers={['Campo', 'Obligatorio', 'Descripción']}
                rows={[
                  ['Acción Inmediata', 'Sí', 'Descripción de la acción tomada para contener el problema'],
                  ['Evidencia Visual', 'No', 'Fotos (múltiples, grid con eliminación individual)'],
                  ['Nota de Voz', 'No', 'Grabación con MediaRecorder API → transcripción'],
                ]}
              />
            </div>

            <div id="proc04-paso2" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Paso 2: Análisis Profundo</h3>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 mb-3">
                <p className="text-xs text-orange-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Este paso solo se muestra para: <strong>No Conformidad</strong>, <strong>Evento Adverso</strong> y <strong>Reclamo Formal</strong>.</span>
                </p>
              </div>
              <DataTable
                headers={['Campo', 'Obligatorio', 'Descripción']}
                rows={[
                  ['Método RCA', 'Sí', '5 Porqués, Ishikawa, Pareto, Lluvia de Ideas, Otro'],
                  ['Causa Raíz', 'Sí', 'Descripción de la causa raíz identificada'],
                  ['Plan Correctivo', 'Sí', 'Acciones correctivas a implementar'],
                  ['Fecha Compromiso', 'No', 'Fecha estimada de implementación'],
                ]}
              />
            </div>

            <div id="proc04-features">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Funcionalidades Adicionales</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <InfoCard icon={<Clock className="w-4 h-4 text-green-500" />} title="Auto-guardado" color="green">
                  <p className="text-xs text-slate-500">Borrador se guarda cada 5 segundos mientras se escribe.</p>
                </InfoCard>
                <InfoCard icon={<XCircle className="w-4 h-4 text-red-500" />} title="No me corresponde" color="red">
                  <p className="text-xs text-slate-500">Modal con textarea para motivo de rechazo de asignación.</p>
                </InfoCard>
                <InfoCard icon={<Clock className="w-4 h-4 text-purple-500" />} title="Timeline" color="purple">
                  <p className="text-xs text-slate-500">Historial cronológico de todos los eventos del caso.</p>
                </InfoCard>
                <InfoCard icon={<FileText className="w-4 h-4 text-blue-500" />} title="Descripción Readonly" color="blue">
                  <p className="text-xs text-slate-500">Muestra el hallazgo original sin posibilidad de modificación.</p>
                </InfoCard>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════ */}
          {/* SECTION 6: PROC 05 - VALIDACIÓN */}
          {/* ═══════════════════════════════════════ */}
          <section id="proc-05" className="card p-6 md:p-8">
            <h2 className="text-xl font-black text-bio-primary mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6" /> 6. Validación Administrativa
            </h2>

            <div id="proc05-flujo" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Flujo de Validación</h3>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-xs font-bold">📋 Verificación</div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                  <div className="space-y-2">
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Aprobar → Efectividad
                    </div>
                    <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Devolver → Plan Correctivo
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="proc05-acciones" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Acciones en Estado "Verificación"</h3>
              <DataTable
                headers={['Botón', 'Acción', 'Resultado']}
                rows={[
                  ['✅ Aprobar Resolución', 'Valida la gestión del responsable', 'Estado → Efectividad'],
                  ['↩️ Devolver con Observación', 'Abre modal de devolución', 'Estado → Plan Correctivo'],
                ]}
              />
            </div>

            <div id="proc05-devolver">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Modal de Devolución</h3>
              <div className="bg-orange-50 rounded-xl p-5 border border-orange-100 space-y-3">
                <p className="text-xs text-slate-600"><strong>1.</strong> Se abre un modal con un textarea para el motivo de devolución.</p>
                <p className="text-xs text-slate-600"><strong>2.</strong> Ejemplo: <em>"Falta evidencia fotográfica de la acción tomada."</em></p>
                <p className="text-xs text-slate-600"><strong>3.</strong> Al confirmar: estado retrocede, se registra en historial, responsables reseteados.</p>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════ */}
          {/* SECTION 7: PROC 06 - SEGUIMIENTO */}
          {/* ═══════════════════════════════════════ */}
          <section id="proc-06" className="card p-6 md:p-8">
            <h2 className="text-xl font-black text-bio-primary mb-6 flex items-center gap-3">
              <Search className="w-6 h-6" /> 7. Seguimiento Público
            </h2>

            <div id="proc06-busqueda" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Búsqueda por Código</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InfoCard icon={<Search className="w-4 h-4 text-blue-500" />} title="Modo Rápido (4 caracteres)" color="blue">
                  <p className="text-xs text-slate-500">Ingresa solo los últimos 4 caracteres del código. El prefijo BA-2026- se agrega automáticamente.</p>
                </InfoCard>
                <InfoCard icon={<FileText className="w-4 h-4 text-green-500" />} title="Modo Completo" color="green">
                  <p className="text-xs text-slate-500">Ingresa el código completo BA-2026-XXXX para búsquedas exactas.</p>
                </InfoCard>
              </div>
            </div>

            <div id="proc06-resultado">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Información del Resultado</h3>
              <DataTable
                headers={['Sección', 'Contenido']}
                rows={[
                  ['Encabezado', 'Código, sector, estado actual'],
                  ['Timeline Visual', '3 pasos: Recibido → En Análisis → Resuelto'],
                  ['Tu Reporte', 'Descripción original del hallazgo'],
                  ['Historial', 'Timeline expandible con cada evento'],
                  ['Responsables', 'Lista con badge ✅ Respondió / ⏳ Pendiente'],
                ]}
              />
            </div>
          </section>

          {/* ═══════════════════════════════════════ */}
          {/* SECTION 8: PROC 07 - EXPORTACIÓN */}
          {/* ═══════════════════════════════════════ */}
          <section id="proc-07" className="card p-6 md:p-8">
            <h2 className="text-xl font-black text-bio-primary mb-6 flex items-center gap-3">
              <Download className="w-6 h-6" /> 8. Exportación de Documentos
            </h2>

            <div id="proc07-tipos" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Tipos de Exportación</h3>
              <DataTable
                headers={['Documento', 'Formato', 'Contenido', 'Cuándo usar']}
                rows={[
                  ['Reporte PDF', 'PDF', 'KPIs + tabla de hallazgos', 'Reportes periódicos'],
                  ['Datos Excel', 'XLSX', 'Datos completos + resumen', 'Análisis detallado'],
                  ['R GC 05 — AC', 'PDF', 'Formulario Acción Correctiva', 'No Conformidades'],
                  ['R GC 06 — OM', 'PDF', 'Formulario Oportunidad de Mejora', 'Mejoras'],
                  ['R GC 07 — Seguimiento', 'PDF', 'Planilla seguimiento AC/OM', 'Auditorías'],
                  ['R GC 08 — Reclamos', 'PDF', 'Formulario gestión reclamos', 'Reclamos clientes'],
                ]}
              />
            </div>

            <div id="proc07-formularios">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Acceso a Formularios R GC</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <InfoCard icon={<Download className="w-4 h-4 text-red-500" />} title="Desde el Dashboard (masivo)" color="red">
                  <p className="text-xs text-slate-500">Botón "Exportar" en barra superior → PDF/Excel/Seguimiento con hallazgos filtrados.</p>
                </InfoCard>
                <InfoCard icon={<FileText className="w-4 h-4 text-blue-500" />} title="Desde el Detalle (individual)" color="blue">
                  <p className="text-xs text-slate-500">Modal del hallazgo → Botón dinámico "Formulario R GC XX" según tipo.</p>
                </InfoCard>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════ */}
          {/* SECTION 9: PROC 08 - TUTORIAL */}
          {/* ═══════════════════════════════════════ */}
          <section id="proc-08" className="card p-6 md:p-8">
            <h2 className="text-xl font-black text-bio-primary mb-6 flex items-center gap-3">
              <Lightbulb className="w-6 h-6" /> 9. Tutorial Interactivo
            </h2>

            <div id="proc08-uso" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Cómo Iniciar</h3>
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                  <li>Hacer clic en el botón <strong className="text-amber-700">💡 Tutorial</strong> en la barra superior.</li>
                  <li>El tutorial se adapta al módulo activo (Calidad, Logística, Flota, etc.).</li>
                  <li>Navegar con <strong>→</strong> para avanzar, <strong>←</strong> para retroceder, <strong>Escape</strong> para cerrar.</li>
                  <li>Los dots de progreso permiten saltar a cualquier paso.</li>
                </ol>
              </div>
            </div>

            <div id="proc08-modulos">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Pasos por Módulo</h3>
              <DataTable
                headers={['Módulo', 'Pasos', 'Temas']}
                rows={[
                  ['Calidad', '7', 'Dashboard, KPIs, Filtros, Crear, Derivar, Exportar, Ciclo'],
                  ['Mis Casos', '3', 'Panel personal, Estados, Responder'],
                  ['Logística', '3', 'Portal, Pedidos, Trazabilidad'],
                  ['Flota', '3', 'Monitoreo, Mapa, Telemetría'],
                  ['Facturación', '3', 'Liquidaciones, Estados, Reportes'],
                  ['Métricas', '3', 'Panel, Tendencias, Análisis sectorial'],
                ]}
              />
            </div>
          </section>

          {/* ═══════════════════════════════════════ */}
          {/* SECTION 10: MODULES */}
          {/* ═══════════════════════════════════════ */}
          <section id="modulos" className="card p-6 md:p-8">
            <h2 className="text-xl font-black text-bio-primary mb-6 flex items-center gap-3">
              <BarChart3 className="w-6 h-6" /> 10. Módulos Complementarios
            </h2>

            <div className="space-y-4">
              <div id="mod-miscasos">
                <InfoCard icon={<Users className="w-4 h-4 text-bio-primary" />} title="Mis Casos — Panel del Responsable" color="green">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Panel personal que muestra solo los hallazgos derivados al usuario actual. Incluye badge de estado, acceso directo al formulario de resolución 
                    y contador de pendientes vs respondidos. Ruta: <code className="bg-green-100 px-1 rounded">/calidad/mis-casos</code>
                  </p>
                </InfoCard>
              </div>
              <div id="mod-metricas">
                <InfoCard icon={<BarChart3 className="w-4 h-4 text-purple-500" />} title="Métricas de Calidad" color="purple">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Panel analítico con gráficos de tendencia mensual, distribución por sector/tipo/prioridad, tiempos promedio de resolución 
                    y comparativas entre períodos. Ruta: <code className="bg-purple-100 px-1 rounded">/metricas</code>
                  </p>
                </InfoCard>
              </div>
              <div id="mod-logistica">
                <InfoCard icon={<Truck className="w-4 h-4 text-blue-500" />} title="Portal de Logística" color="blue">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Gestión integral de pedidos y distribución de insumos médicos e industriales. 
                    Estado de pedidos, trazabilidad de materiales y fechas de entrega. Ruta: <code className="bg-blue-100 px-1 rounded">/logistica</code>
                  </p>
                </InfoCard>
              </div>
              <div id="mod-flota">
                <InfoCard icon={<Car className="w-4 h-4 text-amber-500" />} title="Gestión de Flota" color="amber">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Monitoreo GPS en tiempo real con mapa de San Juan, telemetría vehicular (velocidad, combustible, km), 
                    alertas de mantenimiento e historial de rutas. Ruta: <code className="bg-amber-100 px-1 rounded">/flota</code>
                  </p>
                </InfoCard>
              </div>
              <div id="mod-facturacion">
                <InfoCard icon={<Receipt className="w-4 h-4 text-orange-500" />} title="Facturación" color="orange">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Gestión de liquidaciones, estados de facturas por obra social, conciliación de pagos 
                    y reportes financieros exportables. Ruta: <code className="bg-orange-100 px-1 rounded">/facturacion</code>
                  </p>
                </InfoCard>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════ */}
          {/* SECTION 11: GLOSSARY */}
          {/* ═══════════════════════════════════════ */}
          <section id="glosario" className="card p-6 md:p-8">
            <h2 className="text-xl font-black text-bio-primary mb-6 flex items-center gap-3">
              <BookOpen className="w-6 h-6" /> 11. Glosario y Roles
            </h2>

            <div id="glos-terminos" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Glosario de Términos</h3>
              <DataTable
                headers={['Término', 'Definición']}
                rows={[
                  ['Hallazgo', 'Evidencia objetiva de una situación que no cumple requisitos o que puede mejorar'],
                  ['No Conformidad (NC)', 'Incumplimiento de un requisito establecido (ISO 9001:2015, §10.2)'],
                  ['Oportunidad de Mejora (OM)', 'Propuesta de cambio beneficioso (ISO 9001:2015, §10.3)'],
                  ['Acción Correctiva (AC)', 'Acción para eliminar la causa de una NC (ISO 9001:2015, §10.2.1)'],
                  ['Causa Raíz', 'Origen fundamental de la no conformidad'],
                  ['RCA', 'Root Cause Analysis — Análisis de Causa Raíz'],
                  ['R GC 05', 'Registro de Acciones Correctivas'],
                  ['R GC 06', 'Registro de Oportunidades de Mejora'],
                  ['R GC 07', 'Seguimiento de AC y OM'],
                  ['R GC 08', 'Gestión de Reclamos de Clientes'],
                  ['Tracking ID', 'Código único: BA-2026-XXXX'],
                  ['Derivación', 'Asignación de un hallazgo a responsable(s)'],
                  ['Verificación', 'Revisión de la resolución por Calidad'],
                  ['Efectividad', 'Comprobación de que la acción fue eficaz'],
                ]}
              />
            </div>

            <div id="glos-roles" className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Matriz de Roles y Permisos</h3>
              <DataTable
                headers={['Acción', 'Admin', 'Responsable', 'Público']}
                rows={[
                  ['Reportar hallazgo (público)', '✅', '✅', '✅'],
                  ['Crear hallazgo (admin)', '✅', '❌', '❌'],
                  ['Ver dashboard', '✅', '❌', '❌'],
                  ['Derivar hallazgo', '✅', '❌', '❌'],
                  ['Validar / Devolver', '✅', '❌', '❌'],
                  ['Descartar hallazgo', '✅', '❌', '❌'],
                  ['Exportar documentos', '✅', '❌', '❌'],
                  ['Resolver caso asignado', '❌', '✅', '❌'],
                  ['Ver "Mis Casos"', '✅', '✅', '❌'],
                  ['Consultar seguimiento', '✅', '✅', '✅'],
                  ['Rechazar asignación', '❌', '✅', '❌'],
                ]}
              />
            </div>

            <div id="glos-normas">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Referencias Normativas</h3>
              <DataTable
                headers={['Norma', 'Sección', 'Aplicación']}
                rows={[
                  ['ISO 9001:2015', '§8.7', 'Control de salidas no conformes'],
                  ['ISO 9001:2015', '§10.2', 'No conformidad y acción correctiva'],
                  ['ISO 9001:2015', '§10.2.1', 'Determinación de causa y acción'],
                  ['ISO 9001:2015', '§10.3', 'Mejora continua'],
                  ['ISO 9001:2015', '§9.1.3', 'Análisis y evaluación'],
                ]}
              />
            </div>
          </section>

          {/* Footer */}
          <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
            <p className="text-xs text-slate-400">
              Manual de Procedimientos — Bio Asist v1.0 — © 2026 Grow Labs
            </p>
            <p className="text-[10px] text-slate-300 mt-1">
              Documento generado como parte del Sistema de Gestión de Calidad ISO 9001:2015
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
