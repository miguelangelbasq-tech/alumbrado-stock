(function () {
  "use strict";
  // v184 · «💬 Chat interno» (Ángel 19/11: «un chat interno — oficina y administrador registran los que pueden entrar — para que
  // los de cuadrilla pidan cosas como "faltó hacerme esta tarea, agregarme esto" — y la IA me cree la tarea y me diga que la
  // apruebe a mí y a la oficina»).
  //  · Quién entra: Administración y Oficina siempre; Dirección mira todo y no escribe; el resto (cuadrilla, operario, pañol,
  //    solo mirar) solo si Administración u Oficina lo habilitó (⚙ del chat → configEquipo/chat.habilitados.<uid>).
  //  · Conversaciones: «General» (todos los que entran) y una por persona con la oficina («p_<uid>»). Mensajes en chatInterno
  //    (un doc por mensaje, con hilo y mes: la consulta es hilo == + mes ==, sin índices compuestos); el resumen de cada
  //    conversación en chatHilos (último mensaje, pedidos por aprobar) → globito sin leer (lo leído queda en el aparato).
  //  · Pedidos con el asistente: la cuadrilla escribe «faltó cargarme la zanja de 10 m de hoy» en SU conversación → UN pedido al
  //    Worker ema-ia (ema.tipo "pregunta", con los topes de su rol) con SUS órdenes nada más → la app arma la tarjeta (sumar una
  //    tarea a su orden abierta, corregir el cierre de una cerrada, o un reclamo de puntos) y le contesta «Le mandé a Ángel y a
  //    la oficina para que lo aprueben». Si no entiende, pregunta en el chat. Sin asistente (sin señal, tope), va como mensaje.
  //  · Administración y Oficina: «✅ Aprobar» (antes → después, motivo) por los caminos de siempre (fbOtUpdate /
  //    __corregirCierre.aplicar / el reclamo de la v155) o «✕ No corresponde» con motivo; auditoría chat_pedido y aviso al celu.
  //  · Nada cambia sin aprobar. Nadie borra. Sin escuchas al arrancar salvo los resúmenes de las conversaciones que la persona ve.
  const V = window.__v135;
  if (window.__v184No || !V) return;
  const COL = "chatInterno", HIL = "chatHilos";
  const $ = (id) => document.getElementById(id);
  const esc = V.esc, intentar = V.intentar;
  const arr = (x) => (Array.isArray(x) ? x : []), obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const hoy = () => iso(new Date());
  const mesDe = (ts) => iso(new Date(+ts || Date.now())).slice(0, 7);
  const hora = (ts) => { const d = new Date(+ts || Date.now()); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const cuando = (ts) => { if (!(+ts > 0)) return ""; const d = new Date(+ts); return (iso(d) === hoy() ? "" : pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + " ") + hora(ts); };
  const db = () => firebase.firestore();
  const FV = () => firebase.firestore.FieldValue;
  const yo = () => intentar(() => PERMISOS.yo() || {}, {}) || {};
  const uid = () => String((window.__fbUser || {}).uid || "");
  const email = () => String((window.__fbUser || {}).email || "").toLowerCase();
  const rol = () => String(yo().rol || "");
  const oficina = () => { const r = rol(); return r === "admin" || r === "oficina"; };
  const esDir = () => rol() === "direccion";
  const crew = () => { const r = rol(); return r === "cuadrilla" || r === "operario" || intentar(() => V.esCrew(), false); };
  const nk = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const nombreYo = () => { const y = yo(); return String(y.persona || y.nombre || y.usuario || email().split("@")[0]); };
  const primero = (n) => String(n || "").trim().split(" ")[0] || "";
  const avisar = (t, tipo) => { try { window.mostrarAviso && window.mostrarAviso(t, tipo); } catch (e) { } };
  const audit = (tipo, txt, extra) => { try { window.fbAuditar && window.fbAuditar(tipo, txt, extra || {}); } catch (e) { } };
  const fN = (n) => { const x = Math.round((+n || 0) * 100) / 100; return intentar(() => fmt(x, Number.isInteger(x) ? 0 : 2), String(x)); };
  const labelDe = (k) => intentar(() => (ACTIVIDADES_CATALOGO.find((a) => a.id === k) || {}).label, "") || String(k || "").replace(/^m:/, "");
  const unDe = (k) => intentar(() => (typeof unidadDeTarea == "function" ? unidadDeTarea(k) : ""), "") || "";
  const unCorta = (u) => ({ metro: "m", metros: "m", unidad: "Un." }[String(u)] || String(u || ""));
  const errPerm = (e) => /permission/i.test(String(e && (e.code || e.message)));

  // ---------------------------------------------------------------- estado
  const st = {
    cfg: null, cfgErr: "", hilos: {}, hilosErr: "", subCfg: null, subH: [], subM: null, arrancado: "",
    abierta: false, vista: "lista", hilo: "", msgs: {}, mesesExtra: {}, notas: {}, pend: null, conf: "", motivo: "", plan: null,
    planErr: "", ana: {}, ocupado: false, iaCorre: false, scrollAbajo: true, buscaCfg: "", reglasAvisado: false
  };
  const leidoKey = () => "ema.chat.leido." + uid();
  function leidos() { try { return JSON.parse(localStorage.getItem(leidoKey()) || "{}") || {}; } catch (e) { return {}; } }
  function marcarLeido(h, ts) { const l = leidos(); if ((+l[h] || 0) >= ts) return; l[h] = ts; try { localStorage.setItem(leidoKey(), JSON.stringify(l)); } catch (e) { } }
  const habMap = () => obj(obj(st.cfg).habilitados);
  const habilitado = () => !!uid() && !!habMap()[uid()];
  const puedeEntrar = () => !!window.__fbUser && V.rolListo() && !yo().pendiente && yo().activo !== false && (oficina() || esDir() || habilitado());
  const miHilo = () => "p_" + uid();
  const veHilo = (h) => oficina() || esDir() || h === "general" || h === miHilo();
  const escribe = (h) => !esDir() && (oficina() || (habilitado() && (h === "general" || h === miHilo())));

  // ---------------------------------------------------------------- escuchas (solo lo que la persona ve)
  function parar() { try { st.subCfg && st.subCfg(); } catch (e) { } st.subCfg = null; st.subH.forEach((u) => { try { u(); } catch (e) { } }); st.subH = []; pararMsgs(); st.arrancado = ""; }
  function pararMsgs() { try { st.subM && st.subM(); } catch (e) { } st.subM = null; }
  function arrancar() {
    if (!window.__fbUser || !V.rolListo() || !window.firebase) return;
    const clave = uid() + "|" + rol() + "|" + (habilitado() ? 1 : 0);
    if (st.arrancado === clave) return;
    st.subH.forEach((u) => { try { u(); } catch (e) { } }); st.subH = []; st.hilos = {};
    if (!st.subCfg) {
      st.subCfg = db().collection("configEquipo").doc("chat").onSnapshot((d) => { st.cfg = (d && d.exists && d.data()) || {}; st.cfgErr = ""; tic(); }, (e) => { st.cfg = {}; st.cfgErr = errPerm(e) ? "reglas" : "red"; tic(); });
    }
    st.arrancado = clave;
    if (yo().pendiente || yo().activo === false) return;
    const ok = (d) => { if (d && d.exists) st.hilos[d.id] = Object.assign({ id: d.id }, d.data()); st.hilosErr = ""; refrescar(); };
    const mal = (e) => { st.hilosErr = errPerm(e) ? "reglas" : "red"; refrescar(); };
    if (oficina() || esDir()) st.subH.push(db().collection(HIL).onSnapshot((s) => { const m = {}; s.forEach((d) => { m[d.id] = Object.assign({ id: d.id }, d.data()); }); st.hilos = m; st.hilosErr = ""; refrescar(); }, mal));
    else if (habilitado()) { st.subH.push(db().collection(HIL).doc("general").onSnapshot(ok, mal)); st.subH.push(db().collection(HIL).doc(miHilo()).onSnapshot(ok, mal)); }
  }
  function reglasViejas() { return st.cfgErr === "reglas" || st.hilosErr === "reglas"; }

  // ---------------------------------------------------------------- mensajes de una conversación (escucha solo con el chat abierto)
  function escucharHilo(h) {
    pararMsgs(); if (!h) return;
    const mes = mesDe(Date.now());
    st.subM = db().collection(COL).where("hilo", "==", h).where("mes", "==", mes).onSnapshot((s) => {
      const m = obj(st.msgs[h]); s.forEach((d) => { m[d.id] = Object.assign({ id: d.id }, d.data()); }); st.msgs[h] = m; refrescar();
    }, (e) => { st.hilosErr = errPerm(e) ? "reglas" : "red"; refrescar(); });
  }
  async function mesAnterior(h) {
    const n = (st.mesesExtra[h] || 0) + 1, d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - n);
    try { const s = await db().collection(COL).where("hilo", "==", h).where("mes", "==", mesDe(+d)).get(); const m = obj(st.msgs[h]); s.forEach((x) => { m[x.id] = Object.assign({ id: x.id }, x.data()); }); st.msgs[h] = m; st.mesesExtra[h] = n; }
    catch (e) { nota(h, "No se pudo traer el mes anterior (sin señal)."); }
    refrescar();
  }

  // ---------------------------------------------------------------- lo que no salió todavía (sin señal): se ve y se vuelve a mandar
  const pendKey = () => "ema.chat.pend." + uid();
  function pend() { if (!st.pend) { try { st.pend = JSON.parse(localStorage.getItem(pendKey()) || "{}") || {}; } catch (e) { st.pend = {}; } } return st.pend; }
  function guardarPend() { try { localStorage.setItem(pendKey(), JSON.stringify(pend())); } catch (e) { } }
  async function reenviar() {
    const P = pend(); const ids = Object.keys(P); if (!ids.length || st.reenviando) return; st.reenviando = true;
    for (const id of ids) {
      const x = P[id]; if (!x || Date.now() - (+x.doc.ts || 0) > 7 * 864e5) { delete P[id]; continue; }
      if (x.vuela) continue;
      try { const d = await db().collection(COL).doc(id).get(); if (d.exists) { delete P[id]; continue; } } catch (e) { }
      escribirMsg(x.doc, x.hiloPatch, x.delta);
    }
    guardarPend(); st.reenviando = false;
  }
  function nota(h, t) { (st.notas[h] = st.notas[h] || []).push({ id: "n" + Date.now(), ts: Date.now(), texto: t }); refrescar(); }

  // ---------------------------------------------------------------- escribir un mensaje (+ el resumen de la conversación)
  const nuevoId = () => "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  function docBase(h, texto, tipo, extra) {
    const y = yo(), ts = Date.now();
    return Object.assign({ id: nuevoId(), hilo: h, mes: mesDe(ts), uid: uid(), email: email(), nombre: String(y.nombre || y.usuario || ""), persona: String(y.persona || ""), personaClave: String(y.personaClave || ""), rol: rol(), texto: String(texto || "").slice(0, 2000), tipo: tipo || "msg", ts, fecha: hoy(), hora: hora(ts) }, extra || {});
  }
  function hiloPatchDe(doc) {
    const h = doc.hilo, p = { id: h, tipo: h === "general" ? "general" : "persona", ultTs: doc.ts, ultTexto: (doc.fotoMini && !doc.texto ? "📷 Foto" : String(doc.texto || "")).slice(0, 140), ultUid: doc.uid, ultNombre: primero(doc.persona || doc.nombre), mes: doc.mes };
    if (h !== "general" && h === miHilo() && !oficina()) Object.assign(p, { uid: uid(), email: email(), nombre: nombreYo(), personaClave: String(yo().personaClave || "") });
    return p;
  }
  // delta: +1 con un pedido nuevo, −1 cuando se decide (pedidos por aprobar de la conversación)
  function escribirMsg(doc, hiloPatch, delta) {
    delta = +delta || (doc.tipo === "pedido" ? 1 : 0);
    const P = pend(); P[doc.id] = { doc, hiloPatch: Object.assign({}, hiloPatch), delta, vuela: true }; guardarPend();
    refrescar();
    const hp = Object.assign({}, hiloPatch);
    if (delta) hp.pend = FV().increment(delta);
    const pr = db().collection(COL).doc(doc.id).set(doc).then(() => {
      delete pend()[doc.id]; guardarPend();
      db().collection(HIL).doc(doc.hilo).set(hp, { merge: true }).catch(() => { });
      const m = obj(st.msgs[doc.hilo]); m[doc.id] = Object.assign({}, doc); st.msgs[doc.hilo] = m;
      refrescar();
      return true;
    }, (e) => {
      const x = pend()[doc.id]; if (x) x.vuela = false;
      if (errPerm(e)) { delete pend()[doc.id]; nota(doc.hilo, reglasViejas() || st.cfgErr ? "⚠ La base no dejó guardar el mensaje: falta publicar las reglas de Firebase de la v184." : "⚠ La base no dejó guardar el mensaje (¿te sacaron del chat?)."); }
      guardarPend(); refrescar(); return false;
    });
    return pr;
  }

  // ---------------------------------------------------------------- a quién le avisa (push + campanita)
  async function emailsOficina() {
    let l = intentar(() => arr(PERMISOS.lista()).filter((u) => u && u.email && u.activo !== false && u.pendiente !== true && (u.rol === "admin" || u.rol === "oficina")).map((u) => String(u.email).toLowerCase()), []);
    if (!l.length) { try { const s = await db().collection("usuarios").where("rol", "in", ["admin", "oficina"]).get(); s.forEach((d) => { const x = d.data() || {}; if (x.email && x.activo !== false) l.push(String(x.email).toLowerCase()); }); } catch (e) { } }
    return l.filter((x, i, a) => x && a.indexOf(x) === i && x !== email());
  }
  async function avisarPor(doc) {
    if (!window.__pushAvisos || !window.__pushAvisos.dejarAviso) return 0;
    const quien = primero(doc.persona || doc.nombre) || "Alguien", h = doc.hilo;
    let para = [];
    if (oficina()) {
      if (h === "general") para = Object.keys(habMap()).map((u) => String(obj(habMap()[u]).email || "").toLowerCase()).concat(await emailsOficina());
      else { const H = obj(st.hilos[h]); para = [String(H.email || obj(habMap()[h.slice(2)]).email || "").toLowerCase()]; }
    } else para = await emailsOficina();
    para = para.filter((x, i, a) => x && a.indexOf(x) === i && x !== email());
    const titulo = doc.tipo === "pedido" ? `🙋 Pedido de ${quien} para aprobar` : doc.tipo === "sistema" ? String(doc.texto).slice(0, 80) : `💬 ${quien}${h === "general" ? " (General)" : ""}`;
    const cuerpo = doc.tipo === "pedido" ? String(obj(doc.pedido).resumen || doc.texto) : doc.fotoMini && !doc.texto ? "📷 Foto" : String(doc.texto);
    let n = 0;
    for (const em of para) { try { await window.__pushAvisos.dejarAviso({ email: em, titulo, cuerpo: cuerpo.slice(0, 300), tipo: "chat", tag: "ema-chat-" + h, ref: doc.id, url: "./?chat=" + encodeURIComponent(h) }); n++; } catch (e) { } }
    return n;
  }

  // ---------------------------------------------------------------- mandar (texto, foto)
  async function mandar(h, texto, foto) {
    texto = String(texto || "").replace(/\s+$/g, "").trim();
    if (!escribe(h)) return { err: esDir() ? "Dirección mira el chat, no escribe." : "No podés escribir acá." };
    if (!texto && !foto) return { err: "Escribí algo." };
    const doc = docBase(h, texto, "msg", foto ? { fotoMini: foto.mini || "", fotoId: foto.id || "" } : null);
    const pr = escribirMsg(doc, hiloPatchDe(doc));
    st.scrollAbajo = true;
    pr.then((ok) => {
      if (!ok) return;
      avisarPor(doc);
      if (texto && h === miHilo() && crew() && pareceP(texto)) interpretar(h, doc);
    });
    return { ok: true, id: doc.id };
  }
  const pareceP = (t) => window.__chatIaSiempre || /(falt|agreg|cargar|cargue|carga|sum[aáe]|punto|corrig|anot|olvid|no (me )?(figur|aparec|cont)|me deb|no me (pag|dier))/i.test(String(t));

  // ---------------------------------------------------------------- el asistente arma el pedido (UN pedido al Worker)
  const URL_IA = () => window.__iaUrl || "https://ema-ia.mdiaz-60f.workers.dev/ia";
  function misOts() {
    const c = nk(yo().personaClave || yo().persona || "");
    const l = intentar(() => (window.__cuadrilla && window.__cuadrilla.esCrew() ? window.__cuadrilla.misOts() : null), null) || V.ots();
    const desde = iso(new Date(Date.now() - 21 * 864e5));
    return arr(l).filter((o) => o && o.estado !== "Anulada" && c && arr(o.personalNombres).map(nk).indexOf(c) >= 0 && String(o.fecha || "") >= desde)
      .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || ""))).slice(0, 12);
  }
  function contexto() {
    const ots = misOts().map((o) => {
      const ce = V.cerrada(o), cant = obj(obj(o.cierre).cantidades), prev = obj(o.previsto);
      const ts = arr(o.actividades).map((k) => `${labelDe(k)} [${k}] previsto ${fN(prev[k] || 0)} ${unCorta(unDe(k))}${ce ? ", cerrada con " + fN(cant[k] || 0) : ""}`).join("; ");
      return `- ${o.numero || o.id} · ${o.fecha}${o.fecha === hoy() ? " (HOY)" : ""} · ${o.plazaNombre || ""} · ${ce ? "CERRADA" : "abierta (" + (o.estado || "Emitida") + ")"} · tareas: ${ts || "—"}`;
    }).join("\n");
    const cat = intentar(() => ACTIVIDADES_CATALOGO.filter((a) => a && a.id && a.label).map((a) => `${a.id}: ${a.label} (${unCorta(unDe(a.id)) || "unidad"})`).join("\n"), "");
    return { ots, cat };
  }
  const SIS = `Sos el asistente del chat interno de EMA Servicios (alumbrado público, Córdoba). Una persona de la cuadrilla le escribe a la oficina. Tu trabajo: entender si PIDE un cambio y armarlo para que la oficina lo apruebe. No cambiás nada vos.
Devolvé SOLO un JSON, sin texto alrededor:
{"accion":"agregar|corregir|puntos|preguntar|nada","ot":"OT-AAAA-NNN","tarea":"<id del catálogo>","cantidad":<número>,"cuantos":<puntos>,"pregunta":"<si falta un dato, la pregunta corta>","resumen":"<una línea: qué se pide>"}
- "agregar": le falta una tarea (o cantidad) en una orden ABIERTA suya → tarea + cantidad que hizo y falta cargar.
- "corregir": una orden CERRADA quedó con menos de lo que hizo → tarea + cantidad que falta sumar.
- "puntos": reclama puntos de una orden cerrada (sin decir qué tarea falta cargar) → ot, tarea si la dice, cuantos si los dice.
- "preguntar": si no se sabe la orden, la tarea o la cantidad. Preguntá en español rioplatense, corto.
- "nada": si es un mensaje común (saludo, aviso, pregunta que no es un pedido).
Usá solo las órdenes de la lista (son las de esa persona). «hoy» = la orden marcada HOY. No inventes cantidades.`;
  async function interpretar(h, msg) {
    if (st.iaCorre || window.__chatSinIa) return;
    if (navigator.onLine === false) { nota(h, "Sin señal: el mensaje le llega a la oficina igual; el asistente no armó el pedido."); return; }
    const u = window.firebase && firebase.auth && firebase.auth().currentUser; if (!u) return;
    st.iaCorre = true; refrescar();
    let j = null, err = "";
    try {
      const C = contexto();
      const prev = Object.keys(obj(st.msgs[h])).map((k) => st.msgs[h][k]).filter((m) => m && m.id !== msg.id).sort((a, b) => (+a.ts || 0) - (+b.ts || 0)).slice(-6)
        .map((m) => `${m.tipo === "ia" || m.tipo === "pedido" ? "Asistente" : m.uid === uid() ? "Persona" : "Oficina"}: ${String(m.texto || "").slice(0, 200)}`).join("\n");
      const tok = await u.getIdToken();
      const model = crew() ? "claude-sonnet-5-5" : intentar(() => window.__iaModelos.chat(), "claude-sonnet-5-5");
      const cuerpo = { model, max_tokens: 600, system: SIS, messages: [{ role: "user", content: `Hoy es ${hoy()}. La persona es ${nombreYo()}.\nSus órdenes (últimos 21 días):\n${C.ots || "(no tiene órdenes)"}\n\nCatálogo de tareas (id: nombre (unidad)):\n${C.cat}\n\n${prev ? "Lo último de la charla:\n" + prev + "\n\n" : ""}Mensaje nuevo: «${msg.texto}»` }], output_config: { effort: "low" }, ema: { tipo: "pregunta" } };
      let ctl = null, tm = null; try { ctl = new AbortController(); tm = setTimeout(() => ctl.abort(), 40000); } catch (e) { ctl = null; }
      const r = await fetch(URL_IA(), { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok }, body: JSON.stringify(cuerpo), signal: ctl ? ctl.signal : undefined });
      clearTimeout(tm);
      const x = await r.json().catch(() => null);
      if (!r.ok || !x || x.error) { const t = String(obj(x && x.error).tipo || ""); err = /^tope|rol_apagado|tope_mes/.test(t) ? "tope" : "ia"; if (t) intentar(() => window.__iaUso.marcarTope(t), null); }
      else {
        intentar(() => window.__iaUso.poner(x.ema), null);
        const txt = arr(x.content).filter((b) => b && b.type === "text").map((b) => b.text).join("\n");
        const m = txt.match(/\{[\s\S]*\}/); j = m ? JSON.parse(m[0]) : null; if (!j) err = "ia";
      }
    } catch (e) { err = "ia"; }
    st.iaCorre = false;
    if (err) { nota(h, err === "tope" ? "El asistente no tiene más preguntas hoy para tu usuario: tu mensaje le llegó a la oficina igual." : "El asistente no pudo armar el pedido ahora: tu mensaje le llegó a la oficina igual."); return; }
    const P = armarPedido(j);
    if (!P) { refrescar(); return; }
    if (P.pregunta) { const d = docBase(h, P.pregunta, "ia", { porAsistente: true, refId: msg.id }); escribirMsg(d, hiloPatchDe(d)); return; }
    const d = docBase(h, "Le mandé a Ángel y a la oficina para que lo aprueben.", "pedido", { porAsistente: true, refId: msg.id, estado: "pendiente", pedido: P });
    const ok = await escribirMsg(d, hiloPatchDe(d));
    if (ok) { avisarPor(d); audit("chat_pedido", `armado: ${P.resumen}`, { ref: d.id, otId: P.otId || "", porAsistente: true }); }
  }
  // lo que dijo el asistente → la tarjeta (se valida contra SUS órdenes)
  function armarPedido(j) {
    j = obj(j); const ac = String(j.accion || "");
    if (ac === "nada" || !ac) return null;
    if (ac === "preguntar") return { pregunta: String(j.pregunta || "¿Me decís de qué orden y qué tarea es?").slice(0, 300) };
    const ots = misOts(), ref = String(j.ot || "").trim().toUpperCase();
    let o = ots.find((x) => String(x.numero || "").toUpperCase() === ref || String(x.id) === String(j.ot || ""));
    if (!o && !ref) { const ab = ots.filter((x) => x.fecha === hoy()); if (ab.length === 1) o = ab[0]; }
    if (!o) return { pregunta: "¿De qué orden es? Decime el número (OT-…) o el día y la obra." };
    const cat = intentar(() => ACTIVIDADES_CATALOGO.map((a) => a.id), []);
    let k = String(j.tarea || "");
    if (k && cat.indexOf(k) < 0 && arr(o.actividades).indexOf(k) < 0) { const q = nk(k); k = cat.find((id) => nk(labelDe(id)) === q) || ""; }
    let accion = ac === "corregir" || ac === "agregar" || ac === "puntos" ? ac : "";
    if (!accion) return null;
    const ce = V.cerrada(o);
    if (accion === "agregar" && ce) accion = "corregir";
    if (accion === "corregir" && !ce) accion = "agregar";
    if (accion === "puntos" && !ce) return { pregunta: `${o.numero} todavía no está cerrada: los puntos salen cuando la oficina la cierra. Si te falta una tarea en la orden, decime cuál y cuánto.` };
    const cant = Math.round((parseFloat(String(j.cantidad == null ? "" : j.cantidad).replace(",", ".")) || 0) * 100) / 100;
    if (accion !== "puntos" && !k) return { pregunta: "¿Qué tarea te faltó cargar?" };
    if (accion !== "puntos" && !(cant > 0)) return { pregunta: `¿Cuánto hiciste de «${labelDe(k)}»? (${unCorta(unDe(k)) || "cantidad"})` };
    const un = unCorta(unDe(k)), persona = nombreYo();
    const P = { accion, otId: String(o.id), otNumero: String(o.numero || ""), obra: String(o.plazaNombre || ""), fecha: String(o.fecha || ""), k, tarea: k ? labelDe(k) : "", un, cantidad: cant, persona, personaClave: String(yo().personaClave || ""), resumen: "", filas: [] };
    if (accion === "agregar") {
      const a = arr(o.actividades).indexOf(k) >= 0 ? +obj(o.previsto)[k] || 0 : null;
      P.antes = a == null ? 0 : a; P.despues = Math.round(((a || 0) + cant) * 100) / 100; P.nueva = a == null;
      P.resumen = `Sumar «${P.tarea}» ${fN(cant)} ${un} a la ${P.otNumero} (${P.obra}, ${P.fecha.split("-").reverse().slice(0, 2).join("/")})`;
      P.filas = [{ c: P.tarea, a: a == null ? "no está en la orden" : fN(a) + " " + un, d: fN(P.despues) + " " + un }];
    } else if (accion === "corregir") {
      const a = +obj(obj(o.cierre).cantidades)[k] || 0;
      P.antes = a; P.despues = Math.round((a + cant) * 100) / 100;
      P.resumen = `Corregir el cierre de la ${P.otNumero}: «${P.tarea}» ${fN(a)} → ${fN(P.despues)} ${un}`;
      P.filas = [{ c: P.tarea + " (cierre)", a: fN(a) + " " + un, d: fN(P.despues) + " " + un }];
    } else {
      P.cuantos = Math.max(0, Math.round((parseFloat(String(j.cuantos == null ? "" : j.cuantos).replace(",", ".")) || 0) * 100) / 100);
      P.resumen = `Reclamo de puntos de la ${P.otNumero}${P.tarea ? " («" + P.tarea + "»)" : ""}${P.cuantos ? ": dice que le faltan " + fN(P.cuantos) + " pts" : ""}`;
      P.filas = [{ c: "Puntos", a: "lo que le dio el cierre", d: P.cuantos ? "+" + fN(P.cuantos) + " pts" : "a revisar" }];
    }
    if (j.resumen) P.dijo = String(j.resumen).slice(0, 200);
    return P;
  }

  // ---------------------------------------------------------------- aprobar / no corresponde (Administración y Oficina)
  const otDe = (id) => V.ots().find((o) => o && String(o.id) === String(id)) || null;
  const msgDe = (id) => { for (const h of Object.keys(st.msgs)) { const m = obj(st.msgs[h])[id]; if (m) return m; } return null; };
  function xReclamo(m) { const P = obj(m.pedido); return { id: m.id, otId: P.otId, otNumero: P.otNumero, persona: P.persona || m.persona || m.nombre, nombre: m.nombre, personaClave: P.personaClave || m.personaClave, email: m.email, tareaK: P.k || "", tarea: P.tarea || "", cuantos: +P.cuantos || 0, texto: String(obj(msgDe(m.refId)).texto || P.dijo || P.resumen || ""), fecha: m.fecha }; }
  function planDe(m, motivo) {
    const P = obj(m.pedido), o = otDe(P.otId);
    if (!o) return { err: `No encontré la ${P.otNumero || "orden"} en esta compu (¿anulada o de hace mucho?).` };
    if (o.estado === "Anulada") return { err: `La ${o.numero} está anulada.` };
    const ce = V.cerrada(o);
    if (P.accion === "puntos") {
      if (!window.__paraResolver || !window.__corregirCierre) return { err: "El reclamo de puntos no está en esta versión: corregilo con «✏ Corregir cierre»." };
      const x = xReclamo(m); x.analisis = intentar(() => window.__paraResolver.analizar(x), null);
      const C = window.__paraResolver.armarPlan(x); if (!C || C.err) return { err: (C && C.err) || "No pude armar la corrección." };
      C.motivo = motivo || C.motivo; return { tipo: "cierre", C, html: intentar(() => window.__corregirCierre.resumenHtml(C), "") };
    }
    if (!P.k) return { err: "El pedido no dice qué tarea." };
    if (P.accion === "agregar" && !ce) {
      const acts = arr(o.actividades), a = acts.indexOf(P.k) >= 0 ? +obj(o.previsto)[P.k] || 0 : null, d = Math.round(((a || 0) + (+P.cantidad || 0)) * 100) / 100;
      const patch = { ["previsto." + P.k]: d };
      if (a == null) patch.actividades = acts.concat(P.k);
      const pc = String(P.personaClave || ""); if (pc && arr(o.personalNombres).indexOf(pc) < 0) { patch.personalNombres = arr(o.personalNombres).concat(pc); patch.personal = arr(o.personal).concat({ nombre: P.persona, rol: "" }); }
      return { tipo: "orden", o, patch, filas: [{ c: P.tarea + " en " + (o.numero || ""), a: a == null ? "no está en la orden" : fN(a) + " " + P.un, d: fN(d) + " " + P.un }] };
    }
    if (!window.__corregirCierre) return { err: "La corrección del cierre no está en esta versión." };
    const a = +obj(obj(o.cierre).cantidades)[P.k] || 0, cb = { tarea: P.k, cantidad: Math.round((a + (+P.cantidad || 0)) * 100) / 100 };
    if (!(a > 0)) cb.personas = [P.persona];
    const C = window.__corregirCierre.plan(o.id, [cb], motivo || "Pedido por el chat", { porAsistente: true });
    if (!C || C.err) return { err: (C && C.err) || "No pude armar la corrección." };
    return { tipo: "cierre", C, html: intentar(() => window.__corregirCierre.resumenHtml(C), "") };
  }
  const motivoDe = (m) => { const P = obj(m.pedido); return `Pedido de ${P.persona || m.persona || m.nombre} por el chat (${String(m.fecha || "").split("-").reverse().slice(0, 2).join("/")}): ${String(obj(msgDe(m.refId)).texto || P.resumen || "").slice(0, 160)}`; };
  async function decidir(id, aprobar, motivo) {
    if (!oficina()) return { err: "Solo Administración y Oficina aprueban los pedidos." };
    const m = msgDe(id); if (!m || m.tipo !== "pedido") return { err: "No encontré el pedido." };
    if (m.estado && m.estado !== "pendiente") return { err: "Ese pedido ya se decidió." };
    const P = obj(m.pedido), quien = primero(yo().nombre || yo().usuario) || "La oficina", ahora = Date.now();
    motivo = String(motivo || "").trim().slice(0, 300);
    if (!aprobar && motivo.length < 3) return { err: "Escribí por qué no corresponde." };
    let resultado = "";
    if (aprobar) {
      const Z = planDe(m, motivo || motivoDe(m)); if (Z.err) return { err: Z.err };
      if (Z.tipo === "orden") {
        try { await window.fbOtUpdate(Z.o.id, Z.patch); } catch (e) { return { err: errPerm(e) ? "La base no dejó cambiar la orden." : "No se pudo guardar la orden (sin señal)." }; }
        resultado = `${P.tarea} ${fN(Z.patch["previsto." + P.k])} ${P.un} en la ${Z.o.numero}`;
      } else {
        Z.C.motivo = motivo || motivoDe(m);
        const r = await window.__corregirCierre.aplicar(Z.C); if (!r || !r.ok) return { err: (r && r.err) || "No se pudo corregir el cierre." };
        resultado = `cierre de la ${P.otNumero} corregido${P.tarea ? " («" + P.tarea + "»)" : ""}`;
      }
    }
    const patch = { estado: aprobar ? "aprobado" : "rechazado", decTs: ahora, decPor: email(), decPorNombre: quien, decMotivo: motivo || (aprobar ? "aprobado" : ""), resultado };
    try { await db().collection(COL).doc(id).update(patch); } catch (e) { return { err: "Se hizo el cambio pero no se pudo marcar el pedido (" + ((e && e.code) || "sin señal") + ")." }; }
    Object.assign(m, patch);
    const sis = docBase(m.hilo, aprobar ? `✅ ${quien} aprobó: ${resultado}.${motivo && motivo !== motivoDe(m) ? " " + motivo : ""}` : `✕ ${quien}: no corresponde. ${motivo}`, "sistema", { refId: id });
    escribirMsg(sis, hiloPatchDe(sis), -1);
    const dest = m.email ? { email: m.email } : P.personaClave ? { clave: P.personaClave } : null;
    if (dest && window.__pushAvisos) { try { await window.__pushAvisos.dejarAviso(Object.assign({ titulo: aprobar ? `✅ ${quien} aprobó tu pedido` : `${quien} revisó tu pedido: no corresponde`, cuerpo: aprobar ? resultado : motivo, tipo: "chat", tag: "ema-chat-" + m.hilo, ref: id, url: "./?chat=" + encodeURIComponent(m.hilo) }, dest)); } catch (e) { } }
    audit("chat_pedido", `${aprobar ? "aprobado" : "no corresponde"}: ${P.persona || m.nombre} · ${P.resumen || ""}${motivo ? " · " + motivo : ""}`, { ref: id, otId: P.otId || "", accion: P.accion || "" });
    return { ok: true, resultado };
  }

  // ---------------------------------------------------------------- habilitar (⚙: Administración y Oficina)
  async function habilitar(u, si) {
    if (!oficina()) return { err: "Solo Administración y Oficina habilitan el chat." };
    const x = intentar(() => arr(PERMISOS.lista()).find((y) => y && (y.uid === u || y.id === u)), null) || {};
    const val = si ? { por: email(), ts: Date.now(), nombre: String(x.persona || x.nombre || x.usuario || ""), email: String(x.email || "").toLowerCase(), rol: String(x.rol || "") } : FV().delete();
    try { await db().collection("configEquipo").doc("chat").set({ habilitados: { [u]: val } }, { merge: true }); }
    catch (e) { return { err: errPerm(e) ? "Falta publicar las reglas de Firebase de la v184." : "No se pudo guardar (sin señal)." }; }
    const m = Object.assign({}, habMap()); if (si) m[u] = val; else delete m[u]; st.cfg = Object.assign({}, st.cfg, { habilitados: m });
    audit("chat_habilitar", `${si ? "habilitó" : "sacó"} a ${x.persona || x.nombre || x.email || u} en el chat interno`, { ref: u });
    return { ok: true };
  }
  const candidatos = () => intentar(() => arr(PERMISOS.lista()).filter((y) => y && (y.uid || y.id) && y.activo !== false && !y.pendiente && ["admin", "oficina", "direccion"].indexOf(y.rol) < 0), []).map((y) => ({ uid: String(y.uid || y.id), nombre: String(y.persona || y.nombre || y.usuario || y.email || ""), rol: String(y.rol || ""), email: String(y.email || "") }));

  // ---------------------------------------------------------------- cuentas
  function hilosVisibles() {
    const l = Object.keys(st.hilos).map((k) => st.hilos[k]).filter((x) => x && veHilo(x.id));
    if (!l.some((x) => x.id === "general")) l.push({ id: "general", tipo: "general" });
    if (!oficina() && !esDir() && habilitado() && !l.some((x) => x.id === miHilo())) l.push({ id: miHilo(), tipo: "persona", nombre: nombreYo() });
    return l;
  }
  const noLeido = (x) => (+x.ultTs || 0) > (+leidos()[x.id] || 0) && x.ultUid && x.ultUid !== uid();
  const pendTotal = () => (oficina() ? hilosVisibles().reduce((s, x) => s + Math.max(0, +x.pend || 0), 0) : 0);
  function badge() { if (!puedeEntrar()) return 0; return hilosVisibles().filter(noLeido).length + pendTotal(); }
  const nombreHilo = (x) => (x.id === "general" ? "General" : x.id === miHilo() && !oficina() && !esDir() ? "Con la oficina" : String(x.nombre || obj(habMap()[String(x.id).slice(2)]).nombre || "Persona"));

  // ---------------------------------------------------------------- pantalla
  const ICO = { chat: "💬", foto: "📷", mic: "🎤" };
  function filaHilo(x) {
    const n = noLeido(x), p = oficina() ? Math.max(0, +x.pend || 0) : 0;
    return `<button type="button" class="ch-fila${n ? " nuevo" : ""}" data-ch="hilo:${esc(x.id)}"><span class="ch-av">${x.id === "general" ? "👥" : esc(intentar(() => V.iniciales(nombreHilo(x)), "?"))}</span><span class="ch-fx"><b>${esc(nombreHilo(x))}${p ? ` <i class="ch-pp">🙋 ${p} para aprobar</i>` : ""}</b><small>${x.ultTexto ? esc((x.ultNombre ? x.ultNombre + ": " : "") + x.ultTexto) : x.id === "general" ? "Para todos los que entran al chat" : "Todavía no hay mensajes"}</small></span><span class="ch-fh">${esc(cuando(x.ultTs))}${n ? '<i class="ch-dot" aria-label="sin leer"></i>' : ""}</span></button>`;
  }
  function htmlLista() {
    const l = hilosVisibles().sort((a, b) => (a.id === "general" ? -1 : b.id === "general" ? 1 : (Math.max(0, +b.pend || 0) > 0) - (Math.max(0, +a.pend || 0) > 0) || (+b.ultTs || 0) - (+a.ultTs || 0)));
    const sin = oficina() ? Object.keys(habMap()).filter((u) => !st.hilos["p_" + u]) : [];
    const nuevo = sin.length ? `<label class="ch-nuevo">Escribirle a…<select id="chNuevo" aria-label="Escribirle a"><option value="">Elegí a alguien</option>${sin.map((u) => `<option value="p_${esc(u)}">${esc(obj(habMap()[u]).nombre || u)}</option>`).join("")}</select></label>` : "";
    return `${l.map(filaHilo).join("")}${nuevo}${oficina() && !Object.keys(habMap()).length ? '<div class="ch-vacio">Todavía no habilitaste a nadie de la cuadrilla. Tocá ⚙ para elegir quién entra.</div>' : ""}`;
  }
  function burbuja(m) {
    const mio = m.uid === uid() && m.tipo === "msg", ia = m.tipo === "ia" || m.tipo === "pedido", sis = m.tipo === "sistema", pe = !!(st.pend && st.pend[m.id]);
    const quien = ia ? "✨ Asistente" : sis ? "" : mio ? "" : primero(m.persona || m.nombre) + (m.rol === "admin" ? " · Administración" : m.rol === "oficina" ? " · Oficina" : "");
    if (sis) return `<div class="ch-sis" data-chm="${esc(m.id)}">${esc(m.texto)}<small>${esc(cuando(m.ts))}</small></div>`;
    const foto = m.fotoMini ? `<button type="button" class="ch-foto" data-ch="foto:${esc(m.id)}" aria-label="Ver la foto"><img alt="" src="${esc(m.fotoMini)}"></button>` : "";
    const card = m.tipo === "pedido" ? tarjeta(m) : "";
    return `<div class="ch-b${mio ? " mio" : ""}${ia ? " ia" : ""}" data-chm="${esc(m.id)}">${quien ? `<span class="ch-q">${esc(quien)}</span>` : ""}${foto}${m.texto ? `<p>${esc(m.texto)}</p>` : ""}${card}<small>${pe ? "⏳ Sin enviar · sale cuando haya señal" : esc(cuando(m.ts))}</small></div>`;
  }
  function tarjeta(m) {
    const P = obj(m.pedido), est = m.estado || "pendiente";
    const filas = arr(P.filas).map((f) => `<div class="ch-cam"><span>${esc(f.c)}</span><s>${esc(f.a)}</s><b>${esc(f.d)}</b></div>`).join("");
    const estH = est === "aprobado" ? `<div class="ch-est ok">✅ Aprobado por ${esc(m.decPorNombre || "")}${m.resultado ? " · " + esc(m.resultado) : ""}</div>` : est === "rechazado" ? `<div class="ch-est no">✕ No corresponde (${esc(m.decPorNombre || "")}): ${esc(m.decMotivo || "")}</div>` : '<div class="ch-est am">⏳ Para aprobar (Administración u Oficina)</div>';
    let acc = "";
    if (est === "pendiente" && oficina()) {
      if (st.conf === "si:" + m.id) {
        const Z = st.plan;
        acc = Z && !Z.err ? `<div class="ch-plan">${Z.html || arr(Z.filas).map((f) => `<div class="ch-cam"><span>${esc(f.c)}</span><s>${esc(f.a)}</s><b>${esc(f.d)}</b></div>`).join("")}</div><label class="ch-mot">Motivo (queda en el historial)<input type="text" id="chMot" maxlength="300" value="${esc(st.motivo)}"></label><div class="ch-acc"><button type="button" class="btn-primary" data-ch="sisi:${esc(m.id)}">Sí, aprobar</button><button type="button" class="btn-ghost" data-ch="no">Cancelar</button></div>`
          : `<div class="ch-msg rj" role="status">⚠ ${esc((Z && Z.err) || "No pude armarlo.")}</div><div class="ch-acc"><button type="button" class="btn-ghost" data-ch="no">Cancelar</button></div>`;
      } else if (st.conf === "rech:" + m.id) {
        acc = `<label class="ch-mot">¿Por qué no corresponde? (obligatorio, le llega a ${esc(primero(P.persona || m.nombre))})<textarea id="chMot" rows="2" maxlength="300">${esc(st.motivo)}</textarea></label><div class="ch-acc"><button type="button" class="btn-primary" data-ch="rechsi:${esc(m.id)}">Sí, no corresponde</button><button type="button" class="btn-ghost" data-ch="no">Cancelar</button></div>`;
      } else acc = `<div class="ch-acc"><button type="button" class="btn-primary" data-ch="si:${esc(m.id)}">✅ Aprobar</button><button type="button" class="btn-ghost ch-rj" data-ch="rech:${esc(m.id)}">✕ No corresponde</button>${P.accion === "puntos" ? `<button type="button" class="btn-ghost" data-ch="ana:${esc(m.id)}">🔎 Analizar</button>` : ""}</div>`;
    }
    const A = st.ana[m.id];
    const an = A ? `<div class="ch-an" role="status"><b>${esc({ si: "✅ Parece que tiene razón", no: "✕ No parece", nose: "❔ No se puede saber" }[A.veredicto] || "❔")}</b>${arr(A.porque).map((s) => `<span>· ${esc(s)}</span>`).join("")}</div>` : "";
    const msg = st.cmsg && st.cmsgId === m.id ? `<div class="ch-msg${/^⚠/.test(st.cmsg) ? " rj" : ""}" role="status">${esc(st.cmsg)}</div>` : "";
    return `<div class="ch-card"><div class="ch-ct">🙋 Pedido · ${esc(P.accion === "agregar" ? "sumar a la orden" : P.accion === "corregir" ? "corregir el cierre" : "reclamo de puntos")}</div><div class="ch-cr">${esc(P.resumen || "")}</div><div class="ch-cs">${esc([P.otNumero, P.obra, P.fecha ? P.fecha.split("-").reverse().join("/") : ""].filter(Boolean).join(" · "))}</div>${filas}${estH}${an}${acc}${msg}</div>`;
  }
  function htmlHilo(h) {
    const m = obj(st.msgs[h]), P = obj(st.pend);
    const l = Object.keys(m).map((k) => m[k]).concat(Object.keys(P).map((k) => P[k].doc).filter((d) => d && d.hilo === h && !m[d.id])).concat(arr(st.notas[h]).map((n) => ({ id: n.id, ts: n.ts, tipo: "nota", texto: n.texto })))
      .sort((a, b) => (+a.ts || 0) - (+b.ts || 0));
    const mas = `<button type="button" class="ch-mas" data-ch="mesant">Ver el mes anterior</button>`;
    const cuerpo = l.length ? l.map((x) => (x.tipo === "nota" ? `<div class="ch-nota" role="status">${esc(x.texto)}</div>` : burbuja(x))).join("") : `<div class="ch-vacio">${h === miHilo() && !oficina() ? "Escribile a la oficina. Si te faltó cargar una tarea o puntos, decilo acá: el asistente arma el pedido para que lo aprueben." : "Todavía no hay mensajes este mes."}</div>`;
    return mas + cuerpo + (st.iaCorre ? '<div class="ch-nota" role="status">✨ El asistente está armando el pedido…</div>' : "");
  }
  function htmlCfg() {
    const c = candidatos(), H = habMap(), q = nk(st.buscaCfg);
    const l = c.filter((x) => !q || nk(x.nombre + " " + x.rol).indexOf(q) >= 0).sort((a, b) => (!!H[b.uid]) - (!!H[a.uid]) || a.nombre.localeCompare(b.nombre));
    const ROL = { cuadrilla: "Cuadrilla", operario: "Operario", panol: "Pañol", mirar: "Solo mirar" };
    return `<p class="ch-hint">Administración y Oficina entran siempre; Dirección mira todo. Elegí quién más puede entrar (cada uno ve «General» y su conversación con la oficina).</p><input type="search" id="chBusca" placeholder="Buscar persona" value="${esc(st.buscaCfg)}" aria-label="Buscar persona">${l.map((x) => `<div class="ch-hab"><span><b>${esc(x.nombre)}</b><small>${esc(ROL[x.rol] || x.rol)}</small></span><button type="button" class="${H[x.uid] ? "btn-ghost" : "btn-primary"}" data-ch="${H[x.uid] ? "sacar" : "hab"}:${esc(x.uid)}">${H[x.uid] ? "✓ Entra · Sacar" : "Habilitar"}</button></div>`).join("") || '<div class="ch-vacio">No hay usuarios para habilitar.</div>'}`;
  }
  function htmlCab() {
    const h = st.hilo, x = obj(st.hilos[h]);
    const tit = st.vista === "cfg" ? "⚙ Quién entra al chat" : st.vista === "hilo" ? nombreHilo(Object.assign({ id: h }, x)) : "💬 Chat interno";
    const crewTabs = st.vista === "hilo" && !oficina() && !esDir() ? `<div class="subtabs ch-tabs" role="tablist"><button type="button" role="tab" class="subtab${h === miHilo() ? " activo" : ""}" data-ch="hilo:${esc(miHilo())}">Con la oficina</button><button type="button" role="tab" class="subtab${h === "general" ? " activo" : ""}" data-ch="hilo:general">General${noLeido(obj(st.hilos.general)) && h !== "general" ? " •" : ""}</button></div>` : "";
    const atras = (st.vista === "hilo" && (oficina() || esDir())) || st.vista === "cfg" ? '<button type="button" class="ch-x" data-ch="lista" aria-label="Volver">‹</button>' : "";
    return `<div class="ch-top">${atras}<div class="ch-tt"><b>${esc(tit)}</b><small>${st.vista === "lista" ? (esDir() ? "Solo para mirar" : "Conversaciones con la cuadrilla") : st.vista === "hilo" && h === "general" ? "Lo leen todos los que entran al chat" : ""}</small></div>${oficina() && st.vista === "lista" ? '<button type="button" class="ch-x" data-ch="cfg" aria-label="Quién entra al chat">⚙</button>' : ""}<button type="button" class="ch-x" data-ch="cerrar" aria-label="Cerrar">✕</button></div>${crewTabs}${reglasViejas() ? '<div class="ch-msg rj" role="status">⚠ Falta publicar las reglas de Firebase de la v184 (chat interno): hasta entonces el chat no guarda nada.</div>' : st.hilosErr === "red" ? '<div class="ch-msg" role="status">Sin señal: se ve lo último que llegó.</div>' : ""}`;
  }
  function htmlPie() {
    if (st.vista !== "hilo") return "";
    if (!escribe(st.hilo)) return `<div class="ch-pie solo">${esDir() ? "Dirección mira el chat; no escribe." : "Solo lectura."}</div>`;
    const mic = !!(window.webkitSpeechRecognition || window.SpeechRecognition || window.__voz || window.__iaCargar || intentar(() => window.Capacitor.Plugins.SpeechRecognition, null));
    return `<div class="ch-pie"><label class="ch-ib" aria-label="Mandar una foto">${ICO.foto}<input type="file" accept="image/*" id="chFoto" hidden></label>${mic ? `<button type="button" class="ch-ib" data-ch="mic" aria-label="Dictar">${ICO.mic}</button>` : ""}<textarea id="chTxt" rows="1" maxlength="2000" placeholder="${st.hilo === miHilo() && !oficina() ? "Escribile a la oficina…" : "Escribí un mensaje…"}" aria-label="Mensaje"></textarea><button type="button" class="btn-primary ch-env" data-ch="enviar" aria-label="Enviar">Enviar</button></div>`;
  }
  function pintar() {
    const ov = $("chOv"); if (!ov || ov.hidden) return;
    const cab = $("chCab"), cu = $("chCuerpo"), pie = $("chPie"); if (!cab || !cu || !pie) return;
    const hc = htmlCab(); if (cab.__h !== hc) { cab.innerHTML = hc; cab.__h = hc; }
    const foco = document.activeElement && document.activeElement.id === "chMot";
    const hb = st.vista === "cfg" ? htmlCfg() : st.vista === "hilo" ? htmlHilo(st.hilo) : htmlLista();
    if (cu.__h !== hb && !foco && !(st.vista === "cfg" && document.activeElement && document.activeElement.id === "chBusca")) {
      const abajo = st.scrollAbajo || cu.scrollTop + cu.clientHeight >= cu.scrollHeight - 40;
      cu.innerHTML = hb; cu.__h = hb;
      if (st.vista === "hilo" && abajo) cu.scrollTop = cu.scrollHeight;
      st.scrollAbajo = false;
    }
    const hp = htmlPie() ? "1" + st.vista + st.hilo + escribe(st.hilo) : "0";
    if (pie.__k !== hp) { const tx = $("chTxt"), v = tx ? tx.value : ""; pie.innerHTML = htmlPie(); pie.__k = hp; const t2 = $("chTxt"); if (t2 && v) t2.value = v; }
    if (st.vista === "hilo" && st.hilo) { const x = obj(st.hilos[st.hilo]); if (x.ultTs && document.visibilityState !== "hidden") marcarLeido(st.hilo, +x.ultTs); }
  }
  function refrescar() { pintar(); menu(); intentar(() => window.__navN1 && window.__navN1.pintar(), null); }
  function abrir(h) {
    if (!puedeEntrar()) { avisar(reglasViejas() && !oficina() ? "El chat todavía no está listo (faltan las reglas de Firebase)." : "🔒 Para entrar al chat te tiene que habilitar la oficina.", "error"); return false; }
    try { window.cerrarMenuLateral && window.cerrarMenuLateral(); } catch (e) { }
    let ov = $("chOv");
    if (!ov) {
      ov = document.createElement("div"); ov.id = "chOv"; ov.className = "v7-ov no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Chat interno");
      ov.innerHTML = '<div class="ch-caja"><div id="chCab"></div><div id="chCuerpo" class="ch-cuerpo"></div><div id="chPie"></div></div>';
      document.body.appendChild(ov);
    }
    ov.hidden = false; st.abierta = true; document.body.classList.add("ch-abierto");
    if (!h && !oficina() && !esDir()) h = miHilo();
    if (h && veHilo(h)) irHilo(h); else { st.vista = "lista"; pararMsgs(); ["chCab", "chCuerpo"].forEach((i) => { const e = $(i); if (e) e.__h = ""; }); pintar(); }
    reenviar();
    setTimeout(() => intentar(() => window.__atras && window.__atras.sync && window.__atras.sync(), null), 30);
    return true;
  }
  function irHilo(h) {
    st.vista = "hilo"; st.hilo = h; st.conf = ""; st.plan = null; st.cmsg = ""; st.scrollAbajo = true;
    escucharHilo(h); const c = $("chCuerpo"); if (c) c.__h = ""; pintar();
  }
  function cerrar() { const ov = $("chOv"); if (ov) ov.hidden = true; st.abierta = false; pararMsgs(); document.body.classList.remove("ch-abierto"); st.conf = ""; menu(); }

  // ---------------------------------------------------------------- foto y dictado
  function mini(file, lado) {
    return new Promise((ok) => {
      const r = new FileReader(); r.onerror = () => ok(""); r.onload = () => { const i = new Image(); i.onerror = () => ok(""); i.onload = () => { const k = Math.min(1, lado / Math.max(i.width, i.height)), c = document.createElement("canvas"); c.width = Math.round(i.width * k); c.height = Math.round(i.height * k); c.getContext("2d").drawImage(i, 0, 0, c.width, c.height); ok(c.toDataURL("image/jpeg", 0.7)); }; i.src = r.result; }; r.readAsDataURL(file);
    });
  }
  async function mandarFoto(file) {
    const h = st.hilo; if (!file || !escribe(h)) return;
    nota(h, "📷 Preparando la foto…");
    const mi = await mini(file, 320);
    let id = "";
    if (typeof window.subirAdjunto == "function" || typeof subirAdjunto == "function") {
      const f = typeof window.subirAdjunto == "function" ? window.subirAdjunto : subirAdjunto;
      try { id = await Promise.race([f(file, { tipo: "chat", hilo: h, plazaId: "__chat", plazaNombre: "Chat interno", otId: "", categoria: "chat" }), new Promise((ok) => setTimeout(() => ok(""), 20000))]) || ""; } catch (e) { id = ""; }
    }
    st.notas[h] = arr(st.notas[h]).filter((n) => !/Preparando la foto/.test(n.texto));
    const t = $("chTxt"), tx = t ? t.value : ""; if (t) t.value = "";
    await mandar(h, tx, { mini: mi, id: String(id || "") });
  }
  async function dictar(b) {
    const t = $("chTxt"); if (!t) return;
    const base = t.value ? t.value.replace(/\s+$/, "") + " " : "";
    b.classList.add("on");
    try {
      if (!window.__voz && window.__iaCargar) { try { await window.__iaCargar(); } catch (e) { } }
      if (window.__voz && window.__voz.escuchar) { const r = await window.__voz.escuchar((s) => { t.value = base + s; }); if (r && r.texto) t.value = base + r.texto; }
      else {
        const SR = window.webkitSpeechRecognition || window.SpeechRecognition; if (!SR) { avisar("Este celu no tiene dictado: usá el micrófono del teclado.", "error"); return; }
        await new Promise((ok) => { const r = new SR(); r.lang = "es-AR"; r.interimResults = true; r.onresult = (e) => { let s = ""; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript; t.value = base + s; }; r.onend = ok; r.onerror = ok; try { r.start(); } catch (e) { ok(); } });
      }
    } finally { b.classList.remove("on"); }
  }

  // ---------------------------------------------------------------- toques
  document.addEventListener("click", async (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-ch]"); if (!b) { const ov = $("chOv"); if (ov && !ov.hidden && e.target === ov) cerrar(); return; }
    const a = b.dataset.ch, id = a.indexOf(":") > 0 ? a.slice(a.indexOf(":") + 1) : "";
    if (a === "abrir") { e.preventDefault(); return abrir(); }
    if (!b.closest("#chOv")) return;
    e.preventDefault();
    if (a === "cerrar") return cerrar();
    if (a === "lista") { st.vista = "lista"; pararMsgs(); return pintar(); }
    if (a === "cfg") { st.vista = "cfg"; return pintar(); }
    if (a.indexOf("hilo:") === 0) return irHilo(id);
    if (a === "mesant") return mesAnterior(st.hilo);
    if (a === "enviar") { const t = $("chTxt"); if (!t || !t.value.trim()) return; const v = t.value; t.value = ""; const r = await mandar(st.hilo, v); if (r.err) { t.value = v; nota(st.hilo, "⚠ " + r.err); } return; }
    if (a === "mic") return dictar(b);
    if (a.indexOf("foto:") === 0) { const m = msgDe(id); if (!m) return; if (m.fotoId && window.emaGaleria) { try { window.emaGaleria.abrir([{ id: m.fotoId, mini: m.fotoMini || "", titulo: "Foto de " + primero(m.persona || m.nombre), sub: cuando(m.ts) }], 0); return; } catch (er) { } } return; }
    if (a === "hab" || a === "sacar" || a.indexOf("hab:") === 0 || a.indexOf("sacar:") === 0) { b.disabled = true; const r = await habilitar(id, a.indexOf("hab") === 0); if (r.err) avisar("⚠ " + r.err, "error"); const c = $("chCuerpo"); if (c) c.__h = ""; return pintar(); }
    if (a === "no") { st.conf = ""; st.plan = null; st.motivo = ""; const c = $("chCuerpo"); if (c) c.__h = ""; return pintar(); }
    const m = id ? msgDe(id) : null;
    if (a.indexOf("si:") === 0 && m) { st.conf = "si:" + id; st.motivo = motivoDe(m); st.plan = planDe(m, st.motivo); if (st.plan && st.plan.tipo === "orden") st.plan = Object.assign({}, st.plan); st.cmsg = ""; const c = $("chCuerpo"); if (c) c.__h = ""; return pintar(); }
    if (a.indexOf("rech:") === 0 && m) { st.conf = "rech:" + id; st.motivo = ""; st.cmsg = ""; const c = $("chCuerpo"); if (c) c.__h = ""; pintar(); const t = $("chMot"); t && t.focus(); return; }
    if (a.indexOf("ana:") === 0 && m) { st.ana[id] = intentar(() => window.__paraResolver.analizar(xReclamo(m)), { veredicto: "nose", porque: ["El análisis no está en esta versión."] }); const c = $("chCuerpo"); if (c) c.__h = ""; return pintar(); }
    if ((a.indexOf("sisi:") === 0 || a.indexOf("rechsi:") === 0) && m) {
      if (st.ocupado) return; st.ocupado = true; b.disabled = true;
      const t = $("chMot"), mot = t ? t.value : st.motivo;
      let r; try { r = await decidir(id, a.indexOf("sisi:") === 0, mot); } catch (er) { r = { err: (er && er.message) || "No se pudo." }; }
      st.ocupado = false; st.cmsgId = id;
      if (r.err) { st.cmsg = "⚠ " + r.err; b.disabled = false; }
      else { st.cmsg = a.indexOf("sisi:") === 0 ? "✓ Aprobado: " + r.resultado + ". Le llega el aviso." : "✓ Listo: le llega el motivo."; st.conf = ""; st.plan = null; st.motivo = ""; }
      const c = $("chCuerpo"); if (c) c.__h = ""; return pintar();
    }
  });
  document.addEventListener("input", (e) => {
    const t = e.target; if (!t) return;
    if (t.id === "chMot") st.motivo = t.value;
    if (t.id === "chBusca") { st.buscaCfg = t.value; const c = $("chCuerpo"); if (c) { c.__h = ""; const pos = t.selectionStart; c.innerHTML = htmlCfg(); c.__h = htmlCfg(); const t2 = $("chBusca"); if (t2) { t2.focus(); try { t2.setSelectionRange(pos, pos); } catch (er) { } } } }
    if (t.id === "chTxt") { t.style.height = "auto"; t.style.height = Math.min(140, t.scrollHeight) + "px"; }
  });
  document.addEventListener("keydown", (e) => { if (e.target && e.target.id === "chTxt" && e.key === "Enter" && !e.shiftKey && window.innerWidth > 900) { e.preventDefault(); const b = document.querySelector('#chOv [data-ch="enviar"]'); b && b.click(); } });
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t) return;
    if (t.id === "chFoto" && t.files && t.files[0]) { const f = t.files[0]; t.value = ""; mandarFoto(f); }
    if (t.id === "chNuevo" && t.value) { const h = t.value; const u = h.slice(2), x = obj(habMap()[u]); st.hilos[h] = st.hilos[h] || { id: h, tipo: "persona", uid: u, email: x.email || "", nombre: x.nombre || "" }; if (oficina()) db().collection(HIL).doc(h).set({ id: h, tipo: "persona", uid: u, email: String(x.email || ""), nombre: String(x.nombre || "") }, { merge: true }).catch(() => { }); irHilo(h); }
  });
  window.addEventListener("online", () => setTimeout(reenviar, 800));

  // ---------------------------------------------------------------- menú, Perfil y el reloj
  function menu() {
    let m = $("menuChat");
    if (!puedeEntrar() && !(oficina() && reglasViejas())) { m && m.remove(); return; }
    const ini = $("menuParaResolver") || document.querySelector('#menuLateral [data-vista="inicio"]'); if (!ini) return;
    if (!m) { m = document.createElement("button"); m.type = "button"; m.id = "menuChat"; m.className = (document.querySelector('#menuLateral [data-vista="inicio"]') || ini).className.replace(/\b(activo|active|on)\b/g, ""); m.setAttribute("data-ch", "abrir"); ini.insertAdjacentElement("afterend", m); }
    const n = badge(), h = `<span class="nav-ico">💬</span><span class="nav-txt">Chat interno${reglasViejas() && oficina() ? ' <b class="ch-bd am">⚠</b>' : n ? ` <b class="ch-bd">${n}</b>` : ""}</span>`;
    if (m.__h !== h) { m.innerHTML = h; m.__h = h; }
  }
  function perfil() {
    const v = $("viewPerfil"); if (!v) return;
    let c = $("chPerfil");
    if (!puedeEntrar()) { c && c.remove(); return; }
    const ref = v.querySelector(".pf-kpis") || v.querySelector(".pf-yo"); if (!ref) return;
    const n = badge(), h = `<div class="pf-th"><h2>Chat</h2></div><button type="button" class="pf-fila" data-ch="abrir"><span class="pf-ic">💬</span><span class="pf-tx"><b>${oficina() || esDir() ? "Chat interno" : "Chat con la oficina"}</b><small>${n ? n + (n === 1 ? " mensaje sin leer" : " sin leer") : oficina() ? "Conversaciones con la cuadrilla" : "Pedidos y avisos a la oficina"}</small></span>${n ? `<b class="ch-bd">${n}</b>` : ""}</button>`;
    if (!c || c.previousElementSibling !== ref) { c && c.remove(); c = document.createElement("div"); c.id = "chPerfil"; c.className = "pf-tarj"; ref.insertAdjacentElement("afterend", c); c.__h = ""; }
    if (c.__h !== h) { c.innerHTML = h; c.__h = h; }
  }
  function avisoReglas() {
    if (!oficina() || !reglasViejas() || st.reglasAvisado) return; st.reglasAvisado = true;
    const k = "ema.chat.reglas"; try { if (localStorage.getItem(k) === hoy()) return; localStorage.setItem(k, hoy()); } catch (e) { }
    avisar("⚠ Falta publicar las reglas de Firebase de la v184 (chat interno). Hasta entonces el chat no anda.", "error");
  }
  let pendUrl = ""; try { const q = new URLSearchParams(location.search).get("chat"); if (q) { pendUrl = q; const u = new URL(location.href); u.searchParams.delete("chat"); history.replaceState(history.state, "", u.pathname + (u.search || "") + u.hash); } } catch (e) { }
  function tic() {
    if (!window.__fbUser) { if (st.arrancado) parar(); menu(); return; }
    intentar(arrancar, null);
    menu(); perfil(); avisoReglas();
    if (pendUrl && puedeEntrar() && st.cfg) { const h = pendUrl; pendUrl = ""; abrir(h === "1" ? "" : h); }
    if (Object.keys(pend()).length && navigator.onLine !== false && !st.reenviando) intentar(reenviar, null);
  }
  document.addEventListener("permisos-listos", () => setTimeout(tic, 300));
  setInterval(tic, 2000); setTimeout(tic, 600);
  window.__chat184 = { abrir, cerrar, mandar, interpretar, armarPedido, decidir, planDe, habilitar, badge, puedeEntrar, habilitado, hilos: () => st.hilos, msgs: (h) => obj(st.msgs[h || st.hilo]), pendientes: () => Object.assign({}, pend()), reglasViejas, misOts, estado: () => st };
})();
