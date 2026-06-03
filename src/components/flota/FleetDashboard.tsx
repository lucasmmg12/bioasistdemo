import { useState } from 'react';
import {
  Car, Fuel, Wrench, MapPin, AlertTriangle, CheckCircle2,
  Gauge, Calendar, DollarSign, Navigation
} from 'lucide-react';
import { MOCK_VEHICLES } from '../../data/mockData';
import { KpiCard } from '../ui/KpiCard';
import type { Vehicle } from '../../types';

export function FleetDashboard() {
  const [vehicles] = useState(MOCK_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const active = vehicles.filter(v => v.status === 'activo').length;
  const inShop = vehicles.filter(v => v.status === 'en_taller').length;
  const needService = vehicles.filter(v => v.next_service_km - v.km_actual < 2000).length;
  const totalKm = vehicles.reduce((s, v) => s + v.km_actual, 0);

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Vehículos Activos" value={active} icon={<Car className="w-5 h-5" />} color="success" delay={0} />
        <KpiCard label="En Taller" value={inShop} icon={<Wrench className="w-5 h-5" />} color="warning" delay={75} />
        <KpiCard label="Service Próximo" value={needService} icon={<AlertTriangle className="w-5 h-5" />} color="danger" delay={150} />
        <KpiCard label="Km Totales Flota" value={totalKm.toLocaleString('es-AR')} icon={<Gauge className="w-5 h-5" />} color="primary" delay={225} />
      </div>

      {/* Map placeholder */}
      <div className="card p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-bio-primary" />
            Ubicación en Tiempo Real
          </h3>
          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-bio-primary/10 text-bio-primary">
            Próximamente
          </span>
        </div>
        <div className="h-[200px] bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center border border-slate-200 border-dashed relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 left-12 w-4 h-4 rounded-full bg-bio-primary animate-ping" />
            <div className="absolute top-20 right-24 w-4 h-4 rounded-full bg-bio-secondary animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-16 left-1/3 w-4 h-4 rounded-full bg-bio-accent animate-ping" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-8 right-1/3 w-4 h-4 rounded-full bg-purple-500 animate-ping" style={{ animationDelay: '1.5s' }} />
          </div>
          <div className="text-center z-10">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">Mapa de rastreo satelital</p>
            <p className="text-[10px] text-slate-400 mt-1">Integración con proveedor GPS en desarrollo</p>
          </div>
        </div>
      </div>

      {/* Vehicle cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle, idx) => {
          const kmToService = vehicle.next_service_km - vehicle.km_actual;
          const isUrgent = kmToService < 2000;
          const isSelected = selectedVehicle?.id === vehicle.id;

          return (
            <div
              key={vehicle.id}
              onClick={() => setSelectedVehicle(isSelected ? null : vehicle)}
              className={`card p-5 cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-300 ${
                vehicle.status === 'en_taller' ? 'border-amber-200 bg-amber-50/30' : ''
              } ${isSelected ? 'ring-2 ring-bio-primary' : ''}`}
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
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${
                  vehicle.status === 'activo' ? 'bg-green-100 text-green-700' : vehicle.status === 'en_taller' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {vehicle.status === 'activo' ? 'Activo' : vehicle.status === 'en_taller' ? 'En Taller' : 'Inactivo'}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <p className="text-lg font-display font-black text-bio-text">{vehicle.km_actual.toLocaleString('es-AR')}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Km Actual</p>
                </div>
                <div className={`text-center p-2 rounded-lg ${isUrgent ? 'bg-red-50' : 'bg-slate-50'}`}>
                  <p className={`text-lg font-display font-black ${isUrgent ? 'text-red-600' : 'text-bio-text'}`}>
                    {kmToService.toLocaleString('es-AR')}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Km p/ Service</p>
                </div>
              </div>

              {isUrgent && (
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-red-700">Mantenimiento próximo requerido</span>
                </div>
              )}

              <div className="text-[11px] text-slate-400 font-medium space-y-1">
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-3 h-3" />
                  Último service: {new Date(vehicle.last_service_date).toLocaleDateString('es-AR')}
                </div>
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3 h-3" />
                  {vehicle.fuel_type === 'nafta' ? 'Nafta' : 'Diesel'}
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Chofer: {vehicle.driver_assigned}
                </div>
              </div>

              {/* Expanded: Fuel log */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Registro de Combustible</p>
                  <div className="space-y-2">
                    {vehicle.fuel_log.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-slate-50 rounded-lg p-2.5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600 font-medium">{new Date(entry.date).toLocaleDateString('es-AR')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">{entry.liters}L</span>
                          <span className="text-slate-500">{entry.km.toLocaleString('es-AR')} km</span>
                          <span className="font-bold text-bio-primary flex items-center gap-0.5">
                            <DollarSign className="w-3 h-3" />{entry.cost.toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
