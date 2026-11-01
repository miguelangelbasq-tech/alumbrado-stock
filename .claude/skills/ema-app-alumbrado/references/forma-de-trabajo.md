# Forma de trabajar — app Alumbrado Público EMA

## Índice
1. Piezas y dónde está cada cosa
2. Armar una versión
3. Sellar la versión (dos marcas)
4. Pruebas
5. Firebase (reglas)
6. Entregar
7. Trabajar con SALEM sin pisarse
8. Código «dormido» y cuidados de rendimiento
9. APK de Android

## 1. Piezas
- **App web:** GitHub Pages, repo `miguelangelbasq-tech/alumbrado-stock`, rama `main`. Ángel sube el `index.html` a mano (*Add file › Upload files › Commit*); ojo con «index.html.html». Junto al index están `sw.js`, `ema-icono.png`, `app/` y `camara/`, que casi nunca cambian.
- **Base:** Firebase Firestore, proyecto `alumbrado-stock`, plan gratis Spark: cuidá las lecturas. Login con Firebase Auth.
- **Fotos:** Cloudflare R2 a través del Worker `ema-fotos`. **Avisos con la app cerrada:** Worker `ema-avisos`.
- **APK:** Capacitor con un «cargador local», que guarda la app en el celular y la abre al toque.
- **Roles:** admin, oficina, pañol, cuadrilla, operario y mirar. Cada hoja es oculto, ver o editar; los ajustes por usuario mandan sobre el rol.

## 2. Armar una versión
1. Conseguí el **último ORIGINAL**. Si no sabés cuál es, preguntale a Ángel: puede haber uno más nuevo de SALEM.
2. Escribí `patch_vNNN.py`:
   - verifica el SHA-256 del ORIGINAL de entrada; con `--otra-base` lo saltea, para aplicarlo sobre otra rama;
   - `R(a, b, n=1)`: reemplazo exacto que **corta** si el texto no aparece exactamente n veces;
   - los módulos nuevos van como `<style id="xxxCss">` y `<script id="xxx">` **antes de `<script id="revisarAppDiag">`**;
   - comentarios en castellano que cuenten el porqué («v0NN · …: …»).
3. `python3 patch_vNNN.py ORIGINAL_anterior.html NNN_AAAA-MM-DD_app-EMA_ORIGINAL.html`
4. `node compactar80.js NNN_…_ORIGINAL.html index.html`. Esbuild minifica cada script y estilo con target **chrome80**. No toca `type="text/plain"`: ese código tiene que estar escrito ya compatible con Chrome 80.

## 3. Sellar la versión (dos marcas)
- `#appVersion`: `· v AAAA-MM-DD HH:MM · hash6<`, con hora de Argentina (UTC−3) y hash6 = primeros 6 caracteres del SHA-256 del ORIGINAL antes de sellar.
- `<meta name="ema-version" content="AAAA-MM-DD HH:MM · hash6">`, arriba de todo. La revisión de versión pide solo los primeros 16 KB del archivo y lee esta etiqueta.
- **Las dos con el mismo valor.** El parche tiene que chequear que antes coincidían y sellarlas juntas. Si cambia solo una, la app no avisa «Hay una versión nueva».

## 4. Pruebas
- Arnés Playwright (`h.js`), con Firebase falso (`firebase_stub.js`) y reglas simuladas (`reglas_stub.js`).
  - `abrir({sesion:'admin'|'pedro'|'juan', cel, reglas, leaflet, https, …})`;
  - `prueba(nombre)` imprime `RESULTADO …: X/Y OK`.
- **Cada versión suma su `t_vNNN.js`**, con controles que dicen en castellano qué verifican.
- **Batería completa** = todas las `t_*.js`, en PC (1280×860) y en celular (390×844). Corré en tandas de 3.
  - Algunas son sensibles a los tiempos (`t_v026`, `t_v037`, `t_v073`, `t_v076`): si fallan, repetí solas antes de concluir.
  - `t_v083` está reemplazada por `t_v084`.
- **Si cambia un comportamiento ya probado, actualizá la prueba vieja y decí por qué.**
- **Señal lenta:** `window.__stubKbps = 2000`. **Sin reglas publicadas:** `localStorage stub.sinReglasNNN`.
- Cuando una referencia numérica importa (coordenadas, distancias), controlala contra una librería de referencia (por ejemplo PROJ/pyproj).
- Si cambian las reglas, cambiá también `reglas_stub.js`.

## 5. Firebase (reglas)
- Si hace falta una colección o un permiso nuevo, entregá las **reglas completas** en `Reglas_Firestore_vNNN.txt`, partiendo de las últimas publicadas.
- La app tiene que **avisar** «Falta publicar en Firebase las reglas nuevas (…)» si le llega «permission-denied».
- **Límite que ya mordió:** 10 lecturas de documentos y 1.000 expresiones por pedido. Leé el usuario **una sola vez** por regla (`let d = yo()`) y armá solo el mapa del rol de la persona.
- **Documentos de 1 MB como máximo:** nada de fotos grandes dentro de un documento. Las fotos van a R2 y en el documento queda solo una miniatura chica.
- Nunca guardar secretos en la base, salvo en `secretosServidor`, que no tiene regla.

## 6. Entregar
- **Archivos:**
  - `NNN_AAAA-MM-DD_app-EMA_ORIGINAL.html` (respaldo, **no se sube a GitHub**);
  - `index.html` (se sube);
  - reglas, si hay;
  - parche y prueba nueva.
- **SHA-256** del ORIGINAL y del index (y de las reglas, si hay).
- **CHANGELOG:** pedido, cambios, qué tiene que hacer Ángel, pruebas y huellas.
- **Mensaje a Ángel**, corto: qué cambió y qué tiene que hacer, en orden. Por ejemplo: «1) publicá las reglas, 2) subí el index; no hace falta APK nuevo».

## 7. Trabajar con SALEM sin pisarse
- SALEM es el chat de Claude que también arma versiones. **Un número de versión por vez y sobre el último ORIGINAL.**
- Si los dos arman versiones distintas sobre el mismo ORIGINAL, se junta todo en una versión nueva aplicando los parches del otro con `--otra-base`, y se corre la batería completa.
- **Al recibir una versión del otro, controlala:**
  - que el index salga exacto del ORIGINAL;
  - que estén los cambios anteriores;
  - que las dos marcas de versión coincidan;
  - y corré la batería.

## 8. Código «dormido» y rendimiento
- La cuadrilla usa celulares viejos y tiene poca señal. Lo que no usa:
  - va en `<script type="text/plain" id="xxxCod">` y se ejecuta recién al abrir esa parte (como Proyectista);
  - o se carga diferido, como las láminas.
- **Entrada rápida de la cuadrilla (v086):** baja solo sus órdenes y el resto por tandas. En ese modo `ordenesTrabajo` tiene **solo las de esa persona**: no armes nada para la cuadrilla que necesite las órdenes de otros.
- Una colección nueva se escucha recién cuando se abre la pantalla que la usa, nunca al arrancar la app.
- Para cachés globales usá `var`, no `const`/`let`: si se llama antes de la línea donde se declara, rompe (TDZ).

## 9. APK de Android
- **Hace falta APK nuevo solo si cambia algo nativo:** ícono, nombre, permisos, plugins, el cargador o la URL. Todo lo demás llega subiendo el `index.html`.
- Ángel lo arma en su compu con `COMPILAR.bat`. Desde la nube no se puede compilar.
- **Ubicación con el celular bloqueado:** se manda por el lado de Android (CapacitorHttp → Firestore REST), el APK lleva `android.useLegacyBridge: true`, y la batería tiene que estar en «Sin restricciones».
