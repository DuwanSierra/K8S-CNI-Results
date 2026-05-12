const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const SOURCES = [
  "1diseno_solucion.js",
  "2implementacion.js",
  "3pruebas_y_validacion.js",
];

class Document {
  constructor(props = {}) {
    this.props = props;
    this.sections = props.sections || [];
  }
}
class Paragraph {
  constructor(props = {}) {
    this.props = props;
  }
}
class TextRun {
  constructor(props = {}) {
    this.props = typeof props === "string" ? { text: props } : props;
  }
}
class Table {
  constructor(props = {}) {
    this.props = props;
    this.rows = props.rows || [];
  }
}
class TableRow {
  constructor(props = {}) {
    this.props = props;
    this.children = props.children || [];
  }
}
class TableCell {
  constructor(props = {}) {
    this.props = props;
    this.children = props.children || [];
  }
}
class Footer { constructor(props = {}) { this.props = props; } }
class Header { constructor(props = {}) { this.props = props; } }
class PageBreak {}

const HeadingLevel = {
  HEADING_1: "HEADING_1",
  HEADING_2: "HEADING_2",
  HEADING_3: "HEADING_3",
};
const AlignmentType = {
  CENTER: "CENTER",
  JUSTIFIED: "JUSTIFIED",
  RIGHT: "RIGHT",
};
const BorderStyle = { SINGLE: "SINGLE", NONE: "NONE" };
const WidthType = { DXA: "DXA", PERCENTAGE: "PERCENTAGE" };
const ShadingType = { CLEAR: "CLEAR" };
const LevelFormat = { DECIMAL: "DECIMAL", BULLET: "BULLET" };
const VerticalAlign = { CENTER: "CENTER" };
const PageNumber = { CURRENT: "__PAGE_CURRENT__" };

function captureDoc(file) {
  let captured = null;
  const moduleObj = { exports: {} };
  const requireFn = function requireMock(name) {
    if (name === "docx") return fakeDocx;
    if (name === "fs") return {
      writeFileSync() {},
      readFileSync: fs.readFileSync,
      existsSync: fs.existsSync,
    };
    return require(name);
  };
  requireFn.main = {};
  const fakeDocx = {
    Document, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
    LevelFormat, PageNumber, PageBreak, Footer, Header, VerticalAlign,
    Packer: {
      toBuffer(doc) {
        captured = doc;
        return Promise.resolve(Buffer.from(""));
      },
    },
  };

  const context = {
    require: requireFn,
    console,
    Buffer,
    process: { ...process, exit() {} },
    module: moduleObj,
    exports: moduleObj.exports,
    __dirname: ROOT,
    __filename: path.join(ROOT, file),
  };

  const code = fs.readFileSync(path.join(ROOT, file), "utf8");
  vm.runInNewContext(code, context, { filename: file });
  if (!captured && moduleObj.exports && moduleObj.exports.doc) captured = moduleObj.exports.doc;
  if (!captured) throw new Error(`No se pudo capturar el documento generado por ${file}`);
  return captured;
}

function rawTextFromRun(run) {
  if (!run) return "";
  const props = run.props || {};
  if (typeof props.text === "string") return props.text;
  if (Array.isArray(props.children)) {
    return props.children.map((child) => typeof child === "string" ? child : "").join("");
  }
  return "";
}

function rawTextFromParagraph(paragraph) {
  const children = paragraph.props.children || [];
  return children.map(rawTextFromRun).join("").replace(/\s+\n/g, "\n").trim();
}

function rawTextFromCell(cell) {
  return (cell.children || [])
    .map((child) => child instanceof Paragraph ? rawTextFromParagraph(child) : "")
    .filter(Boolean)
    .join(" ");
}

function tokenStore() {
  const tokens = [];
  return {
    put(value) {
      const token = `ZZZLATEXTOKEN${tokens.length}ZZZ`;
      tokens.push([token, value]);
      return token;
    },
    restore(text) {
      let out = text;
      for (const [token, value] of tokens) out = out.replaceAll(token, value);
      return out;
    },
  };
}

function escapeLatex(text) {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function citationKeys(expr) {
  const keys = [];
  const parts = expr.split(",");
  for (const part of parts) {
    const range = part.trim().match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (range) {
      const a = Number(range[1]);
      const b = Number(range[2]);
      if (a === 0 || b === 0) return [];
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) keys.push(`ref${i}`);
    } else if (/^\d+$/.test(part.trim())) {
      if (Number(part.trim()) === 0) return [];
      keys.push(`ref${part.trim()}`);
    }
  }
  return keys;
}

function latexInline(input) {
  const store = tokenStore();
  let text = normalizeText(input);

  text = text.replace(/`([^`]+)`/g, (_, code) => store.put(`\\texttt{${escapeLatex(code)}}`));
  text = text.replace(/\[(\d+(?:\s*(?:,|-|–)\s*\d+)*)\]/g, (_, expr) => {
    const keys = citationKeys(expr);
    return keys.length ? store.put(`\\cite{${keys.join(",")}}`) : `[${expr}]`;
  });

  text = escapeLatex(text)
    .replace(/→/g, "$\\rightarrow$")
    .replace(/←/g, "$\\leftarrow$")
    .replace(/≥/g, "$\\geq$")
    .replace(/≤/g, "$\\leq$")
    .replace(/±/g, "$\\pm$")
    .replace(/≈/g, "$\\approx$")
    .replace(/–/g, "--")
    .replace(/—/g, "---");

  return store.restore(text);
}

function latexRuns(paragraph) {
  const children = paragraph.props.children || [];
  return children.map((run) => {
    const props = run.props || {};
    const txt = latexInline(rawTextFromRun(run));
    if (!txt) return "";
    if (props.bold && props.italics) return `\\textbf{\\emph{${txt}}}`;
    if (props.bold) return `\\textbf{${txt}}`;
    if (props.italics) return `\\emph{${txt}}`;
    return txt;
  }).join("");
}

function paragraphListType(paragraph) {
  const numbering = paragraph.props.numbering;
  if (!numbering) return null;
  return numbering.reference === "numbers" ? "enumerate" : "itemize";
}

function isHeading(paragraph) {
  return paragraph.props.heading === HeadingLevel.HEADING_1 ||
    paragraph.props.heading === HeadingLevel.HEADING_2 ||
    paragraph.props.heading === HeadingLevel.HEADING_3;
}

function headingCommand(paragraph) {
  if (paragraph.props.heading === HeadingLevel.HEADING_1) return "\\section";
  if (paragraph.props.heading === HeadingLevel.HEADING_2) return "\\subsection";
  return "\\subsubsection";
}

function tableToLatex(table) {
  const rows = (table.rows || []).map((row) => (row.children || []).map(rawTextFromCell));
  const cleanRows = rows.filter((row) => row.some((cell) => normalizeText(cell)));
  if (!cleanRows.length) return "";

  if (cleanRows.length === 1 && cleanRows[0].length === 1) {
    const lines = (table.rows[0].children[0].children || [])
      .map((p) => p instanceof Paragraph ? rawTextFromParagraph(p) : "")
      .filter(Boolean);
    return [
      "\\begin{lstlisting}[basicstyle=\\ttfamily\\scriptsize,breaklines=true]",
      ...lines,
      "\\end{lstlisting}",
    ].join("\n");
  }

  if (cleanRows.every((row) => row.length === 1)) {
    const title = latexInline(cleanRows[0][0]);
    const body = cleanRows.slice(1).map((row) => latexInline(row[0])).join("\n\n");
    return `\\begin{quote}\n\\textbf{${title}}\n\n${body}\n\\end{quote}`;
  }

  const cols = Math.max(...cleanRows.map((row) => row.length));
  const spec = Array(cols).fill("Y").join("|");
  const body = cleanRows.map((row, index) => {
    const cells = Array.from({ length: cols }, (_, i) => latexInline(row[i] || ""));
    const line = cells.join(" & ") + " \\\\";
    return index === 0 ? `\\textbf{${cells.join("} & \\textbf{")}} \\\\\n\\hline` : line;
  }).join("\n");

  return [
    "\\begin{table*}[htbp]",
    "\\centering",
    "\\scriptsize",
    `\\begin{tabularx}{\\textwidth}{|${spec}|}`,
    "\\hline",
    body,
    "\\hline",
    "\\end{tabularx}",
    "\\end{table*}",
  ].join("\n");
}

function convertDocument(doc, sourceName) {
  const children = doc.sections.flatMap((section) => section.children || []);
  const out = [`% ---- Contenido convertido desde ${sourceName} ----`];
  let started = false;
  let skipReferences = false;
  let openList = null;

  const closeList = () => {
    if (openList) {
      out.push(`\\end{${openList}}`);
      openList = null;
    }
  };

  for (const child of children) {
    if (child instanceof Paragraph) {
      const text = rawTextFromParagraph(child);
      if (!text) continue;
      if (!started && !isHeading(child)) continue;
      started = true;

      if (isHeading(child)) {
        closeList();
        if (/referencias|bibliograf/i.test(text)) {
          skipReferences = true;
          continue;
        }
        if (skipReferences) continue;
        out.push(`${headingCommand(child)}{${latexInline(text)}}`);
        continue;
      }
      if (skipReferences || /Fin del Cap/i.test(text)) continue;

      const listType = paragraphListType(child);
      if (listType) {
        if (openList !== listType) {
          closeList();
          out.push(`\\begin{${listType}}`);
          openList = listType;
        }
        out.push(`\\item ${latexRuns(child)}`);
        continue;
      }

      closeList();
      if (child.props.alignment === AlignmentType.CENTER && (child.props.children || []).some((run) => run.props && run.props.italics)) {
        out.push(`\\begin{center}\\emph{${latexRuns(child)}}\\end{center}`);
      } else {
        out.push(latexRuns(child));
      }
    } else if (child instanceof Table) {
      if (skipReferences) continue;
      closeList();
      const table = tableToLatex(child);
      if (table) out.push(table);
    }
  }
  closeList();
  return out.join("\n\n");
}

function extractBaseSection() {
  const base = fs.readFileSync(path.join(ROOT, "baseIEEE.tex"), "utf8");
  const start = base.indexOf("\\section{Marco teórico}");
  const endMarker = "\\hfill mds";
  const end = base.indexOf(endMarker, start);
  let body = base.slice(start, end > start ? end : undefined).trim();
  body = body.replace(/\\begin\{figure\}[\s\S]*?\\end\{figure\}/g, "% Figura removida: el archivo gráfico referenciado en baseIEEE.tex no existe en docs/jsdocs.");
  body = body.replace(/\\begin\{figure\*\}[\s\S]*?\\end\{figure\*\}/g, "% Figura removida: el archivo gráfico referenciado en baseIEEE.tex no existe en docs/jsdocs.");
  body = body.replace(/\[(\d+(?:\s*(?:,|-|–)\s*\d+)*)\]/g, (_, expr) => {
    const keys = citationKeys(expr);
    return keys.length ? `\\cite{${keys.join(",")}}` : `[${expr}]`;
  });
  return body;
}

function extractBibliography() {
  const base = fs.readFileSync(path.join(ROOT, "baseIEEE.tex"), "utf8");
  const match = base.match(/\\begin\{thebibliography\}\{1\}[\s\S]*?\\end\{thebibliography\}/);
  if (!match) throw new Error("No se encontró thebibliography en baseIEEE.tex");
  const anteproyectoRef = "\n\\bibitem[29]{ref29}\n" +
    "D. E. Sierra Guerrero y H. A. Alba Castro, ``Optimización Integral de Redes Kubernetes: Comparativa de CNIs, Automatización de NetworkPolicies y Reducción de Sobredimensionamientos,'' anteproyecto de trabajo de grado, Universidad Distrital Francisco José de Caldas, Facultad Tecnológica, Ingeniería Telemática, Bogotá, Colombia, 2025.";
  return match[0].replace("\\end{thebibliography}", `${anteproyectoRef}\n\\end{thebibliography}`);
}

function extractDesignExpansion() {
  const expansionPath = path.join(ROOT, "diseno_solucion_ampliacion.tex");
  return fs.existsSync(expansionPath) ? fs.readFileSync(expansionPath, "utf8").trim() : "";
}

function extractImplementationExpansion() {
  const expansionPath = path.join(ROOT, "implementacion_solucion_ampliacion.tex");
  return fs.existsSync(expansionPath) ? fs.readFileSync(expansionPath, "utf8").trim() : "";
}

function buildMaster() {
  const convertedDocs = SOURCES.map((file) => convertDocument(captureDoc(file), file));
  let design = convertedDocs[0];
  let futureWork = "";
  const futureMarker = "\n\n\\section{4. Trabajos Futuros}";
  const futureIndex = design.indexOf(futureMarker);
  if (futureIndex >= 0) {
    futureWork = design.slice(futureIndex).replace("\\section{4. Trabajos Futuros}", "\\section{6. Trabajos Futuros}");
    futureWork = futureWork.replace(/\\subsection\{4\./g, "\\subsection{6.");
    design = design.slice(0, futureIndex).trim();
  }
  const designExpansion = extractDesignExpansion();
  if (designExpansion) design = `${design}\n\n% ---- Ampliación académica del Diseño de la Solución ----\n\n${designExpansion}`;
  let implementation = convertedDocs[1];
  const implementationExpansion = extractImplementationExpansion();
  if (implementationExpansion) implementation = `${implementation}\n\n% ---- Ampliación académica de la Implementación de la Solución ----\n\n${implementationExpansion}`;
  const converted = [design, implementation, convertedDocs[2], futureWork].filter(Boolean).join("\n\n");
  const baseSection = extractBaseSection();
  const bibliography = extractBibliography();
  const generatedAt = new Date().toISOString().slice(0, 10);

  return `% Documento maestro generado desde baseIEEE.tex y los tres JS de docs/jsdocs.
% Fecha de generación: ${generatedAt}
\\documentclass[journal]{IEEEtran}

\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[spanish,es-tabla]{babel}
\\usepackage{url}
\\usepackage{cite}
\\usepackage{graphicx}
\\usepackage{array}
\\usepackage{booktabs}
\\usepackage{tabularx}
\\usepackage{listings}
\\usepackage{xcolor}

\\newcolumntype{Y}{>{\\raggedright\\arraybackslash}X}
\\lstset{
  basicstyle=\\ttfamily\\scriptsize,
  breaklines=true,
  columns=fullflexible,
  frame=single,
  backgroundcolor=\\color{gray!8}
}

\\title{Optimización Integral de Redes Kubernetes: Comparativa de CNIs, Automatización de NetworkPolicies y Reducción de Sobredimensionamientos}

\\author{Duwan~Estiven~Sierra~Guerrero y Holman~Audrey~Alba~Castro%
\\thanks{Códigos estudiantiles: 20231678001 y 20231678018. Director: Gerardo Alberto Castang Montiel. Universidad Distrital Francisco José de Caldas, Facultad Tecnológica. Grupo ORION: Telemática.}}

\\markboth{Tesis de Grado -- Ingeniería Telemática}{Sierra y Alba: Optimización Integral de Redes Kubernetes}

\\begin{document}
\\maketitle

\\begin{abstract}
Este documento maestro unifica la base IEEE, el marco teórico, el diseño de la solución, la implementación y la fase de pruebas y validación del proyecto de optimización integral de redes Kubernetes. El trabajo evalúa tecnologías CNI desde métricas telemáticas de rendimiento, seguridad, consumo de recursos y soporte operativo, integrando automatización GitOps, observabilidad y un modelo de recomendación multicriterio para reducir el sobredimensionamiento de infraestructura.
\\end{abstract}

\\begin{IEEEkeywords}
Kubernetes, CNI, eBPF, Open vSwitch, Network Policies, GitOps, QoS, MCDA, telemática.
\\end{IEEEkeywords}

${baseSection}

${converted}

${bibliography}

\\end{document}
`;
}

const output = path.join(ROOT, "tesis_maestra_ieee.tex");
fs.writeFileSync(output, buildMaster(), "utf8");
console.log(`Documento maestro generado: ${output}`);
