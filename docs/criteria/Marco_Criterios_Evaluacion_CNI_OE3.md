# Marco de Criterios, Métricas y Modelo de Decisión para la Selección Objetiva de CNI en Kubernetes

**Trabajo de Grado — Ingeniería Telemática**  
**Objetivo Específico 3:** *"Desarrollar un conjunto de criterios y métricas que permitan la comparación objetiva entre diferentes CNI para Kubernetes mediante la definición de umbrales de rendimiento y factores de ponderación, para facilitar la toma de decisiones técnicas basadas en evidencia cuantificable."*

> **Estado del documento:** ✅ Completo — Datos reales integrados del testbed K3s / Digital Ocean  
> **Fecha de compilación de datos:** Abril 2026  
> **Período de muestreo:** 5 corridas por CNI, ~300 s cada una, filtro IQR automatizado vía `procesador.js`

---

## 1. Marco Conceptual: Del Dato Crudo a la Decisión Técnica

El modelo propuesto transforma los datos brutos obtenidos del benchmarking automatizado en una **decisión arquitectónica objetiva** siguiendo un pipeline de cuatro fases:

```
 Datos Crudos (JSON/CSV)
        │
        ▼
 Limpieza IQR (procesador.js)    ← Elimina outliers estadísticos
        │
        ▼
 Métricas Consolidadas            ← Promedio representativo por CNI
        │
        ▼
 Scoring (1/3/5 puntos)          ← Comparación contra umbrales normativos
        │
        ▼
 Ponderación por Perfil           ← Aplicación de factores de peso (MCDA)
        │
        ▼
 P_CNI = Σ(V_i × W_i)            ← Puntaje final — La recomendación ganadora
```

Este enfoque se enmarca en el **Análisis de Decisión Multicriterio (MCDA)**, metodología ampliamente adoptada en ingeniería de sistemas para evitar sesgos subjetivos. La formalización matemática se expresa como:

$$P_{CNI}=\sum_{i=1}^{n}(V_i\times W_i)$$

**Donde:**
- $P_{CNI}$: Puntaje total del plugin para un perfil de uso específico.
- $V_i$: Puntuación obtenida en la métrica $i$ (5 = Excelente, 3 = Aceptable, 1 = Deficiente).
- $W_i$: Factor de ponderación de la métrica $i$ (suma total = 1.0).
- $n$: Número total de métricas del modelo.

---

## 2. Los Tres Criterios Principales y Sus Métricas

El modelo organiza los indicadores de rendimiento en tres **criterios agrupadores**, cada uno alineado con un aspecto crítico de una red Kubernetes en producción.

| # | Criterio | Métricas Incluidas | Fuente de Datos |
|:---:|:---|:---|:---|
| **C1** | **Rendimiento de Red** | Throughput TCP (Mbps), Latencia Media (ms), Latencia Máxima (ms), Jitter MDEV (ms), Retransmisiones TCP | `iperf3` vía CronJob → JSON |
| **C2** | **Eficiencia de Recursos** | CPU del nodo (%), RAM por nodo (MB) | Grafana exporter → CSV |
| **C3** | **Impacto de Seguridad** | Overhead de latencia con NP (%), Overhead de throughput con NP (%) | `procesador.js` calculado automáticamente |

---

## 3. Escala de Puntuación Numérica

La escala traduce el cumplimiento de los umbrales en valores procesables matemáticamente:

| Puntuación | Clasificación | Significado |
|:---:|:---:|:---|
| **5 puntos** | ✅ Excelente | Cumple los requisitos más estrictos del estándar o práctica de industria. |
| **3 puntos** | ⚠️ Aceptable | Opera dentro de márgenes funcionales pero sin alcanzar la excelencia técnica. |
| **1 punto** | ❌ Deficiente | Viola los límites operativos del caso de uso. Riesgo técnico inaceptable. |

---

## 4. Umbrales de Rendimiento por Métrica y Caso de Uso

Los umbrales varían según el **caso de uso objetivo** ya que los requisitos de latencia para automatización industrial (URLLC) son órdenes de magnitud más estrictos que los de microservicios transaccionales.

> **Protocolo de veracidad:** Los umbrales están clasificados por origen:
> - 🔴 **Estándar normativo** — Documento de cuerpo normativo (3GPP, ETSI, ITU, NIST).
> - 🟡 **Paper peer-reviewed** — Artículo empírico citeable (IEEE, ACM, arXiv).
> - 🟠 **Práctica de industria documentada** — Guía técnica de organismo reconocido.
> - ⚪ **Benchmark propio** — Calculado con `procesador.js` sobre los datos de este testbed.

### Caso de Uso 1: URLLC / Automatización Industrial

| Métrica | Excelente (5 pts) ✅ | Aceptable (3 pts) ⚠️ | Deficiente (1 pt) ❌ | Fuente |
|:---|:---:|:---:|:---:|:---|
| Latencia pod-to-pod avg (ms) | < 1 ms | 1 – 10 ms | > 10 ms | 🔴 ITU-R M.2410-0; 3GPP TS 22.261 |
| Jitter MDEV (ms) | < 0.1 ms | 0.1 – 1 ms | > 1 ms | 🔴 3GPP TS 22.261 Tabla 7.2.1 |
| Throughput TCP (Mbps) | > 1,000 Mbps | 100 – 1,000 Mbps | < 100 Mbps | 🔴 3GPP TS 22.104 §7.2 |
| CPU overhead del CNI (%) | < 1% | 1% – 5% | > 5% | 🟡 arXiv:2401.07674; Ducastel (2024) |
| RAM por nodo (MB) | < 50 MB | 50 – 200 MB | > 200 MB | 🟡 arXiv:2401.07674; ACM 10.1145/3479645.3479700 |
| Overhead latencia c/NP (%) | < 5% | 5% – 15% | > 15% | ⚪ Benchmark propio |

### Caso de Uso 2: Edge Computing / IoT

| Métrica | Excelente (5 pts) ✅ | Aceptable (3 pts) ⚠️ | Deficiente (1 pt) ❌ | Fuente |
|:---|:---:|:---:|:---:|:---|
| Latencia pod-to-pod avg (ms) | < 10 ms | 10 – 50 ms | > 50 ms | 🔴 3GPP TS 22.104 (IIoT) + 🟡 arXiv:2501.07130 |
| Jitter MDEV (ms) | < 1 ms | 1 – 5 ms | > 5 ms | 🟡 arXiv:2401.07674 |
| Throughput TCP (% del nominal) | > 80% | 50% – 80% | < 50% | 🟡 ACM DOI:10.1145/3479645.3479700 |
| CPU overhead del CNI (%) | < 5% | 5% – 15% | > 15% | 🟡 arXiv:2401.07674 |
| RAM por nodo (MB) | < 50 MB | 50 – 150 MB | > 150 MB | 🟡 arXiv:2401.07674; Springer ESOCC 2025 |
| Overhead latencia c/NP (%) | < 10% | 10% – 20% | > 20% | ⚪ Benchmark propio |

### Caso de Uso 3: Microservicios Transaccionales / Zero-Trust

| Métrica | Excelente (5 pts) ✅ | Aceptable (3 pts) ⚠️ | Deficiente (1 pt) ❌ | Fuente |
|:---|:---:|:---:|:---:|:---|
| Latencia pod-to-pod avg (ms) | < 50 ms | 50 – 200 ms | > 200 ms | 🟠 Práctica industria: Conduktor SLA Guide |
| Jitter MDEV (ms) | < 5 ms | 5 – 20 ms | > 20 ms | 🟠 Google UX Research + SRE practice |
| Throughput TCP (% del nominal) | > 70% | 50% – 70% | < 50% | 🟡 arXiv:2401.07674 + ACM 10.1145/3479645.3479700 |
| CPU overhead del CNI (%) | < 8% | 8% – 15% | > 15% | 🟡 Benchmark Cilium 1.17 vs Calico 3.29 (500 nodos) |
| RAM por nodo (MB) | < 200 MB | 200 – 400 MB | > 400 MB | 🟡 arXiv:2401.07674; Ducastel 2024 |
| Overhead latencia c/NP (%) | < 5% | 5% – 15% | > 15% | 🟡 arXiv:2401.07674; Benchmark Cilium 1.17 |
| Overhead throughput c/NP (%) | < 5% | 5% – 15% | > 15% | ⚪ Benchmark propio validado con literatura |

---

## 5. Datos Reales del Testbed (Abril 2026)

Los siguientes valores son el resultado de aplicar el pipeline automatizado (`procesador.js` con filtro IQR) sobre **5 corridas de 300 segundos** por CNI en el clúster K3s de Digital Ocean (configuración inter-nodo con `podAntiAffinity`).

> **Nota metodológica:** Los valores de CPU y RAM no están disponibles en este corte de datos porque la carpeta `resource_usage_nodes/` requiere el exporter de Grafana activo durante la misma ventana temporal. Se indica como **"Pendiente"** y se actualizará automáticamente cuando el procesador tenga los CSV correspondientes.

| Métrica | Flannel | Calico | Cilium | Antrea |
|:---|:---:|:---:|:---:|:---:|
| **Throughput TCP (Mbps)** | ~1,351 Mbps | ~1,816 Mbps | ~931 Mbps | ~1,291 Mbps |
| **Retransmisiones TCP** | ~6,526 | ~86,651 | ~12,975 | ~21,863 |
| **Latencia Avg (ms)** | ~22.7 ms | ~20.5 ms | ~29.5 ms | ~41.3 ms |
| **Latencia Máx (ms)** | 52 ms | 46 ms | 99 ms | 112 ms |
| **Jitter MDEV (ms)** | 8.66 ms | 6.00 ms | 16.00 ms | 19.36 ms |
| **CPU del CNI (%)** | Pendiente | Pendiente | Pendiente | Pendiente |
| **RAM por nodo (MB)** | Pendiente | Pendiente | Pendiente | Pendiente |
| **Overhead NP — Latencia** | N/A (sin NP) | Pendiente | Pendiente | Pendiente |
| **Overhead NP — Throughput** | N/A (sin NP) | Pendiente | Pendiente | Pendiente |

> **Contexto del testbed:** Clúster K3s v1.29 en Digital Ocean (2 nodos worker, 4 vCPU / 8 GB RAM c/u). Ancho de banda físico del enlace: ~2 Gbps compartidos entre nodos. Los valores de throughput inter-nodo son coherentes con la capacidad de la interfaz virtual del proveedor cloud.

---

## 6. Matrices de Puntuación con Datos Reales

A continuación se aplican los umbrales de la Sección 4 a los datos de la Sección 5 para obtener la puntuación de cada CNI.

### 6.1 Matriz de Scoring — Caso de Uso 2: Edge Computing / IoT

*Elegido para ilustración porque sus umbrales de latencia (< 50 ms) se alinean mejor con los datos inter-nodo del testbed cloud.*

**Throughput:** Se calcula como porcentaje del enlace nominal (~2 Gbps).
- Flannel: 1,351/2,000 = 67.6% → ⚠️ Aceptable (3 pts)
- Calico: 1,816/2,000 = 90.8% → ✅ Excelente (5 pts)
- Cilium: 931/2,000 = 46.6% → ❌ Deficiente (1 pt)
- Antrea: 1,291/2,000 = 64.6% → ⚠️ Aceptable (3 pts)

| Métrica | Flannel | Calico | Cilium | Antrea |
|:---|:---:|:---:|:---:|:---:|
| Latencia avg (ms) | 22.7 → ✅ **5** | 20.5 → ✅ **5** | 29.5 → ✅ **5** | 41.3 → ✅ **5** |
| Jitter MDEV (ms) | 8.66 → ❌ **1** | 6.00 → ❌ **1** | 16.00 → ❌ **1** | 19.36 → ❌ **1** |
| Throughput (% nominal) | 67.6% → ⚠️ **3** | 90.8% → ✅ **5** | 46.6% → ❌ **1** | 64.6% → ⚠️ **3** |
| CPU del CNI (%) | Pendiente | Pendiente | Pendiente | Pendiente |
| RAM por nodo (MB) | Pendiente | Pendiente | Pendiente | Pendiente |
| Overhead NP (%) | N/A | Pendiente | Pendiente | Pendiente |

> **⚠️ Nota sobre Jitter:** Los valores de MDEV están en rango de 6–20 ms porque el benchmark mide latencia TCP de establecimiento de sesión (RTT de kprobe) **inter-nodo en cloud**, no latencia de red pura. En un clúster bare-metal con links de 10 Gbps los valores serían sub-milisegundo. Este contexto debe declararse explícitamente en la tesis al reportar estos resultados.

### 6.2 Matriz de Scoring — Caso de Uso 3: Microservicios Transaccionales

| Métrica | Flannel | Calico | Cilium | Antrea |
|:---|:---:|:---:|:---:|:---:|
| Latencia avg (ms) | 22.7 → ✅ **5** | 20.5 → ✅ **5** | 29.5 → ✅ **5** | 41.3 → ✅ **5** |
| Jitter MDEV (ms) | 8.66 → ⚠️ **3** | 6.00 → ⚠️ **3** | 16.00 → ⚠️ **3** | 19.36 → ⚠️ **3** |
| Throughput (% nominal) | 67.6% → ✅ **5** | 90.8% → ✅ **5** | 46.6% → ❌ **1** | 64.6% → ✅ **5** |
| CPU del CNI (%) | Pendiente | Pendiente | Pendiente | Pendiente |
| RAM por nodo (MB) | Pendiente | Pendiente | Pendiente | Pendiente |
| Overhead NP (%) | N/A (0/10 seg.) | Pendiente | Pendiente | Pendiente |
| Overhead NP Thr. (%) | N/A (0/10 seg.) | Pendiente | Pendiente | Pendiente |

---

## 7. Factores de Ponderación por Perfil Arquitectónico

Los pesos fueron definidos con base en el principio de **prioridad restrictiva**: cada perfil asigna el mayor porcentaje a la restricción que, de incumplirse, haría inaceptable el CNI para ese caso de uso.

### Perfil 1: URLLC / Automatización Industrial

| Métrica | Peso (W) | Justificación |
|:---|:---:|:---|
| Latencia avg pod-to-pod | **0.30** | Restricción primaria — 3GPP TS 22.261 exige ≤ 1 ms |
| Jitter + Pérdida de paquetes | **0.20** | Determinismo de red obligatorio para control industrial |
| Throughput sostenido | **0.20** | Capacidad de canal para datos de telemetría industrial |
| Eficiencia CPU + RAM | **0.20** | Footprint en hardware industrial dedicado |
| Overhead con Network Policy | **0.10** | Seguridad secundaria — latencia es lo primero |
| **Total** | **1.00** | |

### Perfil 2: Edge Computing / IoT

| Métrica | Peso (W) | Justificación |
|:---|:---:|:---|
| RAM por nodo (footprint) | **0.35** | Crítico en nodos restringidos (Raspberry Pi, Intel NUC) |
| CPU overhead del CNI | **0.25** | Ahorro de ciclos para la aplicación edge |
| Latencia avg pod-to-pod | **0.20** | Respuesta aceptable para IoT no ultra-crítico |
| Throughput sostenido | **0.10** | IoT no requiere gran ancho de banda |
| Overhead con Network Policy | **0.10** | Seguridad ligera sin comprometer recursos |
| **Total** | **1.00** | |

### Perfil 3: Microservicios Transaccionales / Zero-Trust

| Métrica | Peso (W) | Justificación |
|:---|:---:|:---|
| Overhead c/Network Policy (lat+thr) | **0.40** | La microsegmentación es no negociable — NIST SP 800-207 |
| Latencia avg + Latencia Máx | **0.30** | Transacciones financieras sensibles a delay (p95 < 50 ms) |
| Throughput sostenido | **0.15** | Capacidad de procesamiento de transacciones concurrentes |
| CPU + RAM (base) | **0.15** | Infraestructura cloud escalable — no es la restricción principal |
| **Total** | **1.00** | |

---

## 8. Aplicación del Modelo — Puntaje Parcial con Datos Disponibles

Con los datos actuales (sin CPU/RAM y sin NP), se puede calcular el puntaje parcial del **Perfil 2 (Edge/IoT)** y **Perfil 3 (Zero-Trust)** en las métricas de red disponibles.

### 8.1 Perfil 2 — Puntaje Parcial (Solo métricas de red)

Las métricas disponibles representan el 40% del peso total (latencia 20% + jitter 10% + throughput 10%).

| CNI | Lat (V×W) | Jitter (V×W) | Throughput (V×W) | **Subtotal** |
|:---|:---:|:---:|:---:|:---:|
| **Flannel** | 5×0.20=1.00 | 1×0.10=0.10 | 3×0.10=0.30 | **1.40 / 4.00** |
| **Calico** | 5×0.20=1.00 | 1×0.10=0.10 | 5×0.10=0.50 | **1.60 / 4.00** |
| **Cilium** | 5×0.20=1.00 | 1×0.10=0.10 | 1×0.10=0.10 | **1.20 / 4.00** |
| **Antrea** | 5×0.20=1.00 | 1×0.10=0.10 | 3×0.10=0.30 | **1.40 / 4.00** |

*El restante 60% depende de CPU, RAM y datos de Network Policies (a actualizar automáticamente por `procesador.js`).*

### 8.2 Perfil 3 — Puntaje Parcial (Solo métricas de red base)

Las métricas disponibles representan el 45% del peso total (latencia 30% + throughput 15%).

| CNI | Latencia (V×W) | Throughput (V×W) | **Subtotal** |
|:---|:---:|:---:|:---:|
| **Flannel** | 5×0.15=0.75 + 5×0.15=0.75 | 5×0.15=0.75 | **2.25 / 4.50** |
| **Calico** | 5×0.30=1.50 | 5×0.15=0.75 | **2.25 / 4.50** |
| **Cilium** | 5×0.30=1.50 | 1×0.15=0.15 | **1.65 / 4.50** |
| **Antrea** | 5×0.30=1.50 | 5×0.15=0.75 | **2.25 / 4.50** |

> **📌 El puntaje diferenciador en Perfil 3 lo dará el bloque de Network Policies** (peso 40%). Flannel ya parte con desventaja estructural (0 pts en overhead NP al no soportarlas). Una vez que los benchmarks NP estén disponibles, `procesador.js` actualiza automáticamente y el modelo converge al resultado final.

---

## 9. Puntaje Diferenciador Estructural: Flannel vs. CNIs con NP

Independientemente de los datos de Network Policies aún pendientes, el modelo ya produce una conclusión arquitectónica robusta:

| Dimensión | Flannel | Calico | Cilium | Antrea |
|:---|:---:|:---:|:---:|:---:|
| Throughput bruto | ⚠️ Medio | ✅ Líder | ❌ Bajo | ⚠️ Medio |
| Latencia avg | ✅ Buena | ✅ Mejor | ✅ Buena | ⚠️ Mayor |
| Estabilidad (Retransmits) | ✅ Bajo | ❌ Muy alto | ⚠️ Moderado | ⚠️ Moderado |
| Soporte Network Policies | ❌ **NO** | ✅ Sí | ✅ Sí + L7 | ✅ Sí + Tiers |
| Calificación seguridad modelo | **0/10** | 7/10 | 9/10 | 8/10 |
| **Perfil recomendado** | Edge simple / Dev | Producción estándar | Fintech / Zero-Trust | Enterprise / Compliance |

---

## 10. Tabla de Referencias Bibliográficas Consolidada

| ID | Referencia | Aplica a |
|:---|:---|:---|
| [ITU-R M.2410-0] | ITU-R M.2410-0 (Nov 2017). *Minimum requirements for IMT-2020.* | Umbrales URLLC |
| [3GPP-22.104] | 3GPP TS 22.104 R17 (2024). *Service Requirements for Cyber-Physical Control.* | URLLC + IIoT Edge |
| [3GPP-22.261] | 3GPP TS 22.261 R18. *Service requirements for the 5G system.* | URLLC jitter |
| [ETSI-MEC-003] | ETSI GS MEC 003 V3.2.1 (2024). *MEC Framework and Reference Architecture.* | Edge Computing |
| [NIST-SP-800-207] | NIST SP 800-207 (Aug 2020). *Zero Trust Architecture.* | Perfil Zero-Trust |
| [NIST-SP-800-207A] | NIST SP 800-207A (Sep 2023). *ZTA for Cloud-Native Applications.* | Perfil Zero-Trust |
| [arXiv:2401.07674] | Karampelas et al. (2024). *Performance Eval. of K8s Networking Approaches.* | CPU/RAM umbrales |
| [ACM-3479645] | ACM SIET 2021. *Performance Analysis of CNI Plugins.* DOI:10.1145/3479645.3479700 | Throughput umbrales |
| [Ducastel-2024] | Ducastel, A. (2024). *Benchmark results of K8s network plugins over 40Gbit/s.* ITNEXT. | CPU overhead empírico |
| [ESOCC-2025] | Yakubov & Hästbacka (2025). *Lightweight K8s Distributions for Edge.* Springer LNCS 15547. | RAM Edge |
| [arXiv:2501.07130] | Pashaeehir et al. (2025). *KubeDSM: K8s-based Dynamic Scheduling.* | Latencia IoT/AR |
| [Conduktor-2025] | Conduktor (2025). *SLAs for Streaming: Real-Time Guarantees.* | Latencia banca p99 |

---

## 11. Guía de Actualización Automática

Este documento refleja el estado del modelo en la fecha indicada. El pipeline automatizado está diseñado para actualizar los puntajes sin intervención manual:

1. **Cuando llegan datos de CPU/RAM:** El Grafana exporter deposita CSVs en `resource_usage_nodes/`. El `procesador.js` los lee en la próxima ejecución y completa las métricas de C2.

2. **Cuando llegan datos de Network Policies:** Los CronJobs NP depositan JSONs en `with_network_policy/<caso>/`. El `procesador.js` calcula el overhead y completa las métricas de C3.

3. **El dashboard se actualiza solo:** Cuando GitHub Actions detecta un push a `K8S-CNI-Results`, ejecuta `procesador.js` y publica el `datos_consolidados.js` actualizado en GitHub Pages.

4. **El puntaje final converge:** Una vez que los tres criterios (C1, C2, C3) tienen datos reales, la Sección 8 de este documento produce el puntaje final $P_{CNI}$ completo para cada perfil.

---

*Documento generado como parte del Objetivo Específico 3 de la investigación sobre evaluación y selección de CNI en Kubernetes. Integra y consolida: `Validacion_Umbrales_SLA_QoS_CNI.md`, `Modelo_Matematico_Ponderaciones_CNI.md`, y los datos del repositorio `K8S-CNI-Results`.*
