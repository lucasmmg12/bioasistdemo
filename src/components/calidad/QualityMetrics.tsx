import { useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Download, FileSpreadsheet, Clock, Target, Layers, AlertTriangle } from 'lucide-react';
import { KpiCard } from '../ui/KpiCard';
import { SECTORS, FINDING_STATUSES } from '../../constants';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement, Filler } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { useFindings } from '../../contexts/FindingsContext';
import { exportToPDF, exportToExcel } from '../../services/exportService';
import { MOCK_MONTHLY_TRENDS } from '../../data/mockData';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement, Filler);

export function QualityMetrics() {
  const { findings } = useFindings();

  // ─── KPIs ───
  const kpis = useMemo(() => {
    const active = findings.filter(f => f.status !== 'discarded');
    const closed = active.filter(f => f.status === 'closed');
    const closureRate = active.length > 0 ? Math.round((closed.length / active.length) * 100) : 0;

    const avgDays = closed.length > 0 ? Math.round(
      closed.reduce((sum, f) => {
        const created = new Date(f.created_at).getTime();
        const updated = new Date(f.updated_at).getTime();
        return sum + (updated - created) / (1000 * 60 * 60 * 24);
      }, 0) / closed.length
    ) : 0;

    const overdue = active.filter(f => {
      if (f.status === 'closed') return false;
      const deadline = f.status === 'immediate_action' ? f.deadline_immediate : f.deadline_analysis;
      return deadline && new Date(deadline) < new Date();
    });

    const nc = active.filter(f => f.type === 'no_conformidad').length;
    const om = active.filter(f => f.type === 'oportunidad_mejora').length;
    const riskImpact = active.filter(f => f.risk_matrix_impact).length;

    return { total: active.length, closed: closed.length, closureRate, avgDays, overdue: overdue.length, nc, om, riskImpact };
  }, [findings]);

  // ─── Status distribution (Doughnut) ───
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    findings.filter(f => f.status !== 'discarded').forEach(f => {
      counts[f.status] = (counts[f.status] || 0) + 1;
    });

    const labels = Object.keys(counts).map(k => FINDING_STATUSES.find(s => s.value === k)?.label || k);
    const colorMap: Record<string, string> = {
      pending: '#94A3B8',
      immediate_action: '#3B82F6',
      root_cause_analysis: '#F59E0B',
      corrective_plan: '#8B5CF6',
      verification: '#14B8A6',
      effectiveness: '#10B981',
      closed: '#22C55E',
    };

    return {
      labels,
      datasets: [{
        data: Object.values(counts),
        backgroundColor: Object.keys(counts).map(k => colorMap[k] || '#CBD5E1'),
        borderWidth: 0,
        hoverOffset: 8,
      }],
    };
  }, [findings]);

  // ─── Sector distribution (Bar) ───
  const sectorData = useMemo(() => {
    const counts: Record<string, number> = {};
    findings.filter(f => f.status !== 'discarded').forEach(f => {
      const label = SECTORS.find(s => s.value === f.sector)?.label || f.sector;
      counts[label] = (counts[label] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    return {
      labels: sorted.map(([k]) => k),
      datasets: [{
        label: 'Hallazgos',
        data: sorted.map(([, v]) => v),
        backgroundColor: '#003B5C',
        borderRadius: 8,
        barThickness: 28,
      }],
    };
  }, [findings]);

  // ─── Priority distribution (Doughnut) ───
  const priorityData = useMemo(() => {
    const counts = { green: 0, yellow: 0, red: 0 };
    findings.filter(f => f.status !== 'discarded').forEach(f => {
      counts[f.priority]++;
    });

    return {
      labels: ['Baja', 'Media', 'Alta'],
      datasets: [{
        data: [counts.green, counts.yellow, counts.red],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0,
        hoverOffset: 8,
      }],
    };
  }, [findings]);

  // ─── Monthly Trend Line ───
  const trendData = useMemo(() => ({
    labels: MOCK_MONTHLY_TRENDS.map(m => m.month),
    datasets: [
      {
        label: 'Total Hallazgos',
        data: MOCK_MONTHLY_TRENDS.map(m => m.hallazgos),
        borderColor: '#003B5C',
        backgroundColor: 'rgba(0, 59, 92, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 2.5,
      },
      {
        label: 'Cerrados',
        data: MOCK_MONTHLY_TRENDS.map(m => m.cerrados),
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 2.5,
      },
    ],
  }), []);

  // ─── Origin distribution ───
  const originData = useMemo(() => {
    const counts: Record<string, number> = {};
    const originLabels: Record<string, string> = {
      auditoria_interna: 'Auditoría Interna',
      auditoria_externa: 'Auditoría Externa',
      proceso: 'Proceso',
      '5s': '5S',
      queja_cliente: 'Queja Cliente',
      deteccion_espontanea: 'Detección Espontánea',
    };
    findings.filter(f => f.status !== 'discarded').forEach(f => {
      const label = originLabels[f.origin] || f.origin;
      counts[label] = (counts[label] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const colors = ['#003B5C', '#0891B2', '#F59E0B', '#8B5CF6', '#EF4444', '#10B981'];

    return {
      labels: sorted.map(([k]) => k),
      datasets: [{
        data: sorted.map(([, v]) => v),
        backgroundColor: colors.slice(0, sorted.length),
        borderWidth: 0,
        hoverOffset: 8,
      }],
    };
  }, [findings]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { padding: 16, usePointStyle: true, pointStyleWidth: 8, font: { size: 11, weight: 600 as const } } },
    },
    cutout: '65%',
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 11, weight: 600 as const } } },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { padding: 16, usePointStyle: true, pointStyleWidth: 8, font: { size: 11, weight: 600 as const } } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, beginAtZero: true, ticks: { font: { size: 11 } } },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-bio-primary">Métricas & Reportes</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Indicadores de gestión de calidad ISO 9001 — Panel de análisis</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => exportToPDF(findings, `Metricas_BioAsist_${new Date().toISOString().slice(0, 10)}.pdf`)}>
            <Download className="w-4 h-4" /> PDF
          </button>
          <button className="btn-secondary" onClick={() => exportToExcel(findings, `Metricas_BioAsist_${new Date().toISOString().slice(0, 10)}.xlsx`)}>
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* KPIs — 2 rows */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Hallazgos" value={kpis.total} icon={<BarChart3 className="w-5 h-5" />} color="primary" delay={0} />
        <KpiCard label="Cerrados" value={kpis.closed} icon={<TrendingUp className="w-5 h-5" />} color="success" delay={75} />
        <KpiCard label="Tasa de Cierre" value={`${kpis.closureRate}%`} icon={<PieChart className="w-5 h-5" />} color="secondary" delay={150} />
        <KpiCard label="Días Prom. Resolución" value={kpis.avgDays} icon={<Clock className="w-5 h-5" />} color="warning" delay={225} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="No Conformidades" value={kpis.nc} icon={<AlertTriangle className="w-5 h-5" />} color="danger" delay={300} />
        <KpiCard label="Oportunidades Mejora" value={kpis.om} icon={<Target className="w-5 h-5" />} color="primary" delay={375} />
        <KpiCard label="Vencidos" value={kpis.overdue} icon={<Calendar className="w-5 h-5" />} color="danger" delay={450} />
        <KpiCard label="Impacto Riesgo" value={kpis.riskImpact} icon={<Layers className="w-5 h-5" />} color="warning" delay={525} />
      </div>

      {/* Evolution chart (full width) */}
      <div className="card p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <h3 className="text-sm font-bold text-slate-700 mb-1">Evolución Mensual de Hallazgos</h3>
        <p className="text-[11px] text-slate-400 mb-4">Tendencia de registros y cierres — Últimos 6 meses</p>
        <div className="h-[260px]">
          <Line data={trendData} options={lineOptions} />
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status distribution */}
        <div className="card p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Distribución por Estado</h3>
          <div className="h-[250px]">
            <Doughnut data={statusData} options={doughnutOptions} />
          </div>
        </div>

        {/* Priority distribution */}
        <div className="card p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Distribución por Prioridad</h3>
          <div className="h-[250px]">
            <Doughnut data={priorityData} options={doughnutOptions} />
          </div>
        </div>

        {/* Origin distribution */}
        <div className="card p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Distribución por Origen</h3>
          <div className="h-[250px]">
            <Doughnut data={originData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sector distribution (bar) */}
        <div className="card p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <h3 className="text-sm font-bold text-slate-700 mb-1">Top Sectores por Hallazgos</h3>
          <p className="text-[11px] text-slate-400 mb-4">Ranking de sectores con mayor cantidad de registros</p>
          <div className="h-[280px]">
            <Bar data={sectorData} options={barOptions} />
          </div>
        </div>

        {/* SLA Table */}
        <div className="card p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <h3 className="text-sm font-bold text-slate-700 mb-1">Cumplimiento de SLA por Etapa</h3>
          <p className="text-[11px] text-slate-400 mb-4">Plazos contractuales y porcentaje de cumplimiento</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Etapa</th>
                  <th className="text-center py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plazo</th>
                  <th className="text-center py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cumplimiento</th>
                  <th className="text-center py-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: '⚡ Acción Inmediata', plazo: '48 horas', cumplimiento: 92, estado: 'Óptimo', color: 'green' },
                  { label: '🔬 Análisis de Causa', plazo: '15 días', cumplimiento: 78, estado: 'Aceptable', color: 'amber' },
                  { label: '📝 Plan Correctivo', plazo: '10 días', cumplimiento: 85, estado: 'Óptimo', color: 'green' },
                  { label: '✅ Verificación', plazo: '7 días', cumplimiento: 95, estado: 'Óptimo', color: 'green' },
                  { label: '🎯 Efectividad', plazo: '1 mes', cumplimiento: 88, estado: 'Óptimo', color: 'green' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-700">{row.label}</td>
                    <td className="py-3 px-4 text-center text-slate-500">{row.plazo}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${row.color === 'green' ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${row.cumplimiento}%` }} />
                        </div>
                        <span className={`font-bold ${row.color === 'green' ? 'text-green-600' : 'text-amber-600'}`}>{row.cumplimiento}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center"><span className={`px-2 py-0.5 text-[9px] font-bold rounded-full bg-${row.color}-100 text-${row.color}-700`}>{row.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reincidence & Risk Matrix summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Índice de Reincidencia por Sector</h3>
          <div className="space-y-3">
            {[
              { sector: 'Esterilización', total: 4, reincidentes: 1, pct: 25 },
              { sector: 'Distribución', total: 3, reincidentes: 1, pct: 33 },
              { sector: 'Lavado', total: 3, reincidentes: 0, pct: 0 },
              { sector: 'Preparación', total: 2, reincidentes: 0, pct: 0 },
              { sector: 'Logística', total: 1, reincidentes: 0, pct: 0 },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600 w-28 truncate">{s.sector}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.pct > 20 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.max(s.pct, 3)}%` }} />
                </div>
                <span className={`text-xs font-bold min-w-[40px] text-right ${s.pct > 20 ? 'text-amber-600' : 'text-green-600'}`}>{s.pct}%</span>
                <span className="text-[10px] text-slate-400 min-w-[50px]">{s.reincidentes}/{s.total}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Resumen de Impacto en Matriz de Riesgo</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-red-600">{findings.filter(f => f.risk_matrix_impact && f.priority === 'red' && f.status !== 'closed').length}</p>
              <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider mt-1">Riesgo Alto Activo</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-amber-600">{findings.filter(f => f.risk_matrix_impact && f.priority === 'yellow' && f.status !== 'closed').length}</p>
              <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider mt-1">Riesgo Medio</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-green-600">{findings.filter(f => f.risk_matrix_impact && f.status === 'closed').length}</p>
              <p className="text-[9px] font-bold text-green-500 uppercase tracking-wider mt-1">Mitigados</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Los hallazgos con impacto en la matriz de riesgo son aquellos que, de no resolverse, podrían afectar la seguridad del paciente o la integridad del proceso de esterilización. El sistema los prioriza automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
