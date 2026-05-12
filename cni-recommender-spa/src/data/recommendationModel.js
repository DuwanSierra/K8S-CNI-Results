// ─────────────────────────────────────────────────────────────────────────────
// Etiquetas de criterios — terminología visible en la UI
// ─────────────────────────────────────────────────────────────────────────────
export const criteriaLabels = {
  latency: 'Velocidad de respuesta',
  jitter: 'Estabilidad de la conexion',
  throughput: 'Cantidad de datos',
  resourceEfficiency: 'Uso de CPU y RAM',
  networkPolicy: 'Seguridad de red',
  ramEfficiency: 'Uso de memoria (RAM)',
  cpuEfficiency: 'Uso del procesador (CPU)',
};

// ─────────────────────────────────────────────────────────────────────────────
// Preguntas guiadas — lenguaje cotidiano sin tecnicismos
// ─────────────────────────────────────────────────────────────────────────────
export const guidedQuestionDefaults = {
  domain: '',
  latencyNeed: 3,
  stabilityNeed: 3,
  throughputNeed: 3,
  resourceLimit: 3,
  securityNeed: 3,
};

export const guidedQuestions = [
  {
    id: 'latencyNeed',
    label: '¿Que tan rapido tiene que responder?',
    low: 'No importa mucho',
    high: 'Debe ser instantaneo',
    help: 'Por ejemplo: un chat en vivo o un juego online necesitan respuesta inmediata. Una pagina de noticias no.',
  },
  {
    id: 'stabilityNeed',
    label: '¿Que tan estable debe ser la conexion?',
    low: 'Algun corte es aceptable',
    high: 'No puede fallar ni un momento',
    help: 'Por ejemplo: un sistema de pagos o de salud necesita estabilidad total. Un blog puede tolerar interrupciones cortas.',
  },
  {
    id: 'throughputNeed',
    label: '¿Cuantos datos se van a mover al mismo tiempo?',
    low: 'Pocos, trafico normal',
    high: 'Muchisimos, como video o analitica',
    help: 'Por ejemplo: un sitio de streaming o de ciencia de datos mueve grandes volumenes. Un sistema de turnos no.',
  },
  {
    id: 'resourceLimit',
    label: '¿Los servidores donde va a funcionar son pequenos o limitados?',
    low: 'Servidores normales con recursos amplios',
    high: 'Dispositivos pequenos o con recursos muy limitados',
    help: 'Por ejemplo: una Raspberry Pi, un dispositivo IoT o un servidor de bajo costo tiene recursos limitados.',
  },
  {
    id: 'securityNeed',
    label: '¿Que tan importante es la seguridad y el control de acceso?',
    low: 'No es critico',
    high: 'Obligatorio: necesito aislar servicios',
    help: 'Por ejemplo: un banco, una clinica o un gobierno necesitan controlar exactamente quien puede hablar con quien. Subir esto a maximo descarta CNIs sin capacidades de seguridad.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Puntuaciones estructurales de respaldo (cuando no hay benchmark)
// networkPolicy: Flannel = 1 porque NO soporta Network Policies nativas.
// ─────────────────────────────────────────────────────────────────────────────
export const cniMetrics = [
  {
    id: 'flannel',
    name: 'Flannel',
    accent: 'bg-sky-500',
    ring: 'ring-sky-100',
    summary: 'Muy ligero y simple. Ideal para entornos basicos sin requisitos de seguridad avanzada.',
    supportsNetworkPolicy: false,
    scores: {
      latency: 4.7,
      jitter: 4.5,
      throughput: 3.9,
      resourceEfficiency: 4.8,
      networkPolicy: 1,
      ramEfficiency: 4.9,
      cpuEfficiency: 4.7,
    },
  },
  {
    id: 'calico',
    name: 'Calico',
    accent: 'bg-amber-500',
    ring: 'ring-amber-100',
    summary: 'Buena combinacion de rendimiento y control de seguridad de red.',
    supportsNetworkPolicy: true,
    scores: {
      latency: 3.7,
      jitter: 3.6,
      throughput: 4,
      resourceEfficiency: 3.4,
      networkPolicy: 4.2,
      ramEfficiency: 3.3,
      cpuEfficiency: 3.5,
    },
  },
  {
    id: 'cilium',
    name: 'Cilium',
    accent: 'bg-emerald-500',
    ring: 'ring-emerald-100',
    summary: 'El mas avanzado en seguridad y observabilidad. Usa tecnologia eBPF de ultima generacion.',
    supportsNetworkPolicy: true,
    scores: {
      latency: 4.2,
      jitter: 4.1,
      throughput: 4.8,
      resourceEfficiency: 3.2,
      networkPolicy: 5,
      ramEfficiency: 3,
      cpuEfficiency: 3.4,
    },
  },
  {
    id: 'antrea',
    name: 'Antrea',
    accent: 'bg-indigo-500',
    ring: 'ring-indigo-100',
    summary: 'Equilibrio solido entre velocidad, seguridad y uso de recursos.',
    supportsNetworkPolicy: true,
    scores: {
      latency: 4.4,
      jitter: 4.2,
      throughput: 4.4,
      resourceEfficiency: 4.1,
      networkPolicy: 4.5,
      ramEfficiency: 4.1,
      cpuEfficiency: 4,
    },
  },
];

const cniMetadata = Object.fromEntries(
  cniMetrics.map(({ id, name, accent, ring, summary, supportsNetworkPolicy, scores }) => [
    id,
    { id, name, accent, ring, summary, supportsNetworkPolicy, structuralScores: scores },
  ]),
);

// ─────────────────────────────────────────────────────────────────────────────
// Mapeo de métricas del benchmark a criterios MCDA
// ─────────────────────────────────────────────────────────────────────────────
const metricDefinitions = {
  latency: { key: 'latencia_ms', higherIsBetter: false },
  jitter: { key: 'jitter_ms', higherIsBetter: false },
  retransmits: { key: 'retransmits', higherIsBetter: false },
  throughput: { key: 'throughput_mbps', higherIsBetter: true },
  cpuEfficiency: { key: 'cpu_usada_pct', higherIsBetter: false },
  ramEfficiency: { key: 'ram_usada_mb', higherIsBetter: false },
};

// ─────────────────────────────────────────────────────────────────────────────
// Comandos de instalacion
// ─────────────────────────────────────────────────────────────────────────────
export const implementationGuides = {
  flannel: {
    installCommand:
      'kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml',
  },
  calico: {
    installCommand:
      'kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.0/manifests/calico.yaml',
  },
  cilium: {
    installCommand:
      'kubectl apply -f https://raw.githubusercontent.com/cilium/cilium/v1.16/install/kubernetes/quick-install.yaml',
  },
  antrea: {
    installCommand:
      'kubectl apply -f https://github.com/antrea-io/antrea/releases/latest/download/antrea.yml',
  },
};

export const defaultDenyPolicy = `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress-egress
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress`;

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades matemáticas
// ─────────────────────────────────────────────────────────────────────────────
function normalizeWeights(rawWeights) {
  const total = Object.values(rawWeights).reduce((sum, value) => sum + value, 0);
  return Object.fromEntries(
    Object.entries(rawWeights).map(([metric, value]) => [
      metric,
      Number((value / total).toFixed(3)),
    ]),
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function average(values) {
  const validValues = values.filter((value) => Number.isFinite(value));
  if (!validValues.length) return 0;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

function scoreFromRange(value, min, max, higherIsBetter) {
  if (!Number.isFinite(value)) return 0;
  if (min === max) return 3;
  const ratio = higherIsBetter
    ? (value - min) / (max - min)
    : (max - value) / (max - min);
  return Number((1 + clamp(ratio, 0, 1) * 4).toFixed(2));
}

function getMetricRange(entries, metric) {
  const definition = metricDefinitions[metric];
  const values = entries
    .map(([, data]) => Number(data?.[definition.key]))
    .filter((value) => Number.isFinite(value));
  if (!values.length) return { min: 0, max: 0 };
  return { min: Math.min(...values), max: Math.max(...values) };
}

function getNetworkPolicyOverhead(data) {
  if (!data?.network_policy) return null;
  const caseValues = Object.values(data.network_policy).flatMap((policyCase) => [
    Number(policyCase?.overhead_latencia_pct),
    Number(policyCase?.overhead_throughput_pct),
  ]);
  const validValues = caseValues.filter((value) => Number.isFinite(value));
  if (!validValues.length) return null;
  return average(validValues);
}

// ─────────────────────────────────────────────────────────────────────────────
// Construcción de scores desde benchmark real
// ─────────────────────────────────────────────────────────────────────────────
export function buildCniMetricsFromBenchmark(benchmarkPayload) {
  const rawCnis = benchmarkPayload?.cnis ?? benchmarkPayload;
  const entries = Object.entries(rawCnis ?? {}).filter(([id]) => cniMetadata[id]);
  if (!entries.length) return cniMetrics;

  const ranges = Object.fromEntries(
    Object.keys(metricDefinitions).map((metric) => [metric, getMetricRange(entries, metric)]),
  );
  const networkPolicyOverheads = entries.map(([, data]) => getNetworkPolicyOverhead(data));
  const validPolicyOverheads = networkPolicyOverheads.filter((value) => Number.isFinite(value));
  const minPolicyOverhead = validPolicyOverheads.length ? Math.min(...validPolicyOverheads) : 0;
  const maxPolicyOverhead = validPolicyOverheads.length ? Math.max(...validPolicyOverheads) : 0;

  return entries.map(([id, data]) => {
    const meta = cniMetadata[id];
    const latencyScore = scoreFromRange(data.latencia_ms, ranges.latency.min, ranges.latency.max, false);
    const jitterScore = scoreFromRange(data.jitter_ms, ranges.jitter.min, ranges.jitter.max, false);
    const retransmitScore = scoreFromRange(data.retransmits, ranges.retransmits.min, ranges.retransmits.max, false);
    const throughputScore = scoreFromRange(data.throughput_mbps, ranges.throughput.min, ranges.throughput.max, true);
    const cpuScore = scoreFromRange(data.cpu_usada_pct, ranges.cpuEfficiency.min, ranges.cpuEfficiency.max, false);
    const ramScore = scoreFromRange(data.ram_usada_mb, ranges.ramEfficiency.min, ranges.ramEfficiency.max, false);

    const policyOverhead = getNetworkPolicyOverhead(data);
    // Si el CNI no soporta Network Policies, su score de seguridad es 1 (mínimo), sin importar el benchmark.
    const policyScore = meta.supportsNetworkPolicy === false
      ? 1
      : Number.isFinite(policyOverhead)
        ? scoreFromRange(policyOverhead, minPolicyOverhead, maxPolicyOverhead, false)
        : meta.structuralScores.networkPolicy;

    return {
      ...meta,
      rawMetrics: data,
      scores: {
        latency: latencyScore,
        jitter: Number(average([jitterScore, retransmitScore]).toFixed(2)),
        throughput: throughputScore,
        resourceEfficiency: Number(average([cpuScore, ramScore]).toFixed(2)),
        networkPolicy: policyScore,
        ramEfficiency: ramScore,
        cpuEfficiency: cpuScore,
      },
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Construcción del perfil guiado
// ─────────────────────────────────────────────────────────────────────────────
function getGuidedProfileName(answers) {
  const { latencyNeed, resourceLimit, securityNeed, throughputNeed } = answers;
  if (securityNeed >= 4 && latencyNeed >= 4) return 'Perfil: servicios criticos y seguros';
  if (resourceLimit >= 4) return 'Perfil: operacion eficiente en recursos';
  if (securityNeed >= 4) return 'Perfil: seguridad y control de acceso';
  if (latencyNeed >= 4) return 'Perfil: respuesta rapida';
  if (throughputNeed >= 4) return 'Perfil: alto volumen de datos';
  return 'Perfil: uso general';
}

export function buildGuidedProfile(answers = guidedQuestionDefaults) {
  const current = { ...guidedQuestionDefaults, ...answers };
  const rawWeights = {
    latency: 0.8 + current.latencyNeed * 0.85 + current.stabilityNeed * 0.2,
    jitter: 0.6 + current.stabilityNeed * 0.8 + current.latencyNeed * 0.2,
    throughput: 0.8 + current.throughputNeed * 0.9,
    resourceEfficiency: 0.8 + current.resourceLimit * 0.9,
    networkPolicy: 0.8 + current.securityNeed * 0.9,
  };
  const weights = normalizeWeights(rawWeights);
  const domain = current.domain.trim();
  const strongestMetric = Object.entries(weights).sort((a, b) => b[1] - a[1])[0];

  return {
    id: 'guided',
    name: getGuidedProfileName(current),
    tag: 'Personalizado',
    source: 'guided',
    // Nivel de seguridad requerido — se usa para aplicar la restricción dura
    securityNeed: current.securityNeed,
    confidence:
      Math.max(
        current.latencyNeed,
        current.stabilityNeed,
        current.throughputNeed,
        current.resourceLimit,
        current.securityNeed,
      ) >= 4
        ? 'Alta'
        : 'Media',
    description: domain
      ? `Perfil generado para ${domain}. La prioridad principal es ${criteriaLabels[strongestMetric[0]]}.`
      : `Perfil generado desde tus respuestas. La prioridad principal es ${criteriaLabels[strongestMetric[0]]}.`,
    weights,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Motor de cálculo MCDA con restricción de seguridad no compensatoria
//
// REGLA: Si el usuario marcó seguridad >= 4 (importante o superior) y el CNI
// NO soporta Network Policies (supportsNetworkPolicy = false), ese CNI recibe
// una penalización del 60% en su puntaje final. Esto garantiza que no pueda
// ganar aunque sea muy eficiente en otros criterios.
// ─────────────────────────────────────────────────────────────────────────────
export function calculateScores(profile, benchmarkPayload) {
  const cnis = benchmarkPayload ? buildCniMetricsFromBenchmark(benchmarkPayload) : cniMetrics;

  // El nivel de seguridad requerido por el perfil guiado (1-5). Si el perfil
  // es uno de los 3 predefinidos, no aplica restricción (undefined).
  const securityNeed = profile?.securityNeed ?? 0;
  // Umbral: si securityNeed >= 4, la seguridad es un requisito importante.
  const securityIsRequired = securityNeed >= 4;

  return cnis
    .map((cni) => {
      const rawTotal = Object.entries(profile.weights).reduce((sum, [metric, weight]) => {
        const metricValue = cni.scores[metric] ?? 0;
        return sum + metricValue * weight;
      }, 0);

      // Aplicar penalización dura si el CNI no soporta seguridad y el usuario la requiere
      const securityPenalized = securityIsRequired && cni.supportsNetworkPolicy === false;
      const finalScore = securityPenalized ? rawTotal * 0.4 : rawTotal;

      return {
        ...cni,
        score: Number(finalScore.toFixed(3)),
        rawScore: Number(rawTotal.toFixed(3)),
        securityPenalized,
      };
    })
    .sort((a, b) => b.score - a.score);
}
