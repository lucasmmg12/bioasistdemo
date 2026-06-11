import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield,
  Truck,
  Car,
  Receipt,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
  Stethoscope,
  ChevronDown,
  LogOut,
  BookOpen,
  Home,
} from 'lucide-react';
import { MOCK_FINDINGS } from '../../data/mockData';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavChild {
  label: string;
  path: string;
}

const NAV_ITEMS = [
  {
    label: 'Calidad',
    path: '/calidad',
    icon: Shield,
    badge: () => MOCK_FINDINGS.filter(f => f.status === 'pending' || f.status === 'immediate_action').length,
    description: 'ISO 9001',
    children: [
      { label: 'Dashboard', path: '/calidad' },
      { label: 'Mis Casos', path: '/calidad/mis-casos' },
      { label: 'Nuevo Hallazgo', path: '/calidad/nuevo' },
      { label: 'Métricas', path: '/metricas' },
    ] as NavChild[],
  },
  {
    label: 'Logística',
    path: '/logistica',
    icon: Truck,
    badge: () => 3,
    description: 'Entregas',
    children: [] as NavChild[],
  },
  {
    label: 'Flota',
    path: '/flota',
    icon: Car,
    badge: () => 1,
    description: 'Vehículos',
    children: [] as NavChild[],
  },
  {
    label: 'Facturación',
    path: '/facturacion',
    icon: Receipt,
    badge: () => 0,
    description: 'Cobros',
    children: [] as NavChild[],
  },
  {
    label: 'Métricas',
    path: '/metricas',
    icon: BarChart3,
    badge: () => 0,
    description: 'KPIs',
    children: [] as NavChild[],
  },
  {
    label: 'Manual',
    path: '/manual',
    icon: BookOpen,
    badge: () => 0,
    description: 'Procedimientos',
    children: [] as NavChild[],
  },
];

// ── Smooth Accordion component ──
function AccordionContent({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(isOpen ? 'none' : '0px');

  useEffect(() => {
    if (!contentRef.current) return;
    if (isOpen) {
      const h = contentRef.current.scrollHeight;
      setMaxHeight(`${h}px`);
      const timer = setTimeout(() => setMaxHeight('none'), 350);
      return () => clearTimeout(timer);
    } else {
      const h = contentRef.current.scrollHeight;
      setMaxHeight(`${h}px`);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setMaxHeight('0px'));
      });
    }
  }, [isOpen]);

  return (
    <div
      ref={contentRef}
      className={`sidebar-accordion ${isOpen ? 'sidebar-accordion--open' : 'sidebar-accordion--closed'}`}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [modulesOpen, setModulesOpen] = useState(true);

  return (
    <aside
      className={`sidebar-adm ${collapsed ? 'sidebar-adm--collapsed' : ''}`}
    >
      {/* Animated video background */}
      <div className="sidebar-adm__video-bg">
        <video
          src="/nurse_medical_instruments.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* ── Logo Section ── */}
      <div className="sidebar-adm__brand">
        <div className="sidebar-adm__logo">
          <img
            src="/images (1).png"
            alt="Bio Asist"
            className="sidebar-adm__logo-img"
            style={{
              width: collapsed ? 32 : 38,
              height: collapsed ? 32 : 38,
              borderRadius: '8px',
              objectFit: 'contain',
            }}
          />
          {!collapsed && (
            <div className="sidebar-adm__brand-text animate-sidebar-fade-in">
              <span className="sidebar-adm__brand-name" style={{ display: 'flex' }}>
                {'Bio Asist'.split('').map((char, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      animation: 'sidebar-title-wave 3s ease-in-out infinite',
                      animationDelay: `${i * 0.08}s`,
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </span>
              <span className="sidebar-adm__brand-sub" style={{ display: 'flex' }}>
                {'Ecosistema Digital'.split('').map((char, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      animation: 'sidebar-title-wave 3s ease-in-out infinite',
                      animationDelay: `${(i + 9) * 0.08}s`,
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>
        <button
          className="sidebar-adm__toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-adm__nav">
        {/* Collapsible Modules group */}
        {/* Home link (collapsed) */}
        {collapsed ? (
          <>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `sidebar-adm__item ${isActive ? 'sidebar-adm__item--active' : ''}`
              }
              title="Inicio"
            >
              <Home size={20} className="sidebar-adm__item-icon" />
            </NavLink>
            {/* When collapsed, show icons only */}
            {NAV_ITEMS.map((item) => {
            const badgeCount = item.badge();
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-adm__item ${isActive ? 'sidebar-adm__item--active' : ''}`
                }
                title={item.label}
              >
                <item.icon size={20} className="sidebar-adm__item-icon" />
                {badgeCount > 0 && (
                  <span className="sidebar-adm__badge">{badgeCount}</span>
                )}
              </NavLink>
            );
          })}
          </>
        ) : (
          <div style={{ marginBottom: '4px' }}>
            {/* Home link */}
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `sidebar-adm__item ${isActive ? 'sidebar-adm__item--active' : ''}`
              }
              style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', fontSize: '0.85rem' }}
            >
              <Home size={20} className="sidebar-adm__item-icon" />
              <span>Inicio</span>
            </NavLink>

            <button
              onClick={() => setModulesOpen(prev => !prev)}
              className="sidebar-adm__group-btn"
              style={{
                background: modulesOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              }}
            >
              <Stethoscope size={20} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>Módulos</span>
              <ChevronDown
                size={14}
                style={{
                  transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: modulesOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                  opacity: 0.5,
                }}
              />
            </button>

            <AccordionContent isOpen={modulesOpen}>
              <div
                style={{
                  marginLeft: '20px',
                  borderLeft: '2px solid rgba(255, 255, 255, 0.2)',
                  paddingLeft: '0',
                  marginTop: '2px',
                }}
              >
                {NAV_ITEMS.map((item) => {
                  const badgeCount = item.badge();
                  const hasChildren = item.children && item.children.length > 0;
                  const locationPath = window.location.pathname;
                  const isModuleActive = locationPath.startsWith(item.path) || (hasChildren && item.children.some(c => locationPath === c.path));
                  return (
                    <div key={item.path}>
                      <NavLink
                        to={item.path}
                        end={hasChildren}
                        className={({ isActive }) =>
                          `sidebar-adm__item ${isActive || isModuleActive ? 'sidebar-adm__item--active' : ''}`
                        }
                        style={{ paddingLeft: '14px', fontSize: '0.8rem' }}
                      >
                        <item.icon size={17} className="sidebar-adm__item-icon" />
                        <span className="sidebar-adm__item-label">{item.label}</span>
                        {badgeCount > 0 && (
                          <span className="sidebar-adm__badge">{badgeCount}</span>
                        )}
                      </NavLink>
                      {/* Sub-items */}
                      {hasChildren && isModuleActive && (
                        <div
                          className="animate-sidebar-fade-in"
                          style={{
                            marginLeft: '24px',
                            borderLeft: '1px solid rgba(255,255,255,0.1)',
                            paddingLeft: '0',
                            marginBottom: '4px',
                          }}
                        >
                          {item.children.map((child) => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              end
                              className={({ isActive }) =>
                                `sidebar-adm__item ${isActive ? 'sidebar-adm__item--active' : ''}`
                              }
                              style={{ paddingLeft: '10px', fontSize: '0.72rem', padding: '6px 10px' }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: locationPath === child.path ? '#34D399' : 'rgba(255,255,255,0.3)', flexShrink: 0, transition: 'all 0.2s' }} />
                              <span className="sidebar-adm__item-label">{child.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </div>
        )}
      </nav>

      {/* ── Footer: Animated Bot Avatar ── */}
      <div
        className="sidebar-adm__footer"
        style={{
          padding: collapsed ? '12px 0' : '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* Bot Animated Avatar */}
        <div
          style={{
            position: 'relative',
            width: collapsed ? 44 : 64,
            height: collapsed ? 44 : 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Outer breathing glow */}
          <div
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(11,107,79,0.25) 0%, transparent 70%)',
              animation: 'sidebar-bot-breathe 3s ease-in-out infinite',
            }}
          />
          {/* Orbiting ring 1 */}
          <div
            style={{
              position: 'absolute',
              inset: -3,
              borderRadius: '50%',
              border: '1.5px solid rgba(52,211,153,0.35)',
              animation: 'sidebar-bot-orbit 8s linear infinite',
            }}
          />
          {/* Orbiting ring 2 (counter-rotate) */}
          <div
            style={{
              position: 'absolute',
              inset: -7,
              borderRadius: '50%',
              border: '1px dashed rgba(110,231,183,0.25)',
              animation: 'sidebar-bot-orbit-reverse 12s linear infinite',
            }}
          />
          {/* Pulsing dot on ring */}
          <div
            style={{
              position: 'absolute',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#34D399',
              boxShadow: '0 0 8px rgba(52,211,153,0.8)',
              top: -5,
              left: '50%',
              marginLeft: -3,
              animation: 'sidebar-bot-orbit 8s linear infinite',
              transformOrigin: `3px ${(collapsed ? 44 : 64) / 2 + 5}px`,
            }}
          />
          {/* Avatar video with glassmorphism border */}
          <div
            style={{
              width: collapsed ? 36 : 52,
              height: collapsed ? 36 : 52,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow:
                '0 0 20px rgba(11,107,79,0.4), 0 0 40px rgba(11,107,79,0.15), inset 0 0 10px rgba(255,255,255,0.1)',
              animation: 'sidebar-bot-float 4s ease-in-out infinite',
              position: 'relative',
              zIndex: 2,
              transition: 'all 0.3s ease',
            }}
          >
            <video
              src="/the_avatar_is_greetings_202606091123.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
              }}
            />
          </div>
          {/* Online indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: collapsed ? 0 : 2,
              right: collapsed ? 0 : 4,
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#10B981',
              border: '2px solid #08503C',
              zIndex: 3,
              animation: 'sidebar-bot-pulse-dot 2s ease-in-out infinite',
            }}
          />
        </div>

        {!collapsed && (
          <div className="animate-sidebar-fade-in" style={{ textAlign: 'center' }}>
            <p
              style={{
                margin: 0,
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.9)',
                letterSpacing: '0.5px',
              }}
            >
              BIO ASIST{' '}
              <span style={{ fontWeight: 400, opacity: 0.7 }}>IA</span>
            </p>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              Tu asistente personal
            </p>
          </div>
        )}

        {/* User section */}
        {!collapsed && (
          <div
            className="animate-sidebar-fade-in"
            style={{
              width: '100%',
              padding: '0 8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #34D399, #6EE7B7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: '#064E3B',
                  flexShrink: 0,
                }}
              >
                MG
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#fff',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  María García
                </p>
                <p
                  style={{
                    fontSize: '0.58rem',
                    color: 'rgba(52,211,153,0.6)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    margin: 0,
                  }}
                >
                  Admin Calidad
                </p>
              </div>
              <button
                style={{
                  padding: '4px',
                  borderRadius: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                title="Cerrar sesión"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}

        {!collapsed && (
          <div
            className="animate-sidebar-fade-in"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '8px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '0.58rem', margin: 0, opacity: 0.4, color: '#fff' }}>
              BIO-ASIST v1.0
            </p>
            <p style={{ fontSize: '0.52rem', margin: '1px 0 0', opacity: 0.3, color: '#fff' }}>
              Grow Labs
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
