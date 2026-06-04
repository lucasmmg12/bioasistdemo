import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { MockAuthProvider } from './contexts/MockAuthContext';
import { Sidebar } from './components/ui/Sidebar';
import { TopBar } from './components/ui/TopBar';
import { QualityDashboard } from './components/calidad/QualityDashboard';
import { FindingForm } from './components/calidad/FindingForm';
import { QualityMetrics } from './components/calidad/QualityMetrics';
import { OrdersPortal } from './components/logistica/OrdersPortal';
import { FleetDashboard } from './components/flota/FleetDashboard';
import { BillingPreview } from './components/facturacion/BillingPreview';
import { AssistantBot } from './components/ui/AssistantBot';

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bio-neutral">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile as overlay */}
      <div className={`hidden md:block`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden fixed z-40">
          <Sidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'
        }`}
      >
        <TopBar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/calidad" replace />} />

            {/* Calidad */}
            <Route path="/calidad" element={<QualityDashboard />} />
            <Route path="/calidad/nuevo" element={<FindingForm />} />

            {/* Logística */}
            <Route path="/logistica" element={<OrdersPortal />} />

            {/* Flota */}
            <Route path="/flota" element={<FleetDashboard />} />

            {/* Facturación */}
            <Route path="/facturacion" element={<BillingPreview />} />

            {/* Métricas */}
            <Route path="/metricas" element={<QualityMetrics />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/calidad" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/60 bg-white/30 backdrop-blur-md mt-12">
          <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
            <p>© {new Date().getFullYear()} Bio Asist — Ecosistema Digital de Gestión</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-bio-secondary animate-pulse" />
              <span>Desarrollado por <strong className="text-bio-primary">Grow Labs</strong></span>
            </div>
          </div>
        </footer>
      </div>

      {/* Assistant Bot */}
      <AssistantBot />
    </div>
  );
}

function App() {
  return (
    <Router>
      <MockAuthProvider>
        <AppLayout />
      </MockAuthProvider>
    </Router>
  );
}

export default App;
