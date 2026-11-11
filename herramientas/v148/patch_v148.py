"""v148 · Parpadeos en los celus (la barra de abajo que aparece y desaparece, botones que se agrandan y se achican al llegar
un aviso) + fotos de la cuadrilla más rápidas.
 · navBarra: «tapado()» ya no cuenta como «algo que tapa la pantalla» a los carteles (role=status: el aviso de arriba
   #avToast, #pmAviso, #offAviso…), ni a lo del movimiento (.mov-*), ni a las pantallas (.wrap); mide lo que se ve DENTRO de la
   pantalla (no el tamaño de algo corrido afuera) y, si una misma cosa la esconde y la muestra una y otra vez (se agranda por la
   barra), se la ignora. La barra ya no se rearma entera cuando cambia un globito: cambia solo ese número; la letra se achica
   una sola vez y nunca con la barra escondida (medía 0 y la dejaba en 9,5 px).
 · CSS: «body.n1-on #avToast{bottom:…}» estiraba el aviso de arriba hasta la barra (742 px de alto) → tapado() escondía la barra
   → el aviso se achicaba → la barra volvía… cada 0,7–1,4 s, para siempre desde el primer aviso (viene de la v135).
 · En la compu, navBarra reescribía la clase del body cada 0,7 s (classList.remove siempre escribe): ahora toggle con fuerza.
 · movPantallas (v147): las hojas solo suben/bajan si las abrió un toque reciente y no son carteles.
 · Con «menos movimiento» del celu, los puntitos que laten quedan quietos (v148Css).
 · Fotos de la cuadrilla (fotos148.py): Modo obra ya no espera sello + nube + base para mostrar «Foto guardada · Sacar otra»
   (de 7–13 s a < 1 s con CPU ×6); se guardan por atrás de a una cuando la cámara está cerrada y la persona no toca nada,
   con copia cruda en el celu (IndexedDB ema-fotos-crudas) hasta que quedan guardadas. atrasApp ya no recorre las pantallas
   escondidas (36.700 de 38.000 nodos) en cada cambio; el logo de la marca de la cámara se lee una vez.
Sin reglas nuevas. Uso: python3 patch_v148.py ORIGINAL_147.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 147
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 147 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
leer = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read().rstrip() + '\n'
assert t.count('v148') == 0, 'ya tiene la v148'

# ============================================================== 1) el aviso de arriba no se estira hasta la barra (v135)
R('body.n1-on #avToast{bottom:calc(92px + env(safe-area-inset-bottom,0px)) !important}',
  'body.n1-on #avToast{bottom:auto !important}   /* v148: antes bottom:92px estiraba el aviso de arriba (top + bottom) hasta 742 px de alto y tapado() escondía la barra: parpadeo */')

# ============================================================== 2) navBarra: tapado() sin falsos «tapa la pantalla»
R('''    for (const e of document.body.children) {
      if (e.id === "navN1" || e.tagName === "SCRIPT" || e.tagName === "STYLE" || e.tagName === "HEADER" || e.id === "iaFab") continue;
      const cs = getComputedStyle(e); if (cs.position !== "fixed" || cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) continue;
      const r = e.getBoundingClientRect(); if (r.width >= W * 0.9 && r.height >= H * 0.8 && +cs.zIndex > 0 && (cs.pointerEvents !== "none")) return "#" + (e.id || e.className || e.tagName);
    }''', '''    let hit = null;
    for (const e of document.body.children) {
      if (e.id === "navN1" || e.tagName === "SCRIPT" || e.tagName === "STYLE" || e.tagName === "HEADER" || e.id === "iaFab") continue;
      if (noTapa(e)) continue;   // v148: carteles (role=status, #avisoApp), movimiento (.mov-*), pantallas (.wrap)
      const cs = getComputedStyle(e); if (cs.position !== "fixed" || cs.display === "none" || cs.visibility === "hidden" || +cs.opacity < 0.05) continue;
      // v148: lo que se ve DENTRO de la pantalla (un cartel corrido hacia afuera con transform no tapa nada)
      const r = e.getBoundingClientRect(), vw = Math.min(r.right, W) - Math.max(r.left, 0), vh = Math.min(r.bottom, H) - Math.max(r.top, 0);
      if (vw >= W * 0.9 && vh >= H * 0.8 && +cs.zIndex > 0 && (cs.pointerEvents !== "none")) { if (vaiven(e)) continue; hit = e; break; }
    }
    ultGen = hit;
    if (hit) return "#" + (hit.id || hit.className || hit.tagName);''')
R('''  let h0 = "", ult = "";
  function pintar() {''', '''  // v148: lo que nunca tapa la pantalla (aunque sea fijo y grande) y el freno a la realimentación: si algo esconde la barra,
  // al esconderla cambia de tamaño, la barra vuelve, y así 3 veces en 6 s, ese algo se ignora (era el parpadeo de la v135–v147)
  const NO_TAPA_ID = /^(avToast|avisoApp|pmAviso|offAviso|ecToast|permToast|ieReloj|navTab|fssAviso|uvPanel|edBanner|cdIns|sugCaja)$/;   // avisoApp va por encima de la barra (z 100500): no hace falta esconderla
  const noTapa = (e) => NO_TAPA_ID.test(e.id || "") || /^(status|alert)$/.test(e.getAttribute("role") || "") || /(^|\\s)(mov-[a-z-]+|wrap)(\\s|$)/.test(String(e.getAttribute("class") || ""));
  let ultGen = null; const VAI = typeof WeakMap == "function" ? new WeakMap() : null, IGN = typeof WeakSet == "function" ? new WeakSet() : null;
  function vaiven(e) {
    if (!VAI || !IGN) return false;
    if (IGN.has(e)) return true;
    if (ultGen === e) return false;
    const ah = Date.now(); let v = VAI.get(e); if (!v || ah - v.t0 > 6000) { v = { n: 0, t0: ah }; VAI.set(e, v); }
    if (++v.n >= 3) { IGN.add(e); try { console.info("[navN1] se ignora (aparece y desaparece con la barra):", e.id || e.className); } catch (x) { } return true; }
    return false;
  }
  let h0 = "", ult = "", achPend = false;
  function pintar() {''')
R('''    const h = ks.map((k) => { const x = T[k], on = x.on(v, sub), b = x.bd ? V.intentar(x.bd, 0) : 0;
      return `<button type="button" data-n1="${k}" class="${on ? "on" : ""}" aria-label="${x.t}"${on ? ' aria-current="page"' : ""}>${V.ic(x.i, on ? 1.9 : 1.6, "n1-ic")}<span class="n1-t">${x.t}</span>${b ? `<b class="n1-bd">${b > 99 ? "99+" : b}</b>` : ""}</button>`; }).join("")''',
  '''    // v148: la barra se arma sin los globitos (así no se rearma entera cuando llega un aviso); los globitos se ponen aparte
    const h = ks.map((k) => { const x = T[k], on = x.on(v, sub);
      return `<button type="button" data-n1="${k}" class="${on ? "on" : ""}" aria-label="${x.t}"${on ? ' aria-current="page"' : ""}>${V.ic(x.i, on ? 1.9 : 1.6, "n1-ic")}<span class="n1-t">${x.t}</span></button>`; }).join("")''')
R('''    if (h !== h0) { n.innerHTML = h; h0 = h; achicar(n); }
    const tap = tapado(); ult = tap;
    document.body.classList.toggle("n1-on", !tap);
  }
  function achicar(n) {   // «Herramientas» no entra en 390 px: se achica la letra lo justo (v136: con la flechita de guardar)
    requestAnimationFrame(() => n.querySelectorAll(".n1-t").forEach((e) => { e.style.fontSize = ""; let f = parseFloat(getComputedStyle(e).fontSize) || 11.5; const w = e.parentNode.clientWidth - 4; while (e.scrollWidth > w && f > 9.5) { f -= 0.25; e.style.fontSize = f + "px"; } }));
  }''', '''    if (h !== h0) { n.innerHTML = h; h0 = h; achPend = true; }
    ks.forEach((k) => {   // v148: solo el número del globito
      const x = T[k], btn = n.querySelector('[data-n1="' + k + '"]'); if (!btn) return;
      const b = x.bd ? V.intentar(x.bd, 0) : 0, tx = b ? (b > 99 ? "99+" : String(b)) : "";
      let e = btn.querySelector(".n1-bd");
      if (!tx) { e && e.remove(); return; }
      if (!e) { e = document.createElement("b"); e.className = "n1-bd"; btn.appendChild(e); }
      if (e.textContent !== tx) e.textContent = tx;
    });
    const tap = tapado(); ult = tap;
    document.body.classList.toggle("n1-on", !tap);
    if (achPend && !tap) achicar(n);
  }
  function achicar(n) {   // «Herramientas» no entra en 390 px: se achica la letra lo justo (v136: con la flechita de guardar)
    // v148: una sola vez por armado y con la barra a la vista (escondida medía 0 de ancho y la dejaba en 9,5 px)
    requestAnimationFrame(() => {
      if (!achPend || !n.isConnected || !n.offsetWidth) return; achPend = false;
      n.querySelectorAll(".n1-t").forEach((e) => { e.style.fontSize = ""; let f = parseFloat(getComputedStyle(e).fontSize) || 11.5; const w = e.parentNode.clientWidth - 4; while (e.scrollWidth > w && f > 9.5) { f -= 0.25; e.style.fontSize = f + "px"; } });
    });
  }''')

# en la compu (sin barra) cada 0,7 s se reescribía la clase del body con el mismo valor (classList.remove siempre escribe)
R('if (!quiero) { document.body.classList.remove("n1-on"); ult = "off"; return; }', 'if (!quiero) { document.body.classList.toggle("n1-on", false); ult = "off"; return; }   // v148: toggle con fuerza no reescribe si ya está así')

# ============================================================== 3) movPantallas: una hoja sube solo si la abrió un toque recién (no un aviso)
R('''  function abrirHoja(ov) {
    var m = modo(); if (!m || !porInput() || camara() || enMapa()) return;''', '''  function abrirHoja(ov) {
    var m = modo(); if (!m || !porInput() || camara() || enMapa()) return;
    if (ahora() - ultInput > 700 || /^(status|alert|alertdialog)$/.test(ov.getAttribute("role") || "")) return;   // v148: un aviso que llega no es una hoja que abrió la persona''')

# ============================================================== 5) pulsos de atención: con «menos movimiento» del celu, quietos
R('<script id="revisarAppDiag">', '''<style id="v148Css">
/* v148 · con «menos movimiento» del celu, los puntitos que laten quedan quietos y el aviso de arriba aparece sin deslizar */
@media (prefers-reduced-motion:reduce){#btnMenu .uv-menu-dot,#iniEje .ie-vivo i,#avOt .ao-vivo i,.uv-pin.on::after{animation:none !important}#avToast{transition:none !important}}
</style>
<script id="revisarAppDiag">''')
exec(open(os.path.join(SRC, 'fotos148.py'), encoding='utf-8').read())   # fotos de la cuadrilla

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1), 'las dos marcas de versión no coinciden'
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
