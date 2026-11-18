(function () {
  "use strict";
  // v171 · «＋ Otra foto» en Mis tareas (Ángel 18/11/2026: «en Mis tareas ellos ponen las fotos que les piden, y de paso deberían
  // poder poner otra, y ahí que les pida poner un nombre como en la cámara: ponés "otra" y te pide un nombre»).
  //  · En cada tarea de Mis tareas (la lista), abajo de las fotos que se piden: «Otras fotos» con las que ya se sacaron (con su
  //    nombre) y el botón «＋ Otra foto».
  //  · El botón abre la hoja #ofOv «¿Qué es la foto?» con los mismos botones de la cámara (v164): Columna · Tablero · PAT · Zanja ·
  //    Acometida · Otro…; Columna con «‹ Col N ›», Otro… con el tecladito y lo último escrito (localStorage ema.foto.otros, la
  //    misma lista de la cámara). Elegido el nombre, la cámara (la de la app o la del teléfono / APK: el mismo input.mt-foto-t de
  //    las filas, así siguen fotoSegura y androidPro).
  //  · La foto va a la orden SIN tarea («suelta», como la v164: cat + num con el nombre, otra171, kx = la tarea donde se sacó), la
  //    oficina la ve en el «📸 Avance» debajo de esa tarea y en el legajo, y la mueve con «↔ Mover» (v152). No cuenta para las
  //    fotos que se piden ni para la verificación (v150). Si es una columna que la tarea sí pide (Col 6 de un pozo Col 6–8), va
  //    como la foto de esa fila (el camino de siempre).
  //  · «▶ Voy a iniciar» (v166): el botón también pide el cartel si la tarea no arrancó (SEL de inicioMt).
  //  Sin reglas nuevas (campo.fotos como siempre). Apagado con __v171No.
  if (window.__otraFoto) return;
  const off = () => !!window.__v171No;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const Lk = (s) => String(s || "").replace(/[~*\/\[\].`]/g, "_").slice(0, 120) || "_";
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const intentar = (fn, def) => { try { return fn(); } catch (e) { return def; } };
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const otDe = (id) => ots().find((o) => o && o.id === id) || null;
  const API = () => window.__mtAPI || null;
  const cerrada = (o) => !!(o && (o.estado === "Terminada" || o.estado === "Anulada" || (o.cierre && o.cierre.cerradoTs)));
  const cssEsc = (s) => (window.CSS && CSS.escape ? CSS.escape(String(s)) : String(s).replace(/["\\]/g, "\\$&"));
  const CHIPS = [["columna", "Columna"], ["tablero", "Tablero"], ["pat", "PAT"], ["zanja", "Zanja"], ["conexion", "Acometida"], ["otra", "Otro…"]];
  const KREC = "ema.foto.otros", KPEND = "ema.otra171.pend";
  const recientes = () => intentar(() => JSON.parse(localStorage.getItem(KREC) || "[]") || [], []).filter((x) => typeof x == "string" && x.trim()).slice(0, 8);
  const recordar = (t) => { t = String(t || "").trim().slice(0, 40); if (!t) return; const l = [t].concat(recientes().filter((x) => nk(x) !== nk(t))).slice(0, 8); try { localStorage.setItem(KREC, JSON.stringify(l)); } catch (e) { } };
  const NOMBRES = {};   // otId|k → nombres de las unidades que pide la tarea (lo anota mtFotosLista)
  const S = { pend: null, hoja: null, guardadas: 0 };

  // ------------------------------------------------------------------ las fotos «otras» de una tarea
  const otrasDe = (o, k) => { const f = obj(obj(o && o.campo).fotos); return Object.keys(f).map((id) => Object.assign({ id }, f[id])).filter((x) => x && x.otra171 && x.kx === k && !x.borrada).sort((a, b) => (a.ts || 0) - (b.ts || 0)); };

  // ------------------------------------------------------------------ plantilla (va adentro de la de Mis tareas)
  function bloque(o, tarea, nombres) {
    if (off() || !o || !tarea) return "";
    if (nombres) NOMBRES[o.id + "|" + tarea.k] = nombres.filter(Boolean);
    const l = otrasDe(o, tarea.k), ab = !cerrada(o);
    if (!l.length && !ab) return "";
    let h = `<div class="of-caja" data-ofk="${esc(tarea.k)}">`;
    if (l.length) h += `<div class="of-tit">📎 Otras fotos <small>no cuentan para las que te piden</small></div><div class="of-lista">${l.map((f) => `<figure class="of-f">${f.mini ? `<img src="${esc(f.mini)}" data-ver="${esc(f.id)}" alt="${esc(f.num || "foto")}">` : `<img data-adj="${esc(f.id)}" alt="${esc(f.num || "foto")}">`}<figcaption>${esc(f.num || "Otra")}</figcaption></figure>`).join("")}</div>`;
    if (ab) h += `<button type="button" class="btn-ghost of-btn" data-mto="abrir">＋ Otra foto</button><input type="file" accept="image/*" capture="environment" class="mt-foto-t" data-fli="o171" data-fln="" data-mto171="1" style="display:none;">`;
    return h + `</div>`;
  }

  // ------------------------------------------------------------------ columnas: ‹ Col N ›
  const listaObra = (o) => intentar(() => (window.puntosDeObra(o.plazaId) || {}).lista || [], []) || [];
  function sigCol(n, d) {
    const p = intentar(() => window.flPartes(n), null); if (!p || !p.col) return d > 0 ? "Col 1" : "";
    const c = Math.max(1, p.col + d), pre = [p.t ? "T" + p.t : "", p.c ? "C" + p.c : ""].filter(Boolean);
    return pre.concat(["Col " + c]).join(" · ");
  }
  function colInicial(o, k) {
    const ns = NOMBRES[o.id + "|" + k] || [], l = listaObra(o);
    if (ns.length) { const u = ns[ns.length - 1]; const i = l.findIndex((x) => nk(x) === nk(u)); return i >= 0 && l[i + 1] ? l[i + 1] : sigCol(u, 1); }
    return l[0] || "Col 1";
  }
  function moverCol(d) {
    const H = S.hoja; if (!H) return; const o = otDe(H.ot); const l = o ? listaObra(o) : [];
    const i = l.findIndex((x) => nk(x) === nk(H.col));
    if (i >= 0 && l[i + d]) H.col = l[i + d];
    else if (i >= 0 && d > 0 && i === l.length - 1) H.col = sigCol(H.col, 1);
    else if (i < 0) { const n = sigCol(H.col, d); const j = l.findIndex((x) => nk(x) === nk(n)); H.col = j >= 0 ? l[j] : n || H.col; }
    pintarHoja();
  }

  // ------------------------------------------------------------------ la hoja «¿Qué es la foto?»
  function cerrarHoja() { const v = $("ofOv"); v && v.remove(); S.hoja = null; }
  function abrir(otId, k) {
    if (off()) return false;
    const o = otDe(otId); if (!o || cerrada(o)) return false;
    const t = intentar(() => API().tareas(o).find((x) => x.k === k), null);
    S.hoja = { ot: otId, k, label: (t && t.label) || "", cat: "", col: colInicial(o, k), otro: false };
    pintarHoja(); return true;
  }
  function hojaHtml() {
    const H = S.hoja, rec = recientes();
    let h = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>📷 Otra foto</h3><small>${esc(H.label ? H.label + " · " : "")}¿Qué es la foto?</small></div><button type="button" class="v7-x" data-of="x" aria-label="Cerrar">✕</button></div>`;
    h += `<div class="of-chips">${CHIPS.map((c) => `<button type="button" class="of-chip${H.cat === c[0] ? " on" : ""}" data-ofcat="${c[0]}">${esc(c[1])}</button>`).join("")}</div>`;
    if (H.cat === "columna") h += `<div class="of-num"><button type="button" class="of-fl" data-of="prev" aria-label="Anterior">‹</button><div class="of-nt" aria-live="polite"><b>${esc(H.col)}</b><small>tocá ‹ › para cambiarla</small></div><button type="button" class="of-fl" data-of="next" aria-label="Siguiente">›</button></div><button type="button" class="btn-primary of-sacar" data-of="sacar">📷 Sacar la foto · ${esc(H.col)}</button>`;
    else if (H.cat === "otra") h += `<div class="of-otro">${rec.length ? `<div class="of-rec"><small>Lo último que escribiste</small><div>${rec.map((r) => `<button type="button" data-ofrec="${esc(r)}">${esc(r)}</button>`).join("")}</div></div>` : ""}<form class="of-form" data-of="form"><input id="ofOtroIn" type="text" maxlength="40" autocomplete="off" enterkeyhint="done" placeholder="Ej.: medidor, caño roto, base…" aria-label="Qué es la foto"><button type="submit" class="btn-primary">Listo</button></form></div>`;
    else h += `<div class="of-ayuda">Elegí qué es y se abre la cámara. Esta foto no cuenta para las que te piden: es de más.</div>`;
    return h + `<div class="of-msg" id="ofMsg" role="status"></div></div>`;
  }
  function pintarHoja() {
    if (!S.hoja) return cerrarHoja();
    let v = $("ofOv");
    if (!v) { v = document.createElement("div"); v.id = "ofOv"; v.className = "v7-ov v7-arriba no-print"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true"); v.setAttribute("aria-label", "Otra foto"); document.body.appendChild(v); }
    v.innerHTML = hojaHtml();
    if (S.hoja.cat === "otra" && !recientes().length) setTimeout(() => { const i = $("ofOtroIn"); i && i.focus(); }, 60);
  }

  // ------------------------------------------------------------------ sacar
  const inputDe = (otId, k) => document.querySelector(`#mtApp .mt-ot[data-ot="${cssEsc(otId)}"] .mt-tarea[data-k="${cssEsc(k)}"] input[data-mto171]`);
  function esUnidad(otId, k, cat, nombre) { return cat === "columna" && (NOMBRES[otId + "|" + k] || []).some((n) => nk(n) === nk(nombre)); }
  function sacar(cat, nombre) {
    const H = S.hoja; if (!H) return;
    nombre = String(nombre || "").trim(); if (!nombre) return;
    const inp = inputDe(H.ot, H.k);
    if (!inp) { const m = $("ofMsg"); m && (m.textContent = "No encontré la tarea en la pantalla. Cerrá y volvé a tocar «＋ Otra foto»."); return; }
    const real = esUnidad(H.ot, H.k, cat, nombre);
    S.pend = { ot: H.ot, k: H.k, label: H.label, cat, num: nombre, real, ts: Date.now() };
    try { localStorage.setItem(KPEND, JSON.stringify(S.pend)); } catch (e) { }
    inp.dataset.fln = nombre;
    cerrarHoja();
    inp.click();   // la cámara de la app, la del teléfono o la del APK (androidPro), como cualquier fila
  }
  function pendiente() {
    if (S.pend && Date.now() - S.pend.ts < 30 * 60000) return S.pend;
    const p = intentar(() => JSON.parse(localStorage.getItem(KPEND) || "null"), null);
    return p && Date.now() - p.ts < 30 * 60000 ? p : null;
  }

  // ------------------------------------------------------------------ cartelito
  let tT = null;
  function toast(t) {
    let d = $("ofToast"); if (!d) { d = document.createElement("div"); d.id = "ofToast"; d.className = "no-print"; d.setAttribute("role", "status"); document.body.appendChild(d); }
    d.textContent = t; d.hidden = false; clearTimeout(tT); tT = setTimeout(() => { d.hidden = true; }, 4000);
  }

  // ------------------------------------------------------------------ guardar (sin tarea: no cuenta)
  async function guardar(file, P) {
    const o = otDe(P.ot), A = API(); if (!o || !A) return;
    const por = intentar(() => A.persona(), "") || intentar(() => (PERMISOS.yo() || {}).persona, "") || "";
    const meta = { plazaId: o.plazaId || "", plazaNombre: o.plazaNombre || "", otId: o.id, otNumero: o.numero || "", cat: P.cat || "otra", num: P.num, por, origen: "cuadrilla", titulo: `${o.numero || ""} · ${P.num}`, otra171: 1, kx: P.k };
    const ent = (adj, mini) => ({ ["campo.fotos." + Lk(adj)]: { por, ts: Date.now(), cat: meta.cat, num: P.num, mini: mini || "", otra171: 1, kx: P.k, tareaX: P.label || "" } });
    toast(`Subiendo «${P.num}»…`);
    try {
      const u = await window.guardarFotoObra(file, meta);
      A.guardar(o, ent(u.adjId, u.mini)); S.guardadas++;
      toast(`✓ «${P.num}» guardada en la orden`);
    } catch (er) {
      if (er && er.enEspera && er.adjId) { A.guardar(o, ent(er.adjId, "")); S.guardadas++; }
      toast(window.__fotoError ? String(window.__fotoError(er, o) || "").replace(/<[^>]+>/g, "") : "⚠ No se pudo subir la foto. Probá de nuevo.");
    }
    intentar(() => A.redibujar());
  }
  window.addEventListener("change", (e) => {
    const t = e.target; if (off() || !t || !t.dataset || t.dataset.mto171 !== "1" || !t.files || !t.files[0]) return;   // solo su input (con la cámara abierta no llega nada más)
    const P = pendiente() || (() => { const tr = t.closest(".mt-tarea[data-k]"), cd = t.closest(".mt-ot[data-ot]"); return tr && cd ? { ot: cd.dataset.ot, k: tr.dataset.k, label: "", cat: "otra", num: t.dataset.fln || "Otra", real: false, ts: Date.now() } : null; })();
    S.pend = null; try { localStorage.removeItem(KPEND); } catch (x) { }
    if (!P) return;
    if (P.real) { t.dataset.fln = P.num; return; }   // una columna que la tarea pide: el camino de siempre (fotosUnaPorUna + ordenesCampo)
    e.stopImmediatePropagation(); e.stopPropagation();
    const f = t.files[0]; t.value = "";
    guardar(f, P);
  }, true);

  // ------------------------------------------------------------------ toques
  const camAbierta = () => !!(document.body && document.body.classList.contains("ec-abierta"));   // con la cámara abierta no hace nada (como la v164)
  document.addEventListener("click", (e) => {
    const t = e.target; if (off() || camAbierta() || !t || !t.closest) return;
    const b = t.closest('#mtApp [data-mto="abrir"]');
    if (b) {
      const tr = b.closest(".mt-tarea[data-k]"), cd = b.closest(".mt-ot[data-ot]"); if (!tr || !cd) return;
      e.preventDefault(); abrir(cd.dataset.ot, tr.dataset.k); return;
    }
    const v = t.closest("#ofOv"); if (!v || !S.hoja) return;
    if (t === v || t.closest('[data-of="x"]')) { e.preventDefault(); return cerrarHoja(); }
    const c = t.closest("[data-ofcat]");
    if (c) {
      const cat = c.dataset.ofcat; e.preventDefault();
      if (cat === "columna" || cat === "otra") { S.hoja.cat = cat; return pintarHoja(); }
      return sacar(cat, (CHIPS.find((x) => x[0] === cat) || [])[1]);
    }
    const r = t.closest("[data-ofrec]"); if (r) { e.preventDefault(); recordar(r.dataset.ofrec); return sacar("otra", r.dataset.ofrec); }
    const a = t.closest("[data-of]"); if (!a) return;
    if (a.dataset.of === "prev" || a.dataset.of === "next") { e.preventDefault(); return moverCol(a.dataset.of === "next" ? 1 : -1); }
    if (a.dataset.of === "sacar") { e.preventDefault(); return sacar("columna", S.hoja.col); }
  });
  document.addEventListener("submit", (e) => {
    const f = e.target; if (!f || !f.closest || !f.closest("#ofOv")) return;
    e.preventDefault(); const txt = String(($("ofOtroIn") || {}).value || "").trim();
    if (!txt) { const m = $("ofMsg"); m && (m.textContent = "Escribí qué es la foto."); return; }
    recordar(txt); sacar("otra", txt);
  }, true);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("ofOv")) { e.stopPropagation(); cerrarHoja(); } }, true);

  window.__otraFoto = { bloque, abrir, cerrar: cerrarHoja, sacar, otrasDe, recientes, nombres: (otId, k) => (NOMBRES[otId + "|" + k] || []).slice(), estado: () => ({ hoja: S.hoja ? Object.assign({}, S.hoja) : null, pend: pendiente(), guardadas: S.guardadas }) };
})();
