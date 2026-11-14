(function () {
  "use strict";
  // v155 · «La cuadrilla le avisa a la oficina por el asistente» (Ángel, 14/11: «los de cuadrilla, si quieren avisar algo,
  // pueden avisarle a la IA y que la IA me avise a mí. Que me llegue con un mensaje o algo. O cosas que resolver.»)
  //  · La cuadrilla (y el pañol y «solo mirar») le dice al asistente «avisale a Ángel que…» → tarjeta «Le mando esto a Ángel»
  //    → «Sí, mandalo» → queda en avisosCuadrilla (estado «nuevo») y le llega a Administración (y al supervisor de su orden de
  //    hoy, o también a Oficina, según ⚙ del asistente) por push + campanita. Solo manda un mensaje: no cambia datos.
  //  · «📨 Para resolver» (#prOv): Administración y Oficina (Dirección solo mira) ven cada aviso con quién, cuándo, obra/orden,
  //    tipo y foto; nuevo → visto → resuelto, con una respuesta que le llega de vuelta a la persona («✅ … te respondió»).
  //    En el Inicio Ejecutivo («Para atender»), en el menú y en el Supervisor (seguridad / urgente sin resolver, en rojo).
  //  · Sin escuchas nuevas: la cuadrilla consulta lo suyo solo cuando pregunta; la oficina, una consulta liviana cada 5 min.
  //  · Tope: 10 avisos por persona y día (a confirmar).
  const V = window.__v135;
  if (window.__v155No || !V) return;
  const COL = "avisosCuadrilla", TOPE_DIA = 10;
  const TIPOS = { problema: ["⚠", "Problema"], falta_material: ["📦", "Falta material"], pregunta: ["❓", "Pregunta"], seguridad: ["⛑", "Seguridad"], urgente: ["🚨", "Urgente"], otro: ["💬", "Aviso"] };
  const ROJOS = ["seguridad", "urgente"];
  const $ = (id) => document.getElementById(id);
  const esc = V.esc, intentar = V.intentar;
  const arr = (x) => (Array.isArray(x) ? x : []), obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const hoy = () => iso(new Date());
  const hora = (ts) => { const d = new Date(+ts || Date.now()); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const cuando = (ts) => { const d = new Date(+ts || 0); if (!(+ts > 0)) return ""; return (iso(d) === hoy() ? "hoy" : pad(d.getDate()) + "/" + pad(d.getMonth() + 1)) + " " + hora(ts); };
  const db = () => firebase.firestore();
  const yo = () => intentar(() => PERMISOS.yo() || {}, {}) || {};
  const rol = () => String(yo().rol || "");
  const oficina = () => { const r = rol(); return r === "admin" || r === "oficina"; };
  const veLista = () => !!window.__fbUser && V.rolListo() && !V.esCrew() && (oficina() || !!(window.__esDireccion && window.__esDireccion()));
  const puedeMandar = () => { const y = yo(); return !!window.__fbUser && !!y.rol && y.activo !== false && !y.pendiente && y.rol !== "direccion"; };
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const nombreYo = () => { const y = yo(); return String(y.persona || y.nombre || y.usuario || String((window.__fbUser || {}).email || "").split("@")[0]); };
  const nomObra = (n) => (window.__fmtNombre ? window.__fmtNombre.obra(n || "") : String(n || "").toUpperCase());
  const avisar = (t, tipo) => { try { window.mostrarAviso && window.mostrarAviso(t, tipo); } catch (e) { } };

  // ---------------------------------------------------------------- lo de la persona: su orden de hoy y su última foto
  function misOts() {
    const c = nk(yo().personaClave || yo().persona || "");
    const l = intentar(() => (window.__cuadrilla && window.__cuadrilla.esCrew() ? window.__cuadrilla.misOts() : null), null) || V.ots().filter((o) => o && c && arr(o.personalNombres).map(nk).indexOf(c) >= 0);
    return arr(l).filter((o) => o && o.estado !== "Anulada");
  }
  function otHoy(ref) {
    const l = misOts(), h = hoy();
    if (ref) { const r = String(ref).trim().toUpperCase(); const o = V.ots().find((x) => x && (String(x.id) === String(ref) || String(x.numero || "").toUpperCase() === r)); if (o) return o; }
    return l.filter((o) => String(o.fecha || "").slice(0, 10) === h)[0] || null;
  }
  function ultimaFoto() {
    const yoN = nk(nombreYo()), h = hoy(); let best = null;
    misOts().filter((o) => String(o.fecha || "").slice(0, 10) === h).forEach((o) => {
      const fs = obj(obj(o.campo).fotos); Object.keys(fs).forEach((k) => { const f = fs[k]; if (!f || f.borrada || nk(f.por) !== yoN) return; if (!best || (+f.ts || 0) > best.ts) best = { id: k, mini: /^data:image\//.test(String(f.mini || "")) && String(f.mini).length < 20000 ? f.mini : "", ts: +f.ts || 0 }; });
    });
    return best;
  }
  // ---------------------------------------------------------------- a quién le llega
  const DEST = { admin: "Administración", adminOficina: "Administración y Oficina", adminSup: "Administración y el supervisor de la orden" };
  const avisosA = () => { const a = String(obj(obj(window.__personalNube).asistente).avisosA || ""); return DEST[a] ? a : "adminSup"; };
  async function destinatarios(ot) {
    const modo = avisosA(), quiero = modo === "adminOficina" ? ["admin", "oficina"] : ["admin"];
    let l = intentar(() => arr(PERMISOS.lista()).filter((u) => u && u.email && u.activo !== false && u.pendiente !== true && quiero.indexOf(u.rol) >= 0).map((u) => String(u.email).toLowerCase()), []);
    if (!l.length) { try { const s = await db().collection("usuarios").where("rol", "==", "admin").get(); s.forEach((d) => { const x = d.data() || {}; if (x.email && x.activo !== false) l.push(String(x.email).toLowerCase()); }); } catch (e) { } }
    if (modo === "adminSup" && ot && ot.supervisor && ot.supervisor.email) l.push(String(ot.supervisor.email).toLowerCase());
    const yoE = String((window.__fbUser || {}).email || "").toLowerCase();
    return l.filter((x, i, a) => x && a.indexOf(x) === i && x !== yoE);
  }
  // ---------------------------------------------------------------- mandar (lo llama el «Sí, mandalo» del asistente)
  const KT = "ema.pr.n";
  function cuentaHoy() { try { const x = JSON.parse(localStorage.getItem(KT) || "{}"); return x.d === hoy() ? +x.n || 0 : 0; } catch (e) { return 0; } }
  function sumarHoy() { try { localStorage.setItem(KT, JSON.stringify({ d: hoy(), n: cuentaHoy() + 1 })); } catch (e) { } }
  function armar(a) {
    a = a || {};
    const texto = String(a.texto || "").replace(/\s+/g, " ").trim().slice(0, 600);
    if (!texto) return { err: "Falta qué le aviso a la oficina." };
    const tipo = TIPOS[a.tipo] ? a.tipo : "otro", o = otHoy(a.otId), f = a.foto === false ? null : ultimaFoto();
    let obraN = String(a.obra || "").trim(), obraId = "";
    if (o) { obraN = obraN || o.plazaNombre || ""; obraId = String(o.plazaId || ""); }
    return { texto, tipo, ot: o, otId: o ? String(o.id) : "", otNumero: o ? String(o.numero || "") : "", obraId, obraNombre: obraN ? nomObra(obraN) : "", foto: f };
  }
  async function mandar(a) {
    if (!puedeMandar()) return { err: "Con tu usuario no se pueden mandar avisos desde acá." };
    const x = a && a.texto && a.tipo && a.ot !== undefined ? a : armar(a); if (x.err) return x;
    if (cuentaHoy() >= TOPE_DIA) return { err: `Ya mandaste ${TOPE_DIA} avisos hoy: si es urgente, llamá a la oficina.` };
    const y = yo(), u = window.__fbUser || {}, ahora = Date.now();
    const para = await destinatarios(x.ot);
    const doc = { uid: String(u.uid || ""), email: String(u.email || "").toLowerCase(), nombre: String(y.nombre || y.usuario || ""), persona: String(y.persona || ""), personaClave: String(y.personaClave || ""), rol: String(y.rol || ""), texto: x.texto, tipo: x.tipo, otId: x.otId, otNumero: x.otNumero, obraId: x.obraId, obraNombre: x.obraNombre, fotoId: x.foto ? x.foto.id : "", fotoMini: x.foto ? x.foto.mini : "", ts: ahora, fecha: hoy(), hora: hora(ahora), estado: "nuevo", para, porAsistente: true };
    let id = "";
    try { const r = await db().collection(COL).add(doc); id = r.id; }
    catch (e) { return { err: /permission/i.test(String(e && (e.code || e.message))) ? "La base no dejó guardar el aviso (falta publicar las reglas nuevas de Firebase de la v155). Avisale a la oficina por teléfono." : "No se pudo mandar (sin señal): probá de nuevo en un rato." }; }
    sumarHoy();
    const T = TIPOS[x.tipo], quien = nombreYo().split(" ")[0];
    let n = 0;
    for (const em of para) { try { await window.__pushAvisos.dejarAviso({ email: em, titulo: `${T[0]} ${quien}: ${T[1].toLowerCase()}${x.obraNombre ? " · " + x.obraNombre : ""}`, cuerpo: x.texto, tipo: "avisoCuadrilla", tag: "ema-ac-" + id, ref: id, url: "./" }); n++; } catch (e) { } }
    st.mios = null;
    return { ok: true, id, para: para.length, avisados: n, doc };
  }
  // ---------------------------------------------------------------- lo mío (la cuadrilla: solo cuando pregunta)
  async function mios() {
    const u = window.__fbUser; if (!u) return [];
    const s = await db().collection(COL).where("uid", "==", u.uid).limit(30).get();
    const l = []; s.forEach((d) => l.push(Object.assign({ id: d.id }, d.data())));
    st.mios = l.sort((a, b) => (+b.ts || 0) - (+a.ts || 0));
    return st.mios;
  }
  // ---------------------------------------------------------------- la bandeja (Administración, Oficina; Dirección mira)
  const st = { lista: null, ts: 0, cargando: false, tab: "pend", abierta: false, resp: "", conf: "", msg: "", mios: null, err: "" };
  function cargar(forzar) {
    if (!veLista() || st.cargando || (!forzar && st.lista && Date.now() - st.ts < 5 * 6e4)) return Promise.resolve(st.lista);
    st.cargando = true; st.ts = Date.now();
    return db().collection(COL).orderBy("ts", "desc").limit(80).get().then((s) => {
      const l = []; s.forEach((d) => l.push(Object.assign({ id: d.id }, d.data())));
      st.lista = l; st.cargando = false; st.err = "";
      pintar(); try { window.__inicioPro && window.__inicioPro.pintar(); } catch (e) { } menu();
      return l;
    }, (e) => { st.cargando = false; st.err = /permission/i.test(String(e && (e.code || e.message))) ? "reglas" : "red"; pintar(); return st.lista; });
  }
  const pendientes = () => arr(st.lista).filter((x) => x && x.estado !== "resuelto");
  const nuevos = () => arr(st.lista).filter((x) => x && x.estado === "nuevo");
  function atender() {
    if (!oficina()) return [];
    const p = pendientes(), nn = nuevos().length; if (!p.length) return [];
    const rojo = p.some((x) => ROJOS.indexOf(x.tipo) >= 0);
    return [{ ir: "pararesolver", ico: "campana", cls: rojo ? "rj" : "am", t: "📨 Para resolver", s: (nn ? nn + (nn === 1 ? " aviso nuevo" : " avisos nuevos") + " · " : "") + p.slice(0, 2).map((x) => String(x.persona || x.nombre || "").split(" ")[0] + ": " + String(x.texto).slice(0, 40)).join(" · "), n: nn || p.length }];
  }
  function supHallazgos() {
    return pendientes().filter((x) => ROJOS.indexOf(x.tipo) >= 0).map((x) => ({ g: "rojo", cat: "Avisos", t: `${TIPOS[x.tipo][0]} ${TIPOS[x.tipo][1]} sin resolver: ${String(x.persona || x.nombre || "").split(" ")[0]}`, s: String(x.texto).slice(0, 120) + (x.obraNombre ? " · " + x.obraNombre : ""), ir: { tipo: "pararesolver" }, obraId: x.obraId || "" }));
  }
  function filaHtml(x) {
    const T = TIPOS[x.tipo] || TIPOS.otro, rojo = ROJOS.indexOf(x.tipo) >= 0, of = oficina();
    const est = x.estado === "resuelto" ? '<span class="pr-est ok">✅ Resuelto</span>' : x.estado === "visto" ? '<span class="pr-est vi">👁 Visto</span>' : '<span class="pr-est nu">● Nuevo</span>';
    const acc = !of || x.estado === "resuelto" ? "" : st.conf === x.id ? `<label class="pr-resp">Respuesta para ${esc(String(x.persona || x.nombre || "").split(" ")[0])} (opcional, le llega al celu)<textarea id="prResp" rows="2" maxlength="400" placeholder="Ej: Mañana te lo lleva el pañol">${esc(st.resp)}</textarea></label><div class="pr-acc"><button type="button" class="btn-primary" data-pr="si:${esc(x.id)}">Sí, marcar resuelto</button><button type="button" class="btn-ghost" data-pr="no">Cancelar</button></div>` : `<div class="pr-acc">${x.estado === "nuevo" ? `<button type="button" class="btn-ghost" data-pr="visto:${esc(x.id)}">👁 Visto</button>` : ""}<button type="button" class="btn-primary" data-pr="resolver:${esc(x.id)}">✅ Resuelto</button></div>`;
    return `<div class="pr-item${rojo ? " rojo" : ""}" data-prid="${esc(x.id)}"><div class="pr-cab"><span class="pr-tipo${rojo ? " rojo" : ""}">${T[0]} ${esc(T[1])}</span>${est}<small>${esc(cuando(x.ts))}</small></div>
<div class="pr-cuerpo">${x.fotoMini ? `<button type="button" class="pr-foto" data-pr="foto:${esc(x.id)}" aria-label="Ver la foto"><img alt="" src="${esc(x.fotoMini)}"></button>` : ""}<div><b>${esc(x.persona || x.nombre || x.email)}</b>${x.obraNombre || x.otNumero ? `<small>${esc([x.obraNombre, x.otNumero].filter(Boolean).join(" · "))}</small>` : ""}<p>«${esc(x.texto)}»</p>${x.respuesta ? `<div class="pr-r">↩ ${esc(x.respPorNombre || "")}: «${esc(x.respuesta)}»</div>` : ""}</div></div>${acc}</div>`;
  }
  function html() {
    const l = arr(st.lista), p = l.filter((x) => x.estado !== "resuelto"), r = l.filter((x) => x.estado === "resuelto"), ver = st.tab === "res" ? r : p.slice().sort((a, b) => (ROJOS.indexOf(b.tipo) >= 0) - (ROJOS.indexOf(a.tipo) >= 0) || (+b.ts || 0) - (+a.ts || 0));
    const cab = `<div class="pr-top"><button type="button" class="pr-x" data-pr="cerrar" aria-label="Cerrar">✕</button><div><b>📨 Para resolver</b><small>Lo que avisan la cuadrilla, el pañol y los demás por el asistente${oficina() ? "" : " · solo para mirar"}</small></div></div>`;
    const tabs = `<div class="pr-tabs" role="tablist"><button type="button" role="tab" class="${st.tab !== "res" ? "on" : ""}" aria-selected="${st.tab !== "res"}" data-pr="tab:pend">Pendientes · ${p.length}</button><button type="button" role="tab" class="${st.tab === "res" ? "on" : ""}" aria-selected="${st.tab === "res"}" data-pr="tab:res">Resueltos · ${r.length}</button></div>`;
    const err = st.err === "reglas" ? '<div class="pr-msg rj" role="status">⚠ Falta publicar las reglas de Firebase de la v155 («avisosCuadrilla»).</div>' : st.err === "red" ? '<div class="pr-msg" role="status">Sin señal: se ve lo último que se cargó.</div>' : "";
    const msg = st.msg ? `<div class="pr-msg" role="status">${esc(st.msg)}</div>` : "";
    const cuerpo = st.lista == null ? '<div class="pr-nada">Cargando…</div>' : ver.length ? ver.map(filaHtml).join("") : `<div class="pr-nada">${st.tab === "res" ? "Todavía nada resuelto." : "Nada para resolver. 👌"}</div>`;
    return `<div class="pr-caja">${cab}${tabs}${err}${msg}<div class="pr-lista">${cuerpo}</div><div class="pr-pie">Le llegan a: ${esc(DEST[avisosA()])} (se cambia en el asistente › ⚙). Tope: ${TOPE_DIA} avisos por persona y día (a confirmar).</div></div>`;
  }
  function pintar() {
    const ov = $("prOv"); if (!ov || ov.hidden) return;
    const foco = document.activeElement && document.activeElement.id === "prResp"; if (foco) return;
    const h = html(); if (ov.__h === h) return; ov.innerHTML = h; ov.__h = h;
  }
  function abrir() {
    if (!veLista()) { avisar("🔒 «Para resolver» lo ven Administración, Oficina y Dirección.", "error"); return false; }
    try { window.cerrarMenuLateral && window.cerrarMenuLateral(); } catch (e) { }
    let ov = $("prOv");
    if (!ov) { ov = document.createElement("div"); ov.id = "prOv"; ov.className = "v7-ov no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Para resolver"); document.body.appendChild(ov); }
    ov.hidden = false; ov.__h = ""; st.abierta = true; st.msg = ""; pintar(); cargar(true);
    setTimeout(() => intentar(() => window.__atras && window.__atras.sync && window.__atras.sync(), null), 30);
    return true;
  }
  function cerrar() { const ov = $("prOv"); if (ov) ov.hidden = true; st.abierta = false; st.conf = ""; }
  async function marcar(id, estado, respuesta) {
    if (!oficina()) return { err: "Solo Administración y Oficina marcan los avisos." };
    const x = arr(st.lista).find((y) => y.id === id); if (!x) return { err: "No encontré el aviso." };
    const y = yo(), quien = String(y.nombre || y.usuario || "").split(" ")[0] || "La oficina", ahora = Date.now(), em = String((window.__fbUser || {}).email || "");
    const patch = estado === "visto" ? { estado: "visto", vistoTs: ahora, vistoPor: em } : { estado: "resuelto", resueltoTs: ahora, resueltoPor: em };
    const resp = String(respuesta || "").trim().slice(0, 400);
    if (estado === "resuelto" && resp) Object.assign(patch, { respuesta: resp, respTs: ahora, respPor: em, respPorNombre: quien });
    await db().collection(COL).doc(id).update(patch);
    Object.assign(x, patch);
    if (estado === "resuelto") {
      const cuerpo = resp ? resp : "Lo que avisaste ya está resuelto: «" + String(x.texto).slice(0, 120) + "».";
      const dest = x.personaClave ? { clave: x.personaClave } : { email: x.email };
      try { await window.__pushAvisos.dejarAviso(Object.assign({ titulo: resp ? `✅ ${quien} te respondió` : "✅ Resuelto", cuerpo, tipo: "avisoRespuesta", tag: "ema-acr-" + id, url: "./" }, dest)); } catch (e) { }
    }
    try { window.fbAuditar && window.fbAuditar("aviso_cuadrilla", `${estado}: ${x.persona || x.nombre} · ${String(x.texto).slice(0, 120)}${resp ? " · respuesta: " + resp : ""}`, { ref: id }); } catch (e) { }
    try { window.__inicioPro && window.__inicioPro.pintar(); } catch (e) { }
    menu();
    return { ok: true };
  }
  document.addEventListener("click", async (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-pr]"); if (!b) return;
    const a = b.dataset.pr, id = a.indexOf(":") > 0 ? a.slice(a.indexOf(":") + 1) : "";
    if (a === "abrir") { e.preventDefault(); return abrir(); }
    if (!b.closest("#prOv")) return;
    e.preventDefault();
    if (a === "cerrar") return cerrar();
    if (a.indexOf("tab:") === 0) { st.tab = id; return pintar(); }
    if (a === "no") { st.conf = ""; st.resp = ""; return pintar(); }
    if (a.indexOf("resolver:") === 0) { st.conf = id; st.resp = ""; pintar(); const t = $("prResp"); t && t.focus(); return; }
    if (a.indexOf("foto:") === 0) { const x = arr(st.lista).find((y) => y.id === id); if (x && x.fotoId && window.emaGaleria) window.emaGaleria.abrir([{ id: x.fotoId, mini: x.fotoMini || "", titulo: "Foto de " + String(x.persona || x.nombre || "").split(" ")[0], sub: [x.obraNombre, cuando(x.ts)].filter(Boolean).join(" · ") }], 0); return; }
    if (a.indexOf("visto:") === 0 || a.indexOf("si:") === 0) {
      b.disabled = true; const t = $("prResp"), resp = a.indexOf("si:") === 0 && t ? t.value : "";
      try { const r = await marcar(id, a.indexOf("si:") === 0 ? "resuelto" : "visto", resp); st.msg = r.err ? "⚠ " + r.err : a.indexOf("si:") === 0 ? (resp ? "✅ Resuelto: le llegó la respuesta." : "✅ Resuelto.") : "👁 Marcado como visto."; }
      catch (er) { st.msg = "⚠ No se pudo guardar (" + ((er && (er.code || er.message)) || "sin señal") + ")."; }
      st.conf = ""; st.resp = ""; const ov = $("prOv"); if (ov) ov.__h = ""; return pintar();
    }
  });
  document.addEventListener("input", (e) => { if (e.target && e.target.id === "prResp") st.resp = e.target.value; });
  document.addEventListener("click", (e) => { const ov = $("prOv"); if (ov && !ov.hidden && e.target === ov) cerrar(); });
  // ---------------------------------------------------------------- menú y ⚙ (a quién le llega)
  function menu() {
    let m = $("menuParaResolver");
    if (!veLista()) { m && m.remove(); return; }
    const ini = document.querySelector('#menuLateral [data-vista="inicio"]'); if (!ini) return;
    if (!m) { m = document.createElement("button"); m.type = "button"; m.id = "menuParaResolver"; m.className = ini.className.replace(/\b(activo|active|on)\b/g, ""); m.setAttribute("data-pr", "abrir"); ini.insertAdjacentElement("afterend", m); }
    const n = oficina() ? nuevos().length : 0, h = `<span class="nav-ico">📨</span><span class="nav-txt">Para resolver${n ? ` <b class="pr-bd">${n}</b>` : ""}</span>`;
    if (m.__h !== h) { m.innerHTML = h; m.__h = h; }
  }
  function cfgHtml() {
    const a = avisosA();
    return `<div class="card"><h2>Avisos de la cuadrilla<span class="h2-sub">«avisale a Ángel que…»: a quién le llega el aviso (push y campanita). Todos quedan en «📨 Para resolver».</span></h2><select id="prAvisarA" aria-label="A quién le llegan los avisos de la cuadrilla">${Object.keys(DEST).map((k) => `<option value="${k}"${k === a ? " selected" : ""}>${esc(DEST[k])}</option>`).join("")}</select><div class="hint" id="prAvisarMsg" role="status"></div></div>`;
  }
  document.addEventListener("change", async (e) => {
    if (!e.target || e.target.id !== "prAvisarA" || !intentar(() => !!PERMISOS.esAdmin(), false)) return;
    const v = e.target.value; if (!DEST[v]) return;
    const m = $("prAvisarMsg");
    try {
      await db().collection("configEquipo").doc("personal").set({ asistente: { avisosA: v } }, { merge: true });
      window.__personalNube = Object.assign({}, window.__personalNube || {}, { asistente: Object.assign({}, obj(obj(window.__personalNube).asistente), { avisosA: v }) });
      try { window.fbAuditar && window.fbAuditar("avisos_cuadrilla_a", DEST[v], {}); } catch (er) { }
      if (m) m.textContent = "✓ Guardado: les llega a " + DEST[v] + ".";
    } catch (er) { if (m) m.textContent = "⚠ No se pudo guardar (" + ((er && er.code) || "sin conexión") + ")."; }
  });
  // para el asistente de Administración / Oficina / Dirección («¿qué me avisaron hoy?»)
  async function paraIa(a) {
    a = a || {};
    await cargar(true);
    let l = arr(st.lista);
    if (a.soloHoy) l = l.filter((x) => x.fecha === hoy());
    if (a.estado) l = l.filter((x) => (a.estado === "pendientes" ? x.estado !== "resuelto" : x.estado === a.estado));
    return { total: l.length, nuevos: l.filter((x) => x.estado === "nuevo").length, avisos: l.slice(0, 40).map((x) => ({ quien: x.persona || x.nombre, cuando: cuando(x.ts), tipo: (TIPOS[x.tipo] || TIPOS.otro)[1], texto: x.texto, obra: x.obraNombre || "", orden: x.otNumero || "", estado: x.estado, respuesta: x.respuesta || "", conFoto: !!x.fotoId })), nota: "Lo que mandaron por el asistente (la cuadrilla, el pañol y los demás). Se marcan como vistos o resueltos (con respuesta) en «📨 Para resolver»." };
  }
  setInterval(() => { try { menu(); if (veLista() && oficina() && !document.hidden) cargar(false); if (st.abierta) pintar(); } catch (e) { } }, 60000);
  document.addEventListener("permisos-listos", () => setTimeout(() => { try { menu(); if (veLista()) cargar(false); } catch (e) { } }, 3000));
  window.__paraResolver = { TIPOS, TOPE_DIA, DEST, armar, mandar, mios, cargar, lista: () => arr(st.lista).slice(), nuevos, pendientes, atender, supHallazgos, abrir, cerrar, marcar, cfgHtml, avisosA, destinatarios, ultimaFoto, otHoy, puedeMandar, veLista, paraIa, estado: () => ({ tab: st.tab, abierta: st.abierta, n: arr(st.lista).length, err: st.err }) };
})();
