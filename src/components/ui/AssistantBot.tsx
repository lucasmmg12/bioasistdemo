import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  GraduationCap,
  HelpCircle,
  Shield,
  Truck,
  Car,
  Receipt,
  BarChart3,
  MessageCircle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Play,
  RotateCcw,
  Zap,
  BookOpen,
  Target,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ═══════════════════════════════════════════════
// KNOWLEDGE BASE — Respuestas del Asistente
// ═══════════════════════════════════════════════

interface KnowledgeEntry {
  keywords: string[];
  answer: string;
  relatedModule?: string;
  followUp?: string[];
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ['hallazgo', 'crear hallazgo', 'nuevo hallazgo', 'registrar hallazgo', 'cargar hallazgo'],
    answer: 'Para crear un nuevo hallazgo, andá al módulo **Calidad** y presioná el botón **"+ Nuevo Hallazgo"**. Completá el formulario con el origen (auditoría, proceso, 5S, queja de cliente), tipo, sede, sector y descripción detallada. El sistema asignará automáticamente un código de seguimiento BA-2026-XXXX.',
    relatedModule: '/calidad/nuevo',
    followUp: ['¿Qué tipos de hallazgo existen?', '¿Cómo se asigna prioridad?'],
  },
  {
    keywords: ['calidad', 'gestion calidad', 'iso', 'hallazgos'],
    answer: 'El módulo de **Calidad** gestiona el ciclo completo ISO 9001 de hallazgos. Incluye: registro de no conformidades, oportunidades de mejora, cuasi eventos y eventos adversos. Cada hallazgo pasa por etapas: **Pendiente → Acción Inmediata → Análisis de Causa → Plan Correctivo → Verificación → Efectividad → Cerrado**.',
    relatedModule: '/calidad',
    followUp: ['¿Cómo funciona el ciclo de calidad?', '¿Qué es una no conformidad?'],
  },
  {
    keywords: ['tipo', 'tipos hallazgo', 'no conformidad', 'oportunidad mejora', 'cuasi evento', 'evento adverso'],
    answer: 'Existen 4 tipos de hallazgo:\n\n• **No Conformidad**: Incumplimiento de un requisito (requiere acción correctiva obligatoria)\n• **Oportunidad de Mejora**: Sugerencia para mejorar un proceso\n• **Cuasi Evento**: Situación que casi generó un problema pero se detectó a tiempo\n• **Evento Adverso**: Incidente que causó un impacto real',
    relatedModule: '/calidad',
  },
  {
    keywords: ['prioridad', 'rojo', 'amarillo', 'verde', 'urgente', 'urgencia'],
    answer: 'Las prioridades se asignan por colores:\n\n🔴 **Roja**: Crítica — Requiere acción inmediata (48hs). Impacto en seguridad del paciente o proceso.\n🟡 **Amarilla**: Media — Requiere seguimiento activo. Afecta la eficiencia pero no la seguridad.\n🟢 **Verde**: Baja — Mejora continua. Sin impacto inmediato en operaciones.',
  },
  {
    keywords: ['etapa', 'ciclo', 'estado', 'pendiente', 'accion inmediata', 'causa raiz', 'verificacion', 'efectividad'],
    answer: 'El ciclo de un hallazgo tiene 7 etapas:\n\n1️⃣ **Pendiente**: Recién creado, sin asignar\n2️⃣ **Acción Inmediata**: Se toman medidas de contención (plazo: 48hs)\n3️⃣ **Análisis de Causa**: Investigación con Ishikawa o 5 Porqués (plazo: 15 días)\n4️⃣ **Plan Correctivo**: Se define la solución definitiva\n5️⃣ **Verificación**: Calidad verifica que las acciones se implementaron\n6️⃣ **Efectividad**: Se confirma que la solución funciona a largo plazo\n7️⃣ **Cerrado**: Hallazgo resuelto exitosamente',
    relatedModule: '/calidad',
  },
  {
    keywords: ['logistica', 'pedido', 'pedidos', 'retiro', 'entrega', 'envio', 'material'],
    answer: 'El módulo de **Logística** gestiona los pedidos de material hospitalario. Cada pedido pasa por: **Solicitado → En Ruta → Retirado → En Planta → Procesado → Listo Entrega → Entregado**. Podés filtrar por estado y prioridad (normal/urgente). Los pedidos urgentes se destacan con alerta visual.',
    relatedModule: '/logistica',
    followUp: ['¿Cómo se crea un pedido?', '¿Qué significa cada estado?'],
  },
  {
    keywords: ['flota', 'vehiculo', 'vehiculos', 'auto', 'combustible', 'km', 'mantenimiento', 'service'],
    answer: 'El módulo de **Flota** controla los vehículos de la empresa. Registra:\n\n🚗 **Datos del vehículo**: patente, modelo, año, conductor asignado\n⛽ **Consumo**: registro de cargas de combustible y consumo km/litro\n🔧 **Mantenimiento**: kilometraje del último y próximo service\n📊 **Estado**: Activo, En Taller o Inactivo\n\nAdemás muestra alertas cuando un vehículo está próximo al service.',
    relatedModule: '/flota',
  },
  {
    keywords: ['facturacion', 'factura', 'cobro', 'precio', 'cliente', 'pendiente facturar'],
    answer: 'El módulo de **Facturación** muestra los servicios prestados y su estado de cobro:\n\n📋 **Pendiente**: Servicio realizado, sin facturar\n📄 **Facturado**: Factura emitida, pendiente de cobro\n💰 **Cobrado**: Pago recibido\n\nIncluye detalle por cliente con barra de progreso de cobro, cantidad, precio unitario y total.',
    relatedModule: '/facturacion',
  },
  {
    keywords: ['metrica', 'metricas', 'reporte', 'estadistica', 'indicador', 'kpi', 'grafico'],
    answer: 'El módulo de **Métricas** te muestra indicadores clave (KPIs) del sistema de calidad:\n\n📊 Hallazgos abiertos vs cerrados\n⏱️ Tiempo promedio de resolución\n📈 Tendencia mensual (gráfico de línea)\n🏷️ Distribución por tipo, origen y sector\n🎯 Índice de reincidencia por sector\n🔴 Resumen de impacto en matriz de riesgo',
    relatedModule: '/metricas',
  },
  {
    keywords: ['notificacion', 'notificaciones', 'alerta', 'alarma', 'vencimiento', 'plazo'],
    answer: 'El sistema tiene **notificaciones automáticas** (campana en la barra superior). Te avisa sobre:\n\n⏳ Hallazgos próximos a vencer o vencidos\n✅ Respuestas de responsables asignados\n📋 Nuevos hallazgos registrados\n🔔 Recordatorios de seguimiento',
  },
  {
    keywords: ['ishikawa', '5 porques', 'causa raiz', 'analisis', 'metodo'],
    answer: 'Bio Asist soporta dos métodos de análisis de causa raíz:\n\n🐟 **Diagrama de Ishikawa** (Espina de Pescado): Analiza causas en categorías como Máquina, Método, Material, Mano de Obra, Medio Ambiente.\n\n❓ **5 Porqués**: Pregunta "¿Por qué?" sucesivamente hasta llegar a la causa raíz fundamental.',
    relatedModule: '/calidad',
  },
  {
    keywords: ['propagable', 'propagacion', 'sector', 'sectores', 'derivar'],
    answer: 'Un hallazgo **propagable** es aquel que puede afectar a otros sectores. Cuando marcás un hallazgo como propagable, podés seleccionar los sectores impactados (lavado, esterilización, distribución, etc.). Esto permite que esos sectores tomen medidas preventivas.',
    relatedModule: '/calidad',
  },
  {
    keywords: ['bio asist', 'sistema', 'que es', 'para que sirve', 'como funciona'],
    answer: '**Bio Asist** es un ecosistema digital de gestión para empresas de procesamiento de instrumental médico. Integra:\n\n🛡️ **Calidad**: Gestión ISO 9001 de hallazgos y no conformidades\n🚚 **Logística**: Control de pedidos y entregas\n🚗 **Flota**: Gestión de vehículos y combustible\n💰 **Facturación**: Control de servicios y cobros\n📊 **Métricas**: Indicadores y reportes\n\nDesarrollado por **Grow Labs** para la gestión integral de la operación.',
    followUp: ['¿Cómo accedo a cada módulo?', '¿Qué puedo hacer en Calidad?'],
  },
  {
    keywords: ['ayuda', 'help', 'tutorial', 'como usar', 'empezar', 'guia'],
    answer: '¡Tenés varias opciones para aprender a usar Bio Asist!\n\n📖 **Modo Tutorial**: Activalo desde el ícono de 🎓 en mi panel. Te guío paso a paso por cada módulo del sistema.\n\n💬 **Preguntame**: Escribime cualquier duda y te respondo al instante.\n\n🧭 **Navegación**: Usá el sidebar izquierdo para moverte entre módulos.',
    followUp: ['Iniciá el tutorial', '¿Qué módulos hay?'],
  },
  {
    keywords: ['sla', 'plazo', 'plazos', 'vencimiento', 'tiempo', 'demora', 'atraso'],
    answer: 'Bio Asist controla automáticamente los **plazos (SLA)** de cada etapa:\n\n⚡ **Acción Inmediata**: 48 horas desde la creación\n🔬 **Análisis de Causa**: 15 días hábiles\n📝 **Plan Correctivo**: 10 días hábiles\n✅ **Verificación**: 7 días post-cierre\n🎯 **Efectividad**: 1 mes post-cierre\n\nCuando un plazo se vence, el hallazgo aparece en rojo con alerta de "Vencido".',
    relatedModule: '/calidad',
  },
  {
    keywords: ['exportar', 'pdf', 'excel', 'descargar', 'reporte', 'imprimir'],
    answer: 'Podés exportar datos desde varios módulos:\n\n📄 **PDF**: Genera un reporte visual con KPIs y tabla de hallazgos. Ideal para auditorías.\n📊 **Excel**: Exporta datos completos con resumen automático. Ideal para análisis.\n\nUsá los botones **"Exportar"** en el Dashboard de Calidad o en Métricas.',
    relatedModule: '/metricas',
    followUp: ['¿Dónde están las métricas?'],
  },
  {
    keywords: ['whatsapp', 'mensaje', 'notificar', 'wa', 'enviar mensaje'],
    answer: 'Bio Asist incluye integración con **WhatsApp** para notificaciones automáticas:\n\n📱 Cuando se deriva un hallazgo, el responsable recibe un mensaje con el link de resolución.\n🔔 Se envían recordatorios de vencimiento.\n✅ El sistema registra si el mensaje fue enviado, entregado y leído.\n\nEn la versión completa se usa **BuilderBot Cloud API** para el envío automatizado.',
    followUp: ['¿Cómo se deriva un hallazgo?'],
  },
  {
    keywords: ['derivar', 'derivacion', 'asignar', 'responsable', 'enviar'],
    answer: 'Para **derivar** un hallazgo a un responsable:\n\n1. Abrí el detalle del hallazgo\n2. Hacé clic en **"Derivar"**\n3. Seleccioná el sector y los responsables\n4. El sistema envía notificación automática por WhatsApp\n\nPodés derivar a **múltiples sectores y personas** simultáneamente (derivación multi-sector).',
    relatedModule: '/calidad',
    followUp: ['¿Qué es la derivación multi-sector?'],
  },
  {
    keywords: ['multi sector', 'multisector', 'varios sectores', 'derivacion multiple'],
    answer: 'La **derivación multi-sector** permite enviar un hallazgo a varios responsables de diferentes sectores al mismo tiempo:\n\n• Seleccionás sectores individuales o "Enviar a todos"\n• Cada responsable recibe su propia notificación por WhatsApp\n• Todas las respuestas se consolidan en el mismo caso\n• Ideal para problemas que afectan a múltiples áreas',
    relatedModule: '/calidad',
  },
  {
    keywords: ['matriz riesgo', 'riesgo', 'impacto', 'seguridad paciente'],
    answer: 'La **Matriz de Riesgo** identifica hallazgos que podrían afectar la seguridad:\n\n🔴 Los hallazgos con impacto en la matriz se priorizan automáticamente\n📊 En Métricas podés ver el resumen: riesgos altos activos, medios y mitigados\n🔔 Estos hallazgos generan alertas especiales\n\nMarcar "Impacto en Matriz de Riesgo" al crear un hallazgo activa este seguimiento.',
    relatedModule: '/metricas',
  },
  {
    keywords: ['mis casos', 'mi panel', 'mis hallazgos', 'asignados'],
    answer: 'El panel de **Mis Casos** te muestra únicamente los hallazgos asignados a tu sector:\n\n📋 **Vista filtrada**: Solo ves lo que te corresponde\n📊 **KPIs personalizadas**: Total, Pendientes, Resueltos, Urgentes\n🏷️ **Agrupación por sector**: Para entender de dónde viene cada caso\n\nAccedé desde el sidebar: **Calidad → Mis Casos**.',
    relatedModule: '/calidad/mis-casos',
    followUp: ['¿Cómo veo el detalle de un caso?'],
  },
  {
    keywords: ['grow labs', 'empresa', 'desarrollador', 'quien hizo'],
    answer: '**Grow Labs** es la empresa de desarrollo tecnológico que creó Bio Asist. Nos especializamos en:\n\n🏥 Sistemas de gestión para el sector salud\n📊 Dashboards de calidad y operaciones\n🤖 Automatización con IA y bots\n📱 Integración con WhatsApp y canales digitales\n\nBio Asist es nuestro ecosistema insignia para gestión de plantas de esterilización.',
  },
  {
    keywords: ['dashboard', 'panel', 'pantalla principal', 'inicio'],
    answer: 'El **Dashboard** es la pantalla principal de cada módulo. Muestra:\n\n📊 **KPIs**: Indicadores clave en tarjetas visuales\n📋 **Lista**: Todos los registros con filtros\n🔍 **Búsqueda**: Buscá por ID, descripción o sector\n📌 **Filtros**: Por estado, sector, prioridad y fecha\n\nHacé clic en cualquier registro para ver su detalle completo.',
    relatedModule: '/calidad',
  },
  {
    keywords: ['evidencia', 'foto', 'imagen', 'adjuntar', 'archivo'],
    answer: 'Podés **adjuntar evidencia** a cada hallazgo:\n\n📸 **Al crear**: Arrastrá fotos o archivos al formulario\n📎 **Durante la resolución**: Cada etapa permite adjuntar evidencia\n✅ **Al cerrar**: Se puede adjuntar evidencia de resolución\n\nLas evidencias quedan asociadas al código de seguimiento y son trazables.',
    relatedModule: '/calidad/nuevo',
  },
  {
    keywords: ['5s', 'cinco s', 'ronda', 'orden', 'limpieza'],
    answer: 'Las **rondas 5S** son inspecciones de orden y limpieza que generan hallazgos:\n\n1️⃣ **Seiri** (Clasificar): Separar lo necesario\n2️⃣ **Seiton** (Ordenar): Un lugar para cada cosa\n3️⃣ **Seiso** (Limpiar): Limpieza como inspección\n4️⃣ **Seiketsu** (Estandarizar): Mantener normas\n5️⃣ **Shitsuke** (Disciplina): Hábito de mejora\n\nLos hallazgos 5S se registran con origen "5S" en el sistema.',
    relatedModule: '/calidad/nuevo',
  },
  {
    keywords: ['reincidencia', 'repetido', 'recurrente', 'vuelve a pasar'],
    answer: 'El **Índice de Reincidencia** mide cuántos hallazgos similares se repiten en un sector:\n\n📊 Se calcula por sector y tipo de hallazgo\n⚠️ Un índice alto (>20%) indica que las acciones correctivas no fueron efectivas\n🔄 El sistema recomienda revisar el análisis de causa raíz\n\nPodés ver este indicador en el módulo de **Métricas**.',
    relatedModule: '/metricas',
  },
  {
    keywords: ['modulo', 'modulos', 'que modulos', 'secciones', 'areas'],
    answer: 'Bio Asist tiene **5 módulos principales**:\n\n🛡️ **Calidad**: Gestión ISO 9001 (hallazgos, NC, mejoras)\n🚚 **Logística**: Portal de pedidos y entregas\n🚗 **Flota**: Vehículos, combustible y mantenimiento\n💰 **Facturación**: Servicios, cobros y facturas\n📊 **Métricas**: KPIs, gráficos y reportes\n\nNavegá entre ellos usando el **sidebar izquierdo**.',
    followUp: ['¿Cómo funciona Calidad?', '¿Qué puedo ver en Métricas?'],
  },
  {
    keywords: ['esterilizacion', 'autoclave', 'lavado', 'instrumental'],
    answer: 'Bio Asist está diseñado para **plantas de procesamiento de instrumental médico**. Los procesos que gestiona son:\n\n🧼 **Lavado**: Limpieza ultrasónica y manual del instrumental\n♨️ **Esterilización**: Autoclaves con control de indicadores\n📦 **Preparación y Armado**: Ensamblado de sets quirúrgicos\n🚚 **Distribución**: Entrega a hospitales y clínicas\n\nEl sistema de Calidad monitorea cada etapa.',
    relatedModule: '/calidad',
  },
];

// ═══════════════════════════════════════════════
// TUTORIAL STEPS — Pasos del Modo Tutorial
// ═══════════════════════════════════════════════

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: typeof Shield;
  highlight?: string; // CSS selector hint (visual only)
  tips: string[];
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenido a Bio Asist',
    description: 'Bio Asist es tu ecosistema digital de gestión. Desde acá vas a poder controlar la calidad, logística, flota y facturación de tu operación. Exploremos cada módulo juntos.',
    route: '/calidad',
    icon: Sparkles,
    tips: ['Usá el sidebar izquierdo para navegar entre módulos', 'La campana 🔔 te muestra notificaciones pendientes', 'Tu rol aparece en la barra superior'],
  },
  {
    id: 'calidad-dashboard',
    title: 'Dashboard de Calidad',
    description: 'Este es el corazón del sistema. Acá ves todos los hallazgos registrados con su estado, prioridad y plazos. Los indicadores KPI en la parte superior te dan un resumen rápido.',
    route: '/calidad',
    icon: Shield,
    tips: ['Los hallazgos con prioridad 🔴 requieren atención inmediata', 'Podés filtrar por estado, tipo y sector', 'Hacé clic en un hallazgo para ver su detalle completo'],
  },
  {
    id: 'calidad-nuevo',
    title: 'Crear un Hallazgo',
    description: 'Para registrar un nuevo hallazgo, completá el formulario con el origen (auditoría, proceso, etc.), el tipo, la sede, sector y una descripción detallada. El sistema asigna automáticamente un código de seguimiento.',
    route: '/calidad/nuevo',
    icon: Target,
    tips: ['Seleccioná el origen correcto del hallazgo', 'Los hallazgos de prioridad roja requieren acción en 48hs', 'Podés adjuntar evidencia fotográfica'],
  },
  {
    id: 'logistica',
    title: 'Portal de Logística',
    description: 'Acá gestionás todos los pedidos de material. Cada pedido tiene un ciclo desde la solicitud hasta la entrega. Los pedidos urgentes se destacan visualmente.',
    route: '/logistica',
    icon: Truck,
    tips: ['Los pedidos urgentes se marcan en rojo', 'Cada pedido muestra el conductor asignado', 'El estado se actualiza en tiempo real'],
  },
  {
    id: 'flota',
    title: 'Gestión de Flota',
    description: 'Controlá los vehículos de tu operación. Registrá cargas de combustible, controlá el mantenimiento y asignálos a conductores. Los vehículos próximos al service se alertan.',
    route: '/flota',
    icon: Car,
    tips: ['Los vehículos "En Taller" aparecen en gris', 'Revisá el consumo promedio de cada vehículo', 'Controlá que ningún vehículo se pase del service'],
  },
  {
    id: 'facturacion',
    title: 'Facturación',
    description: 'Visualizá los servicios prestados y su estado de cobro. Podés ver cuánto facturaste, cuánto cobraste y cuánto tenés pendiente. Todo organizado por cliente y fecha.',
    route: '/facturacion',
    icon: Receipt,
    tips: ['Los montos pendientes se suman automáticamente', 'Cada servicio tiene detalle de cantidad y precio unitario', 'Los estados son: Pendiente → Facturado → Cobrado'],
  },
  {
    id: 'metricas',
    title: 'Métricas y Reportes',
    description: 'Este módulo te da la visión general del rendimiento. Indicadores clave como tiempo de resolución, tendencia de hallazgos y distribución por tipo y sector.',
    route: '/metricas',
    icon: BarChart3,
    tips: ['Usá estas métricas para reportes de auditoría', 'Identificá tendencias para acciones preventivas', 'Los gráficos se actualizan con los datos del sistema'],
  },
  {
    id: 'complete',
    title: '¡Tutorial Completo! 🎉',
    description: 'Ya conocés todos los módulos de Bio Asist. Recordá que podés preguntarme cualquier duda en cualquier momento usando el chat del asistente.',
    route: '/calidad',
    icon: CheckCircle2,
    tips: ['Usá el asistente para dudas específicas', 'Los hallazgos se pueden exportar como reportes', 'El sistema envía alertas automáticas de vencimiento'],
  },
];

// ═══════════════════════════════════════════════
// QUICK ACTIONS
// ═══════════════════════════════════════════════

interface QuickAction {
  label: string;
  icon: typeof Shield;
  question: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: '¿Qué es Bio Asist?', icon: HelpCircle, question: '¿Qué es Bio Asist y para qué sirve?' },
  { label: 'Crear hallazgo', icon: Target, question: '¿Cómo creo un nuevo hallazgo?' },
  { label: 'Ciclo de calidad', icon: Shield, question: '¿Cómo funciona el ciclo de calidad?' },
  { label: 'Ver módulos', icon: BookOpen, question: '¿Qué módulos tiene el sistema?' },
];

// ═══════════════════════════════════════════════
// CHAT MESSAGE TYPE
// ═══════════════════════════════════════════════

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  relatedModule?: string;
  followUp?: string[];
}

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════

export function AssistantBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'tutorial'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(-1); // -1 = not started
  const [tutorialActive, setTutorialActive] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        text: '¡Hola! 👋 Soy **BioBot**, tu asistente virtual de Bio Asist.\n\nPuedo ayudarte a entender el sistema, resolver dudas y guiarte paso a paso.\n\n¿En qué te puedo ayudar?',
        timestamp: new Date(),
        followUp: ['¿Qué es Bio Asist?', '¿Cómo creo un hallazgo?', 'Iniciar tutorial'],
      }]);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, activeTab]);

  // Remove pulse after opening
  useEffect(() => {
    if (isOpen) setShowPulse(false);
  }, [isOpen]);

  // ── Find best answer ──
  const findAnswer = useCallback((query: string): KnowledgeEntry | null => {
    const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    let bestMatch: KnowledgeEntry | null = null;
    let bestScore = 0;

    for (const entry of KNOWLEDGE_BASE) {
      let score = 0;
      for (const keyword of entry.keywords) {
        const normalizedKeyword = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normalizedQuery.includes(normalizedKeyword)) {
          score += normalizedKeyword.length; // Longer match = better
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    }

    return bestScore > 0 ? bestMatch : null;
  }, []);

  // ── Send message ──
  const handleSend = useCallback((text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Check if user wants tutorial
    if (messageText.toLowerCase().includes('tutorial') || messageText.toLowerCase().includes('guia paso')) {
      setInput('');
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: messageText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: '¡Excelente! 🎓 Voy a activar el **Modo Tutorial**. Te voy a guiar por cada módulo del sistema paso a paso.\n\nHacé clic en la pestaña **"Tutorial"** arriba para comenzar, o te lo activo yo.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMsg]);
        // Auto-switch to tutorial
        setTimeout(() => {
          setActiveTab('tutorial');
          setTutorialStep(0);
          setTutorialActive(true);
        }, 1500);
      }, 800);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      const answer = findAnswer(messageText);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: answer?.answer || 'No encontré información específica sobre eso. Probá preguntarme sobre:\n\n• **Calidad**: hallazgos, no conformidades, ciclo ISO\n• **Logística**: pedidos, entregas, retiros\n• **Flota**: vehículos, combustible, mantenimiento\n• **Facturación**: cobros, facturas, clientes\n• **Métricas**: reportes, indicadores, KPIs\n\nO activá el **Tutorial** para un recorrido completo. 🎓',
        timestamp: new Date(),
        relatedModule: answer?.relatedModule,
        followUp: answer?.followUp,
      };
      setMessages(prev => [...prev, botMsg]);
    }, 600 + Math.random() * 600);
  }, [input, findAnswer]);

  // ── Tutorial navigation ──
  const handleTutorialNext = useCallback(() => {
    const nextStep = tutorialStep + 1;
    if (nextStep < TUTORIAL_STEPS.length) {
      setTutorialStep(nextStep);
      navigate(TUTORIAL_STEPS[nextStep].route);
    } else {
      setTutorialActive(false);
      setTutorialStep(-1);
    }
  }, [tutorialStep, navigate]);

  const handleTutorialPrev = useCallback(() => {
    const prevStep = tutorialStep - 1;
    if (prevStep >= 0) {
      setTutorialStep(prevStep);
      navigate(TUTORIAL_STEPS[prevStep].route);
    }
  }, [tutorialStep, navigate]);

  const handleStartTutorial = useCallback(() => {
    setTutorialStep(0);
    setTutorialActive(true);
    navigate(TUTORIAL_STEPS[0].route);
  }, [navigate]);

  const handleResetTutorial = useCallback(() => {
    setTutorialStep(0);
    setTutorialActive(true);
    navigate(TUTORIAL_STEPS[0].route);
  }, [navigate]);

  // Current tutorial step data
  const currentStep = tutorialStep >= 0 && tutorialStep < TUTORIAL_STEPS.length
    ? TUTORIAL_STEPS[tutorialStep]
    : null;

  return (
    <>
      {/* ════════════ TUTORIAL OVERLAY BAR ════════════ */}
      {tutorialActive && currentStep && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-bio-primary via-[#004d73] to-bio-secondary text-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">Tutorial</span>
              <span className="text-xs font-bold bg-white/20 rounded-full px-2 py-0.5">
                {tutorialStep + 1}/{TUTORIAL_STEPS.length}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{currentStep.title}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {tutorialStep > 0 && (
                <button onClick={handleTutorialPrev} className="px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-lg transition-all cursor-pointer">
                  ← Anterior
                </button>
              )}
              {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                <button onClick={handleTutorialNext} className="px-3 py-1.5 text-xs font-bold bg-white/25 hover:bg-white/35 rounded-lg transition-all cursor-pointer flex items-center gap-1">
                  Siguiente <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <button onClick={() => { setTutorialActive(false); setTutorialStep(-1); }} className="px-3 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-all cursor-pointer flex items-center gap-1">
                  Finalizar <CheckCircle2 className="w-3 h-3" />
                </button>
              )}
              <button onClick={() => { setTutorialActive(false); setTutorialStep(-1); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-all cursor-pointer" title="Cerrar tutorial">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-white/10">
            <div
              className="h-full bg-white/50 transition-all duration-500 ease-out"
              style={{ width: `${((tutorialStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ════════════ FAB BUTTON ════════════ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
          isOpen
            ? 'bg-slate-700 hover:bg-slate-600 rotate-0 scale-95'
            : 'bg-gradient-to-br from-bio-primary to-bio-secondary hover:scale-110 hover:shadow-bio-primary/40'
        }`}
        title={isOpen ? 'Cerrar asistente' : 'Abrir asistente BioBot'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <Bot className="w-7 h-7 text-white" />
            {showPulse && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-bio-accent animate-pulse" />
            )}
          </>
        )}
      </button>

      {/* ════════════ CHAT PANEL ════════════ */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-bio-primary to-[#004d73] text-white p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm !text-white flex items-center gap-1.5">
                  BioBot <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                </h3>
                <p className="text-[10px] opacity-70 font-medium">Asistente de Bio Asist</p>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/20 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-300">Online</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex mt-3 bg-white/10 rounded-xl p-0.5">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'chat' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white/80'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" /> Chat
              </button>
              <button
                onClick={() => setActiveTab('tutorial')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'tutorial' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white/80'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> Tutorial
              </button>
            </div>
          </div>

          {/* ── CHAT TAB ── */}
          {activeTab === 'chat' && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[380px] custom-scrollbar bg-slate-50/50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-1'}`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-bio-primary text-white rounded-br-md'
                          : 'bg-white border border-slate-200/80 text-slate-700 rounded-bl-md shadow-sm'
                      }`}>
                        {msg.text.split(/(\*\*.*?\*\*)/).map((part, i) =>
                          part.startsWith('**') && part.endsWith('**')
                            ? <strong key={i} className={msg.role === 'user' ? 'text-white' : 'text-bio-primary'}>{part.slice(2, -2)}</strong>
                            : <span key={i}>{part}</span>
                        )}
                      </div>
                      
                      {/* Related module link */}
                      {msg.relatedModule && (
                        <button
                          onClick={() => navigate(msg.relatedModule!)}
                          className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-bio-secondary hover:text-bio-primary transition-colors cursor-pointer"
                        >
                          <ArrowRight className="w-3 h-3" /> Ir al módulo
                        </button>
                      )}

                      {/* Follow-up suggestions */}
                      {msg.followUp && msg.followUp.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {msg.followUp.map((q, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(q)}
                              className="px-2.5 py-1 text-[10px] font-bold text-bio-primary bg-bio-primary/5 border border-bio-primary/15 rounded-full hover:bg-bio-primary/10 transition-all cursor-pointer"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-right text-slate-400' : 'text-slate-400'}`}>
                        {msg.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick actions (only show when few messages) */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 grid grid-cols-2 gap-1.5 flex-shrink-0 bg-slate-50/50">
                  {QUICK_ACTIONS.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(action.question)}
                      className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-slate-600 bg-white border border-slate-200/80 rounded-xl hover:border-bio-primary/30 hover:bg-bio-primary/3 hover:text-bio-primary transition-all cursor-pointer"
                    >
                      <action.icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{action.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-slate-200/80 flex-shrink-0 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Preguntame algo..."
                    className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-bio-primary/30 focus:ring-2 focus:ring-bio-primary/10 outline-none transition-all"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className="p-2.5 bg-bio-primary text-white rounded-xl hover:bg-[#002d47] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── TUTORIAL TAB ── */}
          {activeTab === 'tutorial' && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {!tutorialActive ? (
                /* Tutorial Start Screen */
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-bio-primary/10 to-bio-secondary/10 flex items-center justify-center mb-4">
                    <GraduationCap className="w-8 h-8 text-bio-primary" />
                  </div>
                  <h3 className="font-bold text-lg text-bio-primary mb-2 !tracking-normal">Modo Tutorial</h3>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    Te voy a guiar paso a paso por cada módulo del sistema. Recorreremos Calidad, Logística, Flota, Facturación y Métricas.
                  </p>
                  
                  {/* Steps preview */}
                  <div className="space-y-2 mb-6 text-left">
                    {TUTORIAL_STEPS.slice(1, -1).map((step, i) => (
                      <div key={step.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-7 h-7 rounded-lg bg-bio-primary/8 flex items-center justify-center flex-shrink-0">
                          <step.icon className="w-4 h-4 text-bio-primary" />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{step.title}</span>
                        <span className="ml-auto text-[9px] text-slate-400 font-bold">{i + 1}/{TUTORIAL_STEPS.length - 2}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleStartTutorial}
                    className="w-full btn-primary gap-2 text-sm"
                  >
                    <Play className="w-4 h-4" /> Iniciar Tutorial
                  </button>
                  <p className="text-[10px] text-slate-400 mt-3">Duración estimada: 3-5 minutos</p>
                </div>
              ) : currentStep ? (
                /* Active Tutorial Step */
                <div className="p-5">
                  {/* Step header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-bio-secondary uppercase tracking-wider">
                      Paso {tutorialStep + 1} de {TUTORIAL_STEPS.length}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-bio-primary/10 to-bio-secondary/10 flex items-center justify-center flex-shrink-0">
                      <currentStep.icon className="w-6 h-6 text-bio-primary" />
                    </div>
                    <h3 className="font-bold text-base text-bio-primary !tracking-normal">{currentStep.title}</h3>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{currentStep.description}</p>

                  {/* Tips */}
                  <div className="space-y-2 mb-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" /> Tips
                    </p>
                    {currentStep.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50/80 border border-amber-100/80">
                        <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-[11px] text-amber-800 font-medium">{tip}</span>
                      </div>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-2">
                    {tutorialStep > 0 && (
                      <button onClick={handleTutorialPrev} className="btn-ghost flex-1 text-xs py-2">
                        ← Anterior
                      </button>
                    )}
                    {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                      <button onClick={handleTutorialNext} className="btn-primary flex-1 text-xs py-2">
                        Siguiente <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => { setTutorialActive(false); setTutorialStep(-1); setActiveTab('chat'); }}
                        className="btn-accent flex-1 text-xs py-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> ¡Completado!
                      </button>
                    )}
                  </div>

                  {/* Reset */}
                  <button
                    onClick={handleResetTutorial}
                    className="w-full mt-2 text-[10px] font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center justify-center gap-1 py-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reiniciar tutorial
                  </button>

                  {/* Progress dots */}
                  <div className="flex justify-center gap-1.5 mt-4">
                    {TUTORIAL_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i === tutorialStep ? 'bg-bio-primary scale-125' :
                          i < tutorialStep ? 'bg-bio-secondary' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </>
  );
}
