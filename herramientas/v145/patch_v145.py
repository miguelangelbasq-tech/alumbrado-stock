"""v145 · Certificación mensual automática + material contra avance (y lo que aprende la app del material)
+ gente sin tarea cada día hábil (agregado de Ángel, 10/11/2026).
 · Certificación (maqueta i1): por obra de nuestra zona (v144) y total, con el avance que dejaron las órdenes cerradas
   (cierre.avanceItems con la fecha de la orden); lo cargado a mano sin fecha se avisa y no se reparte; plazas ya
   ejecutadas con lo certificado por la Municipalidad como anterior; provisiones aparte; $ sin IVA y con IVA; PDF con QR y
   planilla; cerrar el mes (Administración, con «Sí») = foto fija en avanceObras.certificados.<AAAA-MM> y
   configEquipo/precios.certCerrados. Herramienta del asistente «certificacion» (solo admin y oficina).
 · Material contra avance (maqueta i2): legajo, 🧠 Lo que aprende la app › 📦 Material, Supervisor; material real por
   columna y tipo de obra; «✨ Informe del asistente» que solo anota la sugerencia (configEquipo/baremo.aprendeMaterial).
 · Gente sin tarea: bloque en la orden sugerida con «Sumar a…» y el porqué, cartel al emitir, Inicio «Para atender»,
   recordatorio 17:00 a Administración y Oficina, días sin tarea del mes en 🧠.
Sin reglas nuevas. Pruebas viejas: window.__v145No (salvo v145:true en h.js).
Uso: python3 patch_v145.py ORIGINAL_144.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 144
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 144 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip() + '\n'
assert t.count('id="certMensual"') == 0, 'ya tiene la v145'
css, cert, mat, sin, ia, fnom, grad = leer('v145.css'), leer('certMensual.js'), leer('matAvance.js'), leer('sinTarea.js'), leer('ia145.js'), leer('fmtNombre.js'), leer('gradAccion.css')
reg = leer('sugReglas.js')
for x in (css, cert, mat, sin, ia, fnom, grad, reg): assert ':has(' not in x and '</script' not in x and '?.' not in x and '??' not in x

# 1) informes: el armador de planillas Excel queda a mano para la certificación
R('  const Je = (e, a) => `Informe_${', '  window.__infExcel = Bt;   // v145: la certificación arma su planilla con el mismo formato\n  const Je = (e, a) => `Informe_${')
# 2) Supervisor: material contra avance (sin IA)
R('.concat(window.__obraGps ? window.__obraGps.supHallazgos() : []); }   /* v144 */',
  '.concat(window.__obraGps ? window.__obraGps.supHallazgos() : []).concat(window.__matAvance && !window.__v145No ? window.__matAvance.supHallazgos() : []); }   /* v145 */   /* v144 */')
# 3) 🧠 Lo que aprende la app: 📦 Material (material contra avance + material real) y 👷 Días sin tarea
R('<div class="sg-av info">ⓘ Próximamente: material real por columna y por tipo de obra (lo que de verdad se usa, para afinar los cómputos).</div></div>`;',
  '${window.__matAvance && !window.__v145No ? "" : \'<div class="sg-av info">ⓘ Próximamente: material real por columna y por tipo de obra (lo que de verdad se usa, para afinar los cómputos).</div>\'}</div>${window.__matAvance && !window.__v145No ? window.__matAvance.aprendeHtml() : ""}`;   // v145')
R('data-ap="tab" data-v="material">📦 Material</button></div>',
  'data-ap="tab" data-v="material">📦 Material</button>${window.__sinTarea && !window.__v145No ? `<button type="button" class="subtab${ap.tab === "sintarea" ? " activo" : ""}" data-ap="tab" data-v="sintarea">👷 Días sin tarea</button>` : ""}</div>')
R('${ap.tab === "material" ? htmlMaterial() : htmlTiempos()}</div>`;',
  '${ap.tab === "material" ? htmlMaterial() : ap.tab === "sintarea" && window.__sinTarea ? window.__sinTarea.aprendeHtml() : htmlTiempos()}</div>`;')
# 4) orden sugerida: gente sin tarea (bloque, cartel al emitir, después de emitir, ajustes, asistente)
R('avisoEmitir: true, recordatorio: true,', 'avisoEmitir: true, recordatorio: true, sinTareaAviso: true, sinTareaHora: "17:00",')
R('  function htmlPorObra(d) {\n    let h = d.avisos.map(', '  function htmlPorObra(d) {\n    let h = (window.__sinTarea ? window.__sinTarea.bloqueSug(d) : "") + d.avisos.map(')
R('  function htmlPorPersona(d) {\n    let h = "";', '  function htmlPorPersona(d) {\n    let h = window.__sinTarea ? window.__sinTarea.bloqueSug(d) : "";')
R('<div class="sg-accs"><button type="button" class="btn-ghost" data-sg="x" data-h="sgEm">Volver</button>',
  '${window.__sinTarea ? window.__sinTarea.cartelEmitir(d) : ""}<div class="sg-accs"><button type="button" class="btn-ghost" data-sg="x" data-h="sgEm">Volver</button>')
R('    st.fecha = f;\n    const ov = $("sgOv"); if (ov && !ov.hidden) { ov.__h = ""; pintar(); } else abrir(f);',
  '    if (r.ok.length && window.__sinTarea) st.msg += window.__sinTarea.msgTrasEmitir(f);   // v145: quién queda sin tarea\n    st.fecha = f;\n    const ov = $("sgOv"); if (ov && !ov.hidden) { ov.__h = ""; pintar(); } else abrir(f);')
R('<div class="sg-accs"><button type="button" class="btn-ghost" data-sgc="descartar">Descartar cambios</button>',
  '${window.__sinTarea ? window.__sinTarea.cfgHtml(C) : ""}<div class="sg-accs"><button type="button" class="btn-ghost" data-sgc="descartar">Descartar cambios</button>')
R('      sinOrden: d.libres.map((p) => p.nombre + (p.rol ? " (" + p.rol + ")" : "")),',
  '      sinOrden: d.libres.map((p) => p.nombre + (p.rol ? " (" + p.rol + ")" : "")), sinTarea: window.__sinTarea && !window.__v145No ? window.__sinTarea.paraIa(d) : [],')
R('estado: () => ({ fecha: st.fecha, vista: st.vista', 'cambio, estado: () => ({ fecha: st.fecha, vista: st.vista')
# 5) Inicio Ejecutivo › Para atender: personas sin tarea (hoy / mañana)
R('if (pu.length) l.push({ ir: "usuarios"', 'try { (window.__sinTarea ? window.__sinTarea.atender() : []).forEach((x) => l.push(x)); } catch (e) { }   // v145\n    if (pu.length) l.push({ ir: "usuarios"')
# 6) asistente (código dormido): certificacion, proponer_aprende_material, informe del material; la gente sin tarea en la sugerida
R('  window.__asistente = { revisarSugerida, informeRendimientos, alcance', ia + '  window.__asistente = { informeMaterial, revisarSugerida, informeRendimientos, alcance')
R('    "- Órdenes sugeridas (v143): LA ARMA LA APP.',
  '    "- Gente sin tarea (v145): todo el personal de alumbrado tiene que tener una tarea cada día hábil, salvo ausencia. Si ordenes_sugeridas trae «sinTarea», decilo y proponé dónde ponerlos (sumar_persona en UNA proponer_ordenes_sugeridas), usando «dondePonerlo» (ya viene con el porqué).",\n    "- Certificación (v145): para «¿cuánto certificamos?» usá certificacion y contá lo que dice; lo cargado sin fecha no se reparte (está en paraRevisar).",\n    "- Órdenes sugeridas (v143): LA ARMA LA APP.')
# 8) mayúsculas prolijas (solo cómo se muestra): Inicio Ejecutivo, Obras (lista y legajo), cámara
FN = 'window.__fmtNombre'
R('<b>${esc(x.o.nombre || "(sin nombre)")}</b>', '<b>${esc(' + FN + ' ? ' + FN + '.obra(x.o.nombre || "(sin nombre)") : x.o.nombre || "(sin nombre)")}</b>')
R('${esc(x.o.barrio ? "Bº " + x.o.barrio : x.o.direccion || "—")}', '${esc(x.o.barrio ? (' + FN + ' ? ' + FN + '.barrio(x.o.barrio) : "Bº " + x.o.barrio) : ' + FN + ' && x.o.direccion ? ' + FN + '.direccion(x.o.direccion) : x.o.direccion || "—")}')
R('${r.barrio ? " · " + i(r.barrio) : ""}</div>', '${r.barrio ? " · " + i(' + FN + ' ? ' + FN + '.barrio(r.barrio) : r.barrio) : ""}</div>')
R('<div class="lg-chips">${a.barrio ? `<span class="lg-chip">${i(a.barrio)}</span>` : ""}${a.direccion ? `<span class="lg-chip">📍 ${i(a.direccion)}</span>` : ""}',
  '<div class="lg-chips">${a.barrio ? `<span class="lg-chip">${i(' + FN + ' ? ' + FN + '.barrio(a.barrio) : a.barrio)}</span>` : ""}${a.direccion ? `<span class="lg-chip">📍 ${i(' + FN + ' ? ' + FN + '.direccion(a.direccion) : a.direccion)}</span>` : ""}')
R('  const nombre = (o) => String((o && (o.nombre || o.plazaNombre)) || "la obra");', '  const nombre = (o) => { const n = String((o && (o.nombre || o.plazaNombre)) || ""); return n ? (window.__fmtNombre ? window.__fmtNombre.obra(n) : n) : "la obra"; };   // v145: en MAYÚSCULAS')
# 9) reglas de Ángel en la sugerida: mínimo 2 en obra, equipos habituales, vínculos sin grúa (sugReglas)
R('reglas: { fraguado: true, pozoHorm: true, zanjaCable: true, izajeCadena: true, mismaGente: true, patTablerito: true, vehiculos: true },',
  'reglas: { fraguado: true, pozoHorm: true, zanjaCable: true, izajeCadena: true, mismaGente: true, patTablerito: true, vehiculos: true, minDos: true, vinculoSinGrua: true }, minObra: 2,   // v145: mínimo en obra y vínculos sin grúa (según Ángel)')
R('      if (civObra === o.id) civilesTodos.forEach(',
  '      try { const nh = window.__sugReglas ? window.__sugReglas.sumarHab(c, lista, { ocup, aus, tomado, quitar, IZ }) : null; if (nh) nh.forEach((t) => ord.avisos.push({ n: "info", t })); } catch (e) { }   // v145: equipos habituales\n      if (civObra === o.id) civilesTodos.forEach(')
R('      if (!ord.tareas.length || !ord.gente.length) ord.incluir = false;',
  '      { const m2 = ord.incluir && ord.gente.length && ord.tareas.length && window.__sugReglas ? window.__sugReglas.okMin(ord, C) : null; if (m2) { ord.incluir = false; ord.solo = true; ord.avisos.push({ n: "rojo", t: m2.join(" ") + " No la emito: sumale a alguien con ＋ o mandalo al galpón (queda en «sin tarea»).", cambiar: true }); } }   // v145: mínimo 2 en obra\n      if (!ord.tareas.length || !ord.gente.length) ord.incluir = false;')
R('    const aCargo = ord.gente.map((p) => vehDe(p.nombre)).filter((v) => v && libres.indexOf(v) >= 0);',
  '    const aCargo = (window.__sugReglas ? window.__sugReglas.vehHab(ord.gente, libres) : []).concat(ord.gente.map((p) => vehDe(p.nombre)).filter((v) => v && libres.indexOf(v) >= 0));   // v145: el vehículo del equipo habitual primero')
R('    const izK = IZ.find((k) => Tt(k) > 0) || "";',
  '    const izK = IZ.find((k) => Tt(k) > 0) || "";\n    const vincSG = !window.__v145No && C.reglas.vinculoSinGrua !== false, vArm = Tt("armado_vinculo") > 0 ? Math.max(0, hecho("armado_vinculo") - hecho("montaje_vinculo")) : 0;   // v145: la grúa no monta vínculos sin armar')
R('(k === "montaje_vinculo" || k === "conexionado_tablerito" ? num(hoyK[izK]) : 0)',
  '((k === "montaje_vinculo" && !(vincSG && vArm <= 0)) || k === "conexionado_tablerito" ? num(hoyK[izK]) : 0)')
R('      if (k === "montaje_vinculo" && izK && num(hoyK[izK]) > 0 && hoyK.__izAngel && hoyK.__izAngel !== "cano2" && hoyK.__izAngel !== "cano3" && hoyK.__izAngel !== "guia") gratis = Math.min(capR, num(hoyK[izK]));',
  '      if (k === "montaje_vinculo" && izK && num(hoyK[izK]) > 0 && hoyK.__izAngel && hoyK.__izAngel !== "cano2" && hoyK.__izAngel !== "cano3" && hoyK.__izAngel !== "guia") gratis = Math.min(capR, num(hoyK[izK]), vincSG ? vArm : Infinity);\n      if (k === "montaje_vinculo" && vincSG && izK && num(hoyK[izK]) > 0 && vArm <= 0) tp.mot.push("Los vínculos de las que se izan hoy van aparte, sin grúa, con hidro chica o barquilla (según Ángel)");   // v145')
R('      if (esIzaje(k)) { const fc = Tt("tendido_cable") > 0', '      if (esIzaje(k)) ctx.sinVinc = vincSG && vArm <= 0;   // v145: izaje «con caño y sin vínculo»\n      if (esIzaje(k)) { const fc = Tt("tendido_cable") > 0')
R('    if (md === "cano") return', '    if (md === "cano" || (md === "auto" && ctx.sinVinc)) return')
# 7) los módulos nuevos (antes del último script)
R('<script id="revisarAppDiag">', '<style id="v145Css">\n' + css + '</style>\n<script id="fmtNombre">\n' + fnom + '</script>\n<script id="certMensual">\n' + cert + '</script>\n<script id="matAvance">\n' + mat + '</script>\n<script id="sugReglas">\n' + reg + '</script>\n<script id="sinTarea">\n' + sin + '</script>\n<style id="gradAccionCss">\n' + grad + '</style>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
