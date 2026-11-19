(function () {
  "use strict";
  // v181 · 📜 Registro de cambios (Ángel 19/11: «cada modificación, cada cambio —letra, color, nombre—, si se borra algo de la app,
  // tiene que quedar registrado en la app qué es lo que se hizo y quién lo hizo, en el Guardián»).
  //  1) Captura: envuelve UNA vez los caminos de escritura de Firestore compat (DocumentReference set/update/delete,
  //     CollectionReference add, WriteBatch set/update/delete/commit, Transaction set/update/delete + runTransaction). En la app
  //     real, sobre los prototipos del SDK; con la base de prueba, sobre la instancia. En el momento de escribir solo se anota
  //     (colección, id, qué se escribió, quién, la pantalla, la referencia a la ÚLTIMA foto de ese documento que ya trajeron las
  //     escuchas); el «antes → después» se arma después, cuando el celu está quieto (nunca con la cámara abierta). El «antes» sale de
  //     lo que ya está en memoria (las escuchas) o de la copia local del aparato (get source:"cache", solo en la app real): nunca una
  //     lectura de más al servidor.
  //  2) Se agrupa: lo de unos segundos va en UN documento de auditoria (accion "cambios_app"), con cada documento tocado adentro;
  //     lo de la cuadrilla (campo.* de sus órdenes, fotos) se junta por minuto. Afuera: latidos, ubicación, turnos/salud, avisos,
  //     la propia auditoría, secretos. Valores cortados (sin imágenes ni base64, textos largos cortados), lo de sueldos «[privado]»,
  //     menos de 1 MB por documento. Cuenta las escrituras del día; si se acerca al cupo, pasa a resúmenes.
  //  3) Guardián › «📜 Historial de cambios» (solo Administración): filtros, antes → después, «Volver este cambio» con «Sí»,
  //     Excel/PDF. 4) Asistente historial_cambios / proponer_revertir_cambio (bloque ia181). 5) Las alertas del Guardián llevan a
  //     los cambios que las causaron.
  if (window.__v181No) return;
  const VER = 181;
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const intentar = (f, d) => { try { const r = f(); return r === undefined ? d : r; } catch (e) { return d; } };
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, "0");
  const diaDe = (t) => { const d = new Date(t); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const fH = (t) => { if (!t) return "?"; const d = new Date(t); return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const fN = (n, dec) => intentar(() => Number(n).toLocaleString("es-AR", { maximumFractionDigits: dec == null ? 2 : dec }), String(n));
  const yo = () => intentar(() => window.PERMISOS.yo(), null) || {};
  const esAdmin = () => yo().rol === "admin" && yo().activo !== false && !yo().pendiente && !window.__v181No;

  // ---------------------------------------------------------------- qué NO se registra (ruido) y qué se resume
  const NO_COL = /^(auditoria|presencia|ubicacionVivo|pushSubs|avisosPush|secretosServidor)$/;
  const NO_DOC = { configEquipo: /^(presencia|salud|vapid)$/, adjuntos: /^cfg-/ };
  const FOTO_COL = /^(fotosObra|adjuntos|planosImg)$/;
  const SECRETO = /token|clave|contrase|password|^pass$|secret|privad|fcm|endpoint|p256dh|^auth$|apikey|api_key/i;
  const PRIVADO = /valorhora|valor_hora|sueldo|salario|jornal|valorpunto|valor_punto|valorhh|cbu|cuil|dni/i;
  const VOL = /^(ts|usuario|por|porNombre|actualizado|actualizadoPor|editadoTs|editadoPor|creado|version|respaldos|guardianCopias)$|Ts$/;
  const ESPERA = () => (window.__rcEspera != null ? +window.__rcEspera : 6000);        // silencio para cerrar un grupo
  const TOPE = () => (window.__rcTope != null ? +window.__rcTope : 30000);             // un grupo no espera más que esto
  const CUADRILLA_MS = () => (window.__rcCuadrilla != null ? +window.__rcCuadrilla : 60000);   // lo de la cuadrilla: por minuto
  const TOPE_DIA = () => (window.__rcTopeDia != null ? +window.__rcTopeDia : 400);       // escrituras de registro por día y aparato antes de pasar a resúmenes
  const MAX_VAL = 20000, MAX_PREV = 200000, MAX_DOC = 700000;

  // ---------------------------------------------------------------- de dónde sale el «antes» (lo que trajeron las escuchas)
  const QREG = new Map();   // colección → Map(clave de la escucha → última foto de la consulta)
  const DREG = new Map();   // "col/id" → última foto del documento
  const IDX = new WeakMap();
  const colDeQuery = (q) => {
    try { const p = q._delegate && q._delegate._query && q._delegate._query.path; if (p && p.segments) return p.segments.join("/"); } catch (e) { }
    try { if (q.path) return String(q.path); } catch (e) { }
    try { if (q.id) return String(q.id); } catch (e) { }
    return "";
  };
  function anotarSnap(col, clave, snap) { try { let m = QREG.get(col); if (!m) QREG.set(col, (m = new Map())); m.set(clave, { s: snap, t: Date.now() }); } catch (e) { } }
  const GK = new Map();   // lo que trajo un get() suelto: las últimas 6 por colección
  function anotarGet(col, snap) { try { if (!snap || !snap.docs) return; let l = GK.get(col); if (!l) GK.set(col, (l = [])); const k = {}; l.push(k); anotarSnap(col, k, snap); if (l.length > 6) soltarSnap(col, l.shift()); } catch (e) { } }
  function soltarSnap(col, clave) { const m = QREG.get(col); m && m.delete(clave); }
  function buscarEn(snap, id) {
    let ix = IDX.get(snap);
    if (!ix) { ix = new Map(); try { (snap.docs || []).forEach((d) => ix.set(d.id, d)); } catch (e) { } IDX.set(snap, ix); }
    return ix.get(id);
  }

  // ---------------------------------------------------------------- quién, dónde y por qué
  let ultGesto = 0, ultIa = 0, ultOnline = 0;
  window.addEventListener("pointerdown", (e) => { ultGesto = Date.now(); try { const t = e.target; if (t && t.closest && (t.closest("[data-iasi],[data-iaigual],[data-iarev]") || t.closest("#iaPanel"))) ultIa = Date.now(); } catch (er) { } }, true);
  window.addEventListener("keydown", () => { ultGesto = Date.now(); }, true);
  window.addEventListener("click", (e) => { try { const t = e.target; if (t && t.closest && t.closest("[data-iasi],[data-iaigual]")) ultIa = Date.now(); } catch (er) { } }, true);
  window.addEventListener("online", () => { ultOnline = Date.now(); });
  const VISTA = { viewInicio: "Inicio", viewTablero: "Mi tablero", viewMisTareas: "Mis tareas", viewCalculadora: "Calculadora", viewRegistro: "Registrar obra", viewObras: "Obras", viewParteDiario: "Órdenes", viewPlanificacion: "Planificación", viewAvance: "Avance de obra", viewMapa: "Mapa", viewStock: "Pañol", viewInforme: "Informes", viewGastos: "Gastos", viewProduccion: "Producción", viewNormas: "Normas", viewGuias: "Guías", viewUsuarios: "Usuarios", viewPerfil: "Perfil" };
  let pantCache = null, pantTs = 0;
  function pantalla() {   // sin leer tamaños (nada de forzar el dibujo: la cámara escribe en el disparo)
    if (pantCache && Date.now() - pantTs < 500) return pantCache;
    let p = "", h = "";
    try {
      if (document.body && document.body.classList.contains("ec-abierta")) { pantCache = { p: (pantCache && pantCache.p) || "", h: "Cámara" }; pantTs = Date.now(); return pantCache; }
      const vs = document.querySelectorAll('.wrap[id^="view"]');
      for (let i = 0; i < vs.length; i++) { const v = vs[i]; if (v.style.display !== "none" && !v.hidden) { p = VISTA[v.id] || v.id.replace(/^view/, ""); break; } }
      const ds = document.querySelectorAll("body > .v7-ov, body > [role=dialog], body > .pf-modal");
      for (let i = ds.length - 1; i >= 0; i--) { const d = ds[i]; if (!d.hidden && d.style.display !== "none" && d.id !== "rcOv") { h = d.getAttribute("aria-label") || (d.querySelector("h3") || {}).textContent || d.id || ""; break; } }
      if (!h && document.body && document.body.classList.contains("ia-abierto")) h = "Asistente";
    } catch (e) { }
    pantCache = { p, h: String(h).trim().slice(0, 60) }; pantTs = Date.now();
    return pantCache;
  }
  const CTX = { origen: "", rev: "" };   // lo pone quien escribe a propósito (volver un cambio)
  function origenAhora(data) {
    if (CTX.origen) return CTX.origen;
    if (obj(data).porAsistente === true || Date.now() - ultIa < 15000) return "asistente";
    if (Date.now() - ultGesto < 6000) return "persona";
    if (ultOnline && Date.now() - ultOnline < 20000) return "cola";
    return "auto";
  }

  // ---------------------------------------------------------------- 1) la captura (barata: nada de copiar ni comparar acá)
  const BUF = new Map();   // clave → grupo { col, id, ops[], t0, t1, ... }
  const YA = new WeakMap();   // datos → rutas ya anotadas (para no contar dos veces la misma escritura: lotes de la base de prueba)
  const CNT = { ops: 0, sinAntes: 0 };
  let timer = null;
  function noVa(col, id) { if (!col || NO_COL.test(col)) return true; const r = NO_DOC[col]; return !!(r && r.test(String(id || ""))); }
  function claseDe(col, kind, data) {
    if (FOTO_COL.test(col) && (kind === "alta" || kind === "set")) return "fotos";
    if (col === "ordenesTrabajo" && kind === "update" && Object.keys(obj(data)).length && Object.keys(obj(data)).every((k) => /^campo\./.test(k))) return "cuadrilla";
    return "";
  }
  function anotar(col, id, kind, data, opt, extra) {
    try {
      if (window.__v181No || noVa(col, id)) return null;
      if (data && typeof data == "object") { const ya = YA.get(data) || new Set(), pk = col + "/" + id; if (ya.has(pk)) return null; ya.add(pk); YA.set(data, ya); }
      const u = window.__fbUser || {}; if (!u.email) return null;
      CNT.ops++; cuenta("ops", 1);
      const now = Date.now(), clase = claseDe(col, kind === "set" && extra && extra.nueva ? "alta" : kind, data);
      const key = clase === "fotos" ? "fotos|" + col + "|" + (obj(data).plazaId || "") : col + "/" + id;
      const pa = pantalla(), og = origenAhora(data);
      let g = BUF.get(key);
      if (!g) { g = { key, col, id, clase, ops: [], t0: now, t1: now, origen: og, pant: pa.p, hoja: pa.h, rev: CTX.rev || "", email: u.email, uid: u.uid || "" }; BUF.set(key, g); }
      // el «antes»: la última foto que trajeron las escuchas (solo la referencia; se lee después)
      const op = { kind, data, opt, ts: now, nueva: !!(extra && extra.nueva), idDoc: id };
      if (!g.ops.length && !op.nueva && clase !== "fotos") {
        op.dsnap = DREG.get(col + "/" + id) || null;
        const m = QREG.get(col); op.cands = m ? Array.from(m.values()) : [];
        if (!op.dsnap && !op.cands.length && extra && extra.cache) op.cache = extra.cache();
      }
      g.ops.push(op); g.t1 = now;
      if (op.kind === "delete") g.borrado = true;
      programar();
      return g;
    } catch (e) { return null; }
  }
  function falla(g, op) { try { if (!g) return; const i = g.ops.indexOf(op); if (i >= 0) g.ops.splice(i, 1); if (!g.ops.length) BUF.delete(g.key); } catch (e) { } }
  function seguir(pr, g) {
    if (!g || !pr || typeof pr.then != "function") return pr;
    const op = g.ops[g.ops.length - 1];
    pr.then(null, (e) => { if (e && /permission|not-found|invalid|failed-precondition/i.test(String(e.code || e.message || ""))) falla(g, op); });
    return pr;
  }
  const argsUpdate = (args) => {   // update(obj) o update("a.b", v, "c", w)
    if (typeof args[0] == "string" || (args[0] && args[0]._internalPath)) { const o = {}; for (let i = 0; i + 1 < args.length; i += 2) o[String(args[i])] = args[i + 1]; return o; }
    return args[0];
  };
  const pathDe = (ref) => { try { const p = String(ref.path || ""); const s = p.split("/"); return { col: s.slice(0, -1).join("/"), id: s[s.length - 1] || ref.id }; } catch (e) { return { col: "", id: "" }; } };

  let REAL = false;
  (function envolver() {
    let F; try { F = window.firebase && firebase.firestore; } catch (e) { return; }
    if (!F) return;
    REAL = !!(F.DocumentReference && F.DocumentReference.prototype && typeof F.DocumentReference.prototype.set == "function");
    if (REAL) envolverReal(F); else envolverPrueba();
  })();

  function envolverOnSnap(proto, esDoc) {
    const o = proto && proto.onSnapshot; if (typeof o != "function" || o.__rc) return;
    const n = function () {
      const args = Array.prototype.slice.call(arguments), clave = {};
      let col = "", id = "";
      if (esDoc) { const p = pathDe(this); col = p.col; id = p.id; } else col = colDeQuery(this);
      const guardar = (s) => { try { if (esDoc) DREG.set(col + "/" + id, { s, t: Date.now() }); else anotarSnap(col, clave, s); } catch (e) { } };
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (typeof a == "function") { args[i] = function (s) { guardar(s); return a.apply(this, arguments); }; break; }
        if (a && typeof a.next == "function") { const nx = a.next; args[i] = Object.assign({}, a, { next: function (s) { guardar(s); return nx.apply(a, arguments); }, error: a.error && a.error.bind(a), complete: a.complete && a.complete.bind(a) }); break; }
      }
      const un = o.apply(this, args);
      return typeof un == "function" ? function () { if (esDoc) DREG.delete(col + "/" + id); else soltarSnap(col, clave); return un.apply(this, arguments); } : un;
    };
    Object.keys(o).forEach((k) => { n[k] = o[k]; }); n.__rc = 1; proto.onSnapshot = n;
  }
  function envolverReal(F) {
    const D = F.DocumentReference.prototype;
    const g0 = D.get;
    const cacheDe = (ref) => () => { try { return g0.call(ref, { source: "cache" }).then((s) => s, () => null); } catch (e) { return null; } };
    const s0 = D.set, u0 = D.update, d0 = D.delete;
    D.set = function (data, opt) { const p = pathDe(this); const g = anotar(p.col, p.id, opt && (opt.merge || opt.mergeFields) ? "merge" : "set", data, opt, { cache: cacheDe(this), nueva: !!this.__rcNueva }); return seguir(s0.apply(this, arguments), g); };
    D.update = function () { const p = pathDe(this), data = argsUpdate(arguments); const g = anotar(p.col, p.id, "update", data, null, { cache: cacheDe(this) }); return seguir(u0.apply(this, arguments), g); };
    D.delete = function () { const p = pathDe(this); const g = anotar(p.col, p.id, "delete", null, null, { cache: cacheDe(this) }); return seguir(d0.apply(this, arguments), g); };
    [D.set, D.update, D.delete].forEach((f) => { f.__rc = 1; });
    const C = F.CollectionReference && F.CollectionReference.prototype;
    if (C && typeof C.add == "function" && typeof C.doc == "function") {
      // add = doc() nuevo + set (lo mismo que hace el SDK por adentro): así se sabe el id desde el principio
      C.add = function (data) { const r = this.doc(); r.__rcNueva = 1; return r.set(data).then(() => r); }; C.add.__rc = 1;
    }
    const W = F.WriteBatch && F.WriteBatch.prototype;
    if (W) {
      const LOTE = new WeakMap();   // batch → anotaciones (se confirman con commit)
      const env = (m, kind) => { const o = W[m]; if (typeof o != "function") return; W[m] = function (ref) { const p = pathDe(ref), args = Array.prototype.slice.call(arguments, 1); const data = kind === "update" ? argsUpdate(args) : args[0]; const k = kind === "set" && args[1] && (args[1].merge || args[1].mergeFields) ? "merge" : kind; const gs = LOTE.get(this) || []; gs.push(() => anotar(p.col, p.id, k, kind === "delete" ? null : data, args[1], { cache: cacheDe(ref) })); LOTE.set(this, gs); return o.apply(this, arguments); }; W[m].__rc = 1; };
      env("set", "set"); env("update", "update"); env("delete", "delete");
      const c0 = W.commit; if (typeof c0 == "function") { W.commit = function () { const gs = (LOTE.get(this) || []).map((f) => f()); LOTE.delete(this); const pr = c0.apply(this, arguments); if (pr && pr.then) pr.then(null, () => gs.forEach((g) => g && falla(g, g.ops[g.ops.length - 1]))); return pr; }; W.commit.__rc = 1; }
    }
    const T = F.Transaction && F.Transaction.prototype, FS = F.Firestore && F.Firestore.prototype;
    if (T && FS && typeof FS.runTransaction == "function") {
      const TXL = new WeakMap();
      const env = (m, kind) => { const o = T[m]; if (typeof o != "function") return; T[m] = function (ref) { const l = TXL.get(this); if (l) { const p = pathDe(ref), args = Array.prototype.slice.call(arguments, 1); const data = kind === "update" ? argsUpdate(args) : args[0]; const k = kind === "set" && args[1] && (args[1].merge || args[1].mergeFields) ? "merge" : kind; l.push(() => anotar(p.col, p.id, k, kind === "delete" ? null : data, args[1], { cache: cacheDe(ref) })); } return o.apply(this, arguments); }; T[m].__rc = 1; };
      env("set", "set"); env("update", "update"); env("delete", "delete");
      const r0 = FS.runTransaction;
      FS.runTransaction = function (fn) {
        let ult = null;
        const f2 = function (tx) { ult = []; TXL.set(tx, ult); return fn.apply(this, arguments); };
        const rest = Array.prototype.slice.call(arguments, 1);
        return r0.apply(this, [f2].concat(rest)).then((r) => { try { (ult || []).forEach((f) => f()); } catch (e) { } return r; });
      };
      FS.runTransaction.__rc = 1;
    }
    const envGet = (proto, esDoc) => { const o = proto && proto.get; if (typeof o != "function" || o.__rc) return; const n = function () { const self = this; const pr = o.apply(this, arguments); try { const src = arguments[0] && arguments[0].source; if (pr && pr.then && src !== "cache") pr.then((s) => { try { if (esDoc) { const p = pathDe(self); if (s && s.exists) DREG.set(p.col + "/" + p.id, { s, t: Date.now() }); } else anotarGet(colDeQuery(self), s); } catch (e) { } }, () => { }); } catch (e) { } return pr; }; Object.keys(o).forEach((k) => { n[k] = o[k]; }); n.__rc = 1; proto.get = n; };
    try { envGet(F.Query.prototype, false); envGet(F.DocumentReference.prototype, true); if (F.CollectionReference && F.CollectionReference.prototype.get !== F.Query.prototype.get) envGet(F.CollectionReference.prototype, false); } catch (e) { }
    try { envolverOnSnap(F.Query.prototype, false); envolverOnSnap(F.DocumentReference.prototype, true); if (F.CollectionReference && F.CollectionReference.prototype.onSnapshot !== F.Query.prototype.onSnapshot) envolverOnSnap(F.CollectionReference.prototype, false); } catch (e) { }
  }
  // base de prueba (sin las clases del SDK): se envuelve la instancia; los lotes y transacciones de la prueba pasan por ref.set/update/delete
  function envolverPrueba() {
    let f; try { f = firebase.firestore(); } catch (e) { return; }
    if (!f || f.__rc || typeof f.collection != "function") return;
    const envRef = (r, col) => {
      if (!r || r.__rc) return r;
      const s0 = r.set, u0 = r.update, d0 = r.delete, o0 = r.onSnapshot, id = r.id;
      r.set = function (data, opt) { const g = anotar(col, id, opt && (opt.merge || opt.mergeFields) ? "merge" : "set", data, opt, { nueva: !!r.__rcNueva }); return seguir(s0.apply(this, arguments), g); };
      r.update = function () { const data = argsUpdate(arguments); const g = anotar(col, id, "update", data, null); return seguir(u0.apply(this, arguments), g); };
      r.delete = function () { const g = anotar(col, id, "delete", null, null); return seguir(d0.apply(this, arguments), g); };
      if (typeof o0 == "function") r.onSnapshot = function (cb, er) { const un = o0.call(this, function (s) { DREG.set(col + "/" + id, { s, t: Date.now() }); return cb.apply(this, arguments); }, er); return function () { DREG.delete(col + "/" + id); return un(); }; };
      const g0 = r.get; if (typeof g0 == "function") r.get = function () { const pr = g0.apply(this, arguments); if (pr && pr.then) pr.then((s) => { if (s && s.exists) DREG.set(col + "/" + id, { s, t: Date.now() }); }, () => { }); return pr; };
      r.__rc = 1; return r;
    };
    const envQ = (q, col) => {
      if (!q || q.__rcq) return q;
      ["where", "orderBy", "limit"].forEach((m) => { const o = q[m]; if (typeof o == "function") q[m] = function () { return envQ(o.apply(this, arguments), col); }; });
      const gq = q.get; if (typeof gq == "function") q.get = function () { const pr = gq.apply(this, arguments); if (pr && pr.then) pr.then((s) => anotarGet(col, s), () => { }); return pr; };
      const o0 = q.onSnapshot;
      if (typeof o0 == "function") q.onSnapshot = function (cb, er) {
        const clave = {};
        if (typeof cb === "object" && cb && cb.next) { er = cb.error; cb = cb.next; }
        const un = o0.call(this, function (s) { anotarSnap(col, clave, s); return cb.apply(this, arguments); }, er);
        return function () { soltarSnap(col, clave); return un(); };
      };
      q.__rcq = 1; return q;
    };
    const c0 = f.collection;
    f.collection = function (p) {
      const c = c0.apply(this, arguments); if (!c || c.__rcc) return c;
      const col = String(p);
      envQ(c, col);
      const doc0 = c.doc;
      c.doc = function () { return envRef(doc0.apply(this, arguments), col); };
      c.add = function (data) { const r = c.doc(); r.__rcNueva = 1; return r.set(data).then(() => r); };
      c.__rcc = 1; return c;
    };
    f.__rc = 1;
  }

  // ---------------------------------------------------------------- 2) del «qué se escribió» al «antes → después»
  const MARCA_PRIV = "[privado]";
  // un valor que se puede guardar en el registro: sin imágenes, textos cortados, sin secretos ni sueldos; x = se perdió algo
  function limpio(v, k, prof, st) {
    st = st || { x: "" };
    if (v === undefined) return undefined;
    if (k && SECRETO.test(k)) { st.x = st.x || "secreto"; return "[oculto]"; }
    if (k && PRIVADO.test(String(k).replace(/\s/g, ""))) { if (st.x !== "secreto") st.p = 1; return MARCA_PRIV; }
    if (v === null || typeof v == "number" || typeof v == "boolean") return v;
    if (typeof v == "string") {
      if (/^data:[a-z]+\/[\w.+-]+;base64,/i.test(v) || (v.length > 600 && /^[A-Za-z0-9+/=\s]+$/.test(v.slice(0, 600)) && new Set(v.slice(0, 600)).size > 20)) { st.x = "imagen"; return "[imagen]"; }
      if (v.length > 500) { st.x = st.x || "cortado"; return v.slice(0, 500) + "… (" + v.length + " letras)"; }
      return v;
    }
    if (typeof v.toMillis == "function") { st.x = st.x || "fecha"; return intentar(() => v.toMillis(), 0); }
    if (typeof v.latitude == "number" && typeof v.longitude == "number") { st.x = st.x || "tipo"; return { lat: v.latitude, lng: v.longitude }; }
    if (v.firestore && typeof v.path == "string") { st.x = st.x || "tipo"; return "[ref " + v.path + "]"; }
    if ((prof || 0) > 7) { st.x = st.x || "cortado"; return "[…]"; }
    if (Array.isArray(v)) {
      const l = v.length > 300 ? v.slice(0, 300) : v; if (v.length > 300) st.x = st.x || "cortado";
      return l.map((x) => { const y = limpio(x, "", (prof || 0) + 1, st); return y === undefined ? null : y; });
    }
    if (typeof v == "object") {
      const o = {}; Object.keys(v).forEach((q) => { if (/^(mini|dataUrl|miniatura|imagen|img|thumb|base64)$/i.test(q) && typeof v[q] == "string" && v[q].length > 200) { o[q] = "[imagen]"; st.x = st.x || "imagen"; return; } const y = limpio(v[q], q, (prof || 0) + 1, st); if (y !== undefined) o[q] = y; });
      return o;
    }
    return String(v);
  }
  // FieldValue (SDK real o la base de prueba) → qué hace
  function centinela(v) {
    if (!v || typeof v != "object") return null;
    if (v.__op) return { op: v.__op === "del" ? "delete" : v.__op === "ts" ? "ts" : v.__op === "inc" ? "inc" : v.__op === "au" ? "au" : v.__op === "ar" ? "ar" : "", n: v.n, v: v.v };
    const m = String(v._methodName || (v._delegate && v._delegate._methodName) || "");
    if (!m) return null;
    const d = v._delegate || v;
    if (/delete/i.test(m)) return { op: "delete" };
    if (/serverTimestamp/i.test(m)) return { op: "ts" };
    if (/increment/i.test(m)) return { op: "inc", n: +(d._operand != null ? d._operand : intentar(() => d._operand.integerValue || d._operand.doubleValue, 0)) || 0 };
    if (/arrayUnion/i.test(m)) return { op: "au", v: arr(d._elements) };
    if (/arrayRemove/i.test(m)) return { op: "ar", v: arr(d._elements) };
    return { op: "?" };
  }
  const igualJ = (a, b) => { try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; } };
  function aplicarCent(prev, v) {
    const c = centinela(v); if (!c) return { v };
    if (c.op === "delete") return { borra: true };
    if (c.op === "ts") return { v: "(hora del servidor)", vol: true };
    if (c.op === "inc") return { v: (Number(prev) || 0) + (Number(c.n) || 0) };
    if (c.op === "au") { const a = arr(prev).slice(); arr(c.v).forEach((x) => { if (!a.some((y) => igualJ(x, y))) a.push(x); }); return { v: a }; }
    if (c.op === "ar") return { v: arr(prev).filter((y) => !arr(c.v).some((x) => igualJ(x, y))) };
    return { v: "(?)" };
  }
  const getPath = (o, p) => { let z = o; const ps = p.split("."); for (let i = 0; i < ps.length; i++) { if (!z || typeof z != "object") return undefined; z = z[ps[i]]; } return z; };
  const setPath = (o, p, v, borra) => { const ps = p.split("."); let z = o; for (let i = 0; i < ps.length - 1; i++) { if (!z[ps[i]] || typeof z[ps[i]] != "object") z[ps[i]] = {}; z = z[ps[i]]; } if (borra) delete z[ps[ps.length - 1]]; else z[ps[ps.length - 1]] = v; };
  const esPlano = (v) => v && typeof v == "object" && !Array.isArray(v) && !centinela(v) && typeof v.toMillis != "function" && !(typeof v.latitude == "number");
  function clonar(v) { try { return v === undefined ? undefined : JSON.parse(JSON.stringify(v, (k, x) => (x && typeof x == "object" && typeof x.toMillis == "function" ? x.toMillis() : x))); } catch (e) { return undefined; } }
  // lo que dice una escritura: [[ruta, valor nuevo o borrado]] sobre lo de antes
  function rutas(kind, data, viejo) {
    const out = [];
    if (kind === "delete") return out;
    if (kind === "set") {   // reemplaza todo
      const ks = Object.keys(obj(data)), vk = Object.keys(obj(viejo));
      ks.forEach((k) => out.push([k, data[k]]));
      vk.forEach((k) => { if (ks.indexOf(k) < 0) out.push([k, { __op: "del" }]); });
      return out;
    }
    if (kind === "update") { Object.keys(obj(data)).forEach((k) => out.push([k, data[k]])); return out; }
    // merge: los objetos se mezclan hacia adentro
    const plano = (o, pre, prof) => { Object.keys(obj(o)).forEach((k) => { const v = o[k], p = pre ? pre + "." + k : k; if (esPlano(v) && prof < 4 && Object.keys(v).length && esPlano(getPath(viejo, p) || {})) plano(v, p, prof + 1); else out.push([p, v]); }); };
    plano(data, "", 0);
    return out;
  }
  function viejoDe(op) {
    try {
      if (op.nueva) return { d: undefined, sabe: true };
      let s = null, ts = -1;   // la foto más nueva que tenga el documento
      if (op.dsnap) { s = op.dsnap.s; ts = op.dsnap.t; }
      (op.cands || []).forEach((q) => { if (q.t > ts) { const x = buscarEn(q.s, op.idBuscado); if (x) { s = x; ts = q.t; } } });
      if (s) return { d: s.exists === false ? undefined : (typeof s.data == "function" ? s.data() : undefined), sabe: true };
      if (op.cacheSnap) return { d: op.cacheSnap.exists ? op.cacheSnap.data() : undefined, sabe: true };
      if ((op.cands || []).length) return { d: undefined, sabe: true };   // la app tiene la colección en memoria y ese documento no está: es nuevo
      return { d: undefined, sabe: false };
    } catch (e) { return { d: undefined, sabe: false }; }
  }
  const FL = {   // cómo se llama cada campo
    nombre: "el nombre", plazaNombre: "el nombre de la obra", mapaColor: "el color del pin", mapaIcono: "el ícono del pin", lat: "la ubicación (lat)", lng: "la ubicación (lng)", direccion: "la dirección", barrio: "el barrio", obraId: "el ID", carpetaEpec: "la carpeta EPEC", tipo: "el tipo", tipoObra: "el tipo de obra",
    estado: "el estado", fecha: "la fecha", hora: "la hora", costo: "el precio", precioUnit: "el precio", pu: "el precio unitario", desc: "la descripción", importe: "el importe", cant: "la cantidad", minimo: "el mínimo", activo: "activo", rol: "el rol", ajustes: "los permisos", persona: "la persona vinculada",
    nomina: "la nómina", lista: "la lista", vehiculos: "los vehículos", contactos: "los contactos", ausencias: "las ausencias", sectores: "los sectores", personal: "la gente", personalNombres: "la gente", actividades: "las tareas", cierre: "el cierre", campo: "lo de la cuadrilla", items: "los materiales",
    valorItems: "el itemizado", av2: "el avance de obra", fotosBorradas: "las fotos borradas", coCierre: "el conforme a obra", documentos: "la documentación", baremo: "lo que vale cada tarea", gastosRef: "los precios de Gastos", proveedor: "el proveedor", comprobante: "el comprobante", cat: "la categoría", obs: "la observación",
    horaInicio: "la hora de inicio", horaFin: "la hora de fin", notas: "las notas", numero: "el número", vehiculoId: "el vehículo", supervisor: "el responsable de oficina", horario: "el horario", reparto: "el reparto", asignada: "quién hace cada tarea", previsto: "lo previsto", borrada: "borrada", num: "el nombre de la foto", categoria: "el tipo de foto", unidadesPorAsignar: "las unidades", porUnidad: "cuánto trae cada unidad", ean: "los códigos de barras", sector: "el sector"
  };
  const COL = {
    avanceObras: "Obras", ordenesTrabajo: "Órdenes", gastosObra: "Gastos", reservas: "Reservas", movimientos: "Pañol (movimientos)", catalogoProductos: "Pañol (catálogo)", configEquipo: "Configuración", usuarios: "Usuarios",
    fotosObra: "Fotos", adjuntos: "Archivos y fotos", planosObra: "Planos", planosImg: "Planos", planosNotas: "Planos", mapaPuntos: "Mapa", herramientas: "Herramientas", herramientasMov: "Herramientas", planSemanal: "Planificación", historialCalculos: "Calculadora", historialEtapas: "Avance de obra",
    cierresQuincena: "Quincenas", tableros: "Mi tablero", proyectos: "Proyectista", avisosCuadrilla: "Para resolver"
  };
  const CFG = { personal: "Personal del equipo", precios: "Precios e itemizado", baremo: "Cuánto vale cada tarea", cuadrillas: "Cuadrillas", ubicacion: "Ubicación en vivo", alias: "Usuarios cortos", guias: "Guías", reinicios: "Reinicios de puntos" };
  const COLOR = { "#ea4335": "rojo", "#f9a825": "amarillo", "#188038": "verde", "#1a73e8": "azul", "#8e24aa": "violeta", "#e8710a": "naranja", "#00897b": "verde agua", "#d81b60": "rosa", "#6d4c41": "marrón", "#28285e": "azul oscuro", "#5f6368": "gris" };
  const DINERO = /^(importe|costo|precioUnit|pu|precio|monto|total)$/;
  function vTxt(v, k) {
    if (v === undefined || v === null || v === "") return "(vacío)";
    if (k === "mapaColor" && typeof v == "string") return COLOR[v.toLowerCase()] || v;
    if (typeof v == "number") return (DINERO.test(k || "") ? "$ " : "") + fN(v);
    if (typeof v == "boolean") return v ? "sí" : "no";
    if (typeof v == "string") return v.length > 80 ? v.slice(0, 80) + "…" : v;
    if (Array.isArray(v)) return v.length + " elemento" + (v.length === 1 ? "" : "s");
    const ks = Object.keys(v); return ks.length ? "{" + ks.slice(0, 4).join(", ") + (ks.length > 4 ? "…" : "") + "}" : "(vacío)";
  }
  const etqItem = (z) => (z && typeof z == "object" ? String(z.nombre || z.label || z.desc || z.codigo || z.id || z.email || JSON.stringify(z).slice(0, 40)) : String(z));
  const claveItem = (z) => (z && typeof z == "object" ? String(z.id || z.nombre || z.codigo || z.email || z.label || JSON.stringify(z)) : String(z));
  // dos listas: quién se agregó, quién se sacó, qué cambió adentro de cada uno
  function difLista(a, d) {
    const A = arr(a), B = arr(d), ka = A.map(claveItem), kb = B.map(claveItem), out = [];
    A.forEach((x, i) => { if (kb.indexOf(ka[i]) < 0) out.push("sacó " + etqItem(x)); });
    B.forEach((x, i) => { const j = ka.indexOf(kb[i]); if (j < 0) { out.push("agregó " + etqItem(x)); return; } const y = A[j]; if (x && y && typeof x == "object" && typeof y == "object" && !igualJ(x, y)) { const cs = Object.keys(Object.assign({}, x, y)).filter((q) => !VOL.test(q) && !igualJ(x[q], y[q])); out.push(etqItem(x) + ": " + cs.slice(0, 3).map((q) => (FL[q] || q).replace(/^(el|la|los|las) /, "") + " " + vTxt(y[q], q) + " → " + vTxt(x[q], q)).join(", ")); } });
    return out;
  }
  function etiquetaDoc(col, id, D) {
    D = obj(D);
    if (col === "avanceObras") return "la obra " + String(D.nombre || D.plazaNombre || id).toUpperCase();
    if (col === "ordenesTrabajo") return "la orden " + (D.numero || id) + (D.plazaNombre ? " (" + String(D.plazaNombre).toUpperCase() + ")" : "");
    if (col === "gastosObra") return "el gasto" + (D.importe != null ? " de $ " + fN(D.importe) : "") + (D.desc ? " «" + D.desc + "»" : "") + (D.plazaNombre ? " de " + String(D.plazaNombre).toUpperCase() : D.general ? " (general)" : "");
    if (col === "reservas") return "la reserva " + (D.numero || id) + (D.plazaNombre ? " de " + String(D.plazaNombre).toUpperCase() : "");
    if (col === "movimientos") return "el movimiento " + (D.numero || "") + (D.desc ? " «" + D.desc + "»" : "") + (D.codigo ? " (" + D.codigo + ")" : "");
    if (col === "catalogoProductos") return "el producto " + (D.codigo || id) + (D.desc ? " " + D.desc : "");
    if (col === "usuarios") return "el usuario " + (D.nombre || D.usuario || D.email || id);
    if (col === "configEquipo") return "«" + (CFG[id] || id) + "»";
    if (col === "fotosObra" || col === "adjuntos") return (D.tipo === "video" ? "el video " : D.tipo === "pdf" || /pdf/.test(D.mime || "") ? "el PDF " : "la foto ") + (D.num || D.nombre || D.categoria || D.cat || "") + (D.plazaNombre ? " de " + String(D.plazaNombre).toUpperCase() : "");
    if (col === "mapaPuntos") return "el punto del mapa «" + (D.nombre || D.titulo || id) + "»";
    if (col === "herramientas") return "la herramienta " + (D.codigo || "") + " " + (D.nombre || D.desc || id);
    if (col === "historialCalculos") return "el cómputo de " + String(D.plazaNombre || D.obra || D.obraNombre || id).toUpperCase();
    if (col === "planSemanal") return "el plan de la semana";
    return (COL[col] || col) + " · " + id;
  }
  function obraDe(col, id, D) {
    D = obj(D);
    if (col === "avanceObras") return { id: String(id), n: String(D.nombre || D.plazaNombre || "") };
    const pid = D.plazaId || D.obraIdApp || "";
    return pid ? { id: String(pid), n: String(D.plazaNombre || D.obraNombre || "") } : null;
  }
  const lbl = (k) => { const ps = k.split("."); return FL[ps[0]] && ps.length === 1 ? FL[ps[0]] : ps.map((p) => (FL[p] || p).replace(/^(el|la|los|las) /, "")).join(" › "); };
  function resumenDe(g, E) {
    const quien = "", doc = E.nom;
    if (E.t === "fotos") return `Subió ${E.n} ${g.col === "planosImg" ? "parte" + (E.n === 1 ? "" : "s") + " de plano" : "foto" + (E.n === 1 ? "" : "s") + "/archivo" + (E.n === 1 ? "" : "s")}${E.obn ? " de " + E.obn.toUpperCase() : ""}`;
    if (E.t === "alta") return quien + "Agregó " + doc;
    if (E.t === "borrado") return "Borró " + doc;
    const f = E.f.filter((x) => !x.vol);
    if (!f.length) return "Tocó " + doc + " (sin cambios a la vista)";
    if (g.clase === "cuadrilla" && f.length > 2) { const cs = Array.from(new Set(f.map((x) => x.k.split(".")[1]))).slice(0, 4).map((x) => (FL[x] || x).replace(/^(el|la|los|las) /, "")); return `Cargó en ${doc}: ${cs.join(", ")} (${f.length} datos)`; }
    if (f.length <= 3) { const fr = f.map((c) => frase(g, E, c, doc)); return fr.join(" · "); }
    const ls = Array.from(new Set(f.map((x) => lbl(x.k)))); return `Cambió ${f.length} datos ${deD(doc)} (${ls.slice(0, 4).join(", ")}${ls.length > 4 ? "…" : ""})`;
  }
  const deD = (doc) => (/^el /.test(doc) ? "del " + doc.slice(3) : "de " + doc);
  function frase(g, E, c, doc) {
    const k = c.k, A = c.an || c.ad ? undefined : parse(c.aj), D = c.dn ? undefined : parse(c.dj), u = k.split(".").pop();
    const obra = String(E.obn || doc).toUpperCase();
    if (g.col === "avanceObras" && k === "nombre") return `Renombró la obra ${vTxt(A)} → ${String(vTxt(D)).toUpperCase()}`;
    if (k === "mapaColor") return `Cambió el color del pin de ${obra} de ${c.an ? "según el avance" : vTxt(A, k)} a ${c.dn ? "según el avance" : vTxt(D, k)}`;
    if (k === "mapaIcono") return `Cambió el ícono del pin de ${obra} de ${c.an ? "automático" : vTxt(A)} a ${c.dn ? "automático" : vTxt(D)}`;
    if (k === "estado") return `Pasó ${doc} de ${vTxt(A)} a ${vTxt(D)}`;
    if (k === "costo" || k === "precioUnit") return `Cambió el precio de ${doc.replace(/^el producto /, "")} de ${vTxt(A, "costo")} a ${vTxt(D, "costo")}`;
    if (k === "fotosBorradas") { const n = arr(D).length - arr(A).length; return n > 0 ? `Borró ${n} foto${n === 1 ? "" : "s"} de ${obra}` : `Cambió las fotos borradas ${deD(doc)}`; }
    if (/^campo\.fotos\.[^.]+\.borrada$/.test(k) && D === true) return `Borró una foto ${deD(doc)}`;
    if (/^campo\.marcas\./.test(k)) { const m = (v) => (v && typeof v == "object" ? (v.hecha === true || v.si === true ? "hecha" : v.hecha === false || v.no ? "no se hizo" : "") + (v.cant != null ? " " + fN(v.cant) : "") || vTxt(v) : vTxt(v, u)); return `Marcó en ${doc}: ${k.split(".").slice(2).join(" › ")} ${c.an ? "(sin marcar)" : m(A)} → ${m(D)}`; }
    if (Array.isArray(A) || Array.isArray(D)) { const dl = difLista(A, D); if (dl.length) return `Cambió ${lbl(k)} ${deD(doc)}: ${dl.slice(0, 3).join(" · ")}${dl.length > 3 ? " · y " + (dl.length - 3) + " más" : ""}`; }
    if ((A === undefined || A === null || typeof A != "object") && (D === undefined || D === null || typeof D != "object")) return `Cambió ${lbl(k)} ${deD(doc)}: ${c.ad ? "(?)" : c.an ? "(vacío)" : vTxt(A, u)} → ${c.dn ? "(borrado)" : vTxt(D, u)}`;
    return `Cambió ${lbl(k)} ${deD(doc)}`;
  }
  const parse = (j) => { if (j === undefined) return undefined; try { return JSON.parse(j); } catch (e) { return j; } };
  const json = (v, st, k) => { const l = limpio(v, k || "", 0, st); const s = JSON.stringify(l === undefined ? null : l); if (s.length > MAX_VAL) { st.x = st.x || "cortado"; return { s: JSON.stringify(Array.isArray(l) ? "[lista de " + l.length + "]" : typeof l == "object" ? "[" + Object.keys(l || {}).length + " datos]" : String(l).slice(0, 300)), corto: true }; } return { s }; };
  async function armarGrupo(g, resumir) {
    const op0 = g.ops[0];
    if (op0.cache && !op0.cacheSnap) { try { op0.cacheSnap = await Promise.race([op0.cache, new Promise((ok) => setTimeout(() => ok(null), 3000))]); } catch (e) { } }
    op0.idBuscado = g.id;
    const E = { c: g.col, id: g.id, n: g.ops.length, t0: g.t0, t1: g.t1, o: g.origen, pa: g.pant || "", h: g.hoja || "" };
    if (g.rev) E.rev = g.rev;
    if (g.clase === "fotos") {
      E.t = "fotos"; E.id = ""; const d0 = obj(op0.data); const ob = obraDe(g.col, "", d0); if (ob) { E.ob = ob.id; E.obn = ob.n; }
      E.ids = g.ops.map((o) => String(o.idDoc || "")).filter((x) => x).slice(0, 40); E.nom = "fotos"; E.r = resumenDe(g, E); return E;
    }
    const V = viejoDe(op0); if (!V.sabe) { E.sinAntes = 1; CNT.sinAntes++; }
    let cur = V.d === undefined ? undefined : clonar(V.d); const antes = cur === undefined ? undefined : clonar(cur);
    const F = new Map();   // ruta → {a, d, an, dn}
    const nace = cur === undefined && V.sabe && g.ops.some((op) => op.kind !== "delete" && op.kind !== "update");
    let muere = false;
    g.ops.forEach((op) => {
      if (op.kind === "delete") { muere = true; cur = undefined; return; }
      const base = cur || {};
      rutas(op.kind, op.data, base).forEach(([p, v]) => {
        const prev = getPath(base, p), r = aplicarCent(prev, v);
        if (!F.has(p)) F.set(p, { a: prev, an: prev === undefined });
        const x = F.get(p); if (r.borra) { x.d = undefined; x.dn = true; } else { x.d = r.v; x.dn = false; x.vol = !!r.vol; }
        if (!cur) cur = {};
        setPath(cur, p, r.borra ? undefined : r.v, r.borra);
      });
      muere = false;
    });
    const D = cur || antes || obj(op0.data);
    E.nom = etiquetaDoc(g.col, g.id, Object.assign({}, obj(antes), obj(cur)));
    const ob = obraDe(g.col, g.id, Object.assign({}, obj(antes), obj(D))); if (ob) { E.ob = ob.id; E.obn = ob.n; }
    if (muere && antes !== undefined) {
      E.t = "borrado"; const st = { x: "" }; const pj = JSON.stringify(limpio(antes, "", 0, st) || {});
      if (pj.length <= MAX_PREV && !resumir) { E.prev = pj; if (st.x) E.prevX = st.x; if (st.p) E.prevP = 1; } else E.prevX = "grande";
      E.f = []; E.r = resumenDe(g, E); return E;
    }
    if (muere) { E.t = "borrado"; E.prevX = V.sabe ? "nada" : "sinAntes"; E.f = []; E.r = resumenDe(g, E); return E; }
    E.t = nace ? "alta" : "cambio";
    const campos = [];
    F.forEach((x, p) => {
      if (igualJ(x.a, x.d) && x.an === x.dn) return;
      if (VOL.test(p.split(".").pop()) || VOL.test(p.split(".")[0])) return;
      const c = { k: p }; if (x.vol) c.vol = 1;
      if (resumir) { campos.push(c); return; }
      const st = { x: "" };
      const kk = p.split(".").pop();
      if (!V.sabe) c.ad = 1; else if (x.an) c.an = 1; else c.aj = json(x.a, st, kk).s;
      if (x.dn) c.dn = 1; else c.dj = json(x.d, st, kk).s;
      if (st.x) c.x = st.x; if (st.p) c.p = 1;
      campos.push(c);
    });
    if (E.t === "cambio" && !campos.length) return null;   // nada que contar (solo fechas internas o lo mismo)
    E.f = campos.slice(0, 60); if (campos.length > 60) E.fMas = campos.length - 60;
    if (E.t === "alta" && !resumir) { const st = { x: "" }; const nj = JSON.stringify(limpio(cur || {}, "", 0, st) || {}); if (nj.length <= MAX_VAL) E.nuevo = nj; E.f = []; }
    E.r = resumenDe(g, E);
    return E;
  }

  // ---------------------------------------------------------------- cuántas escrituras (cupo del plan gratis: 20.000 por día)
  const KC = "ema.rc.cuenta";
  let CC = null;
  function cc() { const h = diaDe(Date.now()); if (!CC) CC = intentar(() => JSON.parse(localStorage.getItem(KC) || "null"), null); if (!CC || CC.dia !== h) CC = { dia: h, ops: 0, aud: 0, kb: 0, cambios: 0 }; return CC; }
  let tmC = null;
  function cuenta(k, n) { const c = cc(); c[k] = (c[k] || 0) + n; if (!tmC) tmC = setTimeout(() => { tmC = null; try { localStorage.setItem(KC, JSON.stringify(CC)); } catch (e) { } }, 3000); }
  const cupoMal = () => intentar(() => /cupo/.test(String((window.__senalReal && window.__senalReal.motivo && window.__senalReal.motivo()) || "")), false);
  const modoResumen = () => cc().aud >= TOPE_DIA() || cupoMal();

  // ---------------------------------------------------------------- el reloj: cerrar grupos y guardar
  const camAbierta = () => !!(document.body && document.body.classList.contains("ec-abierta"));
  function vence(g) {
    const f = modoResumen() ? 5 : 1;
    if (g.clase) return Math.min(g.t0 + CUADRILLA_MS() * f, g.t1 + Math.max(ESPERA(), CUADRILLA_MS() / 3) * f);
    return Math.min(g.t0 + TOPE() * f, g.t1 + ESPERA() * f);
  }
  function programar() {
    if (timer) return;
    let t = Infinity; BUF.forEach((g) => { t = Math.min(t, vence(g)); });
    if (t === Infinity) return;
    timer = setTimeout(() => { timer = null; tic(); }, Math.max(50, t - Date.now()));
  }
  let corriendo = false, demorado = 0;
  async function tic(forzar) {
    if (corriendo) { programar(); return; }
    const now = Date.now();
    if (!forzar && camAbierta() && (!demorado || now - demorado < 5 * 6e4)) { demorado = demorado || now; timer = setTimeout(() => { timer = null; tic(); }, 3000); return; }
    demorado = 0;
    const listos = []; BUF.forEach((g) => { if (forzar || vence(g) <= now) listos.push(g); });
    if (!listos.length) { programar(); return; }
    listos.forEach((g) => BUF.delete(g.key));
    corriendo = true;
    try { await guardar(listos); } catch (e) { console.warn("[v181] registro", e); }
    corriendo = false;
    programar();
  }
  const esperarQuieto = () => new Promise((ok) => { if (window.requestIdleCallback) requestIdleCallback(() => ok(), { timeout: 1500 }); else setTimeout(ok, 0); });
  async function guardar(gs) {
    await esperarQuieto();
    const resumir = modoResumen();
    const porQuien = new Map();
    for (const g of gs) {
      let E = null; try { E = await armarGrupo(g, resumir); } catch (e) { E = null; }
      if (!E) continue;
      const k = g.email + "|" + g.origen; if (!porQuien.has(k)) porQuien.set(k, { email: g.email, uid: g.uid, origen: g.origen, l: [] }); porQuien.get(k).l.push(E);
    }
    for (const q of porQuien.values()) {
      let lote = [], tam = 0;
      const sale = async () => { if (!lote.length) return; const l = lote; lote = []; tam = 0; await escribir(q, l, resumir); };
      for (const E of q.l) { const s = JSON.stringify(E).length; if (tam + s > MAX_DOC) await sale(); lote.push(E); tam += s; }
      await sale();
    }
  }
  const ULT = [];   // lo último que se registró en este aparato (para la hoja y las pruebas)
  async function escribir(q, l, resumir) {
    const me = yo(), d = {
      ts: Date.now(), fecha: new Date().toISOString(), usuario: q.email, accion: "cambios_app", v: VER, uid: q.uid || "", nombre: String(me.nombre || me.persona || q.email || ""), rol: String(me.rol || ""),
      origen: q.origen, porAsistente: q.origen === "asistente", n: l.reduce((s, E) => s + (E.n || 1), 0),
      cols: Array.from(new Set(l.map((E) => E.c))), tipos: Array.from(new Set(l.map((E) => E.t))), obras: Array.from(new Set(l.map((E) => E.ob).filter((x) => x))).slice(0, 40),
      detalle: l.map((E) => E.r).join(" · ").slice(0, 500), version: (($("appVersion") || {}).textContent || "").trim(), cambios: l
    };
    if (resumir) d.resumido = true;
    try {
      // sin esperar al servidor: sin señal la base lo guarda en el celu y lo manda sola cuando vuelve (esperar trabaría el registro)
      const pr = firebase.firestore().collection("auditoria").add(d);
      if (pr && pr.then) pr.then(null, (e) => console.warn("[v181] auditoría", e && e.message));
      cuenta("aud", 1); cuenta("cambios", l.length); cuenta("kb", Math.round(JSON.stringify(d).length / 1024));
      ULT.unshift(d); if (ULT.length > 30) ULT.pop();
    } catch (e) { console.warn("[v181] auditoría", e && e.message); }
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden && BUF.size) tic(true); });
  window.addEventListener("pagehide", () => { if (BUF.size) tic(true); });

  // ---------------------------------------------------------------- 3) leer el historial (solo Administración, solo con la hoja abierta)
  const db = () => firebase.firestore();
  function expandir(id, a) {
    if (a.accion === "cambios_app") return arr(a.cambios).map((E, i) => Object.assign({}, E, { eid: id + "#" + i, aid: id, i, ts: E.t1 || a.ts, usuario: a.usuario, nombre: a.nombre, rol: a.rol, origen: E.o || a.origen }));
    return [{ eid: id + "#a", aid: id, t: "accion", c: "", r: (String(a.accion || "") + ": " + String(a.detalle || "")).slice(0, 400), ts: a.ts, usuario: a.usuario, nombre: a.nombre || "", rol: a.rol || "", origen: a.porAsistente ? "asistente" : "persona", accion: a.accion, ref: a.ref || a.plazaId || "" }];
  }
  async function pagina(op) {
    op = op || {};
    let q = db().collection("auditoria");
    if (op.desde) q = q.where("ts", ">=", +op.desde);
    const hasta = op.antesDe || op.hasta; if (hasta) q = q.where("ts", "<", +hasta);
    q = q.orderBy("ts", "desc").limit(op.limite || 100);
    const s = await q.get(); const docs = []; s.forEach((x) => docs.push({ id: x.id, d: x.data() }));
    return { docs, ultimoTs: docs.length ? docs[docs.length - 1].d.ts : 0, hayMas: docs.length >= (op.limite || 100) };
  }
  function coincide(E, f) {
    if (!f) return true;
    if (f.tipo && f.tipo !== "todos" && E.t !== f.tipo) return false;
    if (f.coleccion && E.c !== f.coleccion) return false;
    if (f.docId && E.id !== f.docId) return false;
    if (f.persona && nk(E.nombre + " " + E.usuario).indexOf(nk(f.persona)) < 0) return false;
    if (f.obra && nk((E.obn || "") + " " + (E.ob || "") + " " + (E.nom || "")).indexOf(nk(f.obra)) < 0) return false;
    if (f.texto && nk(E.r + " " + (E.nom || "") + " " + arr(E.f).map((x) => x.k + " " + (x.aj || "") + " " + (x.dj || "")).join(" ")).indexOf(nk(f.texto)) < 0) return false;
    if (f.campo && !arr(E.f).some((x) => x.k === f.campo || x.k.split(".")[0] === f.campo) && E.t !== "borrado") return false;
    if (f.desde && E.ts < +f.desde) return false; if (f.hasta && E.ts >= +f.hasta) return false;
    if (f.soloCambios && E.t === "accion") return false;
    return true;
  }
  async function buscar(f, op) {
    op = op || {}; const out = []; let antesDe = 0, vueltas = 0, hayMas = true;
    while (hayMas && out.length < (op.max || 100) && vueltas < (op.paginas || 3)) {
      const P = await pagina({ desde: f.desde, hasta: f.hasta, antesDe, limite: 100 });
      P.docs.forEach((x) => expandir(x.id, x.d).forEach((E) => { if (coincide(E, f)) out.push(E); }));
      hayMas = P.hayMas; antesDe = P.ultimoTs; vueltas++;
    }
    return { lista: out.slice(0, op.max || 100), hayMas, antesDe };
  }

  // ---------------------------------------------------------------- «Volver este cambio»
  function reversibles(E) { return arr(E.f).filter((c) => !c.vol && !c.x && !c.ad); }
  const puedeVolver = (E) => E && ((E.t === "cambio" && reversibles(E).length > 0) || (E.t === "borrado" && E.prev && !E.prevX));
  function conPrivados(a, cur) {   // lo «[privado]» del registro se completa con lo que hay hoy
    if (a === MARCA_PRIV) return cur;
    if (Array.isArray(a)) { const cl = arr(cur); return a.map((x, i) => { const k = claveItem(x), j = cl.findIndex((y) => claveItem(y) === k); return conPrivados(x, j >= 0 ? cl[j] : cl[i]); }).filter((x) => x !== undefined); }
    if (a && typeof a == "object") { const o = {}; Object.keys(a).forEach((k) => { const v = conPrivados(a[k], obj(cur)[k]); if (v !== undefined) o[k] = v; }); return o; }
    return a;
  }
  async function planVolver(E, sel) {
    if (!E) return { err: "No encontré ese cambio." };
    const ref = db().collection(E.c).doc(E.id);
    let snap = null; try { snap = await ref.get(); } catch (e) { return { err: "No pude leer cómo está hoy (" + ((e && e.code) || "sin señal") + ")." }; }
    const hoy = snap && snap.exists ? snap.data() : undefined;
    if (E.t === "borrado") {
      if (!E.prev || E.prevX) return { err: "De ese borrado no quedó la copia completa: no se puede volver desde acá." };
      if (hoy !== undefined) return { err: "Ese documento ya existe otra vez: no hace falta volverlo." };
      return { tipo: "recrear", E, doc: parse(E.prev), filas: [{ c: E.nom, a: "(borrado)", d: "vuelve como estaba" }], avisos: E.prevP ? ["Lo de sueldos no quedó en el registro: vuelve sin ese dato."] : [] };
    }
    if (E.t !== "cambio") return { err: "Solo se pueden volver cambios de datos o algo borrado." };
    if (hoy === undefined) return { err: "Ese documento ya no existe (lo borraron después): primero volvé el borrado." };
    const fs = reversibles(E).filter((c) => !sel || sel.indexOf(c.k) >= 0);
    if (!fs.length) return { err: "No hay datos de ese cambio que se puedan volver (los cortados o con imágenes no)." };
    const patch = {}, filas = [], avisos = [];
    fs.forEach((c) => {
      const ahora = getPath(hoy, c.k), aPara = c.an ? undefined : conPrivados(parse(c.aj), ahora), despues = c.dn ? undefined : parse(c.dj);
      const hoyL = limpio(ahora, "", 0, { x: "" });
      if (!igualJ(hoyL === undefined ? null : hoyL, despues === undefined ? null : despues)) avisos.push(`«${lbl(c.k)}» cambió después de eso (hoy: ${vTxt(ahora, c.k)}): se pisa.`);
      patch[c.k] = c.an ? "__borrar__" : aPara;
      filas.push({ c: lbl(c.k), a: vTxt(ahora, c.k.split(".").pop()), d: c.an ? "(vacío)" : vTxt(aPara, c.k.split(".").pop()) });
    });
    return { tipo: "campos", E, patch, filas, avisos };
  }
  async function volver(P, op) {
    op = op || {};
    if (!P || P.err) throw new Error((P && P.err) || "nada para volver");
    const E = P.E, FV = firebase.firestore.FieldValue;
    CTX.origen = op.porAsistente ? "asistente" : "revertir"; CTX.rev = E.eid || "";
    let pr;
    try {
      if (P.tipo === "recrear") pr = db().collection(E.c).doc(E.id).set(P.doc);
      else {
        let p = {}; Object.keys(P.patch).forEach((k) => { p[k] = P.patch[k] === "__borrar__" ? FV.delete() : P.patch[k]; });
        if (E.c === "configEquipo" && E.id === "personal" && window.__psGuardia) p = await window.__psGuardia(p);
        else if (E.c === "configEquipo" && window.__cfgGuardia && /^(baremo|precios|cuadrillas|ubicacion)$/.test(E.id)) p = await window.__cfgGuardia(E.id, p);
        CTX.origen = op.porAsistente ? "asistente" : "revertir"; CTX.rev = E.eid || "";
        if (E.c === "avanceObras" && window.fbAvanceCampos) pr = window.fbAvanceCampos(E.id, p);
        else if (E.c === "ordenesTrabajo" && window.fbOtUpdate) pr = window.fbOtUpdate(E.id, p);
        else pr = db().collection(E.c).doc(E.id).update(p);
      }
    } finally { CTX.origen = ""; CTX.rev = ""; }
    await pr;
    try { window.fbAuditar && window.fbAuditar("cambio_revertido", (P.tipo === "recrear" ? "Volvió lo borrado: " : "Volvió el cambio: ") + String(E.r || "").slice(0, 380), { ref: E.id, coleccion: E.c, entrada: E.eid || "", porAsistente: !!op.porAsistente }); } catch (e) { }
    return { ok: true, txt: P.tipo === "recrear" ? "✓ Volvió " + E.nom + "." : "✓ Volvió " + P.filas.length + " dato" + (P.filas.length === 1 ? "" : "s") + " de " + E.nom + "." };
  }

  // ---------------------------------------------------------------- la hoja «📜 Historial de cambios»
  const ORIGEN = { asistente: "✨ asistente", auto: "⚙ automático", cola: "📶 sin señal (se mandó al volver)", revertir: "↶ volvió un cambio", persona: "" };
  const TIPO = { alta: "➕ Alta", cambio: "✏ Cambio", borrado: "🗑 Borrado", fotos: "📷 Fotos", accion: "📌 Acción" };
  const st = { lista: [], hayMas: false, antesDe: 0, abierta: false, f: { tipo: "todos" }, abiertoE: "", conf: null, msg: "", cargando: false, ocupado: false, marcados: {} };
  const iso = (t) => (t ? diaDe(t) : "");
  const desdeIso = (s) => (s ? new Date(s + "T00:00:00").getTime() : 0);
  function filtrada() { return st.lista.filter((E) => coincide(E, Object.assign({}, st.f, { desde: 0, hasta: 0 }))); }
  function campoHtml(c) {
    const A = c.an ? undefined : parse(c.aj), D = c.dn ? undefined : parse(c.dj), k = c.k.split(".").pop();
    let det = "";
    if (Array.isArray(A) || Array.isArray(D)) { const dl = difLista(A, D); det = dl.length ? `<ul class="rc-dl">${dl.slice(0, 20).map((x) => `<li>${esc(x)}</li>`).join("")}${dl.length > 20 ? `<li>… y ${dl.length - 20} más</li>` : ""}</ul>` : ""; }
    return `<div class="rc-campo"><b>${esc(lbl(c.k))}</b>${c.x ? ` <small class="rc-x">(${esc(c.x === "imagen" ? "con imágenes, no se vuelve" : c.x === "cortado" ? "cortado" : c.x)})</small>` : ""}<div><s>${esc(c.ad ? "(no se sabe)" : c.an ? "(vacío)" : vTxt(A, k))}</s> → <b>${esc(c.dn ? "(borrado)" : vTxt(D, k))}</b></div>${det}</div>`;
  }
  function filaHtml(E) {
    const ab = st.abiertoE === E.eid, M = st.marcados[E.eid];
    let h = `<div class="rc-e t-${esc(E.t)}${ab ? " ab" : ""}${M ? " marcada" : ""}" data-rce="${esc(E.eid)}"><button type="button" class="rc-top" data-rc="ver:${esc(E.eid)}"><span class="rc-hora">${esc(fH(E.ts))}</span><span class="rc-quien">${esc(E.nombre || E.usuario || "?")}${E.rol ? ` <small>${esc(E.rol)}</small>` : ""}</span><span class="rc-tipo">${esc(TIPO[E.t] || E.t)}</span><span class="rc-r">${esc(E.r || "")}</span>${ORIGEN[E.origen] ? `<span class="chip rc-or">${esc(ORIGEN[E.origen])}</span>` : ""}</button>`;
    if (ab) {
      h += `<div class="rc-det">${E.c ? `<div class="hint">${esc(COL[E.c] || E.c)}${E.id ? " · " + esc(E.id) : ""}${E.pa ? " · pantalla: " + esc(E.pa) : ""}${E.h ? " · " + esc(E.h) : ""}${E.n > 1 ? " · " + E.n + " escrituras juntas" : ""}${E.sinAntes ? " · sin el «antes» (no estaba en memoria)" : ""}</div>` : ""}`;
      h += arr(E.f).map(campoHtml).join("") + (E.fMas ? `<div class="hint">… y ${E.fMas} datos más</div>` : "");
      if (E.t === "borrado") h += E.prev ? `<details class="rc-prev"><summary>Cómo estaba antes de borrarlo</summary><pre>${esc(JSON.stringify(parse(E.prev), null, 1).slice(0, 4000))}</pre></details>` : `<div class="hint">No quedó la copia completa (${esc(E.prevX || "")}).</div>`;
      if (E.t === "alta" && E.nuevo) h += `<details class="rc-prev"><summary>Lo que se agregó</summary><pre>${esc(JSON.stringify(parse(E.nuevo), null, 1).slice(0, 3000))}</pre></details>`;
      if (E.t === "fotos") h += `<div class="hint">${esc(arr(E.ids).length)} archivo(s). Se ven en el legajo de la obra.</div>`;
      if (st.conf && st.conf.E.eid === E.eid) {
        const P = st.conf;
        h += `<div class="rc-conf" role="status"><b>${P.tipo === "recrear" ? "¿Volver a crear lo borrado?" : "¿Volver estos datos a como estaban?"}</b><ul>${P.filas.map((f) => `<li>${esc(f.c)}: <s>${esc(f.a)}</s> → <b>${esc(f.d)}</b></li>`).join("")}</ul>${P.avisos.map((a) => `<div class="rc-av">⚠ ${esc(a)}</div>`).join("")}<div class="rc-acc"><button type="button" class="btn-primary" data-rc="si" ${st.ocupado ? "disabled" : ""}>Sí, volver</button><button type="button" class="btn-ghost" data-rc="no">Cancelar</button></div></div>`;
      } else if (esAdmin() && puedeVolver(E)) h += `<div class="rc-acc"><button type="button" class="btn-ghost" data-rc="volver:${esc(E.eid)}">↶ ${E.t === "borrado" ? "Volver a crear lo borrado" : "Volver este cambio"}</button></div>`;
      h += `</div>`;
    }
    return h + `</div>`;
  }
  function opcionesCol() { const s = new Set(st.lista.map((E) => E.c).filter((x) => x)); return Array.from(s).sort().map((c) => `<option value="${esc(c)}"${st.f.coleccion === c ? " selected" : ""}>${esc(COL[c] || c)}</option>`).join(""); }
  function opcionesPersona() { const s = new Map(); st.lista.forEach((E) => { if (E.usuario && (!s.has(E.usuario) || (E.nombre && s.get(E.usuario) === E.usuario))) s.set(E.usuario, E.nombre || E.usuario); }); return Array.from(s.entries()).sort((a, b) => String(a[1]).localeCompare(String(b[1]))).map(([e, n]) => `<option value="${esc(e)}"${st.f.persona === e ? " selected" : ""}>${esc(n)}</option>`).join(""); }
  function costoTxt() {
    const c = cc(), pct = Math.round(((c.ops || 0) + (c.aud || 0)) / 200 * 10) / 10;
    return `Hoy este aparato: ${fN(c.ops || 0)} cambios a la base y ${fN(c.aud || 0)} escrituras de registro (${fN(c.cambios || 0)} cambios anotados, ${fN(c.kb || 0)} KB) · ≈ ${fN(pct, 1)} % de las 20.000 escrituras por día del plan gratis.${modoResumen() ? " ⚠ Cerca del cupo: se anotan solo resúmenes." : ""}`;
  }
  function hojaHtml() {
    const l = filtrada();
    let h = `<div class="v7-asa"></div><div class="v7-cab"><div><h3>📜 Historial de cambios</h3><small>Todo lo que se cambió, agregó o borró en la app: quién, cuándo y qué. Nada se vuelve sin «Sí».</small></div><button type="button" class="v7-x" data-rc="x" aria-label="Cerrar">✕</button></div>`;
    h += `<div class="rc-fil"><label>Desde<input type="date" id="rcDesde" value="${esc(iso(st.f.desde))}"></label><label>Hasta<input type="date" id="rcHasta" value="${esc(st.f.hasta ? iso(st.f.hasta - 1) : "")}"></label>
<label>Persona<select id="rcPersona"><option value="">Todas</option>${opcionesPersona()}</select></label>
<label>Tipo<select id="rcTipo">${[["todos", "Todos"], ["alta", "Altas"], ["cambio", "Cambios"], ["borrado", "Borrados"], ["fotos", "Fotos"], ["accion", "Acciones"]].map(([v, t]) => `<option value="${v}"${(st.f.tipo || "todos") === v ? " selected" : ""}>${t}</option>`).join("")}</select></label>
<label>Sección<select id="rcCol"><option value="">Todas</option>${opcionesCol()}</select></label>
<label>Obra<input type="search" id="rcObra" value="${esc(st.f.obra || "")}" placeholder="Nombre o ID"></label>
<label class="rc-txt">Texto<input type="search" id="rcTexto" value="${esc(st.f.texto || "")}" placeholder="Buscar en lo cambiado"></label></div>`;
    if (st.f.alerta) h += `<div class="rc-al" role="status">🛡 ${esc(st.f.alerta)} <button type="button" class="btn-ghost rc-chico" data-rc="sinAlerta">Ver todo</button></div>`;
    h += `<div class="hint rc-costo">${esc(costoTxt())}</div>`;
    h += st.cargando && !st.lista.length ? `<p>Buscando…</p>` : l.length ? `<div class="rc-lista">${l.map(filaHtml).join("")}</div>` : `<div class="rc-vacio">${st.lista.length ? "Nada con esos filtros en lo cargado." : "Todavía no hay cambios registrados en esas fechas."}</div>`;
    h += `<div class="v7-msg" id="rcMsg" role="status">${esc(st.msg)}</div><div class="rc-acc rc-pie">${st.hayMas ? `<button type="button" class="btn-ghost" data-rc="mas" ${st.cargando ? "disabled" : ""}>Cargar más</button>` : ""}<button type="button" class="btn-ghost" data-rc="excel">⬇ Excel</button><button type="button" class="btn-ghost" data-rc="pdf">🖨 PDF</button></div>`;
    return h;
  }
  function pintar() { const v = $("rcOv"); if (!v) return; const c = v.querySelector(".v7-caja"); const top = c.scrollTop; const foco = document.activeElement && document.activeElement.id; c.innerHTML = hojaHtml(); c.scrollTop = top; if (foco && $(foco) && /^rc(Obra|Texto)$/.test(foco)) { const i = $(foco); i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch (e) { } } }
  async function cargar(mas) {
    st.cargando = true; pintar();
    try {
      const P = await pagina({ desde: st.f.desde, hasta: st.f.hasta, antesDe: mas ? st.antesDe : 0, limite: 100 });
      const l = []; P.docs.forEach((x) => expandir(x.id, x.d).forEach((E) => l.push(E)));
      st.lista = mas ? st.lista.concat(l) : l; st.hayMas = P.hayMas; st.antesDe = P.ultimoTs; st.msg = "";
    } catch (e) { st.msg = "⚠ No pude leer el historial" + (e && e.code === "permission-denied" ? " (permiso)" : "") + "."; }
    st.cargando = false; pintar();
  }
  async function abrir(op) {
    op = op || {};
    if (!esAdmin()) return false;
    let v = $("rcOv"); v && v.remove();
    v = document.createElement("div"); v.id = "rcOv"; v.className = "v7-ov v7-arriba"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true"); v.setAttribute("aria-label", "Historial de cambios");
    v.innerHTML = '<div class="v7-caja rc-caja"></div>'; document.body.appendChild(v);
    st.abierta = true; st.f = Object.assign({ tipo: "todos" }, op.f || {}); st.lista = []; st.abiertoE = ""; st.conf = null; st.msg = ""; st.marcados = {};
    await cargar(false);
    if (op.marcar) marcar(op.marcar);
    return true;
  }
  function cerrar() { const v = $("rcOv"); v && v.remove(); st.abierta = false; st.conf = null; }
  function marcar(fn) { st.marcados = {}; st.lista.forEach((E) => { if (fn(E)) st.marcados[E.eid] = 1; }); const p = st.lista.find((E) => st.marcados[E.eid]); if (p) st.abiertoE = p.eid; pintar(); }
  // 5) desde una alerta del Guardián: los cambios que la causaron
  const LISTA_COL = { nomina: ["configEquipo", "personal", "nomina"], vehiculos: ["configEquipo", "personal", "vehiculos"], gastosRef: ["configEquipo", "precios", "gastosRef"], baremoValores: ["configEquipo", "baremo", "baremo"], tareasPropias: ["configEquipo", "baremo", "tareasPropias"], cuadrillas: ["configEquipo", "cuadrillas", "lista"], catalogoCosto: ["catalogoProductos"], catalogo: ["catalogoProductos"], usuarios: ["usuarios"], obras: ["avanceObras"], ordenes: ["ordenesTrabajo"], reservas: ["reservas"], movimientos: ["movimientos"], gastosObra: ["gastosObra"], calculos: ["historialCalculos"] };
  function bajaEn(E, campo) {
    if (E.t === "borrado") return true;
    return arr(E.f).some((c) => { if (campo && c.k !== campo && !(campo === "nomina" && c.k === "lista")) return false; const A = parse(c.aj), D = parse(c.dj); const n = (v) => (Array.isArray(v) ? v.length : v && typeof v == "object" ? Object.keys(v).length : v == null || v === "" ? 0 : 1); return c.dn || n(D) < n(A); });
  }
  function filtroAlerta(a) {
    const m = LISTA_COL[a.lista] || (a.doc ? ["configEquipo", a.doc, a.campo] : []);
    return { coleccion: m[0] || "", docId: m[1] || "", campo: m[2] || "", desde: (+a.baseTs || 0) - 6e4, hasta: 0, tipo: "todos", alerta: a.texto ? "Los cambios que pueden haber causado: " + a.texto : "" };
  }
  async function abrirAlerta(clave) {
    const G = window.__guardian; const a = G && (G.abiertas().find((x) => x.clave === clave) || arr(G.estado && G.estado().ambar).find((x) => x.clave === clave));
    if (!a) return abrir();
    const f = filtroAlerta(a);
    await abrir({ f: { coleccion: f.coleccion, docId: f.docId, desde: f.desde, tipo: "todos", alerta: f.alerta }, marcar: (E) => bajaEn(E, f.campo) });
    return true;
  }
  async function causasAlerta(a) {   // para el asistente y las pruebas
    const f = filtroAlerta(a); const R = await buscar({ coleccion: f.coleccion, docId: f.docId, desde: f.desde }, { max: 100 });
    return R.lista.filter((E) => bajaEn(E, f.campo));
  }
  // excel / pdf de lo que se ve
  function filasExport() { return filtrada().reduce((o, E) => { const base = [fH(E.ts), E.nombre || E.usuario || "", E.rol || "", (ORIGEN[E.origen] || "persona").replace(/^\W+\s*/, ""), TIPO[E.t] ? TIPO[E.t].replace(/^\W+\s*/, "") : E.t, COL[E.c] || E.c || "", E.nom || "", E.r || ""]; const fs = arr(E.f); if (!fs.length) o.push(base.concat(["", "", ""])); fs.forEach((c) => { const k = c.k.split(".").pop(); o.push(base.concat([lbl(c.k), c.an ? "(vacío)" : vTxt(parse(c.aj), k), c.dn ? "(borrado)" : vTxt(parse(c.dj), k)])); }); return o; }, []); }
  const COLS = ["Fecha", "Quién", "Rol", "Origen", "Tipo", "Sección", "Documento", "Resumen", "Dato", "Antes", "Después"];
  function excel() {
    const filas = filasExport();
    const e = { titulo: "Historial de cambios", subtitulo: "Guardián de datos", fecha: diaDe(Date.now()), tipoTxt: "Historial_cambios_" + diaDe(Date.now()), tiles: [{ l: "Cambios", n: filtrada().length }], avisos: [], secciones: [{ tipo: "tabla", tit: "Cambios", grupo: "Historial", etiqueta: "Historial", etiquetaCol: "Historial", cols: COLS, filas }] };
    try { if (typeof window.__infExcel == "function") { window.__rcUltimoExcel = e; return window.__infExcel(e); } } catch (er) { }
    const csv = [COLS].concat(filas).map((r) => r.map((x) => '"' + String(x == null ? "" : x).replace(/"/g, '""') + '"').join(";")).join("\n");
    window.__rcUltimoExcel = e;
    try { if (typeof descargarArchivo == "function") descargarArchivo("﻿" + csv, "Historial_cambios.csv", "text/csv;charset=utf-8;"); } catch (er) { }
  }
  function pdf() {
    const l = filtrada();
    const html = `<h2>Historial de cambios</h2><p>${esc(l.length)} cambios · ${esc(fH(Date.now()))}</p><table class="tabla"><thead><tr><th>Fecha</th><th>Quién</th><th>Qué</th><th>Antes → después</th></tr></thead><tbody>${l.map((E) => `<tr><td>${esc(fH(E.ts))}</td><td>${esc(E.nombre || E.usuario || "")}${ORIGEN[E.origen] ? "<br><small>" + esc(ORIGEN[E.origen]) + "</small>" : ""}</td><td>${esc(E.r || "")}</td><td>${arr(E.f).slice(0, 8).map((c) => { const k = c.k.split(".").pop(); return esc(lbl(c.k) + ": " + (c.an ? "(vacío)" : vTxt(parse(c.aj), k)) + " → " + (c.dn ? "(borrado)" : vTxt(parse(c.dj), k))); }).join("<br>")}</td></tr>`).join("")}</tbody></table>`;
    try { window.abrirHojaImpresion("Historial de cambios", html, "Guardián de datos"); } catch (e) { st.msg = "⚠ No pude armar la hoja."; pintar(); }
  }
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t || !st.abierta || !t.closest || !t.closest("#rcOv")) return;
    if (t.id === "rcDesde") { st.f.desde = desdeIso(t.value); cargar(false); }
    else if (t.id === "rcHasta") { st.f.hasta = t.value ? desdeIso(t.value) + 864e5 : 0; cargar(false); }
    else if (t.id === "rcPersona") { st.f.persona = t.value; pintar(); }
    else if (t.id === "rcTipo") { st.f.tipo = t.value; pintar(); }
    else if (t.id === "rcCol") { st.f.coleccion = t.value; st.f.docId = ""; pintar(); }
  });
  let tmIn = null;
  document.addEventListener("input", (e) => { const t = e.target; if (!t || !/^rc(Obra|Texto)$/.test(t.id || "")) return; clearTimeout(tmIn); tmIn = setTimeout(() => { st.f[t.id === "rcObra" ? "obra" : "texto"] = t.value; pintar(); }, 250); });
  document.addEventListener("click", async (e) => {
    const t = e.target;
    const b = t && t.closest && t.closest("[data-rc]"); if (!b) return;
    const ov = $("rcOv"), a = b.dataset.rc, k = a.split(":")[0], x = a.slice(k.length + 1);
    if (k === "abrir") { e.preventDefault(); return abrir(); }
    if (k === "alerta") { e.preventDefault(); return abrirAlerta(x); }
    if (!ov || !ov.contains(b)) return;
    e.preventDefault();
    if (k === "x") return cerrar();
    if (k === "ver") { st.abiertoE = st.abiertoE === x ? "" : x; st.conf = null; return pintar(); }
    if (k === "mas") return cargar(true);
    if (k === "sinAlerta") { st.f = { tipo: "todos" }; st.marcados = {}; return cargar(false); }
    if (k === "excel") return excel();
    if (k === "pdf") return pdf();
    if (k === "no") { st.conf = null; return pintar(); }
    if (k === "volver") { const E = st.lista.find((q) => q.eid === x); st.msg = "Leyendo cómo está hoy…"; pintar(); const P = await planVolver(E); if (P.err) { st.msg = "⚠ " + P.err; st.conf = null; } else { st.conf = P; st.msg = ""; } return pintar(); }
    if (k === "si" && st.conf && !st.ocupado) {
      st.ocupado = true; st.msg = "Guardando…"; pintar();
      try { const r = await volver(st.conf); st.msg = r.txt; st.conf = null; }
      catch (er) { st.msg = "⚠ " + ((er && er.message) || er); }
      st.ocupado = false; pintar();
      setTimeout(() => { tic(true).then(() => { if (st.abierta) cargar(false); }); }, 400);
    }
  });
  document.addEventListener("click", (e) => { const ov = $("rcOv"); if (ov && e.target === ov) cerrar(); });
  // en el Guardián: el botón de arriba (lo pone la hoja del Guardián)
  const botonGuardian = () => (esAdmin() ? `<div class="gd-acc rc-gdb"><button type="button" class="btn-primary" data-rc="abrir">📜 Historial de cambios</button></div><div class="hint rc-costo">Cada cambio queda anotado (quién, cuándo, antes → después). ${esc(costoTxt())}</div>` : "");

  // para el asistente: corto, sin imágenes
  function paraIa(E) {
    const o = { id: E.eid, cuando: fH(E.ts), quien: E.nombre || E.usuario, rol: E.rol, origen: E.origen, tipo: E.t, seccion: COL[E.c] || E.c || "", documento: E.nom || "", resumen: E.r, sePuedeVolver: !!(puedeVolver(E)) };
    if (E.obn || E.ob) o.obra = E.obn || E.ob;
    if (E.pa) o.pantalla = E.pa;
    const fs = arr(E.f).slice(0, 12).map((c) => { const k = c.k.split(".").pop(); return { dato: lbl(c.k), antes: c.an ? "(vacío)" : vTxt(parse(c.aj), k), despues: c.dn ? "(borrado)" : vTxt(parse(c.dj), k) }; });
    if (fs.length) o.datos = fs;
    return o;
  }
  async function entrada(eid) {   // una entrada por su id (doc#i)
    const [aid, i] = String(eid || "").split("#"); if (!aid) return null;
    const enL = st.lista.find((E) => E.eid === eid); if (enL) return enL;
    try { const s = await db().collection("auditoria").doc(aid).get(); if (!s.exists) return null; return expandir(aid, s.data()).find((E) => E.eid === eid) || null; } catch (e) { return null; }
  }

  window.__regCambios = {
    flush: () => tic(true), pendientes: () => BUF.size, ultimos: () => ULT.slice(), cuenta: () => Object.assign({}, cc()), modoResumen, abrir, cerrar, abrirAlerta, causasAlerta, buscar, pagina, expandir, coincide,
    planVolver, volver, puedeVolver, entrada, paraIa, botonGuardian, filtroAlerta, difLista, resumenDe, limpio, excel, pdf, real: () => REAL,
    estado: () => ({ abierta: st.abierta, n: st.lista.length, f: Object.assign({}, st.f), marcados: Object.keys(st.marcados), conf: st.conf ? { tipo: st.conf.tipo, filas: st.conf.filas, avisos: st.conf.avisos } : null, msg: st.msg, buf: BUF.size, ops: CNT.ops, sinAntes: CNT.sinAntes, regQ: Array.from(QREG.keys()), regD: DREG.size })
  };
})();
