(function () {
  "use strict";
  // v150 · «Lo hecho, verificado» (Ángel, 12/11/2026: «son tres columnas y hacen dos… la IA lo ve y me dice "está bien, esta
  // tarea está cumplida (2 de 3)"; si mañana hago otra orden de la misma obra me tiene que decir "eso ya se hizo"… hoy puse una
  // tarea en una plaza que ya la habían hecho ayer»).
  //  1) __hecho: de memoria (sin lecturas nuevas), por obra, tarea y columna/caja: hecho y verificado (orden cerrada o «✅ Está
  //     bien»), hecho sin verificar (lo que mandó la cuadrilla: campo.pasosObra, fotos con su columna, marcas, tareaEnv), no se hizo
  //     (con el porqué) y asignado (orden abierta). Nada se escribe: se calcula.
  //  2) __verifOt: la verificación de cada orden, SIN IA (pedidas · hechas con foto y hora · no se hizo · dudosa) en el tablero,
  //     el «📸 Avance», el cierre (precarga lo verificado) y el Supervisor; «✅ Está bien» (campo.verificado), «Cerrar con esto» y
  //     «✨ Que lo revise el asistente» (verificar_orden + ver_fotos: solo propone).
  //  3) Avisa antes de repetir: Llenar orden (línea por tarea y cartel al emitir con Emitir igual / Dejar solo lo que falta /
  //     Cancelar), saldoObra (lo hecho sin cerrar ya no es «asignado» y lo que no se hizo vuelve a «queda»: la sugerida y el pase a
  //     mañana usan lo que falta de verdad), el asistente y el repaso de lo ya emitido en el tablero (Sacar esa tarea / Dejar solo).
  //  4) Planilla de columnas (legajo y Mapa de guerra) · 5) Modo obra salta la columna que ya figura hecha y lo dice · 6) parte de
  //     verificación del día a las 18:00 (turno de configEquipo/salud como el pase a mañana).
  // Pruebas viejas: __v150No (lo pone el arnés salvo v150:true).
  if (window.__verifOt) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const Lk = (s) => String(s || "").replace(/[~*\/\[\].`]/g, "_").slice(0, 120) || "_";
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const arr = (x) => (Array.isArray(x) ? x : []);
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const r2 = (n) => Math.round(n * 100) / 100;
  const intentar = (fn, def) => { try { return fn(); } catch (e) { return def; } };
  const fN = (n) => { try { return Number(n).toLocaleString("es-AR", { maximumFractionDigits: 2 }); } catch (e) { return String(n); } };
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const hoyISO = () => iso(window.__hvAhora ? new Date(window.__hvAhora) : new Date());
  const ahoraMs = () => (window.__hvAhora ? +new Date(window.__hvAhora) : Date.now());
  const sumarDias = (f, n) => { const d = new Date(f + "T12:00:00"); d.setDate(d.getDate() + n); return iso(d); };
  const proxHabil = (f) => { let x = sumarDias(f, 1); if (new Date(x + "T12:00:00").getDay() === 0) x = sumarDias(x, 1); return x; };
  const fCorta = (f) => { const p = String(f || "").split("-"); return p.length === 3 ? p[2] + "/" + p[1] : String(f || ""); };
  const cuando = (f) => { const h = hoyISO(); f = String(f || "").slice(0, 10); if (!f) return ""; if (f === h) return "hoy"; if (f === sumarDias(h, -1)) return "ayer"; if (f === sumarDias(h, 1)) return "mañana"; return "el " + fCorta(f); };
  const hhmm = (ts) => { const d = new Date(ts); return isNaN(d) ? "" : pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const minDe = (h) => { const m = String(h || "").match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : null; };
  const primero = (n) => String(n || "").trim().split(/\s+/)[0] || "";
  const off = () => !!window.__v150No;
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const otDe = (id) => ots().find((o) => o && o.id === id) || null;
  const obras = () => intentar(() => window.avanceObrasTodas || (Array.isArray(avanceObras) ? avanceObras : []), []) || [];
  const obraDe = (id) => obras().find((o) => o && String(o.id) === String(id)) || null;
  const permiso = (h) => intentar(() => (window.PERMISOS && PERMISOS.permiso ? PERMISOS.permiso(h) : typeof window.permiso == "function" ? window.permiso(h) : "oculto"), "oculto");
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  const liviano = () => intentar(() => !!(window.__modoDatos && window.__modoDatos.liviano()), false);
  const rolYo = () => intentar(() => String((PERMISOS.yo() || {}).rol || ""), "");
  const yoMail = () => String((window.__fbUser || {}).email || "");
  const yoNombre = () => intentar(() => { const y = PERMISOS.yo() || {}; return y.nombre || y.persona || y.usuario || yoMail().split("@")[0]; }, yoMail());
  const oficina = () => !off() && !esCrew() && !liviano() && permiso("parte") === "editar";
  const veOficina = () => !off() && !esCrew() && !liviano() && ["parte", "avance", "registro", "obras"].some((h) => { const p = permiso(h); return p === "editar" || p === "ver"; });
  const labelDe = (k) => intentar(() => { const a = ACTIVIDADES_CATALOGO.find((x) => x.id === k); return a ? a.label : k; }, k);
  const corto = (k) => String(labelDe(k)).replace(/\s*\(.*\)$/, "").replace(/^Montaje \(izaje\) de columna\b.*$/i, "Izaje");
  const unDe = (k) => intentar(() => (typeof unidadDeTarea == "function" ? unidadDeTarea(k) : ""), "");
  const pideNum = (k) => intentar(() => { const c = window.catFotoDeTarea ? window.catFotoDeTarea(labelDe(k)) : "otra"; return !!(window.catFotoPideNum && window.catFotoPideNum(c)); }, false);
  const avisar = (t, tipo) => { try { window.mostrarAviso && window.mostrarAviso(t, tipo || "ok"); } catch (e) { } };
  const auditar = (t, d) => { try { typeof window.fbAuditar == "function" && window.fbAuditar(t, d); } catch (e) { } };
  const MOT = { lluvia: "lluvia", material: "faltó material", epec: "falta EPEC", tiempo: "no alcanzó el tiempo", otro: "otro motivo" };
  const motTxt = (m) => MOT[m] || String(m || "");
  const RADIO = 150;
  const cerrada = (o) => !!(o && o.cierre && o.cierre.cerradoTs);
  const anulada = (o) => !o || o.estado === "Anulada";
  const campo = (o) => obj(o && o.campo);
  const tareasOt = (o) => arr(o && o.actividades).filter((k) => typeof k == "string" && k && k.indexOf("m:") !== 0);
  const envDe = (o, k) => { const x = obj(obj(campo(o).tareaEnv)[Lk(k)]); const l = Object.keys(x).map((q) => x[q]).filter((v) => v && v.estado); return l.length ? l.sort((a, b) => (b.ts || 0) - (a.ts || 0))[0] : null; };
  const marcaDe = (o, k) => { const m = obj(campo(o).marcas); return m[k] || m[Lk(k)] || null; };
  const nombreOt = (o) => (o && (o.numero || o.id)) || "";
  const porDe = (x) => (x && (x.por || x.nombre)) || "";
  function colsTxt(l) {
    l = arr(l).filter(Boolean); if (!l.length) return "";
    const m = l.map((x) => String(x).match(/^(.*?)(\d+)$/));
    if (l.length > 2 && m.every((x, i) => x && x[1] === m[0][1] && (i === 0 || +x[2] === +m[i - 1][2] + 1))) return l[0] + " a " + l[l.length - 1];
    return l.length === 1 ? l[0] : l.slice(0, -1).join(", ") + " y " + l[l.length - 1];
  }
  const ordenNum = (a, b) => { const x = String(a).match(/(\d+)\D*$/), y = String(b).match(/(\d+)\D*$/); return x && y ? +x[1] - +y[1] : String(a).localeCompare(String(b)); };

  // ============================================================== 1) lo hecho, por unidad
  // las unidades (columna, caja…) de una tarea en una orden: pasos de Modo obra + fotos con su columna
  function unidadesDe(o, k) {
    const c = campo(o), m = new Map();
    const ps = obj(obj(c.pasosObra)[Lk(k)]);
    Object.keys(ps).forEach((q) => {
      const x = ps[q]; if (!x || !x.num) return;
      const u = { num: String(x.num), est: x.estado === "no" ? "no" : "si", ini: x.ini || "", fin: x.fin || "", motivo: x.motivo || "", por: porDe(x), ts: num(x.ts), foto: false, fotos: 0, fotoId: "", mini: "", dudosa: "" };
      m.set(nk(u.num), u);
    });
    const fo = obj(c.fotos);
    Object.keys(fo).forEach((q) => {
      const f = fo[q]; if (!f || f.borrada || !f.num || (f.k !== k && f.k !== Lk(k))) return;
      const key = nk(f.num); let u = m.get(key);
      if (!u) { u = { num: String(f.num), est: "si", ini: "", fin: "", motivo: "", por: porDe(f), ts: num(f.ts), foto: false, fotos: 0, fotoId: "", mini: "", dudosa: "" }; m.set(key, u); }
      u.foto = true; u.fotos++; if (!u.fotoId) { u.fotoId = q; u.mini = f.mini || ""; }
      const d = num(f.distObra);
      if (f.ubicDudosa && !(f.ubicOk)) u.dudosa = "foto con GPS impreciso";
      else if (d > RADIO && !(f.ubicOk)) u.dudosa = "foto sacada a " + (d >= 1000 ? fN(Math.round(d / 100) / 10) + " km" : Math.round(d) + " m") + " de la obra";
      if (!u.por) u.por = porDe(f);
    });
    return [...m.values()].sort((a, b) => ordenNum(a.num, b.num));
  }
  // lo que dice la cuadrilla (sin detalle por columna): la marca con su cantidad, o «se hizo» mandado (= lo pedido)
  function cantCuadrilla(o, k) {
    const m = marcaDe(o, k), e = envDe(o, k);
    if (m && m.hecho) return num(m.cant) || num(obj(o.previsto)[k]);
    if (m && m.hecho === false) return 0;
    if (e && e.estado === "si") return num(obj(o.previsto)[k]);
    return 0;
  }
  const mandada = (o, k) => !!envDe(o, k) || !!marcaDe(o, k) || unidadesDe(o, k).length > 0;
  const verificadaOk = (o) => cerrada(o) || !!(obj(campo(o).verificado).ok);
  // memo por ronda (las órdenes cambian con cada foto: se vuelve a calcular cada 1,5 s como mucho)
  let memo = { ref: null, ts: 0, m: new Map() };
  function cache(clave, fn) {
    const l = ots(); if (memo.ref !== l || Date.now() - memo.ts > 1500) memo = { ref: l, ts: Date.now(), m: new Map() };
    if (!memo.m.has(clave)) memo.m.set(clave, fn());
    return memo.m.get(clave);
  }
  const RANGO = { ver: 4, sinver: 3, no: 2, asig: 1 };
  function deObra(id) {
    return cache("o|" + id, () => {
      const U = {}, T = {};
      const t = (k) => (T[k] = T[k] || { sinDet: [], asig: [], no: [] });
      ots().forEach((o) => {
        if (anulada(o) || String(o.plazaId || "") !== String(id)) return;
        const ok = verificadaOk(o), ce = cerrada(o);
        tareasOt(o).forEach((k) => {
          const us = unidadesDe(o, k), si = us.filter((u) => u.est === "si"), no = us.filter((u) => u.est === "no");
          const base = { otId: o.id, ot: nombreOt(o), fecha: String(o.fecha || "").slice(0, 10) };
          const poner = (u, est) => {
            const key = k + "|" + nk(u.num), x = Object.assign({}, base, u, { k, est, estCampo: u.est, por: u.por || (arr(o.personal)[0] || {}).nombre || "" });
            const y = U[key]; if (!y || RANGO[est] > RANGO[y.est] || (RANGO[est] === RANGO[y.est] && x.fecha > y.fecha)) U[key] = x;
          };
          si.forEach((u) => poner(u, ok ? "ver" : "sinver"));
          no.forEach((u) => poner(u, "no"));
          const cant = ce ? num(obj(o.cierre.cantidades)[k]) : cantCuadrilla(o, k);
          const extra = r2(cant - si.length);
          if (extra > 0) t(k).sinDet.push(Object.assign({ cant: extra, ver: ok, por: (marcaDe(o, k) || {}).por || "" }, base));
          const e = envDe(o, k);
          if (!ce && e && e.estado === "no" && !no.length) t(k).no.push(Object.assign({ motivo: motTxt(((marcaDe(o, k) || {}).motivo) || e.motivo || ""), cant: r2(Math.max(0, num(obj(o.previsto)[k]) - Math.max(cant, si.length))) }, base));
          if (!ce && o.estado !== "Terminada") {
            const resto = r2(num(obj(o.previsto)[k]) - Math.max(cant, si.length) - no.length - (e && e.estado === "no" && !no.length ? num(obj(o.previsto)[k]) : 0));
            if (resto > 0 && !e) t(k).asig.push(Object.assign({ cant: resto }, base));
          }
        });
      });
      const ks = {}; Object.keys(T).forEach((k) => { ks[k] = 1; }); Object.keys(U).forEach((q) => { ks[U[q].k] = 1; });
      return { U, T, ks };
    });
  }
  // las unidades hechas (verificadas o no) de una tarea en la obra, sin contar una orden
  function hechasDe(id, k, sinOt) { return cache("h|" + id + "|" + k + "|" + (sinOt || ""), () => hechasDe0(id, k, sinOt)); }
  function hechasDe0(id, k, sinOt) {
    const D = deObra(id), l = [];
    Object.keys(D.U).forEach((q) => { const u = D.U[q]; if (u.k === k && (u.est === "ver" || u.est === "sinver") && u.otId !== sinOt) l.push(u); });
    const sd = arr((D.T[k] || {}).sinDet).filter((x) => x.otId !== sinOt);
    // si la misma unidad la hizo otra orden y también ésta, cuenta una vez: U ya guarda una sola por unidad
    // verificado: lo mayor entre lo de las órdenes cerradas y lo que dice el Avance de obra (saldoObra); + lo mandado sin cerrar
    const verN = l.filter((u) => u.est === "ver").length + sd.filter((x) => x.ver).reduce((s, x) => s + x.cant, 0);
    const sinN = l.filter((u) => u.est === "sinver").length + sd.filter((x) => !x.ver).reduce((s, x) => s + x.cant, 0);
    const base = intentar(() => { const s = (window.__saldoBase || window.saldoObra)(id, sinOt); return num(s && s.tareas && s.tareas[k] && s.tareas[k].hecho); }, 0);
    return { l: l.sort((a, b) => ordenNum(a.num, b.num)), sinDet: sd, n: r2(Math.max(verN, base) + sinN), verN, sinN, base };
  }
  function totalDe(id, k) {
    const sd = intentar(() => (window.__saldoBase || window.saldoObra)(id), null), t = sd && sd.tareas && sd.tareas[k];
    if (t && num(t.total) > 0) return num(t.total);
    if (pideNum(k)) { const l = nombresObra(id); if (l.length && /columna|pozo|base|v[ií]nculo|tablerito/i.test(unDe(k) + " " + labelDe(k))) return l.length; }
    return 0;
  }
  const nombresObra = (id) => intentar(() => arr(window.puntosDeObra(id).lista).map(String), []);
  // lo que falta de verdad de una tarea (total − hecho, verificado o no); null si no se sabe el total
  function faltaReal(id, k, sinOt) {
    const T = totalDe(id, k); if (!(T > 0)) return null;
    return Math.max(0, r2(T - hechasDe(id, k, sinOt).n));
  }
  // los nombres de las que faltan (las de la obra que no están hechas)
  function faltanNombres(id, k, sinOt, n) {
    const h = new Set(hechasDe(id, k, sinOt).l.map((u) => nk(u.num)));
    return nombresObra(id).filter((x) => !h.has(nk(x))).slice(0, n == null ? 99 : n);
  }
  // ¿pedir P de la tarea k en la obra repite trabajo hecho?
  function repite(id, k, P, sinOt) {
    if (off() || !id || !(num(P) > 0)) return null;
    const H = hechasDe(id, k, sinOt); if (!H.n) return null;
    const fr = faltaReal(id, k, sinOt); if (fr == null || num(P) <= fr) return null;
    const hechoEn = r2(num(P) - fr), un = unDe(k) || "unidad";
    const recientes = H.l.slice().sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    const ult = recientes[0] || H.sinDet[0] || null;
    const usadas = recientes.slice(0, Math.max(0, hechoEn)), unid = usadas.map((u) => u.num).sort(ordenNum);
    const faltan = faltanNombres(id, k, sinOt, fr);
    const pl = (n) => (n === 1 ? un : /[aeiouáéíóú]$/i.test(un) ? un + "s" : un + "es");
    const ots = [...new Set((usadas.length ? usadas.map((u) => u.ot) : H.l.map((u) => u.ot).concat(H.sinDet.map((x) => x.ot))))].filter(Boolean);
    const sinVer = H.l.some((u) => u.est === "sinver") || H.sinDet.some((x) => !x.ver);
    const texto = `${corto(k)}: esto ya está hecho en ${fN(hechoEn)} de ${fN(P)} ${pl(num(P))}${unid.length ? " (" + colsTxt(unid) + ")" : ""}${ult ? " " + cuando(ult.fecha) + " en " + ots.slice(0, 2).join(", ") : ""}${sinVer ? ", mandado por la cuadrilla y sin cerrar" : ""}. Falta de verdad: ${fN(fr)}${faltan.length && fr ? " (" + colsTxt(faltan) + ")" : ""}.`;
    return { k, label: labelDe(k), P: num(P), hechoEn, falta: fr, unidades: unid, faltan, ots, sinVer, texto };
  }
  // el aviso de una tarea en «Llenar orden»
  function lineaForm(id, k, sinOt) {
    if (!deObra(id).ks[k]) return "";   // nada de esa tarea en la obra: no se calcula más
    const H = hechasDe(id, k, sinOt), D = deObra(id), T = D.T[k] || { asig: [], no: [] };
    const h = hoyISO(), l = [];
    const recientes = H.l.filter((u) => u.fecha >= sumarDias(h, -14));
    const grupos = {};
    recientes.forEach((u) => { const g = (grupos[u.otId] = grupos[u.otId] || { ot: u.ot, fecha: u.fecha, est: u.est, us: [], por: {}, foto: 0, hora: 0 }); g.us.push(u.num); g.por[primero(u.por)] = 1; if (u.foto) g.foto++; if (u.ini && u.fin) g.hora++; if (u.est === "sinver") g.est = "sinver"; });
    Object.keys(grupos).map((x) => grupos[x]).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))).forEach((g) => {
      const pr = Object.keys(g.por).filter(Boolean).join(" y "), con = [g.foto ? "con foto" : "", g.hora ? "hora" : ""].filter(Boolean).join(" y ");
      l.push(`${g.est === "sinver" ? "⏳ <b>Mandado sin cerrar</b>" : "⚠ <b>Ya hecho</b>"}: ${esc(colsTxt(g.us.sort(ordenNum)))} ${esc(cuando(g.fecha))} (${esc(g.ot)}${pr ? ", " + esc(pr) : ""}${con ? ", " + esc(con) : ""})`);
    });
    H.sinDet.filter((x) => x.fecha >= sumarDias(h, -14)).forEach((x) => l.push(`${x.ver ? "⚠ <b>Ya hecho</b>" : "⏳ <b>Mandado sin cerrar</b>"}: ${fN(x.cant)} ${esc(cuando(x.fecha))} (${esc(x.ot)}) · hecho según ${x.ver ? "el cierre" : "la cuadrilla"}, sin detalle por columna`));
    Object.keys(D.U).map((q) => D.U[q]).filter((u) => u.k === k && u.est === "no" && u.otId !== sinOt && u.fecha >= sumarDias(h, -14)).slice(0, 3).forEach((u) => l.push(`✕ ${esc(u.num)} no se hizo ${esc(cuando(u.fecha))}${u.motivo ? ": «" + esc(motTxt(u.motivo)) + "»" : ""} (${esc(u.ot)})`));
    arr(T.asig).filter((a) => a.otId !== sinOt && a.fecha >= h).forEach((a) => l.push(`📅 <b>Ya asignado</b> ${esc(cuando(a.fecha))} en ${esc(a.ot)} (${fN(a.cant)})`));
    if (!l.length) return "";
    const fr = faltaReal(id, k, sinOt);
    if (fr != null && (H.n > 0)) { const fa = faltanNombres(id, k, sinOt, fr); l.push(`Falta de verdad: <b>${fN(fr)}</b>${fa.length && fr ? " (" + esc(colsTxt(fa)) + ")" : ""}`); }
    return l.map((x) => `<span class="hv-l">${x}</span>`).join("");
  }

  // ============================================================== 2) la verificación de una orden (sin IA)
  const EST = { ok: ["✅", "Cumplida"], parcial: ["🟡", "Parcial"], nada: ["🔴", "Sin hacer"], duda: ["⚠", "Dudosa"], pend: ["⏳", "Sin mandar"], ver: ["✅", "Verificada"] };
  function verifTarea(o, k) {
    const us = unidadesDe(o, k), si = us.filter((u) => u.est === "si"), no = us.filter((u) => u.est === "no"), e = envDe(o, k), m = marcaDe(o, k);
    const ped = num(obj(o.previsto)[k]) || (si.length + no.length) || 0;
    const cc = cantCuadrilla(o, k), hechas = Math.max(si.length, cc), sinDet = r2(Math.max(0, cc - si.length));
    const env = !!e || !!m || us.length > 0;
    let noN = no.length; const motivoT = motTxt((m && m.hecho === false && m.motivo) || (e && e.estado === "no" && e.motivo) || "");
    if (!noN && ((e && e.estado === "no") || (m && m.hecho === false))) noN = Math.max(0, ped - hechas);
    const dudas = [], unidad = pideNum(k);
    if (unidad) {
      si.filter((u) => !u.foto).forEach((u) => dudas.push(`${u.num}: dijo que sí, sin foto`));
      if (si.length && si.filter((u) => u.foto).length < si.length && !dudas.length) dudas.push("menos fotos que " + (unDe(k) || "unidades"));
    }
    si.filter((u) => u.dudosa).forEach((u) => dudas.push(`${u.num}: ${u.dudosa}`));
    si.forEach((u) => { const a = minDe(u.ini), b = minDe(u.fin); if (a != null && b != null && (b <= a || b - a > 14 * 60 || a < 5 * 60 || b > 23 * 60)) dudas.push(`${u.num}: hora rara (${u.ini} a ${u.fin})`); });
    if (hechas > 0 && !us.length && !Object.keys(obj(campo(o).fotos)).some((q) => { const f = campo(o).fotos[q]; return f && !f.borrada && (f.k === k || f.k === Lk(k)); })) dudas.push("hecho según la cuadrilla, sin detalle por columna ni foto");
    let est = !env ? "pend" : ped > 0 && hechas >= ped ? "ok" : hechas > 0 ? "parcial" : "nada";
    if (dudas.length && hechas > 0) est = "duda";
    const conF = si.filter((u) => u.foto).length, conH = si.filter((u) => u.ini && u.fin).length;
    const det = si.length ? ` (${colsTxt(si.map((u) => u.num))}${conF === si.length && conH === si.length ? ", con foto y hora" : conF === si.length ? ", con foto" : conH === si.length ? ", con hora" : ""})` : sinDet > 0 ? " (hecho según la cuadrilla, sin detalle por columna)" : "";
    const partes = [`pedidas ${fN(ped)}`, `hechas ${fN(hechas)}${det}`];
    if (no.length) no.forEach((u) => partes.push(`no se hizo ${u.num}${u.motivo ? ": «" + motTxt(u.motivo) + "»" : ""}`));
    else if (noN > 0) partes.push(`no se hizo ${fN(noN)}${motivoT ? ": «" + motTxt(motivoT) + "»" : ""}`);
    if (!env) partes.push("la cuadrilla todavía no mandó nada");
    return { k, label: labelDe(k), un: unDe(k), pedidas: ped, hechas, sinDet, si, no, noN, motivo: motivoT, dudas, est, mandada: env, conDetalle: us.length > 0, texto: partes.join(" · ") };
  }
  function verifOt(o) {
    if (typeof o == "string") o = otDe(o);
    if (!o) return null;
    return cache("v|" + o.id, () => {
      const ts = tareasOt(o).map((k) => verifTarea(o, k));
      const c = { ok: 0, parcial: 0, nada: 0, duda: 0, pend: 0 }; ts.forEach((t) => { c[t.est]++; });
      const mand = ts.filter((t) => t.est !== "pend");
      let res = !mand.length ? "pend" : c.duda ? "duda" : c.nada === mand.length ? "nada" : c.ok === ts.length ? "ok" : "parcial";
      const v = obj(campo(o).verificado);
      const resumen = ts.length === 1 ? (ts[0].est !== "pend" ? `${fN(ts[0].hechas)} de ${fN(ts[0].pedidas)}` : EST[ts[0].est][1]) : `${c.ok} de ${ts.length} cumplidas`;
      return { otId: o.id, ot: nombreOt(o), obra: o.plazaNombre || "", fecha: String(o.fecha || "").slice(0, 10), tareas: ts, cuenta: c, res, resumen, verificado: v.ok ? v : null, cerrada: cerrada(o), mandada: mand.length > 0 };
    });
  }
  const chip = (est, txt) => `<span class="hv-chip ${est}">${EST[est][0]} ${esc(txt || EST[est][1])}</span>`;
  function texto(o) { const V = verifOt(o); if (!V) return ""; return `${EST[V.res][1]} (${V.resumen}): ` + V.tareas.map((t) => `${corto(t.k)}: ${t.texto}${t.dudas.length ? " · ⚠ " + t.dudas.join("; ") : ""}`).join(" | "); }
  // para el asistente (verificar_orden): lo del punto 1 y 2, sin plata
  function paraIa(id) {
    const o = otDe(id); if (!o) return null;
    const V = verifOt(o);
    return { orden: V.ot, otId: o.id, obra: V.obra, fecha: V.fecha, estado: o.estado, cerrada: V.cerrada, verificadoPorLaOficina: V.verificado ? { por: V.verificado.por, el: new Date(V.verificado.ts).toISOString().slice(0, 16) } : null,
      resultado: EST[V.res][1], resumen: V.resumen,
      tareas: V.tareas.map((t) => ({ k: t.k, tarea: t.label, unidad: t.un, pedidas: t.pedidas, hechas: t.hechas, resultado: EST[t.est][1], hechasDetalle: t.si.map((u) => ({ unidad: u.num, foto: u.foto, fotos: u.fotos, hora: u.ini && u.fin ? u.ini + " a " + u.fin : "", por: u.por, dudosa: u.dudosa || "" })), noSeHizo: t.no.map((u) => ({ unidad: u.num, motivo: motTxt(u.motivo) })).concat(!t.no.length && t.noN ? [{ cantidad: t.noN, motivo: t.motivo }] : []), sinDetallePorColumna: t.sinDet, dudas: t.dudas, texto: t.texto })),
      enLaObra: tareasOt(o).map((k) => { const fr = faltaReal(o.plazaId, k); return { k, faltaDeVerdad: fr, faltan: fr ? faltanNombres(o.plazaId, k, null, fr) : [] }; }),
      nota: "Lo arma la app sin IA con lo que mandó la cuadrilla (pasos de Modo obra con la hora, fotos con su columna, marcas). Con ver_fotos (otId) mirá si las fotos muestran lo que dicen. Solo proponé: nada se cambia sin «Sí»." };
  }
  // avisos para el cierre por voz: lo dicho contra lo verificado
  function avisosCierre(R) {
    const o = otDe(R && R.otId); if (!o || off()) return [];
    const l = [];
    Object.keys(obj(R.cantidades)).forEach((k) => {
      const t = verifTarea(o, k); if (!t.conDetalle) return;
      if (num(R.cantidades[k]) > t.hechas) l.push(`${nombreOt(o)} · ${corto(k)}: decís ${fN(R.cantidades[k])} y la cuadrilla mandó ${fN(t.hechas)}${t.si.length ? " (" + colsTxt(t.si.map((u) => u.num)) + ")" : ""}${t.no.length ? "; " + t.no.map((u) => u.num).join(", ") + " no se hizo" : ""}`);
    });
    tareasOt(o).forEach((k) => { const t = verifTarea(o, k); if (t.dudas.length) l.push(`${nombreOt(o)} · ${corto(k)}: ⚠ ${t.dudas.join("; ")}`); });
    return l;
  }

  // ---------- la hoja de la verificación (#hvOv)
  function ventana(id, h) {
    const v = $(id); v && v.remove();
    const ov = document.createElement("div"); ov.id = id; ov.className = "v7-ov no-print hv-v7"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    ov.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div>${h}</div>`;
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov); return ov;
  }
  const cab = (t, s) => `<div class="v7-cab"><div><h3>${t}</h3>${s ? `<small>${s}</small>` : ""}</div><button type="button" class="v7-x" data-hv="x" aria-label="Cerrar">✕</button></div>`;
  function tareaHtml(t) {
    return `<div class="hv-ta"><h4><span>${esc(corto(t.k))}</span>${chip(t.est, t.est === "parcial" ? fN(t.hechas) + " de " + fN(t.pedidas) : "")}</h4><div class="hv-tx">${esc(t.texto)}</div>
${t.si.length || t.no.length ? `<div class="hv-us">${t.si.map((u) => `<span class="hv-u ${u.dudosa || !u.foto ? "du" : "si"}" title="${esc(u.por)}">✓ ${esc(u.num)}${u.foto ? " 📷" : ""}${u.ini && u.fin ? " " + esc(u.ini) + "–" + esc(u.fin) : ""}</span>`).join("")}${t.no.map((u) => `<span class="hv-u no">✕ ${esc(u.num)}</span>`).join("")}</div>` : ""}
${t.dudas.length ? `<div class="hv-du">⚠ ${t.dudas.map(esc).join(" · ")}</div>` : ""}</div>`;
  }
  function verHtml(o) {
    const V = verifOt(o);
    const res = V.verificado ? `✅ Verificado por ${esc(primero(V.verificado.porNombre || V.verificado.por))} ${esc(hhmm(V.verificado.ts))} (${esc(EST[V.verificado.resultado] ? EST[V.verificado.resultado][1] : V.verificado.resultado || "")})` : `${EST[V.res][0]} <b>${EST[V.res][1]}</b> · ${esc(V.resumen)}`;
    return `<div class="hv-res ${V.verificado ? "ok" : V.res}" role="status">${res}</div>${V.tareas.map(tareaHtml).join("") || '<div class="hv-pie">La orden no tiene tareas del catálogo.</div>'}`;
  }
  function accHtml(o, chico) {
    const V = verifOt(o); if (!oficina() || cerrada(o)) return "";
    return `<div class="hv-acc">${V.verificado ? "" : `<button type="button" class="btn-primary hv-ok" data-hv="ok" data-id="${esc(o.id)}">✅ Está bien</button>`}<button type="button" class="btn-ghost" data-hv="cerrar" data-id="${esc(o.id)}">Cerrar con esto</button>${chico ? `<button type="button" class="btn-ghost" data-hv="ver" data-id="${esc(o.id)}">Ver</button>` : ""}${iaOk() ? `<button type="button" class="btn-ghost" data-hv="ia" data-id="${esc(o.id)}">✨ Que lo revise el asistente</button>` : ""}</div>`;
  }
  const iaOk = () => intentar(() => (typeof window.__iaPuede == "function" ? window.__iaPuede() : !!window.__asistenteAbrir), false) && !!window.__asistenteAbrir;
  function abrir(id) {
    const o = otDe(id); if (!o || off()) return false;
    ventana("hvOv", cab(`🔎 Verificación · ${esc(nombreOt(o))}`, `${esc(o.plazaNombre || "")} · ${esc(cuando(o.fecha))}`) + verHtml(o) + accHtml(o, false) + `<div class="hv-pie">La arma la app con lo que mandó la cuadrilla: los pasos de Modo obra (con la hora), las fotos con su columna y las marcas. «Está bien» la deja verificada; el cierre la usa para precargar las cantidades.</div>`);
    return true;
  }
  async function estaBien(id) {
    const o = otDe(id); if (!o || !oficina()) return false;
    const V = verifOt(o), v = { ok: true, por: yoMail(), porNombre: yoNombre(), ts: Date.now(), resultado: V.res, resumen: V.resumen, txt: texto(o).slice(0, 600) };
    try { await window.fbOtUpdate(o.id, { "campo.verificado": v }); }
    catch (e) { avisar(e && e.code === "permission-denied" ? "🔒 Tu usuario no puede marcar órdenes." : "⚠ No se pudo guardar (revisá la conexión).", "error"); return false; }
    try { o.campo = Object.assign({}, o.campo || {}, { verificado: v }); } catch (e) { }
    memo.ts = 0; auditar("ot_verificada", `${nombreOt(o)} · ${EST[V.res][1]} (${V.resumen})`);
    avisar(`✅ ${nombreOt(o)} verificada.`); pintarTablero(true);
    if ($("hvOv")) abrir(o.id);
    return true;
  }
  function cerrarCon(id) { const v = $("hvOv"); v && v.remove(); try { window.abrirCierreOt(id); } catch (e) { } }
  // «✨ Que lo revise el asistente»: un pedido que mira la verificación y las fotos (solo propone)
  function revisarIA(id) {
    const o = otDe(id); if (!o || !iaOk()) return false;
    const v = $("hvOv"); v && v.remove();
    const txt = `Revisá la orden ${nombreOt(o)} (${o.plazaNombre || ""}): usá verificar_orden con otId «${o.id}» y después ver_fotos con ese otId. Decime en pocas líneas si está cumplida o no (por ejemplo «está bien, la tarea está cumplida (2 de 3)»), y si las fotos muestran lo que dicen (columna izada, zanja, tablero…) o alguna parece de otra cosa u otra obra. No cambies nada: si hace falta algo, proponelo y espero el «Sí».`;
    try { window.__asistenteAbrir(""); } catch (e) { return false; }
    let n = 0; const t = setInterval(() => {
      const A = window.__asistente; if ((!A || !$("iaPanel")) && ++n < 80) return; clearInterval(t); if (!A) return;
      try { A.enviar(txt, false, { burbuja: `✨ Revisá la verificación de la ${nombreOt(o)}`, effort: "medium", tipo: "pregunta" }); } catch (e) { }
    }, 100);
    return true;
  }

  // ============================================================== saldoObra: lo hecho sin cerrar y lo que no se hizo
  function envolverSaldo() {
    const o = window.saldoObra; if (typeof o != "function") return false; if (o.__hv) return true;
    window.__saldoBase = o;
    const n = function (pid, exc) {
      const r = o.apply(this, arguments);
      if (off() || !r || !r.tareas) return r;
      try {
        const aj = {};
        ots().forEach((x) => {
          if (anulada(x) || cerrada(x) || String(x.plazaId || "") !== String(pid) || (exc && x.id === exc)) return;
          if (r.desde && String(x.fecha || "") < r.desde) return;
          tareasOt(x).forEach((k) => {
            const P = num(obj(x.previsto)[k]); if (!(P > 0)) return;
            const V = verifTarea(x, k); if (!V.mandada) return;
            const h = Math.min(P, V.hechas), nn = Math.min(P - h, V.noN || V.no.length);
            const a = (aj[k] = aj[k] || { h: 0, no: 0 }); a.h += h; a.no += nn;
          });
        });
        Object.keys(aj).forEach((k) => {
          const t = r.tareas[k]; if (!t) return;
          const a = aj[k], sale = r2(Math.min(num(t.asignado), a.h + a.no));
          t.hechoSinCerrar = r2(a.h); t.noSeHizo = r2(a.no);
          t.asignado = r2(num(t.asignado) - sale);
          if (t.queda != null) t.queda = r2(num(t.total) - num(t.hecho) - t.hechoSinCerrar - t.asignado);
        });
      } catch (e) { console.warn("[verifObra] saldo", e); }
      return r;
    };
    try { window.__heredar && window.__heredar(n, o); } catch (e) { }
    n.__hv = 1; window.saldoObra = n; return true;
  }

  // ============================================================== 3) Llenar orden: aviso por tarea y cartel al emitir
  const edId = () => intentar(() => (typeof otEditandoId != "undefined" ? otEditandoId : null), null);
  function pintarForm() {
    const cont = $("otActividades"), s = $("otPlaza"); if (!cont || !s) return;
    const pid = !off() && oficina() && s.value && s.value !== "__sin__" ? s.value : "";
    cont.querySelectorAll(".ot-tarea").forEach((el) => {
      const cb = el.querySelector(".ot-act-check"), k = cb && cb.value; if (!k) return;
      const h = pid ? intentar(() => lineaForm(pid, k, edId()), "") : "";
      let box = el.querySelector(".hv-linea");
      if (!h) { box && box.remove(); return; }
      if (!box) { box = document.createElement("div"); box.className = "hv-linea no-print"; box.setAttribute("role", "note"); const ref = el.querySelector(".sc-linea") || el.querySelector(".sa-linea") || el.querySelector(".ot-tarea-sub"); (ref || el).insertAdjacentElement("afterend", box); }
      const cls = /⚠|⏳|✕/.test(h) ? "hv-linea no-print" : "hv-linea no-print info";
      if (box.className !== cls) box.className = cls;
      if (box.__h !== h) { box.innerHTML = h; box.__h = h; }
    });
  }
  function preguntar(rs, d) {
    return new Promise((ok) => {
      const tot = rs.length === 1 ? rs[0] : null;
      const solo = rs.every((r) => r.falta > 0) ? (tot ? (tot.faltan.length === tot.falta ? colsTxt(tot.faltan) : fN(tot.falta)) : "lo que falta") : "";
      const otras = rs.map((r) => { const a = arr((deObra(d.plazaId).T[r.k] || {}).asig).filter((x) => x.otId !== edId() && x.fecha >= hoyISO()); return a.length ? `📅 ${corto(r.k)} ya está asignado en ${a.map((x) => x.ot + " (" + fN(x.cant) + ", " + cuando(x.fecha) + ")").join(", ")}.` : ""; }).filter(Boolean);
      const tit = tot ? `Esto ya está hecho en ${fN(tot.hechoEn)} de ${fN(tot.P)}${tot.unidades.length ? " (" + esc(colsTxt(tot.unidades)) + ")" : ""}` : "Hay tareas que ya están hechas";
      const ov = ventana("hvPreg", cab("⚠ " + tit, esc(d.plazaNombre || (obraDe(d.plazaId) || {}).nombre || "")) + `<div class="hv-linea">${rs.map((r) => `<span class="hv-l">${esc(r.texto)}</span>`).join("")}${otras.map((x) => `<span class="hv-l">${esc(x)}</span>`).join("")}</div><div class="v7-acc hv-acc"><button type="button" class="btn-ghost" data-hvp="no">Cancelar</button>${solo ? `<button type="button" class="btn-primary" data-hvp="solo">Dejar solo ${esc(solo)}</button>` : `<button type="button" class="btn-primary" data-hvp="solo">Sacar lo que ya está hecho</button>`}<button type="button" class="btn-ghost" data-hvp="si">Emitir igual</button></div>`);
      let listo = false; const fin = (x) => { if (listo) return; listo = true; ov.remove(); ok(x); };
      ov.addEventListener("click", (e) => { if (e.target === ov) return fin("no"); const b = e.target.closest && e.target.closest("[data-hvp],[data-hv='x']"); if (b) fin(b.dataset.hvp || "no"); });
    });
  }
  function dejarSolo(rs) {
    rs.forEach((r) => {
      const cb = document.querySelector(`#otActividades .ot-act-check[value="${r.k}"]`), el = cb && cb.closest(".ot-tarea"), inp = el && el.querySelector(".ot-act-prev");
      if (!(r.falta > 0)) { if (cb && cb.checked) { cb.checked = false; cb.dispatchEvent(new Event("change", { bubbles: true })); } return; }
      if (inp) { inp.value = String(r.falta); inp.dispatchEvent(new Event("input", { bubbles: true })); inp.dispatchEvent(new Event("change", { bubbles: true })); }
    });
  }
  // el cartel va en el clic de «Emitir» (#otEmitirBtn; la barra de abajo de Llenar orden también lo toca), antes que todo lo
  // demás («¿por qué asignás de más?», la gente…). La sugerida y el asistente emiten por emitirOrdenTrabajo sin tocar el botón:
  // no pasan por acá (ellos ya no repiten trabajo por saldoObra y avisan en su tarjeta).
  let pasar = false;
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("#otEmitirBtn"); if (!b) return;
    if (pasar) { pasar = false; return; }
    if (off() || !oficina() || intentar(() => window.__sugerida && window.__sugerida.emitiendo(), false)) return;
    const d = intentar(() => window.datosOtDesdeFormulario(), null);
    if (!d || !d.plazaId || d.sinPlaza) return;
    const rs = arr(d.actividades).map((k) => repite(d.plazaId, k, num(obj(d.previsto)[k]), edId())).filter(Boolean);
    if (!rs.length) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    preguntar(rs, d).then((r) => {
      if (r === "no") { const m = $("otMsg"); if (m) m.textContent = "No se emitió: hay tareas que ya están hechas."; return; }
      if (r === "solo") dejarSolo(rs);
      auditar("ot_repite_trabajo", `${(d.plazaNombre || d.plazaId)} · ${rs.map((x) => corto(x.k) + " " + x.hechoEn + " de " + x.P).join(", ")} · ${r === "solo" ? "dejó solo lo que falta" : "emitió igual"}`);
      window.__hvEmitio = (window.__hvEmitio || 0) + 1;
      if (window.__hvSoloProbar) return;   // pruebas
      pasar = true; b.click();
    });
  }, true);

  // ============================================================== el repaso de lo ya emitido (tablero) y «Sacar esa tarea»
  function repaso(o) {
    if (!o || anulada(o) || cerrada(o) || o.estado === "Terminada" || !o.plazaId || String(o.fecha || "") < hoyISO()) return [];
    return tareasOt(o).filter((k) => !envDe(o, k) && !unidadesDe(o, k).length).map((k) => repite(o.plazaId, k, num(obj(o.previsto)[k]), o.id)).filter(Boolean);
  }
  function repasoHtml(o) {
    const rs = repaso(o); if (!rs.length) return "";
    return `<div class="hv-tb rep" role="note">⚠ <b>Esto ya se hizo</b><span class="hv-tx">${rs.map((r) => esc(r.texto)).join("<br>")}</span>${oficina() ? `<div class="hv-acc">${rs.map((r) => (r.falta > 0 ? `<button type="button" class="btn-primary" data-hv="solo" data-id="${esc(o.id)}" data-k="${esc(r.k)}">Dejar solo ${esc(r.faltan.length === r.falta ? colsTxt(r.faltan) : fN(r.falta))}</button>` : "") + `<button type="button" class="btn-ghost" data-hv="sacar" data-id="${esc(o.id)}" data-k="${esc(r.k)}">Sacar esa tarea</button>`).join("")}</div>` : ""}</div>`;
  }
  function confirmar(tit, txt, si) {
    return new Promise((ok) => {
      const ov = ventana("hvConf", cab(esc(tit), "") + `<div class="hv-tx" style="font-size:14px;line-height:1.5">${txt}</div><div class="v7-acc hv-acc"><button type="button" class="btn-ghost" data-hvc="no">No</button><button type="button" class="btn-primary" data-hvc="si">${esc(si)}</button></div>`);
      let listo = false; const fin = (x) => { if (listo) return; listo = true; ov.remove(); ok(x); };
      ov.addEventListener("click", (e) => { if (e.target === ov) return fin(false); const b = e.target.closest && e.target.closest("[data-hvc],[data-hv='x']"); if (b) fin(b.dataset.hvc === "si"); });
    });
  }
  async function sacarTarea(id, k, soloFalta) {
    const o = otDe(id); if (!o || !oficina()) return false;
    const r = repite(o.plazaId, k, num(obj(o.previsto)[k]), o.id), lab = labelDe(k);
    const acts = tareasOt(o).filter((x) => x !== k), manuales = arr(o.actividadesManuales).filter((m) => m && String(m.actividad || "").trim());
    if (!soloFalta && !acts.length && !manuales.length) { avisar("Es la única tarea de la orden: si no se va a hacer, anulá la orden.", "warn"); return false; }
    const n = soloFalta && r ? r.falta : 0;
    const ok = await confirmar(soloFalta ? `¿Dejar solo lo que falta en la ${nombreOt(o)}?` : `¿Sacar «${corto(k)}» de la ${nombreOt(o)}?`,
      soloFalta ? `«${esc(lab)}» pasa de ${fN(num(obj(o.previsto)[k]))} a <b>${fN(n)}</b>${r && r.faltan.length ? " (" + esc(colsTxt(r.faltan)) + ")" : ""}. Lo demás de la orden queda igual.` : `A la cuadrilla deja de aparecerle. El resto de la orden queda igual.${r ? "<br><small>" + esc(r.texto) + "</small>" : ""}`, soloFalta ? "Sí, dejar " + fN(n) : "Sí, sacarla");
    if (!ok) return false;
    let cambios;
    if (soloFalta) { const previsto = Object.assign({}, o.previsto || {}); previsto[k] = n; cambios = { previsto }; }
    else {
      const sinK = (m) => { const x = Object.assign({}, m || {}); delete x[k]; return x; };
      cambios = { actividades: acts.concat(arr(o.actividades).filter((x) => typeof x == "string" && x.indexOf("m:") === 0)), previsto: sinK(o.previsto), asignada: sinK(o.asignada), reparto: sinK(o.reparto), equipoTarea: sinK(o.equipoTarea), equipos: sinK(o.equipos) };
      try { const et = typeof etapasDeTareas == "function" ? etapasDeTareas(acts) : null; if (et && et.length) { cambios.etapaKey = et[0].key; cambios.etapaLabel = et.map((x) => x.label).join(" · "); cambios.etapasKeys = et.map((x) => x.key); } } catch (e) { }
      cambios.tareasSacadas = arr(o.tareasSacadas).concat([{ k, label: lab, previsto: num(obj(o.previsto)[k]), por: yoMail(), ts: Date.now(), motivo: "ya estaba hecha (v150)" }]).slice(-20);
    }
    try { await window.fbOtUpdate(o.id, cambios); }
    catch (e) { avisar(e && e.code === "permission-denied" ? "🔒 Tu usuario no puede cambiar órdenes." : "⚠ No se pudo guardar (revisá la conexión).", "error"); return false; }
    auditar(soloFalta ? "ot_tarea_editar" : "ot_tarea_sacar", `${nombreOt(o)} · ${soloFalta ? "«" + lab + "» solo lo que falta: " + n : "sacó «" + lab + "»"} (ya estaba hecha)`);
    avisar(soloFalta ? `✓ ${nombreOt(o)}: ${corto(k)} ${fN(n)}.` : `✓ «${corto(k)}» sacada de ${nombreOt(o)}.`);
    try { typeof window.__tbB == "function" && window.__tbB(); } catch (e) { }
    memo.ts = 0; pintarTablero(true); return true;
  }
  // decoración de las tarjetas del tablero de Órdenes (Hoy · Para revisar y cerrar · Próximas · Sin cerrar)
  function tbHtml(o) {
    if (!o || anulada(o)) return "";
    if (!cerrada(o)) {
      const V = verifOt(o);
      if (V && V.mandada) return `<div class="hv-tb" role="note">${V.verificado ? chip("ver", "Verificada") : chip(V.res, V.res === "parcial" && V.tareas.length === 1 ? "Parcial (" + V.resumen + ")" : EST[V.res][1] + " · " + V.resumen)}<span class="hv-tx">${esc(V.tareas.filter((t) => t.est !== "pend").map((t) => (V.tareas.length > 1 ? corto(t.k) + ": " : "") + t.texto).join(" · "))}${V.tareas.some((t) => t.dudas.length) ? " · ⚠ " + esc(V.tareas.map((t) => t.dudas.join("; ")).filter(Boolean).join("; ")) : ""}</span>${accHtml(o, true)}</div>`;
      return repasoHtml(o);
    }
    return "";
  }
  function pintarTablero(forzar) {
    if (off() || !veOficina()) return;
    const v = $("viewParteDiario"); if (!forzar && (!v || v.style.display === "none")) return;
    document.querySelectorAll("#otTablero .ot-tb-card[data-otid]").forEach((card) => {
      const o = otDe(card.dataset.otid), h = intentar(() => tbHtml(o), "");
      let box = card.querySelector(":scope > .hv-tbw");
      if (!h) { box && box.remove(); return; }
      if (!box) { box = document.createElement("div"); box.className = "hv-tbw no-print"; const acc = card.querySelector(":scope > .acc"); acc ? card.insertBefore(box, acc) : card.appendChild(box); }
      if (box.__h !== h) { box.innerHTML = h; box.__h = h; }
    });
  }

  // ============================================================== el cierre: lo verificado precargado
  function envolverCierre() {
    const o = window.abrirCierreOt; if (typeof o != "function") return false; if (o.__hv) return true;
    const n = function (id) {
      const r = o.apply(this, arguments);
      try { if (!off() && oficina()) setTimeout(() => precargar(id), 60); } catch (e) { }
      return r;
    };
    try { window.__heredar && window.__heredar(n, o); } catch (e) { }
    n.__hv = 1; window.abrirCierreOt = n; return true;
  }
  function precargar(id) {
    const ot = otDe(id); if (!ot || cerrada(ot)) return;
    document.querySelectorAll("#cierreCuerpo .cierre-qty").forEach((inp) => {
      const k = inp.dataset.k; if (!k || k.indexOf("m:") === 0) return;
      const t = verifTarea(ot, k); if (!t.mandada) return;
      const tr = inp.closest("tr"); if (!tr) return;
      if (t.conDetalle && String(inp.value) !== String(t.hechas) && !tocados.has(inp)) { inp.value = String(t.hechas); inp.dispatchEvent(new Event("input", { bubbles: true })); }
      let fila = tr.nextElementSibling && tr.nextElementSibling.classList.contains("hv-cie") ? tr.nextElementSibling : null;
      const h = `<td colspan="4"><div class="hv-cie">🔎 <b>Lo verificado:</b> ${chip(t.est, t.est === "parcial" ? fN(t.hechas) + " de " + fN(t.pedidas) : "")} ${esc(t.texto)}${t.dudas.length ? " · ⚠ " + esc(t.dudas.join("; ")) : ""}${t.conDetalle ? ` · <b>precargado: ${fN(t.hechas)}</b>` : ""}</div></td>`;
      if (!fila) { fila = document.createElement("tr"); fila.className = "hv-cie"; tr.insertAdjacentElement("afterend", fila); }
      if (fila.__h !== h) { fila.innerHTML = h; fila.__h = h; }
    });
  }
  // lo que la persona tocó no se pisa (sin data-*: cierreIntegrante reconoce cada campo por su dataset)
  const tocados = new WeakSet();
  document.addEventListener("input", (e) => { const t = e.target; if (t && t.classList && t.classList.contains("cierre-qty") && e.isTrusted) tocados.add(t); }, true);
  // «📸 Avance» de la orden (y el bloque de la cuadrilla en el cierre): la verificación arriba
  function envolverOficina() {
    const o = window.__cdOficinaHtml; if (typeof o != "function" || o.__hv) return !!(o && o.__hv);
    const n = function (ot) {
      const h = o.apply(this, arguments);
      try { if (!off() && veOficina() && ot && !cerrada(ot)) { const V = verifOt(ot); if (V && V.mandada) return `<div class="hv-tb" role="note"><b>🔎 Verificación</b> ${V.verificado ? chip("ver", "Verificada") : chip(V.res, EST[V.res][1] + " · " + V.resumen)}<span class="hv-tx">${esc(V.tareas.filter((t) => t.est !== "pend").map((t) => (V.tareas.length > 1 ? corto(t.k) + ": " : "") + t.texto).join(" · "))}</span>${accHtml(ot, true)}</div>` + (h || ""); } } catch (e) { }
      return h;
    };
    n.__hv = 1; window.__cdOficinaHtml = n; return true;
  }

  // ============================================================== Supervisor
  function supHallazgos() {
    if (off() || !oficina()) return [];
    const l = [], h = hoyISO();
    ots().forEach((o) => {
      if (anulada(o) || cerrada(o) || !o.plazaId) return;
      const V = verifOt(o);
      if (V && V.mandada && !V.verificado && V.res !== "ok") l.push({ g: V.res === "nada" || V.res === "duda" ? "ambar" : "info", cat: "Verificación", t: `${V.obra}: ${V.ot} · ${EST[V.res][0]} ${EST[V.res][1]} (${V.resumen})`, s: V.tareas.filter((t) => t.est !== "pend").map((t) => corto(t.k) + ": " + t.texto + (t.dudas.length ? " · ⚠ " + t.dudas.join("; ") : "")).join(" | ").slice(0, 300), ir: { tipo: "verif", id: o.id }, obraId: o.plazaId, btn: "Ver" });
      if (String(o.fecha || "") >= h) { const rs = repaso(o); if (rs.length) l.push({ g: "rojo", cat: "Verificación", t: `${o.plazaNombre || ""}: ${nombreOt(o)} (${cuando(o.fecha)}) pide algo ya hecho`, s: rs.map((r) => r.texto).join(" "), ir: { tipo: "verif", id: o.id }, obraId: o.plazaId, btn: "Ver" }); }
    });
    return l.slice(0, 8);
  }

  // ============================================================== 4) planilla de columnas
  const ETAPAS = [["pozo", "Pozo", ["excavacion", "fundaciones"]], ["horm", "Hormig.", ["hormigonado", "fundaciones"]], ["izaje", "Izaje", ["montaje_prfv", "montaje_metalica"]], ["vinc", "Vínculo", ["montaje_vinculo", "vinculo_luminaria"]], ["lum", "Lumin.", ["montaje_luminaria", "vinculo_luminaria"]], ["tabl", "Tablerito", ["conexionado_tablerito", "armado_tablerito"]], ["sell", "Sellado", ["sellado_base"]], ["pat", "PAT", ["pat"]]];
  const EST_TXT = { ver: "Hecho y verificado", sinver: "Hecho, sin verificar", no: "No se hizo", asig: "Asignado", falta: "Falta" };
  function planilla(id) {
    return cache("p|" + id, () => {
      const D = deObra(id);
      let cols = nombresObra(id);
      const vistos = new Set(cols.map(nk));
      Object.keys(D.U).forEach((q) => { const u = D.U[q]; if (/^(col|columna)\b/i.test(u.num) && !vistos.has(nk(u.num))) { vistos.add(nk(u.num)); cols.push(u.num); } });
      cols = cols.slice(0, 80);
      const celda = {}, notas = [];
      ETAPAS.forEach(([e, , ks]) => {
        cols.forEach((c) => {
          let best = null;
          ks.forEach((k) => { const u = D.U[k + "|" + nk(c)]; if (u && (!best || RANGO[u.est] > RANGO[best.est])) best = u; });
          celda[e + "|" + nk(c)] = best ? Object.assign({ etapa: e }, best) : { etapa: e, est: "falta", num: c };
        });
        // asignado (orden abierta sin mandar): las siguientes que faltan, como las elige Modo obra (a confirmar)
        ks.forEach((k) => {
          arr((D.T[k] || {}).asig).forEach((a) => {
            let n = Math.round(a.cant);
            cols.forEach((c) => { const x = celda[e + "|" + nk(c)]; if (n > 0 && x.est === "falta") { celda[e + "|" + nk(c)] = { etapa: e, est: "asig", num: c, ot: a.ot, otId: a.otId, fecha: a.fecha, k, cant: a.cant }; n--; } });
          });
          arr((D.T[k] || {}).sinDet).forEach((x) => notas.push(`${ETAPAS.find((y) => y[0] === e)[1]}: ${fN(x.cant)} hechas ${cuando(x.fecha)} (${x.ot}) sin detalle por columna${x.ver ? " (cerrada)" : " (según la cuadrilla)"}`));
        });
      });
      const usadas = ETAPAS.filter(([e, , ks]) => ks.some((k) => totalDe(id, k) > 0) || cols.some((c) => celda[e + "|" + nk(c)].est !== "falta"));
      return { cols, etapas: usadas.length ? usadas : ETAPAS.slice(0, 3), celda, notas: [...new Set(notas)] };
    });
  }
  function planillaHtml(id, chica) {
    const P = planilla(id); if (!P.cols.length) return chica ? "" : '<div class="hv-pie">La obra no tiene columnas con nombre (cargalas en el cálculo o en el legajo) y no hay fotos ni pasos por columna todavía.</div>';
    const th = P.etapas.map(([e, t]) => `<th>${esc(chica ? t.slice(0, 3) : t)}</th>`).join("");
    const filas = P.cols.map((c) => `<tr><th class="col">${esc(chica ? c.replace(/^Col\s*/i, "") : c)}</th>${P.etapas.map(([e, t]) => { const x = P.celda[e + "|" + nk(c)]; return `<td><button type="button" class="hv-c ${x.est}" data-hvc2="${esc(id)}" data-e="${e}" data-c="${esc(c)}" aria-label="${esc(c)} · ${esc(t)}: ${esc(EST_TXT[x.est])}">${chica ? "" : x.est === "ver" ? "✓" : x.est === "sinver" ? "✓" : x.est === "no" ? "✕" : x.est === "asig" ? "•" : ""}</button></td>`; }).join("")}</tr>`).join("");
    const ley = `<div class="hv-ley">${["ver", "sinver", "no", "asig", "falta"].map((e) => `<span><i class="${e}"></i>${EST_TXT[e]}</span>`).join("")}</div>`;
    return `<div class="hv-pl"><table class="hv-grid"><thead><tr><th class="col">${chica ? "" : "Columna"}</th>${th}</tr></thead><tbody>${filas}</tbody></table></div>${chica ? "" : ley}${!chica && P.notas.length ? `<div class="hv-sd">${P.notas.map(esc).join("<br>")}</div>` : ""}<div class="hv-det" id="${chica ? "hvDetM" : "hvDet"}" hidden></div>`;
  }
  function celdaDet(id, e, c) {
    const P = planilla(id), x = P.celda[e + "|" + nk(c)], et = ETAPAS.find((y) => y[0] === e);
    if (!x) return "";
    let h = `<b>${esc(c)} · ${esc(et ? et[1] : e)}</b>: ${esc(EST_TXT[x.est])}`;
    if (x.est === "ver" || x.est === "sinver") h += `<br>${esc(primero(x.por) ? x.por : "")}${x.por ? " · " : ""}${esc(cuando(x.fecha))}${x.ini && x.fin ? " de " + esc(x.ini) + " a " + esc(x.fin) : ""} · ${esc(x.ot)}${x.foto ? " · 📷 con foto" : " · sin foto"}${x.dudosa ? " · ⚠ " + esc(x.dudosa) : ""}${x.mini && /^data:image\//.test(x.mini) ? `<img src="${esc(x.mini)}" alt="Foto de ${esc(c)}">` : ""}${x.fotoId ? `<br><button type="button" class="btn-ghost" data-hvfoto="${esc(x.fotoId)}" style="width:auto;margin:6px 0 0;min-height:40px">Ver la foto</button>` : ""}`;
    else if (x.est === "no") h += `<br>${esc(cuando(x.fecha))} · ${esc(x.ot)}${x.motivo ? " · «" + esc(motTxt(x.motivo)) + "»" : ""}${x.por ? " · " + esc(x.por) : ""}`;
    else if (x.est === "asig") h += `<br>${esc(x.ot)} · ${esc(cuando(x.fecha))} (la app supone las siguientes que faltan)`;
    if (x.otId && veOficina()) h += `<br><button type="button" class="btn-ghost" data-hv="ver" data-id="${esc(x.otId)}" style="width:auto;margin:6px 0 0;min-height:40px">Ver la orden</button>`;
    return h;
  }
  function abrirPlanilla(id) {
    const o = obraDe(id); if (!o) return false;
    ventana("hvPlOv", cab(`🧱 Planilla de columnas · ${esc(String(o.nombre || o.plazaNombre || "").toUpperCase())}`, "Tocá una celda: quién, cuándo, la orden y la foto") + planillaHtml(id, false));
    return true;
  }
  let lgActual = "";
  function ponerLegajo() {
    let sec = $("lgHvSec");
    const s = $("lgFotosSec"), id = !off() && veOficina() && s && s.dataset.plaza ? s.dataset.plaza : "";
    if (!id) { sec && sec.remove(); return; }
    const ref = $("lgMavSec") || $("lgBalSec") || s; if (!ref || !ref.parentNode) return;
    const h = `<h3>🧱 Planilla de columnas</h3><div class="hint" style="margin-top:0">Lo hecho en cada columna, etapa por etapa: verificado (orden cerrada o «Está bien»), mandado por la cuadrilla, no se hizo, asignado o falta. Se arma de lo que ya tiene la app.</div>` + planillaHtml(id, false);
    if (sec && sec.dataset.plaza !== id) { sec.remove(); sec = null; }
    if (!sec) { sec = document.createElement("div"); sec.className = "card lg-sec no-print"; sec.id = "lgHvSec"; sec.dataset.plaza = id; ref.insertAdjacentElement("afterend", sec); }
    const det = $("hvDet"), abierto = det && !det.hidden ? det.outerHTML : "";
    if (sec.__h !== h) { sec.innerHTML = h; sec.__h = h; if (abierto) { const d2 = $("hvDet"); if (d2) d2.outerHTML = abierto; } }
    lgActual = id;
  }
  // ficha del Mapa de guerra
  function mapaHtml(id) {
    if (off() || !veOficina() || !obraDe(id)) return "";
    const P = planilla(id); if (!P.cols.length) return "";
    const c = { ver: 0, sinver: 0, no: 0, asig: 0 }; Object.keys(P.celda).forEach((q) => { const e = P.celda[q].est; if (c[e] != null) c[e]++; });
    return `<div class="mg-fsec">Columnas</div><div class="mg-hv">${planillaHtml(id, true)}</div><div class="mg-fl"><span>${c.ver} verificadas · ${c.sinver} sin verificar · ${c.no} no se hizo · ${c.asig} asignadas</span></div><div class="mg-fbt"><button type="button" class="btn-ghost" data-hvpl="${esc(id)}">🧱 Planilla de columnas</button></div>`;
  }

  // ============================================================== 5) Modo obra: la columna que ya figura hecha
  const FKEY = "ema.hv.forzar";
  const forzados = () => intentar(() => JSON.parse(localStorage.getItem(FKEY) || "{}"), {}) || {};
  const saltadas = {};   // otId|k → [{num, u}]
  window.__hechoSaltar = function (o, k, nombre) {
    if (off() || !o || !o.plazaId) return false;
    const D = deObra(o.plazaId), u = D.U[k + "|" + nk(nombre)];
    if (!u || u.otId === o.id || (u.est !== "ver" && u.est !== "sinver")) return false;
    if (arr(forzados()[o.id + "|" + k]).indexOf(nk(nombre)) >= 0) return false;
    const key = o.id + "|" + k, l = (saltadas[key] = saltadas[key] || []);
    if (!l.some((x) => nk(x.num) === nk(nombre))) l.push({ num: nombre, u });
    return true;
  };
  // si la app salteó columnas ya hechas, no inventa más allá de las de la obra (Col 7, Col 8 que no existen)
  window.__hechoTope = function (o, k, nombres, quedan, n) {
    if (off() || !o || !arr(nombres).length || !arr(saltadas[o.id + "|" + k]).length) return n;
    return Math.min(n, Math.max(0, quedan));
  };
  window.__hechoForzado = function (o, k, nombre) { return !off() && !!o && arr(forzados()[o.id + "|" + k]).indexOf(nk(nombre)) >= 0; };
  window.__hechoAvisoObra = function (o, pa) {
    try {
      if (off() || !o || !pa || !pa.p || !o.plazaId) return "";
      const k = pa.p.k, D = deObra(o.plazaId), propias = new Set(arr(pa.u && pa.u.items).map((x) => nk(x.num)));
      // las de otras órdenes (u otro día) que figuran hechas y la app ya no te da
      const l = Object.keys(D.U).map((q) => D.U[q]).filter((u) => u.k === k && u.otId !== o.id && (u.est === "ver" || u.est === "sinver") && !propias.has(nk(u.num)) && u.fecha >= sumarDias(String(o.fecha || hoyISO()), -3)).sort((a, b) => ordenNum(a.num, b.num)).slice(0, 4);
      if (!l.length) return "";
      const quien = [...new Set(l.map((u) => primero(u.por)).filter(Boolean))].join(" y ");
      const fe = [...new Set(l.map((u) => fCorta(u.fecha)))].join(" y ");
      const sig = pa.it ? pa.it.num : "";
      return `<div class="cd-hv" role="status">⚠ <b>${esc(colsTxt(l.map((u) => u.num)))}</b>: ${esc(corto(k))} ya figura hecho el ${esc(fe)}${quien ? " (" + esc(quien) + ")" : ""}. ${sig ? "Te paso a la que falta: <b>" + esc(sig) + "</b>." : ""} ¿Es otra cosa?<br><button type="button" class="btn-ghost" data-hvforzar="${esc(o.id)}" data-k="${esc(k)}" data-n="${esc(l.map((u) => nk(u.num)).join("|"))}">Es otra cosa: hacerla igual</button></div>`;
    } catch (e) { return ""; }
  };

  // ============================================================== 6) parte de verificación del día (18:00)
  function parteDia(D) {
    D = D || hoyISO();
    const c = { ok: 0, parcial: 0, duda: 0, nada: 0, pend: 0 }, lista = [];
    ots().forEach((o) => {
      if (anulada(o) || String(o.fecha || "").slice(0, 10) !== D || !o.plazaId) return;
      const V = verifOt(o); V.tareas.forEach((t) => { c[t.est]++; });
      lista.push(V);
    });
    const M = proxHabil(D), rep = ots().filter((o) => String(o.fecha || "").slice(0, 10) === M && repaso(o).length);
    const p = [`${c.ok} ${c.ok === 1 ? "tarea cumplida" : "tareas cumplidas"}`];
    if (c.parcial) p.push(`${c.parcial} ${c.parcial === 1 ? "parcial" : "parciales"}`);
    if (c.duda) p.push(`${c.duda} ${c.duda === 1 ? "dudosa" : "dudosas"}`);
    if (c.nada) p.push(`${c.nada} sin hacer`);
    if (c.pend) p.push(`${c.pend} sin mandar`);
    const txt = `${D === hoyISO() ? "Hoy" : fCorta(D)}: ${p.join(", ")}${rep.length ? ` · ${M === sumarDias(D, 1) ? "mañana" : "el " + fCorta(M)} hay ${rep.length === 1 ? "1 orden que repite" : rep.length + " órdenes que repiten"} trabajo hecho` : ""}.`;
    return { D, M, cuenta: c, ordenes: lista, repiten: rep.map((o) => ({ otId: o.id, ot: nombreOt(o), obra: o.plazaNombre || "", r: repaso(o).map((r) => r.texto) })), texto: txt };
  }
  function verParte(D) {
    const P = parteDia(D);
    const fila = (V) => `<div class="hv-ta"><h4><span>${esc(V.ot)} · ${esc(V.obra)}</span>${V.verificado ? chip("ver", "Verificada") : chip(V.res, V.resumen)}</h4><div class="hv-tx">${esc(V.tareas.map((t) => corto(t.k) + ": " + t.texto).join(" · "))}</div><div class="hv-acc"><button type="button" class="btn-ghost" data-hv="ver" data-id="${esc(V.otId)}">Ver</button></div></div>`;
    ventana("hvParteOv", cab("🔎 Parte de verificación", esc(P.texto)) + (P.ordenes.map(fila).join("") || '<div class="hv-pie">No hubo órdenes ese día.</div>') + (P.repiten.length ? `<div class="hv-tb rep"><b>⚠ ${esc(fCorta(P.M))}: órdenes que repiten trabajo hecho</b><span class="hv-tx">${P.repiten.map((x) => `${esc(x.ot)} · ${esc(x.obra)}: ${esc(x.r.join(" "))}`).join("<br>")}</span><div class="hv-acc">${P.repiten.map((x) => `<button type="button" class="btn-ghost" data-hv="ver" data-id="${esc(x.otId)}">Ver ${esc(x.ot)}</button>`).join("")}</div></div>` : ""));
    return P;
  }
  function pintarParte(P) {
    let b = $("hvParte"); if (!P) { b && b.remove(); return; }
    if (!b) { b = document.createElement("div"); b.id = "hvParte"; b.className = "no-print"; b.setAttribute("role", "status"); document.body.appendChild(b); }
    b.innerHTML = `<span class="tx">🔎 <b>Parte del día</b> · ${esc(P.texto)}</span><button type="button" class="btn-primary" data-hvparte="${esc(P.D)}">Ver</button><button type="button" class="btn-ghost" data-hvparte="x" aria-label="Cerrar">✕</button>`;
  }
  const st = { corriendo: false, ultimo: null };
  async function tic() {
    if (st.corriendo || !oficina() || window.__hvPausa) return null;
    if (!["admin", "oficina"].includes(rolYo())) return null;
    const C = intentar(() => window.__pasarManana.cfg(), { hora: "18:00" }) || { hora: "18:00" };
    const d = window.__hvAhora ? new Date(window.__hvAhora) : new Date(), D = iso(d), ahora = pad(d.getHours()) + ":" + pad(d.getMinutes());
    if (ahora < (C.hora || "18:00") || d.getDay() === 0) return null;
    if (intentar(() => localStorage.getItem("ema.hv.parte." + D), "")) return null;
    st.corriendo = true;
    try {
      const gano = window.__pasarManana && window.__pasarManana.tomar ? await window.__pasarManana.tomar(D, "verif") : true;
      try { localStorage.setItem("ema.hv.parte." + D, "1"); } catch (e) { }
      if (!gano) return { gano: false };
      const P = parteDia(D); st.ultimo = P; pintarParte(P);
      const yo = yoMail().toLowerCase(), dest = intentar(() => PERMISOS.lista() || [], []).filter((u) => u && u.email && u.activo !== false && u.pendiente !== true && (u.rol === "admin" || u.rol === "oficina")).map((u) => String(u.email).toLowerCase()).filter((e) => e !== yo);
      for (const em of [...new Set(dest)]) { try { await window.__pushAvisos.dejarAviso({ email: em, titulo: "🔎 Parte de verificación del día", cuerpo: P.texto + " Tocá para ver.", tipo: "verificacion", tag: "ema-verif-" + D, ref: D, url: "./" }); } catch (e) { } }
      auditar("verificacion_parte", P.texto);
      return { gano: true, P };
    } catch (e) { return null; } finally { st.corriendo = false; }
  }
  setInterval(() => { if (!document.hidden) tic().catch(() => { }); }, 60000);
  setTimeout(() => { tic().catch(() => { }); }, 30000);

  // ============================================================== clics
  document.addEventListener("click", (e) => {
    const t = e.target; if (!t || !t.closest) return;
    const b = t.closest("[data-hv]");
    if (b) {
      const a = b.dataset.hv, id = b.dataset.id;
      if (a === "x") { const ov = b.closest(".v7-ov"); if (ov && /^hv/.test(ov.id) && !/^hvPreg$|^hvConf$/.test(ov.id)) { e.preventDefault(); ov.remove(); } return; }
      e.preventDefault(); e.stopPropagation();
      if (a === "ver") return abrir(id);
      if (a === "ok") return estaBien(id);
      if (a === "cerrar") return cerrarCon(id);
      if (a === "ia") return revisarIA(id);
      if (a === "sacar") return sacarTarea(id, b.dataset.k, false);
      if (a === "solo") return sacarTarea(id, b.dataset.k, true);
      return;
    }
    const c = t.closest("[data-hvc2]");
    if (c) {
      e.preventDefault();
      const caja = c.closest(".hv-pl") && c.closest(".hv-pl").parentNode, det = caja && caja.querySelector(".hv-det");
      if (det) { det.innerHTML = celdaDet(c.dataset.hvc2, c.dataset.e, c.dataset.c); det.hidden = false; }
      return;
    }
    const pl = t.closest("[data-hvpl]"); if (pl) { e.preventDefault(); abrirPlanilla(pl.dataset.hvpl); return; }
    const fo = t.closest("[data-hvfoto]"); if (fo) { e.preventDefault(); try { window.verAdjunto(fo.dataset.hvfoto); } catch (er) { } return; }
    const pa = t.closest("[data-hvparte]"); if (pa) { e.preventDefault(); const v = pa.dataset.hvparte; pintarParte(null); if (v !== "x") verParte(v); return; }
    const fz = t.closest("[data-hvforzar]");
    if (fz) {
      e.preventDefault(); e.stopPropagation();
      const f = forzados(), key = fz.dataset.hvforzar + "|" + fz.dataset.k; f[key] = [...new Set(arr(f[key]).concat(String(fz.dataset.n || "").split("|").filter(Boolean)))];
      try { localStorage.setItem(FKEY, JSON.stringify(f)); } catch (er) { }
      memo.ts = 0; try { window.__cuadrillaDia && window.__cuadrillaDia.pintar(); } catch (er) { }
    }
  });

  // ============================================================== arranque
  function enganchar() { if (off()) return; envolverSaldo(); envolverCierre(); envolverOficina(); }   // apagado (__v150No): no envuelve nada
  enganchar();
  setInterval(enganchar, 3000);
  setInterval(() => {
    if (off() || document.hidden) return;
    const v = $("viewParteDiario"); if (v && v.style.display !== "none") { pintarForm(); pintarTablero(); }
    if ($("lgFotosSec")) ponerLegajo(); else { const s = $("lgHvSec"); s && s.remove(); }
  }, 1000);
  window.__hecho = { deObra, unidadesDe, hechasDe, faltaReal, faltanNombres, repite, lineaForm, totalDe, planilla, planillaHtml, mapaHtml, abrirPlanilla, nombresHechos: (id, k) => hechasDe(id, k).l.map((u) => nk(u.num)), ETAPAS };
  window.__verifOt = { verifOt, verifTarea, texto, paraIa, avisosCierre, abrir, estaBien, revisarIA, repaso, sacarTarea, supHallazgos, parteDia, verParte, tic, estado: () => ({ ultimo: st.ultimo }), pintarTablero, pintarForm, preguntar, EST };
})();
