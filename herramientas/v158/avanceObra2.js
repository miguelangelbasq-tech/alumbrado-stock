(function () {
  "use strict";
  // v158 · Avance de obra nuevo: detallado por rubro y por columna, se mueve solo con las órdenes (Ángel, 15/11: «la A con la
  //  grilla de la C adentro… El % de la obra es el avance de la obra. Lo principal es que nosotros podamos editarlo: desde el
  //  avance de obra marcamos se hizo / no se hizo. Pero cuando se tiene que mover el avance de obra es según las órdenes de
  //  trabajo… Si puse que hoy van a ser 5 columnas y hicieron 5 columnas, se mueve… Lo mismo con las fallas.»).
  //  · Qué lleva la obra: las columnas (cálculo / legajo / itemizado) con sus pasos y piezas, más lo que no va por columna
  //    (civil, cableado, PAT, tablero, pruebas y cierre), del cálculo + el itemizado contratado; «No lleva» y «＋ Agregar».
  //  · Estado de cada cosa, de memoria: las órdenes (pasos de Modo obra, fotos con su columna, marcas de Mis tareas, el cierre)
  //    → hecho (orden cerrada o «✅ Está bien») / en revisión (mandado sin cerrar); lo que dice «5 columnas» sin decir cuáles va
  //    a las siguientes que faltan («sin columna exacta»); falla («Se arruinó», o «no se hizo» con motivo de falla de una orden),
  //    observado, le falta una pieza, fraguando, no lleva; lo marcado a mano (avanceObras.av2.m, con motivo e historial).
  //  · % = horas-hombre del diccionario v108 de cada cosa (a confirmar); es el % que muestra la app en todos lados
  //    (calcularAvanceEtapasPct); el del itemizado queda para la plata (certificación, módulos K) y en «🧾 Ver itemizado».
  //  · Nada se escribe solo: el avance se arma en memoria; se guarda al marcar algo o con «Guardar el avance armado» («Sí»).
  //  Pruebas viejas: __v158No (lo pone el arnés salvo v158:true) → todo como antes.
  if (window.__av2) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const arr = (x) => (Array.isArray(x) ? x : []);
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const r2 = (n) => Math.round(n * 100) / 100;
  const intentar = (fn, def) => { try { return fn(); } catch (e) { return def; } };
  const fN = (n, d) => { try { return Number(n).toLocaleString("es-AR", { maximumFractionDigits: d == null ? 2 : d }); } catch (e) { return String(n); } };
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const ahoraMs = () => (window.__a2Ahora ? +new Date(window.__a2Ahora) : Date.now());
  const hoyISO = () => iso(new Date(ahoraMs()));
  const masDias = (f, n) => { const d = new Date(f + "T12:00:00"); d.setDate(d.getDate() + n); return iso(d); };
  const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const fC = (f) => { const p = String(f || "").slice(0, 10).split("-"); return p.length === 3 ? p[2] + "/" + p[1] : ""; };
  const fDia = (f) => { const d = new Date(String(f).slice(0, 10) + "T12:00:00"); return isNaN(d) ? "" : DIAS[d.getDay()] + " " + fC(f); };
  const fechaDe = (ts) => (ts ? iso(new Date(ts)) : "");
  const hhmm = (ts) => { const d = new Date(ts); return isNaN(d) ? "" : pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const habil = (f) => { const g = new Date(f + "T12:00:00").getDay(); return g >= 1 && g <= 5; };
  const habiles = (a, b) => { let n = 0, x = a; if (!a || !b || a > b) return 0; for (let i = 0; i < 800 && x <= b; i++) { if (habil(x)) n++; x = masDias(x, 1); } return n; };
  const sumarHabiles = (f, n) => { let x = f, k = 0; for (let i = 0; i < 2000 && k < n; i++) { x = masDias(x, 1); if (habil(x)) k++; } return x; };
  const primero = (n) => String(n || "").trim().split(/\s+/)[0] || "";
  const off = () => !!window.__v158No;
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const obras = () => intentar(() => window.avanceObrasTodas || [].concat(Array.isArray(avanceObras) ? avanceObras : [], window.avanceObrasOcultas || []), []) || [];
  const obraDe = (id) => (id && typeof id == "object" ? (id.id != null && obras().find((o) => o && String(o.id) === String(id.id))) || id : obras().find((o) => o && String(o.id) === String(id)) || null);   // un objeto con id: la obra de verdad (el legajo arma copias)
  const permiso = (h) => intentar(() => (window.PERMISOS && PERMISOS.permiso ? PERMISOS.permiso(h) : typeof window.permiso == "function" ? window.permiso(h) : "oculto"), "oculto");
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  const rolYo = () => intentar(() => String((PERMISOS.yo() || {}).rol || ""), "");
  const yoMail = () => String((window.__fbUser || {}).email || "");
  const yoNombre = () => intentar(() => { const y = PERMISOS.yo() || {}; return y.nombre || y.persona || y.usuario || yoMail().split("@")[0]; }, yoMail());
  const puedeVer = () => !off() && !esCrew() && permiso("avance") !== "oculto";
  const puede = () => puedeVer() && permiso("avance") === "editar" && rolYo() !== "direccion" && rolYo() !== "mirar" && rolYo() !== "panol";
  const avisar = (t, tipo) => { try { if (typeof window.mostrarAviso == "function") return window.mostrarAviso(t, tipo || "ok"); if (window.__avisoApp) return window.__avisoApp(t); } catch (e) { } };
  const auditar = (t, d) => { try { typeof window.fbAuditar == "function" && window.fbAuditar(t, d); } catch (e) { } };
  const labelDe = (k) => intentar(() => { const a = ACTIVIDADES_CATALOGO.find((x) => x.id === k); return a ? a.label : k; }, k);
  const cerrada = (o) => !!(o && o.cierre && o.cierre.cerradoTs);
  const campo = (o) => obj(o && o.campo);
  const tareasOt = (o) => arr(o && o.actividades).filter((k) => typeof k == "string" && k && k.indexOf("m:") !== 0);
  const nombreObra = (o) => intentar(() => (window.__fmtNombre ? window.__fmtNombre.obra(o.nombre || o.plazaNombre || "") : String(o.nombre || o.plazaNombre || "")), String((o && o.nombre) || ""));
  const fraguadoH = () => { const v = num(obj(obj(window.__baremoNube).sugerida).fraguado); return v > 0 ? v : 72; };
  const FALLA_RE = /quemad|rot[oa]\b|romp|golpe|falla|robo|robad|arruin|fisur|rajad|mal hecho|vandal/i;
  const dicc = (k) => intentar(() => window.__DICC_ID[k] || null, null);
  const hhDe = (k, def) => { const d = dicc(k); return d && d.hh > 0 ? d.hh : def; };

  // ============================================================== qué marca cada tarea del catálogo (TAREA_AV)
  //  pasos por columna (grilla) y cosas que no van por columna («c:…»). Lo dudoso, a confirmar.
  const TAREA_AV = {
    excavacion: ["pozo"], fundaciones: ["pozo", "horm"], hormigonado: ["horm"], acabado_pozo: ["acab"],
    montaje_prfv: ["izaje"], montaje_metalica: ["izaje"], aplomado_columna: ["aplom"], sellado_base: ["sello"],
    montaje_vinculo: ["vinc"], vinculo_luminaria: ["vinc", "artef"], montaje_luminaria: ["artef", "subida"], luminaria_existente: ["artef"], subida_cable: ["subida"],
    conexionado_tablerito: ["tabl"], bpn: ["tabl"], fusibles_borneras: ["tabl"], pat: ["pat", "c:pat_tab"],
    replanteo: ["c:replanteo"], zanjeo: ["c:zanja"], zanja_maquina: ["c:zanja"], tapado_zanja: ["c:tapado"], cruce_calzada: ["c:cruce"], limpieza_obra: ["c:limpieza"], limpieza_pintura: ["c:limpieza"],
    armado_tablerito: ["c:arm_tabl"], armado_vinculo: ["c:arm_vinc"], armado_luminaria: ["c:arm_lum"], prueba_artefactos: ["c:prueba_art"],
    tendido_cable: ["c:cable"], empalme_subterraneo: ["c:empalmes"],
    pozo_tablero: ["c:pozo_tab"], poste_tablero: ["c:poste_tab"], base_tablero_nivel: ["c:base_tab"], colocacion_tablero: ["c:col_tab"], armado_tablero: ["c:arm_tab"], tablero: ["c:col_tab", "c:arm_tab"],
    acometida_aerea: ["c:acometida"], acometida_subterranea: ["c:acometida"], acometida: ["c:acometida"], prensacables: ["c:prensa"], morsetos_terminales: ["c:morsetos"], conexion_epec: ["c:epec"],
    medicion_pat: ["c:med_pat"], medicion_aislacion: ["c:aislacion"], prueba_encendido: ["c:encendido"], inspeccion_interna: ["c:insp_int"], inspeccion: ["c:insp_fin"], inspeccion_pruebas: ["c:encendido", "c:insp_fin"],
    plano_conforme: ["c:plano"], certificado_instalacion: ["c:cert"], carpeta_epec: ["c:carpeta"]
  };
  // los pasos de cada columna (los 8 de la grilla + 3 que se ven en la hoja de la columna)
  const PASOS = [
    { id: "pozo", t: "Pozo", l: "Pozo de fundación", r: "civil", k: "excavacion", g: 1 },
    { id: "horm", t: "Horm.", l: "Hormigonado de fundación", r: "civil", k: "hormigonado", g: 1 },
    { id: "acab", t: "Acab.", l: "Acabado de pozo (molde, telgopor, arena, sello)", r: "civil", k: "acabado_pozo", g: 0 },
    { id: "izaje", t: "Izaje", l: "Izaje de la columna", r: "columnas", k: "montaje_prfv", g: 1 },
    { id: "aplom", t: "Aplom.", l: "Aplomado", r: "columnas", k: "aplomado_columna", g: 0 },
    { id: "vinc", t: "Vínc.", l: "Vínculo con sus brazos", r: "vinculos", k: "montaje_vinculo", g: 1 },
    { id: "artef", t: "Artef.", l: "Artefacto(s) LED", r: "artefactos", k: "montaje_luminaria", g: 1, porArt: true },
    { id: "subida", t: "Subida", l: "Cable de subida 3×1,5", r: "cableado", k: "subida_cable", g: 0, porArt: true },
    { id: "tabl", t: "Tabl.", l: "Tablerito (borneras y fusibles)", r: "cajas", k: "conexionado_tablerito", g: 1 },
    { id: "sello", t: "Sello", l: "Sellado de base", r: "columnas", k: "sellado_base", g: 1 },
    { id: "pat", t: "PAT", l: "Puesta a tierra (jabalina)", r: "pat", k: "pat", g: 1 }
  ];
  const PASO = {}; PASOS.forEach((p) => { PASO[p.id] = p; });
  const GRILLA = ["pozo", "horm", "izaje", "vinc", "artef", "tabl", "sello", "pat"];
  const RUB = [["civil", "Civil", "⛏"], ["columnas", "Columnas", "🏗"], ["cajas", "Cajas de columna (tableritos)", "🔌"], ["vinculos", "Vínculos", "🔗"], ["artefactos", "Artefactos", "💡"], ["cableado", "Cableado", "〰"], ["pat", "Puesta a tierra", "⏚"], ["tablero", "Tablero", "🗄"], ["cierre", "Pruebas y cierre", "🏁"]];
  const RUBN = {}; RUB.forEach((r) => { RUBN[r[0]] = r[1]; });
  // horas-hombre de las cosas que no tienen tarea con hh por unidad (a confirmar)
  const HH_BIN = { acometida: 3, prensa: 1, morsetos: 1.5, epec: 3, encendido: 2, insp_int: 2, insp_fin: 4, plano: 4, planilla: 1, cert: 2, carpeta: 2, replanteo: 2, limpieza: 4 };
  const EST = {
    ver: ["Hecho", "✓"], sinver: ["En revisión (mandado, sin cerrar)", "✓"], mano: ["Hecho (a mano)", "✓"], frag: ["Fraguando", "⏳"], pieza: ["Le falta una pieza", "!"],
    falla: ["Falla · rehacer", "✕"], obs: ["Observado por la inspección", "obs"], falta: ["Falta", ""], nolleva: ["No lleva", ""], asig: ["Asignado en una orden", "•"]
  };
  const HECHO = { ver: 1, sinver: 1, mano: 1, frag: 1 };

  // ============================================================== qué lleva la obra (la lista)
  const normP = (s) => intentar(() => window.normPunto(s), String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""));
  function calculoDe(o) {
    const h = intentar(() => (typeof historial !== "undefined" && Array.isArray(historial) ? historial : []), []).filter((x) => x && x.form && (intentar(() => (typeof window.plazaYaRegistrada == "function" ? window.plazaYaRegistrada(x.nombre, x.id) === o : false), false) || normP(x.nombre) === normP(o.nombre) || (o.obraId && String(x.id || "") === String(o.obraId))));
    h.sort((a, b) => (b.ts || 0) - (a.ts || 0));
    return h[0] || null;
  }
  const itemsDe = (o) => { const m = {}; arr(o.valorItems).forEach((r) => { if (r && r.itemPliego) m[String(r.itemPliego)] = (m[String(r.itemPliego)] || 0) + num(r.cantidad); }); return m; };
  const sumIt = (I, l) => l.reduce((s, k) => s + num(I[String(k)]), 0);
  const ART_TIPO = { simple: 1, doble: 2, triple: 3, cuadruple: 4 };
  function lista(o) {
    o = obraDe(o); if (!o) return null;
    if (o.tipo === "barrio" || o.tipoObra === "barrio") return null;
    const I = itemsDe(o), h = calculoDe(o), f = h ? obj(h.form) : {}, cps = obj(f.campos);
    let nombres = intentar(() => arr(window.puntosDeObra(o.id).lista).map((x) => (typeof x == "string" ? x : (x && (x.nombre || x.txt)) || "")).filter(Boolean), []);
    const nColIt = sumIt(I, ["1", "2", "3", "4", "5", "6", "7", "8"]);
    let origen = nombres.length ? "obra" : "";
    if (!nombres.length && nColIt > 0) { nombres = Array.from({ length: Math.min(300, Math.round(nColIt)) }, (_, i) => "Col " + (i + 1)); origen = "itemizado"; }
    const tipoCol = /met/i.test(String(cps.colTipo || h && h.tipoCol || "")) ? "MET" : /prfv/i.test(String(cps.colTipo || h && h.tipoCol || "")) ? "PRFV" : sumIt(I, ["1", "2", "3", "4"]) > sumIt(I, ["5", "6", "7", "8"]) ? "MET" : "PRFV";
    // circuitos y tableros (del cálculo; si no, de los nombres «T1 · C1 · Col 1»)
    const cir = arr(f.circuitos).slice().sort((a, b) => (a.tablero || 1) - (b.tablero || 1) || (a.numero || 0) - (b.numero || 0));
    const porCol = [];   // {tab, circ, alt}
    cir.forEach((c) => { arr(c.puntos).forEach((p) => { if (p && p.esColumna === false) return; porCol.push({ tab: c.tablero || 1, circ: c.numero || 1, alt: num(p && p.altura) }); }); });
    const grAlt = []; arr(f.columnaGrupos).forEach((g) => { for (let i = 0; i < (parseInt(g.columnas) || 0); i++) grAlt.push(num(g.altura)); });
    const grArt = []; arr(f.vinculoGrupos).forEach((g) => { const m = String(g.tipo || "").match(/^(simple|doble|triple|cuadruple)/); for (let i = 0; i < (parseInt(g.columnas) || 0); i++) grArt.push(m ? ART_TIPO[m[1]] : 1); });
    const itArt = []; [["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 1], ["6", 2], ["7", 3], ["8", 4]].forEach(([it, a]) => { for (let i = 0; i < Math.round(num(I[it])); i++) itArt.push(a); });
    const cols = nombres.slice(0, 300).map((n, i) => {
      const m = String(n).match(/T\s*(\d+)\D+C\s*(\d+)/i), pc = porCol[i] || null;
      const tab = pc ? pc.tab : m ? +m[1] : 0, circ = pc ? pc.circ : m ? +m[2] : 0;
      const alt = (pc && pc.alt) || grAlt[i] || 7;
      const art = grArt[i] || itArt[i] || 1;
      let key = normP(n) || "COL" + (i + 1);
      return { i, num: String(n), key, tab, circ, alt, art, tipo: tipoCol, artDe: grArt[i] || itArt[i] ? "calculo" : "a confirmar" };
    });
    // keys repetidas (raro): se hacen únicas
    const vk = {}; cols.forEach((c) => { if (vk[c.key]) c.key = c.key + "_" + c.i; vk[c.key] = 1; });
    // jabalinas: PRFV = una al final de cada circuito (§11.3); metálica = cada columna
    const conCirc = cols.some((c) => c.circ > 0);
    cols.forEach((c, i) => { c.jab = tipoCol === "MET" ? true : conCirc ? !cols[i + 1] || cols[i + 1].circ !== c.circ || cols[i + 1].tab !== c.tab : false; });
    const tabsCalc = [...new Set(cols.map((c) => c.tab).filter(Boolean))].length + arr(f.tablerosExtra).length;
    const tableros = Math.max(tabsCalc, Math.round(sumIt(I, ["9", "10"])));
    const circuitos = conCirc ? [...new Set(cols.map((c) => c.tab + "|" + c.circ))].length : 0;
    // las cosas que no van por columna
    const C = [], nCol = cols.length, nArt = cols.reduce((s, c) => s + c.art, 0);
    const add = (id, r, label, un, tot, hh, extra) => { if (!(tot > 0)) return; C.push(Object.assign({ id, r, label, un, tot: r2(tot), hh, bin: false }, extra || {})); };
    const bin = (id, r, label, extra) => add(id, r, label, "", 1, HH_BIN[id] || 1, Object.assign({ bin: true }, extra || {}));
    const zanjaM = sumIt(I, ["15", "16", "17", "18", "19", "20"]) || arr(f.zanjaTramos).reduce((s, z) => s + num(z.ml || z.largo || z.metros), 0);
    const cableM = sumIt(I, ["25", "26", "27", "28", "29", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40"]) || zanjaM;
    const real = nCol > 0 || tableros > 0 || zanjaM > 0;
    if (!real) return null;
    bin("replanteo", "civil", "Replanteo y marcado");
    add("zanja", "civil", "Zanja (excavación)", "m", zanjaM, hhDe("zanjeo", 0.5));
    add("cruce", "civil", "Cruce de calzada", "cruce", sumIt(I, ["21", "22", "23", "24"]), hhDe("cruce_calzada", 6));
    add("tapado", "civil", "Tapado y compactado de zanja", "m", zanjaM, hhDe("tapado_zanja", 0.2));
    bin("limpieza", "civil", "Limpieza final");
    add("arm_tabl", "cajas", "Armado de tableritos en galpón", "caja", nCol, hhDe("armado_tablerito", 0.75));
    add("arm_vinc", "vinculos", "Armado de vínculos en galpón", "vínculo", nCol, hhDe("armado_vinculo", 0.75));
    add("arm_lum", "artefactos", "Armado de luminarias en galpón", "luminaria", nArt, hhDe("armado_luminaria", 0.5));
    add("prueba_art", "artefactos", "Prueba de artefactos en galpón", "luminaria", nArt, hhDe("prueba_artefactos", 0.25));
    add("cable", "cableado", "Tendido de cable subterráneo", "m", cableM, hhDe("tendido_cable", 0.05));
    add("empalmes", "cableado", "Empalmes subterráneos", "empalme", sumIt(I, ["78", "79"]), hhDe("empalme_subterraneo", 2));
    add("pat_tab", "pat", "Jabalina del tablero", "jabalina", tableros, hhDe("pat", 1));
    const nJab = cols.filter((c) => c.jab).length + tableros;
    add("med_pat", "pat", "Medición de puesta a tierra", "medición", Math.max(num(I["81"]), nJab), hhDe("medicion_pat", 0.3));
    if (tableros > 0) {
      const aereo = num(I["9"]) > 0 || num(I["13"]) > 0, nivel = num(I["10"]) > 0;
      if (aereo) { add("pozo_tab", "tablero", "Pozo del apoyo PRFV del tablero", "pozo", Math.max(num(I["13"]), num(I["9"])), hhDe("pozo_tablero", 2)); add("poste_tab", "tablero", "Poste / apoyo PRFV del tablero", "poste", Math.max(num(I["13"]), num(I["9"])), hhDe("poste_tablero", 3)); }
      if (nivel) add("base_tab", "tablero", "Base del tablero a nivel", "base", num(I["10"]), hhDe("base_tablero_nivel", 8));
      add("col_tab", "tablero", "Colocación del tablero", "tablero", tableros, hhDe("colocacion_tablero", 2));
      add("arm_tab", "tablero", "Armado y conexionado del tablero", "tablero", tableros, hhDe("armado_tablero", 4));
      bin("acometida", "tablero", "Acometida al tablero");
      bin("prensa", "tablero", "Prensacables del tablero");
      bin("morsetos", "tablero", "Morsetos y terminales");
      bin("epec", "tablero", "Conexión EPEC / medidor");
    }
    add("aislacion", "cierre", "Medición de aislación", "circuito", Math.max(num(I["80"]), circuitos), hhDe("medicion_aislacion", 0.5));
    bin("encendido", "cierre", "Prueba de encendido");
    bin("insp_int", "cierre", "Inspección interna");
    bin("insp_fin", "cierre", "Inspección final (Municipalidad)");
    bin("plano", "cierre", "Plano conforme a obra", { doc: "conforme" });
    bin("planilla", "cierre", "Planilla de PAT", { doc: "pat" });
    bin("cert", "cierre", "Certificado de instalación apta", { doc: "cert" });
    bin("carpeta", "cierre", "Proyecto / carpeta EPEC", { doc: "carpeta" });
    // lo agregado a mano («＋ Agregar»)
    arr(obj(o.av2).extra).forEach((x, i) => { if (x && x.label && RUBN[x.r]) C.push({ id: "x" + (x.id || i), r: x.r, label: x.label, un: x.un || "", tot: num(x.cant) > 0 ? num(x.cant) : 1, hh: num(x.hh) > 0 ? num(x.hh) : 1, bin: !(num(x.cant) > 1), extra: true, ks: x.k ? [x.k] : [] }); });
    const pasos = nCol ? PASOS.filter((p) => p.id !== "pat" || cols.some((c) => c.jab)) : [];
    return { o, cols, pasos, cosas: C, tableros, circuitos, tipoCol, origen: origen || (h ? "calculo" : "itemizado"), calculo: !!h, conCirc, nArt };
  }
  // piezas de cada columna (§11.3 del contrato y la caja PRFV TC-PRFV-01/02); cantidades por columna
  function piezasDe(c) {
    const P = [];
    const pz = (id, paso, t, cant, cod) => P.push({ id, paso, t, cant, cod: cod || "" });
    pz("vinculo", "vinc", "Vínculo con brazo 400 mm", 1);
    pz("lum", "artef", "Luminaria LED", c.art, "6010");
    pz("subida", "subida", "Cable de subida 3×1,5", c.art);
    pz("prensa", "subida", "Prensacable 3/4\"", c.art);
    if (c.tipo === "PRFV") {
      pz("bpn_g", "tabl", "BPN 6 gris", 3, "2009"); pz("bpn_c", "tabl", "BPN 6 celeste", 2, "2008"); pz("bpn_v", "tabl", "BPN 6 verde", c.jab ? 3 : 2, "2010");
      pz("portaf", "tabl", "Portafusible tabaquera", 2, "3053");
      if (c.art <= 2) pz("fus2", "tabl", "Fusible 10×38 2 A", c.art, "3017"); else if (c.art === 3) { pz("fus4", "tabl", "Fusible 10×38 4 A", 1, "3073"); pz("fus2", "tabl", "Fusible 10×38 2 A", 1, "3017"); } else pz("fus4", "tabl", "Fusible 10×38 4 A", 2, "3073");
      pz("peine", "tabl", "Separador + peine BPN 6", 1, "2027"); pz("cu44", "tabl", "Cu 4×4 1 m + 6 punteras TIF 4", 1, "1010");
    } else { pz("portaf", "tabl", "Portafusible", c.art); pz("bornera", "tabl", "Bornera fase + neutro", c.art); }
    return P;
  }

  // ============================================================== el estado de cada cosa (de memoria)
  const ultimo = (l) => l.slice().sort((a, b) => (a.ts || 0) - (b.ts || 0))[l.length - 1] || null;
  function colMapa(L) {
    const m = new Map(), porNum = {};
    L.cols.forEach((c, i) => { m.set(c.key, i); m.set(normP(c.num), i); const n = String(c.num).match(/(\d+)\s*$/); if (n) (porNum[n[1]] = porNum[n[1]] || []).push(i); });
    return (txt) => { const k = normP(txt); if (m.has(k)) return m.get(k); const n = String(txt || "").match(/(\d+)\s*$/); if (n && porNum[n[1]] && porNum[n[1]].length === 1) return porNum[n[1]][0]; return -1; };
  }
  const tsOt = (o) => { const f = String(o.fecha || "").slice(0, 10); return f ? +new Date(f + "T12:00:00") : num(o.creado) || 0; };
  function evOrden(o, extra) { return Object.assign({ otId: o.id, ot: o.numero || o.id, fecha: String(o.fecha || "").slice(0, 10) }, extra || {}); }
  const minPaso = (o, k, n) => { const P = obj(obj(campo(o).pasosObra)[k] || obj(campo(o).pasosObra)[String(k).replace(/[~*\/\[\].`]/g, "_")]); const x = Object.keys(P).map((q) => P[q]).find((y) => y && nk(y.num) === nk(n)); return x && x.min != null ? num(x.min) : null; };
  function cantCuadrilla(o, k) {   // como la verificación v150: la marca con su cantidad o «se hizo» mandado (lo pedido)
    const V = intentar(() => window.__verifOt.verifTarea(o, k), null);
    return V ? num(V.hechas) : 0;
  }
  let CACHE = new Map(), VER = 0;
  function estado(o0) {
    const o = obraDe(o0); if (!o || off()) return null;
    const l = ots(), key = o.id, c = CACHE.get(key), t = Date.now();
    if (c && c.o === o && c.ots === l && c.av2 === o.av2 && c.ver === VER && t - c.t < 3000 && c.hoy === hoyISO()) return c.E;
    const E = intentar(() => calcular(o), null);
    CACHE.set(key, { o, ots: l, av2: o.av2, ver: VER, t, hoy: hoyISO(), E });
    return E;
  }
  function calcular(o) {
    const L = lista(o); if (!L) return null;
    const idx = colMapa(L), M = obj(obj(o.av2).m), ahora = ahoraMs(), frH = fraguadoH();
    const cel = {};   // "paso|i" → {ev:[]}
    const C = {}; L.cosas.forEach((x) => { C[x.id] = { ev: [], fuentes: [] }; });
    const cl = (p, i) => (cel[p + "|" + i] = cel[p + "|" + i] || { ev: [] });
    const extras = [], dupsOt = [];
    const misOts = ots().filter((t) => t && t.estado !== "Anulada" && String(t.plazaId || "") === String(o.id)).sort((a, b) => tsOt(a) - tsOt(b));
    misOts.forEach((t) => {
      const ok = cerrada(t) || !!obj(campo(t).verificado).ok, est = ok ? "ver" : "sinver";
      tareasOt(t).forEach((k) => {
        const tg = TAREA_AV[k] || (k === "rehacer_falla" ? ["*rehacer"] : null), xks = L.cosas.filter((x) => x.extra && arr(x.ks).indexOf(k) >= 0).map((x) => "c:" + x.id);
        const tgs = (tg || []).concat(xks); if (!tgs.length) return;
        const pasosT = tgs.filter((x) => PASO[x] && L.pasos.some((p) => p.id === x)), cosasT = tgs.filter((x) => x.indexOf("c:") === 0 && C[x.slice(2)]).map((x) => x.slice(2));
        const us = intentar(() => window.__hecho.unidadesDe(t, k), []) || [];
        let si = us.filter((u) => u.est === "si"), no = us.filter((u) => u.est === "no");
        let cnt = cerrada(t) ? num(obj(t.cierre.cantidades)[k]) : cantCuadrilla(t, k);
        if (cerrada(t) && cnt < si.length) si = si.slice().sort((a, b) => (a.ts || 0) - (b.ts || 0)).slice(0, Math.max(0, Math.floor(cnt)));   // ✏ Corregir cierre: manda lo que dice el cierre
        if (tg && tg[0] === "*rehacer") { si.forEach((u) => { const i = idx(u.num); if (i >= 0) L.pasos.forEach((p) => cl(p.id, i).ev.push(evOrden(t, { tipo: "rehecho", ts: u.ts || tsOt(t), por: u.por, k }))); }); return; }
        let usadas = 0, fueraCol = 0;
        if (pasosT.length) {
          si.forEach((u) => {
            const i = idx(u.num);
            if (i < 0) { fueraCol++; return; }
            usadas++;
            pasosT.forEach((p) => cl(p, i).ev.push(evOrden(t, { tipo: "hecho", est, ts: u.ts || tsOt(t), por: u.por, k, foto: !!u.foto, fotoId: u.fotoId || "", mini: u.mini || "", ini: u.ini, fin: u.fin, min: minPaso(t, k, u.num), num: u.num })));
          });
          no.forEach((u) => { const i = idx(u.num); if (i < 0) return; const f = FALLA_RE.test(String(u.motivo || "")); pasosT.slice(0, 1).forEach((p) => cl(p, i).ev.push(evOrden(t, { tipo: f ? "falla" : "nohizo", ts: u.ts || tsOt(t), por: u.por, k, motivo: u.motivo || "", num: u.num }))); });
          const extra = r2(cnt - usadas - fueraCol);
          if (extra > 0) extras.push(evOrden(t, { k, cant: extra, est, ts: tsOt(t) + 1, pasos: pasosT, cosas: cosasT, por: primero((arr(t.personal)[0] || {}).nombre) }));
          else if (fueraCol > 0 && cosasT.length) cosasT.slice(0, 1).forEach((x) => C[x].ev.push(evOrden(t, { tipo: "hecho", est, cant: fueraCol, ts: tsOt(t), k })));
        } else if (cosasT.length && cnt > 0) {
          cosasT.forEach((x) => C[x].ev.push(evOrden(t, { tipo: "hecho", est, cant: cnt, ts: tsOt(t), k, por: primero((arr(t.personal)[0] || {}).nombre) })));
        }
      });
    });
    // lo marcado a mano (av2.m): «c_<paso>_<col>», «k_<cosa>», «p_<col>_<pieza>»
    const piezaFalta = {};
    Object.keys(M).forEach((q) => {
      const v = obj(M[q]); if (!v.e) return;
      const m = q.match(/^c_([a-z]+)_(.+)$/), mk = q.match(/^k_(.+)$/), mp = q.match(/^p_(.+?)_([a-z0-9]+)$/);
      if (m) { const i = L.cols.findIndex((c) => c.key === m[2]); if (i >= 0 && PASO[m[1]]) cl(m[1], i).ev.push(Object.assign({ tipo: "mano", ts: num(v.ts) }, v)); }
      else if (mk && C[mk[1]]) C[mk[1]].ev.push(Object.assign({ tipo: "mano", ts: num(v.ts) }, v));
      else if (mp) { const i = L.cols.findIndex((c) => c.key === mp[1]); if (i >= 0) { const x = (piezaFalta[i] = piezaFalta[i] || {}); x[mp[2]] = v; } }
    });
    // resolver cada celda (lo último que pasó manda; dos órdenes en la misma columna = una sola, y queda anotado)
    const R = {};
    const resolver = (ev, porArt) => {
      ev.sort((a, b) => (a.ts || 0) - (b.ts || 0));
      let s = { e: "falta" }, dup = [], nohizo = null;
      ev.forEach((x) => {
        if (x.tipo === "hecho") {
          if (HECHO[s.e] && s.e !== "mano") { if (s.otId !== x.otId) dup.push(x); if (s.e === "sinver" && x.est === "ver") s = Object.assign({}, x, { e: "ver", dupDe: s }); return; }
          s = Object.assign({}, x, { e: x.est });
        } else if (x.tipo === "falla") { s = Object.assign({}, x, { e: "falla", deOrden: true }); }
        else if (x.tipo === "rehecho") { if (s.e === "falla") s = Object.assign({}, x, { e: cerradaId(x.otId) ? "ver" : "sinver", rehecho: true }); }
        else if (x.tipo === "nohizo") { if (!HECHO[s.e]) nohizo = x; }
        else if (x.tipo === "mano") {
          if (x.e === "si") { if (!HECHO[s.e] || s.e === "falla") s = Object.assign({}, x, { e: "mano" }); else s.confirmado = x; }
          else if (x.e === "no") s = Object.assign({}, x, { e: "falta", destildado: true });
          else if (x.e === "falla" || x.e === "obs" || x.e === "nolleva") s = Object.assign({}, x, { e: x.e });
        }
      });
      if (nohizo && s.e === "falta") s.nohizo = nohizo;
      s.dup = dup; return s;
    };
    const cerradaId = (id) => cerrada(ots().find((t) => t.id === id));
    L.pasos.forEach((p) => L.cols.forEach((c, i) => {
      const x = cel[p.id + "|" + i];
      R[p.id + "|" + i] = x ? resolver(x.ev) : { e: "falta", dup: [] };
      if (p.id === "pat" && !c.jab && R[p.id + "|" + i].e === "falta") R[p.id + "|" + i] = { e: "nolleva", auto: true, dup: [] };
    }));
    // lo que vino sin columna exacta: a las siguientes que faltan (como Modo obra); lo que sobra, a la cosa de la tarea
    extras.forEach((x) => {
      let n = x.cant;
      for (let i = 0; i < L.cols.length && n > 0; i++) {
        const p0 = x.pasos[0], r = R[p0 + "|" + i]; if (!r || r.e !== "falta" || r.destildado) continue;
        const usa = PASO[p0] && PASO[p0].porArt ? Math.min(n, L.cols[i].art) : 1;
        x.pasos.forEach((p) => { const rr = R[p + "|" + i]; if (rr && rr.e === "falta" && !rr.destildado) R[p + "|" + i] = Object.assign({}, x, { tipo: "hecho", e: x.est, sinCol: true, dup: [] }); });
        n = r2(n - usa);
      }
      if (n > 0 && x.cosas.length) { C[x.cosas[0]].ev.push(Object.assign({}, x, { tipo: "hecho", cant: n, sinCol: true })); n = 0; }
      if (n > 0) dupsOt.push(Object.assign({}, x, { sobra: n }));
    });
    // fraguando y piezas
    L.cols.forEach((c, i) => {
      const h = R["horm|" + i];
      if (h && HECHO[h.e] && h.e !== "mano" && h.ts && ahora - h.ts < frH * 3600e3) { h.eOrig = h.e; h.e = "frag"; h.fragHasta = h.ts + frH * 3600e3; }
      else if (h && h.e === "mano" && h.ts && ahora - h.ts < frH * 3600e3) { h.eOrig = h.e; h.e = "frag"; h.fragHasta = h.ts + frH * 3600e3; }
      const pf = piezaFalta[i] || {}; c.faltan = [];
      piezasDe(c).forEach((pz) => { const v = pf[pz.id]; if (v && v.e === "falta" && num(v.cant) > 0) { c.faltan.push(Object.assign({}, pz, { faltan: Math.min(pz.cant, num(v.cant)), v })); const r = R[pz.paso + "|" + i]; if (r && HECHO[r.e]) { r.ePrev = r.e; r.e = "pieza"; r.pieza = pz; } } });
    });
    // las cosas sin columna
    const docs = intentar(() => window.__docObra.estado(o), {}) || {};
    const RC = {};
    L.cosas.forEach((x) => {
      const ev = C[x.id].ev.slice().sort((a, b) => (a.ts || 0) - (b.ts || 0));
      let hv = 0, hs = 0, ult = null, man = null, estado = "", motivo = "";
      ev.forEach((e) => {
        if (e.tipo === "hecho") { if (e.est === "ver") hv += num(e.cant); else hs += num(e.cant); ult = e; }
        else if (e.tipo === "mano") { if (e.e === "cant") { man = e; if (ult && e.ts > ult.ts) { hv = 0; hs = 0; } } else if (e.e === "falla" || e.e === "obs" || e.e === "nolleva") { estado = e.e; motivo = e.motivo || ""; man = e; hv = 0; hs = 0; } else if (e.e === "si") { man = Object.assign({}, e, { cant: x.tot }); estado = ""; } }
      });
      if (man && man.e !== "falla" && man.e !== "obs" && man.e !== "nolleva") { estado = ""; }
      let hm = man && (man.e === "cant" || man.e === "si") ? num(man.cant != null ? man.cant : x.tot) : 0;
      if (man && (man.e === "falla" || man.e === "obs") && ult && ult.ts > man.ts) estado = "";
      if (x.doc) { const d = docs[x.doc]; if (d && d.ok) { hv = x.tot; estado = ""; } }
      if (x.id === "insp_fin" && obj(o.etapas).inspeccion) hv = Math.max(hv, 1);
      let h = Math.min(x.tot, x.bin ? (hv + hs + hm > 0 ? 1 : 0) : hv + hs + hm);
      if (estado === "nolleva" || estado === "falla" || estado === "obs") h = 0;
      if (x.bin && h > 0 && hv + hm === 0) hs = 1;
      const fuentes = ev.filter((e) => e.tipo === "hecho").map((e) => e);
      RC[x.id] = { h: r2(h), hv: r2(Math.min(x.tot, hv + hm)), hs: r2(Math.max(0, h - Math.min(x.tot, hv + hm))), estado, motivo, man, fuentes, ult: ult || man, doc: x.doc ? docs[x.doc] || null : null, sobra: r2(Math.max(0, hv + hs + hm - x.tot)) };
    });
    // asignado (órdenes abiertas sin mandar): solo para ver
    intentar(() => { const D = window.__hecho.deObra(o.id); Object.keys(D.T).forEach((k) => { const tg = (TAREA_AV[k] || []).filter((p) => PASO[p]); if (!tg.length) return; arr(D.T[k].asig).forEach((a) => { let n = Math.round(a.cant); L.cols.forEach((c, i) => { const r = R[tg[0] + "|" + i]; if (n > 0 && r && r.e === "falta" && !r.asig) { tg.forEach((p) => { const rr = R[p + "|" + i]; if (rr && rr.e === "falta") rr.asig = a; }); n--; } }); }); }); }, null);
    // pesos y %
    const W = {}; RUB.forEach((r) => { W[r[0]] = { w: 0, h: 0, hv: 0, listas: 0, total: 0, tags: {} }; });
    const PN = {};
    const pesoPaso = (p, c) => hhDe(p.k, 1) * (p.porArt ? c.art : 1);
    L.pasos.forEach((p) => {
      let tot = 0, hec = 0, n = 0, nTot = 0;
      L.cols.forEach((c, i) => {
        const r = R[p.id + "|" + i]; if (r.e === "nolleva") return;
        const w = pesoPaso(p, c); tot += w; nTot++;
        if (HECHO[r.e]) { hec += w; n++; if (r.e === "ver" || r.e === "mano" || (r.e === "frag" && r.eOrig !== "sinver")) W[p.r].hv += w; }
        if (r.e === "frag") W[p.r].tags.frag = (W[p.r].tags.frag || 0) + 1;
        if (r.e === "falla") W[p.r].tags.falla = (W[p.r].tags.falla || 0) + 1;
        if (r.e === "obs") W[p.r].tags.obs = (W[p.r].tags.obs || 0) + 1;
        if (r.e === "pieza") W[p.r].tags.pieza = (W[p.r].tags.pieza || 0) + 1;
        if (r.e === "sinver") W[p.r].tags.sinver = (W[p.r].tags.sinver || 0) + 1;
      });
      W[p.r].w += tot; W[p.r].h += hec; if (nTot) { W[p.r].total++; if (n >= nTot) W[p.r].listas++; }
      PN[p.id] = { n, tot: nTot };
    });
    L.cosas.forEach((x) => {
      const r = RC[x.id]; if (r.estado === "nolleva") return;
      const w = x.hh * x.tot; W[x.r].w += w; W[x.r].h += w * (r.h / x.tot); W[x.r].hv += w * (r.hv / x.tot); W[x.r].total++; if (r.h >= x.tot) W[x.r].listas++;
      if (r.estado) W[x.r].tags[r.estado] = (W[x.r].tags[r.estado] || 0) + 1;
      if (r.hs > 0) W[x.r].tags.sinver = (W[x.r].tags.sinver || 0) + 1;
    });
    const red = (p) => (p >= 99.95 ? 100 : Math.min(99, Math.round(p)));
    let tw = 0, th = 0, thv = 0;
    const rubros = RUB.map(([id, t, ico]) => { const w = W[id]; tw += w.w; th += w.h; thv += w.hv; return { id, t, ico, w: w.w, h: w.h, pct: w.w > 0 ? red(w.h / w.w * 100) : null, listas: w.listas, total: w.total, tags: w.tags }; }).filter((r) => r.w > 0);
    const pct = tw > 0 ? red(th / tw * 100) : 0, pctVer = tw > 0 ? red(thv / tw * 100) : 0;
    return { o, L, R, RC, PN, rubros, pct, pctVer, pctX: tw > 0 ? th / tw * 100 : 0, tw, th, dupsOt, piezaFalta, ts: Date.now(), guardado: !!(o.av2 && (o.av2.guardado || Object.keys(obj(o.av2.m)).length)) };
  }
  // el % de la obra (null = no hay lista: se usa el del itemizado)
  function pct(o) { const E = estado(o); return E ? E.pct : null; }

  // ============================================================== el % en toda la app
  let prevPct = null;
  function envolverPct() {
    const f = window.calcularAvanceEtapasPct; if (typeof f != "function" || f.__av2) return;
    prevPct = f; window.__pctItemizado = f;
    const n = function (o) { if (!off() && o) { const p = intentar(() => pct(o), null); if (p != null) return p; } return prevPct.apply(this, arguments); };
    if (window.__heredar) window.__heredar(n, f);
    n.__av2 = 1; window.calcularAvanceEtapasPct = n;
  }
  const pctItemizado = (o) => intentar(() => { const p = window.avanceItemizadoPct ? window.avanceItemizadoPct(o) : null; return p == null ? (prevPct ? prevPct(o) : 0) : p; }, 0);

  // ============================================================== tiempo de la obra
  function prevista(o) { return intentar(() => window.__inicioDir.prevista(o), null) || { f: /^\d{4}-\d\d-\d\d/.test(String(o.fechaEstimada || "")) ? String(o.fechaEstimada).slice(0, 10) : "", de: "" }; }
  function eventos(E) {   // cada cosa hecha con su fecha y su peso (para la curva y «lo último que pasó»)
    const L = E.L, l = [];
    L.pasos.forEach((p) => L.cols.forEach((c, i) => {
      const r = E.R[p.id + "|" + i]; const w = hhDe(p.k, 1) * (p.porArt ? c.art : 1);
      if (HECHO[r.e] || r.e === "pieza") l.push({ ts: r.ts || 0, f: r.fecha || fechaDe(r.ts), w: HECHO[r.e] ? w : 0, t: `${c.num} · ${p.l.toLowerCase()}`, s: r.ot ? r.ot + (r.e === "sinver" ? " sin cerrar" : "") : r.e === "mano" ? "a mano · " + primero(r.porNombre || r.por) : "", e: r.e });
      else if (r.e === "falla" || r.e === "obs") l.push({ ts: r.ts || 0, f: fechaDe(r.ts) || r.fecha, w: 0, t: `${c.num} · ${r.e === "falla" ? (r.motivo || "falla") : "observado" + (r.motivo ? " (" + r.motivo + ")" : "")}`, s: primero(r.porNombre || r.por), e: r.e });
    }));
    L.cosas.forEach((x) => { const r = E.RC[x.id]; r.fuentes.forEach((f) => l.push({ ts: f.ts || 0, f: f.fecha || fechaDe(f.ts), w: x.hh * Math.min(x.tot, num(f.cant)), t: x.label, s: f.ot || "", e: f.est })); if (r.man && r.man.e === "cant") l.push({ ts: r.man.ts, f: fechaDe(r.man.ts), w: 0, t: x.label + " · a mano", s: primero(r.man.porNombre), e: "mano" }); });
    return l.filter((x) => x.f).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  }
  function tiempo(E) {
    const o = E.o, h = hoyISO(), ev = eventos(E);
    const mis = ots().filter((t) => t && t.estado !== "Anulada" && String(t.plazaId || "") === String(o.id)).map((t) => String(t.fecha || "").slice(0, 10)).filter(Boolean).sort();
    const ini = mis[0] || (ev[0] && ev[0].f) || "";
    const pr = prevista(o);
    const tot = E.tw || 1, porDia = {};
    ev.forEach((x) => { if (x.w > 0) porDia[x.f] = (porDia[x.f] || 0) + x.w; });
    const acum = (f) => Object.keys(porDia).filter((d) => d <= f).reduce((s, d) => s + porDia[d], 0) / tot * 100;
    const trabajados = [...new Set(mis.filter((f) => f <= h))].length;
    const habIni = ini ? habiles(ini, h) : 0;
    let d7 = h, k = 0; for (let i = 0; i < 30 && k < 7; i++) { d7 = masDias(d7, -1); if (habil(d7)) k++; }
    const conAv = Object.keys(porDia).filter((d) => d > d7 && d <= h).length;
    const ritmo = conAv >= 2 ? Math.max(0, (acum(h) - acum(d7)) / 7) : null;
    const faltaPct = Math.max(0, 100 - E.pct);
    const habPrev = pr.f && pr.f >= h ? habiles(masDias(h, 1), pr.f) : 0;
    const haceFalta = pr.f ? (habPrev > 0 ? faltaPct / habPrev : null) : null;
    const proy = E.pct >= 100 ? h : ritmo && ritmo > 0 ? sumarHabiles(h, Math.min(1500, Math.ceil(faltaPct / ritmo))) : "";
    const diasDesp = proy && pr.f ? Math.round((new Date(proy + "T12:00:00") - new Date(pr.f + "T12:00:00")) / 864e5) : null;
    const ultima = ev.length ? ev[ev.length - 1].f : mis.length ? mis[mis.length - 1] : "";
    const serie = []; if (ini) { let x = ini; for (let i = 0; i < 400 && x <= h; i++) { serie.push([x, acum(x)]); x = masDias(x, 1); } }
    return { ini, prevista: pr.f || "", prevDe: pr.de || "", proy, diasDesp, ritmo, haceFalta, trabajados, habIni, habPrev, ultima, serie, ev, sinRitmo: ritmo == null };
  }

  // ============================================================== resúmenes (falta, alertas, tira)
  function estadoCol(E, i) {
    const L = E.L; let n = 0, t = 0, mal = false, pieza = false, frag = false, sv = false;
    L.pasos.forEach((p) => { const r = E.R[p.id + "|" + i]; if (r.e === "nolleva") return; t++; if (HECHO[r.e]) n++; if (r.e === "falla" || r.e === "obs") mal = true; if (r.e === "pieza") pieza = true; if (r.e === "frag") frag = true; if (r.e === "sinver") sv = true; });
    return { n, t, est: mal ? "mal" : pieza ? "pieza" : frag ? "frag" : t && n >= t ? "ok" : n > 0 ? "medias" : "nada", sv };
  }
  function faltaTxt(E, max) {
    const L = E.L, l = [];
    const plural = (n, s) => n + " " + (n === 1 ? s : s.replace(/^(\S+)/, (w) => (/[aeiouáéíóú]$/i.test(w) ? w + "s" : w + "es")));
    const NOMBRE = { pozo: "pozo", horm: "base", acab: "acabado de pozo", izaje: "izaje", aplom: "aplomado", vinc: "vínculo", artef: "artefacto", subida: "subida de cable", tabl: "tablerito", sello: "sellado", pat: "jabalina" };
    L.pasos.forEach((p) => { let n = 0; L.cols.forEach((c, i) => { const r = E.R[p.id + "|" + i]; if (r.e === "falta") n++; }); if (n) l.push({ t: plural(n, NOMBRE[p.id]), n, o: p.g ? 2 : 5 }); });
    const pz = {}; L.cols.forEach((c) => (c.faltan || []).forEach((x) => { pz[x.t] = (pz[x.t] || 0) + x.faltan; }));
    Object.keys(pz).forEach((t) => l.push({ t: pz[t] + " " + t.replace(/^BPN 6 /, "BPN "), n: 1, rojo: true, o: 1 }));
    L.cols.forEach((c, i) => L.pasos.forEach((p) => { const r = E.R[p.id + "|" + i]; if (r.e === "falla") l.push({ t: `${c.num}: ${r.motivo || "falla"}`, n: 1, rojo: true, o: 0 }); }));
    let docs = 0;
    L.cosas.forEach((x) => { const r = E.RC[x.id]; if (r.estado === "nolleva" || r.h >= x.tot) return; if (x.doc) { docs++; return; } if (x.bin) l.push({ t: x.label.toLowerCase().replace(/ \(.*\)$/, ""), n: 1, o: 3 }); });
    l.sort((a, b) => a.o - b.o);
    const out = l.slice(0, max || 6).map((x) => x.t);
    if (l.length > (max || 6)) out.push("y " + (l.length - (max || 6)) + " cosas más");
    if (docs) out.push(docs + (docs === 1 ? " papel del cierre" : " papeles del cierre"));
    return out;
  }
  function alertas(E) {
    const L = E.L, a = { frag: [], falla: [], pieza: [], obs: [] };
    L.cols.forEach((c, i) => L.pasos.forEach((p) => { const r = E.R[p.id + "|" + i]; if (a[r.e]) a[r.e].push({ c, p, r }); }));
    return a;
  }
  function terminada(E) {
    const L = E.L, falta = [];
    L.cosas.filter((x) => x.r === "cierre").forEach((x) => { const r = E.RC[x.id]; if (r.estado !== "nolleva" && r.h < x.tot) falta.push(x.label.toLowerCase()); });
    return { ok: E.pct >= 100, falta };
  }

  // ============================================================== cambios a mano (y del asistente): plan → «Sí» → guardar
  const kCel = (p, c) => "c_" + p + "_" + c.key, kCosa = (id) => "k_" + id, kPz = (c, pid) => "p_" + c.key + "_" + pid;
  function colsDe(L, sel) {
    if (sel === "todas" || sel === "*") return L.cols.slice();
    const l = [], idx = colMapa(L);
    arr(Array.isArray(sel) ? sel : String(sel || "").split(/[,;]|\by\b/)).forEach((s) => {
      s = String(s).trim(); if (!s) return;
      const r = s.match(/^(?:col(?:umna)?s?\s*)?(\d+)\s*(?:a|-|al)\s*(?:col\s*)?(\d+)$/i);
      if (r) { for (let n = +r[1]; n <= +r[2]; n++) { const i = idx("Col " + n); if (i >= 0) l.push(L.cols[i]); } return; }
      const i = idx(s.match(/^\d+$/) ? "Col " + s : s); if (i >= 0) l.push(L.cols[i]);
    });
    return [...new Set(l)];
  }
  const PASO_NOM = { pozo: /pozo|excav/, horm: /horm|fundac|base/, acab: /acab/, izaje: /iza|montaje de col|columna$/, aplom: /aplom/, vinc: /v[ií]nc/, artef: /artef|lumin|led/, subida: /subida|cable de sub/, tabl: /tabler|caja|bpn|borne|fusib/, sello: /sell/, pat: /pat|jabal|tierra/ };
  function pasoDe(s) { s = nk(s); if (PASO[s]) return s; const k = Object.keys(PASO_NOM).find((p) => PASO_NOM[p].test(s)); return k || ""; }
  function planMarcar(spec) {
    spec = spec || {};
    const o = obraDe(spec.obra) || (spec.obra ? obras().find((x) => nk(x.nombre).indexOf(nk(spec.obra)) >= 0 || String(x.obraId || "") === String(spec.obra)) : null);
    if (!o) return { err: "No encontré la obra." };
    const E = estado(o); if (!E) return { err: "Esa obra no tiene la lista del avance nuevo (sin columnas ni cálculo): se usa el del itemizado." };
    const L = E.L, acc = spec.accion || "marcar", cambios = [], avisos = [], filas = [];
    const val = (e, extra) => Object.assign({ e, ts: Date.now(), por: yoMail(), porNombre: yoNombre(), motivo: String(spec.motivo || "") }, spec.porAsistente ? { porAsistente: true } : {}, extra || {});
    if (spec.cosa) {
      const x = L.cosas.find((c) => c.id === spec.cosa || nk(c.label).indexOf(nk(spec.cosa)) >= 0); if (!x) return { err: "No encontré «" + spec.cosa + "» en el avance de la obra." };
      if (x.doc) return { err: x.label + " sale de «📄 Documentación» del legajo: cargalo ahí." };
      const r = E.RC[x.id], antes = r.estado ? EST[r.estado][0] : fN(r.h) + " de " + fN(x.tot);
      let v, d;
      if (acc === "marcar" || acc === "completa") { v = val("cant", { cant: spec.cant != null ? Math.min(x.tot, Math.max(0, num(spec.cant))) : x.tot }); d = fN(v.cant) + " de " + fN(x.tot); }
      else if (acc === "desmarcar") { v = val("cant", { cant: spec.cant != null ? Math.max(0, num(spec.cant)) : 0 }); d = fN(v.cant) + " de " + fN(x.tot); }
      else if (acc === "falla" || acc === "obs" || acc === "nolleva") { v = val(acc); d = EST[acc][0] + (spec.motivo ? " · " + spec.motivo : ""); }
      else return { err: "No sé hacer «" + acc + "» en eso." };
      cambios.push({ key: kCosa(x.id), val: v, txt: x.label + ": " + antes + " → " + d });
      filas.push({ c: x.label, a: antes, d });
      return { o, E, cambios, avisos, filas, n: 1 };
    }
    const cols = colsDe(L, spec.columnas); if (!cols.length) return { err: "No encontré esas columnas en la obra." };
    let pasos = spec.pasos === "todo" || acc === "completa" ? L.pasos.map((p) => p.id) : arr(Array.isArray(spec.pasos) ? spec.pasos : String(spec.pasos || "").split(/[,;]/)).map(pasoDe).filter((p) => p && L.pasos.some((q) => q.id === p));
    if (acc === "pieza_ok" || acc === "pieza_falta") {
      cols.forEach((c) => { const P = piezasDe(c).filter((z) => !spec.pieza || z.id === spec.pieza || nk(z.t).indexOf(nk(spec.pieza)) >= 0 || z.cod === String(spec.pieza)); P.forEach((z) => { const cant = acc === "pieza_ok" ? 0 : Math.min(z.cant, Math.max(1, num(spec.cant) || 1)); cambios.push({ key: kPz(c, z.id), val: val(acc === "pieza_ok" ? "ok" : "falta", { cant }), txt: `${c.num}: ${z.t} → ${acc === "pieza_ok" ? "ya está" : "falta" + (cant > 1 ? " " + cant : "")}` }); filas.push({ c: c.num + " · " + z.t, a: acc === "pieza_ok" ? "falta" : "está", d: acc === "pieza_ok" ? "está" : "le falta " + cant }); }); });
      if (!cambios.length) return { err: "No encontré esa pieza en esas columnas." };
      return { o, E, cambios, avisos, filas, n: cols.length };
    }
    if (!pasos.length) return { err: "Decime qué paso (pozo, hormigón, izaje, vínculo, artefacto, tablerito, sellado, PAT…)." };
    const eNuevo = acc === "marcar" || acc === "completa" ? "si" : acc === "desmarcar" ? "no" : acc;
    if (["si", "no", "falla", "obs", "nolleva"].indexOf(eNuevo) < 0) return { err: "No sé hacer «" + acc + "»." };
    cols.forEach((c) => {
      const i = c.i;
      pasos.forEach((p) => {
        const r = E.R[p + "|" + i]; if (!r) return;
        if (eNuevo === "si" && (HECHO[r.e] || r.e === "nolleva")) return;   // ya está
        if (eNuevo === "no" && !HECHO[r.e] && r.e !== "pieza" && r.e !== "falla" && r.e !== "obs" && r.e !== "nolleva") return;
        if (eNuevo === r.e) return;
        cambios.push({ key: kCel(p, c), val: val(eNuevo), txt: `${c.num} · ${PASO[p].t}: ${EST[r.e][0]} → ${EST[eNuevo === "si" ? "mano" : eNuevo === "no" ? "falta" : eNuevo][0]}` });
        filas.push({ c: c.num + " · " + PASO[p].l, a: EST[r.e][0], d: EST[eNuevo === "si" ? "mano" : eNuevo === "no" ? "falta" : eNuevo][0] + (spec.motivo && eNuevo !== "si" && eNuevo !== "no" ? " · " + spec.motivo : "") });
      });
      // avisos del orden de obra: izaje sin hormigón o con el hormigón fraguando
      if (eNuevo === "si" && pasos.indexOf("izaje") >= 0 && pasos.indexOf("horm") < 0) {
        const h = E.R["horm|" + i];
        if (h && h.e === "frag") avisos.push(`${c.num} está fraguando hasta ${fDia(fechaDe(h.fragHasta))} ${hhmm(h.fragHasta)}`);
        else if (h && !HECHO[h.e]) avisos.push(`${c.num} todavía no tiene hormigón`);
      }
      if (eNuevo === "si" && pasos.indexOf("vinc") >= 0 && pasos.indexOf("izaje") < 0 && !HECHO[(E.R["izaje|" + i] || {}).e]) avisos.push(`${c.num} todavía no está izada`);
    });
    if (!cambios.length) return { err: eNuevo === "si" ? "Eso ya figura hecho." : "No hay nada para cambiar ahí.", nada: true };
    return { o, E, cambios, avisos: [...new Set(avisos)], filas, n: cols.length };
  }
  function histEntrada(P, motivo, op) { return { ts: Date.now(), por: yoMail(), porNombre: yoNombre(), motivo: String(motivo || ""), cambios: P.cambios.map((c) => ({ key: c.key, e: c.val.e, txt: c.txt })).slice(0, 60), porAsistente: !!(op && op.porAsistente) }; }
  async function aplicar(P, motivo, op) {
    op = op || {};
    if (!P || P.err) return { ok: false, txt: (P && P.err) || "nada" };
    if (!(op.porAsistente || puede())) return { ok: false, txt: "Solo quien edita Avance de obra (no la cuadrilla ni Dirección) puede cambiar el avance." };
    motivo = String(motivo || "").trim(); if (motivo.length < 3) return { ok: false, txt: "Escribí el motivo (queda en el historial de la obra)." };
    const o = P.o, antes = pct(o), av = obj(o.av2), m = Object.assign({}, obj(av.m)), up = {};
    P.cambios.forEach((c) => { c.val.motivo = motivo; m[c.key] = c.val; up["av2.m." + c.key] = c.val; });
    const hist = arr(av.hist).concat([histEntrada(P, motivo, op)]).slice(-300);
    up["av2.hist"] = hist; up["av2.v"] = 1;
    const viejo = o.av2;
    o.av2 = Object.assign({}, av, { m, hist, v: 1 }); VER++;
    const despues = pct(o);
    const ah = arr(o.avanceHist).concat([{ item: "av2", antes, despues, motivo, por: yoMail(), porNombre: yoNombre(), ts: Date.now(), tipo: "aMano", av2: true, detalle: P.cambios.map((c) => c.txt).slice(0, 8).join(" · "), porAsistente: !!op.porAsistente }]).slice(-300);
    up.avanceHist = ah;
    try { await window.fbAvanceCampos(o.id, up); o.avanceHist = ah; }
    catch (e) { o.av2 = viejo; VER++; return { ok: false, txt: "No se pudo guardar: " + (/permission/i.test(String(e && (e.code || e.message))) ? "tu usuario no tiene permiso para editar el avance." : String((e && e.message) || e)) }; }
    auditar("avance_obra_marcar", { obraId: o.id, cambios: P.cambios.map((c) => c.txt).slice(0, 30), motivo, antes, despues, porAsistente: !!op.porAsistente });
    refrescar();
    return { ok: true, antes, despues, txt: `Listo: ${P.cambios.length} ${P.cambios.length === 1 ? "cambio" : "cambios"} · la obra pasó de ${antes} % a ${despues} %.` };
  }
  async function guardarArmado(id, op) {
    const o = obraDe(id), E = estado(o); if (!o || !E) return { ok: false, txt: "No hay avance armado para esa obra." };
    if (!puede()) return { ok: false, txt: "Solo quien edita Avance de obra puede guardarlo." };
    const res = {}; E.L.pasos.forEach((p) => { res[p.id] = E.PN[p.id].n + " de " + E.PN[p.id].tot; }); E.L.cosas.forEach((x) => { res[x.id] = E.RC[x.id].h + " de " + x.tot; });
    const g = { ts: Date.now(), por: yoMail(), porNombre: yoNombre(), pct: E.pct, pctItemizado: pctItemizado(o), resumen: res };
    const viejo = o.av2; o.av2 = Object.assign({}, obj(o.av2), { guardado: g, v: 1 }); VER++;
    try { await window.fbAvanceCampos(o.id, { "av2.guardado": g, "av2.v": 1 }); }
    catch (e) { o.av2 = viejo; VER++; return { ok: false, txt: "No se pudo guardar: " + String((e && e.message) || e) }; }
    auditar("avance_obra_guardar", { obraId: o.id, pct: E.pct });
    refrescar(); return { ok: true, txt: "Guardado: el avance armado quedó en la obra (" + E.pct + " %)." };
  }
  async function agregarCosa(id, x, motivo) {
    const o = obraDe(id); if (!o || !puede()) return { ok: false, txt: "No se puede." };
    const it = { id: String(Date.now()).slice(-8), r: x.r, label: String(x.label || "").slice(0, 80), cant: num(x.cant) || 1, un: String(x.un || "").slice(0, 20), por: yoMail(), porNombre: yoNombre(), ts: Date.now(), motivo: String(motivo || "") };
    if (!it.label || !RUBN[it.r]) return { ok: false, txt: "Falta el nombre o el rubro." };
    const extra = arr(obj(o.av2).extra).concat([it]), viejo = o.av2;
    o.av2 = Object.assign({}, obj(o.av2), { extra }); VER++;
    try { await window.fbAvanceCampos(o.id, { "av2.extra": extra }); } catch (e) { o.av2 = viejo; VER++; return { ok: false, txt: "No se pudo guardar." }; }
    refrescar(); return { ok: true, txt: "Agregado: " + it.label };
  }

  // ============================================================== pantalla (la A con la grilla C adentro)
  const st = { abiertos: { columnas: true }, sel: null, selPaso: "", iz: false, matAbierto: false, msg: "", id: "" };
  const colorPct = (p) => (p == null ? "#c7cedd" : intentar(() => window.colorPinAvance(p), null) || (p >= 100 ? "#34C759" : p >= 60 ? "#2F80ED" : p >= 30 ? "#FFCC00" : p > 0 ? "#FF3B30" : "#c7cedd"));
  const barra = (p) => `<span class="a2-bar"><i style="width:${Math.max(0, Math.min(100, p || 0))}%;background:${colorPct(p)}"></i></span>`;
  function anillo(p, tam) {
    const r = 40, c = 2 * Math.PI * r;
    return `<svg viewBox="0 0 100 100" width="${tam}" height="${tam}" aria-hidden="true"><circle cx="50" cy="50" r="${r}" stroke="rgba(255,255,255,.18)" stroke-width="11" fill="none"/><circle cx="50" cy="50" r="${r}" stroke="#89C2DB" stroke-width="11" fill="none" stroke-linecap="round" transform="rotate(-90 50 50)" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - Math.min(100, p) / 100)).toFixed(1)}"/></svg>`;
  }
  function origenTxt(r) {
    if (!r) return "";
    if (r.e === "nolleva") return r.auto ? "No lleva (no es fin de circuito)" : "No lleva · " + primero(r.porNombre) + (r.motivo ? " · «" + r.motivo + "»" : "");
    if (r.e === "mano" || (r.e === "falta" && r.destildado) || (r.tipo === "mano")) return `${r.e === "falta" ? "Destildado" : r.e === "falla" ? "Se arruinó" : r.e === "obs" ? "Observado" : "Sin orden · cargado a mano"} · ${primero(r.porNombre || r.por)} · ${fDia(fechaDe(r.ts))}${r.motivo ? " · «" + r.motivo + "»" : ""}`;
    if (r.otId) {
      const x = [r.ot, fDia(r.fecha), primero(r.por)];
      if (r.foto) x.push("foto"); if (r.min != null) x.push(fN(r.min, 0) + " min"); if (r.sinCol) x.push("sin columna exacta");
      if (r.e === "sinver" || r.eOrig === "sinver") x.push("sin cerrar"); if (r.deOrden && r.motivo) x.push("«" + r.motivo + "»");
      return x.filter(Boolean).join(" · ");
    }
    if (r.asig) return "Asignado en " + r.asig.ot + " (" + fDia(r.asig.fecha) + ")";
    if (r.nohizo) return "No se hizo en " + r.nohizo.ot + (r.nohizo.motivo ? " · «" + r.nohizo.motivo + "»" : "");
    return "Ninguna orden todavía";
  }
  function celHtml(E, p, i, sel) {
    const r = E.R[p + "|" + i], c = E.L.cols[i], e = r.e === "falta" && r.asig ? "asig" : r.e;
    const cls = e === "sinver" || (e === "frag" && r.eOrig === "sinver") ? (e === "frag" ? "frag sv" : "sinver") : e;
    return `<button type="button" class="a2-c ${cls}${r.sinCol ? " sc" : ""}" data-a2="cel" data-p="${p}" data-i="${i}" aria-label="${esc(c.num)} · ${esc(PASO[p].t)}: ${esc(EST[e][0])}">${esc(EST[e][1])}</button>`;
  }
  function grillaHtml(E) {
    const L = E.L, g = GRILLA.filter((p) => L.pasos.some((q) => q.id === p)), sel = st.sel;
    let filas = "", tabAnt = "";
    L.cols.forEach((c, i) => {
      const grp = c.circ ? `Circuito ${c.circ}${E.L.tableros > 1 ? " · T" + c.tab : ""}` : "";
      if (grp && grp !== tabAnt) { filas += `<div class="a2-gcirc">${esc(grp)}</div>`; tabAnt = grp; }
      const ec = estadoCol(E, i), elegida = sel && sel.has(i);
      filas += `<div class="a2-gf${elegida ? " sel" : ""}"><button type="button" class="a2-gn" data-a2="${sel ? "elegir" : "col"}" data-i="${i}" aria-label="${esc(c.num)}">${esc(c.num.replace(/^.*?(Col\s*\d+)$/i, "$1"))}</button>${g.map((p) => celHtml(E, p, i)).join("")}<span class="a2-gt">${ec.n}/${ec.t}</span></div>`;
    });
    const tot = g.map((p) => { let n = 0, t = 0; L.cols.forEach((c, i) => { const r = E.R[p + "|" + i]; if (r.e === "nolleva") return; t++; if (HECHO[r.e]) n++; }); return `<span>${n}/${t}</span>`; }).join("");
    const ley = ["ver", "sinver", "frag", "pieza", "falla", "obs", "falta", "nolleva"].map((e) => `<span><i class="a2-c ${e}"></i>${esc(EST[e][0].replace(/ \(.*\)/, ""))}</span>`).join("");
    const cab = `<div class="a2-gh"><span></span>${g.map((p) => `<span>${esc(PASO[p].t)}</span>`).join("")}<span></span></div>`;
    const barraSel = puede() ? (sel ? `<div class="a2-selcab"><b>${sel.size} ${sel.size === 1 ? "elegida" : "elegidas"}</b><button type="button" class="a2-link" data-a2="selTodas">Todas</button><button type="button" class="a2-link" data-a2="selNinguna">Ninguna</button></div>` : `<button type="button" class="btn-ghost a2-elegir" data-a2="selOn">☑ Elegir varias</button>`) : "";
    return `<div class="a2-grilla"><div class="a2-gtit"><span>Columna por columna${sel ? " · tocá el nombre para elegir" : " · tocá una"}</span>${barraSel}</div><div class="a2-gw" style="--a2n:${g.length}">${cab}${filas}<div class="a2-gf a2-gtot"><span class="a2-gn">Total</span>${tot}<span></span></div></div><div class="a2-ley">${ley}</div>${sel ? panelSel(E, g) : ""}</div>`;
  }
  function panelSel(E, g) {
    const sel = [...st.sel].sort((a, b) => a - b), cols = sel.map((i) => E.L.cols[i]);
    const chips = g.map((p) => `<button type="button" class="chip${st.selPaso === p ? " activo" : ""}" data-a2="selPaso" data-p="${p}">${esc(PASO[p].l.replace(/ \(.*\)/, "").replace(/ de la columna| de base| de fundación| con sus brazos/, ""))}</button>`).join("") + `<button type="button" class="chip${st.selPaso === "todo" ? " activo" : ""}" data-a2="selPaso" data-p="todo">✅ Todo</button>`;
    let aviso = "", btn = "";
    if (sel.length && st.selPaso) {
      const P = planMarcar({ obra: E.o.id, columnas: cols.map((c) => c.num), pasos: st.selPaso === "todo" ? "todo" : [st.selPaso], accion: st.selPaso === "todo" ? "completa" : "marcar" });
      if (P.err) aviso = `<div class="a2-av gris" role="status">${esc(P.err)}</div>`;
      else {
        if (P.avisos.length) aviso = `<div class="a2-av" role="status">⏳ ${esc(P.avisos.join(". "))}. ¿Lo marcaron igual?</div>`;
        const nom = st.selPaso === "todo" ? "todo" : PASO[st.selPaso].t.toLowerCase().replace(/\.$/, "");
        btn = `<button type="button" class="btn-primary a2-big" data-a2="selMarcar">${P.avisos.length ? "Marcar igual" : "Marcar " + esc(nom)} en ${sel.length === 1 ? "la " + esc(cols[0].num) : "las " + sel.length}</button>`;
      }
    }
    return `<div class="a2-selp"><div class="a2-et">¿Qué hicieron en ${sel.length === 1 ? "la " + esc((cols[0] || {}).num || "") : "las " + sel.length}?</div><div class="a2-chips">${chips}</div>${aviso}<label for="a2SelMot" class="a2-lbl">Motivo (obligatorio, queda en el historial)</label><input id="a2SelMot" type="text" maxlength="200" placeholder="Ej: lo hicieron sin orden, lo vi en obra" autocomplete="off" value="${esc(st.selMot || "")}"><div class="a2-acc"><button type="button" class="btn-ghost" data-a2="selOff">Cancelar</button>${btn}</div></div>`;
  }
  function pasoFila(E, p) {
    const L = E.L; let n = 0, t = 0; const notas = [];
    L.cols.forEach((c, i) => { const r = E.R[p.id + "|" + i]; if (r.e === "nolleva") return; t++; if (HECHO[r.e]) n++; if (r.e === "sinver" && notas.length < 3) notas.push(`<span class="a2-nota ok">✓ ${esc(c.num)} en revisión (${esc(r.ot || "")} sin cerrar)</span>`); if ((r.e === "falla" || r.e === "obs") && notas.length < 4) notas.push(`<span class="a2-nota mal">⚠ ${esc(c.num)} ${r.e === "obs" ? "observada" : "falla"}${r.motivo ? ": " + esc(r.motivo) : ""}</span>`); if (r.e === "frag" && notas.length < 4 && !notas.some((x) => /fraguando/.test(x))) notas.push(`<span class="a2-nota frag">⏳ fraguando hasta ${esc(fDia(fechaDe(r.fragHasta)))} ${esc(hhmm(r.fragHasta))}</span>`); });
    if (!t) return "";
    const pc = t ? Math.round(n / t * 100) : 0, un = /pozo/.test(p.id) ? "pozos" : p.id === "horm" ? "bases" : "col.";
    return `<div class="a2-t"><div class="a2-tl"><span>${esc(p.l)}${dicc(p.k) && dicc(p.k).nueva158 ? ' <em class="a2-new">tarea nueva</em>' : ""}</span><b>${n} de ${t} ${un}</b></div>${barra(pc)}${notas.join("")}</div>`;
  }
  function cosaFila(E, x) {
    const r = E.RC[x.id];
    const pc = r.estado === "nolleva" ? null : Math.round(r.h / x.tot * 100);
    const tag = r.estado === "nolleva" ? "no lleva" : r.estado ? EST[r.estado][0].toLowerCase() : x.bin ? (r.h >= 1 ? (r.hs > 0 ? "✓ en revisión" : "✓ " + "hecho") : "0 de 1") : `${fN(r.h)} de ${fN(x.tot)} ${x.un}`;
    const d = dicc(({ acab: "acabado_pozo", insp_int: "inspeccion_interna", plano: "plano_conforme", prensa: "prensacables", morsetos: "morsetos_terminales", epec: "conexion_epec" })[x.id] || "");
    const f = r.ult ? (r.ult.ot ? `${r.ult.ot} · ${fDia(r.ult.fecha)}${r.ult.est === "sinver" ? " · sin cerrar" : ""}${r.ult.sinCol ? " · sin columna exacta" : ""}` : r.ult.tipo === "mano" ? `Sin orden · cargado a mano · ${primero(r.ult.porNombre)}${r.ult.motivo ? " · «" + r.ult.motivo + "»" : ""}` : "") : x.doc ? (r.doc && r.doc.ok ? "📄 Documentación del legajo" : "falta en «📄 Documentación»") : "Ninguna orden todavía";
    return `<button type="button" class="a2-t a2-tb" data-a2="cosa" data-id="${esc(x.id)}"><div class="a2-tl"><span>${esc(x.label)}${d && d.nueva158 ? ' <em class="a2-new">tarea nueva</em>' : ""}</span><b class="${r.estado && r.estado !== "nolleva" ? "rojo" : ""}">${esc(tag)}</b></div>${pc == null ? '<span class="a2-bar nl"></span>' : barra(pc)}<small class="a2-or${r.ult && r.ult.tipo === "mano" ? " mano" : ""}">${esc(f)}</small></button>`;
  }
  function rubroHtml(E, R) {
    const ab = !!st.abiertos[R.id], tags = [];
    if (R.tags.frag) tags.push(`<span class="frag">⏳ fraguando</span>`); if (R.tags.falla) tags.push(`<span class="mal">✕ ${R.tags.falla} falla${R.tags.falla > 1 ? "s" : ""}</span>`);
    if (R.tags.obs) tags.push(`<span class="mal">⚠ observada</span>`); if (R.tags.pieza) tags.push(`<span class="pz">⚠ falta pieza</span>`);
    let cuerpo = "";
    if (ab) {
      const L = E.L;
      cuerpo = L.pasos.filter((p) => p.r === R.id).map((p) => pasoFila(E, p)).join("") + L.cosas.filter((x) => x.r === R.id).map((x) => cosaFila(E, x)).join("");
      if (R.id === "columnas" && L.cols.length) cuerpo += grillaHtml(E);
      if (R.id === "cierre") { const T = terminada(E); cuerpo += `<div class="a2-fin ${T.ok ? "ok" : ""}">${T.ok ? "🏁 Obra terminada." : "Obra terminada: <b>todavía no</b> — falta " + esc(T.falta.slice(0, 6).join(", ")) + (T.falta.length > 6 ? " y más" : "") + "."}</div>`; }
      if (puede()) cuerpo += `<button type="button" class="a2-link a2-add" data-a2="agregar" data-r="${R.id}">＋ Agregar algo que lleva</button>`;
    }
    return `<div class="a2-rub${ab ? " ab" : ""}"><button type="button" class="a2-rh" data-a2="rub" data-r="${R.id}" aria-expanded="${ab}"><span class="a2-ico">${R.ico}</span><span class="a2-rt"><b>${esc(R.t)}</b><small>${R.listas} de ${R.total} ${R.total === 1 ? "tarea lista" : "tareas listas"}${tags.length ? " · " + tags.join(" ") : ""}</small>${barra(R.pct)}</span><span class="a2-rp" style="color:${R.pct >= 30 && R.pct < 60 ? "#9a6b00" : R.pct >= 100 ? "#1f8a43" : R.pct > 0 && R.pct < 30 ? "#c4291f" : "var(--navy,#28285E)"}">${R.pct == null ? "—" : R.pct + "%"}</span><span class="a2-car">${ab ? "⌃" : "⌄"}</span></button>${ab ? `<div class="a2-rc">${cuerpo}</div>` : ""}</div>`;
  }
  function flashHtml(E, T) {
    const o = E.o, L = E.L, A = alertas(E), f = faltaTxt(E, 6);
    const tira = L.cols.map((c, i) => { const s = estadoCol(E, i); return `<button type="button" class="a2-ti ${s.est}${s.sv ? " sv" : ""}" data-a2="col" data-i="${i}" aria-label="${esc(c.num)}">${esc(String(c.num).replace(/^.*?(\d+)\D*$/, "$1"))}</button>`; }).join("");
    const box = (cls, n, t, s, ir) => `<button type="button" class="a2-al ${cls}" data-a2="alerta" data-t="${ir}"><b>${esc(t)}</b><small>${esc(s)}</small></button>`;
    const al = [];
    if (A.frag.length) al.push(box("frag", A.frag.length, `${A.frag.length} ${A.frag.length === 1 ? "base fraguando" : "bases fraguando"}`, "hasta " + fDia(fechaDe(Math.max.apply(null, A.frag.map((x) => x.r.fragHasta)))) + " " + hhmm(Math.max.apply(null, A.frag.map((x) => x.r.fragHasta))), "frag"));
    if (A.falla.length) al.push(box("mal", A.falla.length, `${A.falla.length} ${A.falla.length === 1 ? "falla" : "fallas"}`, A.falla.slice(0, 2).map((x) => x.c.num + " · " + (x.r.motivo || x.p.t)).join(" · "), "falla"));
    if (A.pieza.length) { const pz = []; L.cols.forEach((c) => (c.faltan || []).forEach((x) => pz.push(c.num + " · " + x.t))); al.push(box("pz", pz.length, `${pz.length} ${pz.length === 1 ? "pieza" : "piezas"}`, pz.slice(0, 2).join(" · "), "pieza")); }
    if (A.obs.length) al.push(box("mal", A.obs.length, `${A.obs.length} ${A.obs.length === 1 ? "observada" : "observadas"}`, A.obs.slice(0, 2).map((x) => x.c.num + " · " + x.p.t.toLowerCase()).join(" · "), "obs"));
    const sub = [o.tipo === "otra" ? "Obra" : "Plaza " + (L.tipoCol === "MET" ? "metálica" : "PRFV"), L.cols.length ? L.cols.length + " columnas" : "", L.circuitos ? L.circuitos + (L.circuitos === 1 ? " circuito" : " circuitos") : "", L.tableros ? (L.tableros === 1 ? "1 tablero" : L.tableros + " tableros") : ""].filter(Boolean).join(" · ");
    const ley = [["ok", "completa"], ["medias", "a medias"], ["frag", "fraguando"], ["pieza", "falta pieza"], ["mal", "falla / observada"], ["nada", "sin empezar"]].map(([c, t]) => `<span><i class="a2-ti ${c}"></i>${t}</span>`).join("");
    const fechas = `<div class="a2-fe"><div>Inicio <b>${esc(T.ini ? fC(T.ini) : "—")}</b> · prevista <b>${esc(T.prevista ? fC(T.prevista) : "sin fecha")}</b></div>${T.proy && E.pct < 100 ? `<div>A este ritmo <b class="am">${esc(fC(T.proy))}/${esc(T.proy.slice(0, 4))}</b>${T.diasDesp != null ? ` · <span class="${T.diasDesp > 0 ? "rojo" : "ok"}">${T.diasDesp > 0 ? T.diasDesp + " días después" : T.diasDesp < 0 ? -T.diasDesp + " días antes" : "justo"}</span>` : ""}</div>` : E.pct >= 100 ? "<div>✅ Terminada</div>" : "<div>Todavía no hay ritmo para estimar el final</div>"}</div>`;
    const btns = `<div class="a2-fb"><button type="button" class="a2-fbtn" data-a2="itemizado">🧾 Ver itemizado</button><button type="button" class="a2-fbtn" data-a2="legajo">📁 Legajo</button>${window.__auditAvance ? '<button type="button" class="a2-fbtn" data-a2="control">🔎 Control</button>' : ""}<button type="button" class="a2-fbtn" data-a2="como">¿Cómo se calcula?</button></div>`;
    const guardar = puede() && !(o.av2 && o.av2.guardado) && !Object.keys(obj(obj(o.av2).m)).length ? `<div class="a2-arm" role="status">Armado con lo que dicen las órdenes · todavía no se guardó en la obra. <button type="button" class="a2-link" data-a2="guardarArmado">💾 Guardar el avance armado</button></div>` : "";
    return `<div class="a2-flash"><div class="a2-fl1"><div class="a2-fe0">— Avance de obra${o.barrio ? " · " + esc(o.barrio) : ""}</div><h2>${esc(nombreObra(o))}${o.obraId ? ` <span class="a2-id">ID ${esc(o.obraId)}</span>` : ""}</h2><div class="a2-sub">${esc(sub)}</div></div>
<div class="a2-fl2"><div class="a2-ring">${anillo(E.pct, 104)}<div><b>${E.pct}<small>%</small></b><span>de la obra</span></div></div><div class="a2-fl2d">${fechas}<div class="a2-tira">${tira}</div><div class="a2-tirap">${L.cols.length} columnas${L.conCirc ? " · C1 → C" + L.circuitos : ""}</div></div></div>
<div class="a2-ley2">${ley}</div>
${f.length ? `<div class="a2-falta"><div class="a2-et">Falta</div><b>${esc(f.join(" · "))}</b></div>` : `<div class="a2-falta ok"><b>✅ No falta nada</b></div>`}
${al.length ? `<div class="a2-als">${al.join("")}</div>` : ""}${btns}${guardar}</div>`;
  }
  function tiempoHtml(E, T) {
    const hoy = hoyISO(), ini = T.ini, pr = T.prevista, py = T.proy || "";
    const fin = [pr, py, hoy].filter(Boolean).sort().pop() || hoy;
    const span = ini ? Math.max(1, (new Date(fin + "T12:00:00") - new Date(ini + "T12:00:00")) / 864e5) : 1;
    const xPct = (f) => (ini ? Math.max(0, Math.min(100, (new Date(f + "T12:00:00") - new Date(ini + "T12:00:00")) / 864e5 / span * 100)) : 0);
    const linea = ini ? `<div class="a2-lin"><span class="a2-lr" style="width:${xPct(hoy)}%"></span>${pr ? `<span class="a2-lp" style="left:${xPct(pr)}%"></span>` : ""}</div><div class="a2-lf"><span><small>Inicio</small><b>${esc(fC(ini))}</b></span><span><small>Hoy</small><b>${esc(fC(hoy))}</b></span><span><small>Prevista</small><b>${pr ? esc(fC(pr)) : "—"}</b></span><span><small>Proyectada</small><b class="${T.diasDesp > 0 ? "rojo" : ""}">${py && E.pct < 100 ? esc(fC(py)) : "—"}</b></span></div>` : "";
    const nota = `<div class="a2-nt">Inicio: ${ini ? "primera orden" : "todavía no hay órdenes"} · prevista: ${pr ? esc(T.prevDe || "Gantt de la obra") : "sin fecha prevista (cargá el Gantt o la fecha estimada)"}</div>`;
    const k = (n, t) => `<div class="a2-k"><b>${n}</b><small>${t}</small></div>`;
    const kpis = `<div class="a2-ks">${k(T.trabajados, `días trabajados${T.habIni ? " de " + T.habIni + " hábiles" : ""}`)}${k(pr ? T.habPrev : "—", pr ? "días hábiles a la prevista" : "sin fecha prevista")}${k(T.ritmo != null ? fN(T.ritmo, 1) + "<small>%</small>" : "—", T.ritmo != null ? "por día (últ. 7)" + (T.haceFalta != null ? "; hace falta " + fN(T.haceFalta, 1) : "") : "todavía no hay ritmo")}${k(T.ultima ? esc(fDia(T.ultima)) : "—", "última vez que se trabajó")}</div>`;
    // curva: real, planeada (lineal, a confirmar) y a este ritmo (punteada)
    let svg = "";
    if (ini && T.serie.length) {
      const W = 600, H = 190, X = (f) => 34 + xPct(f) / 100 * (W - 50), Y = (p) => H - 22 - p / 100 * (H - 40);
      const real = T.serie.map(([f, p], i) => (i ? "L" : "M") + X(f).toFixed(1) + " " + Y(p).toFixed(1)).join(" ");
      const plan = pr ? `<path d="M${X(ini).toFixed(1)} ${Y(0)} L${X(pr).toFixed(1)} ${Y(100)}" stroke="#8a93a8" stroke-width="2" stroke-dasharray="6 5" fill="none"/>` : "";
      const proy = py && E.pct < 100 ? `<path d="M${X(hoy).toFixed(1)} ${Y(E.pct).toFixed(1)} L${X(py).toFixed(1)} ${Y(100)}" stroke="#28285E" stroke-width="2.4" stroke-dasharray="2 5" stroke-linecap="round" fill="none"/><circle cx="${X(py).toFixed(1)}" cy="${Y(100)}" r="5" fill="#fff" stroke="#FF3B30" stroke-width="2.4"/>` : "";
      svg = `<svg class="a2-curva" viewBox="0 0 ${W} ${H}" role="img" aria-label="Curva del avance real contra lo planeado"><g font-size="10" fill="#6E7C93" font-family="JetBrains Mono,monospace">${[0, 50, 100].map((p) => `<line x1="34" x2="${W - 16}" y1="${Y(p)}" y2="${Y(p)}" stroke="#e6eaf2"/><text x="2" y="${Y(p) + 3}">${p}%</text>`).join("")}<text x="${X(ini)}" y="${H - 6}">${esc(fC(ini))}</text>${pr ? `<line x1="${X(pr)}" x2="${X(pr)}" y1="${Y(100)}" y2="${Y(0)}" stroke="#c9d0dd"/><text x="${X(pr) - 14}" y="${H - 6}">${esc(fC(pr))}</text>` : ""}</g>${plan}<path d="${real} L${X(hoy).toFixed(1)} ${Y(0)} L${X(ini).toFixed(1)} ${Y(0)} Z" fill="rgba(40,40,94,.07)"/><path d="${real}" stroke="#28285E" stroke-width="2.6" fill="none"/>${proy}<circle cx="${X(hoy).toFixed(1)}" cy="${Y(E.pct).toFixed(1)}" r="4" fill="#28285E"/><text x="${(X(hoy) - 34).toFixed(1)}" y="${(Y(E.pct) - 8).toFixed(1)}" font-size="11" font-weight="700" fill="#0D1424">hoy ${E.pct}%</text></svg><div class="a2-cley"><span><i class="r"></i>Real</span><span><i class="p"></i>Planeado (lineal, a confirmar)</span><span><i class="y"></i>A este ritmo</span></div>`;
    }
    const chip = T.diasDesp > 0 && E.pct < 100 ? `<span class="a2-chipr">⏱ ${T.diasDesp} días después</span>` : "";
    return `<div class="card a2-card a2-tiempo"><div class="a2-ch"><h3>Tiempo de la obra</h3>${chip}</div>${linea}${nota}${kpis}${svg}</div>`;
  }
  function materialHtml(E) {
    const M = intentar(() => window.__matAvance.deObra(E.o), null);
    if (!M || !M.filas.length) return `<div class="card a2-card a2-mat"><div class="a2-ch"><h3>📦 Material para lo que falta</h3></div><div class="a2-nt">Sin cálculo de materiales para esta obra.</div></div>`;
    const fl = M.filas.map((f) => ({ f, ok: f.ent >= f.calc - 1e-6 }));
    const nOk = fl.filter((x) => x.ok).length, falt = fl.filter((x) => !x.ok);
    const cuad = fl.slice(0, 40).map((x) => `<i class="${x.ok ? "ok" : "no"}"></i>`).join("");
    const lista = st.matAbierto ? falt.slice(0, 12).map((x) => `<div class="a2-mf"><span><b>${esc(x.f.desc)}${x.f.codigo ? " · " + esc(x.f.codigo) : ""}</b><small>Faltan ${fN(r2(x.f.calc - x.f.ent))} ${esc(x.f.un)} · entregado ${fN(x.f.ent)} de ${fN(x.f.calc)}</small></span><button type="button" class="btn-primary a2-ped" data-a2="pedir">Pedir</button></div>`).join("") : "";
    return `<div class="card a2-card a2-mat"><button type="button" class="a2-ch a2-matb" data-a2="mat" aria-expanded="${!!st.matAbierto}"><h3>📦 Material para lo que falta</h3><small>${nOk} de ${fl.length} completos${falt.length ? " · falta " + falt.length : ""}</small><span class="a2-tri ${falt.length ? "am" : "ok"}">${falt.length ? "▲" : "✓"}</span></button><div class="a2-cuad">${cuad}</div>${lista}</div>`;
  }
  function terminadaHtml(E) {
    const L = E.L, l = L.cosas.filter((x) => x.r === "cierre").map((x) => { const r = E.RC[x.id], ok = r.h >= x.tot || r.estado === "nolleva"; return `<div class="a2-tf ${ok ? "ok" : ""}"><span>${ok ? "✓" : "⚠"}</span><span>${esc(x.label)}</span><small>${ok ? (r.doc && r.doc.fecha ? esc(fC(r.doc.fecha)) : r.hs ? "en revisión" : "listo") : "falta"}</small></div>`; }).join("");
    return `<div class="card a2-card"><div class="a2-ch"><h3>¿Está terminada?</h3><b class="${E.pct >= 100 ? "ok" : "rojo"}">${E.pct >= 100 ? "Sí" : "No"}</b></div>${l}</div>`;
  }
  function ultimoHtml(E, T) {
    const l = T.ev.slice().reverse().slice(0, 6);
    if (!l.length) return "";
    return `<div class="card a2-card"><div class="a2-ch"><h3>Lo último que pasó</h3></div>${l.map((x) => `<div class="a2-u ${x.e}"><i></i><span><b>${esc(x.t)}</b><small>${esc(x.s || "")}</small></span><small class="a2-uf">${esc(fDia(x.f))}</small></div>`).join("")}</div>`;
  }
  function pantallaHtml(E) {
    const T = tiempo(E);
    const rub = E.rubros.map((R) => rubroHtml(E, R)).join("");
    const der = materialHtml(E) + terminadaHtml(E) + ultimoHtml(E, T);
    return `${flashHtml(E, T)}<div class="a2-cuerpo"><div class="a2-izq">${tiempoHtml(E, T)}<div class="a2-mat-cel">${materialHtml(E)}</div><div class="card a2-card a2-rubros"><div class="a2-ch"><h3>Por rubro <small>· ${E.rubros.length}</small></h3><small>tocá para abrir</small></div>${rub}</div></div><div class="a2-der">${der}</div></div><div class="a2-msg" id="a2Msg" role="status" aria-live="polite">${esc(st.msg || "")}</div>`;
  }
  // ---------- dónde se pinta: el detalle de Avance de obra
  function pintar() {
    const card = $("avanceDetalleCard"); if (!card) return;
    const id = intentar(() => avanceActivoId, null), o = obraDe(id);
    const E = o && !off() ? estado(o) : null;
    if (!E) { card.classList.remove("a2-on", "a2-iz"); const a = $("a2App"); a && a.remove(); const b = $("a2Bar"); b && b.remove(); return; }
    if (st.id !== String(o.id)) { st.id = String(o.id); st.sel = null; st.selPaso = ""; st.iz = false; st.msg = ""; }
    card.classList.add("a2-on"); card.classList.toggle("a2-iz", !!st.iz);
    let app = $("a2App"); if (!app || app.parentNode !== card) { app && app.remove(); app = document.createElement("div"); app.id = "a2App"; app.className = "a2 a2-mio"; card.insertBefore(app, card.firstChild); }
    let bar = $("a2Bar"); if (!bar || bar.parentNode !== card) { bar && bar.remove(); bar = document.createElement("div"); bar.id = "a2Bar"; bar.className = "a2 a2-mio a2-izbar no-print"; card.insertBefore(bar, app.nextSibling); }
    const pi = pctItemizado(o);
    const hb = `<button type="button" class="btn-ghost" data-a2="volver">← Volver al avance de obra</button><span>🧾 <b>Itemizado (lo que se cobra): ${esc(String(pi))} %</b> · el avance de la obra va por las órdenes: <b>${E.pct} %</b></span>`;
    if (bar.__h !== hb) { bar.innerHTML = hb; bar.__h = hb; }
    if (st.iz) return;
    const h = pantallaHtml(E);
    if (app.__h !== h) { const y = window.scrollY; app.innerHTML = h; app.__h = h; if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y); }
  }
  let tPint = null;
  function refrescar() { CACHE.clear(); clearTimeout(tPint); tPint = setTimeout(() => { intentar(pintar, null); const h = $("a2Ov"); if (h && H) intentar(() => H.re && H.re(), null); }, 30); }
  function envolverDetalle() {
    const f = window.renderAvanceDetalle; if (typeof f != "function" || f.__av2) return;
    const n = function () { const r = f.apply(this, arguments); intentar(pintar, null); return r; };
    if (window.__heredar) window.__heredar(n, f); n.__av2 = 1; window.renderAvanceDetalle = n;
  }

  // ---------- hojas (.v7-ov con ✕): columna, celda, cosa, agregar, cómo se calcula, guardar
  let H = null;
  function hoja(html, re) {
    let ov = $("a2Ov");
    if (!ov) { ov = document.createElement("div"); ov.id = "a2Ov"; ov.className = "v7-ov v7-arriba no-print a2"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.addEventListener("click", (e) => { if (e.target === ov) cerrarHoja(); }); document.body.appendChild(ov); }
    ov.setAttribute("aria-label", "Avance de obra");
    const y = ov.firstChild ? ov.firstChild.scrollTop : 0;
    ov.innerHTML = `<div class="v7-caja a2-hoja"><div class="v7-asa"></div>${html}<div class="v7-msg a2-hmsg" id="a2HMsg" role="status" aria-live="polite"></div></div>`;
    if (ov.firstChild && y) ov.firstChild.scrollTop = y;
    H = Object.assign(H || {}, { re });
  }
  function cerrarHoja() { const v = $("a2Ov"); v && v.remove(); H = null; }
  const hmsg = (t, mal) => { const m = $("a2HMsg"); if (m) { m.textContent = t; m.classList.toggle("mal", !!mal); } };
  const cab = (t, s) => `<div class="v7-cab"><div><h3>${t}</h3>${s ? `<small>${s}</small>` : ""}</div><button type="button" class="v7-x" data-a2="x" aria-label="Cerrar">✕</button></div>`;
  const motivoInput = () => (puede() ? `<label for="a2Mot" class="a2-lbl">Motivo (obligatorio para cualquier cambio)</label><input id="a2Mot" type="text" maxlength="200" placeholder="Ej: lo hicieron sin orden · lo vi en obra · corrijo un error" autocomplete="off">` : "");
  function hojaColumna(id, i) {
    const o = obraDe(id), E = estado(o); if (!E) return;
    const c = E.L.cols[i]; if (!c) return;
    H = { tipo: "col", id: o.id, i };
    const ec = estadoCol(E, i), ed = puede(), piezas = piezasDe(c), pf = E.piezaFalta[i] || {};
    const grupos = E.L.pasos.map((p) => {
      const r = E.R[p.id + "|" + i], ok = HECHO[r.e];
      const pz = piezas.filter((z) => z.paso === p.id).map((z) => { const v = pf[z.id], falta = v && v.e === "falta" && num(v.cant) > 0 ? Math.min(z.cant, num(v.cant)) : 0; return `<div class="a2-pz ${falta ? "falta" : ok ? "ok" : ""}"><span>${falta ? "⚠" : ok ? "✓" : "·"} ${esc(z.t)}${z.cod ? " · " + esc(z.cod) : ""}</span><b>${ok || falta ? (z.cant - falta) + " de " + z.cant : z.cant}</b>${ed && (ok || falta) ? `<button type="button" class="a2-link" data-a2="${falta ? "pzOk" : "pzFalta"}" data-pz="${z.id}">${falta ? "Ya está" : "Le falta"}</button>` : ""}</div>`; }).join("");
      const acc = ed ? `<div class="a2-pacc">${r.e === "nolleva" ? `<button type="button" class="a2-link" data-a2="pMarcar" data-p="${p.id}" data-ac="desmarcar">Sí lleva</button>` : ok || r.e === "pieza" ? `<button type="button" class="a2-link" data-a2="pMarcar" data-p="${p.id}" data-ac="desmarcar">Destildar</button><button type="button" class="a2-link rojo" data-a2="pMarcar" data-p="${p.id}" data-ac="falla">Se arruinó</button><button type="button" class="a2-link" data-a2="pMarcar" data-p="${p.id}" data-ac="obs">Observado</button>` : `<button type="button" class="a2-link" data-a2="pMarcar" data-p="${p.id}" data-ac="marcar">✓ Marcar hecho</button>${r.e === "falla" || r.e === "obs" ? "" : `<button type="button" class="a2-link" data-a2="pMarcar" data-p="${p.id}" data-ac="nolleva">No lleva</button>`}`}</div>` : "";
      const fot = r.fotoId ? `<button type="button" class="a2-foto" data-a2="foto" data-f="${esc(r.fotoId)}">${r.mini ? `<img src="${esc(r.mini)}" alt="">` : "📷"} Ver foto</button>` : "";
      return `<div class="a2-pg ${r.e}"><div class="a2-pgh"><span class="a2-c ${r.e === "sinver" ? "sinver" : r.e}">${esc(EST[r.e][1])}</span><b>${esc(p.l)}</b><small>${esc(EST[r.e][0])}</small></div><div class="a2-or${r.e === "mano" || r.destildado ? " mano" : ""}">${esc(origenTxt(r))}</div>${r.dup && r.dup.length ? `<div class="a2-or rojo">También figura en ${esc(r.dup.map((d) => d.ot).join(", "))} (cuenta una sola vez)</div>` : ""}${fot}${pz}${acc}</div>`;
    }).join("");
    const hist = arr(obj(o.av2).hist).filter((h) => arr(h.cambios).some((x) => String(x.key).indexOf("_" + c.key) >= 0)).slice(-6).reverse().map((h) => `<div class="a2-hi"><b>${esc(fDia(fechaDe(h.ts)))} ${esc(hhmm(h.ts))} · ${esc(primero(h.porNombre))}${h.porAsistente ? " (asistente)" : ""}</b><small>${esc(arr(h.cambios).filter((x) => String(x.key).indexOf("_" + c.key) >= 0).map((x) => x.txt).join(" · "))}${h.motivo ? " · «" + esc(h.motivo) + "»" : ""}</small></div>`).join("");
    const falta = (c.faltan || []).map((x) => x.faltan + " " + x.t).join(", ");
    hoja(cab(esc(c.num), `${c.tipo === "MET" ? "Metálica" : "PRFV"} ${c.alt} m · ${c.art} ${c.art === 1 ? "artefacto" : "artefactos"}${c.artDe === "a confirmar" ? " (a confirmar)" : ""}${c.jab ? " · lleva jabalina" : ""} · ${ec.n} de ${ec.t} pasos`)
      + (ed && ec.n < ec.t ? `<button type="button" class="btn-primary a2-big" data-a2="completa">✅ Columna completa</button>` : "")
      + (falta ? `<button type="button" class="btn-ghost a2-pedir" data-a2="pedir">Pedir ${esc(falta)}</button>` : "")
      + motivoInput() + `<div class="a2-pgs">${grupos}</div>` + (hist ? `<div class="a2-et">Historial</div>${hist}` : ""), () => hojaColumna(id, i));
  }
  function hojaCosa(id, cid) {
    const o = obraDe(id), E = estado(o); if (!E) return;
    const x = E.L.cosas.find((c) => c.id === cid); if (!x) return;
    H = { tipo: "cosa", id: o.id, cid };
    const r = E.RC[x.id], ed = puede() && !x.doc;
    const fu = r.fuentes.map((f) => `<div class="a2-hi"><b>${esc(f.ot || "")} · ${esc(fDia(f.fecha))}</b><small>${fN(f.cant)} ${esc(x.un || "")}${f.est === "sinver" ? " · sin cerrar (en revisión)" : " · orden cerrada"}${f.sinCol ? " · sin columna exacta" : ""}</small></div>`).join("") || `<div class="a2-nt">${x.doc ? (r.doc && r.doc.ok ? "Está en «📄 Documentación» del legajo." : "Se carga en «📄 Documentación» del legajo.") : "Ninguna orden todavía."}</div>`;
    const man = r.man ? `<div class="a2-or mano">${esc(origenTxt(Object.assign({ e: r.man.e === "cant" ? "mano" : r.man.e }, r.man)))}</div>` : "";
    const ctrl = ed ? (x.bin ? `<div class="a2-acc">${r.h >= 1 ? `<button type="button" class="btn-ghost" data-a2="kMarcar" data-ac="desmarcar">Destildar</button><button type="button" class="btn-ghost rojo" data-a2="kMarcar" data-ac="falla">Se arruinó</button>` : `<button type="button" class="btn-primary" data-a2="kMarcar" data-ac="marcar">✓ Marcar hecho</button><button type="button" class="btn-ghost" data-a2="kMarcar" data-ac="nolleva">No lleva</button>`}</div>` : `<label for="a2Cant" class="a2-lbl">Hecho (${esc(x.un)})</label><div class="a2-acc"><input id="a2Cant" type="number" inputmode="decimal" min="0" max="${x.tot}" value="${r.h}"><button type="button" class="btn-primary" data-a2="kCant">Guardar</button><button type="button" class="btn-ghost" data-a2="kMarcar" data-ac="nolleva">No lleva</button></div>`) : x.doc && puede() ? `<button type="button" class="btn-ghost" data-a2="doc">📄 Abrir Documentación</button>` : "";
    hoja(cab(esc(x.label), `${RUBN[x.r]} · ${x.bin ? (r.h >= 1 ? "hecho" : "falta") : fN(r.h) + " de " + fN(x.tot) + " " + esc(x.un)}${r.estado ? " · " + esc(EST[r.estado][0]) : ""}`) + `<div class="a2-et">De dónde sale</div>${fu}${man}${ed ? motivoInput() : ""}${ctrl}`, () => hojaCosa(id, cid));
  }
  function hojaAgregar(id, rub) {
    H = { tipo: "agregar", id, r: rub };
    hoja(cab("＋ Agregar algo que lleva", esc(RUBN[rub] || "")) + `<label for="a2AgT" class="a2-lbl">Qué es</label><input id="a2AgT" type="text" maxlength="80" placeholder="Ej: reparación de vereda frente al tablero"><div class="a2-acc"><span><label for="a2AgC" class="a2-lbl">Cantidad</label><input id="a2AgC" type="number" min="1" value="1"></span><span><label for="a2AgU" class="a2-lbl">Unidad</label><input id="a2AgU" type="text" maxlength="20" placeholder="Un., m…"></span></div>${motivoInput()}<button type="button" class="btn-primary a2-big" data-a2="agregarOk">Agregar</button>`);
  }
  function hojaComo(id) {
    const o = obraDe(id), E = estado(o); if (!E) return;
    H = { tipo: "como", id };
    const L = E.L, filas = [];
    L.pasos.forEach((p) => { const n = L.cols.filter((c, i) => E.R[p.id + "|" + i].e !== "nolleva").length; const w = L.cols.reduce((s, c, i) => s + (E.R[p.id + "|" + i].e === "nolleva" ? 0 : hhDe(p.k, 1) * (p.porArt ? c.art : 1)), 0); filas.push([RUBN[p.r], p.l + " (por columna)", fN(hhDe(p.k, 1)) + (p.porArt ? " × artefacto" : ""), n, w]); });
    L.cosas.forEach((x) => { if (E.RC[x.id].estado === "nolleva") return; filas.push([RUBN[x.r], x.label, fN(x.hh), fN(x.tot) + " " + (x.un || ""), x.hh * x.tot]); });
    const tot = filas.reduce((s, f) => s + f[4], 0) || 1;
    hoja(cab("¿Cómo se calcula el %?", esc(nombreObra(o)))
      + `<div class="a2-txt"><p>El % de la obra es <b>lo hecho sobre todo lo que lleva</b>, y cada cosa pesa sus <b>horas-hombre</b> del diccionario de tareas (v108): una columna izada (3 HH) pesa más que un sellado (0,5 HH). Los pesos son <b>a confirmar</b> con los capataces.</p><p>Se mueve solo con las órdenes: lo que la cuadrilla manda cuenta enseguida como <b>en revisión</b> (color claro) y pasa a <b>hecho</b> cuando la oficina cierra la orden o toca «✅ Está bien». Una falla, una observación o una pieza que falta <b>restan</b> hasta que se arreglan.</p><p>El itemizado sigue siendo <b>lo que se cobra</b> (certificación, módulos K): ${esc(String(pctItemizado(o)))} % en «🧾 Ver itemizado». Hecho verificado (sin lo que está en revisión): ${E.pctVer} %.</p></div>`
      + `<div class="a2-tw"><table class="a2-tab"><thead><tr><th>Rubro</th><th>Qué</th><th>HH c/u</th><th>Cant.</th><th>% del total</th></tr></thead><tbody>${filas.map((f) => `<tr><td>${esc(f[0])}</td><td>${esc(f[1])}</td><td>${esc(f[2])}</td><td>${esc(String(f[3]))}</td><td>${fN(f[4] / tot * 100, 1)} %</td></tr>`).join("")}</tbody></table></div>`);
  }
  function hojaCelda(id, p, i) {
    const o = obraDe(id), E = estado(o); if (!E) return;
    const c = E.L.cols[i], r = E.R[p + "|" + i]; if (!c || !r) return;
    H = { tipo: "cel", id: o.id, p, i };
    const ed = puede(), ok = HECHO[r.e] || r.e === "pieza";
    const fot = r.fotoId ? `<button type="button" class="a2-foto" data-a2="foto" data-f="${esc(r.fotoId)}">${r.mini ? `<img src="${esc(r.mini)}" alt="">` : "📷"} Ver foto</button>` : "";
    const acc = ed ? `<div class="a2-acc">${ok ? `<button type="button" class="btn-ghost" data-a2="pMarcar" data-p="${p}" data-ac="desmarcar">No se hizo (destildar)</button><button type="button" class="btn-ghost rojo" data-a2="pMarcar" data-p="${p}" data-ac="falla">Se arruinó</button><button type="button" class="btn-ghost" data-a2="pMarcar" data-p="${p}" data-ac="obs">Observado</button>` : r.e === "nolleva" ? `<button type="button" class="btn-ghost" data-a2="pMarcar" data-p="${p}" data-ac="desmarcar">Sí lleva</button>` : `<button type="button" class="btn-primary" data-a2="pMarcar" data-p="${p}" data-ac="marcar">✓ Está hecho</button><button type="button" class="btn-ghost" data-a2="pMarcar" data-p="${p}" data-ac="nolleva">No lleva</button>`}<button type="button" class="btn-ghost" data-a2="col" data-i="${i}">Ver la columna</button></div>` : `<div class="a2-acc"><button type="button" class="btn-ghost" data-a2="col" data-i="${i}">Ver la columna</button></div>`;
    hoja(cab(esc(c.num) + " · " + esc(PASO[p].l), esc(EST[r.e][0])) + `<div class="a2-et">De dónde sale</div><div class="a2-or${r.e === "mano" ? " mano" : ""}">${esc(origenTxt(r))}</div>${r.dup && r.dup.length ? `<div class="a2-or rojo">También figura en ${esc(r.dup.map((d) => d.ot).join(", "))} (cuenta una sola vez)</div>` : ""}${r.e === "frag" ? `<div class="a2-av" role="status">⏳ Fraguando hasta ${esc(fDia(fechaDe(r.fragHasta)))} ${esc(hhmm(r.fragHasta))} (${fraguadoH()} h)</div>` : ""}${fot}${ed ? motivoInput() : ""}${acc}`, () => hojaCelda(id, p, i));
  }
  function hojaGuardar(id) {
    const o = obraDe(id), E = estado(o); if (!E) return;
    H = { tipo: "guardar", id: o.id };
    hoja(cab("💾 Guardar el avance armado", esc(nombreObra(o))) + `<div class="a2-txt"><p>La app armó el avance con lo que dicen las órdenes (${E.pct} %). Hasta ahora <b>no se escribió nada</b> en la obra.</p><p>¿Lo guardo como está? Después se sigue moviendo solo con las órdenes.</p></div><div class="a2-acc"><button type="button" class="btn-ghost" data-a2="x">No</button><button type="button" class="btn-primary" data-a2="guardarSi">Sí, guardar</button></div>`);
  }
  // ---------- toques
  async function hacer(P, motivoSel) {
    const mot = String((($(motivoSel || "a2Mot") || {}).value) || "").trim();
    if (P.err) { hmsg(P.err, true); msgPant(P.err); return null; }
    if (mot.length < 3) { hmsg("Escribí el motivo (queda en el historial).", true); msgPant("Escribí el motivo."); const i = $(motivoSel || "a2Mot"); i && i.focus(); return null; }
    const r = await aplicar(P, mot);
    hmsg(r.txt, !r.ok); msgPant(r.txt);
    return r;
  }
  function msgPant(t) { st.msg = t; const m = $("a2Msg"); if (m) m.textContent = t; }
  document.addEventListener("click", async (e) => {
    const t = e.target && e.target.closest ? e.target.closest("[data-a2]") : null; if (!t || !t.closest(".a2")) return;
    const a = t.dataset.a2, id = (H && H.id) || st.id;
    if (a === "x") return cerrarHoja();
    if (a === "rub") { st.abiertos[t.dataset.r] = !st.abiertos[t.dataset.r]; return pintar(); }
    if (a === "col") return hojaColumna(st.id, +t.dataset.i);
    if (a === "cel") { if (st.sel) { const i = +t.dataset.i; st.sel.has(i) ? st.sel.delete(i) : st.sel.add(i); if (!st.selPaso) st.selPaso = t.dataset.p; return pintar(); } return hojaCelda(st.id, t.dataset.p, +t.dataset.i); }
    if (a === "cosa") return hojaCosa(st.id, t.dataset.id);
    if (a === "selOn") { st.sel = new Set(); st.selPaso = ""; st.abiertos.columnas = true; return pintar(); }
    if (a === "selOff") { st.sel = null; st.selPaso = ""; return pintar(); }
    if (a === "selTodas") { const E = estado(st.id); st.sel = new Set(E.L.cols.map((c) => c.i)); return pintar(); }
    if (a === "selNinguna") { st.sel = new Set(); return pintar(); }
    if (a === "elegir") { const i = +t.dataset.i; st.sel.has(i) ? st.sel.delete(i) : st.sel.add(i); st.selMot = ($("a2SelMot") || {}).value || st.selMot; return pintar(); }
    if (a === "selPaso") { st.selPaso = t.dataset.p; st.selMot = ($("a2SelMot") || {}).value || st.selMot; return pintar(); }
    if (a === "selMarcar") {
      const E = estado(st.id), cols = [...st.sel].map((i) => E.L.cols[i].num);
      const P = planMarcar({ obra: st.id, columnas: cols, pasos: st.selPaso === "todo" ? "todo" : [st.selPaso], accion: st.selPaso === "todo" ? "completa" : "marcar" });
      const r = await hacer(P, "a2SelMot"); if (r && r.ok) { st.sel = null; st.selPaso = ""; st.selMot = ""; } return pintar();
    }
    if (a === "completa") { const E = estado(id), c = E.L.cols[H.i]; const r = await hacer(planMarcar({ obra: id, columnas: [c.num], accion: "completa" })); if (r && r.ok) hojaColumna(id, H.i); return; }
    if (a === "pMarcar") {
      const E = estado(id), i = H.i, c = E.L.cols[i], ac = t.dataset.ac;
      const mot = String(($("a2Mot") || {}).value || "").trim();
      const r = await hacer(planMarcar({ obra: id, columnas: [c.num], pasos: [t.dataset.p], accion: ac, motivo: mot }));
      if (r && r.ok) { H.tipo === "cel" ? cerrarHoja() : hojaColumna(id, i); } return;
    }
    if (a === "pzFalta" || a === "pzOk") { const E = estado(id), c = E.L.cols[H.i]; const r = await hacer(planMarcar({ obra: id, columnas: [c.num], pieza: t.dataset.pz, accion: a === "pzOk" ? "pieza_ok" : "pieza_falta", cant: 1 })); if (r && r.ok) hojaColumna(id, H.i); return; }
    if (a === "kMarcar") { const r = await hacer(planMarcar({ obra: id, cosa: H.cid, accion: t.dataset.ac, motivo: String(($("a2Mot") || {}).value || "") })); if (r && r.ok) hojaCosa(id, H.cid); return; }
    if (a === "kCant") { const r = await hacer(planMarcar({ obra: id, cosa: H.cid, accion: "marcar", cant: num(($("a2Cant") || {}).value) })); if (r && r.ok) hojaCosa(id, H.cid); return; }
    if (a === "agregar") return hojaAgregar(st.id, t.dataset.r);
    if (a === "agregarOk") { const mot = String(($("a2Mot") || {}).value || "").trim(); if (mot.length < 3) return hmsg("Escribí el motivo.", true); const r = await agregarCosa(id, { r: H.r, label: ($("a2AgT") || {}).value, cant: ($("a2AgC") || {}).value, un: ($("a2AgU") || {}).value }, mot); hmsg(r.txt, !r.ok); if (r.ok) cerrarHoja(); return; }
    if (a === "como") return hojaComo(st.id);
    if (a === "guardarArmado") return hojaGuardar(st.id);
    if (a === "guardarSi") { const r = await guardarArmado(id); hmsg(r.txt, !r.ok); msgPant(r.txt); if (r.ok) cerrarHoja(); return; }
    if (a === "itemizado") { st.iz = true; pintar(); intentar(() => $("avanceDetalleCard").scrollIntoView({ block: "start" }), null); return; }
    if (a === "volver") { st.iz = false; return pintar(); }
    if (a === "legajo") { intentar(() => window.abrirLegajo(st.id), null); return; }
    if (a === "control") { intentar(() => window.__auditAvance.abrir({ obra: st.id }), null); return; }
    if (a === "mat") { st.matAbierto = !st.matAbierto; return pintar(); }
    if (a === "pedir") { if (window.__pedidoCompras && window.__pedidoCompras.abrir) { cerrarHoja(); window.__pedidoCompras.abrir(); } else avisar("Pedilo desde Pañol › Lista de compras."); return; }
    if (a === "doc") { cerrarHoja(); intentar(() => window.__docObra.abrirDoc(id), null); return; }
    if (a === "foto") { intentar(() => window.verAdjunto(t.dataset.f), null); return; }
    if (a === "alerta") { st.abiertos.columnas = true; pintar(); intentar(() => document.querySelector("#a2App .a2-grilla").scrollIntoView({ block: "center", behavior: "smooth" }), null); return; }
  });
  document.addEventListener("input", (e) => { if (e.target && e.target.id === "a2SelMot") st.selMot = e.target.value; });
  // las órdenes cambian sin que se vuelva a pintar el detalle: se revisa cada tanto con Avance a la vista
  setInterval(() => { if (document.hidden || off()) return; const v = $("viewAvance"); if (!v || v.style.display === "none" || st.iz) return; if (document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return; intentar(pintar, null); }, 4000);

  // ============================================================== para el asistente, el auditor y los demás
  function paraIa(obra, col) {
    const o = obraDe(obra) || obras().find((x) => nk(x.nombre).indexOf(nk(obra)) >= 0 || String(x.obraId || "") === String(obra));
    if (!o) return { err: "No encontré la obra." };
    const E = estado(o); if (!E) return { obra: nombreObra(o), sinLista: true, avanceItemizado: pctItemizado(o), nota: "Esta obra no tiene la lista del avance nuevo (sin columnas ni cálculo): el % es el del itemizado." };
    const L = E.L, T = tiempo(E);
    const porCol = L.cols.map((c, i) => {
      const falta = [], hecho = [], raro = [];
      L.pasos.forEach((p) => { const r = E.R[p.id + "|" + i]; if (r.e === "nolleva") return; if (HECHO[r.e]) hecho.push(p.t + (r.e === "sinver" ? " (en revisión)" : r.e === "frag" ? " (fraguando)" : r.e === "mano" ? " (a mano)" : "")); else if (r.e === "falta") falta.push(p.l); else raro.push(p.l + ": " + EST[r.e][0] + (r.motivo ? " (" + r.motivo + ")" : "") + (r.pieza ? " (" + r.pieza.t + ")" : "")); });
      return { columna: c.num, falta, piezasQueFaltan: (c.faltan || []).map((x) => x.faltan + " " + x.t + (x.cod ? " (" + x.cod + ")" : "")), problemas: raro, hecho };
    });
    const cosas = L.cosas.map((x) => { const r = E.RC[x.id]; return { rubro: RUBN[x.r], que: x.label, hecho: r.h, de: x.tot, un: x.un, estado: r.estado ? EST[r.estado][0] : r.h >= x.tot ? (r.hs > 0 ? "hecho, en revisión" : "hecho") : "falta" }; });
    const r = { obra: nombreObra(o), ID: o.obraId || "", avanceObraPct: E.pct, avanceVerificadoPct: E.pctVer, avanceItemizadoPct: pctItemizado(o), rubros: E.rubros.map((R) => ({ rubro: R.t, pct: R.pct, listas: R.listas + " de " + R.total })), falta: faltaTxt(E, 12), terminada: terminada(E), inicio: T.ini, prevista: T.prevista || "sin fecha prevista", aEsteRitmo: T.proy || "sin ritmo todavía", diasDespues: T.diasDesp, ritmoPctDia: T.ritmo, guardado: E.guardado };
    if (col) { const cs = colsDe(L, [col]); r.columnas = porCol.filter((x) => cs.some((c) => c.num === x.columna)); if (!r.columnas.length) r.columnaNoEncontrada = col; }
    else { r.columnas = porCol.filter((x) => x.falta.length || x.problemas.length || x.piezasQueFaltan.length).slice(0, 40); r.columnasCompletas = porCol.filter((x) => !x.falta.length && !x.problemas.length && !x.piezasQueFaltan.length).map((x) => x.columna); }
    r.otrasCosas = cosas;
    r.dosVeces = E.dupsOt.map((x) => `${x.ot}: ${fN(x.sobra)} de ${labelDe(x.k)} de más (no hay columnas que falten)`);
    return r;
  }
  // el auditor (v156): si el % del avance y el del itemizado difieren mucho, y lo mismo hecho dos veces
  const DIF_PCT = 25;   // a confirmar
  function hallazgosAuditor(o) {
    const E = estado(o); if (!E) return [];
    const out = [], pi = pctItemizado(o);
    if (Math.abs(E.pct - pi) >= DIF_PCT) out.push({ nivel: "ambar", tipo: "dosPct", texto: `El avance de la obra (${E.pct} %, por las órdenes) y el itemizado (${pi} %, lo que se cobra) difieren ${Math.abs(E.pct - pi)} puntos. Mirá qué no se cargó en el itemizado o qué falta marcar en el avance.` });
    const dup = []; E.L.pasos.forEach((p) => E.L.cols.forEach((c, i) => { const r = E.R[p.id + "|" + i]; if (r.dup && r.dup.length) dup.push(`${c.num} · ${p.t}: ${r.ot} y ${r.dup.map((d) => d.ot).join(", ")}`); }));
    if (dup.length) out.push({ nivel: "ambar", tipo: "dosVecesAv2", texto: `La misma columna figura hecha en dos órdenes (en el avance cuenta una sola vez): ${dup.slice(0, 6).join("; ")}.` });
    const fa = alertas(E).falla; if (fa.length) out.push({ nivel: "info", tipo: "fallaAv2", texto: `Fallas para rehacer: ${fa.slice(0, 6).map((x) => x.c.num + " · " + (x.r.motivo || x.p.t)).join("; ")}.` });
    return out.map((h) => Object.assign({ obraId: o.id, obra: nombreObra(o) }, h));
  }
  function envolverAuditor() {
    const A = window.__auditAvance; if (!A || A.__av2) return;
    const rv = A.revisar, eo = A.explicarObra;
    A.revisar = function (a) { const R = rv.apply(this, arguments); if (off() || !R) return R; intentar(() => { a = a || {}; const l = a.obra ? [obraDe(a.obra)].filter(Boolean) : obras().filter((o) => o && o.id !== "__sinObra"); l.forEach((o) => { if (a.zona && window.__zonaContrato && !intentar(() => window.__zonaContrato.zonaDeObra(o), true)) return; hallazgosAuditor(o).forEach((h) => { h.clave = [h.tipo, h.obraId].join("|"); R.hallazgos.push(h); }); }); R.rojos = R.hallazgos.filter((h) => h.nivel === "rojo").length; R.ambar = R.hallazgos.filter((h) => h.nivel === "ambar").length; }, null); return R; };
    if (typeof eo == "function") A.explicarObra = function (id) { const O = eo.apply(this, arguments); if (off() || !O || O.err) return O; intentar(() => { const o = obraDe(id) || obras().find((x) => nk(x.nombre) === nk(O.obra)); if (!o) return; O.avanceItemizadoPct = pctItemizado(o); const P = paraIa(o); if (!P.sinLista) { O.avanceNuevo = { avanceObraPct: P.avanceObraPct, rubros: P.rubros, falta: P.falta, columnas: P.columnas, terminada: P.terminada }; O.hallazgos = arr(O.hallazgos).concat(hallazgosAuditor(o)); } }, null); return O; };
    A.__av2 = 1;
  }
  function init() { envolverPct(); envolverDetalle(); envolverAuditor(); }
  init(); setTimeout(init, 0); setTimeout(init, 1500);
  window.__av2 = { lista, estado, pct, pctItemizado, piezasDe, planMarcar, aplicar, guardarArmado, agregarCosa, tiempo, faltaTxt, alertas, terminada, paraIa, hallazgosAuditor, pintar, puede, puedeVer, abrirColumna: hojaColumna, cerrarHoja, TAREA_AV, PASOS, RUB, HH_BIN, estadoCol, refrescar, st };
})();
