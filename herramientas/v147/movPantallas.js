(function () {
  "use strict";
  // v147 · Movimiento entre pantallas, opción B «como app de banco» (elegida por Ángel, 11/11/2026; maqueta maq_mov/B).
  //  · Cambio de pantalla (mostrarVista: barra de abajo, menú, «atrás»): la nueva entra desde la derecha con sombra y la anterior
  //    se corre un 30 % a la izquierda y se oscurece; con «atrás» (el de la v138 o una flecha ‹ Volver) es al revés. ~280 ms.
  //    La dirección sale del orden de la barra de abajo (más a la derecha o fuera de la barra = más adentro = desde la derecha).
  //  · Legajo (abrir / ← Todas las obras), pantallas de la cuadrilla (#cdApp), subpestañas (.subtabs) y hojas (.v7-ov,
  //    .pf-modal, role=dialog: suben desde abajo y bajan al cerrar). Tarjetas escalonadas (40 ms, tope 8).
  //  · SIN COPIAR la pantalla que se va: queda visible el contenedor anterior REAL (clase .mov-sale, fijo en su lugar) y se
  //    esconde al terminar; lo que la app reemplazó con innerHTML (legajo, #cdApp, una hoja que se cerró) son los mismos nodos
  //    que la app sacó, sin id ni «volver» (ya no son de la página) y se tiran al terminar. Nunca hay id repetidos.
  //  · Solo transform/opacity (Web Animations API). html.mov-anim{overflow-x:hidden} durante el movimiento (Chrome 80 no tiene clip).
  //  · Sin animación: cámara de la app, mapa, Asistente en el celu, visores/galería, hoja A4, Modo obra con la cámara abierta,
  //    lo que no viene de un toque (arranque, relojitos), «prefers-reduced-motion», Perfil › «Movimiento entre pantallas: No»
  //    (localStorage ema.mov = "0"). En la compu (> 900 px): solo un fundido de 150 ms.
  //  · Celu lento: se mide el primer cambio (del toque al cuadro dibujado); si tarda más de 250 ms pasa sola a la opción A
  //    (fundido corto) y Perfil lo dice (localStorage ema.mov.lento = ms).
  //  · No cambia lo que hace cada pantalla: no envuelve funciones, mira la página con MutationObserver y toques.
  //  · Pruebas viejas: window.__movNo (salvo mov:true en h.js).
  if (window.__mov) return;
  var $ = function (id) { return document.getElementById(id); };
  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } }
  };
  var mm = null; try { mm = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null; } catch (e) { mm = null; }
  var DUR = 280, EASE = "cubic-bezier(.32,.72,0,1)", DUR_A = 200, EASE_A = "cubic-bezier(.2,.8,.2,1)", DUR_PC = 150, LENTO_MS = 250, OSCURO = 0.22;
  var ahora = function () { return window.performance && performance.now ? performance.now() : Date.now(); };
  function reducido() { return !!(mm && mm.matches); }
  function ajusteOn() { return LS.get("ema.mov") !== "0"; }
  function lento() { return !!LS.get("ema.mov.lento"); }
  function esPc() { return (window.innerWidth || 0) > 900; }
  function modo() {   // "" sin movimiento · "F" fundido de la compu · "A" fundido corto (celu lento) · "B" como app de banco
    if (window.__movNo || reducido() || !ajusteOn()) return "";
    if (esPc()) return "F";
    return lento() ? "A" : "B";
  }
  function vis(e) {
    if (!e || !e.isConnected) return false;
    var cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return false;
    var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0;
  }
  function anim(el, kf, o) { try { return el.animate(kf, o); } catch (e) { return null; } }
  function camara() { return vis($("emaCam")); }
  function iaTapa() { return !esPc() && vis($("iaPanel")); }
  function fuera() { return vis($("portada")) || !!$("bioVelo"); }

  // ---------------------------------------------------------------- toques (solo se anima lo que viene de un toque)
  var ultInput = -1e9, ultAtras = -1e9, lastY = window.scrollY || 0;
  var VOLVER = '[data-lgvolver],[data-cdvolver],[data-mtvolver],[data-gq="volver"],[data-fp="volver"],.ga-volver,[data-atp="si"]';
  function tocar() { ultInput = ahora(); }
  ["pointerdown", "touchstart", "keydown"].forEach(function (n) { document.addEventListener(n, function () { tocar(); medirTodo(); }, { capture: true, passive: true }); });
  document.addEventListener("click", function (e) { tocar(); var t = e.target; if (t && t.closest && t.closest(VOLVER)) ultAtras = ahora(); }, true);
  window.addEventListener("popstate", function () { ultInput = ahora(); }, true);
  window.addEventListener("scroll", function () { lastY = window.scrollY || 0; }, { passive: true });
  function porInput() { return ahora() - ultInput < 1000 || !!(window.__atrasTs && Date.now() - window.__atrasTs < 1000); }
  // «atrás» del celu / navegador: atrasApp (v138) anota window.__atrasTs al dar cada paso atrás
  function porAtras() { var r = ahora() - ultAtras < 900 || (window.__atrasTs && Date.now() - window.__atrasTs < 900); ultAtras = -1e9; window.__atrasTs = 0; return !!r; }

  // ---------------------------------------------------------------- geometría (medida antes del cambio)
  var geo = typeof WeakMap == "function" ? new WeakMap() : null;
  function medir(el) {
    if (!el || !geo || !el.isConnected || el.classList.contains("mov-sale")) return;
    var r = el.getBoundingClientRect(); if (!r.width) return;
    geo.set(el, { top: r.top + (window.scrollY || 0), left: r.left, width: r.width });
  }
  var hdrAntes = true;
  function hdrVis() { var h = document.querySelector("body > header") || document.querySelector("header"); return vis(h); }
  function medirTodo() {
    if (window.__movNo || animando()) return;
    try { medir(actual); medir($("obrasApp")); medir($("cdApp")); hdrAntes = hdrVis(); lastY = window.scrollY || 0; } catch (e) { }
  }

  // ---------------------------------------------------------------- lo que está corriendo
  var corriendo = [];
  function animando() { return corriendo.length > 0; }
  function terminarTodo() { var l = corriendo.slice(); corriendo = []; l.forEach(function (c) { try { c(); } catch (e) { console.warn("[mov]", e); } }); }
  function registrar(lista, limpiar, dur) {
    var hecho = false;
    var fin = function () {
      if (hecho) return; hecho = true;
      lista.forEach(function (a) { try { a && a.cancel(); } catch (e) { } });
      try { limpiar(); } catch (e) { console.warn("[mov]", e); }
      var i = corriendo.indexOf(fin); if (i >= 0) corriendo.splice(i, 1);
      if (!corriendo.length) document.documentElement.classList.remove("mov-anim");
    };
    corriendo.push(fin);
    var l = lista.filter(Boolean), quedan = l.length;
    l.forEach(function (a) { a.onfinish = function () { if (--quedan <= 0) fin(); }; });
    var porLasDudas = function () { if (hecho) return; if (window.__movPausa) setTimeout(porLasDudas, 100); else fin(); };   // __movPausa: solo para las capturas
    setTimeout(porLasDudas, dur + 160);
    return fin;
  }
  var hist = [];
  function anotar(o) { o.t = Date.now(); hist.push(o); if (hist.length > 40) hist.shift(); }

  // ---------------------------------------------------------------- piezas
  function velo(z, de, a, dur) {
    var v = document.createElement("div"); v.className = "mov-velo"; v.setAttribute("aria-hidden", "true"); v.style.zIndex = String(z);
    document.body.appendChild(v);
    return { el: v, a: anim(v, [{ opacity: de }, { opacity: a }], { duration: dur, easing: EASE, fill: "both" }) };
  }
  // el elemento real que se va: fijo donde estaba (recortado a la pantalla), por encima o por debajo del que entra
  function sale(el, r, display, conFondo) {
    var H = window.innerHeight, T = Math.max(0, r.top), alto = Math.min(r.top + r.height, H) - T;
    if (alto <= 0 || !r.width) return null;
    var s = el.style, sy0 = el.scrollTop;
    s.setProperty("--mov-t", T + "px"); s.setProperty("--mov-l", r.left + "px"); s.setProperty("--mov-w", r.width + "px");
    s.setProperty("--mov-h", (conFondo ? H - T : alto) + "px"); s.setProperty("--mov-d", display || "block");
    el.classList.add("mov-sale"); if (conFondo) el.classList.add("mov-bg");
    el.setAttribute("aria-hidden", "true");
    try { el.scrollTop = T - r.top; } catch (e) { }
    return function () {
      el.classList.remove("mov-sale", "mov-bg", "mov-z1", "mov-z3", "mov-sombra");
      ["--mov-t", "--mov-l", "--mov-w", "--mov-h", "--mov-d"].forEach(function (k) { s.removeProperty(k); });
      el.removeAttribute("aria-hidden");
      try { el.scrollTop = sy0; } catch (e) { }
    };
  }
  // nodos que la app ya sacó (innerHTML): se muestran un momento dentro de su contenedor, sin id ni «volver»
  var LIMPIAR_ATR = ["id", "data-lgvolver", "data-cdvolver", "data-mtvolver", "data-lgabrir", "for", "name"];
  function limpiarNodo(n) {
    if (n.nodeType !== 1) return;
    var l = [n].concat([].slice.call(n.querySelectorAll("[id],[data-lgvolver],[data-cdvolver],[data-mtvolver],[data-lgabrir],[for],[name]")));
    l.forEach(function (e) { LIMPIAR_ATR.forEach(function (a) { if (e.hasAttribute(a)) e.removeAttribute(a); }); });
  }
  function fantasma(cont, nodos, r) {
    var H = window.innerHeight, T = Math.max(0, r.top);
    if (!nodos.length || T >= H || !r.width) return null;
    var f = document.createElement("div"); f.className = "mov-fantasma"; f.setAttribute("aria-hidden", "true");
    f.style.top = T + "px"; f.style.left = r.left + "px"; f.style.width = r.width + "px"; f.style.height = (H - T) + "px";
    var inn = document.createElement("div"); inn.className = "mov-fantasma-in"; inn.style.marginTop = (r.top - T) + "px";
    try { var cs = getComputedStyle(cont); inn.style.paddingLeft = cs.paddingLeft; inn.style.paddingRight = cs.paddingRight; inn.style.paddingTop = cs.paddingTop; } catch (e) { }
    nodos.forEach(function (n) { limpiarNodo(n); inn.appendChild(n); });
    f.appendChild(inn); cont.appendChild(f);
    return f;
  }
  // tarjetas escalonadas
  var TARJ = ".card,.lg-card,.ie-tarj,.ot-card,.tb-card,.pf-tarj,.cd-cd,.kpi,.tarjeta,.sg-card";
  function escalonar(raices, demora) {
    var H = window.innerHeight, n = 0, l = [];
    raices.forEach(function (raiz) {
      if (!raiz || raiz.nodeType !== 1) return;
      if (raiz.matches && raiz.matches(TARJ)) l.push(raiz);
      [].push.apply(l, raiz.querySelectorAll(TARJ));
    });
    var out = [];
    for (var i = 0; i < l.length && n < 8; i++) {
      var e = l[i];
      if (e.classList.contains("ent") || e.closest(".mov-fantasma,.mov-sale")) continue;
      var p = e.parentElement && e.parentElement.closest(TARJ); if (p && l.indexOf(p) >= 0) continue;
      var r = e.getBoundingClientRect(); if (r.height === 0 || r.bottom < 0) continue; if (r.top > H) break;
      if (getComputedStyle(e).animationName !== "none") continue;
      out.push(anim(e, [{ opacity: 0.3, transform: "translateY(22px)" }, { opacity: 1, transform: "none" }], { duration: 300, delay: demora + n * 40, easing: EASE_A, fill: "backwards" }));
      n++;
    }
    return out;
  }
  function deslizar(els, desde, opacidad) {
    var H = window.innerHeight, k = 0, l = [], maxDelay = 0;
    els.forEach(function (el) {
      var r = el.getBoundingClientRect(), enPantalla = r.bottom > 0 && r.top < H && r.height > 0;
      var d = enPantalla ? Math.min(k, 7) * 40 : 0; if (enPantalla) k++;
      if (d > maxDelay) maxDelay = d;
      var a = opacidad ? [{ transform: "translateX(" + desde + "px)", opacity: 0 }, { transform: "none", opacity: 1 }] : [{ transform: "translateX(" + desde + "px)" }, { transform: "none" }];
      l.push(anim(el, a, { duration: DUR, delay: d, easing: EASE, fill: "backwards" }));
    });
    l.maxDelay = maxDelay;
    return l;
  }
  function fundido(els, dx, dur, ease) {
    return els.map(function (el) { return anim(el, [{ opacity: 0, transform: dx ? "translateX(" + dx + "px)" : "none" }, { opacity: 1, transform: "none" }], { duration: dur, easing: ease || EASE_A }); });
  }

  // ---------------------------------------------------------------- cambio de pantalla (mostrarVista)
  var ID_V = { viewInicio: "inicio", viewCalculadora: "calc", viewParteDiario: "parte", viewPlanificacion: "plan", viewAvance: "avance", viewMapa: "mapa", viewStock: "stock", viewInforme: "informe", viewGastos: "gastos", viewProduccion: "produccion", viewNormas: "normas", viewRegistro: "registro", viewObras: "obras", viewGuias: "guias", viewTablero: "tablero", viewMisTareas: "mistareas", viewUsuarios: "usuarios", viewPerfil: "perfil" };
  var NAV_V = { inicio: ["inicio", "plaza"], hoy: ["inicio", "mistareas"], obras: ["obras", "avance", "registro"], ordenes: ["parte"], panol: ["stock"], reservas: ["stock"], catalogo: ["stock"], herramientas: ["stock"], mapa: ["mapa"], perfil: ["perfil"] };
  function nivel(el) {
    var k = ID_V[el.id] || el.id, bs = document.querySelectorAll("#navN1 [data-n1]");
    for (var i = 0; i < bs.length; i++) { var l = NAV_V[bs[i].getAttribute("data-n1")]; if (l && l.indexOf(k) >= 0) return i; }
    return k === "inicio" ? 0 : 50;
  }
  var actual = null, tickVista = false;
  function vistaVisible() {
    var l = document.querySelectorAll(".wrap[id^=view]");
    for (var i = 0; i < l.length; i++) {
      var e = l[i];
      if (e.classList.contains("mov-sale") || e.style.display === "none") continue;
      if (getComputedStyle(e).display === "none") continue;
      return e;
    }
    return null;
  }
  var medido = !!LS.get("ema.mov.medido");
  function medirLento(t0) {
    if (medido) return; medido = true;
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      var dt = Math.round(ahora() - t0 + (+window.__movSumarMs || 0));
      LS.set("ema.mov.medido", String(dt));
      if (dt > LENTO_MS) { LS.set("ema.mov.lento", String(dt)); pintarClase(); try { console.info("[mov] celu lento (" + dt + " ms): fundido corto"); } catch (e) { } }
    }); });
  }
  function porQue(m, ant, nueva) {   // por qué no se movió (para el diagnóstico y las pruebas)
    return !m ? "apagado" : !porInput() ? "sinToque" : fuera() ? "portada" : camara() ? "camara" : iaTapa() ? "asistente" : (ant.id === "viewMapa" || nueva.id === "viewMapa") ? "mapa" : "";
  }
  function cambioVista(ant, nueva) {
    tickVista = true; setTimeout(function () { tickVista = false; }, 0);
    terminarTodo();
    var m = modo(), dir = 0;
    if (ant && nueva && m && porInput() && !fuera() && !camara() && !iaTapa() && ant.id !== "viewMapa" && nueva.id !== "viewMapa") {
      dir = porAtras() ? -1 : (nivel(nueva) < nivel(ant) ? -1 : 1);
      var t0 = ultInput;
      document.documentElement.classList.add("mov-anim");
      if (m === "F") registrar(fundido([nueva], 0, DUR_PC), function () { }, DUR_PC);
      else if (m === "A") registrar(fundido([nueva], 14 * dir, DUR_A), function () { }, DUR_A);
      else empujar(ant, nueva, dir);
      if (!hdrAntes && hdrVis()) { var h = document.querySelector("body > header") || document.querySelector("header"); h && anim(h, [{ opacity: 0, transform: "translateY(-10px)" }, { opacity: 1, transform: "none" }], { duration: m === "B" ? DUR : DUR_A, easing: EASE }); }
      if (m === "B") medirLento(t0);
      anotar({ tipo: "vista", de: ant.id, a: nueva.id, dir: dir, modo: m });
    } else if (ant && nueva) anotar({ tipo: "vista", de: ant.id, a: nueva.id, dir: 0, modo: "", por: porQue(m, ant, nueva) });
    hdrAntes = hdrVis();
    medir(nueva);
  }
  function empujar(ant, nueva, dir) {
    var W = window.innerWidth, g = (geo && geo.get(ant)) || null;
    if (!g) { var rn = nueva.getBoundingClientRect(); g = { top: rn.top + (window.scrollY || 0), left: rn.left, width: rn.width }; }
    var r = { top: g.top - lastY, left: g.left, width: g.width, height: 1e5 };
    var deshacer = sale(ant, r, "block", true);
    nueva.classList.add("mov-entra", dir > 0 ? "mov-z3" : "mov-z1");
    if (dir > 0) nueva.classList.add("mov-sombra");
    if (deshacer) { ant.classList.add(dir > 0 ? "mov-z1" : "mov-z3"); if (dir < 0) ant.classList.add("mov-sombra"); }
    var v = velo(2, dir > 0 ? 0 : OSCURO, dir > 0 ? OSCURO : 0, DUR), l = [];
    if (dir > 0) {
      l.push(anim(nueva, [{ transform: "translateX(" + W + "px)" }, { transform: "none" }], { duration: DUR, easing: EASE }));
      if (deshacer) l.push(anim(ant, [{ transform: "none" }, { transform: "translateX(" + (-0.3 * W) + "px)" }], { duration: DUR, easing: EASE, fill: "forwards" }));
    } else {
      l.push(anim(nueva, [{ transform: "translateX(" + (-0.3 * W) + "px)" }, { transform: "none" }], { duration: DUR, easing: EASE }));
      if (deshacer) l.push(anim(ant, [{ transform: "none" }, { transform: "translateX(" + W + "px)" }], { duration: DUR, easing: EASE, fill: "forwards" }));
    }
    l.push(v.a);
    var esc = escalonar([nueva], dir > 0 ? 30 : 10);
    registrar(l, function () {
      esc.forEach(function (a) { try { a && a.finish(); } catch (e) { } });
      v.el.remove(); deshacer && deshacer();
      nueva.classList.remove("mov-entra", "mov-z1", "mov-z3", "mov-sombra");
      setTimeout(function () { medir(nueva); }, 0);
    }, DUR);
  }
  var moV = typeof MutationObserver == "function" ? new MutationObserver(function () {
    var v = vistaVisible(); if (v === actual) return;
    var ant = actual; actual = v;
    try { cambioVista(ant, v); } catch (e) { console.warn("[mov]", e); }
  }) : null;
  var mirados = typeof WeakSet == "function" ? new WeakSet() : null;
  function mirarVistas() {
    if (!moV || !mirados) return;
    [].forEach.call(document.querySelectorAll(".wrap[id^=view]"), function (e) { if (!mirados.has(e)) { mirados.add(e); moV.observe(e, { attributes: true, attributeFilter: ["style", "class", "hidden"] }); } });
    ["obrasApp", "cdApp"].forEach(function (id) { var c = $(id); if (c && !mirados.has(c)) { mirados.add(c); mirarCont(c); } });
  }

  // ---------------------------------------------------------------- legajo y pantallas de la cuadrilla (contenido reemplazado)
  var CONT = {
    obrasApp: { clave: function (c) { return c.querySelector("[data-lgvolver]") ? "lg" : "lista"; }, dir: function (k0, k1) { return k1 === "lg" ? 1 : -1; } },
    cdApp: { clave: function (c) { return c.getAttribute("data-pant") || "hoy"; }, dir: function (k0, k1) { return k1 === "hoy" ? -1 : k0 === "hoy" ? 1 : 0; } }
  };
  var estC = {};
  function mirarCont(c) {
    var def = CONT[c.id]; if (!def) return;
    estC[c.id] = def.clave(c);
    new MutationObserver(function (recs) {
      if (!c.isConnected) return;
      var k0 = estC[c.id], k1 = def.clave(c); estC[c.id] = k1;
      if (k0 === k1 || tickVista || window.__movNo) return;
      var sacados = [], puestos = [];
      recs.forEach(function (r) {
        if (r.type !== "childList" || r.target !== c) return;
        [].forEach.call(r.removedNodes, function (n) { if (n.nodeType === 1 && !n.isConnected && !n.classList.contains("mov-fantasma")) sacados.push(n); });
      });
      [].forEach.call(c.children, function (n) { if (!n.classList.contains("mov-fantasma")) puestos.push(n); });
      try { cambioCont(c, def, k0, k1, sacados, puestos); } catch (e) { console.warn("[mov]", e); }
    }).observe(c, { childList: true, attributes: true, attributeFilter: ["data-pant"] });
  }
  function cambioCont(c, def, k0, k1, sacados, puestos) {
    var m = modo();
    if (!m || !porInput() || camara() || iaTapa() || fuera()) { anotar({ tipo: c.id, de: k0, a: k1, dir: 0, modo: "" }); medir(c); return; }
    terminarTodo();
    var d0 = def.dir(k0, k1), atras = porAtras(), dir = atras ? -1 : (d0 || 1);
    document.documentElement.classList.add("mov-anim");
    anotar({ tipo: c.id, de: k0, a: k1, dir: dir, modo: m });
    if (m !== "B") { registrar(fundido(puestos, m === "A" ? 14 * dir : 0, m === "A" ? DUR_A : DUR_PC), function () { }, DUR_A); medir(c); return; }
    var W = window.innerWidth, rc = c.getBoundingClientRect(), g = (geo && geo.get(c)) || { top: rc.top + (window.scrollY || 0), left: rc.left, width: rc.width };
    var f = fantasma(c, sacados, { top: g.top - lastY, left: rc.left, width: rc.width });
    var fondo = null, l = [];
    if (f) f.classList.add(dir > 0 ? "mov-z1" : "mov-z3");
    if (f && dir < 0) f.classList.add("mov-sombra");
    // el que entra: un fondo liso que viaja con las tarjetas nuevas (así no se ve lo de atrás entre tarjeta y tarjeta)
    var v = velo(2, dir > 0 ? 0 : OSCURO, dir > 0 ? OSCURO : 0, DUR);   // el velo antes que el fondo: el fondo queda por encima
    if (dir > 0) { fondo = document.createElement("div"); fondo.className = "mov-fondo mov-sombra"; fondo.setAttribute("aria-hidden", "true"); document.body.appendChild(fondo); }
    puestos.forEach(function (n) { n.classList.add("mov-el", dir > 0 ? "mov-z3" : "mov-z1"); });
    var desde = dir > 0 ? W : -0.3 * W;
    var dl = deslizar(puestos, desde, false); l = l.concat(dl);
    if (fondo) l.push(anim(fondo, [{ transform: "translateX(" + W + "px)" }, { transform: "translateX(0)" }], { duration: DUR, easing: EASE, fill: "forwards" }));
    if (f) l.push(anim(f, [{ transform: "none" }, { transform: "translateX(" + (dir > 0 ? -0.3 * W : W) + "px)" }], { duration: DUR, easing: EASE, fill: "forwards" }));
    l.push(v.a);
    registrar(l, function () {
      f && f.remove(); fondo && fondo.remove(); v.el.remove();
      puestos.forEach(function (n) { n.classList.remove("mov-el", "mov-z1", "mov-z3"); });
      setTimeout(function () { medir(c); }, 0);
    }, DUR + (dl.maxDelay || 0));
  }

  // ---------------------------------------------------------------- subpestañas (.subtabs)
  function activa(st) { return st.querySelector(".subtab.activo, .subtab.active"); }
  function contenidoDe(st) { var r = [], e = st.nextElementSibling; while (e) { if (!/^(SCRIPT|STYLE|TEMPLATE)$/.test(e.tagName) && !e.classList.contains("mov-sale") && vis(e)) r.push(e); e = e.nextElementSibling; } return r; }
  function indice(st, b) { return [].filter.call(st.querySelectorAll(".subtab"), function (x) { return x.style.display !== "none"; }).indexOf(b); }
  var subPend = null;
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest && e.target.closest(".subtabs .subtab"); if (!b) return;
    var st = b.closest(".subtabs"), a = activa(st); if (!a || a === b || !modo() || camara() || iaTapa()) return;
    terminarTodo();
    var antes = contenidoDe(st).map(function (el) { return { el: el, r: el.getBoundingClientRect(), d: getComputedStyle(el).display }; });
    subPend = { st: st, b: b, dir: indice(st, b) > indice(st, a) ? 1 : -1, antes: antes };
    setTimeout(subDespues, 0);
  }, true);
  window.addEventListener("click", function () { subDespues(); }, false);   // en el mismo toque, apenas la app dibujó
  function subDespues() {
    var p = subPend; subPend = null; if (!p) return;
    var m = modo(); if (!m || !p.st.isConnected) return;
    var ahoraV = contenidoDe(p.st), antesEl = p.antes.map(function (x) { return x.el; });
    var nuevos = ahoraV.filter(function (el) { return antesEl.indexOf(el) < 0; });
    var idos = p.antes.filter(function (x) { return x.el.isConnected && ahoraV.indexOf(x.el) < 0; });
    if (!nuevos.length) nuevos = ahoraV;
    if (!nuevos.length && !idos.length) return;
    var dir = p.dir, W = window.innerWidth, l = [], deshacer = [];
    document.documentElement.classList.add("mov-anim");
    anotar({ tipo: "sub", de: "", a: p.b.getAttribute("data-sub") || "", dir: dir, modo: m });
    if (m !== "B") { registrar(fundido(nuevos, m === "A" ? 12 * dir : 0, m === "A" ? DUR_A : DUR_PC), function () { }, DUR_A); return; }
    idos.forEach(function (x) {
      var d = sale(x.el, x.r, x.d, false); if (!d) return; deshacer.push(d); x.el.classList.add("mov-z1");
      l.push(anim(x.el, [{ transform: "none", opacity: 1 }, { transform: "translateX(" + (-dir * 0.35 * W) + "px)", opacity: 0 }], { duration: DUR, easing: EASE, fill: "forwards" }));
    });
    var dl = deslizar(nuevos, dir * W * 0.6, true); l = l.concat(dl);
    registrar(l, function () { deshacer.forEach(function (d) { d(); }); }, DUR + (dl.maxDelay || 0));
  }

  // ---------------------------------------------------------------- hojas: suben al abrir, bajan al cerrar
  var NO_HOJA = /^(emaCam|iaPanel|hojaOv|gpVisor|plnVisor|mfVisor|hojaCelOv|hojaCelHoja|cbHoja|fgHoja|gnLam|cdGuia|esOv|ecElegir|bioVelo|iaCharla|iaCfg|portada|rolEspera|avisoApp|navN1|navTab|ofBarra|sugCaja|uvPanel|edBanner|offAviso|permToast|ieReloj|iaFab|mpPanel|pyOv)$/;
  function esHoja(n) {
    if (!n || n.nodeType !== 1 || !n.matches) return false;
    if (!n.matches('.v7-ov, .pf-modal, [role="dialog"], [aria-modal="true"]')) return false;
    if (n.id && NO_HOJA.test(n.id)) return false;
    return !n.classList.contains("mov-cierra");
  }
  function cajaDe(ov) { try { return ov.querySelector(":scope > .v7-caja, :scope > .pf-caja"); } catch (e) { return null; } }
  function enMapa() { var v = $("viewMapa"); return !!v && v.style.display !== "none"; }   // adentro del mapa no se mueve nada
  function abrirHoja(ov) {
    var m = modo(); if (!m || !porInput() || camara() || enMapa()) return;
    var caja = cajaDe(ov), l = [];
    if (m === "B") {
      l.push(anim(ov, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: "ease-out" }));
      if (caja) l.push(anim(caja, [{ transform: "translateY(100%)" }, { transform: "none" }], { duration: 300, easing: EASE }));
    } else l.push(anim(ov, [{ opacity: 0 }, { opacity: 1 }], { duration: m === "A" ? DUR_A : DUR_PC, easing: "ease-out" }));
    anotar({ tipo: "hoja", de: "", a: ov.id || "", dir: 1, modo: m });
  }
  var ghostsPend = [], yaBajo = typeof WeakSet == "function" ? new WeakSet() : null, cerrandoIds = typeof WeakMap == "function" ? new WeakMap() : null;
  function cerrarHoja(ov) {
    var m = modo(); if (!m || !porInput() || camara() || enMapa()) return;
    var ids = []; [ov].concat([].slice.call(ov.querySelectorAll("[id]"))).forEach(function (e) { if (e.id) { ids.push([e, e.id]); e.removeAttribute("id"); } });
    ov.classList.add("mov-cierra"); ov.setAttribute("aria-hidden", "true"); yaBajo && yaBajo.add(ov);
    ghostsPend.push(ov); document.body.appendChild(ov);
    var caja = cajaDe(ov), l = [], dur = m === "B" ? 210 : m === "A" ? DUR_A : DUR_PC;
    l.push(anim(ov, [{ opacity: 1 }, { opacity: 0 }], { duration: dur, easing: "ease-out", fill: "forwards" }));
    if (m === "B" && caja) l.push(anim(caja, [{ transform: "none" }, { transform: "translateY(100%)" }], { duration: 200, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" }));
    var fin = registrar(l, function () {
      if (ov.parentNode && ov.classList.contains("mov-cierra")) ov.parentNode.removeChild(ov);
      ov.classList.remove("mov-cierra"); ov.removeAttribute("aria-hidden");
      ids.forEach(function (x) { x[0].id = x[1]; });
    }, dur);
    cerrandoIds && cerrandoIds.set(ov, fin);
    anotar({ tipo: "hojaCierra", de: ids.length ? ids[0][1] : "", a: "", dir: -1, modo: m });
  }
  var moB = typeof MutationObserver == "function" ? new MutationObserver(function (recs) {
    if (window.__movNo) return;
    var puestos = [], sacados = [];
    recs.forEach(function (r) { [].forEach.call(r.addedNodes, function (n) { puestos.push(n); }); [].forEach.call(r.removedNodes, function (n) { sacados.push(n); }); });
    mirarVistas();
    var idsNuevos = {};
    puestos.forEach(function (n) {
      if (n.nodeType !== 1) return;
      var i = ghostsPend.indexOf(n);
      if (i >= 0) { ghostsPend.splice(i, 1); return; }
      if (n.classList.contains("mov-cierra")) {   // la app volvió a poner la misma hoja mientras bajaba: se queda
        var f = cerrandoIds && cerrandoIds.get(n); n.classList.remove("mov-cierra"); f && f(); yaBajo && yaBajo.delete(n); return;
      }
      yaBajo && yaBajo.delete(n);   // la app la volvió a abrir: su próximo cierre también baja
      if (n.id) idsNuevos[n.id] = 1;
      if (n.isConnected && esHoja(n)) abrirHoja(n);
    });
    sacados.forEach(function (n) {
      if (n.nodeType !== 1 || n.isConnected || (yaBajo && yaBajo.has(n)) || !esHoja(n)) return;
      if (n.id && idsNuevos[n.id]) return;   // se rearmó (sacar y volver a poner): no es un cierre
      cerrarHoja(n);
    });
  }) : null;

  // ---------------------------------------------------------------- CSS y clase
  function pintarClase() { try { document.documentElement.classList.toggle("mov-on", !!modo()); } catch (e) { } }

  // ---------------------------------------------------------------- Perfil › «Movimiento entre pantallas»
  function fila(sw) {
    if (window.__movNo) return null;
    var on = ajusteOn(), ms = LS.get("ema.mov.lento");
    var s = !on ? "No: las pantallas cambian al instante" : reducido() ? "El celu pide menos movimiento: cambian al instante" : esPc() ? "Sí: en la compu, un fundido corto" : ms ? "Sí, con un fundido corto: tu celu tardó " + ms + " ms en dibujar" : "Sí: la pantalla nueva entra de costado";
    return { k: "mov", i: "celu", t: "Movimiento entre pantallas", s: s, der: sw(on) };
  }
  function alternar(on) {
    if (on === undefined) on = !ajusteOn();
    LS.set("ema.mov", on ? "1" : "0");
    if (on) { LS.set("ema.mov.lento", null); LS.set("ema.mov.medido", null); medido = false; }   // volver a prender = se mide de nuevo
    pintarClase(); return on;
  }

  // ---------------------------------------------------------------- arranque
  function arrancar() {
    pintarClase();
    if (moB && document.body) moB.observe(document.body, { childList: true });
    mirarVistas(); actual = vistaVisible(); medirTodo();
  }
  if (document.body) arrancar(); else document.addEventListener("DOMContentLoaded", arrancar);
  window.addEventListener("load", function () { mirarVistas(); if (!actual) actual = vistaVisible(); medirTodo(); });
  window.addEventListener("resize", function () { pintarClase(); });
  try { mm && mm.addListener && mm.addListener(pintarClase); } catch (e) { }
  window.__mov = {
    modo: modo, fila: fila, alternar: alternar, terminar: terminarTodo, animando: animando,
    estado: function () { return { modo: modo(), on: ajusteOn(), lento: LS.get("ema.mov.lento"), medido: LS.get("ema.mov.medido"), animando: animando(), actual: actual && actual.id, hist: hist.slice() }; }
  };
})();
