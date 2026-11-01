# Proyectista — idea de Ángel (01/11/2026)

> Módulo nuevo de la app (más adelante puede ser una app aparte). **Todavía no se programa nada:** este archivo guarda la idea y el plan por etapas que charlamos. Cada etapa se encara recién cuando Ángel la pida.

## La idea completa
1. **Relevar en la obra con GPS de precisión de centímetros (RTK).**
   - Se va al lugar y se marca cada punto: dónde va cada columna, el tablero, lo existente…
   - Mientras se camina, se ven las distancias exactas de un punto a otro.
   - Al terminar quedan las coordenadas de todos los puntos.
2. **Plano automático y preciso** con esos puntos.
   - Lleva distancias (cotas) y se apoya en la **base de Córdoba que ya armó Ángel** (en CAD).
   - Se exporta a un formato que abra AutoCAD.
3. **Cálculo lumínico tipo DIALux.**
   - Se cargan la luminaria (marca, modelo, watts, fotometría), la altura y la separación.
   - El plano muestra dónde queda bien iluminado y dónde queda oscuro o no cubre.
4. **Eléctrico.**
   - Con el calibre del cable y las distancias del relevamiento, calcula las **caídas de tensión**.
   - **Arma el tablero** con las protecciones recomendadas.
5. **El proyecto entero:** con ir a la obra, marcar los puntos y cargar un par de datos (cable, luminaria…), sale el proyecto completo.
6. **Después:** baja tensión, media tensión, alta tensión, loteos… Se empieza por **alumbrado público**.

## Opinión técnica (resumen)
- **Es factible por etapas**, no de una sola vez. Lo más valioso y menos riesgoso es lo primero: relevar los puntos, sacar las distancias y armar el plano exportable.
- **GPS de centímetros:** el GPS del celular da 3 a 5 m. Para centímetros hace falta un **receptor RTK externo** con correcciones (NTRIP).
  - En Argentina, el IGN tiene un servicio de correcciones; hay que confirmar las condiciones.
  - Muchos receptores le pasan al celular la posición corregida como «ubicación simulada» de Android, y así la app la lee sin programar Bluetooth. Esto **hay que probarlo con el receptor real**.
- **DWG / AutoCAD:** el DWG es cerrado. Para exportar conviene **DXF**: AutoCAD lo abre, es abierto y se puede generar desde la app.
  - Para leer la base de Córdoba: pasarla una vez de DWG a DXF o GeoJSON (por ejemplo, con el conversor gratuito de la ODA) y recortarla por zona.
  - Hay que saber en qué **sistema de coordenadas** está esa base.
- **Lumínico:** se puede hacer un cálculo punto por punto con los archivos fotométricos de los fabricantes (**IES / LDT-EULUMDAT**). Muestra un mapa de calor, la iluminancia media y la uniformidad.
  - Sirve como **anteproyecto**. Para presentar, se valida en DIALux o con el criterio de la inspección.
  - Los niveles exigidos salen de la norma que corresponda: **a confirmar** cuál pide EPEC o la Municipalidad.
- **Caída de tensión y tablero:** las fórmulas son conocidas; la app ya tiene un cálculo rápido de caída de tensión.
  - Las protecciones propuestas siguen reglas de la AEA. Las tiene que revisar y firmar un matriculado: la app **recomienda**, no certifica.
  - Los criterios que no estén en documentos van marcados **«a confirmar»**.
- **Ventaja:** se engancha con lo que la app ya tiene: la calculadora de materiales (cómputo), el itemizado, el mapa y los legajos de obra.
- **Cuidado con el peso de la app:** la app ya pesa 4,4 MB y la cuadrilla necesita que abra rápido. Proyectista conviene armarlo **como página aparte** (por ejemplo, `proyectista.html` en el mismo GitHub, con la misma base de Firebase). Así no pesa para la cuadrilla y se puede separar fácil cuando crezca.

## Plan por etapas (propuesto)
| Etapa | Qué | Necesita |
|---|---|---|
| 0 | Elegir y probar el receptor RTK con el celular; revisar la base de Córdoba (formato, tamaño, sistema de coordenadas) | Ángel: receptor y archivo |
| 1 | **Relevamiento:** marcar puntos con tipo (columna nueva, existente, tablero, acometida…), distancia en vivo al punto anterior, lista y plano simple sobre el mapa, exportar a **DXF** y planilla. Funciona con el GPS del celular (precisión común) y con RTK cuando esté | — |
| 2 | **Plano:** base de Córdoba de fondo, cotas, recorrido de circuitos, carátula EMA, DXF/PDF | Etapa 0 (base) |
| 3 | **Eléctrico:** circuitos y cable → caída de tensión por tramo, tablero y protecciones propuestas → cómputo de materiales en la calculadora que ya existe | Criterios a confirmar con Ángel |
| 4 | **Lumínico:** cargar fotometrías IES/LDT, mapa de iluminancia, zonas oscuras, iluminancia media y uniformidad | Fotometrías y niveles a cumplir |
| 5 | Baja/media/alta tensión, loteos | Más adelante |

## Decidido con Ángel (01/11/2026)
- **Quién lo usa:** solo **Oficina y Administrador**. La cuadrilla no lo ve: ni en el menú ni en lo que baja su celular.
- **Rápido y liviano:** pensado sobre todo **para la computadora**, aunque también tiene que andar en el celular (para relevar en la obra).
- **Está dentro de la app:** entrada propia en el menú, solo para esos roles. El código se carga aparte, solo cuando se abre, así no pesa en la app.
- **RTK:** todavía no tiene. Ya tiene uno en mente y lo va a conseguir.
- **Base de Córdoba (DWG):** la armó Ángel con Claude en otro chat. La va a traer cuando arranquemos.
- **Cuándo:** primero se cierra la versión en curso (v088, juntando lo de SALEM y lo de Claude Code), se sube, y después se arranca con Proyectista.

## Preguntas abiertas para Ángel
- ¿Qué receptor RTK tiene en mente (marca y modelo)?
- La base de Córdoba: ¿en qué formato está (DWG/DXF), cuánto pesa y en qué sistema de coordenadas?
- ¿Arrancamos por la etapa 1 con el GPS del celular, mientras se consigue el RTK?
