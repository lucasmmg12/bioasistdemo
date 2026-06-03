export const SECTORS = [
  { value: 'lavado', label: 'Lavado' },
  { value: 'esterilizacion', label: 'Esterilización' },
  { value: 'preparacion', label: 'Preparación y Armado' },
  { value: 'distribucion', label: 'Distribución y Despacho' },
  { value: 'recepcion', label: 'Recepción de Material' },
  { value: 'control_calidad', label: 'Control de Calidad' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'logistica', label: 'Logística y Transporte' },
  { value: 'administracion', label: 'Administración' },
  { value: 'rrhh', label: 'Recursos Humanos' },
  { value: 'deposito', label: 'Depósito y Almacén' },
  { value: 'direccion', label: 'Dirección' },
] as const;

export const FINDING_ORIGINS = [
  { value: 'auditoria_interna', label: 'Auditoría Interna', icon: '🔍' },
  { value: 'auditoria_externa', label: 'Auditoría Externa', icon: '📋' },
  { value: 'proceso', label: 'Proceso', icon: '⚙️' },
  { value: '5s', label: '5S', icon: '🏷️' },
  { value: 'queja_cliente', label: 'Queja de Cliente', icon: '📞' },
  { value: 'deteccion_espontanea', label: 'Detección Espontánea', icon: '👁️' },
] as const;

export const FINDING_TYPES = [
  { value: 'oportunidad_mejora', label: 'Oportunidad de Mejora', color: 'blue' },
  { value: 'no_conformidad', label: 'No Conformidad', color: 'red' },
  { value: 'evento_adverso', label: 'Evento Adverso', color: 'red' },
  { value: 'cuasi_evento', label: 'Cuasi Evento', color: 'amber' },
] as const;

export const FINDING_STATUSES = [
  { value: 'pending', label: 'Pendiente', color: 'slate', step: 0 },
  { value: 'immediate_action', label: 'Acción Inmediata', color: 'blue', step: 1 },
  { value: 'root_cause_analysis', label: 'Análisis de Causa', color: 'amber', step: 2 },
  { value: 'corrective_plan', label: 'Plan Correctivo', color: 'purple', step: 3 },
  { value: 'verification', label: 'Verificación', color: 'teal', step: 4 },
  { value: 'effectiveness', label: 'Efectividad', color: 'emerald', step: 5 },
  { value: 'closed', label: 'Cerrado', color: 'green', step: 6 },
  { value: 'discarded', label: 'Descartado', color: 'gray', step: -1 },
] as const;

export const SEDES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'planta', label: 'Planta de Procesamiento' },
] as const;

export const ROOT_CAUSE_METHODS = [
  { value: '5_porques', label: '5 Porqués' },
  { value: 'ishikawa', label: 'Diagrama de Ishikawa' },
  { value: 'pareto', label: 'Diagrama de Pareto' },
  { value: 'otro', label: 'Otro método' },
] as const;

export const PRIORITIES = [
  { value: 'green', label: 'Baja', color: '#10B981' },
  { value: 'yellow', label: 'Media', color: '#F59E0B' },
  { value: 'red', label: 'Alta', color: '#EF4444' },
] as const;

export const LOGISTICS_STATUSES = [
  { value: 'solicitado', label: 'Solicitado', color: 'slate' },
  { value: 'en_ruta', label: 'En Ruta', color: 'blue' },
  { value: 'retirado', label: 'Retirado', color: 'amber' },
  { value: 'en_planta', label: 'En Planta', color: 'purple' },
  { value: 'procesado', label: 'Procesado', color: 'teal' },
  { value: 'listo_entrega', label: 'Listo para Entrega', color: 'emerald' },
  { value: 'entregado', label: 'Entregado', color: 'green' },
] as const;
