import sys, re, hashlib, datetime, os
ent, sal = sys.argv[1], sys.argv[2]
t = open(ent, encoding='utf-8').read()
assert hashlib.sha256(t.encode()).hexdigest() == open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'BASE_SHA_136')).read().strip(), 'no es el ORIGINAL de la 136'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:60], c); t = t.replace(a, b)
css = '''<style id="v136bCss">
/* v136b · Inicio «Ejecutivo» en la compu: sin el título viejo «Plazas» arriba y las tarjetas al ancho de la portada. */
#viewInicio.ie-on:before{content:none !important;display:none !important}
@media (min-width:641px){
 #iniEje .ie-hero{border-radius:28px;margin-top:16px}
 #iniEje .ie-cuerpo{padding-left:0;padding-right:0}
}
</style>
'''
R('<script id="revisarAppDiag">', css + '<script id="revisarAppDiag">')
# v136c: la nómina está en configEquipo/personal.nomina (no «lista»): el asistente, «Agregar a alguien que también fue» y la gente rápida de Llenar orden la veían vacía
R('const nomina = () => { const p = window.__personalNube || {}; return (Array.isArray(p.lista) ? p.lista : []).filter((x) => x && String(x.nombre || "").trim() && x.activo !== false); };',
  'const nomina = () => { const p = window.__personalNube || {}; let l = Array.isArray(p.nomina) && p.nomina.length ? p.nomina : Array.isArray(p.lista) ? p.lista : []; if (!l.length) { try { l = (typeof window.nominaEquipo == "function" ? window.nominaEquipo() : []) || []; } catch (e) { l = []; } } return l.filter((x) => x && String(x.nombre || "").trim() && x.activo !== false); };', 3)
# el motivo exacto del rechazo (Worker v2b: error.detalle) se muestra debajo del mensaje
R('const mj = (j && j.error && j.error.mensaje) || "";', 'const mj = ((j && j.error && j.error.mensaje) || "") + ((j && j.error && j.error.detalle) ? "\\n(Motivo: " + j.error.detalle + ")" : "");')

ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, f'{ahora} · {h6}')
