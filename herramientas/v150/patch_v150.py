"""v150 · «Lo hecho, verificado»: la app sabe qué se hizo en cada columna y avisa antes de repetirlo.
 · __hecho (de memoria, sin lecturas nuevas): por obra, tarea y columna/caja: hecho y verificado (orden cerrada o «✅ Está bien»),
   hecho sin verificar (pasos de Modo obra con la hora, fotos con su columna, marcas, «se hizo» mandado), no se hizo (con el porqué)
   y asignado (orden abierta). Nada se escribe: se calcula.
 · __verifOt: la verificación de cada orden sin IA (pedidas · hechas con foto y hora · no se hizo · ✅ cumplida / 🟡 parcial /
   🔴 sin hacer / ⚠ dudosa) en el tablero de Órdenes, el «📸 Avance», el cierre (precarga lo verificado) y el Supervisor;
   «✅ Está bien» (campo.verificado), «Cerrar con esto», «✨ Que lo revise el asistente» (herramienta verificar_orden + ver_fotos).
 · Avisos antes de repetir: Llenar orden (línea por tarea y cartel al emitir: Emitir igual / Dejar solo lo que falta / Cancelar),
   saldoObra (lo hecho sin cerrar sale de «asignado» y lo que no se hizo vuelve a «queda»: la sugerida y el pase a mañana usan lo
   que falta de verdad), el asistente (proponer_orden, proponer_ordenes_sugeridas, cierre por voz) y el repaso de lo ya emitido
   en el tablero («Sacar esa tarea» / «Dejar solo lo que falta», con «Sí»).
 · Planilla de columnas (legajo y Mapa de guerra), Modo obra salta la columna que ya figura hecha y lo dice, parte de verificación
   del día a las 18:00 (turno de configEquipo/salud como el pase a mañana).
Sin reglas nuevas (campo.verificado lo escribe quien edita Órdenes). Sin APK nuevo. Pruebas viejas: __v150No (salvo v150:true).
Reemplazos chicos y exactos + un módulo nuevo antes de revisarAppDiag: se reaplica sobre otra base con --otra-base.
Uso: python3 patch_v150.py ORIGINAL_149b.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 149b (publicada)
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 149b (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip('\n')
assert t.count('id="verifObra"') == 0, 'ya tiene la v150'
V = 'window.__hecho && !window.__v150No'

# 1) «Quedan N de T» de Llenar orden: por window.saldoObra (la v150 la envuelve con lo hecho sin cerrar)
R('const pid = otPlazaId(), sd = pid ? saldoObra(pid, editando()) : null;',
  'const pid = otPlazaId(), sd = pid ? window.saldoObra(pid, editando()) : null;   /* v150: por la envoltura (lo hecho sin cerrar) */')

# 2) Modo obra: la columna que ya figura hecha (otra cuadrilla u otro día) se saltea y se avisa
R('const libres = nombres.filter((x) => !enObra.has(nk(x)) && !usados.has(nk(x)));',
  'const libres = nombres.filter((x) => !usados.has(nk(x)) && ((window.__hechoForzado && window.__hechoForzado(o, p.k, x)) || (!(window.__hechoSaltar && window.__hechoSaltar(o, p.k, x)) && !enObra.has(nk(x)))));   // v150: también lo hecho por otra orden (y «Es otra cosa»)')
R('''      let li = 0;
      while (lista.length < n) {''', '''      let li = 0; const nT = window.__hechoTope ? window.__hechoTope(o, p.k, nombres, lista.length + libres.length, n) : n;   // v150: no inventa columnas si las que quedan ya están hechas
      while (lista.length < nT) {''')
R('<div class="cd-o">${esc(sub)}</div></div>${segs}${gps}',
  '<div class="cd-o">${esc(sub)}</div></div>${segs}${window.__hechoAvisoObra && pa.fase !== "llegue" ? window.__hechoAvisoObra(o, pa) : ""}${gps}')

# 3) orden sugerida: las columnas hechas también por lo que mandó la cuadrilla sin detalle en esta orden (y las de __hecho)
R('''    return s;
  }
  function nombresCol(id) {''', '''    if (''' + V + ''') intentar(() => window.__hecho.nombresHechos(id, k).forEach((x) => s.add(x)), null);   // v150
    return s;
  }
  function nombresCol(id) {''')

# 4) lo no terminado pasa a mañana: nunca más de lo que falta de verdad en la obra
R('        const f = faltaDe(o, k); if (!f) return;',
  '        const f0 = faltaDe(o, k); if (!f0) return; const f = Object.assign({}, f0);\n'
  '        if (' + V + ') { const fr = intentar(() => window.__hecho.faltaReal(o.plazaId, k), null); if (fr != null && f.falta > fr) { f.falta = fr; f.motivo = (f.motivo ? f.motivo + " · " : "") + "lo demás ya está hecho"; } }   // v150')

# 5) Supervisor: verificación de las órdenes mandadas y órdenes emitidas que repiten trabajo
R('.concat(window.__matAvance && !window.__v145No ? window.__matAvance.supHallazgos() : []); }',
  '.concat(window.__matAvance && !window.__v145No ? window.__matAvance.supHallazgos() : []).concat(window.__verifOt && !window.__v150No ? window.__verifOt.supHallazgos() : []); }   /* v150 */')
R('    else if (x.tipo === "obragps" || x.tipo === "obragpsSin") { try { window.__obraGps.hojaSup(x); } catch (e) { } }   // v144',
  '    else if (x.tipo === "obragps" || x.tipo === "obragpsSin") { try { window.__obraGps.hojaSup(x); } catch (e) { } }   // v144\n'
  '    else if (x.tipo === "verif") { try { window.__verifOt.abrir(x.id); } catch (e) { } }   // v150')

# 6) Mapa de guerra: la planilla de columnas en la ficha
R('<div class="mg-fbt"><button type="button" class="btn-ghost" data-mg="legajo:',
  '${' + V + ' ? window.__hecho.mapaHtml(id) : ""}<div class="mg-fbt"><button type="button" class="btn-ghost" data-mg="legajo:')

# 7) asistente (código dormido, Chrome 80): proponer_orden y proponer_ordenes_sugeridas avisan si repiten; verificar_orden
R('    // otra orden abierta para esa obra y ese día',
  '    if (' + V + ') ts.forEach((t) => { const rr = window.__hecho.repite(o.id, t.k, t.cant); if (rr) avisos.push(rr.texto); });   // v150: trabajo ya hecho\n'
  '    // otra orden abierta para esa obra y ese día')
R('    const avisos = errs.map((x) => "No apliqué: " + x);',
  '    const avisos = errs.map((x) => "No apliqué: " + x);\n'
  '    if (' + V + ') l.forEach((o) => (o.tareas || []).forEach((tt) => { const rr = window.__hecho.repite(o.obraId, tt.k, tt.cant); if (rr) avisos.push(String(o.obra).toUpperCase() + ": " + rr.texto); }));   // v150')
R('  window.__asistente = { resumenSemana, informeMaterial,', leer('ia150.js') + '\n  window.__asistente = { resumenSemana, informeMaterial,')

# 8) cierre por voz: el contexto lleva la verificación y la tarjeta avisa si lo dicho supera lo verificado
R('horas: m.horas || null }; }) };',
  'horas: m.horas || null }; }), verificacion: window.__verifOt && !window.__v150No ? window.__verifOt.texto(o) : undefined };   // v150')
R('    if (!ordenes.length) return { err: "No hay órdenes para cerrar"',
  '    if (ordenes.length && window.__verifOt && !window.__v150No) ordenes.forEach((R) => { try { window.__verifOt.avisosCierre(R).forEach((x) => avisos.push(x)); } catch (e) { } });   // v150\n'
  '    if (!ordenes.length) return { err: "No hay órdenes para cerrar"')

# 9) el módulo nuevo (antes del último script)
R('<script id="revisarAppDiag">', '<style id="verifObraCss">\n' + leer('verifObra.css') + '\n</style>\n<script id="verifObra">\n' + leer('verifObra.js') + '\n</script>\n<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
