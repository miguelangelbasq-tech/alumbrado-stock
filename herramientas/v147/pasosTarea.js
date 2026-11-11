(function () {
  "use strict";
  // v147 · El PASO A PASO de cada tarea llega a la cuadrilla en el celu (pedido de Ángel, 11/11/2026).
  //  · De dónde salen: la copia guardada en la orden al emitir (ot.pasos{tarea: texto}, la versión que se dio) o, si no hay,
  //    el catálogo (ACTIVIDADES_CATALOGO[].pasos, con lo editado en Producción: configEquipo/baremo.pasos y tareasPropias).
  //    Anda sin señal (está en el código y en la base local).
  //  · Hoja «📋 Cómo se hace» (#pstHoja, .v7-ov): un paso por pantalla (número y letra grande, deslizar o ‹ ›), y abajo la lámina de
  //    la guía (guias/pasos/<guía>_pN.webp, la misma de «Ayuda») si la tarea tiene. «🔊 Escuchar los pasos»: la voz del celu
  //    (TextToSpeech de la app 1.4 o speechSynthesis es-AR; gratis), paso por paso, con «Parar».
  //  · Dónde: Modo obra (debajo del botón grande), «La orden del día» (ver pasos en cada tarea), «Ayuda» (primero los pasos),
  //    Mis tareas clásica (en la cabecera de cada tarjeta + «📄 Ver la orden completa» = la hoja que se imprime).
  //  · Avisos de orden nueva y recordatorio de las 7: «Tocá para ver la orden y los pasos» y abren la orden (?ot=<id>).
  //  · Al emitir, la orden guarda la copia de los pasos de cada tarea (ot.pasos).
  //  · Borrador de los pasos que faltan (28 tareas): Producción › «Cuánto vale cada tarea» › «Revisar borrador», marcado
  //    «a confirmar»; «Guardar» con «Sí» los pasa a configEquipo/baremo.pasos. Hasta entonces la cuadrilla no los ve.
  //  · Pruebas viejas: window.__v147No (salvo v147:true en h.js).
  if (window.__pasosTarea) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const intentar = (f, d) => { try { const r = f(); return r === undefined ? d : r; } catch (e) { return d; } };
  const arr = (x) => (Array.isArray(x) ? x : []);
  const no = () => !!window.__v147No;
/*BORRADOR*/
  const catalogo = () => intentar(() => (typeof ACTIVIDADES_CATALOGO !== "undefined" ? ACTIVIDADES_CATALOGO : []), []) || [];
  const tareaCat = (k) => catalogo().find((a) => a && a.id === k) || null;
  function textoDe(k, ot) {
    k = String(k || "");
    if (ot && ot.pasos && typeof ot.pasos[k] == "string" && ot.pasos[k].trim()) return ot.pasos[k];
    if (/^m:/.test(k) && ot) { const m = arr(ot.actividadesManuales).find((x) => "m:" + String(x.actividad || "").trim() === k); return (m && m.pasos) || ""; }
    const a = tareaCat(k); return (a && a.pasos) || "";
  }
  function lista(k, ot) {   // «1) …» por renglón; lo que no empieza con número sigue al paso anterior
    const l = [];
    String(textoDe(k, ot) || "").split("\n").map((x) => x.trim()).filter(Boolean).forEach((x) => {
      if (/^\d+[a-z]?[).-]\s*/.test(x) || !l.length) l.push(x.replace(/^\d+[a-z]?[).-]\s*/, "")); else l[l.length - 1] += " " + x;
    });
    return l;
  }
  const labelDe = (k, ot) => { const a = tareaCat(k); if (a) return a.label; if (/^m:/.test(k)) return k.slice(2); return k; };

  // ------------------------------------------------------------------------------------------- guía con dibujos (sin señal: lo que quedó guardado)
  function guiaDe(k, label) {
    const G = intentar(() => window.__cuadrillaDia.GUIA_DE, null) || [];
    const t = String(k + " " + (label || "")).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const r = G.find((x) => x[0].test(t)); if (!r) return null;
    const ind = intentar(() => JSON.parse(localStorage.getItem("ema.guias.indice") || "null"), null);
    const p = ind && ind.pasos && ind.pasos[r[1]];
    return { g: r[1], hojas: (p && p.hojas) || 0, titulo: (p && p.titulo) || "" };
  }
  const raiz = () => { try { if (window.__cargador && window.__cargador.url) return String(window.__cargador.url).replace(/[^/]*$/, ""); } catch (e) { } try { return new URL("./", location.href).href; } catch (e) { return ""; } };

  // ------------------------------------------------------------------------------------------- voz del celu (gratis)
  const VZ = { on: false, tk: 0 };
  function plugTTS() { return intentar(() => (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech) || null, null); }
  function decir(t) {
    const P = plugTTS();
    if (P && P.speak) return Promise.resolve(P.speak({ text: t, lang: "es-AR", rate: 0.95 })).catch(() => { });
    const S = window.speechSynthesis; if (!S || typeof window.SpeechSynthesisUtterance != "function") return Promise.reject(new Error("sin voz"));
    return new Promise((ok) => {
      const u = new window.SpeechSynthesisUtterance(t); u.lang = "es-AR"; u.rate = 0.95;
      const v = intentar(() => S.getVoices().find((x) => /^es[-_]AR/i.test(x.lang)) || S.getVoices().find((x) => /^es/i.test(x.lang)), null); if (v) u.voice = v;
      u.onend = u.onerror = () => ok(); S.speak(u);
      setTimeout(ok, 2000 + t.length * 120);   // por si el navegador no avisa el final
    });
  }
  function parar() { VZ.on = false; VZ.tk++; intentar(() => { const P = plugTTS(); if (P && P.stop) P.stop(); }, null); intentar(() => window.speechSynthesis && window.speechSynthesis.cancel(), null); pintarHoja(); }
  async function escuchar() {
    if (VZ.on) return parar();
    const H = st.h; if (!H) return;
    VZ.on = true; const tk = ++VZ.tk; pintarHoja();
    try {
      await decir("Cómo se hace: " + H.label + ".");
      for (let i = H.n; i < H.l.length; i++) {
        if (tk !== VZ.tk) return;
        H.n = i; pintarHoja();
        await decir("Paso " + (i + 1) + ". " + H.l[i]);
      }
    } catch (e) { msg("Este celu no tiene voz para leer en voz alta."); }
    if (tk === VZ.tk) { VZ.on = false; pintarHoja(); }
  }

  // ------------------------------------------------------------------------------------------- la hoja «Cómo se hace»
  const st = { h: null };
  function abrir(k, ot, label) {
    const l = lista(k, ot);
    st.h = { k: String(k), ot, label: label || labelDe(k, ot), l, n: 0, guia: guiaDe(k, label || labelDe(k, ot)), msg: "" };
    let h = $("pstHoja");
    if (!h) { h = document.createElement("div"); h.id = "pstHoja"; h.className = "v7-ov no-print"; h.setAttribute("role", "dialog"); h.setAttribute("aria-modal", "true"); h.setAttribute("aria-label", "Cómo se hace"); document.body.appendChild(h); engancharDedo(h); }
    pintarHoja();
    setTimeout(() => { try { window.__atras && window.__atras.sync && window.__atras.sync(); } catch (e) { } }, 30);
  }
  function cerrar() { parar(); const h = $("pstHoja"); h && h.remove(); st.h = null; }
  function msg(t) { if (st.h) { st.h.msg = t; pintarHoja(); } }
  function pintarHoja() {
    const h = $("pstHoja"), H = st.h; if (!h || !H) return;
    const tot = H.l.length, n = Math.min(H.n, Math.max(0, tot - 1));
    const g = H.guia, hj = g && g.hojas ? Math.min(g.hojas, Math.max(1, Math.round(((n + 1) / Math.max(1, tot)) * g.hojas))) : 0;
    const img = g ? `<div class="pst-guia"><div class="pst-geti">Con dibujos · ${esc(g.titulo ? g.titulo.split(":")[0] : "guía de la tarea")}</div><img alt="Dibujo del paso" src="${esc(raiz() + "guias/pasos/" + g.g + (hj ? "_p" + hj : "_tapa") + ".webp")}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div class="pst-sinsenal" style="display:none">📶 Sin señal: el dibujo se ve cuando vuelva. Los pasos están igual.</div></div>` : "";
    h.innerHTML = `<div class="v7-caja pst-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>📋 Cómo se hace</h3><small>${esc(H.label)}</small></div><button type="button" class="v7-x" data-pst="x" aria-label="Cerrar">✕</button></div>
${tot ? `<div class="pst-paso" data-pst-n="${n}"><div class="pst-num">Paso <b>${n + 1}</b> de ${tot}</div><div class="pst-tx">${esc(H.l[n])}</div></div>
<div class="pst-nav"><button type="button" class="btn-ghost pst-fl" data-pst="ant" aria-label="Paso anterior"${n <= 0 ? " disabled" : ""}>‹</button><div class="pst-dots">${H.l.map((x, i) => `<button type="button" class="${i === n ? "on" : i < n ? "h" : ""}" data-pst="ir:${i}" aria-label="Paso ${i + 1}"></button>`).join("")}</div><button type="button" class="btn-ghost pst-fl" data-pst="sig" aria-label="Paso siguiente"${n >= tot - 1 ? " disabled" : ""}>›</button></div>
<button type="button" class="${VZ.on ? "btn-ghost" : "btn-primary"} pst-oir" data-pst="oir">${VZ.on ? "■ Parar" : "🔊 Escuchar los pasos"}</button>` : `<div class="pst-vacio">Esta tarea todavía no tiene los pasos cargados. Preguntale a la oficina o mirá la guía con dibujos.</div>`}
${H.msg ? `<div class="pst-msg">${esc(H.msg)}</div>` : ""}${img}</div>`;
  }
  function engancharDedo(h) {
    let x0 = null, y0 = 0;
    h.addEventListener("pointerdown", (e) => { if (e.target.closest && e.target.closest(".pst-paso")) { x0 = e.clientX; y0 = e.clientY; } }, true);
    h.addEventListener("pointerup", (e) => {
      if (x0 == null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) mover(dx < 0 ? 1 : -1);
    }, true);
    h.addEventListener("click", (e) => {
      if (e.target === h) return cerrar();
      const b = e.target.closest && e.target.closest("[data-pst]"); if (!b) return;
      const v = b.getAttribute("data-pst");
      if (v === "x") return cerrar();
      if (v === "ant") return mover(-1);
      if (v === "sig") return mover(1);
      if (v === "oir") return escuchar();
      if (/^ir:/.test(v) && st.h) { st.h.n = +v.slice(3); if (VZ.on) parar(); else pintarHoja(); }
    });
  }
  function mover(d) { const H = st.h; if (!H) return; const n = Math.max(0, Math.min(H.l.length - 1, H.n + d)); if (n === H.n) return; H.n = n; if (VZ.on) parar(); else pintarHoja(); }

  // ------------------------------------------------------------------------------------------- ganchos en las pantallas de la cuadrilla
  const attrs = (o, k, lab) => `data-pstabrir="${esc(k)}" data-pstot="${esc((o && o.id) || "")}" data-pstlab="${esc(lab || "")}"`;
  function tareaDe(o, p) { if (p && p.k) return p; const a = o && arr(o.actividades)[0]; return a ? { k: a, label: labelDe(a, o) } : null; }
  function botonObra(o, p) {   // Modo obra: debajo del botón grande
    if (no()) return ""; const t = tareaDe(o, p); if (!t) return "";
    return `<div class="pst-obra"><button type="button" class="btn-ghost pst-b" ${attrs(o, t.k, t.label)}>📋 Cómo se hace</button></div>`;
  }
  function linkFila(o, p) { if (no() || !p || !p.k) return ""; return `<button type="button" class="pst-link" ${attrs(o, p.k, p.label)}>📋 ver pasos</button>`; }
  function opAyuda(o, p) {
    if (no()) return ""; const t = tareaDe(o, p); if (!t) return "";
    return `<button type="button" class="cd-op" ${attrs(o, t.k, t.label)} data-pstcerrar="cdHoja"><span class="cd-opi t" style="font-size:20px">📋</span><span><b>Ver los pasos de esta tarea</b><small>Uno por pantalla · también te los lee en voz alta</small></span></button>`;
  }
  const otDe = (id) => intentar(() => (typeof ordenesTrabajo !== "undefined" ? ordenesTrabajo : window.ordenesTrabajo || []).find((x) => String(x.id) === String(id)), null);
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-pstabrir]"); if (b) {
      e.preventDefault(); e.stopPropagation();
      if (b.getAttribute("data-pstcerrar")) intentar(() => window.__cuadrillaDia.cerrarHoja(), null);
      abrir(b.getAttribute("data-pstabrir"), otDe(b.getAttribute("data-pstot")), b.getAttribute("data-pstlab"));
      return;
    }
    const c = e.target && e.target.closest && e.target.closest("[data-pstorden]"); if (c) { e.preventDefault(); e.stopPropagation(); ordenCompleta(c.getAttribute("data-pstorden")); }
  }, true);
  function ordenCompleta(id) {
    const o = otDe(id); if (!o) return;
    intentar(() => window.abrirHojaImpresion("Orden de trabajo " + (o.numero || ""), window.cuerpoOrdenTrabajoHtml(o, { pantalla: false })), null);
  }
  // Mis tareas clásica: «ver pasos» en la cabecera de cada tarjeta y «Ver la orden completa» (dentro de las plantillas)
  function envolverMt() {
    const c = window.__mtTareaCab;
    if (typeof c == "function" && !c.__pst) { const n = function (o, p) { const r = c.apply(this, arguments) || ""; return no() ? r : r + `<div class="pst-mtcab no-print">${linkFila(o, p)}</div>`; }; window.__heredar && window.__heredar(n, c); n.__pst = 1; window.__mtTareaCab = n; }
    const l = window.__mtComoLlegar;
    if (typeof l == "function" && !l.__pst) { const n = function (ot, chico) { const r = l.apply(this, arguments) || ""; return no() || !ot ? r : r + `<button type="button" class="btn-ghost pst-orden no-print" data-pstorden="${esc(ot.id)}">📄 Ver la orden completa</button>`; }; window.__heredar && window.__heredar(n, l); n.__pst = 1; window.__mtComoLlegar = n; }
  }

  // ------------------------------------------------------------------------------------------- al emitir: la copia de los pasos en la orden
  function copiaPasos(o) {
    const out = {}; let tam = 0;
    arr(o.actividades).forEach((k) => { const t = textoDe(k, null); if (t && tam + t.length < 60000) { out[k] = t; tam += t.length; } });
    return out;
  }
  function envolverAdd() {
    const f = window.fbOtAdd; if (typeof f != "function" || f.__pst) return;
    const n = function (o) { try { if (!no() && o && typeof o == "object" && !o.pasos) { const p = copiaPasos(o); if (Object.keys(p).length) o.pasos = p; } } catch (e) { } return f.apply(this, arguments); };
    window.__heredar && window.__heredar(n, f); n.__pst = 1; window.fbOtAdd = n;
  }

  // ------------------------------------------------------------------------------------------- el aviso abre la orden (?ot=<id>)
  let pend = null;
  try { const q = new URLSearchParams(location.search); if (q.get("ot")) { pend = q.get("ot"); sessionStorage.setItem("ema.ot.pend", pend); q.delete("ot"); history.replaceState(history.state, "", location.pathname + (q.toString() ? "?" + q : "") + location.hash); } else pend = sessionStorage.getItem("ema.ot.pend"); } catch (e) { }
  function abrirPend(id) {
    id = id || pend; if (!id || no()) return false;
    const o = otDe(id); if (!o) return false;
    pend = null; try { sessionStorage.removeItem("ema.ot.pend"); } catch (e) { }
    const crew = intentar(() => window.__v135.esCrew(), false);
    if (crew && intentar(() => window.__cdOn && window.__cdOn(), false) && window.__cuadrillaDia) { intentar(() => window.mostrarVista("inicio"), null); window.__cuadrillaDia.elegirOt && window.__cuadrillaDia.elegirOt(o.id); window.__cuadrillaDia.ir("orden"); }
    else if (crew) intentar(() => window.mostrarVista("mistareas"), null);
    else intentar(() => window.verOrdenTrabajo(o.id), null);
    return true;
  }
  // la campanita (aviso de orden nueva → «mistareas»): para la cuadrilla nueva, la orden en «Hoy»
  function irOrden(otId) {
    if (no() || !window.__cuadrillaDia || !intentar(() => window.__cdOn && window.__cdOn(), false)) return false;
    intentar(() => window.mostrarVista("inicio"), null);
    if (otId && window.__cuadrillaDia.elegirOt) window.__cuadrillaDia.elegirOt(otId);
    window.__cuadrillaDia.ir("orden"); return true;
  }
  function probarPend() { if (!pend) return; let n = 0; const t = setInterval(() => { if (abrirPend() || ++n > 40) clearInterval(t); }, 500); }

  // ------------------------------------------------------------------------------------------- Producción: el borrador para que Ángel lo revise
  const puedeProd = () => !no() && intentar(() => PERMISOS.permiso("produccion") === "editar", false);
  const faltan = () => Object.keys(BORRADOR).filter((k) => tareaCat(k) && !String(tareaCat(k).pasos || "").trim());
  function tarjetaBorrador() {
    const body = $("baremoBody"); if (!body || !puedeProd()) { const v = $("pbCard"); v && v.remove(); return; }
    let c = $("pbCard"); const card = body.closest(".card"); if (!card) return;
    if (!c) { c = document.createElement("div"); c.id = "pbCard"; c.className = "pb-card no-print"; card.appendChild(c); }
    const n = faltan().length;
    c.innerHTML = n ? `<div class="pb-tx"><b>📋 ${n} ${n === 1 ? "tarea no tiene" : "tareas no tienen"} el paso a paso</b><small>Hay un borrador armado con las guías y los planos de la app, marcado «a confirmar». La cuadrilla no lo ve hasta que lo guardes.</small></div><button type="button" class="btn-ghost" data-pb="abrir">Revisar borrador</button>` : `<div class="pb-tx"><b>📋 Todas las tareas tienen su paso a paso</b></div>`;
  }
  const sel = {};
  function hojaBorrador(conf) {
    let h = $("pbHoja"); if (!h) { h = document.createElement("div"); h.id = "pbHoja"; h.className = "v7-ov no-print"; h.setAttribute("role", "dialog"); h.setAttribute("aria-modal", "true"); h.setAttribute("aria-label", "Borrador de los pasos"); document.body.appendChild(h); }
    const l = faltan(); l.forEach((k) => { if (sel[k] === undefined) sel[k] = true; });
    const nSel = l.filter((k) => sel[k]).length;
    h.innerHTML = `<div class="v7-caja pb-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>📋 Borrador de los pasos</h3><small>${l.length} tareas · <span class="pb-ac">a confirmar</span> · revisalo y corregilo después en «✏ Editar» de cada tarea</small></div><button type="button" class="v7-x" data-pb="x" aria-label="Cerrar">✕</button></div>
<div class="pb-lista">${l.map((k) => `<label class="pb-t"><input type="checkbox" data-pbk="${esc(k)}"${sel[k] ? " checked" : ""}><span><b>${esc(tareaCat(k).label)}</b> <em class="pb-ac">a confirmar</em><ol>${String(BORRADOR[k]).split("\n").map((x) => `<li>${esc(x.replace(/^\d+\)\s*/, "")).replace(/a confirmar/g, '<mark>a confirmar</mark>')}</li>`).join("")}</ol></span></label>`).join("")}</div>
${conf ? `<div class="pb-conf"><b>¿Guardo los pasos de ${nSel} ${nSel === 1 ? "tarea" : "tareas"} para todo el equipo?</b><small>Desde ahí la cuadrilla los ve en el celu. Se pueden corregir después.</small><div class="v7-acc"><button type="button" class="btn-primary" data-pb="si">Sí, guardar</button><button type="button" class="btn-ghost" data-pb="no">No</button></div></div>` : `<div class="v7-acc pb-pie"><button type="button" class="btn-primary" data-pb="guardar"${nSel ? "" : " disabled"}>Guardar ${nSel} ${nSel === 1 ? "tarea" : "tareas"}</button><button type="button" class="btn-ghost" data-pb="x">Cerrar</button></div>`}
<div class="pb-msg" id="pbMsg"></div></div>`;
  }
  async function guardarBorrador(ks) {
    const p = {}; (ks || faltan().filter((k) => sel[k])).forEach((k) => { if (BORRADOR[k]) p[k] = BORRADOR[k]; });
    if (!Object.keys(p).length) return 0;
    await window.fbBaremoGuardar({ pasos: p, ts: Date.now(), usuario: (window.__fbUser || {}).email || "" });
    Object.keys(p).forEach((k) => { const a = tareaCat(k); a && (a.pasos = p[k]); });
    window.__pasosEdit = Object.assign({}, window.__pasosEdit || {}, p);
    window.__baremoNube = Object.assign({}, window.__baremoNube || {}, { pasos: Object.assign({}, (window.__baremoNube || {}).pasos || {}, p) });
    intentar(() => window.__auditar && window.__auditar("baremo_pasos_borrador", Object.keys(p).join(", ")), null);
    return Object.keys(p).length;
  }
  document.addEventListener("click", async (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-pb]"); if (!b) return;
    const v = b.getAttribute("data-pb");
    if (v === "abrir") return hojaBorrador(false);
    if (v === "x") { const h = $("pbHoja"); h && h.remove(); return; }
    if (v === "guardar") return hojaBorrador(true);
    if (v === "no") return hojaBorrador(false);
    if (v === "si") {
      b.disabled = true; const m = $("pbMsg");
      try { const n = await guardarBorrador(); const h = $("pbHoja"); h && h.remove(); tarjetaBorrador(); const bm = $("baremoMsg"); bm && (bm.style.color = "var(--verde)", bm.textContent = "✅ Listo: se guardaron los pasos de " + n + " tareas. La cuadrilla ya los ve."); }
      catch (er) { m && (m.textContent = "⚠ No se pudo guardar: " + ((er && er.message) || "probá de nuevo") + "."); b.disabled = false; }
    }
  });
  document.addEventListener("change", (e) => { const c = e.target && e.target.closest && e.target.closest("[data-pbk]"); if (c) { sel[c.getAttribute("data-pbk")] = c.checked; hojaBorrador(false); } });

  // ------------------------------------------------------------------------------------------- arranque
  function enganchar() { envolverMt(); envolverAdd(); }
  enganchar(); window.addEventListener("load", () => { enganchar(); setTimeout(enganchar, 3000); probarPend(); });
  document.addEventListener("permisos-listos", () => { probarPend(); tarjetaBorrador(); });
  const mv = window.mostrarVista;
  if (typeof mv == "function") { const n = function (v) { const r = mv.apply(this, arguments); if (v === "produccion") setTimeout(tarjetaBorrador, 50); return r; }; window.__heredar && window.__heredar(n, mv); window.mostrarVista = n; }
  window.__pasosTarea = { textoDe, lista, abrir, cerrar, escuchar, parar, botonObra, linkFila, opAyuda, ordenCompleta, copiaPasos, abrirPend, irOrden, BORRADOR, faltan, tarjetaBorrador, hojaBorrador, guardarBorrador, estado: () => ({ abierta: !!st.h, k: st.h && st.h.k, n: st.h && st.h.n, total: st.h && st.h.l.length, voz: VZ.on }) };
})();
