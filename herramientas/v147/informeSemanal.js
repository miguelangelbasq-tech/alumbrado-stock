(function () {
  "use strict";
  // v147 · «📰 Informe de la semana» automático (maqueta maq_semana/informe; pedido de Ángel, 11/11/2026).
  //  · Semana = lunes a sábado (hora de Argentina), clave AAAA-Www (semana ISO del lunes). Lo arma la APP sin IA con lo que ya
  //    tiene en memoria: módulos de la semana contra la anterior (por la fecha de la orden cerrada, como la certificación; solo
  //    nuestra zona), avance de la Zona A y terminadas, órdenes (emitidas, cerradas, «no se hizo», pasadas al día siguiente), por
  //    obra (lo hecho, módulos, avance antes → después, lo que falta, Gantt), gente (horas, puntos de la quincena, días sin tarea,
  //    ausencias), pañol (salido, material contra avance, compras sugeridas SIN precios), fotos, gasto de la IA (el del MES por
  //    /uso: el Worker no da la semana) y «Lo que viene» (orden sugerida de la semana siguiente). Lo cargado a mano sin fecha no
  //    entra (aviso, como la certificación).
  //  · «Resumen del asistente»: UN pedido corto (tipo pregunta) al Worker ema-ia; interruptor en ⚙ (solo admin, de entrada
  //    prendido: configEquipo/personal.asistente.informeIa). Si falla o está apagado, el informe sale igual sin ese párrafo.
  //  · Quién lo arma: el primer aparato de admin/oficina que abra la app desde el sábado 14:00 toma el turno con una transacción
  //    en configEquipo/salud.informeSemanal.<semana> (como el supervisor y el pase a mañana), guarda el resumen (sin imágenes) en
  //    adjuntos/inf-<semana> (tipo:"informeSemanal") y deja el aviso a Administración con enviarDesde = lunes 07:30 (Worker de
  //    avisos v143; con el viejo sale al armarlo). Si el lunes nadie lo armó, lo arma el primero que abra. Sin reglas nuevas.
  //  · Pantalla «📰 Informe de la semana» (#isOv): menú (admin y quien edita Informes), Inicio Ejecutivo y Tablero del dueño;
  //    semanas guardadas; Compartir / Bajar PDF (hoja A4 de 2 páginas por hojaPdf, QR ?informe=AAAA-Www).
  //  · Pruebas: window.__v147No (salvo v147:true), __isAhora (hora simulada), __isEspera (espera del turno).
  if (window.__informeSemanal) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const intentar = (f, d) => { try { const r = f(); return r === undefined ? d : r; } catch (e) { return d; } };
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const num = (x) => { const n = Number(String(x == null ? "" : x).replace(",", ".")); return isFinite(n) ? n : 0; };
  const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;
  const fN = (n, d) => intentar(() => window.fmt(n, d == null ? (Number.isInteger(r2(n)) ? 0 : 1) : d), String(n));
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const pad = (n) => String(n).padStart(2, "0");
  const LS = { get: (k) => intentar(() => localStorage.getItem(k), null), set: (k, v) => intentar(() => localStorage.setItem(k, v), null) };
  const ahora = () => (window.__isAhora ? +window.__isAhora : Date.now());
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const deIso = (f) => new Date(f + "T12:00:00");
  const masD = (f, n) => { const d = deIso(f); d.setDate(d.getDate() + n); return iso(d); };
  const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const fC = (f) => String(f).slice(8, 10) + "/" + String(f).slice(5, 7);
  const no = () => !!window.__v147No;

  // ------------------------------------------------------------------------------------------- semanas
  function lunesDe(f) { const d = deIso(f), w = (d.getDay() + 6) % 7; d.setDate(d.getDate() - w); return iso(d); }
  function claveDe(lunes) {   // semana ISO del lunes: AAAA-Www
    const d = new Date(Date.UTC(+lunes.slice(0, 4), +lunes.slice(5, 7) - 1, +lunes.slice(8, 10)));
    d.setUTCDate(d.getUTCDate() + 3); const a = d.getUTCFullYear(), p = new Date(Date.UTC(a, 0, 4));
    return a + "-W" + pad(1 + Math.round(((d - p) / 864e5 - 3 + ((p.getUTCDay() + 6) % 7)) / 7));
  }
  function lunesDeClave(k) {
    const m = String(k).match(/^(\d{4})-W(\d\d)$/); if (!m) return "";
    const p = new Date(Date.UTC(+m[1], 0, 4)), l = new Date(p); l.setUTCDate(p.getUTCDate() - ((p.getUTCDay() + 6) % 7) + (+m[2] - 1) * 7);
    return l.getUTCFullYear() + "-" + pad(l.getUTCMonth() + 1) + "-" + pad(l.getUTCDate());
  }
  const sem = (lunes) => ({ k: claveDe(lunes), desde: lunes, hasta: masD(lunes, 5) });
  const tsAR = (f, h, m) => Date.UTC(+f.slice(0, 4), +f.slice(5, 7) - 1, +f.slice(8, 10), h + 3, m || 0);   // hora de Argentina (UTC−3)
  function pendiente() {   // la semana que toca armar ahora (o null)
    const t = ahora(), hoy = iso(new Date(t)), L = lunesDe(hoy), S = sem(L);
    if (t >= tsAR(S.hasta, 14, 0)) return S;   // desde el sábado 14:00: la semana que termina
    return sem(masD(L, -7));                  // antes: la anterior (si nadie la armó, se arma en el momento)
  }

  // ------------------------------------------------------------------------------------------- datos (todo de memoria)
  const obras = () => arr(intentar(() => (typeof avanceObras !== "undefined" ? avanceObras : window.avanceObras), []));
  const ots = () => arr(intentar(() => (typeof ordenesTrabajo !== "undefined" ? ordenesTrabajo : window.ordenesTrabajo), []));
  const K = (id) => intentar(() => num(window.epecItemK(id)), 0);
  const esProv = (id) => intentar(() => !!window.epecEsEventualidad(id), false) || /^8[3-9](\.|$)/.test(String(id));
  const enZona = (o) => intentar(() => (window.__certMensual ? window.__certMensual.enZona(o) : o.tipo !== "barrio"), false);
  const nombre = (o) => String((o && (o.nombre || o.plazaNombre)) || "").toUpperCase();
  const dejoAvance = (o) => !!o && Array.isArray(o.cierre && o.cierre.avanceItems) && o.cierre.avanceItems.length > 0 && !o.cierre.avanceRevertido;
  const anulada = (o) => /anulada/i.test(String(o.estado || "")) || !!o.unidaEn;
  const enRango = (f, S) => f >= S.desde && f <= S.hasta;
  function modsOt(o) { let m = 0; arr(o.cierre && o.cierre.avanceItems).forEach((a) => { if (a && num(a.delta) > 0 && !esProv(a.id)) m += num(a.delta) * K(a.id); }); return m; }
  function totalK(o) {   // contratado y hecho en módulos (sin provisiones)
    let c = 0, h = 0;
    arr(o.valorItems).forEach((r) => { if (r && r.itemPliego && !esProv(r.itemPliego)) { c += num(r.cantidad) * K(r.itemPliego); h += num(r.cantidadAvanzada) * K(r.itemPliego); } });
    return { c, h };
  }
  function armar(S) {
    const Sa = sem(masD(S.desde, -7)), O = obras(), T = ots();
    const R = { v: 1, k: S.k, desde: S.desde, hasta: S.hasta, armado: ahora(), por: String((window.__fbUser && window.__fbUser.email) || ""), avisos: [] };
    // módulos de la semana y de la anterior, por obra (solo nuestra zona)
    const porObra = {}; let mods = 0, modsAnt = 0;
    const dias = {}; for (let i = 0; i < 6; i++) dias[masD(S.desde, i)] = 0;
    T.forEach((t) => {
      if (!dejoAvance(t)) return; const o = O.find((x) => String(x.id) === String(t.plazaId)); if (!o || !enZona(o)) return;
      const f = String(t.fecha || "").slice(0, 10), m = modsOt(t);
      if (enRango(f, S)) { mods += m; if (dias[f] != null) dias[f] += m; const x = porObra[o.id] = porObra[o.id] || { m: 0, tareas: {} }; x.m += m; Object.keys(obj(t.cierre.cantidades || t.cierre.hecho)).forEach((k) => { const c = num(obj(t.cierre.cantidades || t.cierre.hecho)[k]); if (c > 0) x.tareas[k] = (x.tareas[k] || 0) + c; }); }
      else if (enRango(f, Sa)) modsAnt += m;
    });
    R.mods = r1(mods); R.modsAnt = r1(modsAnt); R.dias = Object.keys(dias).map((f) => ({ f, d: DIAS[deIso(f).getDay()], m: r1(dias[f]) }));
    // avance de la zona y terminadas
    const z = intentar(() => window.__zonaContrato.resumen(), {}) || {};
    R.zona = { label: z.label || "", corto: z.corto || "", plazas: z.plazas || 0, modulos: z.modulos || 0, pct: r1(num(z.pct)), antes: z.modulos ? r1(num(z.pct) - (mods / z.modulos) * 100) : null, terminadas: z.terminadas || 0 };
    // por obra
    const lab = (k) => intentar(() => window.__sugerida.labelDe(k), "") || intentar(() => (ACTIVIDADES_CATALOGO.find((a) => a.id === k) || {}).label, "") || k;
    const sup = intentar(() => window.__supervisor.hallazgos(), []);
    let sinFecha = 0;
    R.obras = O.filter((o) => enZona(o) && !intentar(() => window.__obraFin(o), false) || porObra[o.id]).map((o) => {
      const tk = totalK(o), x = porObra[o.id] || { m: 0, tareas: {} };
      let despues = 0; T.forEach((t) => { if (String(t.plazaId) === String(o.id) && dejoAvance(t) && String(t.fecha || "") > S.hasta) despues += modsOt(t); });
      let fechado = 0; T.forEach((t) => { if (String(t.plazaId) === String(o.id) && dejoAvance(t)) fechado += modsOt(t); });
      if (tk.h - fechado > 0.05) sinFecha++;
      const fin = tk.c ? Math.max(0, tk.h - despues) : 0, ini = Math.max(0, fin - x.m);
      const sd = intentar(() => window.saldoObra(o.id), null);
      const falta = sd && sd.tareas ? Object.keys(sd.tareas).map((k) => [k, sd.tareas[k]]).filter(([, t]) => num(t.queda) > 0).sort((a, b) => num(b[1].queda) - num(a[1].queda)).slice(0, 3).map(([k, t]) => fN(num(t.queda)) + " " + (t.un || "") + " (" + lab(k).split(" ").slice(0, 3).join(" ") + ")") : [];
      const h = sup.find((y) => String(y.obraId) === String(o.id) && (y.cat === "Al día" || y.cat === "Obras trabadas"));
      return { id: o.id, n: nombre(o), ID: o.obraId || "", m: r1(x.m), hecho: Object.keys(x.tareas).map((k) => fN(x.tareas[k]) + " " + lab(k).split(" ").slice(0, 3).join(" ")).join(" · "), antes: tk.c ? Math.round((ini / tk.c) * 100) : null, despues: tk.c ? Math.round((fin / tk.c) * 100) : null, falta: falta.join(" · "), gantt: h ? h.t.replace(/^.*?:\s*/, "") : (o.planGantt || o.fechaEstimada) ? "Al día" : "Sin Gantt" };
    }).filter((x) => x.m > 0 || x.despues != null).sort((a, b) => b.m - a.m).slice(0, 30);
    if (sinFecha) R.avisos.push(`${sinFecha} ${sinFecha === 1 ? "obra tiene" : "obras tienen"} avance cargado a mano sin fecha: no entra en la semana (como en la certificación).`);
    // órdenes
    const semOts = T.filter((t) => enRango(String(t.fecha || ""), S) && !anulada(t));
    let noHizo = 0, pasadas = 0; semOts.forEach((t) => { Object.keys(obj(t.campo && t.campo.tareaEnv)).forEach((k) => Object.keys(obj(t.campo.tareaEnv[k])).forEach((p) => { if (obj(t.campo.tareaEnv[k][p]).estado === "no") noHizo++; })); pasadas += Object.keys(obj(t.pasadoA)).length; });
    const sinC = semOts.filter((t) => !/terminada/i.test(String(t.estado || "")));
    R.ordenes = { emitidas: semOts.length, cerradas: semOts.length - sinC.length, sinCerrar: sinC.map((t) => t.numero || "").filter(Boolean).slice(0, 8), noHizo, pasadas };
    // gente: horas y puntos de las órdenes de la semana, puntos de la quincena, días sin tarea, ausencias
    const G = {}, gi = (n) => G[nk(n)] = G[nk(n)] || { n, horas: 0, pts: 0, q: 0, sinT: 0, aus: [] };
    semOts.forEach((t) => { const p = intentar(() => window.puntosDeOrden(t), null); arr(p && p.porPersona).forEach((x) => { const g = gi(x.nombre); g.horas += num(x.horas); g.pts += num(x.pts); }); });
    const q0 = num(S.hasta.slice(8, 10)) <= 15 ? S.hasta.slice(0, 8) + "01" : S.hasta.slice(0, 8) + "16";
    T.forEach((t) => { const f = String(t.fecha || ""); if (f >= q0 && f <= S.hasta && /terminada/i.test(String(t.estado || ""))) { const p = intentar(() => window.puntosDeOrden(t), null); arr(p && p.porPersona).forEach((x) => { gi(x.nombre).q += num(x.pts); }); } });
    if (window.__sinTarea && !window.__v145No) for (let i = 0; i < 6; i++) { const f = masD(S.desde, i); if (f > iso(new Date(ahora()))) break; intentar(() => window.__sinTarea.sinTarea(f), []).forEach((x) => { gi(x.nombre).sinT++; }); }
    arr(obj(window.__personalNube).ausencias).forEach((a) => { if (a && a.persona && !(a.hasta < S.desde || a.desde > S.hasta)) gi(a.persona).aus.push((a.motivo || "ausente") + " " + fC(a.desde) + (a.hasta && a.hasta !== a.desde ? "–" + fC(a.hasta) : "")); });
    R.gente = Object.keys(G).map((k) => G[k]).map((g) => ({ n: g.n, horas: r1(g.horas), pts: r1(g.pts), q: r1(g.q), sinT: g.sinT, aus: g.aus.join(", ") })).sort((a, b) => b.q - a.q || b.horas - a.horas);
    R.quincena = q0;
    // pañol: lo que salió en la semana (vales netos), material contra avance, compras sugeridas (sin precios)
    const sal = {};
    arr(window.stockMovimientos).forEach((m) => {
      if (!m || m.anulado || m.correccion || m.ajuste || !enRango(String(m.fecha || "").slice(0, 10), S)) return;
      const c = String(m.codigo || ""); if (!c) return; const x = sal[c] = sal[c] || { c, d: m.desc || c, un: m.un || "", q: 0 };
      if (m.tipo === "salida") x.q += num(m.cantidad); else if (m.tipo === "entrada" && m.devolucion) x.q -= num(m.cantidad);
    });
    R.panol = { salido: Object.keys(sal).map((k) => sal[k]).filter((x) => x.q > 0).sort((a, b) => b.q - a.q).slice(0, 12).map((x) => ({ c: x.c, d: x.d, un: x.un, q: r2(x.q) })) };
    R.panol.mat = sup.filter((h) => h.cat === "Material").slice(0, 5).map((h) => h.t);
    const pc = intentar(() => window.__pedidoCompras && !window.__v146No ? window.__pedidoCompras.armar(7) : null, null);
    R.panol.compras = pc && pc.items ? pc.items.slice(0, 12).map((x) => ({ prov: x.proveedor || "(sin entrada)", d: x.desc, c: x.codigo, q: x.cant, un: x.un, para: x.porque ? String(x.porque).split(";")[0] : "" })) : [];
    // fotos
    let fotos = 0; semOts.forEach((t) => { Object.keys(obj(t.campo && t.campo.fotos)).forEach((id) => { if (!obj(t.campo.fotos[id]).borrada) fotos++; }); });
    const sinSubir = sup.find((h) => /no terminaron de subir/.test(h.t));
    R.fotos = { orden: fotos, dudosas: intentar(() => window.__obraGps.grupos().reduce((a, g) => a + g.fotos.length, 0), 0), sinSubir: sinSubir ? num(sinSubir.t) : 0, sinUbic: intentar(() => window.__obraGps.sinUbic().length, 0) };
    // asistente: gasto del mes (el Worker no da la semana)
    const u = intentar(() => window.__iaUso.estado(), null), mes = u && u.mes;
    R.ia = { mes: mes && mes.gastoMes != null ? r2(num(mes.gastoMes)) : null, tope: mes && mes.tope != null ? num(mes.tope) : null, nota: "El gasto por semana necesita un Worker nuevo (hoy da el del mes)." };
    // lo que viene: la orden sugerida de la semana siguiente
    const sig = masD(S.desde, 7);
    R.viene = arr(intentar(() => window.__sugerida && !window.__sugNo ? window.__sugerida.semana(sig) : [], [])).slice(0, 6).map((d) => ({ f: d.fecha, d: DIAS[deIso(d.fecha).getDay()], t: arr(d.ordenes).filter((x) => x.incluir !== false).slice(0, 3).map((x) => x.obra + (arr(x.tareas).length ? ": " + arr(x.tareas).slice(0, 2).map((y) => String(y.label || "").split(" ").slice(0, 2).join(" ") + (y.cant ? " ×" + fN(y.cant) : "")).join(", ") : "")).join(" · ") })).filter((x) => x.t);
    // para mirar (lo más importante primero)
    R.mirar = sup.filter((h) => h.g === "rojo" || (h.g === "ambar" && (h.cat === "Obras trabadas" || h.cat === "Al día"))).slice(0, 4).map((h) => h.t);
    return R;
  }

  // ------------------------------------------------------------------------------------------- resumen del asistente (opcional, un solo pedido)
  const iaOn = () => intentar(() => obj(obj(window.__personalNube).asistente).informeIa !== false, true);
  function datosTexto(R) {
    return [`Semana ${fC(R.desde)} al ${fC(R.hasta)}. Módulos ${fN(R.mods)} (anterior ${fN(R.modsAnt)}). ${R.zona.label}: ${fN(R.zona.pct)} %, ${R.zona.terminadas} plazas terminadas de ${R.zona.plazas}.`,
      `Órdenes: ${R.ordenes.emitidas} emitidas, ${R.ordenes.cerradas} cerradas, ${R.ordenes.noHizo} tareas «no se hizo», ${R.ordenes.pasadas} pasadas al día siguiente${R.ordenes.sinCerrar.length ? "; sin cerrar " + R.ordenes.sinCerrar.join(", ") : ""}.`,
      "Por obra: " + R.obras.slice(0, 8).map((o) => `${o.n} ${fN(o.m)} mód (${o.antes == null ? "?" : o.antes}→${o.despues == null ? "?" : o.despues} %), ${o.gantt}${o.falta ? ", falta " + o.falta : ""}`).join("; ") + ".",
      R.mirar.length ? "Para mirar: " + R.mirar.join("; ") + "." : "",
      R.panol.compras.length ? "Compras sugeridas: " + R.panol.compras.slice(0, 5).map((c) => c.d + " " + fN(c.q) + " " + c.un).join("; ") + "." : ""].filter(Boolean).join("\n");
  }
  async function resumenIa(R) {
    if (window.__isIaNo || !iaOn()) return "";
    const u = window.firebase && firebase.auth && firebase.auth().currentUser; if (!u) return "";
    const tok = await u.getIdToken();
    const model = intentar(() => window.__iaModelos.chat(), "claude-sonnet-5-5");
    const cuerpo = { model, max_tokens: 700, system: "Sos el asistente de EMA Servicios (alumbrado público, Córdoba). Escribís en español rioplatense, simple y directo. No inventes nada: usá solo los datos que te pasan, ya calculados por la app.", messages: [{ role: "user", content: "Hacé el RESUMEN DE LA SEMANA para Ángel en 4 a 6 renglones, sin tablas ni títulos: cómo fue la semana, qué obra preocupa y por qué, y qué hay que hacer esta semana.\n\n" + datosTexto(R) }], output_config: { effort: "low" }, ema: { tipo: "pregunta" } };
    const r = await fetch(window.__iaUrl || "https://ema-ia.mdiaz-60f.workers.dev/ia", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok }, body: JSON.stringify(cuerpo) });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j || j.error) return "";
    intentar(() => window.__iaUso.poner(j.ema), null);
    return arr(j.content).filter((b) => b && b.type === "text").map((b) => b.text).join("\n").trim().slice(0, 1500);
  }

  // ------------------------------------------------------------------------------------------- el turno y el guardado
  const puede = () => !no() && !!window.__fbUser && intentar(() => !(window.__v135 && window.__v135.esCrew()) && (PERMISOS.permiso("informe") === "editar" || (PERMISOS.esAdmin && PERMISOS.esAdmin())), false);
  const esAdmin = () => intentar(() => !!(PERMISOS.esAdmin && PERMISOS.esAdmin()), false);
  const db = () => firebase.firestore();
  const salud = () => db().collection("configEquipo").doc("salud");
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  async function tomar(S) {
    const tk = Math.random().toString(36).slice(2, 10);
    const ok = await db().runTransaction(async (tx) => {
      const d = await tx.get(salud()), x = obj(obj(obj(((d && d.exists && d.data()) || {}).informeSemanal))[S.k]);
      if (x.ts) return false;
      tx.set(salud(), { informeSemanal: { [S.k]: { ts: Date.now(), por: String((window.__fbUser || {}).email || ""), tk } } }, { merge: true });
      return true;
    });
    if (!ok) return false;
    await espera(window.__isEspera != null ? window.__isEspera : 400);   // dos aparatos a la vez: gana el último que escribió
    const d = await salud().get(), x = obj(obj(obj((d.exists && d.data()) || {}).informeSemanal)[S.k]);
    return !x.tk || x.tk === tk;
  }
  async function guardar(R) {
    await db().collection("adjuntos").doc("inf-" + R.k).set({ tipo: "informeSemanal", semana: R.k, desde: R.desde, hasta: R.hasta, datos: R, ts: Date.now(), por: R.por });
  }
  async function avisar(R) {
    const adm = arr(intentar(() => PERMISOS.lista(), [])).filter((u) => u && u.rol === "admin" && u.activo !== false && u.email).map((u) => u.email);
    if (!adm.length && esAdmin() && window.__fbUser) adm.push(window.__fbUser.email);
    const lunes = masD(R.desde, 7), cuando = tsAR(lunes, 7, 30), nuevo = intentar(() => window.__sugerida.workerNuevo(), false) || window.__avisosWorkerNuevo === true;
    const c = `${fN(R.mods)} módulos (${R.modsAnt ? (R.mods >= R.modsAnt ? "+" : "") + Math.round(((R.mods - R.modsAnt) / R.modsAnt) * 100) + " %" : "semana anterior sin módulos"}) · ${R.ordenes.cerradas}/${R.ordenes.emitidas} órdenes cerradas · ${R.zona.label ? "Zona " + R.zona.corto + " " + fN(R.zona.pct) + " %" : ""}${R.mirar.length ? " · " + R.mirar.length + " cosas para mirar" : ""}`;
    for (const em of adm.filter((x, i, a) => a.indexOf(x) === i)) {
      const a = { email: em, titulo: `📰 Informe de la semana ${fC(R.desde)}–${fC(R.hasta)}`, cuerpo: c, tipo: "informe", tag: "ema-inf-" + R.k, url: "./?informe=" + R.k, ts: Date.now(), enviado: false, por: R.por };
      if (nuevo && cuando > Date.now()) a.enviarDesde = cuando;
      await db().collection("avisosPush").add(a);
    }
    return adm.length;
  }
  const st = { corriendo: false, abierta: false, k: "", R: null, lista: [], msg: "", ultTic: 0 };
  async function tic(forzar) {
    if (!puede() || st.corriendo) return null;
    const S = pendiente(); if (!S) return null;
    if (!forzar && LS.get("ema.inf.hecho." + S.k)) return null;
    if (!forzar && ahora() - st.ultTic < 30 * 6e4) return null;
    st.ultTic = ahora(); st.corriendo = true;
    try {
      if (!(await tomar(S))) { LS.set("ema.inf.hecho." + S.k, "otro"); return null; }
      const R = armar(S);
      try { R.resumen = await resumenIa(R); } catch (e) { R.resumen = ""; }
      await guardar(R); await avisar(R);
      LS.set("ema.inf.hecho." + S.k, "1");
      return R;
    } catch (e) { console.warn("[informe semanal]", e); return null; }
    finally { st.corriendo = false; }
  }

  // ------------------------------------------------------------------------------------------- pantalla
  async function leerLista() {
    try { const q = await db().collection("adjuntos").where("tipo", "==", "informeSemanal").get(); const l = []; q.forEach((d) => l.push(Object.assign({ id: d.id }, d.data()))); st.lista = l.sort((a, b) => (a.semana < b.semana ? 1 : -1)); }
    catch (e) { console.warn("[informe semanal] lista", e); }
    return st.lista;
  }
  async function abrir(k) {
    if (!puede()) return;
    st.abierta = true; st.msg = "";
    let ov = $("isOv"); if (!ov) { ov = document.createElement("div"); ov.id = "isOv"; ov.className = "is-ov no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Informe de la semana"); document.body.appendChild(ov); }
    ov.hidden = false; ov.innerHTML = '<div class="is-in"><div class="is-vacio">Cargando…</div></div>';
    await leerLista();
    const g = k ? st.lista.find((x) => x.semana === k) : st.lista[0];
    if (g) { st.k = g.semana; st.R = Object.assign({}, g.datos || {}); }
    else { const S = k ? sem(lunesDeClave(k)) : pendiente(); st.k = S.k; st.R = armar(S); st.R.borrador = true; }
    pintar();
    setTimeout(() => { try { window.__atras && window.__atras.sync && window.__atras.sync(); } catch (e) { } }, 30);
  }
  function cerrar() { const ov = $("isOv"); if (ov) ov.remove(); st.abierta = false; }
  const kpi = (b, s, x) => `<div class="is-k"><b>${b}</b><span>${s}</span>${x ? `<small>${x}</small>` : ""}</div>`;
  const varTxt = (R) => (R.modsAnt ? (R.mods >= R.modsAnt ? "+" : "") + Math.round(((R.mods - R.modsAnt) / R.modsAnt) * 100) + " % vs. " + fN(R.modsAnt) : "semana anterior: 0");
  function cuerpoHtml(R, pdf) {
    const mx = Math.max.apply(null, [1].concat(R.dias.map((d) => d.m)));
    const tabla = (cab, filas) => `<table class="is-t"><thead><tr>${cab.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${filas.join("") || `<tr><td colspan="${cab.length}" class="is-gris">—</td></tr>`}</tbody></table>`;
    const h1 = `<div class="is-kpis">${kpi(fN(R.mods), "módulos en la semana", varTxt(R))}${kpi(fN(R.zona.pct) + " %", "avance " + esc(R.zona.label ? "Zona " + R.zona.corto : "de la zona"), R.zona.antes != null ? "antes " + fN(R.zona.antes) + " %" : "")}${kpi(R.zona.terminadas, "obras terminadas", R.zona.plazas ? "de " + R.zona.plazas : "")}${kpi(R.ordenes.emitidas + " / " + R.ordenes.cerradas, "órdenes emitidas / cerradas", R.ordenes.sinCerrar.length ? R.ordenes.sinCerrar.length + " sin cerrar" : "todas cerradas")}</div>
${R.resumen ? `<div class="is-res"><div class="is-eti">✨ Resumen del asistente (IA)</div>${esc(R.resumen).replace(/\n/g, "<br>")}</div>` : ""}
${R.avisos.length ? `<div class="is-av">${R.avisos.map(esc).join("<br>")}</div>` : ""}
<div class="is-2"><div><div class="is-eti">Módulos por día</div><div class="is-bar">${R.dias.map((d) => `<div><i style="height:${Math.round((d.m / mx) * 60) + 2}px"></i><span>${d.d}</span><b>${d.m ? fN(d.m) : ""}</b></div>`).join("")}</div></div><div><div class="is-eti">Para mirar</div>${R.mirar.length ? `<ul class="is-ul">${R.mirar.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : '<div class="is-gris">Nada urgente.</div>'}</div></div>
<div class="is-eti">Por obra</div>${tabla(["Obra", "Lo hecho", "Mód.", "Avance", "Lo que falta", "Gantt"], R.obras.map((o) => `<tr><td><b>${esc(o.n)}</b>${o.ID ? `<br><small>ID ${esc(o.ID)}</small>` : ""}</td><td>${esc(o.hecho || "—")}</td><td class="n">${fN(o.m)}</td><td class="n">${o.antes == null ? "—" : o.antes + "→" + o.despues + " %"}</td><td>${esc(o.falta || "—")}</td><td>${esc(o.gantt)}</td></tr>`))}
<div class="is-eti">Órdenes de trabajo</div>${tabla(["Emitidas", "Cerradas", "Sin cerrar", "Tareas «no se hizo»", "Pasaron al día siguiente"], [`<tr><td class="n">${R.ordenes.emitidas}</td><td class="n">${R.ordenes.cerradas}</td><td>${R.ordenes.sinCerrar.length}${R.ordenes.sinCerrar.length ? " (" + esc(R.ordenes.sinCerrar.join(", ")) + ")" : ""}</td><td class="n">${R.ordenes.noHizo}</td><td class="n">${R.ordenes.pasadas}</td></tr>`])}`;
    const h2 = `<div class="is-eti">Gente <span>quincena desde el ${fC(R.quincena)}</span></div>${tabla(["Persona", "Horas", "Puntos semana", "Puntos quincena", "Días sin tarea", "Ausencias"], R.gente.map((g) => `<tr><td>${esc(g.n)}</td><td class="n">${fN(g.horas)}</td><td class="n">${fN(g.pts)}</td><td class="n">${fN(g.q)}</td><td class="n">${g.sinT}</td><td>${esc(g.aus || "—")}</td></tr>`))}
<div class="is-eti">Pañol · salió en la semana <span>vales netos</span></div>${tabla(["Cód.", "Material", "Cant."], R.panol.salido.map((x) => `<tr><td>${esc(x.c)}</td><td>${esc(x.d)}</td><td class="n">${fN(x.q)} ${esc(x.un)}</td></tr>`))}
${R.panol.mat.length ? `<div class="is-eti">Material contra avance</div><ul class="is-ul">${R.panol.mat.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
<div class="is-eti">Compras sugeridas <span>sin precios</span></div>${tabla(["Proveedor (última entrada)", "Material", "Cant.", "Para"], R.panol.compras.map((x) => `<tr><td>${esc(x.prov)}</td><td>${esc(x.d)}</td><td class="n">${fN(x.q)} ${esc(x.un)}</td><td>${esc(x.para)}</td></tr>`))}
<div class="is-2"><div><div class="is-eti">Fotos</div>${tabla(["", ""], [`<tr><td>Fotos de las órdenes</td><td class="n">${R.fotos.orden}</td></tr>`, `<tr><td>Dudosas por el GPS (pendientes)</td><td class="n">${R.fotos.dudosas}</td></tr>`, `<tr><td>Sin subir en algún celu</td><td class="n">${R.fotos.sinSubir}</td></tr>`, `<tr><td>Obras sin ubicación</td><td class="n">${R.fotos.sinUbic}</td></tr>`])}</div>
<div><div class="is-eti">Asistente (IA)</div>${tabla(["", ""], [`<tr><td>Gastado este mes</td><td class="n">${R.ia.mes == null ? "—" : "US$ " + fN(R.ia.mes, 2)}${R.ia.tope ? " de " + fN(R.ia.tope) : ""}</td></tr>`, `<tr><td colspan="2" class="is-gris">${esc(R.ia.nota)}</td></tr>`])}</div></div>
<div class="is-eti">Lo que viene <span>de la orden sugerida</span></div>${R.viene.length ? `<ul class="is-ul is-viene">${R.viene.map((v) => `<li><b>${esc(v.d)} ${fC(v.f)}</b> ${esc(v.t)}</li>`).join("")}</ul>` : '<div class="is-gris">La orden sugerida no tiene nada para la semana que viene.</div>'}`;
    if (!pdf) return h1 + h2;
    const cab = (n) => `<div class="is-pcab"><img class="logo-impreso" src="${esc(intentar(() => document.querySelector("header .logo-badge img, .logo-impreso, header img").src, ""))}" alt="EMA" style="height:34px"><div><b>Informe semanal · ${fC(R.desde)} al ${fC(R.hasta)}</b><small>${esc(R.zona.label || "")}${R.zona.plazas ? " · " + R.zona.plazas + " plazas · " + fN(R.zona.modulos) + " módulos" : ""}</small></div><small class="is-pn">Armado por la app · ${new Date(R.armado).toLocaleString("es-AR")} · Hoja ${n} de 2</small></div>`;
    return `<style>${PDF_CSS}</style>${cab(1)}${h1}<div style="break-before:page;page-break-before:always"></div>${cab(2)}${h2}<div class="is-pie">Solo el resumen de la hoja 1 lo escribe la IA; el resto lo arma la app con sus datos.</div>`;
  }
  const PDF_CSS = ".is-pcab{display:flex;align-items:center;border-bottom:2px solid #28285e;padding-bottom:6px;margin-bottom:10px}.is-pcab>div{flex:1;margin-left:12px}.is-pcab b{display:block;font-size:15px;color:#28285e}.is-pcab small{color:#475569;font-size:10px}.is-pn{font:9px monospace;text-align:right}.is-kpis{display:grid;grid-template-columns:repeat(4,1fr);grid-gap:6px;margin-bottom:8px}.is-k{border:1px solid #d6dbe6;border-radius:8px;padding:6px 8px}.is-k b{display:block;font:700 18px monospace;color:#28285e}.is-k span{display:block;font-size:10px}.is-k small{font-size:9px;color:#1e6f91}.is-res{border:1px solid #9fc7dc;background:#f2f8fb;border-radius:8px;padding:8px;font-size:11px;margin-bottom:8px}.is-av{font-size:10px;color:#8a4b00;margin-bottom:6px}.is-eti{font:700 10px monospace;letter-spacing:.08em;text-transform:uppercase;color:#28285e;margin:10px 0 4px}.is-eti span{font-weight:400;color:#6e7c93;text-transform:none;margin-left:6px}.is-t{width:100%;border-collapse:collapse;font-size:10px}.is-t th{text-align:left;font:600 9px monospace;color:#6e7c93;border-bottom:1px solid #c9d0dc;padding:3px}.is-t td{border-bottom:1px solid #eef0f5;padding:3px;vertical-align:top}.is-t td.n{text-align:right;font-family:monospace;white-space:nowrap}.is-2{display:grid;grid-template-columns:1fr 1fr;grid-gap:12px}.is-bar{display:flex;align-items:flex-end;height:80px}.is-bar>div{flex:1;text-align:center;font-size:9px}.is-bar i{display:block;width:60%;margin:0 auto;background:#1f5f86;border-radius:3px 3px 0 0}.is-bar span{display:block}.is-ul{margin:0;padding-left:16px;font-size:10.5px}.is-gris{color:#6e7c93;font-size:10px}.is-pie{margin-top:10px;font-size:9px;color:#6e7c93}";
  function pintar() {
    const ov = $("isOv"), R = st.R; if (!ov || !R) return;
    const sel = st.lista.map((x) => `<option value="${esc(x.semana)}"${x.semana === st.k ? " selected" : ""}>${fC(x.desde)} al ${fC(x.hasta)}</option>`).join("");
    ov.innerHTML = `<div class="is-in"><div class="is-bar0"><button type="button" class="is-bt" data-is="x" aria-label="Volver">‹</button><div class="is-t0"><b>Informe de la semana</b><small>${R.borrador ? "Borrador: todavía no se guardó (se arma solo el sábado desde las 14:00)" : "Armado el " + new Date(R.armado).toLocaleString("es-AR")}</small></div><button type="button" class="is-bt" data-is="cfg" aria-label="Ajustes">⚙</button><button type="button" class="is-bt" data-is="x" aria-label="Cerrar">✕</button></div>
<div class="is-hero"><div class="is-zona">${esc(R.zona.label || "")} · Semana</div><h2>Semana ${fC(R.desde)}–${fC(R.hasta)}</h2>${sel ? `<label class="is-sel">Semanas guardadas <select data-is="sem">${R.borrador ? `<option value="" selected>Esta (sin guardar)</option>` : ""}${sel}</select></label>` : ""}</div>
${st.cfg ? `<div class="card is-cfg"><b>⚙ Ajustes del informe</b><label class="is-sw"><input type="checkbox" data-is="ia"${iaOn() ? " checked" : ""}${esAdmin() ? "" : " disabled"}> Resumen del asistente (un pedido corto a la IA por semana)</label><small>${esAdmin() ? "Lo cambia solo Administración. Apagado, el informe sale igual sin ese párrafo." : "Lo cambia solo Administración."}</small></div>` : ""}
${st.msg ? `<div class="is-msg">${esc(st.msg)}</div>` : ""}
<div class="is-cuerpo">${cuerpoHtml(R, false)}</div>
<div class="is-pie0"><button type="button" class="btn-ghost" data-is="compartir">Compartir</button><button type="button" class="btn-primary" data-is="pdf">Bajar PDF</button>${R.borrador && puede() ? '<button type="button" class="btn-ghost" data-is="armar">Guardar esta semana</button>' : ""}</div></div>`;
  }
  const tituloPdf = (R) => `Informe semanal ${R.k} · ${fC(R.desde)} al ${fC(R.hasta)}`;
  function pdf() { const R = st.R; if (!R) return; intentar(() => window.abrirHojaImpresion(tituloPdf(R), cuerpoHtml(R, true), "Informe semanal"), null); }
  document.addEventListener("click", async (e) => {
    const a = e.target && e.target.closest && e.target.closest("[data-isabrir]"); if (a) { e.preventDefault(); intentar(() => window.__tableroDueno && window.__tableroDueno.cerrar(), null); intentar(() => window.cerrarMenuLateral && window.cerrarMenuLateral(), null); abrir(); return; }
    const b = e.target && e.target.closest && e.target.closest("#isOv [data-is]"); if (!b) return;
    const v = b.getAttribute("data-is");
    if (v === "x") return cerrar();
    if (v === "cfg") { st.cfg = !st.cfg; return pintar(); }
    if (v === "pdf" || v === "compartir") return pdf();
    if (v === "armar") { b.disabled = true; const R = await tic(true); st.msg = R ? "✅ Guardado. El aviso le llega a Administración el lunes 7:30." : "Esta semana ya la armó otro aparato (o no se pudo)."; await abrir(R ? R.k : st.k); return; }
  });
  document.addEventListener("change", async (e) => {
    const s = e.target && e.target.closest && e.target.closest('#isOv [data-is="sem"]'); if (s && s.value) return abrir(s.value);
    const c = e.target && e.target.closest && e.target.closest('#isOv [data-is="ia"]');
    if (c && esAdmin()) { try { await window.fbPersonalGuardar({ asistente: { informeIa: !!c.checked } }); window.__personalNube = Object.assign({}, window.__personalNube || {}, { asistente: Object.assign({}, obj(obj(window.__personalNube).asistente), { informeIa: !!c.checked }) }); st.msg = c.checked ? "Listo: el informe lleva el resumen del asistente." : "Listo: el informe sale sin el resumen del asistente."; } catch (er) { st.msg = "⚠ No se pudo guardar el ajuste."; } pintar(); }
  });
  // QR de la hoja: ?informe=AAAA-Www
  const qrOrig = window.__qrHoja;
  if (typeof qrOrig == "function" && !qrOrig.__inf) {
    const n = function (titulo, doc) {
      const m = String(titulo || "").match(/^Informe semanal (\d{4}-W\d\d)/);
      if (m && doc && !/class="ema-qr/.test(doc) && window.__codigos && window.__codigos.dataUrl) {
        try { const url = window.__codigos.BASE + "?informe=" + m[1]; const b = `<style>.membrete{padding-right:86px}</style><div class="ema-qr" style="position:absolute;top:14px;right:22px;width:72px;text-align:center;font:700 8.5px/1.2 ui-monospace,Menlo,monospace;color:#28285e;background:#fff"><img src="${window.__codigos.dataUrl(url)}" width="68" height="68" alt="QR" style="display:block;width:68px;height:68px"><span>${m[1]}</span></div>`; return /<body[^>]*>/i.test(doc) ? doc.replace(/<body[^>]*>/i, (x) => x + b) : b + doc; } catch (er) { }
      }
      return qrOrig.apply(this, arguments);
    };
    try { window.__heredar && window.__heredar(n, qrOrig); } catch (e) { }
    n.__inf = 1; window.__qrHoja = n;
  }
  let pendQr = "";
  try { const u = new URL(location.href); pendQr = u.searchParams.get("informe") || ""; if (pendQr) { sessionStorage.setItem("ema.inf.pend", pendQr); u.searchParams.delete("informe"); history.replaceState(history.state, "", u.pathname + u.search + u.hash); } else pendQr = sessionStorage.getItem("ema.inf.pend") || ""; } catch (e) { }
  // accesos
  function accesoHtml() { return puede() ? '<button type="button" class="ie-acc" data-isabrir="1"><span class="ie-ic" style="display:flex;align-items:center;justify-content:center;font-size:22px">📰</span>Informe de la semana</button>' : ""; }
  function tdHtml() { return puede() ? '<div class="td-cd" data-isabrir="1" role="button" tabindex="0"><div class="td-eti">📰 Informe de la semana <span>lunes a sábado · se arma solo</span></div><div class="td-sub">Ver el informe y las semanas anteriores ›</div></div>' : ""; }
  function ponerMenu() {
    const ml = $("menuLista"); if (!ml || $("menuInformeSemanal") || !puede()) return;
    const ref = $("menuTableroDueno") || $("menuAprende") || null;
    const b = document.createElement("button"); b.type = "button"; b.className = "menu-item"; b.id = "menuInformeSemanal"; b.setAttribute("data-isabrir", "1");
    b.innerHTML = '<span class="menu-ico">📰</span>Informe de la semana';
    ref && ref.parentNode === ml ? ref.insertAdjacentElement("afterend", b) : ml.appendChild(b);
  }
  let arrancado = false;
  function arranque() {
    if (no() || arrancado || !puede()) return;
    arrancado = true;
    ponerMenu();
    if (pendQr && puede()) { const k = pendQr; pendQr = ""; try { sessionStorage.removeItem("ema.inf.pend"); } catch (e) { } setTimeout(() => abrir(k), 800); }
    if (!window.__isNoAuto) setTimeout(() => tic(false), window.__isEspera != null ? 50 : 8000);
  }
  document.addEventListener("permisos-listos", arranque);
  (function esperar(n) { if (arrancado || n > 60 || window.__v147No) return; arranque(); setTimeout(() => esperar(n + 1), 3000); })(0);   // la sesión y los permisos llegan después
  setInterval(() => { if (!document.hidden && !window.__isNoAuto) tic(false); }, 10 * 6e4);
  window.__informeSemanal = { puede, armar, tic, tomar, abrir, cerrar, pdf, leerLista, resumenIa, datosTexto, pendiente, claveDe, lunesDe, lunesDeClave, sem, accesoHtml, tdHtml, cuerpoHtml, estado: () => ({ abierta: st.abierta, k: st.k, n: st.lista.length, corriendo: st.corriendo }) };
})();
