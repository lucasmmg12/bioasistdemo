// ─── Bio Asist — Core Types ───

export interface Finding {
  id: string;
  tracking_id: string;           // BA-2026-XXXX
  origin: FindingOrigin;
  type: FindingType;
  sede: Sede;
  sector: string;
  description: string;
  status: FindingStatus;
  priority: Priority;
  reporter_name: string;
  reporter_sector: string;
  assigned_to: Assignee[];

  // ── R GC 05 — Datos de Acción Correctiva ──
  ot_number?: string;                    // Orden de Trabajo
  institution?: string;                  // Institución/Hospital
  material?: string;                     // Material afectado
  remito_number?: string;                // N° de remito
  quantity_affected?: number;            // Cantidad afectada
  category?: string;                     // Categoría
  system_element?: string;               // Elemento del sistema de calidad
  bio_asist_sectors_involved?: string[]; // Sectores internos involucrados
  involved_operators?: string;           // Operarios involucrados
  sector_responsible?: string;           // Responsable del sector
  requirement_violated?: string;         // Requisito no cumplido

  // Etapas del ciclo ISO 9001
  immediate_action?: string;
  immediate_action_date?: string;
  immediate_action_by?: string;
  immediate_action_done_by?: string;     // Quién ejecutó la ACI
  immediate_action_done_date?: string;   // Cuándo se ejecutó
  requires_immediate_action?: boolean;   // ¿Corresponde ACI?
  immediate_action_closed?: boolean;     // Cierre ACI SI/NO

  root_cause?: string;
  root_cause_method?: RootCauseMethod;
  root_cause_date?: string;
  root_cause_by?: string;

  corrective_plan?: string;
  corrective_plan_date?: string;
  corrective_plan_by?: string;
  corrective_done_by?: string;           // Quién implementó la ACF
  corrective_done_date?: string;         // Cuándo se implementó
  corrective_evaluation?: CorrectiveEvaluation; // Evaluación del emisor

  verification_result?: string;
  verification_date?: string;
  verification_by?: string;
  verification_implemented?: boolean;    // IMPLEMENTADA / NO IMPLEMENTADA

  effectiveness_result?: string;
  effectiveness_date?: string;
  effectiveness_by?: string;
  effectiveness_effective?: boolean;     // ¿Es efectiva la ACF?
  new_nc_generated?: string;             // N° de nueva AC si se generó

  // Plazos
  deadline_immediate: string;     // +48h desde creación
  deadline_analysis: string;      // +15d desde creación
  deadline_verification?: string; // +7d post-cierre
  deadline_effectiveness?: string;// +1 mes post-cierre

  // Propagación y riesgo
  is_propagable: boolean;
  propagated_sectors: string[];
  risk_matrix_impact: boolean;

  // Evidencia
  evidence_urls: string[];
  resolution_evidence_urls: string[];

  // ── R GC 06 — Oportunidad de Mejora ──
  om_benefits?: string;                  // Beneficios que aporta la OM
  om_decision?: OmDecision;             // Aceptada / Rechazada
  om_rejection_reason?: string;          // Motivo de rechazo
  om_analyst?: string;                   // Responsable del análisis
  om_analysis_date?: string;             // Fecha de análisis

  // ── R GC 08 — Reclamo de Cliente ──
  claim_number?: string;                 // N° Reclamo
  client_sector?: string;                // Sector del cliente
  client_contact_name?: string;          // Nombre de contacto
  product_service?: string;              // Producto/Servicio entregado
  quantity_delivered?: number;            // Cantidad entregada
  quantity_objected?: number;            // Cantidad objetada
  claim_detection_method?: ClaimDetectionMethod;
  claim_is_pertinent?: boolean;          // ¿El reclamo es pertinente?
  claim_non_pertinent_reason?: string;   // Motivo de no pertinencia
  claim_commitment_date?: string;        // Fecha compromiso con cliente
  linked_ac_number?: string;             // N° de AC vinculada
  claim_communication_date?: string;     // Fecha comunicación con cliente
  claim_value_pesos?: number;            // Valor en pesos

  // Auditoría
  created_at: string;
  updated_at: string;
  notes: string; // Append-only log
}

export interface Assignee {
  id: string;
  name: string;
  sector: string;
  phone: string;
  responded: boolean;
  response_date?: string;
}

export type FindingStatus =
  | 'pending'
  | 'immediate_action'
  | 'root_cause_analysis'
  | 'corrective_plan'
  | 'verification'
  | 'effectiveness'
  | 'closed'
  | 'discarded';

export type FindingOrigin =
  | 'auditoria_interna'
  | 'auditoria_externa'
  | 'proceso'
  | '5s'
  | 'queja_cliente'
  | 'deteccion_espontanea'
  | 'reclamo_formal';

export type FindingType =
  | 'oportunidad_mejora'
  | 'no_conformidad'
  | 'evento_adverso'
  | 'cuasi_evento'
  | 'reclamo_cliente';

export type Sede = 'hospital' | 'planta';

export type Priority = 'green' | 'yellow' | 'red';

export type RootCauseMethod =
  | '5_porques'
  | 'ishikawa'
  | 'pareto'
  | 'otro';

export type CorrectiveEvaluation = 'satisfactoria' | 'requiere_info';

export type OmDecision = 'aceptada' | 'rechazada';

export type ClaimDetectionMethod =
  | 'redes'
  | 'presencial'
  | 'mail'
  | 'telefono'
  | 'whatsapp';

// ── Bio Asist Internal Sectors (for checkbox selection) ──
export const BIO_ASIST_SECTORS = [
  'Lavado de instrumental',
  'Esterilización',
  'Verificación',
  'Acondicionamiento',
  'Logística',
  'Lavandería',
] as const;

// ─── Logística ───

export interface LogisticsOrder {
  id: string;
  client_name: string;
  client_address: string;
  material_description: string;
  status: LogisticsStatus;
  driver: string;
  requested_at: string;
  pickup_at?: string;
  delivered_at?: string;
  notes?: string;
  priority: 'normal' | 'urgente';
}

export type LogisticsStatus =
  | 'solicitado'
  | 'en_ruta'
  | 'retirado'
  | 'en_planta'
  | 'procesado'
  | 'listo_entrega'
  | 'entregado';

// ─── Flota ───

export interface Vehicle {
  id: string;
  patente: string;
  model: string;
  year: number;
  km_actual: number;
  last_service_km: number;
  next_service_km: number;
  last_service_date: string;
  fuel_type: 'nafta' | 'diesel';
  status: 'activo' | 'en_taller' | 'inactivo';
  driver_assigned: string;
  fuel_log: FuelEntry[];
}

export interface FuelEntry {
  date: string;
  liters: number;
  km: number;
  cost: number;
}

// ─── Facturación ───

export interface BillingItem {
  id: string;
  client_name: string;
  service_description: string;
  quantity: number;
  unit_price: number;
  total: number;
  date: string;
  status: 'pendiente' | 'facturado' | 'cobrado';
  invoice_number?: string;
}

// ─── UI Types ───

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

export interface MockUser {
  id: string;
  name: string;
  role: 'admin' | 'responsable' | 'operario';
  sector: string;
  avatar?: string;
}
