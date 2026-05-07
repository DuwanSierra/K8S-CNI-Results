const fs = require('fs');
const path = require('path');

// Apunta al directorio raiz 'results' del repositorio oficial
const baseDir = path.join(__dirname, '..', 'results', 'cni-benchmarks');
// Detecta automaticamente las carpetas (flannel, calico, cilium, antrea...)
const cnis = fs.existsSync(baseDir)
    ? fs.readdirSync(baseDir)
        .filter(fileName => fs.statSync(path.join(baseDir, fileName)).isDirectory())
        .sort()
    : [];
const outputData = {};

/**
 * Utilidades estadisticas.
 * La unidad de analisis es la ejecucion independiente (run), no cada muestra cruda.
 */
function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

function quantile(sorted, percentile) {
    if (sorted.length === 0) return null;
    if (sorted.length === 1) return sorted[0];

    const position = (sorted.length - 1) * percentile;
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.ceil(position);

    if (lowerIndex === upperIndex) {
        return sorted[lowerIndex];
    }

    const weight = position - lowerIndex;
    return sorted[lowerIndex] + ((sorted[upperIndex] - sorted[lowerIndex]) * weight);
}

function removeOutliers(values) {
    const cleanValues = values.filter(isFiniteNumber);
    if (cleanValues.length < 4) return cleanValues;

    const sorted = [...cleanValues].sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;

    if (iqr === 0) return cleanValues;

    const minValue = q1 - (iqr * 1.5);
    const maxValue = q3 + (iqr * 1.5);

    return cleanValues.filter(value => value >= minValue && value <= maxValue);
}

function getAverage(values) {
    const cleanValues = values.filter(isFiniteNumber);
    if (cleanValues.length === 0) return null;

    const sum = cleanValues.reduce((accumulator, value) => accumulator + value, 0);
    return sum / cleanValues.length;
}

function getRoundedValue(value, decimals = 2) {
    if (!isFiniteNumber(value)) return null;
    return parseFloat(value.toFixed(decimals));
}

function getMetricValue(data, metricKeyPath) {
    let value = data;

    for (const key of metricKeyPath.split('.')) {
        value = value ? value[key] : undefined;
    }

    return isFiniteNumber(value) ? value : null;
}

function summarizeRuns(runValues, totalRuns) {
    const validRunValues = runValues.filter(isFiniteNumber);
    const filteredRunValues = removeOutliers(validRunValues);

    return {
        value: getAverage(filteredRunValues),
        total_runs: totalRuns,
        valid_runs: validRunValues.length,
        used_runs: filteredRunValues.length,
        discarded_outliers: validRunValues.length - filteredRunValues.length
    };
}

function summarizeJSONRuns(dirPath, metricKeyPath) {
    if (!fs.existsSync(dirPath)) {
        return summarizeRuns([], 0);
    }

    const files = fs.readdirSync(dirPath)
        .filter(fileName => fileName.endsWith('.json'))
        .sort();

    const runValues = [];

    for (const fileName of files) {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(dirPath, fileName), 'utf8'));
            const value = getMetricValue(data, metricKeyPath);
            if (isFiniteNumber(value)) {
                runValues.push(value);
            }
        } catch (_error) {}
    }

    return summarizeRuns(runValues, files.length);
}

function summarizeCSVRuns(dirPath, filename) {
    if (!fs.existsSync(dirPath)) {
        return summarizeRuns([], 0);
    }

    const runDirs = fs.readdirSync(dirPath)
        .filter(dirName => fs.statSync(path.join(dirPath, dirName)).isDirectory())
        .sort();

    const runValues = [];

    for (const runDir of runDirs) {
        const csvPath = path.join(dirPath, runDir, 'csv', filename);
        if (!fs.existsSync(csvPath)) continue;

        const lines = fs.readFileSync(csvPath, 'utf8').split('\n');
        const sampleValues = [];

        for (let index = 1; index < lines.length; index++) {
            if (!lines[index].trim()) continue;

            const columns = lines[index].split('\t');
            if (columns.length < 3) continue;

            const value = parseFloat(columns[2]);
            if (Number.isFinite(value)) {
                sampleValues.push(value);
            }
        }

        const runAverage = getAverage(sampleValues);
        if (isFiniteNumber(runAverage)) {
            runValues.push(runAverage);
        }
    }

    return summarizeRuns(runValues, runDirs.length);
}

function formatSummary(summary, formatter) {
    return isFiniteNumber(summary.value) ? formatter(summary.value) : null;
}

function buildMetricStats(summary) {
    return {
        total_runs: summary.total_runs,
        valid_runs: summary.valid_runs,
        used_runs: summary.used_runs,
        discarded_outliers: summary.discarded_outliers
    };
}

function calculatePercentageDelta(baseValue, comparisonValue, direction) {
    if (!isFiniteNumber(baseValue) || !isFiniteNumber(comparisonValue) || baseValue <= 0 || comparisonValue <= 0) {
        return null;
    }

    if (direction === 'increase') {
        return getRoundedValue(((comparisonValue - baseValue) / baseValue) * 100, 2);
    }

    if (direction === 'decrease') {
        return getRoundedValue(((baseValue - comparisonValue) / baseValue) * 100, 2);
    }

    return null;
}

// Logica principal
cnis.forEach(cni => {
    const cniDir = path.join(baseDir, cni);
    if (!fs.existsSync(cniDir)) {
        console.log(`WARN: CNI ${cni} directory no esta presente.`);
        return;
    }

    const latencySummary = summarizeJSONRuns(path.join(cniDir, 'latency_tcp_connect'), 'tcp_connect_avg_ms');
    const latencyMaxSummary = summarizeJSONRuns(path.join(cniDir, 'latency_tcp_connect'), 'tcp_connect_max_ms');
    const jitterSummary = summarizeJSONRuns(path.join(cniDir, 'latency_tcp_connect'), 'tcp_connect_mdev_ms');
    const throughputSummary = summarizeJSONRuns(path.join(cniDir, 'throughput_tcp'), 'summary.receiver_bits_per_second');
    const retransmitsSummary = summarizeJSONRuns(path.join(cniDir, 'throughput_tcp'), 'summary.retransmits');
    const cpuSummary = summarizeCSVRuns(path.join(cniDir, 'resource_usage_nodes'), 'cpu_pct.csv');
    const memSummary = summarizeCSVRuns(path.join(cniDir, 'resource_usage_nodes'), 'mem_used_bytes.csv');

    outputData[cni] = {
        latencia_ms: formatSummary(latencySummary, value => getRoundedValue(value, 2)),
        latencia_max_ms: formatSummary(latencyMaxSummary, value => getRoundedValue(value, 2)),
        jitter_ms: formatSummary(jitterSummary, value => getRoundedValue(value, 2)),
        throughput_mbps: formatSummary(throughputSummary, value => getRoundedValue(value / 1000000, 2)),
        retransmits: formatSummary(retransmitsSummary, value => Math.round(value)),
        cpu_usada_pct: formatSummary(cpuSummary, value => getRoundedValue(value, 2)),
        ram_usada_mb: formatSummary(memSummary, value => getRoundedValue(value / (1024 * 1024), 2)),
        estadistica: {
            metodologia: 'mean-of-runs-after-iqr',
            latencia_ms: buildMetricStats(latencySummary),
            latencia_max_ms: buildMetricStats(latencyMaxSummary),
            jitter_ms: buildMetricStats(jitterSummary),
            throughput_mbps: buildMetricStats(throughputSummary),
            retransmits: buildMetricStats(retransmitsSummary),
            cpu_usada_pct: buildMetricStats(cpuSummary),
            ram_usada_mb: buildMetricStats(memSummary)
        }
    };

    // --- Procesamiento automatico de Network Policies (overhead) ---
    const npDir = path.join(cniDir, 'with_network_policy');
    if (fs.existsSync(npDir)) {
        const npCases = fs.readdirSync(npDir)
            .filter(fileName => fs.statSync(path.join(npDir, fileName)).isDirectory())
            .sort();

        if (npCases.length > 0) {
            outputData[cni].network_policy = {};
            npCases.forEach(npCase => {
                const caseDir = path.join(npDir, npCase);
                const npLatencySummary = summarizeJSONRuns(path.join(caseDir, 'latency_tcp_connect'), 'tcp_connect_avg_ms');
                const npThroughputSummary = summarizeJSONRuns(path.join(caseDir, 'throughput_tcp'), 'summary.receiver_bits_per_second');

                outputData[cni].network_policy[npCase] = {
                    latencia_ms: formatSummary(npLatencySummary, value => getRoundedValue(value, 2)),
                    throughput_mbps: formatSummary(npThroughputSummary, value => getRoundedValue(value / 1000000, 2)),
                    overhead_latencia_pct: calculatePercentageDelta(latencySummary.value, npLatencySummary.value, 'increase'),
                    overhead_throughput_pct: calculatePercentageDelta(throughputSummary.value, npThroughputSummary.value, 'decrease'),
                    estadistica: {
                        metodologia: 'mean-of-runs-after-iqr',
                        latencia_ms: buildMetricStats(npLatencySummary),
                        throughput_mbps: buildMetricStats(npThroughputSummary)
                    }
                };
            });
        }
    }
});

const fileContent = `const CNI_DATA = ${JSON.stringify(outputData, null, 4)};`;
fs.writeFileSync(path.join(__dirname, 'datos_consolidados.js'), fileContent);
console.log('Pipeline Data processing successful. datos_consolidados.js written to /docs with run-level aggregation.');
