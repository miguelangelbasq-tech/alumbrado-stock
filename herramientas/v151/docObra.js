(function () {
  "use strict";
  // v151 · «📄 Falta documentación» y «✅ Terminadas» (Ángel, 13/11/2026: «el tablero de avance de obras y el de obras y legajos:
  // tendríamos que agregar dos subíndices, uno de "le falta documentación" y otro de las que ya están terminadas»).
  //  · Documentación completa = las 4: (1) fecha de la carpeta EPEC (avanceObras.carpetaEpec), (2) conforme a obra cerrado
  //    (avanceObras.coCierre.cerrado, de Avance de obra), (3) planilla de PAT y (4) certificado de instalación apta
  //    (avanceObras.documentos.{pat, cert} {ok, fecha, adjId?, tipoArch, papel?, nota, por, porNombre, ts, hist[]}).
  //  · Terminada = el % que ya muestra la app (calcularAvanceEtapasPct: el itemizado, o las etapas si no hay itemizado) al 100 %.
  //  · Falta documentación = obras terminadas o con avance ≥ DESDE_PCT (1 %, a confirmar con Ángel) a las que les falta alguno.
  //  · Todo de memoria (avanceObras ya está cargado): sin lecturas nuevas. Lo único que se escribe es documentos.<pat|cert>
  //    (fbAvanceCampos: lo puede quien edita Avance o Registrar obra, sin reglas nuevas) y el archivo por fbAdjuntoGuardar
  //    (foto → Cloudflare R2 por fotosNube; PDF chico como los remitos). Nada se borra: reemplazar deja el anterior en hist[].
  // Pruebas viejas: __v151No (lo pone el arnés salvo v151:true).
  if (window.__docObra) return;
  var DESDE_PCT = 1;   // a confirmar con Ángel: desde qué % de avance se reclama la documentación (window.__docDesdePct lo cambia)
  var PDF_MAX = 650 * 1024;   // como los remitos (v138): un PDF entra en un documento de la base si pesa hasta ≈ 650 KB
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const arr = (x) => (Array.isArray(x) ? x : []);
  const num = (v) => { const x = parseFloat(v); return isFinite(x) ? x : 0; };
  const intentar = (fn, def) => { try { return fn(); } catch (e) { return def; } };
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const hoyISO = () => iso(new Date());
  const fLarga = (f) => { const p = String(f || "").slice(0, 10).split("-"); return p.length === 3 && p[0].length === 4 ? p[2] + "/" + p[1] + "/" + p[0] : String(f || ""); };
  const fTs = (ts) => { const d = new Date(ts); return isNaN(d) ? "" : fLarga(iso(d)); };
  const off = () => !!window.__v151No;
  const permiso = (h) => intentar(() => (window.PERMISOS && PERMISOS.permiso ? PERMISOS.permiso(h) : typeof window.permiso == "function" ? window.permiso(h) : "oculto"), "oculto");
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  const yoMail = () => String((window.__fbUser || {}).email || "");
  const yoNombre = () => intentar(() => { const y = PERMISOS.yo() || {}; return y.nombre || y.persona || y.usuario || yoMail().split("@")[0]; }, yoMail());
  const puedeCargar = () => !off() && !!window.__fbUser && !window.__modoEmergencia && !esCrew() && ["avance", "registro"].some((h) => permiso(h) === "editar");
  const veAvance = () => ["ver", "editar"].indexOf(permiso("avance")) >= 0;
  const visibles = () => intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []);
  const ocultas = () => arr(window.avanceObrasOcultas).filter((o) => o && !visibles().some((v) => String(v.id) === String(o.id)));
  const todas = () => visibles().concat(ocultas());
  const obraDe = (id) => todas().find((o) => o && String(o.id) === String(id)) || null;
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const nombreObra = (o) => { const n = String((o && (o.nombre || o.plazaNombre)) || "(sin nombre)"); return intentar(() => (window.__fmtNombre ? window.__fmtNombre.obra(n) : n.toUpperCase()), n.toUpperCase()); };
  const ICO = { plaza: "🌳", barrio: "🏘", otro: "📍" };
  const desdePct = () => (isFinite(+window.__docDesdePct) && window.__docDesdePct !== null && window.__docDesdePct !== "" ? +window.__docDesdePct : DESDE_PCT);

  // ============================================================== la cuenta (de memoria)
  const DOCS = [
    { k: "carpeta", ico: "📁", t: "Carpeta EPEC", corto: "Carpeta EPEC" },
    { k: "conforme", ico: "📋", t: "Conforme a obra", corto: "Conforme a obra" },
    { k: "pat", ico: "⚡", t: "Planilla de PAT", corto: "PAT", sub: true },
    { k: "cert", ico: "📜", t: "Certificado de instalación apta", corto: "Certificado", sub: true }
  ];
  const DOC = {}; DOCS.forEach((d) => { DOC[d.k] = d; });
  function pct(o) { return intentar(() => Math.round(num(window.calcularAvanceEtapasPct(o))), 0); }
  function estado(o) {
    o = o || {};
    const co = obj(o.coCierre), docs = obj(o.documentos), r = {};
    r.carpeta = { ok: !!o.carpetaEpec, fecha: o.carpetaEpec || "" };
    r.conforme = { ok: !!co.cerrado, fecha: co.cerrado ? co.fecha || "" : "", por: co.usuario || "" };
    ["pat", "cert"].forEach((k) => { const d = obj(docs[k]); r[k] = Object.assign({}, d, { ok: d.ok === true }); });
    r.falta = DOCS.filter((d) => !r[d.k].ok).map((d) => d.k);
    r.listos = DOCS.length - r.falta.length;
    r.completa = !r.falta.length;
    return r;
  }
  // cuándo llegó al 100 %: el último cierre de orden que movió el avance de la obra (si no hay, no se inventa)
  function fecha100(o) {
    let m = null;
    ots().forEach((t) => {
      if (!t || String(t.plazaId || "") !== String(o.id) || t.estado === "Anulada") return;
      const c = obj(t.cierre); if (c.avanceRevertido || !arr(c.avanceItems).some((x) => x && num(x.delta) > 0)) return;
      const f = String(c.fecha || t.fecha || "").slice(0, 10); if (!f) return;
      if (!m || f > m.fecha) m = { fecha: f, numero: t.numero || "", otId: t.id };
    });
    return m;
  }
  function terminada(o) { return pct(o) >= 100; }
  function faltaDoc(o, E) { E = E || estado(o); const p = pct(o); return !E.completa && (p >= 100 || p >= desdePct()); }
  function lista(modo, tipo) {
    const l = todas().filter((o) => o && (modo === "term100" ? terminada(o) : modo === "faltadoc" ? faltaDoc(o) : true)).filter((o) => !tipo || tipo === "todas" || (o.tipoObra || "plaza") === tipo);
    const cmp = (a, b) => String(nombreObra(a)).localeCompare(String(nombreObra(b)), "es");
    if (modo === "faltadoc") return l.sort((a, b) => pct(b) - pct(a) || estado(b).falta.length - estado(a).falta.length || cmp(a, b));
    if (modo === "term100") return l.sort((a, b) => { const fa = (fecha100(a) || {}).fecha || "", fb = (fecha100(b) || {}).fecha || ""; return fb.localeCompare(fa) || cmp(a, b); });
    return l.sort(cmp);
  }
  function cuentas(tipo) { return { faltadoc: lista("faltadoc", tipo).length, term100: lista("term100", tipo).length }; }

  // ============================================================== piezas de HTML
  const chipsFalta = (E) => E.falta.map((k) => `<span class="dc-chip no">${DOC[k].ico} ${esc(DOC[k].corto)}</span>`).join("");
  function lineaDoc(E) { return E.completa ? '<span class="dc-ok">✅ Documentación completa</span>' : `<span class="dc-warn">⚠ Falta: ${E.falta.map((k) => esc(DOC[k].corto)).join(" · ")}</span>`; }
  function lineaFecha(o) { const f = fecha100(o); return f ? `llegó al 100 % el ${esc(fLarga(f.fecha))}${f.numero ? ' <span class="dc-nw">(' + esc(f.numero) + ")</span>" : ""}` : "fecha del 100 %: sin dato (avance cargado a mano)"; }
  function tarjeta(o, modo, enLegajo) {
    const E = estado(o), p = pct(o), tipo = o.tipoObra || "plaza", oc = o.oculta === true;
    const cab = `<div class="n">${o.obraId ? "ID " + esc(o.obraId) : "Sin ID"}${o.barrio ? " · " + esc(intentar(() => window.__fmtNombre.barrio(o.barrio), o.barrio)) : ""}${oc ? " · 🗄 archivada" : ""}</div><div class="t">${ICO[tipo] || "🌳"} ${esc(nombreObra(o))}</div>`;
    const cuerpo = modo === "term100"
      ? `<div class="dc-l">✅ <b>100 %</b> · ${lineaFecha(o)}</div><div class="dc-l">${lineaDoc(E)}</div>`
      : `<div class="dc-l"><b>${p} %</b> de avance · ${E.listos} de 4 papeles listos</div><div class="dc-chips">${chipsFalta(E)}</div>`;
    const bt = `<div class="dc-bt"><button type="button" class="btn-ghost dc-docbtn" data-dcdoc="${esc(o.id)}">📄 Documentación</button></div>`;
    return `<div class="lg-card dc-card${modo === "term100" ? " dc-term" : ""}" ${enLegajo ? `data-lgabrir="${esc(o.id)}"` : `data-dcav="${esc(o.id)}"`} role="group" aria-label="${esc(nombreObra(o))}">${cab}${cuerpo}${bt}</div>`;
  }
  const TXT_TIPO = { plaza: "plazas", barrio: "barrios", otro: "otras obras" };
  function vacio(modo, hayAntesDeBuscar, tipo) {
    if (hayAntesDeBuscar) return "Nada coincide con la búsqueda.";
    const de = tipo && tipo !== "todas" ? TXT_TIPO[tipo] : "obras";
    return modo === "term100" ? `Todavía no hay ${de} al 100 %.` : `No hay ${de} con avance a las que les falte documentación. ✅`;
  }

  // ============================================================== Obras (legajos): los ganchos de obrasLegajo
  const lgModo = (m) => !off() && (m === "faltadoc" || m === "term100");
  function lgTabs(m) {
    if (off()) return "";
    const t = intentar(() => (window.legajoTipoFiltro ? window.legajoTipoFiltro() : "todas"), "todas"), n = cuentas(t);
    return `<button type="button" data-lgtab="faltadoc" class="${m === "faltadoc" ? "on" : ""}">📄 Falta documentación <b>${n.faltadoc}</b></button><button type="button" data-lgtab="term100" class="${m === "term100" ? "on" : ""}">✅ Terminadas <b>${n.term100}</b></button>`;
  }
  function lgNota() { return "<b>📄 Falta documentación</b>: con avance y les falta algún papel. <b>✅ Terminadas</b>: al 100 %. <b>🗄 Archivadas</b>: las ocultadas en Registrar obra (quedan acá para siempre)."; }

  // ============================================================== Avance de obra: subíndices y lista
  const AVK = "ema.av.doc";
  function avModo() { if (off()) return "avance"; const v = intentar(() => localStorage.getItem(AVK), ""); return v === "faltadoc" || v === "term100" ? v : "avance"; }
  function avElegir(m) { try { localStorage.setItem(AVK, m); } catch (e) { } pintarAvance(); }
  function pintarAvance() {
    const tabs = $("avDocTabs"), lis = $("avDocLista"), card = $("avancePanelCard");
    if (!tabs || !lis) return;
    if (off()) { tabs.hidden = true; lis.hidden = true; card && card.classList.remove("dc-on"); return; }
    const t = intentar(() => (window.avanceTipoFiltro ? window.avanceTipoFiltro() : "todas"), "todas"), m = avModo(), n = cuentas(t);
    const h = [["avance", "📊 Avance"], ["faltadoc", "📄 Falta documentación", n.faltadoc], ["term100", "✅ Terminadas", n.term100]].map(([k, x, c]) => `<button type="button" class="av-tipo${m === k ? " on" : ""}" aria-pressed="${m === k}" data-dcavtab="${k}">${x}${c != null ? ` <b>${c}</b>` : ""}</button>`).join("");
    tabs.hidden = false;
    if (tabs.__h !== h) { tabs.innerHTML = h; tabs.__h = h; }
    card && card.classList.toggle("dc-on", m !== "avance");
    if (m === "avance") { lis.hidden = true; return; }
    const l = lista(m, t);
    const lh = l.length ? `<div class="lg-lista dc-av">${l.map((o) => tarjeta(o, m, false)).join("")}</div>` : `<div class="lg-vacio dc-vacio">${esc(vacio(m, false, t))}</div>`;
    const cab = `<div class="dc-nota">${m === "term100" ? "Obras con el avance al 100 % (la misma cuenta del círculo de cada obra). Tocá una para ver su avance." : `Obras con avance (desde ${desdePct()} %) a las que les falta algún papel: carpeta EPEC, conforme a obra, planilla de PAT o certificado de instalación apta.`}</div>`;
    const hh = cab + lh;
    lis.hidden = false;
    if (lis.__h !== hh) { lis.innerHTML = hh; lis.__h = hh; }
  }

  // ============================================================== la ficha «📄 Documentación» del legajo
  function filaHtml(o, d, E) {
    const e = E[d.k], pc = puedeCargar();
    let det = "", acc = "";
    if (d.k === "carpeta") {
      det = e.ok ? `EPEC entregó la carpeta el ${esc(fLarga(e.fecha))}` : "Falta cargar la fecha en que EPEC entregó la carpeta.";
      if (!e.ok && pc && o.oculta !== true) acc = `<button type="button" class="btn-ghost" data-dc="carpeta">📁 Cargar la fecha</button>`;
    } else if (d.k === "conforme") {
      det = e.ok ? `Cerrado el ${esc(fLarga(e.fecha))}${e.por ? " por " + esc(String(e.por).split("@")[0]) : ""}` : "Todavía no se cerró el conforme a obra (se cierra en Avance de obra).";
      if (!e.ok && veAvance() && o.oculta !== true) acc = `<button type="button" class="btn-ghost" data-dc="conforme">📊 Ir a Avance de obra</button>`;
    } else {
      if (e.ok) {
        const como = e.papel ? "lo tienen en papel" : e.tipoArch === "pdf" ? "PDF cargado" : "foto cargada";
        det = `${esc(como)} · fecha ${esc(fLarga(e.fecha))}${e.nota ? " · " + esc(e.nota) : ""}<br><small>Cargó ${esc(e.porNombre || String(e.por || "").split("@")[0])} el ${esc(fTs(e.ts))}</small>`;
        acc = (e.adjId ? `<button type="button" class="btn-ghost" data-dc="ver" data-k="${d.k}">👁 Ver</button>` : "") + (pc ? `<button type="button" class="btn-ghost" data-dc="reemplazar" data-k="${d.k}">↺ Reemplazar</button>` : "");
      } else {
        det = "Falta.";
        if (pc) acc = `<button type="button" class="btn-primary" data-dc="cargar" data-k="${d.k}">📎 Cargar</button><button type="button" class="btn-ghost" data-dc="papel" data-k="${d.k}">✔ Lo tengo en papel</button>`;
      }
      const h = arr(e.hist);
      if (h.length) det += `<details class="dc-hist"><summary>Antes (${h.length})</summary>${h.slice().reverse().map((x) => `<div>${esc(x.papel ? "en papel" : x.tipoArch === "pdf" ? "PDF" : "foto")} · fecha ${esc(fLarga(x.fecha))} · ${esc(x.porNombre || String(x.por || "").split("@")[0])} el ${esc(fTs(x.ts))}${x.adjId ? ` · <button type="button" class="dc-link" data-dc="verh" data-id="${esc(x.adjId)}">ver</button>` : ""}</div>`).join("")}</details>`;
    }
    return `<div class="dc-row ${e.ok ? "si" : "no"}" data-dck="${d.k}"><span class="dc-est" aria-hidden="true">${e.ok ? "✅" : "❌"}</span><div class="dc-cu"><b>${d.ico} ${esc(d.t)}</b><span class="dc-det">${det}</span>${acc ? `<div class="dc-acc">${acc}</div>` : ""}</div></div>`;
  }
  function seccionHtml(o) {
    const E = estado(o), p = pct(o);
    const res = E.completa ? `<div class="dc-res ok">✅ Documentación completa (4 de 4)</div>` : `<div class="dc-res no">Faltan ${E.falta.length} de 4: ${E.falta.map((k) => esc(DOC[k].corto)).join(" · ")}${p >= desdePct() ? "" : " · la obra todavía no arrancó"}</div>`;
    return `<h3>📄 Documentación</h3>${res}${DOCS.map((d) => filaHtml(o, d, E)).join("")}`;
  }
  function pintarLegajo() {
    let sec = $("lgDocSec");
    const f = $("lgFotosSec"), id = !off() && f && f.dataset.plaza ? f.dataset.plaza : "", o = id ? obraDe(id) : null;
    if (!o) { sec && sec.remove(); return; }
    if (sec && sec.dataset.plaza !== String(id)) { sec.remove(); sec = null; }
    if (!sec) { sec = document.createElement("div"); sec.className = "card lg-sec dc-sec"; sec.id = "lgDocSec"; sec.dataset.plaza = String(id); f.insertAdjacentElement("beforebegin", sec); }
    const h = seccionHtml(o);
    if (sec.__h !== h) { const ab = sec.querySelector("details.dc-hist[open]"); sec.innerHTML = h; sec.__h = h; if (ab) { const k = ab.closest("[data-dck]").dataset.dck, n = sec.querySelector(`[data-dck="${k}"] details.dc-hist`); n && (n.open = true); } }
    try { window.__lgPleg && window.__lgPleg.aplicar(); } catch (e) { }
  }
  function abrirDoc(id) {
    try { window.abrirLegajo(id); } catch (e) { return; }
    let n = 0;
    const ir = () => {
      pintarLegajo();
      const s = $("lgDocSec");
      if (!s) { if (++n < 20) setTimeout(ir, 100); return; }
      try { window.__lgPleg && window.__lgPleg.abrir("📄 Documentación"); } catch (e) { }
      s.classList.remove("lg-cerrada");
      try { s.scrollIntoView({ block: "start", behavior: "auto" }); } catch (e) { }
    };
    setTimeout(ir, 60);
  }

  // ============================================================== cargar: hoja (.v7-ov, role=dialog, ✕) y guardado
  let H = null;   // {id, k, modo}
  function hoja(id, k, modo) {
    const o = obraDe(id), d = DOC[k]; if (!o || !d || !puedeCargar()) return;
    H = { id: String(id), k, modo };
    const v = $("dcOv"); v && v.remove();
    const ov = document.createElement("div"); ov.id = "dcOv"; ov.className = "v7-ov no-print dc-v7"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", d.t);
    const ant = estado(o)[k];
    const fecha = `<label for="dcFecha">Fecha del documento</label><input type="date" id="dcFecha" value="${hoyISO()}" max="${hoyISO()}">`;
    const archivo = `<label class="btn-primary dc-file">📷 Sacar foto o elegir archivo (foto o PDF)<input type="file" id="dcArchivo" accept="image/*,application/pdf" hidden></label><div class="dc-ayuda">La foto se sube como las fotos de obra (a la nube de fotos). El PDF, hasta ${Math.round(PDF_MAX / 1024)} KB.</div>`;
    const papel = `<label for="dcNota">Dónde está (opcional)</label><input type="text" id="dcNota" placeholder="Ej: carpeta de la oficina" autocomplete="off"><button type="button" class="${modo === "papel" ? "btn-primary" : "btn-ghost"} dc-papel-ok" data-dc="guardarPapel">✔ Lo tengo en papel</button>`;
    const cuerpo = modo === "papel" ? fecha + papel : modo === "cargar" ? fecha + archivo : fecha + archivo + `<div class="dc-o">o</div>` + papel;
    ov.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>${d.ico} ${esc(d.t)}</h3><small>${esc(nombreObra(o))}${ant.ok ? " · el anterior queda en el historial" : ""}</small></div><button type="button" class="v7-x" data-dc="x" aria-label="Cerrar">✕</button></div>${cuerpo}<div class="dc-msg" id="dcMsg" role="status" aria-live="polite"></div></div>`;
    ov.addEventListener("click", (e) => { if (e.target === ov) cerrarHoja(); });
    document.body.appendChild(ov);
  }
  function cerrarHoja() { const v = $("dcOv"); v && v.remove(); H = null; }
  const msg = (t, mal) => { const m = $("dcMsg"); if (m) { m.textContent = t; m.classList.toggle("mal", !!mal); } };
  const sinHist = (x) => { const c = Object.assign({}, x); delete c.hist; return c; };
  async function guardarDoc(id, k, datos) {
    const o = obraDe(id); if (!o) throw new Error("No encontré la obra.");
    if (typeof window.fbAvanceCampos != "function") throw new Error("No hay conexión con la base.");
    const prev = obj(obj(o.documentos)[k]);
    const hist = arr(prev.hist).slice(-19); if (prev.ok) hist.push(sinHist(prev));
    const nuevo = Object.assign({ ok: true, fecha: datos.fecha || hoyISO(), por: yoMail(), porNombre: yoNombre(), ts: Date.now() }, datos, { hist });
    Object.keys(nuevo).forEach((x) => { if (nuevo[x] === undefined) delete nuevo[x]; });
    const ch = {}; ch["documentos." + k] = nuevo;
    await window.fbAvanceCampos(String(id), ch);
    o.documentos = Object.assign({}, obj(o.documentos)); o.documentos[k] = nuevo;
    try { typeof window.fbAuditar == "function" && window.fbAuditar("obra_documento", `${DOC[k].t} de ${nombreObra(o)}: ${nuevo.papel ? "en papel" : nuevo.tipoArch === "pdf" ? "PDF cargado" : "foto cargada"} (fecha ${fLarga(nuevo.fecha)})${prev.ok ? " · reemplaza al anterior" : ""}`, { ref: String(id), clave: k, antes: prev.ok ? sinHist(prev) : null, despues: sinHist(nuevo) }); } catch (e) { }
    refrescar();
    return nuevo;
  }
  const leerB64 = (file) => new Promise((ok, mal) => { const r = new FileReader(); r.onerror = () => mal(new Error("No se pudo leer el archivo")); r.onload = () => ok(String(r.result || "")); r.readAsDataURL(file); });
  const conTope = (p, ms) => Promise.race([p, new Promise((_, m) => setTimeout(() => m(new Error("lento")), ms))]);
  async function cargarArchivo(file) {
    if (!H || !file) return;
    const { id, k } = H, o = obraDe(id), fecha = ($("dcFecha") || {}).value || hoyISO();
    if (typeof window.fbAdjuntoGuardar != "function") return msg("No hay conexión con la base: probá de nuevo en un rato.", true);
    const esPdf = /pdf$/i.test(file.type || "") || /\.pdf$/i.test(file.name || "");
    const base = { tipo: "documento", doc: k, docTxt: DOC[k].t, plazaId: String(id), plazaNombre: (o && (o.nombre || o.plazaNombre)) || "", fecha, nombre: file.name || "", ts: Date.now(), usuario: yoMail() };
    let datos;
    try {
      if (esPdf) {
        if (file.size > PDF_MAX) return msg(`El PDF pesa ${Math.round(file.size / 1024)} KB y la app guarda hasta ${Math.round(PDF_MAX / 1024)} KB. Sacale una foto a la hoja o marcá «Lo tengo en papel».`, true);
        msg("Guardando el PDF…");
        const du = await leerB64(file);
        datos = Object.assign({}, base, { dataUrl: du.replace(/^data:[^;,]*/, "data:application/pdf"), bytes: file.size, mime: "application/pdf" });
      } else {
        msg("Achicando la foto…");
        const c = await comprimirImagen(file, 1600, 700 * 1024);
        datos = Object.assign({}, base, { dataUrl: c.dataUrl, w: c.w, h: c.h, bytes: c.bytes });
        msg("Subiendo la foto…");
      }
      const adjId = await conTope(window.fbAdjuntoGuardar(datos), 45000);
      if (!adjId) throw new Error("sin número");
      await guardarDoc(id, k, { fecha, adjId: String(adjId), tipoArch: esPdf ? "pdf" : "foto", nombre: file.name || "" });
      msg("✓ Guardado.");
      setTimeout(cerrarHoja, 700);
    } catch (e) {
      const t = String((e && e.message) || e);
      msg(e && e.code === "permission-denied" ? "🔒 Tu usuario no tiene permiso para cargar documentos de la obra." : /lento/.test(t) ? "📶 Tarda mucho (señal lenta). Si quedó guardado en el celu se sube solo; si no, probá de nuevo." : "⚠ No se pudo guardar: " + t, true);
    }
  }
  async function guardarPapel() {
    if (!H) return;
    const { id, k } = H, fecha = ($("dcFecha") || {}).value || hoyISO(), nota = String(($("dcNota") || {}).value || "").trim();
    msg("Guardando…");
    try { await guardarDoc(id, k, { fecha, papel: true, nota: nota || undefined }); msg("✓ Guardado."); setTimeout(cerrarHoja, 600); }
    catch (e) { msg(e && e.code === "permission-denied" ? "🔒 Tu usuario no tiene permiso para cargar documentos de la obra." : "⚠ No se pudo guardar (revisá la señal): " + String((e && e.message) || e), true); }
  }
  async function verArchivo(adjId) {
    let d = null; try { d = await window.fbAdjuntoLeer(adjId); } catch (e) { d = null; }
    if (d && (d.mime === "application/pdf" || /^data:application\/pdf/.test(d.dataUrl || ""))) {
      try { const a = document.createElement("a"); a.href = d.dataUrl; a.download = d.nombre || "documento.pdf"; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { }
      return;
    }
    typeof window.verAdjunto == "function" && window.verAdjunto(adjId);
  }
  function irCarpeta(id) {
    try { mostrarVista("registro"); } catch (e) { }
    setTimeout(() => {
      try { window.REGISTRO_OBRA && window.REGISTRO_OBRA.editarObra(id); } catch (e) { }
      setTimeout(() => { const i = $("obCarpetaEpec"); if (i) { try { i.scrollIntoView({ block: "center" }); i.focus(); } catch (e) { } } }, 400);
    }, 200);
  }
  function irConforme(id) {
    try { typeof irADetalleDesdeMapa == "function" ? irADetalleDesdeMapa(id) : mostrarVista("avance"); } catch (e) { }
  }
  function refrescar() { pintarLegajo(); pintarAvance(); try { $("obrasApp") && !$("lgFotosSec") && typeof window.renderObras == "function" && $("viewObras").style.display !== "none" && window.renderObras(); } catch (e) { } }

  // ============================================================== toques
  document.addEventListener("click", (e) => {
    if (off()) return;
    const t = e.target;
    const tab = t.closest && t.closest("[data-dcavtab]");
    if (tab) { e.preventDefault(); avElegir(tab.dataset.dcavtab); return; }
    const dd = t.closest && t.closest("[data-dcdoc]");
    if (dd) {   // el botón «📄 Documentación» (en Obras ya abrió el legajo por data-lgabrir: acá se abre y se muestra la ficha)
      e.preventDefault(); abrirDoc(dd.dataset.dcdoc); return;
    }
    const av = t.closest && t.closest("[data-dcav]");
    if (av) { e.preventDefault(); const o = obraDe(av.dataset.dcav); if (!o) return; if (o.oculta === true || !visibles().some((v) => String(v.id) === String(o.id))) abrirDoc(o.id); else { try { verAvanceDetalle(o.id); const c = $("avanceDetalleCard"); c && c.scrollIntoView({ block: "start", behavior: "smooth" }); } catch (er) { } } return; }
    const b = t.closest && t.closest("[data-dc]");
    if (!b) return;
    const a = b.dataset.dc, sec = $("lgDocSec"), id = H ? H.id : sec ? sec.dataset.plaza : "";
    if (a === "x") { e.preventDefault(); cerrarHoja(); return; }
    if (a === "guardarPapel") { e.preventDefault(); guardarPapel(); return; }
    if (!sec || !sec.contains(b)) return;
    e.preventDefault();
    if (a === "cargar" || a === "papel" || a === "reemplazar") return hoja(id, b.dataset.k, a);
    if (a === "ver") { const x = estado(obraDe(id))[b.dataset.k]; x && x.adjId && verArchivo(x.adjId); return; }
    if (a === "verh") return verArchivo(b.dataset.id);
    if (a === "carpeta") return irCarpeta(id);
    if (a === "conforme") return irConforme(id);
  });
  document.addEventListener("change", (e) => { if (!off() && e.target && e.target.id === "dcArchivo") { const f = e.target.files && e.target.files[0]; e.target.value = ""; f && cargarArchivo(f); } });

  // ============================================================== arranque: el legajo se redibuja entero (obrasLegajo) → se vuelve a poner
  let pend = false;
  const tocar = () => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; try { pintarLegajo(); } catch (e) { } }); };
  const enganchar = () => { const a = $("obrasApp"); if (!a) return setTimeout(enganchar, 600); if (a.__dcObs) return; a.__dcObs = 1; new MutationObserver(tocar).observe(a, { childList: true }); };
  enganchar();
  setInterval(() => {
    if (off() || document.hidden) return;
    try { if ($("lgFotosSec")) pintarLegajo(); else { const s = $("lgDocSec"); s && s.remove(); } } catch (e) { }
    try { const v = $("viewAvance"); if (v && v.style.display !== "none") pintarAvance(); } catch (e) { }
  }, 1500);
  window.__docObra = { estado, pct, terminada, faltaDoc, fecha100, lista, cuentas, lgModo, lgTabs, lgCard: (o, m) => tarjeta(o, m, true), lgNota, vacio, pintarAvance, pintarLegajo, avModo, avElegir, abrirDoc, hoja, cerrarHoja, guardarDoc, cargarArchivo, guardarPapel, verArchivo, puedeCargar, DOCS, desdePct };
})();
