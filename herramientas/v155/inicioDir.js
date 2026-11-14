(function () {
  "use strict";
  // v155 · Rol «Dirección» y su Inicio (#iniDir). Ángel (14/11): «Hagamos A en el celu y C en la compu. Y sumar lo de la B,
  // calendarios»; la foto del día de cada obra y el pronóstico del clima contra lo planeado (sin «riesgo de multas»).
  // «Pueden mirar todo, consultar todo, pero no pueden cambiar nada.» «Esa pantalla también mostrarla en oficina».
  //  · Rol direccion: todas las hojas en «ver» (PERMISOS.ROLES), nada que escriba (las fb* ya cortan; las reglas v155 también).
  //  · Inicio de Dirección: portada + número del día (módulos K de hoy contra el ritmo que hace falta), necesita tu atención,
  //    barras de 14 días, curva S de la zona (plan lineal, a confirmar), qué se hizo hoy / ayer por obra con la foto del día,
  //    dónde se trabaja hoy (mapa chico), equipo, clima contra lo planeado, programación (semáforo en la compu, pistas,
  //    calendario de terminaciones), plata sin IVA y el asistente. TODO de memoria salvo: UNA consulta fotosObra (fecha == hoy)
  //    al abrir y cada 15 min con la pantalla a la vista, y el pronóstico de Open-Meteo (guardado 3 h). Sin escuchas nuevas.
  //  · Admin y oficina la abren como «📊 Dirección» (Inicio Ejecutivo, menú y Tablero del dueño): hoja #dirOv con ✕.
  //  · La fecha de inicio del contrato: configEquipo/precios.contratoInicio (+ contratoPlazoMeses, 4 de entrada). Sin cargar:
  //    la primera orden de la zona, «estimada». Nunca se inventa una fecha.
  //  Pruebas viejas: window.__v155No.
  const V = window.__v135;
  window.__esDireccion = function () { try { if (window.__v155No) return false; const y = window.PERMISOS && PERMISOS.yo && PERMISOS.yo(); return !!y && y.rol === "direccion" && y.activo !== false; } catch (e) { return false; } };
  if (window.__v155No || !V) return;
  const $ = (id) => document.getElementById(id);
  const esc = V.esc, intentar = V.intentar;
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const r1 = (v) => Math.round((+v || 0) * 10) / 10, r2 = (v) => Math.round((+v || 0) * 100) / 100;
  const arr = (x) => (Array.isArray(x) ? x : []), obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const fN = (v, d) => intentar(() => fmt(+v || 0, d == null ? (Number.isInteger(r1(v)) ? 0 : 1) : d), String(v));
  const plata = (v) => "$ " + fN(v, 0);
  const millones = (v) => (Math.abs(v) >= 1e6 ? "$ " + fN(v / 1e6, 1) + " M" : plata(v));
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const deIso = (s) => { const m = String(s || "").match(/^(\d{4})-(\d\d)-(\d\d)/); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null; };
  const hoy = () => iso(new Date());
  const mas = (f, n) => { const d = deIso(f); d.setDate(d.getDate() + n); return iso(d); };
  const dm = (f) => { const d = deIso(f); return d ? pad(d.getDate()) + "/" + pad(d.getMonth() + 1) : "—"; };
  const dmy = (f) => { const d = deIso(f); return d ? dm(f) + "/" + d.getFullYear() : "—"; };
  const diasEntre = (a, b) => Math.round((deIso(b) - deIso(a)) / 864e5);
  const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"], DIAS3 = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const habil = (f) => { const d = deIso(f); return !!d && d.getDay() !== 0 && d.getDay() !== 6; };   // lunes a viernes (a confirmar: sábados y feriados)
  function habiles(a, b) { let n = 0, f = a; for (let i = 0; i < 1500 && f < b; i++) { f = mas(f, 1); if (habil(f)) n++; } return n; }   // (a, b]
  function sumarHabiles(f, n) { let x = f; for (let i = 0; i < 3000 && n > 0; i++) { x = mas(x, 1); if (habil(x)) n--; } return x; }
  const ots = () => V.ots().filter((o) => o && o.estado !== "Anulada");
  const obras = () => V.obras().filter((o) => o && o.id && o.id !== "__sinObra");
  const cerrada = (o) => !!(o && o.cierre && o.cierre.cerradoTs);
  const ZC = () => window.__zonaContrato || null;
  const enZona = (o) => { const z = ZC(); if (!z) return !!o && o.tipo !== "barrio" && o.tipo !== "otra"; return z.zonaDeObra(o) === z.zona(); };
  const nombre = (o) => { const n = String((o && (o.nombre || o.plazaNombre)) || "(sin nombre)"); return window.__fmtNombre ? window.__fmtNombre.obra(n) : n.toUpperCase(); };
  const labelDe = (k) => intentar(() => window.__sugerida.labelDe(k), "") || intentar(() => (ACTIVIDADES_CATALOGO.find((a) => a.id === k) || {}).label, "") || String(k || "");
  const corto = (k) => labelDe(k).split(" ").slice(0, 3).join(" ");
  const esProv = (id) => /^8[3-9](\.|$)/.test(String(id));
  const kItem = (id) => intentar(() => num(window.epecItemK(String(id))), 0);
  const avanceDe = (o) => intentar(() => num(calcularAvanceEtapasPct(o)), 0);
  const obraFin = (o) => intentar(() => !!window.__obraFin(o), false) || avanceDe(o) >= 100;
  const rol = () => V.rol();
  const esDir = () => window.__esDireccion();
  const veOficina = () => { const r = rol(); return r === "admin" || r === "oficina"; };
  const puedeVer = () => !!window.__fbUser && V.rolListo() && !V.esCrew() && (esDir() || veOficina());

  // ============================================================================ el contrato (inicio, plazo, ritmo)
  function contrato() {
    const P = obj(window.__preciosNube), meses = Math.max(1, Math.min(48, Math.round(num(P.contratoPlazoMeses) || 4)));
    let ini = /^\d{4}-\d\d-\d\d$/.test(String(P.contratoInicio || "")) ? String(P.contratoInicio) : "", estimada = false;
    if (!ini) {   // sin cargar: la primera orden de una obra de la zona (estimada)
      const ids = {}; obras().filter(enZona).forEach((o) => { ids[String(o.id)] = 1; });
      ots().forEach((o) => { const f = String(o.fecha || "").slice(0, 10); if (ids[String(o.plazaId)] && /^\d{4}-\d\d-\d\d$/.test(f) && (!ini || f < ini)) ini = f; });
      estimada = true;
    }
    if (!ini) return { ini: "", plazo: "", meses, estimada: true, sinDato: true };
    const d = deIso(ini); d.setMonth(d.getMonth() + meses);
    return { ini, plazo: iso(d), meses, estimada, sinDato: false };
  }
  // módulos (K) de una orden cerrada (sin provisiones), como la certificación y el informe semanal
  function kOt(o) { let k = 0; arr(o && o.cierre && o.cierre.avanceItems).forEach((it) => { if (it && !esProv(it.id)) k += num(it.delta) * kItem(it.id); }); return k; }
  const dejo = (o) => cerrada(o) && !(o.cierre && o.cierre.avanceRevertido);
  // lo mandado por la cuadrilla y todavía sin cerrar (verificación v150), pasado a módulos con la misma cuenta del cierre (estimado)
  const cacheEst = {};
  function kEstimado(o) {
    if (!o || cerrada(o) || !window.efectosDelCierre || !window.__verifOt) return 0;
    const firma = o.id + "|" + JSON.stringify(obj(o.campo).tareaEnv || {}).length + "|" + JSON.stringify(obj(o.campo).pasosObra || {}).length + "|" + JSON.stringify(obj(o.campo).marcas || {}).length;
    if (cacheEst[o.id] && cacheEst[o.id].f === firma) return cacheEst[o.id].k;
    let k = 0;
    try {
      const V2 = window.__verifOt.verifOt(o), cant = {};
      arr(V2 && V2.tareas).forEach((t) => { if (t.est !== "pend" && t.hechas > 0) cant[t.k] = t.hechas; });
      if (Object.keys(cant).length) {
        const ef = window.efectosDelCierre(Object.assign({}, o, { id: o.id + "~dir", actividades: Object.keys(cant), cierre: { avanceItems: [] } }), cant);
        arr(ef && ef.propuestas).forEach((p) => { if (p && p.delta > 0 && !esProv(p.id)) k += num(p.delta) * kItem(p.id); });
      }
    } catch (e) { k = 0; }
    cacheEst[o.id] = { f: firma, k };
    return k;
  }

  // ============================================================================ los datos (de memoria; caché corta)
  let cache = null;
  function datos(forzar) {
    if (!forzar && cache && Date.now() - cache.ts < 20000) return cache.D;
    const h = hoy(), ayer = (() => { let f = mas(h, -1); for (let i = 0; i < 7 && !habil(f); i++) f = mas(f, -1); return f; })();
    const z = intentar(() => ZC().resumen(), null) || { pct: 0, k: 0, modulos: 0, terminadas: 0, plazas: 0, label: "Nuestra zona", zona: "", corto: "" };
    const C = contrato(), zObras = obras().filter(enZona), ids = {}; zObras.forEach((o) => { ids[String(o.id)] = 1; });
    // módulos por día (zona): cerradas por la fecha de la orden + lo mandado sin cerrar (estimado, aparte)
    const porDia = {}, est = {}, porObraDia = {};
    ots().forEach((o) => {
      const f = String(o.fecha || "").slice(0, 10); if (!f) return;
      const enZ = !!ids[String(o.plazaId)];
      const kc = dejo(o) ? kOt(o) : 0, ke = !cerrada(o) && f >= mas(h, -20) && f <= h ? kEstimado(o) : 0;
      if (enZ) { if (kc) porDia[f] = (porDia[f] || 0) + kc; if (ke) est[f] = (est[f] || 0) + ke; }
      if (f === h || f === ayer) { const x = (porObraDia[f + "|" + o.plazaId] = porObraDia[f + "|" + o.plazaId] || { f, id: String(o.plazaId), k: 0, est: 0, ots: [] }); x.k += kc; x.est += ke; x.ots.push(o); }
    });
    const dias14 = []; for (let f = h, i = 0; i < 40 && dias14.length < 14; i++, f = mas(f, -1)) if (habil(f) || f === h) dias14.unshift({ f, k: r1(porDia[f] || 0), est: r1(est[f] || 0) });
    const hoyK = r1((porDia[h] || 0) + (est[h] || 0)), hoyKc = r1(porDia[h] || 0), ayerK = r1((porDia[ayer] || 0) + (est[ayer] || 0));
    const prev7 = []; for (let f = mas(h, -1), i = 0; i < 30 && prev7.length < 7; i++, f = mas(f, -1)) if (habil(f)) prev7.push((porDia[f] || 0) + (est[f] || 0));
    const prom7 = prev7.length ? prev7.reduce((s, x) => s + x, 0) / prev7.length : 0;
    const falta = Math.max(0, num(z.modulos) - num(z.k));
    const quedan = C.plazo ? Math.max(1, habiles(mas(h, -1), C.plazo)) : 0;
    const ritmo = C.plazo ? falta / quedan : 0;
    let proy = "", difDias = null;
    if (prom7 > 0.01 && falta > 0) { proy = sumarHabiles(h, Math.ceil(falta / prom7)); if (C.plazo) difDias = diasEntre(C.plazo, proy); }
    else if (falta <= 0) proy = h;
    const pctPlan = C.ini && C.plazo ? Math.max(0, Math.min(100, (diasEntre(C.ini, h) / Math.max(1, diasEntre(C.ini, C.plazo))) * 100)) : null;
    // curva real: acumulado de lo fechado (lo cargado a mano sin fecha va al principio)
    const fechado = Object.keys(porDia).filter((f) => !C.ini || f >= C.ini).reduce((s, f) => s + porDia[f], 0);
    const sinFecha = Math.max(0, num(z.k) - fechado);
    const D = { h, ayer, z, C, zObras, porDia, est, dias14, hoyK, hoyKc, ayerK, prom7: r1(prom7), falta, quedan, ritmo: r1(ritmo), proy, difDias, pctPlan, sinFecha, porObraDia };
    D.obras = programacion(D);
    D.sinProgramar = Math.max(zObras.filter((o) => !obraFin(o) && !prevista(o).f).length, num(z.plazas) - zObras.filter((o) => obraFin(o) || !!prevista(o).f).length);   // las plazas de la zona sin registrar tampoco tienen fecha
    D.hoyOts = ots().filter((o) => String(o.fecha || "").slice(0, 10) === h);
    cache = { ts: Date.now(), D };
    return D;
  }

  // ============================================================================ programación por obra
  function prevista(o) {
    const g = arr(o && o.planGantt).filter((x) => x && /^\d{4}-\d\d-\d\d/.test(String(x.desde || "")));
    if (g.length) return { f: g.map((x) => String(x.hasta || x.desde).slice(0, 10)).sort().pop(), ini: g.map((x) => String(x.desde).slice(0, 10)).sort()[0], de: "plan" };
    if (/^\d{4}-\d\d-\d\d/.test(String((o && o.fechaEstimada) || ""))) return { f: String(o.fechaEstimada).slice(0, 10), ini: "", de: "estimada en la obra" };
    return { f: "", ini: "", de: "" };
  }
  function programacion(D) {
    const h = D.h, l = [];
    D.zObras.forEach((o) => {
      const a = Math.max(0, Math.min(100, avanceDe(o))), mis = ots().filter((t) => String(t.plazaId) === String(o.id)).map((t) => String(t.fecha || "").slice(0, 10)).filter(Boolean).sort();
      const pr = prevista(o), fin = a >= 100 || obraFin(o);
      if (!fin && !a && !mis.length && !pr.f) return;   // ni empezada ni programada (cuenta en «sin programar»)
      const ini = pr.ini && (!mis[0] || pr.ini < mis[0]) ? pr.ini : mis[0] || pr.ini || "";
      let proy = "", estimada = false;
      if (fin) proy = intentar(() => (window.__docObra && window.__docObra.fecha100(o) || {}).fecha, "") || mis[mis.length - 1] || h;
      else if (a > 0 && ini && ini <= h) { const hd = Math.max(1, habiles(mas(ini, -1), h)), r = a / hd; proy = r > 0 ? sumarHabiles(h, Math.ceil((100 - a) / r)) : ""; estimada = true; }
      let est = "sinfecha", dif = null;
      if (fin) est = "fin";
      else if (pr.f) {
        dif = proy ? diasEntre(pr.f, proy) : null;
        if (pr.f < h || (dif != null && dif > 7)) est = "atrasada"; else if (dif != null && dif > 0) est = "riesgo"; else est = "ok";
        if (pr.f < h && dif == null) dif = diasEntre(pr.f, h);
      }
      l.push({ o, id: String(o.id), n: nombre(o), ID: o.obraId || "", a: Math.round(a), ini, prev: pr.f, prevDe: pr.de, proy, estimada, est, dif, fin });
    });
    const ord = { atrasada: 0, riesgo: 1, sinfecha: 2, ok: 3, fin: 4 };
    return l.sort((x, y) => ord[x.est] - ord[y.est] || String(x.prev || x.proy || "9").localeCompare(String(y.prev || y.proy || "9")));
  }
  const EST = { ok: { c: "#34C759", bg: "rgba(52,199,89,.14)", tx: "#1B7A35", t: "A tiempo" }, riesgo: { c: "#FF9F0A", bg: "rgba(255,159,10,.16)", tx: "#9A5B00", t: "En riesgo" }, atrasada: { c: "#FF3B30", bg: "rgba(255,59,48,.12)", tx: "#B42318", t: "Atrasada" }, fin: { c: "#1E6F91", bg: "rgba(30,111,145,.12)", tx: "#1E6F91", t: "Terminada" }, sinfecha: { c: "#8792A6", bg: "rgba(110,124,147,.14)", tx: "#475569", t: "Sin fecha prevista" } };

  // ============================================================================ lo que se hizo (hoy / ayer) y la foto del día
  function hechoOt(o) {   // {k: cantidad}
    const r = {};
    if (cerrada(o)) { const c = obj(o.cierre.cantidades || o.cierre.hecho); Object.keys(c).forEach((k) => { const q = num(c[k]); if (q > 0) r[k] = q; }); return { r, ver: true }; }
    try { arr((window.__verifOt.verifOt(o) || {}).tareas).forEach((t) => { if (t.est !== "pend" && t.hechas > 0) r[t.k] = t.hechas; }); } catch (e) { }
    return { r, ver: false };
  }
  const unTxt = (k, q) => fN(q) + " " + corto(k).toLowerCase();
  const st = { seg: "hoy", prog: "", fotosQ: {}, fotosTs: 0, fotosCargando: false, clima: null, climaTs: 0, climaPidiendo: false, climaErr: false, sug: null, sugTs: 0, mapa: null, capa: null, h: {}, reglas: "", reglasTs: 0, abierto: false, cuerpo: null, nuevo: true, mat: null, matTs: 0 };
  try { st.prog = localStorage.getItem("ema.dir.prog") || ""; } catch (e) { }
  function fotoDe(id) {   // la última de hoy: primero la de las órdenes (en memoria), si no la de la consulta
    let best = null;
    ots().filter((o) => String(o.plazaId) === String(id) && String(o.fecha || "").slice(0, 10) === hoy()).forEach((o) => {
      const fs = obj(obj(o.campo).fotos); Object.keys(fs).forEach((k) => { const f = fs[k]; if (!f || f.borrada || !f.mini) return; if (!best || num(f.ts) > num(best.ts)) best = { id: k, mini: f.mini, ts: num(f.ts), por: f.por || "", num: f.num || "", tarea: f.tarea || labelDe(f.k || ""), obra: o.plazaNombre || "" }; });
    });
    const q = st.fotosQ[String(id)];
    if (q && q.mini && (!best || q.ts > best.ts)) best = q;
    return best;
  }
  function pedirFotos(forzar) {   // UNA consulta: fotosObra de hoy (sin escuchas); al abrir y cada 15 min con la pantalla a la vista
    if (st.fotosCargando || (!forzar && Date.now() - st.fotosTs < 15 * 6e4)) return;
    const D = datos(); if (!D.hoyOts.length) return;
    let db = null; try { db = firebase.firestore(); } catch (e) { return; }
    st.fotosCargando = true; st.fotosTs = Date.now();
    db.collection("fotosObra").where("fecha", "==", D.h).limit(120).get().then((s) => {
      const m = {}; s.forEach((d) => { const f = Object.assign({ id: d.id }, d.data()); if (!f || f.borrada || !f.plazaId || !f.mini) return; const ts = num(f.ts) || (f.ts && f.ts.toMillis ? f.ts.toMillis() : 0); const x = m[String(f.plazaId)]; if (!x || ts > x.ts) m[String(f.plazaId)] = { id: f.adjId || f.id, mini: f.mini, ts, por: f.por || "", num: f.num || "", tarea: f.cat || "", obra: f.plazaNombre || "" }; });
      st.fotosQ = m; st.fotosCargando = false; pintar();
    }, () => { st.fotosCargando = false; });
  }
  function verFoto(id) {
    const f = fotoDe(id); if (!f || !window.emaGaleria) return;
    const ob = obras().find((o) => String(o.id) === String(id));
    window.emaGaleria.abrir([{ id: f.id, mini: f.mini, titulo: (f.tarea || "Foto") + (f.num ? " · " + f.num : ""), sub: [ob ? nombre(ob) : f.obra, String(f.por || "").split(" ")[0], f.ts ? new Date(f.ts).toTimeString().slice(0, 5) : ""].filter(Boolean).join(" · ") }], 0);
  }

  // ============================================================================ clima (Open-Meteo, sin clave; guardado 3 h)
  const CLIMA_URL = "https://api.open-meteo.com/v1/forecast?latitude=-31.42&longitude=-64.18&daily=precipitation_sum,precipitation_probability_max,temperature_2m_max,wind_speed_10m_max&timezone=America/Argentina/Cordoba";
  const LLUVIA_MM = 5, LLUVIA_PCT = 70, VIENTO = 40;   // a confirmar
  function climaLeer() {
    if (st.clima && Date.now() - st.climaTs < 3 * 36e5) return st.clima;
    try { const c = JSON.parse(localStorage.getItem("ema.clima") || "null"); if (c && c.d && Date.now() - c.ts < 3 * 36e5) { st.clima = c.d; st.climaTs = c.ts; return c.d; } } catch (e) { }
    pedirClima();
    return st.clima;
  }
  function pedirClima() {
    if (st.climaPidiendo || (st.climaErr && Date.now() - st.climaTs < 10 * 6e4)) return;
    if (navigator.onLine === false) { st.climaErr = true; st.climaTs = Date.now(); return; }
    st.climaPidiendo = true;
    fetch(window.__climaUrl || CLIMA_URL).then((r) => (r.ok ? r.json() : null)).then((j) => {
      st.climaPidiendo = false;
      const d = j && j.daily; if (!d || !Array.isArray(d.time)) { st.climaErr = true; st.climaTs = Date.now(); pintar(); return; }
      const dias = d.time.map((f, i) => ({ f, mm: num(arr(d.precipitation_sum)[i]), pct: num(arr(d.precipitation_probability_max)[i]), max: num(arr(d.temperature_2m_max)[i]), viento: num(arr(d.wind_speed_10m_max)[i]) }));
      st.clima = dias; st.climaTs = Date.now(); st.climaErr = false;
      try { localStorage.setItem("ema.clima", JSON.stringify({ ts: st.climaTs, d: dias })); } catch (e) { }
      pintar();
    }, () => { st.climaPidiendo = false; st.climaErr = true; st.climaTs = Date.now(); pintar(); });
  }
  function planeado() {   // fecha → [{obra, tareas[{k,label}], veh[]}]: órdenes emitidas + la sugerida de los próximos días
    const h = hoy(), out = {};
    const poner = (f, obraN, obraId, tareas, veh) => { const l = (out[f] = out[f] || []); if (l.some((x) => x.id === obraId)) return; l.push({ obra: obraN, id: obraId, tareas, veh }); };
    ots().filter((o) => String(o.fecha || "") >= h && !cerrada(o)).forEach((o) => {
      const ks = arr(o.actividades).slice(), man = arr(o.actividadesManuales).map((a) => a && a.actividad).filter(Boolean);
      const veh = arr(o.vehiculos).map((v) => intentar(() => (window.__vehiculos.porId(v.id) || {}).tipo, "") || "");
      poner(String(o.fecha).slice(0, 10), o.plazaNombre || "", String(o.plazaId), ks.map((k) => ({ k, label: labelDe(k) })).concat(man.map((m) => ({ k: "", label: m }))), veh);
    });
    if (!st.sug || Date.now() - st.sugTs > 10 * 6e4) { st.sugTs = Date.now(); st.sug = intentar(() => (window.__sugerida && !window.__sugNo ? window.__sugerida.semana() : []), []) || []; }
    arr(st.sug).forEach((d) => arr(d && d.ordenes).forEach((x) => { if (!x || x.emitida || x.incluir === false) return; poner(d.fecha, x.obra, String(x.obraId), arr(x.tareas).map((t) => ({ k: t.k, label: t.label || labelDe(t.k) })), arr(x.vehiculos).map((v) => v.tipo || "")); }));
    return out;
  }
  function avisosClima() {
    const c = climaLeer(); if (!c) return { dias: [], avisos: [], sin: true };
    const P = planeado(), avisos = [], h = hoy();
    const dias = c.filter((d) => d.f >= h).slice(0, 7);
    dias.forEach((d) => {
      const l = P[d.f] || [], dn = d.f === h ? "Hoy" : DIAS[deIso(d.f).getDay()];
      if (d.mm >= LLUVIA_MM || d.pct >= LLUVIA_PCT) {
        const ries = l.map((x) => ({ x, t: x.tareas.filter((t) => /hormig|zanj|cruce|izaj/i.test(t.k + " " + t.label)) })).filter((y) => y.t.length);
        ries.forEach((y) => avisos.push({ f: d.f, tipo: "lluvia", t: `⛈ ${dn}: lluvia ${fN(d.mm, d.mm < 10 ? 1 : 0)} mm (${fN(d.pct, 0)} %) · hay ${y.t.map((t) => corto(t.k) || t.label).map((s) => s.toLowerCase()).filter((s, i, a) => a.indexOf(s) === i).join(", ")} en ${(window.__fmtNombre ? window.__fmtNombre.obra(y.x.obra) : String(y.x.obra).toUpperCase())}` }));
      }
      if (d.viento >= VIENTO) {
        const ries = l.filter((x) => x.tareas.some((t) => /izaj/i.test(t.k + " " + t.label)) || x.veh.some((v) => /hidro|grua|barquilla/i.test(v)));
        ries.forEach((x) => avisos.push({ f: d.f, tipo: "viento", t: `💨 ${dn}: viento de ${fN(d.viento, 0)} km/h · hay izaje o trabajo en altura en ${(window.__fmtNombre ? window.__fmtNombre.obra(x.obra) : String(x.obra).toUpperCase())}` }));
      }
    });
    return { dias, avisos, P };
  }

  // ============================================================================ plata (sin IVA)
  let tdC = null;
  function tdD() { if (!tdC || Date.now() - tdC.ts > 20000) tdC = { ts: Date.now(), T: intentar(() => window.__tableroDueno.datos(), null) }; return tdC.T; }
  function plataDatos() {
    const T = tdD();
    const cc = obj(obj(window.__preciosNube).certCerrados), mk = Object.keys(cc).sort();
    const ultimo = mk.length ? { m: mk[mk.length - 1], sinIva: num(cc[mk[mk.length - 1]].sinIva) || num(cc[mk[mk.length - 1]].kMes) * (T ? num(T.modulo) : 0) } : null;
    const modulo = T ? num(T.modulo) : intentar(() => num(window.epecModuloValor ? window.epecModuloValor() : 296126.45), 296126.45);
    const kCert = T ? num(T.kCert) : 0, acum = kCert * modulo;
    const certTot = T ? arr(T.gan).reduce((s, x) => s + num(x.certificado), 0) : 0, gastTot = T ? num(T.gastTot) : 0, ganTot = T ? num(T.ganTot) : 0;
    const margen = certTot > 0 ? (ganTot / certTot) * 100 : null;
    // material: entregado contra usado según el avance (último precio de las entradas)
    if (!st.mat || Date.now() - st.matTs > 2 * 6e4) {
      const precio = (c) => intentar(() => { const p = stockUltimoPrecio(c); return p ? num(p.precioUnit) : 0; }, 0);
      let ent = 0, us = 0, sinP = 0, porObra = {};
      obras().filter(enZona).forEach((o) => {
        const M = intentar(() => window.__matAvance.deObra(o), null); if (!M) return;
        porObra[String(o.id)] = { rj: M.rj, am: M.am, ok: M.ok };
        arr(M.filas).forEach((f) => {
          if (f.unDist) return; const p = precio(f.codigo); if (!(p > 0)) { sinP++; return; }
          let fu = 1; const b = intentar(() => stockBase(f.codigo), null); if (b && b.un && f.un && window.__nU && window.__nU(b.un) !== window.__nU(f.un)) fu = intentar(() => num(window.__factorUn(f.codigo, f.un)), 0) || 0;
          if (!(fu > 0)) return; ent += (num(f.ent) / fu) * p; us += (num(f.deb) / fu) * p;
        });
      });
      st.mat = { ent, us, sinP, porObra }; st.matTs = Date.now();
    }
    return { T, ultimo, modulo, kCert, acum, contrato: num((datos().z || {}).modulos) * modulo, R: T ? T.R : null, certTot, gastTot, ganTot, margen, mat: st.mat, M: hoy().slice(0, 7) };
  }

  // ============================================================================ equipo y dónde se trabaja
  function equipo(D) {
    const T = tdD();
    const cu = intentar(() => window.__mapaControl.cuadrillas(), []) || [];
    const sinT = intentar(() => (window.__sinTarea && !window.__v145No ? window.__sinTarea.sinTarea(D.h) : []), []) || [];
    const vehT = intentar(() => arr(window.__vehiculos.lista()).filter((v) => v && v.activo !== false).length, 0) || arr(obj(window.__personalNube).vehiculos).filter((v) => v && v.activo !== false).length;
    const vehU = {}; D.hoyOts.forEach((o) => arr(o.vehiculos).forEach((v) => { if (v && (v.id || v.nombre)) vehU[v.id || v.nombre] = 1; }));
    return { gente: T ? T.gente : 0, nom: T ? T.nom : 0, aus: T ? T.aus : [], sinT, vehU: Object.keys(vehU).length, vehT, cu };
  }
  function atencion(D) {
    const l = [];
    const sup = intentar(() => window.__supervisor.hallazgos(), []) || [];
    sup.filter((x) => x.cat === "Al día" && x.g === "rojo").forEach((x) => l.push({ p: 1, c: "atrasada", t: x.t, s: x.s, obraId: x.obraId || "", ir: "obra" }));
    (intentar(() => window.__mapaControl.alertas(), []) || []).forEach((a) => {
      if (a.tipo === "material") l.push({ p: 1, c: "riesgo", t: `${a.t}: ${nombreDe(a.obraId)}`, s: a.s, obraId: a.obraId, ir: "material" });
      else if (a.tipo === "trabada") l.push({ p: 1, c: "atrasada", t: `${nombreDe(a.obraId)} trabada`, s: a.s, obraId: a.obraId, ir: "obra" });
      else if (a.tipo === "sinCerrar") l.push({ p: 2, c: "riesgo", t: a.t + ": " + nombreDe(a.obraId), s: a.s, obraId: a.obraId, ir: "ordenes" });
    });
    sup.filter((x) => x.cat === "Al día" && x.g === "ambar").forEach((x) => l.push({ p: 2, c: "riesgo", t: x.t, s: x.s, obraId: x.obraId || "", ir: "obra" }));
    if (D.difDias != null && D.difDias > 0) l.unshift({ p: 0, c: "atrasada", t: `A este ritmo terminamos ${D.difDias > 999 ? "más de 999" : D.difDias} ${D.difDias === 1 ? "día" : "días"} después del plazo`, s: `Hacen falta ${fN(D.ritmo, 0)} K por día hábil y venimos haciendo ${fN(D.prom7, 0)} (promedio de 7 días).`, ir: "prog" });
    const vistos = {}; return l.sort((a, b) => a.p - b.p).filter((x) => { const k = x.t; if (vistos[k]) return false; vistos[k] = 1; return true; }).slice(0, 3);
  }
  const nombreDe = (id) => { const o = obras().find((x) => String(x.id) === String(id)); return o ? nombre(o) : "la obra"; };

  // ============================================================================ gráficos (SVG con colores reales, sin var())
  const FONT = 'font-family="Plus Jakarta Sans,Arial" fill="#475569"', MONO = 'font-family="JetBrains Mono,monospace"';
  const T_ = (x, y, s, txt, o) => `<text x="${r1(x)}" y="${r1(y)}" font-size="${s}" ${o || ""}>${txt}</text>`;
  function meses(d0, d1, fn) {   // rótulos de mes, como mucho 8
    const l = []; for (let d = new Date(d0.getFullYear(), d0.getMonth() + 1, 1, 12); d <= d1 && l.length < 200; d.setMonth(d.getMonth() + 1)) l.push(new Date(d));
    const paso = Math.max(1, Math.ceil(l.length / 8));
    return l.filter((d, i) => i % paso === 0).map((d) => fn(iso(d), MESES[d.getMonth()].slice(0, 3) + (paso > 2 && d.getMonth() === 0 ? " " + String(d.getFullYear()).slice(2) : ""))).join("");
  }
  function barras14(D, w, hh) {
    const L = 34, R = 8, Tp = 22, B = 24, iw = w - L - R, ih = hh - Tp - B;
    const max = Math.max(10, D.ritmo * 1.2, ...D.dias14.map((x) => x.k + x.est)) * 1.08, y = (v) => Tp + ih - (v / max) * ih, bw = iw / Math.max(1, D.dias14.length);
    const g1 = Math.round(max / 2 / 10) * 10 || Math.round(max / 2);
    let s = `<svg class="dr-chart" viewBox="0 0 ${w} ${hh}" role="img" aria-label="Módulos por día, últimos 14 días hábiles" ${FONT}>`;
    [0, g1, g1 * 2].forEach((g) => { if (g > max) return; s += `<line x1="${L}" x2="${w - R}" y1="${r1(y(g))}" y2="${r1(y(g))}" stroke="rgba(40,40,94,${g ? 0.08 : 0.25})"/>` + T_(L - 6, y(g) + 3.5, 10, fN(g, 0), `text-anchor="end" ${MONO} fill="#6E7C93"`); });
    D.dias14.forEach((d, i) => {
      const x = L + i * bw + 2, ww = Math.max(4, bw - 4), esHoy = d.f === D.h, esAyer = d.f === D.ayer;
      const col = esHoy ? "#28285E" : esAyer ? "#1E6F91" : "rgba(30,111,145,.42)";
      const yc = y(d.k), ye = y(d.k + d.est), cl = DIAS3[deIso(d.f).getDay()] + " " + dm(d.f);
      if (d.k > 0) s += `<rect x="${r1(x)}" y="${r1(yc)}" width="${r1(ww)}" height="${r1(Math.max(0, y(0) - yc))}" rx="3" fill="${col}"><title>${cl}: ${fN(d.k, 1)} K cerrados</title></rect>`;
      if (d.est > 0) s += `<rect class="dr-est" x="${r1(x + 0.75)}" y="${r1(ye)}" width="${r1(ww - 1.5)}" height="${r1(Math.max(0, yc - ye))}" rx="3" fill="url(#drRaya)" stroke="${col}" stroke-dasharray="3 2"><title>${cl}: ${fN(d.est, 1)} K mandados sin cerrar (estimado)</title></rect>`;
      if (esHoy || esAyer || i === 0 || i === Math.floor(D.dias14.length / 2)) s += T_(x + ww / 2, hh - 8, 9.5, esHoy ? "hoy" : esAyer ? "ayer" : dm(d.f), `text-anchor="middle"${esHoy ? ' font-weight="700" fill="#0D1424"' : ""}`);
      if ((esHoy || esAyer) && d.k + d.est > 0) s += T_(x + ww / 2, ye - 4, 9.5, fN(d.k + d.est, 0), `text-anchor="middle" ${MONO} font-weight="700" fill="#0D1424"`);
    });
    s += `<defs><pattern id="drRaya" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="rgba(30,111,145,.12)"/><line x1="0" y1="0" x2="0" y2="5" stroke="rgba(30,111,145,.5)" stroke-width="2"/></pattern></defs>`;
    if (D.ritmo > 0) { const yr = y(D.ritmo); s += `<line x1="${L}" x2="${w - R}" y1="${r1(yr)}" y2="${r1(yr)}" stroke="#0D1424" stroke-width="1.5" stroke-dasharray="5 4"/><rect x="${L + 2}" y="${r1(yr - 17)}" width="152" height="15" rx="4" fill="rgba(255,255,255,.92)"/>` + T_(L + 6, yr - 6, 10.5, `Ritmo necesario: ${fN(D.ritmo, 0)} K/día`, 'fill="#0D1424" font-weight="700"'); }
    return s + "</svg>";
  }
  function curvaS(D, w, hh) {
    const C = D.C; if (!C.ini) return '<div class="dr-nada">Sin fecha de inicio ni órdenes en la zona: todavía no se puede dibujar la curva.</div>';
    const L = 34, R = 14, Tp = 16, B = 26, iw = w - L - R, ih = hh - Tp - B, Mz = Math.max(1, num(D.z.modulos));
    const tope = mas(C.plazo, 120), lejos = !!(D.proy && D.proy > tope), fin = lejos ? tope : [C.plazo, D.proy || C.plazo].sort().pop(), x0 = deIso(C.ini), x1 = deIso(mas(fin, 10));
    const x = (f) => L + ((deIso(f) - x0) / Math.max(1, x1 - x0)) * iw, y = (p) => Tp + ih - (Math.max(0, Math.min(100, p)) / 100) * ih;
    let s = `<svg class="dr-chart" viewBox="0 0 ${w} ${hh}" role="img" aria-label="Curva S de la zona: real contra plan lineal" ${FONT}>`;
    [0, 25, 50, 75, 100].forEach((g) => { s += `<line x1="${L}" x2="${w - R}" y1="${r1(y(g))}" y2="${r1(y(g))}" stroke="rgba(40,40,94,${g ? 0.07 : 0.25})"/>` + T_(L - 6, y(g) + 3.5, 9.5, g + "%", `text-anchor="end" ${MONO} fill="#6E7C93"`); });
    s += meses(x0, x1, (f, tx) => T_(x(f), hh - 8, 9.5, tx, 'text-anchor="middle"'));
    s += `<path d="M${r1(x(C.ini))} ${r1(y(0))}L${r1(x(C.plazo))} ${r1(y(100))}" fill="none" stroke="#8792A6" stroke-width="2" stroke-dasharray="5 4"/>`;
    let ac = D.sinFecha, pr = `M${r1(x(C.ini))} ${r1(y((ac / Mz) * 100))}`;
    Object.keys(D.porDia).filter((f) => f >= C.ini && f <= D.h).sort().forEach((f) => { ac += D.porDia[f]; pr += `L${r1(x(f))} ${r1(y((ac / Mz) * 100))}`; });
    const pctHoy = (num(D.z.k) / Mz) * 100;
    pr += `L${r1(x(D.h))} ${r1(y(pctHoy))}`;
    s += `<path d="${pr}L${r1(x(D.h))} ${r1(y(0))}L${r1(x(C.ini))} ${r1(y(0))}z" fill="rgba(40,40,94,.07)"/><path d="${pr}" fill="none" stroke="#28285E" stroke-width="2.5" stroke-linejoin="round"/>`;
    if (lejos) { const yf = pctHoy + (100 - pctHoy) * (diasEntre(D.h, fin) / Math.max(1, diasEntre(D.h, D.proy))); s += `<path d="M${r1(x(D.h))} ${r1(y(pctHoy))}L${r1(x(fin))} ${r1(y(yf))}" fill="none" stroke="#28285E" stroke-width="2.5" stroke-dasharray="1 5" stroke-linecap="round"/>` + T_(x(fin), y(yf) - 8, 10, "→ " + dmy(D.proy), `text-anchor="end" ${MONO} fill="#B42318" font-weight="700"`); }
    else if (D.proy && D.proy > D.h) s += `<path d="M${r1(x(D.h))} ${r1(y(pctHoy))}L${r1(x(D.proy))} ${r1(y(100))}" fill="none" stroke="#28285E" stroke-width="2.5" stroke-dasharray="1 5" stroke-linecap="round"/><circle cx="${r1(x(D.proy))}" cy="${r1(y(100))}" r="5" fill="#fff" stroke="#28285E" stroke-width="2.5"/>` + T_(x(D.proy) - 8, y(100) + 16, 10, dm(D.proy), `text-anchor="end" ${MONO} fill="#0D1424" font-weight="700"`);
    s += `<line x1="${r1(x(C.plazo))}" x2="${r1(x(C.plazo))}" y1="${Tp}" y2="${r1(y(0))}" stroke="#0D1424" stroke-opacity=".35"/>` + T_(x(C.plazo) - 4, y(0) - 6, 9.5, "Plazo " + dm(C.plazo), 'text-anchor="end" fill="#0D1424" font-weight="700"');
    s += `<circle cx="${r1(x(D.h))}" cy="${r1(y(pctHoy))}" r="5" fill="#28285E" stroke="#fff" stroke-width="2"/>` + T_(x(D.h) + 8, y(pctHoy) + 14, 10.5, `Hoy ${fN(pctHoy, 1)}%`, 'fill="#0D1424" font-weight="700"');
    if (D.pctPlan != null) s += `<circle cx="${r1(x(D.h))}" cy="${r1(y(D.pctPlan))}" r="4" fill="#fff" stroke="#8792A6" stroke-width="2"/>` + T_(x(D.h) - 6, y(D.pctPlan) - 8, 10, `plan ${fN(D.pctPlan, 1)}%`, 'text-anchor="middle"');
    return s + "</svg>";
  }
  function pistas(D, w, compu) {
    const l = D.obras.slice(0, compu ? 18 : 12); if (!l.length) return '<div class="dr-nada">Ninguna obra de la zona empezada ni programada.</div>';
    const rowH = compu ? 32 : 40, nameW = compu ? 160 : 0, L = nameW + 4, R = compu ? 96 : 8, top = 24, hh = top + l.length * rowH + 16, iw = w - L - R;
    const fechas = l.map((o) => o.ini).concat(l.map((o) => o.prev)).concat(l.map((o) => o.proy)).concat([D.h, D.C.plazo]).filter(Boolean).sort();
    const a0 = mas(fechas[0], -5), a1 = [mas(fechas[fechas.length - 1], 7), mas(D.C.plazo || D.h, 120)].sort()[0];
    const x = (f) => L + Math.max(0, Math.min(1, (deIso(f) - deIso(a0)) / Math.max(1, deIso(a1) - deIso(a0)))) * iw;
    let s = `<svg class="dr-chart" viewBox="0 0 ${w} ${hh}" role="img" aria-label="Programación de las obras: avance y fecha prevista" ${FONT}>`;
    s += meses(deIso(a0), deIso(a1), (f, tx) => `<line x1="${r1(x(f))}" x2="${r1(x(f))}" y1="${top - 6}" y2="${hh - 14}" stroke="rgba(40,40,94,.08)"/>` + T_(x(f) + 3, 12, 9.5, tx, `fill="#6E7C93" ${MONO}`));
    if (D.C.plazo) s += `<line x1="${r1(x(D.C.plazo))}" x2="${r1(x(D.C.plazo))}" y1="${top - 8}" y2="${hh - 14}" stroke="#0D1424" stroke-opacity=".4" stroke-dasharray="3 3"/>` + T_(x(D.C.plazo) - 3, hh - 1, 9.5, "plazo " + dm(D.C.plazo), 'text-anchor="end" fill="#0D1424" font-weight="700"');
    s += `<line x1="${r1(x(D.h))}" x2="${r1(x(D.h))}" y1="${top - 8}" y2="${hh - 14}" stroke="#1E6F91" stroke-width="1.5"/>` + T_(x(D.h) + 3, 12, 9.5, "hoy", 'fill="#1E6F91" font-weight="700"');
    l.forEach((o, i) => {
      const e = EST[o.est], yb = top + i * rowH + (compu ? 10 : 22), bh = 10, xa = x(o.ini || D.h), xe = x(o.proy || o.prev || D.h);
      const lado = o.fin ? "100% · " + dm(o.proy) : o.est === "sinfecha" ? o.a + "% · sin fecha prevista" : o.a + "% · " + (o.dif > 0 ? "+" + o.dif + " días" : o.dif < 0 ? o.dif + " días" : "justo");
      if (compu) s += T_(4, yb + 9, 12, esc(o.n.slice(0, 22)), 'fill="#0D1424" font-weight="700"');
      else s += T_(L, yb - 6, 11.5, esc(o.n.slice(0, 30)), 'fill="#0D1424" font-weight="700" stroke="#F7FAFC" stroke-width="4" paint-order="stroke"') + T_(w - R, yb - 6, 10.5, lado, `text-anchor="end" ${MONO} fill="${e.tx}" font-weight="700"`);
      s += `<rect x="${r1(xa)}" y="${yb}" width="${r1(Math.max(4, xe - xa))}" height="${bh}" rx="5" fill="${e.bg}" stroke="${e.c}" stroke-opacity=".5"${o.estimada || o.est === "sinfecha" ? ' stroke-dasharray="3 2"' : ""}/>`;
      if (o.a > 0) s += `<rect x="${r1(xa)}" y="${yb}" width="${r1(Math.max(6, (xe - xa) * o.a / 100))}" height="${bh}" rx="5" fill="${e.c}"><title>${esc(o.n)}: ${o.a}%</title></rect>`;
      if (o.prev && !o.fin) { const xf = x(o.prev); s += `<path d="M${r1(xf)} ${yb - 4}V${yb + bh + 4}" stroke="#0D1424" stroke-width="1.6"/><path d="M${r1(xf)} ${yb - 4}h7l-2 3 2 3h-7z" fill="#0D1424"><title>Fecha prevista ${dmy(o.prev)}</title></path>`; }
      if (compu) s += T_(w - 2, yb + 9, 11, o.a + "%", `text-anchor="end" ${MONO} fill="#0D1424" font-weight="700"`) + T_(w - 44, yb + 9, 10.5, o.fin ? "✓" : o.est === "sinfecha" ? "s/f" : (o.dif > 0 ? "+" + o.dif + " d" : o.dif < 0 ? o.dif + " d" : "0 d"), `text-anchor="end" ${MONO} fill="${e.tx}" font-weight="700"`);
    });
    return s + "</svg>";
  }

  // ============================================================================ pantalla
  const ICO = (k, s) => intentar(() => V.ic(k, 1.6, "v5-ic " + (s || "s18")), "");
  const badge = (est, txt) => `<span class="dr-badge" style="background:${EST[est].bg};color:${EST[est].tx}">${esc(txt || EST[est].t)}</span>`;
  const sem = (c, t) => `<span class="dr-sem ${c}"><i></i>${esc(t)}</span>`;
  function saludo() { const h = new Date().getHours(); return h < 13 ? "Buen día" : h < 20 ? "Buenas tardes" : "Buenas noches"; }
  function numeroDia(D) {
    const pct = D.ritmo > 0 ? (D.hoyK / D.ritmo) * 100 : 0, esc2 = Math.max(130, pct + 5);
    return `<div class="dr-ndia" role="group" aria-label="El número del día"><div class="dr-lbl dr-lbl-c">El número del día</div><div class="dr-r"><div class="dr-big">${esc(fN(D.hoyK, D.hoyK < 10 ? 1 : 0))}<small>K hoy</small></div><div class="dr-lado">ayer <b>${esc(fN(D.ayerK, D.ayerK < 10 ? 1 : 0))} K</b></div></div>
<div class="dr-meter"><i style="width:${Math.min(100, (pct / esc2) * 100).toFixed(1)}%"></i>${D.ritmo > 0 ? `<u style="left:${((100 / esc2) * 100).toFixed(1)}%"></u>` : ""}</div>
<div class="dr-meter-l"><span>${D.ritmo > 0 ? `<b>${esc(fN(pct, 0))}%</b> del ritmo que hace falta` : "Sin plazo: cargá la fecha del acta de inicio"}</span><span>${D.ritmo > 0 ? `meta <b>${esc(fN(D.ritmo, 0))} K/día</b>` : ""}</span></div>${D.hoyK > D.hoyKc ? `<div class="dr-est-n">${esc(fN(D.hoyK - D.hoyKc, 1))} K mandados por la cuadrilla, sin cerrar (estimado)</div>` : ""}</div>`;
  }
  function heroHtml(D, enHoja) {
    const ahora = new Date(), nb = V.nombreCorto(), avN = V.avisosSinLeer(), P = plataDatos(), E = equipo(D);
    const dif = D.difDias, difTx = dif == null ? "—" : dif > 999 ? "+999 d" : (dif > 0 ? "+" : "") + dif + " d";
    const top = `<div class="dr-top">${enHoja ? '<button type="button" class="dr-red" data-dr="cerrar" aria-label="Cerrar">✕</button>' : `<button type="button" class="dr-red" data-dr="menu" aria-label="Menú">${ICO("menu", "s22")}</button>`}<div class="dr-logo"><img src="${(window.__inicioPro && window.__inicioPro.LOGO) || ""}" alt="EMA Servicios"><small>Dirección</small></div>${enHoja ? '<span class="dr-red dr-ph" aria-hidden="true"></span>' : `<button type="button" class="dr-red" data-dr="avisos" aria-label="Avisos">${ICO("campana", "s22")}${avN ? `<span class="dr-bd">${avN > 9 ? "9+" : avN}</span>` : ""}</button>`}</div>`;
    const sal = `<div class="dr-sal"><div class="dr-eyebrow">— ${DIAS[ahora.getDay()]} ${ahora.getDate()} de ${MESES[ahora.getMonth()]} · ${pad(ahora.getHours())}:${pad(ahora.getMinutes())}</div><h1>${esc(saludo())}${nb ? `, <b>${esc(nb)}</b>` : ""}</h1><div class="dr-zona">${esc(D.z.label || "Nuestra zona")} · ${esc(fN(D.z.plazas, 0))} plazas · ${esc(fN(D.z.modulos, 0))} módulos${D.C.plazo ? ` · plazo ${esc(dmy(D.C.plazo))}${D.C.estimada ? " (estimado)" : ""}` : ""}</div></div>`;
    const k3 = `<div class="dr-hkpi"><div><b>${esc(fN(D.z.pct, 1))}%</b><span>del contrato${D.pctPlan != null ? `<br>(plan ${esc(fN(D.pctPlan, 1))}%)` : ""}</span></div><div class="${dif > 0 ? "rj" : ""}"><b>${esc(difTx)}</b><span>a este ritmo,<br>contra el plazo</span></div><div><b>${esc(fN(D.z.terminadas, 0))}/${esc(fN(D.z.plazas, 0))}</b><span>plazas<br>terminadas</span></div></div>`;
    const k6 = `<div class="dr-k6">${[[fN(D.hoyK, 0), "K", `hoy (meta ${fN(D.ritmo, 0)})`], [fN(D.z.pct, 1), "%", D.pctPlan != null ? `contrato · plan ${fN(D.pctPlan, 1)}%` : "del contrato"], [dif == null ? "—" : (dif > 0 ? "+" : "") + dif, "días", D.proy ? `termina ${dm(D.proy)}` : "sin ritmo todavía"], [P.R ? fN(P.R.sinIva / 1e6, 1) : "—", "M", "certificable " + MESES[new Date().getMonth()].slice(0, 3)], [P.margen == null ? "—" : fN(P.margen, 1), "%", "margen"], [String(E.gente), E.nom ? "/" + E.nom : "", "personas en obra"]].map(([b, u, s], i) => `<div class="${i === 2 && dif > 0 ? "rj" : i === 4 && P.margen != null && P.margen < 0 ? "rj" : i === 4 ? "vd" : ""}"><b>${esc(b)}<small>${esc(u)}</small></b><span>${esc(s)}</span></div>`).join("")}</div>`;
    return `${top}<div class="dr-heroA">${sal}<div class="dr-hnd">${numeroDia(D)}</div><div class="dr-h3">${k3}</div></div>${k6}`;
  }
  const card = (id, lbl, tit, extra, cuerpo, cls) => `<div class="dr-lbl">${esc(lbl)}</div><div class="dr-ch"><h2>${tit}</h2>${extra || ""}</div>${cuerpo}`;
  function atencionHtml(D) {
    const l = atencion(D);
    if (!l.length) return card("", "Para atender", "Necesita tu atención", "", '<div class="dr-nada">Nada urgente: todo en orden. 👌</div>');
    return card("", "Para atender", `Necesita tu atención <em>· ${l.length}</em>`, "", l.map((a, i) => `<div class="dr-at"><span class="dr-o" style="background:${EST[a.c].bg};color:${EST[a.c].tx}">${ICO(a.c === "atrasada" ? "alerta" : "reloj", "s18")}</span><span class="dr-tx"><b>${esc(a.t)}</b><small>${esc(a.s || "")}</small></span><button type="button" class="dr-ir" data-dr="at:${i}">${a.ir === "material" ? "Ver pedido" : a.ir === "ordenes" ? "Ver órdenes" : a.ir === "prog" ? "Ver plan" : "Ver obra"} ›</button></div>`).join(""));
  }
  function barrasHtml(D) {
    return card("", "Últimos 14 días", "Módulos por día", `<span class="dr-mini">prom. 7 días <b class="dr-mono">${esc(fN(D.prom7, 0))}</b></span>`, `${barras14(D, 340, 180)}<div class="dr-ley"><span><i class="bar" style="background:#28285E"></i>Hoy</span><span><i class="bar" style="background:#1E6F91"></i>Ayer</span><span><i class="bar dr-iest"></i>Mandado sin cerrar (estimado)</span><span><i></i>Ritmo necesario</span></div><div class="dr-sub">Módulos (K) de las órdenes cerradas, por la fecha de la orden, solo de nuestra zona y sin provisiones (como la certificación).${D.ritmo > 0 ? ` Hacen falta <b class="dr-mono">${esc(fN(D.ritmo, 0))} K</b> por día hábil (lunes a viernes, a confirmar) hasta el ${esc(dm(D.C.plazo))}.` : ""}</div>`);
  }
  function curvaHtml(D) {
    const C = D.C;
    const proy = D.proy && C.plazo ? `A este ritmo terminamos el <b class="dr-mono">${esc(dmy(D.proy))}</b>${D.difDias ? `, <b class="${D.difDias > 0 ? "dr-rj" : "dr-vd"}">${Math.abs(D.difDias)} días ${D.difDias > 0 ? "después" : "antes"}</b> del plazo` : ", justo en el plazo"} (${esc(dmy(C.plazo))}).` : D.falta <= 0 ? "La zona está completa." : "Todavía no hay ritmo para proyectar (faltan órdenes cerradas).";
    const ini = C.sinDato ? "" : C.estimada ? `<div class="dr-aviso" role="status">📅 Inicio del contrato <b>estimado</b> (${esc(dmy(C.ini))}, la primera orden de la zona) · cargá la fecha del acta de inicio${veOficina() && intentar(() => PERMISOS.esAdmin(), false) ? " en Avance de obra › Itemizado › «Nuestra zona»" : " (lo hace Administración)"}.</div>` : `<div class="dr-mini">Acta de inicio ${esc(dmy(C.ini))} · plazo ${C.meses} meses.</div>`;
    return card("", "Contrato · " + (D.z.label || "zona"), "Curva S", `<span class="dr-mini dr-mono">${esc(fN(D.z.k, 0))} / ${esc(fN(D.z.modulos, 0))} K</span>`, `${curvaS(D, 340, 210)}<div class="dr-ley"><span><i></i>Real</span><span><i class="pl"></i>Plan lineal (a confirmar)</span><span><i class="py"></i>A este ritmo</span></div><div class="dr-sub">${proy}</div>${D.sinFecha > 0.5 ? `<div class="dr-mini">${esc(fN(D.sinFecha, 0))} K cargados a mano sin fecha: van al principio de la curva.</div>` : ""}${ini}`);
  }
  function hechoHtml(D) {
    const f = st.seg === "ayer" ? D.ayer : D.h, filas = [];
    const idsHoy = {}; D.hoyOts.forEach((o) => { idsHoy[String(o.plazaId)] = 1; });
    Object.keys(D.porObraDia).map((k) => D.porObraDia[k]).filter((x) => x.f === f).forEach((x) => {
      const tareas = {}; let ver = true;
      x.ots.forEach((o) => { const H = hechoOt(o); if (!H.ver) ver = false; Object.keys(H.r).forEach((k) => { tareas[k] = (tareas[k] || 0) + H.r[k]; }); });
      const gente = {}; x.ots.forEach((o) => arr(o.personal).forEach((p) => { const n = String((p && p.nombre) || "").trim(); if (n) gente[n.toLowerCase()] = 1; }));
      const veh = x.ots.map((o) => arr(o.vehiculos).map((v) => v && v.nombre).filter(Boolean).join(", ")).filter(Boolean).join(", ");
      const ob = obras().find((o) => String(o.id) === x.id);
      filas.push({ id: x.id, n: ob ? nombre(ob) : nombre({ nombre: x.ots[0].plazaNombre }), k: x.k + x.est, est: x.est > 0, q: Object.keys(tareas).map((k) => unTxt(k, tareas[k])).join(" · "), gente: Object.keys(gente).length, veh, ver, foto: f === D.h ? fotoDe(x.id) : null });
    });
    filas.sort((a, b) => b.k - a.k);
    const max = Math.max(1, ...filas.map((x) => x.k)), tot = filas.reduce((s, x) => s + x.k, 0);
    const seg = `<div class="dr-seg" role="tablist"><button type="button" role="tab" class="${st.seg !== "ayer" ? "on" : ""}" aria-selected="${st.seg !== "ayer"}" data-dr="seg:hoy">Hoy · ${esc(fN(D.hoyK, 0))} K</button><button type="button" role="tab" class="${st.seg === "ayer" ? "on" : ""}" aria-selected="${st.seg === "ayer"}" data-dr="seg:ayer">${esc(D.ayer === mas(D.h, -1) ? "Ayer" : DIAS[deIso(D.ayer).getDay()])} · ${esc(fN(D.ayerK, 0))} K</button></div>`;
    const cuerpo = filas.length ? filas.map((r, i) => `<div class="dr-ob${r.foto || (f === D.h && idsHoy[r.id]) ? "" : " dr-nof"}">${r.foto ? `<button type="button" class="dr-foto" data-dr="foto:${esc(r.id)}" aria-label="Foto del día de ${esc(r.n)}"><img alt="" src="${esc(r.foto.mini)}"></button>` : f === D.h && idsHoy[r.id] ? '<span class="dr-foto dr-sinf" title="Todavía sin fotos hoy">📷</span>' : ""}<div class="dr-obt"><b><i class="dr-nn">${i + 1}</i>${esc(r.n)}</b><small>${esc(r.q || (f === D.h ? "todavía no mandaron nada" : "sin detalle"))}</small><small class="dr-mini">${r.gente} ${r.gente === 1 ? "persona" : "personas"}${r.veh ? " · " + esc(r.veh) : ""}${r.ver ? "" : " · sin cerrar"}</small></div><div class="dr-k">${esc(fN(r.k, 1))}<small> K${r.est ? "*" : ""}</small></div><div class="dr-kbar"><i style="width:${((r.k / max) * 100).toFixed(0)}%"></i></div></div>`).join("") : `<div class="dr-nada">${f === D.h ? "Hoy no hay órdenes." : "Ese día no hubo órdenes."}</div>`;
    return card("", `${f === D.h ? "Hoy" : "Ayer"} · ${DIAS[deIso(f).getDay()].toLowerCase()} ${dm(f)}`, "Qué se hizo", `<span class="dr-mini dr-mono">${esc(fN(tot, 1))} K</span>`, seg + cuerpo + (filas.some((r) => r.est) ? '<div class="dr-mini">* incluye lo que mandó la cuadrilla y todavía no se cerró (estimado con la misma cuenta del cierre).</div>' : "") + (f === D.h ? '<div class="dr-mini">Tocá la foto para verla grande (la última de hoy de cada obra).</div>' : ""));
  }
  function mapaHtml(D, E) {
    const cu = E.cu || [];
    const lista = cu.map((c, i) => `<div><i class="dr-nn">${i + 1}</i><span><b>${esc(c.ob ? nombre(c.ob) : c.o.plazaNombre || "")}</b><small>${c.gente.length} pers.${c.veh && c.veh.nombre ? " · " + esc(c.veh.nombre) : ""}${c.pos ? " · en vivo" : ""}</small></span></div>`).join("");
    return `<div class="dr-ch"><h2>Dónde se trabaja hoy</h2><span class="dr-mini">${cu.length} ${cu.length === 1 ? "obra" : "obras"} · ${E.gente} personas · ${E.vehU} vehículos</span></div><div id="drMapa" class="dr-mapa" aria-label="Mapa de las obras de hoy"></div><div class="dr-mlist">${lista || '<div class="dr-nada">Hoy no hay órdenes.</div>'}</div>`;
  }
  function equipoHtml(D, E) {
    const aus = arr(E.aus), sinT = arr(E.sinT);
    return card("", "Equipo hoy", "Gente y vehículos", "", `<div class="dr-eq"><div><b>${E.gente}</b><span>en obra<br>hoy</span></div><div class="${sinT.length ? "am" : ""}"><b>${sinT.length}</b><span>sin<br>tarea</span></div><div><b>${aus.length}</b><span>${aus.length === 1 ? "ausente" : "ausentes"}</span></div><div><b>${E.vehU}<small>/${E.vehT || "—"}</small></b><span>vehículos<br>en uso</span></div></div>${sinT.length || aus.length ? `<div class="dr-mini" style="margin-top:8px">${sinT.length ? "Sin tarea: " + esc(sinT.slice(0, 6).map((p) => String(p.nombre || p).split(" ")[0]).join(", ")) : ""}${sinT.length && aus.length ? " · " : ""}${aus.length ? "Ausentes: " + esc(aus.slice(0, 5).map((a) => String(a.persona || "").split(" ")[0] + (a.motivo ? " (" + a.motivo + ")" : "")).join(", ")) : ""}</div>` : ""}`);
  }
  function climaHtml() {
    const A = avisosClima();
    if (A.sin) return card("", "Clima · Córdoba", "Clima contra lo planeado", "", `<div class="dr-nada">${st.climaPidiendo ? "Buscando el pronóstico…" : "Sin pronóstico (sin señal o el servicio no contestó). Lo demás anda igual."}</div>`);
    const ic = (d) => (d.mm >= LLUVIA_MM || d.pct >= LLUVIA_PCT ? "🌧" : d.pct >= 40 ? "🌦" : "☀");
    const dias = `<div class="dr-clima">${A.dias.map((d) => `<div class="${d.mm >= LLUVIA_MM || d.pct >= LLUVIA_PCT ? "ll" : ""}${d.viento >= VIENTO ? " vi" : ""}"><span>${esc(d.f === hoy() ? "hoy" : DIAS3[deIso(d.f).getDay()])}</span><i aria-hidden="true">${ic(d)}</i><b>${esc(fN(d.max, 0))}°</b><small>${esc(fN(d.mm, d.mm > 0 && d.mm < 10 ? 1 : 0))} mm</small><small>${esc(fN(d.pct, 0))} %</small><small>${esc(fN(d.viento, 0))} km/h</small></div>`).join("")}</div>`;
    const av = A.avisos.length ? A.avisos.map((a) => `<div class="dr-clav ${a.tipo}" role="status">${esc(a.t)}</div>`).join("") : '<div class="dr-mini">Nada planeado choca con el pronóstico. 👌</div>';
    return card("", "Clima · Córdoba · 7 días", "Clima contra lo planeado", "", dias + av + `<div class="dr-mini">Solo avisa (no cambia nada). Lluvia = ${LLUVIA_MM} mm o ${LLUVIA_PCT} % de probabilidad, viento fuerte = ${VIENTO} km/h (a confirmar). Contra las órdenes emitidas y la orden sugerida.</div>`);
  }
  function progHtml(D) {
    const compu = window.innerWidth > 900, tabs = compu ? [["sem", "Semáforo"], ["pistas", "Pistas"], ["cal", "Calendario"]] : [["pistas", "Por obra"], ["cal", "Calendario"]];
    let t = st.prog; if (!tabs.some((x) => x[0] === t)) t = tabs[0][0];
    const tb = `<div class="dr-tabs" role="tablist">${tabs.map(([k, tx]) => `<button type="button" role="tab" class="${k === t ? "on" : ""}" aria-selected="${k === t}" data-dr="prog:${k}">${tx}</button>`).join("")}</div>`;
    let c = "";
    if (t === "pistas") c = `<div class="dr-cel">${pistas(D, 340, false)}</div><div class="dr-pc">${pistas(D, 880, true)}</div><div class="dr-ley"><span><i class="sq" style="background:#34C759"></i>A tiempo</span><span><i class="sq" style="background:#FF9F0A"></i>En riesgo</span><span><i class="sq" style="background:#FF3B30"></i>Atrasada</span><span><i class="sq" style="background:#8792A6"></i>Sin fecha prevista</span><span>⚑ Fecha prevista</span></div><div class="dr-mini">La barra va del inicio al final que se proyecta con el ritmo de cada obra (punteada = estimada). Si pasa la bandera, va tarde.</div>`;
    else if (t === "cal") c = calendarioHtml(D);
    else c = semaforoHtml(D);
    const ter = D.obras.filter((o) => o.fin).length, curso = D.obras.filter((o) => !o.fin && o.a > 0).length;
    return card("", "Programación", "¿Cuándo termina cada obra?", `<button type="button" class="dr-link" data-dr="v:avance">Avance ›</button>`, tb + c + `<div class="dr-mini" style="margin-top:8px">${ter} terminadas · ${curso} en obra · <b class="dr-rj">${D.sinProgramar} sin fecha prevista</b> de ${esc(fN(D.z.plazas, 0))}. La fecha prevista sale del Gantt de la obra o de su fecha estimada; sin eso, la estima el ritmo de la obra («estimada»).</div>`);
  }
  function calendarioHtml(D) {
    const h = D.h, d0 = deIso(h), lun = mas(h, -((d0.getDay() + 6) % 7)), sab = mas(lun, 5), lun2 = mas(lun, 7), sab2 = mas(lun2, 5);
    const vencidas = { t: "Ya vencidas", s: "antes del " + dm(lun), l: [] }, cols = [{ t: "Esta semana", s: dm(lun) + "–" + dm(sab), l: [] }, { t: "Próxima", s: dm(lun2) + "–" + dm(sab2), l: [] }], meses = {};
    D.obras.forEach((o) => {
      const f = o.fin ? o.proy : o.prev || o.proy; if (!f) return;
      const item = { o, f, est: !o.prev && !o.fin };
      if (o.fin) { if (f >= lun && f <= sab) cols[0].l.push(item); return; }
      if (f < lun) vencidas.l.push(item); else if (f < lun2) cols[0].l.push(item); else if (f <= sab2) cols[1].l.push(item);
      else { const m = f.slice(0, 7); (meses[m] = meses[m] || []).push(item); }
    });
    Object.keys(meses).sort().forEach((m) => cols.push({ t: MESES[+m.slice(5, 7) - 1][0].toUpperCase() + MESES[+m.slice(5, 7) - 1].slice(1), s: D.C.plazo && D.C.plazo.slice(0, 7) === m ? "plazo " + dm(D.C.plazo) : m.slice(0, 4), l: meses[m] }));
    if (vencidas.l.length) cols.unshift(vencidas);
    const sinF = D.obras.filter((o) => !o.fin && !o.prev && !o.proy);
    return `<div class="dr-cal">${cols.map((c) => `<div class="dr-calc"><div class="dr-calh"><b>${esc(c.t)}</b><small>${esc(c.s)}</small><span>${c.l.length}</span></div>${c.l.length ? c.l.sort((a, b) => a.f.localeCompare(b.f)).map((x) => `<button type="button" class="dr-calo" data-dr="obra:${esc(x.o.id)}" style="border-left-color:${EST[x.o.est].c}"><b>${esc(x.o.n)}${x.o.fin ? " ✓" : ""}</b><small>${esc(dm(x.f))}${x.est ? " · estimada" : ""} · ${x.o.a}%</small></button>`).join("") : '<div class="dr-mini">—</div>'}</div>`).join("")}</div>${sinF.length ? `<div class="dr-mini">Sin fecha prevista ni ritmo todavía: ${esc(sinF.slice(0, 8).map((o) => o.n).join(", "))}${sinF.length > 8 ? "…" : ""}</div>` : ""}`;
  }
  function semaforoHtml(D) {
    const P = plataDatos(), sup = intentar(() => window.__supervisor.hallazgos(), []) || [];
    const filas = D.obras.map((o) => {
      const plazo = o.fin ? ["vd", "terminó " + dm(o.proy)] : o.est === "sinfecha" ? ["gr", "sin fecha"] : o.est === "atrasada" ? ["rj", (o.dif > 0 ? "+" + o.dif : "") + " días"] : o.est === "riesgo" ? ["am", "+" + o.dif + " días"] : ["vd", "bien"];
      const m = P.mat && P.mat.porObra[o.id], mat = !m ? ["gr", "sin cómputo"] : m.rj ? ["rj", m.rj + " sin explicar"] : m.am ? ["am", m.am + " para mirar"] : ["vd", "bien"];
      const ff = sup.filter((x) => x.cat === "Fotos" && String(x.obraId) === o.id).length, gr = intentar(() => window.__obraGps.grupos().filter((g) => String(g.suya && g.suya.id) === o.id).reduce((s, g) => s + g.fotos.length, 0), 0) || 0;
      const fotos = ff || gr ? ["am", (gr || ff) + " dudosa" + ((gr || ff) > 1 ? "s" : "")] : ["vd", "bien"];
      const dE = intentar(() => window.__docObra.estado(o.o), null), DN = { carpeta: "carpeta", conforme: "conforme", pat: "PAT", cert: "certificado" };
      const pap = !dE ? ["gr", "—"] : dE.completa ? ["vd", "completa"] : o.fin ? ["rj", "falta " + dE.falta.map((k) => DN[k] || k).join(", ")] : o.a >= 1 ? ["am", "falta " + dE.falta.length] : ["gr", "—"];
      const peor = [plazo, mat, fotos, pap].some((x) => x[0] === "rj") ? 0 : [plazo, mat, fotos, pap].some((x) => x[0] === "am") ? 1 : 2;
      return { o, plazo, mat, fotos, pap, peor };
    }).sort((a, b) => a.peor - b.peor);
    if (!filas.length) return '<div class="dr-nada">Ninguna obra de la zona empezada ni programada.</div>';
    return `<div class="dr-semt" role="table" aria-label="Semáforo por obra"><div class="dr-semr dr-semh" role="row"><span role="columnheader">Obra</span><span role="columnheader">Avance</span><span role="columnheader">Prevista</span><span role="columnheader">A este ritmo</span><span role="columnheader">Plazo</span><span role="columnheader">Material</span><span role="columnheader">Fotos</span><span role="columnheader">Papeles</span></div>${filas.map((f) => `<button type="button" class="dr-semr" role="row" data-dr="obra:${esc(f.o.id)}"><span role="cell"><b>${esc(f.o.n)}</b><small>${f.o.ID ? "ID " + esc(f.o.ID) : ""}</small></span><span role="cell"><i class="dr-av"><i style="width:${Math.max(2, f.o.a)}%;background:${EST[f.o.est].c}"></i></i><b class="dr-mono">${f.o.a}%</b></span><span role="cell" class="dr-mono">${f.o.prev ? esc(dm(f.o.prev)) : "—"}</span><span role="cell" class="dr-mono">${f.o.proy ? esc(dm(f.o.proy)) + (f.o.estimada ? "*" : "") : "—"}</span><span role="cell">${sem(f.plazo[0], f.plazo[1])}</span><span role="cell">${sem(f.mat[0], f.mat[1])}</span><span role="cell">${sem(f.fotos[0], f.fotos[1])}</span><span role="cell">${sem(f.pap[0], f.pap[1])}</span></button>`).join("")}</div><div class="dr-mini">Primero las que tienen algo en rojo. * = estimada con el ritmo de la obra. Papeles = documentación (carpeta EPEC, conforme a obra, PAT y certificado).</div>`;
  }
  function plataHtml() {
    const P = plataDatos(), m = (x) => MESES[+String(x).slice(5, 7) - 1];
    const k = (b, s, cls) => `<div class="dr-kpi"><b class="${cls || ""}">${b}</b><span>${s}</span></div>`;
    const bar = (t, v, max, col, nota) => `<div class="dr-pb"><div><span>${esc(t)}</span><b class="dr-mono">${esc(millones(v))}</b></div><div class="dr-pbb"><i style="width:${max > 0 ? Math.min(100, (v / max) * 100).toFixed(1) : 0}%;background:${col}"></i></div>${nota ? `<div class="dr-mini">${nota}</div>` : ""}</div>`;
    const mt = P.mat || { ent: 0, us: 0 };
    return card("", "Plata · sin IVA", "Certificado, gasto y material", `<button type="button" class="dr-link" data-dr="cert">Certificación ›</button>`, `<div class="dr-kpis">${k(P.ultimo ? esc(millones(P.ultimo.sinIva)) : "—", P.ultimo ? "Certificado " + esc(m(P.ultimo.m)) + " (cerrado)" : "Todavía no hay meses cerrados")}${k(P.R ? esc(millones(P.R.sinIva)) : "—", esc((P.R && P.R.txt) || m(P.M)) + " hasta hoy" + (P.R && !P.R.cerrado ? " (borrador)" : ""))}${k(esc(millones(P.acum)), "Acumulado certificado" + (P.contrato > 0 ? " · " + esc(fN((P.acum / P.contrato) * 100, 1)) + "% de " + esc(millones(P.contrato)) : ""))}${k(P.margen == null ? "—" : esc(fN(P.margen, 1)) + "<small>%</small>", "Margen (certificado − gasto)", P.margen != null && P.margen < 0 ? "dr-rj" : "dr-vd")}</div>
${bar("Certificado (obras con gastos)", P.certTot, Math.max(P.certTot, P.gastTot), "#28285E")}${bar("Gasto", P.gastTot, Math.max(P.certTot, P.gastTot), "#1E6F91", "mano de obra, material, combustible y generales (Gastos de obra)")}
<div class="dr-lbl" style="margin-top:14px">Material</div>${bar("Entregado a las obras", mt.ent, Math.max(mt.ent, mt.us), "#28285E")}${bar("Usado según el avance", mt.us, Math.max(mt.ent, mt.us), "#1E6F91", `En obra sin usar: <b class="dr-mono">${esc(millones(Math.max(0, mt.ent - mt.us)))}</b>${mt.ent > 0 ? " (" + esc(fN((Math.max(0, mt.ent - mt.us) / mt.ent) * 100, 1)) + "%)" : ""} · último precio de las entradas${mt.sinP ? ` · ${mt.sinP} sin precio` : ""}`)}`);
  }
  const CHIPS = ["¿Cómo vamos?", "Resumen de la semana", "¿Qué obra está más atrasada?", "¿Cuánto certificamos?"];
  function iaHtml() {
    const ok = intentar(() => typeof window.__iaPuede == "function" && window.__iaPuede(), false);
    if (!ok) return "";
    return `<div class="dr-ch"><h2>Preguntale al asistente</h2></div><div class="dr-ia"><button type="button" class="dr-campo" data-dr="ia">${ICO("ia", "s18")}Preguntale al asistente…</button></div><div class="dr-chips">${CHIPS.map((c, i) => `<button type="button" class="dr-chip" data-dr="chip:${i}">${esc(c)}</button>`).join("")}</div>${esDir() ? '<div class="dr-mini">Con tu usuario te contesta todo, pero no cambia nada: si pedís un cambio, te ofrece dejárselo anotado a la oficina.</div>' : ""}`;
  }
  function reglasHtml() { return st.reglas === "viejas" ? `<div class="dr-aviso rj" role="status">⚠ Faltan publicar las reglas de Firebase de la v155: con tu usuario todavía no se ven las quincenas cerradas, la ubicación en vivo y algunas cosas más. Ya le avisamos a Administración.</div>` : ""; }

  // ---------- armar y pintar (cada tarjeta por separado: el mapa no se rearma)
  const SECC = ["drAt", "drBar", "drCurva", "drHoy", "drMapaC", "drEq", "drClima", "drProg", "drPlata", "drIa"];
  function asegurar(padre, enHoja) {
    let r = $("iniDir");
    if (r && r.parentNode !== padre) { r.remove(); r = null; st.mapa = null; st.capa = null; }
    if (!r) {
      r = document.createElement("div"); r.id = "iniDir"; r.className = "no-print" + (enHoja ? " dr-enhoja" : "");
      r.innerHTML = '<section class="dr-hero" id="drHero"></section><div id="drReglas"></div><div class="dr-wrap"><div class="dr-grid">' + SECC.map((id) => `<div class="dr-card ${id}" id="${id}"></div>`).join("") + '</div><div class="dr-nota">Dirección · solo para mirar: los botones llevan a cada pantalla. Todo sale de lo que la app ya tiene.</div></div>';
      if (padre.id === "viewInicio") padre.insertBefore(r, padre.firstChild); else padre.appendChild(r);
      st.h = {}; st.nuevo = true;
    }
    return r;
  }
  function poner(id, h) { const e = $(id); if (!e || st.h[id] === h) return false; e.innerHTML = h; st.h[id] = h; return true; }
  function pintarEn(padre, enHoja) {
    const r = asegurar(padre, enHoja); r.style.display = "";
    const D = datos(), E = equipo(D);
    poner("drHero", heroHtml(D, enHoja));
    poner("drReglas", reglasHtml());
    poner("drAt", atencionHtml(D));
    poner("drBar", barrasHtml(D));
    poner("drCurva", curvaHtml(D));
    poner("drHoy", hechoHtml(D));
    const mh = mapaHtml(D, E), mc = $("drMapaC");
    if (mc && st.h.drMapaC !== mh) { const div = $("drMapa"); mc.innerHTML = mh; st.h.drMapaC = mh; if (div && st.mapa) { const nuevo = $("drMapa"); nuevo.parentNode.replaceChild(div, nuevo); } }
    poner("drEq", equipoHtml(D, E));
    poner("drClima", climaHtml());
    poner("drProg", progHtml(D));
    poner("drPlata", plataHtml());
    const ih = iaHtml(); poner("drIa", ih); const ie = $("drIa"); ie && (ie.style.display = ih ? "" : "none");
    mapa(E);
    pedirFotos(false);
    if (st.nuevo) { st.nuevo = false; probarReglas(); }
  }
  // ---------- el mapa chico (Leaflet de la app, sin capas extra, sin escuchas)
  function mapa(E) {
    const el = $("drMapa"); if (!el || !window.L || !L.map) { if (el && !window.L) el.innerHTML = '<div class="dr-nada">El mapa se ve cuando carga (con señal).</div>'; return; }
    if (!st.mapa) {
      try { st.mapa = L.map(el, { zoomControl: false, attributionControl: false, keyboard: false, scrollWheelZoom: false }).setView([-31.42, -64.18], 12); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(st.mapa); st.capa = L.layerGroup().addTo(st.mapa); } catch (e) { st.mapa = null; return; }
    }
    const cu = E.cu || [], pts = [];
    try {
      st.capa.clearLayers();
      cu.forEach((c, i) => {
        const o = c.ob; if (!o || o.lat == null || !isFinite(+o.lat)) return;
        const ll = [+o.lat, +o.lng]; pts.push(ll);
        L.marker(ll, { icon: L.divIcon({ className: "dr-pin", html: `<span>${i + 1}</span><em>${c.gente.length}</em>`, iconSize: [26, 26], iconAnchor: [13, 13] }), keyboard: false }).addTo(st.capa).bindTooltip(esc(nombre(o)) + " · " + c.gente.length + " pers." + (c.veh && c.veh.nombre ? " · " + esc(c.veh.nombre) : ""));
        if (c.pos && isFinite(+c.pos.lat)) { L.circleMarker([+c.pos.lat, +c.pos.lng], { radius: 6, color: "#fff", weight: 2, fillColor: "#34C759", fillOpacity: 1 }).addTo(st.capa); pts.push([+c.pos.lat, +c.pos.lng]); }
      });
      if (pts.length > 1) st.mapa.fitBounds(pts, { padding: [24, 24], maxZoom: 15 }); else if (pts.length === 1) st.mapa.setView(pts[0], 15);
      setTimeout(() => { try { st.mapa && st.mapa.invalidateSize(); } catch (e) { } }, 60);
    } catch (e) { }
  }
  // ---------- ¿las reglas de la v155 están publicadas? (solo Dirección; UNA lectura chica)
  function probarReglas() {
    if (!esDir() || Date.now() - st.reglasTs < 30 * 6e4) return;
    st.reglasTs = Date.now();
    let db = null; try { db = firebase.firestore(); } catch (e) { return; }
    db.collection("cierresQuincena").limit(1).get().then(() => { st.reglas = "ok"; }, (e) => {
      if (!(e && /permission/i.test(String(e.code || e.message)))) return;
      st.reglas = "viejas"; pintar();
      const k = "ema.dir.avisoReglas", d = hoy(); let ya = ""; try { ya = localStorage.getItem(k) || ""; localStorage.setItem(k, d); } catch (er) { }
      if (ya === d || !window.__pushAvisos || !window.__pushAvisos.dejarAviso) return;
      const adm = intentar(() => (PERMISOS.lista() || []).filter((u) => u && u.rol === "admin" && u.activo !== false && u.email).map((u) => String(u.email).toLowerCase()), []);
      adm.forEach((em) => { try { Promise.resolve(window.__pushAvisos.dejarAviso({ email: em, titulo: "⚠ Falta publicar las reglas de la v155", cuerpo: "Un usuario de Dirección no puede leer las quincenas ni la ubicación en vivo: falta publicar las reglas de Firebase de la v155 (Reglas_Firestore_v155).", tipo: "reglas", tag: "ema-reglas-v155" })).catch(() => { }); } catch (er) { } });
    });
  }

  // ============================================================================ dónde se muestra
  function modoInicio() { return esDir() && !!window.__fbUser && V.rolListo(); }
  let ultPint = 0;
  function suave() { if (Date.now() - ultPint > 15000) pintar(); }
  function pintar() {
    if (!puedeVer()) return;
    ultPint = Date.now();
    const ov = $("dirOv");
    if (ov && !ov.hidden) { try { pintarEn($("dirOvCuerpo"), true); } catch (e) { console.warn("[dirección]", e); } return; }
    const v = $("viewInicio"); if (!v || v.style.display === "none" || !modoInicio()) return;
    try { pintarEn(v, false); } catch (e) { console.warn("[dirección]", e); }
  }
  // hoja para Administración y Oficina (y quien abra «📊 Dirección»)
  function abrir() {
    if (!puedeVer()) { try { window.mostrarAviso && window.mostrarAviso("🔒 La pantalla de Dirección la ven Dirección, Administración y Oficina.", "error"); } catch (e) { } return false; }
    try { window.cerrarMenuLateral && window.cerrarMenuLateral(); } catch (e) { }
    if (esDir()) { try { window.mostrarVista("inicio"); } catch (e) { } return true; }
    try { window.__tableroDueno && window.__tableroDueno.cerrar(); } catch (e) { }
    let ov = $("dirOv");
    if (!ov) { ov = document.createElement("div"); ov.id = "dirOv"; ov.className = "no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Dirección"); ov.innerHTML = '<button type="button" class="dr-x" data-dr="cerrar" aria-label="Cerrar">✕</button><div id="dirOvCuerpo"></div>'; document.body.appendChild(ov); }
    ov.hidden = false; st.abierto = true; cache = null; st.h = {}; st.nuevo = true;
    document.body.classList.add("dir-abierto");
    pintar();
    setTimeout(() => intentar(() => window.__atras && window.__atras.sync && window.__atras.sync(), null), 30);
    return true;
  }
  function cerrar() { const ov = $("dirOv"); if (ov) ov.hidden = true; st.abierto = false; document.body.classList.remove("dir-abierto"); }
  function irA(fn) { if ($("dirOv") && !$("dirOv").hidden) cerrar(); setTimeout(fn, 30); }
  function irObra(id) { irA(() => { if (id && typeof window.abrirLegajo == "function" && V.ve("obras")) { V.ir("obras"); setTimeout(() => window.abrirLegajo(id), 120); } else V.ir("avance"); }); }
  function chip(t) {
    if (!window.__asistenteAbrir) return;
    window.__asistenteAbrir("");
    setTimeout(() => { try { window.__asistente && window.__asistente.enviar ? window.__asistente.enviar(t) : null; } catch (e) { } }, 250);
  }
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-dr]"); if (!b) return;
    if (!b.closest("#iniDir, #dirOv") && b.dataset.dr !== "abrir") return;
    const a = b.dataset.dr, x = a.indexOf(":") > 0 ? a.slice(a.indexOf(":") + 1) : "";
    e.preventDefault();
    if (a === "abrir") return abrir();
    if (a === "cerrar") return cerrar();
    if (a === "menu") return typeof abrirMenuLateral == "function" && abrirMenuLateral();
    if (a === "avisos") { const c = $("avCampana"); return c && c.click(); }
    if (a === "ia") return window.__asistenteAbrir && window.__asistenteAbrir();
    if (a.indexOf("chip:") === 0) return chip(CHIPS[+x]);
    if (a.indexOf("seg:") === 0) { st.seg = x; return pintar(); }
    if (a.indexOf("prog:") === 0) { st.prog = x; try { localStorage.setItem("ema.dir.prog", x); } catch (er) { } return pintar(); }
    if (a.indexOf("foto:") === 0) return verFoto(x);
    if (a.indexOf("obra:") === 0) return irObra(x);
    if (a.indexOf("v:") === 0) return irA(() => V.ir(x));
    if (a === "cert") return irA(() => { if (!(window.__certMensual && window.__certMensual.abrir())) V.ir("avance"); });
    if (a.indexOf("at:") === 0) {
      const at = atencion(datos())[+x]; if (!at) return;
      if (at.ir === "material") return irA(() => V.irStock("reservas"));
      if (at.ir === "ordenes") return irA(() => (V.ve("parte") ? V.irOrdenes() : V.ir("inicio")));
      if (at.ir === "prog") { const p = $("drProg"); return p && p.scrollIntoView({ block: "start", behavior: "smooth" }); }
      return irObra(at.obraId);
    }
  });
  // accesos para Administración y Oficina
  function accesoHtml() { return puedeVer() && !esDir() ? '<button type="button" class="ie-acc" data-dr="abrir"><span class="ie-ic" style="display:flex;align-items:center;justify-content:center;font-size:22px">📊</span>Dirección</button>' : ""; }
  function tdHtml() { return puedeVer() && !esDir() ? '<button type="button" class="td-cd dr-tdcd" data-dr="abrir"><div class="td-eti">📊 Dirección <span>la pantalla de la gerencia</span></div><div class="td-sub">El número del día, la curva S, la programación de cada obra, la foto del día, el clima y la plata, en una pantalla (solo para mirar).</div></button>' : ""; }
  function menu() {
    let m = $("menuDireccion");
    if (!puedeVer() || esDir()) { m && m.remove(); return; }
    const ini = document.querySelector('#menuLateral [data-vista="inicio"]'); if (!ini || m) return;
    m = document.createElement("button"); m.type = "button"; m.id = "menuDireccion"; m.className = ini.className.replace(/\b(activo|active|on)\b/g, ""); m.setAttribute("data-dr", "abrir");
    m.innerHTML = '<span class="nav-ico">📊</span><span class="nav-txt">Dirección</span>';
    const td = $("menuTableroDueno"); (td || ini).insertAdjacentElement("afterend", m);
  }
  function rolClase() { document.body.classList.toggle("rol-dir", esDir()); }
  // la configuración del contrato (Administración): fecha del acta de inicio y plazo
  function cfgHtml() {
    const P = obj(window.__preciosNube), adm = intentar(() => !!PERMISOS.esAdmin(), false), C = contrato();
    return `<span class="zc-sub dr-zc">${adm ? `Acta de inicio del contrato: <input type="date" id="zcInicio" value="${esc(P.contratoInicio || "")}" aria-label="Fecha del acta de inicio"> · plazo <input type="number" id="zcPlazo" min="1" max="48" step="1" value="${esc(String(P.contratoPlazoMeses || 4))}" aria-label="Plazo en meses" style="width:64px"> meses` : `Acta de inicio: <b>${C.estimada ? "sin cargar" : esc(dmy(C.ini))}</b> · plazo ${C.meses} meses`}${C.estimada && C.ini ? ` · mientras tanto se usa la primera orden de la zona (${esc(dmy(C.ini))}, estimada)` : ""}.</span>`;
  }
  document.addEventListener("change", async (e) => {
    const t = e.target; if (!t || (t.id !== "zcInicio" && t.id !== "zcPlazo") || !intentar(() => PERMISOS.esAdmin(), false)) return;
    const campo = t.id === "zcInicio" ? { contratoInicio: /^\d{4}-\d\d-\d\d$/.test(t.value) ? t.value : "" } : { contratoPlazoMeses: Math.max(1, Math.min(48, Math.round(num(t.value) || 4))) };
    window.__preciosNube = Object.assign({}, window.__preciosNube || {}, campo); cache = null;
    try { await window.fbPreciosGuardar(campo); window.fbAuditar && window.fbAuditar("contrato_inicio", JSON.stringify(campo), {}); try { window.mostrarAviso && window.mostrarAviso("✓ Guardado: " + (campo.contratoInicio != null ? "acta de inicio " + (campo.contratoInicio ? dmy(campo.contratoInicio) : "(vacía)") : "plazo " + campo.contratoPlazoMeses + " meses") + ".", "ok"); } catch (x) { } }
    catch (er) { try { window.mostrarAviso && window.mostrarAviso("No se pudo guardar (sin señal o sin permiso).", "error"); } catch (x) { } }
  });
  // el resumen para el asistente (sin plata para quien no la ve: lo poda el asistente según el rol)
  function paraIa() {
    const D = datos(true), P = plataDatos();
    return { hoy: D.h, zona: D.z.label, avanceZonaPct: r2(D.z.pct), modulosHechos: r2(D.z.k), modulosZona: D.z.modulos, hoyK: D.hoyK, ayerK: D.ayerK, ritmoNecesarioK: D.ritmo, promedio7K: D.prom7, contratoInicio: D.C.ini, inicioEstimado: D.C.estimada, plazo: D.C.plazo, proyeccionFin: D.proy, diasContraPlazo: D.difDias, planLinealPct: D.pctPlan != null ? r1(D.pctPlan) : null, obras: D.obras.slice(0, 40).map((o) => ({ obra: o.n, ID: o.ID, avancePct: o.a, inicio: o.ini, prevista: o.prev || null, previstaDe: o.prevDe || "sin fecha prevista", aEsteRitmo: o.proy || null, estimada: o.estimada, estado: EST[o.est].t, diasDeDiferencia: o.dif })), sinFechaPrevista: D.sinProgramar, certificadoAcumuladoSinIva: r2(P.acum), mesSinIva: P.R ? r2(P.R.sinIva) : null, margenPct: P.margen != null ? r1(P.margen) : null, nota: "Lo arma la app (pantalla Dirección). Plan lineal a confirmar; las fechas «estimada» salen del ritmo de cada obra." };
  }
  // repintado: a la vista cada minuto (relojitosAhorro lo frena con la app escondida)
  const mv = window.mostrarVista;
  if (typeof mv == "function") {
    const n = function (v) { const r = mv.apply(this, arguments); try { if (v === "inicio") setTimeout(pintar, 40); } catch (e) { } return r; };
    window.__heredar && window.__heredar(n, mv); window.mostrarVista = n;
  }
  document.addEventListener("permisos-listos", () => setTimeout(() => { rolClase(); cache = null; pintar(); }, 60));
  setInterval(() => { try { rolClase(); menu(); const v = $("viewInicio"), ov = $("dirOv"); if ((ov && !ov.hidden) || (v && v.style.display !== "none" && modoInicio())) { pintar(); pedirFotos(false); } } catch (e) { } }, 60000);
  setInterval(() => { try { rolClase(); menu(); } catch (e) { } }, 2500);
  window.addEventListener("resize", () => { st.h.drProg = ""; clearTimeout(st.rz); st.rz = setTimeout(pintar, 250); });
  window.__inicioDir = { pintar: () => { cache = null; tdC = null; pintar(); }, suave, abrir, cerrar, datos: (f) => datos(f !== false), contrato, programacion: () => datos().obras, plata: plataDatos, equipo: () => equipo(datos()), atencion: () => atencion(datos()), clima: avisosClima, planeado, fotoDe, pedirFotos, paraIa, accesoHtml, tdHtml, cfgHtml, modoInicio, puedeVer, kOt, kEstimado, prevista, estado: () => ({ seg: st.seg, prog: st.prog, fotosTs: st.fotosTs, fotos: Object.keys(st.fotosQ).length, clima: !!st.clima, climaErr: st.climaErr, reglas: st.reglas, mapa: !!st.mapa, abierto: st.abierto }), _st: st };
})();
