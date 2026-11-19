  // ---------- v178 · El asistente ve TODO y hace TODO lo de la app (Ángel 19/11: «la IA de la app tiene que saber y ver todo lo de
  //  la app, absolutamente todo; no puede decirme que no ve; tiene que poder ver todo, saber todo y poder hacer todo»).
  //  Solo Administración y Oficina (cada uno con SUS permisos de siempre; las reglas de Firebase lo vuelven a controlar). La
  //  cuadrilla, el pañol, «solo mirar» y Dirección siguen exactamente como antes (los límites de la v141 son de seguridad).
  //  · Lectura: consultar / describir_datos con TODAS las colecciones (lo que no está en memoria se lee de la base a pedido,
  //    con tope y paginado: herramientas, quincenas, puntos del mapa, presencia, ubicación, gastos, adjuntos, fotos, auditoría,
  //    avisos de la cuadrilla, Proyectista, notas de planos, tableros, cuadrillas, guías, salud, alias), leer_doc (un documento
  //    cualquiera), buscar_en_todo (un nombre o un número en todas las colecciones), ver_pantalla (lo que la persona está
  //    mirando) y dato_app (lo que calculan los módulos: pedido de compras, tablero del dueño, alertas, informe semanal…).
  //  · Acciones: proponer_accion (reservas, herramientas, gastos, obra nueva, archivar/borrar obra, usuarios, puntos del mapa,
  //    documentación, avisos de la cuadrilla, ausencias, contactos, quincena, borrar fotos, alta de producto) y proponer_editar
  //    con más colecciones; siempre tarjeta y «Sí»; lo delicado (borrar, anular, usuarios/roles, quincena, reiniciar puntos)
  //    pide el «Sí» dos veces. Nada saltea la guardia de la v174 ni las reglas.
  if (!window.__v178No) (function ia178() {
    var AO = function () { var n = nivelRol(); return n === "admin" || n === "oficina"; };
    var ADM = function () { return nivelRol() === "admin"; };
    var NUEVAS = /^(leer_doc|buscar_en_todo|ver_pantalla|dato_app|proponer_accion)$/;
    var alc0 = alcance;
    alcance = function () {
      var A = alc0(); if (AO()) return A;
      var p0 = A.permite, t0 = A.tools;
      var sinNuevas = function (t) {   // los demás roles reciben las herramientas viejas como antes (sin las colecciones nuevas en los enum)
        var p = t.input_schema && t.input_schema.properties, e = p && p.coleccion && p.coleccion.enum; if (!e) return t;
        var f = e.filter(function (k) { return NUEVOS_D.indexOf(k) < 0 && NUEVOS_E.indexOf(k) < 0; }); if (f.length === e.length) return t;
        return Object.assign({}, t, { input_schema: Object.assign({}, t.input_schema, { properties: Object.assign({}, p, { coleccion: Object.assign({}, p.coleccion, { enum: f }) }) }) });
      };
      return Object.assign({}, A, { permite: function (t) { return !NUEVAS.test(t) && p0(t); }, tools: function (l) { return t0(l).filter(function (t) { return !NUEVAS.test(t.name); }).map(sinNuevas); } });
    };
    var NUEVOS_D = ["adjuntos", "fotosObra", "auditoria", "avisosCuadrilla", "proyectos", "planosNotas", "tableros", "cuadrillas", "guias", "salud", "alias"], NUEVOS_E = ["cuadrillas", "guias", "proyectos", "planosNotas"];
    var corto = function (x, n) { var s = ""; try { s = JSON.stringify(x); } catch (e) { s = String(x); } return s.length > (n || 30000) ? s.slice(0, n || 30000) + "…" : s; };
    var hondo = function (x) { return limpio(x, -4); };   // limpio con más profundidad (leer un documento entero)
    function errLeer(e) { var c = String((e && e.code) || ""); return /permission/.test(c) ? "la base no deja leerlo con este usuario (permiso)" : /unavailable|network/.test(c) || navigator.onLine === false ? "sin conexión con la base" : String((e && e.message) || e).slice(0, 120); }

    // ================================================================= 1) lo que no está en memoria se lee de la base a pedido
    // col: colección real · orden: campo para traer lo más nuevo · lim: cuántos de entrada · doc: un documento de configEquipo
    var BASE = {
      herramientas: { col: "herramientas", lim: 500 }, herramientasMov: { col: "herramientasMov", orden: "ts", lim: 300 },
      mapaPuntos: { col: "mapaPuntos", lim: 400 }, cierresQuincena: { col: "cierresQuincena", lim: 120 },
      presencia: { col: "presencia", lim: 300, uid: true }, ubicacionVivo: { col: "ubicacionVivo", lim: 300, uid: true },
      gastos: { col: "gastosObra", lim: 800 }, plan: { col: "planSemanal", lim: 500 }, etapas: { col: "historialEtapas", lim: 500 },
      planos: { col: "planosObra", lim: 300 }, usuarios: { col: "usuarios", lim: 300, uid: true },
      adjuntos: { col: "adjuntos", orden: "ts", lim: 25, nuevo: 1 }, fotosObra: { col: "fotosObra", orden: "ts", lim: 150, nuevo: 1 },
      auditoria: { col: "auditoria", orden: "ts", lim: 200, nuevo: 1 }, avisosCuadrilla: { col: "avisosCuadrilla", orden: "ts", lim: 150, nuevo: 1 },
      proyectos: { col: "proyectos", lim: 100, nuevo: 1 }, planosNotas: { col: "planosNotas", lim: 300, nuevo: 1 }, tableros: { col: "tableros", lim: 200, nuevo: 1 },
      cuadrillas: { doc: "cuadrillas", nuevo: 1 }, guias: { doc: "guias", nuevo: 1 }, salud: { doc: "salud", nuevo: 1 }, alias: { doc: "alias", nuevo: 1 }
    };
    var CACHE = {}, ACT = {}, MEM0 = {};
    async function cargar(k, op) {
      op = op || {}; var B = BASE[k]; if (!B) return { l: [] };
      var w = op.where || null, lim = Math.min(2000, op.lim || B.lim || 300), key = k + "|" + JSON.stringify(w) + "|" + lim;
      var c = CACHE[key]; if (c && Date.now() - c.ts < 180000) return c;
      var db = firebase.firestore(), l = [];
      try {
        if (B.doc) { var s = await db.collection("configEquipo").doc(B.doc).get(); if (s.exists) l = [Object.assign({ id: B.doc }, s.data())]; }
        else {
          var q = db.collection(B.col);
          if (w) w.forEach(function (x) { q = q.where(x[0], "==", x[1]); }); else if (B.orden) q = q.orderBy(B.orden, "desc");
          var s2 = await q.limit(lim).get();
          s2.forEach(function (d) { var o = Object.assign({ id: d.id }, d.data()); if (B.uid && !o.uid) o.uid = d.id; l.push(o); });
          if (w && B.orden) l.sort(function (a, b) { return msDe(b[B.orden]) - msDe(a[B.orden]); });
        }
        c = { ts: Date.now(), l: l, lim: lim, lleno: !B.doc && l.length >= lim, base: true };
      } catch (e) { c = { ts: Date.now(), l: [], err: errLeer(e), base: true }; }
      CACHE[key] = c; if (!w && !c.err) CACHE[k] = c;
      return c;
    }
    window.__ia178Cache = CACHE;   // pruebas
    // las colecciones que ya había: si en memoria está vacía, lo leído de la base
    Object.keys(BASE).forEach(function (k) {
      var d = DATOS[k]; if (!d || d.__178) return;
      var l0 = d.lista; d.__178 = 1; MEM0[k] = l0;
      d.lista = function () { if (ACT[k]) return ACT[k]; var l = l0() || []; return l.length || !AO() ? l : ((CACHE[k] || {}).l || l); };
      d.que = String(d.que || "").replace(/ Se carga (al abrir|con)[^.]*\./, " Si no está en memoria, se lee de la base.");
    });
    // las colecciones nuevas
    var nueva = function (k) { return function () { return ACT[k] || (CACHE[k] || {}).l || []; }; };
    Object.assign(DATOS, {
      adjuntos: { hojas: ["registro", "avance", "parte", "stock"], ao: 1, lista: nueva("adjuntos"), que: "adjuntos: ficha de cada foto/archivo (tipo foto/remito/documento/video/pdf/informeSemanal/remitoRes/pedidoCompra…, plazaId, otId, titulo, nota, r2 = dónde está en la nube, por, ts). La imagen no viaja (usá ver_fotos / ver_plano). Se leen de la base los más nuevos (25 por página); con filtro (p. ej. {\"plazaId\": …} o {\"tipo\": \"remito\"}) se piden directo." },
      fotosObra: { hojas: ["registro", "avance", "parte", "stock"], ao: 1, lista: nueva("fotosObra"), que: "fotosObra: ficha liviana de cada foto de obra (plazaId, cat, num = «Col 4», otId, k = tarea, lat/lng, gpsPrec, distObra, ubicDudosa, por, ts, fecha, movidaDe/movidaHist, tipo video/pdf). Se lee de la base (las 150 más nuevas; con filtro {\"plazaId\": …} o {\"fecha\": \"AAAA-MM-DD\"} van directo)." },
      auditoria: { hojas: ["usuarios"], admin: true, lista: nueva("auditoria"), que: "auditoria: registro de TODO lo que se hizo en la app (accion, detalle, usuario, ts, ref y lo que guardó cada acción: antes/después, motivo, porAsistente). Solo Administración. Se lee de la base (las 200 más nuevas; con filtro {\"accion\": \"…\"} o {\"ref\": \"…\"} va directo)." },
      avisosCuadrilla: { hojas: ["parte"], ao: 1, lista: nueva("avisosCuadrilla"), que: "avisosCuadrilla («📨 Para resolver»): lo que la cuadrilla, el pañol y «solo mirar» le avisan a la oficina (texto, tipo, persona, otNumero, obraNombre, estado nuevo/visto/resuelto/analizado/autorizado/rechazado, respuesta, reclamos de puntos con tarea, cuántos, análisis y decisión)." },
      proyectos: { hojas: ["registro", "avance"], ao: 1, lista: nueva("proyectos"), que: "proyectos: relevamientos del Proyectista (nombre, obra, etapa, puntos[] con tipo/lat/lng/nota y lo eléctrico, luminarias, circuitos, calc)." },
      planosNotas: { hojas: ["registro", "avance", "parte"], ao: 1, lista: nueva("planosNotas"), que: "planosNotas: notas y dibujos sobre los planos de obra (planoId, plazaId, texto, por, ts)." },
      tableros: { hojas: ["usuarios"], admin: true, lista: nueva("tableros"), que: "tableros: «Mi tablero» de cada persona (lo que se anotó cada uno)." },
      cuadrillas: { hojas: ["parte", "plan"], ao: 1, lista: nueva("cuadrillas"), que: "configEquipo/cuadrillas: las cuadrillas armadas (lista[{nombre, integrantes…}])." },
      guias: { hojas: ["normas", "inicio"], ao: 1, lista: nueva("guias"), que: "configEquipo/guias: las guías y textos que cargó la oficina." },
      salud: { hojas: ["parte", "produccion"], ao: 1, lista: nueva("salud"), que: "configEquipo/salud: los turnos y marcas automáticas de la app (supervisor, pasar a mañana, informe semanal, verificación, guardián, gente sin tarea)." },
      alias: { hojas: ["usuarios"], admin: true, lista: nueva("alias"), que: "configEquipo/alias: usuario corto → persona (para entrar con «angel» en vez del correo)." }
    });
    // Oficina también ve la ubicación en vivo (como en el Mapa); Dirección y los demás, como antes
    var pv0 = puedeVer;
    puedeVer = function (k) {
      var d = DATOS[k]; if (!d) return false;
      if (d.ao && !AO()) return false;
      if (k === "ubicacionVivo" && nivelRol() === "oficina") return true;
      return pv0(k);
    };
    function filtroWhere(f, k) {
      if (!f || typeof f != "object" || !BASE[k] || BASE[k].doc) return null;
      var w = []; Object.keys(f).forEach(function (c) { var v = f[c]; if (c.indexOf(".") < 0 && (typeof v == "string" || typeof v == "number" || typeof v == "boolean")) w.push([c, v]); });
      return w.length ? w : null;
    }
    var cons0 = H.consultar;
    H.consultar = async function (a) {
      a = a || {}; var k = String(a.coleccion || "").trim();
      if (!AO() || !BASE[k] || !DATOS[k] || !puedeVer(k)) return cons0(a);
      var enMem = []; try { if (MEM0[k]) enMem = MEM0[k]() || []; } catch (e) { enMem = []; }
      if (enMem.length) return cons0(a);
      var desde = Math.max(0, parseInt(a.desde, 10) || 0), lim = Math.min(100, Math.max(1, parseInt(a.limite, 10) || 25));
      var w = filtroWhere(a.filtro, k), need = Math.max(BASE[k].lim || 25, desde + lim + 1);
      var c = await cargar(k, { where: w, lim: BASE[k].doc ? 0 : need });
      if (c.err) return { err: "No pude leer «" + k + "» de la base: " + c.err + "." };
      ACT[k] = c.l; var r;
      try { r = cons0(a); } finally { delete ACT[k]; }
      if (r && r.r) {
        r.r.fuente = "leído de la base ahora (" + c.l.length + (c.lleno ? ", los más nuevos" : "") + ")";
        if (c.lleno && !r.r.hayMas) r.r.hayMas = "puede haber más en la base: pedí desde=" + (desde + (r.r.devueltos || 0)) + " o filtrá";
        delete r.r.nota;
      }
      return r;
    };
    var desc0 = H.describir_datos;
    H.describir_datos = async function () {
      if (!AO()) { var r0 = desc0(); if (r0 && r0.r && Array.isArray(r0.r.colecciones)) r0.r.colecciones = r0.r.colecciones.filter(function (x) { return NUEVOS_D.indexOf(x.coleccion) < 0; }); return r0; }
      var ks = Object.keys(BASE).filter(function (k) { return DATOS[k] && puedeVer(k) && !/^(adjuntos|fotosObra|auditoria)$/.test(k); });
      for (var i = 0; i < ks.length; i++) { if (!(DATOS[ks[i]].lista() || []).length) await cargar(ks[i]); }
      var r = desc0();
      if (r && r.r) {
        r.r.base = "Las colecciones grandes (adjuntos, fotosObra, auditoria) se leen de la base recién con consultar (las más nuevas, o con filtro). Además: leer_doc (un documento por su id o número, de cualquier colección), buscar_en_todo (un nombre o número en todo), ver_pantalla (lo que la persona tiene abierto) y dato_app (lo que calculan los módulos).";
        r.r.noSeLeen = "Solo esto no se puede leer desde la app, a propósito: secretosServidor (claves del servidor), pushSubs (los celulares anotados para avisos) y avisosPush (la cola del Worker): las reglas de Firebase no dejan leerlos a nadie.";
      }
      return r;
    };

    // ================================================================= 2) leer un documento, buscar en todo, la pantalla, lo que calculan los módulos
    var NO_LEE = { secretosServidor: "las claves privadas del servidor: nadie las lee desde la app (a propósito).", pushSubs: "los celulares anotados para los avisos: la base no deja leerlos (tienen la dirección de cada celular).", avisosPush: "la cola de avisos del Worker: la base no deja leerla." };
    var CFG = { personal: "personal", baremo: "baremo", precios: "precios", reinicios: "reinicios", ubicacion: "ubicacionCfg", cuadrillas: "cuadrillas", guias: "guias", salud: "salud", alias: "alias", presencia: "salud", vapid: "guias" };
    function claveDato(col) {   // colección real → clave del registro DATOS (para el permiso)
      if (DATOS[col]) return col;
      var m = { avanceObras: "obras", historialCalculos: "calculos", ordenesTrabajo: "ordenes", catalogoProductos: "catalogo", gastosObra: "gastos", planSemanal: "plan", historialEtapas: "etapas", planosObra: "planos", planosImg: "planos" };
      return m[col] || "";
    }
    H.leer_doc = async function (a) {
      a = a || {}; var col = String(a.coleccion || "").trim(), id = String(a.id || "").trim();
      if (NO_LEE[col]) return { err: "«" + col + "» no se lee: " + NO_LEE[col] };
      if (EDITA[col] && EDITA[col].col && EDITA[col].col !== "configEquipo") col = EDITA[col].col; else if (BASE[col] && BASE[col].col) col = BASE[col].col; else if (BASE[col] && BASE[col].doc) { id = BASE[col].doc; col = "configEquipo"; } else if (EDITA[col] && EDITA[col].doc) { id = EDITA[col].doc; col = "configEquipo"; }
      if (!col || !/^[A-Za-z]+$/.test(col)) return { err: "Decí la colección (p. ej. ordenesTrabajo, avanceObras, reservas, configEquipo)." };
      if (!id) return { err: "Falta el id del documento (o el número: OT-…, R-…, S-…, el código del producto o el nombre de la obra)." };
      var k = col === "configEquipo" ? CFG[id] || "" : claveDato(col);
      if (col === "configEquipo" && !CFG[id]) return { err: "configEquipo tiene: " + Object.keys(CFG).join(", ") + " (secretosServidor no se lee)." };
      if (k && !puedeVer(k)) return { err: "Tu usuario no tiene permiso para ver «" + col + (col === "configEquipo" ? "/" + id : "") + "»." };
      if (!k && !ADM()) return { err: "Esa colección la lee solo Administración." };
      // número → id
      var docId = id;
      if (col === "ordenesTrabajo") { var o = otPorRef(id); if (o) docId = o.id; }
      else if (col === "avanceObras" && !obras().some(function (x) { return String(x.id) === id; })) { var ro = resolverObra(id); if (ro.obra) docId = ro.obra.id; else if (ro.candidatos) return { err: ro.err, r: { candidatos: ro.candidatos } }; }
      else if (col === "reservas" || col === "movimientos") { var lm = col === "reservas" ? reservasL() : movs(), xm = lm.find(function (x) { return String(x.id) === id || String(x.numero || "") === id || (typeof window.numeroComprobante == "function" && window.numeroComprobante(x) === id); }); if (xm) docId = String(xm.id); }
      else if (col === "catalogoProductos") docId = String(parseInt(id, 10) || id);
      else if (col === "herramientas") { var lh = (DATOS.herramientas.lista() || []).length ? DATOS.herramientas.lista() : (await cargar("herramientas")).l, xh = lh.find(function (x) { return String(x.id) === id || String(x.codigo || "").toUpperCase() === id.toUpperCase(); }); if (xh) docId = String(xh.id); }
      var d = null;
      try { var s = await firebase.firestore().collection(col).doc(docId).get(); if (s.exists) d = Object.assign({ id: s.id }, s.data()); }
      catch (e) { return { err: "No pude leerlo de la base: " + errLeer(e) + "." }; }
      if (!d && col === "catalogoProductos") { var cp = catalogoL().find(function (x) { return String(x.codigo) === String(id); }); if (cp) return { r: { coleccion: col, id: id, existe: "solo en el catálogo base de la app (sin cambios guardados)", datos: hondo(cp) } }; }
      if (!d) return { r: { coleccion: col, id: docId, existe: false, nota: "No hay ningún documento con ese id. Probá buscar_en_todo con el nombre o el número." } };
      var out = hondo(d), txt = corto(out, 28000);
      return { r: txt.length >= 28000 ? { coleccion: col, id: docId, existe: true, cortado: true, datos: txt } : { coleccion: col, id: docId, existe: true, datos: out } };
    };
    var et = function (x) { return String(x.numero || x.nombre || x.plazaNombre || x.desc || x.titulo || x.texto || x.detalle || x.accion || x.codigo || x.id || "").slice(0, 90); };
    var PESADAS = /^(adjuntos|fotosObra|auditoria)$/;
    H.buscar_en_todo = async function (a) {
      a = a || {}; var w = nk(a.texto || "").split(" ").filter(function (x) { return x.length > 1; });
      if (!w.length) return { err: "Decí qué buscar (un nombre, un número, un código…)." };
      var res = [], nada = [], sin = [], ks = Object.keys(DATOS).filter(puedeVer);
      for (var i = 0; i < ks.length; i++) {
        var k = ks[i], l = []; try { l = DATOS[k].lista() || []; } catch (e) { l = []; }
        if (!l.length && BASE[k]) { if (PESADAS.test(k) && !a.profundo) { sin.push(k); continue; } var c = await cargar(k); l = c.l; if (c.err) { sin.push(k + " (" + c.err + ")"); continue; } }
        var hit = [];
        for (var j = 0; j < l.length && hit.length < 200; j++) { var s = ""; try { s = nk(JSON.stringify(limpio(l[j], 1))); } catch (e) { s = ""; } if (w.every(function (q) { return s.indexOf(q) >= 0; })) hit.push(l[j]); }
        if (hit.length) res.push({ coleccion: k, coincidencias: hit.length + (hit.length >= 200 ? "+" : ""), primeros: hit.slice(0, 6).map(function (x) { return { id: x.id || x.uid || x.codigo || "", que: et(x), fecha: x.fecha || tsAFecha(x.ts || x.creado) || "" }; }) });
        else nada.push(k);
      }
      var ob = []; try { ob = buscarObras(a.texto).slice(0, 3).map(function (x) { return Object.assign(fichaObra(x.o), { puntaje: x.p }); }); } catch (e) { ob = []; }
      return { r: { buscado: a.texto, encontrado: res, obrasParecidas: ob, sinCoincidencias: nada, noMirado: sin.length ? sin.concat(["(las grandes se miran con profundo:true o con consultar y filtro)"]) : [], nota: "Para ver uno entero: leer_doc(coleccion, id) o consultar con filtro." } };
    };
    var visible = function (e) { if (!e || e.hidden) return false; var r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; var cs = getComputedStyle(e); return cs.display !== "none" && cs.visibility !== "hidden" && +cs.opacity !== 0; };
    var deIa = function (e) { return !!(e.closest && e.closest("#iaPanel, #iaFab, .ia-tab")); };
    function etiquetaDe(i) {
      var l = i.getAttribute("aria-label") || ""; if (!l && i.id) { var lb = document.querySelector('label[for="' + i.id + '"]'); if (lb) l = lb.textContent; }
      if (!l) { var p = i.closest("label"); if (p) l = p.textContent; } return String(l || i.placeholder || i.name || i.id || "").replace(/\s+/g, " ").trim().slice(0, 60);
    }
    H.ver_pantalla = function () {
      var vista = (document.body && document.body.dataset.vista) || "", vistas = [].slice.call(document.querySelectorAll('.wrap[id^="view"]')).filter(visible);
      var capas = [].slice.call(document.querySelectorAll('.v7-ov, [role="dialog"], .pf-modal, .hr-modal, #hojaOv, #emaCam, #menuLateral.abierto, #menuLateral.open')).filter(function (e) { return visible(e) && !deIa(e); });
      capas = capas.filter(function (e) { return !capas.some(function (o) { return o !== e && o.contains(e); }); });
      var raiz = capas.length ? capas[capas.length - 1] : vistas[0] || document.body;
      var txt = String(raiz.innerText || raiz.textContent || "").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
      var campos = [].slice.call(raiz.querySelectorAll("input, select, textarea")).filter(function (i) { return visible(i) && !deIa(i) && i.type !== "hidden" && i.type !== "file"; }).slice(0, 80).map(function (i) {
        var v = i.tagName === "SELECT" ? (i.selectedOptions && i.selectedOptions[0] ? i.selectedOptions[0].textContent.trim() : i.value) : i.type === "checkbox" || i.type === "radio" ? (i.checked ? "sí" : "no") : i.value;
        return { campo: etiquetaDe(i), valor: String(v == null ? "" : v).slice(0, 120) };
      }).filter(function (x) { return x.campo || x.valor; });
      var botones = [].slice.call(raiz.querySelectorAll("button, [role=button], a.btn-primary, a.btn-ghost")).filter(function (b) { return visible(b) && !deIa(b); }).map(function (b) { return String(b.textContent || b.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 50); }).filter(Boolean);
      var sub = [].slice.call(document.querySelectorAll(".subtab.active, .subtab.activo, .subtab.on, [aria-selected=true]")).filter(visible).map(function (b) { return b.textContent.replace(/\s+/g, " ").trim().slice(0, 40); }).slice(0, 4);
      var hdr = document.getElementById("hdrHoja");
      return { r: { vista: vista || "inicio", titulo: hdr ? hdr.textContent.replace(/\s+/g, " ").trim() : "", pestanaElegida: sub, encima: capas.map(function (e) { return e.id || e.className.toString().split(" ")[0]; }), mirando: raiz === document.body ? "la página" : raiz.id || raiz.className.toString().split(" ")[0], texto: txt.length > 14000 ? txt.slice(0, 14000) + "…(sigue)" : txt, campos: campos, botones: botones.slice(0, 50), nota: "Es lo que la persona tiene en la pantalla ahora (el panel del asistente no cuenta). Los datos de fondo, con las herramientas." } };
    };
    var DATO = {
      pedido_compras: { que: "pedido de compras sugerido (bajo mínimo + obras de los próximos días), por proveedor", ve: function () { return ve("stock"); }, f: function (a) { return window.__pedidoCompras.armar(parseInt(a.dias, 10) || 7); } },
      lista_compras: { que: "lista de compras del pañol (bajo mínimo y lo que se acabó)", ve: function () { return ve("stock"); }, f: function () { return comprasPorMinimo(); } },
      tablero_dueno: { que: "tablero del dueño (zona, certificado, plata, órdenes, ausencias, IA)", ve: function () { return ADM() || (window.__tableroDueno && window.__tableroDueno.puede && window.__tableroDueno.puede()); }, f: function () { return window.__tableroDueno.datos(); } },
      alertas: { que: "alertas del Mapa de guerra (material para mañana, obras trabadas, fotos dudosas, sin cerrar, gente sin tarea, fraguado, sin ubicación)", ve: function () { return ve("parte"); }, f: function () { return window.__mapaControl.alertas(); } },
      informe_semanal: { que: "informe de esta semana (módulos, obras, gente, pañol, fotos, lo que viene)", ve: function () { return ve("informe", "parte"); }, f: function () { var I = window.__informeSemanal; return I.armar(I.sem(I.lunesDe(hoy()))); } },
      documentacion: { que: "obras a las que les falta documentación y las terminadas al 100 %", ve: function () { return ve("avance", "registro"); }, f: function () { var D = window.__docObra; return { faltaDocumentacion: D.lista("faltadoc").map(function (o) { return { obra: o.nombre, ID: o.obraId || "", pct: D.pct(o), falta: (D.estado(o).falta || []) }; }), terminadas: D.lista("term100").map(function (o) { return { obra: o.nombre, ID: o.obraId || "", fecha100: (D.fecha100(o) || {}).fecha || "sin dato" }; }) }; } },
      material_contra_avance: { que: "material entregado contra lo que pide el avance (🟢🟡🔴) de una obra", ve: function () { return ve("stock", "avance"); }, obra: true, f: function (a, o) { return window.__matAvance.deObra(o); } },
      sin_tarea: { que: "gente sin tarea un día", ve: function () { return ve("parte"); }, f: function (a) { return window.__sinTarea.paraIa(fechaDe(a.fecha || "hoy") || hoy()); } },
      armadas: { que: "luminarias armadas del pañol (recetas, armadas listas)", ve: function () { return ve("stock"); }, f: function () { return window.__armadas.paraIa(); } },
      fotos_en_el_celu: { que: "fotos y archivos esperando en ESTE aparato y por qué (señal, cupo, permiso)", ve: function () { return true; }, f: function () { return { fotos: window.__fotoBandeja ? window.__fotoBandeja.estado() : null, senal: window.__senalReal ? window.__senalReal.estado() : null, archivos: window.__archivosNube && window.__archivosNube.estado ? window.__archivosNube.estado() : null }; } },
      lecturas: { que: "lecturas de la base de este aparato hoy (cupo de Firebase)", ve: function () { return true; }, f: function () { return window.__lecturas ? window.__lecturas.texto() : "sin contador"; } },
      gasto_asistente: { que: "lo gastado en el asistente (hoy y el mes)", ve: function () { return AO(); }, f: function () { return { texto: window.__iaGastoTexto ? window.__iaGastoTexto() : "", uso: window.__iaUso && window.__iaUso.estado ? window.__iaUso.estado() : null }; } },
      version: { que: "versión de la app de este aparato", ve: function () { return true; }, f: function () { var m = document.querySelector('meta[name="ema-version"]'); return { version: m ? m.content : "", apk: !!window.__cargador, pantalla: innerWidth + "×" + innerHeight }; } }
    };
    H.dato_app = async function (a) {
      a = a || {}; var k = String(a.cual || "").trim(), D = DATO[k];
      if (!D) return { err: "dato_app tiene: " + Object.keys(DATO).join(", ") + "." };
      if (!D.ve()) return { err: "Tu usuario no tiene permiso para ver eso." };
      var o = null; if (D.obra) { var ro = resolverObra(a.obra); if (ro.err) return { err: ro.err, r: ro.candidatos ? { candidatos: ro.candidatos } : null }; o = ro.obra; }
      var v; try { v = await D.f(a, o); } catch (e) { return { err: "Ese módulo no está listo en este aparato (" + String((e && e.message) || e).slice(0, 80) + ")." }; }
      var x = hondo(v), s = corto(x, 28000);
      return { r: { cual: k, que: D.que, datos: s.length >= 28000 ? s : x } };
    };
    TOOLS.push(
      { name: "leer_doc", description: "Lee UN documento entero de la base, de CUALQUIER colección que la persona puede ver (ordenesTrabajo, avanceObras, reservas, movimientos, catalogoProductos, herramientas, usuarios, adjuntos, fotosObra, auditoria, avisosCuadrilla, proyectos, planosObra, planosNotas, cierresQuincena, gastosObra, historialCalculos, configEquipo con id personal/baremo/precios/reinicios/ubicacion/cuadrillas/guias/salud/alias…). El id puede ser el número (OT-…, R-…, S-…/E-…), el código del producto, el código de la herramienta o el nombre de la obra. Solo lee.", input_schema: S({ coleccion: TXT("colección real o clave de consultar"), id: TXT("id, número, código o nombre") }, ["coleccion", "id"]) },
      { name: "buscar_en_todo", description: "Busca un texto (nombre de persona u obra, número, código, patente, palabra) en TODAS las colecciones que la persona puede ver y dice dónde aparece (colección, cuántas, las primeras con su id). profundo:true también mira adjuntos, fotos y auditoría (más lento). Usala antes de decir que algo no está.", input_schema: S({ texto: TXT("lo que hay que buscar"), profundo: { type: "boolean" } }, ["texto"]) },
      { name: "ver_pantalla", description: "Lo que la persona está mirando AHORA en la app: la pantalla, la pestaña elegida, la ventana abierta encima, todo el texto visible, los campos con su valor y los botones. Usala para «¿qué es esto?», «¿por qué dice…?», «¿está bien lo que cargué?», «esta pantalla».", input_schema: S({}) },
      { name: "dato_app", description: "Lo que calculan los módulos de la app (solo lee): pedido_compras (dias), lista_compras, tablero_dueno, alertas (Mapa de guerra), informe_semanal, documentacion, material_contra_avance (obra), sin_tarea (fecha), armadas, fotos_en_el_celu, lecturas, gasto_asistente, version.", input_schema: S({ cual: { type: "string", enum: Object.keys(DATO) }, obra: TXT("obra (para material_contra_avance)"), fecha: TXT("fecha (sin_tarea)"), dias: { type: "integer" } }, ["cual"]) }
    );
    Object.assign(ESTADOS, { leer_doc: "📄 Leyendo el documento…", buscar_en_todo: "🔎 Buscando en todo…", ver_pantalla: "👀 Mirando tu pantalla…", dato_app: "🧮 Pidiéndole el dato a la app…", proponer_accion: "📝 Preparando el cambio…" });
    Object.assign(MIRO, { leer_doc: ["Base"], buscar_en_todo: ["Todo"], ver_pantalla: ["Tu pantalla"], dato_app: ["App"], proponer_accion: ["App"] });

    // ================================================================= 3) acciones que faltaban (tarjeta + «Sí»; lo delicado, dos veces)
    var yoMail = function () { return String((window.__fbUser || {}).email || ""); };
    var hoyF = function (f) { return fechaDe(f || "hoy") || hoy(); };
    async function herrLista() { var l = DATOS.herramientas.lista() || []; if (!l.length) l = (await cargar("herramientas")).l; return l; }
    function herrDe(l, ref) { var q = nk(ref); return l.find(function (x) { return String(x.id) === String(ref) || nk(x.codigo) === q; }) || (function () { var m = l.filter(function (x) { return nk(x.nombre).indexOf(q) >= 0; }); return m.length === 1 ? m[0] : null; })(); }
    var RES_TX = { aprobar: ["solicitada"], alistar: ["pendiente"], lista: ["pendiente", "alistando"], rechazar: ["solicitada", "pendiente"], anular: ["solicitada", "pendiente", "alistando", "lista"], cerrar: ["pendiente", "alistando", "lista"] };
    var ROLES = ["admin", "oficina", "panol", "cuadrilla", "operario", "mirar", "direccion"];
    var ICONOS = ["arbol", "casas", "estrella", "tablero", "columna", "luminaria", "pozo", "cruce", "poda", "material", "panol", "obrador", "problema", "foto", "contacto", "punto"];
    function quincena(t) {
      var Q = window.__quincenas; if (!Q) return null; var q = Q.qDe(hoy()), p = nk(t || "actual");
      if (p === "anterior") q = Q.qMover(q, -1); else { var m = String(t || "").match(/^(\d{4})-(\d{1,2})-([12])$/); if (m) q = { y: +m[1], m: +m[2], n: +m[3] }; }
      return Q.qInfo(q);
    }
    var ACC = {
      reserva: { que: "cambiar el estado de una reserva R-… (aprobar, alistar, lista, rechazar, anular, cerrar)", puede: function () { return edita("stock") || edita("parte"); },
        plan: function (a) {
          var r = reservasL().find(function (x) { return String(x.numero || "") === String(a.reserva) || String(x.id) === String(a.reserva); }); if (!r) return { err: "No encontré la reserva «" + a.reserva + "»." };
          var q = String(a.estado || ""); if (!RES_TX[q]) return { err: "estado: aprobar, alistar, lista, rechazar, anular o cerrar." };
          if (RES_TX[q].indexOf(r.estado) < 0) return { err: (r.numero || "La reserva") + " está «" + r.estado + "»: no se puede " + q + "." };
          var nuevo = { aprobar: "pendiente", alistar: "alistando", lista: "lista", rechazar: "rechazada", anular: "anulada", cerrar: "entregada" }[q];
          return { titulo: "📦 Reserva " + (r.numero || ""), sub: (r.plazaNombre || "") + (r.para ? " · para " + r.para : ""), filas: [{ c: "estado", a: r.estado, d: nuevo }], ref: r.id, args: { id: r.id, q: q, nuevo: nuevo, motivo: a.motivo || "", antes: r.estado }, peligro: q === "anular" || q === "cerrar" ? (q === "anular" ? "Anular la reserva libera el material apartado y no se vuelve atrás." : "Cerrar la reserva deja sin entregar lo que falta.") : "" };
        },
        hacer: async function (x) {
          var r = reservasL().find(function (y) { return String(y.id) === x.id; }); if (!r) throw new Error("la reserva ya no está");
          if (r.estado !== x.antes) throw new Error("la reserva cambió mientras tanto (ahora está «" + r.estado + "»)");
          var txt = { aprobar: "Aprobada: material apartado", alistar: "Empezó a alistar", lista: "Lista para retirar", rechazar: "Rechazada" + (x.motivo ? ": " + x.motivo : ""), anular: "Anulada" + (x.motivo ? ": " + x.motivo : ""), cerrar: "Cerrada sin entregar el resto" }[x.q] + " (Asistente)";
          var p = { estado: x.nuevo, historial: (Array.isArray(r.historial) ? r.historial : []).concat([{ ts: Date.now(), por: yoNombre(), txt: txt }]) };
          if (x.q === "aprobar") Object.assign(p, { aprobadaPor: yoNombre(), aprobadaTs: Date.now() });
          if (x.q === "rechazar") p.motivo = x.motivo || "";
          if (x.q === "cerrar") p.cerradaIncompleta = true;
          await window.fbReservaActualizar(x.id, p);
          return { txt: "✅ Reserva " + (r.numero || "") + ": " + x.nuevo + ".", antes: { estado: x.antes }, despues: { estado: x.nuevo } };
        } },
      herramienta: { que: "herramientas H-…: asignar, pasar, devolver, a reparar, reparada, baja, reactivar", puede: function () { return edita("stock"); },
        plan: async function (a) {
          var h = herrDe(await herrLista(), a.herramienta || ""); if (!h) return { err: "No encontré la herramienta «" + a.herramienta + "» (decí el código H-…)." };
          var q = String(a.que || ""), as = h.asignada && h.asignada.persona ? h.asignada.persona : "", est = h.estado || "ok";
          if (["asignar", "pasar", "devolver", "reparacion", "reparada", "baja", "reactivar"].indexOf(q) < 0) return { err: "que: asignar, pasar, devolver, reparacion, reparada, baja o reactivar." };
          if ((q === "asignar" || q === "pasar") && !a.persona) return { err: "¿A quién?" };
          if (q === "asignar" && as) return { err: h.codigo + " ya la tiene " + as + ": usá «pasar» o «devolver»." };
          if ((q === "devolver" || q === "pasar") && !as) return { err: h.codigo + " no está asignada a nadie." };
          var pers = a.persona ? personaDe(a.persona) : null; if (a.persona && pers.err) return { err: pers.err };
          var nom = pers ? pers.p.nombre : "", queda = q === "devolver" ? (/rep/.test(nk(a.queda)) ? "reparacion" : /baja|perd|rob/.test(nk(a.queda)) ? "baja" : "ok") : "";
          var dE = q === "asignar" || q === "pasar" ? "a cargo de " + nom : q === "devolver" ? (queda === "ok" ? "libre" : queda === "reparacion" ? "en reparación" : "de baja") : q === "reparacion" ? "en reparación" : q === "baja" ? "de baja" : "libre";
          return { titulo: "🧰 " + (h.codigo || "") + " · " + (h.nombre || ""), sub: as ? "hoy la tiene " + as : "hoy: " + est, filas: [{ c: "queda", a: as ? "a cargo de " + as : est, d: dE }], ref: h.id, peligro: q === "baja" ? "Dar de baja una herramienta la saca de las que están en uso." : "", args: { id: h.id, q: q, persona: nom, estado: a.estado || "buena", queda: queda, causa: a.causa || "", nota: a.nota || "" } };
        },
        hacer: async function (x) {
          var h = herrDe(await herrLista(), x.id); if (!h) throw new Error("la herramienta ya no está");
          var db = firebase.firestore(), f = db.collection("herramientas").doc(x.id), u = Date.now(), as = h.asignada && h.asignada.persona ? h.asignada.persona : "";
          var mov = function (t) { return db.collection("herramientasMov").add(Object.assign({ herr: h.id, codigo: h.codigo || "", nombre: h.nombre || "", ts: Date.now(), fecha: hoy(), por: yoNombre(), porEmail: yoMail(), porAsistente: true }, t)); };
          if (x.q === "pasar") await mov({ tipo: "devolucion", persona: as, estado: "bien", nota: "Pasó a " + x.persona });
          if (x.q === "asignar" || x.q === "pasar") { await f.update({ asignada: { persona: x.persona, personaClave: claveDe(x.persona), desde: u, estadoEntrega: x.estado, nota: x.nota, por: yoNombre() }, estado: "ok", act: u }); await mov({ tipo: "entrega", persona: x.persona, estado: x.estado, nota: (x.q === "pasar" ? "Se la pasó " + as + ". " : "") + x.nota }); }
          if (x.q === "devolver") { await f.update({ asignada: null, estado: x.queda, bajaMotivo: x.queda === "baja" ? x.causa || "De baja" : "", act: u }); await mov({ tipo: "devolucion", persona: as, estado: x.queda === "ok" ? "bien" : x.queda, nota: x.nota }); }
          if (x.q === "reparacion") { await f.update({ estado: "reparacion", act: u }); await mov({ tipo: "reparacion", nota: x.nota }); }
          if (x.q === "reparada" || x.q === "reactivar") { await f.update({ estado: "ok", bajaMotivo: "", act: u }); await mov({ tipo: x.q, nota: x.nota }); }
          if (x.q === "baja") { await f.update({ estado: "baja", bajaMotivo: x.causa || "De baja", asignada: null, act: u }); await mov({ tipo: "baja", causa: x.causa || "De baja", nota: x.nota }); }
          Object.keys(CACHE).forEach(function (k) { if (/^herramientas/.test(k)) delete CACHE[k]; });
          return { txt: "✅ " + (h.codigo || "Herramienta") + ": hecho (" + x.q + ").", antes: { asignada: as, estado: h.estado || "ok" }, despues: { q: x.q, persona: x.persona } };
        } },
      gasto: { que: "cargar un gasto de obra o general (como Gastos › Por obra / Generales)", puede: function () { return edita("gastos"); },
        plan: function (a) {
          var C = (window.GASTOS && window.GASTOS.CATS) || [], cq = nk(a.categoria || ""), cat = C.find(function (c) { return nk(c.id) === cq || nk(c.txt) === cq; }) || C.find(function (c) { return cq && (nk(c.txt).indexOf(cq) >= 0 || nk(c.id).indexOf(cq) >= 0); });
          if (!cat) return { err: "Categoría: " + C.map(function (c) { return c.txt + " (" + c.id + ")"; }).join(", ") + "." };
          var o = null; if (a.obra) { var ro = resolverObra(a.obra); if (ro.err) return { err: ro.err, r: ro.candidatos ? { candidatos: ro.candidatos } : null }; o = ro.obra; }
          var cant = a.cantidad == null || a.cantidad === "" ? null : num(a.cantidad), pu = num(a.precio_unitario), imp = num(a.importe); if (!(imp > 0) && cant != null && pu > 0) imp = cant * pu;
          if (!String(a.detalle || "").trim()) return { err: "Falta el detalle del gasto." }; if (!(imp > 0)) return { err: "Falta el importe (o cantidad × precio unitario)." };
          var g = { cat: cat.id, fecha: hoyF(a.fecha), desc: String(a.detalle).trim(), cant: cant, un: String(a.unidad || "").trim(), pu: pu, importe: r2(imp), proveedor: String(a.proveedor || "").trim(), comprobante: String(a.comprobante || "").trim(), item: "", obs: String(a.obs || "").trim(), plazaId: o ? String(o.id) : "", plazaNombre: o ? o.nombre || "" : "", obraId: o ? String(o.obraId || "") : "", general: !o };
          return { titulo: "💸 Gasto nuevo", sub: o ? o.nombre : "Gasto general", filas: [{ c: "categoría", a: "—", d: cat.txt }, { c: "detalle", a: "—", d: g.desc }, { c: "importe", a: "—", d: "$ " + fN(g.importe) + " (sin IVA)" }, { c: "fecha", a: "—", d: g.fecha }].concat(g.proveedor ? [{ c: "proveedor", a: "—", d: g.proveedor }] : []), args: { g: g } };
        },
        hacer: async function (x) { var id = await window.fbGastoAdd(Object.assign({}, x.g, { usuario: yoMail(), ts: Date.now(), porAsistente: true })); return { ref: id, txt: "✅ Gasto guardado ($ " + fN(x.g.importe) + ").", despues: x.g }; } },
      obra_nueva: { que: "registrar una obra nueva (como Registrar obra)", puede: function () { return edita("registro"); },
        plan: function (a) {
          var n = String(a.nombre || "").trim(); if (!n) return { err: "Falta el nombre de la obra." };
          if (obras().some(function (o) { return String(o.nombre || "").trim().toLowerCase() === n.toLowerCase(); })) return { err: "Ya hay una obra registrada con ese nombre: no se da de alta otra vez." };
          var t = /barr/.test(nk(a.tipo)) ? "barrio" : /otra/.test(nk(a.tipo)) ? "otra" : "plaza";
          var r = { nombre: n, tipoObra: t, obraId: String(a.ID || "").trim(), barrio: String(a.barrio || "").trim(), direccion: String(a.direccion || "").trim(), lat: a.lat != null && a.lat !== "" ? num(a.lat) : null, lng: a.lng != null && a.lng !== "" ? num(a.lng) : null };
          return { titulo: "🏗 Obra nueva", sub: n, filas: [{ c: "tipo", a: "—", d: t }, { c: "ID del pliego", a: "—", d: r.obraId || "—" }, { c: "barrio", a: "—", d: r.barrio || "—" }, { c: "dirección", a: "—", d: r.direccion || "—" }, { c: "ubicación", a: "—", d: r.lat != null ? r.lat + ", " + r.lng : "sin cargar (se marca en el mapa)" }], args: { r: r } };
        },
        hacer: async function (x) {
          var r = Object.assign({}, x.r, { creado: hoy(), estado: "Pendiente", secciones: [{ titulo: "OTROS ÍTEMS (agregados a mano)", items: [], extra: true }], valorItems: [], grupos: [], etapas: {}, fechaEncendido: "", listaParaEncender: false });
          if (obras().some(function (o) { return String(o.nombre || "").trim().toLowerCase() === r.nombre.toLowerCase(); })) throw new Error("ya hay una obra con ese nombre");
          var id = await window.fbAvanceCrear(r);
          try { if (typeof avanceObras != "undefined" && !avanceObras.some(function (o) { return o.id === id; })) avanceObras.push(Object.assign({}, r, { id: id })); } catch (e) { }
          ["renderAvanceTablero", "poblarParteObraDatalist", "poblarOtPlazas", "poblarHistPlazas"].forEach(function (f) { try { typeof window[f] == "function" && window[f](); } catch (e) { } });
          return { ref: id, txt: "✅ Obra «" + r.nombre + "» registrada.", despues: x.r };
        } },
      archivar_obra: { que: "archivar (ocultar) o volver a mostrar una obra", puede: function () { return edita("registro") || edita("avance"); },
        plan: function (a) { var ro = resolverObra(a.obra); if (ro.err) return { err: ro.err, r: ro.candidatos ? { candidatos: ro.candidatos } : null }; var o = ro.obra, ar = a.archivar !== false; if (!!o.oculta === ar) return { err: "Ya está " + (ar ? "archivada" : "a la vista") + "." }; return { titulo: ar ? "🗄 Archivar obra" : "👁 Volver a mostrar obra", sub: o.nombre, filas: [{ c: "estado", a: o.oculta ? "archivada" : "a la vista", d: ar ? "archivada" : "a la vista" }], args: { id: o.id, ar: ar } }; },
        hacer: async function (x) { await window.fbAvanceCampos(x.id, x.ar ? { oculta: true, ocultaTs: Date.now(), ocultaPor: yoMail() } : { oculta: false, mostradaTs: Date.now() }); return { ref: x.id, txt: x.ar ? "✅ Obra archivada (está en «🗄 Archivadas»)." : "✅ Obra a la vista otra vez." }; } },
      borrar_obra: { que: "BORRAR una obra registrada por error (solo Administración y solo si no tiene nada cargado)", puede: function () { return ADM(); },
        plan: function (a) {
          var ro = resolverObra(a.obra); if (ro.err) return { err: ro.err, r: ro.candidatos ? { candidatos: ro.candidatos } : null }; var o = ro.obra, id = String(o.id);
          var tiene = []; var n1 = ots().filter(function (t) { return String(t.plazaId || "") === id; }).length; if (n1) tiene.push(n1 + " órdenes");
          var n2 = movs().filter(function (m) { return String(m.plazaId || "") === id; }).length; if (n2) tiene.push(n2 + " movimientos del pañol");
          var n3 = reservasL().filter(function (m) { return String(m.plazaId || "") === id; }).length; if (n3) tiene.push(n3 + " reservas");
          var n4 = gastosL().filter(function (m) { return String(m.plazaId || "") === id; }).length; if (n4) tiene.push(n4 + " gastos");
          if ((o.valorItems || []).some(function (r) { return num(r.cantidadAvanzada) > 0; })) tiene.push("avance cargado");
          if (tiene.length) return { err: "No la borro: tiene " + tiene.join(", ") + ". Si no se usa más, archivala (archivar_obra)." };
          return { titulo: "🗑 BORRAR la obra", sub: o.nombre + (o.obraId ? " · ID " + o.obraId : ""), filas: [{ c: "obra", a: o.nombre, d: "borrada" }], args: { id: id, nombre: o.nombre }, peligro: "Borrar la obra no se puede deshacer (queda anotado en la auditoría)." };
        },
        hacer: async function (x) { await window.fbAvanceEliminar(x.id); return { ref: x.id, txt: "✅ Obra «" + x.nombre + "» borrada." }; } },
      usuario: { que: "usuarios (solo Administración): confirmar, rol, activo, nombre, vincular con la persona de la nómina", puede: function () { return ADM(); },
        plan: function (a) {
          var q = nk(a.usuario), u = usuariosL().find(function (x) { return nk(x.usuario) === q || nk(x.nombre) === q || String(x.email || "").toLowerCase() === String(a.usuario || "").toLowerCase() || String(x.uid || x.id) === a.usuario; });
          if (!u) { var m = usuariosL().filter(function (x) { return q && (nk(x.nombre).indexOf(q) >= 0 || nk(x.usuario).indexOf(q) >= 0); }); if (m.length === 1) u = m[0]; else return { err: m.length ? "Puede ser: " + m.map(function (x) { return x.nombre || x.usuario; }).join(", ") + "." : "No encontré el usuario «" + a.usuario + "»." }; }
          var uid = String(u.uid || u.id || ""), p = {}, filas = [], pel = [];
          if (a.rol != null && a.rol !== "") { var r = nk(a.rol); r = { pañol: "panol", panol: "panol", administracion: "admin", administrador: "admin", "solo mirar": "mirar", direccion: "direccion" }[r] || r; if (ROLES.indexOf(r) < 0) return { err: "Roles: " + ROLES.join(", ") + "." }; if (r !== u.rol) { p.rol = r; filas.push({ c: "rol", a: u.rol, d: r }); pel.push("cambia el rol (lo que ve y puede hacer)"); } }
          if (a.activo != null && (a.activo === false) !== (u.activo === false)) { p.activo = a.activo !== false; filas.push({ c: "activo", a: u.activo !== false, d: p.activo }); if (!p.activo) pel.push("lo desactiva (no entra más)"); }
          if (a.confirmar && u.pendiente) { p.pendiente = false; filas.push({ c: "confirmado", a: "a confirmar", d: "sí" }); }
          if (a.nombre && a.nombre !== u.nombre) { p.nombre = String(a.nombre).trim(); filas.push({ c: "nombre", a: u.nombre, d: p.nombre }); }
          if (a.persona) { var pe = personaDe(a.persona); if (pe.err) return { err: pe.err }; if (pe.p.nombre !== u.persona) { p.persona = pe.p.nombre; p.personaClave = claveDe(pe.p.nombre); filas.push({ c: "persona de la nómina", a: u.persona || "—", d: p.persona }); } }
          if (!filas.length) return { err: "No hay ningún cambio: ya está así." };
          if (uid === String((window.__fbUser || {}).uid || "") && (p.rol && p.rol !== "admin" || p.activo === false)) return { err: "No te saco Administración ni te desactivo a vos mismo." };
          return { titulo: "👤 Usuario " + (u.usuario || u.nombre || ""), sub: (u.nombre || "") + " · " + (ROL_TXT[u.rol] || u.rol || ""), filas: filas, args: { uid: uid, p: p }, peligro: pel.length ? "Esto " + pel.join(" y ") + "." : "" };
        },
        hacer: async function (x) { await firebase.firestore().collection("usuarios").doc(x.uid).update(Object.assign({}, x.p, { actualizado: Date.now(), actualizadoPor: yoMail() })); return { ref: x.uid, txt: "✅ Usuario actualizado.", despues: x.p }; } },
      punto_mapa: { que: "agregar un punto al mapa (tablero, pozo, problema, acopio…)", puede: function () { return edita("mapa") || edita("avance") || edita("registro"); },
        plan: function (a) {
          var o = null; if (a.obra) { var ro = resolverObra(a.obra); if (ro.err) return { err: ro.err, r: ro.candidatos ? { candidatos: ro.candidatos } : null }; o = ro.obra; }
          var lat = a.lat != null && a.lat !== "" ? num(a.lat) : o && o.lat != null ? num(o.lat) : null, lng = a.lng != null && a.lng !== "" ? num(a.lng) : o && o.lng != null ? num(o.lng) : null;
          if (!String(a.nombre || "").trim()) return { err: "Falta el nombre del punto." }; if (lat == null || lng == null) return { err: "Falta la ubicación (lat/lng, o una obra con ubicación)." };
          var ic = ICONOS.indexOf(nk(a.icono)) >= 0 ? nk(a.icono) : "punto";
          var d = { nombre: String(a.nombre).trim(), nota: String(a.nota || "").trim(), icono: ic, color: "", lat: lat, lng: lng, plazaId: o ? String(o.id) : "", plazaNombre: o ? o.nombre || "" : "", fotoId: "" };
          return { titulo: "📍 Punto nuevo en el mapa", sub: d.nombre, filas: [{ c: "ícono", a: "—", d: ic }, { c: "lugar", a: "—", d: lat + ", " + lng + (o ? " (" + o.nombre + ")" : "") }].concat(d.nota ? [{ c: "nota", a: "—", d: d.nota }] : []), args: { d: d } };
        },
        hacer: async function (x) { var y = yoNombre(), id = (await firebase.firestore().collection("mapaPuntos").add(Object.assign({}, x.d, { editado: Date.now(), editadoPor: y, ts: Date.now(), por: y, porEmail: yoMail() }))).id; return { ref: id, txt: "✅ Punto «" + x.d.nombre + "» agregado al mapa." }; } },
      documento: { que: "documentación de una obra: planilla de PAT o certificado «lo tengo en papel»", puede: function () { return !!(window.__docObra && window.__docObra.puedeCargar && window.__docObra.puedeCargar()); },
        plan: function (a) {
          var ro = resolverObra(a.obra); if (ro.err) return { err: ro.err, r: ro.candidatos ? { candidatos: ro.candidatos } : null }; var o = ro.obra, k = /cert/.test(nk(a.doc)) ? "cert" : /pat/.test(nk(a.doc)) ? "pat" : "";
          if (!k) return { err: "doc: pat (planilla de PAT) o cert (certificado de instalación apta). La carpeta EPEC va con proponer_editar_obra; los archivos se suben desde el legajo." };
          var ya = o.documentos && o.documentos[k]; return { titulo: "📄 Documentación · " + (k === "pat" ? "Planilla de PAT" : "Certificado de instalación apta"), sub: o.nombre, filas: [{ c: "estado", a: ya && ya.ok ? (ya.papel ? "en papel" : "cargado") : "falta", d: "lo tienen en papel" + (a.nota ? " (" + a.nota + ")" : "") }], args: { id: o.id, k: k, fecha: hoyF(a.fecha), nota: String(a.nota || "").trim() } };
        },
        hacer: async function (x) { await window.__docObra.guardarDoc(x.id, x.k, { fecha: x.fecha, papel: true, nota: x.nota || undefined }); return { ref: x.id, txt: "✅ Documentación guardada (en papel)." }; } },
      aviso_cuadrilla: { que: "«📨 Para resolver»: marcar un aviso de la cuadrilla como visto o resuelto, con respuesta (le llega al celu)", puede: function () { return AO(); },
        plan: async function (a) {
          var PR = window.__paraResolver; if (!PR) return { err: "«Para resolver» no está en esta versión." }; try { await PR.cargar(); } catch (e) { }
          var l = PR.lista(), q = nk(a.aviso), x = l.find(function (y) { return y.id === a.aviso; }) || (function () { var m = l.filter(function (y) { return q && nk(y.texto + " " + y.nombre + " " + y.persona).indexOf(q) >= 0; }); return m.length === 1 ? m[0] : null; })();
          if (!x) return { err: "No encontré ese aviso (pedí consultar avisosCuadrilla para ver el id)." };
          var es = /resu/.test(nk(a.estado)) ? "resuelto" : "visto";
          return { titulo: "📨 Aviso de " + (x.nombre || x.persona || ""), sub: String(x.texto || "").slice(0, 80), filas: [{ c: "estado", a: x.estado, d: es }].concat(a.respuesta ? [{ c: "respuesta (le llega al celu)", a: "—", d: a.respuesta }] : []), args: { id: x.id, es: es, resp: String(a.respuesta || "") } };
        },
        hacer: async function (x) { var r = await window.__paraResolver.marcar(x.id, x.es, x.resp); if (r && r.err) throw new Error(r.err); return { ref: x.id, txt: "✅ Aviso " + x.es + "." + (x.resp ? " La respuesta le llega al celu." : "") }; } },
      ausencia: { que: "anotar una ausencia (franco, vacaciones, licencia, enfermo, otro)", puede: function () { return edita("produccion") || edita("parte"); },
        plan: function (a) {
          var pe = personaDe(a.persona || ""); if (pe.err) return { err: pe.err };
          var mot = ["franco", "vacaciones", "licencia", "enfermo", "otro"].find(function (m) { return nk(a.motivo).indexOf(m.slice(0, 5)) === 0; }) || "otro", d = hoyF(a.desde), h = fechaDe(a.hasta || "") || d;
          if (h < d) return { err: "«hasta» es antes que «desde»." };
          return { titulo: "🗓 Ausencia", sub: pe.p.nombre, filas: [{ c: "motivo", a: "—", d: mot }, { c: "desde", a: "—", d: d }, { c: "hasta", a: "—", d: h }].concat(a.nota ? [{ c: "nota", a: "—", d: a.nota }] : []), args: { x: { id: "au" + Date.now().toString(36), persona: pe.p.nombre, motivo: mot, desde: d, hasta: h, nota: String(a.nota || "") } } };
        },
        hacer: async function (x) { var P = window.__personalNube || {}, l = (Array.isArray(P.ausencias) ? P.ausencias : []).concat([Object.assign({}, x.x, { por: yoNombre(), ts: Date.now(), porAsistente: true })]); await window.fbPersonalGuardar({ ausencias: l, ts: Date.now(), usuario: yoMail() }); window.__personalNube = Object.assign({}, window.__personalNube || {}, { ausencias: l }); return { txt: "✅ Ausencia anotada: " + x.x.persona + " (" + x.x.motivo + ") del " + x.x.desde + " al " + x.x.hasta + "." }; } },
      contacto: { que: "agregar o cambiar un contacto de la oficina (para «Llamar a la oficina»)", puede: function () { return edita("produccion") || edita("parte"); },
        plan: function (a) {
          var n = String(a.nombre || "").trim(); if (!n) return { err: "Falta el nombre." }; var P = window.__personalNube || {}, l = Array.isArray(P.contactos) ? P.contactos : [], i = l.findIndex(function (c) { return nk(c.nombre) === nk(n); }), v = i >= 0 ? l[i] : {};
          var c = { nombre: n, rol: /pan/.test(nk(a.rol)) ? "panol" : /adm/.test(nk(a.rol)) ? "admin" : a.rol ? "oficina" : v.rol || "oficina", tel: String(a.tel != null ? a.tel : v.tel || "").trim(), email: String(a.email != null ? a.email : v.email || "").trim() };
          return { titulo: i >= 0 ? "📞 Cambiar contacto" : "📞 Contacto nuevo", sub: n, filas: [{ c: "rol", a: v.rol || "—", d: c.rol }, { c: "teléfono", a: v.tel || "—", d: c.tel || "—" }], args: { c: c, i: i } };
        },
        hacer: async function (x) { var P = window.__personalNube || {}, l = (Array.isArray(P.contactos) ? P.contactos : []).slice(), i = l.findIndex(function (c) { return nk(c.nombre) === nk(x.c.nombre); }); if (i >= 0) l[i] = Object.assign({}, l[i], x.c); else l.push(x.c); await window.fbPersonalGuardar({ contactos: l, ts: Date.now(), usuario: yoMail() }); window.__personalNube = Object.assign({}, window.__personalNube || {}, { contactos: l }); return { txt: "✅ Contacto guardado." }; } },
      quincena: { que: "cerrar o reabrir una quincena de puntos (Producción › Por quincena)", puede: function () { return AO() && edita("produccion"); },
        plan: function (a) {
          var Q = window.__quincenas; if (!Q || !Q.cerrarQ) return { err: "La quincena no se puede cerrar desde acá en esta versión." };
          var per = quincena(a.quincena); if (!per) return { err: "No entendí la quincena (actual, anterior o AAAA-MM-1/2)." };
          var c = (Q.cierres() || {})[per.key], cerrada = !!(c && c.estado !== "abierta"), q = /reab/.test(nk(a.que)) ? "reabrir" : "cerrar";
          if (q === "cerrar" && cerrada) return { err: "La " + per.label + " ya está cerrada." }; if (q === "reabrir" && !cerrada) return { err: "La " + per.label + " no está cerrada." };
          if (q === "reabrir" && !String(a.motivo || "").trim()) return { err: "Para reabrir hace falta el motivo (queda anotado)." };
          var av = [], d = null; if (q === "cerrar") { try { d = Q.datosDe(per); } catch (e) { d = null; } if (d) { if (!d.personas.length) av.push("No tiene puntos."); if (hoy() <= per.hasta) av.push("Todavía no terminó (termina el " + per.hasta + ")."); if (d.sinCerrar) av.push(d.sinCerrar + " orden(es) de estas fechas sin cerrar: no van a sumar."); } }
          var tot = d ? r2(d.personas.reduce(function (s, p) { return s + Q.pagar(p); }, 0)) : null;
          return { titulo: (q === "cerrar" ? "🔒 Cerrar la " : "🔓 Reabrir la ") + per.label, sub: per.rango, filas: [{ c: "quincena", a: cerrada ? "cerrada" : "abierta", d: q === "cerrar" ? "cerrada (foto fija)" : "abierta" }].concat(tot != null ? [{ c: "puntos", a: "—", d: fN(tot) + " de " + d.personas.length + " persona(s)" }] : []), avisos: av, args: { per: per, q: q, motivo: String(a.motivo || "").trim() }, peligro: q === "cerrar" ? "Cerrar la quincena deja los puntos fijos (lo que cambie después va como ajuste a la siguiente)." : "Reabrir la quincena deja que los puntos vuelvan a cambiar." };
        },
        hacer: async function (x) {
          var Q = window.__quincenas, cf = window.confirm, pr = window.prompt, ok;
          window.confirm = function () { return true; }; window.prompt = function () { return x.motivo + " (Asistente)"; };
          try { ok = x.q === "cerrar" ? await Q.cerrarQ(x.per) : await Q.reabrirQ(x.per); } finally { window.confirm = cf; window.prompt = pr; }
          if (!ok) throw new Error("la app no la " + (x.q === "cerrar" ? "cerró" : "reabrió"));
          return { ref: x.per.key, txt: "✅ " + x.per.label + (x.q === "cerrar" ? " cerrada." : " reabierta.") };
        } },
      borrar_fotos: { que: "BORRAR fotos (id de buscar_fotos / ver_fotos)", puede: function () { return edita("avance") || edita("registro"); },
        plan: async function (a) {
          var ids = (Array.isArray(a.ids) ? a.ids : []).map(String).filter(Boolean).slice(0, 60); if (!ids.length) return { err: "Faltan los id de las fotos (buscar_fotos)." };
          if (!String(a.motivo || "").trim()) return { err: "Decí por qué se borran (queda anotado)." };
          var por = {}, mal = [];
          for (var i = 0; i < ids.length; i++) { var L = null; try { L = window.__moverFoto && window.__moverFoto.localizar ? await window.__moverFoto.localizar(ids[i]) : null; } catch (e) { L = null; } var p = L && L.antes && L.antes.plazaId; if (!p) { mal.push(ids[i]); continue; } (por[p] = por[p] || []).push(String(L.adjId || ids[i])); }
          if (!Object.keys(por).length) return { err: "No encontré esas fotos." };
          var filas = Object.keys(por).map(function (p) { var o = obras().find(function (y) { return String(y.id) === p; }); return { c: (o && o.nombre) || p, a: por[p].length + " foto(s)", d: "borradas" }; });
          return { titulo: "🗑 Borrar " + (ids.length - mal.length) + " foto(s)", sub: a.motivo, filas: filas, avisos: mal.length ? ["No encontré " + mal.length + ": quedan como están."] : [], args: { por: por }, peligro: "Las fotos borradas no se recuperan desde la app." };
        },
        hacer: async function (x) { var n = 0; for (var p in x.por) { n += await window.fotosBorrar(x.por[p], p); } return { txt: "✅ " + n + " foto(s) borrada(s)." }; } },
      producto_alta: { que: "dar de alta un producto en el catálogo del pañol (el código lo elige la app: el siguiente libre de la familia, como «Guardar producto»)", puede: function () { return edita("stock"); },
        plan: function (a) {
          var fam = parseInt(String(a.familia || "").replace(/\D/g, "").slice(0, 1), 10); if (!(fam >= 1 && fam <= 9)) return { err: "familia: 1 cables · 2 borneras · 3 protección · 4 herrajes · 5 caños · 6 columnas/luminarias · 7 PAT · 8 obra civil · 9 varios." };
          var d = String(a.desc || "").trim(); if (!d) return { err: "Falta la descripción." }; if (typeof proximoCodigoCatalogo != "function") return { err: "El catálogo no está listo." };
          var cod = proximoCodigoCatalogo(fam * 1000); if (!cod) return { err: "Esa familia no tiene códigos libres." };
          var igual = catalogoL().filter(function (x) { return nk(x.desc) === nk(d) && x.activo !== false; });
          return { titulo: "📦 Producto nuevo " + cod, sub: d, filas: [{ c: "código (lo elige la app)", a: "—", d: cod }, { c: "unidad", a: "—", d: a.un || "Un." }, { c: "mínimo", a: "—", d: num(a.minimo) }, { c: "costo (sin IVA)", a: "—", d: num(a.costo) ? "$ " + fN(num(a.costo)) : "—" }], avisos: igual.length ? ["Ya hay un producto con esa descripción: " + igual.map(function (x) { return x.codigo; }).join(", ") + "."] : [], args: { fam: fam, n: { codigo: cod, desc: d, un: String(a.un || "Un.").trim() || "Un.", sector: "pañol", stock: 0, costo: num(a.costo), minimo: num(a.minimo), activo: true } } };
        },
        hacer: async function (x) { var cod = proximoCodigoCatalogo(x.fam * 1000); if (cod !== x.n.codigo) throw new Error("el código " + x.n.codigo + " ya no está libre (ahora el siguiente es " + cod + "): pedilo de nuevo"); await window.fbGuardarProductoCatalogo(Object.assign({}, x.n, { editadoPor: yoMail(), editadoTs: Date.now() })); return { ref: String(cod), txt: "✅ Producto " + cod + " — " + x.n.desc + " agregado al catálogo." }; } }
    };
    H.proponer_accion = async function (a) {
      a = a || {}; if (!puedeAcciones()) return SIN_ACC; if (!AO()) return { err: NO_VE };
      var A = ACC[String(a.accion || "")]; if (!A) return { err: "accion: " + Object.keys(ACC).join(", ") + "." };
      if (!A.puede()) return { err: "Tu usuario no puede hacer eso desde la app (" + A.que + ")." };
      var d = a.datos && typeof a.datos == "object" ? a.datos : {}; if (a.motivo && !d.motivo) d.motivo = a.motivo;
      var p = await A.plan(d); if (!p || p.err) return { err: (p && p.err) || "No se pudo armar.", r: p && p.r ? p.r : null };
      var P = nuevaProp("accion178", { accion: a.accion, args: p.args, coleccion: a.accion, id: String(p.ref || ""), titulo: p.titulo, sub: p.sub || "", filas: p.filas || [], avisos: (p.avisos || []).concat(p.peligro ? ["Delicado: " + p.peligro + " Te pido el «Sí» dos veces."] : []), peligro: p.peligro || "", motivo: String(a.motivo || d.motivo || "").slice(0, 200), pie: "Se hace por el mismo camino que la pantalla de la app y queda anotado en la auditoría." });
      return pendiente(P, p.peligro ? { instruccion: "La app ya le mostró la tarjeta. Es DELICADO: decile en una línea qué va a pasar y que confirme con «Sí» (la app le pide el Sí dos veces)." } : null);
    };
    GUARDAR.accion178 = async function (P) {
      var d = P.datos, A = ACC[d.accion]; if (!A) throw new Error("acción desconocida");
      if (!A.puede()) throw new Error("tu usuario ya no puede hacer eso");
      var g = await A.hacer(d.args); return { ref: g.ref || d.id || "", antes: g.antes || null, despues: g.despues || null, txt: g.txt, extra: "" };
    };
    TOOLS.push({ name: "proponer_accion", description: "PROPONE (NO hace) una acción de la app que no tiene herramienta propia; tarjeta con «Sí» (lo delicado, dos veces) y se hace por el mismo camino que la pantalla. accion + datos: " +
      "reserva {reserva: R-…, estado: aprobar|alistar|lista|rechazar|anular|cerrar, motivo} · herramienta {herramienta: H-…, que: asignar|pasar|devolver|reparacion|reparada|baja|reactivar, persona, estado, queda: libre|reparacion|baja, causa, nota} · gasto {obra (vacío = general), categoria, detalle, cantidad, unidad, precio_unitario, importe (sin IVA), proveedor, comprobante, fecha, obs} · obra_nueva {nombre, tipo plaza|barrio|otra, ID, barrio, direccion, lat, lng} · archivar_obra {obra, archivar true/false} · borrar_obra {obra} (solo Administración, solo si no tiene nada cargado) · usuario {usuario, rol, activo, confirmar, nombre, persona} (solo Administración) · punto_mapa {nombre, icono, lat, lng, obra, nota} · documento {obra, doc pat|cert, nota, fecha} («lo tengo en papel») · aviso_cuadrilla {aviso: id o texto, estado visto|resuelto, respuesta} · ausencia {persona, motivo franco|vacaciones|licencia|enfermo|otro, desde, hasta, nota} · contacto {nombre, rol, tel, email} · quincena {que cerrar|reabrir, quincena actual|anterior|AAAA-MM-1/2, motivo} · borrar_fotos {ids[], motivo} · producto_alta {familia 1–9, desc, un, minimo, costo} (el código lo elige la app).",
      input_schema: S({ accion: { type: "string", enum: Object.keys(ACC) }, datos: { type: "object", description: "los datos de esa acción (ver la descripción)" }, motivo: TXT("por qué (queda en la auditoría)") }, ["accion", "datos"]) });
    ACCIONES.push("proponer_accion");

    // ================================================================= 4) proponer_editar: más colecciones; lo delicado, dos veces
    Object.assign(EDITA, { cuadrillas: { col: "configEquipo", doc: "cuadrillas", hojas: ["parte"] }, guias: { col: "configEquipo", doc: "guias", hojas: ["parte", "registro", "produccion"] }, proyectos: { col: "proyectos", hojas: ["registro", "avance"] }, planosNotas: { col: "planosNotas", hojas: ["avance", "registro", "parte"] } });
    var ped0 = H.proponer_editar;
    H.proponer_editar = async function (a) {
      a = a || {}; var k = String(a.coleccion || "").trim();
      if (EDITA[k] && /^(guias|proyectos)$/.test(k) && !AO()) return { err: "Eso lo cambian Administración y Oficina." };
      if (AO() && BASE[k] && DATOS[k]) { var l = []; try { l = DATOS[k].lista() || []; } catch (e) { l = []; } if (!l.length) { var c = await cargar(k); if (c.err) return { err: "No pude leer «" + k + "» de la base: " + c.err + "." }; } }
      var r = ped0(a);
      if (r && r.prop && r.prop.datos) {
        var P = r.prop, pt = P.datos.patch || {}, pel = "";
        if (k === "reinicios") pel = "Cambia desde cuándo cuentan los puntos y los saldos (reiniciar puntos).";
        else if (k === "usuarios" && ("rol" in pt || pt.activo === false)) pel = "Cambia el rol o desactiva un usuario.";
        else if (k === "movimientos" && pt.anulado === true) pel = "Anular un movimiento cambia el stock.";
        else if (k === "catalogo" && pt.activo === false) pel = "Da de baja un producto del catálogo.";
        if (pel) { P.datos.peligro = pel; P.datos.avisos = (P.datos.avisos || []).concat(["Delicado: " + pel + " Te pido el «Sí» dos veces."]); }
      }
      return r;
    };
    var conf0 = confirmar;
    confirmar = async function (P, quiero, soloCargar, igual) {
      if (quiero && !soloCargar && P && P.estado === "pendiente" && P.datos && P.datos.peligro && !P.datos.peligroOk) {
        P.datos.peligroOk = true;
        var card = document.querySelector('[data-prop="' + P.id + '"]');
        if (card) { card.classList.add("ia-doble"); var b = card.querySelector("[data-iasi]"); if (b) b.textContent = "Sí, estoy seguro"; var m = card.querySelector(".ia-conf-msg"); if (m) m.textContent = "⚠ " + P.datos.peligro + " ¿Seguro? Tocá «Sí, estoy seguro» (o «No»)."; }
        notas.push("La persona tocó «Sí» en la propuesta " + P.id + ", que es delicada: la app le pide que la confirme otra vez. Todavía no se hizo nada.");
        return;
      }
      return conf0(P, quiero, soloCargar, igual);
    };
    // los enum de las herramientas viejas se armaron antes de sumar colecciones
    TOOLS.forEach(function (t) { var p = t.input_schema && t.input_schema.properties; if (!p || !p.coleccion || !p.coleccion.enum) return; if (t.name === "consultar") p.coleccion.enum = Object.keys(DATOS); if (t.name === "proponer_editar") p.coleccion.enum = Object.keys(EDITA); });
    window.__ia178 = { BASE: BASE, ACC: ACC, cargar: cargar, DATO: DATO };
  })();
