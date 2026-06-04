import { NavLink } from 'react-router-dom';
import {
  Shield,
  Truck,
  Car,
  Receipt,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Stethoscope,
} from 'lucide-react';
import { MOCK_FINDINGS } from '../../data/mockData';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  {
    label: 'Calidad',
    path: '/calidad',
    icon: Shield,
    badge: () => MOCK_FINDINGS.filter(f => f.status === 'pending' || f.status === 'immediate_action').length,
    description: 'ISO 9001',
  },
  {
    label: 'Logística',
    path: '/logistica',
    icon: Truck,
    badge: () => 0,
    description: 'Entregas',
  },
  {
    label: 'Flota',
    path: '/flota',
    icon: Car,
    badge: () => 0,
    description: 'Vehículos',
  },
  {
    label: 'Facturación',
    path: '/facturacion',
    icon: Receipt,
    badge: () => 0,
    description: 'Cobros',
  },
  {
    label: 'Métricas',
    path: '/metricas',
    icon: BarChart3,
    badge: () => 0,
    description: 'KPIs',
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-out overflow-hidden ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      style={{
        background: 'linear-gradient(180deg, #0B6B4F 0%, #0A5E46 30%, #08503C 70%, #064433 100%)',
      }}
    >
      {/* ── Gradient glow at top ── */}
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(52, 211, 153, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* ── Logo Section ── */}
      <div className="relative p-4 flex items-center gap-3 min-h-[72px] border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/10 border border-white/10 sidebar-logo-pulse">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <p className="font-display font-black text-white text-[15px] leading-tight tracking-tight">Bio Asist</p>
            <p className="text-[9px] text-emerald-300/70 font-semibold tracking-[0.2em] uppercase">Ecosistema Digital</p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar-dark relative z-10">
        {!collapsed && (
          <p className="text-[9px] font-bold text-emerald-300/40 uppercase tracking-[0.25em] px-3 mb-3">Módulos</p>
        )}

        {NAV_ITEMS.map((item) => {
          const badgeCount = item.badge();
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-green-active' : 'sidebar-link-green'
              }
              title={collapsed ? item.label : undefined}
            >
              <div className="relative">
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 animate-in fade-in duration-200">
                  <span className="block text-[13px] leading-tight">{item.label}</span>
                  <span className="block text-[9px] opacity-50 font-normal mt-0.5">{item.description}</span>
                </div>
              )}
              {badgeCount > 0 && (
                <span className={`${collapsed ? 'absolute -top-1 -right-1' : ''} min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1.5 shadow-lg shadow-red-500/30 animate-pulse`}>
                  {badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Divider with subtle ornament ── */}
      <div className="px-4 relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      {/* ── Quick actions (collapsed shows icons only) ── */}
      {!collapsed && (
        <div className="p-3 space-y-0.5 relative z-10">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 text-xs font-medium transition-all cursor-pointer">
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </button>
        </div>
      )}

      {/* ── User section ── */}
      <div className="p-3 border-t border-white/10 relative z-10">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 flex items-center justify-center text-xs font-black text-emerald-900 shadow-lg shadow-emerald-900/20">
                MG
              </div>
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#08503C]" />
            </div>
            <div className="min-w-0 flex-1 animate-in fade-in duration-200">
              <p className="text-[12px] font-bold text-white truncate">María García</p>
              <p className="text-[9px] text-emerald-300/60 font-semibold uppercase tracking-wider">Admin Calidad</p>
            </div>
            <button className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-all cursor-pointer" title="Cerrar sesión">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 flex items-center justify-center text-xs font-black text-emerald-900" title="María García">
                MG
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#08503C]" />
            </div>
          </div>
        )}
      </div>

      {/* ── Version tag ── */}
      {!collapsed && (
        <div className="px-5 pb-3 relative z-10">
          <p className="text-[8px] text-white/15 font-medium text-center tracking-wider">
            v1.0.0 • Grow Labs
          </p>
        </div>
      )}

      {/* ── Collapse toggle ── */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-400 hover:text-emerald-700 hover:border-emerald-300 hover:shadow-emerald-200/50 transition-all cursor-pointer z-50"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* ── Bottom gradient fade ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(6, 68, 51, 0.8) 0%, transparent 100%)',
        }}
      />
    </aside>
  );
}
