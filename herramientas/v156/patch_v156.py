"""v156 · Auditor del avance de obra: el asistente y una hoja sin IA controlan el avance con exactitud. Ángel (14/11):
   «Necesito que la IA analice el avance de obra muy bien, muy detalladamente: si pasó algo mal, algo bien, con todas las
   tareas que se hicieron, más allá de que ya es automático. Necesito que tenga un control muy exacto de eso.»
 · Motor window.__auditAvance (módulo auditorAvance, antes de revisarAppDiag): cada número del itemizado con sus fuentes
   (cierres de orden con fecha, tarea y parte del ítem; correcciones v153; revertidos v102; a mano con motivo o «sin motivo
   anotado»; ajustes del conforme a obra; certificado) y si la suma cuadra; etapas; planilla de columnas (v150) contra el
   itemizado; revisar sin IA (hallazgos rojo/ámbar/info con propuesta); cambios con «Sí» (ítem, nota del porqué, corregir
   cierre v153, pasar el cálculo v102; varias juntas con casillas); auditoría avance_auditoria. Hoja #aaOv; Supervisor;
   Inicio Ejecutivo «Para atender»; Avance de obra; legajo; Dirección (solo mirar); parte del avance al final del día.
 · Avance de obra: cambiar lo hecho a mano pide motivo (avanceObras.avanceHist[]).
 · Asistente (dormido): auditar_avance, proponer_nota_avance, proponer_correcciones_avance; SISTEMA; «revisá el avance de
   todas» con el modelo del supervisor y effort high; la revisión de las 12/18 h suma lo rojo del avance.
 · Arreglos de la v155: Inicio de Dirección sin proyecciones absurdas («+999 d», «2890 días después») y «Para resolver» con la
   explicación de la TAREA reclamada y el cartel del análisis pegado al reclamo.
Pruebas viejas: __v156No (salvo v156:true). Sin reglas nuevas. Se reaplica con --otra-base.
Uso: python3 patch_v156.py ORIGINAL_155.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 155
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 155 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip('\n')
assert t.count('id="auditorAvance"') == 0, 'ya tiene la v156'

# 1) Avance de obra: cambiar lo hecho a mano pide motivo (queda en avanceObras.avanceHist)
R('  function aplicar(o, f, nuevo, hechasNuevas) {\n',
  '  function aplicar(o, f, nuevo, hechasNuevas, motOk) {\n    if (!motOk && !window.__v156No && window.__auditAvance) { const c0 = n0(f.r.cantidad), a0 = Math.min(n0(f.r.cantidadAvanzada), c0), n1 = Math.max(0, Math.min(c0, r2(nuevo))); if (Math.abs(n1 - a0) > 1e-9) return window.__auditAvance.pedirMotivo(o, f.id, a0, n1, (m) => aplicar(o, f, nuevo, hechasNuevas, m)); }   // v156: motivo obligatorio\n')

# 2) Supervisor: la línea del avance
R('.concat(window.__paraResolver ? window.__paraResolver.supHallazgos() : []); }   /* v154, v155 */',
  '.concat(window.__paraResolver ? window.__paraResolver.supHallazgos() : []).concat(window.__auditAvance && !window.__v156No ? window.__auditAvance.supHallazgos() : []); }   /* v154, v155, v156 */')
R('    else if (x.tipo === "pararesolver") { try { window.__paraResolver.abrir(); } catch (e) { } }   // v155',
  '    else if (x.tipo === "pararesolver") { try { window.__paraResolver.abrir(); } catch (e) { } }   // v155\n    else if (x.tipo === "auditAvance") { try { window.__auditAvance.abrir({ obra: x.id || "" }); } catch (e) { } }   // v156')
# 3) Inicio Ejecutivo › Para atender (lo rojo)
R('    try { (window.__paraResolver ? window.__paraResolver.atender() : []).forEach((x) => l.push(x)); } catch (e) { }   // v155',
  '    try { (window.__paraResolver ? window.__paraResolver.atender() : []).forEach((x) => l.push(x)); } catch (e) { }   // v155\n    try { (window.__auditAvance && !window.__v156No ? window.__auditAvance.atender() : []).forEach((x) => l.push(x)); } catch (e) { }   // v156')
R('    if (k === "pararesolver") return window.__paraResolver && window.__paraResolver.abrir();   // v155',
  '    if (k === "pararesolver") return window.__paraResolver && window.__paraResolver.abrir();   // v155\n    if (k === "auditavance") return window.__auditAvance && window.__auditAvance.abrir({ obra: "" });   // v156')
# 4) Dirección (solo mirar): acceso en «Programación»
R('<button type="button" class="dr-link" data-dr="v:avance">Avance ›</button>',
  '${window.__auditAvance && !window.__v156No ? \'<button type="button" class="dr-link" data-aaabrir="">🔎 Control ›</button>\' : ""}<button type="button" class="dr-link" data-dr="v:avance">Avance ›</button>')

# 5) asistente (dormido): la revisión de las 12/18 h suma lo rojo del avance, «revisá el avance de todas», SISTEMA, herramientas
R('    const hora = slot ? slot.slice(-2) + " h" : "";\n',
  '    const hora = slot ? slot.slice(-2) + " h" : "";\n    let avR = ""; try { avR = window.__auditAvance && !window.__v156No ? window.__auditAvance.resumenRojos() : ""; } catch (e) { avR = ""; }   // v156\n')
R('await enviar(txt, true, { modelo, effort: "high", tipo: "supervisor"', 'await enviar(txt + avR, true, { modelo, effort: "high", tipo: "supervisor"')
R('const quiereRevision = (t) => /revis[aá](me)?\\s+(todo|la app|todas las obras)/i.test(String(t || ""));',
  'const quiereRevision = (t) => /revis[aá](me)?\\s+(todo|la app|todas las obras|el avance de todas)/i.test(String(t || ""));   // v156: + «revisá el avance de todas las obras»')
R('    "- PUNTOS (v154): SÍ PODÉS',
  '    "- AVANCE DE OBRA (v156): SÍ PODÉS AUDITAR EL AVANCE: explicá cada número con sus fuentes, decí qué está bien y qué no, nunca inventes el porqué de un número cargado a mano. Para «¿está bien el avance de X?», «¿por qué el ítem 5 dice 4?», «¿qué se hizo esta semana y cuadra con el itemizado?» o «revisá todas las obras» usá auditar_avance (con obra, con obra + item, con desde/hasta, o sin nada) y mostrá la suma de cada número (cada orden con su fecha, tarea y parte del ítem; lo cargado a mano con quién, cuándo y el MOTIVO; si dice «sin motivo anotado», decilo así). Lo rojo primero; lo de «a revisar» (orden de obra, fraguado) no es error seguro. Para guardar el porqué que te dice la persona: proponer_nota_avance (con sus palabras). Para corregir: proponer_correcciones_avance (una tarjeta con casillas: ítem, nota, ✏ corregir cierre, pasar el cálculo). Todo cambio pide MOTIVO: si no lo dijo, preguntalo.",\n    "- PUNTOS (v154): SÍ PODÉS')
R('  window.__asistente = { resumenSemana,', leer('ia156.js') + '\n  window.__asistente = { resumenSemana,')

# 6) arreglos de la v155 (capturas): Inicio de Dirección sin números absurdos
R('    if (prom7 > 0.01 && falta > 0) { proy = sumarHabiles(h, Math.ceil(falta / prom7)); if (C.plazo) difDias = diasEntre(C.plazo, proy); }\n',
  '    let estProy = "";   // v156: «sinRitmo» (pocos días con avance para estimar) o «lejos» (a este ritmo pasa de 2 veces el plazo)\n'
  '    const diasConAv = prev7.filter((x) => x > 0.01).length, necH = prom7 > 0.01 ? Math.ceil(falta / prom7) : 0, plazoH = C.plazo ? Math.max(1, habiles(mas(C.ini || h, -1), C.plazo)) : 0;\n'
  '    if (!window.__v156No && falta > 0 && (prom7 <= 0.01 || diasConAv < 2)) estProy = "sinRitmo";\n'
  '    else if (!window.__v156No && falta > 0 && necH > (C.plazo ? Math.max(2 * plazoH, 2 * quedan) : 520)) estProy = "lejos";\n'
  '    else if (prom7 > 0.01 && falta > 0) { proy = sumarHabiles(h, necH); if (C.plazo) difDias = diasEntre(C.plazo, proy); }\n')
R('const D = { h, ayer, z, C, zObras, porDia, est, dias14, hoyK, hoyKc, ayerK, prom7: r1(prom7), falta, quedan, ritmo: r1(ritmo), proy, difDias, pctPlan, sinFecha, porObraDia };',
  'const D = { h, ayer, z, C, zObras, porDia, est, dias14, hoyK, hoyKc, ayerK, prom7: r1(prom7), falta, quedan, ritmo: r1(ritmo), proy, difDias, pctPlan, sinFecha, porObraDia, estProy };')
R('    if (D.difDias != null && D.difDias > 0) l.unshift({',
  '    if (D.estProy === "lejos" && D.C.plazo) l.unshift({ p: 0, c: "atrasada", t: "Muy atrasado: al ritmo de los últimos 7 días no se llega al plazo", s: `Hacen falta ${fN(D.ritmo, 0)} K por día hábil y venimos haciendo ${fN(D.prom7, 1)} (promedio de 7 días).`, ir: "prog" });   // v156\n    if (D.difDias != null && D.difDias > 0) l.unshift({')
R('    const dif = D.difDias, difTx = dif == null ? "—" : dif > 999 ? "+999 d" : (dif > 0 ? "+" : "") + dif + " d";',
  '    const dif = D.difDias, lejos = D.estProy === "lejos", difTx = dif == null ? (lejos ? "No llega" : "—") : dif > 999 ? "+999 d" : (dif > 0 ? "+" : "") + dif + " d";')
R('<div class="${dif > 0 ? "rj" : ""}"><b>${esc(difTx)}</b><span>a este ritmo,<br>contra el plazo</span></div>',
  '<div class="${dif > 0 || lejos ? "rj" : ""}"><b>${esc(difTx)}</b><span>${lejos ? "muy atrasado:<br>al ritmo de 7 días" : D.estProy === "sinRitmo" ? "todavía no hay<br>ritmo para estimar" : "a este ritmo,<br>contra el plazo"}</span></div>')
R('[dif == null ? "—" : (dif > 0 ? "+" : "") + dif, "días", D.proy ? `termina ${dm(D.proy)}` : "sin ritmo todavía"]',
  '[dif == null ? (D.estProy === "lejos" ? "No llega" : "—") : (dif > 0 ? "+" : "") + dif, dif == null ? "" : "días", D.proy ? `termina ${dm(D.proy)}` : D.estProy === "lejos" ? "muy atrasado: al ritmo de 7 días no se llega" : "todavía no hay ritmo suficiente para estimar"]')
R('<div class="${i === 2 && dif > 0 ? "rj"', '<div class="${i === 2 && (dif > 0 || D.estProy === "lejos") ? "rj"')
R(': D.falta <= 0 ? "La zona está completa." : "Todavía no hay ritmo para proyectar (faltan órdenes cerradas).";',
  ': D.falta <= 0 ? "La zona está completa." : D.estProy === "lejos" ? `Muy atrasado: al ritmo de los últimos 7 días (${esc(fN(D.prom7, 1))} K por día) no se llega al plazo${C.plazo ? " (" + esc(dmy(C.plazo)) + ")" : ""}. Hacen falta ${esc(fN(D.ritmo, 0))} K por día hábil.` : "Todavía no hay ritmo suficiente para estimar (pocos días con órdenes cerradas en los últimos 7 días hábiles).";')
R('proyeccionFin: D.proy, diasContraPlazo: D.difDias,', 'proyeccionFin: D.proy || null, diasContraPlazo: D.difDias, estadoProyeccion: D.estProy === "lejos" ? "muy atrasado: al ritmo de los últimos 7 días no se llega al plazo" : D.estProy === "sinRitmo" ? "todavía no hay ritmo suficiente para estimar" : "ok",')
# «Para resolver»: la foto fija de la explicación es la de la TAREA reclamada; el cartel queda pegado a su reclamo
R('  function explicacionDe(o, persona) {\n    if (!o || !window.__auditPuntos) return { nota: o ? "" : "sin orden" };\n    const E = intentar(() => window.__auditPuntos.explicarOrden(o, { persona }), null);\n    if (!E || E.err) return { nota: String((E && E.err) || "sin explicación").slice(0, 200) };\n',
  '  function explicacionDe(o, persona, tareaK) {\n    if (!o || !window.__auditPuntos) return { nota: o ? "" : "sin orden" };\n    const E = intentar(() => window.__auditPuntos.explicarOrden(o, tareaK && !window.__v156No ? { persona, tarea: tareaK } : { persona }), null);\n    if (!E || E.err) return { nota: String((E && E.err) || "sin explicación").slice(0, 200) };\n'
  '    if (tareaK && !window.__v156No) {   // v156: la cuenta de ESA tarea (no la de toda la orden)\n'
  '      const T = E.laTarea, mias = T ? arr(E.suyos && E.suyos.detalle).filter((d) => d.tarea === T.tarea) : [], pts = Math.round(mias.reduce((s, d) => s + (+d.pts || 0), 0) * 100) / 100;\n'
  '      if (T) return { pts, total: E.total, guardados: !!E.guardados, tarea: T.tarea, tareaK, cuenta: String(mias.length ? mias.map((d) => d.como).join(" | ") + ` → ${pts} pts por esta tarea` : `${T.tarea}: ${T.cuenta}; a ${String(persona || "").split(" ")[0] || "esta persona"} no le tocó nada de esta tarea`).slice(0, 600), enLaOrden: !(E.suyos && E.suyos.noEstaEnLaOrden), ts: Date.now() };\n'
  '      return { pts: E.suyos ? E.suyos.pts : 0, total: E.total, guardados: !!E.guardados, tarea: "", ordenCompleta: true, cuenta: ("(No encontré la tarea en la orden: es la cuenta de la orden completa) " + String(E.cuentaPaso || "")).slice(0, 600), enLaOrden: !(E.suyos && E.suyos.noEstaEnLaOrden), ts: Date.now() };\n'
  '    }\n')
R('r.explicacion = explicacionDe(o, nombreYo());', 'r.explicacion = explicacionDe(o, nombreYo(), r.tareaK);')
R('const ex = E.cuenta || E.nota ? `<div class="pr-ex"><b>La app le explicaba:</b> ${E.cuenta ? esc(E.cuenta) : esc(E.nota)}</div>` : "";',
  'const ex = E.cuenta || E.nota ? `<div class="pr-ex"><b>La app le explicaba${E.tarea ? " (tarea «" + esc(E.tarea) + "»)" : E.ordenCompleta ? " (la orden completa)" : ""}:</b> ${E.cuenta ? esc(E.cuenta) : esc(E.nota)}</div>` : "";')
R('</div></div>${acc}</div>`;', '</div></div>${msgItem(x)}${acc}</div>`;', 2)
R('  const VER = { si: ["ok", "✅ Parece que tiene razón"], no: ["no", "✕ No parece"], nose: ["gr", "❔ No se puede saber"] };',
  '  const VER = { si: ["ok", "✅ Parece que tiene razón"], no: ["no", "✕ No parece"], nose: ["gr", "❔ No se puede saber"] };\n  const msgItem = (x) => (st.msg && st.msgId && st.msgId === x.id ? `<div class="pr-msg" role="status">${esc(st.msg)}</div>` : "");   // v156: el cartel queda pegado a su aviso')
R('const msg = st.msg ? `<div class="pr-msg" role="status">${esc(st.msg)}</div>` : "";',
  'const msg = st.msg && !(st.msgId && ver.some((x) => x.id === st.msgId)) ? `<div class="pr-msg" role="status">${esc(st.msg)}</div>` : "";')
R('ov.hidden = false; ov.__h = ""; st.abierta = true; st.msg = ""; pintar(); cargar(true);', 'ov.hidden = false; ov.__h = ""; st.abierta = true; st.msg = ""; st.msgId = ""; pintar(); cargar(true);')
R('const A = await guardarAnalisis(xx); st.msg = (VER[A.veredicto] || VER.nose)[1] + "."; const ov = $("prOv"); if (ov) ov.__h = ""; return pintar(); }',
  'const A = await guardarAnalisis(xx); st.msg = window.__v156No ? (VER[A.veredicto] || VER.nose)[1] + "." : ""; st.msgId = xx.id; const ov = $("prOv"); if (ov) ov.__h = ""; pintar(); try { const it = ov && ov.querySelector(`[data-prid="${xx.id}"] .pr-an`); it && it.scrollIntoView({ block: "nearest" }); } catch (er) { } return; }')
R('try { const r = await decidir(xx, aut, mot, aut ? resp : ""); st.msg =', 'st.msgId = xx.id; try { const r = await decidir(xx, aut, mot, aut ? resp : ""); st.msg =')
R('try { const r = await marcar(id, a.indexOf("si:") === 0 ? "resuelto" : "visto", resp); st.msg =', 'st.msgId = id; try { const r = await marcar(id, a.indexOf("si:") === 0 ? "resuelto" : "visto", resp); st.msg =')

# 7) el módulo nuevo (antes del último script)
R('<script id="revisarAppDiag">', '<style id="auditorAvanceCss">\n' + leer('auditorAvance.css') + '\n</style>\n<script id="auditorAvance">\n' + leer('auditorAvance.js') + '\n</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
