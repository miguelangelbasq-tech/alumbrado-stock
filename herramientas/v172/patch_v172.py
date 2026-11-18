"""v172 · dos cosas de la cámara (Ángel 18/11):
 1) «En la cámara tener la burbuja de video, que molesta: no deja apretar el botón de siguiente. La burbuja no me gusta, elegí otro
    lugar.» → el «🎥 Video» (#anCamVid, v160) flotaba arriba de la fila para nombrar (tapaba «›» y «PAT») en las tres cámaras
    (la de la barra, Modo obra y la C de la v165). Pasa a la fila de abajo, al lado de «la última» (izquierda del disparador),
    sin flotar: la fila de abajo se arma en tres columnas (la última + video · disparador · Listo) y el disparador queda al centro.
 2) «Selecciono Tablero y al apretar arriba de Tablero (otra vez) debería dejarte poner tablero y algo que yo quiero poner, como 1
    o E o roto, lo que sea.» → el botón elegido para nombrar (Columna · Tablero · PAT · Zanja · Acometida, en la cámara y en la
    hoja «＋ Otra foto» de la v171) muestra «✎»; tocarlo otra vez abre «Tablero ___» (#sfOv) con lo último usado + 1, 2, 3, E, roto
    y el tecladito → «Tablero 1», «Tablero E», «Tablero roto», «Col 4 base»; sigue para las fotos siguientes; si no es una unidad
    de la tarea, la foto va suelta (v164/v171). En la hoja «＋ Otra foto» el primer toque elige (y «Sacar la foto · Tablero 1»).
Pruebas viejas: __v172No (lo pone el arnés salvo v172:true) → todo como la v171. Sin reglas nuevas.
Uso: python3 patch_v172.py ORIGINAL_171.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 171
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 171 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
JS = open(os.path.join(SRC, 'sufijoFoto.js'), encoding='utf-8').read()
CSS = open(os.path.join(SRC, 'sufijoFoto.css'), encoding='utf-8').read()
ON = '(window.__fotoSuf && !window.__v172No)'

# ============================================================== (1) archivosNube: el botón de video en la fila de abajo
R('''    cam.insertAdjacentHTML("beforeend", `<button type="button" id="anCamVid" class="an-camvid" data-anvid="cam" aria-label="Grabar un video">🎥<span>Video</span></button>`);''',
  '''    const bv = `<button type="button" id="anCamVid" class="an-camvid" data-anvid="cam" aria-label="Grabar un video">🎥<span>Video</span></button>`;
    const ab = !window.__v172No && cam.querySelector(".ec-abajo");   // v172: en la fila de abajo, al lado de «la última» (no flota sobre la fila para nombrar)
    if (ab) { cam.classList.add("an172"); const u = ab.querySelector(".ec-ult"); if (u) u.insertAdjacentHTML("afterend", bv); else ab.insertAdjacentHTML("afterbegin", bv); }
    else cam.insertAdjacentHTML("beforeend", bv);''')

# cámara C (v165): abajo a la izquierda van sus miniaturas y a la derecha «Terminé»: el video va arriba, entre la píldora y el reloj
R('      pintarCam(); clearInterval(S.timer); S.timer = setInterval(tic, 1000);',
  '      if (!window.__v172No) { const v172 = $("anCamVid"), r172 = $("viReloj"); if (v172 && r172 && r172.parentElement && r172.parentElement.classList.contains("ec-arriba")) { r172.parentElement.insertBefore(v172, r172); v172.classList.add("an-arriba"); } }   // v172\n      pintarCam(); clearInterval(S.timer); S.timer = setInterval(tic, 1000);')

# ============================================================== (2a) fotosAlToque (Modo obra y cámara C): botones con «✎» y el nombre con lo agregado
R(' ${attr}="${c[0]}">${esc(c[1])}</button>`).join("")}</div>`;',
  ' ${attr}="${c[0]}">${' + ON + ' ? window.__fotoSuf.chip(c[0], c[1], cat === c[0]) : esc(c[1])}</button>`).join("")}</div>`;')
R('''  function aplicar() {
    const inp = NM.inp; if (!inp) return;
    const que = NM.cat === "otra" ? (NM.otro || "Otra") : NM.num || (NM.suelta ? catTxt(NM.cat) : NM.lbl || catTxt(NM.cat));
    inp.dataset.k = NM.k; inp.dataset.cat = NM.cat; inp.dataset.fln = que; inp.dataset.fnSuelta = NM.suelta ? "1" : "";
    const tit = NM.suelta ? que : primera(NM.lbl) + (NM.num ? " · " + NM.num : "");''',
  '''  // v172: lo agregado al nombre («Tablero 1», «Col 4 base»); si no es una unidad de la tarea, la foto va suelta
  function suf172() {
    if (!window.__fotoSuf || window.__v172No || !NM || NM.cat === "otra" || !window.__fotoSuf.de(NM.cat)) return null;
    const que = window.__fotoSuf.nombre(NM.cat, pideNum(NM.cat) && NM.num ? NM.num : "");
    const o = otDe(NM.ot), u = o && NM.k ? uniDe(o, NM.k) : null;
    return { que, sue: !!NM.suelta || !(u && u.items && u.items.some((x) => nk(x.num) === nk(que))) };
  }
  function aplicar() {
    const inp = NM.inp; if (!inp) return;
    let que = NM.cat === "otra" ? (NM.otro || "Otra") : NM.num || (NM.suelta ? catTxt(NM.cat) : NM.lbl || catTxt(NM.cat));
    const s172 = suf172(); if (s172) que = s172.que;
    const sue = s172 ? s172.sue : NM.suelta;
    inp.dataset.k = sue ? "" : NM.k; inp.dataset.cat = NM.cat; inp.dataset.fln = que; inp.dataset.fnSuelta = sue ? "1" : "";
    if (s172 || inp.dataset.suf172) inp.dataset.suf172 = s172 ? "1" : "";
    const tit = sue ? que : primera(NM.lbl) + (NM.num ? " · " + NM.num : "");''')
R('''    const que = NM.cat === "otra" ? NM.otro || "Otra" : NM.num || (NM.suelta ? catTxt(NM.cat) : primera(NM.lbl) || catTxt(NM.cat));
    const sub = NM.suelta ? "va a la orden sin tarea" : lista ? n + " de " + lista.length + " con foto" : primera(NM.lbl) || "foto";''',
  '''    let que = NM.cat === "otra" ? NM.otro || "Otra" : NM.num || (NM.suelta ? catTxt(NM.cat) : primera(NM.lbl) || catTxt(NM.cat));
    let sub = NM.suelta ? "va a la orden sin tarea" : lista ? n + " de " + lista.length + " con foto" : primera(NM.lbl) || "foto";
    const s172 = suf172(); if (s172) { que = s172.que; if (s172.sue) sub = "va a la orden sin tarea"; }   // v172''')
R('window.__fotoNombre = { filaCb,', 'window.__fotoNombre = { refrescar: () => { if (NM) aplicar(); }, filaCb,')
# cámara C (v165): con algo agregado al nombre no salta sola a la columna siguiente
R('nk(inp.dataset.fln) !== nk(num0)) return;', 'nk(inp.dataset.fln) !== nk(num0) || (inp.dataset.suf172 === "1" && !window.__v172No)) return;')

# ============================================================== (2b) obraGps (cámara de la barra)
R('''  function sincronizar(e) {''', '''  // v172: lo agregado al nombre («Tablero 1»); si no es una unidad de la tarea, la foto va suelta (sin tarea)
  function suf172b() {
    if (!window.__fotoSuf || window.__v172No || !CB.cat || CB.cat === "otra" || !window.__fotoSuf.de(CB.cat)) return null;
    const que = window.__fotoSuf.nombre(CB.cat, pide(CB.cat) && CB.num ? CB.num : "");
    return { que, sue: !(CB.k && CB.lista && CB.lista.some((x) => nk(x.num) === nk(que))) };
  }
  function sincronizar(e) {''')
R('''    intentar(() => CA().ponerElig && CA().ponerElig(el), null);''',
  '''    const s172 = suf172b(); if (s172) { el.num = s172.que; if (s172.sue) { el.k = ""; el.tareaLbl = ""; } }   // v172
    intentar(() => CA().ponerElig && CA().ponerElig(el), null);''')
R('let sub = "foto general";', 'let sub = "foto general"; const s172 = suf172b();')
R('<b>${esc(conNum ? CB.num : lbl)}</b><small>${esc(sub)}</small>', '<b>${esc(s172 ? s172.que : conNum ? CB.num : lbl)}</b><small>${esc(s172 && s172.sue ? "va a la orden sin tarea" : sub)}</small>')
R('''    if (CB.cat) CB.hechas[CB.obraId + "|" + CB.cat + "|" + nk(CB.num)] = 1;''',
  '''    const s172 = suf172b(); if (s172 && s172.sue) { setTimeout(() => pintar(true), 30); return; }   // v172: «Col 4 base» no es la Col 4: no la cuenta ni pasa a la siguiente
    if (CB.cat) CB.hechas[CB.obraId + "|" + CB.cat + "|" + nk(CB.num)] = 1;''')
R('/* v164: «Otro…» con texto */ otro: (txt) =>', '/* v172 */ repintar: () => { CB.firma = ""; pintar(true); }, /* v164: «Otro…» con texto */ otro: (txt) =>')

# ============================================================== (2c) otraFoto (hoja «＋ Otra foto», v171)
R('S.hoja = { ot: otId, k, label: (t && t.label) || "", cat: "", col: colInicial(o, k), otro: false };',
  'S.hoja = { ot: otId, k, label: (t && t.label) || "", cat: ' + ON + ' ? window.__fotoSuf.ultHoja() : "", col: colInicial(o, k), otro: false };   // v172: lo último elegido sigue')
R('${CHIPS.map((c) => `<button type="button" class="of-chip${H.cat === c[0] ? " on" : ""}" data-ofcat="${c[0]}">${esc(c[1])}</button>`).join("")}',
  '${CHIPS.map((c) => `<button type="button" class="of-chip${H.cat === c[0] ? " on" : ""}" data-ofcat="${c[0]}">${' + ON + ' ? window.__fotoSuf.chip(c[0], c[1], H.cat === c[0]) : esc(c[1])}</button>`).join("")}')
R('<b>${esc(H.col)}</b>', '<b>${esc(' + ON + ' ? window.__fotoSuf.nombre("columna", H.col) : H.col)}</b>')
R('📷 Sacar la foto · ${esc(H.col)}</button>', '📷 Sacar la foto · ${esc(' + ON + ' ? window.__fotoSuf.nombre("columna", H.col) : H.col)}</button>')
R('    else h += `<div class="of-ayuda">', '    else if (H.cat && ' + ON + ') h += window.__fotoSuf.hojaSacar(H.cat);   // v172: Tablero / PAT / Zanja / Acometida: elegido, y «Sacar la foto»\n    else h += `<div class="of-ayuda">')
R('if (cat === "columna" || cat === "otra") { S.hoja.cat = cat; return pintarHoja(); }',
  'if (cat === "columna" || cat === "otra" || ' + ON + ') { S.hoja.cat = cat; return pintarHoja(); }   // v172: el primer toque elige; el segundo, «Tablero …»')
R('if (a.dataset.of === "sacar") { e.preventDefault(); return sacar("columna", S.hoja.col); }',
  'if (a.dataset.of === "sacar") { e.preventDefault(); if (' + ON + ') { const c172 = S.hoja.cat || "columna"; window.__fotoSuf.marcarHoja(c172); return sacar(c172, window.__fotoSuf.nombre(c172, c172 === "columna" ? S.hoja.col : "")); } return sacar("columna", S.hoja.col); }')
R("window.__otraFoto = { bloque,", "window.__otraFoto = { repintar: () => { if (S.hoja) pintarHoja(); }, bloque,")

# ============================================================== el módulo
MOD = '<style id="sufijoFotoCss">\n' + CSS + '</style>\n<script id="sufijoFoto">\n' + JS + '</script>\n'
R('<script id="revisarAppDiag">', MOD + '<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
