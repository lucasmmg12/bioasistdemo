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

  // Etapas del ciclo ISO 9001
  immediate_action?: string;
  immediate_action_date?: string;
  immediate_action_by?: string;
  root_cause?: string;
  root_cause_method?: RootCauseMethod;
  root_cause_date?: string;
  root_cause_by?: string;
  corrective_plan?: string;
  corrective_plan_date?: string;
  corrective_plan_by?: string;
  verification_result?: string;
  verification_date?: string;
  verification_by?: string;
  effectiveness_result?: string;
  effectiveness_date?: string;
  effectiveness_by?: string;

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
  | 'deteccion_espontanea';

export type FindingType =
  | 'oportunidad_mejora'
  | 'no_conformidad'
  | 'evento_adverso'
  | 'cuasi_evento';

export type Sede = 'hospital' | 'planta';

export type Priority = 'green' | 'yellow' | 'red';

export type RootCauseMethod =
  | '5_porques'
  | 'ishikawa'
  | 'pareto'
  | 'otro';

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
