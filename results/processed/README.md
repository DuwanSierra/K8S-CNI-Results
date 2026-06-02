# Datos Procesados — Fuente de Verdad de la Tesis

> **Regenerar con:** `node docs/generate_thesis_data.js`  
> **Generado:** 2026-06-02T03:56:17.956Z

Este directorio contiene los datos **ya procesados y verificados** que debe usar cualquier IA o persona al redactar la tesis. NO usar los datos de `results/cni-benchmarks/` directamente (son datos crudos por corrida).

## Archivo principal: `thesis_data.json`

### Datos brutos (promediados con IQR, escala real)

| Métrica | Flannel | Calico | Cilium | Antrea | Mejor |
|---|---|---|---|---|---|
| Latencia avg (ms) ↓ | 21.53 | **12.54** | 18.73 | 35.09 | Calico |
| Latencia max (ms) ↓ | 50.8 | **44.2** | 47 | 83.5 | Calico |
| Jitter MDEV (ms) ↓ | 7.76 | **7.31** | 8.47 | 17.25 | Calico |
| Throughput (Mbps) ↑ | 1452.97 | **1804.4** | 843.56 | 1588.45 | Calico |
| Retransmisiones ↓ | **11774** | 68993 | 15142 | 42229 | Flannel |
| CPU (% nodo) ↓ | **19.45** | 29.05 | 25.79 | 27.75 | Flannel |
| RAM (MB) ↓ | **1176.54** | 1672.83 | 1497.19 | 1429.95 | Flannel |

### Scores base del Recommender (escala 1–5)

| Criterio | Flannel | Calico | Cilium | Antrea |
|---|---|---|---|---|
| Latencia (velocidad respuesta) | 3.41 | **5** | 3.9 | 1 |
| Jitter+Retransmisiones | 4.91 | 3 | 4.64 | **1.94** |
| Throughput (cantidad datos) | 3.54 | **5** | 1 | 4.1 |
| Eficiencia CPU+RAM | **5** | 1 | 2.39 | 2.25 |
| Network Policy / seguridad | 1† | 1 | **5** | 1.89 |

†Flannel recibe 1 (mínimo fijo) porque **no soporta NetworkPolicies** nativas.

### Resultados MCDA por perfil de la tesis

| Perfil | Flannel | Calico | Cilium | Antrea | **Ganador** |
|---|---|---|---|---|---|
| Fintech / Seguridad crítica | 1.34* | 3.058 | **3.668** | 2.103 | **Cilium** |
| Streaming / Alto rendimiento | **3.686** | 3.567 | 3.294 | 2.256 | **Flannel** |
| IoT / Recursos limitados | **3.976** | 2.8 | 3.123 | 2.234 | **Flannel** |

*Penalizado ×0.4 por no soportar NetworkPolicies (securityNeed ≥ 4).

### Perfiles de referencia

| Escenario | Ganador | Puntaje |
|---|---|---|
| Todo mínimo (1,1,1,1,1) | **flannel** | 3.553 |
| Todo máximo (5,5,5,5,5) | **cilium** | 3.411 |
| Latencia+Datos altos, resto medio | **flannel** | 3.577 |

## ⚠️ Reglas para IAs que lean este documento

1. **Nunca inventar números** — todos los datos están en `thesis_data.json`.
2. La escala de scores es **1-5** (NO 0-1 como la tesis anterior decía).
3. Flannel **no soporta NetworkPolicies** — siempre score 1 en seguridad.
4. Calico es el mejor en **latencia y throughput**.
5. Flannel es el mejor en **CPU, RAM y retransmisiones**.
6. Cilium es el único con **NetworkPolicies L7** (score 5 en seguridad).
7. **Antrea tiene el peor jitter** (latencia_ms = 35.09 ms).
8. Los pesos del perfil **dependen de los sliders del usuario** — cambiar un slider cambia el ganador.
