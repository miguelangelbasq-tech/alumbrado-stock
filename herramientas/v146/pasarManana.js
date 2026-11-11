(function () {
  "use strict";
  // v146 · «Lo que no se terminó hoy pasa solo a mañana» (pedido de Ángel, 10/11/2026: «durante el día cambian las tareas;
  // lo que no se terminó hoy tiene que pasar al día siguiente y toda la semana se tiene que ir actualizando, automático»).
  //  · Qué pasa: de cada orden del día (no anulada) cada tarea que «no se hizo» (tareaEnv), que no se marcó, o que quedó a
  //    medias (marca con menos de lo previsto, pasosObra, o el cierre con menos de lo previsto). Nunca dos veces: si ya se pasó
  //    (pasadoA, a mano con «📅 Lo que falta, a otro día» o por el cierre por voz) o si la tarea ya está en la orden de mañana,
  //    no se suma; tampoco si en la orden de mañana la sacaron a mano (tareasSacadas) o si alguien tocó «Deshacer».
  //  · A dónde: la orden YA EMITIDA de esa obra del próximo día hábil (se suma la tarea y su cantidad, la gente no cambia:
  //    respeta el mínimo de 2 en obra que ya tiene). Si la orden de mañana ya está llena con los rendimientos (HH), «no entra:
  //    queda para el <día>» y va al borrador de la orden sugerida de ese día. Si mañana no hay orden de esa obra, queda en el
  //    borrador de la sugerida (NO se emite sola).
  //  · Cuándo: a la hora del ajuste (de entrada 18:00) o apenas la oficina cierra la orden de hoy; si nadie abrió la app, la
  //    próxima vez que alguien de la oficina la abra (el día hábil siguiente). El primer aparato de Administración u Oficina toma
  //    el turno con una transacción en configEquipo/salud.pasarManana.<día> (como el supervisor de la v136): una sola vez.
  //  · Aviso «Se pasaron N tareas de hoy a mañana: … · Deshacer» (Deshacer vuelve todo atrás) y auditoría sugerida_pasar.
  //  · Ajuste en Órdenes sugeridas › Ajustes: «automático (18:00) / preguntarme / no» (de entrada automático).
  //  Sin reglas nuevas. Pruebas viejas: window.__v146No (salvo v146:true en h.js).
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const r2 = (v) => Math.round((+v || 0) * 100) / 100;
  const intentar = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const clon = (x) => { try { return x == null ? x : JSON.parse(JSON.stringify(x)); } catch (e) { return null; } };
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  const Lk = (s) => String(s || "").replace(/[~*\/\[\].`]/g, "_").slice(0, 120) || "_";
  const fN = (v) => intentar(() => fmt(r2(v), Number.isInteger(r2(v)) ? 0 : 1), String(r2(v)));
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const ahora = () => new Date(window.__pmAhora || Date.now());
  const hoyISO = () => iso(ahora());
  const deIso = (s) => { const m = String(s || "").match(/^(\d{4})-(\d\d)-(\d\d)/); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null; };
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const fDia = (f) => { const d = deIso(f); return d ? DIAS[d.getDay()] + " " + pad(d.getDate()) + "/" + pad(d.getMonth() + 1) : String(f || ""); };
  const hmMin = (s) => { const m = String(s || "").match(/^(\d{1,2}):(\d\d)/); return m ? +m[1] * 60 + +m[2] : null; };
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const SG = () => window.__sugerida || null;
  const permiso = (h) => intentar(() => (window.PERMISOS && PERMISOS.permiso ? PERMISOS.permiso(h) : "oculto"), "oculto");
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  const liviano = () => intentar(() => !!(window.__modoDatos && window.__modoDatos.liviano()), false);
  const rolYo = () => intentar(() => String((PERMISOS.yo() || {}).rol || ""), "");
  const yoMail = () => String((window.__fbUser || {}).email || "");
  function puede() { return !window.__v146No && !window.__sugNo && !!window.__fbUser && !liviano() && !esCrew() && (rolYo() === "admin" || rolYo() === "oficina") && permiso("parte") === "editar" && !!SG(); }
  const cfg = () => { const C = intentar(() => SG().cfg(), {}) || {}; return { modo: ["auto", "preguntar", "no"].indexOf(C.pasarModo) >= 0 ? C.pasarModo : "auto", hora: C.pasarHora || "18:00" }; };
  const proxHabil = (f) => intentar(() => SG().proxHabil(f), "");
  const cerrada = (o) => !!(o && o.cierre && o.cierre.cerradoTs);
  const abierta = (o) => !!o && o.estado !== "Anulada" && o.estado !== "Terminada" && !cerrada(o);
  const catalogo = () => intentar(() => (typeof ACTIVIDADES_CATALOGO != "undefined" ? ACTIVIDADES_CATALOGO : []), []);
  const labelDe = (k) => { const a = catalogo().find((x) => x && x.id === k); return a ? a.label : intentar(() => SG().labelDe(k), k); };
  const unDe = (k) => intentar(() => { const b = (typeof window.baremoActual == "function" && window.baremoActual()) || {}; return (b[k] && b[k].un) || ""; }, "");
  const nombreObra = (o) => { const n = String((o && (o.plazaNombre || o.obra)) || ""); return window.__fmtNombre ? window.__fmtNombre.obra(n) : n.toUpperCase(); };
  const dePasado = (o, k) => { const p = obj(o && o.pasadoA); return p[k] || p[Lk(k)] || null; };
  const sacadas = (o) => arr(o && o.tareasSacadas).map((x) => (typeof x == "string" ? x : x && (x.k || x.tarea))).filter(Boolean);

  // ---------------------------------------------------------------- qué quedó sin terminar de un día
  function envDe(o, k) { const x = obj(obj(obj(o.campo).tareaEnv)[Lk(k)]); const l = Object.keys(x).map((p) => x[p]).filter((v) => v && v.estado); return l.length ? l.sort((a, b) => (b.ts || 0) - (a.ts || 0))[0] : null; }
  function pasosSi(o, k) { const p = obj(obj(obj(o.campo).pasosObra)[Lk(k)] || obj(obj(o.campo).pasosObra)[k]); return Object.keys(p).filter((u) => p[u] && p[u].estado === "si").length; }
  function faltaDe(o, k) {
    const prev = num(obj(o.previsto)[k]);
    if (cerrada(o)) { const h = num(obj(o.cierre.cantidades)[k]); return prev > 0 && h < prev - 1e-6 ? { falta: r2(prev - h), motivo: `se cerró con ${fN(h)} de ${fN(prev)}`, hecho: h } : null; }
    const e = envDe(o, k), m = obj(obj(obj(o.campo).marcas)[Lk(k)]), ps = pasosSi(o, k);
    const hecho = m.hecho ? (num(m.cant) || ps || 0) : ps;
    if (e && e.estado === "no") return { falta: prev > 0 ? r2(Math.max(0, prev - hecho)) : 0, motivo: "no se hizo" + (m.motivo || e.motivo ? " (" + (m.motivo || e.motivo) + ")" : ""), hecho };
    if (m.hecho) { if (prev > 0 && hecho > 0 && hecho < prev - 1e-6) return { falta: r2(prev - hecho), motivo: `quedó a medias: ${fN(hecho)} de ${fN(prev)}`, hecho }; return null; }
    if (e && e.estado === "si") return null;
    if (ps > 0) return prev > 0 && ps < prev ? { falta: r2(prev - ps), motivo: `quedó a medias: ${fN(ps)} de ${fN(prev)}`, hecho: ps } : null;
    return { falta: prev, motivo: "no se marcó", hecho: 0 };
  }
  function pendientes(D, soloOt) {
    const out = [];
    ots().forEach((o) => {
      if (!o || o.estado === "Anulada" || String(o.fecha || "").slice(0, 10) !== D || !o.plazaId || o.sinPlaza || o.plazaId === "__sinObra") return;
      if (soloOt && o.id !== soloOt) return;
      const sac = sacadas(o);
      arr(o.actividades).filter((k) => typeof k == "string" && k && sac.indexOf(k) < 0).forEach((k) => {
        if (dePasado(o, k)) return;
        const f = faltaDe(o, k); if (!f) return;
        if (!(f.falta > 0) && num(obj(o.previsto)[k]) > 0) return;
        out.push({ src: o.id, srcNum: o.numero || "", obraId: String(o.plazaId), obra: nombreObra(o), k, label: labelDe(k), un: unDe(k), cant: f.falta, motivo: f.motivo });
      });
    });
    return out;
  }

  // ---------------------------------------------------------------- a dónde va cada una
  const deshechos = () => intentar(() => JSON.parse(localStorage.getItem("ema.pm.deshecho") || "{}"), {}) || {};
  function destinoDe(obraId, f) { return ots().find((o) => o && abierta(o) && String(o.plazaId) === String(obraId) && String(o.fecha || "").slice(0, 10) === f) || null; }
  function rendHH(k) { const r = intentar(() => SG().rend(k, {}), null); return r && num(r.porHH) > 0 ? num(r.porHH) : 0; }
  function lleno(dest, extra, f) {
    const gente = arr(dest.personal).length || arr(dest.personalNombres).length; if (!gente) return false;
    const disp = num(intentar(() => SG().horasDia(f), 8)) * gente; if (!(disp > 0)) return false;
    let usado = 0, sabe = true;
    arr(dest.actividades).forEach((k) => { const p = num(obj(dest.previsto)[k]), h = rendHH(k); if (p > 0) { if (h > 0) usado += p / h; else sabe = false; } });
    extra.forEach((x) => { const h = rendHH(x.k); if (x.cant > 0) { if (h > 0) usado += x.cant / h; else sabe = false; } });
    return sabe && usado > disp + 1e-6 ? { usado: r2(usado), disp: r2(disp) } : false;
  }
  function plan(D, soloOt) {
    const M = proxHabil(D), l = pendientes(D, soloOt), dh = deshechos(), sumar = [], borr = [], saltear = [];
    l.forEach((x) => {
      if (dh[x.src + "|" + x.k]) { saltear.push(Object.assign({ por: "lo deshicieron" }, x)); return; }
      const d = M ? destinoDe(x.obraId, M) : null;
      if (!d) { borr.push(Object.assign({ fecha: M, porque: `${x.obra} no tiene orden ${fDia(M)}: queda en el borrador de la orden sugerida` }, x)); return; }
      if (arr(d.actividades).indexOf(x.k) >= 0) { saltear.push(Object.assign({ por: `ya está en la ${d.numero || "orden"} de mañana` }, x)); return; }
      if (sacadas(d).indexOf(x.k) >= 0) { saltear.push(Object.assign({ por: `la sacaron a mano de la ${d.numero || "orden"}` }, x)); return; }
      const ya = sumar.filter((s) => s.dst === d.id);
      const ll = lleno(d, ya.concat([x]), M);
      if (ll) { const M2 = proxHabil(M); borr.push(Object.assign({ fecha: M2, porque: `no entra en la ${d.numero || "orden"} ${fDia(M)} (${fN(ll.usado)} de ${fN(ll.disp)} HH): queda para el ${fDia(M2)}`, lleno: true }, x)); return; }
      sumar.push(Object.assign({ dst: d.id, dstNum: d.numero || "", fecha: M }, x));
    });
    return { D, M, sumar, borr, saltear, n: sumar.length + borr.length };
  }

  // ---------------------------------------------------------------- el turno (una sola vez entre todos los aparatos)
  const ref = () => firebase.firestore().collection("configEquipo").doc("salud");
  async function leerReg(D) { try { const d = await ref().get(); return obj(obj(obj(((d && d.exists && d.data()) || {}).pasarManana)[D])); } catch (e) { return null; } }
  async function tomar(D, clave) {
    const lk = "ema.pm.lock." + D + "." + clave;
    if (intentar(() => localStorage.getItem(lk), "")) return false;
    const tk = Math.random().toString(36).slice(2, 10);
    try { localStorage.setItem(lk, tk); } catch (e) { }
    try {
      const db = firebase.firestore();
      const ok = await db.runTransaction(async (tx) => {
        const d = await tx.get(ref()), x = obj(obj(obj(((d && d.exists && d.data()) || {}).pasarManana)[D])[clave]);
        if (x.ts) return false;
        tx.set(ref(), { pasarManana: { [D]: { [clave]: { ts: Date.now(), por: yoMail(), tk } } } }, { merge: true });
        return true;
      });
      if (!ok) return false;
      await espera(window.__pmEspera != null ? window.__pmEspera : 400);   // otro aparato a la vez: gana el último que escribió
      const r = await leerReg(D); if (r && r[clave] && r[clave].tk && r[clave].tk !== tk) return false;
      return true;
    } catch (e) { return true; }   // sin base: el control queda en el aparato
  }

  // ---------------------------------------------------------------- hacerlo
  function borrador(x) {
    const S = SG(); if (!S || !S._st || !x.fecha) return false;
    S.aplicar(S._st.E, x.fecha, { tipo: "sumar_tarea", obraId: x.obraId, k: x.k, cantidad: x.cant > 0 ? x.cant : null });
    S.aplicar(S._st.E, x.fecha, { tipo: "incluir", obraId: x.obraId });
    try { localStorage.setItem("ema.sug.E", JSON.stringify(S._st.E)); } catch (e) { }
    intentar(() => S.invalidar(), null);
    return true;
  }
  async function hacer(P, clave) {
    const hecho = [], dests = {};
    for (const x of P.sumar) {
      const d = ots().find((o) => o.id === x.dst); if (!d) continue;
      if (!dests[d.id]) dests[d.id] = { antes: { actividades: clon(arr(d.actividades)), previsto: clon(obj(d.previsto)) } };
      const act = [...new Set(arr(d.actividades).concat([x.k]))], prev = Object.assign({}, obj(d.previsto));
      if (x.cant > 0) prev[x.k] = r2(num(prev[x.k]) + x.cant);
      const cambios = { actividades: act, previsto: prev, ["pasadoDe." + Lk(x.k)]: { otId: x.src, numero: x.srcNum, fecha: P.D, cant: x.cant, auto: true, ts: Date.now() } };
      await window.fbOtUpdate(d.id, cambios);
      d.actividades = act; d.previsto = prev; d.pasadoDe = Object.assign({}, obj(d.pasadoDe), { [Lk(x.k)]: cambios["pasadoDe." + Lk(x.k)] });
      const s = ots().find((o) => o.id === x.src), rf = { otId: d.id, numero: d.numero || "", fecha: x.fecha, cant: x.cant, sumada: true, auto: true, ts: Date.now() };
      if (s) { await window.fbOtUpdate(s.id, { ["pasadoA." + Lk(x.k)]: rf }); s.pasadoA = Object.assign({}, obj(s.pasadoA), { [Lk(x.k)]: rf }); }
      hecho.push({ tipo: "ot", src: x.src, srcNum: x.srcNum, dst: d.id, dstNum: d.numero || "", k: x.k, label: x.label, cant: x.cant, obra: x.obra, fecha: x.fecha });
    }
    P.borr.forEach((x) => { if (borrador(x)) hecho.push({ tipo: "borrador", src: x.src, srcNum: x.srcNum, obraId: x.obraId, k: x.k, label: x.label, cant: x.cant, obra: x.obra, fecha: x.fecha, porque: x.porque, lleno: !!x.lleno }); });
    const reg = { ts: Date.now(), por: yoMail(), hecho, dests, M: P.M };
    try { await ref().set({ pasarManana: { [P.D]: { [clave]: reg } } }, { merge: true }); } catch (e) { }   // merge: queda el tk del turno
    try { window.fbAuditar && window.fbAuditar("sugerida_pasar", `Lo no terminado del ${P.D} pasó a ${P.M}: ` + hecho.map((h) => `${h.obra} · ${h.label}${h.cant > 0 ? " " + fN(h.cant) : ""} → ${h.tipo === "ot" ? h.dstNum : "borrador " + h.fecha}`).join(" · ").slice(0, 440), { paso: "pasar", dia: P.D, n: hecho.length, auto: true }); } catch (e) { }
    st.ultimo = { D: P.D, clave, hecho, ts: reg.ts }; st.cerrado = false;
    if (hecho.length) { avisarOficina(P, hecho).catch(() => { }); pintarAviso(); }
    return hecho;
  }
  async function avisarOficina(P, hecho) {
    const l = intentar(() => PERMISOS.lista() || [], []), yo = yoMail().toLowerCase();
    const dest = l.filter((u) => u && u.email && u.activo !== false && u.pendiente !== true && (u.rol === "admin" || u.rol === "oficina")).map((u) => String(u.email).toLowerCase()).filter((e) => e !== yo);
    const titulo = `📅 ${hecho.length === 1 ? "Pasó 1 tarea" : "Pasaron " + hecho.length + " tareas"} de hoy a ${fDia(P.M)}`, cuerpo = hecho.slice(0, 4).map((h) => `${h.obra}: ${h.label}${h.cant > 0 ? " " + fN(h.cant) : ""}`).join(" · ") + (hecho.length > 4 ? "…" : "") + ". Se puede deshacer desde la app.";
    for (const em of [...new Set(dest)]) { try { await window.__pushAvisos.dejarAviso({ email: em, titulo, cuerpo, tipo: "pasarmanana", tag: "ema-pasar-" + P.D, ref: P.D, url: "./" }); } catch (e) { } }
  }
  async function correr(D, op) {
    op = op || {};
    if (!puede() && !op.forzar) return { ok: false, motivo: "sin permiso" };
    const clave = op.soloOt ? "ot_" + Lk(op.soloOt) : "dia";
    const P = plan(D, op.soloOt);
    if (!P.n) return { ok: true, hecho: [], plan: P, nada: true };
    if (!(await tomar(D, clave))) return { ok: false, motivo: "ya lo hizo otro aparato", plan: P };
    const h = await hacer(P, clave);
    return { ok: true, hecho: h, plan: P };
  }
  async function deshacer(D, clave) {
    const R = (st.ultimo && st.ultimo.D === D && (!clave || st.ultimo.clave === clave)) ? st.ultimo : null;
    const reg = R ? { hecho: R.hecho, dests: null } : obj(obj((await leerReg(D)) || {})[clave || "dia"]);
    const hecho = arr(reg.hecho); if (!hecho.length) return 0;
    const dh = deshechos(); let n = 0;
    for (const h of hecho) {
      dh[h.src + "|" + h.k] = Date.now();
      if (h.tipo === "ot") {
        const d = ots().find((o) => o.id === h.dst);
        if (d) {
          const prev = Object.assign({}, obj(d.previsto)); let act = arr(d.actividades).slice();
          if (h.cant > 0) { const v = r2(num(prev[h.k]) - h.cant); if (v > 1e-6) prev[h.k] = v; else delete prev[h.k]; }
          if (!(num(prev[h.k]) > 0)) act = act.filter((k) => k !== h.k);
          await window.fbOtUpdate(d.id, { actividades: act, previsto: prev, ["pasadoDe." + Lk(h.k)]: null });
          d.actividades = act; d.previsto = prev; d.pasadoDe = Object.assign({}, obj(d.pasadoDe), { [Lk(h.k)]: null });
        }
        const s = ots().find((o) => o.id === h.src);
        if (s) { await window.fbOtUpdate(s.id, { ["pasadoA." + Lk(h.k)]: null }); s.pasadoA = Object.assign({}, obj(s.pasadoA), { [Lk(h.k)]: null }); }
      } else {
        const S = SG(); const O = S && S._st && obj(obj(S._st.E[h.fecha])[h.obraId]);
        if (O.agregar) O.agregar = arr(O.agregar).filter((k) => k !== h.k); if (O.cant) delete O.cant[h.k];
        try { localStorage.setItem("ema.sug.E", JSON.stringify(S._st.E)); S.invalidar(); } catch (e) { }
      }
      n++;
    }
    try { localStorage.setItem("ema.pm.deshecho", JSON.stringify(dh)); } catch (e) { }
    try { await ref().set({ pasarManana: { [D]: { [clave || (R && R.clave) || "dia"]: { deshecho: { ts: Date.now(), por: yoMail() } } } } }, { merge: true }); } catch (e) { }
    try { window.fbAuditar && window.fbAuditar("sugerida_pasar", `Deshecho: lo que había pasado del ${D} a mañana vuelve atrás (${n} ${n === 1 ? "tarea" : "tareas"})`, { paso: "deshacer", dia: D, n }); } catch (e) { }
    st.ultimo = null; st.deshecho = { D, n };
    return n;
  }

  // ---------------------------------------------------------------- el aviso (con «Deshacer») y «preguntarme»
  const st = { ultimo: null, pregunta: null, cerrado: false, deshecho: null, corriendo: false };
  function lineaH(h) { return `<li><b>${esc(h.obra)}</b> · ${esc(h.label)}${h.cant > 0 ? " · " + esc(fN(h.cant)) + (h.un ? " " + esc(h.un) : "") : ""} → ${h.tipo === "ot" ? esc(h.dstNum || "orden de mañana") : esc(h.porque || "borrador de la sugerida")}</li>`; }
  function pintarAviso() {
    let v = $("pmAviso");
    const U = st.ultimo, Q = st.pregunta;
    if ((!U || st.cerrado) && !Q) { v && v.remove(); return; }
    if (!v) { v = document.createElement("div"); v.id = "pmAviso"; v.className = "no-print"; v.setAttribute("role", "status"); document.body.appendChild(v); }
    if (Q) {
      v.innerHTML = `<div class="pm-in"><div class="pm-t">📅 <b>Quedaron ${Q.n} ${Q.n === 1 ? "tarea" : "tareas"} sin terminar hoy.</b> ¿Las paso a ${esc(fDia(Q.M))}?</div><ul>${Q.sumar.concat(Q.borr).slice(0, 6).map((x) => `<li><b>${esc(x.obra)}</b> · ${esc(x.label)}${x.cant > 0 ? " · " + esc(fN(x.cant)) : ""} <small>(${esc(x.motivo)})</small> → ${x.dst ? esc(x.dstNum) : esc(x.porque)}</li>`).join("")}</ul><div class="pm-acc"><button type="button" class="btn-ghost" data-pm="no">Ahora no</button><button type="button" class="btn-primary" data-pm="si">Sí, pasarlas</button></div></div>`;
      return;
    }
    const n = U.hecho.length;
    v.innerHTML = `<div class="pm-in"><div class="pm-t">📅 <b>Se ${n === 1 ? "pasó 1 tarea" : "pasaron " + n + " tareas"} de hoy a mañana.</b></div><ul>${U.hecho.slice(0, 6).map(lineaH).join("")}</ul><div class="pm-acc"><button type="button" class="btn-ghost" data-pm="deshacer">↶ Deshacer</button><button type="button" class="btn-primary" data-pm="ok">Listo</button></div></div>`;
  }
  document.addEventListener("click", async (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-pm]"); if (!b) return;
    const a = b.dataset.pm; e.preventDefault();
    if (a === "ok") { st.cerrado = true; try { localStorage.setItem("ema.pm.visto." + (st.ultimo ? st.ultimo.D : ""), "1"); } catch (er) { } pintarAviso(); }
    else if (a === "deshacer") { b.disabled = true; try { const U = st.ultimo; const n = await deshacer(U.D, U.clave); try { window.mostrarAviso && window.mostrarAviso(`↶ Listo: ${n === 1 ? "la tarea volvió" : n + " tareas volvieron"} atrás.`, "ok"); } catch (er) { } } catch (er) { b.disabled = false; try { window.mostrarAviso && window.mostrarAviso("⚠ No se pudo deshacer: " + ((er && (er.message || er.code)) || "sin conexión"), "error"); } catch (x) { } } pintarAviso(); }
    else if (a === "no") { const Q = st.pregunta; st.pregunta = null; try { localStorage.setItem("ema.pm.nopreg." + (Q ? Q.D : ""), "1"); } catch (er) { } pintarAviso(); }
    else if (a === "si") { const Q = st.pregunta; st.pregunta = null; pintarAviso(); if (Q) { try { await correr(Q.D, { soloOt: Q.soloOt }); } catch (er) { } } }
  });

  // ---------------------------------------------------------------- cuándo (reloj cada minuto)
  function diaATrabajar() {
    const C = cfg(), d = ahora(), h = hoyISO(), m = hmMin(C.hora);
    if (m == null || d.getHours() * 60 + d.getMinutes() >= m) return h;
    // antes de la hora: lo del día hábil anterior, si nadie lo hizo (la próxima vez que alguien de la oficina abre la app)
    const x = deIso(h); for (let i = 0; i < 6; i++) { x.setDate(x.getDate() - 1); const f = iso(x); if (intentar(() => SG().horasDia(f) > 0, x.getDay() !== 0)) return f; }
    return "";
  }
  async function tic() {
    if (st.corriendo || !puede() || window.__pmPausa) return null;   // __pmPausa: pruebas
    const C = cfg(); if (C.modo === "no") return null;
    st.corriendo = true;
    try {
      const h = hoyISO();
      // 1) la oficina ya cerró una orden de hoy: lo que quedó pasa al toque (sin esperar la hora)
      const cerradasHoy = ots().filter((o) => o && cerrada(o) && o.estado !== "Anulada" && String(o.fecha || "").slice(0, 10) === h && pendientes(h, o.id).length);
      for (const o of cerradasHoy) {
        if (C.modo === "auto") await correr(h, { soloOt: o.id });
        else if (!st.pregunta && !intentar(() => localStorage.getItem("ema.pm.nopreg." + h), "")) { const P = plan(h, o.id); if (P.n) { st.pregunta = Object.assign({ soloOt: o.id }, P); pintarAviso(); } }
      }
      // 2) el fin del día (o el día anterior, si nadie lo hizo)
      const D = diaATrabajar(); if (!D) return null;
      const reg = await leerReg(D); if (reg && reg.dia && reg.dia.ts) { if (!st.ultimo && reg.dia.hecho && reg.dia.hecho.length && !reg.dia.deshecho && !intentar(() => localStorage.getItem("ema.pm.visto." + D), "")) { st.ultimo = { D, clave: "dia", hecho: reg.dia.hecho, ts: reg.dia.ts }; pintarAviso(); } return null; }
      if (C.modo === "preguntar") {
        if (st.pregunta || intentar(() => localStorage.getItem("ema.pm.nopreg." + D), "")) return null;
        const P = plan(D); if (P.n) { st.pregunta = P; pintarAviso(); } return null;
      }
      return await correr(D);
    } catch (e) { return null; } finally { st.corriendo = false; }
  }
  setInterval(() => { if (!document.hidden) tic().catch(() => { }); }, 60000);
  setTimeout(() => { tic().catch(() => { }); }, 25000);

  // ---------------------------------------------------------------- el ajuste (Órdenes sugeridas › Ajustes)
  function cfgHtml(C) {
    if (window.__v146No) return "";
    const m = ["auto", "preguntar", "no"].indexOf(C.pasarModo) >= 0 ? C.pasarModo : "auto";
    return `<div class="sg-eti">Lo no terminado de hoy (v146)</div><label class="sg-nlab">Pasar lo no terminado a mañana: <select data-sgc="t" data-p="pasarModo" aria-label="Pasar lo no terminado a mañana"><option value="auto"${m === "auto" ? " selected" : ""}>automático</option><option value="preguntar"${m === "preguntar" ? " selected" : ""}>preguntarme</option><option value="no"${m === "no" ? " selected" : ""}>no</option></select> a las <input type="time" data-sgc="t" data-p="pasarHora" value="${esc(C.pasarHora || "18:00")}"></label>
<div class="sg-hint">Lo que «no se hizo», no se marcó o quedó a medias se suma a la orden ya emitida de esa obra del día siguiente (o al borrador de la sugerida si no hay orden; nunca se emite sola). También apenas cerrás la orden de hoy. Sin duplicar y con «Deshacer».</div>`;
  }
  window.__pasarManana = { puede, cfg, pendientes, plan, correr, deshacer, tic, tomar, cfgHtml, pintarAviso, faltaDe, estado: () => ({ ultimo: clon(st.ultimo), pregunta: st.pregunta ? { n: st.pregunta.n, D: st.pregunta.D } : null, deshecho: st.deshecho }) };
})();
