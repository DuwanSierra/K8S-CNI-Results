---
name: testing-context
type: context
---

# Pruebas y Validación

## Condiciones de control

- Mismo tipo de instancia DigitalOcean para todos los CNIs → hardware homogéneo.
- Misma versión de K3s en todas las corridas.
- Despliegue secuencial de CNIs con entorno limpio entre cada uno.
- **5 corridas** por tipo de prueba para obtener promedios confiables.

## OE1 — Benchmarks de rendimiento

**Throughput**
- Herramienta: `iperf3 -J` (output JSON)
- Duración: 300 s de tráfico TCP sostenido por corrida
- Métricas: bits/s en sender y receiver, retransmisiones TCP

**Latencia**
- Herramienta: script custom (Python/Bash) midiendo TCP Connect
- 30 muestras por corrida → RTT min/avg/max
- Garantía inter-nodo: `podAntiAffinity` fuerza cliente y servidor en nodos distintos

## OE2 — Validación de seguridad (Network Policies)

| Caso de prueba | Verificación |
|---------------|-------------|
| Default Deny  | Bloqueo total de ingress y egress con política activa |
| Multi-tier    | Tráfico no autorizado descartado entre frontend, backend y DB |
| Overhead de seguridad | iperf3 ejecutado **con** Network Policies activas → delta de latencia vs. baseline |

## OE3 — Validación del modelo estadístico

**Limpieza IQR**: `procesador.js` identifica outliers (congestión temporal de DigitalOcean) y los descarta antes de calcular métricas finales.

**Normalización min-max**: convierte métricas heterogéneas (ms, Mbps, MB) a escala [0, 1] para comparación objetiva.

**Verificación de integridad**: todas las corridas son orquestadas por CronJobs (no manuales), garantizando repetibilidad.

## OE4 — Validación del prototipo (SPA)

- **Prueba de perfil**: al seleccionar un perfil (ej. "Seguridad Alta"), la SPA pondera correctamente los resultados de OE2 y recomienda el CNI líder en esa dimensión.
- **Integridad de datos**: los valores mostrados en el frontend coinciden bit-a-bit con `cni-data.json` generado por `procesador.js`.
