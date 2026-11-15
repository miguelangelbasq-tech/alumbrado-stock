  // ---------- v155 · Dirección: pregunta todo como la oficina (plata, puntos, certificación…) pero no cambia nada. Si pide un
  //  cambio, se le ofrece dejárselo anotado a la oficina: anotar_para_oficina → tarjeta → «Sí» → aviso al celu de
  //  Administración y Oficina (__pushAvisos.dejarAviso). Es lo único que «escribe» (avisosPush y la auditoría).
  if (!window.__v155No) (function () {
    function oficinaDest() {
      var l = []; try { l = (PERMISOS.lista() || []).filter(function (u) { return u && u.email && u.activo !== false && u.pendiente !== true && (u.rol === "admin" || u.rol === "oficina"); }).map(function (u) { return String(u.email).toLowerCase(); }); } catch (e) { l = []; }
      return l.filter(function (x, i, a) { return a.indexOf(x) === i; });
    }
    H.anotar_para_oficina = function (a) {
      if (nivelRol() !== "direccion") return { err: "Eso es para Dirección: con tu usuario pedí el cambio con las otras herramientas." };
      var texto = String((a && a.texto) || "").trim(); if (!texto) return { err: "Falta qué le dejo anotado a la oficina." };
      if (texto.length > 400) texto = texto.slice(0, 400);
      var dest = oficinaDest();
      var P = nuevaProp("avisoOficina", { coleccion: "avisosPush", titulo: "📝 Dejarle anotado a la oficina", sub: dest.length ? "Les llega al celu a Administración y Oficina (" + dest.length + ")" : "No encontré a nadie de Administración u Oficina con usuario", filas: [], html: '<div class="ia-conf-f">💬 «' + esc(texto) + '»</div>', texto: texto, dest: dest, pie: "No cambia nada en la app: solo les deja el aviso para que lo hagan ellos." });
      return pendiente(P, { para: "Administración y Oficina", texto: texto, instruccion: "La app ya le mostró la tarjeta: decile que confirme con «Sí»." });
    };
    GUARDAR.avisoOficina = async function (P) {
      if (!window.__pushAvisos || !window.__pushAvisos.dejarAviso) throw new Error("los avisos no están listos en la app");
      var d = P.datos, n = 0, tag = "ema-dir-" + Date.now();
      for (var i = 0; i < d.dest.length; i++) { try { await window.__pushAvisos.dejarAviso({ email: d.dest[i], titulo: "📝 Pedido de Dirección · " + yoNombre(), cuerpo: d.texto, tipo: "direccion", tag: tag, url: "./" }); n++; } catch (e) { } }
      if (!n) throw new Error("no se pudo dejar el aviso (sin señal o sin permiso)");
      return { txt: "✅ Listo: se lo dejé anotado a la oficina (" + n + (n === 1 ? " persona" : " personas") + ").", antes: null, despues: { texto: d.texto, para: d.dest.length }, ref: "avisosPush" };
    };
    TOOLS.push({ name: "anotar_para_oficina", description: "SOLO DIRECCIÓN. Dirección no cambia nada en la app: cuando pide un cambio (una orden, un cierre, puntos, fotos, el pañol…), primero decile «Eso lo hace la oficina; ¿te lo dejo anotado para ellos?» y, si dice que sí, usá esta herramienta con el pedido en una o dos líneas, claro y con los datos (obra, orden, qué cambiar). Muestra una tarjeta; con «Sí» le llega un aviso al celu a Administración y Oficina. NO hace el cambio.", input_schema: S({ texto: TXT("el pedido para la oficina, ej. «Revisar los puntos de Juan en la OT-2026-160: dice que hizo 25 m»") }, ["texto"]) });
    Object.assign(ESTADOS, { anotar_para_oficina: "📝 Preparando la nota para la oficina…" });
    Object.assign(MIRO, { anotar_para_oficina: ["Avisos"] });
    // ---------- v155 · la cuadrilla (y el pañol y «solo mirar») le avisa a la oficina: avisar_oficina → «Sí, mandalo»
    var PR = function () { return window.__paraResolver || null; };
    H.avisar_oficina = function (a) {
      var R = PR(); if (!R) return { err: "Los avisos a la oficina no están en esta versión." };
      if (!R.puedeMandar()) return { err: nivelRol() === "direccion" ? "Dirección deja sus pedidos con anotar_para_oficina." : "Con tu usuario no se pueden mandar avisos desde acá." };
      var x = R.armar({ texto: a && a.texto, tipo: a && a.tipo, otId: a && a.otId, obra: a && a.obra, foto: !(a && a.foto === false), tarea: a && a.tarea, cuantos: a && a.cuantos, fecha: a && a.fecha });
      if (x.err) return { err: x.err };
      var T = R.TIPOS[x.tipo], rojo = x.tipo === "seguridad" || x.tipo === "urgente", modo = R.avisosA(), dest = R.DEST[modo];
      var html = '<div class="ia-conf-f">' + T[0] + ' <b>' + esc(T[1]) + '</b>' + (rojo ? ' <span style="color:#B42318;font-weight:700">· le llega marcado en rojo</span>' : '') + '</div><div class="ia-conf-f">💬 «' + esc(x.texto) + '»</div>' + (x.obraNombre || x.otNumero ? '<div class="ia-conf-f">📍 ' + esc([x.obraNombre, x.otNumero].filter(Boolean).join(" · ")) + '</div>' : '') + (x.tipo === "puntos" ? '<div class="ia-conf-f">⭐ ' + esc([x.tarea ? "Tarea: " + x.tarea : "", x.cuantos ? "dice que faltan " + x.cuantos + " pts" : ""].filter(Boolean).join(" · ") || "Reclamo de puntos") + (x.explicacion && x.explicacion.cuenta ? '<br><small>Va con lo que la app te explica hoy: ' + esc(String(x.explicacion.cuenta).slice(0, 220)) + '</small>' : '') + '</div>' : '') + (x.foto ? '<div class="ia-conf-f">📷 Con tu última foto de hoy' + (x.foto.mini ? '<br><img alt="" src="' + esc(x.foto.mini) + '" style="width:56px;height:56px;object-fit:cover;border-radius:10px;margin-top:4px">' : '') + '</div>' : '');
      var P = nuevaProp("avisoCuadrilla", { coleccion: "avisosCuadrilla", titulo: "📨 Le mando esto a Ángel", sub: "Le llega a " + dest + " (push y campanita) y queda en «Para resolver»", filas: [], html: html, aviso: x, pie: "Solo manda un mensaje: no cambia nada en la app. Te avisan cuando lo resuelven." });
      return pendiente(P, { mensaje: x.texto, tipo: T[1], obra: x.obraNombre, orden: x.otNumero, conFoto: !!x.foto, instruccion: "La app ya le mostró la tarjeta: decile corto que confirme con «Sí, mandalo»." });
    };
    GUARDAR.avisoCuadrilla = async function (P) {
      var R = PR(); if (!R) throw new Error("los avisos no están listos");
      var r = await R.mandar(P.datos.aviso);
      if (r.err) throw new Error(r.err);
      return { txt: "✅ Listo, se lo mandé" + (r.para ? " (" + r.para + (r.para === 1 ? " persona" : " personas") + ")" : "") + ". Queda en «Para resolver»: te aviso cuando te respondan.", antes: null, despues: { id: r.id, tipo: P.datos.aviso.tipo }, ref: "avisosCuadrilla/" + r.id };
    };
    H.mis_avisos = async function () {
      var R = PR(); if (!R) return { err: "Los avisos a la oficina no están en esta versión." };
      try { var l = await R.mios(); return { r: { total: l.length, avisos: l.slice(0, 15).map(function (x) { return { cuando: x.fecha + " " + (x.hora || ""), tipo: (R.TIPOS[x.tipo] || R.TIPOS.otro)[1], texto: x.texto, estado: x.estado === "resuelto" ? "resuelto" : x.estado === "autorizado" ? "autorizado (te corrigieron los puntos)" : x.estado === "rechazado" ? "no corresponde" : x.estado === "visto" || x.estado === "analizado" ? "lo vieron" : "todavía no lo vieron", motivo: x.decMotivo || "", respuesta: x.respuesta || "" }; }) } }; }
      catch (e) { return { err: "No pude leer tus avisos (sin señal o falta publicar las reglas nuevas)." }; }
    };
    H.avisos_cuadrilla = async function (a) {
      var R = PR(), n = nivelRol(); if (!R) return { err: "Los avisos no están en esta versión." };
      if (n !== "admin" && n !== "oficina" && n !== "direccion") return { err: NO_VE };
      return { r: await R.paraIa(a || {}) };
    };
    TOOLS.push({ name: "avisar_oficina", description: "Le MANDA UN AVISO a Ángel / la oficina de parte de esta persona (cuadrilla, pañol o solo mirar): un problema, falta de material, una pregunta, algo de seguridad o algo urgente. Para «avisale a Ángel que…», «decile a la oficina que…», «falta…», «se rompió…». Armá el texto claro y corto con lo que dijo (qué pasa, dónde, qué necesita); la app le suma su obra y orden de hoy, la hora y su última foto. Si es de seguridad o urgente, marcalo con ese tipo. Muestra una tarjeta «Le mando esto a Ángel» y se manda recién con «Sí, mandalo». No cambia datos.", input_schema: S({ texto: TXT("el aviso, claro, ej. «Falta un fusible de 2 A para la Col 3 de LOS ÁLAMOS»"), tipo: { type: "string", enum: ["problema", "falta_material", "pregunta", "seguridad", "urgente", "puntos", "otro"], description: "qué es (puntos = reclamo de puntos: «me faltaron puntos», «no me sumaron…»)" }, tarea: TXT("solo reclamo de puntos: la tarea que dice que le falta"), cuantos: { type: "number", description: "solo reclamo de puntos: cuántos puntos dice que le faltan, si lo dice" }, fecha: TXT("solo reclamo de puntos: la fecha de la orden (AAAA-MM-DD) si no sabe la OT"), otId: TXT("la orden (OT-AAAA-NNN), si no es la de hoy"), obra: TXT("la obra, si no es la de su orden de hoy"), foto: { type: "boolean", description: "false = sin adjuntar su última foto de hoy" } }, ["texto", "tipo"]) });
    TOOLS.push({ name: "mis_avisos", description: "Los avisos que esta persona le mandó a la oficina y si se los respondieron («¿me respondieron?», «¿qué le avisé a Ángel?»).", input_schema: S({}, []) });
    TOOLS.push({ name: "avisos_cuadrilla", description: "Lo que avisaron la cuadrilla, el pañol y los demás por el asistente («📨 Para resolver»): quién, cuándo, tipo, texto, obra, orden, si está nuevo, visto o resuelto y la respuesta. Para «¿qué me avisaron hoy?», «¿qué hay para resolver?».", input_schema: S({ soloHoy: { type: "boolean", description: "solo los de hoy" }, estado: { type: "string", enum: ["pendientes", "nuevo", "visto", "resuelto"] } }, []) });
    Object.assign(ESTADOS, { avisar_oficina: "📨 Preparando el aviso…", mis_avisos: "📨 Mirando tus avisos…", avisos_cuadrilla: "📨 Mirando los avisos…" });
    Object.assign(MIRO, { avisar_oficina: ["Avisos"], mis_avisos: ["Avisos"], avisos_cuadrilla: ["Para resolver"] });
    var AVISO_TXT = " AVISOS A LA OFICINA: si quiere avisarle algo a Ángel o a la oficina (un problema, falta de material, una pregunta, algo de seguridad o urgente), armá el mensaje claro y usá avisar_oficina (se manda recién con «Sí, mandalo»). Para saber si le respondieron, mis_avisos. RECLAMO DE PUNTOS («me faltaron puntos», «no me sumaron el izaje de ayer»): primero explicale con explicar_puntos lo que tiene y por qué; si sigue creyendo que le falta, preguntale «¿querés que se lo mande a Ángel?» y con su sí usá avisar_oficina con tipo puntos, la orden (o la fecha), la tarea y cuántos dice que le faltan.";
    ["crew", "panol", "mirar"].forEach(function (k) { if (SIS_ROL[k] && SIS_ROL[k].indexOf("AVISOS A LA OFICINA") < 0) SIS_ROL[k] += AVISO_TXT; });
    // la pantalla de Dirección, para «¿cómo vamos?» (lo mismo que se ve, sin cálculo propio)
    H.como_vamos = function () {
      var D = window.__inicioDir; if (!D || !D.paraIa) return { err: "La pantalla de Dirección no está en esta versión." };
      var n = nivelRol(); if (n !== "admin" && n !== "oficina" && n !== "direccion") return { err: NO_VE };
      return { r: D.paraIa() };
    };
    TOOLS.push({ name: "como_vamos", description: "Lo que muestra la pantalla de DIRECCIÓN (solo lectura): módulos de hoy y de ayer, el ritmo que hace falta y el de los últimos 7 días, el avance de nuestra zona, el inicio y el plazo del contrato (si el inicio es «estimado», decilo: falta cargar el acta de inicio), a este ritmo cuándo terminamos y cuántos días antes/después del plazo, el plan lineal (a confirmar), cada obra con su avance, fecha prevista (o «sin fecha prevista»), fecha a este ritmo (estimada) y si va a tiempo, en riesgo o atrasada, y la plata del contrato sin IVA. Usala para «¿cómo vamos?», «¿qué obra está más atrasada?», «¿cuándo terminamos?».", input_schema: S({}, []) });
    Object.assign(ESTADOS, { como_vamos: "📊 Mirando cómo vamos…" });
    Object.assign(MIRO, { como_vamos: ["Dirección"] });
  })();
