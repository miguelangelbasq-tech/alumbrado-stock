(function () {
  "use strict";
  // v185 · La Calculadora por rubros, opción A (Ángel 19/11/2026: «VAMOS CON LA A»).
  // Pestañas Obra · Columnas · Luminarias · Eléctrico · Civil · PAT · Resultado (barrio: Obra · Luminarias y postes ·
  // Red aérea · Alimentación y tablero · PAT de red · Resultado), cada una con su puntito (verde = completo, naranja = revisar).
  // Las tarjetas y campos de siempre NO se rearman: se marcan con su rubro (data-r185) y se muestran las de la pestaña
  // (el esquema de tierra se MUEVE a la tarjeta de PAT: el mismo nodo, mismo id). calcular(), restaurarFormulario,
  // __calcEditar, el asistente (aplicarCambiosForm), los tipos de luminaria de la v183 y el acordeón siguen igual.
  // Barra de abajo = la #calcFlotante de siempre (mismo «Calcular»), con materiales, módulos K, avisos y ⚡ Cálculos rápidos.
  // En la compu, al lado de cada pestaña, «Lo que sale de este rubro» (del último cálculo) y el Resultado por rubro con
  // «✎ Cambiar». Apagado con window.__v185No (la Calculadora de antes).
  if (window.__v185No) return;
  const $ = (id) => document.getElementById(id);
  const esc = (t) => (typeof escHtml == "function" ? escHtml(String(t == null ? "" : t)) : String(t == null ? "" : t).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]));
  const f = (n, d) => { try { return typeof fmt == "function" ? fmt(n, d) : String(n); } catch (e) { return String(n); } };
  const PLAZA = [{ k: "obra", ico: "🏗", t: "Obra" }, { k: "col", ico: "🗼", t: "Columnas" }, { k: "lum", ico: "💡", t: "Luminarias" }, { k: "ele", ico: "⚡", t: "Eléctrico" }, { k: "civ", ico: "🧱", t: "Civil" }, { k: "pat", ico: "🌍", t: "PAT" }];
  const BARRIO = [{ k: "bobra", ico: "🏘", t: "Obra" }, { k: "blum", ico: "💡", t: "Luminarias y postes" }, { k: "bred", ico: "🔌", t: "Red aérea" }, { k: "btab", ico: "🗄", t: "Alimentación y tablero" }, { k: "bpat", ico: "🌍", t: "PAT de red" }];
  const RES = { k: "res", ico: "📦", t: "Resultado" };
  // qué tarjeta va en qué pestaña (por id; la de «Datos de la obra» no tiene id: es la primera de la columna)
  const CARDS = {
    obra: ["@datos", "cardProvision", "calcLimpiarBtn"], col: ["cardColumnas", "cardExistentes", "cardRetiros"], lum: ["cardVinculos"],
    ele: ["cardCableado", "cardTablero", "cardTabElem", "cardEmpalmes"], civ: ["cardCivil", "cardCruce"], pat: ["r185Pat"],
    bobra: ["@datos", "@aviso", "cardBRet", "calcLimpiarBtn"], blum: ["cardBCa", "cardBCs", "cardBLum", "cardBApo", "cardBCon"], bred: ["cardBTen", "cardBTr"], btab: ["cardBTab", "cardBTt"], bpat: ["cardBPat"]
  };
  // las «Incluir esta tarea» de cada pestaña (sin ninguna prendida, la pestaña va sin puntito)
  const TOG = {
    col: ["toggleColumnas", "toggleExistentes", "toggleRetiros"], lum: ["toggleVinculos"], ele: ["toggleCableado", "toggleTablero", "toggleTabElem", "toggleEmpalmes"],
    civ: ["toggleCivil", "toggleCruce"], pat: ["toggleTablero", "toggleColumnas", "toggleExistentes"],
    blum: ["b_tgCa", "b_tgCs", "b_tgLum", "b_tgApo"], bred: ["b_tgTen", "b_tgTr"], btab: ["b_tgTab", "b_tgTt"], bpat: ["b_tgPat"]
  };
  const st = { tab: { plaza: "obra", barrio: "bobra" }, sub: "rub", res: null, resModo: "", dirty: false, ok: false, resTs: 0, k: null, modoVisto: "", abTab: "", ab: [], uU: undefined, uP: undefined };
  try { const v = JSON.parse(sessionStorage.getItem("ema.calc.rubro") || "null"); v && v.plaza && (st.tab.plaza = v.plaza); v && v.barrio && (st.tab.barrio = v.barrio); } catch (e) { }
  const modo = () => { try { return typeof window.calcModoActual == "function" && window.calcModoActual() === "barrio" ? "barrio" : "plaza"; } catch (e) { return "plaza"; } };
  const lista = () => (modo() === "barrio" ? BARRIO : PLAZA).concat([RES]);
  const tabAct = () => { const m = modo(), t = st.tab[m]; return lista().some((x) => x.k === t) ? t : lista()[0].k; };
  const vista = () => $("viewCalculadora");
  const grid = () => { const v = vista(); return v && v.querySelector(":scope > .grid"); };
  const colForm = () => { const g = grid(); return g && g.children[0]; };
  const colDer = () => { const r = $("resultCard"); return r && r.parentElement; };
  const on = () => { const v = vista(); return !!(v && v.classList.contains("r185")); };
  const def = (k) => lista().find((x) => x.k === k) || RES;

  // ---------------------------------------------------------------- armado
  function datosCard() { const c = colForm(); if (!c) return null; const o = $("obraNombre"); return o && o.closest(".card"); }
  function nodo(x) {
    if (x === "@datos") return datosCard();
    if (x === "@aviso") { const c = colForm(); return c && c.querySelector(":scope > .cb-aviso"); }
    return $(x);
  }
  function armarPat() {
    if ($("r185Pat")) return;
    const sel = $("esquemaTierra"), c = colForm(); if (!sel || !c) return;
    const d = document.createElement("div");
    d.className = "card cb-solo-plaza"; d.id = "r185Pat";
    d.innerHTML = `<div class="card-header-row"><h2><span class="dot"></span>Puesta a tierra <span class="h2-sub">esquema · jabalinas · cable verde-amarillo · tomacables</span></h2></div>
<div class="r185-patbox"></div>
<div class="hint" style="margin-top:12px;">Las <b>jabalinas</b>, el <b>cable verde-amarillo 1×10</b>, los <b>tomacables</b> y las punteras salen solos de las otras pestañas: en <b>PRFV</b> una jabalina al final de cada circuito más una por tablero; en <b>metálica</b> una por columna más el tablero. La medición (ítem 81) va una por jabalina. Se cargan en <b>Columnas</b>, <b>Eléctrico</b> (circuitos y tableros) y en «¿Quién pone el material?» de <b>Obra</b> (jabalinas y verde-amarillo).</div>`;
    const box = d.querySelector(".r185-patbox"), lab = document.querySelector('label[for="esquemaTierra"]'), hint = $("esquemaHint");
    lab && box.appendChild(lab); box.appendChild(sel); hint && box.appendChild(hint);
    lab && (lab.style.marginTop = "0");
    const ref = $("cardProvision"); ref && ref.parentElement === c ? c.insertBefore(d, ref) : c.appendChild(d);
  }
  function armar() {
    const v = vista(), g = grid(), c = colForm(), dc = datosCard(); if (!v || !g || !c || !dc || !$("resultCard") || !$("calcFlotante")) return false;
    armarPat();
    v.classList.add("r185");
    // arriba: Plaza / Barrio (el mismo selector de calcBarrio, movido) + pestañas
    if (!$("r185Top")) {
      const top = document.createElement("div"); top.id = "r185Top"; top.className = "no-print";
      top.innerHTML = '<div class="r185-modo"></div><div class="r185-tabs" id="r185Tabs" role="tablist" aria-label="Rubros del cálculo"></div>';
      v.insertBefore(top, g);
    }
    const cm = document.querySelector("#viewCalculadora .cb-modo"), dest = $("r185Top").querySelector(".r185-modo");
    cm && cm.parentElement !== dest && dest.appendChild(cm);
    // marcar las tarjetas con su rubro
    Object.keys(CARDS).forEach((k) => CARDS[k].forEach((x) => {
      const e = nodo(x); if (!e) return;
      const l = (e.dataset.r185 || "").split(" ").filter(Boolean); l.indexOf(k) < 0 && (l.push(k), e.dataset.r185 = l.join(" "));
    }));
    [...c.children].forEach((e) => { if (e.tagName === "BUTTON" && !e.dataset.r185 && (e.id === "b_calcBtn" || /calcular\(\)/.test(e.getAttribute("onclick") || ""))) e.dataset.r185 = "-"; });
    // navegación ‹ › al pie de la columna
    if (!$("r185Nav")) { const n = document.createElement("div"); n.id = "r185Nav"; n.className = "r185-nav no-print"; c.appendChild(n); }
    else if (c.lastElementChild !== $("r185Nav")) c.appendChild($("r185Nav"));
    // a la derecha: lo que sale del rubro (compu) y el resultado por rubro
    const d = colDer();
    if (d && !$("r185Prev")) { const p = document.createElement("div"); p.id = "r185Prev"; p.className = "card no-print"; d.insertBefore(p, d.firstChild); }
    if (d && !$("r185Res")) { const p = document.createElement("div"); p.id = "r185Res"; p.className = "no-print"; d.insertBefore(p, $("resultCard")); }
    // la barra de abajo: la #calcFlotante de siempre + los números + ⚡
    const cf = $("calcFlotante");
    if (cf && !$("r185Bar")) {
      const b = document.createElement("div"); b.id = "r185Bar"; b.className = "r185-bar"; b.setAttribute("role", "status");
      cf.insertBefore(b, cf.firstChild);
      const r = document.createElement("button"); r.type = "button"; r.className = "r185-rap btn-ghost"; r.id = "r185Rap"; r.title = "Cálculos rápidos"; r.innerHTML = '⚡<span class="r185-rapt"> Cálculos rápidos</span>';
      cf.insertBefore(r, b.nextSibling);
      cf.setAttribute("aria-hidden", "false");
    }
    st.ok = true;
    return true;
  }

  // ---------------------------------------------------------------- rubro de cada sección del cómputo
  function rubroDe(t, barrio) {
    t = String(t || "").toUpperCase();
    if (barrio) {
      if (/PUESTA A TIERRA/.test(t)) return "bpat";
      if (/RETIRO/.test(t)) return "bobra";
      if (/TABLERO/.test(t)) return "btab";
      if (/TENDIDO|TRANSICI/.test(t)) return "bred";
      return "blum";
    }
    if (/PUESTA A TIERRA/.test(t)) return "pat";
    if (/^OBRA CIVIL|CRUCE/.test(t)) return "civ";
    if (/LUMINARIA|CAJAS DE CONEXI|TABLERO DE COLUMNA|V[IÍ]NCULO/.test(t)) return "lum";
    if (/CABLEADO|TABLERO|EMPALME|MEDICI/.test(t)) return "ele";
    if (/COLUMNA|PINTURA|RETIRO/.test(t)) return "col";
    return "obra";
  }
  function rubroAviso(t, barrio) {
    t = String(t || "").replace(/<[^>]*>/g, "");
    if (barrio) return /tierra|jabalina/i.test(t) ? "bpat" : /tablero/i.test(t) ? "btab" : /tendido|preensamblado|piloto|vano|transici/i.test(t) ? "bred" : /luminaria|poste|apoyo|columna|brazo/i.test(t) ? "blum" : "bobra";
    return /zanja|fundaci|hormig|cruce|base de/i.test(t) ? "civ" : /tierra|jabalina|\bPAT\b|dispersor/i.test(t) ? "pat" : /luminaria|v[ií]nculo|potencia|artefacto|bornera|BPN|fusible/i.test(t) ? "lum" : /cable|circuito|tablero|acometida|calibre|ganancia/i.test(t) ? "ele" : /columna/i.test(t) ? "col" : "obra";
  }
  const esNota = (x) => /^\s*—/.test(String(x.desc || "")) || x.cant === "—" || x.cant == null;
  const esAviso = (x) => /^\s*⚠/.test(String(x.desc || "").replace(/<[^>]*>/g, ""));
  const corto = (x) => { try { return x.corto || (typeof nombreCortoMaterial == "function" ? nombreCortoMaterial(x.desc) : String(x.desc || "").replace(/<[^>]*>/g, "").split(" — ")[0]); } catch (e) { return String(x.desc || ""); } };
  // el último cálculo, por rubro
  function porRubro() {
    const R = st.res; if (!R) return null;
    const barrio = st.resModo === "barrio", o = {};
    (R.secciones || []).forEach((s) => {
      const k = rubroDe(s.titulo, barrio), r = o[k] || (o[k] = { mats: [], avisos: [], notas: [], secs: [] });
      r.secs.push(s.titulo);
      (s.items || []).forEach((x) => { if (esAviso(x)) r.notas.push(String(x.desc || "").replace(/<[^>]*>/g, "").replace(/^\s*⚠\s*/, "")); else if (!esNota(x)) r.mats.push(x); });
    });
    (R.alertas || []).forEach((a) => { const k = rubroAviso(a, barrio), r = o[k] || (o[k] = { mats: [], avisos: [], notas: [], secs: [] }); r.avisos.push(String(a).replace(/<[^>]*>/g, "")); });
    return o;
  }
  function cuentas() {
    const R = st.res; if (!R) return null;
    let mats = 0, notas = 0; const av = (R.alertas || []).length;
    (R.secciones || []).forEach((s) => (s.items || []).forEach((x) => { esAviso(x) ? notas++ : !esNota(x) && mats++; }));
    return { mats, av, notas };
  }
  // módulos K del itemizado que da este cómputo (lo mismo que «📥 Del cálculo de la obra»); barrio: sin itemizado todavía
  function modulosK(R) {
    if (!R || st.resModo === "barrio" || typeof window.epecPreviaDe != "function" || typeof window.epecItemK != "function") return null;
    const arr = Array.isArray(window.historialCompartido) ? window.historialCompartido : (typeof historial != "undefined" ? historial : null);
    if (!arr) return null;
    const nom = "__R185__" + Date.now(), ult = arr.filter((x) => x && x.nombre === R.nombre).sort((a, b) => (b.ts || 0) - (a.ts || 0))[0];
    const e = { nombre: nom, id: "", secciones: R.secciones, form: ult && ult.form, ts: Date.now() + 1e12, provision: R.provision, tipoComputo: "plaza" };
    arr.push(e);
    try {
      const pv = window.epecPreviaDe({ id: "__r185", nombre: nom, obraId: "" });
      if (!pv || !pv.filas) return null;
      let k = 0; pv.filas.forEach((x) => { k += (Number(x.cantidad) || 0) * (Number(window.epecItemK(x.item)) || 0); });
      return Math.round(k * 10) / 10;
    } catch (er) { return null; } finally { const i = arr.indexOf(e); i >= 0 && arr.splice(i, 1); }
  }

  // ---------------------------------------------------------------- puntitos
  const chk = (id) => { const e = $(id); return !!(e && e.checked); };
  const num = (id) => { const e = $(id); const v = e ? parseFloat(String(e.value).replace(",", ".")) : 0; return isFinite(v) ? v : 0; };
  function estado(k) {
    if (k === "res") return st.res && st.resModo === modo() ? (st.dirty ? "av" : "ok") : "";
    const t = TOG[k]; if (t && !t.some(chk)) return "";
    let falta = false;
    try {
      if (k === "obra" || k === "bobra") falta = !String(($("obraNombre") || {}).value || "").trim();
      else if (k === "col") { const g = typeof columnaGrupos != "undefined" ? columnaGrupos : []; falta = (chk("toggleColumnas") && !(g.reduce((a, x) => a + (+x.columnas || 0), 0) > 0)) || (chk("toggleExistentes") && !(num("colExistentes") > 0)); const dz = $("tipoColDesync"); dz && dz.style.display !== "none" && dz.textContent.trim() && (falta = true); }
      else if (k === "lum") falta = !(num("vincCantCol") > 0);
      else if (k === "ele") falta = chk("toggleCableado") && !((typeof circuitos != "undefined" ? circuitos : []).some((c) => (c.puntos || []).length));
      else if (k === "blum") falta = !["b_lumCant", "b_apoCant", "b_caSim", "b_caDob", "b_caTri", "b_caCur", "b_csCol", "b_csDob", "b_csTri", "b_csCua"].some((id) => num(id) > 0);
      else if (k === "bred") falta = chk("b_tgTen") && !(String(($("b_tramos") || {}).value || "").length > 2);
      else if (k === "civ") falta = chk("toggleCivil") && !(num("civilCantBases") > 0 || num("civilZanjaMl") > 0 || (typeof civilGrupos != "undefined" && civilGrupos.some((g) => +g.columnas > 0)));
    } catch (e) { }
    if (falta) return "av";
    const pr = st.res && st.resModo === modo() && !st.dirty ? porRubro() : null;
    if (pr && pr[k] && pr[k].avisos.length) return "av";
    return "ok";
  }

  // ---------------------------------------------------------------- pintar
  function pintarTabs() {
    const d = $("r185Tabs"); if (!d) return;
    const a = tabAct();
    const h = lista().map((r) => { const e = estado(r.k); return `<button type="button" class="r185-t${r.k === a ? " on" : ""}${r.k === "res" ? " res" : ""}" role="tab" aria-selected="${r.k === a}" data-r185t="${r.k}" title="${esc(r.t)}${e === "ok" ? " · completo" : e === "av" ? " · para revisar" : r.k !== "res" ? " · no incluida" : ""}"><span class="r185-i" aria-hidden="true">${r.ico}</span><span class="r185-l">${esc(r.t)}</span>${e ? `<i class="r185-d ${e}" aria-hidden="true"></i>` : ""}</button>`; }).join("");
    if (d.__h !== h) {
      d.innerHTML = h; d.__h = h;
      const b = d.querySelector(".r185-t.on");   // la pestaña elegida a la vista, dentro de su propia fila
      if (b && d.scrollWidth > d.clientWidth + 2) { const x = b.offsetLeft - (d.clientWidth - b.offsetWidth) / 2; d.scrollLeft = Math.max(0, x); }
    }
  }
  function tablaMat(m, max) {
    const l = max ? m.slice(0, max) : m;
    return `<table class="r185-tm"><thead><tr><th>Cód.</th><th>Material</th><th class="n">Cant.</th></tr></thead><tbody>${l.map((x) => `<tr><td class="c">${x.cod != null && x.cod !== "" ? esc(x.cod) : "—"}</td><td>${esc(corto(x))}</td><td class="n">${typeof x.cant == "number" ? f(x.cant, Number.isInteger(x.cant) ? 0 : 2) : esc(x.cant)} ${esc(x.un || "")}</td></tr>`).join("")}</tbody></table>`;
  }
  const recorta = (a) => esc(a.length > 220 ? a.slice(0, 217) + "…" : a);
  const notasHtml = (l) => l.length ? `<details class="r185-notas"><summary>${l.length} nota${l.length === 1 ? "" : "s"} para revisar (vienen siempre en el cómputo)</summary>${l.map((a) => `<div class="r185-nt">⚠ ${recorta(a)}</div>`).join("")}</details>` : "";
  const esCel = () => window.matchMedia && window.matchMedia("(max-width:980px)").matches;
  function pintarPrev() {
    const p = $("r185Prev"); if (!p) return;
    const k = tabAct(); if (k === "res") return;
    const r = def(k), pr = st.res && st.resModo === modo() ? porRubro() : null, x = pr && pr[k];
    let h = `<div class="r185-ph"><b>Lo que sale de ${r.ico} ${esc(r.t)}</b>${x ? `<span class="r185-pill">${x.mats.length} material${x.mats.length === 1 ? "" : "es"}</span>` : ""}</div>`;
    if (!pr) h += `<div class="hint">Todavía no calculaste${st.res ? " con estos datos" : ""}. Tocá <b>«Calcular»</b> abajo y acá vas a ver lo que sale de este rubro.</div>`;
    else if (!x || (!x.mats.length && !x.avisos.length && !x.notas.length)) h += '<div class="hint">De este rubro no sale material con lo que está cargado.</div>';
    else {
      if (x.mats.length) h += esCel() ? `<div class="r185-corto">${x.mats.slice(0, 3).map((m) => `${esc(corto(m))} · <b>${typeof m.cant == "number" ? f(m.cant, Number.isInteger(m.cant) ? 0 : 2) : esc(m.cant)} ${esc(m.un || "")}</b>`).join("<br>")}${x.mats.length > 3 ? `<br><button type="button" class="r185-mas" data-r185t="res">y ${x.mats.length - 3} más ›</button>` : ""}</div>` : tablaMat(x.mats);
      x.avisos.length && (h += x.avisos.slice(0, 4).map((a) => `<div class="r185-al">⚠ ${recorta(a)}</div>`).join(""));
      h += notasHtml(x.notas);
    }
    st.dirty && st.res && (h += '<div class="r185-sucio">Cambió algo desde el último cálculo: tocá «Calcular» para ver lo nuevo.</div>');
    if (p.__h !== h) { p.innerHTML = h; p.__h = h; }
  }
  function pintarRes() {
    const p = $("r185Res"); if (!p) return;
    const R = st.res && st.resModo === modo() ? st.res : null, c = R ? cuentas() : null, pr = R ? porRubro() : null, barrio = modo() === "barrio";
    let h = '<div class="card r185-rh">';
    if (!R) h += '<h2 style="margin:0;"><span class="dot"></span>📦 Resultado</h2><div class="hint">Todavía no calculaste. Completá las pestañas y tocá <b>«Calcular»</b>.</div></div>';
    else {
      const hora = st.resTs ? new Date(st.resTs).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : "";
      h += `<div class="r185-rht"><h2><span class="dot"></span>📦 Resultado <span class="h2-sub">${esc(R.nombre || "")}${R.id ? " · ID " + esc(R.id) : ""}${hora ? " · calculado " + hora : ""}</span></h2>
<button type="button" class="btn-ghost r185-btn" data-r185a="imprimir">🖨 Imprimir</button></div>
<div class="r185-tiles"><div class="r185-tile"><b>${c.mats}</b><span>materiales</span></div><div class="r185-tile"><b>${barrio ? "—" : st.k == null ? "—" : "≈ " + f(st.k, 1)}</b><span>${barrio ? "sin itemizado de barrio todavía" : "módulos K"}</span></div><div class="r185-tile${c.av ? " am" : ""}"><b>${c.av}</b><span>avisos a confirmar</span></div></div>
${st.dirty ? '<div class="r185-sucio">Cambió algo desde el último cálculo: tocá «Calcular» para ver lo nuevo.</div>' : ""}
<div class="subtabs r185-sub" role="tablist">${[["rub", "Por rubro"], ["hoja", "Hoja completa · itemizado · pañol"], ["av", `Avisos (${c.av})`]].map(([k, t]) => `<button type="button" class="subtab${st.sub === k ? " activo" : ""}" data-r185s="${k}">${esc(t)}</button>`).join("")}</div></div>`;
      if (st.sub === "rub") {
        h += '<div class="r185-resg">';
        (barrio ? BARRIO : PLAZA).forEach((r) => {
          const x = pr[r.k]; if (!x || (!x.mats.length && !x.avisos.length)) return;
          h += `<div class="card r185-rc" data-r185rc="${r.k}"><div class="r185-rch"><b>${r.ico} ${esc(r.t)}</b><span class="r185-pill">${x.mats.length}</span><button type="button" class="btn-ghost r185-btn" data-r185ir="${r.k}">✎ Cambiar</button></div>${x.mats.length ? tablaMat(x.mats) : ""}${x.avisos.map((a) => `<div class="r185-al">⚠ ${recorta(a)}</div>`).join("")}${notasHtml(x.notas)}</div>`;
        });
        h += "</div>";
      } else if (st.sub === "av") {
        const l = []; (barrio ? BARRIO : PLAZA).forEach((r) => ((pr[r.k] || {}).avisos || []).forEach((a) => l.push([r, a])));
        const n = []; (barrio ? BARRIO : PLAZA).forEach((r) => ((pr[r.k] || {}).notas || []).forEach((a) => n.push([r, a])));
        h += `<div class="card">${l.length ? l.map(([r, a]) => `<div class="r185-al"><b>${r.ico} ${esc(r.t)}</b> · ${esc(a)} <button type="button" class="r185-lnk" data-r185ir="${r.k}">✎ Cambiar</button></div>`).join("") : '<div class="hint">Sin avisos de este cálculo.</div>'}${n.length ? `<details class="r185-notas"><summary>${n.length} notas del cómputo para revisar (vienen siempre: normas, criterios)</summary>${n.map(([r, a]) => `<div class="r185-nt"><b>${r.ico} ${esc(r.t)}</b> · ${recorta(a)}</div>`).join("")}</details>` : ""}</div>`;
      }
    }
    if (p.__h !== h) { p.innerHTML = h; p.__h = h; }
    vista().classList.toggle("r185-hoja", !!R && st.sub === "hoja" || !R);
  }
  function pintarBar() {
    const b = $("r185Bar"); if (!b) return;
    const R = st.res && st.resModo === modo() ? st.res : null, c = R ? cuentas() : null, barrio = modo() === "barrio";
    let h;
    if (!R) h = '<span class="r185-bt">Todavía no calculaste esta obra</span>';
    else h = `<span class="r185-bt"><b>${c.mats}</b> materiales <span class="r185-sep">·</span> ${barrio ? "sin itemizado de barrio todavía" : `<b>${st.k == null ? "—" : "≈ " + f(st.k, 1)}</b> mód. K`} <span class="r185-sep">·</span> <span class="r185-av${c.av ? " am" : ""}">⚠ ${c.av}</span></span>`;
    st.dirty && R && (h += '<span class="r185-bs">Cambió algo desde el último cálculo</span>');
    if (b.__h !== h) { b.innerHTML = h; b.__h = h; }
  }
  function pintarNav() {
    const n = $("r185Nav"); if (!n) return;
    const l = lista(), i = l.findIndex((x) => x.k === tabAct()), a = l[i - 1], s = l[i + 1];
    const h = `${a ? `<button type="button" class="btn-ghost" data-r185t="${a.k}">‹ ${a.ico} ${esc(a.t)}</button>` : "<span></span>"}${s ? `<button type="button" class="btn-ghost" data-r185t="${s.k}">${s.ico} ${esc(s.t)} ›</button>` : ""}`;
    if (n.__h !== h) { n.innerHTML = h; n.__h = h; }
  }
  function aplicar() {
    if (!st.ok && !armar()) return;
    const v = vista(), k = tabAct(), c = colForm();
    v.classList.toggle("r185-res", k === "res");
    v.dataset.r185tab = k;
    if (st.abTab !== k) { st.abTab = k; st.ab = []; }
    c && [...c.querySelectorAll(":scope > [data-r185]")].forEach((e) => {
      const ve = e.dataset.r185.split(" ").indexOf(k) >= 0;
      e.classList.contains("r185-ve") !== ve && e.classList.toggle("r185-ve", ve);
      // al entrar a la pestaña, sus tarjetas se abren una vez (en el celu son acordeón; se pueden volver a cerrar tocando el título)
      if (ve && e.classList.contains("acordeon") && st.ab.indexOf(e) < 0) { st.ab.push(e); if (!e.classList.contains("acc-abierta")) { e.classList.add("acc-abierta"); e._accPintar && e._accPintar(); } }
    });
    pintarTabs(); pintarNav(); pintarPrev(); pintarRes(); pintarBar();
  }
  function irTab(k, sinScroll) {
    const m = modo(); if (!lista().some((x) => x.k === k)) return;
    k === tabAct() && (st.abTab = "");   // tocar la pestaña en la que estás vuelve a abrir sus tarjetas
    st.tab[m] = k;
    try { sessionStorage.setItem("ema.calc.rubro", JSON.stringify(st.tab)); } catch (e) { }
    aplicar();
    if (!sinScroll) { const t = $("r185Top"); if (t) { const y = t.getBoundingClientRect().top + window.scrollY - 70; window.scrollY > y && window.scrollTo({ top: Math.max(0, y), behavior: "auto" }); } }
  }
  // ¿en qué pestaña está este elemento?
  function tabDe(el) {
    if (!el || !el.closest) return null;
    if (el.closest("#resultCard") || el.id === "resultCard") return "res";
    const c = colForm(); if (!c || !c.contains(el) || el === c) return null;
    let x = el; while (x && x.parentElement !== c) x = x.parentElement;
    if (!x || !x.dataset || !x.dataset.r185 || x.dataset.r185 === "-") return null;
    const l = x.dataset.r185.split(" "), mios = lista().map((y) => y.k);
    return l.find((y) => mios.indexOf(y) >= 0) || null;
  }
  function irA(el) {
    if (!on() || !el) return;
    const k = tabDe(el); if (!k) return;
    if (k === "res") st.sub = "hoja";
    if (k !== tabAct() || k === "res") irTab(k, true);
  }

  // ---------------------------------------------------------------- resultado nuevo, cambios en el formulario
  function nuevoResultado() {
    // lo último que se dibujó: un cálculo nuevo (ultimoResultado) o un cómputo del historial («Ver»: __computoParaAlta)
    let U = null; try { U = typeof ultimoResultado != "undefined" ? ultimoResultado : null; } catch (e) { U = null; }
    const P = window.__computoParaAlta || null, R = U !== st.uU ? U : P && P !== st.uP && P.secciones ? P : st.res;
    st.uU = U; st.uP = P;
    const rc = $("resultCard"), vacio = !rc || !!rc.querySelector(".empty-state");
    if (vacio || !R) { st.res = null; st.k = null; aplicar(); return; }
    if (R !== st.res) { st.res = R; st.resModo = R.tipoComputo === "barrio" ? "barrio" : "plaza"; st.resTs = R === U ? Date.now() : (+R.ts || Date.parse(R.fecha || "") || Date.now()); st.dirty = false; st.k = modulosK(R); }
    aplicar();
  }
  let tPin = 0;
  const luego = () => { clearTimeout(tPin); tPin = setTimeout(() => { try { aplicar(); } catch (e) { } }, 250); };
  function enganchar() {
    const rc = $("resultCard");
    rc && window.MutationObserver && new MutationObserver(() => { setTimeout(nuevoResultado, 0); }).observe(rc, { childList: true });
    const c = colForm();
    const sucio = (e) => { if (e.target && e.target.closest && e.target.closest("#calcLimpiarBtn")) return; st.res && (st.dirty = true); luego(); };
    c && (c.addEventListener("input", sucio), c.addEventListener("change", sucio));
    document.addEventListener("click", (e) => {
      const t = e.target.closest && e.target.closest("[data-r185t], [data-r185ir], [data-r185s], [data-r185a], #r185Rap, .cb-modo [data-modo]");
      if (!t || !on()) return;
      if (t.matches(".cb-modo [data-modo]")) { setTimeout(aplicar, 0); return; }
      if (t.id === "r185Rap") { const r = document.querySelector('#subtabsCalc [data-sub]:not([data-sub="computo"])'); r && r.click(); return; }
      if (t.dataset.r185a === "imprimir") { typeof imprimirComputo == "function" ? imprimirComputo("completo") : window.print(); return; }
      if (t.dataset.r185s) { st.sub = t.dataset.r185s; aplicar(); return; }
      irTab(t.dataset.r185t || t.dataset.r185ir);
    });
    // «Calcular» de la barra: el de siempre (calcular() → plaza o barrio) y, si salió, el Resultado
    document.addEventListener("click", (e) => {
      const b = e.target.closest && e.target.closest("#calcFlotante .cf-calc"); if (!b || !on()) return;
      e.stopPropagation(); e.preventDefault();
      const antes = st.res;
      try { window.calcular(); } catch (er) { console.warn("[v185 calcular]", er); }
      setTimeout(() => { nuevoResultado(); if (st.res && st.res !== antes) { st.sub = "rub"; irTab("res"); } }, 30);
    }, true);
  }
  // lo que lleva a un campo o a una tarjeta (validaciones, «Editar» del historial, el asistente, «↓ Resultado») abre su pestaña
  function envolver() {
    const si = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function () { try { this && this.closest && this.closest("#viewCalculadora") && irA(this); } catch (e) { } return si.apply(this, arguments); };
    const fo = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function () { try { this && this.closest && this.closest("#viewCalculadora .grid") && irA(this); } catch (e) { } return fo.apply(this, arguments); };
    const ab = window.__abrirSeccionCalculo;
    if (typeof ab == "function") { const n = function (id) { try { irA($(id)); } catch (e) { } return ab.apply(this, arguments); }; window.__heredar && window.__heredar(n, ab); window.__abrirSeccionCalculo = n; }
    const mp = window.calcModoPoner;
    if (typeof mp == "function") { const n = function () { const r = mp.apply(this, arguments); setTimeout(aplicar, 0); return r; }; window.__heredar && window.__heredar(n, mp); window.calcModoPoner = n; }
  }
  function tic() {
    if (!st.ok) { if (armar()) { enganchar(); envolver(); nuevoResultado(); } return; }
    const v = vista(); if (!v || v.style.display === "none") return;
    armar();
    const m = modo(); if (m !== st.modoVisto) { st.modoVisto = m; }
    aplicar();
  }
  function arrancar() {
    if (!armar()) { setTimeout(arrancar, 400); return; }
    enganchar(); envolver(); st.modoVisto = modo(); nuevoResultado();
    setInterval(() => { try { tic(); } catch (e) { } }, 1500);
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => setTimeout(arrancar, 0)) : setTimeout(arrancar, 0);
  window.__calc185 = { ir: irTab, tab: tabAct, estado, rubroDe, porRubro, cuentas, modulosK: () => st.k, aplicar, tabDe, estadoInterno: () => ({ tab: tabAct(), sub: st.sub, dirty: st.dirty, res: !!st.res, k: st.k, modo: modo() }) };
})();
