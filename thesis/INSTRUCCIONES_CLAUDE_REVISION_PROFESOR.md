# Instrucciones para Claude: Revisión estructural de tesis y cumplimiento de objetivos

## Contexto del comentario del profesor

El profesor reporta cuatro problemas principales:

1. La numeración de capítulos, subtítulos, tablas y figuras resulta confusa.
2. Hay demasiados capítulos que en realidad deberían ser secciones internas.
3. La lectura es densa y cuesta seguir el orden argumental.
4. Hay un ítem sobre el plano/modelo/arquitectura de la aplicación que parece vacío o insuficiente.
5. Debe verificarse el cumplimiento total de los objetivos mediante el recomendador desarrollado.

El objetivo de esta tarea es corregir la estructura académica y la trazabilidad sin alterar datos técnicos no verificados.

## Reglas duras

- No modificar el Objetivo General ni los Objetivos Específicos.
- No inventar métricas, resultados, versiones, fechas, porcentajes, URLs, comandos ni nombres de herramientas.
- No cambiar datos del proyecto si no están respaldados por archivos del repositorio.
- No modificar los resultados experimentales salvo para moverlos, referenciarlos o mejorar su redacción.
- No cambiar el sentido de los objetivos.
- No reestructurar capítulos de forma masiva sin validar primero el impacto en índice, referencias y narrativa.
- No eliminar evidencia técnica; moverla a anexos si está sobrecargando el cuerpo.
- No editar repositorios de infraestructura o aplicaciones salvo que sea necesario para verificar el cumplimiento del recomendador.
- Priorizar cambios en `K8S-CNI-Results/thesis`.
- Mantener el documento en español académico.
- Si un dato no se puede verificar, dejar comentario LaTeX `% TODO-VERIFICAR:` en lugar de inventarlo.
- Premisa fundamental: validar antes de modificar. Primero diagnosticar, luego proponer, y solo después editar.

## Estrategia de bajo consumo de tokens

No leas todo el proyecto completo. Sigue este orden:

1. Leer solo el archivo maestro:
   - `K8S-CNI-Results/thesis/FormatoTesis.tex`

2. Leer solo encabezados y estructura de:
   - `K8S-CNI-Results/thesis/chaptersApa/*.tex`

3. Leer completos únicamente estos archivos, porque son los que concentran el problema del profesor:
   - `K8S-CNI-Results/thesis/TesisUTB.sty`
   - `K8S-CNI-Results/thesis/chaptersApa/1_Introduccion.tex`
   - `K8S-CNI-Results/thesis/chaptersApa/3_Planteamiento_del_Problema.tex`
   - `K8S-CNI-Results/thesis/chaptersApa/4_Justificación.tex`
   - `K8S-CNI-Results/thesis/chaptersApa/5_Objetivos.tex`
   - `K8S-CNI-Results/thesis/chaptersApa/M1_Metodologia.tex`
   - `K8S-CNI-Results/thesis/chaptersApa/M2_Diseno.tex`
   - `K8S-CNI-Results/thesis/chaptersApa/M3_Herramienta.tex`
   - `K8S-CNI-Results/thesis/chaptersApa/8_Resultados.tex`
   - `K8S-CNI-Results/thesis/chaptersApa/9_Discusión.tex`
   - `K8S-CNI-Results/thesis/chaptersApa/10_Conclusiones.tex`

4. Leer solo fragmentos específicos de anexos cuando una referencia lo exija:
   - `K8S-CNI-Results/thesis/chaptersApa/14.0_Apendice_A.tex`
   - `K8S-CNI-Results/thesis/chaptersApa/14.1_Apendice_OE2.tex`
   - `K8S-CNI-Results/thesis/chaptersApa/14.2_Apendice_OE3.tex`
   - `K8S-CNI-Results/thesis/chaptersApa/AnexoA_Manual_Usuario.tex`
   - `K8S-CNI-Results/thesis/chaptersApa/AnexoB_Manual_Instalacion.tex`

5. Para verificar el recomendador, inspeccionar solo:
   - `K8S-CNI-Results/cni-recommender-spa/src/App.jsx`
   - `K8S-CNI-Results/cni-recommender-spa/src/data/recommendationModel.js`
   - `K8S-CNI-Results/cni-recommender-spa/src/components/*.jsx`
   - `K8S-CNI-Results/docs/recommender/cni-data.json`
   - `K8S-CNI-Results/results/processed/thesis_data.json`

## Diagnóstico inicial ya observado

### Problema A: archivo maestro con estructura confusa

El archivo real del documento APA parece ser:

```text
K8S-CNI-Results/thesis/FormatoTesis.tex
```

Este archivo incluye capítulos en este orden:

```latex
\input{chaptersApa/1_Introduccion}
\input{chaptersApa/3_Planteamiento_del_Problema}
\input{chaptersApa/4_Justificación}
\input{chaptersApa/5_Objetivos}
\input{chaptersApa/6_Marco_Teórico-Conceptual}
\input{chaptersApa/2_Estado_del_arte}
\input{chaptersApa/M1_Metodologia}
\input{chaptersApa/M2_Diseno}
\input{chaptersApa/M3_Herramienta}
\input{chaptersApa/M4_Desarrollo_Sprints}
\input{chaptersApa/8_Resultados}
\input{chaptersApa/9_Discusión}
\input{chaptersApa/10_Conclusiones}
\input{chaptersApa/11_Recomendaciones}
\input{chaptersApa/12_Trabajo_Futuro}
```

Esto genera una lectura con demasiados capítulos y un orden conceptual poco natural.

### Problema B: numeración de secciones alterada

En `K8S-CNI-Results/thesis/TesisUTB.sty` aparece:

```latex
\renewcommand\thesection{\arabic{section}}
```

Esto elimina el número de capítulo de las secciones. En una tesis tipo `book`, eso confunde al lector porque varias secciones de distintos capítulos pueden aparecer como `1`, `2`, `3` sin contexto.

Claude debe corregir esto.

### Problema C: labels duplicados

Se detectaron duplicados entre capítulos principales y apéndices. Ejemplos:

- `sec:apb2_limitaciones`
- `tab:apb2_limitaciones`
- `sec:apb2_overhead`
- `sec:apb_criterios`
- `tab:apb_criterios`
- `sec:apb_umbrales`
- `eq:apb_minmax_inv`
- `sec:apb_ponderaciones`
- `tab:apb_pesos`
- `sec:apb_mcda`
- `sec:apb2_alcance`
- `sec:apb2_verbos`
- `tab:apb2_verbos`
- `sec:apb2_matriz`
- `tab:apb2_matriz_ext`
- `sec:apb2_mapeo`
- `tab:apb2_mapeo`

Claude debe renombrar labels duplicados de forma sistemática y actualizar todas las referencias.

### Problema D: Prototipo Recomendador en diseño queda insuficiente

En `chaptersApa/M2_Diseno.tex`, la sección:

```latex
\section{Prototipo Recomendador}
```

tiene un desarrollo corto. El profesor puede percibirla como vacía porque no muestra suficientemente el modelo/plano de la aplicación.

Claude debe ampliarla con contenido verificado desde:

- `chaptersApa/14.0_Apendice_A.tex`, sección OE4.
- `chaptersApa/8_Resultados.tex`, sección del prototipo recomendador.
- Código del aplicativo en `cni-recommender-spa/src`.

No inventar arquitectura. Debe describir solo lo verificable.

## Objetivo final de edición

No se busca rehacer la tesis. Se busca ajustar lo mínimo necesario para responder al comentario del profesor:

- Que la numeración sea comprensible.
- Que el índice no parezca una lista de capítulos artificiales.
- Que tablas y figuras se ubiquen fácilmente.
- Que la sección del modelo/plano del aplicativo no parezca vacía.
- Que el cumplimiento de objetivos sea verificable mediante evidencia documental y del recomendador.

El flujo ideal de lectura debe quedar claro, sin cambiar la esencia del documento:

1. Problema y objetivos.
2. Marco teórico y estado del arte.
3. Metodología y diseño.
4. Implementación de la herramienta/testbed.
5. Resultados y verificación de objetivos.
6. Discusión.
7. Conclusiones, recomendaciones y trabajo futuro.
8. Anexos técnicos.

## Cambios estructurales requeridos

Antes de ejecutar cualquier cambio estructural, Claude debe producir un diagnóstico corto con:

1. Estructura actual.
2. Problema que causa confusión.
3. Cambio mínimo propuesto.
4. Riesgo del cambio.
5. Archivos afectados.

Solo aplicar cambios cuando el diagnóstico indique que son necesarios.

### 1. Revisar capítulos introductorios

Evaluar si estos capítulos independientes realmente deben mantenerse como capítulos:

- `3_Planteamiento_del_Problema.tex`
- `4_Justificación.tex`
- `5_Objetivos.tex`

La meta es evitar capítulos demasiado cortos o artificiales. No cambiar contenido de objetivos.

#### Opción recomendada

Si la tabla de contenido confirma la confusión del profesor, integrar estos contenidos dentro de `chaptersApa/1_Introduccion.tex` como secciones. Mantener intacto el texto del Objetivo General y los Objetivos Específicos.

```latex
\chapter{Introducción}

\section{Contexto y motivación}
\section{Planteamiento del problema}
\section{Justificación}
\section{Objetivos}
\subsection{Objetivo general}
\subsection{Objetivos específicos}
\section{Alcance del trabajo}
\section{Estructura del documento}
```

Después, en `FormatoTesis.tex`, eliminar o comentar:

```latex
\input{chaptersApa/3_Planteamiento_del_Problema}
\input{chaptersApa/4_Justificación}
\input{chaptersApa/5_Objetivos}
```

No eliminar los archivos fuente; solo dejar de incluirlos si su contenido fue integrado.

Si esta integración altera demasiadas referencias o genera riesgo, no hacerla. En ese caso, dejar recomendación documentada y corregir solo numeración/TOC.

### 2. Revisar marco teórico y estado del arte

El marco teórico y el estado del arte pueden permanecer como capítulos separados si la universidad lo permite. No consolidarlos automáticamente.

Solo si el índice sigue excesivamente fragmentado, proponer esta alternativa sin aplicarla de inmediato:

```latex
\chapter{Marco de Referencia}
\section{Marco teórico-conceptual}
\section{Estado del arte}
\section{Brecha de investigación}
```

Si se conservan como dos capítulos, asegurar que:

- `Marco Teórico - Conceptual` aparezca antes que `Estado del Arte`.
- El estado del arte cierre con una brecha clara que conecte con los objetivos.

### 3. Revisar metodología, diseño e implementación

Actualmente hay:

- `M1_Metodologia.tex`
- `M2_Diseno.tex`
- `M3_Herramienta.tex`
- `M4_Desarrollo_Sprints.tex`

Esto puede leerse como cuatro capítulos de desarrollo, aunque varios son partes de una misma metodología. No fusionarlos automáticamente.

#### Opción conservadora recomendada

Mantener la estructura actual si las referencias dependen de ella, pero renombrar o ajustar títulos para que indiquen función clara:

```latex
\chapter{Metodología}
\chapter{Diseño de la Solución}
\chapter{Implementación de la Solución}
```

Evaluar mover `M4_Desarrollo_Sprints.tex` dentro de `M1_Metodologia.tex` como:

```latex
\section{Plan de desarrollo por sprints}
```

No moverlo si el cambio afecta significativamente numeración, referencias o narrativa. En ese caso, solo renombrar el capítulo o reducirlo.

### 4. Clarificar el capítulo de implementación

Renombrar:

```latex
\chapter{La Herramienta: Implementación y Despliegue}
```

a:

```latex
\chapter{Implementación de la Solución}
```

Motivo: el capítulo no solo describe una herramienta. También cubre infraestructura, K3s, GitOps, observabilidad, benchmarks, MCDA y Network Policies.

Aplicar solo si el título actual aparece en el índice como fuente de confusión.

### 5. Separar diseño del aplicativo y validación del aplicativo

En `M2_Diseno.tex`, la sección `Prototipo Recomendador` debe explicar diseño:

- Propósito del recomendador.
- Entrada: preferencias del usuario/perfil.
- Datos consumidos: `cni-data.json` o `thesis_data.json`, según corresponda.
- Motor de decisión: normalización + ponderación MCDA.
- Salida: ranking, recomendación e instrucciones de instalación.
- Capas/componentes de la SPA verificables desde código.

En `8_Resultados.tex`, la sección del prototipo debe explicar validación:

- Capturas.
- Pruebas funcionales PF-01 a PF-08.
- Integridad de datos extremo a extremo.
- Relación con OE4.

No repetir la misma explicación en ambos capítulos.

## Cambios de numeración

### 1. Corregir numeración de secciones

En `TesisUTB.sty`, reemplazar:

```latex
\renewcommand\thesection{\arabic{section}}
```

por:

```latex
\renewcommand\thesection{\thechapter.\arabic{section}}
\renewcommand\thesubsection{\thesection.\arabic{subsection}}
\renewcommand\thesubsubsection{\thesubsection.\arabic{subsubsection}}
```

Si LaTeX ya lo hace por defecto, preferir comentar la línea problemática y dejar la configuración por defecto de `book`.

Este cambio sí es prioritario, porque responde directamente al comentario del profesor sobre numeración.

### 2. Revisar profundidad del índice

Actualmente:

```latex
\setcounter{secnumdepth}{3}
\setcounter{tocdepth}{3}
```

Esto puede hacer la tabla de contenido demasiado densa.

Recomendación:

```latex
\setcounter{secnumdepth}{3}
\setcounter{tocdepth}{2}
```

Así se numeran subsubsecciones, pero el índice no se sobrecarga.

### 3. Tablas y figuras

Mantener numeración por capítulo:

- Tabla 4.1, Tabla 4.2, etc.
- Figura 4.1, Figura 4.2, etc.

No usar numeración manual en captions.

Verificar que todos los `\caption{}` tengan un `\label{}` inmediatamente después.

## Corrección de labels duplicados

Claude debe ejecutar una revisión de labels:

```powershell
rg -n "\\label\\{([^}]*)\\}" K8S-CNI-Results/thesis/chaptersApa
```

Regla de nombres:

- Labels del cuerpo principal:
  - `chap:`
  - `sec:`
  - `subsec:`
  - `tab:`
  - `fig:`
  - `eq:`

- Labels de anexos:
  - `anx:`
  - `anxsec:`
  - `anxtab:`
  - `anxfig:`
  - `anxeq:`

Ejemplo:

```latex
\label{sec:apb2_limitaciones}
```

en un anexo debe cambiarse a:

```latex
\label{anxsec:apb2_limitaciones}
```

Actualizar todas las referencias relacionadas.

No cambiar labels si no hay duplicado o si no hay referencia.

## Cumplimiento de objetivos

Claude debe construir una matriz de trazabilidad final, preferiblemente en `8_Resultados.tex` o al final de `10_Conclusiones.tex`.

No modificar la formulación de los objetivos en `5_Objetivos.tex`. La matriz debe citar los objetivos tal como están.

La matriz debe tener estas columnas:

1. Objetivo específico.
2. Evidencia en el documento.
3. Evidencia en el repositorio/aplicativo.
4. Estado.
5. Observación o limitación.

Base verificable:

### OE1

Objetivo: evaluar rendimiento de Calico, Cilium, Flannel y Antrea.

Evidencias:

- `results/cni-benchmarks/*/throughput_tcp`
- `results/cni-benchmarks/*/latency_tcp_connect`
- `results/cni-benchmarks/*/resource_usage_nodes`
- Tablas de throughput, latencia y consumo en `8_Resultados.tex`.

### OE2

Objetivo: evaluar Network Policies y reducción de superficie de ataque.

Evidencias:

- `K8s-Tesis-Apps/network_policies`
- Casos `zero_trust`, `multi_tier`, `egress_block`
- Resultados de seguridad en `8_Resultados.tex`
- Apéndice OE2.

Limitación que debe conservarse:

- Flannel no implementa enforcement de Network Policies en el plano de datos.

### OE3

Objetivo: criterios, umbrales y ponderación MCDA.

Evidencias:

- `K8S-CNI-Results/docs/procesador.js`
- `K8S-CNI-Results/results/processed/thesis_data.json`
- Apéndice OE3.
- Tablas de normalización y scoring MCDA.

### OE4

Objetivo: prototipo funcional que recomiende y configure CNI.

Evidencias:

- `K8S-CNI-Results/cni-recommender-spa`
- `K8S-CNI-Results/docs/recommender`
- `K8S-CNI-Results/docs/recommender/cni-data.json`
- `K8S-CNI-Results/cni-recommender-spa/src/data/recommendationModel.js`
- Capturas `figures/rec_*.png`
- Pruebas PF-01 a PF-08 en `8_Resultados.tex`
- Manual de usuario e instalación.

Claude debe verificar que el aplicativo:

- Carga datos reales.
- Calcula ranking por perfiles.
- Muestra recomendación.
- Expone justificación de métricas.
- Incluye guía o instrucciones de instalación.

Si alguna de estas partes no existe en el código, no afirmar que está cumplida. Marcar como `PARCIAL` y explicar qué falta.

## Densidad de lectura

Claude debe reducir densidad sin borrar evidencia:

- Párrafos máximos: 4 oraciones.
- Oraciones objetivo: 20 a 28 palabras.
- Si una tabla ya contiene datos, la prosa debe interpretar, no repetir.
- Mover listas muy largas, comandos y matrices extendidas a anexos.
- En el cuerpo principal, dejar solo síntesis, método, resultados clave e interpretación.
- Eliminar frases de relleno:
  - "es importante destacar"
  - "se puede observar"
  - "cabe resaltar"
  - "claramente"
  - "notablemente"
  - "de manera significativa" si no hay prueba estadística.

## Tratamiento de tablas y figuras

No rehacer todas las tablas visualmente en esta tarea. Solo corregir:

- Numeración.
- Captions.
- Labels.
- Referencias.
- Desbordes.
- Duplicados.

Si una tabla es demasiado ancha:

- Usar `tabularx`.
- Usar `p{Xcm}` o `Y`.
- Reducir `\tabcolsep`.
- Usar `\scriptsize`.
- Si sigue desbordando, moverla a anexo o partirla en dos tablas.

No convertir tablas con bordes visibles a `booktabs` si eso contradice la preferencia visual actual del documento.

## Orden recomendado de edición

1. Crear copia de seguridad o trabajar en rama.
2. Corregir `TesisUTB.sty` para numeración de secciones.
3. Reorganizar `FormatoTesis.tex`.
4. Consolidar capítulos pequeños dentro de Introducción.
5. Integrar `M4_Desarrollo_Sprints.tex` dentro de Metodología.
6. Renombrar `M3_Herramienta.tex` conceptualmente como Implementación de la Solución.
7. Ampliar `M2_Diseno.tex` en la sección `Prototipo Recomendador`.
8. Depurar duplicados de labels.
9. Revisar y actualizar referencias rotas.
10. Verificar cumplimiento de objetivos contra repositorio y aplicativo.
11. Compilar LaTeX.
12. Revisar PDF generado: índice, numeración, lista de tablas, lista de figuras y páginas donde aparecen tablas anchas.

## Criterios de aceptación

La tarea termina solo si se cumple todo:

- El índice muestra una jerarquía clara, sin capítulos artificiales para planteamiento, justificación y objetivos.
- La numeración de secciones incluye capítulo, por ejemplo `3.1`, `3.2`, `4.1`.
- Tablas y figuras tienen numeración coherente por capítulo.
- No hay labels duplicados.
- No hay referencias rotas.
- La sección del prototipo en diseño explica el modelo/plano de la aplicación.
- La sección de resultados verifica el aplicativo contra OE4.
- La matriz de cumplimiento de objetivos referencia evidencia documental y del repositorio.
- El PDF compila sin errores críticos.
- No se modificaron datos no verificados.
- El Objetivo General y los Objetivos Específicos conservan su redacción original.
- Todo cambio estructural aplicado fue precedido por validación del problema.

## Entrega esperada de Claude

Claude debe entregar:

1. Lista de archivos modificados.
2. Resumen de cambios por problema del profesor.
3. Matriz de cumplimiento de criterios de aceptación.
4. Validaciones realizadas antes de modificar.
5. Resultado de compilación si estuvo disponible en el entorno.
6. Advertencias pendientes si algún dato no pudo verificarse.
