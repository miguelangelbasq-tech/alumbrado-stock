# Historial de versiones — App Alumbrado Público (EMA Servicios)

Autor: Miguel Ángel Díaz © 2026

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
