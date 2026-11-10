"""v137 · Pedido de Ángel (09/11/2026):
 1) Remito por foto con IA en el pañol (Registrar movimiento › entrada y panel del Asistente): la IA solo lee; los códigos
    los propone la app desde el catálogo (🟢/🟡/🔴), nunca se inventan; tarjeta editable con «Sí, cargar entrada» / «No».
 2) Lector de códigos (ML Kit en la app de Android, BarcodeDetector o a mano), código de barras (EAN) por producto en
    catalogoProductos/{codigo}.ean, ficha con vale/entrada al escanear, etiquetas QR de herramientas.
 3) QR en todos los comprobantes (S-/E-/D-/RH-/RI-/R-/OT-) y en los informes de una obra, con la dirección ?doc= / ?obra=,
    que la app abre después de entrar y con los permisos de cada uno.
 4) Asistente: el dictado (🎤 y modo charla) va apareciendo en vivo en el cuadro y una onda de rayitas se mueve con la voz
    (nivel real con getUserMedia + AnalyserNode en la compu; simulada en el celu y en la app).
 5) Asistente más «vivo»: actúa sin preguntar de más, glosario del dictado, búsqueda aproximada de obras, effort según la
    pregunta y system fijo durante la charla (el contexto va en cada mensaje).
Base: ORIGINAL 136b (la publicada: 136 + v136bCss + el motivo del rechazo del Worker)."""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = 'c3e7f02bc8e21c071b643726cf9a86caf44da3d3f572a282a7c72e3483ae78db'   # ORIGINAL 136b (la publicada)
ent, sal = sys.argv[1], sys.argv[2]
t = open(ent, encoding='utf-8').read()
assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 136b'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().strip() + '\n'
for i in ('qrLib', 'codigosQr', 'remitoFoto'): assert t.count(f'<script id="{i}"') == 0, i

# 1) la hoja de impresión pone el QR del documento (todas las hojas pasan por acá)
R('''  function abrir(titulo, docHtml) {
    cerrar();''', '''  function abrir(titulo, docHtml) {
    try { if (window.__qrHoja) docHtml = window.__qrHoja(titulo, docHtml) || docHtml; } catch (e) { }   // v137: QR del comprobante / del legajo
    cerrar();''')
# 2) reservas: un QR en cada hoja (se imprimen varias juntas)
R('''<h2 style="font-size:16px;margin:0 0 2px;">Reserva ${esc(r.numero || "")}''',
  '''${window.__qrReserva ? window.__qrReserva(r) : ""}<h2 style="font-size:16px;margin:0 0 2px;">Reserva ${esc(r.numero || "")}''')

# 4) Asistente (código dormido): dictado en vivo y onda de rayitas
R('''      return new Promise((ok) => {
        let txt = "", hecho = false; const hs = [];''', '''      return new Promise((ok) => {
        let txt = "", hecho = false; const hs = [];
        const parcial = (e) => { const m = e && (e.matches || e.value); return (m && m[0]) || (e && (e.accumulatedText || e.text)) || ""; };   // v137: según la versión del plugin''')
R('hs.push(await SR.addListener("partialResults", (e) => { txt = (e && e.matches && e.matches[0]) || txt; enVivo && enVivo(txt); }));',
  'hs.push(await SR.addListener("partialResults", (e) => { txt = parcial(e) || txt; enVivo && enVivo(txt); }));')
R('  window.__voz = VOZ;\n', '  window.__voz = VOZ;\n' + leer('onda.js'))
R('dictando = true; b && b.classList.add("on"); ayudaMic("");', 'dictando = true; b && b.classList.add("on"); ayudaMic(""); ONDA.on("dicta");')
R('const r = await VOZ.escuchar((s) => { t.value = base0 + s; });', 'const r = await VOZ.escuchar((s) => { t.value = base0 + s; enVivoCaja(t); ONDA.pulso(s); });')
R('dictando = false; b && b.classList.remove("on");', 'dictando = false; b && b.classList.remove("on"); ONDA.off();')
R('const r = await VOZ.escuchar((s) => { const t = $("iaTxt"); if (t) t.value = s; barraCharla("🎤 " + s.slice(-70), "escucha"); });',
  'ONDA.on("charla");\n      const r = await VOZ.escuchar((s) => { const t = $("iaTxt"); if (t) { t.value = s; enVivoCaja(t); } ONDA.pulso(s); barraCharla("🎤 " + s.slice(-70), "escucha"); });\n      ONDA.off();')
R('charla.on = false; VOZ.pararEscucha(); VOZ.callar(); pantallaOff();', 'charla.on = false; VOZ.pararEscucha(); VOZ.callar(); pantallaOff(); ONDA.off();')
R('<form class="ia-pie" id="iaForm" autocomplete="off">', '<div class="ia-ondav" id="iaOndaV" hidden aria-hidden="true"></div><form class="ia-pie" id="iaForm" autocomplete="off">')

exec(open(os.path.join(SRC, 'ia137.py'), encoding='utf-8').read())

# módulos nuevos, antes del último script
R('<script id="revisarAppDiag">', leer('qr.html') + leer('codigos.html') + leer('remito.html') + leer('onda.css') + '<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
