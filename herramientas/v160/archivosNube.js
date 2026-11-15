(function () {
  "use strict";
  // v160 · PDF y videos (comprimidos) en Cloudflare R2, junto a las fotos (Ángel, 13/11/2026: «en el lugar donde mandamos las
  // fotos (Cloudflare), ¿podemos almacenar los PDF y videos?» … «sí, los videos tendría que comprimirlos» … «dale, hacelo»).
  //  · Solo si el servidor de fotos es el nuevo (Worker «ema-fotos» v2-fotos: /salud lo dice). Si no, todo como hoy y los botones
  //    nuevos dicen «falta actualizar el servidor de fotos».
  //  · PDF (documentación de la obra v151, remitos v137/138, planos de obra, PDF sueltos del legajo): el archivo va a
  //    docs/AAAA/MM/<obra>/<id>.pdf y en la base queda solo la ficha (adjuntos: r2, nombre, tamaño, páginas si se sabe).
  //    Tope 25 MB (antes 650 KB adentro de la base). Nunca entero a la base.
  //  · Videos: la cuadrilla desde Modo obra, Mis tareas y la cámara de la app; la oficina desde el legajo («🎥 Subir video»).
  //    Se achican en el celu antes de subir (lado mayor 854 px ≈ 480p, ~1 Mbps de video + audio mono ~48 kbps, WebM; a confirmar)
  //    con MediaRecorder sobre un <video> + canvas.captureStream(); si el aparato no puede, se sube el original y se avisa.
  //    Tope de 2 minutos (a confirmar). Más de 95 MB → subida por partes. Miniatura (primer cuadro) en fotosObra con tipo:"video",
  //    duración y peso; ficha en adjuntos con r2; en la orden, campo.videos (NO campo.fotos: no cuenta como foto de la columna).
  //  · BANDEJA: el archivo queda en el celu (IndexedDB «ema-archivos») hasta que está en la nube y la ficha en la base; sin señal
  //    se reintenta solo (30 s → 10 min, al volver la señal, al abrir y al volver a la app). Si no hay lugar en el celu, se avisa.
  //  · Ver: el video se mira desde la nube con la dirección del Worker (?t=) y se puede adelantar (pedidos por rango); bajar,
  //    compartir y (la oficina) «↔ Mover» como una foto más. En el legajo, la sección «🎥 Videos y PDF»; en el avance nuevo
  //    (v158) la hoja de cada columna muestra los videos y PDF de esa columna como evidencia (no cuentan como foto).
  // Pruebas viejas: __v160No (lo pone el arnés salvo v160:true): todo como antes.
  if (window.__archivosNube) return;
  const WORKER = "https://ema-fotos.mdiaz-60f.workers.dev";
  const MB = 1048576;
  const TOPE_PDF = 25 * MB;          // un PDF (a confirmar; el servidor acepta hasta 25 MB en una subida)
  const TOPE_PUT_VIDEO = 95 * MB;    // más grande que esto, por partes
  const PARTE = 10 * MB;             // tamaño de cada parte (el servidor pide entre 5 y 95 MB)
  const TOPE_SEG = 120;              // 2 minutos (a confirmar con Ángel)
  const LADO = 854, VBPS = 1000000, ABPS = 48000;   // ≈ 480p, 1 Mbps, audio mono 48 kbps (a confirmar)
  const off = () => !!window.__v160No;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const arr = (x) => (Array.isArray(x) ? x : []);
  const intentar = (fn, def) => { try { return fn(); } catch (e) { return def; } };
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const hoyISO = () => iso(new Date());
  const hhmm = (ts) => { const d = new Date(ts); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const fDia = (ts) => { const d = new Date(ts); return isNaN(d) ? "" : pad(d.getDate()) + "/" + pad(d.getMonth() + 1); };
  const J = (k, d) => { try { const t = localStorage.getItem(k); return t == null ? d : JSON.parse(t); } catch (e) { return d; } };
  const LSset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const Lk = (s) => String(s || "").replace(/[~*\/\[\].`]/g, "_").slice(0, 120) || "_";
  const fMB = (b) => { b = +b || 0; if (b < MB) return Math.max(1, Math.round(b / 1024)) + " KB"; const v = b / MB; return (v < 10 ? v.toFixed(1).replace(".", ",") : String(Math.round(v))) + " MB"; };
  const fDur = (s) => { s = Math.round(+s || 0); return Math.floor(s / 60) + ":" + pad(s % 60); };
  const permiso = (h) => intentar(() => (window.PERMISOS && PERMISOS.permiso ? PERMISOS.permiso(h) : typeof window.permiso == "function" ? window.permiso(h) : "oculto"), "oculto");
  const yo = () => intentar(() => (window.PERMISOS && PERMISOS.yo && PERMISOS.yo()) || {}, {});
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false) || /^(cuadrilla|operario)$/.test(String(yo().rol || ""));
  const esDir = () => intentar(() => !!(window.__esDireccion && window.__esDireccion()), false) || String(yo().rol || "") === "direccion";
  const yoMail = () => String((window.__fbUser || {}).email || "");
  const yoPersona = () => { const y = yo(); return y.persona || y.nombre || y.usuario || yoMail().split("@")[0]; };
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const otDe = (id) => ots().find((o) => o && String(o.id) === String(id)) || null;
  const obras = () => intentar(() => (Array.isArray(avanceObras) ? avanceObras : []).concat(arr(window.avanceObrasOcultas)), []);
  const obraDe = (id) => obras().find((o) => o && String(o.id) === String(id)) || null;
  const nombreObra = (id, def) => { const o = obraDe(id), n = String((o && (o.nombre || o.plazaNombre)) || def || ""); return intentar(() => (window.__fmtNombre ? window.__fmtNombre.obra(n) : n.toUpperCase()), n.toUpperCase()); };
  // la oficina: quien edita Avance, Registrar obra u Órdenes (no la cuadrilla, ni Dirección ni «solo mirar»)
  const oficina = () => !off() && !!window.__fbUser && !esCrew() && !esDir() && ["avance", "registro", "parte"].some((h) => permiso(h) === "editar");
  const puedeSubirVideo = () => !off() && !!window.__fbUser && !window.__modoEmergencia && (esCrew() || oficina());
  const puedeVer = () => !off();

  // =========================================================================================== el servidor de fotos (v2)
  const SV = Object.assign({ v: "", ts: 0, multipart: false }, J("ema.fotos.v2", {}) || {});
  const v2 = () => !off() && /^v([2-9]|\d{2,})-fotos/.test(String(SV.v || ""));
  let revisando = null;
  function revisar(forzar) {
    if (off()) return Promise.resolve(SV);
    if (revisando) return revisando;
    if (!forzar && SV.ts && Date.now() - SV.ts < (v2() ? 6 * 36e5 : 10 * 6e4)) return Promise.resolve(SV);
    revisando = (async () => {
      try {
        const c = typeof AbortController == "function" ? new AbortController() : null, t = setTimeout(() => c && c.abort(), 8000);
        let r; try { r = await fetch(WORKER + "/salud", { cache: "no-store", signal: c ? c.signal : undefined }); } finally { clearTimeout(t); }
        let j = {}; try { j = await r.json(); } catch (e) { j = {}; }
        const antes = v2();
        SV.v = String(j.version || (r.status < 500 ? "v1" : SV.v || "")); SV.multipart = !!j.multipart; SV.ts = Date.now();
        LSset("ema.fotos.v2", { v: SV.v, ts: SV.ts, multipart: SV.multipart });
        if (antes !== v2()) refrescar();
      } catch (e) { /* sin señal: queda lo que se sabía */ }
      return SV;
    })().then((x) => { revisando = null; return x; }, () => { revisando = null; return SV; });
    return revisando;
  }
  const textoFalta = () => (oficina() ? "Falta actualizar el servidor de fotos (Worker «ema-fotos», pasos de la v160): hasta entonces no se pueden subir videos ni PDF grandes." : "Falta actualizar el servidor de fotos: todavía no se pueden subir videos. Avisale a la oficina.");
  const topePdf = () => (v2() ? TOPE_PDF : 650 * 1024);

  // =========================================================================================== sesión, claves, subida
  const usuario = () => { try { return firebase.auth().currentUser || window.__fbUser || null; } catch (e) { return window.__fbUser || null; } };
  async function token() { const u = usuario(); if (!u || typeof u.getIdToken != "function") throw Object.assign(new Error("sin sesión"), { tipo: "sesion" }); return u.getIdToken(); }
  const limpio = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40) || "general";
  const nuevoId = () => intentar(() => firebase.firestore().collection("adjuntos").doc().id, "") || (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
  function clave(carpeta, plaza, id, ext) { const f = new Date(); return carpeta + "/" + f.getFullYear() + "/" + pad(f.getMonth() + 1) + "/" + limpio(plaza) + "/" + limpio(id) + "." + ext; }
  const topePut = (carpeta) => { const t = +window.__anTopePut; return t > 0 ? t : carpeta === "docs" ? TOPE_PDF : TOPE_PUT_VIDEO; };
  const tamParte = () => { const t = +window.__anParte; return t > 0 ? t : PARTE; };
  // XMLHttpRequest para ver el avance de la subida; corta si en 60 s no avanzó nada
  function xhr(metodo, url, cuerpo, cab, alProg) {
    return new Promise((ok, mal) => {
      const x = new XMLHttpRequest(); let ult = Date.now(), vig = 0;
      x.open(metodo, url, true);
      Object.keys(cab || {}).forEach((k) => { try { x.setRequestHeader(k, cab[k]); } catch (e) { } });
      if (x.upload) x.upload.onprogress = (e) => { ult = Date.now(); if (alProg && e.lengthComputable) alProg(e.loaded, e.total); };
      const fin = () => clearInterval(vig);
      vig = setInterval(() => { if (Date.now() - ult > 60000) { try { x.abort(); } catch (e) { } } }, 5000);
      x.onload = () => { fin(); let j = {}; try { j = JSON.parse(x.responseText || "{}"); } catch (e) { j = {}; } ok({ status: x.status, j }); };
      x.onerror = () => { fin(); mal(Object.assign(new Error("sin señal"), { tipo: "red" })); };
      x.onabort = () => { fin(); mal(Object.assign(new Error("la subida se cortó (señal lenta)"), { tipo: "red" })); };
      try { x.send(cuerpo == null ? null : cuerpo); } catch (e) { fin(); mal(Object.assign(new Error("sin señal"), { tipo: "red" })); }
    });
  }
  function errDe(r, que) {
    const t = (r && r.j && r.j.error) || ("el servidor de fotos respondió " + (r ? r.status : "?"));
    const tipo = r && r.status === 401 ? "sesion" : r && (r.status === 413 || r.status === 415 || r.status === 409) ? "final" : "red";
    return Object.assign(new Error(t), { tipo, status: r && r.status, que });
  }
  async function subirBlob(rec, alProg) {
    if (navigator.onLine === false) throw Object.assign(new Error("sin señal"), { tipo: "red" });
    const tk = await token(), b = rec.blob, tam = b.size;
    if (tam <= topePut(rec.carpeta)) {
      const r = await xhr("PUT", WORKER + "/f/" + rec.key, b, { Authorization: "Bearer " + tk, "Content-Type": rec.mime }, (l, t) => alProg && alProg(l / (t || tam)));
      if (r.status === 200 && r.j && r.j.ok) return;
      throw errDe(r, "put");
    }
    // por partes: lo que ya subió queda anotado en la bandeja (si se corta, sigue desde la parte que falta)
    const base = WORKER + "/m/" + rec.key, cabA = { Authorization: "Bearer " + tk };
    let mp = rec.mp;
    if (!mp || !mp.id) {
      const r = await xhr("POST", base + "?accion=iniciar&tipo=" + encodeURIComponent(rec.mime) + "&tam=" + tam, null, cabA);
      if (!(r.status === 200 && r.j && r.j.ok && r.j.id)) throw errDe(r, "iniciar");
      mp = rec.mp = { id: r.j.id, partes: [], parte: tamParte() }; await guardarRec(rec);
    }
    const P = mp.parte || tamParte(), n = Math.ceil(tam / P);
    for (let i = mp.partes.length + 1; i <= n; i++) {
      const pedazo = b.slice((i - 1) * P, Math.min(tam, i * P));
      const r = await xhr("PUT", base + "?parte=" + i + "&id=" + encodeURIComponent(mp.id), pedazo, Object.assign({ "Content-Type": i === 1 ? rec.mime : "application/octet-stream", "X-Tipo": rec.mime }, cabA), (l) => alProg && alProg(((i - 1) * P + l) / tam));
      if (!(r.status === 200 && r.j && r.j.ok && r.j.etag)) { if (r.status === 400 || r.status === 404) { rec.mp = null; await guardarRec(rec); } throw errDe(r, "parte"); }
      mp.partes.push({ parte: i, etag: r.j.etag }); await guardarRec(rec);
    }
    const r = await xhr("POST", base + "?accion=terminar&id=" + encodeURIComponent(mp.id), JSON.stringify({ partes: mp.partes }), Object.assign({ "Content-Type": "application/json" }, cabA));
    if (r.status === 200 && r.j && r.j.ok) return;
    if (r.status === 400) { rec.mp = null; await guardarRec(rec); }
    throw errDe(r, "terminar");
  }
  async function urlVer(key) { const tk = await token(); return WORKER + "/f/" + key + "?t=" + encodeURIComponent(tk); }

  // =========================================================================================== bandeja (IndexedDB)
  const DBN = "ema-archivos", ST = "a", MEM = {}, EST = {};   // MEM: id → registro (con el blob); EST: id → {fase, pct, motivo}
  let dbp = null;
  const abrirDb = () => dbp || (dbp = new Promise((ok, mal) => { try { const r = indexedDB.open(DBN, 1); r.onupgradeneeded = () => r.result.createObjectStore(ST, { keyPath: "id" }); r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error); } catch (e) { mal(e); } }));
  const tx = (modo, fn) => abrirDb().then((db) => new Promise((ok, mal) => { const q = db.transaction(ST, modo), r = fn(q.objectStore(ST)); q.oncomplete = () => ok(r && r.result); q.onerror = () => mal(q.error); q.onabort = () => mal(q.error); }));
  const guardarRec = (rec) => { MEM[rec.id] = rec; return tx("readwrite", (s) => s.put(rec)).then(() => true, (e) => { console.warn("[archivos] no se pudo guardar en el celu:", e); return false; }); };
  const sacarRec = (id) => { delete MEM[id]; return tx("readwrite", (s) => s.delete(id)).catch(() => { }); };
  const todosRec = () => tx("readonly", (s) => s.getAll()).then((l) => arr(l), () => Object.keys(MEM).map((k) => MEM[k]));
  async function lugarLibre() { try { if (navigator.storage && navigator.storage.estimate) { const e = await navigator.storage.estimate(); if (e && e.quota) return e.quota - (e.usage || 0); } } catch (e) { } return Infinity; }
  const pendientes = () => Object.keys(MEM).map((k) => MEM[k]).filter((r) => r && r.fase !== "hecha");
  const cantidad = () => pendientes().length;
  const estadoDe = (id) => Object.assign({}, EST[id] || {}, MEM[id] ? { local: true } : {});
  const enEspera = (id) => !!MEM[id];

  const CORRIENDO = {};
  async function procesar(rec, alProg) {
    if (CORRIENDO[rec.id]) return CORRIENDO[rec.id];
    const p = (async () => {
      const E = EST[rec.id] = EST[rec.id] || {};
      if (rec.fase !== "subida") {
        E.fase = "subiendo"; E.pct = E.pct || 0; refrescarSuave();
        try { await subirBlob(rec, (f) => { E.pct = Math.max(0, Math.min(1, f)); if (alProg) alProg(E.pct); refrescarSuave(); }); }
        catch (e) {
          rec.intentos = (rec.intentos || 0) + 1; rec.motivo = String((e && e.message) || e); rec.tipoErr = (e && e.tipo) || "red";
          if (rec.tipoErr === "final") rec.fase = "error";
          rec.prox = Date.now() + [30, 60, 120, 300, 600][Math.min(4, rec.intentos - 1)] * 1000;
          E.fase = rec.fase === "error" ? "error" : "espera"; E.motivo = rec.motivo;
          await guardarRec(rec); refrescar(); throw e;
        }
        rec.fase = "subida"; rec.mp = null; E.pct = 1; await guardarRec(rec);
      }
      // la ficha (adjuntos), la miniatura (fotosObra) y la orden: por la cola de siempre de la base (aguanta sin señal)
      E.fase = "ficha"; refrescarSuave();
      const ficha = Object.assign({}, rec.meta, { __id: rec.id, r2: rec.key, mime: rec.mime, bytes: rec.blob.size, nombre: rec.nombre || "" });
      try { await window.fbAdjuntoGuardar(ficha); } catch (e) { if (!(e && e.enEspera)) { rec.prox = Date.now() + 60000; rec.motivo = String((e && e.message) || e); E.fase = "espera"; E.motivo = rec.motivo; await guardarRec(rec); refrescar(); throw e; } }
      if (rec.fo) { try { await window.fbFotoObraCrear(Object.assign({}, rec.fo, { __id: rec.id, adjId: rec.id, bytes: rec.blob.size })); } catch (e) { console.warn("[archivos] fotosObra:", e); } }
      if (rec.campo && rec.campo.otId) {
        const patch = {}; patch["campo.videos." + Lk(rec.id)] = rec.campo.val;
        try { const o = otDe(rec.campo.otId), A = window.__mtAPI; if (o && A && A.guardar && esCrew()) A.guardar(o, patch); else if (typeof window.fbOtCampo == "function") await window.fbOtCampo(rec.campo.otId, patch); } catch (e) { console.warn("[archivos] orden:", e); }
      }
      if (rec.plano) { try { await firebase.firestore().collection("planosObra").doc(rec.plano).update({ pdfAdj: rec.id, pdfTam: rec.blob.size }); } catch (e) { console.warn("[archivos] plano:", e); } }
      // ya está: a la lista de la obra (sin volver a leer la base) y fuera del celu
      if (rec.fo && rec.fo.plazaId) { const c = VID[String(rec.fo.plazaId)]; const x = Object.assign({ id: rec.id }, rec.fo, { adjId: rec.id, bytes: rec.blob.size }); if (c) { c.l = c.l.filter((y) => y.adjId !== rec.id); c.l.push(x); } else VID[String(rec.fo.plazaId)] = { ts: 0, l: [x] }; }
      E.fase = "hecha"; E.pct = 1; rec.fase = "hecha";
      await sacarRec(rec.id);
      try { window.dispatchEvent(new CustomEvent("archivo-subido", { detail: { id: rec.id, tipo: rec.tipo, key: rec.key } })); } catch (e) { }
      refrescar();
      return rec.id;
    })();
    CORRIENDO[rec.id] = p;
    p.then(() => { delete CORRIENDO[rec.id]; }, () => { delete CORRIENDO[rec.id]; });
    return p;
  }
  let vuelta = 0, tProx = 0;
  async function procesarTodo(forzar) {
    if (off() || !window.__fbUser) return;
    const mia = ++vuelta;
    let l = await todosRec();
    l.forEach((r) => { if (r && r.id && !MEM[r.id]) MEM[r.id] = r; });
    l = l.filter((r) => r && r.fase !== "error" && r.fase !== "hecha" && (!r.uid || r.uid === (window.__fbUser || {}).uid) && (forzar || !r.prox || r.prox <= Date.now()));
    for (const r of l) { if (mia !== vuelta || navigator.onLine === false) break; try { await procesar(r); } catch (e) { } }
    programar();
  }
  function programar() {
    clearTimeout(tProx);
    const l = pendientes().filter((r) => r.fase !== "error"); if (!l.length) return;
    const p = Math.min.apply(null, l.map((r) => r.prox || Date.now() + 30000));
    tProx = setTimeout(() => procesarTodo(false), Math.max(5000, p - Date.now()));
  }
  window.addEventListener("online", () => setTimeout(() => procesarTodo(true), 800));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) setTimeout(() => procesarTodo(false), 1500); });
  (function arrancar(n) { if (window.__fbUser) { setTimeout(() => { revisar(false); procesarTodo(true); }, 2500); return; } if (n < 120) setTimeout(() => arrancar(n + 1), 1000); })(0);
  setTimeout(function cada6() { if (!document.hidden) revisar(false); setTimeout(cada6, 6 * 36e5); }, 6 * 36e5);

  // guardar un archivo: primero en el celu, después a la nube; espera hasta op.espera ms y si no, sigue por atrás
  async function guardarArchivo(blob, op) {
    if (off()) throw new Error("No está en esta versión.");
    if (!v2()) throw Object.assign(new Error(textoFalta()), { tipo: "v1" });
    const id = op.id || nuevoId();
    const rec = { id, tipo: op.tipo, carpeta: op.carpeta, mime: op.mime, nombre: op.nombre || "", key: clave(op.carpeta, op.plazaId || op.tipo, id, op.ext), blob, meta: op.meta || {}, fo: op.fo || null, campo: op.campo || null, plano: op.plano || null, fase: "nueva", intentos: 0, prox: 0, ts: Date.now(), uid: (window.__fbUser || {}).uid || "" };
    const libre = await lugarLibre();
    let enCelu = libre > blob.size * 1.3 && (await guardarRec(rec));
    if (!enCelu) MEM[id] = rec;   // sin lugar: queda en la memoria mientras la app esté abierta
    EST[id] = { fase: "nueva", pct: 0, sinLugar: !enCelu };
    refrescar();
    const p = procesar(rec, op.alProg);
    p.catch(() => { });
    const r = await Promise.race([p.then(() => "ok", (e) => e), sleep(op.espera == null ? 25000 : op.espera).then(() => "lento")]);
    if (r === "ok") return { id, listo: true, key: rec.key };
    if (r && r.tipo === "final") { await sacarRec(id); delete EST[id]; refrescar(); throw r; }
    programar();
    return { id, enEspera: true, sinLugar: !enCelu, motivo: r === "lento" ? "lento" : String((r && r.message) || r), key: rec.key };
  }

  // =========================================================================================== PDF
  const aBlob = (dataUrl) => { const i = dataUrl.indexOf(","), tipo = (dataUrl.slice(0, i).match(/data:([^;,]+)/) || [])[1] || "application/octet-stream", bin = atob(dataUrl.slice(i + 1)), u = new Uint8Array(bin.length); for (let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k); return new Blob([u], { type: tipo }); };
  const aDataUrl = (b) => new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => mal(r.error); r.readAsDataURL(b); });
  async function paginasPdf(b) {
    try {
      if (!b || b.size > TOPE_PDF) return 0;
      const t = await new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(String(r.result || "")); r.onerror = () => mal(r.error); r.readAsBinaryString(b); });
      const n = (t.match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length;
      if (n) return n;
      const m = t.match(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/); return m ? +m[1] : 0;
    } catch (e) { return 0; }
  }
  const esPdfDato = (d) => !!d && typeof d.dataUrl == "string" && /^data:application\/(x-)?pdf/.test(d.dataUrl);
  // todo PDF que pasa por fbAdjuntoGuardar (documentación, remitos, sueltos) va a la nube si el servidor es el nuevo
  const envolverGuardar = () => {
    const o = window.fbAdjuntoGuardar; if (typeof o != "function") return false;
    if (o.__an) return true;
    if (!o.__nube) return false;   // primero la nube de fotos (v037), que se engancha después de la cola sin señal
    const n = async function (data) {
      if (!off() && v2() && esPdfDato(data) && !data.r2) {
        const b = aBlob(data.dataUrl), meta = Object.assign({}, data); delete meta.dataUrl; delete meta.__id;
        meta.mime = "application/pdf"; meta.bytes = b.size; const pg = await paginasPdf(b); if (pg) meta.paginas = pg;
        if (b.size > TOPE_PDF) throw Object.assign(new Error("El PDF pesa " + fMB(b.size) + " y el tope es " + fMB(TOPE_PDF) + "."), { tipo: "final" });
        const r = await guardarArchivo(new Blob([b], { type: "application/pdf" }), { tipo: "pdf", carpeta: "docs", ext: "pdf", mime: "application/pdf", nombre: data.nombre || "documento.pdf", plazaId: data.plazaId || data.tipo || "general", meta, id: data.__id || "", espera: 25000 });
        ULT.r = r;
        return r.id;
      }
      return o.apply(this, arguments);
    };
    window.__heredar && window.__heredar(n, o); n.__an = 1; window.fbAdjuntoGuardar = n;
    return true;
  };
  const ULT = { r: null };
  // leer: un video no se baja entero (se mira desde la nube); lo que todavía está en este celu se lee del celu
  const LEIDOS = new Map();
  const esVideo = (a) => !!a && (a.tipo === "video" || /^videos\//.test(String(a.r2 || "")) || /^video\//.test(String(a.mime || "")));
  const esPdf = (a) => !!a && (a.tipo === "pdf" || a.mime === "application/pdf" || /^docs\//.test(String(a.r2 || "")) || /^data:application\/pdf/.test(String(a.dataUrl || "")));
  const envolverLeer = () => {
    const o = window.fbAdjuntoLeer; if (typeof o != "function") return false;
    if (o.__an) return true;
    if (!o.__nube) return false;
    const n = async function (id) {
      if (off()) return o.apply(this, arguments);
      const c = LEIDOS.get(id); if (c && Date.now() - c.ts < 60000) return c.a;
      let a = null, err = null;
      try { a = await o.apply(this, arguments); } catch (e) { err = e; }
      if (!a) {
        const rec = MEM[id] || (await tx("readonly", (s) => s.get(id)).catch(() => null));
        if (rec && rec.blob) {
          const x = Object.assign({ id }, rec.meta, { mime: rec.mime, bytes: rec.blob.size, nombre: rec.nombre, local: true });
          if (rec.tipo === "video") { x.url = URL.createObjectURL(rec.blob); x.dataUrl = (rec.fo && rec.fo.mini) || ""; } else x.dataUrl = await aDataUrl(rec.blob);
          return x;
        }
        if (err) throw err;
        return a;
      }
      if (esVideo(a) && a.r2) { try { a.url = await urlVer(a.r2); } catch (e) { } if (!a.dataUrl) a.dataUrl = a.mini || ""; }
      if (!esVideo(a)) { LEIDOS.set(id, { a, ts: Date.now() }); while (LEIDOS.size > 30) LEIDOS.delete(LEIDOS.keys().next().value); }
      return a;
    };
    window.__heredar && window.__heredar(n, o); n.__an = 1; window.fbAdjuntoLeer = n;
    return true;
  };
  // el visor de siempre: si es un video o un PDF, se abre lo nuestro
  const envolverVerAdj = () => {
    const o = window.verAdjunto; if (typeof o != "function") return false;
    if (o.__an) return true;
    const n = async function (id) {
      if (!off() && id) { let a = null; try { a = await window.fbAdjuntoLeer(id); } catch (e) { a = null; } if (a && esVideo(a)) return ver(id, a); if (a && esPdf(a) && !/^data:image/.test(String(a.dataUrl || ""))) return verPdf(id, a); }
      return o.apply(this, arguments);
    };
    window.__heredar && window.__heredar(n, o); n.__an = 1; window.verAdjunto = n;
    return true;
  };
  // fotosObra: los videos y PDF NO van con las fotos (no cuentan como foto de la columna); quedan aparte para «🎥 Videos y PDF»
  const VID = {};   // plazaId → {ts, l: [fichas de fotosObra tipo video/pdf]}
  const envolverFotosObra = () => {
    const o = window.fbFotosObraDe; if (typeof o != "function") return false;
    if (o.__an) return true;
    const n = async function (id) {
      const l = await o.apply(this, arguments);
      if (off() || !Array.isArray(l)) return l;
      const ar = [], fo = [];
      l.forEach((x) => ((x && (x.tipo === "video" || x.tipo === "pdf")) ? ar : fo).push(x));
      VID[String(id)] = { ts: Date.now(), l: ar }; refrescarSuave();
      return fo;
    };
    window.__heredar && window.__heredar(n, o); n.__an = 1; window.fbFotosObraDe = n;
    return true;
  };
  const cargando = {};
  function cargarObra(id, forzar) {
    id = String(id || ""); if (!id || off()) return;
    const c = VID[id]; if (c && !forzar && Date.now() - c.ts < 120000) return;
    if (cargando[id]) return; cargando[id] = 1;
    // directo a la base (fbFotosObraDe está cortado para quien solo mira): solo se guardan los videos y PDF
    Promise.resolve().then(() => firebase.firestore().collection("fotosObra").where("plazaId", "==", id).get()).then((q) => { const l = []; q.forEach((d) => { const x = Object.assign({ id: d.id }, d.data()); if (String(x.plazaId) === id && (x.tipo === "video" || x.tipo === "pdf")) l.push(x); }); VID[id] = { ts: Date.now(), l }; }).catch(() => { }).then(() => { delete cargando[id]; refrescarSuave(); });
  }
  // todo lo de una obra: lo de la base + lo que está en este celu + lo que la cuadrilla anotó en sus órdenes (campo.videos)
  function deObra(id) {
    id = String(id || ""); const m = {};
    const poner = (x) => { if (!x || !x.adjId) return; m[x.adjId] = Object.assign({}, m[x.adjId] || {}, x); };
    arr((VID[id] || {}).l).forEach((x) => poner(Object.assign({}, x, { adjId: x.adjId || x.id })));
    ots().filter((o) => String(o.plazaId) === id).forEach((o) => { const v = obj(obj(o.campo).videos); Object.keys(v).forEach((k) => { const x = v[k]; if (x && !x.borrada && !(m[k] && m[k].tipo)) poner(Object.assign({ tipo: "video", otId: o.id, otNumero: o.numero || "", plazaId: id }, x, { adjId: k })); }); });
    pendientes().forEach((r) => { if (r.fo && String(r.fo.plazaId) === id) poner(Object.assign({}, r.fo, { adjId: r.id, bytes: r.blob ? r.blob.size : 0, local: true, fase: r.fase })); });
    return Object.keys(m).map((k) => m[k]).sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }
  const mismaCol = (a, b) => { a = nk(a); b = nk(b); if (!a || !b) return false; if (a === b) return true; const ra = a.match(/col\s*(\d+)$/), rb = b.match(/col\s*(\d+)$/); return !!(ra && rb && ra[1] === rb[1] && (a.indexOf("·") < 0 || b.indexOf("·") < 0)); };

  // =========================================================================================== videos: achicar en el celu
  function evento(el, ev, ms) { return new Promise((ok, mal) => { const t = setTimeout(() => { quitar(); mal(Object.assign(new Error("tardó demasiado"), { code: "lento" })); }, ms || 15000); const f = () => { quitar(); ok(); }, g = () => { quitar(); mal(Object.assign(new Error("no se pudo leer el video"), { code: "leer" })); }; const quitar = () => { clearTimeout(t); el.removeEventListener(ev, f); el.removeEventListener("error", g); }; el.addEventListener(ev, f); el.addEventListener("error", g); }); }
  async function duracionDe(v) {
    if (isFinite(v.duration) && v.duration > 0) return v.duration;
    // WebM grabado con MediaRecorder: el largo recién se sabe yendo al final
    try { v.currentTime = 1e101; await evento(v, "durationchange", 6000).catch(() => { }); } catch (e) { }
    const d = isFinite(v.duration) ? v.duration : 0;
    try { v.currentTime = 0; await evento(v, "seeked", 4000).catch(() => { }); } catch (e) { }
    return d;
  }
  function elegirMime() {
    const MR = window.MediaRecorder; if (!MR || typeof MR.isTypeSupported != "function") return "";
    return ["video/webm;codecs=vp8,opus", "video/webm;codecs=vp9,opus", "video/webm", "video/mp4;codecs=avc1,mp4a", "video/mp4"].find((t) => intentar(() => MR.isTypeSupported(t), false)) || "";
  }
  const puedeAchicar = () => !window.__anNoComprime && !!window.MediaRecorder && !!elegirMime() && typeof HTMLCanvasElement != "undefined" && typeof HTMLCanvasElement.prototype.captureStream == "function";
  // lee el video: duración, tamaño y la miniatura (el primer cuadro)
  async function leerVideo(file) {
    const url = URL.createObjectURL(file), v = document.createElement("video");
    v.preload = "auto"; v.muted = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.src = url;
    try {
      await evento(v, "loadedmetadata", 20000);
      const dur = await duracionDe(v), W = v.videoWidth, H = v.videoHeight;
      if (v.readyState < 2) await evento(v, "loadeddata", 8000).catch(() => { });
      const mini = (lado) => intentar(() => { const e = Math.min(1, lado / Math.max(W || 1, H || 1)), c = document.createElement("canvas"); c.width = Math.max(1, Math.round(W * e)); c.height = Math.max(1, Math.round(H * e)); c.getContext("2d").drawImage(v, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", 0.7); }, "");
      return { dur, W, H, mini140: mini(140), mini72: mini(72) };
    } finally { try { v.removeAttribute("src"); v.load(); } catch (e) { } URL.revokeObjectURL(url); }
  }
  // re-codifica: <video> → canvas (lado mayor 854) + audio mono → MediaRecorder; en tiempo real (un video de 1 min tarda 1 min)
  async function achicar(file, info, alProg, cancel) {
    const mime = elegirMime(); if (!mime) throw Object.assign(new Error("este celu no puede achicar videos"), { code: "no" });
    const url = URL.createObjectURL(file), v = document.createElement("video");
    v.preload = "auto"; v.playsInline = true; v.setAttribute("playsinline", ""); v.src = url;
    v.style.cssText = "position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:0;pointer-events:none"; document.body.appendChild(v);
    let ac = null, rec = null, raf = 0, vis = null;
    try {
      await evento(v, "loadedmetadata", 20000);
      if (v.readyState < 2) await evento(v, "loadeddata", 8000).catch(() => { });
      const W = v.videoWidth || info.W, H = v.videoHeight || info.H, e = Math.min(1, LADO / Math.max(W, H));
      const w = Math.max(2, Math.round(W * e / 2) * 2), h = Math.max(2, Math.round(H * e / 2) * 2);
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const g = cv.getContext("2d");
      g.drawImage(v, 0, 0, w, h);
      const pista = cv.captureStream(25).getVideoTracks();
      let audio = [];
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC && !window.__anSinAudio) { ac = new AC(); const src = ac.createMediaElementSource(v), dest = ac.createMediaStreamDestination(); try { dest.channelCount = 1; } catch (x) { } src.connect(dest); audio = dest.stream.getAudioTracks(); try { await ac.resume(); } catch (x) { } }
      } catch (x) { audio = []; v.muted = true; }
      const MR = window.MediaRecorder;
      const mt = audio.length ? mime : mime.replace(/,opus|,mp4a/, "");
      rec = new MR(new MediaStream(pista.concat(audio)), { mimeType: intentar(() => MR.isTypeSupported(mt), false) ? mt : mime, videoBitsPerSecond: VBPS, audioBitsPerSecond: ABPS });
      const trozos = []; rec.ondataavailable = (x) => { if (x.data && x.data.size) trozos.push(x.data); };
      const parado = new Promise((ok) => { rec.onstop = ok; });
      const dibujar = () => { try { g.drawImage(v, 0, 0, w, h); } catch (x) { } if (alProg && info.dur) alProg(Math.min(1, v.currentTime / info.dur)); raf = requestAnimationFrame(dibujar); };
      vis = () => { try { if (document.hidden) { v.pause(); rec.state === "recording" && rec.pause(); } else { rec.state === "paused" && rec.resume(); v.play().catch(() => { }); } } catch (x) { } };
      document.addEventListener("visibilitychange", vis);
      rec.start(1000);
      raf = requestAnimationFrame(dibujar);
      try { await v.play(); } catch (x) { v.muted = true; await v.play(); }   // sin permiso para el sonido: sin audio (igual se ve)
      const t0 = Date.now(), tope = (info.dur || 120) * 1000 * 3 + 30000;
      await new Promise((ok, mal) => {
        const fin = () => { clearInterval(iv); ok(); };
        const iv = setInterval(() => { if (cancel && cancel()) { clearInterval(iv); mal(Object.assign(new Error("cancelado"), { code: "cancelado" })); } else if (Date.now() - t0 > tope) { clearInterval(iv); mal(Object.assign(new Error("tardó demasiado"), { code: "lento" })); } }, 400);
        v.addEventListener("ended", fin, { once: true });
      });
      cancelAnimationFrame(raf);
      if (rec.state !== "inactive") { try { rec.requestData(); } catch (x) { } rec.stop(); }
      await parado;
      const tipo = /mp4/.test(rec.mimeType || mt) ? "video/mp4" : "video/webm";
      let b = new Blob(trozos, { type: tipo });
      if (tipo === "video/webm") b = await fijarDuracion(b, (info.dur || v.duration || 0) * 1000);
      return { blob: b, mime: tipo, w, h };
    } finally {
      cancelAnimationFrame(raf); if (vis) document.removeEventListener("visibilitychange", vis);
      try { rec && rec.state !== "inactive" && rec.stop(); } catch (x) { }
      try { v.pause(); v.removeAttribute("src"); v.load(); v.remove(); } catch (x) { }
      try { ac && ac.close(); } catch (x) { }
      URL.revokeObjectURL(url);
    }
  }
  // WebM de MediaRecorder: no trae el largo y no se puede adelantar bien → se le escribe la duración (Segment › Info › Duration)
  async function fijarDuracion(blob, ms) {
    try {
      if (!(ms > 0)) return blob;
      const u = new Uint8Array(await blob.slice(0, Math.min(blob.size, 131072)).arrayBuffer());
      const idLen = (p) => { const b = u[p]; return b & 0x80 ? 1 : b & 0x40 ? 2 : b & 0x20 ? 3 : b & 0x10 ? 4 : 0; };
      const id = (p) => { const l = idLen(p); let v = 0; for (let i = 0; i < l; i++) v = v * 256 + u[p + i]; return { v, l }; };
      const vint = (p) => { const b = u[p]; let l = 1, m = 0x80; while (l <= 8 && !(b & m)) { l++; m >>= 1; } if (l > 8) return null; let v = b & (m - 1), todos = v === m - 1; for (let i = 1; i < l; i++) { v = v * 256 + u[p + i]; if (u[p + i] !== 255) todos = false; } return { v, l, desc: todos }; };
      let p = 0;
      // EBML header
      const h0 = id(p); if (h0.v !== 0x1A45DFA3) return blob; const hs = vint(p + h0.l); p += h0.l + hs.l + hs.v;
      const sg = id(p); if (sg.v !== 0x18538067) return blob; const ss = vint(p + sg.l); const segPos = p, segSizePos = p + sg.l; p += sg.l + ss.l;
      let info = null;
      while (p < u.length - 12) { const e = id(p); if (!e.l) return blob; const s = vint(p + e.l); if (!s) return blob; if (e.v === 0x1549A966) { info = { pos: p, dat: p + e.l + s.l, fin: p + e.l + s.l + s.v }; break; } if (s.desc) return blob; p += e.l + s.l + s.v; }
      if (!info || info.fin > u.length) return blob;
      let escala = 1000000; const hijos = [];
      for (let q = info.dat; q < info.fin;) { const e = id(q); const s = vint(q + e.l); if (!e.l || !s) return blob; const fin = q + e.l + s.l + s.v; if (e.v === 0x2AD7B1) { let v = 0; for (let i = q + e.l + s.l; i < fin; i++) v = v * 256 + u[i]; if (v > 0) escala = v; } if (e.v !== 0x4489) hijos.push(u.slice(q, fin)); q = fin; }
      const dur = new Uint8Array(11); dur[0] = 0x44; dur[1] = 0x89; dur[2] = 0x88; new DataView(dur.buffer).setFloat64(3, ms * 1e6 / escala);
      hijos.push(dur);
      const largo = hijos.reduce((s, x) => s + x.length, 0);
      const cab = new Uint8Array(4 + 8); cab.set([0x15, 0x49, 0xA9, 0x66], 0); cab[4] = 0x01; let L = largo; for (let i = 11; i >= 5; i--) { cab[i] = L & 255; L = Math.floor(L / 256); }
      const antes = u.slice(0, info.pos);
      if (!ss.desc) {   // el Segment con tamaño conocido: se corrige
        let nv = ss.v + (cab.length + largo) - (info.fin - info.pos);
        for (let i = ss.l - 1; i >= 1; i--) { antes[segSizePos + i] = nv & 255; nv = Math.floor(nv / 256); }
        antes[segSizePos] = (antes[segSizePos] & ~((0x100 >> ss.l) - 1) & 0xFF) | (nv & ((0x100 >> ss.l) - 1));
      }
      return new Blob([antes, cab].concat(hijos).concat([blob.slice(info.fin)]), { type: blob.type });
    } catch (e) { console.warn("[archivos] duración del video:", e); return blob; }
  }
  const tipoVideoOk = (t) => /^video\/(mp4|webm)$/.test(String(t || "").split(";")[0]);

  // =========================================================================================== hoja «🎥 Video» (grabar / elegir / achicar / subir)
  let H = null;   // {ctx, fase, pct, txt, mal, cancel, antes, despues, id}
  function inputVideo(captura) {
    const id = captura ? "anVidCam" : "anVidGal";
    let w = $("anIns"); if (!w) { w = document.createElement("div"); w.id = "anIns"; w.style.display = "none"; document.body.appendChild(w); }
    let i = $(id); if (!i) { w.insertAdjacentHTML("beforeend", `<input type="file" accept="video/*"${captura ? ' capture="environment"' : ""} id="${id}">`); i = $(id); }
    return i;
  }
  function inputPdf() {
    let w = $("anIns"); if (!w) { w = document.createElement("div"); w.id = "anIns"; w.style.display = "none"; document.body.appendChild(w); }
    let i = $("anPdfIn"); if (!i) { w.insertAdjacentHTML("beforeend", `<input type="file" accept="application/pdf,.pdf" id="anPdfIn">`); i = $("anPdfIn"); }
    return i;
  }
  function tareasDe(o) {
    if (!o) return [];
    const A = window.__mtAPI; let l = intentar(() => (A && A.tareas ? A.tareas(o) : null), null);
    if (!Array.isArray(l) || !l.length) l = arr(o.actividades).map((x) => (typeof x == "string" ? { k: x, label: x } : { k: x.k || x.id || x.tarea || "", label: x.label || x.nombre || x.tarea || x.k || "" }));
    return l.filter((x) => x && x.k).map((x) => ({ k: x.k, label: x.label || x.k }));
  }
  const columnasDe = (plaza) => intentar(() => (typeof window.puntosDeObra == "function" && plaza ? arr(window.puntosDeObra(plaza).lista) : []), []);
  function abrirVideo(ctx) {
    if (off()) return;
    ctx = Object.assign({}, ctx || {});
    if (ctx.otId && !ctx.plazaId) { const o = otDe(ctx.otId); if (o) { ctx.plazaId = String(o.plazaId || ""); ctx.plazaNombre = o.plazaNombre || ""; ctx.otNumero = o.numero || ""; } }
    if (!ctx.plazaNombre && ctx.plazaId) ctx.plazaNombre = nombreObra(ctx.plazaId);
    H = { ctx, fase: "elegir", pct: 0, txt: "", mal: false };
    revisar(!v2()).then(() => { if (H && H.fase === "elegir") pintarHoja(); });
    pintarHoja();
  }
  function cerrarHoja() { if (H && H.fase === "achicando") H.cancel = true; const v = $("anOv"); v && v.remove(); H = null; }
  function pintarHoja() {
    if (!H) return;
    const c = H.ctx, o = c.otId ? otDe(c.otId) : null, ts = tareasDe(o), cols = columnasDe(c.plazaId);
    let ov = $("anOv");
    if (!ov) { ov = document.createElement("div"); ov.id = "anOv"; ov.className = "v7-ov no-print an-ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Video de obra"); ov.addEventListener("click", (e) => { if (e.target === ov && (!H || H.fase !== "achicando")) cerrarHoja(); }); document.body.appendChild(ov); }
    const sub = [c.plazaNombre ? nombreObra(c.plazaId, c.plazaNombre) : "Sin obra", c.otNumero || ""].filter(Boolean).join(" · ");
    let cuerpo = "";
    if (H.fase === "elegir") {
      if (!c.plazaId) cuerpo = `<div class="an-bloq" role="status">Elegí primero la obra (en la cámara, tocá la obra arriba; o abrí el legajo de la obra).</div>`;
      else if (!v2()) cuerpo = `<div class="an-bloq" role="status">⚠ ${esc(textoFalta())}</div>`;
      else {
        const selT = ts.length ? `<label class="an-l" for="anTarea">¿De qué tarea?</label><select id="anTarea"><option value="">(sin tarea)</option>${ts.map((t) => `<option value="${esc(t.k)}"${t.k === c.k ? " selected" : ""}>${esc(t.label)}</option>`).join("")}</select>` : "";
        const selC = cols.length ? `<label class="an-l" for="anCol">¿De qué columna? <small>(si es de una)</small></label><select id="anCol"><option value="">(no es de una columna)</option>${cols.map((n) => `<option value="${esc(n)}"${mismaCol(n, c.num) ? " selected" : ""}>${esc(n)}</option>`).join("")}</select>` : "";
        cuerpo = selT + selC + `<label class="an-l" for="anNota">Nota <small>(opcional)</small></label><input type="text" id="anNota" maxlength="140" autocomplete="off" placeholder="Ej: prueba de encendido" value="${esc(c.nota || "")}">`
          + `<div class="an-dos"><button type="button" class="btn-primary" data-an="grabar">🎥 Grabar video</button><button type="button" class="btn-ghost" data-an="elegir">📁 Elegir uno del celu</button></div>`
          + `<div class="an-ayuda">Hasta ${TOPE_SEG / 60} minutos. Antes de subirlo, el celu lo achica (≈ 8 MB por minuto). Va a la nube junto a las fotos; no cuenta como foto de la columna.</div>`;
      }
    } else {
      const pc = Math.round((H.pct || 0) * 100);
      cuerpo = `<div class="an-prog"><div class="an-barra${H.mal ? " mal" : ""}"><i style="width:${H.fase === "listo" ? 100 : pc}%"></i></div><div class="an-paso${H.mal ? " mal" : ""}" id="anPaso" role="status" aria-live="polite">${H.txt}</div>`
        + (H.antes ? `<div class="an-pesos">Antes <b>${fMB(H.antes)}</b> → ahora <b>${fMB(H.despues || H.antes)}</b>${H.dur ? " · " + fDur(H.dur) : ""}</div>` : "")
        + (H.fase === "achicando" ? `<div class="an-ayuda">Dejá la app abierta y la pantalla prendida mientras se achica.</div><button type="button" class="btn-ghost" data-an="cancelar">Cancelar</button>` : "")
        + (H.fase === "listo" || H.fase === "error" || H.fase === "espera" ? `<div class="an-dos"><button type="button" class="btn-primary" data-an="x">Listo</button>${H.fase === "error" ? '<button type="button" class="btn-ghost" data-an="otro">Probar con otro</button>' : ""}</div>` : "")
        + `</div>`;
    }
    const h = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>🎥 Video de obra</h3><small>${esc(sub)}</small></div><button type="button" class="v7-x" data-an="x" aria-label="Cerrar">✕</button></div>${cuerpo}</div>`;
    if (ov.__h !== h) { const nota = $("anNota"), tv = $("anTarea"), cv = $("anCol"); if (H.fase === "elegir" && nota) { c.nota = nota.value; if (tv) c.k = tv.value; if (cv) c.num = cv.value; } ov.innerHTML = h; ov.__h = h; }
  }
  function paso(txt, pct, fase, mal) { if (!H) return; H.txt = txt; if (pct != null) H.pct = pct; if (fase) H.fase = fase; H.mal = !!mal; const p = $("anPaso"), ov = $("anOv"); if (p && ov && !fase) { p.innerHTML = txt; const i = ov.querySelector(".an-barra i"); i && (i.style.width = Math.round((H.pct || 0) * 100) + "%"); } else pintarHoja(); }
  async function videoElegido(file) {
    if (!H || !file) return;
    const c = H.ctx, tv = $("anTarea"), cv = $("anCol"), nt = $("anNota");
    if (tv) c.k = tv.value; if (cv) c.num = cv.value; if (nt) c.nota = nt.value.trim();
    const o = c.otId ? otDe(c.otId) : null, t = tareasDe(o).find((x) => x.k === c.k);
    H.antes = file.size; H.despues = 0;
    paso("Revisando el video…", 0, "leyendo");
    let info;
    try { info = await leerVideo(file); }
    catch (e) {
      // no se pudo leer (formato raro): si el servidor lo acepta, sube el original
      if (!tipoVideoOk(file.type)) return paso("⚠ Este video no se puede leer ni subir (formato " + esc(file.type || "desconocido") + "). Grabalo con la cámara del celu en MP4.", 0, "error", true);
      info = { dur: 0, W: 0, H: 0, mini140: "", mini72: "" };
    }
    H.dur = info.dur;
    if (info.dur > TOPE_SEG + 1) return paso(`⚠ El video dura ${fDur(info.dur)} y el tope es ${TOPE_SEG / 60} minutos. Cortalo o grabá uno más corto.`, 0, "error", true);
    let blob = file, mime = String(file.type || "").split(";")[0], w = info.W, h = info.H, comprimido = false, aviso = "";
    const liviano = info.dur > 0 && file.size * 8 / info.dur <= 1.4e6 && Math.max(info.W, info.H) <= 960 && tipoVideoOk(mime);
    if (!liviano && puedeAchicar()) {
      paso("Achicando el video… 0 %", 0, "achicando");
      try {
        const r = await achicar(file, info, (f) => paso("Achicando el video… " + Math.round(f * 100) + " %", f), () => !H || H.cancel);
        if (r.blob.size && (r.blob.size < file.size * 0.9 || !tipoVideoOk(mime))) { blob = r.blob; mime = r.mime; w = r.w; h = r.h; comprimido = true; }
      } catch (e) {
        if (e && e.code === "cancelado") { if (H) { H.fase = "elegir"; H.antes = 0; pintarHoja(); } return; }
        console.warn("[archivos] achicar:", e);
        aviso = "No se pudo achicar el video en este celu: se sube como está (" + fMB(file.size) + ").";
      }
    } else if (!liviano) aviso = "Este celu no puede achicar videos: se sube como está (" + fMB(file.size) + ").";
    if (!H) return;
    if (!tipoVideoOk(mime)) return paso("⚠ Este formato de video no se puede subir (" + esc(mime || "desconocido") + "). Grabalo con la cámara del celu en MP4.", 0, "error", true);
    H.despues = blob.size;
    const ext = mime === "video/mp4" ? "mp4" : "webm", ahora = Date.now(), per = yoPersona();
    const base = { plazaId: String(c.plazaId), plazaNombre: c.plazaNombre || nombreObra(c.plazaId), otId: c.otId || "", otNumero: c.otNumero || "", k: c.k || "", tarea: t ? t.label : "", cat: c.cat || "otra", num: c.num || "", nota: c.nota || "", dur: Math.round((info.dur || 0) * 10) / 10, por: per, ts: ahora, fecha: hoyISO(), usuario: yoMail() };
    const meta = Object.assign({ tipo: "video", w, h, comprimido, bytesOriginal: file.size }, base);
    const fo = Object.assign({ tipo: "video", mini: info.mini140 || "" }, base);
    const campo = c.otId && esCrew() ? { otId: c.otId, val: { mini: info.mini72 || "", por: per, ts: ahora, k: c.k || "", tarea: base.tarea, num: c.num || "", cat: base.cat, dur: base.dur, bytes: blob.size } } : null;
    paso((aviso ? "⚠ " + esc(aviso) + "<br>" : "") + "Subiendo… 0 %", 0, "subiendo");
    try {
      const r = await guardarArchivo(blob, { tipo: "video", carpeta: "videos", ext, mime, nombre: "video_" + limpio(base.plazaNombre) + "_" + hoyISO() + "." + ext, plazaId: c.plazaId, meta, fo, campo, espera: 180000, alProg: (f) => paso((aviso ? "⚠ " + esc(aviso) + "<br>" : "") + "Subiendo… " + Math.round(f * 100) + " %", f) });
      if (!H) return;
      H.id = r.id;
      if (r.listo) paso("✓ Video guardado" + (comprimido ? ` (de ${fMB(file.size)} a ${fMB(blob.size)})` : "") + "." + (aviso ? " " + esc(aviso) : ""), 1, "listo");
      else paso(r.sinLugar ? "⚠ No hay lugar en el celu para guardarlo mientras se sube: dejá la app abierta hasta que suba (o liberá espacio)." : "📥 El video quedó guardado en el celu y se sube solo cuando haya señal. No hace falta grabarlo de nuevo.", H.pct, "espera", !!r.sinLugar);
    } catch (e) {
      paso("⚠ No se pudo guardar el video: " + esc((e && e.message) || e), 0, "error", true);
    }
  }

  // =========================================================================================== PDF suelto del legajo / plano
  async function subirPdf(plazaId, file, op) {
    op = op || {};
    if (!file) return null;
    if (!v2()) throw new Error(textoFalta());
    if (file.size > TOPE_PDF) throw Object.assign(new Error("El PDF pesa " + fMB(file.size) + " y el tope es " + fMB(TOPE_PDF) + "."), { tipo: "final" });
    const b = new Blob([file], { type: "application/pdf" }), pg = await paginasPdf(b), ahora = Date.now();
    const base = { plazaId: String(plazaId), plazaNombre: nombreObra(plazaId), nombre: file.name || "documento.pdf", paginas: pg || 0, por: yoPersona(), ts: ahora, fecha: hoyISO(), usuario: yoMail() };
    return guardarArchivo(b, { tipo: "pdf", carpeta: "docs", ext: "pdf", mime: "application/pdf", nombre: base.nombre, plazaId, meta: Object.assign({ tipo: op.plano ? "plano" : "pdf", planoId: op.plano || undefined }, base), fo: Object.assign({ tipo: "pdf", plano: op.plano || "" }, base), plano: op.plano || null, espera: op.espera == null ? 25000 : op.espera });
  }
  // gancho de los planos de obra: el PDF original también a la nube (las hojas siguen como imágenes para verlas y anotar)
  window.__anPlano = function (file, planoId, plazaId) {
    try { if (off() || !v2() || !file || !(file.type === "application/pdf" || /\.pdf$/i.test(file.name || "")) || file.size > TOPE_PDF) return; subirPdf(plazaId, file, { plano: planoId, espera: 0 }).catch((e) => console.warn("[archivos] plano:", e)); } catch (e) { }
  };

  // =========================================================================================== ver (video y PDF)
  async function ver(id, a) {
    if (off()) return;
    if (!a) { try { a = await window.fbAdjuntoLeer(id); } catch (e) { a = null; } }
    let ov = $("anVer"); ov && ov.remove();
    ov = document.createElement("div"); ov.id = "anVer"; ov.className = "v7-ov no-print an-ov an-ver"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Ver video");
    ov.addEventListener("click", (e) => { if (e.target === ov) cerrarVer(); });
    if (!a) { ov.innerHTML = `<div class="v7-caja"><div class="v7-cab"><div><h3>🎥 Video</h3></div><button type="button" class="v7-x" data-an="xver" aria-label="Cerrar">✕</button></div><div class="an-bloq" role="status">Este video todavía no está en la nube (se sube desde el celu de quien lo grabó) o no se pudo leer. Probá en un rato.</div></div>`; document.body.appendChild(ov); return; }
    const t = [a.num || "", a.tarea || ""].filter(Boolean).join(" · ");
    const sub = [nombreObra(a.plazaId, a.plazaNombre), a.otNumero || "", fDia(a.ts) + " " + hhmm(a.ts || 0), String(a.por || "").split("@")[0], a.dur ? fDur(a.dur) : "", a.bytes ? fMB(a.bytes) : ""].filter(Boolean).join(" · ");
    const mover = oficina() && window.__moverFoto && !window.__v152No && !a.local ? `<button type="button" class="btn-ghost" data-an="mover">↔ Mover</button>` : "";
    ov.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>🎥 Video${t ? " · " + esc(t) : ""}</h3><small>${esc(sub)}</small></div><button type="button" class="v7-x" data-an="xver" aria-label="Cerrar">✕</button></div>
<div class="an-vid"><video id="anVideo" controls playsinline preload="metadata"${a.mini || a.dataUrl ? ` poster="${esc(a.mini || a.dataUrl)}"` : ""} src="${esc(a.url || "")}"></video></div>${a.nota ? `<div class="an-nota">${esc(a.nota)}</div>` : ""}${a.local ? `<div class="an-bloq" role="status">Todavía está en este celu: se sube solo.</div>` : ""}
<div class="an-dos"><button type="button" class="btn-ghost" data-an="bajar">⬇ Bajar</button><button type="button" class="btn-ghost" data-an="compartir">📤 Compartir</button>${mover}</div><div class="an-msg" id="anMsg" role="status" aria-live="polite"></div></div>`;
    ov.dataset.id = id; ov.__a = a;
    document.body.appendChild(ov);
  }
  function cerrarVer() { const v = $("anVer"); if (!v) return; try { const x = v.querySelector("video"); x && x.pause(); } catch (e) { } v.remove(); }
  const msgVer = (t, mal) => { const m = $("anMsg"); if (m) { m.textContent = t; m.classList.toggle("mal", !!mal); } };
  async function blobDe(a) {
    if (a.url && /^blob:/.test(a.url)) return (await fetch(a.url)).blob();
    if (a.r2) { const r = await fetch(WORKER + "/f/" + a.r2, { headers: { Authorization: "Bearer " + (await token()) } }); if (!r.ok) throw new Error("el servidor de fotos respondió " + r.status); return r.blob(); }
    if (a.dataUrl) return (await fetch(a.dataUrl)).blob();
    throw new Error("no hay archivo");
  }
  async function bajarOCompartir(a, compartir) {
    const nombre = a.nombre || ((a.tipo === "video" ? "video_" : "documento_") + limpio(a.plazaNombre || "") + "." + (a.mime === "video/mp4" ? "mp4" : a.tipo === "video" ? "webm" : "pdf"));
    msgVer(compartir ? "Preparando para compartir…" : "Bajando…");
    try {
      const b = await blobDe(a);
      const AN = window.__archivoNativo;
      if (AN && AN.guardar && (window.__cargador || intentar(() => window.Capacitor.isNativePlatform(), false))) { const r = await AN.guardar(b, nombre, compartir); msgVer((r && r.texto) || "✓ Listo."); return; }
      if (compartir && typeof File == "function" && navigator.canShare) { const f = new File([b], nombre, { type: b.type }); if (navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: nombre }); msgVer(""); return; } catch (e) { if (e && e.name === "AbortError") { msgVer(""); return; } } } }
      const u = URL.createObjectURL(b), x = document.createElement("a"); x.href = u; x.download = nombre; document.body.appendChild(x); x.click(); x.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
      msgVer(compartir ? "Este aparato no comparte archivos: se bajó (compartilo desde Descargas)." : "✓ Bajado.");
    } catch (e) { msgVer("⚠ No se pudo: " + ((e && e.message) || e), true); }
  }
  async function verPdf(id, a) {
    if (!a) { try { a = await window.fbAdjuntoLeer(id); } catch (e) { a = null; } }
    if (!a) { toast("Este PDF todavía no está en la nube (se sube desde el celu de quien lo cargó). Probá en un rato.", true); return; }
    try {
      const nombre = a.nombre || "documento.pdf";
      const b = a.dataUrl && /^data:/.test(a.dataUrl) ? await (await fetch(a.dataUrl)).blob() : await blobDe(a);
      const u = URL.createObjectURL(new Blob([b], { type: "application/pdf" })), x = document.createElement("a"); x.href = u; x.download = nombre; document.body.appendChild(x); x.click(); x.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
    } catch (e) { toast("⚠ No se pudo traer el PDF: " + ((e && e.message) || e), true); }
  }
  function toast(t, mal) {
    let d = $("anToast"); if (!d) { d = document.createElement("div"); d.id = "anToast"; d.setAttribute("role", "status"); d.setAttribute("aria-live", "polite"); document.body.appendChild(d); }
    d.textContent = t; d.classList.toggle("mal", !!mal); d.style.display = "block"; clearTimeout(d.__t); d.__t = setTimeout(() => { d.style.display = "none"; }, 5000);
  }

  // =========================================================================================== legajo: «🎥 Videos y PDF»
  function fila(x) {
    const est = x.local ? (EST[x.adjId] || {}) : null;
    const pend = est ? `<span class="an-est" role="status">${est.fase === "error" ? "⚠ " + esc(est.motivo || "no se pudo subir") : est.fase === "subiendo" ? "Subiendo " + Math.round((est.pct || 0) * 100) + " %" : "En el celu · se sube solo"}</span>` : "";
    if (x.tipo === "pdf") return `<button type="button" class="an-pdf" data-anpdf="${esc(x.adjId)}"><span class="an-pico">📄</span><span class="an-ptx"><b>${esc(x.nombre || "PDF")}</b><small>${[x.paginas ? x.paginas + (x.paginas === 1 ? " hoja" : " hojas") : "", x.bytes ? fMB(x.bytes) : "", fDia(x.ts), String(x.por || "").split("@")[0], x.plano ? "plano" : ""].filter(Boolean).join(" · ")}</small>${pend}</span></button>`;
    return `<button type="button" class="an-v" data-anver="${esc(x.adjId)}" aria-label="Ver video${x.num ? " de " + esc(x.num) : ""}"><span class="an-mini">${x.mini ? `<img src="${esc(x.mini)}" alt="">` : ""}<i class="an-play" aria-hidden="true">▶</i>${x.dur ? `<em>${fDur(x.dur)}</em>` : ""}</span><span class="an-vtx"><b>${esc(x.num || x.tarea || "Video")}</b><small>${[fDia(x.ts), String(x.por || "").split("@")[0], x.bytes ? fMB(x.bytes) : ""].filter(Boolean).join(" · ")}</small>${pend}</span></button>`;
  }
  function seccionHtml(id) {
    const l = deObra(id), vs = l.filter((x) => x.tipo !== "pdf"), ps = l.filter((x) => x.tipo === "pdf");
    const sube = puedeSubirVideo() && !esCrew();
    const bot = sube ? (v2() ? `<div class="an-dos"><button type="button" class="btn-primary" data-an="subirVideo">🎥 Subir video</button><button type="button" class="btn-ghost" data-an="subirPdf">📎 Subir PDF</button></div>` : `<div class="an-bloq" role="status">⚠ ${esc(textoFalta())}</div>`) : "";
    const carg = !VID[String(id)] && !l.length ? `<div class="an-nada">Buscando…</div>` : "";
    return `<h3>🎥 Videos y PDF</h3>${bot}<div class="an-msg" id="anLgMsg" role="status" aria-live="polite"></div>${carg}`
      + (vs.length ? `<div class="an-et">Videos (${vs.length})</div><div class="an-grilla">${vs.map(fila).join("")}</div>` : "")
      + (ps.length ? `<div class="an-et">PDF (${ps.length})</div><div class="an-lista">${ps.map(fila).join("")}</div>` : "")
      + (!vs.length && !ps.length && !carg ? `<div class="an-nada">Todavía no hay videos ni PDF de esta obra.${sube && v2() ? " Subí un video corto (hasta 2 min) o un PDF (hasta 25 MB)." : ""}</div>` : "");
  }
  function pintarLegajo() {
    let sec = $("lgVidSec");
    const f = $("lgFotosSec"), id = !off() && f && f.dataset.plaza ? f.dataset.plaza : "";
    if (!id) { sec && sec.remove(); return; }
    if (sec && sec.dataset.plaza !== String(id)) { sec.remove(); sec = null; }
    if (!sec) { sec = document.createElement("div"); sec.className = "card lg-sec an-sec"; sec.id = "lgVidSec"; sec.dataset.plaza = String(id); f.insertAdjacentElement("afterend", sec); setTimeout(() => cargarObra(id, false), 2500); revisar(false); }
    const h = seccionHtml(id);
    if (sec.__h !== h) { const m = $("anLgMsg"), mt = m ? m.innerHTML : ""; sec.innerHTML = h; sec.__h = h; const m2 = $("anLgMsg"); if (m2 && mt) m2.innerHTML = mt; }
    try { window.__lgPleg && window.__lgPleg.aplicar(); } catch (e) { }
  }
  // avance nuevo (v158): en la hoja de una columna, sus videos y PDF como evidencia (no cuentan como foto de la columna)
  function evidenciaHtml(obraId, num) {
    if (off()) return "";
    cargarObra(obraId, false);
    const l = deObra(obraId).filter((x) => mismaCol(x.num, num));
    return `<div class="an-evid" data-anevid="${esc(obraId)}|${esc(num)}">${l.length ? `<div class="a2-et">🎥 Videos y PDF de ${esc(num)} <small>(evidencia: no cuentan como foto)</small></div><div class="an-grilla">${l.map(fila).join("")}</div>` : ""}</div>`;
  }
  function pintarEvid() {
    document.querySelectorAll("[data-anevid]").forEach((d) => { const p = d.dataset.anevid.split("|"), n = document.createElement("div"); n.innerHTML = evidenciaHtml(p[0], p.slice(1).join("|")); const h = n.firstChild ? n.firstChild.innerHTML : ""; if (d.innerHTML !== h && d.__h !== h) { d.innerHTML = h; d.__h = h; } });
  }

  // =========================================================================================== botones en Modo obra, Mis tareas y la cámara
  function botonObra(o, pa) {
    if (off() || !o || !esCrew()) return "";
    const it = pa && pa.it, k = pa && pa.p ? pa.p.k : "", cat = pa && pa.u ? pa.u.cat || "" : "";
    return `<button type="button" class="cd-link an-cdvid" data-anvid="obra" data-ot="${esc(o.id)}" data-k="${esc(k)}" data-num="${esc(it ? it.num : "")}" data-cat="${esc(cat)}">🎥 Video</button>`;
  }
  const envolverMt = () => {
    const o0 = window.__mtComoLlegar; if (typeof o0 != "function") return false; if (o0.__an) return true;
    const n = function (ot, chico) { const h = o0.apply(this, arguments); try { return chico || off() || !ot || !esCrew() || ot.estado === "Terminada" || ot.estado === "Anulada" ? h : h + `<button type="button" class="btn-ghost an-mtvid no-print" data-anvid="ot" data-ot="${esc(ot.id)}">🎥 Video</button>`; } catch (e) { return h; } };
    window.__heredar && window.__heredar(n, o0); n.__an = 1; window.__mtComoLlegar = n; return true;
  };
  function botonCamara() {
    const cam = $("emaCam"); if (!cam || off() || !puedeSubirVideo()) return;
    if (cam.querySelector("#anCamVid")) return;
    cam.insertAdjacentHTML("beforeend", `<button type="button" id="anCamVid" class="an-camvid" data-anvid="cam" aria-label="Grabar un video">🎥<span>Video</span></button>`);
  }
  function ctxCamara() {
    const e = intentar(() => (window.__camB && window.__camB.estado ? window.__camB.estado() : null), null) || {};
    const ctx = { desde: "cam" };
    if (e.obra && e.obra.id) { ctx.plazaId = String(e.obra.id); ctx.plazaNombre = e.obra.nombre || ""; }
    const otId = e.ot || e.otHoy || ""; if (otId && (!ctx.plazaId || String((otDe(otId) || {}).plazaId) === ctx.plazaId)) ctx.otId = otId;
    if (e.k) ctx.k = e.k; if (e.num) ctx.num = e.num; if (e.cat) ctx.cat = e.cat;
    return ctx;
  }

  // =========================================================================================== mover (v152): un video sigue siendo video
  const envolverMover = () => {
    const M = window.__moverFoto; if (!M || typeof M.mover != "function") return false; if (M.mover.__an) return true;
    const o = M.mover;
    const n = async function (ids, dest) {
      const r = await o.apply(this, arguments);
      try {
        if (!off() && dest && dest.otId) {
          const vids = arr(ids).filter((id) => obras().some((ob) => deObra(ob.id).some((x) => x.adjId === id && x.tipo === "video")));
          if (vids.length && typeof window.fbOtCampo == "function") {
            const p = {}, FV = firebase.firestore.FieldValue;
            vids.forEach((id) => { p["campo.fotos." + Lk(id)] = FV.delete(); p["campo.videos." + Lk(id)] = { por: yoPersona(), ts: Date.now(), movida: true, num: dest.num || "", k: dest.k || "" }; });
            await window.fbOtCampo(dest.otId, p);
          }
        }
      } catch (e) { console.warn("[archivos] mover video:", e); }
      return r;
    };
    window.__heredar && window.__heredar(n, o); n.__an = 1; M.mover = n; return true;
  };

  // =========================================================================================== clics
  document.addEventListener("click", (e) => {
    if (off()) return;
    const t = e.target; if (!t || !t.closest) return;
    const vb = t.closest("[data-anvid]");
    if (vb) {
      e.preventDefault(); e.stopPropagation();
      const q = vb.dataset.anvid;
      if (q === "obra") return abrirVideo({ otId: vb.dataset.ot, k: vb.dataset.k || "", num: vb.dataset.num || "", cat: vb.dataset.cat || "", desde: "obra" });
      if (q === "ot") return abrirVideo({ otId: vb.dataset.ot, desde: "mt" });
      if (q === "cam") { const ctx = ctxCamara(); try { window.camaraApp && window.camaraApp.cerrar && window.camaraApp.cerrar(); } catch (x) { } return abrirVideo(ctx); }
      return;
    }
    const vv = t.closest("[data-anver]"); if (vv) { e.preventDefault(); e.stopPropagation(); return ver(vv.dataset.anver); }
    const vp = t.closest("[data-anpdf]"); if (vp) { e.preventDefault(); e.stopPropagation(); return verPdf(vp.dataset.anpdf); }
    const b = t.closest("[data-an]"); if (!b) return;
    const a = b.dataset.an;
    if (a === "x") { e.preventDefault(); return cerrarHoja(); }
    if (a === "xver") { e.preventDefault(); return cerrarVer(); }
    if (a === "grabar" || a === "elegir") { e.preventDefault(); if (!H) return; const nt = $("anNota"), tv = $("anTarea"), cv = $("anCol"); if (nt) H.ctx.nota = nt.value; if (tv) H.ctx.k = tv.value; if (cv) H.ctx.num = cv.value; const i = inputVideo(a === "grabar"); i.value = ""; i.click(); return; }
    if (a === "cancelar") { e.preventDefault(); if (H) H.cancel = true; return; }
    if (a === "otro") { e.preventDefault(); if (H) { H.fase = "elegir"; H.antes = 0; H.txt = ""; pintarHoja(); } return; }
    if (a === "bajar" || a === "compartir") { e.preventDefault(); const ov = $("anVer"); ov && ov.__a && bajarOCompartir(ov.__a, a === "compartir"); return; }
    if (a === "mover") { e.preventDefault(); const ov = $("anVer"); if (ov && window.__moverFoto) { const id = ov.dataset.id; cerrarVer(); try { window.__moverFoto.abrir([id]); } catch (x) { } } return; }
    if (a === "subirVideo") { e.preventDefault(); const s = $("lgVidSec"); if (!s) return; return abrirVideo({ plazaId: s.dataset.plaza, desde: "legajo" }); }
    if (a === "subirPdf") { e.preventDefault(); const s = $("lgVidSec"); if (!s) return; const i = inputPdf(); i.dataset.plaza = s.dataset.plaza; i.value = ""; i.click(); return; }
  }, true);
  document.addEventListener("change", (e) => {
    if (off()) return;
    const t = e.target; if (!t) return;
    if (t.id === "anVidCam" || t.id === "anVidGal") { const f = t.files && t.files[0]; t.value = ""; if (f) videoElegido(f); return; }
    if (t.id === "anPdfIn") {
      const f = t.files && t.files[0], plaza = t.dataset.plaza; t.value = ""; if (!f) return;
      const m = (x, mal) => { const d = $("anLgMsg"); if (d) { d.textContent = x; d.classList.toggle("mal", !!mal); } };
      if (!(f.type === "application/pdf" || /\.pdf$/i.test(f.name || ""))) return m("⚠ Elegí un archivo PDF.", true);
      m("Subiendo el PDF…");
      subirPdf(plaza, f).then((r) => { m(r.listo ? "✓ PDF guardado (" + fMB(f.size) + ")." : "📥 El PDF quedó en el celu y se sube solo cuando haya señal."); refrescar(); }, (er) => m("⚠ " + ((er && er.message) || er), true));
    }
  });

  // =========================================================================================== repintar
  let tR = 0, tS = 0;
  function refrescar() { clearTimeout(tR); tR = setTimeout(() => { try { pintarLegajo(); pintarEvid(); } catch (e) { } }, 30); }
  function refrescarSuave() { if (tS) return; tS = setTimeout(() => { tS = 0; refrescar(); }, 400); }
  const enganchar = () => { const a = $("obrasApp"); if (!a) return setTimeout(enganchar, 700); if (a.__anObs) return; a.__anObs = 1; new MutationObserver(() => requestAnimationFrame(() => { try { pintarLegajo(); } catch (e) { } })).observe(a, { childList: true }); };
  enganchar();
  new MutationObserver(() => { if (!off() && $("emaCam") && !$("anCamVid")) botonCamara(); }).observe(document.body, { childList: true });
  setInterval(() => { if (off() || document.hidden) return; try { if ($("lgFotosSec")) pintarLegajo(); else { const s = $("lgVidSec"); s && s.remove(); } } catch (e) { } }, 2000);
  window.addEventListener("fotos-movidas", () => { Object.keys(VID).forEach((k) => { VID[k].ts = 0; }); refrescar(); });
  // lo que viaja en el latido de presencia: archivos esperando en el celu
  const envolverDisp = () => { const o = window.__dispExtra; if (typeof o != "function") return false; if (o.__an) return true; const n = function () { const r = o.apply(this, arguments) || {}; if (!off()) r.archivosPend = cantidad(); return r; }; n.__an = 1; window.__dispExtra = n; return true; };
  const ganchos = () => { if (off()) return setTimeout(ganchos, 3000); const ok = [envolverGuardar(), envolverLeer(), envolverVerAdj(), envolverFotosObra(), envolverMt(), envolverMover(), envolverDisp()]; if (ok.some((x) => !x)) setTimeout(ganchos, 500); };
  ganchos();

  window.__archivosNube = {
    worker: WORKER, v2, revisar, estadoServidor: () => Object.assign({}, SV, { v2: v2() }), topePdf, textoFalta,
    guardarArchivo, subirBlob, subirPdf, procesarTodo, pendientes, cantidad, estadoDe, enEspera, ultimo: () => ULT.r,
    leerVideo, achicar, fijarDuracion, puedeAchicar, elegirMime, paginasPdf,
    abrirVideo, cerrarHoja, videoElegido, ver, cerrarVer, verPdf, deObra, cargarObra, evidenciaHtml, botonObra, botonCamara, pintarLegajo,
    puedeSubirVideo, puedeVer, oficina, esVideo, esPdf, mismaCol, TOPE_SEG, TOPE_PDF, estado: () => ({ H: H ? { fase: H.fase, pct: H.pct, txt: H.txt, antes: H.antes, despues: H.despues, id: H.id, dur: H.dur } : null, pend: cantidad(), v2: v2() })
  };
})();
