(function () {
  "use strict";
  // v157 · El tiempo de CADA columna, no de toda la tarea (Ángel, 15/11: «si te doy 3 columnas, tendría que tener 3 horarios…
  // para después sacar un promedio de cuánto se tarda en hacer un tablerito, un artefacto, todo eso»).
  //  · La hora sale sola, sin escribir nada: el FIN de cada columna (unidad: columna, caja, luminaria, jabalina) es cuando sacan
  //    la foto de esa columna (si sacan varias, la última) o tocan «✓ Col N lista»; el INICIO es cuando terminó la columna
  //    anterior de esa tarea (o lo último que terminó esa persona en la orden, o «Llegué»); «▶ Empecé Col N» (opcional) manda.
  //  · Al guardar: «✓ Col 1 lista · 42 min» con «cambiar» (− / + de 5 min, sin teclado). Fotos seguidas (menos de 3 min desde
  //    la anterior), sin «Llegué» ni columna anterior, o más de 5 h → «hora dudosa» con el porqué (no se inventa) y no entra al
  //    promedio. Sin señal, la hora es la del celu en el momento de la foto (va por la cola de siempre).
  //  · Se guarda en campo.pasosObra.<tarea>.<unidad> {num, ini, fin, iniTs, finTs, min, estado "si", por, ts, fuente foto/lista/
  //    manual, iniFuente anterior/tarea/llegue/empece/orden/manual, n, v:157, dudosa?, dudosaMot?} (lo mismo que Modo obra ya
  //    usaba) y la tarea en campo.horasTarea.<tarea> = el rango de sus columnas. «Empecé» en campo.colInicio.<tarea>.<unidad>.
  //    Todo en «campo»: sin reglas nuevas. Mismo dato por Modo obra, la cámara B y Mis tareas clásica.
  //  · La oficina lo ve en el «📸 Avance» de la orden y en el cierre («Col 1 · 08:10–08:52 · 42 min · Juan y Pedro»); la
  //    verificación (v150) marca la hora dudosa; 🧠 › ⏱ Tiempos y la orden sugerida usan los minutos por unidad (≥ 3 buenas).
  //  · Las órdenes viejas con la hora de toda la tarea siguen andando: cuentan como un tramo. Apagado con __v157No.
  if (window.__tiempoCol) return;
  const off = () => !!window.__v157No;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const Lk = (s) => String(s || "").replace(/[~*\/\[\].`]/g, "_").slice(0, 120) || "_";
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const arr = (x) => (Array.isArray(x) ? x : []);
  const pad = (n) => String(n).padStart(2, "0");
  const intentar = (fn, def) => { try { return fn(); } catch (e) { return def; } };
  const ahora = () => (typeof window.__tcAhora == "function" ? +window.__tcAhora() : Date.now());
  const SEGUIDA = () => (+window.__tcSeguidaMin > 0 ? +window.__tcSeguidaMin : 3);   // menos minutos que esto desde la anterior = fotos seguidas (a confirmar)
  const LARGA = () => (+window.__tcLargaMin > 0 ? +window.__tcLargaMin : 300);       // más que esto en una sola columna = dudosa (a confirmar)
  const diaDe = (ts) => { const d = new Date(ts); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const hm = (ts) => { const d = new Date(ts); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const minDe = (h) => { const m = String(h || "").match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : null; };
  const tsDe = (dia, h) => { const m = minDe(h); if (m == null || !/^\d{4}-\d\d-\d\d$/.test(String(dia || ""))) return null; const d = new Date(dia + "T00:00:00"); d.setMinutes(m); return d.getTime(); };
  const durTxt = (m) => { m = Math.max(0, Math.round(+m || 0)); const h = Math.floor(m / 60), r = m % 60; return h ? h + " h" + (r ? " " + pad(r) + " min" : "") : r + " min"; };
  const fN = (n, d) => (Number(n) || 0).toLocaleString("es-AR", { maximumFractionDigits: d == null ? 1 : d });
  const primero = (n) => String(n || "").trim().split(/\s+/)[0] || "";
  const yJunta = (l) => (l.length <= 1 ? l.join("") : l.slice(0, -1).join(", ") + " y " + l[l.length - 1]);
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const otDe = (id) => ots().find((o) => o && o.id === id) || null;
  const campo = (o) => obj(o && o.campo);
  const cerrada = (o) => !!(o && (o.estado === "Terminada" || o.estado === "Anulada" || (o.cierre && o.cierre.cerradoTs)));
  const API = () => window.__mtAPI || null;
  const persona = () => { const a = API(); const p = a ? intentar(() => a.persona(), "") : ""; if (p) return p; const y = intentar(() => (window.PERMISOS && PERMISOS.yo && PERMISOS.yo()) || {}, {}); return y.persona || y.nombre || ""; };
  const pideNum = (cat) => intentar(() => !!(window.catFotoPideNum && window.catFotoPideNum(cat)), false);
  const catDe = (label) => intentar(() => (window.catFotoDeTarea ? window.catFotoDeTarea(label) : "otra"), "otra");
  const porMetro = (un) => /metro|^m$|^ml$|\bm\b/i.test(String(un || ""));
  function tareaDe(o, k) {
    const a = API(); const t = a && o ? intentar(() => (a.tareas(o) || []).find((x) => x.k === k), null) : null; if (t) return { label: t.label, un: t.un || "" };
    const c = intentar(() => (window.ACTIVIDADES_CATALOGO || []).find((x) => x.id === k), null); if (c) return { label: c.label, un: c.un || unDicc(k) };
    const mm = o && /^m\d+$/.test(String(k)) ? arr(o.actividadesManuales)[+String(k).slice(1)] : null; if (mm) return { label: mm.actividad || String(k), un: mm.unidad || "" };
    return { label: labelDe(k), un: unDicc(k) };
  }
  const unDicc = (k) => intentar(() => ((window.DICC_TAREAS || []).find((x) => x && x.id === k) || {}).un || "", "");
  const labelDe = (k) => intentar(() => { const c = (window.ACTIVIDADES_CATALOGO || []).find((x) => x.id === k); if (c) return c.label; const d = (window.DICC_TAREAS || []).find((x) => x && x.id === k); return d ? d.label : String(k); }, String(k));
  const esPorUnidad = (o, k, cat) => { const t = tareaDe(o, k); return pideNum(cat || catDe(t.label)) && !porMetro(t.un); };
  // lo marcado en este celu, hasta que la orden en memoria lo tenga (si llega una foto vieja de la base en el medio, no se pierde)
  const MEM = {};
  const pend = (o, k) => { const m = o ? MEM[o.id + "|" + Lk(k)] : null; if (!m) return {}; const P = obj(obj(campo(o).pasosObra)[Lk(k)]), out = {}; Object.keys(m).forEach((q) => { const x = P[q]; if (!x || (+x.ts || 0) < (+m[q].ts || 0)) out[q] = m[q]; else delete m[q]; }); return out; };
  const recordar = (o, k, key, paso) => { const id = o.id + "|" + Lk(k); (MEM[id] = MEM[id] || {})[key] = paso; };
  const pasos = (o, k) => Object.assign({}, obj(obj(campo(o).pasosObra)[Lk(k)]), pend(o, k));
  const tsFin = (x, dia) => (+x.finTs > 0 ? +x.finTs : tsDe(dia, x.fin));
  const tsIni = (x, dia) => (+x.iniTs > 0 ? +x.iniTs : tsDe(dia, x.ini));
  let cache = null, cacheTs = 0;
  const olvidar = () => { cache = null; };

  // ------------------------------------------------------------------ de dónde arranca cada columna
  function inicioPorDefecto(o, k, ts, yoN, key) {
    const dia = diaDe(ts), cands = [];
    const P = pasos(o, k);
    Object.keys(P).forEach((q) => { const x = P[q]; if (!x || x.estado !== "si" || q === key) return; const f = tsFin(x, dia); if (f && f < ts && diaDe(f) === dia) cands.push({ ts: f, f: "anterior", de: q, num: x.num }); });
    const PO = obj(campo(o).pasosObra);
    Object.keys(PO).forEach((kk) => { if (kk === Lk(k)) return; const PP = obj(PO[kk]); Object.keys(PP).forEach((q) => { const x = PP[q]; if (!x || x.estado !== "si" || (yoN && x.por && nk(x.por) !== nk(yoN))) return; const f = tsFin(x, dia); if (f && f < ts && diaDe(f) === dia) cands.push({ ts: f, f: "tarea" }); }); });
    const HT = obj(campo(o).horasTarea), TE = obj(campo(o).tareaEnv);
    Object.keys(HT).forEach((kk) => { if (kk === k || !TE[Lk(kk)]) return; const h = obj(HT[kk]); if (yoN && h.por && nk(h.por) !== nk(yoN)) return; const f = tsDe(dia, h.fin); if (f && f < ts) cands.push({ ts: f, f: "tarea" }); });
    const LL = obj(campo(o).llegada), mias = Object.keys(LL).map((q) => LL[q]).filter((x) => x && +x.ts > 0 && +x.ts < ts && diaDe(+x.ts) === dia);
    const mia = mias.filter((x) => yoN && nk(x.por) === nk(yoN)); (mia.length ? mia : mias).forEach((x) => cands.push({ ts: +x.ts, f: "llegue" }));
    if (cands.length) return cands.sort((a, b) => b.ts - a.ts)[0];
    const hi = tsDe(dia, o.horaInicio); if (hi && hi < ts && String(o.fecha || "") === dia) return { ts: hi, f: "orden" };
    return { ts: null, f: "" };
  }
  const INI_TXT = { anterior: "desde la columna anterior", tarea: "desde lo último que terminaste", llegue: "desde que llegaste", empece: "desde «Empecé»", orden: "desde la hora de la orden", manual: "corregido a mano" };
  function rango(P, dia) {
    let a = null, b = null, n = 0, sum = 0;
    Object.keys(P).forEach((q) => { const x = P[q]; if (!x || x.estado !== "si") return; const i = tsIni(x, dia), f = tsFin(x, dia); if (f) { n++; b = b == null ? f : Math.max(b, f); } if (i) a = a == null ? i : Math.min(a, i); if (i && f && f > i) sum += Math.round((f - i) / 60000); });
    return { a, b, n, sum };
  }
  function dudaDe(iniTs, finTs, iniF) {
    if (iniF === "manual") return "";
    if (!iniTs) return "sin hora de inicio (no hay «Llegué» ni columna anterior)";
    const ms = finTs - iniTs;
    if (iniF === "anterior" && ms < SEGUIDA() * 60000) return `fotos seguidas: ${Math.max(0, Math.round(ms / 60000))} min desde la columna anterior`;
    if (ms > LARGA() * 60000) return `más de ${Math.round(LARGA() / 60)} h en una sola columna`;
    if (iniF === "orden") return "sin «Llegué»: se contó desde la hora de la orden";
    return "";
  }
  function guardar(o, patch) {
    const a = API();
    if (a && a.guardar) { a.guardar(o, patch); return true; }
    if (typeof window.mtCampoGuardar == "function" && window.mtCampoGuardar(o.id, patch)) return true;
    if (typeof window.fbOtCampo == "function") { Promise.resolve(window.fbOtCampo(o.id, patch)).catch((e) => console.warn("[tiempoCol]", e)); return true; }
    return false;
  }
  function htPatch(o, k, P, yoN) {
    const r = rango(P, String(o.fecha || diaDe(ahora())));
    return r.a && r.b && r.b > r.a ? { ini: hm(r.a), fin: hm(r.b), por: yoN, ts: Date.now(), deCols: r.n, minCols: r.sum } : null;
  }

  // ------------------------------------------------------------------ marcar el fin de una columna (foto o «Lista»)
  function marcar(o, k, num, ts, fuente, op) {
    op = op || {};
    if (off() || !o || !k || !String(num || "").trim() || cerrada(o)) return null;
    if (!esPorUnidad(o, k, op.cat)) return null;
    num = String(num).trim(); ts = +ts || ahora();
    const key = Lk(nk(num)), P = Object.assign({}, pasos(o, k)), ex = obj(P[key]), yoN = op.por || persona(), dia = diaDe(ts);
    let iniTs = null, iniF = "", de = null;
    const exI = ex.estado === "si" ? tsIni(ex, dia) : null;
    if (exI && diaDe(exI) === dia && exI < ts) { iniTs = exI; iniF = ex.iniFuente || "anterior"; }   // otra foto de la misma columna: el inicio queda
    else {
      const em = obj(obj(obj(campo(o).colInicio)[Lk(k)])[key]);
      if (+em.ts > 0 && +em.ts < ts && diaDe(+em.ts) === dia) { iniTs = +em.ts; iniF = "empece"; }
      else { const c = inicioPorDefecto(o, k, ts, yoN, key); iniTs = c.ts; iniF = c.f; de = c.de || null; }
    }
    const exF = ex.estado === "si" ? tsFin(ex, dia) : null, finTs = exF && diaDe(exF) === dia ? Math.max(exF, ts) : ts;
    const min = iniTs ? Math.max(0, Math.round((finTs - iniTs) / 60000)) : null;
    const duda = dudaDe(iniTs, finTs, iniF);
    const paso = { num, ini: iniTs ? hm(iniTs) : "", fin: hm(finTs), iniTs: iniTs || null, finTs, min, estado: "si", por: yoN, ts: Date.now(), fuente: fuente || "foto", iniFuente: iniF, n: (+ex.n || 0) + 1, v: 157, dudosa: !!duda, dudosaMot: duda };
    if (de) paso.iniDe = P[de] && P[de].num ? P[de].num : "";
    const patch = {}, base = "campo.pasosObra." + Lk(k) + ".";
    patch[base + key] = paso; P[key] = paso; recordar(o, k, key, paso);
    if (duda && iniF === "anterior" && de && P[de] && !P[de].dudosa && P[de].iniFuente !== "manual") {   // la anterior seguramente tiene el tiempo de varias
      const pr = Object.assign({}, P[de], { dudosa: true, dudosaMot: "la columna siguiente se sacó enseguida: puede tener el tiempo de varias columnas" });
      patch[base + de] = pr; P[de] = pr; recordar(o, k, de, pr);
    }
    const ht = htPatch(o, k, P, yoN); if (ht) patch["campo.horasTarea." + k] = ht;
    guardar(o, patch); olvidar();
    const hechas = Object.keys(P).filter((q) => P[q] && P[q].estado === "si").length;
    return { otId: o.id, k, num, ini: paso.ini, fin: paso.fin, min, dudosa: paso.dudosa, dudosaMot: duda, iniFuente: iniF, hechas };
  }
  function empece(o, k, num) {
    if (off() || !o || !k || !num || cerrada(o)) return null;
    const ts = ahora(), x = { ts, por: persona(), num: String(num) };
    guardar(o, { ["campo.colInicio." + Lk(k) + "." + Lk(nk(num))]: x });
    return x;
  }
  const empezo = (o, k, num) => { const x = obj(obj(obj(campo(o).colInicio)[Lk(k)])[Lk(nk(num))]); return +x.ts > 0 && diaDe(+x.ts) === diaDe(ahora()) && !(obj(pasos(o, k)[Lk(nk(num))]).estado === "si") ? x : null; };
  // − / + de 5 min: cambia el inicio (el fin es la foto)
  function ajustar(o, k, num, delta) {
    if (off() || !o || cerrada(o)) return null;
    const key = Lk(nk(num)), P = Object.assign({}, pasos(o, k)), ex = obj(P[key]); if (ex.estado !== "si") return null;
    const dia = String(o.fecha || diaDe(ahora())), f = tsFin(ex, dia); if (!f) return null;
    let i = tsIni(ex, dia) || f;
    i = i - (+delta || 0) * 60000; if (i > f - 60000) i = f - 60000;
    const min = Math.round((f - i) / 60000);
    const paso = Object.assign({}, ex, { ini: hm(i), iniTs: i, min, iniFuente: "manual", editado: true, dudosa: false, dudosaMot: "", ts: Date.now(), por: ex.por || persona() });
    if (ex.dudosa && ex.dudosaMot) paso.dudosaAntes = ex.dudosaMot;
    P[key] = paso; recordar(o, k, key, paso);
    const patch = { ["campo.pasosObra." + Lk(k) + "." + key]: paso }, ht = htPatch(o, k, P, persona()); if (ht) patch["campo.horasTarea." + k] = ht;
    guardar(o, patch); olvidar();
    return { otId: o.id, k, num: ex.num || num, ini: paso.ini, fin: paso.fin, min, dudosa: false, dudosaMot: "", iniFuente: "manual" };
  }

  // ------------------------------------------------------------------ leer
  function tramos(o, k) {
    const dia = String((o && o.fecha) || ""), P = pasos(o, k);
    const l = Object.keys(P).map((q) => P[q]).filter((x) => x && x.estado === "si" && x.num).map((x) => {
      const i = tsIni(x, dia), f = tsFin(x, dia), min = x.min != null && isFinite(+x.min) ? +x.min : i && f && f > i ? Math.round((f - i) / 60000) : null;
      return { num: String(x.num), ini: x.ini || "", fin: x.fin || "", min, dudosa: !!x.dudosa, dudosaMot: x.dudosaMot || "", por: x.por || "", fuente: x.fuente || "", iniFuente: x.iniFuente || "", editado: !!x.editado, v157: x.v === 157, f: f || 0, key: Lk(nk(x.num)) };
    }).sort((a, b) => a.f - b.f || String(a.fin).localeCompare(String(b.fin)));
    if (l.length) return l;
    const h = obj(obj(campo(o).horasTarea)[k]);
    if (h.ini && h.fin) { const a = minDe(h.ini), b = minDe(h.fin); return [{ num: "", tarea: true, ini: h.ini, fin: h.fin, min: a != null && b != null && b > a ? b - a : null, dudosa: false, dudosaMot: "", por: h.por || "" }]; }
    return [];
  }
  function genteTarea(o, k) {
    const as = obj(o.asignada)[k]; if (as) return [String(as)];
    const eq = arr(obj(o.equipoTarea)[k]); if (eq.length) return eq.map(String);
    const rp = arr(obj(o.reparto)[k]).map((x) => (x && x.nombre) || x).filter(Boolean); if (rp.length) return rp.map(String);
    return arr(o.personal).map((x) => (typeof x == "string" ? x : x && x.nombre) || "").filter(Boolean);
  }
  const quienes = (o, k) => yJunta(genteTarea(o, k).map(primero));
  function lineaTxt(t) { return `${t.num} · ${t.ini && t.fin ? t.ini + "–" + t.fin : t.fin ? "terminó " + t.fin : ""}${t.min != null ? " · " + durTxt(t.min) : ""}`; }

  // ------------------------------------------------------------------ pantallas de la cuadrilla
  function lineaHtml(r, abierto) {
    if (!r) return "";
    const tit = esc(r.num) + " lista";
    return `<div class="tc-linea${r.dudosa ? " du" : ""}${abierto ? " ab" : ""}" data-tcot="${esc(r.otId)}" data-tck="${esc(r.k)}" data-tcnum="${esc(r.num)}" role="status"><span class="tc-tx">✓ <b>${tit}</b>${r.min != null ? " · " + esc(durTxt(r.min)) : ""}${r.dudosa ? `<small>⚠ Hora dudosa: ${esc(r.dudosaMot)}. Si sabés cuánto tardaron, tocá «cambiar».</small>` : r.iniFuente === "empece" ? "<small>desde que tocaste «Empecé»</small>" : ""}</span>${abierto ? "" : '<button type="button" class="tc-cb" data-tc="cambiar">cambiar</button>'}<span class="tc-pm"${abierto ? "" : " hidden"}><button type="button" data-tc="-" aria-label="5 minutos menos">−5</button><button type="button" data-tc="+" aria-label="5 minutos más">+5</button></span></div>`;
  }
  function filaRes(o, k, t) {
    const r = { otId: o.id, k, num: t.num, min: t.min, dudosa: t.dudosa, dudosaMot: t.dudosaMot };
    return `<div class="tc-linea tc-fila ab${t.dudosa ? " du" : ""}" data-tcot="${esc(o.id)}" data-tck="${esc(k)}" data-tcnum="${esc(t.num)}"><span class="tc-tx"><b>${esc(t.num)}</b> · ${esc(t.ini || "?")}–${esc(t.fin)} · <b>${r.min != null ? esc(durTxt(r.min)) : "—"}</b>${t.dudosa ? `<small>⚠ ${esc(t.dudosaMot)}</small>` : ""}</span><span class="tc-pm"><button type="button" data-tc="-" aria-label="5 minutos menos">−5</button><button type="button" data-tc="+" aria-label="5 minutos más">+5</button></span></div>`;
  }
  function totalTxt(o, k) {
    const l = tramos(o, k).filter((t) => !t.tarea), r = rango(pasos(o, k), String(o.fecha || ""));
    const sum = l.reduce((s, t) => s + (t.min || 0), 0);
    return l.length ? `Total: ${durTxt(sum)}${r.a && r.b ? ` (de ${hm(r.a)} a ${hm(r.b)})` : ""} · ${l.length} ${l.length === 1 ? "columna" : "columnas"}` : "";
  }
  function resumenHtml(o, k) {
    const l = tramos(o, k).filter((t) => !t.tarea);
    return `<div class="tc-res" data-tcot="${esc(o.id)}" data-tck="${esc(k)}"><div class="tc-res-t">⏱ El tiempo de cada una salió solo de la foto. Si algo no está bien, tocá − / +.</div>${l.map((t) => filaRes(o, k, t)).join("")}<div class="tc-tot">${esc(totalTxt(o, k))}</div></div>`;
  }
  // Mis tareas clásica: el cartelito de «📤 Listo, enviar esta tarea» no pide horas si ya están por columna
  function etHtml(o, p) {
    if (off() || !o || !p) return "";
    const l = tramos(o, p.k).filter((t) => !t.tarea); if (!l.length) return "";
    const r = rango(pasos(o, p.k), String(o.fecha || ""));
    if (!(r.a && r.b && r.b > r.a)) return "";
    return `<label style="display:block;font-weight:700;font-size:14px;margin:0 0 6px;">La hora de cada columna</label>${resumenHtml(o, p.k)}<div class="et-h" style="display:none"><input type="time" id="etIni" aria-label="Hora de inicio" value="${esc(hm(r.a))}"><span>→</span><input type="time" id="etFin" aria-label="Hora de fin" value="${esc(hm(r.b))}"></div><div class="et-dur" id="etDur"></div>`;
  }
  // Modo obra: «▶ Empecé Col N», «✓ Col N lista» (sin foto), «No se hizo el resto», y la última columna
  function obraHtml(o, pa) {
    if (off() || !o || !pa || !pa.p || !pa.u || pa.u.tipo !== "unidad") return "";
    const l = tramos(o, pa.p.k).filter((t) => !t.tarea && t.v157), ult = l[l.length - 1];
    let h = "";
    if (pa.fase === "foto" && pa.it) {
      const em = empezo(o, pa.p.k, pa.it.num);
      h += em ? `<span class="tc-emp">▶ Empezaste ${esc(pa.it.num)} a las ${esc(hm(em.ts))}</span>` : `<button type="button" class="tc-ob" data-cd="tcEmpece">▶ Empecé ${esc(pa.it.num)}</button>`;
      h += `<button type="button" class="tc-ob" data-cd="tcLista">✓ ${esc(pa.it.num)} lista sin foto</button>`;
      if (pa.u.items.some((x) => x.paso && x.paso.estado !== "no")) h += `<button type="button" class="tc-ob tc-no" data-cd="tcNoResto">No se hizo el resto</button>`;
    }
    const uT = ult ? `<div class="tc-ult">Última: ${esc(ult.num)} · ${ult.min != null ? esc(durTxt(ult.min)) : "sin hora de inicio"}${ult.dudosa ? " · ⚠ hora dudosa" : ""}</div>` : "";
    return h || uT ? `<div class="tc-obra">${uT}${h ? `<div class="tc-obs">${h}</div>` : ""}</div>` : "";
  }
  // cartelito suelto (Mis tareas clásica, cámara B, «Lista» de Modo obra)
  let avisoT = null;
  function aviso(r) {
    if (!r) return;
    let v = $("tcAviso"); if (!v) { v = document.createElement("div"); v.id = "tcAviso"; v.className = "no-print"; document.body.appendChild(v); }
    v.innerHTML = lineaHtml(r); v.hidden = false; v.__r = r;
    clearTimeout(avisoT); avisoT = setTimeout(cerrarAviso, 9000);
  }
  function cerrarAviso() { const v = $("tcAviso"); if (v && !v.contains(document.activeElement)) v.hidden = true; else if (v) { clearTimeout(avisoT); avisoT = setTimeout(cerrarAviso, 6000); } }
  // clics de − / + y «cambiar» (en cualquier lado: hoja de Modo obra, cartelito de Mis tareas, aviso suelto)
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-tc]"); if (!b) return;
    const ln = b.closest(".tc-linea"); if (!ln) return;
    e.preventDefault();
    if (b.dataset.tc === "cambiar") { ln.classList.add("ab"); const pm = ln.querySelector(".tc-pm"); pm && (pm.hidden = false); b.remove(); clearTimeout(avisoT); return; }
    const o = otDe(ln.dataset.tcot); if (!o) return;
    const r = ajustar(o, ln.dataset.tck, ln.dataset.tcnum, b.dataset.tc === "+" ? 5 : -5); if (!r) return;
    const o2 = otDe(o.id) || o;
    if (ln.classList.contains("tc-fila")) { const t = tramos(o2, r.k).find((x) => nk(x.num) === nk(r.num)); if (t) ln.outerHTML = filaRes(o2, r.k, t); }
    else ln.outerHTML = lineaHtml(r, true);
    const res = document.querySelector(`.tc-res[data-tcot="${CSS.escape(o.id)}"][data-tck="${CSS.escape(r.k)}"] .tc-tot`); res && (res.textContent = totalTxt(o2, r.k));
    const rg = rango(pasos(o2, r.k), String(o2.fecha || "")), a = $("etIni"), z = $("etFin");
    if (a && z && document.querySelector("#etPop .tc-res") && rg.a && rg.b) { a.value = hm(rg.a); z.value = hm(rg.b); }
    clearTimeout(avisoT); avisoT = setTimeout(cerrarAviso, 9000);
  });
  // la foto (Mis tareas clásica, cámara B): el fin de esa columna es la foto
  function trasFoto(meta) {
    if (off() || !meta || meta.__tcYa || meta.__reintento || !meta.otId || !meta.k || meta.k === "seguridad" || !String(meta.num || "").trim()) return null;
    if (meta.origen && meta.origen !== "cuadrilla") return null;
    const o = otDe(meta.otId); if (!o || cerrada(o)) return null;
    const r = marcar(o, meta.k, meta.num, ahora(), "foto", { cat: meta.cat, por: meta.por });
    if (r) aviso(r);
    return r;
  }
  let profF = 0, profO = 0;
  function envolver() {
    const g = window.guardarFotoObra; if (typeof g != "function" || g.__tc) return !!g;
    const n = function (f, meta) { if (!profF) { try { trasFoto(meta); } catch (e) { console.warn("[tiempoCol] foto", e); } } profF++; let r; try { r = g.apply(this, arguments); } finally { profF--; } return r; };   // si otra envoltura me envuelve, la cuenta va una sola vez
    window.__heredar && window.__heredar(n, g); n.__tc = 1; window.guardarFotoObra = n; return true;
  }

  // ------------------------------------------------------------------ la oficina
  function oficinaHtml(o) {
    if (off() || !o) return "";
    const PO = obj(campo(o).pasosObra), ks = Object.keys(PO).filter((kk) => Object.keys(obj(PO[kk])).some((q) => PO[kk][q] && PO[kk][q].estado === "si" && PO[kk][q].fin));
    if (!ks.length) return "";
    const kReal = (kk) => { const l = arr(o.actividades).concat(Object.keys(obj(campo(o).marcas))); return l.find((x) => Lk(x) === kk) || kk; };
    let h = '<div class="tc-of"><b class="tc-oft">⏱ Tiempo de cada columna</b>';
    ks.forEach((kk) => {
      const k = kReal(kk), l = tramos(o, k).filter((t) => !t.tarea), q = quienes(o, k), buenas = l.filter((t) => !t.dudosa && t.min != null);
      const med = mediana(buenas.map((t) => t.min));
      h += `<div class="tc-ofk">${esc(tareaDe(o, k).label)} <small>${l.length} ${l.length === 1 ? "columna" : "columnas"}${med != null ? " · mediana " + esc(durTxt(med)) : ""}</small></div>`;
      l.forEach((t) => { h += `<div class="tc-ofl${t.dudosa ? " du" : ""}">${esc(lineaTxt(t))}${q ? " · " + esc(q) : ""}${t.editado ? " · corregido" : ""}${t.dudosa ? ` <span class="tc-du">⚠ hora dudosa: ${esc(t.dudosaMot)}</span>` : ""}</div>`; });
    });
    return h + "</div>";
  }
  function envolverOficina() {
    const g = window.__cdOficinaHtml; if (typeof g != "function" || g.__tc) return !!(g && g.__tc);
    const n = function (ot) { profO++; let h; try { h = g.apply(this, arguments); } finally { profO--; } if (profO) return h; let x = ""; try { x = oficinaHtml(ot); } catch (e) { x = ""; } return (h || "") + x; };
    window.__heredar && window.__heredar(n, g); n.__tc = 1; window.__cdOficinaHtml = n; return true;
  }

  // ------------------------------------------------------------------ promedios (🧠 Tiempos, orden sugerida, asistente)
  function mediana(l) { const v = l.filter((x) => x != null && isFinite(+x)).map(Number).sort((a, b) => a - b); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : Math.round((v[m - 1] + v[m]) / 2 * 10) / 10; }
  function registros() {
    if (cache && Date.now() - cacheTs < 5000) return cache;
    const l = [];
    ots().forEach((o) => {
      if (!o || o.estado === "Anulada") return;
      const PO = obj(campo(o).pasosObra), dia = String(o.fecha || "");
      const kReal = (kk) => { const ll = arr(o.actividades).concat(Object.keys(obj(campo(o).marcas))); return ll.find((x) => Lk(x) === kk) || kk; };
      Object.keys(PO).forEach((kk) => {
        const k = kReal(kk), g = genteTarea(o, k), P = obj(PO[kk]);
        Object.keys(P).forEach((q) => {
          const x = P[q]; if (!x || x.estado !== "si" || !x.num) return;
          const i = tsIni(x, dia), f = tsFin(x, dia), min = x.min != null && isFinite(+x.min) ? +x.min : i && f && f > i ? Math.round((f - i) / 60000) : null;
          if (min == null) return;
          l.push({ k, num: String(x.num), min, dudosa: !!x.dudosa || !(min > 0), mot: x.dudosaMot || (!(min > 0) ? "0 min" : ""), np: Math.max(1, g.length), personas: g, crew: g.map(primero).sort().join(", "), fecha: dia, ot: o.numero || "", otId: o.id, obra: o.plazaNombre || "", obraId: String(o.plazaId || ""), cerrada: cerrada(o) });
        });
      });
    });
    cache = l; cacheTs = Date.now(); return l;
  }
  function deTarea(k, filtro) {
    filtro = filtro || {};
    let l = registros().filter((r) => r.k === k);
    if (filtro.obra) l = l.filter((r) => r.obraId === String(filtro.obra) || nk(r.obra).indexOf(nk(filtro.obra)) >= 0);
    if (filtro.persona) l = l.filter((r) => r.personas.some((p) => nk(p).indexOf(nk(filtro.persona)) >= 0));
    if (filtro.desde) l = l.filter((r) => r.fecha >= filtro.desde);
    if (filtro.hasta) l = l.filter((r) => r.fecha <= filtro.hasta);
    const ok = l.filter((r) => !r.dudosa), du = l.filter((r) => r.dudosa);
    const grupo = (fn) => { const g = {}; ok.forEach((r) => fn(r).forEach((c) => { (g[c] = g[c] || []).push(r.min); })); return Object.keys(g).map((c) => ({ quien: c, n: g[c].length, mediana: mediana(g[c]) })).sort((a, b) => a.mediana - b.mediana); };
    return {
      k, tarea: labelDe(k), un: unDicc(k), n: ok.length, dudosas: du.length, mediana: mediana(ok.map((r) => r.min)),
      minimo: ok.length ? Math.min.apply(null, ok.map((r) => r.min)) : null, maximo: ok.length ? Math.max.apply(null, ok.map((r) => r.min)) : null,
      usable: ok.length >= 3, porCuadrilla: grupo((r) => [r.crew]), porPersona: grupo((r) => r.personas.map(String)), porGente: grupo((r) => [r.np + (r.np === 1 ? " persona" : " personas")]),
      dudosasDetalle: du.slice(-8).map((r) => ({ num: r.num, ot: r.ot, fecha: r.fecha, min: r.min, motivo: r.mot })),
      mediciones: ok.slice(-12).map((r) => ({ num: r.num, min: r.min, ot: r.ot, fecha: r.fecha, obra: r.obra, quienes: r.crew }))
    };
  }
  const tareasMedidas = () => { const s = {}; registros().forEach((r) => { s[r.k] = 1; }); return Object.keys(s); };
  // para la orden sugerida: unidades por hora-hombre desde la mediana de (minutos × personas), con 3 o más buenas
  function medidos() {
    if (off()) return {};
    const out = {}, g = {};
    registros().filter((r) => !r.dudosa).forEach((r) => { (g[r.k] = g[r.k] || []).push(r.min * r.np); });
    Object.keys(g).forEach((k) => { if (g[k].length < 3) return; const mhh = mediana(g[k]); if (!(mhh > 0)) return; const m = mediana(registros().filter((r) => r.k === k && !r.dudosa).map((r) => r.min)); out[k] = { porHH: 60 / mhh, n: g[k].length, porUnidad: true, minUnidad: m, txtN: `${g[k].length} columnas medidas, mediana ${durTxt(m)} por columna` }; });
    return out;
  }
  function aprendeHtml() {
    if (off()) return "";
    const ks = tareasMedidas().sort((a, b) => labelDe(a).localeCompare(labelDe(b), "es"));
    const filas = ks.map((k) => deTarea(k));
    return `<div class="card tc-ap"><h2>⏱ Minutos por columna <span class="h2-sub">cada columna, caja, luminaria o jabalina con su hora · el promedio vale desde 3 mediciones buenas</span></h2>
${filas.length ? `<div class="sg-tabw"><table class="sg-tab tabla-tarjetas"><thead><tr><th>Tarea</th><th>Mediana</th><th>Rango</th><th>Mediciones</th><th>Dudosas (aparte)</th><th>Por cuadrilla</th><th>Por persona</th></tr></thead><tbody>${filas.map((x) => `<tr data-tck="${esc(x.k)}"><td><b>${esc(x.tarea)}</b></td><td class="n" data-label="Mediana">${x.mediana != null ? esc(durTxt(x.mediana)) : "—"}</td><td class="n" data-label="Rango">${x.minimo != null ? esc(durTxt(x.minimo) + " a " + durTxt(x.maximo)) : "—"}</td><td class="n" data-label="Mediciones">${x.n}${x.usable ? "" : " (pocas)"}</td><td class="n" data-label="Dudosas">${x.dudosas}</td><td data-label="Por cuadrilla">${esc(x.porCuadrilla.slice(0, 3).map((c) => c.quien + ": " + durTxt(c.mediana) + " (" + c.n + ")").join(" · ") || "—")}</td><td data-label="Por persona">${esc(x.porPersona.slice(0, 4).map((c) => primero(c.quien) + ": " + durTxt(c.mediana)).join(" · ") || "—")}</td></tr>`).join("")}</tbody></table></div>` : '<div class="sg-av info">ⓘ Todavía no hay columnas con su hora. Sale sola cuando la cuadrilla saca la foto de cada columna (Modo obra, la cámara o Mis tareas).</div>'}
<div class="hint">El fin de cada columna es la hora de su foto (o «Lista»); el inicio, cuando terminó la anterior (o «Llegué», o «Empecé»). Las dudosas (fotos seguidas, sin hora de inicio, más de ${Math.round(LARGA() / 60)} h) no entran al promedio. La orden sugerida usa la mediana cuando hay 3 o más. Por tipo de columna (7/10 m, cantidad de artefactos): a confirmar, la orden todavía no guarda eso de cada columna (PRFV y metálica ya van separadas por tarea).</div></div>`;
  }
  // el asistente: «¿cuánto tardan en hacer un tablerito?», «¿quién es más rápido izando?»
  function paraIa(a) {
    a = a || {};
    let ks = tareasMedidas();
    if (a.tarea) { const q = nk(a.tarea); const m = ks.filter((k) => nk(k) === q || nk(labelDe(k)).indexOf(q) >= 0 || q.split(" ").filter((w) => w.length > 3).some((w) => nk(labelDe(k)).indexOf(w.replace(/s$/, "")) >= 0)); ks = m; }
    const filtro = { obra: a.obra || "", persona: a.persona || "", desde: a.desde || "", hasta: a.hasta || "" };
    const l = ks.map((k) => deTarea(k, filtro)).filter((x) => x.n || x.dudosas);
    return { tareas: l.map((x) => ({ tarea: x.tarea, mediciones: x.n, dudosasAparte: x.dudosas, medianaMin: x.mediana, rangoMin: x.minimo != null ? [x.minimo, x.maximo] : null, alcanza: x.usable, porCuadrilla: x.porCuadrilla.slice(0, 6), porPersona: x.porPersona.slice(0, 8), porCantidadDeGente: x.porGente, ultimas: x.mediciones, dudosas: x.dudosasDetalle })), sinDatos: !l.length };
  }

  setInterval(() => { envolver(); envolverOficina(); }, 900); envolver(); envolverOficina();
  window.__tiempoCol = { on: () => !off(), ahora, pend, marcar, empece, empezo, ajustar, tramos, quienes, lineaHtml, resumenHtml, etHtml, obraHtml, aviso, oficinaHtml, registros, deTarea, tareasMedidas, medidos, mediana, aprendeHtml, paraIa, trasFoto, durTxt, olvidar };
})();
