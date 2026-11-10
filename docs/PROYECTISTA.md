# Proyectista — idea de Ángel (01/11/2026)

> Módulo nuevo de la app (más adelante puede ser una app aparte). Este archivo guarda la idea y el plan por etapas. Cada etapa se encara recién cuando Ángel la pida.
> **Estado:** etapa 1 hecha en la **v089** (01/11/2026).

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
- **Cuidado con el peso de la app:** la cuadrilla necesita que abra rápido. Se resolvió dentro de la app: el código va «dormido» (`<script type="text/plain" id="proyectistaCod">`, unos 40 KB) y solo se ejecuta al abrir Proyectista. La cuadrilla no lo ejecuta ni baja la colección `proyectos`.

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

## Etapa 1 — hecha en la v089
- «📐 Proyectista» en el menú, solo para Administración y Oficina. Colección `proyectos` (reglas `Reglas_Firestore_v089`).
- **Proyectos:** se crean atados a una obra o sueltos.
- **Puntos:**
  - se marcan con el GPS («al toque» o promediando 5 s) o tocando el mapa;
  - tipos: columna nueva, columna existente, tablero, acometida/poste, cámara/caja, cruce de calle, otro;
  - nombre automático (C1, T1…), nota, tramo nuevo, ordenar y borrar.
- **GPS:** muestra la precisión con un semáforo («RTK fijo» si es ±5 cm o menos) y la distancia en vivo al último punto.
- **Mapa:** satélite y calles, con cotas. **Plano en metros:** cotas, escala, norte e impresión A4 / PDF con tabla de coordenadas.
- **Archivos para bajar:**
  - **DXF** (AutoCAD R12) en **Gauss-Krüger POSGAR 2007**: faja 3, 4 o 5, la 4 por defecto. También en metros locales. Capas por tipo, nombres, tramos y cotas.
  - **Planilla CSV** para Excel.
- **Precisión de los cálculos:**
  - Distancias sobre el elipsoide (Vincenty).
  - Gauss-Krüger por serie de Krüger: igual a PROJ al 0,1 mm, controlado en la prueba `t_v089`.

## Ideas de otras apps (investigación del 01/11/2026)
Referencias que pasó Ángel: Li.PAD, GridGIS (Merytronic), DIRED-CAD, ArcGIS Field Maps (Streetlight Management), Bentley OpenUtilities Designer y Ampère Mobile. Se sumaron Emlid Flow, SW Maps, DIALux evo y Relux.
- **Etapa 1 · relevamiento**
  - Ficha por tipo de punto, con campos propios y **foto** (Li.PAD, Field Maps). *Fácil.*
  - Tope de precisión para dejar marcar (ej. 5 m con el GPS del celular, 5 cm con RTK) y desviación al promediar (Field Maps). *Fácil.*
  - **Medir entre dos puntos cualesquiera** (no solo con el anterior). *Fácil.*
  - **Replanteo «llevame al punto»**: distancia y rumbo en vivo hasta un punto del proyecto (Emlid Flow). *Mediano.*
  - **Grabar el recorrido caminando**, por ejemplo para la traza de la zanja. *Mediano.*
  - **RTK, en dos pasos:**
    - por «ubicación simulada» de Android con una app puente: no lleva código, pero hay que probarlo, porque en algunos celulares la precisión salta;
    - después, Bluetooth + NTRIP dentro del APK (SW Maps). Es *grande* y lleva APK nuevo.
- **Etapa 2 · plano**
  - Exportar también **KML / GeoJSON / SHP**. *Fácil.*
  - Importar el **catastro en DXF** de fondo (DIRED-CAD). *Mediano.*
- **Etapa 3 · eléctrico**
  - **Caída de tensión en % por nodo y al final de cada circuito**, con tabla por tablero y circuito (DIRED-CAD). *Mediano.*
  - **«Unidades compatibles»**: cada punto suma su material y su ítem del itemizado, reusando la calculadora (Bentley). *Grande.*
- **Etapa 4 · lumínico**
  - **Fotometrías IES/LDT**, iluminancia media y Uo en una grilla, con semáforo contra la clase pedida (DIALux, Relux). *Grande.*
  - Optimizador de separación y altura, y curvas isolux sobre el mapa (Relux). *Grande.*
- Sin confirmar: GridGIS Map Creator (no se encontró la app); el cómputo de materiales en DIRED-CAD.

## Modelos de Ángel (Proyectos_AP, vistos el 02/11/2026) — lo que Proyectista tiene que terminar armando
Ángel ya armó estos planos con programas Python (ezdxf), sobre el catastro como XREF y en POSGAR faja 4.
- **Planimetría A1, escala 1:400** (Cavia AP-CAVIA-01 y José María Paz AP-JMP-FAS-01):
  - columnas con código **T{tablero}C{circuito}-{nn}** y las **fases** de cada tabaquera (R-S, S-T…);
  - tendido por circuito con colores (1 azul, 2 verde, 3 rojo) y la **sección del cable** por tramo (4×4, 4×6 mm²);
  - **distancia** de cada tramo, tableros TMPC, puesta a tierra y lo existente (LAT 132 kV, preensamblado, sendas);
  - croquis de ubicación satelital, referencias con los planos tipo (AP-C-033, AP-C-008, AP-T-018…) y notas.
- **Tablas que van en la lámina:**
  - **tabla de columnas**: tipo (doble, triple, cruz × W), fases por tabaquera y luminarias por fase;
  - **balance de fases** (W por fase R/S/T, por circuito y por tablero);
  - **cuadro resumen**: columnas por tipo, luminarias por potencia, tableros y metros de cable por sección.
- **Cajetín:** logos de EPEC, Municipalidad, Gobierno de Córdoba y EMA; proyectó, revisó, dibujó, fecha, escala, plano N° y revisión.
- **Unifilar del TMPC, A3** (AP-CAVIA-02), con márgenes IRAM 4504 y rótulo IRAM 4508:
  - acometida y seccionador NH, medidor, ITM general, barra;
  - por circuito: ITM + diferencial + contactor; circuito de comando con fotocontrol;
  - **tabla de circuitos de salida**: cable, largo y potencia; simbología IEC 60617.
- **Distribución de fases / conforme a obra, A4** (VICOR TAP 1).
- **Detalle constructivo A4** (TC-PRFV-02): conexionado de la caja de la columna, con identificadores de cables.

**Qué implica para Proyectista**
- **Etapa 3** necesita más datos que los puntos:
  - a qué **tablero y circuito** pertenece cada columna;
  - **tipo de columna**: altura 7 o 10 m; simple, doble, triple o cruz;
  - **luminarias**: W y lm;
  - **sección del cable** por circuito.
- **Fácil y valioso:** que la app **reparta las fases sola** para que el balance quede parejo, y arme la tabla de columnas, el balance y el cuadro resumen.
- **La lámina A1** sale como DXF con la base de catastro de la zona. Se pueden reusar las capas y los símbolos de los programas de Ángel (`build_plano.py`, `build_jmp.py`).
- **El unifilar** sale de los circuitos (potencia, largo, sección) con las protecciones que se definan.
- **Las protecciones** las recomienda la app con criterios **a confirmar** con Ángel. La app recomienda; no certifica.

## Funciones pedidas y estado (02/11/2026)
| # | Pedido de Ángel | Estado |
|---|---|---|
| 1 | Marcar puntos en la obra con GPS de centímetros (RTK) | ✅ (con RTK cuando lo tenga) |
| 2 | Ver la distancia exacta al caminar | ✅ al último punto · ❌ entre dos puntos cualesquiera |
| 3 | Plano automático con distancias | ✅ simple · ❌ lámina como sus modelos |
| 4 | Sacarlo para AutoCAD | ✅ DXF Gauss-Krüger faja 4 |
| 5 | Base de Córdoba de fondo | ✅ v095 (catastro v6: mapa, plano, PDF, DXF y borde de la plaza automático) |
| 6 | Cálculo lumínico tipo DIALux: radio que alcanza cada luminaria, zonas oscuras | ✅ v092 (.ldt/.ies, punto por punto, mapa de zonas oscuras, radio útil, Cumple/No cumple) · ❌ isolíneas y reflexiones |
| 7 | Caídas de tensión según cable y distancias | ✅ v092 (fasores con neutro, por tramo y fase, semáforo) |
| 8 | Tablero con protecciones recomendadas | ✅ v092 térmicas por circuito y general · diferencial, contactor, fotocontrol, DPS: a confirmar |
| 9 | Proyecto completo (fases, tablas, unifilar, cómputo) | ✅ v092 reparto de fases, tablas, unifilar simple, cuadro resumen, memoria de cálculo · ❌ lámina A1 como los modelos |
| 10 | BT / MT / AT / loteos | más adelante |

## Cálculo lumínico — cómo se aplica (investigación del 02/11/2026)
- **Fotometrías:** archivos **.ldt (EULUMDAT)** o **.ies (LM-63)** de cada modelo de luminaria.
  - Se escribe un lector propio en JS, compatible con Chrome 80. La librería que lee los dos formatos es AGPL, así que no conviene.
  - Interpolación bilineal I(C, γ) y despliegue de la simetría del archivo.
  - **Hay que pedirle el .ldt al proveedor de cada modelo que se compra**: Strand lo da a pedido, Philips lo publica. Los lúmenes salen del archivo, no del folleto.
- **Método punto por punto:**
  - Luminaria en `(x + s·cosψ, y + s·sinψ, h)`, con s = saliente del brazo, ψ = rumbo y h = altura; τ = inclinación.
  - `E = I(C,γ)·cos θ / d²`; sin inclinación, `E = I·cos³γ / h²`.
  - Se suman todas las luminarias (1 a 4 por columna) y se multiplica por el factor de mantenimiento (0,8 por defecto, editable).
  - Grilla de 0,5 a 1 m sobre la plaza, calculada en segundo plano para no trabar la app.
- **Indicadores:** Em, Emin, Uo = Emin/Em, con semáforo «Cumple / No cumple» contra la clase elegida.
  - Clases P de EN 13201-2 para plazas: P1 15 lx / Emin 3 · P2 10 / 2 · P3 7,5 / 1,5 · P4 5 / 1 · P5 3 / 0,6 · P6 2 / 0,4.
  - P1–P3 sacadas de memoria; todo **a confirmar**.
  - Calles: IRAM-AADL J 2022-2 (tabla paga) o clases M de EN 13201.
  - **No se encontró norma argentina ni pliego público con niveles para plazas.** Preguntar qué exige Inspección (EPEC / DGAP).
- **«Radio útil»:** distancia desde el pie de la luminaria hasta donde su iluminancia propia cae bajo un umbral (por defecto, el Emin de la clase elegida).
  - Se calcula en 36 rumbos, porque las luminarias viales no iluminan en círculo.
  - Se muestra como curva isolux y como «radio equivalente».
- **En el mapa:**
  - capa de colores georreferenciada (rojo = debajo de lo exigido) y curvas isolux;
  - en el plano y en el DXF, una capa ISOLUX.
- **Validación:** 2 o 3 casos reales comparados contra DIALux evo con la misma grilla. Se espera menos de ~5 % de diferencia en Em (sin confirmar).
- **Limitaciones:** no calcula reflexiones ni sombras de árboles (es la mayor fuente de error en plazas con arboleda), ni pendiente del terreno; en la primera etapa tampoco TI ni luminancia.

## Cálculo eléctrico — cómo se aplica (investigación del 02/11/2026)
- **Modelo:** tablero → circuitos → columnas en orden, con derivaciones. Cada columna tiene luminarias (W y cosφ, 0,95 por defecto), su fase y la sección del cable del tramo. Las distancias ya están.
- **Caída de tensión por tramos con fasores:**
  - corriente de cada fase aguas abajo de cada tramo, y neutro `I_N = |I_R + a²·I_S + a·I_T|`;
  - ΔU% por nodo y por fase, destacando el peor nodo;
  - límite configurable, 3 % por defecto, **a confirmar** (AEA 95703 o pliego de EPEC).
- **Tabla de cables Cu IRAM 2178 (Ω/km):**
  - 4 mm²: 5,92 a 70 °C · 6,3 a 90 °C;
  - 6 mm²: 3,95 a 70 °C;
  - 10 mm²: 2,29 a 70 °C;
  - X ≈ 0,08–0,10 en tetrapolar;
  - fuente: catálogo Prysmian Sintenax/Retenax. El resto, calculado o **a confirmar**.
- **Reparto de fases automático:** de mayor a menor carga, cada luminaria a la fase menos cargada, y después intercambios para bajar la peor caída y la corriente del neutro. Botón «Repartir» y edición a mano.
- **Protecciones, recomendadas (no certificadas):**
  - Ib ≤ In ≤ Iz;
  - ITM por circuito C10–C16, según el arranque de los drivers (la cantidad de drivers por ITM es un dato de la ficha del driver);
  - diferencial (300 mA en TT; clase superinmunizada, a confirmar);
  - contactor según la tabla del fabricante para LED;
  - fotocontrol sobre la bobina;
  - NH del lado de EPEC; DPS a confirmar.
- **Cortocircuito y lazo:** necesita la impedancia de la red de EPEC y el esquema TT o TN-S. Dato del matriculado.
  - Según una fuente secundaria, la Municipalidad de Córdoba usa TT con menos de 9 columnas y TN-S en el resto.
- **Puesta a tierra:** valor exigido por EPEC **a confirmar**. CABA pide ≤ 4–5 Ω. Se mide con telurímetro (ítem 81).
- **Salidas:**
  - tabla por tramo (origen, destino, L, P, I, sección, ΔU parcial y acumulada, Iz, protección);
  - unifilar del TMPC como el AP-CAVIA-02;
  - memoria de cálculo imprimible.
- **Lo que tiene que confirmar el matriculado o Ángel:**
  - % de caída admitido;
  - valor máximo de puesta a tierra;
  - esquema TT o TN-S;
  - diferencial;
  - contactor y DPS;
  - cosφ y arranque del driver real;
  - R y X de los tetrapolares;
  - impedancia de la red.

## Orden propuesto (02/11/2026)
1. Catastro de fondo + **tablero, circuito, tipo de columna y luminarias en cada punto** + reparto de fases + tabla de columnas, balance y cuadro resumen.
2. **Caída de tensión** por tramo y por fase, con semáforo, y recomendación de protecciones.
3. **Lumínico**: lector de .ldt, mapa de zonas oscuras, radio útil y «Cumple / No cumple».
4. Lámina A1 en DXF, unifilar y memoria de cálculo.
5. Foto por punto, medir entre dos puntos, «llevame al punto» y grabar el recorrido.

## Etapa 2 — hecha en la v092 (01/11/2026)
- Ver `CHANGELOG.md` (v092). Decisiones tomadas:
  - **Resistencias:** IEC 60228. Por defecto cobre **flexible clase 5**, que reproduce el catálogo Prysmian a 70 °C (4 mm² 5,92 · 6 mm² 3,95 · 10 mm² 2,29 Ω/km). Se puede elegir clase 2. La reactancia 0,08 Ω/km es típica (a confirmar).
  - **Largo del cable:** distancia × (1 + reserva 5 %) + subida a la caja de 3,50 m en cada punta de columna; o los metros reales cargados a mano.
  - **Caída hasta la luminaria:** suma 2 × R(1,5 mm²) × 7 m × I por el cable de subida.
  - **Térmica recomendada:** la estándar siguiente a 1,25 × I, mínimo 10 A (a confirmar por el arranque de los drivers).
  - **Fotometría guardada** como tabla pareja C cada 5° × γ cada 2,5° en cd/klm de la luminaria (≈ 20 KB por luminaria).
  - **Luminaria «mira hacia»:** por defecto, al centro de la plaza; con 2 o más artefactos se reparten parejos. C90 = hacia adelante.
- **Pendiente:** isolíneas, capa de luz en el DXF, lámina A1 como los modelos, catastro de fondo, inclinación de la luminaria.

## Preguntas abiertas para Ángel
- ¿Qué nivel de iluminación (lux) exige Inspección (EPEC / DGAP) para las plazas? ¿Lo dice el pliego?
- ¿Podés conseguir los archivos .ldt o .ies de las luminarias que compran (75 W, 200 W…)?
- ¿Qué % de caída de tensión y qué valor de puesta a tierra exigen? ¿TT o TN-S?
- ¿Qué receptor RTK tiene en mente (marca y modelo)?
- La base de Córdoba: ¿en qué formato está (DWG/DXF), cuánto pesa y en qué sistema de coordenadas?
- ¿Qué sigue después de la etapa 1? Opciones: foto por punto, medir entre dos puntos, «llevame al punto», o la etapa 2 con la base de Córdoba.

## Editar el relevamiento (v099)
- **Mapa:** tocá un punto y se abre su cuadro: tipo, nombre, nota, mover (arrastrándolo, tocando el mapa o con el GPS), empezar o unir tramo, borrar. Tocá un tramo (la línea) y aparecen los «＋» para agregarle quiebres; los cuadraditos se arrastran. «↺ Dejarlo recto» los saca.
- **En obra:** con «🚶 Dibujar el camino caminando», el tramo hasta el próximo punto que marques sigue tu recorrido, curvas incluidas (sin el temblequeo del GPS).
- **Plano:** se arrastra, se acerca con ＋ / −, con la rueda o con dos dedos, y «⤢» vuelve a mostrar todo. El catastro aparece de lo que estás mirando. Los puntos y los quiebres también se tocan y se mueven ahí.
- **↶ Deshacer:** vuelve atrás lo último que se movió, borró o cambió.
- Los largos de las cotas, la planilla, el DXF (polilínea) y el cable del cálculo eléctrico van por el camino dibujado.
- Datos: `punto.via = [{la, lo}]`, los quiebres desde el punto anterior hasta ese punto.

## Idea anotada: medición con láser (Ángel, 10/11/2026) — NO hacer todavía
- Usar un medidor láser (distanciómetro con Bluetooth) para que la medida pase sola a la app, exacta y sin caminar: distancias entre columnas, a la línea municipal, largo de tramos, alturas.
- Complementa al GPS (que da la posición caminando) y al GPS RTK charlado antes.
- A pensar cuando se encare: qué modelos de láser tienen Bluetooth y si se conectan desde la app de Android (plugin nativo → APK nuevo); dónde se carga cada medida (Proyectista: tramo/punto; Mis tareas: medidas de la orden); cómo se combina con los puntos GPS.
- Ángel: «tenerlo anotado nada más, pensarla bien».
