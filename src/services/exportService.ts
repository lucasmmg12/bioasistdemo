/**
 * Export Service — PDF & Excel generation for Bio Asist reports
 * Uses jsPDF + AutoTable for PDF, and SheetJS (xlsx) for Excel
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Finding } from '../types';
import { SECTORS } from '../constants';

// ─── Helpers ───

const getSectorLabel = (value: string) =>
  SECTORS.find(s => s.value === value)?.label || value;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  immediate_action: 'Acción Inmediata',
  root_cause_analysis: 'Análisis de Causa',
  corrective_plan: 'Plan Correctivo',
  verification: 'Verificación',
  effectiveness: 'Efectividad',
  closed: 'Cerrado',
  discarded: 'Descartado',
};

const PRIORITY_LABELS: Record<string, string> = {
  red: 'Alta',
  yellow: 'Media',
  green: 'Baja',
};

const TYPE_LABELS: Record<string, string> = {
  no_conformidad: 'No Conformidad',
  oportunidad_mejora: 'Oportunidad de Mejora',
  evento_adverso: 'Evento Adverso',
  cuasi_evento: 'Cuasi Evento',
};

const ORIGIN_LABELS: Record<string, string> = {
  auditoria_interna: 'Auditoría Interna',
  auditoria_externa: 'Auditoría Externa',
  proceso: 'Proceso',
  '5s': '5S',
  queja_cliente: 'Queja de Cliente',
  deteccion_espontanea: 'Detección Espontánea',
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// ─── Finding → Row data ───

function findingToRow(f: Finding) {
  return {
    id: f.tracking_id,
    fecha: formatDate(f.created_at),
    tipo: TYPE_LABELS[f.type] || f.type,
    origen: ORIGIN_LABELS[f.origin] || f.origin,
    sede: f.sede === 'hospital' ? 'Hospital' : 'Planta',
    sector: getSectorLabel(f.sector),
    descripcion: f.description,
    prioridad: PRIORITY_LABELS[f.priority] || f.priority,
    estado: STATUS_LABELS[f.status] || f.status,
    reportado_por: f.reporter_name,
    asignados: f.assigned_to.map(a => a.name).join(', ') || 'Sin asignar',
    accion_inmediata: f.immediate_action || '—',
    causa_raiz: f.root_cause || '—',
    plan_correctivo: f.corrective_plan || '—',
    verificacion: f.verification_result || '—',
    efectividad: f.effectiveness_result || '—',
    plazo_inmediata: formatDate(f.deadline_immediate),
    plazo_analisis: formatDate(f.deadline_analysis),
  };
}

// ═══════════════════════════════════════════════
// EXCEL EXPORT
// ═══════════════════════════════════════════════

export function exportToExcel(findings: Finding[], filename?: string) {
  const rows = findings.map(findingToRow);

  // Create headers mapping
  const headers = [
    'ID', 'Fecha', 'Tipo', 'Origen', 'Sede', 'Sector', 'Descripción',
    'Prioridad', 'Estado', 'Reportado Por', 'Asignados',
    'Acción Inmediata', 'Causa Raíz', 'Plan Correctivo',
    'Verificación', 'Efectividad', 'Plazo Inmediata', 'Plazo Análisis',
  ];

  const data = rows.map(r => [
    r.id, r.fecha, r.tipo, r.origen, r.sede, r.sector, r.descripcion,
    r.prioridad, r.estado, r.reportado_por, r.asignados,
    r.accion_inmediata, r.causa_raiz, r.plan_correctivo,
    r.verificacion, r.efectividad, r.plazo_inmediata, r.plazo_analisis,
  ]);

  // Create workbook
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Set column widths
  ws['!cols'] = [
    { wch: 16 }, // ID
    { wch: 12 }, // Fecha
    { wch: 18 }, // Tipo
    { wch: 18 }, // Origen
    { wch: 10 }, // Sede
    { wch: 18 }, // Sector
    { wch: 50 }, // Descripción
    { wch: 10 }, // Prioridad
    { wch: 18 }, // Estado
    { wch: 20 }, // Reportado Por
    { wch: 25 }, // Asignados
    { wch: 40 }, // Acción Inmediata
    { wch: 40 }, // Causa Raíz
    { wch: 40 }, // Plan Correctivo
    { wch: 40 }, // Verificación
    { wch: 40 }, // Efectividad
    { wch: 12 }, // Plazo Inmediata
    { wch: 12 }, // Plazo Análisis
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Hallazgos');

  // Summary sheet
  const summaryData = [
    ['REPORTE DE HALLAZGOS — BIO ASIST'],
    [],
    ['Fecha de generación', new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
    ['Total de hallazgos', findings.length.toString()],
    [],
    ['RESUMEN POR ESTADO'],
    ...Object.entries(STATUS_LABELS).map(([key, label]) => [
      label,
      findings.filter(f => f.status === key).length.toString(),
    ]),
    [],
    ['RESUMEN POR PRIORIDAD'],
    ['Alta (Roja)', findings.filter(f => f.priority === 'red').length.toString()],
    ['Media (Amarilla)', findings.filter(f => f.priority === 'yellow').length.toString()],
    ['Baja (Verde)', findings.filter(f => f.priority === 'green').length.toString()],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

  // Download
  const name = filename || `Hallazgos_BioAsist_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, name);
}

// ═══════════════════════════════════════════════
// PDF EXPORT
// ═══════════════════════════════════════════════

export function exportToPDF(findings: Finding[], filename?: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ── Cover / Header ──
  // Dark header bar
  doc.setFillColor(0, 59, 92); // bio-primary
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent line
  doc.setFillColor(0, 168, 157); // bio-secondary
  doc.rect(0, 38, pageWidth, 2, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE HALLAZGOS', 15, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Bio Asist — Sistema de Gestión de Calidad ISO 9001', 15, 26);

  // Date (right aligned)
  doc.setFontSize(9);
  const dateStr = new Date().toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  doc.text(`Generado: ${dateStr}`, pageWidth - 15, 18, { align: 'right' });
  doc.text(`Total: ${findings.length} hallazgos`, pageWidth - 15, 26, { align: 'right' });

  // ── Summary KPIs ──
  const kpiY = 46;
  const kpiWidth = (pageWidth - 30 - 16) / 5; // 5 KPIs

  const kpis = [
    { label: 'Total Activos', value: findings.filter(f => f.status !== 'discarded').length, color: [0, 59, 92] as [number, number, number] },
    { label: 'Pendientes', value: findings.filter(f => f.status === 'pending').length, color: [245, 158, 11] as [number, number, number] },
    { label: 'En Proceso', value: findings.filter(f => !['pending', 'closed', 'discarded'].includes(f.status)).length, color: [0, 168, 157] as [number, number, number] },
    { label: 'Vencidos', value: findings.filter(f => {
      if (f.status === 'closed' || f.status === 'discarded') return false;
      const dl = f.status === 'immediate_action' ? f.deadline_immediate : f.deadline_analysis;
      return dl && new Date(dl) < new Date();
    }).length, color: [239, 68, 68] as [number, number, number] },
    { label: 'Cerrados', value: findings.filter(f => f.status === 'closed').length, color: [34, 197, 94] as [number, number, number] },
  ];

  kpis.forEach((kpi, i) => {
    const x = 15 + i * (kpiWidth + 4);

    // Card background
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, kpiY, kpiWidth, 20, 2, 2, 'F');

    // Left accent bar
    doc.setFillColor(...kpi.color);
    doc.rect(x, kpiY, 2, 20, 'F');

    // Value
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value.toString(), x + 8, kpiY + 12);

    // Label
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 8, kpiY + 17);
  });

  // ── Main Table ──
  const tableRows = findings
    .filter(f => f.status !== 'discarded')
    .map(f => [
      f.tracking_id,
      formatDate(f.created_at),
      TYPE_LABELS[f.type] || f.type,
      PRIORITY_LABELS[f.priority] || f.priority,
      STATUS_LABELS[f.status] || f.status,
      `${f.sede === 'hospital' ? 'H' : 'P'} / ${getSectorLabel(f.sector)}`,
      f.description.length > 80 ? f.description.substring(0, 80) + '...' : f.description,
      f.assigned_to.map(a => a.name).join(', ') || '—',
    ]);

  autoTable(doc, {
    startY: 72,
    head: [['ID', 'Fecha', 'Tipo', 'Prioridad', 'Estado', 'Sede / Sector', 'Descripción', 'Asignados']],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      textColor: [30, 41, 59],
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [0, 59, 92],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: 'bold', textColor: [0, 59, 92] },
      1: { cellWidth: 20 },
      2: { cellWidth: 28 },
      3: { cellWidth: 18 },
      4: { cellWidth: 24 },
      5: { cellWidth: 30 },
      6: { cellWidth: 'auto' },
      7: { cellWidth: 30 },
    },
    didParseCell: (data) => {
      // Color priority cells
      if (data.column.index === 3 && data.section === 'body') {
        const val = data.cell.raw as string;
        if (val === 'Alta') {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'Media') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [22, 163, 74];
        }
      }
      // Color status cells
      if (data.column.index === 4 && data.section === 'body') {
        const val = data.cell.raw as string;
        if (val === 'Cerrado') {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'Pendiente') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    didDrawPage: () => {
      // Footer on every page
      const footY = pageHeight - 8;
      doc.setFillColor(248, 250, 252);
      doc.rect(0, footY - 4, pageWidth, 12, 'F');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text('Bio Asist — Ecosistema Digital de Gestión | Desarrollado por Grow Labs', 15, footY);
      doc.text(
        `Página ${doc.getCurrentPageInfo().pageNumber}`,
        pageWidth - 15,
        footY,
        { align: 'right' }
      );
    },
  });

  // ── Save ──
  const name = filename || `Hallazgos_BioAsist_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(name);
}
