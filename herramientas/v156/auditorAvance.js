(function () {
  "use strict";
  // v156 · Auditor del avance de obra (Ángel, 14/11/2026: «Necesito que la IA analice el avance de obra muy bien, muy
  // detalladamente: si pasó algo mal, algo bien, con todas las tareas que se hicieron, más allá de que ya es automático.
  // Necesito que tenga un control muy exacto de eso»). Mismo espíritu que el auditor de puntos (v154).
  //  · explicar: cada número del itemizado con sus fuentes (cada cierre de orden con su fecha, tarea y parte del ítem,
  //    correcciones de la v153, revertidos al anular, lo cargado a mano con su motivo —o «a mano, sin fecha, sin motivo
  //    anotado»—, ajustes del conforme a obra, lo certificado) y si la suma cuadra con lo que dice el ítem; etapas (solas o a
  //    mano) y la planilla de columnas (v150) contra el itemizado.
  //  · revisar (sin IA, de memoria): hallazgos rojo / ámbar / info con su explicación y una propuesta.
  //  · el porqué: motivo obligatorio al cambiar a mano lo hecho en Avance de obra (avanceObras.avanceHist[]) y notas
  //    (avanceObras.avanceNotas[]): una nota explica un número y el motor deja de marcarlo.
  //  · cambiar con «Sí»: la cantidad o lo hecho de un ítem, anotar el porqué, corregir el cierre de una orden (v153), pasar el
  //    cálculo a la obra (v102); varias juntas con casillas. Auditoría «avance_auditoria». Sin reglas nuevas.
  if (window.__v156No) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const r2 = (v) => Math.round((+v || 0) * 100) / 100;
  const r4 = (v) => Math.round((+v || 0) * 1e4) / 1e4;
  const fN = (v) => { const x = r2(v); try { return fmt(x, Number.isInteger(x) ? 0 : Math.round(x * 10) === x * 10 ? 1 : 2); } catch (e) { return String(x).replace(".", ","); } };
  const fC = (f) => { const p = String(f || "").slice(0, 10).split("-"); return p.length === 3 ? `${p[2]}/${p[1]}` : String(f || ""); };
  const fTs = (ts) => { try { const d = new Date(+ts); return isFinite(d) ? `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : ""; } catch (e) { return ""; } };
  const isoTs = (ts) => { try { const d = new Date(+ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; } catch (e) { return ""; } };
  const ahora = () => (window.__aaAhora ? +new Date(window.__aaAhora) : Date.now());
  const hoyISO = () => isoTs(ahora());
  const masDias = (f, n) => { const d = new Date(f + "T12:00:00"); d.setDate(d.getDate() + n); return isoTs(+d); };
  const diasEntre = (a, b) => Math.round((new Date(String(b).slice(0, 10) + "T12:00:00") - new Date(String(a).slice(0, 10) + "T12:00:00")) / 864e5);
  const arr = (x) => (Array.isArray(x) ? x : x && typeof x == "object" ? Object.keys(x).map((k) => x[k]) : []);
  const obj = (x) => (x && typeof x == "object" ? x : {});
  const intentar = (f, d) => { try { const v = f(); return v == null ? d : v; } catch (e) { return d; } };
  const obrasTodas = () => intentar(() => (Array.isArray(window.avanceObrasTodas) ? window.avanceObrasTodas : avanceObras), []).filter((o) => o && o.id && o.id !== "__sinObra");
  const obras = () => obrasTodas().filter((o) => o.oculta !== true);
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const otDe = (id) => ots().find((o) => o && (o.id === id || o.numero === id)) || null;
  const cerrada = (o) => !!(o && o.cierre && o.cierre.cerradoTs);
  const anulada = (o) => !!(o && o.estado === "Anulada");
  const fechaOt = (o) => String((o && ((o.cierre && o.cierre.fecha) || o.fecha)) || "").slice(0, 10);
  const nombreObra = (o) => String((o && (o.nombre || o.plazaNombre)) || "(sin nombre)").toUpperCase();
  const K = (id) => intentar(() => num(window.epecItemK(String(id))), 0);
  const desc = (id) => intentar(() => window.epecItemDesc(String(id)) || "", "");
  const unDe = (id) => intentar(() => window.epecItemUn(String(id)) || "", "");
  const esProv = (id) => { const n = parseFloat(id); return n >= 83 && n < 90; };
  const COLS = ["1", "2", "3", "4", "5", "6", "7", "8"], ZANJA = ["15", "16", "17", "18", "19", "20"], CABLE = ["25", "26", "27", "28", "29", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40"];
  const ART = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 1, 6: 2, 7: 3, 8: 4 };
  const catalogo = () => intentar(() => (typeof ACTIVIDADES_CATALOGO != "undefined" ? ACTIVIDADES_CATALOGO : []), []);
  const labelDe = (k) => { if (String(k).indexOf("m:") === 0) return String(k).slice(2); const a = catalogo().find((x) => x.id === k); return a ? a.label : String(k || "sin tarea anotada"); };
  const meta = (k) => intentar(() => (typeof metaDeTarea == "function" ? metaDeTarea(k) : null), null) || { items: [] };
  const yoMail = () => String((window.__fbUser || {}).email || "");
  const yo = () => intentar(() => (window.PERMISOS && PERMISOS.yo && PERMISOS.yo()) || {}, {});
  const yoNombre = () => { const y = yo(); return y.nombre || y.usuario || yoMail().split("@")[0]; };
  const rolYo = () => String(yo().rol || "");
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  function puedeVer() {
    if (!window.PERMISOS) return true;
    if (esCrew()) return false;
    const r = rolYo(); return r === "admin" || r === "oficina" || r === "direccion";
  }
  function puede() {   // cambiar: Administración y Oficina con «editar» en Avance de obra
    if (!puedeVer() || rolYo() === "direccion") return false;
    if (!window.PERMISOS) return true;
    return intentar(() => PERMISOS.permiso("avance") === "editar", false);
  }
  const fraguadoH = () => { const v = num(obj(obj(window.__baremoNube).sugerida).fraguado); return v > 0 ? v : 72; };
  function obraDe(ref) {
    if (ref && typeof ref == "object") return ref;
    const q = String(ref == null ? "" : ref).trim(); if (!q) return null;
    const l = obrasTodas(), z = nk(q);
    return l.find((o) => String(o.id) === q) || l.find((o) => String(o.obraId || "") === q.replace(/^id\s*/i, "")) || l.find((o) => nk(o.nombre || o.plazaNombre) === z) || l.find((o) => nk(o.nombre || o.plazaNombre).indexOf(z) >= 0) || l.find((o) => z.split(" ").filter((w) => w.length > 2 && w !== "plaza").every((w) => nk(o.nombre || o.plazaNombre).indexOf(w) >= 0)) || null;
  }
  function filas(o) {
    const l = [];
    arr(o.valorItems).forEach((r) => r && r.itemPliego && l.push({ r, id: String(r.itemPliego), epec: false }));
    arr(o.valorItemsEpec).forEach((r) => r && r.itemEpec && l.push({ r, id: String(r.itemEpec), epec: true }));
    return l;
  }
  const filaDe = (o, id) => filas(o).find((f) => f.id === String(id).replace(/^[ií]tem\s*/i, "").trim()) || null;
  const otsObra = (o) => ots().filter((t) => t && String(t.plazaId || "") === String(o.id));
  // cuántas unidades del ítem suma una unidad de la tarea (la regla del cierre por partes de la v108)
  function grupoDe(k, id) { const m = meta(k); return arr(m.grupos && m.grupos.length ? m.grupos : [{ items: m.items || [] }]).find((g) => arr(g.items).map(String).indexOf(String(id)) >= 0) || null; }
  function facDe(k, id) {
    const g = grupoDe(k, id); if (!g || g.prop) return null;
    const pc = g.pct == null || window.__avanceEntero ? 1 : typeof g.pct == "object" ? num(g.pct[id]) : num(g.pct);
    return pc > 0 ? pc / (g.porArt ? ART[id] || 1 : 1) : null;
  }
  function pctTxt(k, id) {
    const g = grupoDe(k, id); if (!g || g.pct == null || window.__avanceEntero) return "";
    const pc = typeof g.pct == "object" ? num(g.pct[id]) : num(g.pct); if (!(pc > 0)) return "";
    return `cada unidad de la tarea suma el ${fN(pc * 100)} % del ítem${g.porArt && (ART[id] || 1) > 1 ? ` repartido en ${ART[id]} artefactos` : ""} (por partes)`;
  }
  const hist = (o) => arr(o.avanceHist).filter((h) => h && h.item != null);
  const notas = (o) => arr(o.avanceNotas).filter((n) => n && n.texto && !n.borrada);
  const notaDe = (o, id) => notas(o).filter((n) => n.item == null || n.item === "" || String(n.item) === String(id));
  const notaItem = (o, id) => notas(o).filter((n) => String(n.item == null ? "" : n.item) === String(id));

  // ===================================================================== explicar un ítem
  function fuentesItem(o, id) {
    const l = [];
    otsObra(o).forEach((t) => {
      const c = obj(t.cierre); if (!Array.isArray(c.avanceItems)) return;
      c.avanceItems.forEach((e, i) => {
        if (!e || String(e.id) !== String(id)) return;
        const corr = arr(c.puntosHist).filter((h) => h && h.tipo === "corregir" && arr(h.avance).some((a) => a && String(a.id) === String(id))).slice(-1)[0];
        l.push({ tipo: "orden", otId: t.id, numero: t.numero || "orden", fecha: fechaOt(t), k: e.k || "", tarea: e.k ? labelDe(e.k) : "sin tarea anotada (orden de antes de la v108)", delta: r4(num(e.delta)), parte: e.k ? pctTxt(e.k, id) : "", cuenta: !c.avanceRevertido, revertido: !!c.avanceRevertido, anulada: anulada(t), cerrada: cerrada(t), i,
          corregida: corr ? { fecha: fTs(corr.ts), por: corr.porNombre || corr.por || "", motivo: corr.motivo || "" } : null });
      });
    });
    return l.sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
  }
  function explicarItem(ref, id) {
    const o = obraDe(ref); if (!o) return { err: `No encontré la obra «${ref}».` };
    const f = filaDe(o, id); if (!f) return { err: `${nombreObra(o)} no tiene el ítem ${id} en el itemizado.`, items: filas(o).map((x) => x.id) };
    id = f.id;
    const cant = num(f.r.cantidad), hechas = num(f.r.cantidadAvanzada);
    const F = fuentesItem(o, id), H = hist(o).filter((h) => String(h.item) === id), N = notaItem(o, id);
    const sumO = r4(F.filter((x) => x.cuenta).reduce((s, x) => s + x.delta, 0)), sumH = r4(H.reduce((s, h) => s + (num(h.despues) - num(h.antes)), 0));
    const residuo = r4(hechas - sumO - sumH);
    const aj = arr(o.coAjustes).filter((a) => a && String(a.itemId) === id).map((a) => ({ fecha: a.fecha || fTs(a.ts), delta: num(a.delta), motivo: a.motivo || "", detalle: a.detalle || "" }));
    const cert = Object.keys(obj(o.certificados)).sort().map((M) => { const s = obj(obj(obj(o.certificados[M]).it)[id]); return s.a != null || s.m != null ? { mes: M, delMes: num(s.m), acumulado: num(s.a) } : null; }).filter(Boolean);
    const partes = [];
    F.forEach((x) => partes.push(`${x.numero} (${fC(x.fecha)}, ${x.tarea}${x.parte ? "; " + x.parte : ""}): ${x.cuenta ? "+" : "(no cuenta) "}${fN(x.delta)}${x.revertido ? " — revertido al anular la orden" : x.anulada ? " — la orden está anulada pero su avance quedó" : ""}${x.corregida ? ` — corregida con «✏ Corregir cierre» el ${x.corregida.fecha} por ${x.corregida.por} (motivo: ${x.corregida.motivo ? "«" + x.corregida.motivo + "»" : "sin motivo anotado"})` : ""}`));
    H.forEach((h) => partes.push(`a mano en Avance de obra el ${fTs(h.ts)} por ${h.porNombre || h.por || "?"}: ${fN(h.antes)} → ${fN(h.despues)} (${num(h.despues) - num(h.antes) >= 0 ? "+" : ""}${fN(num(h.despues) - num(h.antes))}; motivo: ${h.motivo ? "«" + h.motivo + "»" : "sin motivo anotado"})`));
    let cuadra = true, sinFecha = 0, estado = "ok";
    if (residuo > 0.005) { sinFecha = residuo; estado = N.length ? "explicado" : "aMano"; partes.push(`a mano, sin fecha${N.length ? "" : ", sin motivo anotado"}: +${fN(residuo)}${N.length ? ` (explicado por la nota de ${N[N.length - 1].porNombre || N[N.length - 1].por || "?"} del ${fTs(N[N.length - 1].ts)}: «${N[N.length - 1].texto}»)` : ""}`); }
    else if (residuo < -0.005) { cuadra = false; estado = "noCuadra"; }
    const sumaTxt = F.filter((x) => x.cuenta).map((x) => fN(x.delta)).concat(H.map((h) => fN(num(h.despues) - num(h.antes)))).concat(sinFecha > 0 ? [fN(sinFecha)] : []);
    const cuadraTxt = cuadra ? `${sumaTxt.length ? sumaTxt.join(" + ") : "0"} = ${fN(hechas)} ✓ cuadra con lo que dice el ítem` : `las órdenes y lo anotado suman ${fN(sumO + sumH)} y el ítem dice ${fN(hechas)}: NO CUADRA, faltan ${fN(-residuo)} (se bajó a mano sin anotar o se borró algo)`;
    const pc = cant > 0 ? Math.min(1, hechas / cant) : 0;
    const texto = `Ítem ${id} (${desc(id) || "sin descripción"}): contratado ${fN(cant)} ${unDe(id)}, hecho ${fN(hechas)} (${Math.round(pc * 100)} %). De dónde sale: ${partes.length ? partes.join("; ") : "nada todavía"}. Suma: ${cuadraTxt}.` + (hechas > cant + 1e-6 ? ` ⚠ Hay ${fN(hechas - cant)} hechas de más que lo contratado.` : "") + (aj.length ? ` El contratado tuvo ${aj.length} ajuste(s) del conforme a obra.` : "");
    return { obraId: o.id, obra: nombreObra(o), item: id, desc: desc(id), un: unDe(id), K: K(id), provision: esProv(id), contratado: r4(cant), hechas: r4(hechas), pct: Math.round(pc * 100), fuentes: F, aMano: H.map((h) => ({ fecha: fTs(h.ts), por: h.porNombre || h.por || "", antes: num(h.antes), despues: num(h.despues), motivo: h.motivo || "", sinMotivo: !h.motivo, porAsistente: !!h.porAsistente })), sinFecha: r4(sinFecha), notas: N.map((n) => ({ texto: n.texto, por: n.porNombre || n.por || "", fecha: fTs(n.ts) })), ajustesContratado: aj, certificado: cert, sumaOrdenes: sumO, sumaAMano: sumH, residuo, cuadra, estado, texto };
  }

  // ===================================================================== la obra entera
  function planillaDe(o) {
    const P = intentar(() => window.__hecho && window.__hecho.planilla(o.id), null); if (!P || !arr(P.cols).length) return null;
    const cuenta = {}, lineas = [];
    P.etapas.forEach(([e, t]) => { cuenta[e] = { t, ver: 0, sinver: 0, no: 0, asig: 0 }; });
    P.cols.forEach((c) => {
      const p = [];
      P.etapas.forEach(([e, t]) => { const x = P.celda[e + "|" + nk(c)] || {}; if (cuenta[e][x.est] != null) cuenta[e][x.est]++; if (x.est && x.est !== "falta") p.push(`${t} ${x.est === "ver" ? "✓" : x.est === "sinver" ? "✓ sin cerrar" : x.est === "no" ? "✕ no se hizo" : "asignado"}${x.ot ? " (" + x.ot + (x.fecha ? " " + fC(x.fecha) : "") + (x.por ? ", " + String(x.por).split(" ")[0] : "") + (x.foto || x.fotoId || x.mini ? ", con foto" : "") + (x.ini && x.fin ? ", " + x.ini + "–" + x.fin : "") + ")" : ""}`); });
      lineas.push(`${c}: ${p.length ? p.join(" · ") : "nada todavía"}`);
    });
    return { cols: P.cols.length, etapas: P.etapas.map(([e, t]) => ({ etapa: t, verificadas: cuenta[e].ver, sinCerrar: cuenta[e].sinver, noSeHizo: cuenta[e].no, asignadas: cuenta[e].asig })), columnas: lineas, notas: P.notas || [] };
  }
  function contraItemizado(o, PL) {
    const fl = filas(o).filter((f) => COLS.indexOf(f.id) >= 0 && num(f.r.cantidad) > 0); if (!fl.length) return "";
    const c = fl.reduce((s, f) => s + num(f.r.cantidad), 0), h = fl.reduce((s, f) => s + Math.min(num(f.r.cantidadAvanzada), num(f.r.cantidad)), 0);
    const it = fl.map((f) => `ítem ${f.id} ${fN(f.r.cantidad)}`).join(" + ");
    let t = `El itemizado dice ${fN(c)} columnas (${it}); hecho ${fN(h)} de ${fN(c)} (${Math.round(h / c * 100)} %, cada etapa suma su parte: pozo 12 %, hormigonado 13 %, izaje 25 %, vínculo 8 %, luminaria 12 %, tablerito 10 %, sellado 5 % — a confirmar)`;
    if (PL) t += `; la planilla tiene ${PL.etapas.map((e) => `${e.etapa.toLowerCase()} ${e.verificadas}${e.sinCerrar ? " (+" + e.sinCerrar + " sin cerrar)" : ""}`).join(", ")} de ${PL.cols} columnas`;
    return t + ".";
  }
  function etapasDe(o) {
    const E = intentar(() => (typeof ETAPAS_OBRA != "undefined" ? ETAPAS_OBRA : []), []), et = obj(o.etapas), au = obj(o.etapasAuto), no = obj(o.etapasNoAuto);
    return E.map((s) => ({ etapa: s.label, tildada: !!et[s.key], como: et[s.key] ? (au[s.key] ? "se tildó sola (sus ítems llegaron al 100 %)" : "tildada a mano") : no[s.key] ? "destildada a mano (la app no la vuelve a tildar)" : "sin tildar" }));
  }
  function modulos(o) { let t = 0, h = 0; filas(o).forEach((f) => { if (esProv(f.id)) return; const c = num(f.r.cantidad), w = K(f.id); t += c * w; h += Math.min(num(f.r.cantidadAvanzada), c) * w; }); return { hechos: r2(h), total: r2(t) }; }
  function explicarObra(ref, op) {
    op = op || {};
    const o = obraDe(ref); if (!o) return { err: `No encontré la obra «${ref}».` };
    const fl = filas(o).filter((f) => num(f.r.cantidad) > 0 || num(f.r.cantidadAvanzada) > 0);
    const items = fl.map((f) => explicarItem(o, f.id));
    const PL = planillaDe(o), R = revisar({ obra: o.id });
    const pct = intentar(() => calcularAvanceEtapasPct(o), 0), M = modulos(o);
    const noCuadran = items.filter((x) => !x.cuadra).length, aMano = items.filter((x) => x.estado === "aMano").length;
    return { obraId: o.id, obra: nombreObra(o), ID: o.obraId || "", avancePct: pct, modulos: M, items, etapas: etapasDe(o), planilla: PL, contraItemizado: contraItemizado(o, PL), hallazgos: R.hallazgos, rojos: R.rojos, notas: notas(o).map((n) => ({ item: n.item || "", texto: n.texto, por: n.porNombre || n.por || "", fecha: fTs(n.ts) })),
      resumen: `${nombreObra(o)}: ${pct} % (${fN(M.hechos)} de ${fN(M.total)} módulos K, sin provisiones). ${items.length} ítems: ${items.length - noCuadran} cuadran con sus fuentes${noCuadran ? `, ${noCuadran} NO cuadran` : ""}${aMano ? `, ${aMano} con avance a mano sin motivo` : ""}. ${R.hallazgos.length ? `${R.rojos} cosa(s) mal y ${R.hallazgos.length - R.rojos} para mirar.` : "✓ No encontré nada raro."}` };
  }

  // ===================================================================== revisar (sin IA)
  function ultimoComputo(o) {
    const l = intentar(() => (typeof historial != "undefined" && Array.isArray(historial) ? historial : []), []);
    const id = String(o.obraId || "").trim(), nom = nk(o.nombre || o.plazaNombre);
    return l.filter((h) => h && (String(h.plazaId || "") === String(o.id) || (id && String(h.id || "").trim() === id) || (nom && nk(h.nombre) === nom))).sort((a, b) => (+b.ts || 0) - (+a.ts || 0))[0] || null;
  }
  function difiereCalculo(o) { const c = ultimoComputo(o); if (!c || !arr(c.secciones).length || !arr(o.secciones).length) return 0; return intentar(() => window.__obraComputo.difiere(c, o), 0); }
  function enZona(o) { return intentar(() => { const Z = window.__zonaContrato; return !!Z && Z.zonaDeObra(o) === Z.zona(); }, false); }
  function unidadesDeOt(t) {   // columnas/unidades con detalle (Modo obra o foto con columna) de una orden
    const m = {}, c = obj(t.campo);
    Object.keys(obj(c.pasosObra)).forEach((k) => Object.keys(obj(c.pasosObra[k])).forEach((u) => { const x = obj(c.pasosObra[k][u]); if (x.estado === "si") m[k + "|" + nk(x.num || u)] = { k, num: x.num || u }; }));
    Object.keys(obj(c.fotos)).forEach((a) => { const f = obj(c.fotos[a]); if (f.borrada || !f.k || !f.num) return; m[f.k + "|" + nk(f.num)] = { k: f.k, num: f.num }; });
    return m;
  }
  function revisarObra(o, a, out) {
    const H = (nivel, tipo, texto, extra) => out.push(Object.assign({ nivel, tipo, obraId: o.id, obra: nombreObra(o), texto }, extra || {}));
    const enRango = (f) => (!a.desde || String(f) >= a.desde) && (!a.hasta || String(f) <= a.hasta);
    const fl = filas(o), hoy = hoyISO();
    const ex = {}; fl.forEach((f) => { ex[f.id] = explicarItem(o, f.id); });
    // a) / b) cada ítem
    fl.forEach((f) => {
      const E = ex[f.id], c = num(f.r.cantidad), h = num(f.r.cantidadAvanzada);
      if (!E.cuadra) H("rojo", "noCuadra", `Ítem ${f.id}: las órdenes cerradas y lo anotado suman ${fN(E.sumaOrdenes + E.sumaAMano)} y el itemizado dice ${fN(h)} (faltan ${fN(-E.residuo)}). Alguien lo bajó a mano sin anotarlo, o se borró.`, { item: f.id, propuesta: { tipo: "item", obraId: o.id, item: f.id, hechas: r4(Math.min(c, E.sumaOrdenes + E.sumaAMano)), texto: `dejar el ítem ${f.id} en ${fN(Math.min(c, E.sumaOrdenes + E.sumaAMano))} (lo que dicen las órdenes) o anotar por qué se bajó` } });
      if (c > 0 && h > c + 1e-6) H("rojo", "deMas", `Ítem ${f.id}: ${fN(h)} hechas de ${fN(c)} contratadas (${fN(h - c)} de más, sin ítem de más autorizado).`, { item: f.id, propuesta: { tipo: "item", obraId: o.id, item: f.id, hechas: c, texto: `bajar lo hecho del ítem ${f.id} a ${fN(c)}, o subir lo contratado si el trabajo de más está autorizado` } });
      if (E.estado === "aMano" && !esProv(f.id)) {
        const evid = otsObra(o).some((t) => cerrada(t) && Object.keys(obj(t.cierre.cantidades)).some((k) => arr(meta(k).items).map(String).indexOf(f.id) >= 0)) || Object.keys(unidadesDeObra(o)).length > 0;
        H("ambar", "sinRespaldo", `Ítem ${f.id}: ${fN(E.sinFecha)} ${unDe(f.id)} cargado(s) a mano, sin fecha y sin motivo anotado${evid ? "" : " — sin ninguna evidencia (ni orden, ni foto, ni paso de Modo obra)"}. No entran en ninguna certificación (la certificación cuenta lo que dejan las órdenes cerradas).`, { item: f.id, sinEvidencia: !evid, propuesta: { tipo: "nota", obraId: o.id, item: f.id, texto: `anotar por qué se cargó a mano (📒 Anotar el porqué) o corregir el ítem` } });
      }
    });
    // f) módulos sin fecha (no entran en la certificación)
    const sf = fl.filter((f) => ex[f.id].estado === "aMano" && !esProv(f.id)).reduce((s, f) => s + ex[f.id].sinFecha * K(f.id), 0);
    if (sf > 0.005) H("ambar", "sinFecha", `${fN(sf)} módulos K cargados a mano sin fecha: no entran en ninguna certificación mensual (ítems ${fl.filter((f) => ex[f.id].estado === "aMano" && !esProv(f.id)).map((f) => f.id).join(", ")}).`, { propuesta: { tipo: "nota", obraId: o.id, texto: "anotar cuándo y por qué se hizo, o cargarlo por una orden" } });
    // c) / d) cada orden cerrada
    otsObra(o).forEach((t) => {
      if (!cerrada(t) || anulada(t)) return; const c = obj(t.cierre); if (c.avanceRevertido || !Array.isArray(c.avanceItems)) return;
      if (!enRango(fechaOt(t))) return;
      const porK = {}; c.avanceItems.forEach((e) => { if (!e || !e.k) return; const g = (porK[e.k] = porK[e.k] || { u: 0, l: [], vistos: {} }); const fac = facDe(e.k, String(e.id)); if (fac) g.u += num(e.delta) / fac; g.l.push(e); const kk = String(e.id); g.vistos[kk] = (g.vistos[kk] || 0) + 1; });
      Object.keys(porK).forEach((k) => {
        const g = porK[k], cant = num(obj(c.cantidades)[k]), dup = Object.keys(g.vistos).filter((i) => g.vistos[i] > 1);
        if (dup.length || (cant > 0 && g.u > cant + 0.01)) {
          const deMas = cant > 0 ? Math.max(0, g.u - cant) : 0, fac = facDe(k, String(dup[0] || g.l[0].id)) || 1, it = String(dup[0] || g.l[0].id), exD = r4(deMas * fac);
          H("rojo", "dosVecesOt", `${t.numero || "Orden"} (${fC(fechaOt(t))}) sumó ${dup.length ? `DOS VECES el ítem ${dup.join(", ")} por «${labelDe(k)}» (` + g.l.filter((e) => dup.indexOf(String(e.id)) >= 0).map((e) => fN(e.delta)).join(" + ") + ")" : `de más por «${labelDe(k)}»`}: se cerró con ${fN(cant)} y eso da ${fN(cant * fac)} del ítem${exD > 0 ? `; sobran ${fN(exD)}` : ""}.`, { item: it, otId: t.id, numero: t.numero || "", fecha: fechaOt(t), propuesta: exD > 0 ? { tipo: "item", obraId: o.id, item: it, hechas: r4(Math.max(0, num((filaDe(o, it) || { r: {} }).r.cantidadAvanzada) - exD)), texto: `descontar ${fN(exD)} del ítem ${it} (lo que se sumó de más)` } : null });
        }
      });
      const ks = Object.keys(obj(c.cantidades)).filter((k) => num(c.cantidades[k]) > 0 && !meta(k).noAvanza && arr(meta(k).items).length);
      ks.forEach((k) => {
        const its = arr(meta(k).items).map(String), mias = fl.filter((f) => its.indexOf(f.id) >= 0 && num(f.r.cantidad) > 0); if (!mias.length) return;
        if (c.avanceItems.some((e) => e && its.indexOf(String(e.id)) >= 0 && (!e.k || e.k === k))) return;
        const llenos = mias.every((f) => num(f.r.cantidadAvanzada) >= num(f.r.cantidad) - 1e-6);
        const f0 = mias.slice().sort((x, y) => (num(y.r.cantidad) - num(y.r.cantidadAvanzada)) - (num(x.r.cantidad) - num(x.r.cantidadAvanzada)))[0], fac = facDe(k, f0.id);
        const falta = fac ? r4(Math.min(num(f0.r.cantidad) - num(f0.r.cantidadAvanzada), num(c.cantidades[k]) * fac)) : 0;
        H(llenos ? "ambar" : "rojo", "noMovio", `${t.numero || "Orden"} (${fC(fechaOt(t))}) se cerró con «${labelDe(k)}» ${fN(c.cantidades[k])} y no movió el avance de la obra${llenos ? " (los ítems ya estaban completos: puede estar bien)" : `: debía sumar ${falta > 0 ? fN(falta) + " al ítem " + f0.id : "al ítem " + f0.id}`}.`, { item: f0.id, otId: t.id, numero: t.numero || "", fecha: fechaOt(t), propuesta: !llenos && falta > 0 ? { tipo: "item", obraId: o.id, item: f0.id, hechas: r4(num(f0.r.cantidadAvanzada) + falta), texto: `sumar ${fN(falta)} al ítem ${f0.id} por lo que cerró ${t.numero || "la orden"}` } : null });
      });
    });
    // g) lo que mandó la cuadrilla y todavía no está en el itemizado (órdenes sin cerrar)
    const D = intentar(() => window.__hecho.deObra(o.id), null);
    if (D) {
      const sv = {}; Object.keys(D.U).forEach((q) => { const u = D.U[q]; if (u.est === "sinver") { const x = (sv[u.otId] = sv[u.otId] || { ot: u.ot, fecha: u.fecha, l: [] }); x.l.push(labelDe(u.k) + " " + u.num); } });
      Object.keys(sv).forEach((id) => { if (enRango(sv[id].fecha)) H("info", "sinCerrar", `La cuadrilla mandó ${sv[id].l.length} hecha(s) en ${sv[id].ot} (${fC(sv[id].fecha)}) que todavía no están en el itemizado porque la orden no se cerró: ${sv[id].l.slice(0, 6).join(", ")}.`, { otId: id, numero: sv[id].ot, fecha: sv[id].fecha, propuesta: { tipo: "cerrar", otId: id, texto: "cerrar la orden (✅ Cerrar)" } }); });
    }
    // h) la misma columna/etapa en dos órdenes cerradas
    const vis = {}; otsObra(o).forEach((t) => { if (!cerrada(t) || anulada(t) || obj(t.cierre).avanceRevertido) return; const u = unidadesDeOt(t); Object.keys(u).forEach((q) => { (vis[q] = vis[q] || { k: u[q].k, num: u[q].num, l: [] }).l.push(t); }); });
    Object.keys(vis).forEach((q) => { const v = vis[q]; if (v.l.length < 2) return; const t2 = v.l[v.l.length - 1]; if (!v.l.some((t) => enRango(fechaOt(t)))) return; H("rojo", "dosVecesCol", `${v.num}: «${labelDe(v.k)}» figura hecha en ${v.l.length} órdenes cerradas (${v.l.map((t) => (t.numero || "orden") + " " + fC(fechaOt(t))).join(" y ")}): se contó dos veces en el avance.`, { otId: t2.id, numero: t2.numero || "", fecha: fechaOt(t2), propuesta: { tipo: "cierre", otId: t2.id, texto: `corregir el cierre de ${t2.numero || "la orden"} (✏ Corregir cierre) o anotar por qué se rehízo` } }); });
    // i) / j) orden de obra imposible y fraguado (con la planilla de columnas)
    const P = intentar(() => window.__hecho.planilla(o.id), null);
    if (P && arr(P.cols).length) {
      const etapa = (e) => (P.etapas.find((x) => x[0] === e) || null);
      const ETS = { pozo: ["excavacion", "fundaciones"], horm: ["hormigonado", "fundaciones"], izaje: ["montaje_prfv", "montaje_metalica"], vinc: ["montaje_vinculo", "vinculo_luminaria"], lum: ["montaje_luminaria", "vinculo_luminaria"] };
      const hechasEt = (e) => { const det = P.cols.filter((c) => { const x = P.celda[e + "|" + nk(c)]; return x && (x.est === "ver" || x.est === "sinver"); }).length; const tot = Math.max.apply(null, ETS[e].map((k) => intentar(() => num(window.__hecho.hechasDe(o.id, k).n), 0)).concat([0])); return Math.max(det, tot); };
      const reglas = [["horm", "pozo", "hormigonado sin pozo"], ["izaje", "horm", "columna izada sin hormigonado"], ["vinc", "izaje", "vínculo sin izaje"], ["lum", "vinc", "luminaria sin vínculo"]];
      reglas.forEach(([e, pre, txt]) => {
        const ne = hechasEt(e), np = hechasEt(pre); if (!(ne > np + 0.01)) return;
        const cols = P.cols.filter((c) => { const x = P.celda[e + "|" + nk(c)], y = P.celda[pre + "|" + nk(c)]; return x && (x.est === "ver" || x.est === "sinver") && (!y || y.est === "falta" || y.est === "no"); });
        H("ambar", "ordenImposible", `A revisar: ${txt} — ${fN(ne)} con ${(etapa(e) || [0, e])[1].toLowerCase()} y ${fN(np)} con ${(etapa(pre) || [0, pre])[1].toLowerCase()}${cols.length ? ` (${cols.slice(0, 6).join(", ")})` : ""}. Puede faltar cargar la etapa anterior o estar mal la columna de una foto.`, { propuesta: { tipo: "nota", obraId: o.id, texto: "revisar en la obra y anotar qué pasó, o cargar la etapa que falta" } });
      });
      // fraguado: hormigonado → izaje con menos de las horas de fraguado (con fechas)
      const fr = fraguadoH(), hormFechas = otsObra(o).filter((t) => !anulada(t) && (num(obj(obj(t.cierre).cantidades).hormigonado) > 0 || obj(obj(t.campo).pasosObra).hormigonado)).map(fechaOt).filter(Boolean).sort();
      const pocos = [];
      P.cols.forEach((c) => {
        const iz = P.celda["izaje|" + nk(c)], ho = P.celda["horm|" + nk(c)]; if (!iz || !(iz.est === "ver" || iz.est === "sinver") || !iz.fecha) return;
        const fh = ho && (ho.est === "ver" || ho.est === "sinver") && ho.fecha ? ho.fecha : hormFechas.filter((f) => f <= iz.fecha).pop(); if (!fh) return;
        const d = diasEntre(fh, iz.fecha); if (d >= 0 && d * 24 < fr) pocos.push({ c, fh, fi: iz.fecha, d, ot: iz.ot, otId: iz.otId });
      });
      if (pocos.length && pocos.some((x) => enRango(x.fi))) H("ambar", "fraguado", `A revisar: izaje con menos de ${fN(fr)} h de fraguado — ${pocos.slice(0, 6).map((x) => `${x.c}: hormigonado ${fC(x.fh)}, izada ${fC(x.fi)} (${x.d} ${x.d === 1 ? "día" : "días"})`).join("; ")}.`, { otId: pocos[0].otId, numero: pocos[0].ot, fecha: pocos[0].fi, propuesta: { tipo: "nota", obraId: o.id, texto: "confirmar con la cuadrilla y anotar (si la fecha de una foto o un paso está mal, corregirlo)" } });
      // p2) al 100 %: columnas sin foto
      if (intentar(() => calcularAvanceEtapasPct(o), 0) >= 100) {
        const sinF = P.cols.filter((c) => !P.etapas.some(([e]) => { const x = P.celda[e + "|" + nk(c)]; return x && (x.foto || x.fotoId || x.mini); }));
        if (sinF.length) H("info", "sinFoto", `La obra está al 100 % y ${sinF.length} columna(s) no tienen ninguna foto: ${sinF.slice(0, 8).join(", ")}.`, {});
      }
    }
    // k) cable sin zanja
    const hz = fl.filter((f) => ZANJA.indexOf(f.id) >= 0), hc = fl.filter((f) => CABLE.indexOf(f.id) >= 0 && num(f.r.cantidadAvanzada) > 0);
    if (hc.length && hz.length && hz.every((f) => !(num(f.r.cantidadAvanzada) > 0))) H("ambar", "ordenImposible", `A revisar: cable tendido (${hc.map((f) => "ítem " + f.id + " " + fN(f.r.cantidadAvanzada)).join(", ")}) sin zanja hecha en el itemizado.`, { propuesta: { tipo: "nota", obraId: o.id, texto: "revisar si falta cargar la zanja" } });
    // l) cálculo distinto del itemizado
    const it = {}; fl.forEach((f) => { it[f.id] = (it[f.id] || 0) + num(f.r.cantidad); });
    if (Object.keys(it).some((k) => it[k] > 0)) {
      const pv = intentar(() => window.epecPreviaDe(o), null), fp = arr(pv && pv.filas).filter((x) => x && num(x.cantidad) > 0);
      if (fp.length) {
        const prev = {}; fp.forEach((x) => { prev[String(x.item)] = (prev[String(x.item)] || 0) + num(x.cantidad); });
        const dif = Object.keys(prev).concat(Object.keys(it)).filter((k, i, l) => l.indexOf(k) === i && Math.abs((prev[k] || 0) - (it[k] || 0)) > 1e-6).sort((x, y) => parseFloat(x) - parseFloat(y));
        if (dif.length) H("ambar", "calculo", `El cálculo de la obra no coincide con el itemizado: ${dif.slice(0, 6).map((k) => `ítem ${k}: cálculo ${fN(prev[k] || 0)} · itemizado ${fN(it[k] || 0)}`).join(" · ")}${dif.length > 6 ? " · …" : ""}.`, { propuesta: { tipo: "item", obraId: o.id, item: dif[0], cantidad: prev[dif[0]] || 0, texto: `revisar cuál vale (el pliego dice cuánto se cobra; el cálculo, qué se compra) y corregir el ítem ${dif[0]}` } });
      }
      // columnas del último cálculo (formulario) contra los ítems 1–8: las de 10 m van siempre al ítem 4 (metálica) / 8 (PRFV)
      const cp = ultimoComputo(o), gr = arr(cp && cp.form && cp.form.columnaGrupos);
      if (!out.some((x) => x.obraId === o.id && x.tipo === "calculo") && gr.length) {
        const prfv = /prfv/i.test(String((cp.form.campos || {}).colTipo || cp.tipoCol || "")), n = gr.reduce((s, g) => s + num(g.columnas), 0), n10 = gr.filter((g) => num(g.altura) >= 10).reduce((s, g) => s + num(g.columnas), 0);
        const i10 = prfv ? "8" : "4", tCol = COLS.reduce((s, k) => s + (it[k] || 0), 0), dif = [];
        if (Math.abs(n - tCol) > 1e-6) dif.push(`el cálculo tiene ${fN(n)} columnas y el itemizado ${fN(tCol)} (ítems 1–8)`);
        if (Math.abs(n10 - (it[i10] || 0)) > 1e-6) dif.push(`el cálculo tiene ${fN(n10)} columnas de 10 m (van al ítem ${i10}) y el itemizado tiene ${fN(it[i10] || 0)} en el ítem ${i10}`);
        if (dif.length) H("ambar", "calculo", `El cálculo de la obra (${fC(cp.fecha || isoTs(cp.ts))}) no coincide con el itemizado: ${dif.join("; ")}.`, { propuesta: { tipo: "item", obraId: o.id, item: i10, cantidad: n10, texto: `revisar cuál vale (el pliego dice cuánto se cobra; el cálculo, qué se compra) y corregir el ítem ${i10}` } });
      }
    }
    arr(intentar(() => window.__diferenciasObra(o), [])).forEach((d) => H("ambar", "diferencias", `${d.nombre}: hecho ${fN(d.hecho)} en órdenes cerradas y contratado ${fN(d.contratado)} (${fN(d.deMas)} de más).`, { propuesta: { tipo: "item", obraId: o.id, item: d.item, cantidad: r4(num((filaDe(o, d.item) || { r: {} }).r.cantidad) + num(d.deMas)), texto: `sumar ${fN(d.deMas)} al contratado del ítem ${d.item} si el trabajo de más está autorizado (Itemizado › Diferencias)` } }));
    const dc = difiereCalculo(o);
    if (dc > 0) H("ambar", "calculoViejo", `La obra tiene guardado el material de un cálculo anterior: el último cálculo difiere en ${dc} material(es) y no se pasó a la obra.`, { propuesta: { tipo: "calculo", obraId: o.id, texto: "🔄 pasar el último cálculo a la obra" } });
    // m) material contra avance
    const MA = intentar(() => window.__matAvance.deObra(o), null), rj = arr(MA && MA.filas).filter((x) => x.s === "rj");
    if (rj.length) H("ambar", "material", `Material contra avance fuera de margen en ${rj.length} material(es): ${rj.slice(0, 3).map((x) => `${x.desc} (${x.txt})`).join("; ")}.`, {});
    // n) mes certificado cerrado que difiere de lo que hoy dicen las órdenes para ese mes
    const cerr = obj(obj(window.__preciosNube).certCerrados);
    Object.keys(obj(o.certificados)).forEach((M) => {
      const s = obj(obj(o.certificados[M]).it); if (Object.keys(cerr).length && !cerr[M]) return;
      const hoyM = {}; otsObra(o).forEach((t) => { const c = obj(t.cierre); if (!cerrada(t) || anulada(t) || c.avanceRevertido || fechaOt(t).slice(0, 7) !== M) return; arr(c.avanceItems).forEach((e) => { if (e && !esProv(e.id)) hoyM[String(e.id)] = (hoyM[String(e.id)] || 0) + num(e.delta); }); });
      const d = Object.keys(s).concat(Object.keys(hoyM)).filter((k, i, l) => l.indexOf(k) === i && !esProv(k) && Math.abs(num(obj(s[k]).m) - (hoyM[k] || 0)) > 0.005);
      if (d.length) H("ambar", "certificado", `El certificado cerrado de ${M} dice distinto de lo que hoy suman las órdenes de ese mes: ${d.slice(0, 5).map((k) => `ítem ${k}: certificado ${fN(num(obj(s[k]).m))} · hoy ${fN(hoyM[k] || 0)}`).join(" · ")} (la diferencia va al mes siguiente).`, {});
    });
    // o) provisiones mezcladas
    const pm = arr(o.valorItems).filter((r) => r && esProv(r.itemPliego));
    if (pm.length) H("info", "provisiones", `Provisiones (83–89) cargadas entre los ítems de obra: ${pm.map((r) => "ítem " + r.itemPliego).join(", ")}. No cuentan en el % (van aparte, en Itemizado 2026).`, {});
    // p) al 100 % sin documentación
    const DO = window.__docObra;
    if (DO && intentar(() => DO.terminada(o), false)) { const E = intentar(() => DO.estado(o), null); if (E && !E.completa) { const T = { carpeta: "la carpeta EPEC", conforme: "el conforme a obra", pat: "la planilla de PAT", cert: "el certificado de instalación apta" }; H("ambar", "documentacion", `Está al 100 % y falta documentación: ${E.falta.map((k) => T[k] || k).join(", ")}.`, { propuesta: { tipo: "doc", obraId: o.id, texto: "cargarla en el legajo › 📄 Documentación" } }); } }
    // q) ritmo raro: salto grande a mano en un día sin órdenes que lo expliquen; obra parada con órdenes emitidas
    const tot = modulos(o).total;
    if (tot > 0) {
      const porDia = {}; hist(o).forEach((h) => { const d = isoTs(h.ts); porDia[d] = (porDia[d] || 0) + (num(h.despues) - num(h.antes)) * (K(h.item) || 0); });
      Object.keys(porDia).forEach((d) => { if (!enRango(d) || porDia[d] < tot * 0.1) return; if (otsObra(o).some((t) => cerrada(t) && fechaOt(t) === d)) return; H("ambar", "ritmo", `El ${fC(d)} se cargaron a mano ${fN(porDia[d])} módulos (${Math.round(porDia[d] / tot * 100)} % de la obra) y ese día no se cerró ninguna orden.`, { fecha: d }); });
    }
    const viejas = otsObra(o).filter((t) => !anulada(t) && !cerrada(t) && (t.estado === "Emitida" || t.estado === "En curso") && fechaOt(t) && diasEntre(fechaOt(t), hoy) >= 3);
    const ultAv = otsObra(o).filter((t) => cerrada(t) && arr(obj(t.cierre).avanceItems).length).map(fechaOt).sort().pop() || "";
    if (viejas.length && (!ultAv || diasEntre(ultAv, hoy) >= 7)) H("info", "parada", `Obra parada: ${viejas.length} orden(es) emitidas hace 3 días o más sin cerrar (${viejas.slice(0, 3).map((t) => (t.numero || "orden") + " " + fC(fechaOt(t))).join(", ")}) y ${ultAv ? "el último avance fue el " + fC(ultAv) : "todavía no hay avance por órdenes"}.`, {});
    return ex;
  }
  function unidadesDeObra(o) { const m = {}; otsObra(o).forEach((t) => Object.assign(m, unidadesDeOt(t))); return m; }
  const ORD = { rojo: 0, ambar: 1, info: 2 };
  function revisar(a) {
    a = a || {};
    let l = obras();
    if (a.obra) { const o = obraDe(a.obra); l = o ? [o] : []; }
    else if (a.zona) { const z = l.filter(enZona); if (z.length) l = z; }
    const out = []; l.forEach((o) => { try { revisarObra(o, a, out); } catch (e) { console.warn("[avance]", e); } });
    out.forEach((h) => { h.clave = [h.tipo, h.obraId, h.item || "", h.otId || ""].join("|"); });
    out.sort((x, y) => ORD[x.nivel] - ORD[y.nivel] || String(x.obra).localeCompare(String(y.obra)));
    return { hallazgos: out, rojos: out.filter((h) => h.nivel === "rojo").length, ambar: out.filter((h) => h.nivel === "ambar").length, obras: l.length, desde: a.desde || "", hasta: a.hasta || "", zona: !!a.zona };
  }
  // lo que se hizo en un período (por las órdenes cerradas) y si cuadra
  function periodo(a) {
    a = a || {}; const h = hoyISO(), desde = a.desde || masDias(h, -6), hasta = a.hasta || h;
    let l = obras(); if (a.zona) { const z = l.filter(enZona); if (z.length) l = z; }
    if (a.obra) { const o = obraDe(a.obra); l = o ? [o] : []; }
    const porObra = [];
    l.forEach((o) => {
      const ot = otsObra(o).filter((t) => cerrada(t) && !anulada(t) && !obj(t.cierre).avanceRevertido && fechaOt(t) >= desde && fechaOt(t) <= hasta);
      if (!ot.length) return;
      let k = 0; const det = ot.map((t) => { const it = arr(t.cierre.avanceItems).filter((e) => e && num(e.delta) > 0); it.forEach((e) => { if (!esProv(e.id)) k += num(e.delta) * K(e.id); }); return `${t.numero || "orden"} ${fC(fechaOt(t))}: ${it.length ? it.map((e) => `ítem ${e.id} +${fN(e.delta)}${e.k ? " (" + labelDe(e.k) + ")" : ""}`).join(", ") : "no movió el avance"}`; });
      porObra.push({ obraId: o.id, obra: nombreObra(o), ordenes: ot.length, modulos: r2(k), detalle: det });
    });
    const R = revisar({ desde, hasta, zona: a.zona, obra: a.obra });
    return { desde, hasta, porObra, modulos: r2(porObra.reduce((s, x) => s + x.modulos, 0)), hallazgos: R.hallazgos, rojos: R.rojos, cuadra: !R.rojos };
  }
  // Supervisor y «Para atender»
  let cache = { ts: 0, R: null };
  function rev60() { if (!cache.R || Date.now() - cache.ts > 60000) cache = { ts: Date.now(), R: revisar({}) }; return cache.R; }
  function supHallazgos() {
    if (!puedeVer() || rolYo() === "direccion") return [];
    try {
      const R = rev60(), rojos = R.hallazgos.filter((h) => h.nivel === "rojo"), am = R.hallazgos.filter((h) => h.nivel === "ambar");
      const l = [];
      if (rojos.length) l.push({ g: "rojo", cat: "Avance", t: `Avance: ${rojos.length} ${rojos.length === 1 ? "cosa" : "cosas"} para revisar`, s: rojos.slice(0, 4).map((h) => h.obra + ": " + h.texto).join(" · ").slice(0, 400), ir: { tipo: "auditAvance" }, btn: "Ver" });
      if (am.length) l.push({ g: "ambar", cat: "Avance", t: `Avance: ${am.length} ${am.length === 1 ? "cosa" : "cosas"} para mirar (a mano sin motivo, orden de obra, cálculo…)`, s: "", ir: { tipo: "auditAvance" }, btn: "Ver" });
      return l;
    } catch (e) { return []; }
  }
  function atender() {
    if (!puedeVer() || rolYo() === "direccion") return [];
    const R = rev60(), rojos = R.hallazgos.filter((h) => h.nivel === "rojo"); if (!rojos.length) return [];
    return [{ ir: "auditavance", ico: "alerta", cls: "rj", t: "🔎 Control del avance", s: rojos.slice(0, 2).map((h) => h.obra + ": " + h.texto.slice(0, 50)).join(" · "), n: rojos.length }];
  }
  function resumenRojos() {
    const R = rev60(), r = R.hallazgos.filter((h) => h.nivel === "rojo"); if (!r.length) return "";
    return "\n[Control del avance (sin IA): " + r.length + " cosa(s) mal] " + r.slice(0, 8).map((h) => h.obra + ": " + h.texto).join(" | ").slice(0, 1800);
  }

  // ===================================================================== cambiar (con «Sí»)
  const auditar = (txt, extra) => { try { window.fbAuditar && window.fbAuditar("avance_auditoria", String(txt).slice(0, 400), extra || {}); } catch (e) { } };
  function refrescar(o) {
    cache.ts = 0;
    try { window.avanceAutoEtapas && window.avanceAutoEtapas(o); } catch (e) { }
    try { typeof avanceActivoId != "undefined" && o && avanceActivoId === o.id && typeof renderAvanceDetalle == "function" && renderAvanceDetalle(); } catch (e) { }
    try { typeof renderAvanceTablero == "function" && renderAvanceTablero(); } catch (e) { }
    try { window.renderEpec && window.renderEpec(); } catch (e) { }
    if ($("aaOv")) pintar();
  }
  const conMotivo = (m) => String(m || "").trim().length >= 3;
  function planItem(s, motivoG) {
    const o = obraDe(s.obra || s.obraId); if (!o) return { err: `No encontré la obra «${s.obra || s.obraId || ""}».` };
    const f = filaDe(o, s.item); if (!f) return { err: `${nombreObra(o)} no tiene el ítem ${s.item}.` };
    if (obj(o.coCierre).cerrado) return { err: `El conforme a obra de ${nombreObra(o)} está CERRADO: hay que reabrirlo en Avance de obra antes de cambiar el itemizado.` };
    const c0 = num(f.r.cantidad), h0 = num(f.r.cantidadAvanzada);
    const c1 = s.cantidad == null || s.cantidad === "" ? c0 : r4(num(s.cantidad)), h1 = s.hechas == null || s.hechas === "" ? Math.min(h0, c1) : r4(num(s.hechas));
    if (c1 < 0 || h1 < 0) return { err: "No puede quedar negativo." };
    if (h1 > c1 + 1e-6) return { err: `Lo hecho (${fN(h1)}) no puede pasar lo contratado (${fN(c1)}): subí primero lo contratado.` };
    if (Math.abs(c1 - c0) < 1e-6 && Math.abs(h1 - h0) < 1e-6) return { err: `El ítem ${f.id} ya está así: no cambia nada.` };
    const motivo = String(s.motivo || motivoG || "").trim(); if (!conMotivo(motivo)) return { err: "Falta el motivo (queda en el historial de la obra): preguntalo, no lo inventes." };
    const filasT = []; if (Math.abs(c1 - c0) > 1e-6) filasT.push({ c: `Ítem ${f.id} · contratado`, a: c0, d: c1 }); if (Math.abs(h1 - h0) > 1e-6) filasT.push({ c: `Ítem ${f.id} · hecho`, a: h0, d: h1 });
    return { tipo: "item", obraId: o.id, item: f.id, c0, c1, h0, h1, motivo, titulo: `📋 ${nombreObra(o)} · ítem ${f.id}`, detalle: filasT.map((x) => `${x.c}: ${fN(x.a)} → ${fN(x.d)}`).join(" · ") + ` · motivo: «${motivo}»`, filas: filasT, avisos: obj(o.coProyecto).fijado && Math.abs(c1 - c0) > 1e-6 ? ["El itemizado está fijado: el cambio de lo contratado queda como ajuste del conforme a obra."] : [] };
  }
  async function aplicarItem(s, op) {
    op = op || {};
    const P = planItem(s, s.motivo); if (P.err) return { ok: false, err: P.err };
    const o = obraDe(P.obraId), f = filaDe(o, P.item), st = intentar(() => window.CO.estado(o), {});
    if (Math.abs(P.c1 - P.c0) > 1e-6) { if (st.fijado && window.CO && window.CO.aplicarAjuste) window.CO.aplicarAjuste(o, P.item, r4(P.c1 - P.c0), { motivo: "Control del avance", detalle: (P.motivo + ` (ítem ${P.item}: ${P.c0} → ${P.c1})`).slice(0, 300), fecha: hoyISO() }); else f.r.cantidad = P.c1; }
    const f2 = filaDe(o, P.item); f2.r.cantidadAvanzada = Math.min(P.h1, num(f2.r.cantidad));
    if (Array.isArray(f2.r.hechas)) f2.r.hechas = f2.r.hechas.filter((n) => n <= Math.round(num(f2.r.cantidadAvanzada)));
    o.avanceHist = hist(o).concat([{ item: P.item, antes: P.h0, despues: num(f2.r.cantidadAvanzada), cantAntes: P.c0, cantDespues: num(f2.r.cantidad), motivo: P.motivo, por: yoMail(), porNombre: yoNombre(), ts: Date.now(), tipo: "control", porAsistente: !!op.porAsistente }]).slice(-300);
    try { window.avanceAutoEtapas && window.avanceAutoEtapas(o); } catch (e) { }
    const { id, ...datos } = o; await window.fbAvanceGuardar(id, datos, o.__orig);
    auditar(`${nombreObra(o)} · ítem ${P.item}: ${P.detalle}`, { ref: o.id, item: P.item, antes: { cantidad: P.c0, hechas: P.h0 }, despues: { cantidad: P.c1, hechas: P.h1 }, motivo: P.motivo, porAsistente: !!op.porAsistente });
    refrescar(o); return { ok: true, txt: `✓ ${nombreObra(o)} · ítem ${P.item}: ${P.detalle}` };
  }
  function planNota(s) {
    const o = obraDe(s.obra || s.obraId); if (!o) return { err: `No encontré la obra «${s.obra || s.obraId || ""}».` };
    const texto = String(s.texto || "").trim(); if (!conMotivo(texto)) return { err: "Falta el texto de la nota (con las palabras de la persona; no lo inventes)." };
    const it = s.item == null || s.item === "" ? "" : String(s.item).replace(/^[ií]tem\s*/i, "").trim();
    if (it && !filaDe(o, it)) return { err: `${nombreObra(o)} no tiene el ítem ${it}.` };
    return { tipo: "nota", obraId: o.id, item: it, texto: texto.slice(0, 400), titulo: `📒 Anotar el porqué · ${nombreObra(o)}${it ? " · ítem " + it : ""}`, detalle: `«${texto.slice(0, 200)}»`, filas: [], avisos: [] };
  }
  async function aplicarNota(s, op) {
    op = op || {};
    const P = planNota(s); if (P.err) return { ok: false, err: P.err };
    const o = obraDe(P.obraId), n = { item: P.item, texto: P.texto, por: yoMail(), porNombre: yoNombre(), ts: Date.now(), porAsistente: !!op.porAsistente };
    const l = notas(o).concat([n]).slice(-200);
    await window.fbAvanceCampos(o.id, { avanceNotas: l });
    o.avanceNotas = l;
    auditar(`${nombreObra(o)}${P.item ? " · ítem " + P.item : ""}: nota «${P.texto}»`, { ref: o.id, item: P.item, nota: P.texto, porAsistente: !!op.porAsistente });
    refrescar(o); return { ok: true, txt: `✓ Nota guardada en ${nombreObra(o)}${P.item ? " (ítem " + P.item + ")" : ""}.` };
  }
  function planCierre(s, motivoG) {
    const CC = window.__corregirCierre; if (!CC) return { err: "«✏ Corregir cierre» no está disponible." };
    const t = otDe(s.otId); if (!t) return { err: `No encontré la orden «${s.otId || ""}».` };
    const motivo = String(s.motivo || motivoG || "").trim(); if (!conMotivo(motivo)) return { err: "Falta el motivo." };
    const P = intentar(() => CC.plan(t.id, s.cambios || [], motivo, {}), { err: "no se pudo armar" }); if (P.err) return { err: P.err };
    return { tipo: "cierre", otId: t.id, cambios: s.cambios || [], motivo, titulo: `✏ Corregir el cierre de ${t.numero || "la orden"}`, detalle: arr(P.tareas).map((x) => `${x.tarea || x.k}: ${fN(x.antes)} → ${fN(x.despues)}`).join(" · ") + ` · motivo: «${motivo}»`, filas: [], avisos: arr(P.avisos) };
  }
  async function aplicarCierre(s) { const P = window.__corregirCierre.plan(s.otId, s.cambios || [], s.motivo, {}); if (P.err) return { ok: false, err: P.err }; const g = await window.__corregirCierre.aplicar(P); cache.ts = 0; return g && g.ok === false ? { ok: false, err: g.err || "no se pudo" } : { ok: true, txt: `✓ Cierre corregido (${s.otId}).` }; }
  function planCalculo(s, motivoG) {
    const o = obraDe(s.obra || s.obraId); if (!o) return { err: "No encontré la obra." };
    const c = ultimoComputo(o), n = difiereCalculo(o); if (!c || !(n > 0)) return { err: `${nombreObra(o)} ya tiene el material del último cálculo.` };
    const motivo = String(s.motivo || motivoG || "").trim(); if (!conMotivo(motivo)) return { err: "Falta el motivo." };
    return { tipo: "calculo", obraId: o.id, motivo, titulo: `🔄 Pasar el cálculo a ${nombreObra(o)}`, detalle: `el cálculo del ${fC(c.fecha || isoTs(c.ts))} (${n} material(es) con otra cantidad); lo instalado se conserva · motivo: «${motivo}»`, filas: [], avisos: ["El itemizado de la obra no cambia (eso se hace aparte)."] };
  }
  async function aplicarCalculo(s, op) {
    const P = planCalculo(s, s.motivo); if (P.err) return { ok: false, err: P.err };
    const o = obraDe(P.obraId), c = ultimoComputo(o), prev = window.__computoParaAlta, cf = window.confirm;
    try { window.__computoParaAlta = c; window.confirm = () => true; window.__obraComputo.pasar(o.id); } finally { window.__computoParaAlta = prev; window.confirm = cf; }
    o.avanceHist = hist(o).concat([{ item: "calculo", antes: 0, despues: 0, motivo: P.motivo, por: yoMail(), porNombre: yoNombre(), ts: Date.now(), tipo: "calculo", porAsistente: !!(op && op.porAsistente) }]).slice(-300);
    try { await window.fbAvanceCampos(o.id, { avanceHist: o.avanceHist }); } catch (e) { }
    auditar(`${nombreObra(o)}: pasó el cálculo a la obra · ${P.motivo}`, { ref: o.id, motivo: P.motivo });
    refrescar(o); return { ok: true, txt: `✓ ${nombreObra(o)}: material del último cálculo.` };
  }
  function planUno(it, motivoG) {
    it = it || {};
    const t = it.tipo;
    const P = t === "item" ? planItem(it, motivoG) : t === "nota" ? planNota(Object.assign({}, it, { texto: it.texto || it.motivo || motivoG })) : t === "cierre" ? planCierre(it, motivoG) : t === "calculo" ? planCalculo(it, motivoG) : { err: `No sé hacer «${t || "?"}» (item, nota, cierre o calculo).` };
    if (P.err) return { err: P.err };
    return { titulo: P.titulo, detalle: P.detalle, avisos: P.avisos || [], spec: Object.assign({}, it, { motivo: P.motivo || it.motivo || motivoG || "", texto: P.texto || it.texto }), plan: P };
  }
  function planVarios(items, motivo) { const l = arr(items).slice(0, 15).map((x, i) => Object.assign({ i }, planUno(x, motivo))); return { items: l, ok: l.filter((x) => !x.err).length }; }
  async function aplicarSpec(s, op) { return s.tipo === "item" ? aplicarItem(s, op) : s.tipo === "nota" ? aplicarNota(s, op) : s.tipo === "cierre" ? aplicarCierre(s, op) : s.tipo === "calculo" ? aplicarCalculo(s, op) : { ok: false, err: "tipo desconocido" }; }
  async function aplicarVarios(items, elegidos, op) {
    if (!puede()) return { ok: false, res: [{ ok: false, txt: "Tu usuario no puede cambiar el avance (Administración y Oficina con «editar» en Avance de obra)." }], txt: "" };
    const res = [];
    for (const x of arr(items)) { if (x.err || elegidos.indexOf(x.i) < 0) continue; try { const r = await aplicarSpec(x.spec, op); res.push({ ok: r.ok, txt: r.ok ? r.txt : "⚠ " + r.err }); } catch (e) { res.push({ ok: false, txt: "⚠ " + ((e && (e.code || e.message)) || "no se pudo") }); } }
    return { ok: res.some((r) => r.ok), res, txt: res.map((r) => r.txt).join(" · ") };
  }

  // ===================================================================== motivo obligatorio al tocar lo hecho a mano (Avance de obra)
  let ultMot = { k: "", m: "", ts: 0 };
  function pedirMotivo(o, item, antes, despues, cb) {
    const k = o.id + "|" + item;
    const seguir = (m) => { o.avanceHist = hist(o).concat([{ item: String(item), antes: r4(antes), despues: r4(despues), motivo: m, por: yoMail(), porNombre: yoNombre(), ts: Date.now(), tipo: "aMano" }]).slice(-300); ultMot = { k, m, ts: Date.now() }; auditar(`${nombreObra(o)} · ítem ${item}: ${fN(antes)} → ${fN(despues)} a mano · ${m}`, { ref: o.id, item: String(item), antes, despues, motivo: m }); cache.ts = 0; cb(m); };
    if (ultMot.k === k && Date.now() - ultMot.ts < 180000 && ultMot.m) return seguir(ultMot.m);   // mismo ítem al rato: mismo motivo
    let ov = $("aaMotOv"); ov && ov.remove();
    ov = document.createElement("div"); ov.id = "aaMotOv"; ov.className = "v7-ov v7-arriba no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Motivo del cambio");
    ov.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>¿Por qué cambiás lo hecho?</h3><small>${esc(nombreObra(o))} · ítem ${esc(item)}</small></div><button type="button" class="v7-x" data-aam="x" aria-label="Cerrar">✕</button></div>
<div class="qp-cambios"><div class="qp-cb"><span>Ítem ${esc(item)} · ${esc(desc(item).slice(0, 60))}</span><span><s>${esc(fN(antes))}</s> → <b>${esc(fN(despues))}</b></span></div></div>
<label class="cc-campo">Motivo (obligatorio, queda en el historial de la obra)<input type="text" id="aaMotIn" maxlength="300" value="${esc(ultMot.k.split("|")[0] === o.id ? ultMot.m : "")}" placeholder="Ej: las 2 columnas las izamos el sábado sin orden"></label>
<div class="aa-msg" id="aaMotMsg" role="status"></div><div class="qp-acc"><button type="button" class="btn-primary" data-aam="si">Guardar el cambio</button><button type="button" class="btn-ghost" data-aam="x">Cancelar</button></div></div>`;
    document.body.appendChild(ov);
    const i = $("aaMotIn"); setTimeout(() => { try { i && i.focus(); } catch (e) { } }, 50);
    ov.__ok = () => { const m = String(($("aaMotIn") || {}).value || "").trim(); if (!conMotivo(m)) { const g = $("aaMotMsg"); g && (g.textContent = "Escribí el motivo (queda en el historial)."); return; } ov.remove(); seguir(m); };
    ov.__no = () => { ov.remove(); try { const y = window.scrollY; renderAvanceDetalle(); window.scrollTo(0, y); } catch (e) { } };
  }
  document.addEventListener("click", (e) => { const b = e.target && e.target.closest && e.target.closest("#aaMotOv [data-aam]"); if (!b) return; const ov = $("aaMotOv"); if (b.dataset.aam === "si") ov.__ok(); else ov.__no(); });
  document.addEventListener("keydown", (e) => { const ov = $("aaMotOv"); if (!ov) return; if (e.key === "Enter" && e.target && e.target.id === "aaMotIn") { e.preventDefault(); ov.__ok(); } else if (e.key === "Escape") ov.__no(); });

  // ===================================================================== hoja «🔎 Control del avance» (sin IA)
  let st = { obra: "", abierto: {}, nota: "", msg: "" };
  const NIV = { rojo: "🔴", ambar: "🟡", info: "⚪" };
  function botonesHallazgo(h) {
    if (!puede()) return "";
    const p = h.propuesta || {}, b = [];
    if (h.otId && otDe(h.otId) && cerrada(otDe(h.otId))) b.push(`<button type="button" class="btn-ghost" data-ccabrir="${esc(h.otId)}">✏ Corregir cierre</button>`);
    if (p.tipo === "cerrar" && h.otId) b.push(`<button type="button" class="btn-ghost" data-aa="cerrarot" data-id="${esc(h.otId)}">✅ Cerrar la orden</button>`);
    if (p.tipo === "item" || h.item) b.push(`<button type="button" class="btn-ghost" data-aa="avance" data-id="${esc(h.obraId)}">📋 Corregir en Avance de obra</button>`);
    if (p.tipo === "calculo") b.push(`<button type="button" class="btn-ghost" data-aa="calculo" data-id="${esc(h.obraId)}">🔄 Pasar el cálculo</button>`);
    if (p.tipo === "doc") b.push(`<button type="button" class="btn-ghost" data-dcdoc="${esc(h.obraId)}">📄 Documentación</button>`);
    b.push(`<button type="button" class="btn-ghost" data-aa="nota" data-id="${esc(h.obraId)}" data-item="${esc(h.item || "")}">📒 Anotar el porqué</button>`);
    return `<div class="qp-acc">${b.join("")}</div>`;
  }
  function htmlHallazgo(h) {
    const k = h.clave, abierta = st.nota === k;
    return `<div class="qp-h ${h.nivel}"><div class="qp-ht"><b>${NIV[h.nivel]} ${esc(h.obra)}${h.item ? " · ítem " + esc(h.item) : ""}${h.numero ? " · " + esc(h.numero) : ""}</b>${h.fecha ? `<small>${esc(fC(h.fecha))}</small>` : ""}</div><div class="qp-hx">${esc(h.texto)}</div>${h.propuesta && h.propuesta.texto ? `<div class="qp-hp">Propuesta: ${esc(h.propuesta.texto)}</div>` : ""}${abierta ? `<label class="cc-campo">El porqué (con tus palabras)<input type="text" id="aaNotaIn" maxlength="400" placeholder="Ej: lo cargamos a mano porque la orden se perdió"></label><div class="qp-acc"><button type="button" class="btn-primary" data-aa="notasi" data-id="${esc(h.obraId)}" data-item="${esc(h.item || "")}">Sí, anotar</button><button type="button" class="btn-ghost" data-aa="notano">Cancelar</button></div>` : botonesHallazgo(h)}</div>`;
  }
  function htmlItem(E) {
    const ab = !!st.abierto[E.item], c = E.estado === "noCuadra" ? "rojo" : E.estado === "aMano" ? "ambar" : "ok";
    const fu = E.fuentes.map((x) => `<div class="aa-f"><span>${x.cuenta ? "📋" : "↩"} <b>${esc(x.numero)}</b> ${esc(fC(x.fecha))} · ${esc(x.tarea)}${x.parte ? `<small>${esc(x.parte)}</small>` : ""}${x.revertido ? "<small>revertido al anular (no cuenta)</small>" : ""}${x.corregida ? `<small>corregida el ${esc(x.corregida.fecha)} por ${esc(x.corregida.por)} · ${esc(x.corregida.motivo || "sin motivo anotado")}</small>` : ""}</span><span class="aa-n">${x.cuenta ? "+" : ""}${esc(fN(x.delta))}</span>${x.cerrada && puede() ? `<button type="button" class="btn-ghost aa-mini" data-ccabrir="${esc(x.otId)}">✏</button>` : ""}<button type="button" class="btn-ghost aa-mini" data-aa="ot" data-id="${esc(x.otId)}" aria-label="Ver la orden">👁</button></div>`).join("")
      + E.aMano.map((h) => `<div class="aa-f"><span>✋ a mano ${esc(h.fecha)} · ${esc(String(h.por).split(" ")[0])}<small>${h.motivo ? "«" + esc(h.motivo) + "»" : "sin motivo anotado"}</small></span><span class="aa-n">${h.despues - h.antes >= 0 ? "+" : ""}${esc(fN(h.despues - h.antes))}</span></div>`).join("")
      + (E.sinFecha > 0 ? `<div class="aa-f ${E.notas.length ? "" : "aa-mal"}"><span>✋ a mano, sin fecha<small>${E.notas.length ? "«" + esc(E.notas[E.notas.length - 1].texto) + "»" : "sin motivo anotado"}</small></span><span class="aa-n">+${esc(fN(E.sinFecha))}</span></div>` : "")
      + E.certificado.map((x) => `<div class="aa-f aa-cert"><span>📑 certificado ${esc(x.mes)} (foto fija)</span><span class="aa-n">${esc(fN(x.delMes))} · acum. ${esc(fN(x.acumulado))}</span></div>`).join("");
    return `<div class="aa-it ${c}"><button type="button" class="aa-ith" data-aa="item" data-id="${esc(E.item)}" aria-expanded="${ab}"><span><b>Ítem ${esc(E.item)}</b> ${esc(E.desc.slice(0, 70))}</span><span class="aa-n">${esc(fN(E.hechas))} / ${esc(fN(E.contratado))} ${E.cuadra ? "✓" : "⚠"}</span></button>${ab ? `<div class="aa-itb">${fu || '<div class="aa-f"><span>Sin avance todavía.</span></div>'}<div class="aa-suma ${E.cuadra ? "" : "aa-mal"}">${esc(E.cuadra ? "Suma: " + (E.fuentes.filter((x) => x.cuenta).map((x) => fN(x.delta)).concat(E.aMano.map((h) => fN(h.despues - h.antes))).concat(E.sinFecha > 0 ? [fN(E.sinFecha)] : []).join(" + ") || "0") + " = " + fN(E.hechas) + " ✓ cuadra" : `No cuadra: las fuentes suman ${fN(E.sumaOrdenes + E.sumaAMano)} y el ítem dice ${fN(E.hechas)}`)}</div></div>` : ""}</div>`;
  }
  function pintar() {
    let ov = $("aaOv");
    if (!ov) { ov = document.createElement("div"); ov.id = "aaOv"; ov.className = "v7-ov no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Control del avance"); document.body.appendChild(ov); }
    const lista = obras().slice().sort((a, b) => nombreObra(a).localeCompare(nombreObra(b)));
    const hayZ = lista.some(enZona), soloZ = st.obra === "__zona" && hayZ;
    const sel = `<label class="cc-campo">Obra<select id="aaObra"><option value="">Todas las obras</option>${hayZ ? `<option value="__zona"${soloZ ? " selected" : ""}>Todas · nuestra zona</option>` : ""}${lista.map((o) => `<option value="${esc(o.id)}"${String(o.id) === st.obra ? " selected" : ""}>${esc(nombreObra(o))}</option>`).join("")}</select></label>`;
    let cuerpo = "";
    if (!st.obra || st.obra === "__zona") {
      const R = revisar({ zona: soloZ }), porO = {};
      R.hallazgos.forEach((h) => { const x = (porO[h.obraId] = porO[h.obraId] || { r: 0, a: 0 }); if (h.nivel === "rojo") x.r++; else if (h.nivel === "ambar") x.a++; });
      const filasO = (soloZ ? lista.filter(enZona) : lista).map((o) => { const x = porO[o.id] || { r: 0, a: 0 }, p = intentar(() => calcularAvanceEtapasPct(o), 0); return `<button type="button" class="aa-ob ${x.r ? "rojo" : x.a ? "ambar" : "ok"}" data-aa="obra" data-id="${esc(o.id)}"><span><b>${esc(nombreObra(o))}</b><small>${x.r ? x.r + " mal · " : ""}${x.a ? x.a + " para mirar" : x.r ? "" : "✓ cuadra"}</small></span><span class="aa-n">${esc(String(p))} %</span></button>`; }).join("");
      cuerpo = `<p class="qp-nota">${R.obras} obra(s). ${R.hallazgos.length ? `${R.rojos} cosa(s) mal · ${R.ambar} para mirar.` : "✓ No encontré nada raro."} Tocá una obra para ver cada número con sus fuentes.</p><div class="aa-obras">${filasO}</div><div class="qp-sec">Hallazgos</div>${R.hallazgos.filter((h) => h.nivel !== "info").slice(0, 40).map(htmlHallazgo).join("") || '<p class="qp-nota">Nada rojo ni para mirar.</p>'}`;
    } else {
      const E = explicarObra(st.obra);
      if (E.err) cuerpo = `<p class="qp-nota">${esc(E.err)}</p>`;
      else {
        const PLh = intentar(() => window.__hecho.planillaHtml(E.obraId, true), "");
        cuerpo = `<div class="aa-res ${E.rojos ? "rojo" : E.hallazgos.length ? "ambar" : "ok"}"><b>${esc(String(E.avancePct))} %</b><span>${esc(fN(E.modulos.hechos))} de ${esc(fN(E.modulos.total))} módulos K<br><small>${E.rojos ? E.rojos + " mal · " : ""}${E.hallazgos.length - E.rojos ? E.hallazgos.length - E.rojos + " para mirar" : E.rojos ? "" : "✓ todo cuadra"}</small></span></div>
<div class="qp-sec">Hallazgos</div>${E.hallazgos.map(htmlHallazgo).join("") || '<p class="qp-nota">✓ No encontré nada raro: cada número cuadra con sus fuentes.</p>'}
<div class="qp-sec">Ítem por ítem (tocá para ver de dónde sale)</div>${E.items.map(htmlItem).join("") || '<p class="qp-nota">La obra no tiene itemizado cargado.</p>'}
${E.contraItemizado ? `<div class="qp-sec">Columna por columna</div><p class="qp-nota">${esc(E.contraItemizado)}</p>${PLh ? `<div class="aa-pl">${PLh}</div>` : ""}` : ""}
<div class="qp-sec">Etapas</div><div class="aa-et">${E.etapas.filter((x) => x.tildada || /destildada/.test(x.como)).map((x) => `<span class="chip">${x.tildada ? "✓" : "✕"} ${esc(x.etapa)} <small>${esc(x.como)}</small></span>`).join("") || '<span class="qp-nota">Ninguna tildada.</span>'}</div>
${E.notas.length ? `<div class="qp-sec">📒 Notas</div>${E.notas.slice().reverse().map((n) => `<div class="qp-o"><div class="qp-hx">«${esc(n.texto)}»</div><div class="qp-hp">${esc([n.item ? "ítem " + n.item : "", n.por, n.fecha].filter(Boolean).join(" · "))}</div></div>`).join("")}` : ""}`;
      }
    }
    const h = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>🔎 Control del avance</h3><small>Cada número con sus fuentes y si está bien${puede() ? "" : " · solo para mirar"}</small></div><button type="button" class="v7-x" data-aa="x" aria-label="Cerrar">✕</button></div>
${sel}${st.msg ? `<div class="aa-msg" role="status">${esc(st.msg)}</div>` : ""}<div class="qp-acc"><button type="button" class="btn-ghost" data-aa="ia">✨ Que lo analice el asistente</button></div>${cuerpo}</div>`;
    if (ov.__h !== h) { const c = ov.querySelector(".v7-caja"), sc = c ? c.scrollTop : 0; ov.innerHTML = h; ov.__h = h; const c2 = ov.querySelector(".v7-caja"); if (c2) c2.scrollTop = sc; }
  }
  function abrir(op) {
    if (!puedeVer()) { try { window.__avisoApp ? window.__avisoApp("🔒 El control del avance lo ven Administración, Oficina y Dirección.") : null; } catch (e) { } return false; }
    op = op || {}; st.obra = op.obra ? String((obraDe(op.obra) || {}).id || "") : op.obra === "" ? "" : st.obra; st.msg = ""; st.nota = "";
    try { window.cerrarMenuLateral && window.cerrarMenuLateral(); } catch (e) { }
    pintar(); setTimeout(() => intentar(() => window.__atras && window.__atras.sync && window.__atras.sync(), null), 30); return true;
  }
  function cerrar() { const v = $("aaOv"); v && v.remove(); }
  document.addEventListener("click", async (e) => {
    const t = e.target; if (!t || !t.closest) return;
    const ab = t.closest("[data-aaabrir]"); if (ab) { e.preventDefault(); abrir({ obra: ab.dataset.aaabrir || "" }); return; }
    const ov = $("aaOv"); if (!ov || !ov.contains(t)) return;
    if (t.closest("[data-ccabrir],[data-dcdoc]")) { setTimeout(cerrar, 0); return; }
    const b = t.closest("[data-aa]"); if (!b) return;
    const a = b.dataset.aa, id = b.dataset.id || "";
    if (a === "x") return cerrar();
    if (a === "obra") { st.obra = id; st.abierto = {}; st.nota = ""; st.msg = ""; return pintar(); }
    if (a === "item") { st.abierto[id] = !st.abierto[id]; return pintar(); }
    if (a === "ot") { cerrar(); try { verOrdenTrabajo(id); } catch (er) { } return; }
    if (a === "cerrarot") { cerrar(); try { window.abrirCierreOt(id); } catch (er) { } return; }
    if (a === "avance") { cerrar(); try { mostrarVista("avance"); verAvanceDetalle(id); } catch (er) { } return; }
    if (a === "nota") { const h = revisar({ obra: id }).hallazgos.find((x) => (x.item || "") === (b.dataset.item || "")); st.nota = h ? h.clave : ["nota", id, b.dataset.item || "", ""].join("|"); if (!h) st.obra = id; pintar(); const i = $("aaNotaIn"); i && i.focus(); return; }
    if (a === "notano") { st.nota = ""; return pintar(); }
    if (a === "notasi") { const tx = String(($("aaNotaIn") || {}).value || "").trim(); if (!conMotivo(tx)) { st.msg = "Escribí el porqué."; return pintar(); } b.disabled = true; try { const r = await aplicarNota({ obraId: id, item: b.dataset.item || "", texto: tx }); st.msg = r.ok ? r.txt : "⚠ " + r.err; } catch (er) { st.msg = "⚠ No se pudo guardar (" + ((er && er.code) || "sin señal") + ")."; } st.nota = ""; ov.__h = ""; return pintar(); }
    if (a === "calculo") { const m = "Control del avance: el cálculo de la obra cambió"; const P = planCalculo({ obraId: id, motivo: m }); if (P.err) { st.msg = P.err; return pintar(); } try { const r = await aplicarCalculo({ obraId: id, motivo: m }); st.msg = r.ok ? r.txt : "⚠ " + r.err; } catch (er) { st.msg = "⚠ No se pudo."; } return pintar(); }
    if (a === "ia") { const o = st.obra && st.obra !== "__zona" ? obraDe(st.obra) : null; cerrar(); try { window.__asistenteAbrir && window.__asistenteAbrir(o ? `¿Está bien el avance de ${nombreObra(o)}? Explicame cada número y qué está mal.` : "Revisá el avance de todas las obras y decime qué está mal."); } catch (er) { } }
  });
  document.addEventListener("change", (e) => { if (e.target && e.target.id === "aaObra") { st.obra = e.target.value; st.abierto = {}; st.nota = ""; st.msg = ""; pintar(); } });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("aaOv") && !$("aaMotOv")) cerrar(); });

  // ===================================================================== accesos: Avance de obra (arriba y en cada obra), legajo
  function seccionLegajo() {
    const f = $("lgFotosSec"), id = f && f.dataset.plaza ? f.dataset.plaza : "", o = id ? obraDe(id) : null;
    let sec = $("lgAaSec");
    if (!o || !puedeVer()) { sec && sec.remove(); return; }
    if (sec && sec.dataset.plaza !== String(id)) { sec.remove(); sec = null; }
    if (!sec) { sec = document.createElement("div"); sec.className = "card lg-sec aa-lg"; sec.id = "lgAaSec"; sec.dataset.plaza = String(id); f.insertAdjacentElement("beforebegin", sec); }
    const R = revisar({ obra: o.id }), h = `<div class="aa-lgf"><span><b>🔎 Control del avance</b><small>${R.hallazgos.length ? `${R.rojos ? R.rojos + " mal · " : ""}${R.hallazgos.length - R.rojos} para mirar` : "✓ cada número cuadra con sus fuentes"}</small></span><button type="button" class="btn-ghost" data-aaabrir="${esc(o.id)}">Ver</button></div>`;
    if (sec.__h !== h) { sec.innerHTML = h; sec.__h = h; }
  }
  function accesos() {
    if (window.__v156No || !puedeVer()) return;
    const card = $("avancePanelCard");
    if (card && !card.querySelector(".aa-top")) card.insertAdjacentHTML("afterbegin", '<div class="aa-top no-print"><button type="button" class="btn-ghost aa-btn" data-aaabrir="">🔎 Control del avance</button></div>');
    const sec = $("aviSec");
    if (sec && !sec.querySelector(".aa-btn")) { const id = intentar(() => avanceActivoId, ""); if (id) sec.insertAdjacentHTML("afterbegin", `<div class="aa-top no-print"><button type="button" class="btn-ghost aa-btn" data-aaabrir="${esc(id)}">🔎 Control del avance de esta obra</button></div>`); }
    try { seccionLegajo(); } catch (e) { }
  }
  setInterval(accesos, 1200);

  // ===================================================================== parte del avance al final del día (sin IA)
  const stP = { corriendo: false };
  async function tic() {
    if (stP.corriendo || window.__aaPausa || !puede() || ["admin", "oficina"].indexOf(rolYo()) < 0) return null;
    const C = intentar(() => window.__pasarManana.cfg(), { hora: "18:00" }) || { hora: "18:00" };
    const d = new Date(ahora()), D = isoTs(+d), hh = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    if (hh < (C.hora || "18:00") || d.getDay() === 0) return null;
    if (intentar(() => localStorage.getItem("ema.aa.parte." + D), "")) return null;
    stP.corriendo = true;
    try {
      const R = revisar({}), rojos = R.hallazgos.filter((h) => h.nivel === "rojo");
      let vistos = intentar(() => JSON.parse(localStorage.getItem("ema.aa.vistos") || "[]"), []); if (!Array.isArray(vistos)) vistos = [];
      const nuevos = rojos.filter((h) => vistos.indexOf(h.clave) < 0);
      try { localStorage.setItem("ema.aa.parte." + D, "1"); localStorage.setItem("ema.aa.vistos", JSON.stringify(rojos.map((h) => h.clave).slice(-400))); } catch (e) { }
      if (!nuevos.length) return { nuevos: 0 };
      const gano = window.__pasarManana && window.__pasarManana.tomar ? await window.__pasarManana.tomar(D, "avance") : true;
      if (!gano) return { gano: false };
      const txt = `${nuevos.length} ${nuevos.length === 1 ? "cosa nueva" : "cosas nuevas"} mal en el avance: ` + nuevos.slice(0, 3).map((h) => h.obra + ": " + h.texto.slice(0, 80)).join(" · ");
      const dest = intentar(() => PERMISOS.lista() || [], []).filter((u) => u && u.email && u.activo !== false && u.pendiente !== true && u.rol === "admin").map((u) => String(u.email).toLowerCase()).filter((x) => x !== yoMail().toLowerCase());
      for (const em of [...new Set(dest)]) { try { await window.__pushAvisos.dejarAviso({ email: em, titulo: "🔎 Parte del avance", cuerpo: txt.slice(0, 300) + " Tocá para ver.", tipo: "avance", tag: "ema-avance-" + D, ref: D, url: "./" }); } catch (e) { } }
      auditar("parte del avance: " + txt, {});
      return { gano: true, nuevos: nuevos.length, txt };
    } catch (e) { return null; } finally { stP.corriendo = false; }
  }
  setInterval(() => { if (!document.hidden) tic().catch(() => { }); }, 60000);
  setTimeout(() => { tic().catch(() => { }); }, 35000);

  window.__auditAvance = { explicarItem, explicarObra, revisar, periodo, planilla: planillaDe, supHallazgos, atender, resumenRojos, planItem, aplicarItem, planNota, aplicarNota, planCierre, planCalculo, aplicarCalculo, planUno, planVarios, aplicarVarios, pedirMotivo, abrir, cerrar, pintar, puede, puedeVer, tic, fN, obraDe, estado: () => st };
})();
