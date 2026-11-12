  // ---------- v150 · «Lo hecho, verificado»: la verificación de una orden que arma la app (sin IA), para admin y oficina
  //  (pañol, cuadrilla y mirar no la reciben: TOOLS_ROL). Solo lectura; lo que haga falta se propone con las otras herramientas.
  H.verificar_orden = function (a) {
    var VO = window.__verifOt; if (!VO || window.__v150No) return { err: "La verificación no está en esta versión." };
    if (!edita("parte") && !ve("parte")) return { err: NO_VE };
    var o = otPorRef(a && (a.otId || a.numero)); if (!o) return { err: "No encontré la orden «" + ((a && (a.otId || a.numero)) || "?") + "»." };
    var r = VO.paraIa(o.id); if (!r) return { err: "No pude armar la verificación." };
    return { r: r };
  };
  TOOLS.push({ name: "verificar_orden", description: "La VERIFICACIÓN de una orden que arma la app sin IA (solo lectura): por tarea, cuántas se pidieron, cuáles columnas/cajas se hicieron (con foto, con hora, quién), cuáles no se hicieron y por qué, lo que la cuadrilla dijo sin detalle por columna, dudas (sin foto, foto de otra obra por GPS, hora rara) y lo que falta de verdad en la obra. Usala para «¿está cumplida la OT…?», antes de cerrar o con ver_fotos (mismo otId) para mirar si las fotos muestran lo que dicen.", input_schema: S({ otId: TXT("número OT-AAAA-NNN u otId") }, ["otId"]) });
  Object.assign(ESTADOS, { verificar_orden: "🔎 Mirando la verificación…" });
  Object.assign(MIRO, { verificar_orden: ["Verificación"] });
