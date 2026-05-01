# Plan de Pruebas: Network Policies por CNI
> **Basado en la infraestructura existente de `K8s-Tesis-Apps` y `K8S-CNI-Results`**

---

## 0. Contexto de la Infraestructura Actual

Antes de definir las pruebas, es clave entender cómo funciona todo lo que ya tenemos:

| Componente | Detalle |
|---|---|
| **Clúster** | K3s en Digital Ocean, configuración HA |
| **GitOps** | ArgoCD con patrón "App of Apps" desde `K8s-Tesis-Apps` |
| **Namespace de pruebas** | `cni-test` |
| **Pruebas de throughput** | `iperf-client-cronjob.yaml` → corrida de 300s, cada 30 min, guarda JSON en `K8S-CNI-Results/results/cni-benchmarks/<cni>/throughput_tcp/` |
| **Pruebas de latencia** | `latency-client-cronjob.yaml` → 30 muestras de TCP connect, cada 30 min (offset 10 min), guarda JSON en `K8S-CNI-Results/results/cni-benchmarks/<cni>/latency_tcp_connect/` |
| **Pruebas de recursos** | Prometheus/Grafana raspa nodos y pods, guarda en `resource_usage_nodes/` |
| **CNIs con resultados** | Flannel ✅, Calico ✅, Cilium ✅, Antrea ✅ |
| **Anti-afinidad** | `podAntiAffinity` fuerza cliente e servidor en nodos distintos (tráfico inter-nodo real) |

---

## 1. Postura por CNI frente a Network Policies

| CNI | Soporte NP Estándar K8s | API Nativa Extendida | Tecnología de Enforcement |
|---|---|---|---|
| **Flannel** | ❌ No | ❌ No | N/A |
| **Calico** | ✅ Sí | ✅ `GlobalNetworkPolicy` (CRD) | `iptables` / `eBPF` (opcional) |
| **Cilium** | ✅ Sí | ✅ `CiliumNetworkPolicy` (L7) | `eBPF` (nativo) |
| **Antrea** | ✅ Sí | ✅ `AntreaNetworkPolicy` con Tiers | `OVS` (Open vSwitch) |

### Flannel: Decisión Técnica y Justificación para la Tesis
Flannel **no implementará Network Policies**. En la tesis esto se documenta así:
- Flannel es un CNI de Capa 3 puro; no posee un agente que inspeccione tráfico a nivel de política.
- Para agregar seguridad a Flannel, la comunidad usa "Canal" (Flannel + Calico), un proyecto híbrido que introduce complejidad operativa adicional, invalidando la propuesta de simplicidad de Flannel.
- **Calificación en el Prototipo Recomendador:** `0/10` en micro-segmentación.

---

## 2. Respuesta Definitiva: ¿Aplican las mismas pruebas?

**Sí. Se usan exactamente los mismos 3 tipos de prueba ya implementados:**

| Tipo | CronJob/Fuente | Métrica capturada | Ruta en K8S-CNI-Results |
|---|---|---|---|
| **Throughput TCP** | `iperf-client-cronjob.yaml` | `sender_bps`, `receiver_bps`, `retransmits` | `<cni>/throughput_tcp/` |
| **Latencia TCP Connect** | `latency-client-cronjob.yaml` | `min/avg/max/mdev ms`, `loss%` | `<cni>/latency_tcp_connect/` |
| **Uso de Recursos** | Grafana Exporter | `cpu_millicores`, `mem_bytes` del pod CNI | `<cni>/resource_usage_nodes/` |

**La diferencia crucial:** En las pruebas de Network Policies, los CronJobs corren **mientras las políticas están activas** en el namespace. El resultado permitirá calcular el **"Overhead de Seguridad"**:
```
Overhead (%) = ((Métrica_sin_NP - Métrica_con_NP) / Métrica_sin_NP) × 100
```
Esta comparación es el aporte científico principal de esta sección de la tesis.

---

## 3. Arquitectura de los Casos de Uso de Prueba

Las Network Policies se aplicarán sobre una **aplicación de 3 capas Dummy** que debe desplegarse en un nuevo namespace `cni-np-test`, separado del benchmark limpio para no contaminar resultados.

### Topología de la Aplicación Dummy
```
[ Internet / Externo ]
         |
   [ frontend-pod ] (label: tier=frontend)
         |
   [ backend-pod ]  (label: tier=backend)
         |
   [ database-pod ] (label: tier=database)
```
Todos los pods corren `netshoot` (imagen de debug de red) o `nginx`/`alpine` según el rol. El tráfico medido con `iperf` seguirá siendo **inter-nodo** (se mantendrá `podAntiAffinity`).

---

## 4. Los 3 Casos de Uso con Especificidad Completa

### Caso de Uso 1: Zero Trust (Denegación por Defecto)
**Objetivo de Tesis:** Medir el overhead que introduce el CNI cuando debe negar todo el tráfico y solo permitir lo explícito.

**Escenario:**
- Se aplica una `NetworkPolicy` que bloquea **todo** `Ingress` y `Egress` en el namespace `cni-np-test`.
- Luego se abre selectivamente solo el puerto `5201 TCP` entre el cliente iperf y el servidor iperf.

**Prueba Funcional (Validación previa a benchmark):**
- Un pod de diagnóstico intenta conectarse al servidor iperf → **Debe fallar (connection refused / timeout)**.
- El pod cliente iperf (autorizado por label) intenta conectarse → **Debe pasar**.

**Prueba de Rendimiento:**
- Se dispara el `iperf-client-cronjob` estando la política de deny-all activa y la excepción abierta.
- Los CronJobs de latencia y throughput guardan sus JSON en una sub-ruta nueva: `<cni>/with_network_policy/throughput_tcp/` y `<cni>/with_network_policy/latency_tcp_connect/`.
- El grafana-exporter captura el CPU/RAM del pod del CNI durante la ejecución.

**Hipótesis para la Tesis:**
- Calico (iptables): Se espera degradación leve (~5-10%) por la evaluación secuencial de reglas.
- Cilium (eBPF): Se espera impacto mínimo (<2%) por lookup en mapas hash.
- Antrea (OVS): Se espera impacto bajo-moderado, con mayor uso de CPU del componente `antrea-agent`.

---

### Caso de Uso 2: Aislamiento Multi-Capa (Frontend → Backend → DB)
**Objetivo de Tesis:** Demostrar micro-segmentación de microservicios, el caso de uso empresarial más común.

**Reglas de política a implementar:**

| Pod Destino | Ingress Permitido desde | Egress Permitido hacia | Todo lo demás |
|---|---|---|---|
| `frontend` | Cualquier IP (puerto 80) | Solo `backend` (puerto 8080) | Denegado |
| `backend` | Solo `frontend` (puerto 8080) | Solo `database` (puerto 5432) | Denegado |
| `database` | Solo `backend` (puerto 5432) | Ninguno (sin egress) | Denegado |

**Prueba Funcional:**
1. Desde `frontend`, `curl` al pod `database` directamente → **Debe fallar**.
2. Desde `frontend`, `curl` al pod `backend` → **Debe pasar**.
3. Desde `backend`, `curl` al pod `database` → **Debe pasar**.
4. Desde `database`, cualquier `curl` externo → **Debe fallar**.

**Prueba de Rendimiento:**
- El iperf server se ubica en el pod `backend`. El cliente iperf se ubica en el pod `frontend`.
- Se mide throughput y latencia con las políticas de las 3 capas activas.
- Los resultados se guardan en: `<cni>/with_network_policy/multi_tier/`.

---

### Caso de Uso 3: Restricción de Egress (Bloqueo de Salida a Internet)
**Objetivo de Tesis:** Demostrar la capacidad de contención de amenazas (ej: cryptominers, exfiltración de datos).

**Reglas de política a implementar:**
- Permitir Egress solo hacia el namespace `kube-system` (para DNS/CoreDNS, puerto 53 UDP/TCP).
- Bloquear todo Egress hacia rangos de IPs externas (0.0.0.0/0 excepto la red interna del clúster).

**Prueba Funcional:**
1. Desde un pod en `cni-np-test`, `nslookup kubernetes.default` → **Debe pasar** (DNS interno funciona).
2. Desde el mismo pod, `curl https://google.com` → **Debe fallar** (egress bloqueado).
3. Desde el mismo pod, comunicación al `iperf3-server` en el mismo clúster → **Debe pasar**.

**Prueba de Rendimiento:**
- El benchmark iperf3 entre pods del mismo clúster corre con la política de egress activa.
- Se verifica que la restricción de egress **no impacta** el tráfico interno del clúster.
- Resultado esperado: overhead mínimo, ya que las reglas de egress externo no se evalúan para tráfico intra-clúster en la mayoría de los CNIs.

---

## 5. Estructura de Archivos a Crear (para el Desarrollador)

```
K8s-Tesis-Apps/
└── network_policies/
    ├── base/
    │   ├── namespace.yaml                  # Namespace: cni-np-test
    │   ├── demo-app-frontend.yaml          # Deployment + Service (nginx, label tier=frontend)
    │   ├── demo-app-backend.yaml           # Deployment + Service (nginx, label tier=backend)
    │   ├── demo-app-database.yaml          # Deployment + Service (alpine, label tier=database)
    │   ├── iperf-server-np.yaml            # iperf3-server en namespace cni-np-test
    │   ├── iperf-client-np-cronjob.yaml    # CronJob iperf con salida a with_network_policy/
    │   ├── latency-client-np-cronjob.yaml  # CronJob latencia con salida a with_network_policy/
    │   └── kustomization.yaml
    │
    ├── use-case-1-zero-trust/
    │   ├── np-deny-all.yaml                # Bloquea todo Ingress/Egress en cni-np-test
    │   ├── np-allow-iperf.yaml             # Permite 5201 TCP entre cliente y servidor
    │   └── kustomization.yaml
    │
    ├── use-case-2-multi-tier/
    │   ├── np-frontend.yaml                # Reglas frontend
    │   ├── np-backend.yaml                 # Reglas backend
    │   ├── np-database.yaml                # Reglas database
    │   └── kustomization.yaml
    │
    ├── use-case-3-egress-block/
    │   ├── np-allow-dns.yaml               # Permite UDP/TCP 53 hacia kube-system
    │   ├── np-allow-internal.yaml          # Permite tráfico intra-clúster
    │   ├── np-block-external-egress.yaml   # Bloquea egress externo
    │   └── kustomization.yaml
    │
    └── overlays/
        ├── calico/
        │   └── kustomization.yaml          # Parcha CNI_NAME: "calico-with-np"
        ├── cilium/
        │   ├── kustomization.yaml          # Parcha CNI_NAME: "cilium-with-np"
        │   └── cilium-np-extra.yaml        # CiliumNetworkPolicy L7 adicional (diferenciador)
        └── antrea/
            ├── kustomization.yaml          # Parcha CNI_NAME: "antrea-with-np"
            └── antrea-np-tiers.yaml        # AntreaNetworkPolicy con Tiers (diferenciador)
```

---

## 6. Ruta de Resultados en K8S-CNI-Results

Los resultados de Network Policies se guardarán en rutas paralelas a las existentes:

```
K8S-CNI-Results/results/cni-benchmarks/
├── calico/
│   ├── throughput_tcp/                          ← Ya existe (baseline sin NP)
│   ├── latency_tcp_connect/                     ← Ya existe (baseline sin NP)
│   ├── resource_usage_nodes/                    ← Ya existe (baseline sin NP)
│   └── with_network_policy/
│       ├── zero_trust/
│       │   ├── throughput_tcp/                  ← NUEVO (namespace: cni-np-test)
│       │   └── latency_tcp_connect/             ← NUEVO
│       ├── multi_tier/
│       │   ├── throughput_tcp/                  ← NUEVO
│       │   └── latency_tcp_connect/             ← NUEVO
│       └── egress_block/
│           ├── throughput_tcp/                  ← NUEVO
│           └── latency_tcp_connect/             ← NUEVO
├── cilium/           (misma estructura)
├── antrea/           (misma estructura)
└── flannel/          (sin carpeta with_network_policy - no aplica)
```

---

## 7. Métricas a Capturar y Contrato de Datos JSON

> **Decisiones Cerradas:**
> - ✅ Namespace separado: `cni-np-test`
> - ✅ Retención máxima: 5 corridas (igual que baseline)
> - ✅ Cálculo de overhead: **automático en `procesador.js`**
> - ✅ Estructura JSON: **compatible y extendida** para que el procesador la entienda sin cambios en la lectura de baseline

### 7.1 JSON de Throughput con NP — Contrato Exacto

Los CronJobs NP producen el **mismo JSON** que `iperf-client-cronjob.yaml` con 2 campos adicionales al raíz. El campo `benchmark_type` se mantiene `"throughput_tcp"` para que `processJSONs()` funcione sin modificaciones:

```json
{
  "timestamp_utc": "2026-04-28T00:00:00Z",
  "benchmark_type": "throughput_tcp",
  "cni_name": "calico",
  "network_policy_case": "zero_trust",
  "namespace": "cni-np-test",
  "source": "cronjob/iperf3-client-np",
  "measurement_human": {
    "objective": "Medir throughput TCP con Network Policy zero-trust activa",
    "what_is_measured": "bits_per_second de envio y recepcion, y retransmisiones TCP",
    "topology_hint": "inter-nodo por anti-affinity preferente",
    "traffic_profile": "iperf3 -t 300 -i 10 -J",
    "target": "iperf3-server-np.cni-np-test.svc.cluster.local:5201",
    "decision_usage": "Calcular overhead de seguridad vs baseline sin NP"
  },
  "summary": {
    "duration_seconds": 300,
    "sender_bits_per_second": 9500000000,
    "receiver_bits_per_second": 9480000000,
    "retransmits": 12
  },
  "raw": {}
}
```

### 7.2 JSON de Latencia con NP — Contrato Exacto

Idéntico al `latency-client-cronjob.yaml` original con los mismos 2 campos extras al raíz:

```json
{
  "timestamp_utc": "2026-04-28T00:10:00Z",
  "benchmark_type": "latency_tcp_connect",
  "cni_name": "calico",
  "network_policy_case": "zero_trust",
  "namespace": "cni-np-test",
  "source": "cronjob/latency-client-np",
  "tcp_connect_avg_ms": 1.45,
  "tcp_connect_min_ms": 0.9,
  "tcp_connect_max_ms": 3.2,
  "tcp_connect_mdev_ms": 0.4,
  "connect_failure_percent": 0.0,
  "samples_attempted": 30,
  "samples_succeeded": 30
}
```

---

## 8. Diferenciadores Exclusivos por CNI (Valor Extra para la Tesis)

### Cilium: Filtrado L7 (Caso Extra)
Cilium permite crear una `CiliumNetworkPolicy` que filtra por **protocolo HTTP**. Además del Caso 2 estándar, se hará una variación:
- Permitir solo `HTTP GET` hacia el backend (bloquear `POST`, `DELETE`).
- Esto no tiene equivalente en Calico/Antrea estándar y demuestra por qué Cilium es superior para arquitecturas de microservicios con APIs REST.
- Se documenta como "capacidad diferenciadora" en el Prototipo Recomendador.

### Antrea: Tiers de Prioridad (Caso Extra)
Antrea organiza las políticas en 5 niveles de prioridad (Tiers): `Emergency > SecurityOps > NetworkOps > Platform > Application`.
- Se creará una `ClusterNetworkPolicy` en el Tier `SecurityOps` que actúa como "regla corporativa" que no puede ser sobrescrita por una `NetworkPolicy` de desarrollador.
- Esto simula un entorno corporativo con separación de roles entre el equipo de seguridad y desarrollo.
- Se documenta como ventaja en escenarios de cumplimiento normativo (ISO 27001, SOC2).

---

## 9. Proceso de Ejecución por CNI (Paso a Paso Operativo)

Para cada CNI que soporte NP (Calico, Cilium, Antrea), el proceso es idéntico:

1. **Cambiar el overlay activo en ArgoCD** al CNI correspondiente.
2. **Esperar estabilización** del clúster (pods en `Running`, ArgoCD en `Synced/Healthy`).
3. **Deploy de la app dummy y los manifiestos base** (`network_policies/base/`).
4. **Aplicar las NP del Caso de Uso 1** (zero-trust).
5. **Ejecutar validación funcional** (pod de diagnóstico, confirmar bloqueos y pasos).
6. **Esperar ejecución de CronJobs** (mínimo 2-3 corridas, máximo 5 retenidas).
7. **Confirmar resultados en GitHub** (`K8S-CNI-Results/results/cni-benchmarks/<cni>/with_network_policy/zero_trust/`).
8. **Repetir pasos 4-7** para Caso 2 (multi-tier) y Caso 3 (egress-block).
9. **Limpiar NPs** antes de cambiar al siguiente CNI.
10. **GitHub Action dispara `procesador.js`** automáticamente al push, calcula el overhead y actualiza el dashboard.

---

## 10. Contrato Técnico para la Extensión de `procesador.js`

El `procesador.js` actual itera los directorios CNI y lee 3 sub-rutas fijas. La extensión añade lectura de `with_network_policy/` reutilizando `processJSONs()` sin modificarla.

### 10.1 Fórmulas de Cálculo del Overhead
```
overhead_latencia_pct   = ((latencia_con_np - latencia_baseline) / latencia_baseline) × 100
overhead_throughput_pct = ((throughput_baseline - throughput_con_np) / throughput_baseline) × 100
```

### 10.2 Estructura de Salida de `datos_consolidados.js` (Extendida)

```javascript
const CNI_DATA = {
    "calico": {
        // Baseline sin NP (no cambia, igual que hoy):
        latencia_ms: 1.20,
        latencia_max_ms: 2.10,
        jitter_ms: 0.30,
        throughput_mbps: 9480,
        retransmits: 5,
        cpu_usada_pct: 12.3,
        ram_usada_mb: 45.1,

        // NUEVO bloque calculado automáticamente por procesador.js:
        network_policy: {
            zero_trust: {
                latencia_ms: 1.35,
                throughput_mbps: 9025,
                overhead_latencia_pct: 12.5,
                overhead_throughput_pct: 4.8
            },
            multi_tier: {
                latencia_ms: 1.28,
                throughput_mbps: 9200,
                overhead_latencia_pct: 6.7,
                overhead_throughput_pct: 2.9
            },
            egress_block: {
                latencia_ms: 1.22,
                throughput_mbps: 9410,
                overhead_latencia_pct: 1.7,
                overhead_throughput_pct: 0.7
            }
        }
    },
    "cilium":  { /* misma estructura */ },
    "antrea":  { /* misma estructura */ },
    "flannel": {
        latencia_ms: 0.95,
        throughput_mbps: 9800,
        retransmits: 2,
        cpu_usada_pct: 3.1,
        ram_usada_mb: 28.4
        // Sin bloque network_policy. El dashboard lo renderiza como "No soportado (0/10)"
    }
};
```

### 10.3 Reglas de Retrocompatibilidad

| Situación | Comportamiento del Procesador |
|---|---|
| `with_network_policy/` no existe (Flannel) | Bloque `network_policy` se omite del JSON de salida |
| Subcarpeta de caso existe pero está vacía | El valor de overhead se emite como `null` (no `0`) |
| `processJSONs()` actual | **No se modifica** — se reutiliza apuntando a las nuevas rutas |
| Retrocompatibilidad del dashboard | El dashboard verifica `if (data.network_policy)` antes de renderizar |

