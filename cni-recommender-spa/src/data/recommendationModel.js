export const criteriaLabels = {
  latency: 'Latencia pod-to-pod',
  jitter: 'Jitter y perdida',
  throughput: 'Throughput sostenido',
  resourceEfficiency: 'Eficiencia CPU/RAM',
  networkPolicy: 'Network Policy',
  ramEfficiency: 'RAM por nodo',
  cpuEfficiency: 'CPU del CNI',
};

export const architectureProfiles = [
  {
    id: 'urllc',
    name: 'Perfil URLLC / Automatizacion Industrial',
    tag: 'Tiempo real',
    description:
      'Prioriza determinismo, baja latencia y estabilidad para automatizacion industrial y enlaces criticos.',
    weights: {
      latency: 0.3,
      jitter: 0.2,
      throughput: 0.2,
      resourceEfficiency: 0.2,
      networkPolicy: 0.1,
    },
  },
  {
    id: 'edge',
    name: 'Perfil Edge Computing / IoT',
    tag: 'Footprint bajo',
    description:
      'Optimiza consumo de recursos en nodos restringidos sin perder viabilidad operacional.',
    weights: {
      ramEfficiency: 0.35,
      cpuEfficiency: 0.25,
      latency: 0.2,
      throughput: 0.1,
      networkPolicy: 0.1,
    },
  },
  {
    id: 'zero-trust',
    name: 'Perfil Microservicios Transaccionales (Zero-Trust)',
    tag: 'Seguridad',
    description:
      'Favorece microsegmentacion, enforcement de politicas y rendimiento estable para APIs transaccionales.',
    weights: {
      networkPolicy: 0.4,
      latency: 0.3,
      throughput: 0.15,
      resourceEfficiency: 0.15,
    },
  },
];

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
    label: 'Latencia',
    low: 'Flexible',
    high: 'Critica',
    help: 'Sube el peso de latencia pod-to-pod para respuestas sensibles al tiempo.',
  },
  {
    id: 'stabilityNeed',
    label: 'Estabilidad',
    low: 'Tolerante',
    high: 'Determinista',
    help: 'Sube jitter/perdida cuando la variacion de red afecta el servicio.',
  },
  {
    id: 'throughputNeed',
    label: 'Throughput',
    low: 'Bajo',
    high: 'Alto',
    help: 'Sube la capacidad sostenida para cargas intensivas en datos.',
  },
  {
    id: 'resourceLimit',
    label: 'Recursos del nodo',
    low: 'Holgados',
    high: 'Limitados',
    help: 'Sube CPU/RAM cuando el cluster corre en nodos edge o restringidos.',
  },
  {
    id: 'securityNeed',
    label: 'Microsegmentacion',
    low: 'Basica',
    high: 'Obligatoria',
    help: 'Sube Network Policy cuando Zero-Trust o cumplimiento son requisitos fuertes.',
  },
];

export const cniMetrics = [
  {
    id: 'flannel',
    name: 'Flannel',
    accent: 'bg-sky-500',
    ring: 'ring-sky-100',
    summary: 'Ligero y simple, con muy bajo consumo base.',
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
    summary: 'Maduro en politicas de red y control declarativo.',
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
    summary: 'Fuerte en eBPF, observabilidad y seguridad avanzada.',
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
    summary: 'Balance solido entre rendimiento, politicas y eficiencia.',
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
  cniMetrics.map(({ id, name, accent, ring, summary, scores }) => [
    id,
    { id, name, accent, ring, summary, structuralScores: scores },
  ]),
);

const metricDefinitions = {
  latency: { key: 'latencia_ms', higherIsBetter: false },
  jitter: { key: 'jitter_ms', higherIsBetter: false },
  retransmits: { key: 'retransmits', higherIsBetter: false },
  throughput: { key: 'throughput_mbps', higherIsBetter: true },
  cpuEfficiency: { key: 'cpu_usada_pct', higherIsBetter: false },
  ramEfficiency: { key: 'ram_usada_mb', higherIsBetter: false },
};

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

  if (!values.length) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
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
    const latencyScore = scoreFromRange(
      data.latencia_ms,
      ranges.latency.min,
      ranges.latency.max,
      false,
    );
    const jitterScore = scoreFromRange(
      data.jitter_ms,
      ranges.jitter.min,
      ranges.jitter.max,
      false,
    );
    const retransmitScore = scoreFromRange(
      data.retransmits,
      ranges.retransmits.min,
      ranges.retransmits.max,
      false,
    );
    const throughputScore = scoreFromRange(
      data.throughput_mbps,
      ranges.throughput.min,
      ranges.throughput.max,
      true,
    );
    const cpuScore = scoreFromRange(
      data.cpu_usada_pct,
      ranges.cpuEfficiency.min,
      ranges.cpuEfficiency.max,
      false,
    );
    const ramScore = scoreFromRange(
      data.ram_usada_mb,
      ranges.ramEfficiency.min,
      ranges.ramEfficiency.max,
      false,
    );
    const policyOverhead = getNetworkPolicyOverhead(data);
    const policyScore = Number.isFinite(policyOverhead)
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

function getGuidedProfileName(answers) {
  const {
    latencyNeed,
    resourceLimit,
    securityNeed,
    throughputNeed,
  } = answers;

  if (securityNeed >= 4 && latencyNeed >= 4) {
    return 'Perfil guiado: servicios criticos seguros';
  }

  if (resourceLimit >= 4) {
    return 'Perfil guiado: operacion eficiente en recursos';
  }

  if (securityNeed >= 4) {
    return 'Perfil guiado: seguridad y microsegmentacion';
  }

  if (latencyNeed >= 4) {
    return 'Perfil guiado: baja latencia';
  }

  if (throughputNeed >= 4) {
    return 'Perfil guiado: alto rendimiento de red';
  }

  return 'Perfil guiado: balance general';
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
      ? `Perfil generado para ${domain}. La ponderacion prioriza ${criteriaLabels[strongestMetric[0]]}.`
      : `Perfil generado desde restricciones generales. La ponderacion prioriza ${criteriaLabels[strongestMetric[0]]}.`,
    weights,
  };
}

export function calculateScores(profile, benchmarkPayload) {
  const cnis = benchmarkPayload ? buildCniMetricsFromBenchmark(benchmarkPayload) : cniMetrics;

  return cnis
    .map((cni) => {
      const total = Object.entries(profile.weights).reduce((sum, [metric, weight]) => {
        const metricValue = cni.scores[metric] ?? 0;
        return sum + metricValue * weight;
      }, 0);

      return {
        ...cni,
        score: Number(total.toFixed(3)),
      };
    })
    .sort((a, b) => b.score - a.score);
}
