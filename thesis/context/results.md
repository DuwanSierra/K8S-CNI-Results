---
name: results-context
type: context
---

# Resultados: Estructura y Acceso

## Ubicación

Repositorio: `https://github.com/DuwanSierra/K8S-CNI-Results`  
Rama: `main`  
Ruta base local: `results/cni-benchmarks/{cni}/{tipo_benchmark}/`

## Patrón de URL para imágenes (GitHub raw)

```
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/{cni}/resource_usage_nodes/{timestamp}/images/{imagen}.png
```

**Las imágenes solo existen en `resource_usage_nodes`**. Los benchmarks `throughput_tcp`, `latency_tcp_connect` y `with_network_policy` solo tienen archivos JSON.

## Tipos de benchmark por CNI

```
{cni}/
  latency_tcp_connect/          → run_{timestamp}.json (5 runs por CNI)
  throughput_tcp/               → run_{timestamp}.json (5 runs por CNI)
  resource_usage_nodes/
    {timestamp}/
      cni_resource_summary.json
      images/                   → PNGs (ver abajo)
      csv/                      → CSV de las mismas métricas
      raw/                      → JSON crudo de Prometheus
  with_network_policy/
    zero_trust/
      latency_tcp_connect/      → run_{timestamp}.json
      throughput_tcp/           → run_{timestamp}.json
    multi_tier/
      latency_tcp_connect/      → run_{timestamp}.json
      throughput_tcp/           → run_{timestamp}.json
    egress_block/
      latency_tcp_connect/      → run_{timestamp}.json
      throughput_tcp/           → run_{timestamp}.json
```

## Imágenes disponibles por CNI (última corrida de cada uno)

### Qué muestra cada imagen

| Nombre archivo | Descripción |
|----------------|-------------|
| `cni_pod_cpu_cores_unknown.png` | CPU cores del pod del agente CNI bajo carga |
| `cni_pod_mem_bytes_unknown.png` | Memoria del pod del agente CNI bajo carga |
| `cpu_pct_10_10_10_5_9100.png` | % CPU del nodo worker 1 (10.10.10.5) en la ventana de prueba |
| `cpu_pct_10_10_10_6_9100.png` | % CPU del nodo worker 2 (10.10.10.6) en la ventana de prueba |
| `mem_pct_10_10_10_5_9100.png` | % RAM del nodo worker 1 |
| `mem_pct_10_10_10_6_9100.png` | % RAM del nodo worker 2 |
| `mem_used_mib_10_10_10_5_9100.png` | RAM en MiB del nodo worker 1 |
| `mem_used_mib_10_10_10_6_9100.png` | RAM en MiB del nodo worker 2 |

> Flannel no tiene `cni_pod_*` (su agente no fue instrumentado con las mismas métricas Prometheus).

---

### Antrea — timestamp: `20260505T162610Z`

```
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/antrea/resource_usage_nodes/20260505T162610Z/images/cni_pod_cpu_cores_unknown.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/antrea/resource_usage_nodes/20260505T162610Z/images/cni_pod_mem_bytes_unknown.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/antrea/resource_usage_nodes/20260505T162610Z/images/cpu_pct_10_10_10_5_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/antrea/resource_usage_nodes/20260505T162610Z/images/cpu_pct_10_10_10_6_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/antrea/resource_usage_nodes/20260505T162610Z/images/mem_pct_10_10_10_5_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/antrea/resource_usage_nodes/20260505T162610Z/images/mem_pct_10_10_10_6_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/antrea/resource_usage_nodes/20260505T162610Z/images/mem_used_mib_10_10_10_5_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/antrea/resource_usage_nodes/20260505T162610Z/images/mem_used_mib_10_10_10_6_9100.png
```

### Calico — timestamp: `20260512T165621Z`

```
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/calico/resource_usage_nodes/20260512T165621Z/images/cni_pod_cpu_cores_unknown.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/calico/resource_usage_nodes/20260512T165621Z/images/cni_pod_mem_bytes_unknown.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/calico/resource_usage_nodes/20260512T165621Z/images/cpu_pct_10_10_10_5_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/calico/resource_usage_nodes/20260512T165621Z/images/cpu_pct_10_10_10_6_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/calico/resource_usage_nodes/20260512T165621Z/images/mem_pct_10_10_10_5_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/calico/resource_usage_nodes/20260512T165621Z/images/mem_pct_10_10_10_6_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/calico/resource_usage_nodes/20260512T165621Z/images/mem_used_mib_10_10_10_5_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/calico/resource_usage_nodes/20260512T165621Z/images/mem_used_mib_10_10_10_6_9100.png
```

### Cilium — timestamp: `20260506T235605Z`

```
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/cilium/resource_usage_nodes/20260506T235605Z/images/cni_pod_cpu_cores_unknown.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/cilium/resource_usage_nodes/20260506T235605Z/images/cni_pod_mem_bytes_unknown.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/cilium/resource_usage_nodes/20260506T235605Z/images/cpu_pct_10_10_10_5_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/cilium/resource_usage_nodes/20260506T235605Z/images/cpu_pct_10_10_10_6_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/cilium/resource_usage_nodes/20260506T235605Z/images/mem_pct_10_10_10_5_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/cilium/resource_usage_nodes/20260506T235605Z/images/mem_pct_10_10_10_6_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/cilium/resource_usage_nodes/20260506T235605Z/images/mem_used_mib_10_10_10_5_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/cilium/resource_usage_nodes/20260506T235605Z/images/mem_used_mib_10_10_10_6_9100.png
```

### Flannel — timestamp: `20260409T015624Z`

```
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/flannel/resource_usage_nodes/20260409T015624Z/images/cpu_pct_10_10_10_5_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/flannel/resource_usage_nodes/20260409T015624Z/images/cpu_pct_10_10_10_6_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/flannel/resource_usage_nodes/20260409T015624Z/images/mem_pct_10_10_10_5_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/flannel/resource_usage_nodes/20260409T015624Z/images/mem_pct_10_10_10_6_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/flannel/resource_usage_nodes/20260409T015624Z/images/mem_used_mib_10_10_10_5_9100.png
https://raw.githubusercontent.com/DuwanSierra/K8S-CNI-Results/main/results/cni-benchmarks/flannel/resource_usage_nodes/20260409T015624Z/images/mem_used_mib_10_10_10_6_9100.png
```

## Nota sobre los timestamps múltiples

Cada CNI tiene múltiples corridas (ventanas de 45 min aprox.). Las URLs de arriba apuntan a la **última corrida** de cada CNI. Si se necesita comparar evolución temporal, los timestamps anteriores siguen el mismo patrón de ruta.
