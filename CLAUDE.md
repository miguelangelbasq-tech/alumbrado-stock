# CLAUDE.md — App «Alumbrado Público» de EMA Servicios

> Contexto completo para Claude Code. Leelo entero antes de tocar nada.
> Estado al **10/11/2026**, última versión entregada: **v146** sobre la v145 (ver `CHANGELOG.md`; publicada en GitHub).
> Autor de la app: Miguel Ángel Díaz («Ángel»), de EMA Servicios. En la pantalla de la app el autor queda oculto.
> Si algo de este archivo no coincide con el código, **manda el código**. Avisale a Ángel y corregí este archivo.
> **Skill del proyecto:** `.claude/skills/ema-app-alumbrado/` (forma de trabajar + diseño «Cristal» con los valores reales). Para pantallas nuevas, usá las piezas del tema (`.card`, `.btn-primary`, `.btn-ghost`, `.chip`, `.subtabs`) y las variables: ver `references/diseno-cristal.md`.

---

## 0. Cómo usar este kit

```
CLAUDE.md                        ← este archivo
fuente/085_2026-11-01_app-EMA_ORIGINAL.html   ← CÓDIGO FUENTE LEGIBLE (≈5 MB, ~59.900 líneas). Se edita ESTE.
fuente/index.html                ← lo publicado (compactado). NO se edita a mano: se genera.
herramientas/compactar80.js      ← ORIGINAL → index.html (esbuild, target chrome80)
herramientas/patch_v085.py, ubicacion_vivo.js, BASE_SHA   ← ejemplo del método de parches
publicar/                        ← lo que va en la raíz del repo de GitHub además del index (sw.js, ema-icono.png, app/, camara/)
firebase/Reglas_Firestore_v083.txt   ← reglas vigentes de Firestore (texto para pegar en la consola)
pruebas/                         ← arnés Playwright (h.js, firebase_stub.js, reglas_stub.js) y una prueba por versión (t_v022 … t_v084, t_nav, t_humo, t_cuadrilla, t_cargador…)
android/AlumbradoApp.zip         ← proyecto Capacitor del APK de Android
```

- **Fuente de la verdad:** el ORIGINAL de la última versión.
- `index.html` es un derivado: nunca se edita a mano.
- Ángel también trabaja con otro asistente (SALEM, en claude.ai) que arma versiones sobre el mismo ORIGINAL. **Si cambiás la app, devolvé siempre el ORIGINAL nuevo además del index.** Si no, la próxima versión de SALEM pisa tus cambios (o al revés).

---

## 1. Qué es y para quién

- **Cliente/usuario:** Ángel, de EMA Servicios (Córdoba, Argentina).
  - Trabaja en obra y lee mucho desde el celular.
  - Escribe rápido y con errores de tipeo: interpretá la intención.
  - Hablale en **español rioplatense, simple y directo** (vos, tenés, fijate). Respuestas cortas: primero la respuesta, después el detalle.
- **Contrato:** EPEC (empresa provincial de energía) «Servicio de adecuación eléctrica de plazas», **LPE 5589 / SIC 21760**.
  - 244 plazas en 3 zonas: A Este 127 · B Centro 63 · C Oeste 54.
  - 35.364 módulos. Ver el dominio técnico en §11.
- **La app:**
  - Gestiona obras de alumbrado público: plazas, barrios y otras.
  - Cómputo de materiales, itemizado/certificación, órdenes de trabajo para las cuadrillas, «Mis tareas» con fotos y GPS, puntos por tarea (premios quincenales).
  - Pañol: stock, reservas, herramientas, lista de compras.
  - Gastos y ganancia por obra, mapa de obras, ubicación en vivo del personal, avisos al celular, guías y normas técnicas, informes.
- **Usuarios:**
  - Administración y Oficina, que cargan todo.
  - Pañol.
  - Cuadrilla/Operario: personal de obra, con celulares Android, muchos viejos y lentos (ej. Moto g24 power).
  - Solo mirar.

---

## 2. Reglas que NO se rompen

1. **Datos de Firestore:** nunca modificar ni borrar datos de los usuarios sin preguntarle antes a Ángel. Los arreglos de datos van con un botón que el usuario toca, con confirmación. La app no «arregla sola» la base.
2. **Códigos de producto del pañol** (4 dígitos, el primero es la familia; ver §11.9):
   - `x001–x499` de cada familia: productos del Excel original (congelados) y altas del equipo. **La app nunca agrega códigos ahí.**
   - `x500–x999`: reservado a materiales que trae la app (hoy los 23 de barrio, 1501–8501, y la curva H°G° 3/4" 5503).
   - Un código con movimientos, en cómputos guardados o en reservas **nunca se reutiliza**. Un producto con movimientos no se borra: se da de baja.
   - **No inventes códigos.**
3. **No inventar datos técnicos** (medidas, ítems, coeficientes). Lo que no está en los documentos va marcado **«a confirmar»**.
   - Si el pliego y un plano se contradicen, decilo: el ítem del pliego dice **cuánto se cobra** y el plano constructivo dice **qué se compra y cómo se hace**.
4. **Hacer solo lo que se pidió.** Nada de cambios «de paso» sin avisar.
5. **SEGURIDAD — nada de secretos en la app, en el repo, en archivos, en docs ni en el chat:**
   - Las claves de **Cloudflare R2** viven solo como «Secret» del Worker `ema-fotos` (las cargó Ángel).
   - El JSON de la **cuenta de servicio de Firebase** vive solo como Secret `FB_SA_JSON` del Worker `ema-avisos`.
   - La **clave privada VAPID** está en Firestore `secretosServidor/vapid`. Esa colección **no tiene regla**, así que ningún cliente la lee. La pública está en `configEquipo/vapid`.
   - Si Ángel pega una clave en el chat: no la repitas y recomendale rotarla.
   - (La `apiKey` web de Firebase que está en el código es pública por diseño. No es un secreto, pero tampoco hace falta copiarla a otros lados.)
6. **Probar antes de entregar:** la batería completa en PC (1280×860) y celular (390×844). Si algo falla, se arregla o se dice.
7. **Material de venta / demos** (videos, folletos): marca neutra.
   - Sin «EMA», «EPEC», «licitación», «Municipalidad», nombres reales de plazas (ej. «Hípica»).
   - Sin precios ni montos.
8. No mostrarle a Ángel rutas internas del sistema ni jerga de herramientas. Hablale de «tu carpeta», «la app», «GitHub».

---

## 3. Arquitectura y despliegue

| Pieza | Dónde | Notas |
|---|---|---|
| App web | **GitHub Pages**: `https://miguelangelbasq-tech.github.io/alumbrado-stock/` — repo `miguelangelbasq-tech/alumbrado-stock`, rama `main`, raíz | Una sola página `index.html` (≈4,3 MB compactada). Ángel sube a mano: *Add file › Upload files › Commit* (ojo con «index.html.html»). Tarda 1–2 min. |
| Junto al index, en la raíz | `sw.js`, `ema-icono.png`, carpeta `app/` (`manifest.webmanifest`, `manifest-pc.webmanifest` (la app pide `?v=4`), íconos `icono-512-v3.png`, `icono-maskable-512-v3.png`, `atajo-camara-96.png`), carpeta `camara/` (página + manifest + íconos de «Cámara EMA», que abre `../index.html?camara=1`) | Solo se resuben si cambian. Casi siempre se sube **solo `index.html`**. |
| Base de datos | **Firebase Firestore**, proyecto `alumbrado-stock` (plan gratis Spark) | Login con Firebase Auth (email/contraseña). Usuario corto «angel» → correo vía `configEquipo/alias` (o `usuario@ema-alumbrado.app`). SDK **compat 12.17.1** desde gstatic. Persistencia local activada. |
| Fotos | **Cloudflare R2**, bucket `s3fotos`, a través del Worker **`ema-fotos`** (`https://ema-fotos.mdiaz-60f.workers.dev`) | `PUT/GET /f/fotos/AAAA/MM/<obra>/<id>.jpg` con el token de Firebase (RS256, aud/iss `alumbrado-stock`; GET acepta `?t=`), `/salud`. No permite borrar (405). En Firestore queda la ficha (`adjuntos.r2`) y la miniatura (`fotosObra`). Sin señal o con el Worker caído, la foto va a Firestore como antes. |
| Avisos con la app cerrada | Worker **`ema-avisos`** (`https://ema-avisos.mdiaz-60f.workers.dev`), Cron `* * * * *` | La app deja avisos en `avisosPush` (enviado:false). El Worker entra a Firestore por REST con la cuenta de servicio, manda Web Push (RFC 8291 + VAPID) a `pushSubs` y marca enviado. El `sw.js` muestra la notificación. Rutas `/salud`, `/vapid`, `/probar`. **v143 (`v143-hora`):** respeta `enviarDesde` (el recordatorio de las 7:00): lo futuro queda `enviado:"programado"` y se revisa cada minuto de 06:55 a 07:20 (AR) y cada 30 min el resto; antes de mandar un recordatorio lee la orden (`otId`): anulada, otro día o la persona ya no está → no sale; de varios con el mismo `tag` sale el último. Prueba `workers/probar_ema_avisos.mjs`; instructivo «Actualizar el Worker para la v143». |
| **Asistente EMA** (v132) | Worker **`ema-ia`** (`https://ema-ia.mdiaz-60f.workers.dev`, código en `workers/ema-ia.js`, instructivo `workers/EMA-IA_INSTRUCCIONES.md`) | `POST /ia` con el token de Firebase (`Authorization: Bearer`); deja pasar solo los campos permitidos (`model` ∈ `claude-haiku-5-5`/`claude-sonnet-5-5`/`claude-opus-5-5`/`claude-fable-5-2` (v136, Worker `v2-ia`), `system`, `messages`, `tools`, `tool_choice` auto/none, `max_tokens` ≤ 4000 (≤ 16000 con Opus/Fable), `fallbacks: "default"` + beta `server-side-fallback-2026-07-01` (respaldo del servidor ante rechazos; no en Haiku), `output_config.effort`, `cache_control`) y lo reenvía a la API de Claude con la clave que vive solo como Secret `ANTHROPIC_API_KEY`. Límite por persona (`IA_POR_MINUTO` 20, `IA_POR_DIA` 400; KV opcional `IA_KV`). Devuelve la respuesta de Claude + `ema.costoUsd`; errores `{error:{tipo, mensaje}}` en castellano. `GET /salud`. Las herramientas NO corren ahí: corren en la app. Con los modelos 5.5 / Fable 5.2 no se manda `temperature` ni `thinking` (va siempre prendido; se maneja con `output_config.effort`) y `tool_choice` solo `auto`/`none`; los bloques `thinking`/`fallback` pasan tal cual. **v136:** la app usa **Opus 5.5** para todo (chat effort medium, cierre rápido low, supervisor y «revisá todo» high); Fable 5.2 y Sonnet 5.5 se eligen en ⚙ (`configEquipo/personal.asistente.{modelo, modeloSupervisor}`, solo admin). Con el Worker viejo (`v1-ia`) cae a Sonnet 5.5 y avisa una vez. Hay que pegar el Worker nuevo (instructivo, «Actualizar el Worker para la v136»). **v141 (Worker `v3-ia`):** el rol lo lee el Worker de la base con el token de la persona (`usuarios/{uid}`: rol, activo, pendiente; y `configEquipo/personal` → `asistente.limites` / `asistente.roles`, por REST, guardados 10 min en KV); nunca le cree a la app. Topes por persona y día (preguntas y remitos aparte; `ema.tipo` `pregunta`/`remito`/`supervisor`; pregunta = último mensaje con texto de la persona, las vueltas de herramientas no suman; remito = foto o PDF sin herramientas; supervisor de admin/oficina no cuenta pero suma al gasto): admin sin tope, oficina 30 (+40 remitos), pañol 20 + 40 remitos, cuadrilla/operario/mirar 10. Freno del mes (KV `g:AAAA-MM`, suma de `ema.costoUsd`): pausa al 80 % de US$ 100 (pañol, cuadrilla, operario, mirar; `ema.freno.avisar` una vez → la app avisa a Administración), corte al 95 % (todos menos admin), reinicio el día 1. Errores `tope_dia`, `tope_remitos`, `tope_mes`, `rol_apagado`, `usuario`. `GET /uso` (admin/oficina: gasto del mes por parte y por persona), `GET /mio` (lo que le queda a cada uno), `/salud` con `version:"v3-ia"`, `gastoMes`, `tope`, `kv`. Respuesta: `ema {costoUsd, modelo, version, uso, freno}`. Sin KV cuenta en memoria; si el KV no deja escribir, sigue con la memoria. Prueba `workers/probar_ema_ia.mjs`; instructivo «Actualizar el Worker para la v141». |
| Mapa | Leaflet **1.9.4** (cdnjs) | Teselas OSM; capa satélite Esri World Imagery. |
| **Catastro de Córdoba** (v095) | Carpeta `catastro/v6/` en GitHub junto al index (56 archivos: `indice.json`, 54 bloques `b_x_y.json` de 4 km, `plazas.json`) | GK POSGAR 2007 faja 4 en cm (el DXF venía en POSGAR 94: +0,162 E / +0,610 N). Lo usa Proyectista; se baja por bloque. Ver `docs/CATASTRO.md`. |
| **Hojas de material** (v131) | Carpeta `materiales/` en GitHub junto al index: `indice.json` (`codigos` → hojas, `herramientas` [{hoja, palabras}], `titulos`) y por hoja `<hoja>_3d.webp`, `_plano.webp`, `_hoja.webp` | La arma `herramientas/armar_materiales.py <carpeta de hojas> <salida>` (se vuelve a correr cuando hay hojas nuevas). No va en Firestore. La app la pide recién al abrir una ficha (con el cargador, desde `__cargador.url`). |
| **Guías nuevas** (v136) | Carpeta `guias/` en GitHub junto al index (≈ 36 MB, 194 archivos): `indice.json` (v16: `tipos` id → hoja, `titulosTipos`, `pasos` {pdf, hojas, tapa, titulo}, `familias` → hojas de `materiales/`, `grupos`, `hojasMat`, `laminas` {tipo, paso, mat, parcial}), `tipos/<hoja>_3d/_plano/_hoja.webp`, `pasos/<guia>.pdf`, `_p<N>.webp`, `_tapa.webp` | La arma `herramientas/armar_guias.py`. No va en Firestore. La app la pide recién al abrir cada cosa (con el cargador, desde `__cargador.url`). |
| PDF en el aparato | html2canvas 1.4.1 inlined como `<script type="text/plain" data-lib="html2canvas">` + escritor PDF propio | Se activa al armar el primer PDF. |
| **App Android (APK)** | Proyecto **Capacitor 8.6.0** `AlumbradoApp` (appId `ar.com.emaservicios.alumbrado`, «EMA Alumbrado», versionCode 5 / versionName 1.4 (09/11/2026; la 1.3 era versionCode 4), con `android.useLegacyBridge: true`; el proyecto está en `android/AlumbradoApp.zip` **sin** `google-services.json` (Ángel lo tiene en su carpeta), llamadas JS de cada plugin en `NOTAS_JS.md` dentro del zip) | Plugins: `@capacitor-community/background-geolocation` 1.3.1 (ubicación con el celular bloqueado), `keep-awake` 8.0.1 y, desde la 1.3: `@capacitor/filesystem` 8.1.5 + `@capacitor/share` 8.0.3 (bajar y compartir: en el WebView un «download» con blob no hace nada y no hay Web Share), `@capacitor-community/file-opener` 8.0.1 (abrir el PDF), `@capgo/capacitor-printer` 8.1.8 (imprimir), `@capacitor/camera` 8.2.6 + `@capacitor/app` 8.1.2 (fotos que se recuperan), `@capacitor/push-notifications` 8.1.3 (FCM; necesita `android/app/google-services.json`) y `@capacitor-mlkit/barcode-scanning` 8.2.1 (lector QR). **Desde la 1.4:** `@capgo/capacitor-speech-recognition` 8.4.6 (`SpeechRecognition`: 🎤 del Asistente, es-AR, permiso `RECORD_AUDIO`; el `@capacitor-community/speech-recognition` no tiene versión para Capacitor 8), `@capacitor-community/text-to-speech` 8.0.2 (`TextToSpeech`: el Asistente habla; `speak` se resuelve al terminar), `@capacitor/device` 8.0.3 + `@capacitor/network` 8.0.1 (modelo, Android, batería, wifi/datos), `@capacitor/local-notifications` 8.3.1 (recordatorios; ícono `ic_stat_ema`) + `@capawesome/capacitor-badge` 8.0.4 (número en el ícono; en Motorola/Pixel no hay número) y `@capgo/capacitor-native-biometric` 8.9.1 (`NativeBiometric`: bloqueo con huella/cara/PIN, permiso `USE_BIOMETRIC`, sin guardar contraseñas). Se instala pasando el APK, sin tienda. Ver §3.1. |
| PC de la oficina | La misma web instalada como PWA de Chrome | No usan el APK. |

### 3.1 APK de Android con «cargador local» (desde v084)
- **No usa `server.url`.** El proxy de Capacitor bajaba los 4 MB cada vez, sin caché: era lento y en el Moto quedaba pantalla negra.
- `www/index.html` es un **cargador**:
  - **Primera vez:** baja la app de GitHub Pages mostrando el avance. Fuentes en orden: Pages → `CapacitorHttp` nativo → raw.githubusercontent. La guarda en Cache API (`ema-app-v1`, clave `/__app/index.html`) y la abre con `document.open/write/close`.
  - **Siguientes veces:** abre la copia al instante, aun sin señal.
  - Reescribe las URLs de Firebase compat y Leaflet a `lib/…` (vienen dentro del APK).
  - Si una copia no arrancó 2 veces seguidas (`ema.cargador.intentos`), la descarta.
  - Sin señal la primera vez: mensaje + «Reintentar». Nunca negro.
- La app ve el cargador en `window.__cargador = {url, nativo, version(), listo(), guardar(html), actualizar(), borrar}`. Con el cargador:
  - **no se registra sw.js**;
  - la revisión de versión pide `__cargador.url + "index.html"` y, si hay nueva, `__cargador.guardar(tx)`;
  - «Actualizar» llama a `__cargador.actualizar()`;
  - se oculta el bloque de Web Push (no anda en el WebView);
  - al arrancar bien, `__cargador.listo()`.
- **Ubicación en segundo plano (v087 / APK 1.2):** a los ~5 min en segundo plano Android frena lo que sale del WebView y, sin `android.useLegacyBridge: true`, deja de pasarle las ubicaciones al JS (lo dice el README del plugin). Por eso la ubicación va por CapacitorHttp y el APK lleva esa opción. Además: batería «Sin restricciones» en cada celular.
- `MainActivity.java`: «atrás» en la primera pantalla hace `moveTaskToBack(true)` (no cierra), así al volver aparece al instante.
- **Compilar:** no se puede en la nube (maven bloqueado). Ángel corre `COMPILAR.bat` en su PC:
  - baja un JDK 21 portable a `jdk21\`, porque Android Studio trae Java 25 y Gradle falla con «class file major version 69»;
  - corre `gradlew assembleDebug` y deja `EMA-Alumbrado.apk`.
- **Cuándo hace falta APK nuevo:** solo si cambian cosas nativas:
  - ícono, nombre o splash;
  - permisos nuevos;
  - plugins o funciones nativas (ej. push FCM);
  - el cargador mismo;
  - la URL de la app.
- **Todo lo demás** (pantallas, textos, carteles, lógica, incluso el texto de la notificación de ubicación, que se pasa en `addWatcher` desde el index) se actualiza subiendo `index.html`: la app avisa «Hay una versión nueva».

---

## 4. Código fuente y cómo se arma una versión

- **Archivo único** HTML con ~100 `<script>` y ~80 `<style>` en línea. Todo JS «vanilla», sin framework ni bundler. Funciones globales (`window.*`) y módulos IIFE.
- **ORIGINAL** = legible (con sangría). **index.html** = `node compactar80.js ORIGINAL index.html`:
  - esbuild minifica cada `<script>`/`<style>` de primer nivel, con target **chrome80** (celulares viejos);
  - no toca `<script src>` ni `type="text/plain"`.
  - Ajustá en `compactar80.js` la ruta de `require('esbuild')` a tu entorno (`npm i esbuild`).
- **Sello de versión** en `#appVersion`:
  - formato `· v AAAA-MM-DD HH:MM · hash6<`;
  - hora de Argentina (UTC−3); hash6 = primeros 6 del SHA-256 del ORIGINAL.
  - El menú lo muestra como «Versión …».
  - **Desde v088 la revisión de versión lee primero `<meta name="ema-version" content="AAAA-MM-DD HH:MM · hash6">` (arriba de todo, pide solo 16 KB). Al sellar una versión, actualizá los DOS con el mismo valor:** si no, a nadie le aparece «Hay una versión nueva».
- **Dónde va lo nuevo:**
  - los módulos nuevos se insertan **antes de `<script id="revisarAppDiag">`** (último script);
  - CSS en `<style id="xxxCss">` y JS en `<script id="xxx">`.
- **Método de SALEM** (recomendado si querés mantener compatibilidad):
  - un `patch_vNNN.py` que verifica el SHA-256 del ORIGINAL de entrada;
  - aplica reemplazos exactos `R(a, b, n=1)` que tienen que aparecer exactamente n veces (si no, corta);
  - inserta módulos y genera el ORIGINAL nuevo.
  - Hoy los parches son **acumulativos desde el ORIGINAL 082** (`BASE_SHA` = `b35d215e3cd2e46423aecd1d234062cd622247b4c3b9a1ee25a5b581d781d8ce`): `patch_v085.py` = 083 + 084 + 085.
  - Vos podés editar el ORIGINAL 085 directamente. Lo importante es entregar el ORIGINAL nuevo.
- **Cada versión en su carpeta nueva.** Nombres de entrega:
  - `NNN_AAAA-MM-DD_app-EMA_ORIGINAL.html` (respaldo, **no se sube**);
  - `index.html` (va a GitHub).
- **Compatibilidad Chrome 80+:**
  - nada de `:has()` en JS (`closest(':has')` tiraba error < 105);
  - nada de `inset:` sin fallback;
  - `||=` y `??=` los baja esbuild;
  - revisá APIs nuevas.

---

## 5. Mapa de la app (pantallas)

La navegación es **solo por el menú lateral** (botón de tres rayitas `#btnMenu` → `#menuLateral .menu-panel`, `abrirMenuLateral()` / `cerrarMenuLateral()`). Cambio de hoja: `mostrarVista(clave)`.

| Clave `mostrarVista` | Contenedor | Qué es |
|---|---|---|
| `inicio` | `#viewInicio` | Inicio. **v135:** admin/oficina → «Ejecutivo» `#iniEje` (portada azul con logo blanco; v136: las tarjetas empiezan debajo de la portada y `#ieReloj` tapa el reloj del celu, saludo, anillo del contrato, órdenes de hoy / personas en obra / para cerrar, buscador, Asistente; «Para atender», **«🩺 Supervisor»** (v136), «En obra ahora», «Órdenes de hoy», accesos, obras); pañol → `#iniPan` (pedidos para aprobar, para preparar, sin stock, herramientas afuera, stock bajo, accesos). El inicio viejo sigue en el DOM, escondido (`#viewInicio.ie-on`); «solo mirar» lo sigue viendo. Para la cuadrilla: `#inicioCuadrilla` (body `inicio-crew`): tus tareas, material para retirar, avisos, puntos, cálculos rápidos, accesos. **v142:** la cuadrilla y el operario ven `#cdApp` (módulo `cuadrillaDia`, `#inicioCuadrilla` queda escondido): Inicio «Hoy» (portada azul, `body.cd-portada` esconde el header) y las pantallas del día adentro del mismo Inicio (`__cuadrillaDia.ir(p)`: `orden`, `seg`, `salir`, `llegar`, `obra` = Modo obra, `fin`, `puntos`, `llamar`, `senal`); «Hoy» de la barra de abajo lleva acá; Mis tareas clásica sigue en «Ver lista completa». |
| `tablero` | `#viewTablero` | «Mi tablero» (por persona). |
| `mistareas` | `#viewMisTareas` (`#mtApp`) | Mis tareas de la cuadrilla: pestañas 🟢 Hoy · ⏳ Pendientes · ✅ Terminadas, lista «Tarea 1, 2…», orden abierta con fotos/medidas/marcas, «Enviar», 📍 Cómo llegar, ⭐ Tus puntos (`#mpCard`). |
| `calc` | `#viewCalculadora` | Cálculo de materiales: selector 🌳 Plaza / 🏘 Barrio; subíndices 🧮 Calculadora · 🗂 Historial · 📦 Material por obra; «Cálculos rápidos» (hormigón, zanja, cables, consumo, abrazaderas, caída de tensión). |
| `registro` | `#viewRegistro` | Registrar obra (`avanceObras`): nombre (único), ID, barrio, dirección, tipo plaza/barrio/otra, ubicación en el mapa, fecha de carpeta EPEC. |
| `obras` | `#viewObras` (`#obrasApp`) | Obras (legajos): plazas/barrios/otras; legajo con secciones plegables (fotos, planos, columnas, órdenes, material, gastos, historial). |
| `parte` | `#viewParteDiario` | Órdenes de trabajo (OT-AAAA-NNN): tablero, llenar, historial, buscar; cierre por la oficina. |
| `plan` | `#viewPlanificacion` | Planificación semanal (`planSemanal`); «Hacer la orden de trabajo». |
| `avance` | `#viewAvance` | Avance de obra: desde v100 solo la obra y su avance ítem por ítem (rubros con %, colores, columnas a la vista, metros, total, agregar/sacar ítems); las etapas se tildan solas pero ya no se muestran (la inspección se tilda en «Datos para el informe»); sin valorización, sin balance de material (pasó al legajo) ni fotos (están en el legajo); los materiales del cómputo quedan plegados abajo. Itemizado 2026 (Todas/Plazas/Barrios/Otras). |
| `mapa` | `#viewMapa` | Mapa de plazas/obras (Leaflet): pines por avance, pliego, ＋ Punto, capas, panel del legajo (`#mpPanel`), **personal en vivo** (`.uv-pin`, `#uvPanel`). |
| `stock` | `#viewStock` | Pañol: Catálogo pañol (inventario), Reservas (+ «✕ Sin stock», «⏳ Por aprobar»), Herramientas (🧰 / 📜 Historial), Movimientos/entregas, Registrar movimiento, Alta de productos, Precios, Por persona, Fotos, Por sector, Calculadora ↔ pañol, Lista de compras, Acceso y respaldo. |
| `informe` | `#viewInforme` | Centro de informes (PDF/Word/Excel): avance, Gantt, informe mensual con fotos, lista de materiales a usar, etc. |
| `gastos` | `#viewGastos` | Gastos de obra: 🏗 Por obra · 📈 Ganancia · ⛽ Combustible · 🏷 Precios · 🏢 Generales y por mes. |
| `produccion` | `#viewProduccion` | Producción: puntos por persona, baremo («Cuánto vale cada tarea»), 📅 Por quincena, 📊 Total, Personal del equipo + vehículos, 🔄 Reiniciar puntos (admin). |
| `normas` | `#viewNormas` | Normas y tipos constructivos (48 planos tipo). |
| `guias` | `#viewGuias` | Guías «cómo se hace»: Procesos, Materiales (fichas técnicas), 🗂 Láminas (23, SVG gzip+base64, diferidas). **v136:** usa la carpeta `guias/` (Procesos = paso a paso nuevo con hojas, visor y «📄 PDF»; Materiales = hojas de `materiales/` por familia + «Más hojas de materiales»; Tipos = hoja nueva 3D/plano/hoja; Láminas = las nuevas si están en el índice, las parciales ofrecen la de antes); lo de antes queda plegado. |
| `usuarios` | `#viewUsuarios` | Usuarios y permisos (solo admin): roles, ajustes por hoja, persona/nómina, presencia (punto verde/rojo), «🔧 Arreglar vínculos», **📍 Ubicación en vivo del personal** (`#uvAdmin`). |
| `perfil` | `#viewPerfil` (v135) | Perfil: iniciales, nombre, rol, usuario; puntos de la quincena · órdenes que seguís (cuadrilla: tareas de hoy) · avisos sin leer; ajustes (huella, el asistente lee en voz alta, avisos al celular, recordatorios); versión/actualizar, este celular, cambiar contraseña; cerrar sesión. Se abre desde la barra de abajo o el menú (`#menuPerfil`). |
| — | `#emaCam`, `#ecElegir` | Cámara propia de la app (marca en vivo) y hoja «¿De qué obra?». Menú «📷 Cámara» debajo de Mi tablero. `?camara=1` abre directo. |

---

## 6. Roles y permisos

Los roles están en `window.PERMISOS` (script `usuariosPermisos`) y en las reglas de Firestore (`permisosDeRol`). Cada hoja está en uno de tres niveles: `oculto` | `ver` | `editar`. Los **ajustes por usuario** (`usuarios.ajustes.<hoja>`) mandan sobre el rol.

| Hoja (clave de permiso) | admin / oficina | panol | cuadrilla / operario | mirar (o desconocido) |
|---|---|---|---|---|
| inicio | editar | ver | ver | ver |
| registro | editar | ver | oculto | ver |
| calc | editar | oculto | ver (solo «Cálculos rápidos») | ver |
| parte (órdenes) | editar | oculto | oculto | ver |
| plan | editar | oculto | ver | ver |
| avance | editar | ver | oculto | ver |
| mapa | editar | ver | ver | ver |
| stock (pañol) | editar | editar | ver (solo «Catálogo pañol») | ver |
| informe | editar | oculto | oculto | ver |
| gastos | editar | oculto | oculto | oculto |
| produccion | editar | oculto | oculto | oculto |
| normas | editar | ver | ver | ver |

- La cuadrilla **marca SUS tareas** desde Mis tareas. La base la deja tocar solo `campo` y `estado` (Emitida/En curso) de las órdenes donde figura: su `personaClave` tiene que estar en `ot.personalNombres`. También sube fotos de esas órdenes.
- **Arranque por rol (v078):**
  - la portada publica la ficha (`window.__usuarioDoc`) y el aparato la recuerda (`localStorage ema.perfil.<uid>`);
  - permisos la «siembra» al instante;
  - con rol desconocido, velo «Preparando tu pantalla…» (todo oculto salvo inicio/tablero/mistareas, tope 9 s);
  - el evento `permisos-listos` acomoda todo.
  - La cuadrilla nunca debe ver ni un instante lo de la oficina.
- Usuario nuevo: se crea solo como `rol:'mirar'`, `pendiente:true`. El admin lo confirma.
- Para que a alguien le lleguen órdenes: usuario activo y confirmado, rol cuadrilla/operario, «Persona» vinculada a su nombre de la nómina (`persona`, `personaClave` = nombre normalizado) y ese nombre en la orden.

---

## 7. Datos (Firestore)

### 7.1 Colecciones

| Colección | Qué guarda | Campos importantes |
|---|---|---|
| `usuarios/{uid}` | Ficha de cada usuario | `email, usuario, nombre, rol, pendiente, activo, ajustes{hoja:nivel}, persona, personaClave, creado` |
| `presencia/{uid}` | Latido «estoy en la app» (cada 2 min) | lo lee solo admin · v134: `disp {modelo, android, apk, versionApp, bateria, carga, red}` |
| `avanceObras/{id}` | **Registro único de cada obra** (plaza/barrio/otra) | `nombre/plazaNombre, obraId, barrio, direccion, tipo, lat, lng, mapaIcono, mapaColor, carpetaEpec, secciones, grupos, valorItems[] (ítem, cant, K, hechas…), etapas, etapasAuto, etapasNoAuto, puntos[] (nombres de columnas «T1 · C1 · Col 1»), fotosBorradas, planGantt, situación/fechas` |
| `historialCalculos` | Cómputos de la calculadora | `form` (datos del formulario, para editar), listado por secciones, `modo` plaza/barrio, obra |
| `historialEtapas` | Historial de etapas tildadas | |
| `ordenesTrabajo/{id}` | Órdenes de trabajo `OT-AAAA-NNN` | `plazaId, plazaNombre, fecha, hora, cuadrilla, responsable, personal[], personalNombres[] (claves normalizadas, para las reglas), tareas/actividades, asignada{tarea:persona}, reparto{tarea:[{nombre,cant}]}, equipoTarea{tarea:[nombres]} (v094: la hacen juntos), equipos{tarea:[{nombres,cant}]} (v097: varios equipos), excedentes, vehiculos[{id,nombre,patente}], vehiculoId, estado (Emitida · En curso · Terminada · Anulada), campo{marcas, marcasP, fotos{<id>:{…, mini (72px), borrada}}, medidas, envios, … · v142 (cuadrilla nueva, todo por `__mtAPI.guardar`): seguridad.<persona> {items{casco, arnes, guantes, botines, conos, equipo}, fotos{item: adjId}, fotosTs, ts, ok, motivo, por} (junto a lo de antes: seguridad.epp/baliza/herram/corte), salida.<persona> {ts, ok, motivo, faltaMat[], llevo[], faltaHerr[]}, llegada.<persona> {ts, lat, lng, acc, dist, enObra}, pasosObra.<tarea>.<unidad> {num, ini, fin, estado si/no, motivo, por, ts} (la hora de cada columna), faltaMaterial.<id> {items[{codigo, desc, cant, un}], otra, tarea, por, ts, avisados}}, cierre{hecho, hechoPersona, horas, puntos (fijados al cerrar), …}, creadoPor` |
| `planSemanal` | Plan de la semana | |
| `movimientos` | Movimientos del pañol | entradas `E-0001…` (remito, proveedor, precioUnit en $ sin IVA + `precioOriginal, moneda, ivaPct, cotizacion`), salidas/vales `S-0001…` (`valeGrupo`, obra, quién), devoluciones (`devolGrupo`); `numero` guardado desde v102 (los viejos sin `numero` se numeran como antes); **se anulan, no se borran**; cambio de fecha con `fechaAnterior`, `fechaHist` · v137: las entradas del remito por foto llevan `porAsistente:true`, `remitoIa {desc, cant, un, grado}` (lo que leyó la IA) y `fotoId` (adjunto `tipo:"remito"`) |
| `catalogoProductos/{codigo}` | Cambios sobre el catálogo base (productos fijos del Excel + altas del equipo) | `codigo, desc, un, costo, (v138: costoFecha, costoFuente, costoTs del «Solo precios»), minimo, activo (false = de baja), porUnidad {m: 100} (v102: cuánto trae cada Un., p. ej. 100 m por rollo), editadoPor, editadoTs` · v137: `ean: ["7790…"]` (códigos de barras del producto; un EAN no puede quedar en dos códigos, lo asocia quien edita el pañol por `fbGuardarProductoCatalogo`, con `editadoPor`/`editadoTs`) |
| `reservas` | Reservas de material `R-0001…` | `estado`: `solicitada` (por aprobar, no aparta) · `pendiente` · `alistando` · `lista` · `entregada` (con/sin faltantes) · `rechazada` · `anulada`; `items[]` con `cant, entregado, nohay, cambio{…estado pendiente/aceptado/rechazado/retirado}, cambiadoDe, sinStock{descartado}`; `creadoPor, paraQuien, desdeCalculo, aprobadaPor, historial[]` |
| `herramientas` / `herramientasMov` | Herramientas H-001… (libre/asignada/reparación/baja), ingreso con remito; movimientos (entrega, devolución, remito con foto, alta…) | |
| `adjuntos` | Fichas de fotos/archivos (v138: también `tipo:"remitoRes"` = resumen de un remito cargado con la IA, sin imagen) | `r2: "fotos/AAAA/MM/<obra>/<id>.jpg"` si está en la nube (sin imagen); si no, la imagen; `otId` |
| `fotosObra` | Fichas livianas de fotos de obra con miniatura (140 px) | `plazaId, categoria, num (nombre «Col 4»), otId, lat, lng, gpsPrec, sello, por, ts` · v133: `movidaDe {plazaId, plazaNombre, ts, por, motivo}` cuando el asistente la cambia de obra; `plazaId: "__sinObra"` = «Fotos sin obra» · v144: `obraAuto` (la eligió el GPS), `obraElegida` + `obraElegidaNombre` (lo que tenía elegido: la obra de su orden o la elegida a mano), `distObra` (m del GPS al pin), `motivoOtra` (si eligió otra obra a mano), `ubicDudosa` (GPS sin dato o ± más de 100 m), `ubicOk {por, ts}` («Está bien» del Supervisor). Los mismos campos van en `adjuntos` |
| `planosObra` / `planosImg` / `planosNotas` | Planos de obra (ficha, imagen en pedazos, notas/dibujo) | |
| `mapaPuntos` | Puntos agregados al mapa (16 íconos, foto) | |
| `gastosObra` | Gastos por obra y generales | `plazaId` vacío + `general:true` para generales; combustible `vehiculoId, litros, km, reparto:"auto"` |
| `cierresQuincena/{AAAA-MM-1\|2}` | Foto fija de la quincena cerrada | personas, puntos, valor del punto, ajustes saldados, historial |
| `tableros` | «Mi tablero» | |
| `auditoria` | Registro de lo hecho (solo create) | |
| `pushSubs/{sha256(endpoint)}` | Celulares anotados para push | `uid, clave, email…` |
| `avisosPush` | Avisos para el Worker | `enviado:false`, destinatario (`clave`/`email`/`uid`), tipo, tag · v143: recordatorio `tipo:"recordatorio"`, `enviarDesde` (ms, 07:00 de Argentina del día de la orden), `otId`, `fecha`, `tag:"ema-rec-<otId>-<clave>"` (la app lo deja solo si el Worker dice `v143` o más en `/salud`); el Worker lo pasa a `enviado:"programado"` |
| `ubicacionVivo/{uid}` | **Ubicación en vivo** (un doc por persona, se pisa) | `uid, email, persona, clave, lat, lng, acc (m), vel (km/h), ts, posTs, fuente (web/app), activo, hasta, finTs, finMotivo` + v091: `fondo` (salió con el celu bloqueado), `fondoTs`, `via` (android/navegador/app por Firebase). El Mapa muestra el porqué de «sin actualizar». v092: `enviosFondo, cortesHoy, ultCorteDesde, ultCorteHasta, ultCorteTipo` («se cortó» / «no mandó» / «app cerrada»), `pruebaTs, pruebaOk, pruebaEnvios`. El celular lleva la cuenta del día en `localStorage ema.uv.diag` |
| `proyectos/{id}` | **Proyectista** (v089): relevamientos | `nombre, obraId, obraNombre, faja, etapa, por, creado, ts, lums[] {id, nombre, W, lm, cos, fot{formato, i[73][73] cd/klm}, archivo} (v092), circ{"tab|n": {mat, sec, tipo 3F/1F, fase}} (v092), calc{vll, cond, lim, temp, reserva, subida, subLum, x, minIn, fm, clase, emReq, eminReq, umbral, brazo, alt{}} (v092), puntos[] {id, n, tipo (colN/colE/tab/aco/cam/cru/otro/borde), lat, lng, acc, fuente (gps/mapa), corte, nota, ts, por, via[] {la, lo} (v099: quiebres del tramo desde el punto anterior), movido (v099), el{tab, circ, de, col P7/P10/M7/M10/EX, art, lum, fase auto/R/S/T, m, mira} (v092)}`. Solo admin/oficina |
| `secretosServidor` | Clave privada VAPID | **sin regla: nadie la lee desde la app** |

**`configEquipo/<doc>`:**
- `alias` (usuario corto → correo; lectura pública);
- `presencia`, `salud` (v145: `salud.sinTarea.<AAAA-MM-DD>` = el recordatorio de gente sin tarea de ese día ya salió; v146: `salud.pasarManana.<AAAA-MM-DD>.<dia|ot_id> {ts, por, tk, hecho[], deshecho}` = el turno y lo que pasó a mañana);
- `baremo` (puntos por tarea, pesos por rol; **v143: `sugerida`** = ajustes de la orden sugerida: `jornada` 8, `sabado`/`sabIni`/`sabFin` (7:30–13:00), `ini`, `fraguado` 72, `hora` 16:00, `inicio`, `galpon`, `avisoEmitir`, `recordatorio`, `reglas{fraguado, pozoHorm, zanjaCable, izajeCadena, mismaGente, patTablerito, vehiculos}`, `izaje.modo` auto/todo/civil/cano/guia, `angel{zanjeo.porDia 100, bases 5, izTodo{2,4,tope 5}, izCivil{3,13}, izCano2{2,6}, izCano3{3,12}, izGuia{2,3 a confirmar}, tab2{3, tope 4}, tab1{2}}` (datos de Ángel 10/11/2026), `rend{tarea: {modo auto/dicc/medido/mano, mano (por día con 2), motivo, porAsistente}}`, `por`, `ts`; lo escribe quien edita Producción (Administración y Oficina) con «Guardar»: sin reglas nuevas); · **v145:** `sugerida.minObra` (2, mínimo en obra según Ángel), `sugerida.reglas.minDos` / `reglas.vinculoSinGrua`, `sugerida.sinTareaAviso` / `sinTareaHora` (17:00); **v146:** `sugerida.pasarModo` (auto/preguntar/no) y `pasarHora` (18:00); `aprendeMaterial {margen (10 %, a confirmar), sugerencias[] (lo anotado para Ángel por el asistente, con «Sí»)}`
- `personal` (nómina + `vehiculos[]`; v142: `contactos[{nombre, rol admin/oficina/panol, tel, email}]` para «Llamar a la oficina», `seguridadCuadrilla{item: no/opc/oblig}` (foto de cada ítem de la seguridad; de entrada solo conos y equipo obligatoria), `herrPorTarea{tareaId: [herramientas]}` (a confirmar; si no hay, la tabla `HERR_DEF` del código), los edita Producción › Personal del equipo › «👷 La cuadrilla en obra»; **v143:** `ausencias[{id, persona, motivo franco/vacaciones/licencia/enfermo/otro, desde, hasta, nota, por, ts}]`, marca `equipoCivil:true` en el ítem de la nómina (`nomina[]`, se guarda por `fbPersonalGuardar({nomina})` como siempre) y `vehiculos[].tipo` (grua/hidro/barquilla/transporte/auto) + `lugares` (`__vehiculos.guardar` ya no los pierde), todo desde Producción › Personal del equipo › «📋 Para la orden sugerida»); · **v145:** `equiposHab[{nombres[], aVeces[], vehiculoId, tareas, grua}]` (👥 Equipos habituales; los guarda Producción/Órdenes con «Guardar»); · **v146:** `tableroDueno.habilitados[uid]` (quién más ve el tablero del dueño; lo cambia Administración con «Sí»)
- `cuadrillas`, `guias`;
- `precios` (incluye `gastosRef`; v144: `zonaContrato` «A»/«B»/«C», de entrada A = Renglón 1 · Zona A (Este), la cambia solo Administración en el Itemizado); · **v145:** `certCerrados.<AAAA-MM> {ts, por, modulo, kMes, kProv, sinIva, obras, zona}` (marca del certificado cerrado; la foto fija por obra va en `avanceObras/{id}.certificados.<AAAA-MM> {ts, por, it{ítem: {m, a, k}}}`)
- `vapid` (pública);
- `reinicios` (`saldoDesde` def. 2026-10-29, `saldoObras`, `puntosDesde`, `puntosSinObras[]`, `puntosSinDias[]`);
- `ubicacion` (`activo, desde, hasta, dias[0-6], cadaSeg`; por defecto 07:00–15:00 L–V, 60 s).

### 7.2 Reglas (Reglas_Firestore_v128 = v125 + `marcaCampo` mira el estado de antes (la cuadrilla no reabre una anulada/terminada); v125 = v089 + `fotoLibre` (fotos de la cuadrilla sin orden); v089 = v083 + `proyectos`; Ángel tiene que publicarlas)
- Están en `firebase/`. Se publican pegándolas en Firebase › Firestore › Reglas. Ángel lo hace a mano.
- **Lección clave (v070):** Firestore corta en **10 lecturas de documentos / 1.000 expresiones por pedido** y responde «permission-denied» aunque la persona tenga permiso.
  - Leé el usuario **una sola vez** por regla (`let d = yo()`).
  - Armá solo el mapa del rol de la persona (`permisosDeRol(rol)` con ternarios).
  - No repitas `get()`.
- Funciones: `confirmado()`, `esAdmin()`, `adminUOficina()`, `edita([hojas])`, `lee([hojas])`, `equipo()`, `renombraObra()`, `soyDeLaOrden(ot)`, `marcaCampo()`, `fotoDeMiOrden()`, `fotoLibre()` (v125).
- Si un cambio necesita colección o permiso nuevo: **entregá las reglas nuevas completas** (archivo `Reglas_Firestore_vNNN.txt`) y decile a Ángel que las publique. La app tiene que avisar «falta publicar las reglas» si no están.

### 7.3 Límites de Firestore que ya mordieron
- **1 MB por documento:** las órdenes llenas de miniaturas trababan todo. Por eso miniatura de 72 px en la orden, nada si pesa más de 760 KB, y «🧹 Liberar espacio».
- **Tormentas de reintentos** con permission-denied: cada intento negado cuenta como lectura. Esperar 60 s a 5 min.

---

## 8. Módulos (script id → qué hace → API global)

Los más usados (la lista completa sale con `grep -o '<script id="[^"]*"'`):

| script id | Versión | Qué hace / API |
|---|---|---|
| `usuariosPermisos` | base/078 | `PERMISOS` (`yo()`, `lista()`, `listo()`, `sembrado()`, `liberar()`, `ROLES`), `permiso(hoja)`, evento `permisos-listos` |
| `ordenesCampo` | base | Mis tareas (cuadrilla): `mt()`, cola `mtCampoGuardar` (sin señal), `window.__campoCola`. **Se redibuja comparando nodo por nodo: no insertes nada por afuera del DOM, va en las plantillas.** |
| `moduloReservas` | base | Reservas (`z()` arma la lista; chips `[data-rsf]`) |
| `obrasLegajo` | base | Legajos (`abrirLegajo(id)`, `legajoPoner`, `legajoTipoFiltro`) |
| `calcBarrio`, `calcRevision`, `calcObraRegistrada`, `calcEditar`, `calcLimpiar`, `computoTabs`, `calcPanol` | 012–058 | Calculadora (`calcular`, `epecPreviaDe(obra)` vista previa del itemizado, `calcularBalancePlaza`, `__calcEditar`, `__computoTabs`) |
| `avanceItems`, `avanceTipos`, `itemizadoTipos`, `itzCeros`, `saldoObra` | 039–072 | Avance por itemizado (`calcularAvanceEtapasPct`), Itemizado 2026, «Quedan N de T» (`saldoObra(plazaId)`, `totalesDeObra`) · v098: lo hecho de cada tarea = lo mayor entre las órdenes cerradas y el Avance de obra (ítems de la tarea en `metaDeTarea`; no se suman porque el cierre ya avanza el itemizado), `__avanceDeObra(id)` |
| `puntosPro`, `quincenas`, `reparto` | 041–079 | Puntos (`puntosDeOrden(ot)` = `ye`; `nombreCanonico`), quincenas (`renderQuincenas`), reparto entre varios (`__reparto`) |
| `misTareasPro`, `equipo`, `cuadrillaFotos`, `fotosPermiso`, `cuadrillaApp` | 049–080 | Pestañas Hoy/Pendientes/Terminadas (`__mtVista`), fotos compartidas hasta 4, ✓ de quién envió, diagnóstico de permisos (`__diagOrden`), Inicio crew (`__cuadrilla.esCrew()`) |
| `camaraApp`, `camaraPro`, `selloFotos`, `compartirFotos`, `fotosNube`, `fotosSinSenal`, `galeriaPro`, `fotosGestion` | 030–073 | Cámara con marca en vivo (`camaraApp`), sello (logo, obra · qué, fecha, GPS, quién; 1024 px), subida a R2, cola IndexedDB `ema-fotos-cola`, visor/galería (`emaGaleria`, `verAdjunto`), ZIP con EXIF GPS |
| `mapaPro`, `mapaLegajo`, `mapaPanel` | 040–062 | Pines por avance, ＋ Punto, capas, panel del legajo |
| `avisosApp`, `pushAvisos`, `avisosVistos` | 031–051 | Campanita (`__emaAvisos`), push (`__pushAvisos.dejarAviso`), tonito (`__emaSonido`) |
| `herramientasPanol`, `herrRemito`, `herrPost`, `herrIngreso`, `agrupar` | 010–081 | Herramientas, remitos RH-…, ingreso RI-…, agrupar iguales (`__hrGrupos`), buscador por palabras (`__buscaPalabras`) |
| `sinStock`, `reservasFaltantes`, `reservaCambio`, `reservasImprimir` | 038–061 | Reservas con faltantes, «⇄ Ofrecer otro», imprimir |
| `gastosPro`, `vehiculos` | 042–043 | Ganancia, combustible, precios, generales (`GASTOS`, `__gastosPro`, `__vehiculos`) |
| `sinSenal` | 065 | App sin internet: parchea set/update/add/commit, franja `#offAviso` |
| `rendimiento` | 075 | Láminas diferidas (`__cargarDiferidos`), aviso «Sitio para computadoras» |
| `hojaPdf` | 077 | Toda impresión → hoja A4 `#hojaOv` con Imprimir / Compartir PDF / Bajar PDF (`hojaEMA`); atrapa `window.open("")` y `window.print()` |
| `arranqueRol` | 078 | Arranque por rol sin destellos |
| `legajoPlegable` | 082 | Secciones del legajo plegables (`ema.lg.pleg`) |
| `ubicacionVivo` | 083–085 | `__ubicacionVivo` {estado, cfg, enHorario, tic, pintarMapa, arrancar, parar}. Cuadrilla en horario: nativo `BackgroundGeolocation.addWatcher` (notificación fija) o web `watchPosition` + Wake Lock; manda cada `cadaSeg` o si se movió más de 40 m; latido 15 s; `tic()` cada 30 s. Punto en `#btnMenu .uv-menu-dot` (ok verde / busca amarillo / mal rojo) + `#uvMenuLinea` en el menú. Oficina: pines `.uv-pin` (on verde / off gris «sin actualizar desde HH:MM») y `#uvPanel` «👷 Personal en vivo N de M». |
| `ubicacionVivo` (v087) | 087 | En la app de Android la ubicación sale por **CapacitorHttp → Firestore REST** (`guardarUbic` → `setNativo`, token por `getIdTokenResult` en pantalla o renovado con `securetoken` + refreshToken en segundo plano); si falla, por el SDK como antes. Fuera de horario corta también desde el callback del GPS. `__ubicacionVivo.estado().nativo` {envios, fallas, ultimoErr}. |
| `cuadrillaLiviana` + bloque `__col` en las suscripciones | 086 | Entrada rápida de la cuadrilla: `__modoDatos` {estado, liviano, cargarTodo, revisar}. Cuadrilla/operario sin permisos de oficina (según `ema.perfil.<uid>` del último usuario, `ema.ultimoUid`) baja solo SUS órdenes (`where personalNombres array-contains personaClave`); cómputos/etapas/plan 1,5 s después, movimientos 6 s después o al abrir otra hoja. Si el rol confirmado ya no es cuadrilla, pasa a completo. |
| `proyectistaMenu` + `proyectistaCod` (text/plain, dormido) | 089 | Proyectista etapa 1. Menú `#menuProyectista` solo admin/oficina; `__abrirProyectista(id)` carga el código y abre `#pyOv`. `__proyectista` {abrir, cerrar, estado, _geo {distancia (Vincenty), gk (Gauss-Krüger POSGAR 07, serie de Krüger), fajaDe}, _dxf, _csv, _calc (v092: red, parseLDT, parseIES, luz, radios, intens, cfgDe), _cat (v095: catastro), _mapa}. v095: catastro de fondo (`gkInv` = Gauss-Krüger inverso) y «🌳 Traer el borde de la plaza». v092: pestañas Columnas / Eléctrico / Luz y memoria de cálculo; el motor de cálculo está entre los comentarios «geodesia» y «estado» y se prueba en Node con `pruebas/num` (control en Python). **El código text/plain no lo transpila compactar80: escribilo compatible con Chrome 80.** Ver `docs/PROYECTISTA.md`. **v099:** puntos como `L.marker` (divIcon `.py-pin`, arrastrable el elegido), cuadro `#pySel` (`htmlSel`/`accionSel`), quiebres `.py-vmas`/`.py-vq`, `largoTramo`/`caminoLL`/`mitadCamino`, recorrido caminando (`st.reco`, Douglas-Peucker), plano interactivo (`st.pv` vista en GK absoluto, `planoEventos`: arrastrar, rueda, dos dedos; `data-pyp/pyt/pyv/pym`), `st.hist` para ↶ Deshacer, el mapa se reusa entre redibujos (no se rearma) y va con `keyboard:false`. |
| `recuperarClave` | 098 | «¿Olvidaste tu contraseña o tu usuario?» en la portada: usuario o correo → `configEquipo/alias` → `sendPasswordResetEmail` (`languageCode="es"`). Sin correo real (`@ema-alumbrado.app`) no manda y deriva a la oficina. `__recuperarClave` {ver, mandar} |
| `avanceItems` (v100) + `avanceProCss` | 100 | El «📋 Avance de la obra, ítem por ítem»: `html(o)` nuevo con rubros (`FAM`: col/tab/zan/cab/pat/otro/prov), niveles de color `p0`–`p4` (gris/rojo/amarillo/azul/verde como los pines del mapa), acciones `data-avi` nuevas `irFam`, `agregar`, `quitar` y el total `.avi-total` |
| `legajoMaterial` | 100 | Sección `#lgBalSec` «🧾 Material: calculado vs. entregado» en el legajo, debajo de «📦 Material entregado» (`calcularBalancePlaza`); tarjetas que filtran, barra por material, sobrante con `confirmarSobrante` (pone `avanceActivoId` y `balanceFilasActivas` de esa obra), planilla e impresión. `__legajoMaterial` |
| `alternativas` | 101 | `__alternativas` {de(codigo, desc, un), rasgos, comparar, filaHtml, aplicar, notas}. Lee del nombre: tipo (la primera palabra que reconoce), conductores × sección, pulgadas, amperes, polos, curva, color, material, normas (IRAM/NM/ET), «Municipalidad», con/sin tuerca. 🟢 misma medida y la norma no choca · 🟡 otra norma, +1 conductor, sección mayor (≤ 2,6×), otro material de prensacable, sin tuerca, borne sin color. Nunca menor sección/menos conductores, otro amperaje/polos/curva, Al por Cu, otro color. Los cables se buscan en todas las familias (el 6001 3×1,5 está en la 6). Engancha en `calcObraBalanceHtml` (`fila` → `filaHtml`; `window.__corPedidoRef`, `pendientePedido.base`) y en `calcPanol.revisar` (cands). La equivalencia de unidad (m por rollo) queda en `localStorage ema.alt.factor`. **No une ni cambia códigos.** |
| `obraComputo` | 102 | `__obraComputo` {difiere, pasar}: «🔄 Pasar este cálculo a la obra» cuando la obra registrada tiene el material de un cálculo anterior (pregunta, conserva `cantInstalada`) |
| `colasYNumeros` | 102 | `fbOtCampo` escribe directo (sin colgarse sin señal, con dedupe); `fbAddMovimiento` guarda el `numero` del comprobante (por valeGrupo/devolGrupo); `numeroComprobante` usa el guardado (repetidos viejos → «-B»). `window.__colaDirecta`, `__sinSenalDirecto` |
| `panolArreglos` | 102 | `__nU`, `__factorUn`, `__pedirFactor` (guarda `porUnidad` en `catalogoProductos`), `__sustitutos` (lo cambiado por otro material), `__apartadoObra`; anular ofrece la pareja; `fbDeleteMovimiento` no borra |
| `ordenesArreglos` | 102 | Anular/borrar una orden cerrada ofrece revertir el avance (`cierre.avanceItems`, `cierre.avanceRevertido`); cierre de una anulada pregunta; editar una cerrada avisa |
| `seguimientoTareas` | 104 | Órdenes › «📌 Seguimiento» (`#otSeguimientoPanel`, `__seguimiento` {pintar, filas, quienes}): cada tarea dada con lo hecho y lo que falta, estados, filtros persona/obra/fechas, resumen por persona y obra, «📅 Darla hoy» / «👤 Darla a otro» (usa `repetirOrden` y deja solo esa tarea). Lee `window.__seg` {E, J} de `ordenesCampo`. También `__devolverOt(id)`: «↩ Sigue en obra» (borra `campo.enviados`, guarda `ot.devuelta`, avisa) |
| `cierreIntegrante` | 106 | En el cierre de la orden, «＋ Agregar a alguien que también fue» (`#ciAddSel`): nómina sin los que ya están, suma a `personal` (rol de la nómina, `agregadoAlCerrar`) y `personalNombres`, redibuja el cierre conservando lo cargado. `__cierreIntegrante` |
| `misFotos` | 107 | «📷 Mis fotos (N)» dentro de la plantilla de la orden de Mis tareas (envuelve `__mtComoLlegar`), abre `emaGaleria` con las fotos propias (`campo.fotos` por = la persona, sin borradas); en la cámara «🗑 La última» (`.ec-borrar-ult`, engancha `__camDisparo`/`__camGuardada`, usa `__fotoMia`/`__fotoSacarMia`). `__misFotos` |
| `diccionarioTareas` | 108 | Antes del script del catálogo. `DICC_TAREAS` (47 tareas: id, label, fase, un, hh, f{alt,pes,rie,ofi}, dif, pts, grupos[{items, pct (número u objeto por ítem), porArt, prop, parte (tope compartido: zanja a mano o con máquina)}], noAvanza, etapas), `DICC_VIEJAS`, `DICC_DIF` (grupos para Diferencias), `__diccCompletar` (suma tareas a `ACTIVIDADES_CATALOGO`, completa `TAREA_META` con `grupos`/`noAvanza`, fases «Galpón y logística», «Varios», «Tareas viejas»), `__DICC_SE`/`__DICC_UN` (puntos y unidades por defecto solo de las nuevas). Los porcentajes son **a confirmar** |
| `circuitoObra` | 108 | El cierre (`ve` de la base) reparte por partes: cada tarea llena `cantidad × pct` de su ítem menos lo que ya sumó esa tarea (`__avancePorTarea`, por `cierre.avanceItems[].k`); lo de más queda en «sobran». `__diferenciasObra(obra)` + `__verDiferencias(id)` (Itemizado › botón por plaza): Sí → `CO.aplicarAjuste` + avanza lo hecho; No → `obra.difDescartadas`. «📋 Solo lo de esta obra» (`#otSoloObra`, `.sa-tiene`). Baremo con el valor del diccionario. El avance sin tarea anotada (órdenes de antes de la v108 o cargado a mano) cuenta como completo para todas las partes; «Quedan» (`avanceDeObra`) de una tarea por partes = lo que sumó ella ÷ su parte + ese avance sin dueño. Pruebas viejas: `__avanceEntero` (la tarea completa el ítem) salvo `porPartes:true` (`t_v108`, `t_v108b`) |
| `archivosApp` | 109 | En la app de Android: atrapa todos los «download» blob/data (`a.click()` y clics) → `__archivoNativo.guardar(blob, nombre, compartir)`: Bajar = Filesystem en `DOCUMENTS/EMA/`, Compartir = CACHE + `Share.share({files})`. En la app, «Imprimir» de `hojaPdf` también va por el PDF + Share (el WebView no imprime). Sin los plugins (APK ≤ 1.2) avisa «hace falta la app 1.3» con «Abrir en Chrome». `hojaPdf` lo usa para sus dos botones |
| `fotoSegura` | 109 | Si Mis tareas se redibuja con la cámara abierta, la foto llega a un `input.mt-foto-t` que ya no está en la página: se pasa (DataTransfer) al input equivalente de la misma orden / tarea / fila (`data-fli`, `data-fln`) y se dispara `change`. Engancha en el clic y en `HTMLInputElement.prototype.click` |
| `androidPro` | 110 | APK 1.3: fotos de Mis tareas por `Camera.takePhoto` (intercepta el 📷 y `input.click()`), recuperadas con `App` `appRestoredResult` + `localStorage ema.cam.pend` → `__fotoSegura.equivalente`; avisos FCM (`FCM_LISTO` **true** desde v115; `pushSubs/fcm-<sha>` con `tipo:'fcm'`, campo `fcm` = token); `__escanear()` lector QR; `__androidPro` |
| `compartirHoja` | 110 | «📄 Compartir PDF» de la hoja abre el menú `#hjComp` (WhatsApp · Drive · Mail · Copiar · Guardar · Otra app). Celular: menú del aparato (`Share`/`navigator.share`) con el PDF y texto; PC: baja + copia la 1.ª hoja como imagen (`ClipboardItem`) + botón «Abrir WhatsApp Web/Drive», mail con `mailto`. `__compartirHoja` |
| `cierreGente` | 111 | Cierre: 0 horas = 0 (`cierre.horasPersonaV: 2`; vacío = jornada, `data-def`), tocar puntos → a mano, «Te quedan N puntos para repartir» + «Repartirlos entre los demás», «✕ No fue» (saca de `personal`/`personalNombres`/asignaciones, `ot.quitadosAlCerrar`). `__cierreGente` |
| `envioEquipo` | 112 | Marcas de la cuadrilla combinadas: `__marcaEquipo(ot,k,persona,marca,L)` escribe `campo.marcasPor.<k>.<persona>` y `campo.marcas.<k>` = lo más completo (hecha si alguno, cantidad mayor, notas juntas, `porTodos`); `__hechasOt`. Avisos de envío una vez por orden (después solo si suma hechas) |
| `ordenNueva` | 112 | «Llenar orden» por pasos (`#ofPasos`, `data-paso` en las 4 tarjetas, `ema.of.todo`), resumen `#ofResumen` con puntos por persona si terminan todo, barra `#ofBarra` en el celu, obras recientes (`#ofObrasRec`), gente rápida (`#ofGenteRap`), cartel de pendientes `#ofPend` (`saldoObra`). Pruebas viejas: `__ofCompat` salvo `ofPasos:true`. `__ordenNueva` |
| `vehiculoPersona` | 112 | En qué vehículo va cada uno: `#vpBox` en el paso 2 (con `otVehiculosElegidos()`; de entrada, el que tiene a cargo o el primero), `ot.vehiculoPersona` («Nombre» → {id, nombre, patente}), en el resumen y en el cierre (`.vp-ci`) |
| `tareaNueva` | 112 | Producción › Cuánto vale cada tarea: «¿Cómo se suman los puntos?» y «＋ Crear tarea» (`#tnCard`) → `registrarTareasNuevas([{label, un, pts, pasos, fase, hh, f}])` |
| `cierreDiaUnico` | 113 | Producción › Cierre del día guarda por `guardarCierreOt` (abre el cierre oculto con `body.cd-auto`, pone cantidades, horas, reparto y novedades); pregunta del itemizado en el parte (`.cd-co`); puntos del parte con `__puntosDia` (= `puntosDeOrden`). Pruebas viejas con `__ofCompat`: el camino de antes |
| `unirRepetidos` | 113 | «Por persona / obra» dentro de Seguimiento (`#urBuscar` / `#urVolver`, la pestaña `buscar` oculta), período «Avance del mes (sin fotos)» con aviso al informe con fotos, formulario de vehículos de Gastos oculto (se cargan en Personal) |
| `supervisorOt` | 113 | Responsable de oficina de la orden: `#supSel` en el paso 2, `ot.supervisor` {uid, email, nombre}, aviso `tipo:'supervisor'`, «👔 Órdenes que seguís» (`#supSeguir`) arriba de Mis tareas con «✅ Cerrar» → `abrirCierreOt` |
| `cierreTarea` | 128 | Cierre por tarea: «👥 Puntos de esta tarea» (`#ctPop`, `cierre.puntosTarea.<k>` = {persona: pts}, lo usa `puntosDeOrden`) «📅 Lo que falta, a otro día» (suma a la orden de ese día de la obra o crea una con `vieneDe`; `ot.pasadoA.<k>`) y «🔁 Era otra tarea» (cambia la tarea en la orden, `tareasCambiadas`, reabre el cierre con lo cargado). Gancho `__cierreTareaBtns(ot, tarea)`. `__cierreTarea`, `__ptTarea` |
| `fotoRapida` | 128 | Tiempos de cada foto (`ema.fotos.tiempos`, menú › Versión: `__fotoTiempos()`); `__fotoGpsVivo()` = ubicación del seguimiento en vivo para el sello. Esperas: GPS 1,5 s (3 s sin ninguna), nube 5 s, base 2,5 s (lo lento sigue por la cola) |
| `tareaSinCerrar` | 128 | «Llenar orden»: `.sc-linea` en la tarea que está en una orden de esa obra (hoy o antes) sin cerrar, «Asignar igual» (`data-scigual`, `__saSinCerrarOpt(k)` en el «¿por qué de más?») y «⚡ Cerrar esa tarea» (`abrirCierreOt` con `body.sc-solo`, `#scSolo` «Ver todas»). `__tareaSinCerrar` |
| `unirSeguro` | 128 | Envuelve `fbOtCampo`: lo que va a una orden anulada con `unidaEn` se manda a la buena (sin `estado` si no está Emitida); si la base lo niega, lee la orden del servidor y redirige. `unaObra.unir` escribe las dos órdenes en un `batch` y anota `unidas.<id>` (re-unir no suma `previsto`). `__unirSeguro` |
| `aprobarTarea` | 130 | Mis tareas por tarjetas con ‹ ›, «N de M hechas», «te faltan fotos» con el porqué y galería con quién sacó cada foto (`tareasTarjetas`) |
| 129 | Cierre: «✅ Aprobar esta tarea» (`[data-aprob]`, caja `[data-apbox]`, fila `tr.ap-on`) guarda el cierre solo con las aprobadas (`window.__aprobFiltro` → `__aprobFiltrar(t, d)` en `guardarCierreOt`), no cierra la ventana (envuelve `cerrarCuadroCierre`), deja la orden «En curso» hasta la última; «✅ Aprobar todo y cerrar» (`#apTodo`). `cierre.aprobadas.<k>` {ts, por} (`__aprobLeer`). El cierre arma las horas con `campo.horasTarea`. `__aprobarTarea` |
| `tareasTarjetas` | 130 | Mis tareas: una tarjeta por tarea (`.mt-tarea.mtc-on/.mtc-off`, cabecera `__mtTareaCab` con `[data-mtc]` ‹ › y puntitos `[data-mtcir]`, deslizar), línea «✅ N de M hechas · K te quedan» (`__mtProgHtml`), «⚠ Te faltan N fotos» (`#ffPop`, `__fotosFaltanPop`; enviar igual pide el porqué → `campo.sinFotos.<k>.<persona>`, se ve en el cierre `.ff-cierre`), galería de la foto pedida (`#fgHoja`, tocar `.tm-fila.hecha .tm-tx`). Pruebas viejas: `__mtTarjetasNo` salvo `tarjetas:true`. `__tareasTarjetas` |
| `catalogoArreglos` | 131 | Pañol › Acceso y respaldo › «🔧 Revisar el catálogo» (`#cardCatArreglos`, solo admin/oficina, `.ca-oculto`). Detecta en vivo sobre `catalogo()`: unidades (`UN/u/M/KG…` → Un./m/kg con casilla; «c/a» y raras con desplegable, sin proponer), códigos de la base reutilizados (desc sin ninguna palabra en común con `STOCK_CATALOGO_BASE`; el 7013: vuelve a su desc/un de la base + alta del producto con código nuevo que escribe la persona, sugerido el siguiente libre de la familia 9 en x001–x499, validado), repetidos (misma desc normalizada + unidad, marcados) y «parecen el mismo» (8039→8008, 8042→8005, 8043→8009, sin marcar). Nada se escribe sin confirmar (`#caConf`). Unificar = `activo:false, unidoEn` (no se borra) + el stock pasa con el par de «Corrección de código» (`correccion`, `correccionGrupo`, nota «unificación A→B»); stock negativo → «pasalo a mano». Auditoría `catalogo_unidad`/`catalogo_reutilizado`/`catalogo_unificar`. `enlazarSinCodigoPorNombre` sigue `unidoEn`. `__catalogoArreglos` |
| `materialesFichas` | 131 | Carrusel en la foto de la ficha del material (`#pfFoto[data-cod]`) y de la herramienta (`.hr-foto[data-hrq]`, por palabras del nombre: cada palabra del índice tiene que ser comienzo de palabra del nombre, gana la más específica): foto(s) → 🧊 3D → 📐 Plano (sin foto, arranca en el 3D); se arma con un MutationObserver, así cuando el pañol cambia la foto se rearma solo. Deslizar (scroll-snap), ‹ › y puntitos (`[data-mfc-ir]`, `[data-mfc-pt]`). Tocar 3D/plano → visor claro `#mfVisor` con la hoja (`_hoja.webp`), zoom con dos dedos, rueda, doble toque y ＋/−. Índice una vez + `localStorage ema.mat.indice`. Sin señal: «Sin señal: el plano se ve cuando vuelva». `__matFichas` |
| `asistenteIa` + `asistenteIaCod` (text/plain, dormido) + `asistenteIaCss` | 132 | «✨ Asistente EMA». Lo liviano (`asistenteIa`): botón `#iaFab` (solo admin/oficina; otros roles con `configEquipo/personal.asistente.roles`, ⚙ en el panel), `__iaPuede`, `__iaRoles`, gasto `localStorage ema.ia.gasto` {d:{AAAA-MM-DD}, m:{AAAA-MM}} con `__iaSumarGasto`/`__iaGasto`/`__iaGastoTexto` (línea en menú › Versión), `__iaObraLegajo` (envuelve `abrirLegajo` para «esta obra»), `__asistenteAbrir(texto)`. Lo dormido (se carga al tocar el botón; escrito para Chrome 80): panel `#iaPanel` (chat `#iaChat`, chips `[data-iachip]`, 🎤 `webkitSpeechRecognition` es-AR, `#iaTxt`), bucle con el Worker (tope 6 vueltas; Haiku → Sonnet si «armá/hacé/cerrá/orden» o si Haiku pide una acción; `refusal` no corre herramientas), herramientas que leen lo que hay en memoria (`buscar_obra`, `datos_obra`, `ubicacion_obra`, `ordenes`, `ordenes_completas`, `stock`, `personal`, `puntos`, `resumen_dia`, `abrir`, `informe`) y acciones que solo proponen (`proponer_orden`, `proponer_cierre`, `proponer_aviso`) con tarjeta `.ia-conf[data-prop]` `[data-iasi]`/`[data-iano]`/`[data-iarev]`. Orden con Sí = carga «Llenar orden» y llama a `emitirOrdenTrabajo`; cierre con Sí = `abrirCierreOt` en serie (`#iaCola`); aviso = `__pushAvisos.dejarAviso`. Auditoría `asistente_*` con `porAsistente:true`. `window.__iaUrl` cambia la dirección del Worker. `__asistente` {abrir, cerrar, enviar, herramientas, TOOLS, props, turnos} |
| `asistenteIa` «pro» | 133 | **Sonnet 5.5 para todo** (effort medium, `max_tokens` 4000), tope **10** vueltas. Lectura de todo lo que hay en memoria (solo lectura, sin mails/tokens/imágenes: `limpio()`): `obra_completa` (registro, itemizado con K y hechas, **todos los cómputos de la Calculadora** de la obra con su `form` y materiales, etapas, órdenes y cierres, material entregado/reservado, gastos, fotos, planos, Gantt y `diferencias`: columnas del cómputo contra ítems 1–8 por altura, `epecPreviaDe` contra itemizado, `__diferenciasObra`, calculado contra entregado), `historial_calculos`, `consultar(coleccion, texto, filtro, campos, desde, limite)` (registro `DATOS` con la hoja que pide cada colección; ≈30 KB, «hay más: pedí desde=N»), `describir_datos`, `revisar_calculo` (`actRecalcular` + `actComparar` + reglas de jabalinas), `ver_plano` (imagen por `window.__planoImg` = la función del visor, 1600 px JPEG < 1,5 MB, **bloque `image` dentro del `tool_result`**), `ver_fotos` (miniaturas + distancia), `ubicar_fotos` (GPS contra `avanceObras` lat/lng, 150 m), `diagnostico_equipo`. Acciones con tarjeta: `proponer_corregir_itemizado` (Sí → `CO.aplicarAjuste` si está fijado o la cantidad directa, `avanceAutoEtapas`, `fbAvanceGuardar`; auditoría `asistente_itemizado`) y `proponer_mover_fotos` (Sí → `fotosObra` + `adjuntos` `plazaId/plazaNombre` + `movidaDe`; auditoría `asistente_mover_fotos`). Imágenes: `podarImagenes` (≤ 12 y 3,5 MB por pedido; las de turnos viejos van como texto). «📷 Fotos sin obra» en Obras (`#fsoBox`/`#fsoOv`, `plazaId: "__sinObra"`, `window.__FOTOS_SIN_OBRA`). Quedan a la vista para leer: `__planosObra`, `__planoImg`, `__herramientasLista`, `__herramientasMovs`, `__cierresQuincena`, `__mapaPuntos`, `__presenciaDatos`; `__lgFotosOlvidar(id?)` limpia la caché de fotos del legajo. `__asistente.DATOS` |
| `asistenteIa` «edita» + voz + `datosCelu` | 134 | **Edita lo que la persona puede editar**: `puedeAcciones()` (cuadrilla/operario/mirar o `esCrew` → ninguna acción y el modelo no recibe las herramientas `proponer_*`; el contexto dice qué hojas edita) + `edita(hoja)` de cada herramienta; tarjeta **antes → después** (`P.datos.filas` {c, a, d}) y «Sí»; `GUARDAR[tipo]` por los caminos de la app; auditoría `asistente_editar` {coleccion, ref, antes, despues, tipo, propuesta, porAsistente}; `errEscritura` explica el permission-denied. Herramientas: `proponer_editar_orden` (fecha, horas, sumar/sacar gente con `personalNombres`, vehículo, tareas/cantidades/quién, sacar tareas con `tareasSacadas`, notas, supervisor con aviso, anular; → `fbOtUpdate`, cuyo envoltorio avisa a la gente nueva; cerrada → aviso de puntos fijados), `proponer_calculo` (form del último cómputo → `aplicarCambiosForm` {columnas, tipoColumna, circuitos, zanjaM, campos} → `actRecalcular` + `actComparar` + itemizado previsto con `epecPreviaDe` (entrada temporal en el historial); Sí → `restaurarFormulario` + `calcular()` = cómputo NUEVO, botón «🔄 Pasar este cálculo a la obra» `[data-iapasar]`), `proponer_editar_obra` (nombre/ID/dirección/barrio/carpeta por `editarDatosObra` + `#obGuardar` (cascada a órdenes, vales…); lat/lng y situación por `fbAvanceCampos`), `proponer_movimiento_panol` (vale/entrada/devolución como «Registrar movimiento» → `fbAddMovimiento` con `valeGrupo`/`devolGrupo` = número S-/E-/D-; reserva → `fbReservaCrear` con `__reservas.numero()`), `proponer_editar` (registro `EDITA`: colección real + hojas que la editan; nunca auditoria/secretosServidor/pushSubs/avisosPush/presencia/ubicacionVivo; usuarios/reinicios/ubicación solo admin; no borra; campos de identidad bloqueados). **Voz** (`window.__voz`: plugins `SpeechRecognition`/`TextToSpeech` de la app 1.4 con `plug()`, si no `webkitSpeechRecognition`/`speechSynthesis` es-AR, si no micrófono del teclado): 🎤 dictar, 🔊 en la cabecera = leer siempre (`localStorage ema.ia.leer`), «🔊 Escuchar» en cada respuesta, **🗣 modo charla** (`#iaCharla` «Charlando… ✋ Cortar · Terminar»; escuchar → `enviar(t, true)` → `hablar` → escuchar; nunca escucha mientras habla; corta con Terminar, «chau/listo/terminar», 2 min de silencio, cerrar el panel o salir de la app; «sí, hacelo»/«no» por voz confirman la última tarjeta pendiente; desde 12 turnos `resumirCharla` resume con un pedido sin herramientas; KeepAwake / Wake Lock). **Diseño A** del panel (Ángel, 09/11): `header.ia-cab` con las clases del header de la app (logo clonado de `header .logo-badge`), `[data-ia=volver]` ‹ y `[data-ia=cfg]` (hoja `#iaCfg`, `#iaPanel.ia-en-cfg`, interruptor `#iaLeer`), respuesta `.ia-b.ia` con `.ia-quien` y `.ia-miro` (de las herramientas usadas, `MIRO`), `md()` arma `h3` y tablas `.tabla-tarjetas`, confirmación `.ia-conf-et` + `.ia-cambio` (antes tachado → después), íconos SVG de línea `ICO` (mic, charla, enviar, cfg, volver, oír), `#iaEnviar.ia-env`. **Lengüeta B2** (`#iaFab` + `.ia-fab-b` + `.ia-tab`, borde derecho, `localStorage ema.ia.tab` = fracción de la altura, arrastre vertical con pointer events, `libre()` la corre arriba de cualquier barra fija de abajo con `elementsFromPoint`; `__iaTab.ubicar`). `datosCelu` (liviano, para todos): `window.__dispInfo` {modelo, android, apk, versionApp, bateria, carga, red} cada 2 min → `presencia/{uid}.disp` (latido; `window.__presLatido`); `diagnostico_equipo` lo muestra (desactualizada, batería baja, sin señal) |
| `puntosEditar` | 127 | Ventana `#peOv` «📋 La orden» / «⭐ Puntos» de una orden cerrada: puntos por unidad de cada tarea en esa orden y por persona (`[data-pet]`, `[data-peg]`), guarda `cierre.puntos` + `cierre.reparto` + `cierre.puntosHist`; botones `[data-peabrir]` en tablero e Historial; Producción: `.prod-obra[data-probra]` filtra y `tr[data-penum]` abre. `__puntosEditar` |
| `unaObra` | 126 | Una orden por obra y día: al emitir, si hay otra abierta para esa obra y fecha, `#uoPop` «Sumar a la OT-xxx» / «Hacer otra» / «Cancelar» (`juntar`); en el tablero `#uoAviso` «Unir en…» (`juntar` + `juntarCampo`, la otra queda Anulada con `unidaEn`). `__unaObra` |
| `tableroSub` | 124 | Órdenes › Tablero por subíndices (`[data-tbs]` obra/revisar/prox/atras/cerr/anul, calendario `.tb-cal` con `[data-tbdia]`, `[data-tbmes]`, `[data-tbmas]`), `localStorage ema.tb.sub`; la base `B()` llama a `__tbSubHtml(grupos, Oe)` salvo `__ofCompat`; `window.__tbB` redibuja. `__tableroSub` |
| `envolturasUnaVez` | 123 | **Antes de `relojitosAhorro`.** `window.__heredar(nueva, vieja)`: cada envoltura `n.__x = 1; window.F = n` le pasa antes las marcas `__*` de la función que envuelve. **Si envolvés una función global con una marca, llamá a `__heredar(n, window.F)` antes de asignarla:** si no, las envolturas se envuelven entre ellas sin fin (pasó hasta la v122). |
| `envioTarea` | 123 | Mis tareas: cada tarea se manda sola (`[data-et=si/no/corregir]`, cartelito `#etPop` con horas o porqué), `campo.tareaEnv.<k>.<persona>`, línea verde/roja (`.mt-env.env-si/no`), aviso por tarea, la orden se envía sola con todas mandadas; ganchos `__mtAPI`, `__mtTareaClase`, `__mtTareaPie`, `__mtAccAntes`, `__mtEnvClase`. `__envioTarea` |
| `ordenTareas` | 122 | «↕ Orden de las tareas» (`#otOrdenT`, ↑ ↓ `data-ord`) en «Llenar orden»; envuelve `datosOtDesdeFormulario` (ordena `actividades`) y `editarOrdenTrabajo` (arranca con el orden guardado). `__ordenTareas` |
| `emitirSeguro` | 122 | Cuadrilla vacía → nombres de la gente; `fbOtAdd` con `doc().set()` y tope de 15 s (`__otAddLento`, `__otAddFallo`, `__otAddEspera` en pruebas); avisos sin esperar. `__emitirSeguro` |
| `horasTarea` | 121 | `__mtHorasTareaHtml(o,p)` en la plantilla de la tarea hecha; `campo.horasTarea.<k>` {ini, fin, por, ts}; «Enviar» las exige (salvo `__ofCompat`); el cierre las precarga. `__horasTarea` |
| `mapaPersonas` | 121 | Personas del `#uvPanel` en el buscador `#mapaBuscar` (`#mpPersonas`), filtra el panel. `__mapaPersonas` |
| `seguimientoEditar` | 120 | «✏ Editar» en cada fila de Seguimiento → `#sgEdit`: cuánto (`previsto`), quién (`asignada`), sacar la tarea (`actividades`, `tareasSacadas`), abrir la orden; cerrada no se toca. `__seguimientoEditar` |
| `edicionClara` | 119 | Cartel «✏ Estás EDITANDO» (`#edBanner`), sale sola de la edición al cambiar de pestaña o de hoja, confirma si cambia la fecha, vacía `#parteResultCard` al armar una nueva. `__edicionClara`, `__salirEdicionOt` |
| `planCalendario` | 119 | Calendario del mes (`#pcCal`, `data-pc-dia`) que muestra un solo día (`#planGrid.pc-uno`); casillas para imprimir (`#pcPrintSel`, `__planSoloIds`, `__planConEntradas`). `__planCalendario` |
| `sugerencias` | 119 | En táctil (o `__sugForzar`), saca `list` de los inputs (`data-sug-list`) y muestra `#sugCaja` blanca. `__sugerencias` |
| `lecturasCuenta` | 117 | Después del SDK de Firebase: envuelve `onSnapshot`/`get` de Query y DocumentReference y cuenta lecturas aprox. por colección y día (`localStorage ema.lecturas`, `__lecturas.texto()` en menú › Versión). No cambia lo que se lee |
| `compartirApp` | 116 | En la app de Android arma `navigator.share`/`canShare` sobre `Share` (+ `Filesystem` CACHE para archivos); cancelar = `AbortError`. Así todo «Compartir» con Web Share abre el menú del celular. `__compartirApp` |
| `relojitosAhorro` | 114 | **Primer script de la página.** Envuelve `setInterval`: con `document.hidden`, cada relojito de menos de 60 s corre como mucho una vez por minuto; a la vista, normal. No toca `setTimeout` |
| `arranqueRapido` | 084 | No dibuja `renderStockTabla`/`renderCatalogoTabla` con el pañol escondido (pendientes al abrir; `__renderSiempre` fuerza) |
| `v135Comun` | 135 | `window.__v135`: íconos de línea (`ic`), rol/permisos, cuentas comunes (`paraCerrar`, `misTareasHoy`, `resPorPreparar`, `resPorAprobar`), a dónde lleva cada cosa (`ir`, `irStock(sub)`, `irOrdenes(sub)`, `camara`), `plug(n)` |
| `inicioPro` + `inicioProCss` | 135 | Inicio «Ejecutivo» (`#iniEje`, `body.ie-hero` esconde el header de la app) y del pañolero (`#iniPan`). Solo lee lo que hay en memoria (más `fbFotosObraDe("__sinObra")` cada 10 min). Los `.ng-banner` del inicio (respaldo, stock negativo) pasan a «Para atender». «Aprobar» del pañolero = el botón de Reservas (`[data-rsa=aprobar]`). Pruebas viejas: `__inicioViejo` salvo `inicio:true`. `__inicioPro` |
| `navBarra` + `navN1Css` | 135 | Barra de abajo N1 `#navN1` (`body.n1-on`): solo ≤ 640 px o con `__cargador`. Pestañas por rol y permisos (oficina Inicio·Obras·Órdenes·Pañol·Perfil · cuadrilla Hoy·Cámara·Mapa·Pañol·Perfil · pañol Inicio·Reservas·Catálogo·Herramientas·Perfil), globitos reales. Se esconde con «Llenar orden», calculadora, cámara, asistente, visores/ventanas fijas que tapan la pantalla y teclado (`tapado()`). Sin backdrop-filter. Pruebas viejas: `__navNo` salvo `nav:true`. `__navN1` |
| `perfilApp` + `perfilCss` | 135 | Vista Perfil (`mostrarVista('perfil')`), bloqueo con huella (`ema.huella=1`, `NativeBiometric.verifyIdentity` al abrir y al volver tras 5 min, velo `#bioVelo`), recordatorio diario (`LocalNotifications` id 1351, `localStorage ema.recordatorio`, hoja `#rdHoja`), número del ícono (`Badge`). Sin plugins: «Necesita la app de Android 1.4». `__perfil` |
| `v136Ui` + `v136UiCss` | 136 | Campanita de línea en el header (`#avCampana` con `svg.av-ic`, mismo botón), `#ieReloj` (franja fija del borde de arriba con `body.ie-hero`), barra de abajo deslizable opción B: flechita `[data-n1g]` en `#navN1`, deslizar, lengüeta `#navTab` al borde izquierdo con `.nt-bd` (suma de los globitos), `body.n1-guardada` (sin el relleno de abajo), `localStorage ema.nav.guardada`. `__navGuardar` {guardar, estado, pendientes} |
| `supervisor` + `supervisorCss` | 136 | «🩺 Supervisor»: vigilancia sin IA en admin/oficina (al abrir y cada 15 min, de memoria): itemizado (hechas de más, columnas del cálculo ≠ ítems 1–8, `epecPreviaDe` ≠ itemizado, cerradas que no movieron el avance, `__diferenciasObra`), obras trabadas (N días, `ema.sup.dias`, def. 7), órdenes viejas sin cerrar, tareas repetidas 3+, atraso contra `planGantt`/`fechaEstimada` («sin Gantt» lo dice), equipo (app vieja por `presencia.disp.versionApp`, fotos sin subir, sin persona vinculada, ubicación cortada, lecturas). Bloque `#ieSuper` en el Inicio Ejecutivo y hoja `#spHoja` («Ver todo», `[data-sup]`). Revisión con IA 12 y 18 h: el primer aparato toma el turno con una transacción en `configEquipo/salud.supervisor.slots.<AAAA-MM-DD-12|18>` (sin reglas nuevas; si la base no deja, `localStorage ema.sup.slots`), `__asistente.revisionSupervisor` arma el parte (queda en el chat y en `salud.supervisor.ultimo`) y si hay rojo avisa a Administración (`dejarAviso`). Pruebas viejas: `__supNoIA` salvo `supervisor:true`; `__supSlotPrueba`. `__supervisor` {hallazgos, inicioHtml, hoja, revisarIA, tic, estado} |
| `guiasNuevas` + `guiasNuevasCss` | 136 | Guías con la carpeta `guias/` (ver §3): MutationObserver sobre `#guiasApp`/`#gqOverlay` (tapas en las listas, bloques `.gn-pasos`/`.gn-fam`/`.gn-tipo`, lo de antes en `details.gn-viejo`), láminas (`#gnLam`, envuelve `laminaAbrir` cuando aparece y atrapa `[data-lam]`), PDF compartir/bajar (`[data-gnpdf]`), visor `__matFichas.visor(url)` (desde v136 acepta una dirección completa). Índice una vez + `localStorage ema.guias.indice`. Sin señal: «se ve cuando vuelva la señal». `__guiasNuevas` |
| `asistenteIa` v136 | 136 | `__iaModelos` (MOD, chat(), supervisor(), costo, workerViejo/marcarViejo), `__iaCargar`; en lo dormido: `cuerpo()` con fallbacks/betas/effort/16000 y caché arriba de todo, **historia solo-agregar** (los bloques `thinking` tal cual; imágenes nuevas con cupo `cupoImg`; charla larga → `compactar()` = conversación nueva desde un resumen), Worker viejo → Sonnet + `avisoWorkerViejo`, `armar_pdf` (orden, comprobante, reserva, stock, compras, puntos, obra, avance, mensual, libre; por `abrirHojaImpresion`/`imprimirOrdenTrabajo`/`verComprobanteMovimiento`/`__rsImprimir`/`armarInforme`), cierre rápido (`proponer_cierre` con `fecha` o `otIds` + `revisionCierre`: «✅ Lista» / «⚠ Le falta», tarjeta «Cerrar» / «Cerrar igual» `[data-iaigual]` / «No»; con el Sí abre el cierre, contesta «No» a la pregunta del itemizado y toca `#apTodo`), herramienta `supervisor`, ⚙ «Modelo» (solo admin). Pruebas viejas: `__iaCompat` (Sonnet, cierre de antes) salvo `iaPro:true` |
| `qrLib` | 137 | qrcode-generator 1.4.4 (Kazuhiko Arase, MIT) adentro de la app: `window.__qrcodeLib(tipo, "M")`. Sin internet |
| `codigosQr` + `codigosQrCss` | 137 | `__codigos` {escanear, alEscanear, abrirRef, refDeTexto, docDeTitulo, urlDoc, urlObra, dataUrl, matriz, eanDe, codigoDeEan, asociarEan, productoPorEan, preguntar, elegirEtiquetas, imprimirEtiquetas}. **QR en las hojas:** `hojaPdf.abrir` llama a `window.__qrHoja(titulo, doc)` → QR PNG (68 px) arriba a la derecha (`.ema-qr`) según el título: `N° S-/E-/D-`, `OT-AAAA-NNN`, `RH-`/`RI-`, y en informes de una obra (título con el nombre de la obra) `?obra=<id>`; las reservas llevan su QR en cada hoja (`window.__qrReserva(r)` dentro de `hojaReserva`, `.ema-qr-r`). Dirección `https://miguelangelbasq-tech.github.io/alumbrado-stock/?doc=…` / `?obra=…`: al abrir la app se guarda (`sessionStorage ema.doc.pend`, se limpia la dirección) y después de entrar abre el comprobante (`verComprobanteMovimiento`), la orden (`verOrdenTrabajo`; la cuadrilla, Mis tareas si es suya), la reserva (`irAReservas`), la herramienta (`data-hrabrir`), el remito RH/RI o el legajo; sin permiso, «🔒 No tenés permiso para ver esto». **Lector:** `__escanear` (ML Kit, app 1.3+) si está el plugin; si no, hoja `#esOv` con `BarcodeDetector` + cámara, o a mano. **EAN:** bloque `#eanBox` en la ficha del material (`#pfModal`, por MutationObserver): chips, «🔗 Asociar código de barras», «Hacer vale de salida», «Entrada»; repetido → `#v7Preg` «¿Lo pasás?»; desconocido → `#eanPreg` «¿A qué producto corresponde?». Botones `#esBtnPanol` (Catálogo) y `#etBarra` (Herramientas: «📷 Escanear», «🏷 Imprimir etiquetas QR» → `#etOv` para elegir → hoja A4). Auditoría `producto_ean` |
| `remitoFoto` + `remitoFotoCss` | 137 | «📷 Cargar remito con foto» (`#rfEntrada`/`#rfBtn` en Registrar movimiento › entrada; chip `[data-rfabrir]` en `#iaChips` y «cargá este remito» en el chat). Foto por `Camera` (app) o `#rfFotoCam`/`#rfFotoGal`, achicada a 1600 px. Pedido propio al Worker `ema-ia` (`__iaModelos.chat()` = Opus 5.5, bloque `image`, effort medium, fallbacks; «modelo no permitido» → Sonnet 5.5 y `marcarViejo`). La IA solo transcribe (JSON); los códigos los propone la app con `__alternativas.rasgos/comparar` + palabras + EAN (🟢/🟡/🔴, hasta 3); sin código queda afuera. Tarjeta `#rfOv` editable; «Sí, cargar entrada» → `fbAddMovimiento` por renglón (con `__precioOk`: precioUnit $ sin IVA + precioOriginal, moneda, ivaPct, cotizacion), foto por `fbAdjuntoGuardar` (R2 o adjuntos) → `fotoId`, costo al catálogo si se tilda, auditoría `remito_ia` `porAsistente:true`. `__remitoFoto` {abrir, cerrar, conArchivo, interpretar, candidatos, conversion, estado} |
| `asistenteIa` v137 | 137 | En lo dormido: **dictado en vivo** (parciales de `webkitSpeechRecognition` / `partialResults` del plugin → `#iaTxt`, `enVivoCaja`) y **onda de rayitas** `#iaOndaV` (`window.__iaOnda` {on, off, pulso, estado}; nivel real con getUserMedia + AnalyserNode solo en la compu con el navegador, simulada en el celu/APK; `window.__iaOndaSimulada` la fuerza simulada). **System fijo** durante la charla: el contexto (`contexto()`: fecha, hora, pantalla, permisos, charla) va como bloque `[Contexto de la app …]` al principio de cada mensaje de la persona (salvo `__iaCompat`); `textoPersona(m)` para los resúmenes. Glosario del dictado y «actuá sin preguntar de más» en `SISTEMA`. `buscarObras` aproximado (`lev`, `parecido`, `aproximado`; palabra entera 85, pedazo 75) y `resolverObra` elige si la mejor saca 10 puntos; `buscar_obra` devuelve `mejor` y `puntaje`. `datoSimple(t)` → effort «low» + `rapido` (4.000 tokens) |
| `atrasApp` | 138 | El «atrás» del celu / navegador: una entrada de historia por nivel (`{ema:{n}}`: pantallas después del Inicio + capas abiertas), se agregan al abrir y se consumen solas al cerrar con ✕ o ir al Inicio (`history.go` en silencio). «Atrás» cierra la capa de arriba con la función de su ✕ (registro `CAPAS`: menú, Asistente, cámara, galería, hoja A4, hoja del celu, planos, cierre de OT, legajo, orden de Mis tareas, guía, ficha de plaza, ganancia de obra; más cualquier ventana fija `.v7-ov`/`role=dialog`/…Ov/…Hoja/…Visor/…Modal/…Pop por su ✕, el fondo o Escape) o vuelve a la pantalla anterior; en el Inicio no deja historia (el APK va al fondo). «¿Salir sin guardar?» (`#atPreg`) en Llenar orden, Registrar movimiento y el cierre con cambios (la Calculadora no). Los `pushState`/`popstate` viejos (appCelular, planos, hojaCel, cámara, galería, hojaOv) quedaron apagados. **Si agregás una ventana nueva, que sea `.v7-ov` o `role=dialog` con un botón ✕ (`aria-label="Cerrar"`) y no toques la historia a mano.** `__atras` {sync, estado, capas, sucia, preguntar, pasoAtras}; `__atrasNo` lo apaga |
| `remitoFoto` (v138) | 138 | PDF (bloque `document`, ≤ 3,5 MB y 20 páginas por el tope de 5 MB del Worker) y hasta 4 fotos de un remito en un pedido → una tarjeta; `max_tokens` 16000 con Opus/Fable; resumen `#rfSum` arriba y `#rfPie` (sticky) con «Sí, cargar entrada»; `fotoIds`; PDF ≤ 650 KB como adjunto. Modo «💲 Solo precios» (`fbGuardarProductoCatalogo` con `costo, costoFecha, costoFuente, costoTs`, sin movimientos; auditoría `remito_precios`). «📜 Remitos cargados» (`#rhOv`/`#rhVer`): resumen en `adjuntos` `tipo:"remitoRes"` (sin imagen; `mes`, `clave` = proveedor|número) leído por mes con dos `where ==` (sin índice compuesto); aviso de repetido `#rfDup`. `__remitoFoto` {conArchivos, partesDe, lista, verRemito, buscarRepetido, claveDe, precioActual} |
| `v139PcCss` + `v139Pc` | 139 | **La compu a todo lo ancho** (solo `min-width:901px`; hasta 900 px y en el celu no cambia nada). `.wrap`, `header .header-inner`, `footer`, `.tabbar` hasta `--pc-max` 1960 px con `--pc-lado` 32 px. Inicio Ejecutivo: `#iniEje` hasta 2200 px con 28 px de margen, `.ie-in` en grilla (saludo · KPIs · anillo; `.ie-saludo` con `display:contents`), `.ie-cuerpo` en columnas tipo masonry (`column-count` 2 → 3 desde 1200 → 4 desde 1700; `.ie-col` con `display:contents`, `.ie-tarj` sin cortarse). Perfil: `#viewPerfil` en `column-count` 2 (3 desde 1200; tope 1400 px), cada tarjeta empieza columna con `break-before:column` (persona + KPIs · Tus ajustes · La app + Cerrar sesión). Asistente: `#iaPanel` lateral derecho de alto completo, ancho `--ia-w` (480 px; asa `.ia-ancho` en el borde izquierdo, 420–760, doble clic = 480, `localStorage ema.ia.ancho`, `window.__iaAncho` {poner, leido, maximo}); desde 1240 px `body.ia-abierto` corre el contenido (`padding-right`), en 901–1239 flota. Llenar orden, Calculadora y Registrar movimiento quedan como estaban (las dos primeras ya van en 2 columnas; Registrar movimiento necesitaría agrupar los campos en el HTML/JS) |
| `remitoFoto` (v140) + `asistenteIaCod` (v140) | 140 | **Remito «inteligente»** (bloque dentro de `remitoFoto`, fuente en `herramientas/v140/remito140.js/.css`): en «📦 Cargar entrada», al leer el remito busca si ya se cargó: entradas de `movimientos` (`tipo:"entrada"`, sin `anulado`/`devolucion`/`ajuste`/`correccion`) con el mismo `remito` y `proveedor` normalizados (`numN`: sin espacios/puntos/guiones/letras ni ceros adelante de cada parte, «0001-00012345» = «1-12345»; `provN`/`mismoProv`: sin tildes ni S.A./SRL…, prefijo o Levenshtein ≤ 1–2; **el proveedor tiene que coincidir**) y resúmenes `adjuntos` `remitoRes` (por `numN`, y los de la v138 por `clave`). Por código (lo cargado se reparte en orden si el código se repite): ✅ `ok` · 🟠 `med` («se cargaron 40 de 100 → faltan 60») · 💲 `sp` (sin `precioUnit` y sin precio puesto desde este remito, `costoFuente`) · 🆕 `nu` · 🔴 `sc`. Cartel `.card.rf-cartel` (`#rfCartel`, `.completo`/`.parcial`): completo → «Ver lo cargado» (`#rfPrevOv`) / «Cargar igual» (la tarjeta de antes) / «Cancelar»; parcial → «➕ Cargar solo lo que falta» (`data-rf=pfalta`: entradas solo por la diferencia con `completaRemito`, precio de los 💲 por `fbGuardarProductoCatalogo` con `costoFuente`; el remito más viejo que el precio no lo pisa), «💲 Solo los precios que faltan» (`pprecios`: la hoja de «Solo precios» con los 💲 tildados), «Revisar renglón por renglón» (`previsar`: la tarjeta con `estFila` y casillas `[data-rf=tilde]`/`[data-rf=psi]`, ✅ destildados, «Sí, cargar lo tildado» `data-rf=sic`), «Ver lo cargado», «Cancelar». Al completar: `remitoRes` se actualiza (`update`, con `historial[]` «completado el dd/mm por X: +N renglones, M precios») o se crea (`deCargaManual`), auditoría `remito_completar`. Resúmenes nuevos con `numN`/`provN`. En «💲 Solo precios» y sin entradas previas, el aviso de repetido de la v138. `__remitoFoto` {cargado, numN, provN, mismoProv, movsDelRemito…}. **Dictado** (`__voz`): cada `escuchar` es una sesión; `VOZ.cortar()` (al enviar: `abort()` del navegador, `stop` + `removeAllListeners` del plugin) descarta lo que llegue tarde y `mic()` no vuelve a escribir (`r.cortado`); `sinEco` quita el texto pegado dos veces; en charla la caja queda vacía |
| `asistenteIa` v141 (por rol y topes) + `asistenteIaCss` | 141 | **Lo que ve cada rol, controlado en la app** (código dormido): `alcance()` {n, todo, permite, tools, re} por `nivelRol()` (admin · oficina · panol · crew = cuadrilla/operario/`esCrew` · mirar; `__iaNivelForzar` en pruebas). (a) Herramientas por rol, lista cerrada `TOOLS_ROL` (admin y oficina: todas; pañol: obras en general, stock, consultar solo `DATOS_ROL.panol`, historial de cálculos, armar_pdf de stock/compras/comprobante/reserva, como_se_hace, movimientos y `proponer_editar` del pañol; cuadrilla: buscar/datos/ubicación/planos de SUS obras (las de sus órdenes por `personaClave`), sus órdenes (sin nombres de los demás: `conVos`), stock, SUS puntos, como_se_hace, abrir; mirar: buscar/datos generales (`MIRAR_OBRA`)/ubicación de obras, como_se_hace, abrir). (b) `ejecutar()` envuelve a `ejecutarBase()`: lo no permitido devuelve `NO_VE` («Eso no lo puedo ver con tu usuario, preguntale a la oficina.») y cada resultado pasa por `podar()` ANTES de ir al modelo (`R_PERS` valor hora/sueldos/valor del punto…, `R_OBRA` K/módulo/importes/gastos/ganancia, `R_MAT` costos/precios — no en pañol —, `R_AJENO`), con `_oculto`. `sistemaRol()` agrega al system lo que no ve (fijo durante la charla). Herramienta nueva `como_se_hace` (busca en `GUIAS_OBRA` y `NORMAS_FICHAS`). Modelo por rol: pañol/cuadrilla/operario/mirar → Sonnet 5.5 effort low (`rolBarato`; los remitos siguen con Opus). Cada pedido lleva `ema.tipo` (pregunta / supervisor). Atajos y ejemplos por rol (`CHIPS_ROL`). Chip `#iaQueda` «Te quedan N preguntas hoy», cartel `.ia-tope` para `tope_*`/`rol_apagado` (no error rojo), aviso una vez si el Worker no es `v3-ia` (`ema.ia.avisoWorker3`). ⚙ **Límites** (`#iaLimites`, solo admin; reemplaza «¿Quién ve el asistente?»): prendido por rol (`data-iarol`), preguntas/remitos por rol (`data-ialim`), freno del mes (tope US$, pausa %, corte %), «Guardar límites» → `configEquipo/personal.asistente.{roles, limites}` (auditoría `asistente_limites`), detalle por persona de `/uso` (`#iaLimPers`); «Gastado este mes» `#iaGastoMes` (admin y oficina). Lo liviano: de entrada lo ven **todos** los roles (`ROLES_TODOS`; con `__iaCompat`, solo admin/oficina como antes), `__iaNivel`, `__iaLimDef`, `__iaUso` {poner(ema), marcarTope, mio, uso, quedaTexto, textoMes, estado} (`/mio` al abrir el panel, `/uso` al entrar admin/oficina y en ⚙), aviso a Administración al freno (`ema.freno.avisar` → `dejarAviso` a los admin, `ema.ia.freno` una vez por mes), `__iaGastoTexto` con «Gastado este mes» (menú › Versión). `remitoFoto` manda `ema.tipo:"remito"` y muestra el tope. `__asistente` {alcance, nivelRol, sistemaRol, ejecutar, cartelTope, NO_VE} |
| `cuadrillaDia` + `cuadrillaDiaCss` | 142 | **La cuadrilla nueva** (maquetas aprobadas, opción E): `#cdApp` en el Inicio de cuadrilla/operario (`__cdOn()` = crew y no `__crewViejo`). Pantallas `PANT.{hoy, orden, seg, salir, llegar, obra, fin, puntos, llamar, senal}` con su ‹ `[data-cdvolver]` (capa `cdPant` de `atrasApp`) y título en `#hdrHoja` (subtab oculta `data-hdr`). **Modo obra:** `pasoActual(o)` → `llegue` / `foto` / `termine` / `fin`; `unidades(o, p)` = una por columna/caja/luminaria (nombres de `puntosDeObra`, sigue después de las que ya tienen foto en la obra) o las tomas obligatorias (`tomasDeTarea`). Foto = `camaraApp.abrir(#cdFotoIn)` con la guía `.cd-guia` → `guardarFotoObra` → `campo.fotos` (igual que Mis tareas); «Terminé» = hoja `#cdHoja` (`.v7-ov`) con horas − / + → `campo.pasosObra`, `__mtAPI.marcar` (cant = columnas hechas), `campo.horasTarea`; la última → `campo.tareaEnv` + aviso; todas → `campo.enviados` + `campo.horas` (como `envioTarea`). «No se hizo» con el porqué. Seguridad (`SEG`, foto por `cdSegIn`), antes de salir (`materialDe`: reserva con `otId` o de la obra, si no los vales; `herrSugeridas`: `HERR_DEF`/`herrPorTarea` + `herramientas` leída una vez), cómo llegar (Leaflet + Google Maps), falta material (`dejarAviso` al pañol y a `ot.supervisor` o la oficina), ayuda (asistente con `window.__iaEnObra` en el contexto y `#cdIaCtx`; guía `#cdGuia` de `guias/pasos/<GUIA_DE>_pN.webp` con ‹ › y zoom; llamar), contactos (`tel:` / `wa.me/549…`), fin del día, mis puntos (`__quincenas` + `puntosDeOrden`), sin señal (`__fotosSinSenal`, `__campoCola`). Oficina: `__cdOficinaHtml(ot)` en el «📸 Avance» y en el cierre; tarjeta `#cdCfgCard` en Producción › Personal. El control de permisos por pantalla trata ese Inicio como `mistareas`. `__cuadrillaDia` {ir, estado, pasoActual, unidades, materialDe, herrSugeridas, contactos, misPuntos} |
| `ordenSugerida` + `ordenSugeridaCss` | 143 | **Orden sugerida** (LA ARMA LA APP, sin IA; nada se escribe hasta «Emitir»). Motor `armarDia(fecha, S, Ed, C)` de memoria: obras activas (no `__obraFin`, con órdenes en 30 días o abiertas) con `saldoObra` (sin cálculo → `sinCalculo`), lo que quedó de ayer (cerradas con menos de lo previsto, sin `pasadoA`), órdenes sin cerrar de días anteriores (aviso, no se cuenta dos veces), orden de obra (`ORDEN`; reglas pozo→hormigón, fraguado con `campo.pasosObra.hormigonado` o el cierre (`hormigonadas`), zanja→cable→tapado, izaje→vínculo→luminaria/tablerito/sellado, jabalina con tableritos), columnas siguientes (`puntosDeObra` menos fotos `f.k` y `pasosObra`), rendimiento `rend(k)` (según Ángel / medido ≥3 cierres de `horasTarea`+`pasosObra` / diccionario `1/hh` / a mano; izaje `izajeAngel` por modo), pools de HH «civil» (gente con `equipoCivil`, tareas `CIVIL_T`/`AMBOS_T`) y «montaje», gente = la de la última orden de la obra (misma cuadrilla), ocupados (orden real ese día), ausentes, libres; vehículos por tipo (`elegirVeh`: grúa para izaje, hidro/barquilla para altura, barquillas para tablero —rinde 3–4 con 2 y 2 con 1—, transporte para el civil, lugares), reserva contra `stockActual` (aviso), puntos con `__ordenNueva.puntos`. Semana encadenada (`armarHasta`, `armarSemana`, `encadenar`: lo asignado y el fraguado pasan al día siguiente). Ya emitida = orden real de esa obra y día con su gente (se muestra, no se re-sugiere). Cambios `aplicar(E, fecha, c)` (sacar/sumar persona, cantidad, sacar/sumar tarea, incluir/excluir, vehículo, volver), los mismos para la hoja y el asistente; `st.E` en `localStorage ema.sug.E`. Hoja `#sgOv` (z 975, debajo de `#uoPop` y del asistente) con Por obra / Por persona / Semana, KPIs, editor `#sgEd`, confirmar `#sgEm` (aviso al emitir y recordatorio 7:00), Ajustes `#sgCfg`, plan para la inspección `#sgEp` → `abrirHojaImpresion` (sin puntos ni plata). Emitir: `cargarEnLlenar(d)` (como el `cargarOrden` del asistente) + `emitirOrdenTrabajo` por cada una (número, `personalNombres`, `vehiculoPersona`, avisos, `unaObra`); `window.__otSinAviso` apaga el aviso al emitir; auditoría `ot_sugerida`. Recordatorio: envuelve `fbOtAdd`/`fbOtUpdate` → `avisosPush` con `enviarDesde` si `workerNuevo()` (`/salud` ≥ v143), si no `LocalNotifications` en el celu de la cuadrilla (ids 143000+). Tarjeta `#ieSug` en el Inicio Ejecutivo (todo el día; «Emitidas N de M»), `#sgTab` arriba del tablero de Órdenes, «🧠 Lo que aprende la app» (`#apOv`: ⏱ Tiempos = `estudio()` por tarea, personas y cuadrilla + «✨ Informe del asistente»; 📦 Material = `calcularBalancePlaza` por obra + «Próximamente», el aprendizaje de material va en la v144) en el menú (`#menuAprende`, debajo de Equipo/Producción), en Accesos del Inicio y en la hoja; `#sgPerCard` en Producción › Personal (ausencias, equipo civil, tipo y lugares); `#sgAusAv` en Llenar orden (ausente ese día, solo aviso); línea «Rendimientos» del Supervisor (`supHallazgos`, ir `aprende`). Pruebas viejas: `__sugNo` salvo `sugerida:true`. `__sugerida` {armar, semana, plan, aplicar, diferencias, emitibles, edicion, ediciones, resumenIa, abrir, emitir, cargarEnLlenar, rend, medidos, registros, estudio, probarCfg, guardarCfg, guardarRend, planEpec, abrirAprende, workerNuevo, ausente, emitiendo, _st} |
| `asistenteIa` v143 | 143 | En lo dormido: herramientas **`ordenes_sugeridas(fecha)`** (lee `__sugerida.resumenIa`: lo que calcula el motor, sin cálculo propio), **`proponer_ordenes_sugeridas(fecha, cambios[])`** (cambios sacar/sumar persona, cantidad, sacar/sumar tarea, incluir/excluir obra, vehículo, traducidos con `personaDe`/`tareaDe`/`vehiculoDe` y aplicados con `__sugerida.aplicar`; tarjeta `tipo:"sugeridas"` antes → después con «Sí, emitir las N» / «Abrir la hoja» (`data-iarev` → `GUARDAR.sugeridas(P, soloCargar)` abre la hoja con esos cambios, sin escribir) / «No»; el Sí emite con `__sugerida.emitir`) y **`proponer_rendimiento(tarea, por_dia)`** (Sí → `configEquipo/baremo.sugerida.rend`). `revisarSugerida(f)` = UN pedido «pregunta» con la sugerida armada adentro («Está bien así» o una propuesta); `informeRendimientos()` con `estudio()` (sin plata). Chip «📋 Órdenes de mañana»; `SI_RE` acepta «sí, emitilas». Por `TOOLS_ROL`, pañol/cuadrilla/mirar no las reciben; además piden `edita("parte")` (rendimiento: `edita("produccion")`). |
| `obraGps` + `obraGpsCss` | 144 | **La foto cae en la obra donde está parado** + **cámara «opción B · cámara primero»** (maquetas B1–B3, hoja de cambiar estilo D). `camaraApp.abrirHoja` (menú «📷 Cámara», barra de abajo, `?camara=1`, «Cámara EMA») → `__camB.abrir()`: abre directo la cámara de la app (`#emaCam.ec-cb`) con la píldora `#cbPill` (obra elegida por el GPS a ≤ 150 m del pin, aunque la orden de hoy sea de otra; «a 22 m · OT-…» / «no es tu orden»; GPS malo = sin dato o ± más de 100 m (a confirmar) → «Elegí la obra», se usa lo elegido y `ubicDudosa`), el cartel `#cbAviso` que no frena («Está bien» / «Es otra obra»), y abajo `#cbPanel` «‹ Col 4 ›» + modos `[data-cbm]` (el tipo y la columna salen de la tarea de su orden en esa obra con `__cuadrillaDia.unidades`; pasa sola a la siguiente) + disparador + «Listo» (`[data-cb=listo]`). Hoja `#cbHoja` (`.v7-ov`): «¿En qué obra estás?» (cuadrilla: cerca según el GPS + sus órdenes de hoy y pendientes + «Es otra obra (decí por qué)» con buscador y motivo obligatorio; oficina: buscador de todas), «Estás en X, no en Y. ¿Guardo la foto en X?» (Sí / «No, es de Y (decí por qué)»), «¿Qué vas a sacar?». La obra se decide al guardar (`__camB.resolver`, espera el GPS hasta 1,5 s) y viaja como `meta.ubic` → `guardarFotoObra` (base) la pone en `fotosObra` y `adjuntos` (`window.__obraGpsUbic`; las fotos de Mis tareas / Modo obra también llevan `distObra`/`ubicDudosa`). Con orden en esa obra va a `campo.fotos` (con `k` de la tarea); sin orden, foto libre (reglas v125) y `__obraGps.trasFoto` → aviso al supervisor de su orden de hoy o a Administración/Oficina, uno por persona, obra y día (`localStorage ema.og.sinOrden`, se manda al minuto o al cerrar la cámara). Modo obra: «Llegué» con el GPS en otra obra registrada → `#ogLlegue` «Estás en X. ¿Trabajás acá hoy?» (Sí: cámara B en X como fotos libres + aviso, no anota la llegada; No: Cómo llegar). Supervisor: «Fotos que parecen de otra obra» (fotosObra de 3 días por `fecha ==`, cada 20 min; misma cuenta que `ubicar_fotos`; sin las de GPS impreciso) → hoja `#ogSup` con «Mover a X» (+ «Sí, moverlas»: los mismos cambios que `proponer_mover_fotos`, `movidaDe`, auditoría `supervisor_mover_fotos`) y «Está bien» (`ubicOk`); «Obras sin ubicación cargada (N)» con «📍 Cargar ubicación» (`moverPinMapa`). Pruebas viejas: `__obraGpsNo` / `__camViejaNo` salvo `obraGps:true` / `camaraB:true`. `__camB` {activa, abrir, resolver, estado, hoja}, `__obraGps` {cercana, misOts, trasFoto, flush, llegue, supHallazgos, hojaSup, grupos, sinUbic, mover, estaBien} |
| `obraGps` (2.ª parte, `__zonaContrato`) | 144 | **Nuestra zona** (Ángel: el contrato de EMA es solo el Renglón 1 · Zona A (Este), 127 plazas, 18.407 módulos). `zona()` = `configEquipo/precios.zonaContrato` (de entrada A), `zonaDeObra(o)` por el listado del pliego (`PLAZAS_LICITACION` + `idsDePlaza`; barrios y «otras» no cuentan), `resumen()` {k avanzado de esa zona, pct sobre sus módulos, terminadas, texto}. El anillo del Inicio Ejecutivo dice «Zona Este» y debajo de la fecha «Zona A (Este): N de 127 plazas terminadas · X % de 18.407 módulos» (en el Inicio no se muestra el total de la licitación); el inicio viejo (solo mirar) dice lo de la zona; en el Itemizado, `#zcCaja` «Nuestra zona» (`#zcSel`, solo admin) con el total de la licitación aparte. `epecTotales().renglones` expone la tabla del pliego |
| `estiloV1Css` | 144 | Estilo «V1 · Turquesa del logo» (ver §10): paleta, portadas, acentos, Plus Jakarta Sans + JetBrains Mono incrustadas; también en las pantallas que tenían «Inter» escrito a mano (cámara, visor, hoja A4 en pantalla). No cambia ids, clases ni JS. Lo arma `herramientas/v144/armar_estilo.py` desde la maqueta V1 (`maq_estilo/css/V1.css`) y las fuentes de `herramientas/v144/fonts/` |
| `certMensual` + `v145Css` | 145 | **📑 Certificación mensual** (maqueta i1): menú «Certificación del mes» y tarjeta en Informes (solo quien edita Informes o Gastos). Solo nuestra zona (v144). Mes = avance de las órdenes cerradas (`cierre.avanceItems`, fecha de la orden; anuladas con `avanceRevertido` no); lo cargado a mano sin fecha no se reparte (⚠ para revisar). Por ítem K, contratado, anterior, mes, acumulado, módulos y $ (módulo de `epecTotales().modulo`, sin IVA, IVA 21 %); provisiones 83–89 aparte; ejecutadas con `CERTIF_MUNI` como anterior (hoja asignada o ID exacto). PDF (`abrirHojaImpresion`, QR `?cert=AAAA-MM` por envoltura de `__qrHoja`) y Excel (`window.__infExcel` = el armador de los informes). Cerrar el mes (admin, «Sí»): `avanceObras.certificados.<M>` + `precios.certCerrados.<M>`; mes cerrado fijo, lo tardío va al siguiente. Asistente: `certificacion(mes)` (solo admin/oficina por `alcance()`). `__certMensual` {abrir, armar, deObra, cerrarMes, pdf, excel, puedePlata, enZona} |
| `matAvance` | 145 | **📦 Material contra avance** (maqueta i2): entregado neto (`__reservas.entregadoAObra` + `__sustitutos`) contra cómputo × avance del rubro (`grupoSec`/`grupoMat` → ítems 1–8, 15–20, 21–24, 25–40, 9–14, 74/75/77/81, 45–49; a confirmar), semáforo con margen (`baremo.aprendeMaterial.margen`, 10 %; rojo > 5 × margen o avance sin entregar). Legajo `#lgMavSec` (debajo de `#lgBalSec`; «Ver vales» `#mavVales`, «Pedir devolución» `#mavDev` con aviso), 🧠 › 📦 Material (`aprendeHtml`: semáforo por obra + material real por columna/metro/tablero y tipo de obra con obras terminadas o ≥ 90 %), Supervisor (`supHallazgos`). «✨ Informe del asistente» → `proponer_aprende_material` → con «Sí» solo anota en `baremo.aprendeMaterial.sugerencias`. `__matAvance` |
| `sinTarea` | 145 | **👷 Gente sin tarea** (Ángel: «todo el personal de alumbrado tiene una tarea cada día hábil, salvo ausencia o enfermedad»): `personal()` (nómina de obra sin los vinculados a admin/oficina/pañol/mirar), `sinTarea(f)` (sin orden emitida ni ausencia), `sugerencias(f, p, d)` (1° sumar donde rinde más —izaje de 2—, 2° preparación, 3° galpón, 4° lo que quedó, 5° a mano), bloque `#stBloque` arriba de la sugerida, cartel `#stCartel` al emitir y aviso después, Inicio › Para atender (`atender()`, `data-ie="sintarea:<f>"`), recordatorio 17:00 (`tic()`, transacción en `salud.sinTarea`; `window.__stAhora` en pruebas), 🧠 «👷 Días sin tarea» (`conteoMes`), `paraIa(d)` → `resumenIa.sinTarea`. `__sinTarea` |
| `sugReglas` | 145 | Reglas de Ángel para armar órdenes: **mínimo 2 en obra** (`revisar`, `okMin`; `sugerida.minObra`; barquilla/grúa/hidro/tablero sí o sí 2; galpón puede ser 1; la sugerida no emite el equipo de 1 y la persona queda sin tarea; «Llenar orden» envuelve `emitirOrdenTrabajo` con `#m2Preg` «Emitir igual»), **👥 Equipos habituales** (`#ehCard` en Producción › Personal, `PROPUESTA` de Ángel emparejada por nombre y apellido con «a confirmar»/«no encontrado», `personal.equiposHab`; en la sugerida `sumarHab` manda al equipo de la grúa a la obra con izaje y un equipo libre a la obra sin cuadrilla, `vehHab` su vehículo primero) y **vínculos sin grúa** (en `llenar`: `vincSG`/`vArm`; sin vínculos armados el izaje va «con caño y sin vínculo» y los vínculos de lo izado hoy van aparte con hidro/barquilla). `__sugReglas` |
| `fmtNombre` | 145 | Mayúsculas prolijas (solo pantalla): `window.__fmtNombre {obra, barrio, direccion, persona, titulo}`; obra en MAYÚSCULAS, el resto Tipo Título con palabras chicas, siglas, números y romanos. Usado en Inicio Ejecutivo, Obras (lista y legajo), cámara; por CSS (`html.v145` + `text-transform`) en Avance, Órdenes, Mis tareas, Planificación y reservas. «🔤 Ordenar mayúsculas en la base» (`#fnBtn`/`#fnOv`, admin, «Sí», por `editarDatosObra` + `#obGuardar`, auditoría `obras_mayusculas`) |
| `gradAccionCss` | 145 | `--grad-accion` (navy → `#1F5F86`, el de «Calcular materiales») en todo lo que tenía fondo azul sólido; la lista de selectores sale de `herramientas/v145/buscar_navy.js` + `acciones.py` (excluye header, portadas, cámara, impresión, ondas del asistente) |
| `cierreVoz` + `v146Css` | 146 | **🎙 Cierre del día por voz** (maqueta i3, solo quien edita Órdenes; la cuadrilla no): botón «✨ Cerrar el día por voz» en Órdenes › Para revisar y cerrar / Hoy (`botonHtml`, gancho en `tableroSub`) y chip `[data-cv]` en `#iaChips`; abre el Asistente con la franja `#cvBanda` y `ctx()` suma al contexto las órdenes del día (`ordenesDia`, `resumen`: lo que mandó la cuadrilla). Herramienta dormida `proponer_cierre_dia` → `armarPropuesta` (valida OT, tarea, persona, fecha) → tarjeta `cierreDia` (filas antes → después + `d.html`, «Sí, cerrar») → `GUARDAR.cierreDia` → `aplicar`: `pasarTarea` (el camino de la v128, sin ventana) y `cerrarUna` (cierre oculto con `body.cd-auto`, cantidades, `cierre-horas-p`, «No» al itemizado, `guardarCierreOt`). `__cierreVoz` |
| `pedidoCompras` | 146 | **🧾 Pedido de compras** (maqueta i4): tarjeta `#pcCard` arriba de `#cardStockCompras`, hoja `#pcOv` (clases `pq-*`, atributos `data-pq`: `pc-`/`data-pc` ya los usa `planCalendario`). `armar(dias)`: `comprasPorMinimo` + obras programadas (`programadas`: emitidas y sugeridas) con `faltaObra` (cómputo − max(salió, `__matAvance` deb) − `__apartadoObra`, unidades con `__factorUn`) − stock libre − lo ya pedido; proveedor/precio solo de entradas (`ultimaEntrada`); alternativa 🟢 `__alternativas.de`. Hoja A4 por proveedor (con/sin precios), guardar con «Sí» en `adjuntos` `tipo:"pedidoCompra"` (sin precios), lo recibido = entradas del proveedor después del pedido. Precios solo admin/oficina. `__pedidoCompras` |
| `tableroDueno` | 146 | **📊 Tablero del dueño** (maqueta i5): `#tdOv`, menú `#menuTableroDueno` (¡`#menuTablero` es «Mi tablero»!) y acceso en Inicio Ejecutivo (`accesoHtml`). Solo admin y `configEquipo/personal.tableroDueno.habilitados` (uid). `datos()` solo nuestra zona: `__zonaContrato.resumen`, `precios.certCerrados`, `__certMensual.armar`, `__gastosPro.filaObra`, `__matAvance.deObra` × último precio, órdenes hoy/mañana, ausencias, `__supervisor.hallazgos` (Al día, Fotos, Rendimientos), `__iaUso.estado().mes`, módulos del mes por día. «✨ Resumen de la semana» → `__asistente.resumenSemana` (tipo pregunta). `__tableroDueno` |
| `pasarManana` | 146 | **📅 Lo no terminado pasa a mañana**: `pendientes(D)` (no se hizo / sin marcar / a medias / cierre con menos), `plan(D)` (a la emitida de mañana; sin orden o llena por HH (`__sugerida.rend`) → borrador `ema.sug.E` vía `__sugerida.aplicar`; saltea lo ya pasado, lo que ya está mañana, lo sacado a mano y lo deshecho), `correr` con turno `tomar` (transacción en `configEquipo/salud.pasarManana.<D>.<dia|ot_id>` + candado local), `pasadoDe`/`pasadoA.auto`, aviso `#pmAviso` con «Deshacer» (`deshacer`), push a la oficina, auditoría `sugerida_pasar` (`paso`). `tic` cada minuto: orden de hoy cerrada → al toque; desde `pasarHora` (18:00) el día; antes, el día hábil anterior. Ajuste `sugerida.pasarModo` auto/preguntar/no (`cfgHtml` en Ajustes). Pruebas: `__pmAhora`, `__pmPausa`, `__pmEspera`. `__pasarManana` |
| `revisarAppDiag` | — | `revisarApp()` diagnóstico (menú › Versión). **Último script: insertá antes.** |

Otros globals útiles:
- `__sync` (estado de carga de colecciones), `fmt(n, dec)` (formato es-AR con caché `var __fmtNum`), `norm()`;
- `abrirHojaImpresion`, `familiaDeCodigo`, `stockActual`;
- `fbOtAdd/fbOtUpdate`, `fbReservaActualizar`, `fbAddMovimiento`, `fbGuardarProductoCatalogo`.

---

## 9. Flujos clave

- **Orden de trabajo:**
  1. La oficina elige obra, cuadrilla/personal, vehículo (sale solo por quién tiene a cargo) y tareas del catálogo (baremo) o a mano. Cada tarea muestra «Quedan N de T» (cálculo − hecho − asignado), con opciones «¿Quién?» (toda la cuadrilla / una persona / ✂ repartir).
  2. Emitir → aviso a cada persona (campanita + push).
  3. La cuadrilla en Mis tareas: fotos por unidad/toma (hasta 4 por columna, caja o toma; la de uno vale para todos), medidas, «Se hizo», **Enviar**.
  4. La oficina **cierra**: carga lo hecho (`cierre.hecho`, `hechoPersona`, horas) → puntos fijados en `cierre.puntos`, avanza el itemizado de la obra, push «⭐ Puntos aprobados».
  - **Puntos:** tarea asignada → esa persona; repartida → por lo hecho; de un grupo («👥 Elegir quiénes», v094) → solo entre ellos por rol × horas; por equipos (v097) → entre equipos según lo hecho (`cierre.hechoEquipo`) y adentro por rol × horas; el resto por peso de rol × horas (Oficial 1 · Medio oficial 0,8 · Ayudante 0,6 · Capataz 1 · Chofer 0,4 · Sereno 0,2). Quincenas: 1–15 y 16–fin de mes.
- **Fotos:** cámara de la app (`#emaCam`, un toque = guardada) → sello → `fotosNube` (R2) o Firestore → `adjuntos` + `fotosObra` + `campo.fotos` de la orden (mini 72 px).
  - Sin señal: cola local y reintento.
  - Rechazo por permiso: queda en el celu con el motivo exacto, reintenta, y la oficina tiene «Preparar» / «🔧 Arreglar vínculos».
- **Pañol:** entradas/salidas con comprobante; stock = base + movimientos.
  - Reservas apartan stock (salvo `solicitada`).
  - Lista de compras = bajo mínimo + todo material que alguna vez se cargó y hoy está en 0 («⛔ se acabó», sugerido = última entrada).
- **Calculadora → itemizado → avance → certificación:** el cómputo guarda `form` (se puede editar).
  - `epecPreviaDe(obra)` mapea el cómputo a ítems del Anexo I.
  - El avance total sale del itemizado (lo hecho pesado por K).
- **Entrada de la cuadrilla (v086):** primero sus órdenes, después lo demás por tandas (ver `cuadrillaLiviana`). En ese modo `ordenesTrabajo` tiene **solo las de esa persona**: no armes nada para la cuadrilla que necesite las órdenes de otros.
- **Ubicación en vivo:** solo cuadrilla/operario, solo en el horario de `configEquipo/ubicacion`. La oficina la ve en el Mapa. Fuera de horario se escribe `activo:false`.
- **Revisar versión / actualizar:**
  - fetch `index.html` con `cache:"no-cache"` (ETag);
  - aviso «✨ Hay una versión nueva · Actualizar»;
  - en web, sw.js cache-first con revalidación (`ema-v065-app`); en el APK, el cargador.

---

## 10. Diseño (tema «Cristal», ver detalles en el código: `<style id="temaCristal">`)

- **Colores** (siempre por variable):
  - **v144 · estilo «V1 · Turquesa del logo»** (`<style id="estiloV1Css">`, elegido por Ángel): `--navy #28285E` (acciones, activos; botones principales siguen navy), `--navy-2 #1F5F86` (degradé de los botones), `--teal #89C2DB` (turquesa del logo: solo detalles, **nunca botones ni con letra blanca**), turquesa hondo `#1E6F91` (acentos de tarjetas, links, barras), `--bg #EAF2F7`;
  - portadas (Inicio Ejecutivo y «Hoy» de la cuadrilla): degradé `#17173D → #222459 → #1F4C78 → #1F6F91` con brillo `#89C2DB`;
  - texto `#0D1424` / `--text-soft #475569` / `--text-3 #6E7C93`;
  - `--verde #34C759`, `--amber #FF9F0A`, `--danger #FF3B30`.
- **Letras (v144):** **Plus Jakarta Sans** en toda la app (texto 14,5/15 px, títulos 700–800) y **JetBrains Mono** (números, códigos, encabezados de tabla, `tabular-nums`), las dos **incrustadas** (woff2 latín en base64, `font-display:swap`, ≈ 58 KB: andan sin internet). Inter solo queda pedida a Google para el **sello de las fotos** (no cambia) y las hojas A4 que se abren aparte.
- **Formato** es-AR: `01/10/2026`, `1.050,00`, `$ 1.050,00`, `120 m`, `9 Un.`.
- **Piezas:** tarjetas de vidrio (blanco 70 %, borde 24 px), `.btn-primary` píldora azul (mín. 44 px), `.btn-ghost`, `.subtabs/.subtab`, `.chip`, tablas sin rayado, avisos `#avisoApp` (no `alert()`).
- **Celular** (≤640 px):
  - una columna, todo tocable de 44 px o más;
  - tablas → `.tabla-tarjetas`;
  - acordeón en la calculadora, barra flotante abajo;
  - **nunca scroll horizontal**.
- **Impresión:** blanco, logo como `<img class="logo-impreso">` (no fondo CSS), sin menú/botones/versión, A4, firmas al pie.
- Sin modo oscuro (`color-scheme: only light`).
- Textos en rioplatense de obra: «Sacar foto», «Hacer vale de salida». Nombres de plaza en MAYÚSCULAS como el pliego, con `ID 4026`.
- **v145 · mayúsculas prolijas** (solo cómo se muestra, `window.__fmtNombre`): obra/plaza SIEMPRE EN MAYÚSCULAS; barrio, dirección y personas en Tipo Título («Bº Ciudad de Mis Sueños», «Eridanus 1416», «Juan Pérez») con las palabras chicas en minúscula (de, del, la, las, los, y, e…) salvo al principio y respetando siglas, números y romanos (ID, Bº, S.A., 1416, II). Botones y títulos en oración normal («Calcular materiales»); en mayúsculas solo los rótulos chicos tipo «OBRAS · 43». El buscador no cambia. Para dejar la base prolija: Obras › «🔤 Ordenar mayúsculas en la base» (admin, con «Sí»).
- **v145 · degradé de las acciones** `--grad-accion` (`linear-gradient(135deg,#28285E,#1F5F86)`, el de «Calcular materiales»): botones primarios, subpestañas y chips activos, insignias, barras y botones redondos que eran azul sólido; letra blanca (AA en los dos extremos). No va en textos navy sobre blanco, portadas, cámara, impresión ni con el turquesa claro `#89C2DB` con letra blanca.
- **Compu** (más de 900 px, v139): todo a lo ancho. Pantallas hasta 1960 px con 32 px a los costados; Inicio hasta 2200 px con las tarjetas en 2/3/4 columnas (masonry con `column-count`, no grid); Perfil en 2–3 columnas; el Asistente es un panel lateral de alto completo que corre el contenido. Nada de `gap` en flex (Chrome 84+): grid o márgenes.
- Un cambio de diseño no cambia ids, clases ni JS.

---

## 11. Dominio técnico (alumbrado público, contrato de plazas)

### 11.1 Contrato LPE 5589
- **Módulo base** (Art. 05) = PAT completa (AP-TC-005/006) de una columna metálica de 7 m con capuchón y 1 brazo de 0,425 m con LED.
  - Valor del pliego: **$281.998,71 sin IVA** ($341.218,44 con IVA). **La app usa $296.126,45 sin IVA** (precio de oferta). Precio de cada ítem = **K × módulo**.
- Anexo I con 92 ítems en K (Nota Aclaratoria N° 1, 31/08/2026):
  - ítems 1–82 iguales al itemizado de la Municipalidad («ITEMIZADO PLAZAS 17/06/2026»);
  - 83.1–89 son provisiones por eventualidad.
- Plazo 4 meses, certificación mensual.
- Mínimo exigido: 8 cuadrillas de 2, 4 hidroelevadores de más de 10 m, 1 camión grúa, 3 camionetas.
- Penalidades: punto = 1 % de la facturación mensual; rehacer trabajo mal hecho = multa de 3× su valor.

### 11.2 Ítems principales (numeración 2026)
- **Columnas** (compuestos: relevamiento, excavación, fundación, izaje, acometida subterránea, luminaria, reparación, poda):
  - metálica 1/2/3 brazos = **1/2/3**, 10 m / 4 brazos = **4** (K 3,89 · 4,00 · 4,17 · 4,56);
  - PRFV = **5/6/7/8** (K 3,19 · 3,37 · 3,55 · 4,02).
  - La metálica incluye torta y PAT con medición. **En PRFV la PAT se cobra aparte** (74 tomacable, 75 dispersor, 77 caño H°G°, 81 medición + provisiones 87/88).
  - Las de 10 m van siempre a 4/8. Los vínculos de 10 m se descuentan antes de repartir los de 7 m (v066).
- **Resto:**
  - 9/10 tablero aéreo/a nivel; 11/12 acometida aérea/subterránea; 13 apoyo PRFV; 14 tablero de transición;
  - 15–20 zanjeo (0,60/1,00 × natural/baldosa/hormigón); 21–24 cruce (tunelera/tierra/hormigón/asfalto);
  - 25–40 cable por calibre: «Provisión y tendido en zanja de Cable Cu…» → paga el **cable**, con la subida y bajada por las columnas (regla de Ángel, v102: si el ítem paga zanja, solo metros de zanja; si paga el cable, con las ganancias). La zanja se cobra en 15–20. El 30 es «instalado en columna»; 41 reacondicionamiento columna; 42 acometida subterránea nueva en columna metálica existente (K 1,77); 43 aplomado; 44 luminaria sobre existente;
  - 45–49 retiros; 50–67 protecciones; 62 BPN 4 / **63 BPN 6**; 64 fotocontrol; 68 fusible 2–10 A; 73 apoya escalera;
  - 75 dispersor; 78/79 empalmes; 80 aislación; 81 medición PAT; 82 poda.
- **Provisiones:** 83.1 col. metálica 7 m K 2,64 · 83.2 10 m K 4,37 · 84.1 PRFV 7 m K 2,75 · 84.2 10 m K 4,56 · 85.1 LED 75 W K 0,81 · 85.2 LED 180 W K 1,27 · 86 cable 3×1,5 K 0,02/m · 87 cable V/A 10 mm² 0,02/m · 88 jabalina K 0,09 · 89 tablero aéreo K 16,06.
- **Plazas ya ejecutadas:** manda lo certificado (`window.CERTIF_MUNI`).
- Referencia de nombres de materiales: pliego **LP 21478** (Zona V Oeste), ítem 15.xx. Ej.: 15.35 BPN, 15.38/39/40 morsetos 1995/6, /4, /3, 15.67 dispersor Ø14,6×1500 IRAM 2309, 15.59 rack MN 482 L. **No son los K de plazas.**

### 11.3 Reglas de la calculadora (acordadas con Ángel)
- **PAT:**
  - PRFV: jabalinas = circuitos + tableros (1 al final de cada circuito + 1 por tablero). Metálica: columnas + tableros.
  - Cada jabalina: 1 tomacable + 1 medición (81) + puntera TIF 10.
  - Cable 1×10 V/A: 10 m por tablero + 7 m por circuito (PRFV) o 4 m por columna (metálica).
  - Cada tablero cuenta solo sus circuitos.
- **BPN (desde v067): todas de 6 mm²** (2009, ítem 63). Neutro celeste 2008 y tierra verde 2010 también de 6.
  - Las punteras TIF siguen el **calibre del cable**, no la bornera.
  - Caja PRFV (TC-PRFV-01/02): 3 grises, 2 celestes, 2 verdes (3 en la columna con jabalina), 2 portafusibles, 1 separador, puente peine; 1 m de Cu 4×4 (1010) por columna + 6 punteras TIF 4.
  - Metálica: 1 portafusible y 1 bornera fase+neutro por luminaria.
- **Fusibles:** 2 A por artefacto, cilíndrico 10×38 (3017; el 3014 de 8,5×31,5 **no entra** en la tabaquera 10×38 3053). Simple 2 + vacío · doble 2+2 · triple 4+2 · cuádruple 4+4 (4 A = 3073).
- **Fundación** H-13 (1:2,5:4; 5,2 bolsas, 0,55 arena, 0,80 piedra, 170 L agua por m³):
  - PRFV 7 m: 0,60×0,60×1,20; 10 m: 0,80×0,80×1,30. **El código y la guía usan 0,403 / 0,728 m³** (antes decía acá 0,4057 / 0,8035): **a confirmar** cuál vale;
  - molde PVC = Ø base + 50 (247 / 403 mm; comercial Ø250 / Ø400, si no Ø450);
  - telgopor a 350 mm del fondo, desagüe PVC Ø25,4, arena hasta −50 mm y sello de 50 mm.
- **Columnas PRFV:**
  - 7 m: AP-C-033-A, Ø base 197. 10 m: AP-C-033-B, Ø base 353.
  - Cajas borneras a 3,50 m del piso. Entre cajas **solo cable 4×4 XLPE, sin caño**.
- **Cable de subida 3×1,5:** en el código = altura − caja + brazo + 0,60 (4,5 / 5,5 / 8,1 m). Antes decía acá «7 m por artefacto + max(0, brazo − 0,400)»: **a confirmar** con Ángel.
- **Ganancia del troncal** = subidas × (en PRFV: **3,50 m hasta la caja + 0,50 m = 4 m**, v103, Ángel; metálica 5 m). Subidas = 2 × columnas − circuitos (en el cableado por circuitos, por punto). El material del troncal lleva **5 % de reserva**; el ítem 25–40 cobra zanja + subidas sin la reserva (`itemCant`).
- **Alambre de atar (1001, en kg):** 2 m por atadura en cada aislador MN 17 / MN 16, galvanizado N° 14 ≈ 25 g/m → ≈ 0,05 kg por aislador (**a confirmar**: calculado por vueltas, no hay dato publicado).
- **Unidades:** los cables siempre en **metros**; el alambre en **kg** (v103).
- **Mismo material, otro código** (Ángel): 7010 = 1032, 3038 = 3039, 7005 = 7006 (`__alternativasMismo`). 7004–7007 de baja (la tierra va verde: usar 2010).
- **Vínculos:** brazo 400 mm (AP-C-008, ítems LP 10.15/16/17, cuádruple 10.20). 0,425 = capuchón triple (criterio de obra).
- **Zanja** (AP-TC-001):
  - tapada 0,60 + 0,15 → excavar 0,75 m; anchos 200/400/600 (1/2/3 conductores);
  - arena 5+5 cm, malla a 30 cm;
  - ladrillo solo si va enterrado directo (no en PEAD Ø50); pegotes 1,00×0,20×0,05.
- **Cruce de calzada** (AP-TC-002): ancho 0,50, tapada 1,00 (vereda 0,50), **2 caños PVC Ø110** (1 de reserva), hormigón pobre 0,15, cámaras 40×40, reposición H-21 0,20.
  - Contradice el ítem 5.01 (1 Ø160): **a confirmar con Inspección**.
- **Base de tablero a nivel** (AP-TC-007): tipo A 0,900×0,400 / B 0,635×0,400, alto 0,60, caño de ingreso PVC Ø90 y salida PEAD Ø50 por circuito, 4 anclajes 1/2".
- **Acometida** (AP-T-019): poste a 2,50 m del cordón, vano máx. 10 m.
  - Cables: preensamblado 3×1×25/50 · piloto Al 4×1×25 · Cu 4×16 autoportante · Cu 4×16 XLPE/LSZH (vigente).
  - Morsetos: 1995/3 (PKD-16) 25–95 · 1995/6 (PKD-14 bimetálico) bajada 4–16 · 1995/4 solo derivación aérea (no en plaza subterránea).
  - Terminal de ojal por conductor al NH.
- **Prensacables** (Ø IRAM 2178-1): 1×10 → 1/2"; 3×1,5 y 4×2,5 → 3/4"; 4×6 → 7/8"; 4×10 → 1"; Cu 4×16 → 1 1/4".
- **Tablero de plaza:** comprado armado. Tablero en poste a 5 m o más (solo en poste).
- **Barrio** (red aérea): calculadora propia (luminarias en poste, apoyos, preensamblado, tablero aéreo, transición AP-TC-024, PAT de red cada 200 m). Sin itemizado de barrio todavía.
- **Preguntas abiertas** (no decidir solo):
  - Chamical (metálica) certificó 3 dispersores;
  - ítem 74 tomacable no aparece en lo certificado;
  - 75/81 en metálicas;
  - ítems 30 y 64;
  - provisiones;
  - interruptores 50/56/59;
  - apoya escalera con tablero a nivel;
  - cómo cargar columnas existentes;
  - TN-C vs TN-S según proyecto.

### 11.4 Proceso constructivo (plaza PRFV)
Replanteo → fundaciones (fraguado 72 h) → zanja y tendido → galpón (armar vínculos y probar artefactos) → izaje, tablerito, aplomado y sellado → PAT → poste y tablero → acometida → prueba de encendido → cierre (conforme a obra, planillas de PAT, certificado de instalación apta).

### 11.5 Etapas del avance (pesos)
Pozo 10 · zanjeo 10 · tirada de cable 10 · fundaciones 10 · izaje 10 · vínculos 10 · poste PRFV 10 · tablero 10 · sellos 10 · limpieza y pintura 5 · inspección municipal 3 · desmonte 2. Se tildan solas desde el itemizado.

### 11.6 Baremo
- Puntos = HH × D (1 punto = 1 hora-hombre efectiva, D 1,00–1,80).
- Tareas en `configEquipo/baremo`. Tareas nuevas de la v072 (puntos «a confirmar»): excavación de pozos 2,5, hormigonado 2,5, pozo del apoyo PRFV del tablero 2.

### 11.7 Mapa
Colores de los pines por avance: gris sin empezar · rojo menos del 30 % · amarillo 30–59 % · azul 60–99 % · verde 100 %.

### 11.8 Comprobantes
Salida «Vale» S-0001… · entrada E-0001… · remito de herramienta RH-… · ingreso RI-… · reserva R-0001… · OT-AAAA-NNN. Se anulan, no se borran. El número no se reutiliza.

### 11.9 Códigos por familia
1xxx cables · 2xxx borneras/terminales · 3xxx protección y comando · 4xxx herrajes/morsetería · 5xxx caños · 6xxx columnas/vínculos/postes/luminarias · 7xxx PAT · 8xxx obra civil · 9xxx varios.

Ejemplos:
- 6006 columna metálica 7 m · 6005 de 10 m · 6010 luminaria (Un.) · 6021 vínculo capuchón 3 artefactos 400 mm;
- 7015 jabalina (Un.) · 7010 cable 1×10 (m) · 1016 preensamblado (m) · 1010 Cu 4×4;
- 2007 BPN 4 (ya no se usa, no se borra) · 2009 BPN 6 · 2008 celeste · 2010 verde · 2027 peine BPN 6 · 2031 TIF 4;
- 3017 fusible 10×38 2 A · 3073 fusible 10×38 4 A · 3053 portafusible tabaquera.

---

## 12. Pruebas

- **Herramientas:** Playwright + Chromium, sin internet, con Firebase falso (`firebase_stub.js`, guarda en localStorage, rechaza docs de más de 1 MiB, simula sin red con `__stubSinRed`) y reglas simuladas (`reglas_stub.js`, réplica de las reglas reales).
- **Arnés `h.js`:**
  - `abrir({sesion:'admin'|'pedro'|'juan'|…, cel, dpr, datos: baseDatos(), espera, reglas, https, leaflet, demora:{col:ms}, mtNuevo, rsObra, lgPleg})`, `otraPagina()`, `prueba(nombre)`;
  - la app a probar sale de `process.env.APP` (y `APPDIR` para sw.js/app/camara);
  - **las rutas están fijas del entorno anterior** (`/home/claude/...`, `/opt/pw-browsers/chromium`, Leaflet local en `/home/claude/v40/lib/...`): ajustalas o instalá `playwright` y `leaflet` con npm.
- **Correr:** `APP=ruta/index.html node t_v084.js` (PC) y `… node t_v084.js cel` (celular 390×844). Cada prueba imprime `RESULTADO vNNN: X/Y OK`.
- **Batería completa** = todas las `t_*.js` en PC y en celular. Corré en tandas (Chromium se pone lento con todo junto). Algunas son sensibles a tiempos si la máquina está cargada (`t_v026`, `t_v037`, `t_v073`, `t_v076`); si fallan, repetí solas antes de concluir.
- **Modos de compatibilidad** que el arnés pone en las pruebas viejas:
  - `__puntosPisoFijo='2000-01-01'` (los puntos de cualquier fecha) salvo `pisoReal:true`;
  - `__avanceEntero=true` (el cierre de antes: la tarea completa el ítem) salvo `porPartes:true`;
  - `__mtVistaTodas=true` (Mis tareas desplegado) salvo `mtNuevo:true`;
  - `ema.rs.porObra=0` salvo `rsObra:true`;
  - `__lgPlegTodoAbierto=true` salvo `lgPleg:true`;
  - `__ofCompat=true` («Llenar orden» todo junto, sin cartel) salvo `ofPasos:true`;
  - `__mtTarjetasNo=true` (Mis tareas con todas las tareas juntas) salvo `tarjetas:true`.
  - `__navNo` / `__inicioViejo` (v135) salvo `nav:true` / `inicio:true`;
  - v136: `__iaCompat` (asistente con Sonnet y el cierre de antes; v137: además el contexto en el system como antes y sin effort «low» para datos simples) salvo `iaPro:true`, `__supNoIA` (sin la revisión con IA de las 12/18 h) salvo `supervisor:true`, `__guiasNo` (guías de antes) salvo `guias:true`; rutas `app.test/guias/` (desde `APPDIR/guias` u `op.guiasDir`).
- **v143:** `__sugNo` (sin la orden sugerida, su tarjeta, la línea del tablero, el recordatorio de las 7 ni las ausencias) salvo `sugerida:true`; `t_v143` usa `datos143.js` (Los Álamos, Las Acacias, Plaza del Sol, Barrio San Vicente sin cálculo; equipo civil, ausencia de Lucas, vehículos con tipo y lugares, reserva con faltante, 3 cierres medidos) y simula el Worker `ema-ia` (`/ia`). Prueba del Worker de avisos: `node workers/probar_ema_avisos.mjs`.
- **v146:** `__v146No` (sin cierre por voz, pedido de compras, tablero del dueño ni pase a mañana) salvo `v146:true`; `t_v146` usa `datos146.js` (sobre `datos143`; `op.pasar` / `op.preguntar` para el pase a mañana), Worker simulado (`/ia`, `/mio`, `/uso`), `antes` con `__pmPausa` y `__cvSinMic`. Con `REGLAS=1` pasa igual (sin reglas nuevas).
- **v145:** `__v145No` (sin certificación, material contra avance, gente sin tarea, reglas de mínimo 2/equipos habituales/vínculos sin grúa ni mayúsculas prolijas) salvo `v145:true`; el degradé `--grad-accion` es CSS y se ve siempre. `t_v145` usa `datos145.js` (certificación, material, aprendizaje, gente sin tarea, mayúsculas) y `datos143.js` (sugerida y reglas); Worker del asistente simulado.
- **v144:** `__obraGpsNo` / `__camViejaNo` salvo `obraGps:true` / `camaraB:true`; `t_v144` usa `datos144.js` (Bulevares, San Pablo, Las Acacias, Los Álamos, una obra sin ubicación y un barrio; Juan con orden hoy en Bulevares y mañana en Las Acacias) con GPS simulado (`ctx.setGeolocation`) y la cámara de mentira; cuenta los toques del caso normal (1). Ojo: Chromium devuelve la última posición hasta 30 s (`maximumAge`), por eso la prueba no cambia de lugar justo antes de «Llegué».
- **v142:** `__crewViejo` (la cuadrilla con el Inicio y Mis tareas de antes) salvo `crew:true`; `t_v142` usa `datos142.js` (Plaza Los Álamos, Juan y Pedro, reserva R-0045, herramientas) y una cámara de mentira (canvas) para la cámara de la app.
- **v141:** con `__iaCompat` (pruebas viejas) el asistente sigue viéndolo solo admin/oficina de entrada y no pide `/mio` ni `/uso`; `t_v141` (con `iaPro:true`) simula el Worker v3-ia (`/ia`, `/mio`, `/uso`) y prueba cada rol (cuadrilla `raul`, pañol `pan`, mirar `mir`, oficina `ofi`, admin). La prueba del Worker es `node workers/probar_ema_ia.mjs` (simula Google, Firestore REST y Claude).
- **v138:** `t_v138` prueba el «atrás» con `page.goBack()` y el remito en PDF / 3 fotos / 30 renglones.
- **v137:** `t_v137` decodifica los QR con jsQR (`pruebas/lib/jsQR.js`, licencia Apache-2.0, solo para las pruebas; `npm i jsqr@1.4.0`) y simula el lector de la app con `window.Capacitor.Plugins.BarcodeScanner`.
- **Señal lenta simulada (v086):** `window.__stubKbps = 2000` (en `firebase_stub.js`): cada consulta tarda lo que tarda bajar sus datos por un caño compartido. Lo usa `t_v086`.
- **Hora del contenedor (v145/v146):** algunas pruebas (`t_v105`, `t_v142`, `t_v143`) arman las fechas de los datos en UTC y la app usa la hora local: fallan en cadena cuando la fecha de Córdoba y la de UTC no coinciden. Corré la batería con `TZ=America/Argentina/Cordoba` hasta las 20:59 de Córdoba y con `TZ=UTC` desde las 21:00 (comprobado: 10/10, 49/49 y 78/78). En los celus no pasa.
- **`t_circuito`** (v120, v123): el circuito completo con todo lo nuevo prendido (oficina arma por pasos → cuadrilla en el celu: seguridad, fotos por columna, «📤 Listo, enviar esta tarea» con la hora → la orden se envía sola → oficina cierra → puntos y avance). Correrlo siempre.
- `t_v083` quedó reemplazada por `t_v084` (buscaba el cartel viejo de ubicación).
- **Cada versión nueva suma su `t_vNNN.js`.** Si cambia un comportamiento probado, actualizá la prueba vieja y decí por qué.

---

## 13. Lecciones y trampas conocidas

- **`const`/`let` con TDZ:** si una función se llama antes de la línea de su variable de módulo, rompe. Para cachés globales usá `var` (pasó con `__fmtNum` en v084).
- **html2canvas dibuja el `<noscript>`:** sacalo (y `template`) del clon antes de armar el PDF.
- **SVG dentro del mapa:** la regla global `max-width:100%` los aplastaba a 0. Los colores van como valores reales, no `var()`, dentro de SVG.
- **Envolturas con marca (v123):** `if (o.__x) return; … n.__x = 1; window.F = n` sin pasar las marcas de `o` hace que dos módulos que revisan cada tanto se envuelvan entre ellos para siempre (la app se pone lenta y cada acción corre N veces). Usá `window.__heredar(n, window.F)` o `Object.keys(o)` antes de asignar.
- **Mis tareas** (`ordenesCampo`) se redibuja nodo por nodo: chips, notas y «por» van dentro de las plantillas (`__equipoChips`, etc.).
- **Bordes del celular (v093):** el APK es «de borde a borde». La página tiene que llevar `viewport-fit=cover` y todo lo fijo arriba o abajo usar `env(safe-area-inset-top/bottom)`. Si no, queda debajo del reloj o de los botones de Android.
- **Menú lateral:** el panel es flex-column. Los bloques agregados necesitan `flex:none` o se aplastan y el texto se desborda (pasó en v085).
- **Celulares viejos:** Chrome 80. El «Sitio para computadoras» de Motorola tiene aviso propio.
- **Fotos con la cámara del teléfono:** Android puede cerrar la app y la foto se pierde. Preferí la cámara de la app.
- **Shell:** nunca `pkill -f "texto"` con un texto que esté en el propio comando (mata la consola).
- No hay emulador de Firestore disponible: las reglas se prueban con `reglas_stub.js`. Si cambiás reglas, cambiá también el stub.
- Desde la nube no se llega a `*.workers.dev`: las pruebas reales de Workers las hace Ángel.

---

## 14. Checklist de entrega (cada versión)

1. Cambio hecho sobre el ORIGINAL de la última versión → ORIGINAL nuevo `NNN_AAAA-MM-DD_app-EMA_ORIGINAL.html` + `index.html` compactado (sello de versión actualizado).
2. Prueba nueva `t_vNNN.js` + batería completa en PC y celular, todo OK (o explicar lo que falla).
3. SHA-256 de los dos archivos.
4. Si hay reglas nuevas: `Reglas_Firestore_vNNN.txt` completas, y la app avisa si faltan.
5. Decirle a Ángel en 1–2 líneas qué cambió y **qué tiene que hacer él**:
   - subir `index.html` a GitHub (y `sw.js`/carpetas solo si cambiaron);
   - publicar reglas;
   - armar APK nuevo solo si cambió algo nativo.
6. Devolver el ORIGINAL (respaldo, no se sube) junto con el index.
7. Anotar la versión en el historial (SALEM lleva `Version_077_app.md` en el proyecto de claude.ai; si trabajás acá, dejá un `CHANGELOG.md` con pedido, cambios, pruebas y huellas).

---

## 15. Historial resumido de versiones (para entender por qué está cada cosa)

| Versión | Qué agregó |
|---|---|
| 005–011 | Guías, tipos constructivos, planos de obra, mapa liviano, herramientas, fichas técnicas |
| 012–018 | Calculadora de barrio, Gantt, códigos protegidos, precios $/U$S/IVA, receta de barrios, torta/vínculos |
| 019–021 | Láminas tipo plano, caja PRFV TC-PRFV-01/02 |
| 022–027 | Planos en las OT, presencia, nombre de obra único, reservas por aprobar, fechas vivas, imprimir en el celu, fotos por columna con nombre, login sin trabarse, revisión general |
| 028–031 | Una foto por unidad, fotos por tarea y medidas, sello + fotos sin señal + informe mensual, avisos |
| 032–037 | Cámara propia, compartir con ubicación, revisión de la calculadora, fotos a R2 |
| 038–048 | ZIP con GPS, faltantes en reservas, avance por tipo, mapa pro, quincenas, gastos pro, vehículos, legajos por tipo, avance por itemizado, puntos exactos, menú plegable |
| 049–055 | Personal de obra (cuadrilla/operario), push con la app cerrada, avisos vistos, sin stock, catálogo para la cuadrilla, itemizado por tipo, chequeo calculadora ↔ pañol |
| 056–064 | Cómputo con subíndices y semáforo, editar cómputo, cámara con nombres y GPS, imprimir reservas, remitos de herramientas, ofrecer otro material, legajo en el mapa, lista de materiales, ingreso de herramientas |
| 065–070 | Sin internet, columnas de 10 m, BPN 6, órdenes llenas (1 MB), permisos de fotos, reglas livianas |
| 071–076 | Carpeta EPEC, saldo de obra + reinicio de puntos, galería pro + Cámara EMA aparte, hoja de la cámara, celulares lentos (sw.js cache-first, Chrome 80), cuadrilla como equipo |
| 077–082 | Imprimir/PDF en la app, arranque por rol, repartir tareas, Mis tareas Hoy/Pendientes/Terminadas, reservas por obra + herramientas agrupadas, lista de compras + legajo plegable |
| 083 | Ubicación en vivo del personal (reglas v083) |
| 084 | Punto verde en el menú en vez del cartel, arranque más rápido, soporte del cargador del APK |
| 085 | La cajita de ubicación en el menú ya no se desborda; punto más adentro del botón |
| 086 | Entrada rápida para la cuadrilla: primero sus órdenes (y la cámara), el resto por tandas |
| 087 | La ubicación llega con el celular bloqueado (envío nativo + APK 1.2 con useLegacyBridge) |
| 088 | Junta la v086 de SALEM (abre al toque con la ficha, revisión de versión de 16 KB con `ema-version`) + 086/087 de Claude Code |
| 089 | Proyectista etapa 1: relevamiento en obra con GPS → plano, DXF Gauss-Krüger, planilla (solo oficina; reglas v089) |
| 090 | Proyectista con las piezas del diseño «Cristal» de la app + skill del proyecto `ema-app-alumbrado` |
| 091 | Proyectista con la barra de vidrio de la app + diagnóstico de la ubicación (por qué quedó «sin actualizar») |
| 092 | Proyectista con cálculos: Columnas, Eléctrico (caída por fasores, fases, protecciones), Luz (.ldt/.ies, punto por punto, zonas oscuras, radio útil), memoria de cálculo · Ubicación: el celular detecta cortes con la pantalla apagada, «Probar con el celu bloqueado», la oficina ve los cortes |
| 093 | La pantalla respeta los bordes del celular en el APK (reloj arriba, botones de Android abajo): `viewport-fit=cover` + `env(safe-area-inset-*)`; íconos del reloj oscuros |
| 094 | «👥 Elegir quiénes»: una tarea la hacen varias personas juntas (`ot.equipoTarea`), puntos solo entre ellas; «📋 Quién hace qué» en la orden |
| 095 | Catastro de Córdoba v6 de fondo en Proyectista (mapa, plano, PDF, DXF) + «Traer el borde de la plaza»; carpeta `catastro/v6` en GitHub |
| 096 | «📸 Avance» de cada orden en el tablero, en vivo (marcas, quién, medidas, fotos al visor, checklist, envíos); `__avanceOrden` |
| 097 | Varios equipos en una misma tarea con su cantidad (`ot.equipos`, `campo.marcasE`, `cierre.hechoEquipo`); puntos por equipo según lo hecho |
| 098 | «Quedan N de T» de la orden lee también el Avance de obra (itemizado, lo mayor entre las dos cosas); «¿Olvidaste tu contraseña o tu usuario?» en la entrada (`recuperarClave`) |
| 099 | Proyectista: tocar / mover / borrar puntos en el mapa y el plano, forma de los tramos (`punto.via`), dibujar el camino caminando, plano que se mueve y se acerca, ↶ Deshacer |
| 100 | Avance de obra limpio y gráfico (ítem por ítem por rubro, con colores); «🧾 Material: calculado vs. entregado» en el legajo (`legajoMaterial`) |
| 102 | Revisión completa (auditoría v101): columnas sin vínculo y 2 tableros en la orden, pasar el cálculo a la obra registrada, «Finalizada» única, obras ocultas en la plata, ganancia sin IVA, números de comprobante guardados, unidades del pañol (`porUnidad`), sustitutos, órdenes cerradas que siguen otro día, revertir avance al anular (`obraComputo`, `colasYNumeros`, `panolArreglos`, `ordenesArreglos`, `window.__obraFin`) |
| 103 | Respuestas de Ángel: mismo material con otro código, 7004–7007 de baja, cables en m y alambre en kg (con alambre por aislador), ganancia 3,5 + 0,5 m y 5 % de reserva, provisiones fuera del %, puntos desde el 01/11/2026 (`__puntosPiso`) |
| 104 | «📌 Seguimiento» de tareas en Órdenes (por persona y obra, darla hoy o a otro) y «↩ Sigue en obra» para lo que mandaron por error |
| 105 | «📅 Tareas de hoy» en Seguimiento; lo de hoy en obra cuenta como pendiente |
| 106 | Al cerrar la orden, «＋ Agregar a alguien que también fue» (`cierreIntegrante`) |
| 108 | Circuito de la obra: diccionario de 47 tareas claras (HH × dificultad), cierre por partes del ítem, «🔎 Diferencias con lo hecho» en el Itemizado (Sí/No), «Solo lo de esta obra» (`diccionarioTareas`, `circuitoObra`) |
| 107 | La cuadrilla ve y borra sus fotos: «📷 Mis fotos (N)» en la orden y «🗑 La última» en la cámara (`misFotos`) |
| 129 | Cierre: las horas de la cuadrilla en la fila y «✅ Aprobar» por tarea (puntos y avance al toque) o «Aprobar todo y cerrar» (`aprobarTarea`) |
| 131 | «🔧 Revisar el catálogo» del pañol (unidades, 7013 reutilizado, repetidos con unificación trazable; nada sin confirmar) y carrusel foto → 3D → plano en la ficha del material y de la herramienta, con la carpeta `materiales/` (`catalogoArreglos`, `materialesFichas`) |
| 132 | «✨ Asistente EMA»: preguntas, ubicación, órdenes completas, puntos, informes y acciones (orden, cierre, aviso) que se proponen con tarjeta y se hacen recién con «Sí», por los caminos de siempre; Worker `ema-ia` (`asistenteIa`) |
| 134 | El Asistente **edita** lo que cada uno puede (órdenes, cómputo nuevo de la Calculadora, datos de obra, vales/entradas/devoluciones/reservas del pañol, genérico) con tarjeta antes → después y «Sí», auditoría `asistente_editar`; la cuadrilla solo consulta. **Voz**: 🎤 dictar, 🔊 leer, 🗣 modo charla (plugins de la app 1.4 o el navegador). Datos del celular en `presencia.disp` para el diagnóstico |
| 135 | Diseño nuevo aprobado: Inicio «Ejecutivo» (admin/oficina), Inicio del pañolero, barra de abajo N1 en el celu con «Perfil», pantalla Perfil con huella y recordatorios (app 1.4) (`inicioPro`, `navBarra`, `perfilApp`) |
| 137 | Remito por foto con IA (la IA lee, la app propone el código, nada sin «Sí»), lector de códigos (EAN y QR) con código de barras por producto, etiquetas QR de herramientas, QR en todos los comprobantes e informes y `?doc=` / `?obra=` que abren cada cosa (`qrLib`, `codigosQr`, `remitoFoto`); Asistente con dictado en vivo y onda de rayitas, más «vivo» (busca aproximado, glosario del dictado, effort según la pregunta) y system fijo durante la charla |
| 138 | El botón «atrás» del celular y del navegador vuelve atrás: cierra lo abierto encima o vuelve a la pantalla anterior, en el Inicio la app va al fondo, «¿Salir sin guardar?» en formularios (`atrasApp`); remito con IA en PDF y de varias páginas, remitos largos con resumen y botón pegado abajo, «💲 Solo precios», «📜 Remitos cargados» y aviso de remito repetido |
| 139 | La app ocupa toda la pantalla en la compu: Inicio a todo lo ancho con 3/4 columnas, Perfil en columnas, Asistente como panel lateral de alto completo (se arrastra el borde) que deja ver la app al lado, pantallas hasta 1960 px (`v139PcCss`, `v139Pc`) |
| 140 | Remito «inteligente»: reconoce el remito ya cargado (con la IA o a mano, número escrito distinto, proveedor parecido), estado por renglón (✅ 🟠 💲 🆕 🔴) y propone «Cargar solo lo que falta» / «Solo los precios que faltan» / «Revisar renglón por renglón» sin duplicar stock; el dictado del Asistente ya no vuelve a escribir en la caja después de enviar |
| 141 | El Asistente para todos los roles, cada uno con lo suyo (la app recorta herramientas y datos antes de mandarlos: cuadrilla solo lo suyo y sin plata, pañol sin sueldos pero con precios de materiales, mirar solo lo general, oficina todo), «cómo se hace» con las guías, Sonnet barato para los roles de obra; topes por persona y día y freno del mes (80/95 de US$ 100) controlados por el Worker `ema-ia` v3-ia (rol leído de la base), ⚙ Límites, «Te quedan N preguntas hoy» y «Gastado este mes» |
| 144 | Las fotos caen en la obra donde están parados (el GPS elige la obra a ≤ 150 m aunque la orden sea de otra; «Es otra obra» con motivo; GPS malo → `ubicDudosa`; foto sin orden → aviso a la oficina; «Llegué» en otra obra pregunta), cámara «opción B · cámara primero» (1 toque), Supervisor «Fotos que parecen de otra obra» (Mover / Está bien) y «Obras sin ubicación»; el anillo del Inicio cuenta solo nuestra zona (A · Este, 18.407 módulos) (`obraGps`); estilo nuevo «V1 · Turquesa del logo» con Plus Jakarta Sans incrustada (`estiloV1Css`) |
| 146 | Cierre del día por voz (la oficina dicta, la app arma el cierre de cada orden con lo que mandó la cuadrilla y cierra con «Sí»), pedido de compras automático por proveedor (bajo mínimo + obras de los próximos 7 días, hoja A4, guardar y ver lo recibido), tablero del dueño (solo admin y habilitados, solo nuestra zona) y lo no terminado de hoy pasa solo a mañana a las 18:00 con «Deshacer» (`cierreVoz`, `pedidoCompras`, `tableroDueno`, `pasarManana`) |
| 145 | Certificación mensual automática (por obra y total, solo nuestra zona, con el avance de las órdenes del mes; sin fecha → para revisar; ejecutadas con lo certificado; provisiones aparte; PDF con QR y Excel; cerrar el mes con «Sí» de admin) (`certMensual`); material contra avance 🟢🟡🔴 en el legajo, 🧠 y el Supervisor, y material real por columna y tipo de obra que solo se anota para Ángel (`matAvance`); gente sin tarea cada día hábil (`sinTarea`); mínimo 2 en obra, equipos habituales y vínculos sin grúa (`sugReglas`); degradé de las acciones (`gradAccionCss`) y mayúsculas prolijas (`fmtNombre`) |
| 143 | Orden sugerida para mañana (la arma la app sin IA; nada sale sin «Emitir»): por obra, por persona y semana encadenada; qué falta, lo que quedó de ayer, fraguado, columnas siguientes, rendimientos de Ángel / medidos / diccionario, misma cuadrilla, equipo civil, ausencias, vehículos por tipo y lugares, falta material, puntos de Llenar orden; emitir por Llenar orden; recordatorio de las 7:00 (Worker `ema-avisos` v143-hora); plan para la inspección; «🧠 Lo que aprende la app»; el asistente la lee, la revisa y propone cambios (`ordenSugerida`) |
| 142 | La cuadrilla nueva: «Modo obra» con un solo botón (Llegué → Foto · Col N → Terminé) y el recorrido del día: Hoy, la orden, seguridad con foto, antes de salir (material y herramientas), cómo llegar, falta material, ayuda (asistente, cómo se hace en el paso, llamar), fin del día, puntos y sin señal; por dentro lo mismo que Mis tareas (`cuadrillaDia`) |
| 136 | Inicio sin encimar y con el borde de arriba, campanita de línea, barra de abajo deslizable (B), Asistente con Opus 5.5 (Fable/Sonnet en ⚙, historia solo-agregar, respaldo del servidor), `armar_pdf`, cierre rápido, «🩺 Supervisor» (sin IA + parte con IA 12/18 h), Guías nuevas (carpeta `guias/`); Worker `ema-ia` v2-ia (`v136Ui`, `supervisor`, `guiasNuevas`) |
| 133 | Asistente «pro»: Sonnet para todo, lee todo lo que la app tiene (cómputos de la Calculadora con su formulario, itemizado, pañol, gastos, planos…), cruza fuentes con «diferencias», vuelve a calcular, mira planos y fotos, diagnostica usuarios y celulares, corrige el itemizado y mueve fotos a la obra correcta por el GPS (con tarjeta y «Sí»); «📷 Fotos sin obra» en Obras |
| 128 | En el cierre, por tarea: repartir sus puntos, pasar lo que falta a otro día y «Era otra tarea» (`cierreTarea`); fotos de la tarea más rápidas (`fotoRapida`); «Asignar igual» / «⚡ Cerrar esa tarea» para lo que está en una orden sin cerrar (`tareaSinCerrar`); «Unir» que no se reabre (`unirSeguro`, reglas v128) |
| 127 | Ver y corregir los puntos de una orden cerrada (tablero, Historial, Producción › persona › obra › orden) (`puntosEditar`) |
| 126 | Una sola orden por obra y por día: «Sumar a la OT-xxx» al emitir y «Unir en una» las repetidas (`unaObra`) |
| 125 | La cuadrilla saca fotos de cualquier obra desde la Cámara, aunque no tenga orden (reglas v125: `fotoLibre`) |
| 124 | Tablero de órdenes por subíndices: Hoy · Para revisar y cerrar · Próximas (calendario) · Sin cerrar · Cerradas · Anuladas (`tableroSub`) |
| 123 | La cuadrilla manda cada tarea apenas la termina: «Se hizo» con la hora o «No se hizo» con el porqué, en verde o rojo; la orden se envía sola (`envioTarea`) |
| 122 | Cambiar el orden de las tareas de la orden (`ordenTareas`); la orden sale aunque falte el nombre de la cuadrilla y «Emitir» no se cuelga con señal lenta (`emitirSeguro`) |
| 121 | Hora de inicio y fin de cada tarea obligatoria para la cuadrilla (`horasTarea`), personas en el buscador del Mapa (`mapaPersonas`), «Personal en vivo» abajo |
| 120 | Revisión del circuito de la cuadrilla (`t_circuito`: oficina → cuadrilla → cierre); «Órdenes que seguís» compacta; barra de «Llenar orden» opaca; nombres de columna completos en las fotos |
| 119 | Editar sin pisar órdenes viejas (`edicionClara`), calendario y elegir qué imprimir en Planificación (`planCalendario`), sugerencias propias en el celu (`sugerencias`), buscador de obra sin lista, cartel de pendientes solo con botón, franja celeste por obra |
| 117 | Menos lecturas: personal en vivo solo con el Mapa abierto, contador de lecturas en menú › Versión (`lecturasCuenta`); 👁 Ver orden pasa a «Llenar orden» |
| 116 | «Compartir» abre WhatsApp/Drive en la app de Android (`compartirApp`: `navigator.share` sobre el plugin Share); resumen de «Llenar orden» opaco |
| 115 | Avisos con la app cerrada en la app de Android: Worker `ema-avisos` manda por FCM (`workers/ema-avisos.js`), `FCM_LISTO` prendido |
| 114 | Ahorro de batería: los relojitos corren como mucho 1 vez por minuto con la app fuera de la vista (`relojitosAhorro`) |
| 113 | Una sola forma de cada cosa: Cierre del día por el mismo cierre, Buscar dentro de Seguimiento, un solo informe mensual, vehículos en un lugar; responsable de oficina con «Órdenes que seguís» (`cierreDiaUnico`, `unirRepetidos`, `supervisorOt`) |
| 112 | «Llenar orden» por pasos con resumen y puntos por persona, cartel de pendientes, obras y gente con un toque; envío de la cuadrilla combinado y un solo aviso; tareas de barrio y reclamos; «＋ Crear tarea» (`ordenNueva`, `envioEquipo`, `tareaNueva`) |
| 111 | Cierre: 0 horas = 0 puntos, puntos a mano con «Te quedan N para repartir», «✕ No fue» (`cierreGente`) |
| 110 | App de Android 1.3 completa: abrir el PDF al bajarlo, imprimir directo, fotos que se recuperan si Android cierra la app, avisos FCM (dormidos hasta el Worker), lector QR (`androidPro`) |
| 109 | Bajar y compartir PDF (y planillas, ZIP, DXF) en la app de Android: APK 1.3 con Filesystem + Share (`archivosApp`) |
| 101 | Alternativas del pañol debajo de lo que falta en «📦 Material de esta obra» (🟢 casi igual / 🟡 sirve con diferencias, con la norma) y «Pedir esta en su lugar»; «Calculadora ↔ pañol» con la misma comparación (`alternativas`) |

---

## 16. Pendientes conocidos (preguntar a Ángel antes de encarar)

- **v146, quedó para después:** el cartel «Actualizado HH:MM · N tareas pasaron a mañana» dentro de la hoja de la orden sugerida (hoy el aviso sale abajo, con «Deshacer»); el borrador de la sugerida es del aparato que tomó el turno (los otros ven lo que quedó de ayer por el motor de la v143).

- Confirmar en celulares reales el APK 1.1 (Moto g24 power: pantalla negra/velocidad). Si el login falla en el APK, revisar si la API key de Firebase tiene restricción por dominio (`https://localhost`).
- Push nativo (FCM), v115: el Worker `ema-avisos` v115 (`workers/ema-avisos.js`) manda por FCM HTTP v1 y el index lo tiene prendido. Falta confirmar en celulares reales que Ángel pegó el Worker (en `/salud`, `v115-fcm`) y que la API FCM V1 está habilitada.
- Lista de compras cortada en el celular (tabla `#cardStockCompras` con min-width 620 px).
- **Ítem propio por tarea** (idea de Ángel, v098): que cada tarea del baremo tenga un ítem propio, aunque se llame distinto, para que el avance de obra la descuente también (hoy excavación, hormigonado, BPN, sellado y vínculos cuentan solo por las órdenes). **No hacer sin pedido.**
- Calculadora ↔ pañol: v101 hizo las **alternativas** (no une códigos: Ángel aclaró que el 1019 y el 1025 son 3×1,5 pero de distinto origen/norma). Siguen pendientes, **sin pedido**: equivalencias guardadas en la base (hoy los m por rollo quedan en el aparato), kits (prensacable 5027 = 5024 + 5032), botón «No es el mismo» para descartar avisos, y que la reserva ofrezca la alternativa cuando el pañol no tiene. Dudas abiertas: si 7004–7007 «Borne de puesta a tierra 6 mm²» son las BPN; cómo se cuenta el 1009 (4×2,5: el catálogo dice Un.).
- Paquetes de tableros en el pañol (esperando el Excel de las planillas).
- **Cupo de Firestore (v117):** el 04/11/2026 el plan Spark cortó con 429 (lecturas del día). Con el cupo vencido también fallan las escrituras, porque las reglas hacen `get()`. Opciones: bajar lecturas (ver el contador de cada aparato) y/o pasar a Blaze con aviso de gasto (lo decide Ángel).
- `setInterval` permanentes (unos 66): desde la v114 `relojitosAhorro` los frena a 1 por minuto con la app escondida; consolidarlos en un planificador sigue pendiente, sin pedido.
- **Abrazaderas que usan (Ángel, 05/11/2026):** rack 20 sin hueco · tablero 22 sin hueco · apoya escalera 22 con hueco. **A confirmar** la unidad (¿cm del poste?) y si la calculadora las tiene que proponer.
- Barrio: faltan planos AP-TC-055 A–G, AP-TC-024, AP-TC-004, AP-TC-021, AP-CC-010, AP-T-014 y el itemizado de barrio.
- Entrar con huella (WebAuthn), medidor GPS/RTK: ideas charladas, **no hacer todavía**. Medición con **láser** Bluetooth que carga la medida sola (Ángel, 10/11/2026): anotada en `docs/PROYECTISTA.md`, **no hacer todavía**.
- **Premio por plaza terminada a tiempo** (idea de Ángel, 10/11/2026): premio para todos los que trabajaron en esa obra. La v143 ya prioriza la misma cuadrilla hasta terminar cada obra y avisa si hay que cambiarla; **el premio no está programado: no hacer sin pedido.**
- **Francos y licencias:** desde la v143 hay «🗓 Ausencias» a mano (Producción › Personal del equipo); no hay todavía turnos ni un calendario de francos fijos, ni se cruzan con la quincena. Preguntar a Ángel antes.
- **Orden sugerida, a confirmar:** horas del diccionario de cada tarea; vínculo junto con el izaje en el modo «con el equipo civil»; «solo con guía» (3 por día); acometida y preensamblado sin número (se usa lo medido); hora de inicio de lunes a viernes (07:30, se usa solo para el fraguado); la frase «3 al día sin subir el cable, solo dejarían la guía» quedó como pregunta. No hay tarea en el diccionario para «limpieza de fundación / telgopor», «arena» ni «alistar el tablero en el galpón» (la sugerida solo avisa).
- **Lo que aprende la app › 📦 Material** (v144): material real por columna y por tipo de obra; en la v143 solo muestra el calculado vs. entregado del legajo.
- **Videos de «Cómo se hace» (07/11/2026, pendiente):** recomendado YouTube «no listado» con un campo «Video» por guía y por tarea (▶ Ver video al lado de «📘 Cómo se hace»); R2 solo para clips internos. **No van en Firestore** (1 MB por documento y el cupo de lecturas), y Firebase Storage pide el plan Blaze. Mientras tanto, cada guía tiene su PDF «paso a paso» (skill `planos-tecnicos-ema`).
- **De la auditoría v101, sin hacer todavía** (ver `docs/AUDITORIA_v101.md`): Proyectista (largo del tramo por la cadena de puntos, subida igual a la calculadora, memoria «a confirmar», fases por columna PRFV), Usuarios (unificar filtros de «foto borrada», push al cambiar de usuario, aviso «Material para retirar» por `personaClave`, permiso de fotos antes de R2, `esCrew` con ajustes, permisos de borrar obra / nombrar columnas iguales a las reglas, reintentos con espera), provisiones 83–89 en el % (preguntar), zanja rápida 0,40.
- **Proyectista** (relevamiento con GPS RTK → plano DXF automático → cálculo lumínico tipo DIALux → caídas de tensión y tablero → proyecto completo; después BT/MT/AT/loteos): idea y plan por etapas en `docs/PROYECTISTA.md`. **No programar sin pedido de Ángel**; arrancar por la etapa que él elija.

---

## 17. Glosario rápido

- **PRFV:** poliéster reforzado con fibra de vidrio (columnas/postes).
- **PAT:** puesta a tierra.
- **BPN:** bornera de paso (fase gris, neutro celeste, tierra verde).
- **TIF/TIFF:** puntera.
- **Vínculo/capuchón:** acople de brazos en la punta de la columna.
- **Tablerito:** caja bornera de columna.
- **K:** coeficiente del ítem (× módulo = precio).
- **Itemizado:** lista de ítems con cantidades de una obra.
- **Certificar:** cobrar lo hecho del mes.
- **Cómputo:** cálculo de materiales.
- **Legajo:** carpeta digital de la obra.
- **OT:** orden de trabajo.
- **Cuadrilla:** equipo de obra.
- **Pañol:** depósito de materiales.
- **Vale:** comprobante de salida.
- **Remito:** comprobante de entrada.
- **Inspección:** inspector de EPEC/Municipalidad.
- **DGAP:** Dirección de Alumbrado Público (Municipalidad).
- **Ganancia (de cable):** metros extra por subidas a las columnas.
- **Plaza ejecutada:** las 36 ya hechas con itemizado viejo; manda lo certificado.
