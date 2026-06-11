import { useState, useMemo } from 'react';
import {
  Receipt, DollarSign, Clock, CheckCircle2, FileText,
  TrendingUp, ChevronRight, Building2, Calendar, Filter,
  AlertTriangle, CreditCard, Banknote
} from 'lucide-react';
import { MOCK_BILLING } from '../../data/mockData';
import { KpiCard } from '../ui/KpiCard';
import { Modal } from '../ui/Modal';
import type { BillingItem } from '../../types';

type BillingFilter = 'all' | 'pendiente' | 'facturado' | 'cobrado';

export function BillingPreview() {
  const [billing] = useState(MOCK_BILLING);
  const [filter, setFilter] = useState<BillingFilter>('all');
  const [selectedItem, setSelectedItem] = useState<BillingItem | null>(null);

  // KPIs
  const kpis = useMemo(() => {
    const pendiente = billing.filter(b => b.status === 'pendiente');
    const facturado = billing.filter(b => b.status === 'facturado');
    const cobrado = billing.filter(b => b.status === 'cobrado');
    return {
      totalPendiente: pendiente.reduce((s, b) => s + b.total, 0),
      totalFacturado: facturado.reduce((s, b) => s + b.total, 0),
      totalCobrado: cobrado.reduce((s, b) => s + b.total, 0),
      countPendiente: pendiente.length,
      countFacturado: facturado.length,
      countCobrado: cobrado.length,
      total: billing.reduce((s, b) => s + b.total, 0),
    };
  }, [billing]);

  // Filtered items
  const filteredBilling = useMemo(() => {
    let result = [...billing];
    if (filter !== 'all') result = result.filter(b => b.status === filter);
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [billing, filter]);

  // Group by client
  const clientSummary = useMemo(() => {
    const groups: Record<string, { total: number; pendiente: number; cobrado: number; count: number }> = {};
    billing.forEach(b => {
      if (!groups[b.client_name]) groups[b.client_name] = { total: 0, pendiente: 0, cobrado: 0, count: 0 };
      groups[b.client_name].total += b.total;
      groups[b.client_name].count++;
      if (b.status === 'pendiente' || b.status === 'facturado') groups[b.client_name].pendiente += b.total;
      if (b.status === 'cobrado') groups[b.client_name].cobrado += b.total;
    });
    return Object.entries(groups).sort((a, b) => b[1].total - a[1].total);
  }, [billing]);

  const STATUS_MAP = {
    pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente', icon: Clock },
    facturado: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Facturado', icon: FileText },
    cobrado: { bg: 'bg-green-100', text: 'text-green-700', label: 'Cobrado', icon: CheckCircle2 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-black text-bio-primary">
          Facturación & Cobros
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-1">
          Control de servicios prestados, facturación y gestión de cobros
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Facturado" value={`$${(kpis.total / 1000).toFixed(0)}K`} icon={<TrendingUp className="w-5 h-5" />} color="primary" delay={0} />
        <KpiCard label="Pendiente Cobro" value={`$${((kpis.totalPendiente + kpis.totalFacturado) / 1000).toFixed(0)}K`} icon={<AlertTriangle className="w-5 h-5" />} color="warning" delay={75} />
        <KpiCard label="Cobrado" value={`$${(kpis.totalCobrado / 1000).toFixed(0)}K`} icon={<Banknote className="w-5 h-5" />} color="success" delay={150} />
        <KpiCard label="Servicios Registrados" value={billing.length} icon={<Receipt className="w-5 h-5" />} color="secondary" delay={225} />
      </div>

      {/* Summary cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sin Facturar</p>
              <p className="text-xl font-display font-black text-amber-600">
                ${kpis.totalPendiente.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">{kpis.countPendiente} servicio{kpis.countPendiente !== 1 ? 's' : ''} pendiente{kpis.countPendiente !== 1 ? 's' : ''} de facturar</p>
        </div>

        <div className="card p-5 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-75">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Facturado sin Cobrar</p>
              <p className="text-xl font-display font-black text-blue-600">
                ${kpis.totalFacturado.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">{kpis.countFacturado} factura{kpis.countFacturado !== 1 ? 's' : ''} emitida{kpis.countFacturado !== 1 ? 's' : ''} pendiente{kpis.countFacturado !== 1 ? 's' : ''} de cobro</p>
        </div>

        <div className="card p-5 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-150">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cobrado</p>
              <p className="text-xl font-display font-black text-green-600">
                ${kpis.totalCobrado.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">{kpis.countCobrado} servicio{kpis.countCobrado !== 1 ? 's' : ''} cobrado{kpis.countCobrado !== 1 ? 's' : ''} exitosamente</p>
        </div>
      </div>

      {/* Client summary */}
      <div className="card p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <h3 className="text-sm font-bold text-slate-700 mb-1">Facturación por Cliente</h3>
        <p className="text-[11px] text-slate-400 mb-4">Resumen de servicios y cobros agrupado por institución</p>
        <div className="space-y-2.5">
          {clientSummary.map(([name, data], i) => {
            const collectedPct = data.total > 0 ? Math.round((data.cobrado / data.total) * 100) : 0;
            return (
              <div key={i} className="flex items-center gap-4 py-2 px-3 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-white transition-colors">
                <div className="w-9 h-9 rounded-xl bg-bio-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-bio-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{name}</p>
                  <p className="text-[10px] text-slate-400">{data.count} servicio{data.count !== 1 ? 's' : ''}</p>
                </div>
                <div className="w-20">
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${collectedPct}%` }} />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5 text-center">{collectedPct}% cobrado</p>
                </div>
                <p className="text-sm font-bold text-bio-primary min-w-[90px] text-right">${data.total.toLocaleString('es-AR')}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {([
          { value: 'all' as BillingFilter, label: 'Todos', count: billing.length },
          { value: 'pendiente' as BillingFilter, label: 'Pendientes', count: kpis.countPendiente },
          { value: 'facturado' as BillingFilter, label: 'Facturados', count: kpis.countFacturado },
          { value: 'cobrado' as BillingFilter, label: 'Cobrados', count: kpis.countCobrado },
        ]).map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === tab.value
                ? 'bg-bio-primary text-white shadow-md shadow-bio-primary/20'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab.label}
            <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-bold px-1 ${
              filter === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Billing table */}
      <div className="card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Servicio</th>
                <th className="text-center py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cant.</th>
                <th className="text-right py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precio</th>
                <th className="text-right py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</th>
                <th className="text-center py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                <th className="text-center py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Factura</th>
              </tr>
            </thead>
            <tbody>
              {filteredBilling.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Filter className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-medium">Sin resultados para este filtro</p>
                  </td>
                </tr>
              ) : (
                filteredBilling.map((item, idx) => {
                  const statusInfo = STATUS_MAP[item.status];
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer animate-in fade-in duration-200"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="py-3 px-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-bio-primary/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-3.5 h-3.5 text-bio-primary" />
                          </div>
                          <span className="text-xs font-bold text-slate-700 truncate max-w-[160px]">{item.client_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-[200px] truncate">{item.service_description}</td>
                      <td className="py-3 px-4 text-center text-xs font-bold text-slate-600">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-xs text-slate-500">${item.unit_price.toLocaleString('es-AR')}</td>
                      <td className="py-3 px-4 text-right text-sm font-bold text-bio-primary">${item.total.toLocaleString('es-AR')}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-[10px] font-mono font-bold text-slate-400">
                        {item.invoice_number || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredBilling.length > 0 && (
              <tfoot>
                <tr className="bg-bio-primary/5 border-t-2 border-bio-primary/10">
                  <td colSpan={5} className="py-3 px-4 text-xs font-bold text-bio-primary text-right">TOTAL:</td>
                  <td className="py-3 px-4 text-right text-sm font-black text-bio-primary">
                    ${filteredBilling.reduce((s, b) => s + b.total, 0).toLocaleString('es-AR')}
                  </td>
                  <td colSpan={2} className="py-3 px-4 text-center text-[10px] text-slate-400 font-bold">
                    {filteredBilling.length} registro{filteredBilling.length !== 1 ? 's' : ''}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem ? `Detalle de Servicio` : ''}
        size="md"
      >
        {selectedItem && (() => {
          const statusInfo = STATUS_MAP[selectedItem.status];
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                  {statusInfo.label}
                </span>
                {selectedItem.invoice_number && (
                  <span className="text-xs font-mono font-bold text-bio-primary bg-bio-primary/5 px-3 py-1 rounded-full border border-bio-primary/10">
                    {selectedItem.invoice_number}
                  </span>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-bio-primary" />
                  <span className="text-sm font-bold text-slate-700">{selectedItem.client_name}</span>
                </div>
                <p className="text-sm text-slate-600">{selectedItem.service_description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(selectedItem.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <p className="text-lg font-black text-bio-primary">{selectedItem.quantity}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Cantidad</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <p className="text-lg font-black text-bio-primary">${selectedItem.unit_price.toLocaleString('es-AR')}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Precio Unit.</p>
                </div>
                <div className="bg-bio-primary/5 rounded-xl p-3 text-center border border-bio-primary/10">
                  <p className="text-lg font-black text-bio-primary">${selectedItem.total.toLocaleString('es-AR')}</p>
                  <p className="text-[9px] text-bio-primary font-bold uppercase">Total</p>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
