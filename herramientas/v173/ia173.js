  // ===================================================================================================== v173: quién hace qué y horario
  //  · proponer_orden: por tarea «quienes» (una persona = asignada; varias juntas = «👥 Elegir quiénes»), «reparto» (cada uno su
  //    cantidad y, si se dice, sus columnas = «✂ Repartir») y «columnas»; «horario» de cada uno (desde/hasta) y «hora_fin».
  //  · proponer_editar_orden: lo mismo sobre una orden emitida.
  //  · proponer_cierre_dia: «hasta» por persona → horas.
  (function ia173() {
    if (window.__v173No) return;
    var RP = "__reparto__", EQ = "__equipo__";
    var PERS = { type: "array", items: { type: "string" }, description: "nombres de la nómina que hacen ESTA tarea juntos (si es uno solo, va solo él)" };
    var REPA = { type: "array", description: "cada uno hace SU parte de la tarea (ej. «10 luminarias, 5 Pablo y 5 Pedro»): una entrada por persona con su cantidad y, si la dijo, sus columnas", items: S({ persona: TXT("nombre"), cantidad: { type: "number" }, columnas: { type: "array", items: { type: "string" }, description: "las columnas de esa persona, ej. [\"Col 1\", \"Col 2\"] (opcional)" } }, ["persona", "cantidad"]) };
    var COLS = { type: "array", items: { type: "string" }, description: "qué columnas, si las dijo (ej. [\"Col 3\", \"Col 4\"])" };
    var HOR = { type: "object", description: "horario de cada uno que NO hace toda la jornada: { \"nombre\": { desde: \"HH:MM\" (opcional), hasta: \"HH:MM\" } } (ej. «Pablo y Pedro hasta las 2» → hasta 14:00 para los dos)" };
    function ampliar(nm, enCambios) {
      var t = TOOLS.filter(function (x) { return x.name === nm; })[0]; if (!t) return;
      var base = enCambios ? t.input_schema.properties.cambios : t.input_schema;
      var it = base.properties.tareas && base.properties.tareas.items; if (it && it.properties) { it.properties.quienes = PERS; it.properties.reparto = REPA; it.properties.columnas = COLS; }
      base.properties.horario = HOR; if (!enCambios) base.properties.hora_fin = TXT("HH:MM (opcional; si los demás siguen hasta las 16, 16:00)");
      t.description += " Quién hace cada tarea: «quien» (una persona), «quienes» (varias juntas) o «reparto» (cada uno su parte); nunca todos en todo si la persona dijo quién hace qué. «horario» para el que se va antes (sus puntos se cuentan por sus horas).";
    }
    ampliar("proponer_orden", false); ampliar("proponer_editar_orden", true);
    function horaDe(s) {
      var m = String(s == null ? "" : s).toLowerCase().match(/(\d{1,2})(?::|\.|h|\s*hs?)?\s*(\d{2})?/); if (!m) return "";
      var h = +m[1], mi = m[2] ? +m[2] : 0; if (h < 7) h += 12; if (h > 23 || mi > 59) return "";
      return (h < 10 ? "0" : "") + h + ":" + (mi < 10 ? "0" : "") + mi;
    }
    function gente(ps, txt) { var r = personaDe(txt, ps); return r.err ? null : r.p.nombre; }
    function nominaP(n) { var r = personaDe(n); return r.err ? null : r.p; }
    function leerHorario(h, ps) {   // → { nombre: {desde, hasta} } o { err }
      var out = {}, l = [];
      if (Array.isArray(h)) h.forEach(function (x) { (x && x.personas || []).forEach(function (n) { l.push([n, x]); }); });
      else Object.keys(h || {}).forEach(function (n) { l.push([n, h[n]]); });
      for (var i = 0; i < l.length; i++) {
        var nm = gente(ps, l[i][0]); if (!nm) return { err: "«" + l[i][0] + "» no está entre los que van a esa orden." };
        var v = l[i][1] || {}, d = v.desde ? horaDe(v.desde) : "", ha = v.hasta ? horaDe(v.hasta) : "";
        if (!d && !ha) continue; out[nm] = { desde: d, hasta: ha };
      }
      return { h: out };
    }
    var colsTxt = function (l) { return window.__rp173 ? window.__rp173.rangoCols(l) : (l || []).join(", "); };
    function quienTxt(x) {
      if (x.reparto && x.reparto.length) return " · ✂ " + x.reparto.map(function (y) { return esc(String(y.nombre).split(" ")[0]) + " " + esc(fN(y.cant)) + (y.cols && y.cols.length ? " (" + esc(colsTxt(y.cols)) + ")" : ""); }).join(" · ");
      if (x.quienes && x.quienes.length > 1) return " · 👥 " + esc(x.quienes.map(function (n) { return String(n).split(" ")[0]; }).join(" y "));
      return x.quien ? " · 👤 " + esc(x.quien.split(" ")[0]) : "";
    }
    function horTxt(d) {
      if (!d || !d.horario || !Object.keys(d.horario).length || !window.__hor173) return "";
      var o = { personal: (d.personas || []).map(function (n) { return { nombre: n }; }), horario: d.horario, horaInicio: d.horaInicio || (($("otHoraInicio") || {}).value) || "", horaFin: d.horaFin || (($("otHoraFin") || {}).value) || "" };
      return window.__hor173.gruposTxt(o, false);
    }
    // ---------- proponer_orden
    var baseOrden = H.proponer_orden;
    H.proponer_orden = function (a) {
      a = a || {};
      var a2 = JSON.parse(JSON.stringify(a)), personas = (a2.personas || []).slice();
      var suma = function (n) { if (n && !personas.some(function (p) { return nk(p) === nk(n) || nk(p).split(" ")[0] === nk(n).split(" ")[0]; })) personas.push(n); };
      (a2.tareas || []).forEach(function (t) { (t.quienes || []).forEach(suma); (t.reparto || []).forEach(function (r) { suma(r && r.persona); }); if (t.quien) suma(t.quien); });
      a2.personas = personas;
      (a2.tareas || []).forEach(function (t) {
        if (t.quienes && t.quienes.length === 1 && !t.quien) t.quien = t.quienes[0];
        if (t.reparto && t.reparto.length && !(num(t.cantidad) > 0)) t.cantidad = t.reparto.reduce(function (s, r) { return s + num(r && r.cantidad); }, 0);
        if (!(num(t.cantidad) > 0) && t.columnas && t.columnas.length) t.cantidad = t.columnas.length;
        delete t.quienes; delete t.reparto; delete t.columnas;
      });
      delete a2.horario; delete a2.hora_fin;
      var r = baseOrden(a2); if (!r || r.err || !r.prop) return r;
      var P = r.prop, d = P.datos, ps = d.personas.map(function (n) { return nominaP(n) || { nombre: n }; });
      for (var i = 0; i < (a.tareas || []).length; i++) {
        var t = a.tareas[i], k = tareaDe(t.tarea), x = k.t ? d.tareas.filter(function (y) { return y.k === k.t.id; })[0] : null; if (!x) continue;
        if (t.quienes && t.quienes.length > 1) {
          var qs = []; for (var j = 0; j < t.quienes.length; j++) { var nm = gente(ps, t.quienes[j]); if (!nm) return { err: "«" + t.quienes[j] + "» no está entre los que van a esa orden." }; if (qs.indexOf(nm) < 0) qs.push(nm); }
          if (qs.length > 1) { x.quienes = qs; x.quien = ""; } else x.quien = qs[0];
        }
        if (t.reparto && t.reparto.length) {
          var rp = [], sm = 0;
          for (var j2 = 0; j2 < t.reparto.length; j2++) { var y = t.reparto[j2] || {}, n2 = gente(ps, y.persona); if (!n2) return { err: "«" + y.persona + "» no está entre los que van a esa orden." }; var c = num(y.cantidad); if (!(c > 0)) return { err: "Falta cuánto hace " + n2 + " de «" + x.label + "»." }; rp.push({ nombre: n2, cant: c, cols: (y.columnas || []).map(String).filter(Boolean) }); sm += c; }
          if (rp.length > 1 || !x.quien) { x.reparto = rp; x.quien = ""; x.quienes = null; }
          if (Math.abs(sm - x.cant) > 0.001) d.avisos.push(x.label + ": repartiste " + fN(sm) + " y la tarea es de " + fN(x.cant) + (sm < x.cant ? " (lo que falta queda para toda la cuadrilla)." : "."));
        }
        if (t.columnas && t.columnas.length) x.columnas = t.columnas.map(String).filter(Boolean);
        else if (x.reparto && x.reparto.some(function (z) { return z.cols.length; })) x.columnas = [].concat.apply([], x.reparto.map(function (z) { return z.cols; }));
      }
      if (a.hora_fin && horaDe(a.hora_fin)) d.horaFin = horaDe(a.hora_fin);
      if (a.horario) {
        var hh = leerHorario(a.horario, ps); if (hh.err) return { err: hh.err };
        var fin = d.horaFin || "", maxH = ""; Object.keys(hh.h).forEach(function (n) { if (hh.h[n].hasta > maxH) maxH = hh.h[n].hasta; });
        if (!fin && maxH) { var ofin = (($("otHoraFin") || {}).value) || ""; if (maxH > ofin) fin = maxH; }
        if (fin) d.horaFin = fin;
        Object.keys(hh.h).forEach(function (n) { var v = hh.h[n]; if ((!v.desde || v.desde === (d.horaInicio || (($("otHoraInicio") || {}).value))) && v.hasta === (d.horaFin || (($("otHoraFin") || {}).value))) delete hh.h[n]; });
        if (Object.keys(hh.h).length) d.horario = hh.h;
      }
      // puntos estimados con quién hace qué y el horario
      try {
        var prev = {}, asig = {}, eqT = {}, rep = {};
        d.tareas.forEach(function (t2) { prev[t2.k] = t2.cant; if (t2.reparto) rep[t2.k] = t2.reparto.map(function (z) { return { nombre: z.nombre, cant: z.cant }; }); else if (t2.quienes) eqT[t2.k] = t2.quienes; else if (t2.quien) asig[t2.k] = t2.quien; });
        var pts = window.__ordenNueva && window.__ordenNueva.puntos ? window.__ordenNueva.puntos({ plazaId: d.obraId, plazaNombre: d.obra, fecha: d.fecha, horaInicio: d.horaInicio || (($("otHoraInicio") || {}).value) || "", horaFin: d.horaFin || (($("otHoraFin") || {}).value) || "", actividades: d.tareas.map(function (t2) { return t2.k; }), previsto: prev, asignada: asig, equipoTarea: eqT, reparto: rep, horario: d.horario || {}, personal: ps.map(function (p) { return { nombre: p.nombre, rol: p.rol || "Oficial" }; }), personalNombres: ps.map(function (p) { return claveDe(p.nombre); }) }) : null;
        if (pts) d.pts = pts;
      } catch (e) { }
      var quienHace = d.tareas.map(function (t2) { return t2.label + ": " + (t2.reparto ? t2.reparto.map(function (z) { return z.nombre + " " + fN(z.cant) + (z.cols.length ? " (" + z.cols.join(", ") + ")" : ""); }).join(" · ") : t2.quienes ? t2.quienes.join(" y ") + " (juntos)" : t2.quien || "toda la cuadrilla") + (t2.columnas ? " · " + t2.columnas.join(", ") : ""); });
      r.r.quienHace = quienHace;
      if (d.horario) r.r.horario = horTxt(d);
      r.r.resumen = d.obra + " · " + fLarga(d.fecha) + " · " + d.personas.join(", ") + " · " + quienHace.join(" · ") + (d.horario ? " · 🕐 " + horTxt(d) : "");
      if (d.pts && d.pts.porPersona) r.r.puntosEstimados = d.pts.porPersona.map(function (p) { return { nombre: p.nombre, pts: r2(p.pts) }; });
      r.r.avisos = d.avisos;
      return r;
    };
    // lo que «Llenar orden» tiene que tener cargado (lo llama cargarOrden)
    window.__ia173 = {
      quien: quienTxt, hor: horTxt,
      quienes: function (d, quien) {
        if (window.__v173No) return;
        var EQs = window.__equipoTarea && window.__equipoTarea.estado ? window.__equipoTarea.estado() : null, RPs = window.__reparto && window.__reparto.estado ? window.__reparto.estado() : null;
        d.tareas.forEach(function (t) {
          if (t.reparto && RPs) { var e = {}; t.reparto.forEach(function (z) { e[z.nombre] = String(z.cant); }); RPs[t.k] = e; quien[t.k] = RP; }
          else if (t.quienes && t.quienes.length > 1 && EQs) { EQs[t.k] = { eq: [t.quienes.slice()], cant: [""] }; quien[t.k] = EQ; }
        });
      },
      cargar: function (d) {
        if (window.__v173No) return;
        if (d.horaFin) { var hf = $("otHoraFin"); if (hf) { hf.value = d.horaFin; disparar(hf); } }
        var rpCols = {}; d.tareas.forEach(function (t) { if (t.reparto && t.reparto.some(function (z) { return z.cols.length; })) { rpCols[t.k] = {}; t.reparto.forEach(function (z) { if (z.cols.length) rpCols[t.k][z.nombre] = z.cols; }); } });
        if (window.__hor173) window.__hor173.ponerForm({ horario: d.horario || {}, rpCols: rpCols });
        d.tareas.forEach(function (t) { if (t.columnas && t.columnas.length && window.__colsPoner) window.__colsPoner(t.k, t.columnas); });
        try { window.__equipoTarea && window.__equipoTarea.pintarCajas(); } catch (e) { }
        try { window.__reparto && window.__reparto.pintarCajas(); } catch (e) { }
      }
    };
    // ---------- proponer_editar_orden
    var baseEditar = H.proponer_editar_orden;
    H.proponer_editar_orden = function (a) {
      a = a || {}; var c = a.cambios || {};
      var mias = (c.tareas || []).some(function (t) { return (t.quienes && t.quienes.length) || (t.reparto && t.reparto.length) || (t.columnas && t.columnas.length); }) || (c.horario && Object.keys(c.horario).length);
      if (!mias) return baseEditar(a);
      var o = otPorRef(a.otId); if (!o) return { err: "No encontré la orden «" + a.otId + "»." };
      if (cerradaOt(o) && o.cierre && o.cierre.cerradoTs) return baseEditar(a);
      var a2 = JSON.parse(JSON.stringify(a)), c2 = a2.cambios;
      (c2.tareas || []).forEach(function (t) { if (t.quienes && t.quienes.length === 1 && !t.quien) t.quien = t.quienes[0]; delete t.quienes; delete t.reparto; delete t.columnas; });
      c2.tareas = (c2.tareas || []).filter(function (t) { return t.quien || (t.cantidad != null && t.cantidad !== ""); });
      delete c2.horario;
      var r = baseEditar(a2), P = r && r.prop;
      if (r && r.err && !/No hay ningún cambio/.test(r.err)) return r;
      var pat = P ? P.datos.patch : {}, filas = P ? P.datos.filas : [], avisos = P ? P.datos.avisos : [];
      var per = (pat.personal || o.personal || []).map(function (p) { return typeof p == "string" ? { nombre: p } : p; }).filter(function (p) { return p && p.nombre; });
      var asig = Object.assign({}, pat.asignada || o.asignada || {}), eqT = Object.assign({}, o.equipoTarea || {}), eqs = Object.assign({}, o.equipos || {}), rep = Object.assign({}, o.reparto || {}), cols = Object.assign({}, o.columnas || {}), toco = {};
      var sacar = function (k) { delete asig[k]; delete eqT[k]; delete eqs[k]; delete rep[k]; };
      var antesQ = function (k) { var x = (o.reparto || {})[k]; if (x && x.length) return x.map(function (z) { return String(z.nombre).split(" ")[0] + " " + fN(num(z.cant)); }).join(" · "); x = (o.equipoTarea || {})[k]; if (x && x.length) return x.join(" y "); return (o.asignada || {})[k] || "toda la cuadrilla"; };
      for (var i = 0; i < (c.tareas || []).length; i++) {
        var t = c.tareas[i], tr = tareaDe(t.tarea); if (tr.err) return { err: tr.err }; var k = tr.t.id, lab = tr.t.label;
        if ((o.actividades || []).indexOf(k) < 0 && !(pat.actividades || []).length) return { err: "La tarea «" + lab + "» no está en " + (o.numero || "la orden") + ": sumala primero." };
        if (t.quienes && t.quienes.length > 1) { var qs = []; for (var j = 0; j < t.quienes.length; j++) { var n = gente(per, t.quienes[j]); if (!n) return { err: "«" + t.quienes[j] + "» no está en " + (o.numero || "la orden") + "." }; if (qs.indexOf(n) < 0) qs.push(n); } sacar(k); if (qs.length > 1) eqT[k] = qs; else asig[k] = qs[0]; toco[k] = qs.join(" y ") + (qs.length > 1 ? " (juntos)" : ""); }
        if (t.reparto && t.reparto.length) { var l = []; for (var j2 = 0; j2 < t.reparto.length; j2++) { var y = t.reparto[j2] || {}, n2 = gente(per, y.persona); if (!n2) return { err: "«" + y.persona + "» no está en " + (o.numero || "la orden") + "." }; var e = { nombre: n2, cant: num(y.cantidad) }; if ((y.columnas || []).length) e.cols = y.columnas.map(String); l.push(e); } sacar(k); rep[k] = l; toco[k] = l.map(function (z) { return String(z.nombre).split(" ")[0] + " " + fN(z.cant) + (z.cols ? " (" + colsTxt(z.cols) + ")" : ""); }).join(" · "); if (l.some(function (z) { return z.cols; })) cols[k] = [].concat.apply([], l.map(function (z) { return z.cols || []; })); }
        if (t.columnas && t.columnas.length) { cols[k] = t.columnas.map(String); filas.push({ c: "Columnas de «" + lab + "»", a: ((o.columnas || {})[k] || []).join(", ") || "las que siguen", d: cols[k].join(", ") }); }
        if (toco[k]) filas.push({ c: "Quién hace «" + lab + "»", a: antesQ(k), d: toco[k] });
      }
      if (Object.keys(toco).length) { pat.asignada = asig; pat.equipoTarea = eqT; pat.equipos = eqs; pat.reparto = rep; }
      if (JSON.stringify(cols) !== JSON.stringify(o.columnas || {})) pat.columnas = cols;
      if (c.horario) {
        var hh = leerHorario(c.horario, per); if (hh.err) return { err: hh.err };
        var H0 = Object.assign({}, o.horario || {}), ini = pat.horaInicio || o.horaInicio || "", fin = pat.horaFin || o.horaFin || "";
        Object.keys(hh.h).forEach(function (n) { var v = hh.h[n], k0 = Object.keys(H0).filter(function (x) { return nk(x) === nk(n); })[0]; if (k0) delete H0[k0]; if ((v.desde || ini) === ini && (v.hasta || fin) === fin) return; H0[n] = { desde: v.desde || ini, hasta: v.hasta || fin }; });
        var antesH = window.__hor173 ? window.__hor173.gruposTxt(o, true) : "", despH = window.__hor173 ? window.__hor173.gruposTxt(Object.assign({}, o, { horario: H0 }), true) : "";
        if (JSON.stringify(H0) !== JSON.stringify(o.horario || {})) { pat.horario = H0; filas.push({ c: "Horario", a: antesH || "toda la jornada", d: despH || "toda la jornada" }); }
      }
      if (!filas.length) return { err: "No hay ningún cambio: la orden ya está así." };
      if (!P) { P = nuevaProp("editar_orden", { coleccion: "ordenesTrabajo", id: o.id, titulo: "✏ Cambiar " + (o.numero || "la orden"), sub: String(o.plazaNombre || "").toUpperCase() + " · " + fLarga(o.fecha), filas: filas, avisos: avisos, patch: pat, nuevos: 0, motivo: String(a.motivo || "").slice(0, 200), pie: "Se guarda como «Guardar cambios» de la orden: el número no cambia." }); }
      return pendiente(P, { orden: o.numero || "" });
    };
    // ---------- cierre del día por voz: «hasta las 2» → horas
    if (H.proponer_cierre_dia) {
      var tc = TOOLS.filter(function (x) { return x.name === "proponer_cierre_dia"; })[0];
      if (tc) { var io = tc.input_schema.properties.ordenes.items; io.properties.hasta = { type: "object", description: "hasta qué hora estuvo cada uno: { nombre completo: \"HH:MM\" } (ej. «Pablo y Pedro hasta las 2» → 14:00); la app saca las horas desde la hora de inicio de la orden o su horario" }; }
      var baseCd = H.proponer_cierre_dia;
      H.proponer_cierre_dia = function (a) {
        a = a ? JSON.parse(JSON.stringify(a)) : {};
        (a.ordenes || []).forEach(function (x) {
          if (!x || !x.hasta) return; var o = otPorRef(x.otId); if (!o) return;
          var ps = (o.personal || []).map(function (p) { return typeof p == "string" ? { nombre: p } : p; }).filter(function (p) { return p && p.nombre; });
          x.horas = Object.assign({}, x.horas || {});
          Object.keys(x.hasta).forEach(function (n) {
            var nm = gente(ps, n), ha = horaDe(x.hasta[n]); if (!nm || !ha) return;
            var h0 = window.__hor173 ? window.__hor173.horarioDe(o, nm) : null, ini = (h0 && h0.desde) || o.horaInicio || "07:00";
            var hs = window.__hor173 ? window.__hor173.horasEntre(ini, ha) : 0; if (hs > 0) x.horas[nm] = hs;
          });
          delete x.hasta;
        });
        return baseCd(a);
      };
    }
  })();
