# Historial de versiones — App Alumbrado Público (EMA Servicios)

Autor: Miguel Ángel Díaz © 2026

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
