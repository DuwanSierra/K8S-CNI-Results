const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, PageBreak, Footer, Header, VerticalAlign
} = require('docx');
const fs = require('fs');

// ── helpers ──────────────────────────────────────────────────────────────────
const BLUE   = "1F4E79";
const LBLUE  = "2E75B6";
const GRAY   = "F2F2F2";
const DKGRAY = "404040";

const border1 = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders  = { top: border1, bottom: border1, left: border1, right: border1 };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LBLUE, space: 6 } },
    children: [new TextRun({ text, font: "Arial", size: 32, bold: true, color: BLUE })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: LBLUE })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 100 },
    children: [new TextRun({ text, font: "Arial", size: 24, bold: true, color: DKGRAY })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 80, after: 140, line: 360 },
    children: [new TextRun({
      text,
      font: "Arial",
      size: 22,
      color: opts.color || "000000",
      bold: opts.bold || false,
      italics: opts.italic || false
    })]
  });
}

function pMix(runs) {
  const children = runs.map(r =>
    new TextRun({ font: "Arial", size: 22, color: "000000", ...r })
  );
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 80, after: 140, line: 360 },
    children
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 22 })]
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 22 })]
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function spacer() {
  return new Paragraph({ spacing: { before: 120, after: 120 }, children: [new TextRun("")] });
}

function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 160 },
    children: [new TextRun({ text, font: "Arial", size: 20, italics: true, color: "555555" })]
  });
}

function infoBox(title, lines) {
  const rows = [
    new TableRow({
      children: [new TableCell({
        shading: { fill: "1F4E79", type: ShadingType.CLEAR },
        borders,
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        children: [new Paragraph({
          children: [new TextRun({ text: title, font: "Arial", size: 22, bold: true, color: "FFFFFF" })]
        })]
      })]
    }),
    ...lines.map(line => new TableRow({
      children: [new TableCell({
        shading: { fill: "EBF3FA", type: ShadingType.CLEAR },
        borders,
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
        children: [new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({ text: line, font: "Arial", size: 21 })]
        })]
      })]
    }))
  ];
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows
  });
}

function twoColTable(headers, rows2, widths = [3000, 6026]) {
  const hRow = new TableRow({
    children: headers.map((h, i) => new TableCell({
      shading: { fill: "1F4E79", type: ShadingType.CLEAR },
      borders,
      width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: h, font: "Arial", size: 21, bold: true, color: "FFFFFF" })]
      })]
    }))
  });
  const dataRows = rows2.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      shading: { fill: ri % 2 === 0 ? "EBF3FA" : "FFFFFF", type: ShadingType.CLEAR },
      borders,
      width: { size: widths[ci], type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: cell, font: "Arial", size: 21 })]
      })]
    }))
  }));
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: widths,
    rows: [hRow, ...dataRows]
  });
}

// ── DOCUMENT ─────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "\u25CB", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }
        ]
      },
      {
        reference: "numbers",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }
        ]
      },
      {
        reference: "refs",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "[%1]", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } }
        ]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: LBLUE },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: DKGRAY },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2 } }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1701 }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: LBLUE, space: 4 } },
          children: [
            new TextRun({ text: "Universidad Distrital Francisco José de Caldas  |  Ingeniería en Telemática  |  Página ", font: "Arial", size: 18, color: "666666" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "666666" })
          ]
        })]
      })
    },
    children: [

      // ══════════════════════════════════════════════════════════════════════
      // PORTADA DEL CAPÍTULO
      // ══════════════════════════════════════════════════════════════════════
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1440, after: 80 },
        children: [new TextRun({ text: "CAPÍTULO III", font: "Arial", size: 28, bold: true, color: "888888" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: "DISEÑO DE LA SOLUCIÓN", font: "Arial", size: 52, bold: true, color: BLUE })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LBLUE, space: 10 } },
        children: [new TextRun({ text: " ", font: "Arial", size: 22 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 1440 },
        children: [new TextRun({
          text: "Optimización Integral de Redes Kubernetes: Comparativa de CNIs,\nAutomatización de NetworkPolicies y Reducción de Sobredimensionamientos",
          font: "Arial", size: 26, italics: true, color: "444444"
        })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Holman Audrey Alba Castro  |  Duwan Estiven Sierra Guerrero", font: "Arial", size: 22, color: "555555" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Director: Gerardo Alberto Castang Montiel", font: "Arial", size: 22, color: "555555" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Universidad Distrital Francisco José de Caldas — Facultad Tecnológica", font: "Arial", size: 22, color: "555555" })]
      }),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // INTRODUCCIÓN AL CAPÍTULO
      // ══════════════════════════════════════════════════════════════════════
      h1("3. Diseño de la Solución"),
      p("Este capítulo describe, de manera detallada y comprensible, cómo se diseñó e implementó la solución propuesta para comparar las tecnologías de red que se utilizan dentro de un clúster Kubernetes. Para quienes no están familiarizados con el tema, un clúster Kubernetes es como una ciudad de servidores donde muchas aplicaciones conviven y se comunican entre sí; la \"red\" de esa ciudad es lo que garantiza que cada aplicación pueda hablar con las demás de forma rápida, segura y eficiente."),
      p("El diseño presentado en este capítulo responde directamente a las causas del problema identificadas en el árbol de problemas: la falta de criterios objetivos para seleccionar el componente de red (CNI), la ausencia de visibilidad sobre el tráfico que circula dentro del clúster, y el sobredimensionamiento de recursos que resulta de operar sin datos reales. La solución se construyó sobre cuatro pilares fundamentales: (1) una arquitectura de red bien definida, (2) un sistema de medición de Calidad de Servicio (QoS), (3) un modelo matemático para la toma de decisiones y (4) una estrategia de seguridad automatizada. Cada uno de estos pilares se explica a continuación con sus fundamentos técnicos y su justificación desde la telemática."),
      spacer(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 3.1 – ARQUITECTURA DE RED
      // ══════════════════════════════════════════════════════════════════════
      h2("3.1 Arquitectura de Red y Topología"),
      p("Antes de poder medir o comparar tecnologías, es necesario construir un entorno de pruebas que sea justo para todas ellas. Imagine que quiere saber cuál de varios automóviles consume menos gasolina: para hacer una comparación honesta, todos deben correr en la misma pista, con el mismo tipo de carretera y las mismas condiciones climáticas. En redes, ocurre algo muy similar: el entorno donde se realizan las pruebas debe eliminar cualquier factor externo que pueda alterar los resultados."),
      p("Por esta razón, el diseño de la infraestructura se planificó cuidadosamente para aislar las variables que realmente importan: el comportamiento de cada tecnología de red bajo las mismas condiciones."),
      spacer(),

      h3("3.1.1 Diseño de la Red Underlay (La Infraestructura Física)"),
      p("La red underlay es la base sobre la que todo lo demás se construye; es, en términos simples, la \"carretera\" real por donde viajan los datos. Para este proyecto se tomó una decisión de diseño fundamental: utilizar la nube pública de DigitalOcean en lugar de servidores físicos propios. Esta decisión tiene una razón técnica muy clara: eliminar el \"ruido\" que generaría el hardware local. En un laboratorio físico, factores como la temperatura, el estado del cable de red o interferencias electromagnéticas pueden afectar las mediciones. Al usar servidores en la nube, todos estos factores quedan controlados por el proveedor y son equivalentes para todas las pruebas [2]."),
      p("El aprovisionamiento de esta infraestructura se realizó mediante Terraform, una herramienta de Infraestructura como Código (IaC). Esto significa que toda la configuración de los servidores está escrita en archivos de texto, como una receta de cocina, lo que garantiza que el entorno se pueda reproducir exactamente de la misma manera en cualquier momento. Si alguien quisiera replicar este experimento, bastaría con ejecutar esos archivos para obtener un entorno idéntico [7]."),
      spacer(),
      infoBox("¿Qué es K3s en Alta Disponibilidad?", [
        "K3s es una versión liviana de Kubernetes, ideal para entornos donde los recursos computacionales son limitados o para laboratorios de prueba. \"Alta Disponibilidad\" (HA) significa que el sistema está diseñado para seguir funcionando incluso si uno de sus servidores principales falla. Es como tener tres capitanes en un barco: si uno cae enfermo, los otros dos pueden tomar el mando sin que el barco se detenga.",
        "En este proyecto, se configuraron 3 nodos Master (los capitanes) y nodos Worker dedicados (la tripulación que ejecuta las aplicaciones). Esta configuración garantiza que las pruebas de red se realicen en un ambiente estable y representativo de lo que usaría una empresa real."
      ]),
      spacer(),
      p("La topología de red diseñada incluye una red privada VPC (Virtual Private Cloud) para el tráfico interno entre nodos. Esta decisión es crítica desde el punto de vista telemático: al usar una red privada, se garantiza que la latencia medida durante las pruebas dependa exclusivamente de la eficiencia del CNI bajo evaluación y no de la variabilidad de internet público. En otras palabras, los resultados reflejan el comportamiento real del componente de red, no las fluctuaciones de la red externa [8]."),
      twoColTable(
        ["Componente", "Descripción y Justificación"],
        [
          ["Proveedor Cloud", "DigitalOcean — entorno reproducible y controlado, elimina ruido de hardware local"],
          ["Aprovisionamiento", "Terraform (IaC) — configuración declarativa, reproducible y versionada en Git"],
          ["Distribución K8s", "K3s — versión liviana de Kubernetes, ideal para laboratorio de comparativas"],
          ["Plano de control", "3 Nodos Master en HA — alta disponibilidad, replica ambientes de producción real"],
          ["Nodos de trabajo", "Workers dedicados — separación clara de roles, mediciones sin interferencia"],
          ["Red interna", "VPC privada — aísla el tráfico inter-nodo, garantiza mediciones limpias de QoS"]
        ]
      ),
      caption("Tabla 3.1 — Componentes del diseño de la red underlay y su justificación técnica"),
      spacer(),

      h3("3.1.2 Diseño de la Red Overlay (Los CNI bajo Evaluación)"),
      p("Si la red underlay es la carretera física, la red overlay es el sistema de señalización, semáforos y rutas que organiza el tráfico dentro del clúster. Esta capa es implementada por los plugins CNI (Container Network Interface). Un CNI es el componente que hace posible que dos aplicaciones dentro del clúster se puedan \"hablar\" entre sí, aunque estén en servidores diferentes. Kubernetes no incluye esta funcionalidad por defecto; en cambio, permite que las organizaciones elijan el CNI que mejor se adapte a sus necesidades [4, 18]."),
      p("El núcleo del diseño de este proyecto es la comparativa de cuatro tecnologías de encapsulamiento y ruteo, cada una con una filosofía diferente. A continuación se describen de manera accesible:"),
      spacer(),

      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [1800, 2000, 5226],
        rows: [
          new TableRow({ children: [
            new TableCell({ shading: { fill: "1F4E79", type: ShadingType.CLEAR }, borders, width: { size: 1800, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: "CNI", font: "Arial", size: 21, bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ shading: { fill: "1F4E79", type: ShadingType.CLEAR }, borders, width: { size: 2000, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: "Tecnología Base", font: "Arial", size: 21, bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ shading: { fill: "1F4E79", type: ShadingType.CLEAR }, borders, width: { size: 5226, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: "Explicación Simple", font: "Arial", size: 21, bold: true, color: "FFFFFF" })] })] })
          ]}),
          ...[
            ["Flannel", "VXLAN (Capa 2)", "Es el CNI más sencillo. Funciona como un túnel: envuelve los datos en un \"sobre\" adicional para que puedan viajar entre servidores. Es fácil de instalar pero el sobre adicional consume recursos."],
            ["Calico", "BGP (Ruteo Nativo)", "Usa el mismo protocolo de enrutamiento (BGP) que usan los grandes operadores de internet. En lugar de túneles, enseña a cada servidor exactamente cómo llegar a cada aplicación. Es más eficiente pero más complejo de configurar."],
            ["Cilium", "eBPF (Kernel Linux)", "Es la tecnología más moderna. En lugar de usar las reglas de firewall tradicionales (iptables), opera directamente dentro del núcleo del sistema operativo con programas eBPF. Esto lo hace extremadamente rápido y eficiente."],
            ["Antrea", "Open vSwitch (OVS)", "Trae los conceptos de las redes SDN (Software Defined Networking) al clúster. OVS es un switch virtual muy sofisticado que permite un control detallado sobre el flujo de datos."]
          ].map((row, ri) => new TableRow({ children: row.map((cell, ci) => new TableCell({
            shading: { fill: ri % 2 === 0 ? "EBF3FA" : "FFFFFF", type: ShadingType.CLEAR }, borders,
            width: { size: [1800, 2000, 5226][ci], type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: cell, font: "Arial", size: 21 })] })]
          })) }))
        ]
      }),
      caption("Tabla 3.2 — Los cuatro CNI evaluados, su tecnología base y explicación en términos accesibles"),
      spacer(),

      pMix([
        { text: "VXLAN (Virtual Extensible LAN):", bold: true },
        { text: " Es un protocolo que permite crear redes virtuales sobre redes físicas existentes. Funciona encapsulando los paquetes de datos originales dentro de paquetes UDP, lo que permite que tráfico de red de nivel 2 (como en una red local) viaje sobre redes de nivel 3 (como internet). El costo de esto es un overhead de 50 bytes por paquete, lo que puede reducir el throughput efectivo cuando se transmiten muchos datos pequeños [12]." }
      ]),
      pMix([
        { text: "eBPF (Extended Berkeley Packet Filter):", bold: true },
        { text: " Es una tecnología revolucionaria que permite ejecutar programas directamente dentro del kernel de Linux de manera segura y eficiente. En el contexto de redes, esto significa que Cilium puede interceptar, analizar y redirigir paquetes de red sin necesidad de copiarlos al espacio de usuario, eliminando una de las principales fuentes de latencia de los sistemas tradicionales [11]." }
      ]),
      pMix([
        { text: "BGP (Border Gateway Protocol):", bold: true },
        { text: " Es el protocolo de enrutamiento que conecta las redes de internet entre sí. Calico lo utiliza para distribuir información de rutas entre los nodos del clúster, permitiendo que cada servidor conozca el camino más directo hacia cada Pod sin necesidad de encapsulación [2]." }
      ]),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 3.2 – SISTEMA DE MEDICIÓN QoS
      // ══════════════════════════════════════════════════════════════════════
      h2("3.2 Diseño del Sistema de Medición de Calidad de Servicio (QoS)"),
      p("En telemática, la Calidad de Servicio (QoS, por sus siglas en inglés Quality of Service) es el conjunto de métricas que determinan qué tan bien funciona una red para las aplicaciones que la utilizan. Medir QoS es equivalente a medir el desempeño de un servicio de transporte: no solo importa que el paquete llegue, sino cuánto tiempo tardó, si llegó completo, cuántos intentos necesitó y cuánta gasolina consumió el vehículo."),
      p("El sistema de medición diseñado en este proyecto es el corazón experimental de la investigación. Sin mediciones precisas y reproducibles, cualquier comparación entre CNIs sería subjetiva e inútil para la toma de decisiones técnicas. El diseño sigue los principios de la metrología de redes: control de variables, reproducibilidad y representatividad estadística [6]."),
      spacer(),

      h3("3.2.1 Metodología de Inyección de Tráfico"),
      p("Para generar tráfico de red de manera controlada, se utilizó iperf3, la herramienta de referencia en el ámbito académico y profesional para pruebas de rendimiento de redes. iperf3 funciona con un modelo cliente-servidor: un Pod emisor (cliente) envía tráfico a un Pod receptor (servidor), y ambos registran estadísticas detalladas de la transferencia."),
      p("Sin embargo, el simple hecho de ejecutar iperf3 no garantiza que estemos midiendo lo que queremos medir. El mayor riesgo en una prueba de este tipo es que el emisor y el receptor estén en el mismo servidor físico. Si esto ocurre, el tráfico nunca sale del servidor y viaja por la memoria del sistema en lugar de por la red, lo que haría que los resultados no reflejaran el comportamiento real del CNI."),
      spacer(),
      infoBox("Solución al problema de co-localización: podAntiAffinity", [
        "Para garantizar que el emisor y el receptor siempre estén en servidores diferentes, se utilizó una funcionalidad de Kubernetes llamada podAntiAffinity (anti-afinidad de pods). Esta regla le dice al sistema: \"Asegúrate de que este Pod nunca se ejecute en el mismo servidor que el Pod con esta etiqueta\".",
        "Es como decirle a dos compañeros de trabajo que nunca compartan la misma oficina, para garantizar que toda su comunicación pase por los canales oficiales de la empresa (correo, reuniones) y no por una conversación informal en el pasillo.",
        "Esta decisión de diseño garantiza que el 100% del tráfico medido pase por el CNI bajo evaluación, haciendo que las métricas sean verdaderamente representativas del rendimiento de red inter-nodo."
      ]),
      spacer(),
      p("Además del aislamiento, se diseñó un esquema de automatización mediante CronJobs de Kubernetes. Un CronJob es una tarea programada que se ejecuta de manera automática en intervalos regulares, similar a una alarma que suena cada cierto tiempo. En este caso, se configuraron ráfagas de tráfico TCP cada 30 minutos. Esta frecuencia tiene una justificación telemática importante: permite capturar el comportamiento de la red en diferentes momentos del día (carga alta, carga media, carga baja), obteniendo así un perfil estadístico completo y no solo una fotografía instantánea del rendimiento [7]."),
      spacer(),

      h3("3.2.2 Variables Telemáticas Capturadas"),
      p("El diseño del sistema de medición captura cuatro variables fundamentales, cada una con una justificación desde la teoría de redes y su impacto directo en las aplicaciones empresariales:"),
      spacer(),

      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2200, 2400, 4426],
        rows: [
          new TableRow({ children: [
            ...[["Variable QoS","Unidad de medida","Por qué es importante para las aplicaciones"]].flatMap(row => row.map((h, i) => new TableCell({
              shading: { fill: "1F4E79", type: ShadingType.CLEAR }, borders,
              width: { size: [2200,2400,4426][i], type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: h, font: "Arial", size: 21, bold: true, color: "FFFFFF" })] })]
            })))
          ]}),
          ...[
            ["Throughput (Ancho de Banda Efectivo)", "Gbps / Mbps", "Determina cuánta información puede transmitirse por segundo. Una aplicación de streaming de video o transferencia de archivos grandes necesita alto throughput. Si es bajo, los usuarios experimentan lentitud o interrupciones."],
            ["Latencia de Establecimiento TCP", "ms (milisegundos)\nmin / avg / max", "El tiempo que tarda una conexión en establecerse. Para aplicaciones de tiempo real (videollamadas, trading financiero), cada milisegundo cuenta. Una latencia alta hace que las aplicaciones se sientan \"lentas\" o que fallen."],
            ["Retransmisiones TCP", "Número de paquetes", "Indica cuántos paquetes de datos tuvieron que ser enviados de nuevo porque no llegaron correctamente. Es un indicador de problemas en el canal de encapsulamiento del CNI. Muchas retransmisiones degradan el rendimiento y aumentan la latencia."],
            ["Costo Computacional del CNI", "% CPU / MB RAM", "Mide cuántos recursos del servidor consume el propio CNI para procesar el tráfico. Un CNI que consume mucha CPU para mover 1 Gbps es ineficiente. Esto impacta directamente en el costo de la infraestructura cloud y en la capacidad del servidor para correr más aplicaciones."]
          ].map((row, ri) => new TableRow({ children: row.map((cell, ci) => new TableCell({
            shading: { fill: ri % 2 === 0 ? "EBF3FA" : "FFFFFF", type: ShadingType.CLEAR }, borders,
            width: { size: [2200,2400,4426][ci], type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: cell, font: "Arial", size: 21 })] })]
          })) }))
        ]
      }),
      caption("Tabla 3.3 — Variables telemáticas capturadas por el sistema de medición y su impacto en las aplicaciones"),
      spacer(),

      h3("3.2.3 La Pila de Observabilidad: Prometheus y Grafana"),
      p("Capturar datos de iperf3 no es suficiente si no existe una manera de visualizarlos y correlacionarlos con el consumo de recursos del servidor. Para esto se diseñó una pila de observabilidad basada en dos herramientas de código abierto ampliamente reconocidas en la industria:"),
      pMix([{ text: "Prometheus:", bold: true }, { text: " Es el sistema de recolección de métricas. Funciona como un inspector que visita periódicamente cada nodo del clúster y registra estadísticas de CPU, memoria, red y el estado de cada CNI. Los datos se almacenan en una serie temporal (time series), lo que permite ver cómo evolucionaron las métricas a lo largo del tiempo [6]." }]),
      pMix([{ text: "Grafana:", bold: true }, { text: " Es la capa de visualización. Conecta con Prometheus y presenta los datos en forma de gráficas y dashboards interactivos. Los dashboards diseñados para este proyecto muestran en tiempo real: el throughput de cada CNI, la latencia promedio, el consumo de CPU del agente CNI y las retransmisiones TCP. Esto permite que incluso personas sin experiencia técnica profunda puedan entender el comportamiento de la red de un vistazo." }]),
      spacer(),
      p("El flujo de datos del sistema de observabilidad funciona de la siguiente manera: el CronJob activa iperf3 cada 30 minutos → iperf3 genera métricas de red → Prometheus las recolecta junto con métricas del sistema → Grafana las visualiza en dashboards → el modelo MCDA las procesa para generar recomendaciones. Este flujo completo, desde la captura hasta la recomendación, es el aporte central de este proyecto."),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 3.3 – MODELO MCDA
      // ══════════════════════════════════════════════════════════════════════
      h2("3.3 Diseño del Modelo Matemático de Recomendación (MCDA)"),
      p("Tener datos es el primer paso, pero no es suficiente. El verdadero valor del proyecto está en convertir esos datos en recomendaciones accionables: ¿cuál CNI debería usar mi empresa? La respuesta depende de para qué se usa el clúster. Una empresa de servicios financieros no tiene las mismas prioridades que una plataforma de streaming de video o un sistema de sensores IoT."),
      p("Para resolver este problema, se diseñó un modelo de Análisis de Decisión Multicriterio (MCDA, por sus siglas en inglés Multi-Criteria Decision Analysis). Este tipo de modelos son ampliamente usados en ingeniería y economía cuando se deben tomar decisiones que involucran múltiples factores con diferentes niveles de importancia [9]."),
      spacer(),

      h3("3.3.1 Algoritmo de Procesamiento y Limpieza Estadística"),
      p("Antes de aplicar el modelo MCDA, los datos recolectados deben pasar por un proceso de limpieza estadística. ¿Por qué? Porque en cualquier entorno de nube, ocasionalmente ocurren eventos externos (mantenimientos del proveedor, picos de uso compartido, migraciones automáticas) que generan mediciones anómalas, conocidas técnicamente como outliers. Si estas mediciones se incluyeran en el promedio, contaminarían los resultados y podrían llevar a conclusiones incorrectas."),
      spacer(),
      infoBox("¿Qué es el Rango Intercuartílico (IQR) y para qué sirve?", [
        "El IQR (Interquartile Range) es un método estadístico robusto para detectar valores atípicos. Funciona ordenando todos los datos de menor a mayor y dividiendo el conjunto en cuatro partes iguales. Los valores que caen muy por encima o muy por debajo del rango esperado (llamados outliers) se identifican y se excluyen del análisis.",
        "Analogía simple: imagine que mide la velocidad de 100 autos en una autopista. La mayoría van entre 80 y 120 km/h. Si un auto va a 5 km/h (detenido por un accidente) o a 300 km/h (una emergencia), incluir esos valores en el promedio daría una imagen falsa del comportamiento típico del tráfico. El IQR los detecta y los excluye automáticamente.",
        "En este proyecto, el IQR garantiza que el puntaje final de cada CNI sea representativo de su comportamiento normal y no esté influenciado por eventos excepcionales de la nube."
      ]),
      spacer(),
      p("Después de la limpieza, las métricas pasan por un proceso de normalización: se convierten de sus unidades originales (ms, Gbps, MB, % CPU) a una escala común de 0 a 1, donde 1 representa el mejor desempeño posible. Esto es necesario porque no se pueden comparar directamente milisegundos con gigabits por segundo; la normalización los pone en el mismo \"idioma\" matemático para que el modelo MCDA pueda procesarlos de manera justa."),
      spacer(),

      h3("3.3.2 La Matriz de Decisión por Perfil de Usuario"),
      p("El corazón del modelo MCDA es una matriz de pesos que refleja las prioridades de cada tipo de organización. Se diseñaron tres perfiles de usuario basados en los patrones más comunes de uso de Kubernetes en la industria:"),
      spacer(),

      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2200, 2608, 2108, 2110],
        rows: [
          new TableRow({ children: [
            ...["Criterio de Evaluación", "Perfil Fintech\n(Seguridad)", "Perfil Streaming\n(Rendimiento)", "Perfil IoT\n(Recursos)"].map((h, i) => new TableCell({
              shading: { fill: "1F4E79", type: ShadingType.CLEAR }, borders,
              width: { size: [2200,2608,2108,2110][i], type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, font: "Arial", size: 20, bold: true, color: "FFFFFF" })] })]
            }))
          ]}),
          ...[
            ["Throughput (velocidad)", "15%", "35%", "25%"],
            ["Latencia (tiempo de respuesta)", "20%", "35%", "20%"],
            ["Retransmisiones TCP (estabilidad)", "15%", "20%", "15%"],
            ["Consumo de CPU del CNI", "10%", "10%", "30%"],
            ["Consumo de RAM del CNI", "10%", "0%", "10%"],
            ["Soporte de Network Policies L7", "30%", "0%", "0%"],
            ["Total", "100%", "100%", "100%"]
          ].map((row, ri) => new TableRow({ children: row.map((cell, ci) => new TableCell({
            shading: { fill: ri === 6 ? "D5E8F0" : ri % 2 === 0 ? "EBF3FA" : "FFFFFF", type: ShadingType.CLEAR }, borders,
            width: { size: [2200,2608,2108,2110][ci], type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, children: [new TextRun({ text: cell, font: "Arial", size: 21, bold: ri === 6 })] })]
          })) }))
        ]
      }),
      caption("Tabla 3.4 — Matriz de pesos del modelo MCDA por perfil de usuario"),
      spacer(),

      p("Los tres perfiles se diseñaron con base en los patrones de uso identificados en la literatura y en las necesidades reales de la industria:"),
      pMix([{ text: "Perfil Fintech (Seguridad):", bold: true }, { text: " Las empresas financieras priorizan sobre todo la seguridad. El 30% del peso está en el soporte de Network Policies de capa 7 (L7), que permite controlar el tráfico no solo por dirección IP sino por el tipo de petición HTTP, el nombre del servicio o la identidad del usuario. Esto es fundamental para cumplir con regulaciones como PCI-DSS o ISO 27001." }]),
      pMix([{ text: "Perfil Streaming/Edge (Rendimiento):", bold: true }, { text: " Las plataformas de video o juegos en línea necesitan mover grandes cantidades de datos con la menor latencia posible. El 70% del peso está concentrado en throughput y latencia. Un milisegundo extra de latencia en un juego en línea puede significar perder una partida; en una videollamada, puede generar eco o cortes." }]),
      pMix([{ text: "Perfil IoT (Recursos):", bold: true }, { text: " Los sistemas de Internet de las Cosas suelen correr en hardware con recursos limitados (sensores, Raspberry Pi, dispositivos embebidos). Aquí lo más importante es que el CNI consuma la menor cantidad de CPU y RAM posible, para que queden recursos disponibles para las aplicaciones de negocio." }]),
      spacer(),
      p("El modelo genera un puntaje compuesto para cada CNI en cada perfil, y el CNI con el puntaje más alto es la recomendación del sistema. Este resultado se presenta en el dashboard de Grafana, accesible de manera intuitiva para cualquier equipo técnico."),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 3.4 – SEGURIDAD Y ZERO TRUST
      // ══════════════════════════════════════════════════════════════════════
      h2("3.4 Diseño de Seguridad y Micro-segmentación (Modelo Zero Trust)"),
      p("Uno de los problemas más críticos identificados en el árbol de problemas es la arquitectura abierta por defecto de Kubernetes. En su configuración inicial, cualquier aplicación dentro del clúster puede comunicarse libremente con cualquier otra aplicación. Esto es conveniente para comenzar a trabajar rápidamente, pero representa un riesgo de seguridad significativo en entornos de producción."),
      p("Para comprender la magnitud del problema, imagine un edificio corporativo donde todas las puertas están abiertas por defecto. Cualquier persona que entre al edificio puede acceder a la sala de servidores, al archivo de documentos confidenciales o a la caja fuerte. La solución es implementar un sistema de acceso controlado: cada puerta tiene una tarjeta de acceso y solo las personas autorizadas pueden entrar a cada área. En Kubernetes, este sistema de control se llama Network Policies [24]."),
      spacer(),

      h3("3.4.1 Estrategia de Default Deny (Denegar Todo por Defecto)"),
      p("El diseño implementa el principio de Zero Trust de manera completa. Zero Trust, según el NIST (Instituto Nacional de Estándares y Tecnología de los Estados Unidos), es un modelo de seguridad que parte de la premisa de que no se debe confiar automáticamente en ninguna entidad dentro o fuera de la red, sino verificar explícitamente cada solicitud de acceso [24, 25]."),
      p("La estrategia diseñada tiene dos niveles. El primer nivel es la política de Default Deny: se crean reglas que bloquean todo el tráfico entrante y saliente de cada espacio de nombres (namespace) del clúster. Es el equivalente a cerrar todas las puertas del edificio. El segundo nivel es la habilitación selectiva: una vez bloqueado todo, se abren únicamente las comunicaciones que son necesarias para el funcionamiento de las aplicaciones."),
      spacer(),
      infoBox("¿Cómo funciona la micro-segmentación por capas?", [
        "Imagine una aplicación web típica compuesta por tres partes: el frontend (la página web que ve el usuario), el backend (la lógica de negocio) y la base de datos (donde se almacena la información).",
        "Sin segmentación: el frontend puede hablar con la base de datos directamente, saltándose el backend. Esto es un riesgo enorme de seguridad.",
        "Con micro-segmentación diseñada en este proyecto: el frontend SOLO puede hablar con el backend. El backend SOLO puede hablar con la base de datos. La base de datos NO puede iniciar comunicaciones hacia ningún lado. Si un atacante logra comprometer el frontend, NO puede acceder directamente a la base de datos porque la política de red lo bloquea.",
        "Esta separación se implementa con etiquetas dinámicas (labels) de Kubernetes, que son como insignias de identificación para cada aplicación. Las reglas de red dicen: 'solo permite conexiones desde Pods que tengan la etiqueta tier=frontend hacia Pods con la etiqueta tier=backend en el puerto 8080'."
      ]),
      spacer(),

      h3("3.4.2 Automatización GitOps con ArgoCD"),
      p("Un segundo problema identificado en el árbol de causas es la falta de pruebas automatizadas que garanticen que las políticas de seguridad siguen siendo efectivas después de cambios en el sistema. Un equipo puede configurar perfectamente las políticas de red, pero si alguien las borra accidentalmente o las modifica de manera incorrecta, el sistema queda expuesto sin que nadie lo note."),
      p("Para resolver este problema, se diseñó un flujo de trabajo GitOps usando ArgoCD. GitOps es un paradigma de operaciones donde el estado deseado de la infraestructura está definido en un repositorio Git (como el repositorio de código del proyecto) y un sistema automatizado se encarga de garantizar que la infraestructura real siempre coincida con ese estado deseado."),
      p("ArgoCD monitorea constantemente el repositorio Git. Si alguien elimina una política de red del clúster (ya sea por accidente o intencionalmente), ArgoCD detecta la diferencia entre el estado actual del clúster y el estado definido en Git, y automáticamente restaura la política eliminada. Esto es el equivalente a un sistema de vigilancia que activa una alarma y restaura automáticamente la configuración correcta si algo cambia sin autorización."),
      spacer(),
      twoColTable(
        ["Mecanismo de Seguridad", "Función y Beneficio"],
        [
          ["Default Deny (Ingress)", "Bloquea todo el tráfico entrante a un namespace. Ninguna aplicación puede recibir conexiones a menos que exista una regla explícita que lo permita."],
          ["Default Deny (Egress)", "Bloquea todo el tráfico saliente. Las aplicaciones no pueden iniciar conexiones externas no autorizadas, previniendo exfiltración de datos."],
          ["Micro-segmentación L3/L4", "Reglas que permiten comunicaciones específicas entre tier=frontend, tier=backend y tier=database mediante selectores de etiquetas dinámicos."],
          ["Network Policies L7 (Cilium)", "Control de acceso basado en HTTP paths, métodos y headers. Solo disponible con Cilium/eBPF. Permite reglas como 'solo GET /api/productos'."],
          ["GitOps con ArgoCD", "Cualquier desviación del estado de seguridad definido en Git es detectada y corregida automáticamente, garantizando la integridad continua."],
          ["Validación Automatizada", "Pipelines que prueban periódicamente que las reglas de red bloquean efectivamente el tráfico no autorizado mediante herramientas de prueba de conectividad."]
        ]
      ),
      caption("Tabla 3.5 — Mecanismos de seguridad diseñados e implementados en el proyecto"),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 3.5 – FLUJO INTEGRAL
      // ══════════════════════════════════════════════════════════════════════
      h2("3.5 Flujo Integral del Sistema: De la Captura a la Recomendación"),
      p("Para comprender cómo funcionan juntos todos los componentes diseñados, es útil seguir el recorrido completo de los datos desde el momento en que se generan hasta que se convierten en una recomendación de CNI para una organización específica. Este flujo tiene cinco etapas claramente definidas:"),
      spacer(),
      numbered("GENERACIÓN DEL TRÁFICO: El CronJob de Kubernetes activa automáticamente cada 30 minutos el pod iperf3-client. Gracias a podAntiAffinity, este pod está en un nodo diferente al iperf3-server. El cliente envía ráfagas de tráfico TCP real al servidor, simulando el comportamiento de una aplicación empresarial que transfiere datos entre microservicios."),
      numbered("CAPTURA DE MÉTRICAS: iperf3 registra throughput, latencia de establecimiento TCP y retransmisiones. Simultáneamente, Prometheus recolecta el consumo de CPU y RAM del agente CNI activo en los nodos involucrados. Todos los datos incluyen una marca de tiempo (timestamp) y el identificador del CNI bajo prueba."),
      numbered("LIMPIEZA Y NORMALIZACIÓN: El procesador.js aplica el algoritmo IQR para eliminar outliers estadísticos de las series temporales. Las métricas depuradas se normalizan a la escala 0-1, donde 1 representa el mejor valor observado entre todos los CNIs para esa métrica."),
      numbered("SCORING MCDA: El modelo multiplica cada métrica normalizada por su peso correspondiente según el perfil de usuario seleccionado (Fintech, Streaming o IoT). Se calcula el puntaje compuesto para cada CNI y se genera un ranking."),
      numbered("VISUALIZACIÓN Y RECOMENDACIÓN: Los resultados se publican en el dashboard de Grafana, que muestra tanto las métricas brutas en gráficas de series temporales como el ranking MCDA por perfil. El CNI con el puntaje más alto en el perfil seleccionado es la recomendación del sistema, acompañada de su justificación técnica basada en los datos recolectados."),
      spacer(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 3.6 – BENEFICIO TECNOLÓGICO Y TELEMÁTICO
      // ══════════════════════════════════════════════════════════════════════
      h2("3.6 Beneficio Tecnológico y Telemático de la Solución"),
      p("Esta sección responde la pregunta fundamental que cualquier organización debería hacerse antes de adoptar una nueva tecnología: ¿para qué sirve esto y qué me aporta en términos concretos? Los beneficios de este proyecto se pueden clasificar en tres categorías: beneficios telemáticos directos, beneficios tecnológicos operativos y beneficios económicos cuantificables."),
      spacer(),

      h3("3.6.1 Beneficios Telemáticos: Visibilidad y Control de la Red"),
      p("El primer beneficio telemático es la visibilidad. Antes de este proyecto, los equipos técnicos operaban sus redes Kubernetes sin datos reales sobre su comportamiento. Era como conducir un automóvil sin tablero de instrumentos: podía funcionar durante un tiempo, pero cualquier problema tardaría demasiado en detectarse."),
      p("Con el sistema diseñado, cada organización que lo implemente obtiene un tablero de control completo de su red: puede ver en tiempo real cuánto throughput está procesando su CNI, qué latencia experimentan sus aplicaciones, si hay retransmisiones TCP que indiquen problemas, y cuántos recursos del servidor consume la red en sí misma. Este nivel de visibilidad permite pasar de una gestión reactiva (\"hay un problema, a solucionarlo\") a una gestión proactiva (\"veo que la latencia está aumentando, investiguemos antes de que afecte a los usuarios\")."),
      p("El segundo beneficio telemático es el control de la seguridad. Las Network Policies implementadas con estrategia Zero Trust transforman la red de un sistema \"todo abierto\" a una red micro-segmentada donde cada comunicación es explícitamente autorizada. Esto reduce drásticamente la superficie de ataque: si un atacante logra comprometer una aplicación, su capacidad de movimiento lateral dentro del clúster está limitada por las políticas de red [16]."),
      spacer(),

      h3("3.6.2 Beneficios Tecnológicos: Toma de Decisiones Basada en Evidencia"),
      p("Uno de los mayores aportes de este proyecto es reemplazar las decisiones basadas en opiniones o recomendaciones informales por decisiones basadas en datos medidos en condiciones controladas y reproducibles. El modelo MCDA proporciona un método objetivo y transparente: dos organizaciones con perfiles similares obtendrán la misma recomendación, y el razonamiento detrás de ella puede ser auditado y cuestionado."),
      p("Además, la metodología diseñada es replicable. Cualquier equipo técnico que quiera evaluar un nuevo CNI (por ejemplo, cuando salga una nueva versión de Cilium o un CNI completamente nuevo) puede integrar esa tecnología en el framework de pruebas y obtener resultados comparables con los ya existentes. Esto convierte el proyecto en una herramienta viva, no solo en un estudio estático."),
      spacer(),

      h3("3.6.3 Beneficio Económico: La Solución al Sobredimensionamiento"),
      p("El beneficio más tangible y cuantificable del proyecto es la reducción del sobredimensionamiento de recursos. Como se identificó en el árbol de problemas, muchas organizaciones asignan más CPU y memoria a sus servidores de lo que realmente necesitan, porque no tienen datos precisos sobre el consumo real de sus redes."),
      p("Con las mediciones de este proyecto, es posible saber exactamente cuánta CPU consume cada CNI para mover 1 Gbps de tráfico. Esta información permite un dimensionamiento inteligente: si Cilium necesita un 30% menos de CPU que Flannel para la misma cantidad de tráfico, una organización que procese 100 Gbps diarios podría reducir su inversión en cómputo de manera proporcional."),
      spacer(),
      infoBox("Ejemplo de impacto económico del dimensionamiento inteligente", [
        "Escenario hipotético: Una empresa tiene 10 nodos worker en DigitalOcean, cada uno con 8 vCPU, a un costo de USD $48/mes por nodo = USD $480/mes en total.",
        "Situación actual (sin datos): La empresa usa Flannel porque 'es el que venía por defecto', pero no sabe cuánta CPU consume. Por precaución, mantiene los 10 nodos al 60% de capacidad para tener margen de seguridad.",
        "Después de las mediciones: Los datos muestran que Cilium (eBPF) consume un 35% menos de CPU para la misma carga de trabajo. Con Cilium, la empresa podría operar con el mismo nivel de servicio usando solo 7 nodos al 80% de capacidad.",
        "Ahorro estimado: 3 nodos × $48/mes × 12 meses = USD $1,728 anuales solo en infraestructura. Sin contar la reducción en consumo energético, que en centros de datos grandes puede ser significativa."
      ]),
      spacer(),
      p("A nivel telemático, la reducción del sobredimensionamiento también tiene un impacto ambiental positivo: menos servidores activos significan menos consumo de energía y una menor huella de carbono de la infraestructura tecnológica. En un contexto donde la sostenibilidad tecnológica se convierte en un factor diferenciador para las empresas, este beneficio tiene valor tanto económico como de imagen corporativa [8]."),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 3.7 – DECISIONES DE DISEÑO
      // ══════════════════════════════════════════════════════════════════════
      h2("3.7 Justificación de las Principales Decisiones de Diseño"),
      p("Todo diseño implica elegir entre alternativas. En esta sección se explica el razonamiento detrás de las decisiones más importantes del proyecto, en formato de pregunta-respuesta para mayor claridad:"),
      spacer(),
      twoColTable(
        ["Decisión de diseño", "Justificación técnica y telemática"],
        [
          ["¿Por qué nube pública (DigitalOcean) en lugar de un laboratorio físico propio?", "Los entornos físicos propios introducen variables no controlables (hardware heterogéneo, cables con distintas características, temperatura ambiente). La nube garantiza que la única variable entre pruebas sea el CNI, no el hardware. Además, los resultados son más transferibles a organizaciones que ya operan en la nube."],
          ["¿Por qué K3s y no Kubernetes estándar?", "K3s tiene un footprint menor, lo que significa que consume menos recursos del sistema en su propia operación. Esto hace que una mayor proporción del CPU y la RAM esté disponible para las aplicaciones y el CNI, aumentando la sensibilidad de las mediciones. Es también representativo de entornos edge y startups con recursos limitados."],
          ["¿Por qué iperf3 para las pruebas de red?", "iperf3 es la herramienta de referencia académica y profesional para pruebas de rendimiento de redes TCP/UDP. Sus resultados son reproducibles, comparables con otros estudios publicados y ampliamente validados en la comunidad de redes. Usar una herramienta menos estándar habría dificultado la comparación con la literatura existente."],
          ["¿Por qué IQR para limpiar outliers y no simplemente el promedio?", "El promedio es muy sensible a valores extremos. Una sola medición de 500ms en un conjunto de mediciones de 2ms elevaría el promedio injustamente. El IQR es robusto a outliers porque se basa en la distribución estadística central de los datos, no en sus extremos. Es el método recomendado en metrología de redes para condiciones de nube."],
          ["¿Por qué tres perfiles de usuario en el MCDA?", "Existe una tensión fundamental entre throughput, latencia, seguridad y uso de recursos. Ningún CNI es el mejor en todas las dimensiones simultáneamente. Los tres perfiles representan los trade-offs más comunes en la industria, basados en los patrones identificados en los estudios de la literatura revisada."],
          ["¿Por qué ArgoCD para la gestión de políticas de red?", "Las políticas de red manuales son frágiles: un error humano o una actualización del clúster puede eliminarlas silenciosamente. GitOps con ArgoCD garantiza que el estado de seguridad sea siempre el que el equipo definió, sin importar qué cambios ocurran en el clúster. Esto es especialmente crítico para cumplir con estándares de seguridad como Zero Trust [25]."]
        ]
      ),
      caption("Tabla 3.6 — Justificación de las principales decisiones de diseño del proyecto"),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 3.8 – RESUMEN ARQUITECTÓNICO
      // ══════════════════════════════════════════════════════════════════════
      h2("3.8 Resumen Arquitectónico Integrado"),
      p("El diseño de la solución puede resumirse como un sistema de tres capas que funcionan de manera coordinada:"),
      p("La primera capa es la infraestructura controlada (red underlay sobre DigitalOcean con Terraform), que garantiza un entorno reproducible y libre de ruido externo. Esta capa es la base que hace que todas las mediciones sean comparables y confiables."),
      p("La segunda capa es el plano de observabilidad y prueba (red overlay con los cuatro CNIs, iperf3 con podAntiAffinity, CronJobs automáticos, Prometheus y Grafana), que captura datos de calidad de servicio de manera sistemática y los presenta de forma comprensible. Esta capa responde a la pregunta: ¿cómo se está comportando la red realmente?"),
      p("La tercera capa es la inteligencia de decisión (algoritmo IQR, normalización, modelo MCDA con perfiles, dashboard de recomendación), que transforma los datos brutos en recomendaciones específicas para cada tipo de organización. Esta capa responde a la pregunta: ¿qué CNI debería usar mi empresa y por qué?"),
      p("Transversalmente a estas tres capas opera la estrategia de seguridad Zero Trust (Network Policies con Default Deny, micro-segmentación por capas de aplicación y automatización GitOps con ArgoCD), que garantiza que el entorno de prueba y las recomendaciones incluyan siempre consideraciones de seguridad, no solo de rendimiento."),
      spacer(),
      p("La integración de estas capas hace que el proyecto sea más que una simple comparativa de tecnologías. Es un framework metodológico completo que puede ser adoptado por cualquier organización que necesite tomar decisiones informadas sobre su infraestructura de red en Kubernetes, independientemente de su tamaño o nivel de experiencia técnica."),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // TRABAJOS FUTUROS
      // ══════════════════════════════════════════════════════════════════════
      h1("4. Trabajos Futuros"),
      p("El presente proyecto sienta las bases de un framework de evaluación que tiene múltiples posibilidades de extensión y mejora. A continuación se presentan las líneas de investigación y desarrollo que se identificaron como más relevantes durante la ejecución del proyecto:"),
      spacer(),

      h2("4.1 Extensión del Framework a Entornos Edge y 5G"),
      p("El diseño actual del sistema de evaluación se implementó sobre infraestructura de nube pública. Una extensión natural y de alto impacto sería adaptar el framework para entornos de computación edge, donde los nodos están geográficamente distribuidos con enlaces de menor capacidad y mayor latencia. Con el avance de las redes 5G y la proliferación de casos de uso de baja latencia (vehículos autónomos, cirugía remota, manufactura inteligente), la evaluación de CNIs en condiciones de edge computing se convierte en una necesidad urgente de la industria [1]."),
      p("En particular, sería de alto valor académico evaluar el comportamiento de Cilium con eBPF en condiciones de alta variabilidad de latencia (jitter), que son características de los enlaces edge. La hipótesis de investigación sería: ¿puede eBPF mantener sus ventajas de eficiencia bajo condiciones de red degradadas?"),
      spacer(),

      h2("4.2 Incorporación de Inteligencia Artificial para Selección Dinámica de CNI"),
      p("El modelo MCDA actual es estático: los pesos se definen manualmente según el perfil de usuario. Un trabajo futuro de alta relevancia sería desarrollar un modelo de aprendizaje automático (Machine Learning) que ajuste los pesos dinámicamente en función del comportamiento observado de las aplicaciones en tiempo real [2]."),
      p("Por ejemplo, si el sistema detecta que el patrón de tráfico ha cambiado de muchas solicitudes pequeñas (baja latencia importante) a pocas transferencias de archivos grandes (throughput importante), podría ajustar automáticamente los pesos del MCDA e incluso recomendar una migración de CNI sin intervención humana. Este tipo de gestión autónoma de la red es uno de los pilares de las redes intent-based networking, que representan el futuro de la gestión de infraestructuras telemáticas."),
      spacer(),

      h2("4.3 Evaluación de Nuevas Tecnologías CNI y Service Meshes"),
      p("El panorama de tecnologías de red para Kubernetes evoluciona rápidamente. En el momento de desarrollo de este proyecto, tecnologías emergentes como Kube-OVN (basado en Open Virtual Network), Multus CNI (que permite múltiples interfaces de red por Pod) y la integración de CNIs con Service Meshes como Istio o Linkerd están ganando relevancia."),
      p("Un trabajo futuro significativo sería extender el framework de evaluación para incluir estas tecnologías y evaluar el impacto de capas adicionales (Service Mesh) sobre las métricas de QoS. La hipótesis a investigar sería: ¿el overhead de un Service Mesh (que añade un proxy sidecar a cada Pod para mTLS y observabilidad L7) compensa su beneficio en seguridad y visibilidad cuando se combina con diferentes CNIs?"),
      spacer(),

      h2("4.4 Estandarización de la Metodología de Evaluación"),
      p("En la revisión de la literatura, se identificó que no existe un estándar unificado para la evaluación de CNIs en Kubernetes. Diferentes estudios utilizan diferentes herramientas, diferentes métricas y diferentes entornos de prueba, lo que dificulta la comparación de resultados entre ellos [7, 8]. Un trabajo futuro de alto impacto para la comunidad académica y técnica sería publicar y proponer una metodología estandarizada basada en el framework desarrollado en este proyecto."),
      p("Esta metodología podría ser sometida a revisión por la Cloud Native Computing Foundation (CNCF), el organismo que governa Kubernetes, como un documento técnico o un proyecto sandbox. Su adopción como estándar de facto beneficiaría a toda la industria, ya que permitiría comparar resultados entre organizaciones y entornos de manera objetiva."),
      spacer(),

      h2("4.5 Evaluación del Impacto Energético y Sostenibilidad"),
      p("El consumo energético de la infraestructura tecnológica es un tema de creciente relevancia tanto económica como ambiental. Si bien este proyecto mide el consumo de CPU como proxy del consumo energético, una extensión futura sería implementar medición directa del consumo de energía mediante herramientas como PowerAPI o RAPL (Running Average Power Limit) de Intel."),
      p("Con datos de consumo energético real, sería posible calcular la eficiencia energética de cada CNI en términos de joules por gigabyte transferido, una métrica que tiene relevancia directa para organizaciones con compromisos de sostenibilidad ambiental (net zero, huella de carbono) y para el diseño de centros de datos más eficientes energéticamente."),
      spacer(),

      h2("4.6 Integración con Sistemas SIEM para Análisis de Seguridad"),
      p("Las Network Policies implementadas en este proyecto proveen control de acceso a nivel de red, pero no generan alertas automáticas cuando se detectan intentos de conexión bloqueados. Un trabajo futuro sería integrar el sistema con un SIEM (Security Information and Event Management), como Elastic SIEM o Splunk, para correlacionar eventos de seguridad de red con otros indicadores de compromiso en el clúster."),
      p("Esta integración convertiría el sistema de políticas de red pasivo en un sistema activo de detección y respuesta a incidentes (Network Detection and Response, NDR), cerrando el ciclo de seguridad desde la prevención hasta la detección y la respuesta [27]."),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // REFERENCIAS BIBLIOGRÁFICAS
      // ══════════════════════════════════════════════════════════════════════
      h1("5. Referencias Bibliográficas"),
      p("A continuación se presentan las fuentes académicas y técnicas utilizadas como fundamento del diseño de la solución, organizadas según las normas IEEE, formato adoptado por la Facultad Tecnológica de la Universidad Distrital Francisco José de Caldas:"),
      spacer(),

      ...[
        ['[1]', 'D. F. Solano y M. P. Gutiérrez, "Algoritmos de aprendizaje automático para optimizar las redes 5G: Desarrollo y evaluación del rendimiento," Rev. Vínculos, vol. 20, no. 1, abr. 2023.'],
        ['[2]', '"Cluster networking," Kubernetes. [En línea]. Disponible en: https://kubernetes.io/docs/concepts/cluster-administration/networking/. [Consultado: 21-ago-2025].'],
        ['[3]', '"Virtual IPs and Service proxies," Kubernetes. [En línea]. Disponible en: https://kubernetes.io/docs/reference/networking/virtual-ips/. [Consultado: 21-ago-2025].'],
        ['[4]', '"Network plugins," Kubernetes. [En línea]. Disponible en: https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/. [Consultado: 21-ago-2025].'],
        ['[5]', 'D. E. Eisenbud et al., "Maglev: A fast and reliable software network load balancer," en Proc. USENIX NSDI, 2016.'],
        ['[6]', 'F. Gomes, P. Rego y F. Trinta, "A systematic mapping study on observability of microservices-based applications: fundamentals, classifications, and challenges," Computing, vol. 107, núm. 9, 2025.'],
        ['[7]', 'Z. Kang, K. An, A. Gokhale y P. Pazandak, "A comprehensive performance evaluation of different Kubernetes CNI plugins for edge-based and containerized publish/subscribe applications," en Proc. IC2E, 2021.'],
        ['[8]', 'G. Koukis, S. Skaperas, I. A. Kapetanidou, L. Mamatas y V. Tsaoussidis, "Performance evaluation of Kubernetes networking approaches across constraint edge environments," arXiv [cs.NI], 2024.'],
        ['[9]', 'Mdpi.com. [En línea]. Disponible en: https://www.mdpi.com/2079-9292/13/19/3972. [Consultado: 21-ago-2025].'],
        ['[10]', '"Elevating Kubernetes network security through Cilium deployment," Fh-Joanneum, 2024. [En línea]. Disponible en: https://epub.fh-joanneum.at/obvfhjhs/download/pdf/11499653.'],
        ['[11]', 'W. Tu, Y.-H. Wei, G. Antichi y B. Pfaff, "Revisiting the Open vSwitch dataplane ten years later," en Proc. ACM SIGCOMM, 2021.'],
        ['[12]', '"Configure MTU to maximize network performance," Tigera.io. [En línea]. Disponible en: https://docs.tigera.io/calico/latest/networking/configuring/mtu. [Consultado: 21-ago-2025].'],
        ['[13]', '"Service," Kubernetes. [En línea]. Disponible en: https://kubernetes.io/docs/concepts/services-networking/service/. [Consultado: 21-ago-2025].'],
        ['[14]', '"Kubernetes networking: Comparative insights into API gateways and service mesh implementations," Aalto University, tesis de maestría, 2024.'],
        ['[15]', 'M. Kotenko, D. Moskalyk, V. Kovach y V. Osadchyi, "Navigating the challenges and best practices in securing microservices architecture," Ceur-ws.org, 2024.'],
        ['[16]', '"Roles and personas - Kubernetes Gateway API," K8s.io. [En línea]. Disponible en: https://gateway-api.sigs.k8s.io/concepts/roles-and-personas/. [Consultado: 21-ago-2025].'],
        ['[17]', '"CNI Specification," Cni.dev. [En línea]. Disponible en: https://www.cni.dev/docs/spec/. [Consultado: 21-ago-2025].'],
        ['[18]', '"IEEE 802.1Q - Bridges and Bridged Networks," IEEE Standards Association, 2022.'],
        ['[19]', '"host-local IP address management plugin," Cni.dev. [En línea]. Disponible en: https://www.cni.dev/plugins/current/ipam/host-local/. [Consultado: 21-ago-2025].'],
        ['[20]', 'B. Pfaff et al., "The design and implementation of Open vSwitch," en Proc. USENIX NSDI, 2015.'],
        ['[21]', '"Antrea network flow visibility," Antrea.io. [En línea]. Disponible en: https://antrea.io/docs/v1.0.0/docs/network-flow-visibility/. [Consultado: 21-ago-2025].'],
        ['[22]', 'S. Rose, O. Borchert, S. Mitchell y S. Connelly, "Zero Trust Architecture," NIST SP 800-207, National Institute of Standards and Technology, 2020.'],
        ['[23]', 'O. Borchert, G. Howell, A. Kerman, S. Rose y M. Souppaya, "Implementing a Zero Trust Architecture: High-level document," NIST, Gaithersburg, MD, 2025.'],
        ['[24]', 'R. Chandramouli y Z. Butcher, "Building secure microservices-based applications using service-mesh architecture," NIST, Gaithersburg, MD, 2020.'],
        ['[25]', 'J. Zhang, P. Chen, Z. He, H. Chen y X. Li, "Real-time intrusion detection and prevention with neural network in kernel using eBPF," en Proc. IEEE/IFIP DSN, 2024, pp. 416–428.'],
        ['[26]', 'M. I. Cordero-Pérez y P. E. Salas-Duarte, "Inteligencia Artificial en la Gestión de Redes Telemáticas: Avances, Tendencias y Aplicaciones Actuales," Rev. Vínculos, vol. 21, no. 1, may. 2024.'],
        ['[27]', '"EndpointSlices," Kubernetes. [En línea]. Disponible en: https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/. [Consultado: 21-ago-2025].']
      ].map(([num, text]) => new Paragraph({
        spacing: { before: 60, after: 80, line: 320 },
        indent: { left: 720, hanging: 360 },
        children: [
          new TextRun({ text: num + ' ', font: "Arial", size: 20, bold: true, color: LBLUE }),
          new TextRun({ text, font: "Arial", size: 20, color: "333333" })
        ]
      })),
      spacer(),

      // cierre
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: LBLUE, space: 8 } },
        children: [new TextRun({ text: "— Fin del Capítulo de Diseño de la Solución —", font: "Arial", size: 20, italics: true, color: "888888" })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/claude/Diseno_Solucion_Tesis.docx", buf);
  console.log("OK");
});
