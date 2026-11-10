(function () {
  "use strict";
  // v143 · Orden sugerida (aprobada por Ángel, 10/11/2026). LA ARMA LA APP, sin IA (costo cero), con lo que ya tiene en
  // memoria; NUNCA emite sola: nada se escribe hasta que la persona toca «Emitir» (los ajustes, con «Guardar»).
  // El asistente es una capa encima (lee la sugerida, la revisa y propone cambios con tarjeta), no otro motor.
  //  · Qué falta: saldoObra(obra) (el mismo «Quedan N de T» de Llenar orden; ya descuenta lo asignado en órdenes abiertas).
  //    Obra sin cálculo → «Sin cálculo: no puedo sugerir». Lo que quedó de ayer (cerradas con menos de lo previsto y sin
  //    «pasar a otro día»): primero y con el porqué. Lo que sigue en una orden sin cerrar: aviso (no se cuenta dos veces).
  //  · Orden de obra (cada regla con interruptor): pozo → hormigón, fraguado 72 h (Ángel: igual metálica y PRFV; fecha de
  //    campo.pasosObra o del cierre; sin fecha no bloquea), zanja → cable → tapado, izaje → vínculo → luminaria, jabalina con
  //    los tableritos, sellado/aplomado solo en las izadas.
  //  · Rendimientos «según Ángel» (editables): zanja 100 m/día, cable lo que haya de zanja abierta, pozos y hormigonado todos
  //    el mismo día (más de 5 bases → camión), izaje 4–5 / 13 / 6 / 12 / 3 según el modo, tablero 3–4 con 2 barquillas y 2 con
  //    una; si no, lo medido (3 cierres o más) o el diccionario (1/hh, a confirmar) o a mano.
  //  · Gente: la misma cuadrilla hasta terminar la obra; el equipo civil (marca en la nómina) aparte; nadie en dos obras;
  //    ausencias (configEquipo/personal.ausencias); los libres en «Sin orden». Vehículos por tipo y lugares (la grúa es la
  //    única para izar; luminarias con hidro chica o barquilla; tableros con barquilla; el civil con transporte).
  //  · Material: la reserva de la obra contra el stock (solo avisa). Puntos: los de «Llenar orden» (__ordenNueva.puntos).
  //  · Semana: día por día, encadenado. Emitir: cada orden por «Llenar orden» + emitirOrdenTrabajo (lo mismo que a mano).
  //  · Avisos: el de siempre al emitir y un recordatorio a las 7:00 del día (avisosPush con enviarDesde, Worker ema-avisos
  //    v143; con el Worker viejo, recordatorio local del celu de la cuadrilla con la app 1.4).
  //  · Ajustes en configEquipo/baremo.sugerida (Administración y Oficina, por Producción; sin reglas nuevas).
  //  Pruebas viejas: window.__sugNo (salvo sugerida:true en h.js).
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
  const fN = (v) => { const x = r2(v); return intentar(() => fmt(x, Number.isInteger(x) ? 0 : Math.abs(x * 10 - Math.round(x * 10)) < 1e-9 ? 1 : 2), String(x).replace(".", ",")); };
  const Lk = (s) => String(s || "").replace(/[~*\/\[\].`]/g, "_").slice(0, 120) || "_";
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const obras = () => intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []);
  const catalogo = () => intentar(() => (typeof ACTIVIDADES_CATALOGO != "undefined" ? ACTIVIDADES_CATALOGO : []), []);
  const dicc = (k) => arr(window.DICC_TAREAS).find((t) => t && t.id === k) || null;
  const labelDe = (k) => { const a = catalogo().find((x) => x && x.id === k); return a ? a.label : (dicc(k) || {}).label || k; };
  const pNube = () => obj(window.__personalNube);
  const nomina = () => { const p = pNube(); let l = Array.isArray(p.nomina) && p.nomina.length ? p.nomina : Array.isArray(p.lista) ? p.lista : []; if (!l.length) l = intentar(() => window.nominaEquipo() || [], []); return l.filter((x) => x && String(x.nombre || "").trim() && x.activo !== false); };
  const nombresOt = (o) => arr(o && o.personal).map((p) => (typeof p == "string" ? p : p && p.nombre)).filter((n) => n && String(n).trim());
  const cerradaOt = (o) => !!(o && o.cierre && o.cierre.cerradoTs);
  const abiertaOt = (o) => !!o && o.estado !== "Anulada" && o.estado !== "Terminada" && !cerradaOt(o);
  const VIEJAS = () => arr(window.DICC_VIEJAS);
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const deIso = (s) => { const m = String(s || "").match(/^(\d{4})-(\d\d)-(\d\d)/); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null; };
  const hoyISO = () => iso(new Date());
  const sumar = (f, n) => { const d = deIso(f); d.setDate(d.getDate() + n); return iso(d); };
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"], DC = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const fCorta = (f) => { const d = deIso(f); return d ? pad(d.getDate()) + "/" + pad(d.getMonth() + 1) : String(f || ""); };
  const fLarga = (f) => { const d = deIso(f); return d ? DIAS[d.getDay()] + " " + fCorta(f) : String(f || ""); };
  const fDia = (f) => { const d = deIso(f); return d ? DIAS[d.getDay()] + " " + d.getDate() : String(f || ""); };
  const hmMin = (s) => { const m = String(s || "").match(/^(\d{1,2}):(\d\d)/); return m ? +m[1] * 60 + +m[2] : null; };
  const tsDe = (f, hm) => { const d = deIso(f); if (!d) return 0; const m = hmMin(hm); d.setHours(m == null ? 17 : Math.floor(m / 60), m == null ? 0 : m % 60, 0, 0); return d.getTime(); };
  const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
  const lsG = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } };
  const lsS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };

  // ======================================================================= ajustes
  // «angel»: datos que dio Ángel el 10/11/2026 (editables). Lo que no tiene número queda «a confirmar» (0 = sin dato).
  const DEF = {
    jornada: 8, sabado: true, sabIni: "07:30", sabFin: "13:00", ini: "07:30", fraguado: 72, hora: "16:00", inicio: true, galpon: false,
    avisoEmitir: true, recordatorio: true,
    reglas: { fraguado: true, pozoHorm: true, zanjaCable: true, izajeCadena: true, mismaGente: true, patTablerito: true, vehiculos: true },
    izaje: { modo: "auto" },
    angel: {
      zanjeo: { porDia: 100 }, bases: 5,
      izTodo: { personas: 2, porDia: 4, tope: 5 }, izCivil: { personas: 3, porDia: 13 }, izCano2: { personas: 2, porDia: 6 }, izCano3: { personas: 3, porDia: 12 }, izGuia: { personas: 2, porDia: 3 },
      tab2: { porDia: 3, tope: 4 }, tab1: { porDia: 2 }
    },
    rend: {}
  };
  function mezclar(a, b) { const o = clon(a); Object.keys(obj(b)).forEach((k) => { const v = b[k]; if (v && typeof v == "object" && !Array.isArray(v) && o[k] && typeof o[k] == "object" && !Array.isArray(o[k])) o[k] = mezclar(o[k], v); else if (v !== undefined && v !== null) o[k] = v; }); return o; }
  let cfgLocal = null;   // lo que se está tocando en Ajustes (sin guardar)
  const cfgNube = () => mezclar(DEF, obj(obj(window.__baremoNube).sugerida));
  const cfg = () => cfgLocal || cfgNube();
  const sabHoras = (C) => { const a = hmMin(C.sabIni), b = hmMin(C.sabFin); return a != null && b != null && b > a ? r2((b - a) / 60) : 0; };
  function horasDia(f, C) { const d = deIso(f); if (!d) return 0; const w = d.getDay(); if (w === 0) return 0; if (w === 6) return C.sabado ? sabHoras(C) : 0; return num(C.jornada) || 0; }
  function proxHabil(desde, C) { let f = desde; for (let i = 0; i < 14; i++) { f = sumar(f, 1); if (horasDia(f, C) > 0) return f; } return sumar(desde, 1); }
  function diasHabiles(desde, n, C) { const l = []; let f = desde; for (let i = 0; i < 21 && l.length < n; i++) { if (horasDia(f, C) > 0) l.push(f); f = sumar(f, 1); } return l; }
  const fechaDef = () => proxHabil(hoyISO(), cfg());
  const yaEsHora = (C) => { const m = hmMin(C.hora), d = new Date(); return m == null || d.getHours() * 60 + d.getMinutes() >= m; };

  // ======================================================================= quién la ve
  const permiso = (h) => intentar(() => (window.PERMISOS && PERMISOS.permiso ? PERMISOS.permiso(h) : "oculto"), "oculto");
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  const liviano = () => intentar(() => !!(window.__modoDatos && window.__modoDatos.liviano()), false);
  function puede() { return !window.__sugNo && !!window.__fbUser && !liviano() && !esCrew() && permiso("parte") === "editar"; }
  const puedeGuardarCfg = () => permiso("produccion") === "editar";
  const puedePersonal = () => !window.__sugNo && !!window.__fbUser && ["produccion", "parte"].some((h) => permiso(h) === "editar");

  // ======================================================================= ausencias y equipo civil (configEquipo/personal)
  const MOTIVOS = [["franco", "Franco"], ["vacaciones", "Vacaciones"], ["licencia", "Licencia"], ["enfermo", "Enfermo"], ["otro", "Otro"]];
  const ausencias = () => arr(pNube().ausencias).filter((a) => a && a.persona && a.desde);
  function ausente(n, f) { const a = ausencias().filter((x) => nk(x.persona) === nk(n) && x.desde <= f && (x.hasta || x.desde) >= f)[0]; return a ? { motivo: (MOTIVOS.find((m) => m[0] === a.motivo) || [0, a.motivo || "ausente"])[1], hasta: a.hasta || a.desde, nota: a.nota || "" } : null; }
  const ausTxt = (n, a) => `${n.split(" ")[0]}: ${a.motivo.toLowerCase()} hasta el ${fCorta(a.hasta)}`;
  const esCivil = (n) => { const p = nomina().find((x) => nk(x.nombre) === nk(n)); return !!(p && p.equipoCivil); };
  // vehículos: tipo y lugares (Producción › Personal del equipo)
  const TIPOS = [["grua", "Grúa"], ["hidro", "Hidro chica (luminarias)"], ["barquilla", "Barquilla"], ["transporte", "Transporte"], ["auto", "Auto"]];
  const vehLista = () => intentar(() => window.__vehiculos.lista(), []).filter((v) => v && v.activo !== false);
  const vehDe = (n) => intentar(() => window.__vehiculos.dePersona(n), null);
  const tiposCargados = () => vehLista().some((v) => v.tipo);
  const rolDe = (n) => { const p = nomina().find((x) => nk(x.nombre) === nk(n)); const roles = intentar(() => ROLES_CUADRILLA, ["Oficial"]); return p && roles.indexOf(p.rol) >= 0 ? p.rol : roles[0] || "Oficial"; };

  // ======================================================================= tareas: grupos
  const IZ = ["montaje_prfv", "montaje_metalica"];
  const esIzaje = (k) => IZ.indexOf(k) >= 0;
  const CIVIL_T = ["zanjeo", "zanja_maquina", "tapado_zanja", "sellado_base", "aplomado_columna", "base_tablero_nivel", "pozo_tablero", "vereda"];
  const AMBOS_T = ["excavacion", "hormigonado", "tendido_cable", "replanteo", "limpieza_obra", "cruce_calzada"];
  const ALTURA_T = ["montaje_vinculo", "montaje_luminaria", "luminaria_existente", "retiro_luminaria"];
  const TABLERO_T = ["colocacion_tablero", "armado_tablero", "acometida_aerea", "acometida_subterranea"];
  const ORDEN = ["replanteo", "excavacion", "hormigonado", "zanjeo", "zanja_maquina", "tendido_cable", "tapado_zanja", "cruce_calzada", "montaje_prfv", "montaje_metalica", "montaje_vinculo", "montaje_luminaria", "conexionado_tablerito", "pat", "aplomado_columna", "sellado_base", "pozo_tablero", "poste_tablero", "base_tablero_nivel", "colocacion_tablero", "armado_tablero", "acometida_subterranea", "acometida_aerea", "empalme_subterraneo", "medicion_pat", "medicion_aislacion", "prueba_encendido", "limpieza_obra"];
  const GALPON = ["armado_luminaria", "armado_vinculo", "armado_tablerito", "prueba_artefactos"];
  const FINAL = ["prueba_encendido", "limpieza_obra"];
  const POR_COL = ["excavacion", "hormigonado", "montaje_prfv", "montaje_metalica", "montaje_vinculo", "conexionado_tablerito", "aplomado_columna", "sellado_base", "restauracion_columna"];
  const posOrden = (k) => { const i = ORDEN.indexOf(k); if (i >= 0) return i; const j = GALPON.indexOf(k); if (j >= 0) return 100 + j; const d = arr(window.DICC_TAREAS).findIndex((t) => t && t.id === k); return 200 + (d >= 0 ? d : 99); };
  const porMetro = (un) => /metro|^m$|^ml$/i.test(String(un || ""));

  // ======================================================================= estudio de tiempos (lo medido)
  function horasDeHT(h) { if (!h) return 0; const a = hmMin(h.ini), b = hmMin(h.fin); if (a == null || b == null) return 0; let d = b - a; if (d <= 0) d += 1440; return d > 0 && d < 1440 ? d / 60 : 0; }
  function genteTarea(o, k) {
    const as = obj(o.asignada)[k]; if (as) return [as];
    const eq = arr(obj(o.equipoTarea)[k]); if (eq.length) return eq;
    const rp = arr(obj(o.reparto)[k]).map((x) => (x && x.nombre) || x).filter(Boolean); if (rp.length) return rp;
    return nombresOt(o);
  }
  let medC = null, medK = "";
  function registros() {
    const l = ots(), key = l.length + ":" + l.reduce((m, o) => Math.max(m, num(o && o.cierre && o.cierre.cerradoTs)), 0);
    if (medC && medK === key) return medC;
    const regs = [];
    l.forEach((o) => {
      if (!o || o.estado === "Anulada" || !cerradaOt(o)) return;
      const cant = obj(o.cierre.cantidades), c = obj(o.campo);
      Object.keys(cant).forEach((k) => {
        const u = num(cant[k]); if (!(u > 0)) return;
        let h = horasDeHT(obj(c.horasTarea)[k]);
        if (!(h > 0)) {   // de la hora de cada columna (v142)
          const ps = obj(obj(c.pasosObra)[Lk(k)]); let a = null, b = null;
          Object.keys(ps).forEach((q) => { const x = ps[q]; if (!x || x.estado !== "si") return; const i = hmMin(x.ini), f = hmMin(x.fin); if (i != null && (a == null || i < a)) a = i; if (f != null && (b == null || f > b)) b = f; });
          if (a != null && b != null && b > a) h = (b - a) / 60;
        }
        if (!(h > 0)) return;
        const g = genteTarea(o, k);
        regs.push({ k, u, h, np: Math.max(1, g.length), crew: g.map((n) => String(n).split(" ")[0]).sort().join(", "), fecha: o.fecha || "", ot: o.numero || "", obra: o.plazaNombre || "" });
      });
    });
    medC = regs; medK = key; return regs;
  }
  const prom = (l) => { const u = l.reduce((s, r) => s + r.u, 0), hp = l.reduce((s, r) => s + r.h * r.np, 0); return hp > 0 ? { porHH: u / hp, n: l.length } : null; };
  function medidos() { const out = {}, g = {}; registros().forEach((r) => { (g[r.k] = g[r.k] || []).push(r); }); Object.keys(g).forEach((k) => { const p = prom(g[k]); if (p) out[k] = p; }); return out; }
  function estudio(C) {
    C = C || cfg(); const J = num(C.jornada) || 8, g = {};
    registros().forEach((r) => { (g[r.k] = g[r.k] || []).push(r); });
    const filas = Object.keys(g).concat(Object.keys(obj(C.angel)).length ? [] : []).filter((k, i, a) => a.indexOf(k) === i).sort((a, b) => posOrden(a) - posOrden(b)).map((k) => {
      const l = g[k], p = prom(l), d = dicc(k), an = angelPorDia(k, C);
      const porN = {}; l.forEach((r) => { (porN[r.np] = porN[r.np] || []).push(r); });
      const porC = {}; l.forEach((r) => { (porC[r.crew] = porC[r.crew] || []).push(r); });
      const dPorDia = (x) => r2(x.porHH * 2 * J);
      const med = p ? r2(p.porHH * 2 * J) : null, ref = an ? an.porDia2 : d && d.hh > 0 ? r2(2 * J / d.hh) : null;
      return {
        k, tarea: labelDe(k), un: (d && d.un) || "", angel: an ? an.txt : "", angelPorDia2: an ? an.porDia2 : null, diccPorDia2: d && d.hh > 0 ? r2(2 * J / d.hh) : null,
        medidoPorDia2: med, datos: l.length, usable: l.length >= 3, dif: med != null && ref ? Math.round((med / ref - 1) * 100) : null,
        porPersonas: Object.keys(porN).map((n) => { const x = prom(porN[n]); return { personas: +n, porDia: r2(x.porHH * n * J), datos: porN[n].length }; }),
        porCuadrilla: Object.keys(porC).map((c) => { const x = prom(porC[c]); return { cuadrilla: c, porDia2: dPorDia(x), datos: porC[c].length }; }).sort((a, b) => b.porDia2 - a.porDia2).slice(0, 5)
      };
    });
    return filas;
  }
  // el valor de Ángel llevado a «por día con 2» (para comparar)
  function angelPorDia(k, C) {
    const A = obj(C.angel), J = num(C.jornada) || 8;
    if (k === "zanjeo" && num(obj(A.zanjeo).porDia) > 0) return { porDia2: num(A.zanjeo.porDia), txt: `${fN(A.zanjeo.porDia)} m por día (varía según terreno)` };
    if (esIzaje(k)) { const t = obj(A.izTodo); return { porDia2: num(t.porDia), txt: `${fN(t.porDia)}–${fN(t.tope)} por día con ${fN(t.personas)} · ${fN(obj(A.izCivil).porDia)} con ${fN(obj(A.izCivil).personas)} y el civil antes` }; }
    if (k === "colocacion_tablero") return { porDia2: num(obj(A.tab1).porDia), txt: `${fN(obj(A.tab1).porDia)} por día con 1 barquilla · ${fN(obj(A.tab2).porDia)}–${fN(obj(A.tab2).tope)} con 2` };
    return null;
  }

  // ======================================================================= rendimiento de una tarea
  // devuelve { porHH, tope (unidades/día máx.), todoDia, sinTope, txt, fuente }
  function rend(k, C, ctx) {
    ctx = ctx || {};
    const R = obj(obj(C.rend)[k]), modo = R.modo || "auto", d = dicc(k), med = medidos()[k], J = num(C.jornada) || 8, A = obj(C.angel), g = Math.max(1, ctx.gente || 1), H = ctx.horas || J;
    const dic = d && num(d.hh) > 0 ? { porHH: 1 / num(d.hh), fuente: "dicc", txt: `Diccionario: ${fN(d.hh)} HH por ${d.un} (a confirmar)` } : null;
    const medR = med && med.n >= 3 ? { porHH: med.porHH, fuente: "medido", txt: `Medido: ${fN(med.porHH * 2 * J)} por día con 2 (${med.n} cierres)` } : null;
    const mano = num(R.mano) > 0 ? { porHH: num(R.mano) / (2 * J), fuente: "mano", txt: `A mano: ${fN(R.mano)} por día con 2` } : null;
    let ang = null;
    if (k === "zanjeo" && num(obj(A.zanjeo).porDia) > 0) ang = { porHH: num(A.zanjeo.porDia) * (H / J) / (g * H), fuente: "angel", txt: `Según Ángel: ${fN(A.zanjeo.porDia)} m por día, a mano (varía según terreno y profundidad)` };
    else if (k === "tendido_cable") ang = { sinTope: true, fuente: "angel", txt: "Según Ángel: se tiende lo que haya de zanja abierta" };
    else if (k === "excavacion" || k === "hormigonado") ang = { todoDia: true, fuente: "angel", txt: "Según Ángel: pozos, fundación y hormigonado de toda la obra el mismo día" };
    else if (k === "pat" && ctx.conTablerito) ang = { sinTope: true, fuente: "angel", txt: "Según Ángel: la jabalina con su conexión va el mismo día que los tableritos" };
    else if ((k === "sellado_base" || k === "aplomado_columna") && ctx.civil) ang = { sinTope: true, fuente: "angel", txt: "Según Ángel: el equipo civil sella, pone la arena y aploma todas las que estén listas" };
    else if (k === "armado_tablero" && ctx.conTablero) ang = { sinTope: true, fuente: "angel", txt: "Va con la colocación del tablero" };
    else if (k === "colocacion_tablero") {
      const b = ctx.barquillas || 0, t = b >= 2 ? obj(A.tab2) : obj(A.tab1);
      if (b > 0 && num(t.porDia) > 0) ang = { porHH: num(t.porDia) / (g * J), tope: Math.floor(num(t.tope || t.porDia) * H / J + 1e-9), fuente: "angel", txt: `Según Ángel: ${fN(t.porDia)}${t.tope ? "–" + fN(t.tope) : ""} tableros por día con ${b >= 2 ? "2 barquillas" : "1 barquilla"}` };
    }
    else if (esIzaje(k)) ang = izajeAngel(C, ctx);
    if (modo === "mano" && mano) return mano;
    if (modo === "medido" && medR) return medR;
    if (modo === "dicc" && dic) return dic;
    if ((modo === "auto" || modo === "angel") && ang) return ang;
    if (modo === "auto" && medR) return medR;
    return dic || medR || mano || null;
  }
  // Ángel, 10/11/2026 (izaje con grúa): todo la cuadrilla de 2: 4–5/día · equipo civil antes + 3 personas: 13/día ·
  // con caño y sin vínculo: 6 con 2, 12 con 3 y el civil antes · solo con guía (sin escalera, no suben el cable): 3 (a confirmar).
  function izajeAngel(C, ctx) {
    const A = obj(C.angel), md = obj(C.izaje).modo || "auto", J = num(C.jornada) || 8, g = ctx.gente || 0, H = ctx.horas || J;
    const mk = (x, nom, extra) => { const p = num(x.personas) || 2, pd = num(x.porDia); if (!(pd > 0)) return null; const porHH = pd / (p * J); return { porHH, tope: Math.floor((num(x.tope) || pd) * (g / p) * (H / J) + 1e-9), fuente: "angel", modoIz: nom, txt: extra }; };
    const civ = ctx.civilListo && g >= num(obj(A.izCivil).personas || 3);
    if (md === "guia") return mk(A.izGuia, "guia", `Según Ángel: solo con guía (sin escalera, no suben el cable), ${fN(obj(A.izGuia).porDia)} por día con ${fN(obj(A.izGuia).personas)} — a confirmar`);
    if (md === "cano") return civ || g >= 3 && ctx.civilListo ? mk(A.izCano3, "cano3", `Según Ángel: con caño y sin vínculo, ${fN(obj(A.izCano3).porDia)} por día con 3 y el civil antes`) : mk(A.izCano2, "cano2", `Según Ángel: con caño y sin vínculo, ${fN(obj(A.izCano2).porDia)} por día con 2`);
    if (md === "civil" || (md === "auto" && civ)) return mk(A.izCivil, "civil", `Según Ángel: con el equipo civil antes, ${fN(obj(A.izCivil).porDia)} por día con ${fN(obj(A.izCivil).personas)} y grúa (cable subido)`);
    return mk(A.izTodo, "todo", `Según Ángel: todo la cuadrilla, ${fN(obj(A.izTodo).porDia)}–${fN(obj(A.izTodo).tope)} por día con ${fN(obj(A.izTodo).personas)} y grúa`);
  }

  // ======================================================================= datos de cada obra (de memoria)
  function otsDeObra(id) { return ots().filter((o) => o && o.estado !== "Anulada" && String(o.plazaId || "") === String(id)); }
  function obraActiva(o, fecha) {
    if (!o || o.id === "__sinObra" || intentar(() => window.__obraFin(o), false)) return false;
    const l = otsDeObra(o.id), lim = sumar(fecha, -30);
    return l.some((x) => String(x.fecha || "") >= lim || abiertaOt(x));
  }
  function hechasCol(id, k) {
    const s = new Set();
    otsDeObra(id).forEach((o) => {
      const c = obj(o.campo);
      Object.keys(obj(c.fotos)).forEach((q) => { const f = c.fotos[q]; if (f && !f.borrada && f.k === k && f.num) s.add(nk(f.num)); });
      const ps = obj(obj(c.pasosObra)[Lk(k)]); Object.keys(ps).forEach((q) => { const x = ps[q]; if (x && x.estado === "si" && x.num) s.add(nk(x.num)); });
    });
    return s;
  }
  function nombresCol(id) { return intentar(() => arr(window.puntosDeObra(id).lista).map(String), []); }
  function colsTxt(l) {
    if (!l.length) return "";
    const m = l.map((x) => String(x).match(/^(.*?)(\d+)$/));
    if (l.length > 2 && m.every((x, i) => x && x[1] === m[0][1] && (i === 0 || +x[2] === +m[i - 1][2] + 1))) return l[0] + " a " + l[l.length - 1];
    return l.length === 1 ? l[0] : l.slice(0, -1).join(", ") + " y " + l[l.length - 1];
  }
  // fundaciones hormigonadas con su fecha (para el fraguado)
  function hormigonadas(id, fecha) {
    const ev = []; let conFechaCerr = 0;
    otsDeObra(id).forEach((o) => {
      const cant = obj(o.cierre && o.cierre.cantidades), q = num(cant.hormigonado) + num(cant.fundaciones);
      if (cerradaOt(o) && q > 0) {
        const ps = obj(obj(obj(o.campo).pasosObra).hormigonado); let n = 0;
        Object.keys(ps).forEach((z) => { const x = ps[z]; if (x && x.estado === "si" && n < q) { n++; ev.push({ ts: tsDe(o.fecha, x.fin || x.ini || o.horaFin), n: 1, cols: x.num ? [x.num] : [], ot: o.numero || "" }); } });
        if (q - n > 0) ev.push({ ts: tsDe(o.fecha, o.horaFin), n: q - n, cols: [], ot: o.numero || "" });
        conFechaCerr += q;
      } else if (abiertaOt(o) && String(o.fecha || "") < fecha && num(obj(o.previsto).hormigonado) > 0 && arr(o.actividades).indexOf("hormigonado") >= 0) {
        ev.push({ ts: tsDe(o.fecha, o.horaFin), n: num(o.previsto.hormigonado), cols: [], ot: o.numero || "", planeada: true });
      }
    });
    return { ev, conFechaCerr };
  }
  function faltaMaterial(id) {
    const out = [];
    const rs = arr(window.reservasMaterial).filter((r) => r && String(r.plazaId || "") === String(id) && !/entregada|anulada|rechazada/.test(String(r.estado || "")));
    const C = new Map(); intentar(() => (typeof window.catalogoCompleto == "function" ? window.catalogoCompleto() : []).forEach((x) => C.set(String(x.codigo), x)), null);
    const pide = {};
    rs.forEach((r) => arr(r.items).forEach((it) => { if (!it || it.nohay) return; const cod = String(it.codigo == null ? "" : it.codigo); const q = Math.max(0, num(it.cant != null ? it.cant : it.cantidad) - num(it.entregado)); if (!(q > 0)) return; const x = pide[cod] = pide[cod] || { cod, q: 0, desc: it.desc || "", un: it.un || "", rs: r.numero || "" }; x.q += q; }));
    Object.keys(pide).forEach((cod) => {
      const x = pide[cod], hay = intentar(() => num(stockActual(cod)), 0), c = C.get(cod) || {};
      if (x.q > hay) out.push({ cod, desc: x.desc || c.desc || "Material " + cod, un: x.un || c.un || "", falta: r2(x.q - Math.max(0, hay)), hay: Math.max(0, r2(hay)), pide: r2(x.q), rs: x.rs });
    });
    return out;
  }

  // ======================================================================= el motor: un día
  // S = lo que ya sugirieron los días anteriores (encadenado) · Ed = cambios de la persona para ese día { obraId: {...} }
  function nuevoS() { return { asig: {}, horm: {}, cols: {} }; }
  function armarDia(fecha, S, Ed, C) {
    Ed = Ed || {}; S = S || nuevoS(); C = C || cfg();
    const H = horasDia(fecha, C), dd = deIso(fecha);
    const dia = { fecha, horas: H, sabado: !!dd && dd.getDay() === 6, ordenes: [], libres: [], ausentes: [], sinCalculo: [], avisos: [], emitidas: [] };
    if (!(H > 0)) { dia.noSeTrabaja = true; return dia; }
    const otsDia = ots().filter((o) => o && o.estado !== "Anulada" && String(o.fecha || "") === fecha);
    const ocup = {}; otsDia.forEach((o) => nombresOt(o).forEach((n) => { ocup[nk(n)] = o; }));
    const nom = nomina(), enNom = (n) => nom.some((p) => nk(p.nombre) === nk(n));
    nom.forEach((p) => { const a = ausente(p.nombre, fecha); if (a) dia.ausentes.push({ nombre: p.nombre, txt: ausTxt(p.nombre, a), motivo: a.motivo, hasta: a.hasta }); });
    const aus = (n) => ausente(n, fecha);
    const conTipos = tiposCargados();
    if (C.reglas.vehiculos && !conTipos && vehLista().length) dia.avisos.push({ n: "ambar", t: "Cargá el tipo de los vehículos (Producción › Personal del equipo): sin la grúa cargada no propongo izaje." });
    // vehículos ya usados ese día (órdenes emitidas)
    const vehUsado = {}; otsDia.forEach((o) => arr(o.vehiculos).forEach((v) => { if (v && v.id) vehUsado[v.id] = o.numero || "otra orden"; }));
    const civilesTodos = nom.filter((p) => p.equipoCivil).map((p) => p.nombre), hayCivil = civilesTodos.length > 0;
    // obras activas
    const cands = [];
    obras().forEach((o) => {
      if (!obraActiva(o, fecha)) return;
      const sd = intentar(() => window.saldoObra(o.id), null); if (!sd) return;
      const conT = Object.keys(sd.tareas || {}).some((k) => sd.tareas[k].total > 0);
      if (sd.sinCalculo || !conT) { dia.sinCalculo.push({ obraId: o.id, obra: o.nombre || o.plazaNombre || "", ID: o.obraId || "" }); return; }
      const l = otsDeObra(o.id).slice().sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")) || num(b.creado || b.ts) - num(a.creado || a.ts));
      const ult = l.find((x) => String(x.fecha || "") < fecha && nombresOt(x).some((n) => !esCivil(n))) || null;
      const ultCiv = l.find((x) => String(x.fecha || "") < fecha && nombresOt(x).some(esCivil)) || null;
      cands.push({ o, sd, ult, ultCiv, l, ed: obj(Ed[o.id]) });
    });
    const ayerDe = (c) => c.l.some((x) => cerradaOt(x) && String(x.fecha || "") >= sumar(fecha, -7) && Object.keys(obj(x.previsto)).some((k) => num(x.previsto[k]) > num(obj(x.cierre.cantidades)[k]) && !obj(x.pasadoA)[k]));
    cands.sort((a, b) => (ayerDe(b) ? 1 : 0) - (ayerDe(a) ? 1 : 0) || String((b.ult || {}).fecha || "").localeCompare(String((a.ult || {}).fecha || "")));
    // ya emitida: una orden de esa obra ese día con la gente de la cuadrilla (o emitida desde acá)
    cands.forEach((c) => {
      const otra = otsDia.filter((x) => abiertaOt(x) && String(x.plazaId || "") === String(c.o.id));
      c.otra = otra;
      const crew = c.ult ? nombresOt(c.ult).map(nk) : [];
      c.emitida = otra.find((x) => st.emit[fecha + "|" + c.o.id] === x.numero || nombresOt(x).some((n) => crew.indexOf(nk(n)) >= 0)) || null;
    });
    // el equipo civil: a la obra que más lo necesita (la que va a izar sin el cable a la vista, o la de la última vez)
    const tomado = {};
    cands.forEach((c) => arr(c.ed.sumar).forEach((n) => { if (c.ed.incluir !== false) tomado[nk(n)] = c.o.id; }));
    let civObra = "";
    if (hayCivil) {
      const civLibres = civilesTodos.filter((n) => !ocup[nk(n)] && !aus(n) && !tomado[nk(n)]);
      const forz = cands.find((c) => arr(c.ed.sumar).some(esCivil));
      if (forz) civObra = forz.o.id;
      else if (civLibres.length) {
        let mejor = null, pm = -1;
        cands.forEach((c) => {
          if (c.emitida) return;   // sacar una obra de la emisión no manda el equipo civil a otra: queda libre
          const T = c.sd.tareas, q = (k) => (T[k] && T[k].queda > 0 ? T[k].queda - num(obj(S.asig[c.o.id])[k]) : 0);
          const civ = CIVIL_T.concat(AMBOS_T).filter((k) => q(k) > 0 && arr(c.ed.sacarCivil).length === 0).length; if (!civ) return;
          const iz = IZ.some((k) => q(k) > 0) && q("tendido_cable") > 0;
          const p = (iz ? 100 : 0) + (c.ultCiv ? 50 : 0) + civ;
          if (p > pm) { pm = p; mejor = c; }
        });
        if (mejor) civObra = mejor.o.id;
      }
    }
    const grua = () => vehLista().filter((v) => v.tipo === "grua" && !vehUsado[v.id])[0] || null;
    cands.forEach((c) => {
      const o = c.o, ed = c.ed;
      const ord = { obraId: o.id, obra: o.nombre || o.plazaNombre || "", ID: o.obraId || "", direccion: o.direccion || "", avance: intentar(() => Math.round(calcularAvanceEtapasPct(o)), null), gente: [], ocupados: [], ausentes: [], vehiculos: [], tareas: [], bloqueadas: [], pendientes: [], avisos: [], hhDisp: 0, hhUsadas: 0, pts: null, yaHay: [], incluir: true, n: 0, emitida: null };
      if (c.emitida) {   // ya está: se muestra lo emitido
        const x = c.emitida; ord.emitida = { id: x.id, numero: x.numero || "", responsable: x.responsable || "" }; ord.incluir = false;
        ord.gente = nombresOt(x).map((n) => ({ nombre: n, rol: rolDe(n) })); ord.vehiculos = arr(x.vehiculos).filter(Boolean);
        ord.tareas = arr(x.actividades).map((k) => ({ k, label: labelDe(k), un: ((c.sd.tareas[k] || {}).un) || (dicc(k) || {}).un || "", cant: num(obj(x.previsto)[k]), cols: [], colsTxt: "", porque: [], rend: null, hh: 0 }));
        ord.horaInicio = x.horaInicio || ""; ord.horaFin = x.horaFin || "";
        ord.pts = intentar(() => window.__ordenNueva.puntos(x), null);
        nombresOt(x).forEach((n) => { tomado[nk(n)] = o.id; });
        arr(x.vehiculos).forEach((v) => { if (v && v.id) vehUsado[v.id] = x.numero || ord.obra; });
        dia.emitidas.push(ord); dia.ordenes.push(ord); return;
      }
      if (c.otra.length) { ord.yaHay = c.otra.map((x) => x.numero || "otra orden"); ord.avisos.push({ n: "ambar", t: `Ya hay ${ord.yaHay.join(", ")} para esta obra ese día: al emitir, la app pregunta si sumarla ahí (una orden por obra y día).` }); }
      // gente: la misma cuadrilla hasta terminar la obra (Ángel)
      const crew = C.reglas.mismaGente && c.ult ? nombresOt(c.ult).filter((n) => !esCivil(n)) : [];
      const quitar = arr(ed.sacar).map(nk), lista = [], cambia = [];
      crew.forEach((n) => {
        if (quitar.indexOf(nk(n)) >= 0 || !enNom(n)) return;
        if (tomado[nk(n)] && tomado[nk(n)] !== o.id) { cambia.push(`${n.split(" ")[0]} va a otra obra`); return; }
        const a = aus(n); if (a) { ord.ausentes.push({ nombre: n, txt: ausTxt(n, a) }); cambia.push(ausTxt(n, a)); return; }
        if (ocup[nk(n)]) { ord.ocupados.push({ nombre: n, ot: ocup[nk(n)].numero || "otra orden", obra: ocup[nk(n)].plazaNombre || "" }); return; }
        lista.push(n);
      });
      if (civObra === o.id) civilesTodos.forEach((n) => { if (quitar.indexOf(nk(n)) >= 0 || lista.some((x) => nk(x) === nk(n)) || ocup[nk(n)] || aus(n) || (tomado[nk(n)] && tomado[nk(n)] !== o.id)) return; lista.push(n); });
      arr(ed.sumar).forEach((n) => { if (lista.some((x) => nk(x) === nk(n))) return; lista.push(n); if (ocup[nk(n)]) ord.avisos.push({ n: "rojo", t: `${n} ya está en la ${ocup[nk(n)].numero || "otra orden"} ese día.` }); const a = aus(n); if (a) ord.avisos.push({ n: "rojo", t: `${ausTxt(n, a)}.` }); });
      ord.incluir = ed.incluir !== false;
      if (ord.incluir) lista.forEach((n) => { tomado[nk(n)] = o.id; });
      ord.gente = lista.map((n) => ({ nombre: n, rol: rolDe(n), sumado: arr(ed.sumar).some((x) => nk(x) === nk(n)), civil: esCivil(n) }));
      ord.ocupados.forEach((x) => ord.avisos.push({ n: "rojo", t: `${x.nombre} ya está en la ${x.ot}${x.obra && x.obra !== ord.obra ? " (" + x.obra + ")" : ""} ese día.`, cambiar: true }));
      if (cambia.length && crew.length) ord.avisos.push({ n: "ambar", t: `Cambia la cuadrilla de esta obra (Ángel: la misma gente hasta terminarla): ${cambia.join(" · ")}.`, cambiar: true });
      if (civObra === o.id && ord.gente.some((p) => p.civil)) ord.civil = true;
      // tareas (con los vehículos que hay libres)
      const libres = vehLista().filter((v) => !vehUsado[v.id]);
      let vehFijos = ed.veh !== undefined ? arr(ed.veh).map((id) => vehLista().find((v) => v.id === id)).filter(Boolean) : null;
      const capac = vehFijos ? { grua: vehFijos.some((v) => v.tipo === "grua"), altura: vehFijos.some((v) => v.tipo === "hidro" || v.tipo === "barquilla"), barq: vehFijos.filter((v) => v.tipo === "barquilla").length }
        : { grua: !!grua(), gruaEn: vehLista().filter((v) => v.tipo === "grua").map((v) => vehUsado[v.id]).filter(Boolean)[0] || "", altura: libres.some((v) => v.tipo === "hidro" || v.tipo === "barquilla"), barq: Math.min(2, libres.filter((v) => v.tipo === "barquilla").length) };
      if (!C.reglas.vehiculos) { capac.grua = true; capac.altura = true; capac.barq = Math.max(1, capac.barq); }
      else if (!conTipos) { capac.altura = true; capac.barq = Math.max(1, capac.barq); }
      llenar(ord, c, fecha, S, ed, C, H, capac, hayCivil);
      // vehículos: la grúa para el izaje, hidro o barquilla para la altura, barquillas para el tablero, transporte para el civil
      ord.vehiculos = vehFijos || elegirVeh(ord, libres, C, conTipos);
      ord.vehiculos.forEach((v) => { if (ord.incluir) vehUsado[v.id] = ord.obra; });
      const lug = ord.vehiculos.reduce((s, v) => s + num(v.lugares), 0), sinLug = ord.vehiculos.some((v) => !num(v.lugares));
      if (ord.gente.length && !ord.vehiculos.length) ord.avisos.push({ n: "rojo", t: "Sin vehículo: no queda ninguno libre para esta cuadrilla.", cambiar: true });
      else if (C.reglas.vehiculos && conTipos && !sinLug && lug < ord.gente.length) ord.avisos.push({ n: "rojo", t: `No hay lugar: van ${ord.gente.length} y los vehículos tienen ${lug} lugares.`, cambiar: true });
      faltaMaterial(o.id).forEach((m) => ord.avisos.push({ n: "ambar", t: `Pañol: ${m.desc} (${m.cod}) hay ${fN(m.hay)} y la reserva ${m.rs} pide ${fN(m.pide)} → falta ${fN(m.falta)}${m.un ? " " + m.un : ""}${/\.$/.test(m.un) ? "" : "."} La orden sale igual: avisale al pañol.` }));
      if (!ord.gente.length) ord.avisos.push({ n: "rojo", t: crew.length ? "Nadie de la cuadrilla de esta obra está libre ese día: sumá a alguien con ＋." : "Esta obra no tiene cuadrilla de antes: sumá a alguien con ＋.", cambiar: true });
      if (!ord.tareas.length || !ord.gente.length) ord.incluir = false;
      if (!ord.incluir) lista.forEach((n) => { if (tomado[nk(n)] === o.id && !arr(ed.sumar).some((x) => nk(x) === nk(n))) delete tomado[nk(n)]; });
      if (!ord.incluir) ord.vehiculos.forEach((v) => { if (vehUsado[v.id] === ord.obra) delete vehUsado[v.id]; });
      ord.pts = puntosDe(ord, fecha);
      dia.ordenes.push(ord);
    });
    nom.forEach((p) => { if (ocup[nk(p.nombre)] || tomado[nk(p.nombre)] || aus(p.nombre)) return; dia.libres.push({ nombre: p.nombre, rol: p.rol || "", civil: !!p.equipoCivil }); });
    dia.ordenes.forEach((o, i) => { o.n = i + 1; });
    return dia;
  }
  function elegirVeh(ord, libres, C, conTipos) {
    const out = [], usa = (v) => { if (v && out.indexOf(v) < 0) out.push(v); }, ks = ord.tareas.map((t) => t.k);
    const aCargo = ord.gente.map((p) => vehDe(p.nombre)).filter((v) => v && libres.indexOf(v) >= 0);
    if (!conTipos || !C.reglas.vehiculos) { usa(aCargo[0] || null); return out; }
    if (ks.some(esIzaje)) usa(libres.find((v) => v.tipo === "grua"));
    if (ks.some((k) => TABLERO_T.indexOf(k) >= 0)) libres.filter((v) => v.tipo === "barquilla").slice(0, Math.max(1, ord.barqUsadas || 1)).forEach(usa);
    if (ks.some((k) => ALTURA_T.indexOf(k) >= 0) && !out.some((v) => v.tipo === "hidro" || v.tipo === "barquilla")) usa(aCargo.find((v) => v.tipo === "hidro" || v.tipo === "barquilla") || libres.find((v) => v.tipo === "hidro") || libres.find((v) => v.tipo === "barquilla"));
    if (ord.civil) usa(aCargo.find((v) => v.tipo === "transporte") || libres.find((v) => v.tipo === "transporte" && out.indexOf(v) < 0));
    // lugares: que entren todos
    const lug = () => out.reduce((s, v) => s + num(v.lugares), 0);
    if (!out.length) usa(aCargo.find((v) => v.tipo !== "grua") || libres.find((v) => v.tipo === "transporte") || null);
    const mas = aCargo.filter((v) => v.tipo !== "grua").concat(libres.filter((v) => v.tipo === "transporte" || v.tipo === "auto"));
    for (let i = 0; i < mas.length && lug() < ord.gente.length && out.every((v) => num(v.lugares) > 0); i++) usa(mas[i]);
    return out.filter(Boolean);
  }
  // la jornada de una obra: tareas en orden de obra hasta las horas-hombre de cada grupo
  function llenar(ord, c, fecha, S, ed, C, H, capac, hayCivil) {
    const o = c.o, sd = c.sd, T = sd.tareas, id = o.id, sa = obj(S.asig[id]);
    const gCiv = ord.gente.filter((p) => p.civil).length, gMon = ord.gente.length - gCiv;
    // con equipo civil en la nómina: el civil hace lo civil y la cuadrilla el montaje; si no, todos todo
    const pools = hayCivil ? { civil: gCiv * H, montaje: gMon * H } : { todos: ord.gente.length * H };
    const poolDe = (k) => (!hayCivil ? "todos" : CIVIL_T.indexOf(k) >= 0 ? "civil" : AMBOS_T.indexOf(k) >= 0 ? (gCiv ? "civil" : "montaje") : "montaje");
    const genteDe = (k) => (poolDe(k) === "civil" ? gCiv : poolDe(k) === "montaje" ? gMon : ord.gente.length);
    const rest = Object.assign({}, pools);
    ord.hhDisp = r2(ord.gente.length * H);
    const Tt = (k) => num((T[k] || {}).total);
    const queda = (k) => { const t = T[k]; if (!t || t.queda == null) return 0; return r2(num(t.queda) - num(sa[k])); };
    const hecho = (k) => num((T[k] || {}).hecho);
    const antes = {}; c.l.forEach((x) => { if (abiertaOt(x) && String(x.fecha || "") < fecha) arr(x.actividades).forEach((k) => { antes[k] = num(antes[k]) + num(obj(x.previsto)[k]); }); });
    const disp = (k) => hecho(k) + num(antes[k]) + num(sa[k]);
    const yaH = (k) => (Tt(k) ? Tt(k) - queda(k) : hecho(k) + num((T[k] || {}).asignado) + num(sa[k]));
    const hoyK = {};
    const ayer = {}, abiertas = {}, agregarK = {}; arr(ed.agregar).forEach((k) => { agregarK[k] = 1; });   // zanja con máquina: solo si la piden (Ángel: casi siempre a mano)
    c.l.forEach((x) => {
      if (cerradaOt(x) && x.estado !== "En curso" && String(x.fecha || "") >= sumar(fecha, -7) && String(x.fecha || "") < fecha) Object.keys(obj(x.previsto)).forEach((k) => { const p = num(x.previsto[k]), h = num(obj(x.cierre.cantidades)[k]); if (p > h && !obj(x.pasadoA)[k] && (!ayer[k] || String(ayer[k].fecha) < String(x.fecha))) ayer[k] = { ot: x.numero || "", fecha: x.fecha, h, p }; });
      if (abiertaOt(x) && String(x.fecha || "") < fecha) arr(x.actividades).forEach((k) => { const env = obj(obj(obj(x.campo).tareaEnv)[Lk(k)]), no = Object.keys(env).map((q) => env[q]).find((v) => v && v.estado === "no"); (abiertas[k] = abiertas[k] || []).push({ ot: x.numero || "", fecha: x.fecha, q: num(obj(x.previsto)[k]), no: no ? (no.motivo || "sin motivo") : "" }); });
    });
    Object.keys(abiertas).forEach((k) => { if (VIEJAS().indexOf(k) >= 0) return; abiertas[k].forEach((a) => ord.avisos.push({ n: "ambar", t: `«${labelDe(k)}» sigue en la ${a.ot} del ${fCorta(a.fecha)} sin cerrar (${fN(a.q)})${a.no ? `; la cuadrilla marcó «No se hizo»: ${a.no}` : ""}. No la cuento dos veces: cerrala y se vuelve a sugerir lo que falte.`, cerrar: a.ot })); });
    const cand = Object.keys(T).filter((k) => queda(k) > 0 && !(k === "zanja_maquina" && Tt("zanjeo") > 0 && !agregarK[k]) && VIEJAS().indexOf(k) < 0 && catalogo().some((x) => x && x.id === k) && (C.galpon || GALPON.indexOf(k) < 0));
    const algoHecho = Object.keys(T).some((k) => hecho(k) > 0);
    const noFinal = cand.filter((k) => FINAL.indexOf(k) < 0);
    const lista = cand.filter((k) => !(k === "replanteo" && algoHecho) && !(FINAL.indexOf(k) >= 0 && noFinal.length)).sort((a, b) => posOrden(a) - posOrden(b));
    ord.pendientes = lista.slice();
    const quitar = obj(ed.quitar), fija = obj(ed.cant), agregar = arr(ed.agregar);
    const izK = IZ.find((k) => Tt(k) > 0) || "";
    const fr = num(C.fraguado) || 72;
    const avisoUna = {}; const aviso = (n, t) => { if (avisoUna[t]) return; avisoUna[t] = 1; ord.avisos.push({ n, t }); };
    function tope(k) {
      const q = queda(k), mot = [], R = C.reglas;
      let cap = q;
      if (R.pozoHorm && k === "hormigonado" && Tt("excavacion") > 0) { const c2 = disp("excavacion") + num(hoyK.excavacion) - yaH("hormigonado"); if (c2 < cap) { cap = c2; mot.push(c2 > 0 ? "Hormigón solo en los pozos ya cavados" : "Primero el pozo"); } if (num(hoyK.excavacion) > 0) mot.push("El mismo día que el pozo (Ángel)"); }
      if (R.fraguado && esIzaje(k) && Tt("hormigonado") > 0) {
        const hz = hormigonadas(id, fecha), ev = hz.ev.concat(arr(S.horm[id])), inicio = tsDe(fecha, dia0(fecha, C)), lim = fr * 3600e3;
        const sinFecha = Math.max(0, hecho("hormigonado") - hz.conFechaCerr);
        const listas = ev.filter((e) => e.ts + lim <= inicio).reduce((s, e) => s + e.n, 0) + sinFecha;
        const c2 = listas - yaH(k);
        if (sinFecha > 0) aviso("ambar", `No sé cuándo se hormigonaron ${fN(sinFecha)} ${sinFecha === 1 ? "base" : "bases"} (cargadas sin fecha): no bloqueo el izaje por el fraguado.`);
        if (c2 < cap) {
          cap = c2;
          const pend = ev.filter((e) => e.ts + lim > inicio).sort((a, b) => a.ts - b.ts), prox = pend[0];
          if (prox) {
            const dListo = desdeDia(prox.ts + lim, C), cols = pend.reduce((l, e) => l.concat(e.cols), []);
            mot.push(`${cols.length ? colsTxt(cols) + ": " : ""}se hormigon${pend.length > 1 || prox.n > 1 ? "aron" : "ó"} el ${fLarga(iso(new Date(prox.ts)))}${prox.planeada ? (/^sugerida/.test(prox.ot) ? " (en la sugerida)" : " (orden sin cerrar)") : ""} → fraguan hasta el ${fDia(iso(new Date(prox.ts + lim)))} → izaje desde el ${fLarga(dListo)} (${fN(fr)} h)`);
            ord.fraguado = { k, desde: dListo, cols };
          } else if (c2 <= 0) mot.push("No hay bases hormigonadas para izar");
        } else if (ev.length) { const ult = ev.filter((e) => e.ts + lim <= inicio).sort((a, b) => b.ts - a.ts)[0]; if (ult) mot.push(`Bases hormigonadas el ${fCorta(iso(new Date(ult.ts)))}: ya pasaron las ${fN(fr)} h de fraguado`); }
      }
      if (R.zanjaCable && k === "tendido_cable" && Tt("zanjeo") > 0) { const f = Math.min(1, disp("zanjeo") / Tt("zanjeo")), c2 = Math.floor(Tt(k) * f - yaH(k) + 1e-9); if (c2 < cap) { cap = c2; mot.push(c2 > 0 ? `Solo donde la zanja ya está abierta (${fN(disp("zanjeo"))} m de zanja)` : "Primero la zanja"); } else if (disp("zanjeo") > 0) mot.push(`La zanja ya está abierta (${fN(disp("zanjeo"))} m)`); }
      if (R.zanjaCable && k === "tapado_zanja" && Tt("tendido_cable") > 0) { const f = Math.min(1, (disp("tendido_cable") + num(hoyK.tendido_cable)) / Tt("tendido_cable")), c2 = Math.floor(Tt(k) * f - yaH(k) + 1e-9); if (c2 < cap) { cap = c2; mot.push(c2 > 0 ? "Solo lo que ya tiene cable" : "No tapo lo que no tiene cable"); } }
      if (R.izajeCadena && izK && ["montaje_vinculo", "conexionado_tablerito", "aplomado_columna", "sellado_base"].indexOf(k) >= 0) { const c2 = disp(izK) + (k === "montaje_vinculo" || k === "conexionado_tablerito" ? num(hoyK[izK]) : 0) - yaH(k); if (c2 < cap) { cap = c2; mot.push(c2 > 0 ? (k === "sellado_base" || k === "aplomado_columna" ? "Solo las columnas ya izadas (con el cable subido)" : "Solo en las columnas ya izadas") : "Primero el izaje"); } }
      if (R.izajeCadena && k === "montaje_luminaria" && Tt("montaje_vinculo") > 0) { const f = Math.min(1, (disp("montaje_vinculo") + num(hoyK.montaje_vinculo)) / Tt("montaje_vinculo")), c2 = Math.floor(Tt(k) * f - yaH(k) + 1e-9); if (c2 < cap) { cap = c2; mot.push(c2 > 0 ? "Va después del vínculo, en las mismas columnas" : "Primero el vínculo"); } else mot.push("Va después del vínculo, en las mismas columnas"); }
      if (R.patTablerito && k === "pat" && Tt("conexionado_tablerito") > 0) { const f = Math.min(1, (disp("conexionado_tablerito") + num(hoyK.conexionado_tablerito)) / Tt("conexionado_tablerito")), c2 = Math.ceil(Tt(k) * f - yaH(k) - 1e-9); if (c2 < cap) { cap = c2; mot.push(c2 > 0 ? "Con los tableritos de esas columnas" : "Va el día de los tableritos"); } }
      // vehículos (Ángel): izaje solo con la grúa libre; altura con hidro o barquilla; tablero con barquilla
      if (esIzaje(k) && !capac.grua && cap > 0) { cap = 0; mot.push(C.reglas.vehiculos && !tiposCargados() ? "Sin la grúa cargada en los vehículos no propongo izaje" : `La grúa ya va ${capac.gruaEn ? "a " + capac.gruaEn : "a otra orden"} ese día: no hay izaje`); }
      if (ALTURA_T.indexOf(k) >= 0 && !capac.altura) { cap = 0; mot.push("No queda hidro chica ni barquilla libre"); }
      if (TABLERO_T.indexOf(k) >= 0 && !capac.barq) { cap = 0; mot.push("No queda barquilla libre"); }
      return { cap: Math.max(0, Math.floor(cap + 1e-9)), mot, q };
    }
    const metidas = {};
    function meter(k, forzada) {
      if (metidas[k] || quitar[k]) return;
      const pool = poolDe(k), g = genteDe(k);
      if (!g && fija[k] == null && !forzada) return;
      const tp = tope(k), un = (T[k] && T[k].un) || (dicc(k) || {}).un || "";
      const porque = [];
      if (ayer[k]) porque.push(`Quedó de ${ayer[k].fecha === sumar(fecha, -1) ? "ayer" : "la orden del " + fCorta(ayer[k].fecha)} en la ${ayer[k].ot} (se hicieron ${fN(ayer[k].h)} de ${fN(ayer[k].p)})`);
      porque.push(`Quedan ${fN(tp.q)} de ${fN(Tt(k) || tp.q)}`);
      const ctx = { gente: g, horas: H, un, barquillas: capac.barq, conTablerito: num(hoyK.conexionado_tablerito) > 0, conTablero: num(hoyK.colocacion_tablero) > 0, civil: pool === "civil" || (!hayCivil) };
      let conCable = 0;
      if (esIzaje(k)) { const fc = Tt("tendido_cable") > 0 ? Math.min(1, disp("tendido_cable") / Tt("tendido_cable")) : 0; conCable = Math.floor(Tt(k) * fc - yaH(k) + 1e-9); ctx.civilListo = conCable > 0; }
      const r = g ? rend(k, C, ctx) : null;
      let capR = tp.cap;
      if (r && (r.modoIz === "civil" || r.modoIz === "cano3") && conCable < capR) { capR = Math.max(0, conCable); tp.mot.push("Con el equipo civil: solo las columnas con el cable a la vista"); }
      let cant = 0, gratis = 0;
      if (k === "montaje_vinculo" && izK && num(hoyK[izK]) > 0 && hoyK.__izAngel && hoyK.__izAngel !== "cano2" && hoyK.__izAngel !== "cano3" && hoyK.__izAngel !== "guia") gratis = Math.min(capR, num(hoyK[izK]));
      if (fija[k] != null) cant = Math.max(0, Math.min(num(fija[k]), tp.q));
      else if (!g) cant = forzada && capR > 0 ? 1 : 0;
      else if (!r) { cant = capR > 0 ? 1 : 0; if (cant) aviso("ambar", `«${labelDe(k)}» no tiene horas en el diccionario ni medidas: puse 1, ajustala.`); }
      else if (r.sinTope || r.todoDia) cant = capR;
      else {
        let porHH = Math.floor(Math.max(0, rest[pool]) * r.porHH + 1e-9);
        if (r.tope != null) porHH = Math.min(porHH, r.tope);
        cant = Math.min(capR, gratis + porHH);
        if (forzada && cant <= 0 && capR > 0) cant = 1;
      }
      if (fija[k] != null && cant > tp.cap) aviso("ambar", `«${labelDe(k)}»: pusiste ${fN(cant)} y por el orden de obra entran ${fN(tp.cap)} (${tp.mot.join("; ") || "revisá"}).`);
      if (!(cant > 0)) { if (tp.mot.length && capR <= 0) ord.bloqueadas.push({ k, label: labelDe(k), motivo: tp.mot.join(" · ") }); return; }
      metidas[k] = 1;
      const hh = r && r.todoDia ? r2(Math.max(0, rest[pool])) : r && r.porHH && !r.sinTope ? r2(Math.max(0, cant - gratis) / r.porHH) : 0;
      rest[pool] = r2(rest[pool] - hh);
      hoyK[k] = cant; if (esIzaje(k) && r && r.fuente === "angel") hoyK.__izAngel = r.modoIz;
      if (k === "colocacion_tablero") ord.barqUsadas = capac.barq;
      tp.mot.forEach((m) => porque.push(m));
      if (gratis > 0) porque.push(`${fN(Math.min(gratis, cant))} van con el izaje (según Ángel: «poner vínculo, subir»)${hoyK.__izAngel === "civil" ? " · con el equipo civil: a confirmar" : ""}`);
      if (r) porque.push(r.txt);
      if (hayCivil) porque.push(pool === "civil" ? "Equipo civil" : "Cuadrilla de montaje");
      if (esIzaje(k) && r && r.fuente === "angel" && r.modoIz === "todo") ord.sugiereCivil = true;
      if ((k === "excavacion" || k === "hormigonado") && r && r.todoDia && cant > num(obj(C.angel).bases || 5)) aviso("ambar", `Pedir camión de hormigón para el ${fLarga(fecha)}: son ${fN(cant)} bases (más de ${fN(obj(C.angel).bases || 5)}, según Ángel).`);
      if ((k === "excavacion" || k === "hormigonado") && r && r.todoDia && cant <= num(obj(C.angel).bases || 5)) porque.push(`${fN(cant)} bases: a mano (hasta ${fN(obj(C.angel).bases || 5)}, según Ángel)`);
      if (k === "colocacion_tablero") aviso("info", "Alistá el tablero en el galpón el día anterior (prensacables, agujeros, cable de alimentación 4×16 o 3×1×25+16): no hay una tarea de galpón para eso en el diccionario.");
      // columnas concretas
      let cols = [];
      if (POR_COL.indexOf(k) >= 0 || (k === "montaje_luminaria" && izK && Tt(k) === Tt(izK))) {
        const nms = nombresCol(id);
        if (nms.length) {
          const hechas = hechasCol(id, k), usados = new Set(arr(obj(S.cols[id])[k]).map(nk));
          const consumidas = Math.max(0, Math.round(yaH(k)));
          let n0 = 0; const lib = [];
          nms.forEach((x) => { if (hechas.has(nk(x))) n0++; else lib.push(x); });
          cols = lib.filter((x) => !usados.has(nk(x))).slice(Math.max(0, consumidas - n0 - usados.size)).slice(0, Math.round(cant));
        }
      }
      ord.tareas.push({ k, label: labelDe(k), un, cant: r2(cant), cols, colsTxt: colsTxt(cols), porque, rend: r ? { porHH: r.porHH || 0, fuente: r.fuente, txt: r.txt, modoIz: r.modoIz || "" } : null, hh, queda: tp.q, total: Tt(k) || tp.q, fija: fija[k] != null, ayer: !!ayer[k], pool });
    }
    lista.concat(agregar.filter((k) => lista.indexOf(k) < 0 && queda(k) > 0)).sort((a, b) => posOrden(a) - posOrden(b)).forEach((k) => meter(k, agregar.indexOf(k) >= 0));
    ord.tareas.sort((a, b) => posOrden(a.k) - posOrden(b.k));
    ord.hhUsadas = r2(Object.keys(pools).reduce((s, p) => s + pools[p] - rest[p], 0));
    if (ord.hhUsadas > ord.hhDisp + 0.05 && ord.gente.length) aviso("ambar", `Te pasás de la jornada: ${fN(ord.hhUsadas)} de ${fN(ord.hhDisp)} HH.`);
    if (ord.sugiereCivil && izK && queda(izK) > 0) { const A = C.angel; aviso("info", `Lo ideal: el equipo civil antes (zanja de la acometida abierta y cable a la vista, fundaciones y telgopor limpios) y cuadrilla de ${fN(A.izCivil.personas)} → ${fN(A.izCivil.porDia)} columnas por día en vez de ${fN(A.izTodo.porDia)}–${fN(A.izTodo.tope)} (según Ángel). Es una sugerencia.`); }
  }
  const dia0 = (f, C) => { const d = deIso(f); return d && d.getDay() === 6 ? C.sabIni : C.ini; };
  function desdeDia(ts, C) { let f = iso(new Date(ts)); for (let i = 0; i < 14; i++) { if (horasDia(f, C) > 0 && tsDe(f, dia0(f, C)) >= ts) return f; f = sumar(f, 1); } return f; }
  function datosOt(ord, fecha) {
    const prev = {}; ord.tareas.forEach((t) => { if (t.cant > 0) prev[t.k] = t.cant; });
    return { plazaId: ord.obraId, plazaNombre: ord.obra, fecha, actividades: ord.tareas.filter((t) => t.cant > 0).map((t) => t.k), previsto: prev, asignada: {}, personal: ord.gente.map((p) => ({ nombre: p.nombre, rol: p.rol })), personalNombres: ord.gente.map((p) => nk(p.nombre)) };
  }
  function puntosDe(ord, fecha) { if (!ord.gente.length || !ord.tareas.length) return null; return intentar(() => window.__ordenNueva.puntos(datosOt(ord, fecha)), null); }

  // ======================================================================= varios días (encadenado)
  function encadenar(S, dia) {
    dia.ordenes.forEach((o) => {
      if (!o.incluir || o.emitida) return;
      const a = S.asig[o.obraId] = S.asig[o.obraId] || {};
      o.tareas.forEach((t) => { a[t.k] = r2(num(a[t.k]) + t.cant); if (t.cols.length) { const c = S.cols[o.obraId] = S.cols[o.obraId] || {}; c[t.k] = arr(c[t.k]).concat(t.cols); } if (t.k === "hormigonado") (S.horm[o.obraId] = S.horm[o.obraId] || []).push({ ts: tsDe(dia.fecha, null), n: t.cant, cols: t.cols.slice(), ot: "sugerida del " + fCorta(dia.fecha), planeada: true }); });
    });
  }
  function armarHasta(fecha, E, C) {
    C = C || cfg(); E = E || {};
    const desde = proxHabil(hoyISO(), C), S = nuevoS(), dias = [];
    if (fecha < desde) { const d = armarDia(fecha, S, E[fecha], C); return { dia: d, dias: [d] }; }
    let f = desde;
    for (let i = 0; i < 40 && f < fecha; i++) { if (horasDia(f, C) > 0) { const d = armarDia(f, S, E[f], C); dias.push(d); encadenar(S, d); } f = sumar(f, 1); }
    const d = armarDia(fecha, S, E[fecha], C); dias.push(d); return { dia: d, dias };
  }
  function armarSemana(desde, E, C) {
    C = C || cfg(); E = E || {};
    const l = diasHabiles(desde, 5, C), S = nuevoS(), out = [];
    const prev = proxHabil(hoyISO(), C);
    for (let f = prev, i = 0; i < 40 && f < l[0]; i++, f = sumar(f, 1)) { if (horasDia(f, C) > 0) encadenar(S, armarDia(f, S, E[f], C)); }
    l.forEach((f) => { const d = armarDia(f, S, E[f], C); out.push(d); encadenar(S, d); });
    return out;
  }

  // ======================================================================= cambios (los mismos para los botones y para el asistente)
  function aplicar(E, fecha, c) {
    const D = E[fecha] = E[fecha] || {}, O = D[c.obraId] = D[c.obraId] || {};
    const L = (k) => (O[k] = arr(O[k]));
    if (c.tipo === "sacar_persona") { O.sumar = L("sumar").filter((n) => nk(n) !== nk(c.persona)); if (L("sacar").every((n) => nk(n) !== nk(c.persona))) O.sacar.push(c.persona); }
    else if (c.tipo === "sumar_persona") {
      O.sacar = L("sacar").filter((n) => nk(n) !== nk(c.persona));
      Object.keys(D).forEach((id) => { if (id === c.obraId) return; const X = D[id]; X.sumar = arr(X.sumar).filter((n) => nk(n) !== nk(c.persona)); X.sacar = arr(X.sacar); if (X.sacar.every((n) => nk(n) !== nk(c.persona))) X.sacar.push(c.persona); });
      if (L("sumar").every((n) => nk(n) !== nk(c.persona))) O.sumar.push(c.persona);
    }
    else if (c.tipo === "cantidad") { O.cant = obj(O.cant); O.cant[c.k] = Math.max(0, num(c.cantidad)); if (O.quitar) delete O.quitar[c.k]; if (L("agregar").indexOf(c.k) < 0) O.agregar.push(c.k); }
    else if (c.tipo === "sacar_tarea") { O.quitar = obj(O.quitar); O.quitar[c.k] = 1; O.agregar = L("agregar").filter((k) => k !== c.k); if (O.cant) delete O.cant[c.k]; }
    else if (c.tipo === "sumar_tarea") { if (O.quitar) delete O.quitar[c.k]; if (L("agregar").indexOf(c.k) < 0) O.agregar.push(c.k); if (c.cantidad != null && num(c.cantidad) > 0) { O.cant = obj(O.cant); O.cant[c.k] = num(c.cantidad); } }
    else if (c.tipo === "incluir") O.incluir = true;
    else if (c.tipo === "excluir") O.incluir = false;
    else if (c.tipo === "vehiculo") O.veh = arr(c.vehiculoIds || (c.vehiculoId ? [c.vehiculoId] : []));
    else if (c.tipo === "volver") delete D[c.obraId];
    return E;
  }
  const emitibles = (d) => d.ordenes.filter((o) => o.incluir && !o.emitida && o.gente.length && o.tareas.length);
  function diferencias(a, b) {
    const filas = [];
    b.ordenes.forEach((o) => {
      const x = a.ordenes.find((y) => y.obraId === o.obraId) || { gente: [], tareas: [], incluir: false, vehiculos: [] };
      const O = String(o.obra).toUpperCase();
      if (x.incluir !== o.incluir) filas.push({ c: O, a: x.incluir ? "se emite" : "no se emite", d: o.incluir ? "se emite" : "no se emite" });
      const ga = x.gente.map((p) => p.nombre).join(", "), gb = o.gente.map((p) => p.nombre).join(", ");
      if (ga !== gb) filas.push({ c: O + " · gente", a: ga || "—", d: gb || "—" });
      const va = arr(x.vehiculos).map((v) => v.nombre).join(", ") || "—", vb = arr(o.vehiculos).map((v) => v.nombre).join(", ") || "—"; if (va !== vb) filas.push({ c: O + " · vehículo", a: va, d: vb });
      const ks = {}; x.tareas.concat(o.tareas).forEach((t) => { ks[t.k] = 1; });
      Object.keys(ks).forEach((k) => { const ta = x.tareas.find((t) => t.k === k), tb = o.tareas.find((t) => t.k === k); const sa = ta ? fN(ta.cant) + " " + ta.un : "—", sb = tb ? fN(tb.cant) + " " + tb.un : "—"; if (sa !== sb) filas.push({ c: O + " · " + labelDe(k), a: sa, d: sb }); });
    });
    return filas;
  }

  // ======================================================================= estado de la hoja
  const KE = "ema.sug.E", KEM = "ema.sug.emit";
  const st = { fecha: "", vista: "obra", E: lsG(KE, {}), emit: lsG(KEM, {}), msg: "", abierta: false, cache: null, cacheK: "", ed: null };
  (() => { const h = hoyISO(); Object.keys(st.E).forEach((f) => { if (f < h) delete st.E[f]; }); })();
  const guardarE = () => lsS(KE, st.E);
  const emitida = (f, id) => st.emit[f + "|" + id] || null;
  function claveDatos() { const o = ots(); return [o.length, o.reduce((m, x) => Math.max(m, num(x && (x.ts || x.creado)), num(x && x.cierre && x.cierre.cerradoTs), num(x && x.editadoTs)), 0), o.filter((x) => x && x.estado === "Anulada").length, obras().length, arr(window.reservasMaterial).length, JSON.stringify(obj(window.__baremoNube).sugerida || null).length, JSON.stringify([pNube().ausencias, arr(pNube().nomina || pNube().lista).map((p) => p && p.equipoCivil), arr(pNube().vehiculos).map((v) => v && [v.tipo, v.lugares, v.activo])]).length, intentar(() => historial.length, 0)].join(":"); }
  function plan(f) {
    f = f || st.fecha || fechaDef();
    const k = f + "|" + claveDatos() + "|" + JSON.stringify(st.E) + "|" + JSON.stringify(cfgLocal || null) + "|" + Math.floor(Date.now() / 60000);
    if (st.cache && st.cacheK === k) return st.cache;
    st.cache = armarHasta(f, st.E).dia; st.cacheK = k; return st.cache;
  }
  const invalidar = () => { st.cache = null; st.cacheK = ""; };

  // ======================================================================= pantalla
  const ini = (n) => String(n || "").split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
  const avIco = (n) => (n === "info" ? "ⓘ" : "⚠");
  const abrev = (u) => ({ columna: "col.", "vínculo": "vínc.", luminaria: "lum.", metro: "m", base: "bases", pozo: "pozos", jabalina: "jab.", tablero: "tab." })[u] || u;
  const vehTxt = (l) => arr(l).map((v) => v.nombre + (v.patente ? " · " + v.patente : "")).join(" + ");
  const fDiaCorto = (f) => (f === sumar(hoyISO(), 1) ? "mañana" : f === hoyISO() ? "hoy" : "el " + fLarga(f));
  const kpis = (d) => { const l = emitibles(d), per = l.reduce((s, o) => s + o.gente.length, 0), pts = l.reduce((s, o) => s + num(o.pts && o.pts.total), 0), av = d.ordenes.filter((o) => o.incluir).reduce((s, o) => s + o.avisos.filter((a) => a.n !== "info").length, 0) + d.sinCalculo.length; return { n: l.length, per, pts: r2(pts), av, em: d.emitidas.length }; };
  function htmlTarjetaObra(o, d) {
    const em = o.emitida;
    const ch = o.gente.map((p) => `<span class="sg-ch${p.sumado ? " sum" : ""}${p.civil ? " civ" : ""}"><i>${esc(ini(p.nombre))}</i>${esc(p.nombre)}</span>`).join("") + o.ocupados.map((p) => `<span class="sg-ch oc" title="ya tiene orden"><i>${esc(ini(p.nombre))}</i><s>${esc(p.nombre)}</s></span>`).join("") + o.ausentes.map((p) => `<span class="sg-ch oc" title="${esc(p.txt)}"><i>${esc(ini(p.nombre))}</i><s>${esc(p.nombre)}</s></span>`).join("");
    const veh = o.vehiculos.length ? `<span class="sg-veh">🚚 ${esc(vehTxt(o.vehiculos))}</span>` : o.gente.length && !em ? '<span class="sg-veh rj">⚠ Sin vehículo</span>' : "";
    const ts = o.tareas.map((t) => `<div class="sg-t"><div class="sg-tc"><b>${esc(fN(t.cant))}</b><small>${esc(abrev(t.un))}</small></div><div class="sg-tx"><div class="sg-tl">${esc(t.label)}</div>${t.colsTxt ? `<div class="sg-tcols">${esc(t.colsTxt)}</div>` : ""}${t.porque.length ? `<div class="sg-pq">ⓘ ${t.porque.map(esc).join(" · ")}</div>` : ""}</div></div>`).join("");
    const bl = o.bloqueadas.map((b) => `<div class="sg-bl">🕓 <b>${esc(b.label)}</b>: ${esc(b.motivo)}</div>`).join("");
    const av = o.avisos.map((a) => `<div class="sg-av ${a.n}">${avIco(a.n)} ${esc(a.t)}${a.cerrar ? ` <button type="button" class="sg-lk" data-sg="cerrarot" data-ot="${esc(a.cerrar)}">Cerrar esa</button>` : a.cambiar ? ` <button type="button" class="sg-lk" data-sg="cambiar" data-obra="${esc(o.obraId)}">Cambiar</button>` : ""}</div>`).join("");
    const pct = o.hhDisp > 0 ? Math.min(100, Math.round(o.hhUsadas / o.hhDisp * 100)) : 0;
    return `<article class="sg-card${o.incluir || em ? "" : " off"}${em ? " em" : ""}" data-sgobra="${esc(o.obraId)}">
<div class="sg-cab">${em ? `<span class="sg-num ok">✓</span>` : `<label class="sg-inc" title="Incluirla"><input type="checkbox" data-sg="incluir" data-obra="${esc(o.obraId)}" ${o.incluir ? "checked" : ""} aria-label="Incluir ${esc(o.obra)}"><span>${o.n}</span></label>`}<div class="sg-ob"><h3>${esc(String(o.obra).toUpperCase())}</h3><small>${o.ID ? "ID " + esc(o.ID) + " · " : ""}${o.avance != null ? "avance " + esc(o.avance) + " % · " : ""}${o.tareas.length} ${o.tareas.length === 1 ? "tarea" : "tareas"}${o.civil ? " · con el equipo civil" : ""}</small></div><div class="sg-pts"><b>${o.pts ? esc(fN(o.pts.total)) : "—"}</b><small>puntos</small></div></div>
${em ? `<div class="sg-av ok">✅ Emitida: ${esc(em.numero)}. Se cambia en «Llenar orden» como siempre. <button type="button" class="sg-lk" data-sg="veremitida" data-id="${esc(em.id)}">Ver o cambiar</button></div>` : ""}
<div class="sg-gente">${ch || '<span class="sg-vacio">Sin gente</span>'}</div>${veh ? `<div class="sg-gente">${veh}</div>` : ""}
<div class="sg-ts">${ts || '<div class="sg-vacio">Sin tareas para ese día.</div>'}${em ? "" : bl}</div>${em ? "" : av}
${em ? "" : `<div class="sg-pie"><div class="sg-jor"><span>Jornada <b>${esc(fN(o.hhUsadas))} de ${esc(fN(o.hhDisp))} HH</b>${d.sabado ? " · sábado" : ""}</span><div class="sg-bar"><i style="width:${pct}%"></i></div></div><button type="button" class="btn-ghost" data-sg="cambiar" data-obra="${esc(o.obraId)}">✎ Cambiar</button></div>`}</article>`;
  }
  function htmlLibres(d) {
    let h = "";
    if (d.libres.length) {
      const ob = d.ordenes.filter((o) => !o.emitida);
      h += `<article class="sg-card sg-libres"><div class="sg-eti">Sin orden ${esc(fDiaCorto(d.fecha))}</div>${d.libres.map((p) => `<div class="sg-lib"><div><b>${esc(p.nombre)}</b><small>${esc(p.rol || "")}${p.civil ? " · equipo civil" : ""} · libre</small></div>${ob.length ? `<select data-sg="sumarlibre" data-n="${esc(p.nombre)}" aria-label="Sumar a ${esc(p.nombre)} a una obra"><option value="">Sumar a…</option>${ob.map((o) => `<option value="${esc(o.obraId)}">${esc(o.obra)}</option>`).join("")}</select>` : ""}</div>`).join("")}</article>`;
    }
    if (d.ausentes.length) h += `<article class="sg-card sg-libres"><div class="sg-eti">Ausentes</div>${d.ausentes.map((p) => `<div class="sg-lib"><div><b>${esc(p.nombre)}</b><small>${esc(p.motivo)} hasta el ${esc(fCorta(p.hasta))}</small></div></div>`).join("")}<div class="sg-hint">Se cargan en Producción › Personal del equipo › 🗓 Ausencias.</div></article>`;
    return h;
  }
  function htmlPorObra(d) {
    let h = d.avisos.map((a) => `<div class="sg-av ${a.n} sg-glob">${avIco(a.n)} ${esc(a.t)}</div>`).join("");
    h += d.ordenes.map((o) => htmlTarjetaObra(o, d)).join("");
    if (d.sinCalculo.length) h += `<article class="sg-card sg-sc"><div class="sg-eti">Sin cálculo: no puedo sugerir</div>${d.sinCalculo.map((x) => `<div class="sg-lib"><div><b>${esc(String(x.obra).toUpperCase())}</b><small>${x.ID ? "ID " + esc(x.ID) + " · " : ""}sin cálculo de materiales ni itemizado</small></div><button type="button" class="btn-ghost" data-sg="calc" data-obra="${esc(x.obraId)}">Ir a la Calculadora</button></div>`).join("")}</article>`;
    h += htmlLibres(d);
    if (!d.ordenes.length && !d.sinCalculo.length) h += '<div class="card sg-nada">No hay obras activas con algo para hacer (obras con órdenes en los últimos 30 días). Para arrancar una obra nueva, armá la orden en «Llenar orden».</div>';
    return h;
  }
  function htmlPorPersona(d) {
    let h = "";
    d.ordenes.forEach((o) => {
      if (!o.gente.length && !o.ocupados.length) return;
      const pp = (n) => { const x = o.pts && arr(o.pts.porPersona).find((y) => nk(y.nombre) === nk(n)); return x ? fN(x.pts) : "—"; };
      h += `<article class="sg-card${o.incluir || o.emitida ? "" : " off"}"><div class="sg-cab"><span class="sg-num${o.emitida ? " ok" : ""}">${o.emitida ? "✓" : o.n}</span><div class="sg-ob"><h3>${esc(String(o.obra).toUpperCase())}</h3><small>${o.emitida ? esc(o.emitida.numero) + " · " : ""}${o.tareas.map((t) => esc(t.label.split(" (")[0]) + " ×" + esc(fN(t.cant))).join(" · ")}</small></div></div>
${o.gente.map((p) => `<div class="sg-per"><i>${esc(ini(p.nombre))}</i><div><b>${esc(p.nombre)}</b><small>${esc(p.rol)}${p.civil ? " · equipo civil" : ""}${o.vehiculos.length ? " · " + esc(o.vehiculos.map((v) => v.nombre).join(" + ")) : ' · <em class="rj">sin vehículo</em>'}</small></div><span class="sg-pp">${pp(p.nombre)}<small>pts</small></span></div>`).join("")}
${o.ocupados.map((p) => `<div class="sg-per oc"><i>${esc(ini(p.nombre))}</i><div><b>${esc(p.nombre)}</b><small class="rj">Ya está en la ${esc(p.ot)}</small></div></div>`).join("")}${o.ausentes.map((p) => `<div class="sg-per oc"><i>${esc(ini(p.nombre))}</i><div><b>${esc(p.nombre)}</b><small class="rj">${esc(p.txt)}</small></div></div>`).join("")}</article>`;
    });
    h += htmlLibres(d);
    return h || '<div class="card sg-nada">Nadie para ese día.</div>';
  }
  function htmlSemana() {
    const C = cfg(), dias = armarSemana(st.fecha || fechaDef(), st.E, C);
    const obs = []; dias.forEach((d) => d.ordenes.forEach((o) => { if (!obs.some((x) => x.id === o.obraId)) obs.push({ id: o.obraId, n: o.obra, ID: o.ID }); }));
    const celda = (d, ob) => {
      const o = d.ordenes.find((x) => x.obraId === ob.id); if (!o) return '<div class="sg-sc0 vac">—</div>';
      const fr = o.bloqueadas.find((b) => esIzaje(b.k)) && !o.tareas.some((t) => esIzaje(t.k)) && o.fraguado;
      return `<div class="sg-sc0${o.incluir || o.emitida ? "" : " off"}${fr ? " frag" : ""}${o.emitida ? " em" : ""}">${o.tareas.length ? o.tareas.map((t) => `<b>${esc(t.label.split(" ")[0])}</b> ×${esc(fN(t.cant))}`).join(" · ") : "a confirmar"}${fr ? `<em>Fraguan${o.fraguado.cols.length ? " " + esc(colsTxt(o.fraguado.cols)) : ""}</em>` : ""}<small>${esc(o.gente.map((p) => p.nombre.split(" ")[0]).join(", ") || "sin gente")}${o.emitida ? " · ✅ " + esc(o.emitida.numero) : ""}</small></div>`;
    };
    const cab = dias.map((d) => `<div class="sg-sd"><b>${esc(DC[deIso(d.fecha).getDay()])} ${esc(deIso(d.fecha).getDate())}</b>${d.sabado ? `<small>${esc(C.sabIni)}–${esc(C.sabFin)}</small>` : ""}<button type="button" class="btn-ghost" data-sg="emitirdia" data-f="${esc(d.fecha)}" ${emitibles(d).length ? "" : "disabled"}>Emitir el día (${emitibles(d).length})</button><button type="button" class="sg-lk" data-sg="dia" data-f="${esc(d.fecha)}">Ver el día</button></div>`).join("");
    const pc = `<div class="sg-sem" style="grid-template-columns:minmax(150px,1.1fr) repeat(${dias.length},minmax(120px,1fr))"><div></div>${cab}${obs.map((ob) => `<div class="sg-so"><b>${esc(String(ob.n).toUpperCase())}</b>${ob.ID ? `<small>ID ${esc(ob.ID)}</small>` : ""}</div>` + dias.map((d) => celda(d, ob)).join("")).join("")}</div>`;
    const cel = `<div class="sg-semcel">${dias.map((d) => `<section class="sg-semdia"><div class="sg-eti">${esc(fLarga(d.fecha))}${d.sabado ? " · " + esc(C.sabIni) + " a " + esc(C.sabFin) : ""}</div>${d.ordenes.map((o) => `<div class="sg-semo"><b>${esc(String(o.obra).toUpperCase())}</b>${celda(d, { id: o.obraId })}</div>`).join("") || '<div class="sg-vacio">Nada para ese día.</div>'}<button type="button" class="btn-primary" data-sg="emitirdia" data-f="${esc(d.fecha)}" ${emitibles(d).length ? "" : "disabled"}>Emitir el día (${emitibles(d).length})</button><button type="button" class="btn-ghost" data-sg="dia" data-f="${esc(d.fecha)}">Ver y cambiar el día</button></section>`).join("")}</div>`;
    return `<div class="sg-hint">Una semana para adelante: lo que se asigna un día ya no queda para el siguiente y el fraguado corre de un día al otro. Cada día se emite aparte; lo emitido se sigue cambiando en «Llenar orden».</div>${pc}${cel}`;
  }
  function pintar() {
    const ov = $("sgOv"); if (!ov || ov.hidden) return;
    const d = plan(), K = kpis(d), C = cfg();
    const tabs = [["obra", "Por obra"], ["persona", "Por persona"], ["semana", "Semana"]].map((x) => `<button type="button" class="subtab${st.vista === x[0] ? " activo" : ""}" data-sg="vista" data-v="${x[0]}">${x[1]}</button>`).join("");
    const cuerpo = st.vista === "semana" ? htmlSemana() : st.vista === "persona" ? htmlPorPersona(d) : htmlPorObra(d);
    const iaOk = intentar(() => window.__iaPuede && window.__iaPuede(), false);
    const h = `<div class="sg-bar0"><button type="button" class="sg-bt" data-sg="cerrar" aria-label="Volver">‹</button><div class="sg-bt0"><b>Órdenes para ${esc(fDiaCorto(d.fecha))}</b><small>Órdenes · Sugeridas</small></div><button type="button" class="sg-bt" data-sg="cerrar" aria-label="Cerrar">✕</button></div>
<div class="sg-in"><div class="sg-top"><div><h2>Órdenes para ${esc(fDiaCorto(d.fecha))}</h2><div class="sg-sub">${esc(cap(fLarga(d.fecha)))}${d.sabado ? " (sábado, " + esc(C.sabIni) + " a " + esc(C.sabFin) + ")" : ""} · las armó la app; vos revisás, cambiás lo que haga falta y emitís. Nada sale sin «Emitir».</div></div>
<div class="sg-acc"><label class="sg-f">Día <input type="date" id="sgFecha" value="${esc(d.fecha)}"></label><button type="button" class="btn-ghost" data-sg="cfg">⚙ Ajustes</button><button type="button" class="btn-ghost" data-sg="epec">📤 Plan para la inspección</button><button type="button" class="btn-ghost" data-ap="abrir">🧠 Lo que aprende la app</button>${iaOk ? '<button type="button" class="btn-ghost" data-sg="iarev">✨ Revisar con el asistente</button><button type="button" class="btn-ghost" data-sg="iapedir">💬 Pedile cambios al asistente</button>' : ""}</div></div>
<div class="subtabs sg-tabs">${tabs}</div>
${st.vista !== "semana" ? `<div class="sg-kpi"><div class="sg-k"><b>${K.n}</b><span>órdenes${K.em ? " · " + K.em + " emitidas" : ""}</span></div><div class="sg-k"><b>${K.per}</b><span>personas</span></div><div class="sg-k"><b>${esc(fN(Math.round(K.pts * 10) / 10))}</b><span>puntos</span></div><div class="sg-k${K.av ? " am" : ""}"><b>${K.av}</b><span>avisos</span></div></div>` : ""}
${d.noSeTrabaja ? `<div class="card sg-nada">${esc(cap(fLarga(d.fecha)))}: no se trabaja (ver ⚙ Ajustes).</div>` : ""}
<div class="sg-lista${st.vista === "obra" ? " sg-grid" : ""}">${cuerpo}</div>
${st.msg ? `<div class="sg-msg" role="status">${st.msg}</div>` : ""}</div>
<div class="sg-pieF"><div><b>${K.n} ${K.n === 1 ? "orden" : "órdenes"} · ${K.per} ${K.per === 1 ? "persona" : "personas"}${K.em ? ` · ${K.em} ya ${K.em === 1 ? "emitida" : "emitidas"}` : ""}</b><small>${d.libres.length ? esc(d.libres.map((p) => p.nombre.split(" ")[0]).join(", ")) + (d.libres.length === 1 ? " queda" : " quedan") + " sin orden · " : ""}${K.av ? "revisá los avisos antes de emitir" : "sin avisos"}</small></div><button type="button" class="btn-primary" data-sg="emitir" ${K.n ? "" : "disabled"}>Emitir ${K.n === 1 ? "la orden" : "las " + K.n}</button></div>`;
    const sc = ov.querySelector(".sg-in"), y = sc ? sc.scrollTop : 0;
    if (ov.__h !== h) { ov.innerHTML = h; ov.__h = h; const s2 = ov.querySelector(".sg-in"); if (s2) s2.scrollTop = y; }
  }
  function abrir(f, E) {
    if (!puede()) return false;
    f = f || st.fecha || fechaDef();
    if (E) { st.E[f] = clon(E) || {}; guardarE(); }
    st.fecha = f; st.abierta = true; st.msg = ""; invalidar();
    let ov = $("sgOv"); if (!ov) { ov = document.createElement("div"); ov.id = "sgOv"; ov.className = "no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Órdenes sugeridas"); document.body.appendChild(ov); }
    ov.hidden = false; ov.__h = ""; document.body.classList.add("sg-abierta");
    pintar();
    setTimeout(() => intentar(() => window.__atras && window.__atras.sync && window.__atras.sync(), null), 30);
    return true;
  }
  function cerrar() { const ov = $("sgOv"); if (ov) ov.hidden = true; st.abierta = false; document.body.classList.remove("sg-abierta"); ["sgEd", "sgEm", "sgCfg", "sgEp"].forEach(cerrarHoja); pintarInicio(); }
  function hojaV7(id, h, ancha) { let v = $(id); if (!v) { v = document.createElement("div"); v.id = id; v.className = "v7-ov no-print sg-v7"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true"); document.body.appendChild(v); } const caja = v.querySelector(".v7-caja"), y = caja ? caja.scrollTop : 0; v.innerHTML = `<div class="v7-caja${ancha ? " sg-ancha" : ""}">${h}</div>`; const c2 = v.querySelector(".v7-caja"); if (c2) c2.scrollTop = y; return v; }
  function cerrarHoja(id) { const v = $(id); v && v.remove(); if (id === "sgEd") st.ed = null; }
  const cabV7 = (t, sub, id) => `<div class="v7-asa"></div><div class="v7-cab"><div><h3>${t}</h3>${sub ? `<small>${sub}</small>` : ""}</div><button type="button" class="v7-x" data-sg="x" data-h="${id}" aria-label="Cerrar">✕</button></div>`;

  // ---- cambiar una sugerida
  function editor(obraId) {
    st.ed = obraId; const d = plan(), o = d.ordenes.find((x) => x.obraId === obraId); if (!o || o.emitida) return cerrarHoja("sgEd");
    const vs = vehLista(), fuera = o.pendientes.filter((k) => !o.tareas.some((t) => t.k === k)), selV = o.vehiculos.map((v) => v.id);
    const h = cabV7(`${o.n} · ${esc(String(o.obra).toUpperCase())}`, "Tocá para cambiar. Lo demás queda como lo sugirió la app.", "sgEd") + `
<div class="sg-eti">Quiénes van</div><div class="sg-gente">${o.gente.map((p) => `<button type="button" class="sg-ch on${p.civil ? " civ" : ""}" data-sg="sacar" data-n="${esc(p.nombre)}" aria-label="Sacar a ${esc(p.nombre)}"><i>${esc(ini(p.nombre))}</i>${esc(p.nombre)} ✕</button>`).join("")}${o.ocupados.map((p) => `<span class="sg-ch oc"><i>${esc(ini(p.nombre))}</i><s>${esc(p.nombre)}</s></span>`).join("")}${o.ausentes.map((p) => `<span class="sg-ch oc" title="${esc(p.txt)}"><i>${esc(ini(p.nombre))}</i><s>${esc(p.nombre)}</s></span>`).join("")}</div>
${d.libres.length ? `<div class="sg-gente">${d.libres.map((p) => `<button type="button" class="sg-ch mas" data-sg="sumar" data-n="${esc(p.nombre)}">＋ ${esc(p.nombre)} · libre</button>`).join("")}</div>` : '<div class="sg-hint">No queda nadie libre ese día.</div>'}
<div class="sg-eti">Vehículos</div><div class="sg-gente">${vs.map((v) => `<button type="button" class="sg-ch${selV.indexOf(v.id) >= 0 ? " on" : " mas"}" data-sg="vehtog" data-id="${esc(v.id)}" aria-pressed="${selV.indexOf(v.id) >= 0}">${selV.indexOf(v.id) >= 0 ? "✓ " : "＋ "}${esc(v.nombre)}${v.tipo ? " · " + esc((TIPOS.find((t) => t[0] === v.tipo) || [0, v.tipo])[1]) : ""}${num(v.lugares) ? " · " + esc(v.lugares) + " lug." : ""}</button>`).join("") || '<span class="sg-vacio">No hay vehículos cargados.</span>'}</div>
<div class="sg-eti">Tareas</div>${o.tareas.map((t) => `<div class="sg-et"><div><b>${esc(t.label)}</b><small>${esc(t.un)} · quedan ${esc(fN(t.queda))}${t.colsTxt ? " · " + esc(t.colsTxt) : ""}</small></div><div class="sg-mm"><button type="button" data-sg="menos" data-k="${esc(t.k)}" aria-label="Menos ${esc(t.label)}">−</button><b>${esc(fN(t.cant))}</b><button type="button" data-sg="mas" data-k="${esc(t.k)}" aria-label="Más ${esc(t.label)}">+</button></div><button type="button" class="sg-x" data-sg="quitar" data-k="${esc(t.k)}" aria-label="Sacar ${esc(t.label)}">✕</button></div>`).join("") || '<div class="sg-hint">Sin tareas.</div>'}
${o.bloqueadas.map((b) => `<div class="sg-bl">🕓 <b>${esc(b.label)}</b>: ${esc(b.motivo)}</div>`).join("")}
${fuera.length ? `<label class="sg-eti" for="sgSumarT">＋ Sumar otra tarea de esta obra</label><select id="sgSumarT" data-sg="sumart"><option value="">Elegí…</option>${fuera.map((k) => `<option value="${esc(k)}">${esc(labelDe(k))}</option>`).join("")}</select>` : ""}
<div class="sg-jor"><span>Jornada <b>${esc(fN(o.hhUsadas))} de ${esc(fN(o.hhDisp))} HH</b> · puntos ${o.pts ? esc(fN(o.pts.total)) : "—"}</span></div>
<div class="sg-accs"><button type="button" class="btn-ghost" data-sg="volver" data-obra="${esc(o.obraId)}">Volver a la sugerida</button><button type="button" class="btn-ghost" data-sg="llenar" data-obra="${esc(o.obraId)}">Abrir en Llenar orden</button><button type="button" class="btn-primary" data-sg="x" data-h="sgEd">Listo</button></div>`;
    hojaV7("sgEd", h);
  }
  function cambio(c) { aplicar(st.E, plan().fecha, c); guardarE(); invalidar(); pintar(); if (st.ed) editor(st.ed); }

  // ---- emitir
  function confirmarEmitir(f) {
    f = f || plan().fecha;
    const d = armarHasta(f, st.E).dia, l = emitibles(d), C = cfg();
    if (!l.length) return;
    const avs = []; l.forEach((o) => o.avisos.forEach((a) => { if (a.n !== "info") avs.push(String(o.obra).toUpperCase() + ": " + a.t); }));
    const h = cabV7(`¿Emitís ${l.length === 1 ? "la orden" : "las " + l.length + " órdenes"}?`, `${esc(cap(fLarga(f)))}. Salen como siempre, por «Llenar orden»: número, aviso al celu y «Quedan» al día.`, "sgEm") + `
<div class="sg-tabw"><table class="sg-tab tabla-tarjetas"><thead><tr><th>Obra</th><th>Gente</th><th>Vehículo</th><th>Tareas</th><th>Puntos</th></tr></thead><tbody>${l.map((o) => `<tr><td><b>${esc(String(o.obra).toUpperCase())}</b><small>${o.yaHay.length ? "se suma a " + esc(o.yaHay[0]) + "?" : "orden nueva"}</small></td><td data-label="Gente">${esc(o.gente.map((p) => p.nombre.split(" ")[0]).join(", "))}</td><td data-label="Vehículo">${esc(o.vehiculos.map((v) => v.nombre).join(" + ") || "—")}</td><td class="n" data-label="Tareas">${o.tareas.length}</td><td class="n" data-label="Puntos">${o.pts ? esc(fN(o.pts.total)) : "—"}</td></tr>`).join("")}</tbody></table></div>
${avs.length ? `<div class="sg-av ambar">⚠ ${avs.slice(0, 6).map(esc).join("<br>⚠ ")}${avs.length > 6 ? "<br>…y " + (avs.length - 6) + " más" : ""}</div>` : ""}
<label class="sg-sw"><span><b>Avisar a cada uno al celu ahora</b><small>«Tenés orden para ${esc(fDiaCorto(f))}». Si lo apagás, lo ven al abrir la app.</small></span><input type="checkbox" id="sgAvisar" ${C.avisoEmitir ? "checked" : ""}></label>
<label class="sg-sw"><span><b>Recordatorio a las 7:00 del día</b><small>«Hoy: obra · tareas», con lo último de la orden.</small></span><input type="checkbox" id="sgRecordar" ${C.recordatorio ? "checked" : ""}></label>
<div class="sg-accs"><button type="button" class="btn-ghost" data-sg="x" data-h="sgEm">Volver</button><button type="button" class="btn-primary" data-sg="emitirsi" data-f="${esc(f)}">Sí, emitir ${l.length === 1 ? "la orden" : "las " + l.length}</button></div><div class="sg-msg" id="sgEmMsg" aria-live="polite"></div>`;
    hojaV7("sgEm", h);
  }
  const disparar = (el, tipos) => { (tipos || ["input", "change"]).forEach((t) => { try { el.dispatchEvent(new Event(t, { bubbles: true })); } catch (e) { } }); };
  // carga «Llenar orden» como lo haría la persona (el mismo camino que usa el asistente con «proponer_orden»)
  async function cargarEnLlenar(d) {
    try { window.mostrarVista("parte"); } catch (e) { }
    try { window.irSubOrdenes && window.irSubOrdenes("nueva"); } catch (e) { }
    await espera(300);
    try { if (typeof otEditandoId != "undefined" && otEditandoId && typeof salirDeEdicionOt == "function") salirDeEdicionOt(); } catch (e) { }
    try { typeof poblarOtActividades == "function" && poblarOtActividades(); } catch (e) { }
    try { typeof poblarOtPlazas == "function" && poblarOtPlazas(); } catch (e) { }
    document.querySelectorAll("#otActividades .ot-act-check").forEach((cb) => { if (cb.checked) { cb.checked = false; const t = cb.closest(".ot-tarea"); t && t.classList.remove("on"); } });
    document.querySelectorAll("#otActividades .ot-act-prev").forEach((i) => { i.value = ""; });
    try { actividades = [{ id: actividadIdSeq++, catalogoId: "", actividad: "", detalle: "", pasos: "" }]; renderActividades(); } catch (e) { }
    const sel = $("otPlaza"); if (!sel) throw new Error("No encontré «Llenar orden».");
    if (window.__ordenNueva && window.__ordenNueva.elegirObra) window.__ordenNueva.elegirObra(d.obraId);
    if (sel.value !== d.obraId && [].slice.call(sel.options).some((x) => x.value === d.obraId)) { sel.value = d.obraId; disparar(sel, ["change"]); }
    if (sel.value !== d.obraId) throw new Error("No pude elegir la obra en «Llenar orden».");
    const fe = $("otFecha"); fe.value = d.fecha; disparar(fe); try { actualizarDiaSemana(); } catch (e) { }
    const hi = $("otHoraInicio"), hf = $("otHoraFin");
    if (d.horaInicio && hi) { hi.value = d.horaInicio; disparar(hi); }
    if (d.horaFin && hf) { hf.value = d.horaFin; disparar(hf); }
    const roles = intentar(() => ROLES_CUADRILLA, ["Oficial"]);
    personal = [{ id: personaIdSeq++, nombre: "", rol: roles[0] }];
    try { renderPersonal(); } catch (e) { }
    d.personas.forEach((n) => {
      if (window.__ordenNueva && window.__ordenNueva.sumarPersona) window.__ordenNueva.sumarPersona(n);
      if (!personal.some((p) => nk(p.nombre) === nk(n))) { const rol = rolDe(n); const v = personal.find((p) => !String(p.nombre || "").trim()); if (v) { v.nombre = n; v.rol = rol; } else personal.push({ id: personaIdSeq++, nombre: n, rol }); try { renderPersonal(); } catch (e) { } }
    });
    const pc = $("personalContainer"); pc && disparar(pc, ["change"]);
    const cu = $("otCuadrilla"); if (cu) { cu.value = ""; try { window.__emitirSeguro && window.__emitirSeguro.cuadrillaSola(); } catch (e) { } if (!cu.value.trim()) { const l = d.personas.map((n) => n.split(" ")[0]); cu.value = l.length === 1 ? l[0] : l.slice(0, -1).join(", ") + " y " + l[l.length - 1]; disparar(cu); } }
    for (const t of d.tareas) {
      const q = window.CSS && CSS.escape ? CSS.escape(t.k) : t.k;
      const cb = document.querySelector('#otActividades .ot-act-check[value="' + q + '"]'); if (!cb) throw new Error("La tarea «" + t.label + "» no está en «Llenar orden».");
      if (!cb.checked) { cb.checked = true; const el = cb.closest(".ot-tarea"); el && el.classList.add("on"); disparar(cb, ["change"]); }
      const inp = document.querySelector('#otActividades .ot-act-prev[data-id="' + q + '"]'); if (inp) { inp.value = String(t.cant); disparar(inp); }
    }
    await espera(200);
    if (typeof window.otVehiculosElegidos == "function" && d.vehiculoIds) {
      const click = (id) => { const b = document.querySelector('#otVehBox [data-otveh="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]'); b && b.click(); };
      window.otVehiculosElegidos().filter((id) => d.vehiculoIds.indexOf(id) < 0).forEach(click);
      d.vehiculoIds.forEach((id) => { if (window.otVehiculosElegidos().indexOf(id) < 0) click(id); });
    }
    try { typeof actualizarResumenTareasOt == "function" && actualizarResumenTareasOt(); } catch (e) { }
  }
  function cargaDe(o, f, C) {
    const sab = deIso(f).getDay() === 6;
    return { obraId: o.obraId, obra: o.obra, fecha: f, horaInicio: sab ? C.sabIni : "", horaFin: sab ? C.sabFin : "", personas: o.gente.map((p) => p.nombre), vehiculoIds: o.vehiculos.map((v) => v.id), tareas: o.tareas.filter((t) => t.cant > 0).map((t) => ({ k: t.k, label: t.label, cant: t.cant })) };
  }
  let emitiendo = false;
  async function emitir(f, E, op) {
    op = op || {};
    if (emitiendo) return { ok: [], mal: ["ya se están emitiendo"] };
    const C = cfg(), d = armarHasta(f, E || st.E, C).dia, l = emitibles(d), ok = [], mal = [];
    emitiendo = true; window.__otSinAviso = op.avisar === false; window.__otSinRecordatorio = op.recordar === false;
    try {
      for (const o of l) {
        if (op.prog) op.prog(`Emitiendo ${ok.length + mal.length + 1} de ${l.length}: ${o.obra}…`);
        try {
          await cargarEnLlenar(cargaDe(o, f, C));
          const antes = {}; ots().forEach((x) => { antes[x.id] = 1; });
          const m = $("otMsg"); if (m) m.textContent = "";
          await window.emitirOrdenTrabajo();
          const txt = String((m && m.textContent) || "").trim();
          if (!/^✓/.test(txt)) { mal.push(`${o.obra}: ${txt || "no salió (¿la cancelaste?)"}`); continue; }
          const numero = (txt.match(/OT-\d{4}-\d+/) || [])[0] || "";
          let x = null; for (let i = 0; i < 30 && !x; i++) { x = ots().find((y) => numero ? y.numero === numero : !antes[y.id]) || null; if (!x) await espera(100); }
          st.emit[f + "|" + o.obraId] = numero || (x && x.numero) || "emitida"; lsS(KEM, st.emit);
          ok.push({ obra: o.obra, numero: numero || (x && x.numero) || "", id: x ? x.id : "", gente: o.gente.map((p) => p.nombre), sumada: /Sumado/.test(txt) });
        } catch (e) { mal.push(`${o.obra}: ${(e && e.message) || e}`); }
      }
    } finally { emitiendo = false; window.__otSinAviso = false; window.__otSinRecordatorio = false; invalidar(); }
    try { typeof window.fbAuditar == "function" && ok.length && window.fbAuditar("ot_sugerida", `${fCorta(f)} · ${ok.map((x) => x.numero + " " + x.obra).join(" · ")}`.slice(0, 480), { fecha: f, ordenes: ok.map((x) => x.id) }); } catch (e) { }
    return { ok, mal };
  }
  async function emitirSi(f) {
    const av = $("sgAvisar"), rc = $("sgRecordar"), avisar = !av || av.checked, recordar = !rc || rc.checked;
    cerrarHoja("sgEm");   // se cierra antes: si la app pregunta «Ya hay una orden para … ese día», se ve arriba de la hoja
    const prog = (t) => { st.msg = "⏳ " + esc(t); const ov = $("sgOv"); if (ov && !ov.hidden) { ov.__h = ""; pintar(); } };
    const r = await emitir(f, st.E, { avisar, recordar, prog });
    st.msg = (r.ok.length ? `✅ ${r.ok.length === 1 ? "Emitida" : "Emitidas"}: ${r.ok.map((x) => esc(x.numero) + " · " + esc(x.obra) + (x.sumada ? " (sumada)" : "")).join(" · ")}.${avisar ? " Les llega el aviso al celu." : " Sin aviso al celu."}${recordar ? " Recordatorio a las 7:00." : ""}` : "") + (r.mal.length ? `<br>⚠ No salieron: ${r.mal.map(esc).join(" · ")}` : "") + (r.ok.length ? ' <button type="button" class="sg-lk" data-sg="tablero">Ver en el tablero</button>' : "");
    st.fecha = f;
    const ov = $("sgOv"); if (ov && !ov.hidden) { ov.__h = ""; pintar(); } else abrir(f);
    pintarInicio();
    return r;
  }

  // ---- plan para la inspección (EPEC): A4 sin puntos, sin plata, sin datos personales de más
  function planEpec(f) {
    const d = armarHasta(f, st.E).dia, l = d.ordenes.filter((o) => o.emitida || o.incluir);
    const C = cfg(), sab = d.sabado;
    const hor = (o) => (o.horaInicio ? o.horaInicio + (o.horaFin ? " a " + o.horaFin : "") : sab ? C.sabIni + " a " + C.sabFin : "Jornada de " + fN(C.jornada) + " h");
    const resp = (o) => (o.emitida && o.emitida.responsable) || ((o.gente.find((p) => /capataz/i.test(p.rol)) || o.gente.find((p) => /oficial/i.test(p.rol)) || o.gente[0] || {}).nombre || "");
    const body = `<div class="sub">${esc(cap(fLarga(f)))}${sab ? " (sábado)" : ""} · ${l.length} ${l.length === 1 ? "obra" : "obras"}</div>` + (l.length ? l.map((o) => {
      const ob = obras().find((x) => String(x.id) === String(o.obraId)) || {};
      return `<h3 style="margin:14px 0 4px;font-size:14px;">${esc(String(o.obra).toUpperCase())}${o.ID ? " · ID " + esc(o.ID) : ""}</h3><div style="color:#4b5670;font-size:11.5px;">${esc([ob.direccion, ob.barrio].filter(Boolean).join(" · ") || "—")}</div>
<table><thead><tr><th>Tarea</th><th style="width:22%">Cantidad</th><th style="width:30%">Columnas</th></tr></thead><tbody>${o.tareas.map((t) => `<tr><td>${esc(t.label)}</td><td>${esc(fN(t.cant))} ${esc(t.un)}</td><td>${esc(t.colsTxt || "—")}</td></tr>`).join("")}</tbody></table>
<table><tbody><tr><th style="width:22%">Cuadrilla</th><td>${o.gente.length} ${o.gente.length === 1 ? "persona" : "personas"}${resp(o) ? " · responsable: " + esc(resp(o)) : ""}</td></tr><tr><th>Vehículo</th><td>${esc(o.vehiculos.map((v) => v.nombre + (v.patente ? " (" + v.patente + ")" : "")).join(" + ") || "—")}</td></tr><tr><th>Horario</th><td>${esc(hor(o))}</td></tr>${o.emitida ? `<tr><th>Orden</th><td>${esc(o.emitida.numero)}</td></tr>` : ""}</tbody></table>`;
    }).join("") : "<p>Sin trabajos previstos para ese día.</p>") + `<div class="foot">EMA Servicios · Alumbrado Público · Plan de trabajo previsto para el ${esc(fLarga(f))}. Puede cambiar por clima o por indicación de la Inspección.</div>`;
    try { abrirHojaImpresion(`Plan de trabajo · ${cap(fLarga(f))}`, body, "Plan para la inspección"); } catch (e) { st.msg = "No pude armar la hoja."; pintar(); }
  }
  function elegirEpec() {
    const C = cfg(), dias = diasHabiles(proxHabil(hoyISO(), C), 6, C);
    hojaV7("sgEp", cabV7("📤 Plan para la inspección", "Hoja A4 con lo que se va a hacer: obra, tareas, cuadrilla (cuántos y el responsable), vehículo y horario. Sin puntos ni plata.", "sgEp") + `<div class="sg-gente">${dias.map((f) => `<button type="button" class="sg-ch mas" data-sg="epecdia" data-f="${esc(f)}">${esc(cap(fLarga(f)))}</button>`).join("")}</div><div class="sg-hint">Se comparte por WhatsApp o mail desde «Compartir PDF», o se baja.</div>`);
  }

  // ---- ajustes + 📈 rendimientos
  function editorCfg() {
    if (!cfgLocal) cfgLocal = cfgNube();
    const C = cfgLocal, med = medidos(), J = num(C.jornada) || 8, A = C.angel;
    const tabs = `<button type="button" class="btn-ghost" data-ap="abrir">🧠 Lo que aprende la app: tiempos medidos</button>`;
    const ks = (() => { const s = {}; obras().forEach((o) => { if (!obraActiva(o, fechaDef())) return; const sd = intentar(() => window.saldoObra(o.id), null); if (sd) Object.keys(sd.tareas).forEach((k) => { if (sd.tareas[k].total > 0) s[k] = 1; }); }); ORDEN.forEach((k) => { if (dicc(k)) s[k] = 1; }); return Object.keys(s).filter((k) => dicc(k) && VIEJAS().indexOf(k) < 0).sort((a, b) => posOrden(a) - posOrden(b)); })();
    const fila = (k) => {
      const d = dicc(k), R = obj(C.rend[k]), m = med[k], md = R.modo || "auto", an = angelPorDia(k, C);
      const ops = [["auto", an ? "Según Ángel" : "Automático"], ["dicc", "Diccionario"], ["medido", "Medido"], ["mano", "A mano"]];
      return `<tr><td><b>${esc(labelDe(k))}</b><small>${esc(d.un)}</small></td><td class="n" data-label="Diccionario">${esc(fN(2 * J / d.hh))}</td><td data-label="Según Ángel">${an ? esc(an.txt) : "—"}</td><td class="n" data-label="Medido">${m ? `<span class="${m.n >= 3 ? "vd" : ""}">${esc(fN(m.porHH * 2 * J))} (${m.n})</span>` : "sin datos"}</td><td data-label="Usar"><select data-sgc="modo" data-k="${esc(k)}" aria-label="Fuente de ${esc(labelDe(k))}">${ops.map((o) => `<option value="${o[0]}"${md === o[0] ? " selected" : ""}>${o[1]}</option>`).join("")}</select></td><td data-label="A mano"><input type="number" inputmode="decimal" min="0" step="any" data-sgc="mano" data-k="${esc(k)}" value="${R.mano != null && num(R.mano) > 0 ? esc(R.mano) : ""}" placeholder="por día" aria-label="A mano: por día con 2"></td></tr>`;
    };
    const sw = (k, t, s) => `<label class="sg-sw"><span><b>${t}</b>${s ? `<small>${s}</small>` : ""}</span><input type="checkbox" data-sgc="regla" data-k="${k}" ${C.reglas[k] ? "checked" : ""}></label>`;
    const nIn = (p, v, w) => `<input type="number" min="0" step="any" data-sgc="ang" data-p="${p}" value="${esc(v)}" aria-label="${esc(p)}" style="width:${w || 70}px">`;
    const iz = C.izaje.modo;
    const h = cabV7("⚙ Ajustes de la orden sugerida", "Lo marcado «a confirmar» se completa con los capataces o con lo medido. Se guarda para todo el equipo con «Guardar».", "sgCfg") + tabs + `
<div class="sg-eti">Según Ángel (10/11/2026) · editable</div>
<div class="sg-ang"><div><b>Zanja a mano (equipo civil)</b><small>varía según terreno y profundidad (0,60 / 1,00); con máquina, más</small></div><div>${nIn("zanjeo.porDia", A.zanjeo.porDia)} m por día</div></div>
<div class="sg-ang"><div><b>Tendido de cable</b><small>sin rendimiento propio: lo que haya de zanja abierta y sin cable</small></div><div>—</div></div>
<div class="sg-ang"><div><b>Pozos, fundación y hormigonado</b><small>todos los de la obra el mismo día; más de estas bases → camión de hormigón</small></div><div>${nIn("bases", A.bases)} bases</div></div>
<div class="sg-ang"><div><b>Jabalina con su conexión</b><small>el mismo día que los tableritos, sin rendimiento propio</small></div><div>—</div></div>
<div class="sg-ang"><div><b>Sellado, arena y aplomado (civil)</b><small>todas las columnas izadas con el cable subido</small></div><div>—</div></div>
<div class="sg-ang"><div><b>Tablero y acometida</b><small>con 2 barquillas / con 1; acometida y preensamblado sin número (medido)</small></div><div>${nIn("tab2.porDia", A.tab2.porDia, 54)}–${nIn("tab2.tope", A.tab2.tope, 54)} · ${nIn("tab1.porDia", A.tab1.porDia, 54)} por día</div></div>
<div class="sg-eti">Izaje con grúa · modo</div>
<div class="sg-izm">${[["auto", "Automático", `Con el equipo civil antes y ${fN(A.izCivil.personas)} personas → ${fN(A.izCivil.porDia)}; si no, todo la cuadrilla.`, ""],
      ["todo", `Todo la cuadrilla (${fN(A.izTodo.personas)} personas)`, "Cavar donde sale el cable, pasar cable/guía, romper el telgopor, alambre, vínculo y subir.", nIn("izTodo.porDia", A.izTodo.porDia, 54) + " a " + nIn("izTodo.tope", A.izTodo.tope, 54) + " por día"],
      ["civil", `Con el equipo civil antes (${fN(A.izCivil.personas)} personas)`, "Zanja de la acometida abierta y cable a la vista, fundaciones y telgopor limpios; 1 en escalera sube el cable, 2 pasan la guía. Después el civil sella, arena y aploma.", nIn("izCivil.porDia", A.izCivil.porDia, 54) + " por día"],
      ["cano", "Con caño y sin vínculo", "Más rápido.", nIn("izCano2.porDia", A.izCano2.porDia, 54) + " con 2 · " + nIn("izCano3.porDia", A.izCano3.porDia, 54) + " con 3 y el civil antes"],
      ["guia", "Solo con guía (2 personas, sin escalera)", "No suben el cable: dejan alambre guía; limpian y miden los pozos antes. <b>A confirmar.</b>", nIn("izGuia.porDia", A.izGuia.porDia, 54) + " por día"]].map((x) => `<label><input type="radio" name="sgIz" value="${x[0]}"${iz === x[0] ? " checked" : ""} data-sgc="izmodo"> <b>${x[1]}</b><small>${x[2]} ${x[3]}</small></label>`).join("")}</div>
<div class="sg-eti">Cuánto hace una cuadrilla de 2 por día · ${esc(fN(J))} h</div>
<div class="sg-tabw"><table class="sg-tab tabla-tarjetas"><thead><tr><th>Tarea</th><th>Diccionario</th><th>Según Ángel</th><th>Medido (datos)</th><th>Usar</th><th>A mano</th></tr></thead><tbody>${ks.map(fila).join("")}</tbody></table></div>
<div class="sg-hint">«Diccionario» = las horas-hombre por unidad que se usan para los puntos (propuesta, <b>a confirmar</b>). «Medido» = lo que dio en las órdenes cerradas con hora de inicio y fin (se usa solo con 3 cierres o más).</div>
<button type="button" class="btn-ghost" data-sgc="usarmed">Usar lo medido donde hay 3 cierres o más</button>
<div class="sg-eti">Reglas de orden</div>
${sw("fraguado", `Fraguado: izaje ${esc(fN(C.fraguado))} h después del hormigonado`, "Dato de Ángel: igual en metálica y PRFV. Sin fecha del hormigonado no bloquea: avisa.")}
<label class="sg-nlab">Horas de fraguado <input type="number" min="0" step="1" data-sgc="n" data-p="fraguado" value="${esc(C.fraguado)}"></label>
${sw("pozoHorm", "Pozo → hormigón", "Se hormigona donde ya está el pozo (el mismo día).")}
${sw("zanjaCable", "Zanja → cable → tapado", "No propone tapar lo que no tiene cable.")}
${sw("izajeCadena", "Izaje → vínculo → luminaria", "En la misma columna (y tablerito, aplomado y sellado después del izaje).")}
${sw("patTablerito", "Jabalina con los tableritos", "El mismo día que los tableritos de esas columnas.")}
${sw("mismaGente", "Misma gente en la misma obra hasta terminarla", "Avisa si hay que cambiar la cuadrilla.")}
${sw("vehiculos", "Vehículos por tipo y lugares", "Izaje solo con la grúa; luminarias con hidro chica o barquilla; tableros con barquilla; el civil con transporte; que entren todos.")}
<label class="sg-sw"><span><b>Sumar las tareas de galpón</b><small>Armado de luminarias, vínculos y tableritos.</small></span><input type="checkbox" data-sgc="b" data-p="galpon" ${C.galpon ? "checked" : ""}></label>
<div class="sg-eti">Jornada (dato de Ángel)</div>
<label class="sg-nlab">Lunes a viernes, horas <input type="number" min="1" max="12" step="0.5" data-sgc="n" data-p="jornada" value="${esc(C.jornada)}"></label>
<label class="sg-sw"><span><b>Sábado: medio día</b><small>A veces se alarga hasta las 14 o 15: cambiá la hora de fin.</small></span><input type="checkbox" data-sgc="b" data-p="sabado" ${C.sabado ? "checked" : ""}></label>
<label class="sg-nlab">Sábado de <input type="time" data-sgc="t" data-p="sabIni" value="${esc(C.sabIni)}"> a <input type="time" data-sgc="t" data-p="sabFin" value="${esc(C.sabFin)}"> (${esc(fN(sabHoras(C)))} h)</label>
<div class="sg-eti">Avisos a la cuadrilla</div>
<label class="sg-sw"><span><b>Aviso al emitir</b><small>«Tenés orden para mañana», como hoy.</small></span><input type="checkbox" data-sgc="b" data-p="avisoEmitir" ${C.avisoEmitir ? "checked" : ""}></label>
<label class="sg-sw"><span><b>Recordatorio a las 7:00 del día</b><small>«Hoy: obra · tareas». Hace falta el Worker de avisos nuevo; si no, el celu de la cuadrilla con la app 1.4 lo programa solo.</small></span><input type="checkbox" data-sgc="b" data-p="recordatorio" ${C.recordatorio ? "checked" : ""}></label>
<div class="sg-eti">En el Inicio</div>
<label class="sg-sw"><span><b>Tarjeta «Órdenes sugeridas»</b><small>Está todo el día; desde las <input type="time" data-sgc="t" data-p="hora" value="${esc(C.hora)}"> dice «Revisar y emitir».</small></span><input type="checkbox" data-sgc="b" data-p="inicio" ${C.inicio ? "checked" : ""}></label>
<div class="sg-accs"><button type="button" class="btn-ghost" data-sgc="descartar">Descartar cambios</button><button type="button" class="btn-primary" data-sgc="guardar" ${puedeGuardarCfg() ? "" : "disabled"}>Guardar</button></div><div class="sg-msg" id="sgCfgMsg" aria-live="polite">${puedeGuardarCfg() ? "" : "Los guarda quien edita Producción (Administración u Oficina). Podés probarlos acá sin guardar."}</div>`;
    hojaV7("sgCfg", h, true);
  }
  function setP(o, p, v) { const ps = p.split("."); let x = o; for (let i = 0; i < ps.length - 1; i++) x = x[ps[i]] = obj(x[ps[i]]); x[ps[ps.length - 1]] = v; }
  function cambioCfg(el) {
    if (!cfgLocal) cfgLocal = cfgNube();
    const C = cfgLocal, t = el.dataset.sgc, k = el.dataset.k, p = el.dataset.p;
    if (t === "modo") { C.rend[k] = obj(C.rend[k]); C.rend[k].modo = el.value; }
    else if (t === "mano") { C.rend[k] = obj(C.rend[k]); C.rend[k].mano = num(el.value) > 0 ? num(el.value) : null; if (num(el.value) > 0) C.rend[k].modo = "mano"; }
    else if (t === "regla") C.reglas[k] = el.checked;
    else if (t === "izmodo") C.izaje.modo = el.value;
    else if (t === "ang") setP(C.angel, p, num(el.value));
    else if (t === "n") C[p] = num(el.value);
    else if (t === "b") C[p] = !!el.checked;
    else if (t === "t") C[p] = el.value;
    else return;
    invalidar(); pintar(); editorCfg();
  }
  async function guardarCfg(C0, sinPantalla) {
    const m = $("sgCfgMsg"), C = C0 || cfgLocal || cfgNube();
    if (!puedeGuardarCfg()) { if (m) m.textContent = "Tu usuario no puede guardar los ajustes (lo hace quien edita Producción)."; throw Object.assign(new Error("Tu usuario no puede guardar los ajustes de la orden sugerida (lo hace quien edita Producción)."), { code: "permiso" }); }
    const limpio = clon(C); Object.keys(limpio.rend || {}).forEach((k) => { const r = limpio.rend[k]; if (!r || (r.modo === "auto" && !(num(r.mano) > 0))) limpio.rend[k] = null; });
    limpio.por = (window.__fbUser && window.__fbUser.email) || ""; limpio.ts = Date.now();
    if (m) m.textContent = "Guardando…";
    await window.fbBaremoGuardar({ sugerida: limpio });
    window.__baremoNube = Object.assign({}, window.__baremoNube || {}, { sugerida: limpio });
    try { typeof window.fbAuditar == "function" && window.fbAuditar("sugerida_ajustes", "Ajustes de la orden sugerida", {}); } catch (e) { }
    cfgLocal = null; invalidar();
    if (!sinPantalla) { pintar(); if ($("sgCfg")) editorCfg(); const m2 = $("sgCfgMsg"); if (m2) m2.textContent = "✓ Guardado para todo el equipo."; }
    return limpio;
  }
  // el asistente propone un rendimiento y, con el Sí, se guarda acá
  async function guardarRend(k, porDia, motivo) {
    const C = mezclar(cfgNube(), {}); C.rend[k] = { modo: "mano", mano: num(porDia), motivo: motivo || "", porAsistente: true };
    return guardarCfg(C, true);
  }

  // ---- el asistente: revisar / pedir cambios / informe de rendimientos
  async function iaAbrir(que) {
    if (!(window.__asistenteAbrir && window.__asistenteAbrir())) { st.msg = "El asistente no está disponible en esta sesión."; pintar(); return; }
    if (innerWidth < 1240) { cerrar(); cerrarHoja("sgCfg"); cerrarAprende(); }
    for (let i = 0; i < 80 && !(window.__asistente && window.__asistente.revisarSugerida); i++) await espera(100);
    const A = window.__asistente; if (!A || !A.revisarSugerida) return;
    if (que === "rev") A.revisarSugerida(st.fecha || fechaDef());
    else if (que === "rend") A.informeRendimientos();
    else { const t = $("iaTxt"); if (t) { t.value = `En las órdenes sugeridas del ${fLarga(st.fecha || fechaDef())}, `; try { t.focus(); } catch (e) { } } }
  }

  // ---- eventos
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-sg],[data-sgc]"); if (!b) return;
    if (b.dataset.sgc) {
      const t = b.dataset.sgc;
      if (t === "guardar") { e.preventDefault(); guardarCfg().catch((er) => { const m = $("sgCfgMsg"); if (m) m.textContent = "⚠ No se pudo guardar (" + ((er && er.code) || "sin conexión") + ")."; }); }
      else if (t === "descartar") { e.preventDefault(); cfgLocal = null; invalidar(); pintar(); editorCfg(); }
      else if (t === "usarmed") { e.preventDefault(); if (!cfgLocal) cfgLocal = cfgNube(); const med = medidos(); Object.keys(med).forEach((k) => { if (med[k].n >= 3 && dicc(k)) { cfgLocal.rend[k] = obj(cfgLocal.rend[k]); cfgLocal.rend[k].modo = "medido"; } }); invalidar(); pintar(); editorCfg(); }
      return;
    }
    const a = b.dataset.sg; if (b.tagName === "SELECT" || b.tagName === "INPUT") return;
    const obra = b.dataset.obra || st.ed;
    if (a === "cerrar") { e.preventDefault(); cerrar(); }
    else if (a === "x") { e.preventDefault(); cerrarHoja(b.dataset.h); }
    else if (a === "vista") { st.vista = b.dataset.v; pintar(); }
    else if (a === "dia") { st.fecha = b.dataset.f; st.vista = "obra"; st.msg = ""; invalidar(); pintar(); }
    else if (a === "cambiar") { e.preventDefault(); editor(obra); }
    else if (a === "sacar") cambio({ tipo: "sacar_persona", obraId: st.ed, persona: b.dataset.n });
    else if (a === "sumar") cambio({ tipo: "sumar_persona", obraId: st.ed, persona: b.dataset.n });
    else if (a === "vehtog") { const o = plan().ordenes.find((x) => x.obraId === st.ed); if (o) { const ids = o.vehiculos.map((v) => v.id), i = ids.indexOf(b.dataset.id); if (i >= 0) ids.splice(i, 1); else ids.push(b.dataset.id); cambio({ tipo: "vehiculo", obraId: st.ed, vehiculoIds: ids }); } }
    else if (a === "menos" || a === "mas") { const o = plan().ordenes.find((x) => x.obraId === st.ed), t = o && o.tareas.find((x) => x.k === b.dataset.k); if (t) cambio({ tipo: "cantidad", obraId: st.ed, k: t.k, cantidad: Math.max(0, Math.min(t.queda, t.cant + (a === "mas" ? 1 : -1))) }); }
    else if (a === "quitar") cambio({ tipo: "sacar_tarea", obraId: st.ed, k: b.dataset.k });
    else if (a === "volver") cambio({ tipo: "volver", obraId: obra });
    else if (a === "llenar") { e.preventDefault(); const o = plan().ordenes.find((x) => x.obraId === obra); if (o) { const C = cfg(), f = plan().fecha; cerrar(); cargarEnLlenar(cargaDe(o, f, C)).then(() => { try { if (window.__ordenNueva && !window.__ofCompat) window.__ordenNueva.ir(4); } catch (er) { } }).catch(() => { }); } }
    else if (a === "veremitida") { e.preventDefault(); const id = b.dataset.id; cerrar(); try { window.mostrarVista("parte"); } catch (er) { } setTimeout(() => { try { window.editarOrdenTrabajo(id); } catch (er) { } }, 250); }
    else if (a === "emitir") { e.preventDefault(); confirmarEmitir(); }
    else if (a === "emitirdia") { e.preventDefault(); confirmarEmitir(b.dataset.f); }
    else if (a === "emitirsi") { e.preventDefault(); emitirSi(b.dataset.f); }
    else if (a === "cfg") { e.preventDefault(); editorCfg(); }
    else if (a === "epec") { e.preventDefault(); elegirEpec(); }
    else if (a === "epecdia") { e.preventDefault(); cerrarHoja("sgEp"); planEpec(b.dataset.f); }
    else if (a === "calc") { e.preventDefault(); cerrar(); try { window.mostrarVista("calc"); } catch (er) { } }
    else if (a === "tablero") { e.preventDefault(); cerrar(); try { window.mostrarVista("parte"); window.irSubOrdenes && window.irSubOrdenes("tablero"); } catch (er) { } }
    else if (a === "cerrarot") { e.preventDefault(); const o = ots().find((x) => x.numero === b.dataset.ot); if (o && typeof window.abrirCierreOt == "function") { cerrar(); try { window.mostrarVista("parte"); } catch (er) { } setTimeout(() => window.abrirCierreOt(o.id), 200); } }
    else if (a === "abrir" || a === "armar") { e.preventDefault(); abrir(b.dataset.f || fechaDef()); if (b.dataset.cfg) setTimeout(editorCfg, 60); }
    else if (a === "iarev") { e.preventDefault(); iaAbrir("rev"); }
    else if (a === "iapedir") { e.preventDefault(); iaAbrir("pedir"); }
  });
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t || !t.dataset) return;
    if (t.dataset.sgc) { cambioCfg(t); return; }
    const a = t.dataset.sg;
    if (t.id === "sgFecha" && t.value) { st.fecha = t.value; st.msg = ""; invalidar(); pintar(); }
    else if (a === "incluir") cambio({ tipo: t.checked ? "incluir" : "excluir", obraId: t.dataset.obra });
    else if (a === "sumarlibre" && t.value) cambio({ tipo: "sumar_persona", obraId: t.value, persona: t.dataset.n });
    else if (a === "sumart" && t.value) cambio({ tipo: "sumar_tarea", obraId: st.ed, k: t.value });
  });

  // ======================================================================= tarjeta del Inicio y línea del tablero
  function resumenCorto(d) {
    const l = emitibles(d), av = [];
    d.ordenes.filter((o) => o.incluir).forEach((o) => o.avisos.forEach((a) => { if (a.n === "rojo") av.push({ n: "rojo", t: String(o.obra).toUpperCase() + ": " + a.t.split(":")[0].replace(/\.$/, "") }); }));
    d.ordenes.filter((o) => o.incluir).forEach((o) => o.avisos.forEach((a) => { if (a.n === "ambar" && /^Pañol|^Pedir cami/.test(a.t)) av.push({ n: "ambar", t: a.t.replace(/ La orden sale igual.*$/, "") }); }));
    if (d.sinCalculo.length) av.push({ n: "ambar", t: `${d.sinCalculo.length} ${d.sinCalculo.length === 1 ? "obra" : "obras"} sin cálculo: no puedo sugerir` });
    return { l, av };
  }
  function inicioHtml() {
    if (!puede()) return "";
    const C = cfg(); if (!C.inicio) return "";
    const d = intentar(() => plan(fechaDef()), null); if (!d || d.noSeTrabaja) return "";
    const r = resumenCorto(d), per = r.l.reduce((s, o) => s + o.gente.length, 0), pts = r.l.reduce((s, o) => s + num(o.pts && o.pts.total), 0), em = d.emitidas.length, tot = em + r.l.length;
    const tit = em && !r.l.length ? `${cap(fDiaCorto(d.fecha))}: emitidas ${em} de ${tot}` : `${cap(fDiaCorto(d.fecha))}: ${r.l.length} ${r.l.length === 1 ? "orden sugerida" : "órdenes sugeridas"}${em ? ` · emitidas ${em} de ${tot}` : ""}`;
    const hora = yaEsHora(C);
    return `<div class="sg-ini"><div class="sg-ini-c"><span class="sg-ini-ic">📋</span><div><h2>${esc(tit)}</h2><small>${esc(cap(fLarga(d.fecha)))} · las armó la app con lo que queda de cada obra y la gente libre. Nada sale sin «Emitir».${hora ? "" : " Desde las " + esc(C.hora) + " se revisan y se emiten."}</small></div></div>
${r.l.map((o) => `<div class="sg-ini-f"><b>${esc(String(o.obra).toUpperCase())}</b><span>${esc(o.gente.map((p) => p.nombre.split(" ")[0]).join(", "))}</span><span>${o.tareas.length} ${o.tareas.length === 1 ? "tarea" : "tareas"}</span><em>${o.pts ? esc(fN(o.pts.total)) + " pts" : ""}</em></div>`).join("")}
${d.emitidas.map((o) => `<div class="sg-ini-f em"><b>${esc(String(o.obra).toUpperCase())}</b><span>✅ ${esc(o.emitida.numero)}</span><span>${esc(o.gente.map((p) => p.nombre.split(" ")[0]).join(", "))}</span><em></em></div>`).join("")}
${per ? `<div class="sg-ini-f tot"><span>👷 ${per} ${per === 1 ? "persona" : "personas"}, ${r.l.length} ${r.l.length === 1 ? "obra" : "obras"}</span><em>${esc(fN(pts))} pts</em></div>` : ""}
${r.av.slice(0, 4).map((a) => `<div class="sg-av ${a.n}">⚠ ${esc(a.t)}</div>`).join("")}
<div class="sg-ini-acc"><button type="button" class="btn-primary" data-sg="abrir" data-f="${esc(d.fecha)}">${r.l.length ? (hora ? "Revisar y emitir ›" : "Ver la de mañana ›") : "Ver · cambios ›"}</button><button type="button" class="btn-ghost" data-sg="abrir" data-f="${esc(d.fecha)}" data-cfg="1">Ajustes</button></div></div>`;
  }
  function pintarInicio() { intentar(() => window.__inicioPro && window.__inicioPro.pintar && window.__inicioPro.pintar(), null); }
  function tablero() {
    const cols = $("otTbCols");
    if (!puede() || window.__ofCompat) { const x = $("sgTab"); x && x.remove(); return; }
    if (!cols || cols.offsetParent === null) return;
    let el = $("sgTab"); if (!el) { el = document.createElement("div"); el.id = "sgTab"; el.className = "no-print"; cols.insertAdjacentElement("beforebegin", el); }
    const f = fechaDef(), d = intentar(() => plan(f), null), r = d ? resumenCorto(d) : { l: [], av: [] }, em = d ? d.emitidas.length : 0;
    const h = `<div class="sg-tb"><span>📋 <b>${esc(cap(fDiaCorto(f)))}: ${r.l.length} ${r.l.length === 1 ? "orden sugerida" : "órdenes sugeridas"}</b>${em ? ` · ${em} ya ${em === 1 ? "emitida" : "emitidas"}` : ""}${r.av.length ? ` · ⚠ ${r.av.length} ${r.av.length === 1 ? "aviso" : "avisos"}` : ""}</span><button type="button" class="btn-primary" data-sg="abrir" data-f="${esc(f)}">Revisar y emitir</button></div>`;
    if (el.__h !== h) { el.innerHTML = h; el.__h = h; }
  }

  // ======================================================================= Producción › Personal: ausencias, equipo civil, vehículos
  let perMsg = "", perFirma = "";
  function tarjetaPersonal() {
    const panel = $("prodPanelPersonal"); if (!panel || panel.style.display === "none" || !puedePersonal()) { return; }
    let c = $("sgPerCard");
    const firma = JSON.stringify([pNube().ausencias, nomina().map((p) => [p.nombre, p.equipoCivil]), vehLista().map((v) => [v.id, v.tipo, v.lugares]), perMsg]);
    if (c && (firma === perFirma || c.contains(document.activeElement))) return;
    perFirma = firma;
    if (!c) { c = document.createElement("div"); c.className = "card"; c.id = "sgPerCard"; c.style.marginTop = "16px"; panel.appendChild(c); }
    const hoy = hoyISO(), aus = ausencias().filter((a) => (a.hasta || a.desde) >= hoy).sort((a, b) => String(a.desde).localeCompare(String(b.desde)));
    c.innerHTML = `<h2 style="margin:0;"><span class="dot"></span>📋 Para la orden sugerida</h2><div class="hint" style="margin-top:3px;">Quién falta, quién es del equipo civil y qué vehículo es cada uno. La orden sugerida lo usa para armar las de mañana.</div>
<h3 class="sg-h3">🗓 Ausencias</h3>
<div class="sg-aus">${aus.map((a) => `<div class="sg-lib"><div><b>${esc(a.persona)}</b><small>${esc((MOTIVOS.find((m) => m[0] === a.motivo) || [0, a.motivo])[1])} · ${esc(fCorta(a.desde))}${a.hasta && a.hasta !== a.desde ? " al " + esc(fCorta(a.hasta)) : ""}${a.nota ? " · " + esc(a.nota) : ""}</small></div><button type="button" class="btn-ghost" data-sgp="quitaraus" data-id="${esc(a.id)}">Quitar</button></div>`).join("") || '<div class="hint">No hay nadie ausente cargado.</div>'}</div>
<div class="sg-ausf"><select id="sgAusP" aria-label="Persona"><option value="">Persona…</option>${nomina().map((p) => `<option>${esc(p.nombre)}</option>`).join("")}</select><select id="sgAusM" aria-label="Motivo">${MOTIVOS.map((m) => `<option value="${m[0]}">${m[1]}</option>`).join("")}</select><label>Desde <input type="date" id="sgAusD" value="${esc(sumar(hoy, 1))}"></label><label>Hasta <input type="date" id="sgAusH" value="${esc(sumar(hoy, 1))}"></label><input type="text" id="sgAusN" placeholder="Nota (opcional)" maxlength="80"></div>
<button type="button" class="btn-ghost" data-sgp="aus">＋ Agregar ausencia</button>
<h3 class="sg-h3">🦺 Equipo civil</h3><div class="hint">Zanja, cable, pozos y hormigonado, sellado y aplomado. La sugerida arma la orden del civil con esta gente.</div>
<div class="sg-civ">${nomina().map((p) => `<label class="chip${p.equipoCivil ? " activo" : ""}"><input type="checkbox" data-sgp="civil" data-n="${esc(p.nombre)}" ${p.equipoCivil ? "checked" : ""}> ${esc(p.nombre)}</label>`).join("")}</div>
<h3 class="sg-h3">🚚 Tipo y lugares de cada vehículo</h3><div class="hint">La grúa es la única para izar; hidro chica o barquilla para luminarias; barquilla para tableros; transporte para el civil.</div>
${vehLista().map((v) => `<div class="sg-vf"><b>${esc(v.nombre)}${v.patente ? " · " + esc(v.patente) : ""}</b><select data-sgpv="tipo" data-id="${esc(v.id)}" aria-label="Tipo de ${esc(v.nombre)}"><option value="">Tipo…</option>${TIPOS.map((t) => `<option value="${t[0]}"${v.tipo === t[0] ? " selected" : ""}>${t[1]}</option>`).join("")}</select><label>Lugares <input type="number" min="1" max="12" step="1" data-sgpv="lugares" data-id="${esc(v.id)}" value="${esc(v.lugares || "")}"></label></div>`).join("") || '<div class="hint">No hay vehículos cargados.</div>'}
${vehLista().length ? '<button type="button" class="btn-ghost" data-sgp="veh">Guardar los vehículos</button>' : ""}
<div class="hint" id="sgPerMsg" role="status">${esc(perMsg)}</div>`;
  }
  const perAviso = (t) => { perMsg = t; perFirma = ""; const m = $("sgPerMsg"); if (m) m.textContent = t; };
  async function guardarPersonal(patch) { await window.fbPersonalGuardar(Object.assign({}, patch, { ts: Date.now(), usuario: (window.__fbUser || {}).email || "" })); window.__personalNube = Object.assign({}, pNube(), patch); invalidar(); }
  document.addEventListener("click", async (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-sgp]"); if (!b || b.tagName === "INPUT") return;
    e.preventDefault();
    const t = b.dataset.sgp;
    try {
      if (t === "aus") {
        const p = ($("sgAusP") || {}).value, m = ($("sgAusM") || {}).value, d = ($("sgAusD") || {}).value, h = ($("sgAusH") || {}).value || d, n = String(($("sgAusN") || {}).value || "").trim();
        if (!p || !d) return perAviso("Elegí la persona y desde cuándo.");
        if (h < d) return perAviso("«Hasta» no puede ser antes que «desde».");
        const l = ausencias().concat([{ id: "a" + Date.now().toString(36), persona: p, motivo: m, desde: d, hasta: h, nota: n, por: (window.__fbUser || {}).email || "", ts: Date.now() }]);
        await guardarPersonal({ ausencias: l }); perAviso(`✓ ${p}: ${(MOTIVOS.find((x) => x[0] === m) || [0, m])[1].toLowerCase()} del ${fCorta(d)} al ${fCorta(h)}.`);
      } else if (t === "quitaraus") {
        const a = ausencias().find((x) => x.id === b.dataset.id); if (!a) return;
        if (!confirm(`¿Quitar la ausencia de ${a.persona} (${fCorta(a.desde)} al ${fCorta(a.hasta || a.desde)})?`)) return;
        await guardarPersonal({ ausencias: ausencias().filter((x) => x.id !== a.id) }); perAviso("✓ Ausencia quitada.");
      } else if (t === "veh") {
        const l = vehLista().map((v) => { const ti = document.querySelector(`[data-sgpv="tipo"][data-id="${CSS.escape(v.id)}"]`), lu = document.querySelector(`[data-sgpv="lugares"][data-id="${CSS.escape(v.id)}"]`); return Object.assign({}, v, { tipo: ti ? ti.value : v.tipo || "", lugares: lu && num(lu.value) > 0 ? Math.round(num(lu.value)) : null }); });
        const todos = intentar(() => window.__vehiculos.lista(), []).map((v) => l.find((x) => x.id === v.id) || v);
        await window.__vehiculos.guardar(todos); invalidar(); perAviso("✓ Vehículos guardados.");
      }
    } catch (er) { perAviso("⚠ No se pudo guardar (" + ((er && er.code) || "sin conexión") + ")."); }
  });
  document.addEventListener("change", async (e) => {
    const t = e.target; if (!t || !t.dataset || t.dataset.sgp !== "civil") return;
    // la marca va en el ítem de la nómina y se guarda por el camino de siempre (configEquipo/personal.nomina)
    try {
      const base = intentar(() => window.nominaEquipo(), null), usarBase = Array.isArray(base) && base.length && Array.isArray(pNube().nomina) && pNube().nomina.length;
      const l = usarBase ? base : (Array.isArray(pNube().nomina) && pNube().nomina.length ? pNube().nomina : arr(pNube().lista)).map((p) => Object.assign({}, p));
      l.forEach((p) => { if (p && nk(p.nombre) === nk(t.dataset.n)) { if (t.checked) p.equipoCivil = true; else delete p.equipoCivil; } });
      await guardarPersonal(Array.isArray(pNube().nomina) && pNube().nomina.length || !arr(pNube().lista).length ? { nomina: l } : { lista: l });
      perAviso(`✓ ${t.dataset.n} ${t.checked ? "es" : "ya no es"} del equipo civil.`);
    } catch (er) { perAviso("⚠ No se pudo guardar (" + ((er && er.code) || "sin conexión") + ")."); }
  });
  // Llenar orden: avisa si eligen a alguien ausente ese día (solo aviso)
  function avisoAusLlenar() {
    if (window.__sugNo || !window.__fbUser) return;
    const g = document.querySelector("#viewParteDiario > .grid"); if (!g || g.offsetParent === null) return;
    const f = ($("otFecha") || {}).value || "", ns = intentar(() => personal.filter((p) => String(p.nombre || "").trim()).map((p) => p.nombre.trim()), []);
    const l = f ? ns.map((n) => { const a = ausente(n, f); return a ? ausTxt(n, a) : ""; }).filter(Boolean) : [];
    let el = $("sgAusAv");
    if (!l.length) { el && el.remove(); return; }
    const pc = $("personalContainer"); if (!pc) return;
    if (!el) { el = document.createElement("div"); el.id = "sgAusAv"; el.className = "sg-av ambar no-print"; el.setAttribute("role", "status"); pc.insertAdjacentElement("beforebegin", el); }
    const tx = "⚠ Ausente ese día: " + l.join(" · ") + ". (Solo aviso: la orden sale igual.)";
    if (el.textContent !== tx) el.textContent = tx;
  }

  // ======================================================================= recordatorio de las 7:00 (avisosPush con enviarDesde)
  const AVISOS_URL = "https://ema-avisos.mdiaz-60f.workers.dev";
  let wv = lsG("ema.avisos.ver", null), wvPidiendo = false;
  function workerNuevo() {
    if (window.__avisosWorkerNuevo != null) return !!window.__avisosWorkerNuevo;   // pruebas
    if (!wv || Date.now() - wv.ts > 12 * 36e5) {
      if (!wvPidiendo && navigator.onLine !== false) { wvPidiendo = true; fetch(AVISOS_URL + "/salud", { cache: "no-store" }).then((r) => r.json()).then((j) => { wv = { v: String((j && j.version) || ""), ts: Date.now() }; lsS("ema.avisos.ver", wv); }).catch(() => { wv = { v: "", ts: Date.now() }; }).then(() => { wvPidiendo = false; }); }
    }
    const m = String((wv && wv.v) || "").match(/^v(\d+)/); return !!m && +m[1] >= 143;
  }
  const ts7 = (f) => { const m = String(f).match(/^(\d{4})-(\d\d)-(\d\d)$/); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], 10, 0) : 0; };   // 07:00 de Argentina (UTC−3)
  const textoHoy = (o) => `Hoy: ${o.plazaNombre || "trabajo general"}${o.horaInicio ? " · " + o.horaInicio : ""} · ` + arr(o.actividades).map((k) => labelDe(k).split(" (")[0] + (num(obj(o.previsto)[k]) > 0 ? " ×" + fN(o.previsto[k]) : "")).slice(0, 4).join(", ");
  async function recordar(o, id) {
    try {
      if (window.__sugNo || window.__otSinRecordatorio || !o || !id || !window.__fbUser) return;
      const C = cfg(); if (!C.recordatorio || !(String(o.fecha || "") > hoyISO()) || o.estado === "Anulada" || cerradaOt(o) || !workerNuevo()) return;
      const db = firebase.firestore(), cl = [...new Set(arr(o.personalNombres).filter(Boolean))];
      for (const c of cl) await db.collection("avisosPush").add({ clave: c, titulo: "⏰ Tarea de EMA · hoy", cuerpo: textoHoy(o), tipo: "recordatorio", tag: "ema-rec-" + id + "-" + c, otId: String(id), fecha: o.fecha, enviarDesde: ts7(o.fecha), url: "./", ts: Date.now(), enviado: false, por: String(window.__fbUser.email || "") });
    } catch (e) { console.warn("[recordatorio]", e && e.code); }
  }
  const envolverOt = () => {
    const a = window.fbOtAdd, u = window.fbOtUpdate;
    if (typeof a == "function" && !a.__rec) { const n = async function (o) { const id = await a.apply(this, arguments); recordar(o, id); return id; }; window.__heredar && window.__heredar(n, a); n.__rec = 1; window.fbOtAdd = n; }
    if (typeof u == "function" && !u.__rec) { const n = async function (id, patch) { const r = await u.apply(this, arguments); try { if (patch && Object.keys(patch).some((k) => /^(fecha|actividades|previsto|personal|personalNombres|plazaNombre|horaInicio|estado)$/.test(k))) { const ot = ots().find((x) => x.id === id); if (ot && String((patch.fecha || ot.fecha) || "") > hoyISO()) recordar(Object.assign({}, ot, patch), id); } } catch (e) { } return r; }; window.__heredar && window.__heredar(n, u); n.__rec = 1; window.fbOtUpdate = n; }
  };
  // con el Worker viejo: el celu de la cuadrilla (app 1.4) se programa el recordatorio de las 7:00 solo
  function recordatorioLocal() {
    try {
      if (window.__sugNo || !esCrew() || workerNuevo()) return;
      const P = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications; if (!P || !P.schedule) return;
      const y = intentar(() => PERMISOS.yo(), null) || {}, cl = y.personaClave || nk(y.persona || ""); if (!cl) return;
      const hoy = hoyISO(), mias = ots().filter((o) => o && o.estado !== "Anulada" && !cerradaOt(o) && String(o.fecha || "") >= hoy && arr(o.personalNombres).indexOf(cl) >= 0);
      const ahora = Date.now(), quiero = {};
      mias.forEach((o) => { const t = new Date(deIso(o.fecha)); t.setHours(7, 0, 0, 0); if (t.getTime() <= ahora) return; let hsh = 0; String(o.id).split("").forEach((ch) => { hsh = (hsh * 31 + ch.charCodeAt(0)) % 9000; }); quiero[143000 + hsh] = { id: 143000 + hsh, title: "⏰ Tarea de EMA · hoy", body: textoHoy(o), schedule: { at: t }, smallIcon: "ic_stat_ema" }; });
      const firma = JSON.stringify(quiero), ant = lsG("ema.rec.local", { ids: [], firma: "" });
      if (ant.firma === firma) return;
      const viejos = arr(ant.ids).filter((i) => !quiero[i]).map((i) => ({ id: i }));
      Promise.resolve(viejos.length && P.cancel ? P.cancel({ notifications: viejos }) : null).then(() => { const l = Object.keys(quiero).map((k) => quiero[k]); return l.length ? P.schedule({ notifications: l }) : null; }).then(() => lsS("ema.rec.local", { ids: Object.keys(quiero).map(Number), firma })).catch(() => { });
    } catch (e) { }
  }

  // ======================================================================= el Supervisor (v136): una línea «rendimientos» si hay diferencias grandes
  function supHallazgos() {
    if (!puede()) return [];
    return intentar(() => estudio().filter((x) => x.usable && x.dif != null && Math.abs(x.dif) >= 40).slice(0, 3).map((x) => ({ g: "info", cat: "Rendimientos", t: `Rendimientos: ${x.tarea} da ${x.dif > 0 ? "+" : ""}${x.dif} % contra lo que se usa`, s: `Medido ${fN(x.medidoPorDia2)} por día con 2 (${x.datos} cierres). Revisalo en Órdenes sugeridas › Ajustes › 📈 Rendimientos.`, ir: { tipo: "aprende" } })), []);
  }


  // ======================================================================= 🧠 Lo que aprende la app (admin/oficina)
  // ⏱ Tiempos: lo medido (horasTarea + pasosObra + cierre) por tarea, personas y cuadrilla contra lo que dijo Ángel y el
  // diccionario, con «✨ Informe del asistente». 📦 Material: lo que YA existe (calculado vs. entregado del legajo); el
  // aprendizaje de material real por columna y por tipo de obra queda para la v144.
  const ap = { tab: "tiempos", abierta: false };
  const puedeAprende = () => !window.__sugNo && !!window.__fbUser && !liviano() && !esCrew() && ["parte", "produccion"].some((h) => permiso(h) === "editar");
  function htmlTiempos() {
    const f = estudio(cfg()), iaOk = intentar(() => window.__iaPuede && window.__iaPuede(), false);
    return `<div class="card"><h2>⏱ Tiempos de cada tarea <span class="h2-sub">por día con 2 personas · el promedio vale desde 3 registros</span></h2>
<div class="sg-tabw"><table class="sg-tab tabla-tarjetas"><thead><tr><th>Tarea</th><th>Según Ángel</th><th>Diccionario</th><th>Medido</th><th>Datos</th><th>Diferencia</th><th>Por personas</th><th>Por cuadrilla</th></tr></thead><tbody>${f.map((x) => `<tr data-apk="${esc(x.k)}"><td><b>${esc(x.tarea)}</b><small>${esc(x.un)}</small></td><td data-label="Según Ángel">${esc(x.angel || "—")}</td><td class="n" data-label="Diccionario">${x.diccPorDia2 != null ? esc(fN(x.diccPorDia2)) : "—"}</td><td class="n" data-label="Medido">${x.medidoPorDia2 != null ? esc(fN(x.medidoPorDia2)) : "—"}</td><td class="n" data-label="Datos">${x.datos}${x.usable ? "" : " (pocos)"}</td><td class="n" data-label="Diferencia">${x.dif != null ? (x.dif > 0 ? "+" : "") + x.dif + " %" : "—"}</td><td data-label="Por personas">${x.porPersonas.map((p) => `${p.personas} pers.: ${esc(fN(p.porDia))}/día (${p.datos})`).join(" · ")}</td><td data-label="Por cuadrilla">${x.porCuadrilla.map((p) => `${esc(p.cuadrilla)}: ${esc(fN(p.porDia2))} (${p.datos})`).join(" · ")}</td></tr>`).join("") || '<tr><td colspan="8">Todavía no hay órdenes cerradas con hora de inicio y fin de cada tarea.</td></tr>'}</tbody></table></div>
<div class="hint">Sale de la hora de inicio y fin que carga la cuadrilla en cada tarea (y la hora de cada columna en Modo obra) y de lo hecho al cerrar. El modo de izaje no queda guardado en la orden: se separa por cantidad de personas. Sin plata: solo cantidades y horas.</div>
<div class="sg-accs">${iaOk ? '<button type="button" class="btn-primary" data-ap="ia">✨ Informe del asistente</button>' : ""}<button type="button" class="btn-ghost" data-sg="cfg" data-ap="cfg">⚙ Valores que usa la orden sugerida</button></div></div>`;
  }
  function htmlMaterial() {
    const l = obras().filter((o) => o && o.id !== "__sinObra" && arr(o.secciones).length).map((o) => ({ o, b: intentar(() => calcularBalancePlaza(o), null) })).filter((x) => x.b && (x.b.resumen.calculados || x.b.resumen.entregados));
    return `<div class="card"><h2>📦 Material: calculado vs. entregado <span class="h2-sub">lo que ya está en el legajo de cada obra</span></h2>
${l.length ? `<div class="sg-tabw"><table class="sg-tab tabla-tarjetas"><thead><tr><th>Obra</th><th>Materiales calculados</th><th>Entregados</th><th>Cruzados</th><th>Con diferencia</th><th></th></tr></thead><tbody>${l.map((x) => `<tr><td><b>${esc(String(x.o.nombre || x.o.plazaNombre || "").toUpperCase())}</b>${x.o.obraId ? `<small>ID ${esc(x.o.obraId)}</small>` : ""}</td><td class="n" data-label="Calculados">${x.b.resumen.calculados}</td><td class="n" data-label="Entregados">${x.b.resumen.entregados}</td><td class="n" data-label="Cruzados">${x.b.resumen.cruzados}</td><td class="n" data-label="Con diferencia">${x.b.resumen.conDiferencia}</td><td><button type="button" class="btn-ghost" data-ap="legajo" data-id="${esc(x.o.id)}">Ver en el legajo</button></td></tr>`).join("")}</tbody></table></div>` : '<div class="hint">Todavía no hay obras con cálculo y material entregado para comparar.</div>'}
<div class="sg-av info">ⓘ Próximamente: material real por columna y por tipo de obra (lo que de verdad se usa, para afinar los cómputos).</div></div>`;
  }
  function pintarAprende() {
    const ov = $("apOv"); if (!ov || ov.hidden) return;
    const h = `<div class="sg-bar0"><button type="button" class="sg-bt" data-ap="cerrar" aria-label="Volver">‹</button><div class="sg-bt0"><b>🧠 Lo que aprende la app</b><small>De lo que carga la cuadrilla y lo que se cierra</small></div><button type="button" class="sg-bt" data-ap="cerrar" aria-label="Cerrar">✕</button></div>
<div class="sg-in"><div class="subtabs sg-tabs"><button type="button" class="subtab${ap.tab === "tiempos" ? " activo" : ""}" data-ap="tab" data-v="tiempos">⏱ Tiempos</button><button type="button" class="subtab${ap.tab === "material" ? " activo" : ""}" data-ap="tab" data-v="material">📦 Material</button></div>
${ap.tab === "material" ? htmlMaterial() : htmlTiempos()}</div>`;
    if (ov.__h !== h) { ov.innerHTML = h; ov.__h = h; }
  }
  function abrirAprende(tab) {
    if (!puedeAprende()) return false;
    if (tab) ap.tab = tab;
    let ov = $("apOv"); if (!ov) { ov = document.createElement("div"); ov.id = "apOv"; ov.className = "no-print sg-ov2"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Lo que aprende la app"); document.body.appendChild(ov); }
    ov.hidden = false; ov.__h = ""; ap.abierta = true; pintarAprende();
    try { intentar(() => cerrarMenuLateral(), null); } catch (e) { }
    setTimeout(() => intentar(() => window.__atras && window.__atras.sync && window.__atras.sync(), null), 30);
    return true;
  }
  function cerrarAprende() { const ov = $("apOv"); if (ov) ov.hidden = true; ap.abierta = false; }
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-ap]"); if (!b) return;
    const a = b.dataset.ap;
    if (a === "abrir") { e.preventDefault(); abrirAprende(); }
    else if (a === "cerrar") { e.preventDefault(); cerrarAprende(); }
    else if (a === "tab") { e.preventDefault(); ap.tab = b.dataset.v; pintarAprende(); }
    else if (a === "ia") { e.preventDefault(); iaAbrir("rend"); }
    else if (a === "legajo") { e.preventDefault(); cerrarAprende(); try { window.mostrarVista("obras"); } catch (er) { } setTimeout(() => { try { window.abrirLegajo(b.dataset.id); } catch (er) { } }, 200); }
  });
  // en el menú lateral, debajo de Producción (admin / oficina)
  function menuAprende() {
    const p = document.querySelector('#menuLateral [data-vista="produccion"]'); let m = $("menuAprende");
    if (!puedeAprende()) { m && m.remove(); return; }
    if (!p || m) return;
    m = document.createElement("button"); m.type = "button"; m.id = "menuAprende"; m.className = p.className.replace(/\b(activo|active|on)\b/g, ""); m.setAttribute("data-ap", "abrir");
    m.innerHTML = '<span class="nav-ico">🧠</span><span class="nav-txt">Lo que aprende la app</span>';
    p.insertAdjacentElement("afterend", m);
  }
  setInterval(() => {
    if (document.hidden) return;
    menuAprende(); if (ap.abierta) pintarAprende();
    envolverOt(); tablero(); tarjetaPersonal(); avisoAusLlenar(); recordatorioLocal();
    if (st.abierta && !emitiendo) { const ov = $("sgOv"); if (ov && !ov.hidden && !(document.activeElement && ov.contains(document.activeElement) && /INPUT|SELECT/.test(document.activeElement.tagName))) pintar(); }
  }, 1500);
  envolverOt();

  // ======================================================================= para el asistente (lee la misma sugerida que la hoja)
  function resumenIa(f, E) {
    const d = E ? armarHasta(f, Object.assign({}, st.E, { [f]: E })).dia : plan(f), C = cfg();
    return {
      fecha: d.fecha, dia: fLarga(d.fecha), horasJornada: d.horas, sabado: !!d.sabado, noSeTrabaja: !!d.noSeTrabaja, avisosGenerales: d.avisos.map((a) => a.t),
      ordenes: d.ordenes.map((o) => ({ obra: o.obra, obraId: o.obraId, ID: o.ID, seEmite: o.incluir && !o.emitida, yaEmitida: o.emitida ? o.emitida.numero : "", gente: o.gente.map((p) => p.nombre + " (" + p.rol + (p.civil ? ", equipo civil" : "") + ")"), ocupados: o.ocupados.map((p) => p.nombre + " ya está en la " + p.ot), ausentes: o.ausentes.map((p) => p.txt), vehiculos: o.vehiculos.map((v) => v.nombre + (v.tipo ? " (" + v.tipo + ")" : "")), tareas: o.tareas.map((t) => ({ tarea: t.label, cantidad: t.cant, unidad: t.un, columnas: t.colsTxt, porque: t.porque.join(" · "), horasHombre: t.hh })), bloqueadas: o.bloqueadas.map((b) => b.label + ": " + b.motivo), otrasPendientes: o.pendientes.filter((k) => !o.tareas.some((t) => t.k === k)).map(labelDe), avisos: o.avisos.map((a) => (a.n === "rojo" ? "🔴 " : a.n === "ambar" ? "🟠 " : "ℹ ") + a.t), jornada: `${o.hhUsadas} de ${o.hhDisp} HH`, puntosEstimados: o.pts ? arr(o.pts.porPersona).map((p) => ({ nombre: p.nombre, pts: r2(p.pts) })) : null })),
      sinOrden: d.libres.map((p) => p.nombre + (p.rol ? " (" + p.rol + ")" : "")), ausentes: d.ausentes.map((p) => p.txt), sinCalculo: d.sinCalculo.map((x) => x.obra),
      reglas: C.reglas, fraguadoHoras: C.fraguado, nota: "Lo arma la app (sin IA). Cantidades = rendimiento × gente × jornada, con tope en lo que falta y el orden de obra. «a confirmar» = supuesto."
    };
  }
  window.__sugerida = {
    puede, cfg, cfgNube, DEF, fechaDef, proxHabil: (f) => proxHabil(f || hoyISO(), cfg()), horasDia: (f) => horasDia(f, cfg()), medidos, registros, estudio: () => estudio(), rend: (k, ctx) => rend(k, cfg(), ctx || {}),
    armar: (f, E) => armarHasta(f || fechaDef(), E || st.E).dia, semana: (f, E) => armarSemana(f || fechaDef(), E || st.E), plan, aplicar, diferencias, emitibles,
    edicion: (f) => clon(obj(st.E[f || st.fecha || fechaDef()])), ediciones: () => clon(st.E), resumenIa, abrir, cerrar, pintar, editor, editorCfg, confirmarEmitir, emitir, emitirSi, cargarEnLlenar, cargaDe: (o, f) => cargaDe(o, f, cfg()),
    emitiendo: () => emitiendo, probarCfg: (p) => { cfgLocal = p ? mezclar(cfgNube(), p) : null; invalidar(); }, planEpec, abrirAprende, cerrarAprende, puedeAprende, guardarCfg, guardarRend, ausente, workerNuevo, recordar, textoHoy, ts7, supHallazgos, inicioHtml, tablero, labelDe, invalidar,
    estado: () => ({ fecha: st.fecha, vista: st.vista, abierta: st.abierta, E: clon(st.E), emit: clon(st.emit), cfgLocal: clon(cfgLocal) }), _st: st
  };
})();
