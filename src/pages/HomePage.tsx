import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Truck, Car, Receipt, BarChart3, BookOpen,
  TrendingUp, Clock, AlertTriangle, CheckCircle2,
  FileText, Users, Zap, ArrowRight, Activity,
} from 'lucide-react';
import { useFindings } from '../contexts/FindingsContext';
import { useAuth } from '../contexts/MockAuthContext';

// ── Animated counter ──
function AnimatedCount({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{count}</>;
}

// ── Live clock ──
function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="text-right">
      <p className="text-3xl font-mono font-black text-white tracking-wider drop-shadow-lg">{timeStr}</p>
      <p className="text-sm text-white/70 capitalize font-medium">{dateStr}</p>
    </div>
  );
}

// ── Greeting ──
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

// ── Module cards ──
const MODULES = [
  { path: '/calidad', icon: Shield, label: 'Gestión de Calidad', desc: 'Hallazgos, NC, OM y auditorías', color: 'from-emerald-500 to-teal-600', badge: 'Core' },
  { path: '/logistica', icon: Truck, label: 'Logística', desc: 'Pedidos, retiros y entregas', color: 'from-blue-500 to-indigo-600', badge: null },
  { path: '/flota', icon: Car, label: 'Gestión de Flota', desc: 'GPS, combustible y service', color: 'from-violet-500 to-purple-600', badge: null },
  { path: '/facturacion', icon: Receipt, label: 'Facturación', desc: 'Liquidaciones y cobros', color: 'from-amber-500 to-orange-600', badge: null },
  { path: '/metricas', icon: BarChart3, label: 'Métricas', desc: 'KPIs y reportes analíticos', color: 'from-pink-500 to-rose-600', badge: null },
  { path: '/manual', icon: BookOpen, label: 'Manual', desc: 'Procedimientos y protocolos', color: 'from-cyan-500 to-sky-600', badge: 'Nuevo' },
];

export function HomePage() {
  const { findings } = useFindings();
  const { user } = useAuth();

  const stats = useMemo(() => {
    const active = findings.filter(f => f.status !== 'discarded');
    const pending = active.filter(f => f.status === 'pending').length;
    const inProgress = active.filter(f => !['pending', 'closed', 'discarded'].includes(f.status)).length;
    const closed = active.filter(f => f.status === 'closed').length;
    const overdue = active.filter(f => {
      if (f.status === 'closed') return false;
      const deadline = f.status === 'immediate_action' ? f.deadline_immediate : f.deadline_analysis;
      return deadline && new Date(deadline) < new Date();
    }).length;
    return { total: active.length, pending, inProgress, closed, overdue };
  }, [findings]);

  // Recent activity from findings notes
  const recentActivity = useMemo(() => {
    return findings
      .filter(f => f.notes)
      .flatMap(f => {
        const entries = f.notes.split('\n\n').filter(n => n.trim());
        return entries.map(entry => {
          const match = entry.match(/^\[([^\]]+)\]\s?(.*)/);
          return {
            id: f.id,
            trackingId: f.tracking_id,
            date: match ? match[1] : '',
            message: match ? match[2] : entry,
            type: entry.includes('DERIVADO') ? 'derivation' : entry.includes('RESOLUCIÓN') ? 'resolution' : entry.includes('REPORTE') ? 'report' : 'info',
          };
        });
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [findings]);

  return (
    <div className="space-y-6">
      {/* ═══ HERO SECTION ═══ */}
      <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: '200px' }}>
        <video
          src="/nurse_medical_instruments.mp4"
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bio-primary/90 via-bio-primary/70 to-transparent" />
        <div className="relative p-6 md:p-8 flex items-center justify-between">
          <div className="text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <Activity className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                Ecosistema Digital
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-1 text-white">
              {getGreeting()}, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-white/80 font-medium text-base">
              Panel de control del sistema Bio Asist
            </p>
          </div>
          <LiveClock />
        </div>
      </div>

      {/* ═══ KPIs ANIMADOS ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Activos', value: stats.total, icon: <Shield className="w-5 h-5" />, color: 'bg-bio-primary/10 text-bio-primary', ring: 'ring-bio-primary/20' },
          { label: 'Pendientes', value: stats.pending, icon: <Clock className="w-5 h-5" />, color: 'bg-amber-100 text-amber-700', ring: 'ring-amber-200' },
          { label: 'En Proceso', value: stats.inProgress, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-blue-100 text-blue-700', ring: 'ring-blue-200' },
          { label: 'Cerrados', value: stats.closed, icon: <CheckCircle2 className="w-5 h-5" />, color: 'bg-green-100 text-green-700', ring: 'ring-green-200' },
          { label: 'Vencidos', value: stats.overdue, icon: <AlertTriangle className="w-5 h-5" />, color: 'bg-red-100 text-red-700', ring: 'ring-red-200' },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className={`card p-4 flex items-center gap-3 ring-1 ${kpi.ring} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-4`}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center shrink-0`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">
                <AnimatedCount target={kpi.value} />
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ MODULES GRID + ACTIVITY ═══ */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Modules */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Acceso Rápido
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODULES.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.path}
                  to={mod.path}
                  className="group card p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 60 + 200}ms` }}
                >
                  {/* Gradient accent */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {mod.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${mod.badge === 'Core' ? 'bg-bio-primary/10 text-bio-primary' : 'bg-amber-100 text-amber-700'}`}>
                          {mod.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-bio-primary transition-colors">{mod.label}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{mod.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-bio-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Abrir <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Actividad Reciente
          </h2>
          <div className="card p-4 space-y-0 max-h-[420px] overflow-y-auto custom-scrollbar">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Sin actividad reciente</p>
              </div>
            ) : (
              <div className="relative pl-4">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100" />
                {recentActivity.map((event, idx) => (
                  <Link
                    key={`${event.id}-${idx}`}
                    to="/calidad"
                    className="flex gap-3 pb-4 last:pb-0 group animate-in fade-in slide-in-from-left-2"
                    style={{ animationDelay: `${idx * 50 + 400}ms` }}
                  >
                    <div className={`w-3 h-3 rounded-full shrink-0 mt-1.5 z-10 border-2 border-white shadow-sm ${
                      event.type === 'derivation' ? 'bg-blue-400' :
                      event.type === 'resolution' ? 'bg-green-400' :
                      event.type === 'report' ? 'bg-amber-400' :
                      'bg-slate-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 group-hover:text-bio-primary transition-colors">
                        {event.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-300 font-mono">{event.trackingId}</span>
                        {event.date && (
                          <span className="text-[9px] text-slate-300">{event.date}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 space-y-2">
            <Link to="/calidad/nuevo" className="flex items-center gap-3 p-3 bg-bio-primary/5 rounded-xl border border-bio-primary/10 hover:bg-bio-primary/10 transition-all group">
              <div className="w-8 h-8 bg-bio-primary rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-bio-primary">Nuevo Hallazgo</p>
                <p className="text-[10px] text-slate-400">Registrar NC, OM o reclamo</p>
              </div>
            </Link>
            <Link to="/reportar" className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100 hover:bg-amber-100/50 transition-all group">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-700">Formulario Público</p>
                <p className="text-[10px] text-slate-400">Reportar hallazgo externo</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
