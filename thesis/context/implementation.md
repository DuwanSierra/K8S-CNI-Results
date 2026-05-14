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

- Topología: 1 nodo Master + 2 nodos Worker (configurar `agent_count = 2` en variables).
- Base de datos externa PostgreSQL gestionada como datastore → plano de control sin SPOF.
- Con CNI alternativo (no Flannel): K3s arranca con `flannel-backend: none` y `disable-network-policy: true` en `/etc/rancher/k3s/config.yaml`, dejando la red en blanco para inyectar el CNI vía los scripts de `user_data`.

### Instalación de CNIs (automatizada en `user_data/ks3_server_init.sh`)

| CNI     | Método | Configuración clave |
|---------|--------|---------------------|
| Flannel | Nativo K3s | `flannel-iface: eth1` (interfaz VPC de DigitalOcean) |
| Calico  | Tigera Operator v3.29.1 | `encapsulation: VXLAN`, CIDR `10.42.0.0/16`, `nodeAddressAutodetectionV4.interface: eth1` |
| Cilium  | Helm 1.16.5 | `routingMode=tunnel`, `tunnelProtocol=vxlan`, `ipam.mode=kubernetes`, `devices=eth1`, `operator.replicas=1` |
| Antrea  | Manifest v2.2.0 | `transportInterface: eth1`, `serviceCIDR: 10.43.0.0/16` |

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

## Extracción de datos (Resource Usage Exporter)

Ubicación: `K8s-Tesis-Apps/grafana-exporter` (ArgoCD app: `cni-resource-exporter`)

- CronJob que consulta **directamente la API HTTP de Prometheus** (`/api/v1/query_range`) — no interactúa con Grafana.
- Ejecuta en minutos 25 y 55 de cada hora (tras cada ventana de benchmarks).
- Métricas recolectadas: CPU% por nodo, RAM% por nodo, RAM usada en MiB, CPU cores y RAM del pod del agente CNI (Criterio C2 del marco MCDA).
- Salida por corrida: `raw/` (JSON Prometheus), `csv/` (TSV procesado), `images/` (PNGs via gnuplot), `cni_resource_summary.json` (promedio para procesador.js).
- Todo se persiste con timestamp en `K8S-CNI-Results/results/cni-benchmarks/{cni}/resource_usage_nodes/`.

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

- Stack: React 19 + Vite 7 + Tailwind CSS 3.
- Consume `cni-data.json` directamente; sin backend.
- Muestra puntuaciones por CNI según el perfil de uso seleccionado.
- Build de producción desplegado en GitHub Pages vía `build:pages` (`--outDir ../docs/recommender`).
- Para actualizar datos: `npm run sync:data` ejecuta `procesador.js` (genera `cni-data.json`) y luego `export-spa-data.cjs` (inyecta los datos en el bundle).
