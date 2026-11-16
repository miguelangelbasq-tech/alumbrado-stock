"""v163 · Avance de obra: marcar lo que ya está hecho, fácil y sin que lo frene el fraguado (Ángel 15/11: «hay plazas que están
   retrasadas, que ya están completas y solo le falta la última cosa, y no puedo marcar que ya se hizo porque me tira que falta el
   hormigonado y tengo que esperar 3 días… La idea es marcar ahora y que luego avance solo»).
 · Lo marcado a mano NO fragua salvo que se diga que se hormigonó hoy o ayer: «¿Cuándo se hormigonó?» con «Ya hace días (está
   fraguado)» elegido de entrada (av2.m.c_horm_<col> lleva fragOk:true, u hormTs si fue hoy/ayer → 72 h desde ahí). Lo de las
   órdenes sigue igual (72 h desde la foto/cierre). El aviso de fraguado al marcar el izaje no frena («Marcar igual»; en la hoja de
   la columna se marca y avisa).
 · «⚡ Poner al día esta obra» en el flash del avance (solo quien edita Avance; no cuadrilla ni Dirección): hoja .v7-ov para marcar
   en UN paso columnas (todas / desde–hasta) × pasos (con «Todo» y atajos), lo que no va por columna, motivo precargado
   «Puesta al día del avance», resumen antes → después y «Sí, marcar»; «🏁 Está toda terminada». Solo suma lo que falta; las
   órdenes nuevas siguen sumando encima sin contar dos veces. Una entrada por columna en av2.m («a<ts>_<col>»).
 · Asistente: proponer_marcar_avance con accion puesta_al_dia / toda_terminada (cosas, cuando_hormigon).
 · Arreglo chico: el historial de la hoja de la Col 1 ya no muestra cambios de la Col 10–12 («_COL1» estaba dentro de «_COL10»).
Pruebas viejas: __v163No (lo pone el arnés salvo v163:true) → todo como la v162. Sin reglas nuevas (fbAvanceCampos como siempre).
Uso: python3 patch_v163.py ORIGINAL_162.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 162
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 162 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
PUESTA = open(os.path.join(SRC, 'puesta.js'), encoding='utf-8').read()

# ---------------------------------------------------------------- avanceObra2: banderas y ayudas
R('  const off = () => !!window.__v158No;\n',
  '  const off = () => !!window.__v158No;\n'
  '  const off3 = () => !!(window.__v158No || window.__v163No);   // v163: puesta al día y hormigón a mano sin fraguado\n'
  '  const SIN_F = "0000-00-00", pdSin = (r) => !off3() && r && r.e === "mano" && !!r.pd;   // v163: lo puesto al día, sin fecha real\n'
  '  // v163: «¿Cuándo se hormigonó?» (lo marcado a mano fragua solo si fue hoy o ayer)\n'
  '  const hormExtra = (h) => (h === "hoy" ? { hormTs: Date.now() } : h === "ayer" ? { hormTs: Date.now() - 864e5 } : { fragOk: true });\n'
  '  const hormLeer = (name) => { const x = document.querySelector(\'input[name="\' + name + \'"]:checked\'); return x ? x.value : "dias"; };\n'
  '  const hormPreg = (name, sel) => `<fieldset class="a2-hp"><legend>¿Cuándo se hormigonó?</legend>${[["dias", "Ya hace días (está fraguado)"], ["hoy", "Hoy"], ["ayer", "Ayer"]].map(([v, x]) => `<label><input type="radio" name="${name}" value="${v}"${(sel || "dias") === v ? " checked" : ""}> ${x}</label>`).join("")}<small>«Hoy» o «Ayer» fragua ${fraguadoH()} h desde ese momento. «Ya hace días» no fragua.</small></fieldset>`;\n')
# lo marcado en la puesta al día: una entrada por columna «a<ts>_<col>» {e:"si", pasos:"pozo,horm,…"}
R('      const m = q.match(/^c_([a-z]+)_(.+)$/), mk = q.match(/^k_(.+)$/), mp = q.match(/^p_(.+?)_([a-z0-9]+)$/);\n',
  '      const m = q.match(/^c_([a-z]+)_(.+)$/), mk = q.match(/^k_(.+)$/), mp = q.match(/^p_(.+?)_([a-z0-9]+)$/);\n'
  '      const ma = !off3() && !m && !mk && !mp ? q.match(/^a([0-9a-z]+)_(.+)$/) : null;\n'
  '      if (ma) { const i = L.cols.findIndex((c) => c.key === ma[2]); if (i >= 0 && v.e === "si") String(v.pasos || "").split(",").forEach((pp) => { if (PASO[pp] && L.pasos.some((x) => x.id === pp)) cl(pp, i).ev.push(Object.assign({ tipo: "mano", ts: num(v.ts) }, v, { e: "si" })); }); return; }\n')
# el hormigón a mano fragua solo con hormTs (hoy/ayer)
R('      else if (h && h.e === "mano" && h.ts && ahora - h.ts < frH * 3600e3) { h.eOrig = h.e; h.e = "frag"; h.fragHasta = h.ts + frH * 3600e3; }',
  '      else if (h && h.e === "mano" && (off3() ? h.ts : num(h.hormTs)) && ahora - (off3() ? h.ts : num(h.hormTs)) < frH * 3600e3) { const t0 = off3() ? h.ts : num(h.hormTs); h.eOrig = h.e; h.e = "frag"; h.fragHasta = t0 + frH * 3600e3; }')
# planMarcar: puesta al día / toda terminada (también para el asistente) y la respuesta de «¿Cuándo se hormigonó?»
R('  function planMarcar(spec) {\n    spec = spec || {};\n',
  '  function planMarcar(spec) {\n    spec = spec || {};\n'
  '    if (!off3() && (spec.accion === "puesta_al_dia" || spec.accion === "toda_terminada")) return planPuesta(Object.assign({}, spec, { toda: spec.accion === "toda_terminada" }));\n')
R('        cambios.push({ key: kCel(p, c), val: val(eNuevo), txt:',
  '        cambios.push({ key: kCel(p, c), val: val(eNuevo, p === "horm" && eNuevo === "si" && !off3() ? hormExtra(spec.horm) : null), txt:')
R('      if (eNuevo === "si" && pasos.indexOf("vinc") >= 0 && pasos.indexOf("izaje") < 0',
  '      if (!off3() && eNuevo === "si" && pasos.indexOf("izaje") >= 0 && pasos.indexOf("horm") >= 0 && (spec.horm === "hoy" || spec.horm === "ayer") && (E.R["horm|" + i] || {}).e === "falta") { const hs = hormExtra(spec.horm).hormTs + fraguadoH() * 3600e3; avisos.push(`${c.num}: con el hormigón de ${spec.horm} fragua hasta ${fDia(fechaDe(hs))} ${hhmm(hs)}`); }\n'
  '      if (eNuevo === "si" && pasos.indexOf("vinc") >= 0 && pasos.indexOf("izaje") < 0')
# el origen de lo puesto al día
R('    if (r.e === "mano" || (r.e === "falta" && r.destildado) || (r.tipo === "mano")) return `',
  '    if (r.pd && r.e === "mano" && !off3()) return `Puesta al día (ya estaba hecho) · ${primero(r.porNombre || r.por)} · ${fDia(fechaDe(r.ts))}${r.motivo ? " · «" + r.motivo + "»" : ""}`;\n'
  '    if (r.e === "mano" && r.hormTs && !off3()) return `Cargado a mano · hormigonado ${fDia(fechaDe(r.hormTs))} · ${primero(r.porNombre || r.por)}${r.motivo ? " · «" + r.motivo + "»" : ""}`;\n'
  '    if (r.e === "mano" || (r.e === "falta" && r.destildado) || (r.tipo === "mano")) return `')
# el botón «⚡ Poner al día esta obra» en el flash
R('    const btns = `<div class="a2-fb">',
  '    const btns = `<div class="a2-fb">${puede() && !off3() ? \'<button type="button" class="a2-fbtn a2-pdb" data-a2="pdAbrir">⚡ Poner al día esta obra</button>\' : ""}')
# «Elegir varias»: la pregunta del hormigón
R('      const P = planMarcar({ obra: E.o.id, columnas: cols.map((c) => c.num), pasos: st.selPaso === "todo" ? "todo" : [st.selPaso], accion: st.selPaso === "todo" ? "completa" : "marcar" });',
  '      const P = planMarcar({ obra: E.o.id, columnas: cols.map((c) => c.num), pasos: st.selPaso === "todo" ? "todo" : [st.selPaso], accion: st.selPaso === "todo" ? "completa" : "marcar", horm: st.selHorm || "dias" });')
R('    return `<div class="a2-selp"><div class="a2-et">¿Qué hicieron en ${sel.length === 1 ? "la " + esc((cols[0] || {}).num || "") : "las " + sel.length}?</div><div class="a2-chips">${chips}</div>${aviso}',
  '    const hp = !off3() && sel.length && (st.selPaso === "horm" || st.selPaso === "todo") && cols.some((c) => (E.R["horm|" + c.i] || {}).e === "falta") ? hormPreg("a2HormSel", st.selHorm) : "";\n'
  '    return `<div class="a2-selp"><div class="a2-et">¿Qué hicieron en ${sel.length === 1 ? "la " + esc((cols[0] || {}).num || "") : "las " + sel.length}?</div><div class="a2-chips">${chips}</div>${hp}${aviso}')
R('      const P = planMarcar({ obra: st.id, columnas: cols, pasos: st.selPaso === "todo" ? "todo" : [st.selPaso], accion: st.selPaso === "todo" ? "completa" : "marcar" });\n      const r = await hacer(P, "a2SelMot"); if (r && r.ok) { st.sel = null; st.selPaso = ""; st.selMot = ""; } return pintar();',
  '      const P = planMarcar({ obra: st.id, columnas: cols, pasos: st.selPaso === "todo" ? "todo" : [st.selPaso], accion: st.selPaso === "todo" ? "completa" : "marcar", horm: st.selHorm || "dias" });\n      const r = await hacer(P, "a2SelMot"); if (r && r.ok) { st.sel = null; st.selPaso = ""; st.selMot = ""; st.selHorm = ""; } return pintar();')
R('document.addEventListener("input", (e) => { if (e.target && e.target.id === "a2SelMot") st.selMot = e.target.value; });',
  'document.addEventListener("input", (e) => { if (e.target && e.target.id === "a2SelMot") st.selMot = e.target.value; });\n'
  '  document.addEventListener("change", (e) => { if (e.target && e.target.name === "a2HormSel") { st.selHorm = e.target.value; st.selMot = ($("a2SelMot") || {}).value || st.selMot; pintar(); } });')
# hoja de la columna y de la celda: la pregunta del hormigón
R('      + motivoInput() + `<div class="a2-pgs">${grupos}</div>`',
  '      + (ed && !off3() && (E.R["horm|" + i] || {}).e === "falta" ? hormPreg("a2Horm") : "") + motivoInput() + `<div class="a2-pgs">${grupos}</div>`')
R('${fot}${ed ? motivoInput() : ""}${acc}',
  '${fot}${ed && !off3() && p === "horm" && r.e === "falta" ? hormPreg("a2Horm") : ""}${ed ? motivoInput() : ""}${acc}')
R('    if (a === "completa") { const E = estado(id), c = E.L.cols[H.i]; const r = await hacer(planMarcar({ obra: id, columnas: [c.num], accion: "completa" })); if (r && r.ok) hojaColumna(id, H.i); return; }',
  '    if (a === "completa") { const E = estado(id), c = E.L.cols[H.i]; const r = await hacer(planMarcar({ obra: id, columnas: [c.num], accion: "completa", horm: hormLeer("a2Horm") })); if (r && r.ok) hojaColumna(id, H.i); return; }')
R('      const r = await hacer(planMarcar({ obra: id, columnas: [c.num], pasos: [t.dataset.p], accion: ac, motivo: mot }));\n      if (r && r.ok) { H.tipo === "cel" ? cerrarHoja() : hojaColumna(id, i); } return;',
  '      const P0 = planMarcar({ obra: id, columnas: [c.num], pasos: [t.dataset.p], accion: ac, motivo: mot, horm: hormLeer("a2Horm") });\n'
  '      const r = await hacer(P0);\n'
  '      if (r && r.ok) { H.tipo === "cel" ? cerrarHoja() : hojaColumna(id, i); }\n'
  '      if (r && r.ok && !off3() && P0.avisos && P0.avisos.length) { const t2 = r.txt + " ⏳ Ojo: " + P0.avisos.join(". ") + " (quedó marcado igual)."; hmsg(t2); msgPant(t2); }\n'
  '      return;')
# historial de la columna: solo los cambios de ESA columna (la Col 1 mostraba también los de la Col 10–12)
R('String(x.key).indexOf("_" + c.key) >= 0', 'deCol(x.key, c)', 2)
R('  const kCel = (p, c) => "c_" + p + "_" + c.key,',
  '  const deCol = (k, c) => (off3() ? String(k).indexOf("_" + c.key) >= 0 : new RegExp("_" + String(c.key).replace(/[^A-Za-z0-9_]/g, "") + "(_|$)").test(String(k)));\n'
  '  const kCel = (p, c) => "c_" + p + "_" + c.key,')
# el cartel de la hoja no se borra cuando la hoja se vuelve a dibujar sola (después de guardar)
R('    if (ov.firstChild && y) ov.firstChild.scrollTop = y;\n    H = Object.assign(H || {}, { re });',
  '    if (ov.firstChild && y) ov.firstChild.scrollTop = y;\n    H = Object.assign(H || {}, { re });\n'
  '    if (!off3() && HMSG && Date.now() - HMSG.ts < 6000) { const m = $("a2HMsg"); if (m) { m.textContent = HMSG.t; m.classList.toggle("mal", !!HMSG.mal); } }')
R('  const hmsg = (t, mal) => { const m = $("a2HMsg"); if (m) { m.textContent = t; m.classList.toggle("mal", !!mal); } };',
  '  let HMSG = null;\n  const hmsg = (t, mal) => { HMSG = { t, mal, ts: Date.now() }; const m = $("a2HMsg"); if (m) { m.textContent = t; m.classList.toggle("mal", !!mal); } };')
R('  function cerrarHoja() { const v = $("a2Ov"); v && v.remove(); H = null; }',
  '  function cerrarHoja() { const v = $("a2Ov"); v && v.remove(); H = null; HMSG = null; }')
# lo puesto al día no tiene fecha real: cuenta desde el principio en la curva y no infla el ritmo ni «lo último que pasó»
R('if (HECHO[r.e] || r.e === "pieza") l.push({ ts: r.ts || 0, f: r.fecha || fechaDe(r.ts), w:',
  'if (HECHO[r.e] || r.e === "pieza") l.push({ ts: pdSin(r) ? 0 : r.ts || 0, f: pdSin(r) ? SIN_F : r.fecha || fechaDe(r.ts), w:')
R('const ini = mis[0] || (ev[0] && ev[0].f) || "";', 'const ini = mis[0] || (ev.find((x) => x.f !== SIN_F) || {}).f || "";')
R('const ultima = ev.length ? ev[ev.length - 1].f : mis.length ? mis[mis.length - 1] : "";',
  'const evF = ev.filter((x) => x.f !== SIN_F), ultima = evF.length ? evF[evF.length - 1].f : mis.length ? mis[mis.length - 1] : "";')
R('const l = T.ev.slice().reverse().slice(0, 6);', 'const l = T.ev.filter((x) => x.f !== SIN_F).reverse().slice(0, 6);')
# la hoja «⚡ Poner al día» (antes de lo del asistente)
R('  // ============================================================== para el asistente, el auditor y los demás\n  function paraIa(obra, col) {',
  PUESTA + '  // ============================================================== para el asistente, el auditor y los demás\n  function paraIa(obra, col) {')
R('abrirColumna: hojaColumna, cerrarHoja,', 'abrirColumna: hojaColumna, cerrarHoja, planPuesta, abrirPuesta: (id) => hojaPuesta(id || st.id), hormExtra,')
# estilo
R('.a2-fbtn{white-space:nowrap}',
  '.a2-fbtn{white-space:nowrap}\n'
  '/* v163 · ⚡ Poner al día y «¿Cuándo se hormigonó?» */\n'
  '.a2-fbtn.a2-pdb{grid-column:1/-1;background:#fff;color:var(--navy,#28285E);border-color:#fff}\n'
  '.a2-hp{border:0;margin:12px 0 0;padding:10px 12px 8px;border-radius:14px;background:#F3F7FA;min-width:0}\n'
  '.a2-hp legend{float:left;width:100%;padding:0;margin:0 0 4px;font-weight:700;font-size:14px;color:var(--text,#0D1424)}\n'
  '.a2-hp label{display:flex;align-items:center;min-height:42px;font-size:14.5px;cursor:pointer}\n'
  '.a2-hp input{width:20px;height:20px;margin:0 10px 0 0;flex:none}\n'
  '.a2-hp small{display:block;clear:both;color:var(--text-3,#6E7C93);font-size:12px;line-height:1.35}\n'
  '.a2-pdsel{display:flex;flex-wrap:wrap;align-items:center}\n'
  '.a2-pdck{display:inline-flex;align-items:center;min-height:44px;margin:0 6px 6px 0;padding:0 12px;border-radius:999px;border:1px solid #d5dde8;background:#fff;font-size:14px;cursor:pointer;max-width:100%}\n'
  '.a2-pdck input{width:18px;height:18px;margin:0 6px 0 0;flex:none}\n'
  '.a2-pdtodo{border-color:#1E6F91;background:#EEF6FA}\n'
  '.a2-pdsel select{width:auto;max-width:44%;min-height:44px;margin:0 6px 6px 0}\n'
  '.a2-pdh{margin:0 6px 6px 0;font-size:14px;color:var(--text-soft,#475569)}\n'
  '.a2-pdpre .chip{min-height:40px}\n'
  '.a2-pdd{margin:4px 0 0}\n'
  '.a2-pdd summary{min-height:44px;display:flex;align-items:center;cursor:pointer;color:#1E6F91;font-weight:600;font-size:14px}\n'
  '.a2-pdk{display:flex;align-items:center;justify-content:space-between;min-height:46px;border-bottom:1px solid #eef1f6;font-size:14px}\n'
  '.a2-pdk label{display:flex;align-items:center;flex:1 1 auto;min-width:0;cursor:pointer}\n'
  '.a2-pdk label span{min-width:0;overflow-wrap:anywhere}\n'
  '.a2-pdk input[type=checkbox]{width:20px;height:20px;margin:0 8px 0 0;flex:none}\n'
  '.a2-pdk.ok,.a2-pdk.nl{color:var(--text-3,#6E7C93)}\n'
  '.a2-pdk small{color:var(--text-3,#6E7C93);font-size:12px;flex:none;margin-left:8px}\n'
  '.a2-pdc{display:flex;align-items:center;flex:none;margin-left:8px}\n'
  '.a2-pdc input{width:76px;min-height:40px;margin:0 6px 0 0;padding:4px 6px}\n'
  '.a2-pdc small{margin:0;max-width:92px}\n'
  '.a2-pdpie{position:sticky;bottom:0;background:#fff;padding:8px 0 2px;margin-top:10px;box-shadow:0 -10px 14px rgba(255,255,255,.95);z-index:1}\n'
  '.a2-pdres{padding:10px 12px;border-radius:14px;background:#EAF6EE;color:#1f5b33;font-size:14px}\n'
  '.a2-pdres b{display:block;font-size:18px}\n'
  '.a2-pdres span{display:block}\n'
  '.a2-pdres small{display:block;color:#7a4b00;margin-top:2px}\n'
  '.a2-pdres.gris{background:#EEF1F6;color:var(--text-soft,#475569)}\n'
  '.a2-pdpie .a2-acc{margin-top:8px}\n')
# ---------------------------------------------------------------- asistente (dormido): puesta al día / toda terminada
R('cosa: a.cosa || "", cant: a.cant, motivo: a.motivo, porAsistente: true });',
  'cosa: a.cosa || "", cant: a.cant, cosas: a.cosas || "", horm: a.cuando_hormigon || "", motivo: a.motivo, porAsistente: true });')
R('cosa: a.cosa || "", cant: a.cant }, motivo: String(a.motivo)',
  'cosa: a.cosa || "", cant: a.cant, cosas: a.cosas || "", horm: a.cuando_hormigon || "" }, motivo: String(a.motivo)')
R('enum: ["marcar", "desmarcar", "completa", "falla", "obs", "nolleva", "pieza_falta", "pieza_ok"] }',
  'enum: ["marcar", "desmarcar", "completa", "falla", "obs", "nolleva", "pieza_falta", "pieza_ok"].concat(window.__v163No ? [] : ["puesta_al_dia", "toda_terminada"]) }')
R('preguntá si lo marcaron igual.", input_schema',
  'preguntá si lo marcaron igual." + (window.__v163No ? "" : " PUESTA AL DÍA (v163): si dice que ya estaba hecho y no se cargó («poné al día el avance», «de la 1 a la 6 ya están izadas», «la zanja ya está»), accion puesta_al_dia con columnas, pasos (o «todo») y cosas sin columna (o «todas»); solo suma lo que falta y NO fragua. Si dice que está toda terminada, accion toda_terminada (todo hecho de una). Al marcar el hormigón a mano, cuando_hormigon: «dias» (de entrada: ya estaba fraguado) u «hoy»/«ayer» si lo hormigonaron hace poco (ahí fragua 72 h)."), input_schema')
R('motivo: TXT("el porqué, con las palabras de la persona") }, ["obra", "accion", "motivo"]) });',
  'cosas: TXT("cosas sin columna para la puesta al día: «zanja, cable, tablero» o «todas» (opcional)"), cuando_hormigon: { type: "string", enum: ["dias", "hoy", "ayer"], description: "cuándo se hormigonó lo que se marca a mano (de entrada «dias»: ya fraguado)" }, motivo: TXT("el porqué, con las palabras de la persona") }, ["obra", "accion", "motivo"]) });')
R('usá proponer_marcar_avance con el motivo que diga la persona (nunca lo inventes).",',
  'usá proponer_marcar_avance con el motivo que diga la persona (nunca lo inventes). PUESTA AL DÍA (v163): «ya estaba hecha toda», «está terminada», «poné al día el avance de X» → proponer_marcar_avance con accion toda_terminada o puesta_al_dia (columnas, pasos, cosas); lo marcado así no fragua (ya estaba hecho) salvo que diga que lo hormigonaron hoy o ayer (cuando_hormigon); lo de las órdenes no se toca y después el avance sigue solo con las órdenes.",')
# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
