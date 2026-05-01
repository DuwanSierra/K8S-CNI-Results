# Modelo Matemático y Ponderaciones para la Selección de CNI en Kubernetes

**Trabajo de Grado — Ingeniería Telemática** **Fase:** Definición de la matriz de decisión multicriterio (MCDA).

Este documento complementa la *Validación de Umbrales SLA/QoS*, estableciendo el motor lógico y matemático que permite transformar los datos crudos obtenidos en laboratorio en decisiones arquitectónicas objetivas, dando cumplimiento total al objetivo específico de la investigación.

---

## 1. Escala de Puntuación Numérica (Scoring Scale)

Para cuantificar el rendimiento de cada CNI frente a los umbrales normativos establecidos, se adopta una escala discreta de tres niveles. Esta escala traduce el cumplimiento de los SLA en valores procesables matemáticamente:

* **5 Puntos (Excelente ✅):** El CNI cumple con los requisitos más estrictos del estándar o práctica de industria. Ideal para entornos críticos.
* **3 Puntos (Aceptable ⚠️):** El CNI opera dentro de márgenes funcionales, pero no alcanza la excelencia técnica exigida por el percentil 99 de la industria. Puede requerir compensación en diseño.
* **1 Punto (Deficiente ❌):** El CNI viola los límites operativos del caso de uso. Representa un riesgo técnico inaceptable para el perfil evaluado.

---

## 2. Factores de Ponderación por Perfil Arquitectónico (Weighting Factors)

Dado que no existe un "CNI perfecto" universal, el modelo distribuye el 100% de la decisión en factores de peso ($W_i$) según las restricciones críticas de cada perfil.

### Perfil 1: URLLC y Automatización Industrial
**Prioridad:** Determinismo de red y latencia ultra baja.
* **30%** - Latencia pod-to-pod p99
* **20%** - Jitter y Pérdida de paquetes
* **20%** - Throughput sostenido
* **20%** - Eficiencia de recursos (CPU/RAM base)
* **10%** - Overhead de latencia con Network Policy (La seguridad profunda es secundaria frente al tiempo real).

### Perfil 2: Edge Computing / IoT (Computing Continuum)
**Prioridad:** Mínimo consumo de recursos (Footprint) en nodos restringidos.
* **35%** - Overhead de RAM por nodo (Crítico en dispositivos edge)
* **25%** - Overhead de CPU del CNI
* **20%** - Latencia pod-to-pod p99
* **10%** - Throughput sostenido
* **10%** - Overhead de Network Policy

### Perfil 3: Microservicios Transaccionales (Banca / Zero-Trust)
**Prioridad:** Seguridad profunda (Microsegmentación) sin ahogar la transacción.
* **40%** - Desempeño bajo Network Policies (Promedio de overhead de CPU, Latencia y Throughput con reglas activas)
* **30%** - Latencia E2E / p95 para APIs
* **15%** - Disponibilidad y Throughput sostenido
* **15%** - Overhead de RAM/CPU base (No es crítico al asumir infraestructura Cloud escalable)

---

## 3. Ecuación General del Modelo de Decisión

El prototipo funcional de este trabajo de grado utiliza un modelo de sumatoria ponderada clásica del Análisis de Decisión Multicriterio (MCDA). La recomendación final del CNI para un contexto específico se calcula aplicando la siguiente ecuación:

$$P_{CNI}=\sum_{i=1}^{n}(V_i\times W_i)$$

**Donde:**
* $P_{CNI}$ es el puntaje total consolidado del plugin CNI evaluado para un perfil específico. (El CNI con el $P_{CNI}$ más alto es la recomendación técnica ganadora).
* $V_i$ es el valor de puntuación obtenido en la métrica $i$ (es decir, $5$, $3$ o $1$, según los umbrales definidos en la validación de SLA).
* $W_i$ es el factor de ponderación asignado a la métrica $i$ en el perfil seleccionado (expresado en formato decimal, por ejemplo, $0.30$ para un peso del 30%).
* $n$ es el número total de métricas evaluadas en el modelo.

Esta formalización matemática garantiza que la selección tecnológica abandone el sesgo de la intuición o la popularidad del mercado, proporcionando a las organizaciones una toma de decisión basada estrictamente en evidencia cuantificable y alineada a sus necesidades operativas.