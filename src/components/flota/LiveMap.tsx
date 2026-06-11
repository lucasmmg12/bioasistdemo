import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Gauge, Fuel, Clock, Car, Radio } from 'lucide-react';
import type { Vehicle } from '../../types';

interface LiveMapProps {
  vehicles: Vehicle[];
  onVehicleClick?: (vehicle: Vehicle) => void;
}

// ── San Juan real coordinates ──
const SAN_JUAN_CENTER: [number, number] = [-31.5375, -68.5264];
const MAP_ZOOM = 13;

// ── Vehicle routes with real San Juan coordinates ──
const VEHICLE_DATA: {
  id: string;
  color: string;
  route: [number, number][];
  currentLocation: string;
  speed: number;
  fuelPct: number;
  fuelLiters: number;
  lastUpdate: string;
}[] = [
  {
    id: 'v1',
    color: '#10B981',
    // Planta → Hospital Regional (north via Av. España)
    route: [
      [-31.545, -68.520], [-31.542, -68.523], [-31.540, -68.527],
      [-31.537, -68.530], [-31.535, -68.533], [-31.532, -68.535],
      [-31.530, -68.537], [-31.527, -68.538], [-31.525, -68.540],
      [-31.522, -68.542], [-31.520, -68.543],
    ],
    currentLocation: 'Av. España y Gral. Paz',
    speed: 42,
    fuelPct: 68,
    fuelLiters: 24,
    lastUpdate: '13:54',
  },
  {
    id: 'v2',
    color: '#3B82F6',
    // Clínica del Sur → Planta (southeast)
    route: [
      [-31.550, -68.535], [-31.548, -68.532], [-31.547, -68.528],
      [-31.546, -68.525], [-31.545, -68.523], [-31.544, -68.520],
      [-31.543, -68.518], [-31.542, -68.515],
    ],
    currentLocation: 'Calle Mendoza y Av. Rawson',
    speed: 35,
    fuelPct: 55,
    fuelLiters: 18,
    lastUpdate: '13:53',
  },
  {
    id: 'v3',
    color: '#F59E0B',
    // Planta → Caucete (east via Ruta 40)
    route: [
      [-31.545, -68.520], [-31.543, -68.515], [-31.540, -68.510],
      [-31.538, -68.505], [-31.536, -68.500], [-31.535, -68.495],
      [-31.534, -68.490], [-31.533, -68.485], [-31.532, -68.480],
    ],
    currentLocation: 'Ruta 40 km 1125 (hacia Caucete)',
    speed: 58,
    fuelPct: 72,
    fuelLiters: 32,
    lastUpdate: '13:55',
  },
  {
    id: 'v5',
    color: '#8B5CF6',
    // Planta → Centro Médico del Este (west)
    route: [
      [-31.545, -68.520], [-31.543, -68.525], [-31.540, -68.530],
      [-31.538, -68.535], [-31.537, -68.540], [-31.536, -68.545],
      [-31.535, -68.548], [-31.534, -68.552], [-31.533, -68.555],
    ],
    currentLocation: 'Av. Libertador San Martín',
    speed: 28,
    fuelPct: 85,
    fuelLiters: 42,
    lastUpdate: '13:55',
  },
];

// Vehicle in taller (static)
const TALLER_VEHICLE = {
  id: 'v4',
  position: [-31.545, -68.520] as [number, number],
  currentLocation: 'Taller — Sin GPS activo',
  speed: 0,
  fuelPct: 30,
  fuelLiters: 10,
  lastUpdate: '10:15',
};

// ── Landmarks ──
const LANDMARKS: { position: [number, number]; label: string; type: 'base' | 'client' }[] = [
  { position: [-31.545, -68.520], label: 'PLANTA BIO ASIST', type: 'base' },
  { position: [-31.520, -68.543], label: 'Hospital Regional', type: 'client' },
  { position: [-31.550, -68.535], label: 'Clínica del Sur', type: 'client' },
  { position: [-31.532, -68.480], label: 'Hospital Caucete', type: 'client' },
  { position: [-31.533, -68.555], label: 'Centro Médico Este', type: 'client' },
  { position: [-31.530, -68.530], label: 'Clínica Alberdi', type: 'client' },
];

export function LiveMap({ vehicles, onVehicleClick }: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylinesRef = useRef<Record<string, L.Polyline>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const animFrameRef = useRef<number>(0);
  const progressRef = useRef<Record<string, number>>({});
  const directionRef = useRef<Record<string, number>>({});

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: SAN_JUAN_CENTER,
      zoom: MAP_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    // OpenStreetMap tiles (clean style)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    // ── Add landmarks ──
    LANDMARKS.forEach(lm => {
      const isBase = lm.type === 'base';

      const icon = L.divIcon({
        className: 'custom-landmark',
        html: `
          <div style="
            display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);
          ">
            <div style="
              background: ${isBase ? '#003B5C' : 'white'};
              color: ${isBase ? 'white' : '#003B5C'};
              padding: ${isBase ? '5px 10px' : '3px 8px'};
              border-radius: 8px;
              font-size: ${isBase ? '10px' : '9px'};
              font-weight: 800;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              border: ${isBase ? 'none' : '1.5px solid #003B5C30'};
              letter-spacing: 0.5px;
            ">${lm.label}</div>
            <div style="
              width: 0; height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 6px solid ${isBase ? '#003B5C' : 'white'};
            "></div>
            ${isBase ? `<div style="
              width: 12px; height: 12px; border-radius: 50%;
              background: #003B5C; border: 3px solid white;
              box-shadow: 0 0 0 2px #003B5C40, 0 2px 6px rgba(0,0,0,0.2);
              margin-top: -2px;
            "></div>` : `<div style="
              width: 8px; height: 8px; border-radius: 50%;
              background: #003B5C; border: 2px solid white;
              box-shadow: 0 1px 4px rgba(0,0,0,0.15);
              margin-top: -2px;
            "></div>`}
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      L.marker(lm.position, { icon, interactive: false }).addTo(map);
    });

    // ── Add route polylines ──
    VEHICLE_DATA.forEach(vd => {
      const polyline = L.polyline(vd.route, {
        color: vd.color,
        weight: 3,
        opacity: 0.4,
        dashArray: '8 6',
        lineCap: 'round',
      }).addTo(map);
      polylinesRef.current[vd.id] = polyline;
    });

    // ── Add vehicle markers ──
    VEHICLE_DATA.forEach(vd => {
      const vehicle = vehicles.find(v => v.id === vd.id);
      if (!vehicle) return;

      const icon = L.divIcon({
        className: 'vehicle-marker',
        html: `
          <div class="vehicle-marker-container" style="transform: translate(-50%, -50%);">
            <div class="vehicle-pulse" style="
              position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
              width: 36px; height: 36px; border-radius: 50%;
              background: ${vd.color}20;
              animation: vehiclePulse 2s ease-in-out infinite;
            "></div>
            <div style="
              width: 18px; height: 18px; border-radius: 50%;
              background: ${vd.color}; border: 3px solid white;
              box-shadow: 0 2px 8px ${vd.color}60, 0 0 0 2px ${vd.color}30;
              position: relative; z-index: 2;
            "></div>
            <div style="
              position: absolute; left: 22px; top: 50%; transform: translateY(-50%);
              background: white; border: 1.5px solid ${vd.color};
              border-radius: 6px; padding: 2px 7px;
              font-size: 9px; font-weight: 800; color: ${vd.color};
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
              z-index: 3;
            ">${vehicle.patente}</div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker(vd.route[0], { icon }).addTo(map);
      markersRef.current[vd.id] = marker;
      progressRef.current[vd.id] = Math.random() * 0.5;
      directionRef.current[vd.id] = 1;
    });

    // ── Add taller vehicle (static, dimmed) ──
    const tallerVehicle = vehicles.find(v => v.id === 'v4');
    if (tallerVehicle) {
      const tallerIcon = L.divIcon({
        className: 'vehicle-marker-taller',
        html: `
          <div style="transform: translate(-50%, -50%); opacity: 0.5;">
            <div style="
              width: 14px; height: 14px; border-radius: 50%;
              background: #F59E0B; border: 2px solid white;
              box-shadow: 0 1px 4px rgba(0,0,0,0.15);
            "></div>
            <div style="
              position: absolute; left: 18px; top: 50%; transform: translateY(-50%);
              background: #FEF3C7; border: 1px solid #F59E0B;
              border-radius: 4px; padding: 1px 5px;
              font-size: 8px; font-weight: 700; color: #92400E;
              white-space: nowrap;
            ">${tallerVehicle.patente} (TALLER)</div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      L.marker(TALLER_VEHICLE.position, { icon: tallerIcon, interactive: false }).addTo(map);
    }

    // ── Animate vehicles ──
    const animate = () => {
      VEHICLE_DATA.forEach(vd => {
        const marker = markersRef.current[vd.id];
        if (!marker) return;

        const route = vd.route;
        let progress = progressRef.current[vd.id] || 0;
        let direction = directionRef.current[vd.id] || 1;

        // Different speeds per vehicle
        const speedFactor = vd.id === 'v1' ? 0.002 : vd.id === 'v2' ? 0.0015 : vd.id === 'v3' ? 0.003 : 0.0012;
        progress += speedFactor * direction;

        if (progress >= 1) { progress = 1; direction = -1; }
        if (progress <= 0) { progress = 0; direction = 1; }

        progressRef.current[vd.id] = progress;
        directionRef.current[vd.id] = direction;

        // Interpolate position along route
        const totalSegments = route.length - 1;
        const rawIdx = progress * totalSegments;
        const segIdx = Math.min(Math.floor(rawIdx), totalSegments - 1);
        const segProgress = rawIdx - segIdx;

        const lat = route[segIdx][0] + (route[segIdx + 1][0] - route[segIdx][0]) * segProgress;
        const lng = route[segIdx][1] + (route[segIdx + 1][1] - route[segIdx][1]) * segProgress;

        marker.setLatLng([lat, lng]);
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, [vehicles]);

  // Highlight selected vehicle
  useEffect(() => {
    Object.entries(polylinesRef.current).forEach(([id, polyline]) => {
      polyline.setStyle({
        opacity: selectedVehicle === null || selectedVehicle === id ? 0.5 : 0.15,
        weight: selectedVehicle === id ? 4 : 3,
      });
    });

    if (selectedVehicle && mapRef.current) {
      const vd = VEHICLE_DATA.find(v => v.id === selectedVehicle);
      if (vd) {
        const midIdx = Math.floor(vd.route.length / 2);
        mapRef.current.panTo(vd.route[midIdx], { animate: true, duration: 0.5 });
      }
    }
  }, [selectedVehicle]);

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-4 pb-0 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-bio-primary" />
            Rastreo en Tiempo Real — San Juan
          </h3>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-green-100 text-green-700 border border-green-200">
              <Radio className="w-3 h-3 animate-pulse" />
              En Vivo
            </span>
          </div>
        </div>

        <div className="relative">
          {/* Map container */}
          <div
            ref={mapContainerRef}
            style={{ height: '420px', width: '100%', zIndex: 1 }}
          />

          {/* Legend overlay */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vehículos</p>
            <div className="space-y-1.5">
              {VEHICLE_DATA.map(vd => {
                const v = vehicles.find(veh => veh.id === vd.id);
                if (!v) return null;
                const isActive = selectedVehicle === vd.id;
                return (
                  <div
                    key={vd.id}
                    onClick={() => setSelectedVehicle(isActive ? null : vd.id)}
                    className={`flex items-center gap-2 text-[10px] px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                      isActive ? 'bg-slate-100 ring-1 ring-slate-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-white" style={{ background: vd.color, boxShadow: `0 0 0 1px ${vd.color}40` }} />
                    <span className="text-slate-700 font-bold">{v.patente}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-400 font-medium">{v.driver_assigned}</span>
                    <span className="ml-auto text-[9px] font-bold" style={{ color: vd.color }}>{vd.speed} km/h</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-2 text-[10px] px-2 py-1 opacity-50 border-t border-slate-100 pt-1.5">
                <span className="w-3 h-3 rounded-full flex-shrink-0 bg-amber-400 border-2 border-white" />
                <span className="text-slate-500 font-medium">MN 012 OP — En Taller</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Telemetry Table */}
      <div className="card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <div className="p-4 pb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Radio className="w-4 h-4 text-bio-secondary" />
            Telemetría de Flota
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Actualización cada 30 segundos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehículo</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chofer</th>
                <th className="text-left py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Última Posición</th>
                <th className="text-center py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Velocidad</th>
                <th className="text-center py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Combustible</th>
                <th className="text-center py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hora GPS</th>
                <th className="text-center py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {[...VEHICLE_DATA.map(vd => ({ ...vd, moving: true })), { ...TALLER_VEHICLE, id: 'v4', color: '#F59E0B', route: [], moving: false }].map((gps, idx) => {
                const vehicle = vehicles.find(v => v.id === gps.id);
                if (!vehicle) return null;
                const isHighlighted = selectedVehicle === gps.id;

                return (
                  <tr
                    key={gps.id}
                    onClick={() => { setSelectedVehicle(isHighlighted ? null : gps.id); if (gps.moving) onVehicleClick?.(vehicle); }}
                    className={`border-b border-slate-50 transition-all cursor-pointer animate-in fade-in duration-200 ${
                      isHighlighted ? 'bg-bio-primary/5' : 'hover:bg-slate-50'
                    }`}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${gps.color}15` }}>
                          <Car className="w-4 h-4" style={{ color: gps.color }} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{vehicle.patente}</p>
                          <p className="text-[10px] text-slate-400">{vehicle.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-medium">{vehicle.driver_assigned}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-600 font-medium">{gps.currentLocation}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {gps.moving ? (
                        <div className="flex items-center justify-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-bio-primary" />
                          <span className="text-xs font-bold text-bio-primary">{gps.speed} km/h</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">— Detenido</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Fuel className="w-3.5 h-3.5" style={{ color: gps.fuelPct > 50 ? '#10B981' : gps.fuelPct > 25 ? '#F59E0B' : '#EF4444' }} />
                          <span className="text-xs font-bold" style={{ color: gps.fuelPct > 50 ? '#10B981' : gps.fuelPct > 25 ? '#F59E0B' : '#EF4444' }}>
                            {gps.fuelLiters}L
                          </span>
                        </div>
                        <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${gps.fuelPct}%`,
                              background: gps.fuelPct > 50 ? '#10B981' : gps.fuelPct > 25 ? '#F59E0B' : '#EF4444',
                            }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400">{gps.fuelPct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500 font-medium">{gps.lastUpdate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {gps.moving ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-green-100 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          En Movimiento
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                          En Taller
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes vehiclePulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
          50% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
        }
        .leaflet-container {
          font-family: 'Inter', sans-serif;
          border-radius: 0 0 16px 16px;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 16px !important;
          color: #003B5C !important;
          border-color: #e2e8f0 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f1f5f9 !important;
        }
        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(255,255,255,0.8) !important;
          border-radius: 6px 0 0 0 !important;
          padding: 2px 6px !important;
        }
      `}</style>
    </div>
  );
}
