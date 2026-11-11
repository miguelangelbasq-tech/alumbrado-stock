(function () {
  "use strict";
  // v146 · «✨ Cerrar el día por voz» (maqueta i3, aprobada por Ángel). Para la oficina o el supervisor (quien edita Órdenes;
  // la cuadrilla no: ya manda lo suyo en el Modo obra). Ej.: «Los Álamos se hicieron 4 izajes, Juan 8 horas, Pedro 6, faltó un
  // vínculo, lo pasamos al jueves».
  //  · Usa el Asistente de siempre (dictado en vivo, onda, voz de la v134–v140): el chip «🎙 Cerrar el día» o el botón de
  //    Órdenes › Para revisar y cerrar lo abren en «modo cierre»: al contexto se le suman las órdenes del día YA PRELLENADAS con
  //    lo que mandó la cuadrilla (campo: marcas, «no se hizo», pasosObra, horasTarea), así la voz solo corrige.
  //  · La IA llama a proponer_cierre_dia (código dormido) y la app arma la tarjeta antes → después por orden; con «Sí» cada
  //    orden se cierra por el camino de siempre (abrirCierreOt + «✅ Aprobar todo y cerrar» / guardarCierreOt: puntos, avance,
  //    avisos) y «lo que falta a otro día» va por el mismo camino de la v128 (se suma a la orden de ese día de la obra o se arma
  //    una con vieneDe; ot.pasadoA).
  //  Pruebas viejas: window.__v146No.
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const r2 = (v) => Math.round((+v || 0) * 100) / 100;
  const intentar = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  const Lk = (s) => String(s || "").replace(/[~*\/\[\].`]/g, "_").slice(0, 120) || "_";
  const fN = (v) => intentar(() => fmt(r2(v), Number.isInteger(r2(v)) ? 0 : 1), String(r2(v)));
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const hoy = () => iso(new Date());
  const deIso = (s) => { const m = String(s || "").match(/^(\d{4})-(\d\d)-(\d\d)/); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null; };
  const masDias = (f, n) => { const d = deIso(f); d.setDate(d.getDate() + n); return iso(d); };
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const fDia = (f) => { const d = deIso(f); return d ? DIAS[d.getDay()] + " " + pad(d.getDate()) + "/" + pad(d.getMonth() + 1) : String(f || ""); };
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const otDe = (id) => ots().find((o) => o && o.id === id) || null;
  const permiso = (h) => intentar(() => (window.PERMISOS && PERMISOS.permiso ? PERMISOS.permiso(h) : "oculto"), "oculto");
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  const liviano = () => intentar(() => !!(window.__modoDatos && window.__modoDatos.liviano()), false);
  const cerrada = (o) => !!(o && o.cierre && o.cierre.cerradoTs);
  const abierta = (o) => !!o && o.estado !== "Anulada" && o.estado !== "Terminada" && !cerrada(o);
  const catalogo = () => intentar(() => (typeof ACTIVIDADES_CATALOGO != "undefined" ? ACTIVIDADES_CATALOGO : []), []);
  const labelDe = (k) => { if (String(k).indexOf("m:") === 0) return String(k).slice(2); const a = catalogo().find((x) => x && x.id === k); return a ? a.label : k; };
  const unDe = (k) => intentar(() => { const b = (typeof window.baremoActual == "function" && window.baremoActual()) || {}; return (b[k] && b[k].un) || ""; }, "");
  const nombreObra = (o) => { const n = String((o && o.plazaNombre) || "(sin obra)"); return window.__fmtNombre ? window.__fmtNombre.obra(n) : n.toUpperCase(); };
  const nombres = (o) => arr(o && o.personal).map((p) => (typeof p == "string" ? p : p && p.nombre)).filter((n) => n && String(n).trim());
  const per = (n) => (window.__fmtNombre && window.__fmtNombre.persona ? window.__fmtNombre.persona(n) : n);
  function puede() { return !window.__v146No && !!window.__fbUser && !liviano() && !esCrew() && permiso("parte") === "editar"; }
  const iaOk = () => intentar(() => typeof window.__iaPuede == "function" && window.__iaPuede() && typeof window.__asistenteAbrir == "function", false);

  // ---------------------------------------------------------------- las órdenes del día, con lo que mandó la cuadrilla
  const mando = (o) => { const c = obj(o.campo); return Object.keys(obj(c.enviados)).length > 0 || Object.keys(obj(c.tareaEnv)).length > 0 || Object.keys(obj(c.marcas)).length > 0; };
  function ordenesDia(f) {
    f = f || hoy(); const desde = masDias(f, -7);
    return ots().filter((o) => abierta(o) && String(o.fecha || "").slice(0, 10) <= f && (String(o.fecha || "").slice(0, 10) === f || (String(o.fecha || "") >= desde && mando(o))))
      .sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")) || String(a.numero || "").localeCompare(String(b.numero || "")));
  }
  function tareas(o) {
    const pv = obj(o.previsto), sac = arr(o.tareasSacadas).map((x) => (typeof x == "string" ? x : x && x.k));
    return arr(o.actividades).filter((k) => typeof k == "string" && k && sac.indexOf(k) < 0).map((k) => ({ k, label: labelDe(k), un: unDe(k), prev: num(pv[k]) }))
      .concat(arr(o.actividadesManuales).filter((t) => t && String(t.actividad || "").trim()).map((t) => ({ k: "m:" + String(t.actividad).trim(), label: String(t.actividad).trim(), un: "", prev: 0, manual: true })));
  }
  function envDe(o, k) { const x = obj(obj(obj(o.campo).tareaEnv)[Lk(k)]); const l = Object.keys(x).map((p) => x[p]).filter((v) => v && v.estado); return l.length ? l.sort((a, b) => (b.ts || 0) - (a.ts || 0))[0] : null; }
  function pasosSi(o, k) { const p = obj(obj(obj(o.campo).pasosObra)[Lk(k)] || obj(obj(o.campo).pasosObra)[k]); return Object.keys(p).filter((u) => p[u] && p[u].estado === "si").length; }
  // lo que la cuadrilla mandó de cada tarea (es lo que el cierre ya trae cargado)
  function mandoDe(o, t) {
    const m = obj(obj(obj(o.campo).marcas)[Lk(t.k)]), e = envDe(o, t.k), ps = pasosSi(o, t.k), h = obj(obj(obj(o.campo).horasTarea)[t.k] || obj(obj(o.campo).horasTarea)[Lk(t.k)]);
    let cant = null, txt = "no mandó nada";
    if (e && e.estado === "no") { cant = 0; txt = "no se hizo" + (m.motivo || e.motivo ? " (" + (m.motivo || e.motivo) + ")" : ""); }
    else if (m.hecho) { cant = num(m.cant) || ps || t.prev || 0; txt = "se hizo " + fN(cant) + (t.prev ? " de " + fN(t.prev) : ""); }
    else if (ps > 0) { cant = ps; txt = "lleva " + fN(ps) + (t.prev ? " de " + fN(t.prev) : ""); }
    return { cant, txt, horas: h.ini || h.fin ? (h.ini || "?") + " a " + (h.fin || "?") : "" };
  }
  function resumen(o) {
    const ts = tareas(o);
    return { otId: o.id, numero: o.numero || "", fecha: o.fecha || "", obra: nombreObra(o), ID: o.obraId || "", gente: nombres(o), horario: (o.horaInicio || "") + (o.horaFin ? " a " + o.horaFin : ""),
      tareas: ts.map((t) => { const m = mandoDe(o, t); return { k: t.k, tarea: t.label, unidad: t.un, previsto: t.prev || null, laCuadrillaMando: m.txt, cantidadCargada: m.cant, horas: m.horas || null }; }) };
  }
  const st = { on: false, ts: 0 };
  function ctx() {
    if (!st.on || Date.now() - st.ts > 40 * 6e4 || window.__v146No) return "";
    const l = ordenesDia().map(resumen);
    return `\n[CIERRE DEL DÍA POR VOZ] La persona dicta cómo terminó el día para cerrar las órdenes. Usá DIRECTO proponer_cierre_dia (una sola vez, con todas las órdenes que nombra; sin otras herramientas): por orden, solo lo que la persona corrige (cantidades por tarea con su «k», horas por persona con el nombre completo, «lo que falta a otro día» con la fecha AAAA-MM-DD) — lo demás queda como lo mandó la cuadrilla. Si nombra una obra que no está acá, decilo. Después contestá en UNA línea.\nÓrdenes abiertas del día (${hoy()}), ya cargadas con lo que mandó la cuadrilla:\n${JSON.stringify(l).slice(0, 14000)}`;
  }
  function abrir(texto) {
    if (!puede()) { try { window.mostrarAviso && window.mostrarAviso("🔒 El cierre por voz es para la oficina.", "error"); } catch (e) { } return false; }
    if (!iaOk()) { try { window.mostrarAviso && window.mostrarAviso("El asistente no está prendido para tu usuario.", "warn"); } catch (e) { } return false; }
    st.on = true; st.ts = Date.now();
    if (!window.__asistenteAbrir(texto || "")) return false;
    let n = 0; const t = setInterval(() => {
      const p = $("iaPanel"); if (!p && ++n < 50) return; clearInterval(t); if (!p) return;
      banda();
      const tx = $("iaTxt"); if (tx) tx.setAttribute("placeholder", "Ej.: «Los Álamos 4 izajes, Juan 8 horas, Pedro 6, el vínculo que faltó pasa al jueves»");
      if (!window.__cvSinMic) { const b = document.querySelector('#iaPanel [data-ia="mic"]'); if (b && !texto) try { b.click(); } catch (e) { } }
    }, 80);
    return true;
  }
  function banda() {
    const p = $("iaPanel"); if (!p) return;
    let b = $("cvBanda");
    if (!st.on || Date.now() - st.ts > 40 * 6e4) { b && b.remove(); return; }
    const l = ordenesDia();
    if (!b) { b = document.createElement("div"); b.id = "cvBanda"; const ch = $("iaChat"); ch && ch.parentNode ? ch.parentNode.insertBefore(b, ch) : p.appendChild(b); }
    const h = `<span class="cv-ic">🎙</span><span><b>Cierre del día</b> · ${l.length} ${l.length === 1 ? "orden abierta" : "órdenes abiertas"}${l.length ? ": " + esc(l.slice(0, 3).map((o) => nombreObra(o)).join(", ")) + (l.length > 3 ? "…" : "") : ""}. Decí solo lo que cambia: lo que mandó la cuadrilla ya está cargado.</span><button type="button" data-cv="salir" aria-label="Salir del cierre por voz">✕</button>`;
    if (b.__h !== h) { b.innerHTML = h; b.__h = h; }
  }
  function botonHtml() {
    if (!puede() || !iaOk()) return "";
    return `<div class="cv-tb no-print"><button type="button" class="btn-primary cv-btn" data-cv="abrir">✨ Cerrar el día por voz</button><span>Dictás cómo terminó el día y la app arma el cierre de cada orden (con lo que mandó la cuadrilla).</span></div>`;
  }
  function chip() {
    const ch = $("iaChips"); if (!ch || ch.querySelector("[data-cv]") || !puede()) return;
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.setAttribute("data-cv", "abrir"); b.textContent = "🎙 Cerrar el día";
    ch.insertBefore(b, ch.firstChild);
  }
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-cv]"); if (!b) return;
    e.preventDefault();
    if (b.dataset.cv === "abrir") { if ($("iaPanel") && !$("iaPanel").hidden) { st.on = true; st.ts = Date.now(); banda(); const m = document.querySelector('#iaPanel [data-ia="mic"]'); if (m && !window.__cvSinMic) try { m.click(); } catch (er) { } } else abrir(); }
    else if (b.dataset.cv === "salir") { st.on = false; banda(); }
  });
  setInterval(() => { try { if (window.__v146No) return; const p = $("iaPanel"); if (p && !p.hidden) { chip(); banda(); } } catch (e) { } }, 1200);

  // ---------------------------------------------------------------- la propuesta (la arma la app con lo que dijo la IA)
  function otPorRef(r) {
    const s = String(r || "").trim(); if (!s) return null;
    const x = otDe(s); if (x) return x;
    const q = s.toUpperCase().replace(/\s+/g, ""), n = q.replace(/^OT-?/, "");
    return ots().find((o) => { const u = String(o.numero || "").toUpperCase(); return u === q || u.replace(/^OT-?/, "") === n || u.slice(-n.length) === n && /^\d{2,4}$/.test(n); }) || null;
  }
  function fechaDe(s) {
    const t = nk(s); if (!t) return "";
    if (t === "hoy") return hoy(); if (t === "manana") return masDias(hoy(), 1); if (t === "pasado manana") return masDias(hoy(), 2);
    let m = String(s).trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if (m) return m[1] + "-" + pad(+m[2]) + "-" + pad(+m[3]);
    m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/); if (m) return (m[3] ? (m[3].length === 2 ? "20" + m[3] : m[3]) : String(new Date().getFullYear())) + "-" + pad(+m[2]) + "-" + pad(+m[1]);
    const d = DIAS.map(nk).indexOf(t.replace(/^el /, "")); if (d >= 0) { let f = masDias(hoy(), 1); for (let i = 0; i < 7; i++) { if (deIso(f).getDay() === d) return f; f = masDias(f, 1); } }
    return "";
  }
  function tareaDe(o, k) { const l = tareas(o), q = nk(k); return l.find((t) => t.k === k) || l.find((t) => nk(t.label) === q) || l.find((t) => q && nk(t.label).indexOf(q) >= 0) || null; }
  function personaDe(o, n) { const q = nk(n); const l = nombres(o); return l.find((x) => nk(x) === q) || l.find((x) => q && nk(x).split(" ")[0] === q.split(" ")[0]) || null; }
  function destinoDe(o, f) { return intentar(() => window.__unaObra.otraDe(o.plazaId, f, o.id)[0], null) || ots().find((x) => x.id !== o.id && String(x.plazaId) === String(o.plazaId) && x.fecha === f && abierta(x)) || null; }
  function armarPropuesta(lista) {
    const ordenes = [], filas = [], avisos = [];
    arr(lista).forEach((a) => {
      const o = otPorRef(a && (a.otId || a.numero || a.orden)); if (!o) { avisos.push(`No encontré la orden «${(a && (a.otId || a.numero)) || "?"}»`); return; }
      if (!abierta(o)) { avisos.push(`${o.numero || o.id} ya está ${o.estado === "Anulada" ? "anulada" : "cerrada"}`); return; }
      if (ordenes.some((x) => x.otId === o.id)) return;
      const R = { otId: o.id, numero: o.numero || "", obra: nombreObra(o), fecha: o.fecha || "", cantidades: {}, horas: {}, pasar: [], obs: String((a && a.observaciones) || "").slice(0, 400), gente: nombres(o) };
      const cab = `${R.numero} · ${R.obra}`;
      Object.keys(obj(a.cantidades)).forEach((kk) => {
        const t = tareaDe(o, kk); if (!t) { avisos.push(`${cab}: no tiene la tarea «${kk}»`); return; }
        const v = Math.max(0, num(a.cantidades[kk])); R.cantidades[t.k] = v;
        const md = mandoDe(o, t); filas.push({ c: `${cab} · ${t.label}`, a: md.cant == null ? "sin cargar" : fN(md.cant) + (t.un ? " " + t.un : ""), d: fN(v) + (t.un ? " " + t.un : "") + (t.prev ? ` (de ${fN(t.prev)})` : "") });
      });
      Object.keys(obj(a.horas)).forEach((n) => {
        const p = personaDe(o, n); if (!p) { avisos.push(`${cab}: ${n} no está en la orden`); return; }
        const v = Math.max(0, Math.min(24, num(a.horas[n]))); R.horas[p] = v;
        filas.push({ c: `${cab} · horas de ${per(p)}`, a: "jornada", d: fN(v) + " h" });
      });
      arr(a.pasar).forEach((x) => {
        const t = tareaDe(o, x && (x.k || x.tarea)); if (!t) { avisos.push(`${cab}: no tiene la tarea «${(x && (x.k || x.tarea)) || "?"}» para pasar`); return; }
        const f = fechaDe(x.fecha); if (!f || f <= String(o.fecha || "")) { avisos.push(`${cab}: no entendí el día para «${t.label}»`); return; }
        const hecho = R.cantidades[t.k] != null ? R.cantidades[t.k] : num(mandoDe(o, t).cant);
        const cant = x.cant != null && num(x.cant) > 0 ? num(x.cant) : Math.max(0, r2(t.prev - hecho));
        const quien = arr(x.quien).map((n) => personaDe(o, n) || n).filter(Boolean);
        const d = destinoDe(o, f);
        R.pasar.push({ k: t.k, label: t.label, un: t.un, cant, fecha: f, quien, destino: d ? d.numero || "" : "" });
        filas.push({ c: `${cab} · ${t.label} · lo que falta`, a: "—", d: `${cant > 0 ? fN(cant) + (t.un ? " " + t.un : "") + " " : ""}→ ${fDia(f)}${d ? " (se suma a la " + (d.numero || "orden") + ")" : " (orden nueva)"}` });
      });
      if (!Object.keys(R.cantidades).length && !Object.keys(R.horas).length && !R.pasar.length) filas.push({ c: cab, a: "lo que mandó la cuadrilla", d: "se cierra así" });
      ordenes.push(R);
    });
    if (!ordenes.length) return { err: "No hay órdenes para cerrar" + (avisos.length ? ": " + avisos.join("; ") : ".") };
    const html = `<div class="cv-res">${ordenes.map((R) => { const o = otDe(R.otId); return `<div class="cv-o"><b>${esc(R.obra)}</b><small>${esc(R.numero)} · ${esc(fDia(R.fecha))}</small><div class="cv-per">${R.gente.map((n) => `<span><i>${esc(String(n).split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase())}</i>${esc(per(n))}${R.horas[n] != null ? " · " + esc(fN(R.horas[n])) + " h" : ""}</span>`).join("")}</div>${tareas(o).map((t) => { const v = R.cantidades[t.k] != null ? R.cantidades[t.k] : mandoDe(o, t).cant; return `<div class="cv-t"><span>${esc(t.label)}${t.prev ? ` <small>de ${esc(fN(t.prev))}</small>` : ""}</span><b>${v == null ? "—" : esc(fN(v))} <small>${esc(t.un)}</small></b></div>`; }).join("")}</div>`; }).join("")}</div>`;
    return { ordenes, filas, html, avisos };
  }

  // ---------------------------------------------------------------- hacerlo (con el «Sí»)
  // «lo que falta a otro día»: el mismo camino que la v128 (cierreTarea), sin la ventana
  async function pasarTarea(o, k, cant, fecha, quien, op) {
    op = op || {};
    const gente = quien && quien.length ? quien : intentar(() => window.__cierreTarea.genteDe(o, k), nombres(o)) || nombres(o);
    const nom = intentar(() => (typeof window.nominaEquipo == "function" ? window.nominaEquipo() : []), []);
    const rolDe = (n) => { const a = arr(o.personal).find((p) => p && nk(p.nombre || p) === nk(n)) || nom.find((p) => nk(p.nombre) === nk(n)); return (a && a.rol) || ""; };
    const manual = String(k).indexOf("m:") === 0, man = manual ? arr(o.actividadesManuales).find((m) => "m:" + String(m.actividad || "").trim() === k) || { actividad: k.slice(2) } : null;
    const equipo = gente.length > 1 && gente.length < nombres(o).length ? gente : null, lab = labelDe(k);
    const d = destinoDe(o, fecha); let ref;
    if (d) {
      const pers = arr(d.personal).slice(); gente.forEach((n) => { if (!pers.some((p) => nk(typeof p == "string" ? p : p.nombre) === nk(n))) pers.push({ nombre: n, rol: rolDe(n) }); });
      const c = { personal: pers, personalNombres: [...new Set(arr(d.personalNombres).concat(gente.map(nk)))] };
      if (manual) c.actividadesManuales = arr(d.actividadesManuales).some((m) => "m:" + String(m.actividad || "").trim() === k) ? d.actividadesManuales : arr(d.actividadesManuales).concat([man]);
      else { c.actividades = [...new Set(arr(d.actividades).concat([k]))]; if (cant > 0) c.previsto = Object.assign({}, obj(d.previsto), { [k]: r2(num(obj(d.previsto)[k]) + cant) }); }
      if (gente.length === 1) c.asignada = Object.assign({}, obj(d.asignada), { [k]: gente[0] }); else if (equipo) c.equipoTarea = Object.assign({}, obj(d.equipoTarea), { [k]: equipo });
      await window.fbOtUpdate(d.id, c); Object.assign(d, c);
      ref = { otId: d.id, numero: d.numero || "", fecha, cant, sumada: true };
    } else {
      const nueva = { plazaId: o.plazaId || "", plazaNombre: o.plazaNombre || "", obraId: o.obraId || "", sinPlaza: !!o.sinPlaza, direccion: o.direccion || "", barrio: o.barrio || "", fecha, diaSemana: intentar(() => diaSemanaDeFecha(fecha), ""), horaInicio: o.horaInicio || "", horaFin: o.horaFin || "", cuadrilla: o.cuadrilla || "", responsable: o.responsable || "", personal: gente.map((n) => ({ nombre: n, rol: rolDe(n) })), personalNombres: gente.map(nk), actividades: manual ? [] : [k], actividadesManuales: manual ? [man] : [], previsto: !manual && cant > 0 ? { [k]: cant } : {}, materiales: "", notas: `Viene de la ${o.numero || "orden"} del ${intentar(() => formatFechaCorta(o.fecha), o.fecha)}: lo que faltó de «${lab}».`, vehiculos: o.vehiculos || [], estado: "Emitida", numero: intentar(() => proximoNumeroOt(), ""), creadoPor: String((window.__fbUser || {}).email || ""), ts: Date.now(), vieneDe: { otId: o.id, numero: o.numero || "", k } };
      if (gente.length === 1 && !manual) nueva.asignada = { [k]: gente[0] }; else if (equipo && !manual) nueva.equipoTarea = { [k]: equipo };
      try { const et = typeof etapasDeTareas == "function" && !manual ? etapasDeTareas([k]) : null; if (et && et.length) { nueva.etapaKey = et[0].key; nueva.etapaLabel = et.map((x) => x.label).join(" · "); nueva.etapasKeys = et.map((x) => x.key); } } catch (e) { }
      const id = await window.fbOtAdd(nueva);
      ref = { otId: id, numero: nueva.numero, fecha, cant, sumada: false };
    }
    const r = Object.assign({ ts: Date.now(), porVoz: !!op.porVoz }, ref);
    await window.fbOtUpdate(o.id, { ["pasadoA." + Lk(k)]: r });
    o.pasadoA = Object.assign({}, obj(o.pasadoA), { [Lk(k)]: r });
    try { window.fbAuditar && window.fbAuditar("ot_pasar_tarea", `${o.numero || o.id} · ${lab} → ${ref.numero} ${fecha}${op.porVoz ? " (cierre por voz)" : ""}`); } catch (e) { }
    return ref;
  }
  const abiertoCierre = () => { const c = $("cierreOt"); return !!(c && c.style.display !== "none"); };
  const poner = (el, v) => { if (!el) return; if (el.value !== String(v)) { el.value = String(v); el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); } };
  async function cerrarUna(o, x) {
    if (typeof window.abrirCierreOt != "function" || typeof window.guardarCierreOt != "function") return { ok: false, motivo: "el cierre no está listo" };
    document.body.classList.add("cd-auto");
    try {
    for (let i = 0; i < 30 && abiertoCierre(); i++) await espera(100);   // si quedó abierto otro cierre, esperar
      if (abiertoCierre()) try { window.cerrarCuadroCierre(); } catch (e) { }
      window.abrirCierreOt(o.id);
      for (let i = 0; i < 30 && !document.querySelector("#cierreCuerpo .cierre-qty, #cierreCuerpo .cierre-persona"); i++) await espera(100);
      await espera(250);
      Object.keys(obj(x.cantidades)).forEach((k) => poner(document.querySelector(`#cierreCuerpo .cierre-qty[data-k="${CSS.escape(k)}"]`), x.cantidades[k]));
      document.querySelectorAll("#cierreCuerpo .cierre-horas-p[data-n]").forEach((el) => { const k = Object.keys(obj(x.horas)).find((n) => nk(n) === nk(el.dataset.n)); if (k != null) poner(el, x.horas[k]); });
      if (x.obs && $("cierreObs") && !$("cierreObs").value) poner($("cierreObs"), x.obs);
      await espera(150);
      const rNo = document.querySelector('#cierreCuerpo input[name="coCierreResp"][value="no"]');
      if (rNo && !document.querySelector('#cierreCuerpo input[name="coCierreResp"]:checked')) { rNo.checked = true; rNo.dispatchEvent(new Event("change", { bubbles: true })); await espera(60); }
      let ok = true; try { ok = !window.CO || !window.CO.cierreOtValidar || window.CO.cierreOtValidar().ok; } catch (e) { ok = true; }
      if (!ok) { document.body.classList.remove("cd-auto"); return { ok: false, motivo: "pide el paso del itemizado: completalo en la ventana que se abrió", abierta: true }; }
      const term = $("cierreTerminada"); if (term) { term.checked = true; term.dispatchEvent(new Event("change", { bubbles: true })); }
      const antes = (o.cierre && o.cierre.cerradoTs) || 0;
      window.__aprobFiltro = null; await window.guardarCierreOt();
      for (let i = 0; i < 40; i++) { const y = otDe(o.id); if (y && y.cierre && (y.cierre.cerradoTs || 0) > antes) break; await espera(100); }
      const y = otDe(o.id), bien = !!(y && y.cierre && (y.cierre.cerradoTs || 0) > antes);
      const m2 = (($("cierreMsg") || {}).textContent || "").trim();
      if (bien) for (let i = 0; i < 30 && abiertoCierre(); i++) await espera(100);   // el cierre se cierra solo después de guardar: no pisar la próxima
      if (abiertoCierre()) try { window.cerrarCuadroCierre(); } catch (e) { }
      await espera(400);
      return bien ? { ok: true } : { ok: false, motivo: m2 || "no se pudo guardar (revisá la conexión)" };
    } catch (e) { return { ok: false, motivo: String((e && e.message) || e) }; }
    finally { document.body.classList.remove("cd-auto"); }
  }
  async function aplicar(lista) {
    const R = { cerradas: [], quedaron: [], pasadas: [] };
    for (const x of arr(lista)) {
      const o = otDe(x.otId); if (!o || !abierta(o)) { R.quedaron.push({ numero: x.numero, motivo: "ya no está abierta" }); continue; }
      for (const p of arr(x.pasar)) {
        if (obj(o.pasadoA)[Lk(p.k)] && obj(o.pasadoA)[Lk(p.k)].fecha === p.fecha) continue;   // ya se pasó (no se duplica)
        try { const ref = await pasarTarea(o, p.k, p.cant, p.fecha, p.quien, { porVoz: true }); R.pasadas.push({ numero: x.numero, label: p.label, a: ref.numero, fecha: p.fecha, sumada: ref.sumada }); }
        catch (e) { R.quedaron.push({ numero: x.numero, motivo: `no pude pasar «${p.label}»: ${e && e.code === "permission-denied" ? "sin permiso" : "sin conexión"}` }); }
      }
      const c = await cerrarUna(o, x);
      if (c.ok) R.cerradas.push(x.numero); else R.quedaron.push({ numero: x.numero, motivo: c.motivo });
      await espera(300);
    }
    st.on = false;
    return R;
  }
  window.__cierreVoz = { puede, abrir, ctx, botonHtml, ordenesDia, resumen, armarPropuesta, aplicar, pasarTarea, cerrarUna, fechaDe, estado: () => ({ on: st.on, ts: st.ts }), _st: st };
})();
