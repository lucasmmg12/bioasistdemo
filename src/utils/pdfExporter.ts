import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Finding } from '../types';

// ── Color constants ──
const PRIMARY = [0, 59, 92] as const;    // #003B5C
const ACCENT = [16, 185, 129] as const;  // #10B981
const GRAY = [100, 116, 139] as const;
const LIGHT_GRAY = [226, 232, 240] as const;
const WHITE = [255, 255, 255] as const;


// ── Helper functions ──
function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function addHeader(doc: jsPDF, title: string, code: string, trackingId: string) {
  // Background bar
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 210, 28, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...WHITE);
  doc.text('BIO ASIST', 14, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Ecosistema Digital de Gestión de Calidad', 14, 18);

  // Code
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(code, 196, 12, { align: 'right' });

  // Tracking ID
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(trackingId, 196, 18, { align: 'right' });

  // Title bar
  doc.setFillColor(...ACCENT);
  doc.rect(0, 28, 210, 10, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text(title, 105, 35, { align: 'center' });

  return 42; // Next Y position
}

function addSectionTitle(doc: jsPDF, y: number, title: string): number {
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFillColor(...PRIMARY);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text(title, 16, y + 5);
  return y + 10;
}

function addField(doc: jsPDF, y: number, label: string, value: string, width = 182): number {
  if (y > 270) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(label.toUpperCase(), 16, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  const lines = doc.splitTextToSize(value || '—', width - 4);
  doc.text(lines, 16, y + 5);

  return y + 5 + (lines.length * 4) + 3;
}

function addFieldRow(doc: jsPDF, y: number, fields: { label: string; value: string }[]): number {
  if (y > 270) { doc.addPage(); y = 20; }
  const colWidth = 182 / fields.length;

  fields.forEach((f, i) => {
    const x = 14 + i * colWidth;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(f.label.toUpperCase(), x + 2, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(f.value || '—', x + 2, y + 5);
  });

  return y + 12;
}

function addCheckbox(doc: jsPDF, y: number, label: string, checked: boolean, x = 16): number {
  doc.setDrawColor(...GRAY);
  doc.rect(x, y - 3, 3.5, 3.5);
  if (checked) {
    doc.setFillColor(...ACCENT);
    doc.rect(x + 0.5, y - 2.5, 2.5, 2.5, 'F');
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(label, x + 5, y);
  return y;
}

function addFooter(doc: jsPDF) {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(`Generado por Bio Asist — ${formatDateTime(new Date().toISOString())}`, 14, 290);
    doc.text(`Página ${i} de ${totalPages}`, 196, 290, { align: 'right' });
    doc.setDrawColor(...LIGHT_GRAY);
    doc.line(14, 287, 196, 287);
  }
}

// ═══════════════════════════════════════
// R GC 05-1 — ACCIONES CORRECTIVAS
// ═══════════════════════════════════════
export function exportAC(finding: Finding): void {
  const doc = new jsPDF();
  let y = addHeader(doc, 'REGISTRO DE ACCIONES CORRECTIVAS', 'R GC 05-1', finding.tracking_id);

  // ── Datos generales ──
  y = addSectionTitle(doc, y, 'DATOS GENERALES');
  y = addFieldRow(doc, y, [
    { label: 'AC N°', value: finding.tracking_id },
    { label: 'Fecha', value: formatDate(finding.created_at) },
    { label: 'OT', value: finding.ot_number || '—' },
    { label: 'Origen', value: finding.origin.replace(/_/g, ' ').toUpperCase() },
  ]);
  y = addFieldRow(doc, y, [
    { label: 'Institución / Hospital', value: finding.institution || '—' },
    { label: 'Sector', value: finding.sector },
    { label: 'Material', value: finding.material || '—' },
  ]);
  y = addFieldRow(doc, y, [
    { label: 'Detectado por', value: finding.reporter_name },
    { label: 'Remito', value: finding.remito_number || '—' },
    { label: 'Cantidad', value: finding.quantity_affected?.toString() || '—' },
    { label: 'Categoría', value: finding.category || '—' },
  ]);
  y = addField(doc, y, 'Elemento del sistema', finding.system_element || '—');
  y = addField(doc, y, 'Requisito no cumplido', finding.requirement_violated || '—');

  // Sectors involved
  y = addSectionTitle(doc, y, 'SECTORES INVOLUCRADOS DE BIO ASIST');
  const sectors = ['Lavado de instrumental', 'Esterilización', 'Verificación', 'Acondicionamiento', 'Logística', 'Lavandería'];
  let sx = 16;
  sectors.forEach((s, i) => {
    const checked = finding.bio_asist_sectors_involved?.includes(s) || false;
    addCheckbox(doc, y, s, checked, sx);
    sx += 30;
    if (i === 2) { sx = 16; y += 7; }
  });
  y += 10;

  y = addFieldRow(doc, y, [
    { label: 'Operarios involucrados', value: finding.involved_operators || '—' },
    { label: 'Responsable del sector', value: finding.sector_responsible || '—' },
  ]);

  // ── Descripción ──
  y = addSectionTitle(doc, y, 'DESCRIPCIÓN DE LA NO CONFORMIDAD');
  y = addField(doc, y, '', finding.description);

  // ── ACI ──
  y = addSectionTitle(doc, y, 'ACCIÓN CORRECTIVA INMEDIATA (Tiempo máximo: 48hs)');
  y = addField(doc, y, '', finding.immediate_action || 'Sin registrar');
  y = addFieldRow(doc, y, [
    { label: 'Responsable implementación', value: finding.immediate_action_by || '—' },
    { label: 'Fecha compromiso', value: formatDate(finding.deadline_immediate) },
    { label: 'Realizado por', value: finding.immediate_action_done_by || '—' },
    { label: 'Fecha', value: formatDate(finding.immediate_action_done_date) },
  ]);

  // ── Análisis de causas ──
  y = addSectionTitle(doc, y, 'ANÁLISIS DE CAUSAS (Tiempo máximo: 15 días)');
  y = addField(doc, y, `Método: ${finding.root_cause_method?.replace(/_/g, ' ').toUpperCase() || '—'}`, finding.root_cause || 'Sin registrar');

  // ── ACF ──
  y = addSectionTitle(doc, y, 'PROPUESTA DE ACCIÓN CORRECTIVA DE FONDO');
  y = addField(doc, y, '', finding.corrective_plan || 'Sin registrar');
  y = addFieldRow(doc, y, [
    { label: 'Responsable implementación', value: finding.corrective_plan_by || '—' },
    { label: 'Fecha compromiso', value: formatDate(finding.corrective_plan_date) },
    { label: 'Realizado por', value: finding.corrective_done_by || '—' },
    { label: 'Fecha', value: formatDate(finding.corrective_done_date) },
  ]);

  // Evaluation
  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('ACCIONES CONSIDERADAS POR EL EMISOR:', 16, y);
  y += 5;
  addCheckbox(doc, y, 'SATISFACTORIAS', finding.corrective_evaluation === 'satisfactoria', 16);
  addCheckbox(doc, y, 'SE REQUIERE INFORMACIÓN ADICIONAL', finding.corrective_evaluation === 'requiere_info', 60);
  y += 8;

  // ── Verificación ──
  y = addSectionTitle(doc, y, 'VERIFICACIÓN DE LA IMPLEMENTACIÓN (7 días post compromiso)');
  y = addField(doc, y, '', finding.verification_result || 'Sin registrar');
  y += 2;
  addCheckbox(doc, y, 'IMPLEMENTADAS', finding.verification_implemented === true, 16);
  addCheckbox(doc, y, 'NO IMPLEMENTADAS', finding.verification_implemented === false, 60);
  y += 8;

  // ── Efectividad ──
  y = addSectionTitle(doc, y, 'VERIFICACIÓN DE LA EFECTIVIDAD');
  y = addField(doc, y, '', finding.effectiveness_result || 'Sin registrar');
  y += 2;
  addCheckbox(doc, y, 'ACCIONES CORRECTIVAS EFECTIVAS', finding.effectiveness_effective === true, 16);
  addCheckbox(doc, y, 'SE ORIGINÓ NUEVO RNC', !!finding.new_nc_generated, 80);
  y += 8;

  // ── Propagación y Riesgo ──
  y = addSectionTitle(doc, y, 'PROPAGACIÓN Y RIESGO');
  addCheckbox(doc, y, `¿ACTUALIZAR MATRIZ DE RIESGOS? — ${finding.risk_matrix_impact ? 'SÍ' : 'NO'}`, finding.risk_matrix_impact, 16);
  y += 7;
  addCheckbox(doc, y, `¿PROPAGAR MEJORA? — ${finding.is_propagable ? 'SÍ' : 'NO'}`, finding.is_propagable, 16);
  if (finding.is_propagable && finding.propagated_sectors.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Sectores: ${finding.propagated_sectors.join(', ')}`, 60, y);
  }

  addFooter(doc);
  doc.save(`${finding.tracking_id}_Accion_Correctiva.pdf`);
}

// ═══════════════════════════════════════
// R GC 06-0 — OPORTUNIDAD DE MEJORA
// ═══════════════════════════════════════
export function exportOM(finding: Finding): void {
  const doc = new jsPDF();
  let y = addHeader(doc, 'OPORTUNIDAD DE MEJORA', 'R GC 06-0', finding.tracking_id);

  y = addSectionTitle(doc, y, 'DATOS GENERALES');
  y = addFieldRow(doc, y, [
    { label: 'N° de OM', value: finding.tracking_id },
    { label: 'Fecha', value: formatDate(finding.created_at) },
    { label: 'Sector', value: finding.sector },
    { label: 'Origen', value: finding.origin.replace(/_/g, ' ').toUpperCase() },
  ]);
  y = addFieldRow(doc, y, [
    { label: 'Elemento del Sistema', value: finding.system_element || '—' },
    { label: 'Proponente', value: finding.reporter_name },
    { label: 'Responsable del sector', value: finding.sector_responsible || '—' },
  ]);

  y = addSectionTitle(doc, y, 'DESCRIPCIÓN DE LA OPORTUNIDAD DE MEJORA');
  y = addField(doc, y, '', finding.description);

  y = addSectionTitle(doc, y, 'BENEFICIOS QUE APORTA LA OM');
  y = addField(doc, y, '', finding.om_benefits || 'Sin registrar');

  y = addSectionTitle(doc, y, 'EVALUACIÓN DE LA OM');
  addCheckbox(doc, y, 'ACEPTADA', finding.om_decision === 'aceptada', 16);
  addCheckbox(doc, y, 'RECHAZADA', finding.om_decision === 'rechazada', 50);
  y += 8;
  if (finding.om_decision === 'rechazada') {
    y = addField(doc, y, 'Motivo de rechazo', finding.om_rejection_reason || '—');
  }

  y = addFieldRow(doc, y, [
    { label: 'Responsable del análisis', value: finding.om_analyst || '—' },
    { label: 'Fecha de análisis', value: formatDate(finding.om_analysis_date) },
  ]);

  y = addFieldRow(doc, y, [
    { label: 'Responsable de implementación', value: finding.corrective_plan_by || '—' },
    { label: 'Fecha compromiso', value: formatDate(finding.corrective_plan_date) },
  ]);

  y = addSectionTitle(doc, y, 'VERIFICACIÓN DE LA IMPLEMENTACIÓN');
  y = addField(doc, y, '', finding.verification_result || 'Sin registrar');
  addCheckbox(doc, y, 'IMPLEMENTADA', finding.verification_implemented === true, 16);
  addCheckbox(doc, y, 'NO IMPLEMENTADA', finding.verification_implemented === false, 60);
  y += 8;

  y = addSectionTitle(doc, y, 'PROPAGACIÓN');
  addCheckbox(doc, y, `¿PROPAGAR MEJORA? — ${finding.is_propagable ? 'SÍ' : 'NO'}`, finding.is_propagable, 16);
  if (finding.is_propagable) {
    y += 5;
    y = addField(doc, y, 'Sectores', finding.propagated_sectors.join(', '));
  }

  addFooter(doc);
  doc.save(`${finding.tracking_id}_Oportunidad_Mejora.pdf`);
}

// ═══════════════════════════════════════
// R GC 08-1 — GESTIÓN DE RECLAMOS
// ═══════════════════════════════════════
export function exportReclamo(finding: Finding): void {
  const doc = new jsPDF('l'); // Landscape
  let y = addHeader(doc, 'GESTIÓN DE RECLAMOS DE CLIENTES', 'R GC 08-1', finding.tracking_id);

  // Use a table for the reclamo data
  autoTable(doc, {
    startY: y,
    head: [[
      'N° Reclamo', 'Fecha', 'Cliente', 'Contacto', 'Producto/Servicio',
      'OT', 'Remito', 'Cant. Entregada', 'Cant. Objetada', 'Detección',
    ]],
    body: [[
      finding.claim_number || '—',
      formatDate(finding.created_at),
      finding.institution || '—',
      finding.client_contact_name || '—',
      finding.product_service || '—',
      finding.ot_number || '—',
      finding.remito_number || '—',
      finding.quantity_delivered?.toString() || '—',
      finding.quantity_objected?.toString() || '—',
      finding.claim_detection_method || '—',
    ]],
    theme: 'grid',
    headStyles: { fillColor: [...PRIMARY], fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 5;

  // Description + resolution
  autoTable(doc, {
    startY: y,
    head: [['Descripción del Reclamo', '¿Pertinente?', 'Acción tomada', 'N° AC', 'Valor ($)', 'Estado']],
    body: [[
      finding.description,
      finding.claim_is_pertinent ? 'SÍ' : 'NO',
      finding.immediate_action || '—',
      finding.linked_ac_number || '—',
      finding.claim_value_pesos?.toLocaleString('es-AR') || '—',
      finding.status === 'closed' ? 'Cerrada' : 'Abierta',
    ]],
    theme: 'grid',
    headStyles: { fillColor: [...PRIMARY], fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
    columnStyles: { 0: { cellWidth: 80 } },
  });

  addFooter(doc);
  doc.save(`${finding.tracking_id}_Reclamo_Cliente.pdf`);
}

// ═══════════════════════════════════════
// R GC 07-0 — SEGUIMIENTO DE AC y OM
// ═══════════════════════════════════════
export function exportSeguimiento(findings: Finding[]): void {
  const doc = new jsPDF('l'); // Landscape

  // Header
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 297, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...WHITE);
  doc.text('BIO ASIST — PLANILLA DE SEGUIMIENTO DE AC/OM', 148, 10, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('R GC 07-0', 287, 10, { align: 'right' });
  doc.text(`Generado: ${formatDateTime(new Date().toISOString())}`, 148, 17, { align: 'center' });

  const originMap: Record<string, string> = {
    auditoria_interna: 'AI',
    auditoria_externa: 'AE',
    proceso: 'E',
    '5s': '5S',
    queja_cliente: 'Q',
    deteccion_espontanea: 'E',
    reclamo_formal: 'REC',
  };

  const tableData = findings.map(f => [
    f.type === 'oportunidad_mejora' ? 'OM' : f.type === 'reclamo_cliente' ? 'REC' : 'AC',
    f.tracking_id,
    formatDate(f.created_at),
    originMap[f.origin] || f.origin,
    f.reporter_sector,
    f.description.substring(0, 60) + (f.description.length > 60 ? '...' : ''),
    f.sector_responsible || '—',
    f.requires_immediate_action !== false ? 'SÍ' : 'NO',
    f.immediate_action ? f.immediate_action.substring(0, 40) + '...' : '—',
    formatDate(f.deadline_immediate),
    f.immediate_action_closed ? 'SÍ' : 'NO',
    formatDate(f.root_cause_date),
    f.corrective_plan ? f.corrective_plan.substring(0, 40) + '...' : '—',
    formatDate(f.corrective_plan_date),
    f.corrective_plan_by || '—',
    f.verification_implemented ? 'SÍ' : 'NO',
    f.effectiveness_effective ? 'SÍ' : 'NO',
    f.new_nc_generated ? 'SÍ' : 'NO',
    f.status === 'closed' ? 'SÍ' : 'NO',
  ]);

  autoTable(doc, {
    startY: 26,
    head: [[
      'Tipo', 'N°', 'Fecha', 'Det.', 'Sector', 'Descripción', 'Resp.',
      'ACI?', 'Resp. ACI', 'F.Comp ACI', 'Cierre ACI',
      'F.Análisis', 'Resp. ACF', 'F.Comp ACF', 'Resp. Impl.',
      'Impl?', 'Efect?', 'Nueva AC?', 'Cierre',
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [...PRIMARY], fontSize: 5.5, fontStyle: 'bold', halign: 'center', cellPadding: 1.5 },
    bodyStyles: { fontSize: 5.5, cellPadding: 1.5 },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 18 },
      2: { cellWidth: 14 },
      3: { cellWidth: 8 },
      4: { cellWidth: 14 },
      5: { cellWidth: 35 },
      6: { cellWidth: 14 },
    },
    margin: { left: 5, right: 5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6);
    doc.setTextColor(...GRAY);
    doc.text(`Generado por Bio Asist — Grow Labs`, 5, 205);
    doc.text(`Página ${i} de ${totalPages}`, 292, 205, { align: 'right' });
  }

  doc.save(`Seguimiento_AC_OM_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ═══════════════════════════════════════
// SMART EXPORT — Auto-detect type
// ═══════════════════════════════════════
export function exportFindingPDF(finding: Finding): void {
  switch (finding.type) {
    case 'no_conformidad':
    case 'evento_adverso':
    case 'cuasi_evento':
      exportAC(finding);
      break;
    case 'oportunidad_mejora':
      exportOM(finding);
      break;
    case 'reclamo_cliente':
      exportReclamo(finding);
      break;
    default:
      exportAC(finding);
  }
}
