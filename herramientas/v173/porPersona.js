(function () {
  "use strict";
  // v173 · La orden por PERSONA y por TIEMPO (Ángel 18/11: «tiene que ser por personas que van a hacer cada tarea… y por tiempo:
  // si digo Pablo y Pedro van a estar hasta las 2 en esa plaza y los otros van a seguir hasta las 16, tiene que ser así. Que ellos
  // cobren hasta ahí y lo que hicieron, y los otros siguen y van a cobrar más por todas las horas» · «si le doy la misma tarea
  // "armar luminaria" a dos personas, 10, 5 cada uno: que a cada uno le aparezcan 5 nomás… cada uno tiene su propia tarea»).
  //  1) HORARIO de cada uno: «Llenar orden» › paso 2 › «🕐 ¿Hasta qué hora está cada uno?» (desde – hasta, «hasta 14:00»,
  //     «toda la jornada») → ot.horario { "Nombre": {desde, hasta} } (solo los que no hacen toda la jornada). Se ve en el resumen,
  //     «Quién hace qué», la hoja impresa (Entrada / Salida), el celu de cada uno (su horario), el «📸 Avance» y el cierre, que
  //     precarga las horas de cada uno con su horario (si no, la jornada): los puntos por rol × horas salen por la cuenta de
  //     siempre (puntosDeOrden). El auditor de puntos lo dice («trabajó de 08:00 a 14:00, horario de la orden»).
  //  2) TAREA REPARTIDA (✂, v079) = cada uno con lo suyo: sus unidades (las columnas que eligió la oficina se reparten en orden
  //     —Pablo Col 1–5, Pedro Col 6–10— o las que siguen), solo sus fotos, su «N de 5», su «Voy a iniciar», su tiempo por
  //     columna y su envío; la oficina ve «Pablo 5 de 5 · 42 min · Pedro 3 de 5» (📸 Avance, verificación) y el cierre precarga
  //     cuánto hizo cada uno. «➗ Dividir en partes iguales» en «✂ Repartir».
  // Apagado con window.__v173No (lo pone el arnés salvo v173:true): todo como la v172.
  const off = () => !!window.__v173No;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => (typeof escHtml == "function" ? escHtml(String(s ?? "")) : String(s ?? "").replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]));
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const num = (v) => { const x = parseFloat(String(v ?? "").replace(",", ".")); return isFinite(x) ? x : 0; };
  const r2 = (n) => Math.round(n * 100) / 100;
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" ? x : {});
  const Lk = (s) => String(s || "").replace(/[~*\/\[\].`]/g, "_").slice(0, 120) || "_";
  const fN = (n) => (typeof fmt == "function" ? fmt(n, Number.isInteger(Math.round(n * 10) / 10) ? 0 : 1) : String(Math.round(n * 10) / 10));
  const primer = (n) => String(n || "").trim().split(/\s+/)[0] || "";
  const ots = () => { try { return Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []; } catch (e) { return []; } };
  const otDe = (id) => (id && typeof id == "object" ? id : ots().find((o) => o && o.id === id) || null);
  const intentar = (f, d) => { try { return f(); } catch (e) { return d; } };
  const yoFicha = () => intentar(() => (window.PERMISOS && PERMISOS.yo ? PERMISOS.yo() : null), null) || {};
  const yo = () => { const a = window.__mtAPI; const p = a && a.persona ? intentar(() => a.persona(), "") : ""; if (p) return p; const y = yoFicha(); return y.persona || y.nombre || ""; };
  const juntar = (l) => (l.length <= 1 ? l.join("") : l.slice(0, -1).join(", ") + " y " + l[l.length - 1]);
  const personasOt = (o) => arr(o && o.personal).map((p) => (typeof p == "string" ? { nombre: p } : p)).filter((p) => p && String(p.nombre || "").trim());

  // =================================================================================================== 1) HORARIO
  const minDe = (s) => { const m = /^(\d{1,2}):(\d{2})/.exec(String(s || "").trim()); return m ? +m[1] * 60 + +m[2] : null; };
  const hhmm = (s) => { const m = minDe(s); return m == null ? "" : String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
  const horasEntre = (a, b) => { const x = minDe(a), y = minDe(b); return x != null && y != null && y > x ? r2((y - x) / 60) : 0; };
  const jornadaDe = (o) => { const h = horasEntre(o && o.horaInicio, o && o.horaFin); return h > 0 ? Math.round(h * 10) / 10 : 8; };
  function horarioDe(o, nombre) {   // {desde, hasta, horas} del que tiene horario propio (si no, null)
    if (off() || !o) return null;
    const H = obj(o.horario), k = Object.keys(H).find((x) => nk(x) === nk(nombre)); if (k == null) return null;
    const v = obj(H[k]), desde = hhmm(v.desde) || hhmm(o.horaInicio), hasta = hhmm(v.hasta) || hhmm(o.horaFin);
    const horas = horasEntre(desde, hasta);
    return horas > 0 ? { desde, hasta, horas } : null;
  }
  const tieneHorario = (o) => !off() && !!o && personasOt(o).some((p) => horarioDe(o, p.nombre));
  const rangoTxt = (d, h) => (d && h ? d + " a " + h : h ? "hasta " + h : d ? "desde " + d : "");
  // «Pablo y Pedro: 08:00 a 14:00 · Juan y Mario: 08:00 a 16:00 (toda la jornada)»
  function gruposTxt(o, corto) {
    if (!tieneHorario(o)) return "";
    const g = []; personasOt(o).forEach((p) => {
      const h = horarioDe(o, p.nombre), t = h ? rangoTxt(h.desde, h.hasta) : rangoTxt(hhmm(o.horaInicio), hhmm(o.horaFin)) + (corto ? "" : " (toda la jornada)");
      let x = g.find((y) => y.t === t); if (!x) g.push((x = { t, n: [], prop: !!h })); x.n.push(primer(p.nombre));
    });
    return g.map((x) => juntar(x.n) + ": " + x.t).join(" · ");
  }
  // horas de cada uno según su horario (para la cuenta de puntos de lo que todavía no se cerró)
  function horasPersonaDe(o) { const out = {}; personasOt(o).forEach((p) => { const h = horarioDe(o, p.nombre); if (h) out[String(p.nombre).trim()] = h.horas; }); return out; }

  // ---------- «Llenar orden» › paso 2
  let HF = {}, editHad = false;   // nk(nombre) → {desde, hasta}
  const ordenHoras = () => ({ ini: hhmm(($("otHoraInicio") || {}).value), fin: hhmm(($("otHoraFin") || {}).value) });
  const gente = () => { try { return personal.filter((p) => String(p.nombre || "").trim()).map((p) => p.nombre.trim()); } catch (e) { return []; } };
  function pintarForm() {
    if (off()) { const b0 = $("hpBox"); b0 && b0.remove(); return; }
    const c2 = document.querySelector('#viewParteDiario .card[data-paso="2"]') || ($("personalContainer") && $("personalContainer").closest(".card")); if (!c2) return;
    const ps = gente(); let b = $("hpBox");
    if (!ps.length) { b && b.remove(); return; }
    const oh = ordenHoras(), jor = rangoTxt(oh.ini, oh.fin);
    const h = `<div class="hp-t">🕐 ¿Hasta qué hora está cada uno? <small>si no ponés nada, toda la jornada${jor ? " (" + esc(jor) + ")" : ""} · los puntos se cuentan por las horas de cada uno</small></div>` +
      ps.map((n) => { const v = HF[nk(n)] || {}, prop = !!(v.desde || v.hasta); return `<div class="hp-fila${prop ? " prop" : ""}" data-hpf="${esc(n)}"><span class="hp-n" title="${esc(n)}">${esc(n)}</span><span class="hp-hs"><input type="time" data-hp="desde" data-hpn="${esc(n)}" value="${esc(v.desde || "")}" aria-label="Desde qué hora está ${esc(n)}"><span>a</span><input type="time" data-hp="hasta" data-hpn="${esc(n)}" value="${esc(v.hasta || "")}" aria-label="Hasta qué hora está ${esc(n)}"></span><span class="hp-acc"><button type="button" class="chip${v.hasta === "14:00" && !v.desde ? " activo" : ""}" data-hpq="14" data-hpn="${esc(n)}">hasta 14:00</button><button type="button" class="chip${prop ? "" : " activo"}" data-hpq="todo" data-hpn="${esc(n)}">toda la jornada</button></span></div>`; }).join("") +
      (Object.keys(HF).some((k) => ps.some((n) => nk(n) === k) && (HF[k].desde || HF[k].hasta)) ? `<div class="hp-pie" role="status">${esc(resumenForm(ps, oh))}</div>` : "");
    if (!b) { b = document.createElement("div"); b.id = "hpBox"; b.className = "hp-box no-print"; }
    const ancla = $("vpBox") || $("otLlegaCel") || $("personalSummary");
    if (ancla && b.previousElementSibling !== ancla) ancla.insertAdjacentElement("afterend", b); else if (!ancla && b.parentNode !== c2) c2.appendChild(b);
    if (b.__h !== h && !(document.activeElement && b.contains(document.activeElement))) { b.innerHTML = h; b.__h = h; }
  }
  function resumenForm(ps, oh) {
    const g = []; ps.forEach((n) => { const v = HF[nk(n)] || {}, t = v.desde || v.hasta ? rangoTxt(v.desde || oh.ini, v.hasta || oh.fin) : rangoTxt(oh.ini, oh.fin) + " (toda la jornada)"; let x = g.find((y) => y.t === t); if (!x) g.push((x = { t, n: [] })); x.n.push(primer(n)); });
    return g.map((x) => juntar(x.n) + ": " + x.t).join(" · ");
  }
  function resultadoForm(r) {   // lo que va a la orden
    const out = {}; arr(r && r.personal).forEach((p) => {
      const n = String((p && p.nombre) || "").trim(); if (!n) return; const v = HF[nk(n)]; if (!v || !(v.desde || v.hasta)) return;
      const d = hhmm(v.desde) || hhmm(r.horaInicio), h = hhmm(v.hasta) || hhmm(r.horaFin);
      if (d === hhmm(r.horaInicio) && h === hhmm(r.horaFin)) return;
      out[n] = { desde: d, hasta: h };
    });
    return out;
  }
  window.addEventListener("input", (e) => { const i = e.target.closest && e.target.closest("#hpBox [data-hp]"); if (!i || off()) return; const k = nk(i.dataset.hpn); HF[k] = Object.assign({}, HF[k], { [i.dataset.hp]: hhmm(i.value) }); }, true);
  window.addEventListener("change", (e) => { const i = e.target.closest && e.target.closest("#hpBox [data-hp]"); if (!i || off()) return; setTimeout(() => { const b = $("hpBox"); if (b) b.__h = ""; document.activeElement && document.activeElement.blur && $("hpBox") && $("hpBox").contains(document.activeElement) ? 0 : pintarForm(); refrescarResumen(); }, 0); }, true);
  window.addEventListener("click", (e) => {
    const q = e.target.closest && e.target.closest("#hpBox [data-hpq]"); if (!q || off()) return;
    e.preventDefault(); const k = nk(q.dataset.hpn);
    if (q.dataset.hpq === "todo") delete HF[k]; else HF[k] = { desde: "", hasta: "14:00" };
    const b = $("hpBox"); if (b) b.__h = ""; if (document.activeElement && b && b.contains(document.activeElement)) document.activeElement.blur();
    pintarForm(); refrescarResumen();
  }, true);
  const refrescarResumen = () => { intentar(() => window.__ordenNueva && window.__ordenNueva.pintar && window.__ordenNueva.pintar()); intentar(() => window.__equipoTarea && window.__equipoTarea.pintarCajas && window.__equipoTarea.pintarCajas()); };
  // texto de «Quién hace qué» y del resumen (del formulario)
  function formTxt(n) {
    if (off()) return ""; const v = HF[nk(n)]; if (!v || !(v.desde || v.hasta)) return "";
    const oh = ordenHoras(); return " · 🕐 " + rangoTxt(v.desde || oh.ini, v.hasta || oh.fin);
  }
  function resumenTxt(d) {
    if (off() || !d) return ""; const t = gruposTxt(Object.assign({}, d, { horario: d.horario || resultadoForm(d) }), true);
    return t ? " · 🕐 " + t : "";
  }

  // ---------- cuadrilla: su horario
  function miTxt(o, persona) { const h = horarioDe(o, persona || yo()); return h ? ` · tu horario: ${h.desde} a ${h.hasta}` : ""; }
  function miBloque(o) {
    const h = horarioDe(o, yo()); if (!h) return "";
    return `<div class="hp-mio" role="note">🕐 <b>Tu horario hoy: ${esc(h.desde)} a ${esc(h.hasta)}</b><small>Te cuentan ${esc(fN(h.horas))} h (la orden es de ${esc(rangoTxt(hhmm(o.horaInicio), hhmm(o.horaFin)))})</small></div>`;
  }
  // ---------- hoja impresa: Entrada / Salida
  function imp(o, nombre, cual) { if (off()) return "&nbsp;"; const h = horarioDe(o, nombre); if (h) return esc(cual ? h.hasta : h.desde); if (!tieneHorario(o)) return "&nbsp;"; const v = cual ? hhmm(o.horaFin) : hhmm(o.horaInicio); return v ? esc(v) : "&nbsp;"; }
  // ---------- auditor de puntos
  function auditTxt(o, nombre) { const h = horarioDe(o, nombre); return h ? ` · trabajó de ${h.desde} a ${h.hasta} (${fN(h.horas)} h, horario de la orden)` : ""; }

  // ---------- puntos de lo que todavía no se cerró (resumen de Llenar orden, asistente): con el horario de cada uno
  function envolverPuntos() {
    const f = window.puntosDeOrden; if (typeof f != "function" || f.__h173) return;
    const n = function (o) {
      if (off() || !o || !o.horario || !tieneHorario(o) || (o.cierre && o.cierre.cerradoTs)) return f.apply(this, arguments);
      const c = Object.assign({}, o.cierre || {}), hp = Object.assign({}, c.horasPersona || {}), hh = horasPersonaDe(o);
      Object.keys(hh).forEach((nm) => { if (!Object.keys(hp).some((x) => nk(x) === nk(nm))) hp[nm] = hh[nm]; });
      const args = [].slice.call(arguments); args[0] = Object.assign({}, o, { cierre: Object.assign(c, { horasPersona: hp }) });
      return f.apply(this, args);
    };
    window.__heredar && window.__heredar(n, f); n.__h173 = 1; window.puntosDeOrden = n;
  }

  // ---------- el cierre: horas de cada uno con su horario
  function cierre() {
    if (off()) return; const id = window.__cierreOtId; if (!id) return;
    const o = otDe(id); if (!o || !tieneHorario(o)) return;
    const hp = obj(o.cierre && o.cierre.horasPersona);
    document.querySelectorAll("#cierreCuerpo .cierre-persona").forEach((el) => {
      const inp = el.querySelector(".cierre-horas-p"); if (!inp || el.querySelector(".hp-ci")) return;
      const h = horarioDe(o, inp.dataset.n); if (!h) return;
      const s = document.createElement("span"); s.className = "hp-ci"; s.textContent = "🕐 " + h.desde + " a " + h.hasta + " (horario de la orden)";
      (el.firstElementChild || el).appendChild(s);
      inp.dataset.def = String(h.horas); inp.placeholder = fN(h.horas) + " (su horario)";   // vacío = su horario (no la jornada)
      const yaCierre = Object.keys(hp).some((x) => nk(x) === nk(inp.dataset.n));
      if (!yaCierre && (inp.value === "" || num(inp.value) === jornadaDe(o))) { inp.value = String(h.horas); inp.dispatchEvent(new Event("input", { bubbles: true })); }
    });
  }

  // =================================================================================================== 2) REPARTIDA = CADA UNO LO SUYO
  const labelDe = (k) => intentar(() => { const t = (typeof ACTIVIDADES_CATALOGO != "undefined" ? ACTIVIDADES_CATALOGO : []).find((x) => x.id === k); return t ? t.label : k; }, k);
  const unDe = (k) => intentar(() => (typeof unidadDeTarea == "function" ? unidadDeTarea(k) : ""), "");
  const catDe = (k) => intentar(() => (window.catFotoDeTarea ? window.catFotoDeTarea(labelDe(k)) : "otra"), "otra");
  const pideNum = (k) => intentar(() => !!(window.catFotoPideNum && window.catFotoPideNum(catDe(k))), false) && !/metro|^m$|^ml$/i.test(String(unDe(k) || ""));
  const PREF = { columna: "Col", caja: "Caja", luminaria: "Lum", pat: "PAT" };
  function siguiente(n) { const m = String(n || "").match(/^(.*?)(\d+)(\D*)$/); return m ? m[1] + (+m[2] + 1) + m[3] : ""; }
  // las unidades de la tarea, en orden: las columnas que eligió la oficina o las de la obra que no tienen foto de otra orden
  function plan(o, k, total) {
    const cols = arr(obj(o.columnas)[k]).map(String).filter(Boolean); if (cols.length) return cols;
    const cat = catDe(k), otras = new Set();
    ots().forEach((x) => { if (x && x.id !== o.id && String(x.plazaId || "") === String(o.plazaId || "")) Object.keys(obj(x.campo && x.campo.fotos)).forEach((q) => { const f = x.campo.fotos[q]; if (f && !f.borrada && f.cat === cat && f.num) otras.add(nk(f.num)); }); });
    const lista = intentar(() => (typeof window.puntosDeObra == "function" && o.plazaId ? window.puntosDeObra(o.plazaId).lista || [] : []), []);
    const l = lista.filter((n) => !otras.has(nk(n)));
    let ult = l.length ? l[l.length - 1] : (PREF[cat] || "Unidad") + " " + lista.length;
    while (l.length < total) { let nm = siguiente(ult) || (PREF[cat] || "Unidad") + " " + (l.length + 1); while (l.some((x) => nk(x) === nk(nm))) nm = siguiente(nm) || nm + "b"; l.push(nm); ult = nm; }
    return l;
  }
  const CACHE = {};
  function reparto(o, k) {   // [{nombre, cant, nombres[]}] o null
    if (off() || !o || !window.__reparto) return null;
    const rp = intentar(() => window.__reparto.deTarea(o, k), null); if (!rp) return null;
    const firma = JSON.stringify([o.id, rp.lista, obj(o.columnas)[k], o.plazaId]), c = CACHE[o.id + "|" + k];
    if (c && c.firma === firma && Date.now() - c.ts < 3000) return c.v;
    const uni = pideNum(k), total = Math.ceil(rp.lista.reduce((s, x) => s + num(x.cant), 0));
    const expl = new Set(); rp.lista.forEach((x) => arr(x.cols).forEach((n) => expl.add(nk(n))));
    const pl = uni ? plan(o, k, total + expl.size).filter((n) => !expl.has(nk(n))) : [];
    let i = 0;
    const v = rp.lista.map((x) => {
      const c2 = num(x.cant); let nombres = [];
      if (uni) { if (arr(x.cols).length) nombres = arr(x.cols).map(String); else { nombres = pl.slice(i, i + Math.ceil(c2)); i += Math.ceil(c2); } }
      return { nombre: String(x.nombre), cant: c2, nombres };
    });
    v.unidad = uni; v.resto = rp.resto;
    CACHE[o.id + "|" + k] = { firma, ts: Date.now(), v };
    return v;
  }
  function mias(o, k, persona) { const R = reparto(otDe(o), k); if (!R) return null; const p = nk(persona == null ? yo() : persona); const x = R.find((y) => nk(y.nombre) === p); return x ? Object.assign({ unidad: R.unidad, todos: R }, x) : null; }
  const deOtro = (R, p, n) => R.some((y) => nk(y.nombre) !== p && y.nombres.some((z) => nk(z) === nk(n)));
  function fotoMia(o, k, f, persona) {
    const m = mias(o, k, persona); if (!m) return true; if (!f) return false;
    const p = nk(persona == null ? yo() : persona);
    if (m.unidad && f.num) { if (m.nombres.some((z) => nk(z) === nk(f.num))) return true; return nk(f.por) === p && !deOtro(m.todos, p, f.num); }
    return nk(f.por) === p;
  }
  function filtrarFotos(o, k, fotos, persona) { if (!mias(o, k, persona)) return fotos; return arr(fotos).filter((e) => fotoMia(o, k, Array.isArray(e) ? e[1] : e, persona)); }
  function pasoMio(o, k, x, persona) {
    const m = mias(o, k, persona); if (!m || !x) return true; const p = nk(persona == null ? yo() : persona);
    if (x.num && m.nombres.some((z) => nk(z) === nk(x.num))) return true;
    return nk(x.por) === p && !(x.num && deOtro(m.todos, p, x.num));
  }
  function envMio(o, k, v, persona) { const m = mias(o, k, persona); if (!m || !v) return true; return nk(v.por || v.nombre) === nk(persona == null ? yo() : persona); }
  // lo hecho por cada uno (para la oficina y el cierre)
  const fotosOt = (o) => Object.keys(obj(o.campo && o.campo.fotos)).map((q) => [q, o.campo.fotos[q]]).filter((e) => e[1] && !e[1].borrada);
  function progreso(o, k) {
    o = otDe(o); const R = reparto(o, k); if (!R) return null;
    const c = obj(o.campo), ps = obj(obj(c.pasosObra)[Lk(k)]), fs = fotosOt(o).filter((e) => e[1].k === k || e[1].k === Lk(k));
    const mp = obj(obj(c.marcasP)[Lk(k)]), env = obj(obj(c.tareaEnv)[Lk(k)]);
    return R.map((x) => {
      const p = nk(x.nombre); let hechas = 0, min = 0, nombresH = [];
      if (R.unidad) {
        const mine = (n) => x.nombres.some((z) => nk(z) === nk(n));
        const hechos = new Set();
        Object.keys(ps).forEach((q) => { const y = ps[q]; if (!y || y.estado === "no" || !y.num) return; if (mine(y.num) || (nk(y.por) === p && !deOtro(R, p, y.num))) { if (!hechos.has(nk(y.num))) { hechos.add(nk(y.num)); nombresH.push(y.num); min += num(y.min); } } });
        fs.forEach((e) => { const f = e[1]; if (!f.num || hechos.has(nk(f.num))) return; if (mine(f.num) || (nk(f.por) === p && !deOtro(R, p, f.num))) { hechos.add(nk(f.num)); nombresH.push(f.num); } });
        hechas = hechos.size;
      }
      const m = mp[p] || Object.keys(mp).map((q) => mp[q]).find((y) => y && nk(y.nombre) === p);
      const marc = m && m.hecho ? num(m.cant) || x.cant : 0;
      if (!R.unidad || marc > hechas) hechas = Math.max(hechas, marc);
      const e = Object.keys(env).map((q) => env[q]).find((y) => y && nk(y.por || y.nombre) === p);
      return { nombre: x.nombre, cant: x.cant, nombres: x.nombres, hechas: Math.min(hechas, Math.max(hechas, 0)), min: Math.round(min), hechasNombres: nombresH, envio: e ? e.estado : "", noHizo: !!(m && m.hecho === false) };
    });
  }
  function rangoCols(l) {
    l = arr(l); if (!l.length) return "";
    const m = l.map((n) => String(n).match(/^(.*?)(\d+)$/));
    if (l.length > 2 && m.every((x) => x && x[1] === m[0][1]) && m.every((x, i) => i === 0 || +x[2] === +m[i - 1][2] + 1)) return l[0] + " a " + l[l.length - 1];
    return juntar(l);
  }
  function progresoTxt(o, k) {
    const P = progreso(o, k); if (!P) return "";
    return P.map((x) => `${primer(x.nombre)} ${fN(x.hechas)} de ${fN(x.cant)}${x.min > 0 ? " · " + x.min + " min" : ""}${x.noHizo ? " (no se hizo)" : ""}`).join(" · ");
  }
  // el cierre: cuánto hizo cada uno (lo que salga de sus columnas/fotos o de lo que marcó: lo mayor)
  function mezclarHecho(o, k, out) {
    if (off()) return out; const P = intentar(() => progreso(o, k), null); if (!P) return out;
    const res = arr(out).map((x) => Object.assign({}, x));
    P.forEach((x) => { if (!(x.hechas > 0)) return; const y = res.find((z) => nk(z.nombre) === nk(x.nombre)); if (y) y.cant = Math.max(num(y.cant), x.hechas); else res.push({ nombre: x.nombre, cant: x.hechas }); });
    return res;
  }
  // verificación: una línea por persona
  function verTxt(o, k) { if (off()) return ""; const t = intentar(() => progresoTxt(o, k), ""); return t ? " · por persona: " + t : ""; }

  // ---------- la oficina: «📸 Avance» y cierre
  function oficinaHtml(ot) {
    if (off() || !ot) return "";
    let h = "";
    const g = gruposTxt(ot); if (g) h += `<div class="hp-of">🕐 <b>Horario:</b> ${esc(g)}</div>`;
    arr(ot.actividades).forEach((k) => {
      const P = intentar(() => progreso(ot, k), null); if (!P) return;
      h += `<div class="rp173-of"><div class="rp173-t">✂ <b>${esc(labelDe(k))}</b> · cada uno lo suyo</div>${P.map((x) => `<div class="rp173-f${x.hechas >= x.cant && x.cant > 0 ? " ok" : ""}"><span>👤 ${esc(primer(x.nombre))}${x.nombres.length ? " <small>" + esc(rangoCols(x.nombres)) + "</small>" : ""}</span><b>${esc(fN(x.hechas))} de ${esc(fN(x.cant))}</b>${x.min > 0 ? `<em>${x.min} min</em>` : ""}${x.envio ? `<em>${x.envio === "no" ? "📤 «no se hizo»" : "📤 mandó"}</em>` : ""}</div>`).join("")}</div>`;
    });
    return h;
  }
  function envolverOficina() {
    const g = window.__cdOficinaHtml; if (typeof g != "function" || g.__p173) return;
    const n = function (ot) { const r = g.apply(this, arguments) || ""; return off() ? r : r + intentar(() => oficinaHtml(ot), ""); };
    window.__heredar && window.__heredar(n, g); n.__p173 = 1; window.__cdOficinaHtml = n;
  }
  function envolverComoLlegar() {   // Mis tareas (la lista): el horario de cada uno, arriba de la orden
    const g = window.__mtComoLlegar; if (typeof g != "function" || g.__p173) return;
    const n = function (ot, chico) { const r = g.apply(this, arguments) || ""; if (off() || chico || !ot) return r; return intentar(() => miBloque(ot), "") + r; };
    window.__heredar && window.__heredar(n, g); n.__p173 = 1; window.__mtComoLlegar = n;
  }
  // Mis tareas (la lista): solo mis fotos y mis columnas en una tarea repartida
  function envolverMt() {
    const L = window.mtFotosLista; if (typeof L == "function" && !L.__p173) {
      const n = function (ot, tarea, cat, fotos) { const a = [].slice.call(arguments); if (!off() && ot && tarea && mias(ot, tarea.k)) a[3] = filtrarFotos(ot, tarea.k, fotos); return L.apply(this, a); };
      window.__heredar && window.__heredar(n, L); n.__p173 = 1; window.mtFotosLista = n;
    }
    ["mtFotosFaltan", "mtFotosFaltaTxt"].forEach((nm) => {
      const F = window[nm]; if (typeof F != "function" || F.__p173) return;
      const n = function (ot, tarea, marca, fotos) { const a = [].slice.call(arguments); if (!off() && ot && tarea && mias(ot, tarea.k)) a[3] = filtrarFotos(ot, tarea.k, fotos); return F.apply(this, a); };
      window.__heredar && window.__heredar(n, F); n.__p173 = 1; window[nm] = n;
    });
    const C = window.__mtColsOt; if (!C || !C.__p173) {
      const C0 = C || (() => []);
      const n = function (ot, k) { if (!off() && ot) { const m = mias(ot, k); if (m && m.nombres.length) return m.nombres.slice(); } return C0.apply(this, arguments); };
      if (C) window.__heredar && window.__heredar(n, C); n.__p173 = 1; window.__mtColsOt = n;
    }
  }

  // ---------- «Llenar orden»: «➗ Dividir en partes iguales» y las columnas de cada uno
  const RPCOLS = {};   // k → { nombre: [columnas] } (lo que dijo el asistente)
  function iguales(k) {
    const R = window.__reparto; if (!R) return; const st = R.estado(); const sel = document.querySelector('#otActividades .ot-act-quien[data-id="' + (window.CSS && CSS.escape ? CSS.escape(k) : k) + '"]');
    const ps = sel ? [...sel.options].map((o) => o.value).filter((v) => v && v !== "__reparto__" && v !== "__equipo__") : [];
    const inp = document.querySelector('#otActividades .ot-act-prev[data-id="' + (window.CSS && CSS.escape ? CSS.escape(k) : k) + '"]'), T = num(inp && inp.value);
    if (!ps.length || !(T > 0)) return;
    const e = st[k] = {};
    if (Number.isInteger(T)) { const b = Math.floor(T / ps.length); let resto = T - b * ps.length; ps.forEach((n) => { e[n] = String(b + (resto > 0 ? 1 : 0)); resto--; }); }
    else ps.forEach((n) => { e[n] = String(r2(T / ps.length)); });
    R.pintarCajas(); intentar(() => window.__equipoTarea && window.__equipoTarea.pintarCajas());
  }
  window.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest('#otActividades [data-rp173="iguales"]'); if (!b || off()) return;
    e.preventDefault(); e.stopPropagation(); iguales(b.dataset.k);
  }, true);
  const obraForm = () => intentar(() => { const o = typeof plazaOtActiva == "function" ? plazaOtActiva() : null; return o ? String(o.id) : ""; }, "");
  function colsDeForm(k, lista) {   // [{nombre, cant}] → [{nombre, cols}] con las columnas elegidas (en orden)
    const sel = intentar(() => (window.__colsElegidas ? window.__colsElegidas(obraForm(), k) : null), null) || [];
    const ex = RPCOLS[k] || {};
    let i = 0; return lista.map((x) => { const c = Math.ceil(num(x.cant)); const e = Object.keys(ex).find((n) => nk(n) === nk(x.nombre)); if (e) return { nombre: x.nombre, cols: ex[e].slice() }; const l = sel.slice(i, i + c); i += c; return { nombre: x.nombre, cols: l }; });
  }
  function formColsTxt(k, personas, e) {   // debajo del «✂ Repartir»: qué columnas le tocan a cada uno
    if (off()) return "";
    const l = Object.keys(e || {}).filter((n) => num(e[n]) > 0 && personas.some((p) => nk(p) === nk(n))).map((n) => ({ nombre: n, cant: num(e[n]) }));
    const c = colsDeForm(k, l).filter((x) => x.cols.length); if (!c.length) return "";
    return '<div class="rp173-cols">' + c.map((x) => "👤 <b>" + esc(primer(x.nombre)) + "</b>: " + esc(rangoCols(x.cols))).join(" · ") + "</div>";
  }
  function envolverForm() {
    const g = window.datosOtDesdeFormulario; if (typeof g == "function" && !g.__p173) {
      const n = function () {
        const r = g.apply(this, arguments); if (!r || off()) return r;
        const hp = resultadoForm(r); if (Object.keys(hp).length) r.horario = hp; else if (editHad) r.horario = {}; else delete r.horario;
        Object.keys(obj(r.reparto)).forEach((k) => {
          const l = arr(r.reparto[k]); if (!l.length) return;
          const c = colsDeForm(k, l); l.forEach((x, i) => { if (c[i] && c[i].cols.length) x.cols = c[i].cols; else delete x.cols; });
        });
        return r;
      };
      window.__heredar && window.__heredar(n, g); n.__p173 = 1; window.datosOtDesdeFormulario = n;
    }
    const ge = window.editarOrdenTrabajo; if (typeof ge == "function" && !ge.__p173) {
      const n = function (id) {
        if (!off()) { HF = {}; editHad = false; const o = otDe(id); Object.keys(obj(o && o.horario)).forEach((nm) => { const v = o.horario[nm]; if (v) { HF[nk(nm)] = { desde: hhmm(v.desde) === hhmm(o.horaInicio) ? "" : hhmm(v.desde), hasta: hhmm(v.hasta) === hhmm(o.horaFin) ? "" : hhmm(v.hasta) }; editHad = true; } }); Object.keys(RPCOLS).forEach((k) => delete RPCOLS[k]); }
        const r = ge.apply(this, arguments); setTimeout(pintarForm, 80); return r;
      };
      window.__heredar && window.__heredar(n, ge); n.__p173 = 1; window.editarOrdenTrabajo = n;
    }
    const gs = window.salirDeEdicionOt; if (typeof gs == "function" && !gs.__p173) {
      const n = function () { const r = gs.apply(this, arguments); if (!off()) { HF = {}; editHad = false; Object.keys(RPCOLS).forEach((k) => delete RPCOLS[k]); setTimeout(pintarForm, 0); } return r; };
      window.__heredar && window.__heredar(n, gs); n.__p173 = 1; window.salirDeEdicionOt = n;
    }
    const ge2 = window.emitirOrdenTrabajo; if (typeof ge2 == "function" && !ge2.__p173) {
      const n = async function () { const r = await ge2.apply(this, arguments); if (!off()) intentar(() => { if (!document.querySelector("#otActividades .ot-act-check:checked")) { HF = {}; editHad = false; Object.keys(RPCOLS).forEach((k) => delete RPCOLS[k]); pintarForm(); } }); return r; };
      window.__heredar && window.__heredar(n, ge2); n.__p173 = 1; window.emitirOrdenTrabajo = n;
    }
  }
  // el asistente carga la orden: horario y columnas de cada uno
  function ponerForm(d) {
    HF = {}; editHad = false; Object.keys(RPCOLS).forEach((k) => delete RPCOLS[k]);
    Object.keys(obj(d && d.horario)).forEach((nm) => { const v = d.horario[nm] || {}; HF[nk(nm)] = { desde: hhmm(v.desde), hasta: hhmm(v.hasta) }; });
    Object.keys(obj(d && d.rpCols)).forEach((k) => { RPCOLS[k] = Object.assign({}, d.rpCols[k]); });
    const b = $("hpBox"); if (b) b.__h = ""; pintarForm();
  }

  // ---------- la hoja impresa de la tarea repartida: con las columnas de cada uno
  function envolverImpreso() {
    const R = window.__reparto; if (!R || !R.textoImpreso || R.textoImpreso.__p173) return;
    const g = R.textoImpreso;
    const n = function (ot, k) {
      const h = g.apply(this, arguments); if (off()) return h;
      const P = intentar(() => reparto(ot, k), null); if (!P || !P.some((x) => x.nombres.length)) return h;
      return h + `<div style="margin-top:2px; font-size:11px; color:#1f2a40;">${P.filter((x) => x.nombres.length).map((x) => "👤 " + esc(primer(x.nombre)) + ": " + esc(rangoCols(x.nombres))).join(" · ")}</div>`;
    };
    n.__p173 = 1; R.textoImpreso = n;
  }

  function tic() { envolverPuntos(); envolverOficina(); envolverComoLlegar(); envolverMt(); envolverForm(); envolverImpreso(); if (off()) return; const g = document.querySelector("#viewParteDiario > .grid"); if (g && g.offsetParent !== null) pintarForm(); if ($("cierreCuerpo") && window.__cierreOtId) cierre(); }
  tic(); setInterval(tic, 700);
  document.addEventListener("click", (e) => { if (!off() && e.target.closest && e.target.closest("[data-of-gente], #addPersonaBtn, #personalContainer, [data-cua]")) setTimeout(pintarForm, 120); });
  document.addEventListener("change", (e) => { if (!off() && e.target && (e.target.id === "otHoraInicio" || e.target.id === "otHoraFin" || (e.target.closest && e.target.closest("#personalContainer")))) setTimeout(() => { const b = $("hpBox"); if (b) b.__h = ""; pintarForm(); }, 50); });
  if (typeof window.abrirCierreOt == "function") {
    const o0 = window.abrirCierreOt;
    const n = function () { const r = o0.apply(this, arguments); if (!off()) { setTimeout(cierre, 0); setTimeout(cierre, 120); } return r; };
    window.__heredar && window.__heredar(n, o0); window.abrirCierreOt = n;
  }

  window.__hor173 = { horarioDe, tieneHorario, gruposTxt, horasPersonaDe, miTxt, miBloque, imp, auditTxt, formTxt, resumenTxt, resultadoForm, ponerForm, pintarForm, cierre, form: () => HF, rangoTxt, horasEntre, hhmm };
  window.__rp173 = { reparto, mias, fotoMia, filtrarFotos, pasoMio, envMio, progreso, progresoTxt, mezclarHecho, verTxt, oficinaHtml, iguales, formColsTxt, colsDeForm, rangoCols, yo, plan, RPCOLS };
})();
