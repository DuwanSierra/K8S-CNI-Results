---
name: thesis-identity
type: context
---

# Tesis: Identidad y Estructura

## Datos académicos

- **Título**: Evaluación y comparación de plugins CNI para Kubernetes: un enfoque orientado a QoS, seguridad y eficiencia de recursos en entornos de microservicios
- **Autores**: Holman Alba, Duwan Sierra
- **Nivel**: Pregrado en Ingeniería Telemática
- **Formato**: IEEE (two-column, ~100–120 páginas)
- **Repositorio de resultados**: `https://github.com/DuwanSierra/K8S-CNI-Results`
- **Repositorio de infraestructura**: `https://github.com/DuwanSierra/K8s-bootstrap`
- **Repositorio de aplicaciones**: `https://github.com/DuwanSierra/K8s-Tesis-Apps`

## Problema que resuelve

Kubernetes no impone un plugin de red: los equipos eligen un CNI sin métricas comparativas objetivas, lo que lleva a sobredimensionamiento de infraestructura (CPU/RAM) y posturas de seguridad incompletas. Este trabajo genera evidencia empírica para guiar esa decisión.

## Objetivos específicos

| ID  | Descripción |
|-----|-------------|
| OE1 | Medir y comparar el rendimiento de red (throughput, latencia, retransmisiones) de cuatro CNIs bajo carga real inter-nodo |
| OE2 | Evaluar el soporte y overhead de Network Policies (micro-segmentación Zero Trust) en cada CNI |
| OE3 | Construir un modelo MCDA que recomiende el CNI óptimo según el perfil de uso |
| OE4 | Implementar un prototipo de aplicación web (SPA) que exponga las recomendaciones a partir de los datos recolectados |

## Estado de avance

| OE  | Estado |
|-----|--------|
| OE1 | 100% — datos recolectados y procesados |
| OE2 | 70% — plan diseñado, ejecución en curso |
| OE3 | 100% — algoritmo formalizado |
| OE4 | 100% — SPA funcional |

## Estructura del documento (páginas objetivo)

1. Marco teórico (~15 págs)
2. Diseño de la solución (~20–25 págs)
3. Implementación de la solución (~20–25 págs)
4. Pruebas y validación (~20–25 págs)
5. Resultados y discusión (~20–25 págs)
6. Conclusiones y trabajos futuros (~10–15 págs)

## Aporte telemático central

Proveer un framework reproducible —con infraestructura como código, benchmarks automatizados y modelo de decisión— para que ingenieros evalúen CNIs sin depender del marketing de proveedores, cuantificando el costo real de CPU/RAM por unidad de throughput.
