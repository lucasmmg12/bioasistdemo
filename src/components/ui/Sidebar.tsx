import { NavLink } from 'react-router-dom';
import {
  Shield,
  Truck,
  Car,
  Receipt,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Activity,
  Users,
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
  },
  {
    label: 'Logística',
    path: '/logistica',
    icon: Truck,
    badge: () => 0,
  },
  {
    label: 'Flota',
    path: '/flota',
    icon: Car,
    badge: () => 0,
  },
  {
    label: 'Facturación',
    path: '/facturacion',
    icon: Receipt,
    badge: () => 0,
  },
  {
    label: 'Métricas',
    path: '/metricas',
    icon: BarChart3,
    badge: () => 0,
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200/60 z-40 flex flex-col transition-all duration-300 ease-out ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3 min-h-[65px]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bio-primary to-bio-secondary flex items-center justify-center flex-shrink-0 shadow-lg shadow-bio-primary/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <p className="font-display font-black text-bio-primary text-sm leading-tight">Bio Asist</p>
            <p className="text-[9px] text-slate-400 font-medium tracking-wider uppercase">Ecosistema Digital</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] px-3 mb-3">Módulos</p>
        )}

        {NAV_ITEMS.map((item) => {
          const badgeCount = item.badge();
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'sidebar-link-active' : 'sidebar-link'
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="flex-1 animate-in fade-in duration-200">{item.label}</span>
              )}
              {badgeCount > 0 && (
                <span className={`${collapsed ? 'absolute top-0 right-0' : ''} min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1`}>
                  {badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-slate-100">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-bio-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-bio-primary" />
            </div>
            <div className="min-w-0 animate-in fade-in duration-200">
              <p className="text-xs font-bold text-slate-700 truncate">María García</p>
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Admin Calidad</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-bio-primary/10 flex items-center justify-center" title="María García">
              <Users className="w-4 h-4 text-bio-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-bio-primary hover:border-bio-primary/30 transition-all cursor-pointer z-50"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
