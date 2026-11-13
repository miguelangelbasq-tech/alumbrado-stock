(function () {
  "use strict";
  // v154 · Auditor de puntos (Ángel, 13/11/2026: «cualquier pregunta de los puntos se la tengo que poder hacer a la IA… me
  // tiene que decir exactamente por qué se le dio ese punto, si es válido, si yo esa vez le dije "démosle un poquito más"…
  // detectar, mover, cambiar, todo con la autorización de nosotros»).
  //  · explicar: la cuenta paso a paso de cada punto (la misma de puntosDeOrden: valor de la tarea × cantidad y la regla de
  //    reparto —asignada, repartida por lo hecho, «Elegir quiénes», equipos, a mano por tarea, a mano toda la orden, rol × horas—),
  //    de dónde sale el valor (fábrica / diccionario, Producción, a mano en la orden, baremo cambiado después), el historial con
  //    su motivo (o «sin motivo anotado»), piso y reinicios, quincena cerrada (foto fija) y ajustes. Por orden y por persona y
  //    período; el total por persona es el mismo que muestra Producción (y si no cuadra, lo dice).
  //  · revisar: hallazgos sin IA (reparto que no suma, puntos a quien no está o con 0 h, «no se hizo» con puntos, la cuadrilla
  //    contra el cierre, la misma columna pagada dos veces, a mano sin motivo, valor distinto del baremo sin explicación, foto
  //    fija vs. hoy, cerrada sin puntos, puntos por hora fuera de lo común). Línea en el Supervisor.
  //  · el porqué: motivo obligatorio en «⭐ Puntos», en los puntos a mano del cierre, en «Cuánto vale cada tarea» (historial
  //    configEquipo/baremo.hist[]) y en «✏ Corregir cierre» (v153); notas y criterios (baremo.criterios[], cierre.puntosHist
  //    tipo «nota»).
  //  · cambiar con «Sí»: puntos entre personas de una orden, valor de una tarea (hacia adelante), varias correcciones juntas
  //    (con casillas), mover lo hecho de una orden a otra (con el motor de la v153). Sin reglas nuevas.
  if (window.__v154No) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const m0 = (v, d) => { const t = parseFloat(v); return isFinite(t) ? t : d || 0; };   // como `m` de la base (puntosDeOrden)
  const r2 = (v) => Math.round((+v || 0) * 100) / 100;
  const r4 = (v) => Math.round((+v || 0) * 1e4) / 1e4;
  const fN = (v) => { const x = r2(v); try { return fmt(x, Number.isInteger(x) ? 0 : Math.round(x * 10) === x * 10 ? 1 : 2); } catch (e) { return String(x).replace(".", ","); } };
  const fC = (f) => { const p = String(f || "").split("-"); return p.length === 3 ? `${p[2]}/${p[1]}` : String(f || ""); };
  const fTs = (ts) => { try { const d = new Date(+ts); return isFinite(d) ? `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : ""; } catch (e) { return ""; } };
  const hoyISO = () => { try { return fechaAISO(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } };
  const pl = (u, n) => (!u || n === 1 ? u || "" : /^m$|^ml$/i.test(u) ? u : /[aeiouáéíóú]$/i.test(u) ? u + "s" : /[ln]$/i.test(u) ? u.replace(/ó(n)$/, "o$1") + "es" : u + "es");
  const ots = () => { try { return Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []; } catch (e) { return []; } };
  const otDe = (id) => ots().find((o) => o && (o.id === id || o.numero === id)) || null;
  const cerrada = (o) => !!(o && o.cierre && o.cierre.cerradoTs);
  const tieneCierre = (o) => !!(o && o.cierre && o.cierre.cantidades && Object.keys(o.cierre.cantidades).length);
  const yoMail = () => String((window.__fbUser || {}).email || "");
  const yoNombre = () => { try { const y = window.PERMISOS && PERMISOS.yo && PERMISOS.yo(); return (y && (y.nombre || y.usuario)) || yoMail().split("@")[0]; } catch (e) { return yoMail().split("@")[0]; } };
  const catalogo = () => { try { return typeof ACTIVIDADES_CATALOGO != "undefined" ? ACTIVIDADES_CATALOGO : []; } catch (e) { return []; } };
  const labelDe = (k) => { if (String(k).indexOf("m:") === 0) return String(k).slice(2); const a = catalogo().find((x) => x.id === k); return a ? a.label : String(k); };
  const baremo = () => { try { return (window.baremoActual && window.baremoActual()) || {}; } catch (e) { return {}; } };
  const pesos = () => { try { return (window.__pesosRol && window.__pesosRol()) || { Oficial: 1, "Medio oficial": 0.8, Ayudante: 0.6, Capataz: 1, Chofer: 0.4, Sereno: 0.2 }; } catch (e) { return {}; } };
  const fabrica = () => { try { return (window.__baremoFabrica && window.__baremoFabrica()) || {}; } catch (e) { return {}; } };
  const PTS_MANUAL = () => { try { return window.__ptsTareaManual ? window.__ptsTareaManual() : 2; } catch (e) { return 2; } };
  const nube = () => window.__baremoNube || {};
  const canon = (n) => { try { return window.nombreCanonico ? window.nombreCanonico(n) : String(n || "").trim(); } catch (e) { return String(n || "").trim(); } };
  const primer = (n) => String(n || "").trim().split(/\s+/)[0] || "";
  const nomina = () => { let l = []; try { const p = window.__personalNube || {}; l = Array.isArray(p.nomina) && p.nomina.length ? p.nomina : Array.isArray(p.lista) ? p.lista : []; if (!l.length) l = (typeof window.nominaEquipo == "function" ? window.nominaEquipo() : []) || []; } catch (e) { l = []; } return l.filter((x) => x && String(x.nombre || "").trim()); };
  const personalDe = (o) => { const v = new Set(), l = []; (Array.isArray(o.personal) ? o.personal : []).forEach((p) => { const n = String((p && (typeof p == "string" ? p : p.nombre)) || "").trim(); if (!n || v.has(nk(n))) return; v.add(nk(n)); l.push({ nombre: n, rol: (p && p.rol) || "" }); }); return l; };
  function rolDe(o, n) { const p = personalDe(o).find((x) => nk(x.nombre) === nk(n)); return p ? p.rol : ""; }
  function puede() {   // explicar, revisar y cambiar: solo Administración y Oficina (quien edita Órdenes)
    try {
      if (!window.PERMISOS) return true;
      if (window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()) return false;
      const y = PERMISOS.yo ? PERMISOS.yo() : null, rol = y && y.rol;
      if (rol === "cuadrilla" || rol === "operario" || rol === "mirar" || rol === "panol") return false;
      return PERMISOS.permiso("parte") === "editar" || PERMISOS.permiso("produccion") === "editar";
    } catch (e) { return false; }
  }
  const puedeBaremo = () => { try { return puede() && (!window.PERMISOS || PERMISOS.permiso("produccion") === "editar"); } catch (e) { return false; } };
  const fechaOt = (o) => (o.cierre && o.cierre.fecha) || o.fecha || "";
  function horasJornada(o) {
    const a = (d) => { const l = /^(\d{1,2}):(\d{2})$/.exec(String(d || "").trim()); return l ? Number(l[1]) + Number(l[2]) / 60 : null; };
    const n = a(o.horaInicio), i = a(o.horaFin);
    return n != null && i != null && i > n ? i - n : 8;
  }

  // ===================================================================== valor de una tarea: de dónde sale
  const histBaremo = () => (Array.isArray(nube().hist) ? nube().hist : []);
  const criterios = () => (Array.isArray(nube().criterios) ? nube().criterios : []).filter((c) => c && c.texto && !c.borrado);
  function vigente(k) {
    if (String(k).indexOf("m:") === 0) return PTS_MANUAL();
    const b = baremo()[k]; return b ? m0(b.pts) : PTS_MANUAL();
  }
  function fuenteValor(k) {
    if (String(k).indexOf("m:") === 0) return { fuente: "manual", texto: `tarea escrita a mano (fuera del catálogo): vale ${fN(PTS_MANUAL())} por unidad` };
    const v = vigente(k), fb = fabrica()[k], nb = ((nube().baremo || {})[k]) || null, dic = (window.__DICC_SE || {})[k];
    const ult = histBaremo().filter((h) => h && h.k === k && h.tipo !== "peso").sort((a, b) => (+b.ts || 0) - (+a.ts || 0))[0] || null;
    if (nb && fb && Math.abs(m0(nb.pts) - m0(fb.pts)) > 1e-9) return { fuente: "produccion", texto: `editado en Producción › «Cuánto vale cada tarea» (de fábrica valía ${fN(fb.pts)})` + (ult ? ` · último cambio el ${fTs(ult.ts)} por ${ult.porNombre || ult.por || "?"}: ${fN(ult.antes)} → ${fN(ult.despues)} · motivo: ${ult.motivo ? "«" + ult.motivo + "»" : "sin motivo anotado"}` : " · sin motivo anotado (el cambio es de antes de la v154)"), ult };
    if (dic) return { fuente: "diccionario", texto: `el del diccionario de tareas (${fN(v)} por ${dic.un || "unidad"})` };
    return { fuente: "fabrica", texto: `el valor de fábrica de la app (${fN(v)})` };
  }
  // por qué la orden se cerró con un valor distinto del de hoy
  function porQueValor(o, k, enOrden) {
    const v = vigente(k); if (Math.abs(enOrden - v) < 1e-6) return null;
    const ts0 = +((o.cierre || {}).cerradoTs) || 0, fija = (o.cierre || {}).puntos || {};
    const cambios = histBaremo().filter((h) => h && h.k === k && h.tipo !== "peso" && (+h.ts || 0) > ts0).sort((a, b) => (+a.ts || 0) - (+b.ts || 0));
    if (cambios.length) { const c = cambios[0]; return { ok: true, texto: `cuando se cerró valía ${fN(enOrden)}; el ${fTs(c.ts)} ${c.porNombre || c.por || "?"} lo cambió a ${fN(c.despues)} en Producción (motivo: ${c.motivo ? "«" + c.motivo + "»" : "sin motivo anotado"}). Las órdenes cerradas no cambian.` }; }
    const h = ((o.cierre || {}).puntosHist || []).filter((x) => x && (!x.tipo || x.tipo === "puntos") && (x.tareas || []).some((t) => String(t).indexOf(labelDe(k)) === 0 || (t && t.k === k)));
    if (fija.editado || h.length) { const u = h[h.length - 1] || {}; return { ok: !!u.motivo, texto: `se puso a mano en esta orden con «⭐ Puntos» (${fN(enOrden)} por unidad${u.ts ? ", el " + fTs(u.ts) + " por " + (u.porNombre || u.por || "?") : ""}; motivo: ${u.motivo ? "«" + u.motivo + "»" : "sin motivo anotado"})` }; }
    return { ok: false, texto: `la orden se cerró con ${fN(enOrden)} por unidad y hoy la tarea vale ${fN(v)}, y no hay ningún cambio anotado que lo explique` };
  }

  // ===================================================================== la cuenta (la misma de puntosDeOrden, paso a paso)
  // valores: {k: puntos por unidad} (los de la foto fija de la orden) o null (los de hoy)
  function cuenta(o, valores) {
    const a = (o && o.cierre) || {}, P = pesos(), out = { renglones: [], personas: [], total: 0, aManoTodo: false, resto: [] };
    Object.keys(a.cantidades || {}).forEach((k) => {
      const c = num(a.cantidades[k]); if (c <= 0) return;
      const pu = valores && valores[k] != null ? num(valores[k]) : vigente(k), un = String(k).indexOf("m:") === 0 ? "unidad" : ((baremo()[k] || {}).un || "unidad");
      out.renglones.push({ k, label: labelDe(k), cant: c, un, ptsUnit: pu, pts: c * pu }); out.total += c * pu;
    });
    const n = personalDe(o); if (!n.length) return out;
    const hp = a.horasPersona || {}, hj = horasJornada(o);
    const hde = (r) => { const c = Object.keys(hp).find((x) => nk(x) === nk(r.nombre)), v = c != null ? m0(hp[c]) : 0; return a.horasPersonaV === 2 && c != null ? Math.max(0, v) : v > 0 ? v : hj; };
    const peso = (r) => m0(P[r.rol], 0.6) * (hj > 0 ? hde(r) / hj : 1);
    const pp = n.map((r) => ({ nombre: canon(r.nombre), rol: r.rol, horas: hde(r), peso: peso(r), pesoRol: m0(P[r.rol], 0.6), pts: 0, partes: [] }));
    const idx = (nm) => n.findIndex((y) => nk(y.nombre) === nk(nm));
    const rep = a.reparto && Object.keys(a.reparto).length ? a.reparto : null;
    if (rep) {
      out.aManoTodo = true;
      const tt = out.renglones.map((r) => `${r.label} ${fN(r.cant)} × ${fN(r.ptsUnit)} = ${fN(r.pts)}`).join(" + ") + ` → la orden vale ${fN(out.total)} pts`;
      const hm = (a.puntosHist || []).filter((h) => h && h.tipo !== "nota").slice(-1)[0], porq = hm ? ` (lo puso ${hm.porNombre || hm.por || "?"} el ${fTs(hm.ts)}; motivo: ${hm.motivo ? "«" + hm.motivo + "»" : "sin motivo anotado"})` : " (sin motivo anotado)";
      n.forEach((r, j) => { const c = Object.keys(rep).find((x) => nk(x) === nk(r.nombre)); pp[j].pts = m0(c != null ? rep[c] : 0, 0); pp[j].partes.push({ k: "*", label: "toda la orden", pts: pp[j].pts, regla: "aMano", como: `${tt}; el reparto de toda la orden se puso a mano: ${pp[j].nombre} ${fN(pp[j].pts)} de ${fN(out.total)}${porq}`, yo: `${tt}; la oficina puso a mano el reparto: a vos ${fN(pp[j].pts)}` }); });
      out.personas = pp; return out;
    }
    const restos = [];
    out.renglones.forEach((r) => {
      const add = (j, p, regla, como, yo) => { pp[j].pts += p; pp[j].partes.push({ k: r.k, label: r.label, pts: p, regla, como, yo: yo || como }); };
      const base = `${fN(r.cant)} ${pl(r.un, r.cant)} × ${fN(r.ptsUnit)} = ${fN(r.pts)} pts`;
      const ptT = a.puntosTarea && a.puntosTarea[r.k];
      if (ptT && typeof ptT == "object" && Object.keys(ptT).length) {
        const tot0 = Object.values(ptT).reduce((s, v) => s + (+v || 0), 0); let dado = 0;
        const nombres = Object.keys(ptT).filter((nm) => idx(nm) >= 0 && (+ptT[nm] || 0) > 0);
        const hc = (a.puntosHist || []).filter((h) => h && (h.tareas || []).some((x) => x && x.k === r.k)).slice(-1)[0], deDonde = hc ? ` (${hc.tipo === "corregir" ? "«✏ Corregir cierre»" : "a mano"} del ${fTs(hc.ts)} por ${hc.porNombre || hc.por || "?"}; motivo: ${hc.motivo ? "«" + hc.motivo + "»" : "sin motivo anotado"})` : " (al cerrar, «👥 Puntos de esta tarea»)";
        const W2 = nombres.reduce((s, nm) => s + peso(n[idx(nm)]), 0), rolHoras = W2 > 0 && nombres.every((nm) => Math.abs((+ptT[nm] || 0) / tot0 - peso(n[idx(nm)]) / W2) < 0.01);
        Object.keys(ptT).forEach((nm) => { const j = idx(nm); if (j < 0 || !(tot0 > 0)) return; const p = r.pts * (+ptT[nm] || 0) / tot0; dado += p; if (p > 0 || (+ptT[nm] || 0) === 0) add(j, p, "porTarea", `${r.label}: ${base}; repartida por tarea entre ${nombres.map(primer).join(", ") || "nadie"}${rolHoras ? " con la cuenta de siempre (rol × horas)" : " a mano"}: le tocan ${fN(+ptT[nm] || 0)} de ${fN(tot0)} → ${fN(p)}${deDonde}`, `${r.label}: ${base}; repartida por tarea entre ${nombres.length} persona(s)${rolHoras ? " por rol × horas" : " a mano"}: te tocan ${fN(+ptT[nm] || 0)} de ${fN(tot0)} → ${fN(p)}`); });
        if (r.pts - dado > 1e-9) restos.push({ r, p: r.pts - dado, por: "lo que no se repartió por tarea" });
        r.regla = rolHoras ? "porTareaRolHoras" : "porTarea"; r.quienes = nombres; return;
      }
      const eqs = window.__equipoTarea && window.__equipoTarea.equiposDe ? window.__equipoTarea.equiposDe(o, r.k) : null;
      if (eqs) {
        const hh = window.__equipoTarea.hechoPorEquipo(o, r.k) || [], tot2 = hh.reduce((s, v) => s + (+v || 0), 0); let dado = 0;
        eqs.forEach((g, gi) => {
          const p4 = r.pts * (tot2 > 0 ? (+hh[gi] || 0) / tot2 : 1 / eqs.length);
          const ix = n.map((y, j) => (g.nombres.some((z) => nk(z) === nk(y.nombre)) ? j : -1)).filter((j) => j >= 0);
          if (!ix.length || !(p4 > 0)) return;
          const We = ix.reduce((s, j) => s + peso(n[j]), 0);
          ix.forEach((j) => { const p3 = We > 0 ? p4 * peso(n[j]) / We : p4 / ix.length; add(j, p3, "equipos", `${r.label}: ${base}; por equipos según lo hecho: su equipo (${g.nombres.map(primer).join(", ")}) hizo ${fN(+hh[gi] || 0)} de ${fN(tot2)} → ${fN(p4)}; adentro por rol × horas (peso ${fN(peso(n[j]))} de ${fN(We)}) → ${fN(p3)}`, `${r.label}: ${base}; por equipos según lo hecho: tu equipo hizo ${fN(+hh[gi] || 0)} de ${fN(tot2)} → ${fN(p4)}; adentro por rol × horas → ${fN(p3)}`); });
          dado += p4;
        });
        if (r.pts - dado > 1e-9) restos.push({ r, p: r.pts - dado, por: "lo que no hizo ningún equipo" });
        r.regla = "equipos"; return;
      }
      const hp2 = window.__reparto && window.__reparto.hechoPorPersona ? window.__reparto.hechoPorPersona(o, r.k) : null;
      if (hp2) {
        let dado = 0, dadoCant = 0;
        hp2.forEach((x) => {
          const q = idx(x.nombre); if (q < 0 || !(x.cant > 0) || !(r.cant > 0)) return;
          const c2 = Math.min(x.cant, Math.max(0, r.cant - dadoCant)); if (!(c2 > 0)) return;
          const p2 = r.pts * c2 / r.cant; dadoCant += c2; dado += p2;
          add(q, p2, "repartida", `${r.label}: ${base}; tarea repartida («✂ repartir»), se cobra por lo que hizo cada uno: hizo ${fN(c2)} de ${fN(r.cant)} → ${fN(r.pts)} × ${fN(c2)}/${fN(r.cant)} = ${fN(p2)}`, `${r.label}: ${base}; tarea repartida: hiciste ${fN(c2)} de ${fN(r.cant)} → ${fN(p2)}`);
        });
        if (r.pts - dado > 1e-9) restos.push({ r, p: r.pts - dado, por: "lo que no hizo nadie en particular" });
        r.regla = "repartida"; return;
      }
      const eqT = window.__equipoTarea && window.__equipoTarea.de ? window.__equipoTarea.de(o, r.k) : null;
      if (eqT) {
        const ix = n.map((y, j) => (eqT.some((z) => nk(z) === nk(y.nombre)) ? j : -1)).filter((j) => j >= 0);
        const We = ix.reduce((s, j) => s + peso(n[j]), 0);
        if (ix.length) { ix.forEach((j) => { const p3 = We > 0 ? r.pts * peso(n[j]) / We : r.pts / ix.length; add(j, p3, "elegirQuienes", `${r.label}: ${base}; «👥 Elegir quiénes»: solo entre ${ix.map((i) => primer(n[i].nombre)).join(", ")}, por rol × horas (${n[j].rol || "sin rol"} ${fN(m0(P[n[j].rol], 0.6))} × ${fN(hde(n[j]))} h/${fN(hj)} h = peso ${fN(peso(n[j]))} de ${fN(We)}) → ${fN(p3)}`, `${r.label}: ${base}; la hicieron ${ix.length} (vos incluido), por rol × horas (tu peso ${fN(peso(n[j]))} de ${fN(We)}) → ${fN(p3)}`); }); r.regla = "elegirQuienes"; return; }
      }
      const asig = (o.asignada || {})[r.k], q = asig ? idx(asig) : -1;
      if (q >= 0) { add(q, r.pts, "asignada", `${r.label}: ${base}; tarea asignada a ${n[q].nombre}: se lleva todo`, `${r.label}: ${base}; te la asignaron a vos: te llevás todo`); r.regla = "asignada"; return; }
      restos.push({ r, p: r.pts, por: "toda la cuadrilla" }); r.regla = "cuadrilla";
    });
    const W = n.reduce((s, r) => s + peso(r), 0);
    restos.forEach((x) => {
      n.forEach((r, j) => {
        const p = W > 0 ? x.p * peso(r) / W : x.p / n.length;
        pp[j].pts += p;
        pp[j].partes.push({ k: x.r.k, label: x.r.label, pts: p, regla: "rolHoras", como: `${x.r.label}: ${fN(x.r.cant)} ${pl(x.r.un, x.r.cant)} × ${fN(x.r.ptsUnit)} = ${fN(x.r.pts)} pts; ${x.por === "toda la cuadrilla" ? "para toda la cuadrilla" : x.por + " (" + fN(x.p) + ")"}, por rol × horas: ${r.rol || "sin rol"} ${fN(m0(P[r.rol], 0.6))} × ${fN(hde(r))} h/${fN(hj)} h = peso ${fN(peso(r))} de ${fN(W)} → ${fN(p)}`, yo: `${x.r.label}: ${fN(x.r.cant)} ${pl(x.r.un, x.r.cant)} × ${fN(x.r.ptsUnit)} = ${fN(x.r.pts)} pts, para toda la cuadrilla (${n.length}), por rol × horas: ${r.rol || "sin rol"} ${fN(m0(P[r.rol], 0.6))} × ${fN(hde(r))} h/${fN(hj)} h = tu peso ${fN(peso(r))} de ${fN(W)} → ${fN(p)}` });
      });
    });
    out.resto = restos.map((x) => ({ k: x.r.k, pts: x.p, por: x.por })); out.personas = pp;
    return out;
  }
  // la foto fija de la orden (lo que guarda el cierre) y lo que cuenta Producción
  function fijaDe(o) { const z = o && o.cierre && o.cierre.puntos; return z && Array.isArray(z.porPersona) ? z : null; }
  function produccionDe(o) {   // lo que suma Producción por persona (puntosDeOrden sin «vivo», con el piso y los reinicios)
    let z = null; try { z = typeof window.prodPuntosDeOrden == "function" ? window.prodPuntosDeOrden(o) : window.puntosDeOrden(o); } catch (e) { z = null; }
    const mp = {}; ((z && z.porPersona) || []).forEach((p) => { if (p && p.nombre) mp[nk(p.nombre)] = (mp[nk(p.nombre)] || 0) + (+p.pts || 0); });
    return { z, mp, total: z ? +z.total || 0 : 0 };
  }
  function excluidaPor(o) {
    try {
      if (!window.__puntosExcluida || !window.__puntosExcluida(o)) return null;
      const f = fechaOt(o), C = (window.__reinicios && window.__reinicios()) || {}, piso = window.__puntosPiso ? window.__puntosPiso() : "";
      if (f && piso && f < piso) return `la fecha (${fC(f)}) es anterior al piso de puntos (${fC(piso)}): lo de antes no cuenta` + (C.puntosDesde && C.puntosDesde === piso ? " (reinicio de puntos de Producción)" : "");
      if ((C.puntosSinObras || []).map(String).indexOf(String(o.plazaId || "")) >= 0) return "esa obra se sacó de los puntos (reinicio de Producción)";
      if (f && (C.puntosSinDias || []).indexOf(f) >= 0) return `ese día (${fC(f)}) se sacó de los puntos (reinicio de Producción)`;
      return "no cuenta por un reinicio de puntos";
    } catch (e) { return null; }
  }
  function quincenaDe(o) {
    try {
      const Q = window.__quincenas; if (!Q) return null;
      const q = Q.qInfo(Q.qDe(fechaOt(o))), c = (Q.cierres() || {})[q.key];
      return { key: q.key, label: q.label, cerrada: !!(c && c.estado === "cerrada"), cierre: c || null };
    } catch (e) { return null; }
  }
  function histTexto(h) {
    const tipo = h.tipo === "corregir" ? "«✏ Corregir cierre»" : h.tipo === "persona" ? "puntos movidos entre personas" : h.tipo === "cierre" ? "puntos a mano al cerrar" : h.tipo === "nota" ? "nota" : "«⭐ Puntos»";
    const per = (h.personas || []).map((p) => `${primer(p.nombre)} ${fN(p.antes)} → ${fN(p.despues)}`).join(", ");
    return `${fTs(h.ts)} · ${h.porNombre || h.por || "?"} · ${tipo}${h.tipo === "nota" ? "" : `: total ${fN(h.antes)} → ${fN(h.despues)}`}${per ? " (" + per + ")" : ""} · ${h.tipo === "nota" ? "«" + (h.texto || h.motivo || "") + "»" : "motivo: " + (h.motivo ? "«" + h.motivo + "»" : "sin motivo anotado")}${h.porAsistente ? " · lo hizo el asistente con «Sí»" : ""}`;
  }
  function criteriosDe(o, k, persona) {
    const f = o ? fechaOt(o) : "";
    return criterios().filter((c) => (!c.tarea || !k || c.tarea === k) && (!c.persona || !persona || nk(c.persona) === nk(persona)) && (!c.otId || !o || c.otId === o.id)).map((c) => ({ texto: c.texto, ...(c.desde && f && c.desde > f ? { ojo: "es de después de esta orden (rige desde el " + fC(c.desde) + ")" } : {}), tarea: c.tarea ? labelDe(c.tarea) : "", persona: c.persona || "", desde: c.desde || "", por: c.porNombre || c.por || "", fecha: fTs(c.ts) }));
  }

  // ===================================================================== explicar una orden
  function explicarOrden(ref, op) {
    op = op || {};
    const o = typeof ref == "object" ? ref : otDe(ref); if (!o) return { err: `No encontré la orden «${ref}».` };
    if (!tieneCierre(o)) return { err: `${o.numero || "La orden"} todavía no se cerró: no tiene puntos (los puntos salen al cerrarla).`, numero: o.numero };
    const fija = fijaDe(o), valores = {}; if (fija) (fija.renglones || []).forEach((r) => { if (r && r.k) valores[r.k] = num(r.ptsUnit); });
    const V = cuenta(o, fija ? valores : null), Vhoy = cuenta(o, null), Pr = produccionDe(o), exc = excluidaPor(o), q = quincenaDe(o);
    const tareas = V.renglones.map((r) => {
      const pq = porQueValor(o, r.k, r.ptsUnit), fv = fuenteValor(r.k);
      return { k: r.k, tarea: r.label, cantidad: r.cant, un: r.un, ptsPorUnidad: r.ptsUnit, pts: r2(r.pts), cuenta: `${fN(r.cant)} ${pl(r.un, r.cant)} × ${fN(r.ptsUnit)} = ${fN(r.pts)} pts`, regla: r.regla || "cuadrilla", quienes: r.quienes || null, valorHoy: vigente(r.k), deDondeSaleElValor: fv.texto, ...(pq ? { valorDistinto: pq.texto, valorExplicado: pq.ok } : {}) };
    });
    // el cierre dice «no se hizo» / 0 y la tarea está en la orden
    const ceros = Object.keys(o.cierre.cantidades || {}).filter((k) => !(num(o.cierre.cantidades[k]) > 0)).concat((o.actividades || []).filter((k) => !(k in (o.cierre.cantidades || {})))).filter((k, i, l) => l.indexOf(k) === i).map((k) => ({ k, tarea: labelDe(k), cantidad: 0, pts: 0, cuenta: "0 (en el cierre: no se hizo) → no da puntos" }));
    const fijMap = {}; if (fija) fija.porPersona.forEach((p) => { fijMap[nk(canon(p.nombre))] = (fijMap[nk(canon(p.nombre))] || 0) + (+p.pts || 0); });
    const personas = V.personas.map((p) => {
      const f = fija ? fijMap[nk(p.nombre)] || 0 : null, prod = Pr.mp[nk(p.nombre)] || 0;
      return { nombre: p.nombre, rol: p.rol, horas: p.horas, peso: r2(p.peso), pts: r2(f != null ? f : p.pts), cuenta: r2(p.pts), cuadra: f == null || Math.abs(f - p.pts) < 0.02, detalle: p.partes.filter((x) => x.pts > 1e-9 || x.regla === "porTarea").map((x) => ({ tarea: x.label, pts: r2(x.pts), como: x.como, yo: x.yo })) };
    });
    if (fija) fija.porPersona.forEach((p) => { if (!personas.some((x) => nk(x.nombre) === nk(canon(p.nombre)))) personas.push({ nombre: canon(p.nombre), rol: p.rol || "", pts: r2(p.pts), cuenta: 0, cuadra: !(+p.pts > 0.01), noEstaEnLaOrden: true, detalle: [{ tarea: "—", pts: r2(p.pts), como: "figura en los puntos guardados pero NO está en la gente de la orden" }] }); });
    const hist = ((o.cierre.puntosHist) || []).map((h) => ({ fecha: fTs(h.ts), por: h.porNombre || h.por || "", tipo: h.tipo || "puntos", antes: h.antes, despues: h.despues, motivo: h.motivo || h.texto || "", sinMotivo: !(h.motivo || h.texto), porAsistente: !!h.porAsistente, texto: histTexto(h) }));
    const sumaFija = fija ? r2(fija.porPersona.reduce((s, p) => s + (+p.pts || 0), 0)) : null;
    const noCuadra = personas.filter((p) => !p.cuadra);
    const notas = [];
    if (fija) notas.push(`Los puntos quedaron GUARDADOS al cerrar (${fija.ts ? fTs(fija.ts) : "fecha sin dato"}): valen esos aunque después cambie el baremo.` + (fija.editado ? " Se tocaron a mano con «⭐ Puntos»." : "") + (fija.corregido ? " Se corrigieron con «✏ Corregir cierre»." : ""));
    else notas.push("La orden no tiene los puntos guardados (es de antes): Producción los calcula con los valores de hoy.");
    if (V.aManoTodo) notas.push("El reparto de TODA la orden se puso a mano (cierre.reparto): no se aplica la cuenta por tarea.");
    if (fija && noCuadra.length) notas.push(`Con la cuenta de siempre daría distinto para ${noCuadra.map((p) => `${p.nombre} (guardado ${fN(p.pts)}, la cuenta da ${fN(p.cuenta)})`).join(", ")}: ${fija.editado || (o.cierre.puntosHist || []).length ? "son los puntos que se pusieron a mano (ver el historial)" : "no hay cambio anotado que lo explique"}.`);
    if (fija && Math.abs(sumaFija - r2(fija.total)) > 0.05) notas.push(`⚠ Los puntos de cada uno suman ${fN(sumaFija)} y la orden vale ${fN(fija.total)}: el reparto no suma.`);
    if (exc) notas.push(`⚠ Esta orden NO suma en Producción: ${exc}.`);
    if (q && q.cerrada) notas.push(`La ${q.label} ya está CERRADA: lo que vale para pagar es la foto fija; si la orden cambió después, la diferencia va como ajuste a la quincena abierta.`);
    const hoyDistinto = fija && Math.abs(r2(Vhoy.total) - r2(fija.total)) > 0.01 ? `Con los valores de hoy la orden daría ${fN(Vhoy.total)} pts (se cerró con ${fN(fija.total)}).` : "";
    if (hoyDistinto) notas.push(hoyDistinto);
    let res = {
      otId: o.id, numero: o.numero || "", obra: String(o.plazaNombre || "").toUpperCase(), fecha: fechaOt(o), quincena: q ? q.label + (q.cerrada ? " (cerrada)" : "") : "",
      total: r2(fija ? fija.total : V.total), totalEnProduccion: exc ? 0 : r2(Pr.total), guardados: !!fija, horasJornada: horasJornada(o),
      tareas: tareas.concat(ceros), personas, historial: hist, criterios: criteriosDe(o, null, op.persona || null), notas, excluida: exc || null
    };
    if (op.persona) {
      const z = nk(op.persona), p = personas.find((x) => nk(x.nombre) === z) || personas.find((x) => nk(x.nombre).indexOf(z) === 0) || personas.find((x) => primer(nk(x.nombre)) === primer(z));
      res.persona = p ? p.nombre : op.persona; res.suyos = p || { nombre: op.persona, pts: 0, detalle: [], noEstaEnLaOrden: true };
      res.enProduccion = exc ? 0 : r2(Pr.mp[nk(res.persona)] || 0);
      res.cuentaPaso = p ? p.detalle.map((d) => d.como).join(" | ") + ` → total ${fN(p.pts)}` + (p.cuadra ? "" : ` (la cuenta da ${fN(p.cuenta)}: lo guardado se puso a mano)`) : `${op.persona} no está en ${o.numero || "la orden"}.`;
    }
    if (op.tarea) { const z = nk(op.tarea), t = res.tareas.find((x) => x.k === op.tarea || nk(x.tarea) === z) || res.tareas.find((x) => nk(x.tarea).indexOf(z) >= 0 || z.split(" ").filter((w) => w.length > 2).every((w) => nk(x.tarea).indexOf(w) >= 0)); if (t) { res.laTarea = t; res.laTareaPorPersona = personas.map((p) => ({ nombre: p.nombre, pts: r2(p.detalle.filter((d) => d.tarea === t.tarea).reduce((s, d) => s + d.pts, 0)), como: p.detalle.filter((d) => d.tarea === t.tarea).map((d) => d.como).join(" | ") })).filter((x) => x.pts > 0 || x.como); res.criterios = criteriosDe(o, t.k, op.persona || null); } }
    return res;
  }

  // ===================================================================== explicar a una persona en un período
  function periodoDe(a) {
    a = a || {};
    const Q = window.__quincenas;
    if (a.desde || a.hasta) { const d = a.desde || a.hasta, h = a.hasta || hoyISO(); return { desde: d <= h ? d : h, hasta: d <= h ? h : d, label: `del ${fC(d)} al ${fC(h)}`, key: "" }; }
    let q = Q ? Q.qDe(hoyISO()) : null; const p = nk(a.periodo || "actual");
    if (!Q) return { desde: "0000-01-01", hasta: "9999-12-31", label: "todo", key: "" };
    if (p === "anterior") q = Q.qMover(q, -1);
    else { const m = String(a.periodo || "").match(/^(\d{4})-(\d{1,2})-([12])$/); if (m) q = { y: +m[1], m: +m[2], n: +m[3] }; else if (/^\d{4}-\d\d-\d\d$/.test(String(a.periodo || ""))) q = Q.qDe(a.periodo); }
    const i = Q.qInfo(q); return { desde: i.desde, hasta: i.hasta, label: i.label, key: i.key, rango: i.rango };
  }
  function personaCanon(q) {
    const z = nk(q); if (!z) return null;
    const nombres = new Set(); nomina().forEach((p) => nombres.add(p.nombre)); ots().forEach((o) => personalDe(o).forEach((p) => nombres.add(p.nombre)));
    const l = [...nombres]; let r = l.filter((n) => nk(n) === z); if (r.length) return r[0];
    r = l.filter((n) => z.split(" ").every((w) => nk(n).split(" ").some((x) => x.indexOf(w) === 0))); if (r.length === 1) return r[0];
    if (r.length > 1) return { varios: r };
    return null;
  }
  function explicarPersona(nombre, a) {
    const Q = window.__quincenas; if (!Q || !Q.calcular) return { err: "La cuenta de puntos todavía no está lista en la app." };
    const pc = personaCanon(nombre); if (!pc) return { err: `«${nombre}» no está en la nómina ni en ninguna orden.` };
    if (pc.varios) return { err: `«${nombre}» puede ser: ${pc.varios.join(", ")}. Preguntá cuál.` };
    const per = periodoDe(a), c = Q.calcular(per.desde, per.hasta), z = nk(pc);
    const x = (c.personas || []).find((p) => nk(p.nombre) === z) || null;
    const ordenes = ((x && x.ordenes) || []).map((r) => {
      const o = otDe(r.id), E = o ? explicarOrden(o, { persona: pc }) : null;
      return { numero: r.numero, otId: r.id, obra: r.plaza, fecha: r.fecha, pts: r.pts, cuenta: E && E.cuentaPaso, tareas: E && E.suyos ? E.suyos.detalle : [], valoresDistintos: E ? E.tareas.filter((t) => t.valorDistinto).map((t) => t.tarea + ": " + t.valorDistinto) : [], historial: E ? E.historial : [], guardados: E ? E.guardados : false };
    });
    const excluidas = ots().filter((o) => o && o.estado !== "Anulada" && tieneCierre(o) && fechaOt(o) >= per.desde && fechaOt(o) <= per.hasta && personalDe(o).some((p) => nk(p.nombre) === z) && excluidaPor(o)).map((o) => ({ numero: o.numero || "", obra: o.plazaNombre || "", fecha: fechaOt(o), porQue: excluidaPor(o) }));
    const sinCerrar = ots().filter((o) => o && o.estado !== "Anulada" && !tieneCierre(o) && fechaOt(o) >= per.desde && fechaOt(o) <= per.hasta && personalDe(o).some((p) => nk(p.nombre) === z)).map((o) => o.numero || o.id);
    const sumaOrd = r2(ordenes.reduce((s, o) => s + (+o.pts || 0), 0));
    let ajuste = 0, ajustes = [], fotoFija = null, quincena = per.label, cerradaQ = false, d = null;
    if (per.key) {
      try { const p = per.key.split("-").map(Number); d = Q.datosDe(Q.qInfo({ y: p[0], m: p[1], n: p[2] })); } catch (e) { d = null; }
      if (d && d.fija) { cerradaQ = true; const f = (d.personas || []).find((p) => nk(p.nombre) === z); fotoFija = f ? r2(f.pts) : 0; }
      if (d && !d.fija) { const p = (d.personas || []).find((y) => nk(y.nombre) === z); if (p) { ajuste = r2(p.ajuste || 0); ajustes = (p.ajustes || []).map((j) => ({ de: j.deLabel || j.de, pts: j.pts })); } }
    }
    const totalProd = cerradaQ ? fotoFija : r2((x ? x.pts : 0) + ajuste);
    const cuentaTxt = ordenes.map((o) => `${o.numero} ${fN(o.pts)}`).join(" + ") + (ajustes.length ? ajustes.map((j) => ` ${j.pts >= 0 ? "+" : "−"} ${fN(Math.abs(j.pts))} (ajuste de la ${j.de})`).join("") : "") + ` = ${fN(r2(sumaOrd + ajuste))}`;
    const notas = [];
    if (cerradaQ) notas.push(`La ${quincena} está CERRADA: para pagar vale la foto fija (${fN(fotoFija)} pts).` + (Math.abs(fotoFija - sumaOrd) > 0.009 ? ` Con las órdenes de hoy daría ${fN(sumaOrd)}: la diferencia (${fN(r2(sumaOrd - fotoFija))}) pasa como ajuste a la quincena abierta.` : " Coincide con la cuenta de hoy."));
    if (excluidas.length) notas.push(`${excluidas.length} orden(es) de estas fechas NO suman (piso o reinicio de puntos).`);
    if (sinCerrar.length) notas.push(`${sinCerrar.length} orden(es) sin cerrar todavía: no suman hasta que se cierren (${sinCerrar.join(", ")}).`);
    if (Math.abs(sumaOrd - r2(x ? x.pts : 0)) > 0.02) notas.push(`⚠ La suma de las órdenes (${fN(sumaOrd)}) no da lo de Producción (${fN(x ? x.pts : 0)}).`);
    return { persona: pc, periodo: quincena, desde: per.desde, hasta: per.hasta, totalProduccion: totalProd, puntosDeOrdenes: sumaOrd, ajuste, ajustes, quincenaCerrada: cerradaQ, fotoFija, cuenta: cuentaTxt, ordenes, excluidas, sinCerrar, criterios: criteriosDe(null, null, pc), notas, cuadraConProduccion: Math.abs(sumaOrd - r2(x ? x.pts : 0)) <= 0.02 };
  }

  // ===================================================================== revisar (sin IA)
  const NIV = { rojo: 0, ambar: 1, info: 2 };
  function unidadesPagadas(o, k) {   // columnas/unidades con detalle (Modo obra o foto con columna) de esa tarea en la orden
    const s = new Set(), c = o.campo || {};
    const po = ((c.pasosObra || {})[k]) || {}; Object.keys(po).forEach((u) => { const x = po[u]; if (x && x.estado === "si") s.add(nk(x.num || u)); });
    Object.values(c.fotos || {}).forEach((f) => { if (f && !f.borrada && f.k === k && f.num && /^(col|columna|caja|tablero|luminaria|lum|poste)\b/i.test(String(f.num))) s.add(nk(f.num)); });
    return [...s];
  }
  function revisar(a) {
    a = a || {};
    const per = periodoDe(a), zP = a.persona ? nk(personaCanon(a.persona) && !personaCanon(a.persona).varios ? personaCanon(a.persona) : a.persona) : "", zO = a.obra ? nk(a.obra) : "";
    const enPer = (o) => { const f = fechaOt(o); return f >= per.desde && f <= per.hasta; };
    const conPersona = (o) => !zP || personalDe(o).some((p) => nk(p.nombre) === zP) || (((fijaDe(o) || {}).porPersona) || []).some((p) => nk(canon(p.nombre)) === zP);
    const conObra = (o) => !zO || nk(o.plazaNombre).indexOf(zO) >= 0 || String(o.plazaId) === String(a.obra) || String(o.obraId) === String(a.obra);
    const base = ots().filter((o) => o && o.estado !== "Anulada" && tieneCierre(o));
    const lista = base.filter((o) => (a.otId ? o.id === a.otId || o.numero === a.otId : enPer(o)) && conPersona(o) && conObra(o));
    const L = [], H = (g, tipo, o, texto, extra) => L.push(Object.assign({ nivel: g, tipo, otId: o ? o.id : "", numero: o ? o.numero || "" : "", obra: o ? String(o.plazaNombre || "").toUpperCase() : "", fecha: o ? fechaOt(o) : "", texto }, extra || {}));
    lista.forEach((o) => {
      if (excluidaPor(o)) return;
      const c = o.cierre, fija = fijaDe(o), cant = c.cantidades || {}, gente = personalDe(o), hp = c.horasPersona || {};
      const valores = {}; if (fija) (fija.renglones || []).forEach((r) => { if (r && r.k) valores[r.k] = num(r.ptsUnit); });
      const V = cuenta(o, fija ? valores : null), sp = fija ? fija.porPersona : V.personas, total = fija ? +fija.total || 0 : V.total;
      const suma = r2(sp.reduce((s, p) => s + (+p.pts || 0), 0));
      const hist = c.puntosHist || [];
      // 1) el reparto no suma
      if (Math.abs(suma - r2(total)) > 0.05) {
        const V2 = cuenta(Object.assign({}, o, { cierre: Object.assign({}, c, { reparto: null }) }), fija ? valores : null), pr = {}; V2.personas.forEach((p) => { pr[p.nombre] = r2(p.pts); });
        H("rojo", "repartoNoSuma", o, `Los puntos de cada uno suman ${fN(suma)} y la orden vale ${fN(total)} (${suma < total ? "faltan" : "sobran"} ${fN(Math.abs(r2(total - suma)))}).`, { propuesta: { tipo: "puntos_persona", otId: o.id, puntos: pr, texto: "volver al reparto de siempre (rol × horas): " + Object.keys(pr).map((n) => primer(n) + " " + fN(pr[n])).join(", ") } });
      }
      // 2) puntos a quien no está en la orden o con 0 horas
      sp.forEach((p) => {
        if (!(+p.pts > 0.01)) return;
        const nm = canon(p.nombre);
        if (!gente.some((g) => nk(g.nombre) === nk(nm))) { H("rojo", "noEstaEnLaOrden", o, `${nm} tiene ${fN(p.pts)} pts y no está en la gente de la orden.`, { persona: nm, propuesta: { tipo: "texto", texto: "sacarle los puntos (pasarlos a quienes estuvieron) o sumarlo a la orden con «✏ Corregir cierre»" } }); return; }
        const ck = Object.keys(hp).find((x) => nk(x) === nk(nm));
        if (c.horasPersonaV === 2 && ck != null && num(hp[ck]) === 0) H("rojo", "ceroHoras", o, `${nm} figura con 0 horas y tiene ${fN(p.pts)} pts.`, { persona: nm, propuesta: { tipo: "texto", texto: "si no fue, sacarle los puntos y repartirlos entre los demás; si fue, cargarle las horas" } });
      });
      // 3) «no se hizo» (o 0) con puntos · 4) la cuadrilla contra el cierre (v150)
      const marcas = ((o.campo || {}).marcas) || {};
      (fija ? fija.renglones || [] : []).forEach((r) => { if (r && r.k && +r.pts > 0 && !(num(cant[r.k]) > 0)) H("rojo", "noSeHizoConPuntos", o, `«${r.tarea || labelDe(r.k)}» quedó en 0 (no se hizo) pero los puntos guardados le dan ${fN(r.pts)}.`, { tarea: r.tarea || labelDe(r.k), propuesta: { tipo: "texto", texto: "recalcular los puntos de la orden (o corregir lo hecho si sí se hizo)" } }); });
      Object.keys(cant).forEach((k) => { const mk = marcas[k] || marcas[String(k).replace(/[~*\/\[\].`]/g, "_")]; if (num(cant[k]) > 0 && mk && mk.hecho === false) H("rojo", "noSeHizoConPuntos", o, `La cuadrilla mandó «${labelDe(k)}» como NO hecha${mk.motivo ? " (" + mk.motivo + ")" : ""} y el cierre le da ${fN(cant[k])} y puntos.`, { tarea: labelDe(k), propuesta: { tipo: "corregir_cierre", otId: o.id, cambios: [{ tarea: k, hecha: false }], texto: "pasarla a «no se hizo» (0) si no se hizo" } }); });
      try {
        const Vt = !window.__v150No && window.__verifOt ? window.__verifOt.verifOt(o) : null;
        ((Vt && Vt.tareas) || []).forEach((t) => {
          const ci = num(cant[t.k]), fotos = (t.si || []).filter((u) => u.foto).length;
          if (t.hechas > ci + 1e-9 && !(ci > 0)) H("ambar", "cuadrillaDiceHecho", o, `«${t.label}»: la cuadrilla mandó ${fN(t.hechas)}${fotos ? " (con " + fotos + " foto" + (fotos === 1 ? "" : "s") + ")" : ""} y en el cierre quedó 0 (no se hizo): nadie cobró esa tarea.`, { tarea: t.label, propuesta: { tipo: "corregir_cierre", otId: o.id, cambios: [{ tarea: t.k, cantidad: t.hechas }], texto: `pasarla a hecha (${fN(t.hechas)}) si se hizo` } });
          else if (t.hechas > ci + 1e-9) H("ambar", "cuadrillaDiceMas", o, `«${t.label}»: la cuadrilla mandó ${fN(t.hechas)} y en el cierre quedó ${fN(ci)}.`, { tarea: t.label, propuesta: { tipo: "corregir_cierre", otId: o.id, cambios: [{ tarea: t.k, cantidad: t.hechas }], texto: `subirla a ${fN(t.hechas)}` } });
          else if (ci > 0 && t.mandada && t.hechas < ci - 1e-9 && t.conDetalle) H("ambar", "cierreDiceMas", o, `«${t.label}»: en el cierre dice ${fN(ci)} y la cuadrilla mandó ${fN(t.hechas)} (con detalle por columna).`, { tarea: t.label, propuesta: { tipo: "corregir_cierre", otId: o.id, cambios: [{ tarea: t.k, cantidad: t.hechas }], texto: `bajarla a ${fN(t.hechas)}` } });
        });
      } catch (e) { }
      // 6) a mano sin motivo
      const notaTs = hist.reduce((s, h) => (h && h.tipo === "nota" ? Math.max(s, +h.ts || 0) : s), 0);   // una nota posterior explica lo de antes
      const conMotivo = hist.some((h) => h && (h.motivo || h.texto));
      hist.forEach((h) => { if (h && h.tipo !== "nota" && !h.motivo && !(notaTs > (+h.ts || 0))) H("ambar", "aManoSinMotivo", o, `Puntos cambiados a mano el ${fTs(h.ts)} por ${h.porNombre || h.por || "?"} (${fN(h.antes)} → ${fN(h.despues)}) sin motivo anotado.`, { propuesta: { tipo: "nota", otId: o.id, texto: "anotar el motivo (proponer_nota_puntos)" } }); });
      if (!hist.length && ((c.reparto && Object.keys(c.reparto).length) || (fija && fija.editado))) H("ambar", "aManoSinMotivo", o, "Los puntos de la orden se pusieron a mano al cerrar y no hay motivo anotado.", { propuesta: { tipo: "nota", otId: o.id, texto: "anotar el motivo (proponer_nota_puntos)" } });
      else if (!conMotivo && c.puntosTarea && Object.keys(c.puntosTarea).some((k) => { const v = c.puntosTarea[k]; return v && Object.keys(v).length; }) && !hist.length) {
        const ks = Object.keys(c.puntosTarea).filter((k) => { const v = c.puntosTarea[k]; if (!v || !Object.keys(v).length) return false; const r = V.renglones.find((x) => x.k === k); return !(r && r.regla === "porTareaRolHoras"); });
        if (ks.length) H("ambar", "aManoSinMotivo", o, `Los puntos de ${ks.map((k) => "«" + labelDe(k) + "»").join(", ")} se repartieron a mano y no hay motivo anotado.`, { propuesta: { tipo: "nota", otId: o.id, texto: "anotar el motivo (proponer_nota_puntos)" } });
      }
      // 7) valor distinto del baremo sin explicación
      (fija ? fija.renglones || [] : []).forEach((r) => { if (!r || !r.k || !(+r.cant > 0)) return; const q = porQueValor(o, r.k, num(r.ptsUnit)); if (q && !q.ok) H("ambar", "valorDistinto", o, `«${r.tarea || labelDe(r.k)}»: ${q.texto}.`, { tarea: r.tarea || labelDe(r.k), propuesta: { tipo: "texto", texto: "si estuvo bien, anotar el porqué; si no, ponerla con el valor de hoy" } }); });
      // 9) cerrada sin puntos
      const algo = Object.keys(cant).some((k) => num(cant[k]) > 0);
      if (algo && (total <= 0 || !(suma > 0))) H("rojo", "sinPuntos", o, total <= 0 ? "La orden está cerrada con trabajo hecho y vale 0 puntos (las tareas valen 0)." : "La orden vale puntos pero no le tocan a nadie (sin gente).", { propuesta: { tipo: "texto", texto: "revisar el valor de las tareas y la gente de la orden" } });
    });
    // 5) la misma columna pagada en dos órdenes
    const vistas = {};
    base.forEach((o) => { if (excluidaPor(o) || !o.plazaId) return; Object.keys(o.cierre.cantidades || {}).forEach((k) => { if (!(num(o.cierre.cantidades[k]) > 0)) return; unidadesPagadas(o, k).forEach((u) => { const kk = o.plazaId + "|" + k + "|" + u; (vistas[kk] = vistas[kk] || []).push(o); }); }); });
    Object.keys(vistas).forEach((kk) => {
      const l = vistas[kk]; if (l.length < 2) return;
      if (!l.some((o) => lista.indexOf(o) >= 0)) return;
      const [, k, u] = kk.split("|"), ult = l.slice().sort((a1, b1) => String(fechaOt(a1)).localeCompare(String(fechaOt(b1))))[l.length - 1];
      const num0 = (Object.values(((ult.campo || {}).fotos) || {}).find((f) => f && f.k === k && nk(f.num) === u) || {}).num || u;
      H("rojo", "dosVeces", ult, `«${labelDe(k)}» · ${num0} se cobró en ${l.length} órdenes: ${l.map((o) => o.numero || o.id).join(" y ")}.`, { tarea: labelDe(k), unidad: num0, ordenes: l.map((o) => o.numero || o.id), propuesta: { tipo: "corregir_cierre", otId: ult.id, cambios: [{ tarea: k, cantidad: Math.max(0, num(ult.cierre.cantidades[k]) - 1) }], texto: `descontar 1 en ${ult.numero || "la orden"} si es la misma columna (mirá las fotos)` } });
    });
    // 8) foto fija de quincenas cerradas vs. la cuenta de hoy
    try {
      const Q = window.__quincenas; if (Q && !a.otId) {
        let q = Q.qDe(per.desde); for (let i = 0; i < 12; i++) { const qi = Q.qInfo(q); if (qi.desde > per.hasta) break; const d = Q.datosDe(qi); (d && d.fija ? d.cambios || [] : []).filter((x) => !zP || nk(x.nombre) === zP).forEach((x) => H("ambar", "quincenaCambio", null, `${qi.label} (cerrada): ${x.nombre} tenía ${fN(x.antes)} en la foto fija y hoy la cuenta da ${fN(x.ahora)}. La diferencia (${fN(r2(x.ahora - x.antes))}) va como ajuste a la quincena abierta.`, { persona: x.nombre, quincena: qi.label })); q = Q.qMover(q, 1); }
      }
    } catch (e) { }
    // 10) puntos por hora fuera de lo común (solo para mirar)
    if (!a.otId) {
      const pph = {};
      lista.forEach((o) => { if (excluidaPor(o)) return; const c = o.cierre, hp = c.horasPersona || {}, hj = horasJornada(o), Pr = produccionDe(o); personalDe(o).forEach((p) => { const ck = Object.keys(hp).find((x) => nk(x) === nk(p.nombre)), h = ck != null ? (c.horasPersonaV === 2 ? Math.max(0, num(hp[ck])) : num(hp[ck]) > 0 ? num(hp[ck]) : hj) : hj; const pts = Pr.mp[nk(canon(p.nombre))] || 0; if (!(h > 0)) return; (pph[canon(p.nombre)] = pph[canon(p.nombre)] || []).push({ o, r: pts / h, pts, h }); }); });
      Object.keys(pph).forEach((n) => { const l = pph[n]; if (l.length < 3) return; const av = l.reduce((s, x) => s + x.r, 0) / l.length; if (!(av > 0)) return; l.forEach((x) => { if (x.r > 2 * av || x.r < 0.5 * av) H("info", "porHora", x.o, `${n}: ${fN(x.r)} pts por hora en esta orden (${fN(x.pts)} en ${fN(x.h)} h) y su promedio del período es ${fN(av)}. Solo para mirar.`, { persona: n }); }); });
    }
    L.sort((x, y) => NIV[x.nivel] - NIV[y.nivel] || String(x.fecha).localeCompare(String(y.fecha)));
    return { periodo: a.otId ? "" : per.label, desde: per.desde, hasta: per.hasta, revisadas: lista.length, rojos: L.filter((h) => h.nivel === "rojo").length, hallazgos: L, criterios: criterios().slice(-20).map((c) => ({ texto: c.texto, tarea: c.tarea ? labelDe(c.tarea) : "", persona: c.persona || "", desde: c.desde || "" })) };
  }
  // Supervisor: lo rojo de la quincena actual y la anterior
  let supCache = { ts: 0, l: [] };
  function supHallazgos() {
    if (!puede()) return [];
    if (Date.now() - supCache.ts < 60000) return supCache.l;
    const l = [];
    try {
      const Q = window.__quincenas, hoy = hoyISO(), a0 = Q ? Q.qInfo(Q.qMover(Q.qDe(hoy), -1)).desde : hoy;
      const R = revisar({ desde: a0, hasta: hoy });
      const rojos = R.hallazgos.filter((h) => h.nivel === "rojo");
      if (rojos.length) l.push({ g: "rojo", cat: "Puntos", t: `Puntos para revisar: ${rojos.length} ${rojos.length === 1 ? "cosa" : "cosas"} mal (desde el ${fC(a0)})`, s: rojos.slice(0, 4).map((h) => (h.numero ? h.numero + ": " : "") + h.texto).join(" · "), ir: { tipo: "puntos" }, btn: "Ver" });
      const am = R.hallazgos.filter((h) => h.nivel === "ambar").length;
      if (am) l.push({ g: "ambar", cat: "Puntos", t: `Puntos: ${am} ${am === 1 ? "cosa" : "cosas"} para mirar (sin motivo, la cuadrilla contra el cierre…)`, s: "", ir: { tipo: "puntos" }, btn: "Ver" });
    } catch (e) { console.warn("[puntos]", e); }
    supCache = { ts: Date.now(), l }; return l;
  }

  // ===================================================================== cambiar (con «Sí»): planes y aplicar
  const quincenaAviso = (o) => { const q = quincenaDe(o); if (!q || !q.cerrada) return null; let dest = "la quincena abierta"; try { const Q = window.__quincenas, k = Q.objetivoAjustes().split("-").map(Number); dest = Q.qInfo({ y: k[0], m: k[1], n: k[2] }).label; } catch (e) { } return `La ${q.label} ya está cerrada: la foto fija no se toca y la diferencia va como ajuste a la ${dest}.`; };
  function fijaActual(o) {
    const f = fijaDe(o); if (f) return JSON.parse(JSON.stringify(f));
    const z = produccionDe(Object.assign({}, o)).z; const V = cuenta(o, null);
    return { total: r4(V.total), renglones: V.renglones.map((r) => ({ k: r.k, tarea: r.label, cant: r.cant, un: r.un, ptsUnit: r.ptsUnit, pts: r4(r.pts) })), porPersona: ((z && z.porPersona) || V.personas).map((p) => ({ nombre: canon(p.nombre), rol: p.rol || "", pts: r4(p.pts) })), ts: Date.now() };
  }
  // a) puntos entre personas de una orden (el camino de «⭐ Puntos»)
  function planPersona(otId, puntos, motivo) {
    const o = otDe(otId); if (!o) return { err: `No encontré la orden «${otId}».` };
    if (!tieneCierre(o)) return { err: `${o.numero || "La orden"} no está cerrada: los puntos salen al cerrarla.` };
    const F = fijaActual(o), gente = personalDe(o), nuevo = {}, filas = [];
    F.porPersona.forEach((p) => { nuevo[canon(p.nombre)] = r2(p.pts); });
    gente.forEach((g) => { if (!Object.keys(nuevo).some((n) => nk(n) === nk(g.nombre))) nuevo[canon(g.nombre)] = 0; });
    for (const q of Object.keys(puntos || {})) {
      const z = nk(q), cand = Object.keys(nuevo).filter((n) => nk(n) === z || z.split(" ").every((w) => nk(n).split(" ").some((x) => x.indexOf(w) === 0)));
      if (cand.length !== 1) return { err: cand.length ? `«${q}» puede ser: ${cand.join(", ")}.` : `«${q}» no está en ${o.numero || "la orden"}. Para sumar a alguien, usá proponer_corregir_cierre (quiénes hicieron cada tarea).` };
      nuevo[cand[0]] = Math.max(0, r2(num(puntos[q])));
    }
    const antes = {}; Object.keys(nuevo).forEach((n) => { const p = F.porPersona.find((x) => nk(canon(x.nombre)) === nk(n)); antes[n] = r2(p ? p.pts : 0); });
    const suma = r2(Object.values(nuevo).reduce((s, v) => s + v, 0)), total = r2(F.total);
    if (Math.abs(suma - total) > 0.05) return { err: `Los puntos de cada uno sumarían ${fN(suma)} y la orden vale ${fN(total)}: decí de quién se sacan (o a quién se le suman) para que dé ${fN(total)}. Si lo que cambia es lo HECHO, usá proponer_corregir_cierre.` };
    const cambia = Object.keys(nuevo).filter((n) => Math.abs(nuevo[n] - antes[n]) > 0.009);
    if (!cambia.length) return { err: "Ya está así: no cambia nada." };
    if (!String(motivo || "").trim()) return { err: "Falta el motivo: preguntale a la persona por qué (queda en el historial). No lo inventes." };
    Object.keys(nuevo).forEach((n) => filas.push({ c: n, a: antes[n], d: nuevo[n] }));
    const av = [quincenaAviso(o)].filter(Boolean);
    return { tipo: "puntos_persona", otId: o.id, numero: o.numero || "", obra: String(o.plazaNombre || "").toUpperCase(), titulo: `⭐ Puntos de ${o.numero || "la orden"}`, sub: `${String(o.plazaNombre || "").toUpperCase()} · ${fC(fechaOt(o))}`, filas: filas.filter((f) => cambia.indexOf(f.c) >= 0).concat([{ c: "Total de la orden", a: total, d: suma }]), personas: cambia.map((n) => ({ nombre: n, antes: antes[n], despues: nuevo[n] })), nuevo, antes, total, motivo: String(motivo).trim().slice(0, 300), avisos: av, firma: JSON.stringify(F.porPersona) };
  }
  async function aplicarPersona(P, op) {
    op = op || {};
    if (!puede()) return { ok: false, err: "Tu usuario no puede cambiar puntos (solo Administración y Oficina)." };
    const R = planPersona(P.otId, P.nuevo, P.motivo); if (R.err) return { ok: false, err: R.err };
    const o = otDe(P.otId), F = fijaActual(o), ts = Date.now();
    const fija = Object.assign({}, F, { porPersona: Object.keys(R.nuevo).map((n) => ({ nombre: n, rol: rolDe(o, n), pts: r2(R.nuevo[n]), aMano: true, asignado: 0 })), ts, por: yoMail(), editado: true });
    const reparto = {}; Object.keys(R.nuevo).forEach((n) => { reparto[n] = r2(R.nuevo[n]); });
    const hist = ((o.cierre.puntosHist) || []).concat([{ ts, por: yoMail(), porNombre: yoNombre(), tipo: "persona", antes: R.total, despues: R.total, motivo: R.motivo, porAsistente: !!op.porAsistente, personas: R.personas }]).slice(-20);
    try { await window.fbOtUpdate(o.id, { "cierre.puntos": fija, "cierre.reparto": reparto, "cierre.puntosHist": hist }); }
    catch (er) { return { ok: false, err: er && er.code === "permission-denied" ? "🔒 Tu usuario no puede cambiar órdenes." : "⚠ No se pudo guardar (revisá la conexión). No se cambió nada." }; }
    o.cierre = Object.assign({}, o.cierre, { puntos: fija, reparto, puntosHist: hist });
    try { window.fbAuditar && window.fbAuditar("ot_puntos_persona", `${o.numero || o.id}: ${R.personas.map((p) => `${p.nombre} ${fN(p.antes)} → ${fN(p.despues)}`).join(", ")} · ${R.motivo}`.slice(0, 480), { ref: o.id, motivo: R.motivo, porAsistente: !!op.porAsistente, antes: R.personas.map((p) => ({ nombre: p.nombre, pts: p.antes })), despues: R.personas.map((p) => ({ nombre: p.nombre, pts: p.despues })) }); } catch (e) { }
    avisar(o, R.personas, R.motivo);
    refrescar();
    return { ok: true, txt: `✅ ${o.numero || "La orden"}: ${R.personas.map((p) => `${primer(p.nombre)} ${fN(p.antes)} → ${fN(p.despues)}`).join(", ")}.` + (R.avisos.length ? " " + R.avisos.join(" ") : ""), R };
  }
  function avisar(o, personas, motivo) {
    try {
      const pa = window.__pushAvisos && window.__pushAvisos.dejarAviso; if (!pa) return;
      personas.filter((p) => Math.abs(p.despues - p.antes) > 0.009).forEach((p) => pa({ clave: nk(p.nombre), titulo: "⭐ Puntos corregidos", cuerpo: `${o.numero || "Orden"} · ${o.plazaNombre || ""}: tenías ${fN(p.antes)} y ahora ${fN(p.despues)} puntos.${motivo ? " " + motivo : ""}`, tipo: "puntos", ref: String(o.id), tag: "ema-ptsp-" + o.id + "-" + nk(p.nombre).replace(/\s+/g, "-"), url: "./" }));
    } catch (e) { }
  }
  function refrescar() {
    supCache.ts = 0;
    try { typeof renderOt == "function" && renderOt(); } catch (e) { }
    try { typeof window.renderProduccion == "function" && window.renderProduccion(); } catch (e) { }
    try { $("qpOv") && pintar(); } catch (e) { }
  }
  // b) valor de una tarea en el baremo (hacia adelante)
  function tareaK(q) {
    const z = nk(q); if (!z) return { err: "Falta la tarea." };
    const cat = catalogo(); let t = cat.find((x) => x.id === q || nk(x.label) === z);
    if (!t) { const c = cat.filter((x) => nk(x.label).indexOf(z) >= 0 || z.split(" ").filter((w) => w.length > 2).every((w) => nk(x.label).indexOf(w) >= 0)); if (c.length === 1) t = c[0]; else if (c.length > 1) return { err: `«${q}» puede ser: ${c.slice(0, 8).map((x) => x.label).join(", ")}.` }; }
    return t ? { k: t.id, label: t.label } : { err: `No encontré la tarea «${q}» en «Cuánto vale cada tarea».` };
  }
  function planValor(tarea, pts, motivo) {
    const t = tareaK(tarea); if (t.err) return t;
    const v = r2(num(pts)); if (!(v >= 0)) return { err: "Puntos inválidos." };
    const antes = vigente(t.k); if (Math.abs(antes - v) < 1e-9) return { err: `«${t.label}» ya vale ${fN(v)}.` };
    if (!String(motivo || "").trim()) return { err: "Falta el motivo: preguntale a la persona por qué cambia el valor (queda en el historial). No lo inventes." };
    const un = (baremo()[t.k] || {}).un || "unidad";
    const abiertas = ots().filter((o) => o && o.estado !== "Anulada" && !cerrada(o) && (o.actividades || []).indexOf(t.k) >= 0).length;
    const cerr = ots().filter((o) => cerrada(o) && num(((o.cierre || {}).cantidades || {})[t.k]) > 0).length;
    return { tipo: "valor_tarea", k: t.k, label: t.label, un, antes, despues: v, motivo: String(motivo).trim().slice(0, 300), titulo: `🏷 Cuánto vale «${t.label}»`, sub: "Producción › Cuánto vale cada tarea", filas: [{ c: `${t.label} (por ${un})`, a: antes, d: v }], avisos: [`Vale desde ahora: las ${cerr} orden(es) ya cerradas con esta tarea quedan como están (sus puntos están guardados). Si alguna se tiene que corregir, se hace de a una con «✏ Corregir cierre».` + (abiertas ? ` Las ${abiertas} orden(es) abiertas que la tienen van a usar el valor nuevo al cerrarse.` : "")] };
  }
  async function aplicarValor(P, op) {
    op = op || {};
    if (!puedeBaremo()) return { ok: false, err: "Tu usuario no puede cambiar el valor de las tareas (hace falta «editar» en Producción)." };
    const R = planValor(P.k, P.despues, P.motivo); if (R.err) return { ok: false, err: R.err };
    const h = baremo(), ts = Date.now(); h[R.k] = Object.assign({}, h[R.k] || { un: R.un }, { pts: R.despues });
    const hist = histBaremo().concat([{ ts, por: yoMail(), porNombre: yoNombre(), k: R.k, tarea: R.label, antes: R.antes, despues: R.despues, motivo: R.motivo, porAsistente: !!op.porAsistente }]).slice(-300);
    const bar = {}; Object.keys(h).forEach((k) => { bar[k] = { un: h[k].un || "unidad", pts: m0(h[k].pts) }; });
    try { await window.fbBaremoGuardar({ baremo: bar, hist, ts, usuario: yoMail() }); }
    catch (er) { h[R.k].pts = R.antes; return { ok: false, err: er && er.code === "permission-denied" ? "🔒 Tu usuario no puede cambiar el baremo." : "⚠ No se pudo guardar (revisá la conexión)." }; }
    try { const n = window.__baremoNube = window.__baremoNube || {}; n.baremo = Object.assign({}, n.baremo || {}, bar); n.hist = hist; } catch (e) { }
    try { window.fbAuditar && window.fbAuditar("baremo_valor", `${R.label}: ${fN(R.antes)} → ${fN(R.despues)} · ${R.motivo}`.slice(0, 480), { ref: R.k, motivo: R.motivo, porAsistente: !!op.porAsistente, antes: R.antes, despues: R.despues }); } catch (e) { }
    refrescar();
    return { ok: true, txt: `✅ «${R.label}» vale ${fN(R.despues)} por ${R.un} (antes ${fN(R.antes)}). Las órdenes cerradas no cambian.`, R };
  }
  // c) notas y criterios («yo esa vez le dije…»)
  function planNota(a) {
    a = a || {};
    const texto = String(a.texto || "").trim(); if (texto.length < 3) return { err: "Falta el texto de la nota." };
    let o = null, k = null, persona = null;
    if (a.otId) { o = otDe(a.otId); if (!o) return { err: `No encontré la orden «${a.otId}».` }; }
    if (a.tarea) { const t = tareaK(a.tarea); if (t.err) return t; k = t.k; }
    if (a.persona) { const p = personaCanon(a.persona); if (!p) return { err: `«${a.persona}» no está en la nómina.` }; if (p.varios) return { err: `«${a.persona}» puede ser: ${p.varios.join(", ")}.` }; persona = p; }
    const general = !o || !!a.general;
    const desde = /^\d{4}-\d\d-\d\d$/.test(String(a.desde || "")) ? a.desde : hoyISO();
    const donde = o ? `en el historial de ${o.numero || "la orden"}` + (general ? " y como criterio general" : "") : "como criterio general (lo lee el asistente siempre que explica o revisa puntos)";
    return { tipo: "nota", texto: texto.slice(0, 500), otId: o ? o.id : "", numero: o ? o.numero || "" : "", k, tarea: k ? labelDe(k) : "", persona, desde: general ? desde : "", general, titulo: "📒 Anotar el porqué", sub: donde, filas: [{ c: "Nota", a: "—", d: texto.slice(0, 160) }].concat(k ? [{ c: "Tarea", a: "—", d: labelDe(k) }] : []).concat(persona ? [{ c: "Persona", a: "—", d: persona }] : []).concat(general ? [{ c: "Desde", a: "—", d: fC(desde) }] : []), avisos: [] };
  }
  async function aplicarNota(P, op) {
    op = op || {};
    if (!puede()) return { ok: false, err: "Tu usuario no puede anotar criterios de puntos." };
    const ts = Date.now(), por = yoMail(), porNombre = yoNombre();
    if (P.otId) {
      const o = otDe(P.otId); if (!o) return { ok: false, err: "No encontré la orden." };
      const c = o.cierre || {}, t0 = r2((fijaDe(o) || {}).total || 0);
      const hist = ((c.puntosHist) || []).concat([{ ts, por, porNombre, tipo: "nota", texto: P.texto, motivo: P.texto, tarea: P.k || "", persona: P.persona || "", antes: t0, despues: t0, porAsistente: !!op.porAsistente }]).slice(-20);
      try { await window.fbOtUpdate(o.id, { "cierre.puntosHist": hist }); } catch (er) { return { ok: false, err: er && er.code === "permission-denied" ? "🔒 Tu usuario no puede cambiar órdenes." : "⚠ No se pudo guardar (revisá la conexión)." }; }
      o.cierre = Object.assign({}, c, { puntosHist: hist });
    }
    if (P.general || !P.otId) {
      if (!puedeBaremo()) return { ok: false, err: "Para anotar un criterio general hace falta «editar» en Producción." };
      const l = criterios().concat([{ id: "c" + ts.toString(36), texto: P.texto, tarea: P.k || "", persona: P.persona || "", otId: P.otId || "", desde: P.desde || hoyISO(), ts, por, porNombre, porAsistente: !!op.porAsistente }]).slice(-200);
      try { await window.fbBaremoGuardar({ criterios: l }); } catch (er) { return { ok: false, err: er && er.code === "permission-denied" ? "🔒 Tu usuario no puede guardar criterios (Producción)." : "⚠ No se pudo guardar (revisá la conexión)." }; }
      try { (window.__baremoNube = window.__baremoNube || {}).criterios = l; } catch (e) { }
    }
    try { window.fbAuditar && window.fbAuditar("puntos_nota", `${P.numero ? P.numero + " · " : ""}${P.texto}`.slice(0, 480), { ref: P.otId || P.k || "", porAsistente: !!op.porAsistente, general: !!P.general }); } catch (e) { }
    refrescar();
    return { ok: true, txt: `✅ Anotado ${P.otId ? "en " + (P.numero || "la orden") : "como criterio general"}: «${P.texto}».` };
  }
  // d) mover lo hecho de una orden a otra (dos correcciones con el motor de la v153)
  function planMover(a, motivo) {
    const CC = window.__corregirCierre; if (!CC || window.__v153No) return { err: "Falta «✏ Corregir cierre» (v153)." };
    const o1 = otDe(a.deOt), o2 = otDe(a.aOt); if (!o1 || !o2) return { err: `No encontré la orden «${!o1 ? a.deOt : a.aOt}».` };
    if (!cerrada(o1) || !cerrada(o2)) return { err: "Las dos órdenes tienen que estar cerradas (si la de destino está abierta, cargalo al cerrarla)." };
    const t1 = CC.tareaDe(o1, a.tarea); if (t1.err) return { err: t1.err };
    const c1 = num(((o1.cierre || {}).cantidades || {})[t1.k]), q = a.cantidad != null ? num(a.cantidad) : c1;
    if (!(q > 0) || q > c1 + 1e-9) return { err: `En ${o1.numero} «${labelDe(t1.k)}» tiene ${fN(c1)}: no se pueden pasar ${fN(q)}.` };
    const t2 = CC.tareaDe(o2, t1.k); if (t2.err && !t2.k) return { err: `«${labelDe(t1.k)}» no está en ${o2.numero}: ${t2.err}` };
    const c2 = num(((o2.cierre || {}).cantidades || {})[t1.k]);
    return { specs: [{ tipo: "corregir_cierre", otId: o1.id, cambios: [{ tarea: t1.k, cantidad: r4(c1 - q) }], motivo: `${motivo} (pasa a ${o2.numero})` }, { tipo: "corregir_cierre", otId: o2.id, cambios: [{ tarea: t1.k, cantidad: r4(c2 + q), personas: a.personas || undefined }], motivo: `${motivo} (viene de ${o1.numero})` }], aviso: "Las fotos no se mueven con esto: si también hay que pasarlas, usá «↔ Mover» (proponer_mover_fotos)." };
  }
  // ---------- varias juntas: cada una se vuelve a armar al aplicar (si una cambia la orden, la siguiente ve lo nuevo)
  function planUno(it, motivoG) {
    const motivo = String(it.motivo || motivoG || "").trim();
    const CC = window.__corregirCierre;
    if (it.tipo === "corregir_cierre") {
      if (!CC || window.__v153No) return { err: "Falta «✏ Corregir cierre» (v153)." };
      if (!motivo) return { err: "Falta el motivo." };
      const R = CC.plan(it.otId, it.cambios || [], motivo, { porAsistente: true }); if (R.err) return { err: R.err };
      return { tipo: it.tipo, spec: { tipo: it.tipo, otId: R.otId, cambios: it.cambios, motivo }, titulo: `✏ ${R.numero}: ${R.tareas.map((t) => `${t.label} ${fN(t.antes)} → ${fN(t.despues)}`).join(" · ")}`, detalle: R.personas.filter((p) => p.cambia).map((p) => `${primer(p.nombre)} ${fN(p.antes)} → ${fN(p.despues)}`).join(", "), avisos: R.avisos || [] };
    }
    if (it.tipo === "puntos_persona") { const R = planPersona(it.otId, it.puntos || {}, motivo); if (R.err) return { err: R.err }; return { tipo: it.tipo, spec: { tipo: it.tipo, otId: R.otId, nuevo: R.nuevo, motivo }, titulo: `⭐ ${R.numero}: ${R.personas.map((p) => `${primer(p.nombre)} ${fN(p.antes)} → ${fN(p.despues)}`).join(", ")}`, detalle: "", avisos: R.avisos }; }
    if (it.tipo === "valor_tarea") { const R = planValor(it.tarea, it.puntos, motivo); if (R.err) return { err: R.err }; return { tipo: it.tipo, spec: { tipo: it.tipo, k: R.k, despues: R.despues, motivo }, titulo: `🏷 «${R.label}»: ${fN(R.antes)} → ${fN(R.despues)} por ${R.un}`, detalle: "desde ahora (las cerradas no cambian)", avisos: R.avisos || [] }; }
    if (it.tipo === "nota") { const R = planNota(Object.assign({}, it, { texto: it.texto || motivo })); if (R.err) return { err: R.err }; return { tipo: it.tipo, spec: R, titulo: `📒 ${R.numero ? R.numero + ": " : "Criterio: "}«${R.texto.slice(0, 120)}»`, detalle: "", avisos: [] }; }
    if (it.tipo === "mover") { if (!motivo) return { err: "Falta el motivo." }; const R = planMover(it, motivo); if (R.err) return { err: R.err }; const a1 = planUno(R.specs[0]), a2 = planUno(R.specs[1]); if (a1.err || a2.err) return { err: a1.err || a2.err }; return { tipo: "mover", specs: R.specs, titulo: `↔ «${labelDe(R.specs[0].cambios[0].tarea)}»: ${a1.titulo.replace(/^✏ /, "")} · ${a2.titulo.replace(/^✏ /, "")}`, detalle: [a1.detalle, a2.detalle].filter(Boolean).join(" · "), avisos: [R.aviso].concat(a1.avisos, a2.avisos) }; }
    return { err: `No sé hacer «${it.tipo}».` };
  }
  function planVarios(items, motivo) {
    const l = (items || []).map((it, i) => Object.assign({ i }, planUno(it || {}, motivo)));
    return { items: l, ok: l.filter((x) => !x.err).length };
  }
  async function aplicarSpec(s, op) {
    if (s.tipo === "corregir_cierre") { const CC = window.__corregirCierre, P = CC.plan(s.otId, s.cambios, s.motivo, { porAsistente: !!op.porAsistente }); if (P.err) return { ok: false, err: P.err }; return CC.aplicar(P); }
    if (s.tipo === "puntos_persona") return aplicarPersona(s, op);
    if (s.tipo === "valor_tarea") return aplicarValor(s, op);
    if (s.tipo === "nota") return aplicarNota(s, op);
    return { ok: false, err: "tipo desconocido" };
  }
  async function aplicarVarios(items, elegidos, op) {
    op = op || {}; const res = [];
    for (const x of items) {
      if (x.err || (elegidos && elegidos.indexOf(x.i) < 0)) continue;
      const specs = x.specs || [x.spec];
      for (const s of specs) { let r; try { r = await aplicarSpec(s, op); } catch (e) { r = { ok: false, err: String((e && e.message) || e) }; } res.push({ i: x.i, ok: !!r.ok, txt: r.ok ? r.txt : "⚠ " + (x.titulo || "") + ": " + r.err }); if (!r.ok) break; }
    }
    refrescar();
    return { ok: res.some((r) => r.ok), res, txt: res.map((r) => r.txt).join(" ") };
  }

  // ===================================================================== el porqué en las pantallas de siempre
  // 1) «Cuánto vale cada tarea» (Producción): motivo obligatorio si cambia el valor de alguna tarea + historial
  function cambiosBaremo() {
    const l = [], nb = (nube().baremo || {}), fb = fabrica(), propias = Array.isArray(nube().tareasPropias) ? nube().tareasPropias : [];
    document.querySelectorAll(".bar-pts").forEach((n) => {
      const k = n.dataset.k; if (!k) return;
      const nuevo = num(n.value), ant = nb[k] && nb[k].pts != null ? m0(nb[k].pts) : (propias.find((x) => x.id === k) || {}).pts != null ? m0((propias.find((x) => x.id === k) || {}).pts) : fb[k] ? m0(fb[k].pts) : null;
      if (ant != null && Math.abs(nuevo - ant) > 1e-9) l.push({ k, tarea: labelDe(k), antes: ant, despues: nuevo });
    });
    return l;
  }
  let baremoMotivo = "";
  const gbOrig = window.guardarBaremo;
  if (typeof gbOrig == "function") {
    const g = async function () {
      if (window.__v154No) return gbOrig.apply(this, arguments);
      const ch = cambiosBaremo();
      if (ch.length && !String(baremoMotivo || "").trim()) { hojaMotivo(ch); return; }
      const mot = String(baremoMotivo || "").trim(); baremoMotivo = "";
      const histAntes = histBaremo().slice();
      const r = await gbOrig.apply(this, arguments);
      if (ch.length && window.__fbUser) {
        const ts = Date.now(), hist = histAntes.concat(ch.map((c) => ({ ts, por: yoMail(), porNombre: yoNombre(), k: c.k, tarea: c.tarea, antes: c.antes, despues: c.despues, motivo: mot, porAsistente: false }))).slice(-300);
        try { await window.fbBaremoGuardar({ hist }); (window.__baremoNube = window.__baremoNube || {}).hist = hist; window.fbAuditar && window.fbAuditar("baremo_valor", ch.map((c) => `${c.tarea}: ${fN(c.antes)} → ${fN(c.despues)}`).join(", ").slice(0, 400) + " · " + mot, { motivo: mot, cambios: ch }); } catch (e) { console.warn("[baremo hist]", e); }
      }
      return r;
    };
    try { window.__heredar && window.__heredar(g, gbOrig); } catch (e) { }
    window.guardarBaremo = g;
  }
  function hojaMotivo(ch) {
    let ov = $("qpMotOv");
    if (!ov) { ov = document.createElement("div"); ov.id = "qpMotOv"; ov.className = "v7-ov v7-arriba no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Motivo del cambio"); document.body.appendChild(ov); }
    ov.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>¿Por qué cambia lo que vale?</h3><small>Queda en el historial: el asistente lo usa para explicar los puntos</small></div><button type="button" class="v7-x" data-qpm="x" aria-label="Cerrar">✕</button></div>
<div class="qp-cambios">${ch.map((c) => `<div class="qp-cb"><span>${esc(c.tarea)}</span><span><s>${esc(fN(c.antes))}</s> → <b>${esc(fN(c.despues))}</b></span></div>`).join("")}</div>
<p class="qp-nota">Vale para las órdenes que se cierren desde ahora: las cerradas quedan con sus puntos guardados.</p>
<label class="cc-campo">Motivo<input type="text" id="qpMotTx" maxlength="300" placeholder="Ej: el apoyo PRFV lleva más trabajo del previsto"></label>
<div class="v7-acc"><button type="button" class="btn-ghost" data-qpm="x">Cancelar</button><button type="button" class="btn-primary" data-qpm="si">Guardar con este motivo</button></div><div class="v7-msg" id="qpMotMsg" role="status"></div></div>`;
    setTimeout(() => { const i = $("qpMotTx"); i && i.focus(); }, 50);
  }
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-qpm]"); if (!b) return;
    const ov = $("qpMotOv"); if (!ov) return;
    if (b.dataset.qpm === "x") { ov.remove(); return; }
    const t = String(($("qpMotTx") || {}).value || "").trim();
    if (t.length < 3) { const m = $("qpMotMsg"); if (m) { m.className = "v7-msg mal"; m.textContent = "Escribí el motivo (queda en el historial)."; } return; }
    baremoMotivo = t; ov.remove(); window.guardarBaremo();
  });
  // 2) los puntos a mano del cierre (reparto a mano o «👥 Puntos de esta tarea»): motivo obligatorio + el historial no se pierde
  function aManoCierre() {
    const id = window.__cierreOtId, o = id ? otDe(id) : null; if (!o || !$("cierreCuerpo")) return null;
    const man = !!($("cierreManual") || {}).checked;
    let pt = {}; try { pt = window.__ptTarea ? window.__ptTarea.leer() || {} : {}; } catch (e) { pt = {}; }
    const antes = (o.cierre || {}).puntosTarea || {}, tks = Object.keys(pt).filter((k) => pt[k] && Object.keys(pt[k]).length && JSON.stringify(pt[k]) !== JSON.stringify(antes[k] || null));
    const repAntes = JSON.stringify((o.cierre || {}).reparto || {}), repNuevo = man ? (() => { const n = {}; document.querySelectorAll("#cierreCuerpo .cierre-pers").forEach((p) => { n[p.dataset.n] = num(p.value); }); return JSON.stringify(n); })() : "{}";
    const repCambia = man && repNuevo !== repAntes;
    if (!repCambia && !tks.length) return null;
    return { o, man: repCambia, tareas: tks };
  }
  function cajaMotivoCierre() {
    const c = $("cierreCuerpo"); if (!c || window.__v154No) return;
    const x = aManoCierre(); let box = $("qpCierreMotBox");
    if (!x) { box && box.remove(); return; }
    if (!box) {
      box = document.createElement("div"); box.id = "qpCierreMotBox"; box.className = "qp-cmot";
      box.innerHTML = '<label for="qpCierreMot">¿Por qué los puntos a mano? <small>(queda en el historial de la orden)</small></label><input type="text" id="qpCierreMot" maxlength="300" placeholder="Ej: Pablo hizo casi todo el apoyo solo"><div class="qp-cmsg" id="qpCierreMsg" role="status"></div>';
      const ref = c.querySelector(".cg-saldo") || $("cierreReparto"); ref ? ref.insertAdjacentElement("afterend", box) : c.appendChild(box);
    }
  }
  setInterval(() => { try { cajaMotivoCierre(); } catch (e) { } }, 800);
  if (typeof window.guardarCierreOt == "function") {
    const gco = window.guardarCierreOt;
    const g2 = async function () {
      if (window.__v154No) return gco.apply(this, arguments);
      const x = aManoCierre(), id = window.__cierreOtId, o = id ? otDe(id) : null, histAntes = o && o.cierre && Array.isArray(o.cierre.puntosHist) ? o.cierre.puntosHist.slice() : [];
      let mot = "";
      if (x) {
        cajaMotivoCierre(); mot = String(($("qpCierreMot") || {}).value || "").trim();
        if (mot.length < 3) { const m = $("qpCierreMsg"); if (m) m.textContent = "Escribí por qué los puntos van a mano (queda en el historial)."; const i = $("qpCierreMot"); i && i.focus(); const cm = $("cierreMsg"); if (cm) { cm.style.color = "var(--danger)"; cm.textContent = "Falta el motivo de los puntos a mano."; } return; }
      }
      const fijaAntes = o ? fijaDe(o) : null, totAntes = fijaAntes ? r2(fijaAntes.total) : 0, perAntes = fijaAntes ? fijaAntes.porPersona.map((p) => ({ nombre: canon(p.nombre), pts: r2(p.pts) })) : [];
      const r = await gco.apply(this, arguments);
      const o2 = id ? otDe(id) : null;
      if (o2 && o2.cierre && o2.cierre.cerradoTs && (x || histAntes.length) && !Array.isArray(o2.cierre.puntosHist)) {
        const f = fijaDe(o2) || (() => { const V = cuenta(o2, null); return { total: V.total, porPersona: V.personas }; })(), personas = f.porPersona.map((p) => { const a = perAntes.find((y) => nk(y.nombre) === nk(canon(p.nombre))); return { nombre: canon(p.nombre), antes: a ? a.pts : 0, despues: r2(p.pts) }; });
        const hist = histAntes.concat(x ? [{ ts: Date.now(), por: yoMail(), porNombre: yoNombre(), tipo: "cierre", antes: totAntes, despues: r2(f.total), motivo: mot, porAsistente: false, aMano: x.man ? "reparto de toda la orden" : "", tareas: x.tareas.map((k) => ({ k, tarea: labelDe(k) })), personas }] : []).slice(-20);
        try { await window.fbOtUpdate(o2.id, { "cierre.puntosHist": hist }); o2.cierre = Object.assign({}, o2.cierre, { puntosHist: hist }); } catch (e) { console.warn("[cierre hist]", e); }
      }
      return r;
    };
    try { window.__heredar && window.__heredar(g2, gco); } catch (e) { }
    window.guardarCierreOt = g2;
  }

  // ===================================================================== hoja «🔎 Puntos: explicar y revisar» (sin IA)
  let st = { tab: "rev", persona: "", periodo: "actual" };
  const QP = () => window.__quincenas;
  function personasPeriodo() { const per = periodoDe({ periodo: st.periodo }), c = QP() ? QP().calcular(per.desde, per.hasta) : { personas: [] }; return (c.personas || []).map((p) => p.nombre); }
  function htmlHallazgo(h) {
    const btn = h.otId && otDe(h.otId) && cerrada(otDe(h.otId)) ? `<button type="button" class="btn-ghost" data-ccabrir="${esc(h.otId)}">✏ Corregir cierre</button><button type="button" class="btn-ghost" data-peabrir="${esc(h.otId)}" data-petab="puntos">⭐ Puntos</button>` : "";
    return `<div class="qp-h ${h.nivel}"><div class="qp-ht"><b>${h.nivel === "rojo" ? "🔴" : h.nivel === "ambar" ? "🟡" : "⚪"} ${esc(h.numero ? h.numero + " · " + h.obra : h.quincena || "Quincena")}</b>${h.fecha ? `<small>${esc(fC(h.fecha))}</small>` : ""}</div><div class="qp-hx">${esc(h.texto)}</div>${h.propuesta && h.propuesta.texto ? `<div class="qp-hp">Propuesta: ${esc(h.propuesta.texto)}</div>` : ""}<div class="qp-acc">${btn}<button type="button" class="btn-ghost" data-qp="ia" data-qptx="${esc((h.numero ? h.numero + ": " : "") + h.texto)}">✨ Preguntarle al asistente</button></div></div>`;
  }
  function pintar() {
    let ov = $("qpOv");
    if (!ov) { ov = document.createElement("div"); ov.id = "qpOv"; ov.className = "v7-ov no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Puntos: explicar y revisar"); document.body.appendChild(ov); }
    const per = periodoDe({ periodo: st.periodo });
    let cuerpo = "";
    if (st.tab === "rev") {
      const R = revisar({ periodo: st.periodo });
      cuerpo = `<p class="qp-nota">${R.revisadas} orden(es) cerradas de la ${esc(per.label)}. ${R.hallazgos.length ? `${R.rojos} mal · ${R.hallazgos.length - R.rojos} para mirar.` : "✓ No encontré nada raro."}</p>${R.hallazgos.map(htmlHallazgo).join("")}`;
    } else if (st.tab === "per") {
      const ps = personasPeriodo(); if (!st.persona && ps.length) st.persona = ps[0];
      const E = st.persona ? explicarPersona(st.persona, { periodo: st.periodo }) : null;
      cuerpo = `<label class="cc-campo">Persona<select id="qpPers">${ps.map((n) => `<option${n === st.persona ? " selected" : ""}>${esc(n)}</option>`).join("")}</select></label>` + (!E ? '<p class="qp-nota">No hay puntos en este período.</p>' : E.err ? `<p class="qp-nota">${esc(E.err)}</p>` : `<div class="qp-tot"><span>${esc(E.persona)} · ${esc(E.periodo)}</span><b>${esc(fN(E.totalProduccion))} pts</b></div><div class="qp-cuenta">${esc(E.cuenta)}</div>${E.notas.map((n) => `<div class="qp-av" role="status">${esc(n)}</div>`).join("")}${E.ordenes.map((o) => `<div class="qp-o"><div class="qp-ht"><b>${esc(o.numero)} · ${esc(o.obra)}</b><small>${esc(fC(o.fecha))} · ${esc(fN(o.pts))} pts</small></div>${(o.tareas || []).map((t) => `<div class="qp-hx">• ${esc(t.como)}</div>`).join("")}${o.valoresDistintos.map((v) => `<div class="qp-hp">ℹ ${esc(v)}</div>`).join("")}${o.historial.map((h) => `<div class="qp-hp">✎ ${esc(h.texto)}</div>`).join("")}</div>`).join("")}${E.excluidas.map((x) => `<div class="qp-hp">No suma: ${esc(x.numero)} (${esc(x.porQue)})</div>`).join("")}`);
    } else {
      const cr = criterios(), hb = histBaremo().slice(-30).reverse();
      cuerpo = `<p class="qp-nota">Lo que la oficina decidió y por qué. El asistente lo lee siempre que explica o revisa puntos.</p><div class="qp-sec">📒 Criterios</div>${cr.length ? cr.slice().reverse().map((c) => `<div class="qp-o"><div class="qp-hx">«${esc(c.texto)}»</div><div class="qp-hp">${esc([c.tarea ? labelDe(c.tarea) : "", c.persona || "", c.desde ? "desde el " + fC(c.desde) : "", (c.porNombre || c.por || "") + " · " + fTs(c.ts)].filter(Boolean).join(" · "))}</div></div>`).join("") : '<p class="qp-nota">Todavía no hay criterios anotados.</p>'}<div class="qp-sec">🏷 Cambios de lo que vale cada tarea</div>${hb.length ? hb.map((h) => `<div class="qp-o"><div class="qp-hx"><b>${esc(h.tarea || labelDe(h.k))}</b>: ${esc(fN(h.antes))} → ${esc(fN(h.despues))}</div><div class="qp-hp">${esc(fTs(h.ts))} · ${esc(h.porNombre || h.por || "")} · ${esc(h.motivo ? "«" + h.motivo + "»" : "sin motivo anotado")}${h.porAsistente ? " · por el asistente" : ""}</div></div>`).join("") : '<p class="qp-nota">Sin cambios anotados (los de antes de la v154 no tienen historial).</p>'}`;
    }
    const tab = (k, t) => `<button type="button" class="subtab${st.tab === k ? " activo" : ""}" data-qp="tab" data-qpt="${k}">${t}</button>`;
    const h = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>🔎 Puntos: por qué y si están bien</h3><small>${esc(per.label)}${per.rango ? " · " + esc(per.rango) : ""}</small></div><button type="button" class="v7-x" data-qp="x" aria-label="Cerrar">✕</button></div>
<div class="qp-per"><button type="button" class="btn-ghost${st.periodo === "anterior" ? " on" : ""}" data-qp="per" data-qpv="anterior">Quincena anterior</button><button type="button" class="btn-ghost${st.periodo === "actual" ? " on" : ""}" data-qp="per" data-qpv="actual">Esta quincena</button></div>
<div class="subtabs qp-tabs">${tab("rev", "⚠ Revisión")}${tab("per", "🧮 Por persona")}${tab("cri", "📒 Criterios")}</div>${cuerpo}</div>`;
    if (ov.__h !== h) { const c = ov.querySelector(".v7-caja"), sc = c ? c.scrollTop : 0; ov.innerHTML = h; ov.__h = h; const c2 = ov.querySelector(".v7-caja"); if (c2) c2.scrollTop = sc; }
  }
  function abrir(op) { if (!puede()) return; op = op || {}; if (op.tab) st.tab = op.tab; if (op.persona) { st.persona = op.persona; st.tab = "per"; } pintar(); }
  function cerrar() { const v = $("qpOv"); v && v.remove(); }
  document.addEventListener("click", (e) => {
    const t = e.target; if (!t || !t.closest) return;
    const ab = t.closest("[data-qpabrir]"); if (ab) { e.preventDefault(); abrir({}); return; }
    const ov = $("qpOv"); if (!ov || !ov.contains(t)) return;
    if (t.closest("[data-ccabrir],[data-peabrir]")) { setTimeout(cerrar, 0); return; }
    const b = t.closest("[data-qp]"); if (!b) return;
    const a = b.dataset.qp;
    if (a === "x") cerrar();
    else if (a === "tab") { st.tab = b.dataset.qpt; pintar(); }
    else if (a === "per") { st.periodo = b.dataset.qpv; st.persona = ""; pintar(); }
    else if (a === "ia") { cerrar(); try { window.__asistenteAbrir && window.__asistenteAbrir("Revisá este punto y explicame la cuenta: " + b.dataset.qptx); } catch (er) { } }
  });
  document.addEventListener("change", (e) => { if (e.target && e.target.id === "qpPers") { st.persona = e.target.value; pintar(); } });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("qpOv")) cerrar(); });
  // botón en Producción › Quincena y en «⭐ Puntos» (motivo)
  setInterval(() => {
    if (window.__v154No || !puede()) return;
    const acc = document.querySelector("#prodPanelQuincena .qz-acc");
    if (acc && !acc.querySelector(".qp-btn")) acc.insertAdjacentHTML("beforeend", '<button type="button" class="btn-ghost qp-btn" data-qpabrir="1">🔎 Revisar y explicar los puntos</button>');
  }, 1000);

  window.__auditPuntos = { cuenta, explicarOrden, explicarPersona, revisar, supHallazgos, criterios, criteriosDe, histBaremo, fuenteValor, porQueValor, vigente, periodoDe, personaCanon, planPersona, aplicarPersona, planValor, aplicarValor, planNota, aplicarNota, planMover, planUno, planVarios, aplicarVarios, abrir, cerrar, puede, puedeBaremo, cambiosBaremo, fN, estado: () => st };
})();
