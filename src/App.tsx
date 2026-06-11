import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { MockAuthProvider } from './contexts/MockAuthContext';
import { FindingsProvider } from './contexts/FindingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/ui/Sidebar';
import { TopBar } from './components/ui/TopBar';
import { QualityDashboard } from './components/calidad/QualityDashboard';
import { FindingForm } from './components/calidad/FindingForm';
import { QualityMetrics } from './components/calidad/QualityMetrics';
import { MyCases } from './components/calidad/MyCases';
import { OrdersPortal } from './components/logistica/OrdersPortal';
import { FleetDashboard } from './components/flota/FleetDashboard';
import { BillingPreview } from './components/facturacion/BillingPreview';
import { AssistantBot } from './components/ui/AssistantBot';
import { PublicReportForm } from './pages/PublicReportForm';
import { PublicTrackingPage } from './pages/PublicTrackingPage';
import { ResolutionPage } from './pages/ResolutionPage';
import { ProceduresManual } from './pages/ProceduresManual';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { TutorialProvider } from './components/ui/TutorialSystem';

function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <TutorialProvider>
    <div className="min-h-screen bg-bio-neutral dark:bg-slate-900 transition-colors duration-300">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile as overlay */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      {mobileMenuOpen && (
        <div className="md:hidden fixed z-40">
          <Sidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div
        className="transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? '72px' : '260px',
        }}
      >
        <TopBar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Home */}
            <Route path="/home" element={<HomePage />} />

            {/* Calidad */}
            <Route path="/calidad" element={<QualityDashboard />} />
            <Route path="/calidad/nuevo" element={<FindingForm />} />
            <Route path="/calidad/mis-casos" element={<MyCases />} />

            {/* Logística */}
            <Route path="/logistica" element={<OrdersPortal />} />

            {/* Flota */}
            <Route path="/flota" element={<FleetDashboard />} />

            {/* Facturación */}
            <Route path="/facturacion" element={<BillingPreview />} />

            {/* Métricas */}
            <Route path="/metricas" element={<QualityMetrics />} />

            {/* Manual de Procedimientos */}
            <Route path="/manual" element={<ProceduresManual />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/60 dark:border-slate-700/60 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md mt-12 transition-colors duration-300">
          <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
            <p>© {new Date().getFullYear()} Bio Asist — Ecosistema Digital de Gestión</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-bio-secondary animate-pulse" />
              <span>Desarrollado por <strong className="text-bio-primary dark:text-bio-secondary">Grow Labs</strong></span>
            </div>
          </div>
        </footer>
      </div>

      {/* Assistant Bot */}
      <AssistantBot />
    </div>
    </TutorialProvider>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('bio-auth') === 'true';
  });

  const handleLogin = () => {
    sessionStorage.setItem('bio-auth', 'true');
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <ThemeProvider>
        <MockAuthProvider>
          <FindingsProvider>
            <Routes>
              {/* Login */}
              <Route
                path="/login"
                element={
                  isAuthenticated
                    ? <Navigate to="/home" replace />
                    : <LoginPage onLogin={handleLogin} />
                }
              />

              {/* Public pages — full screen, no sidebar */}
              <Route path="/reportar" element={<PublicReportForm />} />
              <Route path="/seguimiento" element={<PublicTrackingPage />} />
              <Route path="/resolver/:trackingId" element={<ResolutionPage />} />

              {/* Dashboard — with sidebar layout (auth required) */}
              <Route
                path="/*"
                element={
                  isAuthenticated
                    ? <DashboardLayout />
                    : <Navigate to="/login" replace />
                }
              />
            </Routes>
          </FindingsProvider>
        </MockAuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
