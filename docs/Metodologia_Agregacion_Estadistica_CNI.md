# Metodologia de Agregacion Estadistica para Benchmarks CNI

## Objetivo

Corregir el sesgo que aparecia cuando un CNI tenia mas muestras crudas que otro. La comparacion ahora se hace usando la unidad estadistica correcta: la ejecucion independiente del benchmark.

## Problema anterior

1. En metricas JSON, cada archivo se promediaba junto con todos los demas archivos del directorio sin registrar cuantas ejecuciones validas habia por CNI.
2. En metricas CSV de recursos, se mezclaban todas las filas de todas las ejecuciones, de modo que una corrida mas larga o con mas timestamps pesaba mas que otra.
3. Los faltantes se representaban como `0`, mezclando ausencia de dato con un valor real.

## Metodologia aplicada

### 1. Definir la unidad de analisis

- Para `latency_tcp_connect/`, `throughput_tcp/` y casos de `with_network_policy/`, cada archivo `run_*.json` se trata como una ejecucion independiente.
- Para `resource_usage_nodes/`, cada subdirectorio timestamp se trata como una ejecucion independiente.

### 2. Resumir cada ejecucion antes de comparar CNIs

- En JSON, se extrae una unica metrica por run.
- En CSV, se calcula primero el promedio interno de cada ejecucion usando las filas del archivo correspondiente.

Esto evita que una ejecucion con mas filas o mas granularidad temporal domine el promedio global.

### 3. Filtrar outliers entre ejecuciones

- Se aplica filtro IQR sobre los valores ya resumidos por run.
- Los cuartiles se calculan con interpolacion lineal.
- Si hay menos de 4 runs validos, no se elimina nada.

### 4. Consolidar el valor final

- El valor reportado por CNI es la media de runs despues del filtrado IQR.
- Se conserva metadato estadistico por metrica:
  - `total_runs`
  - `valid_runs`
  - `used_runs`
  - `discarded_outliers`

### 5. Tratamiento de faltantes

- Si no hay datos suficientes, la salida consolidada usa `null`.
- Los consumidores del dashboard y del recomendador ignoran esos `null` en vez de tratarlos como cero.

## Archivos modificados

1. `docs/procesador.js`
2. `docs/app.js`
3. `cni-recommender-spa/src/data/recommendationModel.js`

## Flujo tecnico paso a paso

1. Leer las carpetas de cada CNI en `results/cni-benchmarks/`.
2. Extraer una lista de valores por run para cada metrica.
3. Para CSV, calcular primero el promedio de cada run.
4. Aplicar IQR a la lista de runs validos.
5. Calcular la media final solo con runs retenidos.
6. Guardar las metricas consolidadas y el bloque `estadistica` en `docs/datos_consolidados.js`.
7. Renderizar el dashboard ignorando valores `null`.
8. Calcular scores del recomendador ignorando faltantes reales.

## Validacion recomendada

1. Ejecutar `node docs/procesador.js` desde la raiz de `K8S-CNI-Results`.
2. Verificar que `docs/datos_consolidados.js` se regenere sin errores.
3. Confirmar que cada CNI incluya el bloque `estadistica`.
4. Revisar que los charts no fallen si alguna metrica sale como `null`.
5. Comparar manualmente un CNI con muchas filas CSV frente a otro con pocas para confirmar que ahora cada run pesa una sola vez.