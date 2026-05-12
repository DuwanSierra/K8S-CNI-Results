# Documento de Implementación de la Solución: Optimización de Redes Kubernetes

Este documento detalla la ejecución técnica y el despliegue del proyecto **ya realizado**. Su propósito es servir como base para generar la fase de "Implementación" de la tesis (20-25 páginas), describiendo el "Cómo" se construyó cada componente tecnológico.

---

## 1. Aprovisionamiento de Infraestructura Automática (IaC)

### 1.1 Despliegue con Terraform
La infraestructura se materializó en **DigitalOcean** utilizando archivos de configuración de Terraform localizados en `K8s-bootstrap/00.bootstrap`:
*   **Recursos Cloud**: Creación de Droplets (nodos), redes VPC, y reglas de firewall a nivel de nube.
*   **Gestión de Accesos**: Automatización de llaves SSH para la comunicación segura entre el plano de control y los trabajadores.
*   **Salidas (Outputs)**: Generación dinámica del archivo `kubeconfig` para la administración remota del clúster.

### 1.2 Configuración del Clúster K3s (Alta Disponibilidad)
Se implementó un clúster ligero pero robusto siguiendo el código en `K8s-bootstrap/10.k3s-ha-do`:
*   **Base de Datos Externa**: Uso de una base de datos gestionada para el `datastore` de K3s, permitiendo que múltiples nodos Master compartan el estado del clúster sin puntos únicos de falla.
*   **Aislamiento de CNIs**: Instalación de K3s con el flag `--flannel-backend=none` cuando fue necesario probar CNIs alternativos, permitiendo una "pizarra limpia" para la inyección de Calico, Cilium o Antrea.

---

## 2. Orquestación y Entrega Continua (GitOps)

### 2.1 Implementación de ArgoCD
Localizado en `K8s-bootstrap/20.argo-cd-install`, se desplegó el controlador de ArgoCD para gestionar el ciclo de vida de las aplicaciones.
*   **Patrón App of Apps**: Implementado en `K8s-bootstrap/30.apps-of-apps-install`, permitiendo que un solo objeto de ArgoCD controle el despliegue de todo el ecosistema (CNIs, métricas, benchmarks).
*   **Sincronización Automática**: Configuración de `selfHeal` y `prune` para garantizar que el estado del clúster coincida siempre con los manifiestos en el repositorio `K8s-Tesis-Apps`.

---

## 3. Implementación del Stack de Observabilidad y Métricas

### 3.1 Prometheus y Grafana (Kube-Prometheus-Stack)
Se desplegó el stack completo mediante Helm y ArgoCD (`K8s-Tesis-Apps/apps/metrics`):
*   **Custom Resources (CRDs)**: Implementación de `ServiceMonitors` para rastrear específicamente el consumo de recursos de los Pods de los CNIs.
*   **Dashboards de Red**: Configuración de paneles en Grafana para visualizar en tiempo real el tráfico de red, CPU millicores y memoria RSS utilizada por cada solución de red.

### 3.2 Grafana Exporter (Extracción de Datos)
Se implementó un componente personalizado en `K8s-Tesis-Apps/grafana-exporter`:
*   **Automatización**: Un `CronJob` que consulta la API de Prometheus para extraer promedios de consumo de recursos y los guarda en archivos JSON/CSV para su posterior procesamiento estadístico.

---

## 4. Implementación del Banco de Pruebas (Benchmarks)

### 4.1 Escenario de Rendimiento con iperf3
Implementado en `K8s-Tesis-Apps/cni_test_iperf`:
*   **Servidor Estático**: Un `Deployment` de iperf3 con 1 réplica.
*   **Clientes Programados**: Un `CronJob` (`iperf-client-cronjob.yaml`) que ejecuta ráfagas de 300 segundos de tráfico TCP pesado.
*   **Persistencia de Resultados**: Uso de `ConfigMaps` y scripts de Bash para capturar el output JSON de iperf3 y enviarlo al repositorio de resultados (`K8S-CNI-Results`).

### 4.2 Pruebas de Latencia (TCP Connect)
Se desarrolló un cliente de latencia personalizado en Python/Bash (`latency-client-cronjob.yaml`) que mide el tiempo de establecimiento de conexión hacia el servicio de iperf3, capturando métricas de jitter y latencia máxima bajo carga.

---

## 5. Desarrollo del Prototipo Recomendador (OE4)

### 5.1 Frontend SPA (Single Page Application)
Implementado en `K8S-CNI-Results/cni-recommender-spa`:
*   **Tecnologías**: React 18, Vite para el empaquetado rápido y Tailwind CSS para una interfaz moderna y responsiva.
*   **Lógica de Consumo**: La aplicación consume directamente los archivos `cni-data.json` generados por el procesador, permitiendo una visualización dinámica de las puntuaciones de cada CNI según el perfil seleccionado.

---

## 📝 Instrucción para la Expansión de 25 páginas:
"Utiliza este documento como la guía de ejecución técnica. Describe el proceso paso a paso, desde la ejecución de Terraform hasta la sincronización de ArgoCD. Justifica el uso de herramientas como K3s y GitOps desde la perspectiva de la repetibilidad científica y la eficiencia operativa en telemática. Explica cómo se integran los archivos YAML de Kustomize para desplegar los diferentes CNIs (overlays) y cómo se capturan los logs de las pruebas para convertirlos en evidencia técnica."
