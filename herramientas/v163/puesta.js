  // ============================================================== v163 · ⚡ Poner al día esta obra (Ángel, 15/11: «hay plazas que
  //  ya están completas y solo le falta la última cosa, y no puedo marcar que ya se hizo… La idea es marcar ahora y que luego avance
  //  solo»). Marca en UN paso lo que ya está hecho: columnas (todas o desde/hasta) × pasos, más lo que no va por columna. Solo suma
  //  lo que falta (lo que viene de las órdenes no se toca; las órdenes nuevas siguen sumando encima, una vez). Sin fraguado: ya
  //  estaba hecho. Se guarda en av2.m con una entrada por columna («a<ts>_<columna>» {e:"si", pasos, pd, fragOk}), av2.hist y
  //  avanceHist, por aplicar() como todo lo de antes. «Está toda terminada» = todo hecho de una (también fallas, observadas y
  //  piezas que faltaban). Los papeles (plano, planilla de PAT, certificado, carpeta) siguen yendo por «📄 Documentación».
  function cosasDe(L, sel, toda) {
    if (toda || sel === "todas" || sel === "*" || sel === true) { const m = {}; L.cosas.forEach((x) => { if (!x.doc) m[x.id] = x.tot; }); return m; }
    if (sel && typeof sel == "object" && !Array.isArray(sel)) return sel;
    const m = {};
    arr(Array.isArray(sel) ? sel : String(sel || "").split(/[,;]/)).forEach((s) => {
      s = String(s).trim(); if (!s) return;
      const mm = s.match(/^(.*?)\s*[:=]\s*([\d.,]+)\s*$/), q = mm ? mm[1] : s;
      const x = L.cosas.find((c) => c.id === q || nk(c.label).indexOf(nk(q)) >= 0);
      if (x && !x.doc) m[x.id] = mm ? num(mm[2]) : x.tot;
    });
    return m;
  }
  function planPuesta(spec) {
    spec = spec || {};
    if (off3()) return { err: "No disponible." };
    const o = obraDe(spec.obra) || (spec.obra ? obras().find((x) => nk(x.nombre).indexOf(nk(spec.obra)) >= 0 || String(x.obraId || "") === String(spec.obra)) : null);
    if (!o) return { err: "No encontré la obra." };
    const E = estado(o); if (!E) return { err: "Esa obra no tiene la lista del avance nuevo (sin columnas ni cálculo): se usa el del itemizado." };
    const L = E.L, toda = !!spec.toda, ts = Date.now(), ts36 = ts.toString(36);
    const base = { ts, por: yoMail(), porNombre: yoNombre(), motivo: String(spec.motivo || ""), pd: 1 };
    if (spec.porAsistente) base.porAsistente = true;
    const hayCosas = spec.cosas != null && spec.cosas !== "" && !(Array.isArray(spec.cosas) && !spec.cosas.length);
    const sinCols = spec.columnas == null || spec.columnas === "";
    const cols = toda ? L.cols.slice() : sinCols ? (hayCosas ? [] : L.cols.slice()) : colsDe(L, spec.columnas);
    const pasos = toda || spec.pasos == null || spec.pasos === "" || spec.pasos === "todo" ? L.pasos.map((p) => p.id) : arr(Array.isArray(spec.pasos) ? spec.pasos : String(spec.pasos).split(/[,;]/)).map(pasoDe).filter((p) => p && L.pasos.some((q) => q.id === p));
    const cambios = [], filas = [];
    let celdas = 0, nCols = 0, nCosas = 0, piezas = 0, fallas = 0;
    const nomP = (p) => PASO[p].t.toLowerCase().replace(/\.$/, "");
    cols.forEach((c) => {
      const i = c.i, l = [];
      pasos.forEach((p) => { const r = E.R[p + "|" + i]; if (!r) return; if (r.e === "falta" || (toda && (r.e === "falla" || r.e === "obs"))) { l.push(p); if (r.e !== "falta") fallas++; } });
      if (toda) (c.faltan || []).forEach((z) => { piezas++; cambios.push({ key: kPz(c, z.id), val: Object.assign({}, base, { e: "ok", cant: 0 }), txt: `${c.num}: ${z.t} → ya está` }); });
      if (!l.length) return;
      celdas += l.length; nCols++;
      cambios.push({ key: "a" + ts36 + "_" + c.key, val: Object.assign({}, base, { e: "si", pasos: l.join(","), fragOk: true }), txt: `${c.num}: ${l.map(nomP).join(", ")} → hecho (puesta al día)` });
      filas.push({ c: c.num, a: "falta " + l.map(nomP).join(", "), d: "hecho (puesta al día)" });
    });
    const CM = cosasDe(L, spec.cosas, toda);
    Object.keys(CM).forEach((id) => {
      const x = L.cosas.find((c) => c.id === id); if (!x || x.doc) return;
      const r = E.RC[x.id]; if (r.estado === "nolleva") return;
      const roto = r.estado === "falla" || r.estado === "obs";
      if (roto && !toda) return;
      const meta = x.bin ? 1 : Math.min(x.tot, Math.max(0, num(CM[id])));
      if (!roto && meta <= r.h + 1e-9) return;
      nCosas++;
      const a = roto ? EST[r.estado][0] : x.bin ? "falta" : fN(r.h) + " de " + fN(x.tot) + " " + x.un, d = x.bin ? "hecho" : fN(meta) + " de " + fN(x.tot) + " " + x.un;
      cambios.push({ key: kCosa(x.id), val: Object.assign({}, base, { e: "cant", cant: meta }), txt: `${x.label}: ${a} → ${d} (puesta al día)` });
      filas.push({ c: x.label, a, d });
    });
    const docsFalta = L.cosas.filter((x) => x.doc && E.RC[x.id].estado !== "nolleva" && E.RC[x.id].h < x.tot).map((x) => x.label);
    if (!cambios.length) return { err: "Eso ya figura hecho: no hay nada para poner al día.", nada: true, o, E, docsFalta, antes: E.pct };
    const m2 = Object.assign({}, obj(obj(o.av2).m)); cambios.forEach((c) => { m2[c.key] = c.val; });
    const sim = intentar(() => calcular(Object.assign({}, o, { av2: Object.assign({}, obj(o.av2), { m: m2 }) })), null);
    const despues = sim ? sim.pct : E.pct;
    filas.unshift({ c: "Avance de la obra", a: E.pct + " %", d: despues + " %" });
    if (docsFalta.length) filas.push({ c: "Papeles (van por «📄 Documentación»)", a: "faltan " + docsFalta.length, d: "sin cambio" });
    return { o, E, cambios, avisos: [], filas, n: nCols, puesta: true, toda, antes: E.pct, despues, celdas, nCols, nCosas, piezas, fallas, docsFalta };
  }
  // ---------- la hoja
  let PD = null;
  function pdInicial(o, E) { const pa = {}; E.L.pasos.forEach((p) => { pa[p.id] = true; }); return { id: String(o.id), todas: true, desde: 0, hasta: Math.max(0, E.L.cols.length - 1), pasos: pa, cosas: {}, toda: false, mot: "Puesta al día del avance" }; }
  function hojaPuesta(id) {
    const o = obraDe(id), E = estado(o); if (!o || !E || !puede() || off3()) return;
    if (!PD || PD.id !== String(o.id)) PD = pdInicial(o, E);
    H = { tipo: "pd", id: o.id };
    const L = E.L, n = L.cols.length;
    const opc = (sel) => L.cols.map((c, i) => `<option value="${i}"${i === sel ? " selected" : ""}>${esc(c.num)}</option>`).join("");
    const colsH = n ? `<div class="a2-et">Columnas</div><div class="a2-pdsel"><label class="a2-pdck"><input type="radio" name="pdCols" value="todas"${PD.todas ? " checked" : ""}> Todas (${n})</label><label class="a2-pdck"><input type="radio" name="pdCols" value="rango"${PD.todas ? "" : " checked"}> Desde</label><select id="pdDesde" aria-label="Desde la columna">${opc(PD.desde)}</select><span class="a2-pdh">hasta</span><select id="pdHasta" aria-label="Hasta la columna">${opc(PD.hasta)}</select></div>` : "";
    const todoP = L.pasos.every((p) => PD.pasos[p.id]);
    const pasosH = n ? `<div class="a2-et">Qué está hecho en esas columnas</div><div class="a2-chips a2-pdpre"><button type="button" class="chip" data-a2="pdPreset" data-v="civil">Solo pozo y hormigón</button><button type="button" class="chip" data-a2="pdPreset" data-v="izaje">Hasta el izaje</button><button type="button" class="chip" data-a2="pdPreset" data-v="todo">Todo</button><button type="button" class="chip" data-a2="pdPreset" data-v="nada">Nada</button></div><div class="a2-pdsel"><label class="a2-pdck a2-pdtodo"><input type="checkbox" id="pdPasoTodo"${todoP ? " checked" : ""}> <b>Todo</b></label>${L.pasos.map((p) => `<label class="a2-pdck"><input type="checkbox" class="pd-paso" data-p="${p.id}"${PD.pasos[p.id] ? " checked" : ""}> ${esc(p.l.replace(/ \(.*\)/, "").replace(/ de fundación| de la columna| con sus brazos/, ""))}</label>`).join("")}</div>` : "";
    const filasK = L.cosas.filter((x) => !x.doc).map((x) => {
      const r = E.RC[x.id], hecho = r.h >= x.tot && !r.estado;
      if (r.estado === "nolleva") return `<div class="a2-pdk nl"><span>${esc(x.label)}</span><small>no lleva</small></div>`;
      if (hecho) return `<div class="a2-pdk ok"><span>✓ ${esc(x.label)}</span><small>ya está</small></div>`;
      const v = PD.cosas[x.id], ck = v != null;
      return `<div class="a2-pdk"><label><input type="checkbox" class="pd-k" data-k="${esc(x.id)}"${ck ? " checked" : ""}> <span>${esc(x.label)}${r.estado ? ` <small class="rojo">(${esc(EST[r.estado][0].toLowerCase())})</small>` : ""}</span></label>${x.bin ? `<small>${r.h > 0 ? "en revisión" : "falta"}</small>` : `<span class="a2-pdc"><input type="number" class="pd-kc" data-k="${esc(x.id)}" inputmode="decimal" min="0" max="${x.tot}" value="${ck ? v : x.tot}" aria-label="${esc(x.label)}: cuánto está hecho"><small>de ${fN(x.tot)} ${esc(x.un)}${r.h > 0 ? " (hoy " + fN(r.h) + ")" : ""}</small></span>`}</div>`;
    });
    const faltanK = L.cosas.filter((x) => !x.doc && E.RC[x.id].estado !== "nolleva" && !(E.RC[x.id].h >= x.tot && !E.RC[x.id].estado)).length;
    const todoK = faltanK > 0 && L.cosas.filter((x) => !x.doc && E.RC[x.id].estado !== "nolleva" && !(E.RC[x.id].h >= x.tot && !E.RC[x.id].estado)).every((x) => PD.cosas[x.id] != null);
    const cosasH = `<div class="a2-et">Lo que no va por columna</div>${faltanK ? `<label class="a2-pdck a2-pdtodo"><input type="checkbox" id="pdKTodo"${todoK ? " checked" : ""}> <b>Todo lo que falta (${faltanK})</b></label>` : ""}<details class="a2-pdd"${PD.abiertoK ? " open" : ""}><summary>Elegir una por una (zanja, cable, tablero, acometida, inspecciones…)</summary>${filasK.join("")}</details>`;
    const docs = L.cosas.filter((x) => x.doc && E.RC[x.id].estado !== "nolleva" && E.RC[x.id].h < x.tot).map((x) => x.label);
    const docsH = docs.length ? `<div class="a2-nt">📄 Los papeles (${esc(docs.join(", ").toLowerCase())}) van por «📄 Documentación» del legajo. <button type="button" class="a2-link" data-a2="doc">Abrir Documentación</button></div>` : "";
    hoja(cab("⚡ Poner al día esta obra", `${esc(nombreObra(o))} · hoy ${E.pct} %`)
      + `<div class="a2-txt a2-pd"><p>Marcá de una lo que <b>ya está hecho</b> y no se cargó. Solo se suma lo que falta: lo que viene de las órdenes no se toca, y de acá en adelante las órdenes siguen moviendo el avance solas. <b>No fragua</b> (ya estaba hecho).</p></div>`
      + `<button type="button" class="btn-primary a2-big" data-a2="pdToda">🏁 Está toda terminada</button>`
      + `<div class="a2-pd">${colsH}${pasosH}${cosasH}${docsH}<label for="pdMot" class="a2-lbl">Motivo (obligatorio, queda en el historial)</label><input id="pdMot" type="text" maxlength="200" autocomplete="off" value="${esc(PD.mot)}"></div>`
      + `<div class="a2-pdpie"><div class="a2-pdres" id="pdRes" role="status" aria-live="polite"></div><div class="a2-acc"><button type="button" class="btn-ghost" data-a2="x">Cancelar</button><button type="button" class="btn-primary" id="pdSi" data-a2="pdSi">Sí, marcar</button></div></div>`, () => hojaPuesta(id));
    const ov = $("a2Ov"); if (ov) ov.setAttribute("aria-label", "Poner al día esta obra");
    pdRes();
  }
  function pdSpec(motivo) {
    const E = estado(PD.id); if (!E) return null;
    const L = E.L, a = Math.min(PD.desde, PD.hasta), b = Math.max(PD.desde, PD.hasta);
    const cosas = {}; Object.keys(PD.cosas).forEach((k) => { cosas[k] = PD.cosas[k]; });
    return { obra: PD.id, toda: PD.toda, columnas: PD.todas ? "todas" : L.cols.slice(a, b + 1).map((c) => c.num), pasos: L.pasos.filter((p) => PD.pasos[p.id]).map((p) => p.id), cosas, motivo: motivo == null ? PD.mot : motivo };
  }
  function pdLeer() {
    const ov = $("a2Ov"); if (!PD || !ov || !ov.querySelector(".a2-pd")) return;
    const rad = ov.querySelector('input[name="pdCols"]:checked'); if (rad) PD.todas = rad.value === "todas";
    const d = $("pdDesde"), h = $("pdHasta"); if (d) PD.desde = +d.value; if (h) PD.hasta = +h.value;
    ov.querySelectorAll("input.pd-paso").forEach((x) => { PD.pasos[x.dataset.p] = x.checked; });
    ov.querySelectorAll("input.pd-k").forEach((x) => { const k = x.dataset.k, c = ov.querySelector('input.pd-kc[data-k="' + k + '"]'); if (x.checked) PD.cosas[k] = c ? num(c.value) : 1; else delete PD.cosas[k]; });
    const dd = ov.querySelector("details.a2-pdd"); PD.abiertoK = !!(dd && dd.open);
    const m = $("pdMot"); if (m) PD.mot = m.value;
  }
  function pdRes() {
    const el = $("pdRes"), btn = $("pdSi"); if (!el || !PD) return;
    const P = planPuesta(pdSpec());
    if (P.err) { el.className = "a2-pdres gris"; el.textContent = P.err; if (btn) btn.disabled = true; return; }
    const partes = [];
    if (P.nCols) partes.push(`${P.nCols} ${P.nCols === 1 ? "columna" : "columnas"} (${P.celdas} ${P.celdas === 1 ? "paso" : "pasos"})`);
    if (P.nCosas) partes.push(`${P.nCosas} ${P.nCosas === 1 ? "cosa" : "cosas"} sin columna`);
    if (P.fallas) partes.push(`${P.fallas} ${P.fallas === 1 ? "falla/observada pasa" : "fallas/observadas pasan"} a hecho`);
    if (P.piezas) partes.push(`${P.piezas} ${P.piezas === 1 ? "pieza" : "piezas"} que faltaban`);
    el.className = "a2-pdres";
    el.innerHTML = `<b>${P.antes} % → ${P.despues} %</b><span>${esc(partes.join(" · "))}</span>${P.docsFalta.length && P.despues < 100 ? `<small>Para llegar al 100 % faltan los papeles en «📄 Documentación».</small>` : ""}`;
    if (btn) { btn.disabled = false; btn.textContent = "Sí, marcar" + (P.nCols + P.nCosas > 1 ? " (" + (P.celdas + P.nCosas) + ")" : ""); }
  }
  const PRESET = { civil: ["pozo", "horm", "acab"], izaje: ["pozo", "horm", "acab", "izaje"], todo: null, nada: [] };
  document.addEventListener("click", async (e) => {
    const t = e.target && e.target.closest ? e.target.closest("[data-a2]") : null; if (!t || !t.closest(".a2")) return;
    const a = t.dataset.a2; if (!/^pd/.test(a) || off3()) return;
    if (a === "pdAbrir") { PD = null; return hojaPuesta(st.id); }
    if (!PD) return;
    const E = estado(PD.id); if (!E) return;
    if (a === "pdPreset") { pdLeer(); const l = PRESET[t.dataset.v]; E.L.pasos.forEach((p) => { PD.pasos[p.id] = l == null ? true : l.indexOf(p.id) >= 0; }); PD.toda = false; return hojaPuesta(PD.id); }
    if (a === "pdToda") { pdLeer(); PD.toda = true; PD.todas = true; E.L.pasos.forEach((p) => { PD.pasos[p.id] = true; }); PD.cosas = cosasDe(E.L, "todas"); return hojaPuesta(PD.id); }
    if (a === "pdSi") {
      pdLeer();
      const mot = String(PD.mot || "").trim();
      if (mot.length < 3) { hmsg("Escribí el motivo (queda en el historial).", true); const i = $("pdMot"); i && i.focus(); return; }
      const P = planPuesta(pdSpec(mot)); if (P.err) { hmsg(P.err, true); return; }
      t.disabled = true;
      const r = await aplicar(P, mot);
      if (!r.ok) { t.disabled = false; hmsg(r.txt, true); return; }
      const txt = `Puesta al día: la obra pasó de ${r.antes} % a ${r.despues} %. De acá en adelante se mueve sola con las órdenes.`;
      PD = null; cerrarHoja(); msgPant(txt); avisar(txt); return;
    }
  });
  const pdCambio = (e) => {
    const x = e.target; if (!PD || !x || !x.closest || !x.closest("#a2Ov .a2-pd")) return;
    if (x.id === "pdMot") { PD.mot = x.value; return; }
    if (x.id === "pdDesde" || x.id === "pdHasta") { const r = document.querySelector('#a2Ov input[name="pdCols"][value="rango"]'); if (r) r.checked = true; }
    if (x.id === "pdPasoTodo") document.querySelectorAll("#a2Ov input.pd-paso").forEach((y) => { y.checked = x.checked; });
    if (x.classList.contains("pd-paso")) { const td = $("pdPasoTodo"); if (td) td.checked = [...document.querySelectorAll("#a2Ov input.pd-paso")].every((y) => y.checked); }
    if (x.id === "pdKTodo") document.querySelectorAll("#a2Ov input.pd-k").forEach((y) => { y.checked = x.checked; });
    if (x.classList.contains("pd-kc")) { const ck = document.querySelector('#a2Ov input.pd-k[data-k="' + x.dataset.k + '"]'); if (ck) ck.checked = true; }
    PD.toda = false; pdLeer(); pdRes();
  };
  document.addEventListener("change", pdCambio);
  document.addEventListener("input", (e) => { if (e.target && e.target.classList && e.target.classList.contains("pd-kc")) pdCambio(e); else if (e.target && e.target.id === "pdMot" && PD) PD.mot = e.target.value; });
  document.addEventListener("toggle", (e) => { if (PD && e.target && e.target.classList && e.target.classList.contains("a2-pdd")) PD.abiertoK = e.target.open; }, true);

