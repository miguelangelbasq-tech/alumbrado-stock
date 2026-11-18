(function () {
  "use strict";
  // v169 · «🔧 Armadas» con su propio subíndice en el Pañol (Ángel 18/11: «eso tiene que tener su propio subíndice, no dentro de
  //  pañol (el catálogo)»). La tarjeta #arCard de la v168 pasa a la subpestaña «armadas» (`#subtabsStock [data-sub=armadas]`);
  //  en Catálogo pañol queda una línea #arLinea «🔧 Luminarias armadas: N listas · Ver». La ficha del producto suma «Ver en
  //  Pañol › Armadas» y el QR ?doc=AR-… abre esa subpestaña detrás del comprobante. Si se entra desde la línea del catálogo,
  //  arriba aparece «‹ Volver al catálogo» (#arVolver) y el «atrás» del celu vuelve al catálogo (capa `armadasCat` de atrasApp).
  //  Quién la ve: lo mismo que la tarjeta de la v168 (quien edita el pañol siempre; los demás, si hay alguna receta).
  //  Apagado con __v169No (y __v168No): todo como la v168.
  const $ = (id) => document.getElementById(id);
  const intentar = (f, d) => { try { return f(); } catch (e) { return d; } };
  const no = () => !!(window.__v169No || window.__v168No);
  const A = () => window.__armadas;
  const n0 = (v) => { const x = parseFloat(v); return isFinite(x) ? x : 0; };
  const f2 = (x) => (typeof fmt == "function" ? fmt(Math.round(x * 100) / 100, Number.isInteger(x) ? 0 : 2) : String(x));
  const S = { desdeCat: false, ve: null };
  function ve() {
    if (no() || !A()) return false;
    return intentar(() => A().recetas(false).length > 0 || A().puedeEditar(), false);
  }
  window.__armTabVe = ve;
  function sub() { return ((document.querySelector("#subtabsStock .subtab.activo") || {}).dataset || {}).sub || ""; }
  function enStock() { const v = $("viewStock"); return !!v && v.style.display !== "none" && getComputedStyle(v).display !== "none"; }
  // en el celu la fila de subpestañas se corre de costado: que se vea la que quedó elegida
  function verTab() { const b = document.querySelector("#subtabsStock .subtab.activo"), st = $("subtabsStock"); if (!b || !st) return; intentar(() => { const br = b.getBoundingClientRect(), sr = st.getBoundingClientRect(); st.scrollLeft = Math.max(0, st.scrollLeft + (br.left - sr.left) - (sr.width - br.width) / 2); }); }
  function ir(op) {
    if (no()) return false;
    S.desdeCat = !!(op && op.desdeCat);
    try { if (!enStock()) window.mostrarVista("stock"); } catch (e) { }
    S.ve = ve();
    if (typeof window.__stockSubIr == "function") window.__stockSubIr("armadas");
    pintar(); verTab();
    try { window.scrollTo({ top: 0 }); } catch (e) { }
    try { window.__atras && window.__atras.sync && window.__atras.sync(); } catch (e) { }
    return true;
  }
  function volver() {
    S.desdeCat = false;
    if (typeof window.__stockSubIr == "function") window.__stockSubIr("inventario");
    pintar(); verTab();
    try { window.__atras && window.__atras.sync && window.__atras.sync(); } catch (e) { }
  }
  function lineaHtml() {
    const R = intentar(() => A().recetas(false), []) || [];
    const n = R.reduce((s, r) => s + intentar(() => (typeof stockActual == "function" ? n0(stockActual(r.codigo)) : 0), 0), 0);
    const tx = R.length ? f2(n) + (n === 1 ? " lista" : " listas") : "todavía no hay recetas";
    return "<div class=\"arl-f\"><span class=\"arl-t\">🔧 Luminarias armadas: <b>" + tx + "</b></span><button type=\"button\" class=\"btn-ghost arl-ver\" data-armtab=\"ir\">Ver</button></div>";
  }
  function pintar() {
    const l = $("arLinea"), v = $("arVolver");
    if (no()) { l && l.classList.add("ar-off"); v && v.classList.add("ar-off"); return; }
    const vv = ve();
    if (S.ve !== vv) { S.ve = vv; intentar(() => window.__pintarSubtabsStock && window.__pintarSubtabsStock()); }
    if (S.desdeCat && (!enStock() || sub() !== "armadas")) S.desdeCat = false;
    if (l) { l.classList.toggle("ar-off", !vv); if (vv) { const h = lineaHtml(); if (l.__h !== h) { l.__h = h; l.innerHTML = h; } } }
    if (v) {
      v.classList.toggle("ar-off", !S.desdeCat);
      if (!v.__h) { v.__h = 1; v.innerHTML = "<button type=\"button\" class=\"link arl-volver\" data-arvolver=\"1\" aria-label=\"Volver al catálogo\">‹ Volver al catálogo</button>"; }
    }
    if (enStock() && sub() === "armadas") intentar(() => A().pintarTarjeta());
  }
  document.addEventListener("click", (e) => {
    if (no()) return;
    const t = e.target && e.target.closest ? e.target : null; if (!t) return;
    const b = t.closest("[data-armtab]");
    if (b) {
      e.preventDefault();
      if (b.dataset.armtab === "ficha") { const m = $("pfModal"); m && m.remove(); }
      ir({ desdeCat: b.dataset.armtab === "ir" });
      return;
    }
    if (t.closest("[data-arvolver]")) { e.preventDefault(); volver(); return; }
    const s = t.closest("#subtabsStock .subtab");
    if (s && S.desdeCat) { S.desdeCat = false; setTimeout(pintar, 0); }
  });
  window.__armTab = { ir, volver, ve, pintar, estado: () => ({ desdeCat: S.desdeCat, ve: S.ve, sub: sub() }) };
  setInterval(() => { if (!document.hidden) pintar(); }, 1500);
  setTimeout(pintar, 200);
})();
