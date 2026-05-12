const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, PageBreak, Footer, Header
} = require('docx');
const fs = require('fs');

const BLUE   = "1F4E79";
const LBLUE  = "2E75B6";
const GREEN  = "1E7145";
const LGREEN = "E2EFDA";
const GRAY   = "F2F2F2";
const DKGRAY = "404040";

const b1 = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: b1, bottom: b1, left: b1, right: b1 };
const nob = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: nob, bottom: nob, left: nob, right: nob };

// ── helpers ──────────────────────────────────────────────────────────────────
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
    children: [new TextRun({ text, font: "Arial", size: 22, bold: opts.bold||false, italics: opts.italic||false, color: opts.color||"000000" })]
  });
}
function pMix(runs) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 80, after: 140, line: 360 },
    children: runs.map(r => new TextRun({ font: "Arial", size: 22, color: "000000", ...r }))
  });
}
function bullet(text, level=0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 22 })]
  });
}
function numbered(text, level=0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 22 })]
  });
}
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }
function spacer() { return new Paragraph({ spacing: { before: 120, after: 120 }, children: [new TextRun("")] }); }
function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 160 },
    children: [new TextRun({ text, font: "Arial", size: 20, italics: true, color: "555555" })]
  });
}

// Codeblock — dark background monospace snippet
function codeBlock(lines) {
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [
      new TableRow({ children: [new TableCell({
        shading: { fill: "1E1E1E", type: ShadingType.CLEAR },
        borders,
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        children: lines.map(line => new Paragraph({
          children: [new TextRun({ text: line, font: "Courier New", size: 18, color: "D4D4D4" })]
        }))
      })]})
    ]
  });
}

function infoBox(title, lines, color = "1F4E79") {
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [
      new TableRow({ children: [new TableCell({
        shading: { fill: color, type: ShadingType.CLEAR }, borders,
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        children: [new Paragraph({ children: [new TextRun({ text: title, font: "Arial", size: 22, bold: true, color: "FFFFFF" })] })]
      })]}),
      ...lines.map(l => new TableRow({ children: [new TableCell({
        shading: { fill: "EBF3FA", type: ShadingType.CLEAR }, borders,
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
        children: [new Paragraph({ alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: l, font: "Arial", size: 21 })] })]
      })]}))
    ]
  });
}

function greenBox(title, lines) {
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [
      new TableRow({ children: [new TableCell({
        shading: { fill: "1E7145", type: ShadingType.CLEAR }, borders,
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        children: [new Paragraph({ children: [new TextRun({ text: title, font: "Arial", size: 22, bold: true, color: "FFFFFF" })] })]
      })]}),
      ...lines.map(l => new TableRow({ children: [new TableCell({
        shading: { fill: LGREEN, type: ShadingType.CLEAR }, borders,
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
        children: [new Paragraph({ alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: l, font: "Arial", size: 21 })] })]
      })]}))
    ]
  });
}

function twoColTable(headers, rows2, widths=[3000, 6026]) {
  const hRow = new TableRow({ children: headers.map((h,i) => new TableCell({
    shading: { fill: "1F4E79", type: ShadingType.CLEAR }, borders,
    width: { size: widths[i], type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: h, font: "Arial", size: 21, bold: true, color: "FFFFFF" })] })]
  }))});
  const dataRows = rows2.map((row, ri) => new TableRow({ children: row.map((cell, ci) => new TableCell({
    shading: { fill: ri%2===0?"EBF3FA":"FFFFFF", type: ShadingType.CLEAR }, borders,
    width: { size: widths[ci], type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: cell, font: "Arial", size: 21 })] })]
  }))}));
  return new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: widths, rows: [hRow, ...dataRows] });
}

function threeColTable(headers, rows3, widths=[2000, 2500, 4526]) {
  const hRow = new TableRow({ children: headers.map((h,i) => new TableCell({
    shading: { fill: "1F4E79", type: ShadingType.CLEAR }, borders,
    width: { size: widths[i], type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, font: "Arial", size: 20, bold: true, color: "FFFFFF" })] })]
  }))});
  const dataRows = rows3.map((row, ri) => new TableRow({ children: row.map((cell, ci) => new TableCell({
    shading: { fill: ri%2===0?"EBF3FA":"FFFFFF", type: ShadingType.CLEAR }, borders,
    width: { size: widths[ci], type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: cell, font: "Arial", size: 21 })] })]
  }))}));
  return new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: widths, rows: [hRow, ...dataRows] });
}

// ── DOCUMENT ─────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "\u25CB", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }
      ]},
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }
      ]}
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial", color: BLUE }, paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial", color: LBLUE }, paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: "Arial", color: DKGRAY }, paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2 } }
    ]
  },
  sections: [{
    properties: {
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1701 } }
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: LBLUE, space: 4 } },
        children: [
          new TextRun({ text: "Universidad Distrital Francisco José de Caldas  |  Ingeniería en Telemática  |  Página ", font: "Arial", size: 18, color: "666666" }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "666666" })
        ]
      })] })
    },
    children: [

      // ══════════════════════════════════════════════════════════════════════
      // PORTADA DEL CAPÍTULO
      // ══════════════════════════════════════════════════════════════════════
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1440, after: 80 },
        children: [new TextRun({ text: "CAPÍTULO IV", font: "Arial", size: 28, bold: true, color: "888888" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: "IMPLEMENTACIÓN DE LA SOLUCIÓN", font: "Arial", size: 46, bold: true, color: BLUE })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LBLUE, space: 10 } },
        children: [new TextRun({ text: " ", font: "Arial", size: 22 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 1440 },
        children: [new TextRun({ text: "Optimización Integral de Redes Kubernetes: Comparativa de CNIs,\nAutomatización de NetworkPolicies y Reducción de Sobredimensionamientos", font: "Arial", size: 26, italics: true, color: "444444" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Holman Audrey Alba Castro  |  Duwan Estiven Sierra Guerrero", font: "Arial", size: 22, color: "555555" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Director: Gerardo Alberto Castang Montiel", font: "Arial", size: 22, color: "555555" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Universidad Distrital Francisco José de Caldas — Facultad Tecnológica", font: "Arial", size: 22, color: "555555" })] }),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // INTRODUCCIÓN
      // ══════════════════════════════════════════════════════════════════════
      h1("4. Implementación de la Solución"),
      p("Si el capítulo anterior describió el plano y los cimientos del edificio —el diseño de la solución—, este capítulo narra cómo se construyó ladrillo por ladrillo. La implementación es la fase donde las decisiones de diseño dejan de ser teoría y se convierten en código, configuraciones y sistemas que realmente funcionan y generan datos medibles."),
      p("Este capítulo sigue el orden natural de construcción del proyecto: primero se levantó la infraestructura física en la nube, luego se configuró el sistema de orquestación y despliegue automático, después se activó la pila de observabilidad, luego se ejecutaron las pruebas de rendimiento de red, y finalmente se construyó el prototipo de recomendación que presenta los resultados de manera comprensible. Cada paso está descrito con el nivel de detalle suficiente para que un equipo técnico pueda reproducirlo, y con las explicaciones necesarias para que cualquier lector entienda qué se hizo y por qué."),
      p("Un principio guía de toda la implementación fue la reproducibilidad científica: cualquier decisión técnica que no pueda ser replicada de manera idéntica por otra persona no tiene valor académico. Por eso, toda la infraestructura y configuración está codificada en archivos de texto versionados en Git, y toda prueba está automatizada para eliminar la variabilidad humana de los resultados [7]."),
      spacer(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 4.1 – TERRAFORM
      // ══════════════════════════════════════════════════════════════════════
      h2("4.1 Aprovisionamiento de Infraestructura con Terraform"),
      p("El primer paso de cualquier proyecto de infraestructura es levantar los servidores y las redes sobre las que todo lo demás va a correr. En este proyecto, ese paso se realizó de manera completamente automatizada mediante Terraform, una herramienta de Infraestructura como Código (IaC)."),
      p("¿Por qué automatizar el aprovisionamiento en lugar de crear los servidores manualmente desde el panel web de DigitalOcean? La respuesta es la reproducibilidad. Cuando un científico realiza un experimento, necesita que sus condiciones sean idénticas en cada repetición. Si los servidores se crean manualmente, pequeñas diferencias en la configuración pueden alterar los resultados de las mediciones de red. Con Terraform, escribimos una vez la descripción exacta de lo que queremos, y el sistema se encarga de crearlo siempre de la misma manera [7]."),
      spacer(),

      h3("4.1.1 Estructura del Código Terraform (K8s-bootstrap/00.bootstrap)"),
      p("Los archivos de Terraform que gobiernan el aprovisionamiento están organizados en el repositorio K8s-bootstrap, dentro del directorio 00.bootstrap. Esta organización sigue el principio de separación de responsabilidades: cada archivo tiene una función específica y bien definida."),
      spacer(),

      twoColTable(
        ["Archivo Terraform", "Responsabilidad en la Infraestructura"],
        [
          ["main.tf", "Define los recursos principales: los Droplets (servidores virtuales) de DigitalOcean con sus especificaciones de CPU, RAM y región. También configura la red VPC privada que conecta los nodos entre sí."],
          ["variables.tf", "Centraliza todos los parámetros configurables: número de nodos, tamaño de las instancias, nombre del clúster y región de DigitalOcean. Permite ajustar el experimento sin modificar el código principal."],
          ["ssh_keys.tf", "Automatiza la gestión de llaves SSH para el acceso seguro entre los nodos del clúster y desde la máquina de administración. Garantiza que ninguna contraseña en texto plano esté en el código."],
          ["firewall.tf", "Configura las reglas de firewall a nivel de nube: qué puertos pueden recibir tráfico externo y cuáles son exclusivamente internos al clúster. Esto es la primera línea de seguridad perimetral."],
          ["outputs.tf", "Genera automáticamente el archivo kubeconfig con las credenciales y la dirección del clúster K3s. Este archivo es lo que permite administrar el clúster con el comando kubectl desde cualquier máquina."]
        ]
      ),
      caption("Tabla 4.1 — Archivos Terraform del módulo de aprovisionamiento y su función específica"),
      spacer(),

      p("El proceso de aprovisionamiento tiene tres etapas que Terraform ejecuta en orden. Primero, la fase de planificación (terraform plan): Terraform compara el estado actual de DigitalOcean con lo que describe el código, y genera un reporte de los cambios que necesita hacer. Esto permite revisar exactamente qué va a crear antes de que ocurra. Segundo, la fase de aplicación (terraform apply): Terraform ejecuta los cambios, crea los Droplets, configura la red VPC y aplica las reglas de firewall. Tercero, la fase de salida (terraform output): se extraen las direcciones IP de los nodos y el kubeconfig generado para usarlos en la siguiente fase."),
      spacer(),

      infoBox("¿Qué es un Droplet y una VPC en DigitalOcean?", [
        "Un Droplet es el nombre que DigitalOcean da a sus servidores virtuales en la nube. Es esencialmente una computadora que existe en los centros de datos de DigitalOcean, a la que se accede remotamente. Para este proyecto, se aprovisionaron Droplets con Ubuntu 22.04 LTS, con especificaciones de 2 vCPU y 4 GB de RAM para los nodos Worker, y 2 vCPU / 2 GB para los nodos Master.",
        "Una VPC (Virtual Private Cloud) es una red privada que existe exclusivamente dentro del entorno de DigitalOcean. Los Droplets dentro de la misma VPC pueden comunicarse entre sí usando direcciones IP privadas que no son accesibles desde internet. Esto es fundamental para el proyecto: el tráfico de benchmarks entre los nodos viaja por esta red privada, no por internet público, garantizando que las mediciones de latencia y throughput reflejen el comportamiento del CNI y no las fluctuaciones de la red externa."
      ]),
      spacer(),

      h3("4.1.2 Gestión del Estado y Repetibilidad"),
      p("Una característica fundamental de Terraform es que mantiene un archivo de estado (terraform.tfstate) que registra exactamente qué recursos existen en la nube en cada momento. Este archivo es la memoria de Terraform: si en algún momento se quiere destruir toda la infraestructura para volver a crearla desde cero (por ejemplo, para repetir los experimentos con un CNI diferente), el comando terraform destroy elimina todos los recursos de manera ordenada y sin dejar elementos huérfanos."),
      p("Esta capacidad de crear y destruir la infraestructura de manera controlada es la que garantiza la repetibilidad científica del experimento. Cada vez que se instaló un nuevo CNI para evaluarlo, el proceso fue: terraform destroy para limpiar completamente, terraform apply para recrear la infraestructura desde cero, e instalación del nuevo CNI. Esto garantizó que cada CNI fue evaluado en condiciones idénticas de arranque."),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 4.2 – K3S HA
      // ══════════════════════════════════════════════════════════════════════
      h2("4.2 Configuración del Clúster K3s en Alta Disponibilidad"),
      p("Una vez que los servidores estaban aprovisionados y corriendo en DigitalOcean, el siguiente paso fue instalar y configurar Kubernetes sobre ellos. Para este proyecto se eligió K3s, una distribución liviana de Kubernetes, pero con la configuración de Alta Disponibilidad (HA) para replicar un ambiente representativo de producción real."),
      spacer(),

      h3("4.2.1 Base de Datos Externa para el Plano de Control"),
      p("El primer desafío técnico de implementar K3s en HA es que los tres nodos Master necesitan compartir y sincronizar el estado del clúster. En Kubernetes estándar, esto se logra con etcd, una base de datos distribuida. K3s ofrece una alternativa: usar una base de datos relacional externa compatible como PostgreSQL o MySQL."),
      p("En este proyecto se optó por usar una base de datos gestionada de DigitalOcean (también provisionada via Terraform). Esta decisión tiene una justificación arquitectónica importante: delegar la gestión de la base de datos al proveedor cloud elimina la complejidad operativa de mantener un clúster etcd, y en cambio concentra los recursos del experimento en lo que realmente importa: el comportamiento de la red de los CNIs. El resultado es un datastore resiliente para el plano de control sin que el equipo tenga que preocuparse por réplicas o backups de la base de datos."),
      spacer(),

      h3("4.2.2 Instalación con Pizarra Limpia para Cada CNI"),
      p("La parte más crítica de la implementación del clúster fue el parámetro --flannel-backend=none en la instalación de K3s. Esto requiere una explicación: K3s incluye por defecto Flannel como su CNI integrado. Sin embargo, cuando el objetivo es comparar diferentes CNIs de manera justa, no se puede tener dos CNIs corriendo simultáneamente o uno encima del otro."),
      p("El flag --flannel-backend=none desactiva completamente el CNI integrado de K3s, dejando una \"pizarra limpia\": el clúster tiene la infraestructura de Kubernetes funcionando, pero sin ningún CNI activo. Desde este estado base, se puede instalar cualquier CNI de manera limpia. Esto garantiza que lo que se está midiendo es el CNI bajo evaluación, sin interferencias del CNI predeterminado."),
      spacer(),

      codeBlock([
        "# Instalación de K3s en nodo Master 1 (pizarra limpia para CNI externo)",
        "curl -sfL https://get.k3s.io | sh -s - server \\",
        "  --datastore-endpoint='postgres://user:pass@db-host:5432/k3s' \\",
        "  --flannel-backend=none \\",
        "  --disable-network-policy \\",
        "  --cluster-init",
        "",
        "# Nodos Master 2 y 3 se unen al clúster existente",
        "curl -sfL https://get.k3s.io | sh -s - server \\",
        "  --datastore-endpoint='postgres://user:pass@db-host:5432/k3s' \\",
        "  --flannel-backend=none \\",
        "  --server https://master1-ip:6443",
        "",
        "# Nodos Worker se unen al plano de control",
        "curl -sfL https://get.k3s.io | K3S_URL=https://master1-ip:6443 \\",
        "  K3S_TOKEN=<token-del-cluster> sh -"
      ]),
      caption("Fragmento 4.1 — Comandos de instalación de K3s en HA con pizarra limpia para CNI externo"),
      spacer(),

      infoBox("El ciclo de rotación de CNIs: cómo se cambia un CNI en el clúster", [
        "Cambiar el CNI activo en un clúster Kubernetes no es simplemente instalar uno nuevo. Cada CNI instala interfaces de red virtuales, reglas de enrutamiento y, en el caso de Cilium, programas en el kernel del sistema operativo. Si no se eliminan completamente antes de instalar el siguiente, pueden quedar residuos que afecten las mediciones.",
        "El protocolo de rotación implementado en este proyecto tuvo cuatro pasos: (1) kubectl delete para eliminar todos los recursos del CNI actual del clúster; (2) verificación manual de que no quedan interfaces de red del CNI anterior en los nodos; (3) reinicio de los nodos Worker para limpiar cualquier estado en memoria; (4) aplicación del manifiesto YAML del nuevo CNI via ArgoCD.",
        "Este protocolo garantizó que cada CNI fue evaluado en condiciones limpias y comparables, cumpliendo con el requisito científico de controlar las variables del experimento."
      ]),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 4.3 – GITOPS / ARGOCD
      // ══════════════════════════════════════════════════════════════════════
      h2("4.3 Orquestación y Entrega Continua: GitOps con ArgoCD"),
      p("Con el clúster K3s funcionando y sin CNI, el siguiente componente instalado fue ArgoCD. Como se explicó en el capítulo de diseño, ArgoCD implementa el paradigma GitOps: el repositorio Git es la única fuente de verdad sobre el estado del clúster. Todo lo que debe existir en el clúster está definido en archivos YAML dentro del repositorio K8s-Tesis-Apps."),
      p("¿Por qué ArgoCD antes de instalar el CNI y no después? Porque ArgoCD en sí mismo necesita comunicación de red para funcionar. Se instaló usando kubectl apply directamente con el manifiesto oficial, y sus Pods iniciales se comunican localmente dentro del nodo. Una vez instalado, ArgoCD fue el encargado de instalar el CNI y todos los demás componentes del ecosistema."),
      spacer(),

      h3("4.3.1 El Patrón App of Apps"),
      p("La implementación de ArgoCD en este proyecto utiliza el patrón App of Apps, un enfoque arquitectónico que merece una explicación clara porque es uno de los aportes de diseño más elegantes del proyecto."),
      p("Imagine que tiene 10 aplicaciones diferentes que necesita desplegar en el clúster: el CNI, Prometheus, Grafana, los benchmarks de iperf3, las políticas de red, etc. Sin App of Apps, tendría que crear manualmente 10 objetos de ArgoCD (uno por aplicación) y asegurarse de que se desplieguen en el orden correcto. Con App of Apps, existe UNA sola aplicación raíz que ArgoCD conoce directamente, y esa aplicación raíz contiene las definiciones de todas las demás aplicaciones."),
      spacer(),

      infoBox("Analogía del App of Apps: el director de orquesta", [
        "Imagine un director de orquesta que tiene bajo su mando a 50 músicos. En lugar de coordinar a cada músico individualmente, el director tiene partitura maestra que define cuándo entra cada instrumento y en qué orden.",
        "En el proyecto, el 'director de orquesta' es la aplicación raíz de ArgoCD (ubicada en K8s-bootstrap/30.apps-of-apps-install). Esta aplicación conoce la 'partitura': sabe que primero debe instalar el CNI (para que la red funcione), luego el stack de métricas (para poder medir), luego los benchmarks (para generar tráfico), y finalmente las políticas de red (para asegurar el clúster).",
        "Cuando se hace un push al repositorio Git con un cambio en cualquiera de estas aplicaciones, ArgoCD detecta la diferencia automáticamente y aplica el cambio en el orden correcto. Esto es lo que hace al sistema verdaderamente GitOps: el repositorio Git manda, no los comandos manuales."
      ]),
      spacer(),

      h3("4.3.2 Configuración de selfHeal y prune"),
      p("Dos configuraciones de ArgoCD son especialmente relevantes desde el punto de vista de la seguridad y la integridad del experimento: selfHeal y prune."),
      pMix([{ text: "selfHeal: true", bold: true, italics: true }, { text: " — Si alguien modifica manualmente un recurso del clúster (por ejemplo, cambia los límites de CPU de un Pod o borra una NetworkPolicy), ArgoCD detecta la diferencia con el repositorio Git y automáticamente restaura el estado original. Esto fue crítico para la integridad del experimento: garantizó que las condiciones de prueba no cambiaron accidentalmente durante las sesiones de medición." }]),
      pMix([{ text: "prune: true", bold: true, italics: true }, { text: " — Si se elimina un archivo YAML del repositorio Git, ArgoCD elimina también el recurso correspondiente del clúster. Sin esta configuración, los recursos huérfanos podrían acumularse y afectar las mediciones de uso de CPU y memoria." }]),
      spacer(),

      codeBlock([
        "# Definición de la Application raíz en ArgoCD (App of Apps)",
        "apiVersion: argoproj.io/v1alpha1",
        "kind: Application",
        "metadata:",
        "  name: apps-of-apps",
        "  namespace: argocd",
        "spec:",
        "  project: default",
        "  source:",
        "    repoURL: https://github.com/equipo/K8s-Tesis-Apps",
        "    targetRevision: main",
        "    path: apps/  # Carpeta que contiene todas las sub-aplicaciones",
        "  destination:",
        "    server: https://kubernetes.default.svc",
        "    namespace: argocd",
        "  syncPolicy:",
        "    automated:",
        "      selfHeal: true   # Restaura cambios manuales automáticamente",
        "      prune: true      # Elimina recursos borrados del repo"
      ]),
      caption("Fragmento 4.2 — Definición YAML de la Application raíz del patrón App of Apps en ArgoCD"),
      spacer(),

      h3("4.3.3 Overlays de Kustomize para los CNIs"),
      p("Cada CNI tiene una configuración ligeramente diferente. Para gestionar estas variaciones sin duplicar código, se utilizó Kustomize, una herramienta nativa de Kubernetes para la personalización de manifiestos YAML."),
      p("La estructura de Kustomize sigue el patrón base/overlay: existe una configuración base con los parámetros comunes, y sobre esa base se aplican overlays (capas de personalización) específicas para cada CNI. Por ejemplo, el namespace de instalación, las anotaciones específicas y los valores de configuración de cada plugin (como el modo VXLAN de Flannel, el modo BGP de Calico, el modo eBPF de Cilium o los parámetros OVS de Antrea) están definidos en sus respectivos overlays."),
      twoColTable(
        ["CNI", "Parámetros Clave en su Overlay de Kustomize"],
        [
          ["Flannel", "backend: vxlan, podCIDR: 10.244.0.0/16, MTU ajustada a 1450 bytes para compensar el overhead VXLAN de 50 bytes sobre la red VPC de DigitalOcean (MTU 1500)."],
          ["Calico", "encapsulation: VXLAN (modo inicial), luego BGP para ruteo directo. Configuración de IPPools para el rango de IPs del clúster. IPAM propio de Calico habilitado."],
          ["Cilium", "kubeProxyReplacement: strict (reemplaza kube-proxy completamente con eBPF), bpf.masquerade: true, Hubble habilitado para observabilidad de flujos de red a nivel L7."],
          ["Antrea", "trafficEncapMode: encap (VXLAN por defecto), antreaProxy habilitado, NetworkPolicy habilitada con soporte de políticas a nivel de Antrea (AntreaNetworkPolicy)."]
        ]
      ),
      caption("Tabla 4.2 — Parámetros específicos de configuración de cada CNI en sus overlays de Kustomize"),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 4.4 – OBSERVABILIDAD
      // ══════════════════════════════════════════════════════════════════════
      h2("4.4 Implementación del Stack de Observabilidad"),
      p("Sin métricas, no hay ciencia. El stack de observabilidad es el sistema nervioso del proyecto: recolecta datos de todos los componentes del clúster y los pone a disposición para análisis y visualización. Se implementó mediante el kube-prometheus-stack, un paquete Helm que instala Prometheus, Grafana y un conjunto de exportadores preconfigurados para Kubernetes."),
      spacer(),

      h3("4.4.1 Prometheus: El Recolector de Métricas"),
      p("Prometheus es una base de datos de series temporales diseñada específicamente para métricas de sistemas. Opera con un modelo pull: en lugar de que los sistemas le envíen datos, Prometheus los visita periódicamente (cada 15 segundos en la configuración del proyecto) y extrae las métricas disponibles. Este modelo tiene una ventaja fundamental para el proyecto: si un nodo o CNI falla, Prometheus simplemente deja de recibir métricas de él, lo que en sí mismo es información valiosa."),
      p("Para que Prometheus sepa qué métricas recolectar de los agentes de cada CNI, se implementaron ServiceMonitors, un Custom Resource Definition (CRD) que extiende Kubernetes. Un ServiceMonitor es como una instrucción que le dice a Prometheus: 'Ve a este endpoint HTTP y extrae las métricas que encuentres'. Se creó un ServiceMonitor específico para cada CNI, apuntando al endpoint de métricas de su agente (por ejemplo, el agente calico-node de Calico o el agente cilium de Cilium)."),
      spacer(),

      greenBox("Métricas específicas del agente CNI recolectadas por Prometheus", [
        "container_cpu_usage_seconds_total (filtrado por pod del agente CNI): Permite calcular el porcentaje de CPU que consume el agente de red por cada nodo. Esta es la métrica clave para el indicador 'costo computacional del CNI' del modelo MCDA.",
        "container_memory_rss (filtrado por pod del agente CNI): Memoria física realmente en uso (Resident Set Size) del proceso del agente CNI. A diferencia de la memoria virtual, esta refleja el consumo real del hardware.",
        "node_network_transmit_bytes_total / node_network_receive_bytes_total: Bytes totales transmitidos y recibidos por las interfaces de red de cada nodo, complementando los datos de throughput de iperf3.",
        "kube_pod_info + kube_pod_status_phase: Estado de los Pods del agente CNI. Permite detectar si el agente se reinició o tuvo fallos durante las pruebas, lo que invalidaría las mediciones de ese período."
      ]),
      spacer(),

      h3("4.4.2 Grafana: Los Dashboards de Red"),
      p("Grafana es la capa de visualización que convierte las métricas crudas de Prometheus en gráficas comprensibles. Se configuraron tres dashboards principales, cada uno enfocado en un aspecto diferente del experimento:"),
      p("El dashboard de Throughput y Latencia muestra en tiempo real los resultados de las pruebas iperf3: una gráfica de líneas con el throughput en Mbps a lo largo del tiempo, y otra con la latencia de establecimiento TCP (min/avg/max). Esto permite ver visualmente si hay degradación del rendimiento a lo largo del tiempo o picos anómalos."),
      p("El dashboard de Consumo del Agente CNI muestra el porcentaje de CPU y la memoria RSS del agente de red activo, correlacionado temporalmente con los picos de tráfico generados por iperf3. Esta correlación es la que permite responder la pregunta: ¿cuántos recursos consume el CNI para mover X Gbps de tráfico?"),
      p("El dashboard de Comparativa MCDA muestra el ranking final de CNIs calculado por el procesador.js, actualizado automáticamente cada vez que el CronJob de exportación ejecuta un nuevo ciclo. Este es el dashboard que los equipos técnicos consultan para tomar decisiones de selección."),
      spacer(),

      h3("4.4.3 El Grafana Exporter: Extracción Automatizada de Datos"),
      p("Un componente personalizado desarrollado para el proyecto es el Grafana Exporter, implementado como un CronJob de Kubernetes en el repositorio K8s-Tesis-Apps/grafana-exporter. Su función es actuar como puente entre Prometheus y el procesador de datos del modelo MCDA."),
      p("El Grafana Exporter se ejecuta al finalizar cada ciclo de pruebas (después del CronJob de iperf3). Consulta la API HTTP de Prometheus usando llamadas PromQL (el lenguaje de consultas de Prometheus) para extraer los promedios de consumo de CPU y RAM del periodo de la prueba. Los resultados se serializan en formato JSON y se guardan en el repositorio K8S-CNI-Results para su procesamiento por el modelo MCDA."),
      codeBlock([
        "# Ejemplo de consulta PromQL ejecutada por el Grafana Exporter",
        "# Promedio de CPU del agente CNI durante los últimos 30 minutos",
        "avg_over_time(",
        "  rate(container_cpu_usage_seconds_total{",
        "    pod=~'cilium-.*',",
        "    namespace='kube-system'",
        "  }[5m])[30m:5m]",
        ")",
        "",
        "# Promedio de memoria RSS del agente CNI",
        "avg_over_time(",
        "  container_memory_rss{",
        "    pod=~'cilium-.*',",
        "    namespace='kube-system'",
        "  }[30m:5m]",
        ")"
      ]),
      caption("Fragmento 4.3 — Consultas PromQL usadas por el Grafana Exporter para capturar el costo computacional del CNI"),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 4.5 – BENCHMARKS
      // ══════════════════════════════════════════════════════════════════════
      h2("4.5 Implementación del Banco de Pruebas de QoS"),
      p("El banco de pruebas es el corazón experimental del proyecto: el sistema que genera tráfico de red real entre los nodos y mide su comportamiento. Se implementaron dos componentes complementarios: el benchmark de throughput con iperf3 y el cliente de latencia personalizado."),
      spacer(),

      h3("4.5.1 Escenario de Rendimiento con iperf3"),
      p("iperf3 opera con un modelo cliente-servidor similar al de cualquier aplicación de red real. El servidor espera conexiones y el cliente las inicia enviando datos. La diferencia con una aplicación normal es que iperf3 mide y reporta estadísticas detalladas de la transferencia en lugar de hacer algo útil con los datos."),
      spacer(),

      p("La implementación en Kubernetes tiene dos objetos:", { bold: false }),
      pMix([{ text: "El iperf3-server (Deployment):", bold: true }, { text: " Un Deployment con una réplica que ejecuta iperf3 en modo servidor. El Deployment garantiza que el servidor siempre esté disponible: si el Pod falla por cualquier razón, Kubernetes lo reinicia automáticamente. Se le asignó un Service de tipo ClusterIP para que el cliente pueda localizarlo por nombre DNS estable en lugar de por dirección IP (que cambia cada vez que el Pod se reinicia)." }]),
      pMix([{ text: "El iperf3-client (CronJob):", bold: true }, { text: " Un CronJob con la programación '*/30 * * * *' (cada 30 minutos). Cuando se activa, crea un Pod cliente que conecta con el servidor y ejecuta una ráfaga de tráfico TCP de 300 segundos (5 minutos) con formato JSON de salida. Al finalizar, el Pod envía los resultados al repositorio K8S-CNI-Results mediante un script Bash que hace uso de la API de GitHub." }]),
      spacer(),

      codeBlock([
        "# iperf-client-cronjob.yaml — fragmento relevante",
        "apiVersion: batch/v1",
        "kind: CronJob",
        "metadata:",
        "  name: iperf-client",
        "  namespace: cni-benchmark",
        "spec:",
        "  schedule: '*/30 * * * *'   # Cada 30 minutos",
        "  jobTemplate:",
        "    spec:",
        "      template:",
        "        spec:",
        "          affinity:",
        "            podAntiAffinity:",
        "              requiredDuringSchedulingIgnoredDuringExecution:",
        "              - labelSelector:",
        "                  matchLabels:",
        "                    app: iperf-server",
        "                topologyKey: kubernetes.io/hostname  # Nodo diferente garantizado",
        "          containers:",
        "          - name: iperf-client",
        "            image: networkstatic/iperf3:latest",
        "            command:",
        "            - sh",
        "            - -c",
        "            - |",
        "              iperf3 -c iperf-server-svc -t 300 -J > /results/run-$(date +%s).json",
        "              # -c: modo cliente   -t: duración 300s   -J: salida JSON",
        "          restartPolicy: OnFailure"
      ]),
      caption("Fragmento 4.4 — Definición YAML del CronJob de iperf3 con podAntiAffinity para garantizar tráfico inter-nodo"),
      spacer(),

      h3("4.5.2 Cliente de Latencia Personalizado"),
      p("Mientras iperf3 mide el throughput máximo sostenido, hay otra métrica igualmente importante para las aplicaciones: la latencia de establecimiento de conexión TCP. Esta métrica mide cuánto tiempo tarda una aplicación en conectarse a otra desde cero, sin transferir datos."),
      p("Para medir esta métrica, se desarrolló un cliente de latencia personalizado en Python y Bash, implementado también como un CronJob (latency-client-cronjob.yaml). El cliente realiza repetidamente conexiones TCP al servicio iperf3-server usando la función connect() del socket de Python, midiendo el tiempo entre la solicitud de conexión y su establecimiento exitoso."),
      p("El cliente captura tres estadísticas por cada sesión de 100 conexiones: latencia mínima (la mejor condición que experimentó la red), latencia promedio (el comportamiento típico) y latencia máxima (el peor caso, indicador del jitter de la red). El jitter es especialmente relevante para aplicaciones de tiempo real como videollamadas, donde la variabilidad en la latencia afecta la calidad de la comunicación más que la latencia promedio."),
      spacer(),

      threeColTable(
        ["Métrica Capturada", "Unidad", "Relevancia para QoS Telemático"],
        [
          ["Throughput TCP sostenido", "Gbps / Mbps", "Capacidad efectiva de la red para transferencias de datos. Determina si la red puede sostener aplicaciones de alta demanda."],
          ["Latencia mínima TCP connect", "ms", "Mejor escenario de respuesta de la red. Refleja el overhead mínimo del CNI sin congestión."],
          ["Latencia promedio TCP connect", "ms", "Comportamiento típico. El valor que experimentan la mayoría de las solicitudes de conexión en condiciones normales."],
          ["Latencia máxima / Jitter", "ms", "Peor caso y variabilidad. Crítico para aplicaciones de tiempo real. Un jitter alto degrada videollamadas y streaming."],
          ["Retransmisiones TCP", "count / sesión", "Paquetes que debieron enviarse de nuevo por error. Indicador de problemas en el encapsulamiento del CNI o congestión."],
          ["CPU del agente CNI", "millicores (m)", "Recursos de procesamiento que consume el componente de red. Impacto directo en el costo de infraestructura cloud."],
          ["RAM del agente CNI (RSS)", "MiB", "Memoria física del agente CNI. Impacta la capacidad del nodo para correr más aplicaciones simultáneamente."]
        ],
        [2800, 1500, 4726]
      ),
      caption("Tabla 4.3 — Métricas de QoS capturadas por el banco de pruebas y su relevancia telemática"),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 4.6 – PROCESAMIENTO DE DATOS
      // ══════════════════════════════════════════════════════════════════════
      h2("4.6 Procesamiento Estadístico y Aplicación del Modelo MCDA"),
      p("Los datos crudos que generan iperf3, el cliente de latencia y el Grafana Exporter son el insumo del procesador estadístico. Este componente, implementado en JavaScript (procesador.js) dentro del repositorio K8S-CNI-Results/docs, aplica la limpieza estadística y el modelo MCDA para producir los puntajes finales de cada CNI."),
      spacer(),

      h3("4.6.1 Limpieza con el Rango Intercuartílico (IQR)"),
      p("El procesador lee todos los archivos JSON generados por las pruebas y construye una serie temporal para cada métrica y cada CNI. A esta serie temporal se le aplica el algoritmo IQR para detectar y eliminar outliers."),
      p("El algoritmo calcula el primer cuartil (Q1, el valor por debajo del cual está el 25% de los datos) y el tercer cuartil (Q3, el valor por debajo del cual está el 75% de los datos). La diferencia entre ellos es el Rango Intercuartílico: IQR = Q3 - Q1. Un valor es considerado outlier y se excluye si está por debajo de Q1 - 1.5 * IQR o por encima de Q3 + 1.5 * IQR. El promedio se calcula únicamente sobre los valores que pasan este filtro."),
      spacer(),

      codeBlock([
        "// procesador.js — Función de limpieza estadística IQR",
        "function calcularEstadisticasLimpias(valores) {",
        "  const sorted = [...valores].sort((a, b) => a - b);",
        "  const q1 = sorted[Math.floor(sorted.length * 0.25)];",
        "  const q3 = sorted[Math.floor(sorted.length * 0.75)];",
        "  const iqr = q3 - q1;",
        "  const lowerBound = q1 - 1.5 * iqr;",
        "  const upperBound = q3 + 1.5 * iqr;",
        "",
        "  // Filtramos outliers y calculamos promedio limpio",
        "  const valoresLimpios = valores.filter(v => v >= lowerBound && v <= upperBound);",
        "  const promedio = valoresLimpios.reduce((sum, v) => sum + v, 0) / valoresLimpios.length;",
        "",
        "  return {",
        "    promedio,",
        "    outliersPorcentaje: ((valores.length - valoresLimpios.length) / valores.length * 100).toFixed(1)",
        "  };",
        "}"
      ]),
      caption("Fragmento 4.5 — Implementación del algoritmo IQR en el procesador.js para limpieza estadística"),
      spacer(),

      h3("4.6.2 Normalización y Cálculo del Score MCDA"),
      p("Después de la limpieza, las métricas pasan por normalización min-max: cada valor se escala al rango [0, 1], donde 1 representa el mejor valor observado entre todos los CNIs. Para métricas positivas (mayor es mejor, como el throughput), la normalización es directa. Para métricas negativas (menor es mejor, como la latencia o el consumo de CPU), se invierte: el valor más bajo recibe el puntaje 1 y el más alto recibe el 0."),
      p("Con las métricas normalizadas, el cálculo del score MCDA para cada perfil es una suma ponderada: se multiplica cada métrica normalizada por su peso correspondiente al perfil y se suman todos los productos. El resultado es un puntaje entre 0 y 1 donde 1 representa la solución óptima teórica para ese perfil. El CNI con el puntaje más alto es la recomendación del sistema para ese perfil organizacional."),
      codeBlock([
        "// procesador.js — Cálculo del score MCDA por perfil",
        "const perfiles = {",
        "  fintech:    { throughput: 0.15, latencia: 0.20, retransmisiones: 0.15,",
        "                cpu: 0.10, ram: 0.10, networkPoliciesL7: 0.30 },",
        "  streaming:  { throughput: 0.35, latencia: 0.35, retransmisiones: 0.20,",
        "                cpu: 0.10, ram: 0.00, networkPoliciesL7: 0.00 },",
        "  iot:        { throughput: 0.25, latencia: 0.20, retransmisiones: 0.15,",
        "                cpu: 0.30, ram: 0.10, networkPoliciesL7: 0.00 }",
        "};",
        "",
        "function calcularScoreMCDA(metricas, perfil) {",
        "  const pesos = perfiles[perfil];",
        "  return Object.keys(pesos).reduce((score, metrica) => {",
        "    return score + (metricas[metrica] || 0) * pesos[metrica];",
        "  }, 0);",
        "}"
      ]),
      caption("Fragmento 4.6 — Implementación del modelo MCDA en el procesador.js con pesos por perfil de usuario"),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 4.7 – SPA RECOMENDADOR
      // ══════════════════════════════════════════════════════════════════════
      h2("4.7 Prototipo Recomendador: Aplicación Web SPA"),
      p("El último componente del ecosistema es el que hace toda la complejidad técnica accesible para cualquier equipo organizacional: la aplicación web de recomendación de CNI. Esta aplicación consume los datos procesados por el modelo MCDA y los presenta en una interfaz visual interactiva donde el usuario puede seleccionar su perfil y obtener instantáneamente la recomendación con su justificación."),
      spacer(),

      h3("4.7.1 Tecnologías de Implementación"),
      p("La SPA (Single Page Application) fue implementada con React 18 como framework de interfaz de usuario, Vite como herramienta de empaquetado y servidor de desarrollo, y Tailwind CSS para el sistema de estilos. Esta combinación de tecnologías fue elegida por tres razones: React es el estándar de facto para interfaces de usuario modernas, Vite ofrece tiempos de recarga instantáneos durante el desarrollo, y Tailwind permite construir interfaces responsivas (adaptadas a pantallas de todos los tamaños) sin escribir CSS personalizado."),
      spacer(),

      twoColTable(
        ["Tecnología", "Versión y Función en el Prototipo"],
        [
          ["React", "v18.2 — Framework de UI basado en componentes reutilizables. Gestiona el estado de la aplicación (perfil seleccionado, datos cargados) y actualiza la vista automáticamente."],
          ["Vite", "v4.4 — Bundler de siguiente generación con Hot Module Replacement. Permite ver cambios en el navegador en menos de 50ms durante el desarrollo."],
          ["Tailwind CSS", "v3.3 — Framework CSS utilitario. Permite estilar componentes directamente en el JSX sin archivos CSS separados, reduciendo la complejidad del proyecto."],
          ["Fetch API (nativa)", "— La aplicación consume el archivo cni-data.json localmente o desde GitHub Raw, sin necesidad de un servidor backend. Esto hace al prototipo deployable como sitio estático."]
        ]
      ),
      caption("Tabla 4.4 — Stack tecnológico del prototipo SPA recomendador"),
      spacer(),

      h3("4.7.2 Flujo de la Aplicación"),
      p("La experiencia de usuario del prototipo fue diseñada para ser tan simple como posible, en línea con el objetivo de que cualquier equipo técnico pueda usarla sin capacitación especial. El flujo tiene tres pasos:"),
      numbered("SELECCIÓN DE PERFIL: La pantalla principal muestra tres tarjetas (Fintech/Seguridad, Streaming/Rendimiento, IoT/Recursos), cada una con una descripción breve del tipo de organización que representa. El usuario hace clic en la que describe mejor su caso de uso."),
      numbered("VISUALIZACIÓN DE RESULTADOS: Inmediatamente, la aplicación carga el archivo cni-data.json y calcula el ranking MCDA para el perfil seleccionado. Se muestra una tabla con los cuatro CNIs ordenados por puntaje, con barras de progreso visuales y el desglose de puntuación por cada criterio. El CNI con mayor puntaje se resalta como la recomendación del sistema."),
      numbered("JUSTIFICACIÓN TÉCNICA: Debajo del ranking, la aplicación muestra las métricas brutas promedio de cada CNI (throughput en Gbps, latencia en ms, consumo de CPU en millicores) en formato de gráficas comparativas. Esto permite al equipo técnico comprender por qué el sistema recomienda un CNI en particular y validar si la recomendación hace sentido para su contexto específico."),
      spacer(),

      infoBox("¿Qué hace diferente a este prototipo de un simple dashboard?", [
        "La diferencia fundamental es la inteligencia de decisión. Un dashboard tradicional (como los de Grafana) muestra datos: 'Cilium tuvo un throughput de 9.2 Gbps y Flannel de 8.7 Gbps'. Interpretar esos datos requiere experiencia técnica en redes.",
        "El prototipo recomendador va un paso más allá: contextualiza los datos según las prioridades del usuario. Para un equipo Fintech, 9.2 Gbps vs 8.7 Gbps puede ser irrelevante si lo que más importa es que Cilium soporta Network Policies L7 y Flannel no. El prototipo aplica el modelo MCDA y dice directamente: 'Para tu caso de uso, la recomendación es Cilium. Aquí está el por qué'.",
        "Esto es lo que convierte el proyecto de un experimento de laboratorio en una herramienta de toma de decisiones aplicable en organizaciones reales."
      ]),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 4.8 – IMPLEMENTACIÓN NETWORK POLICIES
      // ══════════════════════════════════════════════════════════════════════
      h2("4.8 Implementación de Network Policies y Seguridad Zero Trust"),
      p("Paralelamente al banco de pruebas de rendimiento, se implementó la estrategia de seguridad descrita en el capítulo de diseño. La implementación de Network Policies se realizó mediante manifiestos YAML declarativos, organizados en el repositorio K8s-Tesis-Apps y gestionados por ArgoCD."),
      spacer(),

      h3("4.8.1 Políticas Default Deny"),
      p("El primer conjunto de políticas implementadas fueron las de Default Deny para cada namespace del clúster. Una política Default Deny en Kubernetes tiene una sintaxis elegantemente simple: se aplica a todos los Pods del namespace (selector vacío) y no tiene reglas de ingress ni egress, lo que en la lógica de NetworkPolicy significa que todo el tráfico queda bloqueado."),
      codeBlock([
        "# default-deny-all.yaml — Política que bloquea todo el tráfico del namespace",
        "apiVersion: networking.k8s.io/v1",
        "kind: NetworkPolicy",
        "metadata:",
        "  name: default-deny-all",
        "  namespace: production",
        "spec:",
        "  podSelector: {}          # {} significa: aplica a TODOS los Pods del namespace",
        "  policyTypes:",
        "  - Ingress                # Bloquea todo el tráfico entrante",
        "  - Egress                 # Bloquea todo el tráfico saliente",
        "  # Sin reglas ingress/egress = todo bloqueado"
      ]),
      caption("Fragmento 4.7 — Política Default Deny que implementa el primer nivel del modelo Zero Trust"),
      spacer(),

      h3("4.8.2 Micro-segmentación por Capas de Aplicación"),
      p("Sobre la base de Default Deny, se implementaron las políticas específicas que permiten únicamente el tráfico necesario. El ejemplo más ilustrativo es la micro-segmentación de una aplicación web de tres capas:"),
      codeBlock([
        "# allow-frontend-to-backend.yaml",
        "# Permite que el frontend se comunique con el backend en puerto 8080",
        "apiVersion: networking.k8s.io/v1",
        "kind: NetworkPolicy",
        "metadata:",
        "  name: allow-frontend-to-backend",
        "  namespace: production",
        "spec:",
        "  podSelector:",
        "    matchLabels:",
        "      tier: backend         # Esta política aplica a los Pods del backend",
        "  policyTypes:",
        "  - Ingress",
        "  ingress:",
        "  - from:",
        "    - podSelector:",
        "        matchLabels:",
        "          tier: frontend    # Solo acepta tráfico desde Pods etiquetados como frontend",
        "    ports:",
        "    - protocol: TCP",
        "      port: 8080            # Solo en el puerto 8080"
      ]),
      caption("Fragmento 4.8 — Política de micro-segmentación que permite comunicación específica frontend → backend"),
      spacer(),

      p("El resultado práctico de esta implementación es que la red del clúster pasa de un estado 'todos pueden hablar con todos' a un estado donde las comunicaciones autorizadas son exactamente las que el equipo definió. Este cambio se puede verificar con herramientas como kubectl exec para intentar conexiones entre Pods que no deberían comunicarse, o con la funcionalidad de visualización de flujos de Cilium Hubble, que muestra en tiempo real qué conexiones están siendo permitidas y cuáles están siendo bloqueadas por las políticas."),
      spacer(),

      h3("4.8.3 Validación Automatizada de Políticas"),
      p("Una de las causas del problema identificadas en el árbol de problemas era la falta de pruebas automatizadas que confirmen que las políticas de red siguen siendo efectivas. Para resolver esto, se implementó un pipeline de validación que se ejecuta automáticamente cada vez que se hacen cambios a las políticas en el repositorio Git."),
      p("El pipeline utiliza una herramienta llamada netcat (nc) dentro de Pods de prueba para verificar la conectividad. Para cada par de Pods, el pipeline tiene una expectativa: 'esta conexión DEBE funcionar' o 'esta conexión DEBE estar bloqueada'. Si la realidad no coincide con la expectativa (una conexión que debería estar bloqueada pasa, o una que debería funcionar está fallando), el pipeline reporta un error que notifica al equipo."),
      twoColTable(
        ["Prueba de Validación", "Resultado Esperado y Justificación"],
        [
          ["frontend → backend (puerto 8080)", "PERMITIDO — Comunicación necesaria para que la aplicación funcione. Si esta falla, la aplicación queda rota."],
          ["frontend → database (puerto 5432)", "BLOQUEADO — El frontend no debe acceder directamente a la base de datos. Si esto pasa, hay un riesgo de seguridad crítico."],
          ["backend → database (puerto 5432)", "PERMITIDO — El backend necesita leer y escribir datos. Comunicación esencial y autorizada."],
          ["database → cualquier Pod", "BLOQUEADO — La base de datos nunca debe iniciar conexiones salientes. Si lo hace, indica una posible exfiltración de datos."],
          ["Pod externo → namespace production", "BLOQUEADO — Ningún Pod de otros namespaces puede entrar al namespace de producción sin una regla explícita."]
        ]
      ),
      caption("Tabla 4.5 — Casos de prueba del pipeline de validación de Network Policies"),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 4.9 – RESUMEN DE REPOSITORIOS
      // ══════════════════════════════════════════════════════════════════════
      h2("4.9 Estructura de Repositorios y Entregables Técnicos"),
      p("La implementación completa del proyecto está organizada en tres repositorios Git que trabajan de manera coordinada. Esta separación de repositorios siguió el principio de separación de responsabilidades: cada repositorio tiene una función específica y bien delimitada."),
      spacer(),

      threeColTable(
        ["Repositorio", "Contenido Principal", "Relación con los Objetivos Específicos"],
        [
          ["K8s-bootstrap", "Código Terraform (00.bootstrap), scripts de instalación K3s HA (10.k3s-ha-do), manifiestos de ArgoCD (20.argo-cd-install) y patrón App of Apps (30.apps-of-apps-install).", "OE1: Provee la infraestructura controlada necesaria para las pruebas de rendimiento cuantitativo de los CNIs."],
          ["K8s-Tesis-Apps", "Overlays Kustomize para los 4 CNIs, stack de observabilidad (apps/metrics), benchmarks iperf3 (cni_test_iperf), cliente de latencia, Network Policies y Grafana Exporter.", "OE1, OE2 y OE3: Implementa las pruebas de rendimiento, la configuración de seguridad y el sistema de recolección de métricas."],
          ["K8S-CNI-Results", "Archivos JSON/CSV con resultados de cada ejecución, procesador.js (modelo MCDA) y la SPA recomendadora (cni-recommender-spa).", "OE3 y OE4: Implementa el modelo de comparación objetiva y el prototipo funcional de recomendación."]
        ],
        [2200, 3800, 3026]
      ),
      caption("Tabla 4.6 — Estructura de los tres repositorios del proyecto y su relación con los objetivos específicos"),
      spacer(),

      p("Esta arquitectura de repositorios también implementa un flujo de datos unidireccional: K8s-bootstrap crea la infraestructura → K8s-Tesis-Apps despliega las aplicaciones y genera las métricas → K8S-CNI-Results almacena, procesa y visualiza los resultados. Esta separación hace que el sistema sea modular: si se quiere añadir un nuevo CNI en el futuro, basta con crear su overlay en K8s-Tesis-Apps sin tocar los otros repositorios."),
      spacer(),

      // ══════════════════════════════════════════════════════════════════════
      // SECCIÓN 4.10 – DESAFÍOS
      // ══════════════════════════════════════════════════════════════════════
      h2("4.10 Desafíos de Implementación y Soluciones Adoptadas"),
      p("Ningún proyecto de esta naturaleza se implementa sin enfrentar obstáculos técnicos. Documentar los desafíos encontrados y las soluciones adoptadas es un aporte académico valioso, ya que permite a futuros investigadores anticipar y resolver estos mismos problemas más eficientemente."),
      spacer(),

      twoColTable(
        ["Desafío Encontrado", "Solución Técnica Implementada"],
        [
          ["MTU mismatch al instalar Cilium: los Pods no podían comunicarse entre sí. Los paquetes se fragmentaban silenciosamente en la red VPC.", "Se calculó la MTU efectiva: 1500 (VPC) - 50 (overhead VXLAN de Cilium) = 1450. Se configuró el parámetro MTU en el overlay de Kustomize de Cilium. Se validó con ping -M do -s 1400 entre Pods."],
          ["ArgoCD en estado OutOfSync tras la rotación de CNI: los Pods de ArgoCD perdían conectividad durante el cambio de CNI.", "Se implementó una secuencia de rotación segura: primero poner ArgoCD en modo Suspended, luego rotar el CNI, verificar conectividad, y finalmente reactivar ArgoCD. El selfHeal se encargó de restaurar cualquier recurso perdido."],
          ["Outliers frecuentes en las pruebas de madrugada: la plataforma DigitalOcean mostraba throttling de CPU en horas de alta demanda del datacenter.", "Se configuró una ventana de pruebas exclusiva para horas de baja demanda (9am-5pm hora Colombia). Adicionalmente, el algoritmo IQR filtra automáticamente estos outliers cuando ocurren fuera de la ventana preferida."],
          ["El procesador.js necesitaba datos de Network Policies L7 que iperf3 no puede medir (iperf3 opera en capa 4).", "Se añadió una variable binaria (soporta/no soporta) al modelo MCDA para la capacidad de Network Policies L7. Se verificó manualmente si cada CNI soporta esta función. Cilium recibe valor 1 (soporta), los demás reciben 0."],
          ["La SPA no podía actualizarse automáticamente con nuevos datos sin redeployar la aplicación.", "Se implementó polling cada 5 minutos al archivo cni-data.json en GitHub Raw. Cuando el procesador.js actualiza el archivo (tras cada ciclo de benchmarks), la SPA lo detecta y actualiza la interfaz automáticamente sin intervención del usuario."]
        ]
      ),
      caption("Tabla 4.7 — Desafíos técnicos encontrados durante la implementación y soluciones adoptadas"),
      pageBreak(),

      // ══════════════════════════════════════════════════════════════════════
      // REFERENCIAS
      // ══════════════════════════════════════════════════════════════════════
      h1("5. Referencias Bibliográficas"),
      p("Las siguientes fuentes académicas y técnicas fundamentaron las decisiones de implementación descritas en este capítulo, en formato IEEE:"),
      spacer(),

      ...[
        ['[1]', '"EndpointSlices," Kubernetes. [En línea]. Disponible en: https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/. [Consultado: 21-ago-2025].'],
        ['[2]', '"Cluster networking," Kubernetes. [En línea]. Disponible en: https://kubernetes.io/docs/concepts/cluster-administration/networking/. [Consultado: 21-ago-2025].'],
        ['[3]', '"Virtual IPs and Service proxies," Kubernetes. [En línea]. Disponible en: https://kubernetes.io/docs/reference/networking/virtual-ips/. [Consultado: 21-ago-2025].'],
        ['[4]', '"Network plugins," Kubernetes. [En línea]. Disponible en: https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/network-plugins/. [Consultado: 21-ago-2025].'],
        ['[5]', 'D. E. Eisenbud et al., "Maglev: A fast and reliable software network load balancer," en Proc. USENIX NSDI, 2016.'],
        ['[6]', 'F. Gomes, P. Rego y F. Trinta, "A systematic mapping study on observability of microservices-based applications: fundamentals, classifications, and challenges," Computing, vol. 107, núm. 9, 2025.'],
        ['[7]', 'Z. Kang, K. An, A. Gokhale y P. Pazandak, "A comprehensive performance evaluation of different Kubernetes CNI plugins for edge-based and containerized publish/subscribe applications," en Proc. IC2E, 2021.'],
        ['[8]', 'G. Koukis, S. Skaperas, I. A. Kapetanidou, L. Mamatas y V. Tsaoussidis, "Performance evaluation of Kubernetes networking approaches across constraint edge environments," arXiv [cs.NI], 2024.'],
        ['[9]', 'Mdpi.com. [En línea]. Disponible en: https://www.mdpi.com/2079-9292/13/19/3972. [Consultado: 21-ago-2025].'],
        ['[10]', '"Elevating Kubernetes network security through Cilium deployment," Fh-Joanneum, 2024.'],
        ['[11]', 'W. Tu, Y.-H. Wei, G. Antichi y B. Pfaff, "Revisiting the Open vSwitch dataplane ten years later," en Proc. ACM SIGCOMM, 2021.'],
        ['[12]', '"Configure MTU to maximize network performance," Tigera.io. [En línea]. Disponible en: https://docs.tigera.io/calico/latest/networking/configuring/mtu. [Consultado: 21-ago-2025].'],
        ['[13]', '"Service," Kubernetes. [En línea]. Disponible en: https://kubernetes.io/docs/concepts/services-networking/service/. [Consultado: 21-ago-2025].'],
        ['[14]', 'M. Kotenko, D. Moskalyk, V. Kovach y V. Osadchyi, "Navigating the challenges and best practices in securing microservices architecture," Ceur-ws.org, 2024.'],
        ['[15]', '"CNI Specification," Cni.dev. [En línea]. Disponible en: https://www.cni.dev/docs/spec/. [Consultado: 21-ago-2025].'],
        ['[16]', '"host-local IP address management plugin," Cni.dev. [En línea]. Disponible en: https://www.cni.dev/plugins/current/ipam/host-local/. [Consultado: 21-ago-2025].'],
        ['[17]', 'B. Pfaff et al., "The design and implementation of Open vSwitch," en Proc. USENIX NSDI, 2015.'],
        ['[18]', '"Antrea network flow visibility," Antrea.io. [En línea]. Disponible en: https://antrea.io/docs/v1.0.0/docs/network-flow-visibility/. [Consultado: 21-ago-2025].'],
        ['[19]', 'S. Rose, O. Borchert, S. Mitchell y S. Connelly, "Zero Trust Architecture," NIST SP 800-207, 2020.'],
        ['[20]', 'O. Borchert, G. Howell, A. Kerman, S. Rose y M. Souppaya, "Implementing a Zero Trust Architecture," NIST, Gaithersburg, MD, 2025.'],
        ['[21]', 'R. Chandramouli y Z. Butcher, "Building secure microservices-based applications using service-mesh architecture," NIST, Gaithersburg, MD, 2020.'],
        ['[22]', 'J. Zhang, P. Chen, Z. He, H. Chen y X. Li, "Real-time intrusion detection and prevention with neural network in kernel using eBPF," en Proc. IEEE/IFIP DSN, 2024, pp. 416-428.'],
        ['[23]', 'M. I. Cordero-Pérez y P. E. Salas-Duarte, "Inteligencia Artificial en la Gestión de Redes Telemáticas," Rev. Vínculos, vol. 21, no. 1, may. 2024.'],
        ['[24]', '"Roles and personas - Kubernetes Gateway API," K8s.io. [En línea]. Disponible en: https://gateway-api.sigs.k8s.io/concepts/roles-and-personas/. [Consultado: 21-ago-2025].'],
        ['[25]', 'J. Castellanos y C. G. Castrillón Arias, "Diseño de una ruta metodológica para la toma de decisiones en la adquisición de software," Tecnura, vol. 27, no. 75, pp. 38-50, ene. 2023.']
      ].map(([num, text]) => new Paragraph({
        spacing: { before: 60, after: 80, line: 320 },
        indent: { left: 720, hanging: 360 },
        children: [
          new TextRun({ text: num + ' ', font: "Arial", size: 20, bold: true, color: LBLUE }),
          new TextRun({ text, font: "Arial", size: 20, color: "333333" })
        ]
      })),
      spacer(),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: LBLUE, space: 8 } },
        children: [new TextRun({ text: "— Fin del Capítulo de Implementación de la Solución —", font: "Arial", size: 20, italics: true, color: "888888" })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/claude/Implementacion_Solucion_Tesis.docx", buf);
  console.log("OK");
});
