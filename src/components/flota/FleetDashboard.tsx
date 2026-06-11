import { useState, useMemo } from 'react';
import {
  Car, Fuel, Wrench, MapPin, AlertTriangle, CheckCircle2,
  Gauge, Calendar, DollarSign, Navigation, TrendingUp,
  ChevronRight, X, Droplets
} from 'lucide-react';
import { MOCK_VEHICLES } from '../../data/mockData';
import { KpiCard } from '../ui/KpiCard';
import { Modal } from '../ui/Modal';
import { LiveMap } from './LiveMap';
import type { Vehicle } from '../../types';

type VehicleFilter = 'all' | 'activo' | 'en_taller' | 'needs_service';

export function FleetDashboard() {
  const [vehicles] = useState(MOCK_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filter, setFilter] = useState<VehicleFilter>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);

  const active = vehicles.filter(v => v.status === 'activo').length;
  const inShop = vehicles.filter(v => v.status === 'en_taller').length;
  const needService = vehicles.filter(v => v.next_service_km - v.km_actual < 2000).length;
  const totalKm = vehicles.reduce((s, v) => s + v.km_actual, 0);

  // Fuel cost this month
  const monthFuelCost = useMemo(() => {
    return vehicles.reduce((sum, v) => {
      return sum + v.fuel_log.reduce((s, e) => {
        const d = new Date(e.date);
        const now = new Date();
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          return s + e.cost;
        }
        return s;
      }, 0);
    }, 0);
  }, [vehicles]);

  // Average consumption
  const avgConsumption = useMemo(() => {
    let totalLiters = 0;
    let totalKmDriven = 0;
    vehicles.forEach(v => {
      if (v.fuel_log.length >= 2) {
        const sorted = [...v.fuel_log].sort((a, b) => a.km - b.km);
        const kmRange = sorted[sorted.length - 1].km - sorted[0].km;
        const liters = sorted.slice(1).reduce((s, e) => s + e.liters, 0);
        if (kmRange > 0) {
          totalLiters += liters;
          totalKmDriven += kmRange;
        }
      }
    });
    return totalKmDriven > 0 ? (totalKmDriven / totalLiters).toFixed(1) : '0';
  }, [vehicles]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    if (filter === 'activo') return vehicles.filter(v => v.status === 'activo');
    if (filter === 'en_taller') return vehicles.filter(v => v.status === 'en_taller');
    if (filter === 'needs_service') return vehicles.filter(v => v.next_service_km - v.km_actual < 2000);
    return vehicles;
  }, [vehicles, filter]);

  const openDetail = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-black text-bio-primary">
          Gestión de Flota
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-1">
          Control de vehículos, combustible y mantenimiento preventivo
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Activos" value={active} icon={<Car className="w-5 h-5" />} color="success" delay={0} />
        <KpiCard label="En Taller" value={inShop} icon={<Wrench className="w-5 h-5" />} color="warning" delay={75} />
        <KpiCard label="Service Próximo" value={needService} icon={<AlertTriangle className="w-5 h-5" />} color="danger" delay={150} />
        <KpiCard label="Km Total Flota" value={totalKm.toLocaleString('es-AR')} icon={<Gauge className="w-5 h-5" />} color="primary" delay={225} />
        <KpiCard label="Consumo Prom." value={`${avgConsumption} km/L`} icon={<TrendingUp className="w-5 h-5" />} color="secondary" delay={300} />
        <KpiCard label="Costo Combustible" value={`$${monthFuelCost.toLocaleString('es-AR')}`} icon={<DollarSign className="w-5 h-5" />} color="primary" delay={375} />
      </div>

      {/* Alerts panel */}
      {needService > 0 && (
        <div className="card p-4 border-amber-200 bg-amber-50/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">Alertas de Mantenimiento</p>
              <p className="text-[11px] text-amber-600">{needService} vehículo{needService !== 1 ? 's' : ''} con service próximo</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {vehicles.filter(v => v.next_service_km - v.km_actual < 2000).map(v => (
              <div key={v.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-100">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-700">{v.patente}</span>
                  <span className="text-[10px] text-slate-400">{v.model}</span>
                </div>
                <span className="text-[10px] font-bold text-red-600">
                  {(v.next_service_km - v.km_actual).toLocaleString('es-AR')} km restantes
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {([
          { value: 'all' as VehicleFilter, label: 'Todos', count: vehicles.length },
          { value: 'activo' as VehicleFilter, label: 'Activos', count: active },
          { value: 'en_taller' as VehicleFilter, label: 'En Taller', count: inShop },
          { value: 'needs_service' as VehicleFilter, label: 'Service Próximo', count: needService },
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

      {/* Live Map */}
      <LiveMap vehicles={vehicles} onVehicleClick={openDetail} />

      {/* Vehicle cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((vehicle, idx) => {
          const kmToService = vehicle.next_service_km - vehicle.km_actual;
          const isUrgent = kmToService < 2000;
          const serviceProgress = ((vehicle.km_actual - vehicle.last_service_km) / (vehicle.next_service_km - vehicle.last_service_km)) * 100;
          const avgKmL = vehicle.fuel_log.length >= 2
            ? (() => {
                const sorted = [...vehicle.fuel_log].sort((a, b) => a.km - b.km);
                const kmDriven = sorted[sorted.length - 1].km - sorted[0].km;
                const liters = sorted.slice(1).reduce((s, e) => s + e.liters, 0);
                return liters > 0 ? (kmDriven / liters).toFixed(1) : '—';
              })()
            : '—';

          return (
            <div
              key={vehicle.id}
              onClick={() => openDetail(vehicle)}
              className={`card p-5 cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-300 ${
                vehicle.status === 'en_taller' ? 'border-amber-200 bg-amber-50/30' : ''
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    vehicle.status === 'activo' ? 'bg-green-100 text-green-600' : vehicle.status === 'en_taller' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{vehicle.patente}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{vehicle.model} ({vehicle.year})</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${
                    vehicle.status === 'activo' ? 'bg-green-100 text-green-700' : vehicle.status === 'en_taller' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {vehicle.status === 'activo' ? 'Activo' : vehicle.status === 'en_taller' ? 'En Taller' : 'Inactivo'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-bio-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <p className="text-sm font-display font-black text-bio-text">{vehicle.km_actual.toLocaleString('es-AR')}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Km Actual</p>
                </div>
                <div className={`text-center p-2 rounded-lg ${isUrgent ? 'bg-red-50' : 'bg-slate-50'}`}>
                  <p className={`text-sm font-display font-black ${isUrgent ? 'text-red-600' : 'text-bio-text'}`}>
                    {kmToService.toLocaleString('es-AR')}
                  </p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Km p/ Service</p>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <p className="text-sm font-display font-black text-bio-text">{avgKmL}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Km/Litro</p>
                </div>
              </div>

              {/* Service progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold mb-1">
                  <span>Progreso al Service</span>
                  <span>{Math.round(serviceProgress)}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      serviceProgress > 90 ? 'bg-red-500' : serviceProgress > 70 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(serviceProgress, 100)}%` }}
                  />
                </div>
              </div>

              {isUrgent && (
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-red-700">Mantenimiento próximo requerido</span>
                </div>
              )}

              <div className="text-[11px] text-slate-400 font-medium space-y-1 mt-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Chofer: {vehicle.driver_assigned}
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-3 h-3" />
                  {vehicle.fuel_type === 'nafta' ? 'Nafta' : 'Diesel'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedVehicle ? `${selectedVehicle.patente} — ${selectedVehicle.model}` : ''}
        size="lg"
      >
        {selectedVehicle && (() => {
          const v = selectedVehicle;
          const kmToService = v.next_service_km - v.km_actual;
          const serviceProgress = ((v.km_actual - v.last_service_km) / (v.next_service_km - v.last_service_km)) * 100;
          const totalFuelCost = v.fuel_log.reduce((s, e) => s + e.cost, 0);
          const totalLiters = v.fuel_log.reduce((s, e) => s + e.liters, 0);

          return (
            <div className="space-y-5">
              {/* Status + Driver */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                  v.status === 'activo' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {v.status === 'activo' ? '🟢 Activo' : '🔧 En Taller'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Chofer: <strong className="text-slate-700">{v.driver_assigned}</strong>
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Año: <strong className="text-slate-700">{v.year}</strong>
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Combustible: <strong className="text-slate-700">{v.fuel_type === 'nafta' ? 'Nafta' : 'Diesel'}</strong>
                </span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <p className="text-xl font-black text-bio-primary">{v.km_actual.toLocaleString('es-AR')}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Km Actual</p>
                </div>
                <div className={`rounded-xl p-3 text-center border ${kmToService < 2000 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                  <p className={`text-xl font-black ${kmToService < 2000 ? 'text-red-600' : 'text-bio-primary'}`}>{kmToService.toLocaleString('es-AR')}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Km p/ Service</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <p className="text-xl font-black text-bio-primary">{totalLiters}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Litros Total</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <p className="text-xl font-black text-bio-primary">${totalFuelCost.toLocaleString('es-AR')}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Costo Total</p>
                </div>
              </div>

              {/* Service Progress */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-slate-600">Progreso al Próximo Service</span>
                  <span className={serviceProgress > 90 ? 'text-red-600' : 'text-bio-primary'}>{Math.round(serviceProgress)}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${
                    serviceProgress > 90 ? 'bg-red-500' : serviceProgress > 70 ? 'bg-amber-500' : 'bg-green-500'
                  }`} style={{ width: `${Math.min(serviceProgress, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                  <span>Último: {v.last_service_km.toLocaleString('es-AR')} km</span>
                  <span>Próximo: {v.next_service_km.toLocaleString('es-AR')} km</span>
                </div>
              </div>

              {/* Fuel log */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Historial de Combustible</p>
                <div className="space-y-2">
                  {v.fuel_log.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between bg-white rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-bio-primary/10 flex items-center justify-center">
                          <Fuel className="w-4 h-4 text-bio-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-600">{new Date(entry.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="text-[10px] text-slate-400">{entry.km.toLocaleString('es-AR')} km</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-slate-500 font-medium">{entry.liters} L</span>
                        <span className="font-bold text-bio-primary">${entry.cost.toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
