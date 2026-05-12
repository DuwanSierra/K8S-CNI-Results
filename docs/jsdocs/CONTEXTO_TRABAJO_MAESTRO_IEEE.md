# Contexto de trabajo: documento maestro IEEE

Fecha de actualización: 2026-05-12

## Objetivo del trabajo

Unificar los tres generadores `.js` ubicados en `K8S-CNI-Results/docs/jsdocs` en un único documento maestro en formato IEEE, usando como base `baseIEEE.tex`, limpiando referencias dispersas y conservando una bibliografía centralizada.

## Archivos fuente relevantes

- `C:\Users\holman.alba\Documents\Tesis\K8S-CNI-Results\docs\jsdocs\1diseno_solucion.js`
- `C:\Users\holman.alba\Documents\Tesis\K8S-CNI-Results\docs\jsdocs\2implementacion.js`
- `C:\Users\holman.alba\Documents\Tesis\K8S-CNI-Results\docs\jsdocs\3pruebas_y_validacion.js`
- `C:\Users\holman.alba\Documents\Tesis\K8S-CNI-Results\docs\jsdocs\baseIEEE.tex`
- `C:\Users\holman.alba\Documents\Tesis\Anteproyecto Holman Alba - Duwan Sierra 1 (1).pdf`
- `C:\Users\holman.alba\Documents\Tesis\DISENO_SOLUCION_TESIS.md`
- `C:\Users\holman.alba\Documents\Tesis\IMPLEMENTACION_SOLUCION_TESIS.md`
- `C:\Users\holman.alba\Documents\Tesis\PRUEBAS_Y_VALIDACION_TESIS.md`
- `C:\Users\holman.alba\Documents\Tesis\ESTRATEGIA_DOCUMENTACION_TESIS.md`

## Archivos creados

- `C:\Users\holman.alba\Documents\Tesis\K8S-CNI-Results\docs\jsdocs\build_master_ieee.js`
- `C:\Users\holman.alba\Documents\Tesis\K8S-CNI-Results\docs\jsdocs\diseno_solucion_ampliacion.tex`
- `C:\Users\holman.alba\Documents\Tesis\K8S-CNI-Results\docs\jsdocs\implementacion_solucion_ampliacion.tex`
- `C:\Users\holman.alba\Documents\Tesis\K8S-CNI-Results\docs\jsdocs\tesis_maestra_ieee.tex`
- `C:\Users\holman.alba\Documents\Tesis\K8S-CNI-Results\docs\jsdocs\CONTEXTO_TRABAJO_MAESTRO_IEEE.md`

## Qué hace el generador

`build_master_ieee.js` ejecuta los tres `.js` en un entorno simulado de `docx`, captura el contenido que los scripts iban a convertir en Word y lo transforma a LaTeX. Luego arma `tesis_maestra_ieee.tex` con:

- Preámbulo IEEE.
- Título, autores, director y grupo ajustados con datos del anteproyecto.
- Marco teórico tomado de `baseIEEE.tex`.
- Diseño de la solución.
- Implementación.
- Pruebas y validación.
- Trabajos futuros.
- Una sola bibliografía IEEE, tomada de `baseIEEE.tex`.
- La ampliación académica de `Diseño de la Solución`, tomada de `diseno_solucion_ampliacion.tex`.
- La ampliación académica de `Implementación de la Solución`, tomada de `implementacion_solucion_ampliacion.tex`.

## Validaciones ya realizadas

- El documento maestro tiene secciones principales en orden:
  - Marco teórico.
  - 3. Diseño de la Solución.
  - 4. Implementación de la Solución.
  - 5. Pruebas y Validación.
  - 6. Trabajos Futuros.
- Las citas de tipo `[7]` de los scripts fueron convertidas a `\cite{ref7}`.
- Se validó que no quedaran tokens internos como `LATEX_TOKEN`.
- Se validó que no hubiera citas rotas: todas las claves `\cite{...}` existentes tienen su `\bibitem`.
- Se validó que los entornos LaTeX `\begin{...}` y `\end{...}` quedaran balanceados.
- Se removieron referencias a figuras inexistentes de `baseIEEE.tex` para evitar errores de compilación por rutas faltantes.
- Se agregó el anteproyecto como referencia IEEE `ref29`.
- Se amplió la sección `3. Diseño de la Solución` hasta la subsección `3.18`, incorporando trazabilidad con el problema, requisitos de diseño, arquitectura por capas, comparación de CNIs, metrología QoS, MCDA, seguridad Zero Trust, GitOps, prototipo recomendador y límites del diseño.
- Validación posterior a la ampliación: `125` citas, `29` referencias, sin citas rotas, sin tokens internos y con ambientes LaTeX balanceados.
- Se amplió la sección `4. Implementación de la Solución` hasta la subsección `4.24`, con lectura guiada, infraestructura base, K3s, GitOps, manifiestos, throughput, latencia, observabilidad, repositorio de resultados, procesamiento, prototipo, NetworkPolicies, flujo completo y decisiones de legibilidad.
- Validación posterior a la ampliación de implementación: `127` citas, `29` referencias, sin citas rotas, sin tokens internos y con ambientes LaTeX balanceados.

## Cómo regenerar el documento maestro

Desde PowerShell:

```powershell
cd "C:\Users\holman.alba\Documents\Tesis\K8S-CNI-Results\docs\jsdocs"
node .\build_master_ieee.js
```

Esto vuelve a crear:

```text
C:\Users\holman.alba\Documents\Tesis\K8S-CNI-Results\docs\jsdocs\tesis_maestra_ieee.tex
```

## Estado técnico

No se pudo compilar localmente a PDF porque en la máquina no están instalados `pdflatex`, MiKTeX, TeX Live ni Pandoc. El archivo `.tex` está preparado para compilarse en Overleaf o en una instalación local de LaTeX.

## Último trabajo realizado

Se amplió la sección `4. Implementación de la Solución` del documento maestro, siguiendo el mismo patrón usado en diseño. El objetivo fue hacerla más fácil de leer para cualquier persona, explicando cada componente por función y por flujo operativo, sin perder rigor técnico. El contenido nuevo quedó en:

```text
C:\Users\holman.alba\Documents\Tesis\K8S-CNI-Results\docs\jsdocs\implementacion_solucion_ampliacion.tex
```

El maestro actualizado quedó en:

```text
C:\Users\holman.alba\Documents\Tesis\K8S-CNI-Results\docs\jsdocs\tesis_maestra_ieee.tex
```
