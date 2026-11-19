(function () {
  "use strict";
  // v179 · Producción › Personal del equipo con subíndices por sector (Ángel 19/11: «dentro de Personal del equipo tiene que tener
  //  subíndices que separen a Ilícitos, Alumbrado, Civil, Contratista, Oficina, Dirección y Pañol»).
  //  · El sector de cada persona (`nomina[].sector`, el campo de siempre) suma civil, contratista, oficina, direccion y panol;
  //    «alumbrado» e «ilicitos» quedan igual. Sin sector (o uno que no se conoce) = Alumbrado, como antes.
  //  · Pestañas Todos · Alumbrado · Civil · Ilícitos · Contratista · Oficina · Dirección · Pañol con la cantidad; la tabla se filtra
  //    escondiendo filas (al guardar se leen TODAS: nadie se pierde por estar en otra pestaña); «＋ Agregar persona» trae el sector
  //    de la pestaña; la última pestaña queda en localStorage ema.per.sector.
  //  · Civil = sector Civil + los de Alumbrado con «equipo civil» (v143), con la marca «equipo civil»; Administración puede
  //    pasarlos al sector Civil con «Sí» (por la guardia de la v174, con copia antes). La app no cambia datos sola.
  //  · De obra (tienen tarea cada día, entran en la orden sugerida): Alumbrado, Civil e Ilícitos. Contratista, Oficina, Dirección
  //    y Pañol no. En el pañol el vale sigue con dos sectores: Ilícitos va como Ilícitos, todos los demás como Alumbrado.
  //  Apagado con window.__v179No (la app como la v178).
  if (window.__v179No) return;
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  const intentar = (f, d) => { try { const r = f(); return r == null ? d : r; } catch (e) { return d; } };
  const SECT = [["alumbrado", "Alumbrado", "💡"], ["civil", "Civil", "🧱"], ["ilicitos", "Ilícitos", "🚨"], ["contratista", "Contratista", "🤝"], ["oficina", "Oficina", "🏢"], ["direccion", "Dirección", "📊"], ["panol", "Pañol", "📦"]];
  const CLAVES = SECT.map((s) => s[0]);
  const OBRA = ["alumbrado", "civil", "ilicitos"];
  // texto → clave (también lo dicho: «obra civil», «pañol», «contratado»…). "" si no se reconoce
  function clave(t) {
    const q = nk(t); if (!q) return "";
    if (CLAVES.indexOf(q) >= 0) return q;
    if (/ilici/.test(q)) return "ilicitos";
    if (/alumbr/.test(q)) return "alumbrado";
    if (/civil/.test(q)) return "civil";
    if (/contrat|tercer/.test(q)) return "contratista";
    if (/oficina|administr/.test(q)) return "oficina";
    if (/direcc|gerenc|due[nñ]o|presiden/.test(q)) return "direccion";
    if (/pa[nñ]ol|deposito/.test(q)) return "panol";
    return "";
  }
  const de = (p) => clave(p && typeof p == "object" ? p.sector : p) || "alumbrado";
  const texto = (k) => { const s = SECT.find((x) => x[0] === k) || SECT[0]; return s[1]; };
  const conIcono = (k) => { const s = SECT.find((x) => x[0] === k) || SECT[0]; return s[2] + " " + s[1]; };
  const obra = (p) => OBRA.indexOf(de(p)) >= 0;
  const civil = (p) => !!(p && (p.equipoCivil || de(p) === "civil"));
  const mov = (p) => (de(p) === "ilicitos" ? "ilicitos" : "alumbrado");
  // en qué pestañas aparece
  const enTab = (k, sec, eqCivil) => k === "todos" || k === sec || (k === "civil" && sec === "alumbrado" && !!eqCivil);
  const TABS = [["todos", "Todos"]].concat(SECT.map((s) => [s[0], s[1]]));
  let tab = intentar(() => localStorage.getItem("ema.per.sector"), "") || "todos";
  if (!TABS.some((t) => t[0] === tab)) tab = "todos";
  const nomina = () => intentar(() => window.nominaEquipo() || [], []);
  const esAdmin = () => intentar(() => window.PERMISOS.yo().rol === "admin", false) || intentar(() => window.PERMISOS.esAdmin(), false);
  const edita = () => intentar(() => window.permiso("produccion") === "editar", false);

  // ---------- piezas que usa la tabla (z / W de la base)
  function select(o) {
    const k = de(o);
    return `<select class="per-sector${k === "ilicitos" ? " ilicitos" : ""} ps179-s-${k}" aria-label="Sector">${SECT.map((s) => `<option value="${s[0]}"${s[0] === k ? " selected" : ""}>${s[2]} ${s[1]}</option>`).join("")}</select>`;
  }
  const badge = (o) => (o && o.equipoCivil && de(o) !== "civil" ? `<span class="ps179-civ" title="Marcado «equipo civil» en «Para la orden sugerida»">equipo civil</span>` : "");
  const leer = (tr) => clave((tr.querySelector(".per-sector") || {}).value) || "alumbrado";
  const QUE = ["legajo", "nombre", "sector", "rol", "valorHora", "vehiculoId", "activo"];
  // lo que la tabla no muestra (equipoCivil, rolAConfirmar…) sigue en la fila al rearmar la lista
  function extra(A, tr) { const o = A && A[+tr.dataset.i]; const r = {}; if (o && typeof o == "object") Object.keys(o).forEach((k) => { if (QUE.indexOf(k) < 0) r[k] = o[k]; }); return r; }
  const nuevo = () => (tab !== "todos" ? tab : "alumbrado");
  const datalistTxt = (o) => (de(o) !== "alumbrado" ? " · " + conIcono(de(o)) : "");
  const chip = (o) => (de(o) !== "alumbrado" ? ` · ${esc(texto(de(o)))}` : "");
  function hint(A) {
    const n = {}; A.forEach((b) => { if (String(b.nombre || "").trim()) n[de(b)] = (n[de(b)] || 0) + 1; });
    const l = SECT.filter((s) => n[s[0]]).map((s) => `${s[2]} <b>${n[s[0]]}</b> ${esc(s[1])}`).join(" · ");
    return `<div class="hint" style="margin:0 0 8px;">${l || "Sin personas cargadas."}. En las salidas y devoluciones del pañol el sector se pone solo: Ilícitos va como <b>Ilícitos</b>, los demás como <b>Alumbrado</b>. Tienen tarea cada día y entran en la orden sugerida: Alumbrado, Civil e Ilícitos.</div>`;
  }

  // ---------- las pestañas
  function filas() {
    const A = nomina();
    return [...document.querySelectorAll("#personalBody tr[data-i]")].map((tr) => { const o = A[+tr.dataset.i] || {}; const nom = String((tr.querySelector(".per-nombre") || {}).value || "").trim(); return { tr, sec: leer(tr), civ: !!o.equipoCivil, nom }; });
  }
  function cuentas(l) { const c = {}; TABS.forEach((t) => { c[t[0]] = l.filter((f) => f.nom && enTab(t[0], f.sec, f.civ)).length; }); return c; }
  function pasables() { return intentar(() => { const b = window.__personalNube || {}; const l = Array.isArray(b.nomina) && b.nomina.length ? b.nomina : []; return l.filter((p) => p && p.equipoCivil && de(p) === "alumbrado" && String(p.nombre || "").trim()); }, []); }
  function pintar(soloCuentas) {
    const tb = $("tablaPersonal"); if (!tb) return;
    const caja = tb.parentElement;
    let bar = $("ps179");
    if (!bar) { bar = document.createElement("div"); bar.id = "ps179"; bar.className = "no-print"; caja.parentElement.insertBefore(bar, caja); }
    const l = filas(), c = cuentas(l);
    const pas = tab === "civil" && esAdmin() && window.__personalCargado ? pasables() : [];
    const h = `<div class="subtabs ps179-tabs" role="tablist" aria-label="Sector">${TABS.map((t) => `<button type="button" class="subtab${t[0] === tab ? " activo" : ""}" role="tab" aria-selected="${t[0] === tab}" data-ps179="${t[0]}">${esc(t[1])} <span class="ps179-n">${c[t[0]]}</span></button>`).join("")}</div>`
      + (tab === "civil" ? `<div class="hint ps179-nota">Civil: los del sector Civil y los de Alumbrado marcados «equipo civil».${pas.length ? ` <button type="button" class="btn-ghost ps179-pasar" data-ps179p="1">Pasar los de equipo civil al sector Civil (${pas.length})</button>` : ""}</div>` : "")
      + `<div class="ps179-msg" id="ps179Msg" role="status">${esc(msg)}</div>`;
    if (bar.__h !== h) { bar.__h = h; bar.innerHTML = h; const a = bar.querySelector(".subtab.activo"); if (a && a.scrollIntoView && !soloCuentas) intentar(() => { const t = a.parentElement, ra = a.getBoundingClientRect(), rt = t.getBoundingClientRect(); if (ra.left < rt.left + 8 || ra.right > rt.right - 8) t.scrollLeft = Math.max(0, t.scrollLeft + ra.left - rt.left - 24); }); }
    if (soloCuentas) return;
    l.forEach((f) => { const ver = !f.nom || enTab(tab, f.sec, f.civ); f.tr.classList.toggle("ps179-off", !ver); });
  }
  let msg = "";
  function elegir(k) {
    tab = k; try { localStorage.setItem("ema.per.sector", k); } catch (e) { }
    msg = ""; pintar();
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-ps179]");
    if (b) { elegir(b.dataset.ps179); return; }
    const p = e.target.closest && e.target.closest("[data-ps179p]");
    if (p) pasarCivil();
  });
  document.addEventListener("change", (e) => {
    const s = e.target && e.target.closest && e.target.closest("#personalBody .per-sector");
    if (!s) return;
    s.className = `per-sector${s.value === "ilicitos" ? " ilicitos" : ""} ps179-s-${clave(s.value) || "alumbrado"}`;
    pintar(true);   // la fila queda a la vista hasta cambiar de pestaña (si no, desaparece en la mano)
  });

  // ---------- Administración: «Pasar los de equipo civil al sector Civil» (con «Sí», por la guardia de la v174)
  function preguntar(titulo, html, si) {
    return new Promise((ok) => {
      const v = $("ps179Conf"); v && v.remove();
      const d = document.createElement("div"); d.id = "ps179Conf"; d.className = "v7-ov v7-esc"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", titulo);
      d.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>${esc(titulo)}</h3></div><button type="button" class="v7-x" data-ps179c="no" aria-label="Cerrar">✕</button></div><div class="ps-txt">${html}</div><div class="v7-acc"><button type="button" class="btn-ghost" data-ps179c="no">No, cancelar</button><button type="button" class="btn-primary" data-ps179c="si">${esc(si)}</button></div></div>`;
      const fin = (r) => { d.remove(); ok(r); };
      d.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("[data-ps179c]"); if (b) fin(b.dataset.ps179c === "si"); else if (e.target === d) fin(false); });
      document.body.appendChild(d);
    });
  }
  async function pasarCivil() {
    const l = pasables(); if (!l.length) return;
    const ok = await preguntar(`¿Pasar ${l.length} al sector Civil?`, `<p>Están en Alumbrado con la marca «equipo civil»:</p><ul class="ps-ul">${l.map((p) => `<li>${esc(p.nombre)}</li>`).join("")}</ul><p class="hint">Se guarda la nómina de la base con su sector en Civil (la marca «equipo civil» queda). Queda una copia de cómo estaba. Lo que cambiaste en la tabla y no guardaste no se toca.</p>`, "Sí, pasarlos");
    if (!ok) return;
    const nombres = l.map((p) => nk(p.nombre));
    const b = window.__personalNube || {};
    const nueva = (b.nomina || []).map((p) => (p && nombres.indexOf(nk(p.nombre)) >= 0 ? Object.assign({}, p, { sector: "civil" }) : p));
    msg = "Guardando…"; pintar(true);
    try {
      await window.fbPersonalGuardar({ nomina: nueva, ts: Date.now(), usuario: (window.__fbUser || {}).email || "" });
      try { window.fbAuditar && window.fbAuditar("personal_sector", `Pasó ${l.length} de equipo civil al sector Civil: ${l.map((p) => p.nombre).join(", ")}`, { sector: "civil", personas: l.map((p) => p.nombre) }); } catch (e) { }
      // la tabla: el mismo cambio en las filas (sin tocar lo demás que estuviera escrito)
      const A = nomina(); document.querySelectorAll("#personalBody tr[data-i]").forEach((tr) => { const o = A[+tr.dataset.i]; const n = nk((tr.querySelector(".per-nombre") || {}).value); if (o && nombres.indexOf(n) >= 0) { o.sector = "civil"; const s = tr.querySelector(".per-sector"); if (s) { s.value = "civil"; s.className = "per-sector ps179-s-civil"; } } });
      msg = `✓ Guardado: ${l.length} ${l.length === 1 ? "persona pasó" : "personas pasaron"} al sector Civil.`;
    } catch (er) { msg = window.__psErr ? window.__psErr(er) : "No se pudo guardar."; }
    bar0(); pintar();
  }
  const bar0 = () => { const b = $("ps179"); if (b) b.__h = ""; };

  window.__sec179 = { SECT, CLAVES, OBRA, clave, de, texto, conIcono, obra, civil, mov, enTab, select, badge, leer, extra, nuevo, datalistTxt, chip, hint, pintar, elegir, pasables, pasarCivil, tab: () => tab, cuentas: () => cuentas(filas()) };
  // la pantalla ya estaba dibujada (o se dibuja sola al entrar): pintar
  try { if ($("personalBody") && $("personalBody").children.length) pintar(); } catch (e) { }
})();
