# Documento de Pruebas y Validación: Optimización de Redes Kubernetes

Este documento detalla la metodología, los escenarios y la ejecución de las pruebas **ya realizadas** en el proyecto. Su propósito es servir como base para generar la fase de "Pruebas" de la tesis (20-25 páginas), describiendo el rigor científico y técnico utilizado para validar la hipótesis.

---

## 1. Metodología de Pruebas de Rendimiento (OE1)

### 1.1 Diseño del Escenario de Referencia (Baseline)
Para garantizar la validez de los datos, se implementó una metodología de aislamiento total:
*   **Condiciones Controladas**: Todas las pruebas se ejecutaron en el mismo tipo de instancia de DigitalOcean (Droplets idénticos) y bajo la misma versión de Kubernetes (K3s).
*   **Aislamiento de Carga**: Las pruebas se ejecutaron de forma secuencial, reiniciando o limpiando el entorno entre el despliegue de cada CNI (Antrea, Calico, Cilium, Flannel).
*   **Muestreo Estadístico**: No se tomó una única medición; se configuraron 5 corridas por cada tipo de prueba para obtener promedios confiables y reducir el margen de error.

### 1.2 Ejecución de Benchmarks de Red (Throughput y Latencia)
*   **Protocolo de Throughput**: Uso de `iperf3` con el flag `-J` (output JSON) y ráfagas de 300 segundos. Se midieron bits por segundo (sender/receiver) y retransmisiones TCP.
*   **Protocolo de Latencia**: Mediciones de `TCP Connect` mediante un script personalizado que realiza 30 muestras por corrida, capturando el RTT (Round Trip Time) promedio, mínimo y máximo.
*   **Variables de Control**: Uso de `podAntiAffinity` para asegurar que el tráfico sea **inter-nodo**, forzando al CNI a realizar el encapsulamiento (Overlay) y ruteo real entre máquinas distintas.

---

## 2. Metodología de Pruebas de Seguridad (OE2)

### 2.1 Validación de Network Policies
Se diseñó una matriz de pruebas para validar que el CNI no solo soporte la API de Kubernetes, sino que la ejecute correctamente en el plano de datos:
*   **Caso Zero Trust**: Verificación del bloqueo total de tráfico mediante políticas de "Default Deny" en Ingress y Egress.
*   **Caso Multi-Tier**: Validación funcional de segmentación entre capas (Frontend -> Backend -> DB), donde se verificó que el tráfico no autorizado fuera descartado por el CNI.
*   **Medición del Overhead de Seguridad**: Se ejecutaron pruebas de rendimiento (iperf3) **mientras** las Network Policies estaban activas, permitiendo calcular cuánta latencia adicional introduce la inspección de paquetes en el firewall del CNI.

---

## 3. Pruebas de Consumo de Recursos (Eficiencia)

### 3.1 Monitoreo de Infraestructura
Utilizando el stack de Prometheus, se capturaron métricas de "costo operativo" de cada CNI:
*   **CPU Usage**: Medición en millicores del agente CNI (ej. `cilium-agent`, `calico-node`) bajo estrés de red.
*   **Memory Usage**: Consumo de memoria RAM (RSS) de los componentes del CNI.
*   **Análisis de Sobredimensionamiento**: Relación entre el tráfico procesado y el recurso consumido para determinar qué CNI es más eficiente en entornos de bajos recursos (Edge Computing).

---

## 4. Validación del Modelo Matemático (OE3)

### 4.1 Tratamiento Estadístico de Datos (IQR)
Se implementó una fase de validación de datos para eliminar el ruido del entorno cloud:
*   **Algoritmo IQR (Rango Intercuartílico)**: Localizado en `procesador.js`, este método identifica "outliers" (mediciones anómalas por congestión temporal de la red de DigitalOcean) y los descarta automáticamente.
*   **Normalización Min-Max**: Conversión de los resultados crudos a una escala de 0 a 1 para permitir la comparación objetiva entre métricas de diferente naturaleza (ms vs Mbps).

---

## 5. Validación Funcional del Prototipo (OE4)

### 5.1 Pruebas de Usuario y Recomendación
Se validó que el Prototipo Recomendador (SPA) responda correctamente a los perfiles diseñados:
*   **Prueba de Perfil**: Al seleccionar "Seguridad Alta", el prototipo pondera con mayor peso los resultados de Network Policies, recomendando el CNI con mejor desempeño en OE2.
*   **Integridad de Datos**: Verificación de que el frontend refleje fielmente los datos procesados en el OE3 sin pérdida de precisión.

---

## 📝 Instrucción para la Expansión de 25 páginas:
"Utiliza este documento como el marco metodológico de pruebas. Describe los protocolos de prueba (iperf3, TCP Connect) con profundidad técnica, explica la importancia de la anti-afinidad para la validez de los resultados inter-nodo y justifica el uso del método IQR para la limpieza de datos desde una perspectiva de rigor científico. Asegúrate de que se note que las pruebas no fueron manuales, sino orquestadas mediante CronJobs y GitOps para garantizar la repetibilidad."
