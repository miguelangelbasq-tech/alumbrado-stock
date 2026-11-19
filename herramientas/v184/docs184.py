import sys, re
# uso: python3 docs184.py <repo> <sello> <sha_original> <sha_index> <sha_reglas> <pruebas>
repo, sello, sho, shi, shr, pru = sys.argv[1:7]
def edit(p, fn):
    t = open(p, encoding='utf-8').read(); t2 = fn(t); assert t2 != t, p; open(p, 'w', encoding='utf-8').write(t2)

def claude(t):
    a = '> Estado al **19/11/2026**: '
    assert t.count(a) == 1
    t = t.replace(a, a + '**v184 armada, sin publicar** (**💬 Chat interno** —«oficina y administrador registran los que pueden entrar… para que los de cuadrilla pidan cosas como "faltó hacerme esta tarea, agregarme esto" — y la IA me cree la tarea y me diga que la apruebe a mí y a la oficina»—: Administración y Oficina habilitan quién entra (⚙ del chat → `configEquipo/chat.habilitados`); «General» + una conversación por persona con la oficina (`chatInterno` / `chatHilos`); texto, foto y dictado; globito en el menú y en «Perfil»; aviso al celu; la cuadrilla escribe el pedido y el asistente (Worker ema-ia, tipo pregunta, solo SUS órdenes) arma la tarjeta —sumar a su orden abierta, corregir el cierre, reclamo de puntos— que Administración u Oficina aprueban (`fbOtUpdate` / `__corregirCierre` / reclamo v155) o rechazan con motivo; módulo `chat184`, bandera `__v184No`, `herramientas/v184/patch_v184.py` sobre la 183, sello `' + sello + '`. **Reglas nuevas `Reglas_Firestore_v184`: Ángel las publica**) sobre la ', 1)
    # §7.1
    a = '| `secretosServidor` | Clave privada VAPID |'
    assert t.count(a) == 1
    t = t.replace(a, '| `chatInterno/{id}` | **v184 · «💬 Chat interno»**: un mensaje por documento (id = el de la app) | `id, hilo ("general" o "p_<uid>"), mes (AAAA-MM: la consulta es hilo == + mes ==, sin índice compuesto), uid, email, nombre, persona, personaClave, rol, texto, tipo (msg · ia (lo dice el asistente) · pedido · sistema), ts, fecha, hora, fotoMini (320 px), fotoId (adjuntos `tipo:"chat"`, plazaId `__chat`), porAsistente, refId (el mensaje que lo originó), estado (pedido: pendiente → aprobado / rechazado), pedido {accion agregar/corregir/puntos, otId, otNumero, obra, fecha, k, tarea, un, cantidad, antes, despues, cuantos, persona, personaClave, resumen, filas[{c, a, d}]}` · lo marcan Administración y Oficina: `decTs, decPor, decPorNombre, decMotivo, resultado` (y `analisis`). Nadie borra |\n| `chatHilos/{hilo}` | **v184**: resumen de cada conversación (para el globito sin leer, sin escuchar los mensajes) | `id, tipo general/persona, uid, email, nombre, personaClave (de la persona), ultTs, ultTexto, ultUid, ultNombre, pend (pedidos por aprobar), mes`. Lo leído queda en el aparato (`localStorage ema.chat.leido.<uid>`) |\n' + a)
    a = '- `cuadrillas`, `guias`;'
    assert t.count(a) == 1
    t = t.replace(a, '- **v184 · `chat`** `{habilitados: {<uid>: {por, ts, nombre, email, rol}}}` = quién (además de Administración y Oficina) entra al chat interno; lo cambian Administración y Oficina (⚙ del chat), auditoría `chat_habilitar`;\n' + a)
    # §7.2
    a = '### 7.2 Reglas (**Reglas_Firestore_v155** = '
    assert t.count(a) == 1
    t = t.replace(a, '### 7.2 Reglas (**Reglas_Firestore_v184** = v155 + `configEquipo/chat` (lee cualquier confirmado, escriben Administración y Oficina) + `chatHilos` / `chatInterno` (`chatHab(d)`: admin/oficina o uid en `configEquipo/chat.habilitados`; `miHilo(h)`: «general» o «p_» + uid; `chatLee`: admin/oficina/dirección o (miHilo y habilitado); `chatEscribe` / `chatCrea`: a su nombre, campos cerrados, la cuadrilla solo msg/ia/pedido «pendiente»; aprobar solo admin/oficina con los campos de la decisión; nadie borra; 2 lecturas por regla como mucho); Ángel tiene que publicarlas. **Reglas_Firestore_v155** = ', 1)
    # §8
    a = '| `revisarAppDiag` | — |'
    assert t.count(a) == 1
    t = t.replace(a, '| `chat184` + `chat184Css` (+ el globito en «Perfil» de `navBarra`) | 184 | **💬 Chat interno** (Ángel 19/11). Quién entra: admin/oficina siempre, Dirección mira (sin caja para escribir ni «Aprobar»), el resto si está en `configEquipo/chat.habilitados` (⚙ `[data-ch=cfg]` → `[data-ch=hab:<uid>]` / `sacar:`). Escuchas: `configEquipo/chat` (doc) y los resúmenes (`chatHilos`: admin/oficina/dir la colección; el resto 2 docs, `general` y `p_<uid>`); los mensajes solo con la conversación abierta (`where hilo == h` + `where mes == AAAA-MM`; «Ver el mes anterior»). Hoja `#chOv` (`.v7-ov`, role=dialog, ✕; `#chCab`, `#chCuerpo`, `#chPie`): lista (General primero, «🙋 N para aprobar»), conversación (burbujas, tarjeta del pedido `.ch-card`, mensajes del sistema), caja `#chTxt` + 📷 `#chFoto` (mini 320 px + `subirAdjunto` con `plazaId:"__chat"`, `otId:""` = fotoLibre de la cuadrilla) + 🎤 (`__voz` del asistente o `webkitSpeechRecognition`); la cuadrilla con pestañas «Con la oficina» / «General». Sin señal: el mensaje queda en `localStorage ema.chat.pend.<uid>` («⏳ Sin enviar») con su id fijo y se vuelve a mandar (`reenviar`, revisa si ya llegó). **Pedido:** mensaje de la cuadrilla en SU conversación que suena a pedido (`pareceP`: faltó, agregar, cargar, sumar, puntos, corregir…; `window.__chatIaSiempre` en pruebas) → UN pedido al Worker (`ema.tipo:"pregunta"`, Sonnet effort low, JSON) con sus órdenes de 21 días (`misOts`, por `personalNombres`) y el catálogo → `armarPedido` valida contra sus órdenes (agregar ↔ corregir según esté cerrada; sin orden/tarea/cantidad → el asistente pregunta en el chat, `tipo:"ia"`) → mensaje `tipo:"pedido"` «Le mandé a Ángel y a la oficina para que lo aprueben» + aviso. Sin asistente (sin señal, tope, error): nota en el chat y el mensaje queda como texto. **Aprobar** (`decidir`, admin/oficina): `planDe` vuelve a armar con los datos de ese momento — orden abierta: `fbOtUpdate` (`actividades`, `previsto.<k>` + lo pedido, la persona si no estaba); cerrada: `__corregirCierre.plan/aplicar` (v153; motivo «Pedido de X por el chat…»); puntos: `__paraResolver.analizar/armarPlan` (v155) + `aplicar` («🔎 Analizar» en la tarjeta) —, después `estado`/`dec*`/`resultado`, mensaje del sistema, `pend` −1, aviso a la persona, auditoría `chat_pedido`; «✕ No corresponde» con motivo obligatorio. Avisos al celu (`dejarAviso`, tag `ema-chat-<hilo>`, url `./?chat=<hilo>` abre esa conversación). Menú `#menuChat` (globito: conversaciones sin leer + pedidos por aprobar; «⚠» si faltan las reglas), Perfil `#chPerfil`, globito en «Perfil» de la barra de abajo. Reglas viejas: `reglasViejas()` → cartel en el chat, menú y aviso una vez por día a admin/oficina. Apagado con `__v184No`. `__chat184` {abrir, cerrar, mandar, interpretar, armarPedido, decidir, planDe, habilitar, badge, puedeEntrar, habilitado, hilos, msgs, pendientes, reglasViejas, misOts, estado} |\n' + a)
    # §12
    a = '- **v183:** `__v183No`'
    assert t.count(a) == 1
    t = t.replace(a, '- **v184:** `__v184No` (sin el chat interno: sin menú, globito en Perfil ni escuchas) salvo `v184:true`. `t_v184` (grupos `SOLO=0..6`; Juan siempre en el tamaño del celu, en otra página del mismo contexto que la oficina; Worker simulado por página) usa `datos184.js` (sobre `datos155`; `hab:true` = Juan ya habilitado): 0 = Administración habilita a Juan (⚙), Juan entra por Perfil, «faltó cargarme la zanja de 10 m de hoy» → un pedido tipo pregunta solo con SUS órdenes → tarjeta, avisos a admin y Lucía; Administración «Aprobar» → la OT-2026-130 suma zanjeo 10, aprobado, aviso a Juan, auditoría; 1 = Lucía aprueba corregir el cierre de la OT-2026-110 (3 → 4 por `__corregirCierre`), «No corresponde» sin motivo no deja / con motivo sí, el asistente pregunta, Worker caído → queda como mensaje, un saludo no gasta pregunta, la respuesta de la oficina y «General»; 2 = Pedro no habilitado (con `REGLAS=1`: no lee lo de Juan, Juan no se aprueba solo, no cambia ni borra); 3 = Dirección mira sin escribir ni aprobar; 4 = sin señal «⏳ Sin enviar» y sale al volver; 5 = reglas viejas (`stub.sinReglas184`, siempre con el stub de reglas) → cartel; 6 = `__v184No`. `reglas_stub.js` suma `configEquipo/chat`, `chatHilos`, `chatInterno` y `stub.sinReglas184`.\n' + a)
    # §15
    a = '| 183 | Calculadora:'
    assert t.count(a) == 1
    t = t.replace(a, '| 184 | 💬 Chat interno: Administración y Oficina habilitan quién entra; «General» y una conversación por persona con la oficina (texto, foto, dictado, globito, aviso al celu); la cuadrilla pide «faltó cargarme…» y el asistente arma el pedido que Administración u Oficina aprueban o rechazan con motivo; reglas v184 (`chat184`) |\n' + a)
    # §16
    a = '- **v183, a confirmar:**'
    assert t.count(a) == 1
    t = t.replace(a, '- **v184, a confirmar / para después:** «General» + una conversación por persona con la oficina (no hay chats entre dos de la cuadrilla ni grupos por cuadrilla); el asistente solo se usa cuando el mensaje suena a pedido (palabras como «faltó», «agregar», «cargar», «sumar», «puntos», «corregir») y en la conversación propia de la cuadrilla, y mira las órdenes de los últimos 21 días; un pedido «sumar a la orden» suma la cantidad a lo previsto (si la tarea ya estaba, previsto + lo pedido) y no marca nada como hecho; corregir el cierre suma lo pedido a lo cerrado (si la tarea no tenía nada, la hizo esa persona); lo leído se guarda en cada aparato (en otro celu vuelve a aparecer como sin leer); la foto va a la nube como foto libre de la cuadrilla (pañol y «solo mirar» habilitados mandan solo la miniatura si la base no deja guardar la foto); la conversación muestra el mes en curso («Ver el mes anterior»); el aviso al celu de un mensaje en «General» de la oficina les llega a todos los habilitados.\n' + a)
    return t

def changelog(t):
    a = '## v183 — '
    i = t.index(a)
    e = f'''## v184 — 19/11/2026 (armada, sin publicar) · 💬 Chat interno con pedidos que arma el asistente
**Pedido (Ángel, 19/11):** «otra cosa para agregar un chat interno — oficina y administrador registran los que pueden entrar — sería algo como para que los de cuadrilla pidan cosas como "faltó hacerme esta tarea, agregarme esto" me entendés — y la IA me cree la tarea y me diga que la apruebe a mí y a la oficina».

**Qué cambia (módulo `chat184` + `chat184Css`, bandera `__v184No`):**
- **Quién entra:** Administración y Oficina siempre; **Dirección** mira todo (sin escribir ni aprobar); el resto (cuadrilla, operario, pañol, solo mirar) **solo si Administración u Oficina lo habilitó** en ⚙ del chat (`configEquipo/chat.habilitados`, auditoría `chat_habilitar`).
- **Conversaciones:** «General» (todos los que entran) y **una por persona con la oficina**. Texto, **foto** (miniatura en el mensaje y la foto a la nube) y **dictado** 🎤. Globito de lo no leído en el menú («💬 Chat interno»), en **Perfil** y en la pestaña «Perfil» de la barra de abajo; **aviso al celu** del otro lado (al tocarlo abre esa conversación). Sin señal: «⏳ Sin enviar» y sale solo cuando vuelve.
- **Pedidos con el asistente:** la cuadrilla escribe en su conversación «faltó cargarme la zanja de 10 m de hoy» → el asistente (Worker `ema-ia`, una pregunta con los topes de su rol, **solo con SUS órdenes**) arma la tarjeta: **sumar una tarea a su orden abierta**, **corregir el cierre** de una cerrada o **reclamo de puntos**; le contesta «Le mandé a Ángel y a la oficina para que lo aprueben» y avisa al celu de Administración y Oficina. Si falta un dato, pregunta en el chat. Sin asistente (sin señal, tope, caído), el mensaje llega igual como texto.
- **Aprobar:** Administración u Oficina ven la tarjeta con **antes → después**; «✅ Aprobar» (motivo precargado) lo hace por los caminos de siempre (la orden por `fbOtUpdate`; el cierre por «✏ Corregir cierre» de la v153; el reclamo de puntos con el análisis de la v155) o «✕ No corresponde» con motivo obligatorio. A la persona le llega el aviso; auditoría `chat_pedido`. **Nada cambia sin aprobar.** Nadie borra mensajes.

**Reglas nuevas (`firebase/Reglas_Firestore_v184.txt` = v155 + chat):** `configEquipo/chat`, `chatHilos`, `chatInterno`. Mientras no se publiquen, el chat no guarda nada: Administración y Oficina ven «Falta publicar las reglas de Firebase de la v184» (en el chat, en el menú y un aviso por día) y la cuadrilla no lo ve.

**Qué tiene que hacer Ángel:** 1) publicar las reglas `Reglas_Firestore_v184.txt` (Firebase › Firestore › Reglas › pegar todo › Publicar); 2) subir el `index.html`; 3) en la app, Chat interno › ⚙ habilitar a los que van a entrar. No hace falta APK nuevo ni cambiar Workers.

**A confirmar:** solo «General» + una por persona (sin chats entre dos de la cuadrilla); el asistente se usa solo si el mensaje suena a pedido; «sumar a la orden» suma a lo previsto (no marca hecho); lo leído queda en cada aparato; la conversación muestra el mes en curso («Ver el mes anterior»).

**Cómo se arma:** `herramientas/v184/patch_v184.py` sobre el ORIGINAL 183 (`0650f1a4…`) (`chat184.js`, `chat184.css` antes de `revisarAppDiag`; el globito en «Perfil» de `navBarra`). Estudiado sobre la 179; las v180–v183 no tocan nada de lo que usa.

**Pruebas:** {pru}

**Sello:** `{sello}` · ORIGINAL `{sho}` · index `{shi}` · reglas `{shr}`.

'''
    return t[:i] + e + t[i:]
edit(repo + '/CLAUDE.md', claude)
edit(repo + '/CHANGELOG.md', changelog)
print('docs ok')
