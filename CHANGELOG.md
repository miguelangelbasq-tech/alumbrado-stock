# Historial de versiones — App Alumbrado Público (EMA Servicios)

Autor: Miguel Ángel Díaz © 2026

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
