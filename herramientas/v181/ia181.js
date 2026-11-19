  // ---------- v181 · 📜 Historial de cambios en el asistente (solo ADMINISTRACIÓN, como el Guardián de la v176).
  //  historial_cambios = quién cambió qué y cuándo (lo que anota la app en cada escritura, con antes → después);
  //  proponer_revertir_cambio = tarjeta antes → después y «Sí» → el mismo «Volver este cambio» de la hoja (lee cómo está hoy,
  //  avisa si cambió después, vuelve a crear lo borrado). Nada se escribe sin el «Sí».
  if (!window.__v181No) (function ia181() {
    var RC = function () { return window.__regCambios; };
    var esAdm = function () { return nivelRol() === "admin"; };
    var SOLO = /^(historial_cambios|proponer_revertir_cambio)$/;
    var alc0 = alcance;
    alcance = function () {
      var A = alc0(); if (esAdm()) return A;
      var p0 = A.permite, t0 = A.tools;
      return Object.assign({}, A, { permite: function (t) { return !SOLO.test(t) && p0(t); }, tools: function (l) { return t0(l).filter(function (t) { return !SOLO.test(t.name); }); } });
    };
    var NOADM = { err: "El historial de cambios lo ve solo Administración." };
    var p2 = function (n) { return (n < 10 ? "0" : "") + n; };
    var diaIso = function (d) { return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()); };
    function fechaMs(s, fin) {
      s = String(s || "").trim().toLowerCase(); if (!s) return 0;
      var d = new Date(); d.setHours(0, 0, 0, 0);
      if (s === "hoy") { } else if (s === "ayer") d.setDate(d.getDate() - 1);
      else if (/^hace \d+ d/.test(s)) d.setDate(d.getDate() - parseInt(s.replace(/\D+/g, ""), 10));
      else if (/^\d{4}-\d\d-\d\d/.test(s)) d = new Date(s.slice(0, 10) + "T00:00:00");
      else if (/^\d{1,2}\/\d{1,2}/.test(s)) { var q = s.split("/"); d = new Date(d.getFullYear(), +q[1] - 1, +q[0]); }
      else return 0;
      return d.getTime() + (fin ? 864e5 : 0);
    }
    var COLS = { obra: "avanceObras", obras: "avanceObras", orden: "ordenesTrabajo", ordenes: "ordenesTrabajo", gasto: "gastosObra", gastos: "gastosObra", reserva: "reservas", reservas: "reservas", movimiento: "movimientos", movimientos: "movimientos", vale: "movimientos", catalogo: "catalogoProductos", producto: "catalogoProductos", productos: "catalogoProductos", panol: "catalogoProductos", usuario: "usuarios", usuarios: "usuarios", foto: "fotosObra", fotos: "fotosObra", configuracion: "configEquipo", personal: "configEquipo", nomina: "configEquipo", precios: "configEquipo", baremo: "configEquipo", herramientas: "herramientas", calculo: "historialCalculos", calculos: "historialCalculos", mapa: "mapaPuntos" };
    var REALES = ["avanceObras", "ordenesTrabajo", "gastosObra", "reservas", "movimientos", "catalogoProductos", "usuarios", "fotosObra", "adjuntos", "configEquipo", "herramientas", "historialCalculos", "mapaPuntos", "planSemanal", "planosObra", "cierresQuincena", "proyectos"];
    function colDe(s0) { var s = String(s0 || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); if (!s) return ""; if (COLS[s]) return COLS[s]; var k = s.replace(/[^a-z]/g, ""); if (COLS[k]) return COLS[k]; var r = REALES.filter(function (c) { return c.toLowerCase() === k; })[0]; return r || ""; }
    H.historial_cambios = async function (a) {
      a = a || {}; if (!esAdm()) return NOADM; var R = RC(); if (!R) return { err: "El historial de cambios no está en esta versión." };
      try { await R.flush(); } catch (e) { }
      var f = { desde: fechaMs(a.desde, false), hasta: fechaMs(a.hasta, true), persona: a.persona || "", coleccion: colDe(a.coleccion || a.seccion), obra: a.obra || "", texto: a.texto || "", tipo: a.tipo || "", soloCambios: a.incluir_acciones ? false : true };
      var cfg = String(a.coleccion || a.seccion || "").toLowerCase();
      if (/personal|nomina|n.mina/.test(cfg)) f.docId = "personal"; else if (/precio/.test(cfg) && !/producto/.test(cfg)) f.docId = "precios"; else if (/baremo/.test(cfg)) f.docId = "baremo";
      var lim = Math.max(1, Math.min(+a.limite || 40, 120));
      var r = await R.buscar(f, { max: lim, paginas: 4 });
      var l = r.lista.map(R.paraIa);
      return { r: { filtros: { desde: f.desde ? diaIso(new Date(f.desde)) : "", hasta: f.hasta ? diaIso(new Date(f.hasta - 1)) : "", persona: f.persona, seccion: f.coleccion, obra: f.obra, texto: f.texto, tipo: f.tipo }, cantidad: l.length, hayMas: r.hayMas, cambios: l,
        instruccion: l.length ? "Contestá quién, cuándo y qué (antes → después) en pocas líneas. Si pide volver uno, usá proponer_revertir_cambio con su id." : "No hay cambios registrados con esos filtros (el registro arrancó con la v181: lo de antes no está). Decilo así." } };
    };
    H.proponer_revertir_cambio = async function (a) {
      a = a || {}; if (!puedeAcciones()) return SIN_ACC; if (!esAdm()) return NOADM;
      var R = RC(); if (!R) return { err: "El historial de cambios no está en esta versión." };
      var E = await R.entrada(String(a.id || "")); if (!E) return { err: "No encontré ese cambio («" + a.id + "»). Buscalo primero con historial_cambios y usá su id." };
      var sel = Array.isArray(a.campos) && a.campos.length ? a.campos.map(String) : null;
      if (sel) { var ks = (E.f || []).map(function (c) { return c.k; }); sel = ks.filter(function (k) { return sel.some(function (s) { return k === s || k.split(".")[0] === s || k.toLowerCase().indexOf(s.toLowerCase()) >= 0; }); }); if (!sel.length) sel = null; }
      var P = await R.planVolver(E, sel); if (P.err) return { err: P.err };
      var Q = nuevaProp("revertir181", { coleccion: E.c, id: E.id, titulo: P.tipo === "recrear" ? "↶ Volver a crear lo borrado" : "↶ Volver este cambio", sub: (E.nombre || E.usuario || "") + " · " + (E.r || ""), filas: P.filas, avisos: P.avisos, plan: P, motivo: String(a.motivo || ""), pie: "Se lee cómo está hoy antes de guardar; queda anotado en el historial." });
      return pendiente(Q, { instruccion: "La app ya le mostró la tarjeta: decile en 1–2 líneas qué vuelve y que confirme con «Sí»." });
    };
    GUARDAR.revertir181 = async function (P) {
      var d = P.datos, r = await RC().volver(d.plan, { porAsistente: true });
      return { ref: d.id, antes: null, despues: null, txt: "✅ " + r.txt.replace(/^✓\s*/, "") };
    };
    TOOLS.push({ name: "historial_cambios", description: "HISTORIAL DE CAMBIOS (solo Administración): todo lo que se cambió, agregó o borró en la app desde la v181, con quién, cuándo, en qué pantalla, si fue el asistente o algo automático, y cada dato antes → después. Para «¿quién cambió X?», «¿qué se cambió ayer?», «¿qué hizo Fulano?», «¿quién borró el gasto…?». Filtros: desde/hasta (AAAA-MM-DD, «hoy», «ayer», «hace 3 días»), persona (nombre o mail), coleccion (obras, ordenes, gastos, reservas, movimientos, productos, usuarios, fotos, personal, precios, baremo), obra, texto, tipo (alta/cambio/borrado/fotos), limite. Cada cambio trae su id para proponer_revertir_cambio.", input_schema: { type: "object", properties: { desde: { type: "string" }, hasta: { type: "string" }, persona: { type: "string" }, coleccion: { type: "string" }, obra: { type: "string" }, texto: { type: "string" }, tipo: { type: "string", enum: ["alta", "cambio", "borrado", "fotos"] }, limite: { type: "number" }, incluir_acciones: { type: "boolean" } } } });
    TOOLS.push({ name: "proponer_revertir_cambio", description: "PROPONE volver un cambio del historial a como estaba (datos de un documento) o volver a crear algo borrado — NO guarda hasta el «Sí». id = el id que dio historial_cambios; campos = solo esos datos (vacío = todos los que se pueden). Avisa si el dato cambió después. Lo cortado o con imágenes no se vuelve.", input_schema: { type: "object", properties: { id: { type: "string" }, campos: { type: "array", items: { type: "string" } }, motivo: { type: "string" } }, required: ["id"] } });
    ACCIONES.push("proponer_revertir_cambio");
    Object.assign(ESTADOS, { historial_cambios: "📜 Mirando el historial de cambios…", proponer_revertir_cambio: "📜 Preparando la vuelta atrás…" });
    Object.assign(MIRO, { historial_cambios: ["Historial de cambios"], proponer_revertir_cambio: ["Historial de cambios"] });
  })();
