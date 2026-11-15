(function () {
  "use strict";
  // v161 · El Inicio de Administración y Oficina es la pantalla de Dirección (#iniDir), con permiso de editar.
  // Ángel (15/11): «Que directamente sea la misma pantalla. Con el beneficio de que la oficina y yo podemos editar.»
  //  · admin y oficina abren la app en #iniDir (A en el celu, C en la compu) como su Inicio; Dirección sigue igual (solo mirar);
  //    pañol, cuadrilla y «solo mirar» no cambian.
  //  · Lo del Inicio Ejecutivo (v135) pasa adentro, con sus acciones de siempre: buscador + Asistente, «Para atender» (fundido con
  //    «Necesita tu atención»), la orden sugerida de mañana (#ieSug), «🩺 Supervisor», «En obra ahora», «Órdenes de hoy»,
  //    accesos y «Obras». Las piezas las arma el mismo inicioPro (window.__inicioPro.bloques): no se duplica nada.
  //  · El estilo de esas piezas (las reglas «#iniEje …» de todas las hojas de estilo) se copia una vez a «#iniDir .ie-dentro …».
  //  · El Inicio Ejecutivo queda escondido; «Ver el Inicio de antes» (abajo de todo) lo muestra en esta sesión, con «Volver».
  //  · Todo de memoria, sin escuchas nuevas. Nada se escribe solo.
  //  Pruebas viejas: window.__v161No.
  const V = window.__v135;
  const st = { viejo: false, css: false, tBus: 0 };
  function activo() {
    try {
      if (window.__v161No || window.__v155No || !V || !window.__inicioDir || window.__inicioViejo) return false;
      if (!window.__fbUser || !V.rolListo() || V.esCrew()) return false;
      const r = V.rol(); return r === "admin" || r === "oficina";
    } catch (e) { return false; }
  }
  const on = () => activo() && !st.viejo;
  const SECC = ["drBusca", "drAt", "drBar", "drCurva", "drHoy", "drSug", "drSuper", "drEnObra", "drOts", "drMapaC", "drEq", "drClima", "drProg", "drPlata", "drAccs", "drObras", "drIa"];
  const NADA = { activo: () => false, on: () => false, listo: () => true, nuevo() { }, pintarBloques() { }, SECC };
  if (window.__v161No || !V) { window.__iniUnico = NADA; return; }
  const $ = (id) => document.getElementById(id);
  const { ic, esc, intentar } = V;
  const B = () => (window.__inicioPro && window.__inicioPro.bloques) || null;

  // ---------------------------------------------------------------- el estilo de las piezas del Ejecutivo, una vez
  const EXC = /^(\.ie-(cuerpo|col|hero|in|top|saludo|kpis?|kpi|anillo|logo|red|eyebrow|fecha|zona|busca|campo|iab|tarj)\b|h1\.ie-h1)/;
  function clonarCss() {
    if (st.css) return; st.css = true;
    const t0 = Date.now(), out = [];
    const mapa = (sel) => sel.split(",").map((s) => s.trim()).map((s) => {
      const i = s.indexOf("#iniEje"); if (i < 0) return "";
      const resto = s.slice(i + 7);
      if (!resto) return s === "#iniEje" ? "#iniDir .ie-dentro" : "";
      if (!/^\s/.test(resto)) return "";   // #iniEje.ie-anim …: la entrada del Ejecutivo no va
      if (EXC.test(resto.trim())) return "";
      return s.slice(0, i) + "#iniDir .ie-dentro" + resto;
    }).filter(Boolean).join(",");
    const recorrer = (rules, media) => {
      for (let k = 0; k < rules.length; k++) {
        const r = rules[k];
        if (r.type === 1) { if (String(r.selectorText).indexOf("#iniEje") < 0) continue; const s = mapa(r.selectorText); if (s) out.push(media ? `@media ${media}{${s}{${r.style.cssText}}}` : `${s}{${r.style.cssText}}`); }
        else if (r.type === 4 && r.cssRules) recorrer(r.cssRules, r.media.mediaText);
      }
    };
    for (let i = 0; i < document.styleSheets.length; i++) { let rr = null; try { rr = document.styleSheets[i].cssRules; } catch (e) { rr = null; } if (rr) recorrer(rr, ""); }
    const el = document.createElement("style"); el.id = "inicioUnicoClon"; el.textContent = out.join("\n"); document.head.appendChild(el);
    st.cssMs = Date.now() - t0; st.cssN = out.length;
  }

  // ---------------------------------------------------------------- las piezas
  const wrap = (h) => (h ? `<div class="ie-dentro">${h}</div>` : "");
  function poner(id, h) { const e = $(id); if (!e || e.__h === h) return false; e.innerHTML = h; e.__h = h; return true; }
  function buscaHtml() {
    const iaOk = intentar(() => typeof window.__iaPuede == "function" && window.__iaPuede() && typeof window.__asistenteAbrir == "function", false);
    return `<div class="iu-busca"><label class="iu-campo">${ic("buscar", 1.5, "v5-ic s18")}<input type="search" id="drBuscar" placeholder="Buscar obra o barrio…" aria-label="Buscar obra o barrio" autocomplete="off" enterkeyhint="search" data-lpignore="true" data-1p-ignore data-form-type="other"></label>${iaOk ? `<button type="button" class="iu-iab" data-ie="ia">${ic("ia", 1.5, "v5-ic s18")}Asistente</button>` : ""}</div>`;
  }
  // «Para atender» = lo de Dirección («necesita tu atención»: ritmo, atrasos, material…) + lo del Ejecutivo (para cerrar,
  // sin cerrar, fotos sin obra, para resolver, control del avance, sin tarea, usuarios, sin stock, respaldo, stock negativo…)
  function atenderHtml(d) {
    const b = B(); if (!b) return "";
    const dl = intentar(() => window.__inicioDir.atencion(), []) || [], el = intentar(() => b.atender(d, true), []) || [];
    const hayAtras = el.some((x) => x.ir === "atras" || x.ir === "cerrar");
    const filasDir = dl.map((a, i) => ({ a, i })).filter((x) => !(hayAtras && x.a.ir === "ordenes")).map(({ a, i }) =>
      `<button type="button" class="ie-fila iu-dir" data-dr="at:${i}"><span class="ie-ic ${a.c === "atrasada" ? "rj" : "am"}">${ic(a.c === "atrasada" ? "alerta" : "reloj")}</span><span class="ie-tx"><b>${esc(a.t)}</b><small>${esc(a.s || "")}</small></span><span class="ie-chev">${ic("chev", 1.5, "v5-ic s18")}</span></button>`);
    const n = filasDir.length + el.reduce((s, x) => s + (x.n || 1), 0);
    const filas = filasDir.join("") + el.map(b.fila).join("");
    return `<div class="ie-th"><h2>Para atender <em>· ${n}</em></h2></div>${filas || '<div class="ie-nada">Nada para atender. 👌</div>'}<div style="height:6px"></div>`;
  }
  function nota() {
    const r = $("iniDir"), n = r && r.querySelector(".dr-nota"); if (!n || n.__iu) return;
    n.__iu = 1; n.classList.add("iu-nota");
    n.innerHTML = 'Inicio de Administración y Oficina: los gráficos de Dirección con tus acciones. Todo sale de lo que ya tiene la app.<br><button type="button" class="iu-viejo" data-iu="viejo">Ver el Inicio de antes</button>';
  }
  let pintando = false;
  function pintarBloques() {
    const r = $("iniDir"); if (!r || !r.classList.contains("iu") || pintando || !on()) return;
    const b = B(); if (!b) return;
    pintando = true;
    try {
      const T = st.t ? null : (st.t = { ini: Math.round(performance.now()) }), mk = (k) => { if (T) T[k] = Math.round(performance.now()); };   // la primera vez: cuánto tarda cada parte (estado().t)
      clonarCss(); mk("css");
      const d = b.datos(); mk("datos");
      { const inp = $("drBuscar"), val = inp ? inp.value : b.busca(), foco = inp && document.activeElement === inp;
        if (poner("drBusca", buscaHtml())) { const i2 = $("drBuscar"); if (i2) { i2.value = val; if (foco) i2.focus(); } } }
      poner("drAt", wrap(atenderHtml(d))); mk("atender");
      poner("drSug", wrap(window.__sugerida ? intentar(() => window.__sugerida.inicioHtml(), "") : "")); mk("sug");
      poner("drSuper", wrap(window.__supervisor ? intentar(() => window.__supervisor.inicioHtml(), "") : "")); mk("sup");
      poner("drEnObra", wrap(intentar(() => b.enObra(d), "")));
      poner("drOts", wrap(intentar(() => b.ots(d), "")));
      poner("drAccs", wrap(intentar(() => b.acc(), "")));
      poner("drObras", wrap(intentar(() => b.obras(), "")));
      nota(); mk("fin"); r.__h0 = 1;
    } catch (e) { console.warn("[inicioUnico]", e); }
    pintando = false;
  }
  function obras() { const b = B(); b && poner("drObras", wrap(intentar(() => b.obras(), ""))); }

  // ---------------------------------------------------------------- el Inicio de antes (esta sesión) y volver
  function verViejo(si) {
    st.viejo = !!si;
    try { window.__inicioPro && window.__inicioPro.pintar(); } catch (e) { }
    if (si) {
      const r = $("iniEje"), h = $("ieHero");
      if (r && h && !$("iuVolver")) { const v = document.createElement("div"); v.id = "iuVolver"; v.className = "iu-volver"; v.innerHTML = '<button type="button" data-iu="nuevo">‹ Volver al Inicio nuevo</button><span>Estás viendo el Inicio de antes (queda unos días).</span>'; h.insertAdjacentElement("afterend", v); }
      try { scrollTo(0, 0); } catch (e) { }
    } else {
      try { window.__inicioDir.pintar(); } catch (e) { }
      pintarBloques();
      try { scrollTo(0, 0); } catch (e) { }
    }
  }
  document.addEventListener("click", (e) => {
    const t = e.target && e.target.closest; if (!t) return;
    const u = e.target.closest("[data-iu]");
    if (u) { e.preventDefault(); return verViejo(u.dataset.iu === "viejo"); }
    const ch = e.target.closest('#iniDir [data-ie^="chip:"]');
    if (ch) { setTimeout(() => { const i = $("drBuscar"); i && (i.value = ""); obras(); }, 0); }
  });
  document.addEventListener("input", (e) => {
    if (!e.target || e.target.id !== "drBuscar") return;
    const b = B(); if (!b) return; b.busca(e.target.value);
    clearTimeout(st.tBus); st.tBus = setTimeout(obras, 140);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || !e.target || e.target.id !== "drBuscar") return;
    e.preventDefault(); const b = B(); b && b.busca(e.target.value); obras(); e.target.blur();
    const o = $("drObras"); o && o.scrollIntoView({ block: "start", behavior: "smooth" });
  });
  window.__iniUnico = { activo, on, SECC, pintarBloques, listo: () => { const r = $("iniDir"); return !!r && r.classList.contains("iu") && !!r.__h0; }, nuevo: () => { st.viejo = false; }, verViejo, atenderHtml, clonarCss,
    estado: () => ({ activo: activo(), on: on(), viejo: st.viejo, css: st.css, cssMs: st.cssMs, cssN: st.cssN, t: st.t }) };
  setTimeout(() => { try { on() && window.__inicioPro && window.__inicioPro.pintar(); } catch (e) { } }, 0);   // si el Inicio se pintó antes de que cargara este módulo
  // este módulo va temprano en la página: lo que se pintó mientras se leía el resto (Supervisor, sugerida…) se repinta al terminar
  // (también para Dirección: inicioDir ahora se lee antes que el Supervisor, la sugerida, el Mapa de guerra…)
  const alFinal = () => setTimeout(() => { try { const r = $("iniDir"); r && r.querySelectorAll(".dr-card").forEach((e) => { e.__h = ""; }); window.__inicioDir && window.__inicioDir.pintar(); on() && pintarBloques(); } catch (e) { } }, 60);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", alFinal); else alFinal();
})();
