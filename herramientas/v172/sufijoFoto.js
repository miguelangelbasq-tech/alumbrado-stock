(function () {
  "use strict";
  // v172 · Ángel 18/11/2026: «Selecciono Tablero y al apretar arriba de Tablero (otra vez) debería dejarte poner tablero y algo que
  // yo quiero poner, como 1 o E o roto, lo que sea».
  //  · En los botones para nombrar la foto (Columna · Tablero · PAT · Zanja · Acometida) de la cámara (Modo obra, cámara C y la de
  //    la barra) y de la hoja «＋ Otra foto» (v171): el botón elegido muestra «✎»; tocarlo otra vez abre «Tablero …» (#sfOv,
  //    role=dialog con ✕, el estilo del tecladito «Otro…» de la v164) con lo último usado en ese botón + 1, 2, 3, E, roto y el
  //    tecladito. Queda «Tablero 1», «Tablero E», «Tablero roto»; en Columna se suma al número («Col 4 base») y ‹ Col N › sigue.
  //  · Lo agregado sigue para las fotos siguientes (como lo elegido de la v164: 30 min sin usarlo) hasta que se cambia o se saca
  //    («Sacar …»). Lo último usado en cada botón queda en el celu (localStorage ema.foto.sufijos, como ema.foto.otros).
  //  · La foto: cat como siempre y num = el nombre entero; si ese nombre no es una de las unidades de la tarea, va «suelta» (sin
  //    tarea, como la v164 / v171) y la oficina la mueve con «↔ Mover».
  //  Nada de vigías ni relojitos: un solo escucha de toques (con la cámara abierta no suma trabajo). Apagado con __v172No.
  if (window.__fotoSuf) return;
  const off = () => !!window.__v172No;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const intentar = (fn, def) => { try { return fn(); } catch (e) { return def; } };
  const LBL = { columna: "Columna", tablero: "Tablero", pat: "PAT", zanja: "Zanja", conexion: "Acometida" };
  const BASE = ["1", "2", "3", "E", "roto"], BASE_NUM = ["E", "roto"];   // en Columna / PAT ya va el número: «Col 4 E», «Col 4 roto»
  const KMEM = "ema.foto.sufijos", VIDA = 30 * 60000;
  const clave = (cat) => (cat === "caja" || cat === "luminaria" ? "columna" : String(cat || ""));
  const conNum = (k) => k === "columna" || k === "pat";
  const ACT = {};   // botón → {txt, ts}: lo agregado que sigue para las fotos siguientes
  let HOJA = null;  // la hoja «＋ Otra foto»: el último botón usado {cat, ts}

  const mem = () => { const m = intentar(() => JSON.parse(localStorage.getItem(KMEM) || "{}"), {}); return m && typeof m == "object" && !Array.isArray(m) ? m : {}; };
  const recientes = (cat) => { const l = mem()[clave(cat)]; return (Array.isArray(l) ? l : []).filter((x) => typeof x == "string" && x.trim()).slice(0, 6); };
  function recordar(cat, t) {
    const k = clave(cat); t = String(t || "").trim().slice(0, 30); if (!k || !t) return;
    const m = mem(); m[k] = [t].concat(recientes(k).filter((x) => nk(x) !== nk(t))).slice(0, 6);
    try { localStorage.setItem(KMEM, JSON.stringify(m)); } catch (e) { }
  }
  function de(cat) {
    if (off()) return "";
    const k = clave(cat), a = ACT[k]; if (!a) return "";
    if (Date.now() - a.ts > VIDA) { delete ACT[k]; return ""; }
    return a.txt;
  }
  function poner(cat, txt) {
    const k = clave(cat); txt = String(txt || "").replace(/\s+/g, " ").trim().slice(0, 30);
    if (!txt) { delete ACT[k]; return ""; }
    ACT[k] = { txt, ts: Date.now() }; recordar(k, txt); return txt;
  }
  const usado = (cat) => { const a = ACT[clave(cat)]; if (a) a.ts = Date.now(); };   // con cada foto sigue «vivo»
  // el nombre entero: base (el número de la columna, si hay) o el nombre del botón, + lo agregado
  function nombre(cat, base) {
    const s = de(cat), b = String(base || "").trim() || LBL[clave(cat)] || "";
    return s ? (b + " " + s).trim() : b;
  }
  // la letra del botón: «Tablero 1 ✎» (el elegido muestra el lápiz: se puede tocar otra vez)
  function chip(cat, label, on) {
    if (off() || !LBL[clave(cat)]) return esc(label);
    const s = on ? de(cat) : "";
    return esc(label) + (s ? " " + esc(s) : "") + (on ? '<i class="sf-lp" aria-hidden="true">✎</i>' : "");
  }

  // ------------------------------------------------------------------ la hoja «Tablero …»
  let VOLVER = null;   // a quién avisar después (cámara de la barra, Modo obra / C, hoja «＋ Otra foto»)
  function cerrar() { const d = $("sfOv"); d && d.remove(); }
  function abrir(cat, desde) {
    if (off()) return false;
    const k = clave(cat); if (!LBL[k]) return false;
    cerrar(); VOLVER = desde || null;
    const cur = de(k), lbl = LBL[k];
    const ops = []; recientes(k).concat(conNum(k) ? BASE_NUM : BASE).forEach((x) => { if (!ops.some((y) => nk(y) === nk(x))) ops.push(x); });
    const cam = $("emaCam");
    const d = document.createElement("div"); d.id = "sfOv"; d.className = "fn-otro sf-ov no-print" + (cam ? "" : " sf-fijo");
    d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", lbl + ": agregarle algo al nombre"); d.dataset.cat = k;
    const ej = conNum(k) ? (k === "columna" ? "Col 4" : "PAT 1") : lbl;
    d.innerHTML = `<div class="fn-oc"><div class="fn-oh"><b>${esc(lbl)} <span class="sf-raya">___</span></b><button type="button" class="fn-x" data-sf="x" aria-label="Cerrar">✕</button></div>`
      + `<div class="sf-ay">Le agrego algo al nombre${conNum(k) ? " (después del número)" : ""}: queda «${esc(ej)} ${esc(cur || ops[0] || "1")}». Sigue para las fotos que vienen hasta que lo cambies.</div>`
      + `<div class="fn-rec"><small>Tocá uno o escribí</small>${ops.slice(0, 9).map((r) => `<button type="button" data-sfv="${esc(r)}"${nk(r) === nk(cur) ? ' class="on"' : ""}>${esc(r)}</button>`).join("")}</div>`
      + `<form class="fn-form" data-sf="form"><input id="sfIn" type="text" maxlength="30" autocomplete="off" enterkeyhint="done" value="${esc(cur)}" placeholder="Ej.: 1, E, roto…" aria-label="Qué le agrego"><button type="submit" class="btn-primary">Listo</button></form>`
      + (cur ? `<button type="button" class="sf-nada" data-sf="nada">Sacar «${esc(cur)}» (queda «${esc(ej)}»)</button>` : "")
      + `</div>`;
    (cam || document.body).appendChild(d);
    return true;
  }
  function elegido(txt) {
    const d = $("sfOv"); if (!d) return; const k = d.dataset.cat;
    poner(k, txt); cerrar();
    const v = VOLVER; VOLVER = null;
    intentar(() => v && v(), null);
  }

  // ------------------------------------------------------------------ toques (antes que los de la cámara: escucha en window)
  const SEL_CHIP = '#emaCam #fnFila [data-fncat], #emaCam #cbPanel [data-cbm], #ofOv [data-ofcat]';
  function refrescoDe(c) {
    if (c.closest("#fnFila")) return () => window.__fotoNombre && window.__fotoNombre.refrescar && window.__fotoNombre.refrescar();
    if (c.closest("#cbPanel")) return () => window.__camB && window.__camB.repintar && window.__camB.repintar();
    return () => window.__otraFoto && window.__otraFoto.repintar && window.__otraFoto.repintar();
  }
  window.addEventListener("click", (e) => {
    if (off()) return;
    const t = e.target; if (!t || !t.closest) return;
    const d = t.closest("#sfOv");
    if (d) {
      e.stopPropagation();
      if (t === d || t.closest('[data-sf="x"]')) { e.preventDefault(); VOLVER = null; return cerrar(); }
      const v = t.closest("[data-sfv]"); if (v) { e.preventDefault(); return elegido(v.dataset.sfv); }
      if (t.closest('[data-sf="nada"]')) { e.preventDefault(); return elegido(""); }
      return;
    }
    const c = t.closest(SEL_CHIP); if (!c) return;
    const cat = c.dataset.fncat || c.dataset.cbm || c.dataset.ofcat;
    if (!LBL[clave(cat)] || !c.classList.contains("on")) return;   // el primer toque elige (como siempre); el segundo abre esto
    e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    abrir(cat, refrescoDe(c));
  }, true);
  window.addEventListener("submit", (e) => {
    const f = e.target; if (off() || !f || !f.closest || !f.closest("#sfOv")) return;
    e.preventDefault(); e.stopPropagation();
    elegido(($("sfIn") || {}).value || "");
  }, true);
  // cada foto (con la cámara abierta, la de la app entrega a un input de archivo) mantiene «vivo» lo agregado
  window.addEventListener("change", (e) => { const t = e.target; if (off() || !t || t.type !== "file") return; Object.keys(ACT).forEach((k) => { ACT[k].ts = Date.now(); }); }, true);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("sfOv")) { e.stopPropagation(); VOLVER = null; cerrar(); } }, true);

  // ------------------------------------------------------------------ la hoja «＋ Otra foto» (v171): lo elegido queda para la siguiente
  const ultHoja = () => (!off() && HOJA && Date.now() - HOJA.ts < VIDA ? HOJA.cat : "");
  const marcarHoja = (cat) => { if (LBL[clave(cat)]) HOJA = { cat: clave(cat), ts: Date.now() }; usado(cat); };
  function hojaSacar(cat) {   // Tablero / PAT / Zanja / Acometida elegido en la hoja: el nombre y «Sacar la foto»
    const n = nombre(cat, "");
    return `<div class="of-num sf-hn"><div class="of-nt" aria-live="polite"><b>${esc(n)}</b><small>tocá «${esc(LBL[clave(cat)])}» otra vez para agregarle algo</small></div></div><button type="button" class="btn-primary of-sacar" data-of="sacar">📷 Sacar la foto · ${esc(n)}</button>`;
  }

  window.__fotoSuf = { de, poner, nombre, chip, abrir, cerrar, recientes, usado, ultHoja, marcarHoja, hojaSacar, LBL, clave,
    estado: () => { const o = {}; Object.keys(ACT).forEach((k) => { o[k] = ACT[k].txt; }); return { act: o, hoja: HOJA ? HOJA.cat : "", abierto: !!$("sfOv") }; } };
})();
