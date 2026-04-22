document.addEventListener('DOMContentLoaded', () => {
    if (typeof CNI_DATA === 'undefined') {
        alert('Error: No se encontraron los datos. Ejecuta el comando: node procesador.js');
        return;
    }

    const cnis = Object.keys(CNI_DATA);
    
    // Preparar Data (Añade Peor Escenario)
    const throughputs = cnis.map(c => CNI_DATA[c].throughput_mbps);
    const retransmits = cnis.map(c => CNI_DATA[c].retransmits);
    const latMax = cnis.map(c => CNI_DATA[c].latencia_max_ms);
    const latencias = cnis.map(c => CNI_DATA[c].latencia_ms);
    const jitters = cnis.map(c => CNI_DATA[c].jitter_ms);
    const cpus = cnis.map(c => CNI_DATA[c].cpu_usada_pct);
    const rams = cnis.map(c => CNI_DATA[c].ram_usada_mb);

    Chart.defaults.font.family = "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    Chart.defaults.color = '#64748b';

    function crearBarChart(id, label, data, color) {
        new Chart(document.getElementById(id), {
            type: 'bar',
            data: {
                labels: cnis.map(c => c.toUpperCase()),
                datasets: [{ label, data, backgroundColor: color, borderRadius: 6 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    function crearDoughnut(id, data, color) {
        new Chart(document.getElementById(id), {
            type: 'doughnut',
            data: {
                labels: cnis.map(c => c.toUpperCase()),
                datasets: [{ data, backgroundColor: [color, 'rgba(167, 139, 250, 0.5)', 'rgba(196, 181, 253, 0.5)'] }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom' } } }
        });
    }

    // Dibujar las 7 gráficas
    crearBarChart('chartThroughput', 'Mbps', throughputs, 'rgba(16, 185, 129, 0.8)');
    crearBarChart('chartRetransmits', 'Paquetes', retransmits, 'rgba(243, 112, 113, 0.8)');
    crearBarChart('chartLatMax', 'Max RTT (ms)', latMax, 'rgba(220, 38, 38, 0.8)'); // Rojo
    crearBarChart('chartLatencia', 'Avg RTT (ms)', latencias, 'rgba(245, 158, 11, 0.8)');
    crearBarChart('chartJitter', 'MDEV (ms)', jitters, 'rgba(249, 115, 22, 0.8)');
    crearDoughnut('chartCPU', cpus, 'rgba(139, 92, 246, 0.8)');
    crearDoughnut('chartRAM', rams, 'rgba(99, 102, 241, 0.8)');

    // --- AUTO-EXPLICACIÓN INFERENCIAL ---
    const getBest = (key, higherIsBetter = false) => {
        return cnis.reduce((a, b) => {
            return higherIsBetter ? 
                (CNI_DATA[a][key] > CNI_DATA[b][key] ? a : b) : 
                (CNI_DATA[a][key] < CNI_DATA[b][key] ? a : b);
        });
    };

    const bestThroughput = getBest('throughput_mbps', true);
    const bestRetransmits = getBest('retransmits', false);
    const bestLatMax = getBest('latencia_max_ms', false);
    const bestLatencia = getBest('latencia_ms', false);
    const bestJitter = getBest('jitter_ms', false);
    const bestCPU = getBest('cpu_usada_pct', false);
    const bestRAM = getBest('ram_usada_mb', false);

    document.getElementById('resThroughput').innerHTML = 
        `<strong>${bestThroughput.toUpperCase()}</strong> lidera la autopista con <strong>${CNI_DATA[bestThroughput].throughput_mbps} Mbps</strong>.`;
    
    document.getElementById('resRetransmits').innerHTML = 
        `<strong>${bestRetransmits.toUpperCase()}</strong> tuvo solo <strong>${CNI_DATA[bestRetransmits].retransmits} accidentes de paquetes</strong> (red muchísimo estable).`;

    document.getElementById('resLatMax').innerHTML = 
        `<strong>${bestLatMax.toUpperCase()}</strong> garantizó un peor-escenario más bajo, tocando techo en tan solo <strong>${CNI_DATA[bestLatMax].latencia_max_ms} ms</strong> frente al estrés.`;

    document.getElementById('resLatencia').innerHTML = 
        `<strong>${bestLatencia.toUpperCase()}</strong> ofrece en promedio menos demora (<strong>${CNI_DATA[bestLatencia].latencia_ms} ms</strong>).`;
    
    document.getElementById('resJitter').innerHTML = 
        `<strong>${bestJitter.toUpperCase()}</strong> es más ordenado, variando solo en <strong>${CNI_DATA[bestJitter].jitter_ms} ms</strong> sus transmisiones.`;

    document.getElementById('resCPU').innerHTML = 
        `<strong>${bestCPU.toUpperCase()}</strong> salva el baúl térmico de tu servidor usando casi la mitad de procesador (<strong>${CNI_DATA[bestCPU].cpu_usada_pct}%</strong>).`;
    
    document.getElementById('resRAM').innerHTML = 
        `<strong>${bestRAM.toUpperCase()}</strong> retiene menos espacio en disco vivo (<strong>${CNI_DATA[bestRAM].ram_usada_mb} MB</strong>) promedio.`;
});

// -- EXPORT FUNCTIONALITY --
window.descargarPNG = async function(canvasId, fileName) {
    const canvas = document.getElementById(canvasId);
    const newCanvas = document.createElement('canvas');
    newCanvas.width = canvas.width; newCanvas.height = canvas.height;
    const ctx = newCanvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0,0, newCanvas.width, newCanvas.height);
    ctx.drawImage(canvas, 0, 0);
    const link = document.createElement('a');
    link.download = fileName + '.png'; link.href = newCanvas.toDataURL('image/png'); link.click();
};

window.descargarPDF = async function() {
    const { jsPDF } = window.jspdf; const doc = new jsPDF('p', 'mm', 'a4');
    alert('Generando PDF del reporte, esto puede tardar unos segundos...');
    const content = document.getElementById('reporte-body');
    const canvas = await html2canvas(content, { scale: 1.5 });
    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    doc.save('Análisis_Rendimiento_CNI_Tesis.pdf');
};
