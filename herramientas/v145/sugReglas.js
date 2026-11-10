(function () {
  "use strict";
  // v145 · Reglas de Ángel para armar las órdenes (orden sugerida de la v143 y «Llenar orden»), 10/11/2026:
  //  A) En OBRA, mínimo 2 personas por equipo (editable en ⚙ Ajustes de la sugerida, «según Ángel»). Con barquilla, grúa o
  //     hidro: sí o sí 2 (uno maneja u opera y otro sube o da una mano). Subir/montar el tablero: mínimo 2. Solo las tareas de
  //     galpón (armar luminarias, armar vínculos, armar tableritos, probar artefactos) pueden ser de 1. La sugerida no arma un
  //     equipo de obra de 1: lo deja afuera, lo dice y la persona queda «sin tarea» con dónde ponerla (galpón u otro equipo).
  //     En «Llenar orden»: aviso (no bloqueo) con «Emitir igual».
  //  B) Equipos habituales (no son fijos: base para armar): configEquipo/personal.equiposHab {nombres[], vehiculoId, tareas}.
  //     Producción › Personal del equipo › «👥 Equipos habituales»: la propuesta de Ángel precargada, emparejada con la
  //     nómina por nombre Y apellido («a confirmar» si hay duda, «no encontrado» si no está). Se guarda solo con «Guardar».
  //     La sugerida manda juntos a los de un equipo con su vehículo y al equipo de la grúa a los izajes.
  //  C) Vínculos sin grúa: la grúa monta las columnas sin los vínculos (muchas veces no están armados); los vínculos van
  //     después, aparte, con hidro chica o barquilla, en las columnas ya izadas. El izaje típico pasa a «con caño y sin
  //     vínculo» (6 con 2, 12 con 3). Si hay vínculos armados (galpón), van con el izaje como antes.
  //  Pruebas viejas: window.__v145No (las reglas de antes).
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9ñ ]/g, " ").replace(/\s+/g, " ").trim();
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const intentar = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const off = () => !!window.__v145No;
  const SG = () => window.__sugerida || null;
  const cfg = () => intentar(() => SG().cfg(), {}) || {};
  const GALPON = ["armado_luminaria", "armado_vinculo", "armado_tablerito", "prueba_artefactos", "galpon_prep"];
  const TABLERO = ["colocacion_tablero", "poste_tablero", "poste_madera", "armado_tablero"];
  const VEH2 = { grua: "La grúa", barquilla: "La barquilla", hidro: "El hidro" };
  const minObra = (C) => { const m = Math.round(num((C || cfg()).minObra)); return m >= 1 && m <= 6 ? m : 2; };
  const vehLista = () => intentar(() => window.__vehiculos.lista(), []) || [];
  const tipoVeh = (v) => { const x = vehLista().find((y) => y && v && y.id === v.id); return (x && x.tipo) || (v && v.tipo) || ""; };
  // ---------------------------------------------------------------- A) mínimo 2
  function revisar(n, tareas, vehs, C) {
    C = C || cfg(); const l = [];
    if (off() || !(n > 0)) return l;
    const ks = arr(tareas).filter(Boolean);
    if (ks.length && ks.every((k) => GALPON.indexOf(k) >= 0)) return l;   // galpón: puede ir uno solo
    if (C.reglas && C.reglas.minDos === false) return l;
    const m = minObra(C);
    if (n < m) l.push(`En obra van mínimo ${m} personas (según Ángel): nunca uno solo en una plaza.`);
    const tv = [...new Set(arr(vehs).map(tipoVeh).filter((t) => VEH2[t]))];
    if (n < 2 && tv.length) l.push(`${tv.map((t) => VEH2[t]).join(" / ")} necesita 2: uno maneja u opera y otro sube o da una mano (según Ángel).`);
    if (n < 2 && ks.some((k) => TABLERO.indexOf(k) >= 0)) l.push("El tablero se sube entre 2 como mínimo (según Ángel).");
    return [...new Set(l)];
  }
  function okMin(ord, C) {
    const r = revisar(arr(ord && ord.gente).length, arr(ord && ord.tareas).map((t) => t.k), ord && ord.vehiculos, C);
    return r.length ? r : null;
  }
  // «Llenar orden»: aviso con «Emitir igual» (no bloquea)
  function preguntar(motivos) {
    return new Promise((ok) => {
      const v = $("m2Preg"); v && v.remove();
      const ov = document.createElement("div"); ov.id = "m2Preg"; ov.className = "v7-ov no-print sg-v7"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
      ov.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>👷 Revisá la gente de la orden</h3></div><button type="button" class="v7-x" data-m2="no" aria-label="Cerrar">✕</button></div><div class="sg-av ambar">${motivos.map(esc).join("<br>")}</div><div class="sg-accs"><button type="button" class="btn-ghost" data-m2="no">Volver</button><button type="button" class="btn-primary" data-m2="si">Emitir igual</button></div></div>`;
      let listo = false; const fin = (x) => { if (listo) return; listo = true; ov.remove(); ok(x); };
      ov.addEventListener("click", (e) => { if (e.target === ov) return fin(false); const b = e.target.closest && e.target.closest("[data-m2]"); if (b) fin(b.dataset.m2 === "si"); });
      document.body.appendChild(ov);
    });
  }
  function envolverEmitir() {
    const o = window.emitirOrdenTrabajo; if (typeof o != "function") return false; if (o.__min2) return true;
    const n = async function () {
      if (!off() && !intentar(() => SG() && SG().emitiendo(), false)) {
        const d = intentar(() => window.datosOtDesdeFormulario(), null);
        if (d && !d.sinPlaza) {
          const gente = arr(d.personal).filter((p) => p && String(p.nombre || p).trim()).length, ks = arr(d.actividades).concat(arr(d.actividadesManuales).length ? ["__manual"] : []);
          const r = revisar(gente, ks, d.vehiculos);
          if (r.length && !(await preguntar(r))) { const m = $("otMsg"); if (m) m.textContent = "No se emitió: revisá la gente."; return; }
        }
      }
      return o.apply(this, arguments);
    };
    try { window.__heredar && window.__heredar(n, o); } catch (e) { }
    n.__min2 = 1; window.emitirOrdenTrabajo = n; return true;
  }
  let tEm = setInterval(() => { if (envolverEmitir()) { clearInterval(tEm); setInterval(envolverEmitir, 5000); } }, 400);

  // ---------------------------------------------------------------- B) equipos habituales
  const PROPUESTA = [
    { nombres: ["Ulises Toledo", "Ezequiel"], aVeces: ["Petiti"], veh: ["f100", "f 100"], tareas: "Obra en general (camioneta F100)" },
    { nombres: ["Marcos Manclova", "Mauricio"], veh: ["ford chica", "hidro"], tipo: "hidro", tareas: "Luminarias y vínculos con el hidro chico" },
    { nombres: ["Nahuel", "Vizgarra"], veh: ["barquilla grande", "barquilla"], tipo: "barquilla", tareas: "Barquilla grande: tableros, vínculos y luminarias" },
    { nombres: ["Marcos González", "Federico"], veh: ["barquilla grande", "barquilla"], tipo: "barquilla", tareas: "La otra barquilla grande: tableros, vínculos y luminarias" },
    { nombres: ["Pablo", "Ariel Lastra"], veh: ["grua", "grúa"], tipo: "grua", tareas: "Grúa: montan las columnas y postes PRFV, alzan bolsas de limpieza, desmontan. Van a todas las plazas con izaje", grua: true }
  ];
  const nomina = () => { const p = obj(window.__personalNube); let l = Array.isArray(p.nomina) && p.nomina.length ? p.nomina : Array.isArray(p.lista) ? p.lista : []; return l.filter((x) => x && String(x.nombre || "").trim() && x.activo !== false); };
  function lev(a, b) { if (a === b) return 0; const m = a.length, n = b.length; if (!m || !n) return m + n; let p = Array.from({ length: n + 1 }, (_, j) => j); for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; }
  const parecido = (a, b) => a === b || (a.length > 4 && b.length > 4 && lev(a, b) <= 1);
  // por nombre Y apellido; con duda, «a confirmar» (no elige uno); si no está, «no encontrado»
  function emparejar(nombre) {
    const q = nk(nombre).split(" "), nom = nomina(), full = nom.filter((p) => nk(p.nombre) === q.join(" "));
    if (full.length === 1) return { pedido: nombre, nombre: full[0].nombre, estado: "ok" };
    const tok = (p) => nk(p.nombre).split(" ");
    let c;
    if (q.length >= 2) {
      const ap = q.slice(1);
      c = nom.filter((p) => { const t = tok(p); return parecido(t[0], q[0]) && ap.every((a) => t.slice(1).some((x) => parecido(x, a))); });
      if (c.length === 1) return { pedido: nombre, nombre: c[0].nombre, estado: "parecido" };
      if (c.length > 1) return { pedido: nombre, nombre: "", estado: "confirmar", opciones: c.map((p) => p.nombre) };
      c = nom.filter((p) => ap.every((a) => tok(p).slice(1).some((x) => parecido(x, a))));
      if (c.length === 1) return { pedido: nombre, nombre: c[0].nombre, estado: "confirmar", opciones: [c[0].nombre] };
      const pn = nom.filter((p) => parecido(tok(p)[0], q[0]));
      return { pedido: nombre, nombre: "", estado: pn.length ? "confirmar" : "no", opciones: pn.map((p) => p.nombre) };
    }
    c = nom.filter((p) => tok(p).some((x) => parecido(x, q[0])));
    if (c.length === 1) return { pedido: nombre, nombre: c[0].nombre, estado: "parecido" };
    return { pedido: nombre, nombre: "", estado: c.length ? "confirmar" : "no", opciones: c.map((p) => p.nombre) };
  }
  function vehDeProp(x) {
    const vs = vehLista().filter((v) => v && v.activo !== false), nv = (v) => nk(v.nombre + " " + (v.patente || ""));
    for (const w of x.veh) { const l = vs.filter((v) => nv(v).indexOf(nk(w)) >= 0); if (l.length === 1) return { id: l[0].id, estado: "ok" }; if (l.length > 1) return { id: "", estado: "confirmar", opciones: l.map((v) => v.id) }; }
    if (x.tipo) { const l = vs.filter((v) => v.tipo === x.tipo); if (l.length === 1) return { id: l[0].id, estado: "parecido" }; if (l.length > 1) return { id: "", estado: "confirmar", opciones: l.map((v) => v.id) }; }
    return { id: "", estado: "no" };
  }
  function propuesta() { return PROPUESTA.map((x) => ({ nombres: x.nombres.map(emparejar), aVeces: arr(x.aVeces).map(emparejar), veh: vehDeProp(x), tareas: x.tareas, grua: !!x.grua })); }
  const guardados = () => arr(obj(window.__personalNube).equiposHab).filter((e) => e && arr(e.nombres).length);
  let edit = null, msg = "";
  function estadoTxt(m) { return m.estado === "ok" ? "" : m.estado === "parecido" ? ` <small class="eh-am">≈ «${esc(m.pedido)}» · verificá</small>` : m.estado === "confirmar" ? ` <small class="eh-am">«${esc(m.pedido)}» · a confirmar</small>` : ` <small class="eh-rj">«${esc(m.pedido)}» · no encontrado</small>`; }
  function borrador() {
    if (edit) return edit;
    const g = guardados();
    edit = g.length ? { guardado: true, l: g.map((e) => ({ nombres: arr(e.nombres).map((n) => ({ pedido: n, nombre: n, estado: "ok" })), aVeces: arr(e.aVeces).map((n) => ({ pedido: n, nombre: n, estado: "ok" })), veh: { id: e.vehiculoId || "", estado: "ok" }, tareas: e.tareas || "", grua: !!e.grua })) } : { guardado: false, l: propuesta() };
    return edit;
  }
  const puedeEditar = () => ["produccion", "parte"].some((h) => intentar(() => PERMISOS.permiso(h), "") === "editar");
  function selPersona(i, j, m, aVeces) {
    const nom = nomina();
    return `<span class="eh-p"><select data-eh="p" data-i="${i}" data-j="${j}"${aVeces ? ' data-av="1"' : ""} aria-label="Integrante"><option value="">${m.estado === "no" ? "— no encontrado —" : m.estado === "confirmar" ? "— a confirmar —" : "—"}</option>${nom.map((p) => `<option${p.nombre === m.nombre ? " selected" : ""}>${esc(p.nombre)}</option>`).join("")}</select>${estadoTxt(m)}</span>`;
  }
  function tarjeta() {
    const panel = $("prodPanelPersonal"); let c = $("ehCard");
    if (off() || !panel || panel.style.display === "none" || !window.__fbUser) { c && c.remove(); return; }
    if (c && c.contains(document.activeElement)) return;
    const B = borrador(), vs = vehLista().filter((v) => v && v.activo !== false), ed = puedeEditar();
    const h = `<h2 style="margin:0;"><span class="dot"></span>👥 Equipos habituales</h2><div class="hint" style="margin-top:3px;">No son fijos: la orden sugerida los usa de base para mandar juntos a los de un equipo con su vehículo, y al de la grúa a los izajes.${B.guardado ? "" : " <b>Propuesta de Ángel sin guardar</b>: revisá los nombres marcados y tocá «Guardar»."}</div>
${B.l.map((e, i) => `<div class="eh-e${e.grua ? " grua" : ""}"><div class="eh-n">${i + 1}</div><div class="eh-c"><div class="eh-ps">${e.nombres.map((m, j) => selPersona(i, j, m)).join("")}${e.aVeces.map((m, j) => `<span class="eh-av">a veces:</span>${selPersona(i, j, m, true)}`).join("")}</div>
<div class="eh-f"><select data-eh="v" data-i="${i}" aria-label="Vehículo"><option value="">${e.veh.estado === "no" ? "— vehículo no encontrado —" : e.veh.estado === "confirmar" ? "— vehículo a confirmar —" : "Vehículo…"}</option>${vs.map((v) => `<option value="${esc(v.id)}"${v.id === e.veh.id ? " selected" : ""}>${esc(v.nombre)}${v.patente ? " · " + esc(v.patente) : ""}</option>`).join("")}</select><label class="eh-g"><input type="checkbox" data-eh="g" data-i="${i}"${e.grua ? " checked" : ""}> va a los izajes (grúa)</label></div>
<input type="text" data-eh="t" data-i="${i}" value="${esc(e.tareas)}" placeholder="Tareas típicas" aria-label="Tareas típicas"></div><button type="button" class="eh-x" data-eh="quitar" data-i="${i}" aria-label="Quitar el equipo">✕</button></div>`).join("")}
${ed ? `<div class="sg-accs" style="justify-content:flex-start"><button type="button" class="btn-ghost" data-eh="mas">＋ Equipo</button><button type="button" class="btn-primary" data-eh="guardar">Guardar</button></div>` : '<div class="hint">Los guarda quien edita Producción u Órdenes.</div>'}<div class="hint" id="ehMsg" role="status">${esc(msg)}</div>`;
    if (!c) { c = document.createElement("div"); c.className = "card"; c.id = "ehCard"; c.style.marginTop = "16px"; const ref = $("sgPerCard"); ref ? ref.insertAdjacentElement("afterend", c) : panel.appendChild(c); }
    if (c.__h !== h) { c.innerHTML = h; c.__h = h; }
  }
  async function guardar() {
    const B = borrador();
    const l = B.l.map((e) => ({ nombres: e.nombres.map((m) => m.nombre).filter(Boolean), aVeces: e.aVeces.map((m) => m.nombre).filter(Boolean), vehiculoId: e.veh.id || "", tareas: String(e.tareas || "").trim(), grua: !!e.grua })).filter((e) => e.nombres.length);
    await window.fbPersonalGuardar({ equiposHab: l, ts: Date.now(), usuario: (window.__fbUser || {}).email || "" });
    window.__personalNube = Object.assign({}, window.__personalNube || {}, { equiposHab: l });
    try { window.fbAuditar && window.fbAuditar("equipos_habituales", `Equipos habituales guardados: ${l.length}`, { equipos: l }); } catch (e) { }
    edit = null; msg = "✓ Guardado para la orden sugerida."; try { SG().invalidar(); } catch (e) { }
    return l;
  }
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t || !t.dataset || !t.dataset.eh) return; const B = borrador(), x = B.l[+t.dataset.i]; if (!x) return;
    if (t.dataset.eh === "p") { const L = t.dataset.av ? x.aVeces : x.nombres; L[+t.dataset.j] = { pedido: t.value, nombre: t.value, estado: t.value ? "ok" : "no" }; }
    else if (t.dataset.eh === "v") x.veh = { id: t.value, estado: t.value ? "ok" : "no" };
    else if (t.dataset.eh === "g") x.grua = !!t.checked;
    else if (t.dataset.eh === "t") x.tareas = t.value;
    const c = $("ehCard"); if (c) c.__h = ""; t.blur && t.dataset.eh !== "t" && t.blur(); tarjeta();
  });
  document.addEventListener("click", async (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-eh]"); if (!b || b.tagName === "SELECT" || b.tagName === "INPUT") return;
    e.preventDefault(); const B = borrador(), a = b.dataset.eh;
    if (a === "quitar") B.l.splice(+b.dataset.i, 1);
    else if (a === "mas") B.l.push({ nombres: [{ pedido: "", nombre: "", estado: "no" }, { pedido: "", nombre: "", estado: "no" }], aVeces: [], veh: { id: "", estado: "no" }, tareas: "", grua: false });
    else if (a === "guardar") { b.disabled = true; try { await guardar(); } catch (er) { msg = "⚠ No se pudo guardar (" + ((er && er.code) || "sin conexión") + ")."; } }
    const c = $("ehCard"); if (c) c.__h = ""; tarjeta();
  });
  setInterval(() => { try { tarjeta(); } catch (e) { } }, 1500);
  // para la sugerida
  const enNomina = (n) => nomina().some((p) => nk(p.nombre) === nk(n));
  function vehHab(gente, libres) {
    if (off()) return [];
    const g = arr(gente).map((p) => nk(p.nombre || p)), out = [];
    guardados().forEach((e) => { const n = arr(e.nombres).filter((x) => g.indexOf(nk(x)) >= 0).length; if (n && n >= Math.ceil(arr(e.nombres).length / 2) && e.vehiculoId) { const v = arr(libres).find((y) => y && y.id === e.vehiculoId); if (v && out.indexOf(v) < 0) out.push(v); } });
    return out;
  }
  // la gente de una obra: el equipo de la grúa a los izajes; si la obra no tiene cuadrilla de antes, un equipo habitual libre
  function sumarHab(c, lista, x) {
    if (off()) return null;
    const g = guardados(); if (!g.length) return null;
    const libre = (n) => enNomina(n) && !x.ocup[nk(n)] && !x.aus(n) && !(x.tomado[nk(n)] && x.tomado[nk(n)] !== c.o.id) && arr(x.quitar).indexOf(nk(n)) < 0;
    const T = obj(c.sd && c.sd.tareas), izaje = x.IZ.some((k) => T[k] && num(T[k].queda) > 0);
    const notas = [];
    if (izaje) g.filter((e) => e.grua).forEach((e) => { const l = arr(e.nombres).filter(libre); if (l.length && l.length === arr(e.nombres).length) { l.forEach((n) => { if (!lista.some((y) => nk(y) === nk(n))) lista.push(n); x.tomado[nk(n)] = c.o.id; }); notas.push(`Equipo de la grúa (${l.map((n) => n.split(" ")[0]).join(" y ")}): van a los izajes (equipos habituales).`); } });
    if (!lista.length) { const e = g.find((y) => !y.grua && arr(y.nombres).every(libre)); if (e) { e.nombres.forEach((n) => { lista.push(n); x.tomado[nk(n)] = c.o.id; }); notas.push(`Equipo habitual (${e.nombres.map((n) => n.split(" ")[0]).join(" y ")}) con su vehículo.`); } }
    return notas;
  }
  window.__sugReglas = { GALPON, PROPUESTA, revisar, okMin, minObra, emparejar, propuesta, guardados, guardar, tarjeta, vehHab, sumarHab, envolverEmitir };
})();
