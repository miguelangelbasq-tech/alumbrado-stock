(function () {
  "use strict";
  // v174 · La nómina y los vehículos no se pierden más (Ángel 19/11: «se borró el personal y los vehículos»).
  //  · La pantalla «Personal del equipo» arrancaba con la lista de ejemplo de la app (10 personas) y la cambiaba por la de la base
  //    recién cuando la base contestaba. «Guardar» antes de eso (o con la base sin contestar) grababa esa lista de ejemplo.
  //  · Ahora: nada escribe la nómina ni los vehículos si la base no llegó en esta sesión; la lista de ejemplo no se graba nunca;
  //    sacar gente o vehículos pide «Sí»; antes de cada guardado se guarda la versión anterior en configEquipo/personal.respaldos[]
  //    (las últimas 10) y queda en la auditoría (personal_guardar).
  //  · «🩹 Recuperar personal y vehículos» (solo Administración): qué se borró, de dónde se puede recuperar cada dato y qué se
  //    perdió seguro; casillas y «Sí, agregarlos» (nunca saca a nadie).
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" ? x : {});
  const clon = (x) => JSON.parse(JSON.stringify(x == null ? null : x));
  const intentar = (f, d) => { try { const r = f(); return r == null ? d : r; } catch (e) { return d; } };
  const yoEmail = () => String((window.__fbUser || {}).email || "");
  const fH = (ts) => { if (!ts) return "sin fecha"; const d = new Date(+ts), p = (n) => String(n).padStart(2, "0"); return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  const FABRICA = ["Mauricio Mainini", "Pablo Maximiliano Picone", "Lastra Sergi Ariel", "Víctor Exequiel Franco", "Franco Nahuel Esequiel González", "Marcos Marcelo González", "Leandro Luis Damián Toledo Ontivero", "Marcos Mancloba", "Ulises Toledo", "Herrera Juan Carlos"].map(nk);
  const nombresDe = (l) => arr(l).map((p) => nk(p && p.nombre)).filter(Boolean);
  // la lista de ejemplo (o un pedazo de ella): todos sus nombres son de la lista de fábrica
  const esFabrica = (l) => { const n = nombresDe(l); return n.length >= 5 && n.every((x) => FABRICA.indexOf(x) >= 0); };
  const base = () => obj(window.__personalNube);
  const nominaBase = () => { const b = base(); return arr(b.nomina).length ? arr(b.nomina) : arr(b.lista); };
  const vehBase = () => arr(base().vehiculos);
  const cargado = () => !!window.__personalCargado;
  const esAdmin = () => intentar(() => window.PERMISOS.yo().rol === "admin", false) || intentar(() => window.PERMISOS.esAdmin(), false);
  const err = (code, message) => Object.assign(new Error(message), { code });
  // dos nombres son la misma persona si las palabras del más corto están todas en el más largo («Pablo Picone» = «Pablo Maximiliano Picone»)
  const mismo = (a, b) => { a = nk(a); b = nk(b); if (!a || !b) return false; if (a === b) return true; const x = a.split(" "), y = b.split(" "), [c, l] = x.length <= y.length ? [x, y] : [y, x]; return c.length >= 2 && c.every((w) => l.indexOf(w) >= 0); };
  const buscar = (l, n) => arr(l).find((p) => p && mismo(p.nombre, n)) || null;

  // ---------- la hoja de confirmación (Promise)
  function preguntar(titulo, html, si, no) {
    return new Promise((ok) => {
      const v = $("psConf"); v && v.remove();
      const d = document.createElement("div"); d.id = "psConf"; d.className = "v7-ov v7-esc"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", titulo);
      d.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>${esc(titulo)}</h3></div><button type="button" class="v7-x" data-psc="no" aria-label="Cerrar">✕</button></div><div class="ps-txt">${html}</div><div class="v7-acc"><button type="button" class="btn-ghost" data-psc="no">${esc(no || "Cancelar")}</button><button type="button" class="btn-primary${/sacar|borrar/i.test(si || "") ? " ps-peligro" : ""}" data-psc="si">${esc(si || "Sí")}</button></div></div>`;
      const fin = (r) => { d.remove(); ok(r); };
      d.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("[data-psc]"); if (b) fin(b.dataset.psc === "si"); else if (e.target === d) fin(false); });
      document.body.appendChild(d);
    });
  }

  // ---------- la guardia de todos los documentos de configuración (baremo, precios, cuadrillas, personal, ubicacion)
  const CFG = window.__cfgCargado = window.__cfgCargado || {};
  const DAT = window.__cfgDatos = window.__cfgDatos || {};
  const NOMBRE = { personal: "Personal del equipo", baremo: "Cuánto vale cada tarea", precios: "Precios e itemizado", cuadrillas: "Cuadrillas", ubicacion: "Ubicación en vivo" };
  const curDe = (doc) => obj(doc === "personal" ? window.__personalNube : doc === "baremo" ? window.__baremoNube : doc === "precios" ? window.__preciosNube : DAT[doc]);
  const cargadoDe = (doc) => doc === "personal" ? cargado() : !!CFG[doc];
  const NO_RESP = /^(ts|usuario|por|porNombre|respaldos|actualizado|actualizadoPor|editadoTs|editadoPor)$|Ts$|Por$/;
  const etq = (x) => x && typeof x == "object" ? String(x.nombre || x.label || x.persona || x.tarea || x.texto || x.id || JSON.stringify(x).slice(0, 40)) : String(x);
  const getPath = (o, k) => k.split(".").reduce((a, q) => (a == null ? a : a[q]), o);
  function quitados(antes, despues, ruta, out) {   // arrays que pierden elementos (un nivel de mapas adentro)
    if (Array.isArray(antes) && Array.isArray(despues)) {
      const key = (x) => (x && typeof x == "object" ? String(x.id || nk(x.nombre || x.label || x.persona || "") || JSON.stringify(x)) : String(x));
      const nd = new Set(despues.map(key)); antes.forEach((x) => { if (!nd.has(key(x))) out.push(ruta + ": " + etq(x)); });
    } else if (antes && despues && typeof antes == "object" && typeof despues == "object" && !Array.isArray(antes) && ruta.split(".").length < 2) {
      Object.keys(despues).forEach((k) => quitados(antes[k], despues[k], ruta + "." + k, out));
    }
  }
  async function guardiaCfg(doc, patch, op) {
    op = op || {};
    const p = Object.assign({}, patch || {});
    if (!cargadoDe(doc)) {
      if (doc === "ubicacion") { try { const s = await firebase.firestore().collection("configEquipo").doc(doc).get(); DAT[doc] = s.exists ? s.data() : {}; CFG[doc] = true; } catch (e) { } }
      if (!cargadoDe(doc)) throw err("ps-cargando", `Todavía no llegaron los datos de «${NOMBRE[doc] || doc}» de la base: esperá unos segundos y probá de nuevo. No se guardó nada.`);
    }
    const cur = curDe(doc), salt = op.saltear || [];
    const ks = Object.keys(p).filter((k) => !NO_RESP.test(k.split(".")[0]) && salt.indexOf(k) < 0);
    const qt = []; ks.forEach((k) => { if (k.indexOf(".") < 0 && k !== "ausencias") quitados(cur[k], p[k], k, qt); });   // las ausencias se quitan de a una con su propia pregunta
    if (qt.length && !op.sinPreguntar) {
      const ok = await preguntar(`¿Sacar ${qt.length} de «${NOMBRE[doc] || doc}»?`, `<p>Al guardar se sacan:</p><ul class="ps-ul">${qt.slice(0, 30).map((x) => `<li>${esc(x)}</li>`).join("")}${qt.length > 30 ? "<li>…</li>" : ""}</ul><p class="hint">Queda una copia de cómo estaba.</p>`, "Sí, sacarlos", "No, cancelar");
      if (!ok) throw err("ps-cancelado", "No se guardó nada (cancelado).");
    }
    const ent = Object.assign({ ts: Date.now(), por: yoEmail() }, op.entrada || {}), campos = {};
    ks.forEach((k) => { const v = getPath(cur, k); if (v === undefined) return; const j = JSON.stringify(v); if (j && j.length < 150000 && j !== JSON.stringify(p[k])) campos[k] = clon(v); });
    if (Object.keys(campos).length) ent.campos = campos;
    if (Object.keys(ent).some((k) => ["nomina", "vehiculos", "campos"].indexOf(k) >= 0)) {
      let l = arr(cur.respaldos).concat([ent]).slice(-10);
      while (l.length > 1 && JSON.stringify(l).length > 400000) l = l.slice(1);   // la base corta en 1 MB por documento
      p.respaldos = l;
      if (doc !== "personal" && qt.length) try { window.fbAuditar && window.fbAuditar("config_guardar", `${doc}: sacó ${qt.slice(0, 10).join(", ")}`, { doc, sacados: qt.slice(0, 50) }); } catch (e) { }
    }
    return p;
  }
  window.__cfgGuardia = guardiaCfg;
  [["fbBaremoGuardar", "baremo"], ["fbPreciosGuardar", "precios"]].forEach(([f, doc]) => { const o = window[f]; if (typeof o == "function" && !o.__ps) { const n = async function (e) { return o.call(this, await guardiaCfg(doc, e)); }; n.__ps = 1; window.__heredar && window.__heredar(n, o); window[f] = n; } });
  (function () { const o = window.fbCuadrillasGuardar; if (typeof o == "function" && !o.__ps) { const n = async function (l) { const p = await guardiaCfg("cuadrillas", { lista: l }); if (p.respaldos) { await o.call(this, l); try { await firebase.firestore().collection("configEquipo").doc("cuadrillas").set({ respaldos: p.respaldos }, { merge: true }); } catch (e) { } return; } return o.call(this, l); }; n.__ps = 1; window.__heredar && window.__heredar(n, o); window.fbCuadrillasGuardar = n; } })();

  // ---------- la guardia: todo lo que escribe configEquipo/personal pasa por acá
  async function guardia(patch, op) {
    op = op || {};
    const p = Object.assign({}, patch || {}), ks = Object.keys(p);
    if (ks.some((k) => /^(nomina|vehiculos|lista|respaldos)\./.test(k))) throw err("ps-campo", "La nómina y los vehículos se cambian desde Producción › Personal del equipo (no por partes). No se guardó nada.");
    const tN = "nomina" in p || "lista" in p, tV = "vehiculos" in p;
    if (!tN && !tV) return guardiaCfg("personal", p, op);
    if (!cargado()) throw err("ps-cargando", "Todavía no llegó la nómina de la base: esperá unos segundos y probá de nuevo. No se guardó nada.");
    const bN = nominaBase(), bV = vehBase();
    // lo que la pantalla no conoce (equipoCivil, rolAConfirmar…) no se pierde al guardar desde la tabla
    if (tN) { const l = arr(p.nomina || p.lista).map((y) => { const x = y && bN.find((z) => z && nk(z.nombre) === nk(y.nombre)); if (!x) return y; const r = Object.assign({}, y); Object.keys(x).forEach((k) => { if (!(k in r)) r[k] = x[k]; }); return r; }); if ("nomina" in p) p.nomina = l; else p.lista = l; }
    const nN = tN ? arr(p.nomina || p.lista) : bN, nV = tV ? arr(p.vehiculos) : bV;
    if (tN && esFabrica(nN) && !esFabrica(bN)) throw err("ps-fabrica", "Esa es la lista de ejemplo que trae la app, no la nómina de la base. No se guardó: usá «🩹 Recuperar personal y vehículos» o cargá la nómina y tocá «Guardar».");
    const sacados = tN ? bN.filter((x) => x && x.nombre && !nN.some((y) => y && nk(y.nombre) === nk(x.nombre))).map((x) => x.nombre) : [];
    const vSac = tV ? bV.filter((x) => x && x.id && !nV.some((y) => y && y.id === x.id)).map((x) => x.nombre + (x.patente ? " · " + x.patente : "")) : [];
    if ((sacados.length || vSac.length) && !op.sinPreguntar) {
      let h = "";
      if (sacados.length) h += `<p>Vas a sacar <b>${sacados.length} persona${sacados.length === 1 ? "" : "s"}</b> de la nómina:</p><ul class="ps-ul">${sacados.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>`;
      if (vSac.length) h += nV.length ? `<p>Vas a sacar <b>${vSac.length} vehículo${vSac.length === 1 ? "" : "s"}</b>:</p><ul class="ps-ul">${vSac.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : `<p><b>Vas a borrar todos los vehículos</b> (${vSac.length}): ${esc(vSac.join(", "))}.</p>`;
      h += `<p class="hint">Queda una copia de cómo estaba (se puede volver con «🩹 Recuperar personal y vehículos»).</p>`;
      const ok = await preguntar(sacados.length ? `¿Sacar ${sacados.length} de la nómina?` : "¿Sacar vehículos?", h, "Sí, sacarlos", "No, cancelar");
      if (!ok) throw err("ps-cancelado", "No se guardó nada (cancelado).");
    }
    const entrada = { ts: Date.now(), por: yoEmail(), deTs: base().ts || null, deUsuario: base().usuario || "" };
    if (tN) entrada.nomina = clon(bN); if (tV) entrada.vehiculos = clon(bV);
    try {
      window.fbAuditar && window.fbAuditar(op.accion || "personal_guardar", `Nómina ${bN.length} → ${nN.length} personas · vehículos ${bV.length} → ${nV.length}` + (sacados.length ? ` · sacó: ${sacados.join(", ")}` : "") + (vSac.length ? ` · sacó vehículos: ${vSac.join(", ")}` : ""), { antes: { personas: bN.length, vehiculos: bV.length }, despues: { personas: nN.length, vehiculos: nV.length }, sacados, vehiculosSacados: vSac, agregados: tN ? nN.filter((y) => y && y.nombre && !bN.some((x) => x && nk(x.nombre) === nk(y.nombre))).map((y) => y.nombre) : [] });
    } catch (e) { }
    return guardiaCfg("personal", p, Object.assign({}, op, { entrada, saltear: ["nomina", "lista", "vehiculos"], sinPreguntar: true }));
  }
  window.__psGuardia = guardia;
  window.__psErr = (er) => {
    const c = er && er.code;
    if (/^ps-/.test(c || "")) return "⚠ " + er.message;
    if (c === "permission-denied") return "🔒 Tu usuario no puede guardar la nómina.";
    return "No se pudo guardar en la base compartida (revisá la conexión). El cambio quedó solo acá.";
  };
  // todo lo que va por fbPersonalGuardar pasa por la guardia
  const fbOrig = window.fbPersonalGuardar;
  if (typeof fbOrig == "function" && !fbOrig.__ps) {
    const n = async function (e) { return fbOrig.call(this, await guardia(e)); };
    n.__ps = 1; window.__heredar && window.__heredar(n, fbOrig); window.fbPersonalGuardar = n;
  }

  // ---------- «Guardar» de la pantalla: bloqueado hasta que llegue la base; cartel si es la lista de ejemplo
  function pintarEstado() {
    const pan = $("prodPanelPersonal"); if (!pan || pan.style.display === "none") return;
    const b = pan.querySelector('button[onclick="guardarPersonalEquipo()"]');
    if (b) { const c = cargado(), t = c ? "Guardar" : "Cargando la nómina…"; if (b.disabled === c) b.disabled = !c; if (b.textContent !== t) b.textContent = t; }
    let a = $("psAviso");
    const card = pan.querySelector(".card");
    if (!a && card) { a = document.createElement("div"); a.id = "psAviso"; a.setAttribute("role", "status"); const av = $("personalAvisos"); av ? av.insertAdjacentElement("beforebegin", a) : card.appendChild(a); }
    if (a) {
      let h = "";
      if (!cargado()) h = `<div class="per-aviso ambar">⏳ Cargando la nómina de la base… Hasta que llegue no se puede guardar.</div>`;
      else if (!window.__nominaDeBase) h = `<div class="per-aviso rojo">⚠ <b>La base no tiene nómina guardada</b>${nominaBase().length ? ` (tiene una lista vieja de ${nominaBase().length} personas)` : ""}: lo de abajo es la <b>lista de ejemplo de la app</b>, no se graba así. ${esAdmin() ? "Usá «🩹 Recuperar personal y vehículos» más abajo." : "Avisale a Administración."}</div>`;
      if (a.__h !== h) { a.__h = h; a.innerHTML = h; }
    }
    pintarTarjeta();
  }
  setInterval(() => { try { pintarEstado(); } catch (e) { } }, 1000);
  document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest('#subtabsProd [data-sub="personal"]')) setTimeout(() => { try { pintarEstado(); } catch (er) { } }, 60); });

  // ---------- las fuentes
  // v174b: todas las órdenes (las de memoria + las leídas de la base al abrir la hoja), también las anuladas (la gente fue igual a otra)
  let otLeidas = [], qLeidas = null, uLeidos = null, leidoErr = [];
  const ordenes = () => { const m = new Map(); intentar(() => (typeof ordenesTrabajo !== "undefined" ? ordenesTrabajo : window.ordenesTrabajo) || [], []).concat(otLeidas).forEach((o) => { if (o && (o.id || o.numero)) m.set(o.id || o.numero, Object.assign({}, m.get(o.id || o.numero) || {}, o)); }); return [...m.values()].sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")) || (+b.creado || 0) - (+a.creado || 0)); };
  const nomDe = (p) => typeof p == "string" ? p : p && typeof p == "object" ? String(p.nombre || p.persona || p.name || p.n || p.nombreCompleto || "") : "";
  const rolDe = (p) => p && typeof p == "object" ? String(p.rol || p.funcion || p.rolNombre || "") : "";
  const titulo = (s) => String(s || "").split(" ").map((w) => w ? w[0].toUpperCase() + w.slice(1) : w).join(" ");
  function genteDeOrden(o) {   // [{n, rol, de}] de todos los lugares donde una orden nombra gente
    const l = [], add = (n, rol, de) => { n = String(n || "").trim(); if (n && n.length > 2) l.push({ n, rol: rol || "", de }); };
    arr(o.personal).forEach((p) => add(nomDe(p), rolDe(p), "personal"));
    add(o.responsable, "", "responsable");
    Object.keys(obj(o.asignada)).forEach((k) => { const v = o.asignada[k]; (Array.isArray(v) ? v : [v]).forEach((n) => add(nomDe(n), "", "asignada")); });
    Object.keys(obj(o.reparto)).forEach((k) => arr(o.reparto[k]).forEach((r) => add(nomDe(r), "", "reparto")));
    Object.keys(obj(o.equipoTarea)).forEach((k) => arr(o.equipoTarea[k]).forEach((n) => add(nomDe(n), "", "equipoTarea")));
    Object.keys(obj(o.equipos)).forEach((k) => arr(o.equipos[k]).forEach((e) => arr(e && e.nombres).forEach((n) => add(nomDe(n), "", "equipos"))));
    Object.keys(obj(o.vehiculoPersona)).forEach((n) => add(n, "", "vehiculoPersona"));
    Object.keys(obj(o.horario)).forEach((n) => add(n, "", "horario"));
    const ci = obj(o.cierre); ["hechoPersona", "horasPersona", "puntos"].forEach((c) => Object.keys(obj(ci[c])).forEach((n) => add(n, "", "cierre")));
    arr(o.personalNombres).forEach((k) => add(titulo(k), "", "personalNombres"));   // solo la clave normalizada: va última (si hay otra forma de escribirlo, gana esa)
    return l;
  }
  const copiasLocales = () => intentar(() => JSON.parse(localStorage.getItem("ema.personal.respaldoLocal") || "[]"), []).filter((x) => x && (arr(x.nomina).length || arr(x.vehiculos).length));
  let archivo = null, auditCopias = [], auditLeida = false, salud = null;
  function copias() {
    const l = [];
    arr(base().respaldos).forEach((r, i) => l.push({ id: "r" + i, fuente: `copia guardada en la base el ${fH(r.ts)}${r.por ? " por " + r.por : ""}`, ts: r.ts, nomina: arr(r.nomina), vehiculos: arr(r.vehiculos) }));
    copiasLocales().forEach((r, i) => l.push({ id: "l" + i, fuente: `copia en este aparato (de la base del ${fH(r.ts || r.visto)}${r.usuario ? ", guardada por " + r.usuario : ""}${r.cache ? ", la que tenía guardada el aparato" : ""})`, ts: r.ts || r.visto, nomina: arr(r.nomina), vehiculos: arr(r.vehiculos) }));
    if (archivo) l.push({ id: "a", fuente: `archivo de respaldo «${archivo.nombre}» (${archivo.fecha || "sin fecha"})`, ts: archivo.ts || 0, nomina: arr(archivo.nomina), vehiculos: arr(archivo.vehiculos) });
    auditCopias.forEach((r, i) => l.push({ id: "u" + i, fuente: `auditoría del ${fH(r.ts)} (${r.que})`, ts: r.ts, nomina: arr(r.nomina), vehiculos: arr(r.vehiculos) }));
    const g = obj(obj(window.__preciosNube).gastosRef);
    if (arr(g.vehiculos).length) l.push({ id: "g", fuente: "lista vieja de vehículos de Gastos (v042)", ts: 0, nomina: [], vehiculos: arr(g.vehiculos), soloVeh: true });
    if (!arr(base().nomina).length && arr(base().lista).length) l.push({ id: "b", fuente: "lista vieja de la base (campo «lista»)", ts: 0, nomina: arr(base().lista), vehiculos: [] });
    // la más completa primero, después la más nueva
    return l.sort((a, b) => (b.nomina.length + b.vehiculos.length) - (a.nomina.length + a.vehiculos.length) || (b.ts || 0) - (a.ts || 0));
  }

  // ---------- qué se borró y qué se puede recuperar
  const CAMPOS = [["legajo", "legajo"], ["rol", "rol"], ["sector", "sector"], ["valorHora", "valor hora"], ["vehiculoId", "vehículo a cargo"], ["equipoCivil", "equipo civil"]];
  const vacio = (v) => v == null || v === "" || v === 0 || v === false;
  function analizar() {
    const actual = window.__nominaDeBase ? nominaBase() : nominaBase();
    const vAct = vehBase(), C = copias(), O = ordenes(), desde = intentar(() => window.__psDesde, "") || "";
    const P = new Map();   // nk(nombre) → candidato
    const persona = (n) => { const k = nk(n); if (!k) return null; for (const [q, x] of P) if (mismo(q, k)) { if (String(n).length > String(x.nombre).length && k.split(" ").length > nk(x.nombre).split(" ").length) x.nombre = String(n).trim(); return x; } const x = { nombre: String(n).trim(), datos: {}, refs: [], ultima: "" }; P.set(k, x); return x; };
    const dato = (x, campo, v, fuente) => { if (!x || vacio(v) || x.datos[campo]) return; x.datos[campo] = { v, fuente }; };
    // 1) copias completas
    C.forEach((c) => c.nomina.forEach((p) => { if (!p || !p.nombre) return; const x = persona(p.nombre); x.refs.push(c.fuente); CAMPOS.forEach(([k]) => dato(x, k, p[k], c.fuente)); dato(x, "activo", p.activo === false ? "no" : "", c.fuente); }));
    // 2) órdenes de trabajo (la más nueva primero)
    const vehOt = new Map();
    O.forEach((o) => {
      const vp = obj(o.vehiculoPersona), f = o.fecha || "";
      genteDeOrden(o).forEach((g) => { const x = persona(g.n); if (!x) return; if (x.refs.length < 40) x.refs.push("orden " + (o.numero || o.id)); x.nOt = (x.nOt || 0) + 1; if (!x.ultima || f > x.ultima) x.ultima = f; if (g.rol) dato(x, "rol", g.rol, `la orden ${o.numero || o.id} del ${f}`); });
      arr(o.personal).forEach((p) => { if (p && typeof p == "object" && p.legajo) { const x = persona(nomDe(p)); x && dato(x, "legajo", p.legajo, `la orden ${o.numero || o.id}`); } });
      if (o.vehiculoId && !arr(o.vehiculos).some((v) => v && v.id === o.vehiculoId)) { const y = vehOt.get(o.vehiculoId) || { id: o.vehiculoId, nombre: "", patente: "", refs: [], ultima: "", aCargo: "" }; y.refs.push(o.numero || o.id); vehOt.set(o.vehiculoId, y); }
      Object.keys(vp).forEach((n) => { const v = vp[n]; if (!v || !v.id) return; const x = persona(n); dato(x, "vehiculoId", v.id, `la orden ${o.numero || o.id} del ${f} (iba en ${v.nombre || v.id})`); });
      arr(o.vehiculos).forEach((v) => { if (!v || !v.id) return; const y = vehOt.get(v.id) || { id: v.id, nombre: v.nombre || "", patente: v.patente || "", refs: [], ultima: "", aCargo: "" }; y.refs.push(o.numero || o.id); if (!y.ultima || f > y.ultima) y.ultima = f; if (!y.nombre && v.nombre) y.nombre = v.nombre; if (!y.patente && v.patente) y.patente = v.patente; vehOt.set(v.id, y); });
      Object.keys(vp).forEach((n) => { const v = vp[n]; if (v && v.id) { const y = vehOt.get(v.id) || { id: v.id, nombre: v.nombre || "", patente: v.patente || "", refs: [o.numero || o.id], ultima: f, aCargo: "" }; if (!y.aCargo) y.aCargo = n; vehOt.set(v.id, y); } });
    });
    // 3) quincenas cerradas (legajo y rol)
    const QQ = Object.assign({}, obj(qLeidas), obj(window.__cierresQuincena));
    Object.keys(QQ).sort().reverse().forEach((q) => arr(QQ[q].personas).forEach((p) => { if (!p || !p.nombre) return; const x = persona(p.nombre); x.refs.push("quincena " + q); dato(x, "legajo", p.legajo, `la quincena cerrada ${q}`); dato(x, "rol", String(p.rol || "").split(" / ")[0], `la quincena cerrada ${q}`); }));
    // 4) usuarios con persona vinculada (cuadrilla / operario)
    const UU = (uLeidos && uLeidos.length ? uLeidos : intentar(() => window.PERMISOS.lista(), [])) || [];
    UU.forEach((u) => { if (u && u.persona && u.activo !== false && !/^(admin|oficina|direccion)$/.test(u.rol || "")) { const x = persona(u.persona); x.refs.push("usuario " + (u.usuario || u.email || "")); } });
    // 5) movimientos del pañol: el sector
    intentar(() => window.stockMovimientos || [], []).slice().sort((a, b) => (+b.ts || 0) - (+a.ts || 0)).forEach((m) => { const s = m && m.sector; if (!s) return; [m.personaNombre, m.retira, m.retiradoPor, m.quien, m.devueltoPor].forEach((n) => { if (n && P.size) { for (const [q, x] of P) if (mismo(q, n)) dato(x, "sector", s, "los vales del pañol"); } }); });
    // vehículos: copias + órdenes + combustible
    const V = new Map();
    C.forEach((c) => c.vehiculos.forEach((v) => { if (!v || !v.nombre) return; const id = v.id || "n:" + nk(v.nombre); if (!V.has(id)) V.set(id, { v: clon(v), fuente: c.fuente }); }));
    vehOt.forEach((y, id) => { if (!V.has(id)) V.set(id, { v: { id, nombre: y.nombre || "(sin nombre)", patente: y.patente || "", activo: true }, fuente: `las órdenes (${y.refs.slice(0, 3).join(", ")}${y.refs.length > 3 ? "…" : ""})`, ot: y, soloId: !y.nombre }); else V.get(id).ot = y; });
    intentar(() => window.gastosObra || [], []).forEach((g) => { if (g && g.vehiculoId && !V.has(g.vehiculoId) && !vAct.some((x) => x.id === g.vehiculoId)) V.set(g.vehiculoId, { v: { id: g.vehiculoId, nombre: "", patente: "", activo: true }, fuente: "una carga de combustible de Gastos (" + (g.desc || g.fecha || "") + ")", soloId: true }); });
    // armar las filas
    const faltan = [], completar = [], vFaltan = [], vCompletar = [], perdido = [];
    const noObra = UU.filter((u) => u && /^(admin|oficina|direccion|panol|mirar)$/.test(u.rol || "")).map((u) => u.persona || u.nombre).filter(Boolean);
    P.forEach((x) => {
      const ya = buscar(actual, x.nombre);
      if (!ya && noObra.some((n) => mismo(n, x.nombre))) { x.noObra = true; return; }
      if (!ya) {
        const f = { nombre: x.nombre, datos: x.datos, refs: x.refs, ultima: x.ultima };
        if (desde && x.ultima && x.ultima < desde && !x.refs.some((r) => /copia|archivo|auditor|lista vieja/.test(r))) return;
        faltan.push(f);
        CAMPOS.forEach(([k, t]) => { if (!x.datos[k] && k !== "equipoCivil") perdido.push(`${x.nombre}: ${t}`); });
      } else {
        CAMPOS.forEach(([k, t]) => { const d = x.datos[k]; if (d && vacio(ya[k]) && /copia|archivo|auditor|lista vieja/.test(d.fuente)) completar.push({ nombre: ya.nombre, campo: k, txt: t, v: d.v, fuente: d.fuente }); else if (!d && vacio(ya[k]) && (k === "valorHora" || k === "vehiculoId")) perdido.push(`${ya.nombre}: ${t}`); });
      }
    });
    V.forEach((y, id) => {
      const ya = vAct.find((v) => v.id === id || (v.nombre && y.v.nombre && nk(v.nombre) === nk(y.v.nombre)));
      if (!ya) { vFaltan.push({ id, v: y.v, fuente: y.fuente, ot: y.ot || null, soloId: !!y.soloId }); ["patente", "tipo", "lugares", "comb"].forEach((k) => { if (vacio(y.v[k]) && !y.soloId) perdido.push(`vehículo ${y.v.nombre}: ${k === "comb" ? "combustible" : k}`); }); if (y.soloId) perdido.push(`vehículo «${id}»: nombre y patente (solo aparece el número en Gastos)`); }
      else ["patente", "tipo", "lugares", "comb", "cuadrilla"].forEach((k) => { if (vacio(ya[k]) && !vacio(y.v[k])) vCompletar.push({ id: ya.id, nombre: ya.nombre, campo: k, v: y.v[k], fuente: y.fuente }); });
    });
    const linea = [];
    const b = base();
    if (b.ts) linea.push(`La nómina se guardó por última vez el <b>${fH(b.ts)}</b>${b.usuario ? " por " + esc(b.usuario) : ""} (${nominaBase().length} personas).`);
    if (b.vehiculosTs) linea.push(`Los vehículos se guardaron por última vez el <b>${fH(b.vehiculosTs)}</b>${b.vehiculosPor ? " por " + esc(b.vehiculosPor) : ""} (${vAct.length}).`);
    else linea.push(`La base ${Array.isArray(b.vehiculos) ? `tiene ${vAct.length} vehículos` : "no tiene lista de vehículos"} (sin fecha de guardado).`);
    arr(b.respaldos).forEach((r) => linea.push(`Copia del ${fH(r.ts)} (${arr(r.nomina).length} personas, ${arr(r.vehiculos).length} vehículos) antes de un guardado de ${esc(r.por || "?")}.`));
    if (salud && salud.ultimoRespaldo) linea.push(`Último respaldo completo bajado: <b>${fH(salud.ultimoRespaldo.ts)}</b> por ${esc(salud.ultimoRespaldo.usuario || "?")} → si tenés ese archivo («respaldo_completo_…json»), cargalo abajo: trae la nómina y los vehículos completos.`);
    if (auditLeida && !auditCopias.length) linea.push("En la auditoría no hay ninguna copia de la nómina: hasta la v174 los guardados de la nómina no se anotaban.");
    const yaEn = []; P.forEach((x) => { const ya = buscar(actual, x.nombre); if (ya) yaEn.push({ nombre: x.nombre, en: ya.nombre, nOt: x.nOt || 0 }); });
    const diag = { ordenes: O.length, ordenesConGente: O.filter((o) => genteDeOrden(o).length).length, leidasBase: otLeidas.length, quincenas: Object.keys(QQ).length, usuarios: UU.length, vales: intentar(() => (window.stockMovimientos || []).length, 0), copias: C.length, personas: P.size, noObra: [...P.values()].filter((x) => x.noObra).length, errores: leidoErr.slice(), syncOt: intentar(() => window.__sync.ordenesTrabajo.ts, 0) };
    const CF = analizarCfg();
    return { cfg: CF.filas, cfgRes: CF.resumen, diag, yaEn, actual: actual.length, vehiculos: vAct.length, faltan, completar, vFaltan, vCompletar, perdido, linea, copias: C.map((c) => ({ id: c.id, fuente: c.fuente, personas: c.nomina.length, vehiculos: c.vehiculos.length })) };
  }

  // ---------- v174b: los otros documentos de configuración (precios, baremo, cuadrillas, ubicación) y lo que no es la nómina
  const DOCS_CFG = ["precios", "baremo", "cuadrillas", "ubicacion", "personal"];
  const tam = (v) => Array.isArray(v) ? v.length : v && typeof v == "object" ? Object.keys(v).length : vacio(v) ? 0 : 1;
  const tamTxt = (v) => Array.isArray(v) ? v.length + " elementos" : v && typeof v == "object" ? Object.keys(v).length + " datos" : vacio(v) ? "vacío" : String(v).slice(0, 40);
  const CFG_NO = /^(ts|usuario|por|porNombre|respaldos|nomina|lista|vehiculos|actualizado|actualizadoPor|editadoTs|editadoPor|ultimoRespaldo)$|Ts$|Por$/;
  const copiasCfgLocales = () => intentar(() => JSON.parse(localStorage.getItem("ema.cfg.respaldoLocal") || "[]"), []).filter((x) => x && x.doc && x.d);
  function copiasCfg(doc) {
    const l = [], cur = curDe(doc);
    arr(cur.respaldos).forEach((r) => { if (r && r.campos) l.push({ fuente: `copia guardada en la base el ${fH(r.ts)}${r.por ? " por " + r.por : ""}`, ts: r.ts, d: r.campos }); });
    copiasCfgLocales().filter((x) => x.doc === doc).forEach((x) => l.push({ fuente: `copia en este aparato (de la base del ${fH(x.ts || x.visto)}${x.usuario ? ", guardada por " + x.usuario : ""})`, ts: x.ts || x.visto, d: x.d }));
    if (archivo && archivo.cfg && archivo.cfg[doc]) l.push({ fuente: `archivo de respaldo «${archivo.nombre}»`, ts: archivo.ts || 0, d: archivo.cfg[doc] });
    return l;
  }
  function gastosRefDeGastos() {   // la lista de precios de Gastos rearmada con los gastos cargados (el último precio de cada cosa)
    const m = new Map();
    intentar(() => window.gastosObra || [], []).forEach((g) => { if (!g || !g.desc || !(+g.pu > 0)) return; const k = nk(g.desc); const x = m.get(k) || { nombre: String(g.desc).trim(), cat: g.cat || "varios", un: g.un || "", precio: 0, fecha: "", hist: [] }; x.hist.push({ precio: +g.pu, fecha: g.fecha || "", por: g.usuario || "" }); if (!x.fecha || String(g.fecha || "") >= x.fecha) { x.precio = +g.pu; x.fecha = g.fecha || ""; x.un = g.un || x.un; } m.set(k, x); });
    return [...m.values()].map((x) => Object.assign(x, { hist: x.hist.sort((a, b) => String(a.fecha).localeCompare(String(b.fecha))).slice(-12) }));
  }
  function analizarCfg() {
    const filas = [], resumen = [];
    DOCS_CFG.forEach((doc) => {
      const cur = curDe(doc), C = copiasCfg(doc), best = {};
      resumen.push({ doc, nombre: NOMBRE[doc] || doc, ts: cur.ts || 0, por: cur.usuario || cur.por || "", campos: Object.keys(cur).filter((k) => !CFG_NO.test(k)).length, copias: C.length, cargado: cargadoDe(doc) });
      const peso = (v) => Array.isArray(v) ? v.length : v && typeof v == "object" ? JSON.stringify(v).length : 0;
      C.forEach((c) => Object.keys(obj(c.d)).forEach((k) => { if (CFG_NO.test(k) || k.indexOf(".") >= 0) return; const v = c.d[k]; if (!tam(v)) return; const b = best[k], sc = !(v && typeof v == "object");
        if (sc) { if (JSON.stringify(v) === JSON.stringify(cur[k])) return; if (!b || (c.ts || 0) > (b.ts || 0)) best[k] = { v, fuente: c.fuente, ts: c.ts }; return; }   // valor suelto: el más nuevo que sea distinto al de hoy
        if (!b || peso(v) > peso(b.v) || (peso(v) === peso(b.v) && (c.ts || 0) > (b.ts || 0))) best[k] = { v, fuente: c.fuente, ts: c.ts }; }));
      Object.keys(best).forEach((k) => { const b = best[k], a = cur[k]; if (JSON.stringify(a) === JSON.stringify(b.v)) return; const scal = !(b.v && typeof b.v == "object"); if (!scal && peso(a) >= peso(b.v)) return; filas.push({ doc, campo: k, antes: tamTxt(a), despues: tamTxt(b.v), v: b.v, fuente: b.fuente, opcional: scal && !vacio(a) }); });   // un valor suelto distinto al de hoy va sin tildar
      if (doc === "precios") {
        const gr = obj(cur.gastosRef), lista = arr(gr.lista), deG = gastosRefDeGastos().filter((x) => !lista.some((y) => nk(y.nombre) === nk(x.nombre)));
        const fg = filas.find((f) => f.doc === "precios" && f.campo === "gastosRef");
        if (fg) { const lc = arr(obj(fg.v).lista), mas = gastosRefDeGastos().filter((x) => !lc.some((y) => nk(y.nombre) === nk(x.nombre)) && !lista.some((y) => nk(y.nombre) === nk(x.nombre))); if (mas.length) { fg.v = Object.assign({}, fg.v, { lista: lc.concat(mas.map((x, i) => Object.assign({ id: "r" + Date.now().toString(36) + i }, x))) }); fg.fuente += " + los gastos cargados"; } fg.despues = arr(fg.v.lista).length + " precios"; fg.antes = lista.length + " precios"; }
        else if (deG.length) filas.push({ doc, campo: "gastosRef", sub: "lista", antes: lista.length + " precios", despues: (lista.length + deG.length) + " precios (" + deG.length + " de los gastos cargados: " + deG.slice(0, 4).map((x) => x.nombre).join(", ") + (deG.length > 4 ? "…" : "") + ")", v: Object.assign({}, gr, { lista: lista.concat(deG.map((x, i) => Object.assign({ id: "r" + Date.now().toString(36) + i }, x))) }), fuente: "los gastos cargados (último precio de cada cosa)" });
        const cc = obj(cur.certCerrados), mes = Object.keys(cc).sort().pop(), m = mes ? cc[mes] : null;
        if (m && !(+cur.baseEpec > 0) && +m.modulo > 0 && !filas.some((f) => f.doc === "precios" && f.campo === "baseEpec")) filas.push({ doc, campo: "baseEpec", antes: "vacío", despues: String(m.modulo), v: +m.modulo, fuente: `el certificado cerrado de ${mes}` });
        if (m && !cur.zonaContrato && m.zona && !filas.some((f) => f.doc === "precios" && f.campo === "zonaContrato")) filas.push({ doc, campo: "zonaContrato", antes: "vacío (se usa A)", despues: String(m.zona), v: m.zona, fuente: `el certificado cerrado de ${mes}` });
      }
    });
    return { filas, resumen };
  }
  function mezclar(a, b) {   // nunca saca: mapas = lo de la copia + lo que hay hoy que la copia no tiene; listas = la copia + lo de hoy que no está
    if (Array.isArray(b)) { const key = (x) => x && typeof x == "object" ? String(x.id || nk(x.nombre || x.label || "") || JSON.stringify(x)) : String(x); const ks = new Set(b.map(key)); return clon(b).concat(arr(a).filter((x) => !ks.has(key(x)))); }
    if (b && typeof b == "object") { const r = clon(b); Object.keys(obj(a)).forEach((k) => { if (!(k in r)) r[k] = a[k]; else if (Array.isArray(r[k]) && Array.isArray(a[k])) r[k] = mezclar(a[k], r[k]); }); return r; }
    return b;
  }

  // ---------- leer la auditoría (asistente que editó configEquipo/personal) y salud (último respaldo bajado)
  async function leerMas() {
    leidoErr = [];
    const db = intentar(() => firebase.firestore(), null);
    if (db) {
      try { const s = await db.collection("ordenesTrabajo").get(); otLeidas = s.docs.map((d) => Object.assign({ id: d.id }, d.data())); } catch (e) { leidoErr.push("órdenes (" + ((e && e.code) || "sin conexión") + ")"); }
      try { const s = await db.collection("cierresQuincena").get(); qLeidas = {}; s.forEach((d) => { qLeidas[d.id] = Object.assign({ id: d.id }, d.data()); }); } catch (e) { leidoErr.push("quincenas"); }
      try { const s = await db.collection("usuarios").get(); uLeidos = s.docs.map((d) => Object.assign({ id: d.id }, d.data())); } catch (e) { leidoErr.push("usuarios"); }
    }
    try { salud = window.fbSaludLeer ? await window.fbSaludLeer() : null; } catch (e) { salud = null; }
    try {
      const s = await firebase.firestore().collection("auditoria").where("accion", "==", "asistente_editar").limit(300).get();
      auditCopias = [];
      s.forEach((d) => { const a = d.data() || {}; if (a.coleccion !== "configEquipo" || a.ref !== "personal") return; const an = obj(a.antes); if (Array.isArray(an.nomina) || Array.isArray(an.vehiculos)) auditCopias.push({ ts: a.ts, que: "lo que había antes de un cambio del asistente", nomina: arr(an.nomina), vehiculos: arr(an.vehiculos) }); });
      auditLeida = true;
    } catch (e) { auditLeida = false; }
  }
  function leerArchivo(f) {
    return new Promise((ok) => {
      const r = new FileReader();
      r.onload = () => { try { const j = JSON.parse(r.result), p = obj(obj(j.configEquipo).personal); if (!arr(p.nomina).length && !arr(p.lista).length && !arr(p.vehiculos).length && !Object.keys(obj(j.configEquipo)).length) return ok("Ese archivo no trae la nómina ni los vehículos (tiene que ser un «respaldo_completo_…json»)."); archivo = { nombre: f.name, fecha: j.exportado ? fH(Date.parse(j.exportado)) : "", ts: Date.parse(j.exportado || "") || 0, nomina: arr(p.nomina).length ? p.nomina : arr(p.lista), vehiculos: arr(p.vehiculos), cfg: obj(j.configEquipo) }; ok(""); } catch (e) { ok("No pude leer ese archivo."); } };
      r.onerror = () => ok("No pude leer ese archivo."); r.readAsText(f);
    });
  }

  // ---------- la tarjeta y la hoja
  const st = { abierta: false, msg: "", A: null, sel: {} };
  function pintarTarjeta() {
    const pan = $("prodPanelPersonal"); if (!pan) return;
    let c = $("psRec");
    if (!esAdmin()) { c && c.remove(); return; }
    if (!c) { c = document.createElement("div"); c.className = "card"; c.id = "psRec"; c.style.marginTop = "16px"; const v = $("cardVehiculos"); v ? v.insertAdjacentElement("afterend", c) : pan.appendChild(c); }
    const h = `<h2 style="margin:0;"><span class="dot"></span>🩹 Recuperar personal y vehículos</h2><div class="hint" style="margin-top:3px;">Busca en las copias guardadas, las órdenes, las quincenas cerradas, los usuarios, el pañol y Gastos a la gente y los vehículos que no están en la lista, con lo que se sabe de cada uno. No saca a nadie; nada se guarda sin «Sí».</div><button type="button" class="btn-primary" data-ps="abrir" style="width:auto;margin-top:10px;">🔎 Ver qué se borró y qué se puede recuperar</button>`;
    if (c.__h !== h) { c.__h = h; c.innerHTML = h; }
  }
  const fmtV = (k, v) => k === "valorHora" ? "$ " + (+v).toLocaleString("es-AR") : k === "vehiculoId" ? (intentar(() => window.__vehiculos.porId(v), null) || {}).nombre || v : k === "equipoCivil" ? "sí" : String(v);
  function filaPer(f, i) {
    const d = CAMPOS.map(([k, t]) => f.datos[k] ? `<li>${esc(t)}: <b>${esc(fmtV(k, f.datos[k].v))}</b> <small>de ${esc(f.datos[k].fuente)}</small></li>` : k === "equipoCivil" ? "" : `<li class="ps-falta">${esc(t)}: no está en ningún lado (hay que cargarlo)</li>`).join("");
    return `<label class="ps-fila"><input type="checkbox" data-pssel="p${i}" ${st.sel["p" + i] !== false ? "checked" : ""}><span><b>${esc(f.nombre)}</b> <small>${f.ultima ? "última orden " + esc(f.ultima) + " · " : ""}${esc(f.refs.length)} referencias</small><ul>${d}</ul></span></label>`;
  }
  function hojaHtml() {
    const A = st.A;
    if (!A) return `<p>Buscando…</p>`;
    const nSel = (p) => Object.keys(st.sel).filter((k) => k[0] === p && st.sel[k] !== false).length;
    return `<div class="v7-asa"></div><div class="v7-cab"><div><h3>🔎 Qué se borró</h3><small>Hoy la nómina tiene ${A.actual} persona${A.actual === 1 ? "" : "s"} y ${A.vehiculos} vehículo${A.vehiculos === 1 ? "" : "s"}.</small></div><button type="button" class="v7-x" data-ps="x" aria-label="Cerrar">✕</button></div>
<div class="ps-diag" role="status">🔎 Revisé <b>${A.diag.ordenes}</b> órdenes (${A.diag.ordenesConGente} con gente${A.diag.leidasBase ? `, ${A.diag.leidasBase} leídas recién de la base` : ""}), <b>${A.diag.quincenas}</b> quincenas cerradas, <b>${A.diag.usuarios}</b> usuarios, ${A.diag.vales} vales del pañol y ${A.diag.copias} copias. Encontré <b>${A.diag.personas}</b> personas: <b>${A.yaEn.length}</b> ya están en la nómina y <b>${A.faltan.length}</b> faltan${A.diag.noObra ? ` (${A.diag.noObra} son de la oficina, no van)` : ""}.${A.diag.errores.length ? ` <span class="ps-falta">No pude leer: ${esc(A.diag.errores.join(", "))}.</span>` : ""}${!A.diag.ordenes ? ' <span class="ps-falta">Todavía no hay órdenes cargadas: esperá unos segundos y se vuelve a revisar solo.</span>' : ""}</div>
<details class="ps-ya"><summary>Ya en la nómina (${A.yaEn.length})</summary><ul class="ps-ul">${A.yaEn.map((y) => `<li>${esc(y.nombre)}${nk(y.nombre) !== nk(y.en) ? ` → <b>${esc(y.en)}</b>` : ""}${y.nOt ? ` <small>(${y.nOt} órdenes)</small>` : ""}</li>`).join("")}</ul></details>
<h4 class="ps-h">Qué pasó</h4><ul class="ps-ul">${A.linea.map((l) => `<li>${l}</li>`).join("")}</ul>
<h4 class="ps-h">Personas que no están en la nómina (${A.faltan.length})</h4>${A.faltan.length ? A.faltan.map(filaPer).join("") : '<div class="hint">No falta nadie de los que aparecen en las órdenes, quincenas, usuarios ni copias.</div>'}
<h4 class="ps-h">Datos que faltan de los que están (${A.completar.length})</h4>${A.completar.length ? A.completar.map((x, i) => `<label class="ps-fila"><input type="checkbox" data-pssel="c${i}" ${st.sel["c" + i] !== false ? "checked" : ""}><span><b>${esc(x.nombre)}</b>: ${esc(x.txt)} <b>${esc(fmtV(x.campo, x.v))}</b> <small>de ${esc(x.fuente)}</small></span></label>`).join("") : '<div class="hint">Nada para completar con las copias que hay.</div>'}
<h4 class="ps-h">Vehículos que no están (${A.vFaltan.length})</h4>${A.vFaltan.length ? A.vFaltan.map((x, i) => `<label class="ps-fila"><input type="checkbox" data-pssel="v${i}" ${x.soloId ? "" : st.sel["v" + i] !== false ? "checked" : ""} ${x.soloId ? "disabled" : ""}><span><b>${esc(x.v.nombre || "(sin nombre)")}</b>${x.v.patente ? " · " + esc(x.v.patente) : ""}${x.v.tipo ? " · " + esc(x.v.tipo) : ""}${x.v.lugares ? " · " + esc(x.v.lugares) + " lugares" : ""} <small>de ${esc(x.fuente)}${x.ot && x.ot.aCargo ? " · lo llevó " + esc(x.ot.aCargo) + (x.ot.ultima ? " (" + esc(x.ot.ultima) + ")" : "") : ""}</small></span></label>`).join("") : '<div class="hint">No falta ningún vehículo de los que aparecen.</div>'}
${A.vCompletar.length ? `<h4 class="ps-h">Datos que faltan de los vehículos (${A.vCompletar.length})</h4>` + A.vCompletar.map((x, i) => `<label class="ps-fila"><input type="checkbox" data-pssel="w${i}" ${st.sel["w" + i] !== false ? "checked" : ""}><span><b>${esc(x.nombre)}</b>: ${esc(x.campo)} <b>${esc(String(x.v))}</b> <small>de ${esc(x.fuente)}</small></span></label>`).join("") : ""}
<h4 class="ps-h">Lo que no está en ningún lado (${A.perdido.length})</h4>${A.perdido.length ? `<div class="hint">Esto hay que cargarlo a mano (o traer un archivo de respaldo):</div><ul class="ps-ul ps-perd">${A.perdido.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : '<div class="hint">Nada.</div>'}
<h4 class="ps-h">💲 Precios, baremo y el resto de la configuración (${A.cfg.length})</h4><ul class="ps-ul">${A.cfgRes.map((r) => `<li><b>${esc(r.nombre)}</b>: ${r.cargado ? `${r.campos} datos guardados${r.ts ? `, último guardado el ${fH(r.ts)}${r.por ? " por " + esc(r.por) : ""}` : ""}` : "todavía no llegó de la base"} · ${r.copias} copia${r.copias === 1 ? "" : "s"}</li>`).join("")}</ul>${A.cfg.length ? A.cfg.map((x, i) => `<label class="ps-fila"><input type="checkbox" data-pssel="k${i}" ${st.sel["k" + i] ? "checked" : ""}><span><b>${esc(NOMBRE[x.doc] || x.doc)} › ${esc(x.campo)}</b>: ${esc(x.antes)} → <b>${esc(x.despues)}</b> <small>de ${esc(x.fuente)}</small></span></label>`).join("") : '<div class="hint">No hay ninguna copia ni dato con más información que lo que hay hoy. Si tenés un «respaldo_completo_…json», cargalo abajo.</div>'}
<h4 class="ps-h">Copias encontradas (${A.copias.length})</h4>${A.copias.length ? `<ul class="ps-ul">${A.copias.map((c) => `<li>${esc(c.fuente)}: ${c.personas} personas, ${c.vehiculos} vehículos</li>`).join("")}</ul>` : '<div class="hint">Ninguna copia completa (ni en la base, ni en este aparato, ni en la auditoría).</div>'}
<label class="ps-arch">📂 Buscar en un archivo de respaldo («respaldo_completo_…json»)<input type="file" accept=".json,application/json" id="psArch"></label>
<div class="v7-msg" id="psMsg" role="status">${esc(st.msg)}</div>
<div class="v7-acc"><button type="button" class="btn-ghost" data-ps="x">Cancelar</button><button type="button" class="btn-primary" data-ps="si" ${nSel("p") + nSel("c") + nSel("v") + nSel("w") + nSel("k") ? "" : "disabled"}>Sí, agregarlos (${nSel("p")} personas · ${nSel("v")} vehículos${nSel("c") + nSel("w") + nSel("k") ? " · " + (nSel("c") + nSel("w") + nSel("k")) + " datos" : ""})</button></div>`;
  }
  function selDefault() {
    const A = st.A; st.sel = {};
    A.faltan.forEach((_, i) => { st.sel["p" + i] = true; }); A.completar.forEach((_, i) => { st.sel["c" + i] = true; });
    A.vFaltan.forEach((x, i) => { st.sel["v" + i] = !x.soloId; }); A.vCompletar.forEach((_, i) => { st.sel["w" + i] = true; }); arr(A.cfg).forEach((x, i) => { st.sel["k" + i] = !x.opcional; });
  }
  function pintarHoja() { const v = $("psOv"); if (!v) return; const c = v.querySelector(".v7-caja"); const top = c.scrollTop; c.innerHTML = hojaHtml(); c.scrollTop = top; }
  async function abrir() {
    let v = $("psOv"); v && v.remove();
    v = document.createElement("div"); v.id = "psOv"; v.className = "v7-ov v7-arriba"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true"); v.setAttribute("aria-label", "Qué se borró");
    v.innerHTML = `<div class="v7-caja ps-caja"></div>`; document.body.appendChild(v);
    st.abierta = true; st.msg = ""; st.A = null; firmaRe = ""; pintarHoja();
    await leerMas(); st.A = analizar(); selDefault(); pintarHoja();
  }
  function cerrar() { const v = $("psOv"); v && v.remove(); st.abierta = false; }
  let firmaRe = "";
  setInterval(() => { try { if (!st.abierta || !st.A || !$("psOv")) return; const f = JSON.stringify([intentar(() => window.__sync.ordenesTrabajo.ts, 0), Object.keys(obj(window.__cierresQuincena)).length, intentar(() => window.PERMISOS.lista().length, 0), intentar(() => window.__personalNube.ts, 0)]); if (!firmaRe) { firmaRe = f; return; } if (f !== firmaRe) { firmaRe = f; const a = st.A; st.A = analizar(); if (st.A.faltan.length !== a.faltan.length || st.A.vFaltan.length !== a.vFaltan.length) selDefault(); pintarHoja(); } } catch (e) { } }, 2000);
  async function aplicar() {
    const A = st.A; if (!A) return;
    if (!cargado()) { st.msg = "⚠ Todavía no llegó la nómina de la base."; return pintarHoja(); }
    const nom = clon(nominaBase()), veh = clon(vehBase()), hecho = [];
    A.faltan.forEach((f, i) => { if (st.sel["p" + i] === false) return; if (buscar(nom, f.nombre)) return; const p = { legajo: "", nombre: f.nombre, sector: "alumbrado", rol: "Ayudante", valorHora: 0, vehiculoId: "", activo: true }; CAMPOS.forEach(([k]) => { if (f.datos[k]) p[k] = f.datos[k].v; }); if (f.datos.activo && f.datos.activo.v === "no") p.activo = false; if (!f.datos.rol) p.rolAConfirmar = true; nom.push(p); hecho.push(f.nombre); });
    A.completar.forEach((x, i) => { if (st.sel["c" + i] === false) return; const p = buscar(nom, x.nombre); if (p && vacio(p[x.campo])) { p[x.campo] = x.v; hecho.push(x.nombre + " (" + x.txt + ")"); } });
    A.vFaltan.forEach((x, i) => { if (st.sel["v" + i] === false || x.soloId) return; if (veh.some((v) => v.id === x.id)) return; const v = Object.assign({ activo: true }, clon(x.v)); if (!v.id || /^n:/.test(v.id)) v.id = "v" + Date.now().toString(36) + i; veh.push(v); hecho.push("vehículo " + v.nombre); });
    A.vCompletar.forEach((x, i) => { if (st.sel["w" + i] === false) return; const v = veh.find((y) => y.id === x.id); if (v && vacio(v[x.campo])) v[x.campo] = x.v; });
    const pc = {}, hechoC = [];
    arr(A.cfg).forEach((x, i) => { if (st.sel["k" + i] === false) return; const cur = curDe(x.doc); (pc[x.doc] = pc[x.doc] || {})[x.campo] = x.sub ? x.v : mezclar(cur[x.campo], x.v); hechoC.push((NOMBRE[x.doc] || x.doc) + " › " + x.campo); });
    if (!hecho.length && !hechoC.length) { st.msg = "No hay nada tildado."; return pintarHoja(); }
    const ok = await preguntar("¿Recuperar esto?", `${hecho.length ? `<p>Nómina: se agrega${hecho.length === 1 ? "" : "n"} <b>${hecho.length}</b>: ${esc(hecho.slice(0, 30).join(", "))}${hecho.length > 30 ? "…" : ""}. Queda: <b>${nom.length} personas</b> y <b>${veh.length} vehículos</b>.</p>` : ""}${hechoC.length ? `<p>Configuración: <b>${esc(hechoC.join(", "))}</b> (se suma lo de la copia a lo que hay hoy).</p>` : ""}<p>No se saca nada. Antes se guarda una copia de cómo está ahora.</p>`, "Sí, recuperar", "No");
    if (!ok) return;
    const verC = [];
    for (const doc of Object.keys(pc)) {
      try {
        if (doc === "personal") { const p2 = await guardia(Object.assign({}, pc[doc]), { sinPreguntar: true }); await firebase.firestore().collection("configEquipo").doc("personal").set(p2, { merge: true }); window.__personalNube = Object.assign({}, base(), p2); }
        else { const p2 = await guardiaCfg(doc, Object.assign({}, pc[doc], { ts: Date.now(), usuario: yoEmail() }), { sinPreguntar: true }); await firebase.firestore().collection("configEquipo").doc(doc).set(p2, { merge: true });
          if (doc === "baremo") { window.__baremoNube = Object.assign({}, obj(window.__baremoNube), p2); try { window.aplicarBaremoDeLaNube && window.aplicarBaremoDeLaNube(); } catch (e) { } }
          else if (doc === "precios") { window.__preciosNube = Object.assign({}, obj(window.__preciosNube), p2); try { window.aplicarPreciosDeLaNube && window.aplicarPreciosDeLaNube(); } catch (e) { } }
          else DAT[doc] = Object.assign({}, obj(DAT[doc]), p2); }
        try { const s = await firebase.firestore().collection("configEquipo").doc(doc).get(); const d = s.exists ? s.data() || {} : {}; verC.push(`✓ ${NOMBRE[doc] || doc}: ${Object.keys(pc[doc]).map((k) => k + " " + tamTxt(d[k])).join(", ")}`); } catch (e) { verC.push(`⚠ ${NOMBRE[doc] || doc}: mandado, no lo pude leer de vuelta`); }
        try { window.fbAuditar && window.fbAuditar("config_recuperar", `${doc}: ${Object.keys(pc[doc]).join(", ")}`, { doc, campos: Object.keys(pc[doc]) }); } catch (e) { }
      } catch (er) { verC.push("⚠ " + (NOMBRE[doc] || doc) + ": " + window.__psErr(er)); }
    }
    if (!hecho.length) { st.msg = verC.join(" · "); st.A = analizar(); selDefault(); return pintarHoja(); }
    try {
      const patch = await guardia({ nomina: nom, vehiculos: veh, ts: Date.now(), usuario: yoEmail(), vehiculosTs: Date.now(), vehiculosPor: yoEmail() }, { accion: "personal_recuperar", sinPreguntar: true });
      await firebase.firestore().collection("configEquipo").doc("personal").set(patch, { merge: true });
      window.__personalNube = Object.assign({}, base(), patch);
      try { window.aplicarPersonalDeLaNube && window.aplicarPersonalDeLaNube(); } catch (e) { }
      let ver = "";
      try { const s = await firebase.firestore().collection("configEquipo").doc("personal").get(); const d = s.exists ? s.data() || {} : {}; ver = `✓ Guardado: ${arr(d.nomina).length} personas, ${arr(d.vehiculos).length} vehículos (leído de vuelta de la base).`; } catch (e) { ver = "⚠ Se mandó a la base pero no pude leerlo de vuelta: fijate en un rato."; }
      st.msg = `${ver} ${hecho.length} agregado${hecho.length === 1 ? "" : "s"}. Revisá los roles «a confirmar» y los legajos vacíos en la nómina.${verC.length ? " " + verC.join(" · ") : ""}`;
      st.A = analizar(); selDefault();
    } catch (er) { st.msg = window.__psErr(er); }
    pintarHoja();
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-ps]"); if (!b) return;
    const a = b.dataset.ps;
    if (a === "abrir") abrir(); else if (a === "x") cerrar(); else if (a === "si") aplicar();
  });
  document.addEventListener("change", async (e) => {
    const t = e.target; if (!t) return;
    if (t.dataset && t.dataset.pssel) { st.sel[t.dataset.pssel] = t.checked; pintarHoja(); return; }
    if (t.id === "psArch" && t.files && t.files[0]) { const m = await leerArchivo(t.files[0]); st.msg = m || "✓ Archivo leído: se suma como copia."; st.A = analizar(); selDefault(); pintarHoja(); }
  });
  window.__psRec = { analizar, abrir, cerrar, aplicar, copias, guardia, esFabrica, leerArchivo: (txt, nombre) => { const j = JSON.parse(txt), p = obj(obj(j.configEquipo).personal); archivo = { nombre: nombre || "respaldo.json", fecha: "", ts: 0, nomina: arr(p.nomina).length ? p.nomina : arr(p.lista), vehiculos: arr(p.vehiculos), cfg: obj(j.configEquipo) }; }, estado: () => ({ cargado: cargado(), deBase: !!window.__nominaDeBase, sel: Object.assign({}, st.sel), A: st.A }) };
})();
