(function () {
  "use strict";
  // v170 · Avance de obra: carga rápida a mano (Ángel, 18/11: «en avance de obra no se puede editar… quieren llenar el avance de
  //  obra para ponerlo al día y está difícil entrar a columna. Y poder poner: ya pusieron diez columnas — y un cartel: eso significa
  //  que las bases y el hormigón están hechas… columnas todas puestas o solo 8 de 10, pero editado rápido. Sacar el cartel que te
  //  pide explicaciones por ahora, hasta que lo pongamos al día»).
  //  · Tarjeta «✏ Carga rápida» arriba del avance: cada paso de la columna (pozo, hormigón, izaje…) con «Todas» / «Ninguna» /
  //    − N + «de 12» y «Listo»; las cosas sin columna (zanja, cable, tablero…) igual (o «✓ Hecho» si son de una vez).
  //    Sube marcando las primeras que faltan (en orden); baja sacando las últimas marcadas a mano (lo de las órdenes no se toca).
  //  · En cascada: marcar un paso marca los anteriores de esa columna (PRE, a confirmar) con el cartel «… también marca pozo y
  //    hormigón de esas 10 (ya fraguado)» «Sí» / «Solo el izaje»; sacar uno pregunta «¿También sacás los pasos que siguen?».
  //  · La grilla: «✏ Tocar marca» (de entrada prendido): tocar una celda la marca / desmarca sin hoja; mantener apretado (o una celda
  //    que viene de una orden, con falla, observada…) abre la hoja de siempre.
  //  · Motivo: por ahora NO se pide (queda «Carga rápida del avance»); Administración lo vuelve a pedir con «Pedir motivo al cambiar
  //    el avance a mano: Sí» (configEquipo/baremo.avanceMotivo). El asistente sigue con su motivo.
  //  · «↶ Deshacer» 10 s después de cada cambio (vuelve las claves de av2.m como estaban; queda en el historial).
  //  Las órdenes siguen moviendo el avance encima (v158/v163 sin cambios). Pruebas viejas: __v170No → todo como la v169.
  if (window.__avRap) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const arr = (x) => (Array.isArray(x) ? x : []);
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const intentar = (fn, def) => { try { return fn(); } catch (e) { return def; } };
  const fN = (n, d) => { try { return Number(n).toLocaleString("es-AR", { maximumFractionDigits: d == null ? 2 : d }); } catch (e) { return String(n); } };
  const off = () => !!(window.__v170No || window.__v158No);
  const MOT = "Carga rápida del avance";
  // ¿se pide el motivo al cambiar el avance a mano? (lo leen avanceObra2 y el ítem por ítem del itemizado v156)
  window.__avMotivoPide = () => (window.__v170No ? true : !!obj(window.__baremoNube).avanceMotivo);
  const pideMot = () => window.__avMotivoPide();
  const AV = () => window.__av2;
  const yoMail = () => String((window.__fbUser || {}).email || "");
  const yoNombre = () => intentar(() => { const y = PERMISOS.yo() || {}; return y.nombre || y.persona || y.usuario || yoMail().split("@")[0]; }, yoMail());
  const rolYo = () => intentar(() => String((PERMISOS.yo() || {}).rol || ""), "");
  const puede = () => !off() && !!AV() && intentar(() => AV().puede(), false);
  const auditar = (t, d) => { try { typeof window.fbAuditar == "function" && window.fbAuditar(t, d); } catch (e) { } };
  const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };

  const HECHO = { ver: 1, sinver: 1, mano: 1, frag: 1 };
  // qué pasos van antes de cada uno en la misma columna (orden de los PASOS de la v158; a confirmar con los capataces)
  const PRE = { horm: ["pozo"], acab: ["pozo", "horm"], izaje: ["pozo", "horm"], aplom: ["pozo", "horm", "izaje"], vinc: ["pozo", "horm", "izaje"], artef: ["pozo", "horm", "izaje", "vinc"], subida: ["pozo", "horm", "izaje"], tabl: ["pozo", "horm", "izaje"], sello: ["pozo", "horm", "izaje"] };
  const NOM = { pozo: "pozo", horm: "hormigón", acab: "acabado", izaje: "izaje", aplom: "aplomado", vinc: "vínculo", artef: "artefacto", subida: "subida", tabl: "tablerito", sello: "sellado", pat: "jabalina" };
  const ADJ = { pozo: ["con pozo", "con pozo"], horm: ["hormigonada", "hormigonadas"], acab: ["con acabado", "con acabado"], izaje: ["izada", "izadas"], aplom: ["aplomada", "aplomadas"], vinc: ["con vínculo", "con vínculo"], artef: ["con artefacto", "con artefacto"], subida: ["con subida", "con subida"], tabl: ["con tablerito", "con tablerito"], sello: ["sellada", "selladas"], pat: ["con jabalina", "con jabalina"] };
  const SAC = { pozo: ["pozo", "pozos"], horm: ["hormigón", "hormigones"], acab: ["acabado", "acabados"], izaje: ["izaje", "izajes"], aplom: ["aplomado", "aplomados"], vinc: ["vínculo", "vínculos"], artef: ["artefacto", "artefactos"], subida: ["subida", "subidas"], tabl: ["tablerito", "tableritos"], sello: ["sellado", "sellados"], pat: ["jabalina", "jabalinas"] };
  const y = (l) => (l.length < 2 ? l.join("") : l.slice(0, -1).join(", ") + " y " + l[l.length - 1]);
  const kCel = (p, c) => "c_" + p + "_" + c.key;
  const aMano = (r) => !!r && (r.e === "mano" || (r.e === "frag" && r.eOrig === "mano") || (r.e === "pieza" && r.ePrev === "mano"));
  const libre = (r) => !!r && r.e === "falta";

  const S = { dr: {}, obra: "", kAb: false, cerrada: ls("ema.av.rap.cerrada") === "1", toque: ls("ema.av.rap.toque") !== "0", pend: null, deshacer: null, tCartel: null, mot: "", down: null };
  const modoToque = () => S.toque && puede();

  // ============================================================== las cuentas de cada paso y de cada cosa
  function cuentaPaso(E, p) {
    const F = [], Rm = []; let n = 0, t = 0, raros = 0;
    E.L.cols.forEach((c, i) => {
      const r = E.R[p + "|" + i]; if (!r || r.e === "nolleva") return; t++;
      if (HECHO[r.e]) n++;
      if (libre(r)) F.push(i); else if (aMano(r) && r.e !== "pieza") Rm.push(i); else if (!HECHO[r.e]) raros++;
    });
    return { n, t, F, Rm, min: n - Rm.length, max: n + F.length, raros };
  }
  function cuentaCosa(E, x) {
    const r = E.RC[x.id], ord = Math.min(x.tot, r.fuentes.reduce((s, f) => s + num(f.cant), 0));
    return { r, n: r.h, t: x.tot, min: x.bin ? (ord > 0 ? 1 : 0) : ord, max: x.tot, roto: !!r.estado, ord };
  }
  const paso = (E, p) => E.L.pasos.find((q) => q.id === p);

  // ============================================================== planes (sin escribir)
  // sin fecha real (como «⚡ Poner al día», v163: pd): pone al día lo hecho antes de hoy; no entra en el ritmo, ni en «Lo último que
  //  pasó», ni en el número del día; cuenta desde el principio en la curva. Quién y cuándo quedan en ts / por / av2.hist (auditoría).
  const valSi = (p) => Object.assign({ e: "si", ts: Date.now(), por: yoMail(), porNombre: yoNombre(), motivo: "", rapido: 1, pd: 1 }, p === "horm" ? { fragOk: true } : {});
  const valNo = () => ({ e: "no", ts: Date.now(), por: yoMail(), porNombre: yoNombre(), motivo: "", rapido: 1, pd: 1 });
  const sinFecha = (P) => { if (P && P.cambios) P.cambios.forEach((c) => { c.val.pd = 1; c.val.rapido = 1; }); return P; };
  function planSubir(E, p, idx, cascada) {
    const cambios = [], filas = [], pre = cascada ? arr(PRE[p]).filter((q) => paso(E, q)) : [];
    idx.forEach((i) => {
      const c = E.L.cols[i];
      pre.concat([p]).forEach((q) => { const r = E.R[q + "|" + i]; if (!libre(r)) return; cambios.push({ key: kCel(q, c), val: valSi(q), txt: `${c.num} · ${paso(E, q).t}: Falta → Hecho (a mano, carga rápida)` }); filas.push({ c: c.num + " · " + paso(E, q).l, a: "Falta", d: "Hecho" }); });
    });
    // el hormigón de una orden todavía fraguando: se marca igual y se avisa (como la v163)
    const frag = PRE[p] && arr(PRE[p]).indexOf("horm") >= 0 ? idx.filter((i) => (E.R["horm|" + i] || {}).e === "frag").map((i) => E.L.cols[i].num) : [];
    return { o: E.o, E, cambios, avisos: frag.length ? [y(frag) + (frag.length === 1 ? " está fraguando" : " están fraguando") + " (quedó marcado igual)"] : [], filas, n: idx.length };
  }
  function planBajar(E, p, idx, siguen) {
    const cambios = [], filas = [];
    const sig = siguen ? E.L.pasos.map((q) => q.id).filter((q) => arr(PRE[q]).indexOf(p) >= 0) : [];
    idx.forEach((i) => {
      const c = E.L.cols[i];
      [p].concat(sig).forEach((q) => { const r = E.R[q + "|" + i]; if (!aMano(r)) return; cambios.push({ key: kCel(q, c), val: valNo(), txt: `${c.num} · ${paso(E, q).t}: Hecho (a mano) → Falta (carga rápida)` }); filas.push({ c: c.num + " · " + paso(E, q).l, a: "Hecho", d: "Falta" }); });
    });
    return { o: E.o, E, cambios, avisos: [], filas, n: idx.length };
  }
  // qué agregaría la cascada (para el cartel)
  function cascadaDe(E, p, idx) {
    const pre = arr(PRE[p]).filter((q) => paso(E, q)), pasos = [], cols = new Set();
    idx.forEach((i) => pre.forEach((q) => { if (libre(E.R[q + "|" + i])) { if (pasos.indexOf(q) < 0) pasos.push(q); cols.add(i); } }));
    return { pasos: pre.filter((q) => pasos.indexOf(q) >= 0), n: cols.size };
  }
  function siguenDe(E, p, idx) {
    const sig = E.L.pasos.map((q) => q.id).filter((q) => arr(PRE[q]).indexOf(p) >= 0), pasos = [], cols = new Set();
    idx.forEach((i) => sig.forEach((q) => { if (aMano(E.R[q + "|" + i])) { if (pasos.indexOf(q) < 0) pasos.push(q); cols.add(i); } }));
    return { pasos: sig.filter((q) => pasos.indexOf(q) >= 0), n: cols.size };
  }

  // ============================================================== hacer (con deshacer)
  async function hacer(P, desc) {
    const A = AV(); if (!A || !P || !P.cambios.length) { cartel({ t: "No hay nada para cambiar ahí.", gris: true, ms: 3500 }); return null; }
    let mot = "";
    if (pideMot()) { mot = String(($("a2RapMot") || {}).value || S.mot || "").trim(); if (mot.length < 3) { cartel({ t: "Escribí el motivo arriba, en «✏ Carga rápida» (lo pide Administración).", mal: true, ms: 5000 }); intentar(() => $("a2RapMot").focus(), null); return null; } }
    const o = P.o, prev = {}, m0 = obj(obj(o.av2).m);
    P.cambios.forEach((c) => { prev[c.key] = Object.prototype.hasOwnProperty.call(m0, c.key) ? JSON.parse(JSON.stringify(m0[c.key])) : undefined; });
    const r = await A.aplicar(P, mot);
    if (!r || !r.ok) { cartel({ t: (r && r.txt) || "No se pudo guardar.", mal: true, ms: 6000 }); return r; }
    S.dr = {};
    S.deshacer = { o, prev, txts: P.cambios.map((c) => c.txt), desc, ts: Date.now() };
    cartel({ t: `${desc} · la obra pasó de ${r.antes} % a ${r.despues} %.${P.avisos && P.avisos.length ? " ⏳ Ojo: " + P.avisos.join(". ") + "." : ""}`, deshacer: true, ms: 10000 });
    return r;
  }
  async function deshacer() {
    const U = S.deshacer; if (!U || Date.now() - U.ts > 15000) return;
    S.deshacer = null;
    const o = U.o, A = AV(), av = obj(o.av2), m = Object.assign({}, obj(av.m)), up = {}, del = intentar(() => firebase.firestore.FieldValue.delete(), null);
    const antes = A.pct(o);
    Object.keys(U.prev).forEach((k) => { const v = U.prev[k]; if (v === undefined) { delete m[k]; up["av2.m." + k] = del; } else { m[k] = v; up["av2.m." + k] = v; } });
    if (Object.keys(up).some((k) => up[k] === null)) return cartel({ t: "No se pudo deshacer.", mal: true, ms: 5000 });
    const h = { ts: Date.now(), por: yoMail(), porNombre: yoNombre(), motivo: "Deshacer: " + U.desc, cambios: U.txts.slice(0, 60).map((t, i) => ({ key: Object.keys(U.prev)[i] || "", e: "deshecho", txt: "deshecho · " + t })), deshacer: true };
    const hist = arr(av.hist).concat([h]).slice(-300);
    up["av2.hist"] = hist;
    const viejo = o.av2; o.av2 = Object.assign({}, av, { m, hist });
    const despues = A.pct(o);
    const ah = arr(o.avanceHist).concat([{ item: "av2", antes, despues, motivo: "Deshacer: " + U.desc, por: yoMail(), porNombre: yoNombre(), ts: Date.now(), tipo: "aMano", av2: true, deshacer: true }]).slice(-300);
    up.avanceHist = ah;
    try { await window.fbAvanceCampos(o.id, up); o.avanceHist = ah; }
    catch (e) { o.av2 = viejo; return cartel({ t: "No se pudo deshacer: " + String((e && e.message) || e), mal: true, ms: 6000 }); }
    auditar("avance_obra_deshacer", { obraId: o.id, desc: U.desc, antes, despues });
    A.refrescar();
    cartel({ t: `Deshecho · la obra volvió a ${despues} %.`, ms: 4000 });
  }

  // ============================================================== el cartel (role=status, abajo)
  function cartel(c) {
    let el = $("a2Rc");
    if (!el) { el = document.createElement("div"); el.id = "a2Rc"; el.className = "a2-rcar no-print"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); document.body.appendChild(el); }
    clearTimeout(S.tCartel);
    if (!c) { el.hidden = true; el.innerHTML = ""; S.pend = null; return; }
    el.hidden = false; el.className = "a2-rcar no-print" + (c.mal ? " mal" : c.gris ? " gris" : c.preg ? " preg" : "");
    const btns = c.preg ? `<div class="a2-rcarb"><button type="button" class="btn-primary" data-a2r="si">${esc(c.si || "Sí")}</button><button type="button" class="btn-ghost" data-a2r="solo">${esc(c.solo)}</button><button type="button" class="a2-link" data-a2r="cancelar">Cancelar</button></div>` : c.deshacer ? `<div class="a2-rcarb"><button type="button" class="btn-ghost" data-a2r="deshacer">↶ Deshacer</button><button type="button" class="a2-link" data-a2r="cerrarC" aria-label="Cerrar">✕</button></div>` : "";
    el.innerHTML = `<div class="a2-rcart">${esc(c.t)}</div>${btns}`;
    if (c.ms) S.tCartel = setTimeout(() => { if (S.pend && c.preg) return; cartel(null); }, c.ms);
  }

  // ============================================================== acciones de un paso / una cosa / una celda
  function pedirSubir(E, p, idx) {
    if (!idx.length) return cartel({ t: "Eso ya figura hecho.", gris: true, ms: 3000 });
    const cas = cascadaDe(E, p, idx), n = idx.length, adj = ADJ[p] ? ADJ[p][n === 1 ? 0 : 1] : NOM[p];
    const quien = n === 1 ? E.L.cols[idx[0]].num + " " + adj : n + " " + adj;
    const desc = `${n === 1 ? E.L.cols[idx[0]].num : n + " columnas"}: ${NOM[p]}`;
    if (!cas.pasos.length) return hacer(planSubir(E, p, idx, false), desc);
    const frag = cas.pasos.indexOf("horm") >= 0 ? " (ya fraguado)" : "";
    S.pend = { si: () => hacer(planSubir(estadoFresco(E), p, idx, true), desc + " + " + y(cas.pasos.map((q) => NOM[q]))), solo: () => hacer(planSubir(estadoFresco(E), p, idx, false), desc) };
    cartel({ preg: true, t: `Marcar ${quien} también marca ${y(cas.pasos.map((q) => NOM[q]))} de ${cas.n === n ? (n === 1 ? "esa columna" : "esas " + n) : cas.n + " de ellas"}${frag}.`, si: "Sí", solo: "Solo " + (p === "horm" ? "el hormigón" : p === "pat" ? "la jabalina" : p === "subida" ? "la subida" : "el " + NOM[p]) });
  }
  function pedirBajar(E, p, idx) {
    if (!idx.length) return cartel({ t: "Lo que queda viene de las órdenes: se cambia desde la columna.", gris: true, ms: 4000 });
    const sg = siguenDe(E, p, idx), n = idx.length;
    const desc = `${n === 1 ? E.L.cols[idx[0]].num : n + " columnas"}: sacar ${NOM[p]}`;
    if (!sg.pasos.length) return hacer(planBajar(E, p, idx, false), desc);
    S.pend = { si: () => hacer(planBajar(estadoFresco(E), p, idx, true), desc + " y lo que sigue"), solo: () => hacer(planBajar(estadoFresco(E), p, idx, false), desc) };
    cartel({ preg: true, t: `Sacar ${n === 1 ? "el " + SAC[p][0] + " de la " + E.L.cols[idx[0]].num : n + " " + SAC[p][1]}. ¿También sacás los pasos que siguen (${y(sg.pasos.map((q) => NOM[q]))}) de ${sg.n === 1 ? "esa columna" : "esas " + sg.n}?`, si: "Sí, también", solo: "Solo " + (p === "horm" ? "el hormigón" : p === "pat" ? "la jabalina" : p === "subida" ? "la subida" : "el " + NOM[p]) });
  }
  const estadoFresco = (E) => AV().estado(E.o.id) || E;
  function listoPaso(p) {
    const E = AV().estado(AV().st.id); if (!E) return;
    const k = cuentaPaso(E, p), q = "p:" + p, d = Math.round(Math.max(k.min, Math.min(k.max, num(S.dr[q] != null ? S.dr[q] : k.n))));
    delete S.dr[q];
    if (d > k.n) return pedirSubir(E, p, k.F.slice(0, d - k.n));
    if (d < k.n) return pedirBajar(E, p, k.Rm.slice(-(k.n - d)).reverse());
    AV().pintar();
  }
  function listoCosa(id) {
    const A = AV(), E = A.estado(A.st.id); if (!E) return;
    const x = E.L.cosas.find((c) => c.id === id); if (!x) return;
    const k = cuentaCosa(E, x), q = "k:" + id, d = Math.max(k.min, Math.min(k.max, num(S.dr[q] != null ? S.dr[q] : k.n)));
    delete S.dr[q];
    if (Math.abs(d - k.n) < 1e-9) return A.pintar();
    const P = sinFecha(A.planMarcar({ obra: E.o.id, cosa: x.id, accion: "marcar", cant: d }));
    if (P.err) return cartel({ t: P.err, mal: true, ms: 5000 });
    hacer(P, `${x.label}: ${fN(k.n)} → ${fN(d)}${x.un ? " " + x.un : ""}`);
  }
  function binCosa(id) {
    const A = AV(), E = A.estado(A.st.id); if (!E) return;
    const x = E.L.cosas.find((c) => c.id === id); if (!x) return;
    const k = cuentaCosa(E, x);
    if (k.roto || (k.n >= 1 && k.ord > 0)) return A.hojaCosa(E.o.id, x.id);   // viene de una orden (o está rota): la hoja de siempre
    const P = sinFecha(A.planMarcar({ obra: E.o.id, cosa: x.id, accion: k.n >= 1 ? "desmarcar" : "marcar" }));
    if (P.err) return cartel({ t: P.err, mal: true, ms: 5000 });
    hacer(P, `${x.label}: ${k.n >= 1 ? "sacado" : "hecho"}`);
  }
  // la grilla: tocar una celda (devuelve true si la manejó)
  function celda(t) {
    if (off() || !modoToque()) return false;
    const A = AV(); if (!A || A.st.sel) return false;
    const p = t.dataset.p, i = +t.dataset.i, E = A.estado(A.st.id); if (!E) return false;
    const r = E.R[p + "|" + i];
    if (S.trago && Date.now() - S.trago < 1500) { S.trago = 0; return true; }   // ya se abrió la hoja al mantener apretado
    if (!r) return false;
    if (libre(r)) { pedirSubir(E, p, [i]); return true; }
    if (aMano(r) && r.e !== "pieza") { pedirBajar(E, p, [i]); return true; }
    return false;   // de una orden, falla, observada, no lleva, pieza: la hoja de siempre
  }

  // ============================================================== la tarjeta «✏ Carga rápida»
  function filaPaso(E, p) {
    const k = cuentaPaso(E, p.id); if (!k.t) return "";
    const q = "p:" + p.id, d = S.dr[q] != null ? S.dr[q] : k.n, cambia = Math.round(num(d)) !== k.n;
    const fijo = k.min > 0 ? ` · ${k.min} de órdenes` : "";
    const raros = k.raros ? ` · ${k.raros} con falla / observadas (desde la columna)` : "";
    const listo = `<button type="button" class="btn-primary a2r-listo" data-a2r="listo" data-q="${q}"${cambia ? "" : " hidden"}>${esc(txtListo(k.n, d))}</button>`;
    return `<div class="a2r-f" data-q="${q}"><div class="a2r-l"><b>${esc(p.l.replace(/ \(.*\)/, ""))}</b><span><small>${k.n} de ${k.t}${esc(fijo)}${esc(raros)}</small><button type="button" class="a2-link a2r-cual" data-a2r="cuales" data-p="${p.id}" aria-label="${esc(p.t)}: elegir cuáles columnas">elegir</button></span></div><div class="a2r-ctl"><button type="button" class="a2r-b" data-a2r="menos" data-q="${q}" aria-label="${esc(p.t)}: una menos"${num(d) <= k.min ? " disabled" : ""}>−</button><input class="a2r-n" type="number" inputmode="numeric" data-a2rn="${q}" min="${k.min}" max="${k.max}" step="1" value="${esc(String(Math.round(num(d))))}" aria-label="${esc(p.l)}: cuántas columnas hechas"><button type="button" class="a2r-b" data-a2r="mas" data-q="${q}" aria-label="${esc(p.t)}: una más"${num(d) >= k.max ? " disabled" : ""}>+</button><button type="button" class="chip a2r-ch" data-a2r="todas" data-q="${q}">Todas</button><button type="button" class="chip a2r-ch" data-a2r="ninguna" data-q="${q}">Ninguna</button></div>${listo}</div>`;
  }
  const txtListo = (n, d) => { d = Math.round(num(d)); return d > n ? `Listo · marcar ${d - n} más (quedan ${d})` : d < n ? `Listo · sacar ${n - d} (quedan ${d})` : "Listo"; };
  function filaCosa(E, x) {
    const k = cuentaCosa(E, x), q = "k:" + x.id;
    if (k.r.estado === "nolleva") return "";
    if (k.roto) return `<div class="a2r-f a2r-k"><div class="a2r-l"><b>${esc(x.label)}</b><small class="rojo">${esc(k.r.estado === "falla" ? "falla" : "observado")} · cambialo desde su hoja</small></div><button type="button" class="a2-link" data-a2r="abrirK" data-id="${esc(x.id)}">Abrir</button></div>`;
    if (x.bin) return `<div class="a2r-f a2r-k"><div class="a2r-l"><b>${esc(x.label)}</b><small>${k.n >= 1 ? (k.ord > 0 ? "hecho (de una orden)" : "hecho") : "falta"}</small></div><button type="button" class="chip a2r-bin${k.n >= 1 ? " activo" : ""}" data-a2r="bin" data-id="${esc(x.id)}" aria-pressed="${k.n >= 1}">${k.n >= 1 ? "✓ Hecho" : "Marcar hecho"}</button></div>`;
    const d = S.dr[q] != null ? S.dr[q] : k.n, cambia = Math.abs(num(d) - k.n) > 1e-9, paso1 = x.un === "m" && x.tot > 50 ? 10 : 1;
    return `<div class="a2r-f a2r-k" data-q="${q}"><div class="a2r-l"><b>${esc(x.label)}</b><small>${fN(k.n)} de ${fN(x.tot)} ${esc(x.un)}${k.ord > 0 ? " · " + fN(k.ord) + " de órdenes" : ""}</small></div><div class="a2r-ctl"><button type="button" class="a2r-b" data-a2r="menos" data-q="${q}" data-s="${paso1}" aria-label="${esc(x.label)}: menos"${num(d) <= k.min ? " disabled" : ""}>−</button><input class="a2r-n" type="number" inputmode="decimal" data-a2rn="${q}" min="${k.min}" max="${k.max}" value="${esc(String(r2(num(d))))}" aria-label="${esc(x.label)}: cuánto está hecho"><button type="button" class="a2r-b" data-a2r="mas" data-q="${q}" data-s="${paso1}" aria-label="${esc(x.label)}: más"${num(d) >= k.max ? " disabled" : ""}>+</button><button type="button" class="chip a2r-ch" data-a2r="todas" data-q="${q}">Todo</button><button type="button" class="chip a2r-ch" data-a2r="ninguna" data-q="${q}">Nada</button></div><button type="button" class="btn-primary a2r-listo" data-a2r="listo" data-q="${q}"${cambia ? "" : " hidden"}>${esc(cambia ? `Listo · ${fN(k.n)} → ${fN(r2(num(d)))}` : "Listo")}</button></div>`;
  }
  const r2 = (n) => Math.round(n * 100) / 100;
  function html(E) {
    if (off() || !E || !puede()) return "";
    if (S.obra !== String(E.o.id)) { S.obra = String(E.o.id); S.dr = {}; }
    if (S.cerrada) return `<div class="card a2-card a2r"><button type="button" class="a2-ch a2r-cab" data-a2r="abrirCard" aria-expanded="false"><h3>✏ Carga rápida</h3><small>Poné de una cuántas columnas tienen cada paso · abrir ⌄</small></button></div>`;
    const L = E.L, GR = ["pozo", "horm", "izaje", "vinc", "artef", "tabl", "sello", "pat"], pasos = L.pasos.filter((p) => GR.indexOf(p.id) >= 0).map((p) => filaPaso(E, p)).join(""), otros = L.pasos.filter((p) => GR.indexOf(p.id) < 0).map((p) => filaPaso(E, p)).join(""), cosas = L.cosas.filter((x) => !x.doc).map((x) => filaCosa(E, x)).filter(Boolean);
    const mot = pideMot() ? `<label for="a2RapMot" class="a2-lbl">Motivo (lo pide Administración; queda en el historial)</label><input id="a2RapMot" type="text" maxlength="200" autocomplete="off" placeholder="Ej: puesta al día del avance" value="${esc(S.mot)}">` : "";
    const cfg = rolYo() === "admin" ? `<div class="a2r-cfg"><span>Pedir motivo al cambiar el avance a mano</span><span class="a2r-seg"><button type="button" class="chip${pideMot() ? "" : " activo"}" data-a2r="cfgMot" data-v="0" aria-pressed="${!pideMot()}">No (por ahora)</button><button type="button" class="chip${pideMot() ? " activo" : ""}" data-a2r="cfgMot" data-v="1" aria-pressed="${pideMot()}">Sí</button></span></div>` : "";
    return `<div class="card a2-card a2r" id="a2Rap"><button type="button" class="a2-ch a2r-cab" data-a2r="cerrarCard" aria-expanded="true"><h3>✏ Carga rápida</h3><small>ocultar ⌃</small></button><div class="a2-nt a2r-ayuda">Cuántas columnas tienen cada paso → «Listo». Se marcan las primeras que faltan (y te pregunta por los pasos de antes). Lo de las órdenes no se toca.</div>${mot}${L.cols.length ? `<div class="a2r-ps">${pasos}</div>${otros ? `<details class="a2r-dd a2r-ddp"${S.pAb ? " open" : ""}><summary>Otros pasos (acabado, aplomado, subida)</summary>${otros}</details>` : ""}` : ""}${cosas.length ? `<details class="a2r-dd"${S.kAb ? " open" : ""}><summary>Lo que no va por columna (${cosas.length})</summary>${cosas.join("")}</details>` : ""}${cfg}</div>`;
  }
  const grillaBtn = () => (off() || !puede() ? "" : `<button type="button" class="a2-link a2r-toque${S.toque ? " on" : ""}" data-a2r="toque" aria-pressed="${S.toque}">✏ Tocar marca: ${S.toque ? "Sí" : "No"}</button>`);

  // ============================================================== toques
  function setDraft(q, v) { S.dr[q] = v; }
  function cuentaDe(q) {
    const E = AV().estado(AV().st.id); if (!E) return null;
    if (q.indexOf("p:") === 0) return cuentaPaso(E, q.slice(2));
    const x = E.L.cosas.find((c) => c.id === q.slice(2)); return x ? Object.assign(cuentaCosa(E, x), { x }) : null;
  }
  document.addEventListener("click", async (e) => {
    const t = e.target && e.target.closest ? e.target.closest("[data-a2r]") : null; if (!t || off()) return;
    const a = t.dataset.a2r, q = t.dataset.q, A = AV(); if (!A) return;
    if (a === "si" || a === "solo") { const P = S.pend; S.pend = null; cartel(null); if (P) await P[a](); return; }
    if (a === "cancelar" || a === "cerrarC") { S.pend = null; cartel(null); return; }
    if (a === "deshacer") { cartel(null); return deshacer(); }
    if (a === "toque") { S.toque = !S.toque; ls("ema.av.rap.toque", S.toque ? "1" : "0"); return A.pintar(); }
    if (a === "cerrarCard" || a === "abrirCard") { S.cerrada = a === "cerrarCard"; ls("ema.av.rap.cerrada", S.cerrada ? "1" : "0"); return A.pintar(); }
    if (!puede()) return;
    if (a === "cfgMot") {
      if (rolYo() !== "admin") return;
      const v = t.dataset.v === "1";
      try { await window.fbBaremoGuardar({ avanceMotivo: v }); window.__baremoNube = Object.assign({}, window.__baremoNube || {}, { avanceMotivo: v }); auditar("avance_motivo_cfg", { pedir: v }); cartel({ t: v ? "Listo: se pide el motivo al cambiar el avance a mano." : "Listo: no se pide el motivo (queda «" + MOT + "»).", ms: 4000 }); }
      catch (er) { cartel({ t: "No se pudo guardar: " + String((er && er.message) || er), mal: true, ms: 6000 }); }
      return A.pintar();
    }
    if (a === "bin") return binCosa(t.dataset.id);
    if (a === "abrirK") return A.hojaCosa(A.st.id, t.dataset.id);
    if (a === "cuales") { A.st.sel = new Set(); A.st.selPaso = t.dataset.p; A.st.abiertos.columnas = true; A.pintar(); intentar(() => document.querySelector("#a2App .a2-grilla").scrollIntoView({ block: "start", behavior: "smooth" }), null); return; }
    if (!q) return;
    const k = cuentaDe(q); if (!k) return;
    const inp = document.querySelector('[data-a2rn="' + q + '"]'), cur = inp ? num(inp.value) : num(S.dr[q] != null ? S.dr[q] : k.n), st = num(t.dataset.s) || 1;
    if (a === "menos") { setDraft(q, Math.max(k.min, cur - st)); return A.pintar(); }
    if (a === "mas") { setDraft(q, Math.min(k.max, cur + st)); return A.pintar(); }
    if (a === "todas") { setDraft(q, k.max); return A.pintar(); }
    if (a === "ninguna") { setDraft(q, k.min); return A.pintar(); }
    if (a === "listo") { if (inp) setDraft(q, num(inp.value)); return q.indexOf("p:") === 0 ? listoPaso(q.slice(2)) : listoCosa(q.slice(2)); }
  });
  document.addEventListener("input", (e) => {
    const x = e.target; if (!x || off()) return;
    if (x.id === "a2RapMot") { S.mot = x.value; return; }
    const q = x.dataset && x.dataset.a2rn; if (!q) return;
    S.dr[q] = x.value;
    const k = cuentaDe(q), b = document.querySelector('.a2r-listo[data-q="' + q + '"]'); if (!k || !b) return;
    const v = num(x.value), cambia = x.value !== "" && Math.abs(Math.max(k.min, Math.min(k.max, v)) - k.n) > 1e-9;
    b.hidden = !cambia; b.textContent = q.indexOf("p:") === 0 ? txtListo(k.n, Math.max(k.min, Math.min(k.max, v))) : `Listo · ${fN(k.n)} → ${fN(Math.max(k.min, Math.min(k.max, v)))}`;
  });
  document.addEventListener("keydown", (e) => { const x = e.target; if (e.key !== "Enter" || !x || !x.dataset || !x.dataset.a2rn || off()) return; e.preventDefault(); const b = document.querySelector('.a2r-listo[data-q="' + x.dataset.a2rn + '"]'); b && !b.hidden && b.click(); });
  document.addEventListener("toggle", (e) => { if (e.target && e.target.classList && e.target.classList.contains("a2r-dd")) { if (e.target.classList.contains("a2r-ddp")) S.pAb = e.target.open; else S.kAb = e.target.open; } }, true);
  // mantener apretado una celda (modo «Tocar marca»): abre la hoja; sin el menú del celu
  const soltar = () => { if (S.down) { clearTimeout(S.down.tm); S.down = null; } };
  document.addEventListener("pointerdown", (e) => {
    soltar(); const c = e.target && e.target.closest && e.target.closest('#a2App [data-a2="cel"]'); if (!c || !modoToque() || (AV() && AV().st.sel)) return;
    const p = c.dataset.p, i = +c.dataset.i, x = e.clientX, yy = e.clientY;
    S.down = { x, y: yy, tm: setTimeout(() => { S.down = null; S.trago = Date.now(); intentar(() => AV().hojaCelda(AV().st.id, p, i), null); }, 520) };
  }, true);
  document.addEventListener("pointermove", (e) => { if (S.down && Math.abs(e.clientX - S.down.x) + Math.abs(e.clientY - S.down.y) > 12) soltar(); }, true);
  document.addEventListener("pointerup", soltar, true); document.addEventListener("pointercancel", soltar, true);
  document.addEventListener("scroll", soltar, true);
  document.addEventListener("contextmenu", (e) => { if (modoToque() && e.target && e.target.closest && e.target.closest('#a2App [data-a2="cel"]')) e.preventDefault(); }, true);

  window.__avRapHtml = html;
  window.__avRapGrilla = grillaBtn;
  window.__avRapToque = () => !off() && modoToque();
  window.__avRap = { html, celda, cuentaPaso, cuentaCosa, planSubir, planBajar, cascadaDe, siguenDe, pedirSubir, pedirBajar, listoPaso, listoCosa, deshacer, cartel, pideMot, PRE, MOT, estado: () => S };
})();
