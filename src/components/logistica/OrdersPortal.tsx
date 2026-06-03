import { useState } from 'react';
import {
  Truck, MapPin, Clock, Package, User, AlertTriangle,
  ChevronRight, Phone, CheckCircle2, ArrowRight
} from 'lucide-react';
import { MOCK_ORDERS } from '../../data/mockData';
import { LOGISTICS_STATUSES } from '../../constants';
import { KpiCard } from '../ui/KpiCard';
import { StatusBadge } from '../ui/StatusBadge';
import type { LogisticsOrder } from '../../types';

export function OrdersPortal() {
  const [orders] = useState(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<LogisticsOrder | null>(null);

  const pending = orders.filter(o => o.status === 'solicitado').length;
  const inRoute = orders.filter(o => o.status === 'en_ruta').length;
  const inPlant = orders.filter(o => ['en_planta', 'procesado', 'retirado'].includes(o.status)).length;
  const ready = orders.filter(o => o.status === 'listo_entrega').length;

  const getStatusStep = (status: string) => {
    const idx = LOGISTICS_STATUSES.findIndex(s => s.value === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-black text-bio-primary">
          Portal de Logística
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-1">
          Gestión centralizada de retiros y entregas de material — Pizarra Digital
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Pendientes" value={pending} icon={<Clock className="w-5 h-5" />} color="warning" delay={0} />
        <KpiCard label="En Ruta" value={inRoute} icon={<Truck className="w-5 h-5" />} color="primary" delay={75} />
        <KpiCard label="En Planta" value={inPlant} icon={<Package className="w-5 h-5" />} color="secondary" delay={150} />
        <KpiCard label="Listos p/ Entrega" value={ready} icon={<CheckCircle2 className="w-5 h-5" />} color="success" delay={225} />
      </div>

      {/* Orders grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((order, idx) => (
          <div
            key={order.id}
            onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
            className={`card p-5 cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-300 ${
              order.priority === 'urgente' ? 'border-red-200 bg-red-50/30' : ''
            } ${selectedOrder?.id === order.id ? 'ring-2 ring-bio-primary' : ''}`}
            style={{ animationDelay: `${idx * 75}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={order.status as any} />
                {order.priority === 'urgente' && (
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Urgente
                  </span>
                )}
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${selectedOrder?.id === order.id ? 'rotate-90' : ''}`} />
            </div>

            <h3 className="font-bold text-slate-800 text-sm mb-1">{order.client_name}</h3>
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{order.material_description}</p>

            <div className="space-y-1.5 text-[11px] text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {order.client_address}
              </div>
              {order.driver && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3" />
                  {order.driver}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {new Date(order.requested_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Mini progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                <span>Progreso</span>
                <span>{getStatusStep(order.status) + 1}/{LOGISTICS_STATUSES.length}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-bio-secondary rounded-full transition-all duration-500"
                  style={{ width: `${((getStatusStep(order.status) + 1) / LOGISTICS_STATUSES.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Expanded detail */}
            {selectedOrder?.id === order.id && (
              <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Flujo del Pedido</p>
                <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
                  {LOGISTICS_STATUSES.map((status, i) => {
                    const isCurrent = status.value === order.status;
                    const isPast = getStatusStep(order.status) > i;
                    return (
                      <div key={status.value} className="flex items-center">
                        <span className={`px-2 py-1 text-[9px] font-bold rounded-lg whitespace-nowrap ${
                          isCurrent ? 'bg-bio-primary text-white' : isPast ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {status.label}
                        </span>
                        {i < LOGISTICS_STATUSES.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-300 mx-0.5 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
                {!order.driver && (
                  <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-2 text-xs text-amber-700">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">Sin chofer asignado — Requiere asignación</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* WhatsApp integration hint */}
      <div className="card p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20 flex-shrink-0">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-green-800 text-sm">Canal Único Digital</p>
            <p className="text-xs text-green-600 mt-0.5">
              Próximamente: los clientes podrán solicitar retiros directamente desde un formulario web o WhatsApp, eliminando la pizarra manual y los llamados dispersos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
