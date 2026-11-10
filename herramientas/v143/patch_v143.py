"""v143 · Orden sugerida (aprobada por Ángel, 10/11/2026): la app arma sola, sin IA, las órdenes del día siguiente (y de la
semana, encadenadas) con lo que queda de cada obra, lo que quedó de ayer, el orden de obra (pozo → hormigón, fraguado 72 h,
zanja → cable → tapado, izaje → vínculo → luminaria, jabalina con los tableritos), los rendimientos que dio Ángel / lo medido /
el diccionario, la misma cuadrilla en cada obra, el equipo civil aparte, las ausencias, los vehículos por tipo y lugares y la
reserva de material contra el pañol. Hoja «Órdenes para mañana» (por obra · por persona · semana), cambios con pocos toques,
«Emitir las N» por el mismo camino que «Llenar orden» (emitirOrdenTrabajo), recordatorio a las 7:00 (avisosPush con
enviarDesde, Worker ema-avisos v143), «📤 Plan para la inspección» (A4) y «🧠 Lo que aprende la app» (tiempos medidos y material
calculado vs. entregado). El asistente lee la sugerida (ordenes_sugeridas), la revisa y propone cambios (proponer_ordenes_
sugeridas, proponer_rendimiento) con tarjeta y «Sí». Ajustes en configEquipo/baremo.sugerida; ausencias y equipo civil en
configEquipo/personal; tipo y lugares en configEquipo/personal.vehiculos: sin reglas nuevas.
Las pruebas viejas no lo ven (__sugNo, salvo sugerida:true en h.js).
Uso: python3 patch_v143.py ORIGINAL_142.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA' if os.path.exists(os.path.join(SRC, 'BASE_SHA')) else 'BASE_SHA_142')).read().strip()   # ORIGINAL 142
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 142 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip() + '\n'
assert t.count('id="ordenSugerida"') == 0, 'ya tiene la v143'
css, js, ia = leer('ordenSugerida.css'), leer('ordenSugerida.js'), leer('sugeridaIa.js')
for x in (css, js, ia): assert ':has(' not in x and '</script' not in x

# 1) Inicio Ejecutivo: tarjeta «Mañana: N órdenes sugeridas» arriba de «Para atender» y «🧠 Lo que aprende la app» en Accesos
R('<div class="ie-col"><div class="ent ie-tarj" style="animation-delay:290ms" id="ieAtender"></div>',
  '<div class="ie-col"><div class="ent ie-tarj" style="animation-delay:280ms" id="ieSug"></div><div class="ent ie-tarj" style="animation-delay:290ms" id="ieAtender"></div>')
R('poner("ieAtender", atenderHtml(d));',
  '{ const sg = window.__sugerida ? intentar(() => window.__sugerida.inicioHtml(), "") : ""; poner("ieSug", sg); const se = $("ieSug"); se && (se.style.display = sg ? "" : "none"); }   // v143: orden sugerida\n    poner("ieAtender", atenderHtml(d));')
R('`<button type="button" class="ie-acc" data-ie="v:${v}"><span class="ie-ic">${ic(i, 1.5, "v5-ic s22")}</span>${t}</button>`).join("")}</div>`;',
  '`<button type="button" class="ie-acc" data-ie="v:${v}"><span class="ie-ic">${ic(i, 1.5, "v5-ic s22")}</span>${t}</button>`).join("")}${window.__sugerida && intentar(() => window.__sugerida.puedeAprende(), false) ? \'<button type="button" class="ie-acc" data-ap="abrir"><span class="ie-ic" style="display:flex;align-items:center;justify-content:center;font-size:22px">🧠</span>Lo que aprende la app</button>\' : ""}</div>`;   // v143')
# 2) avisos al celu: la hoja de sugeridas puede emitir sin el aviso de siempre («Aviso al emitir» apagado)
R('    if (!o || /anulada|cerrada/i.test(String(o.estado || "")) || String(o.fecha || "") < hoyISO()) return;',
  '    if (window.__otSinAviso) return;   // v143: «Aviso al emitir» apagado en la orden sugerida\n    if (!o || /anulada|cerrada/i.test(String(o.estado || "")) || String(o.fecha || "") < hoyISO()) return;')
# 3) vehículos: el tipo (grúa, hidro chica, barquilla, transporte, auto) y los lugares no se pierden al guardar
R('activo: v.activo !== false })).filter((v) => v.nombre);',
  'activo: v.activo !== false, tipo: v.tipo || "", lugares: Number(v.lugares) > 0 ? Math.round(Number(v.lugares)) : null })).filter((v) => v.nombre);   // v143: tipo y lugares')
# 4) Supervisor: una línea «rendimientos» si lo medido se aleja mucho de lo que se usa (sin IA extra)
R('try { st.lista = controlar(); }', 'try { st.lista = controlar().concat(window.__sugerida && window.__sugerida.supHallazgos ? window.__sugerida.supHallazgos() : []); }   /* v143 */')
R('    else if (x.tipo === "v") V.ir(x.v);', '    else if (x.tipo === "v") V.ir(x.v);\n    else if (x.tipo === "aprende") { try { window.__sugerida.abrirAprende("tiempos"); } catch (e) { } }   // v143')
# 5) asistente (código dormido): ordenes_sugeridas, proponer_ordenes_sugeridas, proponer_rendimiento, revisar e informe
R('  window.__asistente = { alcance, nivelRol', ia + '  window.__asistente = { revisarSugerida, informeRendimientos, alcance, nivelRol')
R('        const g = await GUARDAR[P.tipo](P);',
  '        const g = await GUARDAR[P.tipo](P, soloCargar);\n        if (g && g.cargada) { fin("cargada", g.txt, "cancelada"); notas.push(`La persona pidió revisar la propuesta ${P.id} en la hoja: no se emitió nada.`); return; }   // v143: «Abrir la hoja»')
R('    if (P.tipo !== "cierre" || !d.rapido) return `<button type="button" class="btn-primary" data-iasi="${P.id}">Sí, hacelo</button>`;',
  '    if (P.tipo === "sugeridas") return `<button type="button" class="btn-primary" data-iasi="${P.id}">Sí, emitir ${d.n === 1 ? "la orden" : "las " + d.n}</button>`;   // v143\n    if (P.tipo !== "cierre" || !d.rapido) return `<button type="button" class="btn-primary" data-iasi="${P.id}">Sí, hacelo</button>`;')
R('      pie = d.pie || "";\n', '      pie = d.pie || "";\n      if (P.tipo === "sugeridas") extra = `<button type="button" class="btn-ghost" data-iarev="${P.id}">Abrir la hoja</button>`;   // v143\n')
R('const SI_RE = /^(s[ií]|dale|hacelo|confirmo|confirmalo|de una)([\\s,.!¡]+(s[ií]|dale|hacelo|confirmalo|confirmo|por favor|gracias|que s[ií]))*[\\s.!]*$/i;',
  'const SI_RE = /^(s[ií]|dale|hacelo|confirmo|confirmalo|de una|emit[ií]l[ao]s?|mandal[ao]s?)([\\s,.!¡]+(s[ií]|dale|hacelo|confirmalo|confirmo|por favor|gracias|que s[ií]|emit[ií]l[ao]s?|mandal[ao]s?|todas))*[\\s.!]*$/i;   // v143: «sí, emitilas»')
R('    "- Nunca digas que hiciste algo que cambia datos.',
  '    "- Órdenes sugeridas (v143): LA ARMA LA APP. Para «armame las órdenes de mañana» usá ordenes_sugeridas y contá lo que dice (no armes órdenes vos ni recalcules). Los cambios («sacá a Diego de Las Acacias», «poné 6 izajes en Los Álamos») van todos juntos en UNA proponer_ordenes_sugeridas; «sí, emitilas» confirma la tarjeta.",\n    "- Nunca digas que hiciste algo que cambia datos.')
# 6) el módulo nuevo (antes del último script)
R('<script id="revisarAppDiag">', '<style id="ordenSugeridaCss">\n' + css + '</style>\n<script id="ordenSugerida">\n' + js + '</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
