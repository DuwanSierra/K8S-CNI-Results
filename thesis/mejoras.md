# Plan de corrección de la tesis — alineación con la tabla de contenido y el anteproyecto

> Documento de trabajo. Recoge el diagnóstico del documento actual (`FormatoTesis.tex` +
> `chaptersApa/`), la nueva estructura propuesta y el plan de ejecución en LaTeX.
> Base: observaciones del director, tabla de contenido de referencia, anteproyecto y
> cronograma (Gantt v2). Todo se mantiene en LaTeX.

---

## 0. Estado (decisiones tomadas y avance)

**Decisiones confirmadas con el autor:**
- Sprints → **Resumen + tabla maestra** (Scrum + tabla 0–16 + retrospectivas por fase), no sprint por sprint.
- Alcance inmediato → **solo cambios seguros**; la reestructuración de capítulos espera visto bueno.

**Cambios seguros ya aplicados (compila: 103 págs, sin refs/citas indefinidas):**
- [x] Preámbulo (`FormatoTesis.tex`): `cleveref` (nombres en español) + `\counterwithin{equation}{chapter}`.
- [x] `13_Referencias.bib`: añadidas ref30 (Fishburn), ref31 (Hwang & Yoon), ref32 (Tukey), ref35 (Vafaei et al.).
- [x] Marco Teórico: ecuaciones MCDA numeradas (`eq:mcda-suma`, `eq:mcda-norm`) con citas SAW/WSM, min–max y justificación de la escala [1,5]; añadido párrafo de restricción no compensatoria.
- [x] Metodología: ecuaciones referenciadas con `\cref`; factor de penalización 0.40 formalizado como `eq:mcda-penalizacion` y justificado; filtro IQR con cita a las vallas de Tukey.
- [x] `4_Justificación.tex`: capítulo redactado (pertinencia telemática, impacto organizacional, aporte/entregables, viabilidad).

**Reestructuración completa aplicada (compila: 116 págs, sin refs indefinidas ni labels duplicados):**
- [x] Nuevo orden de capítulos (ver TOC): Fundamentación (1–4) → Marco Teórico + Estado del Arte (5–6) → Desarrollo Scrum (7–10) → Validación y cierre (11–15).
- [x] Cap. 7 dividido: el antiguo `7_Metodología` se separó en **8 Diseño de la Solución** (`M2_Diseno.tex`) y **9 La Herramienta: Implementación y Despliegue** (`M3_Herramienta.tex`), con encabezados promovidos un nivel. Archivo `7_Metodología.tex` eliminado (migrado).
- [x] Nuevo **7 Metodología del Proyecto** Scrum (`M1_Metodologia.tex`): marco Scrum, backlog→OE, tabla maestra de 17 sprints.
- [x] Nuevo **10 Fase de Desarrollo por Sprints** (`M4_Desarrollo_Sprints.tex`): resumen por fases temáticas + retrospectivas.
- [x] **La herramienta promovida al cuerpo** (cap. 9), ya no en apéndices.
- [x] Anexos: **A Manual de Usuario**, **B Manual de Instalación/Programador** (con comandos); los técnicos 14.0/14.1/14.2 pasan a Anexos C/D/E. Sección renombrada "Anexos".
- [x] Cap. 11 retitulado "Resultados y Verificación de Objetivos".

**Aligerado de redacción (Marco Teórico) — aplicado (compila: 115 págs, sin refs múltiples ni indefinidas):**
- [x] Maglev: reducido a una frase (balanceador L4 externo), conservando `ref5`.
- [x] eBPF: condensada la definición y eliminado el párrafo de mecánica interna (bytecode/JIT/verificador/copias de memoria); se conserva el "por qué importa" (iptables vs. tablas hash) y el uso por Cilium/Calico.
- [x] IPAM: subsección condensada (se quita el detalle host-local/base de datos que repetía "funciones núcleo").
- [x] Observabilidad/IPFIX: quitada la profundidad del estándar; reformulado para reforzar el hilo telemático (observabilidad de red ↔ QoS y decisiones de configuración).
- [x] Introducción: ya nombraba explícitamente la herramienta (testbed + SPA); sin cambios necesarios.

**Impacto organizacional cuantificado — aplicado (compila: 117 págs, sin refs múltiples ni indefinidas):**
- [x] Justificación: ya tenía sección "Impacto en las organizaciones" con los tres ejes (decisiones por datos, reducción de costos, seguridad verificable); sin cambios.
- [x] Resultados: nueva subsección "Implicaciones organizacionales" que eleva el dato de ahorro (9.6 vCPU y 24.8 GB RAM a 50 nodos), la seguridad sin penalización (4.35\% throughput) y la reproducibilidad.
- [x] Conclusiones: cierre escueto expandido con síntesis de impacto organizacional cuantificada, cerrando el hilo telemático (QoS, micro-segmentación, evidencia sobre el plano de datos).
- Cifras reutilizadas de las tablas existentes (respuestas a preguntas / cumplimiento OE); no se inventaron datos.

**Pendiente (opcional):** hilo telemático en los capítulos de desarrollo (M2--M4); revisar floats que el autor quiera mover. Decisión de sprints (punto 2) aún por confirmar con el director.

---

## 1. Diagnóstico (observación del director → hallazgo concreto)

| # | Observación del director | Hallazgo en el documento actual |
|---|--------------------------|--------------------------------|
| 1 | Estructura de capítulos y numeración (ítems, tablas, figuras) sin orden secuencial, dada a confusión | El cuerpo mezcla diseño + implementación en un solo capítulo gigante (`7_Metodología.tex`, 60+ subsecciones). Figuras y tablas dispersas: Marco (4 fig), Metodología (1 fig / 11 tablas), Resultados (3 fig / 13 tablas) y **el grueso en apéndices** (14.0: 5 fig + 4 tablas; OE2/OE3). Numeración correcta a nivel LaTeX, pero el **orden lógico de lectura** salta entre cuerpo y apéndices. |
| 2 | Ecuaciones de las métricas sin referencia; no se sabe de dónde salieron | `6_Marco_Teórico` define la suma ponderada `P_CNI = Σ(Vi·Wi)` y el min–max `Vi = 1 + 4·(x−xmin)/(xmax−xmin)` citando solo `ref34` de forma genérica. Sin referencia: el modelo de **suma ponderada (SAW/WSM)**, la **normalización min–max**, el **re-escalado a [1,5]**, el **factor IQR 1.5** y el **factor de penalización 0.40** (restricción no compensatoria). |
| 3 | Primera parte densa; el proyecto parece más complicado de lo que es | Planteamiento y Marco Teórico muy cargados; el Marco Teórico arrastra mucho detalle (Maglev, IPFIX, IPAM, eBPF interno) que abruma antes de presentar la herramienta. Falta una entrada que resalte **qué se construyó y para qué**. |
| 4 | Lo esencial (la herramienta) no puede quedar como algo secundario | **La herramienta, el modelo MCDA y el recomendador están en los apéndices** (14.0, 14.1, 14.2). El cuerpo describe el método pero el producto se relega a "Anexo Técnico". Hay que **promoverlo a un capítulo propio del cuerpo**. |
| 5 | Resaltar siempre el componente telemático y su impacto en las organizaciones | El componente telemático (QoS, observabilidad de red, micro-segmentación) está presente pero diluido; el **impacto organizacional** (reducción de sobredimensionamiento, costo, guía replicable) aparece de pasada, no como hilo conductor. |
| 6 | Acomodar los ajustes del anteproyecto: metodología por **sprints (Scrum)** | El anteproyecto declara **Scrum** como metodología y el Gantt v2 define **17 sprints (Sprint 0–16)**. El documento **no tiene** capítulo de metodología Scrum ni planificación/desarrollo por sprints. |
| 7 | Dejar anexos para la implementación: **manual de usuario** y **manual del programador/instalación** con los comandos | No existen como tales. La "Guía de Reproducción" (14.0) y la lista de verificación (14.2) son insumos, pero hay que reorganizarlos como **Anexo: Manual de Usuario** y **Anexo: Manual de Instalación/Programador**. |
| — | (adicional) | `4_Justificación.tex` está **vacío**: "Esta sección se completará en la siguiente fase". |

---

## 2. Estructura propuesta (nueva tabla de contenido)

Adaptada de la tabla de contenido de referencia y del anteproyecto, conservando el formato
de trabajo de grado de la Universidad Distrital. La idea rectora: **el cuerpo cuenta una
historia simple y resalta la herramienta**; el detalle reproducible vive en anexos.

```
PARTE I — Fundamentación (ligera, no densa)
  1. Introducción                         (aligerar; cerrar resaltando la herramienta)
  2. Planteamiento del Problema           (compactar)
  3. Justificación                        (REDACTAR: impacto telemático + organizacional)
  4. Objetivos (General + Específicos)

PARTE II — Marco de referencia
  5. Marco Teórico                        (aligerar; mover detalle profundo a anexo)
  6. Marco Referencial / Estado del Arte  (comparativos CNI, seguridad, MCDA)

PARTE III — Desarrollo (Scrum)            ← núcleo, resalta la herramienta
  7. Metodología del Proyecto
     7.1 Marco de trabajo Scrum (roles, ceremonias, por qué Scrum)
     7.2 Product Backlog y mapeo a objetivos (OE1–OE4)
     7.3 Sprint Planning (tabla maestra de sprints 0–16, fechas Gantt)
  8. Diseño de la Solución (arquitectura telemática por capas)
  9. La Herramienta: Implementación y Despliegue   ← PROMOVIDO desde apéndices
     9.1 Testbed automatizado (IaC + K3s HA + GitOps)
     9.2 Sistema de medición QoS y observabilidad (componente telemático)
     9.3 Motor de decisión MCDA
     9.4 Recomendador CNI (SPA) — el producto entregable
  10. Fase de Desarrollo por Sprints (resumen de sprints + retrospectivas)

PARTE IV — Validación y cierre
  11. Resultados y Verificación de Objetivos   (resaltar cumplimiento OE1–OE4)
  12. Discusión
  13. Conclusiones
  14. Recomendaciones
  15. Trabajo Futuro
  Referencias

ANEXOS
  A. Manual de Usuario (recomendador CNI: cómo interpretarlo y usarlo)
  B. Manual de Instalación / del Programador (comandos: Terraform, K3s, ArgoCD,
     CNIs, benchmarks, build de la SPA)
  C. Material de reproducción y matrices extendidas (TC-SEC, criterios, datos crudos)
```

### Mapeo capítulo actual → propuesto

| Actual | Propuesto |
|--------|-----------|
| 1 Introducción | 1 Introducción (aligerada) |
| 3 Planteamiento | 2 Planteamiento (compactado) |
| 4 Justificación (vacío) | 3 Justificación (redactar) |
| 5 Objetivos | 4 Objetivos |
| 6 Marco Teórico | 5 Marco Teórico (aligerado) |
| 2 Estado del Arte | 6 Marco Referencial / Estado del Arte |
| 7 Metodología (diseño+impl.) | 7 Metodología Scrum + 8 Diseño + 9 La Herramienta |
| 14.0/14.1/14.2 Apéndices (núcleo) | 9 La Herramienta (cuerpo) + Anexos A/B/C |
| 8 Resultados | 11 Resultados y Verificación de Objetivos |
| 9 Discusión | 12 Discusión |
| 10/11/12 Conclusiones/Recom./Futuro | 13/14/15 |
| (nuevo) | 10 Fase de Desarrollo por Sprints |

---

## 3. Sprints (del Gantt v2) — backbone de la metodología

Tabla maestra a incluir en §7.3. 17 sprints, 01/07/2025 – 19/02/2026.

| Sprint | Nombre | Fechas | Objetivo asociado |
|--------|--------|--------|-------------------|
| 0 | Kickoff, entorno y tablero | 01–10/07/2025 | Setup |
| 1 | Kit de laboratorio v0.1 | 11–24/07/2025 | OE1 |
| 2 | CNI #1 baseline | 25/07–07/08/2025 | OE1 |
| 3 | Biblioteca de NP v0.1 | 08–21/08/2025 | OE2 |
| 4 | CNI #2 baseline | 22/08–04/09/2025 | OE1 |
| 5 | Matriz de criterios v0.5 + checklist v0.1 | 05–18/09/2025 | OE3 |
| 6 | Validación automatizada de NP | 19/09–02/10/2025 | OE2 |
| 7 | CNI #3 baseline | 03–16/10/2025 | OE1 |
| 8 | Guía metodológica v0.6 | 17–30/10/2025 | OE3/OE4 |
| 9 | Observabilidad y alertas de red | 31/10–13/11/2025 | OE1/OE2 (telemático) |
| 10 | CNI #4 baseline o variante | 14–27/11/2025 | OE1 |
| 11 | Rightsizing v0.1 | 28/11–11/12/2025 | OE1 (sobredimensionamiento) |
| 12 | Biblioteca de NP v1.0 + snippets | 12–25/12/2025 | OE2 |
| 13 | Matriz v1.0 + checklist v1.0 | 26/12/2025–08/01/2026 | OE3 |
| 14 | Guía metodológica v1.0 + empaquetado | 09–22/01/2026 | OE4 |
| 15 | Integración final y reporte | 23/01–05/02/2026 | Integración |
| 16 | Pulido final y entrega v1.0 | 06–19/02/2026 | Cierre |

> Decisión a confirmar: cómo documentar los sprints (ver §7 de este plan).

---

## 4. Ecuaciones: referencias a añadir

Añadir a `13_Referencias.bib` y citar en el punto exacto donde aparece cada fórmula.

| Fórmula / decisión | Referencia a citar |
|--------------------|--------------------|
| Suma ponderada `P=Σ(Vi·Wi)` (SAW / Weighted Sum Model) | Fishburn (1967), *Additive utilities with incomplete product sets*; y/o Triantaphyllou (2000), *Multi-Criteria Decision Making Methods: A Comparative Study* |
| Normalización min–max para MCDA | Pavličić (2001) / Vafaei et al. (2016), *Normalization techniques for multi-criteria decision making*; o Jahan & Edwards (2015) |
| Re-escalado a `[1,5]` (escala de utilidad) | Justificar como escala Likert/utilidad acotada — citar Triantaphyllou; documentar que es elección de diseño, no arbitraria |
| Regla IQR `1.5×IQR` (Tukey fences) | Tukey (1977), *Exploratory Data Analysis* |
| Restricción no compensatoria (penalización 0.40) | Modelos conjuntivos/no compensatorios: Hwang & Yoon (1981), *Multiple Attribute Decision Making*; justificar el 0.40 como umbral de diseño (no compensación de seguridad por eficiencia) |

Acción LaTeX: numerar las ecuaciones con `\begin{equation}\label{eq:...}` y referenciarlas
con `\eqref{}` desde Metodología/Resultados (hoy van en `\[...\]` sin número).

---

## 5. Numeración y orden de figuras/tablas (LaTeX)

- Cargar `cleveref` (`\usepackage[spanish]{cleveref}`) y usar `\cref{}`/`\Cref{}` para
  referencias uniformes ("Figura 7.1", "Tabla 9.3") y evitar texto manual incoherente.
- Convención de `\label`: `fig:cap-tema`, `tab:cap-tema`, `eq:cap-tema` por capítulo.
- Numeración por capítulo: `\counterwithin{figure}{chapter}` y `\counterwithin{table}{chapter}`
  (y `equation`) para que el número refleje el capítulo y siga el orden de lectura.
- Reordenar floats para que aparezcan tras su primera mención; revisar `[htbp]`.
- Al promover el contenido de apéndices al cuerpo, reconstruir labels para que no queden
  referencias cruzadas rotas (verificar con `\ref` undefined en el log).

---

## 6. Redacción: aligerar y resaltar (componente telemático + impacto)

- **Introducción**: cerrar con un párrafo que nombre explícitamente **la herramienta**
  (recomendador CNI + testbed reproducible) como resultado central.
- **Marco Teórico**: recortar profundidad (mover detalle de Maglev/IPFIX/IPAM interno a
  Anexo C o nota al pie); dejar lo necesario para leer resultados.
- **Hilo conductor telemático**: en cada capítulo, una frase que conecte con QoS,
  observabilidad de red y micro-segmentación (Zero Trust) como aporte telemático.
- **Impacto organizacional**: en Justificación, Resultados y Conclusiones, cuantificar
  el beneficio: decisiones basadas en evidencia, reducción de sobredimensionamiento
  (CPU/RAM por unidad de throughput), guía replicable para equipos sin especialización.
- Verificar objetivos de forma visible: tabla de cumplimiento OE1–OE4 (ya existe en
  Resultados §452) y referenciarla desde Conclusiones.

---

## 7. Decisión pendiente (requiere confirmación del autor)

**¿Cómo documentar los 17 sprints?** Tres opciones:
- (A) **Resumen ejecutivo**: capítulo de metodología Scrum + tabla maestra de sprints +
  un párrafo de retrospectiva por agrupación temática. (Menos denso, recomendado.)
- (B) **Sprint por sprint** como la tabla de contenido de referencia (Sprint 1…16 con
  objetivos, tareas y retrospectiva cada uno). (Fiel al ejemplo, pero más extenso.)
- (C) **Híbrido**: desarrollo agrupado en fases (Laboratorio, Baselines CNI, Seguridad,
  MCDA, Herramienta, Observabilidad), cada fase con sus sprints y una retrospectiva.

---

## 8. Plan de ejecución (LaTeX, por fases)

1. **Preámbulo** (`FormatoTesis.tex`): `cleveref`, `counterwithin`, numeración de ecuaciones.
2. **Justificación**: redactar capítulo completo (telemático + impacto).
3. **Referencias de ecuaciones**: añadir entradas `.bib` y numerar/`\eqref` fórmulas.
4. **Reestructuración**: reordenar `\input` en `FormatoTesis.tex`; partir `7_Metodología`
   en Metodología (Scrum) + Diseño + La Herramienta; promover núcleo de apéndices.
5. **Anexos**: crear Manual de Usuario (A) y Manual de Instalación/Programador (B);
   reorganizar 14.x como Anexo C.
6. **Aligerar redacción** de Introducción y Marco Teórico; insertar hilo telemático.
7. **Compilar** (`latexmk`/`make`) y resolver refs rotas; revisar listas de figuras/tablas.

> Pendiente de confirmar la opción de §7 antes de ejecutar la fase 4.
</content>
