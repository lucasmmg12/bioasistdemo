import { Bell, Search, ChevronRight, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';

interface TopBarProps {
  onMobileMenuToggle: () => void;
}

const BREADCRUMB_MAP: Record<string, string> = {
  '/calidad': 'Gestión de Calidad',
  '/calidad/nuevo': 'Nuevo Hallazgo',
  '/logistica': 'Logística',
  '/flota': 'Gestión de Flota',
  '/facturacion': 'Facturación',
  '/metricas': 'Métricas & Reportes',
};

const MOCK_NOTIFICATIONS = [
  { id: 1, text: '⏳ El hallazgo BA-2026-O5P6 vence hoy', time: 'Hace 2 horas', unread: true },
  { id: 2, text: '✅ Ana Fernández respondió al caso BA-2026-I9J0', time: 'Hace 3 horas', unread: true },
  { id: 3, text: '📋 Nuevo hallazgo de auditoría externa registrado', time: 'Hoy 09:30', unread: false },
  { id: 4, text: '🔔 Recordatorio: 2 hallazgos próximos a vencer', time: 'Ayer 09:00', unread: false },
];

export function TopBar({ onMobileMenuToggle }: TopBarProps) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const currentPath = location.pathname;
  const pageTitle = BREADCRUMB_MAP[currentPath] || 'Dashboard';
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="flex items-center justify-between px-4 md:px-6 h-[65px]">
        {/* Left: Mobile menu + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5 text-slate-500" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-medium hidden sm:block">Bio Asist</span>
            <ChevronRight className="w-3 h-3 text-slate-300 hidden sm:block" />
            <span className="font-bold text-bio-primary">{pageTitle}</span>
          </div>
        </div>

        {/* Right: Search + Notifications */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className={`hidden md:flex items-center transition-all duration-300 ${searchFocused ? 'w-64' : 'w-48'}`}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar hallazgo..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-bio-primary/30 focus:ring-2 focus:ring-bio-primary/10 outline-none transition-all"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5 text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/60 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h4 className="font-display font-bold text-sm text-bio-primary">Notificaciones</h4>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {MOCK_NOTIFICATIONS.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${notif.unread ? 'bg-bio-primary/3' : ''}`}
                      >
                        <p className="text-sm text-slate-700 leading-snug">{notif.text}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-slate-50 text-center">
                    <button className="text-xs font-bold text-bio-primary hover:underline cursor-pointer">
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Role badge (desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200">
            <span className="text-[10px] font-bold uppercase tracking-widest">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
