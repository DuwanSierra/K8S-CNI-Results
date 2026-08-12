# INSTRUCCIONES PARA CLAUDE
## Validación y ajuste conservador de la tesis según los comentarios del profesor

## 1. Rol

Actúas como revisor técnico y editor académico de una tesis en LaTeX sobre la evaluación de CNIs en K3s/Kubernetes sobre DigitalOcean. Debes trabajar con evidencia del repositorio, conservar los datos del proyecto y realizar únicamente los ajustes aprobados por esta instrucción.

El objetivo no es rehacer la tesis. El objetivo es comprobar si los cambios realizados anteriormente responden al profesor y corregir solo los puntos que la evidencia confirme.

## 2. Comentarios que deben guiar la revisión

El profesor señaló estos problemas:

1. La numeración de capítulos, secciones, tablas y figuras es confusa.
2. Algunos elementos aparecen como capítulos aunque no funcionan como capítulos.
3. El orden de lectura no es fácil de seguir.
4. La lectura es densa.
5. Existe o existía un ítem vacío sobre el plano o modelo de la aplicación.
6. Debe revisarse el aplicativo desarrollado.
7. Debe verificarse el cumplimiento de los objetivos mediante evidencia del proyecto y del recomendador.

No conviertas estos comentarios en permiso para reestructurar toda la tesis. Cada modificación debe responder a uno de ellos o corregir un error comprobado de compilación, trazabilidad o coherencia.

## 3. Restricciones no negociables

### 3.1 Objetivos

- No modifiques el Objetivo General.
- No modifiques el texto de ningún Objetivo Específico.
- No cambies el orden de los objetivos.
- No agregues objetivos, subobjetivos, métricas ni criterios que no existan.
- Solo puedes revisar el estado de cumplimiento y su explicación cuando la evidencia del repositorio lo justifique.
- Si una conclusión no coincide con un objetivo, informa primero la discrepancia. No la corrijas inventando evidencia.

### 3.2 Datos y contenido técnico

- No cambies IP, CIDR, versiones, nombres de CNI, resultados numéricos, número de corridas, duración de pruebas, perfiles, comandos, nombres de archivos, rutas, parámetros, citas, etiquetas ni nombres de componentes.
- No inventes mediciones, pruebas, capturas, funcionalidades, marcos de seguridad, fuentes bibliográficas ni resultados.
- No elimines una afirmación técnica únicamente porque parezca extensa. Primero verifica su origen en el repositorio o en los datos.
- No elimines `\cite{}`, `\ref{}`, `\cref{}`, `\label{}`, ecuaciones, entornos matemáticos ni comandos LaTeX sin comprobar sus dependencias.
- No añadas citas nuevas. Usa `bib-search-citation` solo si aparece una referencia rota o una necesidad bibliográfica explícitamente aprobada.

### 3.3 Alcance de archivos

Comienza revisando únicamente estos archivos modificados anteriormente y los archivos activos mínimos que prueban el funcionamiento del aplicativo:

- `thesis/FormatoTesis.tex`
- `thesis/TesisUTB.sty`
- `thesis/chaptersApa/1_Introduccion.tex`
- `thesis/chaptersApa/M1_Metodologia.tex`
- `thesis/chaptersApa/M2_Diseno.tex`
- `thesis/chaptersApa/M3_Herramienta.tex`
- `thesis/chaptersApa/8_Resultados.tex`
- `cni-recommender-spa/src/App.jsx`
- `cni-recommender-spa/src/components/GuidedProfileBuilder.jsx`
- `cni-recommender-spa/src/components/ResultsEngine.jsx`
- `cni-recommender-spa/src/components/ImplementationSteps.jsx`
- `cni-recommender-spa/src/data/recommendationModel.js`

Lee otros archivos solo cuando una afirmación concreta no pueda verificarse con este conjunto. No hagas una lectura completa del repositorio ni de la documentación generada para resolver una duda que el código activo ya responde.

## 4. Regla central: validar antes de modificar

Trabaja en dos fases separadas.

### Fase A: auditoría sin cambios

Entrega primero un informe con:

- afirmación revisada;
- archivo y ubicación;
- evidencia encontrada;
- estado `CONFIRMADO`, `PARCIAL`, `NO CONFIRMADO` o `CONTRADICHO`;
- riesgo para la tesis;
- acción propuesta: `CONSERVAR`, `AJUSTAR`, `ELIMINAR` o `NO TOCAR`.

No edites ningún archivo fuente durante esta fase.

### Fase B: implementación controlada

Solo después de validar el informe y el plan, aplica los cambios confirmados. Si no existe aprobación explícita para continuar, detente después de la Fase A.

Antes de cada cambio, comprueba que:

1. el problema aparece realmente en el archivo;
2. el cambio responde a un comentario del profesor o a un error comprobado;
3. el cambio no altera datos ni jerarquía;
4. el texto resultante conserva la evidencia y las referencias;
5. el cambio tiene alcance local y no exige reescribir capítulos completos.

## 5. Hechos que ya fueron comprobados y deben distinguirse de hipótesis

Usa esta sección como punto de partida. No la copies ciegamente: vuelve a comprobar el estado actual si los archivos cambian.

### 5.1 Hechos confirmados

- `FormatoTesis.tex` integra la introducción, marco de referencia, metodología, diseño, herramienta, resultados, discusión y cierre mediante entradas activas.
- `TesisUTB.sty` define una numeración jerárquica basada en el capítulo para secciones, subsecciones y subsubsecciones.
- `M2_Diseno.tex` contiene una sección `Prototipo Recomendador` con propósito, entradas, datos, motor, salida y arquitectura por componentes.
- `M3_Herramienta.tex` contiene la implementación de la SPA y describe `GuidedProfileBuilder`.
- `App.jsx` importa y renderiza `GuidedProfileBuilder`, `ResultsEngine` e `ImplementationSteps`.
- `App.jsx` realiza una solicitud inicial a `cni-data.json` con `cache: 'no-store'` y usa datos de referencia si la descarga falla.
- La tabla de pruebas funcionales marca PF-06 y PF-08 como parciales y explica sus limitaciones.
- El texto de `M3_Herramienta.tex` repite literalmente la descripción inicial de Terraform, YAML y CronJobs. Esa redundancia sí está confirmada.

### 5.2 Afirmaciones que no deben tratarse como hechos sin nueva comprobación

- La estructura puede estar mejor organizada en el código fuente, pero no puede declararse corregida visualmente sin revisar el PDF compilado.
- La existencia de `GuidedProfileBuilder` no demuestra por sí sola que todas las funciones descritas en la tesis estén implementadas.
- La ausencia de `ProfileSelector` en `App.jsx` solo demuestra que no está integrado en el flujo activo. No significa que no aparezca en documentación histórica o generada.
- No afirmes que `ProfileSelector` fue eliminado de todo el repositorio si existen referencias en documentación no activa. Si no afecta al aplicativo ni al cuerpo de la tesis, no lo conviertas en una tarea.
- La presencia de tablas no demuestra que estén corregidas. Debe verificarse su composición, ancho y compilación.
- Una compilación anterior o un archivo `.log` no demuestra que la versión actual compile correctamente.

### 5.3 Corrección necesaria de la auditoría anterior

La auditoría anterior afirmó que OE2 estaba sobreafirmado porque mencionaba superficie de ataque y probabilidad de incidentes. Antes de repetir esa conclusión, compara el texto exacto del objetivo vigente en `1_Introduccion.tex` con la evidencia.

El objetivo vigente debe ser la única fuente para decidir qué se evalúa. No presentes como parte del objetivo términos que solo aparecen en una delimitación, una discusión o una versión anterior.

Si se conserva el estado `CUMPLIDO PARCIALMENTE` para OE2, justifícalo únicamente con una limitación demostrable del trabajo ejecutado y conserva el texto original del objetivo. No uses como justificación una métrica que el objetivo no solicita.

Para OE4, separa estrictamente:

- funciones demostradas por las pruebas PF-01 a PF-08;
- funciones que el prototipo entrega al usuario;
- funciones que la tesis afirma como configuración o despliegue;
- funciones que el aplicativo no ejecuta, como el despliegue automático, el sondeo durante la sesión o el reintento automático.

No conviertas una limitación funcional en una nueva característica. Ajusta la redacción del estado solo después de comprobarla contra el código activo.

## 6. Flujo de revisión de bajo consumo de tokens

### Paso 1: inventario mínimo

Identifica las entradas activas de `FormatoTesis.tex`, los niveles de sección de los capítulos involucrados, las tablas y figuras citadas, y las rutas de los componentes activos del recomendador. No leas archivos no relacionados.

### Paso 2: auditoría estructural

Comprueba:

- qué elementos usan `\chapter`, `\section`, `\subsection` y `\subsubsection`;
- si la numeración incluye el capítulo de forma coherente;
- si la tabla de contenido representa la jerarquía real;
- si una sección que el profesor podría interpretar como capítulo debe seguir siendo sección;
- si cada `\ref` y `\cref` apunta a una etiqueta existente;
- si las tablas y figuras se citan después de presentarse o mediante una referencia comprensible.

No cambies niveles de sección por preferencia estética. Solo hazlo si la jerarquía actual contradice la estructura académica del documento y puedes demostrarlo con el PDF o con la organización fuente.

### Paso 3: auditoría de legibilidad

Revisa solo los bloques que afectan directamente la lectura indicada por el profesor:

- párrafos con varias ideas independientes;
- repeticiones entre introducción, diseño, implementación y resultados;
- transiciones sin función lógica;
- explicaciones que repiten una tabla completa;
- títulos que anuncian un contenido distinto del que aparece debajo.

Conserva el contenido técnico. Reescribe localmente, divide párrafos cuando sea necesario y deja las métricas en la tabla cuando ya estén tabuladas. No reduzcas la precisión para hacer el texto más corto.

### Paso 4: auditoría del apartado de aplicación

Comprueba que el cuerpo de la tesis describa, sin exagerar:

- el propósito del recomendador;
- las entradas del usuario;
- el origen de los datos;
- el motor MCDA;
- la salida que realmente entrega;
- los componentes activos de la SPA;
- las limitaciones observadas en PF-06 y PF-08.

Si el contenido ya existe y está respaldado, no agregues otra subsección. Si una afirmación excede el código activo, reduce la afirmación al comportamiento comprobado.

### Paso 5: auditoría de objetivos

Construye una matriz interna con cuatro columnas: objetivo exacto, evidencia documental, evidencia del repositorio y estado. No cambies el texto del objetivo.

Usa únicamente estos estados:

- `CUMPLIDO`: toda la acción observable del objetivo tiene evidencia suficiente;
- `CUMPLIDO PARCIALMENTE`: existe evidencia de una parte, pero otra parte explícita no se ejecutó, midió o verificó;
- `NO VERIFICADO`: la tesis afirma la acción, pero no hay evidencia suficiente;
- `NO CUMPLIDO`: la evidencia contradice la acción esperada.

No uses `CUMPLIDO` para ocultar una limitación que afecta directamente al verbo del objetivo. Tampoco uses `CUMPLIDO PARCIALMENTE` por una limitación que no pertenece al objetivo.


### Paso 6: verificación final

Antes de terminar, comprueba:

- que los objetivos siguen idénticos;
- que los datos técnicos siguen idénticos;
- que no se eliminaron citas, referencias o etiquetas válidas;
- que ninguna afirmación del cuerpo contradice el aplicativo activo;
- que OE2 y OE4 tienen estados coherentes con su evidencia;
- que `ProfileSelector` no se presenta como componente activo si no está integrado;
- que la estructura no contiene capítulos nuevos ni capítulos artificiales;
- que las tablas afectadas no desbordan ni se sobreponen;
- que la compilación y el PDF se revisaron después de los cambios, si el entorno lo permite.

Si no puedes comprobar la compilación visual, declara esa limitación. No declares que el documento quedó listo para entrega.


## 8. Formato obligatorio de la respuesta de Claude

### Fase A: informe sin cambios

Entrega un `.md` con estas secciones:

1. `Resumen ejecutivo`.
2. `Archivos realmente revisados`.
3. `Hechos confirmados`.
4. `Afirmaciones previas corregidas o no confirmadas`.
5. `Matriz de objetivos`.
6. `Hallazgos del profesor: cumplido, parcial o pendiente`.
7. `Plan de cambios mínimo`.
8. `Riesgos y puntos que no deben modificarse`.

Cada hallazgo debe incluir archivo, ubicación, evidencia y decisión. No incluyas cambios hipotéticos como si ya fueran problemas.

### Fase B: cambios aprobados

Cuando se autorice la implementación:

- modifica únicamente los archivos incluidos en el plan aprobado;
- entrega un resumen por archivo;
- conserva el diff mínimo;
- explica cualquier punto que no pueda verificarse;
- vuelve a revisar la matriz de objetivos;
- informa si la compilación visual no pudo realizarse.

## 9. Criterio de éxito

La tarea solo se considera completa cuando el lector puede seguir la jerarquía del documento, localizar tablas y figuras, entender la aplicación desarrollada y distinguir con claridad entre funciones demostradas, limitaciones y trabajo futuro.

El resultado debe ser más claro y verificable, pero no más ambicioso que los datos reales del proyecto.
