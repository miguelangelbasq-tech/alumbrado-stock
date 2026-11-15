"""v161 · El Inicio de Administración y Oficina pasa a ser la pantalla de Dirección (#iniDir), con permiso de editar.
   Ángel (15/11): «Que directamente sea la misma pantalla [la de Dirección]. Con el beneficio de que la oficina y yo podemos editar.»
 · admin y oficina abren la app en #iniDir (A en el celu, C en la compu), en su Inicio (no como hoja). Dirección igual (solo
   mirar). Pañol, cuadrilla y mirar no cambian.
 · Lo del Inicio Ejecutivo entra con sus acciones: buscador + Asistente, «Para atender» fundido con «Necesita tu atención», la
   orden sugerida de mañana, «🩺 Supervisor», «En obra ahora», «Órdenes de hoy», accesos y «Obras» (las piezas las sigue armando
   inicioPro: window.__inicioPro.bloques). El Ejecutivo queda escondido, con «Ver el Inicio de antes» abajo de todo.
 · «📊 Dirección» (menú, accesos, Tablero del dueño) ya no va para admin/oficina; __inicioDir.abrir() lleva al Inicio.
 · Módulo inicioUnico (window.__iniUnico, antes de revisarAppDiag) + reemplazos chicos en inicioPro e inicioDir.
Pruebas viejas: __v161No (salvo v161:true). Sin reglas nuevas, sin escuchas nuevas.
Uso: python3 patch_v161.py ORIGINAL_160.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 160
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 160 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip('\n')
assert t.count('id="inicioUnico"') == 0, 'ya tiene la v161'

# ---- inicioPro (v135)
# 1) admin y oficina: el Inicio es el de Dirección
R('return r === "admin" || r === "oficina" ? "eje" : r === "panol"',
  'return r === "admin" || r === "oficina" ? (window.__iniUnico ? (window.__iniUnico.on() ? "dir" : "eje") : window.__v161No ? "eje" : "dir") : r === "panol"')   # v161 (antes de que cargue inicioUnico: «dir», así no se arma el Ejecutivo de gusto)
# 2) «Para atender»: la lista sola (para fundirla con «Necesita tu atención»)
R('  function atenderHtml(d) {\n    const l = [];', '  function atenderHtml(d, soloLista) {   // v161: soloLista\n    const l = [];')
R('    const n = l.reduce((a, x) => a + (x.n || 1), 0);\n    return `<div class="ie-th"><h2>Para atender',
  '    if (soloLista) return l;   // v161\n    const n = l.reduce((a, x) => a + (x.n || 1), 0);\n    return `<div class="ie-th"><h2>Para atender')
# 3) las piezas, a la vista de inicioUnico
R('window.__inicioPro = { LOGO, pintar: () => pintar(true), modo,',
  'window.__inicioPro = { LOGO, pintar: () => pintar(true), modo,\n    bloques: { datos: datosEje, atender: atenderHtml, enObra: enObraHtml, ots: otsHtml, acc: accHtml, obras: obrasHtml, fila, busca: (v) => { if (v != null) st.busca = String(v); return st.busca; } },   // v161')
# 4) las acciones de siempre también adentro de #iniDir
R('e.target.closest("#iniEje [data-ie], #iniPan [data-ie]")', 'e.target.closest("#iniEje [data-ie], #iniPan [data-ie], #iniDir [data-ie]")')
# 5) al pintar el Inicio (cada 2,5 s a la vista, como el Ejecutivo) también las piezas de admin/oficina
R('if (m === "dir") { const rd = $("iniDir"); rd && (rd.style.display = ""); try { window.__inicioDir.suave(); } catch (e) { } return; }',
  'if (m === "dir") { const rd = $("iniDir"); rd && (rd.style.display = ""); try { window.__iniUnico && window.__iniUnico.on() && !window.__iniUnico.listo() ? window.__inicioDir.pintar() : window.__inicioDir.suave(); } catch (e) { } try { window.__iniUnico && window.__iniUnico.on() && window.__iniUnico.pintarBloques(); } catch (e) { } return; }')

# ---- inicioDir (v155)
R('  function modoInicio() { return esDir() && !!window.__fbUser && V.rolListo(); }',
  '  function uniOn() { return !!(window.__iniUnico && window.__iniUnico.on()); }   // v161: admin/oficina con el Inicio de Dirección\n'
  '  function uniAct() { return !!(window.__iniUnico && window.__iniUnico.activo()); }\n'
  '  function modoInicio() { return (esDir() || uniOn()) && !!window.__fbUser && V.rolListo(); }')
R('    if (esDir()) { try { window.mostrarVista("inicio"); } catch (e) { } return true; }',
  '    if (esDir() || uniAct()) { try { uniAct() && window.__iniUnico.nuevo(); window.mostrarVista("inicio"); } catch (e) { } return true; }   // v161: admin/oficina ya lo tienen en el Inicio')
R('puedeVer() && !esDir() ?', 'puedeVer() && !esDir() && !uniAct() ?', 2)   # accesos y Tablero del dueño
R('if (!puedeVer() || esDir()) { m && m.remove(); return; }', 'if (!puedeVer() || esDir() || uniAct()) { m && m.remove(); return; }')   # menú
R('<small>Dirección</small>', '<small>${uniOn() ? "Alumbrado" : "Dirección"}</small>')
R('    if (r && r.parentNode !== padre) { r.remove(); r = null; st.mapa = null; st.capa = null; }',
  '    if (r && (r.parentNode !== padre || r.classList.contains("iu") !== (uniOn() && !enHoja))) { r.remove(); r = null; st.mapa = null; st.capa = null; }   // v161')
R('r.className = "no-print" + (enHoja ? " dr-enhoja" : "");', 'r.className = "no-print" + (enHoja ? " dr-enhoja" : "") + (uniOn() && !enHoja ? " iu" : "");')
R("<div class=\"dr-grid\">' + SECC.map((id) => `<div class=\"dr-card ${id}\" id=\"${id}\"></div>`).join(\"\")",
  "<div class=\"dr-grid\">' + (uniOn() && !enHoja ? window.__iniUnico.SECC : SECC).map((id) => `<div class=\"dr-card ${id}${SECC.indexOf(id) < 0 || id === \"drAt\" && uniOn() && !enHoja ? \" dr-ie\" : \"\"}\" id=\"${id}\"></div>`).join(\"\")")
R('    poner("drAt", atencionHtml(D));',
  '    if (r.classList.contains("iu")) { try { window.__iniUnico.pintarBloques(); } catch (e) { } } else poner("drAt", atencionHtml(D));   // v161')

# rendimiento: para admin/oficina primero la portada y las piezas del Ejecutivo (lo que se usa), el resto de las tarjetas al toque
R('    const r = asegurar(padre, enHoja); r.style.display = "";\n    const D = datos(), E = equipo(D);',
  '    const r = asegurar(padre, enHoja); r.style.display = "";\n'
  '    if (r.classList.contains("iu") && !st.iuSeguir) {   // v161: en dos pasos (el primero, liviano: se ve enseguida)\n'
  '      poner("drHero", heroHtml(datos(), enHoja)); try { window.__iniUnico.pintarBloques(); } catch (e) { }\n'
  '      st.iuSeguir = 1; setTimeout(() => { try { if (r.isConnected) pintarEn(padre, enHoja); } catch (e) { console.warn("[dirección]", e); } st.iuSeguir = 0; }, 40); return;\n'
  '    }\n'
  '    const D = datos(), E = equipo(D);')
# ---- rendimiento: inicioDir (estilo y código) pasa justo después de inicioPro, y el módulo nuevo atrás de él. Así el Inicio de
# admin/oficina se puede dibujar mientras el resto de la página todavía se está leyendo (como el Ejecutivo); si no, esperaba
# hasta el final (≈ 4 s más en el celu con CPU ×4). inicioDir solo usa lo demás al pintar (con intentar), y se repinta al terminar.
i0 = t.index('<style id="inicioDirCss">'); i1 = t.index('</script>', t.index('<script id="inicioDir">')) + len('</script>\n')
bloque = t[i0:i1]; assert bloque.count('<script') == 1 and bloque.count('<style') == 1, 'el bloque de inicioDir cambió'
t = t[:i0] + t[i1:]
R('})();\n</script>\n<style id="navN1Css">', '})();\n</script>\n' + bloque + '<style id="inicioUnicoCss">\n' + leer('inicioUnico.css') + '\n</style>\n<script id="inicioUnico">\n' + leer('inicioUnico.js') + '\n</script>\n<style id="navN1Css">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
