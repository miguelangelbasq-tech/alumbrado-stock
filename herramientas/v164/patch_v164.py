"""v164 · Fotos de la cuadrilla: más rápidas, fáciles de nombrar y que lleguen al toque a la oficina (Ángel 16/11:
   «para sacar fotos es súper lento» · «a la hora de nombrar es súper lento… columna, tablero, PAT, cosas así» ·
   «una vez que envían o sacan fotos de la tarea no me llega, tengo que esperar»).
 · QUE LLEGUE AL TOQUE: la foto ya no espera a que la cámara se cierre y pasen 1,5–1,8 s sin tocar nada (la cola de por
   atrás de Modo obra y la bandeja v149b): sale apenas pasan 0,6 s del disparo. Apenas se saca, la orden recibe la
   miniatura con «subiendo…» (campo.fotos.<adjId> con el número de la foto fijado de entrada: Modo obra y cámara de la
   barra), la ficha del legajo (fotosObra, con el mismo id que el adjunto) se escribe ANTES de subir la imagen a la nube,
   y la imagen grande sube después. Nada se duplica (mismo número) y nada se pierde (la bandeja v149b la tiene desde
   el primer momento; si se recupera después, saca el «subiendo»).
 · MÁS RÁPIDA: el disparo arma la foto a 1024 px (la foto final es de 1024; antes 1920 × 1440 y se volvía a achicar),
   el sello decodifica con createImageBitmap (fuera del hilo) y de ese mismo lienzo salen la miniatura del legajo
   (140 px), la de la orden (72 px) y la imagen para subir (antes: tres decodificaciones más con comprimirImagen y
   __miniChica). Las fotos se procesan de a una por turno (fotosAlToque: __fotoTurno), sin trabar el disparador.
 · NOMBRAR RÁPIDO, en la cámara: fila «‹ Col 4 ›» + «Columna · Tablero · PAT · Zanja · Acometida · Otro…» arriba del
   disparador (Modo obra y cámara de la barra). «Otro…» abre un teclado chico con lo último escrito. Lo elegido sigue
   para la foto siguiente (las columnas pasan solas a la siguiente). Si no es de su orden, la foto va igual a la orden
   como «suelta» (sin tarea) y la oficina la mueve con «↔ Mover» (v152).
 · (A) EL DISPARADOR QUE NO SACABA LA FOTO («estuve ahí esperando, apretando y no se sacaba»): el toque armaba la foto a
   1920 × 1440 y la pasaba a JPEG antes de dar ninguna señal (1 a 5 s con el celu ocupado guardando la foto anterior); si la
   cámara todavía no tenía imagen (recién abierta, celu lento) el toque no hacía nada ni decía nada; y un segundo toque
   arrancaba otra foto que en Modo obra terminaba con la cámara cerrada («Cannot read properties of null (reading 'pos')»)
   y se perdía. Ahora: destello y vibración en el mismo toque, el cuadro se copia ya (1024 px), Modo obra cierra la
   cámara en ese toque y el JPEG se arma por atrás; sin imagen todavía, avisa y la saca sola apenas aparece (hasta 6 s;
   si no aparece, lo dice); nunca dos a la vez. «Sacar otra» después de una foto suelta (Tablero/Otro) tampoco hacía nada.
 · (B) QUE NO SE TILDE: con la cámara abierta, los relojitos de las pantallas de atrás corren cada 10 s como mucho y los
   vigías de la página no se despiertan por lo que cambia adentro de la cámara o detrás de ella; la marca en vivo no
   recalcula la página cada segundo; la píldora de la cámara de la barra cada 2 s; el destello sin forzar el dibujo; el
   sello no lee el EXIF de las fotos de la cámara de la app; la miniatura para la oficina sale del cuadro del disparo.
 · (C) LA CÁMARA ABRE AL TOQUE: se prende al apoyar el dedo en «Foto» y queda tibia 25 s después de cada foto («Sacar otra»
   abre sin volver a pedirla); se apaga si la app se va al fondo.
 · (A2) «COMO UNA CÁMARA NORMAL: APRETÁS Y SACA AL INSTANTE» (Ángel 17/11): el disparo sale en el pointerdown (no espera al
   clic, y ese clic no despierta a nadie más); el destello se dibuja primero y el cuadro se toma en la tarea siguiente con
   createImageBitmap(video) entero (con «resize» lo hacía en el hilo: 130–165 ms con CPU ×6); un Worker con OffscreenCanvas lo
   achica a 1024, arma el JPEG y la miniatura (respaldo: el canvas de siempre). Modo obra queda en RÁFAGA: la cámara sigue
   abierta, la fila pasa sola a la columna siguiente y «Listo» sale (ahí aparece «Foto guardada»). Lo pesado de cada foto
   (guardarla, la miniatura, la orden, la bandeja, el sello) espera 1,5 s sin tocar el disparador (window.__fotoQuieto); con
   la cámara abierta las escuchas de la base guardan el último aviso y lo entregan al cerrarla (window.__snapRetener, también
   el arnés) y Mis tareas se redibuja al cerrarla (window.__trasCamara); los vigías no se despiertan por carteles chicos ni
   por cambios de clase del body/html. Destello mediana 16–18 ms (CPU ×6, toques reales).
 · Compatibilidad: __v164No (lo pone el arnés salvo v164:true). Sin reglas nuevas.
Uso: python3 patch_v164.py ORIGINAL_163.html SALIDA.html [--otra-base]"""
import sys, os, re, hashlib, datetime
SRC = os.path.dirname(os.path.abspath(__file__))
BASE_SHA = open(os.path.join(SRC, 'BASE_SHA')).read().strip()   # ORIGINAL 163
args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sal = args[0], args[1]
t = open(ent, encoding='utf-8').read()
if '--otra-base' not in sys.argv:
    assert hashlib.sha256(t.encode()).hexdigest() == BASE_SHA, 'no es el ORIGINAL de la 163 (usá --otra-base si sabés lo que hacés)'
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:90], c); t = t.replace(a, b)
ON = '(window.__v164On && window.__v164On())'

# ============================================================================== 0) (B) «que no se tilde nada»: con la cámara abierta
# La cámara tapa toda la pantalla, pero los relojitos de las otras pantallas (atrás, barra de abajo, Llenar orden, Inicio…)
# seguían revisando la página cada 1–3 s: tareas de 120–300 ms con el celu lento, justo mientras se saca y se guarda la foto.
# Con la cámara abierta corren como mucho una vez cada 30 s; los que se crean con la cámara abierta (los de la cámara) siguen.
R('''    var ultimo = 0, extra = Array.prototype.slice.call(arguments, 2);
    return orig.call(window, function () {
      if (document.hidden) { var a = Date.now(); if (a - ultimo < ESCONDIDA_MS) return; ultimo = a; }
      else ultimo = 0;''',
  '''    var ultimo = 0, extra = Array.prototype.slice.call(arguments, 2), b0 = document.body, conCam = !!(b0 && b0.classList.contains("ec-abierta"));
    return orig.call(window, function () {
      if (document.hidden) { var a = Date.now(); if (a - ultimo < ESCONDIDA_MS) return; ultimo = a; }
      else if (!conCam && !window.__v164No && document.body && document.body.classList.contains("ec-abierta")) { var c = Date.now(); if (!ultimo) { ultimo = c; return; } if (c - ultimo < CAMARA_MS) return; ultimo = c; }   // v164 (la primera vuelta, recién a los 30 s de abrirla)
      else ultimo = 0;''')
R('''  var orig = window.setInterval, ESCONDIDA_MS = 60000;''', '''  var orig = window.setInterval, ESCONDIDA_MS = 60000, CAMARA_MS = 30000;''')
# y los «vigías» que miran TODA la página (appCelular, atrás, Llenar orden, barra…) se despertaban con cada cambio adentro de
# la cámara (la hora y el GPS de la marca, la píldora, los botones) y revisaban la página entera. Con la cámara abierta, lo que
# cambia adentro de la cámara, o en las pantallas que quedan tapadas detrás (.wrap), no los despierta (lo demás, sí; y al
# cerrarla, todos se enteran: sacar la cámara de la página es un cambio que ven todos).
R('''  window.__relojitosAhorro = { original: orig, minimoEscondida: ESCONDIDA_MS };''',
  '''  window.__relojitosAhorro = { original: orig, minimoEscondida: ESCONDIDA_MS };
  var MO = window.MutationObserver;
  if (MO) {
    var AVISOS = { fssAviso: 1, tcAviso: 1, avToast: 1, ecToast: 1 };   // carteles chicos que van y vienen detrás de la cámara
    var soloAvisos = function (x) { var l = [].slice.call(x.addedNodes).concat([].slice.call(x.removedNodes)); return l.length > 0 && l.every(function (n) { return n.nodeType !== 1 ? true : !!AVISOS[n.id]; }); };
    var MO2 = function (cb) {
      var yo = new MO(function (recs, obs) {
        if (yo.__ancho && !window.__v164No) {
          var b = document.body, cam = b && b.classList.contains("ec-abierta") && document.getElementById("emaCam");
          if (cam) { var r = []; for (var i = 0; i < recs.length; i++) { var tg = recs[i].target, el = tg && tg.nodeType === 1 ? tg : tg && tg.parentNode; if (!cam.contains(tg) && !(el && el.closest && el.closest(".wrap, #fssAviso, #tcAviso, #avToast")) && !(tg === b && soloAvisos(recs[i])) && !(recs[i].type === "attributes" && (tg === b || tg === document.documentElement))) r.push(recs[i]); } if (!r.length) return; recs = r; }   // lo de adentro de la cámara y de las pantallas de atrás (tapadas): al cerrarla, todos se enteran
        }
        return cb.call(this, recs, obs);
      });
      var ob = yo.observe;
      yo.observe = function (t, o) { if (o && o.subtree && (t === document || t === document.documentElement || t === document.body)) yo.__ancho = true; return ob.apply(yo, arguments); };
      return yo;
    };
    MO2.prototype = MO.prototype; window.MutationObserver = MO2; window.__relojitosAhorro.mo = MO;
  }''')
# la marca en vivo se reubica solo si cambió la pantalla o el video (antes, cada segundo: obligaba a recalcular la página)
R('''    cam.reloj = setInterval(() => { pintarMarca(); ubicarMarca(); }, 1000);''',
  '''    cam.reloj = setInterval(() => { pintarMarca(); const v = $("ecVideo"), kk = v ? [cam.nRes || 0, v.videoWidth, v.videoHeight, $("emaCam").classList.contains("fn-on")].join() : "";   /* sin leer innerWidth: obliga a recalcular la página */ if (!''' + ON + ''' || kk !== cam.kMarca) { cam.kMarca = kk; ubicarMarca(); } }, 1000);''')
# la píldora de la cámara de la barra: cada 2 s (antes cada 1 s, y cada vuelta recalculaba la obra y la marca)
R('''    clearInterval(CB.reloj); CB.reloj = setInterval(() => { if (!$("emaCam")) return clearInterval(CB.reloj); pintar(false); }, 1000);''',
  '''    clearInterval(CB.reloj); CB.reloj = setInterval(() => { if (!$("emaCam")) return clearInterval(CB.reloj); pintar(false); }, ''' + ON + ''' ? 2000 : 1000);
''')

# ============================================================================== 1) base: subirAdjunto y guardarFotoObra
R('''  const t = await comprimirImagen(e), o = { ...a, dataUrl: t.dataUrl, w: t.w, h: t.h, bytes: t.bytes, nombre: e.name || "", ts: Date.now(), usuario: window.__fbUser && window.__fbUser.email || "" };''',
  '''  const pre = a && a.__pre; if (a && "__pre" in a) { a = { ...a }; delete a.__pre; }   // v164: la imagen ya armada por el sello (sin volver a decodificar)
  const t = pre && pre.dataUrl ? pre : await comprimirImagen(e), o = { ...a, dataUrl: t.dataUrl, w: t.w, h: t.h, bytes: t.bytes, nombre: e.name || "", ts: Date.now(), usuario: window.__fbUser && window.__fbUser.email || "" };''')
R('''  let t;
  try { t = await subirAdjunto(e, { ...(a.__adjId ? { __id: a.__adjId } : {}) /* v149b: el número de la foto, fijado de entrada */, tipo: "obra",''',
  '''  // v164: con la miniatura ya armada por el sello, la ficha del legajo (con el mismo id que el adjunto) va ANTES de subir la
  // imagen: la oficina la ve en segundos; después se suelta el turno (la foto siguiente se procesa mientras esta sube)
  const __v164 = !!(a.__mini140 && a.__adjId && ''' + ON + ''');
  let __foHecho = false;
  if (__v164 && typeof window.fbFotoObraCrear == "function") { try { Promise.resolve(window.fbFotoObraCrear({ __id: a.__adjId, ...a.gps ? { lat: a.gps.lat, lng: a.gps.lng, gpsPrec: a.gps.prec } : {}, ...a.sello ? { sello: true } : {}, plazaId: String(a.plazaId || ""), plazaNombre: a.plazaNombre || "", otId: a.otId || "", otNumero: a.otNumero || "", k: a.k || "", tarea: a.tarea || "", cat: a.cat || "otra", num: a.num != null ? String(a.num) : "", nota: a.nota || "", adjId: a.__adjId, mini: a.__mini140, ts: Date.now(), fecha: fechaAISO(new Date()), por: a.por || "", usuario: window.__fbUser && window.__fbUser.email || "", origen: a.origen || "", ...__ub })).catch(() => { }); __foHecho = true; } catch (x) { } }
  try { typeof a.__soltar == "function" && a.__soltar(); } catch (x) { }
  let t;
  try { t = await subirAdjunto(e, { ...(a.__adjId ? { __id: a.__adjId } : {}) /* v149b: el número de la foto, fijado de entrada */, ...(__v164 && a.__pre ? { __pre: a.__pre } : {}), tipo: "obra",''')
R('''    if (er && er.enEspera && er.adjId && typeof window.fbFotoObraCrear == "function") { try {''',
  '''    if (er && er.enEspera && er.adjId && !__foHecho && typeof window.fbFotoObraCrear == "function") { try {''')
R('''  let o = "";
  try {
    o = (await comprimirImagen(e, 140, 7e3)).dataUrl;
  } catch {
  }''', '''  let o = __v164 ? a.__mini140 : "";
  if (!o) try {
    o = (await comprimirImagen(e, 140, 7e3)).dataUrl;
  } catch {
  }''')
R('''    typeof window.fbFotoObraCrear == "function" && (r = await window.fbFotoObraCrear(n));''',
  '''    if (__foHecho) r = a.__adjId; else typeof window.fbFotoObraCrear == "function" && (r = await window.fbFotoObraCrear(n));''')
R('''  let oc = o;
  try { window.__miniChica && (oc = await window.__miniChica(o)); } catch { }''',
  '''  let oc = o;
  if (__v164 && a.__mini72) oc = a.__mini72; else try { window.__miniChica && (oc = await window.__miniChica(o)); } catch { }''')

# ============================================================================== 2) sello: una sola decodificación, miniaturas y turno
R('''    const url = URL.createObjectURL(file);
    try {
      const img = await cargar(url);''',
  '''    const url = URL.createObjectURL(file);
    try {
      const v164 = ''' + ON + ''' && typeof createImageBitmap == "function";   // v164: decodifica fuera del hilo (y una sola vez)
      const img = v164 ? await createImageBitmap(file).then((b) => { try { b.naturalWidth = b.width; b.naturalHeight = b.height; } catch (e) { } return b.naturalWidth ? b : { bm: b, naturalWidth: b.width, naturalHeight: b.height }; }, () => cargar(url)) : await cargar(url);''')
R('''      const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
      const ctx = cv.getContext("2d"); ctx.drawImage(img, 0, 0, W, H);''',
  '''      const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
      const ctx = cv.getContext("2d"); ctx.drawImage(img.bm || img, 0, 0, W, H); try { img.close && img.close(); img.bm && img.bm.close && img.bm.close(); } catch (e) { }''')
R('''      const blob = await new Promise((ok) => cv.toBlob(ok, "image/jpeg", 0.9));
      if (!blob) return null;''',
  '''      if (v164 && window.__fotoAlToque) try { window.__fotoAlToque.minisDe(cv, meta); } catch (e) { }   // v164: miniaturas del mismo lienzo
      const blob = await new Promise((ok) => cv.toBlob(ok, "image/jpeg", v164 ? 0.82 : 0.9));
      if (!blob) return null;
      if (v164) meta.__wh = [W, H];''')
R('''    const n = async function (file, meta) {
      meta = Object.assign({}, meta || {});
      let f = file;
      try {
        if (file && /^image\\//.test(file.type || "image/")) {
          const tg = Date.now(), pos = await gpsParaFoto(); try { window.__fotoT && (window.__fotoT.gps = Date.now() - tg); } catch (e) { }
          const sel = await sellar(file, meta, pos);
          if (sel) { f = sel; meta.sello = true; }
          if (pos) meta.gps = pos;
        }
      } catch (e) { console.warn("sello", e); }
      try { window.__fotoSellada && window.__fotoSellada(f, meta); } catch (e) { }   // v149b: copia en el celu (Documentos › EMA › Fotos)
      return orig.call(this, f, meta);
    };''',
  '''    const n = async function (file, meta) {
      meta = Object.assign({}, meta || {});
      let f = file, soltar = null;
      try {
        try {
          if (file && /^image\\//.test(file.type || "image/")) {
            const tg = Date.now(), pos = await gpsParaFoto(); try { window.__fotoT && (window.__fotoT.gps = Date.now() - tg); } catch (e) { }
            if (window.__fotoTurno && ''' + ON + ''') { soltar = await window.__fotoTurno.pedir(); meta.__soltar = soltar; }   // v164: de a una, nunca en el cuadro del disparo
            const sel = await sellar(file, meta, pos);
            if (sel) { f = sel; meta.sello = true; if (meta.__wh && window.__fotoAlToque) meta.__pre = await window.__fotoAlToque.pre(sel, meta.__wh); }
            delete meta.__wh;
            if (pos) meta.gps = pos;
          }
        } catch (e) { console.warn("sello", e); }
        try { window.__fotoSellada && window.__fotoSellada(f, meta); } catch (e) { }   // v149b: copia en el celu (Documentos › EMA › Fotos)
        return await orig.call(this, f, meta);
      } finally { soltar && soltar(); }
    };''')

# ============================================================================== 3) camaraApp: disparo a 1024 px, nombre en vivo, input abierto
# (A) «estuve ahí esperando, apretando y no se sacaba la foto»: el disparo armaba la foto a 1920 × 1440 y la pasaba a JPEG
#     ANTES de dar ninguna señal (con el celu ocupado, 1 a 5 s sin que pase nada); si la cámara todavía no tenía imagen, el toque
#     no hacía nada y no decía nada; y un segundo toque arrancaba otra foto que, en Modo obra, terminaba con la cámara ya
#     cerrada («Cannot read properties of null (reading 'pos')») y se perdía. Ahora: destello y vibración en el mismo toque,
#     el cuadro se copia al instante (1024 px), la cámara de Modo obra se cierra enseguida (queda «tibia» para la próxima) y
#     el JPEG se arma después; sin imagen todavía, espera hasta 6 s y la saca sola apenas aparece (avisando); nunca dos a la vez.
R('''  async function disparar() {
    const v = $("ecVideo"); if (!cam || !v || !v.videoWidth) return;''',
  '''  async function disparar() {
    if (''' + ON + ''' && window.__camDisp164) return window.__camDisp164(cam, { $, usar, cerrar, avisoCam, actual: () => cam });
    const v = $("ecVideo"); if (!cam || !v || !v.videoWidth) return;''')
R('''  function usar() {
    if (!cam || !cam.foto) return;''',
  '''  function avisoCam(txt, mal) {   // v164: el cartel de arriba de la cámara (role=status)
    const e = $("ecAviso"); if (!e) return;
    clearTimeout(avisoCam.t); e.textContent = txt || ""; e.hidden = !txt; e.classList.toggle("mal", !!mal);
    if (txt && !avisoCam.fijo) avisoCam.t = setTimeout(() => { e.hidden = true; }, mal ? 6000 : 3500);
  }
  function usar() {
    if (!cam || !cam.foto) return;''')
# cámara «tibia»: al cerrarla después de una foto, el video queda prendido 25 s (la próxima abre al toque); se apaga si la app
# se va al fondo. Lo de antes, si v164 está apagado.
R('''  function pararStream() { if (cam && cam.stream) { cam.stream.getTracks().forEach((t) => t.stop()); cam.stream = null; } }''',
  '''  let tibia = null, calentando = null;   // v164: { stream, facing, t } · el pedido de precalentar en curso
  function apagarTibia() { if (!tibia) return; clearTimeout(tibia.t); try { tibia.stream.getTracks().forEach((t) => t.stop()); } catch (e) { } tibia = null; }
  function guardarTibia(st, facing) { apagarTibia(); if (!st || !st.getVideoTracks().some((t) => t.readyState === "live")) return; tibia = { stream: st, facing, t: setTimeout(apagarTibia, window.__camTibiaMs || 25000) }; }
  function tomarTibia(facing) { if (!tibia || tibia.facing !== facing || !tibia.stream.getVideoTracks().some((t) => t.readyState === "live")) { apagarTibia(); return null; } const st = tibia.stream; clearTimeout(tibia.t); tibia = null; return st; }
  document.addEventListener("visibilitychange", () => { if (document.hidden) apagarTibia(); });
  function pararStream(guardar) { if (cam && cam.stream) { if (guardar && ''' + ON + ''') guardarTibia(cam.stream, cam.facing); else cam.stream.getTracks().forEach((t) => t.stop()); cam.stream = null; } }
''')
R('''    window.addEventListener("resize", ubicarMarca);
    $("ecVideo").addEventListener("loadedmetadata", () => setTimeout(ubicarMarca, 50));''',
  '''    window.addEventListener("resize", ubicarMarca);
    window.addEventListener("resize", () => { if (cam) cam.nRes = (cam.nRes || 0) + 1; });   // v164
    $("ecVideo").addEventListener("loadedmetadata", () => setTimeout(ubicarMarca, 50));''')
# el sello: las fotos de la cámara de la app no traen EXIF (no hace falta leerlas)
R('''      const fecha = (await fechaExif(file)) || new Date(file.lastModified || Date.now());''',
  '''      const fecha = (/^EMA_\\d{14}\\.jpg$/.test(file.name || "") && ''' + ON + ''' ? null : await fechaExif(file)) || new Date(file.lastModified || Date.now());   // v164: la de la cámara de la app no trae EXIF''')
R('''  function cerrar() {
    if (!cam) return;
    pararStream();''',
  '''  function cerrar(tib) {
    if (!cam) return;
    pararStream(tib === true);''')
R('''    let st;
    try { st = await pedir({ facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } }); }''',
  '''    let st = null;
    if (''' + ON + ''') { if (calentando) await calentando.catch(() => { }); st = tomarTibia(facing); }   // v164: la de recién o la precalentada (abre al toque)
    if (!st) try { st = await pedir({ facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } }); }
''')
R('''  window.camaraApp = { abrir, cerrar, usaTelefono: usarTelefono, abierta: () => !!cam, abrirHoja, guardadas: () => nGuardadas,''',
  '''  window.camaraApp = { abrir, cerrar, usaTelefono: usarTelefono, abierta: () => !!cam, abrirHoja, guardadas: () => nGuardadas,
    /* v164: el input de la cámara abierta y cambiar lo que va a decir la foto (marca en vivo y título) sin cerrarla */ inp: () => (cam && cam.inp) || null,
    /* v164: prender la cámara antes de abrirla (al apoyar el dedo en «Foto»): queda tibia 25 s */ precalentar: () => { if (cam || tibia || calentando || !puede() || usarTelefono() || negada || document.hidden) return false; calentando = navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1440 } } }).then((st) => { calentando = null; if (document.hidden || tibia) { st.getTracks().forEach((t) => t.stop()); return; } guardarTibia(st, "environment"); }, () => { calentando = null; }); return true; },
    tibia: () => !!tibia,
    ponerQue: (que, tit) => { if (!cam) return; cam.ctx.que = String(que || ""); const tt = document.querySelector("#emaCam .ec-tit"); tt && (tt.textContent = tit || que || "Foto de obra"); try { pintarMarca(); } catch (e) { } },''')
# cámara de la barra: el número de la foto fijado de entrada, la miniatura en la orden al toque y en la bandeja ya
R('''    avisar("Guardando la foto…");
    try {
      const s = await window.guardarFotoObra(file, meta);''',
  '''    const AT = ''' + ON + ''' && window.__fotoAlToque;
    if (AT) { try { AT.antes(file, meta, ot, campoFoto); } catch (x) { console.warn("[v164]", x); } }   // v164: la orden la ve al toque; la foto ya está en la bandeja
    if (AT && window.__fotoQuieto) await window.__fotoQuieto();   // v164: lo pesado, cuando el dedo se queda quieto
    avisar(AT ? (num ? num + " · " : "") + "Guardada · subiendo…" : "Guardando la foto…");
    try {
      const s = await window.guardarFotoObra(file, meta);''')
R('''      if (ot && er && er.enEspera && er.adjId && typeof window.mtCampoGuardar == "function") window.mtCampoGuardar(ot.id''',
  '''      if (ot && er && er.enEspera && er.adjId && !(AT && meta.__adjId) && typeof window.mtCampoGuardar == "function") window.mtCampoGuardar(ot.id''')

# ============================================================================== 4) cuadrillaDia (Modo obra)
R('''  const libre = () => document.hidden || (!document.getElementById("emaCam") && Date.now() - ultToque > 1800);
  function correrCola() {''',
  '''  const libre = () => (window.__fotoLibre && ''' + ON + ''' ? window.__fotoLibre() : document.hidden || (!document.getElementById("emaCam") && Date.now() - ultToque > 1800));   // v164: sale aunque la cámara siga abierta
  function correrCola() {''')
R('''      a.guardar(o2, { ["campo.fotos." + Lk(pe.adjId)]: { por: pe.por, ts: pe.ts, k: pe.k, tarea: pe.tarea, cat: pe.cat, num: pe.num, mini: (r.s && r.s.mini) || "" } });''',
  '''      pe.fin = 1; a.guardar(o2, { ["campo.fotos." + Lk(pe.adjId)]: { por: pe.por, ts: pe.ts, k: pe.k, tarea: pe.tarea, cat: pe.cat, num: pe.num, mini: (r.s && r.s.mini) || pe.miniB || "" } });''')
R('''if (sb) sb.textContent = r.espera || navigator.onLine === false ? "Quedó guardada en el celu: se sube sola." : "Guardada · subiendo…";''',
  '''if (sb) sb.textContent = r.espera || navigator.onLine === false ? "Quedó guardada en el celu: se sube sola." : ''' + ON + ''' ? "✓ Subida: la oficina ya la tiene." : "Guardada · subiendo…";''')
R('''    const p = tareas(o).find((x) => x.k === inp.dataset.k); if (!p) return;
    const num = inp.dataset.fln || "", cat = inp.dataset.cat || catDe(p), por = per();''',
  '''    const p = tareas(o).find((x) => x.k === inp.dataset.k) || (inp.dataset.fnSuelta === "1" && ''' + ON + ''' ? { k: "", label: inp.dataset.fln || "Foto", suelta: true } : null); if (!p) return;   // v164: «suelta» = no es de una tarea de la orden (la oficina la mueve)
    const num = inp.dataset.fln || "", cat = inp.dataset.cat || catDe(p), por = per();''')
R('''    let tc = null; if ((window.__tiempoCol && !window.__v157No)) { meta.__tcYa = 1;''',
  '''    const AT = ''' + ON + ''' && window.__fotoAlToque;
    if (AT) { pe.adjId = AT.nuevoAdj(); meta.__adjId = pe.adjId; }   // v164: el número de la foto de entrada (la orden la ve al toque, sin duplicar)
    let tc = null; if ((window.__tiempoCol && !window.__v157No) && !p.suelta) { meta.__tcYa = 1;''')
R('''FC.poner({ id: pe.id, f, meta: Object.assign({}, meta, { __bandejaId: "" }), plaza: o.plazaNombre || "", origen: "obra", otId: o.id, k: p.k, tarea: p.label, cat, num, por, ts: t0 });''',
  '''FC.poner(Object.assign({ id: pe.id, f, meta: Object.assign({}, meta, { __bandejaId: "", __adjId: "" }), plaza: o.plazaNombre || "", origen: "obra", otId: o.id, k: p.k, tarea: p.label, cat, num, por, ts: t0 }, pe.adjId ? { adjId: pe.adjId } : {}));
    if (AT) AT.anunciar(o, pe, f, (patch) => a.guardar(otDe(o.id) || o, patch));
    if (AT && rafaga && window.__fotoQuieto) await window.__fotoQuieto();   // v164: lo pesado, cuando el dedo se queda quieto (la foto ya está en el celu)''')
R('''    const u = unidades(o, p), ix = u.items.findIndex((x) => nk(x.num) === nk(num));
    const cuenta = u.tipo === "unidad" ?''',
  '''    const u = p.suelta ? { tipo: "suelta", items: [] } : unidades(o, p), ix = u.items.findIndex((x) => nk(x.num) === nk(num));
    const cuenta = p.suelta ? "Va a la orden sin tarea: la oficina la ve y la puede mover" : u.tipo === "unidad" ?''')

# «Sacar otra» después de una foto «suelta» (Tablero, Otro… sin tarea en la orden) no hacía nada: buscaba la tarea de la foto
# anterior y no había. Ahora abre la cámara con la tarea que sigue (y la fila vuelve a lo que eligió: Tablero, «Caño roto»…).
R('''const p = S.ultFoto && tareas(o).find((x) => x.k === S.ultFoto.k); if (p) tomarFoto(o, { p, u: unidades(o, p), it: { num: S.ultFoto.num } }, true); return; }''',
  '''const p = S.ultFoto && tareas(o).find((x) => x.k === S.ultFoto.k); if (p) tomarFoto(o, { p, u: unidades(o, p), it: { num: S.ultFoto.num } }, true); else if (''' + ON + ''') { const q = pa.p || tareas(o)[0]; if (q) tomarFoto(o, { p: q, u: unidades(o, q), it: pa.it || null }, false); } return; }''')

# ============================================================================== 5) fotosSeguras (bandeja)
R('''  const libre = () => document.hidden || (!$("emaCam") && Date.now() - ultToque > 1500);''',
  '''  const libre = () => (window.__fotoLibre && ''' + ON + ''' ? window.__fotoLibre() : document.hidden || (!$("emaCam") && Date.now() - ultToque > 1500));   // v164''')
R('''    else if (mini && f[Lk(rec.adjId)] && !f[Lk(rec.adjId)].mini) patch = { [k + ".mini"]: mini };''',
  '''    else if (mini && f[Lk(rec.adjId)] && !f[Lk(rec.adjId)].mini) patch = { [k + ".mini"]: mini };
    else if (f[Lk(rec.adjId)] && f[Lk(rec.adjId)].subiendo) patch = Object.assign({ [k + ".subiendo"]: false }, mini ? { [k + ".mini"]: mini } : {});   // v164: la miniatura de «subiendo…» ya subió''')
R('''    const l = lista().filter((r) => r.fase === "nueva" || r.fase === "error");''',
  '''    const l = lista().filter((r) => (r.fase === "nueva" || r.fase === "error") && !(r.fase === "nueva" && PROPIAS[r.id] && Date.now() - PROPIAS[r.id] < 180000 && ''' + ON + '''));   // v164: la que está en la fila de Modo obra / la cámara no se intenta dos veces''')

# ============================================================================== 6) cámara de la barra (obraGps): fila de nombres
R('''    const lbl = (MODOS.find((m) => m[0] === CB.cat) || ["", catTxt(CB.cat)])[1];''',
  '''    const lbl = CB.cat === "otra" && CB.otro && ''' + ON + ''' ? CB.otro : (MODOS.find((m) => m[0] === CB.cat) || ["", catTxt(CB.cat)])[1];''')
R('''<div class="cbx-modos" id="cbModos">${MODOS.map((m) => `<button type="button" class="cbx-modo${m[0] === CB.cat ? " on" : ""}" data-cbm="${m[0]}">${esc(m[1])}</button>`).join("")}</div>`;''',
  '''${window.__fotoNombre && ''' + ON + ''' ? window.__fotoNombre.filaCb(CB) : `<div class="cbx-modos" id="cbModos">${MODOS.map((m) => `<button type="button" class="cbx-modo${m[0] === CB.cat ? " on" : ""}" data-cbm="${m[0]}">${esc(m[1])}</button>`).join("")}</div>`}`;''')
R('''cat: CB.cat || "otra", num: pide(CB.cat) ? CB.num : "", k: e.ot && CB.k ? CB.k : "",''',
  '''cat: CB.cat || "otra", num: pide(CB.cat) ? CB.num : CB.cat === "otra" && CB.otro && ''' + ON + ''' ? CB.otro : "", k: e.ot && CB.k ? CB.k : "",''')
R('''  window.__camB = { activa: camB, abrir, resolver, pintar: () => pintar(true),''',
  '''  window.__camB = { activa: camB, abrir, resolver, pintar: () => pintar(true),
    /* v164: «Otro…» con texto */ otro: (txt) => { CB.cat = "otra"; CB.tipoManual = true; CB.otro = String(txt || "").trim(); CB.k = ""; CB.tarea = ""; CB.lista = null; CB.num = ""; pintar(true); },''')

# ============================================================================== 7) «📸 Avance» de la oficina: «subiendo…»
R('''(f.mini ? '<img src="' + esc(f.mini) + '" alt="">' : '<span class="ao-sinfoto">📷</span>') + "<span>" + esc((f.num ? f.num + " · " : "") + (String(f.por || "").split(" ")[0]) + " " + hora(f.ts)) + "</span></button>";''',
  '''(f.mini ? '<img src="' + esc(f.mini) + '" alt="">' : '<span class="ao-sinfoto">📷</span>') + "<span>" + esc((f.num ? f.num + " · " : "") + (String(f.por || "").split(" ")[0]) + " " + hora(f.ts)) + "</span>" + (f.subiendo && !window.__v164No ? '<i class="ao-subiendo">subiendo…</i>' : "") + "</button>";''')

# ============================================================================== 9) «como una cámara normal: apretás y saca AL INSTANTE»
# (Ángel 17/11, después de ver las medidas). El disparo sale en el pointerdown (no espera al clic); la cámara de Modo obra queda
# abierta para sacar varias seguidas («ráfaga», con «Listo»); lo que viene después de cada foto (guardarla, la miniatura, la
# orden, la bandeja) espera a que pase ~1 s sin tocar el disparador; y, con la cámara abierta, las escuchas de la base no
# redibujan las pantallas de atrás (se entregan al cerrarla o con 4 s sin tocar nada).
R('''    if (a === "disparar") return disparar();''',
  '''    if (a === "disparar") { if (''' + ON + ''' && Date.now() - ultPD < 1500) return; return disparar(); }   // v164: ya salió en el pointerdown''')
R('''  document.addEventListener("keydown", (e) => { if (cam && e.key === "Escape") cerrar(); });''',
  '''  document.addEventListener("keydown", (e) => { if (cam && e.key === "Escape") cerrar(); });
  let ultPD = 0;   // v164: el disparo sale al apoyar el dedo (como una cámara de verdad)
  document.addEventListener("pointerdown", (e) => {
    if (!cam || !(''' + ON + ''') || (e.button && e.button > 0)) return;
    const b = e.target && e.target.closest && e.target.closest('#emaCam [data-ec="disparar"]'); if (!b) return;
    const ec = $("emaCam"); if (ec && ec.classList.contains("ec-cb") && window.__camB && window.__camB.sinObra && window.__camB.sinObra()) return;   // cámara de la barra sin obra: el clic abre «¿En qué obra estás?»
    ultPD = Date.now(); window.__camUltDisparo = ultPD; disparar();
  }, true);''')
R('''  window.__camB = { activa: camB, abrir, resolver, pintar: () => pintar(true),''',
  '''  window.__camB = { activa: camB, abrir, resolver, pintar: () => pintar(true), sinObra: () => !calc().obra,''')
# Modo obra: la cámara queda abierta (ráfaga)
R('''inp.dataset.cat = pa.u.cat; inp.dataset.otra = otra ? "1" : "";''',
  '''inp.dataset.cat = pa.u.cat; inp.dataset.otra = otra ? "1" : ""; inp.dataset.ecRafaga = ''' + ON + ''' ? "1" : "";''')
# lo pesado de la foto espera ~1 s sin tocar el disparador; la hora de la columna es la del disparo
R('''    const src = intentar(() => URL.createObjectURL(f), "");
    const meta = { plazaId:''',
  '''    const rafaga = ''' + ON + ''' && inp.dataset.ecRafaga === "1"; inp.value = "";
    const src = intentar(() => URL.createObjectURL(f), "");
    const meta = { plazaId:''')
R('''const t0 = (window.__tiempoCol && !window.__v157No) ? window.__tiempoCol.ahora() : Date.now(), pe = {''',
  '''const t0 = ''' + ON + ''' && !window.__tcAhora && f.lastModified ? f.lastModified : (window.__tiempoCol && !window.__v157No) ? window.__tiempoCol.ahora() : Date.now(), pe = {''')
R('''    pintar(true);
    const gps = intentar(() => !!(window.__fotoGpsVivo && window.__fotoGpsVivo()), false) || !!S.pos;
    hojaFoto(o, { src: s.mini || src, num, tarea: primero(p.label), gps, enEspera: enEspera, cuenta, pe: pe.id, tc });
  }''',
  '''    const gps = intentar(() => !!(window.__fotoGpsVivo && window.__fotoGpsVivo()), false) || !!S.pos;
    const info = { src: s.mini || src, num, tarea: primero(p.label), gps, enEspera: enEspera, cuenta, pe: pe.id, tc };
    if (rafaga && $("emaCam")) {   // v164: con la cámara abierta, «Foto guardada» sale al cerrarla (Listo / ✕)
      S.hojaPend = { id: o.id, info };
      if (!S.obsRafaga) { S.obsRafaga = 1; new MutationObserver(() => { if (!S.hojaPend || $("emaCam")) return; const h = S.hojaPend; S.hojaPend = null; const o2 = otDe(h.id); pintar(true); if (o2) hojaFoto(o2, h.info); }).observe(document.body, { childList: true }); }
      try { window.__fotoAlToque && window.__fotoAlToque.enCamara(info); } catch (e) { }
      return;
    }
    pintar(true);
    hojaFoto(o, info);
  }''')

# el clic que sigue al toque del disparador (la foto ya salió en el pointerdown) no despierta a nadie: atrás, la barra de abajo
# y otros revisaban toda la página con cada clic (100–300 ms con el celu lento, justo entre foto y foto). Va en el primer script.
R('''  window.__relojitosAhorro = { original: orig, minimoEscondida: ESCONDIDA_MS };''',
  '''  window.__relojitosAhorro = { original: orig, minimoEscondida: ESCONDIDA_MS };
  document.addEventListener("click", function (e) {
    if (window.__v164No || !(Date.now() - (window.__camUltDisparo || 0) < 1500)) return;
    var t = e.target; if (!t || !t.closest || !t.closest('#emaCam [data-ec="disparar"]')) return;
    e.stopImmediatePropagation(); e.preventDefault();
  }, true);''')
# Mis tareas no se redibuja detrás de la cámara (al cerrarla, sí)
R('''    M(ot, patch), A();
    return true;''',
  '''    M(ot, patch); if (!(''' + ON + ''' && window.__trasCamara && window.__trasCamara("mt", A))) A();   // v164: con la cámara abierta, al cerrarla
    return true;''')

# ============================================================================== 8) el módulo
MOD = open(os.path.join(SRC, 'fotosAlToque.html'), encoding='utf-8').read()
R('<script id="revisarAppDiag">', MOD + '<script id="revisarAppDiag">')

# sello de versión (las dos marcas)
ahora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).strftime('%Y-%m-%d %H:%M')
m = re.search(r'· v (\d{4}-\d\d-\d\d \d\d:\d\d · [0-9a-f]{6})<', t); assert m
mm = re.search(r'<meta name="ema-version" content="([^"]+)">', t); assert mm and mm.group(1) == m.group(1)
h6 = hashlib.sha256(t.encode()).hexdigest()[:6]
R(m.group(0), f'· v {ahora} · {h6}<'); R(mm.group(0), f'<meta name="ema-version" content="{ahora} · {h6}">')
open(sal, 'w', encoding='utf-8').write(t); print('ok', sal, len(t), f'{ahora} · {h6}')
