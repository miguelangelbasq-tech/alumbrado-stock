(function () {
  "use strict";
  // v187 · Revisión de la cuadrilla (pedido de Ángel 25/11/2026: «que los de cuadrilla puedan sacar fotos rapidito y que se
  // suban rápido; y que puedan abrir los planos y las ubicaciones; fijate si hay algún error»).
  //  · Los planos de la obra en la pantalla nueva de la cuadrilla (v142): hasta ahora solo estaban en «Ver lista completa»
  //    (Mis tareas clásica). En «Orden de trabajo» va la lista de planos (la misma de Mis tareas: `planosOtHtml`, que abre el
  //    visor de siempre) y en Modo obra un «📐 Ver plano» (con varios, lleva a la orden). Sin lecturas nuevas: la lista ya
  //    está en memoria (`planosObra`), la imagen se baja recién al abrirla, como siempre.
  //  · El arreglo de «Enviar» con todas las fotos en el mismo minuto está en tiempoCol (etHtml).
  //  · Pantallas que la cuadrilla no ve: cada cambio de su orden (una foto, una marca) redibujaba Planificación y lo de la
  //    oficina (renderRegistros = informe, balance, etapas y Órdenes) aunque estén escondidos (≈ 0,6 s con el celu lento y
  //    muchas obras). Con la cuadrilla (body.inicio-crew) y la pantalla escondida queda pendiente y se dibuja al abrirla.
  //  Apagado con window.__v187No.
  const off = () => !!window.__v187No;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const planos = (id) => { try { return id && typeof window.planosDeObra == "function" ? window.planosDeObra(id) || [] : []; } catch (e) { return []; } };
  function orden(o) {
    if (off() || !o || !o.plazaId || typeof window.planosOtHtml != "function") return "";
    let h = ""; try { h = window.planosOtHtml(o.plazaId, { vacio: true }) || ""; } catch (e) { h = ""; }
    return h ? `<div class="cd-cd cd-pl187">${h}</div>` : "";
  }
  function boton(o) {
    if (off() || !o || !o.plazaId) return "";
    const l = planos(o.plazaId); if (!l.length) return "";
    return l.length === 1
      ? `<button type="button" class="cd-link cd-pl187b" data-plnot="${esc(l[0].id)}">📐 Ver plano</button>`
      : `<button type="button" class="cd-link cd-pl187b" data-pl187="orden">📐 Ver planos (${l.length})</button>`;
  }
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-pl187]"); if (!b || off()) return;
    e.preventDefault(); e.stopPropagation();
    try { window.__cuadrillaDia && window.__cuadrillaDia.ir("orden"); } catch (er) { }
  }, true);
  // ------------------------------------------------------------------ lo escondido, para cuando se abra
  const crew = () => !off() && !!document.body && document.body.classList.contains("inicio-crew");
  const visible = (ids) => ids.some((id) => { const e = document.getElementById(id); return !!e && e.style.display !== "none" && e.offsetParent !== null; });
  const VISTAS = { renderPlanGrid: ["viewPlanificacion"], renderRegistros: ["viewInforme", "viewAvance", "viewParteDiario", "viewRegistro"] };
  const PEND = new Set(), saltos = {};
  function envolver(nombre) {
    const o = window[nombre]; if (typeof o != "function") return false; if (o.__v187) return true;
    const n = function () {
      if (crew() && !visible(VISTAS[nombre])) { PEND.add(nombre); saltos[nombre] = (saltos[nombre] || 0) + 1; return; }
      PEND.delete(nombre); return o.apply(this, arguments);
    };
    window.__heredar && window.__heredar(n, o); n.__v187 = 1; window[nombre] = n; return true;
  }
  const enganchar = () => Object.keys(VISTAS).every(envolver);
  if (!enganchar()) { let i = 0; const t = setInterval(() => { if (enganchar() || ++i > 40) clearInterval(t); }, 500); }
  setInterval(() => {
    if (!PEND.size) return;
    PEND.forEach((nombre) => { if (!crew() || visible(VISTAS[nombre])) { PEND.delete(nombre); try { window[nombre](); } catch (e) { console.warn("[v187]", nombre, e); } } });
  }, 700);
  window.__pl187 = { orden, boton, planos, estado: () => ({ pend: Array.from(PEND), saltos: Object.assign({}, saltos) }) };
})();
