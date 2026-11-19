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

  // ---------- la guardia: todo lo que escribe configEquipo/personal pasa por acá
  async function guardia(patch, op) {
    op = op || {};
    const p = Object.assign({}, patch || {}), ks = Object.keys(p);
    if (ks.some((k) => /^(nomina|vehiculos|lista|respaldos)\./.test(k))) throw err("ps-campo", "La nómina y los vehículos se cambian desde Producción › Personal del equipo (no por partes). No se guardó nada.");
    const tN = "nomina" in p || "lista" in p, tV = "vehiculos" in p;
    if (!tN && !tV) return p;
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
    if (bN.length || bV.length) {
      const r = { ts: Date.now(), por: yoEmail(), nomina: clon(bN), vehiculos: clon(bV), deTs: base().ts || null, deUsuario: base().usuario || "" };
      p.respaldos = arr(base().respaldos).concat([r]).slice(-10);
    }
    try {
      window.fbAuditar && window.fbAuditar(op.accion || "personal_guardar", `Nómina ${bN.length} → ${nN.length} personas · vehículos ${bV.length} → ${nV.length}` + (sacados.length ? ` · sacó: ${sacados.join(", ")}` : "") + (vSac.length ? ` · sacó vehículos: ${vSac.join(", ")}` : ""), { antes: { personas: bN.length, vehiculos: bV.length }, despues: { personas: nN.length, vehiculos: nV.length }, sacados, vehiculosSacados: vSac, agregados: tN ? nN.filter((y) => y && y.nombre && !bN.some((x) => x && nk(x.nombre) === nk(y.nombre))).map((y) => y.nombre) : [] });
    } catch (e) { }
    return p;
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
  const ordenes = () => intentar(() => (typeof ordenesTrabajo !== "undefined" ? ordenesTrabajo : window.ordenesTrabajo) || [], []).filter((o) => o && o.estado !== "Anulada").slice().sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")) || (+b.creado || 0) - (+a.creado || 0));
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
      arr(o.personal).forEach((p) => { if (!p || !p.nombre) return; const x = persona(p.nombre); x.refs.push("orden " + (o.numero || o.id)); if (!x.ultima || f > x.ultima) x.ultima = f; dato(x, "rol", p.rol, `la orden ${o.numero || o.id} del ${f}`); if (p.legajo) dato(x, "legajo", p.legajo, `la orden ${o.numero || o.id}`); });
      Object.keys(vp).forEach((n) => { const v = vp[n]; if (!v || !v.id) return; const x = persona(n); dato(x, "vehiculoId", v.id, `la orden ${o.numero || o.id} del ${f} (iba en ${v.nombre || v.id})`); });
      arr(o.vehiculos).forEach((v) => { if (!v || !v.id) return; const y = vehOt.get(v.id) || { id: v.id, nombre: v.nombre || "", patente: v.patente || "", refs: [], ultima: "", aCargo: "" }; y.refs.push(o.numero || o.id); if (!y.ultima || f > y.ultima) y.ultima = f; if (!y.nombre && v.nombre) y.nombre = v.nombre; if (!y.patente && v.patente) y.patente = v.patente; vehOt.set(v.id, y); });
      Object.keys(vp).forEach((n) => { const v = vp[n]; if (v && v.id) { const y = vehOt.get(v.id) || { id: v.id, nombre: v.nombre || "", patente: v.patente || "", refs: [o.numero || o.id], ultima: f, aCargo: "" }; if (!y.aCargo) y.aCargo = n; vehOt.set(v.id, y); } });
    });
    // 3) quincenas cerradas (legajo y rol)
    Object.keys(obj(window.__cierresQuincena)).sort().reverse().forEach((q) => arr(window.__cierresQuincena[q].personas).forEach((p) => { if (!p || !p.nombre) return; const x = persona(p.nombre); x.refs.push("quincena " + q); dato(x, "legajo", p.legajo, `la quincena cerrada ${q}`); dato(x, "rol", String(p.rol || "").split(" / ")[0], `la quincena cerrada ${q}`); }));
    // 4) usuarios con persona vinculada (cuadrilla / operario)
    intentar(() => window.PERMISOS.lista(), []).forEach((u) => { if (u && u.persona && /cuadrilla|operario/.test(u.rol || "") && u.activo !== false) { const x = persona(u.persona); x.refs.push("usuario " + (u.usuario || u.email || "")); } });
    // 5) movimientos del pañol: el sector
    intentar(() => window.stockMovimientos || [], []).slice().sort((a, b) => (+b.ts || 0) - (+a.ts || 0)).forEach((m) => { const s = m && m.sector; if (!s) return; [m.personaNombre, m.retira, m.retiradoPor, m.quien, m.devueltoPor].forEach((n) => { if (n && P.size) { for (const [q, x] of P) if (mismo(q, n)) dato(x, "sector", s, "los vales del pañol"); } }); });
    // vehículos: copias + órdenes + combustible
    const V = new Map();
    C.forEach((c) => c.vehiculos.forEach((v) => { if (!v || !v.nombre) return; const id = v.id || "n:" + nk(v.nombre); if (!V.has(id)) V.set(id, { v: clon(v), fuente: c.fuente }); }));
    vehOt.forEach((y, id) => { if (!V.has(id)) V.set(id, { v: { id, nombre: y.nombre || "(sin nombre)", patente: y.patente || "", activo: true }, fuente: `las órdenes (${y.refs.slice(0, 3).join(", ")}${y.refs.length > 3 ? "…" : ""})`, ot: y }); else V.get(id).ot = y; });
    intentar(() => window.gastosObra || [], []).forEach((g) => { if (g && g.vehiculoId && !V.has(g.vehiculoId) && !vAct.some((x) => x.id === g.vehiculoId)) V.set(g.vehiculoId, { v: { id: g.vehiculoId, nombre: "", patente: "", activo: true }, fuente: "una carga de combustible de Gastos (" + (g.desc || g.fecha || "") + ")", soloId: true }); });
    // armar las filas
    const faltan = [], completar = [], vFaltan = [], vCompletar = [], perdido = [];
    P.forEach((x) => {
      const ya = buscar(actual, x.nombre);
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
    return { actual: actual.length, vehiculos: vAct.length, faltan, completar, vFaltan, vCompletar, perdido, linea, copias: C.map((c) => ({ id: c.id, fuente: c.fuente, personas: c.nomina.length, vehiculos: c.vehiculos.length })) };
  }

  // ---------- leer la auditoría (asistente que editó configEquipo/personal) y salud (último respaldo bajado)
  async function leerMas() {
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
      r.onload = () => { try { const j = JSON.parse(r.result), p = obj(obj(j.configEquipo).personal); if (!arr(p.nomina).length && !arr(p.lista).length && !arr(p.vehiculos).length) return ok("Ese archivo no trae la nómina ni los vehículos (tiene que ser un «respaldo_completo_…json»)."); archivo = { nombre: f.name, fecha: j.exportado ? fH(Date.parse(j.exportado)) : "", ts: Date.parse(j.exportado || "") || 0, nomina: arr(p.nomina).length ? p.nomina : arr(p.lista), vehiculos: arr(p.vehiculos) }; ok(""); } catch (e) { ok("No pude leer ese archivo."); } };
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
<h4 class="ps-h">Qué pasó</h4><ul class="ps-ul">${A.linea.map((l) => `<li>${l}</li>`).join("")}</ul>
<h4 class="ps-h">Personas que no están en la nómina (${A.faltan.length})</h4>${A.faltan.length ? A.faltan.map(filaPer).join("") : '<div class="hint">No falta nadie de los que aparecen en las órdenes, quincenas, usuarios ni copias.</div>'}
<h4 class="ps-h">Datos que faltan de los que están (${A.completar.length})</h4>${A.completar.length ? A.completar.map((x, i) => `<label class="ps-fila"><input type="checkbox" data-pssel="c${i}" ${st.sel["c" + i] !== false ? "checked" : ""}><span><b>${esc(x.nombre)}</b>: ${esc(x.txt)} <b>${esc(fmtV(x.campo, x.v))}</b> <small>de ${esc(x.fuente)}</small></span></label>`).join("") : '<div class="hint">Nada para completar con las copias que hay.</div>'}
<h4 class="ps-h">Vehículos que no están (${A.vFaltan.length})</h4>${A.vFaltan.length ? A.vFaltan.map((x, i) => `<label class="ps-fila"><input type="checkbox" data-pssel="v${i}" ${x.soloId ? "" : st.sel["v" + i] !== false ? "checked" : ""} ${x.soloId ? "disabled" : ""}><span><b>${esc(x.v.nombre || "(sin nombre)")}</b>${x.v.patente ? " · " + esc(x.v.patente) : ""}${x.v.tipo ? " · " + esc(x.v.tipo) : ""}${x.v.lugares ? " · " + esc(x.v.lugares) + " lugares" : ""} <small>de ${esc(x.fuente)}${x.ot && x.ot.aCargo ? " · lo llevó " + esc(x.ot.aCargo) + (x.ot.ultima ? " (" + esc(x.ot.ultima) + ")" : "") : ""}</small></span></label>`).join("") : '<div class="hint">No falta ningún vehículo de los que aparecen.</div>'}
${A.vCompletar.length ? `<h4 class="ps-h">Datos que faltan de los vehículos (${A.vCompletar.length})</h4>` + A.vCompletar.map((x, i) => `<label class="ps-fila"><input type="checkbox" data-pssel="w${i}" ${st.sel["w" + i] !== false ? "checked" : ""}><span><b>${esc(x.nombre)}</b>: ${esc(x.campo)} <b>${esc(String(x.v))}</b> <small>de ${esc(x.fuente)}</small></span></label>`).join("") : ""}
<h4 class="ps-h">Lo que no está en ningún lado (${A.perdido.length})</h4>${A.perdido.length ? `<div class="hint">Esto hay que cargarlo a mano (o traer un archivo de respaldo):</div><ul class="ps-ul ps-perd">${A.perdido.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : '<div class="hint">Nada.</div>'}
<h4 class="ps-h">Copias encontradas (${A.copias.length})</h4>${A.copias.length ? `<ul class="ps-ul">${A.copias.map((c) => `<li>${esc(c.fuente)}: ${c.personas} personas, ${c.vehiculos} vehículos</li>`).join("")}</ul>` : '<div class="hint">Ninguna copia completa (ni en la base, ni en este aparato, ni en la auditoría).</div>'}
<label class="ps-arch">📂 Buscar en un archivo de respaldo («respaldo_completo_…json»)<input type="file" accept=".json,application/json" id="psArch"></label>
<div class="v7-msg" id="psMsg" role="status">${esc(st.msg)}</div>
<div class="v7-acc"><button type="button" class="btn-ghost" data-ps="x">Cancelar</button><button type="button" class="btn-primary" data-ps="si" ${nSel("p") + nSel("c") + nSel("v") + nSel("w") ? "" : "disabled"}>Sí, agregarlos (${nSel("p")} personas · ${nSel("v")} vehículos${nSel("c") + nSel("w") ? " · " + (nSel("c") + nSel("w")) + " datos" : ""})</button></div>`;
  }
  function selDefault() {
    const A = st.A; st.sel = {};
    A.faltan.forEach((_, i) => { st.sel["p" + i] = true; }); A.completar.forEach((_, i) => { st.sel["c" + i] = true; });
    A.vFaltan.forEach((x, i) => { st.sel["v" + i] = !x.soloId; }); A.vCompletar.forEach((_, i) => { st.sel["w" + i] = true; });
  }
  function pintarHoja() { const v = $("psOv"); if (!v) return; const c = v.querySelector(".v7-caja"); const top = c.scrollTop; c.innerHTML = hojaHtml(); c.scrollTop = top; }
  async function abrir() {
    let v = $("psOv"); v && v.remove();
    v = document.createElement("div"); v.id = "psOv"; v.className = "v7-ov v7-arriba"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true"); v.setAttribute("aria-label", "Qué se borró");
    v.innerHTML = `<div class="v7-caja ps-caja"></div>`; document.body.appendChild(v);
    st.abierta = true; st.msg = ""; st.A = null; pintarHoja();
    await leerMas(); st.A = analizar(); selDefault(); pintarHoja();
  }
  function cerrar() { const v = $("psOv"); v && v.remove(); st.abierta = false; }
  async function aplicar() {
    const A = st.A; if (!A) return;
    if (!cargado()) { st.msg = "⚠ Todavía no llegó la nómina de la base."; return pintarHoja(); }
    const nom = clon(nominaBase()), veh = clon(vehBase()), hecho = [];
    A.faltan.forEach((f, i) => { if (st.sel["p" + i] === false) return; if (buscar(nom, f.nombre)) return; const p = { legajo: "", nombre: f.nombre, sector: "alumbrado", rol: "Ayudante", valorHora: 0, vehiculoId: "", activo: true }; CAMPOS.forEach(([k]) => { if (f.datos[k]) p[k] = f.datos[k].v; }); if (f.datos.activo && f.datos.activo.v === "no") p.activo = false; if (!f.datos.rol) p.rolAConfirmar = true; nom.push(p); hecho.push(f.nombre); });
    A.completar.forEach((x, i) => { if (st.sel["c" + i] === false) return; const p = buscar(nom, x.nombre); if (p && vacio(p[x.campo])) { p[x.campo] = x.v; hecho.push(x.nombre + " (" + x.txt + ")"); } });
    A.vFaltan.forEach((x, i) => { if (st.sel["v" + i] === false || x.soloId) return; if (veh.some((v) => v.id === x.id)) return; const v = Object.assign({ activo: true }, clon(x.v)); if (!v.id || /^n:/.test(v.id)) v.id = "v" + Date.now().toString(36) + i; veh.push(v); hecho.push("vehículo " + v.nombre); });
    A.vCompletar.forEach((x, i) => { if (st.sel["w" + i] === false) return; const v = veh.find((y) => y.id === x.id); if (v && vacio(v[x.campo])) v[x.campo] = x.v; });
    if (!hecho.length) { st.msg = "No hay nada tildado."; return pintarHoja(); }
    const ok = await preguntar("¿Agregar a la nómina?", `<p>Se agrega${hecho.length === 1 ? "" : "n"} <b>${hecho.length}</b> cosa${hecho.length === 1 ? "" : "s"}: ${esc(hecho.slice(0, 30).join(", "))}${hecho.length > 30 ? "…" : ""}.</p><p>Queda: <b>${nom.length} personas</b> y <b>${veh.length} vehículos</b>. No se saca a nadie. Antes se guarda una copia de cómo está ahora.</p>`, "Sí, agregarlos", "No");
    if (!ok) return;
    try {
      const patch = await guardia({ nomina: nom, vehiculos: veh, ts: Date.now(), usuario: yoEmail(), vehiculosTs: Date.now(), vehiculosPor: yoEmail() }, { accion: "personal_recuperar", sinPreguntar: true });
      await firebase.firestore().collection("configEquipo").doc("personal").set(patch, { merge: true });
      window.__personalNube = Object.assign({}, base(), patch);
      try { window.aplicarPersonalDeLaNube && window.aplicarPersonalDeLaNube(); } catch (e) { }
      st.msg = `✓ Listo: ${hecho.length} agregado${hecho.length === 1 ? "" : "s"}. Revisá los roles «a confirmar» y los legajos vacíos en la nómina.`;
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
  window.__psRec = { analizar, abrir, cerrar, aplicar, copias, guardia, esFabrica, leerArchivo: (txt, nombre) => { const j = JSON.parse(txt), p = obj(obj(j.configEquipo).personal); archivo = { nombre: nombre || "respaldo.json", fecha: "", ts: 0, nomina: arr(p.nomina).length ? p.nomina : arr(p.lista), vehiculos: arr(p.vehiculos) }; }, estado: () => ({ cargado: cargado(), deBase: !!window.__nominaDeBase, sel: Object.assign({}, st.sel), A: st.A }) };
})();
