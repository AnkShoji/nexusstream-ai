import React, { useState, useEffect } from 'react';
import { db } from './lib/firebase';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Activity, ArrowUpRight, BarChart3, Clock, Database, 
  Download, Filter, Layers, LayoutDashboard, RefreshCcw, 
  Settings, ShoppingCart, Zap, AlertTriangle, Bell, Trash2, CheckCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type Language = 'en' | 'es';

const translations = {
  en: {
    system: "System",
    overview: "Live Overview",
    processing: "Processing Active",
    dashboard: "Dashboard",
    scenarios: "Scenario Lab",
    neuralPool: "Neural Pool",
    analytics: "Analytics",
    settings: "Settings",
    performance: "System Performance",
    export: "Export CSV",
    ingest: "Ingest Event",
    ingesting: "Processing...",
    revenue: "Real-Time Revenue",
    ltv: "User Lifetime Value",
    conversion: "Conversion Rate",
    retention: "Retention",
    neuralCommand: "Neural Command Center",
    throughput: "Intelligent Throughput Index",
    recentLogs: "Recent Log Ingestion",
    workerSync: "Worker Sync",
    anomalyShield: "Anomaly Shield",
    shielded: "Shielded",
    healthy: "Healthy",
    askAnything: "Ask anything about your live transaction streams.",
    queryIntelligence: "Query stream intelligence...",
    synthesizing: "Synthesizing response...",
    neuralError: "Network interruption in neural module.",
    projectionOutput: "Projection Output",
    calculating: "Calculating probability matrices...",
    projections: "Scenario Projections",
    predictiveEngine: "PREDICTIVE ENGINE",
    incidents: "Incidents center",
    noThreats: "No active threats detected.",
    totalEvents: "Total Events Blocked",
    launch: "Launch Intelligence Cube",
    latency: "Ingestion Latency",
    precision: "Anomaly Precision",
    coreIntelligence: "Core Intelligence",
    aiTone: "Respond in English. Be concise and analytical.",
    welcome: "AI-Autonomous Operations Intelligence.",
    tagline: "Experience real-time stream processing with neural anomaly guardians and predictive business forecasting.",
    anomalyAlert: "High Risk Detected",
    critical: "Critical",
    warning: "Warning",
    aiContext: "You are a senior data analyst inside a modern SaaS dashboard. Respond as a smart assistant, not a report. Avoid robotic tone. IMPORTANT RULES: Keep answers SHORT and SCANNABLE. DO NOT use markdown symbols like *, **, or bullet stars. Use clean sections with emojis and line breaks. Make it easy to read in a UI card.",
    metricsLabel: "📊 Key Metrics",
    insightsLabel: "📈 Insights",
    observationsLabel: "⚠️ Observations",
    recommendationsLabel: "💡 Recommendations",
    analyticsTitle: "Advanced Stream Analytics",
    analyticsDesc: "Historical performance and deep-dive metric distribution.",
    settingsTitle: "Neural Weights & Config",
    settingsDesc: "Adjust AI sensitivity and system behavior.",
    alertSensitivity: "Anomaly Sensitivity",
    aiMode: "AI Mode",
    concise: "Concise",
    detailed: "Detailed",
    nodes: "Daily Active Nodes",
    latencyVal: "Vector Latency",
    reliability: "Stream Reliability",
    encryption: "End-to-End Encryption",
    locked: "System values locked for stability.",
    aiModeInstruction: {
      concise: "Keep the response very short, under 100 words, and focused on immediate actions.",
      detailed: "Provide a more detailed analysis with deeper insights, explanations, and structural breakdown."
    }
  },
  es: {
    system: "Sistema",
    overview: "Vista en Vivo",
    processing: "Procesamiento Activo",
    dashboard: "Panel Control",
    scenarios: "Lab Escenarios",
    neuralPool: "Pool Neuronal",
    analytics: "Analítica",
    settings: "Ajustes",
    performance: "Rendimiento del Sistema",
    export: "Exportar CSV",
    ingest: "Ingesta Evento",
    ingesting: "Procesando...",
    revenue: "Ingresos en Tiempo Real",
    ltv: "Valor de Vida del Usuario (LTV)",
    conversion: "Tasa de Conversión",
    retention: "Retención",
    neuralCommand: "Centro de Comando Neuronal",
    throughput: "Índice de Rendimiento Inteligente",
    recentLogs: "Ingesta de Logs Recientes",
    workerSync: "Sincronización Worker",
    anomalyShield: "Escudo de Anomalías",
    shielded: "Protegido",
    healthy: "Saludable",
    askAnything: "Pregunta cualquier cosa sobre tus streams de transacciones.",
    queryIntelligence: "Consultar inteligencia de stream...",
    synthesizing: "Sintetizando respuesta...",
    neuralError: "Interrupción de red en módulo neuronal.",
    projectionOutput: "Resultado de Proyección",
    calculating: "Calculando matrices de probabilidad...",
    projections: "Proyecciones de Escenarios",
    predictiveEngine: "MOTOR PREDICTIVO",
    incidents: "Centro de Incidentes",
    noThreats: "No se detectan amenazas activas.",
    totalEvents: "Total Eventos Bloqueados",
    launch: "Lanzar Cubo de Inteligencia",
    latency: "Latencia de Ingesta",
    precision: "Precisión de Anomalía",
    coreIntelligence: "Inteligencia Central",
    aiTone: "Responde ÚNICAMENTE en Español. No mezcles idiomas.",
    welcome: "Inteligencia de Operaciones AI-Autónoma.",
    tagline: "Experimenta el procesamiento de streams en tiempo real con guardianes de anomalías neuronales.",
    anomalyAlert: "Riesgo Alto Detectado",
    critical: "Crítico",
    warning: "Advertencia",
    aiContext: "Eres un analista de datos senior en un dashboard SaaS moderno. Responde como un asistente inteligente y humano, no como un informe robótico. Sé directo y conversacional. REGLAS IMPORTANTES: Mantén las respuestas CORTAS y ESCANEABLES. NO uses símbolos markdown como *, **, o estrellas de viñetas. Usa secciones limpias con emojis y saltos de línea. Hazlo fácil de leer en una tarjeta de UI.",
    metricsLabel: "📊 Métricas Clave",
    insightsLabel: "📈 Insights",
    observationsLabel: "⚠️ Observaciones",
    recommendationsLabel: "💡 Recomendaciones",
    analyticsTitle: "Analítica Avanzada de Stream",
    analyticsDesc: "Rendimiento histórico y distribución profunda de métricas.",
    settingsTitle: "Pesos Neuronales y Config",
    settingsDesc: "Ajusta la sensibilidad de la IA y el comportamiento del sistema.",
    alertSensitivity: "Sensibilidad de Anomalías",
    aiMode: "Modo IA",
    concise: "Conciso",
    detailed: "Detallado",
    nodes: "Nodos Activos Diarios",
    latencyVal: "Latencia de Vector",
    reliability: "Fiabilidad del Stream",
    encryption: "Cifrado de Extremo a Extremo",
    locked: "Valores del sistema bloqueados por estabilidad.",
    aiModeInstruction: {
      concise: "Mantén la respuesta muy corta, menos de 100 palabras, y enfocada en acciones inmediatas.",
      detailed: "Proporciona un análisis más detallado con ideas más profundas, explicaciones y desglose estructural."
    }
  }
};

interface Summary {
  totalRevenue: number;
  transactionCount: number;
  categoryRevenue: Record<string, number>;
  lastUpdated: string;
  businessMetrics?: {
    ltv: number;
    conversionRate: number;
    retentionRate: number;
    churnRisk: number;
  };
}

interface Transaction {
  id: string;
  productName: string;
  category: string;
  total: number;
  timestamp: string;
  isAnomaly?: boolean;
}

interface Alert {
  id: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
  active: boolean; // For toasts
}

// --- Components ---

const StatCard = ({ title, value, icon: Icon, trend }: { title: string, value: string, icon: any, trend?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#18181b] border border-[#27272a] p-5 rounded-xl shadow-sm"
  >
    <div className="flex justify-between items-start mb-3">
      <span className="text-[12px] text-[#a1a1aa] uppercase tracking-wider font-medium">{title}</span>
      <Icon size={16} className="text-[#a1a1aa]" />
    </div>
    <div className="flex items-baseline gap-2">
      <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
      {trend && (
        <span className="text-[12px] text-[#10b981] font-medium">{trend}</span>
      )}
    </div>
  </motion.div>
);

const SectionHeader = ({ title, subtitle, icon: Icon, action }: { title: string, subtitle?: string, icon?: any, action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
      {Icon && <Icon size={14} className="text-[#3b82f6]" />}
      {title}
      {subtitle && <span className="bg-[#27272a] text-[10px] font-mono px-2 py-0.5 rounded text-[#a1a1aa]">{subtitle}</span>}
    </h2>
    {action}
  </div>
);

const ToastHUD = ({ alerts, onDismiss }: { alerts: Alert[], onDismiss: (id: string) => void }) => {
  const activeToasts = alerts.filter(a => a.active).slice(-3); // Limit to 3

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {activeToasts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={cn(
              "text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 border pointer-events-auto transition-transform active:scale-95 cursor-pointer",
              alert.type === 'critical' ? "bg-[#ef4444] border-white/20" : 
              alert.type === 'warning' ? "bg-[#f59e0b] border-white/20" : 
              "bg-[#3b82f6] border-white/20"
            )}
            onClick={() => onDismiss(alert.id)}
          >
            <div className="p-1.5 bg-white/10 rounded-full">
              {alert.type === 'critical' ? <AlertTriangle size={16} className="animate-pulse" /> : 
               alert.type === 'warning' ? <Zap size={16} /> : <Info size={16} />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                {alert.type} Engine Alert
              </span>
              <span className="text-[13px] font-medium">{alert.message}</span>
            </div>
            <button className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
              <RefreshCcw size={14} className="rotate-45" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const AlertInbox = ({ 
  alerts, 
  onClose, 
  onMarkRead, 
  onClearAll 
}: { 
  alerts: Alert[], 
  onClose: () => void, 
  onMarkRead: (id: string) => void,
  onClearAll: () => void
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    className="absolute top-16 right-0 w-80 bg-[#121214] border border-[#27272a] rounded-xl shadow-2xl z-[70] flex flex-col max-h-[500px]"
  >
    <div className="p-4 border-b border-[#27272a] flex justify-between items-center bg-[#18181b] rounded-t-xl">
      <div className="flex items-center gap-2">
        <Bell size={16} className="text-[#3b82f6]" />
        <span className="text-sm font-bold text-white tracking-widest uppercase">Incidents center</span>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={onClearAll}
          className="text-[#71717a] hover:text-[#ef4444] transition-colors p-1"
          title="Clear all incidents"
        >
          <Trash2 size={14} />
        </button>
        <button onClick={onClose} className="text-[#71717a] hover:text-white transition-colors p-1">
          <Activity size={14} />
        </button>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {alerts.length === 0 ? (
        <div className="p-8 text-center opacity-30 flex flex-col items-center">
          <CheckCircle size={32} className="mb-2" />
          <p className="text-xs">No active threats detected.</p>
        </div>
      ) : (
        alerts.slice().reverse().map(alert => (
          <div 
            key={alert.id}
            onClick={() => onMarkRead(alert.id)}
            className={cn(
              "p-3 rounded-lg border border-transparent transition-all cursor-pointer group",
              alert.read ? "bg-transparent opacity-60" : "bg-[#27272a]/30 border-[#3b82f6]/20"
            )}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={cn(
                "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                alert.type === 'critical' ? "bg-[#ef4444]/20 text-[#ef4444]" : 
                alert.type === 'warning' ? "bg-[#f59e0b]/20 text-[#f59e0b]" : 
                "bg-[#3b82f6]/20 text-[#3b82f6]"
              )}>
                {alert.type}
              </span>
              <span className="text-[10px] text-[#71717a]">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
            </div>
            <p className="text-[12px] text-white/90 line-clamp-2 font-medium">{alert.message}</p>
          </div>
        ))
      )}
    </div>

    <div className="p-3 border-t border-[#27272a] bg-[#18181b] rounded-b-xl text-center">
      <span className="text-[10px] text-[#71717a] uppercase tracking-widest font-bold">Total Events Blocked: {alerts.length}</span>
    </div>
  </motion.div>
);

const NeuralCommandCenter = ({ data, txns, lang, aiMode }: { data: Summary | null, txns: Transaction[], lang: Language, aiMode: 'concise' | 'detailed' }) => {
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  const askData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !data) return;
    
    const userMsg = query;
    setQuery("");
    setChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const modeInstruction = t.aiModeInstruction[aiMode];
      const context = `${t.aiContext}
      
      SPECIFIC INSTRUCTION: ${modeInstruction}
      
      SYSTEM CONTEXT:
      - Revenue: $${data.totalRevenue}
      - Transactions: ${data.transactionCount}
      - Metrics: LTV $${data.businessMetrics?.ltv}, Conv: ${data.businessMetrics?.conversionRate}%
      - Data Distribution: ${JSON.stringify(data.categoryRevenue)}
      - Recent Transactions: ${JSON.stringify(txns.slice(0, 3))}
      
      FORMAT EXAMPLE:
      ${t.metricsLabel}
      Metric 1: ...
      
      ${t.insightsLabel}
      - Insight 1
      
      ${t.aiTone}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: context }] },
          { role: 'user', parts: [{ text: userMsg }] }
        ],
      });

      const responseText = response.text || (lang === 'es' ? "No se pudo procesar." : "Could not process.");
      setChat(prev => [...prev, { role: 'ai', content: responseText }]);
    } catch (err) {
      setChat(prev => [...prev, { role: 'ai', content: t.neuralError }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121214] border border-[#27272a] rounded-xl flex flex-col h-[500px]">
      <div className="p-4 border-b border-[#27272a] flex justify-between items-center bg-[#18181b] rounded-t-xl">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[#3b82f6]" />
          <span className="text-sm font-bold text-white tracking-widest uppercase">{t.dashboard === 'Panel Control' ? 'Centro Neuronal' : 'Neural Command'}</span>
        </div>
        <span className="text-[10px] text-[#10b981] font-mono animate-pulse">● ONLINE</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans mask-fade-bottom">
        {chat.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <Database size={40} className="mb-4 text-[#a1a1aa]" />
            <p className="text-sm">{t.askAnything}</p>
          </div>
        )}
        {chat.map((msg, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "max-w-[85%] p-3 rounded-xl text-sm leading-relaxed",
              msg.role === 'user' ? "ml-auto bg-[#3b82f6] text-white" : "mr-auto bg-[#27272a] text-[#e4e4e7] border border-[#3b82f6]/10"
            )}
            style={{ whiteSpace: 'pre-line' }}
          >
            {msg.content}
          </motion.div>
        ))}
        {loading && (
          <div className="mr-auto bg-[#27272a] p-3 rounded-xl animate-pulse text-[#a1a1aa] text-xs">
            {t.synthesizing}
          </div>
        )}
      </div>

      <form onSubmit={askData} className="p-4 bg-[#18181b] border-t border-[#27272a] flex gap-2 rounded-b-xl">
        <input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.queryIntelligence}
          className="flex-1 bg-[#09090b] border border-[#27272a] rounded-lg px-4 py-2 text-sm text-white focus:border-[#3b82f6] outline-none transition-all"
        />
        <button className="bg-[#3b82f6] p-2 rounded-lg text-white hover:bg-blue-600 transition-colors">
          <ArrowUpRight size={18} />
        </button>
      </form>
    </div>
  );
};

const ScenarioSimulator = ({ data, lang, aiMode }: { data: Summary | null, lang: Language, aiMode: 'concise' | 'detailed' }) => {
  const [projection, setProjection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  const actionPrompts: Record<string, string> = {
    "Increase Prices +15%": "Analyze the business impact of increasing prices by 15% across all categories. Focus on LTV vs Churn risk.",
    "Subir Precios +15%": "Analiza el impacto comercial de subir los precios un 15% en todas las categorías. Enfécate en el LTV frente al riesgo de abandono (Churn).",
    "Double Traffic": "Estimate scaling needs and revenue growth if current traffic doubles instantly. Focus on throughput and anomaly risk.",
    "Duplicar Tráfico": "Estima las necesidades de escalado y el crecimiento de ingresos si el tráfico actual se duplica instantáneamente. Enfócate en el rendimiento y riesgo de anomalías.",
    "Marketing Blast": "Simulate a high-spend marketing campaign. Analyze if the projected CAC is offset by current customer LTV.",
    "Campaña de Marketing": "Simula una campaña de marketing de alto gasto. Analiza si el CAC proyectado se compensa con el LTV actual del cliente."
  };

  const simulate = async (scenario: string) => {
    if (!data) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const refinedScenarioPrompt = actionPrompts[scenario] || scenario;
      const modeInstruction = t.aiModeInstruction[aiMode];
      const prompt = `${t.aiContext}
      
      SPECIFIC INSTRUCTION: ${modeInstruction}
      SCENARIO: "${refinedScenarioPrompt}". 
      CURRENT DATA: ${data.totalRevenue} revenue, ${data.transactionCount} transactions, category distribution: ${JSON.stringify(data.categoryRevenue)}.
      
      ${t.aiTone}
      FORMAT: Provide a specific table with 3 clear business impact vectors.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setProjection(response.text);
    } catch (e) {
      setProjection(lang === 'es' ? "Error de proyección." : "Projection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title={t.projections} subtitle={t.predictiveEngine} icon={Layers} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: lang === 'en' ? "Increase Prices +15%" : "Subir Precios +15%", icon: ArrowUpRight, desc: lang === 'en' ? "Predict margin improvement" : "Predecir mejora de margen" },
          { label: lang === 'en' ? "Double Traffic" : "Duplicar Tráfico", icon: Zap, desc: lang === 'en' ? "Calculate server load & scaling" : "Calcular carga y escalado" },
          { label: lang === 'en' ? "Marketing Blast" : "Campaña de Marketing", icon: ShoppingCart, desc: lang === 'en' ? "CAC vs LTV projection" : "Proyección de CAC vs LTV" }
        ].map((s) => (
          <button 
            key={s.label}
            onClick={() => simulate(s.label)}
            className="p-6 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#3b82f6] transition-all text-left group"
          >
            <s.icon size={24} className="mb-4 text-[#a1a1aa] group-hover:text-[#3b82f6]" />
            <h4 className="text-sm font-bold text-white mb-1">{s.label}</h4>
            <p className="text-[11px] text-[#71717a]">{s.desc}</p>
          </button>
        ))}
      </div>
      
      <AnimatePresence>
        {loading ? (
          <div className="p-12 bg-[#18181b] rounded-xl border border-[#27272a] flex items-center justify-center gap-3 text-[#a1a1aa]">
            <RefreshCcw className="animate-spin" /> {t.calculating}
          </div>
        ) : projection && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-[#1e1b4b]/30 border border-[#4338ca]/30 rounded-xl prose prose-invert max-w-none text-sm"
          >
            <div className="flex items-center gap-2 text-[#818cf8] mb-4 font-bold uppercase tracking-wider text-[10px]">
              <Clock size={12} /> {t.projectionOutput}
            </div>
            <pre className="whitespace-pre-wrap font-sans text-[#cbd5e1]" style={{ whiteSpace: 'pre-line' }}>{projection}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isAlertCenterOpen, setIsAlertCenterOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [aiMode, setAiMode] = useState<'concise' | 'detailed'>('concise');
  const t = translations[lang];

  useEffect(() => {
    const userLang = navigator.language.startsWith('es') ? 'es' : 'en';
    setLang(userLang as Language);
  }, []);

  const addAlert = (message: string, type: Alert['type'] = 'info') => {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAlert: Alert = {
      id,
      message,
      type,
      timestamp: new Date(),
      read: false,
      active: true
    };
    
    setAlerts(prev => [...prev.slice(-49), newAlert]); // Cap at 50
    
    // Auto-dismiss toast
    setTimeout(() => {
      dismissAlert(id);
    }, 5000);
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: false } : a));
  };

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true, active: false } : a));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    setIsAlertCenterOpen(false);
  };

  useEffect(() => {
    // Auto-enter if returning (simulated)
    const entered = localStorage.getItem('nexus_entered');
    if (entered) setHasEntered(true);
  }, []);

  const enterApp = () => {
    setHasEntered(true);
    localStorage.setItem('nexus_entered', 'true');
  };

  useEffect(() => {
    const unsubSummary = onSnapshot(doc(db, 'summaries', 'daily_stats'), (doc) => {
      if (doc.exists()) setSummary(doc.data() as Summary);
    });

    const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'), limit(15));
    const unsubTxns = onSnapshot(q, (snapshot) => {
      const txns: Transaction[] = [];
      
      // Handle real-time alert trigger
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if ((data as any).isAnomaly) {
            addAlert(`High Risk Detected: ${data.productName} ($${data.total})`, 'critical');
          }
        }
      });

      snapshot.forEach((doc) => {
        txns.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setRecentTxns(txns);
    });

    return () => {
      unsubSummary();
      unsubTxns();
    };
  }, []);

  const chartData = summary ? Object.entries(summary.categoryRevenue).map(([name, value]) => ({ 
    name, 
    value: Math.round(value as number) 
  })) : [];

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Beauty'];
      const products = ['Ultra Watch', 'Neon Jacket', 'Smart Lamp', 'Yoga Pro', 'Glow Serum'];
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const price = Math.floor(Math.random() * 500) + 50;
      const qty = Math.floor(Math.random() * 3) + 1;

      await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: `MANUAL_${Date.now()}`,
          productName: products[Math.floor(Math.random() * products.length)],
          price,
          quantity: qty,
          total: price * qty,
          category: cat
        })
      });
    } finally {
      setTimeout(() => setIsSimulating(false), 500);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!hasEntered ? (
        <motion.div 
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="h-screen bg-[#09090b] flex flex-col items-center justify-center p-8 relative overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3b82f6]/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="z-10 text-center max-w-2xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <div className="w-12 h-12 bg-[#3b82f6] rounded-xl flex items-center justify-center shadow-[0_0_20px_#3b82f666]">
                <Zap size={24} className="text-white" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter italic">NEXUS<span className="text-[#3b82f6]">STREAM</span></h1>
            </motion.div>
            
            <h2 className="text-5xl font-bold text-white tracking-tight leading-tight mb-6">
              {t.welcome}
            </h2>
            <p className="text-[#71717a] text-lg mb-10 leading-relaxed">
              {t.tagline}
            </p>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={enterApp}
                className="px-8 py-4 bg-[#3b82f6] text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-[0_0_20px_#3b82f644] flex items-center gap-2 group"
              >
                {t.launch} <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 pt-16 border-t border-[#27272a]/50">
               <div>
                 <div className="text-2xl font-bold text-white">20ms</div>
                 <div className="text-[11px] text-[#71717a] uppercase tracking-widest mt-1">{t.latency}</div>
               </div>
               <div>
                 <div className="text-2xl font-bold text-white">99.2%</div>
                 <div className="text-[11px] text-[#71717a] uppercase tracking-widest mt-1">{t.precision}</div>
               </div>
               <div>
                 <div className="text-2xl font-bold text-white">GEMINI</div>
                 <div className="text-[11px] text-[#71717a] uppercase tracking-widest mt-1">{t.coreIntelligence}</div>
               </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="app"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex h-screen bg-[#09090b] text-[#e4e4e7] overflow-hidden font-sans"
        >
          {/* Sidebar */}
      <aside className="w-56 bg-[#121214] border-r border-[#27272a] flex flex-col p-6 overflow-hidden">
        <div className="flex items-center gap-3 text-white font-bold tracking-tight text-lg mb-10">
          <div className="w-6 h-6 bg-[#3b82f6] rounded-md" />
          NexusStream
        </div>
        
        <nav className="flex-1 space-y-1">
          {[
            { id: t.dashboard, icon: LayoutDashboard, internalId: 'Dashboard' },
            { id: t.scenarios, icon: Zap, internalId: 'Inference Streams' },
            { id: t.neuralPool, icon: Layers, internalId: 'Worker Pool' },
            { id: t.analytics, icon: Database, internalId: 'Database Metrics' },
            { id: t.settings, icon: Settings, internalId: 'Settings' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.internalId)}
              className={cn(
                "w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm transition-all cursor-pointer text-left border border-transparent group",
                activeTab === item.internalId ? "text-white bg-[#3b82f6]/10 border-[#3b82f6]/20 font-medium" : "text-[#71717a] hover:text-white hover:bg-[#27272a]/50"
              )}
            >
              <item.icon size={16} className={cn(activeTab === item.internalId ? "text-[#3b82f6]" : "group-hover:text-white")} />
              {item.id}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-[#27272a] space-y-3">
          <div>
            <div className="text-[10px] text-[#71717a] uppercase tracking-wider mb-1">Backend Engine</div>
            <div className="text-[12px] text-white">Full-Stack v1.2</div>
          </div>
          <div className="text-[10px] text-[#71717a]">Running on Docker</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <ToastHUD alerts={alerts} onDismiss={dismissAlert} />
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-[#121214] border-b border-[#27272a] shrink-0 relative">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#a1a1aa]">{t.system} /</span>
            <span className="text-white font-medium">{activeTab === 'Dashboard' ? t.overview : activeTab}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="px-2 py-1 border border-[#27272a] rounded text-[10px] font-bold text-[#a1a1aa] hover:border-[#3b82f6] hover:text-white transition-all uppercase"
            >
              {lang}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#10b981] rounded-full shadow-[0_0_8px_#10b981]" />
              <span className="text-[13px] font-medium">{t.processing}</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsAlertCenterOpen(!isAlertCenterOpen)}
                className="p-2 bg-[#27272a] rounded-full hover:bg-[#3b82f622] transition-colors relative"
              >
                <Bell size={18} className={cn(alerts.some(a => !a.read) && "text-[#3b82f6]")} />
                {alerts.some(a => !a.read) && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-[#ef4444] border-2 border-[#121214] rounded-full" />
                )}
              </button>
              
              <AnimatePresence>
                {isAlertCenterOpen && (
                  <AlertInbox 
                    alerts={alerts} 
                    onClose={() => setIsAlertCenterOpen(false)} 
                    onMarkRead={markAlertRead}
                    onClearAll={clearAllAlerts}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center text-[10px] font-bold border border-[#3b82f6]/20">
              AB
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white tracking-tighter mb-1">
              {activeTab === 'Dashboard' ? t.dashboard : 
               activeTab === 'Inference Streams' ? t.scenarios :
               activeTab === 'Database Metrics' ? t.analytics :
               activeTab}
            </h1>
            <p className="text-[#71717a] text-sm">{t.tagline}</p>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'Dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Action Row */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white tracking-tight">{t.performance}</h2>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => window.location.href = '/api/export/csv'}
                      className="px-4 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-xs font-medium text-[#e4e4e7] hover:bg-[#27272a] transition-all flex items-center gap-2"
                    >
                      <Download size={14} /> {t.export}
                    </button>
                    <button 
                      onClick={handleSimulate}
                      disabled={isSimulating}
                      className="px-4 py-1.5 bg-[#3b82f6] text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-all flex items-center gap-2"
                    >
                      <Zap size={14} /> {isSimulating ? t.ingesting : t.ingest}
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StatCard 
                    title={t.revenue} 
                    value={summary ? `$${summary.totalRevenue.toLocaleString()}` : '$0'} 
                    icon={Activity} 
                    trend="+12.4%" 
                  />
                  <StatCard 
                    title={t.ltv} 
                    value={summary?.businessMetrics ? `$${summary.businessMetrics.ltv.toLocaleString()}` : '$450'} 
                    icon={ShoppingCart} 
                    trend="Market High"
                  />
                  <StatCard 
                    title={t.conversion} 
                    value={summary?.businessMetrics ? `${summary.businessMetrics.conversionRate}%` : '2.4%'} 
                    icon={Zap} 
                    trend="Optimal"
                  />
                  <StatCard 
                    title={t.retention} 
                    value={summary?.businessMetrics ? `${summary.businessMetrics.retentionRate}%` : '85%'} 
                    icon={RefreshCcw} 
                    trend="Low Churn"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Neural Center */}
                  <div className="lg:col-span-4 lg:row-span-2">
                    <NeuralCommandCenter data={summary} txns={recentTxns} lang={lang} aiMode={aiMode} />
                  </div>

                  {/* Chart Area */}
                  <div className="lg:col-span-8 bg-[#18181b] border border-[#27272a] rounded-xl p-6">
                    <SectionHeader title={t.throughput} subtitle="GEMINI BRAIN" icon={BarChart3} />
                    <div className="h-[230px] w-full mt-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 11}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 11}} tickFormatter={(v) => `$${v}`} />
                          <Tooltip cursor={{fill: '#27272a', opacity: 0.5}} contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px'}} />
                          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Drill-down Table */}
                    <div className="mt-8 overflow-hidden">
                      <SectionHeader title={t.recentLogs} subtitle="REAL-TIME" />
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="text-[#a1a1aa] border-b border-[#27272a]">
                            <th className="pb-3 font-medium">STREAM ID</th>
                            <th className="pb-3 font-medium">CATEGORY</th>
                            <th className="pb-3 font-medium">VALUE</th>
                            <th className="pb-3 font-medium">TIMESTAMP</th>
                          </tr>
                        </thead>
                        <tbody className="text-[#e4e4e7] divide-y divide-[#27272a]">
                          {recentTxns.slice(0, 4).map((txn) => (
                            <tr key={txn.id} className="group hover:bg-[#27272a]/20 transition-colors">
                              <td className="py-4 font-mono text-[#a1a1aa]">#TX-{txn.id.slice(-4).toUpperCase()}</td>
                              <td className="py-4">{txn.category}</td>
                              <td className="py-4 font-semibold">${txn.total.toLocaleString()}</td>
                              <td className="py-4 text-[#71717a]">
                                {new Date(txn.timestamp).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* System Health View (Compact) */}
                  <div className="lg:col-span-8 grid grid-cols-2 gap-4">
                    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 flex items-center justify-between">
                       <div>
                         <div className="text-[10px] text-[#a1a1aa] uppercase font-bold mb-1">{t.workerSync}</div>
                         <div className="text-xl font-bold text-[#10b981]">{t.healthy}</div>
                       </div>
                       <div className="w-10 h-10 rounded-full bg-[#10b981]/10 flex items-center justify-center">
                         <Activity size={20} className="text-[#10b981]" />
                       </div>
                    </div>
                    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 flex items-center justify-between">
                       <div>
                         <div className="text-[10px] text-[#a1a1aa] uppercase font-bold mb-1">{t.anomalyShield}</div>
                         <div className="text-xl font-bold text-[#3b82f6]">{t.shielded}</div>
                       </div>
                       <div className="w-10 h-10 rounded-full bg-[#3b82f6]/10 flex items-center justify-center">
                         <Layers size={20} className="text-[#3b82f6]" />
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {(activeTab === 'Inference Streams' || activeTab === 'Worker Pool' || activeTab === 'Neural Projections') && (
               <motion.div
                 key="simulation"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="space-y-6"
               >
                 <ScenarioSimulator data={summary} lang={lang} aiMode={aiMode} />
               </motion.div>
            )}

            {activeTab === 'Database Metrics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-8">
                  <SectionHeader title={t.analyticsTitle} subtitle="V3.0" icon={BarChart3} />
                  <p className="text-[#a1a1aa] mb-10">{t.analyticsDesc}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-[#27272a] rounded-lg overflow-hidden divide-x divide-y md:divide-y-0 divide-[#27272a]">
                    {[
                      { l: t.nodes, v: "84,201" },
                      { l: t.latencyVal, v: "4.2ms" },
                      { l: t.reliability, v: "99.98%" }
                    ].map(m => (
                      <div key={m.l} className="p-6">
                        <div className="text-[10px] text-[#71717a] uppercase mb-1">{m.l}</div>
                        <div className="text-2xl font-bold text-white">{m.v}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 h-[300px] w-full p-4 border border-[#27272a] rounded-xl bg-[#09090b]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Tooltip contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a'}} />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="max-w-2xl mx-auto bg-[#18181b] border border-[#27272a] rounded-xl p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-[#3b82f6]/10 rounded-xl text-[#3b82f6]">
                      <Settings size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{t.settingsTitle}</h3>
                      <p className="text-sm text-[#a1a1aa]">{t.settingsDesc}</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-[12px] font-bold text-white uppercase tracking-widest">{t.alertSensitivity}</label>
                        <span className="text-[12px] text-[#3b82f6] font-mono">0.85 (High)</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#27272a] rounded-full overflow-hidden relative">
                         <div className="absolute left-0 top-0 h-full w-[85%] bg-[#3b82f6]" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[12px] font-bold text-white uppercase tracking-widest">{t.aiMode}</label>
                      <div className="flex p-1 bg-[#09090b] border border-[#27272a] rounded-lg">
                        <button 
                          onClick={() => setAiMode('concise')}
                          className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-md transition-all",
                            aiMode === 'concise' ? "bg-[#27272a] text-white" : "text-[#71717a] hover:text-white"
                          )}
                        >
                          {t.concise}
                        </button>
                        <button 
                          onClick={() => setAiMode('detailed')}
                          className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-md transition-all",
                            aiMode === 'detailed' ? "bg-[#27272a] text-white" : "text-[#71717a] hover:text-white"
                          )}
                        >
                          {t.detailed}
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#27272a]">
                       <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                          <span className="text-[12px] font-bold text-[#e4e4e7] uppercase">{t.encryption}</span>
                          <div className="w-10 h-5 bg-[#27272a] rounded-full relative">
                             <div className="absolute left-1 top-1 w-3 h-3 bg-[#71717a] rounded-full" />
                          </div>
                       </div>
                       <p className="mt-2 text-[10px] text-[#71717a] italic">{t.locked}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
    )}
    </AnimatePresence>
  );
}
