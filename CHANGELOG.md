# Historial de versiones — App Alumbrado Público (EMA Servicios)

Autor: Miguel Ángel Díaz © 2026

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
