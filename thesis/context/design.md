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

| CNI     | Plano de datos | Mecanismo | Versión desplegada |
|---------|---------------|-----------|-------------------|
| Flannel | VXLAN (L2)    | Máxima simplicidad, sin Network Policies nativas | nativo K3s (canal stable) |
| Calico  | VXLAN (cloud) | Tigera Operator; políticas avanzadas L3/L4. BGP disponible en bare-metal; en DigitalOcean VPC se usa encapsulamiento VXLAN (`encapsulation: VXLAN`) | v3.29.1 |
| Cilium  | eBPF + VXLAN tunnel | Reemplaza iptables vía eBPF; routing en modo tunnel VXLAN (`routingMode=tunnel`, `tunnelProtocol=vxlan`); añade filtrado L7 HTTP nativo sin service mesh | 1.16.5 |
| Antrea  | OVS (SDN)     | Open vSwitch con sistema jerárquico de Tiers (Emergency > SecurityOps > NetworkOps > Platform > Application) que permite políticas corporativas de mayor prioridad que las NetworkPolicies estándar | v2.2.0 |

## Métricas de QoS capturadas (OE1)

1. **Throughput**: bits por segundo efectivos (sender y receiver).
2. **Latencia de establecimiento**: TCP Connect — min/avg/max.
3. **Retransmisiones TCP**: proxy de congestión o fallos de encapsulamiento.
4. **Costo computacional**: CPU (millicores) y RAM (RSS) del agente CNI bajo estrés.

## Diseño de la inyección de tráfico

- `podAntiAffinity` (`preferredDuringSchedulingIgnoredDuringExecution`, weight 100) **prefiere** que cliente y servidor iperf3 queden en nodos distintos. Con 2 workers dedicados disponibles, el scheduler los separa en la práctica en todos los casos; se usa `preferred` (en lugar de `required`) para mantener resiliencia ante reinicios de nodo.
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

Tres casos de uso ejecutados sobre cada CNI que soporta Network Policies (Calico, Cilium, Antrea; Flannel queda excluido):

| Caso | Descripción |
|------|-------------|
| `zero_trust` | Default Deny: bloquea todo ingress y egress por defecto; permite solo el tráfico benchmark explícito |
| `multi_tier` | Reglas explícitas `frontend → backend → database` mediante label selectors |
| `egress_block` | Bloqueo de egress externo con DNS permitido; tráfico inter-pod interno habilitado |

### Diferenciadores de seguridad únicos por CNI

- **Cilium** (`CiliumNetworkPolicy` L7): filtrado HTTP nativo por método (`GET`/`HEAD` permitido desde frontend a backend; `POST`/`PUT`/`DELETE` bloqueados) directamente en eBPF, sin service mesh. Esto demuestra inspección de capa 7 sin overhead de proxy.
- **Antrea** (`ClusterNetworkPolicy` en Tier `securityops`): las reglas en el tier SecurityOps tienen prioridad sobre cualquier `NetworkPolicy` de namespace, modelando políticas corporativas obligatorias (ISO 27001 / SOC2) que los desarrolladores no pueden sobrescribir.
- **GitOps enforcement**: ArgoCD con `selfHeal` restaura automáticamente cualquier política borrada manualmente, manteniendo la postura de seguridad declarativa.
