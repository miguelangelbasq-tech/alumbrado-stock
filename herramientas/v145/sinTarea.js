(function () {
  "use strict";
  // v145 · «Todo el personal de alumbrado tiene una tarea cada día hábil, salvo ausencia o enfermedad» (Ángel, 10/11/2026).
  //  · Quiénes: la nómina activa de obra (los vinculados a un usuario de cuadrilla/operario, los de la nómina sin usuario
  //    y los marcados «Equipo civil», v143), sin los vinculados a usuarios de Administración, Oficina, Pañol o Solo mirar,
  //    y sin los ausentes ese día (configEquipo/personal.ausencias, v143). Día hábil = la jornada de la orden sugerida
  //    (lunes a viernes y sábado medio día, ⚙ Ajustes).
  //  · Control: quién NO está en ninguna orden emitida (personalNombres) ese día → «👷 N personas sin tarea mañana».
  //  · Dónde: hoja de la orden sugerida (bloque arriba con «Sumar a…» y el porqué), al emitir («Quedan N sin tarea»
  //    con «Asignar ahora» / «Emitir igual») y después de emitir, Inicio Ejecutivo › «Para atender» (desde las 14 h o si
  //    ya hay órdenes emitidas para mañana), recordatorio a Administración y Oficina (una vez por día, 17:00, ⚙ Ajustes) y
  //    🧠 Lo que aprende la app › 👷 Días sin tarea (solo el conteo del mes).
  //  · Dónde ponerlos (sin IA, con el mismo motor de la sugerida): 1) sumarlos a una obra donde rinde más con uno más
  //    (izaje de 2 → 3), 2) preparación (zanja, pozos, limpieza) en obras programadas, 3) galpón (armar vínculos,
  //    luminarias, tableritos, probar artefactos), 4) lo que quedó de ayer, 5) otra tarea a mano. Nada se escribe sin tocar.
  //  Pruebas viejas: window.__v145No.
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const intentar = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const fN = (v) => intentar(() => fmt(+v || 0, Number.isInteger(+v) ? 0 : 1), String(v));
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const ahora = () => new Date(window.__stAhora || Date.now());
  const hoyISO = () => iso(ahora());
  const deIso = (s) => { const m = String(s || "").match(/^(\d{4})-(\d\d)-(\d\d)/); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null; };
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const fDia = (f) => { const h = hoyISO(), d = deIso(f); if (f === h) return "hoy"; const m = deIso(h); m.setDate(m.getDate() + 1); if (f === iso(m)) return "mañana"; return d ? "el " + DIAS[d.getDay()] + " " + pad(d.getDate()) + "/" + pad(d.getMonth() + 1) : f; };
  const hmMin = (s) => { const m = String(s || "").match(/^(\d{1,2}):(\d\d)/); return m ? +m[1] * 60 + +m[2] : null; };
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const obras = () => intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []);
  const SG = () => window.__sugerida || null;
  const permiso = (h) => intentar(() => (window.PERMISOS && PERMISOS.permiso ? PERMISOS.permiso(h) : "oculto"), "oculto");
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  const liviano = () => intentar(() => !!(window.__modoDatos && window.__modoDatos.liviano()), false);
  function puede() { return !window.__v145No && !window.__sugNo && !!window.__fbUser && !liviano() && !esCrew() && permiso("parte") === "editar" && !!SG(); }
  const cfg = () => Object.assign({ sinTareaAviso: true, sinTareaHora: "17:00" }, intentar(() => SG().cfg(), {}));
  const habil = (f) => intentar(() => SG().horasDia(f) > 0, deIso(f) && deIso(f).getDay() !== 0);
  const manana = () => intentar(() => SG().proxHabil(hoyISO()), "");
  const nombresOt = (o) => arr(o && o.personal).map((p) => (typeof p == "string" ? p : p && p.nombre)).filter((n) => n && String(n).trim());
  const cerradaOt = (o) => !!(o && o.cierre && o.cierre.cerradoTs);
  const IZ = ["montaje_prfv", "montaje_metalica"], PREP = ["zanjeo", "zanja_maquina", "excavacion", "hormigonado", "tapado_zanja", "replanteo", "limpieza_obra", "vereda", "pozo_tablero", "sellado_base"], GALPON = ["armado_vinculo", "armado_luminaria", "armado_tablerito", "prueba_artefactos", "galpon_prep"];
  const cat = () => intentar(() => (typeof ACTIVIDADES_CATALOGO != "undefined" ? ACTIVIDADES_CATALOGO : []), []);
  const labelDe = (k) => intentar(() => SG().labelDe(k), k);

  // ---------------------------------------------------------------- quiénes
  function nomina() { const p = obj(window.__personalNube); let l = Array.isArray(p.nomina) && p.nomina.length ? p.nomina : Array.isArray(p.lista) ? p.lista : []; if (!l.length) l = intentar(() => window.nominaEquipo() || [], []); return l.filter((x) => x && String(x.nombre || "").trim() && x.activo !== false); }
  function personal() {
    const us = intentar(() => PERMISOS.lista() || [], []), fuera = {};
    us.forEach((u) => { if (u && (u.persona || u.personaClave) && ["admin", "oficina", "panol", "mirar"].indexOf(String(u.rol || "")) >= 0) fuera[nk(u.personaClave || u.persona)] = 1; });
    return nomina().filter((p) => p.equipoCivil || !fuera[nk(p.nombre)]).map((p) => ({ nombre: String(p.nombre).trim(), rol: p.rol || "", civil: !!p.equipoCivil }));
  }
  const ausente = (n, f) => intentar(() => SG().ausente(n, f), null);
  function enOrdenes(f) {
    const s = {};
    ots().forEach((o) => { if (!o || o.estado === "Anulada" || String(o.fecha || "").slice(0, 10) !== f) return; arr(o.personalNombres).forEach((c) => { s[nk(c)] = o; }); nombresOt(o).forEach((n) => { s[nk(n)] = o; }); });
    return s;
  }
  function sinTarea(f) {
    f = f || manana(); if (!f || !habil(f)) return [];
    const en = enOrdenes(f);
    return personal().filter((p) => !en[nk(p.nombre)] && !ausente(p.nombre, f));
  }
  const hayEmitidas = (f) => ots().some((o) => o && o.estado !== "Anulada" && String(o.fecha || "").slice(0, 10) === f);
  // lo que queda sin tarea si se emite la sugerida (d.libres de la hoja = sin orden emitida ni sugerida, sin ausentes)
  function quedanPlan(d) { const pe = {}; personal().forEach((p) => { pe[nk(p.nombre)] = p; }); return arr(d && d.libres).filter((p) => pe[nk(p.nombre)]).map((p) => Object.assign({}, pe[nk(p.nombre)], p)); }

  // ---------------------------------------------------------------- dónde ponerlos (sin IA)
  function vehLugares(o) { const l = arr(obj(window.__personalNube).vehiculos); let s = 0, sin = false; arr(o.vehiculos).forEach((v) => { const x = l.find((y) => y && v && y.id === v.id) || v || {}; if (num(x.lugares) > 0) s += num(x.lugares); else sin = true; }); return { s, sin }; }
  function porqueIzaje(ks, n, civil) {
    if (!ks.some((k) => IZ.indexOf(k) >= 0) || n !== 2) return "";
    const A = obj(cfg().angel), x = civil ? obj(A.izCivil) : obj(A.izCano3), y = obj(A.izTodo);
    return x.porDia ? `Izaje con 2: con uno más${civil ? " (equipo civil)" : ""} rinde ${fN(x.porDia)} por día${y.porDia ? " en vez de " + fN(y.porDia) : ""} (según Ángel)` : "";
  }
  function sugerencias(f, p, d) {
    d = d || intentar(() => SG().armar(f), null); const out = [];
    if (!d) return out;
    // 1) sumarlo a una orden donde rinde más o hay lugar (emitidas de ese día y sugeridas sin emitir)
    ots().filter((o) => o && o.estado !== "Anulada" && !cerradaOt(o) && String(o.fecha || "").slice(0, 10) === f).forEach((o) => {
      const n = nombresOt(o).length, L = vehLugares(o); if (!L.sin && L.s > 0 && L.s <= n) return;
      const pq = porqueIzaje(arr(o.actividades), n, p.civil);
      out.push({ tipo: "ot", ot: o.id, obra: o.plazaNombre || "", txt: `Sumar a ${String(o.plazaNombre || "").toUpperCase()} (${o.numero || "orden"})`, porque: pq || `Van ${n}${L.s ? `, el vehículo tiene ${L.s} lugares` : ""}: ${arr(o.actividades).slice(0, 2).map((k) => labelDe(k).split(" (")[0]).join(", ")}`, p: pq ? 100 : 50 - n });
    });
    arr(d.ordenes).filter((o) => o.incluir && !o.emitida && o.gente.length).forEach((o) => {
      const L = vehLugares(o); if (!L.sin && L.s > 0 && L.s <= o.gente.length) return;
      const pq = porqueIzaje(o.tareas.map((t) => t.k), o.gente.length, p.civil), libre = num(o.hhDisp) - num(o.hhUsadas);
      out.push({ tipo: "sug", obraId: o.obraId, obra: o.obra, txt: `Sumar a ${String(o.obra).toUpperCase()} (sugerida)`, porque: pq || (o.pendientes.length ? `Le quedan ${o.pendientes.length} ${o.pendientes.length === 1 ? "tarea" : "tareas"} pendientes${libre > 0 ? ` y ${fN(libre)} HH libres` : ""}` : `Van ${o.gente.length}`), p: pq ? 95 : 45 - o.gente.length });
    });
    // 2) preparación en obras programadas (zanja, pozos, limpieza…)
    arr(d.ordenes).filter((o) => !o.emitida).forEach((o) => {
      const ks = arr(o.pendientes).filter((k) => PREP.indexOf(k) >= 0); if (!ks.length) return;
      if (out.some((x) => x.tipo === "sug" && x.obraId === o.obraId)) return;
      out.push({ tipo: "sug", obraId: o.obraId, obra: o.obra, txt: `Preparación en ${String(o.obra).toUpperCase()}`, porque: `${ks.slice(0, 2).map((k) => labelDe(k).split(" (")[0]).join(", ")}: adelanta la obra${p.civil ? " (equipo civil)" : ""}`, p: 30 });
    });
    // 3) galpón
    const g = GALPON.filter((k) => cat().some((a) => a && a.id === k));
    if (g.length) { const izar = arr(d.ordenes).filter((o) => arr(o.pendientes).some((k) => IZ.indexOf(k) >= 0)).length; out.push({ tipo: "llenar", txt: "Galpón: " + g.slice(0, 2).map((k) => labelDe(k).split(" (")[0].toLowerCase()).join(" y "), porque: izar ? `${izar} ${izar === 1 ? "obra tiene" : "obras tienen"} columnas por izar: vínculos y luminarias listos` : "Dejar armado lo que viene", p: 20, k: g[0] }); }
    // 4) lo que quedó de ayer
    const desde = (() => { const x = deIso(f); x.setDate(x.getDate() - 7); return iso(x); })();
    const quedo = {};
    ots().forEach((o) => { if (!o || !cerradaOt(o) || String(o.fecha || "") < desde || String(o.fecha || "") >= f) return; const pr = obj(o.previsto), c = obj(o.cierre.cantidades); if (Object.keys(pr).some((k) => num(pr[k]) > num(c[k]) && !obj(o.pasadoA)[k])) quedo[String(o.plazaId)] = o.plazaNombre || ""; });
    Object.keys(quedo).forEach((id) => { if (out.some((x) => x.obraId === id || (x.tipo === "ot" && ots().some((o) => o.id === x.ot && String(o.plazaId) === id)))) return; const o = arr(d.ordenes).find((x) => String(x.obraId) === id); if (!o || o.emitida) return; out.push({ tipo: "sug", obraId: id, obra: quedo[id], txt: `Terminar lo que quedó en ${String(quedo[id]).toUpperCase()}`, porque: "Una orden de esta semana se cerró con menos de lo previsto", p: 10 }); });
    out.sort((a, b) => b.p - a.p);
    out.push({ tipo: "mano", txt: "Otra tarea (a mano)", porque: "Armala en «Llenar orden»", p: 0 });
    return out;
  }
  function paraIa(d) { const f = d && d.fecha; return quedanPlan(d).map((p) => ({ persona: p.nombre, rol: p.rol, equipoCivil: !!p.civil, dondePonerlo: sugerencias(f, p, d).slice(0, 4).map((s) => s.txt + " — " + s.porque) })); }

  // ---------------------------------------------------------------- en la hoja de la orden sugerida
  const botones = (f, p, l) => l.slice(0, 4).map((s, i) => `<div class="st-s"><div><b>${esc(s.txt)}</b><small>${esc(s.porque)}</small></div><button type="button" class="${i === 0 ? "btn-primary" : "btn-ghost"}" data-st="${s.tipo}" data-n="${esc(p.nombre)}" data-f="${esc(f)}"${s.obraId ? ` data-obra="${esc(s.obraId)}"` : ""}${s.ot ? ` data-ot="${esc(s.ot)}"` : ""}>${s.tipo === "mano" || s.tipo === "llenar" ? "Armar" : "Sumar"}</button></div>`).join("");
  function bloqueSug(d) {
    if (window.__v145No || !d || d.noSeTrabaja) return "";
    const l = quedanPlan(d); if (!l.length) return "";
    const cerca = d.fecha <= (manana() || d.fecha);
    return `<article class="sg-card st-blq ${cerca ? "rj" : "am"}" id="stBloque"><div class="st-cab">👷 <b>${l.length} ${l.length === 1 ? "persona" : "personas"} sin tarea ${esc(fDia(d.fecha))}</b><small>Todo el personal de alumbrado tiene que tener una tarea cada día hábil, salvo ausencia o enfermedad.</small></div>
${l.map((p) => `<div class="st-p"><div class="st-pn"><i>${esc(p.nombre.split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase())}</i><div><b>${esc(p.nombre)}</b><small>${esc(p.rol || "")}${p.civil ? " · equipo civil" : ""}</small></div></div>${botones(d.fecha, p, sugerencias(d.fecha, p, d))}</div>`).join("")}</article>`;
  }
  function cartelEmitir(d) {
    if (window.__v145No) return "";
    const l = quedanPlan(d); if (!l.length) return "";
    return `<div class="sg-av rojo st-cartel" id="stCartel">👷 <b>Quedan ${l.length} sin tarea ${esc(fDia(d.fecha))}:</b> ${esc(l.map((p) => p.nombre).join(", "))}. <button type="button" class="sg-lk" data-st="asignar">Asignar ahora</button> · «Sí, emitir» = emitir igual.</div>`;
  }
  function msgTrasEmitir(f) {
    if (window.__v145No) return "";
    const l = sinTarea(f); if (!l.length) return "";
    return `<br>👷 <b>Quedan ${l.length} sin tarea ${esc(fDia(f))}:</b> ${esc(l.map((p) => p.nombre).join(", "))}. <button type="button" class="sg-lk" data-st="asignar">Asignar ahora</button>`;
  }
  function cfgHtml(C) {
    if (window.__v145No) return "";
    const R = C.reglas || {};
    return `<div class="sg-eti">Reglas de Ángel (v145)</div><label class="sg-nlab">En obra van mínimo <input type="number" min="1" max="6" step="1" data-sgc="n" data-p="minObra" value="${esc(C.minObra || 2)}"> personas (según Ángel; solo el galpón puede ser de 1)</label>
<label class="sg-sw"><span><b>Mínimo en obra</b><small>Nunca uno solo en una plaza; barquilla, grúa, hidro o tablero: sí o sí 2.</small></span><input type="checkbox" data-sgc="regla" data-k="minDos" ${R.minDos !== false ? "checked" : ""}></label>
<label class="sg-sw"><span><b>Vínculos sin grúa</b><small>La grúa iza sin los vínculos (con caño, 6 con 2 / 12 con 3); los vínculos van aparte con hidro chica o barquilla, salvo que estén armados en el galpón.</small></span><input type="checkbox" data-sgc="regla" data-k="vinculoSinGrua" ${R.vinculoSinGrua !== false ? "checked" : ""}></label>
<div class="sg-eti">Gente sin tarea</div><label class="sg-sw"><span><b>Recordatorio a Administración y Oficina</b><small>Una vez por día, desde las <input type="time" data-sgc="t" data-p="sinTareaHora" value="${esc(C.sinTareaHora || "17:00")}">, si alguien sigue sin tarea para el día siguiente.</small></span><input type="checkbox" data-sgc="b" data-p="sinTareaAviso" ${C.sinTareaAviso !== false ? "checked" : ""}></label>`;
  }
  // sumar a una orden ya emitida: con «Sí» (la base avisa a la persona como siempre, por fbOtUpdate)
  function preguntarOt(ot, n) {
    const o = ots().find((x) => x.id === ot); if (!o) return;
    const v = $("stPreg"); v && v.remove();
    const ov = document.createElement("div"); ov.id = "stPreg"; ov.className = "v7-ov no-print sg-v7"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    ov.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>¿Sumás a ${esc(n)} a la ${esc(o.numero || "orden")}?</h3><small>${esc(String(o.plazaNombre || "").toUpperCase())} · ${esc(fDia(String(o.fecha || "")))}</small></div><button type="button" class="v7-x" data-st="x" aria-label="Cerrar">✕</button></div><p class="v7-txt">Se agrega a la gente de la orden y le llega el aviso al celu, como siempre.</p><div class="sg-accs"><button type="button" class="btn-ghost" data-st="x">No</button><button type="button" class="btn-primary" data-st="otsi" data-ot="${esc(ot)}" data-n="${esc(n)}">Sí, sumar</button></div><div class="sg-msg" id="stPregMsg" aria-live="polite"></div></div>`;
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov);
  }
  async function sumarAOt(ot, n) {
    const o = ots().find((x) => x.id === ot); if (!o) throw new Error("No encontré la orden.");
    const p = personal().find((x) => nk(x.nombre) === nk(n)) || { nombre: n, rol: "" };
    const per = arr(o.personal).concat([{ nombre: p.nombre, rol: p.rol || "" }]), pn = [...new Set(arr(o.personalNombres).concat([nk(p.nombre)]))];
    await window.fbOtUpdate(o.id, { personal: per, personalNombres: pn });
    o.personal = per; o.personalNombres = pn;
    try { window.fbAuditar && window.fbAuditar("sin_tarea_sumar", `${p.nombre} sumado a ${o.numero || "la orden"} (${o.plazaNombre || ""}) para que no quede sin tarea`, { otId: o.id, persona: p.nombre }); } catch (e) { }
  }
  function irLlenar() { try { SG().cerrar(); } catch (e) { } try { window.mostrarVista("parte"); } catch (e) { } }
  function asignar() {
    const v = $("sgEm"); v && v.remove();
    const s = SG(); if (s && !s.estado().abierta) s.abrir(manana());
    setTimeout(() => { const b = $("stBloque"); if (b) b.scrollIntoView({ block: "start", behavior: "smooth" }); }, 120);
  }
  document.addEventListener("click", async (e) => {
    const ie = e.target && e.target.closest && e.target.closest('[data-ie^="sintarea"]');
    if (ie) { e.preventDefault(); e.stopPropagation(); const f = ie.dataset.ie.split(":")[1] || manana(); if (SG() && SG().puede()) { SG().abrir(f); setTimeout(() => { const b = $("stBloque"); b && b.scrollIntoView({ block: "start" }); }, 150); } else irLlenar(); return; }
    const b = e.target && e.target.closest && e.target.closest("[data-st]"); if (!b) return;
    const a = b.dataset.st; e.preventDefault();
    if (a === "sug") { const s = SG(); if (!s) return; s.cambio({ tipo: "sumar_persona", obraId: b.dataset.obra, persona: b.dataset.n }); s.cambio({ tipo: "incluir", obraId: b.dataset.obra }); }
    else if (a === "ot") preguntarOt(b.dataset.ot, b.dataset.n);
    else if (a === "llenar" || a === "mano") irLlenar();
    else if (a === "asignar") asignar();
    else if (a === "x") { const v = $("stPreg"); v && v.remove(); }
    else if (a === "otsi") {
      const m = $("stPregMsg"); b.disabled = true; if (m) m.textContent = "Guardando…";
      try { await sumarAOt(b.dataset.ot, b.dataset.n); const v = $("stPreg"); v && v.remove(); try { SG().invalidar(); const ov = $("sgOv"); if (ov) ov.__h = ""; SG().pintar(); } catch (er) { } }
      catch (er) { b.disabled = false; if (m) m.textContent = "⚠ No se pudo: " + ((er && (er.message || er.code)) || "sin conexión") + "."; }
    }
  }, true);

  // ---------------------------------------------------------------- Inicio › Para atender
  function atender() {
    if (!puede()) return [];
    const l = [], h = hoyISO(), m = manana(), hora = ahora().getHours();
    if (habil(h) && hayEmitidas(h)) { const s = sinTarea(h); if (s.length) l.push({ ir: "sintarea:" + h, ico: "alerta", cls: "rj", t: `${s.length} ${s.length === 1 ? "persona" : "personas"} sin tarea hoy`, s: s.map((p) => p.nombre.split(/\s+/)[0]).join(", "), n: s.length }); }
    if (m && (hora >= 14 || hayEmitidas(m))) { const s = sinTarea(m); if (s.length) l.push({ ir: "sintarea:" + m, ico: "alerta", cls: "am", t: `${s.length} ${s.length === 1 ? "persona" : "personas"} sin tarea ${fDia(m)}`, s: s.map((p) => p.nombre.split(/\s+/)[0]).join(", "), n: s.length }); }
    return l;
  }

  // ---------------------------------------------------------------- recordatorio (una vez por día, ~17:00)
  const KR = "ema.sinTarea.aviso";
  async function usuarios() { const l = intentar(() => PERMISOS.lista() || [], []); if (l.some((u) => u && (u.rol === "admin" || u.rol === "oficina"))) return l; try { const s = await firebase.firestore().collection("usuarios").get(); return s.docs.map((d) => Object.assign({ uid: d.id }, d.data())); } catch (e) { return l; } }
  async function tomar(dia) {
    try {
      const db = firebase.firestore(), ref = db.collection("configEquipo").doc("salud"), yo = String((window.__fbUser || {}).email || "");
      return await db.runTransaction(async (tx) => {
        const d = await tx.get(ref), x = obj(obj(((d && d.exists && d.data()) || {}).sinTarea)[dia]);
        if (x.ts) return false;
        tx.set(ref, { sinTarea: { [dia]: { ts: Date.now(), por: yo } } }, { merge: true });
        return true;
      });
    } catch (e) { return true; }   // sin base: el control queda en el aparato
  }
  let ticando = false;
  async function tic() {
    if (ticando || !puede()) return null;
    const C = cfg(); if (C.sinTareaAviso === false) return null;
    const hm = hmMin(C.sinTareaHora || "17:00"), d = ahora(), dia = hoyISO();
    if (hm != null && d.getHours() * 60 + d.getMinutes() < hm) return null;
    if (intentar(() => localStorage.getItem(KR), "") === dia) return null;
    const f = manana(), l = sinTarea(f); if (!l.length) return null;
    ticando = true;
    try {
      try { localStorage.setItem(KR, dia); } catch (e) { }
      if (!(await tomar(dia))) return null;
      const yo = String((window.__fbUser || {}).email || "").toLowerCase(), dest = (await usuarios()).filter((u) => u && u.email && u.activo !== false && u.pendiente !== true && (u.rol === "admin" || u.rol === "oficina")).map((u) => String(u.email).toLowerCase());
      const titulo = `👷 ${l.length} ${l.length === 1 ? "persona" : "personas"} sin tarea ${fDia(f)}`, cuerpo = l.map((p) => p.nombre).join(", ") + ". Asignales una tarea en Órdenes › Sugeridas.";
      const env = [];
      for (const em of [...new Set(dest)]) { try { await window.__pushAvisos.dejarAviso({ email: em, titulo, cuerpo, tipo: "sintarea", tag: "ema-sintarea-" + f, ref: f, url: "./" }); env.push(em); } catch (e) { } }
      if (!dest.length || dest.every((x) => x === yo)) { try { window.mostrarAviso && window.mostrarAviso(titulo + ": " + cuerpo, "warn"); } catch (e) { } }
      return { f, l: l.map((p) => p.nombre), env };
    } finally { ticando = false; }
  }
  setInterval(() => { tic().catch(() => { }); }, 60000);
  setTimeout(() => { tic().catch(() => { }); }, 20000);

  // ---------------------------------------------------------------- 🧠 Lo que aprende la app › 👷 Días sin tarea (solo el conteo)
  function diasDelMes() {
    const h = hoyISO(), d0 = deIso(h.slice(0, 8) + "01"), l = [];
    for (let d = new Date(d0); iso(d) <= h; d.setDate(d.getDate() + 1)) { const f = iso(d); if (habil(f)) l.push(f); }
    return l;
  }
  function conteoMes() {
    const dias = diasDelMes(), por = {};
    const pe = personal();
    dias.forEach((f) => { const en = enOrdenes(f); pe.forEach((p) => { const k = p.nombre, x = por[k] || (por[k] = { nombre: k, rol: p.rol, sin: 0, aus: 0, con: 0 }); if (ausente(p.nombre, f)) x.aus++; else if (en[nk(p.nombre)]) x.con++; else x.sin++; }); });
    return { dias: dias.length, filas: Object.keys(por).map((k) => por[k]).sort((a, b) => b.sin - a.sin || a.nombre.localeCompare(b.nombre, "es")) };
  }
  function aprendeHtml() {
    const C = conteoMes();
    return `<div class="card"><h2>👷 Días sin tarea este mes <span class="h2-sub">${C.dias} ${C.dias === 1 ? "día hábil" : "días hábiles"} hasta hoy · solo el conteo, para el informe</span></h2>
${C.filas.length ? `<div class="sg-tabw"><table class="sg-tab tabla-tarjetas" id="stApTab"><thead><tr><th>Persona</th><th>Con tarea</th><th>Sin tarea</th><th>Ausente</th></tr></thead><tbody>${C.filas.map((x) => `<tr><td><b>${esc(x.nombre)}</b><small>${esc(x.rol || "")}</small></td><td class="n" data-label="Con tarea">${x.con}</td><td class="n" data-label="Sin tarea">${x.sin}</td><td class="n" data-label="Ausente">${x.aus}</td></tr>`).join("")}</tbody></table></div>` : '<div class="hint">No hay personal de obra en la nómina.</div>'}
<div class="hint">Cuenta los días hábiles (jornada de la orden sugerida) en que la persona no figuraba en ninguna orden emitida y no estaba ausente.</div></div>`;
  }

  window.__sinTarea = { personal, sinTarea, enOrdenes, quedanPlan, sugerencias, paraIa, bloqueSug, cartelEmitir, msgTrasEmitir, cfgHtml, atender, tic, conteoMes, aprendeHtml, sumarAOt, manana, puede };
})();
