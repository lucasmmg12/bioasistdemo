import { Bell, Search, ChevronRight, Menu, Sun, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { TutorialButton } from './TutorialSystem';

interface TopBarProps {
  onMobileMenuToggle: () => void;
}

const BREADCRUMB_MAP: Record<string, string> = {
  '/calidad': 'Gestión de Calidad',
  '/calidad/nuevo': 'Nuevo Hallazgo',
  '/calidad/mis-casos': 'Mis Casos',
  '/logistica': 'Logística',
  '/flota': 'Gestión de Flota',
  '/facturacion': 'Facturación',
  '/metricas': 'Métricas & Reportes',
  '/manual': 'Manual de Procedimientos',
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
  const [darkMode, setDarkMode] = useState(false);

  const currentPath = location.pathname;
  const pageTitle = BREADCRUMB_MAP[currentPath] || 'Dashboard';
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;

  const titleText = 'Bio Asist';
  const subtitleText = 'Ecosistema Digital';

  return (
    <header className="topbar-adm">
      {/* Background video */}
      <div className="topbar-adm__video-bg">
        <video
          src="/Blue_drop_moving_left_right_202606091400.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuToggle}
        className="topbar-adm__mobile-menu"
      >
        <Menu size={18} />
      </button>

      {/* Left: Animated title + breadcrumb */}
      <div className="topbar-adm__left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <h1 className="topbar-adm__title topbar-adm__title--wave">
            {titleText.split('').map((char, i) => (
              <span
                key={`t-${i}`}
                className="topbar-adm__wave-letter topbar-adm__title-accent"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
            <span className="topbar-adm__wave-letter" style={{ animationDelay: `${titleText.length * 0.08}s` }}>
              &nbsp;
            </span>
            {subtitleText.split('').map((char, i) => (
              <span
                key={`s-${i}`}
                className="topbar-adm__wave-letter"
                style={{ animationDelay: `${(titleText.length + 1 + i) * 0.08}s` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
          {currentPath !== '/' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 }}>
              <ChevronRight size={14} />
              <span style={{ color: '#0B6B4F', fontWeight: 600 }}>{pageTitle}</span>
            </span>
          )}
        </div>
        <span className="topbar-adm__subtitle">Sistema de gestión integral</span>
      </div>

      {/* Right section */}
      <div className="topbar-adm__right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Search (desktop only) */}
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

        {/* Tutorial Button */}
        <TutorialButton />

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(d => !d)}
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: darkMode ? '#1E293B' : '#F8FAFC',
            border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: darkMode ? '#FBBF24' : '#94A3B8',
            transition: 'all 0.2s',
          }}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

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

        {/* Date badge */}
        <span className="topbar-adm__date">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>

        {/* Role badge (desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Admin</span>
        </div>
      </div>
    </header>
  );
}
