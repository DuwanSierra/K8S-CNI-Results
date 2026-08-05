# Instrucciones para Claude: revisión final según observaciones del profesor

## 1. Propósito de esta tarea

Revisar y ajustar la tesis únicamente en los puntos señalados por el profesor:

1. Numeración confusa de capítulos, secciones, tablas y figuras.
2. Exceso de capítulos o apartados con jerarquía inadecuada.
3. Lectura densa y difícil de seguir.
4. Apartado insuficiente o aparentemente vacío sobre el plano, modelo o arquitectura de la aplicación.
5. Verificación del aplicativo y del cumplimiento real de los objetivos propuestos.

Esta tarea no autoriza una reescritura general de la tesis. El criterio rector es aplicar el cambio mínimo que resuelva cada observación comprobada.

## 2. Premisa fundamental

**No modificar antes de validar.**

Claude debe separar siempre tres acciones:

1. **Comprobar:** identificar el problema en el documento actual.
2. **Contrastar:** verificarlo contra LaTeX, código, resultados o evidencia del repositorio.
3. **Corregir:** editar solo cuando las dos acciones anteriores sustenten el cambio.

Si la evidencia es insuficiente o contradictoria, Claude no debe completar el vacío mediante inferencias. Debe conservar el contenido y registrar el asunto como pendiente en el informe final, sin insertar datos inventados ni comentarios de verificación dentro de la tesis.

## 3. Restricciones no negociables

- No modificar el Objetivo General.
- No modificar ninguno de los Objetivos Específicos.
- No resumir, parafrasear, ampliar ni corregir gramaticalmente los objetivos.
- No cambiar métricas, resultados, versiones, fechas, porcentajes, CIDR, nombres de archivos, rutas, herramientas o configuraciones sin evidencia directa.
- No crear resultados, pruebas, diagramas, componentes, funcionalidades ni relaciones arquitectónicas que no existan en el proyecto.
- No modificar código del aplicativo o infraestructura para hacer coincidir la tesis con una afirmación documental.
- No declarar una funcionalidad como implementada solo porque aparece en una captura, tabla, manual o texto previo.
- No declarar un objetivo como cumplido si la evidencia solo demuestra una parte de su alcance.
- No alterar archivos no incluidos por `FormatoTesis.tex`, salvo que una referencia activa obligue a revisarlos.
- No eliminar evidencia técnica. Si su detalle resulta excesivo, solo puede trasladarse a un anexo con sus referencias actualizadas.
- No realizar fusiones masivas de capítulos después de que la estructura ya haya sido corregida.
- No agregar bibliografía para respaldar datos propios del proyecto.
- No usar fuentes externas para sustituir evidencia experimental faltante.
- Mantener LaTeX válido, español académico y terminología técnica consistente.
- Preservar todas las referencias y citas válidas.

## 4. Skills obligatorias y orden de uso

Claude debe usar las skills registradas en `skills-lock.json` en este orden. Cada skill se aplica solo al alcance indicado para evitar consumo innecesario de tokens.

### 4.1 `paper-audit`: diagnóstico focalizado

Aplicar `deep-review` únicamente sobre:

- jerarquía y numeración visibles;
- densidad de lectura;
- apartado de diseño del recomendador;
- afirmaciones de cumplimiento de OE1 a OE4;
- coherencia entre resultados, conclusiones y limitaciones.

No ejecutar una revisión lingüística de toda la tesis en esta fase. El resultado debe ser una lista breve de hallazgos con archivo, apartado, evidencia y severidad.

### 4.2 `academic-researcher`: trazabilidad académica

Usar esta skill para:

- comparar pregunta, metodología, evidencia, resultado y conclusión;
- distinguir resultado medido de interpretación;
- identificar limitaciones que impiden afirmar cumplimiento total;
- construir la matriz de trazabilidad de objetivos sin alterar sus enunciados;
- verificar que las conclusiones respondan a los objetivos con el mismo grado de certeza que la evidencia.

### 4.3 `bib-search-citation`: control selectivo de soporte

Usar esta skill solo cuando una afirmación teórica existente requiera comprobar su cita actual.

- No abrir una búsqueda bibliográfica general.
- No agregar citas para justificar métricas propias.
- No reemplazar resultados del repositorio por afirmaciones de literatura.
- Si una cita no puede comprobarse con los recursos disponibles, conservarla y reportarla; no inventar metadatos.

### 4.4 `latex-paper-en`: edición final y localizada

Aplicar sus módulos únicamente a los párrafos marcados por la auditoría, en este orden:

1. `deai` para eliminar marcos vacíos y tono mecánico.
2. `long sentence` para dividir oraciones extensas sin cambiar datos.
3. `improve writing` o `academic tone` para recuperar precisión técnica.

Aunque la skill incluya `en` en su nombre, toda la salida debe permanecer en español. No aplicar una reescritura global.

## 5. Presupuesto de lectura y tokens

Claude debe distribuir su esfuerzo así:

| Fase | Porcentaje orientativo | Alcance |
|---|---:|---|
| Mapa estructural | 15 % | Archivo maestro, estilo, índice y encabezados |
| Observaciones del profesor | 20 % | Solo apartados directamente afectados |
| Aplicativo y objetivos | 30 % | Evidencia mínima de OE1--OE4 y código del recomendador |
| Correcciones | 25 % | Cambios validados y localizados |
| Verificación final | 10 % | Compilación, referencias, PDF y trazabilidad |

Reglas de ahorro:

- No leer todos los archivos completos.
- No releer un archivo si ya se extrajo la evidencia necesaria.
- Leer primero encabezados, referencias y fragmentos cercanos al hallazgo.
- Abrir un anexo solo cuando el cuerpo principal lo cite como evidencia.
- Abrir resultados crudos solo para resolver una discrepancia concreta.
- No analizar archivos generados, dependencias, paquetes o recursos sin relación con los cinco comentarios del profesor.
- Detener una línea de revisión cuando el criterio de aceptación correspondiente ya esté demostrado.

## 6. Fuentes prioritarias

### Nivel 1: mapa del documento

Revisar primero:

- `thesis/FormatoTesis.tex`.
- `thesis/TesisUTB.sty`.
- Tabla de contenido, lista de tablas y lista de figuras generadas, si están disponibles.
- Solo los comandos de capítulo, sección, subsección, caption, label y referencia de `thesis/chaptersApa`.

### Nivel 2: contenido directamente señalado

Leer completos únicamente los bloques relevantes de:

- `thesis/chaptersApa/1_Introduccion.tex`.
- `thesis/chaptersApa/M1_Metodologia.tex`.
- `thesis/chaptersApa/M2_Diseno.tex`.
- `thesis/chaptersApa/M3_Herramienta.tex`.
- `thesis/chaptersApa/8_Resultados.tex`.
- `thesis/chaptersApa/9_Discusión.tex`.
- `thesis/chaptersApa/10_Conclusiones.tex`.

Los antiguos archivos independientes de planteamiento, justificación y objetivos solo deben consultarse para confirmar que ya no se incluyan. No deben reintegrarse ni modificarse.

### Nivel 3: evidencia del aplicativo

Para OE4 y el apartado del modelo/plano, revisar solo lo necesario en:

- `cni-recommender-spa/src/App.jsx`.
- `cni-recommender-spa/src/data/recommendationModel.js`.
- Componentes importados realmente por `App.jsx`.
- Archivos de datos consumidos realmente por la SPA.
- Manuales y capturas únicamente como evidencia secundaria.

No describir componentes que existen como archivos pero no forman parte del flujo activo de la aplicación.

### Nivel 4: evidencia de OE1, OE2 y OE3

Abrir solo las fuentes citadas por la matriz de trazabilidad:

- resultados procesados y, si hay conflicto, la corrida cruda correspondiente;
- casos de Network Policies usados en las pruebas;
- lógica de IQR, normalización y MCDA;
- anexos OE2 y OE3 en los apartados referenciados.

## 7. Fase A: diagnóstico previo obligatorio

Antes de editar, Claude debe crear una tabla de control interna con estas columnas:

| ID | Observación del profesor | Estado actual | Evidencia | Cambio mínimo | Riesgo |
|---|---|---|---|---|---|

Estados permitidos:

- `RESUELTO`: el documento actual ya satisface el comentario.
- `PARCIAL`: existe una mejora, pero aún queda una inconsistencia verificable.
- `PENDIENTE`: el problema sigue presente.
- `NO VERIFICABLE`: falta evidencia suficiente.

No editar un punto marcado `RESUELTO`. No editar un punto `NO VERIFICABLE` para hacerlo parecer resuelto.

## 8. Punto 1 del profesor: numeración y ubicación

### 8.1 Capítulos y apartados

Verificar en el documento compilado que:

- cada sección incluya el número de su capítulo;
- las subsecciones conserven una jerarquía inequívoca;
- el índice no muestre archivos introductorios como capítulos independientes;
- el orden del índice coincida con el orden real de lectura;
- los encabezados no mezclen numeración manual con numeración automática.

La introducción ya debe contener planteamiento, justificación y objetivos como secciones. Si esto ya ocurre, no volver a mover ni duplicar esos contenidos.

### 8.2 Tablas y figuras

Verificar que:

- la numeración sea automática y consistente por capítulo;
- cada `caption` tenga un `label` único colocado inmediatamente después;
- cada mención textual use una referencia LaTeX válida;
- la lista de tablas y la lista de figuras coincidan con el PDF;
- ninguna tabla o figura cambie de número por numeración escrita manualmente;
- los captions describan el contenido sin introducir conclusiones nuevas.

Corregir solamente captions, labels, referencias o configuración de contadores que causen una inconsistencia comprobada.

### 8.3 Labels

Identificar labels duplicados solo entre archivos incluidos en la compilación actual. Renombrar el mínimo conjunto necesario y actualizar todas sus referencias.

No renombrar labels únicos por razones estéticas. No corregir duplicados presentes únicamente en archivos históricos que no se compilan.

## 9. Punto 2 del profesor: demasiados capítulos

Evaluar la estructura actual, no la estructura histórica del repositorio.

La consolidación de planteamiento, justificación y objetivos dentro de la introducción debe conservarse si ya está aplicada. `M4_Desarrollo_Sprints.tex` no debe reincorporarse como capítulo si el archivo maestro ya dejó de incluirlo.

Para cada capítulo activo, comprobar:

- propósito académico propio;
- extensión suficiente;
- continuidad con el capítulo anterior y el siguiente;
- ausencia de contenido que pertenezca claramente a otro capítulo.

No fusionar capítulos solo por ser cortos. Una fusión adicional requiere demostrar que el capítulo carece de función independiente y que el cambio reduce la confusión sin romper referencias.

Prioridad conservadora:

1. Mantener la estructura ya corregida.
2. Mejorar títulos o párrafos de enlace si el recorrido aún resulta ambiguo.
3. Fusionar únicamente si las dos opciones anteriores no resuelven el problema.

## 10. Punto 3 del profesor: densidad de lectura

La reducción de densidad se limita a los capítulos directamente relacionados con diseño, implementación, resultados y conclusiones.

Marcar para edición solo párrafos que cumplan al menos uno de estos criterios:

- más de cuatro oraciones;
- oración superior a 25 palabras sin necesidad técnica;
- repetición literal de datos ya presentados en una tabla;
- lista de detalles que interrumpe el argumento principal;
- frase introductoria vacía;
- conclusión más fuerte que la evidencia citada.

Reglas de edición:

- Conservar métricas, nombres, referencias y significado.
- Usar un párrafo para una idea técnica principal.
- Interpretar tablas sin recitar todas sus celdas.
- Mantener en el cuerpo: método, resultado clave, interpretación y limitación.
- Mantener en anexos: comandos extensos, configuraciones completas, matrices detalladas y evidencia de reproducción.
- Evitar `se puede observar`, `es importante destacar`, `cabe resaltar`, `claramente` y `notablemente`.
- Usar verbos técnicos precisos: `registra`, `calcula`, `enruta`, `encapsula`, `aplica`, `rechaza`, `consume` y `expone`.
- No introducir causalidad si el experimento solo demuestra asociación.

No medir el éxito por la cantidad de texto reducido. El objetivo es mejorar el seguimiento del argumento sin perder evidencia.

## 11. Punto 4 del profesor: plano, modelo o arquitectura de la aplicación

Localizar el apartado al que puede referirse el profesor y comprobar si ahora contiene información sustantiva. La revisión debe distinguir:

- diseño previsto;
- componentes realmente integrados;
- flujo real de datos;
- validación funcional mostrada en resultados.

El apartado de diseño del recomendador debe explicar, solo con evidencia del código activo:

1. propósito del prototipo;
2. entradas proporcionadas por el usuario;
3. fuente de datos realmente cargada;
4. transformación o normalización aplicada;
5. cálculo del ranking MCDA;
6. componentes activos de la interfaz;
7. salida presentada al usuario;
8. relación entre recomendación e instrucciones de instalación.

Si se conserva o crea un plano visual, cada componente y conexión debe corresponder con una importación, función, archivo de datos o flujo verificable. El texto debe referenciar la figura y explicar el recorrido de los datos, no limitarse a anunciarla.

Restricción conocida: `ProfileSelector` no forma parte de la aplicación activa y fue retirado. No mencionarlo, recrearlo ni presentarlo como funcionalidad disponible.

Separación obligatoria:

- `M2_Diseno.tex` explica arquitectura, entradas, proceso y salidas.
- `8_Resultados.tex` documenta pruebas y evidencia observada.

No duplicar en Resultados la explicación completa del diseño.

## 12. Punto 5 del profesor: aplicativo y cumplimiento de objetivos

### 12.1 Regla de trazabilidad

Claude debe copiar los objetivos desde su fuente canónica únicamente para compararlos. Sus textos deben quedar intactos.

Para cada objetivo, establecer:

| Elemento | Pregunta de validación |
|---|---|
| Acción | ¿Qué verbo exige el objetivo? |
| Entregable | ¿Qué producto o resultado exige? |
| Evidencia documental | ¿Dónde se presenta en la tesis? |
| Evidencia técnica | ¿Qué archivo, dato o prueba lo demuestra? |
| Limitación | ¿Qué parte no está demostrada? |
| Estado | `CUMPLIDO`, `CUMPLIDO PARCIALMENTE` o `NO DEMOSTRADO` |

El estado debe derivarse de la evidencia, no del estado escrito previamente en la tesis.

### 12.2 OE1

Verificar que las métricas reportadas correspondan a los cuatro CNI y a las pruebas realmente ejecutadas. Confirmar que las tablas, el procesamiento estadístico y las conclusiones usen la misma población de datos.

No recalcular toda la experimentación si no existe discrepancia. Revisar resultados crudos solo cuando un valor procesado, tabla o conclusión no coincida.

### 12.3 OE2

Mantener el estado **`CUMPLIDO PARCIALMENTE`**.

La evidencia disponible demuestra aplicación o ausencia de Network Policies y cuantifica su overhead. No demuestra una reducción probabilística de incidentes ni una medición completa de superficie de ataque.

Claude debe preservar esta limitación en Resultados, Discusión, Conclusiones y matriz de trazabilidad. Ningún apartado puede volver a presentar OE2 como cumplimiento total.

### 12.4 OE3

Verificar que criterios, umbrales, normalización, ponderaciones y ranking coincidan entre:

- formulación metodológica;
- implementación del procesamiento;
- datos procesados;
- resultados mostrados por la SPA.

No afirmar validación externa del modelo si solo existe validación interna con los datos del testbed.


## 13. Jerarquía de evidencia

Cuando dos fuentes se contradigan, usar este orden:

1. Código activo y datos crudos reproducibles.
2. Resultados procesados cuya procedencia pueda trazarse.
3. Registros de prueba verificables.
4. Configuración y manifiestos usados.
5. Capturas de pantalla.
6. Manuales.
7. Narrativa de la tesis.

La fuente de menor nivel debe corregirse para coincidir con la fuente verificable de mayor nivel. Una captura o una frase previa no demuestra por sí sola que una función siga integrada.

## 14. Orden exacto de ejecución

### Fase 1: mapa estructural

1. Confirmar qué archivos incluye realmente `FormatoTesis.tex`.
2. Extraer únicamente la jerarquía de títulos de esos archivos.
3. Revisar la configuración de numeración y profundidad del índice.
4. Comparar índice, listas y PDF con la estructura fuente.
5. Clasificar cada observación del profesor como `RESUELTO`, `PARCIAL`, `PENDIENTE` o `NO VERIFICABLE`.

### Fase 2: validación antes de edición

1. Confirmar que los objetivos permanezcan idénticos a su versión actual canónica.
2. Identificar capítulos y apartados aún confusos.
3. Localizar el apartado del modelo/plano.
4. Construir la matriz evidencia-objetivo.
5. Contrastar las afirmaciones del recomendador con el código activo.
6. Registrar cada contradicción antes de modificarla.

### Fase 3: correcciones mínimas

Aplicar en este orden:

1. referencias, labels o contadores que aún sean inconsistentes;
2. sobreafirmaciones comprobadas sobre el aplicativo;
3. trazabilidad de objetivos y limitaciones;
4. contenido insuficiente del modelo/plano, solo con evidencia;
5. densidad de párrafos marcados;
6. títulos o enlaces narrativos estrictamente necesarios.

No continuar con una corrección estructural mayor si una corrección local resuelve el comentario.

### Fase 4: control cruzado

Revisar que una misma conclusión tenga el mismo estado en:

- Resultados;
- matriz de trazabilidad;
- Discusión;
- Conclusiones;
- Recomendaciones y trabajo futuro, cuando corresponda.

### Fase 5: verificación visual y técnica

Validar el documento compilado, no solo el código LaTeX:

- índice legible;
- jerarquía numérica consistente;
- listas de tablas y figuras correctas;
- referencias resueltas;
- ausencia de destinos o labels duplicados;
- tablas y figuras dentro de márgenes;
- captions unidos al elemento correcto;
- ausencia de apartados visualmente vacíos;
- páginas sin solapamientos de texto.

Los avisos de desbordamiento deben revisarse en el PDF. No ignorar un aviso si produce texto cortado o superpuesto.

## 15. Criterios de aceptación por comentario

### Numeración

- El lector puede identificar capítulo, sección y subsección desde cualquier encabezado.
- La numeración de tablas y figuras coincide entre texto, listas y captions.
- No existen referencias activas ambiguas o duplicadas.

### Jerarquía

- Planteamiento, justificación y objetivos no reaparecen como capítulos independientes.
- No se reincorpora un capítulo de sprints sin justificación estructural.
- Cada capítulo activo tiene una función académica reconocible.

### Densidad

- Los párrafos intervenidos desarrollan una idea principal.
- La prosa no repite tablas completas.
- Los detalles operativos extensos permanecen en anexos o se referencian desde ellos.

### Modelo o plano

- El apartado identifica entradas, datos, procesamiento, componentes activos y salidas.
- La descripción coincide con el código integrado.
- Diseño y validación aparecen en capítulos distintos y complementarios.

### Cumplimiento

- Los objetivos conservan exactamente su redacción.
- OE2 figura como `CUMPLIDO PARCIALMENTE` en todos los puntos pertinentes.
- PF-06 y PF-08 no se presentan como aprobadas si el código no demuestra actualización y reintento automáticos.
- OE4 se califica según su enunciado y funcionalidad central verificable.
- Toda afirmación de cumplimiento remite a evidencia local concreta.

## 16. Entrega final esperada de Claude

Claude debe entregar un informe breve y verificable con:

1. archivos revisados y motivo de lectura;
2. archivos modificados;
3. respuesta a cada comentario del profesor;
4. validaciones realizadas antes de cada grupo de cambios;
5. matriz final de OE1 a OE4 con evidencia, estado y limitación;
6. contradicciones corregidas entre tesis y aplicativo;
7. resultado de compilación y revisión visual;
8. pendientes no modificados por falta de evidencia.

No incluir una narración extensa del proceso. Priorizar decisiones, evidencia, cambios y pendientes.

## 17. Condiciones de cierre

La tarea termina únicamente cuando:

- los cinco comentarios del profesor tienen respuesta explícita;
- las correcciones están sustentadas por evidencia;
- no se modificó ningún objetivo;
- no se alteraron datos técnicos sin verificación;
- el documento conserva su contenido sustantivo y mejora su navegabilidad;
- el aplicativo y la tesis describen las mismas funciones reales;
- las limitaciones aparecen con el mismo alcance en resultados y conclusiones;
- el PDF final permite seguir la estructura sin confusión ni solapamientos.

Si una condición no puede cumplirse, Claude debe declararla pendiente y explicar qué evidencia falta. No debe ocultarla mediante redacción más categórica.
