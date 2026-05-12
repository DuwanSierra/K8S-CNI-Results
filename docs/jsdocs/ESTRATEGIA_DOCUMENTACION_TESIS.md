# Estrategia de Documentación: Tesis de Grado - Ingeniería Telemática

Este documento sirve como mapa de ruta para la redacción de la tesis final. El objetivo es estructurar el contenido técnico complejo en una narrativa académica de alto nivel, cumpliendo con los requisitos de extensión (100-120 páginas totales) y el enfoque en **Telemática (QoS, Redes, Seguridad)**.

---

## 📋 Estructura General del Documento (Target: 100-120 págs)

1. **Diseño de la Solución (20-25 págs)**: Modelamiento arquitectónico y teórico.
2. **Implementación (20-25 págs)**: El "Cómo" técnico (Terraform, K8s, GitOps).
3. **Fase de Pruebas (20-25 págs)**: Metodología de recolección de datos.
4. **Resultados y Discusión (20-25 págs)**: Análisis estadístico y comparativas.
5. **Conclusiones y Trabajos Futuros (10-15 págs)**: Síntesis del aporte telemático.

---

## 🏗️ FASE 1: DISEÑO DE LA SOLUCIÓN (Enfoque Detallado)

Para que esta fase alcance las 25 páginas y sea entendida por el profesor de telemática, debemos centrarnos en el **Modelo Conceptual** antes que en el código.

### 1.1 Modelamiento del Escenario Telemático (Arquitectura de Red)
*   **Diseño de la Red Underlay vs Overlay**: Explicación técnica de por qué se eligió DigitalOcean como capa física y cómo el diseño de la red lógica (CNI) encapsula el tráfico (VXLAN, Geneve, BGP).
*   **Topología del Testbed**: Diseño del clúster K3s en Alta Disponibilidad (HA). Por qué 3 nodos Master y nodos Worker, y cómo esto afecta la latencia inter-nodo.
*   **Diseño de la Conectividad**: Explicación de las capas de red de Kubernetes (Pod-to-Pod, Pod-to-Service, External-to-Service).

### 1.2 Diseño de la Metodología de Observabilidad (QoS)
*   **Selección de Métricas de Calidad de Servicio (QoS)**: Definición técnica de Throughput (bps), Latencia (Rtt), Jitter y Packet Loss. Justificación de por qué estas métricas son críticas para microservicios.
*   **Arquitectura de Telemetría**: Diseño del flujo de datos desde los nodos de K8s hasta Prometheus y Grafana. Cómo se diseñó el "raspado" de métricas para no introducir sesgo (overhead) en las pruebas.

### 1.3 Diseño del Modelo Matemático de Recomendación (OE3)
*   **Selección de Criterios (MCDA)**: Explicación del modelo de decisión multicriterio.
*   **Ponderación Telemática**: Justificación de los "Pesos" (ej. ¿Por qué para una Fintech la seguridad pesa 40% y el throughput 20%?).
*   **Algoritmo de Limpieza (IQR)**: Diseño lógico de cómo se eliminan los "outliers" (datos basura) de las pruebas de red para garantizar precisión científica.

### 1.4 Diseño de la Estrategia de Seguridad (OE2)
*   **Modelo Zero-Trust en Kubernetes**: Diseño de la micro-segmentación a nivel de Capa 3/4 y Capa 7.
*   **Automatización GitOps**: Diseño del ciclo de vida de una política de red desde que se escribe en el repo hasta que el CNI la aplica mediante ArgoCD.

---

## 🚀 Beneficio Tecnológico y Telemático

Para la sección de conclusiones y diseño, debemos resaltar:
1.  **Reducción del Sobredimensionamiento**: Al conocer el costo real de CPU/RAM de un CNI, las empresas no compran servidores "por si acaso", optimizando el gasto energético (Telemática Sustentable).
2.  **Automatización de la Postura de Seguridad**: Eliminar el error humano en la configuración de firewalls internos mediante Network Policies dinámicas.
3.  **Aporte a la Comunidad**: Un framework reproducible para que cualquier ingeniero pueda evaluar CNIs sin depender de marketing de proveedores.

---

## 🛠️ Instrucción para el "Agente de Chat" (Estrategia de Escritura)

Para generar las 20-25 páginas de Diseño, pásale estos puntos al agente:

> "Actúa como un experto en Ingeniería Telemática redactando una tesis de grado. Basado en el esquema de diseño adjunto, expande cada sección utilizando lenguaje técnico apropiado (protocolos de encapsulamiento, métricas de QoS, arquitectura de microservicios). Asegúrate de que el texto explique la **dificultad técnica** de gestionar redes en Kubernetes, pero usa analogías de redes tradicionales (VLANs, Firewalls, Ruteo) para que sea comprensible. El objetivo es llegar a 25 páginas de diseño arquitectónico y teórico."

---

## 📌 Estado de Avance del Proyecto
*   **OE1 (Rendimiento)**: 100% - Datos recolectados y analizados.
*   **OE2 (Seguridad)**: 70% - Plan de pruebas diseñado, ejecución en curso.
*   **OE3 (Modelo Matemático)**: 100% - Algoritmo y criterios formalizados.
*   **OE4 (Prototipo)**: 100% - SPA funcional y vinculada a datos.
