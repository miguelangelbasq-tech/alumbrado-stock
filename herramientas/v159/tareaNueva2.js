(function () {
  "use strict";
  // v159 · Crear tareas nuevas con el asistente (y a mano), con los puntos de la fórmula de siempre (Ángel, 15/11: «se me van
  //  ocurriendo, se lo digo a la IA y lo tiene que calcular, y el tema de los puntos también calcularlo con la fórmula que dijimos,
  //  y que sea algo justo»).
  //  · La fórmula es la del diccionario v108 (window.__diccDif = la misma función `dif` de diccionarioTareas): D = 1 + 0,2 por cada
  //    factor (🪜 altura · 🏋 pesado · ⚡ riesgo eléctrico · 🎯 oficio), tope 1,8, redondeado a 1 decimal; puntos por unidad = HH × D
  //    (redondeado a 2 decimales). 1 punto = 1 hora-hombre efectiva.
  //  · proponer(a): arma la tarea completa SIN escribir nada (HH dichas, de minutos × personas o estimadas con las parecidas y los
  //    minutos medidos v157; factores dichos o estimados por las palabras; D; puntos con la cuenta escrita; las 3 parecidas con sus
  //    pts/h y si es «justa»; pasos y fotos borrador; ítem del itemizado con su parte o noAvanza; qué marca en el avance nuevo v158
  //    (un paso de la grilla o una cosa nueva del rubro); rendimiento por día para la sugerida). Lo estimado va «estimado · a confirmar».
  //  · crear(T, motivo): solo quien edita Producción (no cuadrilla, operario, pañol, mirar ni Dirección): registrarTareasNuevas
  //    (configEquipo/baremo.tareasPropias con `t159`) + historial del baremo (hist, tipo "nueva") + sugerida.rend si dio
  //    rendimiento; auditoría `tarea_nueva`. editar(k, cambios, motivo) y baja(k, motivo) por el mismo camino. No borra: «dar de
  //    baja» la esconde de Llenar orden y de la sugerida (las órdenes viejas siguen andando).
  //  · Se engancha en: el final de M() del baremo (window.__tn2Aplicar: TAREA_META con su ítem o noAvanza, el avance nuevo, las fotos
  //    de Modo obra, la categoría de foto), la lista del avance nuevo (window.__av2Glob), la orden sugerida (window.__tn2T /
  //    __tn2PorCol / __tn2Ids), el auditor de puntos (fuenteValor) y Producción › «＋ Crear tarea» (la calculadora).
  //  Sin reglas nuevas (configEquipo/baremo lo escribe quien edita Producción). Apagado con __v159No (salvo v159:true).
  if (window.__v159No) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => (typeof escHtml == "function" ? escHtml(String(s == null ? "" : s)) : String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]));
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const r2 = (x) => Math.round(x * 100) / 100;
  const fN = (x, d) => { const r = r2(num(x)); const dd = d != null ? d : Number.isInteger(r) ? 0 : Number.isInteger(Math.round(r * 100) / 10) ? 1 : 2; return typeof fmt == "function" ? fmt(r, dd) : String(r); };
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const intentar = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const yoMail = () => intentar(() => (window.__fbUser || {}).email || "", "");
  const yoNombre = () => intentar(() => { const y = window.PERMISOS && PERMISOS.yo ? PERMISOS.yo() : null; return (y && (y.persona || y.nombre)) || yoMail(); }, "");
  const fTs = (t) => intentar(() => { const d = new Date(+t); return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear(); }, "");

  // ===================================================================== la fórmula (la del diccionario v108)
  const FAC = [
    { k: "alt", t: "🪜 Altura o barquilla", d: "se trabaja arriba: hidro, barquilla, escalera, brazo o luminaria", re: /altura|barquill|hidro|escalera|arriba|en lo alto|brazo|luminari|artefacto|vinculo|capuchon|subir a/ },
    { k: "pes", t: "🏋 Pesado", d: "esfuerzo físico: cargar, cavar, hormigón, columnas o postes", re: /pesad|cargar|carga |levantar|hormig|excav|pozo|zanja|cavar|izaje|izar|traslad|mover (la |las )?column|poste|bolsa|escombro/ },
    { k: "rie", t: "⚡ Riesgo eléctrico", d: "con tensión cerca o se conecta algo eléctrico", re: /electr|tension|conect|conex|tablero|fusibl|bornera|termica|empalme|aislac|energ|cable vivo|corte de luz|medidor/ },
    { k: "ofi", t: "🎯 Oficio o precisión", d: "hace falta saber hacerlo bien: armado, conexionado, medición, plano", re: /precis|oficio|armad|armar|conexionad|medic|medir|plano|soldad|calibr|empalme|program|replante|certificad/ }
  ];
  const difDe = (f) => { f = obj(f); if (typeof window.__diccDif == "function") return window.__diccDif(f); let n = 0; FAC.forEach((x) => { if (f[x.k]) n++; }); return Math.min(1.8, Math.round((1 + 0.2 * n) * 10) / 10); };
  const ptsDe = (hh, d) => Math.round(num(hh) * num(d) * 100) / 100;   // la misma cuenta de x.pts en el diccionario
  const JUSTO_MAX = 1.5, JUSTO_MIN = 1 / 1.5;   // pts por hora contra las parecidas (a confirmar)

  // ===================================================================== lo que ya hay (diccionario, catálogo, baremo)
  const catalogo = () => intentar(() => (typeof ACTIVIDADES_CATALOGO != "undefined" ? ACTIVIDADES_CATALOGO : []), []);
  const baremo = () => intentar(() => (window.baremoActual && window.baremoActual()) || {}, {});
  const nube = () => window.__baremoNube || {};
  const BI = () => window.__baremoInterno || null;
  const propias = () => intentar(() => (BI() ? BI().S() : arr(nube().tareasPropias)), []);
  const propiaDe = (k) => propias().find((x) => x && x.id === k) || null;
  const t159De = (k) => { const p = propiaDe(k); return p && p.t159 ? p : null; };
  const nuevas = () => propias().filter((x) => x && x.t159);
  const activas = () => nuevas().filter((x) => !x.t159.baja);
  const metaDe = (k) => intentar(() => (typeof metaDeTarea == "function" ? metaDeTarea(k) : TAREA_META[k]) || {}, {});
  const labelDe = (k) => { const a = catalogo().find((x) => x && x.id === k); return a ? a.label : k; };
  const viejas = () => arr(window.DICC_VIEJAS);
  function vigente(k) { const b = baremo()[k]; return b ? num(b.pts) : 0; }
  function medidos() { return intentar(() => (window.__sugerida && window.__sugerida.medidos ? window.__sugerida.medidos() : {}), {}) || {}; }
  // las candidatas a «parecida»: el diccionario (sin las viejas) + las propias con horas
  function candidatas(sinK) {
    const out = [], ya = {};
    arr(window.DICC_TAREAS).forEach((d) => { if (!d || viejas().indexOf(d.id) >= 0 || d.id === sinK) return; ya[d.id] = 1; out.push({ k: d.id, label: labelDe(d.id) || d.label, un: d.un, hh: num(d.hh), f: obj(d.f), fase: d.fase, pasos: (catalogo().find((x) => x.id === d.id) || {}).pasos || d.pasos || "" }); });
    propias().forEach((p) => { if (!p || ya[p.id] || p.id === sinK || !(num(p.hh) > 0) || (p.t159 && p.t159.baja)) return; out.push({ k: p.id, label: p.label, un: p.un, hh: num(p.hh), f: obj(p.f), fase: p.fase || "", propia: true }); });
    return out;
  }
  const STOP = /^(de|del|la|las|los|el|en|con|sin|por|para|una|uno|unos|unas|que|cada|mas|menos|entre|dos|tres|hacer|poner|colocar|tarea|nueva|algo|todo|toda|todas|todos|asi|esto|esta|este|como|hora|horas|media|minutos?)$/;
  const raices = (s) => { const v = {}; nk(s).split(/[^a-z0-9]+/).forEach((w) => { if (w.length < 4 || STOP.test(w)) return; v[w.slice(0, 4)] = 1; }); return Object.keys(v); };

  // ===================================================================== unidades
  const UNID = [
    { re: /colum/, un: "columna", q: "col", cat: "columna" }, { re: /caja|tablerito|bornera/, un: "caja", q: "caja", cat: "caja" },
    { re: /lumin|artef|farol/, un: "luminaria", q: "lum", cat: "luminaria" }, { re: /jabal/, un: "jabalina", q: "jab", cat: "pat" },
    { re: /^m$|^ml$|metro/, un: "metro", q: "m", cat: "" }, { re: /tablero/, un: "tablero", q: "tab", cat: "tablero" },
    { re: /obra|plaza/, un: "obra", q: "bin", cat: "" }
  ];
  const unDe = (u) => { const n = nk(u); if (!n) return null; const x = UNID.find((y) => y.re.test(n)); return x ? x : { un: String(u).trim(), q: "", cat: "" }; };
  const UN_LISTA = ["columna", "caja", "luminaria", "jabalina", "metro", "tablero", "obra", "visita", "viaje", "unidad"];

  // ===================================================================== el avance nuevo (v158)
  const PASOS_AV = () => arr(intentar(() => window.__av2.PASOS, []));
  const RUBS_AV = () => arr(intentar(() => window.__av2.RUB, []));
  const RUB_DE_UN = { col: "columnas", caja: "cajas", lum: "artefactos", jab: "pat", tab: "tablero", bin: "cierre", m: "civil" };
  function avDe(a, u, txt) {   // {tipo: "paso"|"cosa"|"", paso, r, q, txt, estimado}
    const v = nk(a.rubroAvance || "");
    if (/^(no|ninguno|nada|sin)/.test(v)) return { tipo: "", txt: "No marca nada en el avance de obra." };
    if (v) {
      const p = PASOS_AV().find((x) => nk(x.id) === v || nk(x.t).replace(/\.$/, "") === v.replace(/\.$/, "") || nk(x.l).indexOf(v) === 0);
      if (p) return { tipo: "paso", paso: p.id, r: p.r, txt: `Marca el paso «${p.l}» de cada columna en la grilla.` };
      const r = RUBS_AV().find((x) => nk(x[0]) === v || nk(x[1]).indexOf(v) === 0);
      if (r) return { tipo: "cosa", r: r[0], q: (u && u.q) || "bin", txt: `Una cosa nueva en «${r[1]}»${cuantoTxt((u && u.q) || "bin")}.` };
    }
    const q = u && u.q;
    let r = q ? RUB_DE_UN[q] : "";
    if (q === "m") r = /cable|tendid/.test(txt) ? "cableado" : "civil";
    if (!r) return { tipo: "", estimado: true, txt: "No marca nada en el avance de obra (decí si va en algún rubro)." };
    const rn = (RUBS_AV().find((x) => x[0] === r) || [r, r])[1];
    return { tipo: "cosa", r, q, estimado: !v, txt: `Una cosa nueva en «${rn}»${cuantoTxt(q)}.` };
  }
  function cuantoTxt(q) { return { col: ", una por columna", caja: ", una por caja de columna", lum: ", una por luminaria", jab: ", una por jabalina", tab: ", una por tablero", m: ", por metro (los de la zanja de la obra, a confirmar)", bin: ", una vez por obra" }[q] || ""; }

  // ===================================================================== proponer (no escribe nada)
  function proponer(a, op) {
    a = Object.assign({}, a || {}); op = op || {};
    const editK = op.editar || a.editar || "";
    const label = String(a.nombre || a.label || "").replace(/\s+/g, " ").trim();
    if (!label) return { err: "Falta el nombre de la tarea (una sola acción, clara)." };
    const yaEs = catalogo().find((x) => x && nk(x.label) === nk(label) && x.id !== editK);
    if (yaEs) return { err: `Ya hay una tarea que se llama «${yaEs.label}»: buscala en «Cuánto vale cada tarea» (para cambiarla usá editar).`, existe: yaEs.id };
    const desc = String(a.descripcion || a.desc || "").trim();
    const txt = nk(label + " " + desc);
    const est = {};
    // la unidad
    let u = unDe(a.unidad || a.un);
    if (!u) { u = UNID.find((y) => y.re.test(txt)) || { un: "unidad", q: "", cat: "" }; est.un = true; }
    const un = u.un;
    // las parecidas (las 3 que más se parecen por el nombre; si empata, la de la misma unidad)
    const rz = raices(label + " " + desc);
    const cands = candidatas(editK).map((c) => {
      const rc = raices(c.label); let m = 0; rz.forEach((w) => { if (rc.indexOf(w) >= 0) m++; });
      const mismaU = nk(c.un) === nk(un) || (unDe(c.un) || {}).un === un;
      return Object.assign({}, c, { score: m * 2 + (mismaU ? 1 : 0) + (m ? 0.01 * (5 - Math.min(5, rc.length)) : 0), m, mismaU });
    }).filter((c) => c.m > 0 || c.mismaU).sort((x, y) => y.score - x.score);
    const parecidas = cands.slice(0, 3).map((c) => {
      const md = medidos()[c.k], hhMed = md && md.porHH > 0 && md.n >= 3 ? r2(1 / md.porHH) : null;
      const pts = vigente(c.k) || ptsDe(c.hh, difDe(c.f));
      return { k: c.k, label: c.label, un: c.un, hh: c.hh, hhMed, medN: md ? md.n : 0, dif: difDe(c.f), pts: r2(pts), ptsH: c.hh > 0 ? r2(pts / c.hh) : 0, f: c.f, fase: c.fase, mismaU: c.mismaU, m: c.m };
    });
    // HH por unidad
    let hh = num(a.hh), hhTxt = "", hhFuente = "";
    const min = num(a.minutos != null ? a.minutos : a.minutos_por_unidad), per = num(a.personas);
    if (hh > 0) { hhFuente = "dicho"; hhTxt = `${fN(hh)} HH por ${un} (lo que dijiste)`; if (min > 0) hhTxt += ` · ${fN(min)} min × ${fN(per || 1)} = ${fN(r2(min / 60 * (per || 1)))} HH`; }
    else if (min > 0) { const p = per > 0 ? per : 1; hh = r2(min / 60 * p); hhFuente = "min"; hhTxt = `${fN(min / 60)} h × ${fN(p)} ${p === 1 ? "persona" : "personas"} = ${fN(hh)} HH por ${un} (lo que dijiste)` + (per > 0 ? "" : " · ¿entre cuántos? puse 1, a confirmar"); if (!(per > 0)) est.hh = true; }
    else {
      const base = parecidas.filter((p) => p.mismaU && p.m > 0).length ? parecidas.filter((p) => p.mismaU && p.m > 0) : parecidas.filter((p) => p.m > 0);
      if (base.length) {
        const vals = base.map((p) => (p.hhMed > 0 ? p.hhMed : p.hh)).filter((v) => v > 0);
        if (vals.length) { hh = r2(vals.reduce((s, v) => s + v, 0) / vals.length); hhFuente = "parecidas"; est.hh = true; hhTxt = `${fN(hh)} HH por ${un}: estimado con las parecidas (${base.map((p) => `${p.label} ${fN(p.hhMed > 0 ? p.hhMed : p.hh)} HH${p.hhMed > 0 ? " medido" : ""}`).join(" · ")}) · estimado · a confirmar`; }
      }
    }
    const preguntar = [];
    if (!(hh > 0)) preguntar.push(`¿Cuánto tarda cada ${un} y entre cuántos lo hacen? (con eso saco las horas-hombre)`);
    // los factores de dificultad
    const fIn = a.factores, f = {}, fEst = {};
    FAC.forEach((x) => {
      let v = null;
      if (Array.isArray(fIn)) v = fIn.map(nk).some((y) => y === x.k || nk(x.t).indexOf(y) >= 0);
      else if (fIn && typeof fIn == "object" && fIn[x.k] != null) v = !!fIn[x.k];
      if (v == null) { v = x.re.test(txt); fEst[x.k] = true; }
      f[x.k] = !!v;
    });
    if (Object.keys(fEst).length) est.f = true;
    const dif = difDe(f), ptsForm = ptsDe(hh, dif);
    let pts = ptsForm, ptsMano = false;
    if (a.puntos != null && String(a.puntos).trim() !== "" && num(a.puntos) >= 0 && Math.abs(num(a.puntos) - ptsForm) > 1e-9) { pts = r2(num(a.puntos)); ptsMano = true; }
    const nF = FAC.filter((x) => f[x.k]).length;
    const cuenta = `${fN(hh)} HH × ${fN(dif, 2)} = ${fN(ptsForm)} pts por ${un}`;
    const difTxt = `D = 1 + 0,2 × ${nF} = ${fN(dif)}${nF ? " (" + FAC.filter((x) => f[x.k]).map((x) => x.t.replace(/^\S+\s/, "").toLowerCase()).join(", ") + ")" : " (nada de altura, peso, riesgo ni oficio)"}`;
    // ¿es justa? pts por hora contra las parecidas
    const ph = parecidas.filter((p) => p.ptsH > 0), prom = ph.length ? r2(ph.reduce((s, p) => s + p.ptsH, 0) / ph.length) : 0;
    const ptsH = hh > 0 ? r2(pts / hh) : 0, ratio = prom > 0 && ptsH > 0 ? ptsH / prom : 1;
    const avisos = [];
    let justo = { ok: true, ptsH, prom, ratio: r2(ratio), txt: prom ? `Paga ${fN(ptsH)} pts por hora; las parecidas ${fN(prom)}: está pareja.` : "No hay parecidas para comparar." };
    if (prom && ratio > JUSTO_MAX) { justo = Object.assign(justo, { ok: false, txt: `Esta paga ${fN(ptsH)} pts por hora y las parecidas ${fN(prom)}: queda muy por encima, revisá.` }); avisos.push(justo.txt); }
    else if (prom && ratio < JUSTO_MIN) { justo = Object.assign(justo, { ok: false, txt: `Esta paga ${fN(ptsH)} pts por hora y las parecidas ${fN(prom)}: queda muy por debajo, revisá.` }); avisos.push(justo.txt); }
    if (ptsMano) avisos.push(`Pusiste ${fN(pts)} pts a mano; con la fórmula daría ${fN(ptsForm)} (${cuenta}).`);
    const mu = parecidas.filter((p) => p.mismaU && p.m > 0 && p.hh > 0);
    if (hh > 0 && hhFuente !== "parecidas" && mu.length) { const hm = mu.reduce((s, p) => s + p.hh, 0) / mu.length; if (hh > hm * 3 || hh < hm / 3) avisos.push(`Las horas no se parecen a las de las parecidas (${mu.map((p) => p.label + " " + fN(p.hh) + " HH").join(" · ")}): revisá.`); }
    // la fase
    let fase = String(a.fase || "").trim();
    const fases = intentar(() => FASES_TAREA.slice(), ["Varios"]);
    if (fase) { const fx = fases.find((x) => nk(x) === nk(fase) || nk(x).indexOf(nk(fase)) === 0); fase = fx || fase; }
    else { fase = (parecidas.find((p) => p.m > 0 && p.fase) || {}).fase || "Varios"; est.fase = true; }
    // pasos (borrador)
    let pasos = Array.isArray(a.pasos) ? a.pasos.map((x) => String(x).trim()).filter(Boolean).map((x, i) => /^\d+[.)]/.test(x) ? x : `${i + 1}. ${x}`).join("\n") : String(a.pasos || "").trim();
    if (!pasos) { est.pasos = true; pasos = `1. Preparar el material y la herramienta.\n2. ${label}${u.q && u.q !== "bin" ? " en cada " + un : ""}${desc ? " (" + desc.replace(/\.$/, "") + ")" : ""}.\n3. Sacar la foto de cómo quedó.\n(Pasos a confirmar.)`; }
    // fotos
    const cat = u.cat || intentar(() => window.catFotoDeTarea(label), "otra");
    const porUnidad = intentar(() => !!window.catFotoPideNum(cat), false) && u.q !== "m";
    let fl = Array.isArray(a.fotos) ? a.fotos : String(a.fotos || "").split(/\n|;/);
    fl = fl.map((x) => String(x).trim()).filter(Boolean);
    if (!fl.length) est.fotos = true;
    const fotos = porUnidad ? { cat, porUnidad: true, ayuda: `En cada ${un}: ${fl.length ? fl.join("; ") : "cómo quedó, que se vea bien lo que se hizo"}.` } : { cat, porUnidad: false, tomas: (fl.length ? fl : ["Antes de empezar", "Trabajo terminado"]).map((t, i, l) => ({ t, a: "", oblig: !(l.length > 1 && i === 0 && !a.fotos) })) };
    // el ítem del itemizado
    let item = null, grupos = null, noAvanza = true;
    const it = String(a.item || "").replace(/^(item|ítem)\s*/i, "").trim();
    if (it && !/^(no|ninguno|sin|nada)/i.test(it)) {
      const d = intentar(() => window.epecItemDesc(it), "");
      if (!d) return { err: `No encontré el ítem «${it}» en el itemizado.` };
      let parte = num(a.parte); if (parte > 1) parte = parte / 100; if (!(parte > 0)) { parte = 1; est.parte = true; }
      item = { item: it, desc: d, parte: r2(parte), un: intentar(() => window.epecItemUn(it), "") };
      grupos = [{ items: [it], pct: item.parte }]; noAvanza = false;
      avisos.push(`Mueve el ítem ${it} (lo que se cobra) con el ${fN(item.parte * 100, 0)} %${est.parte ? " — la parte es a confirmar" : ""}: si otra tarea ya completa ese ítem, se pisan.`);
    }
    const itPar = !item ? (parecidas.find((p) => p.m > 0 && arr(metaDe(p.k).items).length) || null) : null;
    // el avance nuevo
    const av = avDe(a, u, txt);
    if (av.tipo === "cosa" && av.estimado) est.av = true;
    // rendimiento para la orden sugerida
    const J = num(intentar(() => obj(nube().sugerida).jornada, 0)) || 8;
    let rend = null;
    if (num(a.rinde) > 0 || num(a.rinde_por_dia) > 0) { const pd = num(a.rinde) || num(a.rinde_por_dia); rend = { porDia: r2(pd), mano: true, txt: `${fN(pd)} ${un} por día con 2 (lo que dijiste)` }; }
    else if (hh > 0) { const pd = r2(2 * J / hh); rend = { porDia: pd, mano: false, txt: `≈ ${fN(Math.floor(pd * 10) / 10)} ${un} por día con 2 (${fN(2 * J)} HH ÷ ${fN(hh)} HH)` + (est.hh ? " · estimado · a confirmar" : "") }; }
    // lo que dijo la persona, tal cual (al confirmar se vuelve a armar igual, con lo mismo estimado)
    const entrada = {}; ["nombre", "descripcion", "unidad", "fase", "hh", "minutos", "personas", "factores", "puntos", "pasos", "fotos", "item", "parte", "rubroAvance", "rinde"].forEach((q) => { const v = q === "nombre" ? label : q === "minutos" ? (a.minutos != null ? a.minutos : a.minutos_por_unidad) : q === "rinde" ? (a.rinde != null ? a.rinde : a.rinde_por_dia) : q === "unidad" ? (a.unidad != null ? a.unidad : a.un) : a[q]; if (v != null && v !== "") entrada[q] = v; });
    return {
      ok: true, editar: editK || "", label, desc, un, q: u.q || "", cat, fase, hh, hhTxt, hhFuente, f, fEst, dif, difTxt, ptsForm, pts, ptsMano, cuenta, parecidas, justo, avisos, pasos, fotos, item, itemParecida: itPar ? { k: itPar.k, label: itPar.label, items: arr(metaDe(itPar.k).items).slice(0, 6) } : null,
      grupos, noAvanza, av, rend, est, preguntar, entrada
    };
  }

  // ===================================================================== tarjeta / resumen (lo usan el asistente y la pantalla)
  const tag = (b) => (b ? ' <span class="tn2-est">estimado · a confirmar</span>' : "");
  function tarjetaHtml(T) {
    if (!T || !T.ok) return "";
    const parT = T.parecidas.length ? `<div class="tn2-par">${T.parecidas.map((p) => `<div class="tn2-pf"><span class="tn2-pn">${esc(p.label)}</span><span class="tn2-pv">${fN(p.hh)} HH${p.hhMed > 0 ? ` (medido ${fN(p.hhMed)})` : ""} × ${fN(p.dif)} = ${fN(p.pts)} pts/${esc(p.un)} · <b>${fN(p.ptsH)} pts/h</b></span></div>`).join("")}<div class="tn2-pf tn2-esta"><span class="tn2-pn">Esta</span><span class="tn2-pv">${fN(T.hh)} HH × ${fN(T.dif)} = ${fN(T.pts)} pts/${esc(T.un)} · <b>${fN(T.justo.ptsH)} pts/h</b></span></div></div><div class="tn2-justo ${T.justo.ok ? "ok" : "mal"}" role="status">${T.justo.ok ? "⚖ " : "⚠ "}${esc(T.justo.txt)}</div>` : `<div class="tn2-justo">No encontré tareas parecidas para comparar.</div>`;
    const fac = FAC.map((x) => `<span class="tn2-fac${T.f[x.k] ? " on" : ""}">${T.f[x.k] ? "✓" : "✗"} ${esc(x.t)}</span>`).join("");
    const fotos = T.fotos.porUnidad ? esc(T.fotos.ayuda) + " (una foto por " + esc(T.un) + ")" : T.fotos.tomas.map((x) => esc(x.t) + (x.oblig ? "" : " (opcional)")).join(" · ");
    return `<div class="tn2-card">
<div class="tn2-sec"><div class="tn2-st">🧮 Cómo salen los puntos</div><div class="tn2-cuenta">${esc(T.cuenta)}${T.ptsMano ? ` <span class="tn2-est">a mano: ${fN(T.pts)} pts</span>` : ""}</div>
<div class="tn2-l">⏱ ${esc(T.hhTxt || "Faltan las horas")}${tag(T.est.hh)}</div><div class="tn2-l">📈 ${esc(T.difTxt)}${tag(T.est.f)}</div><div class="tn2-facs">${fac}</div></div>
<div class="tn2-sec"><div class="tn2-st">⚖ Comparada con las parecidas</div>${parT}</div>
<div class="tn2-sec"><div class="tn2-st">📋 Pasos${tag(T.est.pasos)}</div><div class="tn2-l tn2-pre">${esc(T.pasos)}</div></div>
<div class="tn2-sec"><div class="tn2-st">📷 Fotos que pide${tag(T.est.fotos)}</div><div class="tn2-l">${fotos}</div></div>
<div class="tn2-sec"><div class="tn2-st">🧾 Itemizado (lo que se cobra)</div><div class="tn2-l">${T.item ? `Ítem ${esc(T.item.item)} · ${esc(String(T.item.desc).slice(0, 90))} · parte ${fN(T.item.parte * 100, 0)} %${tag(T.est.parte)}` : "No mueve el itemizado (da puntos y marca el avance de obra)." + (T.itemParecida ? ` La parecida «${esc(T.itemParecida.label)}» mueve el ítem ${esc(T.itemParecida.items.join(", "))}: decí si esta también.` : "")}</div></div>
<div class="tn2-sec"><div class="tn2-st">📊 Avance de obra</div><div class="tn2-l">${esc(T.av.txt)}${tag(T.est.av)}</div></div>
<div class="tn2-sec"><div class="tn2-st">📅 Orden sugerida</div><div class="tn2-l">${T.rend ? esc(T.rend.txt) : "Sin rendimiento (faltan las horas)."}</div></div>
<div class="tn2-l tn2-meta">Fase: ${esc(T.fase)}${tag(T.est.fase)} · se mide en ${esc(T.un)}${tag(T.est.un)}</div>
</div>`;
  }

  // ===================================================================== permisos
  function puede() {
    try {
      if (window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()) return false;
      if (!window.PERMISOS) return true;
      const y = PERMISOS.yo ? PERMISOS.yo() : null, rol = y && y.rol;
      if (["cuadrilla", "operario", "mirar", "panol", "direccion"].indexOf(rol) >= 0) return false;
      return PERMISOS.permiso("produccion") === "editar";
    } catch (e) { return false; }
  }
  const NO_PUEDE = "Tu usuario no puede crear ni cambiar tareas (hace falta «editar» en Producción: Administración u Oficina).";

  // ===================================================================== guardar
  function t159Desde(T, base) {
    const ts = Date.now();
    return Object.assign({}, base || {}, {
      v: 159, desc: T.desc, hh: T.hh, f: T.f, dif: T.dif, ptsForm: T.ptsForm, ptsMano: T.ptsMano, cuenta: T.cuenta, hhTxt: T.hhTxt, hhFuente: T.hhFuente,
      est: T.est, parecidas: T.parecidas.map((p) => ({ k: p.k, label: p.label, hh: p.hh, dif: p.dif, pts: p.pts, ptsH: p.ptsH })), justo: { ok: T.justo.ok, txt: T.justo.txt },
      grupos: T.grupos, noAvanza: T.noAvanza, item: T.item, av: T.av.tipo ? { tipo: T.av.tipo, paso: T.av.paso || "", r: T.av.r || "", q: T.av.q || "" } : null,
      fotos: T.fotos, cat: T.cat, rend: T.rend, entrada: T.entrada, editadoTs: base ? ts : 0
    });
  }
  async function guardarExtra(extra) {
    const B = BI(); if (!B) throw new Error("sin baremo");
    await B.guardar(extra || {});
    try { const n = window.__baremoNube = window.__baremoNube || {}; if (extra && extra.hist) n.hist = extra.hist; n.tareasPropias = B.S(); n.baremo = Object.assign({}, n.baremo || {}, B.h()); if (extra && extra.sugerida && extra.sugerida.rend) { n.sugerida = Object.assign({}, n.sugerida || {}); n.sugerida.rend = Object.assign({}, n.sugerida.rend || {}, extra.sugerida.rend); } } catch (e) { }
  }
  const histMas = (e) => arr(nube().hist).concat([e]).slice(-300);
  const rendExtra = (k, T, motivo, porAsistente) => (T.rend && T.rend.mano ? { sugerida: { rend: { [k]: { modo: "mano", mano: T.rend.porDia, motivo: String(motivo || "").slice(0, 200), porAsistente: !!porAsistente } } } } : {});
  function refrescar() { intentar(() => window.__av2 && window.__av2.refrescar(), null); pintarLista(); }
  async function crear(T0, motivo, op) {
    op = op || {};
    if (!puede()) return { ok: false, txt: NO_PUEDE };
    const T = proponer(T0 && T0.entrada ? T0.entrada : T0);
    if (T.err) return { ok: false, txt: T.err };
    if (!(T.hh > 0)) return { ok: false, txt: "Faltan las horas-hombre por unidad: sin eso no hay puntos." };
    const mot = String(motivo || "").trim() || (op.porAsistente ? `Tarea nueva pedida al asistente${T.desc ? ": " + T.desc : ""}` : "");
    if (mot.length < 3) return { ok: false, txt: "Falta el motivo (queda en el historial del baremo)." };
    if (typeof window.registrarTareasNuevas != "function" || !BI()) return { ok: false, txt: "No se pudo crear (recargá la app)." };
    const t159 = t159Desde(T); t159.creado = { ts: Date.now(), por: yoMail(), porNombre: yoNombre(), motivo: mot, porAsistente: !!op.porAsistente };
    let r;
    try { r = await window.registrarTareasNuevas([{ label: T.label, un: T.un, pts: T.pts, pasos: T.pasos, fase: T.fase, hh: T.hh, f: T.f, t159 }]); }
    catch (e) { return { ok: false, txt: e && e.code === "permission-denied" ? "🔒 Tu usuario no puede guardar el baremo." : "⚠ No se pudo guardar (revisá la conexión)." }; }
    const x = arr(r)[0] || {};
    if (!x.nueva) return { ok: false, txt: `Ya había una tarea «${T.label}».` };
    const k = x.id, h = { ts: Date.now(), por: yoMail(), porNombre: yoNombre(), k, tarea: T.label, antes: 0, despues: T.pts, motivo: mot.slice(0, 300), porAsistente: !!op.porAsistente, tipo: "nueva", cuenta: T.cuenta };
    let aviso = "";
    try { await guardarExtra(Object.assign({ hist: histMas(h) }, rendExtra(k, T, mot, op.porAsistente))); } catch (e) { aviso = " (el historial no se pudo guardar: revisá la conexión)"; }
    try { window.fbAuditar && window.fbAuditar("tarea_nueva", `${T.label}: ${T.cuenta}${T.ptsMano ? " · a mano " + fN(T.pts) : ""} · ${mot}`.slice(0, 480), { ref: k, motivo: mot, porAsistente: !!op.porAsistente, pts: T.pts, hh: T.hh, dif: T.dif }); } catch (e) { }
    refrescar();
    return { ok: true, id: k, T, txt: `✅ Creada «${T.label}»: ${fN(T.pts)} pts por ${T.un} (${T.cuenta}). Ya aparece en Llenar orden${T.av.tipo ? ", en el avance de obra" : ""} y en la orden sugerida.${aviso}` };
  }
  function entradaDe(p) {
    if (p.t159 && p.t159.entrada) return Object.assign({}, p.t159.entrada, { nombre: p.label, unidad: p.un, pasos: p.pasos || p.t159.entrada.pasos, fase: p.fase || p.t159.entrada.fase });
    return { nombre: p.label, unidad: p.un, hh: num(p.hh) || null, factores: obj(p.f), puntos: num(p.hh) > 0 && Math.abs(ptsDe(p.hh, difDe(p.f)) - num(p.pts)) > 1e-9 ? num(p.pts) : null, pasos: p.pasos || "", fase: p.fase || "", rubroAvance: "" };
  }
  function planEditar(k, cambios, motivo) {
    const p = propiaDe(k); if (!p) return { err: "Esa tarea no la creó el equipo: es del diccionario. Para cambiar lo que vale usá «Cuánto vale cada tarea» (con motivo)." };
    const e0 = entradaDe(p), c = {}; Object.keys(cambios || {}).forEach((q) => { if (cambios[q] !== undefined) c[q === "minutos_por_unidad" ? "minutos" : q === "rinde_por_dia" ? "rinde" : q] = cambios[q]; });
    const e1 = Object.assign({}, e0, c);
    if ((c.minutos != null || c.personas != null) && c.hh == null) delete e1.hh;
    if (c.hh != null && c.minutos == null) { delete e1.minutos; delete e1.personas; }
    if (c.factores && typeof c.factores == "object" && !Array.isArray(c.factores)) e1.factores = Object.assign({}, Object.assign({}, p.f || {}, obj(e0.factores)), c.factores);
    if (!("puntos" in c) && (c.hh != null || c.minutos != null || c.personas != null || c.factores)) delete e1.puntos;   // cambian las horas o la dificultad: se recalcula
    const T = proponer(e1, { editar: k }); if (T.err) return T;
    if (!(T.hh > 0)) return { err: "Faltan las horas-hombre por unidad." };
    if (!String(motivo || "").trim()) return { err: "Falta el motivo: preguntale por qué la cambia (queda en el historial). No lo inventes." };
    const filas = [];
    const f = (cc, a, d) => { if (String(a) !== String(d)) filas.push({ c: cc, a, d }); };
    f("Nombre", p.label, T.label); f("Se mide en", p.un, T.un); f("Fase", p.fase || "—", T.fase); f("Horas-hombre", fN(p.hh), fN(T.hh)); f("Dificultad", fN(difDe(p.f)), fN(T.dif)); f("Puntos por unidad", fN(p.pts), fN(T.pts));
    if (String(p.pasos || "").trim() !== String(T.pasos).trim()) filas.push({ c: "Pasos", a: "(los de antes)", d: "(nuevos)" });
    const av0 = p.t159 && p.t159.av ? (p.t159.av.paso || p.t159.av.r) : "—", av1 = T.av.tipo ? (T.av.paso || T.av.r) : "—"; f("Avance de obra", av0, av1);
    const it0 = p.t159 && p.t159.item ? p.t159.item.item : "—", it1 = T.item ? T.item.item : "—"; f("Ítem", it0, it1);
    return { ok: true, k, p, T, filas, motivo: String(motivo).trim().slice(0, 300), titulo: `✏ Cambiar «${p.label}»`, sub: "Producción › Cuánto vale cada tarea", avisos: T.avisos.concat(Math.abs(num(p.pts) - T.pts) > 1e-9 ? ["Vale desde ahora: las órdenes ya cerradas guardan sus puntos."] : []) };
  }
  async function editar(k, cambios, motivo, op) {
    op = op || {};
    if (!puede()) return { ok: false, txt: NO_PUEDE };
    const P = planEditar(k, cambios, motivo); if (P.err) return { ok: false, txt: P.err };
    if (!P.filas.length) return { ok: false, txt: "No cambia nada." };
    const B = BI(); if (!B) return { ok: false, txt: "No se pudo guardar (recargá la app)." };
    const p = P.p, T = P.T, viejo = JSON.parse(JSON.stringify(p)), antes = num(p.pts);
    Object.assign(p, { label: T.label, un: T.un, pts: T.pts, pasos: T.pasos, fase: T.fase, hh: T.hh, f: T.f, t159: t159Desde(T, p.t159 || { creado: { ts: 0, por: "", porNombre: "", motivo: "creada antes de la v159" } }) });
    const h0 = B.h(); h0[k] = Object.assign({}, h0[k] || {}, { un: T.un, pts: T.pts });
    B.aplicar();
    const he = { ts: Date.now(), por: yoMail(), porNombre: yoNombre(), k, tarea: T.label, antes, despues: T.pts, motivo: P.motivo, porAsistente: !!op.porAsistente, tipo: "editar", cambios: P.filas.map((x) => `${x.c}: ${x.a} → ${x.d}`).slice(0, 12) };
    try { await guardarExtra(Object.assign({ hist: histMas(he) }, rendExtra(k, T, P.motivo, op.porAsistente))); }
    catch (e) { Object.keys(p).forEach((q) => { delete p[q]; }); Object.assign(p, viejo); h0[k] = { un: viejo.un, pts: viejo.pts }; B.aplicar(); return { ok: false, txt: e && e.code === "permission-denied" ? "🔒 Tu usuario no puede guardar el baremo." : "⚠ No se pudo guardar (revisá la conexión)." }; }
    try { window.fbAuditar && window.fbAuditar("tarea_editar", `${T.label}: ${he.cambios.join(" · ")} · ${P.motivo}`.slice(0, 480), { ref: k, motivo: P.motivo, porAsistente: !!op.porAsistente }); } catch (e) { }
    refrescar();
    return { ok: true, id: k, T, txt: `✅ «${T.label}» quedó así: ${fN(T.pts)} pts por ${T.un} (${T.cuenta}). Las órdenes cerradas no cambian.` };
  }
  async function baja(k, motivo, op) {
    op = op || {};
    if (!puede()) return { ok: false, txt: NO_PUEDE };
    const p = propiaDe(k); if (!p) return { ok: false, txt: "Solo se dan de baja las tareas que creó el equipo." };
    const alta = !!op.reactivar, mot = String(motivo || "").trim();
    if (mot.length < 3) return { ok: false, txt: "Falta el motivo." };
    const B = BI(); if (!B) return { ok: false, txt: "No se pudo guardar (recargá la app)." };
    const viejo = JSON.parse(JSON.stringify(p.t159 || null));
    p.t159 = Object.assign({}, p.t159 || { v: 159, entrada: entradaDe(p), creado: { ts: 0, motivo: "creada antes de la v159" } }, { baja: !alta, bajaTs: Date.now(), bajaPor: yoNombre(), bajaMotivo: mot });
    B.aplicar();
    const he = { ts: Date.now(), por: yoMail(), porNombre: yoNombre(), k, tarea: p.label, antes: num(p.pts), despues: num(p.pts), motivo: mot.slice(0, 300), porAsistente: !!op.porAsistente, tipo: alta ? "alta" : "baja" };
    try { await guardarExtra({ hist: histMas(he) }); } catch (e) { p.t159 = viejo; if (!viejo) delete p.t159; B.aplicar(); return { ok: false, txt: "⚠ No se pudo guardar (revisá la conexión)." }; }
    try { window.fbAuditar && window.fbAuditar(alta ? "tarea_alta" : "tarea_baja", `${p.label} · ${mot}`.slice(0, 480), { ref: k, motivo: mot, porAsistente: !!op.porAsistente }); } catch (e) { }
    refrescar();
    return { ok: true, id: k, txt: alta ? `✅ «${p.label}» vuelve a aparecer en Llenar orden.` : `✅ «${p.label}» dada de baja: no aparece más en Llenar orden ni en la sugerida. Las órdenes que ya la tienen siguen andando.` };
  }

  // ===================================================================== lo que se engancha en el resto de la app
  let TOMAS = null;
  // al final de M() del baremo (cada vez que se aplican las tareas propias)
  window.__tn2Aplicar = function (S) {
    const meta = intentar(() => TAREA_META, null), DI = window.__DICC_ID || {}, AV = intentar(() => window.__av2.TAREA_AV, null), nb = obj(nube().baremo), h = baremo();
    if (!TOMAS) TOMAS = window.__TAREAS_TOMAS || null;
    arr(S).forEach((p) => {
      if (!p || !p.t159) return; const t = p.t159, k = p.id;
      if (nb[k] && num(nb[k].pts) !== num(p.pts) && num(obj(nube()).ts) > num(t.editadoTs || (t.creado || {}).ts)) { p.pts = num(nb[k].pts); if (h[k]) h[k].pts = p.pts; }   // cambiado en «Cuánto vale cada tarea» (v154)
      if (meta) meta[k] = { fase: t.baja ? "Tareas dadas de baja (para órdenes de antes)" : (p.fase || "Varios"), etapas: [], items: t.noAvanza || !t.grupos ? [] : [].concat.apply([], arr(t.grupos).map((g) => arr(g.items))), grupos: t.noAvanza ? null : t.grupos || null, noAvanza: !!t.noAvanza || !t.grupos, dicc: true, t159: true };
      if (DI[k]) Object.assign(DI[k], { fase: p.fase, grupos: t.grupos || null, noAvanza: !!t.noAvanza || !t.grupos, f: obj(p.f), t159: true });
      if (AV) { if (t.av && t.av.tipo === "paso" && !t.baja) AV[k] = [t.av.paso]; else delete AV[k]; }
      if (TOMAS && t.fotos) { if (t.fotos.porUnidad) TOMAS[k] = { ayuda: t.fotos.ayuda }; else TOMAS[k] = { tomas: arr(t.fotos.tomas).map((x) => ({ t: x.t, a: x.a || "", oblig: x.oblig !== false })) }; }
    });
    intentar(() => window.__av2 && window.__av2.refrescar(), null);
    pintarLista();
  };
  // el avance nuevo: las cosas que agregan las tareas nuevas (una por columna, por caja… o una vez por obra)
  window.__av2Glob = function () { return activas().filter((p) => p.t159.av && p.t159.av.tipo === "cosa").map((p) => ({ k: p.id, label: p.label, r: p.t159.av.r, q: p.t159.av.q || "bin", un: p.un, hh: num(p.hh) })); };
  // la categoría de las fotos (Modo obra: una por columna si la unidad es columna, aunque el nombre no lo diga)
  (function () {
    const o = window.catFotoDeTarea; if (typeof o != "function" || o.__tn2) return;
    const n = function (label) { const p = activas().concat(nuevas()).find((x) => nk(x.label) === nk(label)); if (p && p.t159.cat) return p.t159.cat; return o.apply(this, arguments); };
    window.__heredar && window.__heredar(n, o); n.__tn2 = 1; window.catFotoDeTarea = n;
  })();
  // Llenar orden: las dadas de baja no se ven (salvo que estén tildadas en una orden que se edita)
  function marcarBajas() {
    const b = {}; nuevas().forEach((p) => { if (p.t159.baja) b[p.id] = 1; });
    document.querySelectorAll("#otActividades .ot-act-check").forEach((c) => { const t = c.closest(".ot-tarea"); if (t) t.classList.toggle("tn2-baja", !!b[c.value]); });
  }
  setInterval(() => { if ($("otActividades")) marcarBajas(); }, 900);
  // la orden sugerida: las tareas nuevas con una cosa del avance cuentan «quedan N de T» con lo que dice el avance de la obra
  window.__tn2Ids = () => activas().map((p) => p.id);
  window.__tn2Dicc = (k) => { const p = t159De(k); if (!p || !(num(p.hh) > 0)) return null; const d = (window.__DICC_ID || {})[k]; return Object.assign({ id: k, label: p.label, un: p.un, fase: p.fase, f: obj(p.f), dif: difDe(p.f), pts: num(p.pts) }, d || {}, { hh: num(p.hh) }); };
  window.__tn2PorCol = (k) => { const p = t159De(k); return !!(p && !p.t159.baja && p.t159.av && (p.t159.av.q === "col" || p.t159.av.tipo === "paso")); };
  window.__tn2T = function (o, T) {
    const ls = activas().filter((p) => p.t159.av && p.t159.av.tipo === "cosa"); if (!ls.length || !window.__av2) return T;
    const E = intentar(() => window.__av2.estado(o), null); if (!E) return T;
    const T2 = Object.assign({}, T);
    let D = null; try { D = window.__hecho ? window.__hecho.deObra(o.id) : null; } catch (e) { D = null; }
    ls.forEach((p) => {
      if (T2[p.id] && num(T2[p.id].total) > 0) return;   // si la tarea mueve un ítem, manda el saldo de siempre
      const c = E.L.cosas.find((x) => x.id === "t_" + p.id), r = E.RC["t_" + p.id]; if (!c || !r || r.estado === "nolleva") return;
      const asig = D && D.T && D.T[p.id] ? arr(D.T[p.id].asig).reduce((s, a) => s + num(a.cant), 0) : 0;
      T2[p.id] = { total: c.tot, hecho: r.h, asignado: asig, queda: Math.max(0, r2(c.tot - r.h - asig)), un: p.un, tn2: true };
    });
    return T2;
  };
  // el auditor de puntos (v154): de dónde sale el valor de una tarea creada con la calculadora
  function fuenteValor(k) {
    const p = t159De(k); if (!p) return null;
    const t = p.t159, c = t.creado || {}, ult = arr(nube().hist).filter((h) => h && h.k === k && h.tipo !== "nueva" && h.tipo !== "peso").sort((a, b) => (+b.ts || 0) - (+a.ts || 0))[0] || null;
    const estim = [t.est && t.est.hh ? "las horas" : "", t.est && t.est.f ? "la dificultad" : ""].filter(Boolean);
    let texto = `tarea creada${c.ts ? " el " + fTs(c.ts) : ""}${c.porNombre ? " por " + c.porNombre : ""}${c.porAsistente ? " con el asistente" : ""} con la fórmula de siempre (puntos = HH × D): ${t.cuenta || fN(p.hh) + " HH × " + fN(difDe(p.f))}` + (t.ptsMano ? ` y puesta a mano en ${fN(t.entrada && t.entrada.puntos != null ? t.entrada.puntos : p.pts)}` : "") + (t.hhTxt ? ` · horas: ${t.hhTxt}` : "") + (estim.length ? ` · ${estim.join(" y ")}: estimado · a confirmar` : "") + ` · motivo: ${c.motivo ? "«" + c.motivo + "»" : "sin motivo anotado"}`;
    if (ult) texto += ` · último cambio el ${fTs(ult.ts)} por ${ult.porNombre || ult.por || "?"}: ${fN(ult.antes)} → ${fN(ult.despues)} (motivo: ${ult.motivo ? "«" + ult.motivo + "»" : "sin motivo anotado"})`;
    if (t.baja) texto += " · hoy está dada de baja";
    return { fuente: "tareaNueva", texto, cuenta: t.cuenta, vale: num(p.pts) };
  }

  // ===================================================================== a mano: Producción › «＋ Crear tarea» con la calculadora
  const st = { editar: "", ultimo: null, t: 0 };
  function leer() {
    const v = (id) => String(($(id) || {}).value || "").trim(), f = {};
    document.querySelectorAll("#tnCard [data-tn2f]").forEach((x) => { f[x.dataset.tn2f] = x.checked; });
    return { nombre: v("tn2Nom"), descripcion: v("tn2Desc"), unidad: v("tn2Un"), fase: v("tn2Fase"), hh: v("tn2Hh") ? num(v("tn2Hh")) : null, minutos: v("tn2Min") ? num(v("tn2Min")) : null, personas: v("tn2Per") ? num(v("tn2Per")) : null, factores: f, puntos: v("tn2Pts") !== "" ? num(v("tn2Pts")) : null, pasos: v("tn2Pasos"), fotos: v("tn2Fotos"), item: v("tn2Item"), parte: v("tn2Parte") ? num(v("tn2Parte")) : null, rubroAvance: v("tn2Av"), rinde: v("tn2Rend") ? num(v("tn2Rend")) : null };
  }
  function opcionesAv() {
    return `<option value="">Que lo elija la app (por la unidad)</option><option value="ninguno">No marca nada</option><optgroup label="Un paso de cada columna (la grilla)">${PASOS_AV().map((p) => `<option value="${esc(p.id)}">${esc(p.l)}</option>`).join("")}</optgroup><optgroup label="Una cosa nueva del rubro">${RUBS_AV().map((r) => `<option value="${esc(r[0])}">${esc(r[1])}</option>`).join("")}</optgroup>`;
  }
  function opcionesItem() { const l = intentar(() => window.epecItemizado().filter((a) => !(window.epecEsEventualidad && window.epecEsEventualidad(a.id))), []); return `<option value="">Ninguno (no mueve lo que se cobra)</option>${l.map((a) => `<option value="${esc(a.id)}">Ítem ${esc(a.id)} · ${esc(String(a.desc || intentar(() => window.epecItemDesc(a.id), "")).slice(0, 70))}</option>`).join("")}`; }
  function formHtml() {
    const fases = intentar(() => FASES_TAREA.slice(), ["Varios"]);
    return `<div class="tn2" data-tn2="1">
<h2 style="margin:0 0 8px;"><span class="dot"></span>¿Cómo se suman los puntos? · ＋ Crear tarea</h2>
<div class="tn-como"><b>1 punto = 1 hora-hombre de trabajo bien hecho.</b> <b>Puntos por unidad = horas-hombre × dificultad (D)</b>. D arranca en <b>1</b> y suma <b>0,2</b> por cada cosa que tiene la tarea (como mucho <b>1,8</b>). El tiempo es fijo: si se tarda más, vale lo mismo. La app la compara con las parecidas para que sea justa.</div>
<div id="tn2Modo" class="tn2-modo" role="status"></div>
<div class="tn2-grid">
<label class="tn2-w">Nombre de la tarea (una sola acción, clara)<input type="text" id="tn2Nom" placeholder="Ej.: Pintura de bases de columna" autocomplete="off"></label>
<label class="tn2-w">Qué es / cómo se hace (para buscar las parecidas)<input type="text" id="tn2Desc" placeholder="Ej.: pintar con esmalte la base de cada columna"></label>
<label>Se mide en<input type="text" id="tn2Un" list="tn2UnL" placeholder="columna, metro, tablero…"><datalist id="tn2UnL">${UN_LISTA.map((u) => `<option value="${u}">`).join("")}</datalist></label>
<label>Fase<select id="tn2Fase"><option value="">Que la elija la app</option>${fases.map((f) => `<option>${esc(f)}</option>`).join("")}</select></label>
<label>Horas-hombre por unidad<input type="number" id="tn2Hh" min="0" step="0.05" inputmode="decimal" placeholder="Ej.: 1"></label>
<div class="tn2-mp"><label>o minutos por unidad<input type="number" id="tn2Min" min="0" step="1" inputmode="numeric" placeholder="30"></label><span>×</span><label>personas<input type="number" id="tn2Per" min="1" step="1" inputmode="numeric" placeholder="2"></label></div>
</div>
<div class="tn2-fs">${FAC.map((x) => `<label class="tn2-fl"><input type="checkbox" data-tn2f="${x.k}"><span><b>${esc(x.t)}</b><small>${esc(x.d)}</small></span></label>`).join("")}</div>
<div class="tn2-res" id="tn2Res">Poné el nombre y las horas (o los minutos × personas).</div>
<div id="tn2Avisos" class="tn2-avisos" role="status" aria-live="polite"></div>
<div id="tn2Par"></div>
<div class="tn2-grid">
<label>Puntos a mano (si no querés los de la fórmula)<input type="number" id="tn2Pts" min="0" step="0.05" inputmode="decimal" placeholder="los de la fórmula"></label>
<label>Rinde por día con 2 (para la orden sugerida)<input type="number" id="tn2Rend" min="0" step="0.5" inputmode="decimal" placeholder="lo calcula la app"></label>
<label class="tn2-w">Pasos (los ve la cuadrilla)<textarea id="tn2Pasos" rows="3" placeholder="Si lo dejás vacío, la app propone un borrador (a confirmar)"></textarea></label>
<label class="tn2-w">Fotos que pide (una por renglón)<textarea id="tn2Fotos" rows="2" placeholder="Ej.: la base pintada"></textarea></label>
<label class="tn2-w">¿Mueve algún ítem del itemizado (lo que se cobra)?<select id="tn2Item">${opcionesItem()}</select></label>
<label>Parte del ítem (%)<input type="number" id="tn2Parte" min="1" max="100" step="1" inputmode="numeric" placeholder="100"></label>
<label>¿Qué marca en el avance de obra?<select id="tn2Av">${opcionesAv()}</select></label>
<label class="tn2-w">Motivo (queda en el historial)<input type="text" id="tn2Mot" placeholder="Ej.: la pide la Municipalidad en las plazas nuevas"></label>
</div>
<div class="tn-acc"><button type="button" class="btn-primary" id="tn2Crear">＋ Crear la tarea</button><button type="button" class="btn-ghost" id="tn2Cancelar" style="display:none">Cancelar el cambio</button><span class="hint" id="tn2Msg" role="status" style="margin:0;"></span></div>
<div id="tn2Lista"></div>
</div>`;
  }
  function poner() {
    const c = $("tnCard"); if (!c || c.querySelector("[data-tn2]")) return;
    c.innerHTML = formHtml(); c.classList.add("tn2-on"); calc(); pintarLista();
  }
  function calc() {
    const r = $("tn2Res"); if (!r) return;
    const a = leer();
    document.querySelectorAll("#tnCard .tn2-fl").forEach((l) => { const i = l.querySelector("input"); l.classList.toggle("on", !!(i && i.checked)); });
    if (!a.nombre) { r.innerHTML = "Poné el nombre y las horas (o los minutos × personas)."; $("tn2Par").innerHTML = ""; $("tn2Avisos").textContent = ""; st.ultimo = null; return; }
    const T = proponer(a, { editar: st.editar });
    st.ultimo = T;
    if (T.err) { r.innerHTML = `<span class="tn2-mal">${esc(T.err)}</span>`; $("tn2Par").innerHTML = ""; $("tn2Avisos").textContent = ""; return; }
    r.innerHTML = T.hh > 0 ? `<div class="tn2-cuenta">${esc(T.cuenta)}${T.ptsMano ? ` · <b>a mano: ${fN(T.pts)} pts</b>` : ""}</div><div class="tn2-l">⏱ ${esc(T.hhTxt)}</div><div class="tn2-l">📈 ${esc(T.difTxt)}</div>` : `<span class="tn2-mal">${esc(T.preguntar[0] || "Faltan las horas")}</span>`;
    $("tn2Avisos").innerHTML = T.avisos.length ? T.avisos.map((x) => `<div>⚠ ${esc(x)}</div>`).join("") : "";
    $("tn2Par").innerHTML = tarjetaHtml(T);
  }
  function msg(t, mal) { const m = $("tn2Msg"); if (m) { m.style.color = mal ? "var(--danger)" : "var(--text-soft)"; m.textContent = t; } }
  function hoja(T, editP) {
    cerrarHoja();
    const d = document.createElement("div"); d.id = "tn2Ov"; d.className = "v7-ov tn2-ov"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true");
    const filas = editP ? editP.filas.map((x) => `<div class="tn2-cb"><span>${esc(x.c)}</span><s>${esc(x.a)}</s> → <b>${esc(x.d)}</b></div>`).join("") : "";
    d.innerHTML = `<div class="tn2-hoja"><div class="tn2-hc"><b>${editP ? "✏ ¿Cambiar «" + esc(editP.p.label) + "»?" : "🆕 ¿Crear «" + esc(T.label) + "»?"}</b><button type="button" class="v7-x" data-tn2="x" aria-label="Cerrar">✕</button></div>
<div class="tn2-hb">${filas}${tarjetaHtml(T)}${T.avisos.length ? `<div class="tn2-avisos" role="status">${T.avisos.map((x) => "⚠ " + esc(x)).join("<br>")}</div>` : ""}<div class="tn2-l">La ve todo el equipo, aparece para tildar en las órdenes y queda en el historial del baremo con el motivo.</div></div>
<div class="tn2-hp"><button type="button" class="btn-primary" data-tn2="si">${editP ? "Sí, cambiarla" : "Sí, crearla"}</button><button type="button" class="btn-ghost" data-tn2="x">No</button></div><div class="tn2-hmsg" role="status" aria-live="polite"></div></div>`;
    document.body.appendChild(d);
    d.addEventListener("click", (e) => { if (e.target === d) cerrarHoja(); });
  }
  function cerrarHoja() { const d = $("tn2Ov"); d && d.remove(); }
  async function confirmar() {
    const T = st.ultimo, mot = String(($("tn2Mot") || {}).value || "").trim(), m = document.querySelector("#tn2Ov .tn2-hmsg");
    const btn = document.querySelector('#tn2Ov [data-tn2="si"]'); if (btn) btn.disabled = true;
    const r = st.editar ? await editar(st.editar, T.entrada, mot) : await crear(T, mot);
    if (btn) btn.disabled = false;
    if (!r.ok) { if (m) { m.style.color = "var(--danger)"; m.textContent = r.txt; } return; }
    cerrarHoja(); msg(r.txt); limpiar();
  }
  function limpiar() {
    st.editar = ""; ["tn2Nom", "tn2Desc", "tn2Un", "tn2Hh", "tn2Min", "tn2Per", "tn2Pts", "tn2Rend", "tn2Pasos", "tn2Fotos", "tn2Parte", "tn2Mot"].forEach((id) => { const e = $(id); e && (e.value = ""); });
    ["tn2Fase", "tn2Item", "tn2Av"].forEach((id) => { const e = $(id); e && (e.value = ""); });
    document.querySelectorAll("#tnCard [data-tn2f]").forEach((x) => { x.checked = false; });
    const b = $("tn2Crear"); b && (b.textContent = "＋ Crear la tarea"); const c = $("tn2Cancelar"); c && (c.style.display = "none"); const mo = $("tn2Modo"); mo && (mo.textContent = "");
    calc();
  }
  function cargarEdicion(k) {
    const p = propiaDe(k); if (!p) return;
    poner(); st.editar = k;
    const e = entradaDe(p), set = (id, v) => { const x = $(id); if (x) x.value = v == null ? "" : v; };
    set("tn2Nom", p.label); set("tn2Desc", e.descripcion || ""); set("tn2Un", p.un); set("tn2Fase", p.fase || ""); set("tn2Hh", num(p.hh) || ""); set("tn2Min", ""); set("tn2Per", "");
    set("tn2Pts", e.puntos != null ? e.puntos : ""); set("tn2Rend", e.rinde || ""); const t9 = p.t159 || {}; set("tn2Pasos", p.pasos || ""); set("tn2Fotos", Array.isArray(e.fotos) ? e.fotos.join("\n") : e.fotos || ""); set("tn2Item", t9.item ? t9.item.item : e.item || ""); set("tn2Parte", t9.item ? Math.round(t9.item.parte * 100) : ""); set("tn2Av", t9.av ? t9.av.paso || t9.av.r : t9.v ? "ninguno" : ""); set("tn2Mot", "");
    document.querySelectorAll("#tnCard [data-tn2f]").forEach((x) => { x.checked = !!obj(p.f)[x.dataset.tn2f]; });
    const b = $("tn2Crear"); b && (b.textContent = "Guardar el cambio"); const c = $("tn2Cancelar"); c && (c.style.display = "");
    const mo = $("tn2Modo"); mo && (mo.textContent = `✏ Estás cambiando «${p.label}». Escribí el motivo y tocá «Guardar el cambio».`);
    calc(); try { $("tnCard").scrollIntoView({ block: "start" }); } catch (x) { }
  }
  function pintarLista() {
    const L = $("tn2Lista"); if (!L) return;
    const ls = nuevas();
    const h = ls.length ? `<div class="tn2-st" style="margin-top:12px">Tareas creadas con la calculadora (${ls.length})</div>${ls.map((p) => `<div class="tn2-it${p.t159.baja ? " baja" : ""}"><div><b>${esc(p.label)}</b><small>${esc(p.t159.cuenta || "")} · ${fN(p.pts)} pts por ${esc(p.un)}${p.t159.baja ? " · dada de baja" : ""}</small></div><div class="tn2-ib">${p.t159.baja ? `<button type="button" class="btn-ghost" data-tn2alta="${esc(p.id)}">▶ Reactivar</button>` : `<button type="button" class="btn-ghost" data-tn2edit="${esc(p.id)}">✏ Editar</button><button type="button" class="btn-ghost" data-tn2baja="${esc(p.id)}">⏸ Dar de baja</button>`}</div></div>`).join("")}` : "";
    if (L.__h !== h) { L.innerHTML = h; L.__h = h; }
  }
  function pedirMotivo(titulo, cb) {
    cerrarHoja();
    const d = document.createElement("div"); d.id = "tn2Ov"; d.className = "v7-ov tn2-ov"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true");
    d.innerHTML = `<div class="tn2-hoja"><div class="tn2-hc"><b>${esc(titulo)}</b><button type="button" class="v7-x" data-tn2="x" aria-label="Cerrar">✕</button></div><div class="tn2-hb"><label>Motivo (queda en el historial)<input type="text" id="tn2MotB" placeholder="¿Por qué?"></label></div><div class="tn2-hp"><button type="button" class="btn-primary" data-tn2="motok">Sí</button><button type="button" class="btn-ghost" data-tn2="x">No</button></div><div class="tn2-hmsg" role="status" aria-live="polite"></div></div>`;
    document.body.appendChild(d); st.cbMot = cb;
    setTimeout(() => { const i = $("tn2MotB"); i && i.focus(); }, 60);
  }
  document.addEventListener("input", (e) => { if (e.target && e.target.closest && e.target.closest("#tnCard [data-tn2]")) { clearTimeout(st.t); st.t = setTimeout(calc, 120); } });
  document.addEventListener("change", (e) => { if (e.target && e.target.closest && e.target.closest("#tnCard [data-tn2]")) calc(); });
  document.addEventListener("click", async (e) => {
    const t = e.target && e.target.closest ? e.target : null; if (!t) return;
    if (t.closest("#tn2Crear")) {
      e.preventDefault(); calc(); const T = st.ultimo;
      if (!T) return msg("Poné el nombre de la tarea.", true);
      if (T.err) return msg(T.err, true);
      if (!(T.hh > 0)) return msg("Poné las horas-hombre por unidad (o los minutos × personas).", true);
      if (!puede()) return msg(NO_PUEDE, true);
      if (String(($("tn2Mot") || {}).value || "").trim().length < 3) return msg("Escribí el motivo (queda en el historial).", true);
      let P = null; if (st.editar) { P = planEditar(st.editar, T.entrada, ($("tn2Mot") || {}).value); if (P.err) return msg(P.err, true); if (!P.filas.length) return msg("No cambia nada.", true); }
      hoja(T, P); return;
    }
    if (t.closest("#tn2Cancelar")) { e.preventDefault(); limpiar(); return; }
    const ed = t.closest("[data-tn2edit]"); if (ed) { e.preventDefault(); cargarEdicion(ed.dataset.tn2edit); return; }
    const bj = t.closest("[data-tn2baja], [data-tn2alta]");
    if (bj) { e.preventDefault(); const k = bj.dataset.tn2baja || bj.dataset.tn2alta, alta = !!bj.dataset.tn2alta, p = propiaDe(k); pedirMotivo(alta ? `¿Reactivar «${p ? p.label : ""}»?` : `¿Dar de baja «${p ? p.label : ""}»? (las órdenes viejas siguen andando)`, async (mot) => baja(k, mot, { reactivar: alta })); return; }
    const x = t.closest("#tn2Ov [data-tn2]"); if (!x) return;
    const a = x.dataset.tn2;
    if (a === "x") { e.preventDefault(); cerrarHoja(); }
    else if (a === "si") { e.preventDefault(); await confirmar(); }
    else if (a === "motok") { e.preventDefault(); const mot = String(($("tn2MotB") || {}).value || "").trim(), m = document.querySelector("#tn2Ov .tn2-hmsg"); if (mot.length < 3) { if (m) { m.style.color = "var(--danger)"; m.textContent = "Escribí el motivo."; } return; } const r = await st.cbMot(mot); if (!r.ok) { if (m) { m.style.color = "var(--danger)"; m.textContent = r.txt; } return; } cerrarHoja(); msg(r.txt); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("tn2Ov")) cerrarHoja(); });
  // el ✏ de la tabla de tareas (abrirEditorTarea) para las creadas con la calculadora: el mismo camino, con motivo
  (function envolverEditor() {
    const o = window.abrirEditorTarea; if (typeof o != "function") return setTimeout(envolverEditor, 800);
    if (o.__tn2) return;
    const n = function (k) { if (k && t159De(k)) { cargarEdicion(k); return; } return o.apply(this, arguments); };
    window.__heredar && window.__heredar(n, o); n.__tn2 = 1; window.abrirEditorTarea = n;
  })();
  setInterval(() => { const P = $("prodPanelBaremo"); if (P && P.offsetParent !== null) poner(); }, 1000);
  // el asistente: «Cambiar algo» de la tarjeta
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest ? e.target.closest("[data-tn2cambiar]") : null; if (!b) return;
    e.preventDefault(); const i = $("iaTxt"); const c = b.closest(".ia-conf"), m = c && c.querySelector(".ia-conf-msg");
    if (m) m.textContent = "Decime qué cambio (las horas, la dificultad, la unidad, los pasos, las fotos, el ítem…) y te la vuelvo a armar.";
    if (i) { i.placeholder = "¿Qué cambio? (horas, dificultad, unidad, pasos, fotos…)"; i.focus(); }
  });

  window.__tareaNueva2 = { proponer, crear, editar, planEditar, baja, tarjetaHtml, fuenteValor, puede, difDe, ptsDe, FAC, nuevas, activas, propiaDe, poner, calc, leer, cargarEdicion, JUSTO_MAX, JUSTO_MIN };
})();
