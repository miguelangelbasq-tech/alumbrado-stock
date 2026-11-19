  // ---------- v175 · el asistente carga el personal (Ángel 19/11, después de que se pisó la nómina: «la IA de la app tiene que
  //  poder cargar por su cuenta el personal»). nomina = la nómina y los vehículos de la base (solo si ya llegaron) + lo que
  //  falta según «🔎 Qué se borró» de la v174 (de dónde sale cada dato). proponer_personal = altas (una o una lista dictada o
  //  pegada), cambios, bajas (activo:false, nunca se borra), vehículo a cargo / equipo civil y «recuperá lo que se borró» (el
  //  mismo motor de la v174); proponer_vehiculo = altas y cambios de vehículos. Nombres prolijos (fmtNombre), repetidos y
  //  parecidos → pregunta (no duplica), legajo y valor hora NUNCA inventados («a completar»). Todo por la guardia de la v174
  //  (__psGuardia: la base llegó, copia en respaldos[], «Sí» si se saca algo) y leído de vuelta («✓ Guardado: N personas»).
  //  Solo admin/oficina con «editar» en Producción (Dirección, cuadrilla, pañol y mirar no reciben las proponer_*).
  if (!window.__v175No) (function ia175() {
    var arr = function (x) { return Array.isArray(x) ? x : []; };
    var obj = function (x) { return x && typeof x == "object" ? x : {}; };
    var base = function () { return obj(window.__personalNube); };
    var nomBase = function () { var b = base(); return arr(b.nomina).length ? arr(b.nomina) : arr(b.lista); };
    var vehBase = function () { return arr(base().vehiculos); };
    var cargado = function () { return !!window.__personalCargado; };
    var NO_LLEGO = "Todavía no llegó la nómina de la base a este aparato: no la muestro ni la cambio para no pisar nada. Esperá unos segundos y probá de nuevo.";
    function okRol() { var n = nivelRol(); return (n === "admin" || n === "oficina") && edita("produccion"); }
    function plata() { var n = nivelRol(); return n === "admin" || n === "oficina"; }
    function titulo(s) { return String(s || "").toLowerCase().replace(/(^|[\s'-])([a-záéíóúñü])/g, function (m, a, b) { return a + b.toUpperCase(); }); }
    function prolijo(n) { n = String(n || "").replace(/\s+/g, " ").trim(); n = titulo(n); try { if (window.__fmtNombre && window.__fmtNombre.persona) return window.__fmtNombre.persona(n) || n; } catch (e) { } return n; }
    function lev(a, b) { if (a === b) return 0; var m = a.length, n = b.length, d = [], i, j; if (Math.abs(m - n) > 3) return 9; for (i = 0; i <= n; i++) d[i] = i; for (i = 1; i <= m; i++) { var p = d[0]; d[0] = i; for (j = 1; j <= n; j++) { var t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1)); p = t; } } return d[n]; }
    // «igual» = mismo nombre; «parecido» = las palabras del más corto están en el más largo, o 1–2 letras de diferencia
    function parecido(a, b) {
      a = nk(a); b = nk(b); if (!a || !b) return ""; if (a === b) return "igual";
      var x = a.split(" "), y = b.split(" "), c = x.length <= y.length ? x : y, l = x.length <= y.length ? y : x;
      if (c.length >= 2 && c.every(function (w) { return l.indexOf(w) >= 0; })) return "parecido";
      if (a.split(" ").sort().join(" ") === b.split(" ").sort().join(" ")) return "parecido";
      if (Math.min(a.length, b.length) >= 6 && lev(a, b) <= 2) return "parecido";
      return "";
    }
    function rolDe(t) {
      var q = nk(t), R = (typeof ROLES_CUADRILLA != "undefined" && ROLES_CUADRILLA) || ["Oficial", "Medio oficial", "Ayudante", "Capataz", "Chofer", "Sereno"];
      if (!q) return ""; var r = R.filter(function (x) { return nk(x) === q; })[0]; if (r) return r;
      if (/medio/.test(q)) return "Medio oficial";
      r = R.filter(function (x) { return nk(x).indexOf(q) === 0 || q.indexOf(nk(x)) === 0; })[0];
      return r || "";
    }
    function numDe(v) { if (v == null || v === "") return null; if (typeof v == "number") return isFinite(v) ? v : null; var s = String(v).replace(/[^\d,.]/g, ""); if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, "").replace(",", "."); else s = s.replace(/[.,]/g, ""); var n = Number(s); return isFinite(n) && s ? n : null; }
    function sectorDe(t) { var q = nk(t); if (!q) return ""; if (/ilici/.test(q)) return "ilicitos"; if (/alumbr/.test(q)) return "alumbrado"; return ""; }
    var TIPOS = { grua: /gru/, hidro: /hidro/, barquilla: /barqu/, transporte: /transp|camion|camioneta|traf|utilit/, auto: /auto|movil/ };
    function tipoDe(t) { var q = nk(t); if (!q) return ""; for (var k in TIPOS) if (q === k || TIPOS[k].test(q)) return k; return ""; }
    function vehDe(q, l) {
      var z = nk(q); if (!z) return { v: null };
      var m = l.filter(function (v) { return v && (v.id === String(q).trim() || nk(v.patente).replace(/\s/g, "") === z.replace(/\s/g, "") || nk(v.nombre) === z); });
      if (m.length === 1) return { v: m[0] };
      m = l.filter(function (v) { return v && v.nombre && (nk(v.nombre).indexOf(z) >= 0 || z.indexOf(nk(v.nombre)) >= 0); });
      if (m.length === 1) return { v: m[0] };
      return { err: m.length ? "«" + q + "» puede ser: " + m.map(function (v) { return v.nombre + (v.patente ? " " + v.patente : ""); }).join(", ") + "." : "No hay ningún vehículo «" + q + "» (vehículos: " + (l.map(function (v) { return v.nombre; }).join(", ") || "ninguno") + ")." };
    }
    function perDe(q, l) {
      var z = nk(q); if (!z) return { err: "Falta el nombre." };
      var m = l.filter(function (p) { return p && nk(p.nombre) === z; }); if (m.length === 1) return { p: m[0] };
      m = l.filter(function (p) { return p && parecido(p.nombre, q); });
      if (m.length === 1) return { p: m[0] };
      if (!m.length) m = l.filter(function (p) { return p && z.split(" ").filter(function (w) { return w.length > 2; }).every(function (w) { return nk(p.nombre).indexOf(w) >= 0; }); });
      if (m.length === 1) return { p: m[0] };
      return { err: m.length ? "«" + q + "» puede ser: " + m.map(function (p) { return p.nombre; }).join(", ") + "." : "«" + q + "» no está en la nómina." };
    }
    var fmV = function (v) { return v ? v.nombre + (v.patente ? " · " + v.patente : "") : ""; };
    function txtPer(p, vl, fuentes) {
      fuentes = fuentes || {};
      var vv = p.vehiculoId ? vl.filter(function (v) { return v.id === p.vehiculoId; })[0] : null, s = [];
      s.push(p.rol ? p.rol + (p.rolAConfirmar ? " (a confirmar)" : "") : "rol a completar");
      s.push(p.legajo ? "leg. " + p.legajo : "legajo a completar");
      if (plata()) s.push(p.valorHora ? "$ " + fN(p.valorHora) + "/h" : "valor hora a completar");
      if (p.sector && p.sector !== "alumbrado") s.push("sector " + p.sector);
      if (vv) s.push("🚚 " + vv.nombre); else if (p.vehiculoId) s.push("🚚 " + p.vehiculoId);
      if (p.equipoCivil) s.push("equipo civil");
      if (p.activo === false) s.push("de baja");
      return s.join(" · ");
    }
    // ---------- aplicar los cambios sobre una copia (al proponer y otra vez al guardar, sobre lo que hay en la base en ese momento)
    function aplicar(ops, nom, veh) {
      var hecho = [], salteado = [];
      arr(ops.vAltas).forEach(function (a, i) {
        if (veh.some(function (v) { return v && ((a.id && v.id === a.id) || nk(v.nombre) === nk(a.nombre) || (a.patente && nk(v.patente) === nk(a.patente))); })) { salteado.push("vehículo " + a.nombre + " (ya estaba)"); return; }
        var v = { id: a.id && !/^n:/.test(a.id) ? a.id : "v" + Date.now().toString(36) + i, nombre: String(a.nombre || "").trim(), patente: String(a.patente || "").trim().toUpperCase(), comb: a.comb || "", cuadrilla: a.cuadrilla || "", activo: a.activo !== false, tipo: a.tipo || "", lugares: Number(a.lugares) > 0 ? Math.round(Number(a.lugares)) : null };
        veh.push(v); a.id = v.id; hecho.push("vehículo " + v.nombre);
      });
      arr(ops.vCambios).forEach(function (c) { var v = veh.filter(function (x) { return x && x.id === c.id; })[0]; if (!v) { salteado.push("vehículo " + c.nombre + " (no está)"); return; } Object.keys(c.set || {}).forEach(function (k) { v[k] = c.set[k]; }); hecho.push("vehículo " + v.nombre); });
      arr(ops.altas).forEach(function (a) {
        var ya = nom.filter(function (p) { return p && (nk(p.nombre) === nk(a.nombre) || (!a.esOtra && parecido(p.nombre, a.nombre)) || (!a.esOtra && a.legajo && String(p.legajo || "") === String(a.legajo))); })[0];
        if (ya) { salteado.push(a.nombre + " (ya está como «" + ya.nombre + "»)"); return; }
        var p = { legajo: a.legajo || "", nombre: a.nombre, sector: a.sector || "alumbrado", rol: a.rol || "Ayudante", valorHora: a.valorHora || 0, vehiculoId: a.vehiculoId || "", activo: a.activo !== false };
        if (!a.rol) p.rolAConfirmar = true;
        if (a.equipoCivil) p.equipoCivil = true;
        nom.push(p); hecho.push(a.nombre);
      });
      arr(ops.cambios).forEach(function (c) { var p = nom.filter(function (x) { return x && nk(x.nombre) === nk(c.nombre); })[0]; if (!p) { salteado.push(c.nombre + " (no está)"); return; } Object.keys(c.set || {}).forEach(function (k) { if (k === "rol") delete p.rolAConfirmar; p[k] = c.set[k]; }); hecho.push(c.set.nombre || c.nombre); });
      arr(ops.bajas).forEach(function (b) { var p = nom.filter(function (x) { return x && nk(x.nombre) === nk(b.nombre); })[0]; if (!p) { salteado.push(b.nombre + " (no está)"); return; } p.activo = false; p.bajaTs = Date.now(); if (b.motivo) p.bajaMotivo = b.motivo; hecho.push(b.nombre + " (baja)"); });
      arr(ops.aCargo).forEach(function (x) { var p = nom.filter(function (y) { return y && nk(y.nombre) === nk(x.nombre); })[0], v = veh.filter(function (y) { return y && (y.id === x.vid || nk(y.nombre) === nk(x.vnombre)); })[0]; if (p && v) { p.vehiculoId = v.id; hecho.push(p.nombre + " → " + v.nombre); } });
      return { hecho: hecho, salteado: salteado };
    }
    async function guardar(P) {
      var d = P.datos;
      if (!cargado()) throw Object.assign(new Error(NO_LLEGO), { code: "ps-cargando" });
      if (!window.__psGuardia) throw new Error("Falta la guardia de la nómina (v174): no se guardó nada.");
      var nom0 = clon(nomBase()) || [], veh0 = clon(vehBase()) || [], nom = clon(nom0), veh = clon(veh0);
      var ops = clon(d.ops), r = aplicar(ops, nom, veh);
      if (!r.hecho.length) throw new Error("No había nada para cambiar" + (r.salteado.length ? ": " + r.salteado.join(", ") : "") + ".");
      var yoE = String((window.__fbUser || {}).email || ""), ahora = Date.now(), patch = { nomina: nom, ts: ahora, usuario: yoE };
      if (JSON.stringify(veh) !== JSON.stringify(veh0)) { patch.vehiculos = veh; patch.vehiculosTs = ahora; patch.vehiculosPor = yoE; }
      var p2 = await window.__psGuardia(patch, { accion: "personal_guardar" });
      await firebase.firestore().collection("configEquipo").doc("personal").set(p2, { merge: true });
      window.__personalNube = Object.assign({}, base(), p2);
      try { window.aplicarPersonalDeLaNube && window.aplicarPersonalDeLaNube(); } catch (e) { }
      var ver = "";
      try { var s = await firebase.firestore().collection("configEquipo").doc("personal").get(), x = s.exists ? s.data() || {} : {}, nn = arr(x.nomina).length ? arr(x.nomina) : arr(x.lista); ver = "✓ Guardado: " + nn.length + " personas" + (nn.some(function (q) { return q && q.activo === false; }) ? " (" + nn.filter(function (q) { return q && q.activo !== false; }).length + " activas)" : "") + ", " + arr(x.vehiculos).length + " vehículos (leído de vuelta de la base)."; }
      catch (e) { ver = "⚠ Se mandó a la base pero no pude leerlo de vuelta: fijate en un rato en Producción › Personal del equipo."; }
      try { window.fbAuditar && window.fbAuditar("personal_asistente", (d.titulo + " · " + r.hecho.join(", ")).slice(0, 480), { porAsistente: true, coleccion: "configEquipo", ref: "personal", hecho: r.hecho, salteado: r.salteado, antes: { personas: nom0.length, vehiculos: veh0.length }, despues: { personas: nom.length, vehiculos: veh.length }, motivo: d.motivo || "", recuperar: !!d.recuperar }); } catch (e) { }
      return { antes: { nomina: nom0, vehiculos: veh0 }, despues: { personas: nom.length, vehiculos: veh.length }, ref: "personal", txt: ver + " " + r.hecho.length + " cambio" + (r.hecho.length === 1 ? "" : "s") + ": " + r.hecho.slice(0, 12).join(", ") + (r.hecho.length > 12 ? "…" : "") + "." + (r.salteado.length ? " No se tocó: " + r.salteado.join(", ") + "." : "") + (d.aCompletar && d.aCompletar.length ? " Quedó a completar: " + d.aCompletar.join("; ") + "." : "") };
    }
    GUARDAR.personal175 = guardar;
    GUARDAR.vehiculo175 = guardar;
    // ---------- lo que falta según la v174 («🔎 Qué se borró»)
    async function analisis() {
      var R = window.__psRec; if (!R || !R.analizar) return null;
      try { R.leerMas && await R.leerMas(); } catch (e) { }
      try { return R.analizar(); } catch (e) { return null; }
    }
    var CAMPO_TXT = { legajo: "legajo", rol: "rol", sector: "sector", valorHora: "valor hora", vehiculoId: "vehículo a cargo", equipoCivil: "equipo civil", activo: "de baja" };
    H.nomina = async function (a) {
      if (!ve("produccion", "parte")) return { err: "No tenés permiso para ver la nómina." };
      if (!cargado()) return { r: { cargada: false, nota: NO_LLEGO } };
      var vl = vehBase(), conPlata = plata(), q = nk((a || {}).texto || "");
      var l = nomBase().filter(function (p) { return p && String(p.nombre || "").trim(); });
      if (q) l = l.filter(function (p) { return nk(p.nombre).indexOf(q) >= 0 || parecido(p.nombre, q) || String(p.legajo || "") === q; });
      var per = l.slice(0, 80).map(function (p) { var v = p.vehiculoId ? vl.filter(function (x) { return x.id === p.vehiculoId; })[0] : null, o = { legajo: p.legajo || "(a completar)", nombre: p.nombre, rol: p.rol || "", sector: p.sector || "alumbrado", vehiculoACargo: v ? fmV(v) : p.vehiculoId ? "(vehículo " + p.vehiculoId + " que no está en la lista)" : "", equipoCivil: !!p.equipoCivil, activo: p.activo !== false }; if (p.rolAConfirmar) o.rolAConfirmar = true; if (conPlata) o.valorHora = p.valorHora ? p.valorHora : "(a completar)"; return o; });
      var veh = vl.map(function (v) { return { id: v.id, nombre: v.nombre, patente: v.patente || "", tipo: v.tipo || "", lugares: v.lugares || null, aCargo: nomBase().filter(function (p) { return p && p.vehiculoId === v.id && p.activo !== false; }).map(function (p) { return p.nombre; }), activo: v.activo !== false }; });
      var r = { cargada: true, personas: per, totalPersonas: nomBase().length, activas: nomBase().filter(function (p) { return p && p.activo !== false; }).length, vehiculos: veh, ultimoGuardado: base().ts ? fCorta(isoDe(new Date(base().ts))) + (base().usuario ? " por " + base().usuario : "") : "sin fecha" };
      if (!q) {
        var A = await analisis();
        if (A) {
          r.faltan = {
            nota: "Según «🔎 Qué se borró» (v174): personas y vehículos que aparecen en órdenes, quincenas, usuarios o copias pero no están en la nómina, con de dónde sale cada dato. Para cargarlos: proponer_personal con recuperar:true.",
            personas: A.faltan.slice(0, 40).map(function (f) { var o = { nombre: f.nombre, ultimaOrden: f.ultima || "", datos: {} }; Object.keys(f.datos).forEach(function (k) { if (k === "valorHora" && !conPlata) return; o.datos[CAMPO_TXT[k] || k] = String(f.datos[k].v) + " (de " + f.datos[k].fuente + ")"; }); return o; }),
            completar: A.completar.filter(function (x) { return conPlata || x.campo !== "valorHora"; }).slice(0, 40).map(function (x) { return x.nombre + ": " + x.txt + " " + x.v + " (de " + x.fuente + ")"; }),
            vehiculos: A.vFaltan.slice(0, 20).map(function (x) { return { nombre: x.v.nombre || "(sin nombre)", patente: x.v.patente || "", de: x.fuente, soloElNumero: !!x.soloId }; }),
            perdido: A.perdido.filter(function (x) { return conPlata || !/valor hora/.test(x); }).slice(0, 40)
          };
        }
      }
      return { r: r };
    };
    // ---------- proponer_personal
    function altaDe(a, nom, vl, dudas, avisos) {
      var nombre = prolijo(a.nombre); if (!nombre) { avisos.push("Una persona sin nombre: no la cargo."); return null; }
      var o = { nombre: nombre, legajo: String(a.legajo == null ? "" : a.legajo).replace(/\D/g, ""), rol: rolDe(a.rol), sector: sectorDe(a.sector) || "alumbrado", valorHora: numDe(a.valor_hora) || 0, vehiculoId: "", equipoCivil: !!a.equipo_civil, esOtra: !!a.es_otra_persona, fuentes: {} };
      if (a.rol && !o.rol) avisos.push(nombre + ": no conozco el rol «" + a.rol + "» (Oficial, Medio oficial, Ayudante, Capataz, Chofer, Sereno): queda «a confirmar».");
      if (a.vehiculo) { var v = vehDe(a.vehiculo, vl); if (v.v) o.vehiculoId = v.v.id; else avisos.push(nombre + ": " + v.err); }
      if (!o.esOtra) {
        var c = nom.filter(function (p) { return p && (parecido(p.nombre, nombre) || (o.legajo && String(p.legajo || "") === o.legajo)); });
        if (c.length) { dudas.push({ persona: nombre, yaEsta: c.map(function (p) { return p.nombre + (p.legajo ? " (leg. " + p.legajo + ")" : "") + (p.activo === false ? " — de baja" : ""); }), porque: c.some(function (p) { return o.legajo && String(p.legajo || "") === o.legajo; }) ? "mismo legajo" : c.some(function (p) { return nk(p.nombre) === nk(nombre); }) ? "mismo nombre" : "nombre parecido" }); return null; }
      }
      return o;
    }
    function setDe(c, p, vl, avisos, aCargo) {
      var s = {};
      if (c.nombre_nuevo) s.nombre = prolijo(c.nombre_nuevo);
      if (c.legajo != null && c.legajo !== "") s.legajo = String(c.legajo).replace(/\D/g, "");
      if (c.rol) { var r = rolDe(c.rol); if (r) s.rol = r; else avisos.push(p.nombre + ": no conozco el rol «" + c.rol + "»."); }
      if (c.sector) { var se = sectorDe(c.sector); if (se) s.sector = se; }
      if (c.valor_hora != null && c.valor_hora !== "") { var n = numDe(c.valor_hora); if (n != null) s.valorHora = n; }
      if (c.equipo_civil != null) s.equipoCivil = !!c.equipo_civil;
      if (c.reactivar) s.activo = true;
      if (c.vehiculo != null) { if (/^(|ninguno|nada|sin vehiculo|sin vehículo)$/i.test(String(c.vehiculo).trim())) s.vehiculoId = ""; else { var v = vehDe(c.vehiculo, vl); if (v.v) s.vehiculoId = v.v.id; else avisos.push(p.nombre + ": " + v.err); } }
      Object.keys(s).forEach(function (k) { if (JSON.stringify(p[k] == null ? "" : p[k]) === JSON.stringify(s[k])) delete s[k]; });
      return s;
    }
    function filaHtml(ic, tit, sub) { return '<div class="ia-conf-f">' + ic + " " + tit + (sub ? "<br><small>" + sub + "</small>" : "") + "</div>"; }
    H.proponer_personal = async function (a) {
      a = a || {};
      if (!puedeAcciones()) return SIN_ACC;
      if (!okRol()) return { err: "Solo Administración y Oficina (con «editar» en Producción) cargan o cambian el personal." };
      if (!cargado()) return { err: NO_LLEGO };
      var nom = clon(nomBase()) || [], vl = vehBase(), ops = { altas: [], cambios: [], bajas: [], vAltas: [], vCambios: [], aCargo: [] };
      var dudas = [], avisos = [], filas = [], html = "", aCompletar = [];
      if (a.recuperar) {
        var A = await analisis(); if (!A) return { err: "El motor de «🩹 Recuperar personal y vehículos» (v174) no está en esta app." };
        A.faltan.forEach(function (f) {
          var o = { nombre: f.nombre, fuentes: {} }; ["legajo", "rol", "sector", "valorHora", "vehiculoId", "equipoCivil"].forEach(function (k) { if (f.datos[k]) { o[k] = f.datos[k].v; o.fuentes[k] = f.datos[k].fuente; } });
          if (f.datos.activo && f.datos.activo.v === "no") o.activo = false;
          ops.altas.push(o);
        });
        A.completar.forEach(function (x) { var c = ops.cambios.filter(function (y) { return y.nombre === x.nombre; })[0]; if (!c) { c = { nombre: x.nombre, set: {}, fuentes: {} }; ops.cambios.push(c); } c.set[x.campo] = x.v; c.fuentes[x.campo] = x.fuente; });
        A.vFaltan.forEach(function (x) { if (x.soloId) { avisos.push("Vehículo «" + x.id + "»: solo aparece el número en Gastos (sin nombre ni patente): cargalo a mano."); return; } ops.vAltas.push(Object.assign({ fuente: x.fuente }, clon(x.v))); });
        A.vCompletar.forEach(function (x) { var c = ops.vCambios.filter(function (y) { return y.id === x.id; })[0]; if (!c) { c = { id: x.id, nombre: x.nombre, set: {}, fuentes: {} }; ops.vCambios.push(c); } c.set[x.campo] = x.v; c.fuentes[x.campo] = x.fuente; });
        A.perdido.forEach(function (x) { if (plata() || !/valor hora/.test(x)) aCompletar.push(x); });
      }
      arr(a.altas).forEach(function (x) { var o = altaDe(x || {}, nom.concat(ops.altas), vl, dudas, avisos); if (o) ops.altas.push(o); });
      arr(a.cambios).forEach(function (c) {
        c = c || {}; var r = perDe(c.persona, nom); if (r.err) { avisos.push(r.err); return; }
        var s = setDe(c, r.p, vl, avisos); if (!Object.keys(s).length) { avisos.push(r.p.nombre + ": con eso no cambia nada."); return; }
        var y = ops.cambios.filter(function (z) { return z.nombre === r.p.nombre; })[0]; if (y) Object.assign(y.set, s); else ops.cambios.push({ nombre: r.p.nombre, set: s, fuentes: {} });
      });
      arr(a.bajas).forEach(function (b) {
        b = typeof b == "string" ? { persona: b } : b || {}; var r = perDe(b.persona, nom); if (r.err) { avisos.push(r.err); return; }
        if (r.p.activo === false) { avisos.push(r.p.nombre + " ya estaba de baja."); return; }
        ops.bajas.push({ nombre: r.p.nombre, motivo: String(b.motivo || a.motivo || "") });
      });
      if (dudas.length && !ops.altas.length && !ops.cambios.length && !ops.bajas.length && !ops.vAltas.length) return { r: { estado: "preguntar", dudas: dudas, avisos: avisos, instruccion: "No armé la tarjeta: " + dudas.map(function (x) { return x.persona + " se parece a " + x.yaEsta.join(" / ") + " (" + x.porque + ")"; }).join("; ") + ". Preguntale si es la misma persona (entonces usá cambios sobre la que ya está) o si es otra (volvé a llamar con es_otra_persona:true)." } };
      // simular para la tarjeta
      var n2 = clon(nom), v2 = clon(vl) || [], res = aplicar(clon(ops), n2, v2);
      if (!res.hecho.length) return { err: "No hay nada para cargar" + (res.salteado.length ? ": " + res.salteado.join(", ") : "") + (avisos.length ? ". " + avisos.join(" ") : ".") };
      var fte = function (f) { var k = Object.keys(f || {}); return k.length ? k.map(function (q) { return (CAMPO_TXT[q] || q) + ": " + esc(f[q]); }).join(" · ") : ""; };
      ops.altas.forEach(function (o) {
        var p = n2.filter(function (x) { return nk(x.nombre) === nk(o.nombre); })[0]; if (!p) return;
        filas.push({ c: "＋ " + o.nombre, a: "—", d: txtPer(p, v2) });
        var falta = []; if (!p.legajo) falta.push("legajo"); if (plata() && !p.valorHora) falta.push("valor hora"); if (p.rolAConfirmar) falta.push("rol"); if (falta.length) aCompletar.push(o.nombre + ": " + falta.join(", "));
        if (Object.keys(o.fuentes || {}).length) html += filaHtml("📄", "<b>" + esc(o.nombre) + "</b> sale de", fte(o.fuentes));
      });
      ops.cambios.forEach(function (c) {
        var p0 = nom.filter(function (x) { return nk(x.nombre) === nk(c.nombre); })[0], p = n2.filter(function (x) { return nk(x.nombre) === nk(c.set.nombre || c.nombre); })[0]; if (!p0 || !p) return;
        Object.keys(c.set).forEach(function (k) { var a0 = p0[k], d0 = p[k]; if (k === "vehiculoId") { a0 = fmV(v2.filter(function (v) { return v.id === a0; })[0]) || "—"; d0 = fmV(v2.filter(function (v) { return v.id === d0; })[0]) || "ninguno"; } if (k === "valorHora") { if (!plata()) return; a0 = a0 ? "$ " + fN(a0) : "—"; d0 = "$ " + fN(d0); } if (k === "equipoCivil") { a0 = a0 ? "sí" : "no"; d0 = d0 ? "sí" : "no"; } if (k === "activo") { a0 = "de baja"; d0 = "activo"; } filas.push({ c: c.nombre + " · " + (CAMPO_TXT[k] === "de baja" ? "estado" : CAMPO_TXT[k] || k), a: a0 == null || a0 === "" ? "—" : a0, d: d0 }); });
        if (Object.keys(c.fuentes || {}).length) html += filaHtml("📄", "<b>" + esc(c.nombre) + "</b>: lo que se completa sale de", fte(c.fuentes));
      });
      ops.bajas.forEach(function (b) { filas.push({ c: "⏸ " + b.nombre, a: "activo", d: "de baja (no se borra)" }); });
      ops.vAltas.forEach(function (v) { if (res.salteado.indexOf("vehículo " + v.nombre + " (ya estaba)") >= 0) return; filas.push({ c: "＋ 🚚 " + v.nombre, a: "—", d: [v.patente || "patente a completar", v.tipo || "tipo a completar", v.lugares ? v.lugares + " lugares" : ""].filter(Boolean).join(" · ") }); if (v.fuente) html += filaHtml("📄", "<b>" + esc(v.nombre) + "</b> sale de", esc(v.fuente)); });
      ops.vCambios.forEach(function (c) { Object.keys(c.set).forEach(function (k) { filas.push({ c: "🚚 " + c.nombre + " · " + k, a: "—", d: c.set[k] }); }); });
      if (res.salteado.length) avisos.push("No se toca: " + res.salteado.join(", ") + ".");
      if (dudas.length) avisos.push("Sin cargar hasta que me digas si es la misma persona: " + dudas.map(function (x) { return x.persona + " ≈ " + x.yaEsta.join(" / "); }).join("; ") + ".");
      if (aCompletar.length) html += filaHtml("✍", "<b>A completar</b> (no lo invento)", esc(aCompletar.slice(0, 30).join(" · ")) + (aCompletar.length > 30 ? "…" : ""));
      var na = ops.altas.filter(function (o) { return n2.some(function (x) { return nk(x.nombre) === nk(o.nombre); }); }).length;
      var tit = a.recuperar ? "🩹 Recuperar personal y vehículos" : "👷 Personal: " + [na ? na + " para cargar" : "", ops.cambios.length ? ops.cambios.length + " cambio" + (ops.cambios.length === 1 ? "" : "s") : "", ops.bajas.length ? ops.bajas.length + " de baja" : ""].filter(Boolean).join(" · ");
      var P = nuevaProp("personal175", { coleccion: "configEquipo", id: "personal", titulo: tit, sub: "Producción › Personal del equipo · queda " + n2.length + " personas (" + n2.filter(function (x) { return x.activo !== false; }).length + " activas), " + v2.length + " vehículos", filas: filas, html: html, avisos: avisos, ops: ops, motivo: String(a.motivo || ""), recuperar: !!a.recuperar, aCompletar: aCompletar, pie: "Se guarda por la guardia de la nómina: antes queda una copia de cómo está (respaldos), no se saca a nadie y se lee de vuelta de la base para confirmar." });
      return pendiente(P, { altas: ops.altas.map(function (o) { return o.nombre; }), dudas: dudas, aCompletar: aCompletar, instruccion: "La app ya le mostró la tarjeta (antes → después por persona). Decile en 1–2 líneas qué se carga, qué queda «a completar» (no lo inventes)" + (dudas.length ? " y preguntale por los parecidos (" + dudas.map(function (x) { return x.persona; }).join(", ") + ")" : "") + "; que confirme con «Sí, cargarlos»." });
    };
    // ---------- proponer_vehiculo
    H.proponer_vehiculo = async function (a) {
      a = a || {};
      if (!puedeAcciones()) return SIN_ACC;
      if (!okRol()) return { err: "Solo Administración y Oficina (con «editar» en Producción) cargan o cambian vehículos." };
      if (!cargado()) return { err: NO_LLEGO };
      var nom = nomBase(), vl = clon(vehBase()) || [], ops = { vAltas: [], vCambios: [], aCargo: [] }, avisos = [], filas = [], dudas = [];
      arr(a.altas).forEach(function (x, i) {
        x = x || {}; var nombre = String(x.nombre || "").replace(/\s+/g, " ").trim(); if (!nombre) { avisos.push("Un vehículo sin nombre: no lo cargo."); return; }
        var ya = vl.filter(function (v) { return nk(v.nombre) === nk(nombre) || (x.patente && nk(v.patente).replace(/\s/g, "") === nk(x.patente).replace(/\s/g, "")); });
        if (ya.length) { dudas.push(nombre + " ≈ " + ya.map(fmV).join(" / ")); return; }
        var id = "v" + Date.now().toString(36) + i, t = tipoDe(x.tipo);
        if (x.tipo && !t) avisos.push(nombre + ": no conozco el tipo «" + x.tipo + "» (grúa, hidro, barquilla, transporte, auto).");
        ops.vAltas.push({ id: id, nombre: nombre, patente: String(x.patente || "").toUpperCase().trim(), tipo: t, lugares: Number(x.lugares) > 0 ? Math.round(Number(x.lugares)) : null, activo: true });
        if (x.a_cargo) { var r = perDe(x.a_cargo, nom); if (r.p) ops.aCargo.push({ nombre: r.p.nombre, vid: id }); else avisos.push(r.err); }
      });
      arr(a.cambios).forEach(function (c) {
        c = c || {}; var r = vehDe(c.vehiculo, vl); if (!r.v) { avisos.push(r.err); return; }
        var s = {}; if (c.nombre_nuevo) s.nombre = String(c.nombre_nuevo).trim(); if (c.patente) s.patente = String(c.patente).toUpperCase().trim(); if (c.tipo) { var t = tipoDe(c.tipo); if (t) s.tipo = t; else avisos.push("no conozco el tipo «" + c.tipo + "»."); } if (Number(c.lugares) > 0) s.lugares = Math.round(Number(c.lugares)); if (c.activo != null) s.activo = !!c.activo;
        Object.keys(s).forEach(function (k) { if (r.v[k] === s[k]) delete s[k]; });
        if (Object.keys(s).length) ops.vCambios.push({ id: r.v.id, nombre: r.v.nombre, set: s });
        if (c.a_cargo) { var q = perDe(c.a_cargo, nom); if (q.p) ops.aCargo.push({ nombre: q.p.nombre, vid: r.v.id }); else avisos.push(q.err); }
      });
      if (dudas.length && !ops.vAltas.length && !ops.vCambios.length && !ops.aCargo.length) return { r: { estado: "preguntar", dudas: dudas, instruccion: "Ya hay un vehículo con ese nombre o patente: " + dudas.join("; ") + ". Preguntale si es el mismo (entonces cambios sobre ese) o uno nuevo con otro nombre." } };
      var n2 = clon(nom), v2 = clon(vl), res = aplicar(clon(ops), n2, v2);
      if (!res.hecho.length) return { err: "No hay nada para cambiar" + (avisos.length ? ": " + avisos.join(" ") : ".") };
      ops.vAltas.forEach(function (v) { filas.push({ c: "＋ 🚚 " + v.nombre, a: "—", d: [v.patente || "patente a completar", v.tipo || "tipo a completar", v.lugares ? v.lugares + " lugares" : "lugares a completar"].join(" · ") }); });
      ops.vCambios.forEach(function (c) { Object.keys(c.set).forEach(function (k) { var v0 = vl.filter(function (v) { return v.id === c.id; })[0] || {}; filas.push({ c: "🚚 " + c.nombre + " · " + k, a: v0[k] == null || v0[k] === "" ? "—" : v0[k], d: c.set[k] }); }); });
      ops.aCargo.forEach(function (x) { var p0 = nom.filter(function (p) { return p.nombre === x.nombre; })[0] || {}, v = v2.filter(function (q) { return q.id === x.vid; })[0]; filas.push({ c: x.nombre + " · vehículo a cargo", a: fmV(vl.filter(function (q) { return q.id === p0.vehiculoId; })[0]) || "—", d: fmV(v) }); });
      if (dudas.length) avisos.push("Sin cargar (ya hay uno igual): " + dudas.join("; ") + ".");
      var P = nuevaProp("vehiculo175", { coleccion: "configEquipo", id: "personal", titulo: "🚚 Vehículos: " + res.hecho.length + " cambio" + (res.hecho.length === 1 ? "" : "s"), sub: "Producción › Personal del equipo › Vehículos · quedan " + v2.length, filas: filas, avisos: avisos, ops: ops, motivo: String(a.motivo || ""), pie: "Se guarda por la guardia de la nómina (copia antes, se lee de vuelta de la base)." });
      return pendiente(P, { dudas: dudas, instruccion: "La app ya le mostró la tarjeta: decile en una línea qué se carga y que confirme con «Sí, cargarlos»." });
    };
    var PER = { nombre: TXT("nombre y apellido, como lo dijo"), legajo: TXT("legajo SOLO si lo dijo (si no, queda «a completar»)"), rol: TXT("Oficial, Medio oficial, Ayudante, Capataz, Chofer o Sereno"), sector: TXT("alumbrado (de entrada) o ilícitos"), valor_hora: { type: "number", description: "valor hora en pesos SOLO si lo dijo (si no, queda «a completar»)" }, vehiculo: TXT("vehículo a cargo (nombre o patente; «ninguno» para sacarlo)"), equipo_civil: { type: "boolean", description: "si es del equipo civil (pozos, hormigón, zanja)" } };
    TOOLS.push({ name: "nomina", description: "Lee la NÓMINA REAL de la base (Producción › Personal del equipo): cada persona con legajo, nombre, rol, sector, valor hora, vehículo a cargo, equipo civil y si está activa; los vehículos con patente, tipo, lugares y quién lo tiene a cargo; y lo que FALTA según «🔎 Qué se borró» (gente o vehículos que aparecen en órdenes, quincenas, usuarios o copias y no están en la nómina, con de dónde sale cada dato). Si la nómina todavía no llegó de la base, lo dice: no inventes. Usala antes de cargar o cambiar personal.", input_schema: S({ texto: TXT("nombre o legajo para buscar a alguien (opcional; sin texto = toda la nómina + lo que falta)") }) });
    TOOLS.push({ name: "proponer_personal", description: "PROPONE cargar, corregir o dar de baja PERSONAL en la nómina (NO lo guarda hasta el «Sí, cargarlos»): altas de una o varias personas (listas dictadas o pegadas: «sumá a Javier Olariaga, oficial, legajo 51333, valor hora 5200»), cambios (legajo, rol, sector, valor hora, vehículo a cargo, equipo civil, nombre, reactivar), bajas (quedan «de baja», nunca se borran) o recuperar:true = traer lo que se borró con el motor de «🩹 Recuperar personal y vehículos» (los que faltan con su rol, legajo y vehículo de las órdenes, quincenas y copias). La app revisa repetidos y parecidos (mismo legajo o nombre parecido → te devuelve «preguntar»: NO dupliques) y lo que falta queda «a completar». NUNCA inventes legajo ni valor hora.", input_schema: S({ altas: { type: "array", items: S(Object.assign({}, PER, { es_otra_persona: { type: "boolean", description: "true SOLO si la persona confirmó que es otra aunque se parezca a alguien de la nómina" } }), ["nombre"]) }, cambios: { type: "array", items: S(Object.assign({ persona: TXT("quién (como está en la nómina)"), nombre_nuevo: TXT("nombre corregido (opcional)"), reactivar: { type: "boolean" } }, (function () { var o = {}; Object.keys(PER).forEach(function (k) { if (k !== "nombre") o[k] = PER[k]; }); return o; })()), ["persona"]) }, bajas: { type: "array", items: S({ persona: TXT("quién"), motivo: TXT("por qué, si lo dijo") }, ["persona"]) }, recuperar: { type: "boolean", description: "true = «recuperá lo que se borró» (v174)" }, motivo: TXT("por qué (con sus palabras, opcional)") }) });
    TOOLS.push({ name: "proponer_vehiculo", description: "PROPONE cargar o cambiar VEHÍCULOS (NO lo guarda hasta el «Sí»): altas (nombre, patente, tipo grúa/hidro/barquilla/transporte/auto, lugares, a cargo de quién) y cambios (nombre, patente, tipo, lugares, activo, a cargo). Si ya hay uno con ese nombre o patente, pregunta. Lo que no dijo queda «a completar».", input_schema: S({ altas: { type: "array", items: S({ nombre: TXT("nombre (ej. «Hilux blanca»)"), patente: TXT("patente, si la dijo"), tipo: TXT("grua, hidro, barquilla, transporte o auto"), lugares: { type: "number" }, a_cargo: TXT("persona que lo tiene a cargo (de la nómina)") }, ["nombre"]) }, cambios: { type: "array", items: S({ vehiculo: TXT("cuál (nombre o patente)"), nombre_nuevo: TXT("nombre nuevo"), patente: TXT("patente"), tipo: TXT("tipo"), lugares: { type: "number" }, activo: { type: "boolean" }, a_cargo: TXT("persona a cargo") }, ["vehiculo"]) }, motivo: TXT("por qué (opcional)") }) });
    ACCIONES.push("proponer_personal", "proponer_vehiculo");
    Object.assign(ESTADOS, { nomina: "👷 Mirando la nómina…", proponer_personal: "👷 Preparando el personal…", proponer_vehiculo: "🚚 Preparando los vehículos…" });
    Object.assign(MIRO, { nomina: ["Nómina"], proponer_personal: ["Nómina"], proponer_vehiculo: ["Nómina", "Vehículos"] });
    CHIPS.push(["👷 Cargar personal", "Quiero cargar personal: ", false]);
    window.__ia175 = { parecido: parecido, rolDe: rolDe, numDe: numDe, prolijo: prolijo, aplicar: aplicar };
  })();
