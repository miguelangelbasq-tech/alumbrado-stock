(function () {
  "use strict";
  // v183 · Calculadora (Ángel 19/11/2026):
  //  · cable 3×1,5 de subida al artefacto: 4 m en columna de 7 m con brazo de 0,4 m · 7,5 m en columna de 10 m con brazo de 1 m
  //    (lo hace cableSubida183, arriba, junto a cableSubidaPorArtefacto);
  //  · ganancia del troncal: 6 m por subida en columnas de 7 y de 10 m (gananciaPorDefecto);
  //  · luminarias de distinta potencia en la misma obra: tipos de luminaria (potencia + cantidad + producto del pañol)
  //    guardados en el campo escondido #lumTipos183 del formulario (así se guardan con el cómputo y vuelven al editarlo).
  //  Apagado con window.__v183No: todo como la v182.
  if (window.__v183No) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => (typeof escHtml == "function" ? escHtml(String(s == null ? "" : s)) : String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]));
  const f0 = (n, d) => { try { return fmt(n, d == null ? 0 : d); } catch (e) { return String(n); } };
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const COS = 0.95;   // el mismo cos φ de «💡 Consumo» (Cálculos rápidos)
  const FUS_A = 2;    // 2 A por artefacto (§11.3)

  // ---------- estado: el campo escondido del formulario
  function leer() {
    const h = $("lumTipos183");
    let o = null;
    try { o = h && h.value ? JSON.parse(h.value) : null; } catch (e) { o = null; }
    const cod1 = o && o.cod1 !== undefined ? (o.cod1 === "" || o.cod1 == null ? "" : +o.cod1 || "") : 6010;
    const extra = (o && Array.isArray(o.extra) ? o.extra : []).map((x) => ({ w: num(x && x.w), cant: Math.max(0, Math.round(num(x && x.cant))), cod: x && x.cod ? +x.cod || "" : "" }));
    return { cod1, extra };
  }
  function escribir(s) {
    const h = $("lumTipos183"); if (!h) return;
    h.value = s && s.extra && s.extra.length ? JSON.stringify({ v: 1, cod1: s.cod1 === "" ? "" : s.cod1 || 6010, extra: s.extra }) : "";
  }
  const multi = () => leer().extra.length > 0;
  const pot1 = () => num(($("vincPotenciaW") || {}).value);
  function totalLum() {
    try {
      return (typeof vinculoGrupos != "undefined" ? vinculoGrupos : []).reduce((a, g) => {
        const v = (typeof VINCULOS != "undefined" ? VINCULOS : []).find((x) => x.id === g.tipo);
        return a + (v ? (g.columnas || 0) * v.lum : 0);
      }, 0);
    } catch (e) { return 0; }
  }
  // tipos con su cantidad: el primero lleva el resto de las luminarias de los vínculos
  function tipos(total, s) {
    s = s || leer();
    const T = total == null ? totalLum() : total, sumaX = s.extra.reduce((a, x) => a + x.cant, 0);
    const l = [{ w: pot1(), cant: Math.max(0, T - sumaX), cod: s.cod1, primero: true }].concat(s.extra.map((x) => ({ w: x.w, cant: x.cant, cod: x.cod })));
    return { l, total: T, sumaX, pasa: sumaX > T };
  }
  // productos del pañol que son luminarias (familia 6); nunca se inventa un código
  function productos() {
    let l = [];
    try { l = (typeof catalogoCompleto == "function" ? catalogoCompleto() : []).filter((p) => p && p.codigo >= 6000 && p.codigo < 7000 && p.activo !== false && /lumin/i.test(p.desc || "")); } catch (e) { l = []; }
    return l.sort((a, b) => a.codigo - b.codigo);
  }
  const prodDe = (cod) => productos().find((p) => p.codigo === +cod) || null;
  function selProd(cod, attr) {
    const l = productos(), hay = cod && l.some((p) => p.codigo === +cod);
    return `<select ${attr} aria-label="Producto del pañol"><option value="">— elegí el producto del pañol (a confirmar) —</option>${l.map((p) => `<option value="${p.codigo}" ${+cod === p.codigo ? "selected" : ""}>${p.codigo} · ${esc(String(p.desc).slice(0, 60))}</option>`).join("")}${cod && !hay ? `<option value="${+cod}" selected>${+cod} · (no está en el catálogo)</option>` : ""}</select>`;
  }
  // ---------- cuentas eléctricas (las mismas de «💡 Consumo»)
  function electrico(l) {
    const W = l.reduce((a, t) => a + t.w * t.cant, 0), kw = W / 1e3;
    return { W, kw, mono: W / (220 * COS), tri: W / (Math.sqrt(3) * 380 * COS), maxW: Math.max(0, ...l.map((t) => t.cant > 0 ? t.w : 0)), topeFus: FUS_A * 220 * COS };
  }
  const txtTipos = (l) => l.filter((t) => t.cant > 0).map((t) => `${t.cant} × ${f0(t.w, 0)} W`).join(" + ") || "—";

  // ---------- material: un renglón por potencia (lo llama calcular() en vez del único 6010)
  function lineas(Le) {
    const T = tipos(Le), out = [];
    T.l.forEach((t) => {
      if (!(t.cant > 0)) return;
      const W = `LED ${f0(t.w, 0)} W`;
      let z = null;
      if (t.cod) { try { z = M(+t.cod, "montaje, conexionado y energización"); } catch (e) { z = null; } }
      if (z && +t.cod === 6010) {
        const U = z.corto.replace(/\bLED\b/, W);
        out.push(Object.assign({}, z, { corto: U, desc: U + " — montaje, conexionado y energización", cant: t.cant, un: "Un.", ref: "Provista por la Municipalidad (s/ETG)", pot183: t.w }));
      } else if (z) {
        const U = `Luminaria vial ${W} — producto ${t.cod} «${z.corto}»`;
        out.push(Object.assign({}, z, { corto: U, desc: U + " — montaje, conexionado y energización", cant: t.cant, un: "Un.", ref: "Provista por la Municipalidad (s/ETG)", pot183: t.w }));
      } else out.push({ desc: `Luminaria vial ${W} — <b>elegí el producto del pañol (a confirmar)</b> — montaje, conexionado y energización`, cant: t.cant, un: "Un.", ref: "Sin código de pañol · a confirmar", pot183: t.w });
    });
    if (T.pasa) out.push({ desc: `⚠ <b>Las otras potencias suman ${T.sumaX} luminarias y los vínculos dan ${T.total}.</b> Revisá las cantidades en «Vínculos y luminarias»: la primera potencia quedó en 0.`, cant: "—", un: "—", ref: "Potencias" });
    const E = electrico(T.l);
    out.push({ desc: `ℹ <b>Luminarias de distinta potencia:</b> ${txtTipos(T.l)} = <b>${f0(E.kw, 2)} kW</b> instalados · ${f0(E.mono, 1)} A si va todo en monofásico 220 V · ${f0(E.tri, 1)} A por fase en trifásico 380 V parejo (cos φ 0,95, como «💡 Consumo»).${E.maxW > E.topeFus ? ` <b>⚠ Una luminaria de ${f0(E.maxW, 0)} W pasa lo que aguanta el fusible de 2 A por artefacto (≈ ${f0(E.topeFus, 0)} W): revisá el fusible (a confirmar).</b>` : ""} Para la caída de tensión cargá la potencia de cada columna en «⚡ Cables».`, cant: "—", un: "—", ref: "Consumo" });
    return out;
  }

  // ---------- pantalla (dentro de «Vínculos y luminarias», debajo de la potencia)
  function resHtml(s) {
    const T = tipos(null, s), E = electrico(T.l);
    return `${T.pasa ? `<b>⚠ Las otras potencias suman ${T.sumaX} y los vínculos dan ${T.total} luminarias.</b> ` : ""}Total <b>${T.total}</b> luminarias: ${txtTipos(T.l)} = <b>${f0(E.kw, 2)} kW</b> · ${f0(E.mono, 1)} A en 220 V · ${f0(E.tri, 1)} A por fase en 380 V (cos φ 0,95).${E.maxW > E.topeFus ? ` <b>⚠ ${f0(E.maxW, 0)} W pasa lo que aguanta el fusible de 2 A (≈ ${f0(E.topeFus, 0)} W): a confirmar.</b>` : ""}${T.l.some((t) => t.cant > 0 && !t.cod) ? " <b>Falta elegir el producto del pañol de alguna potencia (a confirmar).</b>" : ""} <button type="button" class="lum183-link" data-l183="consumo">Ver en 💡 Consumo</button>`;
  }
  // al tipear: solo la cantidad de la primera y el resumen (la fila que se escribe no se rearma)
  function parcial() {
    const box = $("lum183"); if (!box) return;
    const s = leer(), T = tipos(null, s), c1 = box.querySelectorAll(".lum183-p1 .lum183-w b")[1], res = box.querySelector(".lum183-res");
    c1 && (c1.textContent = String(T.l[0].cant)); res && (res.innerHTML = resHtml(s)); box.__h = null;
  }
  function pintar() {
    const box = $("lum183"); if (!box) return;
    const s = leer();
    const h0 = box.__h;
    let h;
    if (!s.extra.length) {
      h = `<button type="button" class="btn-auto lum183-mas" data-l183="mas">＋ Otra potencia en la misma obra</button><div class="hint" style="margin-top:4px;">Si la plaza combina luminarias de distinta potencia (por ejemplo 20 de 75 W y 8 de 180 W), agregá cada potencia acá.</div>`;
    } else {
      const T = tipos(null, s);
      h = `<div class="lum183-box"><div class="lum183-tit">💡 Luminarias por potencia</div>
<div class="lum183-fila lum183-p1"><div class="lum183-lbl">1</div><div><label>Potencia</label><div class="lum183-w"><b>${f0(pot1(), 0)} W</b> <span class="hint" style="margin:0;">(la de arriba)</span></div></div><div><label>Cantidad</label><div class="lum183-w"><b>${T.l[0].cant}</b> <span class="hint" style="margin:0;">el resto</span></div></div><div class="lum183-prod"><label>Producto</label>${selProd(s.cod1, 'data-l183p="0"')}</div><div></div></div>
${s.extra.map((x, i) => `<div class="lum183-fila" data-l183i="${i}"><div class="lum183-lbl">${i + 2}</div><div><label for="l183w${i}">Potencia (W)</label><input type="number" id="l183w${i}" min="0" step="1" inputmode="numeric" data-l183f="w" value="${x.w || ""}"></div><div><label for="l183c${i}">Cantidad</label><input type="number" id="l183c${i}" min="0" step="1" inputmode="numeric" data-l183f="cant" value="${x.cant || ""}"></div><div class="lum183-prod"><label>Producto</label>${selProd(x.cod, 'data-l183f="cod"')}</div><button type="button" class="tramo-remove lum183-x" data-l183="quitar" aria-label="Quitar esta potencia" title="Quitar esta potencia">×</button></div>`).join("")}
<button type="button" class="btn-auto lum183-mas" data-l183="mas">＋ Otra potencia</button>
<div class="hint lum183-res" role="status">${resHtml(s)}</div></div>`;
    }
    if (h !== h0) { box.innerHTML = h; box.__h = h; }
    const t = $("toggleVinculos");
    t && !t.checked && box.querySelectorAll("input, select, button").forEach((o) => o.disabled = true);
  }
  function cambio(fn) { const s = leer(); fn(s); escribir(s); pintar(); }
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("#lum183 [data-l183]"); if (!b) return;
    const a = b.dataset.l183;
    if (a === "mas") { cambio((s) => s.extra.push({ w: s.extra.length ? 0 : 180, cant: 0, cod: "" })); const l = document.querySelectorAll('#lum183 [data-l183f="cant"]'); l.length && l[l.length - 1].focus(); }
    else if (a === "quitar") { const i = +b.closest("[data-l183i]").dataset.l183i; cambio((s) => s.extra.splice(i, 1)); }
    else if (a === "consumo") {
      const T = tipos();
      try {
        const k = window.__calcRapidas.est.consumo, l = T.l.filter((t) => t.cant > 0);
        k.n = l[0] ? l[0].cant : 0; k.w = l[0] ? l[0].w : 0; k.n2 = l.slice(1).reduce((x, t) => x + t.cant, 0); k.w2 = l.length > 1 ? Math.round(l.slice(1).reduce((x, t) => x + t.w * t.cant, 0) / Math.max(1, k.n2)) : "";
        window.calcRapidaIr("consumo");
      } catch (er) { }
    }
  });
  const alEscribir = (e) => {
    const t = e.target; if (!t || !t.closest) return;
    if (t.matches && t.matches('#lum183 [data-l183p="0"]')) { cambio((s) => { s.cod1 = t.value ? +t.value : ""; }); return; }
    const r = t.closest("#lum183 [data-l183i]");
    if (r && t.dataset.l183f) {
      const i = +r.dataset.l183i, f = t.dataset.l183f, s = leer();
      if (!s.extra[i]) return;
      s.extra[i][f] = f === "cod" ? (t.value ? +t.value : "") : f === "cant" ? Math.max(0, Math.round(num(t.value))) : num(t.value);
      escribir(s);
      e.type === "change" ? pintar() : parcial();
      return;
    }
    if (t.id === "vincPotenciaW" || (t.closest("#vinculoGruposContainer"))) setTimeout(pintar, 0);
  };
  document.addEventListener("input", alEscribir, true);
  document.addEventListener("change", alEscribir, true);
  document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("#addVinculoGrupoBtn, #vinculoGruposContainer [data-action=remove], #vincAutoBtn, #toggleVinculos"); b && setTimeout(pintar, 0); });

  // ---------- el asistente (proponer_calculo): cambiosForm.luminarias = [{potencia, cantidad, codigo}]
  function txtForm(c) {
    let o = null; try { o = c.lumTipos183 ? JSON.parse(c.lumTipos183) : null; } catch (e) { o = null; }
    const w1 = num(c.vincPotenciaW) || 75, ex = o && Array.isArray(o.extra) ? o.extra : [];
    if (!ex.length) return `todas de ${f0(w1, 0)} W`;
    return `${f0(w1, 0)} W (el resto)` + ex.map((x) => ` + ${x.cant} × ${f0(num(x.w), 0)} W${x.cod ? " (" + x.cod + ")" : " (producto a confirmar)"}`).join("");
  }
  function aplicarForm(f, lista) {
    const c = f.campos = f.campos || {}, notas = [];
    const l = (lista || []).map((x) => ({ w: num(x && (x.potencia != null ? x.potencia : x.w)), cant: Math.round(num(x && (x.cantidad != null ? x.cantidad : x.cant))), cod: x && (x.codigo || x.cod) ? +(x.codigo || x.cod) : "" }));
    if (!l.length) return { err: "Decime las potencias: luminarias:[{potencia:75, cantidad:20}, {potencia:180, cantidad:8}]." };
    for (const t of l) {
      if (!(t.w > 0)) return { err: "Cada potencia lleva los watts (ej. 75 o 180)." };
      if (t.cant < 0) return { err: "La cantidad no puede ser negativa." };
      if (t.cod && !productos().some((p) => p.codigo === t.cod)) return { err: `El código ${t.cod} no es una luminaria del pañol. Elegí uno de: ${productos().map((p) => p.codigo).join(", ") || "(no hay luminarias en el catálogo)"} — o dejalo vacío y queda «a confirmar».` };
    }
    const antes = txtForm(c);
    c.vincPotenciaW = String(l[0].w);
    const ex = l.slice(1).map((t) => ({ w: t.w, cant: Math.max(0, t.cant), cod: t.cod }));
    c.lumTipos183 = ex.length ? JSON.stringify({ v: 1, cod1: l[0].cod || 6010, extra: ex }) : "";
    if (ex.length) notas.push("La primera potencia lleva el resto de las luminarias de los vínculos (su cantidad sale sola).");
    if (ex.some((t) => !t.cod)) notas.push("Alguna potencia quedó sin producto del pañol: queda «a confirmar» hasta elegirlo en la Calculadora.");
    const despues = txtForm(c);
    return { fila: antes !== despues ? { c: "Luminarias", a: antes, d: despues } : null, notas };
  }

  // ---------- textos de la ganancia y del cable a la luminaria
  function textos() {
    const g = $("cableGanancia");
    if (g) g.placeholder = "vacío = 6 m por subida (columnas de 7 y de 10 m)";
    const lb = document.querySelector('label[for="cableGanancia"] span');
    lb && (lb.textContent = "— ponés tu número, o lo dejás vacío y usa 6 m por subida");
    const hi = g && g.nextElementSibling;
    if (hi && hi.classList.contains("hint") && !hi.__v183) { hi.__v183 = 1; hi.innerHTML = '<b>Manda lo que escribas acá.</b> Es lo que sube <b>un cable</b> por <b>una columna</b>; la calculadora ya sabe, por el orden de los puntos, que en una columna intermedia suben <b>2 cables</b> (el que llega y el que sigue) y en la última del circuito <b>1</b>. Ej.: con <b>6</b>, una intermedia suma 12 m y la última 6 m. Vacío = <b>6 m por subida</b>, de abajo hacia arriba, en columnas de 7 y de 10 m (Ángel, 19/11/2026; en metálica: <b>a confirmar</b>). <b>0</b> = no sumar nada (ya cargaste los largos con la ganancia adentro). El total se ve abajo apenas lo escribís y se suma solo a los metros de cada calibre.'; }
  }
  function hintCable(j, ce, mezcla, conCols) {
    return `ℹ <b>Cable 3×1,5 a la luminaria, uno por artefacto</b> (regla de EMA, Ángel 19/11/2026): <b>4 m</b> en columna de <b>7 m con brazo de 0,40 m</b> y <b>7,5 m</b> en columna de <b>10 m con brazo de 1 m</b>. Otra combinación (7 m con brazo de 1 m, 10 m con brazo de 0,40 m, brazo de 1,5 m…) sale de la más parecida más la diferencia de altura y de brazo: <b>a confirmar</b>. Altura usada: ${f0(j, 0)} m${conCols ? "" : " (por defecto: la sección Columnas está apagada)"}.${ce === "Metálica" ? " <b>⚠ En metálica, a confirmar:</b> con la fórmula de antes ((altura − 2,50 m de la caja) + brazo + 0,60) una de 7 m con brazo de 400 mm daba 5,50 m por artefacto, verificado contra el ítem 7.7 de cuatro cómputos oficiales." : ""}${mezcla ? " <b>Esta plaza tiene columnas de varias alturas:</b> los vínculos con brazo de 1 m o más se cuentan en la de 10 m y los de brazo corto en la de 7 m (a confirmar si no es así)." : ""}`;
  }
  window.__lum183 = { leer, resHtml, parcial, escribir, multi, tipos, productos, lineas, pintar, aplicarForm, txtForm, electrico, hintCable, textos };
  const ini = () => { textos(); pintar(); };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", ini) : ini();
  setTimeout(ini, 1500);
})();
