(function () {
  "use strict";
  // v145 · Mayúsculas prolijas (pedido de Ángel, 10/11/2026). SOLO cómo se muestra; lo guardado no cambia.
  //  · Obra / plaza: SIEMPRE EN MAYÚSCULAS (como el pliego), con «ID 4026» aparte.
  //  · Barrio, dirección y personas: Tipo Título prolijo («Bº Ciudad de Mis Sueños», «Eridanus 1416», «Juan Pérez»), con las
  //    palabras chicas en minúscula salvo al principio y respetando siglas, números y romanos (ID, Bº, S.A., 1416, II, III).
  //  · Obras (admin): «🔤 Ordenar mayúsculas en la base» muestra antes → después y SOLO con «Sí» guarda los nombres prolijos
  //    por el camino de «Registrar obra» (editarDatosObra + Guardar, con su cascada a órdenes y vales), con auditoría.
  //  Pruebas viejas: window.__v145No (se muestra como antes).
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const intentar = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
  const CHICAS = ["de", "del", "la", "las", "los", "el", "y", "e", "o", "u", "en", "a", "al", "con", "por", "para", "sin", "entre"];
  const SIGLAS = { "ID": "ID", "EPEC": "EPEC", "IPV": "IPV", "YPF": "YPF", "S.A.": "S.A.", "SA": "SA", "SRL": "SRL", "S.R.L.": "S.R.L.", "DGAP": "DGAP", "CPC": "CPC", "UTE": "UTE", "PRFV": "PRFV", "LED": "LED", "SN": "S/N", "S/N": "S/N", "BV.": "Bv.", "AV.": "Av.", "AV": "Av.", "BV": "Bv.", "DR.": "Dr.", "DRA.": "Dra.", "GRAL.": "Gral.", "PJE.": "Pje.", "PJE": "Pje.", "STA.": "Sta.", "STO.": "Sto." };
  const ROMANO = /^(I{1,3}|IV|VI{0,3}|IX|XI{0,3}|XIV|XV)$/;
  const off = () => !!window.__v145No;
  const limpio = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  function palabra(w, i) {
    if (!w) return w;
    const U = w.toLocaleUpperCase("es");
    if (/^B[º°o]\.?$/i.test(w) || /^Bº$/i.test(w)) return "Bº";
    if (/^N[º°]\.?$/i.test(w)) return "Nº";
    if (SIGLAS[U]) return SIGLAS[U];
    if (/\d/.test(w)) return /^\d+[a-zA-Z]?$/.test(w) ? w.toUpperCase() : w.charAt(0).toLocaleUpperCase("es") + w.slice(1).toLocaleLowerCase("es");
    if (ROMANO.test(U) && U.length > 1) return U;   // II, III, IV… (una sola letra puede ser una palabra)
    if (/^([A-Za-zÁÉÍÓÚÑÜáéíóúñü]\.){2,}$/.test(w)) return U;   // siglas con puntos (S.A.)
    const l = w.toLocaleLowerCase("es");
    if (i > 0 && CHICAS.indexOf(l) >= 0) return l;
    return l.replace(/(^|[-'’(/"«])([a-záéíóúñü])/g, (m, a, b) => a + b.toLocaleUpperCase("es"));
  }
  function titulo(s) {
    if (off()) return s == null ? "" : String(s);
    const t = limpio(s); if (!t) return t;
    return t.split(" ").map((w, i) => {
      if (/^[Bb][º°]./.test(w) && !/^[Bb][º°]\.?$/.test(w)) return "Bº " + palabra(w.replace(/^[Bb][º°]\.?/, ""), 1);   // «Bº​Centro» pegado
      return palabra(w, i);
    }).join(" ");
  }
  function obra(s) { if (off()) return s == null ? "" : String(s); return limpio(s).toLocaleUpperCase("es").replace(/(^|\s)B[º°]\.?(?=\s|$)/g, "$1Bº"); }
  function barrio(s) {
    if (off()) return s == null ? "" : String(s);
    const t = titulo(s); if (!t) return t;
    return /^(Bº(\s|$)|Barrios?\s|Villa\s|Parque\s|Country\s)/i.test(t) ? t : "Bº " + t;
  }
  const persona = (s) => titulo(s);
  const direccion = (s) => titulo(s);
  try { if (!off()) document.documentElement.classList.add("v145"); } catch (e) { }   // las mayúsculas de los nombres de obra por CSS (v145.css)
  window.__fmtNombre = { obra, barrio, barrioTal: titulo, direccion, persona, titulo, palabra };

  // ---------------------------------------------------------------- 🔤 Ordenar mayúsculas en la base (admin, con «Sí»)
  const obras = () => intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []);
  const esAdmin = () => intentar(() => !!(PERMISOS.esAdmin && PERMISOS.esAdmin()), false);
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  function cambios() {
    const l = [];
    obras().forEach((o) => {
      if (!o || o.id === "__sinObra") return;
      const n = limpio(o.nombre), b = limpio(o.barrio), d = limpio(o.direccion), x = {};
      if (n && obra(n) !== n) x.nombre = [n, obra(n)];
      if (b && titulo(b) !== b) x.barrio = [b, titulo(b)];
      if (d && titulo(d) !== d) x.direccion = [d, titulo(d)];
      if (Object.keys(x).length) l.push({ id: o.id, ID: o.obraId || "", x });
    });
    return l;
  }
  function hoja() {
    const l = cambios(), v = $("fnOv"); v && v.remove();
    const ov = document.createElement("div"); ov.id = "fnOv"; ov.className = "v7-ov no-print sg-v7"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    const fila = (c) => Object.keys(c.x).map((k) => `<tr><td data-label="Obra">${c.ID ? "ID " + esc(c.ID) : "—"}</td><td data-label="Campo">${{ nombre: "Nombre", barrio: "Barrio", direccion: "Dirección" }[k]}</td><td data-label="Antes"><s>${esc(c.x[k][0])}</s></td><td data-label="Después"><b>${esc(c.x[k][1])}</b></td></tr>`).join("");
    ov.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>🔤 Ordenar mayúsculas en la base</h3><small>${l.length} ${l.length === 1 ? "obra" : "obras"} · nombre en MAYÚSCULAS, barrio y dirección en Tipo Título</small></div><button type="button" class="v7-x" data-fn="x" aria-label="Cerrar">✕</button></div>
${l.length ? `<div class="sg-tabw"><table class="sg-tab tabla-tarjetas"><thead><tr><th>Obra</th><th>Campo</th><th>Antes</th><th>Después</th></tr></thead><tbody>${l.map(fila).join("")}</tbody></table></div><p class="v7-txt">Se guarda obra por obra por «Registrar obra» (el nombre nuevo pasa también a sus órdenes y vales). Nada se toca hasta que digas «Sí».</p>` : '<p class="v7-txt">Ya está todo prolijo. 👌</p>'}
<div class="sg-accs"><button type="button" class="btn-ghost" data-fn="x">No</button>${l.length ? `<button type="button" class="btn-primary" data-fn="si">Sí, guardar ${l.length}</button>` : ""}</div><div class="sg-msg" id="fnMsg" aria-live="polite"></div></div>`;
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov);
  }
  async function guardarTodo(prog) {
    if (!esAdmin()) throw new Error("Lo hace Administración.");
    const l = cambios(), ok = [], mal = [];
    for (const c of l) {
      try {
        if (prog) prog(`Guardando ${ok.length + mal.length + 1} de ${l.length}…`);
        if (typeof window.editarDatosObra != "function") throw new Error("no encontré «Registrar obra»");
        window.editarDatosObra(c.id); await espera(350);
        const put = (id, v) => { const el = $(id); if (el) { el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); } };
        if (c.x.nombre) put("obNombre", c.x.nombre[1]); if (c.x.barrio) put("obBarrio", c.x.barrio[1]); if (c.x.direccion) put("obDireccion", c.x.direccion[1]);
        const ok0 = $("obOk"), er0 = $("obErr"); ok0 && (ok0.innerHTML = ""); er0 && (er0.innerHTML = "");
        const b = $("obGuardar"); if (!b) throw new Error("no encontré el botón de guardar"); b.click();
        let res = ""; for (let i = 0; i < 80 && !res; i++) { await espera(100); const a = $("obOk"), e = $("obErr"); if (a && a.textContent.trim()) res = "ok"; else if (e && e.textContent.trim()) res = "err:" + e.textContent.trim(); }
        if (res !== "ok") throw new Error(res ? res.slice(4) : "no se guardó");
        ok.push(c);
      } catch (e) { mal.push((c.x.nombre ? c.x.nombre[0] : c.id) + ": " + ((e && e.message) || e)); }
    }
    try { window.fbAuditar && ok.length && window.fbAuditar("obras_mayusculas", `Mayúsculas ordenadas en ${ok.length} obras`, { obras: ok.map((c) => ({ id: c.id, antes: Object.keys(c.x).reduce((m, k) => (m[k] = c.x[k][0], m), {}), despues: Object.keys(c.x).reduce((m, k) => (m[k] = c.x[k][1], m), {}) })) }); } catch (e) { }
    try { window.mostrarVista("obras"); } catch (e) { }
    return { ok: ok.length, mal };
  }
  document.addEventListener("click", async (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-fn]"); if (!b) return;
    e.preventDefault(); const a = b.dataset.fn;
    if (a === "abrir") hoja();
    else if (a === "x") { const v = $("fnOv"); v && v.remove(); }
    else if (a === "si") {
      b.disabled = true; const m = $("fnMsg");
      try { const r = await guardarTodo((t) => { if (m) m.textContent = t; }); const v = $("fnOv"); if (m) m.textContent = `✓ Listo: ${r.ok} ${r.ok === 1 ? "obra" : "obras"}.` + (r.mal.length ? " ⚠ " + r.mal.join(" · ") : ""); setTimeout(() => { v && v.remove(); }, r.mal.length ? 4000 : 900); }
      catch (er) { b.disabled = false; if (m) m.textContent = "⚠ " + ((er && er.message) || er); }
    }
  });
  function boton() {
    const q = $("lgBuscar"); let b = $("fnBtn");
    if (off() || !q || !esAdmin()) { b && b.remove(); return; }
    if (b) return;
    b = document.createElement("button"); b.type = "button"; b.id = "fnBtn"; b.className = "btn-ghost no-print"; b.setAttribute("data-fn", "abrir"); b.style.cssText = "width:auto;margin:0 0 12px;min-height:40px;font-size:13px;padding:8px 14px";
    b.textContent = "🔤 Ordenar mayúsculas en la base"; q.insertAdjacentElement("afterend", b);
  }
  let pend = false;
  new MutationObserver(() => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; try { boton(); } catch (e) { } }); }).observe(document.documentElement, { childList: true, subtree: true });
  window.__fmtNombre.cambios = cambios; window.__fmtNombre.guardarTodo = guardarTodo;
})();
