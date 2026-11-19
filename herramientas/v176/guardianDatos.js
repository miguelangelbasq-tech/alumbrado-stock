(function () {
  "use strict";
  // v176 · 🛡 Guardián de datos (Ángel 19/11, después de que el 18/11 a las 12:36 se pisó la nómina —10 de 15 personas, legajos,
  // valor hora—, se vaciaron los vehículos y faltan datos de precios: «hay que tener algo controlador… no pueden pasar cosas así;
  // es muy grave»). Solo ADMINISTRACIÓN lo ve (hoja, menú, alertas del Inicio y del Supervisor, aviso al celu, volver atrás y
  // las herramientas del asistente). La copia diaria y el control los hace en silencio también un aparato de Oficina, así el
  // aviso a los admin sale aunque ese día ningún admin abra la app.
  //  1) Copia de todos los días: el primer aparato de admin/oficina toma el turno (transacción en configEquipo/salud.guardian.<día>)
  //     y guarda adjuntos/cfg-<día> {tipo:"respaldoCfg", docs: personal, precios, baremo, cuadrillas, ubicacion, alias, guias,
  //     reinicios —sin sus respaldos[]—, tamaños y cuentas}; si no entra en 1 MB, cada documento grande va aparte (cfg-<día>-<doc>).
  //     Nunca vapid ni secretosServidor. Las copias no se borran solas (con más de 60, Administración puede borrar las viejas con «Sí»).
  //  2) Cuentas de cada lista (todo de memoria, sin lecturas de más) contra la copia del día anterior: si se borran 2 o más, una
  //     lista queda en 0 o un campo que tenía datos queda vacío → alerta ROJA (Inicio › Para atender, Supervisor «Datos», aviso al
  //     celu de los admin una vez por incidente) con «Ver qué cambió» y «Volver a como estaba» (casillas + «Sí», copia antes, se lee
  //     de vuelta, nunca saca lo agregado después). Lo sacado con el «Sí» de la guardia de la v174 queda en ámbar (no avisa).
  //  3) Hoja «🛡 Guardián de datos»; 4) asistente (bloque ia176, dormido); 5) auditoría de cada guardado de configEquipo con cuentas.
  if (window.__v176No) return;
  const $ = (id) => document.getElementById(id);
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const clon = (x) => { try { return x === undefined ? undefined : JSON.parse(JSON.stringify(x)); } catch (e) { return undefined; } };
  const intentar = (f, d) => { try { const r = f(); return r === undefined ? d : r; } catch (e) { return d; } };
  const yo = () => intentar(() => window.PERMISOS.yo(), null) || {};
  const rol = () => String(yo().rol || "");
  const esAdmin = () => rol() === "admin" && yo().activo !== false && !yo().pendiente;
  const trabaja = () => (rol() === "admin" || rol() === "oficina") && yo().activo !== false && !yo().pendiente;   // copia y control en silencio
  const yoEmail = () => String((window.__fbUser || {}).email || "");
  const db = () => firebase.firestore();
  const pad = (n) => String(n).padStart(2, "0");
  const diaDe = (t) => { const d = new Date(t); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const ahora = () => (window.__gdAhora ? +window.__gdAhora : Date.now());
  const hoy = () => diaDe(ahora());
  const menosDias = (f, n) => { const d = new Date(f + "T12:00:00"); d.setDate(d.getDate() - n); return diaDe(+d); };
  const fCorta = (f) => (f ? f.slice(8, 10) + "/" + f.slice(5, 7) : "");
  const fH = (t) => { if (!t) return "?"; const d = new Date(t); return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + " a las " + pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const fN = (n) => intentar(() => Number(n).toLocaleString("es-AR"), String(n));
  const tamJ = (x) => { try { return JSON.stringify(x).length; } catch (e) { return 0; } };

  // ---------------------------------------------------------------- qué se copia y qué se cuenta
  const DOCS = ["personal", "precios", "baremo", "cuadrillas", "ubicacion", "alias", "guias", "reinicios"];   // nunca vapid (la privada ni existe acá) ni secretosServidor
  const RESTAURABLES = ["personal", "precios", "baremo", "cuadrillas", "ubicacion"];
  const NOMBRE = { personal: "Personal del equipo", precios: "Precios e itemizado", baremo: "Cuánto vale cada tarea", cuadrillas: "Cuadrillas", ubicacion: "Ubicación en vivo", alias: "Usuarios cortos", guias: "Guías", reinicios: "Reinicios de puntos" };
  const VOL = /^(respaldos|ts|usuario|por|porNombre|actualizado|actualizadoPor|editadoTs|editadoPor|ultimoRespaldo)$|Ts$|Por$/;
  const memDoc = (d) => obj(d === "personal" ? window.__personalNube : d === "baremo" ? window.__baremoNube : d === "precios" ? window.__preciosNube : obj(window.__cfgDatos)[d]);
  const cargadoDoc = (d) => (d === "personal" ? !!window.__personalCargado : !!obj(window.__cfgCargado)[d]);
  const tam = (v) => (Array.isArray(v) ? v.length : v && typeof v == "object" ? Object.keys(v).length : v == null || v === "" ? 0 : 1);
  const camposDe = (d) => { const o = {}; Object.keys(obj(d)).forEach((k) => { if (!VOL.test(k)) o[k] = tam(d[k]); }); return o; };
  const sync = (c) => obj(window.__sync)[c];
  const col = (c) => () => { const s = sync(c); if (!s) return null; if (c === "ordenesTrabajo" && s.filtro === "mias") return null; return s.n; };
  const nom = (p) => (arr(p.nomina).length ? arr(p.nomina) : arr(p.lista));
  // [clave, texto, doc/campo que mide (para «Ver qué cambió»), contar(), colección grande]
  const LISTAS = [
    ["nomina", "personas de la nómina", "personal.nomina", () => (cargadoDoc("personal") ? nom(memDoc("personal")).length : null)],
    ["vehiculos", "vehículos", "personal.vehiculos", () => (cargadoDoc("personal") ? arr(memDoc("personal").vehiculos).length : null)],
    ["gastosRef", "precios de la lista de Gastos", "precios.gastosRef", () => (cargadoDoc("precios") ? tam(obj(memDoc("precios").gastosRef)) : null)],
    ["baremoValores", "valores de tareas del baremo", "baremo.baremo", () => (cargadoDoc("baremo") ? tam(obj(memDoc("baremo").baremo)) : null)],
    ["tareasPropias", "tareas creadas", "baremo.tareasPropias", () => (cargadoDoc("baremo") ? arr(memDoc("baremo").tareasPropias).length : null)],
    ["cuadrillas", "cuadrillas", "cuadrillas.lista", () => (cargadoDoc("cuadrillas") ? arr(memDoc("cuadrillas").lista).length : null)],
    ["catalogoCosto", "productos del pañol con costo", "", () => (sync("catalogoProductos") ? arr(window.catalogoCambios).filter((c) => c && +c.costo > 0).length : null)],
    ["catalogo", "productos del pañol con cambios", "", col("catalogoProductos")],
    ["usuarios", "usuarios", "", () => { const l = arr(intentar(() => window.PERMISOS.lista(), [])); return l.length ? l.length : null; }],
    ["obras", "obras", "", col("avanceObras"), true],
    ["ordenes", "órdenes de trabajo", "", col("ordenesTrabajo"), true],
    ["reservas", "reservas", "", col("reservas"), true],
    ["movimientos", "movimientos del pañol", "", col("movimientos"), true],
    ["gastosObra", "gastos de obra", "", col("gastosObra"), true],
    ["calculos", "cómputos de la Calculadora", "", col("historialCalculos"), true]
  ];
  const CAMPO_LISTA = {}; LISTAS.forEach((l) => { if (l[2]) CAMPO_LISTA[l[2]] = l[0]; }); CAMPO_LISTA["personal.lista"] = "nomina";
  function cuentas() { const o = {}; LISTAS.forEach((l) => { const n = intentar(l[3], null); if (n != null) o[l[0]] = n; }); return o; }
  function camposMem() { const o = {}; DOCS.forEach((d) => { if (cargadoDoc(d)) o[d] = camposDe(memDoc(d)); }); return o; }

  // ---------------------------------------------------------------- estado (configEquipo/salud)
  const st = { salud: null, saludTs: 0, vivas: [], ambar: [], abierta: false, modo: null, msg: "", aud: null, ocupado: false, conf: "", ultTic: 0 };
  async function leerSalud(forzar) {
    if (!forzar && st.salud && Date.now() - st.saludTs < 30 * 6e4) return st.salud;
    try { const s = await db().collection("configEquipo").doc("salud").get(); st.salud = s.exists ? s.data() || {} : {}; st.saludTs = Date.now(); } catch (e) { st.salud = st.salud || {}; }
    return st.salud;
  }
  const entradas = () => { const g = obj(obj(st.salud).guardian); return Object.keys(g).filter((k) => /^\d{4}-\d\d-\d\d$/.test(k) && g[k] && g[k].estado === "hecho").sort().map((k) => Object.assign({ fecha: k }, g[k])); };
  const base = () => { const h = hoy(), l = entradas().filter((e) => e.fecha < h); return l.length ? l[l.length - 1] : null; };
  const deHace = (n) => { const f = menosDias(hoy(), n), l = entradas().filter((e) => e.fecha <= f); return l.length ? l[l.length - 1] : null; };
  const alertasGuardadas = () => { const a = obj(obj(st.salud).guardianAlertas); return Object.keys(a).map((k) => Object.assign({ clave: k }, a[k])); };

  // quién guardó el documento la última vez (lo que dice el documento o su último respaldo)
  function ultimoGuardado(doc, campo) {
    const d = memDoc(doc); let ts = 0, por = "";
    Object.keys(d).forEach((k) => { if (/Ts$/.test(k) && +d[k] > ts && (!campo || k.indexOf(campo) === 0 || k === "ts")) { ts = +d[k]; por = d[k.replace(/Ts$/, "Por")] || d.usuario || ""; } });
    if (+d.ts > ts) { ts = +d.ts; por = d.usuario || d.por || ""; }
    arr(d.respaldos).forEach((r) => { if (r && +r.ts > ts) { ts = +r.ts; por = r.por || por; } });
    return { ts, por };
  }
  // ¿lo sacaron con el «Sí» de la guardia de la v174? (un respaldo posterior a la copia que tenía la lista entera)
  function conSi(doc, campo, antes, desde) {
    const rs = arr(memDoc(doc).respaldos).filter((r) => r && +r.ts > desde);
    for (const r of rs) {
      const v = campo === "nomina" ? (arr(r.nomina).length ? r.nomina : null) : campo === "vehiculos" ? r.vehiculos : obj(r.campos)[campo];
      if (v != null && tam(v) >= antes) return r;
    }
    return null;
  }
  // ---------------------------------------------------------------- 2) las caídas
  function caidas() {
    const B = base(); if (!B) return { rojas: [], ambar: [], B: null };
    const C = cuentas(), Cb = obj(B.cuentas), rojas = [], ambar = [], h = hoy(), cuando = B.fecha === menosDias(h, 1) ? "ayer" : "el " + fCorta(B.fecha);
    LISTAS.forEach(([k, txt, dc, , grande]) => {
      const a = Cb[k], n = C[k]; if (a == null || n == null || !(n < a)) return;
      const baja = a - n, roja = grande ? n === 0 || (baja >= 3 && baja / a >= 0.05) : n === 0 || baja >= 2;
      if (!roja) return;
      const [doc, campo] = dc ? dc.split(".") : ["", ""];
      const u = doc ? ultimoGuardado(doc, campo) : { ts: 0, por: "" };
      const x = { clave: (k + "-" + B.fecha).replace(/[^\w-]/g, "_"), lista: k, doc, campo, antes: a, ahora: n, base: B.fecha, baseTs: B.ts || 0,
        texto: `Se borraron ${fN(baja)} ${txt} entre ${cuando} y hoy (quedan ${fN(n)} de ${fN(a)}${u.ts ? `; la última vez guardó ${u.por || "?"} el ${fH(u.ts)}` : ""})` };
      const r = doc && conSi(doc, campo === "nomina" ? "nomina" : campo, a, B.ts || 0);
      if (r) { x.texto = `Se sacaron ${fN(baja)} ${txt} con el «Sí» de ${r.por || "?"} (${fH(r.ts)}); quedan ${fN(n)} de ${fN(a)}`; ambar.push(x); } else rojas.push(x);
    });
    // un campo de un documento que tenía datos y ahora está vacío o no está
    const Fb = obj(B.campos);
    DOCS.forEach((d) => {
      if (!cargadoDoc(d) || !Fb[d]) return; const now = camposDe(memDoc(d));
      Object.keys(Fb[d]).forEach((c) => {
        if (CAMPO_LISTA[d + "." + c]) return; const a = +Fb[d][c] || 0, n = now[c] || 0;
        if (a > 0 && n === 0) {
          const u = ultimoGuardado(d, c);
          const x = { clave: (d + "_" + c + "-" + B.fecha).replace(/[^\w-]/g, "_"), lista: "", doc: d, campo: c, antes: a, ahora: 0, base: B.fecha, baseTs: B.ts || 0, texto: `«${NOMBRE[d] || d}» perdió «${c}» (tenía ${fN(a)} dato${a === 1 ? "" : "s"} ${cuando}, hoy no tiene nada${u.ts ? "; la última vez guardó " + (u.por || "?") + " el " + fH(u.ts) : ""})` };
          (conSi(d, c, a, B.ts || 0) ? ambar : rojas).push(x);
        }
      });
    });
    return { rojas, ambar, B };
  }
  // las alertas abiertas = las guardadas sin resolver + las que se ven ahora
  function abiertas() {
    const l = alertasGuardadas().filter((a) => a.estado === "abierta"), cl = l.map((a) => a.clave);
    st.vivas.forEach((v) => { if (cl.indexOf(v.clave) < 0) l.push(v); });
    return l.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }
  async function registrar(x) {   // una vez por incidente (entre todos los aparatos)
    const ref = db().collection("configEquipo").doc("salud");
    let nueva = false;
    try {
      await db().runTransaction(async (tx) => {
        const d = await tx.get(ref), a = obj(obj(d && d.exists ? d.data() : {}).guardianAlertas)[x.clave];
        if (a) return;
        nueva = true;
        tx.set(ref, { guardianAlertas: { [x.clave]: { estado: "abierta", ts: Date.now(), por: yoEmail(), texto: x.texto, lista: x.lista, doc: x.doc, campo: x.campo, antes: x.antes, ahora: x.ahora, base: x.base, baseTs: x.baseTs } } }, { merge: true });
      });
    } catch (e) { return false; }
    if (!nueva) return false;
    (st.salud = st.salud || {}).guardianAlertas = Object.assign({}, obj(st.salud.guardianAlertas), { [x.clave]: Object.assign({ estado: "abierta", ts: Date.now() }, x) });
    const adm = intentar(() => arr(window.PERMISOS.lista()).filter((u) => u && u.rol === "admin" && u.activo !== false && !u.pendiente && u.email).map((u) => String(u.email).toLowerCase()), []);
    const para = [...new Set(adm.length ? adm : esAdmin() ? [yoEmail().toLowerCase()] : [])];
    for (const em of para) { try { window.__pushAvisos && await window.__pushAvisos.dejarAviso({ email: em, titulo: "🛡 Se borraron datos", cuerpo: x.texto.slice(0, 260) + ". Tocá para ver qué cambió y volver a como estaba.", tipo: "guardian", tag: "ema-guardian-" + x.clave, ref: x.clave }); } catch (e) { } }
    try { window.fbAuditar && window.fbAuditar("guardian_alerta", x.texto.slice(0, 400), { clave: x.clave, doc: x.doc, campo: x.campo, antes: x.antes, ahora: x.ahora, base: x.base }); } catch (e) { }
    return true;
  }
  async function marcarAlerta(clave, estado, extra) {
    const v = Object.assign({ estado, [estado + "Ts"]: Date.now(), [estado + "Por"]: yoEmail() }, extra || {});
    try { await db().collection("configEquipo").doc("salud").set({ guardianAlertas: { [clave]: v } }, { merge: true }); } catch (e) { }
    const g = obj(obj(st.salud).guardianAlertas); if (g[clave]) Object.assign(g[clave], v);
    st.vivas = st.vivas.filter((x) => x.clave !== clave);
  }
  async function revisar() {
    if (!trabaja() || !st.salud) return;
    const R = caidas(); st.vivas = R.rojas; st.ambar = R.ambar;
    for (const x of R.rojas) await registrar(x);
    // lo que volvió a estar (se recuperó) se cierra solo
    const C = cuentas();
    for (const a of alertasGuardadas().filter((a) => a.estado === "abierta")) {
      const n = a.lista ? C[a.lista] : a.doc && cargadoDoc(a.doc) ? camposDe(memDoc(a.doc))[a.campo] || 0 : null;
      if (n != null && n >= (+a.antes || 0)) await marcarAlerta(a.clave, "resuelta", { como: "volvió a estar" });
    }
  }

  // ---------------------------------------------------------------- 1) la copia de todos los días
  const KL = "ema.guardian.copia";
  const listoParaCopiar = () => cargadoDoc("personal") && cargadoDoc("precios") && cargadoDoc("baremo");
  async function tomarTurno(f, forzar) {
    const ref = db().collection("configEquipo").doc("salud");
    try {
      return await db().runTransaction(async (tx) => {
        const d = await tx.get(ref), x = obj(obj(obj(d && d.exists ? d.data() : {}).guardian)[f]);
        if (!forzar && (x.estado === "hecho" || (x.estado === "haciendo" && Date.now() - (+x.ts || 0) < 10 * 6e4))) return false;
        tx.set(ref, { guardian: { [f]: { estado: "haciendo", por: yoEmail(), ts: Date.now() } } }, { merge: true });
        return true;
      });
    } catch (e) { return false; }
  }
  async function copiar(forzar) {
    if (!trabaja() || !listoParaCopiar() || st.copiando) return null;
    const f = hoy();
    if (!forzar && intentar(() => localStorage.getItem(KL), "") === f) return null;
    st.copiando = true;
    try {
      if (!(await tomarTurno(f, forzar))) { try { localStorage.setItem(KL, f); } catch (e) { } return { turno: false }; }
      const docs = {}, tamD = {}, falto = [];
      for (const d of DOCS) {
        try { const s = await db().collection("configEquipo").doc(d).get(); if (!s.exists) continue; const x = Object.assign({}, s.data() || {}); delete x.respaldos; docs[d] = x; tamD[d] = tamJ(x); }
        catch (e) { falto.push(d); }
      }
      const C = cuentas(), campos = {}; Object.keys(docs).forEach((d) => { campos[d] = camposDe(docs[d]); });
      const id = "cfg-" + f, main = { tipo: "respaldoCfg", fecha: f, ts: Date.now(), por: yoEmail(), docs: {}, tam: tamD, cuentas: C, partes: [], falto, version: intentar(() => document.querySelector('meta[name="ema-version"]').content, "") };
      const aparte = {}; let total = 0;
      Object.keys(docs).sort((a, b) => tamD[a] - tamD[b]).forEach((d) => { if (tamD[d] > 300000 || total + tamD[d] > 700000) aparte[d] = docs[d]; else { main.docs[d] = docs[d]; total += tamD[d]; } });
      main.partes = Object.keys(aparte);
      const ids = [id];
      for (const d of main.partes) { const pid = id + "-" + d; await db().collection("adjuntos").doc(pid).set({ tipo: "respaldoCfgParte", fecha: f, ts: main.ts, por: main.por, doc: d, datos: aparte[d], tam: tamD[d] }); ids.push(pid); }
      await db().collection("adjuntos").doc(id).set(main);
      const quien = {}; DOCS.forEach((d) => { if (docs[d]) { const u = ultimoGuardado(d); quien[d] = { ts: u.ts, por: u.por }; } });
      const ent = { estado: "hecho", ts: main.ts, por: main.por, ids, tam: tamD, cuentas: C, campos, quien };
      await db().collection("configEquipo").doc("salud").set({ guardian: { [f]: ent } }, { merge: true });
      (st.salud = st.salud || {}).guardian = Object.assign({}, obj(st.salud.guardian), { [f]: ent });
      try { localStorage.setItem(KL, f); } catch (e) { }
      try { window.fbAuditar && window.fbAuditar("guardian_copia", `Copia del día ${f}: ${Object.keys(docs).join(", ")} (${fN(Math.round(Object.values(tamD).reduce((a, b) => a + b, 0) / 1024))} KB)`, { fecha: f, ids, cuentas: C }); } catch (e) { }
      return { turno: true, ids, tam: tamD };
    } catch (e) { console.warn("[guardián] copia", e); return { error: String((e && (e.code || e.message)) || e) }; }
    finally { st.copiando = false; }
  }
  async function leerCopia(f) {   // la copia completa de un día (con sus partes)
    const s = await db().collection("adjuntos").doc("cfg-" + f).get(); if (!s.exists) return null;
    const m = s.data() || {}, docs = Object.assign({}, obj(m.docs));
    for (const d of arr(m.partes)) { try { const p = await db().collection("adjuntos").doc("cfg-" + f + "-" + d).get(); if (p.exists) docs[d] = obj(p.data().datos); } catch (e) { } }
    return { fecha: f, ts: m.ts, por: m.por, docs, cuentas: obj(m.cuentas) };
  }

  // ---------------------------------------------------------------- «Ver qué cambió» y «Volver a como estaba»
  const claveItem = (x) => (x && typeof x == "object" ? String(x.id || x.codigo || nk(x.nombre || x.label || x.persona || x.tarea || "") || JSON.stringify(x)) : String(x));
  const etqItem = (x) => (x && typeof x == "object" ? String(x.nombre || x.label || x.persona || x.tarea || x.id || x.codigo || JSON.stringify(x).slice(0, 50)) + (x.patente ? " · " + x.patente : "") + (x.legajo ? " · legajo " + x.legajo : "") : String(x));
  const corto = (v) => { if (v == null || v === "") return "—"; if (typeof v == "object") { const j = JSON.stringify(v); return j.length > 90 ? j.slice(0, 88) + "…" : j; } return String(v); };
  // fuente = {doc: datos} (parcial = solo los campos que trae, p. ej. un respaldo de la v174)
  function diferencias(fuente, parcial) {
    const it = [];
    Object.keys(obj(fuente)).forEach((d) => {
      if (!cargadoDoc(d) && RESTAURABLES.indexOf(d) >= 0) return;
      const src = obj(fuente[d]), cur = d === "alias" || d === "guias" || d === "reinicios" ? null : memDoc(d);
      if (!cur) return;
      Object.keys(src).forEach((c) => {
        if (VOL.test(c)) return;
        const a = src[c], b = cur[c], id0 = d + "|" + c;
        if (JSON.stringify(a) === JSON.stringify(b)) return;
        if (Array.isArray(a) && (Array.isArray(b) || b == null)) {
          const bb = arr(b), mb = {}; bb.forEach((x) => { mb[claveItem(x)] = x; }); const ma = {};
          a.forEach((x) => { const k = claveItem(x); ma[k] = 1; if (!(k in mb)) it.push({ id: id0 + "|q|" + k, doc: d, campo: c, tipo: "quitado", forma: "lista", key: k, et: etqItem(x), antes: x }); else if (JSON.stringify(mb[k]) !== JSON.stringify(x)) it.push({ id: id0 + "|c|" + k, doc: d, campo: c, tipo: "cambiado", forma: "lista", key: k, et: etqItem(x), antes: x, ahora: mb[k] }); });
          bb.forEach((x) => { const k = claveItem(x); if (!(k in ma)) it.push({ id: id0 + "|a|" + k, doc: d, campo: c, tipo: "agregado", forma: "lista", key: k, et: etqItem(x), ahora: x }); });
        } else if (a && typeof a == "object" && (b == null || (typeof b == "object" && !Array.isArray(b)))) {
          const bb = obj(b);
          Object.keys(a).forEach((k) => { if (!(k in bb)) it.push({ id: id0 + "|q|" + k, doc: d, campo: c, tipo: "quitado", forma: "mapa", key: k, et: k, antes: a[k] }); else if (JSON.stringify(a[k]) !== JSON.stringify(bb[k])) it.push({ id: id0 + "|c|" + k, doc: d, campo: c, tipo: "cambiado", forma: "mapa", key: k, et: k, antes: a[k], ahora: bb[k] }); });
          Object.keys(bb).forEach((k) => { if (!(k in a)) it.push({ id: id0 + "|a|" + k, doc: d, campo: c, tipo: "agregado", forma: "mapa", key: k, et: k, ahora: bb[k] }); });
        } else it.push({ id: id0 + "|v", doc: d, campo: c, tipo: b == null || b === "" ? "quitado" : "cambiado", forma: "valor", key: c, et: c, antes: a, ahora: b });
      });
      if (!parcial) Object.keys(cur).forEach((c) => { if (!VOL.test(c) && !(c in src) && tam(cur[c])) it.push({ id: d + "|" + c + "|nuevo", doc: d, campo: c, tipo: "agregado", forma: "valor", key: c, et: c, ahora: cur[c] }); });
    });
    return it;
  }
  const selPorDefecto = (it) => { const s = {}; it.forEach((x) => { if (x.tipo === "quitado" && RESTAURABLES.indexOf(x.doc) >= 0) s[x.id] = true; }); return s; };
  // arma los cambios por documento: lo de hoy + lo elegido de la copia (nunca saca lo agregado después)
  function plan(items) {
    const P = {};
    items.forEach((x) => {
      if (RESTAURABLES.indexOf(x.doc) < 0 || x.tipo === "agregado") return;
      const cur = memDoc(x.doc), p = P[x.doc] = P[x.doc] || {};
      if (!(x.campo in p)) p[x.campo] = clon(cur[x.campo]);
      if (x.forma === "lista") { const l = arr(p[x.campo]).slice(); const i = l.findIndex((y) => claveItem(y) === x.key); if (i >= 0) l[i] = clon(x.antes); else l.push(clon(x.antes)); p[x.campo] = l; }
      else if (x.forma === "mapa") { p[x.campo] = Object.assign({}, obj(p[x.campo]), { [x.key]: clon(x.antes) }); }
      else p[x.campo] = clon(x.antes);
    });
    if (P.personal && P.personal.lista && !P.personal.nomina && arr(memDoc("personal").nomina).length) { P.personal.nomina = P.personal.lista; delete P.personal.lista; }
    return P;
  }
  const filasPlan = (items) => items.filter((x) => x.tipo !== "agregado" && RESTAURABLES.indexOf(x.doc) >= 0).map((x) => ({ c: `${NOMBRE[x.doc] || x.doc} › ${x.campo}${x.forma === "valor" ? "" : ": " + x.et}`, a: x.tipo === "quitado" ? "—" : corto(x.forma === "lista" ? etqItem(x.ahora) : x.ahora), d: x.forma === "lista" ? "vuelve: " + etqItem(x.antes) : corto(x.antes) }));
  async function restaurar(items, op) {
    op = op || {};
    if (!esAdmin()) throw Object.assign(new Error("Solo Administración vuelve los datos a como estaban."), { code: "gd-rol" });
    const P = plan(items), docs = Object.keys(P);
    if (!docs.length) throw Object.assign(new Error("No hay nada elegido para volver."), { code: "gd-nada" });
    const hecho = [], ver = [], mal = [];
    for (const d of docs) {
      try {
        let p = Object.assign({}, P[d]);
        if (d === "personal" && ("nomina" in p || "vehiculos" in p || "lista" in p) && window.__psGuardia) p = await window.__psGuardia(p, { sinPreguntar: true, accion: "guardian_restaurar" });
        else if (window.__cfgGuardia) p = await window.__cfgGuardia(d, p, { sinPreguntar: true });
        await db().collection("configEquipo").doc(d).set(p, { merge: true });
        hecho.push(d);
        // se lee de vuelta de la base
        const s = await db().collection("configEquipo").doc(d).get(), x = s.exists ? s.data() || {} : {};
        const el = items.filter((y) => y.doc === d && y.tipo !== "agregado");
        const falta = el.filter((y) => y.forma === "lista" ? !arr(x[y.campo]).some((z) => claveItem(z) === y.key) : y.forma === "mapa" ? !(y.key in obj(x[y.campo])) : JSON.stringify(x[y.campo]) !== JSON.stringify(y.antes));
        if (falta.length) mal.push(`${NOMBRE[d]}: no quedó ${falta.map((y) => y.et).join(", ")}`); else ver.push(`${NOMBRE[d]}: ${el.length} dato${el.length === 1 ? "" : "s"}`);
        if (d === "personal") { window.__personalNube = Object.assign({}, obj(window.__personalNube), x); try { window.aplicarPersonalDeLaNube && window.aplicarPersonalDeLaNube(); } catch (e) { } }
        else if (d === "baremo") { window.__baremoNube = x; try { window.aplicarBaremoDeLaNube && window.aplicarBaremoDeLaNube(); } catch (e) { } }
        else if (d === "precios") { window.__preciosNube = x; try { window.aplicarPreciosDeLaNube && window.aplicarPreciosDeLaNube(); } catch (e) { } }
        else (window.__cfgDatos = window.__cfgDatos || {})[d] = x;
      } catch (e) { mal.push(`${NOMBRE[d] || d}: ${(window.__psErr && window.__psErr(e)) || (e && e.message) || e}`); }
    }
    try { window.fbAuditar && window.fbAuditar("guardian_restaurar", (`Volvió a como estaba (${op.fuente || "copia"}): ` + filasPlan(items).map((f) => f.c).join(", ")).slice(0, 480), { docs: hecho, items: items.length, fuente: op.fuente || "", porAsistente: !!op.porAsistente, verificado: !mal.length }); } catch (e) { }
    for (const a of alertasGuardadas().filter((a) => a.estado === "abierta" && hecho.indexOf(a.doc) >= 0)) await marcarAlerta(a.clave, "resuelta", { como: "volver a como estaba" });
    if (!mal.length) st.vivas = st.vivas.filter((v) => hecho.indexOf(v.doc) < 0);
    return { ok: !mal.length, hecho, ver, mal, txt: (mal.length ? "⚠ " + mal.join(" · ") + ". " : "") + (ver.length ? "✓ Leído de vuelta de la base: " + ver.join(" · ") + "." : "") };
  }
  // fuentes: copias del día (adjuntos) y los respaldos[] de cada documento (v174)
  function respaldosDe() {
    const l = [];
    RESTAURABLES.forEach((d) => arr(memDoc(d).respaldos).forEach((r, i) => {
      if (!r) return; const s = {};
      if (d === "personal") { if (r.nomina) s.nomina = r.nomina; if (r.vehiculos) s.vehiculos = r.vehiculos; }
      Object.keys(obj(r.campos)).forEach((k) => { if (k.indexOf(".") < 0) s[k] = r.campos[k]; });
      if (Object.keys(s).length) l.push({ doc: d, i, ts: +r.ts || 0, por: r.por || "", campos: Object.keys(s), fuente: { [d]: s } });
    }));
    return l.sort((a, b) => b.ts - a.ts);
  }
  async function fuenteDe(f) {
    if (f.tipo === "copia") { const c = await leerCopia(f.fecha); if (!c) throw new Error("No encontré la copia del " + fCorta(f.fecha) + "."); return { docs: c.docs, parcial: false, txt: "la copia del " + fCorta(f.fecha) + (c.ts ? " (" + fH(c.ts).split(" a las ")[1] + " h)" : "") };
    }
    const r = respaldosDe().find((x) => x.doc === f.doc && x.ts === +f.ts); if (!r) throw new Error("No encontré esa copia de guardado.");
    return { docs: r.fuente, parcial: true, txt: `la copia de «${NOMBRE[r.doc]}» del ${fH(r.ts)} (antes de un guardado de ${r.por || "?"})` };
  }
  // la mejor fuente para una alerta: la copia del día de antes de la caída
  async function fuenteAlerta(a) {
    const l = entradas().filter((e) => e.fecha <= (a.base || hoy())); const e = l.length ? l[l.length - 1] : null;
    if (e) return { tipo: "copia", fecha: e.fecha };
    const r = respaldosDe().find((x) => x.doc === a.doc && x.campos.indexOf(a.campo) >= 0); return r ? { tipo: "resp", doc: r.doc, ts: r.ts } : null;
  }

  // ---------------------------------------------------------------- 5) auditoría de cada guardado de configEquipo (con cuentas)
  const AUD_DOCS = /^(personal|precios|baremo|cuadrillas|ubicacion|alias|guias|reinicios)$/;
  function despuesDe(cur, data, modo) {
    const o = modo === "set" ? {} : Object.assign({}, cur);
    Object.keys(obj(data)).forEach((k) => {
      const v = data[k], top = k.split(".")[0], esDel = v && typeof v == "object" && (v.__op === "del" || /delete/i.test(String(v._methodName || (v._delegate && v._delegate._methodName) || "")));
      if (k.indexOf(".") >= 0) { const c = clon(obj(o[top])) || {}; const p = k.split(".").slice(1); let z = c; for (let i = 0; i < p.length - 1; i++) z = z[p[i]] = obj(z[p[i]]); if (esDel) delete z[p[p.length - 1]]; else z[p[p.length - 1]] = v; o[top] = c; }
      else if (esDel) delete o[k]; else if (modo === "merge" && v && typeof v == "object" && !Array.isArray(v) && o[k] && typeof o[k] == "object" && !Array.isArray(o[k])) o[k] = Object.assign({}, o[k], v); else o[k] = v;
    });
    return o;
  }
  function auditarGuardado(doc, data, modo) {
    try {
      const ks = Object.keys(obj(data)).map((k) => k.split(".")[0]).filter((k, i, a) => a.indexOf(k) === i && !VOL.test(k));
      if (!ks.length) return null;
      if (doc === "personal" && ks.some((k) => /^(nomina|vehiculos|lista)$/.test(k))) return null;   // ya lo anota la v174 (personal_guardar)
      const cur = memDoc(doc), des = despuesDe(cur, data, modo), A = {}, D = {};
      ks.forEach((k) => { A[k] = tam(cur[k]); D[k] = tam(des[k]); });
      if (modo === "set") Object.keys(cur).forEach((k) => { if (!VOL.test(k) && !(k in des) && tam(cur[k])) { A[k] = tam(cur[k]); D[k] = 0; } });
      return () => { try { window.fbAuditar && window.fbAuditar("config_guardar", `${doc}: ` + Object.keys(A).map((k) => `${k} ${A[k]} → ${D[k]}`).join(" · ").slice(0, 400), { doc, antes: A, despues: D, cuentas: true }); } catch (e) { } };
    } catch (e) { return null; }
  }
  (function envolverDb() {
    let f; try { f = firebase.firestore(); } catch (e) { return; }
    if (!f || f.__gd || typeof f.collection != "function") return;
    const c0 = f.collection;
    f.collection = function (p) {
      const c = c0.apply(this, arguments);
      if (p !== "configEquipo" || !c || typeof c.doc != "function" || c.__gd) return c;
      const d0 = c.doc;
      c.doc = function (id) {
        const r = d0.apply(this, arguments);
        if (!r || r.__gd || !AUD_DOCS.test(String(id || ""))) return r;
        const s0 = r.set, u0 = r.update;
        if (typeof s0 == "function") r.set = function (data, opt) { const a = auditarGuardado(id, data, opt && opt.merge ? "merge" : "set"); const pr = s0.apply(this, arguments); if (a && pr && pr.then) pr.then(a, () => { }); return pr; };
        if (typeof u0 == "function") r.update = function (data) { const a = auditarGuardado(id, data, "update"); const pr = u0.apply(this, arguments); if (a && pr && pr.then) pr.then(a, () => { }); return pr; };
        r.__gd = 1; return r;
      };
      c.__gd = 1; return c;
    };
    f.__gd = 1;
  })();

  // ---------------------------------------------------------------- lo que se muestra afuera (solo Administración)
  function supHallazgos() {
    if (!esAdmin()) return [];
    const l = abiertas().map((a) => ({ g: "rojo", cat: "Datos", t: "🛡 " + a.texto, s: "Tocá para ver qué cambió y volver a como estaba (Guardián de datos).", ir: { tipo: "guardian", clave: a.clave }, btn: "Ver" }));
    st.ambar.forEach((a) => l.push({ g: "ambar", cat: "Datos", t: "🛡 " + a.texto, s: "Fue con el «Sí» de la guardia. Si no correspondía, se vuelve desde el Guardián de datos.", ir: { tipo: "guardian" } }));
    return l;
  }
  function atender() {
    if (!esAdmin()) return [];
    const l = abiertas(); if (!l.length) return [];
    return [{ ir: "guardian", ico: "alerta", cls: "rj", t: "🛡 Se borraron datos", s: l.slice(0, 2).map((a) => a.texto.slice(0, 90)).join(" · "), n: l.length }];
  }
  function resumenRojos() {
    if (!esAdmin()) return "";
    const l = abiertas(); if (!l.length) return "";
    return "\n[Guardián de datos (sin IA): " + l.length + " alerta(s) ROJA(S) de datos borrados] " + l.map((a) => a.texto).join(" | ").slice(0, 1500) + " → se vuelven desde el Guardián de datos o con proponer_restaurar_datos.";
  }
  function estadoListas() {
    const C = cuentas(), B = base(), S7 = deHace(7);
    return LISTAS.map(([k, txt]) => ({ k, txt, hoy: C[k], ayer: B ? obj(B.cuentas)[k] : undefined, siete: S7 ? obj(S7.cuentas)[k] : undefined })).filter((x) => x.hoy != null || x.ayer != null);
  }
  function paraIa() {
    const B = base();
    return {
      alertas: abiertas().map((a) => ({ clave: a.clave, texto: a.texto, desde: a.base })), sacadoConSi: st.ambar.map((a) => a.texto),
      listas: estadoListas().map((x) => ({ lista: x.txt, hoy: x.hoy, copiaAnterior: x.ayer, hace7dias: x.siete })),
      copiaAnterior: B ? { fecha: B.fecha, hora: fH(B.ts), por: B.por } : null,
      copias: entradas().slice(-30).reverse().map((e) => ({ fecha: e.fecha, por: e.por, personas: obj(e.cuentas).nomina, vehiculos: obj(e.cuentas).vehiculos })),
      ultimosGuardados: respaldosDe().slice(0, 15).map((r) => ({ que: NOMBRE[r.doc], cuando: fH(r.ts), quien: r.por, campos: r.campos })),
      ultimoRespaldoCompleto: obj(obj(st.salud).ultimoRespaldo).ts ? fH(st.salud.ultimoRespaldo.ts) + " por " + (st.salud.ultimoRespaldo.usuario || "?") : "nunca"
    };
  }

  // ---------------------------------------------------------------- 3) la hoja «🛡 Guardián de datos»
  const fila3 = (v) => (v == null ? "—" : fN(v));
  function hojaHtml() {
    const M = st.modo;
    const cab = `<div class="v7-asa"></div><div class="v7-cab"><div><h3>🛡 Guardián de datos</h3><small>Copia de todos los días y aviso si se borra algo. Nada se cambia sin «Sí».</small></div><button type="button" class="v7-x" data-gd="x" aria-label="Cerrar">✕</button></div>`;
    if (M) return cab + diffHtml(M);
    const al = abiertas(), B = base();
    let h = "";
    h += al.length ? al.map((a) => `<div class="gd-al rojo"><b>⚠ ${esc(a.texto)}</b><div class="gd-acc"><button type="button" class="btn-ghost" data-gd="ver:${esc(a.clave)}">Ver qué cambió</button><button type="button" class="btn-primary" data-gd="volver:${esc(a.clave)}">Volver a como estaba</button><button type="button" class="btn-ghost" data-gd="ok:${esc(a.clave)}">Está bien así</button></div>${st.conf === "ok:" + a.clave ? `<div class="gd-conf" role="status">¿Seguro que el cambio fue a propósito? La alerta se cierra (la copia sigue guardada).<div class="gd-acc"><button type="button" class="btn-primary" data-gd="oksi:${esc(a.clave)}">Sí, fue a propósito</button><button type="button" class="btn-ghost" data-gd="no">Cancelar</button></div></div>` : ""}</div>`).join("")
      : `<div class="gd-al ok">✅ ${B ? `Todo en orden contra la copia del ${esc(fCorta(B.fecha))}.` : "Todavía no hay copia de un día anterior: la primera se guarda hoy y desde mañana se compara."}</div>`;
    st.ambar.forEach((a) => { h += `<div class="gd-al am">🟡 ${esc(a.texto)} <button type="button" class="btn-ghost gd-chico" data-gd="verA:${esc(a.clave)}">Ver</button></div>`; });
    h += `<h4 class="gd-h">Cómo está cada lista</h4><div class="gd-tab" role="table"><div class="gd-tr gd-th" role="row"><span>Lista</span><span>Hoy</span><span>${B ? esc(fCorta(B.fecha)) : "Copia"}</span><span>Hace 7 días</span></div>` +
      estadoListas().map((x) => `<div class="gd-tr${x.ayer != null && x.hoy != null && x.hoy < x.ayer ? " baja" : ""}" role="row"><span>${esc(x.txt[0].toUpperCase() + x.txt.slice(1))}</span><span>${fila3(x.hoy)}</span><span>${fila3(x.ayer)}</span><span>${fila3(x.siete)}</span></div>`).join("") + `</div>`;
    const R = respaldosDe().slice(0, 12), au = arr(st.aud);
    h += `<h4 class="gd-h">Últimos guardados</h4>` + (R.length || au.length ? `<ul class="gd-ul">${R.map((r) => `<li><b>${esc(NOMBRE[r.doc])}</b> · ${esc(fH(r.ts))} · ${esc(r.por || "?")} <small>(${esc(r.campos.join(", "))})</small> <button type="button" class="btn-ghost gd-chico" data-gd="resp:${esc(r.doc)}:${r.ts}">Ver</button></li>`).join("")}${au.slice(0, 15).map((a) => `<li><small>${esc(fH(a.ts))} · ${esc(a.usuario || "?")}</small> ${esc(String(a.detalle || a.accion).slice(0, 140))}</li>`).join("")}</ul>` : '<div class="hint">Sin guardados anotados todavía.</div>');
    const E = entradas().slice().reverse();
    h += `<h4 class="gd-h">Copias de todos los días (${E.length})</h4>` + (E.length ? `<ul class="gd-ul">${E.slice(0, 30).map((e) => `<li><b>${esc(fCorta(e.fecha))}</b> · ${esc(fH(e.ts).split(" a las ")[1] || "")} · ${esc(e.por || "?")} <small>${fila3(obj(e.cuentas).nomina)} personas · ${fila3(obj(e.cuentas).vehiculos)} vehículos · ${fN(Math.round(Object.values(obj(e.tam)).reduce((a, b) => a + (+b || 0), 0) / 1024))} KB</small> <button type="button" class="btn-ghost gd-chico" data-gd="copia:${esc(e.fecha)}">Ver qué cambió</button></li>`).join("")}</ul>` : '<div class="hint">Todavía no hay copias.</div>') +
      `<div class="gd-acc"><button type="button" class="btn-ghost" data-gd="copiar">💾 Guardar una copia ahora</button>${E.length > 60 ? `<button type="button" class="btn-ghost" data-gd="viejas">🗑 Borrar las copias de más de 60 (${E.length - 60})</button>` : ""}</div>` +
      (st.conf === "viejas" ? `<div class="gd-conf" role="status">Se borran las ${E.length - 60} copias más viejas (quedan las últimas 60). ¿Seguro?<div class="gd-acc"><button type="button" class="btn-primary gd-peligro" data-gd="viejassi">Sí, borrarlas</button><button type="button" class="btn-ghost" data-gd="no">Cancelar</button></div></div>` : "");
    const ur = obj(obj(st.salud).ultimoRespaldo);
    h += `<h4 class="gd-h">Respaldo completo (archivo)</h4><div class="hint">Último bajado: ${ur.ts ? esc(fH(ur.ts)) + " por " + esc(ur.usuario || "?") : "nunca"}. Guardalo fuera de la compu (Drive o mail).</div><div class="gd-acc"><button type="button" class="btn-primary" data-gd="respaldo">⬇ Descargar respaldo completo ahora</button></div>`;
    return cab + h + `<div class="v7-msg" id="gdMsg" role="status">${esc(st.msg)}</div>`;
  }
  const TIPO_TXT = { quitado: "Se borró", cambiado: "Cambió", agregado: "Se agregó después (queda)" };
  function diffHtml(M) {
    if (M.cargando) return `<p>Buscando ${esc(M.txt || "la copia")}…</p><div class="v7-msg" id="gdMsg" role="status">${esc(st.msg)}</div>`;
    const it = M.items || [], nSel = it.filter((x) => M.sel[x.id]).length;
    const grupos = {}; it.forEach((x) => { const g = x.doc + " › " + x.campo; (grupos[g] = grupos[g] || []).push(x); });
    const valTxt = (x, v) => (x.forma === "lista" ? etqItem(v) : corto(v));
    let h = `<div class="gd-al">Comparo <b>${esc(M.txt)}</b> con lo que hay hoy. ${it.length ? "" : "<b>No cambió nada.</b>"}</div>`;
    Object.keys(grupos).forEach((g) => {
      const l = grupos[g], d = l[0].doc;
      h += `<h4 class="gd-h">${esc(NOMBRE[d] || d)} › ${esc(l[0].campo)} <small>(${l.filter((x) => x.tipo === "quitado").length} borrado/s, ${l.filter((x) => x.tipo === "cambiado").length} cambiado/s, ${l.filter((x) => x.tipo === "agregado").length} nuevo/s)</small></h4>`;
      h += l.slice(0, 120).map((x) => { const pu = esAdmin() && x.tipo !== "agregado" && RESTAURABLES.indexOf(x.doc) >= 0; return `<label class="gd-fila ${x.tipo}">${pu ? `<input type="checkbox" data-gdsel="${esc(x.id)}" ${M.sel[x.id] ? "checked" : ""}>` : "<span class='gd-nada'></span>"}<span><small>${esc(TIPO_TXT[x.tipo])}</small> <b>${esc(x.et)}</b>${x.tipo === "cambiado" ? `<br><s>${esc(valTxt(x, x.ahora))}</s> → era <b>${esc(valTxt(x, x.antes))}</b>` : x.forma === "valor" && x.tipo === "quitado" ? `<br>era <b>${esc(corto(x.antes))}</b>` : ""}</span></label>`; }).join("") + (l.length > 120 ? `<div class="hint">… y ${l.length - 120} más.</div>` : "");
    });
    const acc = esAdmin() && it.some((x) => x.tipo !== "agregado" && RESTAURABLES.indexOf(x.doc) >= 0);
    return h + `<div class="v7-msg" id="gdMsg" role="status">${esc(st.msg)}</div><div class="v7-acc"><button type="button" class="btn-ghost" data-gd="atras">‹ Volver</button>${acc ? `<button type="button" class="btn-primary" data-gd="si" ${nSel && !st.ocupado ? "" : "disabled"}>Sí, volver a como estaba (${nSel})</button>` : ""}</div>` + (acc ? `<div class="hint">Lo borrado viene tildado; lo que cambió, no (tildalo si querés el valor de antes). Lo agregado después se queda. Antes de guardar queda una copia de cómo está hoy y después se lee de vuelta de la base.</div>` : "");
  }
  function pintar() { const v = $("gdOv"); if (!v) return; const c = v.querySelector(".v7-caja"); const top = c.scrollTop; c.innerHTML = hojaHtml(); c.scrollTop = top; }
  async function abrir(op) {
    op = op || {};
    if (!esAdmin()) return false;
    try { typeof cerrarMenuLateral == "function" && cerrarMenuLateral(); } catch (e) { }
    let v = $("gdOv"); v && v.remove();
    v = document.createElement("div"); v.id = "gdOv"; v.className = "v7-ov v7-arriba"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true"); v.setAttribute("aria-label", "Guardián de datos");
    v.innerHTML = '<div class="v7-caja gd-caja"></div>'; document.body.appendChild(v);
    st.abierta = true; st.modo = null; st.msg = ""; st.conf = ""; pintar();
    await leerSalud(true); await revisar().catch(() => { }); pintar();
    if (op.clave) { const a = abiertas().find((x) => x.clave === op.clave); if (a) await verAlerta(a); }
    try { if (window.fbAuditoriaLeer) { const l = await window.fbAuditoriaLeer(300); st.aud = arr(l).filter((a) => /^(config_guardar|personal_guardar|personal_asistente|guardian_|asistente_editar|respaldo)/.test(String(a.accion || "")) && (a.accion !== "asistente_editar" || a.coleccion === "configEquipo")); pintar(); } } catch (e) { }
    return true;
  }
  function cerrar() { const v = $("gdOv"); v && v.remove(); st.abierta = false; st.modo = null; }
  async function verFuente(f, txt) {
    st.modo = { cargando: true, txt, f, sel: {} }; st.msg = ""; pintar();
    try { const F = await fuenteDe(f), it = diferencias(F.docs, F.parcial); st.modo = { f, txt: F.txt, items: it, sel: selPorDefecto(it) }; }
    catch (e) { st.modo = null; st.msg = "⚠ " + ((e && e.message) || e); }
    pintar();
  }
  async function verAlerta(a) {
    const f = await fuenteAlerta(a); if (!f) { st.msg = "⚠ No hay ninguna copia de antes para comparar."; return pintar(); }
    await verFuente(f, "");
    if (st.modo && st.modo.items && a.doc) { const it = st.modo.items, sel = {}; it.forEach((x) => { if (x.tipo === "quitado" && x.doc === a.doc && (!a.campo || x.campo === a.campo || (a.campo === "nomina" && x.campo === "lista"))) sel[x.id] = true; }); if (Object.keys(sel).length) st.modo.sel = sel; pintar(); }
  }
  document.addEventListener("change", (e) => { const t = e.target; if (t && t.dataset && t.dataset.gdsel != null && st.modo) { st.modo.sel[t.dataset.gdsel] = t.checked; pintar(); } });
  document.addEventListener("click", async (e) => {
    const ov = $("gdOv"); if (ov && e.target === ov) return cerrar();
    const b = e.target && e.target.closest && e.target.closest("[data-gd]"); if (!b || !ov || !ov.contains(b)) return;
    const a = b.dataset.gd, k = a.split(":")[0], x = a.slice(k.length + 1);
    e.preventDefault();
    if (k === "x") return cerrar();
    if (k === "no") { st.conf = ""; return pintar(); }
    if (k === "atras") { st.modo = null; st.msg = ""; return pintar(); }
    if (k === "ver" || k === "volver") { const al = abiertas().find((q) => q.clave === x); if (al) await verAlerta(al); return; }
    if (k === "verA") { const al = st.ambar.find((q) => q.clave === x); if (al) await verAlerta(al); return; }
    if (k === "ok") { st.conf = "ok:" + x; return pintar(); }
    if (k === "oksi") { await marcarAlerta(x, "aceptada"); try { window.fbAuditar && window.fbAuditar("guardian_aceptada", "Alerta cerrada: fue a propósito · " + x, { clave: x }); } catch (er) { } st.conf = ""; st.msg = "✓ Listo: la alerta quedó cerrada."; return pintar(); }
    if (k === "copia") return verFuente({ tipo: "copia", fecha: x }, "la copia del " + fCorta(x));
    if (k === "resp") { const [d, ts] = x.split(":"); return verFuente({ tipo: "resp", doc: d, ts: +ts }, "una copia de guardado"); }
    if (k === "si" && st.modo && !st.ocupado) {
      const items = (st.modo.items || []).filter((q) => st.modo.sel[q.id]); if (!items.length) return;
      st.ocupado = true; st.msg = "Guardando…"; pintar();
      try { const r = await restaurar(items, { fuente: st.modo.txt }); st.msg = r.txt; if (r.ok) st.modo = null; }
      catch (er) { st.msg = "⚠ " + ((er && er.message) || er); }
      st.ocupado = false; return pintar();
    }
    if (k === "copiar") { st.msg = "Guardando la copia…"; pintar(); const r = await copiar(true); st.msg = r && r.turno ? "✓ Copia guardada." : "⚠ No se pudo guardar la copia" + (r && r.error ? " (" + r.error + ")" : " (todavía no llegaron los datos de la base o no hay permiso)") + "."; await leerSalud(true); return pintar(); }
    if (k === "viejas") { st.conf = "viejas"; return pintar(); }
    if (k === "viejassi") { st.conf = ""; const r = await borrarViejas(); st.msg = r; return pintar(); }
    if (k === "respaldo") {
      try { if (typeof window.exportarRespaldoCompleto == "function") { await window.exportarRespaldoCompleto(); st.msg = "✓ Se bajó el respaldo completo (mirá en Descargas)."; await leerSalud(true); } else st.msg = "⚠ El respaldo completo no está disponible en esta pantalla."; } catch (er) { st.msg = "⚠ No se pudo bajar el respaldo."; }
      return pintar();
    }
  });
  async function borrarViejas() {
    if (!esAdmin()) return "Solo Administración.";
    const E = entradas(), viejas = E.slice(0, Math.max(0, E.length - 60)); let n = 0;
    const FV = intentar(() => firebase.firestore.FieldValue, null);
    for (const e of viejas) {
      try { for (const id of arr(e.ids).length ? e.ids : ["cfg-" + e.fecha]) await db().collection("adjuntos").doc(id).delete(); if (FV) await db().collection("configEquipo").doc("salud").update({ ["guardian." + e.fecha]: FV.delete() }); n++; } catch (er) { }
    }
    try { window.fbAuditar && window.fbAuditar("guardian_borrar_viejas", `Borró ${n} copias viejas del guardián`, { n }); } catch (er) { }
    await leerSalud(true);
    return `✓ Se borraron ${n} copias viejas.`;
  }

  // ---------------------------------------------------------------- menú (solo Administración)
  function menu() {
    let m = $("menuGuardian");
    if (!esAdmin()) { m && m.remove(); return; }
    const ini = $("menuParaResolver") || document.querySelector('#menuLateral [data-vista="inicio"]'); if (!ini) return;
    if (!m) { m = document.createElement("button"); m.type = "button"; m.id = "menuGuardian"; m.className = (document.querySelector('#menuLateral [data-vista="inicio"]') || ini).className.replace(/\b(activo|active|on)\b/g, ""); ini.insertAdjacentElement("afterend", m); m.addEventListener("click", () => abrir()); }
    const n = abiertas().length, h = `<span class="nav-ico">🛡</span><span class="nav-txt">Guardián de datos${n ? ` <b class="gd-bd">${n}</b>` : ""}</span>`;
    if (m.__h !== h) { m.innerHTML = h; m.__h = h; }
  }

  // ---------------------------------------------------------------- el reloj
  let arrancado = 0;
  async function tic() {
    if (!window.__fbUser || !trabaja()) { menu(); return; }
    if (!arrancado) return;
    if (Date.now() - arrancado < (window.__gdEspera != null ? +window.__gdEspera : 20000)) return;
    await leerSalud();
    if (!document.hidden) await copiar(false);
    await revisar();
    menu();
    if (st.abierta && !st.modo) pintar();
  }
  const empezar = () => { if (!arrancado) arrancado = Date.now(); setTimeout(() => { tic().catch(() => { }); }, (window.__gdEspera != null ? +window.__gdEspera : 20000) + 50); };
  document.addEventListener("permisos-listos", empezar);
  if (intentar(() => window.PERMISOS.listo(), false)) empezar();
  setInterval(() => { tic().catch(() => { }); }, 60000);
  setInterval(menu, 2500);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) setTimeout(() => { tic().catch(() => { }); }, 1500); });

  window.__guardian = { cuentas, camposMem, caidas, abiertas, revisar, copiar, leerCopia, leerSalud, diferencias, plan, filasPlan, restaurar, respaldosDe, fuenteDe, fuenteAlerta, supHallazgos, atender, resumenRojos, estadoListas, paraIa, abrir, cerrar, esAdmin, marcarAlerta, base, entradas, tic, LISTAS, DOCS, RESTAURABLES, NOMBRE, selPorDefecto, auditarGuardado, estado: () => ({ salud: st.salud, vivas: st.vivas.slice(), ambar: st.ambar.slice(), abierta: st.abierta, modo: st.modo, msg: st.msg }) };
})();
