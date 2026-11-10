# Historial de versiones — App Alumbrado Público (EMA Servicios)

Autor: Miguel Ángel Díaz © 2026

## v139 — 10/11/2026 (en la rama `claude/new-session-3hwmc9`, sin publicar) · La app ocupa toda la pantalla en la compu

**Pedido de Ángel** (10/11/2026): «revisá cómo se adaptan las pantallas nuevas a la compu, la idea es que ocupe toda la pantalla».

**Base:** ORIGINAL 138 (la publicada, `a52024ac…`).

**Cambios** (solo con más de 900 px de ancho; en el celular y hasta 900 px no cambia nada). Hoja nueva `<style id="v139PcCss">` y script chico `<script id="v139Pc">`, antes de `revisarAppDiag`. No cambian ids, clases ni el JS de antes.
- **Inicio Ejecutivo a todo lo ancho:** la portada azul ocupa el área de contenido con 28 px de margen y puntas redondeadas (tope 2200 px). Adentro: saludo a la izquierda, los 3 KPIs más anchos al medio, el anillo del contrato a la derecha y el buscador abajo. Las tarjetas (Para atender · Supervisor · En obra ahora · Órdenes de hoy · Accesos · Obras) van en columnas tipo masonry, sin huecos: 2 hasta 1200 px, 3 entre 1200 y 1700 px y 4 desde 1700 px.
- **Perfil en columnas:** a la izquierda la persona y los KPIs; al medio «Tus ajustes»; a la derecha «La app» y «Cerrar sesión» (2 columnas entre 900 y 1200 px). Tope 1400 px.
- **Asistente:** panel lateral derecho de alto completo, de 480 px. Se puede ensanchar o angostar arrastrando su borde izquierdo (entre 420 y 760 px; doble clic vuelve a 480; queda guardado en el aparato). Desde 1240 px el contenido de la app se corre a la izquierda y queda a la vista; entre 901 y 1239 px el panel flota encima. En el celular sigue a pantalla completa. El menú lateral se sigue abriendo por encima.
- **El resto de las pantallas** (Pañol, Producción, Órdenes, Avance, Informes, Gastos, Obras…): ancho de hasta 1960 px con 32 px a los costados (antes el tope era 1280 px). El header, el footer y la barra de pestañas van con el mismo ancho. Las tablas y las filas de KPIs ocupan todo ese ancho.
- **Formularios:** «Llenar orden» y la Calculadora ya iban en 2 columnas (formulario + resumen/resultado): quedan igual. «Registrar movimiento» quedó en una columna: sus campos están sueltos en el HTML y para partirlos en 2 columnas habría que agruparlos con JS/HTML (anotado, no se tocó).
- Sin scroll horizontal en 1024, 1280, 1440, 1600, 1920 y 2560 px. Compatible con Chrome 80: sin `:has()` y sin `gap` en flex (se usó grid y `column-count`).

**Pruebas:** `t_v139` nueva. En PC (44/44): sin scroll horizontal en las 12 pantallas a los 6 anchos; el Inicio usa el 96,5 % del ancho a 1600 y el 97,1 % a 1920, con 3 y 4 columnas (2 a 1024); la portada en una fila; tope 2200; Perfil en 2 y 3 columnas; `.wrap` de Pañol de 1600 px a 1600 y de 1960 px a 2560; Asistente de alto completo a la derecha, 480 px, sin tapar el botón del menú, el contenido al lado, arrastre y doble clic, tope, menú por encima, flota a 1024; a 900 px el Inicio y el Perfil miden igual que antes. En el celu (9/9): el Inicio, el Perfil, el Pañol y el Asistente abierto miden igual con la hoja nueva prendida y apagada. Batería completa en PC y celu sobre el index entregado: ver más abajo.

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
