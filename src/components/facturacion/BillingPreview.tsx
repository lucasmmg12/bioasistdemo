import { useState } from 'react';
import {
  DollarSign, CheckCircle2, Clock, FileText,
  Zap, TrendingUp, ArrowRight, Sparkles, AlertTriangle
} from 'lucide-react';
import { MOCK_BILLING } from '../../data/mockData';
import { KpiCard } from '../ui/KpiCard';

export function BillingPreview() {
  const [items] = useState(MOCK_BILLING);
  const [isAutomating, setIsAutomating] = useState(false);
  const [automationDone, setAutomationDone] = useState(false);

  const pendiente = items.filter(i => i.status === 'pendiente');
  const facturado = items.filter(i => i.status === 'facturado');
  const cobrado = items.filter(i => i.status === 'cobrado');
  const totalPendiente = pendiente.reduce((s, i) => s + i.total, 0);
  const totalFacturado = facturado.reduce((s, i) => s + i.total, 0);
  const totalCobrado = cobrado.reduce((s, i) => s + i.total, 0);

  const handleAutomate = async () => {
    setIsAutomating(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAutomating(false);
    setAutomationDone(true);
    setTimeout(() => setAutomationDone(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-bio-primary">
            Facturación
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Gestión y automatización del proceso de facturación mensual
          </p>
        </div>
        <button
          onClick={handleAutomate}
          disabled={isAutomating}
          className={`btn-accent ${isAutomating ? 'opacity-60' : ''}`}
        >
          {isAutomating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Procesando...
            </>
          ) : automationDone ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              ¡Facturación Generada!
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Generar Facturación Automática
            </>
          )}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Pendiente Facturar" value={`$${totalPendiente.toLocaleString('es-AR')}`} icon={<Clock className="w-5 h-5" />} color="warning" delay={0} />
        <KpiCard label="Facturado" value={`$${totalFacturado.toLocaleString('es-AR')}`} icon={<FileText className="w-5 h-5" />} color="primary" delay={75} />
        <KpiCard label="Cobrado" value={`$${totalCobrado.toLocaleString('es-AR')}`} icon={<DollarSign className="w-5 h-5" />} color="success" delay={150} />
        <KpiCard label="Total Mes" value={`$${(totalPendiente + totalFacturado + totalCobrado).toLocaleString('es-AR')}`} icon={<TrendingUp className="w-5 h-5" />} color="secondary" delay={225} />
      </div>

      {/* Automation flow */}
      <div className="card p-5 bg-gradient-to-r from-bio-primary/5 to-bio-secondary/5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-bio-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-bio-primary" />
          </div>
          <div>
            <p className="font-bold text-slate-700 text-sm">Flujo de Automatización con IA</p>
            <p className="text-[10px] text-slate-400">Reemplaza el proceso manual de Excel → Planilla → Sistema Tiempo</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['Excel Trazabilidad', 'Procesamiento IA', 'Validación Automática', 'Carga en Tiempo', 'Factura Emitida'].map((step, i) => (
            <div key={step} className="flex items-center">
              <div className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all ${
                i <= 1 ? 'bg-bio-primary text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'
              }`}>
                {step}
              </div>
              {i < 4 && <ArrowRight className="w-4 h-4 text-slate-300 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-700">Detalle de Servicios del Mes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Servicio</th>
                <th className="text-center py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cant.</th>
                <th className="text-right py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precio Unit.</th>
                <th className="text-right py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</th>
                <th className="text-center py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                <th className="text-center py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">N° Factura</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-700">{item.client_name}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">{item.service_description}</td>
                  <td className="py-3 px-4 text-center text-slate-600 font-medium">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-slate-600">${item.unit_price.toLocaleString('es-AR')}</td>
                  <td className="py-3 px-4 text-right font-bold text-bio-primary">${item.total.toLocaleString('es-AR')}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${
                      item.status === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                      item.status === 'facturado' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.status === 'pendiente' ? 'Pendiente' : item.status === 'facturado' ? 'Facturado' : 'Cobrado'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-slate-500 font-mono">
                    {item.invoice_number || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/80">
                <td colSpan={4} className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total General</td>
                <td className="py-3 px-4 text-right font-display font-black text-bio-primary text-base">
                  ${items.reduce((s, i) => s + i.total, 0).toLocaleString('es-AR')}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Sistema Tiempo integration hint */}
      <div className="card p-5 border-amber-200 bg-amber-50/30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-amber-800 text-sm">Integración con Sistema "Tiempo"</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Se evaluará la disponibilidad de APIs del sistema contable para inyección automática de datos de facturación, eliminando la carga manual uno a uno.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
