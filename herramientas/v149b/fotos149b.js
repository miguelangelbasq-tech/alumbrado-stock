(function () {
  "use strict";
  // v149b · «Los chicos no pueden enviar las fotos y se les pierden» (Ángel, 12/11/2026) + «que se descarguen en el celu».
  //  1) BANDEJA (window.__fotoBandeja): cada foto que pasa por guardarFotoObra (Modo obra, cámara de la barra, Mis tareas,
  //     seguridad, legajo) queda copiada en el celu (IndexedDB «ema-fotos-crudas») ANTES de intentar subirla, con su número de
  //     foto (adjId) fijado de entrada. La copia se borra recién cuando la ficha está en la base (no queda en la cola
  //     «ema-fotos-cola») y la orden ya la tiene anotada (no queda en la cola de cambios). Si algo falla, la foto no se
  //     descarta nunca: se vuelve a probar sola con espera creciente (30 s → 10 min), al volver la señal, al abrir la app y al
  //     volver a la app. Para quien llamó, un error es «quedó en el celu» (enEspera con el mismo adjId), no «sacala de nuevo».
  //  2) MOTIVO REAL (window.__senalReal): cuando hay cosas esperando con internet, la app pregunta a la base por su cuenta
  //     (REST: 1 lectura pública + 1 escritura en tu presencia) y al servidor de fotos: sin señal de verdad · la base llegó al
  //     cupo gratis del día (429 / RESOURCE_EXHAUSTED) · permiso · sesión vencida · servidor de fotos caído. Con el cupo de
  //     lecturas agotado, la app deja de golpear la base (disableNetwork) hasta las 5 de la mañana (medianoche del Pacífico),
  //     probando cada 30 min por si se levantó antes; las fotos y los cambios quedan en el celu y se mandan solos.
  //  3) COPIA EN EL CELU: en la app de Android (plugin Filesystem) cada foto con su marca se guarda también en
  //     Documentos › EMA › Fotos › AAAA-MM-DD sin preguntar (Perfil › «Guardar copia de las fotos en el celu», de entrada Sí
  //     para la cuadrilla). En el navegador no se puede guardar sola: «⬇ Bajar mis fotos de hoy» arma un ZIP.
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const Lk = (s) => String(s || "").replace(/[~*\/\[\].`]/g, "_").slice(0, 120) || "_";
  const LS = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { } } };
  const J = (k, d) => { try { const t = localStorage.getItem(k); return t == null ? d : JSON.parse(t); } catch (e) { return d; } };
  const pad = (n) => String(n).padStart(2, "0");
  const hhmm = (ts) => { const d = new Date(ts); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const hoyISO = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const conTope = (p, ms, txt) => Promise.race([p, new Promise((_, m) => setTimeout(() => m(Object.assign(new Error(txt || "tardó demasiado"), { code: "lento" })), ms))]);
  const P = () => (window.Capacitor && window.Capacitor.Plugins) || {};
  const enApp = () => !!(window.__cargador || (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()));
  const yo = () => { try { return (window.PERMISOS && PERMISOS.yo && PERMISOS.yo()) || {}; } catch (e) { return {}; } };
  const esCrew = () => { try { if (window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()) return true; } catch (e) { } return /^(cuadrilla|operario)$/.test(String(yo().rol || "")); };
  const ots = () => { try { return Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []; } catch (e) { return []; } };
  const uid = () => (window.__fbUser && window.__fbUser.uid) || "";

  // =========================================================================================== motivo real
  const PROY = "alumbrado-stock", REST = "https://firestore.googleapis.com/v1/projects/" + PROY + "/databases/(default)/documents/";
  const WORKER = "https://ema-fotos.mdiaz-60f.workers.dev";
  const SR = Object.assign({ motivo: "", det: "", ts: 0, hasta: 0, red: false }, J("ema.senal", {}) || {}, { sondando: false, ult: 0 });
  const guardarSR = () => LS.set("ema.senal", JSON.stringify({ motivo: SR.motivo, det: SR.det, ts: SR.ts, hasta: SR.hasta, red: SR.red }));
  SR.red = false;   // en una página nueva la base arranca con la red prendida
  if (SR.motivo === "cupo" && SR.hasta && Date.now() > SR.hasta) { SR.motivo = ""; guardarSR(); }
  // la medianoche del Pacífico (cuando Firebase renueva el cupo gratis): 04:00 o 05:00 de Argentina
  function proxReinicio() {
    try {
      const f = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", minute: "numeric", hour12: false });
      let t = Math.ceil(Date.now() / 9e5) * 9e5;
      for (let i = 0; i < 200; i++, t += 9e5) { const p = f.formatToParts(new Date(t)), h = +(p.find((x) => x.type === "hour") || {}).value % 24, m = +(p.find((x) => x.type === "minute") || {}).value; if (h === 0 && m < 15) return t + 5 * 6e4; }
    } catch (e) { }
    const d = new Date(); d.setHours(5, 5, 0, 0); if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1); return d.getTime();
  }
  async function pedir(url, tk, metodo, cuerpo, ms) {
    const c = typeof AbortController == "function" ? new AbortController() : null, t = setTimeout(() => c && c.abort(), ms || 9000);
    try {
      const h = {}; if (tk) h.Authorization = "Bearer " + tk; if (cuerpo) h["Content-Type"] = "application/json";
      const r = await fetch(url, { method: metodo || "GET", headers: h, body: cuerpo ? JSON.stringify(cuerpo) : undefined, signal: c ? c.signal : undefined, cache: "no-store" });
      let txt = ""; try { txt = await r.text(); } catch (e) { }
      return { status: r.status, txt };
    } finally { clearTimeout(t); }
  }
  const esCupo = (r) => r && (r.status === 429 || /RESOURCE_EXHAUSTED|[Qq]uota/.test(r.txt || ""));
  function ponerMotivo(m, det) {
    const antes = SR.motivo + "|" + SR.det;
    SR.motivo = m; SR.det = det || ""; SR.ts = Date.now();
    if (m === "cupo") { SR.hasta = proxReinicio(); if (det === "lecturas") redApagada(true); }
    else { SR.hasta = 0; if (SR.red) redApagada(false); }
    guardarSR();
    if (antes !== SR.motivo + "|" + SR.det) refrescarTodo();
    return SR;
  }
  // con el cupo de lecturas agotado, cada pedido negado igual cuenta: la app deja de pedir hasta que se renueve
  function redApagada(apagar) {
    try {
      const db = firebase.firestore();
      if (apagar && !SR.red && typeof db.disableNetwork == "function") { SR.red = true; db.disableNetwork().catch(() => { }); console.warn("[fotosSeguras] cupo de la base agotado: sin pedidos a la base hasta las " + hhmm(SR.hasta)); }
      else if (!apagar && SR.red && typeof db.enableNetwork == "function") { SR.red = false; db.enableNetwork().catch(() => { }); }
      guardarSR();
    } catch (e) { }
  }
  async function sondear(forzar) {
    if (SR.sondando) return SR;
    if (!forzar && Date.now() - SR.ult < (SR.motivo === "cupo" ? 30 * 6e4 : 2 * 6e4)) return SR;
    SR.sondando = true; SR.ult = Date.now();
    try {
      if (navigator.onLine === false) return ponerMotivo("sinSenal");
      let tk = ""; try { const u = firebase.auth().currentUser; tk = u ? await conTope(u.getIdToken(), 8000) : ""; } catch (e) { tk = ""; }
      let r = null; try { r = await pedir(REST + "configEquipo/alias", tk, "GET", null, 9000); } catch (e) { return ponerMotivo("sinSenal", "la base no responde"); }
      if (esCupo(r)) return ponerMotivo("cupo", "lecturas");
      if (r.status === 401 && tk) return ponerMotivo("sesion");
      if (tk && uid()) {
        let w = null; try { w = await pedir(REST + "presencia/" + uid() + "?updateMask.fieldPaths=sonda", tk, "PATCH", { fields: { sonda: { integerValue: String(Date.now()) } } }, 9000); } catch (e) { w = null; }
        if (esCupo(w)) return ponerMotivo("cupo", "escrituras");
        if (w && w.status === 401) return ponerMotivo("sesion");
      }
      let nube = true; try { const s = await pedir(WORKER + "/salud", "", "GET", null, 7000); nube = s.status >= 200 && s.status < 300; } catch (e) { nube = false; }
      if (B.permisos() > 0) return ponerMotivo("permiso");
      return ponerMotivo(nube ? "ok" : "nube");
    } finally { SR.sondando = false; }
  }
  const NOMBRE = { sinSenal: "Sin señal", cupo: "La base no acepta más por hoy", permiso: "Falta permiso", sesion: "Hay que volver a entrar", nube: "Subiendo (el servidor de fotos no responde)", ok: "Subiendo", "": "Fotos por subir" };
  function motivo() {
    if (navigator.onLine === false) return "sinSenal";
    if (SR.motivo === "cupo" && Date.now() < SR.hasta) return "cupo";
    if (B.permisos() > 0) return "permiso";
    return Date.now() - SR.ts < 10 * 6e4 ? SR.motivo : "";
  }
  function explicacion(m) {
    m = m == null ? motivo() : m;
    if (m === "cupo") return `La base de datos llegó al límite gratis de hoy (${SR.det === "lecturas" ? "lecturas" : "cambios"}) y no acepta más hasta las ${hhmm(SR.hasta)}. Tus fotos y cambios están guardados en el celu y se mandan solos a esa hora.`;
    if (m === "permiso") return "Tu usuario no tiene permiso para guardar en esta orden (no está vinculado a tu nombre o no figurás en la orden): avisá a la oficina. Las fotos quedan en el celu y se suben solas cuando lo arreglen.";
    if (m === "sesion") return "Se venció tu sesión: cerrá sesión y volvé a entrar. Las fotos quedan en el celu.";
    if (m === "nube") return "El servidor de fotos no responde: las fotos van directo a la base (tardan un poco más). No hace falta hacer nada.";
    if (m === "sinSenal") return "No hay señal: todo queda guardado en el celu y se manda solo cuando vuelva.";
    if (m === "ok") return "Hay señal y la base anda: se están mandando.";
    return "Se mandan solas apenas se pueda.";
  }
  window.__senalReal = {
    sondear, motivo, explicacion, nombre: (m) => NOMBRE[m == null ? motivo() : m] || NOMBRE[""],
    pausa: () => SR.motivo === "cupo" && Date.now() < SR.hasta,
    estado: () => ({ motivo: motivo(), guardado: SR.motivo, det: SR.det, ts: SR.ts, hasta: SR.hasta, red: SR.red }),
    textoCola(n, neg) {
      const m = motivo(), f = n === 1 ? "foto" : "fotos";
      if (m === "cupo") return `🛑 <b>${n}</b> ${f} esperando: <b>la base no acepta más por hoy</b> <small>se suben solas a las ${hhmm(SR.hasta)}</small>`;
      if (neg || m === "permiso") return `🔒 <b>${neg || n}</b> ${(neg || n) === 1 ? "foto esperando" : "fotos esperando"} que la oficina arregle el permiso <small>se suben solas · tocá para probar ya</small>`;
      if (m === "sesion") return `🔑 <b>${n}</b> ${f} esperando: <b>volvé a entrar a la app</b> <small>quedan en el celu</small>`;
      if (m === "ok" || m === "nube") return `📤 <b>${n}</b> ${f} subiendo <small>con señal: se mandan solas</small>`;
      return "";
    },
    avisoFoto() { const m = motivo(); return m === "cupo" ? "🛑 La base no acepta más por hoy: la foto quedó guardada en el celu y se sube sola a las " + hhmm(SR.hasta) + "." : m === "ok" || m === "nube" ? "📤 La base está lenta: la foto quedó guardada en el celu y se sube sola." : ""; },
    supHallazgos() {
      const l = [], H = (g, t, s) => ({ g, cat: "Equipo", t, s: s || "", ir: null, obraId: "" });
      if (motivo() === "cupo") l.push(H("rojo", "La base llegó al cupo gratis de hoy (" + (SR.det || "cambios") + ")", `Detectado a las ${hhmm(SR.ts)}. Hasta las ${hhmm(SR.hasta)} la base no acepta más: los cambios y las fotos de todos quedan en cada celu y se mandan solos a esa hora. Para que no se repita: bajar las lecturas (menú › Versión) o pasar al plan Blaze.`));
      try {
        const pr = window.__presenciaDatos, ahora = Date.now(), msDe = (t) => (t && t.toMillis ? t.toMillis() : t && t.seconds ? t.seconds * 1000 : Number(t) || 0);
        const con = pr && typeof pr == "object" ? Object.keys(pr).map((k) => pr[k]).filter((p) => p && p.disp && +p.disp.fotosPend > 0 && ahora - msDe(p.ts || p.local) < 2 * 864e5) : [];
        if (con.length) {
          const MT = { cupo: "cupo de la base", permiso: "sin permiso", sesion: "sesión vencida", sinSenal: "sin señal", nube: "servidor de fotos", ok: "subiendo" };
          const tot = con.reduce((s, p) => s + (+p.disp.fotosPend || 0), 0), perm = con.some((p) => p.disp.colaMotivo === "permiso");
          l.push(H(perm ? "rojo" : "ambar", `${tot} foto(s) esperando en ${con.length} celular(es)`, con.slice(0, 8).map((p) => `${p.nombre || p.usuario || "?"}: ${p.disp.fotosPend}${p.disp.colaMotivo ? " (" + (MT[p.disp.colaMotivo] || p.disp.colaMotivo) + ")" : ""}`).join(" · ") + ". Están guardadas en cada celu y se suben solas; si dice «sin permiso», revisá Usuarios › «🔧 Arreglar vínculos»."));
        }
      } catch (e) { }
      return l;
    }
  };
  // lo que viaja en el latido de presencia (lo ve el Supervisor de la oficina)
  window.__dispExtra = () => ({ fotosPend: B.cantidad(), colaMotivo: B.cantidad() ? motivo() || "" : "", colaDesde: B.desde() || 0 });

  // =========================================================================================== bandeja
  const DBN = "ema-fotos-crudas", ST = "f", MEM = {}, VUELO = {};
  let dbp = null, idbMal = "", n0 = 0, cola = { keys: {}, neg: {}, n: 0, sinB: [] }, ultOk = 0, hubo = false;
  const abrirDb = () => dbp || (dbp = new Promise((ok, mal) => { try { const r = indexedDB.open(DBN, 1); r.onupgradeneeded = () => r.result.createObjectStore(ST, { keyPath: "id" }); r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error); } catch (e) { mal(e); } }));
  const tx = (modo, fn) => abrirDb().then((db) => new Promise((ok, mal) => { const q = db.transaction(ST, modo), r = fn(q.objectStore(ST)); q.oncomplete = () => ok(r && r.result); q.onerror = () => mal(q.error); q.onabort = () => mal(q.error); }));
  function poner(rec) {
    MEM[rec.id] = rec; hubo = true;
    return tx("readwrite", (s) => s.put(rec)).then(() => { idbMal = ""; return true; }, (e) => { idbMal = String((e && (e.name || e.message)) || e); console.warn("[fotosSeguras] no se pudo copiar en el celu:", idbMal); return false; });
  }
  function sacar(id) { delete MEM[id]; return tx("readwrite", (s) => s.delete(id)).catch(() => null); }
  let cargado = false;
  async function cargar() {
    if (cargado) return; cargado = true;
    try { const l = (await tx("readonly", (s) => s.getAll())) || []; l.forEach((r) => { if (r && r.id && !MEM[r.id]) { if (!r.f) return; if (r.fase === "subiendo") r.fase = r.adjIdOk ? "subida" : "nueva"; MEM[r.id] = r; } }); } catch (e) { }
  }
  const lista = () => Object.keys(MEM).map((k) => MEM[k]).filter((r) => r && r.uid === uid() || (r && !r.uid)).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const PROPIAS = {};   // las que Modo obra puso en esta sesión: las sube su propia fila (no se intentan dos veces)
  const nuevoAdj = () => { try { return firebase.firestore().collection("adjuntos").doc().id; } catch (e) { return "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); } };
  const espera = (n) => [30, 60, 120, 300, 600][Math.min(4, Math.max(0, n - 1))] * 1000;
  const limpiaMeta = (m) => { const o = {}; Object.keys(m || {}).forEach((k) => { const v = m[k]; if (v == null || typeof v == "function") return; o[k] = typeof v == "object" ? JSON.parse(JSON.stringify(v)) : v; }); return o; };
  function motivoDe(er) {
    const c = String((er && er.code) || ""), m = String((er && er.message) || er || "");
    if (/permission/.test(c)) return "permiso";
    if (/resource-exhausted/.test(c) || /quota/i.test(m)) return "cupo";
    if (window.__campoGrande && window.__campoGrande(er)) return "llena";
    if (navigator.onLine === false || /unavailable|network|sin señal|offline/i.test(c + " " + m)) return "sinSenal";
    if (/lento|deadline|abort/i.test(c + " " + m)) return "lento";
    if (/imagen|image|leer/i.test(m)) return "imagen";
    return "error";
  }
  const MOTXT = { permiso: "sin permiso", cupo: "la base no acepta más hoy", llena: "la orden está llena", sinSenal: "sin señal", lento: "la señal está lenta", imagen: "el celu no pudo procesarla (se reintenta)", error: "se reintenta sola", sesion: "volvé a entrar" };

  // ---- la envoltura: TODAS las fotos de obra pasan por acá (es la de más afuera)
  function envolver() {
    const o = window.guardarFotoObra;
    if (typeof o != "function" || !o.__rapida || !o.__sello) return false;
    if (o.__bandeja) return true;
    const n = async function (file, meta) {
      meta = Object.assign({}, meta || {});
      if (!file || meta.__sinBandeja || !(file instanceof Blob) || !/^image\//.test(file.type || "image/")) return o.apply(this, arguments);
      await cargar();
      let rec = meta.__bandejaId ? MEM[meta.__bandejaId] : null;
      const id = meta.__bandejaId || "b_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      if (!rec) {
        rec = { id, f: file, meta: limpiaMeta(meta), otId: meta.otId || "", k: meta.k || "", tarea: meta.tarea || "", cat: meta.cat || "", num: meta.num != null ? String(meta.num) : "", por: meta.por || "", plaza: meta.plazaNombre || "", ts: Date.now(), uid: uid(), adjId: meta.__adjId || nuevoAdj(), fase: "nueva", intentos: 0, campo: false, origen: meta.origen || "" };
        delete rec.meta.__bandejaId; delete rec.meta.__adjId; delete rec.meta.__reintento;
      }
      if (!rec.adjId) rec.adjId = meta.__adjId || nuevoAdj();
      rec.fase = "subiendo"; rec.ultIntento = Date.now();
      await poner(rec); refrescar();
      meta.__bandejaId = rec.id; meta.__adjId = rec.adjId;
      const reintento = !!meta.__reintento; delete meta.__reintento;
      const p = o.call(this, file, meta);
      VUELO[rec.id] = { p, ts: Date.now() };
      p.then(() => { delete VUELO[rec.id]; }, () => { delete VUELO[rec.id]; });
      try {
        const r = await conTope(p, 150000, "la foto tardó demasiado en guardarse");
        rec.fase = "subida"; rec.adjIdOk = true; rec.motivo = ""; rec.mini = (r && r.mini) || ""; if (!reintento) rec.campo = true;
        poner(rec); programarVer(1500);
        if (reintento) await anotarEnOrden(rec, r && r.mini);
        return r && r.adjId ? r : Object.assign({}, r || {}, { adjId: rec.adjId });
      } catch (er) {
        if (er && er.enEspera && er.adjId) {   // la ficha quedó en la cola del celu (permiso o señal): la cola la sube
          rec.fase = "subida"; rec.adjIdOk = true; rec.espera = true; rec.motivo = /permission/.test(String(er.code || "")) ? "permiso" : "sinSenal"; if (!reintento) rec.campo = true;
          poner(rec); programarVer(1500);
          if (reintento) await anotarEnOrden(rec, "");
          throw er;
        }
        rec.fase = "error"; rec.intentos = (rec.intentos || 0) + 1; rec.motivo = motivoDe(er); rec.err = String((er && (er.code || er.message)) || er).slice(0, 160); rec.prox = Date.now() + espera(rec.intentos);
        if (!reintento) rec.campo = true;   // quien llamó anota la foto en la orden (con este mismo número)
        poner(rec); programar(); firma = ""; refrescar();
        console.warn("[fotosSeguras] la foto quedó en el celu y se reintenta:", rec.err);
        if (reintento) throw er;
        throw Object.assign(new Error("La foto quedó guardada en el celu y se sube sola"), { enEspera: true, adjId: rec.adjId, bandeja: true, code: (er && er.code) || "", causa: er, motivo: rec.motivo });
      }
    };
    window.__heredar && window.__heredar(n, o); n.__bandeja = 1; window.guardarFotoObra = n; return true;
  }
  setInterval(envolver, 700); envolver();

  // la foto se reintentó después (o se recuperó al abrir la app): anotarla en su orden si quien la sacó no llegó a hacerlo
  async function anotarEnOrden(rec, mini) {
    if (!rec.otId) return;
    const o = ots().find((x) => x && x.id === rec.otId);
    const k = "campo.fotos." + Lk(rec.adjId), f = (o && o.campo && o.campo.fotos) || {};
    let patch = null;
    if (!rec.campo && !f[Lk(rec.adjId)]) patch = { [k]: Object.assign({ por: rec.por, ts: rec.ts, cat: rec.cat || "otra", num: rec.num || "", mini: mini || "" }, rec.k ? { k: rec.k, tarea: rec.tarea } : {}) };
    else if (mini && f[Lk(rec.adjId)] && !f[Lk(rec.adjId)].mini) patch = { [k + ".mini"]: mini };
    rec.campo = true; poner(rec);
    if (!patch || (o && (o.estado === "Terminada" || o.estado === "Anulada"))) return;
    try { const ok = typeof window.mtCampoGuardar == "function" && window.mtCampoGuardar(rec.otId, patch); if (!ok && typeof window.fbOtUpdate == "function") await Promise.resolve(window.fbOtUpdate(rec.otId, patch)).catch(() => { }); } catch (e) { }
  }

  // ---- reintentar: de a una, sin trabar la cámara (como la v148), con espera creciente
  let ultToque = 0, timer = null, corriendo = false;
  document.addEventListener("pointerdown", () => { ultToque = Date.now(); }, true);
  const libre = () => document.hidden || (!$("emaCam") && Date.now() - ultToque > 1500);
  function programar(ms) { clearTimeout(timer); timer = setTimeout(procesar, ms == null ? 4000 : ms); }
  async function procesar(forzar) {
    clearTimeout(timer); timer = null;
    if (corriendo) return programar(3000);
    await cargar();
    const l = lista().filter((r) => r.fase === "nueva" || r.fase === "error");
    if (!l.length) return;
    if (!window.__fbUser || typeof window.guardarFotoObra != "function" || !window.guardarFotoObra.__bandeja) return programar(5000);
    if (!forzar && !libre()) return programar(1500);
    if (!forzar && window.__senalReal.pausa()) return programar(Math.max(6e4, Math.min(30 * 6e4, SR.hasta - Date.now())));
    const ahora = Date.now(), r = l.find((x) => (forzar || !x.prox || x.prox <= ahora) && (!VUELO[x.id] || ahora - VUELO[x.id].ts > 5 * 6e4));
    if (!r) { const px = Math.min.apply(null, l.map((x) => x.prox || ahora + 3e4)); return programar(Math.max(2000, px - ahora)); }
    corriendo = true;
    try { await window.guardarFotoObra(r.f, Object.assign({}, r.meta, { __bandejaId: r.id, __adjId: r.adjId, __reintento: true })); }
    catch (e) { }
    finally { corriendo = false; refrescar(); programar(1200); }
  }

  // ---- ¿ya está en la base? (la ficha no está en la cola de fotos y la orden ya la tiene)
  function campoPend(adj) {
    const key = "campo.fotos." + Lk(adj), en = (l) => (Array.isArray(l) ? l : []).some((x) => x && x.patch && Object.keys(x.patch).some((p) => p === key || p.indexOf(key + ".") === 0));
    return en(J("ema.campo.cola", [])) || en(J("ema.campo.llenas", []));
  }
  let verT = null;
  function programarVer(ms) { clearTimeout(verT); verT = setTimeout(verificar, ms || 15000); }
  async function leerCola() {
    const r = { keys: {}, neg: {}, n: 0, sinB: [] };
    try { const t = window.__fotosSinSenal ? await window.__fotosSinSenal.todos() : []; t.forEach((x) => { if (!x || x.huerfana) return; r.keys[x.k] = x; if (x.neg) r.neg[x.k] = 1; if (x.col === "adjuntos") r.n++; }); } catch (e) { }
    return r;
  }
  async function verificar() {
    clearTimeout(verT); verT = null;
    await cargar();
    cola = await leerCola();
    const bAdj = {};
    lista().forEach((r) => {
      bAdj["adjuntos/" + r.adjId] = 1;
      if (r.fase !== "subida") return;
      const enCola = !!cola.keys["adjuntos/" + r.adjId];
      r.motivo = enCola ? (cola.neg["adjuntos/" + r.adjId] ? "permiso" : r.motivo === "permiso" ? "sinSenal" : r.motivo || "sinSenal") : r.motivo;
      if (!enCola && !campoPend(r.adjId) && r.campo) {
        sacar(r.id); ultOk = Date.now();
        const sb = document.querySelector('#cdHoja .cd-sube[data-pe="' + r.id + '"]'); if (sb) sb.textContent = "✓ Subida";
      }
    });
    cola.sinB = Object.keys(cola.keys).filter((k) => /^adjuntos\//.test(k) && !bAdj[k]).map((k) => cola.keys[k]);
    refrescar();
    if (lista().length || cola.n) programarVer(15000);
  }
  // contador
  const cantidad = () => lista().length + (cola.sinB || []).length;
  let firma = "";
  function refrescar() {
    const n = cantidad(), m = n ? motivo() : "", f = n + "|" + m + "|" + (Date.now() - ultOk < 10 * 6e4 ? 1 : 0);
    if (f === firma) return; firma = f;
    refrescarTodo();
  }
  function refrescarTodo() {
    try { window.__fotosSinSenal && window.__fotosSinSenal.contar(); } catch (e) { }
    try { const c = window.__cuadrillaDia; if (c && c.on && c.on() && /^(hoy|obra|senal|fin)$/.test((c.estado() || {}).pant || "")) c.pintar(); } catch (e) { }
    pintarCam();
  }
  const B = {
    cantidad, permisos: () => lista().filter((r) => r.motivo === "permiso").length + Object.keys(cola.neg || {}).filter((k) => /^adjuntos\//.test(k)).length,
    desde: () => { const l = lista(); return l.length ? l[0].ts : 0; },
    items() {
      const l = lista().map((r) => ({ id: r.id, mini: miniDe(r), obra: r.plaza || (r.meta && r.meta.plazaNombre) || "", num: r.num || "", tarea: r.tarea || (window.catFotoTxt ? window.catFotoTxt(r.cat) : r.cat) || "Foto", ts: r.ts, fase: r.fase, motivo: r.fase === "subida" && !r.motivo ? "subiendo" : r.motivo || "", err: r.err || "", intentos: r.intentos || 0 }));
      (cola.sinB || []).forEach((x) => { const d = x.data || {}; l.push({ id: x.k, mini: d.mini || "", obra: d.plazaNombre || "", num: d.num || "", tarea: d.tarea || d.titulo || "Foto", ts: x.ts || 0, fase: "subida", motivo: x.neg ? "permiso" : "sinSenal" }); });
      return l;
    }
  };
  const minis = {};
  function miniDe(r) { if (minis[r.id]) return minis[r.id]; try { return (minis[r.id] = URL.createObjectURL(r.f)); } catch (e) { return ""; } }
  const ultTodas = () => !cantidad() && ultOk && Date.now() - ultOk < 10 * 6e4;

  // HTML para las pantallas de la cuadrilla (lo usa cuadrillaDia)
  function tarjeta(q) {
    const n = cantidad(), nC = (q && q.nC) || 0;
    if (!n && !nC && !(q && q.off)) return ultTodas() ? '<div class="fb-ok" role="status">✓ Todas las fotos subidas</div>' : "";
    return null;   // la arma cuadrillaDia con titulo()
  }
  function titulo(q) { if ((q && q.off) || navigator.onLine === false) return "Sin señal"; const m = motivo(); return NOMBRE[m] || NOMBRE[""]; }
  function listaHtml() {
    const l = B.items();
    if (!l.length) return ultTodas() ? '<div class="fb-ok">✓ Todas las fotos subidas</div>' : '<div class="cd-vacio">No hay fotos esperando.</div>';
    return l.map((x) => `<div class="cd-rw fb-it"><span class="cd-mini">${x.mini ? `<img src="${esc(x.mini)}" alt="">` : ""}</span><div class="cd-tx"><b>${esc([x.obra, x.num || x.tarea].filter(Boolean).join(" · ") || "Foto")}</b><small>Sacada ${esc(hhmm(x.ts || Date.now()))} · ${esc(x.fase === "error" ? "quedó en el celu: " + (MOTXT[x.motivo] || "se reintenta sola") : x.motivo === "permiso" ? "en el celu: sin permiso" : x.motivo === "subiendo" ? "subiendo…" : "en el celu: " + (MOTXT[x.motivo] || "esperando"))}</small></div><span class="cd-gira"></span></div>`).join("");
  }
  function pantallaHtml() {
    const m = cantidad() ? motivo() : "";
    return `<div class="fb-mot fb-${esc(m || "nada")}">${esc(cantidad() ? explicacion(m) : "")}</div>${idbMal ? `<div class="fb-mot fb-cupo">⚠ El celu está casi lleno (${esc(idbMal)}): liberá espacio (fotos viejas, videos) para que las fotos nuevas queden guardadas.</div>` : ""}`;
  }
  async function reintentar() {
    try { window.__fotosSinSenal && window.__fotosSinSenal.reintentar(true); } catch (e) { }
    try { window.__campoCola && window.__campoCola.ya(); } catch (e) { }
    lista().forEach((r) => { if (r.fase === "error") r.prox = 0; });
    sondear(true).then(refrescar, refrescar);
    procesar(true);
    programarVer(3000);
  }

  // la píldora en la cámara de la app
  function pintarCam() {
    const cam = $("emaCam"); if (!cam) return;
    let e = cam.querySelector(".fb-cam"); const n = cantidad();
    if (!n) { e && e.remove(); return; }
    if (!e) { e = document.createElement("div"); e.className = "fb-cam"; e.setAttribute("role", "status"); cam.appendChild(e); }
    const t = `📤 ${n} ${n === 1 ? "foto esperando" : "fotos esperando"} para subir`;
    if (e.textContent !== t) e.textContent = t;
  }
  const mo2 = () => { if (document.body) new MutationObserver(() => { const c = $("emaCam"); if (c && !c.dataset.fb) { c.dataset.fb = "1"; pintarCam(); } }).observe(document.body, { childList: true }); else setTimeout(mo2, 300); };
  mo2();

  // =========================================================================================== copia en el celu
  const fsOk = () => enApp() && !!(P().Filesystem);
  const copiaOn = () => { const v = LS.get("ema.fotos.copia"); return v === "1" ? true : v === "0" ? false : esCrew(); };
  const COPIADAS = "ema.fotos.copiadas";
  const limpio = (s, n) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, n || 40) || "foto";
  const a64 = (blob) => new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1] || ""); r.onerror = () => mal(r.error); r.readAsDataURL(blob); });
  function nombreCopia(meta, ts) {
    const d = new Date(ts || Date.now()), dia = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    const obra = limpio(meta.plazaNombre || "Sin_obra", 40).toUpperCase(), que = limpio(meta.num || meta.tarea || (window.catFotoTxt ? window.catFotoTxt(meta.cat) : meta.cat) || "foto", 30);
    return { dir: "EMA/Fotos/" + dia, archivo: `${obra}_${que}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}.jpg` };
  }
  const EST_COPIA = { hoy: "", n: 0, ult: "", err: "" };
  try { Object.assign(EST_COPIA, J("ema.fotos.copiasHoy", {}) || {}); } catch (e) { }
  async function copiar(f, meta) {
    if (!copiaOn() || !fsOk() || !f) return null;
    const clave = meta.__bandejaId || meta.__adjId || "";
    const ya = J(COPIADAS, []) || [];
    if (clave && ya.indexOf(clave) >= 0) return null;
    const rec = clave && MEM[clave], n = nombreCopia(meta, rec ? rec.ts : Date.now());
    try {
      await P().Filesystem.writeFile({ path: n.dir + "/" + n.archivo, data: await a64(f), directory: "DOCUMENTS", recursive: true });
      if (clave) { ya.push(clave); LS.set(COPIADAS, JSON.stringify(ya.slice(-400))); }
      const h = hoyISO(); if (EST_COPIA.hoy !== h) { EST_COPIA.hoy = h; EST_COPIA.n = 0; }
      EST_COPIA.n++; EST_COPIA.ult = n.dir + "/" + n.archivo; EST_COPIA.err = ""; LS.set("ema.fotos.copiasHoy", JSON.stringify(EST_COPIA));
      return n;
    } catch (e) { EST_COPIA.err = String((e && e.message) || e).slice(0, 120); LS.set("ema.fotos.copiasHoy", JSON.stringify(EST_COPIA)); console.warn("[fotosSeguras] copia en el celu:", e); return null; }
  }
  window.__fotoSellada = function (f, meta) { try { copiar(f, meta || {}); } catch (e) { } };
  // ZIP con mis fotos de hoy (navegador o sin el plugin)
  async function zipHoy() {
    const per = (() => { const y = yo(); return String(y.persona || y.nombre || "").trim(); })(), nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
    const h = hoyISO(), arch = [], usados = {};
    const add = (nom, datos, ts) => { let k = nom, i = 2; while (usados[k]) k = nom.replace(/\.jpg$/, "_" + i++ + ".jpg"); usados[k] = 1; arch.push({ nombre: k, datos, fecha: ts }); };
    for (const r of lista()) { if (new Date(r.ts).toDateString() !== new Date().toDateString()) continue; try { add(nombreCopia(Object.assign({}, r.meta), r.ts).archivo, new Uint8Array(await r.f.arrayBuffer()), r.ts); } catch (e) { } }
    const ids = [];
    ots().forEach((o) => { const f = (o && o.campo && o.campo.fotos) || {}; Object.keys(f).forEach((k) => { const x = f[k]; if (!x || x.borrada || !x.ts) return; const d = new Date(x.ts); if (d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) !== h) return; if (per && nk(x.por) !== nk(per)) return; ids.push({ id: k, x, o }); }); });
    const ya = {}; lista().forEach((r) => { ya[Lk(r.adjId)] = 1; });
    for (const it of ids) {
      if (ya[it.id]) continue;
      try { const a = await conTope(window.fbAdjuntoLeer(it.id), 25000); if (!a || !a.dataUrl) continue; const i = a.dataUrl.indexOf(","), bin = atob(a.dataUrl.slice(i + 1)), u = new Uint8Array(bin.length); for (let j = 0; j < bin.length; j++) u[j] = bin.charCodeAt(j); add(nombreCopia({ plazaNombre: it.o.plazaNombre, num: it.x.num, tarea: it.x.tarea, cat: it.x.cat }, it.x.ts).archivo, u, it.x.ts); } catch (e) { }
    }
    if (!arch.length) return "Hoy todavía no hay fotos tuyas para bajar.";
    if (typeof window.__zipEMA != "function") return "No se pudo armar el ZIP en este aparato.";
    const blob = window.__zipEMA(arch), a = document.createElement("a"), url = URL.createObjectURL(blob);
    a.href = url; a.download = "Fotos_" + h + "_" + limpio(per || "mias", 30) + ".zip"; document.body.appendChild(a); a.click(); setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 4000);
    return `⬇ Listo: ${arch.length} ${arch.length === 1 ? "foto" : "fotos"} de hoy en un ZIP.`;
  }
  // Perfil › ajustes
  function filaPerfil(sw) {
    if (fsOk()) { const on = copiaOn(); return { k: "fcopia", i: "celu", t: "Guardar copia de las fotos en el celu", s: on ? "Sí: en Documentos › EMA › Fotos" + (EST_COPIA.hoy === hoyISO() && EST_COPIA.n ? ` · hoy ${EST_COPIA.n}` : "") + (EST_COPIA.err ? " · ⚠ " + EST_COPIA.err : "") : "No: las fotos solo se suben", der: sw(on) }; }
    return { k: "fzip", i: "celu", t: "Copia de las fotos en el celu", s: "En el navegador no se pueden guardar solas: bajá un ZIP con tus fotos de hoy", der: '<span class="pf-act" data-pf="fzip" role="button">⬇ Bajar mis fotos de hoy</span>' };
  }
  async function perfil(k) {
    if (k === "fcopia") { const on = !copiaOn(); LS.set("ema.fotos.copia", on ? "1" : "0"); return on ? "📁 Listo: cada foto se guarda también en el celu (Documentos › EMA › Fotos). Se ven desde «Archivos» del celu." : "Listo: las fotos ya no se copian en el celu (igual se suben)."; }
    if (k === "fzip") return zipHoy();
    return "";
  }

  // =========================================================================================== Mis tareas: mandar lo hecho
  // (Ángel, 12/11: «no puede cerrar la orden»): desde la v123 la orden se envía sola recién cuando TODAS las tareas están
  // mandadas (Se hizo / No se hizo). Con 1 de 10 hechas no había forma de mandar lo hecho. Ahora: «📤 Mandar lo que hice»
  // manda la orden con lo hecho y lo que falta queda pendiente (la oficina lo ve y lo pasa a otro día).
  const MT = () => window.__mtAPI || null;
  const envDe = (o, k) => { const x = (((o && o.campo) || {}).tareaEnv || {})[Lk(k)]; if (!x || typeof x != "object") return null; const l = Object.keys(x).map((z) => x[z]).filter((v) => v && v.estado); return l.length ? l : null; };
  function resumenOt(o) {
    const a = MT(); let l = []; try { l = a ? a.tareas(o) || [] : []; } catch (e) { l = []; }
    const hechas = l.filter((p) => envDe(o, p.k)), faltan = l.filter((p) => !envDe(o, p.k));
    return { l, hechas, faltan };
  }
  window.__mtLoHechoHtml = function (o) {
    try {
      if (!o || o.estado === "Terminada" || o.estado === "Anulada" || (o.cierre && o.cierre.cerradoTs)) return "";
      const a = MT(); if (!a) return ""; const per = a.persona(), r = resumenOt(o);
      if (!r.faltan.length) return "";
      if ((((o.campo || {}).enviados) || {})[Lk(per)]) return `<div class="et-guia et-lh-ya">📤 <b>Ya mandaste lo que hiciste.</b> ${r.faltan.length === 1 ? "La tarea que falta quedó pendiente" : "Las " + r.faltan.length + " tareas que faltan quedaron pendientes"}: si la hacés, mandala igual con «✓ Se hizo».</div>`;
      if (!r.hechas.length) return "";
      return `<button type="button" class="btn-ghost et-lohecho" data-etl="abrir" data-ot="${esc(o.id)}">📤 Mandar lo que hice (${r.hechas.length} de ${r.l.length}) · lo demás queda pendiente</button>`;
    } catch (e) { return ""; }
  };
  function cerrarLH() { const v = $("etlPop"); v && v.remove(); }
  function abrirLH(id) {
    const o = ots().find((x) => x && x.id === id); if (!o) return;
    const r = resumenOt(o); cerrarLH();
    const v = document.createElement("div"); v.id = "etlPop"; v.className = "v7-ov no-print"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true"); v.dataset.ot = id;
    v.innerHTML = `<div class="v7-caja"><div class="v7-cab"><h3>📤 Mandar lo que hiciste</h3><button type="button" class="v7-x" data-etl="x" aria-label="Cerrar">✕</button></div>
<p class="v7-sub">${esc(o.plazaNombre || "")} · ${esc(o.numero || "")}. Mandaste <b>${r.hechas.length} de ${r.l.length}</b> tareas.</p>
<div class="etl-t">Quedan pendientes (la oficina las pasa a otro día):</div><ul class="etl-l">${r.faltan.map((p) => `<li>${esc(p.label)}</li>`).join("")}</ul>
<div class="etl-t">Si alguna no se hizo por algo (lluvia, material…), mejor marcala con «✗ No se hizo» antes.</div>
<div class="et-acc"><button type="button" class="btn-ghost" data-etl="x">Cancelar</button><button type="button" class="btn-primary" data-etl="si">📤 Mandar</button></div></div>`;
    document.body.appendChild(v);
  }
  function mandarLH() {
    const v = $("etlPop"), a = MT(); if (!v || !a) return cerrarLH();
    const o = ots().find((x) => x && x.id === v.dataset.ot); if (!o) return cerrarLH();
    const per = a.persona(), r = resumenOt(o), patch = {}, c = o.campo || {};
    const hs = r.hechas.map((p) => (c.horasTarea || {})[p.k]).filter((h) => h && h.ini && h.fin);
    if (hs.length) { const mi = (h) => { const m = String(h || "").match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : 0; }, i = hs.map((h) => h.ini).sort()[0], f = hs.map((h) => h.fin).sort().slice(-1)[0], ho = Math.round(((mi(f) - mi(i)) / 60) * 100) / 100; patch["campo.horas." + Lk(per)] = { nombre: per, ini: i, fin: f, horas: ho > 0 ? ho : 0 }; }
    patch["campo.enviados." + Lk(per)] = { nombre: per, ts: Date.now(), parcial: true, hechas: r.hechas.length, de: r.l.length, pendientes: r.faltan.map((p) => p.label).slice(0, 30) };
    if (o.estado === "Emitida") patch.estado = "En curso";
    a.guardar(o, patch); cerrarLH(); try { a.redibujar(); } catch (e) { }
    try {
      if (window.__pushAvisos && window.__pushAvisos.dejarAviso) {
        const yoE = String((window.__fbUser || {}).email || "").toLowerCase(), dest = {};
        try { (PERMISOS.lista() || []).forEach((u) => { if (u && u.activo !== false && u.pendiente !== true && /^(admin|oficina)$/.test(u.rol || "") && u.email) dest[String(u.email).toLowerCase()] = 1; }); } catch (e) { }
        if (o.creadoPor) dest[String(o.creadoPor).toLowerCase()] = 1; if (o.supervisor && o.supervisor.email) dest[String(o.supervisor.email).toLowerCase()] = 1;
        const cuerpo = `${String(per).split(" ")[0]} mandó lo hecho: ${r.hechas.length} de ${r.l.length} · pendientes: ${r.faltan.map((p) => p.label).slice(0, 4).join(", ")}${r.faltan.length > 4 ? "…" : ""} · ${o.numero || ""}`;
        Object.keys(dest).forEach((em) => { if (em !== yoE) Promise.resolve(window.__pushAvisos.dejarAviso({ email: em, titulo: "📨 " + (o.plazaNombre || "Orden") + " · lo hecho (quedan pendientes)", cuerpo, tipo: "envio", ref: String(o.id), tag: "ema-envlh-" + o.id, url: "./" })).catch(() => { }); });
      }
    } catch (e) { }
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-etl]"); if (!b) return;
    const k = b.getAttribute("data-etl"); e.preventDefault();
    if (k === "abrir") return abrirLH(b.getAttribute("data-ot"));
    if (k === "x") return cerrarLH();
    if (k === "si") return mandarLH();
  });

  // =========================================================================================== arranque y relojes
  window.__fotoBandeja = Object.assign(B, {
    cantidad, lista, items: B.items, reintentar, procesar, verificar, sondear, titulo, tarjeta, listaHtml, pantallaHtml, explicacion, fsOk, copiaOn, copiar, nombreCopia, zipHoy, filaPerfil, perfil,
    campoPend, todas: () => cargar().then(() => lista()), estado: () => ({ n: cantidad(), lista: lista().map((r) => ({ id: r.id, fase: r.fase, motivo: r.motivo, intentos: r.intentos, adjId: r.adjId, campo: r.campo })), cola: cola.n, sinB: (cola.sinB || []).length, idbMal, motivo: motivo(), copias: Object.assign({}, EST_COPIA), ultOk }),
    campoHecho(id) { const r = MEM[id]; if (r) { r.campo = true; poner(r); programarVer(3000); } },
    campoFalta(id) { const r = MEM[id]; if (r) { r.campo = false; poner(r); programarVer(3000); } },
    ponerNueva(x) { const rec = Object.assign({ fase: "nueva", intentos: 0, campo: false, uid: uid(), ts: Date.now() }, x); if (!rec.adjId) rec.adjId = nuevoAdj(); PROPIAS[rec.id] = Date.now(); return poner(rec).then(() => rec); }
  });
  // al entrar (con sesión), al volver a la app, al volver la señal y cada tanto: revisar, reintentar y, si hay cosas
  // esperando con internet, preguntar el motivo real
  function tic() {
    if (!window.__fbUser) return;
    verificar().then(() => {
      const n = cantidad(), nC = ((window.__campoCola && window.__campoCola.estado && window.__campoCola.estado()) || {}).cola || 0, d = B.desde();
      if ((n || nC) && navigator.onLine !== false && (!d || Date.now() - d > 40000)) sondear(false).then(refrescar, refrescar);
      else if (!n && !nC && SR.motivo && SR.motivo !== "cupo") { SR.motivo = ""; guardarSR(); }
      if (SR.motivo === "cupo" && SR.red && Date.now() > SR.hasta) ponerMotivo("");
      try { const y = yo(); if (/^(admin|oficina)$/.test(y.rol || "") && Date.now() - SR.ult > 20 * 6e4 && navigator.onLine !== false) sondear(false); } catch (e) { }
      if (lista().some((r) => r.fase === "nueva" || r.fase === "error")) programar(2000);
    });
  }
  const alEntrar = () => { if (window.__fbUser) { if (SR.motivo === "cupo" && SR.det === "lecturas" && Date.now() < SR.hasta) redApagada(true); cargar().then(() => { tic(); procesar(); }); } else setTimeout(alEntrar, 1500); };
  setTimeout(alEntrar, 2500);
  setInterval(tic, 60000);
  window.addEventListener("online", () => { SR.ult = 0; setTimeout(() => { reintentar(); }, 1500); });
  window.addEventListener("offline", () => { refrescar(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) setTimeout(tic, 800); else procesar(); });
  // el mensaje cuando la foto no se pudo subir en el momento: no es «sacala de nuevo»
  const fe = () => {
    const o = window.__fotoError; if (typeof o != "function") return setTimeout(fe, 800);
    if (o.__bandeja) return;
    const n = function (er, ot) {
      if (er && er.bandeja) return "📥 La foto quedó guardada en el celu y se sube sola (" + (MOTXT[er.motivo] || "se reintenta") + "). No hace falta sacarla de nuevo.";
      if (er && er.enEspera && /permission/.test(String(er.code || ""))) { setTimeout(() => sondear(true).then(refrescar, refrescar), 500); }
      return o.apply(this, arguments);
    };
    n.__bandeja = 1; window.__fotoError = n;
  };
  fe();
})();
