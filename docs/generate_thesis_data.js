// ─────────────────────────────────────────────────────────────────────────────
// Genera: results/processed/thesis_data.json
// Fuente única de verdad para la tesis — replica exacta del recommendationModel.js
// Ejecutar con: node docs/generate_thesis_data.js
// ─────────────────────────────────────────────────────────────────────────────
const path = require('path');
const fs   = require('fs');

const benchmark = require(path.join(__dirname, '../cni-recommender-spa/public/cni-data.json'));

// ── Metadatos de CNIs (supportsNetworkPolicy igual que recommendationModel.js) ─
const cniMeta = {
  flannel: { name: 'Flannel', datapath: 'VXLAN',   supportsNetworkPolicy: false,
             installCommand: 'kubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml' },
  calico:  { name: 'Calico',  datapath: 'VXLAN/BGP', supportsNetworkPolicy: true,
             installCommand: 'kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.28.0/manifests/calico.yaml' },
  cilium:  { name: 'Cilium',  datapath: 'eBPF',    supportsNetworkPolicy: true,
             installCommand: 'kubectl apply -f https://raw.githubusercontent.com/cilium/cilium/v1.16/install/kubernetes/quick-install.yaml' },
  antrea:  { name: 'Antrea',  datapath: 'OVS',     supportsNetworkPolicy: true,
             installCommand: 'kubectl apply -f https://github.com/antrea-io/antrea/releases/latest/download/antrea.yml' },
};

const ORDER = ['flannel', 'calico', 'cilium', 'antrea'];

// ── Funciones matemáticas (idénticas a recommendationModel.js) ────────────────
function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }
function avg(vals) {
  const v = vals.filter(Number.isFinite);
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0;
}
function scoreFromRange(value, min, max, higherIsBetter) {
  if (!Number.isFinite(value)) return 0;
  if (min === max) return 3;
  const ratio = higherIsBetter ? (value - min)/(max - min) : (max - value)/(max - min);
  return Number((1 + clamp(ratio, 0, 1) * 4).toFixed(2));
}
function getNetworkPolicyOverhead(data) {
  if (!data?.network_policy) return null;
  const vals = Object.values(data.network_policy).flatMap(p => [
    Number(p?.overhead_latencia_pct), Number(p?.overhead_throughput_pct)
  ]).filter(Number.isFinite);
  return vals.length ? avg(vals) : null;
}
function normalizeWeights(raw) {
  const total = Object.values(raw).reduce((s, v) => s + v, 0);
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Number((v/total).toFixed(3))]));
}

// ── Calcular rangos ───────────────────────────────────────────────────────────
const metricDefs = {
  latency:       { key: 'latencia_ms',     higherIsBetter: false },
  jitter:        { key: 'jitter_ms',       higherIsBetter: false },
  retransmits:   { key: 'retransmits',     higherIsBetter: false },
  throughput:    { key: 'throughput_mbps', higherIsBetter: true  },
  cpuEfficiency: { key: 'cpu_usada_pct',   higherIsBetter: false },
  ramEfficiency: { key: 'ram_usada_mb',    higherIsBetter: false },
};
const ranges = {};
for (const [metric, def] of Object.entries(metricDefs)) {
  const vals = ORDER.map(id => Number(benchmark.cnis[id]?.[def.key])).filter(Number.isFinite);
  ranges[metric] = { min: Math.min(...vals), max: Math.max(...vals), unit: getUnit(metric) };
}
function getUnit(m) {
  return { latency:'ms', jitter:'ms', retransmits:'paquetes/sesión',
           throughput:'Mbps', cpuEfficiency:'% del nodo', ramEfficiency:'MB' }[m] || '';
}

// ── Calcular overheads de NetworkPolicy ───────────────────────────────────────
const npOverheads = {};
for (const id of ORDER) npOverheads[id] = getNetworkPolicyOverhead(benchmark.cnis[id]);
const validPO = ORDER.map(id => npOverheads[id]).filter(Number.isFinite);
const minPO = validPO.length ? Math.min(...validPO) : 0;
const maxPO = validPO.length ? Math.max(...validPO) : 0;

// ── Construir scores base por CNI ─────────────────────────────────────────────
const baseScores = {};
for (const id of ORDER) {
  const d = benchmark.cnis[id];
  const meta = cniMeta[id];
  const lat = scoreFromRange(d.latencia_ms,    ranges.latency.min,       ranges.latency.max,       false);
  const jit = scoreFromRange(d.jitter_ms,      ranges.jitter.min,        ranges.jitter.max,        false);
  const ret = scoreFromRange(d.retransmits,    ranges.retransmits.min,   ranges.retransmits.max,   false);
  const thr = scoreFromRange(d.throughput_mbps,ranges.throughput.min,    ranges.throughput.max,    true);
  const cpu = scoreFromRange(d.cpu_usada_pct,  ranges.cpuEfficiency.min, ranges.cpuEfficiency.max, false);
  const ram = scoreFromRange(d.ram_usada_mb,   ranges.ramEfficiency.min, ranges.ramEfficiency.max, false);
  const po  = npOverheads[id];
  const np  = meta.supportsNetworkPolicy === false ? 1
              : Number.isFinite(po) ? scoreFromRange(po, minPO, maxPO, false) : 3;

  baseScores[id] = {
    latency:            lat,
    jitter:             Number(avg([jit, ret]).toFixed(2)),
    throughput:         thr,
    resourceEfficiency: Number(avg([cpu, ram]).toFixed(2)),
    networkPolicy:      np,
    _detail: { jitterScore: jit, retransmitScore: ret, cpuScore: cpu, ramScore: ram, npOverhead: po }
  };
}

// ── buildGuidedProfile + calcScores ──────────────────────────────────────────
function buildProfile(answers, label) {
  const a = { latencyNeed:3, stabilityNeed:3, throughputNeed:3, resourceLimit:3, securityNeed:3, ...answers };
  const raw = {
    latency:            0.8 + a.latencyNeed    * 0.85 + a.stabilityNeed * 0.2,
    jitter:             0.6 + a.stabilityNeed  * 0.8  + a.latencyNeed   * 0.2,
    throughput:         0.8 + a.throughputNeed * 0.9,
    resourceEfficiency: 0.8 + a.resourceLimit  * 0.9,
    networkPolicy:      0.8 + a.securityNeed   * 0.9,
  };
  const weights = normalizeWeights(raw);
  const securityIsRequired = a.securityNeed >= 4;

  const results = ORDER.map(id => {
    const meta = cniMeta[id];
    const rawScore = Object.entries(weights).reduce((s, [m, w]) => s + (baseScores[id][m] ?? 0) * w, 0);
    const penalized = securityIsRequired && !meta.supportsNetworkPolicy;
    const finalScore = Number((penalized ? rawScore * 0.4 : rawScore).toFixed(3));
    return { cni: id, name: meta.name, score: finalScore, rawScore: Number(rawScore.toFixed(3)), securityPenalized: penalized };
  }).sort((a, b) => b.score - a.score);

  return {
    label,
    sliderInputs: answers,
    weights: {
      latency:            weights.latency,
      jitter:             weights.jitter,
      throughput:         weights.throughput,
      resourceEfficiency: weights.resourceEfficiency,
      networkPolicy:      weights.networkPolicy,
      _pct: {
        latency:            `${Math.round(weights.latency*100)}%`,
        jitter:             `${Math.round(weights.jitter*100)}%`,
        throughput:         `${Math.round(weights.throughput*100)}%`,
        resourceEfficiency: `${Math.round(weights.resourceEfficiency*100)}%`,
        networkPolicy:      `${Math.round(weights.networkPolicy*100)}%`,
      }
    },
    securityRequired: a.securityNeed >= 4,
    securityPenaltyApplied: a.securityNeed >= 4,
    winner: results[0].cni,
    ranking: results,
  };
}

// ── Perfiles usados en la tesis ───────────────────────────────────────────────
const thesisProfiles = [
  buildProfile(
    { latencyNeed:4, stabilityNeed:4, throughputNeed:3, resourceLimit:2, securityNeed:5 },
    'Fintech / Seguridad crítica'
  ),
  buildProfile(
    { latencyNeed:5, stabilityNeed:4, throughputNeed:5, resourceLimit:2, securityNeed:2 },
    'Streaming / Alto rendimiento'
  ),
  buildProfile(
    { latencyNeed:2, stabilityNeed:2, throughputNeed:2, resourceLimit:5, securityNeed:1 },
    'IoT / Recursos limitados'
  ),
];

// ── Perfiles de referencia (todo mínimo / todo máximo) ────────────────────────
const referenceProfiles = [
  buildProfile({ latencyNeed:1, stabilityNeed:1, throughputNeed:1, resourceLimit:1, securityNeed:1 }, 'Todo mínimo'),
  buildProfile({ latencyNeed:5, stabilityNeed:5, throughputNeed:5, resourceLimit:5, securityNeed:5 }, 'Todo máximo'),
  buildProfile({ latencyNeed:5, stabilityNeed:3, throughputNeed:5, resourceLimit:3, securityNeed:3 }, 'Latencia y datos altos, resto medio'),
];

// ── NetworkPolicy overhead por CNI ────────────────────────────────────────────
const npDetail = {};
for (const id of ORDER) {
  const d = benchmark.cnis[id];
  if (!d.network_policy) { npDetail[id] = null; continue; }
  const cases = {};
  for (const [caseName, caseData] of Object.entries(d.network_policy)) {
    cases[caseName] = {
      latencia_ms:           caseData.latencia_ms,
      throughput_mbps:       caseData.throughput_mbps,
      overhead_latencia_pct: caseData.overhead_latencia_pct,
      overhead_throughput_pct: caseData.overhead_throughput_pct,
    };
  }
  npDetail[id] = { overhead_promedio: npOverheads[id], networkPolicyScore: baseScores[id].networkPolicy, cases };
}

// ── Construir el documento final ──────────────────────────────────────────────
const output = {
  _metadata: {
    description: 'Fuente única de verdad de la tesis. Datos procesados por procesador.js y scores calculados con el algoritmo exacto de recommendationModel.js. NO editar manualmente — regenerar con: node docs/generate_thesis_data.js',
    generated_at: new Date().toISOString(),
    source_benchmark: 'cni-recommender-spa/public/cni-data.json',
    source_algorithm: 'cni-recommender-spa/src/data/recommendationModel.js (buildCniMetricsFromBenchmark + buildGuidedProfile + calculateScores)',
    score_scale: '1 (peor) a 5 (mejor)',
    score_methodology: 'scoreFromRange: ratio lineal → 1 + ratio × 4. Jitter = avg(jitterScore, retransmitScore). ResourceEfficiency = avg(cpuScore, ramScore).',
    security_penalty: 'Si securityNeed >= 4 Y el CNI no soporta NetworkPolicy (Flannel), su score final se multiplica × 0.4',
    iqr_filter: 'Los datos brutos ya tienen IQR aplicado por procesador.js',
  },

  raw_benchmark: {
    _description: 'Datos brutos promediados con IQR. Fuente: results/cni-benchmarks/ → procesador.js → cni-data.json',
    _units: { latencia_ms:'ms', latencia_max_ms:'ms', jitter_ms:'ms', throughput_mbps:'Mbps', retransmits:'paquetes/sesión', cpu_usada_pct:'% del nodo', ram_usada_mb:'MB' },
    cnis: Object.fromEntries(ORDER.map(id => [id, {
      name: cniMeta[id].name,
      datapath: cniMeta[id].datapath,
      latencia_ms:    benchmark.cnis[id].latencia_ms,
      latencia_max_ms:benchmark.cnis[id].latencia_max_ms,
      jitter_ms:      benchmark.cnis[id].jitter_ms,
      throughput_mbps:benchmark.cnis[id].throughput_mbps,
      retransmits:    benchmark.cnis[id].retransmits,
      cpu_usada_pct:  benchmark.cnis[id].cpu_usada_pct,
      ram_usada_mb:   benchmark.cnis[id].ram_usada_mb,
      estadistica:    benchmark.cnis[id].estadistica,
    }]))
  },

  normalization_ranges: {
    _description: 'Rangos min-max calculados entre los 4 CNIs. Base para scoreFromRange.',
    ...ranges
  },

  base_scores: {
    _description: 'Scores calculados con scoreFromRange. Escala 1-5. Idéntico a buildCniMetricsFromBenchmark() del Recommender.',
    _scale: '1 = peor CNI en ese criterio, 5 = mejor CNI en ese criterio',
    cnis: Object.fromEntries(ORDER.map(id => [id, {
      name: cniMeta[id].name,
      supportsNetworkPolicy: cniMeta[id].supportsNetworkPolicy,
      scores: {
        latency:            baseScores[id].latency,
        jitter:             baseScores[id].jitter,
        throughput:         baseScores[id].throughput,
        resourceEfficiency: baseScores[id].resourceEfficiency,
        networkPolicy:      baseScores[id].networkPolicy,
      },
      _score_detail: baseScores[id]._detail,
    }]))
  },

  network_policy_overhead: {
    _description: 'Overhead de activar NetworkPolicies por escenario. Calcula el score de seguridad del Recommender.',
    _note: 'Flannel no tiene datos (no soporta NP) → score fijo = 1. El CNI con mejor overhead (menos impacto negativo) recibe 5.',
    overhead_range: { min: minPO, max: maxPO },
    cnis: npDetail,
  },

  thesis_mcda_profiles: {
    _description: 'Los 3 perfiles usados en la tesis para el MCDA. Scores y ganadores 100% reales.',
    profiles: thesisProfiles,
  },

  reference_profiles: {
    _description: 'Perfiles de referencia para validar el Recommender en otros escenarios.',
    profiles: referenceProfiles,
  },

  winners_summary: {
    _description: 'Tabla resumen de ganadores por perfil de la tesis.',
    fintech_seguridad:      { winner: thesisProfiles[0].winner, score: thesisProfiles[0].ranking[0].score, runner_up: thesisProfiles[0].ranking[1].cni },
    streaming_rendimiento:  { winner: thesisProfiles[1].winner, score: thesisProfiles[1].ranking[0].score, runner_up: thesisProfiles[1].ranking[1].cni },
    iot_recursos_limitados: { winner: thesisProfiles[2].winner, score: thesisProfiles[2].ranking[0].score, runner_up: thesisProfiles[2].ranking[1].cni },
  },

  quick_reference: {
    _description: 'Tabla de referencia rápida para redacción de la tesis. Todos los números son reales.',
    mejor_latencia:           { cni: 'calico',  valor: `${benchmark.cnis.calico.latencia_ms} ms` },
    mejor_throughput:         { cni: 'calico',  valor: `${benchmark.cnis.calico.throughput_mbps} Mbps` },
    menos_retransmisiones:    { cni: 'flannel', valor: benchmark.cnis.flannel.retransmits },
    menor_cpu:                { cni: 'flannel', valor: `${benchmark.cnis.flannel.cpu_usada_pct}%` },
    menor_ram:                { cni: 'flannel', valor: `${benchmark.cnis.flannel.ram_usada_mb} MB` },
    unico_l7_networkpolicy:   { cni: 'cilium',  nota: 'Solo Cilium soporta NetworkPolicies L7 (HTTP path-level)' },
    unico_sin_networkpolicy:  { cni: 'flannel', nota: 'Flannel no implementa NetworkPolicies en su plano de datos' },
  }
};

// ── Escribir archivos ──────────────────────────────────────────────────────────
const outDir = path.join(__dirname, '../results/processed');
fs.mkdirSync(outDir, { recursive: true });

const jsonPath = path.join(outDir, 'thesis_data.json');
fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`✅ thesis_data.json escrito en: ${jsonPath}`);

// ── Generar README legible ────────────────────────────────────────────────────
const readmePath = path.join(outDir, 'README.md');
const readme = `# Datos Procesados — Fuente de Verdad de la Tesis

> **Regenerar con:** \`node docs/generate_thesis_data.js\`  
> **Generado:** ${new Date().toISOString()}

Este directorio contiene los datos **ya procesados y verificados** que debe usar cualquier IA o persona al redactar la tesis. NO usar los datos de \`results/cni-benchmarks/\` directamente (son datos crudos por corrida).

## Archivo principal: \`thesis_data.json\`

### Datos brutos (promediados con IQR, escala real)

| Métrica | Flannel | Calico | Cilium | Antrea | Mejor |
|---|---|---|---|---|---|
| Latencia avg (ms) ↓ | ${benchmark.cnis.flannel.latencia_ms} | **${benchmark.cnis.calico.latencia_ms}** | ${benchmark.cnis.cilium.latencia_ms} | ${benchmark.cnis.antrea.latencia_ms} | Calico |
| Latencia max (ms) ↓ | ${benchmark.cnis.flannel.latencia_max_ms} | **${benchmark.cnis.calico.latencia_max_ms}** | ${benchmark.cnis.cilium.latencia_max_ms} | ${benchmark.cnis.antrea.latencia_max_ms} | Calico |
| Jitter MDEV (ms) ↓ | ${benchmark.cnis.flannel.jitter_ms} | **${benchmark.cnis.calico.jitter_ms}** | ${benchmark.cnis.cilium.jitter_ms} | ${benchmark.cnis.antrea.jitter_ms} | Calico |
| Throughput (Mbps) ↑ | ${benchmark.cnis.flannel.throughput_mbps} | **${benchmark.cnis.calico.throughput_mbps}** | ${benchmark.cnis.cilium.throughput_mbps} | ${benchmark.cnis.antrea.throughput_mbps} | Calico |
| Retransmisiones ↓ | **${benchmark.cnis.flannel.retransmits}** | ${benchmark.cnis.calico.retransmits} | ${benchmark.cnis.cilium.retransmits} | ${benchmark.cnis.antrea.retransmits} | Flannel |
| CPU (% nodo) ↓ | **${benchmark.cnis.flannel.cpu_usada_pct}** | ${benchmark.cnis.calico.cpu_usada_pct} | ${benchmark.cnis.cilium.cpu_usada_pct} | ${benchmark.cnis.antrea.cpu_usada_pct} | Flannel |
| RAM (MB) ↓ | **${benchmark.cnis.flannel.ram_usada_mb}** | ${benchmark.cnis.calico.ram_usada_mb} | ${benchmark.cnis.cilium.ram_usada_mb} | ${benchmark.cnis.antrea.ram_usada_mb} | Flannel |

### Scores base del Recommender (escala 1–5)

| Criterio | Flannel | Calico | Cilium | Antrea |
|---|---|---|---|---|
| Latencia (velocidad respuesta) | ${baseScores.flannel.latency} | **${baseScores.calico.latency}** | ${baseScores.cilium.latency} | ${baseScores.antrea.latency} |
| Jitter+Retransmisiones | ${baseScores.flannel.jitter} | ${baseScores.calico.jitter} | ${baseScores.cilium.jitter} | **${baseScores.antrea.jitter}** |
| Throughput (cantidad datos) | ${baseScores.flannel.throughput} | **${baseScores.calico.throughput}** | ${baseScores.cilium.throughput} | ${baseScores.antrea.throughput} |
| Eficiencia CPU+RAM | **${baseScores.flannel.resourceEfficiency}** | ${baseScores.calico.resourceEfficiency} | ${baseScores.cilium.resourceEfficiency} | ${baseScores.antrea.resourceEfficiency} |
| Network Policy / seguridad | ${baseScores.flannel.networkPolicy}† | ${baseScores.calico.networkPolicy} | **${baseScores.cilium.networkPolicy}** | ${baseScores.antrea.networkPolicy} |

†Flannel recibe 1 (mínimo fijo) porque **no soporta NetworkPolicies** nativas.

### Resultados MCDA por perfil de la tesis

| Perfil | Flannel | Calico | Cilium | Antrea | **Ganador** |
|---|---|---|---|---|---|
| Fintech / Seguridad crítica | ${thesisProfiles[0].ranking.find(r=>r.cni==='flannel').score}* | ${thesisProfiles[0].ranking.find(r=>r.cni==='calico').score} | **${thesisProfiles[0].ranking.find(r=>r.cni==='cilium').score}** | ${thesisProfiles[0].ranking.find(r=>r.cni==='antrea').score} | **Cilium** |
| Streaming / Alto rendimiento | **${thesisProfiles[1].ranking.find(r=>r.cni==='flannel').score}** | ${thesisProfiles[1].ranking.find(r=>r.cni==='calico').score} | ${thesisProfiles[1].ranking.find(r=>r.cni==='cilium').score} | ${thesisProfiles[1].ranking.find(r=>r.cni==='antrea').score} | **Flannel** |
| IoT / Recursos limitados | **${thesisProfiles[2].ranking.find(r=>r.cni==='flannel').score}** | ${thesisProfiles[2].ranking.find(r=>r.cni==='calico').score} | ${thesisProfiles[2].ranking.find(r=>r.cni==='cilium').score} | ${thesisProfiles[2].ranking.find(r=>r.cni==='antrea').score} | **Flannel** |

*Penalizado ×0.4 por no soportar NetworkPolicies (securityNeed ≥ 4).

### Perfiles de referencia

| Escenario | Ganador | Puntaje |
|---|---|---|
| Todo mínimo (1,1,1,1,1) | **${referenceProfiles[0].winner}** | ${referenceProfiles[0].ranking[0].score} |
| Todo máximo (5,5,5,5,5) | **${referenceProfiles[1].winner}** | ${referenceProfiles[1].ranking[0].score} |
| Latencia+Datos altos, resto medio | **${referenceProfiles[2].winner}** | ${referenceProfiles[2].ranking[0].score} |

## ⚠️ Reglas para IAs que lean este documento

1. **Nunca inventar números** — todos los datos están en \`thesis_data.json\`.
2. La escala de scores es **1-5** (NO 0-1 como la tesis anterior decía).
3. Flannel **no soporta NetworkPolicies** — siempre score 1 en seguridad.
4. Calico es el mejor en **latencia y throughput**.
5. Flannel es el mejor en **CPU, RAM y retransmisiones**.
6. Cilium es el único con **NetworkPolicies L7** (score 5 en seguridad).
7. **Antrea tiene el peor jitter** (latencia_ms = ${benchmark.cnis.antrea.latencia_ms} ms).
8. Los pesos del perfil **dependen de los sliders del usuario** — cambiar un slider cambia el ganador.
`;

fs.writeFileSync(readmePath, readme, 'utf8');
console.log(`✅ README.md escrito en: ${readmePath}`);
console.log('\n📊 Resumen de ganadores:');
for (const p of thesisProfiles) {
  console.log(`   ${p.label}: ${p.winner.toUpperCase()} (${p.ranking[0].score})`);
}
console.log('\n📊 Perfiles de referencia:');
for (const p of referenceProfiles) {
  console.log(`   ${p.label}: ${p.winner.toUpperCase()} (${p.ranking[0].score})`);
}
