(function () {
  "use strict";
  // v153 · Corregir el cierre de una orden YA CERRADA, a mano y con el asistente (Ángel, 13/11/2026: el asistente le dijo
  // «la OT-2026-177 ya está cerrada y desde acá no tengo cómo corregir el cierre de una orden cerrada» → «NECESITO QUE LA IA
  // PUEDA HACER ESAS MODIFICACIONES»).
  //  · Un solo motor window.__corregirCierre (lo usan la hoja «✏ Corregir cierre» y el asistente, proponer_corregir_cierre):
  //    por tarea, la cantidad hecha (0 → 1, «no se hizo» → hecha o al revés), quiénes la hicieron (de la orden o de la nómina:
  //    se suman a personal/personalNombres como «＋ Agregar a alguien que también fue») y los puntos de esa tarea por persona
  //    (de entrada, el reparto de siempre: rol × horas, con la misma cuenta de puntosDeOrden; o a mano).
  //  · Puntos: a cada uno se le saca lo que tenía por esa tarea y se le suma lo nuevo; lo de las otras tareas no se toca
  //    (aunque los puntos se hayan corregido a mano con «⭐ Puntos»). Guarda cierre.puntos (la foto fija), cierre.puntosTarea,
  //    cierre.cantidades, cierre.hechoPersona, cierre.reparto (si estaba a mano) y cierre.puntosHist (antes → después, por,
  //    motivo, porAsistente). Escribe con campos sueltos (no recalcula todo: el envoltorio de puntosPro solo actúa con el
  //    cierre entero).
  //  · Avance de la obra: lo que sube sale de la misma cuenta del cierre (efectosDelCierre, por partes v108, contando lo que
  //    ya sumó esta orden); lo que baja se descuenta de lo que sumó esta misma tarea (cierre.avanceItems con su k). Nunca dos
  //    veces: rehacer 0 → 1 → 0 deja el itemizado como estaba.
  //  · Quincena cerrada: no se toca la foto fija; la diferencia pasa sola como ajuste a la quincena abierta (Quincenas ya lo
  //    hace con cualquier orden corregida); la hoja lo avisa. Conforme a obra cerrado: se avisa (lo hecho se mueve igual,
  //    como en el cierre de siempre; el conforme no cambia).
  //  · Aviso «⭐ Puntos corregidos» al celu de cada persona que cambia. Auditoría ot_cierre_corregido (antes, después, motivo).
  //  · Solo quien edita Órdenes (admin / oficina). Sin reglas nuevas (lo mismo que «⭐ Puntos» y el cierre).
  if (window.__v153No) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const r2 = (v) => Math.round((+v || 0) * 100) / 100;
  const r4 = (v) => Math.round((+v || 0) * 1e4) / 1e4;
  const fN = (v) => { const x = r2(v); try { return fmt(x, Number.isInteger(x) ? 0 : Math.round(x * 10) === x * 10 ? 1 : 2); } catch (e) { return String(x).replace(".", ","); } };
  const fC = (f) => { try { return formatFechaCorta(f); } catch (e) { return f || ""; } };
  const pl = (u, n) => (!u || n === 1 ? u || "" : /^m$|^ml$/i.test(u) ? u : /[aeiouáéíóú]$/i.test(u) ? u + "s" : /[ln]$/i.test(u) ? u.replace(/ó(n)$/, "o$1") + "es" : u + "es");
  const ots = () => { try { return Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []; } catch (e) { return []; } };
  const obras = () => { try { return Array.isArray(window.avanceObrasTodas) ? window.avanceObrasTodas : avanceObras; } catch (e) { return []; } };
  const otDe = (id) => ots().find((o) => o && o.id === id) || null;
  const cerrada = (o) => !!(o && o.cierre && o.cierre.cerradoTs);
  const yoMail = () => String((window.__fbUser || {}).email || "");
  const yoNombre = () => { try { const y = window.PERMISOS && PERMISOS.yo && PERMISOS.yo(); return (y && (y.nombre || y.usuario)) || yoMail().split("@")[0]; } catch (e) { return yoMail().split("@")[0]; } };
  function puede() {
    try {
      if (!window.PERMISOS) return true;
      if (window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()) return false;
      const y = PERMISOS.yo ? PERMISOS.yo() : null, rol = y && y.rol;
      if (rol === "cuadrilla" || rol === "operario" || rol === "mirar" || rol === "panol") return false;
      return PERMISOS.permiso("parte") === "editar";
    } catch (e) { return false; }
  }
  const catalogo = () => { try { return typeof ACTIVIDADES_CATALOGO != "undefined" ? ACTIVIDADES_CATALOGO : []; } catch (e) { return []; } };
  const labelDe = (k) => { if (String(k).indexOf("m:") === 0) return String(k).slice(2); const a = catalogo().find((x) => x.id === k); return a ? a.label : String(k); };
  const baremo = () => { try { return (window.baremoActual && window.baremoActual()) || {}; } catch (e) { return {}; } };
  const unDe = (k) => (String(k).indexOf("m:") === 0 ? "unidad" : (baremo()[k] || {}).un || "unidad");
  const nomina = () => { let l = []; try { const p = window.__personalNube || {}; l = Array.isArray(p.nomina) && p.nomina.length ? p.nomina : Array.isArray(p.lista) ? p.lista : []; if (!l.length) l = (typeof window.nominaEquipo == "function" ? window.nominaEquipo() : []) || []; } catch (e) { l = []; } return l.filter((x) => x && String(x.nombre || "").trim() && x.activo !== false); };
  const canon = (n) => { try { return window.nombreCanonico ? window.nombreCanonico(n) : String(n || "").trim(); } catch (e) { return String(n || "").trim(); } };
  const personalDe = (o) => (Array.isArray(o.personal) ? o.personal : []).map((p) => (typeof p == "string" ? { nombre: p } : p)).filter((p) => p && String(p.nombre || "").trim());
  function tareasDe(o) {
    const s = []; const add = (k) => { if (k && k !== "m:" && s.indexOf(k) < 0) s.push(k); };
    (o.actividades || []).forEach(add);
    (o.actividadesManuales || []).forEach((m) => { const a = String((m && m.actividad) || "").trim(); if (a) add("m:" + a); });
    Object.keys(((o.cierre || {}).cantidades) || {}).forEach(add);
    return s;
  }
  function tareaDe(o, q) {
    const ks = tareasDe(o), z = nk(q).replace(/^m:/, "");
    if (!z) return { err: "Falta la tarea." };
    let k = ks.find((x) => x === q || nk(x) === nk(q)) || ks.find((x) => nk(labelDe(x)) === z);
    if (!k) { const c = ks.filter((x) => nk(labelDe(x)).indexOf(z) >= 0 || z.split(" ").filter((w) => w.length > 2).every((w) => nk(labelDe(x)).indexOf(w) >= 0)); if (c.length === 1) k = c[0]; else if (c.length > 1) return { err: `«${q}» puede ser: ${c.map(labelDe).join(", ")}.`, opciones: c.map(labelDe) }; }
    if (!k) { const cat = catalogo().find((x) => x.id === q || nk(x.label) === z); if (cat) return { k: cat.id, nueva: true }; return { err: `La tarea «${q}» no está en ${o.numero || "la orden"}.`, opciones: ks.map(labelDe) }; }
    return { k };
  }
  function personaDe(o, q) {
    const z = nk(q); if (!z) return { err: "Falta el nombre." };
    const mira = (l) => { let r = l.filter((p) => nk(p.nombre) === z); if (!r.length) r = l.filter((p) => z.split(" ").every((w) => nk(p.nombre).split(" ").some((x) => x.indexOf(w) === 0))); if (!r.length) r = l.filter((p) => nk(p.nombre).split(" ")[0] === z.split(" ")[0]); return r; };
    let r = mira(personalDe(o)); if (r.length === 1) return { p: { nombre: r[0].nombre, rol: r[0].rol || "" }, enOrden: true };
    if (r.length > 1) return { err: `«${q}» puede ser: ${r.map((p) => p.nombre).join(", ")}.` };
    r = mira(nomina()); if (r.length === 1) return { p: { nombre: r[0].nombre, rol: r[0].rol || "" }, enOrden: false };
    if (r.length > 1) return { err: `«${q}» puede ser: ${r.map((p) => p.nombre).join(", ")}.` };
    return { err: `«${q}» no está en la orden ni en la nómina.` };
  }
  // puntos con la cuenta de siempre (puntosDeOrden en vivo), sin el filtro del reinicio
  function pdo(x) { const f = window.__puntosSinFiltro; window.__puntosSinFiltro = true; try { return typeof window.puntosDeOrden == "function" ? window.puntosDeOrden(x, true) : null; } catch (e) { return null; } finally { window.__puntosSinFiltro = f; } }
  function pdoFijo(o) { const f = window.__puntosSinFiltro; window.__puntosSinFiltro = true; try { return typeof window.puntosDeOrden == "function" ? window.puntosDeOrden(o) : null; } catch (e) { return null; } finally { window.__puntosSinFiltro = f; } }
  const mapaDe = (z) => { const m = {}; ((z && z.porPersona) || []).forEach((p) => { if (p && p.nombre) m[canon(p.nombre)] = r4((m[canon(p.nombre)] || 0) + num(p.pts)); }); return m; };
  const escalar = (m, tot) => { const s = Object.keys(m).reduce((a, n) => a + num(m[n]), 0), out = {}; Object.keys(m).forEach((n) => { out[n] = s > 0 ? r4(num(m[n]) * tot / s) : 0; }); return out; };
  function puntosUnidad(o, k, fija) {
    const r = ((fija && fija.renglones) || []).find((x) => x && x.k === k && num(x.ptsUnit) > 0); if (r) return num(r.ptsUnit);
    const z = pdo({ id: o.id, fecha: o.fecha, plazaId: o.plazaId, personal: [{ nombre: "·", rol: "Oficial" }], cierre: { cantidades: { [k]: 1 } } });
    return z && z.renglones && z.renglones[0] ? num(z.renglones[0].ptsUnit) : 0;
  }
  // reparto de una tarea según las reglas de siempre (asignada, grupo, equipos, repartida, rol × horas)
  function repartoTarea(o, k, cant, personal) {
    if (!(cant > 0)) return {};
    const c = o.cierre || {}, base = Object.assign({}, o, personal ? { personal, asignada: {}, equipoTarea: {}, equipos: {}, reparto: {} } : {});
    const hp = Object.assign({}, c.horasPersona || {});
    if (personal) personal.forEach((p) => { const kk = Object.keys(hp).find((x) => nk(x) === nk(p.nombre)); if (kk != null && !(num(hp[kk]) > 0)) delete hp[kk]; });   // si la hizo, trabajó: con 0 h se cuenta la jornada
    const z = pdo(Object.assign(base, { cierre: { cantidades: { [k]: cant }, horasPersona: hp, horasPersonaV: c.horasPersonaV, hechoPersona: personal ? {} : (c.hechoPersona || {}), hechoEquipo: personal ? {} : (c.hechoEquipo || {}) } }));
    return mapaDe(z);
  }
  function quincena(o) {
    try {
      const Q = window.__quincenas; if (!Q) return null;
      const q = Q.qInfo(Q.qDe((o.cierre && o.cierre.fecha) || o.fecha)), c = (Q.cierres() || {})[q.key];
      if (!(c && c.estado === "cerrada")) return null;
      let dest = ""; try { const k = Q.objetivoAjustes(), p = String(k).split("-").map(Number); dest = Q.qInfo({ y: p[0], m: p[1], n: p[2] }).label; } catch (e) { }
      return { key: q.key, label: q.label, destino: dest || "la quincena abierta" };
    } catch (e) { return null; }
  }
  const filasObra = (ob) => { const l = []; (ob.valorItems || []).forEach((r) => r && r.itemPliego && l.push({ id: String(r.itemPliego), r })); (ob.valorItemsEpec || []).forEach((r) => r && r.itemEpec && l.push({ id: String(r.itemEpec), r })); return l; };
  const itemDesc = (id) => { try { return window.epecItemDesc ? window.epecItemDesc(String(id)) : "Ítem " + id; } catch (e) { return "Ítem " + id; } };
  const itemUn = (id) => { try { return window.epecItemUn ? window.epecItemUn(String(id)) : ""; } catch (e) { return ""; } };
  // avance: cuánto mueve el itemizado la diferencia de cantidad de una tarea (lo de esta orden, por partes v108)
  function avanceTarea(o, ob, k, antes, despues, items0) {
    const out = [];
    if (!ob || Math.abs(despues - antes) < 1e-9) return out;
    if (despues > antes) {
      let ef = null;
      try { ef = window.efectosDelCierre ? window.efectosDelCierre(Object.assign({}, o, { id: o.id + "~cc", actividades: [k], cierre: Object.assign({}, o.cierre || {}, { avanceItems: [] }) }), { [k]: despues - antes }) : null; } catch (e) { ef = null; }
      ((ef && ef.propuestas) || []).forEach((p) => { if (p.k === k && p.delta > 0) out.push({ id: String(p.id), delta: r4(p.delta), k }); });
    } else {
      const propias = items0.filter((a) => a && a.k === k && num(a.delta) > 0);
      let lista = propias;
      if (!lista.length) {   // órdenes de antes de la v108 (sin la tarea anotada): lo de los ítems de esta tarea, si ninguna otra tarea de la orden usa esos ítems
        let its = []; try { its = ((typeof metaDeTarea == "function" ? metaDeTarea(k) : {}) || {}).items || []; } catch (e) { its = []; }
        its = its.map(String);
        const otros = tareasDe(o).filter((x) => x !== k).reduce((s, x) => { try { return s.concat((((typeof metaDeTarea == "function" ? metaDeTarea(x) : {}) || {}).items || []).map(String)); } catch (e) { return s; } }, []);
        lista = items0.filter((a) => a && !a.k && num(a.delta) > 0 && its.indexOf(String(a.id)) >= 0 && otros.indexOf(String(a.id)) < 0);
      }
      const f = antes > 0 ? (antes - despues) / antes : 1;
      const m = {}; lista.forEach((a) => { m[String(a.id)] = (m[String(a.id)] || 0) + num(a.delta); });
      Object.keys(m).forEach((id) => { const d = r4(m[id] * f); if (d > 0) out.push({ id, delta: -d, k }); });
    }
    return out;
  }

  // ===================================================================== el plan (no escribe nada)
  // cambios: [{ tarea, cantidad?, hecha?, personas?[], puntos?{persona: pts} }], op: { porAsistente, sacarAgregados[] }
  function plan(otId, cambios, motivo, op) {
    op = op || {};
    const o = typeof otId == "object" ? otId : otDe(otId);
    if (!o) return { err: "No encontré la orden." };
    if (!cerrada(o)) return { err: `${o.numero || "La orden"} todavía no está cerrada: cargá lo que se hizo con el cierre de siempre (📥).` };
    if (o.estado === "Anulada") return { err: `${o.numero || "La orden"} está anulada.` };
    if (!Array.isArray(cambios) || !cambios.length) return { err: "No hay ningún cambio." };
    const c0 = o.cierre || {}, cant0 = Object.assign({}, c0.cantidades || {}), fijaAntes = pdoFijo(o) || { total: 0, renglones: [], porPersona: [] };
    let personal = personalDe(o).map((p) => ({ nombre: p.nombre, rol: p.rol || "" }));
    const agregados = [], avisos = [], filas = [], tareas = [];
    const pp = mapaDe(fijaAntes); personal.forEach((p) => { const n = canon(p.nombre); if (pp[n] == null) pp[n] = 0; });
    const antesPP = Object.assign({}, pp);
    let renglones = (fijaAntes.renglones || []).map((r) => Object.assign({}, r)), total = num(fijaAntes.total);
    const cant = Object.assign({}, cant0), ptT = JSON.parse(JSON.stringify(c0.puntosTarea || {})), hpers = JSON.parse(JSON.stringify(c0.hechoPersona || {}));
    const acts = (o.actividades || []).slice(); let actsCambia = false;
    const items0 = (c0.avanceItems || []).map((a) => Object.assign({}, a)), ob = obras().find((x) => String(x.id) === String(o.plazaId || "")) || null;
    const movs = [];
    const vistos = {};
    for (const cb of cambios) {
      if (!cb) continue;
      const t = tareaDe(o, String(cb.tarea || cb.k || "")); if (t.err) return { err: t.err, r: t.opciones ? { tareasDeLaOrden: t.opciones } : null };
      const k = t.k; if (vistos[k]) return { err: `La tarea «${labelDe(k)}» está dos veces en los cambios.` }; vistos[k] = 1;
      if (t.nueva) { acts.push(k); actsCambia = true; avisos.push(`«${labelDe(k)}» no estaba en la orden: se agrega.`); }
      const antes = num(cant0[k]), un = unDe(k);
      let despues = antes;
      if (cb.cantidad != null && cb.cantidad !== "") { despues = Math.max(0, num(cb.cantidad)); }
      else if (cb.hecha === false) despues = 0;
      else if (cb.hecha === true && !(antes > 0)) despues = num((o.previsto || {})[k]) || 1;
      if (cb.hecha === false && despues > 0) return { err: `«${labelDe(k)}»: si no se hizo, la cantidad es 0.` };
      // quiénes
      let elegidos = null;
      if (Array.isArray(cb.personas) && cb.personas.length) {
        elegidos = [];
        for (const q of cb.personas) {
          const r = personaDe({ personal }, String(q || "")); let rr = r;
          if (r.err) { rr = personaDe(o, String(q || "")); if (rr.err) return { err: rr.err, r: { gente: personal.map((p) => p.nombre), nomina: nomina().map((p) => p.nombre).slice(0, 40) } }; }
          if (!personal.some((p) => nk(p.nombre) === nk(rr.p.nombre))) { personal.push({ nombre: rr.p.nombre, rol: rr.p.rol || (nomina().find((x) => nk(x.nombre) === nk(rr.p.nombre)) || {}).rol || "", agregadoAlCorregir: true }); agregados.push(rr.p.nombre); pp[canon(rr.p.nombre)] = pp[canon(rr.p.nombre)] || 0; }
          const pe = personal.find((p) => nk(p.nombre) === nk(rr.p.nombre));
          if (!elegidos.some((p) => nk(p.nombre) === nk(pe.nombre))) elegidos.push({ nombre: pe.nombre, rol: pe.rol || "" });
        }
      }
      const pu = puntosUnidad(o, k, fijaAntes);
      const rg = renglones.find((r) => r.k === k), ptsAntes = rg ? num(rg.pts) : r4(antes * pu);
      // lo que cada uno tenía por esta tarea
      let viejo = {};
      if (ptsAntes > 0) { const m0 = ptT[k] && typeof ptT[k] == "object" && Object.keys(ptT[k]).length ? ptT[k] : repartoTarea(o, k, antes, null); const mm = {}; Object.keys(m0).forEach((n) => { mm[canon(n)] = num(m0[n]); }); viejo = escalar(mm, ptsAntes); }
      // lo nuevo
      let nuevo = {}, ptsDespues = r4(despues * pu), aMano = false;
      if (cb.puntos && typeof cb.puntos == "object" && Object.keys(cb.puntos).length) {
        for (const n of Object.keys(cb.puntos)) {
          let pe = personal.find((p) => nk(p.nombre) === nk(n));
          if (!pe) { const r = personaDe({ personal }, n); if (r.err) return { err: `Puntos: ${r.err}` }; pe = personal.find((p) => nk(p.nombre) === nk(r.p.nombre)); }
          nuevo[canon(pe.nombre)] = r4(Math.max(0, num(cb.puntos[n])));
        }
        aMano = true;
        ptsDespues = r4(Object.keys(nuevo).reduce((s, n) => s + nuevo[n], 0));
        if (!(despues > 0) && ptsDespues > 0) return { err: `«${labelDe(k)}»: con 0 hecho no puede tener puntos.` };
      } else if (despues > 0) {
        const m1 = elegidos ? repartoTarea(o, k, despues, elegidos) : (ptT[k] && Object.keys(ptT[k]).length && !elegidos ? (() => { const mm = {}; Object.keys(ptT[k]).forEach((n) => { mm[canon(n)] = num(ptT[k][n]); }); return mm; })() : repartoTarea(Object.assign({}, o, { personal }), k, despues, null));
        nuevo = escalar(m1, ptsDespues);
        if (!Object.keys(nuevo).length && ptsDespues > 0) return { err: `«${labelDe(k)}»: no hay a quién darle los puntos (la orden no tiene gente).` };
      }
      if (Math.abs(despues - antes) < 1e-9 && !elegidos && !aMano) return { err: `«${labelDe(k)}» ya está así (${fN(antes)} ${pl(un, antes)}).` };
      // puntos de cada uno
      const nombres = {}; Object.keys(viejo).concat(Object.keys(nuevo)).forEach((n) => { nombres[n] = 1; });
      Object.keys(nombres).forEach((n) => { pp[n] = r4(Math.max(0, num(pp[n]) - num(viejo[n]) + num(nuevo[n]))); });
      total = r4(total - ptsAntes + ptsDespues);
      // renglones, cantidades, quién
      renglones = renglones.filter((r) => r.k !== k);
      if (despues > 0) renglones.push({ k, tarea: labelDe(k), cant: r4(despues), un, ptsUnit: r4(aMano && despues > 0 ? ptsDespues / despues : pu), pts: r4(ptsDespues) });
      if (despues > 0) cant[k] = r4(despues); else delete cant[k];
      if (despues > 0) { const m = {}; Object.keys(nuevo).forEach((n) => { m[n] = r2(nuevo[n]); }); ptT[k] = m; } else delete ptT[k];
      if (despues > 0 && elegidos) { const m = {}; elegidos.forEach((p) => { m[p.nombre] = r4(despues / elegidos.length); }); hpers[k] = m; }
      else if (!(despues > 0)) delete hpers[k];
      else if (hpers[k] && antes > 0) { Object.keys(hpers[k]).forEach((n) => { hpers[k][n] = r4(num(hpers[k][n]) * despues / antes); }); }
      // avance
      const mv = avanceTarea(o, ob, k, antes, despues, items0);
      mv.forEach((m) => movs.push(m));
      if (despues > antes && ob && !mv.length) { let its = []; try { its = ((typeof metaDeTarea == "function" ? metaDeTarea(k) : {}) || {}).items || []; } catch (e) { } if (its.length) avisos.push(`«${labelDe(k)}»: su parte del ítem ${its.join("/")} ya está completa en el itemizado (o no hay ítem cargado): el avance no cambia.`); }
      tareas.push({ k, label: labelDe(k), un, antes, despues, ptsAntes: r2(ptsAntes), ptsDespues: r2(ptsDespues), pu: r4(pu), viejo, nuevo, elegidos: elegidos ? elegidos.map((p) => p.nombre) : null, aMano });
      filas.push({ c: labelDe(k), a: antes > 0 ? `${fN(antes)} ${pl(un, antes)}` : "0 (no se hizo)", d: despues > 0 ? `${fN(despues)} ${pl(un, despues)}` + (elegidos ? " · " + elegidos.map((p) => p.nombre).join(" y ") : "") : "0 (no se hizo)" });
    }
    if (!tareas.length) return { err: "No hay ningún cambio." };
    // deshacer: sacar a los que se habían sumado al corregir (si ya no tienen puntos)
    let sacados = [];
    (op.sacarAgregados || []).forEach((n) => { const i = personal.findIndex((p) => nk(p.nombre) === nk(n) && p.agregadoAlCorregir); if (i >= 0 && !(num(pp[canon(personal[i].nombre)]) > 0.004)) { sacados.push(personal[i].nombre); personal.splice(i, 1); delete pp[canon(n)]; } });
    // el itemizado
    const avance = [];
    let items = items0.map((a) => Object.assign({}, a));
    if (ob && movs.length) {
      const fl = filasObra(ob);
      movs.forEach((m) => {
        const f = fl.find((x) => x.id === m.id); if (!f) return;
        const cont = num(f.r.cantidad), av = num(f.r.cantidadAvanzada), real = m.delta > 0 ? Math.min(m.delta, Math.max(0, cont - av)) : -Math.min(-m.delta, av);
        if (Math.abs(real) < 1e-6) return;
        const x = avance.find((y) => y.id === m.id); if (x) { x.delta = r4(x.delta + real); x.despues = r4(x.despues + real); } else avance.push({ id: m.id, desc: itemDesc(m.id), un: itemUn(m.id), contratado: cont, antes: r4(av), delta: r4(real), despues: r4(av + real), k: m.k });
        if (real > 0) { const e = items.find((a) => String(a.id) === m.id && a.k === m.k); if (e) e.delta = r4(num(e.delta) + real); else items.push({ id: m.id, delta: r4(real), k: m.k }); }
        else { let falta = -real; items.forEach((a) => { if (falta <= 1e-9 || String(a.id) !== m.id || (a.k && a.k !== m.k) || !(num(a.delta) > 0)) return; const s = Math.min(num(a.delta), falta); a.delta = r4(num(a.delta) - s); falta -= s; }); items = items.filter((a) => num(a.delta) > 1e-6); }
      });
    }
    if (!ob && tareas.some((t) => t.despues !== t.antes)) avisos.push("La orden no tiene una obra registrada: el avance no cambia.");
    try { if (ob && window.CO && window.CO.estado(ob).cerrado && avance.length) avisos.push(`El conforme a obra de ${ob.nombre || ob.plazaNombre || "la obra"} está CERRADO: lo hecho (Hecha) se mueve igual, como en el cierre de siempre; el conforme no cambia (para cambiarlo, reabrilo).`); } catch (e) { }
    const q = quincena(o);
    if (q) avisos.push(`La ${q.label} ya está cerrada: lo cerrado no se toca; la diferencia va como ajuste a la ${q.destino} (Producción › Quincenas).`);
    // personas que cambian
    const personas = []; Object.keys(Object.assign({}, antesPP, pp)).forEach((n) => { const a = r2(antesPP[n] || 0), d = r2(pp[n] || 0); personas.push({ nombre: n, antes: a, despues: d, cambia: Math.abs(a - d) > 0.004 }); });
    personas.sort((a, b) => (b.cambia - a.cambia) || b.despues - a.despues);
    const rolDe = (n) => { const p = personal.find((x) => nk(x.nombre) === nk(n)) || {}; return p.rol || ""; };
    const fija = { total: r4(total), renglones: renglones.map((r) => ({ k: r.k || "", tarea: r.tarea || labelDe(r.k), cant: r4(r.cant), un: r.un || "", ptsUnit: r4(r.ptsUnit), pts: r4(r.pts) })), porPersona: Object.keys(pp).map((n) => ({ nombre: n, rol: rolDe(n), pts: r4(pp[n]), aMano: true, asignado: 0 })), ts: Date.now(), por: yoMail(), editado: true, corregido: true };
    const firma = JSON.stringify([c0.cantidades || {}, num(fijaAntes.total), Object.keys(antesPP).sort().map((n) => n + ":" + r2(antesPP[n])), (c0.avanceItems || []).length]);
    const P = { otId: o.id, numero: o.numero || "", obra: o.plazaNombre || "", fecha: o.fecha || "", cambios: JSON.parse(JSON.stringify(cambios)), motivo: String(motivo || "").trim().slice(0, 300), op: { porAsistente: !!op.porAsistente }, tareas, personas, totalAntes: r2(fijaAntes.total), totalDespues: r2(total), avance, avisos, filas, agregados, sacados, quincena: q, firma,
      escribir: { cant, ptT, hpers, items, fija, personal, actsCambia, acts, repartoAMano: !!(c0.reparto && Object.keys(c0.reparto).length), obraId: ob ? ob.id : null } };
    P.texto = resumenTexto(P);
    return P;
  }
  function resumenTexto(P) {
    const pe = P.personas.filter((p) => p.cambia).map((p) => `${p.nombre}: ${fN(p.antes)} → ${fN(p.despues)}`);
    const av = P.avance.map((a) => `ítem ${a.id}: ${fN(a.antes)} → ${fN(a.despues)} (${a.delta > 0 ? "+" : ""}${fN(a.delta)})`);
    return P.tareas.map((t) => `${t.label}: ${fN(t.antes)} → ${fN(t.despues)} (${fN(t.ptsAntes)} → ${fN(t.ptsDespues)} pts)`).join(" · ") + (pe.length ? " · Puntos: " + pe.join(", ") : "") + (av.length ? " · Avance: " + av.join(", ") : "");
  }
  // lo que se ve en la hoja y en la tarjeta del asistente
  function resumenHtml(P) {
    const pe = P.personas.filter((p) => p.cambia || p.despues > 0);
    return `<div class="cc-res"><div class="cc-l">Puntos de cada uno en ${esc(P.numero)}</div>${pe.map((p) => `<div class="cc-fila${p.cambia ? " cambia" : ""}"><span class="cc-n">${esc(p.nombre)}</span><span class="cc-a">${fN(p.antes)}</span><span class="cc-fl">→</span><span class="cc-d">${fN(p.despues)} pts</span></div>`).join("") || '<div class="cc-nada">Nadie cambia.</div>'}
<div class="cc-fila tot"><span class="cc-n">Total de la orden</span><span class="cc-a">${fN(P.totalAntes)}</span><span class="cc-fl">→</span><span class="cc-d">${fN(P.totalDespues)} pts</span></div>
${P.avance.length ? `<div class="cc-l" style="margin-top:10px;">Avance de ${esc(String(P.obra || "la obra").toUpperCase())}</div>${P.avance.map((a) => `<div class="cc-fila cambia"><span class="cc-n">Ítem ${esc(a.id)} · ${esc(String(a.desc || "").slice(0, 60))}</span><span class="cc-a">${fN(a.antes)}</span><span class="cc-fl">→</span><span class="cc-d">${fN(a.despues)} de ${fN(a.contratado)}${a.un ? " " + esc(a.un) : ""}</span></div>`).join("")}` : P.tareas.some((t) => t.despues !== t.antes) ? '<div class="cc-nada">El avance de la obra no cambia.</div>' : ""}
${P.agregados.length ? `<div class="cc-nada">＋ Se suman a la orden: ${esc(P.agregados.join(", "))}.</div>` : ""}</div>`;
  }

  // ===================================================================== escribir
  let ultimo = null;   // para «↶ Deshacer»
  async function aplicar(P, op) {
    op = op || {};
    if (!puede()) return { ok: false, err: "Tu usuario no puede corregir órdenes (hace falta «editar» en Órdenes)." };
    const o = otDe(P.otId); if (!o) return { ok: false, err: "No encontré la orden." };
    const R = plan(o, P.cambios, P.motivo, { porAsistente: P.op && P.op.porAsistente, sacarAgregados: P.sacados && P.sacados.length ? P.sacados : (op.sacarAgregados || []) });
    if (R.err) return { ok: false, err: R.err };
    if (R.firma !== P.firma) return { ok: false, err: `${o.numero || "La orden"} cambió desde que se armó la corrección: armala de nuevo.`, cambio: true };
    if (!R.motivo) return { ok: false, err: "Falta el motivo." };
    const E = R.escribir, ts = Date.now(), por = yoMail(), c0 = o.cierre || {};
    const hist = (c0.puntosHist || []).concat([{ ts, por, porNombre: yoNombre(), tipo: "corregir", antes: R.totalAntes, despues: R.totalDespues, motivo: R.motivo, porAsistente: !!(R.op && R.op.porAsistente),
      tareas: R.tareas.map((t) => ({ k: t.k, tarea: t.label, antes: t.antes, despues: t.despues, ptsAntes: t.ptsAntes, ptsDespues: t.ptsDespues, quienes: t.elegidos || null })), personas: R.personas.filter((p) => p.cambia).map((p) => ({ nombre: p.nombre, antes: p.antes, despues: p.despues })), avance: R.avance.map((a) => ({ id: a.id, delta: a.delta })) }]).slice(-20);
    const patch = { "cierre.cantidades": E.cant, "cierre.puntos": E.fija, "cierre.puntosTarea": E.ptT, "cierre.hechoPersona": E.hpers, "cierre.avanceItems": E.items, "cierre.puntosHist": hist, "cierre.corregido": { ts, por, n: ((c0.corregido || {}).n || 0) + 1, motivo: R.motivo } };
    if (E.repartoAMano) { const rp = {}; E.fija.porPersona.forEach((p) => { rp[p.nombre] = r2(p.pts); }); patch["cierre.reparto"] = rp; }
    if (c0.aprobadas && Object.keys(c0.aprobadas).length) { const ap = Object.assign({}, c0.aprobadas); R.tareas.forEach((t) => { if (t.despues > 0 && !ap[t.k]) ap[t.k] = { ts, por }; }); patch["cierre.aprobadas"] = ap; }
    const gente = JSON.stringify(personalDe(o).map((p) => p.nombre)) !== JSON.stringify(E.personal.map((p) => p.nombre));
    if (gente) { patch.personal = E.personal; patch.personalNombres = [...new Set(E.personal.map((p) => nk(p.nombre)))]; }
    if (E.actsCambia) patch.actividades = E.acts;
    // 1) el itemizado de la obra (si falla la orden, se vuelve atrás)
    const ob = E.obraId != null ? obras().find((x) => String(x.id) === String(E.obraId)) : null;
    let obAntes = null;
    if (ob && R.avance.length) {
      obAntes = JSON.parse(JSON.stringify({ valorItems: ob.valorItems || [], valorItemsEpec: ob.valorItemsEpec || [], etapas: ob.etapas || {}, etapasAuto: ob.etapasAuto || {} }));
      const fl = filasObra(ob); R.avance.forEach((a) => { const f = fl.find((x) => x.id === a.id); if (f) f.r.cantidadAvanzada = a.despues; });
      try { window.avanceAutoEtapas && window.avanceAutoEtapas(ob); } catch (e) { }
      try { const { id, ...resto } = ob; await window.fbAvanceGuardar(id, resto, ob.__orig); }
      catch (er) { Object.assign(ob, obAntes); return { ok: false, err: er && er.code === "permission-denied" ? "🔒 Tu usuario no puede cambiar el avance de la obra." : "⚠ No se pudo guardar el avance (revisá la conexión). No se cambió nada." }; }
    }
    // 2) la orden
    try { await window.fbOtUpdate(o.id, patch); }
    catch (er) {
      if (ob && obAntes) { Object.assign(ob, obAntes); try { const { id, ...resto } = ob; await window.fbAvanceGuardar(id, resto, ob.__orig); } catch (e) { } }
      return { ok: false, err: er && er.code === "permission-denied" ? "🔒 Tu usuario no puede cambiar órdenes." : "⚠ No se pudo guardar (revisá la conexión). No se cambió nada." };
    }
    o.cierre = Object.assign({}, c0, { cantidades: E.cant, puntos: E.fija, puntosTarea: E.ptT, hechoPersona: E.hpers, avanceItems: E.items, puntosHist: hist, corregido: patch["cierre.corregido"] }, patch["cierre.reparto"] ? { reparto: patch["cierre.reparto"] } : {}, patch["cierre.aprobadas"] ? { aprobadas: patch["cierre.aprobadas"] } : {});
    if (gente) { o.personal = patch.personal; o.personalNombres = patch.personalNombres; }
    if (E.actsCambia) o.actividades = E.acts;
    // 3) auditoría y avisos
    try { window.fbAuditar && window.fbAuditar("ot_cierre_corregido", `${o.numero || o.id} · ${R.texto}`.slice(0, 480) + (R.motivo ? " · " + R.motivo : ""), { ref: o.id, motivo: R.motivo, porAsistente: !!(R.op && R.op.porAsistente), antes: { cantidades: c0.cantidades || {}, puntos: R.personas.map((p) => ({ nombre: p.nombre, pts: p.antes })), total: R.totalAntes }, despues: { cantidades: E.cant, puntos: R.personas.map((p) => ({ nombre: p.nombre, pts: p.despues })), total: R.totalDespues }, avance: R.avance.map((a) => ({ id: a.id, delta: a.delta })) }); } catch (e) { }
    const avisados = [];
    try {
      const pa = window.__pushAvisos && window.__pushAvisos.dejarAviso;
      if (pa) R.personas.filter((p) => p.cambia).forEach((p) => { avisados.push(p.nombre); pa({ clave: nk(p.nombre), titulo: "⭐ Puntos corregidos", cuerpo: `${o.numero || "Orden"} · ${o.plazaNombre || ""}: tenías ${fN(p.antes)} y ahora ${fN(p.despues)} puntos.${R.motivo ? " " + R.motivo : ""}`, tipo: "puntos", ref: String(o.id), tag: "ema-ptsc-" + o.id + "-" + nk(p.nombre).replace(/\s+/g, "-"), url: "./" }); });
    } catch (e) { }
    // deshacer: la corrección al revés
    const inv = R.tareas.map((t) => ({ tarea: t.k, cantidad: t.antes, puntos: t.antes > 0 ? (() => { const m = {}; Object.keys(t.viejo).forEach((n) => { m[n] = r2(t.viejo[n]); }); return m; })() : undefined }));
    ultimo = { otId: o.id, cambios: inv, motivo: "Deshacer: " + R.motivo, agregados: R.agregados.slice(), ts };
    try { typeof renderOt == "function" && renderOt(); } catch (e) { }
    try { typeof window.renderProduccion == "function" && window.renderProduccion(); } catch (e) { }
    try { typeof renderAvanceTablero == "function" && renderAvanceTablero(); } catch (e) { }
    const pe = R.personas.filter((p) => p.cambia);
    const txt = `✅ ${o.numero || "La orden"} corregida: ${R.tareas.map((t) => `${t.label} ${fN(t.antes)} → ${fN(t.despues)}`).join(" · ")}.` + (pe.length ? ` Puntos: ${pe.map((p) => `${p.nombre.split(" ")[0]} ${fN(p.antes)} → ${fN(p.despues)}`).join(", ")}.` : "") + (R.avance.length ? ` Avance: ${R.avance.map((a) => `ítem ${a.id} ${a.delta > 0 ? "+" : ""}${fN(a.delta)}`).join(", ")}.` : "") + (R.quincena ? ` La diferencia va como ajuste a la ${R.quincena.destino}.` : "") + (avisados.length ? " Les llega el aviso al celu." : "");
    return { ok: true, txt, R, antes: { cantidades: c0.cantidades || {}, total: R.totalAntes }, despues: { cantidades: E.cant, total: R.totalDespues }, avisados };
  }
  async function deshacer() {
    if (!ultimo) return { ok: false, err: "No hay nada para deshacer." };
    const u = ultimo, P = plan(u.otId, u.cambios, u.motivo, { sacarAgregados: u.agregados });
    if (P.err) return { ok: false, err: P.err };
    const r = await aplicar(P, { sacarAgregados: u.agregados });
    if (r.ok) ultimo = null;
    return r;
  }

  // ===================================================================== la hoja «✏ Corregir cierre»
  let st = null;   // { id, t: { k: { cant, hecha, personas[] | null, puntos{} | null } }, motivo, msg, mal, hecho }
  function estadoInicial(o) {
    const t = {}, c = o.cierre || {}, cant = c.cantidades || {};
    tareasDe(o).forEach((k) => { t[k] = { cant: num(cant[k]), personas: null, puntos: null, quienAntes: quienesAntes(o, k) }; });
    return { id: o.id, t, motivo: "", msg: "", mal: false, hecho: false };
  }
  function quienesAntes(o, k) {
    const c = o.cierre || {}, pt = c.puntosTarea && c.puntosTarea[k];
    if (pt && Object.keys(pt).length) return Object.keys(pt).filter((n) => num(pt[n]) > 0);
    if (!(num((c.cantidades || {})[k]) > 0)) return [];
    const m = repartoTarea(o, k, num(c.cantidades[k]), null); return Object.keys(m).filter((n) => m[n] > 0);
  }
  function cambiosDe(o) {
    const l = [], c = (o.cierre || {}).cantidades || {};
    Object.keys(st.t).forEach((k) => { const x = st.t[k], ca = num(c[k]); if (Math.abs(x.cant - ca) > 1e-9 || x.personas || x.puntos) l.push({ tarea: k, cantidad: x.cant, personas: x.personas || undefined, puntos: x.puntos || undefined }); });
    return l;
  }
  function verifTxt(o, k) {
    try { if (window.__v150No || !window.__verifOt) return ""; const v = window.__verifOt.verifTarea(o, k); return v && v.mandada ? v.texto + (v.dudas && v.dudas.length ? " · ⚠ " + v.dudas.join("; ") : "") : ""; } catch (e) { return ""; }
  }
  function pintar() {
    if (!st) return;
    const o = otDe(st.id); if (!o) return cerrar();
    let ov = $("ccOv");
    if (!ov) { ov = document.createElement("div"); ov.id = "ccOv"; ov.className = "v7-ov v7-arriba no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Corregir el cierre"); document.body.appendChild(ov); }
    const cambios = cambiosDe(o), P = cambios.length ? plan(o, cambios, st.motivo) : null, gente = personalDe(o);
    const per = (k) => { const x = st.t[k]; return x.personas || x.quienAntes; };
    const conPts = (k) => { const q = per(k); if (q.length) return q; if (P && !P.err) { const t = P.tareas.find((y) => y.k === k); if (t) return Object.keys(t.nuevo).filter((n) => t.nuevo[n] > 0); } return []; };
    const ptsDe = (k, n) => { const x = st.t[k]; if (x.puntos && x.puntos[n] != null) return x.puntos[n]; if (P && !P.err) { const t = P.tareas.find((y) => y.k === k); if (t) return r2(t.nuevo[n] || 0); } const pt = ((o.cierre || {}).puntosTarea || {})[k]; if (pt && pt[n] != null) return r2(pt[n]); return null; };
    const nomOp = nomina().filter((p) => !gente.some((g) => nk(g.nombre) === nk(p.nombre)));
    const tarjetas = Object.keys(st.t).map((k) => {
      const x = st.t[k], ca = num(((o.cierre || {}).cantidades || {})[k]), un = unDe(k), q = per(k), cambia = Math.abs(x.cant - ca) > 1e-9 || x.personas || x.puntos, v = verifTxt(o, k);
      const todos = gente.map((g) => g.nombre).concat((x.personas || []).filter((n) => !gente.some((g) => nk(g.nombre) === nk(n))));
      return `<div class="cc-t${cambia ? " cambia" : ""}" data-cck="${esc(k)}">
<div class="cc-tt"><b>${esc(labelDe(k))}</b><small>En el cierre: ${ca > 0 ? fN(ca) + " " + esc(pl(un, ca)) : "0 · no se hizo"}${v ? `<br>La cuadrilla: ${esc(v)}` : ""}</small></div>
<div class="cc-dos"><label class="cc-campo">Cantidad hecha<span class="cc-cant"><input type="number" inputmode="decimal" min="0" step="any" data-ccq="${esc(k)}" value="${esc(r4(x.cant))}"><em>${esc(pl(un, x.cant))}</em></span></label>
<label class="cc-campo">¿Se hizo?<select data-cch="${esc(k)}"><option value="si"${x.cant > 0 ? " selected" : ""}>Sí, se hizo</option><option value="no"${x.cant > 0 ? "" : " selected"}>No se hizo</option></select></label></div>
${x.cant > 0 ? `<div class="cc-l">¿Quiénes la hicieron?</div><div class="cc-chips">${todos.map((n) => { const on = q.some((y) => nk(y) === nk(n)); return `<button type="button" class="chip${on ? " activo" : ""}" data-ccp="${esc(k)}" data-ccn="${esc(n)}" aria-pressed="${on}">${esc(n)}</button>`; }).join("")}</div>
${nomOp.length ? `<select class="cc-mas" data-ccmas="${esc(k)}" aria-label="Sumar a alguien de la nómina"><option value="">＋ Otra persona de la nómina…</option>${nomOp.map((p) => `<option value="${esc(p.nombre)}">${esc(p.nombre)}${p.rol ? " · " + esc(p.rol) : ""}</option>`).join("")}</select>` : ""}
${q.length ? "" : '<div class="cc-nada">Tocá quiénes la hicieron. Si no elegís a nadie, se reparte entre toda la orden (rol × horas).</div>'}
${conPts(k).length ? `<div class="cc-l">Puntos de esta tarea${x.puntos ? " · a mano" : " · reparto de siempre (rol × horas)"}</div>${conPts(k).map((n) => `<label class="cc-pp"><span>${esc(n)}</span><input type="number" inputmode="decimal" min="0" step="any" data-ccpt="${esc(k)}" data-ccn="${esc(n)}" value="${ptsDe(k, n) == null ? "" : esc(ptsDe(k, n))}" aria-label="Puntos de ${esc(n)}"></label>`).join("")}${x.puntos ? `<button type="button" class="cc-link" data-cc="auto" data-cck2="${esc(k)}">Volver al reparto de siempre</button>` : ""}` : ""}` : ""}
</div>`;
    }).join("");
    const listo = P && !P.err && st.motivo.trim().length >= 3;
    const h = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>✏ Corregir el cierre</h3><small>${esc(o.numero || "")} · ${esc(String(o.plazaNombre || "").toUpperCase())} · ${esc(fC(o.fecha))}</small></div><button type="button" class="v7-x" data-cc="x" aria-label="Cerrar">✕</button></div>
${st.hecho ? "" : `<p class="v7-sub" style="margin:0 0 10px;">La orden ya está cerrada. Cambiá lo que se hizo, quiénes y sus puntos: abajo ves el antes → después. Lo de las otras tareas no se toca.</p>${tarjetas}
<label class="cc-campo" style="margin-top:12px;">Motivo (queda en el historial)<input type="text" id="ccMotivo" maxlength="300" placeholder="Ej: el apoyo lo pusieron Pablo y Ariel; en el cierre quedó en 0" value="${esc(st.motivo)}"></label>
${P && P.err ? `<div class="cc-av mal" role="status">⚠ ${esc(P.err)}</div>` : P ? resumenHtml(P) + (P.avisos.length ? `<div class="cc-av" role="status">⚠ ${P.avisos.map(esc).join("<br>⚠ ")}</div>` : "") : '<div class="cc-nada">Todavía no cambiaste nada.</div>'}`}
<div class="v7-acc">${st.hecho ? `${ultimo && ultimo.otId === o.id ? '<button type="button" class="btn-ghost" data-cc="deshacer">↶ Deshacer</button>' : ""}<button type="button" class="btn-primary" data-cc="x">Listo</button>` : `<button type="button" class="btn-ghost" data-cc="x">Cancelar</button><button type="button" class="btn-primary" data-cc="si"${listo ? "" : " disabled"}>Sí, corregir</button>`}</div>
<div class="v7-msg${st.mal ? " mal" : st.msg ? " bien" : ""}" id="ccMsg" role="status">${esc(st.msg || (!st.hecho && P && !P.err && !listo ? "Escribí el motivo para poder corregir." : ""))}</div></div>`;
    const foco = document.activeElement && ov.contains(document.activeElement) ? document.activeElement : null, fsel = foco ? (foco.id ? "#" + foco.id : foco.dataset.ccq ? `[data-ccq="${CSS.escape(foco.dataset.ccq)}"]` : foco.dataset.ccpt ? `[data-ccpt="${CSS.escape(foco.dataset.ccpt)}"][data-ccn="${CSS.escape(foco.dataset.ccn)}"]` : null) : null;
    const sc = ov.querySelector(".v7-caja") ? ov.querySelector(".v7-caja").scrollTop : 0;
    if (ov.__h !== h) { ov.innerHTML = h; ov.__h = h; const c = ov.querySelector(".v7-caja"); if (c) c.scrollTop = sc; if (fsel) { const el = ov.querySelector(fsel); if (el) { el.focus(); try { if (el.type === "text") el.setSelectionRange(el.value.length, el.value.length); } catch (e) { } } } }
  }
  function abrir(id) {
    const o = otDe(id); if (!o) return;
    if (!puede()) return;
    if (!cerrada(o)) { try { window.abrirCierreOt(id); } catch (e) { } return; }
    try { window.__puntosEditar && window.__puntosEditar.cerrar(); } catch (e) { }
    st = estadoInicial(o); pintar();
  }
  function cerrar() { const v = $("ccOv"); v && v.remove(); st = null; }
  async function corregirYa() {
    const o = otDe(st.id); if (!o) return;
    const P = plan(o, cambiosDe(o), st.motivo); if (P.err) { st.msg = P.err; st.mal = true; return pintar(); }
    st.msg = "Guardando…"; st.mal = false; pintar();
    const r = await aplicar(P);
    if (!st) return;
    if (!r.ok) { st.msg = r.err; st.mal = true; return pintar(); }
    st.hecho = true; st.msg = r.txt; st.mal = false; pintar();
  }
  document.addEventListener("click", async (e) => {
    const t = e.target; if (!t || !t.closest) return;
    const ab = t.closest("[data-ccabrir]"); if (ab) { e.preventDefault(); e.stopPropagation(); return abrir(ab.dataset.ccabrir); }
    const ov = $("ccOv"); if (!ov || !st) return;
    if (t === ov) return cerrar();
    if (!ov.contains(t)) return;
    const p = t.closest("[data-ccp]");
    if (p) { const k = p.dataset.ccp, n = p.dataset.ccn, x = st.t[k]; const o = otDe(st.id); const base = (x.personas || x.quienAntes).slice(); void o; const i = base.findIndex((y) => nk(y) === nk(n)); if (i >= 0) base.splice(i, 1); else base.push(n); x.personas = base.length ? base : null; x.puntos = null; st.msg = ""; return pintar(); }
    const b = t.closest("[data-cc]"); if (!b) return;
    const a = b.dataset.cc;
    if (a === "x") cerrar();
    else if (a === "si") corregirYa();
    else if (a === "auto") { const x = st.t[b.dataset.cck2]; if (x) x.puntos = null; pintar(); }
    else if (a === "deshacer") { st.msg = "Deshaciendo…"; st.mal = false; pintar(); const r = await deshacer(); if (!st) return; if (!r.ok) { st.msg = r.err; st.mal = true; } else { st = estadoInicial(otDe(st.id)); st.msg = "↶ Deshecho: " + r.txt.replace(/^✅ /, ""); } pintar(); }
  });
  document.addEventListener("change", (e) => {
    const x = e.target; if (!x || !st || !$("ccOv") || !$("ccOv").contains(x)) return;
    if (x.dataset.ccq != null) { const t = st.t[x.dataset.ccq]; t.cant = Math.max(0, num(x.value)); if (!(t.cant > 0)) { t.personas = null; t.puntos = null; } else t.puntos = null; }
    else if (x.dataset.cch != null) { const t = st.t[x.dataset.cch], o = otDe(st.id); if (x.value === "no") { t.cant = 0; t.personas = null; t.puntos = null; } else if (!(t.cant > 0)) t.cant = num((o.previsto || {})[x.dataset.cch]) || 1; }
    else if (x.dataset.ccmas != null) { const k = x.dataset.ccmas, t = st.t[k], o = otDe(st.id); if (x.value) { void o; const base = (t.personas || t.quienAntes).slice(); if (!base.some((y) => nk(y) === nk(x.value))) base.push(x.value); t.personas = base; t.puntos = null; } }
    else if (x.dataset.ccpt != null) { const k = x.dataset.ccpt, t = st.t[k]; const m = {}; $("ccOv").querySelectorAll(`[data-ccpt="${CSS.escape(k)}"]`).forEach((i) => { m[i.dataset.ccn] = Math.max(0, num(i.value)); }); t.puntos = m; if (!t.personas) t.personas = Object.keys(m); }
    else if (x.id === "ccMotivo") st.motivo = x.value;
    else return;
    st.msg = ""; st.mal = false; setTimeout(pintar, 0);
  });
  document.addEventListener("input", (e) => { const x = e.target; if (x && x.id === "ccMotivo" && st) { st.motivo = x.value; const b = $("ccOv") && $("ccOv").querySelector('[data-cc="si"]'); const o = otDe(st.id); if (b && o) { const ok = st.motivo.trim().length >= 3 && cambiosDe(o).length && !plan(o, cambiosDe(o), st.motivo).err; b.disabled = !ok; const m = $("ccMsg"); if (m && !st.msg) m.textContent = ok ? "" : cambiosDe(o).length ? "Escribí el motivo para poder corregir." : ""; } } });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("ccOv")) cerrar(); });
  // botón «✏ Corregir cierre» al lado de «⭐ Puntos» (tablero y Historial) para quien edita Órdenes
  function botones() {
    if (!puede()) return;
    document.querySelectorAll(".pe-btn[data-peabrir]").forEach((b) => {
      const n = b.nextElementSibling; if (n && n.classList.contains("cc-btn")) return;
      const o = otDe(b.dataset.peabrir); if (!cerrada(o)) return;
      b.insertAdjacentHTML("afterend", ` <button type="button" class="btn-ghost cc-btn" data-ccabrir="${esc(o.id)}" title="Corregir lo hecho, quiénes y los puntos">✏ Corregir cierre</button>`);
    });
  }
  setInterval(botones, 1000);
  window.__corregirCierre = { fN, plan, aplicar, deshacer, abrir, cerrar, puede, resumenHtml, ultimo: () => ultimo, estado: () => st, tareaDe, personaDe };
})();
