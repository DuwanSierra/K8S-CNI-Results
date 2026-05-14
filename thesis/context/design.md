---
name: design-context
type: context
---

# Diseño de la Solución

## Infraestructura (Red Underlay)

- **Proveedor**: DigitalOcean — elegido para eliminar ruido de hardware local y garantizar homogeneidad entre corridas.
- **Clúster**: K3s en Alta Disponibilidad — 1 nodos Master + 2 nodos Worker dedicados.
- **Red inter-nodo**: VPC privada para que la latencia medida dependa exclusivamente del CNI, no de saltos de red pública.

## CNIs evaluados (Red Overlay)

| CNI     | Plano de datos | Mecanismo |
|---------|---------------|-----------|
| Flannel | VXLAN (L2)    | Máxima simplicidad, sin Network Policies nativas |
| Calico  | BGP híbrido   | Ruteo nativo + políticas avanzadas L3/L4 |
| Cilium  | eBPF          | Reemplaza iptables; operación en kernel para mínimo overhead |
| Antrea  | OVS (SDN)     | Open vSwitch; conceptos SDN en el clúster |

## Métricas de QoS capturadas (OE1)

1. **Throughput**: bits por segundo efectivos (sender y receiver).
2. **Latencia de establecimiento**: TCP Connect — min/avg/max.
3. **Retransmisiones TCP**: proxy de congestión o fallos de encapsulamiento.
4. **Costo computacional**: CPU (millicores) y RAM (RSS) del agente CNI bajo estrés.

## Diseño de la inyección de tráfico

- `podAntiAffinity` fuerza que cliente y servidor iperf3 estén en nodos distintos → el tráfico siempre cruza el overlay.
- CronJobs lanzan ráfagas TCP de 300 s cada 30 min → muestras en diferentes momentos de carga.

## Modelo de recomendación MCDA (OE3)

Matriz de decisión multicriterio que pondera las métricas según el perfil de uso:

| Perfil           | Peso dominante |
|------------------|----------------|
| Fintech          | Seguridad (Network Policies L7) |
| Streaming / Edge | Throughput bajo jitter |
| IoT              | Bajo consumo de memoria del agente |

Pipeline de procesamiento (archivo `docs/procesador.js`):
1. **Limpieza IQR**: detecta y descarta outliers causados por ruido de la nube.
2. **Normalización min-max**: escala todas las métricas a [0, 1].
3. **Scoring MCDA**: aplica pesos según perfil → genera `cni-data.json`.

## Seguridad y micro-segmentación Zero Trust (OE2)

- **Default Deny**: políticas que bloquean todo tráfico ingress y egress por defecto.
- **Multi-tier**: reglas explícitas `frontend → backend → database` mediante label selectors.
- **GitOps enforcement**: ArgoCD con `selfHeal` restaura automáticamente cualquier política borrada manualmente, manteniendo la postura de seguridad declarativa.
