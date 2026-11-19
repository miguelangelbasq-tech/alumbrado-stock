  // ---------- v176 · 🛡 Guardián de datos en el asistente (solo ADMINISTRACIÓN: ni Oficina ni Dirección reciben estas herramientas).
  //  guardian = estado de cada lista (hoy / copia anterior / hace 7 días), alertas de datos borrados, qué cambió entre una copia y
  //  hoy (o entre dos copias), quién guardó; proponer_restaurar_datos = tarjeta antes → después con lo que vuelve («Sí» → el mismo
  //  camino que la hoja: copia antes, se lee de vuelta, nunca saca lo agregado después).
  if (!window.__v176No) (function ia176() {
    var G = function () { return window.__guardian; };
    var esAdm = function () { return nivelRol() === "admin"; };
    var SOLO = /^(guardian|proponer_restaurar_datos)$/;
    var alc0 = alcance;
    alcance = function () {
      var A = alc0(); if (esAdm()) return A;
      var p0 = A.permite, t0 = A.tools;
      return Object.assign({}, A, { permite: function (t) { return !SOLO.test(t) && p0(t); }, tools: function (l) { return t0(l).filter(function (t) { return !SOLO.test(t.name); }); } });
    };
    var NOADM = { err: "El Guardián de datos lo ve solo Administración." };
    var resumir = function (it) {
      var g = {}; it.forEach(function (x) { var k = x.doc + " › " + x.campo; var o = g[k] = g[k] || { lista: (G().NOMBRE[x.doc] || x.doc) + " › " + x.campo, borrados: [], cambiados: [], agregados: [] }; (x.tipo === "quitado" ? o.borrados : x.tipo === "cambiado" ? o.cambiados : o.agregados).push(x.et); });
      return Object.keys(g).map(function (k) { var o = g[k]; ["borrados", "cambiados", "agregados"].forEach(function (q) { if (o[q].length > 40) o[q] = o[q].slice(0, 40).concat(["… y " + (o[q].length - 40) + " más"]); }); return o; });
    };
    async function fuenteDeArgs(a) {
      var g = G(), f = String(a.desde || a.fecha || "").slice(0, 10);
      if (/^\d{4}-\d\d-\d\d$/.test(f)) { var l = g.entradas().filter(function (e) { return e.fecha <= f; }); if (!l.length) return { err: "No hay copias del " + f + " ni de antes. Copias: " + g.entradas().map(function (e) { return e.fecha; }).join(", ") }; return { f: { tipo: "copia", fecha: l[l.length - 1].fecha } }; }
      var al = g.abiertas()[0]; if (al) { var fa = await g.fuenteAlerta(al); if (fa) return { f: fa, alerta: al }; }
      var b = g.base(); if (b) return { f: { tipo: "copia", fecha: b.fecha } };
      return { err: "Todavía no hay ninguna copia del Guardián para comparar (la primera se guarda hoy)." };
    }
    H.guardian = async function (a) {
      a = a || {}; if (!esAdm()) return NOADM; var g = G(); if (!g) return { err: "El Guardián de datos no está en esta versión." };
      await g.leerSalud(true); await g.revisar();
      var r = g.paraIa();
      if (a.accion === "cambios" || a.desde || a.fecha) {
        var F = await fuenteDeArgs(a); if (F.err) return { err: F.err };
        var src = await g.fuenteDe(F.f), it;
        if (a.hasta && /^\d{4}-\d\d-\d\d$/.test(String(a.hasta).slice(0, 10))) {
          var c2 = await g.leerCopia(String(a.hasta).slice(0, 10)); if (!c2) return { err: "No hay copia del " + a.hasta + "." };
          var dif = []; Object.keys(src.docs).forEach(function (d) { var x = {}; x[d] = src.docs[d]; var cur = c2.docs[d] || {}; dif = dif.concat(difEntre(x[d], cur, d)); }); it = dif;
        } else it = g.diferencias(src.docs, src.parcial);
        r.cambios = { comparo: src.txt + " contra " + (a.hasta ? "la copia del " + a.hasta : "hoy"), listas: resumir(it) };
      }
      return { r: r };
    };
    function difEntre(a, b, d) {   // dos copias: qué se borró / cambió / agregó en cada lista (sin tocar nada)
      var out = [], g = G();
      Object.keys(a || {}).forEach(function (c) {
        if (/^(respaldos|ts|usuario)$|Ts$|Por$/.test(c)) return; var x = a[c], y = (b || {})[c];
        if (JSON.stringify(x) === JSON.stringify(y)) return;
        if (Array.isArray(x)) { var k = function (z) { return z && typeof z == "object" ? String(z.id || z.nombre || z.label || JSON.stringify(z)) : String(z); }, ky = (Array.isArray(y) ? y : []).map(k), kx = x.map(k); x.forEach(function (z, i) { if (ky.indexOf(kx[i]) < 0) out.push({ doc: d, campo: c, tipo: "quitado", et: kx[i] }); }); (Array.isArray(y) ? y : []).forEach(function (z, i) { if (kx.indexOf(ky[i]) < 0) out.push({ doc: d, campo: c, tipo: "agregado", et: ky[i] }); }); }
        else if (x && typeof x == "object") { var yy = y && typeof y == "object" ? y : {}; Object.keys(x).forEach(function (q) { if (!(q in yy)) out.push({ doc: d, campo: c, tipo: "quitado", et: q }); else if (JSON.stringify(x[q]) !== JSON.stringify(yy[q])) out.push({ doc: d, campo: c, tipo: "cambiado", et: q }); }); Object.keys(yy).forEach(function (q) { if (!(q in x)) out.push({ doc: d, campo: c, tipo: "agregado", et: q }); }); }
        else out.push({ doc: d, campo: c, tipo: "cambiado", et: c });
      });
      return out;
    }
    H.proponer_restaurar_datos = async function (a) {
      a = a || {}; if (!puedeAcciones()) return SIN_ACC; if (!esAdm()) return NOADM;
      var g = G(); if (!g) return { err: "El Guardián de datos no está en esta versión." };
      await g.leerSalud(true); await g.revisar();
      var F = await fuenteDeArgs(a); if (F.err) return { err: F.err };
      var src = await g.fuenteDe(F.f), it = g.diferencias(src.docs, src.parcial);
      var docs = (Array.isArray(a.listas) ? a.listas : a.lista ? [a.lista] : []).map(function (x) { return String(x).toLowerCase(); });
      var MAP = { nomina: ["personal", "nomina"], personal: ["personal", ""], personas: ["personal", "nomina"], vehiculos: ["personal", "vehiculos"], precios: ["precios", ""], gastosref: ["precios", "gastosRef"], baremo: ["baremo", ""], cuadrillas: ["cuadrillas", ""], ubicacion: ["ubicacion", ""] };
      var sel = it.filter(function (x) {
        if (x.tipo === "agregado" || g.RESTAURABLES.indexOf(x.doc) < 0) return false;
        if (x.tipo === "cambiado" && !a.tambien_cambiados) return false;
        if (!docs.length) return x.tipo === "quitado";
        return docs.some(function (q) { var m = MAP[q.replace(/[^a-z]/g, "")]; return m ? x.doc === m[0] && (!m[1] || x.campo === m[1] || (m[1] === "nomina" && x.campo === "lista")) : x.doc === q || x.campo.toLowerCase() === q; });
      });
      if (!sel.length) return { r: { estado: "nada", instruccion: "Contra " + src.txt + " no hay nada borrado para volver" + (docs.length ? " en " + docs.join(", ") : "") + ". Decile eso (y si quiere, qué cambió: guardian con accion cambios)." } };
      var filas = g.filasPlan(sel), quedan = it.filter(function (x) { return x.tipo === "agregado"; }).length;
      var P = nuevaProp("guardian176", { coleccion: "configEquipo", id: sel.map(function (x) { return x.doc; }).filter(function (v, i, l) { return l.indexOf(v) === i; }).join(","), titulo: "🛡 Volver a como estaba (" + sel.length + " dato" + (sel.length === 1 ? "" : "s") + ")", sub: "Desde " + src.txt, filas: filas.slice(0, 80), avisos: (filas.length > 80 ? ["… y " + (filas.length - 80) + " más."] : []).concat(quedan ? [quedan + " cosa(s) agregadas después se quedan (no se saca nada)."] : []), items: sel, fuente: src.txt, motivo: String(a.motivo || ""), pie: "Antes de guardar queda una copia de cómo está hoy; después se lee de vuelta de la base." });
      return pendiente(P, { instruccion: "La app ya le mostró la tarjeta: decile en 1–2 líneas qué vuelve (cuántas personas, vehículos, precios…) y que confirme con «Sí»." });
    };
    GUARDAR.guardian176 = async function (P) {
      var d = P.datos, r = await G().restaurar(d.items, { fuente: d.fuente, porAsistente: true });
      if (!r.hecho.length) throw new Error(r.mal.join(" · ") || "no se pudo");
      return { ref: d.id, antes: null, despues: { docs: r.hecho }, txt: (r.ok ? "✅ " : "") + r.txt };
    };
    TOOLS.push({ name: "guardian", description: "GUARDIÁN DE DATOS (solo Administración): estado de cada lista (personas de la nómina, vehículos, precios de Gastos, baremo, tareas, cuadrillas, pañol, obras, órdenes, reservas, usuarios) hoy contra la copia del día anterior y hace 7 días; alertas de datos borrados; copias guardadas; últimos guardados (quién y cuándo); último respaldo completo. accion «cambios» (con desde = AAAA-MM-DD, y hasta opcional) dice qué se borró / cambió / agregó entre esa copia y hoy (o entre dos copias). No cambia nada.", input_schema: S({ accion: { type: "string", enum: ["estado", "alertas", "cambios", "quien"] }, desde: TXT("fecha de la copia AAAA-MM-DD (para «cambios»)"), hasta: TXT("otra copia AAAA-MM-DD para comparar dos copias (si no, contra hoy)") }) });
    TOOLS.push({ name: "proponer_restaurar_datos", description: "PROPONE volver datos borrados a como estaban desde una copia del Guardián (la del día anterior a la caída si no se dice fecha) — NO guarda hasta el «Sí». listas: nomina, vehiculos, precios, gastosRef, baremo, cuadrillas, ubicacion (vacío = todo lo borrado). Vuelve lo borrado (y lo cambiado solo con tambien_cambiados); nunca saca lo agregado después.", input_schema: S({ desde: TXT("fecha de la copia AAAA-MM-DD (opcional)"), listas: { type: "array", items: { type: "string" } }, tambien_cambiados: { type: "boolean" }, motivo: TXT("por qué") }) });
    ACCIONES.push("proponer_restaurar_datos");
    Object.assign(ESTADOS, { guardian: "🛡 Mirando el Guardián de datos…", proponer_restaurar_datos: "🛡 Preparando la vuelta atrás…" });
    Object.assign(MIRO, { guardian: ["Guardián de datos"], proponer_restaurar_datos: ["Guardián de datos"] });
  })();
