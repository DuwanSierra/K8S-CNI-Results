---
name: implementation-context
type: context
---

# Implementación de la Solución

## Aprovisionamiento de infraestructura (Terraform)

Ubicación: `K8s-bootstrap/00.bootstrap`

- Crea Droplets, VPC y reglas de firewall en DigitalOcean.
- Gestiona llaves SSH para comunicación plano de control ↔ workers.
- Genera `kubeconfig` como output para administración remota.

## Clúster K3s (Alta Disponibilidad)

Ubicación: `K8s-bootstrap/10.k3s-ha-do`

- Base de datos externa gestionada como datastore → múltiples masters sin SPOF.
- Flag `--flannel-backend=none` al instalar K3s cuando se prueba un CNI alternativo, dejando la red en blanco para inyectar Calico, Cilium o Antrea.

## Orquestación GitOps (ArgoCD)

| Componente | Ubicación |
|-----------|-----------|
| Instalación ArgoCD | `K8s-bootstrap/20.argo-cd-install` |
| App of Apps | `K8s-bootstrap/30.apps-of-apps-install` |
| Apps (CNIs, métricas, benchmarks) | `K8s-Tesis-Apps/` |

- Patrón **App of Apps**: un único objeto ArgoCD controla todo el ecosistema.
- `selfHeal` + `prune` garantizan convergencia continua con el repositorio.

## Stack de observabilidad (Prometheus + Grafana)

Ubicación: `K8s-Tesis-Apps/apps/metrics`

- Desplegado con Helm vía ArgoCD.
- `ServiceMonitors` (CRD) apuntan específicamente a los Pods de cada agente CNI.
- Dashboards Grafana para CPU millicores, RAM RSS y tráfico en tiempo real.

## Extracción de datos (Grafana Exporter)

Ubicación: `K8s-Tesis-Apps/grafana-exporter`

- CronJob que consulta la API de Prometheus y guarda promedios de recursos en JSON/CSV.
- Salida se persiste en el repositorio `K8S-CNI-Results` para procesamiento posterior.

## Benchmarks de red

**Throughput** (`K8s-Tesis-Apps/cni_test_iperf`):
- Deployment con 1 réplica → servidor iperf3 estático.
- CronJob (`iperf-client-cronjob.yaml`) → cliente con `-J` (JSON) y ráfagas de 300 s.
- Resultados capturados vía ConfigMaps + scripts Bash y enviados al repositorio de resultados.

**Latencia** (`latency-client-cronjob.yaml`):
- Cliente Python/Bash que mide TCP Connect al servicio iperf3.
- 30 muestras por corrida; captura RTT min/avg/max bajo carga.

## Procesador de resultados

Archivo: `K8S-CNI-Results/docs/procesador.js`

Flujo: JSON/CSV crudos → IQR outlier removal → normalización min-max → scoring MCDA → `cni-data.json`

## Prototipo recomendador SPA (OE4)

Ubicación: `K8S-CNI-Results/cni-recommender-spa`

- Stack: React 18 + Vite + Tailwind CSS.
- Consume `cni-data.json` directamente; sin backend.
- Muestra puntuaciones por CNI según el perfil de uso seleccionado.
