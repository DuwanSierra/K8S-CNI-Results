const path = require('path');
const benchmark = require('../cni-recommender-spa/public/cni-data.json');

const cniMetadata = {
  flannel: { name: 'Flannel', supportsNetworkPolicy: false, structuralScores: { networkPolicy: 1 } },
  calico: { name: 'Calico', supportsNetworkPolicy: true, structuralScores: { networkPolicy: 4.2 } },
  cilium: { name: 'Cilium', supportsNetworkPolicy: true, structuralScores: { networkPolicy: 5 } },
  antrea: { name: 'Antrea', supportsNetworkPolicy: true, structuralScores: { networkPolicy: 4.5 } },
};

const metricDefinitions = {
  latency: { key: 'latencia_ms', higherIsBetter: false },
  jitter: { key: 'jitter_ms', higherIsBetter: false },
  retransmits: { key: 'retransmits', higherIsBetter: false },
  throughput: { key: 'throughput_mbps', higherIsBetter: true },
  cpuEfficiency: { key: 'cpu_usada_pct', higherIsBetter: false },
  ramEfficiency: { key: 'ram_usada_mb', higherIsBetter: false },
};

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

function buildCniMetricsFromBenchmark(benchmarkPayload) {
  const rawCnis = benchmarkPayload.cnis;
  const entries = Object.entries(rawCnis).filter(([id]) => cniMetadata[id]);

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
    const policyScore = meta.supportsNetworkPolicy === false
      ? 1
      : Number.isFinite(policyOverhead)
        ? scoreFromRange(policyOverhead, minPolicyOverhead, maxPolicyOverhead, false)
        : meta.structuralScores.networkPolicy;

    return {
      id,
      name: meta.name,
      supportsNetworkPolicy: meta.supportsNetworkPolicy,
      scores: {
        latency: latencyScore,
        jitter: Number(average([jitterScore, retransmitScore]).toFixed(2)),
        throughput: throughputScore,
        resourceEfficiency: Number(average([cpuScore, ramScore]).toFixed(2)),
        networkPolicy: policyScore,
      },
    };
  });
}

const answers = {
  latencyNeed: 5,
  stabilityNeed: 5,
  throughputNeed: 1,
  resourceLimit: 1,
  securityNeed: 1,
};

const rawWeights = {
  latency: 0.8 + answers.latencyNeed * 0.85 + answers.stabilityNeed * 0.2,
  jitter: 0.6 + answers.stabilityNeed * 0.8 + answers.latencyNeed * 0.2,
  throughput: 0.8 + answers.throughputNeed * 0.9,
  resourceEfficiency: 0.8 + answers.resourceLimit * 0.9,
  networkPolicy: 0.8 + answers.securityNeed * 0.9,
};

const weights = normalizeWeights(rawWeights);
console.log('Weights:', weights);

const cnis = buildCniMetricsFromBenchmark(benchmark);
const results = cnis.map((cni) => {
  const rawTotal = Object.entries(weights).reduce((sum, [metric, weight]) => {
    const metricValue = cni.scores[metric] ?? 0;
    return sum + metricValue * weight;
  }, 0);

  const securityPenalized = answers.securityNeed >= 4 && cni.supportsNetworkPolicy === false;
  const finalScore = securityPenalized ? rawTotal * 0.4 : rawTotal;

  return {
    id: cni.id,
    name: cni.name,
    score: Number(finalScore.toFixed(3)),
    scoreFixed2: Number(finalScore.toFixed(2)),
    rawScore: Number(rawTotal.toFixed(3)),
    securityPenalized,
  };
});

console.log('Calculated results:', results);
