import { useState, useMemo } from 'react';
import {
  Truck, MapPin, Clock, Package, User, AlertTriangle,
  ChevronRight, Phone, CheckCircle2, ArrowRight, Filter,
  Navigation, Hash, Calendar
} from 'lucide-react';
import { MOCK_ORDERS } from '../../data/mockData';
import { LOGISTICS_STATUSES } from '../../constants';
import { KpiCard } from '../ui/KpiCard';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';
import type { LogisticsOrder } from '../../types';

type LogisticsFilter = 'all' | 'urgente' | 'en_progreso' | 'completado';

export function OrdersPortal() {
  const [orders] = useState(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<LogisticsOrder | null>(null);
  const [filter, setFilter] = useState<LogisticsFilter>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);

  const pending = orders.filter(o => o.status === 'solicitado').length;
  const inRoute = orders.filter(o => o.status === 'en_ruta').length;
  const inPlant = orders.filter(o => ['en_planta', 'procesado', 'retirado'].includes(o.status)).length;
  const ready = orders.filter(o => o.status === 'listo_entrega').length;
  const delivered = orders.filter(o => o.status === 'entregado').length;
  const urgent = orders.filter(o => o.priority === 'urgente').length;

  const getStatusStep = (status: string) => {
    const idx = LOGISTICS_STATUSES.findIndex(s => s.value === status);
    return idx >= 0 ? idx : 0;
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (filter === 'urgente') result = result.filter(o => o.priority === 'urgente');
    if (filter === 'en_progreso') result = result.filter(o => !['entregado', 'solicitado'].includes(o.status));
    if (filter === 'completado') result = result.filter(o => o.status === 'entregado');
    return result;
  }, [orders, filter]);

  const openDetail = (order: LogisticsOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-bio-primary">
            Portal de Logística
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Gestión centralizada de retiros y entregas de material — Pizarra Digital
          </p>
        </div>
        <div className="flex items-center gap-2 bg-bio-primary/5 border border-bio-primary/10 px-4 py-2 rounded-xl">
          <Navigation className="w-4 h-4 text-bio-primary animate-pulse" />
          <span className="text-xs font-bold text-bio-primary">
            {inRoute} en ruta ahora
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Pendientes" value={pending} icon={<Clock className="w-5 h-5" />} color="warning" delay={0} />
        <KpiCard label="En Ruta" value={inRoute} icon={<Truck className="w-5 h-5" />} color="primary" delay={75} />
        <KpiCard label="En Planta" value={inPlant} icon={<Package className="w-5 h-5" />} color="secondary" delay={150} />
        <KpiCard label="Listos p/ Entrega" value={ready} icon={<CheckCircle2 className="w-5 h-5" />} color="success" delay={225} />
        <KpiCard label="Entregados" value={delivered} icon={<CheckCircle2 className="w-5 h-5" />} color="success" delay={300} />
        <KpiCard label="Urgentes" value={urgent} icon={<AlertTriangle className="w-5 h-5" />} color="danger" delay={375} />
      </div>

      {/* Urgent orders alert */}
      {orders.filter(o => o.priority === 'urgente' && o.status !== 'entregado').length > 0 && (
        <div className="card p-4 border-red-200 bg-red-50/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-800">Pedidos Urgentes Activos</p>
              <p className="text-[11px] text-red-600">Requieren atención inmediata — Cirugías programadas</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {orders.filter(o => o.priority === 'urgente' && o.status !== 'entregado').map(o => (
              <div
                key={o.id}
                onClick={() => openDetail(o)}
                className="flex items-center justify-between bg-white rounded-xl p-3 border border-red-100 cursor-pointer hover:bg-red-50/30 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Truck className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-700 truncate">{o.client_name}</span>
                  <StatusBadge status={o.status as any} />
                </div>
                <div className="flex items-center gap-2">
                  {o.notes && <span className="text-[10px] text-red-500 font-medium hidden md:block truncate max-w-[200px]">{o.notes}</span>}
                  <ChevronRight className="w-4 h-4 text-red-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {([
          { value: 'all' as LogisticsFilter, label: 'Todos', count: orders.length },
          { value: 'urgente' as LogisticsFilter, label: '🔴 Urgentes', count: urgent },
          { value: 'en_progreso' as LogisticsFilter, label: 'En Progreso', count: orders.filter(o => !['entregado', 'solicitado'].includes(o.status)).length },
          { value: 'completado' as LogisticsFilter, label: 'Completados', count: delivered },
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

      {/* Orders grid */}
      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <Filter className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No hay pedidos con este filtro</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order, idx) => (
            <div
              key={order.id}
              onClick={() => openDetail(order)}
              className={`card p-5 cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-300 ${
                order.priority === 'urgente' ? 'border-red-200 bg-red-50/30' : ''
              }`}
              style={{ animationDelay: `${idx * 75}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={order.status as any} />
                  {order.priority === 'urgente' && (
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Urgente
                    </span>
                  )}
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-300 group-hover:text-bio-primary group-hover:translate-x-1 transition-all`} />
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
                {order.notes && (
                  <div className="flex items-start gap-1.5 text-amber-600">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{order.notes}</span>
                  </div>
                )}
              </div>

              {/* Mini progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  <span>Progreso</span>
                  <span>{getStatusStep(order.status) + 1}/{LOGISTICS_STATUSES.length}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      order.status === 'entregado' ? 'bg-green-500' : 'bg-bio-secondary'
                    }`}
                    style={{ width: `${((getStatusStep(order.status) + 1) / LOGISTICS_STATUSES.length) * 100}%` }}
                  />
                </div>
              </div>

              {!order.driver && (
                <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-2 text-xs text-amber-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Sin chofer asignado — Requiere asignación</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedOrder ? `Pedido — ${selectedOrder.client_name}` : ''}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Status + Priority */}
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={selectedOrder.status as any} size="md" />
              {selectedOrder.priority === 'urgente' && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Urgente
                </span>
              )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-bio-primary" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Dirección</p>
                </div>
                <p className="text-xs font-medium text-slate-700">{selectedOrder.client_address}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-bio-primary" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Chofer</p>
                </div>
                <p className="text-xs font-medium text-slate-700">{selectedOrder.driver || 'Sin asignar'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-bio-primary" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Solicitado</p>
                </div>
                <p className="text-xs font-medium text-slate-700">{new Date(selectedOrder.requested_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-3.5 h-3.5 text-bio-primary" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Material</p>
                </div>
                <p className="text-xs font-medium text-slate-700">{selectedOrder.material_description}</p>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Observaciones</p>
                  <p className="text-xs text-amber-800 font-medium">{selectedOrder.notes}</p>
                </div>
              </div>
            )}

            {/* Full flow */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Flujo del Pedido</p>
              <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {LOGISTICS_STATUSES.map((status, i) => {
                  const isCurrent = status.value === selectedOrder.status;
                  const isPast = getStatusStep(selectedOrder.status) > i;
                  return (
                    <div key={status.value} className="flex items-center">
                      <span className={`px-2.5 py-1.5 text-[9px] font-bold rounded-lg whitespace-nowrap transition-all ${
                        isCurrent ? 'bg-bio-primary text-white shadow-lg shadow-bio-primary/30 scale-105' : isPast ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isPast && <CheckCircle2 className="w-3 h-3 inline mr-0.5 -mt-0.5" />}
                        {status.label}
                      </span>
                      {i < LOGISTICS_STATUSES.length - 1 && (
                        <ArrowRight className={`w-3 h-3 mx-0.5 flex-shrink-0 ${isPast ? 'text-green-300' : 'text-slate-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline mock */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Historial de Actividad</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-7 h-7 rounded-full bg-bio-primary/10 flex items-center justify-center flex-shrink-0">
                    <Hash className="w-3.5 h-3.5 text-bio-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700">Pedido registrado</p>
                    <p className="text-[10px] text-slate-400">{new Date(selectedOrder.requested_at).toLocaleString('es-AR')}</p>
                  </div>
                </div>
                {selectedOrder.driver && (
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-700">Chofer asignado: {selectedOrder.driver}</p>
                      <p className="text-[10px] text-slate-400">Automático</p>
                    </div>
                  </div>
                )}
                {selectedOrder.pickup_at && (
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-700">Material retirado</p>
                      <p className="text-[10px] text-slate-400">{new Date(selectedOrder.pickup_at).toLocaleString('es-AR')}</p>
                    </div>
                  </div>
                )}
                {selectedOrder.delivered_at && (
                  <div className="flex items-center gap-3 p-2.5 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-700">Entregado al cliente</p>
                      <p className="text-[10px] text-green-500">{new Date(selectedOrder.delivered_at).toLocaleString('es-AR')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

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
