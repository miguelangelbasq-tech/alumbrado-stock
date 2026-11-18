(function () {
  "use strict";
  // v167 · Zoom en la cámara + galería: elegir varias, enviar varias, borrar (Ángel 18/11/2026: «La cámara no podés hacer
  // zoom… como que muy alejada, tenés que acercarte mucho para la foto» · «Cuando sacás varias fotos, podés entrar a la galería y
  // apretar enviar varias, seleccionar varias o eliminar alguna, tanto la cuadrilla como la oficina» · «Cuando hagas el zoom
  // verificá que todo esté bien, que siga con el tiempo rápido de sacar fotos»).
  //  A) LA CÁMARA «MUY ALEJADA»: la cámara de la app (#emaCam) pedía solo «la de atrás» (facingMode) y nunca miraba cuál de
  //     las cámaras traseras le daba el celu (en los celus con gran angular / macro / profundidad, Chrome puede dar una que no es
  //     la principal), y no tenía zoom de ninguna clase: ni pellizco, ni botones, ni el zoom del aparato.
  //     · Cámara principal: después de abrir la primera vez (con permiso, los nombres de las cámaras se pueden leer) se elige la
  //       principal de las traseras («camera2 0, facing back»: el número más bajo, sin «ultra / wide / gran angular / 0,5 /
  //       macro / depth / tele»); si la que vino era otra, se cambia una sola vez y queda anotada (localStorage
  //       ema.cam.principal) para las próximas (también la precalentada). Si un día no abre, se borra y vuelve a «la de atrás».
  //     · Zoom con dos dedos (pellizco) sobre la imagen, la ruedita en la compu y botones 1× · 2× · 3× (44 px) a la derecha, a
  //       media altura: no tapan el disparador, la fila para nombrar (v164) ni la píldora / reloj / «Col ▾» de la cámara C (v165).
  //     · Primero el zoom del aparato (track.getCapabilities().zoom → applyConstraints, de a uno por vez, el último gana); lo que
  //       pasa de su máximo (o todo, si no tiene) es zoom digital: la imagen se agranda en la pantalla (transform en el video) y al
  //       sacar se recorta EXACTO lo que se ve (createImageBitmap con recorte, mismo camino rápido de la v164: destello en el
  //       toque, Worker, ráfaga). La foto sale como siempre, lado mayor hasta 1024 px (no se agranda: si el recorte es más chico,
  //       queda de su tamaño) y el sello y las miniaturas salen del recorte.
  //     · El zoom queda mientras la cámara está abierta y mientras queda tibia (v164: misma cámara prendida); si se apagó del
  //       todo, vuelve a 1×.
  //  B) GALERÍA: «☑ Elegir» también en la galería que se abre sin lista de fondo (📷 Mis fotos de Mis tareas, la última foto de
  //     la cámara, el «📸 Avance»…): hoja #zgOv con las fotos, tilde, «N elegidas», «Elegir todas» / «Ninguna» y abajo
  //     «📤 Enviar (N)» (el menú del celu con las N fotos de una; en la app de Android, Share; en la compu, el ZIP con GPS de
  //     siempre), «🗑 Borrar (N)» y «↔ Mover» (v152, solo quien puede). En la barra de elegir del legajo / Mis tareas
  //     (galeriaPro), «Enviar (N)» y «Borrar (N)» también para la cuadrilla (sus fotos de su orden abierta).
  //     · Borrar: la cuadrilla, SOLO sus fotos de su orden abierta (__fotoSacarMia: queda «borrada» en la orden, como «🗑 La
  //       última» de la v107); la oficina, las que ya podía borrar (fotosBorrar: legajo, fotosBorradas). Nada se borra de la nube
  //       (el Worker no borra). Lo que no se puede, el botón lo dice («2 no son tuyas»). Siempre con «¿Borrar 3 fotos?».
  //     · Mirar, pañol y Dirección: solo Enviar.
  //     · Sin señal: si la foto se sacó en este celu (la sellada, guardada en la memoria de esta sesión, o la de la bandeja v149b),
  //       se manda esa.
  //  Sin reglas nuevas. Apagado con __v167No.
  const $ = (id) => document.getElementById(id);
  const esc = (t) => (typeof escHtml == "function" ? escHtml(String(t == null ? "" : t)) : String(t == null ? "" : t).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]));
  const intentar = (f, d) => { try { return f(); } catch (e) { return d; } };
  const no = () => !!window.__v167No;
  const v164 = () => !!(window.__v164On && window.__v164On());
  const fmtZ = (z) => (Math.round(z * 10) / 10).toFixed(1).replace(".", ",").replace(",0", "") + "×";

  // =================================================================================================== A) ZOOM
  const LS_P = "ema.cam.principal";
  const leerP = () => intentar(() => JSON.parse(localStorage.getItem(LS_P) || "null"), null);
  const ponerP = (x) => intentar(() => { x ? localStorage.setItem(LS_P, JSON.stringify(x)) : localStorage.removeItem(LS_P); });
  const MALAS = /ultra|wide|gran\s*angular|angular|0[.,]5|macro|depth|profundidad|tele|tof|bokeh|mono/i;
  const TRASERA = /back|rear|tras|environment|posterior|tr[aá]s/i;
  const numDe = (l) => { const m = String(l || "").match(/camera2?\s*(\d+)/i) || String(l || "").match(/c[aá]mara\s*(\d+)/i); return m ? +m[1] : Infinity; };
  function elegirPrincipal(lista) {   // de los videoinput (con nombre), la cámara principal de atrás
    const back = (lista || []).filter((d) => d && d.kind === "videoinput" && d.label && TRASERA.test(d.label));
    if (back.length < 2) return back.length === 1 ? back[0] : null;
    const buenas = back.filter((d) => !MALAS.test(d.label));
    const l = (buenas.length ? buenas : back).slice().sort((a, b) => numDe(a.label) - numDe(b.label));
    return l[0] || null;
  }
  const Z = { z: 1, trackId: "", hw: null, hwPend: null, hwCorre: false, cam: null, revisado: false, cambiado: false, caja: null, med: [], elegida: null };
  const maxTot = () => Math.min(8, Math.max(4, Z.hw ? Z.hw.max : 1));
  function cons(facing) {   // lo que se le pide a getUserMedia (camaraApp.arrancar y precalentar)
    const c = { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } };
    if (facing === "environment" && !no()) { const p = leerP(); if (p && p.id) c.deviceId = { exact: p.id }; }
    return c;
  }
  async function reintento(pedir, facing, e) {   // la principal anotada no abrió: se olvida y se vuelve a «la de atrás»
    const p = leerP();
    if (p && p.id && !no()) { ponerP(null); try { return await pedir({ facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } }); } catch (e2) { if (e2 && /NotAllowed|Security/i.test(e2.name)) throw e2; } }
    return pedir(true);
  }
  function digital() { return Z.hw ? Math.max(1, Z.z / Math.min(Z.z, Z.hw.max)) : Z.z; }
  function hwValor() { if (!Z.hw) return null; return Math.max(Z.hw.min, Math.min(Z.hw.max, Z.z)); }
  function aplicarHw() {   // de a un pedido por vez (applyConstraints tarda): el último valor gana
    const cam = Z.cam, t = cam && cam.track; if (!Z.hw || !t || !t.applyConstraints) return;
    Z.hwPend = hwValor(); if (Z.hwCorre) return;
    const correr = () => {
      if (Z.hwPend == null || !Z.cam || Z.cam.track !== t) { Z.hwCorre = false; return; }
      const v = Z.hwPend; Z.hwPend = null; Z.hwCorre = true;
      Promise.resolve().then(() => t.applyConstraints({ advanced: [{ zoom: v }] })).catch(() => { }).then(() => { Z.hwAplicado = v; correr(); });
    };
    correr();
  }
  function medirCaja() { const v = $("ecVideo"); if (!v) return null; Z.caja = { W: v.clientWidth, H: v.clientHeight }; return Z.caja; }
  function aplicarDigital() {
    const v = $("ecVideo"); if (!v) return;
    const d = digital(), esp = v.classList.contains("espejo");
    if (d > 1.001) { medirCaja(); v.style.transform = (esp ? "scaleX(-1) " : "") + "scale(" + d.toFixed(3) + ")"; }
    else v.style.transform = "";
  }
  function pintarBar() {
    const b = $("zmBar"); if (!b) return;
    const m = maxTot();
    b.querySelectorAll("[data-zm]").forEach((x) => { const n = +x.dataset.zm; x.hidden = n > m + 0.001; x.classList.toggle("on", Math.abs(Z.z - n) < 0.05); x.setAttribute("aria-pressed", Math.abs(Z.z - n) < 0.05 ? "true" : "false"); });
    const val = $("zmVal"); if (val) { const ex = [1, 2, 3].some((n) => Math.abs(Z.z - n) < 0.05); val.textContent = fmtZ(Z.z); val.hidden = ex; }
  }
  function ponerZoom(z, deDedo) {
    if (!Z.cam) return;
    Z.z = Math.max(1, Math.min(maxTot(), +z || 1));
    aplicarHw(); aplicarDigital(); pintarBar();
    if (!deDedo) ubicar();
    else { clearTimeout(Z.tUb); Z.tUb = setTimeout(ubicar, 120); }
  }
  const ubicar = () => intentar(() => window.camaraApp && window.camaraApp.ubicar && window.camaraApp.ubicar());
  // lo que se ve: la imagen (object-fit:contain) agrandada por el zoom digital, cortada por la pantalla → en px del video
  function vis(v) {
    if (no() || !Z.cam) return null;
    const d = digital(); if (d <= 1.001) return null;
    v = v || $("ecVideo"); if (!v || !v.videoWidth) return null;
    const c = Z.caja || medirCaja(); if (!c || !c.W || !c.H) return null;
    const vw = v.videoWidth, vh = v.videoHeight, kc = Math.min(c.W / vw, c.H / vh), cw = vw * kc * d, ch = vh * kc * d, cx = (c.W - cw) / 2, cy = (c.H - ch) / 2;
    const x0 = Math.max(0, cx), y0 = Math.max(0, cy), x1 = Math.min(c.W, cx + cw), y1 = Math.min(c.H, cy + ch);
    const s = kc * d;
    let sx = Math.round((x0 - cx) / s), sy = Math.round((y0 - cy) / s), sw = Math.round((x1 - x0) / s), sh = Math.round((y1 - y0) / s);
    sw = Math.max(2, Math.min(vw - sx, sw)); sh = Math.max(2, Math.min(vh - sy, sh));
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, cx: sx, cy: sy, cw: sw, ch: sh };
  }
  function recorte(v) { const r = vis(v); return r ? { x: r.cx, y: r.cy, w: r.cw, h: r.ch } : null; }
  function html() {
    if (no() || !v164()) return "";
    return '<div id="zmBar" class="zm-bar" role="group" aria-label="Zoom de la cámara"><button type="button" data-zm="3" aria-label="Zoom 3 veces" aria-pressed="false">3×</button><button type="button" data-zm="2" aria-label="Zoom 2 veces" aria-pressed="false">2×</button><button type="button" data-zm="1" class="on" aria-label="Sin zoom" aria-pressed="true">1×</button><span id="zmVal" class="zm-val" role="status" hidden></span></div>';
  }
  function arranco(cam, rearrancar) {
    if (no() || !cam || !cam.track) return;
    const t = cam.track, mismo = !!cam.deTibia && t.id === Z.trackId;
    Z.cam = cam; Z.caja = null;
    const caps = intentar(() => (t.getCapabilities ? t.getCapabilities() : {}), {}) || {};
    const zc = caps.zoom && typeof caps.zoom === "object" && +caps.zoom.max > +caps.zoom.min ? { min: +caps.zoom.min, max: +caps.zoom.max, step: +caps.zoom.step || 0.1 } : null;
    Z.hw = zc && zc.max >= 1.2 ? zc : null;
    if (!mismo || t.id !== Z.trackId) { Z.z = 1; if (Z.hw && Z.hw.min < 1) aplicarHw(); }   // otra cámara (no la tibia): vuelve a 1×
    else if (Z.z > 1) { aplicarDigital(); }
    Z.trackId = t.id;
    pintarBar(); if (Z.z > 1) ubicar();
    // la cámara principal de atrás (una vez por sesión de la app)
    if (cam.facing === "environment" && !Z.revisado && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      Z.revisado = true;
      navigator.mediaDevices.enumerateDevices().then((l) => {
        const p = elegirPrincipal(l); Z.elegida = p ? { id: p.deviceId, label: p.label } : null;
        if (!p) return;
        const yaId = intentar(() => (t.getSettings ? t.getSettings().deviceId : ""), "");
        ponerP({ id: p.deviceId, label: p.label, ts: Date.now() });
        if (yaId && yaId !== p.deviceId && !Z.cambiado && Z.cam === cam && cam.track === t && typeof rearrancar == "function") { Z.cambiado = true; rearrancar(); }
      }).catch(() => { });
    }
  }
  // botones, pellizco y ruedita (solo con la cámara abierta)
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("#emaCam [data-zm]"); if (!b || no()) return;
    e.preventDefault(); e.stopPropagation(); ponerZoom(+b.dataset.zm);
  }, true);
  const PS = new Map(); let pin = null;
  const fueraDeImagen = (t) => !!(t && t.closest && t.closest("button, input, textarea, select, a, label, #fnFila, #cbPanel, .vi-cols, .fn-otro, .ec-msg, #ecVista, .ec-abajo, .ec-arriba, .zm-bar, .vi-term, .vi-thumbs"));
  document.addEventListener("pointerdown", (e) => {
    if (no() || !Z.cam || !e.target || !e.target.closest || !e.target.closest("#emaCam") || fueraDeImagen(e.target)) return;
    PS.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (PS.size === 2) { const a = Array.from(PS.values()); pin = { d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1, z: Z.z }; }
  }, true);
  document.addEventListener("pointermove", (e) => {
    if (!PS.has(e.pointerId)) return;
    PS.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pin && PS.size >= 2) { const a = Array.from(PS.values()); const d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); ponerZoom(pin.z * d / pin.d, true); e.preventDefault(); }
  }, { capture: true, passive: false });
  const finP = (e) => { if (!PS.has(e.pointerId)) return; PS.delete(e.pointerId); if (PS.size < 2) { if (pin) { pin = null; ubicar(); } } };
  document.addEventListener("pointerup", finP, true); document.addEventListener("pointercancel", finP, true);
  document.addEventListener("wheel", (e) => {
    if (no() || !Z.cam || !e.target || !e.target.closest || !e.target.closest("#emaCam") || fueraDeImagen(e.target)) return;
    e.preventDefault(); ponerZoom(Z.z * (e.deltaY < 0 ? 1.15 : 0.87), true);
  }, { capture: true, passive: false });
  window.addEventListener("resize", () => { if (Z.cam && digital() > 1.001) { Z.caja = null; aplicarDigital(); } });
  // la cámara se cerró: se suelta (el valor queda para la tibia; si vuelve otra cámara, arranca en 1×)
  new MutationObserver(() => { if (Z.cam && !$("emaCam")) { Z.cam = null; Z.caja = null; PS.clear(); pin = null; } }).observe(document.body, { childList: true });

  window.__zmHtml = html;
  window.__zmCons = cons;
  window.__zmReintento = reintento;
  window.__zmArranco = arranco;
  window.__zmVis = (v) => vis(v);
  window.__zmRecorte = (v) => recorte(v);
  window.__zoomCam = { poner: ponerZoom, zoom: () => Z.z, digital, hw: () => (Z.hw ? Object.assign({}, Z.hw) : null), hwAplicado: () => Z.hwAplicado, recorte, vis, elegirPrincipal, principal: leerP, olvidar: () => ponerP(null), estado: () => ({ z: Z.z, digital: digital(), hw: Z.hw, trackId: Z.trackId, elegida: Z.elegida, cambiado: Z.cambiado, principal: leerP() }) };

  // =================================================================================================== B) GALERÍA
  const nivel = (h) => intentar(() => (window.PERMISOS ? PERMISOS.permiso(h) : "editar"), "ver");
  const puedeOf = () => !!window.__fbUser && !window.__modoEmergencia && (nivel("avance") === "editar" || nivel("registro") === "editar");
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const kAdj = (id) => String(id || "").replace(/[~*/[\].`]/g, "_");
  function plazaDeId(it) {
    if (it && it.plaza) return String(it.plaza);
    const k = kAdj(it && it.id);
    for (const o of ots()) { const f = o && o.campo && o.campo.fotos && o.campo.fotos[k]; if (f) return String(o.plazaId || ""); }
    return "";
  }
  // de cada foto: «of» (la oficina la puede borrar), «mia» (la cuadrilla: suya, de su orden abierta) o ""
  function borrable(it) {
    if (!it || !it.id) return "";
    const pl = plazaDeId(it);
    if (pl && puedeOf()) return "of";
    if (window.__fotoMia && intentar(() => window.__fotoMia(it.id), false)) return "mia";
    return "";
  }
  const esCrew = () => intentar(() => { const y = PERMISOS.yo(); return !!y && /^(cuadrilla|operario)$/.test(y.rol || ""); }, false) || intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  function resumenBorrar(items) {
    const r = { of: [], mia: [], no: [] };
    items.forEach((it) => { const b = borrable(it); (b === "of" ? r.of : b === "mia" ? r.mia : r.no).push(it); });
    r.n = r.of.length + r.mia.length;
    r.porQue = r.no.length ? (esCrew() ? r.no.length + (r.no.length === 1 ? " no es tuya" : " no son tuyas") + " (o ya se mandó la orden)" : r.no.length + " no se puede" + (r.no.length === 1 ? "" : "n") + " borrar con tu usuario") : "";
    return r;
  }
  const algunoBorra = () => puedeOf() || esCrew();
  async function borrarVarias(items) {
    const r = resumenBorrar(items), hechas = [], mal = [];
    for (const it of r.mia) { try { await window.__fotoSacarMia(it.id); hechas.push(it.id); } catch (e) { mal.push(it.id); } }
    const porPlaza = {};
    r.of.forEach((it) => { const p = plazaDeId(it); (porPlaza[p] = porPlaza[p] || []).push(it.id); });
    for (const p of Object.keys(porPlaza)) { try { await window.fotosBorrar(porPlaza[p], p); hechas.push.apply(hechas, porPlaza[p]); } catch (e) { mal.push.apply(mal, porPlaza[p]); } }
    hechas.forEach((id) => { intentar(() => window.__gpBorrada && window.__gpBorrada(id)); intentar(() => window.emaGaleria && window.emaGaleria.olvidar && window.emaGaleria.olvidar(id)); });
    intentar(() => typeof window.fbAuditar == "function" && hechas.length && window.fbAuditar("fotos", "Borró " + hechas.length + " foto(s) desde la galería (elegir varias)", { ids: hechas, v167: true }));
    return { hechas, mal, no: r.no.map((x) => x.id) };
  }
  // confirmación propia (no confirm()): «¿Borrar 3 fotos?»
  function confirmar(n, crew, porQue) {
    return new Promise((ok) => {
      const v = document.createElement("div"); v.className = "v7-ov zg-conf"; v.id = "zgConf"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true"); v.setAttribute("aria-label", "Borrar fotos");
      v.innerHTML = '<div class="v7-caja"><div class="v7-cab"><div><h3>¿Borrar ' + n + " foto" + (n === 1 ? "" : "s") + '?</h3><small>' + (crew ? "No van a contar ni las va a ver la oficina. Si hacía falta, sacá otra." : "Se sacan de la obra, del legajo y de la orden. No se puede deshacer.") + "</small></div>" +
        '<button type="button" class="v7-x" data-zgc="no" aria-label="Cerrar">✕</button></div>' + (porQue ? '<p class="zg-nota">' + esc(porQue) + ": esas quedan.</p>" : "") +
        '<div class="v7-acc"><button type="button" class="btn-ghost" data-zgc="no">Cancelar</button><button type="button" class="btn-primary zg-rojo" data-zgc="si">🗑 Sí, borrar ' + n + "</button></div></div>";
      document.body.appendChild(v);
      v.addEventListener("click", (e) => { const b = e.target.closest("[data-zgc]"); if (!b && e.target !== v) return; v.remove(); ok(!!(b && b.dataset.zgc === "si")); });
    });
  }
  // ----- enviar: con lo que está en este celu si no hay señal (la sellada de esta sesión o la de la bandeja v149b)
  const SELL = new Map();   // adjId → File sellado (las de esta sesión)
  (function () {
    const prev = window.__fotoSellada;
    window.__fotoSellada = function (f, meta) {
      try { prev && prev.apply(this, arguments); } catch (e) { }
      try { const id = meta && (meta.__adjId || meta.adjId); if (id && f) { SELL.set(String(id), f); if (SELL.size > 40) SELL.delete(SELL.keys().next().value); } } catch (e) { }
    };
  })();
  function localDe(id) {
    if (SELL.has(id)) return SELL.get(id);
    const b = window.__fotoBandeja;
    const r = b && b.lista ? intentar(() => b.lista().find((x) => x && (x.adjId === id || x.id === id) && x.f), null) : null;
    return r ? r.f : null;
  }
  const sinSenal = () => navigator.onLine === false || intentar(() => (window.__senalReal && window.__senalReal.motivo && /sinSenal/.test(window.__senalReal.motivo() || "")), false);
  function paraEnviar(items) {
    const urls = [];
    const l = items.map((it) => {
      if (!it.id && it.src) return Object.assign({}, it);
      const loc = it.id ? localDe(it.id) : null;
      if (loc && sinSenal()) { const u = URL.createObjectURL(loc); urls.push(u); return { id: "", src: u, mini: it.mini || "", titulo: it.titulo || "Foto", plaza: it.plaza || "", ts: loc.lastModified || Date.now() }; }
      const x = Object.assign({}, it); if (x.id) { delete x.src; delete x.cam; } return x;
    });
    setTimeout(() => urls.forEach((u) => intentar(() => URL.revokeObjectURL(u))), 120000);
    return l;
  }
  async function enviar(items, msg) {
    if (!items.length || !window.emaGaleria || !window.emaGaleria.accion) return;
    const l = paraEnviar(items);
    window.__zgUltEnvio = { n: l.length, ts: Date.now(), locales: l.filter((x) => !x.id).length };
    return window.emaGaleria.accion("compartir", l, msg);
  }

  // ----- la hoja «Elegir» (galería abierta sin lista de fondo)
  const G = { items: [], sel: new Set(), msgT: null };
  const puedeMover = (ids) => !!(window.__moverFoto && !window.__v152No && intentar(() => window.__moverFoto.puedeAlguna(), false) && ids.length && ids.every((i) => intentar(() => window.__moverFoto.puedeVer(i), false)));
  function elegidos() { return G.items.filter((it) => G.sel.has(it.k)); }
  function pintarHoja() {
    const v = $("zgOv"); if (!v) return;
    const n = G.sel.size, tot = G.items.length, el = elegidos(), r = resumenBorrar(el);
    const grid = G.items.map((it) => '<button type="button" class="zg-f' + (G.sel.has(it.k) ? " on" : "") + '" data-zgf="' + esc(it.k) + '" aria-pressed="' + (G.sel.has(it.k) ? "true" : "false") + '" aria-label="' + esc(it.titulo || "Foto") + '">' + (it.mini || it.src ? '<img alt="" src="' + esc(it.mini || it.src) + '">' : '<span class="zg-sin">📷</span>') + '<i aria-hidden="true"></i>' + (it.titulo ? "<small>" + esc(it.titulo) + "</small>" : "") + "</button>").join("");
    const borra = algunoBorra();
    const h = '<div class="v7-caja zg-caja"><div class="v7-cab"><div><h3>☑ Elegir fotos</h3><small id="zgN">' + (n ? "<b>" + n + "</b> elegida" + (n === 1 ? "" : "s") + " de " + tot : "Tocá las fotos para elegirlas") + "</small></div>" +
      '<button type="button" class="v7-x" data-zg="x" aria-label="Cerrar">✕</button></div>' +
      '<div class="zg-todas"><button type="button" class="chip" data-zg="todas">Elegir todas</button><button type="button" class="chip" data-zg="ninguna">Ninguna</button></div>' +
      '<div class="zg-grid">' + grid + "</div>" +
      '<div class="zg-pie"><div class="zg-msg" role="status" id="zgMsg"></div>' + (n && r.porQue && borra ? '<div class="zg-nota" id="zgNota">' + esc(r.porQue) + "</div>" : "") +
      '<div class="zg-acc"><button type="button" class="btn-primary" data-zg="enviar" ' + (n ? "" : "disabled") + ">📤 Enviar" + (n ? " (" + n + ")" : "") + "</button>" +
      (puedeMover(el.map((x) => x.id).filter(Boolean)) ? '<button type="button" class="btn-ghost" data-zg="mover">↔ Mover</button>' : "") +
      (borra ? '<button type="button" class="btn-ghost zg-borrar" data-zg="borrar" ' + (r.n ? "" : "disabled") + ">🗑 Borrar" + (r.n ? " (" + r.n + ")" : "") + "</button>" : "") + "</div></div></div>";
    const msg = $("zgMsg"), m0 = msg ? msg.textContent : "", mc = msg ? msg.className : "";
    v.innerHTML = h;
    if (m0) { const m = $("zgMsg"); m.textContent = m0; m.className = mc; }
  }
  function msgHoja(t, mal) {
    const m = $("zgMsg"); if (!m) return intentar(() => toastG(t, mal));
    m.textContent = t || ""; m.className = "zg-msg" + (mal ? " mal" : ""); clearTimeout(G.msgT); if (t) G.msgT = setTimeout(() => { const x = $("zgMsg"); x && (x.textContent = ""); }, mal ? 6000 : 4000);
  }
  function toastG(t, mal) {
    let m = $("gpToast"); if (!m) { m = document.createElement("div"); m.id = "gpToast"; m.className = "no-print"; m.setAttribute("role", "status"); document.body.appendChild(m); }
    m.textContent = t; m.classList.toggle("mal", !!mal); m.hidden = !t; clearTimeout(m._t); m._t = setTimeout(() => { m.hidden = true; }, mal ? 6000 : 3500);
  }
  function abrirHoja(items, idElegida) {
    if (no()) return false;
    cerrarHoja();
    G.items = (items || []).map((it, i) => Object.assign({}, it, { k: (it.id || "s") + "|" + i }));
    G.sel = new Set(G.items.filter((it) => idElegida && it.id === idElegida).map((it) => it.k));
    const v = document.createElement("div"); v.id = "zgOv"; v.className = "v7-ov no-print"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true"); v.setAttribute("aria-label", "Elegir fotos");
    document.body.appendChild(v); pintarHoja(); return true;
  }
  function cerrarHoja() { const v = $("zgOv"); v && v.remove(); }
  document.addEventListener("click", async (e) => {
    const v = $("zgOv"); if (!v || !e.target || !e.target.closest || !e.target.closest("#zgOv")) return;
    if (e.target === v) return cerrarHoja();
    const f = e.target.closest("[data-zgf]");
    if (f) { const k = f.dataset.zgf; G.sel.has(k) ? G.sel.delete(k) : G.sel.add(k); return pintarHoja(); }
    const b = e.target.closest("[data-zg]"); if (!b || b.disabled) return;
    const a = b.dataset.zg;
    if (a === "x") return cerrarHoja();
    if (a === "todas") { G.items.forEach((it) => G.sel.add(it.k)); return pintarHoja(); }
    if (a === "ninguna") { G.sel.clear(); return pintarHoja(); }
    const el = elegidos(); if (!el.length) return;
    if (a === "enviar") { return enviar(el, msgHoja); }
    if (a === "mover") { const ids = el.map((x) => x.id).filter(Boolean); cerrarHoja(); window.__moverFoto.abrir(ids, {}); return; }
    if (a === "borrar") {
      const r = resumenBorrar(el); if (!r.n) return msgHoja(r.porQue || "No se puede borrar.", true);
      if (!(await confirmar(r.n, !r.of.length, r.porQue))) return;
      msgHoja("Borrando…");
      const x = await borrarVarias(el);
      const fuera = new Set(x.hechas);
      G.items = G.items.filter((it) => !(it.id && fuera.has(it.id))); G.sel.forEach((k) => { if (!G.items.some((it) => it.k === k)) G.sel.delete(k); });
      if (!G.items.length) { cerrarHoja(); toastG("✓ " + x.hechas.length + " foto" + (x.hechas.length === 1 ? " borrada" : "s borradas") + "."); return; }
      pintarHoja();
      msgHoja(x.mal.length ? "⚠ " + x.mal.length + " no se pudieron borrar (revisá la señal)." : "✓ " + x.hechas.length + " foto" + (x.hechas.length === 1 ? " borrada" : "s borradas") + (x.no.length ? " · " + x.no.length + " quedan (no se podían)" : "") + ".", !!x.mal.length);
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("zgOv") && !$("zgConf")) cerrarHoja(); });

  // ----- la barra de elegir de galeriaPro (legajo, Mis tareas, cierre…): Enviar (N) y Borrar (N) también para la cuadrilla
  function barraBorrar(ids, plaza, n) {
    if (no()) return null;
    const items = ids.map((id) => ({ id, plaza }));
    if (!algunoBorra()) return "";
    const r = resumenBorrar(items);
    if (!r.n && !esCrew() && !(plaza && puedeOf())) return "";
    return '<button type="button" class="gpb-borrar" data-gpb="borrar" ' + (r.n ? "" : "disabled") + ' title="' + esc(r.porQue) + '">🗑<span>Borrar' + (r.n ? " (" + r.n + ")" : "") + "</span>" + (r.porQue && n ? '<em class="zg-bn">' + esc(r.porQue.replace(/ \(o ya se mandó la orden\)/, "")) + "</em>" : "") + "</button>";
  }
  async function barraBorrarClic(items, salir) {
    if (no()) return false;
    const r = resumenBorrar(items); if (!r.n) { toastG(r.porQue || "No se puede borrar.", true); return true; }
    if (!(await confirmar(r.n, !r.of.length, r.porQue))) return true;
    toastG("Borrando…");
    const x = await borrarVarias(items);
    toastG(x.mal.length ? "⚠ " + x.mal.length + " no se pudieron borrar (revisá la señal)." : "✓ Se borraron " + x.hechas.length + " foto" + (x.hechas.length === 1 ? "" : "s") + (x.no.length ? " · " + x.no.length + " quedan (no se podían)" : "") + ".", !!x.mal.length);
    if (!x.mal.length) intentar(salir);
    return true;
  }
  window.__zgBarraBorrar = barraBorrar;
  window.__zgBarraBorrarClic = barraBorrarClic;
  window.__zgEnviar = (items, msg) => (no() ? null : enviar(items, msg));
  window.__zgVisorElegir = (items) => !no() && !!items && items.length >= 1;
  window.__zgElegirItems = abrirHoja;
  window.__zoomGaleria = { abrir: abrirHoja, cerrar: cerrarHoja, elegidas: () => elegidos().map((x) => x.id), borrable, resumenBorrar, borrarVarias, enviar, paraEnviar, localDe, SELL, zoom: window.__zoomCam };
})();
