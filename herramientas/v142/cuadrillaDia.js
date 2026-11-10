(function () {
  "use strict";
  // v142 · La cuadrilla nueva: «Modo obra» con un solo botón gigante y todo el recorrido del día (maquetas aprobadas por
  // Ángel el 10/11/2026, opción E). Para cuadrilla y operario, en el celu, en la app de Android y en la compu.
  //  · Inicio «Hoy»: la obra del día (dirección, «📍 Cómo llegar»), sus tareas, avisos nuevos y puntos de la quincena.
  //  · La orden del día → Seguridad antes de arrancar (checklist con tilde y foto) → Antes de salir (material de la reserva o
  //    de los vales, herramientas sugeridas por tarea, aviso armado sin IA) → Cómo llegar (mapa con el pin de la obra) →
  //    Modo obra: un botón redondo que va cambiando «Llegué» (GPS) → «Foto · Col N» → «Terminé» (horas con − / +,
  //    «Se hizo» / «No se hizo (decí por qué)») y pasa solo a la columna o tarea siguiente → Fin del día → Mis puntos.
  //  · Abajo: «Falta material» (avisa al pañol y a la oficina), «Ayuda» (asistente, cómo se hace, llamar) y «Llamar a la oficina».
  //  · POR DENTRO ES LO MISMO DE MIS TAREAS (no hay otro camino de datos): fotos por unidad con la cámara de la app y el sello
  //    (guardarFotoObra → campo.fotos), marcas (__mtAPI.marcar → __marcaEquipo), horas por tarea (campo.horasTarea), envío por
  //    tarea (campo.tareaEnv, como envioTarea) y el envío de la orden (campo.enviados / campo.horas). La oficina cierra igual.
  //  · Lo nuevo va todo en «campo» de la orden (lo único que la cuadrilla puede tocar): campo.seguridad.<persona> {items, fotos,
  //    ts, motivo}, campo.salida.<persona>, campo.llegada.<persona>, campo.pasosObra.<tarea>.<unidad> (la hora de cada columna)
  //    y campo.faltaMaterial.<id>. Los contactos, la foto de la seguridad por ítem y las herramientas por tarea los carga la
  //    oficina en configEquipo/personal (Producción › Personal del equipo › «👷 La cuadrilla en obra»). Sin reglas nuevas.
  //  · Mis tareas «clásica» sigue entera: «Ver lista completa». Las pruebas viejas no ven nada de esto (__crewViejo).
  if (window.__cuadrillaDia) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const Lk = (s) => String(s || "").replace(/[~*\/\[\].`]/g, "_").slice(0, 120) || "_";
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const arr = (x) => (Array.isArray(x) ? x : []);
  const fmtN = (n, d) => { const x = Number(n) || 0; return x.toLocaleString("es-AR", { minimumFractionDigits: d || 0, maximumFractionDigits: d == null ? 2 : d }); };
  const pad = (n) => String(n).padStart(2, "0");
  const hoyISO = () => (typeof fechaAISO == "function" ? fechaAISO(new Date()) : new Date().toISOString().slice(0, 10));
  const hhmm = (ts) => { const d = new Date(ts); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const ahoraHM = () => hhmm(Date.now());
  const minDe = (h) => { const m = String(h || "").match(/^(\d{1,2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : null; };
  const hmDe = (m) => { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); };
  const primero = (n) => String(n || "").trim().split(/\s+/)[0] || "";
  const inic = (n) => String(n || "?").trim().split(/\s+/).slice(0, 2).map((a) => a[0] || "").join("").toUpperCase() || "?";
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"], MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const fCorta = (f) => { const p = String(f || "").split("-"); return p.length === 3 ? p[2] + "/" + p[1] : String(f || ""); };
  const intentar = (fn, def) => { try { return fn(); } catch (e) { return def; } };

  // ------------------------------------------------------------------------------------------- íconos (línea, como el Inicio)
  const IC = {
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    campana: '<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5h-14z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    tel: '<path d="M6.5 3.5h3l1.5 4.5-2 1.3a10 10 0 0 0 5.7 5.7l1.3-2 4.5 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>',
    ayuda: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.7M12 16.8v.2"/>',
    alerta: '<path d="M12 3.5l9 16H3z"/><path d="M12 10v4.5M12 17.3v.2"/>',
    camara: '<path d="M4 8.5h3l1.8-2.5h6.4L17 8.5h3v10H4z"/><circle cx="12" cy="13.2" r="3.2"/>',
    tilde: '<path d="M5.5 12.5l4.2 4.2L18.5 8"/>',
    check: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.3l2.4 2.4 4.6-4.9"/>',
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    volver: '<path d="M14.5 6L8.5 12l6 6"/>',
    chev: '<path d="M9.5 6.5L15 12l-5.5 5.5"/>',
    estrella: '<path d="M12 3.8l2.5 5.2 5.6.7-4.1 3.9 1 5.6-5-2.8-5 2.8 1-5.6L3.9 9.7l5.6-.7z"/>',
    orden: '<rect x="5.5" y="4.5" width="13" height="16" rx="2.5"/><path d="M9 3.5h6v3H9z"/><path d="M8.8 11.5h6.4M8.8 15h4.2"/>',
    herr: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.4-3.4a5.5 5.5 0 0 1-7.4 7.4l-6.6 6.6a2.1 2.1 0 0 1-3-3l6.6-6.6a5.5 5.5 0 0 1 7.4-7.4z"/>',
    col: '<path d="M12 21V6M12 6h5.5M8.5 21h7"/><circle cx="18" cy="6.5" r="1.2"/>',
    caja: '<path d="M3.5 7.5L12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5L12 11.5l8.5-4M12 11.5v9"/>',
    camion: '<path d="M3.5 6.5h10v9h-10z"/><path d="M13.5 9.5h4l3 3v3h-7z"/><circle cx="7" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/>',
    perfil: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.8-3.9 3.9-6 7.5-6s6.7 2.1 7.5 6"/>',
    ia: '<path d="M12 3.5l1.7 4.6 4.6 1.7-4.6 1.7L12 16.1l-1.7-4.6-4.6-1.7 4.6-1.7z"/><path d="M18.5 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
    libro: '<path d="M4 5.5A2 2 0 0 1 6 3.5h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20.5V5.5M8 7.5h7"/>',
    wa: '<path d="M4.5 19.5l1.2-3.6A7.8 7.8 0 1 1 8.6 18.6z"/><path d="M9.3 8.6c.3 2.7 2.4 5 5.2 5.6l1-1.1-1.7-.9-.8.8c-1-.4-1.9-1.3-2.3-2.3l.8-.8-.9-1.7z"/>',
    nube: '<path d="M7 18.5h10a4 4 0 0 0 .6-8A5.5 5.5 0 0 0 7 9.8 4.4 4.4 0 0 0 7 18.5z"/><path d="M4 4l16 16"/>',
    casco: '<path d="M4 16.5h16M5.5 16.5a6.5 6.5 0 0 1 13 0"/><path d="M10.5 10.5V8h3v2.5"/>',
    arnes: '<circle cx="12" cy="5.5" r="2"/><path d="M8 9.5l4 3 4-3M12 12.5V20M8 9.5v6M16 9.5v6"/>',
    guante: '<path d="M8 21v-6.5L5.5 11a1.5 1.5 0 0 1 2.4-1.7L9 10.5V5a1.5 1.5 0 0 1 3 0v4.5V4a1.5 1.5 0 0 1 3 0v6V6a1.5 1.5 0 0 1 3 0v8.5a6.5 6.5 0 0 1-2 4.6V21"/>',
    botin: '<path d="M7 3.5h5v9l6.5 2.5a2 2 0 0 1 1.5 2v2.5H5v-6z"/>',
    cono: '<path d="M9.5 4.5h5l3.5 14h-12z"/><path d="M4 18.5h16M8 13h8M9 8.5h6"/>',
    hidro: '<path d="M3.5 17.5h11"/><circle cx="6" cy="18.5" r="1.5"/><circle cx="12" cy="18.5" r="1.5"/><path d="M8 15.5l7-9h3.5v3H16"/>',
    reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    rayo: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
    mas: '<path d="M12 6v12M6 12h12"/>', menos: '<path d="M6 12h12"/>', cruz: '<path d="M6 6l12 12M18 6L6 18"/>'
  };
  const ic = (k, cls, w) => `<svg class="cd-ic${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || ""}</svg>`;

  // ------------------------------------------------------------------------------------------- quién soy y si va lo nuevo
  const yo = () => intentar(() => (window.PERMISOS && PERMISOS.yo && PERMISOS.yo()) || null, null);
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  const on = () => !window.__crewViejo && esCrew();
  const API = () => window.__mtAPI || null;
  const per = () => { const a = API(); const p = a ? intentar(() => a.persona(), "") : ""; if (p) return p; const y = yo() || {}; return y.persona || y.nombre || ""; };
  const clave = () => { const y = yo() || {}; return y.personaClave || nk(y.persona || y.nombre || ""); };
  const miEmail = () => String((window.__fbUser && window.__fbUser.email) || "").toLowerCase();
  const ots = () => intentar(() => (Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []);
  const otDe = (id) => ots().find((o) => o && o.id === id) || null;
  const obras = () => intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []);
  const obraDe = (o) => (o ? obras().find((x) => String(x.id) === String(o.plazaId)) || null : null);
  const campo = (o) => obj(o && o.campo);
  const cerrada = (o) => !!(o && (o.estado === "Terminada" || o.estado === "Anulada" || (o.cierre && o.cierre.cerradoTs)));
  const soyDe = (o) => { const c = clave(), p = nk(per()); return !!o && ((c && arr(o.personalNombres).indexOf(c) >= 0) || arr(o.personal).some((x) => nk(typeof x == "string" ? x : x && x.nombre) === p)); };
  const misOtsHoy = () => { const h = hoyISO(); return ots().filter((o) => o && o.estado !== "Anulada" && String(o.fecha || "") === h && soyDe(o)).sort((a, b) => String(a.horaInicio || "").localeCompare(String(b.horaInicio || ""))); };
  const proximas = () => { const h = hoyISO(); return ots().filter((o) => o && !cerrada(o) && String(o.fecha || "") > h && soyDe(o)).sort((a, b) => String(a.fecha).localeCompare(String(b.fecha))); };
  const tareas = (o) => { const a = API(); return a && o ? intentar(() => a.tareas(o) || [], []) : []; };
  const marca = (o, k) => { const a = API(); return a ? intentar(() => a.marca(o, k), null) : null; };
  const fotosDe = (o, k) => { const a = API(); return a ? intentar(() => a.fotos(o, k) || [], []) : []; };
  const envDe = (o, k) => { const x = obj(campo(o).tareaEnv)[Lk(k)]; const l = Object.keys(obj(x)).map((q) => x[q]).filter((v) => v && v.estado); return l.length ? l.sort((a, b) => (b.ts || 0) - (a.ts || 0))[0] : null; };
  const horasDe = (o, k) => obj(obj(campo(o).horasTarea)[k]);
  const pasosDe = (o, k) => obj(obj(campo(o).pasosObra)[Lk(k)]);
  const pasoDe = (o, k, num) => obj(pasosDe(o, k)[Lk(nk(num))]).ts ? pasosDe(o, k)[Lk(nk(num))] : null;
  const mio = (o, que) => { const x = obj(campo(o)[que]); return x[Lk(clave())] || x[Lk(per())] || null; };
  const cfg = () => obj(window.__personalNube);
  const guardar = (o, patch) => { const a = API(); if (!a || !o) return false; if (o.estado === "Emitida" && !("estado" in patch)) patch.estado = "En curso"; a.guardar(o, patch); return true; };
  const avisar = (t, tipo) => { try { if (typeof window.mostrarAviso == "function") return window.mostrarAviso(t, tipo); } catch (e) { } S.msg = t; pintar(); };

  // ------------------------------------------------------------------------------------------- estado de la pantalla
  const KEY = "ema.cd";
  const S = { pant: "hoy", otId: "", pila: [], pos: null, posTs: 0, segTmp: {}, salidaTmp: {}, falta: {}, msg: "", toast: "", toastTs: 0, ultFoto: null };
  try { const g = JSON.parse(localStorage.getItem(KEY) || "null"); if (g && g.dia === hoyISO()) { S.pant = g.pant || "hoy"; S.otId = g.otId || ""; } } catch (e) { }
  const recordar = () => { try { localStorage.setItem(KEY, JSON.stringify({ dia: hoyISO(), pant: S.pant, otId: S.otId })); } catch (e) { } };
  function otActual() {
    let o = S.otId ? otDe(S.otId) : null;
    if (o && String(o.fecha || "") === hoyISO() && o.estado !== "Anulada") return o;
    const l = misOtsHoy(); o = l.find((x) => !cerrada(x) && tareas(x).some((p) => !envDe(x, p.k))) || l.find((x) => !cerrada(x)) || l[0] || null;
    S.otId = o ? o.id : ""; return o;
  }
  function ir(p, sinPila) {
    if (!sinPila && S.pant !== p) S.pila.push(S.pant);
    if (p === "hoy") S.pila = [];
    S.pant = p; S.msg = ""; recordar(); pintar(true);
    try { window.scrollTo(0, 0); } catch (e) { }
    if (p === "obra" || p === "llegar") pedirGPS();
    if (p === "salir") cargarHerramientas();
    if (p === "llegar") setTimeout(mapaLlegar, 60);
    setTimeout(() => { try { window.__atras && window.__atras.sync && window.__atras.sync(); } catch (e) { } }, 30);
  }
  function volver() { const p = S.pila.pop() || "hoy"; S.pant = p; recordar(); pintar(true); if (p === "llegar") setTimeout(mapaLlegar, 60); }

  // ------------------------------------------------------------------------------------------- GPS
  function dist(a, b) { const R = 6371000, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lng - a.lng) * r, x = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.min(1, Math.sqrt(x))); }
  const distTxt = (m) => (m < 1000 ? Math.round(m) + " m" : fmtN(m / 1000, 1) + " km");
  function pedirGPS(cb) {
    const listo = (p) => { if (p) { S.pos = p; S.posTs = Date.now(); } cb ? cb(S.pos) : pintar(); };
    try { const v = typeof window.__fotoGpsVivo == "function" ? window.__fotoGpsVivo() : null; if (v && v.lat != null && Date.now() - (v.ts || 0) < 60000 && !cb) { S.pos = { lat: +v.lat, lng: +v.lng, acc: Math.round(v.prec || v.acc || 0) }; S.posTs = Date.now(); } } catch (e) { }
    if (!navigator.geolocation) return listo(null);
    let hecho = false; const fin = (p) => { if (hecho) return; hecho = true; listo(p); };
    try { navigator.geolocation.getCurrentPosition((p) => fin({ lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.round(p.coords.accuracy || 0) }), () => fin(null), { enableHighAccuracy: true, maximumAge: 30000, timeout: 9000 }); } catch (e) { fin(null); }
    setTimeout(() => fin(null), 10000);
  }
  const coordObra = (o) => { const b = obraDe(o) || {}, la = Number(b.lat), lo = Number(b.lng); return isFinite(la) && isFinite(lo) && (la || lo) ? { lat: la, lng: lo } : null; };
  const CERCA = 150;

  // ------------------------------------------------------------------------------------------- unidades de cada tarea
  const pideNum = (c) => intentar(() => !!(window.catFotoPideNum && window.catFotoPideNum(c)), false);
  const catDe = (p) => intentar(() => (window.catFotoDeTarea ? window.catFotoDeTarea(p.label) : "otra"), "otra");
  const porMetro = (p) => /metro|\bm\b|ml/i.test(String(p.un || ""));
  const PREF = { columna: "Col", caja: "Caja", luminaria: "Lum", pat: "PAT" };
  const COSA = { columna: "columna", caja: "caja", luminaria: "luminaria", pat: "jabalina" };
  function siguiente(n) { const m = String(n || "").match(/^(.*?)(\d+)(\D*)$/); return m ? m[1] + (+m[2] + 1) + m[3] : ""; }
  function fotosConNombre(fs) { const v = new Map(); fs.slice().sort((a, b) => ((a[1] && a[1].ts) || 0) - ((b[1] && b[1].ts) || 0)).forEach(([id, f]) => { if (!f || !f.num) return; const k = nk(f.num); v.has(k) || v.set(k, { id, num: f.num, mini: f.mini || "" }); }); return v; }
  function unidades(o, p) {
    const cat = catDe(p), fs = fotosDe(o, p.k), con = fotosConNombre(fs);
    if (pideNum(cat) && !porMetro(p)) {
      const m = marca(o, p.k) || {}, base = p.repartida && p.mio > 0 ? p.mio : p.prev;
      const n = Math.min(40, Math.max(1, Math.ceil(Number(base) || 0), con.size));
      const usados = new Set(), lista = [];
      const enObra = new Set(); ots().forEach((x) => { if (x && x.id !== o.id && String(x.plazaId || "") === String(o.plazaId || "")) Object.keys(obj(campo(x).fotos)).forEach((q) => { const f = campo(x).fotos[q]; if (f && !f.borrada && f.cat === cat && f.num) enObra.add(nk(f.num)); }); });
      con.forEach((v, k) => { usados.add(k); lista.push({ num: v.num, foto: v, mini: v.mini }); });
      Object.keys(pasosDe(o, p.k)).forEach((q) => { const x = pasosDe(o, p.k)[q]; if (x && x.num && !usados.has(nk(x.num))) { usados.add(nk(x.num)); lista.push({ num: x.num, foto: null }); } });
      const nombres = intentar(() => (typeof window.puntosDeObra == "function" && o.plazaId ? window.puntosDeObra(o.plazaId).lista || [] : []), []);
      const libres = nombres.filter((x) => !enObra.has(nk(x)) && !usados.has(nk(x)));
      let ult = lista.length ? lista[lista.length - 1].num : "";
      if (!ult && !libres.length) { let mx = 0; enObra.forEach((x) => { const mm = x.match(/(\d+)\D*$/); if (mm) mx = Math.max(mx, +mm[1]); }); ult = (PREF[cat] || "Unidad") + " " + mx; }
      let li = 0;
      while (lista.length < n) { let nm = libres[li++] || siguiente(ult) || (PREF[cat] || "Unidad") + " " + (lista.length + 1); while (usados.has(nk(nm))) nm = siguiente(nm) || nm + "b"; usados.add(nk(nm)); lista.push({ num: nm, foto: null }); ult = nm; }
      lista.forEach((u) => { u.paso = pasoDe(o, p.k, u.num); });
      // las que tienen paso o foto primero (en el orden en que se hicieron), las que faltan después
      return { tipo: "unidad", cat, items: lista, cosa: COSA[cat] || "unidad" };
    }
    const tomas = intentar(() => (typeof window.tomasDeTarea == "function" ? window.tomasDeTarea(p) || [] : []), []).filter((x) => x && x.oblig);
    return { tipo: "tomas", cat, items: tomas.map((t) => ({ num: t.t, foto: fs.find(([, f]) => f && nk(f.num) === nk(t.t)) || null })), cosa: "foto" };
  }
  // el paso que toca ahora en la orden
  function pasoActual(o) {
    if (!o) return { fase: "sin" };
    if (!mio(o, "llegada")) return { fase: "llegue" };
    const ts = tareas(o);
    for (let i = 0; i < ts.length; i++) {
      const p = ts[i]; if (envDe(o, p.k)) continue;
      const u = unidades(o, p);
      if (u.tipo === "unidad") {
        const it = u.items.find((x) => !x.paso);
        if (it) return { fase: it.foto ? "termine" : "foto", p, u, it, ti: i, tn: ts.length };
        return { fase: "termine", p, u, it: null, ti: i, tn: ts.length };
      }
      const it = u.items.find((x) => !x.foto);
      return { fase: it ? "foto" : "termine", p, u, it: it || null, ti: i, tn: ts.length };
    }
    return { fase: "fin", tn: ts.length };
  }

  // ------------------------------------------------------------------------------------------- seguridad
  const SEG = [["casco", "Casco", "casco"], ["arnes", "Arnés", "arnes"], ["guantes", "Guantes dieléctricos", "guante"], ["botines", "Botines", "botin"], ["conos", "Conos y vallado", "cono"], ["equipo", "Equipo revisado", "hidro"]];
  const SEG_FOTO_DEF = { casco: "no", arnes: "no", guantes: "no", botines: "no", conos: "oblig", equipo: "oblig" };
  const fotoSeg = (id) => { const c = obj(cfg().seguridadCuadrilla); return c[id] === "no" || c[id] === "opc" || c[id] === "oblig" ? c[id] : SEG_FOTO_DEF[id]; };
  const segMia = (o) => obj(mio(o, "seguridad"));
  const segItems = (o) => Object.assign({}, obj(segMia(o).items), S.segTmp[o.id] || {});
  const segFotos = (o) => obj(segMia(o).fotos);
  const segOk = (o, id) => !!segItems(o)[id] && (fotoSeg(id) !== "oblig" || !!segFotos(o)[id]);
  const segListos = (o) => SEG.filter((s) => segOk(o, s[0])).length;
  const corteDe = (o) => { const s = obj(campo(o).seguridad); return s.corte || ""; };
  const segHecha = (o) => !!segMia(o).ts;

  // ------------------------------------------------------------------------------------------- material y herramientas
  const EST_RS = { solicitada: "por aprobar", pendiente: "aprobada", alistando: "la están preparando", lista: "lista", entregada: "entregada" };
  const cat0 = () => { const m = new Map(); intentar(() => (typeof window.catalogoCompleto == "function" ? window.catalogoCompleto() : typeof window.catalogo == "function" ? window.catalogo() : []).forEach((x) => m.set(String(x.codigo), x)), null); return m; };
  function materialDe(o) {
    if (!o) return { items: [], reservas: [], fuente: "" };
    const C = cat0(), rsT = arr(window.reservasMaterial).filter((r) => r && !/anulada|rechazada/.test(String(r.estado || "")));
    let rs = rsT.filter((r) => r.otId && r.otId === o.id);
    if (!rs.length) rs = rsT.filter((r) => !r.otId && o.plazaId && String(r.plazaId || "") === String(o.plazaId) && (!r.fechaNecesaria || String(r.fechaNecesaria) >= String(o.fecha || "").slice(0, 10) || r.estado !== "entregada"));
    const items = [];
    rs.forEach((r) => arr(r.items).forEach((it) => {
      const cod = String(it.codigo == null ? "" : it.codigo), c = C.get(cod) || {}, cant = Number(it.cantidad != null ? it.cantidad : it.cant) || 0, ent = Number(it.entregado) || 0;
      const ret = r.estado === "entregada" || (cant > 0 && ent >= cant);
      items.push({ cod, desc: it.desc || c.desc || "Material " + cod, un: it.un || c.un || "Un.", cant, ret, rs: r.numero || "", est: r.estado, nohay: !!it.nohay });
    }));
    if (items.length) return { items, reservas: rs, fuente: "reserva" };
    const mv = arr(window.stockMovimientos).filter((m) => m && m.tipo === "salida" && !m.anulado && !m.anulada && ((o.plazaId && String(m.plazaId || "") === String(o.plazaId) && String(m.fecha || "") >= String(o.fecha || "")) || (m.para && nk(m.para) === nk(per()) && String(m.fecha || "") === hoyISO())));
    const ag = new Map();
    mv.forEach((m) => { const cod = String(m.codigo), c = C.get(cod) || {}; const x = ag.get(cod) || { cod, desc: m.desc || c.desc || "Material " + cod, un: m.un || c.un || "Un.", cant: 0, ret: true, rs: m.numero || "" }; x.cant += Number(m.cantidad) || 0; ag.set(cod, x); });
    return { items: [...ag.values()], reservas: [], fuente: ag.size ? "vales" : "" };
  }
  // herramientas sugeridas por tarea · «a confirmar»: Ángel / la oficina las cambian en Producción › Personal del equipo
  const HERR_DEF = [
    [/montaje|izaje|izado|columna|aplomado/, ["Hidroelevador", "Eslingas", "Nivel", "Llaves (juego)"]],
    [/vinculo|luminaria|brazo|capuchon/, ["Hidroelevador", "Llaves (juego)", "Pinza universal"]],
    [/bpn|bornera|tablerito|caja|conexion|sellado/, ["Pinza crimpeadora", "Pinza pelacables", "Destornilladores", "Probador de tensión"]],
    [/zanj|tendido|cable|cruce|tunelera/, ["Pala", "Pico", "Cinta métrica"]],
    [/fundac|excav|hormig|pozo/, ["Pala", "Hormigonera", "Nivel", "Cinta métrica"]],
    [/\bpat\b|tierra|jabalina/, ["Telurímetro", "Maza", "Pinza crimpeadora"]],
    [/acometida|tablero|medicion|aislacion/, ["Pinza amperométrica", "Probador de tensión", "Escalera"]],
    [/poda/, ["Motosierra", "Escalera"]]
  ];
  const HERR_BASE = ["Conos y vallado", "EPP (casco, arnés, guantes)"];
  function herrDeTarea(p) {
    const ov = obj(cfg().herrPorTarea);
    if (ov[p.k] && arr(ov[p.k]).length) return arr(ov[p.k]);
    const t = nk(p.k + " " + p.label), r = HERR_DEF.find((x) => x[0].test(t));
    return r ? r[1] : [];
  }
  let herrCache = null, herrTs = 0, herrPidiendo = false;
  function listaHerr() { return Array.isArray(window.__herramientasLista) ? window.__herramientasLista : herrCache || []; }
  function cargarHerramientas() {
    if (Array.isArray(window.__herramientasLista) || herrPidiendo || (herrCache && Date.now() - herrTs < 6e5)) return;
    try {
      if (!window.firebase || !firebase.firestore) return;
      herrPidiendo = true;
      firebase.firestore().collection("herramientas").get().then((s) => { herrCache = s.docs.map((d) => Object.assign({ id: d.id }, d.data())); herrTs = Date.now(); herrPidiendo = false; pintar(); }, () => { herrPidiendo = false; herrCache = herrCache || []; herrTs = Date.now(); });
    } catch (e) { herrPidiendo = false; }
  }
  const pal = (s) => nk(s).replace(/[()]/g, " ").split(/[\s,]+/).filter((w) => w.length > 3);
  function herramientaDe(nombre) {
    const ws = pal(nombre); if (!ws.length) return null;
    const l = listaHerr().filter((h) => h && h.estado !== "baja" && ws.every((w) => pal(h.nombre).some((x) => x.indexOf(w.slice(0, Math.max(4, w.length - 2))) === 0)));
    if (!l.length) return null;
    const mia = l.find((h) => nk(h.asignadaA || h.asignada) === nk(per()));
    return mia || l.find((h) => !h.asignadaA && h.estado !== "asignada") || l[0];
  }
  function herrSugeridas(o) {
    const out = [], vistos = new Set();
    tareas(o).forEach((p) => herrDeTarea(p).forEach((n) => { if (!vistos.has(nk(n))) { vistos.add(nk(n)); out.push({ n, tarea: p.label }); } }));
    HERR_BASE.forEach((n) => { if (!vistos.has(nk(n))) { vistos.add(nk(n)); out.push({ n, tarea: "" }); } });
    return out.map((x) => {
      const h = herramientaDe(x.n), quien = h ? String(h.asignadaA || (typeof h.asignada == "string" ? h.asignada : "") || "") : "";
      const otro = !!(h && quien && nk(quien) !== nk(per()) && !arr(o.personal).some((q) => nk(typeof q == "string" ? q : q && q.nombre) === nk(quien)));
      return Object.assign(x, { h, quien, otro });
    });
  }

  // ------------------------------------------------------------------------------------------- puntos
  function misPuntos() {
    const Q = window.__quincenas; if (!Q) return null;
    const q = Q.qInfo(Q.qDe(hoyISO())), yoN = per();
    const calc = intentar(() => (Q.calcular(q.desde, q.hasta).personas || []).find((p) => nk(p.nombre) === nk(yoN)), null) || { pts: 0, ordenes: [] };
    const apr = arr(calc.ordenes).map((x) => ({ numero: x.numero || "", fecha: x.fecha || "", plaza: x.plaza || "", pts: Number(x.pts) || 0, ok: true }));
    const ya = new Set(apr.map((x) => x.numero));
    const esp = ots().filter((o) => o && soyDe(o) && o.estado !== "Anulada" && !(o.cierre && o.cierre.cerradoTs) && String(o.fecha || "") >= q.desde && String(o.fecha || "") <= q.hasta && !ya.has(o.numero)).map((o) => {
      const z = intentar(() => (typeof window.puntosDeOrden == "function" ? window.puntosDeOrden(o) : null), null);
      const pp = z ? arr(z.porPersona).find((x) => nk(x.nombre) === nk(yoN)) : null;
      return { numero: o.numero || "", fecha: o.fecha || "", plaza: o.plazaNombre || "", pts: pp ? Number(pp.pts) || 0 : 0, ok: false };
    });
    const tA = apr.reduce((s, x) => s + x.pts, 0), tE = esp.reduce((s, x) => s + x.pts, 0);
    return { q, apr, esp, tA, tE, total: tA + tE, lista: esp.concat(apr).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))) };
  }
  const nP = (v) => { const x = Math.round((+v || 0) * 10) / 10; return fmtN(x, Number.isInteger(x) ? 0 : 1); };

  // ------------------------------------------------------------------------------------------- contactos
  const ROL_TXT = { admin: "Administración", oficina: "Oficina", panol: "Pañol", supervisor: "Te sigue esta orden" };
  function contactos(o) {
    const l = arr(cfg().contactos).filter((c) => c && String(c.nombre || "").trim());
    const sup = o && o.supervisor ? o.supervisor : null;
    const esSup = (c) => !!sup && ((sup.email && c.email && String(c.email).toLowerCase() === String(sup.email).toLowerCase()) || (sup.nombre && nk(c.nombre) === nk(sup.nombre)) || (sup.nombre && primero(nk(c.nombre)) === primero(nk(sup.nombre))));
    const ord = { admin: 1, oficina: 2, panol: 3 };
    const out = l.map((c) => Object.assign({}, c, { sup: esSup(c) })).sort((a, b) => (b.sup - a.sup) || ((ord[a.rol] || 9) - (ord[b.rol] || 9)));
    if (sup && sup.nombre && !out.some((c) => c.sup)) out.unshift({ nombre: sup.nombre, rol: "oficina", tel: "", sup: true });
    return out;
  }
  const telLimpio = (t) => String(t || "").replace(/[^\d+]/g, "");
  function waNum(t) { let d = String(t || "").replace(/\D/g, ""); if (!d) return ""; if (d.indexOf("54") === 0) return d.length >= 12 && d[2] !== "9" ? "549" + d.slice(2) : d; d = d.replace(/^0/, ""); if (d.length === 12 && /^\d{2,4}15/.test(d)) d = d.replace(/^(\d{2,4})15/, "$1"); return d.length === 10 ? "549" + d : d; }   // Argentina: 549 + área + número (sin 0 ni 15) · a confirmar con números reales

  // ------------------------------------------------------------------------------------------- pintar
  function asegurar() {
    const v = $("viewInicio"); if (!v) return null;
    let c = $("cdApp");
    if (!c) { c = document.createElement("div"); c.id = "cdApp"; c.className = "no-print"; v.insertBefore(c, v.firstChild); }
    else if (c.parentNode !== v) v.insertBefore(c, v.firstChild);
    return c;
  }
  let ultHtml = "";
  function pintar(forzar) {
    const quiero = on(), vis = intentar(() => $("viewInicio").style.display !== "none", false);
    document.body.classList.toggle("cd-on", quiero);
    if (!quiero) { const c = $("cdApp"); c && c.remove(); document.body.classList.remove("cd-portada"); ultHtml = ""; return; }
    const c = asegurar(); if (!c) return;
    if (!vis && !forzar) return;
    const act = document.activeElement; if (!forzar && act && c.contains(act) && /^(INPUT|TEXTAREA|SELECT)$/.test(act.tagName)) return;
    let h = "";
    try { h = (PANT[S.pant] || PANT.hoy)(); } catch (e) { console.error("[cuadrillaDia]", e); h = `<div class="card">⚠ ${esc(e.message)}</div>`; }
    const hero = S.pant === "hoy";
    document.body.classList.toggle("cd-portada", hero && vis);
    const o0 = otActual(), tt = S.pant === "hoy" ? "Inicio" : S.pant === "obra" ? "Modo obra" + (o0 && o0.numero ? " · " + o0.numero : "") : TIT[S.pant] || "Inicio";
    h = `<div class="subtabs cd-hdr" style="display:none"><b class="subtab activo" data-hdr="${esc(tt)}"></b></div>` + h;   // el título del header de la app (#hdrHoja lo lee de acá)
    if (h !== ultHtml || !c.innerHTML) { c.innerHTML = h; ultHtml = h; c.dataset.pant = S.pant; }
    if (S.pant === "llegar") setTimeout(mapaLlegar, 30);
  }
  const TIT = { orden: "Orden de trabajo", seg: "Antes de arrancar", salir: "Antes de salir", llegar: "Cómo llegar", fin: "Fin del día", puntos: "Mis puntos", llamar: "Llamar a la oficina", senal: "Sin señal" };
  const barra = (t) => `<div class="cd-barra"><button type="button" class="cd-volver" data-cdvolver="1" aria-label="Volver">${ic("volver", "", 2)}</button><span>${esc(t)}</span></div>`;
  const msgHtml = () => (S.msg ? `<div class="cd-msg" role="status">${esc(S.msg)}</div>` : "");
  const toastHtml = () => (S.toast && Date.now() - S.toastTs < 6000 ? `<div class="cd-toast" role="status">${ic("check")}<span>${esc(S.toast)}</span></div>` : "");
  function colaTxt() {
    const nF = intentar(() => (window.__fotosSinSenal ? window.__fotosSinSenal.cantidad() : 0), 0) || 0, cq = intentar(() => (window.__campoCola ? window.__campoCola.estado() : {}), {}) || {}, nC = cq.enviando && navigator.onLine !== false ? 0 : cq.cola || 0;   // mientras se está mandando no es «esperando señal»
    return { nF, nC, off: navigator.onLine === false };
  }
  function senalCard() {
    const q = colaTxt(); if (!q.off && !q.nF && !q.nC) return "";
    return `<button type="button" class="cd-senal" data-cd="senal">${ic("nube")}<span><b>${q.off ? "Sin señal" : "Esperando señal"}</b><small>${[q.nF ? q.nF + (q.nF === 1 ? " foto" : " fotos") : "", q.nC ? q.nC + (q.nC === 1 ? " cambio" : " cambios") : ""].filter(Boolean).join(" + ") || "todo se guarda en el celu"} · se manda solo</small></span>${ic("chev")}</button>`;
  }
  function tareaFila(o, p, n) {
    const e = envDe(o, p.k), u = unidades(o, p), hechas = u.tipo === "unidad" ? u.items.filter((x) => x.paso && x.paso.estado !== "no").length : 0;
    const det = u.tipo === "unidad" ? u.items.map((x) => x.num).filter(Boolean) : [];
    const rango = det.length > 1 ? det[0] + " a " + det[det.length - 1].replace(/^.*?(\d+)$/, "$1") : det[0] || "";
    const cant = p.repartida && p.mio > 0 ? p.mio : p.prev;
    return `<div class="cd-rw${e ? (e.estado === "no" ? " no" : " si") : ""}">${n != null ? `<span class="cd-tn">${n}</span>` : `<span class="cd-ico">${ic(u.cat === "columna" ? "col" : u.cat === "caja" ? "caja" : "herr")}</span>`}<div class="cd-tx"><b>${esc(p.label)}</b><small>${e ? (e.estado === "no" ? "No se hizo" : "Mandada " + hhmm(e.ts)) : esc(rango || p.detalle || "")}${u.tipo === "unidad" && hechas && !e ? " · van " + hechas : ""}</small></div>${cant > 0 ? `<span class="cd-q">${fmtN(cant)} ${esc(unTxt(p.un, cant))}</span>` : ""}</div>`;
  }
  const unTxt = (u, n) => { u = String(u || ""); if (!u || /^(un|unidad|u)\.?$/i.test(u)) return "Un."; if (/^(m|ml|kg|m2|m3|m²|m³|l)$/i.test(u) || n === 1) return u; return /[aeiouáéíóú]$/i.test(u) ? u + "s" : /[ln]$/i.test(u) ? u.replace(/ó(n)$/, "o$1") + "es" : u + "es"; };
  const PANT = {};
  PANT.hoy = function () {
    const o = otActual(), y = yo() || {}, nb = primero(y.nombre || y.persona || y.usuario || "");
    const d = new Date(), comp = o ? arr(o.personal).map((x) => (typeof x == "string" ? x : x && x.nombre)).filter((n) => n && nk(n) !== nk(per())).map(primero) : [];
    const avs = intentar(() => ((window.__emaAvisos && window.__emaAvisos.leer() || {}).lista || []).filter((a) => a && !a.leido), []);
    const mp = misPuntos(), ts = o ? tareas(o) : [], hechasT = o ? ts.filter((p) => envDe(o, p.k)).length : 0;
    const sl = d.getHours() < 13 ? "Buen día" : d.getHours() < 20 ? "Buenas tardes" : "Buenas noches";
    const ob = o ? obraDe(o) || {} : {}, dir = [o && (o.direccion || ob.direccion), o && (o.barrio || ob.barrio)].filter(Boolean).join(" · ");
    const pa = o ? pasoActual(o) : null, empezado = !!(o && (mio(o, "llegada") || segHecha(o)));
    const logo = intentar(() => window.__inicioPro && window.__inicioPro.LOGO, "");
    let h = `<section class="cd-hh"><div class="cd-top"><button type="button" class="cd-rd" data-cd="menu" aria-label="Menú">${ic("menu", "s22", 1.5)}</button>${logo ? `<img src="${logo}" alt="EMA Servicios">` : "<b>EMA</b>"}<span class="cd-sp"></span><button type="button" class="cd-rd" data-cd="avisos" aria-label="Avisos">${ic("campana", "s22", 1.5)}${avs.length ? `<span class="cd-bd">${avs.length > 9 ? "9+" : avs.length}</span>` : ""}</button></div>
<h1>${sl}${nb ? `, <b>${esc(nb)}</b>` : ""}</h1><div class="cd-f">${DIAS[d.getDay()][0].toUpperCase() + DIAS[d.getDay()].slice(1)} ${d.getDate()} de ${MESES[d.getMonth()]}${comp.length ? " · con " + esc(comp.join(" y ")) : ""}</div>
<div class="cd-kp"><button type="button" data-cd="orden"><b>${ts.length}</b><span>tareas hoy</span></button><button type="button" class="${avs.length ? "am" : ""}" data-cd="avisos"><b>${avs.length}</b><span>avisos nuevos</span></button><button type="button" data-cd="puntos"><b>${mp ? nP(mp.total) : "—"}</b><span>puntos quincena</span></button></div></section>
<div class="cd-cu">${toastHtml()}${msgHtml()}${senalCard()}`;
    if (o) {
      h += `<div class="cd-cd cd-ob"><div class="cd-eti"><span>Tu obra de hoy</span><span class="cd-tag">${esc(o.numero || "")}</span></div><b>${esc((o.plazaNombre || "Trabajo general").toUpperCase())}${o.obraId ? " · ID " + esc(o.obraId) : ""}</b>${dir ? `<small>${esc(dir)}</small>` : ""}
<div class="cd-bt"><button type="button" class="btn-primary" data-cd="llegar">${ic("pin", "s18", 2)}Cómo llegar</button><button type="button" class="btn-ghost" data-cd="${empezado ? "obra" : "orden"}">${empezado ? "Modo obra" : "Ver la orden"}</button></div>
${pa && pa.fase !== "fin" && empezado ? `<button type="button" class="btn-primary cd-seguir" data-cd="seguir">${ic("flecha", "s18", 2)}Seguir: ${esc(pa.fase === "llegue" ? "Llegué" : pa.p ? pa.p.label : "")}</button>` : ""}${pa && pa.fase === "fin" && ts.length ? `<button type="button" class="btn-primary cd-seguir" data-cd="fin">${ic("check", "s18", 2)}Fin del día</button>` : ""}</div>`;
      h += `<div class="cd-cd"><div class="cd-eti"><span>Tus tareas</span><em>${hechasT} de ${ts.length}</em></div>${ts.length ? ts.map((p) => tareaFila(o, p)).join("") : '<div class="cd-vacio">La orden no tiene tareas para vos.</div>'}</div>`;
      const otras = misOtsHoy().filter((x) => x.id !== o.id);
      if (otras.length) h += `<div class="cd-cd"><div class="cd-eti"><span>Otras órdenes de hoy</span></div>${otras.map((x) => `<button type="button" class="cd-rw cd-btn" data-cd="elegir" data-ot="${esc(x.id)}"><span class="cd-ico">${ic("orden")}</span><div class="cd-tx"><b>${esc(x.plazaNombre || "Trabajo general")}</b><small>${esc(x.numero || "")}${x.horaInicio ? " · " + esc(x.horaInicio) : ""}</small></div>${ic("chev", "cd-chev")}</button>`).join("")}</div>`;
    } else {
      const px = proximas();
      h += `<div class="cd-cd"><div class="cd-eti"><span>Hoy</span></div><div class="cd-vacio">☕ Hoy no tenés orden de trabajo. Cuando te asignen una, te llega el aviso.</div>${px.length ? px.slice(0, 3).map((x) => `<div class="cd-rw"><span class="cd-ico">${ic("orden")}</span><div class="cd-tx"><b>${esc(x.plazaNombre || "Trabajo general")}</b><small>${esc(fCorta(x.fecha))} · ${esc(x.numero || "")}</small></div></div>`).join("") : ""}</div>`;
    }
    h += `<div class="cd-cd"><div class="cd-eti"><span>Avisos nuevos</span></div>${avs.length ? avs.slice(0, 3).map((a) => `<button type="button" class="cd-rw cd-btn" data-cd="aviso" data-avid="${esc(a.id)}"><span class="cd-ico${/punto/i.test(a.titulo) ? " vd" : ""}">${ic(/punto/i.test(a.titulo) ? "estrella" : "orden")}</span><div class="cd-tx"><b>${esc(a.titulo)}</b><small>${esc(a.cuerpo)}</small></div>${ic("chev", "cd-chev")}</button>`).join("") : '<div class="cd-vacio">No tenés avisos nuevos.</div>'}</div>
<div class="cd-links"><button type="button" class="cd-link" data-cd="lista">Ver lista completa de Mis tareas</button><button type="button" class="cd-link" data-cd="calc">Cálculos rápidos</button></div></div>`;
    return h;
  };
  const vehTxt = (o) => { const v = arr(o.vehiculos)[0]; if (!v) return null; const vp = obj(o.vehiculoPersona)[per()]; return { n: v.nombre || "Vehículo", s: [v.patente ? "Patente " + v.patente : "", vp && (vp.id === v.id || vp.nombre === v.nombre) ? "vas en este" : ""].filter(Boolean).join(" · ") }; };
  PANT.orden = function () {
    const o = otActual(); if (!o) return barra("Orden de trabajo") + '<div class="cd-cu"><div class="cd-cd cd-vacio">Hoy no tenés orden.</div></div>';
    const ob = obraDe(o) || {}, dir = [o.direccion || ob.direccion, o.barrio || ob.barrio].filter(Boolean).join(" · ");
    const gente = arr(o.personal).map((x) => (typeof x == "string" ? x : x && x.nombre)).filter(Boolean);
    const v = vehTxt(o), sup = o.supervisor && o.supervisor.nombre ? o.supervisor : null, ts = tareas(o);
    const d = new Date(String(o.fecha) + "T12:00:00");
    return barra("Orden de trabajo") + `<div class="cd-cu"><section class="cd-hero"><div class="cd-e">${esc(o.numero || "")} · ${DIAS[d.getDay()] || ""} ${esc(fCorta(o.fecha))} · ${esc(o.estado || "")}</div><h2>${esc((o.plazaNombre || "Trabajo general").toUpperCase())}</h2><div class="cd-d">${o.obraId ? "ID " + esc(o.obraId) + " · " : ""}${esc(dir)}</div>
<div class="cd-gen">${gente.map((n, i) => `<span><i class="cd-ava c${i % 3}">${esc(inic(n))}</i>${esc(n)}${nk(n) === nk(per()) ? " · vos" : ""}</span>`).join("")}</div></section>
${v || sup || o.horaInicio ? `<div class="cd-cd">${o.horaInicio ? `<div class="cd-rw"><span class="cd-ico">${ic("reloj")}</span><div class="cd-tx"><b>Salen ${esc(o.horaInicio)}${o.horaFin ? " · hasta " + esc(o.horaFin) : ""}</b><small>${esc(o.cuadrilla || "")}</small></div></div>` : ""}${v ? `<div class="cd-rw"><span class="cd-ico">${ic("hidro")}</span><div class="cd-tx"><b>${esc(v.n)}</b><small>${esc(v.s)}</small></div></div>` : ""}${sup ? `<div class="cd-rw"><span class="cd-ico">${ic("perfil")}</span><div class="cd-tx"><b>Te sigue ${esc(primero(sup.nombre))} (oficina)</b><small>Cierra la orden</small></div></div>` : ""}</div>` : ""}
<div class="cd-cd"><div class="cd-eti"><span>Tareas en orden</span><em>${ts.length}</em></div>${ts.map((p, i) => tareaFila(o, p, i + 1)).join("") || '<div class="cd-vacio">Sin tareas para vos.</div>'}${o.notas ? `<div class="cd-nota">Oficina: ${esc(o.notas)}</div>` : ""}</div>
<button type="button" class="cd-link" data-cd="lista">Ver lista completa</button></div>
<div class="cd-pie"><button type="button" class="btn-primary cd-big" data-cd="empezar">${ic("flecha", "s22", 2)}${mio(o, "llegada") ? "Seguir en obra" : segHecha(o) ? "Seguir" : "Empezar"}</button></div>`;
  };
  PANT.seg = function () {
    const o = otActual(); if (!o) return barra("Antes de arrancar");
    const its = segItems(o), fs = segFotos(o), n = segListos(o), gente = arr(o.personal).map((x) => (typeof x == "string" ? x : x && x.nombre)).filter(Boolean);
    const todo = n === SEG.length && !!corteDe(o), falta = SEG.find((s) => !segOk(o, s[0]));
    const d = new Date();
    return barra("Antes de arrancar") + `<div class="cd-cu"><div class="cd-segcab"><div><div class="cd-e2">Seguridad · ${DIAS[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}</div><h2 class="cd-tit">Antes de arrancar</h2><small>${esc((o.plazaNombre || "").toUpperCase())}${o.obraId ? " · ID " + esc(o.obraId) : ""}</small><div class="cd-avas">${gente.map((g, i) => `<i class="cd-ava c${i % 3}">${esc(inic(g))}</i>`).join("")}<span>${esc(gente.map(primero).join(" y "))}</span></div></div><div class="cd-cnt"><b>${n}</b>/${SEG.length}</div></div>
<div class="cd-prog"><i style="width:${Math.round((n / SEG.length) * 100)}%"></i></div>
<div class="cd-cd cd-seg">${SEG.map(([id, t, i]) => {
      const f = fotoSeg(id), tiene = !!fs[id], ok = segOk(o, id), sub = id === "casco" ? (gente.length > 1 ? "Los " + gente.length : "Puesto") : id === "arnes" ? "Revisado" : id === "guantes" ? (gente.length > 1 ? "Los " + gente.length : "Puestos") : id === "botines" ? (gente.length > 1 ? "Los " + gente.length : "Puestos") : id === "conos" ? "Alrededor de donde se trabaja" : "Escalera, hidro, pinzas y probador";
      const faltaF = its[id] && f === "oblig" && !tiene;
      return `<div class="cd-rw cd-si${ok ? " ok" : faltaF ? " am" : ""}" data-segit="${id}"><span class="cd-ico${faltaF ? " am" : ""}">${ic(i)}</span><div class="cd-tx"><b>${esc(t)}</b><small>${faltaF ? "Falta la foto" : tiene ? "Con foto" + (segMia(o).fotosTs && segMia(o).fotosTs[id] ? " · " + hhmm(segMia(o).fotosTs[id]) : "") : esc(sub)}</small></div>${f !== "no" ? `<button type="button" class="cd-fbtn${tiene ? " ya" : ""}" data-cd="segfoto" data-it="${id}">${ic("camara", "s18", 2)}${tiene ? "" : "Foto"}</button>` : ""}<button type="button" class="cd-tick${ok ? " on" : ""}" data-cd="segtick" data-it="${id}" aria-label="${esc(t)}" aria-pressed="${its[id] ? "true" : "false"}">${ic("tilde", "", 2.6)}</button></div>`;
    }).join("")}
<div class="cd-rw cd-corte"><span class="cd-ico">${ic("rayo")}</span><div class="cd-tx"><b>Corte de energía</b><small>Si se trabaja cerca de cables con tensión, confirmado con EPEC</small><div class="cd-dos"><button type="button" class="chip${corteDe(o) === "epec" ? " activo" : ""}" data-cd="corte" data-v="epec">Confirmado con EPEC</button><button type="button" class="chip${corteDe(o) === "no" ? " activo" : ""}" data-cd="corte" data-v="no">No hace falta</button></div></div></div></div></div>
<div class="cd-pie" data-ot="${esc(o.id)}"><button type="button" class="btn-primary cd-big${todo ? "" : " cd-off"}" data-cd="arrancar" ${todo ? "" : 'aria-disabled="true"'}>${ic("check", "s22", 2)}Arrancar el día</button>${todo ? "" : `<div class="cd-falta">${falta ? (its[falta[0]] && fotoSeg(falta[0]) === "oblig" ? "Te falta la foto de " + esc(falta[1].toLowerCase()) : "Te falta tildar: " + esc(falta[1].toLowerCase())) : "Te falta el corte de energía"}</div><button type="button" class="cd-link" data-cd="arrancarIgual">Arrancar igual (decí por qué)</button>`}</div>`;
  };
  PANT.salir = function () {
    const o = otActual(); if (!o) return barra("Antes de salir");
    const m = materialDe(o), hs = herrSugeridas(o), tmp = S.salidaTmp[o.id] || {}, ts = tareas(o);
    const retN = m.items.filter((x) => x.ret).length, faltan = m.items.filter((x) => !x.ret);
    const hOk = (x) => tmp[nk(x.n)] != null ? !!tmp[nk(x.n)] : !x.otro && !!(x.h && nk(x.quien) === nk(per()));
    const hN = hs.filter(hOk).length, otros = hs.filter((x) => x.otro);
    const rsF = [...new Set(faltan.map((x) => x.rs).filter(Boolean))];
    const ia = [faltan.length ? `Te falta retirar <b>${faltan.length} ${faltan.length === 1 ? "cosa" : "cosas"}</b>${rsF.length ? " (reserva " + esc(rsF.join(", ")) + ")" : ""}` : m.items.length ? "Ya retiraste todo el material" : "No hay material reservado para esta orden: si hace falta algo, pedilo al pañol", otros.length ? `${otros.length === 1 ? "la " : "las "}<b>${esc(otros.map((x) => x.n.toLowerCase()).join(", "))}</b> ${otros.length === 1 ? "la tiene" : "las tiene"} ${esc(primero(otros[0].quien))}${otros.length > 1 ? " y otros" : ""} (otra cuadrilla)` : ""].filter(Boolean).join(" y ") + ".";
    const listo = !faltan.length && hN === hs.length;
    const sal = mio(o, "salida");
    const d = new Date();
    return barra("Antes de salir") + `<div class="cd-cu"><section class="cd-hero"><div class="cd-e">Hoy · ${DIAS[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)} · ${esc(o.numero || "")}</div><h2>${esc(ts.map((p) => p.label).slice(0, 2).join(" + ") || "Trabajo del día")}</h2><div class="cd-d">${ic("pin", "s16", 2)} ${esc((o.plazaNombre || "").toUpperCase())}${o.obraId ? " · ID " + esc(o.obraId) : ""}</div>
<ol class="cd-ol">${ts.map((p) => `<li>${esc(p.label)}</li>`).join("")}</ol></section>
<div class="cd-cd"><div class="cd-eti"><span>Material · ${retN} de ${m.items.length}</span>${faltan.length ? `<span class="cd-tag am">${ic("alerta", "s14", 2)} ${faltan.length} sin retirar</span>` : ""}</div>${m.items.length ? m.items.map((x) => `<div class="cd-rw cd-mat${x.ret ? " ok" : " am"}"><span class="cd-box${x.ret ? " on" : ""}">${x.ret ? ic("tilde", "", 3) : ""}</span><div class="cd-tx"><b><code>${esc(x.cod)}</code> ${esc(x.desc)}</b><small>${x.ret ? "Retirado del pañol" : "Falta retirar" + (x.rs ? " · " + esc(x.rs) + " " + esc(EST_RS[x.est] || x.est || "") : "")}</small></div><span class="cd-q">${fmtN(x.cant)} ${esc(x.un)}</span></div>`).join("") : '<div class="cd-vacio">No hay reserva ni vales para esta orden.</div>'}</div>
<div class="cd-cd"><div class="cd-eti"><span>Herramientas · ${hN} de ${hs.length}</span>${otros.length ? `<span class="cd-tag rj">${otros.length} la tiene otro</span>` : ""}</div><div class="cd-hgrid">${hs.map((x) => `<button type="button" class="cd-hi${hOk(x) ? " on" : ""}${x.otro ? " rj" : ""}" data-cd="herr" data-n="${esc(nk(x.n))}"><span class="cd-box${hOk(x) ? " on" : ""}">${hOk(x) ? ic("tilde", "", 3) : ""}</span><span class="cd-tx"><b>${esc(x.n)}</b><small>${x.h ? esc(x.h.codigo || "") + (x.quien ? " · " + (nk(x.quien) === nk(per()) ? "la tenés vos" : "la tiene " + esc(x.quien)) : " · en el pañol") : "a confirmar"}</small></span></button>`).join("")}</div><div class="cd-hint">Sugeridas por tarea (a confirmar). Tildá lo que llevás.</div></div>
<div class="cd-cd cd-iaav"><span class="cd-ico">${ic("ia")}</span><div><div class="cd-e2">Asistente EMA</div><p>${ia}</p></div></div>
${sal ? `<div class="cd-ok">${ic("check")} Salieron ${hhmm(sal.ts)}${sal.ok ? "" : " · salió igual: " + esc(sal.motivo || "")}</div>` : ""}</div>
<div class="cd-pie"><button type="button" class="btn-primary cd-big${listo ? "" : " cd-off"}" data-cd="salimos" ${listo ? "" : 'aria-disabled="true"'}>${ic("check", "s22", 2)}Salimos</button>${listo ? "" : '<button type="button" class="cd-link" data-cd="salirIgual">Salir igual (decí por qué)</button>'}</div>`;
  };
  PANT.llegar = function () {
    const o = otActual(); if (!o) return barra("Cómo llegar");
    const c = coordObra(o), ob = obraDe(o) || {}, dir = [o.direccion || ob.direccion, o.barrio || ob.barrio].filter(Boolean).join(" · ");
    const d = c && S.pos ? dist(S.pos, c) : null;
    const url = c ? `https://www.google.com/maps/dir/?api=1&destination=${c.lat.toFixed(6)},${c.lng.toFixed(6)}&travelmode=driving` : dir ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dir + ", Córdoba, Argentina")}&travelmode=driving` : "";
    return `<div class="cd-mapa-w">${barra("Cómo llegar")}<div id="cdMapa" class="cd-mapa">${c ? "" : '<div class="cd-sinpin">La obra no tiene el pin en el mapa: Google Maps la busca por la dirección.</div>'}</div>
<div class="cd-mhoja"><div class="v7-asa"></div><b>${esc((o.plazaNombre || "").toUpperCase())}${o.obraId ? " · ID " + esc(o.obraId) : ""}</b><small>${esc(dir)}</small>
<div class="cd-dist"><div><b>${d != null ? distTxt(d) : "—"}</b><span>${d != null ? "desde donde estás" : S.pos === null ? "buscando tu GPS…" : "sin GPS"}</span></div>${d != null ? `<div><b>${Math.max(1, Math.round(d / 1000 / 25 * 60))} min</b><span>aprox. en vehículo</span></div>` : ""}</div>
${url ? `<a class="btn-primary cd-big cd-a" href="${esc(url)}" target="_blank" rel="noopener" data-cd="gmaps">${ic("pin", "s22", 2)}Abrir en Google Maps</a>` : ""}<button type="button" class="btn-ghost cd-big" data-cd="obra">Ya llegué · Modo obra</button></div></div>`;
  };
  let mapa = null, mapaEl = null;
  function mapaLlegar() {
    const el = $("cdMapa"), o = otActual(); if (!el || !o || !window.L || !L.map) return;
    const c = coordObra(o); if (!c) return;
    if (mapa && mapaEl === el) { try { mapa.invalidateSize(); } catch (e) { } return; }
    try { mapa && mapa.remove(); } catch (e) { }
    try {
      mapa = L.map(el, { zoomControl: false, attributionControl: false, keyboard: false }).setView([c.lat, c.lng], 15); mapaEl = el;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(mapa);
      L.marker([c.lat, c.lng], { icon: L.divIcon({ className: "cd-pinm", html: `<span>${esc((o.plazaNombre || "Obra").toUpperCase())}</span><i></i>`, iconSize: [0, 0] }) }).addTo(mapa);
      if (S.pos) { L.circleMarker([S.pos.lat, S.pos.lng], { radius: 8, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }).addTo(mapa); L.polyline([[S.pos.lat, S.pos.lng], [c.lat, c.lng]], { color: "#28285e", weight: 3, dashArray: "6 6" }).addTo(mapa); mapa.fitBounds([[S.pos.lat, S.pos.lng], [c.lat, c.lng]], { padding: [60, 60] }); }
    } catch (e) { console.warn("[cuadrillaDia] mapa", e); }
  }
  // ---- Modo obra (opción E)
  const R = 110, LARGO = 2 * Math.PI * R;
  const anillo = (fr) => `<svg width="250" height="250" viewBox="0 0 250 250" aria-hidden="true"><circle cx="125" cy="125" r="${R}" fill="none" stroke="rgba(40,40,94,.1)" stroke-width="10"/>${fr > 0 ? `<circle cx="125" cy="125" r="${R}" fill="none" stroke="#34c759" stroke-width="10" stroke-linecap="round" stroke-dasharray="${Math.max(0.001, LARGO * Math.min(1, fr))} 2000" transform="rotate(-90 125 125)"/>` : ""}</svg>`;
  PANT.obra = function () {
    const o = otActual(); if (!o) return barra("Modo obra") + '<div class="cd-cu"><div class="cd-cd cd-vacio">Hoy no tenés orden.</div></div>';
    const pa = pasoActual(o);
    if (pa.fase === "fin") return PANT.fin();
    const c = coordObra(o), d = c && S.pos ? dist(S.pos, c) : null;
    let tit = "", grande = "", sub = "", btn = "", ico = "", fr = 0, k = 0, vd = false, segs = "";
    const plaza = (o.plazaNombre || "").toUpperCase();
    if (pa.fase === "llegue") {
      const ts = tareas(o);
      tit = ts[0] ? ts[0].label : "Trabajo del día"; grande = ""; sub = plaza + (ts.length ? " · hoy " + ts.length + (ts.length === 1 ? " tarea" : " tareas") : "");
      btn = "Llegué"; ico = "pin"; k = 0;
    } else {
      const u = pa.u, tot = u.items.length || 1, hechos = u.tipo === "unidad" ? u.items.filter((x) => x.paso).length : u.items.filter((x) => x.foto).length;
      tit = pa.p.label; grande = pa.it ? pa.it.num : u.tipo === "unidad" ? "Todas" : "Lista";
      const faltan = u.tipo === "unidad" ? tot - hechos : 0;
      sub = plaza + (u.tipo === "unidad" ? " · te " + (faltan === 1 ? "falta 1" : "faltan " + faltan) + " de " + tot : u.items.length ? " · " + hechos + " de " + tot + " fotos" : "");
      fr = u.tipo === "unidad" ? (hechos + (pa.fase === "termine" && pa.it ? 0.6 : pa.it && pa.it.foto ? 0.3 : 0)) / tot : (hechos / Math.max(1, tot)) * 0.9;
      btn = pa.fase === "foto" ? "Foto" : "Terminé"; ico = pa.fase === "foto" ? "camara" : "tilde"; k = pa.fase === "foto" ? 1 : 2; vd = pa.fase === "termine";
      if (u.items.length > 1 && u.items.length <= 16) segs = `<div class="cd-segs" style="grid-template-columns:repeat(${u.items.length},1fr)">${u.items.map((x) => `<i class="${(u.tipo === "unidad" ? x.paso : x.foto) ? "h" : x === pa.it ? "a" : ""}"></i>`).join("")}</div>`;
    }
    const gps = pa.fase === "llegue" ? (d != null ? `<div class="cd-gps${d <= CERCA ? "" : " lejos"}">${ic("pin", "s18", 2)}${d <= CERCA ? "Estás en la obra · a " + distTxt(d) : "Estás a " + distTxt(d) + " de la obra"}${S.pos && S.pos.acc ? " · ±" + S.pos.acc + " m" : ""}</div>` : `<div class="cd-gps gris">${ic("pin", "s18", 2)}${S.pos === null && S.posTs ? "Sin GPS: igual podés tocar «Llegué»" : "Buscando tu GPS…"}</div>`) : "";
    const pas = ["Llegué", "Foto", "Terminé"].map((t, i) => `<span class="${i < k ? "h" : i === k ? "a" : ""}">${i < k ? ic("tilde", "s16", 2.6) : ""}${t}</span>`).join("");
    const ti = pa.ti != null ? pa.ti : 0, tn = pa.tn != null ? pa.tn : tareas(o).length;
    return `<div class="cd-cu cd-e" data-ot="${esc(o.id)}">${toastHtml()}${msgHtml()}${senalCard()}
<div class="cd-arr"><div class="cd-e1">Tarea ${ti + 1} de ${tn || 1} · ahora</div><h1>${esc(tit)}</h1>${grande ? `<div class="cd-colg">${esc(grande)}</div>` : ""}<div class="cd-o">${esc(sub)}</div></div>${segs}${gps}
<div class="cd-boton">${anillo(fr)}<button type="button" class="cd-c${vd ? " vd" : ""}" data-cd="boton" data-fase="${pa.fase}">${ic(ico, "", 1.8)}<b>${btn}</b><small>TOCÁ ACÁ</small></button></div>
<div class="cd-pas">${pas}</div>
<div class="cd-chicos"><button type="button" class="m" data-cd="falta">${ic("alerta", "", 2)}Falta<br>material</button><button type="button" data-cd="ayuda">${ic("ayuda", "", 1.8)}Ayuda</button><button type="button" data-cd="llamar">${ic("tel", "", 1.8)}Llamar a<br>la oficina</button></div>
<div class="cd-links"><button type="button" class="cd-link" data-cd="lista">Ver lista completa</button><button type="button" class="cd-link" data-cd="fin">Fin del día</button></div></div>`;
  };
  PANT.fin = function () {
    const l = misOtsHoy(); const o0 = otActual();
    const filas = [], yoN = per(); let uni = 0, fotos = 0, mins = 0, ini = null, fin = null;
    l.forEach((o) => {
      tareas(o).forEach((p) => {
        const e = envDe(o, p.k), m = marca(o, p.k) || {}, u = unidades(o, p), hs = horasDe(o, p.k);
        const tot = u.tipo === "unidad" ? u.items.length : Math.max(1, Math.ceil(p.prev || 1));
        const hech = m.hecho ? Number(m.cant) || (u.tipo === "unidad" ? u.items.filter((x) => x.paso && x.paso.estado !== "no").length : 1) : 0;
        if (m.hecho) uni += hech;
        if (hs.ini && hs.fin) { const a = minDe(hs.ini), b = minDe(hs.fin); if (b > a) { ini = ini == null ? a : Math.min(ini, a); fin = fin == null ? b : Math.max(fin, b); } }
        const rango = u.tipo === "unidad" && u.items.length > 1 ? u.items[0].num + " a " + u.items[u.items.length - 1].num.replace(/^.*?(\d+)$/, "$1") : "";
        filas.push({ o, p, e, m, hech, tot, rango, hs });
      });
      Object.keys(obj(campo(o).fotos)).forEach((q) => { const f = campo(o).fotos[q]; if (f && !f.borrada && nk(f.por) === nk(yoN) && hoyISO() === (typeof fechaAISO == "function" ? fechaAISO(new Date(f.ts || 0)) : "")) fotos++; });
    });
    if (ini != null && fin != null) mins = fin - ini;
    const q = colaTxt(), env = l.length && l.every((o) => obj(campo(o).enviados)[Lk(yoN)]);
    const d = new Date(), envTs = l.map((o) => (obj(campo(o).enviados)[Lk(yoN)] || {}).ts).filter(Boolean).sort().pop();
    return barra("Fin del día") + `<div class="cd-cu">${toastHtml()}${msgHtml()}${senalCard()}<section class="cd-hero"><div class="cd-e">${DIAS[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}${ini != null ? " · " + hmDe(ini) + " a " + hmDe(fin) : ""}</div><h2>Hoy hiciste</h2>
<div class="cd-kp4"><div><b>${fmtN(uni)}</b><span>unidades</span></div><div><b>${filas.filter((x) => x.e && x.e.estado !== "no").length}</b><span>tareas</span></div><div><b>${fotos}</b><span>fotos</span></div><div><b>${fmtN(Math.round(mins / 6) / 10, 1)}</b><span>horas</span></div></div></section>
${filas.map((x) => `<div class="cd-fin ${x.e ? (x.e.estado === "no" ? "no" : "si") : "pend"}"><span class="cd-fic">${x.e ? ic(x.e.estado === "no" ? "cruz" : "tilde", "", 3) : ic("reloj", "", 2)}</span><div class="cd-tx"><b>${esc(x.p.label)}</b><small>${x.e ? (x.e.estado === "no" ? "No se hizo" + (x.m.motivo ? ": " + esc(motTxt(x.m.motivo)) : "") + (x.m.nota ? " — " + esc(x.m.nota) : "") + " (avisado " + hhmm(x.e.ts) + ")" : "Mandada " + hhmm(x.e.ts) + (x.rango ? " · " + esc(x.rango) : "") + (x.m.nota ? " · " + esc(x.m.nota) : "")) : "Sin mandar todavía"}</small></div><span class="cd-q">${fmtN(x.hech)}/${fmtN(x.tot)}</span></div>`).join("") || '<div class="cd-cd cd-vacio">Hoy no tenés tareas.</div>'}
<div class="cd-subido">${ic("check", "s18", 2)}${q.nF || q.nC ? `${q.nF} ${q.nF === 1 ? "foto" : "fotos"} esperando señal · se suben solas` : "Todo subido · 0 fotos esperando señal"}</div>
<div class="cd-links"><button type="button" class="cd-link" data-cd="puntos">Ver mis puntos</button><button type="button" class="cd-link" data-cd="lista">Ver lista completa</button></div></div>
<div class="cd-pie">${env ? `<div class="cd-ok">${ic("check")} Mandado a la oficina ${envTs ? hhmm(envTs) : ""}</div>` : `<button type="button" class="btn-primary cd-big" data-cd="mandar">${ic("check", "s22", 2)}Mandar a la oficina</button>`}</div>`;
  };
  PANT.puntos = function () {
    const mp = misPuntos(); if (!mp) return barra("Mis puntos") + '<div class="cd-cu"><div class="cd-cd cd-vacio">Todavía no se cargaron los puntos.</div></div>';
    const fr = mp.total > 0 ? mp.tA / mp.total : 0, r = 38, L2 = 2 * Math.PI * r;
    return barra("Mis puntos") + `<div class="cd-cu"><section class="cd-hero cd-ph"><svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="${r}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="8"/><circle cx="48" cy="48" r="${r}" fill="none" stroke="#34c759" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(L2 * fr).toFixed(1)} 999" transform="rotate(-90 48 48)"/></svg><div class="cd-phn"><b>${nP(mp.total)}</b><small>PUNTOS</small></div>
<div><div class="cd-e">Quincena ${esc(mp.q.rango || "")}</div><h2>${mp.total > 0 ? "Vas bien, " + esc(primero(per())) : "Arrancando la quincena"}</h2><div class="cd-d">1 punto = 1 hora de trabajo efectivo</div><div class="cd-pl"><span><i class="v"></i>${nP(mp.tA)}<small>aprobados</small></span><span><i class="a"></i>${nP(mp.tE)}<small>esperando</small></span></div></div></section>
<div class="cd-cd"><div class="cd-eti"><span>Por orden</span></div>${mp.lista.length ? mp.lista.map((x) => `<div class="cd-rw"><span class="cd-ico${x.ok ? " vd" : " am"}">${ic(x.ok ? "check" : "reloj")}</span><div class="cd-tx"><b>${esc(x.numero)}</b><small>${x.fecha === hoyISO() ? "Hoy" : esc(fCorta(x.fecha))} · ${esc(x.plaza)}</small></div><div class="cd-pr"><b>${x.ok ? nP(x.pts) : x.pts > 0 ? "≈ " + nP(x.pts) : "—"}</b><span class="cd-tag ${x.ok ? "vd" : "am"}">${x.ok ? "Aprobados" : "Esperando cierre"}</span></div></div>`).join("") : '<div class="cd-vacio">Todavía no tenés órdenes en esta quincena.</div>'}</div></div>`;
  };
  PANT.llamar = function () {
    const o = otActual(), l = contactos(o), d = new Date();
    return barra("Llamar a la oficina") + `<div class="cd-cu"><h2 class="cd-tit">¿A quién llamás?</h2><div class="cd-sub2">${DIAS[d.getDay()][0].toUpperCase() + DIAS[d.getDay()].slice(1, 3)} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}${o ? " · " + esc((o.plazaNombre || "").toUpperCase()) : ""}</div>
<div class="cd-cd">${l.length ? `<div class="cd-lh"><span>Llamar</span><span>WhatsApp</span></div>` + l.map((c, i) => { const t = telLimpio(c.tel), w = waNum(c.tel); return `<div class="cd-rw cd-ct"><i class="cd-ava g c${i % 3}">${esc(inic(c.nombre))}</i><div class="cd-tx"><b>${esc(c.nombre)}${c.rol && ROL_TXT[c.rol] && !c.sup ? " · " + esc(ROL_TXT[c.rol]) : ""}</b><small>${c.sup ? "Te sigue esta orden" : esc(c.que || ROL_TXT[c.rol] || "")}${t ? "" : " · sin teléfono"}</small>${t ? "" : '<small class="cd-sint">Pedile a la oficina que cargue su teléfono</small>'}</div>${t ? `<a class="cd-cb" href="tel:${esc(t)}" data-cd="tel" aria-label="Llamar a ${esc(c.nombre)}">${ic("tel", "", 2)}</a><a class="cd-cb wa" href="https://wa.me/${esc(w)}" target="_blank" rel="noopener" data-cd="wa" aria-label="WhatsApp a ${esc(c.nombre)}">${ic("wa", "", 2)}</a>` : ""}</div>`; }).join("") : '<div class="cd-vacio">Pedile a la oficina que cargue su teléfono: todavía no hay teléfonos cargados para la cuadrilla.</div>'}</div>
<button type="button" class="btn-ghost cd-big" data-cd="ubicacion">${ic("pin", "s22", 2)}Mandar mi ubicación</button><div class="cd-hint c">Les llega el punto en el mapa y la orden en la que estás.</div></div>`;
  };
  PANT.senal = function () {
    const q = colaTxt(), fs = S.colaFotos || [];
    if (!S.colaPidiendo && (!S.colaTs || Date.now() - S.colaTs > 8000)) leerCola();
    return barra("Esperando señal") + `${q.off || q.nF || q.nC ? `<div class="cd-franja">${ic("nube", "s22", 2)}<span>${q.off ? "Sin señal: todo se guarda en el celu y se manda solo" : "Hay cosas esperando señal: se mandan solas"}</span></div>` : ""}<div class="cd-cu">
<div class="cd-cd"><div class="cd-eti"><span>Esperando señal</span><span class="cd-tag am">${q.nF} ${q.nF === 1 ? "foto" : "fotos"} + ${q.nC} ${q.nC === 1 ? "cambio" : "cambios"}</span></div>${fs.length ? fs.map((x) => `<div class="cd-rw"><span class="cd-mini">${x.mini ? `<img src="${esc(x.mini)}" alt="">` : ""}</span><div class="cd-tx"><b>${esc(x.t)}</b><small>Sacada ${esc(x.h)} · guardada en el celu</small></div><span class="cd-gira"></span></div>`).join("") : q.nF ? "" : '<div class="cd-vacio">No hay fotos esperando.</div>'}${q.nC ? `<div class="cd-rw"><span class="cd-ico am">${ic("tilde")}</span><div class="cd-tx"><b>${q.nC} ${q.nC === 1 ? "cambio" : "cambios"} de tus tareas</b><small>Se manda con las fotos</small></div><span class="cd-gira"></span></div>` : ""}</div>
<div class="cd-cd cd-txt"><b>Podés seguir trabajando.</b> Aunque cierres la app o se apague el celu, no se pierde nada. Cuando vuelva la señal se sube solo y la franja se va.</div>
<button type="button" class="btn-ghost cd-big" data-cd="probar">Probar ahora</button></div>`;
  };
  function leerCola() {
    S.colaPidiendo = true;
    try {
      indexedDB.open("ema-fotos-cola", 1).onsuccess = function (ev) {
        try {
          const db = ev.target.result; if (!db.objectStoreNames.contains("fotos") && !db.objectStoreNames.length) { S.colaPidiendo = false; return; }
          const st = db.transaction(db.objectStoreNames[0], "readonly").objectStore(db.objectStoreNames[0]), r = st.getAll();
          r.onsuccess = () => { S.colaFotos = (r.result || []).filter((x) => x && x.col === "adjuntos").map((x) => { const d = x.data || {}; return { t: [d.num, d.tarea || d.titulo].filter(Boolean).join(" · ") || "Foto", h: hhmm(x.ts || d.creado || Date.now()), mini: d.mini || "" }; }); S.colaTs = Date.now(); S.colaPidiendo = false; if (S.pant === "senal") pintar(true); };
          r.onerror = () => { S.colaPidiendo = false; };
        } catch (e) { S.colaPidiendo = false; }
      };
    } catch (e) { S.colaPidiendo = false; }
  }

  // ------------------------------------------------------------------------------------------- hojas
  function hoja(html, cls) {
    cerrarHoja();
    const v = document.createElement("div"); v.id = "cdHoja"; v.className = "v7-ov no-print" + (cls ? " " + cls : ""); v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true");
    v.innerHTML = `<div class="v7-caja cd-hoja"><div class="v7-asa"></div>${html}</div>`;
    document.body.appendChild(v);
    setTimeout(() => { try { window.__atras && window.__atras.sync && window.__atras.sync(); } catch (e) { } }, 30);
    return v;
  }
  function cerrarHoja() { const v = $("cdHoja"); v && v.remove(); }
  const MOT = [["lluvia", "🌧 Lluvia"], ["material", "📦 Faltó material"], ["epec", "⚡ Falta EPEC"], ["tiempo", "⏱ No alcanzó el tiempo"], ["otro", "Otro"]];
  const motTxt = (k) => ((MOT.find((x) => x[0] === k) || [k, k])[1]).replace(/^\S+\s/, "");
  let HJ = null;   // lo que está abierto en la hoja
  function hojaTermine(o, pa) {
    const hs = horasDe(o, pa.p.k), pasos = pasosDe(o, pa.p.k);
    const fines = Object.keys(pasos).map((q) => pasos[q] && pasos[q].fin).filter(Boolean).sort();
    const finesT = tareas(o).map((x) => envDe(o, x.k) && horasDe(o, x.k).fin).filter(Boolean).sort();
    const llega = mio(o, "llegada");
    const ini = fines[fines.length - 1] || (pa.u.tipo === "unidad" ? "" : hs.ini) || finesT[finesT.length - 1] || (llega && llega.ts ? hhmm(llega.ts) : "") || o.horaInicio || ahoraHM();
    let fin = ahoraHM(); if (minDe(fin) <= minDe(ini)) fin = hmDe(minDe(ini) + 30);
    HJ = { tipo: "termine", id: o.id, k: pa.p.k, num: pa.it ? pa.it.num : "", ini, fin };
    hoja(`<div class="v7-cab"><div><div class="cd-e2">${esc(pa.it ? pa.it.num + " · " : "")}${esc(pa.p.label)}</div><h3>¿A qué hora la hiciste?</h3></div><button type="button" class="v7-x" data-cdh="x" aria-label="Cerrar">✕</button></div>
<div class="cd-hr"><span>Empezó</span><button type="button" class="cd-pm" data-cdh="ini-">${ic("menos", "", 2.4)}</button><b id="cdIni">${ini}</b><button type="button" class="cd-pm" data-cdh="ini+">${ic("mas", "", 2.4)}</button></div>
<div class="cd-hr"><span>Terminó</span><button type="button" class="cd-pm" data-cdh="fin-">${ic("menos", "", 2.4)}</button><b id="cdFin">${fin}</b><button type="button" class="cd-pm" data-cdh="fin+">${ic("mas", "", 2.4)}</button></div>
<div class="cd-hmsg" id="cdHMsg"></div>
<button type="button" class="btn-primary cd-big bverde" data-cdh="sehizo">${ic("tilde", "s22", 2.6)}Se hizo</button><button type="button" class="cd-nohizo" data-cdh="nohizo">No se hizo (decí por qué)</button>`, "cd-ht");
  }
  function hojaMotivo(tipo, titulo, sub) {
    HJ = Object.assign(HJ && HJ.tipo === "termine" ? HJ : {}, { tipo, mot: "" });
    hoja(`<div class="v7-cab"><div><h3>${esc(titulo)}</h3><small>${esc(sub || "")}</small></div><button type="button" class="v7-x" data-cdh="x" aria-label="Cerrar">✕</button></div>
${tipo === "nohizo" ? `<div class="cd-mot">${MOT.map(([k, t]) => `<button type="button" class="chip" data-cdm="${k}">${esc(t)}</button>`).join("")}</div>` : ""}
<textarea id="cdMotTx" rows="3" placeholder="${tipo === "nohizo" ? "Contá un poco (opcional)" : "Contá por qué"}"></textarea><div class="cd-hmsg" id="cdHMsg"></div>
<div class="v7-acc"><button type="button" class="btn-ghost" data-cdh="x">Cancelar</button><button type="button" class="btn-primary" data-cdh="motOk">Mandar</button></div>`);
  }
  function hojaFoto(o, info) {
    const sin = info.enEspera || navigator.onLine === false;
    HJ = { tipo: "foto", id: o.id };
    hoja(`<div class="cd-fg"><span class="cd-fgm">${info.src ? `<img src="${esc(info.src)}" alt="">` : ""}</span><div><b class="cd-fgt">${ic("check", "s22", 2)}Foto guardada</b><small>${esc([info.num, info.tarea, info.gps ? "con GPS" : ""].filter(Boolean).join(" · "))}</small><small>${esc(info.cuenta || "")}</small></div></div>
${sin ? `<div class="cd-sinsen">${ic("nube", "s22", 2)}<span><b>Sin señal.</b> Quedó en el celu y se sube sola cuando vuelva la señal.</span></div>` : ""}
<div class="cd-dosb"><button type="button" class="btn-ghost" data-cdh="otra">${ic("camara", "s18", 2)}Sacar otra</button><button type="button" class="btn-primary" data-cdh="x">Seguir ${ic("flecha", "s18", 2)}</button></div>`, "cd-hf");
    const b = $("cdHoja"); b && b.querySelector(".v7-caja").insertAdjacentHTML("afterbegin", '<button type="button" class="v7-x cd-xabs" data-cdh="x" aria-label="Cerrar">✕</button>');
  }
  function hojaFalta(o) {
    const m = materialDe(o);
    HJ = { tipo: "falta", id: o.id, sel: {} };
    const pa = pasoActual(o);
    hoja(`<div class="v7-cab"><div><h3>¿Qué te falta?</h3><small>Material de esta orden${m.reservas.length ? " (reserva " + esc(m.reservas.map((r) => r.numero).join(", ")) + ")" : ""}</small></div><button type="button" class="v7-x" data-cdh="x" aria-label="Cerrar">✕</button></div>
<div class="cd-fl">${m.items.map((x, i) => `<div class="cd-flr" data-i="${i}"><button type="button" class="cd-box2" data-cdh="ftick" data-i="${i}" aria-label="${esc(x.desc)}">${ic("tilde", "", 3)}</button><div class="cd-tx"><b><code>${esc(x.cod)}</code> ${esc(x.desc)}</b></div><span class="cd-fq" hidden><button type="button" class="cd-pm2" data-cdh="fq-" data-i="${i}">${ic("menos", "", 2.4)}</button><b data-fq="${i}">1</b><button type="button" class="cd-pm2" data-cdh="fq+" data-i="${i}">${ic("mas", "", 2.4)}</button></span></div>`).join("") || '<div class="cd-vacio">Esta orden no tiene material reservado: escribí abajo qué falta.</div>'}</div>
<textarea id="cdFaltaTx" rows="2" placeholder="Otra cosa que falta (opcional)"></textarea><div class="cd-hmsg" id="cdHMsg"></div>
<button type="button" class="btn-primary cd-big cd-off" data-cdh="faltaOk" id="cdFaltaOk">${ic("alerta", "s22", 2)}Avisar al pañol y a la oficina</button>`, "cd-hfl");
    HJ.items = m.items; HJ.tarea = pa.p ? pa.p.label + (pa.it ? " · " + pa.it.num : "") : "";
  }
  function hojaAyuda(o) {
    const pa = pasoActual(o), donde = pa.p ? primero(pa.p.label) + (pa.it ? " · " + pa.it.num : "") : (o && o.plazaNombre) || "";
    const l = contactos(o).slice(0, 3).map((c) => primero(c.nombre));
    HJ = { tipo: "ayuda", id: o ? o.id : "" };
    hoja(`<div class="v7-cab"><div><h3>¿Qué necesitás?</h3><small>Estás en: ${esc(donde)}</small></div><button type="button" class="v7-x" data-cdh="x" aria-label="Cerrar">✕</button></div>
<button type="button" class="cd-op" data-cdh="ia"><span class="cd-opi n">${ic("ia", "", 2)}</span><span><b>Preguntale al asistente</b><small>Escribí o hablá · te contesta corto</small></span></button>
<button type="button" class="cd-op" data-cdh="guia"><span class="cd-opi t">${ic("libro", "", 2)}</span><span><b>Ver cómo se hace</b><small>Esta tarea, paso a paso con dibujos</small></span></button>
<button type="button" class="cd-op" data-cdh="llamar"><span class="cd-opi v">${ic("tel", "", 2)}</span><span><b>Llamar a la oficina</b><small>${esc(l.length ? l.join(", ") : "Oficina o el pañol")}</small></span></button>
<button type="button" class="cd-link c" data-cdh="x">Cancelar</button>`);
  }
  // ---- guía de la tarea, en el paso
  const GUIA_DE = [[/montaje|izaje|izado|vinculo|luminaria|columna prfv|aplomado/, "montaje_prfv"], [/bpn|bornera|tablerito|caja|sellado/, "caja_columna_prfv"], [/fundac|excav|hormig|pozo/, "fundacion_prfv"], [/zanj|tendido|cable|cruce/, "zanjeo_tendido"], [/\bpat\b|tierra|jabalina|medicion_pat/, "puesta_tierra"], [/acometida/, "acometida_aerea"], [/morseto/, "morseto_pkd14"], [/preensamblado|aereo|piloto/, "tendido_aereo_barrio"]];
  const raiz = () => { try { if (window.__cargador && window.__cargador.url) return String(window.__cargador.url).replace(/[^/]*$/, ""); } catch (e) { } try { return new URL("./", location.href).href; } catch (e) { return ""; } };
  let GI = null;
  function indiceGuias() {
    if (GI) return Promise.resolve(GI);
    try { const j = JSON.parse(localStorage.getItem("ema.guias.indice") || "null"); if (j && j.pasos) GI = j; } catch (e) { }
    return fetch(raiz() + "guias/indice.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && j.pasos) GI = j; return GI; }).catch(() => GI);
  }
  const GV = { g: "", n: 1, hojas: 1, z: 1, titulo: "", tarea: "" };
  function abrirGuia(o) {
    const pa = pasoActual(o), p = pa.p || (tareas(o)[0] || null);
    const t = p ? nk(p.k + " " + p.label) : "", r = GUIA_DE.find((x) => x[0].test(t));
    GV.tarea = p ? p.label : ""; GV.n = 1; GV.z = 1;
    cerrarHoja();
    const v = document.createElement("div"); v.id = "cdGuia"; v.className = "v7-ov no-print cd-gov"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true");
    v.innerHTML = `<div class="cd-gcab"><button type="button" class="cd-gb" data-cdg="x" aria-label="Cerrar">${ic("volver", "", 2)}</button><div><b id="cdGT">Cómo se hace</b><small>Tarea: ${esc(GV.tarea)}</small></div><button type="button" class="cd-gb" data-cdg="x" aria-label="Cerrar">${ic("cruz", "", 2)}</button></div><div class="cd-gcu" id="cdGCu"><div class="cd-cd cd-vacio">Cargando la guía…</div></div>`;
    document.body.appendChild(v);
    setTimeout(() => { try { window.__atras && window.__atras.sync && window.__atras.sync(); } catch (e) { } }, 30);
    indiceGuias().then((ind) => {
      const cu = $("cdGCu"); if (!cu) return;
      if (!ind || !ind.pasos) { cu.innerHTML = '<div class="cd-cd cd-vacio">📶 Sin señal: la guía se ve cuando vuelva la señal.</div>'; return; }
      const g = r && ind.pasos[r[1]] ? r[1] : "";
      if (!g) { cu.innerHTML = `<div class="cd-cd cd-vacio">Esta tarea todavía no tiene su guía paso a paso. Mirá las guías en el menú › Guías.</div><button type="button" class="btn-ghost cd-big" data-cdg="guias">Ver todas las guías</button>`; return; }
      GV.g = g; GV.hojas = ind.pasos[g].hojas || 1; GV.titulo = ind.pasos[g].titulo || "Cómo se hace";
      const t1 = $("cdGT"); t1 && (t1.textContent = "Cómo se hace · " + GV.titulo.split(":")[0]);
      // material de la guía: láminas que nombran este paso → hojas de material → códigos del pañol
      const mats = []; Object.keys(obj(ind.laminas)).forEach((k) => { const l = ind.laminas[k]; if (arr(l.paso).indexOf(g) >= 0) arr(l.mat).forEach((m) => mats.indexOf(m) < 0 && mats.push(m)); });
      const C = cat0(), cods = []; arr(ind.hojasMat).forEach((h) => { if (mats.indexOf(h.hoja) >= 0) arr(h.codigos).forEach((c) => cods.indexOf(String(c)) < 0 && cods.push(String(c))); });
      GV.mat = cods.slice(0, 12).map((c) => ({ c, d: (C.get(c) || {}).desc || "" })).filter((x) => x.d);
      pintarGuia();
    });
  }
  function pintarGuia() {
    const cu = $("cdGCu"); if (!cu || !GV.g) return;
    const src = raiz() + "guias/pasos/" + GV.g + "_p" + GV.n + ".webp";
    cu.innerHTML = `<div class="cd-cd cd-gimg"><div class="cd-gz" id="cdGZ"><img src="${esc(src)}" alt="Paso ${GV.n}" style="width:${Math.round(GV.z * 100)}%" data-cdg="ver"></div><div class="cd-gzb"><button type="button" class="cd-pm" data-cdg="z+" aria-label="Acercar">${ic("mas", "", 2.4)}</button><button type="button" class="cd-pm" data-cdg="z-" aria-label="Alejar">${ic("menos", "", 2.4)}</button></div></div>
<div class="cd-gnav"><button type="button" class="cd-pm" data-cdg="ant" aria-label="Anterior" ${GV.n <= 1 ? "disabled" : ""}>${ic("volver", "", 2.4)}</button><div><b>Paso ${GV.n} de ${GV.hojas}</b><div class="cd-pts">${Array.from({ length: GV.hojas }, (_, i) => `<i class="${i + 1 < GV.n ? "h" : i + 1 === GV.n ? "a" : ""}"></i>`).join("")}</div></div><button type="button" class="cd-pm" data-cdg="sig" aria-label="Siguiente" ${GV.n >= GV.hojas ? "disabled" : ""}>${ic("chev", "", 2.4)}</button></div>
${GV.mat && GV.mat.length ? `<div class="cd-cd"><div class="cd-eti"><span>Material de esta guía</span></div>${GV.mat.map((x) => `<div class="cd-rw"><code>${esc(x.c)}</code><div class="cd-tx"><b>${esc(x.d)}</b></div></div>`).join("")}</div>` : ""}`;
  }

  // ------------------------------------------------------------------------------------------- acciones (escriben por __mtAPI)
  // lista de usuarios para los avisos: la cuadrilla no tiene PERMISOS.lista() completa → se lee una vez
  let usCache = null;
  function usuariosAviso() {
    const l = intentar(() => PERMISOS.lista() || [], []);
    if (l.some((u) => u && (u.rol === "panol" || u.rol === "oficina" || u.rol === "admin"))) return Promise.resolve(l);
    if (usCache) return Promise.resolve(usCache);
    try { return firebase.firestore().collection("usuarios").get().then((s) => (usCache = s.docs.map((d) => Object.assign({ uid: d.id }, d.data()))), () => []); } catch (e) { return Promise.resolve([]); }
  }
  async function avisarA(o, titulo, cuerpo, tipo, conPanol) {
    const us = await usuariosAviso();
    const yoE = miEmail(), dest = new Set(), nombres = [];
    const ok = (u) => u && u.activo !== false && u.pendiente !== true && u.email;
    if (o && o.supervisor && o.supervisor.email) { dest.add(String(o.supervisor.email).toLowerCase()); nombres.push(primero(o.supervisor.nombre || "")); }
    else us.filter((u) => ok(u) && (u.rol === "admin" || u.rol === "oficina")).forEach((u) => { dest.add(String(u.email).toLowerCase()); nombres.push(primero(u.nombre || u.usuario || "")); });
    if (conPanol) us.filter((u) => ok(u) && u.rol === "panol").forEach((u) => { dest.add(String(u.email).toLowerCase()); nombres.push("el pañol"); });
    const l = [...dest].filter((e) => e && e !== yoE);
    if (window.__pushAvisos && window.__pushAvisos.dejarAviso) for (const em of l) { try { await window.__pushAvisos.dejarAviso({ email: em, titulo, cuerpo, tipo, ref: o ? String(o.id) : "", tag: "ema-" + tipo + "-" + (o ? o.id : "") + "-" + Date.now(), url: "./" }); } catch (e) { } }
    return { l, nombres: [...new Set(nombres.filter(Boolean))] };
  }
  function llegue(o) {
    const fin = (p) => {
      const c = coordObra(o), d = c && p ? Math.round(dist(p, c)) : null;
      const x = { ts: Date.now(), por: per() }; if (p) { x.lat = +p.lat.toFixed(6); x.lng = +p.lng.toFixed(6); x.acc = p.acc || 0; } if (d != null) { x.dist = d; x.enObra = d <= CERCA; }
      guardar(o, { ["campo.llegada." + Lk(clave())]: x });
      S.toast = d != null && d <= CERCA ? "Llegaste a la obra · " + hhmm(x.ts) : "Anotado: llegaste " + hhmm(x.ts) + (d != null ? " (a " + distTxt(d) + " del pin)" : ""); S.toastTs = Date.now();
      pintar(true);
    };
    if (S.pos && Date.now() - S.posTs < 60000) fin(S.pos); else pedirGPS(fin);
  }
  // los dos «📷» viven fuera de lo que se redibuja (si no, la foto llega a un input que ya no está en la página)
  function entrada(id, o) {
    let w = $("cdIns"); if (!w) { w = document.createElement("div"); w.id = "cdIns"; w.style.display = "none"; document.body.appendChild(w); }
    if (o) w.dataset.ot = o.id;
    let i = $(id); if (!i) { w.insertAdjacentHTML("beforeend", `<input type="file" accept="image/*" capture="environment" id="${id}">`); i = $(id); }
    return i;
  }
  function tomarFoto(o, pa, otra) {
    const inp = entrada("cdFotoIn", o);
    const it = pa.it || (otra && S.ultFoto ? { num: S.ultFoto.num } : null);
    inp.dataset.fln = it ? it.num : pa.p.label; inp.dataset.k = pa.p.k; inp.dataset.ot = o.id; inp.dataset.cat = pa.u.cat; inp.dataset.otra = otra ? "1" : "";
    abrirCamara(inp, pa.u.tipo === "unidad" ? (pa.u.cat === "columna" ? "Columna entera en el cuadro" : "Que se vea " + (pa.u.cosa === "jabalina" ? "la jabalina" : "la " + pa.u.cosa) + " entera") : "Que se vea el trabajo terminado", primero(pa.p.label) + (it ? " · " + it.num : ""));
  }
  function abrirCamara(inp, guia, titulo) {
    const usarTel = intentar(() => localStorage.getItem("ema.camara.telefono") === "1", false);
    if (window.camaraApp && window.camaraApp.abrir && !usarTel && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      window.camaraApp.abrir(inp);
      let n = 0; const t = setInterval(() => { const e = $("emaCam"); if (e || ++n > 40) { clearInterval(t); if (e && !e.querySelector(".cd-guia")) { e.insertAdjacentHTML("beforeend", `<div class="cd-guia" aria-hidden="true"><span>${esc(guia)} ✓</span><i></i></div>`); const tt = e.querySelector(".ec-tit"); tt && titulo && (tt.textContent = titulo); } } }, 50);
    } else inp.click();
  }
  async function fotoElegida(inp) {
    const f = inp.files && inp.files[0]; if (!f) return;
    const o = otDe(inp.dataset.ot), a = API(); if (!o || !a) return;
    const p = tareas(o).find((x) => x.k === inp.dataset.k); if (!p) return;
    const num = inp.dataset.fln || "", cat = inp.dataset.cat || catDe(p), por = per();
    const src = intentar(() => URL.createObjectURL(f), "");
    const meta = { plazaId: o.plazaId || "", plazaNombre: o.plazaNombre || "", otId: o.id, otNumero: o.numero || "", k: p.k, tarea: p.label, cat, num, por, origen: "cuadrilla", titulo: `${o.numero || ""} · ${p.label}` };
    S.msg = "Guardando la foto…"; pintar(true);
    let enEspera = false, s = null;
    try { s = await window.guardarFotoObra(f, meta); }
    catch (er) { if (er && er.enEspera && er.adjId) { s = { adjId: er.adjId, mini: "" }; enEspera = true; } else { S.msg = window.__fotoError ? window.__fotoError(er, o) : "⚠ No se pudo guardar la foto. Probá de nuevo."; inp.value = ""; pintar(true); return; } }
    a.guardar(o, { ["campo.fotos." + Lk(s.adjId)]: { por, ts: Date.now(), k: p.k, tarea: p.label, cat, num, mini: s.mini || "" } });
    if (o.estado === "Emitida") a.guardar(o, { estado: "En curso" });
    inp.value = ""; S.msg = ""; S.ultFoto = { num, k: p.k };
    const u = unidades(o, p), ix = u.items.findIndex((x) => nk(x.num) === nk(num));
    const cuenta = u.tipo === "unidad" ? `Es la ${ix + 1} de ${u.items.length} ${u.cosa === "columna" ? "columnas" : u.cosa + "s"}` : `${u.items.filter((x) => x.foto).length} de ${u.items.length} fotos de esta tarea`;
    pintar(true);
    const gps = intentar(() => !!(window.__fotoGpsVivo && window.__fotoGpsVivo()), false) || !!S.pos;
    hojaFoto(o, { src: s.mini || src, num, tarea: primero(p.label), gps, enEspera: enEspera, cuenta });
  }
  function marcarTareaFin(o, p, estadoEnv, extra) {
    // la orden se envía sola cuando están todas mandadas (como envioTarea)
    const a = API(), yoN = per();
    a.guardar(o, Object.assign({ ["campo.tareaEnv." + Lk(p.k) + "." + Lk(yoN)]: { estado: estadoEnv, ts: Date.now(), por: yoN } }, extra || {}));
    const o3 = otDe(o.id) || o, falta = tareas(o3).filter((x) => !envDe(o3, x.k));
    if (!falta.length) {
      const hs = tareas(o3).map((x) => horasDe(o3, x.k)).filter((h) => h.ini && h.fin);
      const patch = {};
      if (hs.length) { const i = hs.map((h) => h.ini).sort()[0], f = hs.map((h) => h.fin).sort().slice(-1)[0], ho = Math.round(((minDe(f) - minDe(i)) / 60) * 100) / 100; patch["campo.horas." + Lk(yoN)] = { nombre: yoN, ini: i, fin: f, horas: ho > 0 ? ho : 0 }; }
      if (!obj(campo(o3).enviados)[Lk(yoN)]) patch["campo.enviados." + Lk(yoN)] = { nombre: yoN, ts: Date.now() };
      if (Object.keys(patch).length) a.guardar(o3, patch);
      return true;
    }
    return false;
  }
  function seHizo() {
    const o = otDe(HJ.id), a = API(); if (!o || !a) return cerrarHoja();
    const p = tareas(o).find((x) => x.k === HJ.k); if (!p) return cerrarHoja();
    if (!(minDe(HJ.fin) > minDe(HJ.ini))) { const m = $("cdHMsg"); m && (m.textContent = "La hora de fin tiene que ser después de la de inicio."); return; }
    const yoN = per(), u = unidades(o, p), hs = horasDe(o, p.k);
    const iniT = hs.ini && minDe(hs.ini) < minDe(HJ.ini) ? hs.ini : HJ.ini, finT = hs.fin && minDe(hs.fin) > minDe(HJ.fin) ? hs.fin : HJ.fin;
    const patch = { ["campo.horasTarea." + p.k]: { ini: iniT, fin: finT, por: yoN, ts: Date.now() } };
    let ultima = true, cant = 0, msgT = "";
    if (u.tipo === "unidad" && HJ.num) {
      patch["campo.pasosObra." + Lk(p.k) + "." + Lk(nk(HJ.num))] = { num: HJ.num, ini: HJ.ini, fin: HJ.fin, estado: "si", por: yoN, ts: Date.now() };
      const hechas = u.items.filter((x) => x.paso && x.paso.estado !== "no").length + 1;
      ultima = u.items.filter((x) => !x.paso && nk(x.num) !== nk(HJ.num)).length === 0;
      cant = hechas; msgT = `${HJ.num} lista y mandada${ultima ? " · terminaste " + primero(p.label).toLowerCase() : " · vas " + hechas + " de " + u.items.length}`;
    } else { const m0 = marca(o, p.k) || {}; cant = m0.hecho && Number(m0.cant) > 0 ? Number(m0.cant) : (p.repartida && p.mio > 0 ? p.mio : p.prev) || 1; msgT = p.label + " lista y mandada"; }
    a.guardar(o, patch);
    a.marcar(otDe(o.id) || o, p.k, { hecho: true, cant, motivo: "", nota: "" });
    cerrarHoja();
    let todo = false;
    if (ultima) { todo = marcarTareaFin(otDe(o.id) || o, p, "si"); avisarA(o, "📨 " + (o.plazaNombre || "Orden") + " · tarea enviada", `${primero(yoN)} · ✅ ${p.label} · ${fmtN(cant)} ${p.un || ""} · ${iniT} a ${finT} · ${o.numero || ""}`, "envio", false); }
    S.toast = todo ? "Mandaste todas las tareas de hoy" : msgT; S.toastTs = Date.now();
    pintar(true);
  }
  function noSeHizo(mot, nota) {
    const o = otDe(HJ.id), a = API(); if (!o || !a) return cerrarHoja();
    const p = tareas(o).find((x) => x.k === HJ.k); if (!p) return cerrarHoja();
    const yoN = per(), u = unidades(o, p), patch = {};
    let hechas = 0;
    if (u.tipo === "unidad") {
      hechas = u.items.filter((x) => x.paso && x.paso.estado !== "no").length;
      u.items.filter((x) => !x.paso).forEach((x) => { patch["campo.pasosObra." + Lk(p.k) + "." + Lk(nk(x.num))] = { num: x.num, estado: "no", motivo: mot, por: yoN, ts: Date.now() }; });
    }
    const resto = u.tipo === "unidad" ? u.items.filter((x) => !x.paso).map((x) => x.num) : [];
    const txt = [motTxt(mot), nota].filter(Boolean).join(" — ");
    a.guardar(o, patch);
    if (hechas > 0) a.marcar(otDe(o.id) || o, p.k, { hecho: true, cant: hechas, motivo: mot, nota: "No se hizo " + resto.join(", ") + ": " + txt });
    else a.marcar(otDe(o.id) || o, p.k, { hecho: false, cant: 0, motivo: mot, nota: nota || "" });
    cerrarHoja();
    marcarTareaFin(otDe(o.id) || o, p, hechas > 0 ? "si" : "no");
    avisarA(o, "📨 " + (o.plazaNombre || "Orden") + " · tarea enviada", `${primero(yoN)} · ✕ No se hizo: ${p.label}${resto.length && hechas ? " (" + resto.join(", ") + ")" : ""} · ${txt} · ${o.numero || ""}`, "envio", false);
    S.toast = "Avisado: " + p.label + " no se hizo"; S.toastTs = Date.now();
    pintar(true);
  }
  async function segFotoElegida(inp) {
    const f = inp.files && inp.files[0], o = otDe(inp.dataset.ot), id = inp.dataset.it; if (!f || !o || !id) return;
    const it = SEG.find((x) => x[0] === id) || [id, id], por = per();
    S.msg = "Guardando la foto…"; pintar(true);
    let s = null;
    try { s = await window.guardarFotoObra(f, { plazaId: o.plazaId || "", plazaNombre: o.plazaNombre || "", otId: o.id, otNumero: o.numero || "", k: "seguridad", tarea: "Seguridad: " + it[1], cat: "seguridad", num: it[1], por, origen: "cuadrilla", titulo: `${o.numero || ""} · Seguridad / ${it[1]}` }); }
    catch (er) { if (er && er.enEspera && er.adjId) s = { adjId: er.adjId, mini: "" }; else { S.msg = window.__fotoError ? window.__fotoError(er, o) : "⚠ No se pudo guardar la foto."; inp.value = ""; pintar(true); return; } }
    const c = Lk(clave());
    guardar(o, { ["campo.fotos." + Lk(s.adjId)]: { por, ts: Date.now(), k: "seguridad", tarea: "Seguridad: " + it[1], cat: "seguridad", num: it[1], mini: s.mini || "" }, ["campo.seguridad." + c + ".fotos." + id]: s.adjId, ["campo.seguridad." + c + ".fotosTs." + id]: Date.now(), ["campo.seguridad." + c + ".items." + id]: true, ["campo.seguridad." + c + ".por"]: por });
    S.segTmp[o.id] = Object.assign({}, S.segTmp[o.id] || {}, { [id]: true });
    inp.value = ""; S.msg = ""; pintar(true);
  }
  function arrancar(o, motivo) {
    const its = segItems(o), c = Lk(clave()), por = per(), todo = SEG.every((s) => segOk(o, s[0])) && !!corteDe(o);
    const items = {}; SEG.forEach((s) => (items[s[0]] = !!its[s[0]]));
    const patch = { ["campo.seguridad." + c + ".items"]: items, ["campo.seguridad." + c + ".ts"]: Date.now(), ["campo.seguridad." + c + ".por"]: por, ["campo.seguridad." + c + ".ok"]: todo, ["campo.seguridad." + c + ".motivo"]: motivo || "" };
    // lo de antes (Mis tareas y la oficina miran epp / baliza / herram / corte): se llena con lo mismo
    if (todo) Object.assign(patch, { "campo.seguridad.epp": true, "campo.seguridad.baliza": true, "campo.seguridad.herram": true, "campo.seguridad.por": por, "campo.seguridad.ts": Date.now() });
    guardar(o, patch); S.segTmp[o.id] = {};
    if (!todo) avisarA(o, "🦺 " + (o.plazaNombre || "Orden") + " · arrancó sin la seguridad completa", `${primero(por)}: ${motivo} · ${o.numero || ""}`, "seguridad", false);
    ir("salir");
  }
  function salir(o, motivo) {
    const m = materialDe(o), hs = herrSugeridas(o), tmp = S.salidaTmp[o.id] || {};
    const hOk = (x) => tmp[nk(x.n)] != null ? !!tmp[nk(x.n)] : !x.otro && !!(x.h && nk(x.quien) === nk(per()));
    const x = { ts: Date.now(), por: per(), ok: !motivo, motivo: motivo || "", faltaMat: m.items.filter((i) => !i.ret).map((i) => i.cod + " " + i.desc), llevo: hs.filter(hOk).map((h) => h.n), faltaHerr: hs.filter((h) => !hOk(h)).map((h) => h.n) };
    guardar(o, { ["campo.salida." + Lk(clave())]: x });
    if (motivo) avisarA(o, "🚚 " + (o.plazaNombre || "Orden") + " · salieron igual", `${primero(per())}: ${motivo}${x.faltaMat.length ? " · falta material: " + x.faltaMat.join(", ") : ""} · ${o.numero || ""}`, "salida", false);
    ir("llegar");
  }
  async function avisarFalta() {
    const o = otDe(HJ.id); if (!o) return cerrarHoja();
    const sel = Object.keys(HJ.sel).map((i) => Object.assign({}, HJ.items[+i], { pide: HJ.sel[i] }));
    const otra = (($("cdFaltaTx") || {}).value || "").trim().slice(0, 300);
    if (!sel.length && !otra) { const m = $("cdHMsg"); m && (m.textContent = "Tildá qué falta o escribilo abajo."); return; }
    const b = $("cdFaltaOk"); b && (b.disabled = true);
    const id = "f" + Date.now().toString(36);
    const reg = { items: sel.map((x) => ({ codigo: x.cod, desc: x.desc, cant: x.pide, un: x.un })), otra, tarea: HJ.tarea || "", por: per(), ts: Date.now() };
    guardar(o, { ["campo.faltaMaterial." + id]: reg });
    const txt = sel.map((x) => `${x.cod} ${x.desc} × ${fmtN(x.pide)}`).concat(otra ? [otra] : []).join(" · ");
    const r = await avisarA(o, "📦 Falta material · " + (o.plazaNombre || ""), `${primero(per())}${HJ.tarea ? " (" + HJ.tarea + ")" : ""}: ${txt} · ${o.numero || ""}`, "falta", true);
    guardar(o, { ["campo.faltaMaterial." + id + ".avisados"]: r.l.length });
    const caja = document.querySelector("#cdHoja .cd-hoja");
    caja && caja.insertAdjacentHTML("beforeend", `<div class="cd-avisado" role="status">${ic("check", "s22", 2)}<span><b>Avisado ✓</b>${esc(r.nombres.length ? r.nombres.join(" y ") + " ya lo ven." : "La oficina ya lo ve.")} Te avisan cuando esté listo.</span></div>`);
    b && b.classList.add("cd-off");
  }
  function mandarOficina() {
    const yoN = per(), a = API(); if (!a) return;
    const l = misOtsHoy().filter((o) => !cerrada(o));
    const sinM = l.reduce((s, o) => s + tareas(o).filter((p) => !envDe(o, p.k)).length, 0);
    if (sinM && !S.mandarIgual) { S.mandarIgual = true; S.msg = `Te ${sinM === 1 ? "queda 1 tarea" : "quedan " + sinM + " tareas"} sin mandar. Tocá de nuevo para mandar igual.`; pintar(true); return; }
    S.mandarIgual = false;
    l.forEach((o) => {
      const hs = tareas(o).map((x) => horasDe(o, x.k)).filter((h) => h.ini && h.fin), patch = { ["campo.enviados." + Lk(yoN)]: { nombre: yoN, ts: Date.now() } };
      if (hs.length) { const i = hs.map((h) => h.ini).sort()[0], f = hs.map((h) => h.fin).sort().slice(-1)[0], ho = Math.round(((minDe(f) - minDe(i)) / 60) * 100) / 100; patch["campo.horas." + Lk(yoN)] = { nombre: yoN, ini: i, fin: f, horas: ho > 0 ? ho : 0 }; }
      a.guardar(o, patch);
    });
    S.msg = ""; S.toast = "Listo: la oficina ya tiene lo de hoy"; S.toastTs = Date.now(); pintar(true);
  }
  function mandarUbicacion() {
    const o = otActual();
    pedirGPS((p) => {
      const txt = `${primero(per())} · estoy acá${o ? " (" + (o.plazaNombre || "") + " · " + (o.numero || "") + ")" : ""}: ` + (p ? `https://maps.google.com/?q=${p.lat.toFixed(6)},${p.lng.toFixed(6)}` : "sin GPS ahora");
      const u = "https://wa.me/?text=" + encodeURIComponent(txt);
      try { window.__cdUltimaUrl = u; const w = window.open(u, "_blank"); if (!w) location.href = u; } catch (e) { }
    });
  }
  function asistente(o) {
    const pa = o ? pasoActual(o) : {}, donde = pa.p ? primero(pa.p.label) + (pa.it ? " · " + pa.it.num : "") : "";
    window.__iaEnObra = o ? `${donde ? donde + " · " : ""}${o.plazaNombre || ""} (${o.numero || ""})` : "";
    cerrarHoja();
    const ok = typeof window.__asistenteAbrir == "function" && window.__asistenteAbrir();
    if (!ok) { avisar("El asistente no está prendido para tu usuario. Preguntale a la oficina."); return; }
    let n = 0; const t = setInterval(() => {
      const p = $("iaPanel"); if (!p && ++n < 40) return; clearInterval(t); if (!p) return;
      let b = $("cdIaCtx"); if (!b) { b = document.createElement("div"); b.id = "cdIaCtx"; const ch = $("iaChat"); ch && ch.parentNode ? ch.parentNode.insertBefore(b, ch) : p.appendChild(b); }
      const q = intentar(() => window.__iaUso.quedaTexto(), "");
      b.innerHTML = `${ic("pin", "s16", 2)}<span>Estás en: <b>${esc(donde || (o && o.plazaNombre) || "")}</b></span>${q ? `<em>${esc(q)}</em>` : ""}`;
    }, 80);
  }

  // ------------------------------------------------------------------------------------------- clics
  document.addEventListener("click", (e) => {
    const t = e.target; if (!t || !t.closest) return;
    // hojas
    const hb = t.closest("#cdHoja [data-cdh], #cdHoja [data-cdm]");
    if (hb) {
      const a = hb.dataset.cdh, o = HJ && otDe(HJ.id);
      if (hb.dataset.cdm) { HJ.mot = hb.dataset.cdm; document.querySelectorAll("#cdHoja [data-cdm]").forEach((x) => x.classList.toggle("activo", x === hb)); return; }
      if (a === "x") { cerrarHoja(); HJ = null; pintar(true); return; }
      if (a === "ini-" || a === "ini+" || a === "fin-" || a === "fin+") { const k = a.slice(0, 3), d = a.slice(3) === "+" ? 5 : -5; HJ[k] = hmDe(Math.round((minDe(HJ[k]) + d) / 5) * 5); const el = $(k === "ini" ? "cdIni" : "cdFin"); el && (el.textContent = HJ[k]); const m = $("cdHMsg"); m && (m.textContent = minDe(HJ.fin) > minDe(HJ.ini) ? "" : "La hora de fin tiene que ser después de la de inicio."); return; }
      if (a === "sehizo") return seHizo();
      if (a === "nohizo") { const p = o && tareas(o).find((x) => x.k === HJ.k); return hojaMotivo("nohizo", "¿Por qué no se hizo?", (HJ.num ? HJ.num + " · " : "") + (p ? p.label : "")); }
      if (a === "motOk") {
        const tx = (($("cdMotTx") || {}).value || "").trim().slice(0, 300), m = $("cdHMsg");
        if (HJ.tipo === "nohizo") { if (!HJ.mot) { m && (m.textContent = "Tocá por qué no se hizo."); return; } return noSeHizo(HJ.mot, tx); }
        if (!tx) { m && (m.textContent = "Contá por qué (una línea alcanza)."); return; }
        const oo = otActual(); cerrarHoja();
        if (HJ.tipo === "arrancarIgual" && oo) return arrancar(oo, tx);
        if (HJ.tipo === "salirIgual" && oo) return salir(oo, tx);
        return;
      }
      if (a === "otra" && o) { cerrarHoja(); const pa = pasoActual(o); const p = S.ultFoto && tareas(o).find((x) => x.k === S.ultFoto.k); if (p) tomarFoto(o, { p, u: unidades(o, p), it: { num: S.ultFoto.num } }, true); return; }
      if (a === "ftick" || a === "fq+" || a === "fq-") {
        const i = hb.dataset.i, row = document.querySelector(`#cdHoja .cd-flr[data-i="${i}"]`), it = HJ.items[+i];
        if (a === "ftick") { if (HJ.sel[i] != null) delete HJ.sel[i]; else HJ.sel[i] = Math.max(1, Math.round(it && !it.ret ? it.cant : 1) || 1); }
        else if (HJ.sel[i] != null) HJ.sel[i] = Math.max(1, HJ.sel[i] + (a === "fq+" ? 1 : -1));
        if (row) { row.classList.toggle("on", HJ.sel[i] != null); const q = row.querySelector(".cd-fq"); q && (q.hidden = HJ.sel[i] == null); const b = row.querySelector("[data-fq]"); b && (b.textContent = HJ.sel[i] != null ? fmtN(HJ.sel[i]) : "1"); }
        const ok = $("cdFaltaOk"); ok && ok.classList.toggle("cd-off", !Object.keys(HJ.sel).length && !(($("cdFaltaTx") || {}).value || "").trim());
        return;
      }
      if (a === "faltaOk") return void avisarFalta();
      if (a === "ia") return asistente(otActual());
      if (a === "guia") return abrirGuia(otActual());
      if (a === "llamar") { cerrarHoja(); return ir("llamar"); }
      return;
    }
    const gb = t.closest("#cdGuia [data-cdg]");
    if (gb) {
      const a = gb.dataset.cdg;
      if (a === "x") { const v = $("cdGuia"); v && v.remove(); return; }
      if (a === "guias") { const v = $("cdGuia"); v && v.remove(); try { mostrarVista("guias"); } catch (er) { } return; }
      if (a === "ant" && GV.n > 1) { GV.n--; GV.z = 1; return pintarGuia(); }
      if (a === "sig" && GV.n < GV.hojas) { GV.n++; GV.z = 1; return pintarGuia(); }
      if (a === "z+" || a === "z-") { GV.z = Math.max(1, Math.min(4, GV.z + (a === "z+" ? 0.5 : -0.5))); const im = document.querySelector("#cdGZ img"); im && (im.style.width = Math.round(GV.z * 100) + "%"); return; }
      if (a === "ver") { try { window.__matFichas && window.__matFichas.visor ? window.__matFichas.visor(gb.getAttribute("src")) : window.open(gb.getAttribute("src"), "_blank"); } catch (er) { } return; }
      return;
    }
    const app = $("cdApp"); if (!app || !app.contains(t)) return;
    if (t.closest("[data-cdvolver]")) { e.preventDefault(); return volver(); }
    const b = t.closest("[data-cd]"); if (!b) return;
    const a = b.dataset.cd, o = otActual();
    if (a === "tel" || a === "wa" || a === "gmaps") return;   // los enlaces siguen solos
    e.preventDefault();
    if (a === "menu") return typeof abrirMenuLateral == "function" && abrirMenuLateral();
    if (a === "avisos") { const c = $("avCampana") || document.querySelector("#avBtn, .av-campana"); c && c.click(); return; }
    if (a === "aviso") { const id = b.dataset.avid, st = intentar(() => window.__emaAvisos.leer(), null), av = st && (st.lista || []).find((x) => x.id === id); intentar(() => window.__emaAvisos.marcarLeidos([id])); if (av && /orden|ot/i.test(String(av.tipo || av.titulo))) ir("orden"); else if (av && /punto/i.test(av.titulo)) ir("puntos"); else pintar(true); return; }
    if (a === "lista") { try { mostrarVista("mistareas"); setTimeout(() => { const it = o && document.querySelector(`.mt-item[data-mtabrir="${o.id}"]`); it && it.click(); }, 400); } catch (er) { } return; }
    if (a === "calc") { try { mostrarVista("calc"); } catch (er) { } return; }
    if (a === "elegir") { S.otId = b.dataset.ot || ""; recordar(); return ir("orden"); }
    if (["orden", "llegar", "obra", "fin", "puntos", "llamar", "senal"].indexOf(a) >= 0) return ir(a);
    if (a === "seguir") return ir(mio(o, "llegada") ? "obra" : segHecha(o) ? (mio(o, "salida") ? "llegar" : "salir") : "seg");
    if (a === "empezar") { if (!o) return; return ir(mio(o, "llegada") ? "obra" : !segHecha(o) ? "seg" : !mio(o, "salida") ? "salir" : "llegar"); }
    if (a === "segtick") { if (!o) return; const id = b.dataset.it, cur = segItems(o)[id]; S.segTmp[o.id] = Object.assign({}, S.segTmp[o.id] || {}, { [id]: !cur }); guardar(o, { ["campo.seguridad." + Lk(clave()) + ".items." + id]: !cur, ["campo.seguridad." + Lk(clave()) + ".por"]: per() }); return pintar(true); }
    if (a === "segfoto") { if (!o) return; const inp = entrada("cdSegIn", o); inp.dataset.ot = o.id; inp.dataset.it = b.dataset.it; const it = SEG.find((x) => x[0] === b.dataset.it); inp.dataset.fln = "Seguridad / " + (it ? it[1] : ""); return abrirCamara(inp, it && it[0] === "conos" ? "Que se vean los conos alrededor" : "Que se vea entero", "Seguridad · " + (it ? it[1] : "")); }
    if (a === "corte") { if (!o) return; const v = corteDe(o) === b.dataset.v ? "" : b.dataset.v; guardar(o, { "campo.seguridad.corte": v }); return pintar(true); }
    if (a === "arrancar") { if (!o) return; if (b.classList.contains("cd-off")) { S.msg = "Completá todo (con las fotos que pide) para arrancar, o tocá «Arrancar igual»."; return pintar(true); } return arrancar(o, ""); }
    if (a === "arrancarIgual") return hojaMotivo("arrancarIgual", "¿Por qué arrancás igual?", "Le avisamos a la oficina");
    if (a === "herr") { if (!o) return; const n = b.dataset.n, tmp = S.salidaTmp[o.id] = S.salidaTmp[o.id] || {}; const cur = b.classList.contains("on"); tmp[n] = !cur; return pintar(true); }
    if (a === "salimos") { if (!o) return; if (b.classList.contains("cd-off")) { S.msg = "Falta material o herramientas: retiralo, o tocá «Salir igual»."; return pintar(true); } return salir(o, ""); }
    if (a === "salirIgual") return hojaMotivo("salirIgual", "¿Por qué salen igual?", "Queda anotado en la orden");
    if (a === "boton") {
      if (!o) return; const pa = pasoActual(o);
      if (pa.fase === "llegue") return llegue(o);
      if (pa.fase === "foto") return tomarFoto(o, pa);
      if (pa.fase === "termine") { if (!pa.it && pa.u.tipo === "unidad") { marcarTareaFin(o, pa.p, pa.u.items.some((x) => x.paso && x.paso.estado !== "no") ? "si" : "no"); return pintar(true); }   /* todas con su hora pero sin mandar (se cortó): se manda */ return hojaTermine(o, pa); }
      if (pa.fase === "fin") return ir("fin");
      return;
    }
    if (a === "falta") return o ? hojaFalta(o) : avisar("Hoy no tenés orden.");
    if (a === "ayuda") return hojaAyuda(o);
    if (a === "mandar") return mandarOficina();
    if (a === "ubicacion") return mandarUbicacion();
    if (a === "probar") { intentar(() => window.__fotosSinSenal.reintentar(true)); intentar(() => window.__campoCola.ya()); S.colaTs = 0; S.toast = "Probando…"; S.toastTs = Date.now(); return pintar(true); }
  }, true);
  document.addEventListener("input", (e) => { if (e.target && e.target.id === "cdFaltaTx" && HJ) { const ok = $("cdFaltaOk"); ok && ok.classList.toggle("cd-off", !Object.keys(HJ.sel || {}).length && !e.target.value.trim()); } });
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t) return;
    if (t.id === "cdFotoIn") return void fotoElegida(t);
    if (t.id === "cdSegIn") return void segFotoElegida(t);
  });

  // ------------------------------------------------------------------------------------------- la oficina lo ve (📸 Avance y cierre)
  window.__cdOficinaHtml = function (ot) {
    try {
      const c = campo(ot), sg = obj(c.seguridad), sl = obj(c.salida), lg = obj(c.llegada), fm = obj(c.faltaMaterial);
      const pers = Object.keys(sg).filter((k) => sg[k] && typeof sg[k] == "object" && (sg[k].ts || sg[k].items));
      const ps = Object.keys(sl).filter((k) => sl[k] && sl[k].ts), pl = Object.keys(lg).filter((k) => lg[k] && lg[k].ts), pf = Object.keys(fm).filter((k) => fm[k] && fm[k].ts);
      if (!pers.length && !ps.length && !pl.length && !pf.length) return "";
      const nom = (k, x) => esc(primero((x && x.por) || k));
      const fotos = obj(c.fotos);
      let h = '<div class="cd-of"><b class="cd-oft">👷 La cuadrilla en obra</b>';
      pers.forEach((k) => {
        const x = sg[k], its = obj(x.items), n = SEG.filter((s) => its[s[0]]).length, fs = obj(x.fotos), fl = Object.keys(fs).map((q) => fs[q]).filter((id) => fotos[Lk(id)] || fotos[id]);
        h += `<div class="cd-ofl ${x.ts ? (x.ok ? "ok" : "mal") : "av"}">🦺 <b>${nom(k, x)}</b>: ${x.ts ? (x.ok ? "seguridad completa" : "arrancó igual (" + n + " de " + SEG.length + ")" + (x.motivo ? " — «" + esc(x.motivo) + "»" : "")) : "seguridad a medias (" + n + " de " + SEG.length + ")"}${x.ts ? " · " + hhmm(x.ts) : ""}${fl.length ? ` · <span class="cd-offs">${fl.map((id) => { const f = fotos[Lk(id)] || fotos[id] || {}; return f.mini ? `<img src="${esc(f.mini)}" data-adj="${esc(id)}" alt="${esc(f.num || "foto")}" title="${esc(f.num || "")}">` : `📷`; }).join("")}</span>` : ""}</div>`;
      });
      ps.forEach((k) => { const x = sl[k]; h += `<div class="cd-ofl ${x.ok ? "ok" : "mal"}">🚚 <b>${nom(k, x)}</b>: ${x.ok ? "salió con todo" : "salió igual — «" + esc(x.motivo || "") + "»"} · ${hhmm(x.ts)}${arr(x.faltaMat).length ? " · faltaba: " + esc(x.faltaMat.join(", ")) : ""}${arr(x.faltaHerr).length && !x.ok ? " · sin: " + esc(x.faltaHerr.join(", ")) : ""}</div>`; });
      pl.forEach((k) => { const x = lg[k]; h += `<div class="cd-ofl ${x.enObra === false ? "av" : "ok"}">📍 <b>${nom(k, x)}</b> llegó ${hhmm(x.ts)}${x.dist != null ? " · a " + distTxt(x.dist) + " del pin" : " · sin GPS"}</div>`; });
      pf.forEach((k) => { const x = fm[k]; h += `<div class="cd-ofl mal">📦 <b>Falta material</b> (${nom(k, x)}, ${hhmm(x.ts)}${x.tarea ? " · " + esc(x.tarea) : ""}): ${esc(arr(x.items).map((i) => i.codigo + " " + i.desc + " × " + fmtN(i.cant)).concat(x.otra ? [x.otra] : []).join(" · "))}</div>`; });
      return h + "</div>";
    } catch (e) { return ""; }
  };

  // ------------------------------------------------------------------------------------------- la oficina configura (Producción › Personal)
  const puedeCfg = () => intentar(() => !!window.__fbUser && ["produccion", "parte"].some((h) => PERMISOS.permiso(h) === "editar"), false);
  let cfgMsg = "", cfgFirma = "";
  function tarjetaCfg() {
    const panel = $("prodPanelPersonal"); if (!panel || panel.style.display === "none" || !puedeCfg()) return;
    let c = $("cdCfgCard");
    const cf = cfg(), firma = JSON.stringify([cf.contactos, cf.seguridadCuadrilla, cf.herrPorTarea, cfgMsg]);
    if (c && firma === cfgFirma) return;
    if (c && c.contains(document.activeElement)) return;
    cfgFirma = firma;
    if (!c) { c = document.createElement("div"); c.className = "card"; c.id = "cdCfgCard"; c.style.marginTop = "16px"; panel.appendChild(c); }
    const cts = arr(cf.contactos).length ? arr(cf.contactos) : [{ nombre: "", rol: "oficina", tel: "" }];
    const ht = obj(cf.herrPorTarea), tareasCat = intentar(() => (typeof ACTIVIDADES_CATALOGO != "undefined" ? ACTIVIDADES_CATALOGO : []).filter((x) => x && x.id && x.label), []);
    const lineas = Object.keys(ht).map((k) => k + ": " + arr(ht[k]).join(", ")).join("\n");
    c.innerHTML = `<h2 style="margin:0;"><span class="dot"></span>👷 La cuadrilla en obra</h2><div class="hint" style="margin-top:3px;">Lo que ve la cuadrilla en su celu: a quién llamar, qué foto pide la seguridad y qué herramientas se sugieren por tarea.</div>
<h3 class="cd-cfgh">📞 Teléfonos para la cuadrilla</h3><div class="hint">Los que salen en «Llamar a la oficina». El que sigue la orden sale primero (se reconoce por el nombre o el correo). Sin teléfono, la cuadrilla ve «Pedile a la oficina que cargue su teléfono».</div>
<div id="cdCfgCts">${cts.map((x, i) => `<div class="cd-cfgr" data-i="${i}"><input type="text" class="cd-cn" placeholder="Nombre" value="${esc(x.nombre || "")}"><select class="cd-cr">${[["admin", "Administración"], ["oficina", "Oficina"], ["panol", "Pañol"]].map(([k, t]) => `<option value="${k}" ${x.rol === k ? "selected" : ""}>${t}</option>`).join("")}</select><input type="tel" class="cd-ct" placeholder="Teléfono (ej. 351 555 1234)" value="${esc(x.tel || "")}"><input type="email" class="cd-ce" placeholder="Correo (opcional)" value="${esc(x.email || "")}"><button type="button" class="btn-ghost cd-cx" data-cdc="sacar" data-i="${i}" aria-label="Sacar">✕</button></div>`).join("")}</div>
<button type="button" class="btn-ghost" data-cdc="mas">＋ Agregar teléfono</button>
<h3 class="cd-cfgh">🦺 Foto de la seguridad, por ítem</h3><div class="cd-cfgseg">${SEG.map(([id, t]) => `<label>${esc(t)}<select data-cdseg="${id}">${[["no", "Sin foto"], ["opc", "Foto opcional"], ["oblig", "Foto obligatoria"]].map(([k, tt]) => `<option value="${k}" ${fotoSeg(id) === k ? "selected" : ""}>${tt}</option>`).join("")}</select></label>`).join("")}</div>
<h3 class="cd-cfgh">🧰 Herramientas por tarea <small>(a confirmar)</small></h3><div class="hint">Una línea por tarea: <code>código de la tarea: herramienta, herramienta</code>. Lo que no está acá sale de la lista que trae la app. Códigos: ${esc(tareasCat.slice(0, 60).map((x) => x.id).join(", "))}.</div>
<textarea id="cdCfgHerr" rows="4" placeholder="montaje_prfv: Hidroelevador, Eslingas, Nivel">${esc(lineas)}</textarea>
<div style="margin-top:10px;"><button type="button" class="btn-primary" data-cdc="guardar" style="width:auto;">Guardar</button></div><div class="hint" id="cdCfgMsg" role="status">${esc(cfgMsg)}</div>`;
  }
  function leerCfgForm() {
    const cts = [...document.querySelectorAll("#cdCfgCts .cd-cfgr")].map((r) => ({ nombre: r.querySelector(".cd-cn").value.trim(), rol: r.querySelector(".cd-cr").value, tel: r.querySelector(".cd-ct").value.trim(), email: r.querySelector(".cd-ce").value.trim().toLowerCase() }));
    const seg = {}; document.querySelectorAll("#cdCfgCard [data-cdseg]").forEach((s) => (seg[s.dataset.cdseg] = s.value));
    const ht = {}; String(($("cdCfgHerr") || {}).value || "").split(/\n/).forEach((l) => { const m = l.match(/^\s*([a-z0-9_:\-]+)\s*:\s*(.+)$/i); if (m) ht[m[1].trim()] = m[2].split(",").map((x) => x.trim()).filter(Boolean).slice(0, 20); });
    return { cts, seg, ht };
  }
  document.addEventListener("click", async (e) => {
    const b = e.target && e.target.closest && e.target.closest("#cdCfgCard [data-cdc]"); if (!b) return;
    const f = leerCfgForm(), a = b.dataset.cdc;
    if (a === "mas" || a === "sacar") {
      if (a === "mas") f.cts.push({ nombre: "", rol: "oficina", tel: "", email: "" }); else f.cts.splice(+b.dataset.i, 1);
      window.__personalNube = Object.assign({}, cfg(), { contactos: f.cts }); cfgFirma = ""; const c = $("cdCfgCard"); c && c.blur && c.blur(); document.activeElement && document.activeElement.blur && document.activeElement.blur(); tarjetaCfg(); return;
    }
    if (a === "guardar") {
      const cts = f.cts.filter((x) => x.nombre).slice(0, 30);
      const mal = cts.find((x) => x.tel && x.tel.replace(/\D/g, "").length < 7);
      if (mal) { cfgMsg = "⚠ El teléfono de " + mal.nombre + " parece incompleto."; cfgFirma = ""; tarjetaCfg(); return; }
      b.disabled = true;
      try {
        await firebase.firestore().collection("configEquipo").doc("personal").set({ contactos: cts, seguridadCuadrilla: f.seg, herrPorTarea: f.ht, cuadrillaDiaTs: Date.now(), cuadrillaDiaPor: miEmail() }, { merge: true });
        window.__personalNube = Object.assign({}, cfg(), { contactos: cts, seguridadCuadrilla: f.seg, herrPorTarea: f.ht });
        cfgMsg = "✓ Guardado. La cuadrilla lo ve en su celu.";
      } catch (er) { cfgMsg = er && er.code === "permission-denied" ? "🔒 Tu usuario no puede cambiar el personal del equipo." : "⚠ No se pudo guardar (revisá la conexión)."; }
      b.disabled = false; cfgFirma = ""; tarjetaCfg();
    }
  });

  // ------------------------------------------------------------------------------------------- enganches
  const mv = window.mostrarVista;
  if (typeof mv == "function") {
    const n = function (v) {
      const r = mv.apply(this, arguments);
      try {
        if (v === "inicio") pintar(true);
        else { document.body.classList.remove("cd-portada"); }
        if (v === "produccion") setTimeout(tarjetaCfg, 300);
      } catch (e) { console.error(e); }
      return r;
    };
    window.__heredar && window.__heredar(n, mv); n.__cd = 1; window.mostrarVista = n;
  }
  setInterval(() => {
    try {
      const v = $("viewInicio");
      if (v && v.style.display !== "none") pintar(false); else { document.body.classList.remove("cd-portada"); if (!on() && $("cdApp")) pintar(false); }
      tarjetaCfg();
    } catch (e) { }
  }, 2500);
  document.addEventListener("permisos-listos", () => setTimeout(() => pintar(false), 60));
  window.addEventListener("online", () => pintar(false)); window.addEventListener("offline", () => pintar(false));
  window.__cdOn = on;
  window.__cuadrillaDia = { on, pintar: () => pintar(true), ir, estado: () => ({ pant: S.pant, otId: S.otId, pila: S.pila.slice(), pos: S.pos }), pasoActual: (id) => pasoActual(id ? otDe(id) : otActual()), unidades: (id, k) => { const o = otDe(id); const p = o && tareas(o).find((x) => x.k === k); return p ? unidades(o, p) : null; }, materialDe: (id) => materialDe(otDe(id) || otActual()), herrSugeridas: (id) => herrSugeridas(otDe(id) || otActual()), contactos: (id) => contactos(otDe(id) || otActual()), misPuntos, waNum, cerrarHoja, HERR_DEF, SEG, avisarFalta, _gps: (p) => { S.pos = p; S.posTs = Date.now(); } };
})();
