(function () {
  "use strict";
  // v182 · Datos seguros (auditoría del 19/11 sobre la v176: «¿pasó algo más?»). Arreglos sin bandera:
  //  · Respaldo completo: lee cada lista DE LA BASE (también las obras archivadas); si no puede, usa lo del aparato y lo avisa;
  //    suma configEquipo/ubicacion y reinicios.
  //  · «⬆ Restaurar desde un respaldo»: compara contra la BASE (la lee), nunca duplica (mismo número de registro o mismos datos =
  //    se saltea), escribe con el mismo número de registro (volver a restaurar no duplica), en el catálogo solo completa datos
  //    vacíos; muestra «se agregan N, se saltean M», «Sí» y una segunda confirmación; queda en la auditoría.
  //  · Borrar de verdad (reiniciar movimientos, importar reemplazando todo, limpiar el historial de cómputos): solo
  //    Administración, dentro de «⚠ Zona peligrosa», con dos confirmaciones (la segunda escribiendo BORRAR), un respaldo
  //    de lo que se borra que se baja solo antes y la auditoría. «⬆ Importar movimientos» común solo AGREGA.
  //  · Lo que escribe configEquipo/personal desde el asistente (⚙) y el tablero del dueño pasa por la guardia (v174).
  //  · avanceHist / avanceNotas se agregan con arrayUnion (dos aparatos a la vez no se pisan).
  if (window.__dsListo) return; window.__dsListo = 1;
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" ? x : {});
  const intentar = (f, d) => { try { const r = f(); return r == null ? d : r; } catch (e) { return d; } };
  const db = () => firebase.firestore();
  const yoEmail = () => String((window.__fbUser || {}).email || "");
  const rol = () => intentar(() => String(window.PERMISOS.yo().rol || ""), "");
  const esAdmin = () => rol() === "admin" || intentar(() => !!window.PERMISOS.esAdmin(), false);
  const err = (code, message) => Object.assign(new Error(message), { code, ds: true });
  const hoyISO = () => intentar(() => window.fechaAISO(new Date()), new Date().toISOString().slice(0, 10));
  const auditar = (a, d, x) => { try { window.fbAuditar && window.fbAuditar(a, String(d || "").slice(0, 480), x || {}); } catch (e) { } };
  const msg = (h, mal) => { try { if (typeof window.respaldoMensaje == "function") window.respaldoMensaje(h, mal); } catch (e) { } };
  const bajar = (o, nombre) => {
    if (typeof window.respaldoBajar == "function") return window.respaldoBajar(o, nombre);
    const b = new Blob([JSON.stringify(o)], { type: "application/json" }), u = URL.createObjectURL(b), a = document.createElement("a");
    a.href = u; a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
  };
  const huella = (c, x) => intentar(() => window.respaldoHuella(c, x), JSON.stringify(x));
  const COLS = () => intentar(() => RESPALDO_COLECCIONES, []);   // eslint-disable-line no-undef

  // ---------- la hoja (Promise<boolean>); con escribir: el «Sí» se habilita recién con esa palabra escrita
  function hoja(op) {
    return new Promise((ok) => {
      const v = $("dsHoja"); v && v.remove();
      const d = document.createElement("div"); d.id = "dsHoja"; d.className = "v7-ov v7-esc"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", op.titulo);
      const peligro = op.peligro || !!op.escribir;
      d.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>${esc(op.titulo)}</h3></div><button type="button" class="v7-x" data-dsh="no" aria-label="Cerrar">✕</button></div><div class="ds-txt">${op.html || ""}${op.escribir ? `<label for="dsEscribir">Escribí <b>${esc(op.escribir)}</b> para confirmar</label><input type="text" id="dsEscribir" autocomplete="off" autocapitalize="characters" spellcheck="false">` : ""}</div><div class="v7-acc"><button type="button" class="btn-ghost" data-dsh="no">${esc(op.no || "Cancelar")}</button><button type="button" class="btn-primary${peligro ? " ds-peligro" : ""}" data-dsh="si"${op.escribir ? " disabled" : ""}>${esc(op.si || "Sí")}</button></div></div>`;
      const fin = (r) => { d.remove(); ok(r); };
      d.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("[data-dsh]"); if (b) { if (b.disabled) return; fin(b.dataset.dsh === "si"); } else if (e.target === d) fin(false); });
      if (op.escribir) d.addEventListener("input", (e) => { if (e.target && e.target.id === "dsEscribir") { const s = d.querySelector('[data-dsh="si"]'); s.disabled = String(e.target.value || "").trim().toUpperCase() !== op.escribir; } });
      document.body.appendChild(d);
      if (op.escribir) setTimeout(() => { const i = $("dsEscribir"); i && i.focus && i.focus(); }, 50);
    });
  }
  async function confirmarFuerte(titulo, html, si) {
    if (!(await hoja({ titulo, html, si: "Sí, seguir", peligro: true }))) return false;
    return hoja({ titulo: "Última confirmación", html: `<p>${esc(titulo)}</p><p class="hint">Antes de borrar se baja solo un archivo con lo que se borra y queda anotado en la auditoría.</p>`, escribir: "BORRAR", si: si || "Borrar" });
  }
  const avisar = (titulo, html) => hoja({ titulo, html, si: "Entendido", no: "Cerrar" });

  // =========================================================================================== 1) borrar de verdad: solo por la zona
  let permitido = 0;
  const NO_BORRA = "Esto borra datos de verdad: se hace solo desde «⚠ Zona peligrosa» (Administración), escribiendo BORRAR. Los movimientos se anulan, no se borran.";
  function cerrarBorrados() {
    ["fbClearMovimientos", "fbReplaceAllMovimientos", "fbHistCalcVaciar"].forEach((f) => {
      const o = window[f]; if (typeof o != "function" || o.__ds) return;
      const n = async function () { if (!permitido) throw err("ds-zona", NO_BORRA); return o.apply(this, arguments); };
      n.__ds = 1; window.__heredar && window.__heredar(n, o); window[f] = n;
    });
  }
  async function leerTodo(col, conDocId) {
    const q = await db().collection(col).get();
    return q.docs.map((d) => (conDocId ? Object.assign({}, d.data(), { docId: d.id }) : Object.assign({ id: d.id }, d.data())));
  }
  async function zona(que, datos) {
    const sal = (t) => { try { msg(t, true); } catch (e) { } const z = $("dsZonaMsg"); if (z) z.textContent = t; return avisar("Zona peligrosa", `<p>${esc(t)}</p>`); };
    if (!esAdmin()) return sal("Esto lo hace solo Administración, desde «⚠ Zona peligrosa». Los movimientos se anulan, no se borran.");
    if (!window.__fbUser || !intentar(() => window.stockFirebaseListo(), true)) return sal("Iniciá sesión y revisá la conexión.");
    let lista = [], col = "", titulo = "", si = "Borrar";
    try {
      if (que === "limpiarHist") { col = "historialCalculos"; try { lista = await leerTodo(col, true); } catch (e) { lista = arr(window.historialCompartido).slice(); } }
      else { col = "movimientos"; try { lista = await leerTodo(col); } catch (e) { lista = arr(window.stockMovimientos).slice(); } }
    } catch (e) { }
    if (que === "reiniciar") titulo = `¿Borrar los ${lista.length} movimientos del pañol para todo el equipo? El stock vuelve al punto de partida.`;
    else if (que === "reemplazar") { titulo = `¿Reemplazar los ${lista.length} movimientos de la base por los ${arr(datos).length} del archivo? Se borran todos los de hoy.`; si = "Borrar y reemplazar"; }
    else if (que === "limpiarHist") titulo = `¿Borrar los ${lista.length} cómputos de la calculadora para todo el equipo?`;
    else return;
    if (!(await confirmarFuerte(titulo, `<p><b>${esc(titulo)}</b></p><p>No se puede deshacer desde la app. Lo normal es <b>anular</b> (los movimientos) o borrar de a uno.</p>`, si))) return;
    const f = `antes_de_borrar_${col}_${hoyISO()}.json`;
    try { bajar({ formato: "respaldo-antes-de-borrar-v1", que, coleccion: col, exportado: new Date().toISOString(), porUsuario: yoEmail(), [col]: lista }, f); } catch (e) { return sal("No se pudo bajar el respaldo de lo que se iba a borrar: no se borró nada."); }
    auditar("zona_peligrosa", `${que}: ${lista.length} ${col}${que === "reemplazar" ? " → " + arr(datos).length + " del archivo" : ""} · respaldo bajado (${f})`, { que, coleccion: col, cuantos: lista.length, nuevos: que === "reemplazar" ? arr(datos).length : 0, archivo: f, ids: lista.slice(0, 400).map((x) => x.id || x.docId) });
    permitido++;
    try {
      if (que === "reiniciar") await window.fbClearMovimientos();
      else if (que === "reemplazar") await window.fbReplaceAllMovimientos(datos);
      else { await window.fbHistCalcVaciar(); }
      const t = `✓ Listo. El respaldo de lo borrado se bajó como «${f}».`; msg(t); const z = $("dsZonaMsg"); if (z) z.textContent = t;
    } catch (e) { sal("No se pudo terminar (revisá la conexión). " + ((e && e.message) || "")); }
    finally { permitido--; }
  }
  // importar común: SOLO agrega lo que falta
  async function importarMovs(lista) {
    lista = arr(lista).filter((x) => x && typeof x == "object");
    if (!lista.length) return avisar("Importar movimientos", "<p>El archivo no tiene movimientos.</p>");
    let base;
    try { base = await leerTodo("movimientos"); } catch (e) { return avisar("Importar movimientos", "<p>No se pudo leer el pañol de la base (revisá la conexión). No se importó nada.</p>"); }
    const ids = new Set(base.map((x) => String(x.id))), hu = new Set(base.map((x) => huella("movimientos", x)));
    const nuevos = lista.filter((x) => !(x.id && ids.has(String(x.id))) && !hu.has(huella("movimientos", x)));
    const salt = lista.length - nuevos.length;
    if (!nuevos.length) return avisar("Importar movimientos", `<p>✓ No falta nada: los ${lista.length} movimientos del archivo ya están en la base. No se tocó nada.</p>`);
    if (!(await hoja({ titulo: "Importar movimientos", html: `<p>Se <b>agregan ${nuevos.length}</b> movimiento(s) que faltan y se saltean <b>${salt}</b> (ya están).</p><p class="hint">No se borra ni se pisa nada. Para reemplazar todo, está la «⚠ Zona peligrosa» (solo Administración).</p>`, si: `Sí, agregar ${nuevos.length}` }))) return;
    let n = 0, mal = 0;
    for (const x of nuevos) { try { const c = Object.assign({}, x); delete c.id; delete c.docId; if (x.id) await db().collection("movimientos").doc(String(x.id)).set(c); else await db().collection("movimientos").add(c); n++; } catch (e) { mal++; } }
    auditar("movimientos_importar", `Importó ${n} movimiento(s) que faltaban (salteó ${salt} que ya estaban)${mal ? " · " + mal + " fallaron" : ""}`, { agregados: n, salteados: salt, fallados: mal });
    return avisar("Importar movimientos", `<p>${mal ? `Se agregaron ${n}; ${mal} fallaron (volvé a importar el mismo archivo: lo que ya entró no se duplica).` : `✓ Se agregaron ${n} movimiento(s).`}</p>`);
  }
  function leerArchivo(inp, fn) {
    inp.addEventListener("change", function () {
      const a = inp.files && inp.files[0]; if (!a) return;
      const r = new FileReader();
      r.onload = async () => { let j = null; try { j = JSON.parse(r.result); } catch (e) { } inp.value = ""; if (!j || !Array.isArray(j.movimientos)) return avisar("Importar movimientos", "<p>No se pudo leer el archivo: tiene que ser un JSON exportado desde esta herramienta (con «movimientos»).</p>"); await fn(j.movimientos); };
      r.readAsText(a);
    });
  }
  function armarZonas() {
    // pañol › Acceso y respaldo › Solo stock
    const bR = document.querySelector('#cardStockSoloStock button[onclick="reiniciarStock()"]');
    const inp = $("stockImportInput");
    if (inp && !inp.__ds) { const n = inp.cloneNode(true); n.__ds = 1; inp.replaceWith(n); leerArchivo(n, importarMovs); }   // sin el «reemplaza» de antes
    const bI = document.querySelector('#cardStockSoloStock button[onclick*="stockImportInput"]'); if (bI && !bI.__ds) { bI.__ds = 1; bI.textContent = "⬆ Importar movimientos (JSON) · solo agrega"; }
    if (bR && !$("dsZonaStock")) {
      const card = $("cardStockSoloStock"), z = document.createElement("details");
      z.className = "ds-zona"; z.id = "dsZonaStock"; z.hidden = true;
      z.innerHTML = `<summary>⚠ Zona peligrosa (solo Administración)</summary><div class="hint">Esto <b>borra</b> movimientos de la base para todo el equipo. Lo normal es <b>anular</b> un movimiento. Pide dos confirmaciones (la segunda escribiendo BORRAR) y antes baja solo un archivo con lo que se borra.</div><div class="ds-zbot"></div><input type="file" id="dsReemplazarIn" accept="application/json" style="display:none"><div class="hint" id="dsZonaMsg" role="status"></div>`;
      const bot = z.querySelector(".ds-zbot"); bR.removeAttribute("style"); bR.className = "btn-ghost"; bot.appendChild(bR);
      const bRe = document.createElement("button"); bRe.type = "button"; bRe.className = "btn-ghost"; bRe.textContent = "⬆ Importar y REEMPLAZAR todos los movimientos"; bRe.dataset.ds = "reemplazar"; bot.appendChild(bRe);
      bRe.addEventListener("click", () => { const i = $("dsReemplazarIn"); i && i.click(); });
      leerArchivo(z.querySelector("#dsReemplazarIn"), (l) => zona("reemplazar", l));
      const h = card && card.querySelector(".hint"); if (h) h.innerHTML = "«⬆ Importar movimientos» solo <b>agrega</b> los que faltan (no pisa ni borra nada). Lo que borra está en la «⚠ Zona peligrosa», solo para Administración.";
      if (h) h.insertAdjacentElement("afterend", z); else if (card) card.appendChild(z);
    }
    // Calculadora › historial
    const bH = document.querySelector('button[onclick="limpiarHistorial()"]');
    if (bH && !$("dsZonaCalc")) {
      const z = document.createElement("details"); z.className = "ds-zona"; z.id = "dsZonaCalc"; z.hidden = true;
      z.innerHTML = `<summary>⚠ Zona peligrosa (solo Administración)</summary><div class="hint">Borra todos los cómputos de la calculadora para todo el equipo. Pide dos confirmaciones y antes baja un archivo con lo que se borra.</div><div class="ds-zbot"></div>`;
      const ha = bH.closest(".hist-actions"); z.querySelector(".ds-zbot").appendChild(bH);
      (ha || document.body).insertAdjacentElement("afterend", z);
    }
    visZonas();
  }
  function visZonas() { const a = esAdmin(); ["dsZonaStock", "dsZonaCalc"].forEach((id) => { const z = $(id); if (z && z.hidden === a) z.hidden = !a; }); }
  window.reiniciarStock = () => zona("reiniciar");
  window.limpiarHistorial = () => zona("limpiarHist");

  // =========================================================================================== 2) respaldo completo: de la base
  try { ["ubicacion", "reinicios"].forEach((d) => { if (RESPALDO_CONFIG_DOCS.indexOf(d) < 0) RESPALDO_CONFIG_DOCS.push(d); }); } catch (e) { }   // eslint-disable-line no-undef
  async function exportar() {
    if (!intentar(() => window.stockFirebaseListo(), false)) { msg("⚠ No hay conexión con la base compartida — sin eso el respaldo saldría vacío o incompleto. Revisá internet y recargá la página.", true); return; }
    msg("Armando el respaldo (leyendo todo de la base)…");
    const e = { formato: "respaldo-completo-v3", exportado: new Date().toISOString(), porUsuario: yoEmail() || "(sin sesión)" }, a = [], falto = [], deAparato = [];
    for (const s of COLS()) {
      let l = null;
      try { l = await leerTodo(s.clave, s.clave === "historialCalculos"); } catch (er) { l = null; }
      if (!l) {
        const mem = s.clave === "avanceObras" ? arr(window.avanceObrasTodas).length ? arr(window.avanceObrasTodas) : arr(intentar(() => s.lista(), [])) : arr(intentar(() => s.lista(), []));
        if ((window.__sync || {})[s.clave] || mem.length) { l = mem; deAparato.push(s.titulo.toLowerCase()); }
        else { l = []; falto.push(s.titulo.toLowerCase()); }
      }
      e[s.clave] = l;
      const arch = s.clave === "avanceObras" ? l.filter((o) => o && o.oculta === true).length : 0;
      a.push(`${l.length} ${s.titulo.toLowerCase()}${arch ? ` (${arch} archivadas)` : ""}`);
    }
    try {
      const o = await window.respaldoLeerExtras();
      arr(o.falto).forEach((x) => falto.push(x)); Object.assign(e, o.extras);
      a.push(`${arr(e.reservas).length} reservas`, `${arr(e.fotosObra).length} fichas de fotos`, `${Object.keys(obj(e.configEquipo)).length} listas (nómina, cuadrillas, precios…)`, `${arr(e.usuarios).length} usuarios`);
    } catch (er) { falto.push("reservas, fotos, nómina y usuarios"); }
    if (!["admin", "oficina"].includes(rol())) falto.push("lo que tu usuario no ve (por ejemplo los gastos) — el respaldo completo lo baja Administración u Oficina");
    try { window.__fbUser && typeof window.fbSaludGuardar == "function" && window.fbSaludGuardar({ ultimoRespaldo: { ts: Date.now(), usuario: yoEmail(), resumen: a.join(" · ") } }); } catch (er) { }
    auditar("respaldo", a.join(" · ") + (falto.length ? " · NO SE PUDO LEER: " + falto.join(", ") : "") + (deAparato.length ? " · del aparato: " + deAparato.join(", ") : ""), {});
    try { window.__ultimoRespaldoTs = Date.now(); typeof window.pintarAvisoRespaldo == "function" && window.pintarAvisoRespaldo(); } catch (er) { }
    bajar(e, `respaldo_completo_${hoyISO()}.json`);
    msg(`✓ Respaldo bajado: ${esc(a.join(" · "))}.` + (deAparato.length ? ` <b style="color:var(--amber,#b26a00)">⚠ De la base no se pudo leer: ${esc(deAparato.join(", "))}; va lo que tenía este aparato.</b>` : "") + (falto.length ? ` <b style="color:var(--danger)">⚠ No se pudo leer: ${esc(falto.join(", "))}.</b>` : "") + " Guardalo en algún lado seguro (Drive o mail, no en la misma compu nada más). Las fotos grandes van aparte: «Bajar fotos y archivos».", !!falto.length);
    return e;
  }
  window.exportarRespaldoCompleto = exportar;

  // =========================================================================================== 3) restaurar: solo agrega, contra la base
  const NO_CAT = { id: 1, docId: 1, codigo: 1, activo: 1, unidoEn: 1, editadoPor: 1, editadoTs: 1, origen: 1, ts: 1 };
  const vacio = (k, v) => v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length) || ((k === "costo" || k === "minimo") && Number(v) === 0);
  async function planRestaurar(e) {
    const P = { cols: [], cat: null, extras: null, total: 0, salt: 0 };
    for (const s of COLS()) {
      const items = arr(e[s.clave]).filter((x) => x && typeof x == "object"); if (!items.length) continue;
      let q;
      try { q = await db().collection(s.clave).get(); } catch (er) { return { err: `No se pudo leer «${s.titulo}» de la base (${(er && er.code) || "sin conexión"}): no se restaura nada. Probá con buena señal.` }; }
      const docs = q.docs.map((d) => ({ id: d.id, d: d.data() || {} }));
      if (s.clave === "catalogoProductos") {
        const porCod = new Map(); docs.forEach((x) => porCod.set(String(x.d.codigo != null ? x.d.codigo : x.id), x));
        const ef = new Map(); intentar(() => window.catalogoCompleto(), []).forEach((p) => ef.set(String(p.codigo), p));
        const C = { s, completar: [], nuevos: [], salt: 0 };
        items.forEach((it) => {
          const cod = String(it.codigo != null ? it.codigo : it.id || ""); if (!cod) { C.salt++; return; }
          const b = porCod.get(cod), act = Object.assign({}, ef.get(cod) || {}, b ? b.d : {});
          if (!b && !ef.get(cod)) { const c = Object.assign({}, it); delete c.id; delete c.docId; C.nuevos.push({ id: String(it.id || cod), cod, data: c }); return; }
          const fill = {}; Object.keys(it).forEach((k) => { if (NO_CAT[k] || vacio(k, it[k])) return; if (vacio(k, act[k])) fill[k] = it[k]; });
          if (Object.keys(fill).length) C.completar.push({ id: b ? b.id : String(it.id || cod), cod, desc: act.desc || it.desc || "", fill, existe: !!b });
          else C.salt++;
        });
        P.cat = C; P.total += C.completar.length + C.nuevos.length; P.salt += C.salt; continue;
      }
      const ids = new Set(docs.map((x) => x.id)), hu = new Set(docs.map((x) => huella(s.clave, s.clave === "historialCalculos" ? x.d : Object.assign({ id: x.id }, x.d))));
      const agregar = []; let salt = 0; const vistos = new Set();
      items.forEach((it) => {
        const id = String((s.clave === "historialCalculos" ? it.docId : it.id || it.docId) || "");
        const h = huella(s.clave, it);
        if ((id && ids.has(id)) || hu.has(h) || vistos.has(id || h)) { salt++; return; }
        vistos.add(id || h);
        const c = Object.assign({}, it); delete c.docId; if (s.clave !== "historialCalculos") delete c.id;
        agregar.push({ id, data: c });
      });
      P.cols.push({ s, agregar, salt }); P.total += agregar.length; P.salt += salt;
    }
    try { P.extras = await window.respaldoRestaurarExtras(e, true); } catch (er) { P.extras = null; }
    if (P.extras) P.total += ["reservas", "fotosObra", "adjuntos", "configEquipo", "planosObra", "planosNotas", "planosImg", "herramientas", "herramientasMov", "tableros"].reduce((a, k) => a + (+P.extras[k] || 0), 0);
    return P;
  }
  function planHtml(P) {
    const f = (t, n, s) => `<tr class="${n ? "" : "ds-cero"}"><td>${esc(t)}</td><td class="n">${n}</td><td class="n">${s}</td></tr>`;
    let h = P.cols.map((c) => f(c.s.titulo, c.agregar.length, c.salt)).join("");
    if (P.cat) h += f("Productos del catálogo (nuevos)", P.cat.nuevos.length, "") + f("Productos del catálogo (completar datos vacíos)", P.cat.completar.length, P.cat.salt);
    const X = P.extras || {}, EX = [["reservas", "Reservas"], ["fotosObra", "Fichas de fotos de obra"], ["adjuntos", "Fotos y archivos"], ["configEquipo", "Listas que no están (nómina, precios…)"], ["planosObra", "Planos"], ["herramientas", "Herramientas"], ["herramientasMov", "Historial de herramientas"], ["tableros", "Tableros"]];
    EX.forEach(([k, t]) => { if (+X[k]) h += f(t, +X[k], ""); });
    const cat = P.cat && P.cat.completar.length ? `<p class="hint">En el catálogo solo se completan datos que hoy están vacíos (por ejemplo: ${esc(P.cat.completar.slice(0, 3).map((c) => c.cod + " " + Object.keys(c.fill).join(", ")).join(" · "))}). Nunca se cambia el costo ni la descripción que hay hoy.</p>` : "";
    return `<p>Se compara el archivo con lo que hay <b>hoy en la base</b>. Solo se agrega lo que falta (se reconoce por su número de registro y por sus datos); nada de lo que está se pisa ni se borra. Lo agregado entra con su mismo número de registro: volver a restaurar el mismo archivo no duplica.</p><table class="ds-tabla"><thead><tr><th>Lista</th><th class="n">Se agregan</th><th class="n">Se saltean (ya están)</th></tr></thead><tbody>${h}</tbody></table>${cat}<p>Total: se agregan <b>${P.total}</b>, se saltean <b>${P.salt}</b>.</p>`;
  }
  async function aplicarRestaurar(e, P) {
    let r = 0, mal = 0; const ids = {}, cat = [];
    for (const c of P.cols) for (const x of c.agregar) {
      try { if (x.id) await db().collection(c.s.clave).doc(x.id).set(x.data); else await db().collection(c.s.clave).add(x.data); r++; (ids[c.s.clave] = ids[c.s.clave] || []).length < 100 && ids[c.s.clave].push(x.id || "(nuevo)"); } catch (er) { mal++; }
    }
    if (P.cat) {
      for (const x of P.cat.nuevos) { try { await db().collection("catalogoProductos").doc(x.id).set(x.data); r++; cat.push({ codigo: x.cod, nuevo: true }); } catch (er) { mal++; } }
      for (const x of P.cat.completar) { try { await db().collection("catalogoProductos").doc(x.id).set(Object.assign(x.existe ? {} : { codigo: isNaN(+x.cod) ? x.cod : +x.cod }, x.fill, { editadoPor: yoEmail(), editadoTs: Date.now() }), { merge: true }); r++; cat.push({ codigo: x.cod, campos: Object.keys(x.fill) }); } catch (er) { mal++; } }
    }
    if (P.extras && ["reservas", "fotosObra", "adjuntos", "configEquipo", "planosObra", "planosNotas", "planosImg", "herramientas", "herramientasMov", "tableros"].some((k) => +P.extras[k])) {
      try { const s = await window.respaldoRestaurarExtras(e, false); r += ["reservas", "fotosObra", "adjuntos", "configEquipo", "planosObra", "planosNotas", "planosImg", "herramientas", "herramientasMov", "tableros"].reduce((a, k) => a + (+s[k] || 0), 0); mal += +s.fallados || 0; } catch (er) { mal++; }
    }
    auditar("respaldo_restaurar", `Restauró del respaldo del ${String(e.exportado || "").slice(0, 10)}: agregó ${r}, salteó ${P.salt} que ya estaban${mal ? ", fallaron " + mal : ""}`, { agregados: r, salteados: P.salt, fallados: mal, ids, catalogo: cat.slice(0, 200), archivo: String(e.exportado || ""), de: String(e.porUsuario || "") });
    return { r, mal };
  }
  let restaurando = false;
  async function restaurar(e) {
    if (!e || !String((e || {}).formato || "").startsWith("respaldo-completo-")) { msg("⚠ Ese archivo no es un respaldo completo de esta herramienta. Buscá uno que se llame «respaldo_completo_...json».", true); return; }
    if (!intentar(() => window.stockFirebaseListo(), false) || !window.__fbUser) { msg("⚠ Iniciá sesión y revisá tu conexión a internet para poder restaurar.", true); return; }
    if (!["admin", "oficina"].includes(rol())) { msg("⚠ Restaurar un respaldo lo hace Administración u Oficina.", true); return; }
    if (restaurando) return; restaurando = true;
    try {
      msg("Comparando el respaldo con lo que hay en la base…");
      const P = await planRestaurar(e);
      if (P.err) { msg("⚠ " + esc(P.err), true); return; }
      if (!P.total) { msg(`✓ No falta nada: todo lo que hay en ese respaldo ya está en la base (se saltean ${P.salt}). No se tocó nada.`); return; }
      msg("Mirá la hoja: qué se agrega y qué se saltea.");
      if (!(await hoja({ titulo: "Restaurar desde un respaldo", html: planHtml(P), si: `Sí, agregar ${P.total}` }))) { msg("No se restauró nada (cancelado)."); return; }
      if (!(await hoja({ titulo: "¿Seguro?", html: `<p>Se van a escribir <b>${P.total}</b> registro(s) en la base compartida (para todo el equipo). Lo que ya está no se toca. Queda anotado en la auditoría.</p>`, si: "Sí, restaurar" }))) { msg("No se restauró nada (cancelado)."); return; }
      msg("Restaurando, no cierres la página…");
      const R = await aplicarRestaurar(e, P);
      msg(R.mal ? `Se agregaron ${R.r} registro(s), pero ${R.mal} fallaron (probablemente por la conexión). Volvé a restaurar el mismo archivo: lo que ya entró no se duplica.` : `✓ Listo: se agregaron ${R.r} registro(s); se saltearon ${P.salt} que ya estaban. Nada de lo que había se tocó.`, !!R.mal);
    } finally { restaurando = false; }
  }
  const restViejo = window.restaurarRespaldoCompleto;
  window.restaurarRespaldoCompleto = function (e) { return e && String(e.formato || "") === "respaldo-fotos-v1" && typeof restViejo == "function" ? restViejo(e) : restaurar(e); };

  // =========================================================================================== 4) configEquipo/personal desde el asistente y el tablero del dueño
  window.__dsPersonalSet = async function (patch, op) {
    op = op || {};
    if (!window.__personalCargado) throw err("todavía no llegaron los datos de la base; esperá unos segundos y probá de nuevo", "Todavía no llegaron los datos de la base: esperá unos segundos y probá de nuevo. No se guardó nada.");
    if (+op.desde > 0 && window.__dsPersonalLlego && +op.desde < window.__dsPersonalLlego) {
      setTimeout(() => { try { op.repintar && op.repintar(); } catch (e) { } const m = op.msgId && document.getElementById(op.msgId); if (m) m.textContent = "⚠ Llegaron los datos de la base después de abrir esto: se volvieron a cargar. Revisá y guardá de nuevo. No se guardó nada."; }, 0);
      throw err("llegaron los datos de la base después de abrir esto: se volvieron a cargar, revisá y guardá de nuevo", "Llegaron los datos de la base después de abrir esto: se volvieron a cargar. Revisá y guardá de nuevo. No se guardó nada.");
    }
    let p = patch;
    if (typeof window.__psGuardia == "function") p = await window.__psGuardia(patch, { sinPreguntar: !op.preguntar, accion: op.accion });
    await db().collection("configEquipo").doc("personal").set(p, { merge: true });
    return p;
  };

  // =========================================================================================== 5) avanceHist / avanceNotas: agregar, no reemplazar
  function envolverAvanceCampos() {
    const o = window.fbAvanceCampos; if (typeof o != "function" || o.__ds) return;
    const n = async function (id, patch) {
      try {
        const FV = firebase.firestore.FieldValue, ob = arr(window.avanceObrasTodas).find((x) => x && String(x.id) === String(id));
        if (FV && FV.arrayUnion && ob && ob.__orig && patch && typeof patch == "object") {
          const orig = JSON.parse(ob.__orig || "{}"), p = Object.assign({}, patch);
          ["avanceHist", "avanceNotas"].forEach((k) => {
            if (!Array.isArray(p[k])) return;
            const vie = arr(orig[k]).map((x) => JSON.stringify(x)), nue = p[k].map((x) => JSON.stringify(x));
            const set = new Set(nue), quedan = vie.filter((x) => set.has(x)).length, fuera = vie.length - quedan;
            if (fuera > 0 && !(nue.length >= 200 && vie.slice(0, fuera).every((x) => !set.has(x)))) return;   // sacó algo que no son los más viejos: como antes
            const vs = new Set(vie), add = p[k].filter((x, i) => !vs.has(nue[i]));
            if (!add.length) { delete p[k]; return; }
            p[k] = FV.arrayUnion.apply(FV, add);
          });
          if (!Object.keys(p).length) return;
          return o.call(this, id, p);
        }
      } catch (e) { }
      return o.call(this, id, patch);
    };
    n.__ds = 1; window.__heredar && window.__heredar(n, o); window.fbAvanceCampos = n;
  }

  function tic() { try { cerrarBorrados(); envolverAvanceCampos(); armarZonas(); visZonas(); } catch (e) { } }
  tic();
  document.addEventListener("DOMContentLoaded", tic);
  document.addEventListener("permisos-listos", tic);
  setInterval(tic, 4000);
  window.__datosSeguros = { hoja, confirmarFuerte, zona, importarMovs, exportar, planRestaurar, restaurar, aplicarRestaurar, permitido: () => permitido, estado: () => ({ permitido, zonas: !!$("dsZonaStock") }) };
})();
