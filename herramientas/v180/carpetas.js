/* v180 · 🗂 Carpetas de obra: unir duplicadas, mover cosas sueltas a otra obra y eliminar las vacías (Ángel 19/11: «en carpetas
   a veces se crean por error o son duplicados; hay que poner la posibilidad de mover o eliminar carpeta, mover órdenes, fotos, todo»).
   · Unir: todo lo que apunta a la obra de origen (órdenes, fotos, videos/PDF, vales, reservas, cálculos, gastos, etapas, planos,
     puntos del mapa, relevamientos, tareas de la semana) pasa a la de destino; el avance a mano (itemizado, avance nuevo, historial,
     notas, documentos, certificados, carpeta…) se junta sin perder nada (los choques se listan; gana el destino salvo que se elija);
     la de origen queda ARCHIVADA (oculta) con unidaEn, nunca se borra. El plan completo (cada documento con su valor de antes) se
     guarda primero en la obra de origen (`union`), se escribe por tandas de ≤ 400 y el avance queda anotado (`union.hechos`): si se
     corta, se sigue o se deshace desde donde quedó. «↶ Deshacer unión» vuelve todo atrás (lo que se cambió después, no).
   · Mover cosas sueltas: órdenes (con sus fotos, videos y reservas, y el avance que dieron), vales, reservas, cálculos, gastos,
     planos, etapas, puntos del mapa; fotos sueltas con el motor de «↔ Mover» (v152). Se deshace lo último (`mover180`).
   · Eliminar: solo si está vacía (nada en ninguna colección, sin avance cargado ni documentos); doble confirmación; antes queda la
     copia entera en auditoría (`obra_eliminar`) para volver a crearla. Si las reglas no dejan borrar, se archiva y se dice.
   · Posibles duplicadas: mismo ID, nombre igual o casi igual, pines a menos de 50 m → tarjeta en Obras, línea en el Supervisor.
   Solo Administración y Oficina con «editar» en Registrar obra o Avance (Dirección, cuadrilla, pañol y mirar, nada).
   Sin reglas nuevas: los avisos de la cuadrilla («📨 Para resolver») no se pueden cambiar de obra (las reglas solo dejan marcar
   visto/resuelto): quedan con la obra de origen y se dice. Pruebas viejas: window.__v180No. */
(function carpetasObra() {
  "use strict";
  const off = () => !!window.__v180No;
  const $ = (id) => document.getElementById(id);
  const arr = (x) => (Array.isArray(x) ? x : []);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const nNom = (s) => nk(s).replace(/^(plaza|plazoleta|barrio|b|bo|parque|espacio verde|obra)\s+/, "").trim();
  const nId = (s) => { const d = String(s || "").trim().toUpperCase(); return d.replace(/^([A-Z]*)0+(?=\d)/, "$1") || d; };
  const intentar = (f, d) => { try { const r = f(); return r === undefined ? d : r; } catch (e) { return d; } };
  const clon = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
  const db = () => firebase.firestore();
  const DEL = "__del__";
  const yoEmail = () => String((window.__fbUser || {}).email || "");
  const yoU = () => intentar(() => window.PERMISOS && window.PERMISOS.yo(), null) || null;
  const rol = () => String((yoU() || {}).rol || (intentar(() => window.PERMISOS.esAdmin(), false) ? "admin" : ""));
  const yoNombre = () => { const u = yoU(); return String((u && (u.nombre || u.usuario)) || yoEmail()); };
  const permiso = (h) => intentar(() => (window.PERMISOS ? window.PERMISOS.permiso(h) : "editar"), "ver");
  const fN = (n) => intentar(() => fmt(n, Number.isInteger(n) ? 0 : 2), String(n));
  const fCorta = (ts) => { const d = new Date(Number(ts) || 0); return isFinite(d) && +d ? String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") : ""; };
  function puede() {
    if (off() || !window.__fbUser || window.__modoEmergencia) return false;
    if (intentar(() => window.__esDireccion && window.__esDireccion(), false)) return false;
    const r = rol(); if (r !== "admin" && r !== "oficina") return false;
    return permiso("registro") === "editar" || permiso("avance") === "editar";
  }
  // ---------------------------------------------------------------- obras
  const obras = () => { const t = window.avanceObrasTodas; if (Array.isArray(t) && t.length) return t; return arr(intentar(() => avanceObras, [])).concat(arr(window.avanceObrasOcultas)); };
  const visibles = () => obras().filter((o) => o && o.id && o.oculta !== true && !o.unidaEn);
  const obraDe = (id) => obras().find((o) => o && String(o.id) === String(id)) || null;
  const nombre = (o) => String((o && (o.nombre || o.plazaNombre)) || "(sin nombre)");
  const nomCorto = (o) => { const n = nombre(o); return intentar(() => window.__fmtNombre.obra(n), n) || n; };
  function lev(a, b) { if (a === b) return 0; const m = a.length, n = b.length; if (Math.abs(m - n) > 3) return 9; let d = []; for (let j = 0; j <= n; j++) d[j] = j; for (let i = 1; i <= m; i++) { let p = d[0]; d[0] = i; for (let j = 1; j <= n; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1)); p = t; } } return d[n]; }
  function distM(a, b) {
    const la1 = +a.lat, lo1 = +a.lng, la2 = +b.lat, lo2 = +b.lng; if (![la1, lo1, la2, lo2].every(isFinite) || a.lat == null || b.lat == null) return null;
    const R = 6371000, r = Math.PI / 180, x = Math.sin((la2 - la1) * r / 2), y = Math.sin((lo2 - lo1) * r / 2);
    return 2 * R * Math.asin(Math.sqrt(x * x + Math.cos(la1 * r) * Math.cos(la2 * r) * y * y));
  }
  function buscar(q) {
    const s = String(q == null ? "" : q).trim(); if (!s) return [];
    const ex = obraDe(s); if (ex) return [ex];
    const z = nNom(s), idq = nId(s.replace(/^\s*id\s*/i, ""));
    const l = obras().map((o) => {
      const n = nNom(nombre(o)); let p = 0;
      if (o.obraId && nId(o.obraId) === idq) p = 95; else if (n === z) p = 90; else if (n.indexOf(z) >= 0 && z.length >= 3) p = 75; else if (z.length >= 5 && lev(n, z) <= 2) p = 70;
      else { const ws = z.split(" ").filter((w) => w.length > 2); if (ws.length && ws.every((w) => n.indexOf(w) >= 0)) p = 60; }
      return { o, p };
    }).filter((x) => x.p).sort((a, b) => b.p - a.p || (a.o.oculta ? 1 : 0) - (b.o.oculta ? 1 : 0));
    if (!l.length) return [];
    return l.filter((x) => l[0].p - x.p < 10).map((x) => x.o);
  }
  function resolver(q) {
    const l = buscar(q);
    if (!l.length) return { err: "No encontré ninguna obra que se parezca a «" + q + "»." };
    if (l.length > 1) { const v = l.filter((o) => !o.oculta && !o.unidaEn); if (v.length === 1) return { obra: v[0] }; return { err: "Hay varias obras que se parecen a «" + q + "»: " + l.slice(0, 6).map((o) => nombre(o) + (o.obraId ? " (ID " + o.obraId + ")" : "") + (o.oculta ? " — archivada" : "")).join(", ") + ". ¿Cuál?" }; }
    return { obra: l[0] };
  }
  // ---------------------------------------------------------------- en memoria (lo que ya bajó la app)
  const mem = {
    ordenesTrabajo: () => intentar(() => ordenesTrabajo, []),
    movimientos: () => arr(window.stockMovimientos),
    reservas: () => arr(window.reservasMaterial),
    gastosObra: () => arr(window.gastosObraLista || window.gastosObra),
    historialEtapas: () => intentar(() => historialEtapas, []),
    planosObra: () => arr(window.__planosObra),
    mapaPuntos: () => arr(window.__mapaPuntos)
  };
  const histCalc = () => arr(intentar(() => window.historialCompartido || historial, []));
  const planSem = () => arr(intentar(() => planEntries, []));
  function memDoc(c, id) { const f = mem[c]; if (!f) return null; return arr(f()).find((x) => x && String(x.id) === String(id)) || null; }
  // ---------------------------------------------------------------- posibles duplicadas
  function peso(o) {
    let p = mem.ordenesTrabajo().filter((t) => t && String(t.plazaId || "") === String(o.id)).length * 3;
    arr(o.valorItems).concat(arr(o.valorItemsEpec)).forEach((r) => { if (r && Number(r.cantidadAvanzada) > 0) p += 2; });
    p += Object.keys((o.av2 && o.av2.m) || {}).length; if (o.lat != null) p += 1; if (arr(o.puntos).length) p += 1;
    return p;
  }
  function motivosDup(a, b) {
    const m = []; let pts = 0;
    if (a.obraId && b.obraId && nId(a.obraId) === nId(b.obraId)) { m.push("mismo ID " + a.obraId); pts += 3; }
    const x = nNom(nombre(a)), y = nNom(nombre(b));
    if (x && y) {
      if (x === y) { m.push("mismo nombre"); pts += 3; }
      else if (Math.min(x.length, y.length) >= 5 && lev(x, y) <= 2) { m.push("nombre casi igual"); pts += 2; }
      else if (Math.min(x.length, y.length) >= 6 && (x.indexOf(y) >= 0 || y.indexOf(x) >= 0)) { m.push("un nombre contiene al otro"); pts += 1; }
    }
    const d = distM(a, b); if (d != null && d < 50) { m.push("pines a " + Math.round(d) + " m"); pts += 2; }
    return { m, pts };
  }
  let cacheDup = null;
  function duplicadas() {
    if (off()) return [];
    const l = visibles(), firma = l.map((o) => o.id + ":" + nombre(o) + ":" + (o.obraId || "") + ":" + o.lat + ":" + arr(o.noDuplicadaDe).join(",")).join("|");
    if (cacheDup && cacheDup.f === firma && Date.now() - cacheDup.t < 20000) return cacheDup.r;
    const r = [];
    for (let i = 0; i < l.length; i++) for (let j = i + 1; j < l.length; j++) {
      const a = l[i], b = l[j];
      if (arr(a.noDuplicadaDe).map(String).indexOf(String(b.id)) >= 0 || arr(b.noDuplicadaDe).map(String).indexOf(String(a.id)) >= 0) continue;
      const k = motivosDup(a, b); if (k.pts < 2) continue;
      const pa = peso(a), pb = peso(b), dst = pa > pb || (pa === pb && (Number(a.creado) || String(a.creado || "")) <= (Number(b.creado) || String(b.creado || ""))) ? a : b;
      r.push({ a, b, motivos: k.m, pts: k.pts, destino: dst, origen: dst === a ? b : a, clave: [a.id, b.id].sort().join("|") });
    }
    r.sort((x, y) => y.pts - x.pts);
    cacheDup = { f: firma, t: Date.now(), r };
    return r;
  }
  const dupDe = (id) => duplicadas().filter((d) => String(d.a.id) === String(id) || String(d.b.id) === String(id));
  async function noSonLaMisma(aId, bId) {
    if (!puede()) return { err: "Tu usuario no puede cambiar obras." };
    const FV = firebase.firestore.FieldValue, b = db().batch();
    b.update(db().collection("avanceObras").doc(String(aId)), { noDuplicadaDe: FV.arrayUnion(String(bId)) });
    b.update(db().collection("avanceObras").doc(String(bId)), { noDuplicadaDe: FV.arrayUnion(String(aId)) });
    await b.commit();
    [aId, bId].forEach((x, i) => { const o = obraDe(x); if (o) o.noDuplicadaDe = arr(o.noDuplicadaDe).concat([String(i ? aId : bId)]); });
    cacheDup = null;
    try { window.fbAuditar && window.fbAuditar("obra_no_duplicada", "«" + nombre(obraDe(aId)) + "» y «" + nombre(obraDe(bId)) + "» no son la misma obra", { ref: String(aId), otra: String(bId) }); } catch (e) { }
    return { ok: true };
  }
  // ---------------------------------------------------------------- inventario de una carpeta
  const COLS = [
    { k: "ordenes", c: "ordenesTrabajo", t: "órdenes de trabajo", ico: "📋" },
    { k: "fotos", c: "fotosObra", t: "fotos", ico: "📷" },
    { k: "videos", c: "fotosObra", t: "videos", ico: "🎥", sub: true },
    { k: "pdf", c: "fotosObra", t: "PDF", ico: "📄", sub: true },
    { k: "adjuntos", c: "adjuntos", t: "archivos guardados (fichas de fotos, remitos, documentos)", ico: "📎" },
    { k: "movs", c: "movimientos", t: "vales, entradas y devoluciones del pañol", ico: "📦" },
    { k: "reservas", c: "reservas", t: "reservas de material", ico: "🧾" },
    { k: "calculos", c: "historialCalculos", t: "cálculos de materiales", ico: "🧮" },
    { k: "gastos", c: "gastosObra", t: "gastos", ico: "💰" },
    { k: "etapas", c: "historialEtapas", t: "avances de etapa", ico: "📈" },
    { k: "planos", c: "planosObra", t: "planos", ico: "📐" },
    { k: "puntos", c: "mapaPuntos", t: "puntos del mapa", ico: "📍" },
    { k: "proyectos", c: "proyectos", t: "relevamientos del Proyectista", ico: "🧭", campo: "obraId" },
    { k: "plan", c: "planSemanal", t: "tareas de la planificación", ico: "🗓" },
    { k: "avisos", c: "avisosCuadrilla", t: "avisos de la cuadrilla («Para resolver»)", ico: "📨", campo: "obraId", fijo: true }
  ];
  const COL = {}; COLS.forEach((x) => { COL[x.k] = x; });
  function calcEsDe(h, o) {
    if (!h) return false;
    if (h.plazaId) return String(h.plazaId) === String(o.id);
    return !!((o.obraId && h.id && nId(h.id) === nId(o.obraId)) || (nNom(h.nombre) && nNom(h.nombre) === nNom(nombre(o))));
  }
  async function consulta(c, campo, id) {
    const s = await db().collection(c).where(campo, "==", String(id)).get();
    const l = []; s.forEach((d) => l.push(Object.assign({ id: d.id }, d.data() || {}))); return l;
  }
  async function inventario(id) {
    const o = obraDe(id); if (!o) return { err: "Esa obra ya no está." };
    const g = {}, noPude = []; COLS.forEach((x) => { g[x.k] = []; });
    const leer = async (k, c, campo) => {
      try { return await consulta(c, campo || "plazaId", o.id); }
      catch (e) { noPude.push(COL[k] ? COL[k].t : c); const f = mem[c]; return f ? arr(f()).filter((x) => x && String(x[campo || "plazaId"] || "") === String(o.id)).map((x) => clon(x)) : []; }
    };
    const [ots, fo, adj, mv, rs, ga, et, pl, pu, py, av] = await Promise.all([
      leer("ordenes", "ordenesTrabajo"), leer("fotos", "fotosObra"), leer("adjuntos", "adjuntos"), leer("movs", "movimientos"), leer("reservas", "reservas"),
      leer("gastos", "gastosObra"), leer("etapas", "historialEtapas"), leer("planos", "planosObra"), leer("puntos", "mapaPuntos"), leer("proyectos", "proyectos", "obraId"),
      (rol() === "admin" || rol() === "oficina") ? leer("avisos", "avisosCuadrilla", "obraId") : Promise.resolve([])
    ]);
    g.ordenes = ots; g.adjuntos = adj; g.movs = mv; g.reservas = rs; g.gastos = ga; g.etapas = et; g.planos = pl; g.puntos = pu; g.proyectos = py; g.avisos = av;
    fo.forEach((f) => { (f.tipo === "video" ? g.videos : f.tipo === "pdf" ? g.pdf : g.fotos).push(f); });
    const otras = visibles().filter((x) => String(x.id) !== String(o.id));
    histCalc().forEach((h) => { if (calcEsDe(h, o)) { const c = clon(h); c.__docId = h.docId || ""; c.__compartido = !h.plazaId && otras.some((x) => calcEsDe(h, x)); g.calculos.push(c); } });
    if (nNom(nombre(o))) planSem().forEach((p) => { if (p && p.obra && nNom(p.obra) === nNom(nombre(o))) { const c = clon(p); c.__docId = p.docId || ""; c.__compartido = otras.some((x) => nNom(nombre(x)) === nNom(p.obra)); g.plan.push(c); } });
    const prop = propio(o);
    const total = COLS.reduce((s, x) => s + g[x.k].filter((d) => !d.__compartido).length, 0);
    return { obra: o, g, prop, total, noPude, vacia: !total && !prop.n };
  }
  function propio(o) {
    const it = arr(o.valorItems).concat(arr(o.valorItemsEpec)).filter((r) => r && Number(r.cantidadAvanzada) > 0);
    const av2 = Object.keys((o.av2 && o.av2.m) || {}).length + arr(o.av2 && o.av2.extra).length;
    const docs = Object.keys(o.documentos || {}).filter((k) => o.documentos[k] && (o.documentos[k].ok || o.documentos[k].adjId || o.documentos[k].papel));
    const cert = Object.keys(o.certificados || {});
    const l = [];
    if (it.length) l.push(it.length + " ítem" + (it.length === 1 ? "" : "s") + " del itemizado con avance cargado");
    if (av2) l.push(av2 + " marca" + (av2 === 1 ? "" : "s") + " del avance de obra a mano");
    if (docs.length) l.push("documentación: " + docs.join(", "));
    if (cert.length) l.push(cert.length + " mes" + (cert.length === 1 ? "" : "es") + " certificado" + (cert.length === 1 ? "" : "s"));
    if (o.coCierre && o.coCierre.cerrado) l.push("conforme a obra cerrado");
    return { n: l.length, l, items: it.length, av2, docs, cert };
  }
  function contar(inv) { const r = {}; COLS.forEach((x) => { r[x.k] = inv.g[x.k].filter((d) => !d.__compartido).length; }); return r; }
  // ---------------------------------------------------------------- qué cambia en cada documento
  const E = (a, b) => nk(a) === nk(b);
  function patchRef(k, doc, src, dst, extra) {
    const p = {};
    if (k === "proyectos") { if (String(doc.obraId || "") === String(src.id)) p.obraId = String(dst.id); if ("obraNombre" in doc) p.obraNombre = nombre(dst); return p; }
    if (k === "plan") { if (String(doc.obra || "").trim() !== nombre(dst)) p.obra = nombre(dst); return p; }
    if (k === "calculos") {
      p.plazaId = String(dst.id);
      if (doc.nombre != null && String(doc.nombre).trim() !== nombre(dst)) p.nombre = nombre(dst);
      if (doc.id != null && dst.obraId && nId(doc.id) !== nId(dst.obraId) && (!src.obraId || nId(doc.id) === nId(src.obraId) || !doc.id)) p.id = String(dst.obraId);
      const cm = doc.form && doc.form.campos;
      if (cm && (p.nombre || p.id)) { const f = clon(doc.form); if ("obraNombre" in f.campos && p.nombre) f.campos.obraNombre = nombre(dst); if ("obraId" in f.campos && p.id) f.campos.obraId = String(dst.obraId); p.form = f; }
      return p;
    }
    if (String(doc.plazaId || "") === String(src.id)) p.plazaId = String(dst.id);
    if ("plazaNombre" in doc && String(doc.plazaNombre || "").trim() !== nombre(dst)) p.plazaNombre = nombre(dst);
    if ("obraId" in doc && src.obraId !== dst.obraId && String(doc.obraId || "").trim() === String(src.obraId || "").trim()) p.obraId = String(dst.obraId || "");
    if (k === "movs" && doc.destino != null && E(doc.destino, nombre(src)) && String(doc.destino).trim() !== nombre(dst)) p.destino = nombre(dst);
    if (k === "ordenes" && doc.barrio != null && src.barrio && dst.barrio && E(doc.barrio, src.barrio) && !E(doc.barrio, dst.barrio)) p.barrio = dst.barrio;
    if ((k === "fotos" || k === "videos" || k === "pdf" || k === "adjuntos") && p.plazaId) p.movidaDe = { plazaId: String(src.id), plazaNombre: nombre(src), ts: Date.now(), por: yoNombre(), motivo: (extra && extra.motivo) || "Unión de obras" };
    if (k === "ordenes" && extra && extra.itemMap && doc.cierre && arr(doc.cierre.avanceItems).length) {
      const ai = doc.cierre.avanceItems.map((x) => { const y = Object.assign({}, x); const m = extra.itemMap[String(x.id)]; if (m != null && String(m) !== String(x.id)) y.id = m; return y; });
      if (JSON.stringify(ai) !== JSON.stringify(doc.cierre.avanceItems)) p["cierre.avanceItems"] = ai;
    }
    return p;
  }
  function antesDe(doc, p) { const a = {}; Object.keys(p).forEach((k) => { let v; if (k.indexOf(".") > 0) { const [x, y] = k.split("."); v = doc[x] && typeof doc[x] == "object" ? doc[x][y] : undefined; } else v = doc[k]; a[k] = v === undefined ? DEL : clon(v); }); return a; }
  function conv(p) { const FV = firebase.firestore.FieldValue, o = {}; Object.keys(p || {}).forEach((k) => { o[k] = p[k] === DEL ? FV.delete() : p[k]; }); return o; }
  function huella(v) { const s = JSON.stringify(v === undefined || v === DEL ? null : v); let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return s.length + ":" + h; }
  // ---------------------------------------------------------------- juntar el avance (sin perder marcas)
  const LISTAS = [["valorItems", "itemPliego", "ítem"], ["valorItemsEpec", "itemEpec", "ítem EPEC"]];
  function juntarAvance(src, dst, elegir) {
    elegir = elegir || {};
    const patch = {}, conflictos = [], filas = [], itemMap = {};
    // itemizado
    LISTAS.forEach(([L, cod, txt]) => {
      const s = arr(src[L]), d0 = arr(dst[L]); if (!s.length) return;
      const d = clon(d0) || [], ids = new Set(d.map((r) => String(r.id))); let cambio = false;
      s.forEach((r) => {
        if (!r) return; const c = String(r[cod] || ""); const x = c ? d.find((y) => String(y[cod] || "") === c) : null, va = Number(r.cantidadAvanzada) || 0;
        if (x) {
          itemMap[String(r.id)] = x.id;
          const vd = Number(x.cantidadAvanzada) || 0; if (!(va > 0)) return;
          if (!(vd > 0)) { x.cantidadAvanzada = va; cambio = true; filas.push({ c: txt + " " + c + " · hecho", a: "0", d: fN(va) + " (de la que se une)" }); return; }
          if (va === vd) return;
          const key = "vi:" + L + ":" + c, q = elegir[key] || "destino";
          conflictos.push({ key, txt: txt + " " + c + ": esta tiene " + fN(vd) + " hecho, la que se une " + fN(va), op: [["destino", "Queda " + fN(vd)], ["origen", "Pasa a " + fN(va)], ["sumar", "Sumar: " + fN(vd + va)]], q });
          if (q === "origen") { x.cantidadAvanzada = va; cambio = true; filas.push({ c: txt + " " + c + " · hecho", a: fN(vd), d: fN(va) }); }
          else if (q === "sumar") { x.cantidadAvanzada = Math.round((vd + va) * 1e4) / 1e4; cambio = true; filas.push({ c: txt + " " + c + " · hecho", a: fN(vd), d: fN(x.cantidadAvanzada) }); }
        } else {
          const n = clon(r); if (ids.has(String(n.id))) { let k = Date.now() + Math.floor(Math.random() * 1e3); while (ids.has(String(k))) k++; n.id = k; }
          ids.add(String(n.id)); itemMap[String(r.id)] = n.id; d.push(n); cambio = true;
          filas.push({ c: "＋ " + txt + " " + (c || "(sin número)"), a: "—", d: fN(Number(n.cantidad) || 0) + (va > 0 ? " · hecho " + fN(va) : "") });
        }
      });
      if (cambio) patch[L] = d;
    });
    // avance de obra nuevo (av2): marcas a mano, cosas agregadas e historial
    const sa = src.av2 || null;
    if (sa && (Object.keys(sa.m || {}).length || arr(sa.extra).length || arr(sa.hist).length)) {
      const da = clon(dst.av2 || {}) || {}; da.v = da.v || sa.v || 1; da.m = da.m || {}; let n = 0, ch = false;
      Object.keys(sa.m || {}).forEach((k) => {
        const vs = sa.m[k], vd = da.m[k];
        if (vd === undefined) { da.m[k] = clon(vs); n++; ch = true; return; }
        if (JSON.stringify(vd) === JSON.stringify(vs) || (vd && vs && vd.e === vs.e)) return;
        const key = "av2:" + k, q = elegir[key] || "destino";
        conflictos.push({ key, txt: "Avance de obra «" + k.replace(/^c_/, "").replace(/_/g, " ") + "»: acá «" + (vd && vd.e) + "», en la que se une «" + (vs && vs.e) + "»", op: [["destino", "Queda «" + (vd && vd.e) + "»"], ["origen", "Pasa a «" + (vs && vs.e) + "»"]], q });
        if (q === "origen") { da.m[k] = clon(vs); n++; ch = true; }
      });
      const ex = arr(da.extra), idsx = new Set(ex.map((x) => String(x && x.id)));
      arr(sa.extra).forEach((x) => { if (x && !idsx.has(String(x.id))) { ex.push(clon(x)); ch = true; n++; } }); if (ex.length) da.extra = ex;
      if (arr(sa.hist).length) { da.hist = arr(da.hist).concat(arr(sa.hist).slice(-150).map((h) => Object.assign(clon(h), { deObra: nombre(src) }))); ch = true; }
      if (ch) { patch.av2 = da; if (n) filas.push({ c: "Avance de obra (marcas a mano)", a: Object.keys((dst.av2 && dst.av2.m) || {}).length + " marcas", d: Object.keys(da.m).length + " marcas (+" + n + ")" }); }
    }
    // historial y notas del avance: se suman
    [["avanceHist", "historial del avance"], ["avanceNotas", "notas del avance"], ["coAjustes", "ajustes del conforme a obra"]].forEach(([k, t]) => {
      const s = arr(src[k]); if (!s.length) return;
      patch[k] = arr(dst[k]).concat(s.map((h) => Object.assign(clon(h), { deObra: nombre(src) })));
      filas.push({ c: t, a: arr(dst[k]).length + "", d: patch[k].length + " (+" + s.length + ")" });
    });
    // documentación
    const sd = src.documentos || {};
    if (Object.keys(sd).length) {
      const dd = clon(dst.documentos || {}) || {}; let ch = false;
      Object.keys(sd).forEach((k) => {
        if (!sd[k]) return; if (!dd[k] || !(dd[k].ok || dd[k].adjId || dd[k].papel)) { dd[k] = clon(sd[k]); ch = true; filas.push({ c: "Documentación «" + k + "»", a: "falta", d: "la de la que se une" }); return; }
        if (JSON.stringify(dd[k]) === JSON.stringify(sd[k])) return;
        const key = "doc:" + k, q = elegir[key] || "destino";
        conflictos.push({ key, txt: "Documentación «" + k + "»: las dos la tienen cargada", op: [["destino", "Queda la de acá"], ["origen", "La de la que se une (la de acá va al historial)"]], q });
        if (q === "origen") { const ant = dd[k]; dd[k] = clon(sd[k]); dd[k].hist = arr(dd[k].hist).concat([Object.assign({}, ant, { hist: undefined })].map(clon)); ch = true; }
      });
      if (ch) patch.documentos = dd;
    }
    // certificados por mes
    const sc = src.certificados || {};
    if (Object.keys(sc).length) {
      const dc = clon(dst.certificados || {}) || {}; let ch = false;
      Object.keys(sc).forEach((m) => {
        if (!dc[m]) { dc[m] = clon(sc[m]); ch = true; filas.push({ c: "Certificado " + m, a: "—", d: "el de la que se une" }); return; }
        if (JSON.stringify(dc[m]) === JSON.stringify(sc[m])) return;
        const key = "cert:" + m, q = elegir[key] || "destino";
        conflictos.push({ key, txt: "Certificado de " + m + ": las dos tienen uno", op: [["destino", "Queda el de acá"], ["origen", "El de la que se une"]], q });
        if (q === "origen") { dc[m] = clon(sc[m]); ch = true; }
      });
      if (ch) patch.certificados = dc;
    }
    // datos sueltos: se completa lo que falta; si las dos tienen y es distinto, choque
    [["carpetaEpec", "carpeta EPEC"], ["barrio", "barrio"], ["direccion", "dirección"], ["fechaEstimada", "fecha estimada"]].forEach(([k, t]) => {
      const vs = src[k], vd = dst[k]; if (vs == null || vs === "") return;
      if (vd == null || vd === "") { patch[k] = vs; filas.push({ c: t, a: "—", d: String(vs) }); return; }
      if (E(vs, vd)) return;
      const key = "dato:" + k, q = elegir[key] || "destino";
      conflictos.push({ key, txt: t + ": acá «" + vd + "», en la que se une «" + vs + "»", op: [["destino", "«" + vd + "»"], ["origen", "«" + vs + "»"]], q });
      if (q === "origen") { patch[k] = vs; filas.push({ c: t, a: String(vd), d: String(vs) }); }
    });
    if ((dst.lat == null || dst.lng == null) && src.lat != null && src.lng != null) { patch.lat = src.lat; patch.lng = src.lng; filas.push({ c: "ubicación en el mapa", a: "sin ubicación", d: "la de la que se une" }); }
    if (!arr(dst.puntos).length && arr(src.puntos).length) { patch.puntos = clon(src.puntos); filas.push({ c: "nombres de las columnas", a: "—", d: arr(src.puntos).length + " columnas" }); }
    if (src.planGantt && !dst.planGantt) patch.planGantt = clon(src.planGantt);
    if (arr(src.fotosBorradas).length) { const u = arr(dst.fotosBorradas).slice(); arr(src.fotosBorradas).forEach((x) => { if (u.indexOf(x) < 0) u.push(x); }); if (u.length !== arr(dst.fotosBorradas).length) patch.fotosBorradas = u; }
    if (src.etapas && typeof src.etapas == "object" && !Array.isArray(src.etapas)) { const e = Object.assign({}, dst.etapas || {}); let ch = false; Object.keys(src.etapas).forEach((k) => { if (src.etapas[k] && !e[k]) { e[k] = src.etapas[k]; ch = true; } }); if (ch) patch.etapas = e; }
    const avisos = [];
    if (src.coCierre && src.coCierre.cerrado && !(dst.coCierre && dst.coCierre.cerrado)) avisos.push("La que se une tenía el conforme a obra cerrado y esta no: el conforme no se pasa (cerralo acá si corresponde).");
    return { patch, conflictos, filas, itemMap, avisos };
  }
  // ---------------------------------------------------------------- planes
  const MAX_DOC = 850000;
  async function planUnir(srcId, dstId, op) {
    op = op || {};
    if (!puede()) return { err: "Unir obras lo hacen Administración y Oficina (con «editar» en Registrar obra o Avance)." };
    const src = obraDe(srcId), dst = obraDe(dstId);
    if (!src || !dst) return { err: "No encontré " + (!src ? "la obra que se une" : "la obra de destino") + "." };
    if (String(src.id) === String(dst.id)) return { err: "Es la misma obra." };
    if (src.unidaEn) return { err: "«" + nombre(src) + "» ya está unida en otra obra." };
    if (dst.unidaEn) return { err: "«" + nombre(dst) + "» está unida en otra obra: elegí esa." };
    if (src.union && src.union.estado === "en curso") return { err: "«" + nombre(src) + "» tiene una unión a mitad: seguila o deshacela primero." };
    const [inv, invD] = await Promise.all([inventario(src.id), inventario(dst.id)]);
    if (inv.err) return inv;
    const J = juntarAvance(src, dst, op.elegir), pasos = [], ids = {};
    COLS.forEach((x) => {
      if (x.fijo) return;
      inv.g[x.k].forEach((d) => {
        if (x.k === "calculos" && !d.__docId) return;
        if (x.k === "plan" && !d.__docId) return;
        const p = patchRef(x.k, d, src, dst, { itemMap: J.itemMap, motivo: op.motivo ? "Unión de obras: " + op.motivo : "" });
        if (!Object.keys(p).length) return;
        const docId = d.__docId || d.id;
        pasos.push({ c: x.c, i: String(docId), k: x.k, p, a: antesDe(d, p) });
        (ids[x.c] = ids[x.c] || []).push(String(docId));
      });
    });
    const avisos = J.avisos.slice();
    if (inv.g.avisos.length) avisos.push(inv.g.avisos.length + " aviso" + (inv.g.avisos.length === 1 ? "" : "s") + " de la cuadrilla («Para resolver») quedan con «" + nombre(src) + "»: las reglas de la base no dejan cambiarlos de obra (se siguen viendo en «Para resolver»).");
    const locales = inv.g.calculos.filter((d) => !d.__docId).length + inv.g.plan.filter((d) => !d.__docId).length;
    if (locales) avisos.push(locales + " cálculo(s) o tarea(s) de la planificación guardados solo en este aparato no se pasan.");
    if (inv.noPude.length) avisos.push("No pude leer de la base: " + inv.noPude.join(", ") + " (se usa lo que ya bajó la app).");
    const merge = Object.keys(J.patch).length ? { id: String(dst.id), patch: J.patch, antes: antesDe(dst, J.patch), huella: {} } : null;
    if (merge) Object.keys(J.patch).forEach((k) => { merge.huella[k] = huella(J.patch[k]); });
    const cS = contar(inv), cD = invD.err ? {} : contar(invD);
    const filas = COLS.filter((x) => cS[x.k]).map((x) => ({ k: x.k, ico: x.ico, c: x.t, n: cS[x.k], a: (cD[x.k] || 0), d: x.fijo ? (cD[x.k] || 0) : (cD[x.k] || 0) + cS[x.k], fijo: !!x.fijo }));
    const plan = { tipo: "unir", src: String(src.id), srcNombre: nombre(src), dst: String(dst.id), dstNombre: nombre(dst), pasos, ids, merge, conflictos: J.conflictos, filasAvance: J.filas, filas, avisos, elegir: op.elegir || {}, motivo: String(op.motivo || ""), prop: inv.prop, total: pasos.length, inv: cS };
    const tam = JSON.stringify({ pasos, merge }).length;
    if (tam > MAX_DOC) return { err: "Hay demasiado para hacerlo de una vez (" + Math.round(tam / 1024) + " KB de cambios). Pasá primero una parte con «↔ Mover cosas a otra obra» (por ejemplo las órdenes) y después uní.", plan };
    return { ok: true, plan };
  }
  // órdenes, vales, reservas, cálculos, gastos, planos, etapas, puntos del mapa (por id); las fotos sueltas van por «↔ Mover» (v152)
  async function planMover(srcId, dstId, sel, op) {
    op = op || {}; sel = sel || {};
    if (!puede()) return { err: "Mover cosas entre obras lo hacen Administración y Oficina." };
    const src = obraDe(srcId), dst = obraDe(dstId);
    if (!src || !dst) return { err: "No encontré " + (!src ? "la obra de origen" : "la obra de destino") + "." };
    if (String(src.id) === String(dst.id)) return { err: "Es la misma obra." };
    if (dst.unidaEn) return { err: "«" + nombre(dst) + "» está unida en otra obra: elegí esa." };
    const inv = op.inv || await inventario(src.id); if (inv.err) return inv;
    const pasos = [], ids = {}, filas = [], avisos = [], vistos = {};
    const poner = (k, d, extra) => {
      const x = COL[k], docId = String(d.__docId || d.id); if (vistos[x.c + "/" + docId]) return; vistos[x.c + "/" + docId] = 1;
      const p = patchRef(k, d, src, dst, Object.assign({ motivo: op.motivo ? "Movida a otra obra: " + op.motivo : "Movida a otra obra" }, extra || {}));
      if (!Object.keys(p).length) return; pasos.push({ c: x.c, i: docId, k, p, a: antesDe(d, p) }); (ids[x.c] = ids[x.c] || []).push(docId);
    };
    const quiere = (k) => arr(sel[k]).map(String);
    const obrasCambio = [];
    // órdenes con lo suyo
    const oSel = quiere("ordenes"), srcV = {}, dstV = {}, itemMapO = {};
    LISTAS.forEach(([L]) => { srcV[L] = clon(arr(src[L])); dstV[L] = clon(arr(dst[L])); });
    let avMov = 0;
    inv.g.ordenes.filter((d) => oSel.indexOf(String(d.id)) >= 0).forEach((ot) => {
      // el avance del itemizado que dio esa orden al cerrarse pasa con ella (si se pide)
      const ai = ot.cierre && arr(ot.cierre.avanceItems), ext = {};
      if (ai && ai.length && sel.conAvance !== false && !(ot.cierre && ot.cierre.avanceRevertido)) {
        ai.forEach((x) => {
          const delta = Number(x && x.delta) || 0; if (!delta) return;
          let hecho = false;
          LISTAS.forEach(([L, cod]) => {
            if (hecho) return; const r = srcV[L].find((y) => String(y.id) === String(x.id)); if (!r) return; hecho = true;
            const c = String(r[cod] || ""); let t = c ? dstV[L].find((y) => String(y[cod] || "") === c) : null;
            if (!t) { t = clon(r); t.cantidadAvanzada = 0; const usados = new Set(dstV[L].map((y) => String(y.id))); if (usados.has(String(t.id))) { let k = Date.now(); while (usados.has(String(k))) k++; t.id = k; } dstV[L].push(t); }
            r.cantidadAvanzada = Math.max(0, Math.round(((Number(r.cantidadAvanzada) || 0) - delta) * 1e4) / 1e4);
            t.cantidadAvanzada = Math.round(((Number(t.cantidadAvanzada) || 0) + delta) * 1e4) / 1e4;
            itemMapO[String(x.id)] = t.id; avMov++;
          });
        });
        ext.itemMap = itemMapO;
      }
      poner("ordenes", ot, ext);
      filas.push({ c: "📋 " + (ot.numero || ot.id) + (ot.fecha ? " · " + ot.fecha.split("-").reverse().slice(0, 2).join("/") : ""), a: nombre(src), d: nombre(dst) });
      ["fotos", "videos", "pdf", "adjuntos"].forEach((k) => inv.g[k].filter((f) => String(f.otId || "") === String(ot.id)).forEach((f) => poner(k, f)));
      inv.g.reservas.filter((r) => String(r.otId || "") === String(ot.id)).forEach((r) => poner("reservas", r));
    });
    if (avMov) {
      LISTAS.forEach(([L]) => {
        if (JSON.stringify(srcV[L]) !== JSON.stringify(arr(src[L]))) obrasCambio.push({ id: String(src.id), patch: { [L]: srcV[L] }, antes: antesDe(src, { [L]: 1 }), huella: { [L]: huella(srcV[L]) } });
        if (JSON.stringify(dstV[L]) !== JSON.stringify(arr(dst[L]))) obrasCambio.push({ id: String(dst.id), patch: { [L]: dstV[L] }, antes: antesDe(dst, { [L]: 1 }), huella: { [L]: huella(dstV[L]) } });
      });
      filas.push({ c: "Avance del itemizado de esas órdenes", a: "en «" + nombre(src) + "»", d: "pasa a «" + nombre(dst) + "» (" + avMov + " ítem" + (avMov === 1 ? "" : "s") + ")" });
    }
    const otros = { movs: "📦", reservas: "🧾", calculos: "🧮", gastos: "💰", planos: "📐", etapas: "📈", puntos: "📍", proyectos: "🧭" };
    Object.keys(otros).forEach((k) => {
      const q = quiere(k); if (!q.length) return;
      inv.g[k].filter((d) => q.indexOf(String(d.id)) >= 0 || (d.__docId && q.indexOf(String(d.__docId)) >= 0) || (d.numero && q.indexOf(String(d.numero)) >= 0)).forEach((d) => {
        if (k === "calculos" && !d.__docId) { avisos.push("Un cálculo guardado solo en este aparato no se puede pasar."); return; }
        poner(k, d); filas.push({ c: otros[k] + " " + (d.numero || d.nombre || d.desc || d.titulo || COL[k].t), a: nombre(src), d: nombre(dst) });
      });
    });
    const fotos = quiere("fotos");
    if (!pasos.length && !fotos.length) return { err: "No elegiste nada para mover." };
    const plan = { tipo: "mover", src: String(src.id), srcNombre: nombre(src), dst: String(dst.id), dstNombre: nombre(dst), pasos, ids, obrasCambio, filas, avisos, fotos, motivo: String(op.motivo || ""), total: pasos.length + fotos.length };
    if (JSON.stringify({ pasos, obrasCambio }).length > MAX_DOC) return { err: "Es demasiado para una sola vez: mové menos cosas por vez." };
    return { ok: true, plan };
  }
  // ---------------------------------------------------------------- correr un plan (por tandas, se puede seguir y deshacer)
  const TANDA = () => Math.max(1, Math.min(399, Number(window.__cpTanda) || 399));
  async function leerFuente(id) { const s = await db().collection("avanceObras").doc(String(id)).get(); if (!s.exists) throw Object.assign(new Error("La carpeta ya no está."), { code: "not-found" }); return Object.assign({ id: s.id }, s.data() || {}); }
  function aMemoria(x, patch) {
    const d = memDoc(x.c, x.i); if (!d) { if (x.c === "historialCalculos") { const h = histCalc().find((y) => String(y.docId || "") === String(x.i)); if (h) aplicarObj(h, patch); } return; }
    aplicarObj(d, patch);
  }
  function aplicarObj(d, patch) { Object.keys(patch).forEach((k) => { const v = patch[k]; if (k.indexOf(".") > 0) { const [a, b] = k.split("."); d[a] = d[a] || {}; if (v === DEL) delete d[a][b]; else d[a][b] = clon(v); } else if (v === DEL) delete d[k]; else d[k] = clon(v); }); }
  async function tanda(ops, extra) {
    const b = db().batch();
    ops.forEach((o) => b.update(db().collection(o.c).doc(o.i), conv(o.p)));
    extra.forEach((o) => b.update(db().collection(o.c).doc(o.i), o.p));
    try { await b.commit(); return []; }
    catch (e) {
      if (!e || e.code !== "not-found") throw e;
      const faltan = [];   // alguno se borró en el medio: de a uno, salteando lo que ya no está
      for (const o of ops) { try { await db().collection(o.c).doc(o.i).update(conv(o.p)); } catch (er) { if (er && er.code === "not-found") faltan.push(o.c + "/" + o.i); else throw er; } }
      for (const o of extra) await db().collection(o.c).doc(o.i).update(o.p);
      return faltan;
    }
  }
  // F = "union" o "mover180"; des = deshacer
  async function correr(srcId, F, op) {
    op = op || {}; const des = !!op.deshacer, prog = op.prog || (() => { });
    const fu = await leerFuente(srcId), u = fu[F];
    if (!u || !Array.isArray(u.pasos)) throw new Error("No hay nada " + (des ? "para deshacer." : "a mitad."));
    const total = u.pasos.length, faltan = [], salteados = [];
    let k = des ? (Number(u.deshechos) || 0) : (Number(u.hechos) || 0);
    const lim = des ? (u.hastaDes != null ? Number(u.hastaDes) : total) : total;
    let n = 0;
    while (k < lim) {
      const fin = Math.min(lim, k + TANDA()), ops = [];
      for (let i = k; i < fin; i++) {
        const x = u.pasos[i], p = des ? x.a : x.p;
        if (des) { const m = memDoc(x.c, x.i); if (m && x.p.plazaId && String(m.plazaId || "") !== String(x.p.plazaId)) { salteados.push(x.c + "/" + x.i); continue; } }
        if (Object.keys(p || {}).length) ops.push({ c: x.c, i: x.i, p });
      }
      const mk = {}; mk[F + (des ? ".deshechos" : ".hechos")] = fin;
      faltan.push.apply(faltan, await tanda(ops, [{ c: "avanceObras", i: String(srcId), p: mk }]));
      ops.forEach((o) => aMemoria(o, o.p));
      k = fin; n++; prog(k, lim, des);
      if (!des && window.__cpCortar && n >= Number(window.__cpCortar)) { window.__cpCortar = 0; throw Object.assign(new Error("Se cortó a mitad (prueba)."), { code: "cortado" }); }
    }
    // las obras (avance juntado / itemizado de las órdenes movidas)
    const oc = u.merge ? [u.merge] : arr(u.obrasCambio), conflictosDes = [];
    if (oc.length && (des ? u.obrasHecho && !u.obrasDeshecho : !u.obrasHecho)) {
      const b = db().batch();
      for (const m of oc) {
        if (!des) { b.update(db().collection("avanceObras").doc(m.id), conv(m.patch)); continue; }
        const d = String(m.id) === String(srcId) ? fu : await leerFuente(m.id), p = {};
        Object.keys(m.antes).forEach((key) => { if (huella(d[key]) === m.huella[key]) p[key] = m.antes[key]; else conflictosDes.push(key + " de «" + nombre(d) + "»"); });
        if (Object.keys(p).length) b.update(db().collection("avanceObras").doc(m.id), conv(p));
      }
      const mk = {}; mk[F + (des ? ".obrasDeshecho" : ".obrasHecho")] = true; b.update(db().collection("avanceObras").doc(String(srcId)), mk);
      await b.commit();
      oc.forEach((m) => { const o = obraDe(m.id); if (o && !des) aplicarObj(o, m.patch); });
    }
    return { faltan, salteados, conflictosDes, total, u, fu };
  }
  function refrescar(ids) {
    cacheDup = null;
    try { (ids || []).forEach((x) => window.__lgFotosOlvidar && window.__lgFotosOlvidar(x)); } catch (e) { }
    ["renderAvanceTablero", "poblarParteObraDatalist", "poblarOtPlazas", "poblarHistPlazas", "poblarStockFiltroPlazas", "renderMapaObras", "renderStockMovimientos", "renderHistorial", "renderPlanGrid"].forEach((r) => { try { typeof window[r] == "function" && window[r](); } catch (e) { } });
    try { document.dispatchEvent(new Event("fotos-movidas")); } catch (e) { }
  }
  const idsDe = (pasos) => { const r = {}; pasos.forEach((x) => { (r[x.c] = r[x.c] || []).push(x.i); }); return r; };
  async function unir(srcId, dstId, op) {
    op = op || {};
    const r = await planUnir(srcId, dstId, op); if (r.err) return r;
    const P = r.plan, src = obraDe(srcId), dst = obraDe(dstId), ts = Date.now();
    const u = { estado: "en curso", destino: P.dst, destinoNombre: P.dstNombre, ts, por: yoEmail(), porNombre: yoNombre(), motivo: P.motivo, pasos: P.pasos, hechos: 0, merge: P.merge, obrasHecho: false, elegir: P.elegir, fuenteAntes: { oculta: src.oculta === true }, porAsistente: !!op.porAsistente };
    await db().collection("avanceObras").doc(String(srcId)).update({ union: u });
    src.union = u;
    return seguirUnion(srcId, op, P);
  }
  async function seguirUnion(srcId, op, P) {
    op = op || {};
    const R = await correr(srcId, "union", op), u = R.u, ts = Date.now();
    const fin = { oculta: true, ocultaTs: ts, ocultaPor: yoEmail(), unidaEn: u.destino, unidaEnNombre: u.destinoNombre, unidaTs: ts, "union.estado": "hecha", "union.finTs": ts };
    if (R.faltan.length) fin["union.faltaban"] = R.faltan;
    await db().collection("avanceObras").doc(String(srcId)).update(fin);
    const o = obraDe(srcId); if (o) { Object.assign(o, { oculta: true, unidaEn: u.destino, unidaEnNombre: u.destinoNombre, unidaTs: ts }); o.union = Object.assign({}, u, { estado: "hecha", hechos: u.pasos.length }); }
    const ids = idsDe(u.pasos);
    try { window.fbAuditar && window.fbAuditar("obra_unir", ("«" + nombre(R.fu) + "» → «" + u.destinoNombre + "»: " + u.pasos.length + " cosas" + (u.motivo ? " · " + u.motivo : "")).slice(0, 480), { ref: String(srcId), origen: String(srcId), destino: u.destino, ids, cantidad: u.pasos.length, avance: u.merge ? Object.keys(u.merge.patch) : [], elegido: u.elegir || {}, faltaban: R.faltan, porAsistente: !!(op.porAsistente || u.porAsistente) }); } catch (e) { }
    refrescar([srcId, u.destino]);
    const cuenta = {}; u.pasos.forEach((x) => { cuenta[x.k] = (cuenta[x.k] || 0) + 1; });
    const txt = "✓ Listo: " + Object.keys(cuenta).map((k) => cuenta[k] + " " + (COL[k] ? COL[k].t : k)).join(" · ") + (u.merge ? " y el avance cargado" : "") + " pasaron a «" + u.destinoNombre + "». «" + nombre(R.fu) + "» quedó archivada (unida en «" + u.destinoNombre + "»): no se borró nada y se puede deshacer." + (R.faltan.length ? " (" + R.faltan.length + " ya no estaban en la base.)" : "");
    return { ok: true, txt, cuenta, plan: P, ids };
  }
  async function deshacerUnion(srcId, op) {
    op = op || {};
    if (!puede()) return { err: "Deshacer una unión lo hacen Administración y Oficina." };
    const fu = await leerFuente(srcId), u = fu.union;
    if (!u || !(u.estado === "hecha" || u.estado === "en curso" || u.estado === "deshaciendo")) return { err: "Esa carpeta no tiene una unión para deshacer." };
    if (u.estado !== "deshaciendo") { const m = { "union.estado": "deshaciendo", "union.hastaDes": u.estado === "hecha" ? u.pasos.length : Number(u.hechos) || 0, "union.deshechos": 0 }; await db().collection("avanceObras").doc(String(srcId)).update(m); }
    const R = await correr(srcId, "union", Object.assign({}, op, { deshacer: true }));
    const ts = Date.now(), FV = firebase.firestore.FieldValue;
    const fin = { oculta: !!(R.u.fuenteAntes && R.u.fuenteAntes.oculta), unidaEn: FV.delete(), unidaEnNombre: FV.delete(), unidaTs: FV.delete(), "union.estado": "deshecha", "union.deshechaTs": ts, "union.deshechaPor": yoEmail() };
    if (!fin.oculta) { fin.ocultaTs = FV.delete(); fin.mostradaTs = ts; }
    await db().collection("avanceObras").doc(String(srcId)).update(fin);
    const o = obraDe(srcId); if (o) { o.oculta = fin.oculta; delete o.unidaEn; delete o.unidaEnNombre; o.union = Object.assign({}, R.u, { estado: "deshecha" }); }
    try { window.fbAuditar && window.fbAuditar("obra_unir_deshacer", ("«" + nombre(fu) + "» vuelve a estar sola (se deshizo la unión con «" + R.u.destinoNombre + "»)").slice(0, 480), { ref: String(srcId), destino: R.u.destino, ids: idsDe(R.u.pasos), salteados: R.salteados, conflictos: R.conflictosDes, porAsistente: !!op.porAsistente }); } catch (e) { }
    refrescar([srcId, R.u.destino]);
    return { ok: true, txt: "↶ Unión deshecha: «" + nombre(fu) + "» vuelve a tener lo suyo." + (R.salteados.length ? " " + R.salteados.length + " cosa(s) se movieron después a otro lado y quedaron donde están." : "") + (R.conflictosDes.length ? " Ojo: " + R.conflictosDes.join(", ") + " cambió después de la unión y no se volvió atrás (revisalo a mano)." : "") };
  }
  async function mover(srcId, dstId, sel, op) {
    op = op || {};
    const r = await planMover(srcId, dstId, sel, op); if (r.err) return r;
    const P = r.plan, ts = Date.now();
    let txt = "";
    if (P.pasos.length || P.obrasCambio.length) {
      const m = { estado: "en curso", destino: P.dst, destinoNombre: P.dstNombre, ts, por: yoEmail(), porNombre: yoNombre(), motivo: P.motivo, pasos: P.pasos, hechos: 0, obrasCambio: P.obrasCambio, obrasHecho: false };
      await db().collection("avanceObras").doc(String(srcId)).update({ mover180: m });
      const R = await correr(srcId, "mover180", op);
      await db().collection("avanceObras").doc(String(srcId)).update({ "mover180.estado": "hecho", "mover180.finTs": Date.now() });
      const o = obraDe(srcId); if (o) o.mover180 = Object.assign({}, m, { estado: "hecho" });
      const cuenta = {}; P.pasos.forEach((x) => { cuenta[x.k] = (cuenta[x.k] || 0) + 1; });
      txt = "✓ Pasaron a «" + P.dstNombre + "»: " + Object.keys(cuenta).map((k) => cuenta[k] + " " + (COL[k] ? COL[k].t : k)).join(" · ") + (P.obrasCambio.length ? " (con el avance que dieron)" : "") + "." + (R.faltan.length ? " (" + R.faltan.length + " ya no estaban en la base.)" : "");
    }
    let fotosR = null;
    if (P.fotos.length) {
      if (!window.__moverFoto || window.__v152No) txt += " Las fotos no se movieron: falta «↔ Mover» (v152).";
      else { fotosR = await window.__moverFoto.mover(P.fotos, { plazaId: P.dst }, P.motivo || "Movida a otra obra", { sinMotivo: true, porAsistente: !!op.porAsistente }); txt += " " + fotosR.ok + " foto" + (fotosR.ok === 1 ? "" : "s") + " a «" + P.dstNombre + "»" + (fotosR.mal.length ? " (" + fotosR.mal.length + " no: " + fotosR.mal.map((x) => x.motivo).slice(0, 3).join(", ") + ")" : "") + "."; }
    }
    try { window.fbAuditar && window.fbAuditar("obra_mover", ("«" + P.srcNombre + "» → «" + P.dstNombre + "»: " + P.total + " cosas" + (P.motivo ? " · " + P.motivo : "")).slice(0, 480), { ref: P.src, origen: P.src, destino: P.dst, ids: idsDe(P.pasos), fotos: P.fotos, porAsistente: !!op.porAsistente }); } catch (e) { }
    refrescar([P.src, P.dst]);
    return { ok: true, txt: txt.trim(), plan: P, fotos: fotosR };
  }
  async function deshacerMover(srcId, op) {
    op = op || {};
    if (!puede()) return { err: "Solo Administración y Oficina." };
    const fu = await leerFuente(srcId), m = fu.mover180;
    if (!m || !(m.estado === "hecho" || m.estado === "en curso" || m.estado === "deshaciendo")) return { err: "No hay nada movido para deshacer." };
    if (m.estado !== "deshaciendo") await db().collection("avanceObras").doc(String(srcId)).update({ "mover180.estado": "deshaciendo", "mover180.hastaDes": m.estado === "hecho" ? m.pasos.length : Number(m.hechos) || 0, "mover180.deshechos": 0 });
    const R = await correr(srcId, "mover180", Object.assign({}, op, { deshacer: true }));
    await db().collection("avanceObras").doc(String(srcId)).update({ "mover180.estado": "deshecho", "mover180.deshechoTs": Date.now() });
    const o = obraDe(srcId); if (o) o.mover180 = Object.assign({}, m, { estado: "deshecho" });
    try { window.fbAuditar && window.fbAuditar("obra_mover_deshacer", "Vuelve a «" + nombre(fu) + "» lo que se había pasado a «" + m.destinoNombre + "»", { ref: String(srcId), destino: m.destino, ids: idsDe(m.pasos), salteados: R.salteados }); } catch (e) { }
    refrescar([srcId, m.destino]);
    return { ok: true, txt: "↶ Volvió a «" + nombre(fu) + "» lo que se había pasado a «" + m.destinoNombre + "»." + (R.salteados.length ? " " + R.salteados.length + " se movieron después y quedaron donde están." : "") + (R.conflictosDes.length ? " Ojo: " + R.conflictosDes.join(", ") + " cambió después y no se volvió atrás." : "") };
  }
  // ---------------------------------------------------------------- eliminar (solo vacía)
  async function revisarVacia(id) { const inv = await inventario(id); if (inv.err) return inv; return inv; }
  async function eliminar(id, op) {
    op = op || {};
    if (!puede()) return { err: "Eliminar carpetas lo hacen Administración y Oficina." };
    const inv = await inventario(id); if (inv.err) return inv;
    if (!inv.vacia) return { err: "No está vacía: " + resumenInv(inv) + ". Uní esta carpeta con la buena o archivala.", inv, noVacia: true };
    let copia; try { copia = await leerFuente(id); } catch (e) { return { err: "No pude leer la carpeta de la base." }; }
    if (copia.union && copia.union.estado === "en curso") return { err: "Tiene una unión a mitad: terminala o deshacela primero." };
    // primero la copia completa en la auditoría (para volver a crearla); si no se guarda, no se borra
    let aud = "";
    try { const r = await db().collection("auditoria").add({ ts: Date.now(), fecha: new Date().toISOString(), usuario: yoEmail(), accion: "obra_eliminar", detalle: ("Carpeta «" + nombre(copia) + "»" + (copia.obraId ? " (ID " + copia.obraId + ")" : "") + " eliminada (estaba vacía)" + (op.motivo ? " · " + op.motivo : "")).slice(0, 500), ref: String(id), copia: copia, porAsistente: !!op.porAsistente, version: ($("appVersion") || {}).textContent || "" }); aud = r.id; }
    catch (e) { return { err: "No se pudo guardar la copia en la auditoría: no se eliminó nada." }; }
    try { await db().collection("avanceObras").doc(String(id)).delete(); }
    catch (e) {
      if (e && e.code === "permission-denied") {
        try { await db().collection("avanceObras").doc(String(id)).update({ oculta: true, ocultaTs: Date.now(), ocultaPor: yoEmail() }); } catch (er) { return { err: "Las reglas no te dejan eliminarla ni archivarla." }; }
        const o = obraDe(id); if (o) o.oculta = true; refrescar([id]);
        return { ok: true, archivada: true, txt: "🔒 Las reglas de la base no dejan eliminar carpetas con tu usuario: la archivé (deja de salir en las hojas y no se pierde nada).", aud, copia };
      }
      return { err: "No se pudo eliminar (revisá la señal). No se borró nada." };
    }
    try { const quitar = (l) => { const i = l.findIndex((x) => x && String(x.id) === String(id)); if (i >= 0) l.splice(i, 1); }; quitar(intentar(() => avanceObras, [])); quitar(arr(window.avanceObrasOcultas)); quitar(arr(window.avanceObrasTodas)); } catch (e) { }
    refrescar([id]);
    ultimaEliminada = { copia, aud, ts: Date.now() };
    return { ok: true, txt: "🗑 «" + nombre(copia) + "» se eliminó. Quedó la copia entera en la auditoría: se puede volver a crear.", aud, copia };
  }
  let ultimaEliminada = null;
  async function recrear(x) {
    if (!puede()) return { err: "Solo Administración y Oficina." };
    let copia = x && x.copia ? x.copia : x;
    if (typeof x === "string") { const s = await db().collection("auditoria").doc(x).get(); if (!s.exists) return { err: "No encontré esa copia en la auditoría." }; copia = (s.data() || {}).copia; }
    if (!copia || !copia.id) return { err: "No hay copia para volver a crear." };
    const id = String(copia.id), d = clon(copia); delete d.id;
    const ya = await db().collection("avanceObras").doc(id).get(); if (ya.exists) return { err: "Esa carpeta ya existe." };
    d.recreadaTs = Date.now(); d.recreadaPor = yoEmail();
    await db().collection("avanceObras").doc(id).set(d);
    try { window.fbAuditar && window.fbAuditar("obra_recrear", "Se volvió a crear «" + nombre(d) + "» desde la copia de la auditoría", { ref: id }); } catch (e) { }
    refrescar([id]);
    return { ok: true, txt: "↶ «" + nombre(d) + "» volvió a estar." };
  }
  async function archivar(id) {
    if (!puede()) return { err: "Solo Administración y Oficina." };
    if (typeof window.ocultarObra == "function") { await window.ocultarObra(id, true); return { ok: true, txt: "🗄 Archivada: deja de salir en las hojas y no se pierde nada." }; }
    await db().collection("avanceObras").doc(String(id)).update({ oculta: true, ocultaTs: Date.now(), ocultaPor: yoEmail() });
    const o = obraDe(id); if (o) o.oculta = true; refrescar([id]);
    return { ok: true, txt: "🗄 Archivada." };
  }
  function resumenInv(inv) {
    const c = contar(inv), l = COLS.filter((x) => c[x.k]).map((x) => c[x.k] + " " + x.t);
    return l.concat(inv.prop.l).join(", ") || "nada";
  }
  // ---------------------------------------------------------------- confirmación de verdad (también para el asistente)
  function confirmar2(o) {
    o = o || {};
    return new Promise((ok) => {
      const v0 = $("cpConf2"); v0 && v0.remove();
      const ov = document.createElement("div"); ov.id = "cpConf2"; ov.className = "v7-ov no-print cp-v7 cp-conf2"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", o.titulo || "Confirmar");
      const pide = o.escribir ? '<label for="cpConf2In">Para confirmar, escribí <b>' + esc(o.escribir) + '</b></label><input type="text" id="cpConf2In" autocomplete="off" placeholder="' + esc(o.escribir) + '">' : "";
      ov.innerHTML = '<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>' + esc(o.titulo || "¿Seguro?") + '</h3></div><button type="button" class="v7-x" data-cc2="no" aria-label="Cerrar">✕</button></div><div class="cp-c2t">' + (o.html || esc(o.texto || "")) + "</div>" + pide + '<div class="cp-bts"><button type="button" class="btn-primary ' + (o.peligro ? "cp-peligro" : "") + '" data-cc2="si"' + (o.escribir ? " disabled" : "") + ">" + esc(o.boton || "Sí") + '</button><button type="button" class="btn-ghost" data-cc2="no">Cancelar</button></div></div>';
      const fin = (r) => { ov.remove(); ok(r); };
      ov.addEventListener("click", (e) => { if (e.target === ov) return fin(false); const b = e.target.closest("[data-cc2]"); if (!b || b.disabled) return; fin(b.dataset.cc2 === "si"); });
      ov.addEventListener("input", () => { const i = $("cpConf2In"), b = ov.querySelector('[data-cc2="si"]'); if (i && b) b.disabled = nNom(i.value) !== nNom(o.escribir); });
      document.body.appendChild(ov);
      setTimeout(() => { const i = $("cpConf2In"); i && i.focus(); }, 40);
    });
  }
  // ================================================================= la hoja
  let H = null;
  const msg = (t, mal) => { if (!H) return; H.msg = t || ""; H.mal = !!mal; const m = $("cpMsg"); if (m) { m.textContent = H.msg; m.classList.toggle("mal", !!mal); } };
  function abrir(op) {
    op = op || {};
    if (!puede()) return false;
    H = { modo: op.modo || "unir", src: op.src ? String(op.src) : "", dst: op.dst ? String(op.dst) : "", q: "", paso: op.paso || (op.dst ? "revisar" : op.modo === "eliminar" ? "revisar" : op.modo === "dup" ? "lista" : "destino"), elegir: {}, sel: { conAvance: true }, msg: "", res: null };
    pintar();
    if (H.modo === "unir" && H.paso === "revisar") cargarPlan();
    if (H.modo === "eliminar") cargarVacia();
    if (H.modo === "mover" && H.paso === "elegir") cargarInv();
    return true;
  }
  function cerrar() { const v = $("cpOv"); v && v.remove(); H = null; }
  function obraFila(o, extra) { return '<button type="button" class="cp-ob" data-cpdest="' + esc(o.id) + '"><b>' + esc(nomCorto(o)) + "</b><small>" + esc([o.obraId ? "ID " + o.obraId : "sin ID", o.barrio || "", extra || ""].filter(Boolean).join(" · ")) + "</small></button>"; }
  function htmlDestino() {
    const src = obraDe(H.src); if (!src) return '<div class="cp-nota">Esa obra ya no está.</div>';
    const sug = dupDe(src.id).map((d) => ({ o: String(d.a.id) === String(src.id) ? d.b : d.a, m: d.motivos }));
    const q = nNom(H.q), lista = visibles().filter((o) => String(o.id) !== String(src.id) && (!q || nNom(nombre(o)).indexOf(q) >= 0 || (o.obraId && nId(o.obraId).indexOf(nId(H.q)) === 0))).sort((a, b) => nombre(a).localeCompare(nombre(b), "es")).slice(0, 40);
    return '<div class="cp-nota">' + (H.modo === "unir" ? "¿Con qué obra la unís? Todo lo de «<b>" + esc(nomCorto(src)) + "</b>» pasa a la que elijas y esta queda archivada." : "¿A qué obra pasan las cosas de «<b>" + esc(nomCorto(src)) + "</b>»?") + "</div>"
      + (sug.length ? '<div class="cp-tit">Parecen la misma</div>' + sug.map((s) => obraFila(s.o, s.m.join(", "))).join("") : "")
      + '<label for="cpQ" class="cp-lbl">Buscar la obra</label><input type="search" id="cpQ" value="' + esc(H.q) + '" placeholder="Nombre o ID" autocomplete="off">'
      + '<div class="cp-lista">' + (lista.length ? lista.map((o) => obraFila(o)).join("") : '<div class="cp-nota">No hay ninguna con ese nombre.</div>') + "</div>";
  }
  function tablaInv(P) {
    return '<div class="cp-inv">' + P.filas.map((f) => '<div class="cp-if' + (f.fijo ? " fijo" : "") + '"><span class="cp-ic">' + f.ico + '</span><span class="cp-it"><b>' + f.n + " " + esc(f.c) + "</b><small>" + (f.fijo ? "quedan con la de origen (las reglas no dejan cambiarlos)" : "«" + esc(P.dstNombre) + "»: " + f.a + " → " + f.d) + "</small></span></div>").join("")
      + (P.prop && P.prop.n ? '<div class="cp-if"><span class="cp-ic">📊</span><span class="cp-it"><b>Avance y papeles cargados</b><small>' + esc(P.prop.l.join(" · ")) + "</small></span></div>" : "")
      + (!P.filas.length && !(P.prop && P.prop.n) ? '<div class="cp-nota">No tiene nada cargado: se archiva y listo.</div>' : "") + "</div>";
  }
  function htmlConflictos(P) {
    if (!P.conflictos.length) return "";
    return '<div class="cp-tit">Lo que choca (' + P.conflictos.length + ")</div><div class=\"cp-nota\">Si no elegís, queda lo de «" + esc(P.dstNombre) + "». Nada se pierde: lo otro queda en la carpeta archivada.</div>"
      + P.conflictos.map((c, i) => '<div class="cp-cf"><div class="cp-cft">' + esc(c.txt) + '</div><div class="cp-cfo">' + c.op.map((o) => '<label class="cp-op' + (c.q === o[0] ? " on" : "") + '"><input type="radio" name="cpc' + i + '" data-cpelegir="' + esc(c.key) + '" value="' + o[0] + '"' + (c.q === o[0] ? " checked" : "") + "> " + esc(o[1]) + "</label>").join("") + "</div></div>").join("");
  }
  function htmlAvisos(l) { return l && l.length ? '<div class="cp-avisos" role="status">' + l.map((a) => "<div>⚠ " + esc(a) + "</div>").join("") + "</div>" : ""; }
  function htmlFilas(l) { return l && l.length ? '<div class="cp-filas">' + l.slice(0, 40).map((f) => '<div class="cp-fl"><span>' + esc(f.c) + '</span><span class="cp-ad"><s>' + esc(f.a) + "</s> → <b>" + esc(f.d) + "</b></span></div>").join("") + (l.length > 40 ? '<div class="cp-nota">y ' + (l.length - 40) + " más…</div>" : "") + "</div>" : ""; }
  function htmlUnir() {
    const src = obraDe(H.src);
    if (H.paso === "destino") return htmlDestino();
    if (H.paso === "cargando") return '<div class="cp-nota">Revisando todo lo que tiene la carpeta…</div>';
    if (H.paso === "corriendo") return '<div class="cp-prog" id="cpProg" role="status">' + esc(H.prog || "Moviendo…") + "</div>";
    if (H.paso === "listo") return '<div class="cp-ok">' + esc(H.res || "") + '</div><div class="cp-bts"><button type="button" class="btn-primary" data-cp="abrirDst">Abrir «' + esc(H.dstNombre || "") + '»</button><button type="button" class="btn-ghost" data-cp="deshacer">↶ Deshacer unión</button></div>';
    if (H.paso === "cortado") return '<div class="cp-avisos mal" role="status">⏸ ' + esc(H.res || "") + '</div><div class="cp-bts"><button type="button" class="btn-primary" data-cp="seguir">▶ Seguir la unión</button><button type="button" class="btn-ghost" data-cp="deshacer">↶ Deshacer lo hecho</button></div>';
    const P = H.plan; if (!P) return '<div class="cp-nota">' + esc(H.err || "No se pudo armar.") + "</div>";
    if (H.paso === "confirmar") return '<div class="cp-conf">¿Seguro? Se pasan <b>' + P.total + " cosa" + (P.total === 1 ? "" : "s") + "</b> de «" + esc(P.srcNombre) + "» a «" + esc(P.dstNombre) + "»" + (P.merge ? " y se junta el avance" : "") + ". «" + esc(P.srcNombre) + "» queda <b>archivada</b> (no se borra). Se puede deshacer.</div>"
      + '<div class="cp-bts"><button type="button" class="btn-primary" data-cp="unirYa">🔗 Unir</button><button type="button" class="btn-ghost" data-cp="volver">Volver</button></div>';
    return '<div class="cp-dir"><span class="cp-o">' + esc(P.srcNombre) + '</span><span class="cp-fl2">→</span><span class="cp-d">' + esc(P.dstNombre) + '</span><button type="button" class="btn-ghost cp-inv-b" data-cp="invertir">⇄ Quedarse con la otra</button></div>'
      + '<div class="cp-tit">Lo que tiene «' + esc(P.srcNombre) + "»</div>" + tablaInv(P)
      + (P.filasAvance.length ? '<div class="cp-tit">El avance que se junta</div>' + htmlFilas(P.filasAvance) : "")
      + htmlConflictos(P) + htmlAvisos(P.avisos)
      + '<label for="cpMot" class="cp-lbl">Por qué (opcional)</label><input type="text" id="cpMot" value="' + esc(H.motivo || "") + '" placeholder="Ej: se cargó dos veces" autocomplete="off">'
      + '<div class="cp-bts cp-pie"><button type="button" class="btn-primary" data-cp="unirSi">Sí, unir</button><button type="button" class="btn-ghost" data-cp="x">Cancelar</button></div>';
  }
  function htmlMover() {
    if (H.paso === "destino") return htmlDestino();
    if (H.paso === "cargando") return '<div class="cp-nota">Revisando lo que tiene la carpeta…</div>';
    if (H.paso === "listo") return '<div class="cp-ok">' + esc(H.res || "") + '</div><div class="cp-bts"><button type="button" class="btn-ghost" data-cp="deshacerMov">↶ Deshacer</button><button type="button" class="btn-ghost" data-cp="x">Cerrar</button></div>';
    const inv = H.inv; if (!inv) return '<div class="cp-nota">' + esc(H.err || "") + "</div>";
    const dst = obraDe(H.dst), g = inv.g, sel = H.sel;
    const chk = (k, d, tit, sub) => { const id = String(d.__docId || d.id), on = arr(sel[k]).indexOf(id) >= 0; return '<label class="cp-ck' + (on ? " on" : "") + '"><input type="checkbox" data-cpsel="' + k + '" value="' + esc(id) + '"' + (on ? " checked" : "") + "><span><b>" + esc(tit) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</span></label>"; };
    const bloque = (k, tit, l, f) => l.length ? '<details class="cp-grp"' + (arr(sel[k]).length || k === "ordenes" ? " open" : "") + "><summary>" + tit + " (" + l.length + ")" + (arr(sel[k]).length ? " · " + arr(sel[k]).length + " elegid" + (arr(sel[k]).length === 1 ? "a" : "as") : "") + "</summary>" + l.map(f).join("") + "</details>" : "";
    const fFecha = (s) => s ? String(s).split("-").reverse().join("/") : "";
    const nf = arr(sel.fotos).length, nO = arr(sel.ordenes).length;
    const nTot = ["ordenes", "movs", "reservas", "calculos", "gastos", "planos", "etapas", "puntos", "proyectos", "fotos"].reduce((s, k) => s + arr(sel[k]).length, 0);
    const otCerrada = g.ordenes.some((o) => arr(sel.ordenes).indexOf(String(o.id)) >= 0 && o.cierre && arr(o.cierre.avanceItems).length);
    return '<div class="cp-dir"><span class="cp-o">' + esc(nomCorto(inv.obra)) + '</span><span class="cp-fl2">→</span><span class="cp-d">' + esc(dst ? nomCorto(dst) : "") + '</span><button type="button" class="btn-ghost cp-inv-b" data-cp="otroDst">Cambiar</button></div>'
      + '<div class="cp-nota">Tildá lo que va a la otra obra. Una orden se lleva sus fotos, videos y reservas.</div>'
      + bloque("ordenes", "📋 Órdenes", g.ordenes.slice().sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || ""))), (o) => chk("ordenes", o, (o.numero || o.id) + " · " + fFecha(o.fecha), [o.estado, (o.actividades || []).length + " tarea(s)", Object.keys((o.campo && o.campo.fotos) || {}).length + " foto(s)"].filter(Boolean).join(" · ")))
      + (otCerrada ? '<label class="cp-ck on cp-ckav"><input type="checkbox" data-cpav' + (sel.conAvance !== false ? " checked" : "") + '><span><b>También pasar el avance que dieron al cerrarse</b><small>Lo que sumaron al itemizado se resta de esta obra y se suma a la otra.</small></span></label>' : "")
      + bloque("fotos", "📷 Fotos sueltas", g.fotos.concat(g.videos).filter((f) => !f.otId || arr(sel.ordenes).indexOf(String(f.otId)) < 0), (f) => chk("fotos", { id: f.adjId || f.id }, (f.tipo === "video" ? "🎥 " : "") + [f.cat, f.num].filter(Boolean).join(" ") + (f.fecha ? " · " + fFecha(f.fecha) : ""), [f.por, f.otNumero].filter(Boolean).join(" · ")))
      + bloque("movs", "📦 Vales y movimientos", g.movs, (m) => chk("movs", m, (m.numero || m.tipo || "Movimiento") + " · " + (m.desc || m.codigo || ""), [m.tipo, m.cantidad != null ? fN(Number(m.cantidad) || 0) + " " + (m.un || "") : "", m.anulado ? "anulado" : ""].filter(Boolean).join(" · ")))
      + bloque("reservas", "🧾 Reservas", g.reservas, (r) => chk("reservas", r, r.numero || "Reserva", [r.estado, r.para].filter(Boolean).join(" · ")))
      + bloque("calculos", "🧮 Cálculos", g.calculos.filter((c) => c.__docId), (c) => chk("calculos", c, "Cálculo del " + fFecha(c.fecha) + (c.__compartido ? " (también coincide con otra obra)" : ""), c.usuario || ""))
      + bloque("gastos", "💰 Gastos", g.gastos, (x) => chk("gastos", x, x.desc || "Gasto", [fFecha(x.fecha), x.importe != null ? "$ " + fN(Number(x.importe) || 0) : ""].filter(Boolean).join(" · ")))
      + bloque("planos", "📐 Planos", g.planos, (x) => chk("planos", x, x.nombre || "Plano", x.tipo || ""))
      + bloque("etapas", "📈 Avances de etapa", g.etapas, (x) => chk("etapas", x, x.etapa || x.nombre || "Etapa", fFecha(x.fecha)))
      + bloque("puntos", "📍 Puntos del mapa", g.puntos, (x) => chk("puntos", x, x.nombre || x.icono || "Punto", ""))
      + bloque("proyectos", "🧭 Relevamientos", g.proyectos, (x) => chk("proyectos", x, x.nombre || "Proyecto", ""))
      + (g.avisos.length ? htmlAvisos([g.avisos.length + " aviso(s) de la cuadrilla quedan en esta obra: las reglas no dejan cambiarlos."]) : "")
      + '<label for="cpMot" class="cp-lbl">Por qué (opcional)</label><input type="text" id="cpMot" value="' + esc(H.motivo || "") + '" autocomplete="off" placeholder="Ej: la orden se cargó en la obra equivocada">'
      + '<div class="cp-bts cp-pie"><button type="button" class="btn-primary" data-cp="moverSi"' + (nTot ? "" : " disabled") + ">Sí, mover " + (nTot ? nTot + (nO && nf ? "" : "") : "") + '</button><button type="button" class="btn-ghost" data-cp="x">Cancelar</button></div>';
  }
  function htmlEliminar() {
    const inv = H.inv;
    if (H.paso === "listo") return '<div class="cp-ok">' + esc(H.res || "") + "</div>" + (H.copia ? '<div class="cp-bts"><button type="button" class="btn-ghost" data-cp="recrear">↶ Volver a crearla</button><button type="button" class="btn-ghost" data-cp="x">Cerrar</button></div>' : "");
    if (!inv) return '<div class="cp-nota">' + esc(H.err || "Revisando si la carpeta está vacía…") + "</div>";
    const c = contar(inv), filas = COLS.map((x) => '<div class="cp-vf ' + (c[x.k] ? "no" : "si") + '"><span>' + (c[x.k] ? "✗" : "✓") + "</span> " + esc(x.t) + (c[x.k] ? ": <b>" + c[x.k] + "</b>" : "") + "</div>").join("")
      + '<div class="cp-vf ' + (inv.prop.n ? "no" : "si") + '"><span>' + (inv.prop.n ? "✗" : "✓") + "</span> avance, documentación y certificados" + (inv.prop.n ? ": <b>" + esc(inv.prop.l.join(", ")) + "</b>" : "") + "</div>";
    if (!inv.vacia) return '<div class="cp-avisos mal" role="status">No se puede eliminar: «' + esc(nomCorto(inv.obra)) + "» tiene cosas. Si es una carpeta repetida, unila con la buena (todo pasa ahí); si no la querés ver, archivala.</div>" + '<div class="cp-vlist">' + filas + "</div>"
      + '<div class="cp-bts"><button type="button" class="btn-primary" data-cp="aUnir">🔗 Unir con…</button><button type="button" class="btn-ghost" data-cp="archivar">🗄 Archivar</button></div>';
    return '<div class="cp-ok">✓ Está vacía: no la usa nada en ninguna parte de la app.</div><div class="cp-vlist">' + filas + "</div>"
      + '<div class="cp-nota">Antes de borrarla queda la copia entera en la auditoría (se puede volver a crear).</div>'
      + '<div class="cp-bts"><button type="button" class="btn-primary cp-peligro" data-cp="elimSi">🗑 Sí, eliminar</button><button type="button" class="btn-ghost" data-cp="archivar">🗄 Mejor archivarla</button></div>';
  }
  function htmlDup() {
    const l = duplicadas();
    if (!l.length) return '<div class="cp-ok">✓ No hay obras que parezcan repetidas.</div>';
    return '<div class="cp-nota">Obras que parecen la misma carpeta. «Unir» muestra todo antes de hacer nada.</div>' + l.map((d) => htmlDupFila(d)).join("");
  }
  function htmlDupFila(d) {
    return '<div class="cp-dup"><div class="cp-dupt"><b>' + esc(nomCorto(d.a)) + "</b>" + (d.a.obraId ? " <small>ID " + esc(d.a.obraId) + "</small>" : "") + " y <b>" + esc(nomCorto(d.b)) + "</b>" + (d.b.obraId ? " <small>ID " + esc(d.b.obraId) + "</small>" : "") + '</div><div class="cp-dupm">' + esc(d.motivos.join(" · ")) + '</div><div class="cp-bts"><button type="button" class="btn-primary" data-cpdup="' + esc(d.origen.id + "|" + d.destino.id) + '">🔗 Unir</button><button type="button" class="btn-ghost" data-cpno="' + esc(d.a.id + "|" + d.b.id) + '">No son la misma</button></div></div>';
  }
  function pintar() {
    if (!H) return;
    let v = $("cpOv");
    const src = obraDe(H.src), tit = H.modo === "unir" ? "🔗 Unir con otra obra" : H.modo === "mover" ? "↔ Mover cosas a otra obra" : H.modo === "eliminar" ? "🗑 Eliminar carpeta" : "🗂 Posibles duplicadas";
    const cuerpo = H.modo === "unir" ? htmlUnir() : H.modo === "mover" ? htmlMover() : H.modo === "eliminar" ? htmlEliminar() : htmlDup();
    const h = '<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>' + tit + "</h3><small>" + esc(src ? nomCorto(src) : "Obras") + '</small></div><button type="button" class="v7-x" data-cp="x" aria-label="Cerrar">✕</button></div><div class="cp-cu">' + cuerpo + '</div><div class="cp-msg' + (H.mal ? " mal" : "") + '" id="cpMsg" role="status" aria-live="polite">' + esc(H.msg || "") + "</div></div>";
    if (!v) { v = document.createElement("div"); v.id = "cpOv"; v.className = "v7-ov no-print cp-v7"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true"); v.setAttribute("aria-label", tit); v.addEventListener("click", (e) => { if (e.target === v) cerrar(); }); document.body.appendChild(v); }
    const foco = document.activeElement && document.activeElement.id === "cpQ" ? document.activeElement.selectionStart : null;
    v.innerHTML = h;
    if (foco != null) { const q = $("cpQ"); if (q) { q.focus(); try { q.setSelectionRange(foco, foco); } catch (e) { } } }
  }
  async function cargarPlan() {
    H.paso = "cargando"; H.plan = null; pintar();
    const h = H, r = await planUnir(H.src, H.dst, { elegir: H.elegir, motivo: H.motivo });
    if (H !== h) return;
    H.plan = r.plan || null; H.err = r.err || ""; H.paso = "revisar";
    const d = obraDe(H.dst); H.dstNombre = d ? nombre(d) : "";
    pintar(); if (r.err) msg(r.err, true);
  }
  async function cargarInv() { H.paso = "cargando"; pintar(); const h = H, inv = await inventario(H.src); if (H !== h) return; H.inv = inv.err ? null : inv; H.err = inv.err || ""; H.paso = "elegir"; pintar(); }
  async function cargarVacia() { const h = H, inv = await inventario(H.src); if (H !== h) return; H.inv = inv.err ? null : inv; H.err = inv.err || ""; pintar(); }
  const progTxt = (k, n, des) => { if (!H) return; H.prog = (des ? "Volviendo atrás… " : "Moviendo… ") + k + " de " + n; const p = $("cpProg"); if (p) p.textContent = H.prog; };
  async function hacerUnir() {
    const mot = String(($("cpMot") || {}).value || H.motivo || "").trim(); H.motivo = mot;
    H.paso = "corriendo"; H.prog = "Guardando el plan…"; pintar();
    try {
      const r = await unir(H.src, H.dst, { elegir: H.elegir, motivo: mot, prog: progTxt });
      if (r.err) { H.paso = "revisar"; pintar(); return msg(r.err, true); }
      H.paso = "listo"; H.res = r.txt; pintar();
    } catch (e) { cortado(e); }
  }
  function cortado(e) {
    const o = obraDe(H.src), u = o && o.union;
    H.paso = "cortado"; H.res = (e && e.code === "permission-denied" ? "La base no dejó seguir (permiso)." : e && e.code === "cortado" ? "Se cortó a mitad." : "Se cortó a mitad (¿señal?).") + " No se perdió nada: lo que ya pasó quedó anotado. Tocá «Seguir» para terminar o «Deshacer lo hecho».";
    pintar(); intentar(() => leerFuente(H.src).then((f) => { const x = obraDe(H.src); if (x) x.union = f.union; }), null);
    void u;
  }
  async function hacerSeguir() {
    H.paso = "corriendo"; pintar();
    try { const r = await seguirUnion(H.src, { prog: progTxt }); H.paso = "listo"; H.res = r.txt; const f = await leerFuente(H.src).catch(() => null); H.dst = f && f.union ? f.union.destino : H.dst; H.dstNombre = f && f.union ? f.union.destinoNombre : H.dstNombre; pintar(); }
    catch (e) { cortado(e); }
  }
  async function hacerDeshacer() {
    const ok = await confirmar2({ titulo: "↶ ¿Deshacer la unión?", texto: "Todo lo que pasó a la otra obra vuelve a esta y la carpeta deja de estar archivada. Lo que se cambió después no se toca.", boton: "Sí, deshacer" });
    if (!ok) return;
    H.paso = "corriendo"; H.prog = "Volviendo atrás…"; pintar();
    try { const r = await deshacerUnion(H.src, { prog: progTxt }); H.paso = "deshecha"; H.res = r.err || r.txt; H.modo = "info"; pintarInfo(); }
    catch (e) { H.paso = "cortado"; H.res = "Se cortó a mitad de deshacer: tocá «Deshacer» otra vez para terminar."; pintar(); }
  }
  function pintarInfo() { const v = $("cpOv"); if (!v) return; const c = v.querySelector(".cp-cu"); if (c) c.innerHTML = '<div class="cp-ok">' + esc(H.res) + '</div><div class="cp-bts"><button type="button" class="btn-ghost" data-cp="x">Cerrar</button></div>'; }
  document.addEventListener("click", async (e) => {
    if (off()) return;
    const t = e.target;
    // tarjetas fuera de la hoja (legajo, Obras, Supervisor)
    const ab = t.closest && t.closest("[data-cpabrir]");
    if (ab) { e.preventDefault(); const [m, s] = String(ab.dataset.cpabrir).split(":"); if (m === "dup") abrir({ modo: "dup" }); else if (m === "seguir") { abrir({ modo: "unir", src: s, paso: "cortado" }); H.res = "La unión quedó a mitad."; pintar(); } else if (m === "deshacer") { abrir({ modo: "unir", src: s, paso: "cortado" }); await hacerDeshacer(); } else if (m === "deshacerMov") { const r = await deshacerMover(s); toast(r.err || r.txt); } else if (m === "abrirDst") { cerrar(); irLegajo(s); } else abrir({ modo: m, src: s }); return; }
    const du = t.closest && t.closest("[data-cpdup]");
    if (du) { e.preventDefault(); const [s, d] = String(du.dataset.cpdup).split("|"); abrir({ modo: "unir", src: s, dst: d }); return; }
    const no = t.closest && t.closest("[data-cpno]");
    if (no) {
      e.preventDefault(); const [a, b] = String(no.dataset.cpno).split("|");
      const ok = await confirmar2({ titulo: "¿No son la misma obra?", texto: "«" + nombre(obraDe(a)) + "» y «" + nombre(obraDe(b)) + "» dejan de salir como posibles duplicadas.", boton: "Sí, son distintas" });
      if (!ok) return; const r = await noSonLaMisma(a, b).catch(() => ({ err: "No se pudo guardar." }));
      toast(r.err || "Listo: no se vuelven a mostrar como duplicadas."); if (H && H.modo === "dup") pintar(); tic(true); return;
    }
    const v = $("cpOv"); if (!v || !v.contains(t) || !H) return;
    const de = t.closest("[data-cpdest]");
    if (de) { H.dst = de.dataset.cpdest; if (H.modo === "unir") { H.elegir = {}; cargarPlan(); } else { H.sel = { conAvance: true }; cargarInv(); } return; }
    const b = t.closest("[data-cp]"); if (!b || b.disabled) return;
    const a = b.dataset.cp;
    if (a === "x") return cerrar();
    if (a === "invertir") { const s = H.src; H.src = H.dst; H.dst = s; H.elegir = {}; return cargarPlan(); }
    if (a === "otroDst") { H.paso = "destino"; H.dst = ""; return pintar(); }
    if (a === "unirSi") { H.motivo = String(($("cpMot") || {}).value || "").trim(); if (!H.plan) return; H.paso = "confirmar"; return pintar(); }
    if (a === "volver") { H.paso = "revisar"; return pintar(); }
    if (a === "unirYa") { b.disabled = true; return hacerUnir(); }
    if (a === "seguir") return hacerSeguir();
    if (a === "deshacer") return hacerDeshacer();
    if (a === "abrirDst") { const d = H.dst; cerrar(); return irLegajo(d); }
    if (a === "moverSi") {
      H.motivo = String(($("cpMot") || {}).value || "").trim();
      const n = ["ordenes", "movs", "reservas", "calculos", "gastos", "planos", "etapas", "puntos", "proyectos", "fotos"].reduce((s, k) => s + arr(H.sel[k]).length, 0);
      const ok = await confirmar2({ titulo: "¿Mover " + n + " cosa" + (n === 1 ? "" : "s") + "?", texto: "Pasan de «" + nombre(obraDe(H.src)) + "» a «" + nombre(obraDe(H.dst)) + "». Se puede deshacer.", boton: "Sí, mover" });
      if (!ok) return;
      b.disabled = true; msg("Moviendo…");
      try { const r = await mover(H.src, H.dst, H.sel, { motivo: H.motivo }); if (r.err) { b.disabled = false; return msg(r.err, true); } H.paso = "listo"; H.res = r.txt; pintar(); }
      catch (er) { b.disabled = false; msg("⚠ No se pudo: " + (er && er.code === "permission-denied" ? "la base no dejó (permiso)." : er && er.code === "cortado" ? "se cortó a mitad: abrí la carpeta y tocá «Deshacer» o volvé a intentar." : "revisá la señal."), true); }
      return;
    }
    if (a === "deshacerMov") { msg("Volviendo atrás…"); try { const r = await deshacerMover(H.src); H.res = r.err || r.txt; H.modo = "info"; pintarInfo(); } catch (er) { msg("⚠ No se pudo deshacer (revisá la señal).", true); } return; }
    if (a === "aUnir") { H.modo = "unir"; H.paso = "destino"; return pintar(); }
    if (a === "archivar") { try { const r = await archivar(H.src); H.res = r.err || r.txt; H.modo = "info"; pintarInfo(); } catch (er) { msg("⚠ No se pudo archivar.", true); } return; }
    if (a === "elimSi") {
      const o = obraDe(H.src); if (!o) return;
      const ok = await confirmar2({ titulo: "🗑 ¿Eliminar «" + nombre(o) + "» para siempre?", html: "Se borra la carpeta para todo el equipo. Queda la copia en la auditoría.", escribir: nombre(o), boton: "🗑 Eliminar para siempre", peligro: true });
      if (!ok) return;
      msg("Eliminando…");
      try { const r = await eliminar(H.src); if (r.err) return msg(r.err, true); H.paso = "listo"; H.res = r.txt; H.copia = r.archivada ? null : r.copia; pintar(); }
      catch (er) { msg("⚠ No se pudo (revisá la señal). No se borró nada.", true); }
      return;
    }
    if (a === "recrear") { try { const r = await recrear({ copia: H.copia }); H.res = r.err || r.txt; H.copia = null; H.modo = "info"; pintarInfo(); } catch (er) { msg("⚠ No se pudo.", true); } return; }
  }, true);
  document.addEventListener("input", (e) => { if (!H || off()) return; if (e.target && e.target.id === "cpQ") { H.q = e.target.value; pintar(); } if (e.target && e.target.id === "cpMot") H.motivo = e.target.value; });
  document.addEventListener("change", (e) => {
    if (!H || off()) return; const t = e.target;
    if (t.dataset && t.dataset.cpelegir) { H.elegir[t.dataset.cpelegir] = t.value; cargarPlan(); return; }
    if (t.dataset && t.dataset.cpsel) { const k = t.dataset.cpsel, l = arr(H.sel[k]).slice(), i = l.indexOf(t.value); if (t.checked && i < 0) l.push(t.value); if (!t.checked && i >= 0) l.splice(i, 1); H.sel[k] = l; pintar(); return; }
    if (t.hasAttribute && t.hasAttribute("data-cpav")) { H.sel.conAvance = !!t.checked; pintar(); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("cpConf2")) { const b = $("cpConf2").querySelector('[data-cc2="no"]'); b && b.click(); } else if (e.key === "Escape" && $("cpOv")) cerrar(); });
  function irLegajo(id) { try { typeof mostrarVista == "function" && mostrarVista("obras"); } catch (e) { } setTimeout(() => { try { window.abrirLegajo && window.abrirLegajo(id); } catch (e) { } }, 120); }
  function toast(t) { try { if (typeof window.mostrarAviso == "function") return window.mostrarAviso(t); } catch (e) { } const s = $("cpToast") || document.createElement("div"); s.id = "cpToast"; s.className = "cp-toast no-print"; s.setAttribute("role", "status"); s.textContent = t; document.body.appendChild(s); clearTimeout(s.__t); s.__t = setTimeout(() => s.remove(), 5000); }
  // ================================================================= el legajo y Obras
  function seccionLegajo() {
    const f = $("lgFotosSec"), app = $("obrasApp"), id = f && f.dataset.plaza ? f.dataset.plaza : "", o = id ? obraDe(id) : null;
    let sec = $("lgCpSec");
    if (!o || !app || !puede()) { sec && sec.remove(); return; }
    if (sec && (sec.dataset.plaza !== String(id) || sec.parentNode !== app)) { sec.remove(); sec = null; }
    const u = o.union, mv = o.mover180, dps = o.unidaEn ? [] : dupDe(o.id);
    let h = '<h3>🗂 Unir, mover o eliminar esta carpeta</h3>';
    if (u && (u.estado === "en curso" || u.estado === "deshaciendo")) h += '<div class="cp-avisos mal" role="status">⏸ La ' + (u.estado === "deshaciendo" ? "vuelta atrás" : "unión") + " con «" + esc(u.destinoNombre || "") + "» quedó a mitad (" + (u.estado === "deshaciendo" ? Number(u.deshechos) || 0 : Number(u.hechos) || 0) + " de " + arr(u.pasos).length + ").</div>" + '<div class="cp-bts">' + (u.estado === "en curso" ? '<button type="button" class="btn-primary" data-cpabrir="seguir:' + esc(o.id) + '">▶ Seguir la unión</button>' : "") + '<button type="button" class="btn-ghost" data-cpabrir="deshacer:' + esc(o.id) + '">↶ Deshacer lo hecho</button></div>';
    else if (o.unidaEn) h += '<div class="cp-ok">🔗 Esta carpeta se unió con «<b>' + esc(o.unidaEnNombre || nombre(obraDe(o.unidaEn))) + "</b>»" + (o.unidaTs ? " el " + fCorta(o.unidaTs) : "") + ". Todo lo suyo está ahí.</div>" + '<div class="cp-bts"><button type="button" class="btn-primary" data-cpabrir="abrirDst:' + esc(o.unidaEn) + '">Abrir «' + esc(o.unidaEnNombre || "") + '»</button><button type="button" class="btn-ghost" data-cpabrir="deshacer:' + esc(o.id) + '">↶ Deshacer unión</button></div>';
    else {
      if (dps.length) h += dps.map((d) => { const otra = String(d.a.id) === String(o.id) ? d.b : d.a; return '<div class="cp-sug">Puede ser la misma que «<b>' + esc(nomCorto(otra)) + "</b>» (" + esc(d.motivos.join(", ")) + ')<div class="cp-bts"><button type="button" class="btn-ghost" data-cpdup="' + esc(o.id + "|" + otra.id) + '">🔗 Unir con esa</button><button type="button" class="btn-ghost" data-cpno="' + esc(o.id + "|" + otra.id) + '">No son la misma</button></div></div>'; }).join("");
      if (mv && mv.estado === "hecho" && Date.now() - (Number(mv.ts) || 0) < 7 * 864e5) h += '<div class="cp-nota">Lo último: ' + arr(mv.pasos).length + " cosa(s) pasaron a «" + esc(mv.destinoNombre || "") + '» el ' + fCorta(mv.ts) + '. <button type="button" class="btn-ghost cp-mini" data-cpabrir="deshacerMov:' + esc(o.id) + '">↶ Deshacer</button></div>';
      h += '<div class="cp-nota">Si esta carpeta está repetida o se creó por error: unila con la buena (todo pasa ahí y esta queda archivada), pasá algunas cosas a otra obra o, si está vacía, eliminala.</div>'
        + '<div class="cp-bts"><button type="button" class="btn-ghost" data-cpabrir="unir:' + esc(o.id) + '">🔗 Unir con otra obra</button><button type="button" class="btn-ghost" data-cpabrir="mover:' + esc(o.id) + '">↔ Mover cosas a otra obra</button><button type="button" class="btn-ghost" data-cpabrir="eliminar:' + esc(o.id) + '">🗑 Eliminar carpeta</button></div>';
    }
    if (!sec) { sec = document.createElement("div"); sec.className = "card lg-sec cp-lg no-print"; sec.id = "lgCpSec"; sec.dataset.plaza = String(id); app.appendChild(sec); }
    if (sec.__h !== h) { sec.innerHTML = h; sec.__h = h; }
  }
  function tarjetaObras() {
    const app = $("obrasApp"); let c = $("cpDupCard");
    if (!app || $("lgFotosSec") || !puede()) { c && c.remove(); return; }
    const l = duplicadas();
    if (!l.length) { c && c.remove(); return; }
    const h = '<h3>🗂 Posibles duplicadas (' + l.length + ")</h3>" + l.slice(0, 4).map(htmlDupFila).join("") + (l.length > 4 ? '<div class="cp-bts"><button type="button" class="btn-ghost" data-cpabrir="dup">Ver las ' + l.length + "</button></div>" : "");
    if (c && c.parentNode !== app) { c.remove(); c = null; }
    if (!c) { c = document.createElement("div"); c.id = "cpDupCard"; c.className = "card cp-dupcard no-print"; app.insertAdjacentElement("afterbegin", c); }
    if (c.__h !== h) { c.innerHTML = h; c.__h = h; }
  }
  function tic() { if (off()) return; try { seccionLegajo(); } catch (e) { } try { tarjetaObras(); } catch (e) { } }
  setInterval(tic, 1500);
  // ================================================================= Supervisor
  function supHallazgos() {
    if (!puede()) return [];
    const l = duplicadas().slice(0, 6).map((d) => ({ g: "ambar", cat: "Obras", t: "🗂 Posible obra repetida: «" + nomCorto(d.a) + "» y «" + nomCorto(d.b) + "»", s: d.motivos.join(" · ") + ". Tocá para unirlas o marcar que no son la misma.", ir: { tipo: "carpetas" }, btn: "Ver" }));
    obras().forEach((o) => { if (o && o.union && (o.union.estado === "en curso" || o.union.estado === "deshaciendo")) l.unshift({ g: "rojo", cat: "Obras", t: "⏸ Unión de «" + nomCorto(o) + "» con «" + (o.union.destinoNombre || "") + "» a mitad", s: "Abrí la carpeta y tocá «Seguir» o «Deshacer».", ir: { tipo: "legajo", id: o.id }, btn: "Ver" }); });
    return l;
  }
  // ================================================================= para el asistente
  function vaciasRapido() {
    const l = visibles(), ots = mem.ordenesTrabajo(), mv = mem.movimientos(), rs = mem.reservas(), ga = mem.gastosObra(), hc = histCalc();
    return l.filter((o) => { const id = String(o.id); return !ots.some((x) => String(x.plazaId || "") === id) && !mv.some((x) => String(x.plazaId || "") === id) && !rs.some((x) => String(x.plazaId || "") === id) && !ga.some((x) => String(x.plazaId || "") === id) && !hc.some((h) => calcEsDe(h, o)) && !propio(o).n; });
  }
  function paraIa(inv) { const c = contar(inv), r = {}; COLS.forEach((x) => { if (c[x.k]) r[x.t] = c[x.k]; }); return { obra: nombre(inv.obra), obraId: inv.obra.id, ID: inv.obra.obraId || "", archivada: !!inv.obra.oculta, unidaEn: inv.obra.unidaEnNombre || "", tiene: r, avanceYPapeles: inv.prop.l, vacia: inv.vacia, noPudeLeer: inv.noPude, ordenes: inv.g.ordenes.slice(0, 40).map((o) => ({ id: o.id, numero: o.numero || "", fecha: o.fecha || "", estado: o.estado || "" })), vales: inv.g.movs.slice(0, 40).map((m) => ({ id: m.id, numero: m.numero || "", tipo: m.tipo || "", desc: m.desc || "" })), fotos: inv.g.fotos.slice(0, 30).map((f) => ({ id: f.adjId || f.id, cat: f.cat || "", num: f.num || "", fecha: f.fecha || "", orden: f.otNumero || "" })) }; }
  window.__carpetas = { puede, obras, obraDe, buscar, resolver, duplicadas, dupDe, noSonLaMisma, inventario, contar, resumenInv, propio, juntarAvance, planUnir, unir, seguirUnion, deshacerUnion, planMover, mover, deshacerMover, revisarVacia, eliminar, recrear, archivar, confirmar2, abrir, cerrar, supHallazgos, vaciasRapido, paraIa, tic, COLS, estado: () => ({ hoja: H ? { modo: H.modo, paso: H.paso, src: H.src, dst: H.dst } : null, ultimaEliminada }) };
})();
