import { useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Download, FileSpreadsheet, Clock } from 'lucide-react';
import { KpiCard } from '../ui/KpiCard';
import { SECTORS, FINDING_STATUSES } from '../../constants';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useFindings } from '../../contexts/FindingsContext';
import { exportToPDF, exportToExcel } from '../../services/exportService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export function QualityMetrics() {
  const { findings } = useFindings();

  // ─── KPIs ───
  const kpis = useMemo(() => {
    const active = findings.filter(f => f.status !== 'discarded');
    const closed = active.filter(f => f.status === 'closed');
    const closureRate = active.length > 0 ? Math.round((closed.length / active.length) * 100) : 0;

    // Average resolution time (for closed items)
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

    return { total: active.length, closed: closed.length, closureRate, avgDays, overdue: overdue.length };
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-bio-primary">Métricas & Reportes</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Indicadores de gestión de calidad ISO 9001</p>
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

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Total Hallazgos" value={kpis.total} icon={<BarChart3 className="w-5 h-5" />} color="primary" delay={0} />
        <KpiCard label="Cerrados" value={kpis.closed} icon={<TrendingUp className="w-5 h-5" />} color="success" delay={75} />
        <KpiCard label="Tasa de Cierre" value={`${kpis.closureRate}%`} icon={<PieChart className="w-5 h-5" />} color="secondary" delay={150} />
        <KpiCard label="Días Prom. Resolución" value={kpis.avgDays} icon={<Clock className="w-5 h-5" />} color="warning" delay={225} />
        <KpiCard label="Vencidos" value={kpis.overdue} icon={<Calendar className="w-5 h-5" />} color="danger" delay={300} />
      </div>

      {/* Charts */}
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

        {/* Sector distribution */}
        <div className="card p-5 md:col-span-2 lg:col-span-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Hallazgos por Sector</h3>
          <div className="h-[250px]">
            <Bar data={sectorData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* SLA Table */}
      <div className="card p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Tiempos por Etapa (SLA)</h3>
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
              <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-700">⚡ Acción Inmediata</td>
                <td className="py-3 px-4 text-center text-slate-500">48 horas</td>
                <td className="py-3 px-4 text-center"><span className="font-bold text-green-600">92%</span></td>
                <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-green-100 text-green-700">Óptimo</span></td>
              </tr>
              <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-700">🔬 Análisis de Causa</td>
                <td className="py-3 px-4 text-center text-slate-500">15 días</td>
                <td className="py-3 px-4 text-center"><span className="font-bold text-amber-600">78%</span></td>
                <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 text-amber-700">Aceptable</span></td>
              </tr>
              <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-700">✅ Verificación</td>
                <td className="py-3 px-4 text-center text-slate-500">7 días</td>
                <td className="py-3 px-4 text-center"><span className="font-bold text-green-600">95%</span></td>
                <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-green-100 text-green-700">Óptimo</span></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-700">🎯 Efectividad</td>
                <td className="py-3 px-4 text-center text-slate-500">1 mes</td>
                <td className="py-3 px-4 text-center"><span className="font-bold text-green-600">88%</span></td>
                <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-green-100 text-green-700">Óptimo</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
