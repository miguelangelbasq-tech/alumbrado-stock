"""v167 · Zoom en la cámara + galería: elegir varias, enviar varias, borrar (Ángel 18/11: «La cámara no podés hacer zoom…
   como que muy alejada, tenés que acercarte mucho para la foto» · «Cuando sacás varias fotos, podés entrar a la galería y
   apretar enviar varias, seleccionar varias o eliminar alguna, tanto la cuadrilla como la oficina»).
 · Cámara de la app: la principal de atrás (no la gran angular / macro), zoom con dos dedos, ruedita y 1× 2× 3×; primero el
   del aparato (getCapabilities().zoom), si no digital con la foto = lo que se ve (createImageBitmap con recorte, el mismo
   camino rápido de la v164).
 · Galería: «☑ Elegir» también sin lista de fondo (📷 Mis fotos, la última de la cámara…) → hoja con «Enviar (N)»,
   «Borrar (N)» y «↔ Mover»; la barra del legajo / Mis tareas con «Enviar (N)» y «Borrar (N)» también para la cuadrilla.
Pruebas viejas: __v167No (lo pone el arnés salvo v167:true) → todo como la v166. Sin reglas nuevas.
Uso: python3 patch_v167.py ORIGINAL_166.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 166
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 166 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
JS = open(os.path.join(SRC, 'zoomGaleria.js'), encoding='utf-8').read()
CSS = open(os.path.join(SRC, 'zoomGaleria.css'), encoding='utf-8').read()

# ============================================================== camaraApp: la cámara principal, el zoom y la marca sobre lo que se ve
R('<video id="ecVideo" playsinline muted autoplay></video>', '<video id="ecVideo" playsinline muted autoplay></video>${window.__zmHtml ? window.__zmHtml() : ""}')
R('st = tomarTibia(facing); }', 'st = tomarTibia(facing); }\n    if (cam) cam.deTibia = !!st;   // v167: la tibia conserva el zoom')
R('if (!st) try { st = await pedir({ facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } }); }',
  'if (!st) try { st = await pedir(window.__zmCons ? window.__zmCons(facing) : { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } }); }   // v167: la principal de atrás, si ya se sabe cuál es')
R('catch (e) { if (e && /NotAllowed|Security/i.test(e.name)) throw e; st = await pedir(true); }',
  'catch (e) { if (e && /NotAllowed|Security/i.test(e.name)) throw e; st = await (window.__zmReintento ? window.__zmReintento(pedir, facing, e) : pedir(true)); }')
R('    cam.torch = false;\n  }', '    cam.torch = false;\n    try { window.__zmArranco && window.__zmArranco(cam, () => arrancar(cam.facing).then(() => setTimeout(ubicarMarca, 200)).catch(() => { })); } catch (e) { }   // v167: zoom y cámara principal\n  }')
R('const r = v.getBoundingClientRect(), k = Math.min(r.width / v.videoWidth, r.height / v.videoHeight);\n    const w = v.videoWidth * k, h = v.videoHeight * k, x = r.left + (r.width - w) / 2, y = r.top + (r.height - h) / 2;',
  'const r = v.getBoundingClientRect(), k = Math.min(r.width / v.videoWidth, r.height / v.videoHeight);\n    let w = v.videoWidth * k, h = v.videoHeight * k, x = r.left + (r.width - w) / 2, y = r.top + (r.height - h) / 2;\n'
  '    const vz = window.__zmVis ? window.__zmVis(v) : null; if (vz) { x = vz.x; y = vz.y; w = vz.w; h = vz.h; }   // v167: con zoom digital, sobre lo que se ve (= la foto)')
R('const K = Math.min(1, 1024 / Math.max(v.videoWidth, v.videoHeight)), W = v.videoWidth * K, H = v.videoHeight * K;',
  'const VW = vz ? vz.cw : v.videoWidth, VH = vz ? vz.ch : v.videoHeight, K = Math.min(1, 1024 / Math.max(VW, VH)), W = VW * K, H = VH * K;')
R('tibia: () => !!tibia,', 'tibia: () => !!tibia, ubicar: () => { try { ubicarMarca(); } catch (e) { } },   /* v167 */')
R('video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1440 } } }).then((st) => { calentando = null;',
  'video: window.__zmCons ? window.__zmCons("environment") : { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1440 } } }).then((st) => { calentando = null;')

# ============================================================== fotosAlToque (v164): el disparo recorta lo que se ve (zoom digital)
R('const k = Math.min(1, 1024 / Math.max(v.videoWidth, v.videoHeight)), W2 = Math.round(v.videoWidth * k), H2 = Math.round(v.videoHeight * k), espejo = cam.facing === "user";',
  'const rc = window.__zmRecorte ? window.__zmRecorte(v) : null, VW = rc ? rc.w : v.videoWidth, VH = rc ? rc.h : v.videoHeight;   // v167: con zoom digital, solo lo que se ve\n'
  '    const k = Math.min(1, 1024 / Math.max(VW, VH)), W2 = Math.round(VW * k), H2 = Math.round(VH * k), espejo = cam.facing === "user";')
R('createImageBitmap(v).catch(() => null)', '(rc ? createImageBitmap(v, rc.x, rc.y, rc.w, rc.h) : createImageBitmap(v)).catch(() => null)')
R('c.drawImage(v, 0, 0, W2, H2); });', 'if (rc) c.drawImage(v, rc.x, rc.y, rc.w, rc.h, 0, 0, W2, H2); else c.drawImage(v, 0, 0, W2, H2); });')
R('c.drawImage(src, 0, 0, W2, H2); }', 'if (rc && src.videoWidth) c.drawImage(src, rc.x, rc.y, rc.w, rc.h, 0, 0, W2, H2); else c.drawImage(src, 0, 0, W2, H2); }')

# ============================================================== galeriaPro: «☑ Elegir» sin lista de fondo, Enviar (N), Borrar (N) para la cuadrilla
R("V.el.querySelector('[data-gp=\"elegir\"]').hidden = !V.op.cont;",
  "V.el.querySelector('[data-gp=\"elegir\"]').hidden = !V.op.cont && !(window.__zgVisorElegir && window.__zgVisorElegir(V.items));   // v167")
R('if (a === "elegir") { const c = V.op.cont, id = it.id; cerrarVisor(); if (c) { entrar(c); sel.ids.add(id); repintarSel(); } return; }',
  'if (a === "elegir") { const c = V.op.cont, id = it.id, lista = V.items.slice(); cerrarVisor(); if (c) { entrar(c); sel.ids.add(id); repintarSel(); } else if (window.__zgElegirItems) window.__zgElegirItems(lista, id); return; }   // v167: sin lista de fondo, la hoja «Elegir fotos»')
R('if (a === "compartir") return accion("compartir", [it], msgVisor);',
  'if (a === "compartir") return (window.__zgEnviar && !window.__v167No ? window.__zgEnviar([it], msgVisor) : accion("compartir", [it], msgVisor));   // v167: sin señal, la del celu')
R('📤<span>Compartir</span></button><button type="button" data-gpb="bajar"',
  '📤<span>${window.__v167No ? "Compartir" : "Enviar" + (n ? " (" + n + ")" : "")}</span></button><button type="button" data-gpb="bajar"')
R('${plaza && puedeBorrar() ? `<button type="button" class="gpb-borrar" data-gpb="borrar" ${n ? "" : "disabled"}>🗑<span>Borrar</span></button>` : ""}`;',
  '${(() => { const z = window.__zgBarraBorrar ? window.__zgBarraBorrar([...sel.ids], plaza, n) : null; return z != null ? z : plaza && puedeBorrar() ? `<button type="button" class="gpb-borrar" data-gpb="borrar" ${n ? "" : "disabled"}>🗑<span>Borrar</span></button>` : ""; })()}`;   // v167: también la cuadrilla (sus fotos)')
R('if (a === "compartir" || a === "bajar") return accion(a, items);',
  'if (a === "compartir" && window.__zgEnviar && !window.__v167No) return window.__zgEnviar(items);   // v167\n    if (a === "compartir" || a === "bajar") return accion(a, items);')
R('    if (a === "borrar") {\n      const plaza = items[0] && items[0].plaza; if (!plaza) return;',
  '    if (a === "borrar" && window.__zgBarraBorrarClic && !window.__v167No && await window.__zgBarraBorrarClic(items, salir)) return;   // v167: «¿Borrar 3 fotos?», la cuadrilla las suyas\n'
  '    if (a === "borrar") {\n      const plaza = items[0] && items[0].plaza; if (!plaza) return;')

# ============================================================== el módulo
MOD = '<style id="zoomGaleriaCss">\n' + CSS + '</style>\n<script id="zoomGaleria">\n' + JS + '</script>\n'
R('<script id="revisarAppDiag">', MOD + '<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
