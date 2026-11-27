# Historial de versiones — App Alumbrado Público (EMA Servicios)

Autor: Miguel Ángel Díaz © 2026

## v188 — 27/11/2026 (armada, sin publicar) · Reserva nueva desde el celu: las sugerencias de «Para quién» y del material
**Pedido (Ángel, 27/11, desde el celu):** «quiero hacer una nueva reserva del celular, pongo la obra y no me sale para buscar al personal ni el material ni nada».

**La causa:** desde la **v119** (04/11), en el celu y en la app de Android los campos con lista de sugerencias (`<datalist>`) no usan la lista del teclado: el módulo `sugerencias` les saca el `list` y muestra su caja blanca `#sugCaja`, pegada al `body` con **z-index 9500**. La ventana de la reserva (`#rsModal`, clase `.pf-modal`) va en **z 9600**: la caja salía, pero **debajo** de la ventana, invisible y sin poder tocarse. Así «Para quién» (la nómina) y cada renglón de material (el catálogo del pañol) no mostraban nada (y como el campo ya no tiene `list`, tampoco la lista del teclado). En la compu no pasa (queda la lista del navegador). Pasa con todos los roles que hacen reservas (Administración, Oficina, Pañol, quien edita Órdenes) y en cualquier otra ventana fija con un campo con lista. Comprobado contra la v118 (lista del navegador, anda) y la v119 (ya queda debajo).

**Qué cambia (solo `sugerencias`, bandera `__v188No`; sin reglas nuevas):**
- La caja se pone arriba de la capa donde está el campo: el z-index más alto de los antepasados posicionados del campo + 1 (si es menor que 9500, queda el 9500 de siempre). En las pantallas comunes no cambia nada.
- Al tocar una sugerencia la caja se saca en el `pointerdown` y el clic que venía después caía en lo que quedaba debajo (con la caja ya visible, en la reserva era «＋ Agregar material» o «Reservar»): ese clic se descarta (700 ms).
- Un renglón recién agregado con «＋ Agregar material» se prepara al recibir el foco o la primera letra: antes esperaba hasta 1 s al relojito que le saca la lista del teclado y, si la persona ya lo tocaba y escribía, no salía nada (se vio en las pruebas, una de cada pocas veces).

**Cómo se arma:** `herramientas/v188/patch_v188.py` sobre el ORIGINAL 187 publicado (`BASE_SHA` c6c82019…): cuatro reemplazos en `sugerencias` + el sello.

**Pruebas:** `t_v188` (nueva; `datos178`; Administración, Oficina, Pañol y Pedro): PC 32/32 · celu 50/50 · `REGLAS=1` 32/32 · 50/50; con `ANTES=1` contra la v187 el celu da 33/49 (la lista queda debajo de la ventana en los 4 roles). Viejas con la v188 (con `__v188No`, PC · celu): `t_v023` 21/21 · 21/21, `t_v038` 26/26 · 26/26, `t_v052` 18/18 · 18/18, `t_v053` 8/8 · 8/8, `t_v056` 14/14 · 14/14, `t_v059` 17/17 · 17/17, `t_v061` 15/15 · 15/15, `t_v081` 16/16 · 16/16, `t_v102c` 11/11 · 12/12, `t_v119` 12/12 · 13/13, `t_v137` 62/62 · 63/63, `t_v142` 49/49 · 49/49, `t_v168` 83/83 · 83/83, `t_v178` 86/86 · 86/86, `t_v182` 45/45 · 44/45 (la misma falla con la v187: «Equipos habituales antes de que llegue la base», tiempos), `t_circuito` 16/16 · 16/16, `t_v187` 30/30 · 30/30. Con el arreglo prendido en las viejas (`V188=1`, build final): `t_v119` 12/12 · 13/13, `t_v056` 14/14 · 14/14, `t_v102c` 11/11 · 12/12, `t_circuito` 16/16 · 16/16 (con el build anterior también `t_v137` 61/62 · 63/63: la onda del micrófono, tiempos, en la corrida normal 62/62). Repetidas con el build final (con `__v188No`): `t_v119`, `t_v056`, `t_circuito`, `t_v187`, igual que arriba. La prueba toca el renglón nuevo a los 150 ms (sin el arreglo del relojito fallaba una de cada pocas corridas).

**Huellas:** ORIGINAL `188_2026-11-27_app-EMA_ORIGINAL.html` `7482940b86a50a66028e14279008f048fb37dfad152c7925924aa15a026cd411` · `index.html` `999e04249dc0b174f4ec81a3fd57676e440de5591ec40c42d6344a273d84384c` (sello `2026-11-27 11:00 · babe09`).

**Qué tiene que hacer Ángel:** subir `index.html` a GitHub. Sin reglas nuevas ni APK.

## v187 — 25/11/2026 (publicada en GitHub 25/11) · Revisión de la cuadrilla: fotos, planos y ubicaciones
**Pedido (Ángel, 25/11):** «revisá que los de cuadrilla puedan sacar fotos rapidito y que se suban rápido; y que puedan abrir los planos y las ubicaciones; fijate si hay algún error».

**Qué se revisó:** todos los caminos de fotos de la cuadrilla (Modo obra con «Voy a iniciar» y la cámara de la tarea, Mis tareas con el 📷 de cada fila y «＋ Otra foto», la cámara de la barra, la cámara del teléfono / APK), con y sin señal, con el servidor de fotos rápido, lento y caído, con las reglas reales y en el modo liviano; los planos y las ubicaciones. Las pruebas de siempre (`t_v164`, `t_v165`, `t_v166`, `t_v167`, `t_v171`, `t_v172`, `t_v149b`, `t_v157`, `t_v142`, `t_circuito`, `t_v022`, `t_v086`) pasan con la v186. Medidas en `herramientas/v187/medidas.txt`.

**Errores encontrados y arreglados (módulo `cuadrilla187` + reemplazos chicos, bandera `__v187No`; sin reglas nuevas):**
- **«Enviar» trabado en Mis tareas:** con «▶ Voy a iniciar» (v166) y las fotos en el mismo minuto, el cartelito «📤 Listo, enviar esta tarea» llevaba las horas escondidas con inicio = fin y la app decía «La hora de fin tiene que ser después de la de inicio» sin nada para corregir (había que adivinar tocar «−5»). Ahora el fin escondido es un minuto después del inicio (`tiempoCol`, `hmFin`).
- **Los planos en la pantalla nueva de la cuadrilla:** solo se veían en «Ver lista completa» (Mis tareas clásica). Ahora «Orden de trabajo» muestra «📐 Planos de la obra» (la misma lista, abre el visor de siempre) y Modo obra tiene «📐 Ver plano» (con varios, lleva a la orden). Sin lecturas nuevas.
- **El celu de la cuadrilla recalculaba pantallas que no ve:** el Inicio viejo (escondido detrás de «Hoy») calculaba el % de TODAS las obras cada 4 s y con cada cambio de la orden, y Planificación y lo de la oficina (informe, balance, etapas, Órdenes) se redibujaban escondidos con cada foto o marca. Con 250 obras y el celu lento (CPU ×4): quieto, ≈ 5,5 s de trabajo cada 20 s → 0,3 s; cada foto / marca ≈ 2,3 s de pantalla congelada → 0,1 s. Lo escondido se dibuja cuando la persona abre esa pantalla.

**Lo que se descartó de la auditoría del 19/11:** la app NO toma el servidor de fotos viejo como el nuevo: con `{"ok":true,"bucket":true,"forma":"claves"}`, `{"ok":false}` o `r2:false` sin `version` queda «v1» (las fotos siguen yendo a la nube por `/f/`, como siempre; los videos y PDF grandes esperan el Worker v2); `planCalendario` (0,8 s) y las duplicadas de `carpetasObra` (1,5 s) no trabajan en el celu de la cuadrilla (pantalla escondida / sin permiso). Con la cámara abierta la v164 ya frena los redibujos (los picos que quedan son sueltos).

**Cómo se arma:** `herramientas/v187/patch_v187.py` sobre el ORIGINAL 186 publicado (`BASE_SHA` 5b7d3f2d…): reemplazos en `tiempoCol` (`hmFin`, `etHtml`, el − / + del cartelito), `cuadrillaDia` (`PANT.orden`, `.cd-links` de Modo obra), el Inicio viejo de la base (`renderInicio` y su relojito) + el módulo `cuadrilla187` antes de `revisarAppDiag`.

**Pruebas:** `t_v187` (nueva; Juan en el celu, CPU ×4; `SOLO=0..4`): 30/30 en el celu y con `REGLAS=1`; con `ANTES=1` contra la v186 el grupo 0 reproduce el «Enviar» trabado. Con la v187: `t_v164` 66/70 en la tanda con la máquina cargada (grupo 4 «cerrar la app a mitad» y un umbral de tiempo del 5); repetido solo, el 4 da 8/8 dos veces; el 5 falla también con la v186 en esta máquina (picos sueltos con CPU ×6, ver medidas), `t_v165` 59/59, `t_v166` 38/38 (y `REGLAS=1`), `t_v167` 76/76, `t_v171` 36/36, `t_v172` 74/74, `t_v149b` 37/37, `t_v157` 43/43, `t_v142` 49/49 (con la carpeta `guias/`), `t_circuito` 16/16 · 16/16, `t_v022` 33/33, `t_v086` 19/19, `t_v186` 67/67 · 70/70, `t_v161` 38/38, `t_v124` 10/10, `t_v119` 12/12. Ojo: la copia de `firebase_stub.js` de las pruebas perdió (desde la v165) la parte de la v164 que llama a `__snapRetener`; con ella las medidas de la cámara se parecen más a la app real.

**Huellas:** ORIGINAL `187_2026-11-25_app-EMA_ORIGINAL.html` `c6c8201972fc06395d563065e07741fd15672b068ac53a85246425de57cc09a3` · `index.html` `f63540de22d955042a9cf1164414ffa71fdd2eab7b566d95f19c8c7b416956bc` (sello `2026-11-25 08:48 · 57966c`).

**Qué tiene que hacer Ángel:** subir `index.html` a GitHub. Sin reglas nuevas ni APK.

## v186 — 19/11/2026 (publicada en GitHub 20/11) · El Inicio nuevo (contador del contrato), Órdenes › «Mañana», 📋 Itemizado y 📅 Gantt
**Pedido (Ángel, 20/11):** aprobó las maquetas del Inicio: «usemos la A que vos decías» = la opción A con la recomendación (el contador grande, sin segundos en el celu; de la B, el mapa y «las plazas de hoy» en UNA tarjeta, con el mismo número en el pin y en la fila). Y: «El tema del Gantt tiene que estar en un nuevo ítem del menú, como Gantt».

**Qué cambia (módulos `inicio186` —temprano, justo después de `inicioUnico`— y `plan186` —antes de `revisarAppDiag`—, bandera `__v186No`; sin reglas nuevas):**
- **Inicio de Administración, Oficina y Dirección** (`#ini186`; Dirección lo mismo sin botones que cambien nada): arriba el **contador del contrato** (días · horas · min, en la compu también los segundos), «Termina el martes 09/03/2027 · van N de M días desde el acta», la barra del **tiempo contra el avance** de la zona («vamos X puntos detrás/adelante del tiempo · hacen falta ≈ N módulos por día hábil») y, si hay fechas en el Gantt, la barra del **plan**. El acta sale de `configEquipo/precios.contratoInicio` + `contratoPlazoMeses` (4 meses = días corridos, termina a las 00:00 del día del plazo). Sin acta: la primera orden de la zona, «Fecha estimada: cargá el acta de inicio» y, para Administración, el botón que abre 📋 Itemizado › «Nuestra zona» con la fecha lista para cargar.
- **«Para atender» en una línea** (la cuenta y lo principal); al tocarla se despliega la lista de siempre (lo del Ejecutivo + lo de Dirección, con sus botones).
- **«Dónde trabajamos hoy»:** el mapa de siempre (Leaflet) y las plazas con orden hoy en la misma tarjeta, numeradas igual en el pin y en la fila; cada plaza con su % (el avance de obra de la app, v158), **antes → ahora de hoy** (el % sin lo de hoy, de `__av2.pctHasta`) y barritas por rubro; tocarla lleva a su avance de obra.
- **El avance del contrato:** anillo de la zona (módulos del pliego) y barras por rubro del itemizado (Columnas 1–8, Tableros 9–14, Zanjeo 15–20, Cruces 21–24, Cable 25–40, PAT 74–81, Retiros y otros), o «Por plaza».
- **Lo que sale del Inicio sigue en su lugar:** la orden sugerida → Órdenes › «🗓 Mañana»; el número del día, módulos por día, qué se hizo, curva S, clima, programación, plata, equipo, Supervisor, en obra, órdenes de hoy, accesos, obras y asistente → «**Ver todos los indicadores**» (abajo del Inicio: la pantalla de antes entera en una hoja, con ✕), y el Tablero del dueño / Informe semanal como siempre; las alertas también en «Para atender»; Obras y Órdenes en el menú y la barra de abajo.
- **Órdenes › «🗓 Mañana»** (subpestaña nueva del tablero): lo que la app armó para mañana (obras, gente, vehículo, tareas, puntos, avisos rojos, quién queda sin tarea) con «Ajustes» y «Revisar y emitir ›» → la misma hoja y el mismo motor de la v143. El aviso de las 17:00 de la gente sin tarea y el asistente («armá las de mañana») siguen igual. La línea vieja arriba del tablero ya no se repite.
- **Liviano (chequeo de rendimiento del 19/11, §1):** el Inicio de la v161 rearmaba todas sus piezas cada 2,5 s (≈ 0,8 s congelado cada vez con 250 obras). El nuevo no corre las piezas de antes de fondo (solo al abrir «Ver todos los indicadores»): el relojito de 2,5 s solo compara una firma de los datos (las listas de órdenes y obras, el acta, los avisos, el día); recalcula cuando cambian (juntando 1,5 s, como mucho cada 15 s; ≈ 30 ms con 250 obras y CPU ×4), «Para atender» (lo caro: Supervisor, alertas, sugerida) aparte y como mucho una vez por minuto, y solo después de un cambio; el contador cambia solo el texto (1 s en la compu, al cambiar el minuto en el celu); con el Inicio escondido, nada. El Inicio viejo (el de «solo mirar»), escondido detrás de la portada, ya no calcula el % de todas las obras cada 4 s. Medido quieto 60 s, celu CPU ×4, 250 obras: tareas largas ≈ 2,5 s contra ≈ 23 s del Inicio de la v185, la más larga 161 ms.
- **Menú › «📋 Itemizado»** (Administración y Oficina editan; Dirección y «solo mirar» miran): «Todas · nuestra zona» (con «Nuestra zona» y el acta, por rubro y por plaza) y cada obra con **contratado / hecho / falta** por ítem; lo contratado se cambia con ✎, **motivo obligatorio y «Sí»** por el mismo camino del Control del avance (`__auditAvance.planItem / aplicarItem`: `CO.aplicarAjuste` si el itemizado está fijado, `avanceHist`, auditoría); la fila muestra el último cambio con su motivo. Lo hecho sale de las órdenes y del avance de obra (no se toca acá). No se tocan los K.
- **Menú › «📅 Gantt»:** fechas previstas **por obra y por rubro** (los del avance de obra: Civil, Columnas, Cajas, Vínculos, Artefactos, Cableado, PAT, Tablero, Pruebas y cierre) contra lo **real** (de las órdenes) y «**a este ritmo**», con la línea de hoy y la del fin del contrato; en el celu lista con barras, en la compu línea de tiempo. «✎ Fechas» → cambiar → «Guardar fechas» con antes → después y «Sí». Se guardan en `avanceObras/{id}.planGantt` (la misma lista de siempre: cada fecha es una entrada `{id, tarea, desde, hasta}` con `g186` = "obra" o el rubro), así el Supervisor, la «prevista» de la programación de Dirección y el informe Gantt las leen sin cambios; auditoría `gantt_fechas`. «**Repartir las que no tienen fecha hasta el fin del contrato**» solo propone (una detrás de otra por cuadrilla, más días a las que les falta más; cuántas cuadrillas a la vez se cambia) y escribe recién con «Sí» (`repartido:true`).

**Cómo se arma:** `herramientas/v186/patch_v186.py` sobre el ORIGINAL 181 publicado (`BASE_SHA` 8140117d…): reemplazos chicos en `inicioPro` (el modo «dir» pinta el Inicio nuevo; sus botones `[data-ie]` también en `#ini186`), `inicioDir` (el Inicio lo pinta el módulo nuevo, «Ver todos los indicadores» abre la hoja de antes con las piezas del Ejecutivo, sus botones `[data-dr]` también en `#ini186`), `inicioUnico` (el estilo clonado de las piezas también para `#ini186`), `avanceObra2` (`pctHasta`: el % sin las órdenes ni lo marcado hoy), `tableroSub` (la subpestaña «Mañana»), el relojito del Inicio viejo (escondido no hace nada) y la regla que escondía todo lo que no fuera `#iniEje/#iniPan/#iniDir` en el Inicio; + los dos módulos. Sello `2026-11-19 23:34 · 8056bd`.

**Pruebas:** `t_v186` (nueva, `datos155`; grupos `SOLO=0..6`: partes del Inicio, contador con y sin acta con la hora de mentira `__i186Ahora`, antes → ahora y mapa, «Mañana» y emitir, Itemizado, Gantt y Repartir, roles y `__v186No`; 7 = celu, quieto 60 s con CPU ×4 y 250 obras de `datosGrande.js`: no rearma nada caro y las tareas largas bajan a menos de la mitad que con el Inicio de antes). `t_v186` PC 67/67 · celu 70/70 · `REGLAS=1` 67/67 · 70/70; `t_v161` 38/38 · 40/40, `t_v177` 52/52 · 16/16, `t_v156` 69/69 · 71/71, `t_v158` 72/72 · 72/72, `t_v163` 42/42 · 42/42, `t_v124` 10/10 · 11/11, `t_circuito` 16/16 · 16/16 (PC · celu), todo OK (las viejas corren con `__v186No`: no hubo que cambiar ninguna). `t_v155` 85/85 · 86/86 con `TZ=UTC` (con la hora de Córdoba después de las 21 falla el clima del «jueves»: la fecha, como dice §12). `t_v143` da lo mismo que la v181 publicada en las mismas condiciones (76/78 con la hora de Córdoba, 65/78 pasada la medianoche UTC: es la fecha de la prueba, no la v186).

**Huellas:** ORIGINAL `186_2026-11-19_app-EMA_ORIGINAL.html` `5b7d3f2d888761cfe2ce904d1380fdde748eb1a24ee88a01538686a87aaa9796` · `index.html` `f0a185b23fe6f6ed8bc556068ffc9bfd936ebb73d55d0db0324fa27fd21a1356`.

**Qué tiene que hacer Ángel:** subir `index.html` a GitHub. Sin reglas nuevas ni APK. Cargar la fecha del acta de inicio (Inicio › «Cargá la fecha del acta de inicio», solo Administración).

## v181 — 19/11/2026 (publicada en GitHub 19/11) · Registro de cambios en el Guardián
**Pedido (Ángel, 19/11):** «cada modificación, cada cambio —letra, color, nombre—, si se borra algo de la app, tiene que quedar registrado en la app qué es lo que se hizo y quién lo hizo, en el Guardián».

**Qué cambia (módulo `registroCambios`, temprano, + bloque `ia181` del asistente, bandera `__v181No`; sin reglas nuevas):**
- **Todo cambio queda anotado:** se envuelven UNA vez los caminos de escritura de Firestore (set, update, delete, add, lotes y transacciones). De cada uno: colección y documento, alta / cambio / borrado, cada dato **antes → después**, quién (correo, nombre, rol), cuándo, en qué pantalla y con qué hoja abierta, y si fue el asistente, un proceso automático, la cola sin señal o «volver un cambio». El «antes» sale de lo que la app ya tiene en memoria (las escuchas) o de la copia local del celu: **nunca una lectura de más a la base**. De lo borrado queda la copia completa.
- **Resumen en castellano:** «Renombró la obra PLAZA SAN MARTÍN → PLAZA SAN MARTÍN NORTE», «Cambió el color del pin de … de rojo a azul», «Borró el gasto de $ 12.000 «Hormigón elaborado» de …», «Pasó la reserva R-0045 de lista a entregada», «Cambió el precio de 1019 … de $ 100 a $ 120», «Cambió la nómina…: Mauricio Mainini: sector alumbrado → ilicitos», «Borró la foto Col 1 de …», «Marcó en la orden OT-…».
- **Cuidando el cupo (plan gratis, 20.000 escrituras por día):** lo de unos segundos va en UN documento de `auditoria` (`accion:"cambios_app"`); la cuadrilla por minuto; las fotos nuevas solo como cuenta. Afuera: latidos, ubicación en vivo, turnos/salud, avisos, la propia auditoría y los secretos. Sin imágenes ni base64, textos largos cortados, sueldos «[privado]», claves «[oculto]», < 1 MB. Cuenta las escrituras del día y, cerca del cupo, anota solo resúmenes. Estimado: ≈ 400–800 escrituras por día (2–4 %). Con la cámara abierta no hace nada (lo arma después).
- **Guardián › «📜 Historial de cambios» (solo Administración):** filtros (fechas, persona, tipo, sección, obra, texto), cada cambio con su antes → después, **«↶ Volver este cambio»** y **volver a crear lo borrado** con «Sí» (lee cómo está hoy y avisa si cambió después; la vuelta también queda anotada), Excel y PDF, y lo que costó hoy. Cada alerta del Guardián (v176) tiene **«📜 Quién lo cambió»**: abre los cambios de esa lista desde la copia anterior, con el que la bajó marcado.
- **Asistente (solo Administración):** `historial_cambios` («¿quién cambió X?», «¿qué se cambió ayer?», «¿qué hizo Fulano?») y `proponer_revertir_cambio` (tarjeta y «Sí»).

**Cómo se arma:** `herramientas/v181/patch_v181.py` sobre el ORIGINAL 184 (`--otra-base`; `BASE_SHA` = el de la 184): el módulo antes de `lecturasCuenta` (las escuchas se abren al entrar: tiene que estar antes), dos reemplazos chicos en la hoja del Guardián y el bloque `ia181` + una línea del SISTEMA en el asistente dormido. Sin reglas nuevas (la regla de `auditoria` ya deja crear con el propio correo).

**Pruebas:** `t_v181` (nueva, `datos181.js`) PC 57/57 · celu 57/57 · `REGLAS=1` 57/57 · 57/57 (una vez en el celu la ráfaga salió en 2 documentos porque pasó los 3 s del tope de la prueba: está permitido). Con las envolturas prendidas en las pruebas viejas (`V181=1`): `t_v184` 68/68 · 68/68, `t_circuito` 16/16 · 16/16; sobre la 185: `t_v185` 57/57 · 56/56, `t_v182` 45/45 · 45/45, `t_v176` 42/42 · 42/42; sobre la 183: `t_v183` 35/35 · 35/35, `t_v174` 57/57 · 57/57 y `t_v180` 84/84 en el celu (en la PC con la máquina cargada `t_v174` 56/57 y `t_v180` 29/31 a veces: la sección del legajo se refresca cada 1,5 s; sola, 37/37). `t_v178` 40/41 · 76/77 falla igual con la v179 sola (el «📄 Remito para firmar» tapa «Enviar»; Dirección «vacía en memoria»). **Cámara (`t_v164`, CPU ×6, toques reales):** con y sin `V181` salen los mismos picos sueltos de 150–450 ms con la máquina cargada (sin V181 68/70, con V181 69/70 · 68/70); con `__rcDebug` se midió: con la cámara abierta cada anotación tarda 0–6 ms y no se arma ni se escribe ningún registro (se deja para después). El camino del SDK real (prototipos, lotes, transacciones con reintento): `node herramientas/v181/real_sdk.js`.

**Sello:** `2026-11-19 14:31 · 09b88c` · ORIGINAL `8140117d97c5908cf0788da21873fc21a8172dd3a63cd7143c3a06ae89f9ae92` · index `09655f6091c54bcf3afbef92c149fbcd634229ded37fc8b2d31d79b84bd0fdc3`.

## v185 — 19/11/2026 (publicada en GitHub 19/11) · La Calculadora por rubros (opción A)
**Pedido (Ángel, 19/11):** «VAMOS CON LA A» — la Calculadora (plaza y barrio) con subíndices por rubro, como la maqueta A.

**Qué cambia (módulo `calc185` + `calc185Css`, bandera `__v185No`; no se toca nada del cálculo):**
- **Pestañas por rubro** arriba de la Calculadora: plaza **Obra · Columnas · Luminarias · Eléctrico · Civil · PAT · Resultado**; barrio **Obra · Luminarias y postes · Red aérea · Alimentación y tablero · PAT de red · Resultado**. Cada una con su **puntito**: verde = completo, naranja = falta algo (obra sin nombre, columnas en 0, vínculos en 0, cableado sin circuitos, civil sin bases ni zanja, barrio sin luminarias) o el último cálculo dejó un aviso de ese rubro; sin puntito = todas sus «Incluir esta tarea» apagadas. En el celu la fila de pestañas se desliza adentro suyo (sin scroll de costado), 64 px de alto; en la compu, las 7 en una fila.
- **Los campos de siempre**: las tarjetas no se rearman, se marcan con su rubro y se muestran las de la pestaña (mismos id, mismo `calcular()`, `restaurarFormulario`, `__calcEditar`, «Editar» del historial, el asistente `proponer_calculo`, las potencias de la v183, las validaciones y el acordeón del celu: al entrar a una pestaña sus tarjetas se abren). Obra = Datos de la obra + «¿Quién pone el material?»; Columnas = nuevas + existentes + retiros; Luminarias = vínculos y luminarias (con las potencias); Eléctrico = cableado + tablero y acometida + elementos del tablero + empalmes; Civil = obra civil + cruce; **PAT = tarjeta nueva con el esquema de conexión a tierra movido ahí** (el mismo campo) y qué sale solo. Plaza / Barrio (el mismo selector de siempre) va arriba de las pestañas; Historial y Material por obra siguen como subíndices arriba. «‹ Columnas · Eléctrico ›» al pie de cada pestaña.
- **Barra de abajo** (la `#calcFlotante` de siempre, ahora también en la compu): materiales · ≈ módulos K (el itemizado que da el cómputo, como «📥 Del cálculo de la obra»; barrio: «sin itemizado de barrio todavía») · avisos · «Cambió algo desde el último cálculo» · **⚡ Cálculos rápidos** · **Calcular** (el mismo; después va al Resultado).
- **Compu: «Lo que sale de este rubro»** al lado de cada pestaña (del último cálculo; en el celu, abajo en corto «y N más ›»), con sus avisos y las notas del cómputo plegadas.
- **Resultado:** materiales, módulos K y avisos; «Por rubro» (una tarjeta por rubro con su tabla y «✎ Cambiar» que lleva a la pestaña) · «Hoja completa · itemizado · pañol» (el resultado de siempre, con imprimir, registrar y el pañol) · «Avisos (N)». «Ver» del historial y todo lo que lleva al resultado abren la hoja completa; lo que lleva a un campo (foco, «ir a la sección», «Editar») abre su pestaña.

**A confirmar:** qué cuenta como «falta algo» en cada puntito; que los avisos del número sean solo los avisos del cálculo (las notas ⚠ que vienen siempre —normas, criterios— van plegadas en cada rubro); en qué pestaña va cada tarjeta (retiros en Columnas, empalmes en Eléctrico, «¿Quién pone el material?» en Obra; barrio: retiros en Obra, PAT de las unidades en PAT de red); el módulo K de la barra cuenta todo el itemizado previsto (también provisiones).

**Cómo se arma:** `herramientas/v185/patch_v185.py` sobre el ORIGINAL 182 publicado (`b7e43ad6…`, con la 180 y la 183) (solo el módulo antes de `revisarAppDiag` y el sello: anda igual sobre la 181, 182 y 184). Sin reglas nuevas.

**Pruebas:** `t_v185` PC 57/57 · celu 56/56 · `REGLAS=1` 57/57 · 56/56; `t_v183` 35/35 · 35/35, `t_v066` 13/13 · 13/13, `t_v067` 21/21 · 21/21, `t_v101` 10/10 · 11/11, `t_v102a`–`e` OK (10/10 · 11/11, 8/8, 11/11 · 12/12, 8/8, 6/6), `t_v103` 7/7 · 7/7, `t_v108b` 11/11 · 11/11, `t_circuito` 16/16 · 16/16 (PC · celu), todo OK (las viejas corren con `__v185No`: no hubo que cambiar ninguna).

**Sello:** `2026-11-19 13:59 · 82476b` · ORIGINAL `a118faaa05490bcf3836e886ca98b5aad426ca89cbda154e1f3c40b56184a41b` · index `171dcc043301bc50edb8c0add7b6b9e24053f83cf13b4d93b06d69bb26079b10`.

## v182 — 19/11/2026 (publicada en GitHub 19/11) · Datos seguros: los agujeros de la auditoría del 19/11
**Pedido:** arreglar lo que encontró la auditoría del 19/11 sobre la v176 («¿pasó algo más?», `INFORME.md`): lugares donde se podían pisar o borrar datos de verdad.

**Qué cambia (sin bandera: son arreglos; módulo `datosSeguros` + `datosSegurosCss` + reemplazos chicos):**
1. **Caché vacía ≠ «llegó la base»:** las escuchas de `configEquipo/baremo`, `personal`, `precios`, `cuadrillas`, `ubicacion` (y `reinicios`) ya no marcan `__cfgCargado` / `__personalCargado` cuando el documento llega `!exists` desde la caché (`metadata.fromCache`: aparato nuevo, caché borrada, sin señal). La guardia de la v174 frena «Guardar» con lo de fábrica hasta que conteste el servidor (también sin señal, que antes quedaba en cola y salía al volver). La lectura de la ubicación al guardar, igual.
2. **Respaldo completo:** cada lista se lee **de la base** (también las **obras archivadas**; antes iba solo lo visible de la memoria); si no se puede leer, va lo del aparato y el cartel lo dice en ámbar; si tampoco hay, en rojo. Suma `configEquipo/ubicacion` y `reinicios`. Formato `respaldo-completo-v3`.
3. **«⬆ Restaurar desde un respaldo» sin duplicar:** compara contra la **base** (la lee), saltea lo que ya está por su número de registro **o** por sus datos (obra renombrada o archivada, orden, movimiento), escribe lo que falta **con su mismo número de registro** (restaurar dos veces no duplica), en el catálogo **solo completa datos vacíos** (nunca el costo ni la descripción de hoy); hoja con «se agregan N, se saltean M (ya están)» por lista, «Sí» y una segunda confirmación; auditoría `respaldo_restaurar` con lo agregado. Solo Administración y Oficina. Las fotos (`respaldo-fotos-v1`) siguen como antes (ya solo agregaban).
4. **Borrar de verdad:** «🗑 Reiniciar movimientos», «⬆ Importar y REEMPLAZAR todos los movimientos» y «🗑 Limpiar historial» (cómputos) van en **«⚠ Zona peligrosa»** (solo Administración), con dos confirmaciones (la segunda escribiendo **BORRAR**), un archivo con lo que se borra que se baja solo **antes** y la auditoría `zona_peligrosa`. `fbClearMovimientos` / `fbReplaceAllMovimientos` / `fbHistCalcVaciar` no borran por ningún otro camino («se anulan, no se borran»). «⬆ Importar movimientos (JSON)» común **solo agrega** lo que falta (hoja «se agregan N, se saltean M»; auditoría `movimientos_importar`).
5. **Equipos habituales:** el borrador armado antes de que llegue `personal` se vuelve a armar con lo guardado cuando llega (no se queda con la propuesta de ejemplo).
6. **⚙ del asistente** (roles, modelo, límites, a quién le llegan los avisos) y **quién ve el tablero del dueño:** escriben por la guardia (`window.__dsPersonalSet` → `__psGuardia`: base llegada + `respaldos[]`); lo abierto antes de que llegue la base se vuelve a cargar y pide guardar de nuevo.
7. **Teléfonos de «La cuadrilla en obra»:** sacar uno ya no toca la copia de la base antes de guardar, así la guardia pregunta «¿Sacar 1…?»; lo que se saca de `seguridadCuadrilla` / `herrPorTarea` también pregunta; lo abierto antes de la base se vuelve a cargar.
8. **Chicos:** reinicios de puntos armados con lo de fábrica no se guardan (lee la base y pide tocar de nuevo); los Ajustes de la orden sugerida empezados antes de que llegue el baremo se vuelven a cargar antes de guardar; Gastos › Precios usa lo de la base si es más nuevo que lo guardado en el aparato; `avanceHist` / `avanceNotas` se agregan con `arrayUnion` (dos aparatos casi a la vez no se pisan).

**Queda documentado (no cambiado):** `valorItems`, `etapas`, `puntos`, `planGantt` y `documentos` siguen reemplazando el campo entero desde la memoria (comparar con `__orig` ya evita pisar los campos que no cambiaron; si dos aparatos cambian el mismo campo casi a la vez, gana el último); los `items` de una reserva igual. Pasarlos a transacción es un cambio grande: sin pedido.

**Cómo se arma:** `herramientas/v182/patch_v182.py` sobre el ORIGINAL 183 (`0650f1a4…`; los mismos reemplazos andan sobre la 178, 179 y 180) (`datosSeguros.js` / `.css` antes de `revisarAppDiag`). Sin reglas nuevas.

**Pruebas:** `t_v182` PC 45/45 · celu 45/45 · `REGLAS=1` 45/45 · 45/45 (el grupo 2 se corrigió en la prueba —la cabecera de la tabla sale en mayúsculas por CSS— y se repitió: 9/9 · 9/9); con `ANTES=1` contra la v178 publicada falla en cada grupo (la caché vacía guarda, el respaldo sin archivadas ni movimientos, la restauración duplica obras y pisa el catálogo, `fbClearMovimientos` borra, importar reemplaza, la tarjeta se queda con la propuesta, ⚙ Límites pisa con lo de fábrica, los teléfonos sin pregunta, `avanceHist` pisado, reinicios pisados). `t_v174` 57/57 · 57/57, `t_v176` 42/42 · 42/42, `t_v178` 86/86 · 86/86, `t_v145` 82/82 · 82/82, `t_v142` 49/49 · 49/49, `t_v141` 44/44 · 44/44, `t_circuito` 16/16 · 16/16 (PC · celu), todo OK sin cambiar las pruebas viejas.

**Sello:** `2026-11-19 13:20 · bedb22` · ORIGINAL `b7e43ad66324dd30ce6455d8cc74a75ba833574bef07e0d304a37a5673f82a20` · index `da6ffe26ebbfbf50a0a23e7bf292e319851957879778d7100311d6276861c290`.

## v184 — 19/11/2026 (publicada en GitHub 19/11; reglas v184 por publicar) · 💬 Chat interno con pedidos que arma el asistente
**Pedido (Ángel, 19/11):** «otra cosa para agregar un chat interno — oficina y administrador registran los que pueden entrar — sería algo como para que los de cuadrilla pidan cosas como "faltó hacerme esta tarea, agregarme esto" me entendés — y la IA me cree la tarea y me diga que la apruebe a mí y a la oficina».

**Qué cambia (módulo `chat184` + `chat184Css`, bandera `__v184No`):**
- **Quién entra:** Administración y Oficina siempre; **Dirección** mira todo (sin escribir ni aprobar); el resto (cuadrilla, operario, pañol, solo mirar) **solo si Administración u Oficina lo habilitó** en ⚙ del chat (`configEquipo/chat.habilitados`, auditoría `chat_habilitar`).
- **Conversaciones:** «General» (todos los que entran) y **una por persona con la oficina**. Texto, **foto** (miniatura en el mensaje y la foto a la nube) y **dictado** 🎤. Globito de lo no leído en el menú («💬 Chat interno»), en **Perfil** y en la pestaña «Perfil» de la barra de abajo; **aviso al celu** del otro lado (al tocarlo abre esa conversación). Sin señal: «⏳ Sin enviar» y sale solo cuando vuelve.
- **Pedidos con el asistente:** la cuadrilla escribe en su conversación «faltó cargarme la zanja de 10 m de hoy» → el asistente (Worker `ema-ia`, una pregunta con los topes de su rol, **solo con SUS órdenes**) arma la tarjeta: **sumar una tarea a su orden abierta**, **corregir el cierre** de una cerrada o **reclamo de puntos**; le contesta «Le mandé a Ángel y a la oficina para que lo aprueben» y avisa al celu de Administración y Oficina. Si falta un dato, pregunta en el chat. Sin asistente (sin señal, tope, caído), el mensaje llega igual como texto.
- **Aprobar:** Administración u Oficina ven la tarjeta con **antes → después**; «✅ Aprobar» (motivo precargado) lo hace por los caminos de siempre (la orden por `fbOtUpdate`; el cierre por «✏ Corregir cierre» de la v153; el reclamo de puntos con el análisis de la v155) o «✕ No corresponde» con motivo obligatorio. A la persona le llega el aviso; auditoría `chat_pedido`. **Nada cambia sin aprobar.** Nadie borra mensajes.

**Reglas nuevas (`firebase/Reglas_Firestore_v184.txt` = v155 + chat):** `configEquipo/chat`, `chatHilos`, `chatInterno`. Mientras no se publiquen, el chat no guarda nada: Administración y Oficina ven «Falta publicar las reglas de Firebase de la v184» (en el chat, en el menú y un aviso por día) y la cuadrilla no lo ve.

**Qué tiene que hacer Ángel:** 1) publicar las reglas `Reglas_Firestore_v184.txt` (Firebase › Firestore › Reglas › pegar todo › Publicar); 2) subir el `index.html`; 3) en la app, Chat interno › ⚙ habilitar a los que van a entrar. No hace falta APK nuevo ni cambiar Workers.

**A confirmar:** solo «General» + una por persona (sin chats entre dos de la cuadrilla); el asistente se usa solo si el mensaje suena a pedido; «sumar a la orden» suma a lo previsto (no marca hecho); lo leído queda en cada aparato; la conversación muestra el mes en curso («Ver el mes anterior»).

**Cómo se arma:** `herramientas/v184/patch_v184.py` sobre el ORIGINAL 185 (`a118faaa…`, con la v180, v182, v183 y v185) (`chat184.js`, `chat184.css` antes de `revisarAppDiag`; el globito en «Perfil» de `navBarra`). Estudiado sobre la 179; las v180–v185 no tocan nada de lo que usa.

**Pruebas:** `t_v184` PC 68/68 · celu 68/68 · `REGLAS=1` 70/70 · 70/70; `t_v141` 44/44 · 44/44, `t_v153` 53/53 · 55/55, `t_v178` 86/86 · 86/86, `t_circuito` 16/16 · 16/16 (la PC repetida sola: la primera dio 15/16 por tiempos con la máquina cargada), `t_v155` 84/85 · 85/86: falla solo «lluvia el jueves…» porque hoy es jueves (la prueba espera «Jueves» y la app dice «hoy»; pasa igual con la v183, no es de la v184). El `firebase_stub.js` de pruebas ahora le pasa a la regla los filtros de la consulta también al escuchar (`onSnapshot`), como Firestore (`herramientas/v184/firebase_stub_v184.diff`).

**Sello:** `2026-11-19 14:10 · 4c16ee` · ORIGINAL `301d62f1e86d6c2bf3afd29de7df1c94bc16df6158a1588a7ac2359aa1d7623c` · index `6be8372ddf95903ad5ef13e699d3ceffc9a14ee0683332ec6ef9c8511dddef77` · reglas `7d240b1bf1f8e6679304254f0d4fc03d81cf695400354684783364dbcc48ad6c`.

## v183 — 19/11/2026 (publicada en GitHub 19/11) · Calculadora: cable 3×1,5, ganancia de 6 m y luminarias de distinta potencia
**Pedido (Ángel, 19/11):** «la calculadora modifiquemos 4 metros para cables 3x1,5 brazo de 0.4 m columnas de 7 metros ese cable es para el artefacto y la ganancia de abajo hacia arriba es de 6 metro para columna de 10 metros también 6 metros de abajo hacia arriba y de arriba hacia abajo o sea el 3x1.5 son 7,5 metros con brazo de un metro y lo que nos faltó agregar es que a veces usamos en la misma obra luminarias de distinta potencia agrega eso».

**Qué cambia (módulo `calc183` + `calc183Css` + reemplazos chicos, bandera `__v183No`):**
- **Cable 3×1,5 a la luminaria, uno por artefacto:** **4 m** en columna de 7 m con brazo de 0,4 m y **7,5 m** en la de 10 m con brazo de 1 m (antes (altura − caja) + brazo + 0,60 = 4,5 / 8,1 m). El capuchón de 0,425 y el cuádruple de 1,025 cuentan como 0,4 y 1 m. Otra combinación (7 m con brazo de 1 m, 10 m con 0,4, brazo de 1,5 m…) = la más parecida + la diferencia de altura y de brazo, **«a confirmar»** en el cómputo. Con columnas de 7 y de 10 m en la misma plaza, los brazos de 1 m o más van en la de 10 m y los cortos en la de 7 (a confirmar). Lo usan el cómputo (6001), el ítem 30 de la vista previa del itemizado y la cuenta del ítem 30 de las plazas certificadas; la guía «Preparación en galpón» y Proyectista (4 m de entrada) dicen lo nuevo.
- **Ganancia del troncal: 6 m por subida** («de abajo hacia arriba»), en columnas de 7 y de 10 m (antes PRFV 3,5 + 0,5 = 4 m y metálica 5 m). Las subidas siguen siendo 2 × columnas − circuitos y el 5 % de reserva / `itemCant` igual. Campo, ayuda, resumen y guía de tendido («6 m, o 12 m si sigue a la próxima»).
- **Luminarias de distinta potencia en la misma obra:** en «Vínculos y luminarias», «＋ Otra potencia en la misma obra» → «💡 Luminarias por potencia»: la primera es la potencia de siempre y lleva el resto; cada otra con potencia, cantidad y **producto del pañol** (lista de luminarias de la familia 6; sin elegir queda «elegí el producto del pañol (a confirmar)» sin código: nunca se inventa). El cómputo trae un renglón por potencia («Luminaria vial LED 180 W — producto 6011…»), la potencia instalada (kW) y las corrientes en 220 V / 380 V (cos φ 0,95, como «💡 Consumo»), aviso si una luminaria pasa lo que aguanta el fusible de 2 A, y las provisiones salen solas: **85.1** (75 W) y **85.2** (180 W). Se guarda en el formulario (campo `lumTipos183`): editar el cómputo trae las potencias; un cómputo viejo sale con una sola, como antes. «Ver en 💡 Consumo» lleva las potencias a Cálculos rápidos, que suma «Otra potencia» (la caída de tensión ya tenía la potencia de cada columna).
- **Asistente:** `proponer_calculo` acepta `cambiosForm.luminarias [{potencia, cantidad, codigo}]` (la tarjeta muestra «todas de 75 W» → «75 W (el resto) + 8 × 180 W (6011)»; un código que no es una luminaria del pañol se rechaza).

**A confirmar:** el cable en metálica (la fórmula de antes daba 5,50 m en 7 m con brazo de 400 mm, verificada contra el ítem 7.7 de cuatro cómputos oficiales; ahora 4 m); los 6 m de ganancia también en metálica (antes 5 m: caja a 2,50 m); las combinaciones que Ángel no dijo; en qué columna va cada brazo cuando hay 7 y 10 m; la calculadora de barrio sigue con una sola luminaria por cómputo (no se tocó).

**Cómo se arma:** `herramientas/v183/patch_v183.py` sobre el ORIGINAL 180 (`327b9bdd…`; la v179/v180 no tocan nada de lo que usa: se aplicó igual sobre la 179) (`calc183.js`, `calc183.css` antes de `revisarAppDiag`).

**Pruebas:** `t_v183` PC 35/35 · celu 35/35 · `REGLAS=1` 35/35 · 35/35; `t_v066` 13/13 · 13/13, `t_v067` 21/21 · 21/21, `t_v101` 10/10 · 11/11, `t_v102a`–`e` OK (10/10 · 11/11, 8/8, 11/11 · 12/12, 8/8, 6/6), `t_v103` 7/7 · 7/7, `t_v108b` 11/11 · 11/11, `t_circuito` 16/16 · 16/16 (PC · celu), todo OK (las viejas corren con `__v183No`: no hubo que cambiar ninguna). `t_v134` 32/33 · 34/35: el mismo renglón falla igual con la v180 publicada («proponer_editar respeta los permisos…», viene de antes; no es de la v183).

**Sello:** `2026-11-19 13:09 · d49ee4` · ORIGINAL `0650f1a44425c1f54398ecad46047ec3c4fc007e316506486cf63bb8aef9c5d5` · index `206f545de7012a126a4f81c41c3e65739b1d3a1cba622ea21bee289b3f709f49`.

## v180 — 19/11/2026 (publicada en GitHub 19/11) · 🗂 Unir, mover y eliminar carpetas de obra
**Pedido (Ángel, 19/11):** «en carpetas a veces se crean por error o son duplicados; hay que poner la posibilidad de mover o eliminar carpeta, mover órdenes, fotos, todo». «Carpeta» = una obra (su legajo en Obras / su registro en `avanceObras`).

**Qué cambia (módulo `carpetasObra` + `carpetasObraCss`, bandera `__v180No`; solo Administración y Oficina con «editar» en Registrar obra o Avance):**
- **Legajo › «🗂 Unir, mover o eliminar esta carpeta»** (`#lgCpSec`, al final del legajo): si parece repetida, «Puede ser la misma que X (mismo ID, mismo nombre, pines a 22 m)» con «🔗 Unir con esa» / «No son la misma»; y los tres botones.
- **🔗 Unir con otra obra** (hoja `#cpOv`): elegir la buena (las parecidas arriba + buscador) → el **inventario completo** de la que sobra (órdenes, fotos, videos, PDF, archivos, vales/entradas/devoluciones, reservas, cálculos, gastos, avances de etapa, planos, puntos del mapa, relevamientos, tareas de la planificación, avisos) con antes → después de la buena, el avance que se junta y **lo que choca** (gana el destino salvo que se elija: «Queda / Pasa a / Sumar») → «Sí, unir» → «¿Seguro? Se pasan N cosas…» → **«🔗 Unir»**. Cada documento cambia `plazaId`/`plazaNombre`/`obraId`/`destino`/`barrio` (fotos y adjuntos con `movidaDe`, relevamientos `obraId`/`obraNombre`, cálculos con su formulario, tareas de la semana por nombre, las órdenes cerradas con su `cierre.avanceItems` apuntando a los ítems de la buena); el avance a mano se junta sin perder nada (itemizado ítem por ítem, `av2` marcas/cosas/historial, `avanceHist`, `avanceNotas`, `coAjustes`, documentos, certificados, carpeta, barrio, dirección, ubicación, columnas, Gantt, fotos borradas, etapas). La de origen queda **archivada** (`oculta`) con `unidaEn` — **no se borra**.
- **Se puede seguir y deshacer:** el plan entero (cada documento con su valor de antes) se guarda primero en la obra de origen (`union {estado, destino, pasos[{c, i, k, p, a}], hechos, merge{patch, antes, huella}, obrasHecho, fuenteAntes}`), se escribe por tandas de ≤ 400 (+ el avance `union.hechos` en la misma tanda) y, si se corta, el legajo dice «⏸ quedó a mitad (N de M)» con «▶ Seguir» / «↶ Deshacer lo hecho» (y el Supervisor en rojo). «↶ Deshacer unión» vuelve cada cosa (lo que se movió después a otro lado y lo que cambió en la buena después de unir no se toca, y se dice). Auditoría `obra_unir` / `obra_unir_deshacer` con cada id.
- **↔ Mover cosas a otra obra:** tildar órdenes (cada una se lleva sus fotos, videos, reservas y —si se quiere— el avance del itemizado que dio al cerrarse), fotos sueltas (con el motor de «↔ Mover» de la v152), vales, reservas, cálculos, gastos, planos, etapas, puntos y relevamientos → «Sí, mover» → «↶ Deshacer» (lo último, `mover180`). Auditoría `obra_mover`.
- **🗑 Eliminar carpeta:** revisa TODO en la base y muestra cada colección ✓/✗; solo si está vacía (sin nada en ninguna parte ni avance, papeles o certificados cargados): «Sí, eliminar» → escribir el nombre → antes queda la **copia entera en la auditoría** (`obra_eliminar` con `copia`), después se borra; «↶ Volver a crearla». Si tiene algo: «No se puede» con lo que tiene + «🔗 Unir con…» / «🗄 Archivar». Si las reglas no dejan borrar, se archiva y se dice.
- **Posibles duplicadas** (mismo ID, nombre igual o casi igual —sin tildes ni «plaza»—, pines a menos de 50 m): tarjeta `#cpDupCard` arriba de Obras con «🔗 Unir» (propone dejar la que tiene más cargado; «⇄ Quedarse con la otra») y «No son la misma» (`noDuplicadaDe` en las dos), línea ámbar en el Supervisor.
- **Asistente** (bloque `ia180` dormido): `revisar_carpetas` (duplicadas, las que parecen vacías, inventario de una obra con los id), `proponer_unir_obras` (con `elegir` para los choques), `proponer_mover_a_obra` (órdenes, vales, reservas, cálculos, gastos, planos, puntos, fotos o «todo» de un tipo con desde/hasta), `proponer_eliminar_obra` (si tiene algo: «no_se_puede»); tarjeta antes → después, «Sí, unir / mover / eliminar» y, para unir y eliminar, la segunda confirmación de la app (`#cpConf2`: «🔗 Unir» / escribir el nombre). Mismo motor que la hoja. SISTEMA «CARPETAS DE OBRA (v180)», chip «🗂 Carpetas repetidas». Solo admin/oficina (Dirección no recibe ni `revisar_carpetas`).

**Lo que las reglas no dejan (sin reglas nuevas):** los **avisos de la cuadrilla** («📨 Para resolver», `avisosCuadrilla`) solo admiten marcar visto/resuelto: al unir quedan con la obra de origen (se dice en la hoja y en la tarjeta; se siguen viendo en «Para resolver») y por eso una carpeta con avisos no cuenta como vacía. Mover a mano un documento sin permiso en esa hoja (p. ej. una oficina sin «editar» en Gastos) corta con «la base no dejó» y queda para «Seguir». Las imágenes en R2 no cambian de carpeta (como «↔ Mover»: cambia la ficha).

**A confirmar:** «pines a menos de 50 m» y «nombre casi igual» (2 letras) para sugerir duplicadas; que la buena sea la que tiene más cargado; en los choques gana el destino; lo que el v178 ya permite (`proponer_accion` borrar obra) sigue sin revisar si está vacía: la v180 es el camino seguro.

**Cómo se arma:** `herramientas/v180/patch_v180.py` sobre el ORIGINAL 179 (`05dccc61…`; la v178 y la v179 no tocaron nada de lo que usa) (`carpetas.js`, `carpetas.css` antes de `revisarAppDiag`; `ia180.js` antes de `window.__asistente`; botón de la tarjeta, SISTEMA, Dirección sin `revisar_carpetas`, Supervisor y su «ir»). Sin reglas nuevas.

**Pruebas:** `t_v180` PC 84/84 · celu 84/84 · `REGLAS=1` 84/84 · 84/84; `t_v152` 73/73 · 73/73, `t_v151` 47/47 · 47/47, `t_v158` 72/72 · 72/72, `t_v168` 83/83 · 83/83, `t_circuito` 16/16 · 16/16, `t_v175` 47/47 · 47/47, `t_v178` 86/86 · 86/86, `t_v179` 45/45 · 45/45 (PC · celu), todo OK (`t_v178` necesita la línea `__v178No` en `pruebas/h.js`, que no está en el repo: con ella pasa). Capturas: carpeta de trabajo `v180/cap/` (legajo, revisar, confirmar, listo, unida, a mitad, mover, vacía, escribir el nombre, no vacía, Obras, asistente; PC y celu).

**Sello:** `2026-11-19 11:36 · 88a5d0` · ORIGINAL `327b9bdd2cdf2bf0b7170b4aa95a0bb6635ae3ce03ef36654b13fdb67c85ddf2` · index `318e659046790f34f77551c39702883c7fb9ae7823d1bdda72c8459281f28378`.

## v179 — 19/11/2026 (publicada en GitHub 19/11) · Personal del equipo por sector
**Pedido (Ángel, 19/11):** «dentro de Personal del equipo tiene que tener subíndices que separen a Ilícitos, Alumbrado, Civil, Contratista, Oficina, Dirección y Pañol».

**Qué cambia (módulo `sectores179` + reemplazos chicos, bandera `__v179No`):**
- **Producción › Personal del equipo:** pestañas Todos · Alumbrado · Civil · Ilícitos · Contratista · Oficina · Dirección · Pañol con la cantidad de cada una; filtran la tabla (se esconden filas: «Guardar» lee a todos, nadie se pierde por estar en otra pestaña); «＋ Agregar persona» trae el sector de la pestaña; la última pestaña queda en el aparato (`ema.per.sector`). En el celu la fila de pestañas se corre adentro, sin scroll de costado.
- **El «Sector» de cada persona** suma Civil, Contratista, Oficina, Dirección y Pañol (claves `civil`, `contratista`, `oficina`, `direccion`, `panol` en el campo de siempre `nomina[].sector`; `alumbrado` e `ilicitos` igual; sin sector = Alumbrado). Se guarda por la guardia de la v174 (copia en `respaldos[]`).
- **Civil** = sector Civil + los de Alumbrado marcados «equipo civil» (v143), con la marca «equipo civil». Administración tiene «Pasar los de equipo civil al sector Civil (N)» con «Sí» (guardia v174, auditoría `personal_sector`). La app no cambia nada sola.
- **Gente sin tarea (v145) y orden sugerida (v143):** solo los sectores de obra (Alumbrado, Civil, Ilícitos); Contratista, Oficina, Dirección y Pañol no se reclaman ni entran como libres. Civil cuenta como equipo civil.
- **Pañol:** el vale sigue con dos sectores; Ilícitos va como Ilícitos y todos los demás (también Civil y Contratista) como Alumbrado (`sectorDePersona` sin cambios). «Por sector» lo dice.
- **Llenar orden:** el sector al lado del nombre en «Tocá para sumar o sacar a alguien» (menos Alumbrado). La lista para elegir el nombre también lo dice.
- **Asistente (v175):** `nomina` con `sector` para filtrar (Civil con los de equipo civil) y la cuenta `porSector`; `proponer_personal` entiende «obra civil», «pañol», «contratado», «oficina», «dirección»…; un sector que no existe lo dice.
- **Sin cambios:** puntos y producción, Gastos / mano de obra (usa el valor hora, no el sector).

**Cómo se arma:** `herramientas/v179/patch_v179.py` sobre el ORIGINAL 178 (`13d0ec8e…`): el módulo `sectores179` antes de `revisarAppDiag` + reemplazos chicos. Sin reglas nuevas.

**Pruebas:** `t_v179` (nueva, `datos179.js`) PC 45/45 · celu 45/45 · `REGLAS=1` 45/45 · 45/45. `t_v143` 78/78 · celu 77/78 (la carrera conocida de `vehiculoPersona` del asistente, §12; falla igual en la v177/v178), `t_v145` 82/82 · 82/82, `t_v174` 57/57 (al repetirla sola; la primera vez 56/57 por tiempos) · 57/57, `t_v175` 47/47 · 47/47, `t_v176` 42/42 · 42/42, `t_circuito` 16/16 · 16/16.

**Sello:** `2026-11-19 11:20 · d490de` · ORIGINAL `05dccc61b06310f2a95773b996e148e6dc24afebfb81d9d9d47f40f3e78e3fe9` · index `c28c9fb27567d858d3e742e1606894c7e148932668906d699c25e3bde07b5923`.

## v178 — 19/11/2026 (publicada en GitHub 19/11) · El asistente ve TODO y hace TODO
**Pedido (Ángel, 19/11):** «la IA de la app tiene que saber y ver todo lo de la app, absolutamente todo; no puede decirme que no ve; tiene que poder ver todo, saber todo y poder hacer todo. Revisá eso.»

**Por qué decía «no lo veo» (revisión completa: `herramientas/v178/COBERTURA.md`):** (1) mucho se carga recién al abrir su pantalla (herramientas y sus movimientos, puntos del mapa, quincenas cerradas, presencia, ubicación en vivo, gastos, planos): con la pantalla cerrada `consultar` decía «Está vacía en memoria»; (2) colecciones que el asistente no conocía: adjuntos, fichas de fotos, auditoría, avisos de la cuadrilla, Proyectista, notas de planos, tableros, cuadrillas, guías, salud, alias; (3) no podía leer un documento entero por su número, buscar un nombre en todo ni ver la pantalla; (4) muchas acciones de la pantalla no tenían herramienta (reservas, herramientas, gastos, obra nueva, usuarios, mapa, documentación, avisos, ausencias, contactos, quincena, borrar fotos, alta de producto); (5) los `enum` de `consultar` / `proponer_editar` se armaban antes de sumar colecciones.

**Qué cambia (bloque `ia178` del asistente dormido, bandera `__v178No`; solo Administración y Oficina, cada uno con sus permisos):**
- **Leer:** `consultar` y `describir_datos` con TODAS las colecciones; lo que no está en memoria se lee de la base a pedido (una consulta con tope —25 a 800 según la colección— y paginado; con filtro simple va directo con `where`; caché 3 min). Oficina también ve la ubicación en vivo (como en el Mapa); auditoría, usuarios, presencia, alias y tableros siguen siendo de Administración.
- **`leer_doc(coleccion, id)`**: un documento entero por id, número (OT-, R-, S-/E-), código del producto, código H- o nombre de la obra; configEquipo por documento. pushSubs, avisosPush y secretosServidor no se leen (y dice por qué).
- **`buscar_en_todo(texto, profundo)`**: dónde aparece un nombre o número en todas las colecciones (las grandes —adjuntos, fotos, auditoría— con `profundo`).
- **`ver_pantalla`**: la pantalla, la pestaña elegida, la ventana de encima, el texto visible, los campos con su valor y los botones (sin el panel del asistente).
- **`dato_app`**: pedido de compras, lista de compras, tablero del dueño, alertas del Mapa de guerra, informe semanal, documentación, material contra avance, gente sin tarea, armadas, fotos en el celu, lecturas, gasto del asistente, versión.
- **`proponer_accion`** (tarjeta y «Sí», por el mismo camino que la pantalla, auditoría `asistente_editar`): reserva (aprobar, alistar, lista, rechazar, anular, cerrar), herramienta (asignar, pasar, devolver, reparación, reparada, baja, reactivar; sale el «📄 Remito para firmar» de siempre), gasto, obra nueva, archivar obra, borrar obra (solo Administración y solo sin nada cargado), usuario (solo Administración: rol, activo, confirmar, nombre, vínculo con la nómina; no a sí mismo), punto del mapa, documentación «en papel», aviso de la cuadrilla (visto / resuelto con respuesta al celu), ausencia, contacto, quincena (cerrar / reabrir con `__quincenas.cerrarQ/reabrirQ`), borrar fotos (`fotosBorrar`), alta de producto (el código lo elige la app con `proximoCodigoCatalogo`, como «Guardar producto»).
- **`proponer_editar`** suma cuadrillas, guías, proyectos y notas de planos, y lee de la base lo que no está en memoria.
- **Lo delicado pide el «Sí» dos veces** («Sí, estoy seguro»): borrar obra, borrar fotos, anular/cerrar reserva, baja de herramienta, usuarios (rol / desactivar), quincena, reiniciar puntos (`reinicios`), anular un movimiento, baja de un producto.
- **SISTEMA:** «VER Y HACER TODO (v178)… NUNCA digas "no lo puedo ver" sin antes buscarlo… si de verdad no está, decí dónde buscaste».
- Cuadrilla, pañol, «solo mirar» y Dirección: exactamente como antes (sin las herramientas nuevas; los `enum` viejos; NO_VE).

**Lo que sigue sin poder (a propósito o porque necesita la mano):** pushSubs / avisosPush / secretosServidor (las reglas no dejan leerlos); las imágenes y videos como datos (se miran con ver_fotos / ver_plano); sacar fotos, subir archivos y relevar en Proyectista (cámara, GPS, archivo); lo de cada aparato (contraseña, huella, cerrar sesión).

**A confirmar:** los topes de lectura (adjuntos 25 por página, auditoría 200, fotos 150, gastos 800…); que Oficina vea la ubicación en vivo por el asistente (como la ve en el Mapa).

**Cómo se arma:** `herramientas/v178/patch_v178.py` sobre el ORIGINAL 177 (`d7367b93…`): `ia178.js` antes de `window.__asistente`, la línea del SISTEMA y `cerrarQ, reabrirQ` en `window.__quincenas`. Sin reglas nuevas.

**Pruebas:** `t_v178` PC 86/86 · celu 86/86 · `REGLAS=1` 86/86 · 86/86; `t_v141` 44/44 · 44/44, `t_v133` 30/30 · 32/32, `t_v134` 33/33 · 35/35, `t_v152` 73/73 · 73/73, `t_v153` 53/53 · 55/55, `t_v156` 69/69 · 71/71, `t_v175` 47/47 · 47/47, `t_v176` 42/42 · 42/42, `t_circuito` 16/16 · 16/16 (celu repetida sola: la primera dio 15/16 por tiempos con la máquina cargada); `t_v154` se corta igual con la v177 (la quincena de Juan cae en la quincena anterior por la fecha de hoy: es de la prueba, no de la v178). Las pruebas viejas corren con `__v178No` (nueva línea en `pruebas/h.js`).

**Sello:** `2026-11-19 10:28 · 4ad344` · ORIGINAL `13d0ec8ef22b49e6f5309589e7564e63b8d6120a8a6cbe682243376aec0383e4` · index `a80683f4ed0bbb4254584bcd35b68595b215ca4b874b04819abd701675f07417`.

## v177 — 19/11/2026 (publicada en GitHub 19/11) · El Inicio prolijo (el logo de EMA en su lugar)
**Pedido (Ángel, 19/11, mirando el Inicio de admin en la compu):** «la ubicación del cartel de EMA… no se está respetando la prolijidad y la belleza de la interfaz que veníamos manejando, ¿qué pasó?».

**Qué pasó:** la portada de Dirección (v155, maqueta con el logo al centro entre el menú y la campanita) pasó a ser el Inicio de Administración y Oficina en la v161 (`inicioUnico`). En la compu esa portada pone «El número del día» en la mitad derecha, pegada a la barra de arriba (0 px), así que el logo centrado quedaba encima de la caja, como un rótulo de ella. Hasta la v160 (Inicio Ejecutivo) el logo iba a la izquierda junto al menú, como en el encabezado de todas las pantallas. Igual en v161, v166, v172, v175 y v176. De paso: el `#iniDir button{padding:0}` de la v155 les sacaba la forma a «Ver la de mañana ›» y «Ajustes» de la orden sugerida (quedaban de 23 px, sin relleno) y el chip elegido de Obras sin el degradé; en 1280–1440 el rótulo «todavía no hay ritmo suficiente para estimar» se cortaba con «…».

**Qué cambia (solo CSS `ordenInicio177Css` + la clase `html.v177`, bandera `__v177No`; admin/oficina y Dirección):** el logo a la izquierda junto al menú, a 20 px y de 34 px como el encabezado de las otras pantallas (celu: a 12 px, 30 px); la campanita a la derecha; «El número del día» 16 px más abajo (aire con la barra); los rótulos de los 6 números en hasta 2 renglones; los botones de la sugerida con relleno y 44 px; el chip elegido con el degradé. No toca JS ni otras pantallas.

**Visto y no tocado:** en la curva S, «Hoy 0,0%» se encima con la etiqueta del mes (lo dibuja el gráfico, no es CSS); en el celu la lengüeta del asistente (se arrastra) puede tapar la punta del botón «Asistente».

**Cómo se arma:** `herramientas/v177/patch_v177.py` sobre el ORIGINAL 176 (`f3dc5b3e…`): el estilo y la clase justo después de `inicioDirCss` (antes de que se dibuje el Inicio). Sin reglas nuevas.

**Pruebas:** `t_v177` (nueva) PC 52/52 · celu 16/16 (contra la v176: falla, reproduce lo de Ángel); `t_v161` 38/38 · 40/40 (también con `v177:true`); `t_v155` grupo 0 (Inicio de Dirección) 16/16 · 17/17 (también con `v177:true`); `t_v136` 45/45 · 55/55. Capturas antes/después: 1916×1000, 1440×900, 1280×800 y celu, admin y Dirección.

**Sello:** `2026-11-19 09:56 · bd9160` · ORIGINAL `d7367b93589c928e59875ca89a177afe51342033bb84f31920d46ff24b437440` · index `a4d46d8e031d2eec07960725302175f64f79034256a09bee558a3fbbd6556b0b`.

## v176 — 19/11/2026 (publicada en GitHub 19/11) · 🛡 Guardián de datos (solo Administración)
**Pedido (Ángel, 19/11, después de que el 18/11 a las 12:36 se pisó la nómina —10 de 15 personas, legajos, valor hora—, se vaciaron los vehículos y faltan datos de precios):** «hay que tener algo controlador, o que la IA tenga eso, porque no pueden pasar cosas así; es muy grave». Después: «el Guardián es solo para Administración».

**Qué cambia (módulo `guardianDatos`, bandera `__v176No`):**
- **Copia de todos los días:** el primer aparato de Administración u Oficina (Oficina en silencio, para que salga aunque ese día no entre ningún admin) toma el turno con una transacción en `configEquipo/salud.guardian.<día>` y guarda `adjuntos/cfg-<día>` con personal, baremo, cuadrillas, ubicación, usuarios cortos, guías y reinicios (sin sus `respaldos[]`, con tamaños y cuentas; lo que pasa de 300 KB va aparte). Nunca vapid ni secretosServidor. No se borran solas (con más de 60, Administración puede borrar las viejas con «Sí»).
- **Control:** cada minuto, de memoria, cuenta cada lista (nómina, vehículos, precios de Gastos, valores del baremo, tareas creadas, cuadrillas, pañol, obras, órdenes, reservas, movimientos, gastos, cómputos, usuarios) y la compara con la copia del día anterior. Si se borran 2 o más, una lista queda en 0 o un campo que tenía datos queda vacío → **alerta roja**: Inicio › Para atender, Supervisor «Datos» y aviso al celu de los admin una vez por incidente («Se borraron 5 personas de la nómina entre ayer y hoy (quedan 10 de 15; la última vez guardó … el 18/11 a las 12:36)»). Lo sacado con el «Sí» de la guardia de la v174 queda en ámbar, sin aviso.
- **«Ver qué cambió» y «Volver a como estaba»:** persona por persona, vehículo por vehículo, precio por precio; lo borrado viene tildado, lo cambiado no; nunca saca lo agregado después; copia de cómo está antes de guardar (`respaldos[]`), se lee de vuelta de la base, auditoría `guardian_restaurar`; la alerta se cierra. «Está bien así» con «Sí» si fue a propósito.
- **Hoja «🛡 Guardián de datos»** (menú): alertas, cómo está cada lista (hoy / copia anterior / hace 7 días), últimos guardados (quién y cuándo), copias del día, «Guardar una copia ahora», «⬇ Descargar respaldo completo ahora» con la fecha del último.
- **Asistente** (solo Administración): `guardian` (estado, alertas, qué cambió entre una copia y hoy o entre dos copias, quién guardó) y `proponer_restaurar_datos` (tarjeta antes → después y «Sí»); la revisión con IA de las 12/18 h suma las alertas.
- **Auditoría `config_guardar`** con las cuentas antes → después de cada guardado de configEquipo (precios, baremo, cuadrillas, ubicación, alias, guías, reinicios y lo de personal que no es nómina/vehículos, que ya anota la v174).
- Oficina, Dirección, pañol, cuadrilla y solo mirar no ven nada del Guardián.

**Precios:** `configEquipo/precios` lo lee solo el equipo y `adjuntos` cualquier confirmado: la copia del día de precios va adentro del mismo documento (`precios.guardianCopias[]`, últimos 7 días); en adjuntos solo sus cuentas, tamaño y huella. La vuelta atrás de precios usa esa copia.

**A confirmar:** Los umbrales. «Volver» trabaja sobre personal, precios, baremo, cuadrillas y ubicación. Visto de paso (no tocado): borrar un precio de la lista de Gastos guarda con `set merge`, que en Firestore no borra la clave del mapa.

**Cómo se arma:** `herramientas/v176/patch_v176.py` sobre el ORIGINAL 175 (`f26cb3e6…`): el módulo antes de `revisarAppDiag`, `ia176.js` antes de `window.__asistente`, la línea del SISTEMA, el Supervisor, Para atender y la revisión con IA. Sin reglas nuevas.

**Pruebas:** `t_v176` (nueva) PC 42/42 · celu 42/42 · `REGLAS=1` 42/42 · 42/42; `t_v174` 57/57 · 57/57, `t_v175` 47/47 · 47/47, `t_v136` (supervisor) 45/45 · 55/55, `t_v141` 44/44 · 44/44, `t_circuito` 16/16 · 16/16 (PC · celu), todo OK. Las pruebas viejas corren con `__v176No` (nueva línea en `pruebas/h.js`).

**Sello:** `2026-11-19 09:46 · 31a050` · ORIGINAL `f3dc5b3ec14e1f21b622fb25fad4cc19a57ec6d096e7265593983099ecf5ee34` · index `c5a8daacd8810c50f37a952dc3f711f11d8fd96b050a68e3e73105b87823ad68`.

## v175 — 19/11/2026 (publicada en GitHub 19/11) · El asistente carga el personal
**Pedido (Ángel, 19/11, después de que se pisó la nómina):** «la IA de la app tiene que poder cargar por su cuenta el personal».

**Qué cambia (en el asistente, bandera `__v175No`):**
- `nomina` (leer): la nómina real de la base (legajo, nombre, rol, sector, valor hora —solo Administración y Oficina—, vehículo a cargo, equipo civil, activo) y los vehículos con quién los tiene; además lo que falta según «🔎 Qué se borró» (v174b), con de dónde sale cada dato. Si la nómina todavía no llegó de la base, lo dice y no muestra nada.
- `proponer_personal`: altas de una persona o una lista dictada/pegada, cambios (legajo, rol, sector, valor hora, vehículo a cargo, equipo civil, nombre, reactivar), bajas (quedan «de baja», nunca se borran) y «recuperá lo que se borró» (el mismo motor de «🩹 Recuperar», v174b). Nombres prolijos; si alguien ya está (mismo nombre, nombre parecido o mismo legajo) pregunta en vez de duplicar; legajo y valor hora nunca se inventan («a completar»).
- `proponer_vehiculo`: altas y cambios de vehículos (patente, tipo, lugares, a cargo de quién).
- Tarjeta antes → después por persona con «Sí, cargarlos» / «No»; se guarda solo por la guardia de la v174 (base cargada, copia en `respaldos[]`, «Sí» si se saca algo) y se lee de vuelta: «✓ Guardado: N personas, M vehículos». Auditoría `personal_asistente` con `porAsistente:true`.
- Chip «👷 Cargar personal» (Administración y Oficina). Dirección lee la nómina sin valor hora y no cambia nada; cuadrilla, pañol y mirar no reciben nada de esto.

**Cómo se arma:** `herramientas/v175/patch_v175.py` sobre el ORIGINAL 174b (+ `ia175.js` antes de `window.__asistente`, el botón «Sí, cargarlos», la línea del SISTEMA y `__psRec.leerMas`). Sin reglas nuevas.

**Pruebas:** `t_v175` (nueva) PC 47/47 · celu 47/47 · `REGLAS=1` 47/47 · 47/47; `t_v174` 57/57 · 57/57, `t_v173` 51/51 · 51/51, `t_v159` 48/48 · 48/48, `t_v141` 44/44 · 44/44, `t_circuito` 16/16 · 16/16 (PC · celu; `t_v174` PC y `t_circuito` celu dieron una falla de tiempos con la máquina cargada y pasan solas).

**Sello:** `2026-11-19 09:16 · 4ccba4` · ORIGINAL `f26cb3e6bc794bbde8eae2384972f0d3a8d4e899137fb5fe0bd1981d819bc17f` · index `a82c1306de249b1eab85f536ac7fccd5da84c72b176114c8a172b8c269cc30ed`.

## v174b — 19/11/2026 (publicada en GitHub 19/11) · «🩹 Recuperar» encuentra a la gente con los datos reales
**Pedido (Ángel, 19/11):** con la v174 publicada, «🩹 Recuperar personal y vehículos» decía que no había nada para recuperar, pero faltan JAVIER OLARIAGA, Ivan Exequiel Pereyra, PETITTI ISMAEL, Bruno Federico Cherino y Vizgarra Alfredo (están en las órdenes de esta semana) y no hay vehículos.

**Qué estaba mal (comprobado con la v174, `t_v174` grupo 7: solo encontraba a Juan y Pedro):** la búsqueda usaba solo lo que estaba en memoria y solo `personal[]` como objetos con `nombre`. Se perdía: `personal[]` como texto (órdenes viejas, «JAVIER OLARIAGA»), con otras claves (`persona`, `funcion`), la gente que solo está en `personalNombres` (claves normalizadas), en `reparto` / `asignada` / `equipoTarea` / `equipos` / `horario` / el cierre, las órdenes anuladas (unidas en otra), el vehículo que solo está en `vehiculoId`, y lo que todavía no había cargado (las quincenas cerradas se escuchan recién al abrir Por quincena; las órdenes pueden tardar). Si la hoja se abría antes de que cargaran las órdenes, daba 0 y no se volvía a revisar.

**Qué cambia (solo el módulo `personalSeguro`):** al abrir la hoja lee de la base **todas** las órdenes, las quincenas cerradas y los usuarios (una vez, admin); saca la gente de todos esos lugares; se vuelve a revisar sola cuando terminan de cargar las órdenes; la gente de la oficina (admin/oficina/dirección/pañol/mirar) no se propone; un vehículo sin nombre (solo el número) no se tilda. La hoja dice qué revisó: «🔎 Revisé N órdenes (M con gente, K leídas recién de la base), Q quincenas, U usuarios, V vales y C copias. Encontré P personas: X ya están en la nómina y Y faltan», más «Ya en la nómina (X)» con cómo se emparejó cada uno («MAURICIO MAININI → Mauricio Mainini»).

**Precios (Ángel: «las cosas de precios y personal no están, es grave»):** el Itemizado guarda todo su estado de una vez (`overrides`, `itemsPropios`, `mapeoCol`, `baseEpec`, `contratistaPct`, `contratistaPrecios`, `contratistaListas`…) desde variables que arrancan con los valores de fábrica y se llenan con `aplicarPreciosDeLaNube`; el baremo igual (`aplicarBaremoDeLaNube`). Tenían **la misma carrera que la nómina**: si la base contestaba antes de que se leyera ese script, la función todavía no existía, nadie la volvía a llamar, la pantalla quedaba con lo de fábrica y el siguiente «Guardar» lo grababa encima (y la guardia de la v174 lo dejaba pasar porque el documento «ya había llegado»). Es la explicación más probable de que personal y precios se perdieran juntos. Arreglo: las dos se aplican también si la base ya contestó. La lista de precios de Gastos (`gastosRef`) ya estaba detrás de la guardia de la v174.
- «🩹 Recuperar» suma **💲 Precios, baremo y el resto de la configuración**: por cada documento (precios, baremo, cuadrillas, ubicación, personal) el último guardado, las copias y, por campo, lo que una copia tiene de más que hoy (copias en la base `respaldos[].campos`, copia en el aparato `ema.cfg.respaldoLocal` —nueva: la primera versión de precios y baremo que llega a cada aparato—, archivo de respaldo); la lista de precios de Gastos rearmada con los gastos cargados (último precio de cada cosa); el módulo y la zona del último certificado cerrado. Mapas y listas se suman (nunca se saca nada); un valor suelto distinto al de hoy (p. ej. el % del contratista) aparece sin tildar. Después del «Sí» lee cada documento de vuelta.

**Cómo se arma:** `herramientas/v174b/patch_v174b.py` sobre el ORIGINAL 174 (cambia el bloque `personalSeguro` por `herramientas/v174/personalSeguro.js/.css`, la copia en el aparato de precios y baremo en sus escuchas y la carrera de `aplicarBaremoDeLaNube` / `aplicarPreciosDeLaNube`).

**Pruebas:** `t_v174` PC 57/57 · celu 57/57 · `REGLAS=1` 57/57 · 57/57 (grupo 7 = forma real de las órdenes: contra la v174 solo encontraba a Juan y Pedro; grupo 8 = precios); `t_v173` 51/51 · 51/51, `t_circuito` 16/16 · 16/16.

**Huellas:** sello `2026-11-19 09:07 · 88531a` · ORIGINAL `174b_2026-11-19_app-EMA_ORIGINAL.html` `dda6c2dcdb80a0b67794c3556618acbd6d29d9772c8da75978b7762ee1226522` · `index.html` `4f810616bd58ced4c0e1295b07f65aa20ee927285fd7c08f7c166eb5da5f782c`.

## v174 — 19/11/2026 (publicada en GitHub 19/11) · La nómina y los vehículos no se pierden + «🩹 Recuperar»
**Pedido (Ángel, 19/11):** Producción › Personal del equipo quedó con 10 personas (justo la lista de ejemplo que trae la app) y sin vehículos; faltan JAVIER OLARIAGA, Ivan Exequiel Pereyra, PETITTI ISMAEL, Bruno Federico Cherino y Vizgarra Alfredo, que siguen en las órdenes de esta semana. «Quiero recuperar TODO lo que se borró, y verificá qué se borró y qué pasó.»

**Qué pasó (causa):** la pantalla «Personal del equipo» arranca con una **lista de ejemplo de 10 personas escrita en el código** y la cambia por la de la base recién cuando la base contesta (y solo si la base tiene el campo `nomina`). Si la pantalla se abre y se toca **«Guardar»** antes de que llegue la base (señal lenta, cupo, un error de la escucha, o la base contestó antes de que la app terminara de leerse —esa carrera también existía: `aplicarPersonalDeLaNube` todavía no estaba definida y nadie la volvía a llamar), se graba esa lista de ejemplo como nómina: es lo que pasó el 18/11 a las 12:36 (Ángel cambió a una persona a «Medio oficial» y tocó «Guardar»). Además «Guardar» desde la tabla perdía campos que la tabla no muestra (`equipoCivil` de la v143). Los vehículos son un campo aparte (`vehiculos`) que ese «Guardar» no toca: los escriben la tarjeta «🚗 Vehículos» (agregar / ×), «Guardar los vehículos» de la v143 y el asistente (`proponer_editar` de `personal`); ninguno pedía confirmación para dejar la lista vacía, y no hay registro de quién la vació (no se anotaba en la auditoría).

**Qué cambia (sin bandera, es un arreglo):**
- La pantalla toma la nómina de la base aunque la base haya contestado antes; mientras no llega, «Guardar» dice **«Cargando la nómina…»** y no anda (cartel `#psAviso`, role=status).
- **Guardia** (`__psGuardia`) en todo lo que escribe `nomina` / `vehiculos` de `configEquipo/personal` (`fbPersonalGuardar`, `__vehiculos.guardar`, el genérico del asistente): no escribe si la base no llegó en esta sesión (`__personalCargado`); la lista de ejemplo no se graba nunca; **sacar gente o vehículos pide «Sí»** (hoja `#psConf` «Vas a sacar 5 personas: …» / «Vas a borrar todos los vehículos»); conserva los campos que la tabla no conoce; antes de guardar, la versión anterior va a **`configEquipo/personal.respaldos[]`** (las últimas 10: {ts, por, nomina, vehiculos, deTs, deUsuario}) y queda en la auditoría **`personal_guardar`** (antes/después, quién salió, quién entró).
- **Lo mismo para los otros documentos de configuración** (`__cfgGuardia(doc, patch)`): `configEquipo/baremo`, `precios` (también `gastosRef` de Gastos), `cuadrillas`, `ubicacion` y el resto de `personal` (contactos, ausencias, equipos habituales…): no se guardan antes de que ese documento llegue de la base (`__cfgCargado[doc]`; `ubicacion` lo lee una vez si hace falta), si un guardado saca elementos de una lista (tareas propias, contactos, equipos, cuadrillas, la lista de precios de Gastos…) pide «Sí», y lo que había antes en los campos que cambian queda en el `respaldos[]` de ese documento (últimas 10, con tope de ≈ 400 KB para no acercarse al 1 MB). Pantallas con listas de fábrica que podían grabarse encima de lo real: la nómina de ejemplo (`A`), los puntos de fábrica del baremo (`Se`/pesos `se`) y sus tareas propias vacías, el horario de ubicación (`DEF`), las cuadrillas (`W = []`) y la lista de precios de Gastos (`ref()` vacío): todas quedan detrás de la guardia.
- Después del «Sí» de recuperar, la app lee el documento de vuelta de la base y muestra «✓ Guardado: N personas, M vehículos».
- **Copia en cada aparato:** cada versión de la nómina que le llega a un aparato queda en `localStorage ema.personal.respaldoLocal` (las últimas 6; la más grande no se borra). Un aparato que tenía guardada la nómina buena (la caché de Firestore de un aparato que no abrió la app desde el 18/11 a las 12:36) la guarda apenas abre, antes de que la del servidor la pise.
- **«🩹 Recuperar personal y vehículos»** (Producción › Personal del equipo, solo Administración) → hoja «🔎 Qué se borró»: qué pasó (último guardado de la nómina y de los vehículos, copias, último respaldo bajado), las personas que no están en la nómina con cada dato y de dónde sale (copias de la base / del aparato / archivo de respaldo / auditoría del asistente / órdenes: rol y vehículo / quincenas cerradas: legajo y rol / usuarios / vales del pañol: sector), los datos que faltan de los que están (valor hora, vehículo a cargo, sector, equipo civil, legajo; solo de una copia completa), los vehículos (copias, la lista vieja de Gastos v042, órdenes con patente y quién lo llevó, combustible), y **lo que no está en ningún lado** («hay que cargarlo»). «📂 Buscar en un archivo de respaldo» (`respaldo_completo_…json` de Pañol › Acceso y respaldo). Casillas + «Sí, agregarlos» + «Sí»: nunca saca a nadie ni pisa un dato cargado; guarda respaldo y auditoría `personal_recuperar`.

**Cómo se arma:** `herramientas/v174/patch_v174.py` sobre el ORIGINAL 173 (la escucha de `configEquipo/personal`, `aplicarPersonalDeLaNube`, el mensaje de «Guardar», `__vehiculos.guardar`, el genérico del asistente) + el módulo `personalSeguro` (`personalSeguro.js/.css`). Sin reglas nuevas.

**Pruebas:** `t_v174` (nueva, `datos174.js`) PC 44/44 · celu 44/44 · `REGLAS=1` 44/44 · 44/44; con `ANTES=1` contra la v173 reproduce el bug (base que tarda 12 s + cambiar un rol + «Guardar» → quedan las 10 de ejemplo). `t_v143` 78/78 · 78/78, `t_v145` 82/82 · 82/82, `t_v112` 14/14 · 15/15, `t_circuito` 16/16 · 16/16 (PC · celu). Antes de agregar la guardia de los otros documentos también pasaron `t_v142` 49/49 · 49/49 y `t_v173` 51/51 · 51/51 (`t_v143` PC tuvo una vez la falla vieja de `vehiculoPersona` del asistente, §12; sola pasa). 

**Huellas:** sello `2026-11-19 08:34 · bfc1aa` · ORIGINAL `174_2026-11-19_app-EMA_ORIGINAL.html` `1f79f0090ea719f565d331ee3de80e70a770926094b4de4b20639156c284508d` · `index.html` `47ad65544d231a469bd48168a7f2b404869bc8b47e32509389296e5116b88cc7`.

## v173 — 18/11/2026 (publicada en GitHub 18/11) · La orden por persona y por tiempo
**Pedido (Ángel, 18/11):** «Hay que hacer dos cosas, para la IA y para la orden de trabajo, que sea por tiempo también. Ahora está por cuadrilla; tiene que ser por personas que van a hacer cada tarea. La IA también lo tiene que detectar… por ahí yo le pido a la IA que cierta persona va a hacer cierta cosa y te pone todo junto, eso está mal. Y luego por tiempo: si digo Pablo y Pedro van a estar hasta las 2 en esa plaza y los otros van a seguir trabajando hasta las 16, tiene que ser así… Que ellos cobren hasta ahí y lo que hicieron, y luego los otros siguen y van a cobrar más por todas las horas.» Y: «si le doy la misma tarea "armar luminaria" a dos personas: hay que armar 10, 5 cada uno — que a cada uno le aparezcan 5 nomás… para medir su tiempo y que hagan esas 5.»

**Qué estaba mal (comprobado con la v172):**
- La orden no tenía horario por persona: todos con la jornada de la orden; el cierre ponía la jornada a cada uno (había que tocarlo a mano) y la hoja impresa dejaba Entrada / Salida en blanco.
- El asistente: `proponer_orden` / `proponer_editar_orden` solo tenían **un «quien» por tarea** y nada de horario ni columnas: «Pedro y Juan el izaje» quedaba para toda la cuadrilla (los 4) y «Pablo y Pedro hasta las 2» no se guardaba (`t_v173` grupo 4 con `ANTES=1`).
- **✂ Repartir**: cada uno veía su cantidad («Te tocan 5 de 10») pero **las mismas unidades** que el otro (Pablo y Pedro: «Col 6, Col 1, Col 2, Col 3, Col 4»), la foto del compañero le contaba como propia («1 de 5»), en Modo obra la excavación con columnas mostraba las 10, el «Voy a iniciar», el envío y «la columna anterior» del tiempo eran de cualquiera de los dos (`t_v173` grupo 0 con `ANTES=1`).

**Qué cambia:**
- **Horario de cada uno** (Llenar orden › paso 2, debajo del vehículo): «🕐 ¿Hasta qué hora está cada uno?» con desde – hasta, **«hasta 14:00»** y **«toda la jornada»** → `ot.horario {"Pablo Picone": {desde: "08:00", hasta: "14:00"}}` (solo los que no hacen toda la jornada). Se ve en el resumen, en «📋 Quién hace qué», en la hoja impresa (Entrada / Salida), en el celu de cada uno (La orden: «tu horario: 08:00 a 14:00»; Mis tareas: «🕐 Tu horario hoy… te cuentan 6 h») y en el «📸 Avance». **El cierre** trae las horas de cada uno con su horario (6 h el que se fue a las 14, 8 h los demás) y los puntos salen por la cuenta de siempre (`puntosDeOrden`, rol × horas); los puntos estimados de Llenar orden y del asistente también. El auditor de puntos dice «trabajó de 08:00 a 14:00 (6 h, horario de la orden)».
- **✂ Repartir = cada uno lo suyo**: sus columnas (las elegidas en la orden, en orden: Pablo Col 1–5, Pedro Col 6–10; si no hay, las que siguen), solo sus fotos, su «3 de 5», su «▶ Voy a iniciar», su tiempo por columna (la anterior es la suya) y su envío (en Modo obra la tarea sigue aunque el compañero mandó la suya). La oficina ve «Pablo Col 1 a Col 5 · 3 de 5 · 105 min · Pedro Col 6 a Col 10 · 5 de 5 · 145 min» en el «📸 Avance» y en la verificación; el cierre trae «Cuánto hizo cada uno» precargado. **«➗ Dividir en partes iguales»** en la cajita de «✂ Repartir»; con columnas elegidas, la cajita dice qué columnas le tocan a cada uno.
- **El asistente**: `proponer_orden` acepta por tarea `quienes` (varios juntos), `reparto` (cada uno su parte, con sus columnas) y `columnas`, y `horario` / `hora_fin`; `proponer_editar_orden` lo mismo; `proponer_cierre_dia` acepta `hasta` («Pablo y Pedro hasta las 2» → 6 h). El SISTEMA le dice que asigne por tarea y nunca ponga a todos en todo. La tarjeta muestra 👤 / 👥 / ✂ por tarea y 🕐 el horario.
- La orden sugerida sigue igual (sin horario = como antes). Sin reglas nuevas: el horario lo escribe quien edita Órdenes; la cuadrilla no puede (las reglas solo le dejan tocar `campo` y `estado`; comprobado con `REGLAS=1`). Pruebas viejas con `__v173No` (todo como la v172).

**Cómo se arma:** `herramientas/v173/patch_v173.py` sobre el ORIGINAL 172 (reemplazos chicos en `reparto`, `cuadrillaDia`, `envioTarea`, `inicioTarea`, `tiempoCol`, `verifObra`, `equipoTarea`, `ordenNueva`, la hoja impresa de la base, `auditorPuntos` y el asistente dormido —`cargarOrden`, `tarjeta`, `SISTEMA`—) + el módulo `porPersona` (`porPersona.js/.css`) + el bloque `ia173.js` dentro del asistente. `SELLO="AAAA-MM-DD HH:MM"` fija el sello a mano.

**Pruebas:** `t_v173` (nueva) PC 51/51 · celu 51/51 · `REGLAS=1` 53/53 · 53/53; con `ANTES=1` contra la v172 reproduce lo de Ángel (grupo 0 repartida: 2/2: los dos ven las mismas unidades y la foto del otro cuenta; grupo 4 asistente: 3/3: sin `quienes` ni `horario`, el izaje para los 4 y sin horario). `t_v094` 22/22 · 23/23, `t_v097` 23/23 · 24/24, `t_v111` 7/7 · 8/8, `t_v112` 14/14 · 15/15, `t_v128` 10/10 · 11/11, `t_v146` 64/64 · 64/64, `t_v153` 53/53 · 55/55, `t_v165` 59/59 · 59/59, `t_v166` 38/38 · 38/38, `t_circuito` 16/16 · 16/16 (PC · celu). `t_v143` 78/78 · 78/78 con `TZ=UTC` (con la hora de Córdoba después de las 21 da 77/78, igual que la v172: la regla de fechas UTC de §12). `t_v154` no termina con esta fecha ni con la v172 (la quincena de los datos de prueba: 1 orden de 3 cae en otra quincena hoy, 18/19-11); no es de la v173.

**Huellas:** sello `2026-11-18 21:50 · 1225a7` · ORIGINAL `173_2026-11-18_app-EMA_ORIGINAL.html` `766718bdf32473bcd6bca5112dbd173c8a9fcc811371c36151845d8151c701b7` · `index.html` `0621408094ce39603eeb59ba0a2abe2a2d1704c9a8feb4472c9299a4ab1fb21f`.

## v172 — 18/11/2026 (publicada en GitHub 18/11) · Cámara: el video sin burbuja y «Tablero 1»
**Pedido (Ángel, 18/11):** (1) «En la cámara tener la burbuja de video, que molesta: no deja apretar el botón de siguiente. La burbuja no me gusta, elegí otro lugar.» (2) «Selecciono Tablero y al apretar arriba de Tablero (otra vez) debería dejarte poner tablero y algo que yo quiero poner, como 1 o E o roto, lo que sea.»

**Qué cambia:**
- **El «🎥 Video» ya no flota.** Antes era una burbuja redonda encima de la fila para nombrar y tapaba **«›»** (columna siguiente) y **«PAT»** en las tres cámaras (la de la barra, Modo obra y la cámara de la tarea de la v165), en 390×844 y en 360×740. Ahora: en la **cámara de la barra** y en **Modo obra** va **en la fila de abajo, entre la última foto y el disparador** (el disparador sigue al centro y «Listo» a la derecha); en la **cámara de la tarea** (abajo van sus miniaturas y «Terminé») va **arriba, entre el nombre de la obra y el reloj**. Hace lo mismo: cierra la cámara y abre la hoja del video con la obra, la orden y la columna.
- **Agregarle algo al nombre de la foto.** En los botones para nombrar (**Columna · Tablero · PAT · Zanja · Acometida**), el elegido muestra **✎**; tocándolo otra vez sale **«Tablero ___»** (con ✕) con lo último que usaste en ese botón y **1 · 2 · 3 · E · roto** (en Columna y PAT: E · roto, que ya llevan número), o se escribe con el teclado. Queda **«Tablero 1»**, **«Tablero E»**, **«Tablero roto»**; en Columna se suma al número (**«Col 4 base»**) y ‹ Col N › sigue andando. Lo agregado **sigue para las fotos siguientes** hasta que se cambia o se saca («Sacar «1»»); se olvida a los 30 min sin sacar fotos. Lo último de cada botón queda en el celu.
- La foto se guarda con **cat** como siempre y **num = el nombre entero** (orden, legajo, «📸 Avance» de la oficina). Si el nombre no es una columna/unidad de la tarea («Col 4 base», «Tablero 1»), va **suelta** (a la orden sin tarea, como la v164 / v171): no cuenta para la tarea, no marca el tiempo de una columna ni pasa sola a la siguiente; la oficina la mueve con «↔ Mover».
- **En «＋ Otra foto»** (v171) lo mismo: el primer toque elige el botón y muestra «📷 Sacar la foto · Tablero», otra vez → «Tablero ___»; la próxima vez sigue elegido lo último («Tablero 1»), así que son los mismos dos toques de antes.
- Nada nuevo corre con la cámara abierta (un solo escucha de toques). Sin reglas nuevas. Pruebas viejas con `__v172No` (todo como la v171).

**Cómo se arma:** `herramientas/v172/patch_v172.py` sobre el ORIGINAL 171 (reemplazos chicos en `archivosNube.botonCamara`, la cámara C de `inicioTarea`, `fotosAlToque`, `obraGps` y `otraFoto`) + el módulo `sufijoFoto` (`sufijoFoto.js/.css`). Capturas de las 3 cámaras en los 2 tamaños: `herramientas/v172/cap172.js`.

**Pruebas:** `t_v172` 74/74 en PC, celu y `REGLAS=1` (PC y celu); con `ANTES=1` contra la v171 reproduce lo de Ángel en las 6 (3 cámaras × 390×844 / 360×740: el video tapa «›» y «PAT»). `t_v171` 36/36 · 36/36, `t_v167` 76/76 · 76/76, `t_v166` 38/38 · 38/38, `t_v165` 59/59 · 59/59, `t_v164` 70/70 · 70/70, `t_v160` 54/54 · 54/54, `t_circuito` 16/16 · 16/16 (PC · celu; en la tanda de a 3, `t_v160`, `t_v164` y `t_circuito` en PC fallaron 1–2 por tiempos y pasaron enteras solas). **`t_v164` grupo 5** (destello y tareas largas con la cámara abierta, CPU ×6, toques reales) con todo prendido, de a una, alternando con la v171 en 4 rondas: v171 5, 7, 7, 8 de 8 (27/32) · v172 7, 7, 7, 7 de 8 (28/32): igual (lo que falla en las dos es el tope de 100 ms de mediana en la cámara de la barra con la máquina cargada). Medidas en `herramientas/v172/medidas_t_v164_g5.txt`.

**Huellas:** sello `2026-11-18 17:06 · 235cd2` · ORIGINAL `172_2026-11-18_app-EMA_ORIGINAL.html` `3aaf46e5d5a59e5cff39aa77a6a108e040239b633ed9e666dc372a16be9fe21d` · `index.html` `4d96009b3cce3a5e9f649d61a5af74030cc526a8104a771fc9e069722417eca7`.

## v171 — 18/11/2026 (publicada en GitHub 18/11) · «＋ Otra foto» con nombre en Mis tareas
**Pedido (Ángel, 18/11):** «en Mis tareas de la cuadrilla ellos ponen las fotos que les piden, y de paso deberían poder poner otra, y ahí que les pida poner un nombre como en la cámara: ponés "otra" y te pide un nombre, ¿entendés?»

**Qué cambia (Mis tareas, la lista):**
- En cada tarea, debajo de las fotos que se piden: **«📎 Otras fotos»** (las que ya se sacaron, con su nombre) y el botón **«＋ Otra foto»** (en las tareas por tomas reemplaza al «📷 Otra foto» de antes, que no pedía nombre).
- «＋ Otra foto» abre **«¿Qué es la foto?»** con los mismos botones de la cámara (v164): **Columna** (con «‹ Col N ›»; de entrada la que sigue a las de la tarea), **Tablero**, **PAT**, **Zanja**, **Acometida** y **Otro…** (se escribe; aparece «Lo último que escribiste», la misma lista de la cámara). Elegido el nombre se abre la cámara de siempre: la de la app, la del teléfono o la del APK.
- La foto queda en la orden con ese nombre, **suelta** (sin tarea, como la v164): no cuenta para las fotos que se piden ni para la verificación (v150). Se ve en «Otras fotos» de la tarea, en «📷 Mis fotos», en el legajo, y la oficina la ve en el «📸 Avance» debajo de esa tarea («📎 Otras fotos (de más, no cuentan)»); se mueve con «↔ Mover» (v152). Si es una columna que la tarea pide (ej. Col 6 de un pozo Col 6–8), va a su fila como siempre.
- Si la tarea no arrancó, el botón también pide el cartel **«▶ Voy a iniciar»** (v166), como los otros 📷.
- Sin señal: queda en el celu y en la orden, y sube sola. Sin reglas nuevas. Pruebas viejas con `__v171No` (todo como la v170).

**Cómo se arma:** `herramientas/v171/patch_v171.py` sobre el ORIGINAL 170 (reemplazos chicos en `mtFotosLista` / `mtTomasHtml`, la orden de Mis tareas, `avanceOrden` e `inicioMt`) + el módulo `otraFoto` (`otraFoto.js/.css`).

**Pruebas:** `t_v171` PC 36/36 · celu 36/36 (igual con `REGLAS=1`); `t_v165` 59/59, `t_v166` 38/38, `t_v167` 76/76, `t_v149b` 37/37, `t_v107` 6/6, `t_circuito` 16/16 en PC y celu. **`t_v164` grupo 5** (destello y tareas largas con la cámara abierta, CPU ×6, toques reales): en la máquina sin carga, de a una, alternando con la v170 en 8 rondas: v170 5, 8, 7, 6, 8, 7, 8, 8 de 8 (57/64) · v171 7, 8, 6, 6, 7, 8, 7, 7 (56/64) · v171 con `v171:true` (lo nuevo prendido) 7, 8, 8, 8, 8 (39/40). En `t_v164` el arnés pone `__v171No` y todo lo de la v171 queda apagado (cada cambio pregunta `__v171No`): la diferencia es ruido de la máquina (un toque suelto de 200–500 ms en las dos versiones). Igual, `otraFoto` no hace nada con la cámara abierta (`body.ec-abierta`): no tiene vigías (MutationObserver), relojitos ni envolturas; solo escucha los toques (y se va al toque con la cámara abierta) y el `change` de su propio input. Capturas del celu.

**Huellas:** sello `2026-11-18 16:25 · 4ebb54` · ORIGINAL `171_2026-11-18_app-EMA_ORIGINAL.html` `468c5f652f30334a9851f2aac7655774d4da1d4d2e2977701ade89a8ab531f35` · `index.html` `925b455a5002adaa0b2e996e73093ab48015463bd0de4233307071da40814d56`.

## v170 — 18/11/2026 (publicada en GitHub 18/11) · Avance de obra: carga rápida a mano
**Pedido (Ángel, 18/11):** «en avance de obra no se puede editar, tendríamos que mejorar eso para que sea más fácil editar y poner a mano lo que se va a cambiar y poner al día. Igual se tiene que mover automático (con las órdenes)… está difícil entrar a columna. Y poder poner: ya pusieron diez columnas — y un cartel: eso significa que las bases y el hormigón están hechas… Sacar el cartel que te pide explicaciones por ahora, hasta que lo pongamos al día. Y también poner, por ejemplo, columnas todas puestas o solo 8 de 10, pero editado rápido.»

**Qué cambia (Avance de obra › una obra; quien edita el avance: Administración y Oficina):**
- **«✏ Carga rápida»** arriba del avance: por cada paso de la columna (pozo, hormigón, izaje, vínculo, artefacto, tablerito, sellado, PAT; acabado, aplomado y subida en «Otros pasos») dice «N de 12 · K de órdenes» y tiene − / + (o escribir el número), **Todas**, **Ninguna** y **Listo**. Sube marcando las **primeras que faltan**, en orden; baja sacando las últimas marcadas a mano. Lo que viene de las órdenes (hecho, en revisión, fraguando), las fallas y las observadas no se tocan (no deja bajar de lo de las órdenes). «elegir» lleva a «Elegir varias» con ese paso (para elegir cuáles).
- **Lo que no va por columna** (zanja, cable, tablero, acometida, inspecciones…) en la misma tarjeta: metros o cantidades con − N + y «Listo»; las de una vez con «Marcar hecho». Los papeles siguen por «📄 Documentación».
- **Cascada con cartel** (abajo, role=status): «Marcar 10 izadas también marca pozo y hormigón de esas 10 (ya fraguado)» → **Sí** / **Solo el izaje** / Cancelar. Solo pasos de antes en la misma columna y solo donde faltan; el hormigón a mano no fragua (regla de la v163). Si el izaje cae sobre un hormigón de una orden que todavía fragua, se marca igual y avisa. Al sacar un paso: «¿También sacás los pasos que siguen (vínculo…)?» → **Sí, también** / **Solo el izaje**.
- **La grilla, «✏ Tocar marca: Sí»** (de entrada): tocar una celda que falta la marca (con la misma cascada); una marcada a mano la saca; una de una orden, con falla, observada o «no lleva» abre la hoja de siempre. **Mantener apretado** abre la hoja de la celda. «Tocar marca: No» = como antes.
- **Sin fecha real**, como «⚡ Poner al día» (v163): lo cargado rápido es poner al día lo hecho antes de hoy, así que no entra en el ritmo, ni en «Lo último que pasó», ni en el número del día de Dirección; en la curva cuenta desde el principio. Quién y cuándo quedan en el historial (auditoría). La hoja de la celda dice «Carga rápida (ya estaba hecho)».
- **«↶ Deshacer»** en el cartel durante 10 s después de cada cambio (vuelve todo como estaba; queda en el historial).
- **Motivo:** por ahora **no se pide** (ni en la tarjeta, ni en la hoja de la columna, ni en «Elegir varias», «＋ Agregar», «⚡ Poner al día» —ahí queda «opcional», precargado— ni en el ítem por ítem del itemizado de la v156); queda «Carga rápida del avance» con quién y cuándo, en `av2.hist`, `avanceHist` y la auditoría. **Administración** lo vuelve a pedir en la misma tarjeta: «Pedir motivo al cambiar el avance a mano: No (por ahora) / Sí» (`configEquipo/baremo.avanceMotivo`). El asistente sigue pidiendo su motivo.
- Las órdenes siguen moviendo el avance encima (v158 / v163 sin cambios); «⚡ Poner al día esta obra» y «🏁 Está toda terminada» siguen.
- Dirección, «solo mirar», pañol y cuadrilla no ven la tarjeta ni «Tocar marca». Sin reglas nuevas. Pruebas viejas con `__v170No` (todo como la v169).

**Cómo se arma:** `herramientas/v170/patch_v170.py` sobre el ORIGINAL 169 (reemplazos chicos en `avanceObra2` —motivo según el ajuste, sin fecha real para lo cargado rápido (`eventos`, `origenTxt`), la tarjeta en la pantalla, el toque en la grilla, `hojaCelda`/`hojaCosa` en `__av2`— y en `auditorAvance.pedirMotivo`) + el módulo `avanceRapido` (`rapido.js/.css`).

**Pruebas:** `t_v170` 63/63 en PC, celu y `REGLAS=1` (PC y celu); `t_v158` 72/72 · 72/72, `t_v163` 42/42 · 42/42 (vueltos a correr con lo de «sin fecha real»), `t_v156` 69/69 · 71/71, `t_v168` 83/83 · 83/83, `t_v169` 42/42 · 46/46, `t_circuito` 16/16 · 16/16 (PC · celu), todo OK. Las pruebas viejas corren con `__v170No` (motivo obligatorio como antes): no hubo que cambiar ninguna

**Huellas:** sello `2026-11-18 15:17 · c082a1` · ORIGINAL `170_2026-11-18_app-EMA_ORIGINAL.html` `f11ab788f7ddbf160d6598c00df2d12567addf5b46c6fb923bf581e5efb9f487` · `index.html` `80052a39a334f09f4fa79af50b5e9f6b701cd5cbff9fa701a96381d8210b236d`.

## v169 — 18/11/2026 (publicada en GitHub 18/11) · «🔧 Armadas» con su propio subíndice en el Pañol
**Pedido (Ángel, 18/11):** «eso tiene que tener su propio subíndice, no dentro de pañol (el catálogo)» (la tarjeta «🔧 Luminarias armadas» de la v168 estaba dentro de Pañol › Catálogo pañol).

**Qué cambia:**
- **Pañol › «🔧 Armadas»**: subpestaña nueva, después de Herramientas, con la tarjeta de la v168 tal cual (recetas, Armar, Llevar a obra, DEPÓSITO LUMINARIAS → «Pasarlo a armadas», comprobantes AR-). Arriba dice «Luminarias armadas».
- **Catálogo pañol**: ya no tiene la tarjeta; queda una línea «🔧 Luminarias armadas: N listas · **Ver**» (sin receta: «todavía no hay recetas») que lleva a la subpestaña. Entrando por ahí aparece «‹ Volver al catálogo» y el «atrás» del celu vuelve al catálogo (no sale del pañol).
- **Ficha de la armada**: además de «Armar», «Llevar a obra» y la receta, «Ver en Pañol › Armadas» (cierra la ficha y abre la subpestaña).
- **QR / `?doc=AR-0001`**: el comprobante del armado se abre con Pañol › Armadas detrás.
- **Quién la ve**: lo mismo que la tarjeta de la v168: quien edita el pañol (admin, oficina, pañol) siempre; cuadrilla, «solo mirar» y Dirección si hay alguna receta, sin botones. La cuadrilla (que en el pañol solo tiene Catálogo pañol) ve «Catálogo pañol» + «🔧 Armadas» si hay receta; si no, como antes. La barra de abajo del pañolero no cambia.
- Sin reglas nuevas. Pruebas viejas con `__v169No` (todo como la v168).

**Cómo se arma:** `herramientas/v169/patch_v169.py` sobre el ORIGINAL 168 (reemplazos chicos en el script de las subpestañas del Pañol, el HTML del catálogo, la ficha de la armada, `abrirRef` del QR y la capa `armadasCat` de `atrasApp`) + el módulo `armadasTab` (`armadasTab.js/.css`).

**Pruebas:** `t_v169` PC 42/42 · celu 46/46 (igual con `REGLAS=1`; en el celu la subpestaña elegida queda a la vista en la fila); `t_v168` 83/83 PC y celu; `t_circuito` 16/16; `t_v102a–e`, `t_v137` (62 · 63), `t_v138` (68 · 69), `t_v140` (39 · 41), `t_v146` (64 · 64) en PC y celu, todo OK. Capturas en el celu y la compu.

**Huellas:** sello `2026-11-18 14:47 · 19d27b` · ORIGINAL `169_2026-11-18_app-EMA_ORIGINAL.html` `c1ef41e5deee3d5acd9361a5f59856cce4b2394a96b3d1e420bad0c0168ed004` · `index.html` `b81b52468b9ed3bb0bebc4b09a2d872d79495d0ea7454c99583a57a89544b784`.

## v168 — 18/11/2026 (publicada en GitHub 18/11) · Luminarias armadas (pañol)
**Pedido (Ángel, 18/11):** «tenemos una obra que usamos como depósito que se llama deposito luminarias… del depósito sacamos artefacto, prensacable y cable, armamos el artefacto armado con el prensacable adentro y el cable… la idea es tener stock de ya armadas para no perder tiempo… necesitamos que luego salga a una obra… es como un movimiento interno pero no podemos perder el registro porque sale del pañol pero no sale de la empresa y aparte necesitamos que sea algo rápido para mover las armadas a la plaza que lo necesite». Eligió la «Idea 1 + 2» y aprobó las maquetas (Receta · Pañol › Armadas · Armar · Comprobante · Llevar a obra).

**Qué cambia (Pañol › Catálogo pañol, tarjeta «🔧 Luminarias armadas»; quien edita el pañol: admin, oficina, pañol):**
- **Receta** («＋ Nueva armada» / «Ver o cambiar la receta»): nombre, **código del pañol que elige la persona** (la app propone el siguiente libre de la familia 6 en x001–x499 con un botón «Usar 60NN», no lo pone sola, y rechaza un código usado en el catálogo, en movimientos, en cálculos, en reservas, los códigos de barrio movidos y los x500–x999), unidad Un., y las piezas (buscador del catálogo; la cantidad por armada **vacía, «a confirmar»**, hasta que la carga la persona; si el producto tiene «m por Un.» lo muestra). Va a `catalogoProductos/<código>` por `fbGuardarProductoCatalogo` con `armada {v:1, piezas[{codigo, desc, un, cant}], ts, por, porNombre, hist[]}`; cambiar la receta deja la anterior en `armada.hist` (lo ya armado guarda la suya). Varias recetas.
- **Armar** (tarjeta y ficha del producto): tipo, ¿cuántas? − / +, «Sale del pañol» (cada pieza × cantidad con lo que hay; si no alcanza, lo marca, dice «hasta N» y no deja armar), «Entra» (+N), «¿Quién armó?» (nómina, opcional), «Sí, armar N». Guarda por `fbAddMovimiento` las salidas de cada pieza y la entrada de la armada con `armado:true`, `armadoGrupo`, `numero:"AR-0001"` (correlativo propio; las letras **a confirmar**), sin obra, `quienes`, `armadoDe`; la entrada con `precioUnit` = suma de las piezas al último costo, `precioFuente` (de dónde sale cada costo) y `receta` (copia). El costo del catálogo de la armada se actualiza con ese valor. Auditoría `armado`.
- **Comprobante**: en pantalla (AR-0001, QR, salió / entró, «No es un gasto de ninguna obra…») y la hoja A4 «Comprobante de armado — N° AR-0001» con QR (`?doc=AR-0001` y el lector QR lo abren; el comprobante de cualquier pata del listado abre este); «Imprimir etiqueta QR» (dos etiquetas grandes para la caja); «Llevar a obra»; «Anular este armado» (con motivo; solo si las armadas siguen en el pañol: si ya salieron, lo dice; se anulan las patas, no se borra nada, vuelven las piezas; auditoría `armado_anulado`). Anular una pata desde el listado ofrece anular el resto del armado.
- **Llevar a obra**: primero las obras con orden hoy y los próximos 7 días, con «el cálculo pide 8, recibió 2» (de la primera pieza de la receta, con lo entregado desglosado), «Buscar otra obra…», cantidad − / + (tope = libres, sin lo apartado), «La plaza recibe» desglosado, «Hacer vale · S-NNNN». Es un **vale de salida común** (S-, `valeGrupo`, el comprobante de siempre). Devolución sin usar = la devolución de siempre (vuelven como armadas).
- **DEPÓSITO LUMINARIAS** (la obra cuyo nombre tiene «depósito» y «luminaria»): si tiene material entregado, la tarjeta lo muestra y ofrece «Pasarlo a armadas»: elegís la receta, **escribís cuántas hay de verdad** (tope: lo que alcanza con lo que figura ahí), antes → después, lo que sobra con casilla «Devolver al pañol», motivo, «Sí» → devolución desde esa obra (D-) + armado (AR-). Auditoría `armadas_deposito`. Después, la nota de no seguir usándola de depósito (la obra no se oculta sola).
- **Cuadrilla, solo mirar y Dirección:** ven la tarjeta (las armadas listas, libres, la receta) sin botones; la cuadrilla ve la armada como un producto más (catálogo, material para retirar, Antes de salir).
- **Asistente:** `stock` devuelve la receta de cada armada (`armada {lleva[], nota}`); `consultar` movimientos explica `armado:true`; el resumen del día no cuenta las patas del armado.

**El armado no es consumo de ninguna obra — cada lugar que lee movimientos (`window.__armVista` = saca las patas del armado y abre cada armada que fue —o volvió— de una obra en sus piezas, con la receta guardada en el armado más cercano anterior o, si no, la vigente):**

| Lugar | Qué hace | v168 |
|---|---|---|
| `stockActual` (stock del pañol) | base + movimientos | **sin cambio**: cuenta las dos patas (bajan las piezas, sube la armada) |
| `colasYNumeros` (números S-/E-/D-) | número por grupo | el armado lleva `numero` AR- y el grupo reconoce `armadoGrupo` (si no, cada pata salía «AR-0001-B»); los S-/E-/D- no se corren |
| `calcularBalancePlaza` (calculado vs. entregado del legajo) | entregado por obra | desglose |
| `entregadoPorCodigoPlaza` (materiales por tarea de la orden) | entregado por obra | desglose |
| `comprasParaPlaza` (Lista de compras › por plaza) | lo que salió a la obra | desglose |
| `comprasPorMinimo` (Lista de compras, «⛔ se acabó» / bajo mínimo) | stock contra mínimo | las armadas afuera (se arman, no se compran); las piezas bajan solas por `stockActual` |
| `stockUltimaEntradaDe` / `stockUltimoPrecio` | última entrada / precio | sin cambio (la entrada del armado le da su costo a la armada; las armadas no están en compras) |
| Ficha del material («salió este mes», proveedor sugerido) y «📊 Por sector» | salidas del mes | desglose |
| Centro de informes › movimientos de pañol | movimientos por destino | desglose |
| `GASTOS.costeoDe` (Gastos › Por obra, Ganancia, tablero del dueño, Dirección) | material de la obra × costo del catálogo | desglose: la obra paga las piezas |
| `gastosPro` › Generales y por mes (materiales por mes) | salidas a obras × costo | desglose |
| `__reservas.entregadoAObra` (faltante del cómputo, material contra avance, Llevar a obra, depósito) | entregado neto por obra | desglose |
| Legajo › «📦 Material entregado» | entregado neto por obra | desglose |
| `__matAvance` (material contra avance, «Ver vales») | vales de la obra por material | desglose (el vale de la armada aparece en cada pieza con su número) |
| `pedidoCompras` (consumo de las obras programadas, lo recibido) | salidas y entradas | desglose |
| `informeSemanal` (lo que salió en la semana) | vales netos | desglose |
| Asistente `resumen_dia` | salidas / entradas del día | sin las patas del armado |
| Asistente `consultar` movimientos / `stock` | listado crudo / stock | crudo con `armado:true` explicado / la receta |
| `cargoDePersona` («👷 Por persona») | material en cargo | sin cambio (el armado no es `enCargo`) |
| Devoluciones (lo entregado para devolver) | por código | sin cambio: la armada vuelve como armada |
| `stockNegativo`, respaldo, listado y filtros de Movimientos | historia del stock | sin cambio; la pata se ve como «🔧 Armado (sale / entra)» |
| `registrarObra` (renombrar en cascada, contar movimientos) · historial del legajo · `remitoFoto` · proveedores · cotización · `fechaVivaImpresionCel` · `cuadrillaDia` (Antes de salir) | — | sin cambio (el armado no tiene obra, remito ni proveedor; la armada sale como producto) |
| QR / `?doc=` (`codigosQr`) | S-/E-/D- | también AR- |
| `certMensual`, `auditorAvance`, `tableroDueno`, `inicioDir` | no leen movimientos directo | por `__matAvance` / `GASTOS` (desglosados) |

Pruebas viejas con `__v168No` (todo como la v167). **Sin reglas nuevas** (`movimientos` y `catalogoProductos`, que el pañol ya edita). Se arma con `herramientas/v168/patch_v168.py` (+ `armadas.js` / `.css`) sobre el ORIGINAL 167.

**A confirmar con Ángel:** el prefijo «AR-»; los metros de cable por armada (los carga él en la receta; en la maqueta 5,5 m era ejemplo); los códigos de las armadas (los elige él; la app propone el siguiente libre de la familia 6); qué hacer con la obra «DEPOSITO LUMINARIAS» después de pasar a armadas (la app no la oculta ni la archiva). **Para después:** armar desde el asistente (`proponer_movimiento_panol` tipo armado: no se hizo, el asistente solo explica) y el aviso en la reserva de una obra que pide 6010 «Hay N armadas · Llevarlas en su lugar» (no se hizo).

**Pruebas:** `t_v168` (7 grupos, 83 pruebas) PC 83/83 · celu 83/83 · `REGLAS=1` 83/83 sobre la entrega. Batería completa de a 3 (PC y celu, 172 pruebas × 2, sin `t_v083`): todo OK salvo, en la tanda, `t_v031`, `t_v143`, `t_v146`, `t_v149`, `t_v149b`, `t_v154`, `t_v155`, `t_v164`, `t_v164f`. **Solas** (una por vez): `t_v031` PC 15/15, `t_v143` celu 78/78, `t_v146` celu 64/64, `t_v149` celu 35/35, `t_v149b` celu 37/37, `t_v155` celu 86/86 (eran tiempos de la máquina cargada); `t_v143` PC 77/78 (la carrera vieja de `vehiculoPersona` documentada desde la v150); `t_v154` PC y celu se cortan igual contra la **v167** («la quincena de Juan» da 18,1 y no 25,1: depende de la fecha, no de la v168); `t_v164` PC 67/70 · celu 69/70 y `t_v164f` PC 69/70 · celu 68/70 (tareas largas / destello / recuperar al cerrar la app): la **v167** sola da lo mismo (67/70, mismas fallas). Ninguna falla es de la v168 (las pruebas viejas corren con `__v168No`).

**Huellas (sello `2026-11-18 11:24 · c2f1f8`):** ORIGINAL `168_2026-11-18_app-EMA_ORIGINAL.html` dc9dd7332b0e3fc8d5b3e8977931c15ef81ac87a0cdfb14ebc1de0a4d7dbed49 · `index.html` a99204ef6673c319ae13b2744989d0a8794498ac536b76f61075d6f12a88b4fa.

## v167 — 18/11/2026 (publicada en GitHub 18/11) · Zoom en la cámara + galería: elegir varias, enviar varias, borrar
**Pedido (Ángel, 18/11):** «La cámara no podés hacer zoom… como que muy alejada, tenés que acercarte mucho para la foto.» · «Cuando sacás varias fotos, podés entrar a la galería y apretar enviar varias, seleccionar varias o eliminar alguna, tanto la cuadrilla como la oficina. Y automáticamente se ponen en obras y legajos, pero que también se puedan enviar de ahí varias.» · «Cuando hagas el zoom verificá que todo esté bien, que siga con el tiempo rápido de sacar fotos.»

**Qué pasaba (reproducido contra la v166, `t_v167` grupo 0 con `ANTES=1`, 2/2):** la cámara de la app pedía solo «la de atrás» (`facingMode: environment`) y nunca miraba cuál de las traseras le daba el celu: con un celu de dos traseras (la gran angular primero en la lista, como la ofrece el navegador) se quedaba con la gran angular, nunca llamaba a `enumerateDevices`, y no tenía zoom de ninguna clase (ni pellizco, ni botones, ni el zoom del aparato). En los celus con gran angular / macro / profundidad, Chrome puede dar una que no es la principal (**a confirmar en el Moto g24**: tiene principal + macro). La imagen en pantalla ya era igual a la foto (las dos el cuadro entero), así que lo «alejado» no venía del encuadre.

**Qué cambia:**
- **La cámara principal de atrás:** la primera vez (con el permiso ya dado, los nombres se pueden leer) la app mira las cámaras y se queda con la principal («camera2 0, facing back»: el número más bajo, sin «ultra / wide / gran angular / 0,5 / macro / depth / tele»); si la que vino era otra, cambia una sola vez y la anota en el celu, así las próximas (y la precalentada de la v164) abren directo con esa. Si un día no abre, se olvida y vuelve a «la de atrás».
- **Zoom** con dos dedos (pellizco) sobre la imagen, con la ruedita en la compu y con los botones **1× · 2× · 3×** (44 px) a la derecha, a media altura: no tapan el disparador, la fila para nombrar (v164) ni la píldora / reloj / «Col ▾» / «Terminé» / miniaturas de la cámara C (v165). Primero el **zoom del aparato** (`getCapabilities().zoom` → `applyConstraints`, de a uno por vez); lo que pasa de su máximo, o todo si no tiene, es **digital**: la imagen se agranda en su cuadro y **la foto es exactamente lo que se ve** (se recorta el centro con `createImageBitmap`, el mismo camino rápido de la v164: destello en el toque, Worker, ráfaga). La foto sale como siempre, lado mayor hasta 1024 px (si el recorte es más chico, no se agranda); el sello y las miniaturas salen del recorte; la marca en vivo queda sobre lo que se ve.
- El zoom sigue mientras la cámara está abierta y mientras queda tibia (v164, 25 s); cerrada del todo, vuelve a 1×.
- **Galería, «☑ Elegir»** también en la galería que se abre sin lista de fondo (📷 Mis fotos de Mis tareas, la última foto de la cámara, el «📸 Avance»…): hoja «☑ Elegir fotos» con las fotos y su tilde, «N elegidas de M», «Elegir todas» / «Ninguna» y abajo **«📤 Enviar (N)»** (el menú del celu con las N fotos de una —WhatsApp, Drive…—; en la app de Android, por Share; en la compu, el ZIP con GPS de siempre; sin señal, la foto que está en el celu), **«🗑 Borrar (N)»** con «¿Borrar 3 fotos?» y **«↔ Mover»** (v152, solo quien puede).
- **Borrar:** la cuadrilla, solo SUS fotos de SU orden abierta (quedan «borrada» en la orden, como «🗑 La última» de la v107); la oficina, las que ya podía borrar (legajo, `fotosBorradas`). Lo que no se puede, el botón lo dice («1 no es tuya»). Nada se borra de la nube. Mirar, pañol y Dirección: solo Enviar.
- En la barra de elegir del legajo / Mis tareas: «Enviar (N)» y «Borrar (N)» (también la cuadrilla, con sus fotos), con la misma confirmación.
- Las fotos siguen cayendo solas en la orden, en Obras y en el legajo (probado).
- Pruebas viejas con `__v167No` (todo como la v166). **Sin reglas nuevas.** Se arma con `herramientas/v167/patch_v167.py` (reemplazos chicos en `camaraApp`, `fotosAlToque` y `galeriaPro` + el módulo `zoomGaleria`). La cámara del teléfono / APK no se tocó (tiene su zoom).

**Qué tiene que hacer Ángel:** subir `index.html` a GitHub. No hay reglas ni APK nuevos.

**Pruebas (versión final 1275fc):** `t_v167` (10 grupos, 76 pruebas) PC 76/76 · celu 76/76 · `REGLAS=1` 76/76 (en el armado); con el ORIGINAL final en la batería PC 76/76 y celu 75/76 (un tope de tarea larga del grupo 4 con la máquina cargada). Reproducción contra la v166 (`ANTES=1`, grupo 0): 2/2. Pedidas: `t_v164` celu 70/70 (sola), PC 68/70 (los dos de tiempos de la cámara de la barra, también fallan con la v166 en esta máquina: 65/70), `t_v165` 59/59, `t_v166` 38/38 (celu 38/38 sola), `t_v149b` 37/37, `t_v152` 73/73, `t_v107` 6/6, `t_circuito` 16/16 en PC y celu. Batería completa de a 3 (342 corridas): fuera de las conocidas (`t_v083`, `t_v154`, `t_v164f` copia vieja) solo tiempos con carga, que pasan solas: `t_v160` PC 54/54, `t_v143` celu 78/78, `t_v149` celu 35/35, `t_v166` celu 38/38. Ojo: en la misma máquina corría a la vez la batería de otra versión (carga 8–12), lo que mueve los tiempos.
**Destello (toque → destello en pantalla, CPU ×6, toques reales, medianas de 5):** sin carga, Modo obra 1× 8–19 ms · 2× digital 13–17 · 2× del aparato 13–20 · cámara de la barra 1× 10–19 · 2× digital 15–20 (tres corridas); ninguno > 250 ms y ninguna tarea larga > 300 ms. Con la máquina cargada (carga 8–9) las medianas siguen ≤ 40 ms pero aparecen picos sueltos de 270–710 ms y tareas largas de 350–760 ms, con y sin zoom (la v166 da lo mismo en `t_v164` grupo 5).
**Huellas:** ORIGINAL `167_2026-11-18_app-EMA_ORIGINAL.html` `cd8057b5fca8de41773df559dc2220358d6c4c9f0822cb27e5c97348091ab6be` · `index.html` `ce87d76a99a22620d06a09291ccb9266ab0a0ed2b960e972ef8123ed4f638eb0` · sello `2026-11-18 09:49 · 1275fc`.

## v166 — 17/11/2026 (publicada en GitHub) · «▶ Voy a iniciar» y el tiempo de cada columna también en Mis tareas (la lista)
**Pedido (Ángel, 17/11, con la v165 en los celus):** «a los chicos no les sale eso del tiempo ni nada». Los chicos sacan las fotos desde **Mis tareas** («Ver lista completa»), no desde Modo obra, y la v165 solo enganchaba el botón grande de Modo obra. Maqueta en `maq166/` (tarjeta con el botón verde, el cartel, «En marcha», cada columna con su tiempo).

**Qué pasaba (reproducido contra la v165, `t_v166` grupo 0 con `ANTES=1`, 5/5):** el 📷 de Mis tareas abría la cámara directo, sin cartel y sin hora de inicio (`campo.tareaInicio` vacío); la v157 sí dejaba la hora de cada foto en `campo.pasosObra` (la primera columna contada desde «Llegué»: 34 min en vez de 24), pero en la fila no se veía nada: solo el cartelito `#tcAviso`, que se va a los 9 s; las fotos de Mis tareas no pasaban por el récord (`trasFoto` llamaba a la `marcar` interna, no a la que envuelve la v165); y las filas no seguían las columnas que eligió la oficina (`ot.columnas`): proponía la Col 5 y no había fila para la Col 8.

**Qué cambia (cuadrilla y operario en Mis tareas; la oficina sin cambios):**
- **El primer 📷 (o «Se hizo») de una tarea sin arrancar** abre el mismo cartel de la v165 («¿Arrancás con POZO?», «Col 6, 7 y 8 · PLAZA LOS ÁLAMOS · con Pedro», «Todavía no», «¿Es otra tarea?»). «▶ Voy a iniciar» anota lo mismo (`campo.tareaInicio`, `colInicio` de esa fila; en tareas sin columnas, la hora de inicio de la tarea) para todos los de la orden —el compañero ya no ve el cartel— y **sigue con lo que la persona quería**: la cámara de esa fila, la de la app o la del teléfono / APK (el mismo toque de siempre, así la foto llega a su fila por `fotoSegura` / `androidPro`). «Todavía no» deja sacar la foto sin anotar y no vuelve a preguntar en 15 min; ✕ no hace nada.
- **Cabecera de cada tarea:** botón verde «▶ Voy a iniciar esta tarea» (anota y abre la cámara de la primera fila) o «▶ En marcha desde 08:20 · 24 min» con quiénes («inició Juan» para el compañero).
- **Cada fila con foto:** «✓ Col 6 lista · 24 min · 08:20 → 08:44» con «cambiar» (− / +), queda ahí (en la plantilla, no un cartelito) y lo abierto sigue abierto aunque Mis tareas se redibuje; la fila que sigue, «⏱ Col 7 corriendo · N min». Las filas que faltan son las columnas que eligió la oficina.
- **Récords y felicitaciones:** la foto de cada columna pasa por el récord de la v165 («🔥 ¡Récord tuyo! Col 6 en 24 min», «👍 Estuviste bien»); al mandar una tarea, `campo.tareaFin`, el récord de las tareas sin columnas (zanja, por metro) y las felicitaciones. El resumen por columna al mandar (v157) sigue igual.
- Pruebas viejas con `__v166No` (todo como la v165). Sin reglas nuevas. Se arma con `herramientas/v166/patch_v166.py` (+ `inicioMt.js` / `.css`) sobre el ORIGINAL 165.

**Pruebas:** `t_v166` (5 grupos, 38 pruebas) celu 38/38 · PC 38/38 · `REGLAS=1` 38/38 (Juan en el celu con CPU ×4, Pedro en otra página). Las pedidas: `t_v165`, `t_v157`, `t_v142`, `t_v149b`, `t_v123`, `t_v130`, `t_circuito` OK en PC y celu; `t_v164` celu 70/70, PC 68/70 en la tanda (los dos de tiempos: tarea larga y destello con la máquina cargada; 70/70 sola). Batería completa de a 3 (PC y celu): 332/340; fuera de las conocidas (`t_v083`, `t_v154`) quedaron `t_v164` (PC 65/70, celu 69/70: tiempos con la máquina cargada; solas 70/70), `t_v143` celu 77/78 (la carrera vieja del vehículo; sola 78/78) y `t_v164f` PC 68/70 (copia vieja de `t_v164` en la carpeta de pruebas, no está en el repo: sola 69/70, el mismo 69/70 contra la v165). «Que no se tilde» (CPU ×6, mediana de 3 contra `__v166No`): tocar el 📷 → cartel 65–93 ms (la cámara de la v165: 128–167 ms); abrir Mis tareas 280–420 ms contra 282–331 (lo > 200 ya estaba en la v165).

**A confirmar:** «Todavía no» deja seguir con la foto (15 min sin volver a preguntar); «Se hizo» también pide el cartel si la tarea no arrancó; la cabecera muestra los minutos al momento de dibujarse (no corre cada minuto).

- Sello `2026-11-17 14:19 · 241e77`. Huellas en `herramientas/v166/huellas.txt`. Capturas del celu en la carpeta de entrega `v166/capturas/`.

## v165 — 16/11/2026 (publicada en GitHub 17/11) · La cuadrilla: «▶ Voy a iniciar esta tarea», cámara primero (opción C), otra tarea rápido y récords
**Pedido (Ángel, 16/11):** «Al iniciar la tarea le tiene que salir un cartel grande "voy a iniciar esta tarea", cosa que nosotros podamos medir más exacto» · «si nosotros no ponemos la tarea exacta, ellos en otra que pongan el nombre, que sea rápido» · «cada vez que rompan récord darles emojis diciendo genial rompiste tu récord o estuviste bien». Maquetas aprobadas (opción C · cámara primero) y los agregados del mismo día: columnas del cálculo en la orden y en la cámara, la PAT en dos instancias, «entrás a la tarea y ahí la cámara rápida», «que no se tilde nada».

**Qué cambia (cuadrilla y operario, en Modo obra):**
- **Cartel «▶ VOY A INICIAR ESTA TAREA»** (hoja grande con ✕): «¿Arrancás con POZO?», las columnas de su orden, la obra y con quién; botón verde gigante y «Todavía no». El toque anota el inicio exacto de la tarea (`campo.tareaInicio.<tarea>.<persona>` con la hora, la gente y el GPS) y de su primera columna (`campo.colInicio`, el «▶ Empecé» de la v157). El compañero ya no ve el cartel (va directo a la cámara); si lo toca igual queda su entrada y el inicio es el primero. Si nunca lo tocan, todo sigue como la v157.
- **Opción C · cámara primero:** enseguida se abre la cámara de esa tarea y queda abierta columna tras columna: píldora «OBRA · Tarea · a 18 m», reloj de la tarea en marcha, la columna que va a decir la foto («Col 5 ▾» abre la lista: las de su orden con su estado y «Otras de la obra»), miniaturas ✓ subida / ↑ subiendo y «✓ Terminé la tarea». Cada foto marca el fin de su columna (v157) y pasa sola a la siguiente. Se sale con ✕ a Modo obra («▶ Pozo en marcha desde 08:20» con «📷 Volver a la cámara» y «✓ Terminé la tarea»).
- **«Terminé»:** la hoja con el tiempo de cada columna (− / + de 5 min), «✓ Listo, mandar» (manda la tarea; con la última, la orden) y «Sigue: Tarea 2 · Izaje · Col 2 y 3» con su «▶ Voy a iniciar esta tarea».
- **Otra tarea rápido:** en el cartel, «¿Es otra tarea?» → 9 botones grandes (Pozo, Hormigón, Izaje, Vínculo, Artefacto, Tablerito, Tablero, PAT, Zanja, con su tarea real del catálogo) y «✏ Otra: escribila o decila 🎤» (sugerencias del catálogo desde 2 letras, «Usar tal cual lo escribí», las últimas usadas en ese celu, dictado). Lo que no estaba en la orden va a `campo.extras.<id>` (tarea, quién, inicio, fin, cuántas) y sus fotos llevan ese nombre. **La oficina** lo ve como «➕ Hecho de más · no estaba en la orden» en el «📸 Avance», el cierre y la verificación (v150), con «＋ Sumar a la orden» (entra la tarea con su cantidad, sus fotos y su hora) o «✕ Descartar».
- **Récords y felicitaciones:** récord personal, nunca contra los compañeros (por persona, tarea y cantidad de gente): «🔥 ¡Récord tuyo! Col 6 en 24 min (tu mejor era 30)» o «👍 Estuviste bien: cerca de tu mejor tiempo». Solo con foto, hora no dudosa, sin falla ni «no se hizo» y con 3 tiempos anteriores; si la oficina marca falla/observada o el cierre lo cambia, se borra solo. **Sin récord en tareas de riesgo** (izaje, hormigonado, vínculo y todo lo de altura, tablero, acometida, EPEC, poda, retiros). También «⭐ Todas las fotos bien hoy», «💪 N días seguidos sin fallas» y «✅ ¡Terminaste todo lo de la orden!». Cartelito `role=status` que se va solo y no frena. «🔥 Mis récords» en ⭐ Mis puntos; la oficina, «🔥 Récords de cada uno» en 🧠 › ⏱ (solo mirar).
- **Llenar orden con las columnas del cálculo:** en cada tarea por columna, chips con las columnas de la obra (por tablero y circuito): hechas en verde tachadas, en otra orden, «fraguando (hasta jue)», sin el paso anterior; «Las que siguen», «Todo el circuito», «Ninguna»; la cantidad = las columnas elegidas (también Tablero / Acometida / PAT del tablero). Se guarda en `ot.columnas{tarea:[nombres]}`; Modo obra, la planilla v150, lo asignado del avance v158 y el aviso de trabajo repetido usan esos nombres. La sugerida y el asistente (todo lo que se emite sin elegir) llenan «las que siguen».
- **PAT en dos instancias** (Ángel: «son las mismas mediciones de las mismas columnas, el mismo tablero, pero son dos instancias distintas»): en el avance nuevo la «Medición de puesta a tierra» (una por jabalina) pasa a dos hitos, «Medición de PAT · prueba interna» y «· inspección final» (cada uno de todas las jabalinas y el tablero); el diccionario suma las tareas `medicion_pat_int` y `medicion_pat_fin` (por obra, 2 HH a confirmar); la tarea vieja `medicion_pat` marca la interna; el itemizado (ítem 81, lo que se cobra) no cambia.
- **«Que no se tilde nada»:** la tanda 2 de `appCelular` (tablas del pañol como tarjetas) recorría todas las filas del catálogo con cada cambio de la página: ahora solo cuando el cambio toca el pañol o la Calculadora. El «Voy a iniciar» abre la cámara primero y anota la orden en otro turno. Números en `herramientas/v165/medidas.txt`.
- Pruebas viejas con `__v165No` (todo como la v164). Sin reglas nuevas (la cuadrilla escribe solo en `campo`; la oficina, por `fbOtUpdate`). Se arma con `herramientas/v165/patch_v165.py` (+ `inicioTarea.js` / `.css`) sobre el ORIGINAL 164.

**Pruebas:** `t_v165` (6 grupos, 59 pruebas) PC 59/59 · celu 59/59 (Juan con CPU ×4) · `REGLAS=1` 59/59. Sobre la v164 final: `t_v164` celu 70/70 y PC 70/70 (solas); `t_v142`, `t_v144`, `t_v148`, `t_v149b`, `t_v150`, `t_v151`, `t_v152`, `t_v157`, `t_v158`, `t_v160`, `t_v163`, `t_circuito` OK en PC y celu (`t_v148` PC 36/37 en la tanda por un tiempo de abrir la cámara con carga, 37/37 sola). Batería completa de a 3 (sobre la v164 de las 21:56, antes de sus ajustes finales): 326/336, solo las conocidas (`t_v083`, `t_v143`, `t_v149` PC, `t_v154`) y tiempos con carga (`t_v086` PC, `t_v164`, que pasan solas). «Que no se tilde» (CPU ×6, `herramientas/v165/medidas.txt`): cartel 146–240 ms (v164: abrir la cámara 300–520), cámara C 145–215, foto 105–154, lista de columnas y «Terminé» < 75, chips < 180; lo que queda > 200 (abrir Llenar orden 390–570, también sin la v165) no es de la v165.

**A confirmar:** la lista de tareas de riesgo sin récord; «cerca de tu mejor» = hasta 10 % más; récords desde 4 tiempos buenos (3 anteriores); «N días seguidos sin fallas» cuenta días con orden (desde 3); el récord de las tareas sin columnas (zanja) es por unidad (minutos por metro) con la cantidad que dicen; las horas de las dos mediciones de PAT; las tareas comunes de los 9 botones; «Las que siguen» no sugiere columnas sin el paso anterior ni fraguando.

- Sello `2026-11-17 06:47 · b5dc7b`. Huellas en `herramientas/v165/huellas.txt`. Capturas del celu (las mismas pantallas que las maquetas) en la carpeta de entrega `v165/capturas/`.

## v164 — 16/11/2026 (publicada en GitHub 17/11) · Fotos de la cuadrilla: el disparador que no sacaba, que lleguen al toque y nombrar en la cámara
**Pedido (Ángel, 16/11, después de probar en obra):** «para sacar fotos es súper lento» · «a la hora de nombrar es súper lento… columna, tablero, PAT» · «una vez que sacan fotos no me llega, tengo que esperar» · **«estuve ahí esperando, apretando y no se sacaba la foto. Rarísimo»** · «que no se tilde nada» · «entrás a la tarea y ahí la cámara rápida».

**Por qué el disparador no respondía (reproducido contra la v163, `herramientas/v164/sonda_disparador.js` y `medir164.js SECC=A`):** (1) el toque copiaba el video a 1920 × 1440 y lo pasaba a JPEG **antes** de dar ninguna señal: con el celu ocupado guardando la foto anterior (sello, miniaturas, subida) eso tardaba 1 a 5 s y no se veía nada; (2) si la cámara todavía no tenía imagen (recién abierta, celu lento) el toque **no hacía nada ni decía nada** (`if (!v.videoWidth) return`); (3) el segundo toque arrancaba otra foto que en Modo obra terminaba con la cámara ya cerrada: error «Cannot read properties of null (reading 'pos')» y esa foto se perdía. Además, «Sacar otra» después de una foto suelta no hacía nada.

**Qué cambia:**
- **El toque saca la foto siempre y al instante:** destello y vibración en el mismo toque; el cuadro se copia ya a 1024 px (el tamaño de la foto final); en Modo obra la cámara se va en ese toque y la foto se arma por atrás; sin imagen todavía avisa «La cámara está arrancando… la saco apenas se vea» y la saca sola (si en 6 s no hay imagen: «Tocá ✕ y abrila de nuevo, o usá la del teléfono»); nunca dos a la vez; con la cámara ya cerrada la foto llega igual.
- **«Como una cámara normal: apretás y saca al instante»** (Ángel 17/11, después de ver las primeras medidas): el disparo sale al apoyar el dedo (no espera al clic, y ese clic no despierta a nadie más); en el toque solo el destello; el cuadro se toma enseguida y un Worker (OffscreenCanvas) lo achica y arma el JPEG fuera del hilo de la pantalla (respaldo: el canvas de siempre). **Modo obra en ráfaga:** la cámara queda abierta, la columna pasa sola a la siguiente y «Listo» sale (ahí aparece «Foto guardada»). La foto queda en el celu apenas se saca y lo pesado espera 1,5 s sin tocar el disparador, y con la cámara abierta la app no redibuja lo de atrás (las escuchas de la base y Mis tareas se ponen al día al cerrarla).
- **La cámara abre al toque:** se empieza a prender al apoyar el dedo en «Foto», y queda «tibia» 25 s después de cada foto («Sacar otra» abre sin volver a pedirla); se apaga si la app se va al fondo.
- **Llega al toque a la oficina, con la cámara abierta:** la cola de por atrás y la bandeja ya no esperan a que se cierre la cámara y pasen 1,5–1,8 s sin tocar nada (salen a los 0,6 s del disparo, de a una, en los huecos del hilo); apenas se saca, la orden recibe la miniatura (del mismo cuadro del disparo) con **«subiendo…»** en el «📸 Avance», la ficha del legajo se escribe antes que la imagen grande, y la imagen sube después. Nada se duplica (el número de la foto se fija de entrada) ni se pierde (la bandeja v149b la tiene desde el primer momento).
- **Más liviana:** el sello decodifica una sola vez (`createImageBitmap`) y de ese lienzo salen las miniaturas y la imagen para subir (antes `comprimirImagen` dos veces + `__miniChica`); no lee el EXIF de las fotos de la cámara de la app.
- **Que no se tilde con la cámara abierta:** los relojitos de las pantallas de atrás corren cada 10 s como mucho y los vigías de la página no se despiertan por lo que cambia adentro de la cámara o detrás de ella (al cerrarla, todos se enteran); la marca en vivo ya no obliga a recalcular la página cada segundo; la píldora de la cámara de la barra cada 2 s.
- **Nombrar en la cámara misma** (Modo obra y cámara de la barra): «‹ Col N ›» + **Columna · Tablero · PAT · Zanja · Acometida · Otro…** arriba del disparador; «Otro…» abre un teclado chico con lo último escrito; lo elegido sigue en la foto siguiente (las columnas pasan solas a la que sigue); lo que no es tarea de su orden va igual a la orden como foto suelta y la oficina la mueve con «↔ Mover».
- Pruebas viejas con `__v164No` (todo como la v163). Sin reglas nuevas. Se arma con `herramientas/v164/patch_v164.py` (+ `fotosAlToque.html`) sobre el ORIGINAL 163.

**Toques reales (CDP), 5 seguidos a 1 por segundo (`herramientas/v164/medir_toque.js`, versión final):** del dedo al destello en pantalla v164 2–30 ms en 19 de 20 toques (uno de 135 ms, cuando el dedo tardó 143 ms en llegar a la página), con CPU ×6 y ×4; la v163 no daba ninguna señal en la cámara de la barra (la foto llegaba 0,8–3,7 s después) y en Modo obra se veía algo recién a los 350–900 ms, con un toque sin foto y el error de la foto perdida. Tareas > 100 ms con la cámara abierta: v163 16–27 (hasta 416 ms) → v164 2–3 con CPU ×6 (la más larga 118–172 ms) y 0 con CPU ×4; ninguna > 200 ms. Con la oficina en otra página del mismo navegador de pruebas el toque tarda 0,5–2 s en llegar a la página (navegador y CPU compartidos con la máquina cargada; la página casi sin tareas largas): en obra la oficina es otro aparato.

**Números (celu, CPU ×6, máquina de pruebas cargada; detalle en `herramientas/v164/medidas.txt`):** tocar con la cámara arrancando: v163 0 fotos y ninguna señal → v164 destello en 42 ms y la foto sale sola; dos toques: v163 1 foto + error → v164 1 foto sin errores; disparo → la oficina la ve: Modo obra 7,4–11,1 s → 3,3–4,6 s, cámara de la barra 10,2–15,0 s → 3,8–7,5 s (las 5 con la cámara abierta); tareas largas de más de 200 ms al disparar 12 → 10 y mientras sube con la cámara abierta 1 (321 ms) → 0 (la más larga 196 ms).

**Pruebas (versión final 2b2e8b; la máquina con carga 5–15 por otras baterías corriendo a la vez):** `t_v164` (grupos 0–5, 70 pruebas) PC 70/70 · celu 69/70 (el «subiendo…» del grupo 3 no se vio a tiempo; solo pasa 15/15) · `REGLAS=1` 66/70 en la tanda (grupo 4 «cerrar la app a mitad» y los topes de tareas largas con carga 11–14) y solo 16/16 los grupos 4–5. `t_v142`, `t_v144`, `t_v149b`, `t_v150`, `t_v152`, `t_v157`, `t_v160`, `t_circuito`, `t_v139`, `t_v163` OK en PC y celu; `t_v148` celu 42/43 en la tanda (un tiempo de 1012 ms contra < 1 s; la v163 en la misma corrida da 41/43: es la carga) y 43/43 sola; `t_v154` sale con error de tiempo de espera igual que con la v163. Batería completa de a 3 con el sello a56faf (antes de los dos últimos ajustes chicos): 333 corridas, todo OK salvo las conocidas (`t_v143` PC, `t_v149` PC, `t_v154` PC/celu, `t_v139` PC una vez —44/44 sola—) y el grupo 4 de `t_v164` PC, arreglado después (la foto queda en el celu antes de esperar).

**A confirmar:** Modo obra en ráfaga (antes, cada foto cerraba la cámara); el 1,5 s de espera antes de guardar (en una ráfaga, las fotos llegan a la oficina cuando paran); en celulares reales que el destello se sienta al instante (si el WebView no alcanza, la alternativa es la cámara nativa en el APK: no hecha); la cámara tibia 25 s y la precalentada (la lucecita del celu prendida); los 6 s de espera si la cámara no muestra imagen; los botones para nombrar y que Tablero/PAT/Zanja/Acometida que no son tarea de la orden vayan como foto suelta; con la cámara abierta, lo de atrás se actualiza cada 10 s.

- Sello `2026-11-17 06:10 · 2b2e8b`. Huellas en `herramientas/v164/huellas.txt`.

## v163 — 16/11/2026 (publicada en GitHub 17/11) · Avance de obra: marcar lo que ya está hecho, fácil y sin que lo frene el fraguado
**Pedido (Ángel, 15/11):** «Cuando entrás al avance de obra y querés editar, diciendo esta tarea ya la hice… está como un poco complicado… Hay plazas que están retrasadas, que ya están completas y solo le falta la última cosa, y no puedo marcar que ya se hizo porque me tira que falta el hormigonado y tengo que esperar 3 días… La idea es marcar ahora y que luego avance solo.»

**Qué lo frenaba (reproducido contra la v162, `t_v163` grupo 0 con `ANTES=1`, 5/5):** en una obra vieja sin órdenes, «✅ Columna completa» guardaba el hormigón con la hora del momento y el avance lo mostraba «⏳ fraguando» 72 h (alerta «1 base fraguando», la columna en «fraguando» en la tira, y al marcar el izaje el aviso «está fraguando hasta…»); además había que ir columna por columna (o un paso por vez con «Elegir varias») escribiendo el motivo cada vez.

**Qué cambia:**
- **Lo marcado a mano no fragua** salvo que se diga que se hormigonó hace poco: al marcar el hormigón (solo, «Columna completa» o «Todo» en «Elegir varias») pregunta «¿Cuándo se hormigonó?» con **«Ya hace días (está fraguado)»** elegido de entrada; «Hoy» / «Ayer» sí fragua 72 h desde ese momento. El aviso al marcar el izaje sobre un hormigón fraguando no frena (se marca y avisa «quedó marcado igual»; en «Elegir varias», «Marcar igual»). Lo que viene de las órdenes sigue igual.
- **«⚡ Poner al día esta obra»** en el flash del avance (solo quien edita Avance; no cuadrilla, Dirección, «solo mirar» ni pañol): una hoja para marcar en UN paso las columnas (todas, o desde Col N hasta Col M) × los pasos (con «Todo» y atajos «Solo pozo y hormigón» / «Hasta el izaje»), lo que no va por columna (zanja, cable, tablero, acometida, inspecciones…; todo o uno por uno, con cantidad), el motivo precargado «Puesta al día del avance», el resumen antes → después con el % nuevo y «Sí, marcar». **«🏁 Está toda terminada»** = todo hecho de una (3 toques: ⚡ · Está toda terminada · Sí). Sin fraguado. Solo suma lo que falta: no pisa lo que viene de las órdenes; de ahí en adelante las órdenes siguen moviendo el avance solas encima y lo marcado no se cuenta dos veces. Los papeles siguen por «📄 Documentación».
- Se guarda como siempre (`fbAvanceCampos`): `av2.m` (una entrada por columna, `a<ts>_<COL>` con los pasos), `av2.hist` y `avanceHist`, con auditoría. Lo puesto al día no tiene fecha real: no inventa un ritmo de «100 % en un día».
- **Asistente:** `proponer_marcar_avance` acepta `puesta_al_dia` («de la 1 a la 6 ya están izadas») y `toda_terminada` («ya estaba hecha toda»), con `cosas` y `cuando_hormigon`; tarjeta con el antes → después y «Sí».
- Arreglos chicos: el historial de la hoja de la Col 1 mostraba también los cambios de las Col 10–12; el cartel de la hoja ya no se borra cuando se redibuja sola después de guardar.
- Pruebas viejas con `__v163No` (todo como la v162). Sin reglas nuevas. Se arma con `herramientas/v163/patch_v163.py` (+ `puesta.js`) sobre el ORIGINAL 162.

**Pruebas:** `t_v163` PC 42/42 · celu 42/42 · `REGLAS=1` 42/42. Batería completa (166 pruebas × PC y celu, sin `t_v083`, reemplazada): **326/330** — `t_v143` (PC y celu, la carrera vieja de `vehiculoPersona`) y `t_v149` celu (muestreo del 🎤 con la máquina cargada) pasan solas; `t_v142` y `t_v154` (PC y celu) fallan igual contra la v162: el 16/11 arranca la quincena y sus datos (de 2 a 4 días atrás) quedan en la anterior (fecha de la prueba, no de la v163).

**A confirmar:** «Ayer» = 24 h antes (no pregunta la hora); si los papeles también se pueden marcar en la puesta al día (hoy van por «📄 Documentación»); que «Está toda terminada» pase también las fallas/observadas a hecho; la fecha del 100 % en «✅ Terminadas» dice «sin dato» para lo puesto al día.

- Sello `2026-11-16 14:11 · bfa1a8`. Huellas en `herramientas/v163/huellas.txt`.

## v162 — 15/11/2026 (publicada en GitHub 17/11) · Videos cortos y livianos
**Pedido (Ángel, 15/11):** «lo que pese lo menos posible para subirlo y que esté buena calidad… videos cortos, no tienen que ser videos largos».
- Tope de **1 minuto** por video (antes 2).
- Se sigue achicando a 480p (lado mayor 854 px), pero con video a 600 kbps (antes 1 Mbps) y audio mono a 32 kbps (antes 48 kbps): ≈ 4,7 MB por minuto (antes ≈ 8).
- Un video que ya viene más liviano (≤ 0,8 Mbps y ≤ 960 px) no se vuelve a achicar.
- Textos: «Videos cortos: hasta 1 minuto… (≈ 5 MB por minuto)».
- Solo constantes y textos de `archivosNube` (v160). Sin reglas nuevas. Se arma con `herramientas/v162/patch_v162.py` sobre el ORIGINAL 161.
- **Pruebas:** `t_v162` PC 5/5 · celu 5/5 (30 s de 1280×720: de 25 MB a 1,8 MB, 854×480; 1:15 rechazado); `t_v160` PC 54/54 · celu 54/54; `t_v161` 38/38; `t_humo` 3/3.
- Sello `2026-11-15 20:35 · 5a0ea7`. Huellas en `herramientas/v162/huellas.txt`.

## v161 — 15/11/2026 (publicada en GitHub 15/11) · El Inicio de Administración y Oficina pasa a ser la pantalla de Dirección (con permiso de editar)

**Pedido de Ángel** (15/11/2026): «Que directamente sea la misma pantalla [la de Dirección]. Con el beneficio de que la oficina y yo podemos editar.»

**Base:** ORIGINAL 160 (`68b19096…`). Parche `herramientas/v161/patch_v161.py` (reemplazos chicos en `inicioPro` e `inicioDir` + el módulo `inicioUnico`; `--otra-base` para reaplicar). Sin reglas nuevas, sin escuchas nuevas.

**Qué cambia:**
- **Admin y oficina abren la app en `#iniDir`** (la pantalla de Dirección: A en el celu, C en la compu) como su Inicio, no como hoja. Dirección sigue igual (solo mirar); pañol, cuadrilla y «solo mirar» no cambian.
- **Lo del Inicio Ejecutivo entra adentro, con sus acciones de siempre:** buscador + «Asistente» (debajo de la portada), «Para atender» fundido con «Necesita tu atención» (lo de Dirección —ritmo, obras atrasadas, material— y lo del Ejecutivo —para cerrar, sin cerrar, fotos sin obra, «📨 Para resolver», control del avance, gente sin tarea, usuarios nuevos, sin stock, respaldo, stock negativo— en una sola tarjeta), la orden sugerida de mañana («Emitidas N de M», «Revisar y emitir»), «🩺 Supervisor», «En obra ahora», «Órdenes de hoy» (con «Cerrar»), Accesos (Mapa de guerra, Tablero del dueño, Informe semanal, 🧠…) y «Obras» (chips y buscador). Gráficos primero: en la compu la sugerida, el Supervisor y los accesos van en la columna de la derecha; en el celu, después de «Qué se hizo». Los gráficos llevan a sus pantallas como antes (legajo, Avance, certificación). Nada se escribe solo.
- **El Inicio Ejecutivo queda escondido**; abajo de todo «Ver el Inicio de antes» lo muestra (en esa sesión) con «‹ Volver al Inicio nuevo». Conviene dejarlo un par de semanas y después sacarlo.
- **«📊 Dirección»** (menú, accesos, Tablero del dueño) ya no aparece para admin/oficina: es su Inicio.
- **Rendimiento:** el código de la pantalla de Dirección pasa a leerse justo después del Inicio (antes estaba al final de la página y el Inicio tenía que esperar ≈ 4 s más en un celu lento); la portada y las piezas se dibujan primero y los gráficos al toque. Celu con CPU ×4: del «Inicio listo» al Inicio dibujado 220–350 ms (el Ejecutivo de la v160: 100–330 ms); repintado cada 2,5 s ≈ 30 ms.
- **Arreglo (venía de la v155):** la bandeja «📨 Para resolver», al cerrarla, seguía tapando la pantalla (`#prOv[hidden]`).

**Pruebas:** `t_v161` PC 38/38 · celu 40/40 · `REGLAS=1` 38/38 (admin y oficina con todas las piezas y sus acciones, emitir la sugerida desde el Inicio, Dirección igual y sin acciones, pañol/cuadrilla/mirar sin cambios, `__v161No`, sin escuchas nuevas, tiempo en el celu con CPU ×4). Batería de a 3 (TZ Córdoba): 322/328 OK; fallan solo las conocidas (`t_v083` PC/celu, `t_v147` 52/53 PC y 117/118 celu, `t_v150` PC/celu se corta por tiempo). `t_v135`, `t_v136`, `t_v143`, `t_v145`, `t_v155`, `t_v156`, `t_v158`, `t_circuito` OK en PC y celu (no hizo falta cambiarlas: siguen con el Ejecutivo por `__v161No`). Medición: `herramientas/v161/medir_inicio.js`. Capturas celu y PC en el scratchpad (`v161/capturas`).

**Huellas:** ORIGINAL `dcc2597f…`, index `077f73b3…`, sello `2026-11-15 14:21 · 762a5c` (ver `herramientas/v161/huellas.txt`).

**A confirmar:** cuánto tiempo queda «Ver el Inicio de antes»; si Dirección también tiene que ver (sin botones) las piezas del Ejecutivo (hoy no: «Dirección sigue igual»).

## v160 — 15/11/2026 (publicada en GitHub 15/11) · PDF y videos (comprimidos) en Cloudflare R2, junto a las fotos

**Pedido de Ángel** (13/11/2026): «en el lugar donde mandamos las fotos (Cloudflare), ¿podemos almacenar los PDF y videos?» … «sí, los videos tendría que comprimirlos» … «dale, hacelo». No eligió detalles: van los valores por defecto, marcados «a confirmar».

**Base:** ORIGINAL 159 (`58b9e85d…`). Parche `herramientas/v160/patch_v160.py` (reemplazos chicos + el módulo `archivosNube`; `--otra-base` para reaplicar). **Worker `ema-fotos` v2-fotos** (`workers/ema-fotos.js`, ya hecho; `node workers/probar_ema_fotos.mjs` 98/98; instructivo «Actualizar el Worker para la v160»; copia y pasos simples en `entregas/v160/`). Sin reglas nuevas.

**Qué cambia (solo si `/salud` del servidor de fotos dice `v2-fotos`; si no, todo como hoy y los botones nuevos dicen «falta actualizar el servidor de fotos»):**
- **PDF a la nube:** todo PDF que pasa por `fbAdjuntoGuardar` (planilla de PAT y certificado v151, remitos v137/138, PDF sueltos del legajo) y el PDF original de los planos de obra va a `docs/AAAA/MM/<obra>/<id>.pdf`; en la base solo la ficha (`adjuntos`: r2, nombre, tamaño, páginas). Tope 25 MB (antes 650 KB adentro de la base). Ver / bajar como antes (del Worker). Sin señal: queda en la bandeja del celu y se sube solo; **nunca entero a la base**.
- **Videos de obra:** la cuadrilla con «🎥 Video» en Modo obra (con la tarea y la columna de ese momento), Mis tareas clásica y la cámara de la app; la oficina en el legajo › «🎥 Videos y PDF» › «🎥 Subir video». Antes de subir, el celu lo **achica** (lado mayor 854 px ≈ 480p, ~1 Mbps + audio mono ~48 kbps, WebM; en la prueba 30 s de 1280×720 pasaron de 25 MB a 3 MB) mostrando el avance; si el aparato no puede, sube el original y avisa. Tope 2 minutos. Más de 95 MB → por partes (10 MB, se retoma si se corta). Bandeja IndexedDB `ema-archivos` con reintentos (30 s → 10 min, al volver la señal, al abrir, al volver a la app) y aviso si no hay lugar en el celu. Miniatura del primer cuadro en `fotosObra` (`tipo:"video"`, duración, peso), ficha en `adjuntos` con `r2`, y en la orden `campo.videos` (no `campo.fotos`).
- **Ver:** reproductor con la dirección del Worker (`?t=`), se puede adelantar (pedidos por rango), bajar, compartir y (la oficina) «↔ Mover» como una foto más. Legajo: sección «🎥 Videos y PDF» (la oficina sube; «solo mirar», Dirección y pañol miran). Avance nuevo (v158): la hoja de cada columna muestra sus videos y PDF como evidencia, **sin contar como foto de la columna** (la verificación v150 tampoco los cuenta).

**Pruebas:** `t_v160` PC 54/54 · celu 54/54 · `REGLAS=1` 54/54. Worker: `probar_ema_fotos.mjs` 98/98. Batería de a 3 (TZ Córdoba): 318/326 OK; fallan solo las conocidas (`t_v083` PC/celu, `t_v143` PC 77/78, `t_v147` 52/53 PC y 117/118 celu, `t_v150` PC/celu se corta por tiempo) y `t_v137` PC 61/62 (la onda del micrófono: falla igual con la v159 en esta máquina). `t_v151`, `t_v149b`, `t_v138`, `t_v152`, `t_v153`, `t_v158`, `t_v159`, `t_circuito` OK en PC y celu. Capturas en el scratchpad (`v160/capturas`).

**Huellas:** ORIGINAL `68b19096…`, index `9e3b28a9…`, sello `2026-11-15 12:08 · aafc42` (ver `herramientas/v160/huellas.txt`).

**A confirmar:** el tope de 2 min y la calidad; el tope de 25 MB por PDF; en celulares reales, la grabación desde la app de Android y el achicado en el Moto (tarda lo que dura el video, con la app abierta); el espacio gratis de R2 (10 GB) con videos.

## v159 — 15/11/2026 (publicada en GitHub 15/11) · Crear tareas nuevas con el asistente y a mano, con los puntos de la fórmula

**Pedido de Ángel** (15/11/2026): «también para crear nuevas tareas: por ahí se me van ocurriendo, se lo digo a la IA y lo tiene que calcular, y el tema de los puntos también calcularlo con la fórmula que dijimos, y que sea algo justo.»

**Base:** ORIGINAL 158 (`a58321ea…`). Parche `herramientas/v159/patch_v159.py` (reemplazos chicos + el módulo `tareaNueva2`; `--otra-base` para reaplicar). PDF y videos pasa a la **v160** (instructivo del Worker `ema-fotos` y CLAUDE.md). Sin reglas nuevas (`configEquipo/baremo` lo escribe quien edita Producción).

**La fórmula** (la del diccionario v108, la MISMA función `dif` de `diccionarioTareas`, ahora a la vista como `window.__diccDif`): D = 1 + 0,2 por cada factor (🪜 altura o barquilla · 🏋 pesado · ⚡ riesgo eléctrico · 🎯 oficio), tope 1,8, redondeado a 1 decimal; **puntos por unidad = HH × D** (redondeado a 2 decimales). Ejemplo de la prueba: «pintar las bases de las columnas, más o menos media hora por columna entre dos» → 0,5 h × 2 personas = 1 HH; sin altura, peso, riesgo ni oficio → D = 1; **1 HH × 1,00 = 1 pts por columna**; parecidas: Pintura de columna 1,2 pts/h, Sellado de base 2 pts/h, Acabado de pozo 1 pts/h → «está pareja».

**Qué cambia:**
- **Motor `__tareaNueva2`** (lo usan la pantalla y el asistente). `proponer` arma la tarea completa sin escribir nada: unidad, HH (dichas, de minutos × personas o estimadas con las parecidas y los minutos medidos v157), factores (dichos o estimados por las palabras), D, la cuenta escrita, las 3 parecidas con sus pts por hora y si es justa (más de 1,5 veces o menos de 0,67 veces → «revisá»), pasos y fotos borrador, ítem del itemizado (solo si se dice, con su parte) o `noAvanza`, qué marca en el avance nuevo (un paso de la grilla o una cosa nueva del rubro) y el rendimiento por día para la sugerida. Lo estimado va «estimado · a confirmar».
- **Crear con «Sí»** (solo quien edita Producción; no cuadrilla, operario, pañol, mirar ni Dirección): `registrarTareasNuevas` con la ficha `t159`, historial del baremo (`hist`, tipo `nueva`, con motivo), `sugerida.rend` si dio rendimiento, auditoría `tarea_nueva`. **Editar** (motivo obligatorio, antes → después en el historial; las órdenes cerradas guardan sus puntos) y **dar de baja / reactivar** (no se borra: la de baja no aparece en Llenar orden ni en la sugerida; las órdenes viejas siguen andando).
- **A mano:** Producción › «Cuánto vale cada tarea» › «＋ Crear tarea» es ahora la calculadora: HH o minutos × personas, los 4 factores con su explicación, D y los puntos que se recalculan solos, las parecidas al lado, unidad, fase, pasos, fotos, ítem y avance, puntos a mano (con el aviso de «no es justa»), motivo; «Sí, crearla» en una hoja con ✕; lista de las creadas con «✏ Editar» / «⏸ Dar de baja».
- **Dónde aparece:** Llenar orden; la orden sugerida (rendimiento de la fórmula, «quedan N de T» por el avance de la obra, Ajustes › rendimientos); Modo obra (columna por columna si se mide en columnas); el avance de obra nuevo (una cosa por columna en el rubro elegido, o el paso de la grilla); el auditor de puntos v154 dice de dónde sale el valor («tarea creada el … por … con la fórmula de siempre: 1 HH × 1,00 = 1 pts por columna…»).
- **Asistente** (dormido): `proponer_tarea_nueva` (tarjeta con la cuenta, las parecidas, pasos, fotos, ítem, avance y rendimiento; «Sí, crearla» / «Cambiar algo» / «No»; si no sabe las horas, pregunta) y `proponer_editar_tarea`; SISTEMA «TAREAS NUEVAS (v159)». Solo admin/oficina.

**Pruebas:** `t_v159` PC 48/48 · celu 48/48 · `REGLAS=1` 48/48. Batería de a 3 (TZ Córdoba): 315/323 OK; fallan solo las conocidas de la v158 (`t_v083` PC/celu, `t_v143` PC 77/78, `t_v147` 52/53 PC y 117/118 celu, `t_v150` PC/celu se corta por tiempo) más dos que fallan a veces también con la v158 y pasan repetidas solas: `t_v092u` (19/19) y `t_v146` celu (64/64). `t_v158`, `t_v157`, `t_v154`, `t_v112`, `t_v108`, `t_v108b` y `t_circuito` OK en PC y celu (ver `herramientas/v159/bateria159.txt`).

**A confirmar:** el umbral de «justa» (1,5×); cómo se eligen las parecidas; las palabras que estiman los factores y las horas estimadas; el ítem sin parte (100 %); las tareas en metros en el avance (los metros de la zanja).

**Huellas:** ORIGINAL `58b9e85d…`, index `6f311881…`, sello `2026-11-15 09:51 · 3e8de8` (ver `herramientas/v159/huellas.txt`).

## v158 — 15/11/2026 (publicada en GitHub 15/11) · Avance de obra nuevo: por rubro y por columna, se mueve solo con las órdenes

**Pedido de Ángel** (15/11/2026), de las maquetas `maq_avance`: «la A con la grilla de la C adentro. Hacelo.» · «Las tareas que no existen hay que agregarlas todas.» · «El % de la obra es el avance de la obra. Lo principal es que nosotros podamos editarlo: desde el avance de obra marcamos se hizo / no se hizo. Pero cuando se tiene que mover el avance de obra es según las órdenes de trabajo… Si puse que hoy van a ser 5 columnas y hicieron 5 columnas, se mueve… Lo mismo con las fallas.»

**Base:** ORIGINAL 157 (`49932e6a…`). Parche `herramientas/v158/patch_v158.py` (reemplazos chicos + el módulo `avanceObra2`; `--otra-base` para reaplicar). PDF y videos pasa a la **v159**. Sin reglas nuevas (`avanceObras.av2` lo escribe quien edita Avance).

**Cómo se calcula el %:** lo hecho sobre todo lo que lleva la obra, y cada cosa pesa sus horas-hombre del diccionario v108 (una columna izada 3 HH, un sellado 0,5 HH; lo que no tiene HH por unidad, una tabla propia; todo **a confirmar**). Lo que la cuadrilla mandó cuenta enseguida como «en revisión» (color claro) y pasa a «hecho» cuando la oficina cierra la orden o toca «✅ Está bien»; falla, observado o pieza que falta restan hasta que se arreglan. Es el % que muestra toda la app (Avance, legajo, Inicio, mapa, Dirección, Supervisor, informe, asistente). El del itemizado sigue en la plata (certificación, módulos K, curva S de Dirección) y aparte en «🧾 Ver itemizado» («Itemizado (lo que se cobra): N %»). Obra sin columnas ni cálculo: el del itemizado.

**Qué lleva y cómo se mueve:** las columnas (cálculo / legajo / itemizado) con sus pasos (pozo, hormigón, acabado, izaje, aplomado, vínculo, artefacto, cable de subida, tablerito, sellado, PAT al final de cada circuito) y piezas (BPN 6 gris/celeste/verde, portafusibles, fusibles, peine, Cu 4×4 + TIF, luminaria, prensacable) + civil, cableado, PAT, tablero, pruebas y cierre (los 4 papeles de la v151). Cada orden marca lo suyo por tarea (`TAREA_AV`): pasos de Modo obra y fotos con su columna; «5 columnas» sin decir cuáles → las 5 siguientes que faltan («sin columna exacta»); el cierre manda (✏ Corregir cierre baja), anular / mover foto revierten; «no se hizo» con motivo de falla («artefacto quemado») = falla; la misma columna en dos órdenes cuenta una vez. Ejemplo de la prueba: la cuadrilla manda el tablerito de la Col 3 → «en revisión» y la obra sube; la oficina cierra → «hecho»; «2 izajes» sin decir cuáles → Col 6 y 7.

**A mano** (quien edita Avance; Dirección y «solo mirar» ven sin botones; la cuadrilla no ve): hoja de la columna con «✅ Columna completa», destildar, «Se arruinó», «Observado», «No lleva», «Le falta» por pieza y «Pedir»; la grilla con «Elegir varias» («Marcar izaje en las 4», avisa fraguando / sin hormigón: «¿Lo marcaron igual?»); cosas sin columna («Guardar» cantidad); «＋ Agregar algo que lleva». Motivo obligatorio, `av2.hist` y `avanceHist` (v156), auditoría `avance_obra_marcar`. Nada se escribe solo: «💾 Guardar el avance armado» con «Sí».

**Pantalla:** «flash» (anillo, inicio / prevista / a este ritmo y cuántos días después, tira de columnas, Falta, alertas), Tiempo de la obra (línea, días trabajados, ritmo, curva real / planeada lineal / proyectada), Material para lo que falta (`__matAvance`, «Pedir»), rubros desplegables con la grilla adentro, «¿Está terminada?», «Lo último que pasó», «¿Cómo se calcula?» con la tabla de pesos. La pestaña «Por etapa» (B) quedó para después.

**Tareas nuevas (11):** acabado de pozo, fusibles/portafusibles/borneras del tablerito (por caja), cable de subida, prensacables, morsetos y terminales, conexión EPEC / medidor, inspección interna, plano conforme a obra, certificado de instalación apta, carpeta EPEC, rehacer lo que se arruinó. HH, dificultad (puntos = HH × dificultad), pasos y fotos **a confirmar**; no mueven el itemizado; salen en Llenar orden, la orden sugerida (rendimiento del diccionario) y Modo obra.

**Auditor y asistente:** el control (v156) marca si los dos % difieren 25 puntos o más, la misma columna en dos órdenes y las fallas; `avance_obra` («¿qué le falta a la Col 4?» → «1 BPN 6 verde (2010)»), `proponer_marcar_avance` (tarjeta y «Sí»; Dirección solo lee); `auditar_avance` con obra suma el avance nuevo.

**Pruebas:** `t_v158` PC 72/72 · celu 72/72 · `REGLAS=1` 72/72 (`datos158.js`). Batería completa (TZ Córdoba, domingo, de a 3): todo OK salvo las conocidas: `t_v083` (obsoleta), `t_v147` y `t_v150` PC y celu (alertas / parte de las 18 h en domingo, igual con la v156 y la v157), y `t_v143` PC y `t_v157` PC que fallaron con la máquina cargada y pasan solas (78/78 y 43/43). Capturas en `capturas/` (celu y PC). Huellas en `herramientas/v158/huellas.txt` (sello `2026-11-15 07:28 · 220edb`).

## v157 — 15/11/2026 (publicada en GitHub 15/11) · El tiempo de CADA columna (no de toda la tarea)

**Pedido de Ángel** (15/11/2026): «si yo te digo "haceme los tableritos de 3 columnas", recién cuando terminan las 3 columnas le sale el horario, y eso está mal: tiene que ser en cada columna… Si te doy 3 columnas, tendría que tener 3 horarios. Eso es para después sacar un promedio… Buscá una forma fácil y sencilla para los chicos.»

**Base:** ORIGINAL 156 (`ede2b5ee…`). Parche `herramientas/v157/patch_v157.py` (reemplazos chicos + el módulo `tiempoCol`; `--otra-base` para reaplicar). PDF y videos pasa a la **v158**.

**Qué pasaba** (reproducido con `ANTES=1` contra la v156): por **Mis tareas clásica** las fotos de cada columna no dejaban hora; la hora se pedía una sola vez, al tocar «📤 Listo, enviar esta tarea», para TODA la tarea (sin `campo.pasosObra`). Por **Modo obra** la foto tampoco dejaba hora: había que tocar «Terminé» en cada columna y el fin era la hora de ese toque, no la de la foto; con la cámara B o sacando las fotos seguidas, las columnas quedaban sin hora hasta el final.

**Qué cambió:** el fin de cada columna es la hora de su foto (si sacan varias, la última) o de «✓ Col N lista sin foto»; el inicio es cuando terminó la anterior de esa tarea (o lo último que terminó esa persona en la orden, o «Llegué»); «▶ Empecé Col N» (opcional, en Modo obra) manda. Al guardar, «✓ Col 1 lista · 42 min» con «cambiar» (− / + de 5 min). Modo obra ya no pide «Terminé» por columna: después de la última, «Así quedó cada columna» con los minutos editables y «Listo, mandar». Mis tareas clásica: «📤 Listo, enviar esta tarea» muestra cada columna y no pide horas. Hora dudosa (fotos seguidas —y la anterior también—, sin «Llegué» ni anterior, más de 5 h) marcada con el porqué, fuera del promedio. Sin señal, la hora es la del celu en la foto. Se guarda en `campo.pasosObra.<tarea>.<unidad>` (+ `iniTs/finTs/min/fuente/iniFuente/dudosa/v:157`) y `campo.horasTarea` = el rango; «Empecé» en `campo.colInicio`. Zanja/tablero/acometida: un tramo como antes. Órdenes viejas con la hora de toda la tarea: un tramo.

**La oficina:** «⏱ Tiempo de cada columna» en el «📸 Avance» y en el cierre («Col 1 · 08:10–08:52 · 42 min · Juan y Pedro», con la mediana); la verificación (v150) marca la hora dudosa. **Promedios:** 🧠 › ⏱ «Minutos por columna» (mediana, rango, mediciones, dudosas aparte, por cuadrilla y por persona); la orden sugerida usa lo medido por columna con 3 o más buenas (unidades por HH = 60 / mediana de minutos × personas). **Asistente:** `tiempos_por_unidad` («¿cuánto tardan en hacer un tablerito?», «¿quién es más rápido izando?»).

**Pruebas:** `t_v157` PC 43/43 · celu 43/43 · `REGLAS=1` 43/43 · `ANTES=1` contra la v156 4/4 (el bug) (`datos157.js`). Batería completa (320 corridas, TZ Córdoba, domingo): 312 OK; fallan `t_v083` (obsoleta), `t_v147` y `t_v150` PC y celu (lo mismo con la v156 hoy: alertas y parte de las 18 h en fin de semana) y `t_v143` PC y celu (la carrera conocida de `vehiculoPersona`; sola 78/78). `t_v142`, `t_v144`, `t_v148`, `t_v149b`, `t_v121`, `t_v123`, `t_v130`, `t_v156`, `t_circuito` OK. Huellas en `herramientas/v157/huellas.txt` (ORIGINAL `49932e6a…`, sello `2026-11-15 00:02 · 751ef0`). Sin reglas nuevas (todo en `campo`), sin Worker nuevo, sin APK nuevo. **Ángel:** subir `index.html` (cuando se publique).

## v156 — 15/11/2026 (publicada en GitHub 15/11) · Auditor del avance de obra: el asistente y una hoja sin IA controlan el avance con exactitud + 2 arreglos de la v155

**Pedido de Ángel** (14/11/2026): «Necesito que la IA analice el avance de obra muy bien, muy detalladamente: si pasó algo mal, algo bien, con todas las tareas que se hicieron, más allá de que ya es automático. Necesito que tenga un control muy exacto de eso.» Mismo espíritu que el auditor de puntos (v154). Lo de PDF y videos (Worker `ema-fotos` `v2-fotos`) pasa a ser la **v157** (instructivo y comentario del Worker renombrados).

**Base:** ORIGINAL 155 (`73e57dac…`). Parche `herramientas/v156/patch_v156.py` (reemplazos chicos + el módulo `auditorAvance`; `--otra-base` para reaplicar).

**1. Explicar cada número** (`__auditAvance`, todo de memoria): cada ítem del itemizado con contratado, hecho y de dónde sale cada unidad: cada cierre de orden (fecha, OT, tarea y su parte del ítem por partes: «cada unidad de la tarea suma el 25 % del ítem»), correcciones con «✏ Corregir cierre» (quién, cuándo, motivo), revertidos al anular (no cuentan), lo cargado a mano en Avance de obra (quién, cuándo, motivo; lo viejo: «a mano, sin fecha, sin motivo anotado»), ajustes del conforme a obra y lo certificado (foto fija). La suma cuadra con el ítem o dice «NO CUADRA, faltan N». Etapas (solas o a mano), % de siempre, módulos K, la planilla de columnas (v150) contra el itemizado. Ejemplo de la prueba: «Ítem 5 (Columna PRFV 7 m…): contratado 2, hecho 1 (50 %). De dónde sale: OT-2026-201 (Excavación; 12 % del ítem): +0,24; OT-2026-201 (Hormigonado; 13 %): +0,26; OT-2026-202 (Montaje PRFV; 25 %): +0,5. Suma: 0,24 + 0,26 + 0,5 = 1 ✓ cuadra».

**2. Revisar (sin IA):** ítem que no cuadra con sus fuentes, hechas de más, orden cerrada que no movió el avance (y cuánto debía sumar) o que lo movió dos veces, lo mandado por la cuadrilla sin cerrar, a mano sin respaldo y sin fecha (no entra en la certificación), la misma columna en dos órdenes, orden de obra imposible (izaje sin hormigonado, vínculo sin izaje, luminaria sin vínculo, cable sin zanja) y poco fraguado («a revisar»), cálculo ≠ itemizado (también las columnas de 10 m contra el ítem 8/4) y cálculo viejo no pasado, material contra avance, mes certificado cerrado ≠ hoy, provisiones mezcladas, 100 % sin documentación o con columnas sin foto, ritmo raro / obra parada. Cada hallazgo con su propuesta.

**3. El porqué y los cambios con «Sí»:** cambiar lo hecho a mano en Avance de obra pide motivo (`avanceObras.avanceHist[]`); notas del porqué (`avanceNotas[]`): el control las usa y deja de marcar ese número; corregir un ítem, corregir el cierre (v153), pasar el cálculo (v102), varias juntas en una tarjeta con casillas. Auditoría `avance_auditoria`. Sin reglas nuevas.

**4. Pantallas:** hoja «🔎 Control del avance» (por obra o todas, ítem por ítem desplegable con sus órdenes, planilla, hallazgos con su botón, «✨ Que lo analice el asistente»); accesos en Avance de obra (arriba y en cada obra), el legajo, el Supervisor («Avance: N cosas para revisar»), el Inicio Ejecutivo (Para atender, lo rojo) y el Inicio de Dirección (solo mirar). Parte del avance al final del día (18 h, sin IA, solo si hay rojos nuevos) a Administración.

**5. Asistente:** `auditar_avance` (obra, obra + ítem, período, todas; paginado), `proponer_nota_avance`, `proponer_correcciones_avance`; SISTEMA «SÍ PODÉS AUDITAR EL AVANCE… nunca inventes el porqué de un número cargado a mano»; «revisá el avance de todas las obras» con el modelo del supervisor y effort high; la revisión de las 12/18 h suma lo rojo del avance. Admin/oficina (con cambios), Dirección (solo lectura); cuadrilla, pañol y mirar no.

**6. Arreglos de la v155 (por las capturas):** el Inicio de Dirección ya no muestra «+999 d» ni «terminamos el 01/02/2035, 2890 días después»: con pocos días de avance dice «todavía no hay ritmo suficiente para estimar» y si a ese ritmo no se llega ni en el doble del plazo, «Muy atrasado: al ritmo de los últimos 7 días no se llega» (KPI «No llega»). «📨 Para resolver»: «La app le explicaba» es la cuenta de la TAREA reclamada (si no se sabe, la orden completa, aclarado) y el cartel del análisis queda pegado al reclamo.

**Pruebas:** `t_v156` PC 69/69 · celu 71/71 · `REGLAS=1` 69/69 (`datos156.js`); `t_v155` con el arreglo del reclamo 85/85 · 86/86; batería completa (TZ=UTC) 311 de 318 OK: fallan `t_v083` (obsoleta), `t_v147` y `t_v150` (igual que con la v155) y `t_v143` PC una vez (carrera conocida; sola 78/78). Huellas en `herramientas/v156/huellas.txt` (ORIGINAL `ede2b5ee…`, sello `2026-11-14 22:15 · 94054e`). **Ángel:** subir `index.html`. Sin reglas nuevas, sin Worker nuevo, sin APK nuevo.

## v155 — 14/11/2026 (publicada en GitHub 15/11) · Rol «Dirección» con su Inicio + «📨 Para resolver» (la cuadrilla le avisa a la oficina) + 2 detalles de la v154

**Pedido de Ángel** (14/11/2026), después de ver las maquetas: «Hagamos A en el celu y C en la compu. Y sumar lo de la B, calendarios»; la foto del día de cada obra y el pronóstico del clima contra lo planeado (sin «riesgo de multas»). Rol «Dirección»: «pueden mirar todo, consultar todo, pero no pueden cambiar nada»; «esa pantalla también mostrarla en oficina». Y: «los de cuadrilla, si quieren avisar algo, pueden avisarle a la IA y que la IA me avise a mí. Que me llegue con un mensaje o algo. O cosas que resolver.»

**Base:** ORIGINAL 154 (`18620bf9…`). Parche `herramientas/v155/patch_v155.py` (reemplazos chicos + los módulos `inicioDir` y `paraResolver`; `--otra-base` para reaplicar).

**1. Rol `direccion`:** todas las hojas en «ver» (también gastos y producción), Mi tablero y Mis tareas ocultos, nada que escriba (las `fb*` cortan; las reglas v155 niegan; `fbSaludGuardar` no escribe). Carga completa de datos, barra de abajo Inicio · Obras · Mapa · Informes · Perfil, ve la certificación y el personal en vivo. Usuarios ofrece el rol.

**2. Inicio de Dirección (`#iniDir`)**, A en el celu y C en la compu, todo de memoria: número del día (K de hoy contra el ritmo que hace falta) y ayer; necesita tu atención (máx. 3); barras de 14 días con lo mandado sin cerrar aparte; curva S (plan lineal a confirmar, proyección «a este ritmo terminamos el dd/mm»); qué se hizo hoy/ayer por obra con la **foto del día** (UNA consulta `fotosObra` de hoy cada 15 min); dónde se trabaja hoy (mapa chico); equipo; **clima contra lo planeado** (Open-Meteo, 3 h guardado, avisa lluvia/viento sobre hormigonado, zanja, cruce o izaje de las órdenes y la sugerida); **programación** con semáforo (compu), pistas y **calendario de terminaciones**; plata sin IVA (certificado, margen, material entregado contra usado); asistente con 4 chips. Administración y Oficina la abren como «📊 Dirección» (Inicio Ejecutivo, menú, Tablero del dueño). La **fecha del acta de inicio** y el plazo se cargan en «Nuestra zona» (Administración); sin eso, «estimada» con la primera orden de la zona.

**3. «📨 Para resolver»:** la cuadrilla (y el pañol y «solo mirar») le dice al asistente «avisale a Ángel que…» → tarjeta «📨 Le mando esto a Ángel» → «Sí, mandalo» (también escrito o por voz) → colección `avisosCuadrilla` + push a Administración y al supervisor de su orden (⚙ del asistente: admin / admin+oficina / admin+supervisor). Bandeja con visto / resuelto y respuesta que le llega a la persona; en el Inicio Ejecutivo, el menú y el Supervisor (seguridad/urgente en rojo). Tope 10 por persona y día (a confirmar).

**3b. Reclamo de puntos** («che, me faltó sumar puntos acá… yo te digo si autorizar o no, o hagamos un análisis si es verdad o no»): tipo `puntos` en `avisar_oficina` (el asistente primero le explica lo suyo con `explicar_puntos` y le ofrece mandarlo). Guarda la orden, la tarea, cuántos y la foto fija de la explicación de la app. En «Para resolver»: «🔎 Analizar» (sin IA: la verificación v150 contra el cierre, si la foto / «se hizo» es suyo → «Parece que tiene razón / No parece / No se puede saber» con el porqué y la corrección), «✨ Que lo analice el asistente», «✅ Autorizar» (con «✏ Corregir cierre», antes → después y «Sí»: aviso «⭐ Puntos corregidos» y respuesta) y «✕ No corresponde» (motivo obligatorio, le llega a la persona). Todo registrado (estado, quién, cuándo, motivo, análisis, nota en el historial de puntos de la orden, auditoría `puntos_reclamo`).

**4. Asistente:** Dirección pregunta todo como la oficina (plata, puntos, certificación, `como_vamos`) sin ninguna `proponer_*`; para un cambio, `anotar_para_oficina`. Cuadrilla/pañol/mirar: `avisar_oficina` y `mis_avisos`; admin/oficina/dirección: `avisos_cuadrilla`. **Worker `ema-ia` v5-ia** con el rol (`workers/ema-ia.js`, `probar_ema_ia.mjs` 110/110).

**5. Detalles de la v154:** el período elegido en «🔎 Puntos» se ve marcado; los avisos de la tarjeta dicen «Si lo que cambia es lo hecho, usá ✏ Corregir cierre» (sin nombres de herramientas).

**Reglas nuevas:** `firebase/Reglas_Firestore_v155.txt` (Dirección lee todo y no escribe; `avisosCuadrilla`). **Ángel:** subir `index.html`, publicar las reglas v155, pegar el Worker `ema-ia` v5-ia. Sin APK nuevo. PDF y videos pasan a la v156.

## v154 — 13/11/2026 (publicada en GitHub 14/11) · Auditor de puntos: el asistente explica, revisa, anota el porqué y corrige TODOS los puntos

**Pedido de Ángel** (13/11/2026), después de ver la v153: «cualquier pregunta de los puntos se la tengo que poder hacer a la IA… me tiene que decir exactamente por qué se le dio ese punto, si es válido ese punto, si yo esa vez le dije "démosle un poquito más"… detectar, mover, cambiar, todo con la autorización de nosotros (la oficina y yo)». Lo de PDF y videos (Worker `ema-fotos` `v2-fotos`) pasa a ser la **v155** (instructivo y comentario del Worker renombrados).

**Base:** ORIGINAL 153 (`6402b904…`). Parche con reemplazos chicos + el módulo `auditorPuntos` antes de `revisarAppDiag` (`--otra-base` para reaplicar).

**1. Explicar cada punto** (`__auditPuntos.explicarOrden` / `explicarPersona`, herramienta `explicar_puntos`): la misma cuenta de `puntosDeOrden`, paso a paso: cantidad × valor de la tarea, de dónde sale el valor (fábrica/diccionario, editado en Producción, puesto a mano en la orden, baremo cambiado después del cierre), la regla de reparto (asignada, repartida por lo hecho, «Elegir quiénes», equipos, a mano por tarea o de toda la orden, rol × horas con el peso y las horas), la parte de cada uno, el historial con quién, cuándo y el **motivo** (o «sin motivo anotado»), criterios anotados, piso/reinicios, quincena cerrada (foto fija) y ajustes. El total por persona es el mismo que muestra Producción (si no cuadra, lo dice). Ejemplo de la prueba: Juan Pérez, 1ª quincena de noviembre = OT-160 8 + OT-161 10,1 + OT-162 7 = **25,1** (Producción dice 25,1); «Pablo 9,25 en la OT-177» = «Colocación de apoyo PRFV: 1 apoyo × 18,5 = 18,5; repartida entre Pablo y Ariel con la cuenta de siempre (rol × horas): 9,25 de 18,5, en «✏ Corregir cierre» de Lucía, motivo «El apoyo lo colocaron Pablo y Ariel…»». La cuadrilla también puede preguntar, pero solo por lo suyo (sin nombres de los demás ni plata).

**2. Revisar si están bien** (`revisar`, `revisar_puntos`, sin IA): reparto que no suma, puntos a quien no está o tiene 0 h, «no se hizo» con puntos, la cuadrilla contra el cierre (v150), la misma columna cobrada en dos órdenes, puntos a mano sin motivo, valor distinto del baremo sin explicación, diferencia con la foto fija de una quincena cerrada, cerrada sin puntos y puntos por hora fuera de lo común («para mirar»). Cada hallazgo con la orden, la explicación y una propuesta. Línea en el Supervisor y hoja «🔎 Puntos» (Revisión · Por persona · Criterios) desde Producción › Por quincena.

**3. El porqué queda:** motivo obligatorio en «⭐ Puntos», en los puntos a mano del cierre (y el historial ya no se pierde al volver a cerrar), en «Cuánto vale cada tarea» (`configEquipo/baremo.hist[]`) y en «✏ Corregir cierre»; notas y criterios (`proponer_nota_puntos` → `cierre.puntosHist` tipo `nota` y/o `configEquipo/baremo.criterios[]`), que el asistente lee siempre.

**4. Cambiar con «Sí»** (tarjeta antes → después, motivo, auditoría, aviso «⭐ Puntos corregidos»): `proponer_puntos_persona` (mover puntos dentro de una orden; la suma tiene que dar el total), `proponer_valor_tarea` (solo hacia adelante: las cerradas no cambian, y lo dice), `proponer_corregir_cierre` (v153) y `proponer_correcciones_puntos` (varias juntas en UNA tarjeta con casillas, incluido «mover» lo hecho de una orden cerrada a otra con el motor de la v153; las fotos van aparte con «↔ Mover»). Quincena cerrada: la foto fija no se toca y la diferencia va como ajuste.

**Permisos:** solo Administración y Oficina (`TOOLS_ROL` y el motor); la cuadrilla solo `explicar_puntos` de lo suyo; pañol y «solo mirar» nada. **Sin reglas nuevas** (probado con `REGLAS=1`). **Sin APK nuevo.** **Ángel:** subir `index.html`.

**Pruebas:** `t_v154` PC 81/81 · celu 84/84 · con las reglas reales (`REGLAS=1`) 81/81. Batería completa de a 3 (TZ de Córdoba, 314 corridas): todo OK salvo `t_v083` (reemplazada) y `t_v143` PC y celu 65/78 (igual que con la v153: mañana es sábado); `t_v137` PC 61/62 en la batería (la onda de rayitas, tiempos) y 62/62 sola. `t_v153`, `t_v127`, `t_v128*`, `t_v150`, `t_v141` y `t_circuito` OK en PC y celu. Capturas en el scratchpad (`v154/capturas/`).

**A confirmar:** umbral de «puntos por hora» (2× o la mitad del promedio, con 3 órdenes o más); la misma columna en dos órdenes solo ve lo que tiene detalle por columna; los pesos de los roles y el valor del punto todavía no piden motivo; la cuadrilla no ve el motivo que escribió la oficina.

**Huellas (SHA-256):** ORIGINAL `154_2026-11-13_app-EMA_ORIGINAL.html` `18620bf916b95cbb14d78b9dab4b8ed3911f042e37eaa24ce6d8b03721d814c2` · `index.html` `4c3ad0c38bf4f57239b1e0a8b8990da1bd00cbfc106344266ab1b45a10d46a40` · sello `2026-11-13 18:53 · c57e6a` (meta `ema-version` y `#appVersion`).

## v153 — 13/11/2026 (publicada en GitHub 14/11) · ✏ Corregir el cierre de una orden YA CERRADA (a mano y con el asistente)

**Pedido de Ángel** (13/11/2026): el asistente le contestó «No te lo pude dejar armado: la OT-2026-177 ya está cerrada y desde acá no tengo cómo corregir el cierre de una orden cerrada…» (el apoyo PRFV del tablero de 0 a 1 hecho por Pablo Picone y Ariel Lastra, 9,25 c/u; Marcos y Bruno siguen con 4,8 por la acometida; el armado del tablero con fotos de Marcos pero «no se hizo» en el cierre). Ángel: **«NECESITO QUE LA IA PUEDA HACER ESAS MODIFICACIONES»**.

**Base:** ORIGINAL 152 (`09315cf5…`). Parche con reemplazos chicos + el módulo `corregirCierre` antes de `revisarAppDiag` (`--otra-base` para reaplicar).

**Por qué el asistente «no podía»** (reproducido con el Worker simulado contra la v152, `t_v153` grupo 0 con `ANTES=1`): no había ninguna herramienta para tocar el cierre; `proponer_editar_orden` sobre una orden cerrada solo cambiaba la orden y avisaba «sus puntos quedaron fijados con los datos de antes». A mano, «⭐ Puntos» solo cambiaba el valor de las tareas que ya tenían cantidad y «Abrir el cierre» rehacía todo el cierre.

**1. Un solo motor (`__corregirCierre`)**, para la pantalla y el asistente, sobre una orden cerrada y por tarea: la cantidad hecha (0 → 1, «no se hizo» → hecha o al revés), quiénes la hicieron (de la orden o de la nómina: se suman a la orden como «＋ Agregar a alguien que también fue») y los puntos de esa tarea por persona (de entrada la cuenta de siempre, rol × horas; o a mano). A cada uno se le saca lo que tenía por esa tarea y se le suma lo nuevo; **lo de las otras tareas no se toca** (aunque se hayan corregido a mano con «⭐ Puntos»). Guarda la foto fija de puntos, `puntosTarea`, cantidades, `hechoPersona` y el historial (`puntosHist`: antes → después, quién, motivo, por el asistente o no). **Avance de la obra:** lo que sube sale de la misma cuenta del cierre (por partes, v108) y lo que baja se descuenta de lo que había sumado esa tarea: nunca dos veces (0 → 1 → 0 deja el itemizado como estaba). **Quincena cerrada:** no se toca; la diferencia ya pasa sola como ajuste a la quincena abierta (Producción › Quincenas) y la app lo avisa. **Conforme a obra cerrado:** aviso. Aviso «⭐ Puntos corregidos» al celu de los que cambian. Auditoría `ot_cierre_corregido`.

**2. A mano:** «✏ Corregir cierre» al lado de «⭐ Puntos» en las órdenes cerradas del tablero y del Historial, y en «⭐ Puntos» › «📋 La orden» → hoja con cada tarea (lo del cierre y lo que mandó la cuadrilla), cantidad, «¿Se hizo?», quiénes (chips + «＋ Otra persona de la nómina»), puntos por persona, motivo obligatorio, antes → después de los puntos de cada uno, el total y el avance, «Sí, corregir» y «↶ Deshacer».

**3. Con el asistente:** `proponer_corregir_cierre(otId, cambios, motivo)` → tarjeta antes → después (puntos por persona, total, avance) → «Sí». Usa la verificación v150: si en otra tarea lo que mandó la cuadrilla no coincide con el cierre (el tablero de Marcos: fotos pero «no se hizo»), la tarjeta lo muestra y el asistente pregunta antes de incluirlo. `proponer_editar_orden` sobre una cerrada (cantidades o quién) deriva acá. El system le dice que SÍ puede corregir cierres. Solo Administración y Oficina.

**El caso OT-2026-177:** apoyo 0 → 1 por Pablo y Ariel = 18,5 puntos (lo que vale «Colocación de apoyo PRFV para el tablero» en el baremo de Ángel) → **9,25 cada uno** (los dos Oficiales con sus horas); Marcos y Bruno siguen con 4,8; total 9,6 → 28,1. El ítem 13 sube **0,7** y no 1: el apoyo es el 70 % del ítem 13 (el otro 30 % es el pozo del apoyo, cierre por partes v108).

**Permisos:** sin reglas nuevas (lo mismo que «⭐ Puntos» y el cierre; probado con las reglas reales). Cuadrilla, pañol y «solo mirar» no ven el botón, el motor no los deja y el asistente no les da la herramienta. **Sin APK nuevo.** **Ángel:** subir `index.html`.

**Pruebas:** `t_v153` PC 53/53 · celu 55/55 · con las reglas reales (`REGLAS=1`) 53/53; el bug antes (v152: 2/2 reproducido). Batería completa de a 3 (TZ de Córdoba): 5917 de 5946 pruebas; fallan `t_v083` (reemplazada), `t_v143` PC y celu 65/78 (igual que con la v152: mañana es sábado), y por tiempos con la máquina cargada `t_v092u` PC 17/19 y `t_v146` PC 63/64 (solas: 19/19 y 64/64). `t_v127` 11/11 · 12/12, `t_v128` (a–d) OK, `t_v146` celu 64/64, `t_v150` 60/60 · 60/60, `t_v152` 73/73 · 73/73, `t_circuito` 16/16 · 16/16, `t_v137` 62/62 · 63/63. Capturas PC y celu.

**A confirmar:** con 0 horas cargadas en el cierre, quien la hizo cuenta la jornada para repartir; los ajustes de quincenas cerradas los hace Quincenas solo desde el piso de puntos (01/11/2026); si al corregir una orden de antes de la v108 (sin la tarea anotada en el avance) baja la cantidad, solo se descuenta si ningún otro trabajo de la orden usa ese ítem; el cierre rápido del asistente (`proponer_cierre`) sigue siendo para órdenes abiertas.

**Huellas (SHA-256):** ORIGINAL `153_2026-11-13_app-EMA_ORIGINAL.html` `6402b904e8fa72f0081ac028421540126f37259d9be73673d6f2dc02ab31b7eb` · `index.html` `531ca9042aee4dde5afb93dd1de8eafa4eb01b507bb83013db037214b5d7084e` · sello `2026-11-13 16:45 · f828be` (meta `ema-version` y `#appVersion`). Detalle en `herramientas/v153/huellas.txt`.

## v152 — 13/11/2026 (publicada en GitHub 14/11) · ↔ Mover fotos: a mano y con el asistente

**Pedido de Ángel** (13/11/2026): «la IA de la app no puede mover imágenes de una carpeta a otra; tiene que poder, y también agregá para que en la app se pueda hacer manual y con la IA». Son las 4: de una obra a otra, de columna o tipo dentro de la misma obra (Col 4 → Col 5, Zanja → Tablero), desde «Fotos sin obra» a una obra y de una orden a otra.

**Base:** ORIGINAL 151 (`4d151413…`). Parche con reemplazos chicos + el módulo `moverFoto` antes de `revisarAppDiag` (`--otra-base` para reaplicar).

**Por qué el asistente «no podía»** (reproducido con el Worker simulado contra la v151, `t_v152` grupo 0 con `ANTES=1`):
- `proponer_mover_fotos` solo aceptaba los id que devolvía `ubicar_fotos` (la búsqueda por GPS). `ver_fotos` no devolvía el id de cada foto → «Hay fotos que no conozco: usá primero ubicar_fotos». No había forma de buscar «la de las 10:30» o «las 3 últimas de Juan».
- Solo cambiaba de obra: no había destino por columna/tipo ni por orden («esta foto es de la Col 6» → error).
- Cuando movía, no tocaba la orden: la foto seguía en `campo.fotos` de la orden de origen (seguía contando ahí para la verificación v150 y aparecía en el legajo de la obra vieja). El «Mover a X» del Supervisor (v144) tenía el mismo problema.

**1. Un solo motor (`__moverFoto.mover`)**: cambia todo lo que dice dónde está la foto, por los caminos de la app: la ficha `fotosObra` y el adjunto (obra, orden, tipo, columna, tarea + `movidaDe` y `movidaHist`, el historial no se pierde); la orden de origen (la foto sale de `campo.fotos`, queda `campo.fotosMovidas` con a dónde fue) y la de destino (entra con su tarea, columna y miniatura de 72 px); dentro de la misma orden cambia columna/tipo/tarea (y el «Terminé» de Modo obra que solo tenía esa foto pasa a la columna nueva). La imagen no se mueve ni se copia. Auditoría `foto_mover`. Después se refrescan el legajo, la galería, Mis tareas, la verificación v150 y la planilla de columnas. El Supervisor usa el mismo motor.

**2. A mano:** «↔ Mover» en el visor de fotos y en la selección de varias (legajo —también «☑ Elegir fotos»—, Mis fotos, Mis tareas…) → hoja «¿A dónde la pasás?»: obra (buscador), orden de esa obra (propone la del día en la que estaba quien sacó la foto), de qué es, columna (de la lista de la obra u «Otro…»), tarea, motivo (obligatorio si cambia de obra), antes → después y «Sí, mover». «📷 Fotos sin obra»: «☑ Elegir para asignar a una obra». Modo obra: «↔ Era de otra columna» en la foto guardada.

**3. Con el asistente:** `buscar_fotos` (por obra, orden, día, persona, columna, tipo, hora ± 20 min, «Fotos sin obra», las N últimas; con miniaturas si hace falta) y `proponer_mover_fotos` nueva con los 4 destinos → tarjeta con miniaturas y antes → después → «Sí» (`porAsistente`). `ver_fotos` devuelve el id. El system le dice que SÍ puede mover fotos. Solo Administración y Oficina.

**Permisos (sin reglas nuevas):** quien edita Avance o Registrar obra mueve cualquier foto (si toca una orden, también tiene que editar Órdenes); la cuadrilla solo corrige la columna/tipo de SUS fotos en SU orden abierta (la base no la deja tocar la ficha: el legajo la muestra con lo que dice la orden); «solo mirar» y pañol, nada. **Sin APK nuevo.** **Ángel:** subir `index.html`.

**Pruebas:** `t_v152` PC 73/73 · celu 73/73 · con las reglas reales (`REGLAS=1`) 73/73: el bug antes (v151: 4/4 reproducido) y después; una foto desde el visor del legajo (Col 5 → Col 6: orden, ficha, adjunto, verificación 2 → 3 columnas con detalle, planilla, legajo, auditoría); tipo Zanja → Tablero → Caja con historial; varias desde «☑ Elegir fotos» a otra obra y otra orden (sale de la OT-120, entra en la OT-121 con su tarea; motivo obligatorio); «Fotos sin obra» → BULEVARES; orden → orden (OT-122 → OT-130); cuadrilla (solo su foto de su orden abierta, solo columna, no otra obra, no orden cerrada; «Era de otra columna»); «solo mirar» nada; el asistente con las 4 frases (buscar → tarjeta → Sí → movida, auditoría con porAsistente) y el pañol sin las herramientas. Batería completa de a 3 (TZ de Córdoba): 305 de 310 OK; fallan `t_v083` (reemplazada), `t_v143` PC y celu 65/78 (igual que con la v151: mañana es sábado) y `t_v137` PC 61/62 (la onda del micrófono, por tiempos: falla igual con la v151 corrida ahora). `t_v133` 30/30 · 32/32, `t_v144` 43/43 · 43/43, `t_v150` 60/60 · 60/60, `t_v151` 47/47 · 47/47, `t_v149b` 37/37 · 37/37, `t_circuito` 16/16 · 16/16. Capturas PC y celu.

**A confirmar:** que la cuadrilla no pueda pasar una foto a otra obra/orden (las reglas no la dejan tocar la ficha; habría que publicar reglas nuevas); la orden que se propone al cambiar de obra (la del día de la foto donde estaba quien la sacó); que al pasar una foto de columna también se pase el «Terminé» de Modo obra si era la única foto de esa columna; una foto que todavía se está subiendo desde el celu no se puede mover hasta que llega.

**Huellas (SHA-256):** ORIGINAL `152_2026-11-13_app-EMA_ORIGINAL.html` `09315cf5fee71cc173f40020da8e9bc15b6c9454f8ce2d55bff5f190bf7bb0f0` · `index.html` `5bb716643b81ca8fbc6e95a33132dd6af24ffd3fb9e7ec6339f848807ff2b6d8` · sello `2026-11-13 15:16 · 3bb581` (meta `ema-version` y `#appVersion`). Detalle en `herramientas/v152/huellas.txt`.

## v151 — 13/11/2026 (publicada en GitHub) · «📄 Falta documentación» y «✅ Terminadas» en Avance de obra y en Obras + ficha «📄 Documentación» del legajo

**Pedido de Ángel** (13/11/2026): «el tablero de avance de obras y el de obras y legajos: tendríamos que agregar dos subíndices, uno de "le falta documentación" y otro de las que ya están terminadas». Respuestas: documentación completa = las 4 (carpeta EPEC con fecha, conforme a obra cerrado, planilla de PAT y certificado de instalación apta); terminada = avance del itemizado al 100 %, sola.

**Base:** ORIGINAL 150 (publicada, `b9cadafd…`). Parche con reemplazos chicos + un módulo nuevo antes de `revisarAppDiag` (`--otra-base` para reaplicar).

**1. Subíndices nuevos**
- **Avance de obra:** debajo de Todas/Plazas/Barrios/Otras, «📊 Avance · 📄 Falta documentación (N) · ✅ Terminadas (N)», con el mismo estilo; respetan el filtro de tipo. «📊 Avance» deja todo como antes.
- **Obras (legajos):** «🚧 En curso · 📄 Falta documentación (N) · ✅ Terminadas (N) · 🗄 Archivadas». La pestaña que antes se llamaba «✅ Terminadas» eran las obras **ocultadas** en Registrar obra: ahora se llama «🗄 Archivadas» (es lo mismo, cambia solo el nombre) para no confundirla con las terminadas al 100 %. Respetan el filtro de tipo y el buscador.
- **Falta documentación:** obras terminadas o con avance ≥ 1 % (a confirmar) a las que les falta algo; cada una con chips de lo que falta («📁 Carpeta EPEC · 📋 Conforme a obra · ⚡ PAT · 📜 Certificado») y botón «📄 Documentación».
- **Terminadas:** avance al 100 % (la misma cuenta del círculo de cada obra), con la fecha en que llegó al 100 % (el último cierre de orden que movió el avance; si se cargó a mano, «sin dato») y «✅ Documentación completa» o «⚠ Falta: …».
- Entran también las obras archivadas (ocultas), marcadas «🗄 archivada», así una plaza ocultada sin papeles no se escapa.

**2. Ficha «📄 Documentación» en el legajo** (plegable, antes de las fotos): las 4 filas con ✅/❌.
- Carpeta EPEC: la fecha; si falta, «📁 Cargar la fecha» lleva a Registrar obra con la obra para editar.
- Conforme a obra: si está cerrado y cuándo; si no, «📊 Ir a Avance de obra».
- Planilla de PAT y Certificado: «📎 Cargar» (foto → nube de fotos R2 como las de obra; PDF hasta 650 KB como los remitos) o «✔ Lo tengo en papel» con fecha y dónde está; después «👁 Ver» y «↺ Reemplazar» (el anterior queda en «Antes (N)», nada se borra), quién y cuándo. Se guarda en `avanceObras/{id}.documentos.{pat, cert}`; auditoría `obra_documento`.
- Los botones de cargar solo los ve quien edita Avance de obra o Registrar obra (no la cuadrilla ni «solo mirar»).

**Sin reglas nuevas** (probado con la réplica de las reglas). **Sin APK nuevo.** Todo de memoria: sin lecturas nuevas. **Ángel:** subir `index.html`.

**Pruebas:** `t_v151` PC 47/47 · celu 47/47 (y con `REGLAS=1`): cuentas (100 % completa, 100 % sin PAT ni certificado, en curso sin carpeta, sin empezar fuera), subíndices y contadores, chips, fecha del 100 %, filtro por tipo y buscador, «📄 Documentación» abre la ficha, PAT con foto a R2 (sin la imagen en la base), certificado en papel, reemplazar con historial, PDF chico sí / grande no, ver la foto, carpeta → Registrar obra, permisos (mirar y cuadrilla sin botones), apagado igual que antes. Batería completa de a 3 (`TZ` de Córdoba): 304 de 308 OK; fallan solo `t_v083` (reemplazada) y `t_v143` en PC y celu (65/78), que falla **igual con la v150 publicada**: mañana es sábado y la orden sugerida usa el horario del sábado (la prueba supone un día hábil). `t_v150` 60/60 y 60/60, `t_v149b` 37/37 y 37/37, `t_circuito` 16/16 y 16/16, `t_v100` 20/20 y 22/22.

**A confirmar:** desde qué % se reclama la documentación (1 %); el nombre «🗄 Archivadas» para las ocultadas; la fecha del 100 % cuando el avance se cargó a mano; el legajo impreso todavía no muestra la documentación.

**Huellas (SHA-256):** ORIGINAL `151_2026-11-13_app-EMA_ORIGINAL.html` `4d15141368029393109c0c96fda5369df3ae9d1525ce7cda9c5d46b124ac88c5` · `index.html` `b95f6dd30ed9dbadcd4a92466d7ddf5b36a16c18502dde0c20299bad972b61ac` · sello `2026-11-13 13:36 · c4f931` (meta `ema-version` y `#appVersion`). Detalle en `herramientas/v151/huellas.txt`.

## v150 — 12/11/2026 (publicada en GitHub) · «Lo hecho, verificado»: la app sabe qué se hizo en cada columna y avisa antes de repetirlo

**Pedido de Ángel** (12/11/2026): «yo hoy doy una OT, los chicos la hacen; por ahí son tres columnas y hacen dos. La IA lo ve, me dice "está bien, esta tarea está cumplida (2 de 3)". Y si mañana hago otra orden de la misma obra me tiene que decir "eso ya se hizo", que ya lo haya verificado. Y hoy puse una tarea en una plaza que ya la habían hecho ayer: si lo hubiera verificado, me lo hubiera dicho». Agregado: «si podés aportar y mejorar lo que busco, mejor».

**Base:** ORIGINAL 149b (publicada, `91285a26…`); armada primero sobre la 149 y reaplicada sobre la 149b con el mismo parche. El parche son reemplazos chicos + un módulo nuevo antes de `revisarAppDiag`: se reaplica sobre otra base (por ejemplo la v149b) con `--otra-base`.

**Por qué pasaba:** «Quedan N de T» descontaba lo **cerrado** por la oficina y lo asignado en órdenes abiertas, pero no lo que la cuadrilla **ya hizo y mandó** sin cerrar, ni sabía **qué columna** se hizo. El aviso de «tarea sin cerrar» (v128) no decía si en esa orden se hizo o no.

**1. Lo hecho por obra, tarea y columna (de memoria, sin lecturas nuevas, no escribe nada)**
- Por cada columna/caja: **hecho y verificado** (orden cerrada o «✅ Está bien»), **hecho sin verificar** (lo que mandó la cuadrilla: pasos de Modo obra con la hora, fotos con su columna, marcas y «se hizo»), **no se hizo** (con el porqué) y **asignado** (orden abierta), con fecha, OT y quién. Sin pasos ni fotos por columna dice «hecho según la cuadrilla, sin detalle por columna».

**2. La verificación de la orden (sin IA)**
- Por tarea: «pedidas 3 · hechas 2 (Col 4 y Col 5, con foto y hora) · no se hizo Col 6: «faltó material»» → ✅ cumplida / 🟡 parcial (2 de 3) / 🔴 sin hacer / ⚠ dudosa (dijo que sí sin foto, foto sacada a más de 150 m de la obra o con GPS impreciso, hora rara, menos fotos que columnas, sin detalle por columna).
- En el tablero de Órdenes (Para revisar y cerrar, Hoy, Sin cerrar), en el «📸 Avance», en el cierre (**precarga las cantidades con lo verificado** y muestra la línea «🔎 Lo verificado») y como hallazgo del Supervisor.
- Botones «✅ Está bien» (guarda `campo.verificado {ok, por, ts, resultado}`, sin reglas nuevas), «Cerrar con esto» y «✨ Que lo revise el asistente» (mira la verificación con la herramienta nueva `verificar_orden` y las miniaturas con `ver_fotos`; solo propone). El cierre por voz recibe la verificación y avisa si lo dicho supera lo que mandó la cuadrilla.

**3. Avisar antes de repetir**
- **Llenar orden:** al lado de «Quedan N de T», por tarea: «⏳ Mandado sin cerrar: Col 4 y Col 5 ayer (OT-2026-120, Juan, con foto y hora)», «⚠ Ya hecho: …», «✕ Col 6 no se hizo», «📅 Ya asignado hoy en OT-…» y «Falta de verdad: 1 (Col 6)».
- **Al emitir**, si se pide más de lo que falta de verdad: «Esto ya está hecho en 2 de 3 (Col 4 y Col 5)» con **Cancelar / Dejar solo Col 6 / Emitir igual** (antes que el «¿por qué asignás de más?» de siempre; va en el botón «Emitir», así la sugerida y el asistente emiten como antes).
- **Quedan / orden sugerida / pase a mañana:** lo mandado sin cerrar ya no cuenta como «asignado» sino como hecho, y lo que «no se hizo» vuelve a «queda»: la sugerida sugiere Col 6 y no Col 4–5; lo no terminado pasa a mañana solo por lo que falta de verdad.
- **Asistente:** `proponer_orden` y `proponer_ordenes_sugeridas` lo dicen en la tarjeta.
- **Repaso de lo ya emitido:** en el tablero (Hoy / Próximas) las órdenes emitidas que piden algo ya hecho dicen «⚠ Esto ya se hizo …» con «Dejar solo Col 6» o «Sacar esa tarea» (con «Sí», como Seguimiento › Editar).

**Agregados**
- **4. Planilla de columnas** en el legajo y en la ficha del Mapa de guerra: Col 1…N × pozo, hormigonado, izaje, vínculo, luminaria, tablerito, sellado, PAT, con color por estado; tocar una celda = quién, cuándo, hora, OT y la foto.
- **5. Modo obra de la cuadrilla:** si la columna que le toca ya figura hecha (otra cuadrilla u otro día), «⚠ Col 4 y Col 5: Montaje de columna PRFV ya figura hecho el 11/11 (Juan). Te paso a la que falta: Col 6. ¿Es otra cosa?» y pasa a la que falta (sin inventar columnas que la obra no tiene); «Es otra cosa: hacerla igual» la vuelve a dar.
- **6. Parte de verificación del día** a las 18:00 (la hora del pase a mañana, con el mismo turno en `configEquipo/salud`): «Hoy: 7 tareas cumplidas, 2 parciales, 1 dudosa · mañana hay 1 orden que repite trabajo hecho», aviso en la app (con «Ver») y al celu de Administración y Oficina.

**Sin reglas nuevas. Sin APK nuevo.** **Ángel:** subir `index.html`.

**Pruebas:** `t_v150` PC 60/60 · celu 60/60 (con `REGLAS=1` también: sin reglas nuevas): verificación 2 de 3 parcial y dudosas (sin detalle por columna, foto a 820 m), tablero, hoja, «Cerrar con esto» con el cierre precargado (2), «Está bien» guarda `campo.verificado`, Supervisor, línea de Llenar orden, cartel al emitir con las tres opciones, pase a mañana (1 en vez de 3), saldo, repaso del tablero con «Sacar esa tarea» y «Sí», sugerida solo Col 6, planilla en el legajo y en el Mapa de guerra, parte de las 18:00 (turno, aviso, «Ver»), asistente (`verificar_orden` + `ver_fotos` simulados, tarjeta de `proponer_orden`; el pañol no la recibe), cuadrilla en Modo obra (salta Col 4 y 5 y lo dice, «Es otra cosa», nada de la oficina). Sobre la base final (v149b): `t_v149b` 37/37 y 37/37, `t_circuito` 16/16 y 16/16, `t_v146` 64/64 y 64/64, `t_v142` 49/49 y 49/49, `t_v149` 34/34 y 35/35, `t_v106` y `t_v111` OK, `t_v143` PC 78/78; `t_v143` celu falla a veces una prueba (el asistente emite sin «en qué vehículo va cada uno»): **pasa igual con la v149b publicada** (3 de 4 corridas fallaron) — es una carrera vieja de tiempos, no de esta versión. Batería completa de a 3 (sobre la 149, `TZ` de Córdoba): todo OK salvo `t_v083` (reemplazada) y lo que se arregló o repitió solo: `t_v106`/`t_v111` (el cierre perdía lo cargado al «Agregar a alguien»/«No fue» por una marca `data-*` en el campo: arreglado), `t_v149` celu (1 muestra de 152, sola OK), `t_v142` y `t_v149b` (esperaban la v149b).

**Pendientes / a confirmar:** el radio de 150 m para «foto de otra obra» y qué es «hora rara»; las fotos sueltas (sin orden) todavía no cuentan para la verificación (habría que leerlas); lo asignado en la planilla supone las siguientes columnas que faltan; el cierre rápido del asistente no muestra la verificación (el cierre por voz sí).

**Huellas (SHA-256):** ORIGINAL `150_2026-11-12_app-EMA_ORIGINAL.html` `b9cadafdbd833dd569e60012bebf730dc000d068e2b47e5e5a65e7a4cfbdc291` · `index.html` `43af21f4f7c4e8cf7b73b2a9e1a1f15dc17d014e9ea0c5d9e357ff6d97a19ee4` · sello `2026-11-12 11:24 · 42ca6e` (meta `ema-version` y `#appVersion`). Detalle en `herramientas/v150/huellas.txt`.

## v149b — 12/11/2026 (urgente, publicada en GitHub) · Las fotos de la cuadrilla no se pierden nunca + copia en el celu + mandar lo hecho

**Pedido de Ángel** (12/11/2026): «los chicos están teniendo problemas con las fotos: no pueden enviar y entonces se les pierden. Aparte de enviarse en la app, tendría que poder hacer que se les descarguen en el cel automáticamente al mismo tiempo». Capturas: Bruno (11/11 16:36, con 4G) con «Esperando señal · 11 fotos + 23 cambios» y «⏳ 11 fotos esperando señal»; Franco (OT-2026-218 LAS TABLITAS) con «1 de 10 hechas · Todavía nadie envió» que «no puede cerrar la orden».

**Base:** ORIGINAL 149 (publicada, `982151ad…`). Es una versión aparte de la v150 (que se arma sobre la v149): la v150 tiene que reaplicarse sobre la v149b (`--otra-base`).

**Por qué no se enviaban (con internet decía «esperando señal»)** — la captura de Bruno es de las 16:36 del 11/11, **antes de la v148**:
- Cuando la base (plan gratis Spark) llega al **cupo del día**, Firestore **no rechaza** las escrituras: las deja pendientes y las reintenta solo para siempre. La app solo sabía «se guardó» o «tardó» y todo lo que tarda lo mostraba como «sin señal» (`fotosSinSenal`, la cola de cambios y la franja de la cuadrilla).
- Encima, la cola de fotos **volvía a mandar cada minuto TODAS las fotos pendientes** (una escritura nueva por foto por minuto, con la imagen adentro si la nube había fallado): una tormenta que se suma al cupo, que hace que al día siguiente vuelva a agotarse rápido y que llena la memoria del celu. (La cola de cambios ya no repetía: tenía su candado desde la v102.)

**Por qué se perdían**
- **v148, Modo obra por atrás:** ante cualquier error que no fuera de permiso o de señal (la base contestó otra cosa, el celu no pudo procesar la imagen, la orden no estaba en memoria) **borraba la copia del celu** y decía «sacala de nuevo»; había **un solo intento**, sin reintentos; y una foto que se colgaba **frenaba a todas las de atrás** (la fila era de a una y sin tope).
- **Cámara de la barra y Mis tareas clásica:** no tenían ninguna copia: un error así = foto perdida («⚠ No se pudo guardar la foto: probá de nuevo»).
- Con el usuario **sin vincular** (o la orden de otro) las fotos sí quedaban en el celu, pero Modo obra no decía nada y la oficina no se enteraba.
- Reproducido con el arnés: error de la base 2 veces (antes: 2 de 3 perdidas), cerrar la app antes de subir, sin señal, nube caída, usuario sin vincular con las reglas reales, orden cerca de 1 MB, cupo agotado (REST 429 + escrituras colgadas).

**Arreglo: ninguna foto se pierde** (módulo nuevo `fotosSeguras`, `window.__fotoBandeja`)
- Cada foto que pasa por `guardarFotoObra` (Modo obra, cámara de la barra, Mis tareas, seguridad, legajo) queda **copiada en el celu** (IndexedDB `ema-fotos-crudas`) antes de intentar subirla, con su número (`adjId`) fijado de entrada (viaja hasta la cola `ema-fotos-cola`: reintentar no duplica la foto). La copia se borra **recién** cuando la ficha está en la base (ya no está en la cola de fotos) y la orden la tiene anotada (ya no está en la cola de cambios).
- Si algo falla: «📥 La foto quedó guardada en el celu y se sube sola», **reintentos sin fin** con espera creciente (30 s → 10 min), al volver la señal, al abrir la app y al volver a la app; nunca se descarta. Las que quedaron cuando Android cerró la app se suben solas al abrir y se anotan en su orden (con la miniatura).
- Modo obra: la fila de «por atrás» espera como mucho 90 s a que la cámara esté cerrada y una foto trabada no frena a las demás (tope 160 s). «Foto guardada» dice «Guardada · subiendo…» y recién «✓ Subida» cuando está en la base.
- La cola de fotos **no vuelve a mandar** lo que ya está en camino.

**El motivo real** (`window.__senalReal`)
- Con cosas esperando y «internet», la app pregunta por su cuenta (1 lectura pública + 1 escritura en tu presencia, por REST, cada 2 min como mucho) y al servidor de fotos: **sin señal de verdad · la base llegó al cupo gratis de hoy · falta permiso · sesión vencida · el servidor de fotos no responde**. Lo dice en la franja de Hoy / Modo obra («La base no acepta más por hoy», «Falta permiso», «Fotos por subir»…), en el aviso de abajo («🛑 11 fotos esperando: la base no acepta más por hoy · se suben solas a las 05:05») y en la pantalla de las fotos.
- **Cupo agotado:** la app deja de golpear la base hasta que se renueva (medianoche del Pacífico = 04:00/05:00 de Argentina); con las lecturas agotadas apaga los pedidos de la base (`disableNetwork`) y prueba cada 30 min por si se levantó antes (p. ej. si se pasa a Blaze). Las fotos y los cambios quedan en el celu.
- **Contador:** «📤 N fotos esperando para subir» en la cámara; la tarjeta de Hoy / Modo obra con N fotos + N cambios y el motivo; la pantalla de las fotos con la lista (miniatura, obra, columna, motivo), «Reintentar ahora» y, cuando quedan 0, «✓ Todas las fotos subidas».
- **La oficina lo ve:** el latido de presencia lleva `disp.fotosPend`, `colaMotivo`, `colaDesde`; el Supervisor muestra «N foto(s) esperando en N celular(es): Bruno 11 (cupo de la base)…» y, si la base llegó al cupo, una línea roja con la hora en que se renueva.

**Copia en el celu** («que se descarguen al mismo tiempo»)
- App de Android (1.3+, plugin `Filesystem`, sin permisos nuevos): cada foto **con su marca** se guarda también en **Documentos › EMA › Fotos › AAAA-MM-DD › OBRA_Col_N_hora.jpg**, sin preguntar, apenas la app le pone la marca (con Modo obra, al cerrar la cámara). Es la misma carpeta que usa «Bajar PDF» desde la v109. Se ve desde la app **«Archivos»** del celu; **a confirmar en un celu real si aparece en la Galería** (para que aparezca seguro haría falta guardarlas en «Imágenes» con un plugin de galería: APK nuevo; no se hizo).
- Perfil › «Guardar copia de las fotos en el celu: Sí/No» (de entrada Sí para cuadrilla/operario; dice cuántas se copiaron hoy). No reemplaza la subida.
- En el navegador no se puede guardar sola: Perfil y la pantalla de fotos ofrecen **«⬇ Bajar mis fotos de hoy»** (ZIP con las fotos propias de hoy).

**Mis tareas clásica: mandar lo hecho** (Franco)
- Desde la v123 la orden se envía sola recién con **todas** las tareas mandadas; con 1 de 10 no había forma de mandarla. Ahora, con al menos una mandada: **«📤 Mandar lo que hice (1 de 10) · lo demás queda pendiente»** → dice qué queda pendiente → manda la orden (`campo.enviados.<persona>` con `parcial`, `hechas`, `de`, `pendientes`, y las horas de lo hecho) y avisa a la oficina; lo que falta queda para la oficina (y el pase a mañana de la v146). Después: «Ya mandaste lo que hiciste».

**Pruebas:** `t_v149b` (PC 37/37 · celu 37/37): normal, error de la base, cerrar la app, sin vincular (reglas reales + Supervisor), cupo (motivo, sin tormenta, suben al levantarse), cámara de la barra con error, copia con Filesystem simulado (carpeta, nombre, una sola vez, Sí/No), ZIP sin plugin, mandar lo hecho. `t_v142` actualizada («Reintentar ahora» en vez de «Probar ahora»). **Batería completa** de a 3 en PC y celu (TZ Córdoba): todo OK salvo `t_v083` (reemplazada) y `t_v150` (es de la otra versión); las que fallaron por tiempos con la máquina cargada (`t_circuito` pc, `t_v143` pc, `t_v147` pc, `t_v149` pc/cel, `t_v146` cel) dan OK solas, y `t_v148`, `t_v144`, `t_v142`, `t_circuito`, `t_v149`, `t_v149b` OK en PC y celu con el armado final.

**Huellas:** ORIGINAL `149b_2026-11-12_app-EMA_ORIGINAL.html` `91285a26…f527d394` · `index.html` `b548d15a…6033c6b333` · sello `2026-11-12 09:45 · 58ccbe` (las dos marcas). Parche y módulo en `herramientas/v149b/` (`huellas.txt`).

**Sin reglas nuevas.** No hace falta APK nuevo. **Ángel:** subir `index.html`. Si en el Supervisor aparece «La base llegó al cupo gratis de hoy», hay que bajar lecturas o pasar a Blaze (lo decidís vos).

## v149 — 12/11/2026 (publicada en GitHub) · El micrófono del Asistente ya no se apaga solo + el Asistente más rápido

**Pedido de Ángel** (12/11/2026, hablándole al Asistente desde el celu): «cuando pongo el micrófono, así como estoy hablando ahora, al ratito se destilda. No sé por qué pasa. Y está muy lenta, no sé si se puede hacer algo». Precisión después: «tendría que ser como el micrófono de Claude: yo hablo y se va escribiendo, y se destilda recién cuando yo aprieto».

**Base:** ORIGINAL 148 (publicada, `2e812f74…`).

**Por qué se cortaba el micrófono**
- El reconocedor de voz de Android (el plugin de la app 1.4 y el Chrome del celu) termina solo al primer silencio (1–2 s) o a los 5–10 s. La app tomaba ese final como «terminé de dictar» y apagaba el 🎤 y la onda. No era un error: así funciona el motor, y la app no lo volvía a prender.

**Micrófono (🎤 dictar y 🗣 charla)**
- **Dictar:** queda prendido escribiendo en vivo hasta que la persona toca el 🎤 de nuevo, envía, cierra el panel o sale de la app. Cada corte del motor se vuelve a prender solo (en ~60 ms) y el texto se junta **sin repetir** lo que el motor repite al volver y sin perder lo dicho. El botón y la onda quedan prendidos todo el tiempo.
- En la app 1.4 el plugin además se vuelve a prender **adentro** (`continuousPTT`) y **sin el pitido** de Android en cada vuelta (`muteRecognizerBeep`); si un celu no lo acepta, la app lo encadena sola. En el navegador de la compu, una sola sesión larga; en Chrome de Android se encadena (ahí `continuous` repite el texto).
- **Tope por batería:** 5 minutos sin ninguna palabra → se apaga con el aviso «Apagué el micrófono porque no escuché nada» (**a confirmar** con Ángel).
- **Charla:** el turno ya no termina cuando el motor corta (a veces a mitad de frase): termina con ~1,5 s de silencio después de lo último que se escuchó. Lo demás igual (2 min sin hablar pausa, «chau/terminar», nunca escucha mientras habla).
- Enviar sigue cortando en seco: nada vuelve a escribirse en la caja (v140).

**Velocidad**
- «💭 Pensando…» aparece al instante al mandar la pregunta (antes no se veía nada hasta la primera herramienta o la respuesta).
- **Respuesta que se va escribiendo** mientras llega y **voz desde la primera frase** (en charla y con «leer siempre»). Necesita el Worker `ema-ia` **v4-ia** (`workers/ema-ia.js`, también `ema-ia_v4.js`): reenvía la respuesta de Claude de a pedazos y al final cuenta el costo igual que siempre (mismos topes, roles y freno del mes). La app lo usa solo si `/salud` dice v4-ia; con el Worker de hoy, todo como antes.
- **Effort «low»** (y respuesta corta) en la charla por voz y en preguntas cortas (≤ 80 letras) que no piden revisar, comparar, armar, cerrar, cargar ni cambiar nada; lo que revisa o propone cambios sigue en medium/high (Opus 5.5 como hasta ahora).
- **Medido** (Worker y Claude simulados en 1,8 s para una pregunta con una búsqueda, dos vueltas): **antes** el primer texto aparecía a los 1.813 ms en la compu y 1.843 ms en el celu con CPU ×4 (todo junto al final); **ahora** el primer texto aparece a los **307 ms (compu) / 335 ms (celu ×4)** y el total queda igual (1.814 / 1.890 ms). Lo que pone la app es poco: armar el pedido 1–5 ms, herramientas 0–1 ms, dibujar 1–4 ms, pedido de 82 KB (con datos de prueba; en la base real las herramientas devuelven más). **El resto es de Claude** (pensar y escribir): no se puede medir sin el Worker real; el effort «low» lo baja en las preguntas cortas y la charla. No se recortaron herramientas ni contexto: cambiarlos entre preguntas rompe la caché (sale más lento y más caro); la caché ya estaba bien puesta (herramientas, system y conversación).
- Los tiempos de las últimas 20 preguntas quedan en el aparato (`window.__iaMedidas`) para medir en celus reales.
- Las versiones del Worker se comparan por número (v3-ia o más nuevo), así el v4-ia no dispara el aviso del «Worker viejo».

**Sin reglas nuevas.** No hace falta APK nuevo. **Ángel:** subir `index.html` y, para la respuesta en vivo, pegar el Worker nuevo (instructivo «Actualizar el Worker para la v149»).

**Pruebas:** `t_v149` (PC 34/34 · celu 35/35): dictado 30 s con el motor cortando solo cada 3–8 s en el navegador y con el plugin de la app 1.4 (cortes adentro y del todo) — el botón y la onda prendidos en las 150 muestras, el texto completo sin repetidos (99 palabras), hueco máx. 62 ms —, apagar a mano, silencio largo (con y sin algo dicho), enviar dictando, charla con corte a mitad de frase (se manda la frase entera, turno a 1,67 s del final), respuesta en vivo (pensamiento con su firma, herramienta con su input partido, burbuja que se va escribiendo, voz desde la primera frase 2,2 s antes del final, nada repetido), effort por pregunta, sin v4 / con JSON entero, tiempos. Worker: `node workers/probar_ema_ia.mjs` 104/104 (stream: eventos tal cual, costo al final igual que sin stream, errores en JSON). Batería completa de a 3 (`TZ=UTC`, después de las 21 de Córdoba): 300 de 302 sin contar `t_v083`; repetidas solas `t_v146` PC 64/64 (dos aparatos a la vez, de tiempos) y `t_v142` celu 49/49. `t_v134`, `t_v137`, `t_v140`, `t_v141`, `t_v146`, `t_circuito` OK en PC y celu. Las pruebas viejas corren con `__v149No` (micrófono de antes).

**Pendientes / para saber:** probar en un celu real que el plugin acepte `continuousPTT` (si no, igual se encadena, quizás con el pitido de Android en cada vuelta); el tope de 5 min a confirmar.

**Huellas (SHA-256):** ORIGINAL `149_2026-11-12_app-EMA_ORIGINAL.html` `982151addb666fc5d930a154e4b63ddea7f9e917b66505e5d8cfbf2c58d01435` · `index.html` `52b49e6f16a6d6c877edf4a18afc93b84751f8becc6ae870eef2b501a9f5d76d` · Worker `ema-ia_v4.js` `70e37be4724404b06266bafa824aba66aa9bf287de59cde94a8e5919a9a11993` · sello `2026-11-11 22:24 · f8c244` (meta `ema-version` y `#appVersion`). Detalle en `herramientas/v149/huellas.txt`.

## v148 — 11/11/2026 (publicada en GitHub) · Parpadeos en los celus + fotos de la cuadrilla más rápidas

**Pedido de Ángel** (11/11/2026, después de publicar la v147): «En varios celulares hay un problema de titileo: la barra de abajo titila, algunos botones cuando recibís una notificación se agrandan y se achican solos». Mandó 2 videos del celu de Marcos (cuadrilla, «Antes de arrancar» 6/6): la barra aparece y desaparece cada ~1 s y «Arrancar el día» salta entre dos alturas. Agregado en la misma versión: «hay que arreglar la velocidad de sacar fotos para la cuadrilla: tiene 11 segundos hasta que carga».

**Base:** ORIGINAL 147 (publicada, `e6819fb7…`).

**Qué causaba el parpadeo (medido cuadro por cuadro, celu 390×844 con CPU ×4, cuadrilla / oficina / pañol)**
- **Viene de la v135, no de la v147** (la v146 da lo mismo). Una regla de la barra de abajo (`body.n1-on #avToast{bottom:92px}`) le ponía al aviso de arriba (`#avToast`, que queda en la página desde el primer aviso, corrido hacia arriba) un `top` y un `bottom` a la vez: se estiraba hasta 742 px de alto. `tapado()` (navBarra, cada 0,7 s) lo veía como «algo que tapa la pantalla» y escondía la barra → sin la barra el aviso volvía a 91 px → la barra volvía → y así **para siempre desde el primer aviso** (y los avisos llegan casi siempre al abrir la app). Cada vez cambia el relleno de abajo de la página, por eso «Arrancar el día» saltaba. Medido: 10 s quieta después de un aviso, **14–15 veces la barra escondida y vuelta (v146 y v147) → 0 (v148)**; el aviso de arriba 742 px → 91–113 px.
- **«Botones que se agrandan y se achican»:** cuando llegaba un aviso cambiaba un globito y la barra se rearmaba entera; si en ese momento estaba escondida, la letra se medía con ancho 0 y quedaba en 9,5 px (todas las pestañas), y al volver a armarse volvía a 11,5. Ahora la barra no se rearma: cambia solo el número del globito, y la letra se ajusta una sola vez y con la barra a la vista («Herramientas» del pañol sigue achicándose lo justo).
- En la compu (sin barra), cada 0,7 s se reescribía la clase del `body` con el mismo valor (`classList.remove` siempre escribe): ahora 0.
- **De la v147:** `movPantallas` podía hacer subir con movimiento una hoja que aparecía por un aviso dentro del segundo después de un toque; ahora solo si la abrió un toque recién (700 ms) y nunca carteles (`role=status/alert`). Además `tapado()` ignora lo del movimiento (`.mov-*`) y las pantallas (`.wrap`): la pantalla que se va queda fija a pantalla completa durante el movimiento (en la medición no llegó a esconder la barra, se cubre por las dudas).
- `tapado()` (navBarra): no cuenta carteles (`role=status`, `#avToast`, `#pmAviso`, `#offAviso`, `#avisoApp` —va por encima de la barra—…), mide lo que se ve **dentro** de la pantalla (no el tamaño de algo corrido afuera) y, si una misma cosa esconde y muestra la barra 3 veces en 6 s (cambia de tamaño con la barra), la ignora.
- Con «menos movimiento» del celu, los puntitos que laten (ubicación en vivo del menú, «en vivo» del Inicio) quedan quietos y el aviso de arriba aparece sin deslizar.
- Lo que sigue cambiando con un aviso, a propósito: el cartel mismo, el número del globito y la pantalla cuando cambia lo que muestra (por ejemplo una orden nueva en «Hoy»).

**Fotos de la cuadrilla (Modo obra «Foto · Col N»)**
- Reproducido: del disparo a poder sacar la siguiente («Foto guardada · Sacar otra») **7,0–7,3 s con señal y 8,8–13,4 s con GPS sin fix y nube lenta** (CPU ×6; con el retardo de la prueba daba 10,8–11,8 s: los «11 segundos» de Ángel). Modo obra esperaba entero `guardarFotoObra`: GPS (hasta 1,5 s), sello y compresión (2–3 s de CPU en un celu lento), nube (hasta 5 s), base (hasta 2,5 s) y la miniatura.
- Ahora la foto cuenta al toque (miniatura del celu y «Subiendo por atrás… podés seguir.») y **todo lo lento sigue por atrás por el mismo camino de siempre** (misma obra por GPS de la v144, mismo sello, misma nube y la misma cola `ema-fotos-cola` sin señal). Las fotos de por atrás se guardan **de a una y cuando la cámara está cerrada y la persona no está tocando** (si no, el sello trababa la siguiente: llegó a 8 s); con la app en segundo plano arrancan enseguida. Cada foto queda copiada en el celu (IndexedDB `ema-fotos-crudas`) hasta que se guarda: si Android cierra la app antes, al volver a abrirla se guarda sola.
- **Disparo → «Sacar otra»: 0,3–1,0 s** (antes 7–13 s). Llega igual a la base y a la orden (`campo.fotos` con su columna, `fotosObra`); sin señal quedan en la cola del celu.
- Abrir la cámara: `atrasApp` (v138) buscaba ventanas abiertas en toda la página (38.000 nodos, 36.700 dentro de pantallas escondidas) en cada cambio; ahora solo fuera de las escondidas (mismo resultado: lo escondido nunca se ve). El logo de la marca de la cámara se lee una vez. **Modo obra: 0,8–2,0 s → 0,5–1,7 s (la más lenta es la primera, con el celu todavía cargando lo demás); cámara de la barra 1,2–1,6 s → 0,5–1,2 s** (CPU ×6, con 300 ms de cámara de mentira). La cámara de la barra ya no esperaba el guardado (la v144 ya lo hacía por atrás).
- Sin cambios en dónde cae la foto, el sello ni la cola sin señal.

**Sin reglas nuevas.** No hace falta APK nuevo.

**Pruebas:** `t_v148` (PC y celu; CPU ×4 para el parpadeo y ×6 para las fotos): cuadrilla en «Antes de arrancar» 6/6, oficina y pañol, quietos y con avisos (uno, varios seguidos, datos nuevos), letra de la barra, globito sin rearmar, algo que cambia de tamaño con la barra, hoja sin toque, fotos con y sin señal, cámara de la barra. Con la v147 falla en lo que corresponde (celu 23 de 43: la barra en cada aviso, el aviso estirado a 742 px, la letra en 9,5 px, el globito rearma la barra, las fotos de 8–10 s; PC 15 de 37: la clase del body y las fotos). `t_v148` PC 37/37 y celu 43/43. Batería completa de a 3 (`TZ=America/Argentina/Cordoba`, 15:27–16:27 de Córdoba): 292 de 296 a la primera sin contar `t_v083` (de siempre); repetidas solas: `t_v147` PC 53/53 (el aviso del lunes, de tiempos), `t_v092u` celu 19/19 (cuenta de cortes, de tiempos) y `t_v142` PC 49/49 **con un cambio en la prueba**: ahora espera a que las 4 fotos de Modo obra lleguen a `campo.fotos` (se guardan por atrás; antes las leía al toque). Queda `t_v137` PC en «la onda del dictado se mueve», la misma de la v147 (audio de mentira de Chromium). `t_v147` celu 118/118, `t_v142` celu 49/49, `t_v135`, `t_v136`, `t_circuito` OK en PC y celu. Medición completa `herramientas/v148/medir_parpadeo.js` y `medir_fotos.js` (se corren desde la carpeta de pruebas); video antes/después (celu, CPU ×4, llega un aviso) en la carpeta de la versión, `capturas/antes_despues_aviso_cel.mp4` (`grabar148.js`): la v147 cambia la pantalla 16 veces en 11 s (la barra y el aviso estirado), la v148 4.

**Pendientes / para saber:** con CPU ×6 la primera apertura de la cámara puede pasar 1,5 s si el celu todavía está cargando lo demás; el costo que queda es de dibujo (la página tiene ~38.000 nodos). Varias pantallas escondidas (Producción, Planificación, Pañol) se vuelven a armar cuando llega un dato aunque no estén a la vista (gasta batería, no parpadea): queda para otra versión, sin pedido.

**Huellas (SHA-256):** ORIGINAL `148_2026-11-11_app-EMA_ORIGINAL.html` `2e812f740e7ea65df972e819d375796d1b423f1803990ab9656ecdacc1d610c9` · `index.html` `9f45c166e9b93a1b8e2292d1e66a2898301d429f6b4f685f87a7293870770b41` · sello `2026-11-11 15:18 · a9fc74` (meta `ema-version` y `#appVersion`). Detalle en `herramientas/v148/huellas.txt`.

## v147 — 11/11/2026 (publicada en GitHub) · Movimiento entre pantallas (opción B) + Mapa de guerra + paso a paso en el celu + informe semanal

**Pedido de Ángel** (11/11/2026): eligió la opción **B «como app de banco»** de los 3 videos de movimiento; y sumó tres agregados para la misma versión: «🗺 Mapa de guerra» (maqueta compu opción A + celu), que el **paso a paso** de cada tarea le llegue a la cuadrilla, y el **📰 informe semanal automático**.

**Base:** ORIGINAL 146 (publicada, `70bf1c4a…`).

**Movimiento entre pantallas, opción B** (`movCss` + `movPantallas`)
- Celu: la pantalla nueva entra desde la derecha con sombra, la anterior se corre un 30 % a la izquierda y se oscurece; con «atrás» (el del celu de la v138 o una flecha ‹ Volver) es al revés. 280 ms. Igual en el legajo, en las pantallas de la cuadrilla, en las subpestañas y en las hojas (suben al abrir, bajan al cerrar). Tarjetas escalonadas (40 ms, hasta 8).
- La dirección sale del orden de la barra de abajo: más a la derecha o fuera de la barra = más adentro = desde la derecha.
- **Sin copiar la pantalla que se va**: se ve la real (fija donde estaba) y se esconde al terminar; nunca hay `id` repetidos. Solo `transform`/`opacity`; `overflow-x:hidden` solo durante el movimiento.
- Sin movimiento: cámara de la app (y Modo obra con la cámara), Mapa, Asistente, visores/galería, hoja A4, lo que no viene de un toque y el «reducir movimiento» del celu. En la compu: fundido de 150 ms.
- Perfil › Tus ajustes › «Movimiento entre pantallas: Sí / No». Si el celu tarda más de 250 ms en dibujar el primer cambio, pasa solo a un fundido corto (opción A) y el ajuste lo dice.
- No cambia nada de lo que hace cada pantalla: no envuelve funciones (mira la página), el «atrás» de la v138 y «¿Salir sin guardar?» siguen igual (atrasApp solo anota cuándo da un paso atrás y no cuenta como abierta una hoja que se está yendo).

**🗺 Mapa de guerra** (`mapaControl`): modo «🎯 Control» del mismo Mapa, solo para quien edita Órdenes (el Mapa de siempre queda igual). Números de hoy, panel de alertas (Hoy · Alertas · Cuadrillas · Avance; urgente / revisar hoy / para saber) a la derecha en la compu y abajo en el celu, pines de cuadrilla con iniciales y vehículo y línea punteada a la obra de su orden de hoy, íconos de alerta sobre cada obra, ficha rápida (avance, Gantt, quién está, qué falta, falta material mañana; Legajo / Orden / Llamar). Alertas sin IA juntando lo que ya existe (obra trabada, falta material para mañana, fotos dudosas, órdenes sin cerrar, gente sin tarea, fraguado, obra sin ubicación), cada una con su acción de siempre. «Llamar» usa los contactos cargados; si no hay, «sin teléfono cargado». Se recuerda el modo; acceso en Inicio Ejecutivo y Tablero del dueño. Sin lecturas nuevas.

**📋 El paso a paso en el celu de la cuadrilla** (`pasosTarea`)
- Modo obra: «📋 Cómo se hace» debajo del botón grande (un paso por pantalla, letra grande, deslizar, la lámina de la guía abajo, «🔊 Escuchar los pasos» con la voz del celu y «Parar»). También en «La orden del día» (ver pasos en cada tarea), en «Ayuda» (primero) y en Mis tareas clásica (en la cabecera de cada tarjeta + «📄 Ver la orden completa»). Anda sin señal.
- Avisos de orden nueva y recordatorio de las 7: «Tocá para ver la orden y los pasos» y al tocar abren la orden.
- Al emitir, la orden guarda la copia de los pasos que se dieron (`ot.pasos`); la hoja de la orden usa esa copia.
- **Bug arreglado:** los pasos editados de las tareas del catálogo original no se guardaban; ahora van a `configEquipo/baremo.pasos` y se aplican al abrir la app.
- Borrador de las 28 tareas sin pasos (`herramientas/v147/pasos_borrador.md`, todo «a confirmar»): Producción › Cuánto vale cada tarea › «Revisar borrador» → «Guardar» → «Sí». Hasta entonces la cuadrilla no lo ve.

**📰 Informe de la semana** (`informeSemanal`): lunes a sábado; lo arma la app sin IA (módulos de la semana contra la anterior por la fecha de la orden cerrada, solo nuestra zona; avance de la zona; órdenes; por obra; gente; pañol con compras sugeridas sin precios; fotos; gasto de la IA del mes; lo que viene de la orden sugerida). «Resumen del asistente» opcional (un pedido corto; interruptor en ⚙, solo Administración). El primer aparato de admin/oficina desde el sábado 14:00 toma el turno (transacción en `configEquipo/salud`), lo guarda en `adjuntos` y deja el aviso a Administración para el lunes 07:30. Pantalla con semanas anteriores, Compartir / Bajar PDF (2 hojas A4 con QR). **El gasto de la IA por semana necesita un Worker nuevo (no se tocó el Worker en esta versión): hoy muestra el del mes.**

**Cuadrilla (por las fotos que mandó Ángel de un celu en Mis tareas con la barra guardada: «la barra de abajo titila»)**
- Para cuadrilla/operario la barra de abajo ya no se puede guardar: sin la flechita ni la lengüeta; si quedó guardada de antes, se ignora (no se borra). Oficina y pañol, igual que antes.
- El parpadeo: cada 1,5–2,5 s varios relojitos reescribían las clases del `body` con el mismo valor, la posición del cartel de sin señal, el texto de «Por obra» y la campanita, el Inicio viejo de la cuadrilla y la tarjeta de puntos (comparaban contra el HTML leído, que nunca es igual). Ahora escriben solo si cambió algo: con el celu quieto, 0 cambios en la pantalla en 10 s (antes 7 en el Inicio y 15 en Mis tareas).
- La campanita: «Te asignaron una orden» abre esa orden en «Hoy» (como el aviso al celu). Mis tareas clásica sigue desde «Ver lista completa».

**Sin reglas nuevas** (todo pasa con `REGLAS=1`). No hace falta APK nuevo (la voz usa el TextToSpeech de la app 1.4 o la del navegador).

**Pruebas:** `t_v147` PC 53/53 y celu 118/118 (también con `REGLAS=1`); `t_circuito`, `t_v138`, `t_v142` OK; batería completa de a 3 (con los arreglos de la cuadrilla, `TZ=America/Argentina/Cordoba`, 08:47–09:44 de Córdoba): 295 de 296 sin contar `t_v083` (reemplazada por `t_v084`, de siempre); la única que falló fue `t_v137` PC en «la onda del dictado se mueve», que depende del audio de mentira de Chromium: falla igual a veces con la v146 (repetida 4 veces con cada versión, 1 falla en cada una). Antes de los arreglos, `t_v143` (la de `vehiculoPersona`) también salía a veces mal con las dos versiones. Video real `herramientas/v147/` → `capturas/B_real.mp4` (se arma con `grabar147.js` + `armar_video147.py`).

**Huellas (SHA-256):** ORIGINAL `147_2026-11-11_app-EMA_ORIGINAL.html` `e6819fb751549f1194dafa69e91232d0b229a1728de0fcd2c93daee3bb184fad` · `index.html` `cc359da14cf7f5f767efba49840e25fabac585b3d192402b7da2283d8399e594` · sello `2026-11-11 08:37 · ce00ac` (meta `ema-version` y `#appVersion`). Detalle en `herramientas/v147/huellas.txt`.

**Qué tiene que hacer Ángel:** subir `index.html` a GitHub (cuando decida publicarla; sw.js y carpetas no cambian). Nada de reglas ni APK. Revisar el borrador de los pasos (Producción › Cuánto vale cada tarea › Revisar borrador).

## v146 — 10/11/2026 (publicada en GitHub) · Cierre del día por voz + pedido de compras automático + tablero del dueño + lo no terminado pasa solo a mañana

**Pedido de Ángel** (10/11/2026, maquetas i3, i4 e i5 aprobadas) y el agregado que pasó de la v145: «durante el día cambian las tareas; lo que no se terminó hoy tiene que pasar al día siguiente y toda la semana se tiene que ir actualizando, automático».

**Base:** ORIGINAL 145 (publicada, `07f40d93…`).

**🎙 Cierre del día por voz** (`cierreVoz` + herramienta `proponer_cierre_dia` en el código dormido del Asistente)
- Para la oficina o el supervisor (quien edita Órdenes). La cuadrilla no lo tiene: ya manda lo suyo en el Modo obra.
- Botón «✨ Cerrar el día por voz» en Órdenes › Para revisar y cerrar (y en Hoy) y chip «🎙 Cerrar el día» en el Asistente: abre el Asistente de siempre (dictado en vivo, onda) en «modo cierre», con la franja «🎙 Cierre del día · N órdenes abiertas».
- Al contexto se le suman las órdenes del día **ya prellenadas** con lo que mandó la cuadrilla (marcas, «no se hizo», pasosObra, horasTarea): la voz solo corrige. Ej.: «Los Álamos se hicieron 4 izajes, Juan 8 horas, Pedro 6, faltó un vínculo, lo pasamos al jueves».
- La IA llama una sola vez a `proponer_cierre_dia` (por orden: cantidades por tarea, horas por persona, «lo que falta a otro día» con fecha); la app valida y arma la tarjeta **antes → después** con las personas y lo de cada tarea, botón «Sí, cerrar».
- Con «Sí»: «lo que falta» va por el camino de la v128 (se suma a la orden de ese día de la obra o se arma una nueva con `vieneDe`; `ot.pasadoA`) y cada orden se cierra con el cierre de siempre (`abrirCierreOt` + «Aprobar todo y cerrar» / `guardarCierreOt`: puntos, avance del itemizado, avisos), horas en `cierre.horasPersona`. Lo que no se dijo queda como lo mandó la cuadrilla. Auditoría `asistente_editar` y `ot_pasar_tarea`.

**🧾 Pedido de compras automático** (`pedidoCompras`)
- Pañol › Lista de compras › tarjeta «🧾 Pedido de compras sugerido» (se arma sola cada día y al abrir) → «Ver el pedido».
- Entra: lo que está **bajo el mínimo**, lo que **se acabó** (la lista de compras de siempre) y lo que van a necesitar **las obras programadas en los próximos 7 días** (órdenes emitidas y, para la oficina, las sugeridas de la v143): cómputo − max(lo que ya salió, lo que justifica el avance de la v145) − lo apartado para esa obra, contra el **stock libre** (sin lo apartado). Menos lo ya pedido y sin recibir.
- Por material: cantidad sugerida (editable) con el porqué («para PLAZA LOS ÁLAMOS el jueves 12/11: 8 Un.; hay 0»), último proveedor y último precio **de las entradas** (sin entrada con precio = «sin precio»; no se inventan proveedores ni precios), la unidad con `porUnidad` y la alternativa 🟢 de la v101 si tiene stock.
- Agrupado por proveedor (y «Sin proveedor anterior»): «📤 Pedido a <proveedor>» = hoja A4 (`hojaPdf`, con QR de la app de siempre) con o sin precios, para mandar por WhatsApp o mail con Compartir. «💾 Guardar el pedido» con «Sí»: resumen en `adjuntos` (`tipo:"pedidoCompra"`, sin precios, como el `remitoRes` de la v138). Cuando entra el remito (entradas del mismo proveedor después del pedido) se ve lo recibido: «📜 Pedidos guardados» ✅ / 🟠 / ⏳.
- Permisos: quien edita el pañol (pañol, oficina, administración). **Precios solo Administración y Oficina** (el pañol lo ve sin precios).

**📊 Tablero del dueño** (`tableroDueno`)
- Menú «📊 Tablero del dueño» e Inicio Ejecutivo › Accesos. Solo Administración y quien Ángel habilite («¿Quién más lo ve?» en el mismo tablero, con «Sí, guardar» → `configEquipo/personal.tableroDueno.habilitados`).
- **La plata y el avance son solo de nuestra zona del contrato** (v144). Portada con el anillo del contrato, obras en curso / atrasadas / terminadas, personas en obra y órdenes de hoy.
- Tarjetas: certificado (meses cerrados, v145), hecho por certificar, lo que falta del contrato (módulos y $), borrador del mes; ganancia por obra y total (`gastosPro`, sin IVA); plata en material entregado sin avance (v145, con el último precio); órdenes de hoy y mañana, personas en obra, ausencias; avance por obra; módulos del mes por día (órdenes cerradas, sin provisiones); alertas: obras atrasadas (Supervisor / Gantt), fotos dudosas (v144), material sin explicar, órdenes para cerrar, rendimientos que cambiaron (v143) y el gasto del asistente en el mes (v141). Cada tarjeta lleva a su pantalla.
- Compu (v139): a todo lo ancho, grilla de 3 columnas (2 hasta 1199 px). Celu: tarjetas una abajo de otra, sin scroll de costado.
- «✨ Resumen de la semana» (solo Administración): pedido corto al asistente con los datos ya calculados (tipo `pregunta`: cuenta para el gasto); la respuesta queda en la tarjeta y en el chat.

**📅 Lo no terminado de hoy pasa solo a mañana** (`pasarManana`)
- Qué: de cada orden del día, las tareas que «no se hicieron», que no se marcaron o que quedaron a medias (marca, pasosObra o cierre con menos de lo previsto).
- A dónde: se suma (tarea y cantidad, la gente no cambia) a la **orden ya emitida** de esa obra del próximo día hábil, con `pasadoDe` en la de mañana y `pasadoA` (auto) en la de hoy. Si mañana no hay orden de esa obra → **borrador de la orden sugerida** (no se emite sola). Si la orden de mañana ya está llena según los rendimientos (HH) → «no entra: queda para el <día>» y va al borrador de ese día.
- Sin duplicar: lo ya pasado (a mano, por voz o antes), lo que ya está en la orden de mañana, lo que sacaron a mano de esa orden y lo deshecho no se vuelve a sumar.
- Cuándo: a la hora del ajuste (de entrada 18:00) o apenas la oficina cierra la orden de hoy; si nadie abrió la app, la próxima vez que alguien de la oficina la abra (lo del día hábil anterior). El primer aparato de Administración u Oficina toma el turno con una transacción en `configEquipo/salud.pasarManana.<día>` (como el supervisor de la v136): una sola vez.
- Aviso «📅 Se pasaron N tareas de hoy a mañana: … · ↶ Deshacer · Listo» (y al celu de la oficina); «Deshacer» vuelve todo atrás. Auditoría `sugerida_pasar` (al pasar y al deshacer).
- Ajuste en Órdenes sugeridas › Ajustes: «Pasar lo no terminado a mañana: automático / preguntarme / no» y la hora (de entrada automático, 18:00). «Preguntarme» muestra la lista con «Sí, pasarlas» / «Ahora no».

**Datos:** `adjuntos` `tipo:"pedidoCompra"`, `configEquipo/personal.tableroDueno.habilitados`, `configEquipo/salud.pasarManana.<día>`, `configEquipo/baremo.sugerida.{pasarModo, pasarHora}`, `ordenesTrabajo.pasadoDe` / `pasadoA.<tarea>.auto`. **Sin reglas nuevas** (verificado con `reglas_stub`: `t_v146` con `REGLAS=1`, 64/64).

**Pruebas:** `t_v146` nueva (PC y celu, 64/64; datos en `datos146.js`, Worker del asistente simulado): cierre por voz (botón y chip, contexto prellenado, tarjeta, dos órdenes cerradas con cantidades y horas por persona, «lo que falta» al jueves en orden nueva; la cuadrilla no lo tiene); pedido de compras (bajo mínimo, obra programada con lo apartado, alternativa 🟢, sin precio sin entrada, por proveedor, hoja A4 con y sin precios, guardar con «Sí», lo recibido con la entrada, lo ya pedido no se repite, pañol sin precios); tablero (datos de la zona, certificado, órdenes hoy y mañana, gente, ausencia, gasto del asistente, el barrio afuera, tarjetas que llevan a su pantalla, resumen de la semana, permisos: oficina habilitada sí / sin habilitar no / pañol y cuadrilla no, sin scroll de costado); lo no terminado (18:00 a la emitida de mañana, borrador sin orden, mañana llena, sin duplicar, aviso, Deshacer, preguntarme, dos aparatos a la vez = una sola vez). Pruebas viejas: `__v146No` (salvo `v146:true` en h.js). Capturas al lado de las maquetas: `capturas/real.jpg` (`herramientas/v146/montar146.py`). **Batería completa** de a 3 con `TZ=America/Argentina/Cordoba` (PC y celu; se cortó por un reinicio del contenedor y se retomó con `correr146b.sh`): todo OK salvo `t_v083` (reemplazada por `t_v084`, como siempre) y `t_v105`, `t_v142`, `t_v143` corridas después de las 21 h de Córdoba (= medianoche UTC): **dan lo mismo con el index de la v145** a la misma hora (7/10, 39/49, 77/78): los datos de esas pruebas arman las fechas en UTC; no es de esta versión. `t_circuito` 16/16 en PC y celu.

**Huellas:** ORIGINAL `70bf1c4a183de6fe0729ecc802cf7bbf0a1b49a10c382c637b46b3069c59d692` · index `3953476ce860db242597c39f36d4449a772942f967f77afe9a2c9bec846f1380` · sello `2026-11-10 21:06 · 213dc6` (todas en `herramientas/v146/huellas.txt`).

**Qué tiene que hacer Ángel:** subir el `index.html` a GitHub. Sin reglas nuevas, sin Worker ni APK nuevo. En Órdenes sugeridas › Ajustes está el modo del pase a mañana (de entrada automático a las 18:00). Si querés que otro vea el tablero del dueño, habilitalo desde el mismo tablero.

## v145 — 10/11/2026 (publicada en GitHub) · Certificación mensual automática + material contra avance + gente sin tarea + reglas de las cuadrillas + degradé de las acciones + mayúsculas prolijas

**Pedido de Ángel** (10/11/2026, maquetas i1 e i2 aprobadas) y sus agregados del mismo día: «todo el personal de alumbrado tiene que tener una tarea cada día hábil, salvo ausencia o enfermedad»; el degradé de «Calcular materiales» en todo lo que era azul sólido; los nombres en mayúsculas prolijas; mínimo 2 personas en obra, equipos habituales y vínculos sin grúa.

**Base:** ORIGINAL 144 (publicada, `ada8e790…`).

**📑 Certificación mensual (se arma sola)** (`certMensual`)
- Menú «📑 Certificación del mes» (debajo de Informes) y tarjeta en Informes. Solo quien edita Informes o Gastos (Administración y Oficina): tiene plata.
- **Solo nuestra zona** (v144: `configEquipo/precios.zonaContrato`, de entrada A · Este, 18.407 módulos). Las obras de otra zona, barrios y «otras» no entran (se dice cuántas quedan afuera).
- **Qué se hizo en el mes:** el avance que dejó cada orden al cerrarse (`cierre.avanceItems`) con **la fecha de la orden**; las anuladas con el avance descontado no cuentan. Lo cargado a mano en el itemizado **no tiene fecha: no se reparte** y va a «⚠ Para revisar» («PLAZA X: sin fecha N ítems, revisalos»).
- Por ítem: K, contratado, **acumulado anterior**, **mes**, acumulado total, módulos del mes (K × cantidad), $ del mes sin IVA (módulo del itemizado, $296.126,45) y el respaldo (las OT). **Provisiones 83–89 aparte** (fuera del %, como en el itemizado). Totales: módulos, sin IVA, IVA 21 %, con IVA y acumulado de la zona (%).
- **Plazas ya ejecutadas:** lo certificado por la Municipalidad (`CERTIF_MUNI`, por la hoja asignada o el ID exacto, sin cruces por parecido) va como acumulado anterior; el mes suma solo lo nuevo.
- «⚠ Para revisar»: sin fecha, hechas de más, diferencias del Supervisor (`__diferenciasObra`), lo cargado después del cierre.
- **PDF** (hoja A4 de `hojaPdf`, con QR que abre la certificación de ese mes: `?cert=AAAA-MM`) y **planilla Excel** (el mismo armador de los informes, `window.__infExcel`).
- **Cerrar el mes** (solo Administración, con «Sí»): foto fija por obra en `avanceObras/{id}.certificados.<AAAA-MM>` (cantidades y K) y la marca en `configEquipo/precios.certCerrados.<AAAA-MM>` (módulo y totales). Un mes cerrado no cambia: lo que se cargue después con fecha de ese mes va al mes siguiente, con aviso en los dos. **Sin reglas nuevas** (las de `avanceObras` y `precios` alcanzan).
- Asistente: herramienta de lectura `certificacion(mes)` (admin y oficina; la cuadrilla, el pañol y mirar no la reciben y si la piden, «Eso no lo puedo ver…»).

**📦 Material contra avance** (`matAvance`)
- Por obra: **entregado neto** (vales − devoluciones, `__reservas.entregadoAObra`; lo cambiado por otro material cuenta para el original, `__sustitutos`) contra lo que **justifica el avance** (cómputo de la obra × avance de su rubro en el itemizado: columnas 1–8, zanja 15–20, cruce 21–24, cable 25–40, tablero 9–14, PAT 74/75/77/81, retiros 45–49; si no, el avance general). El rubro de cada material sale del título de la sección del cómputo o del nombre: **a confirmar**.
- Semáforo con margen editable (de entrada 10 %, **a confirmar**, `configEquipo/baremo.aprendeMaterial.margen`): 🟢 parejo · 🟡 de más o de menos · 🔴 mucho más (más de 5 × el margen, «¿dónde está el material?») o avance sin nada entregado («¿lo sacaron de otra obra?»). Columnas hechas por nombre.
- En el **legajo** (debajo de «🧾 Material: calculado vs. entregado»), con «Ver vales» y «↩ Pedir devolución» (con «Sí»: aviso a quienes retiraron y al pañol; no mueve stock); en **🧠 Lo que aprende la app › 📦 Material** (ya no dice «Próximamente») y en el **Supervisor** (sin IA): «PLAZA X: material contra avance · N en rojo».
- **Lo que aprende del material:** con las obras terminadas o al 90 % o más, material real por columna / metro de zanja / tablero y por tipo de obra (PRFV o metálica, 7 o 10 m), con promedio y cuántas obras: «la calculadora pone 1 m por columna; lo real fue 1,29 (3 obras)». **No cambia la Calculadora:** «✨ Informe del asistente» propone y con «Sí» solo **anota** la sugerencia para Ángel (`configEquipo/baremo.aprendeMaterial.sugerencias`, herramienta `proponer_aprende_material`).

**👷 Gente sin tarea** (`sinTarea`)
- Quiénes: la nómina activa de obra (vinculados a cuadrilla/operario, los que no tienen usuario y el equipo civil), sin Administración/Oficina/Pañol/Mirar ni los ausentes. Día hábil = jornada de la orden sugerida.
- Control: quién no está en ninguna orden emitida ese día. En la **orden sugerida**: bloque arriba «👷 N personas sin tarea mañana» con «Sumar a…» y el porqué (1° la obra donde rinde más con uno más —izaje de 2 → 3, según Ángel—, 2° preparación, 3° galpón, 4° lo que quedó de ayer, 5° otra tarea a mano); sumar a una orden ya emitida pide «Sí». Al tocar «Emitir»: «Quedan N sin tarea» con «Asignar ahora» / «Emitir igual»; y después de emitir, lo mismo. Inicio Ejecutivo › «Para atender» (desde las 14 h o si ya hay órdenes para mañana). Recordatorio a Administración y Oficina a las 17:00, una vez por día (⚙ Ajustes: hora y sí/no; `configEquipo/salud.sinTarea`). 🧠 «👷 Días sin tarea» del mes (solo el conteo). El asistente ve la lista (`resumenIa.sinTarea`) y puede proponer dónde ponerlos.

**Reglas de Ángel para armar las órdenes** (`sugReglas`)
- **Mínimo 2 en obra** (editable en ⚙ Ajustes, «según Ángel»): barquilla, grúa, hidro o tablero, sí o sí 2; solo el galpón puede ser de 1. La sugerida no emite un equipo de obra de 1 (lo dice y la persona queda «sin tarea» con dónde ponerla). «Llenar orden»: aviso con «Emitir igual» (no bloquea).
- **👥 Equipos habituales** (Producción › Personal del equipo, `configEquipo/personal.equiposHab`): la propuesta de Ángel precargada (Ulises Toledo + Ezequiel —a veces Petiti— F100 · Marcos Manclova + Mauricio Ford chica con hidro · Nahuel + Vizgarra barquilla grande · Marcos González + Federico la otra barquilla · Pablo + Ariel Lastra grúa), emparejada con la nómina por nombre Y apellido («a confirmar» si hay duda, «no encontrado» si no está). Se guarda solo con «Guardar». La sugerida manda juntos a los del equipo con su vehículo y al equipo de la grúa a las obras con izaje.
- **Vínculos sin grúa:** la grúa iza sin los vínculos (izaje «con caño y sin vínculo», 6 con 2 / 12 con 3); los vínculos van aparte con hidro chica o barquilla en las columnas ya izadas, salvo que haya vínculos armados en el galpón.

**Diseño**
- **Degradé de las acciones** (`gradAccionCss`, `--grad-accion`, el de «Calcular materiales»: navy → turquesa hondo `#1F5F86`): todo lo que tenía fondo azul sólido (subpestañas y chips activos, botones, insignias, barras de avance, botones redondos del Modo obra, interruptores…), sacado de buscar en todo el CSS los fondos navy (`herramientas/v145/buscar_navy.js` + `acciones.py`). Letra blanca con contraste AA (también en las pestañas activas que antes eran blancas con letra navy, como «Cómputo de la plaza»). No se tocan la portada, la cámara (oscura), la impresión ni el turquesa claro.
- **Mayúsculas prolijas** (`fmtNombre`, solo cómo se muestra): obra en MAYÚSCULAS; barrio, dirección y personas en Tipo Título con palabras chicas en minúscula y siglas, números y romanos respetados («Bº Ciudad de Mis Sueños», «Eridanus 1416»). `window.__fmtNombre {obra, barrio, direccion, persona, titulo}`; aplicado en el Inicio, Obras (lista y legajo), Avance, Órdenes, Mis tareas, Planificación, reservas y la cámara (el nombre de obra también por CSS, `text-transform`). El buscador sigue igual. Obras (admin): «🔤 Ordenar mayúsculas en la base» muestra antes → después y solo con «Sí» guarda por «Registrar obra» (con su cascada), con auditoría `obras_mayusculas`. Botones y títulos revisados: no había ninguno en «Tipo Título».

**Datos:** `avanceObras.certificados.<AAAA-MM>`, `configEquipo/precios.certCerrados`, `configEquipo/baremo.aprendeMaterial {margen, sugerencias}`, `configEquipo/personal.equiposHab`, `configEquipo/salud.sinTarea.<día>`, `configEquipo/baremo.sugerida.{minObra, sinTareaAviso, sinTareaHora, reglas.minDos, reglas.vinculoSinGrua}`. **Sin reglas nuevas** (verificado con `reglas_stub`).

**Pruebas:** `t_v145` nueva (PC y celu, 82/82; datos en `datos145.js` y `datos143.js`, Worker del asistente simulado): certificación (mes con varias órdenes, acumulado anterior, anulada descontada, provisiones aparte, ítem sin fecha avisado, hechas de más, ejecutada con CERTIF_MUNI, otra zona y barrio afuera, $ con y sin IVA, mes anterior, PDF con QR, Excel, cerrar el mes con «Sí» y que no cambie, lo tardío al mes siguiente); material contra avance 🟢🟡🔴 con sustituto, vales, pedir devolución, margen, Supervisor; aprendizaje con 3 obras e informe del asistente que solo anota; permisos (pañol y cuadrilla no ven la certificación ni la herramienta; oficina sí, sin cerrar); gente sin tarea (6 − 1 ausente − 4 en órdenes = 1; dónde ponerlo; sumarlo con «Sí»; Inicio; recordatorio de las 17 una sola vez; días sin tarea; en la sugerida: bloque, cartel al emitir, aviso después y «Asignar ahora»); mayúsculas («Costa Canal»→«COSTA CANAL», «Bº ciudad de mis sueños»→«Bº Ciudad de Mis Sueños», «ERIDANUS 1416»→«Eridanus 1416», ordenar en la base con «Sí»); degradé en chips y subpestañas activas; reglas (equipo de 1 en obra no, galpón de 1 sí, barquilla con 1 aviso, la sugerida no emite la obra de 1, equipos habituales propuestos sin guardar con «a confirmar» para Marcos Manclova y guardados con «Guardar», grúa a los izajes «con caño y sin vínculo», vínculos aparte, «Llenar orden» con «Emitir igual»). Pruebas viejas: `__v145No` (salvo `v145:true`). **Batería completa** de a 3 (147 pruebas en PC y celu): todo OK salvo `t_v083` (reemplazada por `t_v084`, como siempre) y `t_v142` (38/49 en PC y celu): da **lo mismo con el index de la v144** corrido a la misma hora (23 h): depende de la hora del día (las horas de las columnas cruzan la medianoche), no es de esta versión. `t_circuito` OK en PC y celu. Capturas antes/después del degradé: `pruebas/cap_v145.js`.

**Quedó para la v146 (agregado del final):** «lo que no se terminó hoy pasa solo a mañana y la semana se actualiza». El borrador no emitido ya se recalcula en vivo con lo cerrado (lo que quedó de ayer va primero, v143); falta pasar **solo** lo no terminado a las órdenes ya emitidas de mañana a las 18:00 con «Deshacer», el modo «preguntarme» y el cartel «Actualizado 15:42 · N tareas pasaron a mañana». Escribe órdenes sin que nadie toque (choca con la regla de no tocar datos sin «Sí» salvo este pedido expreso) y necesita su propia prueba: mejor en una versión aparte.

**Huellas:** ORIGINAL `07f40d93bf03f749ea75520386f44b5602f7d1597c2875e2b8d947c491f1c9c5` · index `f33ed81a58473ebd36c605c1c4ad7528da4bf98d7334323ac747b68cc25b02ed` · sello `15 · fee757:2026-11-10 20:22 · a67eaf:15 · fee757` (todas en `herramientas/v145/huellas.txt`).

**Qué tiene que hacer Ángel:** subir el `index.html` a GitHub. Sin reglas nuevas, sin Worker ni APK nuevo. En Producción › Personal del equipo, revisar la propuesta de «👥 Equipos habituales» (los «a confirmar» y «no encontrado») y tocar «Guardar». A confirmar: el margen del 10 %, el rubro de cada material, «mucho más» = 5 × el margen.

## v144 — 10/11/2026 (publicada en GitHub) · Las fotos caen en la obra donde están parados + cámara «cámara primero» + nuestra zona + estilo «Turquesa del logo»

**Pedido de Ángel** (10/11/2026): «me pasó que una cuadrilla puso la ubicación de otra plaza y la foto la subió a esa plaza. Eso no debería pasar». Después eligió la cámara **opción B «Cámara primero»** (maquetas B1–B3, hoja de cambiar con el estilo de la D), corrigió el anillo del Inicio (el contrato es **solo la Zona A · Este**) y eligió el estilo **«V1 · Turquesa del logo»**.

**Base:** ORIGINAL 143 (publicada, `caaf8cc3…`).

**La obra de la foto la elige el GPS**
- Al sacar la foto, con el GPS del celu (anda sin internet: las obras con `lat`/`lng` están en memoria), si la persona está a **≤ 150 m** del pin de una obra, va a esa obra **aunque su orden sea de otra** (ej.: orden en Bulevares, parado en San Pablo → San Pablo). Sin preguntar: la píldora dice «📍 SAN PABLO · a 22 m · no es tu orden» y un cartel ámbar que no frena («Estás en SAN PABLO. Tu orden de hoy es BULEVARES. Las fotos van a SAN PABLO» · «Está bien» / «Es otra obra»).
- **Qué obras ve la cuadrilla:** las de sus órdenes (hoy y pendientes) + la obra donde está parada; el resto con «Es otra obra (decí por qué)» (lista completa con buscador y motivo obligatorio). La oficina ve el buscador de todas las obras (nombres enteros).
- **Elegir a mano otra obra** estando parado en una registrada: «Estás en BULEVARES, no en LAS ACACIAS. ¿Guardo la foto en Bulevares?» («Sí, en Bulevares» primero / «No, es de Las Acacias (decí por qué)»).
- **GPS malo** (sin dato o ± más de 100 m, **a confirmar**): no bloquea; píldora «Elegí la obra · GPS impreciso ±260 m», se usa lo elegido (la obra de su orden de hoy) y la foto queda con `ubicDudosa: true`.
- **Foto en una obra sin orden:** se guarda como foto libre (reglas v125, verificado con `reglas_stub`) y avisa al supervisor de su orden de hoy, o a Administración/Oficina: «Juan Pérez sacó 5 fotos en SAN PABLO sin orden (tiene orden en BULEVARES)», uno por persona, obra y día.
- **Modo obra (v142):** «Llegué» con el GPS en otra obra registrada → «Estás en SAN PABLO. ¿Trabajás acá hoy?»: «Sí» = cámara en San Pablo como fotos libres (no se mezclan con las columnas de la orden; no anota la llegada) + aviso a la oficina; «No, voy a BULEVARES» = Cómo llegar.
- **Se guarda en cada foto** (`fotosObra` y `adjuntos`): `obraAuto`, `obraElegida` + `obraElegidaNombre`, `distObra` (m), `motivoOtra`, `ubicDudosa`. Las fotos de Mis tareas y del Modo obra también llevan `distObra` / `ubicDudosa`.
- **Supervisor (oficina, sin IA):** «N fotos de LAS ACACIAS se sacaron en BULEVARES» (la misma cuenta que `ubicar_fotos`: GPS contra el pin, 150 m; fotos de los últimos 3 días; no cuenta las de GPS impreciso) con **«Mover a …»** (pide «Sí»; los mismos cambios que `proponer_mover_fotos`: `fotosObra` + `adjuntos` con `movidaDe`; auditoría `supervisor_mover_fotos`) y **«Está bien»** (`ubicOk`, no vuelve a avisar). Y **«Obras sin ubicación cargada (N)»** con «📍 Cargar ubicación» (lleva al Mapa a poner el pin).
- Nada se mueve solo: las fotos viejas quedan donde están. Sin cambios en el sello, la cola sin señal ni la subida a R2.

**Cámara «opción B · cámara primero»**
- «Cámara» (menú, barra de abajo, `?camara=1`, ícono «Cámara EMA») abre **directo** la cámara de la app, sin la hoja «¿De qué obra?». Arriba la píldora con la obra (verde = tu orden; ámbar = otra obra o elegida a mano; «Elegí la obra» con GPS malo). Abajo «‹ Col 4 ›» (la siguiente columna sin foto de la tarea de la orden en esa obra, nombres de la obra; «3 de 8 con foto»), el deslizador de modos (Seguridad · Antes · Columna · Caja · Tablero · Acometida · Luminaria · PAT · Zanja · Después · Otra) con el tipo ya elegido por la tarea, el disparador grande, la miniatura de la última (con «🗑 La última» de la v107) y «Listo».
- **Caso normal = 1 toque** (disparar; contado en `t_v144`). Después de cada foto pasa sola a la columna siguiente. Tocar la píldora o el tipo abre la hoja de cambiar (estilo D: obra / «¿Qué vas a sacar?» con íconos / columna).
- Por dentro, lo de siempre: `guardarFotoObra` con el sello, `campo.fotos` de la orden si hay orden en esa obra (ahora con la tarea, así el Modo obra cuenta esas fotos), foto libre si no, cola sin señal y R2. Las fotos de Mis tareas y del Modo obra siguen igual (ya traen obra y columna).

**Nuestra zona (anillo del Inicio)**
- El contrato de EMA es solo el **Renglón 1 · Zona A (Este): 127 plazas, 18.407 módulos**. El anillo dividía por los 35.364 módulos de las 3 zonas. Ahora: K avanzado **solo de las plazas de la zona** (según el listado del pliego; barrios y «otras» no cuentan) ÷ 18.407; en el anillo «Zona Este» y debajo de la fecha «Zona A (Este): N de 127 plazas terminadas · X % de 18.407 módulos». En el Inicio no se muestra el total de la licitación.
- **«Nuestra zona: A · Este»** en el Itemizado (arriba de los renglones), editable solo por Administración, guardada en `configEquipo/precios.zonaContrato` (de entrada A); el total de la licitación (244 plazas · 35.364 módulos) queda ahí como dato aparte. El inicio viejo (solo mirar) también dice lo de la zona. El supervisor, el tablero y el asistente no usaban ese porcentaje (revisado). K, módulo e itemizado sin cambios.

**Estilo «V1 · Turquesa del logo»** (`estiloV1Css`)
- Paleta: turquesa del logo `#89C2DB` (solo detalles, nunca con letra blanca), turquesa hondo `#1E6F91` (acentos, links, barras), portadas en degradé `#17173D → #1F6F91` con brillo turquesa (Inicio Ejecutivo y «Hoy» de la cuadrilla; el Inicio del pañolero con los mismos acentos), botones principales navy (`#28285E → #1F5F86`), fondo `#EAF2F7`.
- Letra **Plus Jakarta Sans** en toda la app (también cámara, visor y hoja A4 en pantalla) y **JetBrains Mono** para números y códigos, **incrustadas** (woff2 latín en base64, `font-display:swap`, 58 KB de fuentes ≈ 80 KB más en el index): andan sin internet. A Google Fonts solo se le sigue pidiendo **Inter**, porque la usa el sello de las fotos (que no cambia) y las hojas A4 que se abren aparte. Chrome 80: fuentes variables woff2 y rango de pesos, sin nada nuevo.
- En el celu el título de la barra va en 13,5 px (Plus Jakarta es más ancha). No cambian ids, clases ni JS. La impresión A4 sigue blanca con su logo.

**Datos:** campos nuevos en `fotosObra`/`adjuntos` (ver arriba), `ubicOk` en `fotosObra`, `configEquipo/precios.zonaContrato`. **Sin reglas nuevas** (fotoLibre v125 y las de `avisosPush`/`fotosObra`/`adjuntos`/`precios` alcanzan; verificado con `reglas_stub`).

**Pruebas:** `t_v144` nueva (PC y celu, 43/43; datos en `datos144.js`, GPS simulado y cámara de mentira): en San Pablo con orden en Bulevares (cámara directa, píldora, cartel, 1 toque, foto libre con los campos nuevos en `fotosObra` y `adjuntos`, aviso a Lucía una sola vez); Modo obra en otra obra (No → Cómo llegar sin llegada; Sí → cámara en San Pablo sin orden + aviso); caso normal en Bulevares (1 toque, Columna · Col 1 de su tarea → `campo.fotos` con la tarea, pasa a Col 2); la lista (las suyas + donde está, sin las demás); elegir a mano otra obra (aviso, motivo obligatorio, `motivoOtra`, `distObra`); «Es otra obra» pide el motivo; GPS malo (`ubicDudosa`); sin señal (GPS sí, internet no: elige igual y sube al volver); Supervisor (Mover con «Sí» + `movidaDe` + auditoría; Está bien; obras sin ubicación → Mapa); cámara de la oficina con buscador; nuestra zona (solo la A: 4 plazas sobre 18.407; la B y el barrio no cuentan; cambiar a B la guarda y cuenta 9.131). Pruebas viejas: `__obraGpsNo` / `__camViejaNo` (salvo `obraGps:true` / `camaraB:true`). Capturas del estilo antes/después: `pruebas/cap_estilo_v144.js`. **Batería completa** de a 3 (146 pruebas en PC y celu): todo OK salvo `t_v083` (reemplazada por `t_v084`, como siempre) y `t_v136b` en PC (2/3, igual que en la batería de la v143: «compu: sin “Plazas” arriba», no es de esta versión). Tres pruebas viejas se ajustaron por el estilo nuevo, diciendo por qué en la misma prueba: `t_v090` acepta Plus Jakarta Sans como la letra de la app, `t_v136` acepta las tarjetas al 90 % de blanco, y `t_v122` toca «Hacer otra orden igual» desde la página (con el fondo quieto del estilo V1, el clic de Playwright se quedaba esperando un cuadro). Corridas de nuevo sobre el index final: `t_v144`, `t_circuito`, `t_v136`, `t_v142`, `t_v135`, `t_v139`, `t_v143`, `t_v033`, `t_v090`, `t_v122` (PC y celu) OK.

**Huellas:** ORIGINAL `ada8e7908cba61bc45deb46e9614c8014e640eb6240bf4f264ed566916407353` · index `e559ce3d7da69bd1586fcfc19e9b297a2a2231ea3519187a114c4c4452396b7e` · sello `2026-11-10 18:12 · aa3b66` (todas en `herramientas/v144/huellas.txt`).

**Qué tiene que hacer Ángel:** subir el `index.html` a GitHub. No hacen falta reglas nuevas, ni Worker, ni APK nuevo. Conviene cargar la ubicación de las obras que no la tienen (el Supervisor las lista): sin el pin, la app no puede saber si la foto se sacó ahí.

## v143 — 10/11/2026 (publicada en GitHub) · Orden sugerida: la app arma las órdenes de mañana (y de la semana)

**Pedido de Ángel** (10/11/2026, maquetas aprobadas): que la app arme sola las órdenes del día siguiente, que «cubra y mejore todo lo que ya veníamos haciendo con el personal, los puntos y todo eso» y que quede exacto. Después sumó: las tres vistas (por obra, por persona y semana), sus rendimientos reales, sábado medio día, fraguado 72 h igual en metálica y PRFV, equipo civil, vehículos por tipo y lugares, ausencias, misma cuadrilla hasta terminar la obra, estudio de tiempos («🧠 Lo que aprende la app»), recordatorio a las 7:00, plan para la inspección y la IA como capa encima (revisa y propone, no arma).

**Base:** ORIGINAL 142 (publicada, `93b3ccbd…`).

**Cambios en la app (Administración y Oficina, o quien edite Órdenes)**
- **La arma la app, sin IA** (costo cero) y **nunca emite sin «Emitir»**; nada se escribe en la base hasta ahí (los ajustes, con «Guardar»). Calcula de memoria, solo al abrir la tarjeta o la hoja; en la cuadrilla (entrada liviana) no corre.
- **Qué falta:** el mismo «Quedan N de T» de Llenar orden (`saldoObra`, que ya descuenta lo asignado en órdenes abiertas). Obra sin cálculo → «Sin cálculo: no puedo sugerir» con botón a la Calculadora. **Lo que quedó de ayer** (cerradas con menos de lo previsto): primero y con el porqué («se hicieron 6 de 8 en la OT-…»). Lo que sigue en una orden sin cerrar: aviso con «Cerrar esa» (no se cuenta dos veces).
- **Orden de obra** (cada regla con interruptor): pozo → hormigón; **fraguado 72 h** (dato de Ángel, metálica y PRFV; la fecha sale de la hora de cada base del Modo obra o del cierre; sin fecha no bloquea y avisa «no sé cuándo se hormigonó»); zanja → cable → tapado; izaje → vínculo → luminaria (y tablerito, aplomado, sellado); jabalina el mismo día que los tableritos. **Columnas concretas** («Col 9 a Col 12»).
- **Cantidades** = rendimiento × gente × jornada, con tope en lo que falta. **Según Ángel** (editable): zanja 100 m/día; cable = lo que haya de zanja abierta; pozos y hormigón de toda la obra el mismo día (más de 5 bases → «Pedir camión de hormigón»); izaje con grúa: todo la cuadrilla de 2 → 4–5, con el equipo civil antes y 3 → 13, con caño sin vínculo 6 (2) / 12 (3), solo con guía 3 (a confirmar); tablero 3–4 con 2 barquillas y 2 con una; el civil sella y aploma todas las izadas. Si no hay dato de Ángel: **lo medido** (3 cierres o más, de la hora de inicio y fin) o el **diccionario** (1/HH, a confirmar) o a mano. «Lo ideal: equipo civil antes → 13 por día» como sugerencia.
- **Gente:** la misma cuadrilla en la obra hasta terminarla (avisa si hay que cambiarla); el **equipo civil** (marca en la nómina) va aparte a la obra que más lo necesita; nadie en dos obras; avisa si alguien ya tiene orden ese día; **ausencias** (franco, vacaciones, licencia, enfermo, otro) no se proponen y se muestran; los libres en «Sin orden» con «Sumar a…».
- **Vehículos** por tipo y lugares: el izaje solo con la grúa libre (si está ocupada, no hay izaje y se avisa; sin tipos cargados tampoco); luminarias y vínculos con hidro chica o barquilla; tableros con barquilla; el civil con transporte; que entren todos.
- **Material:** la reserva de la obra contra el pañol («hay 1 y pide 4 → falta 3»), solo aviso. **Puntos estimados:** los mismos de Llenar orden (`__ordenNueva.puntos` = `puntosDeOrden`).
- **Pantallas:** tarjeta en el Inicio Ejecutivo todo el día («Mañana: N órdenes sugeridas», avisos, «Revisar y emitir»; después «Emitidas N de M») y línea arriba del tablero de Órdenes; hoja «Órdenes para mañana» con KPIs, **Por obra** (una tarjeta por obra con gente, vehículos, tareas, columnas, porqué, avisos, jornada usada/disponible y casilla para incluirla), **Por persona** y **Semana** (obras × días encadenados, en el celu un día por tarjeta deslizable; «Emitir el día»); **Cambiar** (sacar/sumar gente, − / +, ✕, sumar otra tarea, vehículos, «Volver a la sugerida», «Abrir en Llenar orden»); **Emitir las N** (resumen, «Avisar a cada uno al celu ahora», «Recordatorio a las 7:00»); **⚙ Ajustes**; **📤 Plan para la inspección** (A4 por obra: ID, dirección, tareas y cantidades, cuántos van y el responsable, vehículo y horario; sin puntos ni plata; Compartir / Bajar PDF); fecha libre para planificar con una semana de anticipación.
- **Emitir:** cada orden se carga en «Llenar orden» y sale por `emitirOrdenTrabajo`, igual que a mano (número OT, `personalNombres`, vehículo por persona, avisos, «una orden por obra y día» y los puntos al cerrar). Si una falla, lo dice y sigue con las otras.
- **Avisos:** el de siempre al emitir y un **recordatorio a las 7:00 del día** («Hoy: obra · tareas», con lo último de la orden) por `avisosPush` con `enviarDesde`, que manda el **Worker `ema-avisos` v143-hora**. Con el Worker viejo la app no deja el recordatorio; el celu de la cuadrilla con la app 1.4 lo programa solo.
- **🧠 Lo que aprende la app** (menú, debajo de Equipo; Accesos del Inicio; la hoja): ⏱ Tiempos (según Ángel / diccionario / medido / datos / diferencia, por personas y por cuadrilla, «✨ Informe del asistente») y 📦 Material (calculado vs. entregado del legajo por obra; «Próximamente: material real por columna y por tipo de obra», v144). El Supervisor suma una línea «Rendimientos» si lo medido se aleja 40 % o más.
- **Producción › Personal del equipo › «📋 Para la orden sugerida»:** 🗓 Ausencias (＋ Agregar, quitar con confirmación), 🦺 Equipo civil (marca por persona) y 🚚 tipo y lugares de cada vehículo. «Llenar orden» avisa si eligen a alguien ausente ese día (solo aviso).
- **El asistente, encima** (solo Administración y Oficina, o quien edite Órdenes): `ordenes_sugeridas` (lee lo que calcula la hoja), `proponer_ordenes_sugeridas` (cambios en lenguaje simple, aplicados con las mismas funciones que los botones; tarjeta antes → después con «Sí, emitir las N» / «Abrir la hoja» / «No»), `proponer_rendimiento` (Sí → Ajustes); chip «📋 Órdenes de mañana»; «sí, emitilas» por voz; «✨ Revisar con el asistente» (un solo pedido con la sugerida armada: «Está bien así» o una propuesta) y «💬 Pedile cambios al asistente». Cuadrilla, pañol y solo mirar no reciben estas herramientas.

**Datos (sin reglas nuevas):** `configEquipo/baremo.sugerida` (lo escribe quien edita Producción: Administración y Oficina); `configEquipo/personal.ausencias`, `nomina[].equipoCivil`, `vehiculos[].tipo/lugares` (Producción u Órdenes); `avisosPush` con `enviarDesde`. Verificado con `reglas_stub`.

**Supuestos «a confirmar»:** horas del diccionario; vínculo junto con el izaje en el modo civil; «solo con guía» (3 por día); acometida y preensamblado (sin número: se usa lo medido); inicio de la jornada de lunes a viernes 07:30 (solo para contar el fraguado); la frase «3 al día sin subir el cable, solo dejarían la guía» quedó como pregunta. No hay tareas en el diccionario para «limpieza de fundación / telgopor», «arena» ni «alistar el tablero en el galpón» (la sugerida solo avisa). El modo de izaje no queda guardado en la orden (lo medido se separa por cantidad de personas).

**Pruebas:** `t_v143` nueva (PC y celu, 78/78; datos en `datos143.js`): obra con y sin cálculo, lo que quedó de ayer, fraguado (bloquea con fecha; sin fecha avisa; igual en metálica), columnas siguientes, medido contra diccionario, modos de izaje 4/13/6/12/3, zanja 100 m con tope, cable limitado por la zanja, pozos y hormigón el mismo día con camión (> 5), jabalina con tableritos, sellado solo en las izadas, persona ocupada, ausencias (y su carga en Personal, y el aviso en Llenar orden), misma cuadrilla, sin vehículo, lugares, grúa ocupada, falta material, sábado de 5,5 h, semana encadenada, cambiar gente y cantidad, ajustes que se guardan, nada se escribe sin «Emitir», emitir 3 (números OT, avisos, `personalNombres`, recordatorio con `enviarDesde`), plan para la inspección, 🧠 Lo que aprende la app, igualdad con «Llenar orden» (documento y puntos al cerrar, y «Quedan»), `unaObra` («Sumar a la OT-…»), y el asistente con el Worker simulado (lee la sugerida, propone cambios = lo mismo a mano en la hoja, «Está bien así», propuesta aceptada, informe de rendimientos con `proponer_rendimiento`; cuadrilla y mirar sin estas herramientas). Prueba del Worker: `node workers/probar_ema_avisos.mjs` (7/7). Las pruebas viejas no ven la sugerida (`__sugNo`, salvo `sugerida:true`). `t_circuito` OK en PC y celu. **Batería completa** de a 3 (145 pruebas en PC y celu): todo OK salvo `t_v083` (reemplazada por `t_v084`, como siempre).

**Huellas:** ORIGINAL `caaf8cc3429997537a2b9acf87d0f67c9562af9f2403484a5ac96388b1cf8f93` · index `0570d541e3c906f4cd1d5e0c6e4143fc4656568d1179c64ebd0a3e596bb35bd6` · Worker `ema-avisos.js` `cbeb2f454c8a081a3d7a598ecd2c74e0e356746b2cfb3319e1c2e21b7f48a0d6` · sello `2026-11-10 15:04 · c56a78`.

**Qué tiene que hacer Ángel:** 1) subir el `index.html` a GitHub; 2) pegar el Worker `ema-avisos` nuevo (`workers/EMA-AVISOS_INSTRUCCIONES.md`, «Actualizar el Worker para la v143») para el recordatorio de las 7; 3) en Producción › Personal del equipo › «📋 Para la orden sugerida», marcar el equipo civil y cargar el tipo y los lugares de cada vehículo (sin la grúa cargada no se propone izaje). No hacen falta reglas nuevas ni APK nuevo.

## v142 — 10/11/2026 (publicada en GitHub) · La cuadrilla nueva: «Modo obra» con un solo botón y todo el recorrido del día

**Pedido de Ángel** (10/11/2026): llevar a la app el recorrido de la cuadrilla que aprobó en las maquetas (opción E «un solo botón»), con datos reales.

**Base:** ORIGINAL 141 (`c9266614…`).

**Cambios en la app (cuadrilla y operario; celu, app de Android y compu)**
- **Inicio «Hoy»**: portada azul con saludo, «con Pedro», tareas de hoy, avisos nuevos y puntos de la quincena; la obra del día con dirección, «📍 Cómo llegar» y «Ver la orden»; sus tareas; avisos nuevos. Reemplaza a la vista el Inicio de antes (que sigue en el DOM, escondido). «Hoy» de la barra de abajo lleva acá; Mis tareas de siempre sigue en «Ver lista completa».
- **La orden del día**: obra, quiénes van, vehículo, quién la sigue (oficina), tareas en orden con cantidades, la nota de la oficina y «Empezar».
- **Seguridad antes de arrancar**: casco, arnés, guantes, botines, conos y equipo revisado, con tilde y foto (de entrada foto obligatoria en conos y equipo; la oficina lo cambia por ítem) + el corte de energía de siempre. Sin todo, «Arrancar el día» no se prende, salvo «Arrancar igual (decí por qué)» (le avisa a la oficina). Se guarda en `campo.seguridad.<persona>` y llena también lo de antes (EPP, balizado, herramientas), así Mis tareas y la oficina siguen igual.
- **Antes de salir**: el material de la reserva de esa orden (o de la obra, o de los vales) con «✅ retirado» / «⚠ falta retirar (R-xxxx lista)»; herramientas sugeridas por tarea (tabla en el código, **a confirmar**, editable por la oficina) con quién tiene cada una; aviso del asistente armado sin IA; «Salimos» o «Salir igual (decí por qué)» → `campo.salida.<persona>`.
- **Cómo llegar**: mapa con el pin de la obra, la distancia desde el GPS y «Abrir en Google Maps».
- **Modo obra (opción E)**: un botón redondo que cambia solo: «Llegué» (GPS: «Estás en la obra» a menos de 150 m; `campo.llegada.<persona>`) → «Foto · Col N» (la cámara de la app con el sello y la guía «Columna entera en el cuadro») → «Foto guardada» (o «Sin señal: se sube sola») → «Terminé» (hora de inicio y fin con − / +, «Se hizo» / «No se hizo (decí por qué)») → pasa sola a la columna o a la tarea siguiente. Anillo de avance, rayitas por columna y los pasos abajo; «Falta material», «Ayuda» y «Llamar a la oficina».
- **Por dentro es lo mismo de Mis tareas**: fotos en `campo.fotos` con su columna, marcas por `__marcaEquipo`, horas en `campo.horasTarea`, envío por tarea en `campo.tareaEnv` y la orden se envía sola (`campo.enviados`, `campo.horas`). La hora de cada columna queda en `campo.pasosObra`. La oficina cierra igual (puntos y avance).
- **Falta material**: hoja con el material de la orden, se tilda qué y cuánto → aviso al pañol y a quien sigue la orden (o a la oficina) + `campo.faltaMaterial`; «Avisado ✓».
- **Ayuda**: «Preguntale al asistente» (se abre con «Estás en: Izaje · Col 7», el asistente lo recibe en el contexto y muestra «Te quedan N preguntas hoy» de la v141), «Ver cómo se hace» (la guía de la tarea de la carpeta `guias/`, paso 1, con ‹ ›, zoom y el material de la guía) y «Llamar a la oficina».
- **Llamar a la oficina**: quien sigue la orden primero, Administración, Oficina y Pañol con «📞 Llamar» y «💬 WhatsApp», y «Mandar mi ubicación» (WhatsApp con el link de Maps). Sin teléfono cargado: «Pedile a la oficina que cargue su teléfono» (no se inventa ninguno).
- **Fin del día** (lo hecho en verde, lo que no y por qué en rojo, unidades, fotos y horas, «Mandar a la oficina»), **Mis puntos** (la quincena por orden: aprobados / esperando cierre) y **Sin señal** (franja, lo que espera subir y «Probar ahora»).
- **Oficina**: en el «📸 Avance» de la orden y en el cierre aparece «👷 La cuadrilla en obra»: seguridad (con las fotos), salida (completa o «salió igual» con el porqué), llegada con la distancia al pin y falta material. En Producción › Personal del equipo, tarjeta «👷 La cuadrilla en obra»: teléfonos para la cuadrilla, foto de la seguridad por ítem y herramientas por tarea (`configEquipo/personal`: `contactos`, `seguridadCuadrilla`, `herrPorTarea`).
- El «atrás» del celu vuelve de cada pantalla del día; el control de permisos trata ese Inicio como Mis tareas (no salta el «🔒 no tenés permiso»).

**Decisiones**
- Contactos en `configEquipo/personal.contactos` (lo editan Producción/Órdenes): no hacen falta reglas nuevas.
- Herramientas por tarea: tabla en el código (`HERR_DEF`, marcada «a confirmar») que la oficina reemplaza por tarea en `configEquipo/personal.herrPorTarea`.
- La guía no tiene todavía la relación «tarea → paso»: abre la guía de la tarea en el paso 1.
- El aviso con el celu bloqueado (pantalla 3 de la maqueta) es la notificación de Android que ya existe (FCM/Web Push); en la app se ve en la campanita.

**Reglas:** no hacen falta nuevas (todo va en `campo` de la orden, `avisosPush` y `configEquipo/personal`; verificado con `reglas_stub`).

**Pruebas:** `t_v142` nueva (PC y celu, 49/49): el recorrido completo con la sesión de la cuadrilla, la cámara de la app (simulada), GPS simulado, falta material con aviso, ayuda, asistente (Worker simulado), guía, llamar con y sin contactos, fin del día, puntos, sin señal, «atrás», «Ver lista completa» y la oficina (Avance, cierre, puntos y avance del itemizado). Las pruebas viejas ven la cuadrilla de antes (`__crewViejo`, salvo `crew:true`). `t_circuito` OK en PC y celu (y también con `crew:true`, con Mis tareas desde «Ver lista completa»). Batería completa en PC y celu, de a 3 (144 pruebas): todo OK salvo `t_v083` (reemplazada por `t_v084`, como siempre); `t_v142` falló una vez dentro de la batería por tiempos (máquina cargada) y pasó sola 49/49 en PC y celu; con eso se arregló un caso real (la foto de la seguridad se perdía si la pantalla se redibujaba con la cámara abierta: los «📷» ahora viven fuera de lo que se redibuja). Después de ese arreglo se repitieron `t_v142`, `t_circuito`, `t_humo`, `t_cuadrilla`, `t_v123`, `t_v135`, `t_v138` y `t_v141` en PC y celu: todo OK. **Batería final** (después de los dos arreglos): 143 pruebas en PC y celu, todo OK salvo `t_v083`.

**Huellas:** ORIGINAL `93b3ccbd882cea763f51b9ec9e55f1af2b055a699411f6ad52ccb07eef0e411d` · index `80e8f78467cff8df247f80621aeae9c0dd99b5056e6cb011a175598546be379f` · sello `2026-11-10 12:59 · b84215`.

**Qué tiene que hacer Ángel:** 1) subir el `index.html` a GitHub; 2) en Producción › Personal del equipo › «👷 La cuadrilla en obra», cargar los teléfonos (y revisar las herramientas por tarea, que están «a confirmar»). No hacen falta reglas nuevas ni APK nuevo.

## v141 — 10/11/2026 (publicada en GitHub) · El Asistente por rol y topes para que los US$ 100 alcancen el mes

**Pedido de Ángel** (10/11/2026): que cada rol vea y pregunte solo lo suyo (oficina todo, pañol el pañol con precios de materiales pero sin sueldos, cuadrilla solo lo suyo y sin plata, solo mirar preguntas generales) y que haya topes por persona y un freno del mes para que los US$ 100 alcancen.

**Base:** ORIGINAL 140 (la publicada, `43e7fc5c…`).

**Cambios en la app**
- **De entrada el Asistente lo ven todos los roles** (Administración lo apaga por rol en ⚙ › Límites; con el modo de compatibilidad de las pruebas viejas sigue solo admin/oficina).
- **El filtro está en la app, no en el texto para la IA** (`alcance()` en el código dormido del asistente):
  - **Herramientas por rol** (lista cerrada): admin y oficina todas (como hasta ahora; oficina también ve sueldos y valor hora); pañol: el pañol (stock, movimientos, reservas, herramientas, catálogo con precios de materiales, cómputos), obras en general, PDFs de stock/compras/comprobantes/reservas y sus propuestas del pañol; cuadrilla y operario: sus órdenes (sin los nombres de los demás), los datos, planos y cómo llegar a SUS obras, el stock sin precios, SUS puntos y «cómo se hace»; solo mirar: obras en general (avance, ubicación), «cómo se hace» y normas.
  - **Cada resultado se limpia antes de ir al modelo:** sin valor hora, sueldos, valor del punto, K/módulo, importes, gastos ni ganancia (y sin costos ni precios para la cuadrilla y solo mirar); lo que no puede ver vuelve como «Eso no lo puedo ver con tu usuario, preguntale a la oficina.».
  - **System por rol** con lo que no ve y esa respuesta exacta (no inventa).
  - **Herramienta nueva `como_se_hace`**: busca en las guías «Cómo se hace» (paso a paso, EPP, materiales con código, control, normas) y en Normas y tipos constructivos.
  - Atajos y ejemplos del panel según el rol.
- **Modelo por rol:** pañol, cuadrilla, operario y solo mirar → Sonnet 5.5 con effort «low»; admin y oficina siguen con Opus 5.5 (dato simple → low). Los remitos siguen con Opus.
- **Topes (los controla el Worker; la app solo los muestra):**
  - chip **«Te quedan N preguntas hoy»** en el panel (de `/mio` al abrir y de cada respuesta);
  - **cartel** «Por hoy, listo» / «Asistente en pausa» cuando el Worker dice `tope_dia`, `tope_remitos`, `tope_mes` o `rol_apagado` (no un error rojo); el remito con IA también lo muestra y ofrece cargarlo a mano;
  - **⚙ › Límites** (solo Administración): prender/apagar por rol, preguntas y remitos por día por rol (vacío = sin tope), freno del mes (tope US$, pausa %, corte %), el detalle por persona (hoy y mes) — se guarda en `configEquipo/personal.asistente.limites` y `.roles` (auditoría `asistente_limites`);
  - **«Gastado este mes: US$ 23,40 de 100 · preguntas … · remitos … · supervisor …»** en ⚙ (Administración y Oficina) y en menú › Versión, del Worker (`/uso`);
  - al cruzar el freno del mes, **aviso al celular de Administración** (una vez por mes);
  - si el Worker es el viejo, la app no se rompe: avisa una vez a admin/oficina que hay que pegar el nuevo.
- Cada pedido lleva `ema.tipo` (`pregunta`, `remito`, `supervisor`) para que el Worker los cuente aparte.

**Worker `ema-ia` v3-ia** (`workers/ema-ia.js`):
- **El rol lo lee el Worker de la base**, con el mismo token de la persona (`usuarios/{uid}`: rol, activo, pendiente) y los límites de `configEquipo/personal` (por REST, guardados 10 min). El rol que mande la app se ignora. Usuario dado de baja o «a confirmar» → no pasa.
- **Topes por persona y día** (Argentina): admin sin tope · oficina 30 (+ 40 remitos) · pañol 20 + 40 remitos · cuadrilla, operario y mirar 10. Pregunta = el último mensaje es texto de la persona (las vueltas de herramientas de esa pregunta no suman). Remito = foto/PDF sin herramientas con `ema.tipo:"remito"` (varias hojas = 1). Supervisor de admin/oficina: no cuenta, suma al gasto.
- **Freno del mes** (suma de `ema.costoUsd`): al 80 % de US$ 100 se pausan pañol, cuadrilla, operario y mirar (y la respuesta trae `freno.avisar` una vez); al 95 % se corta para todos menos admin; el día 1 empieza de cero.
- Errores en castellano: `tope_dia` («Llegaste a tus 10 preguntas de hoy. Mañana se renuevan.»), `tope_remitos`, `tope_mes` («El asistente llegó al tope de gasto del mes. Se renueva el día 1.»), `rol_apagado`, `usuario`.
- Rutas nuevas: `GET /uso` (solo admin u oficina según la base) y `GET /mio`; `/salud` con `version:"v3-ia"`, `gastoMes`, `tope`, `kv`.
- Se mantiene todo lo de la v2b (reintento ante 400 con `detalle`, modelos, respaldo, la clave nunca aparece). Sin KV cuenta en memoria (lo dice `/salud`); si el KV se queda sin escrituras, sigue con la memoria.
- Instructivo: sección nueva «⚡ Actualizar el Worker para la v141» en `workers/EMA-IA_INSTRUCCIONES.md`.

**Reglas:** no hacen falta nuevas (verificado en `Reglas_Firestore_v128`: `usuarios/{uid}` lo lee cada uno; `configEquipo/personal` lo leen los confirmados y lo escribe quien edita Producción u Órdenes, o sea Administración; `avisosPush` lo crea cualquier confirmado).

**Pruebas:** `t_v141` nueva (PC 44/44, celu 44/44): cada rol con el Worker simulado — cuadrilla (lengüeta de entrada, chip «Te quedan 9/7 preguntas hoy» de `/mio` y de la respuesta, solo sus herramientas, Sonnet low con `ema.tipo`, pregunta el valor hora y la nómina nunca va al modelo, responde «Eso no lo puedo ver…», solo sus órdenes sin nombres ajenos, stock sin precios, obra ajena no / la suya sí, solo sus puntos, «cómo se hace», cartel de `tope_dia`, aviso del freno a Administración una sola vez), pañol (sus herramientas y colecciones, no ve la nómina pero sí precios de materiales, sin precios del itemizado ni gastos, remito con Opus y `ema.tipo:"remito"` y cartel de `tope_remitos`), solo mirar (solo lo general, sin pañol ni órdenes), oficina (todo, ve el valor hora, «Gastado este mes» sin Límites), admin (todas las herramientas, aviso del Worker viejo una vez, ⚙ Límites con los valores de entrada, detalle por persona, guarda roles y límites sin tocar la nómina, no deja pausa > corte, menú › Versión). Worker: `node workers/probar_ema_ia.mjs` 97/97 OK (rol leído de Firestore con el token de la persona y guardado, topes por rol y día, vueltas de herramientas que no suman, remitos aparte, supervisor, rol apagado, usuario de baja, freno 80/95 con aviso una vez, reinicio de mes, tope configurable, `/uso` solo admin/oficina, `/mio`, rol falso ignorado, Firestore caído, KV sin escrituras, la clave nunca aparece). Batería completa en PC y celu sobre el index entregado (de a 3, 143 pruebas): todo OK salvo `t_v083` (reemplazada por `t_v084`, como siempre).

**Capturas** (`v141/capturas`, celu y PC): `v141_queda` (chip «Te quedan»), `v141_cuadrilla_no_ve` («Eso no lo puedo ver…»), `v141_tope` (cartel de tope), `v141_limites` (⚙ Límites).

**Huellas:** ORIGINAL `c9266614…c4` · index `a51fc6b9…bc1d` (sello `2026-11-10 10:34 · 006512`) · Worker `d06a9b21…ab04` · ver `herramientas/v141/huellas.txt`.

**Qué tiene que hacer Ángel:** 1) pegar el Worker nuevo `ema-ia` (v3-ia) y ver `/salud` → `"version":"v3-ia"` (instructivo, «Actualizar el Worker para la v141»); 2) subir solo `index.html` a GitHub cuando decida publicarla. Sin reglas nuevas, sin APK nuevo. Conviene dejar el tope de Anthropic un poco arriba del de la app (ej. US$ 110).

**A confirmar con Ángel:** los remitos por día de Oficina (puse 40, igual que Pañol; el pedido no lo decía) y si la cuadrilla debe poder ver el avance general de obras que no son suyas (hoy: solo `buscar_obra` con el %; datos, planos y ubicación solo de sus obras).

## v140 — 10/11/2026 (publicada en GitHub, commit 4f22b67) · Remito «inteligente»: sabe qué ya se cargó y propone completar lo que falta

**Pedido de Ángel** (10/11/2026): «Si el remito ya está puesto, me tendría que decir: este remito o esta factura ya fue registrada antes, ¿seguir o no seguir? O que me diga: este remito fue cargado pero no todo, se cargó hasta aquí, ¿cargamos lo que no se cargó? O se cargó todo pero no el precio, ¿cargamos el precio? Hacerlo más pro.» Además (arreglo chico): en el Asistente, después de dictar con el 🎤 o en modo charla y enviar, el texto volvía a aparecer escrito en la caja.

**Base:** ORIGINAL 139 (la publicada, `0b9dbaba…`).

**Cambios**
- **Remito «inteligente»** (bloque nuevo dentro de `remitoFoto`; fuente en `herramientas/v140/remito140.js` y `.css`, con ganchos chicos en el código de la v138):
  - **Reconoce el remito ya cargado, aunque se haya cargado a mano.** Clave = proveedor + número normalizados: sin espacios, puntos, guiones ni letras, sin ceros adelante de cada parte y sin tildes («0001-00012345» = «1-12345» = «N° 0001.00012345»); proveedores parecidos cuentan como el mismo («Richetta» = «RICHETTA S.A.», sin S.A./SRL/tildes; prefijo o una o dos letras de diferencia). **El proveedor tiene que coincidir:** el mismo número de otro proveedor es otro remito (sale como nuevo).
  - Busca en las entradas de `movimientos` (las de la IA y las de «Registrar movimiento»: campos `proveedor` y `remito`; no anuladas, sin devoluciones ni correcciones; en memoria, sin lecturas de más) y en los resúmenes `adjuntos` `tipo:"remitoRes"` (por `numN` y, los de la v138, por su `clave`). Los resúmenes nuevos guardan también `numN` y `provN`.
  - **Renglón por renglón**, por código del pañol (después de proponer los códigos como siempre; si un código se repite, lo cargado se reparte en orden): ✅ **Ya cargado** (cantidad igual o mayor y con precio) · 🟠 **Cargado a medias** («se cargaron 40 de 100 → faltan 60») · 💲 **Cargado sin precio** (cantidad completa, `precioUnit` vacío o 0, y el precio todavía no se puso desde este remito) · 🆕 **No se cargó** · 🔴 **Sin código** (como hoy).
  - **Cartel arriba** (`.card` de aviso, borde verde o naranja, chips de estado con color):
    - Todo cargado: «🧾 Este remito ya se cargó completo el dd/mm por <quién> (E-0012 a E-0018)» con «Ver lo cargado» (las entradas con N°, cantidad, precio, cuándo, quién, «con la IA / a mano» y «🧾 Ver»), «Cargar igual» (la tarjeta de siempre) y «Cancelar».
    - Falta algo: «🧾 Este remito ya se cargó en parte el dd/mm: 1 de 4 renglones. Faltan 2 renglones (1 a medias) y 1 sin precio.» con **«➕ Cargar solo lo que falta»**, «💲 Solo los precios que faltan», «Revisar renglón por renglón», «Ver lo cargado» y «Cancelar».
  - **«➕ Cargar solo lo que falta»:** entradas solo por la diferencia de los 🟠 y por los 🆕 (mismo remito y proveedor, `completaRemito` {estado, cargadoAntes, enRemito}), y el precio de los 💲 al catálogo (`costo`, `costoFecha`, `costoFuente` como «Solo precios»; si el remito es más viejo que el precio guardado, no lo pisa). Los ✅ no se tocan: **nunca se duplica stock sin que la persona lo elija.**
  - **«💲 Solo los precios que faltan»:** la hoja de «Solo precios» de la v138 con los 💲 tildados; el remito más viejo que el precio actual sigue avisando y queda destildado.
  - **«Revisar renglón por renglón»:** la tarjeta editable de siempre con cada renglón marcado con su estado y tildado según la propuesta (✅ destildados, 🟠 con lo que falta, 💲 con «Poner el precio en el catálogo», 🆕 tildados); tildar un ✅ avisa «se duplica». «Sí, cargar lo tildado».
  - Al completar: el resumen `remitoRes` se actualiza, o se crea si el remito venía de una carga a mano (`deCargaManual`), con historial «completado el dd/mm por X: +N renglones, M precios»; auditoría `remito_completar` (`porAsistente:true`). «Remito nuevo» y «💲 Solo precios» siguen igual que en la v138 (con su aviso de repetido).
- **Dictado del Asistente** (`asistenteIaCod`): cada dictado es una «sesión». Al enviar se corta en seco (`abort()` del navegador; `stop()` + `removeAllListeners()` del plugin de la app 1.4) y cualquier resultado que llegue tarde de una sesión vieja se descarta: la caja queda vacía. En modo charla, el envío automático vacía la caja y no se vuelve a llenar. Si el reconocedor pega el texto dos veces («hola che hola che»), queda una sola vez.
- **Reglas:** no hacen falta nuevas (verificado: `adjuntos` create/update, `movimientos` y `catalogoProductos` los edita quien edita el pañol).

**Pruebas:** `t_v140` nueva (PC 39/39, celu 41/41): normalización; remito nuevo; mismo número de otro proveedor → nuevo; cargado a mano sin precio → «Solo los precios que faltan» (el más viejo avisa, sin mover stock, resumen creado con historial); cargado completo con la IA (cartel, Ver lo cargado, Cargar igual, Cancelar); cargado a mano en «Registrar movimiento» con «1-12345» y la foto «0001-00012345», a medias (✅ 🟠 💲 🆕 🔴, revisar, «Cargar solo lo que falta»: 1010 × 60 y 3053 × 10, sin duplicar, precio del 💲, resumen e historial, auditoría; leído otra vez = completo); dictado con resultados tardíos del navegador, del plugin y en modo charla (la misma prueba sobre la v139 marca el error). Batería completa en PC y celu sobre el index entregado (de a 3, 142 pruebas): todo OK salvo `t_v083` (reemplazada por `t_v084`, como siempre).

**Capturas** (`v140/capturas`, celu y PC): `v140_1_completo`, `v140_2_a_medias`, `v140_3_sin_precio`, `v140_4_tarjeta_estados`.

**Huellas:** ORIGINAL `43e7fc5c…53ce` · index `43301502…9a83` (sello `2026-11-10 09:18 · b51ec1`) · ver `herramientas/v140/huellas.txt`.

**Qué tiene que hacer Ángel:** subir solo `index.html` a GitHub cuando decida publicarla. Sin reglas nuevas, sin APK nuevo, sin tocar los Workers.


**Nota (al publicar):** `t_v136b` PC fallaba desde la v139 por cómo medía (tomaba `.ie-col`, que en la compu ahora es `display:contents` y mide 0). Se ajustó para medir la primera tarjeta `.ie-tarj`: 3/3 OK. No era un error de la app.

## v139 — 10/11/2026 (publicada en GitHub, commit 8cc5ef3) · La app ocupa toda la pantalla en la compu

**Pedido de Ángel** (10/11/2026): «revisá cómo se adaptan las pantallas nuevas a la compu, la idea es que ocupe toda la pantalla».

**Base:** ORIGINAL 138 (la publicada, `a52024ac…`).

**Cambios** (solo con más de 900 px de ancho; en el celular y hasta 900 px no cambia nada). Hoja nueva `<style id="v139PcCss">` y script chico `<script id="v139Pc">`, antes de `revisarAppDiag`. No cambian ids, clases ni el JS de antes.
- **Inicio Ejecutivo a todo lo ancho:** la portada azul ocupa el área de contenido con 28 px de margen y puntas redondeadas (tope 2200 px). Adentro: saludo a la izquierda, los 3 KPIs más anchos al medio, el anillo del contrato a la derecha y el buscador abajo. Las tarjetas (Para atender · Supervisor · En obra ahora · Órdenes de hoy · Accesos · Obras) van en columnas tipo masonry, sin huecos: 2 hasta 1200 px, 3 entre 1200 y 1700 px y 4 desde 1700 px.
- **Perfil en columnas:** a la izquierda la persona y los KPIs; al medio «Tus ajustes»; a la derecha «La app» y «Cerrar sesión» (2 columnas entre 900 y 1200 px). Tope 1400 px.
- **Asistente:** panel lateral derecho de alto completo, de 480 px. Se puede ensanchar o angostar arrastrando su borde izquierdo (entre 420 y 760 px; doble clic vuelve a 480; queda guardado en el aparato). Desde 1240 px el contenido de la app se corre a la izquierda y queda a la vista; entre 901 y 1239 px el panel flota encima. En el celular sigue a pantalla completa. El menú lateral se sigue abriendo por encima.
- **El resto de las pantallas** (Pañol, Producción, Órdenes, Avance, Informes, Gastos, Obras…): ancho de hasta 1960 px con 32 px a los costados (antes el tope era 1280 px). El header, el footer y la barra de pestañas van con el mismo ancho. Las tablas y las filas de KPIs ocupan todo ese ancho.
- **Formularios:** «Llenar orden» y la Calculadora ya iban en 2 columnas (formulario + resumen/resultado): quedan igual. «Registrar movimiento» quedó en una columna: sus campos están sueltos en el HTML y para partirlos en 2 columnas habría que agruparlos con JS/HTML (anotado, no se tocó).
- Sin scroll horizontal en 1024, 1280, 1440, 1600, 1920 y 2560 px. Compatible con Chrome 80: sin `:has()` y sin `gap` en flex (se usó grid y `column-count`).

**Pruebas:** `t_v139` nueva. En PC (44/44): sin scroll horizontal en las 12 pantallas a los 6 anchos; el Inicio usa el 96,5 % del ancho a 1600 y el 97,1 % a 1920, con 3 y 4 columnas (2 a 1024); la portada en una fila; tope 2200; Perfil en 2 y 3 columnas; `.wrap` de Pañol de 1600 px a 1600 y de 1960 px a 2560; Asistente de alto completo a la derecha, 480 px, sin tapar el botón del menú, el contenido al lado, arrastre y doble clic, tope, menú por encima, flota a 1024; a 900 px el Inicio y el Perfil miden igual que antes. En el celu (9/9): el Inicio, el Perfil, el Pañol y el Asistente abierto miden igual con la hoja nueva prendida y apagada. Batería completa en PC y celu sobre el index entregado (de a 3): todo OK salvo `t_v083` (reemplazada por `t_v084`, como siempre). `t_v132` PC pedía el panel del Asistente de 440 px o menos: ahora mide 480 y se puede ensanchar, así que la prueba acepta 420–760 (29/29). `t_v092u` celu falló una vez por tiempos con la máquina cargada y sola da 19/19.

**Capturas** (antes y después, 1600×900 y 1920×1080): inicio, perfil, el asistente abierto sobre Obras, pañol, producción, órdenes (tablero y «Llenar orden») y avance, más el montaje `antes_despues.jpg`.

**Huellas:** ORIGINAL `0b9dbaba…eb66` · index `24fac20b…eb1f` (sello `2026-11-10 00:17 · 57fb3c`) · ver `herramientas/v139/huellas.txt`.

**Qué tiene que hacer Ángel:** subir solo `index.html` a GitHub cuando decida publicarla. Sin reglas nuevas, sin APK nuevo, sin tocar los Workers.

## v138 — 10/11/2026 (publicada en GitHub, commit f01a0a8) · El botón «atrás» vuelve atrás + remito en PDF, de varias páginas, «Solo precios» y «Remitos cargados»

**Pedido de Ángel** (10/11/2026)
- Que el botón «atrás» del celular (y la flecha del navegador / el botón del mouse) vuelva atrás como en cualquier app.
- Remito con IA: aceptar también PDF (los que llegan por mail/WhatsApp), varias fotos de un mismo remito en un solo pedido y remitos largos (20–40 renglones) sin cortarse.
- Remito con IA: modo «Solo precios» (sacar precios de remitos viejos sin mover stock) y un historial «📜 Remitos cargados», con aviso si se repite un remito.

**Base:** ORIGINAL 137 (la publicada, `cbe62a3b…`).

**Cambios**
- **Módulo nuevo `atrasApp`** (antes de `revisarAppDiag`). Una entrada de la historia por nivel: cada pantalla después del Inicio y cada cosa abierta encima. `history.pushState({ema:{n}})` al abrir (casi siempre dentro del toque); si se cierra con su ✕ o se va al Inicio por otro lado, se consume sola (`history.go(-k)` en silencio): no quedan entradas fantasma.
  - «Atrás» cierra lo de más arriba con la **misma función que su ✕**: menú lateral (`cerrarMenuLateral`), Asistente (`[data-ia=volver]`: primero las Opciones, después el panel), cámara, galería (`emaGaleria`), hoja A4 (`hojaEMA.cerrar`), hoja del celu, visor de planos (`cerrarPlano`), cierre de la orden (`cerrarCuadroCierre`), legajo abierto (← Todas las obras), orden abierta de Mis tareas, guía abierta, ficha de plaza, ganancia de una obra; y **cualquier otra ventana u hoja fija** (`.v7-ov`, `role=dialog`, ids …Ov/…Hoja/…Visor/…Modal/…Pop/…Edit: `#mfVisor`, `#spHoja`, `#rfOv`, `#esOv`, `#etOv`, `#v7Preg`, `#ecElegir`, `#sgEdit`, `#peOv`…) por su botón ✕/Cerrar, o tocando el fondo, o Escape.
  - Sin nada encima, vuelve a la pantalla anterior (`mostrarVista`), en orden. Ir y volver a una pantalla que ya estaba no apila (Obras → Pañol → Obras = Obras). Las pantallas vuelven como se dejaron (con su subpestaña; las subpestañas no son entradas de la historia).
  - En el Inicio sin nada encima no queda historia: en el APK `canGoBack()` da falso y `MainActivity` manda la app al fondo como hoy; en la compu el navegador sale de la página. **No hace falta APK nuevo.**
  - **«¿Salir sin guardar?»** (hoja Cristal propia `#atPreg`, Sí / No, nunca `confirm()`): en «Llenar orden» con alguna tarea tildada, tarea a mano, notas o materiales; en «Registrar movimiento» con producto, cantidad o filas cargadas; en el cierre de la orden si la persona tocó algo. «No» se queda y vuelve a poner la entrada. **Calculadora: no pregunta** (el formulario siempre tiene valores y no hay forma segura de saber si el cálculo ya se guardó).
  - Se apagaron los `pushState`/`popstate` sueltos de `appCelular` (pantallas y menú), visor de planos, hoja del celu, cámara, galería y hoja A4: ahora todo pasa por `atrasApp`. La dirección se respeta (`?doc=`/`?obra=` de la v137 siguen andando y limpian la dirección con `replaceState`).
  - `window.__atras` {sync, estado, capas, sucia, preguntar, pasoAtras}. `window.__atrasNo` lo apaga; `__atrasNoPreguntar` saca la pregunta.
- **Remito con IA (`remitoFoto`):**
  - «Elegir fotos o PDF» (`accept="image/*,application/pdf"`, varias). El PDF va a Claude como bloque `document` (base64, `application/pdf`); tope 3,5 MB y 20 páginas (el Worker acepta pedidos de hasta 5 MB y el base64 suma un tercio); si es más, «mandalo en partes» y no se manda nada. En el Asistente, «cargá este remito» abre la misma hoja.
  - Varias fotos del mismo remito (hasta 4) en **un solo pedido** → una sola tarjeta con todos los renglones; la IA junta las páginas en un JSON.
  - `max_tokens` 16.000 con Opus/Fable (antes 8.000; Sonnet sigue en 4.000, el tope del Worker). Si igual se corta (`stop_reason: max_tokens`), pide mandarlo en partes.
  - Tarjeta con resumen arriba («30 renglones · 20 🟢 · 0 🟡 · 10 🔴», páginas o PDF) y «Sí, cargar entrada» **pegado abajo** (sticky), siempre a la vista.
  - Al guardar: cada foto queda como adjunto (`fotoId` = la primera, `fotoIds` todas); el PDF se guarda como adjunto si pesa hasta 650 KB (un documento de Firestore); si no, se avisa que queda en el mail o WhatsApp.
  - Los códigos siguen saliendo solo del catálogo: nada se inventa.
  - **«💲 Solo precios»** (se elige al abrir el remito, junto a «📦 Cargar entrada»): para remitos viejos que nunca se cargaron. Misma lectura y misma propuesta de códigos (🟢/🟡/🔴). Por renglón: código del pañol, precio actual (costo del catálogo con su fecha: `costoFecha`, o la de la última entrada con ese precio, o la del último cambio) → precio nuevo **sin IVA** (con la moneda, el IVA y, en U$S, el dólar del día, igual que «Registrar movimiento»), con casilla. Si el remito es más viejo que el precio guardado: aviso amarillo y destildado. Si cambia más de 50 %: «revisá». Con «Sí, actualizar precios» → `fbGuardarProductoCatalogo` con `costo`, `costoFecha` (= fecha del remito), `costoFuente` («remito <proveedor> <número>»), `editadoPor`/`editadoTs` (+ `costoTs`, para saber si después el costo se cambió por otro lado). **Sin movimientos** (el stock no se mueve). Auditoría `remito_precios` con `porAsistente:true`. Nota: «Pañol › Precios» además anota un movimiento «solo precio» de cantidad 0; acá no se hace, como pidió Ángel.
  - **«📜 Remitos cargados»** (Pañol › Registrar movimiento, al lado de «📷 Cargar remito con foto», y en la hoja del remito): fecha del remito, proveedor, número, modo, renglones, total, quién y cuándo. Filtros: buscar (proveedor, N°, producto, E-…), proveedor y fechas. Tocar uno: los renglones con su código, los E- de las entradas o el precio antes → después, lo que quedó afuera, «🖼 Ver foto» / «📄 Ver PDF» y «🖨 Imprimir / PDF» (hoja A4 de la app).
    - **Sin colección ni reglas nuevas:** cada remito deja un **resumen liviano en `adjuntos`** con `tipo:"remitoRes"` (sin imagen: proveedor, numero, fecha, modo, moneda, conIva, total, renglones [{desc, cant, un, precio, codigo, grado, mov | precioAntes, precioDespues}], movimientos, fotoIds, por, ts, `mes` y `clave`). Va aparte de la foto (que sigue como `tipo:"remito"`, como en la v137) para que la lista no baje ninguna imagen y ningún documento se acerque a 1 MB.
    - Se lee **por mes** (`where tipo == "remitoRes"` + `where mes == "AAAA-MM"`, 3 meses y «Ver más»): solo igualdades, así **no hace falta crear un índice compuesto** en Firebase (un `orderBy ts` con `where tipo` sí lo pediría). Los remitos cargados con la v137 no tienen resumen y no aparecen.
    - **Remito repetido:** si el mismo proveedor + número ya se cargó (`clave`), «Este remito ya lo cargaste el dd/mm (Entrada/Solo precios)» con «Ver» / «Cargar igual» / «Cancelar» (al leerlo y otra vez al confirmar si se cambió el número).
- **Worker `ema-ia`: no se tocó** (deja pasar los bloques de `messages` tal cual; el tope de 5 MB por pedido manda el límite del PDF).

**Pruebas:** `t_v138` (PC 68/68, celu 69/69; también con las reglas simuladas): cada tipo de capa se cierra con «atrás», pantallas en orden, Inicio sin historia, «¿Salir sin guardar?» (Sí/No) en Llenar orden y el cierre, ✕ sin entradas fantasma, `?doc=`; remito en PDF, 3 fotos, 30 renglones, botón pegado abajo, PDF grande/largo; «Solo precios» (pesos y U$S, más viejo, «revisá», sin movimientos, auditoría), remito repetido (Ver / Cargar igual / Cancelar) y «Remitos cargados» (lista, filtros, detalle, imprimir). Batería completa en PC y celu sobre el index entregado: todo OK salvo `t_v083` (reemplazada por `t_v084`, como siempre) y `t_v056` PC, que recargaba la página en el mismo instante en que «atrás» consumía la entrada de la ventana recién cerrada: se le agregó una espera de 0,4 s antes de recargar y da 14/14 en PC y celu.

**Huellas:** ORIGINAL `a52024ac…2de6` · index `3bafe31a…4597` (sello `2026-11-09 23:22 · f6e469`) · ver `herramientas/v138/huellas.txt`.

**Qué tiene que hacer Ángel:** subir solo `index.html` a GitHub cuando decida publicarla. Sin reglas nuevas, sin APK nuevo, sin tocar el Worker.

## v137 — 09/11/2026 (publicada en GitHub, commit ed8ecaa) · Remito por foto con IA, lector de códigos (EAN y QR) y QR en los comprobantes

**Pedido de Ángel** (09/11/2026)
- Cargar un remito o una factura sacándole una foto: la IA lo lee y arma la entrada para revisar.
- Lector de códigos de barras (EAN) y QR; asociar el código de barras a cada producto; QR en las herramientas.
- QR en todos los comprobantes e informes, que abra el documento en la app.

**Base:** ORIGINAL 136b (la publicada). Después Ángel sumó: dictado en vivo con la onda de rayitas y un Asistente más «vivo».

**Cambios** (módulos nuevos `qrLib`, `codigosQr`, `remitoFoto`, `iaOndaCss`; reemplazos chicos: `hojaPdf.abrir` llama a `__qrHoja`, `hojaReserva` pone `__qrReserva`, y en el código dormido del asistente `asistenteIaCod` la voz, la búsqueda de obras, el system y el effort)
- **📷 Cargar remito con foto** (Pañol › Registrar movimiento con «Entrada», y en el panel del Asistente: chip y «cargá este remito»). Solo quien edita el pañol (admin, oficina, pañol).
  - Foto con la cámara (en la app de Android por el plugin `Camera`) o de la galería; se achica a 1600 px JPEG.
  - Va al Worker `ema-ia` como el asistente: Opus 5.5, la imagen en un bloque `image`, effort «medium», con el respaldo del servidor. Con el Worker viejo, Sonnet 5.5 (el mismo respaldo de la v136).
  - La IA **solo transcribe**: proveedor, número, fecha, moneda, si los precios traen IVA y cuánto, y por renglón la descripción tal cual, cantidad, unidad, precio unitario y EAN si se ve.
  - Los códigos los busca la app en el catálogo (palabras + rasgos de `__alternativas` + EAN asociado), hasta 3 candidatos: 🟢 seguro · 🟡 parecido · 🔴 sin código. **No inventa códigos ni da de alta productos**: el renglón sin código queda afuera («sin código: elegilo o dejalo afuera») con el desplegable y «🔎 Buscar otro en el catálogo…». Si el remito viene en otra unidad y el pañol sabe cuánto trae cada unidad (`porUnidad`), se pasa; si no, avisa «revisá la cantidad».
  - Tarjeta editable (lo que dice el remito → el producto del pañol): proveedor, remito, fecha, moneda/IVA/dólar, y por renglón código, cantidad y precio; «✕ Sacar este renglón»; «Sí, cargar entrada» / «No».
  - Con el Sí: una entrada por renglón por `fbAddMovimiento` (cada una con su número E-, como «Registrar todas las filas»), precioUnit en $ sin IVA + `precioOriginal`, `moneda`, `ivaPct`, `cotizacion`; la foto del remito por `fbAdjuntoGuardar` (R2 si se puede, si no `adjuntos`) con `fotoId` en cada renglón; costo al catálogo si se deja tildado; auditoría `remito_ia` con `porAsistente:true`.
  - Foto que no se lee: lo dice y pide otra (no llena nada). Sin señal o Worker caído: mensaje claro y la carga a mano sigue igual.
- **Lector de códigos:** el de la app de Android (ML Kit, `__escanear`, app 1.3+); en el navegador, `BarcodeDetector` con la cámara si existe; si no, escribir el número.
  - «📷 Escanear» en Pañol › Catálogo y en Herramientas. Producto conocido → su ficha (stock, «➖ Hacer vale de salida», «➕ Entrada»). Desconocido → «¿A qué producto corresponde?» con el buscador del catálogo, y lo asocia. QR de herramienta → su ficha con «Asignar» (entregar) / «Devolver». QR de comprobante → el comprobante.
  - Ficha del material: bloque «🔗 Código de barras» con los asociados (✕ para sacar) y «🔗 Asociar código de barras».
  - Se guarda en `catalogoProductos/{codigo}.ean` (lista) con `editadoPor` y `editadoTs`, por `fbGuardarProductoCatalogo`. Un EAN no queda en dos productos: avisa y pregunta «¿Lo pasás?». Auditoría `producto_ean`.
- **🏷 Imprimir etiquetas QR** (Herramientas): se eligen cuáles; hoja A4 con QR, código H-xxx y nombre.
- **QR en los comprobantes:** QR chico arriba a la derecha (solo QR, sin código de barras) en vales S-, entradas E-, devoluciones D-, remitos de herramientas RH- e ingresos RI-, reservas R- (uno en cada hoja) y órdenes OT-; en los informes de una obra, al legajo. Se arma en el aparato (qrcode-generator 1.4.4 de Kazuhiko Arase, MIT, adentro de la app) como imagen: sale en pantalla, impreso y en el PDF. El formato de los comprobantes no cambia.
- **`?doc=` / `?obra=`:** `…/alumbrado-stock/?doc=S-0001` (y `OT-…`, `R-…`, `H-…`, `RH-…`, `RI-…`, `?obra=<id>`) abre, después de entrar y con los permisos de cada uno, el comprobante en su hoja, la orden (la cuadrilla: Mis tareas si la orden es suya), la reserva, la herramienta, el remito o el legajo. Sin permiso: «🔒 No tenés permiso para ver esto». La dirección se limpia al abrir.

- **Asistente · dictado en vivo y onda:** mientras se dicta con el 🎤 o en el modo charla, el texto va apareciendo en el cuadro a medida que se habla (resultados parciales: `interimResults` del navegador y `partialResults` del plugin de la app 1.4, que ahora acepta `matches`/`value`/`accumulatedText` según la versión). Arriba del cuadro, una onda de 28 rayitas que corre como el grabador de WhatsApp (`#iaOndaV`, `window.__iaOnda`): en la compu con el navegador mide el nivel REAL del micrófono (getUserMedia + AnalyserNode, a la par del reconocimiento); en el celu y en la app la onda es simulada y salta con cada palabra que llega (no abre el micrófono dos veces, que cortaría el dictado). En la charla reemplaza a las 5 barritas de antes. Se apaga al terminar, con «Terminar» o al cerrar.
- **Asistente más «vivo»:**
  - Actúa sin preguntar de más: «dame la info de la plaza X», «avance del pueblito» → busca la obra más parecida y contesta; pregunta solo si hay 2+ candidatas parecidas de verdad (las ofrece en una línea). Entiende mensajes abreviados, cortados o mal dictados.
  - Glosario del dictado en el system (corrige solo y no lo comenta): «pe erre efe ve / prfv / fb / pr fb / perfv» = PRFV · «pat / pe a te» = PAT · «be pe ene» = BPN · «o te / ot» = orden de trabajo · jabalina, tablerito, vínculo, capuchón, pañol, vale, remito, itemizado, legajo, cuadrilla.
  - `buscar_obra` y todas las herramientas que reciben nombre de obra buscan aproximado: sin tildes ni «plaza/barrio/el/la», palabras parciales («sanma» → San Martín), palabra entera antes que pedazo, y distancia de edición chica («puebito» → PLAZA EL PUEBLITO); devuelven la mejor con su puntaje. Elige sola si la mejor le saca 10 puntos a la segunda.
  - Velocidad: preguntas de un dato (cuántas, avance de, dónde está, quién está, stock de, qué falta) → effort «low» y respuesta corta (4.000 tokens); lo complejo (revisá, armá, cerrá, corregí, compará, PDF…) sigue en medium/high.
  - **El system ya no cambia entre turnos:** la fecha, la hora, la pantalla, los permisos y «está charlando por voz» van como un bloque «[Contexto de la app …]» al principio de cada mensaje de la persona. Antes el contexto iba en el system y cambiaba en cada pregunta, y eso invalida los bloques de pensamiento anteriores (la API devolvía 400 en charlas largas).

**Decisiones**
- Cada renglón del remito es una entrada con su número E- (igual que «Registrar todas las filas» del pañol).
- La IA no elige códigos: los propone la app; 🟡 queda elegido pero marcado «revisá»; 🔴 queda afuera hasta que la persona elija.
- «Entregar» una herramienta = «👷 Asignar a una persona» de su ficha (ya existía).
- La onda real solo en la compu: en Android abrir el micrófono para medir mientras el reconocedor escucha corta el dictado.
- Los QR apuntan siempre a la dirección pública de GitHub Pages (también los que se imprimen desde el APK).

**Reglas de Firebase:** no cambian (`catalogoProductos` ya deja escribir cualquier campo a quien edita el pañol; `movimientos`, `adjuntos` y `auditoria` como siempre).

**Qué tiene que hacer Ángel**
1. Subir `index.html` a GitHub (nada más: sin reglas ni APK nuevos; el lector de la app usa el plugin que ya trae la 1.3).
2. El remito por foto usa el Worker `ema-ia` de la v136 (si todavía está el viejo, anda con Sonnet 5.5).
3. Si pegaron el Worker v2b-ia (v136b), nada más; el lector de códigos en la app de Android usa el plugin que ya trae la 1.3; el dictado en vivo usa el de la 1.4.

**Pruebas**
- `t_v137` (nueva): 62/62 en PC y 63/63 en celular (remito con la IA simulada: tarjeta, corregir, sin código que no se carga, Sí → E- con precio sin IVA y foto, auditoría; ilegible; Worker caído; chip y «cargá este remito»; EAN asociar / repetido / escanear con el plugin simulado / desconocido; etiquetas QR; QR del vale, la OT y la reserva decodificados con jsQR; `?doc=` S-/OT-/R-/H- y `?obra=`; sin permiso; dictado en vivo y onda real en PC / simulada en el celu; plugin 1.4 y modo charla; búsqueda aproximada, glosario, effort por tipo de pregunta y system idéntico entre turnos).
- Batería completa en PC y celular (139 pruebas × 2, de a 3) sobre el index final: todo OK salvo `t_v083` (reemplazada por `t_v084`, como siempre).
- Pruebas viejas: `t_v136` cambió dos preguntas («¿cuántas columnas…?» y «¿y el stock de fusibles?» ahora son datos simples con effort «low»: se usan «contame de san martin» / «contame lo de los fusibles» para seguir probando el effort por defecto) y la revisión de las 12 h lee el mensaje con el bloque de contexto. `h.js` no cambió (`__iaCompat` mantiene el comportamiento de antes en las pruebas viejas).
- Capturas 390 × 844 (×2): botón y tarjeta del remito, asociar EAN, etiquetas QR, vale con QR, `?doc=` abriendo el vale, dictado en vivo con la onda y modo charla.

**Huellas**
(sello «2026-11-09 21:31 · ad5aaf»)
- `index.html`: `eed8e34aba5a9661dc15786ab4b54b4ce29a9533cd5a07063d01ceb38088e8fc`
- `137_2026-11-09_app-EMA_ORIGINAL.html`: `cbe62a3bebff8ddbdf8122bae961fd1e1282669536a44179319bab4811f69729`
- `patch_v137.py` (base: ORIGINAL 136b `d802980d…dbcaf7bb1f386`): `d48b9085981ff8cbb2cbb4d5f8ddfa2b400a73410daf3b8fa3a5b50fdad1eb97`

## v136b — 09/11/2026 (publicada en GitHub, commit 333bdd6) · Inicio bien en la compu y el asistente no se traba con «no entendió el pedido»

**Pedido de Ángel:** en la compu el Inicio se veía con «Plazas» arriba y las tarjetas más angostas que la portada; el Asistente contestaba «Claude no entendió el pedido» en muchas preguntas.

**Cambios**
- `<style id="v136bCss">`: sin el título viejo «Plazas» (`#viewInicio:before`) con el Inicio Ejecutivo; en pantallas > 640 px la portada con bordes redondeados y las tarjetas al ancho de la portada. En el celu no cambia.
- **La nómina real** está en `configEquipo/personal.nomina` (las pruebas usaban `lista`): el asistente (`personal`, `proponer_aviso`), «＋ Agregar a alguien que también fue» (`cierreIntegrante`) y la gente rápida de «Llenar orden» (`ordenNueva`) la veían vacía. Ahora leen `nomina`, después `lista` y si no `nominaEquipo()`. Prueba nueva `t_v136b` (falla con la v136, pasa con la v136b).
- Asistente: si el Worker manda `error.detalle`, se muestra «(Motivo: …)» debajo del mensaje.
- Worker `ema-ia` **v2b-ia**: si Claude responde 400, reintenta solo (1.º sin respaldo del servidor ni caché automática, 2.º además sin bloques de pensamiento viejos) y, si sigue, devuelve el motivo en `detalle` (sin la clave). Sospecha: el contexto cambia en cada pregunta y Claude rechaza los bloques de pensamiento de la respuesta anterior.

**Qué hace Ángel:** pegar `workers/ema-ia.js` en Cloudflare (ema-ia › Edit code › Deploy) y ver en `/salud` «v2b-ia».

**Pruebas:** `t_v136` 45/45 y 55/55, `t_v135` 43/43 y 59/59, `t_v133`, `t_v134`, `t_nav`, `t_humo` OK en PC y celu; `workers/probar_ema_ia.mjs` 60/60.

**Huellas:** ORIGINAL `d802980d…` · index `bc545630…` · sello «2026-11-09 21:22 · 89eae5». (`t_v106`, `t_v112`, `t_v132`–`t_v136`, `t_circuito`, `t_v136b` OK en PC y celu.)

## v136 — 09/11/2026 (publicada en GitHub, commit 5b6833d, con la carpeta guias/) · Arreglos del Inicio, campanita de línea, barra de abajo deslizable, Asistente con Opus 5.5 (PDF y cierre rápido), «🩺 Supervisor» y Guías nuevas

**Pedido de Ángel** (diseños aprobados el 09/11/2026)
- Inicio: «Para atender» se encimaba sobre la portada azul; en el APK la portada quedaba debajo del reloj; el buscador cortaba «Buscar obra o barri…».
- Campana de línea (la del Inicio) en todas las pantallas, en vez de la 🔔 amarilla.
- Barra de abajo que se guarda: opción B (lengüeta al borde izquierdo).
- Asistente «la más pro» (decisión final con Ángel: **Opus 5.5 para todo**; Fable 5.2 y Sonnet 5.5 como opción), PDF de todo y cierre rápido de órdenes.
- Supervisor de la app (sin IA siempre + revisión con IA a las 12 y 18 h).
- Guías con el formato nuevo.

**Cambios** (módulos nuevos `v136Ui`, `supervisor`, `guiasNuevas`; reemplazos chicos en `inicioPro`, `navBarra`, `avisosApp`, `materialesFichas` y `asistenteIa`)
- **Inicio Ejecutivo:** las tarjetas empiezan debajo de la portada (antes subían 40 px encima) y son blancas (86 %); la portada suma el borde de arriba del celu (`env(safe-area-inset-top)`, y `--safe-area-inset-top` por si el WebView no lo da) y una franja fija `#ieReloj` tapa el reloj cuando la portada sube; en ≤ 420 px el buscador y el botón Asistente se achican lo justo (entra «Buscar obra o barrio…»). `#iniPan` no lo necesita: tiene el header de la app.
- **Campanita:** `#avCampana` dibuja la campana de línea (mismo SVG del Inicio y del Perfil), navy, con el globito rojo. Mismo botón, id y comportamiento. El título «🔔 Avisos» de la tarjeta del inicio de la cuadrilla quedó como estaba (es texto, como «📋 Tus tareas»).
- **Barra de abajo (B):** flechita ‹ a la derecha; tocarla o deslizar la barra a la izquierda la guarda con animación y queda una lengüeta de vidrio (44 × 68 px, sin desenfoque) al borde izquierdo con el globito del total de pendientes; tocarla o deslizarla a la derecha la trae. `ema.nav.guardada` lo recuerda. Guardada, el contenido no reserva lugar abajo. Respeta los bordes del celu; si aparece el cartel de fotos sin señal, la lengüeta se corre arriba.
- **Asistente:**
  - Modelo: **Opus 5.5** (`claude-opus-5-5`) para todo: chat effort «medium», cierre rápido «low», supervisor y «revisá todo» «high». En ⚙ (solo Administración) «Modelo» del asistente y del supervisor: Opus 5.5 (recomendado) · Fable 5.2 (el más pro) · Sonnet 5.5 (el más barato), con el costo aproximado por pregunta (≈ US$ 0,09 / 0,17 / 0,04). Se guarda en `configEquipo/personal.asistente.{modelo, modeloSupervisor}` (las reglas de hoy lo dejan; si no, queda en el aparato).
  - Reglas de la API: sin `temperature`/`top_p`/`top_k`, sin `thinking`, `tool_choice` auto, sin prefill, `refusal` se mira antes del contenido, `fallbacks: "default"` + beta `server-side-fallback-2026-07-01` (no en Haiku), 16.000 tokens con Opus/Fable, caché automática al final.
  - **La historia solo se agrega:** los bloques de pensamiento (y los de respaldo) vuelven tal cual; ya no se sacan ni se recortan turnos ni se cambian imágenes viejas. Las imágenes nuevas tienen cupo al agregarse (12 / 3,5 MB por pedido). Charla larga (12 turnos o más de 3 MB) → **conversación nueva desde un resumen** (también en el modo charla).
  - Worker viejo: si contesta «modelo no permitido», sigue con Sonnet 5.5, avisa una vez «Para usar la IA más pro, actualizá el Worker (ver instructivo)» y durante 12 h va directo con Sonnet.
  - **`armar_pdf`**: orden (la planilla de siempre), comprobante (vale/entrada/devolución de siempre), reserva (la hoja de reservas), stock (filtrado), lista de compras, puntos de la quincena, resumen de obra (registro, itemizado, avance, órdenes, material), informe de avance y mensual con fotos (los de Informes) y documento libre (la IA escribe en markdown). Abre la hoja de la app (logo, A4, firmas si se pide) con Imprimir / Compartir PDF / Bajar PDF; en el chat queda «📄 …» para volver a abrirla. No cambia datos: sin tarjeta.
  - **Cierre rápido:** «cerrá la OT-…» / «cerrá las de hoy» → `proponer_cierre` (con `otIds` o `fecha`) revisa cada orden en una sola vuelta: tareas mandadas o no, fotos que faltan y por qué, horas, tareas que no se hicieron, gente que no mandó nada, cantidades contra lo previsto, la misma tarea en otra orden sin cerrar y tareas que no avanzan el itemizado. Tarjeta «✅ Lista» / «⚠ Le falta: …» con «Cerrar» (las listas), «Cerrar igual» y «No». Con el Sí abre el cierre de siempre, contesta «No, se hizo lo previsto» a la pregunta del itemizado y toca «✅ Aprobar todo y cerrar»; si algo frena, el cierre queda abierto para la persona.
  - Herramienta `supervisor` para «revisá todo» / «revisá la obra X».
- **🩺 Supervisor** (sin IA, en los aparatos de Administración y Oficina, al abrir y cada 15 min, con lo que hay en memoria): hechas de más (rojo), columnas del cálculo ≠ ítems 1–8, cálculo ≠ itemizado, órdenes cerradas que no movieron el avance, lo hecho ≠ avance cargado; obras en obra sin avance hace N días (7, se cambia en la hoja), órdenes de días anteriores sin cerrar (rojo desde 3 días), tareas en 3+ órdenes sin terminarse; atrasada contra su Gantt o fin estimado (y «N obras sin Gantt: no puedo decir si van al día»); celulares con la app vieja, fotos de órdenes sin subir, usuarios de obra sin persona vinculada, ubicación cortada, lecturas cerca del cupo. Bloque en el Inicio Ejecutivo debajo de «Para atender» (4 primeros, rojo/ámbar) y hoja «Ver todo» con «Ir» a donde se arregla. Nada se arregla solo.
  - **Revisión con IA a las 12 y 18 h:** el primer aparato de admin/oficina con la app abierta pasada la hora toma el turno (transacción en `configEquipo/salud.supervisor.slots`, que ya se puede escribir: **sin reglas nuevas**; si la base no deja, el control queda en el aparato), le pasa al asistente los hallazgos y los datos de las obras marcadas, y el parte («Acá hay algo raro…», con propuestas de arreglo en tarjeta antes → después) queda en el chat, en el Inicio y en `salud.supervisor.ultimo` para los demás. Si hay algo rojo avisa al celular de Administración («🩺 El supervisor encontró N cosas raras»).
- **Guías nuevas** (carpeta `guias/` junto al index): Procesos con la tapa y el paso a paso nuevo (hojas con el visor claro y zoom, «📄 PDF · Compartir» y «⬇ Bajar PDF»); Materiales con las hojas de `materiales/` por familia y «Más hojas de materiales»; Tipos constructivos con la hoja nueva (3D, plano, hoja completa); Láminas: las nuevas cuando están en el índice. Lo de antes queda plegado («Ver los dibujos de antes»). Todo se baja recién al abrirse, también en la app de Android; sin señal, «se ve cuando vuelva la señal».
  - Láminas de barrio sin dibujo nuevo completo (`col_aerea_h1`, `col_aerea_h2`, `tablero_barrio`, `apoyo_pat`, marcadas «parcial» en el índice): muestran las hojas nuevas que las cubren y el botón «🗂 Ver la lámina de antes». AP-C-017-a/b no están en el índice: quedan como antes.
- **Worker `ema-ia` v2-ia** (`workers/ema-ia.js`): Opus 5.5 y Fable 5.2 con sus precios (y los de los modelos de respaldo), `fallbacks: "default"` y su beta, 16.000 tokens para Opus/Fable, thinking/fallback tal cual, costo que suma los intentos del respaldo. `workers/probar_ema_ia.mjs` 58/58.

**Decisiones**
- Opus 5.5 para todo (Ángel); Fable 5.2 solo si se elige en ⚙.
- La revisión de las 12/18 h no necesita reglas nuevas: usa `configEquipo/salud`, que ya escriben todos los confirmados.
- Cierre rápido contesta «No» a la pregunta del itemizado: lo dice la tarjeta; si hubo cambios, se cierra a mano.

**Reglas de Firebase:** no cambian.

**Qué tiene que hacer Ángel**
1. Subir `index.html` y la carpeta **`guias/`** completa (≈ 36 MB, 194 archivos) a la raíz de GitHub, junto al index.
2. Pegar el Worker nuevo `workers/ema-ia.js` en Cloudflare (`ema-ia` › Edit code › Deploy) y mirar `/salud` (`v2-ia`). Ver «Actualizar el Worker para la v136» en el instructivo. Mientras no lo pegue, el asistente anda con Sonnet 5.5.
3. Revisar el tope de gasto de platform.claude.com (hoy USD 30/mes): Opus cuesta más que Sonnet.

**Pruebas**
- `t_v136` (nueva): 45/45 en PC y 55/55 en celular.
- Batería completa en PC y celular (137 pruebas × 2, de a 3): todo OK salvo `t_v083` (reemplazada por `t_v084`, como siempre). Después del último retoque (la lengüeta se corre arriba del cartel de fotos sin señal) se volvieron a correr `t_v136`, `t_v135` (43/43, 59/59) y `t_nav` (6/6, 6/6). `workers/probar_ema_ia.mjs` 58/58.
- Pruebas viejas: `h.js` suma `__iaCompat` (Sonnet y el cierre de antes) salvo `iaPro:true`, `__supNoIA` salvo `supervisor:true` y `__guiasNo` (guías de antes) salvo `guias:true`. `t_v133` cambió una comprobación: antes la imagen del plano no se volvía a mandar; ahora la historia va tal cual (solo se agrega), por las reglas de Opus 5.5 / Fable 5.2.
- Capturas 390 × 844 (×2): inicio arriba con la barra, barra guardada (B), supervisor, Guías (procesos y un tipo), tarjeta de cierre rápido y hoja PDF armada por la IA.

**Huellas**
(sello «2026-11-09 20:07 · 8fe332»)
- `index.html`: `b9b19ec4e2b669d65afc7fa70537507b61d12e1548a42beee108fbb6ce1c1f8f`
- `136_2026-11-09_app-EMA_ORIGINAL.html`: `534a298cb1e93f81c31c469ae02468ea405ed4a19bc253e8b33636c3e0e01a69`
- `patch_v136.py` (base: ORIGINAL 135 `dae95cf0…9806b3e`): `93198038b7a83901482978853cfabf46a02ba41e9652f067144ea8704a852c7f`
- carpeta `guias/` (194 archivos, ≈ 36 MB; sha256 de la lista ordenada de huellas): `28b4e15b07bdb31fbaa4c32a7d9b873db9186d4a2d52ec73402f798f14d004d2`

## v135 — 09/11/2026 (publicada en GitHub, commit af633cf) · Diseño nuevo: Inicio «Ejecutivo», Inicio del pañolero, barra de abajo con «Perfil» y la pantalla Perfil

**Pedido de Ángel** (diseños aprobados con imágenes el 09/11/2026)
- Inicio «Ejecutivo» (P1) para Administración y Oficina, con datos reales; Inicio propio del pañolero; la cuadrilla sigue igual.
- Barra de abajo N1 (píldora de vidrio clara) con «Perfil» en lugar de «Menú» y el ícono «Caja» para Pañol; el ☰ de arriba queda.
- Perfil clara (opción A, sin la parte azul), con huella y recordatorios de la app de Android 1.4.
- Los «pedidos» de reservas los ve solo el pañolero, no la oficina.

**Cambios** (módulos nuevos `v135Comun`, `inicioPro`, `navBarra`, `perfilApp`; no se tocó código existente)
- **Inicio «Ejecutivo»** (`#iniEje`, admin y oficina): portada azul con el logo blanco de la app (la «A» sin relleno, el PNG aprobado), saludo con el nombre y la fecha, anillo del avance del contrato (K hecho ÷ módulos de la licitación), 3 números (órdenes de hoy, personas en obra, para cerrar), buscador de obras y botón Asistente (si la persona lo puede usar). Tarjetas: «Para atender» (órdenes para cerrar, órdenes sin cerrar de días anteriores, fotos sin obra, usuarios nuevos, materiales sin stock y los avisos que vivían arriba del inicio, como el del respaldo), «En obra ahora» (según las órdenes de hoy: obra, gente, desde qué hora), «Órdenes de hoy» (avance N/M, «Cerrar» en las que mandó la cuadrilla), accesos (según permisos) y obras con su avance y chips Todas / En ejecución / Finalizadas. Cada fila lleva a su pantalla. Entrada suave (y nada de movimiento si el celu lo pide). Sin cuadrícula de fondo. En la PC las tarjetas van en dos columnas.
- **Inicio del pañolero** (`#iniPan`): saludo, buscar material (abre el catálogo filtrado), pedidos para aprobar · para preparar · sin stock · herramientas afuera, la lista de pedidos con «Aprobar» (por el mismo botón de Reservas, con su confirmación) y «Ver», stock bajo («se acabó» / «14 / mín. 50») y accesos Vale · Entrada · Herram. · Compras.
- **Barra de abajo N1** (`#navN1`), solo en el celular (≤ 640 px) y en la app de Android; en la PC ancha no aparece (la oficina usa el menú lateral). Oficina: Inicio · Obras · Órdenes · Pañol · Perfil; cuadrilla/operario: Hoy · Cámara · Mapa · Pañol · Perfil; pañol: Inicio · Reservas · Catálogo · Herramientas · Perfil. Si una hoja está oculta para la persona, esa pestaña no va. Globitos: órdenes para cerrar, tareas de hoy, reservas por aprobar + por preparar. Se esconde en «Llenar orden», la Calculadora, la cámara, el panel del Asistente, ventanas y visores, y con el teclado abierto. Fondo blanco 92 % sin desenfoque (Chrome 80). La lengüeta del Asistente no choca.
- **Perfil** (`mostrarVista('perfil')`): iniciales, nombre, rol y usuario; puntos de la quincena (los de Producción), órdenes que seguís (cuadrilla: tareas de hoy) y avisos sin leer; «Tus ajustes»: Entrar con huella, El asistente lee en voz alta (`ema.ia.leer`, el mismo del asistente), Avisos al celular (el alta que ya existía: Web Push en el navegador, FCM en la app), Recordatorios; «La app»: versión con «Al día» o «Actualizar», este celular (abre el diagnóstico), cambiar contraseña (correo de Firebase si tiene correo real; si no, «pedile a la oficina»); Cerrar sesión (la misma de la app). También en el menú lateral («Perfil»), porque en la PC no hay barra.
- **Huella** (app 1.4, `NativeBiometric`): prenderla pide una verificación de prueba y guarda `ema.huella=1`; al abrir la app y al volver después de 5 minutos pide huella o PIN; si falla, velo con «Probar de nuevo» y «Cerrar sesión». Sin el plugin: «Necesita la app de Android 1.4».
- **Recordatorios** (app 1.4, `LocalNotifications`): un aviso diario a la hora elegida (17:00 de entrada): oficina «Órdenes para cerrar», cuadrilla «¿Mandaste las tareas de hoy?», pañol «Reservas para preparar». Número sobre el ícono (`Badge`) con lo pendiente donde el celular lo muestre.

**Decisiones**
- «En obra ahora» sale de las órdenes de hoy, no del GPS (la ubicación en vivo se baja solo con el Mapa abierto desde la v117): por eso dice «hoy» y no «en vivo».
- El nombre del rol es el de la app («Administrador», «Oficina», «Pañol»…).
- El inicio viejo queda en la página, escondido; «solo mirar» lo sigue viendo.

**Reglas de Firebase:** no cambian (todo es lectura; activar avisos usa lo que ya existía).

**Qué tiene que hacer Ángel**
1. Subir `index.html` a GitHub.
2. Nada más. La huella y los recordatorios andan con la app de Android 1.4.

**Pruebas**
- `t_v135` (nueva) en PC y celular: inicio admin con datos reales (números, para atender, en obra, órdenes de hoy con «Cerrar», accesos, obras, buscador, chips, sin cuadrícula, la oficina no ve pedidos), filas que llevan a su pantalla, inicio del pañolero («Aprobar» aprueba por Reservas), la cuadrilla sin cambios, barra por rol con permisos (operario sin Mapa ni Pañol) y globitos, escondida en Llenar orden / Calculadora / Asistente / cámara / teclado / hoja de recordatorios / velo, nada tapado, sin scroll de costado, Perfil con sus números e interruptores, huella y recordatorios con los plugins simulados y sin ellos, volver tras 5 min, cerrar sesión. Las pruebas viejas no ven lo nuevo (`__navNo`, `__inicioViejo` en `h.js`, salvo `nav:true` / `inicio:true`).
- `t_v135` 43/43 en PC y 59/59 en celular.
- Batería completa en PC y celular (136 pruebas × 2, de a 3): todo OK salvo `t_v083` (reemplazada por `t_v084`, como siempre). `t_v078` falló en la primera pasada (el menú tenía un ítem más, «Perfil»): en el modo de las pruebas viejas (`__navNo`) el menú queda como antes; vuelta a correr 21/21 en los dos, `t_nav` 6/6. `t_circuito` 16/16, `t_v134` 33/33 y 35/35.
- Capturas en el celular (390 × 844, ×2): inicio de la oficina arriba y abajo, inicio del pañol, Perfil, barra de la cuadrilla y «Llenar orden» sin la barra; comparadas con las maquetas aprobadas.

**Huellas**
(sello «2026-11-09 17:41 · b079ee»)
- `index.html`: `4d961147302be8f80b4eff535318658aad1e64258e4322ccb6a4c0fe9c44bb63`
- `135_2026-11-09_app-EMA_ORIGINAL.html`: `dae95cf06d8fd596605973dd8e318d69ab3c6a3c5f4b498de9a596695e810a38`
- `patch_v135.py` (base: ORIGINAL 134 `544c61fc…6a5fd910`): `d821bdc2b2a87b0d9bf102e56a889b56c18278445113bde1f913537839806b3e`

## v134 — 09/11/2026 (publicada en GitHub, commit 7b2a47c) · «✨ Asistente EMA» que edita (con los permisos de cada uno) y charla por voz

**Pedido de Ángel**
- «Que pueda editar todo, por ejemplo mandar órdenes de trabajo yo pidiéndole que mande, o editar algo en específico… puede editar todo pero no todos pueden editar todo… los de cuadrilla nada; oficina y administración pueden editar, administración más cosas, oficina lo que tiene acceso… modificar una OT, modificar cierta cosa que le pidas, modificar algo de la calculadora.»
- «Que hable también, que podamos charlar.»

**Cambios** (`asistenteIa` + `datosCelu`; dos ganchos chicos en presencia y reservas)
- **Quién puede qué:** el asistente propone solo lo que la persona misma podría hacer en la app (`permiso(hoja) === "editar"`, con los ajustes por usuario); las reglas de Firebase lo vuelven a controlar y un «permission-denied» se explica («no tenés permiso» / «faltan publicar las reglas»). **Cuadrilla, operario y solo mirar: ninguna acción** (al modelo ni le llegan esas herramientas; si les habilitan el asistente, solo consultan). Usuarios, roles, reinicios de puntos y horario de ubicación: solo Administración.
- **Siempre tarjeta con ANTES → DESPUÉS, campo por campo, y «Sí, hacelo» / «No».** Nada se escribe sin el Sí. Cada cambio queda en la auditoría como `asistente_editar` con colección, id, `antes`, `despues` y `porAsistente: true`.
- Herramientas nuevas, por los caminos de la app:
  - `proponer_editar_orden`: fecha, horas, sumar o sacar gente (con `personalNombres`), vehículo, tareas y cantidades, quién hace qué, sacar tareas, notas, responsable de oficina, anular. Se guarda con `fbOtUpdate` (el mismo de «Guardar cambios» y de Seguimiento): a la gente nueva le llega el aviso, al responsable nuevo también; si la orden está cerrada, avisa que los puntos quedaron fijados; anular una cerrada pregunta si descuenta el avance (como siempre).
  - `proponer_calculo`: toma el formulario del último cómputo de la obra (lo que hace «Editar» del Historial), aplica los cambios («las 16 de 10 m», tipo de columna, cantidad de circuitos, metros de zanja u otro campo), recalcula y muestra qué materiales cambian y cómo queda el itemizado previsto. Con Sí se guarda por «Calcular materiales»: **cómputo NUEVO, el viejo queda**. Después ofrece «🔄 Pasar este cálculo a la obra».
  - `proponer_editar_obra`: nombre, ID, dirección, barrio, carpeta EPEC por el formulario de Registrar obra (el nombre nuevo pasa también a órdenes, vales y cómputos, con la pregunta de siempre); ubicación y situación como en el mapa y en Avance.
  - `proponer_movimiento_panol`: vale de salida, entrada, devolución (como «Registrar movimiento», con su número S-/E-/D-) o reserva (R-…). Revisa el stock y avisa si no alcanza.
  - `proponer_editar`: el genérico para lo que no tiene herramienta propia (catálogo, movimientos —anular—, reservas, herramientas, gastos, plan, planos, puntos del mapa, nómina, baremo, precios; usuarios solo admin). Nunca auditoría, secretos, pushSubs, avisosPush, presencia ni ubicación; no borra (se anula o se da de baja).
  - `proponer_orden` (de la v132) sigue emitiendo por «Llenar orden» con su número y los avisos (`t_v132`).
- **Voz** (adaptador `window.__voz`): en la app de Android 1.4, los plugins nativos de dictado y de voz; en Chrome, `webkitSpeechRecognition` y `speechSynthesis` es-AR; si no hay, el micrófono del teclado.
  - 🎤 dicta una frase al cuadro de texto. 🔊 en la cabecera: «leer siempre en voz alta». «🔊 Escuchar» en cada respuesta.
  - **🗣 Modo charla:** escucha → manda → lee la respuesta → vuelve a escuchar. Mientras habla no escucha (no hay cancelación de eco). Barra a la vista «🗣 Charlando… ✋ Cortar · Terminar». Se corta con «Terminar», con «chau» / «listo» / «terminar» dichos (extra), a los 2 minutos sin hablar, al cerrar el panel o al salir de la app. «Sí, hacelo» / «no» dichos confirman o cancelan la última tarjeta (que igual se ve en pantalla). Pasadas 12 idas y vueltas resume lo anterior en un mensaje corto. La pantalla no se apaga durante la charla (KeepAwake / Wake Lock). En charla el asistente contesta corto.
- **Lengüeta B2 para abrir el asistente** (la eligió Ángel), en lugar del botón «✨ Asistente»: pestaña de vidrio pegada al borde derecho, a ~60 % de la altura, con el ícono de destellos en navy. Se ve de 30 px (34 al arrastrarla) y se toca en 44 × 68. Se arrastra solo para arriba y para abajo (el «atrás» de Android es horizontal desde el borde) y queda donde la dejaste (`localStorage ema.ia.tab`); tocarla abre el panel. Respeta los bordes del celular y no tapa las barras fijas de abajo («Llenar orden», Calculadora…): si cae encima, se corre arriba. La ve solo quien puede usar el asistente. Sigue siendo `#iaFab .ia-fab-b` (con el texto «Asistente» para lectores de pantalla), así que las pruebas viejas no cambian.
- **Datos del celular** (`datosCelu`, liviano, para todos): modelo, Android, versión de la app de Android, versión de la app (sello), batería, si carga y red; viajan cada 2 minutos en `presencia/{uid}.disp`. `diagnostico_equipo` los muestra y marca al que tiene la app desactualizada, batería baja o sin señal.
- **Panel nuevo con el diseño A que eligió Ángel** (tema Cristal): header de vidrio de la app con el logo, «‹» para volver y el engranaje; la pregunta en píldora navy; la respuesta en tarjeta de vidrio con «EMA · hora», los chips de lo que miró («✓ Obra · Calculadora · Itemizado») y las tablas como tarjetas (`.tabla-tarjetas`); la confirmación con etiqueta «Para confirmar · no se hace solo», cada cambio con ~~antes~~ → después, «Sí, hacelo» (`.btn-primary`) y «No» (`.btn-ghost`); chips que se deslizan con desvanecido; barra flotante de vidrio abajo con íconos de línea (micrófono blanco sobre botón navy, ondas de charla, flecha de enviar; el micrófono activo late suave en navy, nada en rojo); placeholder «Escribí o hablá…»; la franja «🗣 Charlando… Terminar» arriba de la barra; las opciones (voz, empezar de nuevo, quién lo ve —Administración—, gasto) en una hoja aparte que no tapa el chat.

- **Corregir el itemizado: las hechas pasan con las columnas** (respuesta de Ángel, 09/11). Si el asistente pasa cantidades de un ítem que tiene hechas a otro, primero pregunta cuántas de las que pasan ya estaban hechas (sin ese dato no arma la tarjeta) y las pasa (`hechasNueva` por ítem → `cantidadAvanzada`). La tarjeta muestra «hechas 2 → 0» y «hechas 0 → 2»; la auditoría guarda `hechasAntes`/`hechasDespues`. Si las hechas no suman lo mismo antes y después, avisa.

**Reglas de Firebase:** no cambian. `presencia/{uid}` ya deja escribir cualquier campo a su dueño (v128).

**Qué tiene que hacer Ángel**
1. Subir `index.html` a GitHub.
2. Nada más: ni reglas ni Worker. La voz nativa anda con la app de Android 1.4 (la arma el otro trabajo); con la 1.3 se dicta con el micrófono del teclado y la voz sale por el WebView.

**Pruebas**
- `t_v134` (nueva) en PC y celular, con el Worker y la voz simulados: Oficina edita una OT (suma a Rolando y 4 → 6 de fundaciones) con tarjeta antes → después; «No» no guarda nada; «Sí» guarda `personal`/`personalNombres`, el aviso de Rolando y la auditoría `asistente_editar`; `proponer_editar` respeta permisos (Oficina sin gastos, usuarios solo admin, auditoría nunca); la cuadrilla no recibe herramientas de acción; «las 16 de 10 m» → cómputo nuevo guardado sin tocar el viejo, materiales e itemizado previsto en la tarjeta, «Pasar este cálculo a la obra»; vale de salida con número S-0001; mínimo del catálogo; dirección y situación de la obra; `presencia.disp` con el sello; modo charla: escucha, responde, lee en voz alta, vuelve a escuchar, «sí, hacelo» manda el aviso, nunca escucha mientras habla, corta con «terminar» y con el botón.
- `t_v133` cambiada (2): el ítem 6 de GEORG tiene 2 hechas; sin decir cuántas pasan, el asistente no arma la tarjeta y pide el dato; con `hechasNueva` quedan 0 en el 6 y 2 en el 8 (antes se perdían). 30/30 y 32/32.
- `t_v133` cambiada: la tarjeta de «Corregir el itemizado» ahora muestra cada ítem con ~~antes~~ → después (diseño A), sin los «:»; se ajustó la expresión que la lee. El resto igual.
- Batería completa en PC y celular (135 pruebas × 2, de a 3), con la lengüeta: todo OK salvo `t_v083` (reemplazada por `t_v084`, como siempre). `t_v134` 33/33 en PC y 35/35 en celular (ahora también prueba la lengüeta: borde, tamaño, arrastre vertical guardado, que arrastrar no abre, que tocar abre y que en «Llenar orden» no tapa la barra); `t_v133` 29/29 y 31/31; `t_v132` 29/29 y 30/30; `t_circuito` 16/16 en los dos.
- Capturas en el celular para mostrarle a Ángel: el panel (chat, confirmación, charla y opciones) y la lengüeta en Inicio, Pañol y Llenar orden.

**Huellas** (sello «2026-11-09 13:50 · dc66bb», con las hechas que pasan)
- `index.html`: `5bbaacccc34eddc2e60658107e4242bd6996e6efbceaa49dd412da5d6adda38e`
- `134_2026-11-09_app-EMA_ORIGINAL.html`: `544c61fc0b9f076bed75498b46f86e170693252df13a5c4797bd6c700fd5a910`
- `hechas.py` (sobre el ORIGINAL 134 `6015ef09…`, sello b01152): `3589ffbf06cecc1618cce19ee43ab85ce6dcdde1b2f945e6dec78bee170466ed`
- `patch_v134.py` (base: ORIGINAL 133 `44965d07…ec23ef39`): `aa5740e8d43930a597f04932c94ba7848b8c00e2498f8a9e310c25f2f0fb436e`
- `asistenteIa.html` (módulo completo que reemplaza el de la 133, con `datosCelu`): `ce08f0e1497b6db67d89db8d699ee11bbb8b9df29e93a4309d44252cb33d0ef0`

## v133 — 09/11/2026 · «✨ Asistente EMA» pro: ve todo, cruza las fuentes, mira planos y fotos

**Pedido de Ángel**
- Le preguntó por GEORG NICOLAI: el asistente dijo «8 PRFV de 7 m (ítem 6) y 8 de 10 m (ítem 8)» y, al pedirle la calculadora, «no tengo acceso al historial de la calculadora».
- «Tiene que ser más pro… tener acceso absolutamente a cada punto de la calculadora… analizar todo, leer los planos que subo de cada obra, comparar si la calculadora sacó bien o no, analizar errores de la calculadora, de la obra, de la app de los chicos, si algún celular o usuario está fallando.»
- «Que ubique las fotos en la obra correcta según el GPS» (caso: Rolando Velázquez, 06/11, fotos cargadas en otra plaza).

**Cambios** (`asistenteIa`, solo el asistente; el resto de la app no cambia de comportamiento)
- **Sonnet 5.5 para todo** (effort `medium`, `max_tokens` 4000), tope de **10 vueltas** por pregunta. System + herramientas con `cache_control`.
- **Lectura de todo lo que la app tiene en memoria** (sin lecturas nuevas a Firestore, salvo a pedido: la imagen de un plano y las fichas de fotos de una obra o de un día):
  - `obra_completa(obraId)`: registro, itemizado (ítem, cant, K, hechas), **todos los cómputos de la Calculadora** de la obra (fecha, quién, formulario completo: columnas por tipo y altura, vínculos, circuitos, tableros, tramos, zanja, campos; y la lista de materiales), etapas, órdenes con cierres, material entregado/reservado/devuelto, gastos (con permiso), fotos por categoría, planos, Gantt, notas y **«diferencias»**: columnas del cómputo contra los ítems 1–8 por altura, ítem por ítem del cómputo (`epecPreviaDe`) contra el itemizado, itemizado contra lo hecho en órdenes (`__diferenciasObra`) y material calculado contra entregado. Cada diferencia dice de dónde sale («cómputo del 05/11/2026 (Ana) contra el itemizado»).
  - `historial_calculos(obra/texto/desde/hasta/detalle)`.
  - `consultar(coleccion, texto, filtro, campos, desde, limite)`: cualquier colección en memoria (obras, cálculos, órdenes, movimientos, catálogo, reservas, herramientas y sus movimientos, gastos, plan, etapas, planos, puntos del mapa, cierres de quincena, nómina, baremo, precios, reinicios; y para Administración: usuarios, presencia, ubicación en vivo y su horario), paginado, ≈30 KB por respuesta y «hay más: pedí desde=N». Respeta el permiso de cada hoja (sin «gastos» no hay gastos; usuarios/presencia/ubicación solo admin). **Nunca manda mails, tokens ni imágenes** (los mails se cambian por el nombre).
  - `describir_datos()`: cada colección con qué significa (de CLAUDE.md §7), cuántos registros, campos y un ejemplo.
  - `revisar_calculo(obraId)`: **vuelve a calcular** el último cómputo con la Calculadora de hoy (`actRecalcular`, el mismo «¿cambió algo?» del Historial, sin guardar y dejando la pantalla como estaba), lo compara (`actComparar`), revisa reglas (columnas del formulario contra el listado, jabalinas = circuitos + tableros en PRFV / columnas + tableros en metálica), itemizado, diferencias y avisa si hay planos.
  - `ver_plano(obraId, planoId?, pagina?)`: arma la imagen del plano por el mismo camino del visor (`planosImg` en pedazos), la achica a 1600 px / JPEG 0,8 / < 1,5 MB y la manda **como imagen dentro del `tool_result`**. Consigna: contar columnas, tableros y circuitos y comparar con el cómputo y el itemizado; decir qué no se lee.
  - `ver_fotos(obraId | otId, categoria?, n ≤ 6)`: miniaturas como imágenes, con quién, cuándo, lat/lng, **distancia a la obra** y la otra obra que está cerca.
  - `ubicar_fotos(obraId?, fecha?, persona?)`: cada ficha de `fotosObra` con GPS contra su obra y las demás (lejos = más de 150 m o el radio de la obra si lo tuviera); propone la más cercana a menos de 150 m o «sin obra». Devuelve grupos: «2 foto(s) de Rolando Velázquez del 06/11/2026 están en PLAZA X pero se sacaron en PLAZA Y, a 17–20 m». Pide obra o fecha (para no bajar todas las fotos).
  - `diagnostico_equipo(persona?)`: usuarios pendientes, desactivados, sin persona vinculada o con persona fuera de la nómina; última vez en la app y tipo de aparato (presencia); ubicación en vivo (sin actualizar, cortes, celu bloqueado); órdenes con envíos trabados o fotos anotadas sin imagen; a quién no le llegan las órdenes; y de este aparato: cola de fotos, rechazadas por permiso, lecturas del día. La versión de la app de cada celular **no se guarda en ningún lado** (lo dice).
- **Acciones nuevas (con tarjeta y «Sí», como las de la v132):**
  - `proponer_corregir_itemizado(obraId, cambios[{item, cantNueva}], motivo)`: tarjeta «🧾 Corregir el itemizado» con antes → después y las hechas. Con el Sí guarda como «Avance de obra» (si el itemizado está fijado, por `CO.aplicarAjuste` con el motivo, igual que «Diferencias con lo hecho»; si no, cambia la cantidad como el total del ítem), `avanceAutoEtapas`, `fbAvanceGuardar`. Las hechas no se tocan, salvo que queden más altas que el total nuevo (se avisa en la tarjeta). Conforme cerrado: no deja. Auditoría `asistente_itemizado` con los cambios.
  - `proponer_mover_fotos(fotos[], obraDestino | "sin_obra", motivo)`: tarjeta «📷 Mover N fotos» con las miniaturas y un solo Sí. Cambia `fotosObra.plazaId/plazaNombre` y el `adjuntos` de la foto, con `movidaDe {plazaId, plazaNombre, ts, por, motivo}`; si la foto está en una orden, la orden no se toca. El legajo vuelve a pedir las fotos (`__lgFotosOlvidar`). Auditoría `asistente_mover_fotos`. Si la base lo niega: «falta publicar las reglas…».
- **«📷 Fotos sin obra»** en Obras (Administración, Oficina y quien ve Avance/Registro; no la cuadrilla): las fotos con `plazaId: "__sinObra"`, con quién, fecha, de qué obra venían y la obra más cercana; «✨ Ubicarlas con el asistente».
- El system pide: buscar con `describir_datos`/`consultar` antes de decir «no tengo acceso»; decir de dónde sale cada número; tabla de diferencias y **proponer el arreglo**; lo que afirma la persona («en obra son todas de 10 m») es un dato, no se discute; con plano, contar y comparar; diagnóstico del equipo con causas probables y qué hacer.
- **Costo:** cada pregunta con Sonnet sale unos 2 a 6 centavos de dólar (más si mira planos o fotos). Las imágenes viajan una sola vez: en los turnos siguientes van como «[imagen que ya miraste antes]»; dentro de un turno, como mucho 12 imágenes y 3,5 MB (el Worker corta en 5 MB). Las herramientas resumen (agregados y los primeros N). El contador de gasto sigue igual (menú › Versión).
- Chips nuevos: «🔎 Revisar una obra a fondo», «🧮 ¿La calculadora sacó bien?», «🩺 ¿Algún celu fallando?», «📍 Fotos en otra obra».
- Para que el asistente los lea, quedan a la vista (solo lectura) datos que ya estaban cargados dentro de otros módulos: `__planosObra`, `__planoImg`, `__herramientasLista`, `__herramientasMovs`, `__cierresQuincena`, `__mapaPuntos`, `__presenciaDatos`.

**Reglas de Firebase:** no cambian. Las v128 ya dejan a quien edita Avance o Registro (Administración y Oficina) actualizar `fotosObra` y `adjuntos`.

**Qué tiene que hacer Ángel**
1. Subir `index.html` a GitHub.
2. Nada más: ni reglas ni APK. El Worker `ema-ia` no cambia (acepta Sonnet, `max_tokens` 4000 e imágenes).

**Pruebas**
- `t_v133` (nueva) en PC y celular con el Worker simulado: obra con cómputo «16 PRFV de 10 m» e itemizado «8 del ítem 6 + 8 del ítem 8» → `obra_completa` trae las dos fuentes y la diferencia (10 m: 16 contra 8; 7 m: 0 contra 8) con la fuente; `historial_calculos`; `consultar` pagina y Oficina sin permiso de gastos no recibe gastos ni usuarios (y nunca mails); `describir_datos`; `revisar_calculo` recalcula de verdad (16 columnas) y revisa jabalinas; `ver_plano` lleva la imagen JPEG en el `tool_result` y no se repite en el turno siguiente; `ver_fotos` con la distancia y la obra cercana; `ubicar_fotos` agrupa las de Rolando del 06/11; `proponer_mover_fotos` no mueve nada hasta el Sí y con el Sí mueve ficha y adjunto con `movidaDe` + auditoría; la foto lejos de todo va a «Fotos sin obra» y se ve en Obras; `diagnostico_equipo` (Rolando sin persona vinculada); `proponer_corregir_itemizado` no escribe hasta el Sí y con el Sí queda ítem 6 = 0 e ítem 8 = 16 + auditoría; todo con Sonnet/medium/4000; tope 10.
- `t_v132` cambiada: esperaba Haiku/effort low en las preguntas y el paso de Haiku a Sonnet al pedir una acción; ahora todo va con Sonnet (pedido de esta versión).
- Batería completa en PC y celular (134 pruebas × 2): todo OK salvo `t_v083` (reemplazada por `t_v084`, como siempre). `t_v133` 29/29 en PC y 31/31 en celular; `t_v132` 29/29 y 30/30; `t_circuito` 16/16 en los dos.

**Huellas** (sello «2026-11-08 23:52 · 638b69», hora de Argentina al armarla)
- `index.html`: `6880b0fada79a3e629a938f70addf45fee20124fb6069e96998dd147825eecba`
- `133_2026-11-09_app-EMA_ORIGINAL.html`: `44965d0747c180d33f8ba94f93ade778344eeb58b9878fad1d3e7ae0ec23ef39`
- `patch_v133.py` (base: ORIGINAL 132 `7eafe4c8…0a1db5`): `9af8504ee47f3491f6292f0f55023d891e63964c37ba472274beccfb06cce8f1`
- `asistenteIa.html` (módulo completo que reemplaza el de la 132): `7b4879d90a80a5d6208b07169b3b851c6eb19280ddcb92573ca7313ec5d63ad1`

## v132 — 09/11/2026 · «✨ Asistente EMA»: una IA dentro de la app

**Pedido de Ángel**
- «Asistente para todas las cosas, informes, preguntas, que te cree una orden rápido… cosas que ya hace la app pero que se lo tenga que decir rápido y le llegue a los empleados rápido, porque por ahí estoy en obra.»
- Ejemplos: «cerrame las OT si están completas», «qué me falta de esta obra», «cuántas columnas tengo en esta obra», «pasame la ubi de esta obra».

**Cambios** (`asistenteIa`)
- **Botón «✨ Asistente»** abajo a la derecha (respeta el borde del celu). Lo ven **solo Administración y Oficina**. Para habilitarlo a otros roles: ⚙ en el panel (solo admin) → guarda `configEquipo/personal.asistente.roles` (doc que ya existe y ya se lee: no hacen falta reglas nuevas ni lecturas nuevas). La cuadrilla no ve el botón ni baja el código: el asistente está «dormido» (`<script type="text/plain" id="asistenteIaCod">`) y se carga al tocar el botón.
- **Panel**: chat, campo de texto, 🎤 (dictado `es-AR` si el celu lo permite; si no, «usá el micrófono del teclado») y sugerencias en chips. En el celu, pantalla completa; en la PC, panel al costado.
- **Cómo piensa**: la app manda cada pedido al Worker `ema-ia` (con el token de Firebase; la clave de Claude vive solo en el Worker). Si Claude pide una herramienta, **la corre la app**, con los permisos de quien pregunta y con lo que ya tiene en memoria (obras, órdenes, pañol, nómina): **no hace lecturas nuevas a Firestore**. Tope de 6 vueltas por pregunta.
  - Modelo: Haiku para preguntas (effort low); Sonnet (effort medium) si la persona escribe «armá / hacé / cerrá / orden» o si Haiku pide una acción (en ese caso se repite el pedido con Sonnet). System + herramientas con `cache_control`.
  - System en rioplatense: corto, primero la respuesta, nunca inventar datos, acciones siempre con propuesta y Sí; lleva la fecha, quién pregunta y la pantalla abierta (si es el legajo de una obra, «esta obra» es esa).
  - `stop_reason: "refusal"`: no se corre ninguna herramienta de ese turno y avisa «No puedo ayudarte con eso». `max_tokens` con herramienta a medias: no la corre.
- **Herramientas de lectura** (se corren solas): `buscar_obra`, `datos_obra` (columnas por tipo y altura del itemizado —o del cálculo si no hay itemizado—, hechas y totales, avance %, «Quedan N de T» de cada tarea con `saldoObra`, lo que falta según el itemizado, material calculado contra entregado, dirección, coordenadas, órdenes abiertas), `ubicacion_obra` (link `https://maps.google.com/?q=lat,lng`; en el chat «📍 Abrir mapa», «Compartir por WhatsApp» y «🗺 En el mapa de la app»), `ordenes` (por obra / estado / fecha / persona; hechas contra previstas, si mandaron todo, fotos), `ordenes_completas` (todo mandado, sin fotos faltantes y con horas; las otras con el motivo), `stock` (stock, reservado y disponible), `personal` (rol, vehículo, si le llegan las órdenes al celu), `puntos` (ranking de la quincena con `__quincenas.calcular`), `resumen_dia`.
- **Acciones** (nunca se hacen solas): devuelven a Claude una «propuesta pendiente» y la app muestra una **tarjeta** con exactamente lo que va a hacer y **[Sí, hacelo] / [No]**. Con el Sí:
  - `proponer_orden`: valida obra, fecha, gente de la nómina, vehículo y tareas del catálogo (si no existe, ofrece las parecidas), avisa si pide más de lo que queda, si ya hay otra orden de esa obra ese día o si a alguien no le llega al celu, y muestra los puntos estimados (los mismos de «Llenar orden»). Con el Sí **carga «Llenar orden» y toca Emitir** (`emitirOrdenTrabajo` con todas sus envolturas): sale igual que si la armara la oficina (número OT, `personalNombres`, vehículos, aviso al celu de cada uno, «una orden por obra y día»). «Revisarla antes» la deja cargada sin emitir.
  - `proponer_cierre`: con el Sí abre **el cierre de siempre** de cada orden, una por una, ya cargado con lo que mandó la cuadrilla, y la persona toca «✅ Aprobar todo y cerrar» (barra «Cierre 1 de N» con «Terminar»). Los puntos y el avance salen del cierre de siempre; el asistente nunca cierra solo.
  - `proponer_aviso`: `__pushAvisos.dejarAviso` a cada persona (o «todos»).
  - Todo queda en `auditoria` con `porAsistente: true` (`asistente_orden`, `asistente_cierre`, `asistente_aviso`, `asistente_roles`). Lo que pasó con la tarjeta se le cuenta a Claude en el próximo mensaje («[Nota de la app: …]»).
- `abrir` (legajo, orden, mapa centrado en la obra, tablero, Llenar orden, informes, pañol, producción, Mis tareas) e `informe` (mensual con fotos o avance de obra, con la obra elegida y el botón «📄 Armarlo ahora» → hoja A4 con Compartir PDF): solo navegan.
- **Gasto**: `localStorage ema.ia.gasto` por día y por mes (con el `ema.costoUsd` que devuelve el Worker); menú › Versión: «✨ Asistente: US$ X hoy · US$ Y este mes». Errores del Worker: se muestra su mensaje (ej. 429 «Llegaste a 20 pedidos por minuto…»). Sin señal: «Sin señal: el asistente necesita internet».

**Qué tiene que hacer Ángel**
1. Subir `index.html` a GitHub.
2. Nada más: no hay reglas nuevas ni APK nuevo. El Worker `ema-ia` ya está andando (si cambia la dirección, avisar).

**Pruebas**
- `t_v132` en PC y celular (Worker simulado interceptando `/ia`): botón para admin y oculto para la cuadrilla (operario y cuadrilla), panel, pregunta «¿cuántas columnas…?» → `tool_use datos_obra` → `tool_result` → respuesta (Haiku, effort low, token, cache_control, sin temperature), ubicación con los links, `proponer_orden` con tarjeta sin escribir nada; «No» no escribe; «Sí» emite la orden (número, `personalNombres`, tarea, cantidad, vehículo), aviso a Juan y auditoría; la nota llega en el próximo pedido; `ordenes_completas` (lista y con motivo); cierre con «Sí» abre el cierre sin cerrarlo; Haiku → Sonnet al pedir una acción y aviso con «Sí»; error 429; `refusal`; sin señal; gasto del día/mes y la línea de menú › Versión; sin scroll de costado en el celu.
- Batería completa en PC y celular: todo OK salvo `t_v083` (reemplazada por `t_v084`). `t_v132` 29/29 en PC y 30/30 en celular; `t_circuito` 16/16 en los dos.
- Prueba vieja cambiada: ninguna.

**Huellas** (sello «2026-11-08 21:36 · 1b9b4d», hora de Argentina al armarla)
- `index.html`: `4fd6d2365174b8df44a48799de8e9acfdca02825134d64c2863d9ef133a1a46f`
- `132_2026-11-09_app-EMA_ORIGINAL.html`: `7eafe4c843acf2a9401b7203ae6db2d79629ead1765d6e0bcb82a2dfe30a1db5`
- `patch_v132.py` (base: ORIGINAL 131 `1ee4cf6a…b15b8`): `f58668f1b9778f6ea3e20072ec76dbddfe65c2bb706388835f8efe735ceac1d1`

## v131 — 08/11/2026 · «🔧 Revisar el catálogo» del pañol y carrusel foto → 3D → plano en cada material y herramienta

**Pedido de Ángel**
- «Corrijamos las cosas mal» del catálogo del pañol.
- «Cada producto tiene su foto: esa es la principal, pero se tiene que poder deslizar y ver el plano y el 3D. Las que no tienen foto quedan con el plano y el 3D hasta que les suban la foto. Lo mismo con herramientas.» Ajuste: sin fondo negro; sin foto, primero el 3D y después el plano; con foto: foto → 3D → plano.

**Cambios**
- **`catalogoArreglos`** — Pañol › Acceso y respaldo › «🔧 Revisar el catálogo» (solo admin/oficina). La app **no arregla sola**: muestra lo que encontró con casillas y recién al confirmar («¿Guardo estos N cambios?» con la lista) escribe en `catalogoProductos` y en la Auditoría.
  - **Unidades:** UN/un/Un/UNIDAD/unidad/u/U → «Un.»; M/METRO/metro/mts/Mts → «m»; KG/Kg → «kg» (marcadas). «c/a» y otras raras: desplegable Un./m/kg/otra, sin proponer.
  - **Código reutilizado:** un código del catálogo original cuyo nombre de hoy no comparte ninguna palabra con el original (el 7013, hoy «ANTEOJO DE SEGURIDAD»). El 7013 vuelve a ser «CONECTOR C COMPRESION para PAT TIPO C CMC -7…» y el anteojo se da de alta con un código que escribe la persona (sugerido: el siguiente libre después del mayor 9xxx en 9001–9499; se valida que tenga 4 cifras, que esté en x001–x499 y que no exista ni tenga movimientos). Opcional: pasar su stock al código nuevo. Los movimientos viejos del 7013 quedan donde están.
  - **Repetidos:** misma descripción normalizada y misma unidad (marcados) y los tres «parecen el mismo, confirmá» (8039→8008, 8042→8005, 8043→8009, sin marcar). Las fichas de baja no cuentan. Unificar = el que sobra queda **de baja** (`activo:false`, `unidoEn`), nunca se borra ni se reutiliza.
  - **Stock de los unificados:** pasa al que queda con el mismo par de movimientos que ya usa el pañol para «🔀 Corrección de código» (salida + entrada con `correccion:true`, `correccionGrupo`, nota «unificación 8039→8008»): queda trazable y se puede anular en pareja. Si el que sobra tiene stock negativo, no se mueve y avisa «pasalo a mano».
  - En la base: el cómputo que enlaza materiales por nombre sigue `unidoEn` (un material unificado se enlaza con el código que quedó).
- **`materialesFichas`** — En la foto de la ficha del material y de la herramienta, un carrusel que se desliza (dedo, ‹ ›, puntitos): foto(s) → 🧊 3D → 📐 Plano; sin foto arranca en el 3D. Usa la misma foto de siempre: cuando la suben, pasa a ser la primera sola. Tocar el 3D o el plano abre la hoja completa en un visor **claro** (fondo del tema) con zoom de dos dedos, rueda, doble toque y ＋/−. Las herramientas del pañol (H-xxx) se buscan por palabras del nombre (tabla de palabras por hoja en el script: «pinza», «guante dielectrico», «busca polo»…; gana la más específica, así «Pinza amperométrica» va a la hoja de instrumentos y no a la de pinzas).
  - Las imágenes **no van en Firestore**: carpeta `materiales/` en GitHub junto al index (`indice.json` + `<hoja>_3d.webp`, `_plano.webp`, `_hoja.webp`). Se piden recién al abrir la ficha; el índice se trae una vez y queda guardado. En el APK, la dirección sale de `__cargador.url`. Sin señal: «Sin señal: el plano se ve cuando vuelva».
  - `herramientas/armar_materiales.py <carpeta de hojas> <salida> [--catalogo …]`: corta plano y 3D de cada hoja vigente (ignora `_v1`/`_vB`/`_vC`, y borra de la salida lo que ya no es vigente), WebP calidad 80 (1400 / 2000 px), lee los códigos y el título del `.svg`, palabras de herramientas de las hojas `mat_herramientas_*`, `mat_epp_*`, `mat_instrumentos_*`, y avisa qué códigos no tienen hoja. Se vuelve a correr cuando hay hojas nuevas (solo rehace lo cambiado).
- Arnés: `h.js` sirve `materiales/` (`op.matDir` o `APPDIR/materiales`; `global.__matSinRed` simula sin señal).

- Carpeta `materiales/` generada con las **96 hojas** vigentes (16 de herramientas, EPP e instrumentos): 289 archivos (≈ 40 MB), **492 códigos con hoja**; los 487 códigos del catálogo base + altas del equipo (`nuevos.csv`) tienen hoja.

**Qué tiene que hacer Ángel**
1. Subir `index.html` y la carpeta `materiales/` a GitHub (junto al index).
2. No hay reglas nuevas ni APK nuevo.

**Pruebas**
- `t_v131` 28/28 en PC y 29/29 en celular: panel de arreglos con el stub (detecta unidades, 7013 y repetidos; no escribe nada hasta confirmar; al confirmar escribe catálogo, par de corrección de stock y auditoría; la cuadrilla no lo ve) y carrusel (sin foto arranca en el 3D, con foto foto → 3D → plano, foto nueva pasa primera, ‹ ›, deslizar, puntitos, visor claro con zoom, sin señal, herramienta con y sin hoja, índice una sola vez).
- Batería completa en PC y celular: todo OK salvo `t_v083` (reemplazada por `t_v084`). En una primera corrida con la máquina cargada fallaron `t_cargador`, `t_v024`, `t_v031` y `t_v078` (tiempos); solas pasaron, y en la corrida final pasó todo.
- Prueba vieja cambiada: ninguna. `h.js` sirve `materiales/`.

**Huellas** (sello «2026-11-08 20:14 · ab52be»)
- `index.html`: `6afbdb593a40b123d3f7412cda29ccab948ed4f75c30fa794cbfe94c75790f15`
- `131_2026-11-08_app-EMA_ORIGINAL.html`: `1ee4cf6ac7a02929655c25fb5d85497192b9de3c5c8b6ee272dc4c5b8b6b15b8`
- `materiales/indice.json`: `54b2bcc97c23bc07ac53ca9046639d88b5708e72759039d0bbe3506f1cea229a`

## v130 — 07/11/2026 · Mis tareas por tarjetas, «te faltan fotos» con el porqué y galería con quién sacó cada foto

**Pedido de Ángel** (eligió los modelos en imágenes antes)
- «Que se distingan bien las tareas… tarjetas por cada tarea, con una flecha a la derecha o izquierda que te lleva a otra… el nombre un poco más grande.» «Hiciste 3 de 5, te quedan 2, en verde y rojo» (chiquito). «Si no sacó alguna foto, que lo deje cerrar pero que le salga "te faltan…"… y que ponga por qué.» «Entrar a la foto del tablero y ver quién la sacó… como galería.»

**Cambios** (`tareasTarjetas`; con `__ofCompat` o `__mtTarjetasNo` no aparece)
- **Una tarea por vez:** con 2 o más tareas tuyas en la orden, se ve una sola tarjeta con ‹ › (o deslizando con el dedo) y puntitos (verde mandada, rojo «no se hizo»). Arranca en la primera sin mandar y, al mandar una, pasa sola a la siguiente. El nombre de la tarea va más grande (22 px).
- **Arriba, una línea finita:** «✅ 3 de 5 hechas ▬ 2 te quedan» (cuenta las tareas mandadas).
- **Te faltan fotos:** «📤 Listo, enviar esta tarea» con fotos sin sacar ya no frena. Sale «⚠ Te faltan N fotos» con cuáles, y dos opciones:
  - «📷 Sacar las que faltan» (lleva a la primera);
  - «Enviar igual», que pide el porqué: sin batería / celu roto, no se ve (de noche), no había acceso, u otro con texto.
  - Queda en `campo.sinFotos.<tarea>.<persona>` y la oficina lo ve en el cierre de esa tarea (`.ff-cierre`).
- **Galería de cada foto pedida:** tocando una foto pedida ya sacada (ej. «Tablero por dentro ›»), se abre su galería con cada foto, quién la sacó y la hora, más «📷 Sacar otra» (hasta 4). Tocando una se ve grande.
- En la base: ganchos `__mtTareaCab` (arriba de cada tarea) y `__mtProgHtml` (la línea de arriba) en la plantilla de Mis tareas, y `__fotosFaltanPop` en el envío de la tarea.
- Arnés: `tarjetas:true` prende las tarjetas; las pruebas viejas siguen viendo todas las tareas juntas (`__mtTarjetasNo`).

**Pruebas**
- `t_v130` 10/10 en PC y 11/11 en celular.
- Batería completa (incluye la v129) en PC y celular: todo OK salvo `t_v083` (reemplazada por `t_v084`).

**Huellas** (sello «2026-11-07 12:05 · 0c3700»)
- `index.html`: `8205c2f724258adbd0f0e78892671de097e5c1883475c1ecd896efbf13708fc0`
- `130_2026-11-07_app-EMA_ORIGINAL.html`: `75e2c2ffffcef14ffcb8cf556eab86c42fd61cfb20215794c7f6515f88b8d947`

## v129 — 07/11/2026 · Cierre: las horas que puso la cuadrilla y «✅ Aprobar» por tarea o todo junto

**Pedido de Ángel**
- «En esa hora me tiene que salir el horario que la app le hace poner a ellos, y falta un botón para aprobar esa tarea… que se pueda aprobar por tarea y también en su totalidad.» Al aprobar una tarea: **puntos al toque** (lo eligió él).

**Cambios**
- **Horas:** la fila de cada tarea del cierre arma las horas de inicio y fin con lo que mandó la cuadrilla (`campo.horasTarea`), si la oficina no cargó otras. Antes se ponían después, con un relojito, y a veces no llegaban.
- **`aprobarTarea`** (con `__ofCompat` no aparece):
  - **«✅ Aprobar esta tarea»** en cada fila: guarda el cierre solo con esa tarea y las ya aprobadas, así sus puntos y su avance de obra se suman en ese momento. La orden sigue «En curso» para las demás, la ventana no se cierra y lo cargado en las otras no se pierde. La aprobada queda en verde («✅ Aprobada · quién · hora», con «Volver a aprobar»). Cuando se aprueba la última, la orden queda terminada.
  - **«✅ Aprobar todo y cerrar»** al lado de «Guardar lo hecho»: aprueba todas y termina la orden.
  - Si falta responder la pregunta del itemizado, avisa y lleva hasta ahí.
  - Queda en `cierre.aprobadas.<tarea>` = {ts, por}. «Guardar lo hecho» sigue como siempre.
- En la base: `guardarCierreOt` llama a `__aprobFiltrar(t, d)` (solo las aprobadas al aprobar una) y guarda `aprobadas` (`__aprobLeer`).

**Pruebas**
- `t_v129` 9/9 en PC y 10/10 en celular. Se entrega junto con la v130 (la batería completa se corrió sobre la v130).

## v128 — 07/11/2026 · En el cierre, por tarea: repartir sus puntos, pasar lo que falta a otro día y corregir la tarea; fotos más rápidas; tarea en una orden sin cerrar; «Unir» que no vuelve a aparecer

**Pedido de Ángel**
- «En cada tarea tendría que tener la posibilidad de… pasar lo que no se hizo para otro día y poder elegir para qué día… y si quiero asignar a las mismas personas o a otras… y para repartir los puntos, por tarea según a quién le di: una ventana con las personas de esa tarea, los puntos totales y repartir uniformemente o darle más a uno.»

**Cambios**
- **`cierreTarea`** (con `__ofCompat` no aparece): debajo de cada tarea del cierre, dos botones:
  - **«👥 Puntos de esta tarea»** (`#ctPop`): la gente a la que se le dio esa tarea (por «Elegir quiénes», reparto o asignada; si no, toda la orden), los puntos de la tarea, «⚖ Repartir parejo», a mano por persona («Te quedan N…»), «Como siempre (rol y horas)». Se guarda con el cierre en `cierre.puntosTarea.<tarea>` = {persona: puntos}; `puntosDeOrden` reparte esa tarea así (en la misma proporción si cambia la cantidad) y el resto como siempre. Si estaba tildado el reparto a mano de la orden entera, se destilda.
  - **«📅 Lo que falta, a otro día»**: cuánto (de entrada, previsto − hecho), qué día (de entrada el próximo hábil) y quiénes (los de la tarea tildados; se puede sumar cualquiera de la nómina). Si ese día ya hay una orden abierta de esa obra, se suma ahí (tarea, cantidad, gente, a quién); si no, se arma una orden nueva con esa tarea (`vieneDe`). A cada uno le llega el aviso. La orden de hoy guarda `pasadoA.<tarea>` y lo muestra.
  - **«🔁 Era otra tarea»**: si se cargó la tarea equivocada, se busca la correcta en el catálogo (con lo que vale); se cambia en la orden (actividades, previsto, a quién / quiénes, etapas; queda `tareasCambiadas`) y el cierre se vuelve a abrir con lo cargado (cantidad, horas, gente, novedades, el reparto de la tarea). Los puntos salen con lo que vale la tarea correcta.
- En la base: gancho `__cierreTareaBtns` en la fila de la tarea del cierre; `guardarCierreOt` guarda `puntosTarea`; `puntosDeOrden` lo usa.
- **La foto desde la tarea tardaba ~13 s** (cuadrilla): la app esperaba el GPS (hasta 5 s), la nube (hasta 8 s) y la base (hasta 6 s, dos veces), una atrás de la otra. Ahora (`fotoRapida` + ajustes): si el seguimiento en vivo tiene una ubicación reciente y buena se usa al instante; si no, el GPS espera 1,5 s (3 s si no hay ninguna); la nube 5 s; la base 2,5 s — si tarda más, la foto queda en el celu y se sube sola por atrás. Medido en la prueba: GPS lento + nube a 2 s: 7,1 → 5,1 s (0 s de GPS con el seguimiento en vivo); todo lento y sin señal: 13,1 → 8,1 s. Menú › Versión muestra cuánto tardaron las últimas fotos (`ema.fotos.tiempos`).
- **Tarea que está en una orden sin cerrar** (`tareaSinCerrar`; Ángel: «me dice que ya se hizo pero no cerré esa orden… tendría que decirme orden no cerrada, ¿asignar igual?… y que se abra esa tarea sola para cerrarla rápido»): en «Llenar orden», cada tarea que está en una orden de esa obra de hoy o de antes sin cerrar muestra «⚠ Está en la OT-xxx del …, sin cerrar» con **«Asignar igual»** (la tilda con esa cantidad y en «¿por qué asignás de más?» ya viene «Sigue de la OT-xxx (sin cerrar)») y **«⚡ Cerrar esa tarea»** (abre el cierre de esa orden mostrando solo esa tarea, con «Ver todas»; si la orden tiene otras tareas, no la da por terminada).
- **«Unir» no funcionaba bien** (Ángel: «ayer uní y me siguen apareciendo»). Por qué: el celu de la cuadrilla, sin señal, mandaba tarde sus marcas a la orden vieja con «En curso» y la orden anulada se volvía a abrir; con tres o más órdenes se perdían las fotos de la segunda; y al volver a unir se sumaba dos veces lo previsto. Ahora (`unirSeguro` + `unaObra`):
  - unir es una sola escritura de las dos órdenes (todo o nada) y la buena anota `unidas.<id>`: si se vuelve a unir, solo pasa lo nuevo de la cuadrilla, sin sumar cantidades otra vez;
  - con tres o más, quedan las fotos y marcas de todas;
  - lo que el celu manda a una orden ya unida va a la orden buena; si el celu no sabía, la base lo rechaza (**reglas v128**) y el celu lo redirige solo.
- **Reglas v128** (`firebase/Reglas_Firestore_v128.txt`) = v125 + la cuadrilla no puede reabrir una orden anulada o terminada (`marcaCampo` mira también el estado de antes). Hay que publicarlas.

**Pruebas**
- `t_v128` 10/10 en PC y 11/11 en celular; `t_v128b` 5/5 (tiempos de la foto); `t_v128c` (tarea sin cerrar) 6/6 PC y 7/7 celular; `t_v128d` (unir) 10/10.
- Batería completa en PC y celular: todo OK salvo `t_v083` (reemplazada por `t_v084`).

**Huellas** (sello «2026-11-07 09:57 · ff75ef»)
- `index.html`: `e5f2d57a7be20d7f92a81e79b7deca5cd168b5066346773ed84e25c30031bb30`
- `128_2026-11-07_app-EMA_ORIGINAL.html`: `7453f35d75f0d3ecf8ea1cdf5a49fee72a161ae1a94ba22e84fec2f6187250dc`

## v127 — 06/11/2026 · Ver y corregir los puntos de una orden cerrada; en Producción, las órdenes de cada obra

**Pedido de Ángel**
- «Si quiero modificar porque no di puntos a una tarea, me tendría que salir los puntos y las tareas… en Producción que entre a la obra y me salgan todas las OT… y que entre a la OT con dos subíndices: la orden sola con todas las tareas y otro para editar los puntos (personas y puntos por las tareas dadas).»

**Cambios**
- **`puntosEditar`:** ventana `#peOv` de una orden con «📋 La orden» (gente con horas, tareas con previsto / hecho / no se hizo, notas, «✏ Abrir el cierre») y «⭐ Puntos»:
  - cada tarea con su cantidad hecha y **cuántos puntos vale cada unidad en esta orden** (las de 0, en rojo);
  - al cambiar un valor, el total sube y se reparte entre la gente **como estaba** (por partes iguales si estaba todo en 0); se puede corregir a mano cada persona, con «Te quedan N para repartir» y «Repartirlos entre los demás»;
  - guarda `cierre.puntos` (foto fija con renglones y porPersona `aMano`), `cierre.reparto` y `cierre.puntosHist` (quién, cuándo, antes → después); si la quincena está cerrada, avisa antes.
- Se abre con «⭐ Puntos» en las tarjetas cerradas del tablero y en las filas cerradas del Historial; y en **Producción** › persona: tocar una **obra** deja solo sus órdenes y tocar una **orden** abre la ventana.
- No cambia lo que vale cada tarea en «Cuánto vale cada tarea» (eso sigue para las órdenes que se cierren desde ahora).

**Pruebas**
- `t_v127` 11/11 en PC y 12/12 en celular.
- Batería completa en PC y celular: todo OK salvo `t_v083` (vieja).

**Huella SHA-256**
- `127_2026-11-06_app-EMA_ORIGINAL.html`: `be5dc1d9b50cdb5e055695e394c734146ee73de42bb0253b2866f97dd925df5d`
- `index.html`: `6ca86dafeb55f5ad6ca3cd9ae4ec9f51530e8a2495f21d403662662270576d06`

## v126 — 06/11/2026 · Una sola orden por obra y por día (incluye la v125)

**Pedido de Ángel**
- «Tendría que haber una sola orden por obra… y ahí dividir qué hace cada uno»; «no le está apareciendo la foto de uno al otro».
- Causa: las fotos y marcas se comparten dentro de UNA orden (eso anda: `t_v076`). Con dos órdenes para la misma plaza el mismo día, cada uno ve solo las de la suya.

**Cambios**
- **`unaObra`** (con `__ofCompat` no actúa):
  - al emitir una orden nueva para una obra y un día que ya tienen otra abierta, cartel `#uoPop`: «➕ Sumar a la OT-xxx» (tareas, cantidades sumadas, gente, quién hace qué, vehículos, notas; avisa a los que se suman) · «Hacer otra orden igual» · «Cancelar»;
  - en el tablero, aviso `#uoAviso` «⚠ Obras con más de una orden el mismo día» con «Unir en OT-xxx»: pasa a la más vieja tareas, gente, fotos, marcas (la más completa), horas, envíos y la seguridad; la otra queda **Anulada** con `unidaEn` (no se borra). Pregunta antes. Las cerradas no se tocan.
- En la base no cambia nada más; no hay reglas nuevas (además de las v125).

**Pruebas**
- `t_v126` 8/8 en PC y 9/9 en celular.
- `t_v122` actualizada: cuando sale el cartel nuevo toca «Hacer otra orden igual» (la prueba arma varias órdenes para la misma obra y día a propósito).
- Batería completa en PC y celular: todo OK salvo `t_v083` (vieja); `t_cargador` falló una vez con la máquina cargada y pasa sola en PC y celular.

**Huella SHA-256**
- `126_2026-11-06_app-EMA_ORIGINAL.html`: `a075a98b19e7895e595659e34d46e0a74699f366fc7815ccaca267ec52d873d0`
- `index.html`: `fc513bb4d3217c64a29670d09f7d7052aac35282fecc3eb17f0bc13167cd60b8`

## v125 — 06/11/2026 · La cuadrilla saca fotos de cualquier obra, aunque no tenga orden ahí (reglas v125)

**Pedido de Ángel**
- «Los de cuadrilla solo pueden sacar fotos a los lugares que tienen OT… tienen que poder buscar cualquier plaza.» (Lo aprobó: «Bueno, sí».)

**Cambios**
- **Cámara del menú** (`camaraApp`): para la cuadrilla/operario confirmado, «¿De qué obra?» muestra también la lista de **Obras** con buscador (antes solo la oficina), y «📍 Parece que estás en…» por el GPS (ya existía, ahora también para ellos). La foto va al legajo de la obra con `otId` vacío y `origen:'cuadrilla'`. Con `__ofCompat` (pruebas viejas) sigue como antes.
- Sin las reglas nuevas publicadas: la foto queda en el celu y avisa «falta que la oficina publique las reglas nuevas de Firebase (v125)»; se sube sola cuando estén.
- `guardarFotoObra`: si la foto queda esperando permiso, la ficha del legajo (`fotosObra`, con su miniatura) también queda en la cola y se sube con ella (antes se perdía la ficha).
- **Reglas `Reglas_Firestore_v125.txt`** = v089 + `fotoLibre()`: cuadrilla/operario confirmado puede **crear** `adjuntos` y `fotosObra` sin orden (`otId` vacío) y con la obra (`plazaId`). No puede cambiar ni borrar fotos. `reglas_stub.js` igual (con `__reglasSinV125` para simular las reglas de antes).

**Pruebas**
- `t_v125` 6/6 en PC y 7/7 en celular.
- `t_v069` y `t_v070` actualizadas: ahora quedan **2** cosas en la cola del celu cuando la base rechaza la foto (la foto y su ficha del legajo), antes 1.
- Batería completa en PC y celular: todo OK salvo `t_v083` (vieja).

**Huella SHA-256**
- `125_2026-11-06_app-EMA_ORIGINAL.html`: `17609692a5f28f1b7c562108983461a5225053b814b800b76af8d6fba69c70d3`
- `index.html`: `643cb2af1073369f2f752d92d71ceffdd847659f0d5faa8d914ced9a2109ad96`
- `Reglas_Firestore_v125.txt`: `737ed1b18c5699669ac65ff292c85e30a298cd42abfa7c43a14729e22d49ca29`

## v124 — 06/11/2026 · Tablero de órdenes por subíndices (incluye la v123)

**Pedido de Ángel**
- «La parte de tablero tendría que ser con subíndices: hoy, recibidas para verificar y cerrar, futuras por fecha como calendario (tocás la fecha y te sale todo), cerradas aparte, sin cerrar o anuladas… más ordenado.»

**Cambios**
- **`tableroSub`** (con `__ofCompat` siguen las 4 columnas): Órdenes › Tablero con subíndices 🔧 Hoy · 🔔 Para revisar y cerrar · 📅 Próximas · ⚠ Sin cerrar · ✅ Cerradas · 🚫 Anuladas, cada uno con su cantidad (naranja si hay para revisar, rojo si hay sin cerrar).
  - Arranca en «Para revisar» si hay algo; si no, en «Hoy». Se acuerda del último (`localStorage ema.tb.sub`).
  - «Próximas»: calendario del mes (‹ ›) con los días que tienen órdenes; al tocar el día salen sus órdenes.
  - Las tarjetas son las de siempre (`Oe`): revisar y cerrar, editar, mover. El buscador filtra todos los subíndices.
  - Cerradas y anuladas de a 24, con «Ver más».
- En la base: `B()` llama a `window.__tbSubHtml(grupos, tarjeta)`; `window.__tbB` redibuja.

**Pruebas**
- `t_v124` 10/10 en PC y 11/11 en celular.
- `t_circuito` actualizada al subíndice «Para revisar y cerrar».
- `t_v121` arreglada: el corte de prueba era de «hace 3 horas» y, cerca de la medianoche, caía en el día anterior y el aviso no salía (no era un error de la app).
- `envolturasUnaVez` va justo después de `relojitosAhorro` (que tiene que seguir primero, `t_v114`).
- Batería completa en PC y celular: todo OK salvo `t_v083` (vieja); `t_v121`, que fallaba por la hora, pasa sola en PC y celular.

**Huella SHA-256**
- `124_2026-11-05_app-EMA_ORIGINAL.html`: `ff3345267f3eac0f42b011e4bfca3f02792bb29b667d5fd97655319a4b49f2fc`
- `index.html`: `8ee21cb2ce5d4662734d320ac17502473d9764714b94fce449316c9a62095e5f`

## v123 — 05/11/2026 · La cuadrilla manda cada tarea apenas la termina («Se hizo» / «No se hizo» con el porqué)

**Pedido de Ángel**
- «Que se pueda enviar por tareas… lo que no se puede hacer, ponerle que no se hizo por qué y que desaparezca… verde se hizo, rojo que no… que les quede limpio.» Hoy, si una tarea no se podía terminar, sus fotos trababan el envío de toda la orden.

**Cambios**
- **`envioTarea`** (con `__ofCompat` sigue como antes):
  - «✓ Se hizo» → fotos y cantidad → «📤 Listo, enviar esta tarea»: pide las fotos y medidas **solo de esa tarea** y abre el cartelito «⏱ ¿De qué hora a qué hora?» (inicio = fin de la tarea anterior o la hora de la orden; fin = ahora) → Enviar;
  - «✗ No se hizo» abre directo «¿Por qué no se hizo?» (Lluvia · Faltó material · Falta EPEC · No alcanzó el tiempo · Otro + nota) → Enviar;
  - la tarea mandada queda en una línea verde o roja con lo hecho, las horas o el porqué, y «Corregir»;
  - guarda `campo.tareaEnv.<tarea>.<persona>` = {estado si/no, ts, por}, las horas en `campo.horasTarea`;
  - aviso a la oficina por cada tarea (`tipo:'envio'`, tag `ema-envt-…`);
  - cuando están todas mandadas, la orden se envía sola («Mis horas» del primer inicio al último fin) y pasa a Terminadas;
  - el botón general «Enviar lo de hoy» queda escondido hasta entonces, con la guía «Te quedan N de M»; el recuadro de horas de la v121 dentro de la tarea ya no se muestra (lo pide el cartelito).
- Ganchos nuevos en la plantilla de `ordenesCampo`: `__mtAPI`, `__mtTareaClase`, `__mtTareaPie`, `__mtAccAntes`, `__mtEnvClase`.
- **Fotos «esperando que la oficina arregle el permiso» que ya estaban arriba** (Pablo Picone, OT-154 / OT-158, «en el celu figura bien»): la cuadrilla puede **crear** la ficha de la foto pero no **reescribirla**. Si la primera subida llegó y el celu no se enteró (mala señal), cada reintento era una reescritura y la base lo negaba para siempre. Ahora, ante un «permiso negado», `fotosSinSenal.mandar` se fija en la base (`get({source:'server'})`): si la foto ya está, la saca de la cola (`__fotosYaArriba`). Sin cambiar reglas.
- **Fotos de una orden que se borró** (Ángel: «una vez que le llega ese cartel no se le sale… eso no debería pasar»): si la foto no está arriba y la orden ya no existe, queda marcada `huerfana`, sale del candadito y de los reintentos, y aparece un aviso claro «🗑 N fotos de una orden que ya no existe (OT-xxx): no se pueden subir · Sacarlas del celu» (`#fssHuerf`, con confirmación). El candadito queda solo cuando de verdad falta un permiso.
- **Una tarea escrita a mano sin puntaje trababa «Emitir» y «Guardar cambios»** (OT-188 de Ángel con «limpieza general»; también el «no me deja crear» con «prueba internas control»): el aviso «Poné cuántos puntos vale…» quedaba escondido en el paso 3 y parecía que no hacía nada. Ahora guarda igual: la tarea queda suelta, sin puntaje, con aviso en naranja; las que tienen puntos se suman a la lista como antes.
- **«Se tilda» / el cartel «⏳ La señal está lenta» repetido decenas de veces** (Ángel, 06/11): 32 envolturas de funciones (`emitirOrdenTrabajo`, `datosOtDesdeFormulario`, `editarOrdenTrabajo`, `abrirCierreOt`…) se fijaban con su propia marca (`__ed`, `__saldo`, `__eq`, `__cs`…) si ya habían envuelto, pero la envoltura nueva no traía las marcas de las otras: se envolvían entre ellas cada segundo, sin fin (ya pasaba en la v121: unas 200 envolturas nuevas en 30 s). Con la app abierta un rato, cada «Guardar» corría decenas de veces y todo se ponía lento. Ahora `window.__heredar` (script `envolturasUnaVez`, antes de `relojitosAhorro`) le pasa las marcas a cada envoltura nueva: queda quieta.
- **Barra de abajo de «Llenar orden»** (celular): sin su propio «Emitir» (Ángel: «a todo dice emitir»); queda «Ver resumen», y el botón del resumen dice «Guardar cambios en OT-…» cuando se edita.
- **«Guardar cambios» con mala señal** espera como mucho 15 s (`fbOtUpdate`, igual que «Emitir» en la v122) y no espera los avisos a la gente nueva.

**Pruebas**
- `t_v123` 18/18 en PC y 19/19 en celular (incluye la foto que ya estaba arriba y la de una orden borrada).
- `t_v123b` 5/5 en PC y celular (editar con tarea a mano sin puntaje; guardar con la señal lenta; las funciones no se vuelven a envolver solas — la v122 falla esta; sin «Emitir» en la barra).
- Batería completa: ver abajo.

## v122 — 05/11/2026 · Cambiar el orden de las tareas y «no me deja crear» la orden

**Pedido de Ángel**
- «También estaría bueno poder cambiar el orden de las tareas una vez que las armo.»
- «No me deja crear» (la orden quedaba con «⚠ Ingresá el nombre/número de la cuadrilla.», con el campo escondido en el paso 2).

**Cambios**
- **`ordenTareas`:** en «Llenar orden», arriba de la lista de tareas, «↕ Orden de las tareas» con ↑ ↓ (desde 2 tareas tildadas). Ese orden queda en `ot.actividades`: así lo ve la cuadrilla y así sale en la hoja. Al editar, arranca con el orden guardado.
- **`emitirSeguro`:**
  - si el nombre de la cuadrilla está vacío, se pone solo con los nombres de la gente («Marcos y Mauricio»);
  - el cartel rojo de un intento anterior se borra apenas cambiás algo;
  - `fbOtAdd` guarda con `doc().set()` y espera como mucho 15 s: con señal lenta o la base al tope, la orden queda en el aparato y se sube sola (cartel ⏳); si después la base la rechaza, avisa;
  - «Emitir» ya no espera los avisos a la cuadrilla ni al responsable (salen igual, por atrás).

**Pruebas**
- `t_v122` 8/8 en PC y 9/9 en celular; `t_circuito` 15/15.
- Batería completa en PC y celular: 236 OK. Solo falla `t_v083`, que es vieja.

**Huella SHA-256**
- `122_2026-11-05_app-EMA_ORIGINAL.html`: `9201086a5d1820f3d9eaf6916b9b4ac4059615138fc143389a93a695a7f2f740`
- `index.html`: `d3738c6d0639df5371621b7f137702d4e6c25ead72a2c2fa48b3a2bdbeb22edb`

## v121 — 05/11/2026 · Hora de cada tarea obligatoria para la cuadrilla y personas en el buscador del Mapa (incluye v120)

**Pedido de Ángel**
- «Cuando llenan las tareas… que pongan cuánto se tardó en cada tarea, sí o sí.»
- «En el buscador del mapa, que también pueda buscar personas.»
- «Personal en vivo» abajo de las plazas, y el aviso de cortes salía una palabra por renglón.

**Cambios**
- **`horasTarea`:**
  - en Mis tareas, cada tarea con «✓ Se hizo» muestra «⏱ ¿De qué hora a qué hora? · obligatorio» (gancho `__mtHorasTareaHtml` dentro de la plantilla);
  - se guarda en `campo.horasTarea.<tarea>` = {ini, fin, por, ts} por `mtCampoGuardar` (anda sin señal);
  - «Enviar» no deja mandar si falta alguna hora o si el fin es antes del inicio;
  - en el cierre, `cierre-hini/hfin` vienen completas con lo de la cuadrilla.
  - Las pruebas viejas (`__ofCompat`) siguen sin exigirlo.
- **`mapaPersonas`:** el buscador del Mapa encuentra personas de «Personal en vivo»; al tocarla, el mapa va a donde está, y la lista de personal también se filtra.
- **«Personal en vivo»** pasa abajo de la lista de plazas, y los avisos (`.uv-porque`) van a lo ancho, en la columna 2 de la grilla.

**Pruebas**
- `t_v121` 4/4 en PC y 5/5 en celular.
- `t_circuito` 15/15: sin horas no envía; con horas envía, y el cierre las trae.
- Batería completa en PC y celular: 234 OK. Solo falla `t_v083`, que es vieja.

**Huella SHA-256**
- `121_2026-11-05_app-EMA_ORIGINAL.html`: `67b10d2055b4b0c4d5da9b648f2b51673a4f92690656a2432d3648b28d7083be`
- `index.html`: `50de323a9ef32e8c8c508922015a86e10b3b1443b5327ae0d3c971565b31064c`

## v120 — 05/11/2026 · Revisión del circuito de la cuadrilla en el celu

**Pedido de Ángel**
- «Fijate que esté funcionando todo bien. El tema de la cuadrilla también, fijate si le funciona bien; hacé pruebas.»
- Mandó fotos de «Órdenes que seguís»: larga, con fechas «2026-11-05».

**Prueba nueva: `t_circuito`** (circuito completo con todo lo nuevo prendido):
1. La oficina arma la orden por pasos y avisa a cada uno.
2. La cuadrilla en el celu ve la orden en Hoy, completa «🦺 Antes de arrancar», saca una foto por columna (eligiendo cuál) y envía.
3. La oficina la ve «Para revisar» en el tablero y la cierra: quedan los puntos, avanza el itemizado y se avisa.
4. A la cuadrilla le queda en «Terminadas».

12/12 en PC y celular. Se revisaron a ojo las capturas de cada pantalla.

**Cambios (lo que se encontró)**
- «👔 Órdenes que seguís» **solo de hoy y ayer, y nunca las ya cerradas**. Ángel: «las cerradas no me tienen que salir; solo las de hoy, o entre hoy y ayer». La OT-174 del 03/11 aparecía como si fuera de hoy. Las atrasadas siguen en Órdenes › Tablero.
- «👔 Órdenes que seguís» compacta: las para cerrar siempre a la vista y el resto plegado con «Ver todas las que seguís (N más)». Fechas `05/11/2026` y botones en una línea (📸 · ✅ Cerrar).
- **`seguimientoEditar`:** «✏ Editar» en cada fila de 📌 Seguimiento. Ángel: «tengo que poder editar, por ejemplo cancelar esa tarea… una ventana mediana».
  - Se puede cambiar cuánto (`previsto`) y quién (`asignada`: toda la cuadrilla o una persona), «🚫 Sacar esta tarea de la orden» (guarda `ot.tareasSacadas` con quién y cuándo) y «Abrir la orden completa».
  - Una orden cerrada no se toca. No se saca la única tarea de una orden (en ese caso se anula la orden). Si la cuadrilla ya marcó la tarea, avisa. Una tarea con reparto especial se cambia en la orden completa.
- La barra de abajo de «Llenar orden» en el celu es blanca, sin transparencia: ya no se ve el texto de atrás. Además, más espacio abajo.
- Fotos por columna: el nombre se ve completo («T1 · C1 · Col 2»), en dos renglones si hace falta; antes se cortaba en «T1 · C1 · …».

**Pruebas**
- `t_v120`: 4/4 en PC y 5/5 en celular.
- `t_v120b` (editar desde Seguimiento): 6/6 en PC y 7/7 en celular.
- `t_v113` actualizada: la orden cerrada ya no aparece en «Órdenes que seguís».
- Batería completa en PC y celular, con `t_circuito`: 232 OK. Solo falla `t_v083`, que es vieja.

**Huella SHA-256**
- `120_2026-11-05_app-EMA_ORIGINAL.html`: `f19aa8ceb8a612eaa38d1ee3562428217f6b96d0009be002b7cbee5b29bc0ae2`
- `index.html`: `90112bca6da4f1004cf8827ea7d5a0e585778b4693af0e5bb07a776c424154b0`

## v119 — 04/11/2026 · Nada encima mientras escribís, editar sin pisar órdenes viejas, calendario en Planificación (incluye v118)

**Pedido de Ángel**
- La OT-2026-098, vieja y cerrada, apareció con fecha 05/11: «yo no la creé». Probablemente se guardó una edición sin querer, porque «Llenar orden» seguía en modo edición.
- «Cuando escribo la obra se me sobrepone una lista» y el cartel de pendientes: «nada que se abra solo encima».
- La hoja de otra orden (la 098) quedaba abajo de la orden nueva.
- La lista de nombres del teclado salía transparente y encimada.
- Planificación en el celu: «un calendario, aprieto el día y me aparece ese día»; imprimir eligiendo qué órdenes; franja celeste EMA por obra.

**Cambios**
- **`edicionClara`:**
  - cartel naranja fijo «✏ Estás EDITANDO la OT-xxx…» con «✕ Salir y hacer una orden nueva»;
  - si cambiás de pestaña o salís de Órdenes sin guardar, la edición se cancela sola y el formulario queda limpio;
  - si cambiás la fecha al guardar, pregunta antes (y avisa si la orden ya estaba cerrada);
  - la hoja de la derecha se vacía apenas tocás el formulario o entrás a «Llenar orden».
- **`planCalendario`:**
  - calendario del mes en Planificación, con cuántas órdenes tiene cada día; tocás un día y se ve solo ese día;
  - «🖨 Imprimir…» con casillas por orden (`window.__planSoloIds` / `__planConEntradas` en `imprimirPlanificacion`).
- **Planificación detallada impresa:** franja celeste EMA (`#e3f2f8`, borde `#84C3DA`) en cada orden.
- **`sugerencias`:** en el celu, los `<datalist>` se reemplazan por una caja blanca de la app con botones de 44 px.
- **Buscador de la obra sin lista** (`otPlazaBuscar` sin `list`). El cartel de tareas pendientes ya no se abre solo: se abre con «📋 Ver las N tareas pendientes de la obra». En la v118 esperaba a que se terminara de escribir.
- **Pruebas actualizadas:** `t_v112` y `t_v118` ya no esperan que el cartel de pendientes se abra solo.

**Pruebas**
- `t_v118` 3/3 y `t_v119` 12/12 en PC (13/13 en celular).
- Batería completa en PC y celular: 226 OK. Solo falla `t_v083`, que es vieja.

**Huella SHA-256**
- `119_2026-11-04_app-EMA_ORIGINAL.html`: `f99fb3210ffdda35cd00489c3774604a737fe630e39478a537450423d425f347`
- `index.html`: `db99676d2543e6cc880c7576384b794b280e4ea08a4ca9639b5e276d433367d6`

## v117 — 04/11/2026 · Menos lecturas de Firebase + el 👁 vuelve a mostrar la orden

**Pedido de Ángel**
- Firebase dio «429»: el plan gratis llegó al límite de lecturas del día. «¿Cómo podés hacer para que no pase eso?»
- «Aprieto el ojito para ver y no funciona.»

**Cambios**
- **Personal en vivo:** la oficina escucha `ubicacionVivo` solo con el Mapa abierto, y a los 15 s de salir deja de escuchar.
  - Antes escuchaba desde que entraba: cada ubicación de la cuadrilla (1 por minuto por persona) era una lectura para cada aparato de la oficina.
  - `window.__uvEscucharSiempre` vuelve al comportamiento de antes.
- **`lecturasCuenta`** (después del SDK, antes de las escuchas): cuenta aproximada de lecturas por aparato, por día y por colección. Al abrir una escucha cuenta su tamaño; después, los cambios que llegan del servidor; `get` cuenta lo que trae.
  - Queda en `localStorage ema.lecturas`, se ve en menú › Versión y en `__lecturas`.
  - No cambia nada de lo que lee la app.
- **👁 Ver orden** (Historial, tablero, legajo): ahora pasa a «Llenar orden», que es donde se arma la hoja, y la muestra. Antes se armaba escondida.
  - Con una orden a la vista, el resumen de la derecha deja de quedar fijo arriba (`#ofResumen.of-estatico`).
- **`pdfLogo`:** después de la captura con html2canvas, cada imagen `data:` (el logo) cuyo lugar quedó en blanco se dibuja a mano. Es un refuerzo para los celulares que no la dibujan. El PDF de Ángel tenía el logo: el visor del celular lo mostraba bajado.
- **Worker `ema-avisos` v116:** la clave VAPID se lee una sola vez y solo si hay avisos para navegador. El 429 se explica en castellano.

**Pruebas**
- `t_v117`: 7/7 en PC y celular (con el PDF con logo). `t_v077`, `t_v109`, `t_v110` y `t_v116` repetidas con el refuerzo del logo: OK.
- El contador, probado en Node con clases falsas y en Chromium con el SDK compat 12.17.1 real, sin red.
- Batería completa en PC y celular: 222 OK. Solo falla `t_v083`, que es vieja.

**Huella SHA-256**
- `117_2026-11-04_app-EMA_ORIGINAL.html`: `e7376e5a2c24aed2d96ea2b6b398d72a0fe92c6961f8b57a21c6d2b6b00ced6a`
- `index.html`: `20faed966321f811e27a86c4589fc25232c427b2fc0048e7dea40abf23fe49d1`

## v116 — 04/11/2026 · «Compartir» con WhatsApp en la app de Android + resumen de la orden sin encimarse

**Pedido de Ángel**
- «Cuando pongo compartir ya no me sale WhatsApp y otros como me salía antes; está bien que salga copiar, pero también que salga WhatsApp.»
- «Mirá otro error, se sobrepone»: el resumen de «Llenar orden» se encimaba con la hoja.

**Cambios**
- **`compartirApp`:** en la app de Android, `navigator.share` / `canShare` se arman sobre el plugin Share, porque el WebView no los trae. Los archivos se guardan en la caché con Filesystem. Si el menú se cierra sin elegir, da `AbortError`.
  - Así abren el menú del celular (WhatsApp, Drive, Gmail…) todos los «Compartir» que usaban Web Share: la ubicación de la plaza, las fotos, el ZIP…
  - En el navegador no cambia nada.
- **`#ofResumen`:** fondo blanco sólido, sin vidrio, con sombra y `z-index`. Si es más alto que la pantalla, se baja adentro del recuadro.
- Incluye la v115 (avisos FCM).

**Pruebas**
- `t_v116`: 4/4 en PC y celular.
- Batería completa en PC y celular: 220 OK. Solo falla `t_v083`, que es vieja.
- `t_v112` y `t_v113` repetidas con el arreglo del resumen: OK.

**Huella SHA-256**
- `116_2026-11-04_app-EMA_ORIGINAL.html`: `3d8f6459e489ffc8525de2a35d2e1a762d5162a5cd7e1ff0568d7a38e9b10d33`
- `index.html`: `bda1bb7abf360cea812b526f0a8efc9ac94f6f38505c3a5b5159a5a29e6f23fc`

## v115 — 04/11/2026 · Avisos con la app cerrada en la app de Android

**Pedido de Ángel**
- Terminar los avisos de la app 1.3: «¿cómo sería el tema de los avisos?». Pasó el código del Worker `ema-avisos`.

**Cambios**
- **Worker `ema-avisos` v115** (`workers/ema-avisos.js`, se pega en Cloudflare):
  - además de Web Push, manda por **FCM HTTP v1** a los `pushSubs` con `tipo:"fcm"` (campo `fcm` = token);
  - usa la misma cuenta de servicio (`FB_SA_JSON`): el token pide también el permiso `firebase.messaging`. No hace falta ninguna clave nueva;
  - canal `avisos`, ícono `ic_stat_ema`, color navy y `data.vista` (Mis tareas; pañol para reservas; Órdenes para envíos), para abrir la hoja al tocar;
  - borra el celular si FCM dice que el token ya no existe (`UNREGISTERED` / 404);
  - `/salud` y `/probar` muestran `version: "v115-fcm"`, `enviadosFcm` y los primeros errores.
- **index:** `FCM_LISTO = true` en `androidPro`. Además, si el WebView no da `crypto.subtle`, el id de `pushSubs/fcm-…` sale de un resumen propio.

**Qué tiene que hacer Ángel**
1. Pegar el Worker nuevo y tocar Deploy. Revisar en `/salud` que diga `v115-fcm`.
2. Firebase › Configuración › Cloud Messaging: «API de Firebase Cloud Messaging (V1)» habilitada.
3. Subir `index.html`. No hace falta APK nuevo.

**Pruebas**
- Worker en Node con Firestore y FCM simulados: manda a 2 celulares, borra el token muerto y abre la hoja correcta.
- `t_v115`: 4/4 en PC y celular. `t_v110` actualizada: ya no espera los avisos dormidos.
- Batería completa en PC y celular: 218 OK. Solo falla `t_v083`, que es vieja.

**Huella SHA-256**
- `115_2026-11-04_app-EMA_ORIGINAL.html`: `bd5f4a15a633b0923fa6bf15a1c07b8794131abcd009b56dd7a4128c31f34113`
- `index.html`: `b33d080ce7786bf29d6b33c45fbfc419615a9770a6edc3c70fcaca8ed119ed0d`

## v114 — 04/11/2026 · Ahorro de batería

**Pedido de Ángel**
- «¿Puede que la app consuma mucha batería? ¿Cuánto? ¿Cómo lo solucionamos sin que se arruine la app y funcione súper bien, sin fallas?»

**Qué gasta**
- **La ubicación en vivo** es lo que más gasta, y es a propósito. En la app de Android, unos 3 a 6 % por hora. En Chrome bastante más, porque la pantalla tiene que quedar prendida para que el GPS no se corte.
- **Unos 66 relojitos** (`setInterval`) revisan cosas cada uno o dos segundos. Algunos seguían andando con la app en segundo plano.

**Cambios**
- **`relojitosAhorro`**, primer script de la página: con la app fuera de la vista (`document.hidden`: otra app o pantalla apagada), cada `setInterval` de menos de 1 minuto corre como mucho una vez por minuto. A la vista sigue a su ritmo.
  - Es lo mismo que Chrome ya hace por su cuenta en segundo plano, así que no cambia lo que hace cada relojito.
  - No toca `setTimeout`.
  - La ubicación nativa de Android no depende de los relojitos. Su latido escondido manda cada ~1 minuto, igual que el `cadaSeg` de 60 s.
- **No se tocó el GPS:** ajustarlo podía dejar «sin actualizar» a alguien que está quieto.
- **Recomendaciones para Ángel:**
  - la cuadrilla con la app de Android, no Chrome;
  - el horario justo en Usuarios › Ubicación en vivo;
  - si hace falta ahorrar más, enviar cada 120 s.

**Pruebas**
- `t_v114`: 4/4 en PC y celular.
- Batería completa (v110 a v114 juntas), en PC y celular: 216 OK. Solo falla `t_v083`, que es vieja; las de ubicación en vivo (`t_v084`–`t_v092`) pasan todas.

**Huella SHA-256**
- `114_2026-11-04_app-EMA_ORIGINAL.html`: `f520c6fb9c5d4d7512c75917c635f0680b4afae0e45cb6e09cd5f3b976799faf`
- `index.html`: `b5b7c293af49d88193f8e0535d93019e701f86bf96cfb39a069b91711a7d0fa0`
- Versión: `2026-11-04 12:44 · 9f8b02`

## v113 — 04/11/2026 · Una sola forma de hacer cada cosa + responsable de oficina de la orden

**Pedido de Ángel**
- «Que las cosas para hacer no se repitan: que no haya dos cerrar el día en dos lugares… fijate si hay eso o no».
- Eligió arreglar las cuatro cosas que encontré.
- «En llenar la OT poner un responsable: cualquiera de oficina o administración, que le llegue lo que tiene a cargo y las que tiene que cerrar (las pueden cerrar otros igual), que en Mis tareas le salga el seguimiento y al cerrar lo mande a la hoja para cerrar».

**Qué había repetido** (revisión de toda la app)
- **Producción › «Cierre del día»** cerraba las órdenes por otro camino. Con eso:
  - no avanzaba el itemizado ni hacía el paso del itemizado;
  - no mandaba el aviso «⭐ Puntos aprobados» con la app cerrada;
  - no borraba las fotos que la cuadrilla sacó;
  - no dejaba sacar ni agregar gente;
  - 0 horas valía la jornada entera;
  - mostraba puntos solo por el peso del rol, distintos de los que se guardaban;
  - guardar ahí una orden ya cerrada borraba el reparto por persona y por equipo.
- **Órdenes › «Por persona / obra»** y **«Seguimiento»** mostraban casi lo mismo.
- **«Informe mensual»** en el Centro de informes y **«📑 Informe mensual con fotos»** tenían el mismo nombre para cosas distintas.
- **Vehículos:** se podían cargar en Gastos y en Producción › Personal (la misma lista, dos formularios).
- Todas las otras entradas a «Cargar lo hecho» ya usaban el mismo cierre: Tablero, Seguimiento, Historial y Mis tareas.

**Cambios**
- **«Cierre del día»** (`cierreDiaUnico`): queda como carga rápida de todo el día, pero «Guardar el parte» y «Guardar todo el día» guardan por el **mismo cierre** de la orden (`guardarCierreOt`).
  - Abre el cierre sin mostrarlo y le pone las cantidades, las horas (0 = 0), el reparto a mano y las novedades.
  - Los puntos del parte son los mismos que los del cierre (`puntosDeOrden`) y se recalculan al cambiar horas o cantidades.
  - Cada orden con obra lleva en el parte la misma pregunta del cierre: «¿agregó o sacó algo del itemizado?». Con «No» se guarda directo; con «Sí» abre el cierre completo para cargar el cambio. Si no se contesta, también abre el cierre.
- **Seguimiento:** se va la pestaña «Por persona / obra». En Seguimiento está «🔎 Buscar en las órdenes» (el mismo buscador), con «← Volver a Seguimiento».
- **Informes:** el período «Informe mensual» pasa a llamarse «Avance del mes (sin fotos)» y avisa que el de la certificación es «📑 Informe mensual con fotos».
- **Vehículos:** se cargan solo en Producción › Personal del equipo. En Gastos se ven, con el botón para ir.
- **Responsable de oficina** (`supervisorOt`):
  - en el paso 2 de «Llenar orden» se elige a alguien de Oficina o Administración (de entrada, quien la emite);
  - se guarda en `ot.supervisor` {uid, email, nombre};
  - si no es quien la emite, le llega el aviso «👔 Te toca seguir una orden»;
  - en su **Mis tareas** aparece **«👔 Órdenes que seguís»**: cómo va cada una (marcadas, quién envió), «🔔 Para cerrar», «📸 Ver avance» y «✅ Cerrar», que abre el cierre de esa orden. La pueden cerrar otros igual.

**Pruebas**
- `t_v113`: 10/10 en PC y 11/11 en celular.
- Las pruebas viejas siguen con el cierre del día de antes (`__ofCompat`).
- **Batería completa** (v110 a v113 juntas), en PC y celular: 214 OK. Solo falla `t_v083`, que es vieja.

**Huella SHA-256**
- `113_2026-11-04_app-EMA_ORIGINAL.html`: `4d50badddb8498af4546a4dbe349f018f4030767a02fb6c48b9475229225d5f6`
- `index.html`: `b5fc3e764ff5f3493f1077309ac8fd0d396471e0b30fedd02634f5339b4ebde9`
- Versión: `2026-11-04 10:50 · dfb263`

## v112 — 04/11/2026 · «Llenar orden» por pasos, envío de la cuadrilla una sola vez, tareas de barrio y «＋ Crear tarea»

**Pedido de Ángel**
- «La pantalla donde lleno las órdenes no está bien acomodada… más fácil y más rápido».
- «Si selecciono una plaza, que me diga: tenés estas tareas pendientes, ¿querés agregarlas hoy? Sí, no, o algunas; después poder agregar más».
- «Seleccionar rápido al personal y las obras».
- «Bien marcado: los puntos que va a terminar teniendo cada uno si finaliza todas las tareas».
- «Ventanas para que sea más prolijo… prolijidad, agilidad y algo exacto».
- «Si van dos de una cuadrilla, que puedan enviar los dos, pero que a mí me llegue una sola vez esa tarea. Puede pasar que uno envíe incompleto y el otro más completo».
- «Faltan las tareas de barrio: cortes de media (poner la jabalina y la descarga) y reclamos (ir a ver por qué se apagó, cambiar o subir una térmica); ponerles puntos».
- «En Cuánto vale cada tarea, poner bien cómo se suman los puntos y un apartado para crear tareas y darles puntos».

**Cambios**
- **«Llenar orden»** (`ordenNueva`). No cambia ids ni lo que se guarda:
  - **pasos:** 1 Obra y fecha · 2 Gente (con la cuadrilla, el capataz, las cuadrillas guardadas y el vehículo) · 3 Tareas · 4 Material y emitir, con «Siguiente →» y «← Atrás». «Ver todo junto» deja todo a la vista y se recuerda en `ema.of.todo`;
  - **resumen al costado:** obra, fecha, gente, tareas y **⭐ «Si terminan todo, cada uno suma»** (`puntosDeOrden` sobre el borrador), más «Emitir». La hoja vacía de la derecha no aparece hasta que se emite;
  - **en el celu**, una barra fija abajo: «📋 N tareas · 👷 N · ⭐ pts», «Resumen» y «Emitir»;
  - **obras recientes** y **gente de la nómina** con un toque (con su rol);
  - **cartel de pendientes al elegir la obra** (`saldoObra`): «📋 HÍPICA tiene N tareas pendientes». Se marcan todas, algunas o ninguna, con lo que queda de cada una, y se pueden sumar más. También sale desde «📋 Ver las N tareas pendientes de la obra» en el resumen.
- **En qué vehículo va cada uno** (`vehiculoPersona`, pedido de Ángel). En el paso 2, con los vehículos de la orden elegidos, cada persona elige en cuál va:
  - de entrada, el que tiene a cargo o el primero de la orden;
  - se guarda en `ot.vehiculoPersona` («Nombre» → {id, nombre, patente});
  - se ve en el resumen («🚚 Hilux: Juan · Ranger: Pedro») y en el cierre, al lado de cada persona.
- **Envío de la cuadrilla** (`envioEquipo`):
  - cada uno guarda su marca en `campo.marcasPor.<tarea>.<persona>`;
  - `campo.marcas.<tarea>` (lo que ve la oficina y lo que propone el cierre) es la **combinación**: hecha si alguno la hizo, la cantidad mayor y las notas de todos (`porTodos`). Antes la última marca pisaba a la otra;
  - los avisos «📨 … envió lo de hoy» (push y en la app) salen **una vez por orden**. Después, solo si un envío suma tareas hechas: «Pedro completó lo de hoy: +2 tareas hechas».
- **Diccionario:** fase nueva «Barrios y reclamos», con horas y dificultad **a confirmar**:
  - corte de media tensión (jabalina y descarga), 1,5 h × 1,6 = 2,4 por corte;
  - reclamo (ir a ver por qué se apagó), 1,5 × 1,4 = 2,1 por reclamo;
  - cambiar una térmica, 0,75 × 1,6 = 1,2;
  - subir una térmica, 0,25 × 1,4 = 0,35.
- **Producción › Cuánto vale cada tarea** (`tareaNueva`):
  - explica cómo se suman los puntos: 1 punto = 1 hora-hombre, × dificultad (+0,2 por barquilla o altura, pesado, riesgo, oficio; tope 1,8), y el tiempo es fijo;
  - **«＋ Crear tarea»**: nombre, fase, unidad, horas por unidad, lo que tiene la tarea y cómo se hace; calcula los puntos al instante y la guarda con las tareas propias del equipo (`registrarTareasNuevas`, ahora con `fase`, `hh` y `f`).

**Pruebas**
- `t_v112`: 13/13 en PC y 14/14 en celular (con el vehículo de cada uno).
- Arnés: `__ofCompat` en las pruebas viejas (todo junto, sin cartel ni barra), salvo `ofPasos:true`.
- `t_v076`, `t_v079`, `t_v094`, `t_v097`, `t_v104`, `t_v072`, `t_v098`, `t_v096`, `t_cuadrilla` y `t_v022` OK.
- **Batería completa (v110 + v111 + v112 juntas), en PC y celular: 211 OK.**
  - `t_v077` falló en PC porque «Compartir PDF» ahora abre el menú. Se actualizó para tocar «Otra app» y pasa 16/16 en PC y celular.
  - `t_v083` es vieja.

**Huella SHA-256**
- `112_2026-11-04_app-EMA_ORIGINAL.html`: `fae757b2376e413b4e3b1c7ba2f0adeaec65164116ad046fac86e79407cf675c`
- `index.html`: `9618fee4a8acddccc7a33970709f48303b81a6f41bfe965fd351c3ad190cdb16`
- Versión: `2026-11-04 08:48 · d882f3`
- APK: `AlumbradoApp_v1.3.zip` (versionCode 4, versionName 1.3, 10 plugins)

## v111 — 04/11/2026 · Cierre de la orden: horas, puntos y «No fue»

**Pedido de Ángel**
- «Si anoto un número en las horas no sube, pero si subo con la flecha sí».
- «Si quiero quitarle puntos a alguno no me deja, y si quiero quitar a alguien porque al final no fue, no me deja».
- «Si reparto los puntos y le bajo a uno, que me diga: tenés disponibles 8 puntos para repartir».

**Qué pasaba**
- Las horas vacías valen la jornada de la orden (5 h), pero no se veía. Escribir «5» en una vacía no cambiaba nada, y con la flecha arrancaba de 0.
- **0 horas** valía lo mismo que vacío: la jornada entera. Por eso no se le podían sacar los puntos a nadie.
- Los puntos estaban bloqueados hasta tildar «Repartir los puntos a mano», sin avisar.

**Cambios** (módulo `cierreGente` + 4 reemplazos)
- Horas:
  - el campo vacío muestra la jornada en gris;
  - **0 horas = 0 puntos**;
  - al guardar, vacío queda con la jornada y 0 queda en 0 (`cierre.horasPersonaV: 2`). Las órdenes de antes se cuentan como antes.
- Tocar los puntos de alguien pasa solo a «Repartir a mano» y deja escribir.
- A mano, abajo: «**Te quedan N puntos para repartir**» (o «te pasaste N»), con el botón «Repartirlos entre los demás» (por el peso del rol, sin tocar a los que cambiaste a mano).
- **«✕ No fue»** en cada persona, con confirmación:
  - lo saca de la orden: `personal`, `personalNombres` y lo que tenía asignado, repartido o en equipo;
  - queda anotado en `ot.quitadosAlCerrar`;
  - el cierre conserva lo cargado.

**Pruebas**
- `t_v111`: 7/7 en PC y 8/8 en celular.

## v110 — 04/11/2026 · La app de Android 1.3 completa: abrir PDF, imprimir directo, fotos que no se pierden, avisos y lector QR

**Pedido de Ángel**
- «¿No hay alguna mejora que quieras que implementemos, así hacemos actualizar una sola vez?». Eligió las cuatro propuestas (avisos con la app cerrada, abrir el PDF al bajarlo, no perder fotos de la cámara, imprimir directo) y «algo más que tengan las apps pro: investigá».

**Qué tienen las apps profesionales de obra** (Salesforce Field Service, Dynamics 365 Field Service y otras)
- Trabajo sin señal: la app ya lo tiene.
- Avisos al celular: van en esta versión.
- Lector de códigos de barras o QR para equipos y materiales: va en esta versión (la pieza; las pantallas del pañol, cuando Ángel las pida).
- Firma en pantalla como comprobante: no necesita APK, se puede hacer después en el index.

**APK 1.3** (además de Filesystem y Share de la v109)
- Plugins oficiales o de la comunidad, versiones estables con más de dos semanas:
  - `@capacitor/push-notifications` 8.1.3, `@capacitor/camera` 8.2.6 y `@capacitor/app` 8.1.2;
  - `@capacitor-community/file-opener` 8.0.1, `@capgo/capacitor-printer` 8.1.8 y `@capacitor-mlkit/barcode-scanning` 8.2.1.
- Manifest:
  - permiso `POST_NOTIFICATIONS`;
  - ícono chico de los avisos (`ic_stat_ema`), color y canal «avisos»;
  - el lector de Google (`barcode_ui`).
- `COMPILAR.bat` avisa si falta `google-services.json` (sin ese archivo compila igual, pero no hay avisos). El `LEEME.txt` explica cómo bajarlo de Firebase.

**Cambios en la app** (`archivosApp` y módulo nuevo `androidPro`)
- «Bajar PDF» guarda y **abre el PDF** en el visor del celular.
- «Imprimir» va **directo a la impresora de Android** (`Printer.printBase64` con el PDF de la hoja). Si falla, hace lo de la v109 (PDF → menú).
- **Fotos de Mis tareas** por la cámara del celular (plugin Camera): si Android cierra la app con la cámara abierta, al volver la foto se recupera (`appRestoredResult`) y se guarda en su fila. El dato de qué fila era queda en `localStorage ema.cam.pend`.
- **Avisos con la app cerrada (FCM):** el código está, pero **dormido** (`FCM_LISTO = false`) hasta actualizar el servicio de avisos (Worker `ema-avisos`) para que mande por FCM. Así el Worker de hoy no recibe anotaciones que no conoce. Cuando esté, se prende subiendo un index, sin otro APK. El celular se anota en `pushSubs/fcm-…` con `tipo:"fcm"`, y tocar el aviso abre la hoja de `data.vista`.
- **Lector de códigos:** `window.__escanear()` devuelve el texto del código.
- Con la app vieja o en el navegador no cambia nada.
- **Menú «Compartir»** (`compartirHoja`), igual en el celular y en la PC (pedido de Ángel: «como en las apps pro: compartir, copiar, WhatsApp, Drive, otro»). «📄 Compartir PDF» abre un menú con **WhatsApp · Drive · Mail · Copiar · Guardar · Otra app**:
  - **celular:** WhatsApp, Drive, Mail y Otra app abren el menú de compartir del celular con el PDF ya adjunto y su descripción («… · EMA Servicios»). Android no deja mandarlo directo a una app;
  - **PC:** WhatsApp baja el PDF, copia la primera hoja como imagen (se pega con Ctrl+V) y da el botón «Abrir WhatsApp Web». Drive baja el PDF y da «Abrir Drive». Mail baja el PDF y abre el correo para adjuntarlo;
  - **Copiar:** la primera hoja como imagen, más el texto; si el aparato no deja copiar imágenes, solo el texto;
  - **Guardar:** igual que «Bajar PDF»;
  - cuando sale bien, el menú se cierra y el aviso queda en la hoja.

**Pruebas**
- `t_v110` (simula la app 1.3 con todas las piezas, el menú «Compartir» y el navegador): 13/13 en PC y celular.
- `t_v109` actualizada: «Compartir» ahora abre el menú y se toca «Otra app».
- `t_v109`, `t_v028`, `t_v107` y `t_cargador` OK en PC y celular.

## v109 — 04/11/2026 · Bajar y compartir PDF en la app de Android (APK 1.3)

**Pedido de Ángel**
- «La de compartir y bajar PDF no funciona, antes funcionaba. No arruines cosas, mejorá eso» (captura: «✓ PDF listo», pero no pasa nada).

**Qué pasaba**
- El código del PDF no cambió desde la v086.
- Adentro de la app de Android (APK), un «bajar» de la página no hace nada y no existe «compartir archivo». Igual la app decía «✓ PDF listo».
- En Chrome y en la PC sí anda. Lo mismo pasaba con todo lo que se baja: planillas, Word, ZIP de fotos, DXF.

**Cambios**
- **APK 1.3** (versionCode 4): plugins oficiales `@capacitor/filesystem` 8.1.5 y `@capacitor/share` 8.0.3, más el permiso de guardar en Android 10 o menos. Hay que compilarlo (COMPILAR.bat) e instalarlo encima.
- **Módulo `archivosApp`** (`window.__archivoNativo` {enApp, hay, guardar, aviso, sinPlugins, abrirEnChrome}):
  - en la app de Android atrapa todos los «download» con blob o data (clic o `a.click()`, sin tocar cada módulo);
  - «Bajar» guarda en **Documentos › EMA**; si Android no deja, abre el menú para elegir dónde;
  - con el APK viejo avisa «hace falta la app nueva (1.3)» y ofrece «Abrir en Chrome», en vez del «PDF listo» falso.
- **La hoja de impresión** (`hojaPdf`, por donde pasa toda impresión de la app): en el APK 1.3, «Compartir PDF» abre el menú de Android (WhatsApp, mail, Drive…), «Bajar PDF» guarda en el celular e **«Imprimir»** arma el PDF y lo abre para mandarlo a la impresora o a Drive (el WebView no imprime).
- Cubre todo lo que se baja hoy y lo que se agregue: PDF, planos de AutoCAD (DXF), planillas, Word, ZIP de fotos.
- En el navegador y la PC no cambia nada.
- **La foto de Mis tareas ya no se pierde** (`fotoSegura`, encontrado al probar):
  - si la pantalla se redibujaba mientras la persona tenía la cámara abierta (otra foto del equipo, cambios de la base, volver de la cámara), la foto llegaba a un botón que ya no estaba en la página y no se guardaba, sin avisar;
  - pasaba también en la v107; era la prueba `t_v028` del celular que «fallaba a veces»;
  - ahora la foto se pasa al botón nuevo de la misma fila y se guarda como siempre; si no encuentra la fila, avisa que hay que sacarla de nuevo.
- Incluye la v108 completa (todavía no publicada).

**Pruebas**
- `t_v109` (simula el APK con y sin plugins, y el navegador; incluye «Imprimir» y DXF): 8/8 en PC y 9/9 en celular.
- El arnés suma la opción `antes` (preparar la página antes de abrir la app).
- `t_v028` ahora espera 1,5 s con la cámara abierta, como una persona. Con la v107, esperando 0,4 s ya fallaba 0 de 6; con la v109, 4 de 4 OK en el celular.
- Batería completa: 206 de 208 OK. Solo falla `t_v083` (vieja) en PC y celular.

**Huella SHA-256**
- `109_2026-11-04_app-EMA_ORIGINAL.html`: `59b2a9e18fdbdb09f30c47cacd09d8cd615a3c9ea8e8f0effcdd8c546451f34d`
- `index.html`: `657d108b47c2421c542acfe3533fe44106a0120c5f087bec5652e99fb0da4baa`
- Versión: `2026-11-04 07:26 · 8b02e1`
- APK: `AlumbradoApp_v1.3.zip` (versionCode 4, versionName 1.3)

## v108 — 04/11/2026 · El circuito de la obra: diccionario de tareas, cierre por partes y «Diferencias con lo hecho»

**Pedido de Ángel**
- «Es un circuito: calculo con la calculadora, me dice todo lo que tengo que hacer (columnas, tableros, poda, metros de cable y zanja), los materiales y las órdenes de trabajo».
- «Lo que se hace en las órdenes tiene que sumar en el avance de obra».
- «El itemizado es sensible: que me dé la opción, “en las órdenes hiciste esto de más, ¿querés que lo agreguemos?”, esta sí, esta no».
- «Las tareas tienen que ser claras: armar luminaria, armar el vínculo, armado de tablerito, montaje de columna, montaje del vínculo, limpieza, izado de poste de madera y de PRFV, colocación del tablero, acometida, poda, grúa para la basura…».
- «Armar el diccionario, armar todo lo que haga falta y crearlo».

**Cambios**
- **Diccionario de tareas** (`diccionarioTareas`, `DICC_TAREAS`): 47 tareas, cada una una acción clara. Cada tarea tiene:
  - horas-hombre estándar y dificultad (+0,2 por barquilla o altura, peso, riesgo eléctrico, oficio; tope 1,8);
  - puntos = horas × dificultad;
  - qué ítem del Itemizado 2026 avanza y con qué parte.
- **Tareas nuevas en las órdenes:** armado de luminaria, de vínculo y de tablerito; prueba de artefactos; carga y descarga; replanteo; zanja con máquina; tapado; vereda; montaje de vínculo y de luminaria; conexionado del tablerito; izado de poste de madera; colocación del tablero; armado del tablero general; acometida aérea y subterránea; pintura; limpieza; grúa para basura y traslados; prueba de encendido; inspección; reparación de falla.
  - Las tareas que juntaban varias acciones (vínculo y luminaria, BPN, galpón, tablero, acometida, limpieza y pintura, verificación, inspección y pruebas, fundaciones) quedan en «Tareas viejas», para las órdenes de antes.
  - Los puntos de las tareas que ya existían no cambian solos. En Producción, «⚖ Usar los del diccionario» los copia, y hay que tocar «Guardar».
- **Cierre por partes:**
  - El ítem de columna completa (1 a 8) se reparte entre sus tareas: pozo 12 %, fundación 13 %, izaje 25 %, armado del vínculo 5 %, montaje del vínculo 8 %, armado de la luminaria 5 %, montaje de la luminaria 12 % (por artefacto), tablerito 5 %, conexionado 10 % y sellado 5 %.
  - Zanja: excavación 70 % y tapado 30 %.
  - Tablero aéreo (ítem 9): armado 60 % y colocación 40 %. Tablero a nivel (ítem 10): base 30 %, armado 40 % y colocación 30 %.
  - Apoyo del tablero (ítem 13): pozo 30 % e izado 70 %.
  - El montaje de la luminaria avanza también el cable de subida en columna (ítem 30).
  - Todos estos porcentajes son **a confirmar**.
  - Cada tarea llena solo su parte, y queda anotado qué tarea sumó cada cosa (`cierre.avanceItems[].k`). Lo que pasa de lo contratado queda como «sobran», sin meterse en la parte de otra tarea.
- **Itemizado 2026 › «🔎 Diferencias con lo hecho (N)»** en cada plaza:
  - qué se hizo de más en las órdenes cerradas, comparado con lo contratado (columnas, zanja, cable, cruce, tablero, apoyo, acometida, jabalinas, mediciones, empalmes, existentes, retiros, poda);
  - **Sí, sumar** suma la cantidad al ítem como ajuste (`CO.aplicarAjuste`), con motivo, quién y cuándo, y avanza lo hecho;
  - **No** guarda `difDescartadas` y no vuelve a preguntar mientras no se haga más.
- **Orden de trabajo:**
  - «📋 Solo lo de esta obra» deja a la vista las tareas que salen del cálculo, más las tildadas;
  - los atajos «Lo que queda» no muestran las tareas viejas.
- **«Quedan» desde el Avance:** cuenta solo el ítem principal de la tarea; las luminarias se cuentan por artefacto.
- **Producción › Cuánto vale cada tarea:** al lado de cada tarea sale el valor del diccionario («4 HH × 1,4»), no el del pliego.
- **Planilla** `docs/Baremo_propuesta_puntos.xlsx`, con hojas «Diccionario» y «Diferencias».
- **Sin cambios** en reglas ni APK, ni en las órdenes ya cerradas.

**Revisión (segunda pasada, pedido «dale una revisada de nuevo»)**
- «Quedan» de la orden con el cierre por partes: cada tarea cuenta lo que sumó ella (÷ su parte), no el avance total del ítem. Antes, cerrar el izaje de 4 columnas marcaba como hechos también 1 pozo, 1 fundación, etc.
- Avance de antes de la v108 (órdenes viejas o cargado a mano en el Avance): cuenta como completo para todas las tareas. Así no se vuelve a llenar la parte de una columna que ya estaba hecha.
- Zanja a mano y zanja con máquina comparten el mismo 70 % (`parte: "zanja"`): no suman dos veces los mismos metros.
- Sin cálculo de la obra, el montaje de la luminaria no llena el cable de subida (ítem 30) de una.
- Redondeo a 4 decimales: una columna con todas sus tareas llega justo al 100 % (antes podía quedar en 0,99).
- Jabalinas: el total de la tarea son los dispersores (75), o los caños (77) si no hay dispersores. Antes sumaba los dos.
- Una orden anulada sin revertir el avance sigue contando en el reparto por partes, porque su avance sigue en el itemizado.
- Cierre:
  - avisa que cada tarea suma solo su parte (el izaje es el 25 %);
  - lo que sobra dice la unidad y que se revisa en «🔎 Diferencias con lo hecho».
- Las tareas nuevas proponen su etapa al cerrar: zanja, tapado, vínculos, tablero, acometida, pintura, inspección.
- «Diferencias con lo hecho»:
  - si no se pudo guardar, avisa y deja la obra como estaba (antes decía «✓ Sumado» igual);
  - al sumar, refresca las pantallas del Avance;
  - en el celular, la lista de ítems ya no se sale de la pantalla.
- «Solo lo de esta obra»:
  - sin obra elegida (o sin cálculo), avisa en vez de dejar la lista vacía;
  - al cambiar a una obra sin cálculo, vuelve a mostrar todo;
  - esconde las fases vacías y las tareas viejas.
- La app no se pone lenta: lo de Diferencias y del baremo se recalcula solo cuando cambia el Itemizado o Producción.

**Pruebas**
- `t_v108b` (nueva, lo de la revisión): 11/11 en PC y celular.
- `t_v108`: 10/10 en PC y celular.
- Batería completa después de la revisión: 203 de 206 OK. `t_v083` (vieja) falla en PC y celular, como siempre. `t_v108` en PC falló una vez porque buscaba «sobran 1,00» y ahora dice «sobran 1 columna»: se actualizó la prueba y pasa 10/10.
- El arnés pone `__avanceEntero` en las pruebas viejas (el avance de antes, la tarea completa el ítem). `porPartes:true` prueba el reparto.
- Batería completa en PC y celular: todo OK.
  - `t_v045` y `t_v047` fallaron antes del modo de compatibilidad; repetidas, pasan.
  - `t_v083` es vieja.
  - `t_v028` en celular es la intermitente de siempre (3 de 3 solas OK).

**Huella SHA-256**
- `108_2026-11-04_app-EMA_ORIGINAL.html`: `e08667c6d691209be536b09c48ce0a27b0246c92e19954d782aaa6068b51576f`
- `index.html`: `738424352b7b90157ee3fd333e4309dda8161b493c1998c8419f1263dc1fdc8f`
- Versión: `2026-11-03 23:55 · 7600d6`

## v107 — 04/11/2026 · La cuadrilla ve y borra sus fotos

**Pedido de Ángel:** «Está bien que saque sin preguntar si está bien o no, pero tienen que poder sacar varias, poder verlas ellos y poder borrar, como la galería. Y yo poder verlas al instante en Obras y legajos».

**Cambios** (módulo nuevo `misFotos`, `__misFotos`)
- En cada orden de Mis tareas, **«📷 Mis fotos (N)»** con las últimas miniaturas:
  - abre la galería de siempre (deslizar, zoom) con las fotos de esa persona en esa orden;
  - cada foto tiene «🗑 Sacar» mientras la orden está abierta.
- En la cámara, **«🗑 La última»**:
  - espera a que la foto se guarde y después la saca al toque;
  - las de la cámara del menú (sueltas, sin orden) no se pueden sacar desde la cuadrilla.
- La cámara sigue sacando y guardando al toque, varias seguidas.
- Sin cambios en lo de la oficina:
  - las fotos aparecen en el legajo apenas se guardan;
  - las que saca la cuadrilla dejan de verse ahí (ya pasaba desde la v080);
  - la oficina las borra de verdad al cerrar la orden.

**Pruebas**
- `t_v107`: 6/6 en PC y celular.
- Las 35 pruebas de fotos, cámara y Mis tareas en PC y celular: OK.
  - `t_v028` y `t_v032` en celular fallaron con la máquina cargada y repetidas solas pasaron.

**Huella SHA-256**
- `106_2026-11-03_app-EMA_ORIGINAL.html`: `1fd53951801c9edb735215237970735e40b9ecadfcde0781c817fa182afaab4c`
- `index.html`: `e1578935cb7da4cb37f950939774a300b282403a5724230940bb016bf4a6ae72`
- Versión: `2026-11-03 12:24 · bb24b3`

## v106 — 04/11/2026 · Agregar a alguien al cerrar la orden

**Pedido de Ángel:** «En las tareas, cuando la voy a aprobar y cerrar, la posibilidad de agregar algún integrante».

**Cambios** (módulo nuevo `cierreIntegrante`, `__cierreIntegrante`)
- En el cierre, **«＋ Agregar a alguien que también fue»**:
  - la nómina, sin los que ya están en la orden, y «✏ Otra persona»;
  - pregunta antes y lo suma a `personal` (con su rol de la nómina y `agregadoAlCerrar: true`) y a `personalNombres`;
  - el cierre se vuelve a dibujar con lo que ya estaba cargado, y la persona nueva aparece con sus horas y puntos.

**Pruebas**
- `t_v106`: 4/4 en PC y celular.
- Las 52 pruebas de órdenes y cierre en PC: OK.

**Huella SHA-256**
- `106_2026-11-03_app-EMA_ORIGINAL.html`: `ec11344f298736a54d3c48d775b37dce2a4955e720a97b2f738313d3f694869c`
- `index.html`: `db50e118cef442e03ab5fead8904269a9de4c9711e8ebd3ddef7c73d6568a4f4`
- Versión: `2026-11-03 11:57 · 15831a`

## v105 — 04/11/2026 · «📅 Tareas de hoy» en Seguimiento

**Pedido de Ángel:** «Falta las de hoy… o sea, la opción tareas de hoy».

**Cambios** (solo el módulo `seguimientoTareas`)
- Cuadro **📅 Tareas de hoy**: todas las tareas de las órdenes de hoy, hechas o no.
- «Pendientes» ahora incluye lo de hoy que está en obra.
  - A esas tareas no se les ofrece «Darla hoy» ni «Darla a otro» (todavía están en obra): solo «Cargar lo hecho».
- La fecha «hasta» sigue a hoy si la app quedó abierta de un día para otro.
- «sin personal cargado» en vez de «(—)».

**Pruebas**
- `t_v105`: 10/10 en PC y celular.
- `t_v104`: 10/10.
- Las 50 pruebas de órdenes en PC: OK.

**Huella SHA-256**
- `105_2026-11-03_app-EMA_ORIGINAL.html`: `98bd71537d5d31dee7a1910784af87c9fd3bc9b134b2567976124305458c7d58`
- `index.html`: `58855e9852649cb5092f686b4fe67fbb65c2e4278eb2163ef38c9cfb810692a4`
- Versión: `2026-11-03 11:31 · 7e44cc`

## v104 — 03/11/2026 · «📌 Seguimiento» de tareas y «↩ Sigue en obra» (incluye la v103)

**Pedido de Ángel:**
- «Que tenga su propio ítem: las tareas que se van haciendo y lo que no se hace. Un registro: ayer se le dio esta tarea a Pablo y solo hizo estas dos; quedó pendiente esto otro. Y la opción de darle esa tarea hoy, o dársela a otra persona. Detallado, bien a la vista, por personas y obras.»
- «Si me la mandan por equivocación y no marcaron todo, la opción de volver a poner que sigue en obra y que no se cerró.»

**Cambios**
- **Órdenes › «📌 Seguimiento»**, pestaña propia (módulo `seguimientoTareas`, `__seguimiento`):
  - cada tarea dada: fecha, orden, obra, quién (una persona, repartida, juntos o por equipos), cuánto se dio, cuánto se hizo, cuánto falta;
  - estados: ✅ hecha · 🟡 hizo una parte · ⛔ no se hizo · ⚠ sin cerrar · ⏳ en obra · 🔁 se volvió a dar (otra orden posterior de la misma obra con esa tarea);
  - cuadros que filtran (pendientes por defecto) y filtros de fechas, persona y obra;
  - resumen por persona y por obra: dadas, hechas, parte, no, pendientes, % cumplió;
  - **📅 Darla hoy** y **👤 Darla a otro**: arman la orden de hoy solo con esa tarea y lo que faltó, ya asignada a esa persona. La oficina la revisa y toca «Emitir»;
  - «✅ Cargar lo hecho» en las sin cerrar;
  - en el celular, tarjetas.
  - Solo lee: no cambia ninguna orden.
- **«↩ Sigue en obra»** en las órdenes de «Para revisar» (y «Mover a… En obra», que antes no la sacaba de ahí):
  - pregunta, vuelve a «En obra» sin cerrar y sin borrar lo marcado;
  - deja anotado quién la había mandado (`ot.devuelta`) y le avisa al celular que siga y vuelva a tocar «Enviar» (`__devolverOt`).

**Pruebas**
- `t_v104`: 10/10 en PC y celular.
- Batería completa en PC y celular: todo OK.
  - `t_v083` es vieja.
  - `t_v028` en celular falló una vez y repetida sola pasó (la conocida).
  - Las pruebas de órdenes se repitieron con la versión final.

**Huella SHA-256 (v104, incluye la v103)**
- `104_2026-11-03_app-EMA_ORIGINAL.html` (63.612 líneas): `9c1aca0df9ca1a50f39f790082ff1581e944990b60e1f09ab055f9635090fb16`
- `index.html`: `079fcac5863e205c5fb9bf357f3cbb8e62daf4cb60ea87f40ec23ba2f0693e6d`
- Versión: `2026-11-03 09:57 · c0af51`

## v103 — 03/11/2026 · Respuestas de Ángel: mismo material, bajas, unidades, alambre, ganancia, provisiones, puntos

**Pedido de Ángel (respuestas):**
- 7010 y 1032, 3038 y 3039, 7005 y 7006 son el mismo material (otro proveedor / lo daba la Municipalidad).
- 7004–7007 están mal (la tierra va verde): sacarlos.
- Los cables siempre en metros («todo metros»); el alambre siempre en kg y calcularlo para el aislador MN y el rack.
- 3/4" de plástico.
- Ganancia: las subidas hasta la caja + 0,50 m, y un 5 % más.
- Provisiones: «lo que sea mejor».
- «Los ajustes, sacalos: las quincenas pasadas fueron pruebas; los puntos cuentan a partir de esta quincena».

**Cambios**
- **Mismo material:** si falta uno, ofrece el otro en verde, «es el mismo material» (`__alternativasMismo`). No une códigos.
- **7004–7007 de baja** en el catálogo base (`activo:false`): no se ofrecen; siguen para los movimientos viejos.
- **Unidades del catálogo base:**
  - cables en m: 1002–1005, 1009, 1012, 1013, 1015, 1017–1026, 1030–1032, 7008, 7009, 7011, 7012;
  - alambre 1001 en kg.
  - Si alguien cambió la unidad de un producto desde Alta de productos, eso manda (está en la base).
- **Alambre en kg:**
  - 2 m por atadura en cada aislador MN 17 (acometida) y MN 16 (barrio), alambre galvanizado N° 14 ≈ 25 g/m → ≈ 0,05 kg por aislador;
  - no hay dato publicado (EPEC, fabricantes): calculado por vueltas, **a confirmar**.
- **Ganancia del troncal PRFV:** 3,50 m hasta la caja + 0,50 m = **4 m por subida** (antes la altura entera, 7/10 m).
  - El material del troncal lleva **5 % de reserva**.
  - El ítem del itemizado (25–40) cobra zanja + subidas, **sin** la reserva (`itemCant`).
- **Provisiones 83–89** fuera del % de avance físico y del «qué falta». Lo que se cobra no cambia.
- **Puntos:** cuentan desde el **01/11/2026**. Las quincenas anteriores no dan ajustes ni suman (`__puntosPiso`; un reinicio posterior manda).

**Pruebas**
- `t_v103`: 7/7.
- Pruebas viejas actualizadas:
  - `t_v055` y `t_v056` fijan las unidades viejas en sus datos;
  - el arnés pone `__puntosPisoFijo` en las pruebas viejas (`pisoReal:true` prueba el piso).

## v102 — 03/11/2026 · Revisión completa: arreglos en todas las áreas

**Pedido de Ángel:** «Revisá todo de nuevo, cada módulo, cada línea, que todo tenga sentido» (la auditoría quedó en `docs/AUDITORIA_v101.md`) y después «resolvelo todo». Además: «el ítem de cable: si paga solo zanja, son los metros zanjeados; si paga el cable, va con las ganancias», «hay obras con dos tableros y en la orden no aparecen los dos» y «calculé una plaza de 4 columnas y en la orden salían 3».

**Calculadora, itemizado y órdenes**
- **4 columnas → 3 en la orden:** el paso a ítems contaba las columnas por los vínculos. Una columna de 7 m sin vínculo ahora entra como de 1 brazo, con un aviso «⚠ a revisar».
- **2 tableros:** el tablero se reconoce también por el código (3058). La cuenta de la orden («Quedan N de T») ya no usa un resultado viejo después de recalcular.
- **Obra ya registrada y recalculada:** aparece «🔄 Pasar este cálculo a la obra». Pregunta antes, y conserva lo ya instalado. Antes el legajo, Material por obra y el pedido seguían con el cálculo viejo.
- **Cable del itemizado:** los ítems 25–40 dicen «Provisión y tendido en zanja de Cable Cu…». Pagan el cable, así que van con la subida a las columnas, como ya estaba y como certifica la Municipalidad. El zanjeo (15–20) cobra solo los metros de zanja. Se aclaró el motivo de cada renglón.
- El paso al itemizado reconoce el material **por código**, aunque se haya renombrado en el catálogo.
- Notas corregidas:
  - PAT metálica: «+ N de los tableros», antes decía siempre «+1»;
  - BPN: todas de 6 mm², las punteras siguen el calibre;
  - el 4×4 entre tableritos sí se computa.
- **Prensacables:** la cuenta usa la regla acordada: 1×10 → 1/2", 3×1,5 y 4×2,5 → 3/4", 4×6 → 7/8", 4×10 → 1", 4×16 → 1 1/4".

**Avance, legajo, informes y plata**
- Etapa y «qué falta» salen de los ítems. Antes, una obra al 100 % decía «Falta: Poste de PRFV».
- Tildar la Inspección pregunta antes de marcar todo el material como instalado.
- **«Finalizada» tiene un solo criterio** en Inicio y en el mapa: encendida, o marcada Finalizada, o el avance al 100 %.
- Colores del avance iguales a los del mapa.
- Las obras **ocultas (terminadas) siguen sumando** en los totales de plata del Itemizado 2026 y en la Ganancia.
- **Ganancia sin IVA**, igual que los gastos. Antes subía 21 % si en Itemizado se elegía «con IVA».
- Cargar el certificado plaza por plaza deja lo mismo que «Cargar todas»: si la plaza está finalizada, lo hecho = lo contratado.
- El legajo muestra «N de M materiales completos», igual que el Avance.

**Sin señal y comprobantes**
- Las marcas y fotos en cola se escriben directo cuando vuelve la señal, sin quedar esperando.
- Los vales, entradas y devoluciones guardan su número. Antes un número podía cambiar o repetirse al anular uno viejo. Los repetidos viejos se muestran con «-B».

**Pañol**
- Material de la obra: respeta la unidad del cálculo. Si el pañol cuenta en Un., pregunta «📏 ¿Cuántos m trae cada Un.?» y lo guarda en el producto (`porUnidad`).
- Lo cambiado por otro material («⇄ Ofrecer otro», alternativas) ya no sale como faltante ni se pide dos veces. La alternativa elegida se recuerda.
- Las reservas no cuentan lo marcado «No hay».
- La lista de compras usa lo libre (no apartado) y descuenta lo ya apartado para la obra.
- Anular un movimiento ofrece anular su pareja (corrección / uso de cargo) y avisa si tiene reserva. Los movimientos no se borran.

**Órdenes y puntos**
- Reinicio de puntos: las quincenas ya pagadas no dan ajustes negativos.
- Tarea repartida: lo que queda para toda la cuadrilla cuenta una vez, aunque lo marquen varios.
- «Quedan»: una orden cerrada que sigue otro día deja lo que falta asignado. «Terminada» sin cierre no cuenta como hecho.
- Mis tareas: una orden cerrada no se puede tocar (antes dejaba marcar y la base lo rechazaba). Si sigue otro día, sigue en Hoy.
- Inicio de la cuadrilla: solo las órdenes donde la persona está en el personal.
- Las anuladas no suman en el informe de órdenes.
- Las fotos se limpian solo si el cierre se guardó.
- Anular o borrar una orden cerrada ofrece **revertir el avance** que había sumado.

**Pruebas**
- Nuevas: `t_v102a` 10/10 (cel 11/11), `t_v102b` 8/8, `t_v102c` 11/11 (cel 12/12), `t_v102d` 8/8, `t_v102e` 6/6, en PC y celular.
- `t_v055` actualizada: «📏 ¿Cuántos m trae cada Un.?» en lugar de «Poner unidad».
- Batería completa en PC y celular: todo OK. `t_v083` es vieja. `t_v028` en celular esta vez pasó.

**No cambia:** los datos (todo arreglo pregunta antes), las reglas de Firebase ni el APK.

**Queda para la próxima** (de la auditoría, menos urgente):
- Proyectista: largo del tramo por la cadena de puntos, subida igual a la calculadora.
- Usuarios: filtros de «foto borrada», push al cambiar de usuario, `esCrew` con ajustes, reintentos con espera.

**Preguntas para Ángel**
- Códigos repetidos del catálogo: 7010/1032, 3038=3039, 7005=7006…
- ¿Son BPN los 7004–7007?
- Unidad del 1009.
- 3/4": ¿5029 plástico o 5023 aluminio?
- Las provisiones 83–89 pesan en el % de avance: ¿las sacamos?
- Ganancia del troncal PRFV: ¿altura entera o hasta la caja (3,5 m)?

**Huella SHA-256**
- `102_2026-11-03_app-EMA_ORIGINAL.html` (63.402 líneas): `72538524f4659740a1a90b69e9eae49fa5bafb6ae9b756468994b3d0c234e16f`
- `index.html`: `b645889b4dd290c44dc51c8ac3cc7756f441c7db253432f2268504725c3c5885`
- Versión: `2026-11-03 06:41 · d4264c`

## v101 — 03/11/2026 · Alternativas del pañol para lo que falta en el cálculo

**Pedido de Ángel:** «Revisá Calculadora ↔ pañol: hay algo que no se soluciona». Después del diagnóstico: «el 1019 y el 1025 son 3×1,5; cambia que antes nos lo daba la Municipalidad y ahora lo proveemos nosotros, y cambian las normas. Que apenas hacemos el cálculo nos salga en rojo que no tenés esta, pero en verde o en amarillo tenés estas opciones muy iguales, teniendo en cuenta las normas».

**Diagnóstico**
- La calculadora pide sus códigos, en metros: 6001 (cable 3×1,5), 7010 (cable verde-amarillo 10 mm²), 5027 (prensacable 5/8" con tuerca)…
- El pañol tiene los productos del Excel, muchos en Un. (rollos): 1019 y 1025, 1032 / 7011 / 7012, 5024 + 5032…
- Por eso lo calculado salía en 0 aunque hubiera stock.
- La comparación de nombres de «Calculadora ↔ pañol» no veía esos casos y además marcaba como «parecidos» productos de otra medida: 1/2" con 1 1/2", 1 A con 2 A, 4×4 con 4×6.

**Cambios**
- **«📦 Material de esta obra»** (aparece al calcular una obra registrada y en Material por obra): debajo de cada material en rojo o amarillo, lo que hay en el pañol y se parece.
  - 🟢 **Casi igual:** mismo tipo y misma medida (conductores × sección, pulgadas, amperes, polos, curva), y la norma no choca.
  - 🟡 **Sirve con diferencias:** otra norma, un conductor de más, sección mayor (hasta 2,6 veces), otro material del prensacable, sin tuerca, borne sin color, o un nombre que dice más.
  - Cada diferencia queda escrita, junto con «lo daba la Municipalidad», «no dice la norma» y «lo cuentan en rollos».
  - Nunca se ofrece: menor sección, menos conductores, otro amperaje, polos o curva, aluminio por cobre, otro color, un fotocontrol por una térmica, ni un terminal de otra sección.
- **«Pedir esta en su lugar»:**
  - si el pañol la cuenta en otra unidad, pregunta la equivalencia («¿cuántos m trae cada rollo?») y la recuerda en ese aparato;
  - cambia el pedido al pañol;
  - lo anota en las notas («1025 en lugar de 6001, revisar norma y medida»);
  - si el pañol tiene una parte, pide esa parte y completa con la alternativa.
- **«Calculadora ↔ pañol»:** el aviso «En 0, pero hay otro parecido» usa la misma comparación, con 🟢 / 🟡 y las diferencias.
- **No une ni cambia códigos**, porque cambian la norma y el origen. No cambian los datos ni las reglas de Firebase. No hace falta APK nuevo.

**Pruebas**
- `t_v101`: 10/10 en PC y 11/11 en celular.
- `t_v056` se actualizó: las filas de alternativas no se cuentan como materiales.
- `t_v055` sigue OK: el alambre 1001 encuentra el 1450 «galvanizado», por la regla de palabras para lo que no tiene medida.
- Batería completa en PC y celular: OK.
  - `t_v083` es vieja.
  - `t_v028` en celular falla a veces: la foto de «T1 · C2 · Col 5» no queda guardada. Pasa también con la v100 (1 de cada 4 corridas), así que ya estaba. **Queda pendiente revisarla.**

**Huella SHA-256**
- `101_2026-11-02_app-EMA_ORIGINAL.html` (63.106 líneas): `e43ca2227407138d34ea7452dd547dc1e37c03487e89eced058a630bfcb1ef06`
- `index.html`: `b4241172a2d5678e3a29fa1b091f952ee3c45fbd5f72192e9c0d537427e8bc9a`

## v100 — 02/11/2026 · Avance de obra limpio y gráfico · material calculado vs. entregado en el legajo

**Pedido de Ángel:** «Sacar del avance de obra las etapas (criterio EPEC), la valorización de la licitación, el material entregado vs. calculado (que vaya a Obras y legajos, con colores, bien a la vista) y las fotos de la plaza (ya están en el legajo). Que el avance de obra sea solo la obra y su avance ítem por ítem: bien gráfico, lindo de ver, fácil e interactivo para cambiar cuántas se hicieron».

**Cambios**
- **Avance de obra, ítem por ítem:**
  - arriba, el avance total y los ítems completos;
  - tarjetas por rubro con su % y barra: columnas, tablero y acometida, zanja y cruces, cable y empalmes, puesta a tierra, otros, provisiones;
  - colores como los pines del mapa: gris sin empezar · rojo < 30 % · amarillo 30–59 % · azul 60–99 % · verde completo;
  - cada ítem con su color, «7 de 8», barra, − / + / ✓ Todas;
  - las columnas (hasta 40) se ven y se tocan una por una sin desplegar, con su nombre (T1 · C1…);
  - los metros se escriben a la vista, con +1 / +10 / +50;
  - con «⋯» se cambia el total del ítem o se lo saca (pregunta antes);
  - «＋ Agregar un ítem del pliego» (antes estaba en la valorización).
- **Lo que se sacó del Avance de obra:**
  - la lista de etapas (criterio EPEC): las etapas se siguen tildando solas desde el itemizado, así que el gauge, el tablero y el mapa no cambian, y la inspección municipal se tilda en «Datos para el informe»;
  - la valorización de la licitación;
  - el material entregado vs. calculado, que pasó al legajo;
  - las fotos de la plaza, que ya están en el legajo.
  - Los materiales del cómputo y lo instalado quedan plegados abajo («🧰 Materiales…»).
- **Legajo, «🧾 Material: calculado vs. entregado»:**
  - % de lo calculado que ya salió del pañol;
  - tarjetas de colores que filtran: falta, de más, coinciden, sin entregar, sin calcular;
  - cada material con su barra, ordenados primero lo que salió de más y lo que falta;
  - lo que sobró se devuelve al pañol o se pasa a otra obra, como antes;
  - planilla e impresión.
- No cambian los datos ni las reglas de Firebase. No hace falta APK nuevo.

**Pruebas**
- `t_v100`: 20/20 en PC y 22/22 en celular.
- Se actualizaron `t_v045` (ya no hay tabla de valorización ni lista de etapas) y `t_v047` (filas agrupadas por rubro). Las dos dan OK.
- Batería completa en PC y celular: OK.
  - `t_cargador` y `t_v028` (cel) fallaron con la máquina cargada; solas dan 16/16 y 22/22.
  - `t_v083` es vieja.

**Huella SHA-256**
- `100_2026-11-02_app-EMA_ORIGINAL.html` (62.924 líneas): `21b35f4f4351f77458d9b8822c19da2c44797e50e4ce9b857333251e2ae8fcc8`
- `index.html`: `b3fce885250189ce7459b76b06aaaaaec656a4a86707041e01b5b7f684bcd7c1`

## v099 — 02/11/2026 · Proyectista: editar puntos y tramos, plano que se mueve

**Pedido de Ángel:** «En Proyectos no se puede mover el plano; solo se ve el catastro de la parte que selecciono. No puedo eliminar ni mover los puntos. Los tramos salen rectos: poder darles la forma del camino (caminando o en la compu). Y los puntos: editarlos, borrar, cambiar, mover, en la compu y en obra. Fijate qué más mejorar».

**Cambios**
- **Puntos en el mapa:** se tocan y se abre un cuadro con:
  - el tipo (si el nombre era automático, se renombra: C3 → T2), el nombre y la nota;
  - **mover**: arrastrándolo, con «🎯 Moverlo tocando el mapa» o con «📍 Traerlo a donde estoy» (GPS);
  - «✂ Empezar tramo nuevo acá» / «🔗 Unirlo con el anterior»;
  - «🗑 Borrar», que pregunta antes.
- **Forma de los tramos:** se toca la línea y aparecen «＋» a la mitad de cada pedazo. Tocado o arrastrado, el «＋» agrega un quiebre; los cuadraditos se arrastran; también se puede sacar un quiebre o «↺ Dejarlo recto».
- **«🚶 Dibujar el camino caminando»:** mientras se camina se ve el recorrido y la distancia «por donde caminaste». Al marcar el próximo punto, el tramo sigue la curva caminada, sin el temblequeo del GPS (simplificado a 0,5 m).
- **El largo va por el camino** en las cotas, la planilla, el plano impreso, el DXF (polilínea en la capa TRAMOS) y el cable del cálculo eléctrico.
- **Plano:**
  - se arrastra para moverlo y se acerca con ＋ / −, la rueda del mouse o dos dedos; «⤢» vuelve a ver todo;
  - el catastro se baja y se dibuja de la parte que se está mirando (hasta 4 km de ancho; más lejos dice «Acercá para ver el catastro»);
  - los puntos y los quiebres también se tocan y se arrastran en el plano.
- **«↶ Deshacer»** (hasta 30 pasos) después de mover, borrar o cambiar.
- **Arreglos que salieron al revisar:**
  - el mapa ya no se rearma ni vuelve a encuadrar todo cada vez que se agrega o mueve un punto;
  - el GPS ya no redibuja los puntos cada segundo: antes los toques se podían perder;
  - al tocar el mapa con la pantalla scrolleada, el mapa tomaba el teclado y corría la pantalla, y el toque caía al lado.
- En 📋 Puntos, cada fila tiene «🗺» para ir a ese punto en el mapa. Al reordenar o borrar, los tramos que cambian quedan rectos.
- Datos: `punto.via = [{la, lo}]` (quiebres desde el punto anterior) y `punto.movido`. No cambian las reglas de Firebase. No hace falta APK nuevo.

**Pruebas**
- `t_v099`: 26/26 en PC y 27/27 en celular. Cubre mapa (tocar, arrastrar, tocar el mapa, tipo, nota, borrar, deshacer), quiebres, largos, DXF, planilla, cálculo eléctrico, camino caminando y plano (＋, arrastrar, rueda, dos dedos, ⤢, tocar y arrastrar puntos).
- Las de Proyectista anteriores siguen OK: `t_v089`, `t_v090`, `t_v091`, `t_v092`, `t_v095`.
- El código de Proyectista sale igual con esbuild para Chrome 80 que para lo último (no usa nada nuevo).
- Batería completa en PC y celular: 174 de 176 OK. Las 2 que fallan son de `t_v083`, que quedó vieja (la reemplaza `t_v084`).

**Huella SHA-256**
- `099_2026-11-02_app-EMA_ORIGINAL.html` (62.789 líneas): `b8bf217ac9b85626643e9979c6a4c5f5fef96eec3ad5c5c02cb4a7c9be5697ca`
- `index.html`: `66ed669a5faf7469cb9ea462a0f18a3bdf3650b3127614ca3b8e34e717ad5e44`
- Se genera con `patch_v099.py` sobre el ORIGINAL de la 098 (que sale de `patch_v098.py` sobre la 097).

## v098 — 02/11/2026 · Órdenes ↔ avance de obra · «¿Olvidaste tu contraseña?»

**Pedidos de Ángel:**
- «Las órdenes tienen que convivir con el avance de obra: si en el avance pongo que se hicieron 7 columnas de 8, la orden me tiene que decir que queda una. Y viceversa».
- «Que puedan recuperar su contraseña o usuario con el correo ellos mismos».

**Cambios**
- **«Quedan N de T» de la orden:**
  - lo hecho de cada tarea es lo mayor entre lo cerrado en órdenes y lo cargado en el **Avance de obra**, en los ítems propios de la tarea;
  - no se suman, porque el cierre de una orden ya avanza el itemizado;
  - dice «hecho 7 (según el Avance de obra)»;
  - sin cálculo de materiales, el total sale del itemizado.
  - Vale para las tareas que tienen ítem propio: columnas, zanjeo, cable, tablero, poste, PAT, retiros, poda, etc.
  - Excavación, hormigonado, BPN, sellado y vínculos (van adentro del ítem de la columna completa) siguen contando por las órdenes.
  - Idea para más adelante (Ángel): darle a cada tarea un ítem propio aunque tenga otro nombre.
- Al revés (orden cerrada → avance) ya andaba.
- **Entrada:**
  - «¿Olvidaste tu contraseña o tu usuario?»: con el usuario o el correo, Firebase manda en castellano el enlace para elegir una contraseña nueva;
  - en pantalla se ve el correo tapado (an\*\*\*\*@gmail.com) y el aviso de que lo busquen en Spam;
  - si escribió el correo, le muestra su usuario;
  - si el usuario no tiene correo de verdad (el inventado `usuario@ema-alumbrado.app`), le dice que lo pida a la oficina.
  - No escribe nada en la base: usa `configEquipo/alias`, que ya era público para entrar.
- Ángel decidió dejar el cartel de ubicación de Android como está, con el APK 1.2.
- No cambian las reglas de Firebase. No hace falta APK nuevo.

**Pruebas**
- `t_v098`: 9/9 en PC y 10/10 en celular.
- `t_v098b`: 11/11 en PC y 12/12 en celular. El correo de verdad no se puede probar desde acá: probalo con un usuario con Gmail.
- Batería completa en PC y celular: OK.
  - `t_v028` y `t_v086` fallaron con la máquina cargada; solas dan 22/22 y 19/19.
  - `t_v083` es vieja, la reemplazó `t_v084`.

**Huella SHA-256**
- `098_2026-11-02_app-EMA_ORIGINAL.html` (62.465 líneas): `16db63b89a754acb161365b45149770ad9330778326582e00a559249dd39509a`
- `index.html`: `7ffe954030bccc93b924120a6f67f2e362d83447e4b7234dd745826fd1f2325c`

## v097 — 02/11/2026 · Varios equipos en una misma tarea, cada uno con su cantidad

**Pedido de Ángel:** «Falta repartir quiénes lo hacen juntos y quiénes solos. En una tarea, como la BPN, separar los equipos que la van a hacer: un equipo de dos o tres arma unas y otro arma otras».

**Cambios**
- **«👥 Elegir quiénes»** ahora admite varios equipos:
  - con **«＋ Otro equipo»** se arma el 2, el 3…, cada uno con su gente y **cuánto le toca**;
  - un equipo sin cantidad se lleva lo que queda, repartido parejo;
  - cada persona va en un solo equipo: tocarla en otro la pasa de equipo;
  - avisa si se repartió de más o si falta.
  - Ejemplo: BPN 24 → Juan + Pedro 12 · Mario + Luis 8 · Ana sola 4.
- **Mis tareas:** cada uno ve lo de su equipo («12 columnas · 👥 con Pedro · de 24 en total · otros: Mario y Luis 8 · Ana 4») y marca lo de su equipo. Quien no está en ningún equipo no la ve.
- **Cierre:** «👥 Cuánto hizo cada equipo». Viene de lo que marcaron; la oficina lo corrige, y el total se arma solo.
- **Puntos:** los de la tarea se reparten entre los equipos por lo que hizo cada uno y, adentro de cada equipo, por peso del rol × horas.
- La hoja impresa, el Inicio de la cuadrilla, «📋 Quién hace qué» y «📸 Avance» muestran los equipos y lo de cada uno.
- Con un solo equipo funciona como en la v094.
- Datos: `ot.equipos = { tarea: [{ nombres, cant }] }` · `campo.marcasE.<tarea>.<n° de equipo>` · `cierre.hechoEquipo`.
- No cambian las reglas de Firebase (la cuadrilla solo escribe dentro de `campo`). No hace falta APK nuevo.

**Pruebas**
- `t_v097`: 23/23 en PC y 24/24 en celular.
  - Armar 3 equipos, cantidades y avisos, cambiar a alguien de equipo, guardar, editar, imprimir.
  - Lo que ve y marca cada uno (Juan, Pedro y Mario) y el Inicio.
  - El avance, el cierre por equipo y los puntos (12/22 · 6/22 · 4/22, sin perder ni duplicar).
- `t_v094`, `t_v079` y `t_v096` siguen dando OK.
- Batería completa en PC y celular: 168 de 170 OK. Las 2 que fallan son de `t_v083`, que quedó vieja (la reemplaza `t_v084`).

**Huella SHA-256**
- `097_2026-11-02_app-EMA_ORIGINAL.html` (62.341 líneas): `1680fddb0883acc0cd96c46eaad080c545974ebfaf240c1f5f82c1459e4cfe53`
- `index.html`: `00d80e3f27477ae7906343a4abcf1c999c8c2b8b7086b0993cc12f8124dedb87`
- Se genera con `patch_v097.py` sobre el ORIGINAL de la 096.

## v096 — 02/11/2026 · «📸 Avance» de cada orden, en vivo

**Pedido de Ángel:** «En el tablero se ve el avance; estaría bueno poder entrar y ver las fotos y todo de esa obra según va avanzando».

**Cambios**
- **Tablero de órdenes:** cada tarjeta tiene **«📸 Avance»**. También se abre tocando el nombre de la plaza.
- **Hoja del avance (se actualiza sola mientras la cuadrilla carga):**
  - Arriba:
    - barra de avance («N de T tareas marcadas») y cantidad de fotos;
    - el personal;
    - checklist de seguridad (quién y a qué hora);
    - quién ya envió y a qué hora;
    - horas de cada uno y novedades.
  - **Tarea por tarea:**
    - quién la hace (toda la cuadrilla, una persona, el grupo de «👥 Elegir quiénes» o el reparto);
    - el previsto;
    - «✓ Se hizo · cuánto», «✗ No se hizo · por qué» o «⏳ Sin marcar», con quién marcó y a qué hora;
    - lo de cada uno si está repartida;
    - las medidas cargadas;
    - las fotos con miniatura.
  - **Otras fotos de la orden**, como la de seguridad.
  - Tocando una foto se abre el visor con todas las fotos de la orden.
  - Botones: **«📸 Ver las N fotos»**, **«📁 Legajo de la obra»**, **«🖨 Ver / imprimir»** y **«✅ Revisar y cerrar»**.
- Solo mira la orden: no cambia nada en la base. No cambian las reglas de Firebase. No hace falta APK nuevo.

**Pruebas**
- `t_v096`: 17/17 en PC y 18/18 en celular. Contenido, fotos al visor, que se actualiza sola cuando la cuadrilla marca y sube una foto, los botones, Escape, que no cambia la orden y que en el celular no hay scroll de costado.
- Batería completa: corrida junto con la de la v097 (que incluye todo lo de la v096).

**Huella SHA-256**
- `096_2026-11-02_app-EMA_ORIGINAL.html` (62.202 líneas): `0f3d042891b6ff08845cebaa476367ef68f927e4d3803dd0a6e57d1458aa1373`
- `index.html`: `852efb048b32ff3e6f03aacc364e662ca2695316fcd539572fb2313736dac1f2`
- Se genera con `patch_v096.py` sobre el ORIGINAL de la 095.

## v095 — 02/11/2026 · Catastro de Córdoba de fondo en Proyectista + visor de fotos que quedaba corrido

**Pedido de Ángel:** «En la app, en el plano, ya tendría que ver el catastro de fondo». Mandó el catastro v6, más preciso, armado con el otro chat: un DXF por cuadrante y las plazas en GeoJSON.

**Cambios**
- **Mapa de Proyectista:** encima del satélite se ven manzanas, parcelas, baldíos, ejes y nombres de calles, anchos de calle, plazas, barrios y vías del tren.
  - Aparece desde el acercamiento 16. Las parcelas se ven de más cerca, y sus números, más de cerca todavía.
  - El chip **«🗺 Catastro»** lo prende y lo apaga; la app se acuerda de la elección.
  - Si el mapa está muy lejos, dice «Acercá el mapa para ver el catastro». Sin señal, avisa.
- **Plano, plano impreso (PDF) y memoria de cálculo:** salen con el catastro de la zona de fondo.
- **DXF:** lleva el catastro alrededor de los puntos en capas `CAT_MANZANA`, `CAT_PARCELA`, `CAT_BALDIO`, `CAT_EJE`, `CAT_AVENIDA`, `CAT_PLAZA`, `CAT_BARRIO`, `CAT_FFCC` y `CAT_TEXTO`.
- **«🌳 Traer el borde de la plaza (catastro)»:** pone solos los puntos de borde de la plaza donde está el proyecto (1.156 plazas). Avisa si el catastro la marca como edificada o aproximada. Si ya había borde, pregunta antes de cambiarlo.
- Los puntos de borde se dibujan como puntitos sin cartel, para no tapar el plano.
- **Coordenadas:** el DXF venía en POSGAR 94; se pasó a POSGAR 2007 (+0,162 m E, +0,610 m N, PROJ), que es lo que usan la app y el GPS. La conversión de Gauss-Krüger a latitud/longitud se controló con PROJ: diferencia menor a 0,001 mm.
- **Datos:** carpeta `catastro/v6` en GitHub junto a la app: 54 bloques de 4 km, las plazas y un índice. Son 56 archivos, 55 MB (15 MB comprimidos). Se baja solo el bloque que se mira, y el `sw.js` lo guarda para verlo sin señal. Ver `docs/CATASTRO.md`.
- **Visor de fotos** (captura de Ángel en la compu: foto partida en dos, sin la ✕):
  - Al tocar una miniatura del final de la tira, o al pasar rápido con la flecha del teclado o «›», el visor entero quedaba corrido de costado.
  - Causa: al centrar la miniatura, el navegador también desplazaba el visor.
  - Ahora la tira se centra sin mover el visor, el visor vuelve solo a su lugar si algo lo corre, y los pases van de a uno.
- No cambian las reglas de Firebase. No hace falta APK nuevo.

**Qué hay que hacer**
1. Descomprimir `catastro.zip` y subir la carpeta **`catastro`** entera a la raíz del repo en GitHub (*Add file › Upload files* y arrastrar la carpeta; son 56 archivos).
2. Subir `index.html`.

**Pruebas**
- `t_v095`: 18/18 en PC y 19/19 en celular, con el catastro real servido junto a la app.
  - Plaza de las Américas: baja 1 bloque de 54 y muestra nombres de calles y de la plaza.
  - El chip, el «acercá el mapa», el plano con catastro y el DXF en capas `CAT_…`.
  - El borde de 46 puntos, el plano impreso con catastro, y que sin señal avisa y el resto sigue andando.
- `t_v095b` (visor, 40 fotos, pantalla de 1919 px): 6/6 en PC y 5/5 en celular. Con la v094 reproduce el error (visor corrido 736 px).
- `t_v092` se actualizó: el DXF ahora trae los vértices del catastro, así que cuenta solo los del borde.
- Batería completa (83 pruebas, PC y celular): todo OK. `t_v083` quedó reemplazada por `t_v084`.

**Huella SHA-256**
- `095_2026-11-02_app-EMA_ORIGINAL.html` (62.041 líneas): `a24acb13986cd4e59e61271033cf0dbd895aa6e084d0344979dc47c5659518fa`
- `index.html`: `22f67f2b9985a17ab73a571de36da1a0caa7c96103fb3e846fd03b4dd28d4348`
- `catastro.zip`: `6bbf59fb725e8b797da8141371e10d3a239c5e66e616f51f359cd48fd9bf3a1f`
- Se genera con `patch_v095.py` sobre el ORIGINAL de la 094.

## v094 — 02/11/2026 · «👥 Elegir quiénes»: una tarea la hacen varias personas juntas

**Pedido de Ángel:** «Van 4 a la plaza: dos paran la columna y dos arman el tablero. No tengo dos tableros sino dos personas que trabajan en un tablero, y el ✂ Repartir no lo contempla. Que cada tarea pueda elegir quiénes la hacen y dividir las tareas entre ellos».

**Cambios**
- En la orden, en «¿Quién?» de cada tarea: **«👥 Elegir quiénes (la hacen juntos)»**. Se tocan las personas que la hacen (por ejemplo, Juan y Pedro en el tablero).
- **Mis tareas:** esa tarea le aparece solo a ellos, con «👥 con Pedro». Los demás no la ven. Es una sola tarea para el grupo: cualquiera la marca.
- **Puntos:** los de esa tarea se reparten **solo entre ellos**, con la regla de siempre (peso del rol × horas trabajadas). Al cerrar quedan fijados.
- **«📋 Quién hace qué»** debajo de las tareas de la orden: cada persona con sus tareas, para ver de un vistazo cómo quedó la división.
- La hoja impresa dice «👥 La hacen juntos: …»; el Inicio de la cuadrilla, «a vos: … (con Juan)»; el cierre, quiénes la hicieron.
- Si se elige una sola persona, queda como «asignada» de siempre.
- La cajita de «✂ Repartir» sigue mostrando solo personas (no la opción nueva).
- Arreglo: tocar adentro de la cajita de «✂ Repartir» (fuera de los números) destildaba la tarea. Ya no.
- Datos: `ot.equipoTarea = { tarea: [nombres] }`. No cambian las reglas de Firebase. No hace falta APK nuevo.

**Pruebas**
- `t_v094`: 22/22 en PC y 23/23 en celular. Arma la orden con 4 personas (columna Juan + Pedro, BPN Mario + Luis), edita, imprime, mira lo que ve cada uno en Mis tareas e Inicio, cierra y controla que los puntos de cada tarea quedan solo en su grupo, sin perder ni duplicar.
- Batería completa (81 pruebas, PC y celular): todo OK. `t_v083` quedó reemplazada por `t_v084`.

**Huella SHA-256**
- `094_2026-11-02_app-EMA_ORIGINAL.html` (61.794 líneas): `ee3c9d2fb518d64121ed7111e59caf2d03b93ac14edc11164840cf0429f6ce6a`
- `index.html`: `6872fb34f97253d22d16dbcb7f837138a9fe862a6b8bf25fb21d7c9ad5e194e1`
- Se genera con `patch_v094.py` sobre el ORIGINAL de la 093.

## v093 — 02/11/2026 · La pantalla no se mete debajo del reloj ni de los botones de Android

**Pedido de Ángel** (captura del celular): «la parte de arriba y abajo me gusta que esté cristal, pero la pantalla no tendría que superponerse».

**Causa:** la app de Android trabaja «de borde a borde». El cargador del APK avisa `viewport-fit=cover` y Android le pasa a la página el alto de la barra del reloj y de la de botones. La página de la app no tenía `viewport-fit=cover`, así que esos valores le llegaban en 0: el encabezado quedaba debajo del reloj y el final de cada hoja, debajo de los botones.

**Cambios**
- La página pide `viewport-fit=cover`: ahora le llegan los bordes del celular. También empiezan a andar los bordes que ya usaban la cámara, los avisos y otras hojas.
- **Encabezado:** el vidrio sigue llegando hasta arriba de todo, pero el botón del menú, el logo y el título arrancan debajo del reloj.
- **Abajo:** al final de cada hoja queda el espacio de los botones de Android. El menú lateral respeta los dos bordes.
- En la app de Android, los íconos del reloj y la batería pasan a oscuros (en blanco se leían mal sobre el vidrio claro).
- En la compu y en el navegador común no cambia nada.
- No cambian las reglas de Firebase. No hace falta APK nuevo.

**Pruebas**
- `t_v093`: 8/8 en PC y en celular (bordes simulados: reloj 32 px, botones 48 px).
- Batería completa (80 pruebas, PC y celular): todo OK. `t_v083` quedó reemplazada por `t_v084`.

**Huella SHA-256**
- `093_2026-11-02_app-EMA_ORIGINAL.html` (61.584 líneas): `69dd1cd74120c3e2864f37dbdd2a00b594cd0c9298f297e8801ee2024dda071b`
- `index.html`: `caabd6e0dc4eea813ebef380398a0807efcb53240f0b8d3dcde4b29edbfb729c`
- Se genera con `patch_v093.py` sobre el ORIGINAL de la 092.

## v092 — 01/11/2026 · Proyectista con cálculos (eléctrico y luz) + control de la ubicación con el celular bloqueado

**Pedido de Ángel:** «Investigá y hacé la mejor versión, que funcione súper bien, probalo varias veces, que no haya errores, y resolvé el tema de la ubicación (también con varias pruebas)».

**Cambios — Proyectista (solo oficina)**
- Punto nuevo **«Borde de la plaza»**: marca el contorno para el cálculo de luz. No se une con los tramos de cable.
- Pestaña **🏮 Columnas**: en cada columna, tipo (PRFV / metálica 7 o 10 m, existente), artefactos, luminaria, rumbo («mira hacia»), tablero, circuito, de dónde viene el cable, fase (auto o fija) y metros reales. «Poner a todas» para cargar rápido.
- Pestaña **⚡ Eléctrico**:
  - caída de tensión por tramo y por fase, con fasores e incluyendo el neutro, hasta la luminaria;
  - cobre flexible (clase 5, da los valores del catálogo Prysmian) o rígido (clase 2); temperatura, reserva de recorrido y subidas editables;
  - reparto automático de fases (R/S/T) para bajar la peor caída y el desbalance;
  - semáforo contra la caída máxima (3 % por defecto, **a confirmar**);
  - térmica recomendada por circuito y general; diferencial, contactor y fotocontrol **a confirmar**;
  - cuadro resumen: columnas, luminarias, cable por sección, zanja, fusibles (regla de la calculadora) y jabalinas.
- Pestaña **💡 Luz**:
  - luminarias del proyecto con su archivo **.ldt (EULUMDAT)** o **.ies (LM-63)**: lee nombre, potencia y flujo solos; sin archivo usa un reparto genérico marcado como aproximado;
  - cálculo punto por punto (E = I·cos³γ/h², factor de mantenimiento 0,8 editable) sobre el borde marcado;
  - promedio, mínimo, uniformidad y «Cumple / No cumple» contra clases P de EN 13201 (el nivel que pide la Inspección: **a confirmar**);
  - **mapa de zonas oscuras** sobre el satélite y en el plano; **radio útil** de cada columna (36 rumbos).
- **📄 Memoria de cálculo** A4: plano con la luz, columnas, circuitos, unifilar, iluminación, resumen y la lista de lo «a confirmar».
- El DXF suma el borde (polilínea) y, en cada columna, tablero/circuito/fase/luminaria.
- Datos nuevos en `proyectos/{id}`: `lums[]`, `circ{}`, `calc{}` y `el{}` en cada punto. Las reglas no cambian.

**Cambios — Ubicación en vivo**
- El celular de la cuadrilla se da cuenta solo si **se cortó con la pantalla apagada** (más de 3 min sin mandar) o si **Android cerró la app**. Le muestra qué pasó y los pasos, con el botón **«Abrir ajustes de la app»** (Batería › Sin restricciones).
- **«Probar con el celu bloqueado»** desde el renglón de la ubicación en el menú: bloquear 3 minutos y volver; dice si anduvo.
- La oficina ve en el **Mapa**, por persona: cuántas veces se le cortó hoy, la última (celu bloqueado o app cerrada) y el resultado de la prueba.
- Al volver a la app manda la ubicación al toque también en la app de Android.
- Campos nuevos en `ubicacionVivo/{uid}`: `enviosFondo, cortesHoy, ultCorteDesde, ultCorteHasta, ultCorteTipo, pruebaTs, pruebaOk, pruebaEnvios`.
- No cambian las reglas de Firebase. No hace falta APK nuevo.

**Qué hay que hacer**
1. Subir `index.html` a GitHub.
2. En cada celular de la cuadrilla: menú › renglón de la ubicación › «Probar con el celu bloqueado».

**Pruebas**
- Control numérico aparte en Python (`num/control.py`): 9.601/9.601. Fotometrías con las 5 simetrías EULUMDAT y 5 de IES (error < 1 %), iluminancia contra la fórmula (< 0,2 %), promedio independiente de la grilla, radio útil, 40 circuitos al azar con caída de tensión (diferencia < 1e-7 %), resistencias = catálogo Prysmian.
- `t_v092` (Proyectista): 35/35 en PC y 38/38 en celular. `t_v092u` (ubicación): 19/19 en PC y en celular.
- Batería completa (79 pruebas, PC y celular): todo OK.
  - `t_v090` se actualizó: ahora hay 8 tipos de punto (se sumó «Borde de la plaza»); da 6/6 y 7/7.
  - `t_v083` quedó reemplazada por `t_v084`.
- Repetidas 3 veces más, en PC y celular: `t_v092`, `t_v092u`, `t_v087`, `t_v089`, `t_v091`: todas OK las 3 veces.

**Huella SHA-256**
- `092_2026-11-01_app-EMA_ORIGINAL.html` (61.569 líneas): `3f4b515ea3a3f785dc0e364281f9e9a8bfe33b8c53eae723b1208354a5baede9`
- `index.html`: `dce2e175a7644f29e6186906208a6e1f26ff55b1f8078f5b774837fc4591d02b`
- Sello de versión (en las dos marcas): `2026-11-01 23:20 · 7547cd`
- Se genera con `patch_v092.py` sobre el ORIGINAL de la 091.

## v091 — 01/11/2026 · Proyectista con la barra de vidrio + por qué no se actualiza la ubicación

**Pedido de Ángel:**
- «No se actualiza la ubicación»: en el Mapa aparecía «sin actualizar desde 19:24».
- «La parte de arriba cristalizada, que se parezca al estilo de la app; usá la skill».

**Cambios**
- **Proyectista:** la barra de arriba ahora es igual al encabezado de la app: vidrio blanco translúcido con desenfoque, título en azul y botones redondos blancos de 44 px. El fondo lleva las mismas manchas celestes.
- **Ubicación en vivo:** cada envío guarda tres datos nuevos:
  - `fondo`: si salió con el celular bloqueado;
  - `fondoTs`: la última vez que salió así;
  - `via`: por dónde salió (`android`, `navegador`, o `app por Firebase` si falló lo de Android).
- **En el Mapa**, a quien está «sin actualizar» la oficina le ve el porqué:
  - usa el navegador (solo manda con la app abierta);
  - hoy nunca mandó con el celular bloqueado (revisar la app de Android 1.2 y la batería «Sin restricciones»);
  - o hasta qué hora mandó con el celular bloqueado.
- Cada persona muestra si usa 📱 la app o 🌐 el navegador.
- No cambian las reglas de Firebase. No hace falta APK nuevo.

**Pruebas**
- `t_v091`: 9/9 en PC y en celular.
- Batería completa OK.
  - `t_v073` falló una vez por tiempos; sola da 45/45.
  - `t_v083` quedó reemplazada por `t_v084`.

**Huella SHA-256**
- `091_2026-11-01_app-EMA_ORIGINAL.html` (60.556 líneas): `992cf9d10ec411498010550141ea2fd0170044966a28ea765abdbd85dbcad636`
- `index.html`: `32be24a329c5434369dc80e5612c7d5a212b5a7742e6697bfacfa560b976050b`
- Sello de versión (en las dos marcas): `2026-11-01 21:03 · a4a1bd`

## v090 — 01/11/2026 · Proyectista con el mismo diseño que la app + skill del proyecto

**Pedido de Ángel:** armar la skill propia del proyecto y que todo quede con el mismo diseño «Cristal».

**Cambios**
- Proyectista usa ahora las piezas del tema de la app: `.card`, `.btn-primary`, `.btn-ghost`, `.chip`, `.subtabs`/`.subtab`, `.hint` y las variables de color y letra. Antes tenía estilos propios parecidos.
- Funciones y datos, igual que en la v089.
- **Skill `ema-app-alumbrado`** (en `.claude/skills/` y como archivo `.skill` para claude.ai): la forma de trabajar y el diseño «Cristal», con los valores reales del tema.

**Qué hay que hacer**
1. Subir `index.html` a GitHub.
2. Si todavía no lo hiciste, publicar las reglas de la v089.
3. Instalar la skill en claude.ai: Configuración › Skills.
4. No hace falta APK nuevo.

**Pruebas**
- `t_v090`: 6/6 en PC y 7/7 en celular (que use las piezas de la app).
- `t_v089`: 22/22 y 23/23.
- Batería completa OK. `t_v083` quedó reemplazada por `t_v084`.

**Huella SHA-256**
- `090_2026-11-01_app-EMA_ORIGINAL.html` (60.548 líneas): `c7ff8ef320cb3a7ac54ae1ed76b13cb00351e2815b3313873812f7b82e3cd853`
- `index.html`: `35f77f0855d4f9a5b0aa59f87eaab4c41dd97d3b32326172569d7aea0cf88e67`
- Sello de versión (en las dos marcas): `2026-11-01 20:22 · b767d3`
- Se genera con `patch_v090.py` sobre el ORIGINAL de la 089.

## v089 — 01/11/2026 · Proyectista, etapa 1: relevamiento en obra

**Pedido de Ángel:** arrancar con Proyectista: marcar puntos en la obra con GPS, ver las distancias, que el plano se arme solo y sacarlo para AutoCAD. Solo para la oficina y el administrador.

**Cambios**
- Entrada **«📐 Proyectista»** en el menú, solo para Administración y Oficina.
  - El código va «dormido» y se carga recién al abrirlo. La cuadrilla no lo ejecuta ni baja los datos de proyectos.
  - La app pesa 40 KB más.
- **Proyectos:** se crean atados a una obra o sueltos. Quedan en la base, colección `proyectos`, y los ve toda la oficina.
- **Marcar puntos con el GPS**, al toque o promediando 5 s, o **tocando el mapa**.
  - Tipos: columna nueva, columna existente, tablero, acometida/poste, cámara/caja, cruce de calle, otro.
  - Nombre automático (C1, T1…), nota, «tramo nuevo», ordenar y borrar.
- **Mientras se camina:**
  - precisión del GPS con semáforo («RTK fijo» si es ±5 cm o menos);
  - **distancia en vivo** al último punto.
- **Mapa** con satélite o calles y cotas, y **plano en metros** con cotas, escala y norte.
  - **Plano / PDF** en A4, con tabla de coordenadas, en la hoja de impresión de la app.
- **Archivos para bajar:**
  - **AutoCAD (DXF R12)** en **Gauss-Krüger POSGAR 2007**: faja 4 por defecto, 3 o 5 a elegir. Sistema **a confirmar** con la base de Córdoba.
  - **DXF en metros locales.**
  - **Planilla CSV** para Excel.
- **Precisión de los cálculos:**
  - Distancias sobre el elipsoide WGS84 (Vincenty).
  - Gauss-Krüger por serie de Krüger: igual a PROJ al 0,1 mm.
- **Reglas nuevas:** `Reglas_Firestore_v089` (= v083 + `proyectos`, solo Administración y Oficina). Si no están publicadas, Proyectista avisa «Falta publicar en Firebase las reglas nuevas».

**Qué hay que hacer**
1. Publicar `Reglas_Firestore_v089.txt` en Firebase › Firestore › Reglas.
2. Subir `index.html` a GitHub.
3. No hace falta APK nuevo.

**Pruebas**
- `t_v089`: 22/22 en PC y 23/23 en celular.
  - Menú solo para la oficina; la cuadrilla ni lo carga.
  - GPS, distancia en vivo, mapa, tramos, plano, DXF controlado contra PROJ, planilla, PDF, que quede guardado, y el aviso de reglas sin publicar.
- Batería completa: 75 pruebas en PC y en celular, OK.
  - `t_v083` quedó reemplazada por `t_v084`.

**Huella SHA-256**
- `089_2026-11-01_app-EMA_ORIGINAL.html` (60.550 líneas): `90b558825d01c5abe2267d209cd8fac07497e7b996f4530ee47b719530ecb405`
- `index.html`: `0fcdc8491dd07f40f0814b467c7210bf2e59d1fa1f2ceb24585b20c36d8473fc`
- `Reglas_Firestore_v089.txt`: `ef14feef8ed79812e5309d1344a16e5c4b1dc226a1f77a5627fc01b26528539d`
- Sello de versión (en las dos marcas): `2026-11-01 19:32 · a0a82d`
- Se genera con `patch_v089.py` (+ `proyectista_menu.js` y `proyectista.js`) sobre el ORIGINAL de la 088.

## v088 — 01/11/2026 · Junta todo (la armó SALEM, la controló Claude Code)
- Es la v086 de SALEM, más la entrada rápida de la cuadrilla y la ubicación con el celular bloqueado de Claude Code.
- Lo que sumó SALEM:
  - la app abre al toque con la ficha guardada;
  - para ver si hay versión nueva baja solo los primeros 16 KB del archivo, con la etiqueta `<meta name="ema-version">`;
  - las letras y el estilo del mapa se cargan sin frenar el arranque.
- **Control de Claude Code:**
  - el `index.html` sale exacto del ORIGINAL 088;
  - están los cambios de la 086 y la 087 de Claude Code;
  - el `sw.js` es el mismo que ya está publicado.
- **Pruebas:** batería completa en PC y en celular, OK.
  - `t_v075` y `t_cargador` se actualizaron. Simulaban una versión nueva cambiando solo el sello del menú; ahora cambian también la etiqueta de arriba, y `t_v075` revisa el pedido de 16 KB en vez del pedido viejo.
  - `t_v083` quedó reemplazada por `t_v084`.
- **Huella SHA-256**
  - `088_2026-11-01_app-EMA_ORIGINAL.html`: `2e5be79d175d3e8f760217706020a0475ce7c0c1c9de40baa62fd3ef7b91cc11`
  - `index.html`: `5ccb3b231985fab55c4834f17158360c39d3a972a76c564eeb6c02adcb5730c3`
  - Sello de versión: `· v 2026-11-01 16:37 · 9e77d2`
- **Ojo para las próximas versiones:** hay que cambiar el sello del menú (`#appVersion`) **y** la etiqueta `<meta name="ema-version">` con el mismo valor. Si solo cambia el sello, a nadie le aparece «Hay una versión nueva».

## v087 — 01/11/2026 · La ubicación llega con el celular bloqueado (+ APK 1.2)

**Pedido de Ángel:** «Solo me llega la ubicación cuando están adentro de la app.»

**Causa**
- La documentación del plugin de ubicación del APK describe dos problemas, y el APK tenía los dos.
- Después de unos 5 minutos en segundo plano, Android frena lo que la app manda por el navegador interno, que es por donde va Firebase.
- Sin la opción `useLegacyBridge`, Android además deja de pasarle las ubicaciones a la app.
- Por eso la ubicación llegaba recién cuando la persona volvía a abrir la app.

**Cambios**
- En la app de Android, la ubicación se manda por el lado de Android: CapacitorHttp a Firestore por REST, con el token del usuario. Las reglas de la base son las mismas.
- El token vale una hora. Si la app está en segundo plano, se renueva también por el lado de Android.
- Si el envío por Android falla, la ubicación se manda como antes, así no se pierde.
- Si el horario termina con la app en segundo plano, el celular deja de mandar y marca «terminó».
- **APK 1.2** (`AlumbradoApp_v1.2.zip`): agrega `android.useLegacyBridge = true` en `capacitor.config.json` y pasa a versionCode 3 / versionName 1.2. El LEEME.txt explica los ajustes de batería.
- En el navegador (sin APK) sigue igual: solo puede mandar con la app abierta en pantalla. Es un límite de Android.
- No cambian las reglas de Firebase ni los datos de usuarios.

**Qué hay que hacer**
1. Subir `index.html` a GitHub.
2. Armar el APK 1.2 con COMPILAR.bat e instalarlo encima en cada celular de la cuadrilla.
3. En cada celular: Ajustes › Apps › EMA Alumbrado › Batería › «Sin restricciones».

**Pruebas**
- `t_v087`: 10/10 OK en PC y en celular, con el APK simulado: envío por Android, token vencido con el celular bloqueado, falla del envío y fin del horario.
- Batería completa: 74 pruebas en PC y en celular, OK.
  - `t_v083` quedó reemplazada por `t_v084`.
- Lo único que no se puede probar acá es el celular bloqueado de verdad. Hay que probarlo con un celular real.

**Huella SHA-256**
- `087_2026-11-01_app-EMA_ORIGINAL.html` (60.042 líneas): `fff9e6d56d57d3546f5502ef4e514851cd1cbcc944852e7d12562906c6582b63`
- `index.html`: `50bb5503bcaa1a53762ab71d8a7d4da66eec8f893e32c79c9613422bcc8cdc39`
- `AlumbradoApp_v1.2.zip`: `d937d4494a7676004a12ed57dea3aab6d3b3f27e75210f398fcc57736afa302f`
- Sello de versión: `· v 2026-11-01 15:18 · 162a3a`
- Se genera con `patch_v087.py` sobre el ORIGINAL de la 086.

## v086 — 01/11/2026 · Entrada rápida para la cuadrilla

**Pedido de Ángel:** «Sus órdenes y la cámara son la prioridad de rapidez para la cuadrilla.»

**Cambios**
- Antes, cada celular (también el de la cuadrilla) bajaba todo al entrar y todo a la vez: todas las órdenes de todos (con sus fotitos), todos los movimientos del pañol, todos los cómputos, las etapas y la planificación.
- Ahora la cuadrilla y los operarios sin permisos de oficina bajan al entrar **solo sus órdenes** (las que tienen su nombre en el personal), más obras, catálogo, reservas y configuración.
- Lo demás baja por tandas, después de las órdenes:
  - a los 1,5 s, los cómputos (los nombres de las columnas para las fotos), las etapas y la planificación;
  - a los 6 s, el pañol. Si la persona abre antes otra hoja (Pañol, Plan, etc.), baja al toque.
- La oficina, el pañol, «solo mirar» y la cuadrilla con permisos de oficina siguen igual que antes.
- La primera vez en un celular la app todavía no sabe el rol, así que baja todo. Desde la segunda vez entra rápido.
- Si en la base le cambian el rol a alguien (por ejemplo, pasa a oficina), al confirmarse el usuario baja todo enseguida.
- Ahorra lecturas de Firebase: la cuadrilla ya no baja las órdenes de los demás.
- Para soporte: `__modoDatos.estado()` muestra el modo, lo que se está bajando y los tiempos.

**Qué hay que hacer**
- Subir `index.html` a GitHub. No hace falta cambiar las reglas de Firebase ni armar un APK nuevo.

**Pruebas** (señal lenta simulada de 2 Mbit/s, 204 órdenes, 3000 movimientos)
- Las órdenes de la cuadrilla llegan en 0,1 s; antes tardaban 11 s.
- La Cámara EMA abre en 1,2 s; antes tardaba 11,7 s.
- `t_v086`: 19/19 OK en PC y en celular.
- Batería completa: 73 pruebas en PC y en celular, OK.
  - `t_v073` (PC) falló una vez por tiempos con la máquina cargada; corrida sola da 45/45.
  - `t_v083` quedó reemplazada por `t_v084`.
- Las pruebas pueden simular señal lenta con `window.__stubKbps` (en `firebase_stub.js`).

**Huella SHA-256**
- `086_2026-11-01_app-EMA_ORIGINAL.html` (60.001 líneas): `0844fba7df51c760528ad02b07816b76c0ad8d7e75fe06da4f8ae0feed76fb7e`
- `index.html`: `49e784b2e23dc625ce21dc4711255c8ea670443b2f32ce4a3b695625bd49d434`
- Sello de versión: `· v 2026-11-01 14:24 · 76b5ff`
- Se genera con `patch_v086.py` sobre el ORIGINAL de la 085 (SHA-256 `bfb3eb22…7ff47fe6`).
