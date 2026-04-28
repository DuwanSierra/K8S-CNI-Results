const fs = require('fs');
const path = require('path');

// Apunta al directorio raíz 'results' del repositorio oficial
const baseDir = path.join(__dirname, '..', 'results', 'cni-benchmarks');
// Detecta automáticamente las carpetas (flannel, calico, cilium, antrea...)
const cnis = fs.existsSync(baseDir) ? fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory()) : [];
const outputData = {};

/**
 * Filtro Estadístico IQR
 */
function removeOutliers(arr) {
    if (arr.length < 4) return arr; 
    const sorted = [...arr].sort((a,b) => a - b);
    const q1 = sorted[Math.floor((sorted.length / 4))];
    const q3 = sorted[Math.ceil((sorted.length * (3 / 4))) - 1];
    const iqr = q3 - q1;
    const maxValue = q3 + iqr * 1.5;
    const minValue = q1 - iqr * 1.5;
    
    return arr.filter(x => x !== null && !isNaN(x) && x >= minValue && x <= maxValue);
}

function getAverage(arr) {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}

function processJSONs(dirPath, metricKeyPath) {
    if (!fs.existsSync(dirPath)) return 0;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
    if (files.length === 0) return 0;

    let rawValues = [];

    for (const file of files) {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(dirPath, file), 'utf8'));
            let val = data;
            for (const k of metricKeyPath.split('.')) {
                val = val ? val[k] : undefined;
            }
            if (typeof val === 'number') rawValues.push(val);
        } catch(e) {}
    }
    const cleanValues = removeOutliers(rawValues);
    return getAverage(cleanValues);
}

function processCSV(dirPath, filename) {
    if (!fs.existsSync(dirPath)) return 0;
    const subdirs = fs.readdirSync(dirPath).filter(d => fs.statSync(path.join(dirPath, d)).isDirectory());
    if (subdirs.length === 0) return 0;
    
    let rawValues = [];

    for (const sub of subdirs) {
        const csvPath = path.join(dirPath, sub, 'csv', filename);
        if (fs.existsSync(csvPath)) {
            const lines = fs.readFileSync(csvPath, 'utf8').split('\n');
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const columns = lines[i].split('\t');
                if (columns.length >= 3) {
                    const val = parseFloat(columns[2]);
                    if (!isNaN(val)) rawValues.push(val);
                }
            }
        }
    }
    const cleanValues = removeOutliers(rawValues);
    return getAverage(cleanValues);
}

// Lógica Principal
cnis.forEach(cni => {
    const cniDir = path.join(baseDir, cni);
    if (!fs.existsSync(cniDir)) {
        console.log(`WARN: CNI ${cni} directory no está presente.`);
        return;
    }

    const avgLatencyMs = processJSONs(path.join(cniDir, 'latency_tcp_connect'), 'tcp_connect_avg_ms');
    const avgLatenciaMax = processJSONs(path.join(cniDir, 'latency_tcp_connect'), 'tcp_connect_max_ms');
    const avgJitterMs = processJSONs(path.join(cniDir, 'latency_tcp_connect'), 'tcp_connect_mdev_ms');
    const avgThroughputBps = processJSONs(path.join(cniDir, 'throughput_tcp'), 'summary.receiver_bits_per_second');
    const avgRetransmits = processJSONs(path.join(cniDir, 'throughput_tcp'), 'summary.retransmits');
    
    const avgCpuPct = processCSV(path.join(cniDir, 'resource_usage_nodes'), 'cpu_pct.csv');
    const avgMemBytes = processCSV(path.join(cniDir, 'resource_usage_nodes'), 'mem_used_bytes.csv');

    outputData[cni] = {
        latencia_ms: parseFloat(avgLatencyMs.toFixed(2)),
        latencia_max_ms: parseFloat(avgLatenciaMax.toFixed(2)),
        jitter_ms: parseFloat(avgJitterMs.toFixed(2)),
        throughput_mbps: parseFloat((avgThroughputBps / 1000000).toFixed(2)),
        retransmits: Math.round(avgRetransmits),
        cpu_usada_pct: parseFloat(avgCpuPct.toFixed(2)),
        ram_usada_mb: parseFloat((avgMemBytes / (1024 * 1024)).toFixed(2))
    };

    // --- Procesamiento Automático de Network Policies (Overhead) ---
    const npDir = path.join(cniDir, 'with_network_policy');
    if (fs.existsSync(npDir)) {
        const npCases = fs.readdirSync(npDir).filter(f => fs.statSync(path.join(npDir, f)).isDirectory());
        if (npCases.length > 0) {
            outputData[cni].network_policy = {};
            npCases.forEach(npCase => {
                const caseDir = path.join(npDir, npCase);
                const npLatencyMs = processJSONs(path.join(caseDir, 'latency_tcp_connect'), 'tcp_connect_avg_ms');
                const npThroughputBps = processJSONs(path.join(caseDir, 'throughput_tcp'), 'summary.receiver_bits_per_second');
                
                let overhead_latencia_pct = null;
                let overhead_throughput_pct = null;
                
                const npLatencyMsFormatted = npLatencyMs > 0 ? parseFloat(npLatencyMs.toFixed(2)) : null;
                const npThroughputMbpsFormatted = npThroughputBps > 0 ? parseFloat((npThroughputBps / 1000000).toFixed(2)) : null;

                // overhead_latencia = (NP - Baseline) / Baseline * 100
                if (avgLatencyMs > 0 && npLatencyMs > 0) {
                    overhead_latencia_pct = parseFloat((((npLatencyMs - avgLatencyMs) / avgLatencyMs) * 100).toFixed(2));
                }
                
                // overhead_throughput = (Baseline - NP) / Baseline * 100
                if (avgThroughputBps > 0 && npThroughputBps > 0) {
                    overhead_throughput_pct = parseFloat((((avgThroughputBps - npThroughputBps) / avgThroughputBps) * 100).toFixed(2));
                }

                outputData[cni].network_policy[npCase] = {
                    latencia_ms: npLatencyMsFormatted,
                    throughput_mbps: npThroughputMbpsFormatted,
                    overhead_latencia_pct: overhead_latencia_pct,
                    overhead_throughput_pct: overhead_throughput_pct
                };
            });
        }
    }
});

const fileContent = `const CNI_DATA = ${JSON.stringify(outputData, null, 4)};`;
fs.writeFileSync(path.join(__dirname, 'datos_consolidados.js'), fileContent);
console.log('✅ Pipeline Data processing successful. datos_consolidados.js written to /docs.');
