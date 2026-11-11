(function () {
  "use strict";
  // v147 · «🗺 Mapa de guerra»: un MODO del mismo Mapa (maqueta maq_semana/mapa: compu opción A + celu). Pedido de Ángel, 11/11/2026.
  //  · El Mapa de siempre queda igual para todos. Quien edita Órdenes (admin/oficina) ve arriba «🎯 Control»: lo prende y lo apaga
  //    (localStorage ema.mapa.control). Prendido: números de hoy (órdenes, en obra, vehículos, alertas, % Zona A), panel de alertas a
  //    la derecha en la compu / abajo en el celu (Hoy · Alertas · Cuadrillas · Avance; urgente / revisar hoy / para saber),
  //    pines de cuadrilla (iniciales + vehículo por vehiculos[].tipo) con línea punteada a la obra de su orden de hoy, ícono de la
  //    alerta sobre cada obra y la ficha rápida de la obra (avance, Gantt, quién está, qué falta, falta material mañana; Legajo /
  //    Orden / Llamar). Tocar una alerta centra el mapa y abre la ficha.
  //  · Todo de memoria, SIN IA y sin escuchas nuevas: supervisor (obra trabada), reservas contra stock de las obras con orden de
  //    mañana (falta material), obraGps (fotos dudosas, obras sin ubicación), órdenes de días anteriores sin cerrar, sinTarea (gente
  //    sin tarea), pasosObra del hormigonado + fraguado de la sugerida (fraguado hasta…). Cada alerta lleva a su acción de siempre.
  //  · «Llamar»: configEquipo/personal.contactos (y el teléfono de la nómina si lo tiene); si no, «sin teléfono cargado».
  //  · Sin recorrido histórico ni «llega en N min» (no hay datos). Sin movimiento de la v147 adentro del mapa.
  //  · Pruebas viejas: window.__v147No (salvo v147:true en h.js).
  if (window.__mapaControl) return;
  const $ = (id) => document.getElementById(id);
  const V = () => window.__v135 || {};
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const intentar = (f, d) => { try { const r = f(); return r === undefined ? d : r; } catch (e) { return d; } };
  const arr = (x) => (Array.isArray(x) ? x : x && typeof x == "object" ? Object.values(x) : []);
  const num = (x) => { const n = Number(String(x == null ? "" : x).replace(",", ".")); return isFinite(n) ? n : 0; };
  const fN = (n, d) => intentar(() => window.fmt(n, d || 0), String(Math.round(n)));
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const LS = { get: (k) => intentar(() => localStorage.getItem(k), null), set: (k, v) => intentar(() => localStorage.setItem(k, v), null) };
  const hoyISO = () => intentar(() => V().hoy(), new Date().toISOString().slice(0, 10));
  const masDias = (f, n) => { const d = new Date(f + "T12:00:00"); d.setDate(d.getDate() + n); return intentar(() => window.fechaAISO(d), d.toISOString().slice(0, 10)); };
  const hhmm = (ts) => { const d = new Date(ts); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  const fCorta = (f) => String(f || "").slice(8, 10) + "/" + String(f || "").slice(5, 7);
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const st = { on: false, tab: LS.get("ema.mapa.tab") || "alertas", ficha: null, capa: null, timer: 0, lista: [] };

  function puede() {
    if (window.__v147No) return false;
    return intentar(() => window.PERMISOS && PERMISOS.permiso ? PERMISOS.permiso("parte") === "editar" : false, false);
  }
  const obras = () => arr(intentar(() => (typeof avanceObras !== "undefined" ? avanceObras : window.avanceObras), [])).filter((o) => o && o.id);   // avanceObras es un «let» global
  const obraDe = (id) => obras().find((o) => String(o.id) === String(id));
  const nomObra = (o) => intentar(() => window.__fmtNombre.obra(o.nombre || o.plazaNombre), String((o && (o.nombre || o.plazaNombre)) || "").toUpperCase());
  const ll = (o) => (o && o.lat != null && o.lng != null && isFinite(+o.lat) && isFinite(+o.lng) ? [+o.lat, +o.lng] : null);
  const fin = (o) => intentar(() => window.__obraFin(o), false);
  const ots = () => intentar(() => V().ots(), arr(window.ordenesTrabajo)) || [];
  const abierta = (o) => !/terminada|anulada/i.test(String(o.estado || "")) && !o.unidaEn;
  const otsDe = (f) => ots().filter((o) => o.fecha === f && !/anulada/i.test(String(o.estado || "")) && !o.unidaEn);
  const pct = (o) => intentar(() => Math.round(num(window.calcularAvanceEtapasPct(o))), 0);
  const personasOt = (o) => arr(o.personal).map((p) => (p && (p.nombre || p)) || "").filter(Boolean);
  const iniciales = (n) => intentar(() => V().iniciales(n), String(n || "?").split(/\s+/).map((x) => x[0] || "").join("").slice(0, 2).toUpperCase());
  const corto = (n) => String(n || "").split(/\s+/)[0];

  // ------------------------------------------------------------------------------------------- vehículos e íconos
  const SV = (p) => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ICV = {
    grua: SV('<path d="M3 17h11v-4H8l-2 4M14 13h4l3 3v1h-7zM6 17a1.6 1.6 0 1 0 0 .1M17 17a1.6 1.6 0 1 0 0 .1M9 13V6l9-2"/>'),
    hidro: SV('<path d="M3 17h12v-4H3zM15 15h3l3 2v0h-6M6 13l6-7 3 2M15 6h3v3h-3zM6 17a1.6 1.6 0 1 0 0 .1M17 17a1.6 1.6 0 1 0 0 .1"/>'),
    auto: SV('<path d="M4 15l1.6-4.5A2 2 0 0 1 7.5 9h9a2 2 0 0 1 1.9 1.5L20 15v3H4zM4 15h16M7.5 18.5a1.5 1.5 0 1 0 0 .1M16.5 18.5a1.5 1.5 0 1 0 0 .1"/>')
  };
  const IC = {
    trabada: SV('<circle cx="12" cy="12" r="8.5"/><path d="M10 9v6M14 9v6"/>'),
    material: SV('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9"/>'),
    fotos: SV('<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/>'),
    sinCerrar: SV('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4v2h6V4M9 11h6M9 15h4"/>'),
    sinTarea: SV('<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20a6.5 6.5 0 0 1 11-4.7M16 15l5 5M21 15l-5 5"/>'),
    fraguado: SV('<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9"/>'),
    sinUbic: SV('<path d="M12 21s-6.5-6.2-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
    tel: SV('<path d="M5 4h4l1.5 4-2.5 1.5a11 11 0 0 0 6.5 6.5L16 13.5l4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
    gente: SV('<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0M16 4.5a3 3 0 0 1 0 6M18 14.5a5 5 0 0 1 3 5.5"/>'),
    doc: SV('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>'),
    falta: SV('<path d="M4 20V10l5-5h2v15M11 9h5v11M4 20h16"/>'),
    carpeta: SV('<path d="M3 7h6l2 2h10v10H3z"/>')
  };
  function tipoVeh(v) {
    const t = String((v && v.tipo) || "").toLowerCase(), n = nk(v && v.nombre);
    if (/grua/.test(t) || /grua/.test(n)) return "grua";
    if (/hidro|barquilla/.test(t) || /hidro|barquilla/.test(n)) return "hidro";
    return "auto";
  }
  function vehDeOt(o) {
    const l = arr(o.vehiculos).length ? arr(o.vehiculos) : o.vehiculoId ? [{ id: o.vehiculoId }] : [];
    return l.map((v) => Object.assign({}, intentar(() => window.__vehiculos.porId(v.id), null) || {}, v));
  }

  // ------------------------------------------------------------------------------------------- en vivo (lo que ya lee ubicacionVivo con el Mapa abierto)
  function vivoDe(nombre) {
    const k = nk(nombre), l = arr(intentar(() => window.__ubicacionVivo.lista(), {}));
    const u = l.find((x) => nk(x.clave || x.persona) === k);
    if (!u || u.lat == null) return null;
    const ts = num(u.posTs || u.ts), fresco = u.activo !== false && Date.now() - ts < 30 * 6e4;
    return { lat: +u.lat, lng: +u.lng, ts, fresco };
  }
  function cuadrillas() {   // una por orden de hoy
    return otsDe(hoyISO()).map((o) => {
      const gente = personasOt(o), ob = obraDe(o.plazaId), veh = vehDeOt(o);
      let pos = null; gente.forEach((n) => { const v = vivoDe(n); if (v && (!pos || v.ts > pos.ts)) pos = v; });
      const lleg = intentar(() => Object.keys(o.campo.llegada || {}).map((k) => o.campo.llegada[k]).filter((x) => x && x.ts).sort((a, b) => a.ts - b.ts)[0], null);
      return { o, ob, gente, veh, pos, lleg, ini: iniciales(gente[0] || o.cuadrilla || "?") };
    });
  }

  // ------------------------------------------------------------------------------------------- alertas (sin IA, de memoria)
  const P_TXT = { 1: "urgente", 2: "revisar hoy", 3: "para saber" };
  function faltaMaterial(id) {   // la misma cuenta de la orden sugerida: reservas abiertas de la obra contra el stock
    const out = [], pide = {};
    arr(window.reservasMaterial).filter((r) => r && String(r.plazaId || "") === String(id) && !/entregada|anulada|rechazada/.test(String(r.estado || ""))).forEach((r) => arr(r.items).forEach((it) => {
      if (!it || it.nohay) return; const cod = String(it.codigo == null ? "" : it.codigo); const q = Math.max(0, num(it.cant != null ? it.cant : it.cantidad) - num(it.entregado)); if (!(q > 0)) return;
      const x = pide[cod] = pide[cod] || { cod, q: 0, desc: it.desc || it.descripcion || "", un: it.un || "" }; x.q += q;
    }));
    Object.keys(pide).forEach((cod) => { const x = pide[cod], hay = intentar(() => num(window.stockActual(cod)), 0); if (x.q > hay) out.push({ cod, desc: x.desc || "Material " + cod, un: x.un, falta: Math.round((x.q - Math.max(0, hay)) * 100) / 100 }); });
    return out;
  }
  function alertas() {
    const l = [], hoy = hoyISO(), man = intentar(() => window.__sugerida.proxHabil(hoy), masDias(hoy, 1));
    const A = (p, tipo, t, obraId, s, acc) => l.push({ p, tipo, t, obraId: obraId || "", s: s || "", acc: acc || [] });
    // 1 · obra trabada (supervisor)
    intentar(() => window.__supervisor.hallazgos(), []).forEach((h) => {
      if (h.cat === "Obras trabadas" && h.obraId && /sin avance hace/.test(h.t)) A(1, "trabada", "Obra trabada", h.obraId, h.t.replace(/^.*?:\s*/, "") + (h.s ? " · " + h.s : ""), [["legajo", "Ver legajo"], ["sugerida", "Armar orden"]]);
    });
    // 1 · falta material para mañana (obras con orden emitida para mañana o en la sugerida)
    const idsMan = {};
    otsDe(man).forEach((o) => { idsMan[o.plazaId] = 1; });
    intentar(() => (window.__sugerida.armar(man).ordenes || []).forEach((x) => { if (x.obraId) idsMan[x.obraId] = 1; }), null);
    Object.keys(idsMan).forEach((id) => {
      const f = faltaMaterial(id); if (!f.length) return;
      A(1, "material", "Falta material para " + (man === masDias(hoy, 1) ? "mañana" : "el " + DIAS[new Date(man + "T12:00:00").getDay()]), id, f.slice(0, 3).map((m) => `${m.desc}: faltan ${fN(m.falta)}${m.un ? " " + m.un : ""}`).join(" · "), [["compras", "Pedido de compras"], ["reservas", "Ver reservas"]]);
    });
    // 2 · fotos dudosas (obraGps v144)
    intentar(() => window.__obraGps.grupos(), []).forEach((g) => A(2, "fotos", `${g.fotos.length} ${g.fotos.length === 1 ? "foto dudosa" : "fotos dudosas"}`, g.suya.id, `El GPS ${g.fotos.length === 1 ? "la ubica" : "las ubica"} en ${nomObra(g.otra)} (a ${fN(Math.min.apply(null, g.dOtra))} m)`, [["fotosSup", "Mover / Está bien"]]));
    // 2 · órdenes de días anteriores sin cerrar
    ots().filter((o) => o.fecha && o.fecha < hoy && abierta(o)).sort((a, b) => (a.fecha < b.fecha ? -1 : 1)).forEach((o) => {
      const env = Object.keys((o.campo && o.campo.enviados) || {}).length;
      A(2, "sinCerrar", "Orden sin cerrar", o.plazaId, `${o.numero || "Orden"} del ${fCorta(o.fecha)}${env ? " · la cuadrilla ya mandó" : ""}`, [["cerrar:" + o.id, "Cerrar"]]);
    });
    // 2 · gente sin tarea hoy (v145)
    const sinT = intentar(() => (window.__sinTarea && !window.__v145No && window.__sinTarea.puede() ? window.__sinTarea.sinTarea(hoy) : []), []) || [];
    if (sinT.length) A(2, "sinTarea", `${sinT.length} ${sinT.length === 1 ? "persona sin tarea" : "personas sin tarea"}`, "", sinT.slice(0, 6).map((x) => x.nombre).join(" · ") + " · hoy", [["sugerida", "Darles tarea"]]);
    // 3 · fraguado (hormigonado de las órdenes + horas de la sugerida)
    const horas = intentar(() => num(window.__sugerida.cfg().fraguado), 72) || 72, frag = {};
    ots().forEach((o) => { const h = (o.campo && o.campo.pasosObra && (o.campo.pasosObra.hormigonado || o.campo.pasosObra.fundaciones)) || {}; Object.keys(h).forEach((u) => { const x = h[u] || {}; if (x.estado === "no") return; const ts = num(x.ts); if (!ts) return; const f = frag[o.plazaId] = frag[o.plazaId] || { ts: 0, n: 0 }; f.n++; if (ts > f.ts) f.ts = ts; }); });
    Object.keys(frag).forEach((id) => { const hasta = frag[id].ts + horas * 36e5; if (hasta > Date.now()) { const d = new Date(hasta); A(3, "fraguado", "Fraguado hasta el " + DIAS[d.getDay()], id, `${frag[id].n} ${frag[id].n === 1 ? "base" : "bases"} · izar desde el ${DIAS[d.getDay()]} ${fCorta(intentar(() => window.fechaAISO(d), ""))} ${hhmm(hasta)}`, [["legajo", "Ver legajo"]]); } });
    // 3 · obras sin ubicación (obraGps v144)
    intentar(() => window.__obraGps.sinUbic(), []).forEach((o) => A(3, "sinUbic", "Obra sin ubicación", o.id, "No está en el mapa ni sirve para el GPS de las fotos", [["ubicar", "Cargar ubicación"]]));
    return l.sort((a, b) => a.p - b.p);
  }

  // ------------------------------------------------------------------------------------------- pantalla
  function asegurar() {
    const card = $("mapaCard"), lay = $("mapaLayout"); if (!card || !lay) return false;
    if (!$("mgBar")) {
      const b = document.createElement("div"); b.id = "mgBar"; b.className = "mg-bar no-print";
      const h2 = card.querySelector("h2"); (h2 || card.firstChild).insertAdjacentElement(h2 ? "afterend" : "beforebegin", b);
    }
    $("mgBar").innerHTML = puede() ? `<button type="button" class="chip mg-btn${st.on ? " activo" : ""}" data-mg="toggle" aria-pressed="${st.on}">🎯 Control</button>${st.on ? `<span class="mg-tit"><b>Mapa de guerra</b><span class="mg-vivo"><i></i>EN VIVO · ${hhmm(Date.now())}</span></span>` : '<span class="mg-pista">Obras, cuadrillas y alertas de hoy</span>'}` : "";
    $("mgBar").style.display = puede() ? "" : "none";
    if (!$("mgKpis")) { const k = document.createElement("div"); k.id = "mgKpis"; k.className = "mg-kpis no-print"; lay.insertBefore(k, $("mapaObras")); }
    if (!$("mgFicha")) { const f = document.createElement("div"); f.id = "mgFicha"; f.className = "mg-ficha no-print"; f.setAttribute("aria-live", "polite"); lay.appendChild(f); }
    if (!$("mgPanel")) { const p = document.createElement("div"); p.id = "mgPanel"; p.className = "mg-panel no-print"; lay.appendChild(p); }
    return true;
  }
  const kpi = (n, t, cls) => `<div class="mg-k${cls ? " " + cls : ""}"><b>${n}</b><small>${t}</small></div>`;
  function pintar() {
    if (!asegurar()) return;
    const on = st.on && puede();
    document.body.classList.toggle("mg-on", on);
    if (!on) { quitarCapa(); $("mgKpis").innerHTML = ""; $("mgPanel").innerHTML = ""; $("mgFicha").innerHTML = ""; $("mgFicha").classList.remove("on"); return; }
    const C = cuadrillas(), L0 = alertas(); st.lista = L0;
    const gente = {}; C.forEach((c) => c.gente.forEach((n) => { gente[nk(n)] = 1; }));
    const vehs = {}; C.forEach((c) => c.veh.forEach((v) => { vehs[v.id || v.nombre] = 1; }));
    const z = intentar(() => window.__zonaContrato.resumen(), null);
    $("mgKpis").innerHTML = kpi(C.length, "órdenes hoy") + kpi(Object.keys(gente).length, "en obra") + kpi(Object.keys(vehs).length, "vehículos") + kpi(L0.length, "alertas", L0.some((a) => a.p === 1) ? "rojo" : "") + kpi(z ? fN(z.pct, 1) + " %" : "—", z ? "Zona " + esc(z.zona) + (z.corto ? " (" + esc(z.corto) + ")" : "") : "zona");
    const n = (p) => L0.filter((a) => a.p === p).length;
    const tabs = [["hoy", "Hoy", C.length], ["alertas", "Alertas", L0.length], ["cuadrillas", "Cuadrillas", C.length], ["avance", "Avance", null]];
    let cuerpo = "";
    if (st.tab === "alertas") cuerpo = `<div class="mg-sem"><span class="p1"><b>${n(1)}</b> urgentes</span><span class="p2"><b>${n(2)}</b> revisar hoy</span><span class="p3"><b>${n(3)}</b> para saber</span></div>` + (L0.length ? L0.map(alertaHtml).join("") : '<div class="mg-vacio">✅ Sin alertas por ahora.</div>');
    else if (st.tab === "hoy") cuerpo = C.length ? C.map((c) => { const h = intentar(() => V().hechasDe(c.o), null), t = num(intentar(() => V().tareasDe(c.o), 0)); return `<button type="button" class="mg-it" data-mg="ficha:${esc(c.o.plazaId)}"><span class="mg-ini">${esc(c.ini)}</span><span class="mg-tx"><b>${esc(nomObra(c.ob || { nombre: c.o.plazaNombre }))}</b><small>${esc(c.o.numero || "")} · ${esc(c.gente.map(corto).join(" · "))}${t && h != null ? ` · ${h} de ${t} hechas` : ""} · ${esc(c.o.estado || "")}</small></span></button>`; }).join("") : '<div class="mg-vacio">No hay órdenes para hoy.</div>';
    else if (st.tab === "cuadrillas") cuerpo = C.length ? C.map((c) => `<button type="button" class="mg-it" data-mg="ficha:${esc(c.o.plazaId)}"><span class="mg-ini${c.pos && c.pos.fresco ? " vivo" : ""}">${esc(c.ini)}</span><span class="mg-tx"><b>${esc(c.gente.join(" · ") || c.o.cuadrilla || "")}</b><small>${c.veh.length ? esc(c.veh.map((v) => v.nombre || v.patente || "").join(", ")) + " · " : ""}${c.pos ? (c.pos.fresco ? "en vivo " + hhmm(c.pos.ts) : "sin actualizar desde " + hhmm(c.pos.ts)) : "sin ubicación"} · va a ${esc(nomObra(c.ob || { nombre: c.o.plazaNombre }))}</small></span></button>`).join("") : '<div class="mg-vacio">No hay cuadrillas con orden hoy.</div>';
    else cuerpo = obras().filter((o) => !fin(o) && o.tipo !== "barrio" || pct(o) > 0).map((o) => ({ o, a: pct(o) })).sort((a, b) => b.a - a.a).slice(0, 40).map((x) => `<button type="button" class="mg-it" data-mg="ficha:${esc(x.o.id)}"><span class="mg-tx"><b>${esc(nomObra(x.o))} <em>${x.a} %</em></b><span class="mg-barra"><i class="${nivel(x.a)}" style="width:${Math.max(2, x.a)}%"></i></span></span></button>`).join("");
    $("mgPanel").innerHTML = `<div class="mg-asa" aria-hidden="true"></div><div class="mg-tabs" role="tablist">${tabs.map(([k, t, c]) => `<button type="button" role="tab" class="mg-tab${st.tab === k ? " on" : ""}" data-mg="tab:${k}" aria-selected="${st.tab === k}">${t}${c != null ? ` <span>${c}</span>` : ""}</button>`).join("")}</div><div class="mg-cuerpo">${cuerpo}</div><div class="mg-pie">Tocá una alerta y el mapa va a la obra · act. ${hhmm(Date.now())}</div>`;
    pintarCapa(C, L0);
    if (st.ficha) pintarFicha(st.ficha);
  }
  const nivel = (a) => (a >= 100 ? "p4" : a >= 60 ? "p3" : a >= 30 ? "p2" : a > 0 ? "p1" : "p0");
  function alertaHtml(a, i) {
    const o = obraDe(a.obraId);
    return `<div class="mg-al p${a.p}" data-mg="al:${i}" role="button" tabindex="0"><span class="mg-ali">${IC[a.tipo] || ""}</span><span class="mg-tx"><b>${esc(a.t)}</b>${o ? `<span class="mg-ob">${esc(nomObra(o))}${o.obraId ? " · ID " + esc(o.obraId) : ""}</span>` : ""}<small>${esc(a.s)}</small>${a.acc.length ? `<span class="mg-acc">${a.acc.map(([k, t], j) => `<button type="button" class="${j ? "btn-ghost" : "btn-primary"}" data-mg="acc:${i}:${esc(k)}">${esc(t)}</button>`).join("")}</span>` : ""}</span></div>`;
  }

  // ------------------------------------------------------------------------------------------- capa del mapa
  function mapa() { return intentar(() => (typeof mapaLeaflet !== "undefined" ? mapaLeaflet : null), null); }
  function quitarCapa() { const m = mapa(); if (st.capa && m) intentar(() => m.removeLayer(st.capa), null); st.capa = null; }
  function pintarCapa(C, L0) {
    const m = mapa(); if (!m || typeof L == "undefined" || !L.layerGroup) return;
    if (!st.capa) { st.capa = L.layerGroup(); st.capa.addTo(m); }
    st.capa.clearLayers();
    C.forEach((c) => {
      const dest = ll(c.ob), pos = c.pos ? [c.pos.lat, c.pos.lng] : dest ? [dest[0] + 0.0012, dest[1] - 0.0012] : null;
      if (!pos) return;
      const t = c.veh.length ? tipoVeh(c.veh[0]) : "";
      const ic = L.divIcon({ className: "", html: `<div class="mg-cq${c.pos && c.pos.fresco ? " vivo" : ""}" data-mgcq="${esc(c.o.id)}"><b>${esc(c.ini)}</b>${t ? `<span class="mg-v">${ICV[t]}</span>` : ""}<span class="mg-nom">${esc(c.gente.slice(0, 2).map(corto).join(" · "))}</span></div>`, iconSize: [0, 0], iconAnchor: [22, 22] });
      const mk = L.marker(pos, { icon: ic, keyboard: false, zIndexOffset: 800 }); mk.on("click", () => abrirFicha(c.o.plazaId, true)); st.capa.addLayer(mk);
      if (c.pos && dest) st.capa.addLayer(L.polyline([pos, dest], { color: "#28285E", weight: 2.5, dashArray: "6 7", opacity: 0.85, interactive: false }));
    });
    const ya = {};
    L0.forEach((a, i) => {
      const o = obraDe(a.obraId), p = ll(o); if (!p || ya[a.obraId]) return; ya[a.obraId] = 1;
      const ic = L.divIcon({ className: "", html: `<div class="mg-alpin p${a.p}" title="${esc(a.t)}">${IC[a.tipo] || "!"}</div>`, iconSize: [0, 0], iconAnchor: [-6, 40] });
      const mk = L.marker(p, { icon: ic, keyboard: false, zIndexOffset: 900 }); mk.on("click", () => elegirAlerta(i)); st.capa.addLayer(mk);
    });
  }

  // ------------------------------------------------------------------------------------------- ficha rápida
  function centrar(id) { const o = obraDe(id), p = ll(o), m = mapa(); if (p && m) intentar(() => m.setView(p, Math.max(m.getZoom(), 16), { animate: false }), null); }
  function abrirFicha(id, sinCentrar) { st.ficha = String(id); if (!sinCentrar) centrar(id); pintarFicha(st.ficha); const f = $("mgFicha"); if (f && window.innerWidth <= 900) intentar(() => f.scrollIntoView({ block: "start" }), null); }
  function elegirAlerta(i) { const a = st.lista[i]; if (!a) return; if (a.obraId) abrirFicha(a.obraId); }
  function pintarFicha(id) {
    const f = $("mgFicha"), o = obraDe(id); if (!f) return;
    if (!o) { f.innerHTML = ""; f.classList.remove("on"); return; }
    const a = pct(o), z = intentar(() => window.__zonaContrato.zonaDeObra(o), null), zr = intentar(() => window.__zonaContrato.resumen(), {}) || {};
    const ot = otsDe(hoyISO()).find((x) => String(x.plazaId) === String(id));
    const c = ot ? cuadrillas().find((x) => x.o.id === ot.id) : null;
    const sd = intentar(() => window.saldoObra(id), null), falta = sd && sd.tareas ? Object.keys(sd.tareas).map((k) => [k, sd.tareas[k]]).filter(([, t]) => num(t.queda) > 0).sort((x, y) => num(y[1].queda) - num(x[1].queda)).slice(0, 4).map(([, t]) => `${fN(t.queda)} ${t.un || ""}`.trim()) : [];
    const sup = intentar(() => window.__supervisor.hallazgos({ obraId: id }), []);
    const atr = sup.find((h) => h.cat === "Al día"), gantt = atr ? { t: atr.g === "rojo" ? "Atrasada" : "Viene atrasada", c: "mal" } : (o.planGantt || o.fechaEstimada) ? { t: "Gantt al día", c: "ok" } : { t: "Sin Gantt", c: "" };
    const mat = st.lista.filter((x) => x.tipo === "material" && String(x.obraId) === String(id))[0];
    const tareas = ot ? num(intentar(() => V().tareasDe(ot), 0)) : 0, hechas = ot ? intentar(() => V().hechasDe(ot), null) : null;
    f.innerHTML = `<div class="mg-fc"><button type="button" class="mg-x" data-mg="fcerrar" aria-label="Cerrar">✕</button>
<div class="mg-feti">${esc(o.tipo === "barrio" ? "Barrio" : o.tipo === "otra" ? "Obra" : "Plaza")}${z ? " · Zona " + esc(z) + (z === zr.zona && zr.corto ? " (" + esc(zr.corto) + ")" : "") : ""}</div>
<div class="mg-fnom"><b>${esc(nomObra(o))}</b>${o.obraId ? `<span>ID ${esc(o.obraId)}</span>` : ""}<em class="mg-gantt ${gantt.c}">${esc(gantt.t)}</em></div>
<div class="mg-fpct"><b class="${nivel(a)}">${a} %</b><span>de avance del itemizado</span></div><div class="mg-barra"><i class="${nivel(a)}" style="width:${Math.max(2, a)}%"></i></div>
<div class="mg-fsec">Quién está</div>${ot ? `<div class="mg-fl">${IC.gente}<span><b>${esc(personasOt(ot).join(" y "))}</b>${c && c.lleg ? " · llegaron " + hhmm(c.lleg.ts) : ""}</span></div><div class="mg-fl">${IC.doc}<span>${esc(ot.numero || "")}${c && c.veh.length ? " · " + esc(c.veh.map((v) => v.nombre || "").join(", ")) : ""}${tareas ? ` · <b>${hechas == null ? "—" : hechas} de ${tareas}</b> hechas` : ""}</span></div>` : '<div class="mg-fl mg-gris">Hoy no hay orden en esta obra.</div>'}
<div class="mg-fsec">Qué falta</div><div class="mg-fl">${IC.falta}<span>${falta.length ? esc(falta.join(" · ")) : sd && sd.sinCalculo ? "Sin cálculo cargado" : "Nada pendiente en el itemizado"}</span></div>
${mat ? `<div class="mg-fmat">${IC.material}<span><b>${esc(mat.t)}:</b> ${esc(mat.s)}</span></div>` : ""}
<div class="mg-fbt"><button type="button" class="btn-ghost" data-mg="legajo:${esc(id)}">${IC.carpeta} Legajo</button><button type="button" class="btn-ghost" data-mg="${ot ? "orden:" + esc(ot.id) : "sugerida"}">${IC.doc} ${ot ? "Orden" : "Armar orden"}</button><button type="button" class="btn-primary" data-mg="llamar:${esc(id)}">${IC.tel} Llamar</button></div></div>`;
    f.classList.add("on");
  }
  // «Llamar»: los de la orden de hoy en esa obra + su supervisor; el teléfono sale de personal.contactos o de la nómina
  function telDe(nombre) {
    const P = window.__personalNube || {}, k = nk(nombre);
    const c = arr(P.contactos).find((x) => x && nk(x.nombre) === k);
    if (c && c.tel) return c.tel;
    const n = arr(P.nomina).concat(arr(P.lista)).find((x) => x && nk(x.nombre) === k);
    return (n && (n.tel || n.telefono)) || "";
  }
  function llamar(id) {
    const ot = otsDe(hoyISO()).find((x) => String(x.plazaId) === String(id));
    const l = (ot ? personasOt(ot) : []).map((n) => ({ n, tel: telDe(n), rol: "cuadrilla" }));
    if (ot && ot.supervisor && ot.supervisor.nombre) l.push({ n: ot.supervisor.nombre, tel: telDe(ot.supervisor.nombre), rol: "sigue la orden" });
    let h = $("mgLlamar"); if (!h) { h = document.createElement("div"); h.id = "mgLlamar"; h.className = "v7-ov no-print"; h.setAttribute("role", "dialog"); h.setAttribute("aria-modal", "true"); h.setAttribute("aria-label", "Llamar"); document.body.appendChild(h); }
    const o = obraDe(id);
    h.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><h3>📞 Llamar · ${esc(nomObra(o || {}))}</h3><button type="button" class="v7-x" data-mgl="x" aria-label="Cerrar">✕</button></div>${l.length ? l.map((x) => `<div class="mg-tel"><span><b>${esc(x.n)}</b><small>${esc(x.rol)}</small></span>${x.tel ? `<a class="btn-primary" href="tel:${esc(String(x.tel).replace(/[^\d+]/g, ""))}">${IC.tel} ${esc(x.tel)}</a>` : '<em class="mg-sintel">sin teléfono cargado</em>'}</div>`).join("") : '<p class="v7-txt">Hoy no hay una orden en esta obra: no hay a quién llamar desde acá.</p>'}<p class="v7-txt mg-gris">Los teléfonos se cargan en Producción › Personal del equipo › «La cuadrilla en obra».</p></div>`;
    h.onclick = (e) => { if (e.target === h || (e.target.closest && e.target.closest('[data-mgl="x"]'))) h.remove(); };
  }

  // ------------------------------------------------------------------------------------------- acciones
  function accion(a, k) {
    const id = a && a.obraId;
    if (k === "legajo") return irLegajo(id);
    if (k === "sugerida") return intentar(() => window.__sugerida.abrir(), null);
    if (k === "compras") return intentar(() => window.__pedidoCompras.abrir(), null);
    if (k === "reservas") return intentar(() => V().irStock("reservas"), null);
    if (k === "fotosSup") return intentar(() => window.__obraGps.hojaSup({ tipo: "obragps" }), null);
    if (k === "ubicar") return intentar(() => window.moverPinMapa(id), null);
    if (/^cerrar:/.test(k)) return intentar(() => window.abrirCierreOt(k.slice(7)), null);
  }
  function irLegajo(id) { intentar(() => { window.mostrarVista("obras"); setTimeout(() => window.abrirLegajo && window.abrirLegajo(id), 60); }, null); }
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-mg]"); if (!b || !b.closest("#viewMapa")) return;
    const v = b.getAttribute("data-mg");
    if (v === "toggle") { prender(!st.on); return; }
    if (/^tab:/.test(v)) { st.tab = v.slice(4); LS.set("ema.mapa.tab", st.tab); pintar(); return; }
    if (v === "fcerrar") { st.ficha = null; pintarFicha(""); return; }
    if (/^ficha:/.test(v)) { abrirFicha(v.slice(6)); return; }
    if (/^acc:/.test(v)) { e.stopPropagation(); const p = v.split(":"), a = st.lista[+p[1]]; accion(a, p.slice(2).join(":")); return; }
    if (/^al:/.test(v)) { elegirAlerta(+v.slice(3)); return; }
    if (/^legajo:/.test(v)) return irLegajo(v.slice(7));
    if (/^orden:/.test(v)) return intentar(() => window.verOrdenTrabajo(v.slice(6)), null);
    if (v === "sugerida") return intentar(() => window.__sugerida.abrir(), null);
    if (/^llamar:/.test(v)) return llamar(v.slice(7));
  });
  function prender(on) {
    st.on = !!on && puede(); LS.set("ema.mapa.control", st.on ? "1" : "0");
    if (!st.on) st.ficha = null;
    if (st.on) intentar(() => window.__obraGps && window.__obraGps.cargarFotos(false), null);
    pintar();
    const m = mapa(); if (m) setTimeout(() => intentar(() => m.invalidateSize(), null), 80);
    reloj();
  }
  function visible() { const v = $("viewMapa"); return !!v && v.style.display !== "none"; }
  function reloj() {   // cada minuto mientras se ve (no lee nada nuevo: vuelve a contar de memoria)
    clearInterval(st.timer); st.timer = 0;
    if (st.on && visible()) st.timer = setInterval(() => { if (!visible() || !st.on) return reloj(); pintar(); }, 60000);
  }
  function abrir(conControl) {
    intentar(() => window.mostrarVista("mapa"), null);
    if (conControl !== false) setTimeout(() => prender(true), 50);
  }
  function tdHtml() { return puede() ? '<div class="td-cd" data-mgabrir="1" role="button" tabindex="0"><div class="td-eti">🗺 Mapa de guerra <span>obras, cuadrillas y alertas de hoy</span></div><div class="td-sub">Abrir el Mapa en modo Control ›</div></div>' : ""; }
  function accesoHtml() { return puede() ? '<button type="button" class="ie-acc" data-mgabrir="1"><span class="ie-ic" style="display:flex;align-items:center;justify-content:center;font-size:22px">🗺</span>Mapa de guerra</button>' : ""; }
  document.addEventListener("click", (e) => { const b = e.target && e.target.closest && e.target.closest("[data-mgabrir]"); if (!b) return; e.preventDefault(); intentar(() => window.__tableroDueno && window.__tableroDueno.cerrar(), null); abrir(true); });
  // al entrar al Mapa: el modo que quedó guardado
  const mv = window.mostrarVista;
  if (typeof mv == "function") {
    const n = function (v) { const r = mv.apply(this, arguments); if (v === "mapa") setTimeout(() => { st.on = puede() && LS.get("ema.mapa.control") === "1"; pintar(); reloj(); }, 0); else reloj(); return r; };
    window.__heredar && window.__heredar(n, mv); window.mostrarVista = n;
  }
  document.addEventListener("permisos-listos", () => { if (visible()) pintar(); });
  window.__mapaControl = { puede, alertas, cuadrillas, prender, pintar, abrir, abrirFicha, elegirAlerta, llamar, telDe, faltaMaterial, accesoHtml, tdHtml, estado: () => ({ on: st.on, tab: st.tab, ficha: st.ficha, n: st.lista.length }) };
})();
