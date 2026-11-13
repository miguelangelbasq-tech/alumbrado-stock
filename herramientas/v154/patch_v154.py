"""v154 · El asistente entiende, explica y corrige TODOS los puntos (auditor de puntos). Ángel (13/11): «cualquier pregunta de
   los puntos se la tengo que poder hacer a la IA… me tiene que decir exactamente por qué se le dio ese punto, si es válido…
   detectar, mover, cambiar, todo con la autorización de nosotros (la oficina y yo)».
 · Motor window.__auditPuntos (módulo auditorPuntos, antes de revisarAppDiag): la cuenta paso a paso de puntosDeOrden
   (explicar por orden / tarea / persona y período, el mismo total que Producción), revisar sin IA (hallazgos + línea del
   Supervisor), motivo obligatorio y historial (⭐ Puntos, puntos a mano del cierre, «Cuánto vale cada tarea» →
   configEquipo/baremo.hist[], criterios → baremo.criterios[]), cambios con «Sí» (puntos entre personas, valor de una tarea,
   varias juntas con casillas, mover lo hecho de una orden a otra con el motor de la v153). Hoja #qpOv sin IA.
 · Asistente: explicar_puntos (también la cuadrilla, solo lo suyo), revisar_puntos, proponer_nota_puntos,
   proponer_puntos_persona, proponer_valor_tarea, proponer_correcciones_puntos; SISTEMA lo sabe. Solo admin/oficina.
 · Base: expone __pesosRol, __baremoFabrica y __ptsTareaManual (lectura) para explicar la cuenta con los mismos números.
Pruebas viejas: __v154No (salvo v154:true). Sin reglas nuevas. Se reaplica con --otra-base.
Uso: python3 patch_v154.py ORIGINAL_153.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 153
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 153 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip('\n')
assert t.count('id="auditorPuntos"') == 0, 'ya tiene la v154'

# 1) la base: pesos de los roles, valores de fábrica y el valor de una tarea escrita a mano (solo lectura, para explicar la cuenta)
R('  window.baremoActual = () => h;', '  window.baremoActual = () => h;\n  window.__pesosRol = () => k; window.__baremoFabrica = () => Se; window.__ptsTareaManual = () => T;   // v154: para explicar la cuenta')

# 2) «⭐ Puntos» (puntosEditar): motivo obligatorio y en el historial
R("<div class=\"pe-acc\">${puede() ? '<button type=\"button\" class=\"btn-primary\" data-pe=\"guardar\">💾 Guardar los puntos</button>' : \"\"}",
  "${!window.__v154No && puede() ? `<label class=\"cc-campo pe-mot\">Motivo del cambio (queda en el historial)<input type=\"text\" id=\"peMotivo\" maxlength=\"300\" value=\"${esc(st.motivo || \"\")}\" placeholder=\"Ej: Pablo hizo casi todo el apoyo solo\"></label>` : \"\"}<div class=\"pe-acc\">${puede() ? '<button type=\"button\" class=\"btn-primary\" data-pe=\"guardar\">💾 Guardar los puntos</button>' : \"\"}")
R('    const T = total(), suma = r2(st.gente.reduce((s, g) => s + g.pts, 0));\n',
  '    const T = total(), suma = r2(st.gente.reduce((s, g) => s + g.pts, 0));\n    if (!window.__v154No && String(st.motivo || "").trim().length < 3) { const i = $("peMotivo"); i && i.focus(); return msg("Escribí el motivo del cambio (queda en el historial).", true); }   // v154\n')
R('concat([{ ts: Date.now(), por: yo, antes: st.antes, despues: r2(T), tareas: st.tareas.map((t) => t.tarea + " " + r2(t.pu)).slice(0, 12) }])',
  'concat([Object.assign({ ts: Date.now(), por: yo, antes: st.antes, despues: r2(T), tareas: st.tareas.map((t) => t.tarea + " " + r2(t.pu)).slice(0, 12) }, window.__v154No ? {} : { tipo: "puntos", motivo: String(st.motivo || "").trim(), porNombre: (() => { try { const y = PERMISOS.yo(); return (y && (y.nombre || y.usuario)) || ""; } catch (e) { return ""; } })(), personas: st.gente.map((g, i) => ({ nombre: g.nombre, antes: r2(st.antesGente[i] || 0), despues: r2(g.pts) })).filter((p) => Math.abs(p.antes - p.despues) > 0.009) })])')
R('window.fbAuditar("ot_puntos", `${o.numero || o.id}: ${f1(st.antes)} → ${f1(T)} pts`)',
  'window.fbAuditar("ot_puntos", `${o.numero || o.id}: ${f1(st.antes)} → ${f1(T)} pts` + (st.motivo ? " · " + st.motivo : ""), window.__v154No ? undefined : { ref: o.id, motivo: String(st.motivo || "").trim() })')
R('    else if (x.dataset.peg != null) { const g = st.gente[+x.dataset.peg]; g.pts = Math.max(0, r2(num(x.value))); g.tocado = true; setTimeout(pintar, 0); }\n  });',
  '    else if (x.dataset.peg != null) { const g = st.gente[+x.dataset.peg]; g.pts = Math.max(0, r2(num(x.value))); g.tocado = true; setTimeout(pintar, 0); }\n  });\n  document.addEventListener("input", (e) => { if (st && e.target && e.target.id === "peMotivo") st.motivo = e.target.value; });   // v154')

# 3) Supervisor: la línea de los puntos
R('.concat(window.__verifOt && !window.__v150No ? window.__verifOt.supHallazgos() : []); }',
  '.concat(window.__verifOt && !window.__v150No ? window.__verifOt.supHallazgos() : []).concat(window.__auditPuntos && !window.__v154No ? window.__auditPuntos.supHallazgos() : []); }   /* v154 */')
R('    else if (x.tipo === "verif") { try { window.__verifOt.abrir(x.id); } catch (e) { } }   // v150',
  '    else if (x.tipo === "verif") { try { window.__verifOt.abrir(x.id); } catch (e) { } }   // v150\n    else if (x.tipo === "puntos") { try { window.__auditPuntos.abrir({ tab: "rev" }); } catch (e) { } }   // v154')

# 4) asistente (código dormido): la cuadrilla puede preguntar por SUS puntos, SISTEMA y las herramientas
R('crew: ["buscar_obra", "datos_obra", "ubicacion_obra", "ordenes", "stock", "puntos", "ver_plano", "como_se_hace", "abrir"]',
  'crew: ["buscar_obra", "datos_obra", "ubicacion_obra", "ordenes", "stock", "puntos", "explicar_puntos", "ver_plano", "como_se_hace", "abrir"]')
R('    "- Órdenes YA CERRADAS (v153): SÍ PODÉS CORREGIR EL CIERRE',
  '    "- PUNTOS (v154): SÍ PODÉS EXPLICAR, REVISAR, ANOTAR EL PORQUÉ Y CORREGIR los puntos. Para «¿por qué Juan tiene N puntos?», «¿de dónde salen los 9,25?», «¿por qué esa tarea dio más?» usá explicar_puntos y mostrá SIEMPRE la cuenta paso a paso (cantidad × valor de la tarea, de dónde sale el valor, la regla de reparto, rol × horas, la parte de cada uno y el total, que es el mismo que muestra Producción). Si hubo cambios a mano, decí quién, cuándo y el MOTIVO anotado; si dice «sin motivo anotado», decilo así: NUNCA inventes un motivo. Usá revisar_puntos para ver si están bien. Para guardar el porqué de una decisión de la oficina: proponer_nota_puntos (con sus palabras). Para cambiar: proponer_corregir_cierre (lo hecho, quiénes), proponer_puntos_persona (mover puntos entre personas de una orden), proponer_valor_tarea (cuánto vale una tarea, solo hacia adelante) y proponer_correcciones_puntos (varias juntas, en una tarjeta con casillas, también «mover» lo hecho de una orden a otra). Todo cambio pide MOTIVO: si no lo dijo, preguntalo. Ante dudas, preguntá antes de proponer.",\n    "- Órdenes YA CERRADAS (v153): SÍ PODÉS CORREGIR EL CIERRE')
R('  window.__asistente = { resumenSemana,', leer('ia154.js') + '\n  window.__asistente = { resumenSemana,')

# 5) el módulo nuevo (antes del último script)
R('<script id="revisarAppDiag">', '<style id="auditorPuntosCss">\n' + leer('auditorPuntos.css') + '\n</style>\n<script id="auditorPuntos">\n' + leer('auditorPuntos.js') + '\n</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
