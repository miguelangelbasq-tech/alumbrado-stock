"""v186 · El Inicio nuevo de Administración, Oficina y Dirección (opción A + mapa y plazas de hoy en una tarjeta, de la B;
aprobado por Ángel 20/11/2026), la orden sugerida en Órdenes › «🗓 Mañana», y dos ítems nuevos del menú: «📋 Itemizado»
(contratado / hecho / falta, lo contratado con motivo y «Sí») y «📅 Gantt» (fechas previstas por obra y por rubro contra lo
real y «a este ritmo»; «Repartir» solo propone). Bandera __v186No. Sin reglas nuevas.
BASE_SHA = el ORIGINAL 181 publicado (con la 180 a la 185). Uso: python3 patch_v186.py ENTRADA.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de entrada (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
assert '<script id="inicio186">' not in t, 'ya tiene la v186'
for x in ['<script id="inicioDir">', '<script id="inicioUnico">', '<script id="avanceObra2">', '<script id="tableroSub">', '<script id="auditorAvance">', '<script id="ordenSugerida">']:
    assert x in t, x
# --- inicioPro: el modo «dir» deja el Inicio al módulo nuevo; sus botones [data-ie] también andan dentro de #ini186
R('e.target.closest("#iniEje [data-ie], #iniPan [data-ie], #iniDir [data-ie]")', 'e.target.closest("#iniEje [data-ie], #iniPan [data-ie], #iniDir [data-ie], #ini186 [data-ie]")')
R('["iniEje", "iniPan", "iniDir"].forEach((id) => { const e = $(id); e && (e.style.display = "none"); });', '["iniEje", "iniPan", "iniDir", "ini186"].forEach((id) => { const e = $(id); e && (e.style.display = "none"); });')
R('if (m === "dir") { const rd = $("iniDir");', 'if (m === "dir" && window.__ini186 && window.__ini186.on()) { try { window.__ini186.pintar(); } catch (e) { console.warn("[inicio186]", e); } return; }   // v186\n    if (m === "dir") { const rd = $("iniDir");')
R('#viewInicio.ie-on > :not(#iniEje):not(#iniPan):not(#iniDir){display:none !important}', '#viewInicio.ie-on > :not(#iniEje):not(#iniPan):not(#iniDir):not(#ini186){display:none !important}')
# --- inicioDir: el Inicio lo pinta el módulo nuevo; «Ver todos los indicadores» abre la pantalla de antes en la hoja (con las piezas del Ejecutivo para admin/oficina)
R('try { pintarEn(v, false); }', 'if (window.__ini186 && window.__ini186.on()) { try { window.__ini186.pintar(); } catch (e) { console.warn("[inicio186]", e); } return; }   // v186\n    try { pintarEn(v, false); }')
R('if (esDir() || uniAct()) { try { uniAct() && window.__iniUnico.nuevo(); window.mostrarVista("inicio"); } catch (e) { } return true; }', 'if (!(window.__ini186 && window.__ini186.on()) && (esDir() || uniAct())) { try { uniAct() && window.__iniUnico.nuevo(); window.mostrarVista("inicio"); } catch (e) { } return true; }   // v186: con el Inicio nuevo, la pantalla de antes va en la hoja')
R('uniOn() && !enHoja', 'uniOn() && (!enHoja || !!window.__ini186Hoja)', 4)
R('if (!b.closest("#iniDir, #dirOv") && b.dataset.dr !== "abrir") return;', 'if (!b.closest("#iniDir, #dirOv, #ini186") && b.dataset.dr !== "abrir") return;')
# --- inicioUnico: el estilo de las piezas del Ejecutivo también para el «Para atender» desplegado del Inicio nuevo
R('return s.slice(0, i) + "#iniDir .ie-dentro" + resto;', 'return s.slice(0, i) + "#iniDir .ie-dentro" + resto + (window.__v186No ? "" : "," + s.slice(0, i) + "#ini186 .ie-dentro" + resto);')
R('if (!resto) return s === "#iniEje" ? "#iniDir .ie-dentro" : "";', 'if (!resto) return s === "#iniEje" ? "#iniDir .ie-dentro" + (window.__v186No ? "" : ",#ini186 .ie-dentro") : "";')
# --- avanceObra2: el % de una obra sin lo de hoy (antes → ahora del Inicio)
R('const misOts = ots().filter((t) => t && t.estado !== "Anulada" && String(t.plazaId || "") === String(o.id))', 'const misOts = ots().filter((t) => t && t.estado !== "Anulada" && String(t.plazaId || "") === String(o.id) && !(window.__av2Hasta && String(t.fecha || "").slice(0, 10) >= window.__av2Hasta))')
R('const v = obj(M[q]); if (!v.e) return;', 'const v = obj(M[q]); if (!v.e) return; if (window.__av2Hasta && num(v.ts) >= +new Date(window.__av2Hasta + "T00:00:00")) return;   // v186')
R('window.__av2 = { lista, estado,', 'window.__av2 = { pctHasta: (o0, f) => { const o = obraDe(o0); if (!o || off()) return null; window.__av2Hasta = f; try { const E = calcular(o); return E ? E.pct : null; } catch (e) { return null; } finally { window.__av2Hasta = ""; } },   // v186\n    lista, estado,')
# --- tableroSub: la subpestaña «🗓 Mañana» con la orden sugerida
R('["revisar", "🔔 Para revisar y cerrar"], ["prox", "📅 Próximas"], ["atras", "⚠ Sin cerrar"], ["cerr", "✅ Cerradas"], ["anul", "🚫 Anuladas"]];', '["revisar", "🔔 Para revisar y cerrar"]].concat(window.__v186No || window.__sugNo ? [] : [["manana", "🗓 Mañana"]], [["prox", "📅 Próximas"], ["atras", "⚠ Sin cerrar"], ["cerr", "✅ Cerradas"], ["anul", "🚫 Anuladas"]]);   // v186: «Mañana»')
R('anul: "Las anuladas: no suman puntos ni avance." };', 'anul: "Las anuladas: no suman puntos ni avance.", manana: "La orden sugerida de mañana: la arma la app (antes estaba en el Inicio). Nada sale sin «Emitir»." };')
R('if (!st.tab || !n[st.tab]) st.tab', 'const manOk = !!(window.__man186 && window.__man186.ve());   // v186\n    if (!st.tab || (!n[st.tab] && !(st.tab === "manana" && manOk))) st.tab')
R('${TABS.map(([k, t]) =>', '${TABS.filter(([k]) => k !== "manana" || manOk).map(([k, t]) =>')
R('<b>${n[k].length}</b>', '<b>${k === "manana" ? window.__man186.n() : n[k].length}</b>')
R('    const lista = n[st.tab];', '    if (st.tab === "manana") return h + window.__man186.html();   // v186\n    const lista = n[st.tab];')
# --- los módulos nuevos: el Inicio temprano (justo después de inicioUnico, para que se dibuje igual de rápido) y lo demás al final
rd = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read()
R('<style id="navN1Css">', '<style id="inicio186Css">\n' + rd('inicio186.css') + '</style>\n<script id="inicio186">\n' + rd('inicio186.js') + '</script>\n<style id="navN1Css">')
R('<script id="revisarAppDiag">', '<style id="plan186Css">\n' + rd('plan186.css') + '</style>\n<script id="plan186">\n' + rd('plan186.js') + '</script>\n<script id="revisarAppDiag">')
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
if os.environ.get('SELLO'): ahora = os.environ['SELLO']
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
