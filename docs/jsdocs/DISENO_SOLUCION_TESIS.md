# Documento de Diseño de la Solución: Optimización de Redes Kubernetes

Este documento detalla el diseño técnico y arquitectónico **ya implementado** en el proyecto. Su propósito es servir como la base técnica profunda para que un agente de IA genere la fase de "Diseño" de la tesis (20-25 páginas), manteniendo un enfoque estrictamente telemático.

---

## 1. Arquitectura de Red y Topología (Enfoque de Capas)

### 1.1 Diseño de la Red Underlay (Infraestructura)
El diseño se basa en una infraestructura de nube pública (**DigitalOcean**) para eliminar ruidos de hardware local. 
*   **Aprovisionamiento**: Implementado mediante **Terraform** (`K8s-bootstrap`).
*   **Topología de Red**: Un clúster **K3s en Alta Disponibilidad (HA)** con plano de control distribuido (3 Nodos Master) y Workers dedicados.
*   **Conectividad**: Se diseñó una red privada VPC para el tráfico inter-nodo, asegurando que la latencia medida dependa exclusivamente de la eficiencia del CNI y no de saltos de red pública.

### 1.2 Diseño de la Red Overlay (CNI - Container Network Interface)
El corazón del diseño es la comparativa de 4 tecnologías de encapsulamiento y ruteo:
*   **Flannel**: Diseño de Capa 2 (VXLAN) para máxima simplicidad.
*   **Calico**: Diseño híbrido usando BGP para ruteo nativo y políticas de red avanzadas.
*   **Cilium**: Diseño basado en **eBPF** (Extended Berkeley Packet Filter) para sustituir `iptables`, optimizando el plano de datos.
*   **Antrea**: Diseño basado en **Open vSwitch (OVS)**, trayendo conceptos de redes SDN (Software Defined Networking) al clúster.

---

## 2. Diseño del Sistema de Medición de QoS (Metrología Telemática)

### 2.1 Metodología de Inyección de Tráfico
Para medir la Calidad de Servicio (QoS), se diseñó un escenario de **Tráfico Inter-nodo Real**:
*   **Aislamiento**: Uso de `podAntiAffinity` para garantizar que el emisor (`iperf3-client`) y el receptor (`iperf3-server`) nunca compartan el mismo host físico.
*   **Instrumentación**: CronJobs automatizados que disparan ráfagas de tráfico TCP cada 30 minutos, capturando el comportamiento de la red en diferentes momentos de carga.

### 2.2 Variables Telemáticas Capturadas
El sistema fue diseñado para recolectar métricas críticas de red:
1.  **Throughput (Ancho de Banda)**: Capacidad efectiva de transferencia en bps.
2.  **Latencia de Establecimiento**: Tiempo de `TCP Connect` (min/avg/max).
3.  **Eficiencia del Plano de Datos**: Retransmisiones TCP (indicador de congestión o fallos en el encapsulamiento).
4.  **Costo Computacional**: Relación entre el tráfico procesado y el consumo de CPU/RAM del agente CNI.

---

## 3. Diseño del Modelo Matemático de Recomendación (MCDA)

### 3.1 Algoritmo de Procesamiento de Datos
Ubicado en `K8S-CNI-Results/docs/procesador.js`, el diseño sigue un flujo científico:
*   **Limpieza Estadística**: Implementación del **Rango Intercuartílico (IQR)** para detectar y descartar *outliers* (latencias anómalas por ruidos en la nube), asegurando que el puntaje final sea representativo.
*   **Normalización**: Conversión de métricas heterogéneas (ms, Mbps, MB) a una escala común (0-1).

### 3.2 El Modelo de Decisión Multicriterio (MCDA)
Se diseñó una matriz de decisión que permite recomendar el CNI según el **Perfil de Usuario**:
*   **Perfil Fintech (Seguridad)**: Prioriza el soporte de Network Policies L7.
*   **Perfil Streaming/Edge (Rendimiento)**: Prioriza bajo jitter y alto throughput.
*   **Perfil IoT (Recursos)**: Prioriza el bajo consumo de memoria del agente CNI.

---

## 4. Diseño de Seguridad y Micro-segmentación (Zero Trust)

### 4.1 Estrategia de Network Policies
El diseño rompe con el modelo de "red abierta" de Kubernetes por defecto:
*   **Default Deny**: Diseño de políticas que bloquean todo el tráfico entrante/saliente de forma preventiva.
*   **Micro-segmentación por Capas**: Reglas específicas para que el `frontend` solo vea al `backend`, y este solo a la `database`, implementado mediante selectores de etiquetas dinámicos.

### 4.2 Automatización GitOps (ArgoCD)
Se diseñó un flujo de **Infraestructura como Código (IaC)** donde la configuración de red es declarativa. Si una política de seguridad se borra manualmente, ArgoCD la restaura automáticamente, manteniendo la integridad del diseño de red.

---

## 5. Beneficio Telemático: El "Por qué" del Proyecto
El diseño soluciona el problema del **Sobredimensionamiento**. Al medir exactamente cuánta CPU requiere cada CNI para mover 1Gbps de tráfico, el diseño permite a los ingenieros ajustar el tamaño de sus servidores (Instancias Cloud) a la realidad técnica, reduciendo costos operativos y consumo energético.

---

## 📝 Instrucción para la Expansión de 25 páginas:
"Utiliza este documento de diseño como la base técnica factual. El proyecto ya está construido y funciona según estas especificaciones. Expande cada sección detallando los protocolos mencionados (VXLAN, eBPF, BGP, TCP), justifica las decisiones de diseño desde la teoría de redes telemáticas y asegúrate de explicar el flujo de datos desde la captura de métricas hasta el dashboard de recomendación. El objetivo es una redacción académica formal y profunda."
