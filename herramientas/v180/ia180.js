  // ---------- v180 · carpetas de obra con el asistente (Ángel 19/11: «hay que poner la posibilidad de mover o eliminar carpeta,
  //  mover órdenes, fotos, todo»). revisar_carpetas = posibles duplicadas, carpetas que parecen vacías e inventario de una obra;
  //  proponer_unir_obras / proponer_mover_a_obra / proponer_eliminar_obra = tarjeta antes → después y «Sí» (+ la segunda
  //  confirmación de la app para unir y eliminar), con el MISMO motor de la hoja (window.__carpetas). Solo Administración y Oficina.
  if (!window.__v180No) (function ia180() {
    var C = function () { return window.__carpetas; };
    var arr = function (x) { return Array.isArray(x) ? x : []; };
    function okRol() { var n = nivelRol(); return (n === "admin" || n === "oficina") && !!C() && C().puede(); }
    var NO_ROL = { err: "Unir, mover o eliminar carpetas de obra lo hacen Administración y Oficina (con «editar» en Registrar obra o Avance)." };
    function obraR(q) { if (!C()) return { err: "Falta el módulo de carpetas." }; return C().resolver(q); }
    function fila(ic, t, s) { return '<div class="ia-conf-f">' + ic + " " + t + (s ? "<br><small>" + s + "</small>" : "") + "</div>"; }
    H.revisar_carpetas = async function (a) {
      a = a || {};
      if (!okRol()) return NO_ROL;
      var K = C(), r = {};
      if (a.obra) { var x = obraR(a.obra); if (x.err) return { err: x.err }; var inv = await K.inventario(x.obra.id); if (inv.err) return { err: inv.err }; r.inventario = K.paraIa(inv); r.posiblesDuplicadas = K.dupDe(x.obra.id).map(function (d) { var o = String(d.a.id) === String(x.obra.id) ? d.b : d.a; return { obra: o.nombre, obraId: o.id, ID: o.obraId || "", motivos: d.motivos }; }); return { r: r }; }
      var que = String(a.que || "todo");
      if (que === "todo" || que === "duplicadas") r.posiblesDuplicadas = K.duplicadas().map(function (d) { return { a: d.a.nombre, aId: d.a.id, b: d.b.nombre, bId: d.b.id, motivos: d.motivos, sugerida: "unir «" + d.origen.nombre + "» en «" + d.destino.nombre + "» (la que tiene más cargado)" }; });
      if (que === "todo" || que === "vacias") r.parecenVacias = K.vaciasRapido().map(function (o) { return { obra: o.nombre, obraId: o.id, ID: o.obraId || "" }; });
      r.nota = "«parecenVacias» mira órdenes, vales, reservas, gastos, cálculos y avance de lo que ya bajó la app; antes de eliminar, la app revisa TODO en la base (fotos, planos, puntos…).";
      return { r: r };
    };
    H.proponer_unir_obras = async function (a) {
      a = a || {};
      if (!puedeAcciones()) return SIN_ACC;
      if (!okRol()) return NO_ROL;
      var s = obraR(a.origen); if (s.err) return { err: "Origen: " + s.err };
      var d = obraR(a.destino); if (d.err) return { err: "Destino: " + d.err };
      var el = {}; arr(a.elegir).forEach(function (x) { if (x && x.conflicto) el[String(x.conflicto)] = /orig|une/i.test(x.quedarse || "") ? "origen" : /sum/i.test(x.quedarse || "") ? "sumar" : "destino"; });
      var R = await C().planUnir(s.obra.id, d.obra.id, { elegir: el, motivo: a.motivo || "" });
      if (R.err) return { err: R.err };
      var P0 = R.plan, filas = P0.filas.map(function (f) { return { c: f.ico + " " + f.c + " (" + f.n + ")", a: f.fijo ? "en «" + P0.srcNombre + "»" : String(f.a), d: f.fijo ? "quedan ahí (reglas)" : String(f.d) }; });
      filas = filas.concat(P0.filasAvance.slice(0, 20));
      filas.push({ c: "«" + P0.srcNombre + "»", a: "en curso", d: "archivada (unida en «" + P0.dstNombre + "»)" });
      var html = P0.conflictos.length ? fila("⚖", "<b>Lo que choca (" + P0.conflictos.length + ")</b> — queda lo de «" + esc(P0.dstNombre) + "» salvo que se elija", P0.conflictos.map(function (c) { return esc(c.txt) + " → " + esc((c.op.filter(function (o) { return o[0] === c.q; })[0] || [])[1] || ""); }).join("<br>")) : "";
      if (P0.prop && P0.prop.n) html += fila("📊", "<b>Avance y papeles de la que se une</b>", esc(P0.prop.l.join(" · ")));
      var P = nuevaProp("unir180", { coleccion: "avanceObras", id: P0.src, titulo: "🔗 Unir «" + P0.srcNombre + "» en «" + P0.dstNombre + "»", sub: P0.total + " cosa" + (P0.total === 1 ? "" : "s") + " pasan a «" + P0.dstNombre + "» · se puede deshacer", filas: filas, html: html, avisos: P0.avisos, src: P0.src, dst: P0.dst, elegir: el, motivo: String(a.motivo || ""), pie: "Con el «Sí» la app te pide una segunda confirmación («Unir»). La carpeta de origen se archiva, no se borra; queda «↶ Deshacer unión» en su legajo." });
      return pendiente(P, { conflictos: P0.conflictos.map(function (c) { return { conflicto: c.key, que: c.txt, opciones: c.op.map(function (o) { return o[0] + " = " + o[1]; }) }; }), instruccion: "La app ya le mostró la tarjeta con todo lo que pasa. Decile en 1–2 líneas qué se une" + (P0.conflictos.length ? ", que en lo que choca queda lo de «" + P0.dstNombre + "» salvo que diga otra cosa (si quiere otra, volvé a llamar con elegir)" : "") + " y que confirme con «Sí, unir» (después la app le pide «Unir» otra vez)." });
    };
    H.proponer_mover_a_obra = async function (a) {
      a = a || {};
      if (!puedeAcciones()) return SIN_ACC;
      if (!okRol()) return NO_ROL;
      var s = obraR(a.origen); if (s.err) return { err: "Origen: " + s.err };
      var d = obraR(a.destino); if (d.err) return { err: "Destino: " + d.err };
      var inv = await C().inventario(s.obra.id); if (inv.err) return { err: inv.err };
      var g = inv.g, sel = { conAvance: a.con_avance !== false }, noEnc = [];
      var fDe = function (x) { return String(x.fecha || "").slice(0, 10); };
      var enRango = function (x) { var f = fDe(x); return (!a.desde || f >= a.desde) && (!a.hasta || f <= a.hasta); };
      var pick = function (k, l, refs, todos, clave) {
        var out = [];
        arr(refs).forEach(function (r) { var q = String(r).trim(), x = l.filter(function (y) { return String(y.__docId || y.id) === q || (y.numero && String(y.numero).toUpperCase() === q.toUpperCase()) || (y.adjId && String(y.adjId) === q); })[0]; if (x) out.push(String(clave ? clave(x) : (x.__docId || x.id))); else noEnc.push(q); });
        if (todos) l.filter(enRango).forEach(function (x) { var id = String(clave ? clave(x) : (x.__docId || x.id)); if (out.indexOf(id) < 0) out.push(id); });
        if (out.length) sel[k] = out;
      };
      var T = arr(a.todo); var todo = function (k) { return T.indexOf(k) >= 0; };
      pick("ordenes", g.ordenes, a.ordenes, todo("ordenes"));
      pick("movs", g.movs, a.vales, todo("vales"));
      pick("reservas", g.reservas, a.reservas, todo("reservas"));
      pick("calculos", g.calculos.filter(function (c) { return c.__docId; }), a.calculos, todo("calculos"));
      pick("gastos", g.gastos, a.gastos, todo("gastos"));
      pick("planos", g.planos, a.planos, todo("planos"));
      pick("puntos", g.puntos, a.puntos_mapa, todo("puntos_mapa"));
      pick("fotos", g.fotos.concat(g.videos), a.fotos, todo("fotos"), function (f) { return f.adjId || f.id; });
      var R = await C().planMover(s.obra.id, d.obra.id, sel, { motivo: a.motivo || "", inv: inv });
      if (R.err) return { err: R.err + (noEnc.length ? " (no encontré: " + noEnc.join(", ") + ")" : "") };
      var P0 = R.plan, filas = P0.filas.slice(0, 40);
      if (P0.fotos.length) filas.push({ c: "📷 " + P0.fotos.length + " foto(s) sueltas", a: P0.srcNombre, d: P0.dstNombre });
      var av = P0.avisos.slice(); if (noEnc.length) av.push("No encontré en «" + P0.srcNombre + "»: " + noEnc.join(", ") + ".");
      var P = nuevaProp("mover180", { coleccion: "avanceObras", id: P0.src, titulo: "↔ Pasar a «" + P0.dstNombre + "»", sub: P0.total + " cosa" + (P0.total === 1 ? "" : "s") + " de «" + P0.srcNombre + "» · se puede deshacer", filas: filas, avisos: av, src: P0.src, dst: P0.dst, sel: sel, motivo: String(a.motivo || ""), pie: "Cada orden se lleva sus fotos, videos y reservas" + (sel.conAvance ? " y el avance que dio al cerrarse" : "") + "." });
      return pendiente(P, { noEncontre: noEnc, instruccion: "La app ya le mostró la tarjeta: decile en una línea qué pasa y que confirme con «Sí, mover»." });
    };
    H.proponer_eliminar_obra = async function (a) {
      a = a || {};
      if (!puedeAcciones()) return SIN_ACC;
      if (!okRol()) return NO_ROL;
      var s = obraR(a.obra); if (s.err) return { err: s.err };
      var inv = await C().inventario(s.obra.id); if (inv.err) return { err: inv.err };
      if (!inv.vacia) return { r: { estado: "no_se_puede", vacia: false, tiene: C().resumenInv(inv), instruccion: "NO se puede eliminar: la carpeta tiene cosas (" + C().resumenInv(inv) + "). Decíselo y ofrecé unirla con la buena (proponer_unir_obras: todo pasa ahí y esta queda archivada) o archivarla desde el legajo." } };
      var P = nuevaProp("eliminar180", { coleccion: "avanceObras", id: s.obra.id, titulo: "🗑 Eliminar «" + s.obra.nombre + "»", sub: "Está vacía: no la usa nada en ninguna parte de la app", filas: [{ c: "Carpeta «" + s.obra.nombre + "»" + (s.obra.obraId ? " (ID " + s.obra.obraId + ")" : ""), a: "existe", d: "eliminada (queda la copia en la auditoría)" }], obra: s.obra.id, nombre: s.obra.nombre, motivo: String(a.motivo || ""), pie: "Con el «Sí» la app pide escribir el nombre para confirmar. Si las reglas no dejan borrar, la archiva." });
      return pendiente(P, { instruccion: "La app ya le mostró la tarjeta: decile en una línea que está vacía y que confirme con «Sí, eliminar» (después escribe el nombre)." });
    };
    GUARDAR.unir180 = async function (P) {
      var d = P.datos;
      var ok = await C().confirmar2({ titulo: "🔗 ¿Unir de verdad?", texto: d.sub + ". «" + (C().obraDe(d.src) || {}).nombre + "» queda archivada (no se borra).", boton: "🔗 Unir" });
      if (!ok) throw new Error("No se unió nada: faltó confirmar «Unir».");
      var r = await C().unir(d.src, d.dst, { elegir: d.elegir, motivo: d.motivo, porAsistente: true });
      if (r.err) throw new Error(r.err);
      return { antes: { obra: d.src }, despues: { unidaEn: d.dst, cantidad: (r.plan || {}).total }, ref: d.src, txt: r.txt };
    };
    GUARDAR.mover180 = async function (P) {
      var d = P.datos, r = await C().mover(d.src, d.dst, d.sel, { motivo: d.motivo, porAsistente: true });
      if (r.err) throw new Error(r.err);
      return { antes: { obra: d.src }, despues: { obra: d.dst }, ref: d.src, txt: r.txt };
    };
    GUARDAR.eliminar180 = async function (P) {
      var d = P.datos;
      var ok = await C().confirmar2({ titulo: "🗑 ¿Eliminar «" + d.nombre + "» para siempre?", html: "Se borra la carpeta para todo el equipo. Queda la copia en la auditoría.", escribir: d.nombre, boton: "🗑 Eliminar para siempre", peligro: true });
      if (!ok) throw new Error("No se eliminó nada: faltó confirmar.");
      var r = await C().eliminar(d.obra, { motivo: d.motivo, porAsistente: true });
      if (r.err) throw new Error(r.err);
      return { antes: { obra: d.obra }, despues: { eliminada: !r.archivada, archivada: !!r.archivada }, ref: d.obra, txt: r.txt };
    };
    TOOLS.push({ name: "revisar_carpetas", description: "CARPETAS DE OBRA (solo Administración y Oficina): sin obra = las posibles obras DUPLICADAS (mismo ID, nombre igual o casi igual, pines a menos de 50 m) y las que PARECEN VACÍAS; con obra = el INVENTARIO completo de esa carpeta (cuántas órdenes, fotos, videos/PDF, vales, reservas, cálculos, gastos, planos, puntos del mapa, relevamientos, avisos, y el avance/papeles cargados) con los id de sus órdenes, vales y fotos para mover. No cambia nada.", input_schema: S({ obra: TXT("nombre, ID o id de la obra para ver su inventario (opcional)"), que: { type: "string", enum: ["todo", "duplicadas", "vacias"], description: "sin obra: qué revisar (de entrada todo)" } }) });
    TOOLS.push({ name: "proponer_unir_obras", description: "PROPONE UNIR dos carpetas de obra repetidas (NO lo hace hasta el «Sí» y la segunda confirmación): TODO lo de la de origen (órdenes, fotos, videos/PDF, vales, reservas, cálculos, gastos, etapas, planos, puntos del mapa, relevamientos) pasa a la de destino; el avance a mano (itemizado, avance de obra, historial, documentos, certificados, carpeta) se junta sin perder nada; lo que choca queda como en el destino salvo que se elija (elegir); la de origen queda ARCHIVADA con «unida en», NO se borra, y se puede deshacer. Usá revisar_carpetas antes si no sabés cuál es la buena (destino = la que tiene más cargado).", input_schema: S({ origen: TXT("la carpeta que sobra (nombre, ID o id)"), destino: TXT("la carpeta buena, donde queda todo"), elegir: { type: "array", items: S({ conflicto: TXT("la clave del choque que devolvió la propuesta anterior"), quedarse: { type: "string", enum: ["destino", "origen", "sumar"] } }, ["conflicto", "quedarse"]) }, motivo: TXT("por qué (opcional)") }, ["origen", "destino"]) });
    TOOLS.push({ name: "proponer_mover_a_obra", description: "PROPONE PASAR cosas sueltas de una obra a otra (NO lo hace hasta el «Sí»): órdenes (cada una se lleva sus fotos, videos, reservas y el avance que dio al cerrarse), vales del pañol (S-/E-/D-), reservas (R-), cálculos, gastos, planos, puntos del mapa y fotos sueltas (por id). Por ids/números o «todo» de un tipo con desde/hasta. Se puede deshacer desde el legajo.", input_schema: S({ origen: TXT("obra donde están ahora"), destino: TXT("obra a donde van"), ordenes: { type: "array", items: { type: "string" }, description: "números OT-AAAA-NNN o id" }, vales: { type: "array", items: { type: "string" }, description: "números S-0001… o id" }, reservas: { type: "array", items: { type: "string" } }, calculos: { type: "array", items: { type: "string" } }, gastos: { type: "array", items: { type: "string" } }, planos: { type: "array", items: { type: "string" } }, puntos_mapa: { type: "array", items: { type: "string" } }, fotos: { type: "array", items: { type: "string" }, description: "id de fotos (de revisar_carpetas, buscar_fotos o ver_fotos)" }, todo: { type: "array", items: { type: "string", enum: ["ordenes", "vales", "reservas", "calculos", "gastos", "planos", "puntos_mapa", "fotos"] }, description: "pasar TODO lo de esos tipos (con desde/hasta si se dijo)" }, desde: TXT("AAAA-MM-DD (opcional)"), hasta: TXT("AAAA-MM-DD (opcional)"), con_avance: { type: "boolean", description: "las órdenes cerradas se llevan el avance del itemizado que dieron (de entrada sí)" }, motivo: TXT("por qué (opcional)") }, ["origen", "destino"]) });
    TOOLS.push({ name: "proponer_eliminar_obra", description: "PROPONE ELIMINAR una carpeta de obra VACÍA (creada por error, sin nada adentro). La app revisa todo en la base: si tiene algo, NO se puede y devuelve lo que tiene (ofrecé unirla con la buena o archivarla). Con el «Sí» pide escribir el nombre; antes queda la copia entera en la auditoría.", input_schema: S({ obra: TXT("nombre, ID o id"), motivo: TXT("por qué (opcional)") }, ["obra"]) });
    ACCIONES.push("proponer_unir_obras", "proponer_mover_a_obra", "proponer_eliminar_obra");
    Object.assign(ESTADOS, { revisar_carpetas: "🗂 Revisando las carpetas…", proponer_unir_obras: "🔗 Preparando la unión…", proponer_mover_a_obra: "↔ Preparando el pase…", proponer_eliminar_obra: "🗑 Revisando si está vacía…" });
    Object.assign(MIRO, { revisar_carpetas: ["Obras"], proponer_unir_obras: ["Obras"], proponer_mover_a_obra: ["Obras"], proponer_eliminar_obra: ["Obras"] });
    CHIPS.push(["🗂 Carpetas repetidas", "¿Hay obras repetidas o carpetas vacías?", true]);
  })();
